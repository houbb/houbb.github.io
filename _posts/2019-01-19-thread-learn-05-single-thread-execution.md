---
layout: post
title: 轻松学习多线程 05-Single Threaded Execution 模式
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

# # Single Threaded Execution

这座桥，一次只能过一个人。

# 情景引入

使用程序模拟三个人频繁通过一个只允许通过一个人的门。
每次有人通过，人数统计便会增加。
每次通过，都会校验通过者的信息。

# 普通方式

## 定义

- Gate.java

定义接口。

```java
/**
 * 接口
 * @author bbhou
 */
public interface Gate {

    /**
     * 对过门的人通过校验
     * @param name 姓名
     * @param address 地址
     */
    void pass(String name, String address);

}
```

- UserThread.java

用户执行线程

```java
/**
 * 用户线程
 * @author bbhou
 * @since 1.0.0
 */
public class UserThread extends Thread {

    private final Gate gate;

    /**
     * 名称
     */
    private final String name;

    /**
     * 地址
     */
    private final String address;

    public UserThread(Gate gate, String name, String address) {
        this.gate = gate;
        this.name = name;
        this.address = address;
    }

    @Override
    public void run() {
        System.out.println(this.name + " BEGIN!");
        while (true) {
            this.gate.pass(name, address);
        }
    }

}
```

- UnsafeGate.java

线程不安全的实现

```java
/**
 * UnsafeGate 线程不安全
 * @since 1.0.0
 * @author bbhou
 */
public class UnsafeGate implements Gate {

    /**
     * 计数器
     */
    private int counter = 0;

    /**
     * 姓名
     */
    private String name;

    /**
     * 地址
     */
    private String address;

    /**
     * 通过
     * @param name 姓名
     * @param address 地址
     */
    @Override
    public void pass(String name, String address) {
        this.counter++;
        this.name = name;
        this.address = address;
        check();
    }

    /**
     * 信息校验
     */
    private void check() {
        if(name.charAt(0) != address.charAt(0)) {
            System.out.println("-----------------------BROKEN-----------------------"
            +toString());
        }
    }


    @Override
    public String toString() {
        return "UnsafeGate{" +
                "counter=" + counter +
                ", name='" + name + '\'' +
                ", address='" + address + '\'' +
                '}';
    }

}
```

## 运行 & 测试

- run

```java
public static void main(String[] args) {
       Gate gate = new UnsafeGate();
       new UserThread(gate, "Apple", "Apple").start();
       new UserThread(gate, "Big", "Big").start();
       new UserThread(gate, "Cat", "Cat").start();
}
```

- 运行结果

```
Apple BEGIN!
Cat BEGIN!
-----------------------BROKEN-----------------------UnsafeGate{counter=3393, name='Apple', address='Cat'}
Big BEGIN!
-----------------------BROKEN-----------------------UnsafeGate{counter=3903, name='Apple', address='Apple'}
-----------------------BROKEN-----------------------UnsafeGate{counter=4098, name='Apple', address='Apple'}
-----------------------BROKEN-----------------------UnsafeGate{counter=4301, name='Apple', address='Apple'}
-----------------------BROKEN-----------------------UnsafeGate{counter=3393, name='Apple', address='Cat'}
（以下省略）
```

## 结果分析

很明显，这不太符合我们的预期。
当多线程执行时，这个类是线程不安全的。
出现这种现象的原因是，当一个线程执行 `check()` 方法时，其他线程在执行 `pass()` 方法。导致 name、address 的属性被修改。
如何解决这个问题呢？
请往下看。


# 模式案例

- SafeGate.java

我们将 `pass()` 和 `toString()` 进行同步保护。如下：

```java
/**
 * 线程安全
 * @since 1.0.0
 * @author bbhou
 */
public class SafeGate implements Gate {

    /**
     * 计数器
     */
    private int counter = 0;

    /**
     * 姓名
     */
    private String name;

    /**
     * 地址
     */
    private String address;

    /**
     * 通过
     * @param name 姓名
     * @param address 地址
     */
    @Override
    public synchronized void pass(String name, String address) {
        this.counter++;
        this.name = name;
        this.address = address;
        check();
    }

    /**
     * 信息校验
     */
    private void check() {
        if(name.charAt(0) != address.charAt(0)) {
            System.out.println("-----------------------BROKEN-----------------------"
            +toString());
        }
    }


    @Override
    public synchronized String toString() {
        return "SafeGate{" +
                "counter=" + counter +
                ", name='" + name + '\'' +
                ", address='" + address + '\'' +
                '}';
    }
}
```

## 运行 & 测试

- run

```java
public static void main(String[] args) {
       Gate gate = new SafeGate();
       new UserThread(gate, "Apple", "Apple").start();
       new UserThread(gate, "Big", "Big").start();
       new UserThread(gate, "Cat", "Cat").start();
}
```

- 运行结果

```
Big BEGIN!
Apple BEGIN!
Cat BEGIN!
```

## 结果分析

这次结果不会再出现错误的信息。
原因是什么呢？

-  synchronized 的作用
第一个案例中提到，之所以出现问题，是因为 `pass()` 被个线程交错执行导致的。
synchronized 可以保证此方法同时只能被一个线程执行。

- synchronized 保护着什么？

本案例中，`pass()` 被声明为 synchronized 之后，保护着 Gate 类中的 counter,name,address 三个字段。
确保这些字段不会被多个线程同时访问。

- 其他地方保护好了吗？
上面的方法中，你应该发现 `check()` 方法并没有被声明为 synchronized。
会存在问题吗？
其实不会，原因如下：
（1）此类为 private 方法，外部无法直接访问。
（2）调用此类的方法 `pass()`是被声明为 synchronized 的。
所需该类无需进行声明。
当然就算加上也不算错，但是这样可能会降低性能。

# UML & Code

- UML

类之间的关系：

![UML](https://imgconvert.csdnimg.cn/aHR0cDovL2ltZy5ibG9nLmNzZG4ubmV0LzIwMTgwMjI4MTAzNjU1Mjcz?x-oss-process=image/format,png)

- Code

> [代码地址](https://github.com/houbb/thread-learn/tree/master/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn/singleThreadedExecution)

# 系列导航

> [多线程系列导航](http://blog.csdn.net/ryo1060732496/article/details/79376415)

* any list
{:toc}