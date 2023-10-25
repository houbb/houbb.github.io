---
layout: post
title:  Neo4j-05-图数据库 neo4j 实战
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---


# Q1-应用A的方法 methodA，调用了应用B的方法 methodB。帮我生成 neo4j 的数据关系和节点的 插入语句。

在这种情况下，我们可以创建两个应用节点（应用A和应用B）以及两个方法节点（methodA和methodB）。

然后，我们可以创建一个调用关系，从应用A的methodA方法指向应用B的methodB方法。

以下是插入这些节点和关系的Neo4j Cypher语句：

```sql
// 创建应用节点  
CREATE (appA:Application {name: '应用A', id:'appA'})  
CREATE (appB:Application {name: '应用B', id:'appB'})  
  
// 创建方法节点  
CREATE (methodA:Method {name: 'methodA', id: 'methodA', app: 'appA'})  
CREATE (methodB:Method {name: 'methodB', id: 'methodB', app: 'appB'})  
```

// 创建调用关系  

```sql
MATCH (node1:Method), (node2:Method)  
WHERE node1.name = 'methodA' AND node2.name = 'methodB'  
CREATE (node1)-[r:CALLS]->(node2)
```

这个模型假设每个方法都属于一个应用，并且我们用一个CALLS关系表示一个方法调用另一个方法。

你可以根据你的具体需求调整这个模型。

例如，如果一个方法可以调用多个其他方法，或者一个方法可以被多个方法调用，你可能需要调整这个模型以反映这些情况。

# 小结

基本的关系创建实例。

# 参考资料


* any list
{:toc}

