---
layout: post
title:  JCIP-35-并发程序的测试
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, test, sh]
published: true
---

# 并发程序的测试

编写并发程序时候，可以采取和串行程序相同的编程方式。唯一的难点在于，并发程序存在不确定性，这种不确定性会令程序出错的地方远比串行程序多，出现的方式也没有固定规则。这对程序的应用会造成一些困难，那么如何在测试中，尽可能的暴露出这些问题，并且了解其性能瓶颈，这也是对开发者带来新的挑战。

本篇基于多线程知识，梳理一些多线程测试需要掌握的方法和原则，以期望可能的在开发阶段，就暴露出并发程序的安全性和性能问题，为多线程能够高效安全的运行提供帮助。

## 分类

并发程序中潜在错误的发生并不具有确定性，而是随机的。

并发测试大致可以分为两类：安全性测试与活跃性测试。

安全性测试我们可以定义为“不发生任何错误的行为”，也可以理解为保持一致性。比如i++操作，但单线程情况下，循环20次，i=20，可是在多线程情况下，如果总共循环20次，结果不为20，那么这个结果就是错误的，说明出现了错误的线程安全问题。我们在测试这种问题的时候，必须要增加一个”test point”保证其原子性同时又不影响程序的正确性。以此为判断条件执行测试代码，关于“test point”如何做，我们后续再讨论。

活跃性测试定义为“某个良好的行为终究会发生”，也可以为理解为程序运行有必然的结果，不会出现因某个方法阻塞，而运行缓慢，或者是发生了线程死锁，导致一直等待的状态等。

与活跃性测试相关的是性能测试。主要有以下几个方面进行衡量：吞吐量，响应性，可伸缩性。

安全性测试：通常会采用测试不变性条件的形式，即判断某个类的行为是否与其规范保持一致

活跃性测试：进展测试和无进展测试两方面，这些都是很难量化的（性能：即吞吐量，响应性，可伸缩性测试）

### 基本概念

吞吐量：一组并发任务中已完成任务所占的比例。或者说是一定时间内完成任务的数量。

响应性：请求从发出到完成之间的时间

可伸缩性：在增加更多资源（CPU，IO,内存），吞吐量的提升情况。

# 一、正确性测试

重点：找出需要检查的不变性条件和后验条件

安全性测试，如前面所说是“不发生任何错误的行为”，也是要对其数据竞争可能引发的错误进行测试。这也是我们需要找到一个功能中并发的的“test point”，并对其额外的构造一些测试。而且这些测试最好不需要任何同步机制。

我们通过一个例子来进行说明。

比如ArrayBlockingQueue，我们知道这个class是采用一个有界的阻塞队列来实现的生产-消费模式的。如果对其测试并发问题的，重要的就是对put和take方法进行测试，一种有效的方法就是检查被放入队列中和出队列中的各个元素是否相等。如果出现数据安全性的问题，那么必然入队列的值和出队列的值没有发生对应，结果也不尽相同。比如多线程情况下，我们把所有入列元素和出列元素的校检和进行比较，如果二者相等，那么表明测试成功。

为了保证其能够测试到所有要点，需要对入队的值进行随机生成，令每次测试得到的结果不尽相同。另外为了保证其公平性，要保证所有的线程一起开始运算，防止先进行的程序进行串行运算。

## 1、对基本单元的测试——串行的执行

```java
public class BoundedBufferTests {
    
    @Test
    public void testIsEmptyWhenConstructed(){
        BoundedBuffer<String> bf = new BoundedBuffer<String>(10);
        assertTrue(bf.isEmpty());
    }
    
    @Test
    public void testIsFullAfterPuts() throws InterruptedException{
        BoundedBuffer<String> bf = new BoundedBuffer<String>(10);
        for (int i=0; i<10; i++){
            bf.put("" + i);
        }
        assertTrue(bf.isFull());
        assertTrue(bf.isEmpty());
    }
}
```

## 2、对阻塞操作的测试

每个测试必须等他创建的所有线程结束后才可以结束（join）

要测试一个方法的阻塞行为，类似于测试一个抛出异常的方法：如果这个方法可以正常返回，那么就意味着测试失败。

在测试方法的阻塞行为时，将引入额外的复杂性：当方法被成功地阻塞后，还必须使方法解除阻塞。（中断）

```java
public void testTaskBlocksWhenEmpty(){
    final BoundedBuffer<Integer> bb = new BoundedBuffer<>(10);
    Thread taker = new Thread(){
        @Override
        public void run() {
            try {
                   int unused =  bb.take();
                fail(); //不应执行到这里
            } catch (InterruptedException e) {
            }
        }
    };
    try {
        taker.start();
        Thread.sleep(1000);
        taker.interrupt();
        taker.join(2000); //保证即使taker永久阻塞也能返回
        assertFalse(taker.isAlive());
    } catch (InterruptedException e) {
        fail();
    }
}
```

## 3、安全性测试

构建对并发类的安全性测试中，需要解决的关键问题在于，要找出那些容易检查的属性，这些属性在发生错误的情况下极有可能失败，同时又不会使得错误检查代码人为地限制并发性。理想的情况是，在测试属性中不需要任何同步机制

例：通过计算入列和出列的校验和进行检验（使用栅栏保证线程均运行到可检验处再检验）

```java
public class PutTakeTest extends TestCase {
      protected static final ExecutorService pool = Executors
                    .newCachedThreadPool();
      protected CyclicBarrier barrier;
      protected final BoundedBuffer<Integer> bb;
      protected final int nTrials, nPairs;
      protected final AtomicInteger putSum = new AtomicInteger(0);
      protected final AtomicInteger takeSum = new AtomicInteger(0);

      public static void main(String[] args) throws Exception {
             new PutTakeTest(10, 10, 100000).test(); // sample parameters
             pool.shutdown();
      }

      public PutTakeTest(int capacity, int npairs, int ntrials) {
             this.bb = new BoundedBuffer<Integer>(capacity);
             this.nTrials = ntrials;
             this.nPairs = npairs;
             this.barrier = new CyclicBarrier(npairs * 2 + 1);
      }

      void test() {
             try {
                    for (int i = 0; i < nPairs; i++) {
                           pool.execute(new Producer());
                           pool.execute(new Consumer());
                    }
                    barrier.await(); 
                    barrier.await(); 
                    assertEquals(putSum.get(), takeSum.get());
             } catch (Exception e) {
                    throw new RuntimeException(e);
             }
      }

      class Producer implements Runnable {
             public void run() {
                    try {
                           barrier.await();
                           int seed = (this.hashCode() ^ (int) System.nanoTime());
                           int sum = 0;
                           for (int i = nTrials; i > 0; --i) {
                                  bb.put(seed);
                                  sum += seed;
                                  seed = xorShift(seed);
                           }
                           putSum.getAndAdd(sum);
                           barrier.await();
                    } catch (Exception e) {
                           throw new RuntimeException(e);
                    }
             }
      }

      class Consumer implements Runnable {
             public void run() {
                    try {
                           barrier.await();
                           int sum = 0;
                           for (int i = nTrials; i > 0; --i) {
                                  sum += bb.take();
                           }
                           takeSum.getAndAdd(sum);
                           barrier.await();
                    } catch (Exception e) {
                           throw new RuntimeException(e);
                    }
             }
      }

      static int xorShift(int y) {
             y ^= (y << 6);
             y ^= (y >>> 21);
             y ^= (y << 7);
             return y;
      }
}
```

testLeak方法将多个大型对象插入到一个有界缓存中，然后将它们移除。第2个堆快照中的内存用量应该与第1个堆快照中的内存用量基本相同。

然而，doExtract如果忘记将返回元素的引用置为空（items[i] = null），那么在两次快照中报告的内存用量将明显不同。（这是为数不多几种需要显式地将变量置空的情况之一。大多数情况下，这种做法不仅不会带来帮助，甚至还会带来负面作用。）


## 4、资源管理测试

对于任何持有或管理其他对象的对象，都应该在不需要这些对象时销毁对它们的引用

例：使用堆检验工具对内存资源使用进行检验

## 5、使用回调

可以通过自定义扩展类来进行相关测试

```java
public class TestingThreadFactory implements ThreadFactory {
    public final AtomicInteger numCreated = 
            new AtomicInteger(); //记录创建的线程数
    private final ThreadFactory factory = 
            Executors.defaultThreadFactory();
    
    @Override
    public Thread newThread(Runnable r) {
        numCreated.incrementAndGet();
        return factory.newThread(r);
    }
}
```

```java
public class TestThreadPool extends TestCase {

    private final TestingThreadFactory threadFactory = new TestingThreadFactory();

    public void testPoolExpansion() throws InterruptedException {
        int MAX_SIZE = 10;
        ExecutorService exec = Executors.newFixedThreadPool(MAX_SIZE);

        for (int i = 0; i < 10 * MAX_SIZE; i++)
            exec.execute(new Runnable() {
                public void run() {
                    try {
                        Thread.sleep(Long.MAX_VALUE);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            });
        for (int i = 0;
             i < 20 && threadFactory.numCreated.get() < MAX_SIZE;
             i++)
            Thread.sleep(100);
        assertEquals(threadFactory.numCreated.get(), MAX_SIZE);
        exec.shutdownNow();
    }
}
```

## 6、产生更多的交替操作

使用yield、sleep命令更容易使错误出现

```java
public synchronized void transferCredits(Account from,
                                         Account to,
                                         int amount) {
    from.setBalance(from.getBalance() - amount);
    if (random.nextInt(1000) > THRESHOLD)
        Thread.yield();//切换到另一线程
    to.setBalance(to.getBalance() + amount);
}
```

# 二、性能测试

性能测试的目标：

衡量典型测试用例中的端到端性能，获得合理的使用场景

根据经验值来调整各种不同的限值，如线程数量，缓存容量等

## 1、计时器

通过增加计时器，并改变各个参数、线程池大小、缓存大小，计算出运行时间

![计时器](https://images2015.cnblogs.com/blog/1043545/201611/1043545-20161108113652999-1262574336.png)

- 在 PutTakeTest 中增加计时功能

```java
public class TimedPutTakeTest extends PutTakeTest {
       private BarrierTimer timer = new BarrierTimer();

       public TimedPutTakeTest(int cap, int pairs, int trials) {
              super(cap, pairs, trials);
              barrier = new CyclicBarrier(nPairs * 2 + 1, timer);
       }

       public void test() {
              try {
                     timer.clear();
                     for (int i = 0; i < nPairs; i++) {
                            pool.execute(new PutTakeTest.Producer());
                            pool.execute(new PutTakeTest.Consumer());
                     }
                     barrier.await();//等待所有线程都准备好后开始往下执行
                     barrier.await();//等待所有线都执行完后开始往下执行
                     //每个元素完成处理所需要的时间
                     long nsPerItem = timer.getTime() / (nPairs * (long) nTrials);
                     System.out.print("Throughput: " + nsPerItem + " ns/item");
                     assertEquals(putSum.get(), takeSum.get());
              } catch (Exception e) {
                     throw new RuntimeException(e);
              }
       }

       public static void main(String[] args) throws Exception {
              int tpt = 100000; // 每对线程（生产-消费）需处理的元素个数
              //测试缓存容量分别为1、10、100、1000的情况
              for (int cap = 1; cap <= 1000; cap *= 10) {
                     System.out.println("Capacity: " + cap);
                     //测试工作线程数1、2、4、8、16、32、64、128的情况
                     for (int pairs = 1; pairs <= 128; pairs *= 2) {
                            TimedPutTakeTest t = new TimedPutTakeTest(cap, pairs, tpt);
                            System.out.print("Pairs: " + pairs + "\t");

                            //测试两次                         
                            t.test();//第一次
                            System.out.print("\t");
                            Thread.sleep(1000);

                            t.test();//第二次
                            System.out.println();
                            Thread.sleep(1000);
                     }
              }
              PutTakeTest.pool.shutdown();
       }

       //关卡动作，在最后一个线程达到后执行。在该测试中会执行两次：
       //一次是执行任务前，二是所有任务都执行完后
       static class BarrierTimer implements Runnable {
              private boolean started;//是否是第一次执行关卡活动
              private long startTime, endTime;

              public synchronized void run() {
                     long t = System.nanoTime();
                     if (!started) {//第一次关卡活动走该分支
                            started = true;
                            startTime = t;
                     } else
                            //第二次关卡活动走该分支
                            endTime = t;
              }

              public synchronized void clear() {
                     started = false;
              }

              public synchronized long getTime() {//任务所耗时间
                     return endTime - startTime;
              }
       }
}
```

## 2、多种算法的比较

使用不同的内部实现算法，找出具有更高的可伸缩性的算法

BoundedBuffer性能不高的主要原因：put和take操作分别都有多个操作可能遇到竞争——获取一个信号量，获取一个锁、释放信号量
在测试的过程中发现LinkedBlockingQueue的伸缩性好于ArrayBlockingQueue，这主要是因为链接队列的put和take操作允许有比基于数组的队列更好的并发访问，好的链接队列算法允许队列的头和尾彼此独立地更新。LinkedBlockingQueue中好的并发算法抵消了创建节点元素的开销，那么这种算法通常具有更高的可伸缩性。这似乎与传统性能调优相违背

![2、多种算法的比较](https://images2015.cnblogs.com/blog/1043545/201611/1043545-20161108113935342-561603903.png)

## 3、响应性衡量

某个动作经过多长时间才能执行完成，这时就要测量服务时间的变化情况

除非线程由于密集的同步需求而被持续的阻塞，否则非公平的信号量通常能实现更好的吞吐量，而公平的信号量则实现更低的变动性（公平性开销主要由于线程阻塞所引起）

所谓的公平信号量是获得锁的顺序与线程启动顺序有关，但不代表100%地获得信号量，仅仅是在概率上能得到保证。而非公平信号量就是无关的了。
缓存过小，将导致非常多的上下文切换次数，这即是在非公平模式中也会导致很低的吞吐量。

因此，***除非线程由于密集的同步需求而被持续地阻塞，否则非公平的信号量通常能实现更好的吞吐量，而公平的信号量则实现更低的变动性。***

因为这些结果之间的差异非常大，所以Semaphore要求客户选择针对哪个特性进行优化。

![3、响应性衡量](https://images2015.cnblogs.com/blog/1043545/201611/1043545-20161108114602874-1666940469.png)

# 三、避免性能测试的陷阱

## 1、垃圾回收

保证垃圾回收在执行测试程序期间不被执行，可通过-verbose:gc查看垃圾回收信息。
保证垃圾回收在执行测试程序期间执行多次，可以充分反映出运行期间的内存分配和垃圾回收等开销。

## 2、动态编译

可以让测试程序运行足够长时间，防止动态编译对测试结果产生的偏差。
在HotSpot中设置 `-xx：+PrintCompilation`，在动态编译时输出一条信息

## 3、对代码路径不真实采样

动态编译可能会让不同地方调用的同一方法生成的代码不同
测试程序不仅要大致判断某个典型应用程序的使用模式，还要尽量覆盖在该应用程序中将执行的代码路径集合

## 4、不真实的竞争程度

不同的共享数据和执行本地计算的比例，将表现出不同的竞争程度，也就有不同的性能和可伸缩性

## 5、无用代码的消除

编译器可能会删除那些没有意义或不会产生结果或可预测结果的代码
使结果尽量是不可预测的
 
# 四、其他测试方法

代码审查（人工检查代码），竞态分析工具（FindBugs，CheckStyle），面向方面的测试技术，分析与检测工具（jvisualvm）

静态分析工具

不一致的同步

调用Thread.run

未被释放的锁

空的同步块

双重检查加锁

在构造函数中启动另一个线程

通知错误

条件等待中的错误

对Lock和Condition的误用

在休眠或者等待的同时持有一个锁

自旋循环

# 拓展阅读

[junitperf](https://github.com/houbb/junitperf)

[性能测试](https://houbb.github.io/2019/02/18/perfermance-test)

# 参考资料

《Java并发编程实战》

[第十二章：并发程序的测试——Java并发编程实战](https://www.cnblogs.com/HectorHou/p/6042551.html)

[测试并发程序](https://objccn.io/issue-2-5/)

[java多线程——并发测试](https://my.oschina.net/u/1859679/blog/1543391)

[大话程序猿眼里的高并发（下）](http://www.importnew.com/22546.html)

https://juejin.im/post/5b067702f265da0de101103e

https://wenku.baidu.com/view/9a5293197cd184254b353558.html

https://segmentfault.com/q/1010000010624641

http://www.mamicode.com/info-detail-1600606.html

* any list
{:toc}