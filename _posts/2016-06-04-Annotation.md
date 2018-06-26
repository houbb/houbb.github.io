---
layout: post
title: Annotation
date:  2016-06-04 22:36:10 +0800
categories: [Java]
tags: [Annotation]
published: true
---

Annotations, a form of metadata, provide data about a program that is not part of the program itself.

> [annotations doc](https://docs.oracle.com/javase/tutorial/java/annotations/index.html)


## Basics

- The Format of an Annotation

The at sign character <kbd>@</kbd> indicates to the compiler that what follows is an annotation. like the ```@override```

- Where Annotations Can Be Used

Annotations can be applied to declarations: declarations of classes, fields, methods, and other program elements.


## Declaring an Annotation Type

- You can define the annotation type as following

```java
public @interface AuthorInfo {
    String author() default "houbb";
    String date();
}
```

- And use it

```java
@AuthorInfo(date = "2016-06-04 22:58:46")
public void testAuthorInfo() {

}
```

<label class="label label-info">Note</label>

To make the information in @AuthorInfo appear in Javadoc-generated documentation, you must annotate the @AuthorInfo
definition with the **@Documented** annotation.


## Predefined Annotation Types

Annotations that apply to other annotations are called meta-annotations. There are several meta-annotation types defined in java.lang.annotation.

### @Retention

> @Retention annotation specifies how the marked annotation is stored:

- RetentionPolicy.SOURCE – The marked annotation is retained only in the source level and is ignored by the compiler.
- RetentionPolicy.CLASS – The marked annotation is retained by the compiler at compile time, but is ignored by the Java Virtual Machine (JVM).
- RetentionPolicy.RUNTIME – The marked annotation is retained by the JVM so it can be used by the runtime environment.

### @Target

> @Target annotation marks another annotation to restrict what kind of Java elements the annotation can be applied to.

- ElementType.ANNOTATION_TYPE can be applied to an annotation type.
- ElementType.CONSTRUCTOR can be applied to a constructor.
- ElementType.FIELD can be applied to a field or property.
- ElementType.LOCAL_VARIABLE can be applied to a local variable.
- ElementType.METHOD can be applied to a method-level annotation.
- ElementType.PACKAGE can be applied to a package declaration.
- ElementType.PARAMETER can be applied to the parameters of a method.
- ElementType.TYPE can be applied to any element of a class.


## Type Annotations and Pluggable Type Systems

Type annotations were created to support improved analysis of Java programs way of ensuring stronger type checking.

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


* any list
{:toc}
