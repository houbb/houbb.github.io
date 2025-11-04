---
layout: post
title: dive-into-llms-07-Transformers pipeline 入门例子
date: 2025-11-03 20:40:12 +0800
categories: [AI]
tags: [ai, learn-note]
published: true
---

# pipeline 例子

## python

我直接命令行测试，很不幸，开门失败。

```
PS C:\Users\Administrator> python
Python 3.13.0a5 (tags/v3.13.0a5:076d169, Mar 12 2024, 21:29:03) [MSC v.1938 64 bit (AMD64)] on win32
Type "help", "copyright", "credits" or "license" for more information.
>>> from transformers import pipeline
D:\Users\Administrator\AppData\Local\Programs\Python\Python313\Lib\site-packages\requests\__init__.py:86: RequestsDependencyWarning: Unable to find acceptable character detection dependency (chardet or charset_normalizer).
  warnings.warn(
Traceback (most recent call last):
  File "D:\Users\Administrator\AppData\Local\Programs\Python\Python313\Lib\site-packages\numpy\_core\__init__.py", line 22, in <module>
    from . import multiarray
  File "D:\Users\Administrator\AppData\Local\Programs\Python\Python313\Lib\site-packages\numpy\_core\multiarray.py", line 11, in <module>
    from . import _multiarray_umath, overrides
ImportError: DLL load failed while importing _multiarray_umath: 找不到指定的程序。

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "D:\Users\Administrator\AppData\Local\Programs\Python\Python313\Lib\site-packages\numpy\__init__.py", line 125, in <module>
    from numpy.__config__ import show_config
  File "D:\Users\Administrator\AppData\Local\Programs\Python\Python313\Lib\site-packages\numpy\__config__.py", line 4, in <module>
    from numpy._core._multiarray_umath import (
    ...<3 lines>...
    )
  File "D:\Users\Administrator\AppData\Local\Programs\Python\Python313\Lib\site-packages\numpy\_core\__init__.py", line 48, in <module>
    raise ImportError(msg) from exc
ImportError:

IMPORTANT: PLEASE READ THIS FOR ADVICE ON HOW TO SOLVE THIS ISSUE!

Importing the numpy C-extensions failed. This error can happen for
many reasons, often due to issues with your setup or how NumPy was
installed.

We have compiled some common reasons and troubleshooting tips at:

    https://numpy.org/devdocs/user/troubleshooting-importerror.html

Please note and check the following:

  * The Python version is: Python3.13 from "D:\Users\Administrator\AppData\Local\Programs\Python\Python313\python.exe"
  * The NumPy version is: "2.3.4"

and make sure that they are the versions you expect.
Please carefully study the documentation linked above for further help.

Original error was: DLL load failed while importing _multiarray_umath: 找不到指定的程序。


The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
    from transformers import pipeline
  File "D:\Users\Administrator\AppData\Local\Programs\Python\Python313\Lib\site-packages\transformers\__init__.py", line 27, in <module>
    from . import dependency_versions_check
  File "D:\Users\Administrator\AppData\Local\Programs\Python\Python313\Lib\site-packages\transformers\dependency_versions_check.py", line 16, in <module>
    from .utils.versions import require_version, require_version_core
  File "D:\Users\Administrator\AppData\Local\Programs\Python\Python313\Lib\site-packages\transformers\utils\__init__.py", line 24, in <module>
    from .auto_docstring import (
    ...<10 lines>...
    )
  File "D:\Users\Administrator\AppData\Local\Programs\Python\Python313\Lib\site-packages\transformers\utils\auto_docstring.py", line 30, in <module>
    from .generic import ModelOutput
  File "D:\Users\Administrator\AppData\Local\Programs\Python\Python313\Lib\site-packages\transformers\utils\generic.py", line 31, in <module>
    import numpy as np
  File "D:\Users\Administrator\AppData\Local\Programs\Python\Python313\Lib\site-packages\numpy\__init__.py", line 130, in <module>
    raise ImportError(msg) from e
ImportError: Erro
```

## 错误原因

这是 NumPy 在 Python 3.13 下的兼容问题。

目前（2025年11月），NumPy 的部分版本对 Python 3.13 兼容性仍不完善，尤其是在 Windows 下。

## 解决方案

```
pip uninstall numpy -y
pip install numpy==2.1.3
```

我们卸载，重新安装 2.1.3 稳定版本。

## 错误原因2-python 不稳定

说是 Python 3.13.0a5 不稳定，还是需要卸载

重新安装

https://www.python.org/downloads/release/python-3126/

此处我选择 https://www.python.org/ftp/python/3.12.6/python-3.12.6-amd64.exe

安装时：

✅ 勾选 “Add Python 3.12 to PATH”
✅ 选择 “Customize installation” → “Install for all users”

安装验证

```
>python --version
Python 3.12.6
```

一次解决所有兼容问题，请复制粘贴以下命令到 PowerShell：

```sh
# 1. 卸载旧版本
pip uninstall numpy torch transformers -y

# 2. 安装 charset-normalizer
pip install charset-normalizer

# 3. 安装兼容库
pip install torch transformers numpy requests

# 4. 验证
python -c "from transformers import pipeline; print(pipeline('sentiment-analysis')('I love this!'))"
```

验证效果

```
python -c "from transformers import pipeline; print(pipeline('sentiment-analysis')('I love this!'))"
No model was supplied, defaulted to distilbert/distilbert-base-uncased-finetuned-sst-2-english and revision 714eb0f (https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english).
Using a pipeline without specifying a model name and revision in production is not recommended.
config.json: 100%|█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 629/629 [00:00<?, ?B/s]
Xet Storage is enabled for this repo, but the 'hf_xet' package is not installed. Falling back to regular HTTP download. For better performance, install the package with: `pip install huggingface_hub[hf_xet]` or `pip install hf_xet`
model.safetensors: 100%|█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 268M/268M [00:17<00:00, 15.2MB/s]
tokenizer_config.json: 100%|█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 48.0/48.0 [00:00<?, ?B/s]
vocab.txt: 232kB [00:00, 683kB/s]
Device set to use cpu
[{'label': 'POSITIVE', 'score': 0.9998764991760254}]
```

会首先下载一些缺失的模型信息。


# chat

## 详细介绍一下 Transformers pipeline 

要真正入门大模型（尤其是 Hugging Face 的生态），**`transformers.pipeline`** 是必须吃透的核心概念。

我帮你系统、通俗地讲清楚它 👇

---

# 🧠 一、`pipeline` 是什么？

简单来说：
👉 它是 **Hugging Face Transformers 提供的「一键调用预训练模型」接口**。
你不需要理解模型结构、分词器、推理过程……
只要一句 `pipeline(task_name)`，它就能帮你把所有细节都封装好。

比如：

```python
from transformers import pipeline

classifier = pipeline("sentiment-analysis")
print(classifier("I love Hugging Face!"))
```

它会自动：

1. 下载一个适合 “sentiment-analysis” 的预训练模型；
2. 下载对应的分词器；
3. 把输入文本编码；
4. 送入模型；
5. 输出结果（带置信度）。

---

# ⚙️ 二、`pipeline()` 的核心功能

`pipeline()` 可以完成多种任务（task），例如：

| 任务类型   | 参数                                 | 功能说明              | 默认模型                                              |
| ------ | ---------------------------------- | ----------------- | ------------------------------------------------- |
| 情感分析   | `"sentiment-analysis"`             | 判断文本是正面或负面情绪      | `distilbert-base-uncased-finetuned-sst-2-english` |
| 文本生成   | `"text-generation"`                | 根据输入生成文本          | `gpt2`                                            |
| 掩码预测   | `"fill-mask"`                      | 补全 `[MASK]` 位置的单词 | `bert-base-uncased`                               |
| 命名实体识别 | `"ner"` / `"token-classification"` | 识别人名、地名、组织等       | `dslim/bert-base-NER`                             |
| 问答系统   | `"question-answering"`             | 根据上下文回答问题         | `distilbert-base-cased-distilled-squad`           |
| 翻译     | `"translation"`                    | 文本翻译（支持多语言）       | `Helsinki-NLP/opus-mt-en-zh` 等                    |
| 摘要     | `"summarization"`                  | 生成文本摘要            | `facebook/bart-large-cnn`                         |
| 语音识别   | `"automatic-speech-recognition"`   | 将音频转文字            | `openai/whisper-base`                             |
| 图像识别   | `"image-classification"`           | 图像分类任务            | `google/vit-base-patch16-224`                     |

---

# 🧩 三、`pipeline()` 的基本用法结构

```python
pipeline(
    task,              # 任务类型
    model=None,        # 指定使用哪个预训练模型（可选）
    tokenizer=None,    # 指定分词器（可选）
    device=-1,         # 指定运行设备（-1 表示 CPU，0 表示 GPU）
    revision=None,     # 模型版本（可选）
)
```

举例：

```python
from transformers import pipeline

# 默认模型（情感分析）
classifier = pipeline("sentiment-analysis")

# 指定模型
classifier = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

# 使用 GPU
classifier = pipeline("sentiment-analysis", device=0)
```

---

# 🧠 四、输入输出格式

几乎所有 pipeline 都接受字符串、列表、字典形式输入。

✅ **单句文本**

```python
classifier("This movie is amazing!")
```

✅ **多句文本**

```python
classifier(["I love it!", "I hate it!"])
```

✅ **结构化输入（如问答）**

```python
qa_pipeline = pipeline("question-answering")
qa_pipeline({
    "context": "Hugging Face Transformers is an amazing library for NLP.",
    "question": "What is Transformers?"
})
```

输出：

```python
{'score': 0.99, 'start': 13, 'end': 37, 'answer': 'an amazing library for NLP'}
```

---

# ⚡ 五、底层机制

当你运行 `pipeline("sentiment-analysis")` 时，它会自动做以下事：

1️⃣ 根据任务类型，选取默认模型名称；
2️⃣ 通过 `AutoModel` + `AutoTokenizer` 下载相应模型和分词器；
3️⃣ 封装输入输出逻辑，统一接口；
4️⃣ 将模型推理的结果自动转换为易读格式（如 label + score）。

---

# 💡 六、实战例子

### 1️⃣ 文本生成

```python
generator = pipeline("text-generation", model="gpt2")
print(generator("Once upon a time", max_new_tokens=30))
```

### 2️⃣ 掩码预测

```python
unmasker = pipeline("fill-mask", model="bert-base-uncased")
print(unmasker("Transformers are [MASK] models."))
```

### 3️⃣ 翻译

```python
translator = pipeline("translation", model="Helsinki-NLP/opus-mt-en-zh")
print(translator("Transformers are great!"))
```

### 4️⃣ 摘要生成

```python
summarizer = pipeline("summarization")
print(summarizer("Hugging Face Transformers provides thousands of pretrained models..."))
```

---

# 🧰 七、为什么推荐从 `pipeline()` 入门？

✅ 零门槛上手：一行代码就能跑大模型
✅ 封装完善：自动处理下载、分词、推理、结果格式化
✅ 可扩展：你熟悉后可手动加载模型 (`AutoModel`) 深度定制
✅ 统一接口：相同风格，适用于 NLP、CV、ASR 等多领域

---

# 📚 八、学习建议

如果你想系统学习 pipeline，可以按以下顺序：

1. **快速上手**：[https://huggingface.co/docs/transformers/main/zh/quicktour](https://huggingface.co/docs/transformers/main/zh/quicktour)
2. **任务示例大全**：[https://huggingface.co/docs/transformers/main/zh/task_summary](https://huggingface.co/docs/transformers/main/zh/task_summary)
3. **深入模型加载**：了解 `AutoModel`、`AutoTokenizer` 的底层原理。

# 参考资料

https://huggingface.co/docs/transformers/main/zh/quicktour


* any list
{:toc}