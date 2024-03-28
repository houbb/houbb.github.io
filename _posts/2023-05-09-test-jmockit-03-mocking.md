---
layout: post
title: test 之 jmockit-03-Mocking 模拟 
date:  2023-05-09 +0800
categories: [Test]
tags: [junit, test, sh]
published: true
---

# 拓展阅读

[jmockit-01-jmockit 入门使用案例](https://houbb.github.io/2023/05/09/test-jmockit-00-intro)

[jmockit-02-概览](https://houbb.github.io/2023/05/09/test-jmockit-01-overview)

[jmockit-03-Mocking 模拟](https://houbb.github.io/2023/05/09/test-jmockit-03-mocking)

[jmockit-04-Faking 伪造](https://houbb.github.io/2023/05/09/test-jmockit-04-faking)

[jmockit-05-代码覆盖率](https://houbb.github.io/2023/05/09/test-jmockit-05-code-converate)

[mockito-01-入门介绍](https://houbb.github.io/2023/05/09/test-mockito-01-overivew)

[mockito-02-springaop 整合遇到的问题，失效](https://houbb.github.io/2023/05/09/test-mockito-02-springaop)


# Mocking 

在 JMockit 库中，Expectations API 为自动化开发人员测试中使用模拟提供了丰富的支持。 

使用模拟时，测试重点关注被测代码的行为，如通过其与其依赖的其他类型的交互来表达的。 

模拟通常用于构建隔离的单元测试，其中被测单元的运行与它所依赖的其他单元的实现隔离。 

通常，一个行为单元是一个类，但是出于单元测试的目的，将一整套强相关类视为一个单元也可以（通常情况下，当我们有一个中央公共类，其中一个 或更多辅助类，可能是包私有的）； 一般来说，单个方法不应被视为独立的单元。

然而，严格的单元测试并不是推荐的方法； 人们不应该试图模拟每一个依赖项。 

模拟最好适度使用； 只要有可能，就应该支持集成测试而不是孤立的单元测试。 

也就是说，当某些特定的依赖项无法轻松使用其实际实现时，或者当尝试为极端情况创建测试时，在创建集成测试时，模拟有时也很有用，其中适当的模拟交互可以极大地促进测试。

# 1 模拟类型和实例

模拟提供了一种将要测试的类与其（某些）依赖项隔离的机制。 

我们通过在测试类中声明合适的模拟字段和/或模拟参数来指定要模拟哪些特定依赖项； 

模拟字段被声明为测试类的带注释的实例字段，而模拟参数被声明为测试方法的带注释的参数。 模拟字段或参数的类型可以是任何类型的引用类型：接口、类（包括抽象类和最终类）、注释或枚举。

以下示例测试框架（使用 Java 8 和 JUnit 5）作为模拟字段和模拟参数的声明以及它们在测试代码中通常使用的方式的基本说明。

```java
@Mocked Dependency mockInstance; // holds a mocked instance automatically created for use in each test

@Test
void doBusinessOperationXyz(@Mocked AnotherDependency anotherMock) {
   ...
   new Expectations() {{ // an "expectation block"
      ...
      // Record an expectation, with a given value to be returned:
      mockInstance.mockedMethod(...); result = 123;
      ...
   }};
   ...
   // Call the code under test.
   ...
   new Verifications() {{ // a "verification block"
      // Verifies an expected invocation:
      anotherMock.save(any); times = 1;
   }};
   ...
}
```

对于在测试方法中声明的模拟参数，JMockit 将自动创建声明类型的实例，并在执行测试方法时由 JUnit/TestNG 测试运行器传递； 因此，参数值永远不会为空。 

对于模拟字段，将自动创建声明类型的实例并将其分配给该字段（前提是它不是最终的）。

在声明模拟字段和参数时，我们可以使用三种不同的模拟注释： 

`@Mocked`，它将模拟模拟类的所有现有和未来实例上的所有方法和构造函数（在使用它的测试期间）； 

`@Injectable`，它将模拟限制为单个模拟实例的实例方法； 

`@Capturing`，它将模拟扩展到实现模拟接口的类，或扩展模拟类的子类。

JMockit 创建的模拟实例可以在测试代码中正常使用（用于记录和验证期望），和/或传递到被测代码。 或者它们可能只是被闲置。 

与其他模拟 API 不同，这些模拟对象不必是被测试代码在其依赖项上调用实例方法时使用的对象。 

当使用 @Mocked 或 @Capturing 时（但不使用 @Injectable 时），JMockit 不关心在哪个特定对象上调用模拟实例方法。 

当所述代码使用 new 运算符调用全新实例上的构造函数时，这允许对直接在测试代码内部创建的实例进行透明模拟； 实例化的类必须被测试代码中声明的模拟类型覆盖，仅此而已。

# 2 Expectations 期望

期望表示对与给定测试相关的特定模拟方法/构造函数的一组调用。 

期望可能涵盖对同一方法或构造函数的多个不同调用，但它不必涵盖测试执行期间发生的所有此类调用。 

特定调用是否与给定期望匹配不仅取决于方法/构造函数签名，还取决于运行时方面，例如调用方法的实例、参数值和/或已匹配的调用数量。 

因此，可以（可选）为给定的期望指定几种类型的匹配约束。

当我们涉及一个或多个调用参数时，可以为每个参数指定一个精确的参数值。 

例如，可以为 String 参数指定值“test string”，从而导致期望仅匹配相应参数中具有该精确值的那些调用。 

正如我们稍后将看到的，我们可以指定更宽松的约束，而不是指定精确的参数值，这些约束将匹配整组不同的参数值。

下面的示例显示了对 `Dependency#someMethod(int, String)` 的期望，它将将此方法的调用与指定的确切参数值相匹配。 

请注意，期望本身是通过对模拟方法的独立调用来指定的。 

没有涉及特殊的 API 方法，这在其他模拟 API 中很常见。 

然而，此调用并不算是我们有兴趣测试的“真实”调用之一。 它的存在只是为了指定期望。

```java
@Test
void doBusinessOperationXyz(@Mocked Dependency mockInstance) {
   ...
   new Expectations() {{
      ...
      // An expectation for an instance method:
      mockInstance.someMethod(1, "test"); result = "mocked";
      ...
   }};

   // A call to code under test occurs here, leading to mock invocations
   // that may or may not match specified expectations.
}
```

在我们了解了记录、重放和验证调用之间的差异之后，我们稍后会看到更多关于期望的内容。

# 3 记录-重放-验证模型

任何开发人员测试都可以分为至少三个单独的执行阶段。 

这些阶段按顺序执行，一次一个，如下所示。

```java
@Test
void someTestMethod() {
   // 1. Preparation: whatever is required before the code under test can be exercised.
   ...
   // 2. The code under test is exercised, usually by calling a public method.
   ...
   // 3. Verification: whatever needs to be checked to make sure the code exercised by
   //    the test did its job.
   ...
}
```

首先，我们有一个准备阶段，在此阶段创建或从其他地方获取测试所需的对象和数据项。 然后，执行被测代码。 最后，将测试代码的运行结果与预期结果进行比较。

这种三阶段模型也称为 Arrange、Act、Assert 语法，简称“AAA”。 词不同，但意思是一样的。

在使用模拟类型（及其模拟实例）进行基于行为的测试的背景下，我们可以确定以下替代阶段，它们与前面描述的三个常规测试阶段直接相关：

记录阶段，在此期间可以记录调用。 这发生在测试准备期间，在执行我们要测试的调用之前。

重放阶段，在此期间，当测试的代码被执行时，感兴趣的模拟调用有机会被执行。 

现在将重放之前记录的对模拟方法/构造函数的调用。 

不过，记录和重播的调用之间通常不存在一对一的映射。

验证阶段，在此期间可以验证调用是否按预期发生。 

这发生在测试验证期间，在被测试的调用有机会被执行之后。

使用 JMockit 编写的基于行为的测试通常适合以下模板：

```java
import mockit.*;
... other imports ...

class SomeTest {
   // Zero or more "mock fields" common to all test methods in the class:
   @Mocked Collaborator mockCollaborator;
   @Mocked AnotherDependency anotherDependency;
   ...

   @Test
   void testWithRecordAndReplayOnly(mock parameters) {
      // Preparation code not specific to JMockit, if any.

      new Expectations() {{ // an "expectation block"
         // One or more invocations to mocked types, causing expectations to be recorded.
         // Invocations to non-mocked types are also allowed anywhere inside this block
         // (though not recommended).
      }};

      // Code under test is exercised.

      // Verification code (JUnit/TestNG assertions), if any.
   }

   @Test
   void testWithReplayAndVerifyOnly(mock parameters) {
      // Preparation code not specific to JMockit, if any.

      // Code under test is exercised.

      new Verifications() {{ // a "verification block"
         // One or more invocations to mocked types, causing expectations to be verified.
         // Invocations to non-mocked types are also allowed anywhere inside this block
         // (though not recommended).
      }};

      // Additional verification code, if any, either here or before the verification block.
   }

   @Test
   void testWithBothRecordAndVerify(mock parameters) {
      // Preparation code not specific to JMockit, if any.

      new Expectations() {{
         // One or more invocations to mocked types, causing expectations to be recorded.
      }};

      // Code under test is exercised.

      new VerificationsInOrder() {{ // an ordered verification block
         // One or more invocations to mocked types, causing expectations to be verified
         // in the specified order.
      }};

      // Additional verification code, if any, either here or before the verification block.
   }
}
```

上述模板还有其他变体，但本质是期望块属于记录阶段并且在执行被测代码之前出现，而验证块属于验证阶段。 

测试方法可以包含任意数量的期望块，也可以不包含。 验证块也是如此。

# 4 测试类的实例化和注入

在执行测试方法之前，将考虑在测试类中注释为 @Tested 的非最终实例字段进行自动实例化和注入。 

如果此时该字段仍然保留空引用，则将使用测试类的合适构造函数创建一个实例，同时确保其内部依赖项得到正确注入（如果适用）。

为了将模拟实例注入到被测试对象中，测试类还必须包含一个或多个声明为 @Injectable 的模拟字段或模拟参数。 

仅使用 @Mocked 或 @Capturing 注解的模拟字段/参数不考虑注入。 

另一方面，并非所有可注入字段/参数都需要具有可模拟类型； 它们还可以具有原始类型或数组类型。 

下面的示例测试类将进行演示。

```java
class SomeTest {
   @Tested CodeUnderTest tested;
   @Injectable Dependency dep1;
   @Injectable AnotherDependency dep2;
   @Injectable int someIntegralProperty = 123;

   @Test
   void someTestMethod(@Injectable("true") boolean flag, @Injectable("Mary") String name) {
      // Record expectations on mocked types, if needed.

      tested.exerciseCodeUnderTest();

      // Verify expectations on mocked types, if required.
   }
}
```

请注意，不可模拟的可注入字段/参数必须具有为其显式指定的值，否则将使用默认值。 

对于可注入字段，可以简单地将值分配给该字段。 

或者，可以在 @Injectable 的“value”属性中提供它，这是在可注入测试方法参数的情况下指定值的唯一方法。

支持两种形式的注入：构造函数注入和字段注入。 

在第一种情况下，被测试的类必须具有一个构造函数，该构造函数可以由测试类中提供的可注入和/或测试值来满足。 

请注意，对于给定的测试，可用的可注入/测试值集由声明为测试类的实例字段的可注入/测试字段集以及测试方法中声明的可注入/测试参数集组成； 

因此，同一测试类中的不同测试可以提供不同的值集以注入到同一测试对象中。

使用所选构造函数初始化测试类后，将考虑注入其剩余的未初始化非最终实例字段。 

对于要注入的每个此类字段，在测试类中搜索相同类型的可注入/已测试字段。 

如果只找到一个，则读取其当前值，然后将其存储在注入的字段中。 

如果有多个，则使用注入的字段名称在相同类型的可注入/测试字段之间进行选择。

# 5 记录期望结果

对于具有非 void 返回类型的给定方法，可以通过对结果字段的赋值来记录返回值。 

当该方法在重放阶段被调用时，指定的返回值将返回给调用者。 

对结果的赋值应该出现在标识记录期望的调用之后，位于期望块内。

如果测试需要在调用方法时抛出异常或错误，则仍然可以使用结果字段：只需为其分配所需的可抛出实例即可。 

请注意，要抛出的异常/错误的记录适用于模拟方法（任何返回类型）以及模拟构造函数。

通过调用 returns(v1, v2, ...) 方法，可以记录期望返回的多个连续值。 或者，可以通过为结果字段分配包含连续值的列表或数组来实现相同的效果。

以下示例测试记录了模拟 DependencyAbc 类的方法的两种类型的结果，以便在从 ClassUnderTest 调用它们时使用。 假设被测类的实现是这样的：

```java
public class ClassUnderTest {
   private final DependencyAbc abc = new DependencyAbc();

   public void doSomething() {
(1)   int n = abc.intReturningMethod();

      for (int i = 0; i < n; i++) {
         String s;

         try {
(2)         s = abc.stringReturningMethod();
         }
         catch (SomeCheckedException e) {
            // somehow handle the exception
         }

         // do some other stuff
      }
   }
}
```

对 doSomething() 方法的可能测试可以练习在任意次数的成功迭代后抛出 SomeCheckedException 的情况。 

假设我们想要记录这两个类之间交互的一组期望，我们可以编写下面的测试。

```java
@Tested ClassUnderTest cut;

@Test
void doSomethingHandlesSomeCheckedException(@Mocked DependencyAbc abc) throws Exception {
   new Expectations() {{
(1)   abc.intReturningMethod(); result = 3;

(2)   abc.stringReturningMethod();
      returns("str1", "str2");
      result = new SomeCheckedException();
   }};

   cut.doSomething();
}
```

这个测试记录了两个期望。 第一个指定 intReturningMethod() 在调用时将返回 3。 

第二个为 stringReturningMethod() 指定三个连续结果的序列，其中最后一个结果恰好是所需异常的实例，从而允许测试实现其目标。

# 6 参数值的灵活匹配

当模拟方法/构造函数具有一个或多个参数时，会记录/验证期望，例如 doSomething(1, "s", true); 仅当参数值相等时，才会匹配重播阶段的调用。 

对于常规对象（不是基元或数组）的参数，equals(Object) 方法用于相等性检查。 对于数组类型的参数，相等性检查扩展到单个元素； 

因此，每个维度具有相同长度且对应元素相等的两个不同数组实例被认为是相等的。

为了允许记录或验证的调用与具有不同参数值的一整套重播调用相匹配，我们可以指定灵活的参数匹配约束而不是实际的参数值。 

这是通过使用期望或验证块内部的 anyXyz 字段和/或 withXyz(...) 方法来完成的。

## 6.1 使用“任意”字段

最常用的参数匹配约束是那些简单地将调用与给定参数（正确的参数类型）的任何值进行匹配的约束。 

为此，我们有一整套特殊的参数匹配字段，一个用于每种基本类型（以及相应的包装类），一个用于字符串，一个“通用”对象类型。 

下面的测试演示了一些用途。

```java
@Tested CodeUnderTest cut;

@Test
void someTestMethod(@Mocked DependencyAbc abc) {
   DataItem item = new DataItem(...);

   new Expectations() {{
      // Will match "voidMethod(String, List)" invocations where the first argument is
      // any string and the second any list.
      abc.voidMethod(anyString, (List<?>) any);
   }};

   cut.doSomething(item);

   new Verifications() {{
      // Matches invocations to the specified method with any value of type long or Long.
      abc.anotherVoidMethod(anyLong);
   }};
}
```

“any”字段的使用必须出现在调用语句中的实际参数位置，而不是以前。 

不过，您仍然可以在同一调用中为其他参数使用常规参数值。 

## 6.2 使用“with”方法

记录或验证期望时，可以针对调用中传递的参数的任何子集调用 withXyz(...) 方法。 

它们可以与常规参数传递自由混合（使用文字值、局部变量等）。

唯一的要求是此类调用出现在记录/验证的调用语句内，而不是之前。 

例如，不可能首先将 withNotEqual(val) 的调用结果分配给局部变量，然后在调用语句中使用该变量。 

下面显示了使用一些“with”方法的示例测试。

```java
@Test
void someTestMethod(@Mocked DependencyAbc abc) {
   DataItem item = new DataItem(...);

   new Expectations() {{
      // Will match "voidMethod(String, List)" invocations with the first argument
      // equal to "str" and the second not null.
      abc.voidMethod("str", (List<?>) withNotNull());

      // Will match invocations to DependencyAbc#stringReturningMethod(DataItem, String)
      // with the first argument pointing to "item" and the second one containing "xyz".
      abc.stringReturningMethod(withSameInstance(item), withSubstring("xyz"));
   }};

   cut.doSomething(item);

   new Verifications() {{
      // Matches invocations to the specified method with any long-valued argument.
      abc.anotherVoidMethod(withAny(1L));
   }};
}
```

还有比上面显示的更多的“with”方法。 使用 IDE 的代码完成功能，并查阅 API 文档以获取更多详细信息。

除了 API 中可用的几个预定义参数匹配约束之外，JMockit 还允许用户通过 with(Delegate) 方法提供自定义约束。

# 7 指定调用计数约束

可以通过调用计数约束来指定期望和/或允许匹配给定期望的调用数量。 

有三个特殊字段专门用于此目的：times、minTimes 和 maxTimes。 

它们可以在记录或验证期望时使用。 

在任何一种情况下，与期望关联的方法或构造函数都将被限制为接收指定范围内的调用次数。 

任何调用分别小于或大于预期的下限或上限，测试执行将自动失败。 

让我们看一些示例测试。

```java
@Tested CodeUnderTest cut;

@Test
void someTestMethod(@Mocked DependencyAbc abc) {
   new Expectations() {{
      // By default, at least one invocation is expected, i.e. "minTimes = 1":
      new DependencyAbc();

      // At least two invocations are expected:
      abc.voidMethod(); minTimes = 2;

      // 1 to 5 invocations are expected:
      abc.stringReturningMethod(); minTimes = 1; maxTimes = 5;
   }};

   cut.doSomething();
}

@Test
void someOtherTestMethod(@Mocked DependencyAbc abc) {
   cut.doSomething();

   new Verifications() {{
      // Verifies that zero or one invocations occurred, with the specified argument value:
      abc.anotherVoidMethod(3); maxTimes = 1;

      // Verifies the occurrence of at least one invocation with the specified arguments:
      DependencyAbc.someStaticMethod("test", false); // "minTimes = 1" is implied
   }};
}
```

与结果字段不同，对于给定的期望，这三个字段中的每一个最多可以指定一次。 任何非负整数值对于任何调用计数约束都有效。 如果指定 times = 0 或 maxTimes = 0，则与重播期间发生的期望匹配的第一个调用（如果有）将导致测试失败。

# 8 显式验证-Explicit verification

除了指定记录期望的调用计数约束之外，我们还可以在调用被测代码之后在验证块中显式验证匹配的调用。

在“new Verifications() {...}”块中，我们可以使用与“new Expectations() {...}”块中可用的相同 API，但用于记录返回值和 抛出异常。 

也就是说，我们可以自由使用 anyXyz 字段、withXyz(...) 参数匹配方法以及 times、minTimes 和 maxTimes 调用计数约束字段。 

下面是一个示例测试。

```java
@Test
void verifyInvocationsExplicitlyAtEndOfTest(@Mocked Dependency mock) {
   // Nothing recorded here, though it could be.

   // Inside tested code:
   Dependency dependency = new Dependency();
   dependency.doSomething(123, true, "abc-xyz");

   // Verifies that Dependency#doSomething(int, boolean, String) was called at least once,
   // with arguments that obey the specified constraints:
   new Verifications() {{ mock.doSomething(anyInt, true, withPrefix("abc")); }};
}
```

请注意，默认情况下，验证会检查重放期间是否至少发生了一次匹配的调用。 

当我们需要验证确切的调用次数（包括 1 次）时，必须指定 times = n 约束。

## 8.1 按顺序验证

使用 Verifications 类创建的常规验证块是无序的。 

未验证重播阶段调用 aMethod() 和 anotherMethod() 的实际相对顺序，仅验证每个方法至少执行一次。 

如果要验证调用的相对顺序，则必须使用“new VerificationsInOrder() {...}”块。 

在此块内，只需按照预期发生的顺序编写对一个或多个模拟类型的调用即可。

```java
@Test
void verifyingExpectationsInOrder(@Mocked DependencyAbc abc) {
   // Somewhere inside the tested code:
   abc.aMethod();
   abc.doSomething("blah", 123);
   abc.anotherMethod(5);
   ...

   new VerificationsInOrder() {{
      // The order of these invocations must be the same as the order
      // of occurrence during replay of the matching invocations.
      abc.aMethod();
      abc.anotherMethod(anyInt);
   }};
}
```

请注意，测试中未验证调用 abc.doSomething(...)，因此它可能随时发生（或根本不发生）。

## 8.2 全面验证

有时可能需要验证测试中涉及的模拟类型/实例的所有调用。 

在这种情况下，“new FullVerifications() {...}”块将确保没有未验证的调用。

```java
@Test
void verifyAllInvocations(@Mocked Dependency mock) {
   // Code under test included here for easy reference:
   mock.setSomething(123);
   mock.setSomethingElse("anotherValue");
   mock.setSomething(45);
   mock.save();

   new FullVerifications() {{
      mock.setSomething(anyInt); // verifies two actual invocations
      mock.setSomethingElse(anyString);
      mock.save(); // if this verification (or any other above) is removed the test will fail
   }};
}
```

# 9 Delegates：指定自定义结果

为了根据重播时收到的参数来决定记录期望的结果，我们可以使用 Delegate 对象，如下例所示。

```java
@Tested CodeUnderTest cut;

@Test
void delegatingInvocationsToACustomDelegate(@Mocked DependencyAbc anyAbc) {
   new Expectations() {
      {
      anyAbc.intReturningMethod(anyInt, anyString);
      result = new Delegate() {
         int aDelegateMethod(int i, String s) {
            return i == 1 ? i : s.length();
         }
      };
   }
   };

   // Calls to "intReturningMethod(int, String)" will execute the delegate method above.
   cut.doSomething();
}
```

Delegate 接口是空的，仅用于告诉 JMockit 重播时的实际调用应委托给指定对象中的“delegate”方法。 

该方法可以有任何名称，只要它是委托对象中唯一的非私有方法。 

至于委托方法的参数，要么与记录方法的参数匹配，要么不存在。 

在任何情况下，委托方法都可以有一个 Invocation 类型的附加参数作为其第一个参数。 

重放期间接收到的调用对象将提供对调用实例和实际调用参数以及其他功能的访问。 

委托方法的返回类型不必与记录的方法相同，但它应该兼容以避免稍后出现 ClassCastException。

构造函数也可以通过委托方法来处理。 

以下示例测试显示构造函数调用被委托给有条件抛出异常的方法。

```java
@Test
void delegatingConstructorInvocations(@Mocked Collaborator anyCollaboratorInstance) {
   new Expectations() {
      {
      new Collaborator(anyInt);
      result = new Delegate() {
         void delegate(int i) { if (i < 1) throw new IllegalArgumentException(); }
      };
   }
   };

   // The first instantiation using "Collaborator(int)" will execute the delegate above.
   new Collaborator(4);
}
```

# 10 捕获调用参数以进行验证

可以通过一组特殊的“withCapture(...)”方法捕获调用参数以供以后验证。 

共有三种不同的情况，每种情况都有其特定的捕获方法：

- 在一次调用中验证传递给模拟方法的参数：T withCapture();

- 在多次调用中验证传递给模拟方法的参数：`T withCapture(List<T>)`;

- 验证传递给模拟构造函数的参数：`List<T> withCapture(T)`。

## 10.1 从单次调用中捕获参数

为了从对模拟方法或构造函数的单次调用中捕获参数，我们使用 withCapture()，如以下示例测试所示。

```java
@Test
void capturingArgumentsFromSingleInvocation(@Mocked Collaborator mock) {
   // Inside tested code:
   ...
   new Collaborator().doSomething(0.5, new int[2], "test");

   // Back in test code:
   new Verifications() {  
      double d;
      String s;
      mock.doSomething(d = withCapture(), null, s = withCapture());

      assertTrue(d > 0.0);
      assertTrue(s.length() > 1);
   }};
}
```

withCapture() 方法只能在验证块中使用。 

通常，我们在预期发生单个匹配调用时使用它； 但是，如果发生多次此类调用，则最后一次发生的调用将覆盖前一个调用捕获的值。 

它对于复杂类型的参数（例如 JPA @Entity）特别有用，该类型可能包含多个需要检查其值的项目。

## 10.2 从多次调用中捕获参数

如果需要多次调用模拟方法或构造函数，并且我们希望捕获所有这些方法或构造函数的值，则应使用 withCapture(List) 方法，如下例所示。

```java
{% raw %}
@Test
void capturingArgumentsFromMultipleInvocations(@Mocked Collaborator mock) {
   // Inside tested code:
   mock.doSomething(dataObject1);
   mock.doSomething(dataObject2);
   ...

   // Back in test code:
   new Verifications() {{
      List<DataObject> dataObjects = new ArrayList<>();
      mock.doSomething(withCapture(dataObjects));

      assertEquals(2, dataObjects.size());
      DataObject data1 = dataObjects.get(0);
      DataObject data2 = dataObjects.get(1);
      // Perform arbitrary assertions on data1 and data2.
   }};
}
{% endraw %}
```

与 withCapture() 不同的是，withCapture(List) 重载也可以用在期望记录块中。

## 10.3 捕获新实例

最后，我们可以捕获在测试期间创建的模拟类的新实例。

```java
{% raw %}
@Test
void capturingNewInstances(@Mocked Person mockedPerson) {
   // From the code under test:
   dao.create(new Person("Paul", 10));
   dao.create(new Person("Mary", 15));
   dao.create(new Person("Joe", 20));
   ...

   // Back in test code:
   new Verifications() {{
      // Captures the new instances created with a specific constructor.
      List<Person> personsInstantiated = withCapture(new Person(anyString, anyInt));

      // Now captures the instances of the same type passed to a method.
      List<Person> personsCreated = new ArrayList<>();
      dao.create(withCapture(personsCreated));

      // Finally, verifies both lists are the same.
      assertEquals(personsInstantiated, personsCreated);
   }};
}
{% endraw %}
```

# 11 级联模拟-Cascading mocks

当使用功能分布在许多不同对象中的复杂 API 时，经常会看到 obj1.getObj2(...).getYetAnotherObj().doSomething(...) 形式的链式调用。 

在这种情况下，可能需要模拟链中的所有对象/类，从 obj1 开始。

所有三个模拟注释都提供了这种能力。 

以下测试显示了一个使用 java.net 和 java.nio API 的基本示例。

```java
{% raw %}
@Test
void recordAndVerifyExpectationsOnCascadedMocks(
   @Mocked Socket anySocket, // will match any new Socket object created during the test
   @Mocked SocketChannel cascadedChannel // will match cascaded instances
) throws Exception {
   new Expectations() {{
      // Calls to Socket#getChannel() will automatically return a cascaded SocketChannel;
      // such an instance will be the same as the second mock parameter, allowing us to
      // use it for expectations that will match all cascaded channel instances:
      cascadedChannel.isConnected(); result = false;
   }};

   // Inside production code:
   Socket sk = new Socket(); // mocked as "anySocket"
   SocketChannel ch = sk.getChannel(); // mocked as "cascadedChannel"

   if (!ch.isConnected()) {
      SocketAddress sa = new InetSocketAddress("remoteHost", 123);
      ch.connect(sa);
   }

   InetAddress adr1 = sk.getInetAddress();  // returns a newly created InetAddress instance
   InetAddress adr2 = sk.getLocalAddress(); // returns another new instance
   ...

   // Back in test code:
   new Verifications() {{ cascadedChannel.connect((SocketAddress) withNotNull()); }};
}
{% endraw %}
```

在上面的测试中，对模拟 Socket 类中符合条件的方法的调用只要在测试期间发生，就会返回一个级联模拟对象。 

级联模拟将允许进一步级联，因此永远不会从返回对象引用的方法中获得空引用（除了不合格的返回类型 Object 或 String 将返回 null，或集合类型将返回非模拟空集合 ）。

除非模拟字段/参数中有可用的模拟实例（例如上面的cascadedChannel），否则将从第一次调用每个模拟方法时创建一个新的级联实例。 

在上面的示例中，具有相同 InetAddress 返回类型的两个不同方法将创建并返回不同的级联实例； 不过，相同的方法将始终返回相同的级联实例。

新的级联实例是使用@Injectable语义创建的，以免影响测试期间可能存在的相同类型的其他实例。

最后，值得注意的是，如果有必要，级联实例可以替换为非模拟实例、不同的模拟实例，或者根本不返回； 

为此，记录一个期望，该期望为结果字段分配要返回的所需实例，如果不需要这样的实例，则为 null。

## 11.1 级联静态工厂方法

在模拟类包含静态工厂方法的场景中，级联非常有用。 

在下面的示例测试中，假设我们要模拟 JSF (Java EE) 中的 javax.faces.context.FacesContext 类。

```java
{% raw %}
@Test
void postErrorMessageToUIForInvalidInputFields(@Mocked FacesContext jsf) {
   // Set up invalid inputs, somehow.

   // Code under test which validates input fields from a JSF page, adding
   // error messages to the JSF context in case of validation failures.
   FacesContext ctx = FacesContext.getCurrentInstance();

   if (some input is invalid) {
      ctx.addMessage(null, new FacesMessage("Input xyz is invalid: blah blah..."));
   }
   ...

   // Test code: verify appropriate error message was added to context.
   new Verifications() {{
      FacesMessage msg;
      jsf.addMessage(null, msg = withCapture());
      assertTrue(msg.getSummary().contains("blah blah"));
   }};
}
{% endraw %}
```

上面的测试中有趣的是，我们永远不必担心 FacesContext.getCurrentInstance()，因为“jsf”模拟实例会自动返回。

## 11.2 级联自返回方法

级联往往会有所帮助的另一种情况是，当被测试的代码使用“流畅的接口”时，“构建器”对象从其大多数方法中返回自身。 

因此，我们最终得到一个方法调用链，它产生一些最终的对象或状态。 

在下面的示例测试中，我们模拟了 java.lang.ProcessBuilder 类。

```java
{% raw %}
@Test
void createOSProcessToCopyTempFiles(@Mocked ProcessBuilder pb) throws Exception {
   // Code under test creates a new process to execute an OS-specific command.
   String cmdLine = "copy /Y *.txt D:\\TEMP";
   File wrkDir = new File("C:\\TEMP");
   Process copy = new ProcessBuilder().command(cmdLine).directory(wrkDir).inheritIO().start();
   int exit = copy.waitFor();
   ...

   // Verify the desired process was created with the correct command.
   new Verifications() {{ pb.command(withSubstring("copy")).start(); }};
}
{% endraw %}
```

上面，方法command(...)、directory(...)和inheritIO()配置了要创建的进程，而start()最终创建了它。 

模拟的流程构建器对象会自动从这些调用中返回自身（“pb”），同时还会从对 start() 的调用中返回一个新的模拟流程。

# 12 匹配特定实例的调用

之前，我们解释了模拟实例上记录的期望，例如“abc.someMethod();” 实际上会在模拟的 DependencyAbc 类的任何实例上匹配对 DependencyAbc#someMethod() 的调用。 

在大多数情况下，测试的代码使用给定依赖项的单个实例，因此这并不重要，并且可以安全地忽略，无论模拟实例是传递到测试中的代码还是在其中创建。 

但是，如果我们需要验证调用是否发生在特定实例上，以及测试代码中碰巧使用的多个实例之间，该怎么办？ 

另外，如果实际上应该模拟模拟类的一个或几个实例，而同一类的其他实例保持未模拟状态，该怎么办？ 

（当标准 Java 库或其他第三方库中的类被模拟时，第二种情况往往会更频繁地发生。）API 提供了一种模拟注释 @Injectable，它只会模拟被模拟类型的一个实例， 让其他人不受影响。 

此外，我们有几种方法来限制期望与特定 `@Mocked` 实例的匹配，同时仍然模拟模拟类的所有实例。

## 12.1 可注入的模拟实例

假设我们需要测试适用于给定类的多个实例的代码，其中一些我们想要模拟。 

如果要模拟的实例可以传递或注入到被测试的代码中，那么我们可以为其声明一个@Injectable模拟字段或模拟参数。 

这个 @Injectable 实例将是一个“独占”模拟实例； 相同模拟类型的任何其他实例，除非从单独的模拟字段/参数获取，否则将保留为常规的非模拟实例。

当使用 @Injectable 时，静态方法和构造函数也不会被模拟。 

毕竟，静态方法不与类的任何实例关联，而构造函数仅与新创建的（因此不同）实例关联。

举个例子，假设我们有下面的类要测试。

```java
public final class ConcatenatingInputStream extends InputStream {
   private final Queue<InputStream> sequentialInputs;
   private InputStream currentInput;

   public ConcatenatingInputStream(InputStream... sequentialInputs) {
      this.sequentialInputs = new LinkedList<InputStream>(Arrays.asList(sequentialInputs));
      currentInput = this.sequentialInputs.poll();
   }

   @Override
   public int read() throws IOException {
      if (currentInput == null) return -1;

      int nextByte = currentInput.read();

      if (nextByte >= 0) {
         return nextByte;
      }

      currentInput = sequentialInputs.poll();
      return read();
   }
}
```

通过使用 ByteArrayInputStream 对象进行输入，可以轻松地测试此类，而无需进行模拟，但假设我们要确保在构造函数中传递的每个输入流上正确调用 InputStream#read() 方法。 

下面的测试将实现这一点。

```java
{% raw %}
@Test
void concatenateInputStreams(@Injectable InputStream input1, @Injectable InputStream input2) throws Exception {
   new Expectations() {{
      input1.read(); returns(1, 2, -1);
      input2.read(); returns(3, -1);
   }};

   InputStream concatenatedInput = new ConcatenatingInputStream(input1, input2);
   byte[] buf = new byte[3];
   concatenatedInput.read(buf);

   assertArrayEquals(new byte[] {1, 2, 3}, buf);
}
{% endraw %}
```

请注意，这里确实需要使用 @Injectable，因为被测试的类扩展了模拟类，并且调用来执行 ConcatenatingInputStream 的方法实际上是在基类 InputStream 中定义的。 如果“正常”模拟 InputStream，则 read(byte[]) 方法将始终被模拟，无论调用它的实例如何。

## 12.2 声明多个模拟实例

当使用 `@Mocked` 或 `@Capturing`（而不是在同一模拟字段/参数上使用@Injectable）时，我们仍然可以将重放调用与特定模拟实例上记录的期望进行匹配。 

为此，我们只需声明相同模拟类型的多个模拟字段或参数，如下一个示例所示。

```java
{% raw %}
@Test
void matchOnMockInstance(@Mocked Collaborator mock, @Mocked Collaborator otherInstance) {
   new Expectations() {{ mock.getValue(); result = 12; }};

   // Exercise code under test with mocked instance passed from the test:
   int result = mock.getValue();
   assertEquals(12, result);

   // If another instance is created inside code under test...
   Collaborator another = new Collaborator();

   // ...we won't get the recorded result, but the default one:
   assertEquals(0, another.getValue());
}
{% endraw %}
```

仅当测试代码（为了简洁起见，这里嵌入到测试方法本身中）在进行记录调用的完全相同的实例上调用 getValue() 时，上述测试才会通过。 

当被测代码调用同一类型的两个或多个不同实例，并且测试想要验证特定调用是否发生在预期实例上时，这通常很有用。

## 12.3 使用给定构造函数创建实例

对于稍后将由被测代码创建的未来实例，我们可以通过一种方法来匹配对它们的调用以分离记录的期望（假设测试需要与所述实例不同的行为）。 

这是通过记录对模拟类的特定构造函数调用的期望，然后在记录对其实例方法的期望时简单地使用从此类“新”表达式获得的新实例来完成的。 

让我们看一个例子。

```java
@Test
void newCollaboratorsWithDifferentBehaviors(@Mocked Collaborator anyCollaborator) {
   // Record different behaviors for each set of instances:
   new Expectations() {{
      // One set, for instances created with "a value":
      Collaborator col1 = new Collaborator("a value");
      col1.doSomething(anyInt); result = 123;

      // Another set, for instances created with "another value":
      Collaborator col2 = new Collaborator("another value");
      col2.doSomething(anyInt); result = new InvalidStateException();
   }};

   // Code under test:
   new Collaborator("a value").doSomething(5); // will return 123
   ...
   new Collaborator("another value").doSomething(0); // will throw the exception
   ...
}
```

在上面的测试中，我们使用@Mocked声明所需类的模拟字段或模拟参数。 

然而，在记录期望时不使用该模拟字段/参数； 相反，我们使用在实例化记录上创建的实例来记录对实例方法的进一步期望。 

使用匹配的构造函数调用创建的未来实例将映射到那些记录的实例。 

另请注意，它不一定是一对一映射，而是多对一映射，从潜在的许多未来实例到用于记录期望的单个实例。

# 13 部分 mock

默认情况下，可以在模拟实例上调用的所有方法都会被模拟。 

这适用于大多数测试，但在某些情况下，我们可能需要仅选择要模拟的某些方法。 在其他模拟实例中未模拟的方法将在调用时正常执行。

当一个对象被部分模拟时，JMockit 根据记录的期望和未记录的期望来决定是否执行从被测代码调用的方法的实际实现。 

以下示例测试将对其进行演示。

```java
{% raw %}
class PartialMockingTest {
   static class Collaborator {
      final int value;

      Collaborator(int value) { this.value = value; }

      int getValue() { return value; }
      final boolean simpleOperation(int a, String b, Date c) { return true; }
      void doSomething() { ... }
   }

   @Test
   void partiallyMockingASingleInstance() {
      Collaborator collaborator = new Collaborator(2);

      new Expectations(collaborator) {{ // one or more instances to be partially mocked
         collaborator.getValue(); result = 123;
         collaborator.simpleOperation(1, "", null); result = false;
      }};

      // Mocked (instance methods recorded on one of the given instances):
      assertEquals(123, collaborator.getValue());
      assertFalse(collaborator.simpleOperation(1, "", null));

      // Not mocked (unrecorded instance methods, static methods, constructors, and different instances):
      collaborator.doSomething();
      assertEquals(45, new Collaborator(45).getValue());
   }
}
{% endraw %}
```

如上所示，Expectations(Object...) 构造函数接受一个或多个要部分模拟的对象。 

如果测试想要部分模拟类的构造函数和/或静态方法，则必须使用 MockUp（来自 Faking API）。

请注意，在此示例测试中没有模拟字段或模拟参数 - 因此，部分模拟构造函数有效地提供了另一种应用模拟的方法。

需要注意的是，当我们请求对一个实例进行部分模拟时，它也可以对其调用进行验证，即使验证的方法没有被记录。 

例如，考虑以下测试。

```java
{% raw %}
@Test
void partiallyMockingAnObjectJustForVerifications() {
   Collaborator collaborator = new Collaborator(123);

   new Expectations(collaborator) {};

   // No expectations were recorded, so nothing will be mocked.
   int value = collaborator.getValue(); // value == 123
   collaborator.simpleOperation(45, "testing", new Date());
   ...

   // Unmocked methods can still be verified:
   new Verifications() {{ c1.simpleOperation(anyInt, anyString, (Date) any); }};
}
{% endraw %}
```

最后，将部分模拟应用于测试类的一种更简单的方法是在测试类中将一个字段注释为@Tested（请参阅下面的部分）和@Mocked。 

在这种情况下，测试的对象不会传递给 Expectations 构造函数，但我们仍然需要记录对任何需要模拟结果的方法的期望。

# 14 模拟未指定的实现类

我们对此功能的讨论将基于下面的（人为的）代码。

```java
public interface Service { int doSomething(); }
final class ServiceImpl implements Service { public int doSomething() { return 1; } }

public final class TestedUnit {
   private final Service service1 = new ServiceImpl();
   private final Service service2 = new Service() { public int doSomething() { return 2; } };

   public int businessOperation() {
      return service1.doSomething() + service2.doSomething();
   }
}
```

我们要测试的方法businessOperation() 使用实现单独接口Service 的类。 

其中一种实现是通过匿名内部类定义的，客户端代码完全无法访问该内部类（除了使用反射）。

给定一个基类型（无论是接口、抽象类还是任何类型的基类），我们可以编写一个仅了解基类型但所有实现/扩展实现类都被模拟的测试。 

为此，我们声明一个“捕获”模拟类型，它仅引用已知的基类型。 

不仅 JVM 已经加载的实现类会被模拟，而且在以后的测试执行期间 JVM 碰巧加载的任何其他类也会被模拟。 

此功能由 `@Capturing` 注释激活，该注释可应用于模拟字段和模拟参数，如下所示。

```java
{% raw %}
final class UnitTest {
   @Capturing Service anyService;

   @Test
   void mockingImplementationClassesFromAGivenBaseType() {
      new Expectations() {{ anyService.doSomething(); returns(3, 4); }};

      int result = new TestedUnit().businessOperation();

      assertEquals(7, result);
   }
}
{% endraw %}
```

在上面的测试中，为 Service#doSomething() 方法指定了两个返回值。 

此期望将匹配对此方法的所有调用，无论调用发生在哪个实际实例上，也无论实现该方法的实际类如何。

# 参考资料

http://jmockit.github.io/tutorial/Mocking.html

* any list
{:toc}