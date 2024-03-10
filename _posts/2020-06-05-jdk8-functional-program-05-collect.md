---
layout: post
title: java8 函数式编程-05-collect 高级集合类和收集器
date:  2020-6-5 17:42:59 +0800
categories: [Java]
tags: [jdk8, functional-programming, lambda, sh]
published: true
---

第 3 章只介绍了集合类的部分变化，事实上，Java 8 对集合类的改进不止这些。

现在是时候介绍一些高级主题了，包括新引入的 Collector 类。同时我还会为大家介绍方法引用，它可以帮助大家在 Lambda 表达式中轻松使用已有代码。

编写大量使用集合类的代码时，使用方法引用能让程序员获得丰厚的回报。

本章还会涉及集合类的一些更高级的主题，比如流中元素的顺序，以及一些有用的 API。

# 5.1 方法引用

读者可能已经发现，Lambda 表达式有一个常见的用法：Lambda 表达式经常调用参数。

比如想得到艺术家的姓名，Lambda 的表达式如下：

```java
artist -> artist.getName()
```

这种用法如此普遍，因此 Java 8 为其提供了一个简写语法，叫作方法引用，帮助程序员重
用已有方法。

用方法引用重写上面的 Lambda 表达式，代码如下：

```java
Artist::getName
```

标准语法为 Classname::methodName。

需要注意的是，虽然这是一个方法，但不需要在后面加括号，因为这里并不调用该方法。

我们只是提供了和 Lambda 表达式等价的一种结构，在需要时才会调用。

凡是使用 Lambda 表达式的地方，就可以使用方法引用。

构造函数也有同样的缩写形式，如果你想使用 Lambda 表达式创建一个 Artist 对象，可能

会写出如下代码：

```java
(name, nationality) -> new Artist(name, nationality)
```

使用方法引用，上述代码可写为：

```java
Artist::new
```

这段代码不仅比原来的代码短，而且更易阅读。

Artist::new 立刻告诉程序员这是在创建一个 Artist 对象，程序员无需看完整行代码就能弄明白代码的意图。

另一个要注意的地方是方法引用自动支持多个参数，前提是选对了正确的函数接口。

还可以用这种方式创建数组，下面的代码创建了一个字符串型的数组：

```java
String[]::new
```

从现在开始，我们将在合适的地方使用方法引用，因此读者很快会看到更多的例子。

一开始探索 Java 8 时，有位朋友告诉我，方法引用看起来“就像在作弊”。

他的意思是说，了解如何使用 Lambda 表达式让代码像数据一样在对象间传递之后，这种直接引用方法的方式就像“作弊”。

放心，这不是在作弊。

读者只要记住，每次写出形如 x -> foo(x) 的 Lambda 表达式时，和直接调用方法 foo 是一样的。

方法引用只不过是基于这样的事实，提供了一种简短的语法而已。

# 5.2 元素顺序

另外一个尚未提及的关于集合类的内容是流中的元素以何种顺序排列。

读者可能知道，一些集合类型中的元素是按顺序排列的，比如 List；而另一些则是无序的，比如 HashSet。增加了流操作后，顺序问题变得更加复杂。

直观上看，流是有序的，因为流中的元素都是按顺序处理的。

这种顺序称为出现顺序。出现顺序的定义依赖于数据源和对流的操作。

在一个有序集合中创建一个流时，流中的元素就按出现顺序排列，因此，例 5-1 中的代码总是可以通过。

例 5-1 顺序测试永远通过

```java
List<Integer> numbers = asList(1, 2, 3, 4);
List<Integer> sameOrder = numbers.stream()
.collect(toList());
assertEquals(numbers, sameOrder);
```

如果集合本身就是无序的，由此生成的流也是无序的。

HashSet 就是一种无序的集合，因此不能保证例 5-2 所示的程序每次都通过。

例 5-2 顺序测试不能保证每次通过

```java
Set<Integer> numbers = new HashSet<>(asList(4, 3, 2, 1));
List<Integer> sameOrder = numbers.stream()
.collect(toList());
// 该断言有时会失败
assertEquals(asList(4, 3, 2, 1), sameOrder);
```

流的目的不仅是在集合类之间做转换，而且同时提供了一组处理数据的通用操作。

有些集合本身是无序的，但这些操作有时会产生顺序，试看例 5-3 中的代码。

例 5-3 生成出现顺序

```java
Set<Integer> numbers = new HashSet<>(asList(4, 3, 2, 1));
List<Integer> sameOrder = numbers.stream()
.sorted()
.collect(toList());
assertEquals(asList(1, 2, 3, 4), sameOrder);
```

一些中间操作会产生顺序，比如对值做映射时，映射后的值是有序的，这种顺序就会保留下来。

如果进来的流是无序的，出去的流也是无序的。

看一下例 5-4 所示代码，我们只能断言 HashSet 中含有某元素，但对其顺序不能作出任何假设，因为 HashSet 是无序的，使
用了映射操作后，得到的集合仍然是无序的。

例 5-4 本例中关于顺序的假设永远是正确的

```java
List<Integer> numbers = asList(1, 2, 3, 4);
List<Integer> stillOrdered = numbers.stream()
.map(x -> x + 1)
.collect(toList());
// 顺序得到了保留
assertEquals(asList(2, 3, 4, 5), stillOrdered);
Set<Integer> unordered = new HashSet<>(numbers);
List<Integer> stillUnordered = unordered.stream()
.map(x -> x + 1)
.collect(toList());
// 顺序得不到保证
assertThat(stillUnordered, hasItem(2));
assertThat(stillUnordered, hasItem(3));
assertThat(stillUnordered, hasItem(4));
assertThat(stillUnordered, hasItem(5));
```

一些操作在有序的流上开销更大，调用 unordered 方法消除这种顺序就能解决该问题。

大多数操作都是在有序流上效率更高，比如 filter、map 和 reduce 等。

这会带来一些意想不到的结果，比如使用并行流时，forEach 方法不能保证元素是按顺序处理的（第 6 章会详细讨论这些内容）。

如果需要保证按顺序处理，应该使用 forEachOrdered 方法，它是你的朋友。

# 5.3 使用收集器

前面我们使用过 collect(toList())，在流中生成列表。

显然，List 是能想到的从流中生成的最自然的数据结构，但是有时人们还希望从流生成其他值，比如 Map 或 Set，或者你希望定制一个类将你想要的东西抽象出来。

前面已经讲过，仅凭流上方法的签名，就能判断出这是否是一个及早求值的操作。

reduce操作就是一个很好的例子，但有时人们希望能做得更多。

这就是收集器，一种通用的、从流生成复杂值的结构。

只要将它传给 collect 方法，所有的流就都可以使用它了。

标准类库已经提供了一些有用的收集器，让我们先来看看。

本章示例代码中的收集器都是从 java.util.stream.Collectors 类中静态导入的。

## 5.3.1 转换成其他集合

有一些收集器可以生成其他集合。

比如前面已经见过的 toList，生成了 java.util.List 类的实例。

还有 toSet 和 toCollection，分别生成 Set 和 Collection 类的实例。

到目前为止，我已经讲了很多流上的链式操作，但总有一些时候，需要最终生成一个集合——比如：

- 已有代码是为集合编写的，因此需要将流转换成集合传入；

- 在集合上进行一系列链式操作后，最终希望生成一个值；

- 写单元测试时，需要对某个具体的集合做断言。

通常情况下，创建集合时需要调用适当的构造函数指明集合的具体类型：

```java
List<Artist> artists = new ArrayList<>();
```

但是调用 toList 或者 toSet 方法时，不需要指定具体的类型。

Stream 类库在背后自动为你挑选出了合适的类型。本书后面会讲述如何使用 Stream 类库并行处理数据，收集并行操作的结果需要的 Set，和对线程安全没有要求的 Set 类是完全不同的。

可能还会有这样的情况，你希望使用一个特定的集合收集值，而且你可以稍后指定该集合的类型。

比如，你可能希望使用 TreeSet，而不是由框架在背后自动为你指定一种类型的Set。

此时就可以使用 toCollection，它接受一个函数作为参数，来创建集合（见例 5-5）。

例 5-5 使用 toCollection，用定制的集合收集元素

```java
stream.collect(toCollection(TreeSet::new));
```

## 5.3.2 转换成值

还可以利用收集器让流生成一个值。

maxBy 和 minBy 允许用户按某种特定的顺序生成一个值。

例 5-6 展示了如何找出成员最多的乐队。

它使用一个 Lambda 表达式，将艺术家映射为成员数量，然后定义了一个比较器，并将比较器传入 maxBy 收集器。

例 5-6 找出成员最多的乐队

```java
public Optional<Artist> biggestGroup(Stream<Artist> artists) {
Function<Artist,Long> getCount = artist -> artist.getMembers().count();
    return artists.collect(maxBy(comparing(getCount)));
}
```

minBy 就如它的方法名，是用来找出最小值的。

还有些收集器实现了一些常用的数值运算。

让我们通过一个计算专辑曲目平均数的例子来看看，如例 5-7 所示。

例 5-7 找出一组专辑上曲目的平均数

```java
public double averageNumberOfTracks(List<Album> albums) {
    return albums.stream()
    .collect(averagingInt(album -> album.getTrackList().size()));
}
```

和以前一样，通过调用 stream 方法让集合生成流，然后调用 collect 方法收集结果。

averagingInt 方法接受一个 Lambda 表达式作参数，将流中的元素转换成一个整数，然后再计算平均数。

还有和 double 和 long 类型对应的重载方法，帮助程序员将元素转换成相应类型的值。

第 4 章介绍过一些特殊的流，如 IntStream，为数值运算定义了一些额外的方法。

事实上，Java 8 也提供了能完成类似功能的收集器，如 averagingInt。可以使用 summingInt 及其重载方法求和。

SummaryStatistics 也可以使用 summingInt 及其组合收集。

## 5.3.3 数据分块

另外一个常用的流操作是将其分解成两个集合。

假设有一个艺术家组成的流，你可能希望将其分成两个部分，一部分是独唱歌手，另一部分是由多人组成的乐队。

可以使用两次过滤操作，分别过滤出上述两种艺术家。


但是这样操作起来有问题。

首先，为了执行两次过滤操作，需要有两个流。

其次，如果过滤操作复杂，每个流上都要执行这样的操作，代码也会变得冗余。

幸好我们有这样一个收集器 partitioningBy，它接受一个流，并将其分成两部分（如图5-1 所示）。

它使用 Predicate 对象判断一个元素应该属于哪个部分，并根据布尔值返回一个 Map 到列表。

因此，对于 true List 中的元素，Predicate 返回 true；对其他 List 中的元素，Predicate 返回 false。

使用它，我们就可以将乐队（有多个成员）和独唱歌手分开了。在本例中，分块函数指明艺术家是否为独唱歌手。实现如例 5-8 所示。


例 5-8 将艺术家组成的流分成乐队和独唱歌手两部分

```java
public Map<Boolean, List<Artist>> bandsAndSolo(Stream<Artist> artists) {
    return artists.collect(partitioningBy(artist -> artist.isSolo()));
}
```

也可以使用方法引用代替 Lambda 表达式，如例 5-9 所示。

例 5-9 使用方法引用将艺术家组成的 Stream 分成乐队和独唱歌手两部分

```java
public Map<Boolean, List<Artist>> bandsAndSoloRef(Stream<Artist> artists) {
    return artists.collect(partitioningBy(Artist::isSolo));
}
```


## 5.3.4 数据分组

数据分组是一种更自然的分割数据操作，与将数据分成 ture 和 false 两部分不同，可以使用任意值对数据分组。

比如现在有一个由专辑组成的流，可以按专辑当中的主唱对专辑分组。代码如例 5-10 所示。

例 5-10 使用主唱对专辑分组

```java
public Map<Artist, List<Album>> albumsByArtist(Stream<Album> albums) {
    return albums.collect(groupingBy(album -> album.getMainMusician()));
}
```

和其他例子一样，调用流的 collect 方法，传入一个收集器。

groupingBy 收集器（如图5-2 所示）接受一个分类函数，用来对数据分组，就像 partitioningBy 一样，接受一个Predicate 对象将数据分成 ture 和 false 两部分。

我们使用的分类器是一个 Function 对象，和 map 操作用到的一样。

读者可能知道 SQL 中的 group by 操作，我们的方法是和这类似的一个概念，只不过在 Stream 类库中实现了而已。

## 5.3.5 字符串

很多时候，收集流中的数据都是为了在最后生成一个字符串。

假设我们想将参与制作一张专辑的所有艺术家的名字输出为一个格式化好的列表，以专辑 Let It Be 为例，期望的输出为："[George Harrison, John Lennon, Paul McCartney, Ringo Starr, The Beatles]"。

在 Java 8 还未发布前，实现该功能的代码可能如例 5-11 所示。

通过不断迭代列表，使用一个 StringBuilder 对象来记录结果。

每一步都取出一个艺术家的名字，追加到 StringBuilder对象。

例 5-11 使用 for 循环格式化艺术家姓名

```java
StringBuilder builder = new StringBuilder("[");
for (Artist artist : artists) {
if (builder.length() > 1)
builder.append(", ");
String name = artist.getName();
builder.append(name);
}
builder.append("]");
String result = builder.toString();
```

显然，这段代码不是非常好。

如果不一步步跟踪，很难看出这段代码是干什么的。

使用Java 8 提供的流和收集器就能写出更清晰的代码，如例 5-12 所示。

例 5-12 使用流和收集器格式化艺术家姓名

```java
String result =
artists.stream()
.map(Artist::getName)
.collect(Collectors.joining(", ", "[", "]"));
```

这里使用 map 操作提取出艺术家的姓名，然后使用 Collectors.joining 收集流中的值，该方法可以方便地从一个流得到一个字符串，允许用户提供分隔符（用以分隔元素）、前缀和后缀。

## 5.3.6 组合收集器

虽然读者现在看到的各种收集器已经很强大了，但如果将它们组合起来，会变得更强大。

之前我们使用主唱将专辑分组，现在来考虑如何计算一个艺术家的专辑数量。一个简单的方案是使用前面的方法对专辑先分组后计数，如例 5-13 所示。

例 5-13 计算每个艺术家专辑数的简单方式

```java
Map<Artist, List<Album>> albumsByArtist = albums.collect(groupingBy(album -> album.getMainMusician()));

Map<Artist, Integer> numberOfAlbums = new HashMap<>();
for(Entry<Artist, List<Album>> entry : albumsByArtist.entrySet()) {
    numberOfAlbums.put(entry.getKey(), entry.getValue().size());
}
```

这种方式看起来简单，但却有点杂乱无章。

这段代码也是命令式的代码，不能自动适应并行化操作。

这里实际上需要另外一个收集器，告诉 groupingBy 不用为每一个艺术家生成一个专辑列表，只需要对专辑计数就可以了。

幸好，核心类库已经提供了一个这样的收集器：

counting。使用它，可将上述代码重写为例 5-14 所示的样子。

例 5-14 使用收集器计算每个艺术家的专辑数

```java
public Map<Artist, Long> numberOfAlbums(Stream<Album> albums) {
    return albums.collect(groupingBy(album -> album.getMainMusician(), counting()));
}
```

groupingBy 先将元素分成块，每块都与分类函数 getMainMusician 提供的键值相关联，然后使用下游的另一个收集器收集每块中的元素，最好将结果映射为一个 Map。

让我们再看一个例子，这次我们不想生成一组专辑，只希望得到专辑名。

这个问题仍然可以用前面的方法解决，先将专辑分组，然后再调整生成的 Map 中的值，如例 5-15 所示。

例 5-15 使用简单方式求每个艺术家的专辑名

```java
public Map<Artist, List<String>> nameOfAlbumsDumb(Stream<Album> albums) {
    Map<Artist, List<Album>> albumsByArtist =
    albums.collect(groupingBy(album ->album.getMainMusician()));
    Map<Artist, List<String>> nameOfAlbums = new HashMap<>();
    for(Entry<Artist, List<Album>> entry : albumsByArtist.entrySet()) {
        nameOfAlbums.put(entry.getKey(), entry.getValue()
        .stream()
        .map(Album::getName)
        .collect(toList()));
    }
    return nameOfAlbums;
}
```

同理，我们可以再使用一个收集器，编写出更好、更快、更容易并行处理的代码。

我们已经知道，可以使用 groupingBy 将专辑按主唱分组，但是其输出为一个 `Map<Artist,List<Album>>` 对象，它将每个艺术家和他的专辑列表关联起来，但这不是我们想要的，我们想要的是一个包含专辑名的字符串列表。

此时，我们真正想做的是将专辑列表映射为专辑名列表，这里不能直接使用流的 map 操作，因为列表是由 groupingBy 生成的。

我们需要有一种方法，可以告诉 groupingBy 将它的值做映射，生成最终结果。

每个收集器都是生成最终值的一剂良方。这里需要两剂配方，一个传给另一个。谢天谢地，Oracle 公司的研究员们已经考虑到这种情况，为我们提供了 mapping 收集器。

mapping 允许在收集器的容器上执行类似 map 的操作。

但是需要指明使用什么样的集合类存储结果，比如 toList。这些收集器就像乌龟叠罗汉，龟龟相驮以至无穷。

mapping 收集器和 map 方法一样，接受一个 Function 对象作为参数，经过重构后的代码如例 5-16 所示。

例 5-16 使用收集器求每个艺术家的专辑名

```java
public Map<Artist, List<String>> nameOfAlbums(Stream<Album> albums) {
    return albums.collect(groupingBy(Album::getMainMusician, mapping(Album::getName, toList())));
}
```

这两个例子中我们都用到了第二个收集器，用以收集最终结果的一个子集。

这些收集器叫作下游收集器。

收集器是生成最终结果的一剂配方，下游收集器则是生成部分结果的配方，主收集器中会用到下游收集器。

这种组合使用收集器的方式，使得它们在 Stream 类库中的作用更加强大。

那些为基本类型特殊定制的函数，如 averagingInt、summarizingLong 等，事实上和调用特殊 Stream 上的方法是等价的，加上它们是为了将它们当作下游收集器来使用的。

## 5.3.7 重构和定制收集器

尽管在常用流操作里，Java 内置的收集器已经相当好用，但收集器框架本身是极其通用的。

JDK 提供的收集器没有什么特别的，完全可以定制自己的收集器，而且定制起来相当简单，这就是本节要讲的内容。

读者可能还没忘记在例 5-11 中，如何使用 Java 7 连接字符串，尽管形式并不优雅。

让我们逐步重构这段代码，最终用合适的收集器实现原有代码功能。

在工作中没有必要这样做，JDK 已经提供了一个完美的收集器 joining。

这里只是为了展示如何定制收集器，以及如何使用 Java 8 提供的新功能来重构遗留代码。

例 5-17 复制了例 5-11，展示了如何在 Java 7 中连接字符串。

例 5-17 使用 for 循环和 StringBuilder 格式化艺术家姓名

```java
StringBuilder builder = new StringBuilder("[");
for (Artist artist : artists) {
    if (builder.length() > 1)
        builder.append(", ");

    String name = artist.getName();
    builder.append(name);
}
builder.append("]");
String result = builder.toString();
```

显然，可以使用 map 操作，将包含艺术家的流映射为包含艺术家姓名的流。

例 5-18 展示了使用了流的 map 操作重构后的代码。

例 5-18 使用 forEach 和 StringBuilder 格式化艺术家姓名

```java
StringBuilder builder = new StringBuilder("[");
artists.stream()
.map(Artist::getName)
.forEach(name -> {
    if (builder.length() > 1)
        builder.append(", ");
    builder.append(name);
});
builder.append("]");
String result = builder.toString();
```

将艺术家映射为姓名，就能更快看出最终是要生成什么，这样代码看起来更清楚一点。

可惜 forEach 方法看起来还是有点笨重，这与我们通过组合高级操作让代码变得易读的目标不符。

暂且不必考虑定制一个收集器，让我们想想怎么通过流上已有的操作来解决该问题。

和生成字符串目标最近的操作就是 reduce，使用它将例 5-18 中的代码重构如下。

例 5-19 使用 reduce 和 StringBuilder 格式化艺术家姓名

```java
StringBuilder reduced =
artists.stream()
.map(Artist::getName)
.reduce(new StringBuilder(), (builder, name) -> {
    if (builder.length() > 0)
        builder.append(", ");

    builder.append(name);
    return builder;
}, (left, right) -> left.append(right));

reduced.insert(0, "[");
reduced.append("]");
String result = reduced.toString();
```


我曾经天真地以为上面的重构会让代码变得更清晰，可惜恰好相反，代码看起来比以前更糟糕。让我们先来看看怎么回事。

和前面的例子一样，都调用了 stream 和 map 方法，reduce 操作生成艺术家姓名列表，艺术家与艺术家之间用“,”分隔。

首先创建一个 StringBuilder 对象，该对象是 reduce 操作的初始状态，然后使用 Lambda 表达式将姓名连接到 builder 上。

reduce 操作的第三个参数也是一个 Lambda 表达式，接受两个StringBuilder 对象做参数，将两者连接起来。最后添加前缀和后缀。

在接下来的重构中，我们还是使用 reduce 操作，不过需要将杂乱无章的代码隐藏掉——我的意思是使用一个 StringCombiner 类对细节进行抽象。

代码如例 5-20 所示。

例 5-20 使用 reduce 和 StringCombiner 类格式化艺术家姓名

```java
StringCombiner combined =
artists.stream()
.map(Artist::getName)
.reduce(new StringCombiner(", ", "[", "]"),
    StringCombiner::add,
    StringCombiner::merge);

String result = combined.toString();
```

尽管代码看起来和上个例子大相径庭，其实背后做的工作是一样的。

我们使用 reduce 操作将姓名和分隔符连接成一个 StringBuilder 对象。

不过这次连接姓名操作被代理到了 StringCombiner.add 方法，而连接两个连接器操作被 StringCombiner.merge 方法代理。

让我们现在来看看这些方法，先从例 5-21 中的 add 方法开始。


例 5-21 add 方法返回连接新元素后的结果

```java
public StringCombiner add(String element) {
    if (areAtStart()) {
        builder.append(prefix);
    } else {
        builder.append(delim);
    }
    builder.append(element);
    return this;
}

```

add 方法在内部其实将操作代理给一个 StringBuilder 对象。

如果刚开始进行连接，则在最前面添加前缀，否则添加分隔符，然后再添加新的元素。

这里返回一个 StringCombiner 对象，因为这是传给 reduce 操作所需要的类型。

合并代码也是同样的道理，内部将操作代理给 StringBuilder 对象，如例 5-22 所示。

例 5-22 merge 方法连接两个 StringCombiner 对象

```java
public StringCombiner merge(StringCombiner other) {
    builder.append(other.builder);
    return this;
}
```

reduce 阶段的重构还差一小步就差不多结束了。

我们要在最后调用 toString 方法，将整个步骤串成一个方法链。

这很简单，只需要排列好 reduce 代码，准备好将其转换为 Collector API 就行了（如例 5-23 所示）。

例 5-23 使用 reduce 操作，将工作代理给 StringCombiner 对象

```java
String result =
artists.stream()
.map(Artist::getName)
.reduce(new StringCombiner(", ", "[", "]"),
    StringCombiner::add,
    StringCombiner::merge)
.toString();
```

现在的代码看起来已经差不多完美了，但是在程序中还是不能重用。

因此，我们想将 reduce 操作重构为一个收集器，在程序中的任何地方都能使用。

不妨将这个收集器叫作 StringCollector，让我们重构代码使用这个新的收集器，如例 5-24 所示。

例 5-24 使用定制的收集器 StringCollector 收集字符串

```java
String result =
artists.stream()
.map(Artist::getName)
.collect(new StringCollector(", ", "[", "]"));
```

既然已经将所有对字符串的连接操作代理给了定制的收集器，应用程序就不需要关心 StringCollector 对象的任何内部细节，它和框架中其他 Collector 对象用起来是一样的。


PS: Collector 接口，我们可以看一下 jdk

```java
//Type parameters:
// <T> – the type of input elements to the reduction operation 
// <A> – the mutable accumulation type of the reduction operation (often hidden as an implementation detail) 
// <R> – the result type of the reduction operation
public interface Collector<T, A, R> {
    /**
     * A function that creates and returns a new mutable result container.
     *
     * 首先是一个 Supplier，这是一个工厂方法，用来创建容器
     * 
     * @return a function which returns a new, mutable result container
     */
    Supplier<A> supplier();

    /**
     * A function that folds a value into a mutable result container.
     *
     * 收集器的 accumulator 的作用和 reduce 操作的第二个参数一样，它结合之前操作的结果和当前值，生成并返回新的值。
     * 
     * @return a function which folds a value into a mutable result container
     */
    BiConsumer<A, T> accumulator();

    /**
     * A function that accepts two partial results and merges them.  The
     * combiner function may fold state from one argument into the other and
     * return that, or may return a new result container.
     *
     * combine 方法很像 reduce 操作的第三个方法。如果有两个容器，我们需要将其合并。
     * 
     * @return a function which combines two partial results into a combined
     * result
     */
    BinaryOperator<A> combiner();

    /**
     * Perform the final transformation from the intermediate accumulation type
     * {@code A} to the final result type {@code R}.
     *
     * <p>If the characteristic {@code IDENTITY_TRANSFORM} is
     * set, this function may be presumed to be an identity transform with an
     * unchecked cast from {@code A} to {@code R}.
     *
     * 转换为最后想要的结果
     * 
     * @return a function which transforms the intermediate result to the final
     * result
     */
    Function<A, R> finisher();
```



先来实现 Collector 接口（例 5-25），由于 Collector 接口支持泛型，因此先得确定一些具体的类型：

- 待收集元素的类型，这里是 String；

- 累加器的类型 StringCombiner；

- 最终结果的类型，这里依然是 String。

例 5-25 定义字符串收集器

```java
public class StringCollector implements Collector<String, StringCombiner, String> {
```

一个收集器由四部分组成。首先是一个 Supplier，这是一个工厂方法，用来创建容器，在这个例子中，就是 StringCombiner。

和 reduce 操作中的第一个参数类似，它是后续操作的初值（如例 5-26 所示）。

例 5-26 Supplier 是创建容器的工厂

```java
public Supplier<StringCombiner> supplier() {
    return () -> new StringCombiner(delim, prefix, suffix);
}
```

让我们一边阅读代码，一边看图，这样就能看清到底是怎么工作的。

由于收集器可以并行收集，我们要展示的收集操作在两个容器上（比如 StringCombiners）并行进行。

收集器的每一个组件都是函数，因此我们使用箭头表示，流中的值用圆圈表示，最终生成的值用椭圆表示。

收集操作一开始，Supplier 先创建出新的容器（如图 5-3）。

收集器的 accumulator 的作用和 reduce 操作的第二个参数一样，它结合之前操作的结果和当前值，生成并返回新的值。这一逻辑已经在 StringCombiners 的 add 方法中得以实现，
直接引用就好了（如例 5-27 所示）。

例 5-27 accumulator 是一个函数，它将当前元素叠加到收集器

```java
public BiConsumer<StringCombiner, String> accumulator() {
    return StringCombiner::add;
}
```

这里的 accumulator 用来将流中的值叠加入容器中（如图 5-4 所示）。


combine 方法很像 reduce 操作的第三个方法。如果有两个容器，我们需要将其合并。

同样，在前面的重构中我们已经实现了该功能，直接使用 StringCombiner.merge 方法就行了（例 5-28）。

例 5-28 combiner 合并两个容器

```java
public BinaryOperator<StringCombiner> combiner() {
    return StringCombiner::merge;
}
```

在收集阶段，容器被 combiner 方法成对合并进一个容器，直到最后只剩一个容器为止（如图 5-5 所示）。


读者可能还记得，在使用收集器之前，重构的最后一步将 toString 方法内联到方法链的末端，这就将 StringCombiners 转换成了我们想要的字符串（如图 5-6 所示）。

收集器的 finisher 方法作用相同。我们已经将流中的值叠加入一个可变容器中，但这还不是我们想要的最终结果。这里调用了 finisher 方法，以便进行转换。在我们想创建字符串
等不可变的值时特别有用，这里容器是可变的。

为了实现 finisher 方法，只需将该操作代理给已经实现的 toString 方法即可（例 5-29）。

例 5-29 finisher 方法返回收集操作的最终结果

```java
public Function<StringCombiner, String> finisher() {
    return StringCombiner::toString;
}
```

从最后剩下的容器中得到最终结果。


关于收集器，还有一点一直没有提及，那就是特征。

特征是一组描述收集器的对象，框架可以对其适当优化。characteristics 方法定义了特征。

在这里我有必要重申，这些代码只作教学用途，和 joining 收集器的内部实现略有出入。

读者也许会认为 StringCombiner 看起来非常有用，别担心——你没必要亲自去编写，Java8 有一个 java.util.StringJoiner 类，它的作用和 StringCombiner 一样，有类似的 API。

做这些练习的主要目的不仅在于展示定制收集器的工作原理，而且还在于帮助读者编写自己的收集器。

特别是你有自己特定领域内的类，希望从集合中构建一个操作，而标准的集合类并没有提供这种操作时，就需要定制自己的收集器。

以 StringCombiner 为例，收集值的容器和我们想要创建的值（字符串）不一样。如果想要收集的是不可变对象，而不是可变对象，那么这种情况就非常普遍，否则收集操作的每一
步都需要创建一个新值。

想要收集的最终结果和容器一样是完全有可能的。事实上，如果收集的最终结果是集合，比如 toList 收集器，就属于这种情况。

此时，finisher 方法不需要对容器做任何操作。

更正式地说，此时的 finisher 方法其实是 identity 函数：它返回传入参数的值。

如果这样，收集器就展现出 IDENTITY_FINISH 的特征，需要使用 characteristics 方法声明。

## 5.3.8 对收集器的归一化处理

就像之前看到的那样，定制收集器其实不难，但如果你想为自己领域内的类定制一个收集器，不妨考虑一下其他替代方案。

最容易想到的方案是构建若干个集合对象，作为参数传给领域内类的构造函数。如果领域内的类包含多种集合，这种方式又简单又适用。

当然，如果领域内的类没有这些集合，需要在已有数据上计算，那这种方法就不合适了。

但即使如此，也不见得需要定制一个收集器。你还可以使用 reducing 收集器，它为流上的归一操作提供了统一实现。

例 5-30 展示了如何使用 reducing 收集器编写字符串处理程序。

例 5-30 reducing 是一种定制收集器的简便方式

```java
String result =
artists.stream()
.map(Artist::getName)
.collect(Collectors.reducing(
    new StringCombiner(", ", "[", "]"),
    name -> new StringCombiner(", ", "[", "]").add(name),
    StringCombiner::merge))
.toString();
```

这和我在例 5-20 中讲到的基于 reduce 操作的实现很像，这点从方法名中就能看出。

区别在于 Collectors.reducing 的第二个参数，我们为流中每个元素创建了唯一的StringCombiner。

如果你被这种写法吓到了，或是感到恶心，你不是一个人！

这种方式非常低效，这也是我要定制收集器的原因之一。

# 5.4 一些细节

Lambda 表达式的引入也推动了一些新方法被加入集合类。让我们来看看 Map 类的一些变化。

构建 Map 时，为给定值计算键值是常用的操作之一，一个经典的例子就是实现一个缓存。传统的处理方式是先试着从 Map 中取值，如果没有取到，创建一个新值并返回。

假设使用 `Map<String, Artist> artistCache` 定义缓存，我们需要使用费时的数据库操作查询艺术家信息，代码可能如例 5-31 所示。

例 5-31 使用显式判断空值的方式缓存

```java
public Artist getArtist(String name) {
    Artist artist = artistCache.get(name);
    if (artist == null) {
        artist = readArtistFromDB(name);
        artistCache.put(name, artist);
    }
    return artist;
}
```

Java 8 引入了一个新方法 computeIfAbsent，该方法接受一个 Lambda 表达式，值不存在时使用该 Lambda 表达式计算新值。使用该方法，可将上述代码重写为例 5-32 所示的形式。

例 5-32 使用 computeIfAbsent 缓存

```java
public Artist getArtist(String name) {
    return artistCache.computeIfAbsent(name, this::readArtistFromDB);
}
```

你可能还希望在值不存在时不计算，为 Map 接口新增的 compute 和 computeIfAbsent 就能处理这些情况。

在工作中，你可能尝试过在 Map 上迭代。过去的做法是使用 value 方法返回一个值的集合，然后在集合上迭代。

这样的代码不易读。例 5-33 展示了本章早些时候介绍的一种方式，创建一个 Map，然后统计每个艺术家专辑的数量。

例 5-33 一种丑陋的迭代 Map 的方式

```java
Map<Artist, Integer> countOfAlbums = new HashMap<>();
for(Map.Entry<Artist, List<Album>> entry : albumsByArtist.entrySet()) {
    Artist artist = entry.getKey();
    List<Album> albums = entry.getValue();
    countOfAlbums.put(artist, albums.size());
}
```

谢天谢地，Java 8 为 Map 接口新增了一个 forEach 方法，该方法接受一个 BiConsumer 对象
为参数（该对象接受两个参数，返回空），通过内部迭代编写出易于阅读的代码，关于内
部迭代请参考 3.1 节。

使用该方法重写后的代码如例 5-34 所示。例 5-34 使用内部迭代遍历 Map 里的值

```java
Map<Artist, Integer> countOfAlbums = new HashMap<>();
    albumsByArtist.forEach((artist, albums) -> {
        countOfAlbums.put(artist, albums.size());
    });
```

# 参考资料

《java8 函数式编程》

* any list
{:toc}