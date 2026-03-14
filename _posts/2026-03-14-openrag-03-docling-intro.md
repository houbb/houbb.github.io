---
layout: post
title: Docling 简化了文档处理流程，可以解析多种文档格式——包括高级 PDF 理解——并提供与生成式 AI 生态系统的无缝集成。
date: 2026-03-14 21:01:55 +0800
categories: [AI]
tags: [ai, rag, sh]
published: true
---


# Docling

**Docling 简化了文档处理流程，可以解析多种文档格式——包括高级 PDF 理解——并提供与生成式 AI 生态系统的无缝集成。** ([GitHub][1])

---

# 功能（Features）

* 🗂️ 解析多种文档格式，包括：

  * PDF
  * DOCX
  * PPTX
  * XLSX
  * HTML
  * WAV
  * MP3
  * VTT
  * 图片（PNG、TIFF、JPEG 等）
  * 以及更多格式

* 📑 **高级 PDF 理解能力**，包括：

  * 页面布局（page layout）
  * 阅读顺序（reading order）
  * 表格结构（table structure）
  * 代码
  * 公式
  * 图像分类
  * 等等

* 🧬 **统一且表达能力强的 `DoclingDocument` 表示格式**

* ↪️ 多种导出格式和选项，包括：

  * Markdown
  * HTML
  * DocTags
  * 无损 JSON

* 🔒 **支持本地执行**，适用于：

  * 敏感数据
  * 隔离网络环境（air-gapped environments）

* 🤖 即插即用集成，包括：

  * LangChain
  * LlamaIndex
  * Crew AI
  * Haystack

* 🔍 **广泛的 OCR 支持**，用于：

  * 扫描版 PDF
  * 图像文档

* 👓 支持多个 **视觉语言模型（Visual Language Models）**

  * 例如：GraniteDocling

* 🎙️ **音频支持**，包含：

  * 自动语音识别（ASR）模型

* 🔌 可通过 **MCP Server** 连接到任何 AI Agent

* 💻 提供简单且便捷的 **CLI 命令行工具** ([GitHub][1])

---

# 最新更新（What's new）

* 📤 **结构化信息提取（Structured information extraction）**（测试版）

* 📑 默认使用新的布局模型 **Heron**

  * 提供更快的 PDF 解析速度

* 🔌 **用于 Agent 应用的 MCP Server**

* 💬 支持解析：

  * WebVTT（Web Video Text Tracks）文件

---

# 即将推出（Coming soon）

* 📝 **元数据提取**

  包括：

  * 标题
  * 作者
  * 参考文献
  * 语言

* 📊 **图表理解**

  包括：

  * 柱状图（Barchart）
  * 饼图（Piechart）
  * 折线图（LinePlot）

* 🧪 **复杂化学结构理解**

  例如：

  * 分子结构（Molecular structures）

---

# 安装（Installation）

使用 Python 包管理器安装 `docling`：

```bash
pip install docling
```

支持运行环境：

* macOS
* Linux
* Windows

支持架构：

* x86_64
* arm64

更多安装说明请查看官方文档。 ([GitHub][1])

---

# 快速开始（Getting started）

使用 Python API 转换文档：

```python
from docling.document_converter import DocumentConverter

source = "https://arxiv.org/pdf/2408.09869"  # 文档本地路径或 URL
converter = DocumentConverter()
result = converter.convert(source)

print(result.document.export_to_markdown())
```

输出示例：

```
## Docling Technical Report
...
```

更多高级用法可在文档中查看。 ([GitHub][1])

---

# CLI（命令行）

Docling 提供内置 CLI 用于执行文档转换：

```bash
docling https://arxiv.org/pdf/2206.01062
```

也可以使用 **GraniteDocling 或其他视觉语言模型**：

```bash
docling --pipeline vlm --vlm-model granite_docling https://arxiv.org/pdf/2206.01062
```

在支持的 Apple Silicon 设备上：

* 会使用 **MLX 加速**。

---

# 文档（Documentation）

查看官方文档以获取更多信息：

* 安装
* 使用方法
* 核心概念
* 示例
* 扩展

---

# 示例（Examples）

官方提供多个示例项目，展示如何使用 Docling 解决不同应用场景。

---

# 集成（Integrations）

Docling 原生集成多种 AI 框架，以加速 AI 应用开发。

---

# 获取帮助（Get help and support）

如果需要帮助，可以通过 GitHub Discussions 与社区交流。

---

# 技术报告（Technical report）

有关 Docling 内部实现的更多细节，请参考：

**Docling Technical Report**

---

# 贡献（Contributing）

如果希望为项目贡献代码，请阅读：

```
Contributing to Docling
```

---

# 引用（References）

如果你在项目中使用 Docling，请引用：

```bibtex
@techreport{Docling,
  author = {Deep Search Team},
  month = {8},
  title = {Docling Technical Report},
  url = {https://arxiv.org/abs/2408.09869},
  eprint = {2408.09869},
  doi = {10.48550/arXiv.2408.09869},
  version = {1.0.0},
  year = {2024}
}
```

---

# License

Docling 代码库采用：

```
MIT License
```

对于单独的模型，请参考对应模型包中的许可证。 ([GitHub][1])

---

# 项目信息（About）

Docling 的目标是：

**“让文档为生成式 AI 做好准备。”**

---

## 项目主题

```
html
markdown
pdf
ai
convert
xlsx
pdf-converter
docx
documents
pptx
pdf-to-text
tables
document-parser
pdf-to-json
document-parsing
```

---

# 技术栈

代码语言占比：

* Python 98.6%
* Shell 1.1%
* Dockerfile 0.3%

---

✅ **一句话总结**

**Docling 是一个面向生成式 AI 的文档解析工具，可以将 PDF、Office、HTML、音频、图片等多种格式解析为结构化数据，并输出 Markdown / JSON 等格式，用于 RAG、Agent 或 AI 数据处理。** ([GitHub][1])

# 参考资料

* any list
{:toc}