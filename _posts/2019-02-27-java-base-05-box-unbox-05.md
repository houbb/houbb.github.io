---
layout: post
title: java base-05-Box UnBox 自动装拆箱
date:  2019-2-27 09:48:47 +0800
categories: [Java]
tags: [static, java-base]
published: true
---

# java 语言的设计

## java 为什么有基本类型

作为一门 OO 语言，java 为什么要保留基本类型呢。

个人的理解是，出于工程学上的考虑。

基本类型的内存占用，比对象要小得多。

参考：[Java 对象占用内存大小与 java 对象格式](https://houbb.github.io/2019/02/26/java-object-size-03)

## 基本对象

基本数据类型不是对象，也就是使用int、double、boolean等定义的变量、常量。

基本数据类型没有可调用的方法。

```java
int t = 1;     //t. 后面是没有方法滴。

Integer t = 1; //t.后面就有很多方法可让你调用了。
```

当然这是一种比较基础浅显的解释。

## 基本类型

| 基本类型 | 占用空间(Byte) | 表示范围 | 包装类型 |
|:---|:---|:---|:---|
| boolean | 1/8 | true/false | Boolean |
| char | 2 | -128~127 | Character |
| byte | 1 | -128~127 | Byte |
| short 2 | -2^15 ~ 2^15-1 | Short |
| int | 4 | -2^31 ~ 2^31-1 | Integer |
| long 8 | -2^63 ~ 2^63-1 | Long |
| float | 4 | -3.403E38 ~ 3.403E38 | Float |
| double | 8 | -1.798E308 ~ 1.798E308 | Double |


# 为何需要自动装箱和拆箱？

## 方便

首先就是方便程序员的编码，我们在编码过程中，可以不需要考虑包装类和基本类型之间的转换操作，这一步由编译器自动替我们完成，开发人员可以有更多的精力集中与具体的业务逻辑。

否则的话，一个简单的数字赋值给包装类就得写两句代码，即：首先生成包装类型对象，然后将对象转换成基本数据类型。而这种操作是代码中使用频率很高的操作，导致代码书写量增多。

## 节约空间

我们在查阅对应包装类的源代码时可以看到，大部分包装类型的valueOf方法都会有缓存的操作，

即：将某段范围内的数据缓存起来，创建时如果在这段范围内，直接返回已经缓存的这些对象，这样保证在一定范围内的数据可以直接复用，而不必要重新生成。

这么设计的目的因为：小数字的使用频率很高，将小数字缓存起来，让其仅有一个对象，可以起到节约存储空间的作用。

这里其实采用的是一种叫做享元模式的设计模式。可以去具体了解以下这种设计模式，这里就不再过多赘述。

# 自动拆装箱

## 基本概念

- 自动装箱

八种基本数据类型在某些条件下使用时候，会自动变为对应的包装类型。

- 自动拆箱

八种包装类型在某些条件下使用时候，会自动变成对应的基本数据类型。

## 什么是自动装箱拆箱

基本数据类型的自动装箱(autoboxing)、拆箱(unboxing)是自J2SE 5.0开始提供的功能。 

一般我们要创建一个类的对象实例的时候，我们会这样：

```java
Class a = new Class(parameter);
```

当我们创建一个Integer对象时，却可以这样：

```java
Integer i = 100;    //(注意：不是 int i = 100; )
```

实际上，执行上面那句代码的时候，系统为我们执行了：`Integer i = Integer.valueOf(100);`

此即基本数据类型的自动装箱功能。

### 自动拆箱

执行的是 `intVal.intValue();`

## 常见总结

1. Integer、Short、Byte、Character、Long这几个包装类的valueOf方法的实现是类似的

2. Double、Float的valueOf方法的实现是类似的

3. Boolean的valueOf方法的实现是个三目运算，形如return (b ? TRUE : FALSE);


# 自动装箱和拆箱的时机

## 直接赋值

这个情况其实在前面介绍自动装箱的操作的时候，举例代码中就是这种情况，将一个字面量直接赋值给对应包装类型会触发自动装箱操作。

## 函数参数

```java
//自动拆箱
public int getNum1(Integer num) {
 return num;
}
//自动装箱
public Integer getNum2(int num) {
 return num;
}
```

## 集合操作

在Java的集合中，泛型只能是包装类型，但是我们在存储数据的时候，一般都是直接存储对应的基本类型数据，这里就有一个自动装箱的过程。
运算符运算

上面在拆箱操作的时候利用的就是这个特性，当基本数据类型和对应的包装类型进行算术运算时，包装类型会首先进行自动拆箱，然后再与基本数据类型的数据进行运算。

说到运算符，这里对于自动拆箱有一个需要注意的地方：

```java
Integer a = null;
int b = a;// int b = a.intValue();
```

这种情况编译是可以通过的，但是在运行的时候会抛出空指针异常，这就是自动拆箱导致的这种错误。

因为自动拆箱会调用intValue方法，但是此时a是null，所以会抛异常。

平时在使用的时候，注意非空判断即可。

# 带来的一些问题

## == 比较

首先就是前面提到的关于 `==` 操作符的结果问题，因为自动装箱的机制，我们不能依赖于==操作符，它在一定范围内数值相同为true，但是在更多的空间中，数值相同的包装类型对象比较的结果为false。

如果需要比较，可以考虑使用equals比较或者将其转换成对应的基本类型再进行比较可以保证结果的一致性。

## 空指针

这是上面在说到运算符的时候提到的一种情况，因为有自动拆箱的机制，如果初始的包装类型对象为null，那么在自动拆箱的时候的就会报NullPointerException，在使用时需要格外注意，在使用之前进行非空判定，保证程序的正常运行。

## 内存浪费

这里有个例子：

```java
Integer sum = 0;
for(int i=1000; i<5000; i++){
 sum+=i;
}
```

上面代码中的 sum+=i 这个操作其实就是拆箱再装箱的过程，拆箱过程是发生在相加的时候，sum本身是Integer，自动拆箱成int与 i 相加。

将得到的结果赋值给sum的时候，又会进行自动装箱，所以上面的for循环体中一句话，在编译后会变为：

```java
n = Integer.valueOf((int)(n.intValue() + i));
```

每次调用valueOf方法都会返回一个Integer对象，所以在进行了5000次循环后，会出现大量的无用对象造成内容空间的浪费，同时加重了垃圾回收的工作量，所以在日常编码过程中需要格外注意，避免出现这种浪费现象。

## 方法重载问题

最典型的就是ArrayList中出现的remove方法，它有remove(int index)和remove(Object obj)方法，如果此时恰巧ArrayList中存储的就是Integer元素，那么会不会出现混淆的情况呢？

其实这个只需要做一个简单的测试就行：

```java
public static void test(Integer num) {
    System.out.println("Integer参数的方法被调用...");
}
​
public static void test(int num) {
    System.out.println("int参数的方法被调用...");
}

public static void main(String[] args) {
    int i = 2;
    test(i); //int参数的方法被调用...
    Integer j = 4;
    test(j);//Integer参数的方法被调用...
}
```

所以可以发现，当出现这种情况的时候，是不会发生自动装箱和拆箱操作的。可以正常区分。

# 个人收获

## 源码的力量

不要总是看博客，有时候答案就在源码中。

## 自动装拆箱

理解为什么这么设计？

# 参考资料

[Java 自动装箱与拆箱(Autoboxing and unboxing)](https://www.cnblogs.com/danne823/archive/2011/04/22/2025332.html)

[Java的自动拆装箱](https://www.jianshu.com/p/cc9312104876)

* any list
{:toc}