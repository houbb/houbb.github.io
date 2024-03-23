---
layout: post
title: 数据库查询工具 Language-Integrated Query (LINQ)  cshape 入门介绍
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, orm, jdbc, sql-budiler, sh]
published: true
---

# 拓展阅读

> [linq C#](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

# LINQ

Language-Integrated Query (LINQ) 为 C# 和 Visual Basic 提供了语言级查询功能以及高阶函数 API，使您能够编写具有表达能力的声明性代码。

# **语言级查询语法**

**这是语言级查询语法：**

```csharp
var linqExperts = from p in programmers
                  where p.IsNewToLINQ
                  select new LINQExpert(p);
```

**这是使用 `IEnumerable<T>` API 的相同示例：**

```csharp
var linqExperts = programmers.Where(p => p.IsNewToLINQ)
                             .Select(p => new LINQExpert(p));
```

在上面的代码中，`from p in programmers` 和 `programmers.Where(p => p.IsNewToLINQ)` 这两部分都用于从 `programmers` 集合中筛选元素。

`where p.IsNewToLINQ` 和 `.Where(p => p.IsNewToLINQ)` 则是筛选条件，只选择 `IsNewToLINQ` 属性为 `true` 的 `programmer` 对象。

最后，`select new LINQExpert(p)` 和 `.Select(p => new LINQExpert(p))` 用于创建一个新的 `LINQExpert` 对象，其中 `p` 是筛选出的 `programmer` 对象。

**注意：** 我已经用代码块将 C# 代码高亮显示。在大多数文本编辑器或 Markdown 编辑器中，使用三个反引号 (```) 开始和结束代码块，并在开始的反引号后指定语言名称（例如 `csharp`）可以实现代码高亮。


# LINQ 使代码更具表现力

想象一下你有一个宠物列表，但你想将其转换为一个字典，以便你可以直接使用宠物的 RFID 值来访问它。

这是传统的命令式代码：

```csharp
var petLookup = new Dictionary<int, Pet>();

foreach (var pet in pets)
{
    petLookup.Add(pet.RFID, pet);
}
```

上述代码背后的意图并不是创建一个新的 `Dictionary<int, Pet>` 并通过循环向其添加元素，而是将现有的列表转换为字典！LINQ 保留了这种意图，而命令式代码则没有。

这是等效的 LINQ 表达式：

```csharp
var petLookup = pets.ToDictionary(pet => pet.RFID);
```

使用 LINQ 的代码很有价值，因为它使程序员在推理时能够平衡意图和代码之间的关系。

另一个优点是代码简洁性。

想象一下，如果像上面那样将大量代码减少三分之一，不是很棒吗？

# LINQ 提供程序简化了数据访问

在大量实际使用的软件中，大部分工作都围绕从某种数据源（如数据库、JSON、XML 等）处理数据。

这通常意味着需要为每种数据源学习新的 API，这可能会令人烦恼。

LINQ 通过将常见的数据访问元素抽象为无论选择哪种数据源都看起来相同的查询语法来简化这一过程。

这是查找具有特定属性值的所有 XML 元素的示例：

```csharp
public static IEnumerable<XElement> FindAllElementsWithAttribute(XElement documentRoot, string elementName,
                                           string attributeName, string value)
{
    return from el in documentRoot.Elements(elementName)
           where (string)el.Element(attributeName) == value
           select el;
}
```

手动编写代码来遍历 XML 文档以完成此任务将更具挑战性。

使用 LINQ 提供程序不仅限于与 XML 交互。Linq to SQL 是一个针对 MSSQL Server 数据库的相当基础的对象关系映射器（ORM）。

Json.NET 库通过 LINQ 提供了高效的 JSON 文档遍历。

此外，如果没有现成的库满足您的需求，您还可以编写自己的 LINQ 提供程序！

# 使用查询语法的原因

为什么要使用查询语法？

这是一个经常出现的问题。

毕竟，以下代码：

```csharp
var filteredItems = myItems.Where(item => item.Foo);
```

比以下代码更简洁：

```csharp
var filteredItems = from item in myItems
                    where item.Foo
                    select item;
```

API 语法难道不是查询语法的更简洁方式吗？

不是。查询语法允许使用 `let` 子句，这允许您在表达式的范围内引入和绑定一个变量，并在表达式的后续部分中使用它。

虽然可以使用仅 API 语法来重现相同的代码，但很可能导致难以阅读的代码。

那么，您应该只使用查询语法吗？

如果符合以下情况，答案是肯定的：

1. 您的现有代码库已经使用查询语法。
2. 由于复杂性，您需要在查询中作用域变量。
3. 您更喜欢查询语法，并且它不会分散您代码库的注意力。

如果符合以下情况，答案是否定的：

1. 您的现有代码库已经使用 API 语法。
2. 您不需要在查询中作用域变量。
3. 您更喜欢 API 语法，并且它不会分散您代码库的注意力。

总的来说，选择使用查询语法还是 API 语法取决于您的具体需求和代码库的一致性。

两者都有其优点和适用场景，因此选择最适合您当前项目的语法是很重要的。

# LINQ基础

对于一份真正全面的LINQ示例列表，请访问101 LINQ示例。

以下示例快速演示了LINQ的一些基本组件。这绝非全面无遗的，因为LINQ提供了比这里所展示的更多的功能。

## LINQ的核心 - Where, Select, 和 Aggregate

```c#
// Filtering a list.
var germanShepherds = dogs.Where(dog => dog.Breed == DogBreed.GermanShepherd);

// Using the query syntax.
var queryGermanShepherds = from dog in dogs
                          where dog.Breed == DogBreed.GermanShepherd
                          select dog;

// Mapping a list from type A to type B.
var cats = dogs.Select(dog => dog.TurnIntoACat());

// Using the query syntax.
var queryCats = from dog in dogs
                select dog.TurnIntoACat();

// Summing the lengths of a set of strings.
int seed = 0;
int sumOfStrings = strings.Aggregate(seed, (partialSum, nextString) => partialSum + nextString.Length);
```

## Flattening a list of lists

```c#
// Transforms the list of kennels into a list of all their dogs.
var allDogsFromKennels = kennels.SelectMany(kennel => kennel.Dogs);
```

## Union between two sets (with custom comparator)

```c#
public class DogHairLengthComparer : IEqualityComparer<Dog>
{
    public bool Equals(Dog a, Dog b)
    {
        if (a == null && b == null)
        {
            return true;
        }
        else if ((a == null && b != null) ||
                 (a != null && b == null))
        {
            return false;
        }
        else
        {
            return a.HairLengthType == b.HairLengthType;
        }
    }

    public int GetHashCode(Dog d)
    {
        // Default hashcode is enough here, as these are simple objects.
        return d.GetHashCode();
    }
}
...

// Gets all the short-haired dogs between two different kennels.
var allShortHairedDogs = kennel1.Dogs.Union(kennel2.Dogs, new DogHairLengthComparer());
```

## Intersection between two sets

```c#
// Gets the volunteers who spend share time with two humane societies.
var volunteers = humaneSociety1.Volunteers.Intersect(humaneSociety2.Volunteers,
                                                     new VolunteerTimeComparer());
```

## ordering 排序

```c#
// Get driving directions, ordering by if it's toll-free before estimated driving time.
var results = DirectionsProcessor.GetDirections(start, end)
              .OrderBy(direction => direction.HasNoTolls)
              .ThenBy(direction => direction.EstimatedTime);
```

## 实例属性的相等性

最后，一个更高级的示例：确定同一类型的两个实例的属性值是否相等（从StackOverflow上的这篇帖子中借用并修改）：

```c#
public static bool PublicInstancePropertiesEqual<T>(this T self, T to, params string[] ignore) where T : class
{
    if (self == null || to == null)
    {
        return self == to;
    }

    // Selects the properties which have unequal values into a sequence of those properties.
    var unequalProperties = from property in typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance)
                            where !ignore.Contains(property.Name)
                            let selfValue = property.GetValue(self, null)
                            let toValue = property.GetValue(to, null)
                            where !Equals(selfValue, toValue)
                            select property;
    return !unequalProperties.Any();
}
```

# PLINQ

PLINQ（Parallel LINQ）是LINQ表达式的并行执行引擎。

换句话说，普通的LINQ表达式可以简单地跨多个线程进行并行化。这是通过在表达式前调用`AsParallel()`来实现的。

请考虑以下示例：

```c#
public static string GetAllFacebookUserLikesMessage(IEnumerable<FacebookUser> facebookUsers)
{
    var seed = default(UInt64);

    Func<UInt64, UInt64, UInt64> threadAccumulator = (t1, t2) => t1 + t2;
    Func<UInt64, UInt64, UInt64> threadResultAccumulator = (t1, t2) => t1 + t2;
    Func<Uint64, string> resultSelector = total => $"Facebook has {total} likes!";

    return facebookUsers.AsParallel()
                        .Aggregate(seed, threadAccumulator, threadResultAccumulator, resultSelector);
}
```

这段代码将根据需要把`facebookUsers`列表分区到系统的各个线程上，并行计算每个线程上用户的总点赞数，然后将每个线程计算的结果汇总，并将最终结果转换成一个格式化的字符串。

以下是这段代码的示意图：

```
+----------------+     +----------------+     +----------------+
| facebookUsers  |     | facebookUsers  |     | facebookUsers  |
+----------------+     +----------------+     +----------------+
       |                       |                       |
       V                       V                       V
+----------------+     +----------------+     +----------------+
| AsParallel()   |     | AsParallel()   |     | AsParallel()   |
+----------------+     +----------------+     +----------------+
       |                       |                       |
       V                       V                       V
+----------------+     +----------------+     +----------------+
| Select(user =>  |     | Select(user =>  |     | Select(user =>  |
|    user.Likes   |     |    user.Likes   |     |    user.Likes   |
+----------------+     +----------------+     +----------------+
       |                       |                       |
       V                       V                       V
+----------------+     +----------------+     +----------------+
|  Sum() per     |     |  Sum() per     |     |  Sum() per     |
|  thread        |     |  thread        |     |  thread        |
+----------------+     +----------------+     +----------------+
       |                       |                       |
       V                       V                       V
+----------------+     +----------------+     +----------------+
|  Merge Results |     |  Merge Results |     |  Merge Results |
+----------------+     +----------------+     +----------------+
       |                       |                       |
       V                       V                       V
+----------------+             |                       |
|  Total Likes   |             |                       |
+----------------+             |                       |
       |                       |                       |
       V                       V                       V
+----------------+     +----------------+     +----------------+
| Project String |     | Project String |     | Project String |
+----------------+     +----------------+     +----------------+
       |                       |                       |
       V                       V                       V
+----------------+     +----------------+     +----------------+
|  Output Result |     |  Output Result |     |  Output Result |
+----------------+     +----------------+     +----------------+

                                 |
                                 V
                     +----------------+
                     | Final Result   |
                     +----------------+
```

在这个示意图中，`facebookUsers`列表被`AsParallel()`方法分割成多个线程上的分区。

每个线程独立地计算其分区内用户的总点赞数（`Select(user => user.Likes)`）。

然后，每个线程的结果被合并（`Merge Results`），最终计算出所有用户的总点赞数（`Total Likes`）。

这个结果随后被转换成一个格式化的字符串（`Project String`），并最终输出（`Output Result`）。这个最终结果被表示为`Final Result`。

并行化CPU密集型任务，这些任务可以通过LINQ轻松表达（换句话说，它们是纯函数且没有副作用），是PLINQ的理想候选者。对于有副作用的任务，请考虑使用任务并行库（Task Parallel Library）。

# 更多资源

1. 101 LINQ 示例

2. Linqpad，一个针对C# / F# / Visual Basic的游乐场环境和数据库查询引擎

3. EduLinq，一本学习LINQ-to-objects如何实现的电子书

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