---
layout: post
title: Apache Calcite advanced 02 Spatial 空间
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 空间 (Spatial)

Calcite 的目标是实现 OpenGIS SQL 版本 1.2.1 的简单要素实现规范，这是由空间数据库（如 PostGIS 和 H2GIS）实现的标准。

我们还计划为空间索引和其他形式的查询优化添加优化器支持。

# 介绍 (Introduction)

空间数据库是针对存储和查询代表几何空间中定义的对象的数据进行优化的数据库。

Calcite 对空间数据的支持包括：

- GEOMETRY 数据类型和子类型，包括 POINT、LINESTRING 和 POLYGON
- 空间函数（以 ST_ 为前缀；我们已经实现了约 150 个 OpenGIS 规范中的约 35 个）
- 最终还将包括查询重写以使用空间索引。

启用空间支持 (Enabling spatial support)

虽然 GEOMETRY 数据类型是内置的，但函数默认未启用。您需要在 JDBC 连接字符串中添加 fun=spatial 以启用函数。例如，sqlline：

```sh
$ ./sqlline
> !connect jdbc:calcite:fun=spatial "sa" ""
SELECT ST_PointFromText('POINT(-71.064544 42.28787)');
+-------------------------------+
| EXPR$0                        |
+-------------------------------+
| {"x":-71.064544,"y":42.28787} |
+-------------------------------+
1 row selected (0.323 seconds)
```

# 查询重写 (Query rewrites)

一类重写使用 Hilbert 空间填充曲线。假设一个表具有列 x 和 y 表示点的位置，还有一列 h 表示该点沿曲线的距离。那么涉及到从固定点到 (x, y) 的距离的谓词可以转换为涉及 h 范围的谓词。

假设我们有一个包含餐馆位置的表：

```sql
CREATE TABLE Restaurants (
  INT id NOT NULL PRIMARY KEY,
  VARCHAR(30) name,
  VARCHAR(20) cuisine,
  INT x NOT NULL,
  INT y NOT NULL,
  INT h  NOT NULL DERIVED (ST_Hilbert(x, y)))
SORT KEY (h);
```

优化器要求 h 是点 (x, y) 在 Hilbert 曲线上的位置，并且还要求表按 h 排序。DDL 语法中的 DERIVED 和 SORT KEY 子句是为了本示例而发明的，但带有 CHECK 约束的聚簇表同样有效。

查询

```sql
SELECT *
FROM Restaurants
WHERE ST_DWithin(ST_Point(x, y), ST_Point(10.0, 20.0), 6)
```

可以重写为

```sql
SELECT *
FROM Restaurants
WHERE (h BETWEEN 36496 AND 36520
    OR h BETWEEN 36456 AND 36464
    OR h BETWEEN 33252 AND 33254
    OR h BETWEEN 33236 AND 33244
    OR h BETWEEN 33164 AND 33176
    OR h BETWEEN 33092 AND 33100
    OR h BETWEEN 33055 AND 33080
    OR h BETWEEN 33050 AND 33053
    OR h BETWEEN 33033 AND 33035)
AND ST_DWithin(ST_Point(x, y), ST_Point(10.0, 20.0), 6)
```

重写的查询包含一组 h 范围，后跟原始的 ST_DWithin 谓词。范围谓词首先进行评估，由于表按 h 排序，因此非常快速。

这是完整的转换集：

| DESCRIPTION | EXPRESSION |
| ----------- | ---------- |
| 检查常量矩形 (X, X2, Y, Y2) 是否包含点 (a, b) | 重写为使用 Hilbert 索引   `ST_Contains(ST_Rectangle(X, X2, Y, Y2), ST_Point(a, b)))` |
| h BETWEEN C1 AND C2<br>OR …<br>OR h BETWEEN C2k AND C2k+1 | 检查常量几何图形 G 是否包含点 (a, b) <br>重写为使用常量几何图形的边界框，该框也是常量，然后像上述一样重写为 Hilbert 范围<br>`ST_Contains(ST_Envelope(G), ST_Point(a, b))`<br>`ST_Contains(ST_Rectangle(X, X2, Y, Y2), ST_Point(a, b)))` |
| 检查点 (a, b) 是否在围绕常量点 (X, Y) 的缓冲区内 | 前一种情况的特例，因为缓冲区是常量几何<br>`ST_Contains(ST_Buffer(ST_Point(a, b), D), ST_Point(X, Y))` |
| 检查点 (a, b) 是否在常量距离 D 内的常量点 (X, Y) | 首先，转换为缓冲区，然后使用常量几何的前一种情况重写<br>`ST_DWithin(ST_Point(a, b), ST_Point(X, Y), D))`<br>`ST_Contains(ST_Buffer(ST_Point(X, Y), D), ST_Point(a, b))` |
| 检查常量点 (X, Y) 是否在点 (a, b) 的常量距离 D 内 | 反转对 ST_DWithin 的调用参数，然后使用前一种情况重写<br>`ST_DWithin(ST_Point(X, Y), ST_Point(a, b), D))`<br>`ST_Contains(ST_Buffer(ST_Point(X, Y), D), ST_Point(a, b))` |

在上述中，a 和 b 是变量，X、X2、Y、Y2、D 和 G 是常量。

许多重写是不精确的：有些点在谓词返回 false 的情况下，重写的谓词返回 true。

例如，重写可能会将一个点是否在圆内的测试转换为一个点是否在圆的边界正方形内的测试。

执行这些重写是值得的，因为它们应用起来更快，并且通常允许在 Hilbert 索引上进行范围扫描。但为了安全起见，Calcite 应用原始谓词，以消除误报。

# 致谢 (Acknowledgements)

Calcite 的 OpenGIS 实现使用了 JTS Topology Suite。感谢我们从他们的社区得到的帮助。

在开发此功能时，我们广泛使用了 PostGIS 文档和测试以及 H2GIS 文档，并在规范不清晰时将其作为参考实现进行了咨询。感谢这些出色的项目。

# 参考资料

https://calcite.apache.org/docs/spatial.html

* any list
{:toc}