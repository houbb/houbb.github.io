---
layout: post
title:  java 基础篇-07-instanceof 详解
date:  2020-7-19 10:37:20 +0800
categories: [Java]
tags: [java, java-base, sf]
published: true
---

# instanceof 关键字

## 简介

instanceof 是运算符只被用于对象引用变量，检查左边的被测试对象是不是右边类或接口的实例化。

## 例子

```java
String str = new String("测试");
Assert.assertTrue(str instanceof String);
```

## null 值的判断

```java
Assert.assertFalse(null instanceof String);
```

如果被测对象是null值，则测试结果总是false。

## 应用场景

我自己在写一些工具类时，这个方法还是比较常用的。

最常用的场景就是先通过 instanceof 判断是否为某一个类型，然后进行强转。

比如：

```java
Object value = "123";

if(value instanceof String) {
    String text = (String) value;
    System.out.println("字符串："+text);
} else {
    System.out.println("其他类型："+ value);
}
```

# 类似的方法

条条大路通罗马，相判断对象是否是某一个类型，方法还是很多的。

## isInstance()

`isInstance(Object obj)` 方法，这个方法与instanceof等价，其中obj是被测试的对象，如果obj是调用这个方法的class或接口的实例，则返回true。

```java
Object value = "123";
Assert.assertTrue(String.class.isInstance(value));
```

## isAssignableFrom()

还有另外一个比较常用的方法：`isAssignableFrom(Class cls)`

如果调用这个方法的class或接口与参数cls表示的类或接口相同，或者是参数cls表示的类或接口的父类，则返回true。

```java
Assert.assertFalse(String.class.isAssignableFrom(Object.class));
Assert.assertTrue(Object.class.isAssignableFrom(String.class));
```

不过我平时不太用这个方法，有时候容易理解反过来。

# 实现原理

## 个人思路

个人理解，最简单的方式可以获取当前对象的类型，递归获取自己的所有父类和接口信息，然后对比判断。

当然感觉这样性能不太高，让我们来看一下 oracle 是如何设计和实现的？

## oracle 文档

> [jvms-6.5.instanceof](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-6.html#jvms-6.5.instanceof)

官方文档描述：

从操作数堆栈中弹出必须为引用类型的objectref。

无符号的indexbyte1和indexbyte2用于在当前类的运行时常量池（第2.6节）中构造索引，其中索引的值为`(indexbyte1 << 8) | indexByte2`。

索引处的运行时常量池项必须是对类，数组或接口类型的符号引用。

如果objectref为null，则instanceof指令将int结果0作为int推入操作数堆栈。

否则，将解析命名的类，数组或接口类型（第5.4.3.1节）。

如果objectref是已解析的类或数组的实例或实现了已解析的接口，则instanceof指令将int结果1作为操作数堆栈上的int推送；否则，将int结果推为0。

以下规则用于确定不为null的objectref是否是已解析类型的实例：

### 核心判断逻辑

如果S是objectref所引用的对象的类，而T是已解析类，数组或接口的类型，则instanceof确定是否objectref是T的一个实例，如下所示：

（1）如果S是普通的（非数组）类，则：

如果T是类类型，则S必须与T属于同一类，或者S必须是T的子类；

如果T是接口类型，则S必须实现接口T。

（2）如果S是接口类型，则：

如果T是类类型，则T必须是Object。

如果T是接口类型，则T必须是与S相同的接口或S的超接口。

（3）如果S是代表数组类型SC[]的类，即，数组类型SC的组件，则：

- 如果T是类类型，则T必须是Object。

- 如果T是接口类型，则T必须是由数组实现的接口之一。

- 如果T为数组类型TC[]，即数组类型为TC的组件，则以下条件之一必须为true：

TC和SC是相同的原始类型。

TC和SC是引用类型，并且可以通过这些运行时规则将类型SC强制转换为TC。

## oracle 实现的注意点

可以看到，基本和我们的思路一致，不过细分的更加专业系统。

使用 instanceof 关键字的时候，还是需要考虑性能问题的，继承的层级越深，需要遍历的时候代价越大。

# 小结

# 参考资料

[Java instanceof 关键字是如何实现的？](https://www.zhihu.com/question/21574535)

[Java关键字(一)——instanceof](https://www.cnblogs.com/ysocean/p/8486500.html)

[java中“53”个关键字（含2个保留字）](https://blog.csdn.net/u012506661/article/details/52756452)

* any list
{:toc}