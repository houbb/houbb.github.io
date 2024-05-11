---
layout: post
title:  MBG Mybatis Generator 生成的实体类和数据库不一致 
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, mbg, sh]
published: true
---

# 现象

本地 mysql 库，使用 MBG 生成代码，发现和数据库的表结构不一致。

开始以为是 MBG 的版本 BUG，升级到最新版本依然无效。

更加奇怪的是，mapper 也会生成多个 resultmap，其中有最新的，但是实体却不对。

本地库，可能不同库的表相同。

# 问题

Mybatis Generator 生成的实体类和数据库不一致。

# 原因

不同的数据库有相同的表，Mybatis Generator 串库了。

# 解决办法

在generator.xml中增加一行配置 `< property name=“nullCatalogMeansCurrent” value=“true” />`

```xml
<!--数据库配置-->
	<jdbcConnection driverClass="com.mysql.jdbc.Driver" connectionURL="jdbc:mysql://127.0.0.1:3306/test" userId="root" password="root">
	<!-- 仅查询当前库的表，不去查询其他库 -->
	<property name="nullCatalogMeansCurrent" value="true" />
	<property name="remarksReporting" value="true"/>
</jdbcConnection>
```

## 个人解决办法

因为是本地库，直接把其他多余的库（包含相同的表的）删除，只保留一个。

重新生成，问题解决。

# 参考资料

https://blog.csdn.net/yu97271486/article/details/120005334

* any list
{:toc}