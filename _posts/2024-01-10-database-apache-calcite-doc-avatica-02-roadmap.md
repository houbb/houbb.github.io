---
layout: post
title: Apache Calcite doc avatica-02-roadMap 发展路线
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 路线图


## 已实施链接

创建连接、创建语句、元数据、准备、绑定、执行、获取
使用 JSON 通过 HTTP 进行 RPC
本地实现
在现有的 JDBC 驱动程序上实现
组合 RPC（将多个请求合并为一个往返）
执行-获取
元数据-获取（获取表等元数据调用返回所有行）

## 未实施

ODBC
RPC
关闭语句
关闭连接
组合 RPC
创建语句-准备
关闭语句-关闭连接
准备-执行-获取（Statement.executeQuery 应该首先获取前 N 行）
从语句表中删除语句
DML（INSERT、UPDATE、DELETE）
对 SELECT 语句应用 Statement.execute

# 参考资料

https://calcite.apache.org/avatica/docs/roadmap.html

* any list
{:toc}