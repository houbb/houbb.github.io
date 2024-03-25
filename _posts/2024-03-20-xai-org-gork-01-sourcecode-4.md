---
layout: post
title: 马斯克开源的 grok-1 大模型对标 openai chatGPT 源码硬核第四弹
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

这个类实在太大，看的出来，python 直接一个大类解决一切难题。

所以做了点拆分。

## model.py

```python
class RMSNorm(hk.RMSNorm):
    def __init__(
        self,
        axis: Union[int, Sequence[int], slice],  # 指定标准化的轴
        eps: float = 1e-5,  # epsilon 参数，默认为 1e-5
        name: Optional[str] = None,  # 名称，默认为 None
        create_scale: bool = True,  # 是否创建缩放参数，默认为 True
        sharding: Optional[P] = None,  # 分片设置，默认为 None
    ):
        super().__init__(axis, eps, create_scale=create_scale, name=name)
        self.sharding = sharding  # 分片设置

    def __call__(self, inputs: jax.Array):
        fprop_dtype = inputs.dtype  # 前向传播数据类型
        param_shape = (inputs.shape[-1],)  # 参数形状
        if self.create_scale:
            # 获取缩放参数
            scale = hk.get_parameter(
                "scale",
                param_shape,
                dtype=jnp.float32,
                init=hk.initializers.Constant(0),
            )
            if self.sharding:
                scale = with_sharding_constraint(scale, self.sharding)
            scale = jnp.broadcast_to(scale.astype(jnp.float32), inputs.shape)
        else:
            scale = 1.0  # 若不创建缩放参数，则设为 1.0
        inputs = inputs.astype(jnp.float32)  # 将输入张量转换为 float32 类型
        scale = scale.astype(jnp.float32)  # 将缩放参数转换为 float32 类型
        mean_squared = jnp.mean(jnp.square(inputs), axis=[-1], keepdims=True)  # 计算输入的平方的均值
        mean_squared = jnp.broadcast_to(mean_squared, inputs.shape)  # 广播均方值

        normed_inputs = inputs * jax.lax.rsqrt(mean_squared + self.eps)  # 根据 RMS 标准化输入

        outputs = scale * normed_inputs  # 缩放标准化后的输入

        return outputs.astype(fprop_dtype)  # 返回前向传播数据类型的输出
```

这段代码定义了一个自定义的 `RMSNorm` 类，用于实现 RMS 标准化操作。

其中各个变量的含义解释如下：

- `axis`: 指定标准化的轴，可以是一个整数、一个整数序列或一个切片。
- `eps`: epsilon 参数，用于数值稳定性，默认值为 1e-5。
- `name`: 名称，表示该 RMS 标准化操作的名称，是一个可选的字符串，默认为 None。
- `create_scale`: 是否创建缩放参数，一个布尔值，表示是否在标准化过程中创建缩放参数，默认为 True。
- `sharding`: 分片设置，用于分布式计算中的数据分片，是一个可选的参数，默认为 None。

该类包含一个 `__call__` 方法，用于实现 RMS 标准化操作。函数中的各个变量的含义解释如下：

- `inputs`: 输入张量，即待进行 RMS 标准化的张量。
- `fprop_dtype`: 前向传播数据类型，表示输入张量的数据类型。
- `param_shape`: 参数形状，用于创建缩放参数。
- `scale`: 缩放参数，用于对标准化后的输入进行缩放。
- `mean_squared`: 输入的平方的均值。
- `normed_inputs`: 根据 RMS 标准化后的输入。
- `outputs`: 输出张量，表示经过 RMS 标准化后得到的张量。


```python
def rotate_half(
    x: jax.Array,
) -> jax.Array:
    """获取每个特征的旋转对应项"""
    x1, x2 = jnp.split(x, 2, axis=-1)  # 将输入张量沿最后一个轴分割为两部分
    return jnp.concatenate((-x2, x1), axis=-1)  # 将分割后的张量旋转180度后再连接起来
```

这段代码定义了一个函数 `rotate_half`，用于获取输入张量中每个特征的旋转对应项。函数中的各个变量的含义解释如下：

- `x`: 输入张量，即待进行处理的张量。
- `x1`: 输入张量分割后的第一部分。
- `x2`: 输入张量分割后的第二部分。

函数的实现过程为：将输入张量沿着最后一个轴分割为两部分，然后将第一部分与第二部分交换位置（旋转180度），最后将交换位置后的两部分连接起来。


```python
# 翻译：老马啸西风
class RotaryEmbedding(hk.Module):
    """将旋转嵌入（RoPE）应用于输入序列张量，
    如 https://arxiv.org/abs/2104.09864 中所述。

    Attributes:
        dim (int): 特征向量的维度
        base_exponent (int): 计算嵌入时的基底指数
    """

    def __init__(
        self,
        dim: int,
        name: Optional[str] = None,
        base_exponent: int = 10000,
    ):
        super().__init__(name)
        self.dim = dim  # 特征向量的维度
        self.base_exponent = base_exponent  # 计算嵌入时的基底指数
        assert self.dim % 2 == 0  # 确保特征向量的维度是偶数

    def __call__(
        self,
        x: jax.Array,
        seq_dim: int,
        offset: jax.Array,
        const_position: Optional[int] = None,
        t: Optional[jax.Array] = None,
    ) -> jax.Array:
        fprop_dtype = x.dtype  # 前向传播数据类型
        # 计算每个维度的频率
        exponents = jnp.arange(0, self.dim, 2, dtype=jnp.float32)
        inv_freq = jnp.asarray(
            1.0 / (self.base_exponent ** (exponents / self.dim)), dtype=jnp.float32
        )

        if jnp.shape(offset) == ():
            # 偏移量可以是标量，也可以是每个批次元素的一个偏移量。
            offset = jnp.expand_dims(offset, 0)

        # 计算每个元素的相位（传递给 sin 和 cos 函数）
        if const_position:
            t = const_position * jnp.ones(
                (
                    1,
                    x.shape[seq_dim],
                ),
                dtype=jnp.float32,
            )
        elif t is None:
            t = jnp.arange(x.shape[seq_dim], dtype=jnp.float32) + jnp.expand_dims(offset, -1)
        phase = jnp.einsum("bi,j->bij", t, inv_freq)
        phase = jnp.tile(phase, reps=(1, 2))[:, :, None, :]

        x = x * jnp.cos(phase) + rotate_half(x) * jnp.sin(phase)  # 应用 RoPE 到输入张量
        x = x.astype(fprop_dtype)  # 将输出张量转换为前向传播数据类型

        return x
```

这段代码定义了一个 `RotaryEmbedding` 类，用于在输入序列张量上应用旋转嵌入（RoPE）。

该类包含以下属性：

- `dim`: 特征向量的维度。
- `base_exponent`: 计算嵌入时的基底指数。

该类的 `__call__` 方法实现了旋转嵌入操作。函数中的各个变量的含义解释如下：

- `x`: 输入张量，即待进行旋转嵌入的张量。
- `seq_dim`: 序列的维度。
- `offset`: 偏移量，用于计算相位。
- `const_position`: 常数位置，表示固定的位置信息。
- `t`: 时间步信息。
- `fprop_dtype`: 前向传播数据类型，表示输入张量的数据类型。
- `exponents`: 每个维度的频率指数。
- `inv_freq`: 每个维度的频率的倒数。
- `phase`: 每个元素的相位。
- `x`: 经过 RoPE 处理后的输入张量。


```python
        0, f"query_heads {h} must be a multiple of kv_heads {kv_h}"

        query_heads = jnp.reshape(query_heads, (b, t, kv_h, h // kv_h, d))
        query_heads = with_sharding_constraint(
            query_heads, P(self.data_axis, None, "model", None, None)
        )

        # 计算注意力权重
        # 注意力 softmax 始终以 fp32 进行
        attn_logits = jnp.einsum("...thHd,...Thd->...hHtT", query_heads, key_heads).astype(
            jnp.float32
        )
        attn_logits *= self.attn_output_multiplier
        max_attn_val = jnp.array(30.0, dtype=attn_logits.dtype)
        attn_logits = max_attn_val * jnp.tanh(attn_logits / max_attn_val)

        mask = mask[:, :, None, :, :]

        if mask is not None:
            if mask.ndim != attn_logits.ndim:
                raise ValueError(
                    f"Mask dimensionality {mask.ndim} must match logits dimensionality "
                    f"{attn_logits.ndim} for {mask.shape}/{attn_logits.shape}."
                )
            attn_logits = jnp.where(mask, attn_logits, -1e30)
        attn_weights = jax.nn.softmax(attn_logits).astype(query.dtype)  # [H, T', T]

        # 通过注意力加权值值，并展平头向量
        attn = jnp.einsum("...hHtT,...Thd->...thHd", attn_weights, value_heads)
        attn = with_sharding_constraint(attn, P(self.data_axis, None, "model", None, None))
        leading_dims = attn.shape[:2]
        attn = jnp.reshape(attn, (*leading_dims, -1))  # [T', H*V]
        attn = with_sharding_constraint(attn, P(self.data_axis, None, "model"))
        # 应用另一个投影以获得最终嵌入
        final_projection = Linear(
            self.model_size,
            with_bias=False,
            sharding=P("model", "data"),
            mesh=mesh,
        )
        return MHAOutput(final_projection(attn), new_memory)

    @hk.transparent
    def _linear_projection(
        self,
        x: jax.Array,
        head_size: int,
        num_heads: int,
        sharding: Optional[P] = None,
        name: Optional[str] = None,
        mesh: Any = None,
    ) -> jax.Array:
        y = Linear(
            num_heads * head_size,
            with_bias=False,
            name=name,
            sharding=sharding,
            mesh=mesh,
        )(x)
        *leading_dims, _ = x.shape
        return y.reshape((*leading_dims, num_heads, head_size))
```

在 `__call__` 方法中，计算了多头注意力的输出。主要步骤如下：

1. 使用线性投影函数 `projection` 对查询、键和值进行投影得到多头形式的向量。
2. 若存在记忆，则对键和查询头应用旋转嵌入，并更新记忆。
3. 计算注意力权重，通过加权值值，并展平头向量。
4. 应用另一个线性投影以获得最终的输出。



```python
# 翻译：老马啸西风
from dataclasses import dataclass  # 导入 dataclass 模块
from typing import Any, Tuple, Union, Optional  # 导入必要的类型提示

import haiku as hk  # 导入 Haiku 库
import jax  # 导入 JAX 库

@dataclass
class MHABlock(hk.Module):
    """一个 MHA 块"""

    num_q_heads: int  # 查询头的数量
    num_kv_heads: int  # 键值头的数量
    key_size: int  # 键的大小
    attn_output_multiplier: float = 1.0  # 注意力输出乘数，默认为 1.0
    mesh: Any = None  # 网格对象，默认为 None
    data_axis: Union[str, Tuple[str, ...]] = "data"  # 数据轴，默认为 "data"
    model_axis: Union[str, Tuple[str, ...]] = "model"  # 模型轴，默认为 "model"

    @hk.transparent
    def __call__(
        self,
        inputs: jax.Array,  # 输入数据，形状为 [B, T, D]
        mask: jax.Array,  # 掩码，形状为 [B, 1, T, T] 或 [B, 1, 1, T] 或 [B, 1, 1, 1]
        layer_memory: Optional[KVMemory],  # 层内存，可选的键值记忆
    ) -> MHAOutput:
        _, _, model_size = inputs.shape  # 获取输入的形状信息
        assert mask.ndim == 4, f"shape: {mask.shape}"  # 断言掩码的维度为 4
        assert mask.shape[2] in {1, inputs.shape[1]}, str(mask.shape)  # 断言掩码的第三个维度为 1 或 输入数据的长度
        assert mask.shape[3] in {1, inputs.shape[1]}, str(mask.shape)  # 断言掩码的第四个维度为 1 或 输入数据的长度
        side_input = inputs  # 侧输入等于输入数据

        def attn_block(query, key, value, mask, memory) -> MHAOutput:
            return MultiHeadAttention(
                num_q_heads=self.num_q_heads,  # 查询头的数量
                num_kv_heads=self.num_kv_heads,  # 键值头的数量
                key_size=self.key_size,  # 键的大小
                model_size=model_size,  # 模型大小
                data_axis=self.data_axis,  # 数据轴
                model_axis=self.model_axis,  # 模型轴
                attn_output_multiplier=self.attn_output_multiplier,  # 注意力输出乘数
            )(
                query,
                key,
                value,
                mask,
                memory,
                mesh=self.mesh,  # 网格对象
            )

        attn_output = attn_block(inputs, side_input, side_input, mask, layer_memory)  # 获取注意力块的输出
        h_attn = attn_output.embeddings  # 获取注意力的嵌入

        return attn_output._replace(embeddings=h_attn)  # 替换并返回注意力输出的嵌入
```

这段代码定义了一个 MHA 块，其中包含了多头自注意力机制的实现。

具体流程如下：

1. 定义了一个名为 `MHABlock` 的类，用于实现 MHA 块。
2. 类中包含了必要的参数，如查询头的数量、键值头的数量、键的大小等。
3. 定义了 `__call__` 方法，用于调用 MHA 块。该方法接受输入数据、掩码和层内存，并返回 MHA 输出。
4. 在 `__call__` 方法中，首先对输入数据和掩码进行了一些断言，确保其形状符合预期。
5. 然后定义了一个内部函数 `attn_block`，用于构建多头注意力层，并传入相应的参数。
6. 调用 `attn_block` 函数获取注意力块的输出，并提取注意力的嵌入。
7. 最后将注意力输出的嵌入替换到原始的注意力输出中，并返回结果。

总体来说，该代码实现了一个 MHA 块，用于处理序列数据并提取其中的注意力信息。



```python
from dataclasses import dataclass  # 导入 dataclass 模块
from typing import Any  # 导入必要的类型提示

import haiku as hk  # 导入 Haiku 库
import jax  # 导入 JAX 库

@dataclass
class DenseBlock(hk.Module):
    num_q_heads: int  # 查询头的数量
    num_kv_heads: int  # 键值头的数量
    key_size: int  # 键的大小
    widening_factor: float = 4.0  # 扩展因子，默认为 4.0
    sharding_constraint: bool = False  # 分片约束，默认为 False
    mesh: Any = None  # 网格对象，默认为 None

    @hk.transparent
    def __call__(
        self,
        inputs: jax.Array,  # 输入数据，形状为 [B, T, D]
    ) -> jax.Array:  # 输出数据，形状为 [B, T, D]
        _, _, model_size = inputs.shape  # 获取输入的形状信息
        h_v = Linear(  # 构建线性层，用于处理输入数据
            ffn_size(
                model_size,
                self.widening_factor,
            ),
            with_bias=False,
            mesh=self.mesh,
            sharding=P("data", "model"),  # 分片设置
            name="linear_v",
        )(inputs)  # 输入数据
        h_w1 = jax.nn.gelu(  # 使用 GELU 激活函数
            Linear(
                ffn_size(
                    model_size,
                    self.widening_factor,
                ),
                with_bias=False,
                mesh=self.mesh,
                sharding=P("data", "model"),  # 分片设置
            )(inputs)  # 输入数据
        )
        h_dense = Linear(  # 构建线性层，用于处理输入数据的乘积
            model_size,
            with_bias=False,
            sharding=P("model", "data"),  # 分片设置
            mesh=self.mesh,
            shard_axis=1,
        )(h_w1 * h_v)  # 输入数据的乘积

        return h_dense  # 返回处理后的数据
```

这段代码定义了一个密集块（Dense Block），用于在 Transformer 架构中进行密集连接。具体流程如下：
1. 定义了一个名为 `DenseBlock` 的类，用于实现密集块。
2. 类中包含了必要的参数，如查询头的数量、键值头的数量、键的大小等。
3. 定义了 `__call__` 方法，用于调用密集块。该方法接受输入数据，并返回处理后的数据。
4. 在 `__call__` 方法中，首先对输入数据进行了一些处理，获取其形状信息。
5. 然后构建了两个线性层 `h_v` 和 `h_w1`，分别处理输入数据，并使用 GELU 激活函数。
6. 将两个线性层的输出相乘，并传入另一个线性层 `h_dense` 中进行处理。
7. 最后返回处理后的数据。

总体来说，该代码实现了一个密集块，用于在 Transformer 中进行密集连接操作，以增强模型的表达能力。



```python
from dataclasses import dataclass  # 导入 dataclass 模块
from typing import Any, Tuple, Union, Optional  # 导入必要的类型提示

import haiku as hk  # 导入 Haiku 库
import jax  # 导入 JAX 库

@dataclass
class DecoderLayer(hk.Module):
    """一个 Transformer 堆叠层"""

    num_q_heads: int  # 查询头的数量
    num_kv_heads: int  # 键值头的数量
    key_size: int  # 键的大小
    num_layers: int  # 层数
    num_experts: int  # MoE 中的专家数量
    layer_index: Optional[int] = None  # 层索引，可选
    num_selected_experts: int = 1  # 选择的专家数量，默认为 1
    widening_factor: float = 4.0  # 扩展因子，默认为 4.0
    name: Optional[str] = None  # 名称，可选
    data_axis: Union[str, Tuple[str, ...]] = "data"  # 数据轴，默认为 "data"
    model_axis: Union[str, Tuple[str, ...]] = "model"  # 模型轴，默认为 "model"
    shard_activations: bool = False  # 是否分片激活函数，默认为 False
    attn_output_multiplier: float = 1.0  # 注意力输出乘数，默认为 1.0
    mesh: Any = None  # 网格对象，默认为 None

    def __call__(
        self,
        inputs: jax.Array,  # 输入数据，形状为 [B, T, D]
        mask: jax.Array,  # 掩码，形状为 [B, 1, T, T] 或 [B, 1, 1, T]
        padding_mask: Optional[jax.Array],  # 填充掩码，可选
        layer_memory: Optional[KVMemory],  # 层内存，可选的键值记忆
    ) -> DecoderOutput:
        """将输入嵌入序列转换为输出嵌入序列。"""

        def layer_norm(x):
            return hk_rms_norm(x)  # 应用层归一化

        if self.shard_activations:
            sharding = P(self.data_axis, None, self.model_axis)
        else:
            sharding = P(self.data_axis, None)

        h = with_sharding_constraint(inputs, sharding)  # 应用约束

        attn_output = MHABlock(
            num_q_heads=self.num_q_heads,  # 查询头的数量
            num_kv_heads=self.num_kv_heads,  # 键值头的数量
            key_size=self.key_size,  # 键的大小
            attn_output_multiplier=self.attn_output_multiplier,  # 注意力输出乘数
            mesh=self.mesh,  # 网格对象
            data_axis=self.data_axis,  # 数据轴
            model_axis=self.model_axis,  # 模型轴
        )(layer_norm(h), mask, layer_memory)  # 应用自注意力机制
        h_attn = attn_output.embeddings  # 获取注意力输出的嵌入

        h_attn = layer_norm(h_attn)  # 应用层归一化
        h += h_attn  # 将自注意力的输出加到输入上
        h = with_sharding_constraint(h, sharding)  # 应用约束

        def base_dense_block(h):
            h = DenseBlock(
                num_q_heads=self.num_q_heads,  # 查询头的数量
                num_kv_heads=self.num_kv_heads,  # 键值头的数量
                key_size=self.key_size,  # 键的大小
                widening_factor=self.widening_factor,  # 扩展因子
                sharding_constraint=False,  # 不使用约束
                mesh=self.mesh,  # 网格对象
            )(h)  # 应用稠密块
            return h

        if self.num_experts > 1:  # 如果专家数量大于 1
            rank_logger.debug("Using MoE!")  # 输出日志信息
            router = Router(
                num_selected_experts=self.num_selected_experts,  # 选择的专家数量
                shard_activations=self.shard_activations,  # 是否分片激活函数
                data_axis=self.data_axis,  # 数据轴
                model_axis=self.model_axis,  # 模型轴
                mesh=self.mesh,  # 网格对象
            )
            h_dense = MoELayer(
                num_experts=self.num_experts,  # 专家数量
                mesh=self.mesh,  # 网格对象
                layer_fn=base_dense_block,  # 使用基础稠密块函数
                router=router,  # 路由器
                shard_activations=self.shard_activations,  # 是否分片激活函数
                data_axis=self.data_axis,  # 数据轴
                model_axis=self.model_axis,  # 模型轴
            )(layer_norm(h), padding_mask)  # 应用 MoE
        else:
            h_dense = base_dense_block(layer_norm(h))  # 否则，应用基础稠密块

        h_dense = layer_norm(h_dense)  # 应用层归一化
        h += h_dense  # 将稠密块的输出加到输入上
        h = with_sharding_constraint(h, sharding)  # 应用约束

        return DecoderOutput(
            embeddings=h,  # 嵌入
            memory=attn_output.memory,  # 记忆
        )  # 返回解码器的输出
```

这段代码定义了一个 Transformer 解码器层，其中包含了多头自注意力机制和稠密块。具体流程如下：

1. 定义了一个名为 `DecoderLayer` 的类，用于实现 Transformer 解码器的一个层。
2. 类中包含了必要的参数，如查询头的数量、键值头的数量、层数、MoE 中的专家数量等。
3. 定义了 `__call__` 方法，用于调用解码器层。该方法接受输入数据、掩码、填充掩码和层内存，并返回解码器的输出。
4. 在 `__call__` 方法中，首先定义了一个层归一化函数 `layer_norm`。
5. 根据是否使用分片激活函数确定



```python
from typing import NamedTuple, Optional  # 导入命名元组和可选类型提示

import haiku as hk  # 导入 Haiku 库
import jax.numpy as jnp  # 导入 JAX NumPy 库

class LanguageModelOutput(NamedTuple):
    """语言模型输出的命名元组"""

    logits: jnp.Array  # 对数
    model_state: Any  # 模型状态

class InOutEmbed(hk.Embed):
    """将标记嵌入到低维空间的模块"""

    def __init__(
        self,
        vocab_size: Optional[int] = None,  # 词汇表大小，可选
        embed_dim: Optional[int] = None,  # 嵌入维度，可选
        sharding: Optional[P] = None,  # 分片，可选
        name: Optional[str] = None,  # 名称，可选
    ):
        super().__init__(
            vocab_size=vocab_size,
            embed_dim=embed_dim,
            name=name,
        )
        self.sharding = sharding  # 分片对象

    @property
    def embeddings(self):
        """获取嵌入矩阵"""
        embed_mat = hk.get_parameter(
            "embeddings",  # 参数名称
            [self.vocab_size, self.embed_dim],  # 形状
            dtype=jnp.float32,  # 数据类型
            init=hk.initializers.Constant(0),  # 初始化方法
        )
        if self.sharding:
            embed_mat = with_sharding_constraint(embed_mat, self.sharding)  # 应用约束
        return embed_mat

    def decode(
        self,
        inputs: jnp.Array,  # 输入数据
    ) -> jnp.Array:
        """解码嵌入"""
        return jnp.dot(inputs, self.embeddings.T.astype(inputs.dtype))  # 返回嵌入的转置与输入的点积
```

这段代码定义了两个类：

1. `LanguageModelOutput`：一个命名元组，包含模型的输出 logits 和模型状态 model_state。

2. `InOutEmbed`：一个继承自 Haiku 的嵌入模块，用于将标记嵌入到低维空间。它包含一个属性 `embeddings` 用于获取嵌入矩阵，并且定义了一个 `decode` 方法用于解码嵌入。



```python
from dataclasses import dataclass  # 导入 dataclass 模块
from typing import Optional, Any  # 导入可选和任意类型提示

import jax.numpy as jnp  # 导入 JAX NumPy 库

@dataclass
class LanguageModelConfig:
    """一个基于自回归 Transformer 的语言模型。"""

    model: Optional[TransformerConfig]  # 模型配置，可选
    vocab_size: int  # 词汇表大小
    pad_token: int  # 填充标记
    eos_token: int  # 结束标记
    sequence_len: int  # 序列长度
    model_size: int = 0  # 模型大小，默认为 0
    embedding_init_scale: float = 1.0  # 嵌入初始化比例，默认为 1.0
    embedding_multiplier_scale: float = 1.0  # 嵌入乘数比例，默认为 1.0
    output_multiplier_scale: float = 1.0  # 输出乘数比例，默认为 1.0
    name: Optional[str] = None  # 名称，可选
    fprop_dtype: Any = jnp.bfloat16  # 正向传播数据类型，默认为 jnp.bfloat16
    model_type: Optional[str] = None  # 模型类型，可选
    init_scale_override: Optional[float] = None  # 初始化比例覆盖，可选
    shard_embeddings: bool = True  # 是否分片嵌入，默认为 True

    _initialized = False  # 是否已初始化的标志

    def initialize(self):
        """初始化语言模型。"""
        # 我们不能指定 [] 作为默认值（它是可变的），因此使用 None。
        model_config = self.model
        assert self.init_scale_override is None, (
            "仅支持为预定义模型覆盖模型初始化比例。"
        )
        if self.model_size == 0:
            self.model_size = model_config.emb_size
        assert self.model is not None, "无法初始化模型。"
        self._initialized = True
        return self

    def make(self, *args, **kwargs):
        """创建语言模型实例。"""
        if not self._initialized:
            logger.warning(
                f"{self.name} 语言模型尚未初始化。正在为一个副本初始化。"
            )
            self.initialize()

        return LanguageModel(
            model=self.model.make(*args, **kwargs),
            config=self,
            fprop_dtype=self.fprop_dtype,
            mesh=kwargs.get("mesh", None),
        )

    def partition_rules(self):
        """获取分区规则。"""
        return LM_PARTITION_RULES + self.model.partition_rules()

def layer_norm(x, model):
    """应用层归一化。"""
    return hk_rms_norm(x)
```

这段代码定义了一个名为 `LanguageModelConfig` 的数据类，用于配置基于自回归 Transformer 的语言模型。

具体流程如下：

1. 定义了一个名为 `LanguageModelConfig` 的数据类，其中包含了一系列参数，如模型配置、词汇表大小、填充标记等。
2. 类中包含了初始化方法 `initialize()`，用于初始化语言模型。
3. 类中包含了 `make()` 方法，用于创建语言模型实例。
4. 类中包含了 `partition_rules()` 方法，用于获取分区规则。
5. 定义了一个名为 `layer_norm` 的函数，用于应用层归一化。




```python
from dataclasses import dataclass  # 导入 dataclass 模块
from typing import Optional, Any, Dict  # 导入可选和任意类型提示

import jax  # 导入 JAX 库
import jax.numpy as jnp  # 导入 JAX NumPy 库

@dataclass
class LanguageModel(hk.Module):
    """一个基于自回归 Transformer 的语言模型。"""

    model: "Transformer"  # 模型
    config: LanguageModelConfig  # 配置
    fprop_dtype: Any = jnp.bfloat16  # 正向传播数据类型，默认为 jnp.bfloat16
    name: Optional[str] = None  # 名称，可选
    mesh: Any = None  # 网格对象，默认为 None

    def __call__(
        self,
        tokens: jax.Array,  # 标记，形状为 [B, T]
        memory: Optional[Memory] = None,  # 记忆，可选
        *,
        batch: Dict[str, jax.Array] = {},  # 批次信息，默认为空字典
        last_hid_only: bool = False,  # 仅最后隐藏状态，默认为 False
        length: Optional[jax.Array] = None,  # 长度信息，可选
    ) -> LanguageModelOutput:
        """前向传播，生成一系列对数。"""
        del batch  # 未使用。

        config = self.config

        input_mask = jnp.greater(tokens, config.pad_token)  # 获取输入掩码

        # 嵌入输入标记和位置。
        in_out_embed = InOutEmbed(
            self.config.vocab_size,
            embed_dim=self.config.model_size,
            sharding=P(None, ("data", "model")),
        )
        input_embeddings = in_out_embed(tokens).astype(config.fprop_dtype)  # 获取输入嵌入
        input_embeddings = with_sharding_constraint(
            input_embeddings, P("data", None, self.model.model_axis)
        )  # 应用约束
        input_embeddings *= config.embedding_multiplier_scale  # 应用嵌入乘数比例

        model_output = self.model(
            input_embeddings,
            input_mask,
            memory=memory,
        )  # 获取模型输出
        embeddings, model_state = model_output.embeddings, model_output.memory  # 提取嵌入和模型状态
        if self.model.shard_activations:
            embeddings = with_sharding_constraint(
                embeddings, P("data", None, self.model.model_axis)
            )
        else:
            embeddings = with_sharding_constraint(embeddings, P("data", None))
        rank_logger.debug(f"最终嵌入形状: {embeddings.shape}")  # 输出调试信息
        embeddings = layer_norm(embeddings, self.model)  # 应用层归一化
        assert embeddings.dtype == self.fprop_dtype  # 断言嵌入的数据类型

        if last_hid_only:  # 如果仅最后隐藏状态
            last_step = jnp.maximum(jnp.sum(input_mask.astype(jnp.int32), axis=1) - 1, 0)  # 获取最后一步的索引
            last_hid = jax.vmap(lambda x, i: x[i], in_axes=0, out_axes=0)(embeddings, last_step)  # 获取最后隐藏状态
            return last_hid  # 返回最后隐藏状态

        if length is not None:  # 如果提供了长度信息
            last_step = jnp.maximum(length.astype(jnp.int32) - 1, 0)  # 获取最后一步的索引
            embeddings = jax.vmap(lambda x, i: x[i], in_axes=0, out_axes=0)(embeddings, last_step)  # 提取最后一步的嵌入
            embeddings = jnp.expand_dims(embeddings, axis=1)  # 在第二个维度上添加一个维度

        # 解码嵌入（这里，我们使用绑定权重）。
        rank_logger.info(embeddings.shape)  # 输出信息
        out = in_out_embed.decode(embeddings)  # 解码嵌入
        rank_logger.info(out.shape)  # 输出信息
        out *= config.output_multiplier_scale  # 应用输出乘数比例

        if self.model.shard_activations:  # 如果使用分片激活函数
            out = with_sharding_constraint(out, P("data", None, self.model.model_axis))  # 应用约束
        else:
            out = with_sharding_constraint(out, P("data", None))

        return LanguageModelOutput(
            logits=out,  # 对数
            model_state=model_state,  # 模型状态
        )

    def init_memory(self, batch_size: int, seq_len: int, dtype=jnp.bfloat16):
        """初始化记忆。"""
        return self.model.init_memory(batch_size=batch_size, sequence_len=seq_len, dtype=dtype)

    def prefill_memory(self, prompts, memory):
        """预填充记忆。"""
        # 填充到左侧并右对齐？
        # 基本上假设提示已经填充了
        model_output = self(prompts, memory=memory)
        return model_output.logits, model_output.model_state
```

这段代码定义了一个名为 `LanguageModel` 的类，该类继承自 Haiku 的模块。它表示一个基于自回归 Transformer 的语言模型。具体流程如下：

1. 定义了一个名为 `LanguageModel` 的类，用于表示一个基于自回归 Transformer 的语言模型。

2. 类中包含了模型 `model`、配置 `config`、正向传播数据类型 `fprop_dtype`、名称 `name` 和网格对象 `mesh` 等参数。

3. `__call__` 方法定义了前向传播过程，接受输入标记 `tokens`、记忆 `memory`，以及一些可选参数，如批次信息 `batch`、是否仅返回最后隐藏状态 `last_hid_only`、长度信息 `length` 等。方法返回一个 `LanguageModelOutput` 对象，包含对数和模型状态。

4. `init_memory` 方法用于初始化记忆。

5. `prefill_memory` 方法用于预填充记忆。

6. 在前向传播过程中，首先根据输入标记生成输入掩码，然后对输入进行嵌入，并应用约束和嵌入乘数比例。接着，通过模型进行计算，获取嵌入和模型状态，并进行层归一化。根据需求，提取最后隐藏状态或者根据长度信息选择最后一步的嵌入。最后，解码嵌入并应用输出乘数比例，最终返回对数和模型状态。

7. `prefill_memory` 方法用于预填充记忆，通过调用前向传播方法来获取对数和模型状态。



```python
from dataclasses import dataclass  # 导入 dataclass 模块
from typing import Optional, Any, Union, Tuple  # 导入可选、任意、元组类型提示

import jax.numpy as jnp  # 导入 JAX NumPy 库

@dataclass
class Transformer(hk.Module):
    """一个 Transformer 堆栈。"""

    num_q_heads: int  # 查询头数
    num_kv_heads: int  # 键值头数
    key_size: int  # 键的大小
    widening_factor: float  # 扩展因子
    init_scale: float  # 初始化比例
    mesh: Any  # 网格对象
    attn_output_multiplier: float  # 注意力输出乘数
    shard_activations: bool  # 是否分片激活函数
    num_layers: int  # 层数
    # MoE
    num_experts: int  # 专家数量
    num_selected_experts: int  # 选择的专家数量
    name: Optional[str] = None  # 名称，可选

    # 用于激活分片
    data_axis: Union[str, Tuple[str, ...]] = "data"  # 数据轴
    model_axis: Union[str, Tuple[str, ...]] = "model"  # 模型轴

    def init_memory(self, batch_size: int, sequence_len: int, dtype=jnp.bfloat16):
        """初始化记忆。"""
        return Memory(
            layers=init_layer_memories(
                batch_size,
                sequence_len,
                self.num_kv_heads,
                self.key_size,
                self.num_layers,
                step=jnp.zeros(batch_size, dtype=jnp.int32),
                dtype=dtype,
            ),
        )

    def __call__(
        self,
        embeddings: jnp.Array,  # 嵌入，形状为 [B, T, D]
        mask: jnp.Array,  # 掩码，形状为 [B, T]
        memory: Optional[Memory],  # 记忆，可选
    ) -> TransformerOutput:
        """将输入嵌入序列转换为输出嵌入序列。"""

        fprop_dtype = embeddings.dtype
        _, seq_len, model_size = embeddings.shape
        padding_mask = mask.copy()
        mask = mask[:, None, None, :]  # [B, H=1, T'=1, T]

        # 计算自回归序列建模的因果掩码。
        causal_mask = jnp.tril(jnp.ones((1, 1, seq_len, seq_len))).astype(
            fprop_dtype
        )  # [B=1, H=1, T, T]
        mask = mask * causal_mask  # [B, H=1, T, T]

        h = embeddings
        kv_memories = []

        def block(
            h,
            mask,
            padding_mask,
            memory,
            layer_index: Optional[int] = None,
            widening_factor: Optional[int] = None,
            name: Optional[str] = None,
        ) -> DecoderOutput:
            """定义了 Transformer 中的一个块。"""
            return DecoderLayer(
                num_q_heads=self.num_q_heads,
                num_kv_heads=self.num_kv_heads,
                key_size=self.key_size,
                widening_factor=widening_factor or self.widening_factor,
                num_layers=self.num_layers,
                mesh=self.mesh,
                data_axis=self.data_axis,
                model_axis=self.model_axis,
                attn_output_multiplier=self.attn_output_multiplier,
                shard_activations=self.shard_activations,
                # MoE.
                num_experts=self.num_experts,
                num_selected_experts=self.num_selected_experts,
                name=name,
                layer_index=layer_index,
            )(
                h,
                mask,
                padding_mask,
                memory,
            )

        for i in range(self.num_layers):
            decoder_output = block(
                h,
                mask,
                padding_mask,
                memory.layers[i] if memory else None,
                layer_index=i,
                name=f"decoder_layer_{i}",
            )
            h, new_kv_memory = (
                decoder_output.embeddings,
                decoder_output.memory,
            )
            kv_memories.append(new_kv_memory)

        return TransformerOutput(
            embeddings=h,
            memory=Memory(layers=kv_memories),
        )
```

这段代码定义了一个名为 `Transformer` 的类，该类继承自 Haiku 的模块，表示一个 Transformer 堆栈。其主要功能包括：

1. `__call__` 方法用于将输入嵌入序列转换为输出嵌入序列。在该方法中，首先根据输入标记生成输入掩码，并计算自回归序列建模的因果掩码。然后，利用 `block` 函数构建 Transformer 的块，并循环堆叠这些块以构建整个堆栈。每个块由 `DecoderLayer` 类来表示，其接受输入嵌入序列、掩码、填充掩码以及记忆，并返回输出嵌入序列和新的记忆。最终，将输出嵌入序列和记忆封装成 `TransformerOutput` 对象返回。

2. `init_memory` 方法用于初始化记忆。

3. 该类还包括一系列参数，如查询头数 `num_q_heads`、键值头数 `num_kv_heads`、键的大小 `key_size`、扩展因子 `widening_factor`、初始化比例 `init_scale`、网格对象 `mesh`、注意力输出乘数 `attn_output_multiplier`、是否分片激活函数 `shard_activations`、层数 `num_layers`、专家数量 `num_experts`、选择的专家数量 `num_selected_experts`、名称 `name` 等。



# 参考资料

* any list
{:toc}
