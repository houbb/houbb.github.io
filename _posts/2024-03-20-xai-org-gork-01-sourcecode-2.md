---
layout: post
title: 马斯克开源的 grok-1 大模型对标 openai chatGPT 源码硬核篇（2）
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

## runners.py

最开始是一段包的导入。

```python
# 翻译：老马啸西风

# 导入所需的库
import bisect  # 提供二分查找算法
import functools  # 提供函数装饰器等工具
import logging  # 提供日志记录功能
import math  # 提供数学函数
import re  # 提供正则表达式操作
from dataclasses import dataclass  # 用于创建简单的类
from typing import Any, Callable, NamedTuple, Optional, Tuple  # 提供类型提示

import haiku as hk  # 用于构建神经网络
import jax  # 用于自动微分和并行计算
import jax.experimental.pjit as pjit  # 用于对函数进行并行编译
import jax.numpy as jnp  # JAX的NumPy替代品
import numpy as np  # NumPy库
import sentencepiece  # 用于分词

# 从JAX库中导入必要的模块
from jax.experimental import mesh_utils  # 提供用于处理Mesh网络的实用工具
from jax.sharding import PartitionSpec as P  # 提供用于指定分片方式的工具
from jax.typing import ArrayLike  # 提供数组样式的类型

# 导入自定义的模块
import checkpoint as xai_checkpoint  # 导入检查点模块，用于模型保存和加载
from model import (
    LanguageModelConfig,
    LanguageModelOutput,
    TrainingState,
    apply_rules,
    Memory,
    KVMemory,
)

# 设置日志记录器
logger = logging.getLogger(__name__)  # 创建一个记录器对象，用于记录日志
rank_logger = logging.getLogger("rank")  # 创建一个记录器对象，用于记录排名信息

# 定义常量
TOP_K = 8  # 定义一个顶部K值，用于某些排序和筛选操作
```

总结：这段代码首先导入了一系列Python标准库、第三方库以及自定义模块，并设置了日志记录器。

然后定义了一个常量TOP_K。这段代码的主要目的是准备工作，导入所需的库和模块，以及设置一些常用的参数和工具。


```python
from typing import NamedTuple  # 导入命名元组类型，用于定义结构化数据

# 定义一个命名元组SampleSettings，用于存储采样参数
class SampleSettings(NamedTuple):
    temperature: ArrayLike  # 采样温度，类型为数组
    nucleus_p: ArrayLike  # nucleus采样参数，类型为数组
    mask: ArrayLike  # 掩码，类型为数组
    # 是否活跃使用给定批次元素的标志，类型为数组，形状为[B]
    active: ArrayLike  


# 定义一个命名元组SampleOutput，用于存储采样结果
class SampleOutput(NamedTuple):
    token_id: ArrayLike  # 生成的token id，类型为数组
    prob: ArrayLike  # 生成的token的概率，类型为数组
    top_k_token_ids: ArrayLike  # 前K个最高概率的token id，类型为数组
    top_k_probs: ArrayLike  # 前K个最高概率的token的概率，类型为数组
```

这段代码定义了两个命名元组，分别用于存储采样过程中的参数和结果。

其中SampleSettings包含了采样所需的参数，如温度、nucleus采样参数、掩码以及活跃标志；SampleOutput包含了采样的结果，包括生成的token id、生成token的概率以及前K个最高概率的token id和对应的概率。

以下是对提供的函数的注释：

```python
def insert_slice(memory: Memory, slice, length, i):
    """
    在内存中插入一个片段。

    Args:
        memory (Memory): 存储内存的对象。
        slice (Memory): 要插入的片段。
        length (int): 片段的长度。
        i (int): 插入的位置。

    Returns:
        Memory: 插入片段后的新内存对象。
    """
    # 创建一个新的Memory对象，其中每个层都包含了对应层的KVMemory对象，并且步长为给定的长度
    slice = Memory(
        layers=[
            KVMemory(layer.k, layer.v, step=jnp.array([length]))
            for layer in slice.layers
        ],
    )
    # 使用动态更新索引函数，在给定的位置i插入片段
    return jax.tree_map(lambda m, u: jax.lax.dynamic_update_index_in_dim(m, u[0], i, axis=0),
                        memory, slice)


def pad_to_size(x, size):
    """
    将序列填充到指定的大小。

    Args:
        x (numpy.ndarray): 输入序列。
        size (int): 填充后的大小。

    Returns:
        numpy.ndarray: 填充后的序列。
    """
    if x.shape[0] > size:
        # 如果上下文太长，则进行左截断
        x = x[-size:]
    # 使用常数值0进行填充，使序列大小达到指定的大小
    return np.pad(x, [0, size - x.shape[0]], mode="constant", constant_values=0)


def top_p_filter(logits: jax.Array, top_p: jax.Array) -> jax.Array:
    """
    对logits进行nucleus过滤。

    Args:
        logits (jax.Array): 输入的logits数组。
        top_p (jax.Array): nucleus参数，用于筛选概率大于阈值的logits。

    Returns:
        jax.Array: 经过nucleus过滤后的logits数组。
    """
    # 检查输入数组的维度是否一致
    assert logits.ndim == top_p.ndim, f"Expected {logits.ndim} equal {top_p.ndim}"
    # 对logits进行排序
    sorted_logits = jax.lax.sort(logits, is_stable=False)
    # 计算softmax概率
    sorted_probs = jax.nn.softmax(sorted_logits)
    # 找到概率累积大于等于1-top_p的阈值索引
    threshold_idx = jnp.argmax(jnp.cumsum(sorted_probs, -1) >= 1 - top_p, axis=-1)
    # 从排序后的logits中取出对应阈值的最大logits
    threshold_largest_logits = jnp.take_along_axis(
        sorted_logits, threshold_idx[..., jnp.newaxis], axis=-1
    )
    # 确保输出的形状与logits相同
    assert threshold_largest_logits.shape == logits.shape[:-1] + (1,)
    # 创建一个mask，将概率小于阈值的logits设为-1e10
    mask = logits >= threshold_largest_logits
    # 将未使用的logits设置为负无穷
    logits = jnp.where(mask, logits, -1e10)
    return logits
```

这段代码定义了三个函数：`insert_slice`用于在内存中插入一个片段；`pad_to_size`用于将序列填充到指定的大小；`top_p_filter`用于对logits进行nucleus过滤。

这些函数都具有清晰的输入和输出，并提供了相应的文档字符串，以便于理解函数的功能和用法。

```python
def sample_token(
    rngs: jax.random.PRNGKey,  # 随机数生成器的密钥
    lm_outputs: LanguageModelOutput,  # 语言模型的输出
    settings: SampleSettings,  # 采样的设置参数
) -> SampleOutput:
    """
    对token进行采样。

    Args:
        rngs (jax.random.PRNGKey): 随机数生成器的密钥。
        lm_outputs (LanguageModelOutput): 语言模型的输出。
        settings (SampleSettings): 采样的设置参数。

    Returns:
        SampleOutput: 采样结果的命名元组。
    """
    # 将设置的形状扩展到与logit形状匹配
    settings = SampleSettings(
        temperature=jnp.expand_dims(settings.temperature, (1, 2)),  # 输入[B]，输出[B, 1, 1]
        nucleus_p=jnp.expand_dims(settings.nucleus_p, (1, 2)),  # 输入[B]，输出[B, 1, 1]
        mask=jnp.expand_dims(settings.mask, 1),  # 输入[B, V]，输出[B, 1, V]
        active=settings.active,  # [B]
    )
    # 对logits进行除以温度的处理
    logits = lm_outputs.logits / settings.temperature.astype(lm_outputs.logits.dtype)
    # 通过将不允许的token的概率设为接近零的值，来屏蔽所有不允许的token
    logits = jnp.where(settings.mask, logits, -1e10)
    # 通过top_p_filter函数，屏蔽所有不在p分位数内的token
    logits = top_p_filter(logits, settings.nucleus_p.astype(logits.dtype))

    # 通过jax.vmap函数，对每个logits进行随机采样，得到新的token
    new_token = jax.vmap(jax.random.categorical)(rngs, logits)

    # 计算token的概率
    probabilities = jax.nn.softmax(logits)
    token_prob = jnp.take_along_axis(probabilities, jnp.expand_dims(new_token, 1), axis=2)
    token_prob = jnp.squeeze(token_prob, 1)

    # 收集top-k的token和概率
    top_k_probs, top_k_token_ids = jax.lax.top_k(probabilities, TOP_K)
    top_k_probs = jnp.squeeze(top_k_probs, 1)
    top_k_token_ids = jnp.squeeze(top_k_token_ids, 1)
    return SampleOutput(
        new_token,
        token_prob,
        top_k_token_ids,
        top_k_probs,
    )
```

这个函数用于对语言模型的输出进行token采样。

首先对采样参数进行预处理，然后根据logits计算token的概率分布，并根据设置的温度和nucleus参数进行处理，屏蔽不合法的token，再使用随机采样得到新的token。

最后，计算新token的概率并收集top-k的token及其概率，返回采样结果的命名元组。

```python
from dataclasses import dataclass  # 导入dataclass装饰器，用于创建数据类

# 定义数据类ModelRunner
@dataclass
class ModelRunner:
    model: LanguageModelConfig  # 语言模型配置对象

    bs_per_device: float = 2.0  # 每个设备的批次大小，默认为2.0

    load_rename_rules: Optional[list[tuple[str, str]]] = None  # 加载重命名规则的可选列表
    load_exclude_rules: Optional[list[str]] = None  # 加载排除规则的可选列表

    rng_seed: int = 42  # 初始随机数种子，默认为42
    transform_forward: bool = False  # 是否对前向函数进行转换，默认为False

    checkpoint_path: str = ""  # 检查点路径，默认为空字符串

    def make_forward_fn(self, mesh: Any):
        """
        创建前向函数。

        Args:
            mesh (Any): 网格对象。

        Returns:
            Callable: 前向函数。
        """
        def forward(tokens):
            out = self.model.make(mesh=mesh)(tokens)
            return out, None

        if self.transform_forward:
            forward = hk.transform(forward)
        return forward

    def initialize(
        self,
        init_data,
        local_mesh_config: tuple[int, int],
        between_hosts_config: tuple[int, int],
    ):
        """
        初始化模型。

        Args:
            init_data: 初始化数据。
            local_mesh_config (tuple[int, int]): 本地网格配置。
            between_hosts_config (tuple[int, int]): 主机之间的配置。
        """
        num_replicas = math.prod(between_hosts_config)  # 计算副本数
        self.model.initialize()  # 初始化语言模型
        self.model.fprop_dtype = jnp.bfloat16  # 设置前向传播数据类型为bfloat16
        num_local_gpus = len(jax.local_devices())  # 获取本地GPU数量

        self.batch_size = int(self.bs_per_device * num_local_gpus * num_replicas)  # 计算全局批次大小

        self.local_batch_size = self.batch_size // jax.process_count()  # 计算每个主机的批次大小

        self.local_mesh_config = local_mesh_config  # 设置本地网格配置
        self.between_hosts_config = between_hosts_config  # 设置主机之间的配置
        rank_logger.info(
            f"Initializing mesh for {self.local_mesh_config=} {self.between_hosts_config=}..."
        )
        self.mesh = make_mesh(self.local_mesh_config, self.between_hosts_config)  # 创建网格对象
        self.forward = self.make_forward_fn(mesh=self.mesh)  # 创建前向函数
        self.logits_fn = hk.transform(lambda tokens: self.forward(tokens)[0])  # 创建logits函数

        self.eval_forward = self.make_forward_fn(mesh=self.mesh)  # 创建评估用的前向函数
        self.logits_eval_fn = hk.transform(lambda tokens: self.eval_forward(tokens)[0])  # 创建评估用的logits函数

        if self.transform_forward:
            self.state_sharding = self.get_state_sharding(init_data)  # 获取状态分片
            rank_logger.info(f"State sharding type: {type(self.state_sharding)}")  # 记录状态分片类型
            self.init_fn = pjit.pjit(self.init, out_shardings=self.state_sharding)  # 对初始化函数进行并行编译

    def init(self, rng: jax.Array, data) -> TrainingState:
        """
        初始化函数。

        Args:
            rng (jax.Array): 随机数数组。
            data: 数据。

        Returns:
            TrainingState: 训练状态。
        """
        assert self.transform_forward  # 断言是否进行了前向函数转换
        rng, init_rng = jax.random.split(rng)  # 拆分随机数
        params = self.forward.init(init_rng, data["inputs"])  # 初始化参数
        return TrainingState(params=params)  # 返回训练状态

    def get_state_sharding(self, init_data):
        """
        获取状态分片。

        Args:
            init_data: 初始化数据。

        Returns:
            Any: 状态分片对象。
        """
        assert self.transform_forward  # 断言是否进行了前向函数转换
        rng = jax.random.PRNGKey(self.rng_seed)  # 创建随机数种子
        rank_logger.info(f"partition rules: {self.model.partition_rules}")  # 记录分片规则

        with self.mesh:
            shapes = jax.eval_shape(self.init, rng, init_data)  # 计算初始化形状
            sharding = jax.tree_util.tree_map_with_path(
                apply_rules(self.model.partition_rules()),  # 应用分片规则
                shapes,
            )
        return sharding  # 返回状态分片对象

    def load_or_init(
        self,
        init_data: Any,
        from_checkpoint: bool = True,
        init_fn: Optional[Callable] = None,
    ):
        """
        加载或初始化模型。

        Args:
            init_data: 初始化数据。
            from_checkpoint (bool, optional): 是否从检查点加载，默认为True。
            init_fn (Optional[Callable], optional): 初始化函数，默认为None。

        Returns:
            Any: 加载或初始化的模型状态。
        """
        rng = jax.random.PRNGKey(self.rng_seed)  # 创建随机数种子

        if not self.checkpoint_path or not from_checkpoint:  # 如果没有检查点路径或不从检查点加载
            rank_logger.info("Initializing model...")  # 记录初始化模型
            with self.mesh:
                if init_fn is not None:
                    state = init_fn(rng, init_data)  # 使用指定的初始化函数初始化模型状态
                else:
                    assert self.transform_forward
                    state = self.init_fn(rng, init_data)  # 使用并行编译的初始化函数初始化模型状态
            rank_logger.info("Model state is newly initialized.")  # 记录模型状态已新初始化
        else:
            with self.mesh:
                if init_fn:
                    state_shapes = jax.eval_shape(init_fn, rng, init_data)  # 计算初始化形状
                else:
                    assert self.transform_forward
                    state_shapes = jax.eval_shape(self.init_fn, rng, init_data)  # 计算初始化形状
            init_state = None

            state = xai_checkpoint.restore(
                checkpoint_path=self.checkpoint_path,  # 检查点路径
                state_shapes=state_shapes,  # 模型状态形状
                mesh=self.mesh,  # 网格对象
                between_hosts_config=self
                .between_hosts_config,
                state_sharding=self.state_sharding,  # 状态分片对象
                init_state=init_state,
                params_only=True,
            )

            del init_state
        return state  # 返回加载或初始化的模型状态

```

```python
from dataclasses import dataclass  # 导入dataclass装饰器，用于创建数据类

# 定义数据类Request
@dataclass
class Request:
    prompt: str  # 输入的提示文本
    temperature: float  # 采样温度
    nucleus_p: float  # nucleus参数
    rng_seed: int  # 随机数种子
    max_len: int  # 生成序列的最大长度
```

这个类定义了一个请求的数据结构，包含了生成文本所需的各种参数，如提示文本、采样温度、nucleus参数、随机数种子和生成序列的最大长度。

以下是添加了中文注释的代码：

```python
from dataclasses import dataclass  # 导入dataclass装饰器，用于创建数据类

# 定义数据类InferenceRunner
@dataclass
class InferenceRunner:
    name: str  # 模型名称
    runner: Any  # 运行器对象
    load: str  # 加载路径
    tokenizer_path: str = "/tmp/xai_data/tokenizer.model"  # 分词器路径，默认为"/tmp/xai_data/tokenizer.model"
    local_mesh_config: Tuple[int, int] = (1, 1)  # 本地网格配置，默认为(1, 1)
    between_hosts_config: Tuple[int, int] = (1, 1)  # 主机之间的配置，默认为(1, 1)
    pad_sizes: tuple[int] = (1024,)  # 填充大小，默认为(1024,)

    def get_pad_bucket(self, size):
        """
        获取填充桶大小。

        Args:
            size: 大小。

        Returns:
            int: 填充桶大小。
        """
        i = bisect.bisect_left(self.pad_sizes, size)
        return self.pad_sizes[min(i, len(self.pad_sizes) - 1)]
```

这段代码定义了一个名为 `InferenceRunner` 的数据类，用于存储推理运行器的相关信息。它包含了模型名称、运行器对象、加载路径等属性。

其中，`get_pad_bucket` 方法用于根据给定的大小获取填充桶的大小。



```python
def initialize(self):
    runner = self.runner  # 获取运行器对象
    self.runner.transform_forward = True  # 设置转换前向函数为True
    dummy_data = dict(
        inputs=np.zeros((1, 256), dtype=np.int32),  # 创建虚拟输入数据
        targets=np.zeros((1, 256), dtype=np.int32),  # 创建虚拟目标数据
    )
    runner.initialize(
        dummy_data,
        local_mesh_config=self.local_mesh_config,  # 设置本地网格配置
        between_hosts_config=self.between_hosts_config,  # 设置主机之间的配置
    )

    self.tokenizer = sentencepiece.SentencePieceProcessor(model_file=self.tokenizer_path)  # 加载分词器

    max_len = runner.model.sequence_len  # 获取模型序列长度

    self.vocab_size = self.runner.model.vocab_size  # 获取词汇表大小

    params = runner.load_or_init(dummy_data)  # 加载或初始化参数
    self.params = params  # 设置参数

    def pad_to_max_len(x):
        """
        将输入数据填充至最大长度。

        Args:
            x: 输入数据。

        Returns:
            np.array: 填充后的数据。
        """
        if len(x.shape) > 1:
            pad_width = max_len - x.shape[1]
            return jnp.pad(x, [(0, 0), (0, pad_width), (0, 0), (0, 0)])
        else:
            return x

    @functools.lru_cache
    def lm():
        """
        获取语言模型。

        Returns:
            Any: 语言模型对象。
        """
        return runner.model.make(mesh=runner.mesh)

    def hk_forward(
        tokens,
        memory=None,
        length=None,
        active=None,
    ) -> LanguageModelOutput:
        """
        定义带有内存和活跃信息的前向传播函数。

        Args:
            tokens: 输入标记。
            memory: 内存。
            length: 长度。
            active: 是否激活。

        Returns:
            LanguageModelOutput: 语言模型输出。
        """
        if memory is not None:
            assert active is not None
            layers = []
            for l in memory.layers:
                # 对于非活跃请求，将步骤重置为0，以避免不必要的计算。
                step = jnp.where(active, l.step, jnp.zeros_like(l.step))
                layers.append(l._replace(step=step))
            memory = memory._replace(layers=layers)
        return lm()(tokens, memory, length=length)

    def hk_sample_step(rngs, last_output: SampleOutput, memory, settings):
        """
        定义带有随机数、上一个输出、内存和设置的样本步骤函数。

        Args:
            rngs: 随机数。
            last_output (SampleOutput): 上一个输出。
            memory: 内存。
            settings: 设置。

        Returns:
            Tuple: 随机数、样本结果和模型状态。
        """
        rngs, rngs_ = jax.vmap(jax.random.split, out_axes=1)(rngs)
        lm_outputs = hk_forward(last_output.token_id, memory=memory, active=settings.active)
        sample_result = sample_token(rngs_, lm_outputs, settings)
        return rngs, sample_result, lm_outputs.model_state

    def hk_new_memory(batch_size, sequence_len):
        """
        创建新的内存。

        Args:
            batch_size: 批次大小。
            sequence_len: 序列长度。

        Returns:
            Any: 新的内存对象。
        """
        return lm().init_memory(batch_size, sequence_len)

    def hk_prefill_memory(
        rngs,
        memory,
        settings,
        last_output,
        prompt,
        length,
        rng_seed,
        new_settings,
        i,
    ):
        """
        预填充内存。

        Args:
            rngs: 随机数。
            memory: 内存。
            settings: 设置。
            last_output: 上一个输出。
            prompt: 提示。
            length: 长度。
            rng_seed: 随机数种子。
            new_settings: 新设置。
            i: 索引。

        Returns:
            Tuple: 随机数、上一个输出、内存和设置。
        """
        rng = jax.random.PRNGKey(seed=rng_seed)
        rng, rng_ = jax.random.split(rng)

        # 为该样本分配新的内存。内存长度等于提示长度。
        slice = hk_new_memory(1, prompt.shape[0])  # 使用提示长度创建新的内存

        # 将该批次条目的设置移动到联合设置张量中
        settings = jax.tree_map(
            lambda o, v: jax.lax.dynamic_update_index_in_dim(o, v, i, axis=0),  # 在指定维度动态更新索引
            settings,
            new_settings,
        )

        # 从联合设置张量中获取批次条目的设置
        settings_slice = jax.tree_map(lambda t: jnp.expand_dims(t[i], axis=0), settings)

        # 处理提示的前n-1个标记
        lm_outputs = hk_forward(
            jnp.expand_dims(prompt, 0),
            memory=slice,
            length=jnp.expand_dims(length, 0),
            active=settings_slice.active,
        )

        # 前向传播未正确设置内存中的“步数”计数器，手动覆盖以确保下一次调用`hk_forward`时使用正确的上下文长度
        slice = lm_outputs.model_state
        slice = slice._replace(
            layers=[l._replace(step=jnp.array([length])) for l in slice.layers]
        )

        # 对实际输出标记进行采样
        rng_ = jnp.expand_dims(rng_, 0)
        new_output = sample_token(rng_, lm_outputs, settings_slice)

        # 更新KV缓存/内存
        slice = jax.tree_map(pad_to_max_len, slice)  # 对内存中的每一层进行填充
        memory = insert_slice(memory, slice, length, i)  # 将新的内存切片插入到原始内存中

        rng = jnp.expand_dims(rng, 0)
        rngs = jax.lax.dynamic_update_index_in_dim(rngs, rng, i, axis=0)  # 在指定维度动态更新索引

        # 将该批次条目的网络输出移动到联合输出张量中
        last_output = jax.tree_util.tree_map(
            lambda last, new: jax.lax.dynamic_update_index_in_dim(last, new, i, axis=0),  # 在指定维度动态更新索引
            last_output,
            new_output,
        )
        return rngs, last_output, memory, settings  # 返回更新后的随机数、上一个输出、内存和设置

    sample_step_ = hk.without_apply_rng(hk.transform(hk_sample_step))  # 使用带有样本步骤的转换器
    prefill_memory_ = hk.without_apply_rng(hk.transform(hk_prefill_memory))  # 使用带有预填充内存的转换器
    new_memory_ = hk.without_apply_rng(hk.transform(hk_new_memory))  # 使用带有新内存的转换器
    forward_ = hk.without_apply_rng(hk.transform(hk_forward))  # 使用带有前向传播的转换器

    rng = jax.random.PRNGKey(42)  # 创建随机数种子
    dummy_tokens = jnp.zeros((1, max_len), jnp.int32)  # 创建虚拟标记

    with runner.mesh:  # 在运行器的网格环境中执行
        shapes = jax.eval_shape(forward_.init, rng, dummy_tokens)  # 计算前向传播的形状

    self.params_sharding = jax.tree_util.tree_map_with_path(
        apply_rules(runner.model.partition_rules()),  # 应用模型的分区规则
        shapes,
    )

    ds = P("data")  # 数据分区
    ms = runner.model.model.get_memory_sharding()  # 获取内存分片
    self.sample_step = pjit.pjit(
        sample_step_.apply,  # 应用样本步骤
        in_shardings=(self.params_sharding, None, ds, ms, None),  # 输入分片
        out_shardings=(None, ds, ms),  # 输出分片
        donate_argnums=3,  # 捐赠参数编号
    )
    self.prefill_memory = pjit.pjit(
        functools.partial(prefill_memory_.apply),  # 应用预填充内存
        in_shardings=(
            self.params_sharding,
            None,
            ms,
            None,
            ds,
            None,
            None,
            None,
            None,
            None,
        ),  # 输入分片
        out_shardings=(None, ds, ms, None),  # 输出分片
        donate_argnums=(2,),  # 捐赠参数编号
    )
    self.new_memory = pjit.pjit(
        new_memory_.apply,  # 应用新内存
        static_argnums=(1, 2),  # 静态参数编号
        out_shardings=ms,  # 输出分片
    )
```

这段代码实现了初始化函数 `initialize()`，其中包含了多个辅助函数用于处理模型初始化、前向传播、内存操作等。主要步骤包括：

1. 创建虚拟数据并初始化模型参数。

2. 加载分词器并设置其他相关参数。

3. 定义用于填充数据至最大长度、进行前向传播、样本步骤、创建新内存、预填充内存的辅助函数。

4. 使用 Haiku 库转换这些辅助函数，以便在 JAX 中进行并行处理。

5. 计算模型参数的分片，以便在分布式环境中共享。

6. 使用 `pjit.pjit()` 函数并指定输入输出分片，对转换后的函数进行并行处理。

7. 最终得到初始化后的推理运行器对象。


下面是运行方法的源码：

```python
    def run(self):
        """接受提示的生成器函数。"""
        runner = self.runner  # 获取运行器对象
        mesh = runner.mesh  # 获取网格对象
        max_len = runner.model.sequence_len  # 获取模型序列长度上限
        batch_size = runner.batch_size  # 获取批量大小
        params = self.params  # 获取参数
        rngs = jax.random.split(jax.random.PRNGKey(1), batch_size)  # 使用不同的随机种子拆分随机数生成器序列
        with mesh:
            memory = self.new_memory(params, batch_size, max_len)  # 初始化内存
            settings = SampleSettings(
                temperature=np.zeros((batch_size,), dtype=np.float32),  # 温度设置
                nucleus_p=np.zeros((batch_size,), dtype=np.float32),  # 核心概率设置
                mask=np.ones((batch_size, self.vocab_size), dtype=np.int32),  # 掩码设置
                active=np.zeros((batch_size), dtype=np.int32),  # 活跃设置
            )
            last_output = SampleOutput(
                token_id=np.zeros((batch_size, 1), dtype=np.int32),  # token ID
                prob=np.zeros((batch_size, 1), dtype=jnp.bfloat16),  # 概率
                top_k_token_ids=np.zeros((batch_size, TOP_K), dtype=np.int32),  # top-k token ID
                top_k_probs=np.zeros((batch_size, TOP_K), dtype=jnp.bfloat16),  # top-k 概率
            )

            prompt = np.array([300, 400, 500, 600, 600, 700, 800])  # 提示序列

            new_settings = SampleSettings(
                temperature=np.float32(1),  # 新的温度设置
                nucleus_p=np.float32(1),  # 新的核心概率设置
                mask=np.ones((self.vocab_size,), dtype=np.int32),  # 新的掩码设置
                active=np.zeros((), dtype=np.int32),  # 新的活跃设置
            )
            rng_seed = np.uint64(1)  # 随机种子

            for size in self.pad_sizes:
                if size > runner.model.sequence_len:
                    break
                logger.info("Precompile {}".format(size))  # 打印信息
                prompt_len = len(prompt)  # 获取提示长度
                prompt = pad_to_size(prompt, size)  # 调整提示序列大小
                rngs, last_output, memory, settings = self.prefill_memory(
                    params,
                    rngs,
                    memory,
                    settings,
                    last_output,
                    prompt,
                    prompt_len,
                    rng_seed,
                    new_settings,
                    0,
                )
        with runner.mesh:
            logger.info("Compiling...")  # 打印信息
            rngs, last_output, memory = self.sample_step(
                params, rngs, last_output, memory, settings
            )
            logger.info("Done compiling.")  # 打印信息

        all_tokens = []  # 存储所有token
        free_slots = list(range(batch_size))  # 空闲槽位列表
        requests = [None] * batch_size  # 请求列表
        first_output = [None] * batch_size  # 第一个输出列表
        jax.tree_map(lambda x: x.copy_to_host_async(), last_output)  # 复制到主机异步操作
        prev_token = last_output  # 上一个token
        step = 0  # 步数
        total_num_tokens = 0  # 总token数
        total_num_sequences = 0  # 总序列数
        with mesh:
            while True:
                while free_slots:
                    request: Optional[Request] = yield  # 接收请求
                    tokens = self.tokenizer.encode(request.prompt)  # 将提示编码为token
                    temperature = request.temperature  # 温度
                    nucleus_p = request.nucleus_p  # 核心概率
                    rng_seed = request.rng_seed  # 随机种子

                    i = free_slots.pop()  # 弹出一个空闲槽位
                    prompt = np.array(tokens, dtype=np.int32)  # 转换为numpy数组
                    prompt_len = len(prompt)  # 获取提示长度
                    prompt = pad_to_size(prompt, self.get_pad_bucket(prompt.shape[0]))  # 调整大小
                    mask = np.ones((self.vocab_size,), dtype=np.int32)  # 掩码设置

                    new_settings = SampleSettings(
                        temperature=np.float32(temperature),  # 新的温度设置
                        nucleus_p=np.float32(nucleus_p),  # 新的核心概率设置
                        mask=mask,  # 新的掩码设置
                        active=np.ones((), dtype=np.int32),  # 新的活跃设置
                    )
                    rng_seed = np.uint64(rng_seed)  # 随机种子
                    rngs, last_output, memory, settings = self.prefill_memory(
                        params,
                        rngs,
                        memory,
                        settings,
                        last_output,
                        prompt,
                        prompt_len,
                        rng_seed,
                        new_settings,
                        i,
                    )
                    jax.tree_map(lambda x: x.copy_to_host_async(), last_output)  # 复制到主机异步操作
                    first_output[i] = last_output
                    requests[i] = request
                    total_num_sequences += 1

                rngs, last_output, memory = self.sample_step(
                    params, rngs, last_output, memory, settings
                )
                total_num_tokens += batch_size - len(free_slots)

                prev_token = jax.tree_map(np.array, prev_token)  # 上一个token
                for i in range(batch_size):
                    if requests[i] is not None:
                        if first_output[i] is not None:
                            first_output_i = jax.tree_map(np.array, first_output[i])  # 第一个输出
                            all_tokens.append(int(first_output_i.token_id[i][0]))  # 添加到token列表
                            first_output[i] = None
                            continue

                        all_tokens.append(int(prev_token.token_id[i][0]))  # 添加到token列表
                        cont = len(all_tokens) < requests[i].max_len  # 是否继续

                        if not cont:
                            output_str = self.tokenizer.decode(all_tokens)  # 解码
                            requests[i] = None
                            free_slots.append(i)
                            all_tokens = []
                            settings = settings._replace(active=settings.active.at[i].set(0))  # 设置为非活跃
                            yield output_str  # 返回生成的字符串

                jax.tree_map(lambda x: x.copy_to_host_async(), last_output)  # 复制到主机异步操作
                prev_token = last_output  # 上一个token
                step += 1  # 步数
```

该代码是一个生成器函数，用于接受提示并生成相应的文本输出。

- 首先，代码初始化了一些参数和设置，包括模型的一些参数，随机数生成器等。

- 然后，通过循环预编译不同大小的输入序列。

- 在网格上进行编译，生成器开始工作。

- 在主循环中，程序等待接收来自外部的请求。

- 当有空闲槽位时，程序接收到请求，并根据请求生成对应的token序列。

- 程序使用预先编译的模型进行采样，并根据模型输出的token序列继续生成文本。

- 最后，程序根据生成的文本输出并返回，同时更新状态以处理下一个请求。

整体而言，该代码是一个基于生成器的文本生成模型，它接受外部的提示并生成相应的文本输出。


```python
# 翻译：老马啸西风
def make_mesh(
    local_mesh_config: tuple[int, ...], between_hosts_config: tuple[int, ...]
) -> jax.sharding.Mesh:
    """创建分布式Mesh对象。

    参数:
        local_mesh_config (tuple[int, ...]): 本地Mesh配置，包含两个整数。
        between_hosts_config (tuple[int, ...]): 主机间Mesh配置，包含两个整数。

    返回:
        jax.sharding.Mesh: 创建的分布式Mesh对象。
    """
    assert len(local_mesh_config) == 2
    assert len(between_hosts_config) == 2
    rank_logger.info("Detected %s devices in mesh", jax.device_count())  # 记录设备数量
    device_mesh = mesh_utils.create_hybrid_device_mesh(
        local_mesh_config,
        between_hosts_config,
        devices=jax.devices(),
        process_is_granule=True,
    )  # 创建混合设备Mesh对象
    rank_logger.debug(re.sub("\n+", "\n", f"Job device mesh is:\n{device_mesh}"))  # 记录Mesh信息
    return jax.sharding.Mesh(device_mesh, ("data", "model"))  # 返回Mesh对象


def sample_from_model(server, prompt, max_len, temperature):
    """从模型中采样生成文本。

    参数:
        server: 与生成器通信的服务器对象。
        prompt (str): 输入提示。
        max_len (int): 生成文本的最大长度。
        temperature (float): 生成文本的温度参数。

    返回:
        str: 生成的文本输出。
    """
    next(server)  # 向服务器发送空消息以开始生成
    inp = Request(
        prompt=prompt,
        temperature=temperature,
        nucleus_p=1.0,
        rng_seed=42,
        max_len=max_len,
    )  # 创建请求对象
    return server.send(inp)  # 发送请求并接收生成的文本输出
```

以上是给定的Python代码的中文注释。

第一个函数用于创建分布式Mesh对象，而第二个函数用于从模型中采样生成文本。

# 参考资料


* any list
{:toc}
