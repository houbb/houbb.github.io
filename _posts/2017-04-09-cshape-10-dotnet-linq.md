---
layout: post
title: LINQ
date:  2017-04-09 21:44:46 +0800
categories: [C#]
tags: [cshape, cshape, lang, .net, dotnet]
published: true
---


# LINQ

[LINQ](https://msdn.microsoft.com/zh-cn/library/bb397676.aspx) 是一组技术的名称，这些技术建立在将查询功能直接集成到 C# 语言（以及 Visual Basic 和可能的任何其他 **.NET** 语言）的基础上。 
借助于 LINQ，查询现在已是高级语言构造，就如同类、方法、事件等等。

对于编写查询的开发人员来说，LINQ 最明显的“语言集成”部分是查询表达式。 
查询表达式是使用 C# 3.0 中引入的声明性查询语法编写的。 通过使用查询语法，您甚至可以使用最少的代码对数据源执行复杂的筛选、排序和分组操作。 
您使用相同的基本查询表达式模式来查询和转换 SQL 数据库、ADO.NET 数据集、XML 文档和流以及 .NET 集合中的数据。


# 查询表达式基础

一、什么是查询？它有什么用途？

“查询”是指一组指令，这些指令描述要从一个或多个给定数据源检索的数据以及返回的数据应该使用的格式和组织形式。

指定此源序列后，查询可以进行下列三项工作之一：

- 检索一个元素子集以产生一个新序列，但不修改单个元素。 然后，查询可以按各种方式对返回的序列进行排序或分组。

如下面的示例所示（假定 scores 是 int[]）：

```c#
IEnumerable<int> highScoresQuery =
                from score in scores
                where score > 80
                orderby score descending
                select score;
```

- 检索一个元素序列，但是将这些元素转换为具有新类型的对象。

例如，查询可以只从数据源中的某些客户记录检索姓氏。 或者，查询可以检索完整的记录，再使用它构建另一个内存中对象类型甚至 XML 数据，然后生成最终的结果序列。 

下面的示例演示了从 int 到 string 的转换。 请注意 highScoresQuery 的新类型。

```c#
IEnumerable<string> highScoresQuery2 =
                from score in scores
                where score > 80
                orderby score descending
                select String.Format("The score is {0}", score);
```

- 检索有关源数据的单一值

例如：
符合某个条件的元素的数量。
具有最大值或最小值的元素。
符合某个条件的第一个元素，或一组指定元素中的特定值之和。 例如，下面的查询从 scores 整数数组中返回高于 80 的分数的数量。

```c#
int highScoreCount =
                (from score in scores
                 where score > 80
                 select score)
                 .Count();
```

在上一个示例中，请注意在 Count 方法调用之前的查询表达式两旁使用了括号。 

另一种表示方式是使用一个新变量来存储具体结果。 此技术的可读性更好，因为它将存储查询的变量与存储结果的查询区分开来。

```c#
IEnumerable<int> highScoresQuery3 =
                from score in scores
                where score > 80
                select score;

int scoreCount = highScoresQuery3.Count();
```

在上一个示例中，查询是在 Count 调用中执行的，因为 Count 必须循环访问结果以便确定 highScoresQuery 返回的元素数量。

二、什么是查询表达式？

查询表达式必须以 `from` 子句开头，并且必须以 `select` 或 `group` 子句结尾。 
在第一个 from 子句和最后一个 select 或 group 子句之间，查询表达式可以包含一个或多个下列可选子句：where、orderby、join、let 甚至附加的 from 子句。 
还可以使用 into 关键字使 join 或 group 子句的结果能够充当同一查询表达式中附加查询子句的源。

> 查询变量

在 LINQ 中，查询变量是任何存储查询（而非查询结果）的变量。更具体地说，查询变量始终是一个**可枚举**的类型，当在 foreach 语句中或在对其 IEnumerator.MoveNext 方法的直接调用中循环访问它时，它会生成一序列元素。

- QueryVar();

```c#
//93 90 82 82
static void QueryVar()
{ 
    // Data source.
    int[] scores = { 90, 71, 82, 93, 75, 82 };

    // Query Expression.
    IEnumerable<int> scoreQuery = //query variable
        from score in scores //required
        where score > 80 // optional
        orderby score descending // optional
        select score; //must end with select or group

    // Execute the query to produce the results
    foreach (int testScore in scoreQuery)
    {
        Console.WriteLine(testScore);
    }
}
```
















* any list
{:toc}



