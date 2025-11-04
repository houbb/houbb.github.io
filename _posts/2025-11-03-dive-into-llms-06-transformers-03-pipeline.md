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

# 参考资料

https://huggingface.co/docs/transformers/main/zh/quicktour


* any list
{:toc}