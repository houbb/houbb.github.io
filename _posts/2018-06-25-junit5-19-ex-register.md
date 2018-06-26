---
layout: post
title:  Junit5-19-Ex Register Extension
date:  2018-06-26 13:50:48 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 注册拓展

可以通过@ExtendWith以声明方式注册，可以通过@RegisterExtension以编程方式注册，也可以通过Java的ServiceLoader机制自动注册。

# 声明扩展注册

开发人员可以通过使用 `@ExtendWith(…)` 对测试接口、测试类、测试方法或自定义组合注释进行声明式注册一个或多个扩展，并为要注册的扩展提供类引用。

- 指定单个方法

例如，要为一个特定的测试方法注册一个自定义的 RandomParametersExtension，您可以按照以下方式注释这个测试方法。

```java
@ExtendWith(RandomParametersExtension.class)
@Test
void test(@Random int i) {
    // ...
}
```

- 指定整个类

要为一个特定类及其子类中的所有测试注册一个定制的RandomParametersExtension，您可以按照以下方式注释这个测试类。

```java
@ExtendWith(RandomParametersExtension.class)
class MyTests {
    // ...
}
```

- 多个扩展

```java
@ExtendWith({ FooExtension.class, BarExtension.class })
class MyFirstTests {
    // ...
}
```

作为替代方案，多个扩展可以像这样分别注册:

```java
@ExtendWith(FooExtension.class)
@ExtendWith(BarExtension.class)
class MySecondTests {
    // ...
}
```

## 扩展登记顺序

通过@ExtendWith以声明的方式注册的扩展将**按照在源代码中声明的顺序执行**。

例如，MyFirstTests和MySecondTests中的测试执行都将由FooExtension和BarExtension扩展，其顺序完全相同。

# 编程扩展注册

开发人员可以通过使用 `@RegisterExtension` 在测试类中注释字段来以编程方式注册扩展。

当扩展通过@ExtendWith以声明的方式注册时，通常只能通过注解进行配置。
相反，当扩展通过@RegisterExtension注册时，可以通过编程方式配置它——例如，为了将参数传递给扩展的构造函数、静态工厂方法或构建器API。

> 注意

@RegisterExtension 字段不能是 private 或 null(在评估时)，但是可以是静态的，也可以是非静态的。

## 静态字段

如果@RegisterExtension字段是静态的，那么扩展将在通过@ExtendWith在类级注册的扩展之后被注册。

这种静态扩展并不局限于它们可以实现的扩展api。

因此，通过静态字段注册的扩展可以实现类级和实例级扩展api，如BeforeAllCallback、AfterAllCallback、TestInstancePostProcessor以及方法级扩展api，如BeforeEachCallback等。

在下面的示例中，通过使用WebServerExtension支持的构建器模式以编程方式初始化测试类中的服务器字段。

配置好的WebServerExtension将被自动注册为类级别的扩展——例如，为了在类中的所有测试之前启动服务器，然后在类中的所有测试完成之后停止服务器。

此外，使用@BeforeAll或@AfterAll注释的静态生命周期方法以及@BeforeEach、@AfterEach和@Test方法可以在必要时通过服务器字段访问扩展的实例。

```java
class WebServerDemo {

    @RegisterExtension
    static WebServerExtension server = WebServerExtension.builder()
        .enableSecurity(false)
        .build();

    @Test
    void getProductList() {
        WebClient webClient = new WebClient();
        String serverUrl = server.getServerUrl();
        // Use WebClient to connect to web server using serverUrl and verify response
        assertEquals(200, webClient.get(serverUrl + "/products").getResponseStatus());
    }
}
```

## 实例化字段(Instance Fields)

如果@RegisterExtension字段是非静态的(例如。在测试类被实例化后，在每个注册的TestInstancePostProcessor有机会对测试实例进行后处理之后(潜在地将扩展的实例注入到带注释的字段中)，扩展将被注册。

因此，如果这样的实例扩展实现了类级或实例级的扩展api，比如BeforeAllCallback、AfterAllCallback或TestInstancePostProcessor，那么这些api就不会受到重视。

默认情况下，实例扩展将在通过@ExtendWith在方法级别注册的扩展之后注册;
但是，如果测试类配置为 `@TestInstance(Lifecycle.PER_CLASS)` 语义，则在通过@ExtendWith在方法级注册的扩展名之前注册一个实例扩展名。

在下面的示例中，通过调用自定义lookUpDocsDir()方法并将结果提供给DocumentationExtension中的静态forPath() factory方法，以编程方式初始化测试类中的docs字段。配置的DocumentationExtension将被自动注册为方法级别的扩展。此外，如果需要，@BeforeEach、@AfterEach和@Test方法可以通过docs字段访问扩展的实例。

- DocumentationDemo.java

```java
class DocumentationDemo {

    static Path lookUpDocsDir() {
        // return path to docs dir
    }

    @RegisterExtension
    DocumentationExtension docs = DocumentationExtension.forPath(lookUpDocsDir());

    @Test
    void generateDocumentation() {
        // use this.docs ...
    }
}
```

# 自动扩展注册

除了使用注释声明扩展注册和编程扩展注册支持之外，JUnit Jupiter还通过Java的 `java.util.ServiceLoader`机制支持全局扩展注册。

允许根据类路径中可用的内容自动检测和自动注册第三方扩展。

具体地说，可以通过在一个名为 `org.junit.jupiter.api.extension.Extension` 的文件中提供其完全限定的类名来注册一个自定义扩展。

扩展名在 **/META-INF/services** 文件夹中，在它所包含的JAR文件中。

## 开启自动扩展注册

自动检测是一个高级功能，因此默认情况下不启用。要启用它，只需设置 `junit.jupiter.extensions.autodetection.enabled `启用配置参数为true。

可以将其作为JVM系统属性提供，作为传递给启动程序的LauncherDiscoveryRequest中的配置参数，或者通过JUnit平台配置文件(详细信息请参见配置参数)。

例如，要启用扩展的自动检测，可以使用以下系统属性启动JVM。

```
-Djunit.jupiter.extensions.autodetection.enabled = true
```

当启用自动检测时，通过ServiceLoader机制发现的扩展将在JUnit Jupiter的全局扩展(例如，对TestInfo、TestReporter等的支持)之后添加到扩展注册表中。

## 扩展继承

通过自顶向下的语义在测试类层次结构中继承已注册的扩展。
类似地，在类级注册的扩展在方法级继承。
此外，特定的扩展实现只能为给定的扩展上下文及其父上下文注册一次。

因此，**任何注册重复扩展实现的尝试都将被忽略**。

* any list
{:toc}