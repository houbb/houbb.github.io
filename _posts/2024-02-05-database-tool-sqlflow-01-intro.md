---
layout: post
title: 数据库血缘工具 SQLFlow 介绍-可视化数据库字段和数据库血缘
date: 2024-02-05 21:01:55 +0800
categories: [Database]
tags: [database, sql, sh]
published: true
---

# sqlflow

https://www.sqlflow.cn/solution/

> [在线工具](https://sqlflow.gudusoft.com/#/)

![online](https://img2023.cnblogs.com/other/1097393/202311/1097393-20231113145652594-507606322.png)

SQLFlow 可跟踪超过 20 种主要数据库(包括 Snowflake、Hive、SparkSQL、Teradata、Oracle、SQL Server、AWS Redshift、BigQuery 等)的字段级数据血缘。

从查询历史记录、ETL 脚本、Github/Bitbucket、本地文件系统和远程数据库中的 SQL 语法创建和可视化血缘关系。

使用交互式图表或通过 Restful API 或 SDK 以编程方式探索血缘关系。

SQLFlow 呈现一个清晰简洁的图表，告诉你数据来自何处、沿途经历哪些转换，以及从此数据值衍生的其他数据项。

## 学习资料

https://github.com/sqlparser/sqlflow_public/blob/master/README_CN.md

## SQLFlow 可以做什么

扫描您的数据库并立即发现数据血缘

自动从 GitHub/Bitbucket 或本地文件系统中收集 SQL 脚本。

为最终用户提供清晰简洁的图表,以快速了解数据血缘

使用 Restful API 或 SDK 以编程方式获取 CSV、JSON、Graphml 格式的血缘关系

将从复杂 SQL 脚本中解码的血缘关系元数据集成到您自己的元数据数据库中以供进一步处理

可视化数据库中现有的元数据以释放数据的力量

通过单击即可向前或向后追踪血缘来执行影响分析和根本原因分析

能够处理来自 20 多家主要数据库供应商的 SQL 脚本

## 如何使用 SQLFlow？

打开 SQLFlow 的官方网站，并粘贴你的 SQL 脚本或元数据以获取清晰简洁的血缘关系图

在自己的代码中调用 SQLFlow 的 Restful API，以获取 SQLFlow 从 SQL 脚本中解码的数据血缘元数据

SQLFlow 的本地版本使您可以在自己的服务器上使用它来确保数据更安全





# chat

## 详细介绍一下 sqlflow

截至我知识截止日期（2022年1月），SQLFlow 是一个开源项目，它通过在机器学习（ML）和深度学习（DL）任务中集成 SQL 来简化数据科学工作流。SQLFlow 的目标是让数据科学家能够使用 SQL 查询数据、训练模型并部署模型，从而更轻松地进行端到端的数据科学工作。

以下是 SQLFlow 的一些关键特点和组成部分：

1. **SQL-Based Machine Learning**: SQLFlow 允许用户通过 SQL 查询语言执行机器学习任务。通过 SQLFlow，用户可以在 SQL 语句中嵌入机器学习模型的训练和评估步骤，以及预测和推理任务。

2. **支持多种后端引擎**: SQLFlow 不仅支持 TensorFlow 和 XGBoost 等传统机器学习库，还支持深度学习框架，如 TensorFlow 和 PyTorch。这使得用户可以在不同的框架中选择适合他们任务的引擎。

3. **开发工作流**: SQLFlow 提供了用于机器学习工作流的工具，使用户能够更轻松地执行端到端的数据科学任务。这包括数据准备、模型训练、评估和部署等步骤。

4. **元数据存储**: SQLFlow 使用元数据存储来跟踪和管理用户的数据科学实验和模型。这有助于追溯工作流、复现实验，并在需要时分享和协作。

5. **支持特征工程**: SQLFlow 支持在 SQL 查询中进行特征工程，使用户能够在同一查询中处理数据和训练模型。

6. **模型部署**: SQLFlow 不仅关注模型的训练，还支持模型的部署。这使用户能够将训练好的模型轻松地集成到实际应用中。

请注意，由于我知识截止日期为2022年1月，SQLFlow 可能已经有了新的发展和版本更新。

因此，建议查阅 SQLFlow 的官方文档或项目存储库以获取最新的信息和功能。



# 参考资料

https://www.cnblogs.com/JavaEdge/p/17829164.html

* any list
{:toc}
