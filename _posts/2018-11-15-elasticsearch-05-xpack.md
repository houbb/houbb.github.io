---
layout: post
title: Elasticsearch-05-xpack ELK 安全，警告，监视，图形和报告功能
date:  2018-11-15 08:38:35 +0800
categories: [Search]
tags: [apache, search, index, es, sh]
published: true
---


# X-Pack 简介

1）利用 X-Pack 拓展可能性。

X-Pack 是集成了多种便捷功能的单个插件 — security、alerting、monitoring、reporting、graph 探索和 machine learning — 您可以在 Elastic Stack 中放心地使用这些功能。

2）单就其自身而言，Elastic Stack 就是一款值得考虑的强大工具。X-Pack 将诸多强大功能集合到一个单独的程序包中，更将它带上了一个新的层次。

3）x-pack是elasticsearch的一个扩展包，将安全，警告，监视，图形和报告功能捆绑在一个易于安装的软件包中，虽然x-pack被设计为一个无缝的工作，但是你可以轻松的启用或者关闭一些功能。

# X-Pack 功能介绍

X-Pack 提供以下几个级别保护elastic集群

- 用户验证

- 授权和基于角色的访问控制

- 节点/客户端认证和信道加密

- 审计

通俗讲解：

- 安全防护功能：你是不是，不想别人直接访问你的5601，9200端口，这个，x-pack能办到。

- 实时监控功能：实时监控集群的CPU、磁盘等负载；

- 生成报告功能：图形化展示你的集群使用情况。

- 还有，机器学习等功能。

以上这些都是X-pack的核心功能点。


# 参考资料

[Elasticsearch6.2.2 X-Pack部署及使用详解](https://ost.51cto.com/posts/12133)

https://cloud.tencent.com/developer/article/1532689

https://www.cnblogs.com/qianjingchen/articles/10344927.html

* any list
{:toc}