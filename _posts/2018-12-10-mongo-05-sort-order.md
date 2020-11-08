---
layout: post
title: Mongo Sort Order-05
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, sh]
published: true
excerpt: Mongo Sort Order-05
---

# Comparison/Sort Order

在比较不同 bson 类型的值时, mongodb 使用以下比较顺序, 从最低到最高:

```
MinKey (internal type)
Null
Numbers (ints, longs, doubles, decimals)
Symbol, String
Object
Array
BinData
ObjectId
Boolean
Date
Timestamp
Regular Expression
MaxKey (internal type)
```

# 数字类型

mongodb 将某些类型视为等效类型, 以便进行比较。

例如, 数字类型在进行比较之前要进行转换。

# 字符串

## 二进制比较

默认情况下, mongodb 使用简单的二进制比较来比较字符串。

## Collation

3.4 版中的新版本。

排序规则允许用户指定字符串比较的特定于语言的规则, 例如字母大小写和重音标记的规则。

排序规则规范具有以下语法:

```
{
   locale: <string>,
   caseLevel: <boolean>,
   caseFirst: <string>,
   strength: <int>,
   numericOrdering: <boolean>,
   alternate: <string>,
   maxVariable: <string>,
   backwards: <boolean>
}
```

指定排序规则时, 区域设置字段是必需的;所有其他排序规则字段都是可选的。

有关字段的说明, 请参阅排序规则文档。

如果没有为集合或操作指定排序规则, mongodb 将使用以前版本中用于字符串比较的简单二进制比较。

# Arrays

对于数组, 小于比较或升序排序比较数组的最小元素, 而大于比较或降序排序比较数组的最大元素。

因此, 在将其值为单元素数组 (例如 `[1]`) 的字段与非数组字段 (例如 2) 进行比较时, 比较介于1和2之间。

空数组 (例如 `[]`) 的比较将空数组视为小于 null 或缺少的字段。

# 对象

mongodb 对 bson 对象的比较使用以下顺序:

1. 按照键值对在 bson 对象中出现的顺序进行递归比较。

2. 比较键字段名称。

3. 如果键字段名称相等, 请比较字段值。

4. 如果字段值相等, 请比较下一个键/值对 (返回到步骤 1)。没有进一步对的对象小于具有进一步对的对象。

# 日期和时间戳

在版本3.0.0 中更改: 在时间戳对象之前对日期对象进行排序。

以前的日期和时间戳对象一起排序。

# 不存在的字段

该比较将不存在的字段视为空的 bson 对象。

因此, 对文档 `{}` 和 `{a:null}` 中的字段进行排序将按排序顺序将文档视为等效文档。

# bindata

mongodb 按以下顺序对 bindata 进行排序:

1. 首先, 数据的长度或大小。

2. 然后, 由 bson 一字节子类型。

3. 最后, 通过数据, 执行逐字节比较。

# 参考资料

https://docs.mongodb.com/manual/reference/bson-type-comparison-order/

* any list
{:toc}