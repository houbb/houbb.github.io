---
layout: post
title: Java8-18-Stream Spliterator
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, jdk8, functional, sh]
published: true
---

# Spliterator

## 简介

Spliterator 是Java 8中加入的另一个新接口；这个名字代表“可分迭代器”（splitableiterator）。

和 Iterator 一样，Spliterator 也用于遍历数据源中的元素，但它是为了并行执行而设计的。

虽然在实践中可能用不着自己开发 Spliterator ，但了解一下它的实现方式会让你对并行流的工作原理有更深入的了解。

Java 8已经为集合框架中包含的所有数据结构提供了一个默认的 Spliterator 实现。

## 接口

集合实现了 Spliterator 接口，接口提供了一个 spliterator 方法。

这个接口定义了若干方法，如下面的代码清单所示。

```java
public interface Spliterator<T> {
    boolean tryAdvance(Consumer<? super T> action);
    Spliterator<T> trySplit();
    long estimateSize();
    int characteristics();
}
```

与往常一样， T 是 Spliterator 遍历的元素的类型。 

tryAdvance 方法的行为类似于普通的 Iterator ，因为它会按顺序一个一个使用 Spliterator 中的元素，并且如果还有其他元素要遍历就返回 true 。

但 trySplit 是专为 Spliterator 接口设计的，因为它可以把一些元素划出去分给第二个 Spliterator （由该方法返回），让它们两个并行处理。 

Spliterator 还可通过 estimateSize 方法估计还剩下多少元素要遍历，因为即使不那么确切，能快速算出来是一个值也有助于让拆分均匀一点。

重要的是，要了解这个拆分过程在内部是如何执行的，以便在需要时能够掌控它。

因此，我们会在下一节中详细地分析它。

## 拆分过程

将 Stream 拆分成多个部分的算法是一个递归过程。

第一步是对第一个Spliterator 调用 trySplit ，生成第二个 Spliterator 。

第二步对这两个 Spliterator 调用trysplit ，这样总共就有了四个 Spliterator 。

这个框架不断对 Spliterator 调用 trySplit 直到它返回 null ，表明它处理的数据结构不能再分割，如第三步所示。

最后，这个递归拆分过程到第四步就终止了，这时所有的 Spliterator 在调用 trySplit 时都返回了 null 。

![拆分过程](https://user-gold-cdn.xitu.io/2018/10/7/1664ce9fa5829965?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

这个拆分过程也受 Spliterator 本身的特性影响，而特性是通过 characteristics 方法声明的。

# 实现你自己的 Spliterator

让我们来看一个可能需要你自己实现 Spliterator 的实际例子。

我们要开发一个简单的方法来数数一个 String 中的单词数。

## 迭代版本

这个方法的一个迭代版本可以写成下面的样子。

```java
public static int countWordsIteratively(String s) {
    int counter = 0;
    boolean lastSpace = true;
    for (char c : s.toCharArray()) {
        if (Character.isWhitespace(c)) {
            lastSpace = true;
        } else {
            if (lastSpace) {
                counter++;
            }
            lastSpace = Character.isWhitespace(c);
        }
    }
    return counter;
}
```

让我们把这个方法用在但丁的《神曲》的《地狱篇》的第一句话上：

```java
public static final String SENTENCE =
            " Nel   mezzo del cammin  di nostra  vita " +
                    "mi  ritrovai in una  selva oscura" +
                    " che la  dritta via era   smarrita ";

System.out.println("Found " + countWordsIteratively(SENTENCE) + " words");
```

请注意，我们在句子里添加了一些额外的随机空格，以演示这个迭代实现即使在两个词之间存在多个空格时也能正常工作。

正如我们所料，这段代码将打印以下内容：

```
Found 19 words
```

理想情况下，你会想要用更为函数式的风格来实现它，因为就像我们前面说过的，这样你就可以用并行 Stream 来并行化这个过程，而无需显式地处理线程和同步问题。

## 以函数式风格重写单词计数器

首先你需要把 String 转换成一个流。

不幸的是，原始类型的流仅限于 int 、 long 和 double ，

所以你只能用 Stream ：

```java
Stream<Character> stream = IntStream.range(0, SENTENCE.length()).mapToObj(SENTENCE::charAt);
```

你可以对这个流做归约来计算字数。

在归约流时，你得保留由两个变量组成的状态：一个 int用来计算到目前为止数过的字数，还有一个 boolean 用来记得上一个遇到的 Character 是不是空格。

因为Java没有元组（tuple，用来表示由异类元素组成的有序列表的结构，不需要包装对象），所以你必须创建一个新类 WordCounter 来把这个状态封装起来，如下所示。

```java
private static class WordCounter {
    private final int counter;
    private final boolean lastSpace;

    public WordCounter(int counter, boolean lastSpace) {
        this.counter = counter;
        this.lastSpace = lastSpace;
    }

    public WordCounter accumulate(Character c) {
        if (Character.isWhitespace(c)) {
            return lastSpace ?
                    this :
                    new WordCounter(counter, true);
        } else {
            return lastSpace ?
                    new WordCounter(counter + 1, false) :
                    this;
        }
    }

    public WordCounter combine(WordCounter wordCounter) {
        return new WordCounter(counter + wordCounter.counter,
                wordCounter.lastSpace);
    }

    public int getCounter() {
        return counter;
    }
}
```

在这个列表中， accumulate 方法定义了如何更改 WordCounter 的状态，或更确切地说是用哪个状态来建立新的 WordCounter ，因为这个类是不可变的。

> [不可变类是线程安全的](https://houbb.github.io/2018/10/08/pattern-immutable)

每次遍历到 Stream 中的一个新的Character 时，就会调用 accumulate 方法。

具体来说，就像 countWordsIteratively 方法一样，当上一个字符是空格，新字符不是空格时，计数器就加一。

调用第二个方法 combine 时，会对作用于 Character 流的两个不同子部分的两个 WordCounter 的部分结果进行汇总，也就是把两个 WordCounter 内部的计数器加起来。

```java
private static int countWords(Stream<Character> stream) {
    WordCounter wordCounter = stream.reduce(new WordCounter(0, true),
            WordCounter::accumulate,
            WordCounter::combine);
    return wordCounter.getCounter();
}
```

现在你就可以试一试这个方法，给它由包含但丁的《神曲》中《地狱篇》第一句的 String创建的流：

```java
Stream<Character> stream = IntStream.range(0, SENTENCE.length())
                .mapToObj(SENTENCE::charAt);
System.out.println("Found " + countWords(stream) + " words");
```

你可以和迭代版本比较一下输出：

```
Found 19 words
```

到现在为止都很好，但我们以函数式实现 WordCounter 的主要原因之一就是能轻松地并行处理，让我们来看看具体是如何实现的。

## 让 WordCounter 并行工作

你可以尝试用并行流来加快字数统计，如下所示：

```java
System.out.println("Found " + countWords(stream.parallel()) + " words");
```

不幸的是，这次的输出是：

```
Found 25 words
```

### 问题在哪里

显然有什么不对，可到底是哪里不对呢？

问题的根源并不难找。因为原始的 String 在任意位置拆分，所以有时一个词会被分为两个词，然后数了两次。

这就说明，拆分流会影响结果，而把顺序流换成并行流就可能使结果出错。

### 如何解决

如何解决这个问题呢？

解决方案就是要确保 String 不是在随机位置拆开的，而只能在词尾拆开。

要做到这一点，你必须为 Character 实现一个 Spliterator ，它只能在两个词之间拆开String （如下所示），然后由此创建并行流。

```java
private static class WordCounterSpliterator implements Spliterator<Character> {
    private final String string;
    private int currentChar = 0;

    public WordCounterSpliterator(String string) {
        this.string = string;
    }

    @Override
    public boolean tryAdvance(Consumer<? super Character> action) {
        action.accept(string.charAt(currentChar++));
        return currentChar < string.length();
    }

    @Override
    public Spliterator<Character> trySplit() {
        int currentSize = string.length() - currentChar;
        if (currentSize < 10) {
            return null;
        }
        for (int splitPos = currentSize / 2 + currentChar;
                splitPos < string.length(); splitPos++) {
            if (Character.isWhitespace(string.charAt(splitPos))) {
                Spliterator<Character> spliterator =
                        new WordCounterSpliterator(string.substring(currentChar,
                                splitPos));
                currentChar = splitPos;
                return spliterator;
            }
        }
        return null;
    }

    @Override
    public long estimateSize() {
        return string.length() - currentChar;
    }

    @Override
    public int characteristics() {
        return ORDERED + SIZED + SUBSIZED + NONNULL + IMMUTABLE;
    }
}
```

这个 Spliterator 由要解析的 String 创建，并遍历了其中的 Character ，同时保存了当前正在遍历的字符位置。

### 自定义函数解析

让我们快速回顾一下实现了Spliterator接口的WordCounterSpliterator 中的各个函数。

tryAdvance 方法把 String 中当前位置的 Character 传给了 Consumer ，并让位置加一。作为参数传递的 Consumer 是一个Java内部类，在遍历流时将要处理的 Character 传给了一系列要对其执行的函数。这里只有一个归约函数，即 WordCounter 类的 accumulate方法。如果新的指针位置小于 String 的总长，且还有要遍历的 Character ，则tryAdvance 返回 true 。

trySplit 方法是 Spliterator 中最重要的一个方法，因为它定义了拆分要遍历的数据结构的逻辑。就像 RecursiveTask 的 compute 方法一样（分支/合并框架的使用方式），首先要设定不再进一步拆分的下限。这里用了一个非常低的下限——10个 Character ，仅仅是为了保证程序会对那个比较短的 String 做几次拆分。

在实际应用中，就像分支/合并的例子那样，你肯定要用更高的下限来避免生成太多的任务。如果剩余的 Character 数量低于下限，你就返回 null 表示无需进一步拆分。相反，如果你需要执行拆分，就把试探的拆分位置设在要解析的 String 块的中间。但我们没有直接使用这个拆分位置，因为要避免把词在中间断开，于是就往前找，直到找到一个空格。一旦找到了适当的拆分位置，就可以创建一个新的 Spliterator 来遍历从当前位置到拆分位置的子串；把当前位置 this 设为拆分位置，因为之前的部分将由新Spliterator 来处理，最后返回。

还需要遍历的元素的 estimatedSize 就是这个 Spliterator 解析的 String 的总长度和当前遍历的位置的差。

最后， characteristic 方法告诉框架这个 Spliterator 是 ORDERED （顺序就是 String中各个 Character 的次序）、 SIZED （ estimatedSize 方法的返回值是精确的）、SUBSIZED （ trySplit 方法创建的其他 Spliterator 也有确切大小）、 NONNULL （ String中 不 能 有 为 null 的 Character ） 和 IMMUTABLE （ 在 解 析 String 时 不 能 再 添 加Character ，因为 String 本身是一个不可变类）的。

### 运用 WordCounterSpliterator

现在就可以用这个新的 WordCounterSpliterator 来处理并行流了，如下所示：

```java
Spliterator<Character> spliterator = new WordCounterSpliterator(SENTENCE);
Stream<Character> stream = StreamSupport.stream(spliterator, true);
```

传给 StreamSupport.stream 工厂方法的第二个布尔参数意味着你想创建一个并行流。

把这个并行流传给 countWords 方法：

```java
System.out.println("Found " + countWords(stream.parallel()) + " words");
```

可以得到意料之中的正确输出:

```
Found 19 words
```

## 延迟绑定

你已经看到了 Spliterator 如何让你控制拆分数据结构的策略。 

Spliterator 还有最后一个值得注意的功能，就是可以在第一次遍历、第一次拆分或第一次查询估计大小时绑定元素的数据源，而不是在创建时就绑定。

这种情况下，它称为延迟绑定（late-binding）的 Spliterator 。

# 个人总结

- 分治思想。技术可能可落伍，但是思想永存。

# 参考资料

《java8 实战》

[【Java8实战】开始使用流](https://mrbird.cc/blog/java8stream1.html)

[JDK8 实战系列](https://juejin.im/user/5ad35e786fb9a028cd458b59/posts)

* any list
{:toc}