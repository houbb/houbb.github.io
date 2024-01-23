---
layout: post
title: java base-04 Error and Exception
date:  2019-2-27 09:48:47 +0800
categories: [Java]
tags: [static, java-base]
published: true
---

# Error 与 Exception

二者的不同之处：

## Exception：

1．可以是可被控制(checked) 或不可控制的(unchecked)。

2．表示一个由程序员导致的错误。

3．应该在应用程序级被处理。

## RuntimeException

RuntimeException是那些可能在Java虚拟机正常运行期间抛出的异常的超类。

编译器不会检查RuntimeException异常。

例如，除数为0，抛出ArithmeticException异常。

当程序中可能出现这类异常时，还是会编译通过。虽然java编译器不会检查运行异常，但是我们也可以通过throws进行声明抛出，也可以通过try-catch对它进行捕获处理。

## Error：

1．总是不可控制的(unchecked)。

2．经常用来用于表示系统错误或低层资源的错误。

3．如何可能的话，应该在系统级被捕捉。

# Checked exception 与 Unchecked exception

Java 中定义了两类异常：

## Checked exception: 

这类异常都是Exception的子类。

异常的向上抛出机制进行处理，假如子类可能产生A异常，那么在父类中也必须throws A异常。

可能导致的问题：代码效率低，耦合度过高。

## Unchecked exception

这类异常都是RuntimeException的子类，虽然RuntimeException同样也是Exception的子类，但是它们是非凡的，它们不能通过client code来试图解决，所以称为Unchecked exception。

## 个人理解

有时候这两种异常时界限很模糊，所以个人比较倾向于 Unchecked exception。

但是这种异常也有缺陷，就是使用者觉得没有任何异常。

# 拓展阅读

[如何打印日志]()

# 参考资料

[Java中Error与Exception的区别](https://blog.csdn.net/min996358312/article/details/65729617)

[java基础-Exception与Error包结构，OOM，SOF你遇到哪些情况？](https://www.jianshu.com/p/93385acb1e5d)

* any list
{:toc}