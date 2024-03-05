---
layout: post
title: 数据库查询工具/流式查询 streamex 入门介绍
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, olap, sh]
published: true
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

# StreamEx

这个库定义了四个类：StreamEx，IntStreamEx，LongStreamEx，DoubleStreamEx，它们与Java 8的流类完全兼容，并提供了许多其他有用的方法。

此外，还提供了EntryStream类，它表示映射条目的流，并为这种情况提供了额外的功能。

最后，MoreCollectors类中定义了一些新的有用的收集器，以及原始收集器的概念。

完整的API文档可以在这里找到。

查看Cheatsheet以获取StreamEx的简要介绍！

在更新StreamEx之前，请查看迁移说明和更改的完整列表。

StreamEx库的主要特点如下：

- 更简洁、方便的方式来执行常见任务。

- 与旧代码的更好互操作性。

- 与原始JDK流100%兼容。

- 对并行处理的友好性：任何新功能都尽可能利用并行流的优势。

- 性能和最小的开销。如果StreamEx允许使用比标准流更少的代码来解决任务，那么它不应该比标准方式显著慢（有时甚至更
快）。

这些示例展示了StreamEx库的一些核心功能和用法。下面我将逐一解释每个示例：

示例 1: 收集器快捷方法

```java
List<String> userNames = StreamEx.of(users).map(User::getName).toList();  
Map<Role, List<User>> role2users = StreamEx.of(users).groupingBy(User::getRole);  
StreamEx.of(1, 2, 3).joining("; "); // "1; 2; 3"
```

toList()：将流中的元素收集到一个列表中。
groupingBy()：根据提供的分类函数对流中的元素进行分组。
joining("; ")：将流中的元素连接成一个字符串，元素之间用分号加空格分隔。

示例 2: 选择特定类型的流元素

```java
public List<Element> elementsOf(NodeList nodeList) {  
    return IntStreamEx.range(nodeList.getLength())  
      .mapToObj(nodeList::item).select(Element.class).toList();  
}
```

select(Element.class)：从流中筛选出指定类型的元素。

示例 3: 向流中添加元素

```java
public List<String> getDropDownOptions() {  
    return StreamEx.of(users).map(User::getName).prepend("(none)").toList();  
}  
  
public int[] addValue(int[] arr, int value) {  
    return IntStreamEx.of(arr).append(value).toArray();  
}
```

prepend("(none)")：在流的开始处添加一个元素。
append(value)：在流的末尾添加一个元素。
示例 4: 移除不需要的元素并将流用作Iterable

```java
public void copyNonEmptyLines(Reader reader, Writer writer) throws IOException {  
    for(String line : StreamEx.ofLines(reader).remove(String::isEmpty)) {  
        writer.write(line);  
        writer.write(System.lineSeparator());  
    }  
}
```

remove(String::isEmpty)：从流中移除满足给定谓词的元素。
ofLines(reader)：从Reader中读取行并创建一个流。

示例 5: 根据值谓词选择映射的键

```java
Map<String, Role> nameToRole;  
  
public Set<String> getEnabledRoleNames() {  
    return StreamEx.ofKeys(nameToRole, Role::isEnabled).toSet();  
}
```

ofKeys(nameToRole, Role::isEnabled)：从映射中选择满足给定谓词的键。

这些示例展示了StreamEx库在简化常见操作、与原始Java 8流互操作性、增强的并行处理能力、友好性和性能方面的一些优势。

通过使用StreamEx，开发者可以更加高效和简洁地处理数据流。


这些示例展示了如何使用StreamEx库在键值对上执行操作，处理键值对集合，进行逐对计算，支持原始数据类型，以及定义自定义的惰性中间操作。让我们逐一解释这些示例：

操作键值对

```java
public Map<String, List<String>> invert(Map<String, List<String>> map) {  
    return EntryStream.of(map).flatMapValues(List::stream).invert().grouping();  
}
```

EntryStream.of(map)：从给定的Map创建一个EntryStream。
flatMapValues(List::stream)：将每个value（List<String>）转换成Stream，并扁平化整个EntryStream。
invert()：将键值对反转，即原来的键变成值，原来的值变成键。
grouping()：将相同值（原键）对应的项分组，创建新的Map。

```java
public Map<String, String> stringMap(Map<Object, Object> map) {  
    return EntryStream.of(map).mapKeys(String::valueOf)  
        .mapValues(String::valueOf).toMap();  
}
```

mapKeys(String::valueOf)：将Map中的键转换成字符串。
mapValues(String::valueOf)：将Map中的值转换成字符串。
toMap()：将处理后的键值对转换成新的Map。

获取组成员

```java
Map<String, Group> nameToGroup;  
  
public Map<String, List<User>> getGroupMembers(Collection<String> groupNames) {  
    return StreamEx.of(groupNames).mapToEntry(nameToGroup::get)  
        .nonNullValues().mapValues(Group::getMembers).toMap();  
}
```

StreamEx.of(groupNames).mapToEntry(nameToGroup::get)：从groupNames创建Stream，并使用nameToGroup Map将每个名称映射到对应的Group对象，生成一个EntryStream。
nonNullValues()：过滤掉值为null的条目（即不存在的组名）。
mapValues(Group::getMembers)：将每个Group对象映射到其成员列表。
toMap()：将处理后的键值对转换成新的Map。

逐对差异

```java
DoubleStreamEx.of(input).pairMap((a, b) -> b-a).toArray();
```

pairMap((a, b) -> b-a)：对DoubleStream中的相邻元素执行逐对操作，计算每对元素的差值。

支持字节/字符/短整型/浮点型

```java
short[] multiply(short[] src, short multiplier) {  
    return IntStreamEx.of(src).map(x -> x*multiplier).toShortArray();   
}
```

IntStreamEx.of(src)：从短整型数组创建IntStream。
map(x -> x*multiplier)：将每个元素乘以给定的乘数。
toShortArray()：将结果转换回短整型数组。

定义自定义惰性中间操作

```java
static <T> StreamEx<T> scanLeft(StreamEx<T> input, BinaryOperator<T> operator) {  
    return input.headTail((head, tail) -> scanLeft(tail.mapFirst(cur -> operator.apply(head, cur)), operator)  
            .prepend(head));  
}
```

scanLeft是一个自定义的惰性中间操作，模拟了Stream API中的scan或reduce操作，但它是递归定义的。
headTail：将流分成头部元素和剩余元素的流。
mapFirst(cur -> operator.apply(head, cur))：对剩余流的第一个元素应用累积操作。
prepend(head)：将头部元素添加到处理后的剩余流前面。

这些示例展示了StreamEx库在处理复杂数据流时的强大和灵活性。

通过使用StreamEx，开发者能够编写更简洁、更高效的代码，同时保持与原始Java 8流API的兼容性。



# 参考资料

https://github.com/amaembo/streamex

* any list
{:toc}