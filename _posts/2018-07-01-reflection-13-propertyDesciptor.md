---
layout: post
title: Reflection-13-javabean 内省 PropertyDescriptor
date:  2018-07-01 17:07:11 +0800
categories: [Java]
tags: [java, reflect]
published: true
---

# PropertyDescriptor

## 应用场景

大家都知道Java类中的私有的（private）属性是获取不到的（即使使用继承依然获取不到），那如果非要获取私有属性的值怎么办呢？

一般的做法是将该java类封装称为一个JavaBean，即封装该私有属性，提供一对共有的get，set方法来访问私有属性。一般情况下都会这样做！

但遇到特殊情况呢？比如，先现有一个需求：访问一个Java类的私有属性，并且该类不提供访问该私有属性的共有方法！下面就为大家介绍一种方法访问java类的私有属性。

## PropertyDescriptor 引入

要获取java类的私有属性就不得不先介绍一个类PropertyDescriptor。该类为属性描述符类。

通过该类提供的一系列方法来访问java类中的私有属性。

# 接口说明

## 构造器

```java
PropertyDescriptor(String propertyName, Class<?> beanClass)

PropertyDescriptor(String propertyName, Class<?> beanClass, String readMethodName, String writeMethodName)

PropertyDescriptor(String propertyName, Method readMethod, Method writeMethod)
```

## 常用方法

```java
Class<?> getPropertyType() // 获取属性的java类型对象
Method getReadMethod() // 获得用于读取属性值的方法
Method getWriteMethod() // 获得用于写入属性值的方法
void setReadMethod(Method readMethod) // Sets the method that should be used to read the property value.
void setWriteMethod(Method writeMethod) //Sets the method that should be used to write the property value.
```

# 实际例子

## 思路

我们可以通过反射 field 获取属性名称，结合 PropertyDescriptor 从而获取其对应的方法信息。

然后结合 ReflectASM 达到提升性能的目的。

## 工具类整合

直接整合到 heaven 框架中。

# 参考资料

[JDK-DOC](https://docs.oracle.com/javase/7/docs/api/java/beans/PropertyDescriptor.html)

[通过PropertyDescriptor反射获取属性的 getter/setter 方法](https://blog.csdn.net/cainiaobulan/article/details/73899526)

[Java中PropertyDescriptor使用以及问题总结](https://www.jianshu.com/p/6eab5d983a6a)

[关于属性描述符PropertyDescriptor](https://segmentfault.com/a/1190000017951094)

* any list
{:toc}