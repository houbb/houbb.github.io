---
layout: post 
title:  OpenDataLoader PDF 面向AI就绪数据的PDF解析器。自动化PDF无障碍。开源。
date: 2026-04-09 21:01:55 +0800
categories: [AI]
tags: [ai, llm, ocr]
published: true
---

# OpenDataLoader PDF

**面向AI就绪数据的PDF解析器。自动化PDF无障碍。开源。**

🔍 **面向AI数据提取的PDF解析器** — 从任意PDF中提取Markdown、JSON（含边界框）和HTML。基准测试第一（整体0.907）。确定性本地模式 + AI混合模式用于复杂页面。

- **准确度有多高？** — 基准测试第一：整体0.907，表格准确率0.928（涵盖200个真实世界PDF，包括多栏和科学论文）。确定性本地模式 + AI混合模式用于复杂页面（[基准测试](#extraction-benchmarks)）
- **支持扫描件PDF和OCR吗？** — 支持。混合模式内置OCR（80+种语言），适用于300 DPI以上的低质量扫描件（[混合模式](#hybrid-mode-1-accuracy-for-complex-pdfs)）
- **支持表格、公式、图片、图表吗？** — 支持。复杂/无框表格、LaTeX公式、AI生成的图片/图表描述，均可通过混合模式实现（[混合模式](#hybrid-mode-1-accuracy-for-complex-pdfs)）
- **如何用于RAG？** — `pip install opendataloader-pdf`，三行代码完成转换。输出结构化的Markdown用于分块，带边界框的JSON用于来源引用，以及HTML。提供LangChain集成。Python、Node.js、Java SDK（[快速开始](#get-started-in-30-seconds) | [LangChain](#langchain-integration)）

♿ **PDF无障碍自动化** — 同样的布局分析引擎也支持自动标记。首个端到端生成Tagged PDF的开源工具（预计2026年Q2推出）。

- **解决了什么问题？** — 无障碍法规已在全球强制执行。手动修复PDF成本为每份文档$50–200，无法规模化（[法规](#pdf-accessibility--pdfua-conversion)）
- **哪些功能免费？** — 布局分析 + 自动标记（2026年Q2，Apache 2.0许可证）。未标记PDF输入 → Tagged PDF输出。不依赖专有SDK（[自动标记预览](#auto-tagging-preview-coming-q2-2026)）
- **PDF/UA合规呢？** — 将Tagged PDF转换为PDF/UA-1或PDF/UA-2是企业插件。自动标记生成Tagged PDF；PDF/UA导出是最后一步（[流水线](#accessibility-pipeline)）
- **为何值得信赖？** — 与[PDF协会](https://pdfa.org)及[Dual Lab](https://duallab.com)（[veraPDF](https://verapdf.org)开发者）合作构建。自动标记遵循Well-Tagged PDF规范，并通过veraPDF验证（[合作详情](https://opendataloader.org/docs/tagged-pdf-collaboration)）

## 30秒快速开始

**要求**：Java 11+ 和 Python 3.10+（[Node.js](https://opendataloader.org/docs/quick-start-nodejs) | [Java](https://opendataloader.org/docs/quick-start-java) 版本也可用）

> 开始前：运行 `java -version`。如果未找到，请从 [Adoptium](https://adoptium.net/) 安装 JDK 11+。

```bash
pip install -U opendataloader-pdf
```

```python
import opendataloader_pdf

# 一次调用中批量处理所有文件 — 每次convert()都会启动一个JVM进程，重复调用会很慢
opendataloader_pdf.convert(
    input_path=["file1.pdf", "file2.pdf", "folder/"],
    output_dir="output/",
    format="markdown,json"
)
```

![OpenDataLoader PDF布局分析 — 标题、表格、图片均被检测并带有边界框](https://raw.githubusercontent.com/opendataloader-project/opendataloader-pdf/main/samples/image/example_annotated_pdf.png)

*带标注的PDF输出 — 每个元素（标题、段落、表格、图片）都被检测，并带有边界框和语义类型。*

## 解决了哪些问题？

| 问题 | 解决方案 | 状态 |
|------|----------|------|
| **解析时PDF结构丢失** — 阅读顺序错误、表格断裂、无元素坐标 | 确定性的本地PDF转Markdown/JSON，带边界框，XY-Cut++阅读顺序 | 已发布 |
| **复杂表格、扫描件PDF、公式、图表** 需要AI级别的理解 | 混合模式将复杂页面路由到AI后端（基准测试第一） | 已发布 |
| **PDF无障碍合规** — EAA、ADA、Section 508强制执行。手动修复$50–200/文档 | 自动标记：布局分析 → Tagged PDF（免费，2026年Q2）。与PDF协会合作开发，通过veraPDF验证。PDF/UA导出（企业插件） | 自动标记：2026年Q2 |

## 功能矩阵

| 功能 | 支持情况 | 层级 |
|------|----------|------|
| **数据提取** | | |
| 提取文本并保持正确阅读顺序 | 支持 | 免费 |
| 每个元素带边界框 | 支持 | 免费 |
| 表格提取（简单边框） | 支持 | 免费 |
| 表格提取（复杂/无边框） | 支持 | 免费（混合模式） |
| 标题层级检测 | 支持 | 免费 |
| 列表检测（编号、项目符号、嵌套） | 支持 | 免费 |
| 图片提取及坐标 | 支持 | 免费 |
| AI图表/图片描述 | 支持 | 免费（混合模式） |
| 扫描件PDF的OCR | 支持 | 免费（混合模式） |
| 公式提取（LaTeX） | 支持 | 免费（混合模式） |
| Tagged PDF结构提取 | 支持 | 免费 |
| AI安全（提示注入过滤） | 支持 | 免费 |
| 页眉/页脚/水印过滤 | 支持 | 免费 |
| **无障碍** | | |
| 为未标记PDF自动标记 → Tagged PDF | 预计2026年Q2 | 免费（Apache 2.0） |
| PDF/UA-1, PDF/UA-2导出 | 💼 可用 | 企业版 |
| 无障碍工作室（可视化编辑器） | 💼 可用 | 企业版 |
| **限制** | | |
| 处理Word/Excel/PPT | 不支持 | — |
| 需要GPU | 不需要 | — |

## 提取基准测试

**opendataloader-pdf [混合模式] 整体准确率排名第一（0.907）**，涵盖阅读顺序、表格和标题提取准确率。

| 引擎 | 整体 | 阅读顺序 | 表格 | 标题 | 速度（秒/页） |
|------|------|----------|------|------|----------------|
| **opendataloader [混合]** | **0.907** | **0.934** | **0.928** | 0.821 | 0.463 |
| docling | 0.882 | 0.898 | 0.887 | **0.824** | 0.762 |
| nutrient | 0.880 | 0.924 | 0.662 | 0.811 | 0.230 |
| marker | 0.861 | 0.890 | 0.808 | 0.796 | 53.932 |
| unstructured [hi_res] | 0.841 | 0.904 | 0.588 | 0.749 | 3.008 |
| edgeparse | 0.837 | 0.894 | 0.717 | 0.706 | 0.036 |
| opendataloader | 0.831 | 0.902 | 0.489 | 0.739 | **0.015** |
| mineru | 0.831 | 0.857 | 0.873 | 0.743 | 5.962 |
| pymupdf4llm | 0.732 | 0.885 | 0.401 | 0.412 | 0.091 |
| unstructured | 0.686 | 0.882 | 0.000 | 0.388 | 0.077 |
| markitdown | 0.589 | 0.844 | 0.273 | 0.000 | 0.114 |
| liteparse | 0.576 | 0.866 | 0.000 | 0.000 | 1.061 |

> 分数归一化到[0, 1]。准确率越高越好；速度越低越好。**粗体** = 最佳。[完整基准测试详情](https://github.com/opendataloader-project/opendataloader-bench)

[![Benchmark](https://github.com/opendataloader-project/opendataloader-bench/raw/refs/heads/main/charts/benchmark.png)](https://github.com/opendataloader-project/opendataloader-bench)

[![Quality Breakdown](https://github.com/opendataloader-project/opendataloader-bench/raw/refs/heads/main/charts/benchmark_quality.png)](https://github.com/opendataloader-project/opendataloader-bench)

## 应该使用哪种模式？

| 你的文档 | 模式 | 安装命令 | 服务器命令 | 客户端命令 |
|----------|------|----------|------------|-------------|
| 标准数字PDF | 快速（默认） | `pip install opendataloader-pdf` | 无需 | `opendataloader-pdf file1.pdf file2.pdf folder/` |
| 复杂或嵌套表格 | **混合模式** | `pip install "opendataloader-pdf[hybrid]"` | `opendataloader-pdf-hybrid --port 5002` | `opendataloader-pdf --hybrid docling-fast file1.pdf file2.pdf folder/` |
| 扫描/图片型PDF | 混合模式 + OCR | `pip install "opendataloader-pdf[hybrid]"` | `opendataloader-pdf-hybrid --port 5002 --force-ocr` | `opendataloader-pdf --hybrid docling-fast file1.pdf file2.pdf folder/` |
| 非英语扫描PDF | 混合模式 + OCR | `pip install "opendataloader-pdf[hybrid]"` | `opendataloader-pdf-hybrid --port 5002 --force-ocr --ocr-lang "ko,en"` | `opendataloader-pdf --hybrid docling-fast file1.pdf file2.pdf folder/` |
| 数学公式 | 混合模式 + 公式 | `pip install "opendataloader-pdf[hybrid]"` | `opendataloader-pdf-hybrid --enrich-formula` | `opendataloader-pdf --hybrid docling-fast --hybrid-mode full file1.pdf file2.pdf folder/` |
| 需要描述的图表 | 混合模式 + 图片 | `pip install "opendataloader-pdf[hybrid]"` | `opendataloader-pdf-hybrid --enrich-picture-description` | `opendataloader-pdf --hybrid docling-fast --hybrid-mode full file1.pdf file2.pdf folder/` |
| 需要无障碍的未标记PDF | 自动标记 → Tagged PDF | 预计2026年Q2 | — | — |

## 快速开始

### Python

```bash
pip install -U opendataloader-pdf
```

```python
import opendataloader_pdf

# 一次调用中批量处理所有文件 — 每次convert()都会启动一个JVM进程，重复调用会很慢
opendataloader_pdf.convert(
    input_path=["file1.pdf", "file2.pdf", "folder/"],
    output_dir="output/",
    format="markdown,json"
)
```

### Node.js

```bash
npm install @opendataloader/pdf
```

```typescript
import { convert } from '@opendataloader/pdf';

await convert(['file1.pdf', 'file2.pdf', 'folder/'], {
  outputDir: 'output/',
  format: 'markdown,json'
});
```

### Java

```xml
<dependency>
  <groupId>org.opendataloader</groupId>
  <artifactId>opendataloader-pdf-core</artifactId>
</dependency>
```

[Python快速开始](https://opendataloader.org/docs/quick-start-python) | [Node.js快速开始](https://opendataloader.org/docs/quick-start-nodejs) | [Java快速开始](https://opendataloader.org/docs/quick-start-java)

## 混合模式：复杂PDF的#1准确率

混合模式结合了快速的本地Java处理与AI后端。简单页面在本地处理（0.02秒/页）；复杂页面路由到AI后端，表格准确率提升至+90%。

```bash
pip install -U "opendataloader-pdf[hybrid]"
```

**终端1** — 启动后端服务器：

```bash
opendataloader-pdf-hybrid --port 5002
```

**终端2** — 处理PDF：

```bash
# 一次调用中批量处理所有文件 — 每次调用都会启动一个JVM进程，重复调用会很慢
opendataloader-pdf --hybrid docling-fast file1.pdf file2.pdf folder/
```

**Python：**

```python
# 一次调用中批量处理所有文件 — 每次convert()都会启动一个JVM进程，重复调用会很慢
opendataloader_pdf.convert(
    input_path=["file1.pdf", "file2.pdf", "folder/"],
    output_dir="output/",
    hybrid="docling-fast"
)
```

### 扫描件PDF的OCR

对于基于图片的PDF（无可选文本），使用 `--force-ocr` 启动后端：

```bash
opendataloader-pdf-hybrid --port 5002 --force-ocr
```

对于非英文文档，指定语言：

```bash
opendataloader-pdf-hybrid --port 5002 --force-ocr --ocr-lang "ko,en"
```

支持的语言：`en`, `ko`, `ja`, `ch_sim`, `ch_tra`, `de`, `fr`, `ar` 等。

### 公式提取（LaTeX）

从科学PDF中提取数学公式为LaTeX：

```bash
# 服务器端：启用公式增强
opendataloader-pdf-hybrid --enrich-formula

# 一次调用中批量处理所有文件 — 每次调用都会启动一个JVM进程，重复调用会很慢
opendataloader-pdf --hybrid docling-fast --hybrid-mode full file1.pdf file2.pdf folder/
```

JSON输出示例：
```json
{
  "type": "formula",
  "page number": 1,
  "bounding box": [226.2, 144.7, 377.1, 168.7],
  "content": "\\frac{f(x+h) - f(x)}{h}"
}
```

> **注意**：公式和图片描述增强需要客户端指定 `--hybrid-mode full`。

### 图表与图片描述

为图表和图片生成AI描述 — 适用于RAG搜索和无障碍替代文本：

```bash
# 服务器端
opendataloader-pdf-hybrid --enrich-picture-description

# 一次调用中批量处理所有文件 — 每次调用都会启动一个JVM进程，重复调用会很慢
opendataloader-pdf --hybrid docling-fast --hybrid-mode full file1.pdf file2.pdf folder/
```

JSON输出示例：
```json
{
  "type": "picture",
  "page number": 1,
  "bounding box": [72.0, 400.0, 540.0, 650.0],
  "description": "A bar chart showing waste generation by region from 2016 to 2030..."
}
```

> 使用轻量级视觉模型SmolVLM（256M）。通过 `--picture-description-prompt` 支持自定义提示词。

### Hancom Data Loader集成 — 即将推出

通过 [Hancom Data Loader](https://sdk.hancom.com/en/services/1?utm_source=github&utm_medium=readme&utm_campaign=opendataloader-pdf) 实现企业级AI文档分析 — 针对您特定领域文档训练的客户定制模型。支持30+种元素类型（表格、图表、公式、标题、脚注等）、基于VLM的图片/图表理解、复杂表格提取（合并单元格、嵌套表格）、带SLA的扫描件OCR，以及原生HWP/HWPX支持。支持PDF、DOCX、XLSX、PPTX、HWP、PNG、JPG。[在线演示](https://livedemo.sdk.hancom.com/en/dataloader?utm_source=github&utm_medium=readme&utm_campaign=opendataloader-pdf)

[混合模式指南](https://opendataloader.org/docs/hybrid-mode)

## 输出格式

| 格式 | 使用场景 |
|------|----------|
| **JSON** | 带边界框和语义类型的结构化数据 |
| **Markdown** | 用于LLM上下文的纯文本、RAG分块 |
| **HTML** | 带样式的网页展示 |
| **带标注的PDF** | 可视化调试 — 查看检测到的结构（[示例](https://opendataloader.org/demo/samples/01030000000000)） |
| **Text** | 纯文本提取 |

组合格式：`format="json,markdown"`

### JSON输出示例

```json
{
  "type": "heading",
  "id": 42,
  "level": "Title",
  "page number": 1,
  "bounding box": [72.0, 700.0, 540.0, 730.0],
  "heading level": 1,
  "font": "Helvetica-Bold",
  "font size": 24.0,
  "text color": "[0.0]",
  "content": "Introduction"
}
```

| 字段 | 描述 |
|------|------|
| `type` | 元素类型：heading, paragraph, table, list, image, caption, formula |
| `id` | 用于交叉引用的唯一标识符 |
| `page number` | 页码（从1开始） |
| `bounding box` | `[左, 下, 右, 上]`，单位为PDF点（72点 = 1英寸） |
| `heading level` | 标题深度（1及以上） |
| `content` | 提取的文本 |

[完整JSON Schema](https://opendataloader.org/docs/json-schema)

## 高级功能

### Tagged PDF支持

当PDF包含结构标签时，OpenDataLoader会提取**作者意图的精确布局** — 无需猜测或启发式。标题、列表、表格和阅读顺序均从源文档中保留。

```python
# 一次调用中批量处理所有文件 — 每次convert()都会启动一个JVM进程，重复调用会很慢
opendataloader_pdf.convert(
    input_path=["file1.pdf", "file2.pdf", "folder/"],
    output_dir="output/",
    use_struct_tree=True           # 使用原生PDF结构标签
)
```

大多数PDF解析器完全忽略结构标签。[了解更多](https://opendataloader.org/docs/tagged-pdf)

### AI安全：提示注入防护

PDF可能包含隐藏的提示注入攻击。OpenDataLoader自动过滤：

- 隐藏文本（透明、零号字体）
- 页面外内容
- 可疑的不可见层

如需对敏感数据（电子邮件、URL、电话号码 → 占位符）进行脱敏，请显式启用：

```bash
# 一次调用中批量处理所有文件 — 每次调用都会启动一个JVM进程，重复调用会很慢
opendataloader-pdf file1.pdf file2.pdf folder/ --sanitize
```

[AI安全指南](https://opendataloader.org/docs/ai-safety)

### LangChain集成

```bash
pip install -U langchain-opendataloader-pdf
```

```python
from langchain_opendataloader_pdf import OpenDataLoaderPDFLoader

loader = OpenDataLoaderPDFLoader(
    file_path=["file1.pdf", "file2.pdf", "folder/"],
    format="text"
)
documents = loader.load()
```

[LangChain文档](https://docs.langchain.com/oss/python/integrations/document_loaders/opendataloader_pdf) | [GitHub](https://github.com/opendataloader-project/langchain-opendataloader-pdf) | [PyPI](https://pypi.org/project/langchain-opendataloader-pdf/)

### 高级选项

```python
# 一次调用中批量处理所有文件 — 每次convert()都会启动一个JVM进程，重复调用会很慢
opendataloader_pdf.convert(
    input_path=["file1.pdf", "file2.pdf", "folder/"],
    output_dir="output/",
    format="json,markdown,pdf",
    image_output="embedded",        # "off", "embedded"（Base64）, 或 "external"（默认）
    image_format="jpeg",            # "png" 或 "jpeg"
    use_struct_tree=True,           # 使用原生PDF结构
)
```

[完整CLI选项参考](https://opendataloader.org/docs/cli-options-reference)

## PDF无障碍与PDF/UA转换

**问题**：现有数百万PDF缺乏结构标签，无法满足无障碍法规（EAA、ADA/Section 508、韩国数字包容法）。手动修复每份文档成本$50–200，无法规模化。

**OpenDataLoader的方案**：与[PDF协会](https://pdfa.org)及[Dual Lab](https://duallab.com)（[veraPDF](https://verapdf.org)的开发者，veraPDF是行业参考的开源PDF/A和PDF/UA验证器）合作构建。自动标记遵循[Well-Tagged PDF规范](https://pdfa.org/resource/well-tagged-pdf/)，并使用veraPDF进行程序化验证 — 自动检查PDF无障碍标准的符合性，而非人工审查。目前没有其他开源工具能够端到端生成Tagged PDF — 大多数依赖专有SDK完成标签写入步骤。OpenDataLoader在Apache 2.0许可证下完成全部工作。（[合作详情](https://opendataloader.org/docs/tagged-pdf-collaboration)）

| 法规 | 截止日期 | 要求 |
|------|----------|------|
| **欧洲无障碍法案（EAA）** | 2025年6月28日 | 欧盟范围内的无障碍数字产品 |
| **ADA与Section 508** | 已生效 | 美国联邦机构和公共场所 |
| **数字包容法** | 已生效 | 韩国数字服务无障碍 |

### 标准与验证

| 方面 | 详情 |
|------|------|
| **规范** | PDF协会的[Well-Tagged PDF](https://pdfa.org/resource/well-tagged-pdf/) |
| **验证** | [veraPDF](https://verapdf.org) — 行业参考的开源PDF/A和PDF/UA验证器 |
| **合作** | PDF协会 + [Dual Lab](https://duallab.com)（veraPDF开发者）共同开发标记和验证 |
| **许可证** | 自动标记 → Tagged PDF：Apache 2.0（免费）。PDF/UA导出：企业版 |

### 无障碍流水线

| 步骤 | 功能 | 状态 | 层级 |
|------|------|------|------|
| 1. **审计** | 读取现有PDF标签，检测未标记PDF | 已发布 | 免费 |
| 2. **自动标记 → Tagged PDF** | 为未标记PDF生成结构标签 | 预计2026年Q2 | 免费（Apache 2.0） |
| 3. **导出PDF/UA** | 转换为符合PDF/UA-1或PDF/UA-2的文件 | 💼 可用 | 企业版 |
| 4. **可视化编辑** | 无障碍工作室 — 审查和修复标签 | 💼 可用 | 企业版 |

> **💼 企业功能**可按需获取。[联系我们](https://opendataloader.org/contact)开始使用。

### 自动标记预览（预计2026年Q2）

```python
# API形态预览 — 2026年Q2可用
opendataloader_pdf.convert(
    input_path=["file1.pdf", "file2.pdf", "folder/"],
    output_dir="output/",
    auto_tag=True                   # 为未标记PDF生成结构标签
)
```

### 端到端合规工作流

```
现有PDF（未标记）
    │
    ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  1. 审计        │───>│  2. 自动标记     │───>│  3. 导出         │───>│  4. 工作室       │
│  （检查标签）    │    │  （→ Tagged PDF） │    │  （PDF/UA）      │    │  （可视化编辑器）│
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
        │                      │                      │                      │
        ▼                      ▼                      ▼                      ▼
  use_struct_tree         auto_tag              PDF/UA导出         无障碍工作室
  （现已可用）      （2026年Q2, Apache 2.0）    （企业版）            （企业版）
```

[PDF无障碍指南](https://opendataloader.org/docs/accessibility-compliance)

## 路线图

| 功能 | 时间线 | 层级 |
|------|--------|------|
| **自动标记 → Tagged PDF** — 从未标记PDF生成Tagged PDF | 2026年Q2 | 免费 |
| **[Hancom Data Loader](https://sdk.hancom.com/en/services/1?utm_source=github&utm_medium=readme&utm_campaign=opendataloader-pdf)** — 企业级AI文档分析、客户定制模型、基于VLM的图表/图片理解、生产级OCR | 2026年Q2-Q3 | 计划中 |
| **结构验证** — 验证PDF标签树 | 2026年Q2 | 计划中 |

[完整路线图](https://opendataloader.org/docs/upcoming-roadmap)

## 常见问题

### 什么是RAG的最佳PDF解析器？

对于RAG流水线，你需要一个能够保留文档结构、保持正确阅读顺序并提供元素坐标用于引用的解析器。OpenDataLoader正是为此设计 — 它输出带边界框的结构化JSON，通过XY-Cut++处理多栏布局，无需GPU即可本地运行。在混合模式下，它在基准测试中整体排名第一（0.907）。

### 什么是最好的开源PDF解析器？

OpenDataLoader PDF是唯一结合了以下特性的开源解析器：基于规则的确定性提取（无需GPU）、每个元素带边界框、XY-Cut++阅读顺序、内置AI安全过滤器、原生Tagged PDF支持，以及用于复杂文档的混合AI模式。它在整体准确率上排名第一（0.907），同时可在CPU上本地运行。

### 如何为LLM从PDF中提取表格？

OpenDataLoader通过边界分析和文本聚类检测表格，保留行/列结构。对于复杂表格，启用混合模式可将准确率提升90%以上（TEDS分数从0.489提升至0.928）：

```python
# 一次调用中批量处理所有文件 — 每次convert()都会启动一个JVM进程，重复调用会很慢
opendataloader_pdf.convert(
    input_path=["file1.pdf", "file2.pdf", "folder/"],
    output_dir="output/",
    format="json",
    hybrid="docling-fast"           # 用于复杂表格
)
```

### 与docling、marker或pymupdf4llm相比如何？

OpenDataLoader [混合模式] 在阅读顺序、表格和标题准确率上整体排名第一（0.907）。主要差异：docling（0.882）表现不错但缺少边界框和AI安全过滤器。marker（0.861）需要GPU且速度慢1000倍（53.932秒/页）。pymupdf4llm（0.732）速度快但表格（0.401）和标题（0.412）准确率低。OpenDataLoader是唯一结合了确定性本地提取、每个元素带边界框和内置提示注入保护的解析器。查看[完整基准测试](https://github.com/opendataloader-project/opendataloader-bench)。

### 我可以在不将数据发送到云端的情况下使用吗？

可以。OpenDataLoader 100%本地运行。没有API调用，没有数据传输 — 你的文档永远不会离开你的环境。混合模式后端也在你的机器上本地运行。适用于法律、医疗和金融文档。

### 支持扫描件PDF的OCR吗？

支持，通过混合模式。使用 `pip install "opendataloader-pdf[hybrid]"` 安装，用 `--force-ocr` 启动后端，然后照常处理。支持多种语言，包括韩语、日语、中文、阿拉伯语等，通过 `--ocr-lang` 指定。

### 支持韩文、日文或中文文档吗？

支持。对于数字PDF，文本提取开箱即用。对于扫描件PDF，使用混合模式并指定 `--force-ocr --ocr-lang "ko,en"`（或 `ja`, `ch_sim`, `ch_tra`）。即将推出：[Hancom Data Loader](https://sdk.hancom.com/en/services/1?utm_source=github&utm_medium=readme&utm_campaign=opendataloader-pdf) 集成 — 企业级AI文档分析，内置生产级OCR和针对特定文档类型与工作流优化的客户定制模型。

### 速度有多快？

本地模式在CPU上每秒处理60页以上（0.02秒/页）。混合模式每秒处理2页以上（0.46秒/页），但对于复杂文档的准确率显著更高。不需要GPU。基准测试在Apple M4上完成。[完整基准测试详情](https://github.com/opendataloader-project/opendataloader-bench)。通过多进程批量处理，在8核以上机器上吞吐量可超过每秒100页。

### 能处理多栏布局吗？

可以。OpenDataLoader使用XY-Cut++阅读顺序分析，在多栏页面、侧边栏和混合布局中正确排序文本。本地模式和混合模式均支持，无需任何配置。

### 什么是混合模式？

混合模式结合了快速的本地Java处理与AI后端。简单页面在本地处理（0.02秒/页）；复杂页面（表格、扫描内容、公式、图表）自动路由到AI后端以获得更高准确率。后端在你的机器上本地运行 — 无需云端。请参阅[应该使用哪种模式？](#which-mode-should-i-use)和[混合模式指南](https://opendataloader.org/docs/hybrid-mode)。

### 支持LangChain吗？

支持。安装 `langchain-opendataloader-pdf` 即可获得官方LangChain文档加载器集成。参见[LangChain文档](https://docs.langchain.com/oss/python/integrations/document_loaders/opendataloader_pdf)。

### 如何为RAG对PDF进行分块？

OpenDataLoader输出结构化的Markdown，保留标题、表格和列表 — 是语义分块的理想输入。JSON输出中的每个元素都包含 `type`、`heading level` 和 `page number`，因此你可以按章节或页面边界进行拆分。对于大多数RAG流水线：使用 `format="markdown"` 进行文本分块，或使用 `format="json"` 进行元素级控制。配合LangChain的 `RecursiveCharacterTextSplitter` 或你自己的基于标题的分割器，可获得最佳效果。

### 如何在RAG回答中引用PDF来源？

JSON输出中的每个元素都包含 `bounding box`（`[左, 下, 右, 上]`，单位PDF点）和 `page number`。当你的RAG流水线返回答案时，将源块映射回其边界框，即可在原始PDF中高亮显示确切位置。这实现了“点击查看来源”的用户体验 — 用户可以看到答案来自哪个段落、表格或图片。没有其他开源解析器默认提供每个元素的边界框。

### 如何将PDF转换为Markdown供LLM使用？

```python
import opendataloader_pdf

# 一次调用中批量处理所有文件 — 每次convert()都会启动一个JVM进程，重复调用会很慢
opendataloader_pdf.convert(
    input_path=["file1.pdf", "file2.pdf", "folder/"],
    output_dir="output/",
    format="markdown"
)
```

OpenDataLoader在Markdown输出中保留标题层级、表格结构和阅读顺序。对于带有无框表格或扫描页面的复杂文档，使用混合模式（`hybrid="docling-fast"`）可获得更高准确率。输出足够干净，可以直接送入LLM上下文窗口或RAG分块流水线。

### 有自动化的PDF无障碍修复工具吗？

有。OpenDataLoader是首个端到端自动化PDF无障碍的开源工具。与[PDF协会](https://pdfa.org)及[Dual Lab](https://duallab.com)（veraPDF开发者）合作构建，自动标记遵循Well-Tagged PDF规范，并使用veraPDF进行程序化验证。布局分析引擎检测文档结构（标题、表格、列表、阅读顺序）并自动生成无障碍标签。自动标记（2026年Q2）将未标记PDF转换为Tagged PDF，基于Apache 2.0许可证 — 不依赖专有SDK。对于需要完整PDF/UA合规的组织，企业插件提供PDF/UA导出和可视化标签编辑器。这取代了通常每份文档成本$50–200+的手动修复工作流。

### 这真的是首个开源的PDF自动标记工具吗？

是的。现有工具要么依赖专有SDK写入结构标签，要么只输出非PDF格式（例如Docling输出Markdown/JSON但无法生成Tagged PDF），要么需要人工干预。OpenDataLoader是首个完全在开源许可证（Apache 2.0）下完成布局分析 → 标签生成 → Tagged PDF输出的工具，无任何专有依赖。自动标记遵循PDF协会的Well-Tagged PDF规范，并使用行业参考的开源PDF/A和PDF/UA验证器veraPDF进行验证。

### 如何将现有PDF转换为PDF/UA？

OpenDataLoader提供端到端流水线：审计现有PDF的标签（`use_struct_tree=True`），对未标记PDF进行自动标记生成Tagged PDF（2026年Q2，Apache 2.0免费），然后导出为PDF/UA-1或PDF/UA-2（企业插件）。自动标记遵循PDF协会的Well-Tagged PDF规范，并使用veraPDF验证。自动标记生成Tagged PDF；PDF/UA导出是最后一步。[联系我们](https://opendataloader.org/contact)获取企业集成。

### 如何使我的PDF符合EAA无障碍要求？

欧洲无障碍法案要求到2025年6月28日实现数字产品无障碍。OpenDataLoader支持完整的修复工作流：审计 → 自动标记 → Tagged PDF → PDF/UA导出。自动标记遵循PDF协会的Well-Tagged PDF规范，并使用veraPDF验证，确保输出符合标准。自动标记生成Tagged PDF将在Apache 2.0许可证下开源（2026年Q2）。PDF/UA导出和无障碍工作室为企业插件。请参阅我们的[无障碍指南](https://opendataloader.org/docs/accessibility-compliance)。

### OpenDataLoader PDF是免费的吗？

核心库是**基于Apache 2.0许可证的开源软件** — 可免费用于商业用途。这包括所有提取功能（文本、表格、图片、OCR、公式、图表（通过混合模式））、AI安全过滤器、Tagged PDF支持，以及自动标记生成Tagged PDF（2026年Q2）。我们致力于保持核心无障碍流水线（布局分析 → 自动标记 → Tagged PDF）免费且开源。企业插件（PDF/UA导出、无障碍工作室）适用于需要端到端法规合规的组织。

### 为什么许可证从MPL 2.0改为Apache 2.0？

MPL 2.0要求文件级别的弱著佐权，这往往在企业采用前引发法律审查。Apache 2.0是完全宽松的 — 无著佐权义务，更容易集成到商业项目中。如果你正在使用2.0之前的版本，它仍然遵循MPL 2.0，你可以继续使用。升级到2.0+意味着你的项目遵循Apache 2.0条款，这些条款严格来说更加宽松 — 没有额外的义务，你无需采取任何行动。

## 文档

- [快速开始（Python）](https://opendataloader.org/docs/quick-start-python)
- [快速开始（Node.js）](https://opendataloader.org/docs/quick-start-nodejs)
- [快速开始（Java）](https://opendataloader.org/docs/quick-start-java)
- [JSON Schema参考](https://opendataloader.org/docs/json-schema)
- [CLI选项](https://opendataloader.org/docs/cli-options-reference)
- [混合模式指南](https://opendataloader.org/docs/hybrid-mode)
- [Tagged PDF支持](https://opendataloader.org/docs/tagged-pdf)
- [AI安全功能](https://opendataloader.org/docs/ai-safety)
- [PDF无障碍](https://opendataloader.org/docs/accessibility-compliance)

## 贡献

我们欢迎贡献！请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解指南。

## 许可证

[Apache License 2.0](LICENSE)

> **注意：** 2.0之前的版本遵循 [Mozilla Public License 2.0](https://www.mozilla.org/MPL/2.0/)。

# 参考资料

* any list
{:toc}