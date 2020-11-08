---
layout: post
title: Mongo extend json-06
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, sh]
published: true
---

# mongo extend json

json 只能表示 bson 支持的类型的子集。

为了保留类型信息, mongodb 将以下扩展添加到 json 格式:

- 严格模式。

bson 类型的严格模式表示符合 [json rfc](http://www.json.org/)。

任何 json 解析器都可以将这些严格的模式表示解析为 key/值对;但是, 只有 mongodb 内部 json 解析器才能识别格式传递的类型信息。

- 蒙戈外壳模式。

mongodb 内部 json 解析器和 mongo shell 可以分析此模式。

用于各种数据类型的表示形式取决于在其中分析 json 的上下文。

# Parsers and Supported Format

## 严格模式下的输入

下面的内容可以在严格模式下分析表示, 并识别类型信息。

- REST Interfaces

- mongoimport

- --query option of various MongoDB tools

- MongoDB Compass

其他 json 解析器 (包括 mongo shell 和 db.eval ()) 可以将严格模式表示解析为 key/value 对, 但不识别类型信息。

## Input in mongo Shell Mode

下面的内容可以在mongo shell 模式下分析表示, 并识别类型信息。

- REST Interfaces

- mongoimport

- --query option of various MongoDB tools

- mongo shell

## 严格模式下的输出

在严格模式下输出数据。

## Output in mongo Shell Mode

mongo shell 模式下的 bsondump 输出。


# BSON Data Types and Associated Representations

下面介绍了 "严格" 模式和 mongo 命令行模式下的 bson 数据类型和关联的表示形式。

## Binary

- 严格

```
{ "$binary": "<bindata>", "$type": "<t>" }
```

- mongo shell

```
BinData ( <t>, <bindata> )
```

`<bindata>` 是二进制字符串的 base64 表示形式。

`<t>` 是指示数据类型的单个字节的表示形式。

在严格模式下, 它是一个十六进制字符串, 在命令行管理程序模式下, 它是一个整数。

请参阅扩展 bson 文档。http://bsonspec.org/spec.html

## Date

- 严格模式

```
{ "$date": "<date>" }
```

- mongo shell 模式

```
new Date ( <date> )
```

在严格模式下, `<date>` 是一种 iso-8601 日期格式, 其时区字段遵循模板 `yyyy-mm-ddthh:mm <+/-Offset>`。

mongodb json 解析器目前不支持加载表示 unix 时代之前日期的 iso-8601 字符串。

当格式化前世纪日期和日期超过您的系统的时间 _t 类型可以容纳, 使用以下格式:

```
{ "$date" : { "$numberLong" : "<dateAsMilliseconds>" } }
```

在 shell 模式下, `<date>` 是64位带符号整数的 json 表示形式, 给出自世纪 utc 以来的毫秒数。

## Timestamp

- 严格模式

```
{ "$timestamp": { "t": <t>, "i": <i> } }
```

- mongo shell 模式

```
Timestamp( <t>, <i> )
```

## Regular Expression

- 严格模式

```
{ "$regex": "<sRegex>", "$options": "<sOptions>" }
```

- mongo shell 模式

```
/<jRegex>/<jOptions>
```

## OID

- Strict Mode	 	

```
{ "$oid": "<id>" }
```

- mongo Shell Mode

```
ObjectId( "<id>" )
```

`<id>` 是一个24个字符的十六进制字符串。

## DB Reference

- 严格模式

```
{ "$ref": "<name>", "$id": "<id>" }
```

- mongo Shell Mode

```
DBRef("<name>", "<id>")
```

## Undefined Type

- 严格模式

```
{ "$undefined": true }
```

- mongo Shell Mode

```
undefined
```

未定义类型的表示形式。

不能在查询文档中使用未定义的。请考虑插入到人员集合中的以下文档:

```
db.people.insert( { name : "Sally", age : undefined } )
```

下面的操作将返回异常

```
db.people.find( { age : undefined } )
db.people.find( { age : { $gte : undefined } } )
```

## MinKey

- 严格模式

```
{ "$minKey": 1 }
```

- mongo Shell Mode

```
MinKey
```

比较低于所有其他类型的 minkey bson 数据类型的表示形式。

有关 bson 类型的比较顺序的详细信息, 请参阅比较排序顺序。

## MaxKey

- 严格模式

```
{ "$maxKey": 1 }
```

- mongo Shell Mode

```
MaxKey
```

比较高于所有其他类型的 maxkey bson 数据类型的表示形式。

有关 bson 类型的比较顺序的详细信息, 请参阅比较排序顺序。

## NumberLong

New in version 2.6.


- 严格模式

```
{ "$numberLong": "<number>" }
```

- mongo Shell Mode

```
NumberLong( "<number>" )
```

数字龙是一个64位带符号的整数。您必须包括引号, 否则它将被解释为浮点数, 从而导致准确性的损失。

例如, 以下命令插入92233736364477807作为一个具有和不带引号的整数值:

```
db.json.insert( { longQuoted : NumberLong("9223372036854775807") } )
db.json.insert( { longUnQuoted : NumberLong(9223372036854775807) } )
```

检索文档时, "长" 取消引用 "的值已更改, 而" 长期引用 "保留其准确性:

```
db.json.find()
{ "_id" : ObjectId("54ee1f2d33335326d70987df"), "longQuoted" : NumberLong("9223372036854775807") }
{ "_id" : ObjectId("54ee1f7433335326d70987e0"), "longUnQuoted" : NumberLong("-9223372036854775808") }
```

## NumberDecimal

New in version 3.4.

- 严格模式

```
{ "$numberDecimal": "<number>" }
```

- mongo Shell Mode

```
NumberDecimal( "<number>" )
```

数字十进制是一个高精度的十进制。您必须包括引号, 否则输入编号将被视为双引号, 从而导致数据丢失。

例如, 以下命令将123.40 插入为数字十进制, 其值周围有引号和不带引号:

```
db.json.insert( { decimalQuoted : NumberDecimal("123.40") } )
db.json.insert( { decimalUnQuoted : NumberDecimal(123.40) } )
```

检索文档时, 抽取的值已更改, 而抽取保留其指定的精度:

```
db.json.find()
{ "_id" : ObjectId("596f88b7b613bb04f80a1ea9"), "decimalQuoted" : NumberDecimal("123.40") }
{ "_id" : ObjectId("596f88c9b613bb04f80a1eaa"), "decimalUnQuoted" : NumberDecimal("123.400000000000") }
```

# 参考资料

https://docs.mongodb.com/manual/reference/mongodb-extended-json/

* any list
{:toc}