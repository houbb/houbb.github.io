---
layout: post 
title: 🚀 RAG-Anything：一站式 RAG 框架
date: 2026-04-21 21:01:55 +0800
categories: [Ai]
tags: [rag, ai]
published: true
---

# 🚀 RAG-Anything：一站式 RAG 框架

## 🌟 系统概述

*下一代多模态智能*

现代文档越来越多地包含多样化的多模态内容 — 文本、图像、表格、公式、图表和多媒体 — 传统的以文本为中心的 RAG 系统无法有效处理这些内容。**RAG-Anything** 通过构建在 [LightRAG](https://github.com/HKUDS/LightRAG) 之上的全面**一站式多模态文档处理 RAG 系统**来应对这一挑战。

作为一个统一的解决方案，RAG-Anything **消除了对多个专用工具的需求**。它在一个集成的框架内提供**跨所有内容模态的无缝处理和查询**。与难以处理非文本元素的传统 RAG 方法不同，我们的一站式系统提供了**全面的多模态检索能力**。

用户可以通过**一个统一的界面**查询包含**交错文本**、**可视化图表**、**结构化表格**和**数学公式**的文档。这种整合方法使得 RAG-Anything 对于学术研究、技术文档、财务报告和企业知识管理特别有价值，在这些场景中，丰富的混合内容文档需要一个**统一的处理框架**。

### 🎯 主要特性

- **🔄 端到端多模态流水线** - 从文档摄入、解析到智能多模态问答的完整工作流
- **📄 通用文档支持** - 无缝处理 PDF、Office 文档、图像和多种文件格式
- **🧠 专用内容分析** - 针对图像、表格、数学公式和异构内容类型的专用处理器
- **🔗 多模态知识图谱** - 自动实体提取和跨模态关系发现，增强理解
- **⚡ 自适应处理模式** - 灵活的基于 MinerU 的解析或直接的多模态内容注入工作流
- **📋 直接内容列表插入** - 绕过文档解析，直接插入来自外部源的预解析内容列表
- **🎯 混合智能检索** - 跨文本和多模态内容的先进搜索能力，具备上下文理解


## 🏗️ 算法与架构

### 核心算法

**RAG-Anything** 实现了一个高效的**多阶段多模态流水线**，通过智能编排和跨模态理解，从根本上扩展了传统的 RAG 架构，以无缝处理多样化的内容模态。

### 1. 文档解析阶段

系统通过自适应内容分解提供高保真文档提取。它在保留上下文关系的同时智能地分割异构元素。通过专门优化的解析器实现通用格式兼容性。

**关键组件：**

- **⚙️ MinerU 集成**：利用 [MinerU](https://github.com/opendatalab/MinerU) 进行高保真文档结构提取，并在复杂布局中保持语义。

- **🧩 自适应内容分解**：自动将文档分割为连贯的文本块、视觉元素、结构化表格、数学公式和专门内容类型，同时保留上下文关系。

- **📁 通用格式支持**：通过具有格式特定优化的专用解析器，全面处理 PDF、Office 文档（DOC/DOCX/PPT/PPTX/XLS/XLSX）、图像和新兴格式。

</div>

### 2. 多模态内容理解与处理

系统自动分类并通过优化通道路由内容。它使用并发流水线进行并行文本和多模态处理。在转换过程中保留文档层次结构和关系。

**关键组件：**

- **🎯 自主内容分类与路由**：自动识别、分类不同内容类型，并通过优化的执行通道进行路由。

- **⚡ 并发多流水线架构**：通过专用处理流水线实现文本和多模态内容的并发执行。这种方法在最大化吞吐效率的同时保持内容完整性。

- **🏗️ 文档层次结构提取**：在内容转换过程中提取并保留原始文档层次结构和元素间关系。

</div>

### 3. 多模态分析引擎

系统部署针对异构数据模态的模态感知处理单元：

**专用分析器：**

- **🔍 视觉内容分析器**：
  - 集成视觉模型进行图像分析。
  - 基于视觉语义生成上下文感知的描述性标题。
  - 提取视觉元素之间的空间关系和层次结构。

- **📊 结构化数据解释器**：
  - 对表格和结构化数据格式进行系统化解释。
  - 实现用于数据趋势分析的统计模式识别算法。
  - 识别多个表格数据集之间的语义关系和依赖关系。

- **📐 数学表达式解析器**：
  - 高精度解析复杂的数学表达式和公式。
  - 提供原生 LaTeX 格式支持，与学术工作流无缝集成。
  - 建立数学方程与特定领域知识库之间的概念映射。

- **🔧 可扩展模态处理器**：
  - 为自定义和新兴内容类型提供可配置的处理框架。
  - 通过插件架构支持新模态处理器的动态集成。
  - 支持针对专业用例的处理流水线运行时配置。

</div>

### 4. 多模态知识图谱索引

多模态知识图谱构建模块将文档内容转换为结构化的语义表示。它提取多模态实体，建立跨模态关系，并保留层次化组织。系统应用加权相关性评分以优化知识检索。

**核心功能：**

- **🔍 多模态实体提取**：将重要的多模态元素转换为结构化的知识图谱实体。该过程包括语义标注和元数据保留。

- **🔗 跨模态关系映射**：在文本实体和多模态组件之间建立语义连接和依赖关系。这是通过自动关系推断算法实现的。

- **🏗️ 层次结构保留**：通过“属于”关系链保留原始文档组织。这些链保留了逻辑内容层次和章节依赖关系。

- **⚖️ 加权关系评分**：为关系类型分配定量相关性分数。评分基于语义邻近度和在文档结构中的上下文重要性。

</div>

### 5. 模态感知检索

混合检索系统结合了向量相似性搜索和图遍历算法，实现全面的内容检索。它实现了模态感知的排序机制，并维护检索元素之间的关系一致性，以确保上下文整合的信息传递。

**检索机制：**

- **🔀 向量-图融合**：将向量相似性搜索与图遍历算法集成。这种方法利用语义嵌入和结构关系进行全面的内容检索。

- **📊 模态感知排序**：实现自适应评分机制，根据内容类型相关性对检索结果进行加权。系统根据查询特定的模态偏好调整排序。

- **🔗 关系一致性维护**：维护检索元素之间的语义和结构关系。这确保了连贯的信息传递和上下文完整性。

</div>

---

## 🚀 快速开始

*开启你的 AI 之旅*

### 安装

#### 选项 1：从 PyPI 安装（推荐）

```bash
# 基础安装
pip install raganything

# 包含可选依赖以扩展格式支持：
pip install 'raganything[all]'              # 所有可选功能
pip install 'raganything[image]'            # 图像格式转换（BMP, TIFF, GIF, WebP）
pip install 'raganything[text]'             # 文本文件处理（TXT, MD）
pip install 'raganything[image,text]'       # 多个功能
```

#### 选项 2：从源码安装
```bash
# 安装 uv（如果尚未安装）
curl -LsSf https://astral.sh/uv/install.sh | sh

# 克隆并使用 uv 设置项目
git clone https://github.com/HKUDS/RAG-Anything.git
cd RAG-Anything

# 在虚拟环境中安装包和依赖项
uv sync

# 如果遇到网络超时（特别是 opencv 包）：
# UV_HTTP_TIMEOUT=120 uv sync

# 直接使用 uv 运行命令（推荐方法）
uv run python examples/raganything_example.py --help

# 安装可选依赖
uv sync --extra image --extra text  # 特定扩展
uv sync --all-extras                 # 所有可选功能
```

#### 可选依赖

- **`[image]`** - 启用 BMP、TIFF、GIF、WebP 图像格式的处理（需要 Pillow）
- **`[text]`** - 启用 TXT 和 MD 文件的处理（需要 ReportLab）
- **`[all]`** - 包含所有 Python 可选依赖

> **⚠️ Office 文档处理要求：**
> - Office 文档（.doc、.docx、.ppt、.pptx、.xls、.xlsx）需要安装 **LibreOffice**
> - 从 [LibreOffice 官方网站](https://www.libreoffice.org/download/download/) 下载
> - **Windows**：从官网下载安装程序
> - **macOS**：`brew install --cask libreoffice`
> - **Ubuntu/Debian**：`sudo apt-get install libreoffice`
> - **CentOS/RHEL**：`sudo yum install libreoffice`

**检查 MinerU 安装：**

```bash
# 验证安装
mineru --version

# 检查是否正确配置
python -c "from raganything import RAGAnything; rag = RAGAnything(); print('✅ MinerU 安装正确' if rag.check_parser_installation() else '❌ MinerU 安装问题')"
```

模型在首次使用时自动下载。如需手动下载，请参阅 [MinerU 模型源配置](https://github.com/opendatalab/MinerU/blob/master/README.md#22-model-source-configuration)。

### 使用示例

#### 1. 端到端文档处理

```python
import asyncio
from raganything import RAGAnything, RAGAnythingConfig
from lightrag.llm.openai import openai_complete_if_cache, openai_embed
from lightrag.utils import EmbeddingFunc

async def main():
    # 设置 API 配置
    api_key = "your-api-key"
    base_url = "your-base-url"  # 可选

    # 创建 RAGAnything 配置
    config = RAGAnythingConfig(
        working_dir="./rag_storage",
        parser="mineru",  # 解析器选择：mineru、docling 或 paddleocr
        parse_method="auto",  # 解析方法：auto、ocr 或 txt
        enable_image_processing=True,
        enable_table_processing=True,
        enable_equation_processing=True,
    )

    # 定义 LLM 模型函数
    def llm_model_func(prompt, system_prompt=None, history_messages=[], **kwargs):
        return openai_complete_if_cache(
            "gpt-4o-mini",
            prompt,
            system_prompt=system_prompt,
            history_messages=history_messages,
            api_key=api_key,
            base_url=base_url,
            **kwargs,
        )

    # 定义用于图像处理的视觉模型函数
    def vision_model_func(
        prompt, system_prompt=None, history_messages=[], image_data=None, messages=None, **kwargs
    ):
        # 如果提供了消息格式（用于多模态 VLM 增强查询），直接使用
        if messages:
            return openai_complete_if_cache(
                "gpt-4o",
                "",
                system_prompt=None,
                history_messages=[],
                messages=messages,
                api_key=api_key,
                base_url=base_url,
                **kwargs,
            )
        # 传统的单图像格式
        elif image_data:
            return openai_complete_if_cache(
                "gpt-4o",
                "",
                system_prompt=None,
                history_messages=[],
                messages=[
                    {"role": "system", "content": system_prompt}
                    if system_prompt
                    else None,
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_data}"
                                },
                            },
                        ],
                    }
                    if image_data
                    else {"role": "user", "content": prompt},
                ],
                api_key=api_key,
                base_url=base_url,
                **kwargs,
            )
        # 纯文本格式
        else:
            return llm_model_func(prompt, system_prompt, history_messages, **kwargs)

    # 定义嵌入函数
    embedding_func = EmbeddingFunc(
        embedding_dim=3072,
        max_token_size=8192,
        func=lambda texts: openai_embed.func(
            texts,
            model="text-embedding-3-large",
            api_key=api_key,
            base_url=base_url,
        ),
    )

    # 初始化 RAGAnything
    rag = RAGAnything(
        config=config,
        llm_model_func=llm_model_func,
        vision_model_func=vision_model_func,
        embedding_func=embedding_func,
    )

    # 处理文档
    await rag.process_document_complete(
        file_path="path/to/your/document.pdf",
        output_dir="./output",
        parse_method="auto"
    )

    # 查询处理后的内容
    # 纯文本查询 - 用于基础知识库搜索
    text_result = await rag.aquery(
        "图表和表格中显示的主要发现是什么？",
        mode="hybrid"
    )
    print("文本查询结果：", text_result)

    # 带有特定多模态内容的多模态查询
    multimodal_result = await rag.aquery_with_multimodal(
        "解释这个公式及其与文档内容的相关性",
        multimodal_content=[{
            "type": "equation",
            "latex": "P(d|q) = \\frac{P(q|d) \\cdot P(d)}{P(q)}",
            "equation_caption": "文档相关性概率"
        }],
        mode="hybrid"
    )
    print("多模态查询结果：", multimodal_result)

if __name__ == "__main__":
    asyncio.run(main())
```

#### 2. 直接多模态内容处理

```python
import asyncio
from lightrag import LightRAG
from lightrag.llm.openai import openai_complete_if_cache, openai_embed
from lightrag.utils import EmbeddingFunc
from raganything.modalprocessors import ImageModalProcessor, TableModalProcessor

async def process_multimodal_content():
    # 设置 API 配置
    api_key = "your-api-key"
    base_url = "your-base-url"  # 可选

    # 初始化 LightRAG
    rag = LightRAG(
        working_dir="./rag_storage",
        llm_model_func=lambda prompt, system_prompt=None, history_messages=[], **kwargs: openai_complete_if_cache(
            "gpt-4o-mini",
            prompt,
            system_prompt=system_prompt,
            history_messages=history_messages,
            api_key=api_key,
            base_url=base_url,
            **kwargs,
        ),
        embedding_func=EmbeddingFunc(
            embedding_dim=3072,
            max_token_size=8192,
            func=lambda texts: openai_embed.func(
                texts,
                model="text-embedding-3-large",
                api_key=api_key,
                base_url=base_url,
            ),
        )
    )
    await rag.initialize_storages()

    # 处理图像
    image_processor = ImageModalProcessor(
        lightrag=rag,
        modal_caption_func=lambda prompt, system_prompt=None, history_messages=[], image_data=None, **kwargs: openai_complete_if_cache(
            "gpt-4o",
            "",
            system_prompt=None,
            history_messages=[],
            messages=[
                {"role": "system", "content": system_prompt} if system_prompt else None,
                {"role": "user", "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}}
                ]} if image_data else {"role": "user", "content": prompt}
            ],
            api_key=api_key,
            base_url=base_url,
            **kwargs,
        ) if image_data else openai_complete_if_cache(
            "gpt-4o-mini",
            prompt,
            system_prompt=system_prompt,
            history_messages=history_messages,
            api_key=api_key,
            base_url=base_url,
            **kwargs,
        )
    )

    image_content = {
        "img_path": "path/to/image.jpg",
        "image_caption": ["图 1：实验结果"],
        "image_footnote": ["2024 年收集的数据"]
    }

    description, entity_info = await image_processor.process_multimodal_content(
        modal_content=image_content,
        content_type="image",
        file_path="research_paper.pdf",
        entity_name="实验结果图"
    )

    # 处理表格
    table_processor = TableModalProcessor(
        lightrag=rag,
        modal_caption_func=lambda prompt, system_prompt=None, history_messages=[], **kwargs: openai_complete_if_cache(
            "gpt-4o-mini",
            prompt,
            system_prompt=system_prompt,
            history_messages=history_messages,
            api_key=api_key,
            base_url=base_url,
            **kwargs,
        )
    )

    table_content = {
        "table_body": """
        | 方法 | 准确率 | F1 分数 |
        |--------|----------|----------|
        | RAGAnything | 95.2% | 0.94 |
        | 基线 | 87.3% | 0.85 |
        """,
        "table_caption": ["性能比较"],
        "table_footnote": ["测试数据集上的结果"]
    }

    description, entity_info = await table_processor.process_multimodal_content(
        modal_content=table_content,
        content_type="table",
        file_path="research_paper.pdf",
        entity_name="性能结果表"
    )

if __name__ == "__main__":
    asyncio.run(process_multimodal_content())
```

#### 3. 批量处理

```python
# 处理多个文档
await rag.process_folder_complete(
    folder_path="./documents",
    output_dir="./output",
    file_extensions=[".pdf", ".docx", ".pptx"],
    recursive=True,
    max_workers=4
)
```

#### 4. 自定义模态处理器

```python
from raganything.modalprocessors import GenericModalProcessor

class CustomModalProcessor(GenericModalProcessor):
    async def process_multimodal_content(self, modal_content, content_type, file_path, entity_name):
        # 你的自定义处理逻辑
        enhanced_description = await self.analyze_custom_content(modal_content)
        entity_info = self.create_custom_entity(enhanced_description, entity_name)
        return await self._create_entity_and_chunk(enhanced_description, entity_info, file_path)
```

#### 5. 查询选项

RAG-Anything 提供三种类型的查询方法：

**纯文本查询** - 使用 LightRAG 直接进行知识库搜索：
```python
# 文本查询的不同模式
text_result_hybrid = await rag.aquery("你的问题", mode="hybrid")
text_result_local = await rag.aquery("你的问题", mode="local")
text_result_global = await rag.aquery("你的问题", mode="global")
text_result_naive = await rag.aquery("你的问题", mode="naive")

# 同步版本
sync_text_result = rag.query("你的问题", mode="hybrid")
```

**VLM 增强查询** - 使用 VLM 自动分析检索上下文中的图像：
```python
# VLM 增强查询（当提供 vision_model_func 时自动启用）
vlm_result = await rag.aquery(
    "分析文档中的图表和图形",
    mode="hybrid"
    # 当 vision_model_func 可用时，vlm_enhanced=True 自动设置
)

# 手动控制 VLM 增强
vlm_enabled = await rag.aquery(
    "这个文档中的图像显示了什么？",
    mode="hybrid",
    vlm_enhanced=True  # 强制启用 VLM 增强
)

vlm_disabled = await rag.aquery(
    "这个文档中的图像显示了什么？",
    mode="hybrid",
    vlm_enhanced=False  # 强制禁用 VLM 增强
)

# 当文档包含图像时，VLM 可以直接看到并分析它们
# 系统将自动：
# 1. 检索包含图像路径的相关上下文
# 2. 加载图像并编码为 base64
# 3. 将文本上下文和图像一起发送给 VLM 进行综合分析
```

**多模态查询** - 带有特定多模态内容分析的增强查询：
```python
# 带表格数据的查询
table_result = await rag.aquery_with_multimodal(
    "将这些性能指标与文档内容进行比较",
    multimodal_content=[{
        "type": "table",
        "table_data": """方法,准确率,速度
                        RAGAnything,95.2%,120ms
                        传统方法,87.3%,180ms""",
        "table_caption": "性能比较"
    }],
    mode="hybrid"
)

# 带公式内容的查询
equation_result = await rag.aquery_with_multimodal(
    "解释这个公式及其与文档内容的相关性",
    multimodal_content=[{
        "type": "equation",
        "latex": "P(d|q) = \\frac{P(q|d) \\cdot P(d)}{P(q)}",
        "equation_caption": "文档相关性概率"
    }],
    mode="hybrid"
)
```

#### 6. 加载现有的 LightRAG 实例

```python
import asyncio
from raganything import RAGAnything, RAGAnythingConfig
from lightrag import LightRAG
from lightrag.llm.openai import openai_complete_if_cache, openai_embed
from lightrag.kg.shared_storage import initialize_pipeline_status
from lightrag.utils import EmbeddingFunc
import os

async def load_existing_lightrag():
    # 设置 API 配置
    api_key = "your-api-key"
    base_url = "your-base-url"  # 可选

    # 首先，创建或加载现有的 LightRAG 实例
    lightrag_working_dir = "./existing_lightrag_storage"

    # 检查是否已存在 LightRAG 实例
    if os.path.exists(lightrag_working_dir) and os.listdir(lightrag_working_dir):
        print("✅ 找到现有的 LightRAG 实例，正在加载...")
    else:
        print("❌ 未找到现有的 LightRAG 实例，将创建新实例")

    # 使用你的配置创建/加载 LightRAG 实例
    lightrag_instance = LightRAG(
        working_dir=lightrag_working_dir,
        llm_model_func=lambda prompt, system_prompt=None, history_messages=[], **kwargs: openai_complete_if_cache(
            "gpt-4o-mini",
            prompt,
            system_prompt=system_prompt,
            history_messages=history_messages,
            api_key=api_key,
            base_url=base_url,
            **kwargs,
        ),
        embedding_func=EmbeddingFunc(
            embedding_dim=3072,
            max_token_size=8192,
            func=lambda texts: openai_embed.func(
                texts,
                model="text-embedding-3-large",
                api_key=api_key,
                base_url=base_url,
            ),
        )
    )

    # 初始化存储（如果存在现有数据，这将加载它）
    await lightrag_instance.initialize_storages()
    await initialize_pipeline_status()

    # 定义用于图像处理的视觉模型函数
    def vision_model_func(
        prompt, system_prompt=None, history_messages=[], image_data=None, messages=None, **kwargs
    ):
        # 如果提供了消息格式（用于多模态 VLM 增强查询），直接使用
        if messages:
            return openai_complete_if_cache(
                "gpt-4o",
                "",
                system_prompt=None,
                history_messages=[],
                messages=messages,
                api_key=api_key,
                base_url=base_url,
                **kwargs,
            )
        # 传统的单图像格式
        elif image_data:
            return openai_complete_if_cache(
                "gpt-4o",
                "",
                system_prompt=None,
                history_messages=[],
                messages=[
                    {"role": "system", "content": system_prompt}
                    if system_prompt
                    else None,
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_data}"
                                },
                            },
                        ],
                    }
                    if image_data
                    else {"role": "user", "content": prompt},
                ],
                api_key=api_key,
                base_url=base_url,
                **kwargs,
            )
        # 纯文本格式
        else:
            return lightrag_instance.llm_model_func(prompt, system_prompt, history_messages, **kwargs)

    # 现在使用现有的 LightRAG 实例初始化 RAGAnything
    rag = RAGAnything(
        lightrag=lightrag_instance,  # 传递现有的 LightRAG 实例
        vision_model_func=vision_model_func,
        # 注意：working_dir、llm_model_func、embedding_func 等从 lightrag_instance 继承
    )

    # 查询现有的知识库
    result = await rag.aquery(
        "这个 LightRAG 实例中处理了哪些数据？",
        mode="hybrid"
    )
    print("查询结果：", result)

    # 向现有的 LightRAG 实例添加新的多模态文档
    await rag.process_document_complete(
        file_path="path/to/new/multimodal_document.pdf",
        output_dir="./output"
    )

if __name__ == "__main__":
    asyncio.run(load_existing_lightrag())
```

#### 7. 直接内容列表插入

对于已有预解析内容列表的场景（例如来自外部解析器或之前的处理），你可以直接将其插入到 RAGAnything 中，而无需文档解析：

```python
import asyncio
from raganything import RAGAnything, RAGAnythingConfig
from lightrag.llm.openai import openai_complete_if_cache, openai_embed
from lightrag.utils import EmbeddingFunc

async def insert_content_list_example():
    # 设置 API 配置
    api_key = "your-api-key"
    base_url = "your-base-url"  # 可选

    # 创建 RAGAnything 配置
    config = RAGAnythingConfig(
        working_dir="./rag_storage",
        enable_image_processing=True,
        enable_table_processing=True,
        enable_equation_processing=True,
    )

    # 定义模型函数
    def llm_model_func(prompt, system_prompt=None, history_messages=[], **kwargs):
        return openai_complete_if_cache(
            "gpt-4o-mini",
            prompt,
            system_prompt=system_prompt,
            history_messages=history_messages,
            api_key=api_key,
            base_url=base_url,
            **kwargs,
        )

    def vision_model_func(prompt, system_prompt=None, history_messages=[], image_data=None, messages=None, **kwargs):
        # 如果提供了消息格式（用于多模态 VLM 增强查询），直接使用
        if messages:
            return openai_complete_if_cache(
                "gpt-4o",
                "",
                system_prompt=None,
                history_messages=[],
                messages=messages,
                api_key=api_key,
                base_url=base_url,
                **kwargs,
            )
        # 传统的单图像格式
        elif image_data:
            return openai_complete_if_cache(
                "gpt-4o",
                "",
                system_prompt=None,
                history_messages=[],
                messages=[
                    {"role": "system", "content": system_prompt} if system_prompt else None,
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}}
                        ],
                    } if image_data else {"role": "user", "content": prompt},
                ],
                api_key=api_key,
                base_url=base_url,
                **kwargs,
            )
        # 纯文本格式
        else:
            return llm_model_func(prompt, system_prompt, history_messages, **kwargs)

    embedding_func = EmbeddingFunc(
        embedding_dim=3072,
        max_token_size=8192,
        func=lambda texts: openai_embed.func(
            texts,
            model="text-embedding-3-large",
            api_key=api_key,
            base_url=base_url,
        ),
    )

    # 初始化 RAGAnything
    rag = RAGAnything(
        config=config,
        llm_model_func=llm_model_func,
        vision_model_func=vision_model_func,
        embedding_func=embedding_func,
    )

    # 示例：来自外部源的预解析内容列表
    content_list = [
        {
            "type": "text",
            "text": "这是我们研究论文的引言部分。",
            "page_idx": 0  # 此内容出现的页码
        },
        {
            "type": "image",
            "img_path": "/absolute/path/to/figure1.jpg",  # 重要：使用绝对路径
            "image_caption": ["图 1：系统架构"],
            "image_footnote": ["来源：作者的原创设计"],
            "page_idx": 1  # 此图像出现的页码
        },
        {
            "type": "table",
            "table_body": "| 方法 | 准确率 | F1 分数 |\n|--------|----------|----------|\n| 我们的方法 | 95.2% | 0.94 |\n| 基线 | 87.3% | 0.85 |",
            "table_caption": ["表 1：性能比较"],
            "table_footnote": ["测试数据集上的结果"],
            "page_idx": 2  # 此表格出现的页码
        },
        {
            "type": "equation",
            "latex": "P(d|q) = \\frac{P(q|d) \\cdot P(d)}{P(q)}",
            "text": "文档相关性概率公式",
            "page_idx": 3  # 此公式出现的页码
        },
        {
            "type": "text",
            "text": "总之，我们的方法在所有指标上都表现出优越的性能。",
            "page_idx": 4  # 此内容出现的页码
        }
    ]

    # 直接插入内容列表
    await rag.insert_content_list(
        content_list=content_list,
        file_path="research_paper.pdf",  # 用于引用的参考文件名
        split_by_character=None,         # 可选的文本分割字符
        split_by_character_only=False,   # 可选的文本分割模式
        doc_id=None,                     # 可选的自定义文档 ID（如果不提供将自动生成）
        display_stats=True               # 显示内容统计信息
    )

    # 查询插入的内容
    result = await rag.aquery(
        "研究中提到的主要发现和性能指标是什么？",
        mode="hybrid"
    )
    print("查询结果：", result)

    # 你也可以使用不同的文档 ID 插入多个内容列表
    another_content_list = [
        {
            "type": "text",
            "text": "这是另一个文档的内容。",
            "page_idx": 0  # 此内容出现的页码
        },
        {
            "type": "table",
            "table_body": "| 特性 | 值 |\n|---------|-------|\n| 速度 | 快 |\n| 准确率 | 高 |",
            "table_caption": ["特性比较"],
            "page_idx": 1  # 此表格出现的页码
        }
    ]

    await rag.insert_content_list(
        content_list=another_content_list,
        file_path="another_document.pdf",
        doc_id="custom-doc-id-123"  # 自定义文档 ID
    )

if __name__ == "__main__":
    asyncio.run(insert_content_list_example())
```

**内容列表格式：**

`content_list` 应遵循标准格式，每个项是一个字典，包含：

- **文本内容**：`{"type": "text", "text": "内容文本", "page_idx": 0}`
- **图像内容**：`{"type": "image", "img_path": "/绝对/路径/到/image.jpg", "image_caption": ["标题"], "image_footnote": ["注释"], "page_idx": 1}`
- **表格内容**：`{"type": "table", "table_body": "markdown 表格", "table_caption": ["标题"], "table_footnote": ["注释"], "page_idx": 2}`
- **公式内容**：`{"type": "equation", "latex": "LaTeX 公式", "text": "描述", "page_idx": 3}`
- **通用内容**：`{"type": "custom_type", "content": "任意内容", "page_idx": 4}`

**重要说明：**
- **`img_path`**：必须是图像文件的绝对路径（例如 `/home/user/images/chart.jpg` 或 `C:\Users\user\images\chart.jpg`）
- **`page_idx`**：表示内容在原始文档中出现的页码（从 0 开始）
- **内容顺序**：项目按照它们在列表中出现的顺序进行处理

此方法在以下情况下特别有用：
- 你有来自外部解析器（非 MinerU/Docling）的内容
- 你想处理程序生成的内容
- 你需要将来自多个源的内容插入到单个知识库中
- 你有想要重用的缓存解析结果

---

## 🛠️ 示例

*实际实现演示*

`examples/` 目录包含全面的使用示例：

- **`raganything_example.py`**：使用 MinerU 进行端到端文档处理
- **`modalprocessors_example.py`**：直接多模态内容处理
- **`office_document_test.py`**：使用 MinerU 进行 Office 文档解析测试（无需 API 密钥）
- **`image_format_test.py`**：使用 MinerU 进行图像格式解析测试（无需 API 密钥）
- **`text_format_test.py`**：使用 MinerU 进行文本格式解析测试（无需 API 密钥）

**运行示例：**

```bash
# 带解析器选择的端到端处理
python examples/raganything_example.py path/to/document.pdf --api-key YOUR_API_KEY --parser mineru

# 直接模态处理
python examples/modalprocessors_example.py --api-key YOUR_API_KEY

# Office 文档解析测试（仅 MinerU）
python examples/office_document_test.py --file path/to/document.docx

# 图像格式解析测试（仅 MinerU）
python examples/image_format_test.py --file path/to/image.bmp

# 文本格式解析测试（仅 MinerU）
python examples/text_format_test.py --file path/to/document.md

# 检查 LibreOffice 安装
python examples/office_document_test.py --check-libreoffice --file dummy

# 检查 PIL/Pillow 安装
python examples/image_format_test.py --check-pillow --file dummy

# 检查 ReportLab 安装
python examples/text_format_test.py --check-reportlab --file dummy
```

---

## 🔧 配置

*系统优化参数*

### 环境变量

创建一个 `.env` 文件（参考 `.env.example`）：

```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=your_base_url  # 可选
OUTPUT_DIR=./output             # 解析文档的默认输出目录
PARSER=mineru                   # 解析器选择：mineru、docling 或 paddleocr
PARSE_METHOD=auto              # 解析方法：auto、ocr 或 txt
```

**注意：** 为了向后兼容，仍然支持旧的环境变量名称：
- `MINERU_PARSE_METHOD` 已弃用，请使用 `PARSE_METHOD`

> **注意**：API 密钥仅在需要 LLM 集成的完整 RAG 处理时才需要。解析测试文件（`office_document_test.py` 和 `image_format_test.py`）仅测试解析器功能，不需要 API 密钥。

### 解析器配置

RAGAnything 现在支持多种解析器，每种都有特定的优势：

#### MinerU 解析器
- 支持 PDF、图像、Office 文档及更多格式
- 强大的 OCR 和表格提取能力
- 支持 GPU 加速

#### Docling 解析器
- 针对 Office 文档和 HTML 文件进行了优化
- 更好的文档结构保留
- 原生支持多种 Office 格式

#### PaddleOCR 解析器
- 面向图像和 PDF 的 OCR 解析器
- 生成与现有 `content_list` 处理兼容的文本块
- 支持可选的 Office/TXT/MD 解析（先转换为 PDF）

安装 PaddleOCR 解析器扩展：

```bash
pip install -e ".[paddleocr]"
# 或
uv sync --extra paddleocr
```

> **注意**：PaddleOCR 还需要 `paddlepaddle`（CPU/GPU 包因平台而异）。请根据官方指南安装：https://www.paddlepaddle.org.cn/install/quick

### MinerU 配置

```bash
# MinerU 2.0 使用命令行参数代替配置文件
# 查看可用选项：
mineru --help

# 常见配置：
mineru -p input.pdf -o output_dir -m auto    # 自动解析模式
mineru -p input.pdf -o output_dir -m ocr     # 以 OCR 为重点的解析
mineru -p input.pdf -o output_dir -b pipeline --device cuda  # GPU 加速
```

你也可以通过 RAGAnything 参数配置解析：

```python
# 带解析器选择的基本解析配置
await rag.process_document_complete(
    file_path="document.pdf",
    output_dir="./output/",
    parse_method="auto",          # 或 "ocr"、"txt"
    parser="mineru"               # 可选："mineru"、"docling" 或 "paddleocr"
)

# 带特殊参数的高级解析配置
await rag.process_document_complete(
    file_path="document.pdf",
    output_dir="./output/",
    parse_method="auto",          # 解析方法："auto"、"ocr"、"txt"
    parser="mineru",              # 解析器选择："mineru"、"docling" 或 "paddleocr"

    # MinerU 特殊参数 - 所有支持的 kwargs：
    lang="ch",                   # 文档语言，用于 OCR 优化（例如 "ch"、"en"、"ja"）
    device="cuda:0",             # 推理设备："cpu"、"cuda"、"cuda:0"、"npu"、"mps"
    start_page=0,                # 起始页码（从 0 开始，用于 PDF）
    end_page=10,                 # 结束页码（从 0 开始，用于 PDF）
    formula=True,                # 启用公式解析
    table=True,                  # 启用表格解析
    backend="pipeline",          # 解析后端：pipeline|hybrid-auto-engine|hybrid-http-client|vlm-auto-engine|vlm-http-client
    source="huggingface",        # 模型源："huggingface"、"modelscope"、"local"
    # vlm_url="http://127.0.0.1:3000" # 使用 backend=vlm-http-client 时的服务地址

    # 标准 RAGAnything 参数
    display_stats=True,          # 显示内容统计信息
    split_by_character=None,     # 可选的文本分割字符
    doc_id=None                  # 可选的文档 ID
)
```

> **注意**：MinerU 2.0 不再使用 `magic-pdf.json` 配置文件。所有设置现在都作为命令行参数或函数参数传递。RAG-Anything 支持多种文档解析器，包括 MinerU、Docling 和 PaddleOCR。

### 处理要求

不同类型的内容需要特定的可选依赖：

- **Office 文档**（.doc、.docx、.ppt、.pptx、.xls、.xlsx）：安装 [LibreOffice](https://www.libreoffice.org/download/download/)
- **扩展图像格式**（.bmp、.tiff、.gif、.webp）：使用 `pip install raganything[image]` 安装
- **文本文件**（.txt、.md）：使用 `pip install raganything[text]` 安装
- **PaddleOCR 解析器**（`parser="paddleocr"`）：使用 `pip install raganything[paddleocr]` 安装，然后根据你的平台安装 `paddlepaddle`

> **📋 快速安装**：使用 `pip install raganything[all]` 启用所有格式支持（仅限 Python 依赖项 — LibreOffice 仍需单独安装）

---

## 🧪 支持的内容类型

### 文档格式

- **PDF** - 研究论文、报告、演示文稿
- **Office 文档** - DOC、DOCX、PPT、PPTX、XLS、XLSX
- **图像** - JPG、PNG、BMP、TIFF、GIF、WebP
- **文本文件** - TXT、MD

### 多模态元素

- **图像** - 照片、图表、图形、截图
- **表格** - 数据表、比较图、统计摘要
- **公式** - LaTeX 格式的数学公式
- **通用内容** - 通过可扩展处理器支持自定义内容类型

*有关格式特定依赖项的安装，请参阅 [配置](#-配置) 部分。*

# 参考资料

* any list
{:toc}