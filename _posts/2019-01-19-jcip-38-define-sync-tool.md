---
layout: post
title:  JCIP-38-构建自定义的同步工具 Condition、AQS
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, sh]
published: true
---

# 导读

类库中包含了许多存在状态依赖的类，例如FutureTask、Semaphore和BlockingQueue，他们的一些操作都有前提条件，例如非空，或者任务已完成等。

创建状态依赖类的最简单的房就是在JDK提供了的状态依赖类基础上构造。

例如第八章的ValueLactch，如果这些不满足，可以使用Java语言或者类库提供的底层机制来构造，包括

- 内置的条件队列

- condition

- AQS

这一章就介绍这些

# 状态依赖性管理

在单线程化的程序中，如果调用一个方法时，依赖于状态的先验条件为满足(比如连接池非空），那么这个先验条件就无法变为真。但是在并发程序中，基于状态的先验条件会在其他线程的活动中被改变。对于并发对象，依赖于状态的方法有时可以再不能满足先验条件的情况下选择失败，不过更好的选择是等待先验条件变为真。 

通俗语言：如果前提条件没有满足，则等待其他线程操作使当前线程的前提条件变成真，变成可执行状态，同时唤醒他们有一种依赖于状态的操作，能够被阻塞直到可以继续执行。内部条件队列的机制可以让线程一直阻塞，指导对象已经进入某个特定的状态，该状态下进程可以继续执行，并且在阻塞线程可以进行进一步执行的时候，对象会将它们唤醒。“轮训与休眠”来解决状态依赖操作（费力不讨好）。 

举例：在生产者-消费者中经常会使用有节缓存，中put-take方法，包含一个前提条件：不能从空缓存中获取元素，也不能将已满的缓存中放入元素，那么依赖状态操作可以抛出一个异常或者返回一个错误状态，也可以保持堵塞指导对象进入正确状态。

## 模板代码

- 可阻塞的状态依赖操作的结构

```java
acquire lock on object state
while (precondition does not hold) 
{
    release lock
    wait until precondition might hold
    optionally fail if interrupted or timeout expires
    reacquire lock
}
perform action
release lock
```

## 示例

### 基础类

- 有界缓存实现的基类

下面介绍阻塞有界队列的集中实现方式。

依赖的前提条件是：

不能从空缓存中获取元素
不能将元素放入已满的缓存中
不满足条件时候，依赖状态的操作可以

抛出异常
返回一个错误状态（码）
阻塞直到进入正确的状态

下面是基类，线程安全，但是非阻塞。

```java
public abstract class BaseBoundedBuffer<V> {
    private final V[] buf;
    private int tail;
    private int head;
    private int count;
    
    protected BaseBoundedBuffer(int capacity){
        this.buf = (V[]) new Object[capacity];
    }
    
    protected synchronized final void doPut(V v){
        buf[tail] = v;
        if (++tail == buf.length){
            tail = 0;
        }
        ++count;
    }
    
    protected synchronized final V doTake(){
        V v = buf[head];
        buf[head] = null; //let gc collect
        if (++head == buf.length){
            head = 0;
        }
        --count;
        return v;
    }
    
    public synchronized final boolean isFull(){
        return count == buf.length;
    }
    
    public synchronized final boolean isEmpty(){
        return count == 0;
    }
}
```

### 1、示例：将前提条件的失败传递给调用者 

当不满足前提条件时，有界缓存不会执行相应的操作

先检查再运行”的逻辑解决方案如下，调用者必须自己处理前提条件失败的情况。当然也可以返回错误消息。

当然调用者可以不Sleep，而是直接重试，这种方法叫做忙等待或者自旋等待（busy waiting or spin waiting. ），如果换成很长时间都不变，那么这将会消耗大量的CPU时间！！！

所以调用者自己休眠，sleep让出CPU。

但是这个时间就很尴尬了，sleep长了万一一会前提条件就满足了岂不是白等了从而响应性低，sleep短了浪费CPU时钟周期。另外可以试试yield，但是这也不靠谱。

```java
public class GrumyBoundedBuffer<V> extends BaseBoundedBuffer<V> {
    public GrumyBoundedBuffer(int size){
        super(size);
    }
    
    public synchronized void put(V v){
        if (isFull()){
            throw new BufferFullException();
        }
        doPut(v);
    }
    
    public synchronized V take(){
        if (isEmpty())
            throw new BufferEmptyExeption();
        return doTake();
    }
}
```

缺点：已满情况不应为异常；调用者自行处理失败；sleep：降低响应性；自旋等待：浪费CPU；yield让出CPU

这种方式虽然简单,但是使用起来很麻烦.需要时刻捕获异常.而且还需要调用者重新调用这个方法,重新尝试put/take.

在客户端调用take方法:

```java
public static void main(String [] args) throws InterruptedException {
    GrumpyBoundedBuffer grumpyBoundedBuffer = new GrumpyBoundedBuffer();
    //循环调用
    while(true){
        try{
            //获得对象v,如果成功break,跳出循环
            //如果失败,捕获异常休息1秒
            Object v = grumpyBoundedBuffer.take();
            break;
        } catch (BufferEmptyException e){
        //抛异常以后,休眠一段时间.再尝试
            Thread.sleep(1000);
        }
    }
}
```

上面的代码,在调用失败的去情况下会选择休眠一段时间,然后重新尝试.也可以选择不休眠的方式---被称为忙等待或自旋等待.

两种方式各有利弊:

休眠: 可以避免消耗过多的CPU时间,但是容易睡过头,引发响应慢的问题.

自旋等待: 短时间比较适合用这种方式,但是长时间会浪费系统的资源.

所以,客户端代码身处于自旋产生的低CPU使用率和休眠产生的弱响应性之间的两难境地.

有一种折中的方式是使用Thread.yield方法.让当前线程让出一定的时间给其他线程运行.

### 2、示例：通过轮询与休眠来实现简单的阻塞

- “轮询与休眠“重试机制

```java
public class SleepyBounedBuffer<V> extends BaseBoundedBuffer<V> {
    private static long SLEEP_TIME;
    public SleepyBounedBuffer(int size) {
        super(size);
    }

    public void put(V v) throws InterruptedException {
        while (true){
            synchronized(this){
                if (!isFull()){
                    doPut(v);
                    return;
                }
            }
            Thread.sleep(SLEEP_TIME);
        }
    }
    
    public V take() throws InterruptedException {
        while (true){
            synchronized(this){
                if (!isEmpty()){
                    return doTake();
                }
            }
            Thread.sleep(SLEEP_TIME);
        }
    }
}
```

优点：对于调用者，无需处理失败与异常，操作可阻塞，可中断（休眠时候不要持有锁）

缺点：对于休眠时间设置的权衡（响应性与CPU资源）

使用这种方式,调用者不必像之前那样处理失败和重试.

选择休眠的时间间隔,是在响应性与CPU使用率之间作出的权衡;

休眠的间隔越小,响应性越好,但是CPU的消耗也越高.

休眠间隔是如何影响响应性的:

![休眠间隔](https://blogimg-1256334314.cos.ap-chengdu.myqcloud.com/fce5a397-dac4-4bd8-8b02-7fe83a1e6db7.com/yws/public/resource/94057b27d595f2a41854a358a1ea1c6e/xmlnote/D1813E549880459892EEDED8A9D8EED4/22721)

缓存空间变为可用的时刻与线程被唤醒并在此检查的时刻之间可能有延迟.

这就是使用这种方式的弊端,现在有一种更好的方式,条件队列(condition queue).

条件队列可以让线程挂起,并且能够保证当某个条件成为真时,线程可以及时地苏醒过来.

### 3、条件队列

条件队列可以让一组线程--称作等待集--以某种方式等待相关条件变成真.它也由此得名.

不同于传统的队列,条件队列里面放的是等待相关条件的线程. 存放的是线程-画重点

就像每个Java对象都能当做锁一样,每个对象也能当做条件队列.Object的wait、notify、notifyAll方法构成了内部条件队列的API.

一个对象的内部锁与它的内部条件队列是相关的: 为了能够调用对象X中的任一个条件队列方法,必须持有对象X的锁(也就是说在synchronized块中调用wait啊,notify啊,notifyAll啊这些方法,不在锁里调用会报错).

这是因为"等待基于状态的条件"机制必须和"维护状态一致性"机制紧密地绑定在一起:除非你能检查状态,否则你不能等待条件(这里后面,看代码就明白了,说的就是有if/while的条件判断后面才能跟上wait方法),同时,除非你能改变状态,否则你不能从等待(队列)中释放其他的线程(这里说的就是,改变了先验条件的状态,才能调用notify或notifyAll方法);

先简单的介绍一下wait和notify、notifyAll方法的使用:

wait、notify和notifyAll都是Object类的方法.也就是说每个类都有这三个方法.

使用这三个方法的时候,一定要在被锁保护的代码块中,否则会报java.lang.IllegalMonitorStateException.

wait和notify、notifyAll是配合使用的. 调用wait方法会挂起线程,释放锁,给其它线程一些机会,让前验条件变为真;notify/notifyAll会唤醒挂起的线程,获取锁,继续执行.
使用条件队列实现的方式:

```java
public class BoundedBuffer<V> extends BaseBoundedBuffer <V>{
    protected BoundedBuffer(int capacity) {
        super(capacity);
    }

    /*
    * 注意这里的synchronized,
    * 是必须的否则运行会报java.lang.IllegalMonitorStateException
    * 作用是检查前验条件时保护状态的一致性.不会读到过期数据
    * */
    public synchronized void put(V v) throws InterruptedException {
        /*注意这里这里是while循环
        * 不是单单一个简单的if,这么做有两个理由
        *1. 因为从notify/notifyAll通知的这段时间
        * 很有可能前验条件条件又由真变为假.所以循环判断一次是有必要的
        * 2. notify/notifyAll的区别,notify是选取一个条件队列中的线程通知,
        * 而notifyAll则是通知所有的条件队列,当有多个前验条件时,可能有一些没有通过前验条件的也会被通知
        * 所以需要再次判断
        * */
        while(isFull()){
            /*挂起当前线程,释放锁,给其他线程一些机会
            * 使前验条件为真
            * */
            wait();
        }
        /*存入数据*/
        doPut(v);
        /*通知,告诉下面的take方法里面已经有数据了*/
        notifyAll();
    }

    public synchronized V take() throws InterruptedException {
        while (isEmpty()){
            wait();
        }
        V v = doTake();
        notifyAll();
        return v;
    }
}
```

注解说的很详细了,注意两个方法都是被锁保护的,还有使用while循环而不是用if的理由.

这与之前的"轮询加休眠"方式相比更高效,响应性更佳(不会"睡过头").

wait方法也有限时的版本,为了避免死锁的问题,可以使用限时版本的wait.


# 条件队列

概念：它使用一组线程，能沟通过等待特定条件变成真。

传统队列时一个个数据，条件队列中的元素是一个个等待相关条件的线程。 

每个对象可以作为条件队列，并且object中的wait，notify，notifyall是内部条件队列API

## 名称来历

Condition Queues的名字来源：it gives a group of threads called the wait set a way to wait for a specific condition to become true. Unlike typical queues in which the elements are data items, the elements of a condition queue are the threads waiting for the condition.

每个Java对象都可以是一个锁，每个对象同样可以作为一个条件队列，并且Object的wait、notify和notifyAll就是内部条件队列的API。对象的内置锁（intrinsic lock ）和内置条件队列是关联的，要调用X中的条件队列的任何一个方法，都必须持有对象X上的锁。

Object.wait自动释放锁，并且请求操作系统挂起当前线程，从而其他线程可以获得这个锁并修改对象状态。当被挂起的线程唤醒时。它将在返回之前重新获取锁。

## 1、条件谓词

1) 定义：条件谓词是使某个操作成为状态依赖操作的前提条件。条件谓词是由类中各个状态变量构成的表达式。例如，对于put方法的条件谓词就是“缓存不为空”。

2) 关系：在条件等待中存在一种重要的三元关系，包括加锁、wait方法和一个条件谓词。在条件谓词中包含多个状态变量，而每个状态变量必须由一个锁来保护，因此在测试条件谓词之前必须先持有这个锁。锁对象和条件队列对象（及调用wait和notify等方法所在的对象）必须是同一个对象。

3) 约束: 每次调用wait都会隐式地和特定的条件谓词相关联,当调用特定条件谓词时,调用者必须已经持有与条件队列相关的锁,这个锁必须还保护这组成条件谓词的状态变量

举个例子,什么是条件谓词:

在有限缓存中,只有缓存不为空时take才能执行,否则它必须等待.就take而言,它的条件谓词是"缓存不空", 类似的,put的条件谓词是"缓存不满".

条件谓词是由类的状态变量构成的表达式.

看看之前的代码:

```java
//判断是否满了
public synchronized  final boolean isFull(){
    //如果当前的容量count == 缓存的长度,那就是满了,返回true
    return count == buf.length;
}

//判断是否为空
public synchronized  final boolean isEmpty(){
    return count == 0 ;
}
```

`count == buf.length;` 和 `count == 0;` 就是两个条件谓词

将条件谓词和与之关联的条件队列,以及在条件队列中等待的操作,都写入文档.

在涉及了加锁、wait方法和条件谓词的条件等待中,存在着一种非常重要的三元关系.条件谓词涉及状态变量,而状态变量是由锁保护的,所以在测试条件谓词之前,我们必须先持有锁.

锁对象与条件队列对象(wait和notify方法调用的对象)必须也是同一个对象.

每次调用wait都会隐式地与特定的条件谓词相关联.

当调用特定条件谓词的wait时,调用者必须已经持有了与条件队列相关的锁,这个锁必须同时还保护着组成条件谓词的状态变量.



## 2、过早唤醒

一个条件队列与多个条件谓词相关时，wait方法返回不一定线程所等待的条件谓词就变为真了

```java
void stateDependentMethod() throws InterruptedException
{
  synchronized(lock)  // 必须通过一个锁来保护条件谓词
    {
        while(!condietionPredicate()) 
            lock.wait();
    }
}
```

当使用条件等待时(如Object.wait(), 或Condition.await())：

通常都有一个条件谓词--包括一些对象状态的测试，线程在执行前必须首先通过这些测试

在调用wait之前测试条件谓词，并且从wait中返回时再次进行测试

在一个循环中调用wait

确保使用与条件队列相关的锁来保护构成条件谓词的各个状态变量

当调用wait, notify或notifyAll等方法时，一定要持有与条件队列相关的锁

在检查条件谓词之后以及开始执行相应的操作之前，不要释放锁。

注意,wait的返回并不一定意味着线程正在等待的条件谓词已经变成真了.

一个单独的内部条件队列可以与多个条件谓词共同使用.当有人调用notifyAll,从而唤醒了你的线程时,并不意味着你正在等待的条件谓词现在变成真了.wait甚至可以"假装"返回--不作为对任何线程调用notify的响应.(这就好比烤面包机的线路连接有问题,导致面包尚未烤好,铃声就自己响起来了).

当控制流重新进入调用wait的代码时,它会重新请求与条件队列相关联的锁.但是这时条件谓词不一定为真,有两种可能:

在notify/notifyAll通知的这段时间很有可能条件谓词又由真变为假.

notify是选取一个条件队列中的线程通知,而notifyAll则是通知所有的条件队列,所以被notifyAll通知的wait有可能前验条件不为真.

所以调用wait的地方,要是用while(前验条件)进行循环判断.

### 2.条件队列使用规则

1).通常都有一个条件谓词

2).永远在调用wait之前测试条件谓词,并且在wait中返回后再次测试;

3).永远在循环中调用wait;

4).确保构成条件谓词的状态变量被锁保护,而这个锁必须与这个条件队列相关联;

5).当调用wait、notify和notifyAll时,要持有与条件队列相关联的锁;

6).在检查条件谓词之后,开始执行被保护的逻辑之前,不要释放锁;

## 3、丢失信号量

线程必须等待一个已经为真的条件，但在开始等待之前没有检查条件谓词。

如果线程A通知了一个条件队列，而线程B随后在这个条件队列上等待，那么线程B将不会立即醒来，而是需要另一个通知来唤醒它（导致活跃性下降）

死锁和活锁是活跃度失败的一种形式,另一种活跃度失败的形式是丢失的信号(missed signal).

当一个线程等待的特定条件为真,但是进入等待前检查条件谓词却返回了假,我们称这样就出现了一个丢失的信号.

线程在等待一个已经通知过的消息,它有可能永远等不到这个消息.

例如: 未能在调用wait之前先检测条件谓词,就会导致信号的丢失.

但是使用while()循环的方式,可以避免这种情况的发生.

## 4、通知

无论何时,当你在等待一个条件,一定要确保有人会在条件谓词变为真时通知你.

确保在条件谓词变为真时通过某种方式发出通知挂起的线程

在条件队列API中有两个方法--notify和notifyAll.无论调用哪一个,你都必须持有与条件队列对象相关联的锁.

调用notify的结果是:JVM会从在这个条件队列中等待的众多线程中挑选一个,并把它唤醒;

调用notifyAll会唤醒所有正在这个条件队列中等待的线程.

notify/notifyAll应该尽快释放锁,以确保在wait处阻塞的线程尽可能快的解除阻塞.

### 尽可能使用 notifyAll()

由于会有多个线程因为不同的原因在同一个条件队列中等待,因此不用notifyAll而使用notify是危险的.

这主要是因为单一的通知容易导致同类的线程丢失全部信号.

**notifyAll在大多数情况下都是优于notify的选择.**

发出通知的线程持有锁调用notify和notifyAll，发出通知后应尽快释放锁

多个线程可以基于不同的条件谓词在同一个条件队列上等待，使用notify单一的通知很容易导致类似于信号丢失的问题

- 举个例子:

假设线程A因为谓词PA而在条件队列中等待,同时线程B因为谓词PB也在同一个条件队列中等待.

现在假设PB变成真,线程C执行一个单一的notify:JVM将从它所拥有的众多线程中选择一个并唤醒,如果A被选中,它随后被唤醒,看到PA尚未变成真,转而继续等待.期间本应该可以执行的B却没有被唤醒.这不是严格意义上的"丢失信号"--它更像一个"被劫持的(hijacked)"信号---不过问题是一样的:线程正在等待一个已经(或者本应该)发生过的信号.

### 用notify取代notifyAll的情况:

相同的等待者,只有一个条件谓词与条件队列相关,每个线程从wait返回后执行相同的逻辑,并且,一进一出,一个队条件变量的通知,至多只激活一个线程执行.

可以使用notify：同一条件谓词并且单进单出

使用notifyAll有时是低效的：唤醒的所有线程都需要竞争锁，并重新检验，而有时最终只有一个线程能执行

大多数类都不满足这些条件,因此普遍认可的做法是优先使用notifyAll,而不是单一的notify.

尽管使用notifyAll而非notify可能有些低效,但是这样做更容易确保你的类的行为是正确的.

### 通知优化

我们可以将之前的put和take操作进行优化,之前是每次put/take时通知,现在可以先检查是否已经为空/满然后在进行通知:

优化：条件通知

```java
public synchronized V take() throws InterruptedException {
    while (isEmpty()){
        wait();
    }
    V v = doTake();
    boolean wasFull = isFull();
    //如果满了,才通知
    if(wasFull){
        notifyAll();
    }
    return v;
}
```

尽管"依据条件通知"可以提升性能,但它毕竟只是一种小技巧(而且还让子类的实现变得复杂),应谨慎使用.

单一的通知(notify)和"依据条件通知"都是优化行为.通常进行优化时应该遵循"先让它跑起来,再让它快起来--如果它还没有足够快"的原则:错误地进行优化很容易给程序带来无法预料的活跃度失败.

## 5、示例：阀门类

- 可重新关闭的阀门

```java
public class ThreadGate {
       private boolean isOpen;
       private int generation;

       public synchronized void close() {
              isOpen = false;
       }

       public synchronized void open() {
              ++generation;
              isOpen = true;
              notifyAll();
       }

       public synchronized void await() throws InterruptedException {
              int arrivalGeneration = generation;
              while (!isOpen && arrivalGeneration == generation)
                     wait();
       }
}
```

`arrivalGeneration == generation` 为了保证在阀门打开时又立即关闭时，在打开时通知的线程都可以通过阀门

## 6、子类的安全问题

如果在实施子类化时违背了条件通知或单词通知的某个需求，那么在子类中可以增加合适的通知机制来代表基类
对于状态依赖的类，要么将其等待和通知等协议完全向子类公开（并且写入正式文档），要么完全阻止子类参与到等待和通知等过程中
完全禁止子类化

## 7、封装条件队列

## 8、入口协议和出口协议

对于每个依赖于状态的操作,以及每个修改了其他状态的操作(对于每一个修改状态的操作,并且其他操作对该状态有状态依赖),都应该为其定义并文档化一个入口协议和出口协议.

入口协议就是操作的条件谓词;

出口协议涉及到要检查任何被操作改变的状态变量,确认它们是否引起其他一些条件谓词变为真,如果是,通知相关的条件队列.

AbstractQueuedSynchronizer采用了出口协议的概念,位于java.util.concurrent包下的大部分状态依赖类都构建于它之上.

它没有让Synchronizer类自己去执行通知,而是要求同步方法返回一个值,让这个值说明它的动作是否可能已经阻塞了一个或多个线程.这种显示API的要求,可以避免发生在某些状态转换的过程中"忘记"执行通知.

# 三、显示的Condition对象

Condition是具体的内部条件队列,和显示锁在某种角度上看差不多.

## 条件队列的缺点

内置条件队列的缺点：每个内置锁都只能有一个相关联的条件队列，而多个线程可能在同一条件队列上等待不同的条件谓词，调用notifyAll通知的线程非等待同意谓词

内部条件队列有一些缺陷.每个内部锁只能有一个与之相关联的条件队列,这意味着多个线程可能为了不同的条件谓词在同一个条件队列中等待,而且大多数常见的锁模式都会暴露条件队列对象.

## Condition 更加灵活

如果你想编写一个含有多个条件谓词的并发对象,或者你想获得比条件队列的可见性之外更多的控制权,那么显示的Lock和Condition的实现类提供了一个比内部锁和条件队列更加灵活的选择.

一个Condition和一个单独的Lock相关联,就像条件队列和单独的内部锁相关联一样;

调用与Condition相关联的Lock的Lock.newCondition方法,可以创建一个Condition.

如同Lock提供了比内部加锁要丰富得多的特征集一样,Condition也提供了比内部条件队列要丰富得多的特征集:每个锁可以有多个等待集(因await挂起的线程的集合)、可中断/不可中断的条件等待、基于时限的等待以及公平/非公平队列之间的选择.

不同于内部条件队列,你可以让每个Lock都有任意数量的Condition对象.

Condition对象继承了与之相关的锁的公平性特性;如果是公平的锁,线程会依照FIFO的顺序从Condition.await中被释放.

注意事项!!!:

wait、notify和notifyAll在Condition对象中的对等体是await、signal和signalAll.

但是,Condition继承与Object,这意味着它也有wait和notify方法.

一定要确保使用了正确的版本--await和signal!

将多个条件谓词分开并放到多个等待线程集，Condition使其更容易满足单次通知的需求（signal比signalAll更高效）

锁、条件谓词和条件变量：件谓词中包含的变量必须由Lock来保护，并且在检查条件谓词以及调用await和signal时，必须持有Lock对象

## 示例代码

```java
public class ConditionBoundedBuffer<T> {
    protected final Lock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();//条件：count < items.length
    private final Condition notEmpty  = lock.newCondition();//条件：count > 0
    private final T[] items = (T[]) new Object[100];
    private int tail, head, count;

    public void put(T x) throws InterruptedException {
        lock.lock();
        try {
            while (count == items.length)
                notFull.await();//等到条件count < items.length满足
            items[tail] = x;
            if (++tail == items.length)
                tail = 0;
            ++count;
            notEmpty.signal();//通知读取等待线程
        } finally {
            lock.unlock();
        }
    }

    public T take() throws InterruptedException {
        lock.lock();
        try {
            while (count == 0)
                notEmpty.await();//等到条件count > 0满足
            T x = items[head];
            items[head] = null;
            if (++head == items.length)
                head = 0;
            --count;
            notFull.signal();//通知写入等待线程
            return x;
        } finally {
            lock.unlock();
        }
    }
}
```

使用两个Condition,notFull和notEmpty,明确地表示"非满"与"非空"两个条件谓词.

使用Condition的方式具有更好的可读性.Condition简化了使用单一通知的条件.使用更有效的signal,而不是signalAll,这就会减少相当数量的上下文切换,而且每次缓存操作都会出发对锁的请求.

就像内置的锁和条件队列一样,当使用显示的Lock和Condition时,也必须要满足锁、条件谓词和条件变量之间的三元关系:

涉及条件谓词的变量必须由Lock保护,检查条件谓词时以及调用await和signal时,必须持有Lock对象.

### 显示的Condition和内部条件队列之间的选择

与在ReentrantLcok和Synchronized之间进行选择是一样的:

如果你需要使用一些高级特性,比如公平队列或者让每个锁对应多个等待集,这时使用Condition要好于使用内部条件队列.

(如果你需要使用ReentrantLock的高级特性,并已在使用它,那么你已经做出来选择.)

# 四、Synchronizer解析

ReentrantLock和Semaphore 有很多共同点,扮演了"阀门"的角色,每次只允许有限条目的线程通过它;

线程到达阀门后,可以允许通过(lock或acquire成功返回),可以等待(lock或acquire阻塞),也可以被取消(tryLock或tryAcquire返回false,指明在允许的时间内,锁或者"许可"不可用).

更进一步,它们都允许可中断的、不可中断的、可限时的请求尝试,它们也都允许选择公平、非公平的等待线程队列.

之所以有这么多的共同点,是因为它们的实现都用到了一个共同的基类,AbstractQueuedSynchronizer(AQS)

AQS是一个用来构建锁和Synchronizer的框架.使用AQS能够简单且高效的构造出应用广泛的大量的Synchronizer.

不仅ReentrantLock和Semaphore是构建于AQS的,其他的还有CountDownLatch、ReentrantReadWriteLock、SynchronousQueue和FutureTask.

一个使用内部锁,实现semaphore功能的例子:

## Lock

- 使用Lock实现信号量

```java
public class SemaphoreOnLock {
		//基于Lock的Semaphore实现
       private final Lock lock = new ReentrantLock();
       //条件：permits > 0
       private final Condition permitsAvailable = lock.newCondition();
       private int permits;//许可数

       SemaphoreOnLock(int initialPermits) {
              lock.lock();
              try {
                     permits = initialPermits;
              } finally {
                     lock.unlock();
              }
       }

       //颁发许可，条件是：permits > 0
       public void acquire() throws InterruptedException {
              lock.lock();
              try {
                     while (permits <= 0)//如果没有许可，则等待
                            permitsAvailable.await();
                     --permits;//用一个少一个
              } finally {
                     lock.unlock();
              }
       }

       //归还许可
       public void release() {
              lock.lock();
              try {
                     ++permits;
                     permitsAvailable.signal();
              } finally {
                     lock.unlock();
              }
       }
}
```

- 使用信号量实现Lock

```java
public class LockOnSemaphore {
	//基于Semaphore的Lock实现
    //具有一个信号量的Semaphore就相当于Lock
    private final Semaphore s = new Semaphore(1);

    //获取锁
    public void lock() throws InterruptedException {
           s.acquire();
    }

    //释放锁
    public void unLock() {
           s.release();
    }
}
```

使用Semaphore也同样可以实现内部锁的功能,把许可集设置为1.

在SemaphoreOnLock中,请求许可的操作在两个地方可能会阻塞:

信号量的状态正在被锁保护着

许可不可用时

使用AQS构建的Synchronizer只可能在一个点上发生阻塞,这样降低了上下文的开销,并提高了吞吐量.

# 五、AbstractQueuedSynchronizer

基于AQS构建的同步器勒种，最进步的操作包括各种形式的获取操作和释放操作。获取操作是一种依赖状态的操作，并且通常会阻塞。

如果一个类想成为状态依赖的类，它必须拥有一些状态，AQS负责管理这些状态，通过getState,setState, compareAndSetState等protected类型方法进行操作。这是设计模式中的模板模式。

## AQS 模板

使用AQS的模板如下：

获取锁：首先判断当前状态是否允许获取锁，如果是就获取锁，否则就阻塞操作或者获取失败，也就是说如果是独占锁就可能阻塞，如果是共享锁就可能失败。

另外如果是阻塞线程，那么线程就需要进入阻塞队列。当状态位允许获取锁时就修改状态，并且如果进了队列就从队列中移除。

释放锁:这个过程就是修改状态位，如果有线程因为状态位阻塞的话就唤醒队列中的一个或者更多线程。

```java
boolean acquire() throws InterruptedException {
 while (state does not permit acquire) {
 if (blocking acquisition requested) {
 enqueue current thread if not already queued
 block current thread
 }
 else
 return failure
 }
 possibly update synchronization state
 dequeue thread if it was queued
 return success
}
void release() {
 update synchronization state
 if (new state may permit a blocked thread to acquire)
 unblock one or more queued threads
}
```

要支持上面两个操作就必须有下面的条件：

1. 原子性操作同步器的状态位

2. 阻塞和唤醒线程

3. 一个有序的队列

### 1 状态位的原子操作

这里使用一个32位的整数来描述状态位，前面章节的原子操作的理论知识整好派上用场，在这里依然使用CAS操作来解决这个问题。事实上这里还有一个64位版本的同步器（AbstractQueuedLongSynchronizer），这里暂且不谈。

### 2 阻塞和唤醒线程

标准的JAVA API里面是无法挂起（阻塞）一个线程，然后在将来某个时刻再唤醒它的。JDK 1.0的API里面有Thread.suspend和Thread.resume，并且一直延续了下来。但是这些都是过时的API，而且也是不推荐的做法。

HotSpot在Linux中中通过调用pthread_mutex_lock函数把线程交给系统内核进行阻塞。

在JDK 5.0以后利用JNI在LockSupport类中实现了此特性。

LockSupport.park() LockSupport.park(Object) LockSupport.parkNanos(Object, long) LockSupport.parkNanos(long) LockSupport.parkUntil(Object, long) LockSupport.parkUntil(long) LockSupport.unpark(Thread)

上面的API中park()是在当前线程中调用，导致线程阻塞，带参数的Object是挂起的对象，这样监视的时候就能够知道此线程是因为什么资源而阻塞的。由于park()立即返回，所以通常情况下需要在循环中去检测竞争资源来决定是否进行下一次阻塞。

park()返回的原因有三：

其他某个线程调用将当前线程作为目标调用 unpark；

其他某个线程中断当前线程；

该调用不合逻辑地（即毫无理由地）返回。

其实第三条就决定了需要循环检测了，类似于通常写的while(checkCondition()){Thread.sleep(time);}类似的功能。

### 3 有序队列

在AQS中采用CHL列表来解决有序的队列的问题。

AQS采用的CHL模型采用下面的算法完成FIFO的入队列和出队列过程。该队列的操作均通过Lock-Free（CAS）操作.

自己实现的CLH SpinLock如下：

在AQS中采用CHL列表来解决有序的队列的问题。

AQS采用的CHL模型采用下面的算法完成FIFO的入队列和出队列过程。该队列的操作均通过Lock-Free（CAS）操作.

### 自己实现的 CLH SpinLock

自己实现的CLH SpinLock如下：

```java
class ClhSpinLock {
    private final ThreadLocal<Node> prev;
    private final ThreadLocal<Node> node;
    private final AtomicReference<Node> tail = new AtomicReference<Node>(new Node());

    public ClhSpinLock() {
        this.node = new ThreadLocal<Node>() {
            protected Node initialValue() {
                return new Node();
            }
        };

        this.prev = new ThreadLocal<Node>() {
            protected Node initialValue() {
                return null;
            }
        };
    }

    public void lock() {
        final Node node = this.node.get();
        node.locked = true;
        // 一个CAS操作即可将当前线程对应的节点加入到队列中，
        // 并且同时获得了前继节点的引用，然后就是等待前继释放锁
        Node pred = this.tail.getAndSet(node);
        this.prev.set(pred);
        while (pred.locked) {// 进入自旋
        }
    }

    public void unlock() {
        final Node node = this.node.get();
        node.locked = false;
        this.node.set(this.prev.get());
    }

    private static class Node {
        private volatile boolean locked;
    }
}
```

## 最基本的操作：

获取操作是一种依赖状态的操作，并且通常会阻塞（同步器判断当前状态是否允许获得操作，更新同步器的状态）

释放并不是一个可阻塞的操作时，当执行“释放”操作时，所有在请求时被阻塞的线程都会开始执行

## 状态管理（一个整数状态）：

通过getState，setState以及compareAndSetState等protected类型方法来进行操作

这个整数在不同子类表示任意状态。例：剩余的许可数量，任务状态

子类可以添加额外状态

一个基于AQS的Synchronizer所执行的基本操作,是一些不同形式的获取(acquire)和释放(release).

## 获取操作是状态依赖的操作,总能够阻塞

获取操作是状态依赖的操作,总能够阻塞:

以synchronized和semaphore举例,获取就是获取锁或者许可,并且调用者可能不得不去等待,直到Synchronizer处于可发生的状态.

CountDownLatch的获取意味着"等待,直到闭锁到达它的终止态"

FutureTask则意味着"等待,直到任务已经完成".

## "释放"不是一个可阻塞的操作

"释放"不是一个可阻塞的操作:"释放"可以允许线程在请求执行前阻塞.(被获取阻塞)

AQS管理同步类中的状态:它管理一个关于状态信息的单一整数(比如返回负数代表错误,0代表独占锁,正数代表非独占锁),状态信息可以通过protected类型的getState,setState和compareAndSetState等方法操作.(compareAndSetState下篇博客会详细介绍)

不同的同步装置用状态表达不同的意思:

ReentrantLock用它来表现拥有它的线程已经请求了多少次锁

Semaphore用它来表现剩余的许可数

FutureTask用它来表现任务的状态(尚未开始、运行、完成和取消).

Synchronizer也可以自己管理一些额外的状态变量:

ReentrantLock保存了当前锁的所有者的追踪信息,这样它就能区分出是重进入的(reentrant)还是竞争的(contended)条件锁.

AQS的获取操作可能是独占的,例如ReentrantLock,同一时刻只能有一个线程获取;也可能是非独占的,就像Semaphore和CountDownLatch一样.这取决于不同的Synchronizer.

一个获取分为两步:

Synchronizer判断当前状态是否被获得;如果是,就让线程执行,如果不是,获取操作阻塞或失败.例如:想获取锁,锁必须是未被占有的;而如果想成功地获取闭锁,闭锁必须未处于终止状态.

获取同步装置以后,可能需要更新同步装置的状态;一个想获取Synchronizer的线程会影响到其他线程是否能够获取它.

例如:

获取锁的操作将锁的状态从"未被占有"改变为"已被占有";

从Semaphore中获取许可的操作会减少剩余许可的数量.

另一方面,一个线程对闭锁的请求操作却不会影响到其它线程是否能够获取他,所以获取闭锁的操作不会改变闭锁的状态(前面两个锁和信号量,都会在消耗完之后阻止其他线程继续获取,但是闭锁可以无限获取,不影响其他线程)

支持独占获取的Synchronizer应该实现tryAcquire、tryRelease和isHeldExclusively这几个受保护的方法.

支持共享获取的Synchronizer应该实现tryAcquireShared和tryReleaseShared.

Synchronizer的子类会根据其acquire和release的语意,使用getState、setState以及compareAndSetState来检查并更新状态,然后通过返回的状态值告诉基类这次"获取"或"释放"的尝试是否成功.

ReentrantLock的内部类Sync,注意它的nonfairTryAcquire和tryRelease,

都是根据getState来进行判断:

```java
abstract static class Sync extends AbstractQueuedSynchronizer {
    private static final long serialVersionUID = -5179523762034025860L;
    /**
     * Performs {@link Lock#lock}. The main reason for subclassing
     * is to allow fast path for nonfair version.
     */
    abstract void lock();
    /**
     * Performs non-fair tryLock.  tryAcquire is implemented in
     * subclasses, but both need nonfair try for trylock method.
     */
    final boolean nonfairTryAcquire(int acquires) {
        final Thread current = Thread.currentThread();
        int c = getState();
        if (c == 0) {
            if (compareAndSetState(0, acquires)) {
                setExclusiveOwnerThread(current);
                return true;
            }
        }
        else if (current == getExclusiveOwnerThread()) {
            int nextc = c + acquires;
            if (nextc < 0) // overflow
                throw new Error("Maximum lock count exceeded");
            setState(nextc);
            return true;
        }
        return false;
    }
    protected final boolean tryRelease(int releases) {
        int c = getState() - releases;
        if (Thread.currentThread() != getExclusiveOwnerThread())
            throw new IllegalMonitorStateException();
        boolean free = false;
        if (c == 0) {
            free = true;
            setExclusiveOwnerThread(null);
        }
        setState(c);
        return free;
    }
    protected final boolean isHeldExclusively() {
        // While we must in general read state before owner,
        // we don't need to do so to check if current thread is owner
        return getExclusiveOwnerThread() == Thread.currentThread();
    }
    final ConditionObject newCondition() {
        return new ConditionObject();
    }
    // Methods relayed from outer class
    final Thread getOwner() {
        return getState() == 0 ? null : getExclusiveOwnerThread();
    }
    final int getHoldCount() {
        return isHeldExclusively() ? getState() : 0;
    }
    final boolean isLocked() {
        return getState() != 0;
    }
    /**
     * Reconstitutes the instance from a stream (that is, deserializes it).
     */
    private void readObject(java.io.ObjectInputStream s)
        throws java.io.IOException, ClassNotFoundException {
        s.defaultReadObject();
        setState(0); // reset to unlocked state
    }
}
```

下面的代码中的tryAcquireShared返回不同的值,代表不同的结果

从tryAcquireShared返回一个负数,说明获取操作失败;

返回零说明Synchronizer是被独占获取的;

返回正值说明Synchronizer是被非独占获取的.

```java
static final class FairSync extends Sync {
    private static final long serialVersionUID = 2014338818796000944L;

    FairSync(int permits) {
        super(permits);
    }

    protected int tryAcquireShared(int acquires) {
        for (;;) {
            if (hasQueuedPredecessors())
                return -1;
            int available = getState();
            int remaining = available - acquires;
            if (remaining < 0 ||
                compareAndSetState(available, remaining))
                return remaining;
        }
    }
}
```

对于tryRelease和tryReleaseShared方法来说,如果能够释放一些正在尝试获取Synchronizer的线程,解除这些线程的阻塞,那么这两个方法会返回true.

## 5.1 一个简单的闭锁

```java
public class OneShotLatch {
    private final Sync sync = new Sync();

    public void signal(){
        sync.releaseShared(0);
    }


    public void await() throws InterruptedException {
        //此方法会请求tryAcquireShared()
        sync.acquireSharedInterruptibly(0);
    }


    private class Sync extends AbstractQueuedSynchronizer{

        @Override
        protected int tryAcquireShared(int ignored){
            // 如果闭锁打开则成功(state == 1),否则失败
            return (getState() == 1) ? 1 : -1;
        }

        @Override
        protected boolean tryReleaseShared(int ignored){
            //闭锁现在已打开
            setState(1);
            //现在其他线程可以获得比索
            return true;
        }
    }
}
```

最初闭锁是关闭的;任何调用await的线程都会阻塞,直到打开闭锁. 

一旦闭锁被一个signal调用打开,等待中的线程就会被释放,而且随后到达闭锁的线程也会被允许执行.

- signal方法详解:

调用signal方法,调用releaseShare把闭锁的状态打开, 通过返回值表明Synchronizer处于完全被释放的状态.

让AQS要求所有等待中的线程尝试去重新请求Synchronizer,并且由于tryAcquireShared会返回成功,所以这次请求会成功.

通过AQS提供的限时版本的获取方法,可以给OneShotLatch提供显示的请求操作以及检查闭锁状态的能力.

以上的方法是通过委托实现的,直接扩展AQS也是可以的,但是存在其弊端:

破坏OneShotLatch接口的简洁性(只有两个方法)

虽然AQS的公共方法不允许调用者破坏闭锁的状态,调用者仍然很容易误用它.

java.util.concurrent中没有一个Synchronizer是直接扩展AQS的,它们都委托了AQS的私有内部子类.

# 六、java.util.concurrent 同步器类中的AQS

## 1、ReentrantLock

ReentrantLock只支持独占方式的获取操作，因此它实现了tryAcquire、tryRelease和isHeldExclusively

ReentrantLock将同步状态用于保存锁获取操作的次数，或者正要释放锁的时候，才会修改这个变量

ReentrantLock使用同步状态持有锁获取操作的计数,还维护一个owner变量来持有当前拥有的线程标识符.

只有当前线程刚刚获取到锁,或者刚刚释放了锁的时候,才会修改owner.

### 代码

非公平的ReentrantLock中tryAcquire的实现:

```java
protected boolean tryAcquire(int ignored){
    final Thread current = Thread.currentThread();
    int c = getState();
    if(c == 0){
        if(compareAndSetState(0,1)){
            owner = current;
            return true;
        }
    }else if(current == owner){
        setState(c+1);
        return true;
    }
    return false ;
}
```

在tryRelease中,它检查owner域以确保当前线程在执行一个unlock操作之前,已经拥有了锁;

在tryAcquire中,它使用这个域来区分重进入的获取操作尝试与竞争的获取操作尝试.

当一个线程尝试获取锁时,tryAcquire会首先请求锁的状态:

如果锁未被占有,它会尝试更新锁的状态,表明锁被占有.因为状态可能在被观察后的几条指令中被修改,所以tryAcquire使用compareAndSetState来尝试原子地更新状态,

表明这个锁已经被占有,并确保状态自最后一次观察后没有被修改过.

如果锁状态表明它已经被占有,如果当前线程是锁的持有者,那么获取操作计数会递增;如果当前线程不是锁的持有者,那么获取操作的尝试会失败.

## 2、Semaphore 与 CountDownLatch

Semaphore将AQS的同步状态用于保存当前可用许可的数量；

CountDownLatch使用AQS的方式与Semaphore很相似，在同步状态中保存的是当前的计数值

Semaphore使用AQS类型的同步状态持有当前可用许可的数量,tryAcquireShared方法首先计算剩余许可的数量

如果没有足够的许可,会返回一个值,表明获取操作失败.

如果还有充足的许可剩余,tryAcquireShared会使用compareAndSetState,尝试原子地递减许可的计数.

如果成功会返回一个值,表明获取操作成功.

返回值同样加入了是否允许其他共享获取尝试能否成功的信息,如果可以的话,其他等待的线程同样会解除阻塞.

无论是没有足够的许可,还是tryAcquireShared可以原子地更新许可数,以响应获取操作,while循环都会终止.

尽管任何给定的compareAndSetState调用,都可能由于与另一个线程的竞争而失败,这使它会重试,在重试过合理的次数后,两个终止条件的一个会变成真.

类似地,tryReleaseShared会递增许可计数,这会潜在地解除等待中的线程的阻塞,不断地重试直到成功地更新.tryReleaseShared的返回值表明,释放操作是否可以解除其它线程的阻塞.

### 代码

Semaphore的tryAcquireShared和tryAcquireShared方法:

```java
protected int tryAcquireShared(int acquires){
    while(true){
        int available = getState();
        int remaining = available - acquires;
        if(remaining < 0 || compareAndSetState(available,remaining)){
            return remaining;
        }
    }
}

protected boolean tryReleaseShared(int releases){
    while(true){
        int p = getState();
        if(compareAndSetState(p,p+releases)){
            return true;
        }
    }
}
```

CountDownLatch使用AQS的方式与Semaphore相似:同步状态持有当前的计数.

countDown方法调用release,后者会导致计数器递减,并且在计数器已经到达零的时候,解除所有等待线程的阻塞,release无法阻塞线程,也就是无论调用多少次countDown方法都不会阻塞线程,只有调用await的时候,并且未消耗点许可集的时候,才会造成阻塞;

await调用acquire,如果计数器已经到达零,acquire会立即返回,否则它会被阻塞.

## 3、FutureTask

在FutureTask中，AQS同步状态被用来保存任务的状态

FutureTask还维护一些额外的状态变量，用来保存计算结果或者抛出的异常

Future.get() 的语意非常类似于闭锁--如果发生了某些事件(FutureTask表现的任务的完成或取消),线程就可以执行,否则线程会留在队列中,直到有事件发生.

FutureTask使用AQS类型的同步状态来持有任务的状态--运行、完成或取消.

FutureTask也维护了一些额外的状态变量,来持有计算的结果或者抛出的异常.它还维护了一个引用,指向正在运行计算任务的线程(如果它当前正处于运行状态),这样如果任务被取消,就可以中断该线程.

## 4、ReentrantReadWriteLock

单个AQS子类将同时管理读取加锁和写入加锁

ReentrantReadWriteLock使用了一个16位的状态来表示写入锁的计数，并且使用了另一个16位的状态来表示读取锁的计数

在读取锁上的操作将使用共享的获取方法与释放方法，在写入锁上的操作将使用独占的获取方法与释放方法

AQS在内部维护了一个等待线程队列，其中记录了某个线程请求的是独占访问还是共享访问：写操作独占获取；读操作可使第一个写之前的读都获取

ReadWriteLock的接口要求了两个锁---一个读者锁和一个写者锁.

但是在基于AQS的ReentrantReadWriteLock实现中,一个单独的AQS子类管理了读和写的加锁.

ReentrantReadWriteLock使用一个16位的状态为写锁(write-lock)计数,使用另一个16位的状态为读锁(read-lock)计数.

对读锁的操作使用共享的获取与释放的方法;对写锁的操作使用独占的获取与释放的方法.

AQS在内部维护一个等待线程的队列,持续追踪一个线程是否被独占请求,或者被共享访问.

在ReentrantReadWriteLock中,当锁可用时,如果位于队列头部的线程同时也正在准备写访问,线程会得到锁;

如果位于队列头部的线程正在准备读访问,那么队列中所有首个写线程之前的线程都会得到锁.

# 总结

如果你需要实现一个依赖于状态的类---如果不能满足依赖于状态的前提条件,类的方法必须阻塞.

最佳的策略通常是将它构建于现有的库类之上,比如Semaphore、BlockingQueue或者CountDownLatch.

但是,有时现有的库类不能提供足够的功能;

在这种情况之下,你可以使用内部条件队列、显式Condition对象或者AbstractQueuedSynchronizer,来构建属于自己的Synchronizer.

由于"管理状态的独立性"机制必须紧密依赖于"确保状态一致性"机制,所以内部条件队列与内部锁紧密地绑定到了一起.

类似地,显式的Condition与显示的Lock也是紧密地绑定到一起的,相比于内部条件队列,它还提供了一个可扩展的特征集,包括"多等待集每锁",可中断或不可中断的条件等待,公平或非公平的队列,以及基于最终时限的等待.

# 参考资料

《JCIP》P275

[并发编程学习笔记之构建自定义的同步工具(十一)](https://www.520mwx.com/view/16415)

[Java并发编程实战系列14之构建自定义的同步工具 (Building Custom Synchronizers)](https://yq.aliyun.com/articles/636089)

[Java并发编程中构建自定义同步工具](https://www.jb51.net/article/64010.htm)

https://blog.csdn.net/yccowdy/article/details/77891650

https://www.cnblogs.com/f91og/p/7001179.html

* any list
{:toc}