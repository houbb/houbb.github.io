---
layout: post
title:  Annotation-03-metadata
date:  2018-07-02 18:33:37 +0800
categories: [Java]
tags: [java, annotation]
published: true
---

# 元注解

适用于其他注释的注释称为元注释。在 **java.lang.annotation** 中定义了几个元注释类型。

# `@Retention`

指定标记的注解如何存储:

| 属性 | 说明 |
|:---|:---|
| RetentionPolicy.SOURCE | 标记的注释只保留在源层中，编译器将忽略它。 |
| RetentionPolicy.CLASS | 编译器在编译时保留标记的注释，但是Java虚拟机(JVM)会忽略它。 |
| RetentionPolicy.RUNTIME | 标记的注释由JVM保留，以便运行时环境可以使用它。 |

## 实例

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface MetadataDemo {
}
```

## 说明

- RetentionPolicy.RUNTIME

运行时注解应该是使用最多的。

- RetentionPolicy.SOURCE

一般用于编译时注解的定义，比如 lombok 相关的注解。

# `@Documented`

`@Documented` 注解表明，无论何时使用指定的注释，都应该使用Javadoc工具对这些元素进行文档化。
(默认情况下，注释不包含在Javadoc中。)有关更多信息，请参见Javadoc工具页。

## 实例

```java
@Retention(RetentionPolicy.CLASS)
@Documented
public @interface MetadataDemo {
}
```

# `@Target`

@Target批注标记另一个批注，以限制批注可以应用于何种Java元素。目标注释指定以下元素类型之一作为其值:

| 属性 | 说明 |
|:---|:---|
| ElementType.ANNOTATION_TYPE | 应用于注解类型 |
| ElementType.CONSTRUCTOR | 可以应用于构造函数 |
| ElementType.FIELD | 可以应用于字段或属性。|
| ElementType.LOCAL_VARIABLE | 可以应用于一个局部变量 |
| ElementType.METHOD | 可以应用于方法级注释 |
| ElementType.PACKAGE | 应用于包声明 |
| ElementType.PARAMETER | 应用于方法的参数 |
| ElementType.TYPE | 应用于类的任何元素 |

## 实例

```java
@Retention(RetentionPolicy.CLASS)
@Documented
@Target(ElementType.METHOD)
public @interface MetadataDemo {
}
```

## 说明

指定我们注解的应用范围非常重要。一般最常用的是 `ElementType.TYPE` 和 `ElementType.METHOD`

# `@Inherited`

`@Inherited` 表明注解类型可以从超类继承。(这在默认情况下是不对的。)
当用户查询注释类型而该类没有对此类型的注释时，将查询类的超类以获取注释类型。此注释仅应用于类声明。

## 实例

```java
@Retention(RetentionPolicy.CLASS)
@Documented
@Target(ElementType.METHOD)
@Inherited
public @interface MetadataDemo {
}
```

## 说明

当一个类继承了拥有此注解的类时，即使当前类没有任何注解。
只要父类的注解拥有(`@Inherited`)属性，则在子类中可以获取到此注解。

# `@Repeatable`

在Java SE 8中引入的 `@Repeatable` 注解表明标记的注解可以多次应用于相同的声明或类型使用。
有关更多信息，请参见重复注释。

## 实例

- Repeats.java

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Repeats {
    Repeat[] value();
}
```

- Repeat.java

```java
@Repeatable(value = Repeats.class)
public @interface Repeat {
    String value();
}
```

- RepeatDemo.java

```java
public class RepeatDemo {

    @Repeat(value = "tag")
    @Repeat(value = "tag2")
    public void method() {
    }

}
```

# 代码地址

> [annotation metadata](https://github.com/houbb/jdk/tree/master/jdk-annotation/src/main/java/com/ryo/jdk/annotation/metadata)


* any list
{:toc}