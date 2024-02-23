---
layout: post
title: Apache Calcite advanced 04 Materialized Views 物化视图
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 由Calcite维护的物化视图

有关详细信息，请参阅网格文档。

将物化视图暴露给Calcite

一些Calcite适配器以及依赖于Calcite的项目具有自己的物化视图概念。

例如，Apache Cassandra允许用户基于现有表定义物化视图，这些视图会自动维护。Cassandra适配器会自动将这些物化视图暴露给Calcite。

另一个例子是Apache Hive。当在Hive中创建物化视图时，用户可以指定视图是否可以在查询优化中使用。如果用户选择这样做，物化视图将在Calcite中注册。

通过在Calcite中注册物化视图，优化器有机会自动重写查询以使用这些视图。

# 基于视图的查询重写

基于视图的查询重写旨在接受一个可以使用预先存在的视图回答的输入查询，并重写查询以利用该视图。目前，Calcite有两种基于视图的查询重写实现。

## 通过规则转换进行替换

第一种方法是基于视图替换。SubstitutionVisitor及其扩展MaterializedViewSubstitutionVisitor旨在用使用物化视图的等价表达式替换关系代数树的部分。

对物化视图的扫描以及物化视图定义计划将与规划器注册。

然后，触发尝试统一计划中表达式的转换规则。

表达式不需要是等价的才能被替换：如果需要，访问者可以在表达式的顶部添加残留谓词。

下面的示例摘自SubstitutionVisitor的文档：

查询：SELECT a, c FROM t WHERE x = 5 AND b = 4
目标（物化视图定义）：SELECT a, b, c FROM t WHERE x = 5
结果：SELECT a, c FROM mv WHERE b = 4
请注意，结果使用了物化视图表mv和简化的条件b = 4。

虽然这种方法可以完成大量的重写，但它也有一些限制。

由于该规则依赖于转换规则来创建查询中表达式与物化视图之间的等价关系，它可能需要对给定表达式的所有可能的等价重写进行详尽的枚举，以找到物化视图的替换。

然而，在存在具有任意数量的连接运算符的复杂视图的情况下，这是不可伸缩的。

## 利用计划结构信息进行重写

另一种尝试通过提取关于要替换的表达式的某些结构信息来将查询与视图匹配的替代规则已被提出。

MaterializedViewRule建立在[GL01]中提出的思想基础上，并引入了一些附加扩展。

该规则可以重写包含任意Join、Filter和Project运算符链的表达式。

此外，该规则还可以重写以Aggregate运算符为根的表达式，如果需要的话，可以将聚合向上滚动。反过来，如果查询可以部分地从视图回答，则它还可以使用Union运算符生成重写。

为了产生更多的重写，该规则依赖于以约束的形式公开的信息，这些约束定义在数据库表上，例如外键、主键、唯一键或非空。

## 重写覆盖率

让我们用一些示例来说明MaterializedViewRule中实现的视图重写算法的覆盖范围。这些示例基于以下数据库模式。

```sql
CREATE TABLE depts(
  deptno INT NOT NULL,
  deptname VARCHAR(20),
  PRIMARY KEY (deptno)
);
CREATE TABLE locations(
  locationid INT NOT NULL,
  state CHAR(2),
  PRIMARY KEY (locationid)
);
CREATE TABLE emps(
  empid INT NOT NULL,
  deptno INT NOT NULL,
  locationid INT NOT NULL,
  empname VARCHAR(20) NOT NULL,
  salary DECIMAL (18, 2),
  PRIMARY KEY (empid),
  FOREIGN KEY (deptno) REFERENCES depts(deptno),
  FOREIGN KEY (locationid) REFERENCES locations(locationid)
);
```

## Join 重写

重写可以处理查询和视图定义中的不同连接顺序。

此外，该规则试图检测何时可以使用补偿谓词来生成使用视图的重写。

- 查询：

```sql
SELECT empid
FROM depts
JOIN (
  SELECT empid, deptno
  FROM emps
  WHERE empid = 1) AS subq
ON depts.deptno = subq.deptno
```

- Materialized view definition:

```sql
SELECT empid
FROM emps
JOIN depts USING (deptno)
```

- 重写

```sql
SELECT empid
FROM mv
WHERE empid = 1
```

## Aggregate rewriting 聚合重写

- query 

```sql
SELECT deptno
FROM emps
WHERE deptno > 10
GROUP BY deptno
```

- 物化视图

```sql
SELECT empid, deptno
FROM emps
WHERE deptno > 5
GROUP BY empid, deptno
```

- 重写

```sql
SELECT deptno
FROM mv
WHERE deptno > 10
GROUP BY deptno
```

## Aggregate rewriting (with aggregation rollup)Permalink

- query

```sql
SELECT deptno, COUNT(*) AS c, SUM(salary) AS s
FROM emps
GROUP BY deptno
```

- 物化视图

```sql
SELECT empid, deptno, COUNT(*) AS c, SUM(salary) AS s
FROM emps
GROUP BY empid, deptno
```

- 重写

```sql
SELECT deptno, SUM(c), SUM(s)
FROM mv
GROUP BY deptno
```

## 部分查询重写

通过声明的约束，该规则可以检测到仅追加列而不更改元组多重性的连接，并生成正确的重写。

- query

```sql
SELECT deptno, COUNT(*)
FROM emps
GROUP BY deptno
```

- 物化视图定义

```sql
SELECT empid, depts.deptno, COUNT(*) AS c, SUM(salary) AS s
FROM emps
JOIN depts USING (deptno)
GROUP BY empid, depts.deptno
```

- 重写

```sql
SELECT deptno, SUM(c)
FROM mv
GROUP BY deptno
```

## view 视图部分重写

- query 

```sql
SELECT deptname, state, SUM(salary) AS s
FROM emps
JOIN depts ON emps.deptno = depts.deptno
JOIN locations ON emps.locationid = locations.locationid
GROUP BY deptname, state
```

- 物化视图

```sql
SELECT empid, deptno, state, SUM(salary) AS s
FROM emps
JOIN locations ON emps.locationid = locations.locationid
GROUP BY empid, deptno, state
```

- 重写

```sql
SELECT deptname, state, SUM(s)
FROM mv
JOIN depts ON mv.deptno = depts.deptno
GROUP BY deptname, state
```

## union 重写

- query

```sql
SELECT empid, deptname
FROM emps
JOIN depts ON emps.deptno = depts.deptno
WHERE salary > 10000
```

- 物化视图

```sql
SELECT empid, deptname
FROM emps
JOIN depts ON emps.deptno = depts.deptno
WHERE salary > 12000
```

- 重启

```sql
SELECT empid, deptname
FROM mv
UNION ALL
SELECT empid, deptname
FROM emps
JOIN depts ON emps.deptno = depts.deptno
WHERE salary > 10000 AND salary <= 12000
```

## 使用聚合的Union重写   Union rewriting with aggregatePermalink

查询：

```sql
SELECT empid, deptname, SUM(salary) AS s
FROM emps
JOIN depts ON emps.deptno = depts.deptno
WHERE salary > 10000
GROUP BY empid, deptname
```

物化视图定义：
```sql
SELECT empid, deptname, SUM(salary) AS s
FROM emps
JOIN depts ON emps.deptno = depts.deptno
WHERE salary > 12000
GROUP BY empid, deptname
```

重写：
```sql
SELECT empid, deptname, SUM(s)
FROM (
  SELECT empid, deptname, s
  FROM mv
  UNION ALL
  SELECT empid, deptname, SUM(salary) AS s
  FROM emps
  JOIN depts ON emps.deptno = depts.deptno
  WHERE salary > 10000 AND salary <= 12000
  GROUP BY empid, deptname
) AS subq
GROUP BY empid, deptname
```

# 限制：

该规则仍然存在一些限制。特别是，重写规则试图将所有视图与每个查询进行匹配。

我们计划实现更精细的过滤技术，例如[GL01]中描述的技术。

# 参考资料

https://calcite.apache.org/docs/materialized_views.html

* any list
{:toc}