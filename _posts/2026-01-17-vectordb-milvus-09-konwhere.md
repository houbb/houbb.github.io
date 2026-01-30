---
layout: post
title: 向量数据库 milvus 入门-09-KONWhere
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---


# Knowhere

本主题介绍 Milvus 的核心向量执行引擎 Knowhere。

## 概述

Knowhere 是 Milvus 的核心向量执行引擎，它集成了多个向量相似性搜索库，包括Faiss、Hnswlib和Annoy。

Knowhere 的设计还支持异构计算。它可以控制在哪个硬件（CPU 或 GPU）上执行索引构建和搜索请求。

这就是 Knowhere 名字的由来--知道在哪里执行操作符。未来的版本将支持更多类型的硬件，包括 DPU 和 TPU。

## Milvus架构中的Knowhere

下图说明了 Knowhere 在 Milvus 架构中的位置。

![Knowhere](https://milvus.io/docs/v2.6.x/assets/knowhere_architecture.png)

最底层是系统硬件。上面是第三方索引库。

在最上层，Knowhere通过CGO与索引节点和查询节点交互，CGO允许Go包调用C代码。

## Knowhere的优势

以下是Knowhere与Faiss相比的优势。

#### 支持比特视图

Milvus 引入了比特集机制来实现 "软删除"。

软删除的向量仍然存在于数据库中，但在向量相似性搜索或查询时不会被计算。

比特集中的每个比特都对应一个索引向量。如果某个向量在比特集中被标记为 "1"，则表示该向量已被软删除，在向量搜索过程中不会涉及。比特集参数适用于 Knowhere 中所有公开的 Faiss 索引查询 API，包括 CPU 和 GPU 索引。

有关比特集机制的更多信息，请查看比特集。

#### 支持二进制向量索引的多种相似性度量方法

Knowhere支持Hamming、Jaccard、Tanimoto、Superstructure和Substructure。

Jaccard和Tanimoto可用于测量两个样本集之间的相似性，而Superstructure和Substructure可用于测量化学结构的相似性。

#### 支持 AVX512 指令集

除了Faiss已经支持的AArch64、SSE4.2和AVX2指令集外，Knowhere还支持AVX512指令集，与AVX2指令集相比，AVX512指令集可将索引构建和查询性能提高20%至30%。

#### 自动选择SIMD指令

Knowhere支持在任何CPU处理器（本地部署和云平台）上自动调用合适的SIMD指令（如SIMD SSE、AVX、AVX2和AVX512），因此用户无需在编译时手动指定SIMD标志（如"-msse4"）。

Knowhere 是通过重构 Faiss 的代码库而构建的。依赖于 SIMD 加速的常用函数（如相似性计算）被分解出来。然后为每个函数实现四个版本（即 SSE、AVX、AVX2 和 AVX512），并将每个版本放入单独的源文件中。然后，使用相应的 SIMD 标志对源文件进行单独编译。因此，在运行时，Knowhere 可以根据当前的 CPU 标志自动选择最合适的 SIMD 指令，然后使用挂钩功能链接正确的函数指针。

#### 其他性能优化措施

阅读《Milvus: A Purpose-Built Vector Data Management System》，了解有关 Knowhere 性能优化的更多信息。

## Knowhere 代码结构

Milvus 中的计算主要涉及向量和标量操作。Knowhere 只处理向量索引的操作符。

索引是一种独立于原始向量数据的数据结构。一般来说，建立索引需要四个步骤：创建索引、训练数据、插入数据和建立索引。在一些人工智能应用中，数据集训练与向量搜索是分开的。先对数据集的数据进行训练，然后插入到 Milvus 等向量数据库中进行相似性搜索。例如，开放数据集 sift1M 和 sift1B 区分了用于训练的数据和用于测试的数据。

然而，在 Knowhere 中，用于训练的数据和用于搜索的数据是相同的。Knowhere 会对一个数据段中的所有数据进行训练，然后插入所有训练过的数据并为它们建立索引。

#### DataObj基类

DataObj 是 Knowhere 中所有数据结构的基类。 是 中唯一的虚拟方法。Index 类继承自 ，其字段名为 "size_"。Index 类还有两个虚拟方法-- 和 。从 派生的 类是所有向量索引的虚拟基类。 提供的方法包括 , , , 和 。Size() DataObj DataObj Serialize() Load() Index VecIndex VecIndex Train() Query() GetStatistics() ClearStatistics()

![基类](https://milvus.io/docs/v2.6.x/assets/Knowhere_base_classes.png)

上图右侧列出了其他一些索引类型。

Faiss 索引有两个基类：
FaissBaseIndex 用于浮点向量上的所有索引，FaissBaseBinaryIndex 用于二进制向量上的所有索引。
- GPUIndex 是所有 Faiss GPU 索引的基类。
- OffsetBaseIndex 是所有自主开发索引的基类。鉴于索引文件中只存储向量 ID，128 维向量的文件大小可减少 2 个数量级。

#### IDMAP强制搜索

![IDMAP](https://milvus.io/docs/v2.6.x/assets/IDMAP.png)

从技术上讲，IDMAP 不是索引，而是用于暴力搜索。

向量插入数据库时，既不需要数据训练，也不需要建立索引。搜索将直接在插入的向量数据上进行。

不过，为了保持代码的一致性，IDMAP 也继承自VecIndex 类及其所有虚拟接口。IDMAP 的用法与其他索引相同。

#### IVF 索引

![IVF](https://milvus.io/docs/v2.6.x/assets/IVF.png)

IVF（倒置文件）索引是最常用的索引。IVF 类衍生自VecIndex 和FaissBaseIndex ，并进一步扩展到IVFSQ 和IVFPQ 。GPUIVF 衍生自GPUIndex 和IVF 。然后，GPUIVF 进一步扩展到GPUIVFSQ 和GPUIVFPQ 。

IVFSQHybrid 是一个自主开发的混合索引。粗量化器在 GPU 上执行，而桶中的搜索则在 CPU 上进行。 

的召回率与 相同，但性能更好。IVFSQHybrid GPUIVFSQ 

二进制索引的基类结构相对简单。BinaryIDMAP 和BinaryIVF 由FaissBaseBinaryIndex 和VecIndex 派生而来。

#### 第三方索引

![第三方指数](https://milvus.io/docs/v2.6.x/assets/third_party_index.png)

目前，除了 Faiss 之外，只支持两种第三方索引：基于树的索引Annoy 和基于图的索引HNSW 。这两种常用的第三方指数均来自VecIndex 。

## 向Knowhere添加索引

如果想在Knowhere中添加新的索引，首先可以参考现有的索引：

要添加基于量化的指数，请参考
IVF_FLAT 。

要添加基于图的索引，请参考
HNSW 。

要添加基于树的索引，请参阅
Annoy 。

参考现有索引后，可以按照以下步骤向Knowhere添加新索引。

在
IndexEnum 中添加新索引的名称。数据类型为字符串。

在文件
ConfAdapter.cpp 中为新索引添加数据验证检查。验证检查主要用于验证数据训练和查询的参数。

为新索引创建一个新文件。新索引的基类应包括
VecIndex 和VecIndex 的必要虚拟接口。

在
VecIndexFactory::CreateVecIndex() 中添加新索引的索引构建逻辑。

在
unittest 目录下添加单元测试。

## 下一步工作

在了解了 Knowhere 如何在 Milvus 中运行之后，你可能还想

翻译自

## 想要更快、更简单、更好用的 Milvus SaaS服务 ？

Zilliz Cloud是基于Milvus的全托管向量数据库，拥有更高性能，更易扩展，以及卓越性价比
免费试用 Zilliz Cloud

##### 反馈

此页对您是否有帮助?

# 参考资料

https://milvus.io/docs/zh/knowhere.md

* any list
{:toc}