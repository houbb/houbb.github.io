---
layout: post 
title: K-Dense-AI/scientific-agent-skills 一套即用型Agent技能，适用于研究、科学、工程、分析、金融和写作等领域。
date: 2026-05-17 21:01:55 +0800
categories: [AI]
tags: [ai, agent]
published: true
---

# GitHub - K-Dense-AI/scientific-agent-skills: 一套即用型Agent技能，适用于研究、科学、工程、分析、金融和写作等领域。

## 科学Agent技能

> **Claude Scientific Skills 现已更名为 Scientific Agent Skills。** 技能内容不变，但兼容性更广——现在可与任何支持开放 [Agent Skills](https://agentskills.io/) 标准的AI Agent配合使用，不再仅限于Claude。

> **更新：[K-Dense BYOK](https://github.com/K-Dense-AI/k-dense-byok)** —— 一个免费、开源的AI科研协作者，可在您的桌面运行，由Scientific Agent Skills提供支持。您自带API密钥，从40多种模型中进行选择，即可获得一个完整的研究工作空间，包含网页搜索、文件处理、100多个科学数据库以及本仓库中全部135项技能。您的数据始终保留在您的计算机上，您还可以选择通过 [Modal](https://modal.com/) 将繁重任务扩展到云端计算。 [点击此处开始使用。](https://github.com/K-Dense-AI/k-dense-byok)

这是一套全面的 **135个即用型科学和研究技能**（涵盖癌症基因组学、药物靶点结合、分子动力学、RNA速度、地理空间科学、时间序列预测、通过Hugging Science发现的科学机器学习资源、78+科学数据库等），适用于任何支持开放 [Agent Skills](https://agentskills.io/) 标准的AI Agent，由 [K-Dense](https://k-dense.ai) 创建。可与 **Cursor、Claude Code、Codex 等** 配合使用。将您的AI Agent转变为能够执行生物学、化学、医学等领域复杂多步骤科学研究工作流的研究助手。

***

这些技能使您的AI Agent能够无缝处理多个科学领域的专业科学库、数据库和工具。虽然Agent本身可以自行使用任何Python包或API，但这些明确定义的技能提供了精心整理的使用文档和示例，使其在执行以下工作流时更加强大和可靠：

*   **生物信息学与基因组学** - 序列分析、单细胞RNA测序、基因调控网络、变异注释、系统发育分析
*   **化学信息学与药物发现** - 分子特性预测、虚拟筛选、ADMET分析、分子对接、先导化合物优化
*   **蛋白质组学与质谱分析** - LC-MS/MS处理、肽段鉴定、谱图匹配、蛋白定量
*   **临床研究与精准医学** - 临床试验、药物基因组学、变异解读、药物安全、临床决策支持、治疗规划
*   **医疗AI与临床机器学习** - 电子健康记录分析、生理信号处理、医学影像、临床预测模型
*   **医学影像与数字病理学** - DICOM处理、全切片图像分析、计算病理学、放射学工作流
*   **机器学习与AI** - 深度学习、强化学习、时间序列分析、模型可解释性、贝叶斯方法
*   **材料科学与化学** - 晶体结构分析、相图、代谢模型构建、计算化学
*   **物理学与天文学** - 天文数据分析、坐标转换、宇宙学计算、符号数学、物理计算
*   **工程与仿真** - 离散事件仿真、多目标优化、代谢工程、系统建模、工艺优化
*   **数据分析与可视化** - 统计分析、网络分析、时间序列、可发表级图表、大规模数据处理、探索性数据分析
*   **地理空间科学与遥感** - 卫星图像处理、GIS分析、空间统计、地形分析、地球观测机器学习
*   **实验室自动化** - 液体处理方案、实验设备控制、工作流自动化、LIMS集成
*   **科学传播** - 文献综述、同行评审、科学写作、文档处理、海报、幻灯片、示意图、文献管理
*   **多组学与系统生物学** - 多模态数据整合、通路分析、网络生物学、系统级洞察
*   **蛋白质工程与设计** - 蛋白质语言模型、结构预测、序列设计、功能注释
*   **研究方法论** - 假设生成、科学头脑风暴、批判性思维、基金申请、学者评估

**将您的AI编码Agent转变为桌面上的“AI科学家”！**

> ⭐ **如果您觉得这个仓库有用**，请考虑给它一个Star！这有助于其他人发现这些工具，并鼓励我们继续维护和扩展这个集合。
>
> **刚接触Scientific Agent Skills？** 观看我们的[Scientific Agent Skills入门](https://youtu.be/ZxbnDaD_FVg)视频，快速了解。

***

## 包含内容

本仓库提供 **135个科学和研究技能**，分为以下几类：

*   **100+ 科学与金融数据库** - 一个统一的数据库查询技能提供对78个公共数据库的直接访问（PubChem、ChEMBL、UniProt、COSMIC、ClinicalTrials.gov、FRED、USPTO等），此外还有针对DepMap、Imaging Data Commons、PrimeKG、美国财政部财政数据和Hugging Science（Hugging Face上涵盖17个科学领域的精选科学数据集、模型和演示目录）的专用技能。多数据库软件包如BioServices（约40个生物信息学服务）、BioPython（通过Entrez访问38个NCBI子数据库）和gget（20+基因组数据库）进一步扩大了覆盖范围。
*   **70+ 优化的Python包技能** - 为RDKit、Scanpy、PyTorch Lightning、scikit-learn、BioPython、pyzotero、BioServices、PennyLane、Qiskit、OpenMM、MDAnalysis、scVelo、TimesFM等明确定义的技能——附带精选文档、示例和最佳实践。注意：Agent可以使用 _任何_ Python包编写代码，不仅限于这些；这些技能只是为所列出的包提供了更强大、更可靠的性能。
*   **9 个科学集成技能** - 为Benchling、DNAnexus、LatchBio、OMERO、Protocols.io、Open Notebook等明确定义的技能。同样，Agent不仅限于这些——任何可通过Python访问的API或平台都可以使用；这些技能是预先优化了文档的路径。
*   **30+ 分析与传播工具** - 文献综述、科学写作、同行评审、文档处理、海报、幻灯片、示意图、信息图、Mermaid图表等。
*   **10+ 研究与临床工具** - 假设生成、基金申请、临床决策支持、治疗方案、法规遵从、情景分析。

每个技能包括：
*   ✅ 全面的文档（`SKILL.md`）
*   ✅ 实用的代码示例
*   ✅ 使用案例和最佳实践
*   ✅ 集成指南
*   ✅ 参考资料

***

## 目录

*   [包含内容](#包含内容)
*   [为何使用？](#为何使用)
*   [快速开始](#快速开始)
*   [安全免责声明](#安全免责声明)
*   [支持开源社区](#支持开源社区)
*   [系统要求](#系统要求)
*   [快速示例](#快速示例)
*   [使用案例](#使用案例)
*   [可用技能](#可用技能)
*   [参与贡献](#参与贡献)
*   [故障排除](#故障排除)
*   [常见问题解答](#常见问题解答)
*   [支持](#支持)

***

## 为何使用？

Scientific Agent Skills 通过提供即用型、精心整理的库和平台接口，将AI Agent转变为强大的研究助手。

*   **开箱即用** - 无需为每个新项目重新编写科学库的集成代码。这些技能附带预构建的示例和最佳实践。
*   **经过验证的模式** - 每个技能都包含经过测试的代码模式和工作流，避免了常见陷阱。
*   **跨领域** - 从药物发现到气候科学，跨越多个科学学科的技能。
*   **持续更新** - 随着新库和数据库的出现，技能库会定期扩展。

***

## 快速开始

### 系统要求

*   **AI Agent**：任何支持Agent Skills标准的AI Agent（Cursor、Claude Code、Gemini CLI、Codex等）
*   **系统**：macOS、Linux或带有WSL2的Windows
*   **依赖项**：由各个技能自动处理（具体需求请查看`SKILL.md`文件）

### 安装uv

这些技能使用 `uv` 作为包管理器来安装Python依赖项。请根据您的操作系统使用以下说明进行安装：

**macOS和Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows:**
```bash
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**替代方法（通过pip）:**
```bash
pip install uv
```
安装后，运行以下命令验证是否成功：
```bash
uv --version
```

更多安装选项和详细信息，请访问[官方uv文档](https://docs.astral.sh/uv/)。

***

## 快速示例

安装好技能后，您可以让您的AI Agent执行复杂的多步骤科研工作流。以下是一些示例提示：

### 药物发现流程

**目标**：寻找用于肺癌治疗的新型EGFR抑制剂

**提示**：尽可能使用你可用的技能。查询ChEMBL数据库中IC50 < 50nM的EGFR抑制剂，使用RDKit分析构效关系，使用datamol生成改进类似物，使用DiffDock对AlphaFold EGFR结构进行虚拟筛选，搜索PubMed查找耐药机制，检查COSMIC数据库中的突变，并创建可视化图表和一份全面的报告。

**使用的技能**：ChEMBL、RDKit、datamol、DiffDock、AlphaFold DB、PubMed、COSMIC、科学可视化

_需要云端GPU和最终的可发表级报告？[在K-Dense Web上免费运行。](https://k-dense.ai)_

***

### 单细胞RNA测序分析

**目标**：对10X Genomics数据进行综合分析并整合公共数据

**提示**：尽可能使用你可用的技能。使用Scanpy加载10X数据集，进行质量控制和双细胞去除，整合Cellxgene Census数据，使用NCBI Gene标记识别细胞类型，使用PyDESeq2进行差异表达分析，使用Arboreto推断基因调控网络，通过Reactome/KEGG进行通路富集分析，并使用Open Targets识别治疗靶点。

**使用的技能**：Scanpy、Cellxgene Census、NCBI Gene、PyDESeq2、Arboreto、Reactome、KEGG、Open Targets

_想要零设置的云端执行和可共享的输出？[免费试用K-Dense Web。](https://k-dense.ai)_

***

### 多组学生物标志物发现

**目标**：整合RNA-seq、蛋白质组学和代谢组学数据以预测患者预后

**提示**：尽可能使用你可用的技能。使用PyDESeq2分析RNA-seq数据，使用pyOpenMS处理质谱数据，从HMDB/Metabolomics Workbench整合代谢物数据，将蛋白质映射到通路（UniProt/KEGG），通过STRING数据库查找相互作用，使用statsmodels关联组学层数据，使用scikit-learn构建预测模型，并在ClinicalTrials.gov中搜索相关试验。

**使用的技能**：PyDESeq2、pyOpenMS、HMDB、Metabolomics Workbench、UniProt、KEGG、STRING、statsmodels、scikit-learn、ClinicalTrials.gov

_此流程计算量很大。[在K-Dense Web上使用云端GPU运行，免费试用。](https://k-dense.ai)_

***

### 虚拟筛选活动

**目标**：发现针对蛋白质-蛋白质相互作用的变构调节剂

**提示**：尽可能使用你可用的技能。获取AlphaFold结构，使用BioPython识别相互作用界面，在ZINC数据库中搜索变构候选物（分子量300-500，logP 2-4），使用RDKit进行筛选，使用DiffDock进行对接，使用DeepChem进行排序，检查PubChem供应商，搜索USPTO专利，并使用MedChem/molfeat优化先导化合物。

**使用的技能**：AlphaFold DB、BioPython、ZINC、RDKit、DiffDock、DeepChem、PubChem、USPTO、MedChem/molfeat

***

### 临床基因组学解释

**目标**：评估遗传性癌症风险的临床意义

**提示**：尽可能使用你可用的技能。使用pysam解析VCF文件，使用Ensembl VEP注释变异，查询ClinVar数据库查找致病性信息，检查COSMIC数据库中的癌症突变，从NCBI Gene检索基因信息，使用UniProt分析蛋白质影响，搜索PubMed查找病例报告，检查Open Targets和ClinicalTrials.gov中相关的靶点和试验。

**使用的技能**：pysam、Ensembl VEP、ClinVar、COSMIC、NCBI Gene、UniProt、PubMed、Open Targets、ClinicalTrials.gov

***

## 使用案例

*   **药物发现**：从靶点识别到先导化合物优化的完整筛选流程
*   **癌症研究**：突变分析、药物敏感性预测和标志物发现
*   **单细胞分析**：端到端的scRNA-seq数据处理、分析和解释
*   **临床决策支持**：基于基因组和临床数据的治疗建议
*   **文献综述**：跨多个数据库的自动化综合文献检索和总结
*   **资助申请撰写**：协助撰写和优化研究资助申请
*   **实验设计**：协助设计实验方案，包括样本量计算、功效分析和设计
*   **可发表级图表**：使用matplotlib和seaborn创建可发表级的可视化图表
*   **网络可视化**：使用NetworkX可视化生物网络
*   **报告生成**：使用文档技能生成全面的PDF报告
*   **方案设计**：为自动化液体处理创建Opentrons方案
*   **LIMS集成**：与Benchling和LabArchives集成以进行数据管理
*   **工作流自动化**：自动化多步骤实验室工作流

***

## 可用技能

本仓库包含 **135个科学和研究技能**，按多个领域组织。每个技能都提供全面的文档、代码示例以及使用科学库、数据库和工具的最佳实践。

### 技能类别

> **注意：** 下面列出的Python包和集成技能是 _明确定义_ 的技能——附带文档、示例和最佳实践，以提供更强、更可靠的性能。它们不是上限：Agent可以安装和使用 _任何_ Python包或调用 _任何_ API，即使没有专门的技能。列出的技能只是让常见工作流更快、更可靠。

#### **生物信息学与基因组学**（21+技能）
*   序列分析：BioPython、pysam、scikit-bio、BioServices
*   单细胞分析：Scanpy、AnnData、scvi-tools、scVelo（RNA速度）、Arboreto、Cellxgene Census
*   基因组工具：gget、geniml、gtars、deepTools、FlowIO、Polars-Bio、Zarr、TileDB-VCF
*   差异表达：PyDESeq2
*   系统发育学：ETE Toolkit、Phylogenetics（MAFFT、IQ-TREE 2、FastTree）

#### **化学信息学与药物发现**（10+技能）
*   分子操作：RDKit、Datamol、Molfeat
*   深度学习：DeepChem、TorchDrug
*   对接与筛选：DiffDock
*   分子动力学：OpenMM + MDAnalysis（MD模拟与轨迹分析）
*   云端量子化学：Rowan（pKa、对接、共折叠）
*   药物相似性：MedChem
*   基准测试：PyTDC

#### **蛋白质组学与质谱分析**（2技能）
*   谱图处理：matchms、pyOpenMS

#### **临床研究与精准医学**（8+技能）
*   临床数据库：通过Database Lookup（ClinicalTrials.gov、ClinVar、ClinPGx、COSMIC、FDA、cBioPortal、Monarch等）
*   癌症基因组学：DepMap（癌症依赖性评分、药物敏感性）
*   癌症影像：Imaging Data Commons（NCI放射学和病理学数据集，通过idc-index访问）
*   医疗AI：PyHealth、NeuroKit2、临床决策支持
*   临床文档：临床报告、治疗方案

#### **医学影像与数字病理学**（3技能）
*   DICOM处理：pydicom
*   全切片成像：histolab、PathML

#### **神经科学与电生理学**（1技能）
*   神经记录：Neuropixels-Analysis（细胞外尖峰信号、硅探针、尖峰分类）

#### **机器学习与AI**（16+技能）
*   深度学习：PyTorch Lightning、Transformers、Stable Baselines3、PufferLib
*   经典机器学习：scikit-learn、scikit-survival、SHAP
*   时间序列：aeon、TimesFM（Google的零样本单变量预测基础模型）
*   贝叶斯方法：PyMC
*   优化：PyMOO
*   图机器学习：Torch Geometric
*   降维：UMAP-learn
*   统计建模：statsmodels

#### **材料科学、化学与物理学**（7技能）
*   材料：Pymatgen
*   代谢模型：COBRApy
*   天文学：Astropy
*   量子计算：Cirq、PennyLane、Qiskit、QuTiP

#### **工程与仿真**（4技能）
*   数值计算：MATLAB/Octave
*   计算流体力学：FluidSim
*   离散事件仿真：SimPy
*   符号数学：SymPy

#### **数据分析与可视化**（16+技能）
*   可视化：Matplotlib、Seaborn、科学可视化
*   地理空间分析：GeoPandas、GeoMaster（遥感、GIS、卫星影像、空间机器学习、500+示例）
*   数据处理：Dask、Polars、Vaex
*   网络分析：NetworkX
*   文档处理：文档技能（PDF、DOCX、PPTX、XLSX）
*   信息图：信息图（AI驱动的专业信息图制作）
*   图表：Markdown与Mermaid写作（基于文本的图表作为默认文档标准）
*   探索性数据分析：EDA工作流
*   统计分析：统计分析工作流

#### **实验室自动化**（4技能）
*   液体处理：PyLabRobot
*   云端实验室：Ginkgo Cloud Lab（无细胞蛋白表达、通过自主RAC基础设施实现的荧光像素艺术）
*   方案管理：Protocols.io
*   LIMS集成：Benchling、LabArchives

#### **多组学与系统生物学**（4+技能）
*   通路分析：通过Database Lookup（KEGG、Reactome、STRING）和PrimeKG
*   多组学：HypoGeniC
*   数据管理：LaminDB

#### **蛋白质工程与设计**（3技能）
*   蛋白质语言模型：ESM
*   糖工程：糖工程（N/O-糖基化预测、治疗性抗体优化）
*   云端实验室平台：Adaptyv（自动化蛋白质测试和验证）

#### **科学传播**（20+技能）
*   文献：Paper Lookup（PubMed、PMC、bioRxiv、medRxiv、arXiv、OpenAlex、Crossref、Semantic Scholar、CORE、Unpaywall）、文献综述
*   高级论文搜索：BGPT Paper Search（每篇论文超过25个结构化字段——方法、结果、样本量、质量评分——来自全文，而不仅仅是摘要）
*   网页搜索：Parallel Web（带有引用的综合摘要）
*   研究笔记本：Open Notebook（自托管的NotebookLM替代方案——PDF、视频、音频、网页；16+ AI提供商；多发言人播客生成）
*   写作：科学写作、同行评审
*   文档处理：XLSX、MarkItDown、文档技能
*   出版：Venue Templates
*   演示文稿：科学幻灯片、LaTeX海报、PPTX海报
*   图表：科学示意图、Markdown与Mermaid写作
*   信息图：信息图（10种类型、8种风格、色盲安全调色板）
*   引文：引文管理
*   插图：生成图像（使用FLUX.2 Pro和Gemini 3 Pro（Nano Banana Pro）进行AI图像生成）

#### **科学数据库与数据访问**（6技能 → 总计100+数据库）
> 一个统一的数据库查询技能提供对所有领域78个公共数据库的直接REST API访问。专用技能涵盖专门的数据平台。多数据库软件包如BioServices（约40个生物信息学服务）、BioPython（通过Entrez访问38个NCBI子数据库）和gget（20+基因组数据库）进一步扩大了覆盖范围。
*   统一访问：Database Lookup（78个数据库，涵盖化学、基因组学、临床、通路、专利、经济学等领域——PubChem、ChEMBL、UniProt、PDB、AlphaFold、KEGG、Reactome、STRING、ClinVar、COSMIC、ClinicalTrials.gov、FDA、FRED、USPTO、SEC EDGAR等）
*   癌症基因组学：DepMap（癌细胞系依赖性、药物敏感性、基因效应谱）
*   癌症影像：Imaging Data Commons（NCI放射学和病理学数据集，通过idc-index访问）
*   知识图谱：PrimeKG（精准医学知识图谱——基因、药物、疾病、表型）
*   财政数据：美国财政部财政数据（国家债务、财政报表、拍卖、汇率）
*   科学机器学习资源目录：Hugging Science（涵盖17个科学领域——天文学、生物学、化学、气候、基因组学、材料科学、医学、物理学、科学推理等——的数据集、模型、博文和交互式Spaces的精选索引，包含`datasets`、`transformers`和`gradio_client`的使用模式）

#### **基础设施与平台**（7+技能）
*   云端计算：Modal
*   GPU加速：Optimize for GPU（CuPy、Numba CUDA、Warp、cuDF、cuML、cuGraph、KvikIO、cuCIM、cuxfilter、cuVS、cuSpatial、RAFT）
*   基因组学平台：DNAnexus、LatchBio
*   显微镜：OMERO
*   自动化：Opentrons
*   资源检测：获取可用资源

#### **研究方法论与规划**（12+技能）
*   构思：科学头脑风暴、假设生成
*   批判性分析：科学批判性思维、学者评估
*   情景分析：What-If Oracle（多分支可能性探索、风险分析、战略选项）
*   多视角审议：Consciousness Council（多元化专家观点、魔鬼代言人分析）
*   认知画像：DHDNA Profiler（从任何文本中提取思维模式和认知特征）
*   资金：研究基金
*   发现：Research Lookup、Paper Lookup（10个学术数据库）
*   市场分析：市场研究报告

#### **法规与标准**（1技能）
*   医疗器械标准：ISO 13485认证

> **有关所有技能的完整详情**，请访问 [K-Dense 文档](https://docs.k-dense.ai)。

***

## 独特价值主张

*   **开源且免费**：100%免费使用，无隐藏费用或付费墙。
*   **本地优先**：敏感数据保留在您的机器上。
*   **模型无关**：支持所有主要AI模型，无供应商锁定。
*   **基于标准**：基于开放的Agent Skills标准构建，确保长期兼容性。
*   **生产就绪**：包含实际科研中经过测试和验证的工作流。

***

## 从何处开始

1.  **浏览技能**：查看上面的[可用技能](#可用技能)部分
2.  **选择您的AI Agent**：选择任何支持Agent Skills的AI Agent
3.  **安装技能**：将技能目录添加到您的Agent的技能路径中
4.  **尝试示例**：从上面的[快速示例](#快速示例)提示开始
5.  **根据您的需求调整**：修改技能或创建您自己的技能

***

## 支持开源社区

> ⭐ **如果这个仓库对您有帮助，请为它点一个Star！**
>
> 您的Star：
> *   帮助其他研究人员发现这些工具
> *   激励我们继续维护和扩展这个集合
> *   支持开源科研软件的生态系统
>
> **[在GitHub上为这个仓库点Star](https://github.com/K-Dense-AI/scientific-agent-skills)**

***

## 安全免责声明

**重要**：在使用本仓库中的技能之前，请阅读此安全声明。

*   **API密钥和凭证**：永远不要将API密钥、密码或任何敏感凭证硬编码到技能文件或提示中。使用环境变量或安全的密钥管理服务。
*   **数据隐私**：当您通过AI Agent使用技能时，您的数据可能会根据您所使用的AI服务提供商的隐私政策进行处理。对于敏感或专有数据，请考虑使用本地模型或具有强有力数据保护保证的服务。
*   **代码执行**：技能使AI Agent能够生成并执行代码。在执行之前，请始终审查AI生成的代码，尤其是在生产环境或敏感数据集上运行时。
*   **外部API**：许多技能依赖于访问外部API（例如，PubMed、ChEMBL、UniProt）。请确保您已获得适当的权限，并遵守这些服务的服务条款和速率限制。
*   **输出验证**：AI Agent可能产生幻觉或不正确的输出。对于任何研究或临床决策，请由领域专家验证所有结果。
*   **医疗免责声明**：本仓库中的技能旨在用于研究目的，不应用于做出临床决策，除非在适当的监督下并经过临床验证。
*   **测试**：在将技能部署到关键工作流之前，请使用非生产数据对其进行测试。

**通过使用本仓库，您承认您理解这些风险，并对使用这些技能的结果负全部责任。**

***

## 参与贡献

我们欢迎贡献！如果您想添加新的技能、改进现有技能或修复错误，请：

1.  Fork本仓库
2.  创建一个功能分支
3.  进行您的更改
4.  提交一个拉取请求

有关贡献的更多信息，请查看我们的[贡献指南](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/CONTRIBUTING.md)。

***

## 故障排除

### 常见问题

*   **技能未被识别**：确保技能目录位于正确的位置（例如，`~/.claude/skills` 或 `./.claude/skills`）
*   **Python包未找到**：技能会自动安装依赖项，但您可能需要先安装 `uv`
*   **API速率限制**：许多数据库都有速率限制。对于大规模查询，请考虑实现重试逻辑或使用缓存
*   **内存不足**：某些技能处理大型数据集（例如，单细胞分析）。考虑使用高性能计算资源或子采样您的数据

***

## 常见问题解答

**问：这些技能是免费的吗？**
答：是的！Scientific Agent Skills完全免费且开源。

**问：我需要一个特定的AI Agent吗？**
答：不需要——这些技能可在任何支持Agent Skills标准的AI Agent上运行。

**问：这些技能可以在我的本地机器上运行吗？**
答：可以。它们被设计为在您的机器上本地运行，可选择通过Modal扩展到云端计算。

**问：技能只适用于科学吗？**
答：虽然重点是科学，但我们也包括金融和工程技能，并欢迎在这些领域做出贡献。

**问：我如何创建我自己的技能？**
答：请参考 [Agent Skills规范](https://agentskills.io/specification) 以获取创建自定义技能的说明。

***

## 支持

*   **文档**：[docs.k-dense.ai](https://docs.k-dense.ai)
*   **问题反馈**：[GitHub Issues](https://github.com/K-Dense-AI/scientific-agent-skills/issues)
*   **社区**：[加入我们的Discord](https://discord.gg/kdense)
*   **X（原Twitter）**：[@KDenseAI](https://x.com/KDenseAI)

# 参考资料

* any list
{:toc}