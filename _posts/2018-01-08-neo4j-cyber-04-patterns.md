---
layout: post
title:  Neo4j-Cypher-04-patterns
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---

# patterns

图案匹配是Cypher®的核心机制。

它是通过应用声明性模式导航、描述和提取图数据的机制。在MATCH子句中，您可以使用图案定义要搜索的数据和要返回的数据。图案匹配也可以在不使用MATCH子句的情况下使用，在子查询EXISTS、COUNT和COLLECT中。

图案描述数据，使用的语法类似于在白板上绘制属性图的节点和关系的方式。在白板上，节点被绘制为圆圈，关系被绘制为箭头。Cypher将圆圈表示为一对括号，将箭头表示为短横线和大于或小于符号：

```
()-->()<--()
```

这些用于节点和关系的简单图案是匹配固定长度路径的路径图案的构建块。

除了讨论简单的模式外，本章还将介绍更复杂的模式，展示如何匹配可变长度的模式、用于提高查询性能的内联过滤器，以及如何在路径模式中添加循环和非线性形状。

本章包括三个部分：

- 概念 - 深入探讨图案匹配背后的概念。
- 入门 - 一个简短的入门指南，介绍如何在Cypher中开始使用图案匹配。
- 语法和语义 - 查找图案匹配的语法和语义的参考。

# 概念

这是一个图案匹配背后概念的逐步指南。

它从图案的简单构建块开始：节点模式和关系模式。然后它展示了如何将它们组合成匹配固定长度路径、可变长度路径和包含循环的路径的路径模式。

下面示例中的模型数据基于英国国家铁路网络，使用公开可用的数据集。

PS: 忽然感觉这个东西可以用来做最短路径，导航等。

内容非常多，建议使用时查看: https://neo4j.com/docs/cypher-manual/5/patterns/concepts/

# 入门

本节包含一个入门指南，介绍使用Cypher®查询进行图案匹配的一些基本特性。

> [primer](https://neo4j.com/docs/cypher-manual/5/patterns/primer/)

# 语法和语义

本节包含了用于查找图案匹配特定元素的语法和语义的参考材料。

> [reference](https://neo4j.com/docs/cypher-manual/5/patterns/reference/)

# 参考资料

chat

https://neo4j.com/docs/cypher-manual/5/subqueries/call-subquery/

https://neo4j.com/docs/cypher-manual/5/patterns/concepts/

https://neo4j.com/docs/cypher-manual/5/patterns/primer/

https://neo4j.com/docs/cypher-manual/5/patterns/reference/


* any list
{:toc}

