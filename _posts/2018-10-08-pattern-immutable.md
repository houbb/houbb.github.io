---
layout: post
title: Java Immutable-Java 设计模式之不可变对象
date:  2018-10-08 17:55:28 +0800
categories: [Pattern]
tags: [sql, java, pattern, thread-safe, sh]
published: true
---

# 不可变对象

## 定义

如果某个对象在被创建后其状态就不能被修改，那么这个对象就称为不可变对象。

## 线程安全

线程安全性是不可变对象的固有属性之一，它们的不变性条件是由构造函数创建的，只要它们的状态不改变，那么这些不变性条件就能得以维持。

不可变对象一定是线程安全的。 

当满足以下条件时，对象才是不可变的： 

1) 对象创建以后其状态就不能修改。 

2) 对象的所有域都是 final 类型(当然像不可变String类型的域并不需要声明为final)。 

3) 对象是正确创建的(在对象的创建期间，this引用没有逸出)。 

## 设计要领

Java中很多class都是immutable，像String，Integer等，它们通常用来作为Map的key. 

那么在实现自定义的Immutable的Class的时候，应该注意哪些要点呢？ 

1. Class 应该定义成 final，避免被继承。 或者将所有类方法加上final(弱不可变类)。

2. 所有的成员变量应该被定义成 private final。 

3. 不要提供可以改变类状态(成员变量)的方法。【get 方法不要把类里的成员变量让外部客户端引用,当需要访问成员变量时，返回成员变量的copy】 

4. 构造函数不要引用外部可变对象。如果需要引用可以在外部改变值的变量，应该在构造函数里进行 defensive copy。 

## 优缺点

### 优点

1）Immutable 对象是线程安全的，可以不用被synchronize就在并发环境中共享

2）Immutable 对象简化了程序开发，因为它无需使用额外的锁机制就可以在线程间共享

3）Immutable 对象提高了程序的性能，因为它减少了synchroinzed的使用

4）Immutable 对象是可以被重复使用的，你可以将它们缓存起来重复使用，就像字符串字面量和整型数字一样。

你可以使用静态工厂方法来提供类似于 valueOf() 这样的方法，它可以从缓存中返回一个已经存在的 Immutable 对象，而不是重新创建一个。

### 缺点

immutable也有一个缺点就是会制造大量垃圾，由于他们不能被重用而且对于它们的使用就是”用“然后”扔“，字符串就是一个典型的例子，它会创造很多的垃圾，给垃圾收集带来很大的麻烦。

当然这只是个极端的例子，合理的使用 immutable 对象会创造很大的价值。

## 实际案例

这里就使用了 defensive copy。

```java
public final class ImmutableDemo {  
    private final int[] myArray;  
    public ImmutableDemo(int[] array) {
    // this.myArray = array; // 错误！
    this.myArray = array.clone(); // 正确
  }  
  public int[] get(){
    return myArray.clone();
  }
}
```

# String 为何不可变

不可变类有两个主要有点，效率和安全。

## 优点

- 效率

当一个对象是不可变的，那么需要拷贝这个对象的内容时，就不用复制它的本身而只是复制它的地址，复制地址（通常一个指针的大小）只需要很小的内存空间，具有非常高的效率。

同时，对于引用该对象的其他变量也不会造成影响。

此外，不变性保证了 hashCode() 的唯一性，因此可以放心地进行缓存而不必每次重新计算新的哈希码。

而哈希码被频繁地使用, 比如在 hashMap 等容器中。将 hashCode 缓存可以提高以不变类实例为key的容器的性能。

- 线程安全

在多线程情况下，一个可变对象的值很可能被其他进程改变，这样会造成不可预期的结果，而使用不可变对象就可以避免这种情况同时省去了同步加锁等过程，因此不可变类是线程安全的。

## 缺点

不可变类的每一次“改变”都会产生新的对象，因此在使用中不可避免的会产生很多垃圾。

所以有 StringBuffer/StringBuilder。

# 拓展阅读

[为什么使用字符数组保存密码比使用String保存密码更好？](https://my.oschina.net/jasonultimate/blog/166968)

[java final](https://houbb.github.io/2018/07/29/jmm-08-final)

[java 线程安全](https://houbb.github.io/2018/07/24/java-concurrency-03-thread-safety)

# 参考资料

[Java中的不可变类](http://zhiheng.me/124)

[JAVA的可变类与不可变类](https://blog.csdn.net/fw0124/article/details/49659717)

[如何创建不可变（Immutable）的Java类或对象](https://my.oschina.net/jasonultimate/blog/166810)

[不可变类有什么优势，应该如何创建？](https://www.jianshu.com/p/2080b524fb3a)

* any list
{:toc}