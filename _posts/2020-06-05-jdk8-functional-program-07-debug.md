---
layout: post
title: java8 函数式编程-07-debug 测试、调试、重构
date:  2020-6-5 17:42:59 +0800
categories: [Java]
tags: [jdk8, functional-programming, lambda, sh]
published: true
---

重构、测试驱动开发（TDD）和持续集成（CI）越来越流行，如果我们需要将 Lambda 表达式应用于日常编程工作中，就得学会如何为它编写单元测试。

关于如何测试和调试计算机程序的书已经汗牛充栋，本章不打算再一一赘述。

如果读者对如何正确地使用测试驱动开发（TDD）感兴趣，我极力推荐大家阅读 Kent Beck 写的Test-Driven Development，以及由 Steve Freeman 和 Nat Pryce 写的 Growing Object-Oriented Software, Guided by Tests（两本书均由 Addison-Wesley 出版社出版）。

本章主要探讨如何在代码中使用 Lambda 表达式的技术，也会说明什么情况下不应该（直接）使用 Lambda 表达式。本章还讲述了如何调试大量使用 Lambda 表达式和流的程序。

先看几个例子，看看如何将现有代码重构为使用 Lambda 表达式的代码。

这部分内容前面已经有所涉及，比如在局部范围内的一些重构，使用流操作替代 for 循环。

本章要讨论的内容更加深入，看看如何使用 Lambda 表达式提高非集合类代码的质量。

# 7.1 重构候选项

使用 Lambda 表达式重构代码有个时髦的称呼：Lambda 化（读作 lambda-fi-cation，执行重构的程序员叫作 lamb-di-fiers 或者有责任心的程序员）。

Java 8 中的核心类库就曾经历过这样一场重构。

在选择内部设计模型时，想想以何种形式向外展示 API 是大有裨益的。

这里有一些要点，可以帮助读者确定什么时候应该 Lambda 化自己的应用或类库。

其中的每一条都可看作一个局部的反模式或代码异味，借助于 Lambda 化可以修复。

## 7.1.1 进进出出、摇摇晃晃

例 7-1 是关于如何在程序中记录日志的，我在第 4 章多次提到这个代码。

这段代码先调用 isDebugEnabled 方法抽取布尔值，用来检查是否启用调试级别，如果启用，则调用 Logger 对象的相应方法记录日志。

如果你发现自己的代码不断地查询和操作某对象，目的只为了在最后给该对象设个值，那么这段代码就本该属于你所操作的对象。

例 7-1 logger 对象使用 isDebugEnabled 属性避免不必要的性能开销

```java
Logger logger = new Logger();
if (logger.isDebugEnabled()) {
    logger.debug("Look at this: " + expensiveOperation());
}
```

记录日志本来就是一直以来很难实现的目标，因为地方不同，所需的行为也不一样。

本例中，需要根据程序中记录日志的不同位置和要记录的内容生成不同的信息。

这种反模式通过传入代码即数据的方式很容易解决。与其查询并设置一个对象的值，不如传入一个 Lambda 表达式，该表达式按照计算得出的值执行相应的行为。

我将原来的实现代码列在例 7-2 中，以示提醒。

当程序处于调试级别，并且检查是否使用 Lambda 表达式的逻辑被封装在 Logger 对象中时，才会调用 Lambda 表达式。

例 7-2 使用 Lambda 表达式简化记录日志代码

```java
Logger logger = new Logger();
logger.debug(() -> "Look at this: " + expensiveOperation());
```

上述记录日志的例子也展示了如何使用 Lambda 表达式更好地面向对象编程（OOP），面向对象编程的核心之一是封装局部状态，比如日志的级别。

通常这点做得不是很好， isDebugEnabled 方法暴露了内部状态。

如果使用 Lambda 表达式，外面的代码根本不需要检查日志级别。

## 7.1.2 孤独的覆盖

这个代码异味是使用继承，其目的只是为了覆盖一个方法。

ThreadLocal 就是一个很好的例子。

ThreadLocal 能创建一个工厂，为每个线程最多只产生一个值。

这是确保非线程安全的类在并发环境下安全使用的一种简单方式。

假设要在数据库中查询一个艺术家，但希望每个线程只做一次这种查询，写出的代码可能如例 7-3 所示。

例 7-3 在数据库中查找艺术家

```java
ThreadLocal<Album> thisAlbum = new ThreadLocal<Album> () {
    @Override 
    protected Album initialValue() {
        return database.lookupCurrentAlbum();
    }
};
```

在 Java 8 中，可以为工厂方法 withInitial 传入一个 Supplier 对象的实例来创建对象，如例 7-4 所示。

例 7-4 使用工厂方法

```java
ThreadLocal<Album> thisAlbum
= ThreadLocal.withInitial(() -> database.lookupCurrentAlbum());
```

我们认为第二个例子优于前一个有以下几个原因。

首先，任何已有的 `Supplier<Album>` 实例不需要重新封装，就可以在此使用，这鼓励了重用和组合。在其他都一样的情况下，代码短小精悍就是个优势。

更重要的是，这是代码更加清晰的结果，阅读代码时，信噪比降低了。

这意味着有更多时间来解决实际问题，而不是把时间花在继承的样板代码上。

这样做还有一个优点，JVM 会少加载一个类。

ps: 这其实就是有时候常说的，工厂方法拓展性会优于构造器的原因。毕竟比如查看引用，方法会更加方便+重构。可以起更加方便阅读的名字。

对每个试图阅读代码，弄明白代码意图的人来说，也清楚了很多。如果你试着大声念出第二个例子中的单词，能很容易听出是干嘛的，但第一个例子就不行了。

有趣的是，在 Java 8 以前，这并不是一个反模式，而是惯用的代码编写方式，就像使用匿名内部类传递行为一样，都不是反模式，而是在 Java 中表达你所想的唯一方式。

**随着语言的演进，编程习惯也要与时俱进**。

## 7.1.3 同样的东西写两遍

不要重复你劳动（Don’t Repeat Yourself，DRY）是一个众所周知的模式，它的反面是同样的东西写两遍（Write Everything Twice，WET）。

这种代码异味多见于重复的样板代码，产生了更多需要测试的代码，这样的代码难于重构，一改就坏。

不是所有 WET 的情况都适合 Lambda 化。

有时，重复是唯一可以避免系统过紧耦合的方式。什么时候该将 WET 的代码 Lambda 化？

这里有一个信号可以参考。如果有一个整体上大概相似的模式，只是行为上有所不同，就可以试着加入一个 Lambda 表达式。

让我们看一个更具体的例子。回到我们有关音乐的问题，我想增加一个简单的 Order 类来计算用户购买专辑的一些有用属性，如计算音乐家人数、曲目和专辑时长等。如果使用命令式 Java，编写出的代码如例 7-5 所示。

例 7-5 Order 类的命令式实现

```java
public long countRunningTime() {
    long count = 0;

    for (Album album : albums) {
        for (Track track : album.getTrackList()) {
            count += track.getLength();
        }
    }
    return count;
}
public long countMusicians() {
    long count = 0;
    for (Album album : albums) {
        count += album.getMusicianList().size();
    }
    return count;
}
public long countTracks() {
    long count = 0;
    for (Album album : albums) {
        count += album.getTrackList().size();
    }
    return count;
}
```

每个方法里，都有样板代码将每个专辑里的属性和总数相加，比如每首曲目的长度或音乐家的人数。

我们没有重用共有的概念，写出了更多代码需要测试和维护。

可以使用 Stream来抽象，使用 Java 8 中的集合类库来重写上述代码，使之更紧凑。如果直接将上述命令式
的代码翻译成使用流的形式，则形如例 7-6。

例 7-6 使用流重构命令式的 Order 类

```java
public long countRunningTime() {
    return albums.stream()
    .mapToLong(album -> album.getTracks()
    .mapToLong(track -> track.getLength())
    .sum())
    .sum();
}
public long countMusicians() {
    return albums.stream()
    .mapToLong(album -> album.getMusicians().count())
    .sum();
}
public long countTracks() {
    return albums.stream()
    .mapToLong(album -> album.getTracks().count())
    .sum();
}
```

然而这段代码仍然有重用可读性的问题，因为有一些抽象和共性只能使用领域内的知识来表达。

流不会提供一个方法统计每张专辑上的信息——这是程序员要自己编写的领域知识。

这也是在 Java 8 出现之前很难编写的领域方法，因为每个方法都不一样。想一下如何实现这样一个函数。

我们返回一个 long，统计所有专辑的某些特征，还需要一个 Lambda 表达式，告诉我们统计专辑上的什么信息。

也就是说我们的方法需要一个参数，该参数为每张专辑返回一个 long，方便的是，Java 8 核心类库中已经有了这样一
个类型 ToLongFunction。

如图 7-1 所示，它的类型随参数类型，因此我们要使用的类型为 `ToLongFunction<Album>`。

这些都定下来之后，方法体就自然定下来了。我们将专辑转换成流，将专辑映射为 long，然后求和。

在实现直接面对客户的代码时，比如 countTracks，传入一个代表了领域知识的 Lambda 表达式，在这里，就是将专辑映射为上面的曲目。

例 7-7 是使用了这种方式转换之后的代码。

例 7-7 使用领域方法重构 Order 类

```java
public long countFeature(ToLongFunction<Album> function) {
    return albums.stream()
    .mapToLong(function)
    .sum();
}
public long countTracks() {
    return countFeature(album -> album.getTracks().count());
}
public long countRunningTime() {
    return countFeature(album -> album.getTracks()
    .mapToLong(track -> track.getLength())
    .sum());
}
public long countMusicians() {
    return countFeature(album -> album.getMusicians().count());
}
```

PS: 其实程序的灵魂在于复用，大到服务的复用，小到方法的复用。唯有此，才能降低成本。

# 7.2 Lambda表达式的单元测试

通常，在编写单元测试时，怎么在应用中调用该方法，就怎么在测试中调用。给定一些输入或测试替身，调用这些方法，然后验证结果是否和预期的行为一致。

Lambda 表达式给单元测试带来了一些麻烦，Lambda 表达式没有名字，无法直接在测试代码中调用。

你可以在测试代码中复制 Lambda 表达式来测试，但这种方式的副作用是测试的不是真正的实现。

假设你修改了实现代码，测试仍然通过，而实现可能早已在做另一件事了。

解决该问题有两种方式。

第一种是将 Lambda 表达式放入一个方法测试，这种方式要测那个方法，而不是 Lambda 表达式本身。

例 7-8 是一个将一组字符串转换成大写的方法。

例 7-8 将字符串转换为大写形式

```java
public static List<String> allToUpperCase(List<String> words) {
    return words.stream()
    .map(string -> string.toUpperCase())
    .collect(Collectors.<String>toList());
}
```

在这段代码中，Lambda 表达式唯一的作用就是调用一个 Java 方法。将该 Lambda 表达式单独测试是不值得的，它的行为太简单了。

如果换我来测试这段代码，我会将重点放在方法的行为上。比如例 7-9 测试了流中有多个单词的情况，它们都被转换成对应的大写。

例 7-9 测试大写转换

```java
@Test
public void multipleWordsToUppercase() {
    List<String> input = Arrays.asList("a", "b", "hello");
    List<String> result = Testing.allToUpperCase(input);
    assertEquals(asList("A", "B", "HELLO"), result);
}
```

有时候 Lambda 表达式实现了复杂的功能，它可能包含多个边界情况、使用了多个属性来计算一个非常重要的值。

你非常想测试该段代码的行为，但它是一个 Lambda 表达式，无法引用。

作为例子，让我们来看一个比大写转换更复杂一点的方法。

我们要把字符串的第一个字母转换成大写，其他部分保持不变。使用流和 Lambda 表达式，编写的代码形如例 7-10 所示。在➊处使用 Lambda 表达式做转换。

例 7-10 将列表中元素的第一个字母转换成大写

```java
public static List<String> elementFirstToUpperCaseLambdas(List<String> words) {
return words.stream()
.map(value -> { n
char firstChar = Character.toUpperCase(value.charAt(0));
return firstChar + value.substring(1);
})
.collect(Collectors.<String>toList());
}
```

如果要测试这段代码，我们必须创建一个列表，然后将想要测试的各种情况都测试到。

例7-11 展示了这种方式有多么繁琐，别担心，我们有办法！

例 7-11 测试字符串包含两个字符的情况，第一个字母被转换为大写

```java
@Test
public void twoLetterStringConvertedToUppercaseLambdas() {
    List<String> input = Arrays.asList("ab");
    List<String> result = Testing.elementFirstToUpperCaseLambdas(input);
    assertEquals(asList("Ab"), result);
}
```

别用 Lambda 表达式。

我知道，在一本介绍如何使用 Lambda 表达式的书里，这个建议有点奇怪，但是方楔子钉不进圆孔。

既然如此，大家一定会问如何测试代码，同时享有Lambda 表达式带来的便利？

请用方法引用。

任何 Lambda 表达式都能被改写为普通方法，然后使用方法引用直接引用。

例 7-12 将 Lambda 表达式重构为一个方法，然后在主程序中使用，主程序负责转换字符串。

例 7-12 将首字母转换为大写，应用到所有列表元素

```java
public static List<String> elementFirstToUppercase(List<String> words) {
    return words.stream()
    .map(Testing::firstToUppercase)
    .collect(Collectors.<String>toList());
}

public static String firstToUppercase(String value) { n
    char firstChar = Character.toUpperCase(value.charAt(0));
    return firstChar + value.substring(1);
}
```

**把处理字符串的的逻辑抽取成一个方法后，就可以测试该方法，把所有的边界情况都覆盖到**。

新的测试用例如例 7-13 所示。

例 7-13 测试单独的方法

```java
@Test
public void twoLetterStringConvertedToUppercase() {
    String input = "ab";
    String result = Testing.firstToUppercase(input);
    assertEquals("Ab", result);
}
```

# 7.3 在测试替身时使用Lambda表达式

编写单元测试的常用方式之一是使用测试替身描述系统中其他模块的期望行为。

这种方式很有用，因为单元测试可以脱离其他模块来测试你的类或方法，测试替身让你能用单元测测试代码时，使用 Lambda 表达式的最简单方式是实现轻量级的测试存根。

如果交互的类本身就是一个函数接口，实现这样的存根就非常简单和自然。

在 7.1.3 节中，讨论过如何将通用的领域逻辑重构为一个 countFeature 方法，然后使用Lambda 表达式实现不同的统计行为。

例 7-14 展示了如何对此编写单元测试。

7-14 使用 Lambda 表达式编写测试替身，传给 countFeature 方法

```java
@Test
public void canCountFeatures() {
    OrderDomain order = new OrderDomain(asList(
    newAlbum("Exile on Main St."),
    newAlbum("Beggars Banquet"),
    newAlbum("Aftermath"),
    newAlbum("Let it Bleed")));
    assertEquals(8, order.countFeature(album -> 2));
}
```

对于 countFeature 方法的期望行为是为传入的专辑返回某个数值。

这里传入 4 张专辑，测试存根中为每张专辑返回 2，然后断言该方法返回 8，即 2×4。

如果要向代码传入一个 Lambda 表达式，最好确保 Lambda 表达式也通过测试。

多数的测试替身都很复杂，使用 Mockito 这样的框架有助于更容易地产生测试替身。

让我们考虑一种简单情形，为 List 生成测试替身。

我们不想返回 List 本上的长度，而是返回另一个 List 的长度，为了模拟 List 的 size 方法，我们不想只给出答案，还想做一些操作，因此传入一个 Lambda 表达式，如例 7-15 所示。

例 7-15 结合 Mockito 框架使用 Lambda 表达式

```java
List<String> list = mock(List.class);
when(list.size()).thenAnswer(inv -> otherList.size());
assertEquals(3, list.size());
```

Mockito 使用 Answer 接口允许用户提供其他行为，换句话说，这是我们的老朋友：

代码即数据。

之所以在这里能使用 Lambda 表达式，是因为 Answer 本身就是一个函数接口。


# 7.4 惰性求值和调试

调试时通常会设置断点，单步跟踪程序的每一步。

使用流时，调试可能会变得更加复杂，因为迭代已交由类库控制，而且很多流操作是惰性求值的。

在传统的命令式编程看来，代码就是达到某种目的的一系列行动，在行动前后查看程序状态是有意义的。

在 Java 8 中，你仍然可以使用 IDE 提供的各种调试工具，但有时需要调整实现方式，以期达到更好的结果。

PS: 惰性求值提升了性能，但同时也给我们 debug 带来了新的挑战。

# 7.5 日志和打印消息

假设你要在集合上进行大量操作，你要调试代码，你希望看到每一步操作的结果是什么。

可以在每一步打印出集合中的值，这在流中很难做到，因为一些中间步骤是惰性求值的。

让我们通过第 3 章介绍的命令式版本的国际报告程序，看看如何记录中间值。

考虑到读者可能已经忘记这个程序，我们再来解释一下这个程序的意图，该程序找出了专辑上每位艺术家来自哪个国家。

在例 7-16 中，我们将找到的国家信息记录到日志中。

例 7-16 记录中间值，以便调试 for 循环

```java
Set<String> nationalities = new HashSet<>();
for (Artist artist : album.getMusicianList()) {
    if (artist.getName().startsWith("The")) {
        String nationality = artist.getNationality();
        System.out.println("Found nationality: " + nationality);
        nationalities.add(nationality);
    }
}
return nationalities;
```

现在可以使用 forEach 方法打印出流中的值，这同时会触发求值过程。

但是这样的操作有个缺点：我们无法再继续操作流了，流只能使用一次。如果我们还想继续，必须重新创建流。

例 7-17 展示了这样的代码会有多难看。

例 7-17 使用 forEach 记录中间值，这种方式有点幼稚

```java
album.getMusicians()
.filter(artist -> artist.getName().startsWith("The"))
.map(artist -> artist.getNationality())
.forEach(nationality -> System.out.println("Found: " + nationality));

Set<String> nationalities
= album.getMusicians()
.filter(artist -> artist.getName().startsWith("The"))
.map(artist -> artist.getNationality())
.collect(Collectors.<String>toSet());
```


# 7.6 解决方案：peak

遗憾的是，流有一个方法让你能查看每个值，同时能继续操作流。这就是 peek 方法。

ps: 这里是不是应该改成，幸运的是？

例7-18 使用 peek 方法重写了前面的例子，输出流中的值，同时避免了重复的流操作。

例 7-18 使用 peek 方法记录中间值

```java
Set<String> nationalities
= album.getMusicians()
.filter(artist -> artist.getName().startsWith("The"))
.map(artist -> artist.getNationality())
.peek(nation -> System.out.println("Found nationality: " + nation))
.collect(Collectors.<String>toSet());
```

使用 peek 方法还能以同样的方式，将输出定向到现有的日志系统中，比如 log4j、java.util.logging 或者 slf4j。

# 7.7 在流中间设置断点

记录日志这是 peek 方法的用途之一。为了像调试循环那样一步一步跟踪，可在 peek 方法中加入断点，这样就能逐个调试流中的元素了。

此时，peek 方法可知包含一个空的方法体，只要能设置断点就行。

有一些调试器不允许在空的方法体中设置断点，此时，我将值简单地映射为其本身，这样就有地方设置断点了，虽然这样做不够完美，但只要能工作就行。

# 参考资料

《java8 函数式编程》

* any list
{:toc}