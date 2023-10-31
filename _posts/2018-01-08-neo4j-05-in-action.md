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

## 清空

```sql
MATCH (n)  DETACH DELETE n;
```

DETACH DELETE 是一个组合操作，它会删除节点，同时删除所有连接到这些节点的关系，而不会删除关系的另一端节点。

# 查询

作为入口：

```sql
match p=(startM)-[r:METHOD_CALLS]->(endM) 
where (r.endMethodFullName='appD,methodD1') 
return startM, r, endM
```

作为出口：

```sql
match p=(startM)-[r:METHOD_CALLS]->(endM) 
where (r.startMethodFullName='appD,methodD1') 
return startM, r, endM
```

必须要有方向性。


------------------ 

```sql
match p=(startM)-[r:METHOD_CALLS]->(endM) 
where (r.startMethodFullName='appD,methodD1') 
return r
```

## 过滤

```sql
MATCH p=(startM)-[r:METHOD_CALLS]->(endM) 
where r.tid='T0001'
RETURN startM, r, endM 
LIMIT 1000
```

## 根据节点直接查询

```
MATCH (n)-[r]-(m)
WHERE ID(n) = node_id
RETURN r
```

## 操作

### 应用与方法

```sql
// 创建应用节点  
CREATE (appA:Application {name: '应用A', id:'appA'});  
CREATE (appB:Application {name: '应用B', id:'appB'});  
CREATE (appC:Application {name: '应用C', id:'appC'});  
  
// 创建方法节点  
CREATE (methodA:Method {name: 'appA-methodA', id: 'methodA', app: 'appA'});  
CREATE (methodB:Method {name: 'appB-methodB', id: 'methodB', app: 'appB'});  
CREATE (methodC1:Method {name: 'appC-methodC1', id: 'methodC1', app: 'appC'});  
CREATE (methodC2:Method {name: 'appC-methodC2', id: 'methodC2', app: 'appC'});  

// 创建所属关系
MATCH (node1:Method), (node2:Application)  
WHERE node1.id = 'methodA' AND node2.id = 'appA'  
CREATE (node1)-[:REF]->(node2);

MATCH (node1:Method), (node2:Application)  
WHERE node1.id = 'methodB' AND node2.id = 'appB'  
CREATE (node1)-[:REF]->(node2);

MATCH (node1:Method), (node2:Application)  
WHERE node1.id = 'methodC1' AND node2.id = 'appC'  
CREATE (node1)-[:REF]->(node2);

MATCH (node1:Method), (node2:Application)  
WHERE node1.id = 'methodC2' AND node2.id = 'appC'  
CREATE (node1)-[:REF]->(node2);

// 创建 chain 节点
CREATE (chain1:Chain {name: 'appA-methodA-chain1', id:'chain1', method: 'methodA'});  
CREATE (chain2:Chain {name: 'appB-methodB-chain2', id:'chain2', method: 'methodB'});  
CREATE (chain3:Chain {name: 'appC-methodC1-chain3', id:'chain3', method: 'methodC1'});  
CREATE (chain4:Chain {name: 'appC-methodC2-chain4', id:'chain4', method: 'methodC2'}); 

// 链路的从属关系
MATCH (node1:Chain), (node2:Method)  
WHERE node1.id = 'chain1' AND node2.id = 'methodA'  
CREATE (node1)-[:REF]->(node2);

MATCH (node1:Chain), (node2:Method)  
WHERE node1.id = 'chain2' AND node2.id = 'methodB'  
CREATE (node1)-[:REF]->(node2);

MATCH (node1:Chain), (node2:Method)  
WHERE node1.id = 'chain3' AND node2.id = 'methodC1'  
CREATE (node1)-[:REF]->(node2);

MATCH (node1:Chain), (node2:Method)  
WHERE node1.id = 'chain4' AND node2.id = 'methodC2'  
CREATE (node1)-[:REF]->(node2);

// 链路的调用关系
MATCH (node1:Chain), (node2:Chain)  
WHERE node1.id = 'chain1' AND node2.id = 'chain2'  
CREATE (node1)-[:CALLS]->(node2);

MATCH (node1:Chain), (node2:Chain)  
WHERE node1.id = 'chain2' AND node2.id = 'chain3'  
CREATE (node1)-[:CALLS]->(node2);

MATCH (node1:Chain), (node2:Chain)  
WHERE node1.id = 'chain2' AND node2.id = 'chain4'  
CREATE (node1)-[:CALLS]->(node2);
```


这个模型假设每个方法都属于一个应用，并且我们用一个CALLS关系表示一个方法调用另一个方法。

你可以根据你的具体需求调整这个模型。

例如，如果一个方法可以调用多个其他方法，或者一个方法可以被多个方法调用，你可能需要调整这个模型以反映这些情况。


# method-scene 设计

## scene

```
sceneCode 编码
sceneName 名称
sceneRemark 备注
```

## method

固定的属性

```
appName: 应用名称
methodName: 方法全称（唯一索引）
methodType: 方法类别 DAL/WEB/SERVICE
```

主要考虑方法，不先关注场景/APP 的从属关系。

## 链路假设

简单，为了便于分析。指定两条不同的链路。


TODO:...


# 小结

基本的关系创建实例。

# 参考资料


* any list
{:toc}

