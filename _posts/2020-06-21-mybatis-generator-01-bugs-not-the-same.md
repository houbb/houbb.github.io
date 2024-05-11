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


# chat

## 使用 mybatis-generator 生成代码，发现字段和数据库不一致

在使用 MyBatis Generator 生成代码时，如果发现生成的字段和数据库不一致，通常是由于以下几个原因造成的：

1. **数据库配置错误**：检查 MyBatis Generator 的配置文件（通常是 `mybatis-generator.xml` 或者 `mbg.xml`），确保数据库的 URL、用户名、密码等信息是正确的。

2. **表名或别名不一致**：在 MyBatis Generator 配置文件中，需要指定要生成代码的表名。如果表名或别名与数据库中的表名不一致，可能会导致字段不匹配。

3. **字段名映射问题**：MyBatis Generator 允许你自定义字段名到 Java 属性名的映射。如果这些映射没有正确设置，可能会导致生成的代码中的字段名与数据库不一致。

4. **数据库结构变更**：如果数据库结构在生成代码后发生了变更，而 MyBatis Generator 的配置没有更新，也可能导致字段不一致。

5. **版本控制问题**：如果你的 MyBatis Generator 配置文件和数据库结构都在版本控制中，确保你使用的是最新的版本。

解决这个问题的步骤可能包括：

- **重新检查配置文件**：确保所有的配置信息都是最新的，并且与数据库的实际设置相匹配。
- **更新数据库信息**：如果数据库结构有变更，更新 MyBatis Generator 的配置文件以反映这些变更。
- **字段映射**：检查是否有字段映射配置，并确保它们正确地将数据库字段映射到 Java 类的属性。
- **重新运行 MyBatis Generator**：在解决了上述问题后，重新运行 MyBatis Generator 来生成更新的代码。
- **手动调整**：如果问题仍然存在，可能需要手动调整生成的代码以匹配数据库结构。

如果你有 MyBatis Generator 的配置文件或遇到了具体的错误信息，可以提供更多的信息，这样我可以给出更具体的建议。

# 参考资料

https://blog.csdn.net/yu97271486/article/details/120005334

* any list
{:toc}