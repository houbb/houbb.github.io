---
layout: post
title: Java8-14-Stream 数值流 构建流
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, jdk8, functional, sh]
published: true
---

# 数值流

我们在前面看到了可以使用 reduce 方法计算流中元素的总和。

例如，你可以像下面这样计算菜单的热量：

```java
int calories = menu.stream()
                    .map(Dish::getCalories)
                    .reduce(0, Integer::sum);
```

这段代码的问题是，它有一个暗含的装箱成本。每个 Integer 都必须拆箱成一个原始类型，再进行求和。

## 希望更加简化

要是可以直接像下面这样调用 sum 方法，岂不是更好？

```java
int calories = menu.stream()
                    .map(Dish::getCalories)
                    .sum();
```

但这是不可能的。问题在于 map 方法会生成一个 Stream 。

虽然流中的元素是 Integer 类型，但 Streams 接口没有定义 sum 方法。

为什么没有呢？比方说，你只有一个像 menu 那样的Stream ，把各种菜加起来是没有任何意义的。

但不要担心，Stream API还提供了原始类型流特化，专门支持处理数值流的方法。

## 原始类型流特化

Java 8引入了三个原始类型特化流接口来解决这个问题： IntStream、 DoubleStream 和 LongStream ，分别将流中的元素特化为 int 、 long 和 double ，从而避免了暗含的装箱成本。

每个接口都带来了进行常用数值归约的新方法，比如对数值流求和的 sum，找到最大元素的max。

此外还有在必要时再把它们转换回对象流的方法。

要记住的是，这些特化的原因并不在于流的复杂性，而是装箱造成的复杂性——即类似 int 和 Integer 之间的效率差异。

### 1.映射到数值流

将流转换为特化版本的常用方法是 mapToInt 、 mapToDouble 和 mapToLong 。

这些方法和前面说的 map 方法的工作方式一样，只是它们返回的是一个特化流，而不是 Stream。

例如，我们可以像下面这样用 mapToInt 对 menu 中的卡路里求和：

```java
int calories = menu.stream()
        // 返回一个IntStream
        .mapToInt(Dish::getCalories)
        .sum();
```

这里， mapToInt 会从每道菜中提取热量（用一个 Integer 表示），并返回一个 IntStream（而不是一个 Stream ）。

然后你就可以调用 IntStream 接口中定义的 sum 方法，对卡路里求和了！

请注意，如果流是空的，sum 默认返回 0 。 

IntStream 还支持其他的方便方法，如max、min、average 等。

### 2.转换回对象流

同样，一旦有了数值流，你可能会想把它转换回非特化流。

例如， IntStream 上的操作只能产生原始整数： IntStream 的 map 操作接受的Lambda必须接受 int 并返回 int （一个IntUnaryOperator ）。

但是你可能想要生成另一类值，比如 Dish。

为此，你需要访问 Stream接口中定义的那些更广义的操作。

要把原始流转换成一般流（每个 int 都会装箱成一个Integer ），可以使用 `boxed()` 方法，如下所示：

```java
IntStream intStream = menu.stream().mapToInt(Dish::getCalories);
Stream<Integer> stream = intStream.boxed();
```

### 3.默认值 OptionalInt

求和的那个例子很容易，因为它有一个默认值：0 。

但是，如果你要计算 IntStream 中的最大元素，就得换个法子了，因为 0 是错误的结果。

如何区分没有元素的流和最大值真的是 0 的流呢？

前面我们介绍了 Optional 类，这是一个可以表示值存在或不存在的容器。 

Optional 可以用Integer 、 String 等参考类型来参数化。

对于三种原始流特化，也分别有一个 Optional 原始类型特化版本： OptionalInt 、 OptionalDouble 和 OptionalLong 。

例如，要找到 IntStream 中的最大元素，可以调用 max 方法，它会返回一个 OptionalInt ：

```java
OptionalInt maxCalories = menu.stream()
                .mapToInt(Dish::getCalories)
                .max();
```

现在，如果没有最大值的话，你就可以显式处理 OptionalInt 去定义一个默认值了：

```java
int max = maxCalories.orElse(1);
```

## 数值范围

和数字打交道时，有一个常用的东西就是数值范围。

比如，假设你想要生成1和100之间的所有数字。

Java 8引入了两个可以用于 IntStream 和 LongStream 的静态方法，帮助生成这种范围：range 和 rangeClosed 。

这两个方法都是第一个参数接受起始值，第二个参数接受结束值。

但range 是不包含结束值的，而 rangeClosed 则包含结束值。

让我们来看一个例子：

```java
// 一个从1到100的偶数流 包含结束值
IntStream evenNumbers = IntStream.rangeClosed(1, 100)
        .filter(n -> n % 2 == 0);
// 从1到100共有50个偶数
System.out.println(evenNumbers.count());
```

这里我们用了 rangeClosed 方法来生成1到100之间的所有数字。

它会产生一个流，然后你可以链接 filter 方法，只选出偶数。

到目前为止还没有进行任何计算。最后，你对生成的流调用 count 。因为 count 是一个终端操作，所以它会处理流，并返回结果 50 ，这正是1到100（包括
两端）中所有偶数的个数。

请注意，比较一下，如果改用 IntStream.range(1, 100) ，则结果将会是 49 个偶数，因为 range 是不包含结束值的。

ps：比如 python 对于 Range 的支持应该更加自然。

# 构建流

希望到现在，我们已经让你相信，流对于表达数据处理查询是非常强大而有用的。

到目前为止，你已经能够使用 stream 方法从集合生成流了。

此外，我们还介绍了如何根据数值范围创建数值流。但创建流的方法还有许多！

本节将介绍如何从值序列、数组、文件来创建流，甚至由生成函数来创建无限流！

## 由值创建流

你可以使用静态方法 `Stream.of()`，通过显式值创建一个流。它可以接受任意数量的参数。

例如，以下代码直接使用 Stream.of() 创建了一个字符串流。

然后，你可以将字符串转换为大写，再一个个打印出来：

```java
Stream<String> stream = Stream.of("Java 8 ", "Lambdas ", "In ", "Action");
stream.map(String::toUpperCase).forEach(System.out::println);
```

### 空流

你可以使用 empty 得到一个空流，如下所示：

```java
Stream<String> emptyStream = Stream.empty();
```

## 由数组创建流

我们可以使用静态方法 `Arrays.stream()` 从数组创建一个流。它接受一个数组作为参数。

例如，我们可以将一个原始类型 int 的数组转换成一个 IntStream ，如下所示：

```java
int[] numbers = {2, 3, 5, 7, 11, 13};
// 总和41
int sum = Arrays.stream(numbers).sum();
```

## 由文件生成流

Java中用于处理文件等I/O操作的NIO API（非阻塞 I/O）已更新，以便利用Stream API。

java.nio.file.Files 中的很多静态方法都会返回一个流。

例如，一个很有用的方法是`Files.lines()`，它会返回一个由指定文件中的各行构成的字符串流。

使用我们迄今所学的内容，我们可以用这个方法看看一个文件中有多少各不相同的词：

```java
long uniqueWords;
try (Stream<String> lines = Files.lines(Paths.get(ClassLoader.getSystemResource("data.txt").toURI()),
        Charset.defaultCharset())) {
    uniqueWords = lines.flatMap(line -> Arrays.stream(line.split(" ")))
            .distinct()
            .count();
    System.out.println("uniqueWords:" + uniqueWords);
} catch (IOException e) {
    e.fillInStackTrace();
} catch (URISyntaxException e) {
    e.printStackTrace();
}
```

你可以使用 Files.lines 得到一个流，其中的每个元素都是给定文件中的一行。

然后，你可以对 line 调用 split 方法将行拆分成单词。

应该注意的是，你该如何使用 flatMap 产生一个扁平的单词流，而不是给每一行生成一个单词流。

最后，把 distinct 和 count 方法链接起来，数数流中有多少各不相同的单词。

## 由函数生成流：创建无限流

Stream API提供了两个静态方法来从函数生成流： Stream.iterate() 和 Stream.generate()。

这两个操作可以创建所谓的无限流：不像从固定集合创建的流那样有固定大小的流。

由 iterate 和 generate 产生的流会用给定的函数按需创建值，因此可以无穷无尽地计算下去！

一般来说，应该使用 limit(n) 来对这种流加以限制，以避免打印无穷多个值。

### 1.迭代

我们先来看一个 iterate 的简单例子，然后再解释：

```java
Stream.iterate(0, n -> n + 2)
        .limit(10)
        .forEach(System.out::println);
```

iterate 方法接受一个初始值（在这里是 0 ），还有一个依次应用在每个产生的新值上的Lambda（ UnaryOperator 类型）。

这里，我们使用Lambda  n -> n + 2 ，返回的是前一个元素加上2。

因此，iterate方法生成了一个所有正偶数的流：流的第一个元素是初始值 0 。然后加上 2 来生成新的值 2 ，再加上 2 来得到新的值 4 ，以此类推。

这种 iterate 操作基本上是顺序的，因为结果取决于前一次应用。

请注意，此操作将生成一个无限流——这个流没有结尾，因为值是按需计算的，可以永远计算下去。

**我们说这个流是无界的。正如我们前面所讨论的，这是流和集合之间的一个关键区别。**

我们使用limit方法来显式限制流的大小。这里只选择了前10个偶数。然后可以调用 forEach 终端操作来消费流，并分别打印每个元素。

### 2. 生成

与 iterate 方法类似， generate 方法也可让你按需生成一个无限流。

但 generate 不是依次对每个新生成的值应用函数的。它接受一个 Supplier 类型的Lambda提供新的值。

我们先来看一个简单的用法：

```java
Stream.generate(Math::random)
                .limit(5)
                .forEach(System.out::println);
```

这段代码将生成一个流，其中有五个0到1之间的随机双精度数。

例如，运行一次得到了下面的结果：

```java
0.8404010101858976
0.03607897810804739
0.025199243727344833
0.8368092999566692
0.14685668895309267
```

Math.Random 静态方法被用作新值生成器。同样，你可以用 limit 方法显式限制流的大小，否则流将会无限长。

### generate 的其他用途

你可能想知道， generate 方法还有什么用途。

我们使用的供应源（指向 Math.random 的方法引用）是无状态的：它不会在任何地方记录任何值，以备以后计算使用。

但供应源不一定是无状态的。你可以创建存储状态的供应源，它可以修改状态，并在为流生成下一个值时使用。

我们在这个例子中会使用 IntStream 说明避免装箱操作的代码。 

IntStream 的 generate 方法会接受一个 IntSupplier，而不是 Supplier。

例如，可以这样来生成一个全是1的无限流：

```java
IntStream ones = IntStream.generate(() -> 1);
```

还记得第三章的笔记中，Lambda允许你创建函数式接口的实例，只要直接内联提供方法的实现就可以。

你也可以像下面这样，通过实现 IntSupplier 接口中定义的 getAsInt 方法显式传递一个对象（虽然这看起来是无缘无故地绕圈子，也请你耐心看）：

```java
IntStream twos = IntStream.generate(new IntSupplier(){
    @Override
    public int getAsInt(){
        return 2;
    }
});
```

generate 方法将使用给定的供应源，并反复调用 getAsInt 方法，而这个方法总是返回 2 。

但这里使用的匿名类和Lambda的区别在于，匿名类可以通过字段定义状态，而状态又可以用getAsInt()方法来修改。

这是一个副作用的例子。

我们迄今见过的所有Lambda都是没有副作用的；它们没有改变任何状态。

# 个人感受

1. Stream 定义了一系列非常方便优雅的方法，各种原始的集合、文件提供可以转换为这种对象，就拥有了相应的能力。

2. Stream 可以创建无界的流，就可以和数学上的集合+数论一一对应。是非常大的一个提升。

3. Stream 出于集合而胜于集合。

# 参考资料

《java8 实战》

[【Java8实战】开始使用流](https://mrbird.cc/blog/java8stream1.html)

[JDK8 实战系列](https://juejin.im/user/5ad35e786fb9a028cd458b59/posts)

* any list
{:toc}