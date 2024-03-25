---
layout: post
title: 马斯克开源的 grok-1 大模型对标 openai chatGPT 源码硬核篇（3）
date: 2024-03-20 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---

# 拓展阅读

[马斯克开源的 grok-1 底层 Transformer 模型论文 《Attention is All You Need》](https://mp.weixin.qq.com/s/bZP2R97GUD1NxV22Tn7eOQ)

[马斯克开源的 grok-1 大模型底层 Transformer 模型到底是个啥？](https://mp.weixin.qq.com/s/jvpovKSitioC7IQ8IWTumg)

[马斯克开源的 grok-1 大模型硬核源码第 1 弹](https://mp.weixin.qq.com/s/nMeisZVQmhVYCRi7YHTKIA)

[马斯克开源的 grok-1 大模型硬核源码第 2 弹](https://mp.weixin.qq.com/s/gdrP9HXRkRf9zrMuzrCB7g)

[马斯克开源的 grok-1 大模型硬核源码第 3 弹](https://mp.weixin.qq.com/s/mpoEnVvrtVBSk4PfUIKmMg)

[马斯克开源的 grok-1 大模型硬核源码第 4 弹](https://mp.weixin.qq.com/s/fNLbaROZXFEfbREuBV1Kpg)

# 前言

网上的大部分内容都是浅尝辄止，本文老马和大家一起简单看一下马斯克这两天开源的 grok 到底有什么内容。

内容过于硬核，建议收藏转发​慢慢消化~

# 代码

## model.py

最开始是一段包的导入。

```python
import functools  # 导入functools库，用于高阶函数的操作
import logging  # 导入logging库，用于日志记录
import re  # 导入re库，用于正则表达式的操作
from dataclasses import dataclass  # 导入dataclass类装饰器，用于创建数据类
from typing import (  # 导入typing库，用于类型提示
    Any,
    Callable,
    Dict,
    List,
    NamedTuple,
    Optional,
    Sequence,
    Tuple,
    Union,
)

import haiku as hk  # 导入haiku库，用于神经网络构建
import jax  # 导入jax库，用于自动微分和加速计算
import jax.experimental.maps  # 导入jax.experimental.maps模块，用于实验性映射
import jax.numpy as jnp  # 导入jax.numpy模块，用于数组操作
from jax import config, tree_util  # 从jax库中导入config和tree_util模块
from jax.experimental.shard_map import shard_map  # 从jax.experimental.shard_map模块导入shard_map函数
from jax.lax import with_sharding_constraint as pjit_sharding_constraint  # 导入with_sharding_constraint函数
from jax.sharding import PartitionSpec  # 导入PartitionSpec类
from jax.sharding import PartitionSpec as P  # 导入PartitionSpec别名P

config.update("jax_spmd_mode", "allow_all")  # 更新jax配置，允许所有SPMD模式

logger = logging.getLogger(__name__)  # 创建或获取一个记录器对象，用于记录程序运行时的信息
rank_logger = logging.getLogger("rank")  # 创建或获取一个记录器对象，用于记录程序运行时的排名信息
```

这段代码导入了一些常用的Python库，并初始化了日志记录器。

其中，`jax`库被配置为允许所有的SPMD模式。

日志记录器`logger`和`rank_logger`用于记录程序执行过程中的信息。


```python
@dataclass
class QuantizedWeight8bit:
    """表示量化的8位权重的数据类。"""

    weight: jnp.array  # 权重数组
    scales: jnp.array  # 缩放因子数组

    @property
    def shape(self):
        """返回权重数组的形状。"""
        return self.weight.shape


tree_util.register_pytree_node(
    QuantizedWeight8bit,
    lambda qw: ([qw.weight, qw.scales], ()),  # 注册PyTree节点的函数，将权重和缩放因子作为子节点
    lambda _, children: QuantizedWeight8bit(children[0], children[1]),  # 从子节点创建QuantizedWeight8bit对象的函数
)
```

该代码定义了一个名为`QuantizedWeight8bit`的数据类，用于表示量化的8位权重。

通过`@dataclass`装饰器，将其定义为一个数据类。该类具有两个属性：`weight`用于存储权重数组，`scales`用于存储缩放因子数组。还定义了一个`shape`属性，用于返回权重数组的形状。

接着，使用`tree_util.register_pytree_node`函数注册了`QuantizedWeight8bit`类作为PyTree节点。

该函数接受两个参数：第一个参数是一个函数，用于从对象中提取子节点，第二个参数是一个函数，用于从子节点创建对象。


```python
# 翻译：老马啸西风
class TrainingState(NamedTuple):
    """训练状态的容器。"""

    params: hk.Params  # 参数


def _match(qs, ks):
    """如果qs中的正则表达式与ks元组中的任何字符串窗口匹配，则返回True。"""
    # 编译正则表达式并强制完全匹配
    qts = tuple(map(lambda x: re.compile(x + "$"), qs))
    for i in range(len(ks) - len(qs) + 1):
        matches = [x.match(y) for x, y in zip(qts, ks[i:])]
        if matches and all(matches):
            return True
    return False


def with_sharding_constraint(x, constraint):
    """如果物理网格为空，则返回x，否则应用约束并返回。"""
    if jax.experimental.maps.thread_resources.env.physical_mesh.empty:
        return x
    else:
        return pjit_sharding_constraint(x, constraint)


def cast_bfloat16(x):
    """如果x的dtype是浮点型，则转换为bfloat16类型，否则保持不变。"""
    if x.dtype.kind == "f":
        return x.astype(jnp.bfloat16)
    else:
        return x


def ffn_size(emb_size, widening_factor):
    """计算FFN（Feed-Forward Network）的大小。

    参数:
        emb_size (int): 嵌入大小。
        widening_factor (float): 扩大因子。

    返回:
        int: 调整后的FFN大小。
    """
    _ffn_size = int(widening_factor * emb_size) * 2 // 3
    _ffn_size = _ffn_size + (8 - _ffn_size) % 8  # 确保是8的倍数
    logger.debug(f"emd_size: {emb_size} adjusted ffn_size: {_ffn_size}")  # 记录调整后的FFN大小
    return _ffn_size
```

这段代码定义了几个函数和一个命名元组。

- `TrainingState`是一个命名元组，用于存储训练状态的参数。
- `_match`函数用于检查正则表达式是否与字符串序列中的任何窗口匹配。
- `with_sharding_constraint`函数根据是否存在物理网格来应用约束。
- `cast_bfloat16`函数用于将浮点数转换为bfloat16类型。
- `ffn_size`函数用于计算调整后的FFN（Feed-Forward Network）大小。


```python
def apply_rules(rules):
    """应用规则函数，根据给定的规则替换路径中的值。

    参数:
        rules (List[Tuple[List[str], Union[PartitionSpec, Any]]]): 规则列表，每个规则是一个元组，
            包含要匹配的路径列表和用于替换的值或PartitionSpec对象。

    返回:
        Callable: 内部函数，用于应用规则到给定的路径和值。
    """
    def _apply_rules(path, value):
        """内部函数，根据规则替换路径中的值。

        参数:
            path: 要替换值的路径。
            value: 未使用。

        返回:
            Any: 替换后的值。
        """
        del value  # 未使用。

        path_list = [str(i.key).split("/") for i in path if isinstance(i, jax.tree_util.DictKey)]
        flattened_path = jax.tree_util.tree_flatten(path_list)[0]

        for rule, replacement in rules:
            if _match(rule, flattened_path):
                if isinstance(replacement, PartitionSpec):
                    if "layer_stack" in flattened_path:
                        replacement = PartitionSpec(None, *replacement)
                rank_logger.debug(f"Apply {replacement} to {flattened_path} with rule {rule}")
                return replacement
        rank_logger.info(f"{flattened_path} no matching found!")
        return None

    return _apply_rules
```

该代码定义了一个函数`apply_rules(rules)`，用于根据给定的规则替换路径中的值。

这个函数返回了一个内部函数`_apply_rules(path, value)`，内部函数接受两个参数：路径和值，根据给定的规则替换路径中的值，并返回替换后的值。

```python
TRANSFORMER_PARTITION_RULES = [
    # attention
    (("multi_head_attention", "(query|key|value)", "w"), P("data", "model")),  # 将多头注意力层的权重分区到data和model维度
    (("multi_head_attention", "(query|key|value)", "b"), P(None)),  # 不分区
    (("multi_head_attention", "linear", "w"), P("model", "data")),  # 将多头注意力层的线性层权重分区到model和data维度
    (("multi_head_attention", "linear", "b"), P(None)),  # 不分区
    # mlp
    ((r"decoder_layer_[0-9]+", "linear", "w"), P("data", "model")),  # 将解码器层线性层权重分区到data和model维度
    ((r"decoder_layer_[0-9]+", "linear", "b"), P(None)),  # 不分区
    ((r"decoder_layer_[0-9]+", "linear_v", "w"), P("data", "model")),  # 将解码器层线性层v权重分区到data和model维度
    ((r"decoder_layer_[0-9]+", "linear_v", "b"), P(None)),  # 不分区
    (
        (r"decoder_layer_[0-9]+", "linear_1", "w"),
        P(
            "model",
            "data",
        ),
    ),  # 将解码器层线性层1权重分区到model和data维度
    ((r"decoder_layer_[0-9]+", "linear_1", "b"), P(None)),  # 不分区
    # layer norms
    ((r"decoder_layer_[0-9]+", "layer_norm", "offset"), P(None)),  # 不分区
    ((r"decoder_layer_[0-9]+", "layer_norm", "scale"), P(None)),  # 不分区
    ((r"decoder_layer_[0-9]+", "layer_norm_1", "offset"), P(None)),  # 不分区
    ((r"decoder_layer_[0-9]+", "layer_norm_1", "scale"), P(None)),  # 不分区
    # rms norms
    ((r"decoder_layer_[0-9]+", "rms_norm", "scale"), P(None)),  # 不分区
    ((r"decoder_layer_[0-9]+", "rms_norm_1", "scale"), P(None)),  # 不分区
    ((r"decoder_layer_[0-9]+", "rms_norm_2", "scale"), P(None)),  # 不分区
    ((r"decoder_layer_[0-9]+", "rms_norm_3", "scale"), P(None)),  # 不分区
    # router
    (("router", "w"), P("data")),  # 将路由器的权重分区到data维度
    # moe mlp
    (("moe", "linear", "w"), P(None, "data", "model")),  # 将多路注意力层线性层权重分区到data和model维度
    (("moe", "linear", "b"), P(None)),  # 不分区
    (("moe", "linear_v", "w"), P(None, "data", "model")),  # 将多路注意力层线性层v权重分区到data和model维度
    (("moe", "linear_v", "b"), P(None)),  # 不分区
    (("moe", "linear_1", "w"), P(None, "model", "data")),  # 将多路注意力层线性层1权重分区到model和data维度
    (("moe", "linear_1", "b"), P(None)),  # 不分区
    # layer norms
    (("moe", "layer_norm", "offset"), P(None)),  # 不分区
    (("moe", "layer_norm", "scale"), P(None)),  # 不分区
    (("moe", "layer_norm_1", "offset"), P(None)),  # 不分区
    (("moe", "layer_norm_1", "scale"), P(None)),  # 不分区
    # rms norms
    (("moe", "rms_norm", "scale"), P(None)),  # 不分区
    (("moe", "rms_norm_1", "scale"), P(None)),  # 不分区
    (("moe", "rms_norm_2", "scale"), P(None)),  # 不分区
    (("moe", "rms_norm_3", "scale"), P(None)),  # 不分区
]

LM_PARTITION_RULES = [
    # Embedding layer.
    (
        ("language_model", "positional_embeddings"),
        P(None, ("data", "model")),
    ),  # 将语言模型的位置嵌入层分区到data和model维度
    (
        ("language_model", "in_out_embed", "embeddings"),
        P(None, ("data", "model")),
    ),  # 将语言模型的输入输出嵌入的嵌入层分区到data和model维度
    # Final RMSNorm.
    (("language_model", "rms_norm"), P(None)),  # 不分区
]
TOP_K = 8  # 常量，用于表示top-k的值
```

这段代码定义了两个分区规则列表`TRANSFORMER_PARTITION_RULES`和`LM_PARTITION_RULES`，以及一个常量`TOP_K`。

分区规则列表包含了一系列规则，每个规则由一个匹配路径的元组和一个用于替换的分区规范组成。这些规则用于在Transformer模型和语言模


```python
# 翻译：老马啸西风
class KVMemory(NamedTuple):
    """表示键值内存的数据类。"""

    k: Optional[jax.Array]  # 键数组
    v: Optional[jax.Array]  # 值数组
    step: Optional[jax.Array]  # 步骤数组


def init_layer_memories(
    batch_size: int,
    sequence_len: int,
    num_kv_heads: int,
    key_size: int,
    num_layers: int,
    step: Optional[jax.Array] = None,
    dtype=jnp.bfloat16,
):
    """初始化层内存函数，返回一个包含多个层内存的列表。

    参数:
        batch_size (int): 批大小。
        sequence_len (int): 序列长度。
        num_kv_heads (int): 键值头数。
        key_size (int): 键大小。
        num_layers (int): 层数。
        step (Optional[jax.Array], optional): 步骤数组，默认为None。
        dtype (type, optional): 数据类型，默认为jnp.bfloat16。

    返回:
        List[KVMemory]: 初始化的层内存列表。
    """
    return [
        KVMemory(
            k=jnp.zeros((batch_size, sequence_len, num_kv_heads, key_size), dtype=dtype),  # 初始化键数组
            v=jnp.zeros((batch_size, sequence_len, num_kv_heads, key_size), dtype=dtype),  # 初始化值数组
            step=step,  # 步骤数组
        )
        for _ in range(num_layers)
    ]


class Memory(NamedTuple):
    """表示内存的数据类。"""

    # Self-attention key/value cache.
    layers: List[KVMemory]  # 层内存列表
```

以上是给定的Python代码的注释。该代码定义了两个数据类`KVMemory`和`Memory`，分别用于表示键值内存和内存。

`init_layer_memories`函数用于初始化多个层内存，并返回一个列表。




```python
import haiku as hk
import jax
import jax.numpy as jnp
from typing import Union, Tuple, Any, Optional

class Router(hk.Module):
    # 定义 Router 类，继承自 Haiku 模块
    def __init__(
        self,
        num_selected_experts: int,
        data_axis: Union[str, Tuple[str, ...]] = "data",
        model_axis: Union[str, Tuple[str, ...]] = "model",
        shard_activations: bool = False,
        mesh: Any = None,
        name: str = "router",
    ):
        super().__init__(name)
        # 初始化模块参数
        self.shard_activations = shard_activations
        self.data_axis = data_axis
        self.model_axis = model_axis
        self.mesh = mesh
        self.num_selected_experts = num_selected_experts

    # 计算路由概率的公共接口
    def compute_routing_prob(
        self, inputs: jax.Array, padding_mask: Optional[jax.Array], num_experts: int
    ):
        return self._compute_routing_prob(inputs, padding_mask, num_experts)

    # 实际计算路由概率的函数，使用 @hk.transparent 修饰表示该函数在 Haiku 中是透明的
    @hk.transparent
    def _compute_routing_prob(
        self,
        inputs: jax.Array,
        padding_mask: Optional[jax.Array],
        num_experts: int,
    ):
        # 使用 fp32 进行计算
        inputs = jax.lax.convert_element_type(inputs, jnp.float32)

        # 计算路由权重，得到路由 logits
        routing_logits = self._router_weights(inputs, num_experts, sharding=P("data"))
        assert routing_logits.dtype == jnp.float32
        # 对 logits 进行 softmax 处理，得到路由概率
        routing_probs = jax.nn.softmax(routing_logits)

        # 若存在填充掩码，则将其应用到路由概率上
        if padding_mask is not None:
            routing_probs *= padding_mask

        # 返回计算得到的路由概率和 logits，以及额外的信息 0
        return routing_probs, routing_logits, 0

    # 计算路由权重的函数
    @hk.transparent
    def _router_weights(
        self,
        x: jax.Array,
        num_experts: int,
        sharding: Optional[P] = None,
    ):
        # 获取输入的数据类型
        fprop_dtype = x.dtype
        if not x.shape:
            raise ValueError("Input must not be scalar.")

        # 获取输入数据的维度
        input_size = self.input_size = x.shape[-1]
        # 获取路由权重参数，使用 Constant 初始化为 0
        w = hk.get_parameter(
            "w", [input_size, num_experts], jnp.float32, init=hk.initializers.Constant(0)
        )
        # 若存在 sharding，则应用到权重上
        if sharding:
            w = with_sharding_constraint(w, sharding)

        # 计算路由权重
        out = jnp.dot(x, w.astype(fprop_dtype))
        return out
```


这段代码定义了一个名为 Router 的 Haiku 模块，用于计算路由概率。主要包括以下几个部分：

`__init__` 方法初始化了 Router 类的实例变量，包括路由激活、数据轴、模型轴、网格等参数。

compute_routing_prob 方法是对外的路由概率计算接口，调用了内部的 _compute_routing_prob 方法。

_compute_routing_prob 方法是内部使用的计算路由概率的函数。

首先将输入转换为 float32 类型，然后通过 _router_weights 方法计算路由概率，并使用 softmax 函数将结果转换为概率分布。如果有填充掩码，则将其应用于计算结果。

_router_weights 方法计算路由权重。首先获取权重参数 w，然后通过点积计算路由权重。

整体流程是，通过输入数据和路由权重参数计算路由概率，并返回路由概率和相应的路由权重。



以下是你提供的Python代码的每一行都带有中文注释的版本：

```python
import haiku as hk  # 导入Haiku库

class MoELayer(hk.Module):
    def __init__(
        self,
        num_experts: int,  # 专家数量
        layer_fn: Callable,  # 层函数
        router: Router,  # 路由器
        mesh: Any = None,  # 网格
        shard_activations: bool = False,  # 分片激活
        data_axis: Union[str, Tuple[str, ...]] = "data",  # 数据轴
        model_axis: Union[str, Tuple[str, ...]] = "model",  # 模型轴
        name: Optional[str] = "moe",  # 名称
    ):
        super().__init__(name)  # 初始化父类
        self.num_experts = num_experts  # 专家数量
        self.layer_fn = layer_fn  # 层函数
        self.router = router  # 路由器
        self.mesh = mesh  # 网格
        self.shard_activations = shard_activations  # 分片激活
        self.data_axis = data_axis  # 数据轴
        self.model_axis = model_axis  # 模型轴

    @hk.transparent
    def _inference_call(self, inputs: jax.Array, padding_mask: Optional[jax.Array] = None):
        routing_probs, _, _ = self.router.compute_routing_prob(
            inputs, padding_mask, self.num_experts
        )  # 计算路由概率
        expert_gate, expert_index = jax.lax.top_k(routing_probs, k=self.router.num_selected_experts)  # 计算专家门控和专家索引
        tmp = jnp.reshape(inputs, (inputs.shape[0] * inputs.shape[1], inputs.shape[2]))  # 临时变量
        broad_inputs = jnp.tile(tmp[:, jnp.newaxis, :], (1, self.router.num_selected_experts, 1))  # 广播输入
        broad_inputs = jnp.reshape(
            broad_inputs, (broad_inputs.shape[0] * broad_inputs.shape[1], broad_inputs.shape[2])
        )  # 重新整形广播的输入
        init_fn, _ = hk.transform(self.layer_fn)  # 初始化函数
        vmapped_init_fn = jax.vmap(init_fn, in_axes=0, out_axes=0)  # 映射初始化函数
        lifted_init_fn = hk.experimental.transparent_lift(vmapped_init_fn)  # 透明提升初始化函数
        # 获取 DenseBlock 的 vmapped 参数。
        params = lifted_init_fn(
            jax.random.split(jax.random.PRNGKey(1), self.num_experts),
            jnp.zeros((self.num_experts, 1, 1, inputs.shape[-1])),
        )  # 获取参数

        # Index 和 prob 的形状为 [m, 2]，表示哪个令牌分配给哪个专家。
        # b: 专家数量
        # m: 令牌或序列维度
        # k: 输入嵌入维度
        # n: 输出嵌入维度
        # e: 每个令牌选择的专家数量
        @functools.partial(
            shard_map,
            mesh=self.mesh,
            in_specs=(
                P(self.data_axis, None),
                P(None, None, self.model_axis),
                P(None, None, self.model_axis),
                P(None),
                P(None),
            ),
            out_specs=P(self.data_axis, self.model_axis),
            check_rep=False,
        )
        def moe_slow_matmul1(input, weight, scales, index, prob):
            weight = weight * scales
            one_hot_indices = jax.nn.one_hot(index.reshape(-1), 8, axis=0)  # 独热编码索引
            all_expert_output = jnp.einsum("mk,bkn->bmn", input, weight)  # 所有专家的输出
            output = jnp.einsum("bm,bmn->mn", one_hot_indices, all_expert_output)  # 输出
            return output

        @functools.partial(
            shard_map,
            mesh=self.mesh,
            in_specs=(
                P(self.data_axis, self.model_axis),
                P(None, self.model_axis, None),
                P(None, self.model_axis, None),
                P(None),
                P(None),
            ),
            out_specs=P(self.data_axis, None),
            check_rep=False,
        )
        def moe_slow_matmul2(input, weight, scales, index, prob):
            weight = weight * scales
            one_hot_indices = jax.nn.one_hot(index.reshape(-1), 8, axis=0)  # 独热编码索引
            all_expert_output = jnp.einsum("mk,bkn->bmn", input, weight)  # 所有专家的输出
            output = jnp.einsum("bm,bmn->mn", one_hot_indices, all_expert_output)  # 输出
            return jax.lax.psum(output, axis_name="model")  # 累加求和

        if hasattr(params["linear"]["w"], "scales"):
            x = moe_slow_matmul1(
                broad_inputs,
                params["linear_v"]["w"].weight,
                params["linear_v"]["w"].scales,
                expert_index,
                expert_gate,
            )  # 计算矩阵乘积1
            y = moe_slow_matmul1(
                broad_inputs,
                params["linear"]["w"].weight,
                params["linear"]["w"].scales,
                expert_index,
                expert_gate,
            )  # 计算矩阵乘积2
            y = jax.nn.gelu(y)  # GELU激活
            out = moe_slow_matmul2(
                x * y,
                params["linear_1"]["w"].weight,
                params["linear_1"]["w"].scales,
                expert_index,
                expert_gate,
            )  # 计算矩阵乘积3
            out = jnp.reshape(
                out,
                [
                    inputs.shape[0],
                    inputs.shape[1],
                    self.router.num_selected_experts,
                    out.shape[-1],
                ],
            )  # 重新整形输出
            out = expert_gate[:, :, :, None].astype(jnp.bfloat16) * out  # 门控输出
            out = jnp.sum(out, axis=2)  # 求和
            out = out.astype(jnp.bfloat16)  # 转换类型
        else:
            # 这只是为了构建一个有效的 init_fn，此处返回输入。
            return inputs  # 返回输入
        return out  # 返回输出

    def __call__(self, inputs: jax.Array, padding_mask: jax.Array):
        return self._inference_call(inputs)  # 调用推断函数
```

这段代码定义了一个名为 `MoELayer` 的类，它是一个 Haiku 模块。

该类用于实现一个 Mixture of Experts（MoE）层。其中，`_inference_call` 方法实现了推断过程，包括路由、专家选择、矩阵乘积等操作。

这个类的 `__call__` 方法用于调用推断函数 `_inference_call`。

整体流程是：根据输入数据计算路由概率，选择专家，计算并应用专家的权重和激活函数，最后根据路由结果计算最终输出。

```python
class MHAOutput(NamedTuple):
    """Outputs of the multi-head attention operation."""

    embeddings: jax.Array
    memory: Any


class DecoderOutput(NamedTuple):
    embeddings: jax.Array
    memory: Any


class TransformerOutput(NamedTuple):
    embeddings: jax.Array
    memory: Any
```

这段代码定义了三个命名元组，它们分别是 `MHAOutput`、`DecoderOutput` 和 `TransformerOutput`。

这些命名元组用于表示Transformer模型中的不同输出类型。

- `MHAOutput` 表示多头注意力操作的输出，包括嵌入（embeddings）和记忆（memory）。
- `DecoderOutput` 表示解码器的输出，也包括嵌入和记忆。
- `TransformerOutput` 表示整个Transformer模型的输出，同样包括嵌入和记忆。

这些命名元组提供了一种清晰的方式来组织和传递多个相关的输出。



```python
from dataclasses import dataclass
from typing import Optional, Union, Tuple

# 使用 dataclass 装饰器定义一个名为 TransformerConfig 的数据类
@dataclass
class TransformerConfig:
    emb_size: int  # 嵌入大小
    key_size: int  # 键大小
    num_q_heads: int  # 查询头数
    num_kv_heads: int  # 键值头数
    num_layers: int  # 层数
    vocab_size: int = 128 * 1024  # 词汇表大小，默认为 128 * 1024
    widening_factor: float = 4.0  # 扩展因子，默认为 4.0

    attn_output_multiplier: float = 1.0  # 注意力输出倍增器，默认为 1.0

    name: Optional[str] = None  # 名称，可选，默认为 None

    num_experts: int = -1  # 专家数量，默认为 -1
    capacity_factor: float = 1.0  # 容量因子，默认为 1.0
    num_selected_experts: int = 1  # 选择的专家数量，默认为 1

    init_scale: float = 1.0  # 初始化比例，默认为 1.0
    shard_activations: bool = False  # 是否分片激活，默认为 False

    # 用于激活分片。
    data_axis: Union[str, Tuple[str, ...]] = "data"  # 数据轴，默认为 "data"
    model_axis: Union[str, Tuple[str, ...]] = "model"  # 模型轴，默认为 "model"

    def __post_init__(self):
        # 如果 data_axis 是列表，则将其转换为元组
        if isinstance(self.data_axis, list):
            self.data_axis = tuple(self.data_axis)
        # 如果 model_axis 是列表，则将其转换为元组
        if isinstance(self.model_axis, list):
            self.model_axis = tuple(self.model_axis)

    # 返回分区规则
    def partition_rules(self):
        return TRANSFORMER_PARTITION_RULES

    # 创建 Transformer 实例
    def make(self, mesh=None) -> "Transformer":
        # 如果 data_axis 是列表，则转换为元组，否则保持不变
        data_axis = tuple(self.data_axis) if isinstance(self.data_axis, list) else self.data_axis
        # 如果 model_axis 是列表，则转换为元组，否则保持不变
        model_axis = (
            tuple(self.model_axis) if isinstance(self.model_axis, list) else self.model_axis
        )

        return Transformer(
            num_q_heads=self.num_q_heads,
            num_kv_heads=self.num_kv_heads,
            widening_factor=self.widening_factor,
            key_size=self.key_size,
            init_scale=self.init_scale,
            mesh=mesh,
            attn_output_multiplier=self.attn_output_multiplier,
            shard_activations=self.shard_activations,
            num_layers=self.num_layers,
            num_experts=self.num_experts,
            num_selected_experts=self.num_selected_experts,
            data_axis=data_axis,
            model_axis=model_axis,
        )

    # 获取内存分片
    def get_memory_sharding(self):
        return Memory(
            layers=[
                KVMemory(
                    k=P(self.data_axis, self.model_axis),
                    v=P(self.data_axis, self.model_axis),
                    step=P(self.data_axis),
                )
                for _ in range(self.num_layers)
            ],
        )
```

这段代码定义了一个名为 `TransformerConfig` 的数据类，用于配置 Transformer 模型的参数。

该类包含了各种 Transformer 模型的参数设置，例如嵌入大小、头数、层数等。

其中还包含了一些默认值和方法，如 `partition_rules` 返回分区规则，`make` 方法创建一个 Transformer 实例，`get_memory_sharding` 方法获取内存分片。



```python
def hk_rms_norm(
    x: jax.Array,
    fixed_scale=False,
    sharding=P(None),
) -> jax.Array:
    """对输入张量 x 应用独特的 RMS 标准化，使用默认设置。"""
    ln = RMSNorm(axis=-1, create_scale=not fixed_scale, sharding=sharding)
    return ln(x)


def make_attention_mask(
    query_input: jax.Array,
    key_input: jax.Array,
    pairwise_fn: Callable[..., Any] = jnp.multiply,
    dtype: Any = jnp.bfloat16,
):
    """用于生成注意力权重的掩码辅助函数。

    对于 1D 输入（即 `[batch..., len_q]`，`[batch..., len_kv]`），注意力权重将是 `[batch..., heads, len_q, len_kv]`，
    此函数将产生 `[batch..., 1, len_q, len_kv]`。

    Args:
      query_input: 查询长度为 batch 的扁平输入
      key_input: 键长度为 batch 的扁平输入
      pairwise_fn: 广播元素比较函数
      dtype: 掩码返回数据类型

    Returns:
      用于 1D 注意力的形状为 `[batch..., 1, len_q, len_kv]` 的掩码。
    """
    mask = pairwise_fn(jnp.expand_dims(query_input, axis=-1), jnp.expand_dims(key_input, axis=-2))
    mask = jnp.expand_dims(mask, axis=-3)
    return mask.astype(dtype)
```

这段代码包含两个函数：

1. `hk_rms_norm`：该函数对输入张量 `x` 应用独特的 RMS 标准化，使用默认设置。它返回经过标准化处理的张量。

2. `make_attention_mask`：这是一个用于生成注意力权重的掩码辅助函数。对于 1D 输入，它产生一个掩码张量，用于在注意力计算中掩盖不相关的信息。


```python
class Linear(hk.Linear):
    def __init__(
        self,
        output_size: int,  # 输出大小
        with_bias: bool = True,  # 是否包含偏置，默认为 True
        sharding: Optional[P] = None,  # 分片设置，默认为 None
        mesh: Any = None,  # 网格设置，默认为 None
        name: Optional[str] = None,  # 名称，默认为 None
        shard_axis: int = 0,  # 分片轴设置，默认为 0
    ):
        super().__init__(
            output_size=output_size,  # 输出大小
            with_bias=with_bias,  # 是否包含偏置
            name=name,  # 名称
        )
        self.sharding = sharding  # 分片设置
        self.mesh = mesh  # 网格设置
        self.shard_axis = shard_axis  # 分片轴设置

    def __call__(
        self,
        inputs: jax.Array,  # 输入张量
    ) -> jax.Array:
        """Computes a linear transform of the input."""
        
        fprop_dtype = inputs.dtype  # 前向传播数据类型
        if not inputs.shape:
            raise ValueError("Input must not be scalar.")  # 输入不应为标量

        input_size = self.input_size = inputs.shape[-1]  # 输入大小
        output_size = self.output_size  # 输出大小

        # 获取权重参数
        w = hk.get_parameter(
            "w", [input_size, output_size], jnp.float32, init=hk.initializers.Constant(0)
        )

        # 如果权重具有 'scales' 属性，则对其进行处理
        if hasattr(w, "scales"):
            shape = inputs.shape
            inputs = jnp.reshape(inputs, (-1, shape[-1]))

            @functools.partial(
                shard_map,
                mesh=self.mesh,
                in_specs=(self.sharding, self.sharding),
                out_specs=self.sharding,
                check_rep=False,
            )
            def mul(w, s):
                return w.astype(s.dtype) * s

            w = mul(w.weight, w.scales)

        # 计算线性变换
        out = jnp.dot(inputs, w.astype(fprop_dtype))
        
        # 如果包含偏置，则添加偏置参数
        if self.with_bias:
            # 获取偏置参数
            b = hk.get_parameter(
                "b", [self.output_size], jnp.float32, init=hk.initializers.Constant(0)
            )
            b = jnp.broadcast_to(b, out.shape)
            out = out + b.astype(fprop_dtype)

        return out
```

这段代码定义了一个自定义的 `Linear` 类，用于实现线性变换操作。其中各个变量的解释如下：

- `output_size`: 输出大小，表示线性变换后的张量的输出维度。
- `with_bias`: 是否包含偏置，一个布尔值，表示是否在线性变换中加入偏置项，默认为 True。
- `sharding`: 分片设置，用于分布式计算中的数据分片，是一个可选的参数，默认为 None。
- `mesh`: 网格设置，用于分布式计算中的设备网格，是一个任意类型的参数，默认为 None。
- `name`: 名称，表示该线性变换操作的名称，是一个可选的字符串，默认为 None。
- `shard_axis`: 分片轴设置，用于指定在哪个轴上进行数据分片，默认为 0。

该类包含一个 `__call__` 方法，用于实现线性变换操作。函数中的各个变量的含义解释如下：

- `inputs`: 输入张量，即待进行线性变换的张量。
- `fprop_dtype`: 前向传播数据类型，表示输入张量的数据类型。
- `w`: 权重参数，用于进行线性变换的权重矩阵。
- `b`: 偏置参数，用于线性变换中的偏置项。
- `out`: 输出张量，表示线性变换后得到的张量。

# 参考资料


* any list
{:toc}
