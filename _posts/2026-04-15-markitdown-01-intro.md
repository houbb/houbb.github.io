---
layout: post 
title: MarkItDown 用于将各种文件转换为 Markdown 格式，以便供 LLM 及相关文本分析流水线使用
date: 2026-04-15 21:01:55 +0800
categories: [AI]
tags: [ai, llm, markdown]
published: true
---


# MarkItDown

MarkItDown 是一个轻量级 Python 工具，用于将各种文件转换为 Markdown 格式，以便供 LLM 及相关文本分析流水线使用。从这个角度来说，它与 [textract](https://github.com/deanmalmgren/textract) 最为相似，但侧重于保留重要的文档结构和内容为 Markdown（包括：标题、列表、表格、链接等）。

虽然输出结果通常具有良好的可读性和人工友好性，但其本意是供文本分析工具使用 —— 对于需要高保真文档转换以供人类阅读的场景，可能不是最佳选择。

MarkItDown 目前支持以下格式的转换：

- PDF
- PowerPoint
- Word
- Excel
- 图像（EXIF 元数据和 OCR）
- 音频（EXIF 元数据和语音转录）
- HTML
- 基于文本的格式（CSV、JSON、XML）
- ZIP 文件（遍历内容）
- YouTube 链接
- ePub
- ……以及更多！

## 为什么选择 Markdown？

Markdown 非常接近纯文本，只有极少的标记或格式，但仍然能够表示重要的文档结构。主流 LLM（如 OpenAI 的 GPT-4o）原生“理解”Markdown，并且经常在未经提示的情况下就在回复中使用 Markdown。这表明它们已经在大量 Markdown 格式的文本上进行了训练，并且对其有很好的理解。作为一个附加好处，Markdown 约定也具有很高的 token 效率。

## 前置条件
MarkItDown 需要 Python 3.10 或更高版本。建议使用虚拟环境以避免依赖冲突。

使用标准 Python 安装时，可以通过以下命令创建并激活虚拟环境：

```bash
python -m venv .venv
source .venv/bin/activate
```

如果使用 `uv`，可以通过以下命令创建虚拟环境：

```bash
uv venv --python=3.12 .venv
source .venv/bin/activate
# 注意：请使用 'uv pip install' 而不是仅 'pip install' 来在此虚拟环境中安装包
```

如果您使用的是 Anaconda，可以通过以下命令创建虚拟环境：

```bash
conda create -n markitdown python=3.12
conda activate markitdown
```

## 安装

要安装 MarkItDown，请使用 pip：`pip install 'markitdown[all]'`。或者，您可以从源代码安装：

```bash
git clone git@github.com:microsoft/markitdown.git
cd markitdown
pip install -e 'packages/markitdown[all]'
```

## 使用方法

### 命令行

```bash
markitdown path-to-file.pdf > document.md
```

或者使用 `-o` 指定输出文件：

```bash
markitdown path-to-file.pdf -o document.md
```

您也可以使用管道传递内容：

```bash
cat path-to-file.pdf | markitdown
```

### 可选依赖
MarkItDown 有针对激活各种文件格式的可选依赖。在前文中，我们使用 `[all]` 选项安装了所有可选依赖。不过，您也可以单独安装它们，以便更好地控制。例如：

```bash
pip install 'markitdown[pdf, docx, pptx]'
```

将仅安装 PDF、DOCX 和 PPTX 文件的依赖。

目前，可用的可选依赖如下：

* `[all]` 安装所有可选依赖
* `[pptx]` 安装 PowerPoint 文件的依赖
* `[docx]` 安装 Word 文件的依赖
* `[xlsx]` 安装 Excel 文件的依赖
* `[xls]` 安装旧版 Excel 文件的依赖
* `[pdf]` 安装 PDF 文件的依赖
* `[outlook]` 安装 Outlook 邮件的依赖
* `[az-doc-intel]` 安装 Azure 文档智能的依赖
* `[audio-transcription]` 安装 wav 和 mp3 文件音频转录的依赖
* `[youtube-transcription]` 获取 YouTube 视频转录的依赖

### 插件

MarkItDown 还支持第三方插件。插件默认禁用。要列出已安装的插件：

```bash
markitdown --list-plugins
```

要启用插件，请使用：

```bash
markitdown --use-plugins path-to-file.pdf
```

要查找可用的插件，请在 GitHub 上搜索主题标签 `#markitdown-plugin`。要开发插件，请参阅 `packages/markitdown-sample-plugin`。

#### markitdown-ocr 插件

`markitdown-ocr` 插件为 PDF、DOCX、PPTX 和 XLSX 转换器添加了 OCR 支持，使用 LLM Vision 从嵌入的图片中提取文本 —— 这与 MarkItDown 已用于图像描述的 `llm_client` / `llm_model` 模式相同。无需新的 ML 库或二进制依赖。

**安装：**

```bash
pip install markitdown-ocr
pip install openai  # 或任何兼容 OpenAI 的客户端
```

**用法：**

传入与图像描述相同的 `llm_client` 和 `llm_model`：

```python
from markitdown import MarkItDown
from openai import OpenAI

md = MarkItDown(
    enable_plugins=True,
    llm_client=OpenAI(),
    llm_model="gpt-4o",
)
result = md.convert("document_with_images.pdf")
print(result.text_content)
```

如果未提供 `llm_client`，插件仍会加载，但 OCR 会被静默跳过，转而使用标准的内置转换器。

详细文档请参阅 [`packages/markitdown-ocr/README.md`](packages/markitdown-ocr/README.md)。

### Azure 文档智能

要使用 Microsoft 文档智能进行转换：

```bash
markitdown path-to-file.pdf -o document.md -d -e "<document_intelligence_endpoint>"
>

有关如何设置 Azure 文档智能资源的更多信息，请参见[此处](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/how-to-guides/create-document-intelligence-resource?view=doc-intel-4.0.0)

### Python API

Python 中的基本用法：

```python
from markitdown import MarkItDown

md = MarkItDown(enable_plugins=False) # 设置为 True 以启用插件
result = md.convert("test.xlsx")
print(result.text_content)
```

Python 中的文档智能转换：

```python
from markitdown import MarkItDown

md = MarkItDown(docintel_endpoint="<document_intelligence_endpoint>")
result = md.convert("test.pdf")
print(result.text_content)
```

要为图像描述使用大语言模型（目前仅适用于 pptx 和图像文件），请提供 `llm_client` 和 `llm_model`：

```python
from markitdown import MarkItDown
from openai import OpenAI

client = OpenAI()
md = MarkItDown(llm_client=client, llm_model="gpt-4o", llm_prompt="可选的自定义提示")
result = md.convert("example.jpg")
print(result.text_content)
```

### Docker

```sh
docker build -t markitdown:latest .
docker run --rm -i markitdown:latest < ~/your-file.pdf > output.md
```

## 贡献

本项目欢迎贡献和建议。大多数贡献要求您同意贡献者许可协议（CLA），声明您有权并确实授予我们使用您贡献的权利。详情请访问 https://cla.opensource.microsoft.com。

当您提交拉取请求时，CLA 机器人会自动确定您是否需要提供 CLA，并适当地装饰 PR（例如状态检查、评论）。只需按照机器人提供的说明操作即可。对于使用我们 CLA 的所有仓库，您只需执行此操作一次。

本项目已采用 [Microsoft 开源行为准则](https://opensource.microsoft.com/codeofconduct/)。有关更多信息，请参阅[行为准则常见问题解答](https://opensource.microsoft.com/codeofconduct/faq/)或通过 [opencode@microsoft.com](mailto:opencode@microsoft.com) 联系我们提出任何其他问题或评论。

### 如何贡献

您可以通过查看问题或帮助审查 PR 来提供帮助。任何问题或 PR 都受欢迎，但我们也标记了一些“开放贡献”和“开放审查”的问题，以帮助促进社区贡献。当然，这些只是建议，您可以以任何您喜欢的方式贡献。

<div align="center">

|            | 所有                                                         | 特别需要社区帮助                                                                                                            |
| ---------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **Issues** | [所有 Issues](https://github.com/microsoft/markitdown/issues) | [开放贡献的 Issues](https://github.com/microsoft/markitdown/issues?q=is%3Aissue+is%3Aopen+label%3A%22open+for+contribution%22) |
| **PRs**    | [所有 PRs](https://github.com/microsoft/markitdown/pulls)     | [开放审查的 PRs](https://github.com/microsoft/markitdown/pulls?q=is%3Apr+is%3Aopen+label%3A%22open+for+reviewing%22)        |

</div>

### 运行测试和检查

- 导航到 MarkItDown 包：

  ```sh
  cd packages/markitdown
  ```

- 在您的环境中安装 `hatch` 并运行测试：

  ```sh
  pip install hatch  # 安装 hatch 的其他方法：https://hatch.pypa.io/dev/install/
  hatch shell
  hatch test
  ```

  （备选）使用已安装所有依赖的 Devcontainer：

  ```sh
  # 在 Devcontainer 中重新打开项目并运行：
  hatch test
  ```

- 在提交 PR 之前运行预提交检查：`pre-commit run --all-files`

### 贡献第三方插件

您还可以通过创建和分享第三方插件来贡献。更多详情请参见 `packages/markitdown-sample-plugin`。

## 商标

本项目可能包含项目、产品或服务的商标或徽标。授权使用 Microsoft 商标或徽标须遵守并必须遵循
[Microsoft 商标与品牌指南](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general)。
在本项目的修改版本中使用 Microsoft 商标或徽标不得引起混淆或暗示 Microsoft 赞助。
任何第三方商标或徽标的使用均受该第三方的政策约束。


# 参考资料

* any list
{:toc}