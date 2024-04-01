---
layout: post
title:  JCIP-21-thread stop 线程关闭
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, thread, sh]
published: true
---


想要启动线程的话，只需调用 Thread类 的start()方法，并在run()方法中定义需要执行的内容即可，灰常滴简单，但如何优雅地停止线程呢？就值得好好思考玩味了。

# 1. 为什么需要停止线程

通常情况下我们是不会去手动去停止的，而是等待线程自然运行至结束停止，但是在我们实际开发中，会有很多情况中我们是需要提前去手动来停止线程，比如程序中出现异常错误，比如使用者关闭程序等情况中。

在这些场景下如果不能很好地停止线程那么就会导致各种问题，所以正确的停止程序是非常的重要的。

正确优雅地停止线程，在这些特殊的业务场景下就会显得格外有价值了。也正是因此，能够想出一个健壮性足够好，并且能够安全处理好各种业务场景下，正确停止线程的方法程序更是非常的重要。

但遗憾的是，Java并没有直接给出简单易用且安全优雅的方式来停止线程，这就需要我们想一些办法来曲线救国了。

# 2. 强行停止线程会怎样？

在我们平时的开发中我们很多时候都不会注意线程是否是健壮的，是否能优雅的停止，很多情况下都是贸然的强制停止正在运行的线程，这样可能会造成一些安全问题，为了避免造成这种损失，我们应该给与线程适当的时间来处理完当前线程的收尾工作， 而不至于影响我们的业务。

对于 Java 而言，最正确的停止线程的方式是使用 interrupt。但 interrupt仅仅起到通知被停止线程的作用。

而对于被停止的线程而言，它拥有完全的自主权，它既可以选择立即停止，也可以选择一段时间后停止，也可以选择压根不停止。

可能很多同学会疑惑，既然这样那这个存在的意义有什么呢，其实对于 Java 而言，期望程序之间是能够相互通知、协作的管理线程。

在java中有以下3种方法可以终止正在运行的线程：

- 使用退出标志，使线程正常退出，也就是当run方法完成后线程终止。

- 使用stop方法强行终止，但是不推荐这个方法，因为stop和suspend及resume一样都是过期作废的方法。

- 使用interrupt方法中断线程。

比如我们有线程在进行 io 操作时，当程序正在进行写文件操作，这时候接收到终止线程的信号，那么它不会立马停止，它会根据自身业务来判断该如何处理，是将整个文件写入成功后在停止还是不停止等都取决于被通知线程的处理。

如果这里立马终止线程就可能造成数据的不完整性，这是我们业务所不希望的结果。

# 3. 正确停止线程的方式

## 3.1 interrupt 停止线程

关于 interrupt 的使用我们不在这里过多阐述，其核心就是通过调用线程的 isInterrupt() 方法进而判断中断信号，当线程检测到为 true 时则说明接收到终止信号，此时我们需要做相应的处理。

我们编写一个简单例子来看

```java
public static void main(String[] args) {
    Thread thread = new Thread(() -> {
      while (true) {
        //判断当前线程是否中断
        if (Thread.currentThread().isInterrupted()) {
          System.out.println("线程1 接收到中断信息，中断线程...中断标记：" + Thread.currentThread().isInterrupted());
          //跳出循环，结束线程
          break;
        }
        System.out.println(Thread.currentThread().getName() + "线程正在执行...");
 
 
      }
    }, "interrupt-1");
    //启动线程 interrupt-1
    thread.start();
 
 
    //创建 interrupt-2 线程
    new Thread(() -> {
      int i = 0;
      while (i <20){
        System.out.println(Thread.currentThread().getName()+"线程正在执行...");
        if (i == 8){
          System.out.println("设置线程中断...." );
          //通知线程1 设置中断通知
          thread.interrupt();
 
 
        }
        i ++;
        try {
          TimeUnit.MILLISECONDS.sleep(1);
        } catch (InterruptedException e) {
          e.printStackTrace();
        }
      }
    },"interrupt-2").start();
  }
```

我们创建了两个线程，第一个线程我们其中做了中断信号检测，当接收到中断请求则结束循环，自然的终止线程，在线程二中，我们模拟当执行到 i==8 时通知线程1终止，这种情况下我们可以看到程序自然的进行的终止。

## 3.2 休眠时中断

这里有个思考：当处于 sleep 时，线程能否感受到中断信号？

对于这一特殊情况，我们可以将上述代码稍微修改即可进行验证，我们将线程1的代码中加入 sleep 同时让睡眠时间加长，让正好线程2通知时线程1还处于睡眠状态，此时观察是否能感受到中断信号。

```java
Thread thread = new Thread(() -> {
      while (true) {
        //判断当前线程是否中断
        if (Thread.currentThread().isInterrupted()) {
          System.out.println("线程1 接收到中断信息，中断线程...中断标记：" + Thread.currentThread().isInterrupted());
          Thread.interrupted(); //对线程进行复位，由 true 变成 false
          System.out.println("经过 Thread.interrupted() 复位后，中断标记：" + Thread.currentThread().isInterrupted());
 
 
          //再次判断是否中断，如果是则退出线程
          if (Thread.currentThread().isInterrupted()) {
            break;
          }
          break;
        }
        System.out.println(Thread.currentThread().getName() + "线程正在执行...");
        try {
          TimeUnit.SECONDS.sleep(5);
        } catch (InterruptedException e) {
          e.printStackTrace();
        }
      }
    }, "interrupt-1");
    //启动线程 interrupt-1
    thread.start();
```

我们执行修改后的代码，发现如果 sleep、wait等可以让线程进入阻塞的方法使线程休眠了，而处于休眠中的线程被中断，那么线程是可以感受到中断信号的，并且会抛出一个 InterruptedException异常，同时清除中断信号，将中断标记位设置成 false。

这样一来就不用担心长时间休眠中线程感受不到中断了，因为即便线程还在休眠，仍然能够响应中断通知，并抛出异常。

对于线程的停止，最优雅的方式就是通过 interrupt 的方式来实现，如 InterruptedException 时，再次中断设置，让程序能够续继续进行终止操作。

不过对于 interrupt 实现线程的终止在实际开发中发现使用的并不是很多，很多都可能喜欢另一种方式，通过标记位。

## 3.3 用 volatile 标记位的停止方法

关于 volatile 作为标记位的核心就是他的可见性特性，我们通过一个简单代码来看：

```java
public class MarkThreadTest {
 
 
      //定义标记为 使用 volatile 修饰
      private static volatile  boolean mark = false;
 
 
      @Test
      public void markTest(){
        new Thread(() -> {
          //判断标记位来确定是否继续进行
          while (!mark){
            try {
              TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
              e.printStackTrace();
            }
            System.out.println("线程执行内容中...");
          }
        }).start();
 
 
        System.out.println("这是主线程走起...");
        try {
          TimeUnit.SECONDS.sleep(10);
        } catch (InterruptedException e) {
          e.printStackTrace();
        }
        //10秒后将标记为设置 true 对线程可见。用volatile 修饰
        mark = true;
        System.out.println("标记位修改为："+mark);
      }
    }
```

设置标记，让线程可见进而终止程序，这里我们需要讨论的是，使用 volatile 是真的都是没问题的，上述场景是没问题，但是在一些特殊场景使用 volatile 时是存在问题的，这也是需要注意的！

### 3.2.1 volatile 修饰标记位不适用的场景

```java
public class Producter implements Runnable {
 
 
    //标记是否需要产生数字
    public static volatile boolean mark = true;
 
 
    BlockingQueue<Integer> numQueue;
 
 
    public Producter(BlockingQueue numQueue){
      this.numQueue = numQueue;
    }
 
 
    @Override
    public void run() {
      int num = 0;
      try {
        while (num < 100000 && mark){
          //生产数字，加入到队列中
          if (num % 50 == 0 ){
            System.out.println(num + " 是50的倍数，加入队列");
            numQueue.put(num);
          }
          num++;
        }
      } catch (InterruptedException e) {
        e.printStackTrace();
      }finally {
        System.out.println("生产者运行结束....");
      }
    }
  }
```

首先，声明了一个生产者 Producer，通过 volatile标记的初始值为 true 的布尔值 mark 来停止线程。

而在 run()方法中，while 的判断语句是 num 是否小于 100000 及 mark 是否被标记。

while 循环体中判断 num如果是 50 的倍数就放到 numQueue 仓库中，numQueue 是生产者与消费者之间进行通信的存储器，当 num 大于 100000或被通知停止时，会跳出 while 循环并执行 finally 语句块，告诉大家“生产者运行结束”。

```java
public class Consumer implements Runnable{
 
 
    BlockingQueue numQueue;
 
 
    public Consumer(BlockingQueue numQueue){
      this.numQueue = numQueue;
    }
 
 
    @Override
    public void run() {
 
 
      try {
        while (Math.random() < 0.97){
          //进行消费
          System.out.println(numQueue.take()+"被消费了...");;
          TimeUnit.MILLISECONDS.sleep(100);
        }
      } catch (InterruptedException e) {
        e.printStackTrace();
      } finally {
        System.out.println("消费者执行结束...");
        Producter.mark = false;
        System.out.println("Producter.mark = "+Producter.mark);
      }
 
 
    }
  }
```

而对于消费者 Consumer，它与生产者共用同一个仓库 numQueue，在 run() 方法中我们通过判断随机数大小来确定是否要继续消费，刚才生产者生产了一些 50 的倍数供消费者使用，消费者是否继续使用数字的判断条件是产生一个随机数并与 0.97 进行比较，大于 0.97 就不再继续使用数字。

```java
public static void main(String[] args) {
    BlockingQueue queue = new LinkedBlockingQueue(10);
 
 
    Producter producter = new Producter(queue);
    Consumer consumer = new Consumer(queue);
 
 
    Thread thread = new Thread(producter,"producter-Thread");
    thread.start();
    new Thread(consumer,"COnsumer-Thread").start();
 
 
  }
```

主函数中很简单，创建一个 公共仓库 queue 长度为10，然后传递给两个线程，然后启动两个线程，当我们启动后要注意，我们的消费是有睡眠 100 毫秒，那么这个公共仓库必然会被生产者装满进入阻塞，等待消费。

当消费者不再需要数据，就会将 canceled 的标记位设置为 true，理论上此时生产者会跳出 while 循环，并打印输出“生产者运行结束”。

然而结果却不是我们想象的那样，尽管已经把 Producter.mark设置成 false，但生产者仍然没有停止，这是因为在这种情况下，生产者在执行 numQueue.put(num) 时发生阻塞，在它被叫醒之前是没有办法进入下一次循环判断 Producter.mark的值的，所以在这种情况下用 volatile是没有办法让生产者停下来的，相反如果用 interrupt语句来中断，即使生产者处于阻塞状态，仍然能够感受到中断信号，并做响应处理。

# 总结

通过上面的介绍我们知道了，线程终止的主要两种方式，一种是 interrupt 一种是volatile ，两种类似的地方都是通过标记来实现的，不过interrupt 是中断信号传递，基于系统层次的，不受阻塞影响，而对于 volatile ，我们是利用其可见性而顶一个标记位标量，但是当出现阻塞等时无法进行及时的通知。

在我们平时的开发中，我们视情况而定，并不是说必须使用 interrupt ，在一般情况下都是可以使用 volatile 的，但是这需要我们精确的掌握其中的场景。

# 参考资料

[如何优雅的关闭线程池](https://blog.csdn.net/u011397981/article/details/131325310)

* any list
{:toc}