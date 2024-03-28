---
layout: post
title: test 之 jmockit-01-overview 概览
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


# intro

该工具包作为部署到 Maven 中央存储库的一组工件提供。 

需要 Java 7 或更高版本来执行测试； 测试必须使用 JUnit 或 TestNG。 

有关如何将库添加到 Java 项目的说明，请参阅使用 JMockit 运行测试。

在本教程中，我们借助示例测试（使用 Java 8）检查库中可用的 API。 

中央 API（单个注释）为要测试的对象的自动实例化和初始化提供支持。 

然后我们有模拟 API（也称为“期望”API），用于使用模拟依赖项的测试。 

最后，还有一个小型伪造 API（又名“Mockups”API），可用于创建和应用伪造实现，从而避免外部组件的全部成本。

尽管本教程相当完整，但它并不试图详细介绍整个已发布的 API。 API 文档提供了所有注释、类、方法等的完整且详细的规范。 

“jmockit-1.x-sources.jar”库文件（可从 Maven 中央存储库下载）包含 Java 源文件（带有 Javadoc 注释），以便从 Java IDE 轻松访问 API 源代码和文档。

单独的一章介绍了代码覆盖率工具。

# 1 自动化开发人员测试和测试隔离

自动化开发人员测试是由开发人员自己编写的，用于测试他们自己的代码。 

它们通常是在测试框架的帮助下编写的，例如 JUnit 或 TestNG； JMockit 两者都支持。

自动化开发人员测试可以分为两大类，无论它们是针对单个程序“单元”、多个一起工作的此类单元，还是被测系统的整个“切片”（“SUT”）。

单元测试，旨在与系统的其余部分隔离地测试类或组件。

集成测试，旨在测试包含单元及其依赖项（与被测单元交互的其他类/组件）的系统操作。 

此类测试的范围从通过应用程序 UI 运行的端到端系统测试（当 SUT 有 UI 时）到执行一小组相互关联的单元的测试。 

在这里，我们对皮下测试特别感兴趣，这些测试不是通过应用程序 UI 执行的，而是测试有意义的业务场景中涉及的所有程序单元。

尽管皮下测试包括多个单元之间的交互，但特定测试可能对锻炼所涉及的所有组件、层或子系统不感兴趣。 

然后，系统的这些部分可能会被“模拟”（或伪造），以便被测试的代码与它们隔离运行。 

因此，将被测代码与系统的某些部分隔离的能力通常在各种测试中都很有用。 

也就是说，一般来说，最好尽可能“现实”地进行测试。 

因此，理想情况下，应将嘲笑和/或伪造的使用保持在最低限度。

# 2 使用模拟对象进行测试

隔离测试代码的一种常见且强大的技术是使用“模拟”。 

传统上，模拟对象是专门为单个测试或一组相关测试实现的类的实例。 

该实例被传递给正在测试的代码以取代其依赖项之一。 

每个模拟对象的行为都符合被测代码和使用它的测试所期望的方式，以便所有测试都能通过。

**JMockit 超越了传统的模拟对象，允许直接在“真实”（非模拟）类上模拟方法和构造函数，从而无需在测试中实例化模拟对象并将其传递给被测代码；** 

相反，只要在真实类上调用方法或构造函数，由被测代码创建的对象就会执行测试定义的模拟行为。 

当模拟一个类时，现有方法/构造函数的原始实现会暂时替换为模拟实现，通常是在单个测试期间。 

这种模拟方法不仅适用于公共实例方法，还适用于最终方法和静态方法以及构造函数。

# 3 例子

考虑一个业务服务类，它通过以下步骤提供业务操作：

- 找到操作所需的某些持久实体

- 保留新实体的状态

- 向感兴趣的各方发送通知电子邮件

前两个步骤需要访问应用程序数据库，这是通过持久性子系统（本身使用 JPA）的简化 API 来完成的。 第三个可以通过用于发送电子邮件的第三方 API 来实现，在本例中是 Apache 的 Commons Email 库。

因此，服务类具有两个独立的依赖项，一个用于持久性，另一个用于电子邮件。 

为了测试业务操作，我们依靠 JMockit 的 JPA 支持来处理持久性，同时模拟电子邮件 API。 

工作解决方案的完整源代码（包含所有测试）可在线获取。

```java
package tutorial.domain;

import java.math.*;
import java.util.*;
import org.apache.commons.mail.*;
import static tutorial.persistence.Database.*;

public final class MyBusinessService
{
   private final EntityX data;

   public MyBusinessService(EntityX data) { this.data = data; }

   public void doBusinessOperationXyz() throws EmailException {
      List<EntityX> items =
(1)      find("select item from EntityX item where item.someProperty = ?1", data.getSomeProperty());

      // Compute or obtain from another service a total value for the new persistent entity:
      BigDecimal total = ...
      data.setTotal(total);

(2)   persist(data);

      sendNotificationEmail(items);
   }

   private void sendNotificationEmail(List<EntityX> items) throws EmailException {
      Email email = new SimpleEmail();
      email.setSubject("Notification about processing of ...");
(3)   email.addTo(data.getCustomerEmail());

      // Other e-mail parameters, such as the host name of the mail server, have defaults defined
      // through external configuration.

      String message = buildNotificationMessage(items);
      email.setMsg(message);

(4)   email.send();
   }

   private String buildNotificationMessage(List<EntityX> items) { ... }
}
```

Database 类仅包含静态方法和私有构造函数； find 和 persist 方法应该是显而易见的，所以我们不会在这里列出它们。

那么，我们如何在不对现有应用程序代码进行任何更改的情况下测试“doBusinessOperationXyz”方法呢？ 

在下面的 JUnit 测试类中，每个测试都将验证持久性操作的正确执行以及对电子邮件 API 的预期调用。 

这些验证点是如上所述编号为(1)-(4)的验证点。

```java
{% raw %}
package tutorial.domain;

import org.apache.commons.mail.*;
import static tutorial.persistence.Database.*;

import org.junit.*;
import org.junit.rules.*;
import static org.junit.Assert.*;
import mockit.*;

public final class MyBusinessServiceTest
{
   @Rule public final ExpectedException thrown = ExpectedException.none();

   @Tested final EntityX data = new EntityX(1, "abc", "someone@somewhere.com");
   @Tested(fullyInitialized = true) MyBusinessService businessService;
   @Mocked SimpleEmail anyEmail;

   @Test
   public void doBusinessOperationXyz() throws Exception {
      EntityX existingItem = new EntityX(1, "AX5", "abc@xpta.net");
(1)   persist(existingItem);

      businessService.doBusinessOperationXyz();

(2)   assertNotEquals(0, data.getId()); // implies "data" was persisted
(4)   new Verifications() {{ anyEmail.send(); times = 1; }};
   }

   @Test
   public void doBusinessOperationXyzWithInvalidEmailAddress() throws Exception {
      String email = "invalid address";
      data.setCustomerEmail(email);
(3)   new Expectations() {{ anyEmail.addTo(email); result = new EmailException(); }};
      thrown.expect(EmailException.class);

      businessService.doBusinessOperationXyz();
   }
}
{% endraw %}
```

该示例测试使用了 JMockit API 中的几个注释。 

`@Tested` 负责设置要测试的正确初始化的对象，而 `@Mocked` 将模拟应用于给定类型。

正如测试中所示，期望的记录（在新的 `Expectations() { ... }` 块内）和验证（在新的 `Verifications() { ... }` 块内）只需通过以下方式即可实现 从记录或验证块内部的模拟类型/实例上调用所需的方法（以及构造函数，即使此处未显示）。 

在记录期间通过“结果”字段指定被测试代码执行的匹配调用返回的值（或抛出的异常）。 

可以在记录时或验证时通过 API 字段分配（如“times = 1”）指定调用计数约束。

# 4 使用 JMockit 运行测试

要运行使用任何 JMockit API 的测试，请按照通常的方式使用 Java IDE、Maven/Gradle 构建脚本等。 

原则上，可以使用 Windows、Mac OS X 或 Linux 上的任何版本 1.7 或更高版本的 JDK。 

JMockit 支持（并要求）使用 JUnit（版本 4 或 5）或 TestNG； 具体来说，您需要：

将 jmockit 依赖项/jar 添加到测试类路径。

配置测试执行 JVM 以使用 `-javaagent:<proper path>/jmockit.1.x.jar` 初始化参数启动。 

它可以在 Maven 或 Gradle 等工具的构建脚本文件中指定，或者在 IntelliJ IDEA 或 Eclipse 的“运行/调试配置”中指定。

## 4.1 从 Maven 运行测试

JMockit 工件位于中央 Maven 存储库中。 要在测试套件中使用它们，请将以下内容添加到您的 pom.xml 文件中：

```xml
<dependencies>
   <dependency>
      <groupId>org.jmockit</groupId>
      <artifactId>jmockit</artifactId>
      <version>${jmockit.version}</version>
      <scope>test</scope>
   </dependency>
</dependencies>
```

确保指定的版本（此处在“jmockit.version”属性中指定）是您真正想要的版本。 

在开发历史页面中查找当前版本。 

JMockit还需要使用-javaagent JVM初始化参数； 使用Maven Surefire插件进行测试执行时，指定如下：

```xml
<plugins>
   <plugin>
      <artifactId>maven-surefire-plugin</artifactId>
      <version>2.22.2</version> <!-- or some other version -->
      <configuration>
         <argLine>
            -javaagent:"${settings.localRepository}"/org/jmockit/jmockit/${jmockit.version}/jmockit-${jmockit.version}.jar
         </argLine>
      </configuration>
   </plugin>
</plugins>
```

## 4.2 从 Gradle 运行测试

Gradle 还将从 mavenCentral() 存储库下载必要的工件。 

在 gradle.build 文件中，添加 jmockit 依赖项和测试配置，并根据需要替换所需版本号：

```js
repositories {
    mavenCentral()
}

def jmockitVersion = '1.xy'

dependencies {
   ... "compile" dependencies ...
   testImplementation "org.jmockit:jmockit:$jmockitVersion"
}

test {
    jvmArgs "-javaagent:${classpath.find { it.name.contains("jmockit") }.absolutePath}"
}
```

# 参考资料

http://jmockit.github.io/tutorial/Introduction.html

* any list
{:toc}