---
layout: post
title:  test Property-based Testing-03-QuickTheories Java的属性驱动测试框架入门介绍
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, test]
published: true
---

# 拓展阅读

[开源 Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[开源 Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)

# QuickTheories

QuickTheories 是针对Java 8的属性驱动测试框架。

如果你正在寻找Java的QuickCheck，那么你刚刚找到了它。

与许多其他系统不同，QuickTheories 支持自动缩小和使用覆盖数据进行有针对性的搜索。

## 什么是属性驱动测试?

传统的单元测试通过指定一系列具体的示例并对被测试单元的输出/行为进行断言来进行。 

而属性驱动测试摆脱了具体的例子，而是**检查某些属性是否对所有可能的输入都成立**。

它通过自动生成一组有效输入的随机样本来实现这一点。 

这可以是发现您和您的代码中存在的错误假设的一种有效方式。 

如果“随机”一词让您感到有些紧张，不用担心，QuickTheories 提供了保持测试可重复性的方法。

## 快速入门

将 QuickTheories 的 JAR 文件添加到您的构建路径中（查看页面顶部的徽章以获取最新版本的 Maven 坐标）。

您可以从 JUnit、TestNG 或任何其他测试框架运行 QuickTheories。

以下是使用 JUnit 的示例：

```java
import static org.quicktheories.QuickTheory.qt;
import static org.quicktheories.generators.SourceDSL.*;

public class SomeTests {

  @Test
  public void addingTwoPositiveIntegersAlwaysGivesAPositiveInteger(){
    qt()
    .forAll(integers().allPositive()
          , integers().allPositive())
    .check((i,j) -> i + j > 0); 
  }

}
```

静态导入 `org.quicktheories.QuickTheory.qt` 提供了对 QuickTheories DSL 的访问。

静态导入 `org.quicktheories.generators.SourceDSL.*` 提供了对 DSL 的访问，该 DSL 允许定义有效的输入。

这个属性看起来相当简单，它只是检查两个整数相加是否总是产生大于 0 的数字。

这不可能失败，对吧？那就意味着数学出了问题。

如果我们运行这个测试，我们会得到类似以下的结果：

```java
java.lang.AssertionError: Property falsified after 1 example(s) 
Smallest found falsifying value(s) :-
{840226137, 1309274625}
Other found falsifying value(s) :- 
{848253830, 1320535400}
{841714728, 1317667877}
{840894251, 1310141916}
{840226137, 1309274625}
 
Seed was 29678088851250	
```

这个被证伪的理论突显了我们忽略的一点。

数学运算是完全正常的，但在Java中，整数可能会溢出。

## 如果不使用静态导入

如果您更喜欢，可以通过实现一个接口将 QuickTheories 的入口点引入范围，从而省去对静态导入的需求。

```java
public class SomeTests implements WithQuickTheories {

  @Test
  public void addingTwoPositiveIntegersAlwaysGivesAPositiveInteger(){
    qt()
    .forAll(integers().allPositive()
          , integers().allPositive())
    .check((i,j) -> i + j > 0); 
  }

}
```

## 更简洁

Source DSL 的语法结构很清晰，但有时可能会显得有些冗长。

大多数核心生成器也可以通过导入 `org.quicktheories.generators.Generate` 来访问。

这提供了一些简单的静态方法，返回核心类型的生成器。

```java
import static org.quicktheories.generators.Generate.*;

@Test
public void someProperty() {
  qt()
  .forAll(range(1, 102), constant(7))
  .check((i,c) -> i + c >= 7);
}
```

## 收缩

QuickTheories 支持收缩。

这意味着它不仅会找到一个使理论无效的值并停止。

相反，它将尝试找到其他更小（或者说更“简单”）的值，也使理论无效。

默认情况下，QuickTheories 在寻找较小值时会花费大约比在寻找原始的使理论无效的值时多 100 倍的努力。

找到的最小值将与沿途找到的任何其他使理论无效的值的样本一起报告。

不能保证这是可能的最小使理论无效的值，或者其他值不存在。通常，缩小后的值将比原始未缩小的值更易于理解和处理 - 报告的值中可能会出现模式。

与直接的 QuickCheck 克隆不同，QuickTheories 不要求您为每种类型提供自己的收缩实现。

对于所有类型，都会自动执行收缩。实现这一点的机制不对类型的结构或实现做出任何假设，也不会破坏封装。


## 种子和可重复的测试

在报告的末尾，会报告种子（Seed）。

这是 QuickTheories 中所有随机性派生的值。

默认情况下，它设置为 `System.nanoTime()`，因此每次运行 QuickTheories 时值都会不同。但是，也可以显式设置种子，以便能够复现和确定性地运行。

每当属性被证伪时，都会报告使用的种子，因此您可以始终复现完全相同的运行。

因此，总是可以重新创建一个运行，通过使用单一的固定种子，您可以选择完全确定性的行为。

提供了两种设置种子的方法。

直接使用 DSL：

```java
  qt()
  .withFixedSeed(0)
  .forAll( . . .)
```

或者使用 `QT_SEED` 系统属性。

因此，可以使用固定的种子运行相同的测试以捕获回归问题，或者使用不同的种子，以便不断搜索使理论无效的值。

## 断言

我们的示例理论使用了一个简单的谓词，但有时候可能希望利用断言库（如 assertj 和 hamcrest）提供的功能。

这可以通过使用 `checkAssert` 方法来实现。

```java
  @Test
  public void someTheory() {
    qt().forAll(longs().all())
        .checkAssert(i -> assertThat(i).isEqualsTo(42));
  }
```

任何返回 `void` 的代码块都可以传递给 `checkAssert`。

任何未检查的异常都将被解释为使理论无效。

## 假设

正如我们所见，我们可以从一对生成器（Gens）创建理论，这些生成器产生一对值。

实际上，我们可以创建关于任意数量值（1 到 4 之间）的理论。

```java
   @Test
  public void someTheoryOrOther(){
    qt()
    .forAll(integers().allPositive()
          , strings().basicLatinAlphabet().ofLengthBetween(0, 10)
          , lists().allListsOf(integers().all()).ofSize(42))
    .check((i,s,l) -> l.contains(i) && s.equals(""));
  }
```

在上面的示例中，我们使用了三个 Gens，正如你所看到的，QuickTheories 提供了生成大多数常见 Java 类型的方法。

Gen 只是一个从随机数生成器到值的简单函数。正如我们所看到的，DSL 提供了一种对生成的值设置约束的方式（例如，我们只会生成正整数，而在这个示例中，列表的大小只会是 42）。

在可能的情况下，应该使用 DSL 提供约束，但有时可能需要以 DSL 无法表达的方式对域进行约束。

当发生这种情况时，请使用假设（assumptions）。

```java
  @Test
  public void someTheoryOrOther(){
    qt()
    .forAll(integers().allPositive()
          , strings().basicLatinAlphabet().ofLengthBetween(0, 10)
          , lists().allListsOf(integers().all()).ofSize(42))
    .assuming((i,s,l) -> s.contains(i.toString())) // <-- an assumption
    .check((i,s,l) -> l.contains(i) && s.contains(i.toString()));
  }
```

假设进一步限制了构成理论主题的值。

尽管我们总是可以用假设替换在 DSL 中创建的约束，但这将是非常低效的。QuickTheories 在尝试使理论无效之前必须花费大量的工作来尝试找到有效值。

由于很难找到的值可能代表编码错误，如果生成的值中不到 10% 符合假设条件，QuickTheories 将抛出错误：

```java
  @Test
  public void badUseOfAssumptions() {
    qt()
    .forAll(integers().allPositive())
    .assuming(i -> i < 30000)
    .check( i -> i < 3000);
  }
```

Gives

```
java.lang.IllegalStateException: Gave up after finding only 107 example(s) matching the assumptions
	at org.quicktheories.quicktheories.core.ExceptionReporter.valuesExhausted(ExceptionReporter.java:20)
```

（注：此假设可以被以下内容替代：

```java
   @Test
  public void goodUseOfSource(){
    qt().forAll(integers().from(1).upTo(30000))
    .check( i -> i < 3000);
  }
```

这将导致以下的失败消息：）

```
java.lang.AssertionError: Property falsified after 1 example(s) 
Smallest found falsifying value(s) :-
3000
Other found falsifying value(s) :- 
13723
13722
13721
13720
13719
13718
13717
13716
13715
13714
 
Seed was 2563360080237
```

# 生成器（Gens）

很可能你会想要构造自己类型的实例。你可以在每个检查中这样做，但这会导致大量的代码重复。

相反，你可以定义一个转换函数。这可以在内联中完成，或者放在一个方便重用的地方。

```java
  @Test
  public void someTheoryOrOther(){
    qt()
    .forAll(integers().allPositive()
          , integers().allPositive())
    .as( (width,height) -> new Widget(width,height) ) // <-- convert to our own type here
    .check( widget -> widget.isValid());
  }
```

这对于简单情况很有效，但存在两个问题。

1. 我们不能在理论中引用原始的宽度和高度整数。因此，我们无法（例如）检查小部件是否具有预期的大小。
2. 如果我们的小部件没有定义 toString 方法，很难知道使理论无效的值是什么。

这两个问题都可以通过 `asWithPrecursors` 方法解决。

```java
  @Test
  public void someTheoryOrOther(){
     qt()
    .forAll(integers().allPositive()
          , integers().allPositive())
    .asWithPrecursor( (width,height) -> new Widget(width,height) )
    .check( (width,height,widget) -> widget.size() > width * height ); 
  }
```

当此操作失败时，会得到如下结果：

```
java.lang.AssertionError: Property falsified after 2 example(s)
Smallest found falsifying value(s) :-
{43, 23259, com.example.QuickTheoriesExample$Widget@9e89d68}
Other found falsifying value(s) :- 
{536238991, 619642140, com.example.QuickTheoriesExample$Widget@59f95c5d}
{2891501, 215920967, com.example.QuickTheoriesExample$Widget@5ccd43c2}
{1479099, 47930205, com.example.QuickTheoriesExample$Widget@4aa8f0b4}
{297099, 11425635, com.example.QuickTheoriesExample$Widget@7960847b}
{288582, 10972429, com.example.QuickTheoriesExample$Widget@6a6824be}
{14457, 5650202, com.example.QuickTheoriesExample$Widget@5c8da962}
{14456, 393098, com.example.QuickTheoriesExample$Widget@512ddf17}
{14454, 38038, com.example.QuickTheoriesExample$Widget@2c13da15}
{14453, 38037, com.example.QuickTheoriesExample$Widget@77556fd}
{14452, 38036, com.example.QuickTheoriesExample$Widget@368239c8}
 
Seed was 4314310398163
```

注意，收缩对我们的自定义类型而言是无需我们任何努力的。

定义构成对象有效域的值可能并不直观，并且可能导致在理论之间有很多重复的代码。

幸运的是，产生随机值的 Gen 对象可以自由重用，并与其他 Gen 对象组合。

例如：

```java
  @Test
  public void cylindersHavePositiveAreas() {
    qt()
    .forAll(cylinders())
    .check( cylinder -> cylinder.area().compareTo(BigDecimal.ZERO) > 0);
  }
  
  private Gen<Cylinder> cylinders() {
    return radii().zip(heights(),
        (radius, height) -> new Cylinder(radius, height))
        .assuming(cylinder -> some sort of validation );
  }


  private Gen<Integer> heights() {
    return integers().from(79).upToAndIncluding(1004856);
  }

  private Gen<Integer> radii() {
    return integers().allPositive();
  }
```

Gens 提供了许多方法，允许它们映射到不同的类型或与其他 Gens 结合。

所有这些操作都保留了假设，并允许结果类型进行缩小，而无需任何额外的代码。

# 配置文件

通常希望在多个属性之间重用配置而不进行重复，并且能够控制在不同环境中使用哪些配置。

这可以通过使用配置文件来实现。配置文件是具有特定Java类范围的命名配置。

它们可以在测试类之间共享，也可以局限于JUnit测试类。

设置要使用的配置文件是通过 `QT_PROFILE` 系统属性完成的。如果没有设置配置文件，则使用默认配置文件。

要定义一个配置文件，请注册它：

```java
import org.quicktheories.core.Profile;
public class SomeTests implements WithQuickTheories {
    static {
        Profile.registerProfile(SomeTests.class, "ci", s -> s.withExamples(10000));
        Profile.registerProfile(SomeTests.class, "dev", s -> s.withExamples(10));
    }
}
```

对于每个注册了配置文件的类，还可以注册一个默认配置文件（否则将使用 QuickTheories 的默认值）。

可以使用 `-DQT_PROFILE=default:` 明确选择默认配置文件。

```java
Profile.registerDefaultProfile(SomeTests.class, s -> s.withExamples(10));
```

属性必须使用 `withRegisteredProfiles` 明确选择是否使用配置文件：

```java
@Test
public void someProperty() {
    qt().withRegisteredProfiles(SomeTests.class)
        .forAll(...)
        .check(...)
}
```

还可以设置一个明确的配置文件：

```java
@Test
public void someProperty() {
    qt().withProfile(SomeTests.class, "ci")
        .forAll(...)
        .check(...)
}
```

在调用 `withProfile` 或 `withRegisteredProfiles` 后进行的任何配置更改都将优先于配置文件中设置的值。

# 修改伪造的输出

由 Source DSL 产生的值应提供清晰的伪造消息。

如果你正在使用自己的 Gen，或者想要修改默认设置，可以提供自己的函数用于在描述伪造的值时使用。

例如：

```java
  @Test
  public void someTestInvolvingCylinders() {
      qt()
      .forAll(integers().allPositive().describedAs(r -> "Radius = " + r)
             , integers().allPositive().describedAs(h -> "Height = " + h))
      .check((r,h) -> whatever);
  }
```

自定义描述函数在转换为具有前驱的类型时将被保留。

可以选择将转换后的类型的描述函数传递给 `asWithPrecursor` 函数。

```java
  @Test
  public void someTestInvolvingCylinders() {
      qt()
      .forAll(integers().allPositive().describedAs(r -> "Radius = " + r)
             , integers().allPositive().describedAs(h -> "Height = " + h))
      .asWithPrecursor((r,h) -> new Cylinder(r,h)
                       , cylinder -> "Cylinder r =" + cylinder.radius() + " h =" + cylinder.height())        
      .check((i,j,k) -> whatever);
  }
```

可以通过以下方式为转换而无前驱的类型提供描述函数：

```java
  @Test
  public void someTestInvolvingCylinders() {
      qt()
      .forAll(integers().allPositive().describedAs(r -> "Radius = " + r)
             , integers().allPositive().describesAs(h -> "Height = " + h))
      .as( (r,h) -> new Cylinder(r,h))
      .describedAs(cylinder -> "Cylinder r =" + cylinder.radius() + " h =" + cylinder.height())        
      .check(l -> whatever);
  }
```

# 覆盖率指导

QuickTheories 包含了一个实验性的功能，以提高有针对性搜索的效率。如果在类路径上包含了 coverage jar，QuickTheories 将在被测试的代码中插入探针。当这些探针显示某个示例已经执行了新的代码路径时，QuickTheories 将集中搜索在这个区域。

这种方法已经在简单的示例情况下证明在伪造分支代码方面要更有效。目前尚不清楚它在真实场景中的性能如何。

覆盖率指导存在一些缺点。为了测量覆盖率，QuickTheories 必须将一个代理附加到 JVM 上。代理在安装后将一直处于活动状态，直到 JVM 退出 - 这意味着它可能在运行非 QuickTheory 测试时处于活动状态。这将导致性能降低约 10%，并且如果其他覆盖率系统（如 JaCoCo）也处于活动状态，则可能会干扰它们。因此，如果使用覆盖率指导，建议在单独的套件中运行 QuickTheories 测试。

可以在每个测试的基础上禁用覆盖率指导。

```java
  qt() 
  .withGuidance(noGuidance())
  .etc
```

# 配置属性

可以设置三个系统属性来确定 QuickTheories 的行为：

- `QT_SEED` - 要使用的随机种子
- `QT_EXAMPLES` - 每个理论尝试的示例数
- `QT_SHRINKS` - 要进行的收缩尝试次数

## 编写良好的属性

属性不应该只是复制您的被测试代码的逻辑（这对于基于示例的测试同样适用）。

相反，属性应该尝试指定非常简单但通用的不变量。从非常简单的通用属性开始，随着进展变得更加具体。

一些产生良好属性的常见模式包括：

（注意，这些模式在很大程度上是对 fsharpforfunandprofit 中的材料的总结）

### 不变模式，又称“一些事情永远不会改变”

有些事情预计会保持不变，例如，映射操作应该产生与其给定的项目数相同的项，两个银行账户之间的总余额在转账后应该保持不变等。

### 反函数模式，又称“去而复返”

如果有两个相互反转的函数，那么将一个函数的输入应用于另一个函数应该不会产生任何变化。

常见的反函数对包括：

- 序列化 / 反序列化
- 压缩 / 解压缩
- 加密 / 解密
- 创建 / 删除

### 类似函数模式，又称“不同的路径相同的目的地”

如果有两个实现相同逻辑但在某些其他属性上不同的函数（也许其中一个效率低、不安全或在第三方库中实现），则可以定义一个属性，检查在相同输入的情况下这些函数的输出是否匹配。

### 幂等性，又称“事物改变的越多，事物保持不变的越多”

有时执行多次操作不会产生影响是很重要/合理的。例如，如果对字符串多次修剪空白字符，只有第一次修剪应该具有任何可观察的效果。

# 简单的例子

一个伪造的示例测试，显示在 Java 中添加两个正整数并不总是得到一个正整数：

```java
@Test
  public void addingTwoPositiveIntegersAlwaysGivesAPositiveInteger(){
    qt()
    .forAll(integers().allPositive()
          , integers().allPositive())
    .check((i,j) -> i + j > 0);  //fails
  }
```

多个测试的示例，用于测试代码，该代码声称找到两个整数的最大公约数。

第一个属性测试由于 `java.lang.StackOverflowError` 错误而失败（由于试图取 `Integer.MIN_VALUE` 的绝对值引起）。


```java
  @Test
  public void shouldFindThatAllIntegersHaveGcdOfOneWithOne() {
    qt().forAll(integers().all()).check(n -> gcd(n, 1) == 1); // fails on
                                                              // -2147483648
  }

  @Test
  public void shouldFindThatAllIntegersInRangeHaveGcdOfOneWithOne() {
    qt().forAll(integers().between(-Integer.MAX_VALUE, Integer.MAX_VALUE))
        .check(n -> gcd(n, 1) == 1);
  }

  @Test
  public void shouldFindThatAllIntegersHaveGcdThemselvesWithThemselves() {
    qt().forAll(integers().between(-Integer.MAX_VALUE, Integer.MAX_VALUE))
        .check(n -> gcd(n, n) == Math.abs(n));
  }

  @Test
  public void shouldFindThatGcdOfNAndMEqualsGcdMModNAndN() {
    qt().forAll(integers().between(-Integer.MAX_VALUE, Integer.MAX_VALUE)
               ,integers().between(-Integer.MAX_VALUE, Integer.MAX_VALUE))
        .check((n, m) -> gcd(n, m) == gcd(m % n, n));
  }

  private int gcd(int n, int m) {
    if (n == 0) {
      return Math.abs(m);
    }
    if (m == 0) {
      return Math.abs(n);
    }
    if (n < 0) {
      return gcd(-n, m);
    }
    if (m < 0) {
      return gcd(n, -m);
    }
    if (n > m) {
      return gcd(m, n);
    }
    return gcd(m % n, n);
  }
```

# 设计目标
QuickTheories 的设计目标如下：

1. 默认情况下使用随机数，但构建必须是可重复的。
2. 支持收缩。
3. 独立于测试 API（JUnit、TestNG 等）。

其中，第2点是最困难的部分，因为它对设计有许多影响。在0.1x和0.2x系列的发布之间，该方法发生了完全的变化。

截至0.20版本，收缩采用了类似于 Python 库 hypothesis 的方法，其中收缩不知道它正在生成的类型。这种方法不如原始方法灵活，但允许自由组合 Gens，同时大大减小了代码库的大小。

# 背景

QuickTheories 是在 NCR Edinburgh 作为我们的毕业培训计划的一部分编写的。

我们喜欢以稍有不同的方式进行培训 - 我们的新毕业生在一个星期内与我们团队中经验丰富的成员一起开展有趣的项目。

我们对这些项目的座右铭是“能够失败的软件” - 因此我们可以尝试一些有趣的想法，这些想法可能最终会落空。

当我们认为它们取得了成功时，我们愿意以开源的形式分享结果。

# 其他Java的属性驱动测试系统

如果你不喜欢 QuickTheories，你可能想尝试一下下面的其他系统，它们有不同的设计目标。除了 junit-quickcheck，它们中没有一个看起来实现了缩小，但都提供了生成随机值的方法，并且应该可以在较早版本的Java上运行。

1. JUnit-quickcheck：与 JUnit 紧密集成，使用注解配置生成器。
   - 从版本0.6开始，junit-quickcheck 也支持缩小。

2. JCheck：与 JUnit 紧密集成。似乎没有维护。

3. QuickCheck：不绑定到测试框架 - 提供用于测试的随机值的生成器。

4. FunctionalJava：据说包含一个属性驱动测试系统，但似乎完全没有文档。

5. ScalaCheck：成熟的属性驱动测试系统，支持缩小，但需要 Scala 而不是 Java。对缩小工作方式存在设计级别的问题。

6. jqwik：基于 JUnit 5 实现，使用注解。支持缩小。


# chat

## QuickTheories 通过指定 seed，让测试用例可重复。这个是如何实现的？

### A1

在 QuickTheories 中，通过指定 seed 实现测试用例的可重复性是通过设置随机数生成器的种子（seed）来实现的。种子是一个初始值，它决定了随机数生成器的输出序列。如果两次运行测试使用相同的种子，那么它们将得到相同的随机数序列，从而导致相同的测试输入。

在 QuickTheories 中，你可以通过设置系统属性 `QT_SEED` 来指定种子。例如，在命令行中运行测试时，可以使用 `-DQT_SEED=123` 来指定种子值。这样，每次运行测试时都会使用相同的种子，从而产生可重复的随机输入。

以下是使用 seed 的示例：

```bash
java -jar your-test-jar.jar -DQT_SEED=123
```

通过这种方式，QuickTheories 将使用指定的种子生成随机输入，从而使测试用例的运行结果可重复。这对于调试和复现特定问题非常有用。

### 我问的是实现原理

抱歉，我误解了你的问题。在 QuickTheories 中，实现测试用例的可重复性是通过设置随机数生成器的种子来实现的。下面是简要的实现原理：

1. **随机数生成器（Random Number Generator）：** QuickTheories 使用 Java 的 `java.util.Random` 类作为随机数生成器。这个类可以接受一个种子作为构造函数参数，从而确定其生成的随机数序列。

2. **种子的传递：** QuickTheories 允许通过系统属性 `QT_SEED` 来指定种子值。当 QuickTheories 初始化随机数生成器时，它会检查系统属性 `QT_SEED` 是否设置，如果设置了，就将该值作为种子传递给 `java.util.Random`。

3. **测试用例执行：** 在执行测试用例之前，QuickTheories 初始化随机数生成器，并使用指定的种子值。这确保了每次运行测试时都会得到相同的随机数序列。

4. **随机输入生成：** 随机数生成器的种子确定了生成的随机数序列，而 QuickTheories 则使用这些随机数来生成测试用例的随机输入。由于种子相同，生成的随机输入序列也相同，因此测试用例的输入是可重复的。

总体来说，QuickTheories 利用 Java 的 `java.util.Random` 类的种子机制，通过指定种子来确保测试用例的可重复性。这对于在相同条件下重新运行测试、调试和定位问题都非常有用。

### java.util.Random 指定种子，就可以保证随机可重复吗？给出具体的 java 例子

是的，通过在 `java.util.Random` 中指定相同的种子值，可以确保生成的随机数序列是可重复的。

以下是一个简单的 Java 例子：

```java
import java.util.Random;

public class RandomReproducibilityExample {

    public static void main(String[] args) {
        // 指定相同的种子值
        long seed = 123;

        // 创建两个使用相同种子的 Random 实例
        Random random1 = new Random(seed);
        Random random2 = new Random(seed);

        // 打印两个 Random 实例生成的随机数序列
        System.out.println("Random 1: " + generateRandomSequence(random1));
        System.out.println("Random 2: " + generateRandomSequence(random2));
    }

    private static String generateRandomSequence(Random random) {
        StringBuilder sequence = new StringBuilder();
        for (int i = 0; i < 5; i++) {
            sequence.append(random.nextInt(100)).append(" ");
        }
        return sequence.toString().trim();
    }
}
```

在这个例子中，我们创建了两个 `Random` 实例，它们都使用相同的种子值 `123`。

然后，我们分别生成两个 `Random` 实例的随机数序列并打印输出。

由于它们使用相同的种子，因此生成的随机数序列将是相同的。

这个原理同样适用于 QuickTheories 中，通过设置相同的种子值，你可以确保测试用例的随机输入是可重复的。

# 参考资料

https://github.com/quicktheories/QuickTheories

* any list
{:toc}