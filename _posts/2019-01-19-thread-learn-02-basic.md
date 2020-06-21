---
layout: post
title: 轻松学习多线程 02-多线程的基本机制
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

# 定义线程

>实现线程的方式，上一章中已经提到。下面使用实现Runnable的方式

```
/**
 * Created by 侯彬彬 on 2016/4/14.
 */
public class NumCounter implements Runnable {
    private static int count = 0;
    private final int id = count++;     //

    protected  int size = 5;      //默认计算数量
    public NumCounter() {
    }
    public NumCounter(int size) {
        this.size = size;
    }

    /**
     * 当前状态
     */
    protected void status() {
        System.out.println("#"+id+" count: " + size);
    }
    @Override
    public void run() {
        while(size-- > 0) {
            status();
        }
        System.out.println("#"+id+" counter has done!");
    }
}
```

测试类

```
/**
 * Created by 侯彬彬 on 2016/4/14.
 */
public class Main {
    public static void main(String[] args) {
        NumCounter numCounter = new NumCounter();
        numCounter.run();       //此方法并无特殊之处
    }
}
```
结果

```
#0 count: 4
#0 count: 3
#0 count: 2
#0 count: 1
#0 count: 0
#0 counter has done!
```

> **run()只是相当于普通的方法，并没有开启线程**。如果想开启线程，如下。

```
/**
 * Created by 侯彬彬 on 2016/4/14.
 */
public class Main {
    public static void main(String[] args) {
//        NumCounter numCounter = new NumCounter();
//        numCounter.run();       //此方法并无特殊之处

        for(int i = 0; i < 4; i++) {
            new Thread(new NumCounter()).start();   //Thread start() 开启线程
        }
    }
}
```
结果
```
#0 count: 4
#3 count: 4
#2 count: 4
#1 count: 4
#2 count: 3
#3 count: 3
#0 count: 3
#3 count: 2
#3 count: 1
#2 count: 2
#1 count: 3
#2 count: 1
#3 count: 0
#0 count: 2
#3 counter has done!
#2 count: 0
#1 count: 2
#2 counter has done!
#0 count: 1
#1 count: 1
#0 count: 0
#1 count: 0
#0 counter has done!
#1 counter has done!

Process finished with exit code 0

```

#使用Executor
> **Executor可以为我们管理Thread，从而简化并发编程。**

```
java.util.concurrent 
接口 Executor
```

上代码

```
/**
 * Created by 侯彬彬 on 2016/4/14.
 */
public class ExecutorsDemo {
    public static void main(String[] args) {
        final int size = 4;
        ExecutorService executorService = Executors.newCachedThreadPool();
//        ExecutorService executorService = Executors.newFixedThreadPool(size);
//        ExecutorService executorService = Executors.newSingleThreadExecutor();

        for(int i = 0; i < size; i++) {
            executorService.execute(new NumCounter());
        }

        executorService.shutdown();
    }
}
```
测试结果

```
#0 count: 4
#3 count: 4
#2 count: 4
#1 count: 4
#2 count: 3
#3 count: 3
#0 count: 3
#3 count: 2
#3 count: 1
#2 count: 2
#1 count: 3
#2 count: 1
#3 count: 0
#0 count: 2
#3 counter has done!
#2 count: 0
#1 count: 2
#2 counter has done!
#0 count: 1
#1 count: 1
#0 count: 0
#1 count: 0
#0 counter has done!
#1 counter has done!

Process finished with exit code 0

```

> - newCachedThreadPool
public static ExecutorService newCachedThreadPool()
创建一个可**根据需要创建新线程的线程池**，但是在以前构造的线程可用时将重用它们。
- newFixedThreadPool
public static ExecutorService newFixedThreadPool(int nThreads)
创建一个**可重用固定线程数的线程池**，以共享的无界队列方式来运行这些线程。
- newSingleThreadExecutor
public static ExecutorService newSingleThreadExecutor()
创建一个使用**单个 worker 线程的 Executor**，以无界队列方式来运行该线程。

#有返回值的线程
>返回结果并且可能抛出异常的任务。实现者定义了一个不带任何参数的叫做 call 的方法。 
>
Callable 接口类似于 Runnable，两者都是为那些其实例可能被另一个线程执行的类设计的。但是 Runnable 不会返回结果，并且无法抛出经过检查的异常。 
>
**如果希望线程返回结果，请选择Callable**

```
/**
 * Created by 侯彬彬 on 2016/4/14.
 */
public class CallableDemo implements Callable<String> {
    private String name;
    public CallableDemo(String name) {
        this.name = name;
    }

    @Override
    public String call() throws Exception {
        return "Name: " + name;
    }
}
```

测试类

```
public static void main(String[] args) {
        ExecutorService executorService = Executors.newCachedThreadPool();
        for(int i = 0; i < 5; i++) {
            Future<String> future = executorService.submit(new CallableDemo("callTest-"+i));
            try {
                System.out.println(future.get());
            } catch (InterruptedException e) {
                e.printStackTrace();
            } catch (ExecutionException e) {
                e.printStackTrace();
            }
        }
    }
}
```

结果

```
Name: callTest-0
Name: callTest-1
Name: callTest-2
Name: callTest-3
Name: callTest-4
```

#休眠
> public static void sleep(long millis) throws InterruptedException
**在指定的毫秒数内让当前正在执行的线程休眠（暂停执行），此操作受到系统计时器和调度程序精度和准确性的影响。**该线程不丢失任何监视器的所属权。

```
public class SleepNumCounter extends NumCounter {
    @Override
    public void run() {
        while(size-- > 0) {
            status();
            try {
                Long time = 1000L;  //睡眠时间
                Thread.sleep(time);
//                TimeUnit.MICROSECONDS.sleep(time);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```

测试类

```
public static void main(String[] args) {
        ExecutorService executorService = Executors.newCachedThreadPool();
        for(int i = 0; i < 5; i++) {
            executorService.execute(new SleepNumCounter());
        }
    }
```

结果

```
#0 count: 4
#3 count: 4
#2 count: 4
#1 count: 4
#2 count: 3
#3 count: 3
#0 count: 3
#3 count: 2
#3 count: 1
#2 count: 2
#1 count: 3
#2 count: 1
#3 count: 0
#0 count: 2
#3 counter has done!
#2 count: 0
#1 count: 2
#2 counter has done!
#0 count: 1
#1 count: 1
#0 count: 0
#1 count: 0
#0 counter has done!
#1 counter has done!

Process finished with exit code 0
```

> 睡眠也可以使用TimeUnit.MICROSECONDS.sleep(time)
> 
> public enum TimeUnitextends Enum<TimeUnit>TimeUnit 
> 表示给定单元粒度的时间段，**它提供在这些单元中进行跨单元转换和执行计时及延迟操作的实用工具方法。**具体参考JDK。

# 优先级
> - public static final int **MAX_PRIORITY** 线程可以具有的最高优先级。
> - public static final int **MIN_PRIORITY** 线程可以具有的最低优先级。
> - public static final int **NORM_PRIORITY** 分配给线程的默认优先级。
> - public final void **setPriority(int newPriority)** 更改线程的优先级。
	
```
/**
 * Created by 侯彬彬 on 2016/4/14.
 */
public class PriorityDemo {
    public static void main(String[] args) {
        ExecutorService executorService = Executors.newCachedThreadPool();

        Thread thread = new Thread(new NumCounter(1));
        Thread thread2 = new Thread(new NumCounter(2));
        Thread thread3 = new Thread(new NumCounter(10));

        thread.setPriority(Thread.MIN_PRIORITY);    //1
        thread2.setPriority(Thread.NORM_PRIORITY);  //5
        thread3.setPriority(Thread.MAX_PRIORITY);   //10

        executorService.execute(thread);
        executorService.execute(thread2);
        executorService.execute(thread3);

        executorService.shutdown();
    }
}
```

结果

```
#0 count: 0
#0 counter has done!
#2 count: 9
#2 count: 8
#2 count: 7
#2 count: 6
#2 count: 5
#1 count: 1
#2 count: 4
#1 count: 0
#2 count: 3
#1 counter has done!
#2 count: 2
#2 count: 1
#2 count: 0
#2 counter has done!

Process finished with exit code 0
```
#让步

> public static void yield() **暂停当前正在执行的线程对象，并执行其他线程。**

```
/**
 * Created by 侯彬彬 on 2016/4/14.
 */
public class YieldDemo implements Runnable{
  
    @Override
    public void run() {
        for (int i = 1; i < 10; i++) {
            System.out.println(Thread.currentThread().getName() + ": " + i);
            // 暂停当前正在执行的线程对象，并执行其他线程，就是进入就绪状态
            Thread.currentThread().yield();
            // 可能还会执行 本线程，
        }
    }

    public static void main(String[] args) {
        ExecutorService executorService = Executors.newCachedThreadPool();

        for(int i = 0; i < 3; i++) {
            executorService.execute(new YieldDemo());
        }
    }
}
```
结果

```
pool-1-thread-1: 1
pool-1-thread-3: 1
pool-1-thread-2: 1
pool-1-thread-3: 2
pool-1-thread-1: 2
pool-1-thread-3: 3
pool-1-thread-2: 2
pool-1-thread-3: 4
pool-1-thread-3: 5
pool-1-thread-1: 3
pool-1-thread-3: 6
pool-1-thread-2: 3
pool-1-thread-3: 7
pool-1-thread-1: 4
pool-1-thread-3: 8
pool-1-thread-2: 4
pool-1-thread-3: 9
pool-1-thread-1: 5
pool-1-thread-2: 5
pool-1-thread-1: 6
pool-1-thread-2: 6
pool-1-thread-1: 7
pool-1-thread-1: 8
pool-1-thread-1: 9
pool-1-thread-2: 7
pool-1-thread-2: 8
pool-1-thread-2: 9

```

>  yield()应该做的是让当前运行线程回到可运行状态，以允许具有相同优先级的其他线程获得运行机会。因此，使用yield()的目的是让相同优先级的线程之间能适当的轮转执行。但是，实际中无法保证yield()达到让步目的，因为让步的线程还有可能被线程调度程序再次选中。
>
结论：**yield()从未导致线程转到等待/睡眠/阻塞状态。在大多数情况下，yield()将导致线程从运行状态转到可运行状态，但有可能没有效果。**


#守护线程

 > - public final void setDaemon(boolean on)
 > 将该线程标记为守护线程或用户线程。当正在运行的线程都是守护线程时，Java 虚拟机退出。 
该方法必须在启动线程前调用。
>
> - public final boolean isDaemon()
> 测试该线程是否为守护线程。

```
/**
 * Created by 侯彬彬 on 2016/4/14.
 */
public  class MyCommon extends  Thread {
    @Override
    public void run() {
        for(int i = 0; i < 5; i++) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println(Thread.currentThread()+" == " + i);
        }
    }
}
```

```
/**
 * Created by 侯彬彬 on 2016/4/14.
 */
public class MyDaemon extends Thread {
    @Override
    public void run() {
        for(int i = 0; i < 1000; i++) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println(Thread.currentThread()+" ==" + i);
        }
    }
}
```

测试类

```
public static void main(String[] args) {
        Thread common = new Thread(new MyCommon());
        Thread daemon = new Thread(new MyDaemon());
        daemon.setDaemon(true); //设置为守护线程

        common.start();
        daemon.start();
}
```

结果

```
Thread[Thread-3,5,main] ==0
Thread[Thread-1,5,main] == 0
Thread[Thread-3,5,main] ==1
Thread[Thread-1,5,main] == 1
Thread[Thread-1,5,main] == 2
Thread[Thread-3,5,main] ==2
Thread[Thread-3,5,main] ==3
Thread[Thread-1,5,main] == 3
Thread[Thread-3,5,main] ==4
Thread[Thread-1,5,main] == 4

Process finished with exit code 0
```
> **可见，普通线程结束时，守护线程也会结束。**

#join方法

> public final void join()
                throws InterruptedException等待该线程终止。

```

/**
 * Created by 侯彬彬 on 2016/4/14.
 */
public class JoinDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread thread1 = new Thread() {
            public void run() {
                System.out.println("我是第一个");
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("我虽然睡了一会，但我是第二个");
            };
        };
        thread1.start();
        
        Thread thread2 = new Thread() {
            public void run() {
                try {
                    thread1.join();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }// 等待t1线程 执行完结，才继续向下执行 在这阻塞子线程
                System.out.println("我是第三个");
            };
        };
        thread2.start();
    }
}
```

结果

```
我是第一个
我虽然睡了一会，但我是第二个
我是第三个
```

# 相关内容

[线程-001-线程简介](http://blog.csdn.net/ryo1060732496/article/details/51151809)

[线程-002-基本的线程机制](http://blog.csdn.net/ryo1060732496/article/details/51154746)

[线程-003-线程的同步与锁](http://blog.csdn.net/ryo1060732496/article/details/51184874)

[线程-004-线程间的协作及状态迁移](http://blog.csdn.net/ryo1060732496/article/details/79377105)

* any list
{:toc}