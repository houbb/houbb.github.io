---
layout: post
title: 数据库查询工具 stream query 入门介绍-允许完全摆脱Mapper的mybatis-plus体验！
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, olap, sh]
published: true
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

# 简介

允许完全摆脱Mapper的mybatis-plus体验！

封装stream和lambda操作进行数据返回处理

# 安装

## 🍊Maven

在项目的pom.xml的dependencies中加入以下内容:

```xml
<!-- 已包含mybatis-plus、stream-core、不用重复引入 -->
<!-- https://mvnrepository.com/artifact/org.dromara.stream-query/stream-plugin-mybatis-plus -->
<dependency>
   <groupId>org.dromara.stream-query</groupId>
   <artifactId>stream-plugin-mybatis-plus</artifactId>
   <version>2.1.0</version>
</dependency>
<!-- 可单独引入 -->
<!-- https://mvnrepository.com/artifact/org.dromara/stream-core -->
<dependency>
  <groupId>org.dromara.stream-query</groupId>
  <artifactId>stream-core</artifactId>
  <version>2.1.0</version>
</dependency>
```

## 配置

注入动态Mapper处理器

```java
@Bean
public DynamicMapperHandler dynamicMapperHandler(SqlSessionFactory sqlSessionFactory) throws Exception {
    // 使用ClassHelper的scanClasses方法扫描对应路径下的po生成Class文件集合放入第二个参数就可以了
    final List<Class<?>>entityClassList=ClassHelper.scanClasses("com.ruben.pojo.po");
    return new DynamicMapperHandler(sqlSessionFactory,entityClassList);
}
```

## 使用

```java
Database.saveBatch(userList);
// 批量保存
Database.saveBatch(userList);
// 使用userIds进行in查询，得到map key为id，value为entity对象
Map<Long, UserInfo> idUserMap=OneToOne.of(UserInfo::getId).in(userIds).query();
```

# 小结

主要是这种设计理念比较好，太多的 mapper 写起来确实比较麻烦。

# 参考资料

https://www.jinq.org/


* any list
{:toc}