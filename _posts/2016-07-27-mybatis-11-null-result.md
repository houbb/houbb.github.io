---
layout: post
title: mybatis-11-Mybatis 查询结果为 null，实际 sql 查询有值
date:  2016-07-27 10:40:05 16:09:17 +0800
categories: [SQL]
tags: [mybatis, database]
published: true
---

# 现象

今天使用 mybatis 查询列表，结果查出的是一个有 size 的列表，但是内容都是 `null`。


# 分析

## 实际为 null

最先想到的是 sql 有问题，执行了一遍发现结果是有值的。

## 使用了继承

网上还有一种说法，说是使用了继承。

导致反射可能没有值，看了下代码，model 类是没有继承的。

## ResultType 与 ResultMap

后来看了一遍文章，

### 原因：

只有当数据库表中的字段名称与实体类中的属性名称完全相同，才能直接使用 `resultType` 返回类型，后面跟上该实体类的名称。

否则一定需要用 `resultMap` 进行属性映射，否则得到的数据一直没有匹配的实体类与之对应，返回的结果也自然为空！！！

感觉这个最可能，经验证确实是这个原因。

# 参考资料

[解决mybatis查询结果一直为null，但是数据库表查询却有结果](https://blog.csdn.net/weixin_44009447/article/details/104451526)

[mybatis 查询list，内容为null,但list的size 为1](https://www.cnblogs.com/sanhao/p/11323561.html)

[mybatis查询出字段为null，但是sql查出来有值](https://www.cnblogs.com/coderdxj/p/10498117.html)

* any list
{:toc}









