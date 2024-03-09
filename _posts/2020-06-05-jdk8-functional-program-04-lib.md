---
layout: post
title: java8 函数式编程-04-lib 类库
date:  2020-6-5 17:42:59 +0800
categories: [Java]
tags: [jdk8, functional-programming, lambda, sh]
published: true
---

前 3 章讨论了如何编写 Lambda 表达式，接下来将详细阐述另一个重要方面：如何使用Lambda 表达式。

即使不需要编写像 Stream 这样重度使用函数式编程风格的类库，学会如何使用 Lambda 表达式也是非常重要的。

即使一个最简单的应用，也可能会因为代码即数据的函数式编程风格而受益。

Java 8 中的另一个变化是引入了默认方法和接口的静态方法，它改变了人们认识类库的方式，接口中的方法也可以包含代码体了。

本章还对前 3 章疏漏的知识点进行补充，比如，Lambda 表达式方法重载的工作原理、基本类型的使用方法等。

使用 Lambda 表达式编写程序时，掌握这些知识非常重要。

# 4.1 在代码中使用Lambda表达式

2.5 节介绍了如何赋予 Lambda 表达式函数接口的类型，以及该类型的推导方式。

从调用Lambda 表达式的代码的角度来看，它和调用一个普通接口方法没什么区别。

让我们来看一个日志系统中的具体案例。

在 slf4j 和 log4j 等几种常用的日志系统中，有一些记录日志的方法，当日志级别不低于某个固定级别时就会开始记录日志。

如此一来，在日志框架中设置类似 void debug(String message) 这样的方法，当级别为 debug 时，它们就开始记录日志消息。

问题在于，频繁计算消息是否应该记录日志会对系统性能产生影响。

ps: 感觉这个理由不是很能站住脚，因为只不过是把判断提到了前面。里面的判断，有什么区别呢？

程序员通过显式调用 isDebugEnabled 方法来优化系统性能，如例 4-1 所示。即使直接调用 debug 方法能省去记

例 4-1 使用 isDebugEnabled 方法降低日志性能开销

```java
Logger logger = new Logger();
if (logger.isDebugEnabled()) {
    logger.debug("Look at this: " + expensiveOperation());
}
```

这里我们想做的是传入一个 Lambda 表达式，生成一条用作日志信息的字符串。

只有日志级别在调试或以上级别时，才会执行该 Lambda 表达式。

使用这个方式重写上面的代码，如例 4-2 所示：

- 4-2 使用 Lambda 表达式简化日志代码

```java
Logger logger = new Logger();
logger.debug(() -> "Look at this: " + expensiveOperation());
```

那么在 Logger 类中该方法是如何实现的呢？

从类库的角度看，我们可以使用内置的 Supplier 函数接口，它只有一个 get 方法。

然后通过调用 isDebugEnabled 判断是否需要记录日志，是否需要调用 get 方法，如果需要，就调用 get 方法并将结果传给 debug 方法。
由此产生的代码如例 4-3 所示。

例 4-3 启用 Lambda 表达式实现的日志记录器

```java
public void debug(Supplier<String> message) {
    if (isDebugEnabled()) {
        debug(message.get());
    }
}
```

调用 get() 方法，相当于调用传入的 Lambda 表达式。

这种方式也能和匿名内部类一起工作，如果用户暂时无法升级到 Java 8，这种方式可以实现向后兼容。

值得注意的是，不同的函数接口有不同的方法。

如果使用 Predicate，就应该调用 test 方法，如果使用 Function，就应该调用 apply 方法。

# 4.2 基本类型

以上部分还没有用到基本类型。

在 Java 中，有一些相伴的类型，比如 int 和 Integer——前者是基本类型，后者是装箱类型。

基本类型内建在语言和运行环境中，是基本的程序构建模块；而装箱类型属于普通的 Java 类，只不过是对基本类型的一种封装。

Java 的泛型是基于对泛型参数类型的擦除——换句话说，假设它是 Object 对象的实例——因此只有装箱类型才能作为泛型参数。

这就解释了为什么在 Java 中想要一个包含整型值的列表 `List<int>`，实际上得到的却是一个包含整型对象的列表 `List<Integer>`。

麻烦的是，由于装箱类型是对象，因此在内存中存在额外开销。

比如，整型在内存中占用 4 字节，整型对象却要占用 16 字节。

这一情况在数组上更加严重，整型数组中的每个元素只占用基本类型的内存，而整型对象数组中，每个元素都是内存中的一个指针，指向 Java堆中的某个对象。

在最坏的情况下，同样大小的数组，Integer[] 要比 int[] 多占用 6 倍内存。

将基本类型转换为装箱类型，称为装箱，反之则称为拆箱，两者都需要额外的计算开销。对于需要大量数值运算的算法来说，装箱和拆箱的计算开销，以及装箱类型占用的额外内
存，会明显减缓程序的运行速度。

为了减小这些性能开销，Stream 类的某些方法对基本类型和装箱类型做了区分。

PS: 这里通过是否为基本类型，**提供2套接口，从而提升性能。缺点是接口翻倍**。

图 4-1 所示的高阶函数 mapToLong 和其他类似函数即为该方面的一个尝试。

在 Java 8 中，仅对整型、长整型和双浮点型做了特殊处理，因为它们在数值计算中用得最多，特殊处理后的系统性能提升效果最明显。

对基本类型做特殊处理的方法在命名上有明确的规范。

如果方法返回类型为基本类型，则在基本类型前加 To，如图 4-1 中的 ToLongFunction。

如果参数是基本类型，则不加前缀只需类型名即可，如图 4-2 中的 LongFunction。

如果高阶函数使用基本类型，则在操作后加后缀 To 再加基本类型，如 mapToLong。

这些基本类型都有与之对应的 Stream，以基本类型名为前缀，如 LongStream。

事实上， mapToLong 方法返回的不是一个一般的 Stream，而是一个特殊处理的 Stream。

在这个特殊的 Stream 中，map 方法的实现方式也不同，它接受一个 LongUnaryOperator 函数，将一个长整型值映射成另一个长整型值，如图 4-3 所示。

通过一些高阶函数装箱方法，如mapToObj，也可以从一个基本类型的 Stream 得到一个装箱后的 Stream，如 `Stream<Long>`。

如有可能，应尽可能多地使用对基本类型做过特殊处理的方法，进而改善性能。

这些特殊的 Stream 还提供额外的方法，避免重复实现一些通用的方法，让代码更能体现出数值计算的意图。

例 4-4 展示了如何使用这些方法：

- 例 4-4 使用 summaryStatistics 方法统计曲目长度

```java
public static void printTrackLengthStatistics(Album album) {
    IntSummaryStatistics trackLengthStats
    = album.getTracks()
        .mapToInt(track -> track.getLength())
        .summaryStatistics();
    System.out.printf("Max: %d, Min: %d, Ave: %f, Sum: %d",
        trackLengthStats.getMax(),
        trackLengthStats.getMin(),
        trackLengthStats.getAverage(),
        trackLengthStats.getSum());
}
```

例 4-4 向控制台输出曲目长度的一系列统计信息。

无需手动计算这些信息，这里使用对基本类型进行特殊处理的方法 mapToInt，将每首曲目映射为曲目长度。

因为该方法返回一个 IntStream 对象，它包含一个 summaryStatistics 方法，这个方法能计算出各种各样的统计值，如 IntStream 对象内所有元素中的最小值、最大值、平均值以及数值总和。

这些统计值在所有特殊处理的 Stream，如 DoubleStream、LongStream 中都可以得出。

如无需全部的统计值，也可分别调用 min、max、average 或 sum 方法获得单个的统计值，同样，三种基本类型对应的特殊 Stream 也都包含这些方法。

# 4.3 重载解析

PS: 函数接口，本身也就是普通的接口。感觉和以前的方法重载基本是统一的。

在 Java 中可以重载方法，造成多个方法有相同的方法名，但签名确不一样。

这在推断参数类型时会带来问题，因为系统可能会推断出多种类型。

这时，javac 会挑出最具体的类型。

如例 4-5 中的方法调用在选择例 4-6 中定义的重载方法时，输出 String，而不是 Object。

例 4-5 方法调用

```java
overloadedMethod("abc");
```

例 4-6 两个重载方法可供选择

```java
private void overloadedMethod(Object o) {
    System.out.print("Object");
}

private void overloadedMethod(String s) {
    System.out.print("String");
}
```

BinaryOperator 是一种特殊的 BiFunction 类型，参数的类型和返回值的类型相同。

比如，两个整数相加就是一个 BinaryOperator。

Lambda 表达式的类型就是对应的函数接口类型，因此，将 Lambda 表达式作为参数传递时，情况也依然如此。

操作时可以重载一个方法，分别接受 BinaryOperator 和该接口的一个子类作为参数。

调用这些方法时，Java 推导出的 Lambda 表达式的类型正是最具体的函数接口的类型。

比如，例 4-7 在例 4-8 的两个方法中选择时，输出的是IntegerBinaryOperator。

例 4-7 另外一个重载方法调用

```java
overloadedMethod((x, y) -> x + y);
```

例 4-8 两个重载方法可供选择

```java
private interface IntegerBiFunction extends BinaryOperator<Integer> {
}
private void overloadedMethod(BinaryOperator<Integer> Lambda) {
    System.out.print("BinaryOperator");
}
private void overloadedMethod(IntegerBiFunction Lambda) {
    System.out.print("IntegerBinaryOperator");
}
```

当然，同时存在多个重载方法时，哪个是“最具体的类型”可能并不明确。如例 4-9 所示。

例 4-9 重载方法导致的编译错误

```java
overloadedMethod((x) -> true);
private interface IntPredicate {
    public boolean test(int value);
}

private void overloadedMethod(Predicate<Integer> predicate) {
    System.out.print("Predicate");
}
private void overloadedMethod(IntPredicate predicate) {
    System.out.print("IntPredicate");
}
```

传入 overloadedMethod 方法的 Lambda 表达式和两个函数接口 Predicate、IntPredicate 在类型上都是匹配的。

在这段代码块中，两种情况都定义了相应的重载方法，这时，javac就无法编译，在错误报告中显示 Lambda 表达式被模糊调用。

IntPredicate 没有继承Predicate，因此编译器无法推断出哪个类型更具体。

将 Lambda 表达式强制转换为 IntPredicate 或 `Predicate<Integer>` 类型可以解决这个问题，至于转换为哪种类型则取决于要调用哪个函数接口。

当然，如果以前你曾自行设计过类库，就可以将其视为“代码异味”，不该再重载，而应当开始重新命名重载方法。

总而言之，Lambda 表达式作为参数时，其类型由它的目标类型推导得出，推导过程遵循如下规则：

- 如果只有一个可能的目标类型，由相应函数接口里的参数类型推导得出；

- 如果有多个可能的目标类型，由最具体的类型推导得出；

- 如果有多个可能的目标类型且最具体的类型不明确，则需人为指定类型。

# 4.4 @FunctionalInterface

2.4 节虽已讨论过函数接口定义的标准，但未提及 `@FunctionalInterface` 注释。

事实上，每个用作函数接口的接口都应该添加这个注释。

这究竟是什么意思呢？ 

Java 中有一些接口，虽然只含一个方法，但并不是为了使用Lambda 表达式来实现的。

比如，有些对象内部可能保存着某种状态，使用带有一个方法的接口可能纯属巧合。

java.lang.Comparable 和 java.io.Closeable 就属于这样的情况。

如果一个类是可比较的，就意味着在该类的实例之间存在某种顺序，比如字符串中的字母顺序。

人们通常不会认为函数是可比较的，如果一个东西既没有属性也没有状态，拿什么比较呢？

一个可关闭的对象必须持有某种打开的资源，比如一个需要关闭的文件句柄。

同样，该接口也不能是一个纯函数，因为关闭资源是更改状态的另一种形式。

和 Closeable 和 Comparable 接口不同，为了提高 Stream 对象可操作性而引入的各种新接
口，都需要有 Lambda 表达式可以实现它。

它们存在的意义在于将代码块作为数据打包起来。

因此，它们都添加了 @FunctionalInterface 注释。

该注释会强制 javac 检查一个接口是否符合函数接口的标准。

如果该注释添加给一个枚举类型、类或另一个注释，或者接口包含不止一个抽象方法，javac 就会报错。

重构代码时，使用它能很容易发现问题。

# 4.5 二进制接口的兼容性

如第 3 章开篇所言，Java 8 中对 API 最大的改变在于集合类。虽然 Java 在持续演进，但它一直在保持着向后二进制兼容。

具体来说，使用 Java 1 到 Java 7 编译的类库或应用，可以直接在 Java 8 上运行。

当然，错误也难免会时有发生，但和其他编程平台相比，二进制兼容性一直被视为 Java 的关键优势所在。

除非引入新的关键字，如 enum，达成源代码向后兼容也不是没有可能实现。

可以保证，只要是 Java 1 到 Java 7 写出的代码，在 Java 8 中依然可以编译通过。

事实上，修改了像集合类这样的核心类库之后，这一保证也很难实现。我们可以用具体的例子作为思考练习。

Java 8 中为 Collection 接口增加了 stream 方法，这意味着所有实现了 Collection 接口的类都必须增加这个新方法。

对核心类库里的类来说，实现这个新方法（比如为 ArrayList 增加新的 stream 方法）就能就能使问题迎刃而解。

缺憾在于，这个修改依然打破了二进制兼容性，在 JDK 之外实现 Collection 接口的类，例如 MyCustomList，也仍然需要实现新增的 stream 方法。

这个 MyCustomList 在 Java 8 中无法通过编译，即使已有一个编译好的版本，在 JVM 加载 MyCustomList 类时，类加载器仍然会引发异常。

这是所有使用第三方集合类库的梦魇，要避免这个糟糕情况，则需要在 Java 8 中添加新的语言特性：默认方法

# 4.6 默认方法

Collection 接口中增加了新的 stream 方法，如何能让 MyCustomList 类在不知道该方法的情况下通过编译？ 

Java 8 通过如下方法解决该问题：Collection 接口告诉它所有的子类：

“如果你没有实现 stream 方法，就使用我的吧。”接口中这样的方法叫作默认方法，在任何接口中，无论函数接口还是非函数接口，都可以使用该方法。

Iterable 接口中也新增了一个默认方法：forEach，该方法功能和 for 循环类似，但是允许
用户使用一个 Lambda 表达式作为循环体。

例 4-10 展示了 JDK 中 forEach 的实现方式：

例 4-10 默认方法示例：forEach 实现方式

```java
default void forEach(Consumer<? super T> action) {
    for (T t : this) {
        action.accept(t);
    }
}
```

如果已经习惯了通过调用接口方法来使用 Lambda 表达式的方式，那么这个例子理解起来就相当简单。

它使用一个常规的 for 循环遍历 Iterable 对象，然后对每个值调用 accept
方法。

既然如此简单，为何还要单独提出来呢？

重点就在于代码段前面的新关键字 default。

这个关键字告诉 javac 用户真正需要的是为接口添加一个新方法。

除了添加了一个新的关键字，默认方法在继承规则上和普通方法也略有区别。

和类不同，接口没有成员变量，因此默认方法只能通过调用子类的方法来修改子类本身，避免了对子类的实现做出各种假设。

## 默认方法和子类

默认方法的重写规则也有一些微妙之处。

从最简单的情况开始来看：没有重写。

在例 4-11中，Parent 接口定义了一个默认方法 welcome，调用该方法时，发送一条信息。ParentImpl
类没有实现 welcome 方法，因此它自然继承了该默认方法。

例 4-11 Parent 接口，其中的 welcome 是一个默认方法

```java
public interface Parent {

public void message(String body);

public default void welcome() {
    message("Parent: Hi!");
}

public String getLastMessage();
}
```

在例 4-12 中调用代码，我们调用默认方法，可以看到断言正确。

例 4-12 在客户代码中使用默认方法

```java
@Test
public void parentDefaultUsed() {
    Parent parent = new ParentImpl();
    parent.welcome();
    assertEquals("Parent: Hi!", parent.getLastMessage());
}
```

这时可新建一个接口 Child，继承自 Parent 接口，代码如例 4-13 所示。

Child 接口实现了自己的默认 welcome 方法，凭直觉判断可知，该方法重写了 Parent 的方法。

同样在这个例子中，ChildImpl 类不会实现 welcome 方法，因此它自然也继承了接口的默认方法。

例 4-13 继承了 Parent 接口的 Child 接口

```java
public interface Child extends Parent {
    @Override
    public default void welcome() {
        message("Child: Hi!");
    }
}
```

此时的类继承体系如图 4-4 所示。

例 4-14 调用了该接口，最后输出的字符串自然是 "Child: Hi!"。

例 4-14 调用 Child 接口的客户代码

```java
@Test
public void childOverrideDefault() {
    Child child = new ChildImpl();
    child.welcome();
    assertEquals("Child: Hi!", child.getLastMessage());
}
```

现在默认方法成了虚方法——和静态方法刚好相反。

任何时候，一旦与类中定义的方法产生冲突，都要优先选择类中定义的方法。

例 4-15 和例 4-16 展示了这种情况，最终调用的是 OverridingParent 的，而不是 Parent 的 welcome 方法。

例 4-15 重写 welcome 默认实现的父类

```java
public class OverridingParent extends ParentImpl {
    @Override
    public void welcome() {
        message("Class Parent: Hi!");
    }
}
```

例 4-16 调用的是类中的具体方法，而不是默认方法

```java
@Test
public void concreteBeatsDefault() {
    Parent parent = new OverridingParent();
    parent.welcome();
    assertEquals("Class Parent: Hi!", parent.getLastMessage());
}
```

4-18 展示了另一种情况，或许不认为类中重写的方法能够覆盖默认方法。

OverridingChild本身并没有任何操作，只是继承了 Child 和 OverridingParent 中的 welcome 方法。

最后，调用的是 OverridingParent 中的 welcome 方法，而不是 Child 接口中定义的默认方法（代码如例4-17 所示），原因在于，与接口中定义的默认方法相比，类中重写的方法更具体（参见图 4-5）。

例 4-17 子接口重写了父接口中的默认方法

```java
public class OverridingChild extends OverridingParent implements Child {
}
```

例 4-18 类中重写的方法优先级高于接口中定义的默认方法

```java
@Test
public void concreteBeatsCloserDefault() {
    Child child = new OverridingChild();
    child.welcome();
    assertEquals("Class Parent: Hi!", child.getLastMessage());
}
```

简言之，类中重写的方法胜出。

这样的设计**主要是由增加默认方法的目的决定的，增加默认方法主要是为了在接口上向后兼容。让类中重写方法的优先级高于默认方法能简化很多继承问题**。

假设已实现了一个定制的列表 MyCustomList，该类中有一个 addAll 方法，如果新的 List

接口也增加了一个默认方法 addAll，该方法将对列表的操作代理到 add 方法。

如果类中重写的方法没有默认方法的优先级高，那么就会破坏已有的实现。

PS: 目的是为了避免新增接口导致的其他包不兼容的问题，所以提出了 default 关键词。但是，为了保证不破坏具体实现逻辑，所以具体实现优先级一定要高于 default。

这里也可以想到一个有趣的问题，那就是 jdk7 以前，新增接口会导致什么问题？

# 4.7 多重继承

接口允许多重继承，因此有可能碰到两个接口包含签名相同的默认方法的情况。

比如例 4-19 中，接口 Carriage 和 Jukebox 都有一个默认方法 rock，虽然各有各的用途。

类MusicalCarriage 同时实现了接口 Jukebox（例 4-19）和 Carriage（例 4-20），它到底继承了哪个接口的 rock 方法呢？

例 4-19 Jukebox

```java
public interface Jukebox {
    public default String rock() {
        return "... all over the world!";
    }
}
```

例 4-20 Carriage

```java
public interface Carriage {
    public default String rock() {
        return "... from side to side";
    }
}
public class MusicalCarriage implements Carriage, Jukebox {
}
```

此时，javac 并不明确应该继承哪个接口中的方法，因此编译器会报错：class Musical Carriage
inherits unrelated defaults for rock() from types Carriage and Jukebox。

当然，在类中实现 rock 方法就能解决这个问题，如例 4-21 所示。

例 4-21 实现 rock 方法

```java
public class MusicalCarriage
implements Carriage, Jukebox {
    @Override
    public String rock() {
        return Carriage.super.rock();
    }
}
```

该例中使用了增强的 super 语法，用来指明使用接口 Carriage 中定义的默认方法。

此前使用 super 关键字是指向父类，现在使用类似 InterfaceName.super 这样的语法指的是继承自父接口的方法。

## 三定律

如果对默认方法的工作原理，特别是在多重继承下的行为还没有把握，如下三条简单的定律可以帮助大家。

1. 类胜于接口。如果在继承链中有方法体或抽象的方法声明，那么就可以忽略接口中定义的方法。

2. 子类胜于父类。如果一个接口继承了另一个接口，且两个接口都定义了一个默认方法，那么子类中定义的方法胜出。

3. 没有规则三。如果上面两条规则不适用，子类要么需要实现该方法，要么将该方法声明为抽象方法。

其中第一条规则是为了让代码向后兼容。

# 4.8 权衡

在接口中定义方法的诸多变化引发了一系列问题，既然可用代码主体定义方法，那 Java 8中的接口还是旧有版本中界定的代码吗？

现在的接口提供了某种形式上的多重继承功能，然而多重继承在以前饱受诟病，Java 因此舍弃了该语言特性，这也正是 Java 在易用性方面优于 C++ 的原因之一。

语言特性的利弊也在不断演化。

很多人认为多重继承的问题在于对象状态的继承，而不是代码块的继承，默认方法避免了状态的继承，也因此避免了 C++ 中多重继承的最大缺点。

突破语言上的局限性吸引着无数优秀的程序员不断尝试。

现在已有一些博客文章，阐述在 Java 8 中实现完全的多重继承做出的尝试，包括状态的继承和默认方法。

尝试突破 Java 8 这些有意为之的语言限制时，却往往又掉进 C++ 的旧有陷阱之中。

接口和抽象类之间还是存在明显的区别。

接口允许多重继承，却没有成员变量；抽象类可以继承成员变量，却不能多重继承。

在对问题域建模时，需要根据具体情况进行权衡，而在以前的 Java 中可能并不需要这样。

PS: default 方法带来了另一个有趣的问题，那就是多重继承。这个以前被 java 舍弃的特性。

# 4.9 接口的静态方法

前面已多次出现过 Stream.of 方法的调用，接下来将对其进行详细介绍。Stream 是个接口，Stream.of 是接口的静态方法。

这也是 Java 8 中添加的一个新的语言特性，旨在帮助编写类库的开发人员，但对于日常应用程序的开发人员也同样适用。

人们在编程过程中积累了这样一条经验，那就是一个包含很多静态方法的类。

有时，类是一个放置工具方法的好地方，比如 Java 7 中引入的 Objects 类，就包含了很多工具方法，这些方法不是具体属于某个类的。

当然，**如果一个方法有充分的语义原因和某个概念相关，那么就应该将该方法和相关的类或接口放在一起，而不是放到另一个工具类中**。

PS：jdk8 以前，接口不准定义静态方法吗？

这有助于更好地组织代码，阅读代码的人也更容易找到相关方法。

比如，如果想创建一个由简单值组成的 Stream，自然希望 Stream 中能有一个这样的方法。这在以前很难达成，引入重接口的 Stream 对象，最后促使 Java 为接口加入了静态方法。
Stream 和其他几个子类还包含另外几个静态方法。

特别是 range 和 iterate方法提供了产生 Stream 的其他方式。

# 4.10 Optional

reduce 方法的一个重点尚未提及：reduce 方法有两种形式，一种如前面出现的需要有一个初始值，另一种变式则不需要有初始值。

没有初始值的情况下，reduce 的第一步使用Stream 中的前两个元素。有时，reduce 操作不存在有意义的初始值，这样做就是有意义的，此时，reduce 方法返回一个 Optional 对象。

Optional 是为核心类库新设计的一个数据类型，用来替换 null 值。

人们对原有的 null 值有很多抱怨，甚至连发明这一概念的 Tony Hoare 也是如此，他曾说这是自己的一个“价值连城的错误”。

作为一名有影响力的计算机科学家就是这样：虽然连一毛钱也见不到，却也可以犯一个“价值连城的错误”。

人们常常使用 null 值表示值不存在，Optional 对象能更好地表达这个概念。使用 null 代表值不存在的最大问题在于 NullPointerException。

一旦引用一个存储 null 值的变量，程序会立即崩溃。

使用 Optional 对象有两个目的：

**首先，Optional 对象鼓励程序员适时检查变量是否为空，以避免代码缺陷；其次，它将一个类的 API 中可能为空的值文档化，这比阅读实现代码要简单很多**。

下面我们举例说明 Optional 对象的 API，从而切身体会一下它的使用方法。

使用工厂方法of，可以从某个值创建出一个 Optional 对象。

Optional 对象相当于值的容器，而该值可以通过 get 方法提取。

如例 4-22 所示。

例 4-22 创建某个值的 Optional 对象

```java
Optional<String> a = Optional.of("a");
assertEquals("a", a.get());
```

Optional 对象也可能为空，因此还有一个对应的工厂方法 empty，另外一个工厂方法ofNullable 则可将一个空值转换成 Optional 对象。

例 4-23 展示了这两个方法，同时展示了第三个方法 isPresent 的用法（该方法表示一个 Optional 对象里是否有值）。

例 4-23 创建一个空的 Optional 对象，并检查其是否有值

```java
Optional emptyOptional = Optional.empty();
Optional alsoEmpty = Optional.ofNullable(null);
assertFalse(emptyOptional.isPresent());
// 例 4-22 中定义了变量 a
assertTrue(a.isPresent());
```

使用 Optional 对象的方式之一是在调用 get() 方法前，先使用 isPresent 检查 Optional对象是否有值。

使用 orElse 方法则更简洁，当 Optional 对象为空时，该方法提供了一个备选值。

如果计算备选值在计算上太过繁琐，即可使用 orElseGet 方法。

该方法接受一个Supplier 对象，只有在 Optional 对象真正为空时才会调用。

例 4-24 展示了这两个方法。

例 4-24 使用 orElse 和 orElseGet 方法

```java
assertEquals("b", emptyOptional.orElse("b"));
assertEquals("c", emptyOptional.orElseGet(() -> "c"));
```

Optional 对象不仅可以用于新的 Java 8 API，也可用于具体领域类中，和普通的类别无二致。

当试图避免空值相关的缺陷，如未捕获的异常时，可以考虑一下是否可使用 Optional对象。

# 参考资料

《java8 函数式编程》

* any list
{:toc}