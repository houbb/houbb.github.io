---
layout: post
title: java8 函数式编程-03-Stream 流
date:  2020-6-5 17:42:59 +0800
categories: [Java]
tags: [jdk8, functional-programming, lambda, sh]
published: true
---

Java 8 中新增的特性旨在帮助程序员写出更好的代码，其中对核心类库的改进是很关键的一部分，也是本章的主要内容。

对核心类库的改进主要包括集合类的 API 和新引入的流（Stream）。

流使程序员得以站在更高的抽象层次上对集合进行操作。本章会介绍 Stream 类中的一组方法，每个方法都对应集合上的一种操作。

# 3.1 从外部迭代到内部迭代

Java 程序员在使用集合类时，一个通用的模式是在集合上进行迭代，然后处理返回的每一

个元素。比如要计算从伦敦来的艺术家的人数，通常代码会写成例 3-1 这样。

- 例 3-1 使用 for 循环计算来自伦敦的艺术家人数

```java
int count = 0;
for (Artist artist : allArtists) {
    if (artist.isFrom("London")) {
        count++;
    }
}
```

尽管这样的操作可行，但存在几个问题。

每次迭代集合类时，都需要写很多样板代码。

将for 循环改造成并行方式运行也很麻烦，需要修改每个 for 循环才能实现。

此外，上述代码无法流畅传达程序员的意图。

for 循环的样板代码模糊了代码的本意，程序员必须阅读整个循环体才能理解。

若是单一的 for 循环，倒也问题不大，但面对一个满是循环（尤其是嵌套循环）的庞大代码库时，负担就重了。

就其背后的原理来看，for 循环其实是一个封装了迭代的语法糖，我们在这里多花点时间，看看它的工作原理。

首先调用 iterator 方法，产生一个新的 Iterator 对象，进而控制整个迭代过程，这就是外部迭代。

迭代过程通过显式调用 Iterator 对象的 hasNext 和 next方法完成迭代。

展开后的代码如例 3-2 所示，图 3-1 展示了迭代过程中的方法调用。

- 例 3-2 使用迭代器计算来自伦敦的艺术家人数

```java
int count = 0;
Iterator<Artist> iterator = allArtists.iterator();
while(iterator.hasNext()) {
    Artist artist = iterator.next();
    if (artist.isFrom("London")) {
        count++;
    }
}
```

然而，外部迭代也有问题。首先，它很难抽象出本章稍后提及的不同操作；此外，它从本质上来讲是一种串行化操作。

总体来看，**使用 for 循环会将行为和方法混为一谈**。

另一种方法就是内部迭代，如例 3-3 所示。

首先要注意 stream() 方法的调用，它和例 3-2 中调用 iterator() 的作用一样。

该方法不是返回一个控制迭代的 Iterator 对象，而是返回内部迭代中的相应接口：Stream。

- 例 3-3 使用内部迭代计算来自伦敦的艺术家人数

```java
long count = allArtists.stream()
.filter(artist -> artist.isFrom("London"))
.count();
```

例 3-3 可被分解为两步更简单的操作：

1. 找出所有来自伦敦的艺术家；

2. 计算他们的人数。

每种操作都对应 Stream 接口的一个方法。

为了找出来自伦敦的艺术家，需要对 Stream 对象进行过滤：filter。过滤在这里是指“只保留通过某项测试的对象”。测试由一个函数完
成，根据艺术家是否来自伦敦，该函数返回 true 或者 false。由于 Stream API 的函数式编程风格，我们并没有改变集合的内容，而是描述出 Stream 里的内容。

count() 方法计算给定 Stream 里包含多少个对象。

## 自己补充源码层

stream 到底发生了什么？我们以 arraylist 为例，自己看一下。

```java
List<String> list = new ArrayList<>();
list.stream();
```

collect 接口中有一个默认接口实现方法， arraylist 没有重载，默认就是这个实现。

```java
default Stream<E> stream() {
    return StreamSupport.stream(spliterator(), false);
}
```

这里 stream 需要传入一个迭代器。

```java
default Spliterator<E> spliterator() {
    return Spliterators.spliterator(this, 0);
}

public static <T> Spliterator<T> spliterator(Collection<? extends T> c,
                                             int characteristics) {
    return new IteratorSpliterator<>(Objects.requireNonNull(c),
                                     characteristics);
}
```

这是一个默认实现，但是实际上 arraylist 做了重载：

```java
public Spliterator<E> spliterator() {
    return new ArrayListSpliterator<>(this, 0, -1, 0);
}
```

所以最核心的是，针对不同的集合，实现一个迭代器。根据这个迭代器，构建新的 stream 对象。

# 3.2 实现机制

例 3-3 中，整个过程被分解为两种更简单的操作：过滤和计数，看似有化简为繁之嫌——

例 3-1 中只含一个 for 循环，两种操作是否意味着需要两次循环？

事实上，类库设计精妙，只需对艺术家列表迭代一次。

通常，在 Java 中调用一个方法，计算机会随即执行操作：比如，System.out.println("Hello World"); 会在终端上输出一条信息。

Stream 里的一些方法却略有不同，它们虽是普通的 Java 方法，但返回的 Stream 对象却不是一个新集合，而是创建新集合的配方。

现在，尝试思考一下例 3-4 中代码的作用，一时毫无头绪也没关系，稍后会详细解释。

例 3-4 只过滤，不计数

```java
allArtists.stream()
.filter(artist -> artist.isFrom("London"));
```

这行代码并未做什么实际性的工作，filter 只刻画出了 Stream，但没有产生新的集合。

像filter 这样只描述 Stream，最终不产生新集合的方法叫作惰性求值方法；而像 count 这样最终会从 Stream 产生值的方法叫作及早求值方法。

如果在过滤器中加入一条 println 语句，来输出艺术家的名字，就能轻而易举地看出其中的不同。

例 3-5 对例 3-4 作了一些修改，加入了输出语句。运行这段代码，程序不会输出任何信息！

- 例 3-5 由于使用了惰性求值，没有输出艺术家的名字

```java
allArtists.stream()
.filter(artist -> {
    System.out.println(artist.getName());
    return artist.isFrom("London");
});
```

如果将同样的输出语句加入一个拥有终止操作的流，如例 3-3 中的计数操作，艺术家的名字就会被输出（见例 3-6）。

PS: 也就是这里还是惰性的，并不会被调到？那是如何实现的呢？方法已经调用了，却可以不执行？

- 例 3-6 输出艺术家的名字

```java
long count = allArtists.stream()
.filter(artist -> {
    System.out.println(artist.getName());
    return artist.isFrom("London");
})
.count();
```

以披头士乐队的成员作为艺术家列表，运行上述程序，命令行里输出的内容如例 3-7 所示。

- 例 3-7 显示披头士乐队成员名单的示例输出

```
John Lennon
Paul McCartney
George Harrison
Ringo Starr
```

判断一个操作是惰性求值还是及早求值很简单：只需看它的返回值。

如果返回值是 Stream，那么是惰性求值；如果返回值是另一个值或为空，那么就是及早求值。

使用这些操作的理想方式就是形成一个惰性求值的链，最后用一个及早求值的操作返回想要的结果，这正是它的合理之处。

计数的示例也是这样运行的，但这只是最简单的情况：只含两步操作。

整个过程和建造者模式有共通之处。

建造者模式使用一系列操作设置属性和配置，最后调用一个 build 方法，这时，对象才被真正创建。

读者一定会问：“为什么要区分惰性求值和及早求值？”

只有在对需要什么样的结果和操作有了更多了解之后，才能更有效率地进行计算。

例如，如果要找出大于 10 的第一个数字，那么并不需要和所有元素去做比较，只要找出第一个匹配的元素就够了。

这也意味着可以在集合类上级联多种操作，但迭代只需一次。

## 3.3 常用的流操作

为了更好地理解 Stream API，掌握一些常用的 Stream 操作十分必要。除此处讲述的几种重要操作之外，该 API 的 Javadoc 中还有更多信息。

### 3.3.1 collect(toList())

collect(toList()) 方法由 Stream 里的值生成一个列表，是一个及早求值操作

Stream 的 of 方法使用一组初始值生成新的 Stream。

事实上，collect 的用法不仅限于此，它是一个非常通用的强大结构，第 5 章将详细介绍它的其他用途。

下面是使用 collect 方法的一个例子：

```java
List<String> collected = Stream.of("a", "b", "c") //1
.collect(Collectors.toList()); //2
assertEquals(Arrays.asList("a", "b", "c"), collected); //3
```

这段程序展示了如何使用 collect(toList()) 方法从 Stream 中生成一个列表。

如上文所述，由于很多 Stream 操作都是惰性求值，因此调用 Stream 上一系列方法之后，还需要最后再调用一个类似 collect 的及早求值方法。

这个例子也展示了本节中所有示例代码的通用格式。

首先由列表生成一个 Stream ➊，然后进行一些 Stream 上的操作，继而是 collect 操作，由 Stream 生成列表➋，最后使用断言判断结果是否和预期一致➌。

形象一点儿的话，可以将 Stream 想象成汉堡，将最前和最后对 Stream 操作的方法想象成两片面包，这两片面包帮助我们认清操作的起点和终点。

### 3.3.2 map

如果有一个函数可以将一种类型的值转换成另外一种类型，map 操作就可以使用该函数，将一个流中的值转换成一个新的流。

读者可能已经注意到，以前编程时或多或少使用过类似 map 的操作。

比如编写一段 Java 代码，将一组字符串转换成对应的大写形式。

在一个循环中，对每个字符串调用 toUppercase方法，然后将得到的结果加入一个新的列表。

代码如例 3-8 所示。

- 例 3-8 使用 for 循环将字符串转换为大写

```java
List<String> collected = new ArrayList<>();
for (String string : asList("a", "b", "hello")) {
    String uppercaseString = string.toUpperCase();
    collected.add(uppercaseString);
}
assertEquals(asList("A", "B", "HELLO"), collected);
```

如果你经常实现例 3-8 中这样的 for 循环，就不难猜出 map 是 Stream 上最常用的操作之一（如图 3-3 所示）。

例 3-9 展示了如何使用新的流框架将一组字符串转换成大写形式。

例 3-9 使用 map 操作将字符串转换为大写形式

```java
List<String> collected = Stream.of("a", "b", "hello")
.map(string -> string.toUpperCase()) //1
.collect(toList());
assertEquals(asList("A", "B", "HELLO"), collected);
```

传给 map ➊ 的 Lambda 表达式只接受一个 String 类型的参数，返回一个新的 String。

参数和返回值不必属于同一种类型，但是 Lambda 表达式必须是 Function 接口的一个实例（如图 3-4 所示），Function 接口是只包含一个参数的普通函数接口。

### 3.3.3 filter

遍历数据并检查其中的元素时，可尝试使用 Stream 中提供的新方法 filter（如图 3-5 所示）。

假设要找出一组字符串中以数字开头的字符串，比如字符串 "1abc" 和 "abc"，其中 "1abc" 就是符合条件的字符串。

可以使用一个 for 循环，内部用 if 条件语句判断字符串的第一个字符来解决这个问题，代码如例 3-10 所示。

- 例 3-10 使用循环遍历列表，使用条件语句做判断

```java
List<String> beginningWithNumbers = new ArrayList<>();
for(String value : asList("a", "1abc", "abc1")) {
    if (isDigit(value.charAt(0))) {
        beginningWithNumbers.add(value);
    }
}
assertEquals(asList("1abc"), beginningWithNumbers);
```

你可能已经写过很多类似的代码：这被称为 filter 模式。

该模式的核心思想是保留 Stream中的一些元素，而过滤掉其他的。

例 3-11 展示了如何使用函数式风格编写相同的代码。

- 例 3-11 函数式风格

```java
List<String> beginningWithNumbers
= Stream.of("a", "1abc", "abc1")
.filter(value -> isDigit(value.charAt(0)))
.collect(toList());
assertEquals(asList("1abc"), beginningWithNumbers);
```

和 map 很像，filter 接受一个函数作为参数，该函数用 Lambda 表达式表示。

该函数和前面示例中 if 条件判断语句的功能一样，如果字符串首字母为数字，则返回 true。

若要重构遗留代码，for 循环中的 if 条件语句就是一个很强的信号，可用 filter 方法替代。

由于此方法和 if 条件语句的功能相同，因此其返回值肯定是 true 或者 false。

经过过滤，Stream 中符合条件的，即 Lambda 表达式值为 true 的元素被保留下来。

该 Lambda 表达式的函数接口正是前面章节中介绍过的 Predicate（如图 3-6 所示）。

### 3.3.4 flatMap

flatMap 方法可用 Stream 替换值，然后将多个 Stream 连接成一个 Stream。

前面已介绍过 map 操作，它可用一个新的值代替 Stream 中的值。

但有时，用户希望让 map操作有点变化，生成一个新的 Stream 对象取而代之。

用户通常不希望结果是一连串的流，此时 flatMap 最能派上用场。

我们看一个简单的例子。

假设有一个包含多个列表的流，现在希望得到所有数字的序列。该问题的一个解法如例 3-12 所示。

- 例 3-12 包含多个列表的 Stream

```java
List<Integer> together = Stream.of(asList(1, 2), asList(3, 4))
.flatMap(numbers -> numbers.stream())
.collect(toList());
assertEquals(asList(1, 2, 3, 4), together);
```

调用 stream 方法，将每个列表转换成 Stream 对象，其余部分由 flatMap 方法处理。

flatMap 方法的相关函数接口和 map 方法的一样，都是 Function 接口，只是方法的返回值限定为 Stream 类型罢了。

### 3.3.5 max和min

Stream 上常用的操作之一是求最大值和最小值。

Stream API 中的 max 和 min 操作足以解决这一问题。

例 3-13 是查找专辑中最短曲目所用的代码，展示了如何使用 max 和 min 操作。

为了方便检查程序结果是否正确，代码片段中罗列了专辑中的曲目信息，我承认，这张专辑是有点冷门。

- 例 3-13 使用 Stream 查找最短曲目

```java
List<Track> tracks = asList(new Track("Bakai", 524),
new Track("Violets for Your Furs", 378),
new Track("Time Was", 451));
Track shortestTrack = tracks.stream()
.min(Comparator.comparing(track -> track.getLength()))
.get();
assertEquals(tracks.get(1), shortestTrack);
```

查找 Stream 中的最大或最小元素，首先要考虑的是用什么作为排序的指标。以查找专辑中的最短曲目为例，排序的指标就是曲目的长度。

为了让 Stream 对象按照曲目长度进行排序，需要传给它一个 Comparator 对象。

Java 8 提供了一个新的静态方法 comparing，使用它可以方便地实现一个比较器。

放在以前，我们需要比较两个对象的某项属性的值，现在只需要提供一个存取方法就够了。

本例中使用 getLength 方法。

花点时间研究一下 comparing 方法是值得的。

实际上这个方法接受一个函数并返回另一个函数。我知道，这听起来像句废话，但是却很有用。

这个方法本该早已加入 Java 标准库，但由于匿名内部类可读性差且书写冗长，一直未能实现。

现在有了 Lambda 表达式，代码变得简洁易懂。

此外，还可以调用空 Stream 的 max 方法，返回 Optional 对象。

Optional 对象有点陌生，它代表一个可能存在也可能不存在的值。

如果 Stream 为空，那么该值不存在，如果不为空，则该值存在。

先不必细究，4.10 节将详细讲述 Optional 对象，现在唯一需要记住的是，通过调用 get 方法可以取出 Optional 对象中的值。

### 3.3.6 通用模式

max 和 min 方法都属于更通用的一种编程模式。

要看到这种编程模式，最简单的方法是使用 for 循环重写例 3-13 中的代码。

例 3-14 和例 3-13 的功能一样，都是查找专辑中的最短曲目，但是使用了 for 循环。

- 例 3-14 使用 for 循环查找最短曲目

```java
List<Track> tracks = asList(new Track("Bakai", 524),
new Track("Violets for Your Furs", 378),
new Track("Time Was", 451));

Track shortestTrack = tracks.get(0);
    for (Track track : tracks) {
    if (track.getLength() < shortestTrack.getLength()) {
        shortestTrack = track;
    }
}
assertEquals(tracks.get(1), shortestTrack);
```

这段代码先使用列表中的第一个元素初始化变量 shortestTrack，然后遍历曲目列表，如果找到更短的曲目，则更新 shortestTrack，最后变量 shortestTrack 保存的正是最短曲目。

程序员们无疑已写过成千上万次这样的 for 循环，其中很多都属于这个模式。

例 3-15 中的伪代码体现了通用模式的特点。

- 例 3-15 reduce 模式

```java
Object accumulator = initialValue;
for(Object element : collection) {
    accumulator = combine(accumulator, element);
}
```

首先赋给 accumulator 一个初始值：initialValue，然后在循环体中，通过调用 combine 函数，拿 accumulator 和集合中的每一个元素做运算，再将运算结果赋给 accumulator，最后
accumulator 的值就是想要的结果。

这个模式中的两个可变项是 initialValue 初始值和 combine 函数。

在例 3-14 中，我们选列表中的第一个元素为初始值，但也不必需如此。

为了找出最短曲目，combine 函数返回当前元素和 accumulator 中较短的那个。

接下来看一下 Stream API 中的 reduce 操作是怎么工作的。

### 3.3.7 reduce

reduce 操作可以实现从一组值中生成一个值。在上述例子中用到的 count、min 和 max 方法，因为常用而被纳入标准库中。

事实上，这些方法都是 reduce 操作。

图 3-8 展示了如何通过 reduce 操作对 Stream 中的数字求和。

以 0 作起点——一个空Stream 的求和结果，每一步都将 Stream 中的元素累加至 accumulator，遍历至 Stream 中的最后一个元素时，accumulator 的值就是所有元素的和。

例 3-16 中的代码展示了这一过程。Lambda 表达式就是 reducer，它执行求和操作，有两个参数：传入 Stream 中的当前元素和 acc。

将两个参数相加，acc 是累加器，保存着当前的累加结果。

- 例 3-16 使用 reduce 求和

```java
int count = Stream.of(1, 2, 3)
.reduce(0, (acc, element) -> acc + element);
assertEquals(6, count);
```

Lambda 表达式的返回值是最新的 acc，是上一轮 acc 的值和当前元素相加的结果。

reducer 的类型是第 2 章已介绍过的 BinaryOperator。

表 3-1 显示了求和过程中的中间值。

事实上，可以将 reduce 操作展开，得到例 3-17 这样形式的代码。

- 例 3-17 展开 reduce 操作

```java
BinaryOperator<Integer> accumulator = (acc, element) -> acc + element;
int count = accumulator.apply(
    accumulator.apply(
    accumulator.apply(0, 1),
    2),
3);
```

例 3-18 是可实现同样功能的命令式 Java 代码，从中可清楚看出函数式编程和命令式编程的区别。

- 例 3-18 使用命令式编程方式求和

```java
int acc = 0;
for (Integer element : asList(1, 2, 3)) {
    acc = acc + element;
}
assertEquals(6, acc);
```

在命令式编程方式下，每一次循环将集合中的元素和累加器相加，用相加后的结果更新累加器的值。

对于集合来说，循环在外部，且需要手动更新变量。

### 3.3.8 整合操作

Stream 接口的方法如此之多，有时会让人难以选择，像闯入一个迷宫，不知道该用哪个方法更好。

本节将举例说明如何将问题分解为简单的 Stream 操作。

第一个要解决的问题是，找出某张专辑上所有乐队的国籍。艺术家列表里既有个人，也有乐队。利用一点领域知识，假定一般乐队名以定冠词 The 开头。当然这不是绝对的，但也
差不多。

需要注意的是，这个问题绝不是简单地调用几个 API 就足以解决。这既不是使用 map 将一
组值映射为另一组值，也不是过滤，更不是将 Stream 中的元素最终归约为一个值。首先，
可将这个问题分解为如下几个步骤。

1. 找出专辑上的所有表演者。
2. 分辨出哪些表演者是乐队。
3. 找出每个乐队的国籍。
4. 将找出的国籍放入一个集合。

现在，找出每一步对应的 Stream API 就相对容易了：

1. Album 类有个 getMusicians 方法，该方法返回一个 Stream 对象，包含整张专辑中所有的表演者；

2. 使用 filter 方法对表演者进行过滤，只保留乐队；

3. 使用 map 方法将乐队映射为其所属国家；

4. 使用 collect(Collectors.toList()) 方法将国籍放入一个列表。

最后，整合所有的操作，就得到如下代码：

```java
Set<String> origins = album.getMusicians()
.filter(artist -> artist.getName().startsWith("The"))
.map(artist -> artist.getNationality())
.collect(toSet());
```

这个例子将 Stream 的链式操作展现得淋漓尽致，调用 getMusicians、filter 和 map 方法都返回 Stream 对象，因此都属于惰性求值，而 collect 方法属于及早求值。

map 方法接受一个 Lambda 表达式，使用该 Lambda 表达式对 Stream 上的每个元素做映射，形成一个新的Stream。

这个问题处理起来很方便，使用 getMusicians 方法获取专辑上的艺术家列表时得到的是一个 Stream 对象。

然而，处理其他实际遇到的问题时未必也能如此方便，很可能没有方法可以返回一个 Stream 对象，反而得到像 List 或 Set 这样的集合类。

别担心，只要调用 List或 Set 的 stream 方法就能得到一个 Stream 对象。

现在或许是个思考的好机会，你真的需要对外暴露一个 List 或 Set 对象吗？

可能一个Stream 工厂才是更好的选择。

通过 Stream 暴露集合的最大优点在于，它很好地封装了内部实现的数据结构。

仅暴露一个 Stream 接口，用户在实际操作中无论如何使用，都不会影响内部的 List 或 Set。

同时这也鼓励用户在编程中使用更现代的 Java 8 风格。

不必一蹴而就，可以对已有代码渐进性地重构，保留原有的取值函数，添加返回 Stream 对象的函数，时间长了，就可以删掉所有返回 List 或 Set 的取值函数。

清理了所有遗留代码之后，这种重构方式让人感觉棒极了！

# 3.5 多次调用流操作

用户也可以选择每一步强制对函数求值，而不是将所有的方法调用链接在一起，但是，最好不要如此操作。

例 3-24 展示了如何用如上述不建议的编码风格来找出专辑上所有演出乐队的国籍，例 3-25 则是之前的代码，放在一起方便比较。

- 例 3-24 误用 Stream 的例子

```java
List<Artist> musicians = album.getMusicians()
.collect(toList());
List<Artist> bands = musicians.stream()
.filter(artist -> artist.getName().startsWith("The"))
.collect(toList());
Set<String> origins = bands.stream()
.map(artist -> artist.getNationality())
.collect(toSet());
```

- 例 3-25 符合 Stream 使用习惯的链式调用

```java
Set<String> origins = album.getMusicians()
.filter(artist -> artist.getName().startsWith("The"))
.map(artist -> artist.getNationality())
.collect(toSet());
```

例 3-24 所示代码和流的链式调用相比有如下缺点：

- 代码可读性差，样板代码太多，隐藏了真正的业务逻辑；

- 效率差，每一步都要对流及早求值，生成新的集合；

- 代码充斥一堆垃圾变量，它们只用来保存中间结果，除此之外毫无用处；

- 难于自动并行化处理。

当然，刚开始写基于流的程序时，这样的情况在所难免。

但是如果发现自己经常写出这样的代码，就要反思能否将代码重构得更加简洁易读。

# 3.6 高阶函数

本章中不断出现被函数式编程程序员称为高阶函数的操作。

高阶函数是指接受另外一个函数作为参数，或返回一个函数的函数。

高阶函数不难辨认：看函数签名就够了。

如果函数的参数列表里包含函数接口，或该函数返回一个函数接口，那么该函数就是高阶函数。

map 是一个高阶函数，因为它的 mapper 参数是一个函数。

事实上，本章介绍的 Stream 接口中几乎所有的函数都是高阶函数。

之前的排序例子中还用到了 comparing 函数，它接受一个函数作为参数，获取相应的值，同时返回一个 Comparator。

Comparator 可能会被误认为是一个对象，但它有且只有一个抽象方法，所以实际上是一个函数接口。

事实上，可以大胆断言，Comparator 实际上应该是个函数，但是那时的 Java 只有对象，因此才造出了一个类，一个匿名类。

成为对象实属巧合，函数接口向正确的方向迈出了一步。

# 3.7 正确使用Lambda表达式

刚开始介绍 Lambda 表达式时，以能够输出一些信息的回调函数为示例。

回调函数是一个合法的 Lambda 表达式，但并不能真正帮助用户写出更简单、更抽象的代码，因为它仍然在指挥计算机执行一个操作。

清理掉样板代码很有帮助，但 Java 8 引入的 Lambda 表达式的作用远不止这些。

本章介绍的概念能够帮助用户写出更简单的代码，因为这些概念描述了数据上的操作，明确了要达成什么转化，而不是说明如何转化。

这种方式写出的代码，潜在的缺陷更少，更直接地表达了程序员的意图。

明确要达成什么转化，而不是说明如何转化的另外一层含义在于写出的函数没有副作用。这一点非常重要，这样只通过函数的返回值就能充分理解函数的全部作用。

没有副作用的函数不会改变程序或外界的状态。

本书中的第一个 Lambda 表达式示例是有副作用的，它向控制台输出了信息——一个可观测到的副作用。

下面的代码有没有副作用？

```java
private ActionEvent lastEvent;
private void registerHandler() {
    button.addActionListener((ActionEvent event) -> {
        this.lastEvent = event;
    });
}
```

这里将参数 event 保存至成员变量 lastEvent。

给变量赋值也是一种副作用，而且更难察觉。

在程序的输出中可能很难直接观察到，但是它的确更改了程序的状态。

Java 在这方面有局限性，例如下面这段代码，赋值给一个局部变量 localEvent：

```java
ActionEvent localEvent = null;
button.addActionListener(event -> {
    localEvent = event;
});
```

这段代码试图将 event 赋给一个局部变量，它无法通过编译，但绝非编写错误。

这实际上是语言的设计者有意为之，用以鼓励用户使用 Lambda 表达式获取值而不是变量。

获取值使用户更容易写出没有副作用的代码。

如第二章所述，在 Lambda 表达式中使用局部变量，可以不使用 final 关键字，但局部变量在既成事实上必须是 final 的。

无论何时，将 Lambda 表达式传给 Stream 上的高阶函数，都**应该尽量避免副作用**。

唯一的例外是 forEach 方法，它是一个终结方法。

# 参考资料

《java8 函数式编程》

* any list
{:toc}