---
layout: post
title: test mock-02-easymock 入门介绍
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [test, mock, sh]
published: true
---

# 拓展阅读

[test 之 jmockit-01-overview](https://houbb.github.io/2023/05/09/test-jmockit-01-overview)

[jmockit-01-test 之 jmockit 入门使用案例](https://houbb.github.io/2023/05/09/test-jmockit-00-intro)

[mockito-01-overview mockito 简介及入门使用](https://houbb.github.io/2023/05/09/test-mockito-01-overview)

[PowerMock](https://houbb.github.io/2017/10/27/powermock)

[Mock Server](https://houbb.github.io/2017/11/03/mock-server)

[ChaosBlade-01-测试混沌工程平台整体介绍](https://houbb.github.io/2023/08/08/jvm-chaosblade-01-overview)

[jvm-sandbox 入门简介](https://houbb.github.io/2020/06/04/jvm-sandbox-00-overview)

# 快速开始

翻译自官方：

被测试的类

```java
public class ClassTested {

  private Collaborator listener;

  public void setListener(Collaborator listener) {
    this.listener = listener;
  }

  public void addDocument(String title, String document) {
    listener.documentAdded(title);
  }
}
```

作为一个善良的人类，你想要测试你的实现。

你甚至可能是TDD（测试驱动开发）的信徒，尚未完成你的实现。你希望首先进行测试！

你的被测试类将依赖于其他类，因此你考虑到你需要一个模拟框架。

幸好你有这个想法。请将 EasyMock 的依赖添加到你的 POM 文件中。

```xml
<dependency>
  <groupId>org.easymock</groupId>
  <artifactId>easymock</artifactId>
  <version>5.2.0</version>
  <scope>test</scope>
</dependency>
```

好的。现在 `addDocument` 应该执行一些操作，然后通知一个依赖项。

我们称之为 `Collaborator`。

```java
public interface Collaborator {
    void documentAdded(String title);
```

现在，我要提醒一下。

在这个例子中，我将模拟一个接口。这并不意味着你只能模拟接口。我讨厌没用的接口。

而且你希望我开心。请不要仅仅为了模拟而创建接口。

只需模拟具体的类。谢谢。

所以，我们要确保 `addDocument` 通过调用带有正确标题参数的 `documentAdded` 来通知 `Collaborator`。我们的待办事项清单如下：

1. 创建模拟对象
2. 将模拟对象设置给被测试的类
3. 记录我们期望模拟对象执行的操作
4. 告诉所有模拟对象我们现在要进行实际测试
5. 进行测试
6. 确保所有应该被调用的都已经被调用

接下来是实现代码：

```java
import static org.easymock.EasyMock.*;
import org.easymock.*;
import org.junit.*;

public class ExampleTest extends EasyMockSupport {

    @Rule
    public EasyMockRule rule = new EasyMockRule(this);

    @Mock
    private Collaborator collaborator; // 1

    @TestSubject
    private ClassTested classUnderTest = new ClassTested(); // 2

    @Test
    public void addDocument() {
        collaborator.documentAdded("New Document"); // 3
        replayAll(); // 4
        classUnderTest.addDocument("New Document", "content"); // 5
        verifyAll(); // 6
    }
}
```

这就是你开始的全部需要。不过有一些建议：

- 扩展（或委托给）`EasyMockSupport` 是有用的，但不是强制的。它允许调用 `replayAll`，而不是 `replay(mock1, mock2, ...)` 之类的。
- 模拟对象的注入是在字段上完成的（通过 `EasyMockRule`），因此你不需要为测试而编写仅用于测试的 setter 方法。
- 我们正在测试 `documentAdded` 只调用一次，并接收到确切的参数。对模拟对象的任何其他调用都将导致测试失败。

从这里开始，我强烈建议你查看 EasyMock 的示例和完整文档，以对 EasyMock 有一个全面的了解。


# chat

## 详细介绍一下 easymock

EasyMock 是一个用于 Java 单元测试的 Mock 框架，它可以用于模拟对象和验证方法的调用。

下面是 EasyMock 的一些主要特点和使用方式的详细介绍：

### 特点：

1. **简单易用：** EasyMock 设计简洁，易于上手。它提供了直观的 API，使得开发人员可以轻松地创建和配置 Mock 对象。

2. **支持 Mock 对象的创建：** 使用 `EasyMock.createMock()` 方法可以创建一个 Mock 对象。Mock 对象将会模拟被测试类的行为，允许设置期望的方法调用和返回值。

3. **期望与回放阶段：** EasyMock 的操作分为期望（Expectation）阶段和回放（Replay）阶段。在期望阶段，设置对 Mock 对象的期望调用；在回放阶段，触发测试，验证 Mock 对象的实际调用是否与期望一致。

4. **支持匹配器（Matcher）：** EasyMock 提供了强大的匹配器，使得测试可以更加灵活地匹配方法的参数。例如，可以使用 `EasyMock.eq()` 来匹配参数的值。

5. **验证调用次数：** EasyMock 允许验证方法调用的次数，包括零次、一次、多次等。这有助于确保方法的调用满足预期。

6. **支持 Mock 对象的重播：** 在 EasyMock 中，Mock 对象可以被重播，即允许多次的期望和验证。这在某些测试场景中很有用。

### 使用示例：

以下是一个简单的 EasyMock 使用示例，假设有一个 `Calculator` 类：

```java
import org.easymock.EasyMock;
import org.junit.Test;

public class CalculatorTest {

    @Test
    public void testAddition() {
        // 创建 Mock 对象
        Calculator mockCalculator = EasyMock.createMock(Calculator.class);

        // 设置期望调用
        EasyMock.expect(mockCalculator.add(2, 3)).andReturn(5);

        // 进入回放阶段
        EasyMock.replay(mockCalculator);

        // 执行测试
        CalculatorClient calculatorClient = new CalculatorClient(mockCalculator);
        int result = calculatorClient.performAddition(2, 3);

        // 验证期望的调用
        EasyMock.verify(mockCalculator);

        // 断言结果
        assertEquals(5, result);
    }
}
```

在这个例子中，`Calculator` 类的 `add` 方法被模拟，然后设置了一个期望的调用。

在回放阶段，执行测试，并最后验证期望的调用是否发生。这个例子展示了 EasyMock 的基本用法。

EasyMock 是一个轻量级且功能强大的 Mock 框架，适用于简单到复杂的单元测试场景。

需要注意的是，EasyMock 在 Java 单元测试中广泛使用，但在一些高级场景中，可能会需要更强大的功能，此时可以考虑使用类似于 PowerMock 的扩展框架。

## 给出 easymock 的学习资料，包含官方，给出网址

EasyMock 的官方网址是 [https://easymock.org/](https://easymock.org/)。

在该网站上，你可以找到官方文档、示例代码、下载链接等资源，以便更深入地学习和使用 EasyMock。

以下是 EasyMock 的一些学习资料：

1. **官方文档：**
   - [EasyMock Documentation](https://easymock.org/documentation.html)
   - 官方文档提供了详细的 EasyMock 使用说明，包括基本概念、API 文档、示例等。

2. **示例和教程：**
   - [EasyMock Examples](https://easymock.org/user-guide.html#examples)
   - 官方网站提供了一些示例和教程，帮助你更好地理解 EasyMock 的使用方法。

3. **GitHub 仓库：**
   - [EasyMock GitHub Repository](https://github.com/easymock/easymock)
   - EasyMock 的源代码托管在 GitHub 上，你可以查看源代码、提交 issue 或贡献代码。

4. **用户指南：**
   - [EasyMock User Guide](https://easymock.org/user-guide.html)
   - 用户指南包含了详细的使用说明，适用于各种测试场景。它涵盖了 EasyMock 的基本概念、高级特性和最佳实践。

5. **社区支持：**
   - [EasyMock Mailing List](https://sourceforge.net/projects/easymock/lists/easymock-users)
   - [EasyMock on Stack Overflow](https://stackoverflow.com/questions/tagged/easymock)
   - 你可以在 EasyMock 的邮件列表和 Stack Overflow 上找到其他用户的问题和解答，以及与社区成员进行交流。

这些资料将帮助你入门 EasyMock，并深入了解如何在 Java 单元测试中使用它。

记得随时查看官方文档和社区资源，以获取最新信息和帮助。

## easymock 和其他的 java mock 框架对比有什么优势吗？

EasyMock 是众多 Java Mock 框架中的一种，与其他框架相比，它有一些优势和特点。

下面是 EasyMock 相对于其他 Java Mock 框架的一些优势：

1. **简单易用：** 如其名，EasyMock 被设计成简单易用，入门门槛较低。其清晰的 API 和直观的语法使得编写和理解测试用例更加容易。

2. **强大的录制和回放功能：** EasyMock 提供了明确的录制（Record）和回放（Replay）阶段，使得测试编写变得直观。这有助于清晰定义期望行为，并在测试过程中验证这些期望。

3. **Mocking 接口和类：** EasyMock 不仅支持对接口的模拟，还能够模拟具体的类。这在一些场景下非常有用，尤其是在现有代码中需要进行单元测试时。

4. **Matcher 的丰富支持：** EasyMock 提供了丰富的匹配器（Matcher），用于灵活匹配方法参数。这使得测试用例更加灵活且易于维护。

5. **Mock 对象的可维护性：** EasyMock 允许通过继承 `EasyMockSupport` 类来简化测试的设置和验证。这有助于减少测试代码的重复和提高可维护性。

6. **规避不必要的接口：** 文档中提到了对不必要的接口的反感，强调了不必为了测试而专门创建接口。这种实用主义的设计哲学可能受到一些开发者的欢迎。

需要注意的是，每个 Mock 框架都有其适用的场景和偏好，而选择框架通常取决于团队的经验、项目的需求以及个人的喜好。其他常见的 Java Mock 框架还包括 Mockito、PowerMock、JMockit 等，它们在一些方面可能提供了不同的特性和优势。在实际应用中，可以根据具体的项目需求和团队背景选择适合的框架。

## 详细介绍一下 easymock 中 的录制（Record）和回放（Replay）

在 EasyMock 中，录制（Record）和回放（Replay）是两个关键的阶段，用于定义期望的模拟行为并在测试执行时验证这些期望。

以下是 EasyMock 中录制和回放的详细介绍：

### 录制阶段（Record）：

1. **创建 Mock 对象：** 使用 EasyMock 的 `createMock` 方法创建一个 Mock 对象。这个对象将模拟被测类的行为。

   ```java
   Collaborator collaboratorMock = EasyMock.createMock(Collaborator.class);
   ```

2. **设置期望的调用：** 在录制阶段，通过 EasyMock 的 API 设置对 Mock 对象的期望调用，包括方法调用和返回值。

   ```java
   EasyMock.expect(collaboratorMock.documentAdded("Title")).andReturn(true);
   ```

   上述代码表示期望 `documentAdded` 方法被调用，并且传递参数 "Title"，并且设置返回值为 `true`。

3. **结束录制：** 在录制完成后，通过调用 `EasyMock.replay(collaboratorMock)` 进入回放阶段。这表示录制阶段结束，模拟对象已经准备好被测试使用。

   ```java
   EasyMock.replay(collaboratorMock);
   ```

### 回放阶段（Replay）：

1. **执行测试：** 在回放阶段，执行被测试类的方法。这些方法会调用之前在录制阶段设置的 Mock 对象的方法。

   ```java
   testedClass.addDocument("Title", "Content");
   ```

2. **验证期望的调用：** 在测试执行完成后，通过调用 `EasyMock.verify(collaboratorMock)` 来验证 Mock 对象的期望调用是否被满足。

   ```java
   EasyMock.verify(collaboratorMock);
   ```

   如果有任何未满足的期望调用，此时会抛出 `AssertionError`，表示测试失败。

### 示例：

下面是一个完整的示例，演示了录制和回放的过程：

```java
public class ExampleTest {

    @Test
    public void testAddDocument() {
        // 创建 Mock 对象
        Collaborator collaboratorMock = EasyMock.createMock(Collaborator.class);

        // 设置期望的调用
        EasyMock.expect(collaboratorMock.documentAdded("Title")).andReturn(true);

        // 进入回放阶段
        EasyMock.replay(collaboratorMock);

        // 执行测试
        TestedClass testedClass = new TestedClass(collaboratorMock);
        testedClass.addDocument("Title", "Content");

        // 验证期望的调用
        EasyMock.verify(collaboratorMock);
    }
}
```

在这个示例中，`documentAdded` 方法的期望调用被设置为 "Title"，并在测试中验证了这个期望调用。

这是一个简单的录制和回放的例子，更复杂的场景可能涉及到不同的期望调用和参数匹配器。

# 参考资料

https://easymock.org/getting-started.html

* any list
{:toc}
