---
layout: post
title: 马斯克开源的 grok-1 大模型对标 openai chatGPT 源码硬核篇（1）
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

# README

## Grok-1

该存储库包含了加载和运行Grok-1开放权重模型的JAX示例代码。

请确保下载检查点并将`ckpt-0`目录放置在`checkpoints`中 - 参见[下载权重](#downloading-the-weights)。

然后，运行

```shell
pip install -r requirements.txt
python run.py
```

以测试代码。

该脚本加载检查点并从模型对测试输入进行采样。

由于模型规模较大（314B参数），测试模型所需的GPU内存足够大。该存储库中MoE层的实现不够高效。选择了此实现以避免需要自定义内核以验证模型的正确性。

## 模型规格

Grok-1当前设计具有以下规格：

- **参数:** 314B
- **架构:** 8个专家的混合（MoE）
- **专家利用:** 每个标记使用2个专家
- **层次:** 64
- **注意力头:** 查询使用48个，键/值使用8个
- **嵌入大小:** 6,144
- **标记化:** 使用131,072个标记的SentencePiece分词器
- **附加功能:**
  - 旋转嵌入（RoPE）
  - 支持激活分片和8位量化
- **最大序列长度（上下文）:** 8,192个标记

## 下载权重

您可以使用种子客户端和以下磁力链接下载权重：

```
magnet:?xt=urn:btih:5f96d43576e3d386c9ba65b883210a393b68210e&tr=https%3A%2F%2Facademictorrents.com%2Fannounce.php&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce
```

或直接使用[HuggingFace 🤗 Hub](https://huggingface.co/xai-org/grok-1)：

```
git clone https://github.com/xai-org/grok-1.git && cd grok-1
pip install huggingface_hub[hf_transfer]
huggingface-cli download xai-org/grok-1 --repo-type model --include ckpt-0/* --local-dir checkpoints --local-dir-use-symlinks False
```

## 许可证

此版本中的代码和相关Grok-1权重受Apache 2.0许可证的约束。

该许可证仅适用于此存储库中的源文件和Grok-1的模型权重。

# 代码

我们先看 2 篇比较简单的。

## run.py 主程序解释

```python
# 翻译：老马啸西风
# 导入必要的库和模块
import logging  # 导入日志记录模块
from model import LanguageModelConfig, TransformerConfig, QuantizedWeight8bit as QW8Bit  # 从模块中导入模型配置类和量化权重类
from runners import InferenceRunner, ModelRunner, sample_from_model  # 从模块中导入推理运行器、模型运行器和从模型中采样函数

# 指定模型检查点的路径
CKPT_PATH = "./checkpoints/"

# 定义主函数
def main():
    # 配置Grok-1模型参数
    grok_1_model = LanguageModelConfig(
        vocab_size=128 * 1024,  # 词汇表大小
        pad_token=0,  # 填充标记
        eos_token=2,  # 结束标记
        sequence_len=8192,  # 序列长度
        embedding_init_scale=1.0,  # 嵌入初始化比例
        output_multiplier_scale=0.5773502691896257,  # 输出倍增比例
        embedding_multiplier_scale=78.38367176906169,  # 嵌入倍增比例
        model=TransformerConfig(
            emb_size=48 * 128,  # 嵌入大小
            widening_factor=8,  # 扩展因子
            key_size=128,  # 关键字大小
            num_q_heads=48,  # 查询注意力头数量
            num_kv_heads=8,  # 键/值注意力头数量
            num_layers=64,  # 层次数量
            attn_output_multiplier=0.08838834764831845,  # 注意力输出倍增器
            shard_activations=True,  # 激活分片
            num_experts=8,  # MoE专家数量
            num_selected_experts=2,  # 每个标记选取的专家数量
            data_axis="data",  # 数据轴
            model_axis="model",  # 模型轴
        ),
    )
    
    # 配置推理运行器
    inference_runner = InferenceRunner(
        pad_sizes=(1024,),  # 填充大小
        runner=ModelRunner(
            model=grok_1_model,  # 指定模型
            bs_per_device=0.125,  # 每个设备的批量大小
            checkpoint_path=CKPT_PATH,  # 检查点路径
        ),
        name="local",  # 名称
        load=CKPT_PATH,  # 加载检查点的路径
        tokenizer_path="./tokenizer.model",  # 分词器路径
        local_mesh_config=(1, 8),  # 本地网格配置
        between_hosts_config=(1, 1),  # 主机之间配置
    )
    
    # 初始化推理运行器
    inference_runner.initialize()
    
    # 执行推理，并获得生成器对象
    gen = inference_runner.run()

    # 定义输入字符串
    inp = "The answer to life the universe and everything is of course"
    
    # 运行推理并输出结果
    print(f"Output for prompt: {inp}", sample_from_model(gen, inp, max_len=100, temperature=0.01))

# 检查是否是主程序
if __name__ == "__main__":
    # 配置日志记录基本设置，将日志级别设置为INFO
    logging.basicConfig(level=logging.INFO)
    # 调用主函数
    main()
```


## checkpoint.py


### 做了什么

这段代码主要完成了以下功能：

1. 导入所需的模块和库。
2. 定义了一系列用于在共享内存中复制文件的上下文管理器和辅助函数，以提高文件操作效率并节省资源。
3. 实现了快速的反序列化和序列化函数，使用了上述定义的上下文管理器，以便在共享内存中进行文件复制操作。
4. 提供了加载张量数据的函数 `load_tensors`，该函数支持多线程并行加载张量数据，并在加载过程中对数据进行分片和处理。
5. 定义了一些辅助函数，用于处理路径字符串和加载路径规则，以及在状态恢复过程中进行状态一致性检查和参数选项处理。
6. 实现了状态恢复函数 `restore`，该函数从检查点文件中加载张量数据，并将其恢复为状态，同时进行了状态一致性检查和参数选项处理。

核心点和步骤包括：

- 提供了高效的文件操作功能，利用了共享内存和多线程技术。
- 支持了快速的反序列化和序列化过程。
- 实现了并行加载张量数据的功能，提高了加载效率。
- 在状态恢复过程中，保证了加载的状态与代码中的状态参数一致性，并根据参数选项进行了灵活的处理。

1. `replace_with_load_state` 函数：该函数用于根据加载状态替换初始状态中的张量数据。

它的核心步骤包括：

   - 展平加载状态和初始状态，以及获取加载状态中张量数据的路径映射。
   - 遍历初始状态中的张量数据，根据加载路径规则进行替换或创建新的张量。
   - 最后将替换后的张量数据重新组装成树结构返回。

2. `restore` 函数：该函数用于从检查点文件中加载张量数据并将其恢复为状态。其核心步骤包括：
   - 构建检查点文件路径，并打印加载检查点的信息。
   - 加载状态形状信息和张量数据。
   - 对加载的状态进行一致性检查，确保参数一致性。
   - 将状态分片映射为全局数组，并根据参数选项决定是否仅返回参数部分。

这些功能的实现基于 JAX 库提供的树结构操作和并行计算功能，同时利用了上下文管理器和多线程技术来有效地处理文件操作和并行任务。

### 源码

注释源码

```python
from __future__ import annotations
# 导入 Python 未来支持的语言特性模块，以支持在类型提示中使用字符串形式的类名

import contextlib  # 上下文管理模块，用于创建上下文管理器
import logging  # 日志记录模块
import math  # 数学模块
import os  # 操作系统模块，用于处理文件和目录路径
import pickle  # pickle序列化模块，用于对象的序列化和反序列化
import re  # 正则表达式模块，用于字符串匹配和搜索
import shutil  # 文件操作模块，用于文件的复制、移动等操作
import sys  # 系统模块，提供对 Python 解释器的访问
import tempfile  # 临时文件模块，用于创建临时文件和目录
from concurrent.futures import ThreadPoolExecutor, wait  # 并发模块，用于并行执行任务
from typing import Any, Optional  # 类型提示模块，用于指定函数参数和返回值的类型

import jax  # JAX 数值计算库
import numpy as np  # 数组处理模块

from jax.experimental import multihost_utils  # JAX 实验性模块，用于多主机运行

from model import QuantizedWeight8bit  # 从自定义模块中导入 QuantizedWeight8bit 类

logger = logging.getLogger(__name__)  # 获取当前模块的日志记录器
rank_logger = logging.getLogger("rank")  # 获取日志记录器用于排名信息

# 下面定义了几个上下文管理器，用于将文件复制到共享内存中、从共享内存中复制文件
# 这些上下文管理器确保文件在复制后被删除，以节省资源和空间

@contextlib.contextmanager
def copy_to_shm(file: str):
    if file.startswith("/dev/shm/"):
        # 如果文件已经在共享内存中，则无需操作，直接返回文件路径
        yield file
        return

    tmp_dir = "/dev/shm/"
    # 创建临时文件并复制原始文件内容到临时文件中
    fd, tmp_path = tempfile.mkstemp(dir=tmp_dir)
    try:
        shutil.copyfile(file, tmp_path)
        yield tmp_path  # 通过生成器的 yield 返回临时文件路径
    finally:
        os.remove(tmp_path)  # 删除临时文件
        os.close(fd)  # 关闭文件描述符

@contextlib.contextmanager
def copy_from_shm(file: str):
    tmp_dir = "/dev/shm/"
    fd, tmp_path = tempfile.mkstemp(dir=tmp_dir)
    try:
        yield tmp_path  # 通过生成器的 yield 返回临时文件路径
        shutil.copyfile(tmp_path, file)  # 将临时文件内容复制到目标文件中
    finally:
        os.remove(tmp_path)  # 删除临时文件
        os.close(fd)  # 关闭文件描述符

# 以下两个函数分别用于快速反序列化和序列化对象，使用了上面定义的上下文管理器
def fast_unpickle(path: str) -> Any:
    with copy_to_shm(path) as tmp_path:
        with open(tmp_path, "rb") as f:
            return pickle.load(f)

def fast_pickle(obj: Any, path: str) -> None:
    with copy_from_shm(path) as tmp_path:
        with open(tmp_path, "wb") as f:
            pickle.dump(obj, f)

# 下面的函数用于加载张量数据，可以在多线程环境下并行加载张量数据
def load_tensors(shaped_arrays, directory, mesh_config, tensor_indices=None):
    # 创建一个最大并行线程数为32的线程池
    pool = ThreadPoolExecutor(max_workers=32)
    fs = list()
    num_tensors = 0
    num_replicas = 1
    data_model_shards = math.prod(mesh_config)
    if tensor_indices is None:
        iterator = enumerate(shaped_arrays)
    else:
        iterator = zip(tensor_indices, shaped_arrays)
    for i, t in iterator:
        # 根据当前进程的索引，决定是否加载张量数据
        if (i % num_replicas) == ((jax.process_index() // data_model_shards) % num_replicas):
            idx = (
                jax.process_index() // (num_replicas * data_model_shards) * data_model_shards
                + jax.process_index() % data_model_shards
            )
            # 提交异步任务，加载张量数据
            fs.append(
                pool.submit(fast_unpickle, os.path.join(directory, f"tensor{i:05d}_{idx:03d}"))
            )
            num_tensors += 1
        else:
            # 如果当前进程不需要加载张量数据，则创建一个零张量
            fs.append(pool.submit(np.zeros, t.shape, dtype=t.dtype))
    wait(fs)  # 等待所有异步任务完成
    return [f.result() for f in fs]  # 返回加载完成的张量列表

# 下面的函数用于将元组形式的路径转换为字符串形式
def path_tuple_to_string(path: tuple) -> str:
    pieces = []
    for elem in path:
        if isinstance(elem, jax.tree_util.DictKey):
            pieces.append(elem.key)
        elif isinstance(elem, jax.tree_util.GetAttrKey):
            pieces.append(elem.name)
        else:
            assert isinstance(elem, (jax.tree_util.FlattenedIndexKey, jax.tree_util.SequenceKey))
    return "/".join(pieces)

# 下面的函数用于根据规则获取加载路径字符串
def get_load_path_str(
    init_path_str: str,
    load_rename_rules: Optional[list[tuple[str, str]]] = None,
    load_exclude_rules: Optional[list[str]] = None,
) -> Optional[str]:
    # 排除规则
    if load_exclude_rules is not None:
        for search_pattern in load_exclude_rules:
            if re.search(search_pattern, init_path_str):
                return None

    # 重命名规则
    load_path_str = init_path_str
    if load_rename_rules is not None:
        for search_pattern, replacement_pattern in load_rename_rules:
            if re.search(search_pattern, load_path_str):
                load_path_str = re.sub(search_pattern, replacement_pattern, load_path_str)
                break

    return load_path_str

# 下面的函数用于替换初始状态中的张量数据为加载状态中的张量
def replace_with_load_state(
    init_state: Any,  # 初始状态，任意类型
    load_state: Any,  # 加载状态，任意类型
    load_rename_rules: Optional[list[tuple[str, str]]] = None,  # 加载重命名规则，可选参数，默认为 None
    load_exclude_rules: Optional[list[str]] = None,  # 加载排除规则，可选参数，默认为 None
    mesh_config: tuple = (1, 1),  # 网格配置，元组类型，默认为 (1, 1)
) -> Any:  # 返回值为任意类型
    # 展平加载状态，获取加载状态中的张量数据和路径
    flatten_load, _ = jax.tree_util.tree_flatten_with_path(load_state)
    # 展平初始状态，获取初始状态中的张量数据和路径，以及初始状态的结构信息
    flatten_init, structure_init = jax.tree_util.tree_flatten_with_path(init_state)
    # 构建加载状态中张量数据的路径映射
    load_map = {path_tuple_to_string(path): tensor for path, tensor in flatten_load}

    replaced = []  # 用于存储替换后的张量数据列表
    num_replicas = 1  # 副本数量
    data_model_shards = math.prod(mesh_config)  # 数据模型分片数量
    # 遍历初始状态中的张量数据和路径
    for i, (init_path, tensor) in enumerate(flatten_init):
        init_path_str = path_tuple_to_string(init_path)  # 获取初始状态中张量数据的路径字符串
        # 根据加载路径规则获取加载路径字符串
        load_path_str = get_load_path_str(init_path_str, load_rename_rules, load_exclude_rules)
        if load_path_str is None:
            # 如果加载路径字符串为 None，则排除不进行替换
            rank_logger.info(f"Excluded from restore: {init_path_str}.")
            replaced.append(tensor)
        elif load_path_str in load_map:
            # 如果加载路径字符串在加载路径映射中存在，则进行替换
            if load_path_str == init_path_str:
                rank_logger.info(f"Restored from ckpt: {init_path_str}.")
            else:
                rank_logger.info(f"Restored from ckpt: {init_path_str} <-- {load_path_str}.")
            replaced.append(load_map[load_path_str])
        else:
            # 如果加载路径字符串在加载路径映射中不存在，则根据规则创建张量或零张量
            rank_logger.info(f"Not found in ckpt: {init_path_str}.")
            if (i % num_replicas) == ((jax.process_index() // data_model_shards) % num_replicas):
                replaced.append(tensor)
            else:
                replaced.append(np.zeros_like(tensor))

    return jax.tree_util.tree_unflatten(structure_init, replaced)  # 将替换后的张量数据重新组装成树结构返回


def restore(
    checkpoint_path: str,  # 检查点路径，字符串类型
    state_shapes: Any,  # 状态形状，任意类型
    mesh,  # 网格
    between_hosts_config,  # 主机间配置
    params_only,  # 是否只返回参数
    state_sharding,  # 状态分片
    init_state: Optional[Any] = None,  # 初始状态，可选参数，默认为 None
) -> Any:  # 返回值为任意类型
    ckpt_path = os.path.join(checkpoint_path, "ckpt-0")  # 构建检查点文件路径

    rank_logger.info("Loading checkpoint at {}".format(ckpt_path))  # 打印加载检查点信息
    ckpt_shapes = state_shapes  # 获取状态形状信息
    # 展平状态形状，获取状态形状中的张量形状和路径，以及状态形状的结构信息
    ckpt_shapes_with_path, structure = jax.tree_util.tree_flatten_with_path(ckpt_shapes)

    ckpt_shapes_flat = [elem[1] for elem in ckpt_shapes_with_path]  # 获取状态形状中的张量形状列表
    # 加载张量数据
    loaded_tensors = load_tensors(ckpt_shapes_flat, ckpt_path, between_hosts_config)

    state = jax.tree_util.tree_unflatten(structure, loaded_tensors)  # 将加载的张量数据重新组装成状态

    # 对状态进行一致性检查，确保参数一致性
    ckpt_keys = set(state.params.keys())
    code_keys = set(state_sharding.params.keys())

    if ckpt_keys != code_keys and init_state is None:
        # 如果检查点参数与代码参数不一致且初始状态为空，则抛出异常
        missing_in_ckpt = code_keys - ckpt_keys
        missing_locally = ckpt_keys - code_keys
        raise ValueError(
            "Parameters in the code are not matching checkpoint parameters.\n"
            "Params missing in checkpoint: {}\nParams missing in code: {}".format(
                missing_in_ckpt, missing_locally
            )
        )
    # 将状态分片映射为全局数组
    state_sharding = jax.tree_util.tree_map(
        lambda x: jax.sharding.PartitionSpec() if x is None else x,
        state_sharding,
        is_leaf=lambda x: x is None,
    )
    state = multihost_utils.host_local_array_to_global_array(state, mesh, state_sharding)  # 将本地数组转换为全局数组
    if params_only:
        state = state.params  # 如果仅返回参数，则返回状态的参数部分
    return state  # 返回状态
``` 

# 参考资料


* any list
{:toc}
