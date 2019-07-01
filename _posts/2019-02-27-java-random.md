---
layout: post
title: Java Random 随机详解
date:  2019-2-26 09:48:47 +0800
categories: [Java]
tags: [java, java-base, sh]
published: true
excerpt: Java Random 随机详解
---


# 伪随机

## 什么是伪随机数？

1.伪随机数是看似随机实质是固定的周期性序列,也就是有规则的随机。

2.只要这个随机数是由确定算法生成的,那就是伪随机,只能通过不断算法优化,使你的随机数更接近随机。(随机这个属性和算法本身就是矛盾的)

3.通过真实随机事件取得的随机数才是真随机数。

## Java随机数产生原理：

Java的随机数产生是通过线性同余公式产生的,也就是说通过一个复杂的算法生成的。

## 伪随机数的不安全性：

Java自带的随机数函数是很容易被黑客破解的,因为黑客可以通过获取一定长度的随机数序列来推出你的seed,然后就可以预测下一个随机数。


ps: 随机的应该是中国股市:)。

# Random

## 小结

1. java.util.Random类中实现的随机算法是伪随机，也就是有规则的随机，所谓有规则的就是在给定种(seed)的区间内随机生成数字；

2. 相同种子数的Random对象，相同次数生成的随机数字是完全相同的；

3. Random类中各方法生成的随机数字都是均匀分布的，也就是说区间内部的数字生成的几率均等；

# ThreadLocalRandom

如果你想兼顾性能，那么使用这个类代替 Random。

这个类是Java7新增的类，给多线程并发生成随机数使用的。

- 为什么ThreadLocalRandom要比Random快呢？

这是因为Random在生成随机数的时候使用了CAS（compare and set），但是ThreadLocalRandom却没有使用。

# SecureRandom

在需要频繁生成随机数，或者安全要求较高的时候，不要使用Random，这个很好理解吧，从我们最开始的介绍中可以知道，Random生成的值其实是可以预测的。

内置两种随机数算法，NativePRNG和SHA1PRNG，看实例化的方法了。通过new来初始化，默认来说会使用NativePRNG算法生成随机数，但是也可以配置-Djava.security参数来修改调用的算法。如果是`/dev/[u]random`两者之一就是NativePRNG，否则就是SHA1PRNG。

在 jvm 启动参数这样加就好了，`-Djava.security=file:/dev/urandom`。

当然还可以通过getInstance来初始化对象，有一个参数的，直接传一个算法名就行，如果不存在算法抛异常；另外有两个参数的，第二个参数还可以指定算法程序包。下面来看下实现代码。

```java
SecureRandom secureRandom = new SecureRandom();
SecureRandom secureRandom3 = SecureRandom.getInstance("SHA1PRNG");
SecureRandom secureRandom2 = SecureRandom.getInstance("SHA1PRNG", "SUN");
```

当然我们使用这个类去生成随机数的时候，一样只需要生成一个实例每次去生成随机数就好了，也没必要每次都重新生成对象。另外，这个类生成随机数，首次调用性能比较差，如果条件允许最好服务启动后先调用一下nextInt()。

另外，实际上SHA1PRNG的性能将近要比NativePRNG的性能好一倍，synchronized的代码少了一半，所以没有特别重的安全需要，尽量使用SHA1PRNG算法生成随机数。

# Math.random

这也是个比较常用的生成随机数的方式,默认生成0~1之间的小数.

# 总结

1、单机中如果对安全性要求不高的情况下，使用 Random；对安全性要求高，就用 SecureRandom；

SecureRandom里有两种算法，SHA1PRNG 和 NativePRNG，SHA1PRNG的性能好，但是NativePRNG的安全性高。

2、Random 是线程安全的，用CAS来保持，但是性能比不高，所以多线程中，尽量使用 java并发包里的 ThreadLocalRandom，

避免了线程之间的竞争导致的性能问题

# 参考资料 

[Java中生成随机数Random、ThreadLocalRandom、SecureRandom、Math.random()](https://blog.csdn.net/qq_33101675/article/details/81028210)

[为什么说Java中的随机数都是伪随机数？](https://www.cnblogs.com/greatfish/p/5845924.html)

* any list
{:toc}