---
layout: post
title: java8-05-lambda 方法引用
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [jdk8, java, sh]
published: true
---

# 方法引用

方法引用可以看作仅仅调用特定方法方法的 lambda 的一种快捷的方式。

显示的指定方法的名称，**可读性会更好**。

## 代码示例

```java
/**
 * 方法引用
 */
@Test
public void functionRefTest() {
    Apple one = new Apple(20);
    Apple two = new Apple(10);
    List<Apple> appleList = Arrays.asList(one, two);

    appleList.sort((a1, a2)->a1.getWeight().compareTo(a2.getWeight()));
    appleList.sort(Comparator.comparing(Apple::getWeight));
}
```

## 图示


## 构造函数的方法引用
 
- 无参数

```java
/**
 * 构造函数的引用
 */
@Test
public void constructorRefTest() {
    Supplier<Apple> appleSupplier = Apple::new;
    Apple one = appleSupplier.get();

    //is the same as
    Supplier<Apple> appleSupplier2 = ()->new Apple();
    Apple two = appleSupplier2.get();
}
```

- 有参数

```java
/**
 * 有参构造函数
 */
@Test
public void constructorWithParamTest() {
    Function<Integer, Apple> appleFunction = Apple::new;
    Apple apple = appleFunction.apply(100);
}
```

* any list
{:toc}