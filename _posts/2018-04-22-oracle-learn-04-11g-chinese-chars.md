---
layout: post
title:  Oracle Learn-04-oracle 11g 踩坑之支持中文逗号，括号等符号？
date:  2018-04-22 19:00:57 +0800
categories: [SQL]
tags: [sql, oracle, learn]
published: true
---

# 现象

对老平台的 oracle 语句迁移到新平台。

中间统一添加了 SQL 语法的校验，发现语法校验不通过。

但是把 SQL 放在产线 oracle 又可以执行。

SQL 放在执行其中，发现竟然存在中文逗号，括号等，oracle 还是支持的？

# 原因

oracle 11G 支持中文的逗号。

但是为了规范，还是建议采用标准的符号书写，避免奇怪的问题。


# 参考资料

https://blog.csdn.net/itmyhome1990/article/details/106849914

* any list
{:toc}









 





