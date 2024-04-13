---
layout: post
title: CShape-08-thread
date:  2017-04-09 21:44:46 +0800
categories: [C#]
tags: [cshape, cshape, lang, .net, dotnet]
published: true
---


# Thread

线程被定义为程序的执行路径。每个线程都定义了一个独特的控制流。如果您的应用程序涉及到复杂的和耗时的操作，那么设置不同的线程执行路径往往是有益的，每个线程执行特定的工作。

线程是**轻量级进程**。一个使用线程的常见实例是现代操作系统中并行编程的实现。使用线程节省了 CPU 周期的浪费，同时提高了应用程序的效率。

到目前为止我们编写的程序是一个单线程作为应用程序的运行实例的单一的过程运行的。但是，这样子应用程序同时只能执行一个任务。为了同时执行多个任务，它可以被划分为更小的线程。


## 线程生命周期

线程生命周期开始于 **System.Threading.Thread** 类的对象被创建时，结束于线程被终止或完成执行时。

![thread](https://raw.githubusercontent.com/houbb/resource/master/img/cshape/2017-03-12-cshape-thread.png)

1、未启动状态

当线程实例被创建但 Start 方法未被调用时的状况。

2、就绪状态

当线程准备好运行并等待 CPU 周期时的状况。

3、不可运行状态

已经调用 Sleep 方法

已经调用 Wait 方法

通过 I/O 操作阻塞

4、死亡状态：当线程已完成执行或已中止时的状况。


## 主线程

在 C# 中，*System.Threading.Thread* 类用于线程的工作。它允许创建并访问多线程应用程序中的单个线程。进程中第一个被执行的线程称为主线程。

当 C# 程序开始执行时，主线程自动创建。使用 Thread 类创建的线程被主线程的子线程调用。您可以使用 Thread 类的 CurrentThread 属性访问线程。

下面的程序演示了主线程的执行

- MainThread.cs

```c#
using System;
using System.Threading;

namespace cshape_test
{
	public class MainThread
	{
		//thread info:True
		static void Main(string[] args)
		{
			Thread thread = Thread.CurrentThread;

			Console.WriteLine("thread info:{0}", thread.IsAlive);
		}
	}
}
```

## 创建线程

线程是通过扩展 Thread 类创建的。扩展的 Thread 类调用 Start() 方法来开始子线程的执行。


- NoParamThread()
 
这个是没有参数的 delegate 方式实现。 如果方法本身有参数，请使用 **ParameterizedThreadStart**。 

```c#
public class MainThread
{
    public static void NoParamThread()
    {
        Console.WriteLine("no param thread...");
    }

    //no param thread...
    static void Main(string[] args)
    {
        ThreadStart threadStart = new ThreadStart(NoParamThread);	//public delegate void ThreadStart();
        Thread thread = new Thread(threadStart);

        thread.Start();
    }
}
```

## 销毁线程

Abort() 方法用于销毁线程。

通过抛出 *threadabortexception* 在运行时中止线程。这个异常**不能**被捕获，如果有 finally 块，控制会被送至 finally 块。

下面的程序说明了这点：


- AbortThreadDemo.cs

```c#
public class AbortThreadDemo
{
    public static void AbortThread()
    {
        try
        {
            for (int i = 0; i < 10; i++)
            {
                Thread.Sleep(500);
                Console.WriteLine("AbortThread i is:{0}", i);
            }
        }
        catch (ThreadAbortException ex)
        {
            Console.WriteLine("ThreadAbortException in catch:{0}", ex);
        }
        finally {
            Console.WriteLine("Couldn't catch the Thread Exception");
        }
    }

    //AbortThread i is:0
    //AbortThread i is:1
    //AbortThread i is:2
    //In Main: Aborting the Child thread
    //Couldn't catch the Thread Exception
    static void Main(string[] args)
    {
        ThreadStart threadStart = new ThreadStart(AbortThread);	
        Thread thread = new Thread(threadStart);
        thread.Start();

        // 停止主线程一段时间
        Thread.Sleep(2000);
        // 现在中止子线程
        Console.WriteLine("In Main: Aborting the Child thread");
        thread.Abort();
    }
}
```

# 线程细说

> [线程细说](http://www.cnblogs.com/leslies2/archive/2012/02/07/2310495.html)

* any list
{:toc}





