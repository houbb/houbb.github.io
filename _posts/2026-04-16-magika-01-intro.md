---
layout: post 
title: Magika 是一款新颖的基于 AI 的文件类型检测工具，它利用深度学习的最新进展来提供准确的检测。
date: 2026-04-16 21:01:55 +0800
categories: [AI]
tags: [ai]
published: true
---

# Magika

Magika 是一款新颖的基于 AI 的文件类型检测工具，它利用深度学习的最新进展来提供准确的检测。

在底层，Magika 采用了一个定制的、高度优化的模型，大小仅为几 MB，即使在单个 CPU 上运行，也能在几毫秒内完成精确的文件识别。

Magika 已在包含约 1 亿个样本、覆盖 200 多种内容类型（包括二进制和文本文件格式）的数据集上进行了训练和评估，在我们的测试集上平均准确率达到约 99%。

Magika 被大规模用于帮助提高 Google 用户的安全性，通过将 Gmail、Drive 和 Safe Browsing 的文件路由到适当的安全和内容策略扫描器，每周处理数千亿个样本。Magika 也已与 [VirusTotal](https://www.virustotal.com/)（[示例](./assets/magika-vt.png)）和 [abuse.ch](https://bazaar.abuse.ch/)（[示例](./assets/magika-abusech.png)）集成。

更多背景信息，您可以阅读我们最初的[在 Google 开源博客上的公告文章](https://opensource.googleblog.com/2024/02/magika-ai-powered-fast-and-efficient-file-type-identification.html)，查阅 [Magika 的网站](https://securityresearch.google/magika/)，以及在发表于 2025 年 IEEE/ACM 国际软件工程会议 (ICSE) 的[研究论文](https://securityresearch.google/magika/additional-resources/research-papers-and-citation/)中了解更多。

您无需安装任何软件即可通过我们的 [Web 演示](https://securityresearch.google/magika/demo/magika-demo/) 试用 Magika，该演示在您的浏览器中本地运行！


# 亮点

- 提供用 Rust 编写的命令行工具、Python API，以及 Rust、JavaScript/TypeScript（实验性 npm 包，为我们的 [Web 演示](https://securityresearch.google/magika/demo/magika-demo/) 提供支持）和 GoLang（进行中）的附加绑定。
- 在包含约 1 亿个文件、覆盖 [200 多种内容类型](./assets/models/standard_v3_3/README.md) 的数据集上训练和评估。
- 在我们的测试集上，Magika 实现了约 99% 的平均精确率和召回率，优于现有方法——尤其是在文本内容类型上。
- 模型加载完成后（一次性开销），即使仅在单个 CPU 上运行，每个文件的推理时间也约为 5 毫秒。
- 您可以同时调用 Magika 处理数千个文件。您也可以使用 `-r` 递归扫描目录。
- 推理时间接近恒定，与文件大小无关；Magika 仅使用文件内容的有限子集。
- Magika 使用一个基于内容类型的阈值系统，决定是否“信任”模型的预测，或者返回一个通用标签，例如“通用文本文档”或“未知二进制数据”。
- 对错误的容忍度可以通过不同的预测模式进行控制，例如 `high-confidence`、`medium-confidence` 和 `best-guess`。
- 客户端和绑定已经开源，更多内容即将推出！

# 目录

1. [快速入门](#快速入门)
   1. [安装](#安装)
   1. [快速开始](#快速开始)
1. [文档](#文档)
1. [安全漏洞](#安全漏洞)
1. [许可证](#许可证)
1. [免责声明](#免责声明)

# 快速入门

## 安装

### 命令行工具

Magika 提供了一个用 Rust 编写的 CLI，可以通过多种方式安装。

通过 `magika` Python 包：
```shell
pipx install magika
```

通过 brew（macOS / Linux）
```shell
brew install magika
```

通过安装脚本：
```shell
curl -LsSf https://securityresearch.google/magika/install.sh | sh
```

或：
```shell
powershell -ExecutionPolicy Bypass -c "irm https://securityresearch.google/magika/install.ps1 | iex"
```

通过 `magika-cli` Rust 包：
```shell
cargo install --locked magika-cli
```

### Python 包

```shell
pip install magika
```

### JavaScript 包

```shell
npm install magika
```


## 快速开始

这里有一些快速示例帮助您入门。

要了解 Magika 的内部工作原理，请参阅 Magika 网站上的[核心概念](https://securityresearch.google/magika/core-concepts/)部分。

### 命令行工具示例

```shell
% cd tests_data/basic && magika -r * | head
asm/code.asm: Assembly (code)
batch/simple.bat: DOS batch file (code)
c/code.c: C source (code)
css/code.css: CSS source (code)
csv/magika_test.csv: CSV document (code)
dockerfile/Dockerfile: Dockerfile (code)
docx/doc.docx: Microsoft Word 2007+ document (document)
docx/magika_test.docx: Microsoft Word 2007+ document (document)
eml/sample.eml: RFC 822 mail (text)
empty/empty_file: Empty file (inode)
```

```shell
% magika ./tests_data/basic/python/code.py --json
[
  {
    "path": "./tests_data/basic/python/code.py",
    "result": {
      "status": "ok",
      "value": {
        "dl": {
          "description": "Python source",
          "extensions": [
            "py",
            "pyi"
          ],
          "group": "code",
          "is_text": true,
          "label": "python",
          "mime_type": "text/x-python"
        },
        "output": {
          "description": "Python source",
          "extensions": [
            "py",
            "pyi"
          ],
          "group": "code",
          "is_text": true,
          "label": "python",
          "mime_type": "text/x-python"
        },
        "score": 0.996999979019165
      }
    }
  }
]
```

```shell
% cat tests_data/basic/ini/doc.ini | magika -
-: INI configuration file (text)
```

```shell
% magika --help
使用 AI 确定文件内容类型

用法：magika [选项] [路径]...

参数：
  [路径]...
          要分析的文件路径列表。

          使用短横线 (-) 从标准输入读取（只能使用一次）。

选项：
  -r, --recursive
          识别目录内的文件，而不是识别目录本身

      --no-dereference
          将符号链接识别为本身，而不是跟随链接识别其内容

      --colors
          无论终端是否支持都打印彩色输出

      --no-colors
          无论终端是否支持都不打印彩色输出

  -s, --output-score
          除内容类型外还打印预测分数

  -i, --mime-type
          打印 MIME 类型而不是内容类型描述

  -l, --label
          打印简单标签而不是内容类型描述

      --json
          以 JSON 格式打印

      --jsonl
          以 JSONL 格式打印

      --format <自定义>
          使用自定义格式打印（使用 --help 查看详细信息）。

          支持以下占位符：

            %p  文件路径
            %l  标识内容类型的唯一标签
            %d  内容类型的描述
            %g  内容类型的组别
            %m  内容类型的 MIME 类型
            %e  内容类型可能的文件扩展名
            %s  该文件的内容类型分数
            %S  该文件的内容类型分数（百分比形式）
            %b  如果被覆盖则输出模型输出，否则为空
            %%  字面量 %

  -h, --help
          打印帮助（使用 '-h' 查看摘要）

  -V, --version
          打印版本
```

更多示例和关于 CLI 的文档，请参阅 https://crates.io/crates/magika-cli。


### Python 示例

```python
>>> from magika import Magika
>>> m = Magika()
>>> res = m.identify_bytes(b'function log(msg) {console.log(msg);}')
>>> print(res.output.label)
javascript
```

```python
>>> from magika import Magika
>>> m = Magika()
>>> res = m.identify_path('./tests_data/basic/ini/doc.ini')
>>> print(res.output.label)
ini
```

```python
>>> from magika import Magika
>>> m = Magika()
>>> with open('./tests_data/basic/ini/doc.ini', 'rb') as f:
>>>     res = m.identify_stream(f)
>>> print(res.output.label)
ini
```

更多示例和关于 Python 模块的文档，请参阅 [Python `Magika` 模块](https://securityresearch.google/magika/cli-and-bindings/python/) 部分。


# 文档

请查阅 [Magika 的网站](https://securityresearch.google/magika) 获取详细文档，内容包括：
- 核心概念
  - Magika 的工作原理
  - 模型与内容类型
  - 预测模式
  - 理解输出
- CLI 与绑定（Python 模块、JavaScript 模块等）
- 贡献指南
- 常见问题
- ...


# 安全漏洞

请直接通过 magika-dev@google.com 联系我们。


# 许可证

Apache 2.0；详情请参阅 [`LICENSE`](LICENSE)。


# 免责声明

本项目并非 Google 官方项目。Google 不提供支持，并且 Google 特别声明不对其质量、适销性或针对特定用途的适用性作任何保证。

# 参考资料

* any list
{:toc}