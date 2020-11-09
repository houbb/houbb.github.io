---
layout: post
title: Mongo geospatial data-25  Mongo 地理数据查询
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, sh]
published: true
---

# 地理空间数据

在 mongodb 中, 可以将地理空间数据存储为 geojson 对象或旧坐标对。

# geojson 对象

要在类似地球的球体上计算几何图形, 请将位置数据存储为 geojson 对象。

若要指定 geojson 数据, 请使用嵌入文档:

- 一个名为类型的字段, 指定 geojson 对象类型和

- 一个名为坐标的字段, 指定对象的坐标。

如果指定纬度和经度坐标, 请先列出经度, 然后列出纬度:

      - 有效经度值介于-180 和180之间, 包括在内。

      - 有效纬度值介于-90 和90之间 (包括在内)。

## 例子

```
location: {
      type: "Point",
      coordinates: [-73.856077, 40.848447]
}
```

有关 mongodb 中支持的 geojson 对象的列表以及示例, 请参阅 geojson 对象。

在球体上计算 geojson 对象的 mongodb 地理空间查询;

mongodb 使用 wgs84 参考系统对 geojson 对象进行地理空间查询。

# 传统坐标对

若要计算欧几里得平面上的距离, 请将位置数据存储为传统坐标对, 并使用2d 索引。

mongodb 通过将数据转换为 geojson point 类型, 通过2dsphere 索引支持对遗留坐标对的球面计算。

若要将数据指定为旧式坐标对, 可以使用数组 (首选) 或嵌入文档。

## 数组

如果指定纬度和经度坐标, 请先列出经度, 然后列出纬度;

```
<field>: [<longitude>, <latitude> ]
```

如果指定纬度和经度坐标, 请先列出经度, 然后列出纬度:

1. 有效经度值介于-180 和180之间, 包括在内。

2. 有效纬度值介于-90 和90之间 (包括在内)。

## 嵌套文档

```
<field>: { <field1>: <x>, <field2>: <y> }
```

如果指定纬度和经度坐标, 则第一个字段 (不考虑字段名称) 必须包含经度值和第二个字段 (纬度值); 

如果指定纬度和经度坐标, 则第一个字段都必须包含经度值和第二个字段 (纬度值)。

```
<field>: { <field1>: <longitude>, <field2>: <latitude> }
```

1. 有效经度值介于-180 和180之间, 包括在内。

2. 有效纬度值介于-90 和90之间 (包括在内)。

若要指定遗留坐标对, 数组优先于嵌入文档, 因为某些语言不能保证关联映射排序。


# 地理空间索引

mongodb 提供以下地理空间索引类型来支持地理空间查询。

## 2dsphere

2 dsphere 索引支持计算类似地球的球体几何形状的查询。

若要创建2dsphere 索引, 请使用 db.collection.createIndex() 方法, 并将字符串文本 "2dsphere" 指定为索引类型:

```
db.collection.createIndex( { <location field> : "2dsphere" } )
```

其中 `<location field> ` 是一个字段, 其值为 geojson 对象或旧坐标对。

有关2dsphere 索引的详细信息, 请参阅 2dsphere 索引。

## 二维

2d 索引支持在二维平面上计算几何形状的查询。

尽管索引可以支持在球体上计算 `$nearSphere` 查询, 但如果可能, 请使用2dsphere 索引进行球面查询。

若要创建2d 索引, 请使用 db.collection.createIndex() 方法, 将位置字段指定为键, 将字符串文本  2d 指定为索引类型:

```
db.collection.createIndex( { <location field> : "2d" } )
```

其中 `<location field>` 是一个字段, 其值是一个传统的坐标对。

有关2d 索引的详细信息, 请参阅2d 索引。

## 地理空间索引和锐化集合

在分片集合时, 不能将地理空间索引用作分片键。

但是, 您可以使用不同的字段作为分片键, 在共享集合上创建地理空间索引。

共享集合支持以下地理空间操作:

1. $geoNear 聚合阶段

2. $near 和 $nearSphere 查询运算符 (从 mongodb 4.0 开始)

3. "geoNear" 命令 (在 mongodb 4.0 中已弃用)

从 mongodb 4.0 开始, 共享集合支持 $near 和 $nearSphere 查询。

在早期的 mongodb 版本中, 共享集合不支持 $near 和 $nearSphere 查询;

相反, 对于共享的群集, 必须使用 $geoNear 聚合阶段和已弃用的 geoNear 命令。

您还可以使用 $geoWithin 和 $geoIntersect 查询共享群集的地理空间数据。

## Covered Queries

[Geospatial indexes](https://docs.mongodb.com/manual/geospatial-queries/#index-feature-geospatial) cannot [cover a query](https://docs.mongodb.com/manual/core/query-optimization/#covered-queries).

# 地理空间查询

> 注意

对于球面查询, 请使用 2 dsphere 索引结果。

对球面查询使用2d 索引可能会导致不正确的结果, 例如对环绕极点的球面查询使用2d 索引。

# TODO...

其他相关知识，待补充

# 参考资料

[geospatial-queries](https://docs.mongodb.com/manual/geospatial-queries/)

* any list
{:toc}