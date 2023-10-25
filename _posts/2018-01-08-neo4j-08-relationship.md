---
layout: post
title:  Neo4j-08-图数据库 neo4j relationship 关系 
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---

# Neo4j CQL - 关系基础

Neo4j图数据库遵循属性图模型来存储和管理其数据。

根据属性图模型，关系应该是定向的。 否则，Neo4j将抛出一个错误消息。

基于方向性，Neo4j关系被分为两种主要类型。

1. 单向关系

2. 双向关系

在以下场景中，我们可以使用Neo4j CQL CREATE命令来创建两个节点之间的关系。 

这些情况适用于Uni和双向关系。

在两个现有节点之间创建无属性的关系

在两个现有节点之间创建有属性的关系

在两个新节点之间创建无属性的关系

在两个新节点之间创建有属性的关系

在具有WHERE子句的两个退出节点之间创建/不使用属性的关系

## 注意

我们将创建客户和CreditCard之间的关系，如下所示：

![关系](https://www.tutorialspoint.com/neo4j/images/create_relationship_example1.png)

在上一章中，我们已经创建了Customer和CreditCard节点。 现在我们将看到如何创建它们之间的关系

此图描述了客户与CreditCard之间的关系

客户→信用卡

这里的关系是箭头标记（→）

由于Neo4j CQL语法是以人类可读的格式。 Neo4j CQL也使用类似的箭头标记来创建两个节点之间的关系。

每个关系（→）包含两个节点

从节点

到节点

从上图中，Customer节点是“From Node”，CreditCard Node是“To Node”这种关系。

对于节点，它们是两种关系

外向关系

传入关系

从上图中，关系是到客户节点的“外向关系”，并且相同的关系是到信用卡节点的“到达关系”。

考虑下面的图。

这里我们创建了从“CreditCard”节点到“客户”节点的关系。

![ref](https://atts.w3cschool.cn/attachments/day_161226/201612261732166330.png)

从上面的图中，关系是“出局关系”到“信用卡”节点，并且相同的关系是“到达关系”到“客户”节点。

考虑下面的图。 

我们在“CreditCard”和“Customer”节点之间创建了两个关系：一个从“CreditCard”到“Customer”。

另一个从“客户”到“信用卡”。 
 
这意味着它是双向关系。

# Neo4j - 方向关系

在Neo4j中，两个节点之间的关系是有方向性的。 它们是单向或双向的。

由于Neo4j遵循属性图数据模型，它应该只支持方向关系。 

如果我们尝试创建一个没有任何方向的关系，那么Neo4j DB服务器应该抛出一个错误。

在本章中，我们将提供一个例子来证明这一点。

我们使用以下语法来创建两个节点之间的关系。

## 语法

```sql
CREATE (<node1-details>)-[<relationship-details>]->(<node2-details>)
```

这里 -

`<node1-details>` 是“From Node”节点详细信息

`<node2-details>` 是“到节点”节点详细信息

`<relationship-details>` 是关系详细信息

## 测试

```sql
CREATE (n1:Node1)-[r1:Relationship]-(n2:Node2)
```

会报错：

```
Only directed relationships are supported in CREATE (line 1, column 18 (offset: 17))
"CREATE (n1:Node1)-[r1:Relationship]-(n2:Node2)"
                  ^
```

# Neo4j-创建没有属性的关系

在这种情况下，我们将使用两个现有节点：CreditCard和Customer创建没有属性的关系。 

这意味着，我们的Neo4J数据库应该有这两个节点。

我们使用CQL MATCH命令检索现有的两个节点和CQL CREATE命令，以创建它们之间的新关系。

## 匹配已有节点语法

```sql
MATCH (<node1-label-name>:<nodel-name>),(<node2-label-name>:<node2-name>)
CREATE  
	(<node1-label-name>)-[<relationship-label-name>:<relationship-name>{<define-properties-list>}]->(<node2-label-name>)
RETURN <relationship-label-name>
```

注意：

在此语法中，RETURN子句是可选的。 如果我们想立即看到结果，那么使用它。 否则，我们可以省略这个子句。

## 新建节点

```sql
CREATE  
   (<node1-label-name>:<node1-name>)-
   [<relationship-label-name>:<relationship-name>]->
   (<node1-label-name>:<node1-name>)
RETURN <relationship-label-name>
```

## 测试

创建一个用户

```sql
CREATE (e:Customer{name:'老马啸西风', age: 20}) 
RETURN e;

CREATE (e:Customer{name:'黑马', age: 33}) 
RETURN e
```

创建一个信用卡

```sql
CREATE (c:CreditCard{bankName:'中国银行', bankNo:'123456789'})
RETURN c;

CREATE (c:CreditCard{bankName:'招商银行', bankNo:'998776666'})
RETURN c;
```

创建关系：

```sql
MATCH (e:Customer),(cc:CreditCard) 
CREATE (e)-[r:DO_SHOPPING_WITH ]->(cc) 
```

这里关系名称为“DO_SHOPPING_WITH”，关系标签为“r”。

这个直接会让所有的用户，和所有的信用卡之间创建一个链接。

查询对应的关系：

```sql
MATCH (e)-[r:DO_SHOPPING_WITH ]->(cc) 
RETURN r
```

返回的是数据 JSON:

```json
{
  "identity": 0,
  "start": 5,
  "end": 6,
  "type": "DO_SHOPPING_WITH",
  "properties": {

  },
  "elementId": "0",
  "startNodeElementId": "5",
  "endNodeElementId": "6"
}
```

有多个。

# 创建有属性的节点关系

在这种情况下，我们将使用两个现有节点：CreditCard和Customer创建与属性的关系。 

这意味着，我们的Neo4J数据库应该有这两个节点。

我们使用CQL MATCH命令检索现有的两个节点和CQL CREATE命令，以创建它们之间的新关系。

## 语法：

```sql
MATCH (<node1-label-name>:<node1-name>),(<node2-label-name>:<node2-name>)
CREATE  
	(<node1-label-name>)-[<relationship-label-name>:<relationship-name>
	{<define-properties-list>}]->(<node2-label-name>)
RETURN <relationship-label-name>
```

注意 -

在此语法中，RETURN子句是可选的。 如果我们想立即看到结果，那么使用它。 否则，我们可以省略这个子句。

### 使用新节点

match 改为 create

```sql
CREATE  
	(<node1-label-name>:<node1-name>{<define-properties-list>})-
	[<relationship-label-name>:<relationship-name>{<define-properties-list>}]
	->(<node1-label-name>:<node1-name>{<define-properties-list>})
RETURN <relationship-label-name>
```

## 测试

```sql
MATCH (emp:Employee),(dept:Dept) 
CREATE (emp)-[r:JOIN{joinDate:"2023-10-25", price:8000}]->(dept) 
RETURN r
```

这个时候，这条边就会有对应的属性值。

```
<id>: 4
joinDate: 2023-10-25
price: 8000
```


# 查询关系的详细信息

我们可以使用MATCH + RETURN命令来查看单独创建或作为关系的一部分创建的节点的详细信息。

在本章中，我们将讨论如何检索参与关系的Node的详细信息。

## 语法

```sql
MATCH 
(<node1-label-name>)-[<relationship-label-name>:<relationship-name>]->(<node2-label-name>)
RETURN <relationship-label-name>
```

## 测试

```sql
MATCH (cust)-[r:DO_SHOPPING_WITH]->(cc) 
RETURN cust,cc
```

得到是节点的信息

```
═══════════════════════════════════╤════════════════════════════════════════════════════╕
│cust                               │cc                                                  │
╞═══════════════════════════════════╪════════════════════════════════════════════════════╡
│(:Customer {name: "老马啸西风",age: 20})│(:CreditCard {bankNo: "123456789",bankName: "中国银行"})│
├───────────────────────────────────┼────────────────────────────────────────────────────┤
│(:Customer {name: "老马啸西风",age: 20})│(:CreditCard {bankNo: "998776666",bankName: "招商银行"})│
├───────────────────────────────────┼────────────────────────────────────────────────────┤
│(:Customer {name: "黑马",age: 33})   │(:CreditCard {bankNo: "123456789",bankName: "中国银行"})│
├───────────────────────────────────┼────────────────────────────────────────────────────┤
│(:Customer {name: "黑马",age: 33})   │(:CreditCard {bankNo: "998776666",bankName: "招商银行"})│
└───────────────────────────────────┴────────────────────────────────────────────────────┘
```

可以把对应的 r 也一起返回：

```sql
MATCH (cust)-[r:DO_SHOPPING_WITH]->(cc) 
RETURN cust,cc, r
```

如下：

```
╒═══════════════════════════════════╤════════════════════════════════════════════════════╤═══════════════════╕
│cust                               │cc                                                  │r                  │
╞═══════════════════════════════════╪════════════════════════════════════════════════════╪═══════════════════╡
│(:Customer {name: "老马啸西风",age: 20})│(:CreditCard {bankNo: "123456789",bankName: "中国银行"})│[:DO_SHOPPING_WITH]│
├───────────────────────────────────┼────────────────────────────────────────────────────┼───────────────────┤
│(:Customer {name: "老马啸西风",age: 20})│(:CreditCard {bankNo: "998776666",bankName: "招商银行"})│[:DO_SHOPPING_WITH]│
├───────────────────────────────────┼────────────────────────────────────────────────────┼───────────────────┤
│(:Customer {name: "黑马",age: 33})   │(:CreditCard {bankNo: "123456789",bankName: "中国银行"})│[:DO_SHOPPING_WITH]│
├───────────────────────────────────┼────────────────────────────────────────────────────┼───────────────────┤
│(:Customer {name: "黑马",age: 33})   │(:CreditCard {bankNo: "998776666",bankName: "招商银行"})│[:DO_SHOPPING_WITH]│
└───────────────────────────────────┴────────────────────────────────────────────────────┴───────────────────┘
```

# 参考资料

https://www.w3cschool.cn/neo4j/neo4j_cql_relationship_basics.html

https://www.w3cschool.cn/neo4j/neo4j_directional_relationships.html

* any list
{:toc}

