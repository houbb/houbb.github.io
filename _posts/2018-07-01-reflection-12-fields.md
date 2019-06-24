---
layout: post
title: Reflection-12-getFields 顺序确定吗
date:  2018-07-01 17:07:11 +0800
categories: [Java]
tags: [java, reflect]
published: true
---

# getFields() 结果顺序固定吗？

## 背景

前端时间同事说遇到了 getFields() 顺序可能不一致的问题。

自己觉得这违反直觉。

因为觉得固定的 jdk 编译为 class 肯定是固定的，相同的 jvm 加载处理的策略肯定也是固定的。

那么反射获取的字段顺序肯定也是有序的。

结果查下来，却是超出自己意料之外的。

# 顺序固定吗

答案是不固定的。

如果想知道为什么，请继续往下看。

可以参考这个讨论：[java-reflection-getting-fields-and-methods-in-declaration-order](http://stackoverflow.com/questions/5001172/java-reflection-getting-fields-and-methods-in-declaration-order)

## 简单解释

在JDK的API文档里明确标注了：不能保证getDeclaredFields()/getDeclaredMethods()返回的Fields[] 和 Methods[] 的顺序。

注意是不能保证返回顺序，而不是返回是乱序：它完全可能是乱序，也还可能是按照声明顺序排布。

这是因为，JVM有权在编译时，自行决定类成员的顺序，不一定要按照代码中的声明顺序来进行编译。

因此返回的顺序其实是class文件中的成员正向顺序，只不过在编译时这个顺序不一定等于声明时的顺序。


## 更进一步的理解

你可能会有疑问？

就是是不确定，那他一定是按照某种规则来确定的。

答案却是如此。

你如果看过 JMM，那么一定知道语句的重排序，为了提升性能。

其实，对于字段，JVM 也会做类似的事情。

这叫做字段重排序。

# 字段重排序

JVM 会对字段进行重排序，以达到内存对齐的目的。

# 如何解决这个问题

最简单的粗暴的是，使用注解：

```java
public @interface Order {
    int value();
}
```

指定顺序，然后反射的时候，返回。

# 拓展阅读

[jmm-05-volatile](https://houbb.github.io/2018/07/27/jmm-05-volatile)

# 参考资料

[反射机制按顺序获取](https://blog.csdn.net/Shenpibaipao/article/details/78510849?utm_source=blogxgwz6)

[Java反射中的getDeclaredFields()方法的疑问？](https://www.zhihu.com/question/52856385)

* any list
{:toc}