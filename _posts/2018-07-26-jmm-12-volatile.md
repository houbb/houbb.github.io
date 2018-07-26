---
layout: post
title:  JMM-02-votile
date:  2018-07-25 16:37:17 +0800
categories: [Java]
tags: [java, concurrency, thread]
published: true
---

# volatile

Java编程语言允许线程访问共享变量(§17.1)。

作为一个规则，为了确保共享变量得到一致和可靠的更新，线程应该通过获取一个锁来确保它对这些变量的独占使用，按照惯例，这个锁强制对这些共享变量进行互斥。

Java编程语言提供了第二种机制——`volatile`字段，这比出于某些目的锁定更方便。

字段可能宣布挥发性, 在这种情况下,Java内存模型确保所有线程看到一致的变量的值(§17.4)。

## 注意

如果 final 变量也被声明为 volatile，那么这就是编译时错误。

ps: 一个意思是变化可见，一个是永不变化。自然水火不容。






# 参考资料

[se8-jls-8.3.1.4](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.3.1.4)

https://www.cnblogs.com/dolphin0520/p/3920373.html

https://www.ibm.com/developerworks/cn/java/j-jtp06197.html

http://www.importnew.com/23520.html

http://sakyone.iteye.com/blog/668091

http://www.techug.com/post/java-volatile-keyword.html

http://www.infoq.com/cn/articles/ftf-java-volatile

* any list
{:toc}