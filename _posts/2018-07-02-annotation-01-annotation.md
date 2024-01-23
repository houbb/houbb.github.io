---
layout: post
title:  Annotation-01-annotation
date:  2018-07-02 17:07:11 +0800
categories: [Java]
tags: [java, annotation]
published: true
---

# Java 注解

注解，元数据的一种形式，提供了程序本身之外的数据。注释对注释的代码的操作没有直接影响。

注解有许多用途，其中包括:

- 编译器的信息—编译器可以使用注释来检测错误或抑制警告。

- 编译时和部署时处理——软件工具可以处理注释信息来生成代码、XML文件等等。

- 运行时处理——可以在运行时检查一些注释。

这节课,还可以使用注释解释道,如何应用注释,在Java平台中可用的预定义的注释类型,标准版(Java SE API),如何使用类型annnotations结合可插入类型系统与强类型检查编写代码,以及如何实现重复注释。

# 注解

注解（Annotations）是一种元数据形式，提供有关程序的数据，而这些数据并不是程序本身的一部分。

> [注解文档](https://docs.oracle.com/javase/tutorial/java/annotations/index.html)

## 基础知识

- 注解的格式

@ 符号表示紧随其后的是一个注解，例如 `@Override`。

- 注解可以使用的位置

注解可以应用于声明，包括类、字段、方法和其他程序元素的声明。

## 声明一个注解类型

- 你可以定义一个注解类型如下

```java
public @interface AuthorInfo {
    String author() default "houbb";
    String date();
}
```

- 并且使用它

```java
@AuthorInfo(date = "2016-06-04 22:58:46")
public void testAuthorInfo() {

}
```

<label class="label label-info">注意</label>

为了使 @AuthorInfo 中的信息出现在 Javadoc 生成的文档中，必须使用 **@Documented** 注解来注解 @AuthorInfo 的定义。

## 预定义的注解类型

应用于其他注解的注解称为元注解。在 `java.lang.annotation` 中定义了几种元注解类型。

### @Retention

> @Retention 注解指定了被标注的注解如何存储：

- RetentionPolicy.SOURCE – 被标注的注解仅在源代码级别保留，不会被编译器记录。
- RetentionPolicy.CLASS – 被标注的注解被编译器记录在 class 文件中，但在运行时会被忽略。
- RetentionPolicy.RUNTIME – 被标注的注解被 JVM 保留，因此可以被运行时环境使用。

### @Target

> @Target 注解标记了另一个注解，以限制注解可以应用于哪种类型的 Java 元素。

- ElementType.ANNOTATION_TYPE 可以应用于注解类型。
- ElementType.CONSTRUCTOR 可以应用于构造函数。
- ElementType.FIELD 可以应用于字段或属性。
- ElementType.LOCAL_VARIABLE 可以应用于局部变量。
- ElementType.METHOD 可以应用于方法级别的注解。
- ElementType.PACKAGE 可以应用于包声明。
- ElementType.PARAMETER 可以应用于方法的参数。
- ElementType.TYPE 可以应用于类的任何元素。

## 类型注解和可插拔类型系统

类型注解被创建以支持对 Java 程序进行更好分析的方式，以确保更强的类型检查。

> [checker-framework](http://types.cs.washington.edu/checker-framework/)


# Inherited

## 注解解释

指示注解类型被自动继承。

如果在注解类型声明中存在 Inherited 元注解，并且用户在某一类声明中查询该注解类型，同时该类声明中没有此类型的注解，则将在该类的超类中自动查询该注解类型。
此过程会重复进行，直到找到此类型的注解或到达了该类层次结构的顶层 (Object) 为止。如果没有超类具有该类型的注解，则查询将指示当前类没有这样的注解。 

> 注意

如果使用注解类型注解类以外的任何事物，此元注解类型都是无效的。还要注意，此元注解仅促成从超类继承注解；对已实现接口的注解无效。 

## 注解定义

- @Testable

```java
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.ElementType.TYPE;

@Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
@Target({METHOD, TYPE})
@Inherited
public @interface Testable {
}
```

- @XTest

```java
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.ElementType.TYPE;

@Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
@Target({METHOD, TYPE})
@Testable
public @interface XTest {
    String dataProvider() default "";
}
```

## 实例

- BaseInheritTest.java

```java
import com.ryo.jdk.annotation.annotation.Testable;

@Testable
public class BaseInheritTest {
}
```

- InheritTest.java

```java
import com.ryo.jdk.annotation.annotation.Testable;
import com.ryo.jdk.annotation.annotation.XTest;

import org.junit.Assert;
import org.junit.Test;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.Arrays;

public class InheritTest extends BaseInheritTest {

    @Test
    public void inheritTest() {
        Testable testable = InheritTest.class.getAnnotation(Testable.class);
        Assert.assertNotNull(testable);
    }

}
```

> 注意

这里 `InheritTest extends BaseInheritTest`，虽然当前类没有实现 `@Testable`，但是其父类实现了改注解，会继承给子类。

# 注解的组合

在学习 Junit5/Spring 的时候，会发现框架中的注解可以用户自行组合成全新的注解，然后仍然可以被框架识别。

如何做到的呢？

## 初期思路

```java
@XTest
public void annotationsTest() {
}
public static void main(String[] args) {
    Method[] methods = InheritTest.class.getDeclaredMethods();
    for(Method method : methods) {
        if("annotationsTest".equals(method.getName())) {
            Annotation[] annotations = method.getDeclaredAnnotations();
            for(Annotation annotation : annotations) {
                Annotation[] annotations1 = annotation.annotationType().getAnnotations();
                System.out.println(Arrays.toString(annotations1));
            }
        }
    }
}
```

- 测试结果

```
[@java.lang.annotation.Retention(value=RUNTIME), @java.lang.annotation.Target(value=[METHOD, TYPE]), @com.ryo.jdk.annotation.annotation.Testable()]
```

只需要简单讲此方法封装成为 Methods.contains(XXX.class); 之类的方法即可使用。


# 注解属性的设置

## 业务场景

TestNG 中的 `@DataProvider` 注解，拥有 `dataProvider()` 属性用来指定数据源。

编写的框架中 `dataProvider()` 值可以指向固定的值，但是 TestNG 会通过这个属性来进行值的注入和执行。

## 解决方式

```java
import org.testng.Assert;
import org.testng.ITestContext;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.Map;

public class TestNgDataProviderTest {

    /**
     * 是否为空数据准备
     * @return 数据
     */
    @DataProvider(name = "TestDataProvider")
    public Object[][] isEmptyDataProvider(Method method, ITestContext testContext) {
        return new Object[][]{
                {"", true},
                {null, true},
                {"    ", true},
                {"1", false},
                {"   1", false}
        };
    }

    /**
     * 在每一个类执行之前，设置注解的属性
     * @throws NoSuchFieldException if any
     * @throws IllegalAccessException if any
     */
    @BeforeClass
    public void beforeClass() throws NoSuchFieldException, IllegalAccessException {
        Method[] methods = this.getClass().getDeclaredMethods();
        for(Method method : methods) {
            Test test = method.getAnnotation(Test.class);
            if(test != null) {
                InvocationHandler h = Proxy.getInvocationHandler(test);
                Field hField = h.getClass().getDeclaredField("memberValues");
                hField.setAccessible(true);
                Map memberMethods = (Map) hField.get(h);
                memberMethods.put("dataProvider", "TestDataProvider");
                String value = test.dataProvider();
                Assert.assertEquals("TestDataProvider", value);
            }
        }
    }

    @Test
    public void isEmptyTest(final String string, boolean result) {
        System.out.println(string+","+result);
        Assert.assertEquals(result, StringUtil.isEmpty(string));
    }
}
```

## 反思

这种技术的使用范围比较窄，要注意使用的场景。

> [通过反射，动态修改注解的某个属性值](https://segmentfault.com/a/1190000011213222)

# 参考文档

> [注解说明](https://docs.oracle.com/javase/tutorial/java/annotations/index.html)

* any list
{:toc}