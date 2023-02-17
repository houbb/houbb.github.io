---
layout: post
title:  JCIP-06-同步容器类
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, lock, sh]
published: true
excerpt: JCIP-06-构建基础模块
---

# 问题

- 为什么需要同步容器类？

- 同步容器类的优点和缺点？

- 对我们设计的启发

# 同步容器类

## java 中的同步容器

在Java中，同步容器主要包括2类：

1）Vector、Stack、HashTable

2）Collections类中提供的静态工厂方法创建的类

Vector实现了List接口，Vector实际上就是一个数组，和ArrayList类似，但是Vector中的方法都是synchronized方法，即进行了同步措施。

Stack也是一个同步容器，它的方法也用synchronized进行了同步，它实际上是继承于Vector类。

HashTable实现了Map接口，它和HashMap很相似，但是HashTable进行了同步处理，而HashMap没有。

Collections类是一个工具提供类，注意，它和Collection不同，Collection是一个顶层的接口。

在Collections类中提供了大量的方法，比如对集合或者容器进行排序、查找等操作。

最重要的是，在它里面提供了几个静态工厂方法 `Collections.synchronizedXXX` 来创建同步容器类，

这些类实现安全的方式是，将他们的状态封装起来，并对每个public方法进行同步，从而使得每次只有一个线程能访问容器的状态。 

## 复合操作

同步容器类都是线程安全的，但是对于某些复合操作需要额外的加锁来保护。常见复合操作有：迭代（反复访问元素，直到遍历所有元素）、跳转（根据指定顺序找到当期元素的下一个元素）以及条件运算（如：如没有则添加）。

## Get/Delete 线程问题

### 存在问题的代码

```java
public static Object getLast(Vector list){
    int lastIndex = list.size() - 1;
    return list.get(lastIndex)
}

public static void deleteLast(Vector list){
    int lastIndex = list.size() - 1;
    list.remove(lastIndex);
}
```

上面例子中，Vector中定义了两个方法，它们都执行先检查再运行操作。先获取数组大小，再获取或删除最后一个元素。这些方法看似没问题，并且都是线程安全的，也不破坏Vector。但是从调用者角度来看，就有问题了。可能A线程调用getLast的过程中，B线程调用了deleteLast，Vector元素减少，导致A线程调用失败。

同步容器类遵守同步策略，即支持客户端加锁，因此只要我们知道应该使用那个锁，就能创建一些新的操作。这些新操作与容器与其他操作都是原子操作。同步容器通过自身的锁来保护它的每个方法。通过获取容器的锁，就能使上面的方法称为原子操作。size和get操作之间不会有其他操作。

### Vector 上复合加锁 

```java
public static Object getLast(Vector list){
    synchronized(list){
        int lastIndex = list.size() - 1;
        return list.get(lastIndex)
    }
    
}

public static void deleteLast(Vector list){
    synchronized(list){
        int lastIndex = list.size() - 1;
        list.remove(lastIndex);
    }
}
```

## 遍历的线程安全问题

### 问题代码

同样的问题也会出现在遍历上，如下面的例子：

```java
for(int i=0; i< vector.size(); i++)
    doSomgthing(vector.get(i));
```

如果另外一个线程删除一个元素，会导致ArrayIndexOutBoundsException异常。

### 修正代码

我们可以通过加锁来解决迭代不可靠问题，避免其他线程在遍历过程修改Vector。

但也带来性能问题，迭代期间其他线程无法访问它。

```java
synchronized(vector){
    for(int i=0; i< vector.size(); i++)
        doSomgthing(vector.get(i));
}
```

上面的例子在未加锁的情况下都可能抛出异常，这并不意味着Vector不是线程安全的。Vector仍然是线程安全的，抛出的异常也与其规范保持一致。


# 迭代器与ConcurrentModificationException

对容器进行迭代的标准方式是使用Iterator，使用for-each语法，也是调用Iterator。

在设计同步容器类的时候并没有考虑并发修改问题，它们表现出的行为是“及时失败”的，意味着在迭代过程中，如果有其他线程修改容器，会抛出ConcurrentModificationException异常。它们实现的方式是，将计数器变化与容器关联起来，放迭代器件计数器被修改，那么hasNext或next将抛出异常。这是设计上的一个权衡。

如果容器规模很大， 那么后续线程将会等待较长的时间。调用 doSomething 时持有锁，可能会产生死锁。长时间对容器加锁会降低程序的可伸缩性。持有锁的时间过长，竞争就可能越激烈，如果有多个线程在等待，那么将极大降低吞吐量和CPU的利用率。

要想避免ConcurrentModificationException，就必须在迭代过程持有容器的锁。但是如果容器规模很大，迭代过程持有锁，将导致严重的性能问题。一种替代方式就是“克隆容器”，并在副本上迭代。克隆过程仍然需要加锁，同时存在显著的性能开销。克隆容器的好坏取决于过个元素，如容器大小，迭代时，每个元素执行的操作等。

# 隐藏迭代器

加锁可以防止迭代抛出ConcurrentModificationException异常，但是需要在所有迭代的地方进行加锁。实际情况通常更加复杂，有些情况下可能会忽略隐藏的迭代器。

```java
public class HiddenIterator{
    private final Set(Integer) set = new HashSet<>();
    
    public synchronized void add(Integer i){set.add(i)}
    public synchronized void remove(Integer i){set.remove(i)}
    
    public void addTenThings(){
        Random r = new Random();
        for(int i=0;i<10;i++){
            add(r.nextInt());
        }
        System.out.println("debug" + set)
    }
}
```

addTenThings方法可能抛出ConcurrentModificationException异常，因为在打印输出的时候进行字符串连接，会调用set的toString方法，toString方法会对容器进行迭代。在使用println前必须获取HiddenIterator的锁，但是实际应用中可能忽略。

封装对象的状态有助于维持不变性，封装对象的同步机制有助有确保实施同步策略。

如果使用synchronizedSet来包装HashSet，并且对同步代码进行封装，就不会发生这种错误。

## 隐式迭代情况

除了toString，hashCode和equals等方法也会间接执行迭代操作。

当容器作为另一个容器的元素和键值时，就会出现这种情况。

同样，containsAll，removeAll等方法，以及把容器作为参数的构造函数都会对容器进行迭代。这些间接操作都有可能抛出ConcurrentModificationException异常。


# 同步容器的缺陷

1. 并非任何场景都是线程安全的。

2. 因为加锁，性能比较差。

# 参考资料

《java 并发编程的艺术》

http://www.cnblogs.com/lilinwei340/p/6987008.html

https://www.cnblogs.com/dolphin0520/p/3933404.html


* any list
{:toc}