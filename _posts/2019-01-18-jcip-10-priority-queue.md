---
layout: post
title:  JCIP-10-优先级队列 Priority Queue
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [java, concurrency, lock, sh]
published: true
excerpt: JCIP-10-优先级队列
---

# 相关学习

优先级队列

二叉堆

堆排序

延迟队列

# Q

- 是什么？

- 怎么用

- 注意事项？

- 源码

# 优先级队列 

我们知道队列是遵循先进先出（First-In-First-Out）模式的，但有些时候需要在队列中基于优先级处理对象。举个例子，比方说我们有一个每日交易时段生成股票报告的应用程序，需要处理大量数据并且花费很多处理时间。客户向这个应用程序发送请求时，实际上就进入了队列。我们需要首先处理优先客户再处理普通用户。在这种情况下，Java的PriorityQueue(优先队列)会很有帮助。

PriorityQueue类在Java1.5中引入并作为 Java Collections Framework 的一部分。PriorityQueue是基于优先堆的一个无界队列，这个优先队列中的元素可以默认自然排序或者通过提供的Comparator（比较器）在队列实例化的时排序。

优先队列不允许空值，而且不支持non-comparable（不可比较）的对象，比如用户自定义的类。优先队列要求使用Java Comparable和Comparator接口给对象排序，并且在排序时会按照优先级处理其中的元素。

优先队列的头是基于自然排序或者Comparator排序的最小元素。如果有多个对象拥有同样的排序，那么就可能随机地取其中任意一个。当我们获取队列时，返回队列的头对象。

优先队列的大小是不受限制的，但在创建时可以指定初始大小。当我们向优先队列增加元素的时候，队列大小会自动增加。

PriorityQueue是非线程安全的，所以Java提供了PriorityBlockingQueue（实现BlockingQueue接口）用于Java多线程环境。

我们有一个用户类Customer，它没有提供任何类型的排序。当我们用它建立优先队列时，应该为其提供一个比较器对象。
 
## 注意

当您使用迭代器时，PriorityQueue 类不保证元素的任何顺序。

它的toString()方法使用它的迭代器给你的元素的字符串表示。

以下代码显示如何使用 Comparator 对象为ComparablePerson列表创建优先级队列。

# 入门案例

演示如何使用 priority queue

## 代码

```java
public class Customer {
 
    private int id;
    private String name;
 
    public Customer(int i, String n){
        this.id=i;
        this.name=n;
    }
 
    public int getId() {
        return id;
    }
 
    public String getName() {
        return name;
    }
 
}
```

- PriorityQueueExample.java

```java
import java.util.Comparator;
import java.util.PriorityQueue;
import java.util.Queue;
import java.util.Random;
 
public class PriorityQueueExample {
 
    public static void main(String[] args) {
 
        //优先队列自然排序示例
        Queue<Integer> integerPriorityQueue = new PriorityQueue<>(7);
        Random rand = new Random();
        for(int i=0;i<7;i++){
            integerPriorityQueue.add(new Integer(rand.nextInt(100)));
        }
        for(int i=0;i<7;i++){
            Integer in = integerPriorityQueue.poll();
            System.out.println("Processing Integer:"+in);
        }
 
        //优先队列使用示例
        Queue<Customer> customerPriorityQueue = new PriorityQueue<>(7, idComparator);
        addDataToQueue(customerPriorityQueue);
 
        pollDataFromQueue(customerPriorityQueue);
 
    }
 
    //匿名Comparator实现
    public static Comparator<Customer> idComparator = new Comparator<Customer>(){
 
        @Override
        public int compare(Customer c1, Customer c2) {
            return (int) (c1.getId() - c2.getId());
        }
    };
 
    //用于往队列增加数据的通用方法
    private static void addDataToQueue(Queue<Customer> customerPriorityQueue) {
        Random rand = new Random();
        for(int i=0; i<7; i++){
            int id = rand.nextInt(100);
            customerPriorityQueue.add(new Customer(id, "Pankaj "+id));
        }
    }
 
    //用于从队列取数据的通用方法
    private static void pollDataFromQueue(Queue<Customer> customerPriorityQueue) {
        while(true){
            Customer cust = customerPriorityQueue.poll();
            if(cust == null) break;
            System.out.println("Processing Customer with ID="+cust.getId());
        }
    }
 
}
```





# 参考资料

http://www.importnew.com/6932.html

《java 并发编程的艺术》

* any list
{:toc}

