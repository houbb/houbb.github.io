---
layout: post
title: 数据库查询工具 linq java 入门介绍-更加优雅的流式集合处理
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, olap, sh]
published: true
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

# LINQ

术语“LINQ to Objects”指直接将 LINQ 查询与任何 `IEnumerable<T>` 集合一起使用。 

可以使用 LINQ 来查询任何可枚举的集合，例如 Primitive Array、Object Array、 List、 Collection 或 Iterable 等等。 

该集合可以是用户定义的集合，也可以是由 Java 开发包 API 返回的集合。

从根本上说，“LINQ to Objects”表示一种新的处理集合的方法。 

采用旧方法，必须编写指定如何从集合检索数据的复杂的 foreach 循环。 

而采用 LINQ 方法，只需编写描述要检索的内容的声明性代码。

此外，LINQ 查询与传统 foreach 循环相比具有两大优势：

- 它们更简明、更易读，尤其在筛选多个条件时。

- 它们使用最少的应用程序代码提供强大的筛选、排序和分组功能。

LINQ 查询与 Stream API 相比也具有一定优势：

- 支持 foreach 循环，因此你可以随时中断循环。

- 可以重复遍历 IEnumerable 接口对象。

- LINQ 非常易于使用，如 ToCollection、LeftJoin 等。

- 在大多数复杂情况下，LINQ 比 Stream API 更快。

通常，对数据执行的操作越复杂，就越能体会到 LINQ 相较于传统迭代技术的优势。

## 特性

- 实现了 LINQ to Objects 的所有 API。

- 支持更多 API 和元组。

- 支持 IEnumerable 和 Stream 互相转换。

- 支持 Android。

方法导航：

![方法导航](https://github.com/timandy/linq/blob/master/linq.svg)

# API

## Linq 的 API

- empty

- singleton

- ofNullable

- of

- as

- chars

- words

- lines

- split

- infinite

- loop

- enumerate

- iterate

- range

- repeat

## IEnumerable 的 API

```
forEach
stream
parallelStream
aggregate
all
any
append
asEnumerable
average
cast
chunk
concat
contains
count
crossJoin
defaultIfEmpty
distinct
distinctBy
elementAt
elementAtOrDefault
except
exceptBy
findIndex
findLastIndex
first
firstOrDefault
format
fullJoin
groupBy
groupJoin
indexOf
intersect
intersectBy
join
joining
last
lastIndexOf
lastOrDefault
leftJoin
longCount
max
maxBy
min
minBy
ofType
orderBy
orderByDescending
prepend
reverse
rightJoin
runOnce
select
selectMany
sequenceEqual
shuffle
single
singleOrDefault
skip
skipLast
skipWhile
sum
take
takeLast
takeWhile
toArray
toCollection
toEnumeration
toLinkedList
toLinkedMap
toLinkedSet
toList
toLookup
toMap
toSet
union
unionBy
where
zip
```

## IGrouping(继承 IEnumerable) 的 API

getKey

## ILookup(继承 IEnumerable) 的 API

getCount
get
containsKey

## IOrderedEnumerable(继承 IEnumerable) 的 API

thenBy
thenByDescending

## Index 的 API

fromStart

fromEnd

getValue

isFromEnd

getOffset

Range 的 API

startAt

endAt

getStart

getEnd

getOffsetAndLength


## 元组类

Tuple1

Tuple2

Tuple3

Tuple4

Tuple5

Tuple6

Tuple7

TupleN


# 入门例子

## Maven

```xml
<dependency>
    <groupId>com.bestvike</groupId>
    <artifactId>linq</artifactId>
    <version>6.0.0</version>
</dependency>
```

## 用法

如果使用 java 8 或 java 9，建议用 lombok.var 或 lombok.val 代替复杂的返回类型。 

如果使用 java 10 或更高版本，建议使用 var 代替复杂的返回类型。

拼接不为空的字符串。

```java
String result = Linq.of("!@#$%^", "C", "AAA", "", "Calling Twice", "SoS", Empty)
        .where(x -> x != null && x.length() > 0)
        .aggregate((x, y) -> x + ", " + y);

System.out.println(result);


----
!@#$%^, C, AAA, Calling Twice, SoS
```

判断所有的正数是否全部为偶数。

```java
boolean result = Linq.of(9999, 0, 888, -1, 66, -777, 1, 2, -12345)
        .where(x -> x > 0)
        .all(x -> x % 2 == 0);

System.out.println(result);
----
false
```

判断所有的正数是否存在任一偶数。

```java
boolean result = Linq.of(9999, 0, 888, -1, 66, -777, 1, 2, -12345)
        .where(x -> x > 0)
        .any(x -> x % 2 == 0);

System.out.println(result);
----
true
```

在末尾追加一个数字并在头部插入两个数字。

```java
String result = Linq.range(3, 2).append(5).prepend(2).prepend(1).format();

System.out.println(result);
----
[1, 2, 3, 4, 5]
```

计算整数序列的平均值。

```java
double result = Linq.of(5, -10, 15, 40, 28).averageInt();

System.out.println(result);
----
15.6
```


连接两个整数序列。

```java
String result = Linq.of(1, 2).concat(Linq.of(3, 4)).format();

System.out.println(result);
----
[1, 2, 3, 4]
```

# chat

## 详细介绍一下 linq

LINQ，全称为Language Integrated Query，是集成在.NET编程语言中的一种特性。

它是为.NET Framework提供的一种更加通用和便利的信息查询方式，支持对多种数据源进行查询，而不仅仅局限于关系型数据库和XML。

LINQ已经成为编程语言的组成部分，因此在编程时可以进行语法检查，并且提供了丰富的元数据、智能感知和静态类型等强类型语言的好处。此外，LINQ还使得查询可以方便地对内存中的信息进行查询，而不仅仅只是外部数据源。

LINQ定义了一组标准查询操作符，这些操作符用于所有基于.NET平台的编程语言中更加直接地声明跨越、过滤和投射操作的统一方式。标准查询操作符允许查询作用于所有基于IEnumerable接口的源，并且它还允许适合于目标域或技术的第三方特定域操作符来扩大标准查询操作符集。第三方操作符可以用它们自己提供附加服务的实现来自由地替换标准查询操作符。

LINQ不仅提供了对数据的查询操作，还提供了对数据的转换和修改操作。这使得开发者可以在不改变原有数据源的情况下，对数据进行各种处理，如过滤、排序、分组、聚合等。

除了对数据的查询和转换操作，LINQ还支持多种数据源，如SQL数据库、XML、对象集合等。这使得开发者可以使用统一的查询语法来处理不同的数据源，从而简化了代码的开发和维护。

总之，LINQ是一种强大的查询语言，它提供了丰富的查询操作符和灵活的数据处理方式，使得开发者可以更加高效地进行数据查询和处理。同时，LINQ还支持多种数据源，使得开发者可以使用统一的查询语法来处理不同的数据源，从而提高了代码的可读性和可维护性。

## linq 有哪些 api 可以在哪里看？给出官方文档地址

LINQ (Language Integrated Query) 是一组在 .NET Framework 中提供的 API，允许开发者以统一的方式查询和操作多种数据源。这些 API 包括一系列的标准查询操作符，这些操作符可以在多种基于 IEnumerable 接口的源上使用，同时也支持第三方特定域操作符的扩展。

要查看 LINQ 的 API 文档，您可以访问 Microsoft 的官方文档网站。以下是一些与 LINQ 相关的官方文档地址：

LINQ 概述：
https://docs.microsoft.com/en-us/dotnet/csharp/linq/

https://learn.microsoft.com/en-us/dotnet/standard/linq/

在这些文档中，您可以找到关于 LINQ 的详细信息，包括其基本概念、使用场景、API 列表、示例代码等。

这些文档对于理解 LINQ 的功能和使用方法非常有帮助。

请注意，这些链接指向的是英文文档。如果您需要中文文档，可以尝试在搜索引擎中输入“LINQ 中文文档”或访问 Microsoft 的中文开发者社区网站，以找到相应的中文资源。

# 参考资料

https://github.com/timandy/linq


* any list
{:toc}