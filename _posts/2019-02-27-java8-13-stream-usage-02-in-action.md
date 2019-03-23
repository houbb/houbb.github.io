---
layout: post
title: Java8-13-Stream 使用实战
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, jdk8, functional, sh]
published: true
---

# 付诸实战

在本节中，我们会将迄今学到的关于流的知识付诸实践。我们来看一个不同的领域：执行交易的交易员。

你的经理让你为八个查询找到答案。

1. 找出2011年发生的所有交易，并按交易额排序（从低到高）。

2. 交易员都在哪些不同的城市工作过？

3. 查找所有来自于剑桥的交易员，并按姓名排序。

4. 返回所有交易员的姓名字符串，按字母顺序排序。

5. 有没有交易员是在米兰工作的？

6. 打印生活在剑桥的交易员的所有交易额。

7. 所有交易中，最高的交易额是多少？

8. 找到交易额最小的交易。

ps: 多像数据库查询。换言之，个人以后如果想实现 database，就可以使用 stream 来实现大部分的这种需求。


# 领域：交易员和交易

（可以理解对应数据库中的表，设计中的实体）

以下是我们要处理的领域，一个 Traders 和 Transactions 的列表：

```java
Trader raoul = new Trader("Raoul", "Cambridge");
Trader mario = new Trader("Mario", "Milan");
Trader alan = new Trader("Alan", "Cambridge");
Trader brian = new Trader("Brian", "Cambridge");

List<Transaction> transactions = Arrays.asList(
        new Transaction(brian, 2011, 300),
        new Transaction(raoul, 2012, 1000),
        new Transaction(raoul, 2011, 400),
        new Transaction(mario, 2012, 710),
        new Transaction(mario, 2012, 700),
        new Transaction(alan, 2012, 950)
);
```

Trader和Transaction类的定义：

- Trader

```java
public class Trader {
    private String name;
    private String city;

    public Trader(String n, String c){
        this.name = n;
        this.city = c;
    }

    //Getter & Setter & ToString
}
```

- Transaction

```java
public class Transaction {
    private Trader trader;
    private Integer year;
    private Integer value;

    public Transaction(Trader trader, Integer year, Integer value) {
        this.trader = trader;
        this.year = year;
        this.value = value;
    }
}
```

# 1. 找出2011年发生的所有交易，并按交易额排序（从低到高）。

```java
List<Transaction> tr2011 = transactions.stream()
                // 筛选出2011年发生的所有交易
                .filter(transaction -> transaction.getYear() == 2011)
                // 按照交易额从低到高排序
                .sorted(Comparator.comparing(Transaction::getValue))
                // 转为集合
                .collect(Collectors.toList());
```

太棒了，第一个问题我们很轻松的就解决了！

首先，将transactions集合转为流，然后给filter传递一个谓词来选择2011年的交易，接着按照交易额从低到高进行排序，最后将Stream中的所有元素收集到一个List集合中。

# 2. 交易员都在哪些不同的城市工作过？

```java
List<String> cities = transactions.stream()
                // 提取出交易员所工作的城市
                .map(transaction -> transaction.getTrader().getCity())
                // 去除已有的城市
                .distinct()
                // 将Stream中所有的元素转为一个List集合
                .collect(Collectors.toList());
```

是的，我们很简单的完成了第二个问题。

首先，将transactions集合转为流，然后使用map提取出与交易员相关的每位交易员所在的城市，接着使用distinct去除重复的城市（当然，我们也可以去掉distinct，在最后我们就要使用collect，将Stream中的元素转为一个Set集合。

collect(Collectors.toSet())），我们只需要不同的城市，最后将Stream中的所有元素收集到一个List中。

# 3. 查找所有来自于剑桥的交易员，并按姓名排序。

```java
List<Trader> traders = transactions.stream()
                // 从交易中提取所有的交易员
                .map(Transaction::getTrader)
                // 进选择位于剑桥的交易员
                .filter(trader -> "Cambridge".equals(trader.getCity()))
                // 确保没有重复
                .distinct()
                // 对生成的交易员流按照姓名进行排序
                .sorted(Comparator.comparing(Trader::getName))
                .collect(Collectors.toList());
```

从交易中提取所有的交易员，然后进选择位于剑桥的交易员确保没有重复，接着对生成的交易员流按照姓名进行排序。

# 4. 返回所有交易员的姓名字符串，按字母顺序排序。

```java
String traderStr = transactions.stream()
                        // 提取所有交易员姓名，生成一个 Strings 构成的 Stream
                        .map(transaction -> transaction.getTrader().getName())
                        // 只选择不相同的姓名
                        .distinct()
                        // 对姓名按字母顺序排序
                        .sorted()
                        // 逐个拼接每个名字，得到一个将所有名字连接起来的 String
                        .reduce("", (n1, n2) -> n1 + " " + n2);
```

这些问题，我们都很轻松的就完成！首先，提取所有交易员姓名，生成一个 Strings 构成的 Stream并且只选择不相同的姓名，然后对姓名按字母顺序排序，最后使用reduce将名字拼接起来！

请注意，此解决方案效率不高（所有字符串都被反复连接，每次迭代的时候都要建立一个新的 String 对象）。

## 性能提升方案

下一章中，你将看到一个更为高效的解决方案，它像下面这样使用 joining （其内部会用到 StringBuilder ）：

```java
String traderStr = transactions.stream()
                            .map(transaction -> transaction.getTrader().getName())
                            .distinct()
                            .sorted()
                            .collect(joining());
```


# 5. 有没有交易员是在米兰工作的？

```java
boolean milanBased = transactions.stream()
                        // 把一个谓词传递给 anyMatch ，检查是否有交易员在米兰工作
                        .anyMatch(transaction -> "Milan".equals(transaction.getTrader() .getCity()));
```

依旧很简单把一个谓词传递给 anyMatch ，检查是否有交易员在米兰工作。

# 6. 打印生活在剑桥的交易员的所有交易额。

```java
transactions.stream()
                // 选择住在剑桥的交易员所进行的交易
                .filter(t -> "Cambridge".equals(t.getTrader().getCity()))
                // 提取这些交易的交易额
                .map(Transaction::getValue)
                // 打印每个值
                .forEach(System.out::println);
```

首先选择住在剑桥的交易员所进行的交易，接着提取这些交易的交易额，然后就打印出每个值。

# 所有交易中，最高的交易额是多少？

```java
Optional<Integer> highestValue = transactions.stream()
                        // 提取每项交易的交易额
                        .map(Transaction::getValue)
                        // 计算生成的流中的最大值
                        .reduce(Integer::max);
```

首先提取每项交易的交易额，然后使用reduce计算生成的流中的最大值。

# 8. 找到交易额最小的交易。

```java
Optional<Transaction> smallestTransaction = transactions.stream()
                        // 通过反复比较每个交易的交易额，找出最小的交易
                        .reduce((t1, t2) -> t1.getValue() < t2.getValue() ? t1 : t2);
```

是的，第八个问题很简单，但是还有更好的做法！

流支持 min 和 max 方法，它们可以接受一个 Comparator 作为参数，指定计算最小或最大值时要比较哪个键值：

```java
Optional<Transaction> smallestTransaction = transactions.stream()
                                         .min(comparing(Transaction::getValue));
```

# 个人感受

1. 使用 stream 编码变得非常优雅

2. 题目的设计难度是平级的，就是没有难度上升，解决问题的人会感觉兴致平平。可能使用递进式的难度体验会更好。

3. 其中提到了两个技巧，一个关于性能(4)，一个关于编码的优雅性(8)。对于编码就应该有精益求精的精神。这样才能有所进步。

# 参考资料

《java8 实战》

[【Java8实战】开始使用流](https://mrbird.cc/blog/java8stream1.html)

[JDK8 实战系列](https://juejin.im/user/5ad35e786fb9a028cd458b59/posts)

* any list
{:toc}