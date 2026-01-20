---
layout: post
title: milvus-02-是什么？
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---

# 是什么？

Milvus是鹰科 Accipaitridae 中 Milvus 属的一种猛禽，以飞行速度快、视力敏锐、适应性强而著称。

Zilliz 采用 Milvus 作为其开源高性能、高扩展性向量数据库的名称，该数据库可在从笔记本电脑到大规模分布式系统等各种环境中高效运行。它既是开源软件，也是云服务。

Milvus 由 Zilliz 开发，并很快捐赠给了 Linux 基金会下的 LF AI & Data 基金会，现已成为世界领先的开源向量数据库项目之一。

它采用 Apache 2.0 许可发布，大多数贡献者都是高性能计算（HPC）领域的专家，擅长构建大规模系统和优化硬件感知代码。

核心贡献者包括来自 Zilliz、ARM、英伟达、AMD、英特尔、Meta、IBM、Salesforce、阿里巴巴和微软的专业人士。

有趣的是，Zilliz 的每个开源项目都以鸟命名，这种命名方式象征着自由、远见和技术的敏捷发展。


# 非结构化数据、Embeddings 和 Milvus

非结构化数据（如文本、图像和音频）格式各异，蕴含丰富的潜在语义，因此分析起来极具挑战性。

为了处理这种复杂性，Embeddings 被用来将非结构化数据转换成能够捕捉其基本特征的数字向量。然后将这些向量存储在向量数据库中，从而实现快速、可扩展的搜索和分析。

Milvus 提供强大的数据建模功能，使您能够将非结构化或多模式数据组织成结构化的 Collections。

它支持多种数据类型，适用于不同的属性模型，包括常见的数字和字符类型、各种向量类型、数组、集合和 JSON，为您节省了维护多个数据库系统的精力。

![](https://milvus.io/docs/v2.6.x/assets/unstructured-data-embedding-and-milvus.png)


Milvus 提供三种部署模式，涵盖各种数据规模--从 Jupyter Notebooks 中的本地原型到管理数百亿向量的大规模 Kubernetes 集群：

Milvus Lite 是一个 Python 库，可以轻松集成到您的应用程序中。作为 Milvus 的轻量级版本，它非常适合在 Jupyter Notebooks 中进行快速原型开发，或在资源有限的边缘设备上运行。了解更多信息。
Milvus Standalone 是单机服务器部署，所有组件都捆绑在一个 Docker 镜像中，方便部署。了解更多。
Milvus Distributed 可部署在 Kubernetes 集群上，采用云原生架构，专为十亿规模甚至更大的场景而设计。该架构可确保关键组件的冗余。了解更多。



# Milvus 为何如此快速？

Milvus 从设计之初就是一个高效的向量数据库系统。在大多数情况下，Milvus 的性能是其他向量数据库的 2-5 倍（参见 VectorDBBench 结果）。这种高性能是几个关键设计决策的结果：

硬件感知优化：为了让 Milvus 适应各种硬件环境，我们专门针对多种硬件架构和平台优化了其性能，包括 AVX512、SIMD、GPU 和 NVMe SSD。

高级搜索算法：Milvus 支持多种内存和磁盘索引/搜索算法，包括 IVF、HNSW、DiskANN 等，所有这些算法都经过了深度优化。与 FAISS 和 HNSWLib 等流行实现相比，Milvus 的性能提高了 30%-70%。

C++ 搜索引擎向量数据库性能的 80% 以上取决于其搜索引擎。由于 C++ 语言的高性能、底层优化和高效资源管理，Milvus 使用 C++ 来处理这一关键组件。最重要的是，Milvus 集成了大量硬件感知代码优化，从汇编级向量到多线程并行化和调度，以充分利用硬件能力。

面向列：Milvus 是面向列的向量数据库系统。其主要优势来自数据访问模式。在执行查询时，面向列的数据库只读取查询中涉及的特定字段，而不是整行，这大大减少了访问的数据量。此外，对基于列的数据的操作可以很容易地进行向量化，从而可以一次性在整个列中应用操作，进一步提高性能。

# 是什么让 Milvus 具有如此高的可扩展性？

2022 年，Milvus 支持十亿级向量，2023 年，它以持续稳定的方式扩展到数百亿级，为 300 多家大型企业的大规模场景提供支持，包括 Salesforce、PayPal、Shopee、Airbnb、eBay、NVIDIA、IBM、AT&T、LINE、ROBLOX、Inflection 等。

Milvus 的云原生和高度解耦的系统架构确保了系统可以随着数据的增长而不断扩展：

![Milvus](https://milvus.io/docs/v2.6.x/assets/milvus_architecture_2_6.png)

Milvus 本身是完全无状态的，因此可以借助 Kubernetes 或公共云轻松扩展。

此外，Milvus 的各个组件都有很好的解耦，其中最关键的三项任务--搜索、数据插入和索引/压实--被设计为易于并行化的流程，复杂的逻辑被分离出来。

这确保了相应的查询节点、数据节点和索引节点可以独立地向上和向下扩展，从而优化了性能和成本效率。


# 参考资料

https://milvus.io/docs/zh/install_standalone-docker.md

* any list
{:toc}