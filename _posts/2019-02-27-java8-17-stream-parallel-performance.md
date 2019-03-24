---
layout: post
title: Java8-17-Stream 并行数据处理与性能
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, jdk8, functional, sh]
published: true
---

# 并行数据处理与性能

在前面三章中，我们已经看到了新的 Stream 接口可以让你以声明性方式处理数据集。我们还解释了将外部迭代换为内部迭代能够让原生Java库控制流元素的处理。这种方法让Java程序员无需显式实现优化来为数据集的处理加速。到目前为止，最重要的好处是可以对这些集合执行操作流水线，能够自动利用计算机上的多个内核。

例如，在Java 7之前，并行处理数据集合非常麻烦。第一，你得明确地把包含数据的数据结构分成若干子部分。第二，你要给每个子部分分配一个独立的线程。第三，你需要在恰当的时候对它们进行同步来避免不希望出现的竞争条件，等待所有线程完成，最后把这些部分结果合并起来。

Java 7引入了一个叫作分支/合并的框架，让这些操作更稳定、更不易出错。

在本章中，我们将了解 Stream 接口如何让你不用太费力气就能对数据集执行并行操作。它允许你声明性地将顺序流变为并行流。此外，你将看到Java是如何变戏法的，或者更实际地来说，流是如何在幕后应用Java 7引入的分支/合并框架的。你还会发现，了解并行流内部是如何工作的很重要，因为如果你忽视这一方面，就可能因误用而得到意外的（很可能是错的）结果。

我们会特别演示，在并行处理数据块之前，并行流被划分为数据块的方式在某些情况下恰恰是这些错误且无法解释的结果的根源。

因此，我们将会学习如何通过实现和使用你自己的Spliterator 来控制这个划分过程。

# 并行流

在第4章的笔记中，我们简要地了解到了 Stream 接口可以让你非常方便地处理它的元素：可以通过对收集源调用 `parallelStream` 方法来把集合转换为并行流。

并行流就是一个把内容分成多个数据块，并用不同的线程分别处理每个数据块的流。这样一来，你就可以自动把给定操作的工作负荷分配给多核处理器的所有内核，让它们都忙起来。

## 例子

让我们用一个简单的例子来试验一下这个思想。

假设你需要写一个方法，接受数字n作为参数，并返回从1到给定参数的所有数字的和。一个直接（也许有点土）的方法是生成一个无穷大的数字流，把它限制到给定的数目，然后用对两个数字求和的 BinaryOperator 来归约这个流，如下所示：

```java
public static long sequentialSum(long n) {
    // 生成自然数无限流
    return Stream.iterate(1L, i -> i + 1)
            // 限制到前n个数
            .limit(n)
            // 对所有数字求和来归纳流
            .reduce(0L, Long::sum);
}
```

用更为传统的Java术语来说，这段代码与下面的迭代等价：

```java
public static long iterativeSum(long n) {
    long result = 0;
    for (long i = 0; i <= n; i++) {
        result += i;
    }
    return result;
}
```

这似乎是利用并行处理的好机会，特别是n很大的时候。

那怎么入手呢？你要对结果变量进行同步吗？用多少个线程呢？谁负责生成数呢？谁来做加法呢？

根本用不着担心啦。用并行流的话，这问题就简单多了！

## 将顺序流转换为并行流

我们可以把流转换成并行流，从而让前面的函数归约过程（也就是求和）并行运行——对顺序流调用 parallel 方法：

```java
public static long parallelSum(long n) {
    // 生成自然数无限流
    return Stream.iterate(1L, i -> i + 1)
            // 限制到前n个数
            .limit(n)
            // 将流转为并行流
            .parallel()
            // 对所有数字求和来归纳流
            .reduce(0L, Long::sum);
}
```

并行流的执行过程：

![并行流的执行过程](https://user-gold-cdn.xitu.io/2018/10/7/1664ce9fa487eed6?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

请注意，在现实中，对顺序流调用 parallel 方法并不意味着流本身有任何实际的变化。

它在内部实际上就是设了一个 boolean 标志，表示你想让调用 parallel 之后进行的所有操作都并行执行。

类似地，你只需要对并行流调用 sequential 方法就可以把它变成顺序流。

请注意，你可能以为把这两个方法结合起来，就可以更细化地控制在遍历流时哪些操作要并行执行，哪些要顺序执行。

例如，你可以这样做：

```java
stream.parallel()
        .filter(...)
        .sequential()
        .map(...)
        .parallel()
        .reduce();
```

但最后一次 parallel 或 sequential 调用会影响整个流水线。

在本例中，流水线会并行执行，因为最后调用的是它。

回到我们的数字求和练习，我们说过，在多核处理器上运行并行版本时，会有显著的性能提升。

现在你有三个方法，用三种不同的方式（迭代式、顺序归纳和并行归纳）做完全相同的操作，让我们看看谁最快吧！

## 测量流性能

我们声称并行求和方法应该比顺序和迭代方法性能好。然而在软件工程上，靠猜绝对不是什么好办法！

特别是在优化性能时，你应该始终遵循三个黄金规则：测量，测量，再测量。

### 测量对前n个自然数求和的函数的性能

```java
public static long measurePerf(Function<Long, Long> adder, long n) {
    long fastest = Long.MAX_VALUE;
    for (int i = 0; i < 10; i++) {
        long start = System.nanoTime();
        long sum = adder.apply(n);
        long duration = (System.nanoTime() - start) / 1_000_000;
        System.out.println("Result: " + sum);
        if (duration < fastest) {
            fastest = duration;
        }
    }
    return fastest;
}
```

这个方法接受一个函数和一个 long 作为参数。它会对传给方法的 long 应用函数10次，记录每次执行的时间（以毫秒为单位），并返回最短的一次执行时间。

- 流顺序执行

假设你把先前开发的所有方法都放进了一个名为 ParallelStreams 的类，你就可以用这个框架来测试顺序加法器函数对前一千万个自然数求和要用多久：

```java
System.out.println("Sequential sum done in:" + measurePerf(ParallelStreams::sequentialSum, 10_000_000) + " msecs");
```

请注意，我们对这个结果应持保留态度。影响执行时间的因素有很多，比如你的电脑支持多少个内核。

你可以在自己的机器上跑一下这些代码。在一台i5 6200U 的笔记本上运行它，输出是这样的：

```
Sequential sum done in:110 msecs
```

- for 循环

用传统 for 循环的迭代版本执行起来应该会快很多，因为它更为底层，更重要的是不需要对原始类型做任何装箱或拆箱操作。

如果你试着测量它的性能：

```java
System.out.println("Iterative sum done in:" + measurePerf(ParallelStreams::iterativeSum, 10_000_000) + " msecs");
```

将得到：

```
Iterative sum done in:4 msecs
```

- 流并行执行

现在我们来对函数的并行版本做测试：

```java
System.out.println("Parallel sum done in: " + measurePerf(ParallelStreams::parallelSum, 10_000_000) + " msecs");
```

看看会出现什么情况：

```
Parallel sum done in: 525 msecs
```

### 流并行没有想象中那么好

这相当令人失望，求和方法的并行版本比顺序版本要慢很多。

你如何解释这个意外的结果呢？

这里实际上有两个问题：

1. iterate 生成的是装箱的对象，必须拆箱成数字才能求和

2. 我们很难把 iterate 分成多个独立块来并行执行。

第二个问题更有意思一点，因为你必须意识到某些流操作比其他操作更容易并行化。

具体来说，iterate 很难分割成能够独立执行的小块，因为每次应用这个函数都要依赖前一次应用的结果。

这意味着，在这个特定情况下，归纳进程不是像上图那样进行的；整张数字列表在归纳过程开始时没有准备好，因而无法有效地把流划分为小块来并行处理。把流标记成并行，你其实是给顺序处理增加了开销，它还要把每次求和操作分到一个不同的线程上。

这就说明了并行编程可能很复杂，有时候甚至有点违反直觉。

如果用得不对（比如采用了一个不易并行化的操作，如 iterate ），它甚至可能让程序的整体性能更差，所以在调用那个看似神奇的 parallel 操作时，了解背后到底发生了什么是很有必要的。

### 使用更有针对性的方法

那到底要怎么利用多核处理器，用流来高效地并行求和呢？

我们在第5章中讨论了一个叫 LongStream.rangeClosed 的方法。

这个方法与 iterate 相比有两个优点。

1. LongStream.rangeClosed 直接产生原始类型的 long 数字，没有装箱拆箱的开销。

2. LongStream.rangeClosed 会生成数字范围，很容易拆分为独立的小块。

例如，范围1~20可分为1~5、6~10、11~15和16~20。

- 顺序流

让我们先看一下它用于顺序流时的性能如何，看看拆箱的开销到底要不要紧：

```java
public static long rangedSum(long n) {
    return LongStream.rangeClosed(1, n)
            .reduce(0L, Long::sum);
}
```

这一次的输出是：

```
Ranged sum done in: 5 msecs
```

这个数值流比前面那个用 iterate 工厂方法生成数字的顺序执行版本要快得多，因为数值流避免了非针对性流那些没必要的自动装箱和拆箱操作。

由此可见，选择适当的数据结构往往比并行化算法更重要。

- 并行流

但要是对这个新版本应用并行流呢？

```java
public static long parallelRangedSum(long n) {
    return LongStream.rangeClosed(1, n)
            .parallel()
            .reduce(0L, Long::sum);
}
```

现在把这个函数传给的测试方法：

```java
System.out.println("Parallel range sum done in:" + measurePerf(ParallelStreams::parallelRangedSum, 10_000_000) + " msecs");
```

你会得到：

```
Parallel range sum done in:2 msecs
```

ps: 百倍的性能提升。

amazing！终于，我们得到了一个比顺序执行更快的并行归纳，因为这一次归纳操作可以像并行流执行图那样执行了。这也表明，使用正确的数据结构然后使其并行工作能够保证最佳的性能。

尽管如此，请记住，并行化并不是没有代价的。

并行化过程本身需要对流做递归划分，把每个子流的归纳操作分配到不同的线程，然后把这些操作的结果合并成一个值。但在多个内核之间移动数据的代价也可能比你想的要大，所以很重要的一点是要保证在内核中并行执行工作的时间比在内核之间传输数据的时间长。

总而言之，很多情况下不可能或不方便并行化。然而，在使用并行 Stream 加速代码之前，你必须确保用得对；如果结果错了，算得快就毫无意义了。

让我们来看一个常见的陷阱。

## 正确使用并行流

错用并行流而产生错误的首要原因，就是使用的算法改变了某些共享状态。

下面是另一种实现对前n个自然数求和的方法，但这会改变一个共享累加器：

```java
public static long sideEffectSum(long n) {
    Accumulator accumulator = new Accumulator();
    LongStream.rangeClosed(1, n)
            .forEach(accumulator::add);
    return accumulator.total;
}

public static class Accumulator {
    private long total = 0;

    public void add(long value) {
        total += value;
    }
}
```

这种代码非常普遍，特别是对那些熟悉指令式编程范式的程序员来说。这段代码和你习惯的那种指令式迭代数字列表的方式很像：初始化一个累加器，一个个遍历列表中的元素，把它们和累加器相加。

那这种代码又有什么问题呢？不幸的是，它真的无可救药，因为它在本质上就是顺序的。

每次访问 total 都会出现数据竞争。如果你尝试用同步来修复，那就完全失去并行的意义了。

为了说明这一点，让我们试着把 Stream 变成并行的：

```java
public static long sideEffectParallelSum(long n) {
    Accumulator accumulator = new Accumulator();
    LongStream.rangeClosed(1, n)
            .parallel()
            .forEach(accumulator::add);
    return accumulator.total;
}
```

执行测试方法，并打印每次执行的结果：

```java
System.out.println("SideEffect parallel sum done in: " + measurePerf(ParallelStreams::sideEffectParallelSum, 10_000_000L) + " msecs");
```

你可能会得到类似于下面这种输出：

```
Result: 9869563545574
Result: 12405006536090
Result: 8268141260766
Result: 11208597038187
Result: 12358062322272
Result: 19218969315182
Result: 11255083226412
Result: 25746147125980
Result: 13327069088874
SideEffect parallel sum done in: 4 msecs
```

这回方法的性能无关紧要了，唯一要紧的是每次执行都会返回不同的结果，都离正确值50000005000000 差很远。

这是由于多个线程在同时访问累加器，执行 `total += value`，而这一句虽然看似简单，却不是一个原子操作。

问题的根源在于， forEach 中调用的方法有副作用，它会改变多个线程共享的对象的可变状态。

要是你想用并行 Stream 又不想引发类似的意外，就必须避免这种情况。

现在你知道了，共享可变状态会影响并行流以及并行计算。

现在，**记住要避免共享可变状态，确保并行 Stream 得到正确的结果。**

接下来，我们会看到一些实用建议，你可以由此判断什么时候可以利用并行流来提升性能。

## 高效使用并行流

一般而言，想给出任何关于什么时候该用并行流的定量建议都是不可能也毫无意义的，因为任何类似于“仅当至少有一千个（或一百万个或随便什么数字）元素的时候才用并行流）”的建议对于某台特定机器上的某个特定操作可能是对的，但在略有差异的另一种情况下可能就是大错特错。尽管如此，我们至少可以提出一些定性意见，帮你决定某个特定情况下是否有必要使用并行流。

- 测试验证性能

如果有疑问，测量。把顺序流转成并行流轻而易举，但却不一定是好事。我们在本节中已经指出，并行流并不总是比顺序流快。此外，并行流有时候会和你的直觉不一致，所以在考虑选择顺序流还是并行流时，第一个也是最重要的建议就是用适当的基准来检查其性能。

- 留意装箱

留意装箱。自动装箱和拆箱操作会大大降低性能。

Java 8中有原始类型流（ IntStream 、LongStream 、 DoubleStream ）来避免这种操作，但凡有可能都应该用这些流。

- 特殊的操作本身

有些操作本身在并行流上的性能就比顺序流差。

特别是 limit 和 findFirst 等依赖于元素顺序的操作，它们在并行流上执行的代价非常大。

例如， findAny 会比 findFirst 性能好，因为它不一定要按顺序来执行。你总是可以调用 unordered 方法来把有序流变成无序流。那么，如果你需要流中的n个元素而不是专门要前n个的话，对无序并行流调用limit 可能会比单个有序流（比如数据源是一个 List ）更高效。

- 总计算成本

还要考虑流的操作流水线的总计算成本。设N是要处理的元素的总数，Q是一个元素通过流水线的大致处理成本，则N*Q就是这个对成本的一个粗略的定性估计。Q值较高就意味着使用并行流时性能好的可能性比较大。

- 较小的数据

对于较小的数据量，选择并行流几乎从来都不是一个好的决定。

并行处理少数几个元素的好处还抵不上并行化造成的额外开销。
要考虑流背后的数据结构是否易于分解。

例如， ArrayList 的拆分效率比 LinkedList高得多，因为前者用不着遍历就可以平均拆分，而后者则必须遍历。

另外，用 range 工厂方法创建的原始类型流也可以快速分解。

- 对于流的操作

流自身的特点，以及流水线中的中间操作修改流的方式，都可能会改变分解过程的性能。例如，一个 SIZED 流可以分成大小相等的两部分，这样每个部分都可以比较高效地并行处理，但筛选操作可能丢弃的元素个数却无法预测，导致流本身的大小未知。

- 合并的代价

还要考虑终端操作中合并步骤的代价是大是小（例如 Collector 中的 combiner 方法）。如果这一步代价很大，那么组合每个子流产生的部分结果所付出的代价就可能会超出通过并行流得到的性能提升。

## 背后的实现原理

最后，我们还要强调并行流背后使用的基础架构是Java 7中引入的分支/合并框架。

并行汇总的示例证明了要想正确使用并行流，了解它的内部原理至关重要，所以我们会在下一节仔细研究分支/合并框架。

# 拓展阅读

[Fork/Join 框架](https://houbb.github.io/2019/01/18/jcip-39-fork-join)

# 参考资料

《java8 实战》

[【Java8实战】开始使用流](https://mrbird.cc/blog/java8stream1.html)

[JDK8 实战系列](https://juejin.im/user/5ad35e786fb9a028cd458b59/posts)

* any list
{:toc}