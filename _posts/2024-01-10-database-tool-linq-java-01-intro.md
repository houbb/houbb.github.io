---
layout: post
title: 数据库查询工具 linq java 入门介绍-更加优雅的流式集合处理
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, orm, jdbc, sql-budiler, sh]
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

# 参考资料

https://github.com/timandy/linq


* any list
{:toc}