# 同步和异步有何异同,在什么情况下分别使用他们?举例说明。


如果数据将在线程间共享。例如正在写的数据以后可能被另一个线程读到,或者正在读的数
据可能已经被另一个线程写过了,那么这些数据就是共享数据,必须进行同步存取。 当应用程序在对象上调用了一个需要花费很长时间来执行的方法,并且不希望让程序等待方
法的返回时,就应该使用异步编程,在很多情况下采用异步途径往往更有效率。


COMMENT:

1) 这个问题没什么水平, 理解线程的既可以很好的回答。(如果面试官懂得分布式的话,可以简单何其聊下 系统间的同步异步。)




# thread

概念  基本状态   状态之间的关系


对于 多线程的回答, 至少有以下几点

1) synchronized volatile 【@see 关键字】

2) 现代编程

concurrentHashMap

Lock


【@see jdk7】  进行笔记整理





> what is?

> how to?

> usage

> what to attention?



# what is deadlock?

database dead lock;


# Runnable 、Callable


# Ways of implement thread

KEY WORD: volatile, synchronized



# sleep() and wait()



sleep 就是正在执行的线程主动让出 cpu,cpu 去执行其他线程,在 sleep 指定的时间过后, cpu 才会回到这个线程上继续往下执行,如果当前线程进入了同步锁,sleep 方法并不会释 放锁,即使当前线程使用 sleep 方法让出了 cpu,
但其他被同步锁挡住了的线程也无法得到 执行。wait 是指在一个已经进入了同步锁的线程内,让自己暂时让出同步锁,以便其他正在 等待此锁的线程可以得到同步锁并运行,只有其他线程调用了 notify 方法(notify 并不释放 锁,
只是告诉调用过 wait 方法的线程可以去参与获得锁的竞争了,但不是马上得到锁,因 为锁还在别人手里,别人还没释放。如果 notify 方法后面的代码还有很多,需要这些代码执 行完后才会释放锁,
可以在 notify() 方法后增加一个等待和一些代码,看看效果),调用 wait 方法的线程就会解除 wait 状态和程序可以再次得到锁后继续向下运行。对于 wait 的讲解一 定要配合例子代码来说明,才显得自己真明白。


多线程有两种实现方法,分别是继承 Thread 类与实现 Runnable 接口
同步的实现方面有两种,分别是 synchronized,wait 与 notify
wait():使一个线程处于等待状态,并且释放所持有的对象的 lock。
sleep():使一个正在运行的线程处于睡眠状态,是一个静态方法,调用此方法要捕捉 InterruptedException(中断异常)异常。
notify():唤醒一个处于等待状态的线程,注意的是在调用此方法的时候,并不能确切的唤醒 某一个等待状态的线程,而是由 JVM 确定唤醒哪个线程,而且不是按优先级。
Allnotity():唤醒所有处入等待状态的线程,注意并不是给所有唤醒线程一个对象的锁,而是 让它们竞争。


COMMENT: 这代码==WC

```java
package com.huawei.interview;

publicclass MultiThread {

 /**
* @paramargs */
public static void main(String[] args) {
// TODO Auto-generated method stub new Thread(newThread1()).start(); try {
Thread.sleep(10);
} catch (InterruptedException e) {
// TODO Auto-generated catchblock
e.printStackTrace(); }
new Thread(newThread2()).start(); }
private static classThread1implements Runnable {
@Override
public void run() {
// TODO Auto-generated methodstub
//由于这里的 Thread1和下面的 Thread2内部 run 方法要用同一对象作为监视器,我们这里 不能用 this,因为在 Thread2里面的 this 和这个 Thread1的 this 不是同一个对象。我们用 MultiThread.class 这个字节码对象,当前虚拟机里引用这个变量时,指向的都是同一个对 象。
synchronized (MultiThread.class){ System.out.println("enterthread1..."); System.out.println("thread1is waiting");

 try {
//释放锁有两种方式,第一种方式是程序自然离开监视器的范围,也就是离开 了 synchronized 关键字管辖的代码范围,另一种方式就是在 synchronized 关键字管辖的代 码内部调用监视器对象的 wait 方法。这里,使用 wait 方法释放锁。
MultiThread.class.wait();
} catch(InterruptedException e) {
// TODO Auto-generatedcatch block
e.printStackTrace(); }
System.out.println("thread1is going on...");
System.out.println("thread1is being over!"); }
} }
private static classThread2implements Runnable {
@Override
public void run() {
// TODO Auto-generated methodstub synchronized (MultiThread.class){
System.out.println("enterthread2...");
System.out.println("thread2notify other thread can release wait status..");
//由于 notify 方法并不释放锁,即使 thread2调用下面的 sleep 方法休息了10毫秒,但 thread1 仍然不会执行,因为 thread2没有释放锁,所以 Thread1无法得不到锁。

MultiThread.class.notify();
System.out.println("thread2is sleeping ten millisecond..."); try {
Thread.sleep(10);
} catch (InterruptedExceptione) {
// TODO Auto-generatedcatch block
e.printStackTrace(); }
System.out.println("thread2is going on..."); System.out.println("thread2is being over!");
} }
} }
```





> java 中有几种方法可以实现一个线程?用什么关键字修饰同步方法? stop() 和 suspend()方法为何不推荐使用?


java5以前,有如下两种: 第一种:

 new Thread(){}.start();这表示调用 Thread 子类对象的 run 方法,new Thread(){}表示一个 Thread 的匿名子类的实例对象,子类加上 run 方法后的代码如下:
new Thread(){ public void run(){ }
}.start();
第二种:
new Thread(new Runnable(){}).start();这表示调用 Thread 对象接受的 Runnable 对象的 run 方法,new Runnable(){}表示一个 Runnable 的匿名子类的实例对象,runnable 的子类加上 run 方法后的代码如下:
new Thread(new Runnable(){ public voidrun(){
} }
).start();
从 java5开始,还有如下一些线程池创建多线程的方式: ExecutorService pool = Executors.newFixedThreadPool(3) for(int i=0;i<10;i++)
{
pool.execute(newRunable(){public void run(){}}); }
Executors.newCachedThreadPool().execute(new Runable(){publicvoid run(){}}); Executors.newSingleThreadExecutor().execute(new Runable(){publicvoid run(){}});
有两种实现方法,分别使用 new Thread()和 new Thread(runnable)形式,第一种直接调用 thread 的 run 方法,所以,我们往往使用 Thread 子类,即 new SubThread()。第二种调用

runnable 的 run 方法。
有两种实现方法,分别是继承 Thread 类与实现 Runnable 接口
用 synchronized 关键字修饰同步方法
反对使用 stop(),是因为它不安全。它会解除由线程获取的所有锁定,而且如果对象处于一 种不连贯状态,那么其他线程能在那种状态下检查和修改它们。结果很难检查出真正的问题 所在。suspend()方法容易发生死锁。调用 suspend()的时候,目标线程会停下来,但却仍 然持有在这之前获得的锁定。此时,其他任何线程都不能访问锁定的资源,除非被"挂起"的 线程恢复运行。对任何线程来说,如果它们想恢复目标线程,同时又试图使用任何一个锁定 的资源,就会造成死锁。所以不应该使用 suspend(),而应在自己的 Thread 类中置入一个 标志,指出线程应该活动还是挂起。若标志指出线程应该挂起,便用 wait()命其进入等待状 态。若标志指出线程应当恢复,则用一个 notify()重新启动线程。





> 启动一个线程是用 run()还是 start()? .


启动一个线程是调用 start()方法,使线程就绪状态,以后可以被调度为运行状态,一个线程必须关联一些具体的执行代码,run()方法是该线程所关联的执行代码。



> 当一个线程进入一个对象的一个 synchronized 方法后,其它线程是否可进入此对象的其它方法?


分几种情况:
1. 其他方法前是否加了 synchronized 关键字,如果没加,则能。
2. 如果这个方法内部调用了 wait,则可以进入其他 synchronized 方法。
3. 如果其他个方法都加了 synchronized 关键字,并且内部没有调用 wait,则不能。
4. 如果其他方法是 static,它用的同步锁是当前类的字节码,与非静态的方法不能同 步,因为非静态的方法用的是 this。


> 线程的基本概念、线程的基本状态以及状态之间的关系


一个程序中可以有多条执行线索同时执行,一个线程就是程序中的一条执行线索,每个线程 上都关联有要执行的代码,即可以有多段程序代码同时运行,每个程序至少都有一个线程,
即 main 方法执行的那个线程。如果只是一个 cpu,它怎么能够同时执行多段程序呢?这是 从宏观上来看的,cpu 一会执行 a 线索,一会执行 b 线索,切换时间很快,
给人的感觉是 a,b 在同时执行,好比大家在同一个办公室上网,只有一条链接到外部网线,其实,这条网 线一会为 a 传数据,一会为 b 传数据,由于切换时间很短暂,所以,大家感觉都在同时上 网。


状态:就绪,运行,synchronize 阻塞,wait 和 sleep 挂起,结束。wait 必须在 synchronized 内部调用。
调用线程的 start 方法后线程进入就绪状态,线程调度系统将就绪状态的线程转为运行状 态,遇到 synchronized 语句时,由运行状态转为阻塞,当 synchronized 获得锁后,
由阻塞 转为运行,在这种情况可以调用 wait 方法转为挂起状态,当线程关联的代码执行完后,线 程变为结束状态。


> 简述 synchronized 和 java.util.concurrent.locks.Lock 的异同?


主要相同点:Lock 能完成 synchronized 所实现的所有功能
主要不同点:Lock 有比 synchronized 更精确的线程语义和更好的性能。synchronized 会自 动释放锁,而 Lock 一定要求程序员手工释放,并且必须在 finally 从句中释放。
Lock 还有更 强大的功能,例如,它的 tryLock 方法可以非阻塞方式去拿锁。

举例说明(对下面的题用 lock 进行了改写):

```java
package com.huawei.interview;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
public class ThreadTest {

  /**
* @paramargs */
private int j;
private Lock lock =newReentrantLock(); public static voidmain(String[] args) {
// TODO Auto-generated method stub ThreadTest tt = new ThreadTest(); for(int i=0;i<2;i++)
{
new Thread(tt.new Adder()).start();
new Thread(tt.new Subtractor()).start(); }
}
private class SubtractorimplementsRunnable {
@Override
public void run() {
// TODO Auto-generated methodstub while(true)
{
/*synchronized (ThreadTest.this) { System.out.println("j--="+ j--); //这里抛异常了,锁能释放吗?
}*/ lock.lock(); try

 {
System.out.println("j--="+ j--);
}finally {
lock.unlock(); }
} }
}
private class AdderimplementsRunnable {
@Override
public void run() {
// TODO Auto-generated methodstub while(true)
{
/*synchronized (ThreadTest.this) { System.out.println("j++="+ j++); }*/
lock.lock();
try
{
System.out.println("j++="+ j++);
}finally {
lock.unlock(); }
}

}
}
}


```














应用实际的例子

- 批量导入

- 发邮件

- 垃圾回收

