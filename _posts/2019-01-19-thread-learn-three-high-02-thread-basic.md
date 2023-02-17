---
layout: post
title: 轻松学习多线程三高系列-02-基本信息 
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

# 你需要知道的几个概念

同步： 买空调，买完之后在商店等待，知道商家把你和空调一起送回家，愉快的结束了

异步： 买空调，在网上下单，支付完成后，对你来说整个的过程便已经结束了，虽然没收到货但是你的任务完成了，剩下的时候你就等待收获即可以了。这期间你想干什么就干什么

并发：偏重与多个任务交替执行，而多个任务有可能还是串行的，一会运行A任务一会运行B任务，系统会在俩者之间不停的切换

并行： 真正意义上的"同时执行。

# 多线程到底有几种实现方式?

不同得角度看 有不同得回达 

一般来说 俩种实现方式 分别是实现Runnable接口和继承Thread类 

其实继承Thread类和实现Runnable接口本质上是没有区别的最终都是调用start()方法来新建线程

他们的区别就是

## 实现 runnable

```java
@Override
public void run() {
    if (target != null) {
        target.run();
    }
}
```

是调用 target.run();

## 继承Thread类是重写整个run方法

虽然有许多的方式 线程池 定时器 等等各种写法但是也都只是表面不同但是实质都一样
 
结论： 我们只能通过新建Thread的一种方式来创建线程 但是类里面的run方法有两种实现方式

第一种就是重写Run方法

第二种就是实现Runnable接口把接口实例传给Thread类 除了这些还有一些类似定时器,线程池，lamda等都只是表象本质上还是都是一样的

# 多线程使用runnable与继承Thread类有什么区别

从代码架构角度： 具体实现应该和创建任务分离开来 进而实现代码解耦
                  
继承Thread类每次创建都要新建一个任务这无形之中会带来很大得消耗

大量的线程创建、执行和销毁是非常耗cpu和内存的，这样将直接影响系统的吞吐量，导致性能急剧下降，如果内存资源占用的比较多，还很可能造成OOM

**runnable 在后续可以被线程池等管理节约资源**

java只能单继承，因此如果是采用继承Thread的方法，那么在以后进行代码重构的时候可能会遇到问题，因为你无法继承别的类了

扩展就成了问题闹不闹心

# 多线程如何正确优雅的中断线程

我们要使用 interrupt 来进行通知而非强制 （请求线程停止好处是安全）

![拦截](https://raw.githubusercontent.com/qiurunze123/imageall/master/basethread100.png)

停止一个线程意味着在任务处理完任务之前停掉正在做的操作,有许多方法 首先由已经被废弃掉的stop

suspend()方法就是将一个线程挂起(暂停),resume()方法就是将一个挂起线程复活继续 废弃理由 有可能造成大量资源浪费造成内存泄露

stop 废弃理由 就是相当于把电脑关机了啥也没保存 会造成很严重的后果

com.geekagain.stopthread 此为各种方法中断线程的方式

```java
// 结束run函数，run中含退出标志位()
// 使用interrupt()方法中断线程

public void interrupt() {  ... }   //中断目标线程
public boolean isInterrupted{ ... } //返回目标线程的中断状态
public static boolean interrupted(){ ... } // 清除当前线程的中断状态,并返回它之前的值，这也是清除中断状态的唯一方式
```

interrupt()方法该怎么用呢？

interrupt()其本身并不是一个强制打断线程的方法，其仅仅会修改线程的interrupt标志位，然后让线程自行去读标志位，自行判断是否需要中断

当线程发生阻塞堆积的时候 使用 volatile 的时候无法终止线程

```
当线程等待某些事件发生而被阻塞，又会发生什么？

当然，如果线程被阻塞，它便不能核查共享变量，也就不能停止。

这在许多情况下会发生，例如调用 Object.wait()、ServerSocket.accept() 和 DatagramSocket.receive() 时，这里仅举出一些。

他们都可能永久的阻塞线程。即使发生超时，在超时期满之前持续等待也是不可行和不适当的，所以，要使用某种机制使得线程更早地退出被阻塞的状态。下面就来看一下中断阻塞线程技术
```

while循环在try块里，如果try在while循环里时，应该在catch块里重新设置一下中断标示，因为抛出InterruptedException异常后，中断标示位会自动清除

如果在执行过程中每次循环都会调用slepp和wait方法 则不需要每次迭代都进行检查则不需要每次都设置中断标记

另外不要在你的底层代码里捕获InterruptedException异常后不处理，会处理不当，如下：

```java
void mySubTask(){   
    ...   
    try{   
        sleep(delay);   
    }catch(InterruptedException e){}//不要这样做   
    ...   
}
```

如果你不知道抛InterruptedException异常后如何处理，那么你有如下好的建议处理方式：

1、在catch子句中，调用 Thread.currentThread.interrupt() 来设置中断状态（因为抛出异常后中断标示会被清除)

让外界通过判断 Thread.currentThread().isInterrupted() 标示来决定是否终止线程还是继续下去，应该这样做

```java
void mySubTask() {   
    ...   
    try {   
        sleep(delay);   
    } catch (InterruptedException e) {   
        Thread.currentThread().interrupted();   
    }   
    ...   
}  
```

PS: 从实际使用中，建议使用这种方式。

2、或者，更好的做法就是，不使用try来捕获这样的异常，让方法直接抛出

```java
void mySubTask() throws InterruptedException {   
    ...   
    sleep(delay);   
    ...   
}  
```

## 使用中断信号量中断(非阻塞状态)的线程

中断线程最好的，最受推荐的方式是，使用共享变量（shared variable）发出信号，告诉线程必须停止正在运行的任务。

线程必须周期性的核查这一变量，然后有秩序地中止任务

1. 使用volatile的风险就是有可能终结不了阻塞的状态 如果线程被阻塞，它便不能核查共享变量，也就不能停止。这在许多情况下会发生

2. thread.interrupt()中断阻塞状态线程 volatilego 目录思考 RightWayStopBlockThread ......等示例

# 多线程的生命周期状态纽机流转

当我们在java程序中新建一个线程时,他的状态是new,当我们调用线程的start()方法时 状态被改变runnable 程序调度器都会为runnable线程池 中的线程分配CPU时间并且将它们的状态改变为running 其他的线程状态还有waiting blocked 和 dead

这个说法是正确的的吗？？

## 多线程的生命周期状态纽机流转

https://docs.oracle.com/javase/8/docs/api/index.html?java/lang/Thread.State.html 官方地址

线程大概分为六种状态: NEW RUNNABLE BLOCKED WAITING TIMED_WAITING TERMINATED

![图片](https://raw.githubusercontent.com/qiurunze123/imageall/master/threadbase003.png)

# ThreadAndObject

![ThreadAndObject](https://raw.githubusercontent.com/qiurunze123/imageall/master/threadandobject.png)

## wait 和 notify 基本讲解

作用+用法： 阻塞 唤醒 遇到中断

特点性质  

1. 用的必须先拥有monitor锁

2. notify 只能唤醒其中一个  notifyall 全部唤醒

3. 属于object object 是所有对象的父类 意味着任何对象都可以调用它

4. wait 和notify相对于来说比较底层 类似功能 condition 

## wait 和 notify 原理

[原理](https://raw.githubusercontent.com/qiurunze123/imageall/master/threadandobject1.png)

## 两个概念 入口集 Entry Set 等待集 Wait Set

这个大标题是java monitor 表示的就是我们抢synchronize锁的一系列动作 

从1开始往下开始抢锁进入入口集合 可能有多个线程 

比如我们的锁现在已经被其他人所获取了 我们在想获取就会被统统的放在这个入口集合进行等待 右侧的紫色部分代表的就是他已经获得锁 

知道右侧拿到锁的人释放 我们才能再让入口集中的某一个再去获得锁 虽有拿到的线程锁 释放的途径有俩种 

一个是 6 一个是 3 6就是说他执行完了于是 正常释放 并且退出 一旦拿到锁执行的过程中被wait()了 那么就会进入到左侧的等待集 先进入上边的蓝色的部分 

首先这个release代表它释放了锁 因为wait()这个方法一旦执行了就会释放掉我们的锁 他就是跑到左边的等待集中 

等待 notify 或者 notifyall 它就会进入到下边的集合中 下面的集合 和上面的集合是不一样的 区别在于在等待集中他还是在不停的等待还没有想获取锁的意愿 

还没有被唤醒 一旦到了下面的这个粉红色的区域里面实际上 他和我们的上面绿色是一样 都是在等待现在我们持有锁的线程去释放然后在来抢锁 

所以 5 的acquire 和2的acquire 是一样的 都值得是获取 锁之后再重新回到我们右侧的紫色部分中 回到持有锁的模块中

## 状态转换的特殊情况

1. 从 Object.wait() 状态刚被唤醒时通常不能立刻抢到monitor锁那么就会从waiting先进入blocked状态 抢到锁后再转换到runnable状态

2. 如果发生异常 可以直接跳到种植Terminated状态 不必再遵循路径比如可以从外应直接到terminated


# 线程的重要属性

## 编号（ID）

long,标识不同的线程。

线程编号 因为开始的是++ 最开始为0 所以 main函数为1 

```java
private static synchronized long nextThreadID() {
         return ++threadSeqNumber;
}
```

为什么新建的线程为10几因为 还有许多别的线程初始化了

## 名称（name）

有默认值，但可以设置，主要是给人看的，用于调试和定位问题

默认名称： Thread-

```java
Thread(Runnable target, AccessControlContext acc) {
    init(null, target, "Thread-" + nextThreadNum(), 0, acc);
}

//自增synchronized 可以保证线程没有重名的情况
private static synchronized int nextThreadNum() {
    return threadInitNumber++;
}
```

1. 使用Thread类中的方法setName(名字) void setName(String name) 改变线程名称，使之与参数 name 相同

2. 创建一个带参数的构造方法,参数传递线程的名称;调用父类的带参构造方法,把线程名称传递给父类,让父类(Thread)给子线程起一个名字 Thread(String name) 分配新的 Thread 对象。

## 是否是守护线程（Daemon）

是否为守护线程，这个属性的默认值和相应线程的父线程的该属性值相同，

setDaemon()只能在start前调用。

守护线程通常用于执行一些重要性不是很高的任务，相比于非守护线程（用户线程），他不会影响到虚拟机的停止，

![守护线程](https://raw.githubusercontent.com/qiurunze123/imageall/master/threadbase004-2.png)

**正常停止，则虚拟机会等用户线程都运行完才会停止**。

如果虚拟机进程是直接被kill掉，则用户线程则影响不到了，毕竟老大都没了。

默认值与相应线程的父线程该属性值相同，该属性必须在线程启动前设置！否则会报错

### 为什么不提倡使用守护线程?

比较危险

我们不应该在守护线程中做事情。

一般可以用来执行 hook 钩子函数。

## 优先级 

类型int，该属性本质上是给线程调度器的提示，用于表示应用程序那个线程优先运行。java定义了1~10的10个优先级别。默认值为5（普通优先级别）。

对应一个具体的线程而言，优先级别的默认值与父线程相同。

线程并不保证执行顺序按优先级进行！

优先级使用不当可能导致某些线程用于无法得到运行！

一般情况下不设置即可


线程的优先级说明在程序中该线程的重要性。系统会根据优先级决定首先使用哪个线程，

但这并不意味着优先级低的线程得不到运行，只是它运行的几率比较小而已，比如垃圾回收机制

给线程设置的优先级的意图是希望高优先级的线程被优先执行，但是线程优先级的执行情况是高度依赖于操作系统的

Java的10个线程的优先级会被映射到操作系统的优先级上，不同的操作系统的优先级个数也许更多，也许更少

有的线程特别勤奋他可能会越过线程优先级去为它分配时间因此我们**不能把线程依赖于优先级**

# 多线程异常处理机制

1) 在ThreadCatchProcess 里面你会发现

1. 不加try catch抛出4个异常，都带线程名字

2. 加了try catch,期望捕获到第一个线程的异常，线程234不应该运行，希望看到打印出Caught Exception

3. 执行时发现，根本没有Caught Exception，线程234依然运行并且抛出异常
    
说明线程的异常不能用传统方法捕获

2) 在ThreadCatchProcess2中你会发现 子线程抛出异常主线程不会处理

3) 如果想要设置自己的异常处理器，可以通过 ThreadCatchProcess3 来示例演示 异常处理器Thread.UncaughtExceptionHandler是一个函数式接口

如果设置了异常处理器uncaughtExceptionHandler，那么将会使用这个

如果没设置，将会在祖先线程组中查找第一个重写了uncaughtException的线程组，然后调用他的uncaughtException方法

如果都没有重写，那么使用应用默认的全局异常处理器defaultUncaughtExceptionHandler

如果还是没有设置，直接标准错误打印信息

4) 如果未捕获则可能把错误信息吐给前端 产生麻烦 捕获异常可以报警一类的 最常见的方式是把错误信息写入日志，或者重启线程、或执行其他修复或诊断

# 多线程wait notify notifyall join sleep yield作用与方法详细解读

## 1.wait notify notifyall 解读

1. wait() notify() notifyall() 方法是Object的本地final方法 无法被重写

2. wait() 使当前的线程阻塞 前提是必须获取到锁 一般配合synchronized 关键字使用 即一般在synchronized里面 使用wait notify notifyall

3. 由于wait() notify() notifyall() 在synchronized里面执行 那么说明 当前线程一定是获取锁了

4. 当线程执行wait的时候会释放当前锁让出CPU资源进入等待状态

5. 当执行notify()/notifyall()的时候会唤醒一个或者多个处于正在等待的线程 然后继续执行知道执行完毕synchronized或者再次遇到wait

生产者消费者model (ProducerAndConsumerModel)

## 生产者消费者model (ProducerAndConsumerModel)

1. 为什么要使用生产者消费者模式？

1）消费方和生产方进行解耦更好配合

削峰填谷：可以让生产者/消费者尽可能的平衡。

2）消费方和生产方进行解耦更好配合

## 代码解析： 手写生产者消费者设计模式

com.geekagain.waitnotify.producerandconsumer2

com.geekagain.waitnotify.producerandconsumer

彩蛋：

用两个线程交替打印1--100的奇偶

PrintOddEvenTwoThread synochronized 实现

PrintOddEvenTwoThreadVersion2 wait notify实现

## sleep

相同点：

1.	Wait和sleep方法都可以使线程阻塞，对应线程状态是Waiting或Time_Waiting

2.	wait和sleep方法都可以响应中断Thread.interrupt()

不同点：

1.	wait方法的执行必须在同步方法中进行，而sleep则不需要。 

2.	在同步方法里执行sleep方法时，不会释放monitor锁，但是wait方法会释放monitor锁

3.	sleep 方法短暂休眠之后会主动退出阻塞，而没有指定时间的wait方法则需要被其他线程中断后才能退出阻塞。

4.	wait()和notify(),notifyAll()是Object类的方法，sleep()和yield()是Thread类的方法

sleep 方法可以让线程进入Waiting状态 并且不占用CPU资源但是不会释放锁 直到规定时间后在执行 休眠期间如果被中断会抛出异常并清楚中断状态

## join 作用和方法

新的线程加入我们 我们要等待他执行完再出发

join 期间 线程的状态是 WAITING 状态

## yield 作用和方法

使当前线程从执行状态（运行状态）变为可执行态（就绪状态）。

cpu 会从众多的可执行态里选择，也就是说，当前也就是刚刚的那个线程还是有可能会被再次执行到的，并不是说一定会执行其他线程而该线程在下一次中不会执行到了



# 参考资料

https://github.com/qiurunze123/threadandjuc

https://github.com/qiurunze123/threadandjuc/blob/master/docs/thread-base-002.md

https://github.com/qiurunze123/threadandjuc/blob/master/docs/thread-base-003-2.md

https://github.com/qiurunze123/threadandjuc/blob/master/docs/thread-base-003.md

https://github.com/qiurunze123/threadandjuc/blob/master/docs/thread-base-004.md

https://github.com/qiurunze123/threadandjuc/blob/master/docs/thread-base-006.md

* any list
{:toc}