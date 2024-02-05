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

> [github sqlflow_public](https://github.com/sqlparser/sqlflow_public)

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

方式1：打开 SQLFlow 的官方网站，并粘贴你的 SQL 脚本或元数据以获取清晰简洁的血缘关系图

方式2：在自己的代码中调用 SQLFlow 的 Restful API，以获取 SQLFlow 从 SQL 脚本中解码的数据血缘元数据

方式3：SQLFlow 的本地版本使您可以在自己的服务器上使用它来确保数据更安全

个人感觉比较实用的是 sqlflow 的网站在线工具。但是实际使用，有对应的 java maven 包吗?


# 参考资料

https://www.cnblogs.com/JavaEdge/p/17829164.html

* any list
{:toc}
