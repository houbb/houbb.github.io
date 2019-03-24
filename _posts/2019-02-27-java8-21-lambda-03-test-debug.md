---
layout: post
title: Java8-21-lambda 测试调试
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, jdk8, functional, sh]
published: true
---

# 测试和调试

现在你的代码中已经充溢着Lambda表达式，看起来不错，也很简洁。

但是，大多数时候，我们受雇进行的程序开发工作的要求并不是编写优美的代码，而是编写正确的代码。

通常而言，好的软件工程实践一定少不了单元测试，借此保证程序的行为与预期一致。

## 测试用例

你编写测试用例，通过这些测试用例确保你代码中的每个组成部分都实现预期的结果。

比如，图形应用的一个简单的 Point 类，可以定义如下：

```java
public class Point {
    private final int x;
    private final int y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public Point moveRightBy(int x) {
        return new Point(this.x + x, this.y);
    }
}
```

下面的单元测试会检查 moveRightBy 方法的行为是否与预期一致：

```java
public class PointTest {

    @Test
    public void testMoveRightBy() {
        Point p1 = new Point(5, 5);
        Point p2 = p1.moveRightBy(10);

        Assert.assertEquals(15, p2.getX());
        Assert.assertEquals(5, p2.getY());
    }
}
```

## 测试可见 Lambda 函数的行为

由于 moveRightBy 方法声明为public，测试工作变得相对容易。你可以在用例内部完成测试。

但是Lambda并无函数名（毕竟它们都是匿名函数），因此要对你代码中的Lambda函数进行测试实际上比较困难，因为你无法通过函数名的方式调用它们。

有些时候，你可以借助某个字段访问Lambda函数，这种情况，你可以利用这些字段，通过它们对封装在Lambda函数内的逻辑进行测试。

比如，我们假设你在 Point 类中添加了静态字段compareByXAndThenY()，通过该字段，使用方法引用你可以访问 Comparator 对象：

```java
public class Point {
    public final static Comparator<Point> COMPARE_BY_X_AND_THEN_Y =
            comparing(Point::getX).thenComparing(Point::getY);
    ...
}
```

还记得吗，Lambda表达式会生成函数接口的一个实例。

由此，你可以测试该实例的行为。

这个例子中，我们可以使用不同的参数，对 Comparator 对象类型实例 compareByXAndThenY的 compare 方法进行调用，验证它们的行为是否符合预期：

```java
@Test
public void testComparingTwoPoints() {
    Point p1 = new Point(10, 15);
    Point p2 = new Point(10, 20);
    int result = Point.COMPARE_BY_X_AND_THEN_Y.compare(p1 , p2);
    Assert.assertEquals(-1, result);
}
```

ps: 实际使用 lambda 表达式时，不会将其定义为这种变量。因此，这只是一种测试的方式。个人建议是直接测试完整的方法是否符合预期即可。

## 测试使用 Lambda 的方法的行为

但是Lambda的初衷是将一部分逻辑封装起来给另一个方法使用。

从这个角度出发，你不应该将Lambda表达式声明为public，它们仅是具体的实现细节。

相反，我们需要对使用Lambda表达式的方法进行测试。

比如下面这个方法 moveAllPointsRightBy ：

```java
public static List<Point> moveAllPointsRightBy(List<Point> points, int x) {
    return points.stream()
            .map(p -> new Point(p.getX() + x, p.getY()))
            .collect(toList());
}
```

我们没必要对Lambda表达式 `p -> new Point(p.getX() + x,p.getY())` 进行测试，它只是 moveAllPointsRightBy 内部的实现细节。

我们更应该关注的是方法 moveAllPointsRightBy 的行为：

```java
@Test
public void testMoveAllPointsRightBy() {
    List<Point> points =
            Arrays.asList(new Point(5, 5), new Point(10, 5));
    List<Point> expectedPoints =
            Arrays.asList(new Point(15, 5), new Point(20, 5));
    List<Point> newPoints = Point.moveAllPointsRightBy(points, 10);
    Assert.assertEquals(expectedPoints, newPoints);
}
```

注意，上面的单元测试中， Point 类恰当地实现 equals 方法非常重要，否则该测试的结果就取决于 Object 类的默认实现。

# 调试

调试有问题的代码时，程序员的兵器库里有两大老式武器，分别是：

- 查看栈跟踪

- 输出日志

## 查看栈跟踪

你的程序突然停止运行（比如突然抛出一个异常），这时你首先要调查程序在什么地方发生了异常以及为什么会发生该异常。这时栈帧就非常有用。

程序的每次方法调用都会产生相应的调用信息，包括程序中方法调用的位置、该方法调用使用的参数、被调用方法的本地变量。这些信息被保存在栈帧上。

程序失败时，你会得到它的栈跟踪，通过一个又一个栈帧，你可以了解程序失败时的概略信息。换句话说，通过这些你能得到程序失败时的方法调用列表。这些方法调用列表最终会帮助你发现问题出现的原因。

### Lambda表达式和栈跟踪

不幸的是，由于Lambda表达式没有名字，它的栈跟踪可能很难分析。在下面这段简单的代码中，我们刻意地引入了一些错误：

```java
public class Debugging {
    public static void main(String[] args) {
        List<Point> points = Arrays.asList(new Point(12, 2), null);
        points.stream().map(p -> p.getX()).forEach(System.out::println);
    }
}
```

运行这段代码会产生下面的栈跟踪：

```
12
Exception in thread "main" java.lang.NullPointerException
    // 这行中的 $0 是什么意思？
	at xin.codedream.java8.chap8.Debugging.lambda$main$0(Debugging.java:15)
	at java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:193)
	at java.util.Spliterators$ArraySpliterator.forEachRemaining(Spliterators.java:948)
	...
```

这个程序出现了NPE（空指针异常）异常，因为 Points 列表的第二个元素是空（ null ）。

这时你的程序实际是在试图处理一个空引用。由于Stream流水线发生了错误，构成Stream流水线的整个方法调用序列都暴露在你面前了。

### lambda 表达式没有名称的问题

不过，你留意到了吗？栈跟踪中还包含下面这样类似加密的内容：

```
at xin.codedream.java8.chap8.Debugging.lambda$main$0(Debugging.java:15)
	at java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:193)
```

这些表示错误发生在Lambda表达式内部。由于Lambda表达式没有名字，所以编译器只能为它们指定一个名字。这个例子中，它的名字是 lambda$main$0 ，看起来非常不直观。如果你使用了大量的类，其中又包含多个Lambda表达式，这就成了一个非常头痛的问题。

### lambda 方法引用没有名称的问题

即使你使用了方法引用，还是有可能出现栈无法显示你使用的方法名的情况。将之前的Lambda表达式 p-> p.getX() 替换为方法引用 reference Point::getX 也会产生难于分析的栈跟踪：

```
at java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:193)
```

### lambda 方法引用可以显示的场景

注意，如果方法引用指向的是同一个类中声明的方法，那么它的名称是可以在栈跟踪中显示的。

比如，下面这个例子：

```java
public class Debugging {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3);
        numbers.stream().map(Debugging::divideByZero).forEach(System
                .out::println);
    }

    public static int divideByZero(int n) {
        return n / 0;
    }
}
```

方法 divideByZero 在栈跟踪中就正确地显示了：

```
Exception in thread "main" java.lang.ArithmeticException: / by zero
    // divideByZero正确地输出到栈跟踪中
	at xin.codedream.java8.chap8.Debugging.divideByZero(Debugging.java:20)
	at java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:193)
	...
```

总的来说，我们需要特别注意，涉及Lambda表达式的栈跟踪可能非常难理解。

这是Java编译器未来版本可以改进的一个方面。

ps: 这会给程序的测试带来一定的成本。需要注意，尽可能的使用方法引用，让堆栈信息打印出方法名称。

不过常见的 idea 可以具体定位到每一行，还算方便排查问题。

## 使用日志调试

假设你试图对流操作中的流水线进行调试，该从何入手呢？

你可以像下面的例子那样，使用forEach 将流操作的结果日志输出到屏幕上或者记录到日志文件中：

```java
List<Integer> numbers = Arrays.asList(2, 3, 4, 5);
numbers.stream()
            .map(x -> x + 17)
            .filter(x -> x % 2 == 0)
            .limit(3)
            .forEach(System.out::println);
```

这段代码的输出如下：

```
20
22
```

不幸的是，一旦调用 forEach ，整个流就会恢复运行。

到底哪种方式能更有效地帮助我们理解Stream流水线中的每个操作（比如 map 、 filter 、 limit ）产生的输出？

### peek

这就是流操作方法 peek 大显身手的时候。 

peek 的设计初衷就是在流的每个元素恢复运行之前，插入执行一个动作。

但是它不像 forEach 那样恢复整个流的运行，而是在一个元素上完操作之后，它只会将操作顺承到流水线中的下一个操作。

下面的这段代码中，我们使用 peek 输出了Stream流水线操作之前和操作之后的中间值：

```java
List<Integer> result = Stream.of(2, 3, 4, 5)
                .peek(x -> System.out.println("taking from stream: " + x)).map(x -> x + 17)
                .peek(x -> System.out.println("after map: " + x)).filter(x -> x % 2 == 0)
                .peek(x -> System.out.println("after filter: " + x)).limit(3)
                .peek(x -> System.out.println("after limit: " + x)).collect(toList());
```

通过 peek 操作我们能清楚地了解流水线操作中每一步的输出结果：

```
taking from stream: 2
after map: 19
taking from stream: 3
after map: 20
after filter: 20
after limit: 20
taking from stream: 4
after map: 21
taking from stream: 5
after map: 22
after filter: 22
after limit: 22
```

# 个人收获

1. 正确比优美更重要。客户可不管你的程序写的优美与否，保证正确是最基本的。

2. 解决一个问题的方式是多样的，知道其发生的原因，可以帮助我们更好的解决问题。

# 拓展阅读

[单元测试最佳实践](https://houbb.github.io/2019/01/23/unit-test-best-practise)

# 参考资料

《java8 实战》

[【Java8实战】开始使用流](https://mrbird.cc/blog/java8stream1.html)

[JDK8 实战系列](https://juejin.im/user/5ad35e786fb9a028cd458b59/posts)

* any list
{:toc}