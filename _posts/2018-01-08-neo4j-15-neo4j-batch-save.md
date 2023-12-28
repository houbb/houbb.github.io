---
layout: post
title:  Neo4j-15-neo4j 如何实现真正的批量保存?
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j, go, go-lang]
published: true
---

# 需求

希望通过批量操作，提升 neo4j 的性能。

## 虚假的批量 

OGM  session.save 入参可以是 list，开始以为这里可以直接批量保存。

实际测试发现逐条保存和单个保存耗时差不多，看了下源码，应该是一个循环。


## 基于 UNWIND，待验证

在Neo4j中，实现批量插入数据可以通过使用Cypher查询语言的`UNWIND`和`CREATE`语句来实现。

`UNWIND`用于展开列表，并且可以将其与`CREATE`一起使用，以一次性创建多个节点或关系。这样可以最小化与数据库的交互次数，从而提高性能。

以下是一个简单的示例，演示如何使用`UNWIND`和`CREATE`进行批量插入节点：

```cypher
UNWIND $dataList AS data
CREATE (:Node {property1: data.property1, property2: data.property2})
```

在上述查询中，`$dataList`是一个参数，它是一个包含要插入的数据的列表。

通过`UNWIND`，我们将列表展开，然后使用`CREATE`一次性创建多个节点。

在使用Neo4j OGM的情况下，你可以通过将数据转换为对应的实体对象，并使用OGM的`Session`来执行Cypher查询。

以下是一个Java示例：

```java
List<MyNodeEntity> dataList = // 要插入的数据列表
Session session = sessionFactory.openSession();

Map<String, Object> parameters = new HashMap<>();
parameters.put("dataList", dataList);

session.query("UNWIND $dataList AS data CREATE (:MyNodeEntity {property1: data.property1, property2: data.property2})", parameters);
session.clear(); // 清理缓存

try(Transaction transaction = session.beginTransaction()) {
    transaction.commit();
}
```

这里假设`MyNodeEntity`是你的实体类，包含要插入的节点的属性。

在这个例子中，`dataList`是要插入的数据列表，通过参数传递给Cypher查询。

请注意，在实际应用中，要根据你的数据模型和需求进行调整。确保你的数据模型和Cypher查询符合你的应用程序的需求。

## 异步

可以在这里使用异步入库。

不过批量就会带来一些问题，比如如果一些数据存在



# 小结


# 参考资料

chat

* any list
{:toc}

