---
layout: post
title:  Neo4j-12-多标签问题 org.neo4j.ogm.exception.AmbiguousBaseClassException Multiple classes found in type hierarchy that map to 
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j, go, go-lang]
published: true
---

# 现状

使用 springboot ogm 访问 neo4j。

结果报错：

```
org.springframework.web.util.NestedServletException: Request processing failed; nested exception is org.neo4j.ogm.exception.MappingException: Error mapping GraphModel to instance of com.knowledgeGraph.kgClient.domain.Movie
at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:982) ~[spring-webmvc-4.2.3.RELEASE.jar:4.2.3.RELEASE]
at org.springframework.web.servlet.FrameworkServlet.doGet(FrameworkServlet.java:861) ~[spring-webmvc-4.2.3.RELEASE.jar:4.2.3.RELEASE]
at javax.servlet.http.HttpServlet.service(HttpServlet.java:622) ~[tomcat-embed-core-8.0.28.jar:8.0.28]
at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:846) ~[spring-webmvc-4.2.3.RELEASE.jar:4.2.3.RELEASE]
at javax.servlet.http.HttpServlet.service(HttpServlet.java:729) ~[tomcat-embed-core-8.0.28.jar:8.0.28]

Caused by: org.neo4j.ogm.exception.AmbiguousBaseClassException: Multiple classes found in type hierarchy that map to: [Person, Actor, Director]
at org.neo4j.ogm.MetaData.resolve(MetaData.java:174) ~[neo4j-ogm-core-2.0.1.jar:na]
at org.neo4j.ogm.annotations.EntityFactory.resolve(EntityFactory.java:121) ~[neo4j-ogm-core-2.0.1.jar:na]
at org.neo4j.ogm.annotations.EntityFactory.instantiateObjectFromTaxa(EntityFactory.java:105) ~[neo4j-ogm-core-2.0.1.jar:na]
at org.neo4j.ogm.annotations.EntityFactory.newObject(EntityFactory.java:61) ~[neo4j-ogm-core-2.0.1.jar:na]
```

## 原因

原因：使用 ogm 中 loadAll 等方法，虽然指定了 class 类，这时候 label 唯一。但是 neo4j 中的数据有多个 label，导致 ogm 报错。

### 代码分析

原因：spring data neo4j 的 `MetaData.resolve (String... taxa)` 方法会根据标签去找对应的java节点类(如根据”Company“标签找到Company.java类)。

当传入taxa参数超过一个时，他会去判断多个标签之间是不是父子关系，如果不是父子关系就放入`Set<ClassInfo> resolved` 中，如果是父子关系，只保留子类。

但是最终他会判断resolved的size，如果>1就报错。

```java
if (resolved.size() > 1) {
    // Sort so we always get the same order
    String[] sorted = Arrays.copyOf(taxa, taxa.length);
    Arrays.sort(sorted);
    throw new AmbiguousBaseClassException(Arrays.toString(sorted));
}
```

### 吐槽

其实这个是非常坑的，感觉明明可以优化。

## 解决方式

1）看是否存在脏数据，如果是脏数据可以把数据删除掉。

2）使用原生的 sql 自己查询构建结果，这种最保险。

# 多标签实体

## 查询方式

```
match (n:Person:Girl) return n 
```

这样写，可以同时返回包含 Person 和 Girl label 的数据节点。


## neo4j 如何更新节点的 label？

有时候 发现节点的 label 名字起错了怎么修改呢？！

一个节点是可以有多个 label 的 ,它的 labels 是一个列表。

查看节点的 label 可以用  labels(n) 命令。

所以，想要修改节点的 label ，可以先新加 label ，再删除旧的的label

```
match (n:CAR) set n:NEW remove n:CAR 
 
match(n:NEW) RETURN  labels(n)
```

# 参考资料

chat

https://stackoverflow.com/questions/66522758/the-neo4j-cypher-shell-and-the-browser-connections-are-working-but-the-golang-cl

https://cloud.tencent.com/developer/ask/sof/1841947

https://blog.csdn.net/wuxiaoyi1983/article/details/126773623

[neo4j 常用命令查询，以及更新 节点 的 label 名 和 property 名](https://blog.csdn.net/weixin_30872499/article/details/95245608)

* any list
{:toc}

