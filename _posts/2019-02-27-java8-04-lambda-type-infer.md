---
layout: post
title: java8-04-lambda 类型推断
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [jdk8, java, sh]
published: true
---

# 类型检查

Lambda 的类型是从 Lambda 的上下文推断出来的。

上下文中 Lambda 表达式需要的类型称为 **目标类型**。


## 图示如下


# 同样的 lambda，不同的函数接口

```java
/**
 * 相同的 lambda 表达式，但是不同的函数接口
 * 只要他们的抽象方法签名可以兼容。
 */
@Test
public void sameLambdaDiffFunctional() {
    Comparator<Apple> c1 = (Apple one, Apple two)->one.getWeight().compareTo(two.getWeight());
    ToIntBiFunction<Apple, Apple> c2 = (Apple one, Apple two)->one.getWeight().compareTo(two.getWeight());
}
```

# 类型推断

```java
/**
 * 如果 lambda 表达式是一个语法表达式
 * 他就和一个返回 void 的函数描述符兼容（参数列表也要建荣）
 */
@Test
public void voidTest() {
    List<String> stringList = Arrays.asList("1");
    Predicate<String> predicate = s->stringList.add(s);
    Consumer<String> consumer = s->stringList.add(s);
}
```

# 限制

```java
/**
 * 类型推断
 * 作用：可以进一步简化你的代码
 */
@Test
public void typeInferenceTest() {
    Comparator<Apple> c1 = (Apple one, Apple two)->one.getWeight().compareTo(two.getWeight());
    Comparator<Apple> c2 = (one, two)->one.getWeight().compareTo(two.getWeight());

}
```

* any list
{:toc}