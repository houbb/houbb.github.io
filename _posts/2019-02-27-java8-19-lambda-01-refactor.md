---
layout: post
title: Java8-19-lambda 重构代码
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, jdk8, functional, sh]
published: true
---

# 重构、测试和调试

通过本书的前七章，我们了解了Lambda和Stream API的强大威力。

你可能主要在新项目的代码中使用这些特性。如果你创建的是全新的Java项目，这是极好的时机，你可以轻装上阵，迅速地将新特性应用到项目中。然而不幸的是，大多数情况下你没有机会从头开始一个全新的项目。很多时候，你不得不面对的是用老版Java接口编写的遗留代码。

这些就是本章要讨论的内容。我们会介绍几种方法，帮助你重构代码，以适配使用Lambda表达式，让你维护的代码具备更好的可读性和灵活性。

除此之外，我们还会讨论目前比较流行的几种面向对象的设计模式，包括策略模式、模板方法模式、观察者模式、责任链模式，以及工厂模式，在结合Lambda表达式之后变得更简洁的情况。

最后，我们会介绍如何测试和调试使用Lambda表达式和Stream API的代码。

# 为改善可读性和灵活性重构代码

从本书的开篇我们就一直在强调，利用Lambda表达式，你可以写出更简洁、更灵活的代码。

用“更简洁”来描述Lambda表达式是因为相较于匿名类，Lambda表达式可以帮助我们用更紧凑的方式描述程序的行为。

第3章中我们也提到，如果你希望将一个既有的方法作为参数传递给另一个方法，那么方法引用无疑是我们推荐的方法，利用这种方式我们能写出非常简洁的代码。

采用Lambda表达式之后，你的代码会变得更加灵活，因为Lambda表达式鼓励大家使用第2章中介绍过的行为参数化的方式。

在这种方式下，应对需求的变化时，你的代码可以依据传入的参数动态选择和执行相应的行为。

这一节，我们会将所有这些综合在一起，通过例子展示如何运用前几章介绍的Lambda表达式、方法引用以及Stream接口等特性重构遗留代码，改善程序的可读性和灵活性。

# 改善代码的可读性

改善代码的可读性到底意味着什么？

我们很难定义什么是好的可读性，因为这可能非常主观。通常的理解是，“别人理解这段代码的难易程度”。改善可读性意味着你要确保你的代码能非常容易地被包括自己在内的所有人理解和维护。为了确保你的代码能被其他人理解，有几个步骤可以尝试，比如确保你的代码附有良好的文档，并严格遵守编程规范。

跟之前的版本相比较，Java 8的新特性也可以帮助提升代码的可读性：

1. 使用Java 8，你可以减少冗长的代码，让代码更易于理解

2. 通过方法引用和Stream API，你的代码会变得更直观

这里我们会介绍三种简单的重构，利用Lambda表达式、方法引用以及Stream改善程序代码的可读性：

1. 重构代码，用Lambda表达式取代匿名类

2. 用方法引用重构Lambda表达式

3. 用Stream API重构命令式的数据处理

# 从匿名类到 Lambda 表达式的转换

你值得尝试的第一种重构，也是简单的方式，是将实现单一抽象方法的匿名类转为Lambda表达式。

为什么呢？

前面几章的介绍应该足以说服你，因为匿名类是极其繁琐且容易出错的。

采用Lambda表达式之后，你的代码会更简洁，可读性更好。

还记得第3章的例子就是一个创建Runnable 对象的匿名类，这段代码及其对应的Lambda表达式实现如下：

```java
Runnable r1 = new Runnable(){
    public void run() {
        System.out.println("Hello");
    }
};
Runnable r2 = () -> System.out.println("Hello");
```

## 转换需要注意的地方

但是某些情况下，将匿名类转换为Lambda表达式可能是一个比较复杂的过程。 

1. 首先，匿名类和Lambda表达式中的 this 和 super 的含义是不同的。在匿名类中， this 代表的是类自身，但是在Lambda中，它代表的是包含类。

2. 其次，匿名类可以屏蔽包含类的变量，而Lambda表达式不能（它们会导致编译错误），譬如下面这段代码：

```java
int a = 10;
Runnable r1 = () -> {
    // 编译错误
    int a = 2;
    System.out.println(a);
};

Runnable r2 = new Runnable(){
    public void run(){
        // 一切正常
        int a = 2;
        System.out.println(a);
    }
};
```

最后，在涉及重载的上下文里，将匿名类转换为Lambda表达式可能导致最终的代码更加晦涩。

实际上，匿名类的类型是在初始化时确定的，而Lambda的类型取决于它的上下文。

通过下面这个例子，我们可以了解问题是如何发生的。

我们假设你用与 Runnable 同样的签名声明了一个函数接口，我们称之为 Task （你希望采用与你的业务模型更贴切的接口名时，就可能做这样的变更）：

```java
interface Task {
    public void execute();
}

public static void doSomething(Runnable r) { r.run(); }
public static void doSomething(Task a) { a.execute(); }
```

现在，你再传递一个匿名类实现的 Task ，不会碰到任何问题：

```java
doSomething(new Task() {
    public void execute() {
        System.out.println("Danger danger!!");
    }
});
```

但是将这种匿名类转换为Lambda表达式时，就导致了一种晦涩的方法调用，因为 Runnable和 Task 都是合法的目标类型：

```java
// 麻烦来了： doSomething(Runnable) 和doSomething(Task)都匹配该类型
doSomething(() -> System.out.println("Danger danger!!"));
```

你可以对 Task 尝试使用显式的类型转换来解决这种模棱两可的情况：

```java
doSomething((Task)() -> System.out.println("Danger danger!!"));
```

但是不要因此而放弃对Lambda的尝试。

# 从 Lambda 表达式到方法引用的转换

Lambda表达式非常适用于需要传递代码片段的场景。

## 尽量使用方法引用

不过，为了改善代码的可读性，也请尽量使用方法引用。因为方法名往往能更直观地表达代码的意图。

比如，第6章中我们曾经展示过下面这段代码，它的功能是按照食物的热量级别对菜肴进行分类：

```java
Map<Dish.CaloricLevel, List<Dish>> dishesByCaloricLevel = menu.stream().collect(
            groupingBy(dish -> {
                if (dish.getCalories() <= 400) {
                    return Dish.CaloricLevel.DIET;
                } else if (dish.getCalories() <= 700) {
                    return Dish.CaloricLevel.NORMAL;
                } else {
                    return Dish.CaloricLevel.FAT;
                }
            }));
```

你可以将Lambda表达式的内容抽取到一个单独的方法中，将其作为参数传递给 groupingBy 方法。

变换之后，代码变得更加简洁，程序的意图也更加清晰了：

```java
Map<CaloricLevel, List<Dish>> dishesByCaloricLevel = menu.stream().collect(groupingBy(Dish::getCaloricLevel));
```

为了实现这个方案，你还需要在 Dish 类中添加 getCaloricLevel 方法：

```java
public class Dish{
    public CaloricLevel getCaloricLevel(){
        if (this.getCalories() <= 400) {
            return CaloricLevel.DIET;
        } else if (this.getCalories() <= 700) {
            return CaloricLevel.NORMAL;
        } else {
            return CaloricLevel.FAT;
        }
    }
}
```

## 使用静态辅助方法

除此之外，我们还应该尽量考虑使用静态辅助方法，比如 comparing 、 maxBy 。

这些方法设计之初就考虑了会结合方法引用一起使用。

通过示例，我们看到相对于第3章中的对应代码，优化过的代码更清晰地表达了它的设计意图：

```java
inventory.sort((Apple a1, Apple a2) -> a1.getWeight().compareTo(a2.getWeight()));
inventory.sort(comparing(Apple::getWeight));
```

## 规约操作与方法引用结合

此外，很多通用的归约操作，比如 sum、 maximum ，都有内建的辅助方法可以和方法引用结合使用。

比如，在我们的示例代码中，使用 Collectors 接口可以轻松得到和或者最大值，与采用Lambada表达式和底层的归约操作比起来，这种方式要直观得多。

与其编写：

```java
int totalCalories = menu.stream().map(Dish::getCalories).reduce(0, (c1, c2) -> c1 + c2);
```

不如尝试使用内置的集合类，它能更清晰地表达问题陈述是什么。

下面的代码中，我们使用了集合类 summingInt （方法的名词很直观地解释了它的功能）：

```java
int totalCalories = menu.stream().collect(summingInt(Dish::getCalories));
```

ps: 好的名字，可以大幅度提升代码的阅读性。

# 从命令式的数据处理切换到 Stream

我们建议你将所有使用迭代器这种数据处理模式处理集合的代码都转换成Stream API的方式。

为什么呢？

Stream API能更清晰地表达数据处理管道的意图。

除此之外，通过短路和延迟载入以及利用第7章介绍的现代计算机的多核架构，我们可以对Stream进行优化。

比如，下面的命令式代码使用了两种模式：筛选和抽取，这两种模式被混在了一起，这样的代码结构迫使程序员必须彻底搞清楚程序的每个细节才能理解代码的功能。

此外，实现需要并行运行的程序所面对的困难也多得多：

```java
List<String> dishNames = new ArrayList<>();
for(Dish dish: menu){
    if(dish.getCalories() > 300){
        dishNames.add(dish.getName());
    }
}
```

替代方案使用Stream API，采用这种方式编写的代码读起来更像是问题陈述，并行化也非常容易：

```java
menu.parallelStream()
    .filter(d -> d.getCalories() > 300)
    .map(Dish::getName)
    .collect(toList());
```

不幸的是，将命令式的代码结构转换为Stream API的形式是个困难的任务，因为你需要考虑控制流语句，比如 break、continue、return ，并选择使用恰当的流操作。

# 增加代码的灵活性

第2章和第3章中，我们曾经介绍过Lambda表达式有利于行为参数化。

你可以使用不同的Lambda表示不同的行为，并将它们作为参数传递给函数去处理执行。这种方式可以帮助我们淡定从容地面对需求的变化。

比如，我们可以用多种方式为 Predicate 创建筛选条件，或者使用Comparator 对多种对象进行比较。

现在，我们来看看哪些模式可以马上应用到你的代码中，让你享受Lambda表达式带来的便利。

## 采用函数接口

首先，你必须意识到，没有函数接口，你就无法使用Lambda表达式。因此，你需要在代码中引入函数接口。

听起来很合理，但是在什么情况下使用它们呢？

这里我们介绍两种通用的模式，你可以依照这两种模式重构代码，利用Lambda表达式带来的灵活性，它们分别是：有条件的延迟执行和环绕执行。

## 有条件的延迟执行

我们经常看到这样的代码，控制语句被混杂在业务逻辑代码之中。典型的情况包括进行安全性检查以及日志输出。

比如，下面的这段代码，它使用了Java语言内置的 Logger 类：

```java
if (logger.isLoggable(Log.FINER)){
    logger.finer("Problem: " + generateDiagnostic());
}
```

这段代码有什么问题吗？其实问题不少。

1. 日志器的状态（它支持哪些日志等级）通过 isLoggable 方法暴露给了客户端代码。

2. 为什么要在每次输出一条日志之前都去查询日志器对象的状态？这只能搞砸你的代码。

更好的方案是使用 log 方法，该方法在输出日志消息之前，会在内部检查日志对象是否已经设置为恰当的日志等级：

```java
logger.log(Level.FINER, "Problem: " + generateDiagnostic());
```

这种方式更好的原因是你不再需要在代码中插入那些条件判断，与此同时日志器的状态也不再被暴露出去。

不过，这段代码依旧存在一个问题。日志消息的输出与否每次都需要判断，即使你已经传递了参数，不开启日志。

这就是Lambda表达式可以施展拳脚的地方。你需要做的仅仅是延迟消息构造，如此一来，日志就只会在某些特定的情况下才开启（以此为例，当日志器的级别设置为 FINER 时）。显然，Java 8的API设计者们已经意识到这个问题，并由此引入了一个对 log 方法的重载版本，这个版本的 log 方法接受一个 Supplier 作为参数。这个替代版本的 log 方法的函数签名如下：

```java
public void log(Level level, Supplier<String> msgSupplier)
```

你可以通过下面的方式对它进行调用：

```java
logger.log(Level.FINER, () -> "Problem: " + generateDiagnostic());
```

如果日志器的级别设置恰当， log 方法会在内部执行作为参数传递进来的Lambda表达式。

这里介绍的 Log 方法的内部实现如下：

```java
public void log(Level level, Supplier<String> msgSupplier) {
    if(logger.isLoggable(level)){
        log(level, msgSupplier.get());
    }
}
```

## 我们学到的东西

从这个故事里我们学到了什么呢？

如果你发现你需要频繁地从客户端代码去查询一个对象的状态（比如前文例子中的日志器的状态），只是为了传递参数、调用该对象的一个方法（比如输出一条日志），那么可以考虑实现一个新的方法，以Lambda或者方法表达式作为参数，新方法在检查完该对象的状态之后才调用原来的方法。

你的代码会因此而变得更易读（结构更清晰），封装性更好（对象的状态也不会暴露给客户端代码了）。

通过这一节，你已经了解了如何通过不同方式来改善代码的可读性和灵活性。

接下来，你会了解Lambada表达式如何避免常规面向对象设计中的僵化的模板代码。

# 参考资料

《java8 实战》

[【Java8实战】开始使用流](https://mrbird.cc/blog/java8stream1.html)

[JDK8 实战系列](https://juejin.im/user/5ad35e786fb9a028cd458b59/posts)

* any list
{:toc}