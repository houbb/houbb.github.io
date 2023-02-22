---
layout: post
title:  JCIP-18-thread InterruptedException 中断异常处理及中断机制
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, exception, sh]
published: true
---

# java 中断机制

要知道如何处理，首先要知道 java 的中断机制。

## 引言

如果对 Java 中断没有一个全面的了解，可能会误以为被中断的线程将立马退出运行，但事实并非如此。

中断机制是如何工作的？捕获或检测到中断后，是抛出 InterruptedException 还是重设中断状态以及在方法中吞掉中断状态会有什么后果？

Thread.stop 与中断相比又有哪些异同？

什么情况下需要使用中断？

线程池中的异常如何处理？

中断处理的最佳实践？

# 线程中断基础知识

## 1、interrupt() 

interrupt方法用于中断线程。调用该方法的线程的状态为将被置为"中断"状态。

注意：线程中断仅仅是置线程的中断状态位，不会停止线程。需要用户自己去监视线程的状态为并做处理。支持线程中断的方法（也就是线程中断后会抛出interruptedException的方法）就是在监视线程的中断状态，一旦线程的中断状态被置为“中断状态”，就会抛出中断异常。

## 2、interrupted() 和 isInterrupted()

首先看一下API中该方法的实现：

```java
public static boolean interrupted() {
     return currentThread().isInterrupted(true);
}
```

该方法就是直接调用当前线程的isInterrupted(true)的方法。

然后再来看一下 API 中 isInterrupted 的实现：

```java
public boolean isInterrupted() {
    return isInterrupted(false);
}
```

该方法却直接调用当前线程的isInterrupted(false)的方法。

因此这两个方法有两个主要区别：

interrupted 是作用于当前线程，isInterrupted 是作用于调用该方法的线程对象所对应的线程。（线程对象对应的线程不一定是当前运行的线程。例如我们可以在A线程中去调用B线程对象的isInterrupted方法。）

这两个方法最终都会调用同一个方法-----isInterrupted(Boolean 参数)，只不过参数固定为一个是true，一个是false；               

注意： isInterrupted(Boolean 参数) 是 isInterrupted() 的重载方法。

由于第二个区别主要体现在调用的方法的参数上，让我们来看一看这个参数是什么含义
 
先来看一看被调用的方法 isInterrupted(boolean arg)（Thread类中重载的方法）的定义：

```java
private native boolean isInterrupted(boolean ClearInterrupted);
```

原来这是一个本地方法，看不到源码。不过没关系，通过参数名ClearInterrupted我们就能知道，这个参数代表是否要清除状态位。

如果这个参数为true，说明返回线程的状态位后，要清掉原来的状态位（恢复成原来情况）。这个参数为false，就是直接返回线程的状态位。

这两个方法很好区分，只有当前线程才能清除自己的中断位（对应interrupted（）方法）

## 验证例子

```java
public class Interrupt {  
    public static void main(String[] args) throws Exception {  
        Thread t = new Thread(new Worker());  
        t.start();  
          
        Thread.sleep(200);  
        t.interrupt();  
          
        System.out.println("Main thread stopped.");  
    }  
      
    public static class Worker implements Runnable {  
        public void run() {  
            System.out.println("Worker started.");  
              
            try {  
                Thread.sleep(500);  
            } catch (InterruptedException e) {  
                System.out.println("Worker IsInterrupted: " +   
                        Thread.currentThread().isInterrupted());  
            }  
              
            System.out.println("Worker stopped.");  
        }  
    }  
}  
```

内容很简答：主线程main启动了一个子线程Worker，然后让worker睡500ms，而main睡200ms，之后main调用worker线程的interrupt方法去中断worker，worker被中断后打印中断的状态。

下面是执行结果：

```
Worker started.  
Main thread stopped.  
Worker IsInterrupted: false  
Worker stopped. 
```

Worker明明已经被中断，而isInterrupted()方法竟然返回了false，为什么呢？

## InterruptedException 描述

在stackoverflow上搜索了一圈之后，发现有网友提到：可以查看抛出InterruptedException方法的JavaDoc（或源代码），于是我查看了Thread.sleep方法的文档，doc中是这样描述这个InterruptedException异常的：

```
InterruptedException - if any thread has interrupted the current thread. The interrupted status of the current thread is cleared when this exception is thrown.  
```

结论：interrupt方法是用于中断线程的，调用该方法的线程的状态将被置为"中断"状态。

注意：线程中断仅仅是设置线程的中断状态位，不会停止线程。所以当一个线程处于中断状态时，如果再由wait、sleep以及jion三个方法引起的阻塞，那么JVM会将线程的中断标志重新设置为false，并抛出一个InterruptedException异常，然后开发人员可以中断状态位“的本质作用-----就是程序员根据try-catch功能块捕捉jvm抛出的InterruptedException异常来做各种处理，比如如何退出线程。总之interrupt的作用就是需要用户自己去监视线程的状态位并做处理。”

## 小结

Thread.currentThread().interrupt(); 这个用于清除中断状态，这样下次调用Thread.interrupted()方法时就会一直返回为true，因为中断标志已经被恢复了。

而调用isInterrupted()只是简单的查询中断状态，不会对状态进行修改。

interrupt（）是用来设置中断状态的。返回true说明中断状态被设置了而不是被清除了。我们调用sleep、wait等此类可中断（throw InterruptedException）方法时，一旦方法抛出InterruptedException，当前调用该方法的线程的中断状态就会被jvm自动清除了，就是说我们调用该线程的isInterrupted 方法时是返回false。如果你想保持中断状态，可以再次调用interrupt方法设置中断状态。这样做的原因是，java的中断并不是真正的中断线程，而只设置标志位（中断位）来通知用户。如果你捕获到中断异常，说明当前线程已经被中断，不需要继续保持中断位。

interrupted是静态方法，返回的是当前线程的中断状态。

例如，如果当前线程被中断（没有抛出中断异常，否则中断状态就会被清除），你调用interrupted方法，第一次会返回true。然后，当前线程的中断状态被方法内部清除了。第二次调用时就会返回false。如果你刚开始一直调用isInterrupted，则会一直返回true，除非中间线程的中断状态被其他操作清除了。

# 多线程中的异常处理

## 思考下面的问题

1. 在java启动的线程里可以抛出异常吗？
 
2. 在启动的线程里可以捕捉异常吗？ 

3. 如果可以捕捉异常，对于checked exception和unchecked exception，他们分别有什么的处理方式呢？

## 线程里抛出异常

我们可以尝试一下在线程里抛异常。

按照我们的理解，假定我们要在某个方法里抛异常，需要在该定义的方法头也加上声明。那么一个最简单的方式可能如下：

```java
public class Task implements Runnable {  
  
    @Override  
    public void run() throws Exception {  
        int number0 = Integer.parseInt("1");  
        throw new Exception("Just for test");  
    }  
}  
```

可是，如果我们去编译上面这段代码，会发现根本就编译不过去的。系统报的错误是：

```
Task.java:3: error: run() in Task cannot implement run() in Runnable  
    public void run() throws Exception {  
                ^  
  overridden method does not throw Exception  
1 error  
```

由此我们发现这种方式行不通。也就是说，在线程里直接抛异常是不行的。

可是，这又会引出一个问题，如果我们在线程代码里头确实是产生了异常，那该怎么办呢？

比如说，我们通过一个线程访问一些文件或者对网络进行IO操作，结果产生了异常。或者说访问某些资源的时候系统崩溃了。这样的场景是确实可能会发生的，我们就需要针对这些情况进行进一步的讨论。

## 异常处理的几种方式

在前面提到的几种在线程访问资源产生了异常的情况。我们可以看，比如说我们访问文件系统的时候，会抛出IOException, FileNotFoundException等异常。我在访问的代码里实际上是需要采用两种方式来处理的。一种是在使用改资源的方法头增加throws IOException, FileNotFoundException等异常的修饰。还有一是直接在这部分的代码块增加try/catch部分。由前面我们的讨论已经发现，在方法声明加throws Exception的方式是行不通的。

那么就只有使用try/catch这么种方式了。

另外，我们也知道，在异常的处理上，一般异常可以分为checked exception和unchecked exception。

作为unchecked exception，他们通常是指一些比较严重系统错误或者系统设计错误，比如Error, OutOfMemoryError或者系统直接就崩溃了。

对于这种异常发生的时候，我们一般是无能为力也没法恢复的。

那么这种情况发生，我们会怎么来处理呢？

## checked exception

直接使用 try-catch 进行处理即可，后文也会对这个进行详解。

此处暂时不做展开。

## unchecked exception

对于这种unchecked exception，相对来说就会不一样一点。

### setUncaughtExceptionHandler(UncaughtExceptionHandler)

实际上，在Thread的定义里有一个实例方法：setUncaughtExceptionHandler(UncaughtExceptionHandler). 这个方法可以用来处理一些unchecked exception。那么，这种情况的场景是如何的呢？

setUncaughtExceptionHandler()方法相当于一个事件注册的入口。

在jdk里面，该方法的定义如下：

```java
public void setUncaughtExceptionHandler(UncaughtExceptionHandler eh) {  
    checkAccess();  
    uncaughtExceptionHandler = eh;  
}  
```

而UncaughtExceptionHandler则是一个接口，它的声明如下：

```java
public interface UncaughtExceptionHandler {  
    /** 
     * Method invoked when the given thread terminates due to the 
     * given uncaught exception. 
     * <p>Any exception thrown by this method will be ignored by the 
     * Java Virtual Machine. 
     * @param t the thread 
     * @param e the exception 
    */  
    void uncaughtException(Thread t, Throwable e);  
}  
```

在异常发生的时候，我们传入的UncaughtExceptionHandler参数的uncaughtException方法会被调用。

综合前面的讨论，我们这边要实现handle unchecked exception的方法的具体步骤可以总结如下：

1. 定义一个类实现UncaughtExceptionHandler接口。在实现的方法里包含对异常处理的逻辑和步骤。

2. 定义线程执行结构和逻辑。这一步和普通线程定义一样。

3. 在创建和执行改子线程的方法里在thread.start()语句前增加一个thread.setUncaughtExceptionHandler语句来实现处理逻辑的注册。

### 例子

下面，我们就按照这里定义的步骤来实现一个示例：

首先是实现UncaughtExceptionHandler接口部分：

```java
import java.lang.Thread.UncaughtExceptionHandler;  
  
public class ExceptionHandler implements UncaughtExceptionHandler {  
    public void uncaughtException(Thread t, Throwable e) {  
        System.out.printf("An exception has been captured\n");  
        System.out.printf("Thread: %s\n", t.getId());  
        System.out.printf("Exception: %s: %s\n",   
                e.getClass().getName(), e.getMessage());  
        System.out.printf("Stack Trace: \n");  
        e.printStackTrace(System.out);  
        System.out.printf("Thread status: %s\n", t.getState());  
    }  
}  
```

这里我们添加的异常处理逻辑很简单，只是把线程的信息和异常信息都打印出来。

然后，我们定义线程的内容，这里，我们故意让该线程产生一个unchecked exception:

```java
public class Task implements Runnable {  
  
    @Override  
    public void run() {  
        int number0 = Integer.parseInt("TTT");  
    }  
}  
```

从这代码里我们可以看到，Integer.parseInt()里面的参数是错误的，肯定会抛出一个异常来。

现在，我们再把创建线程和注册处理逻辑的部分补上来

```java
public class Main {  
    public static void main(String[] args) {  
        Task task = new Task();  
        Thread thread = new Thread(task);  
        thread.setUncaughtExceptionHandler(new ExceptionHandler());  
        thread.start();  
    }  
}  
```

整体运行结果日志如下：

```
An exception has been captured  
Thread: 8  
Exception: java.lang.NumberFormatException: For input string: "TTT"  
Stack Trace:   
java.lang.NumberFormatException: For input string: "TTT"  
    at java.lang.NumberFormatException.forInputString(NumberFormatException.java:65)  
    at java.lang.Integer.parseInt(Integer.java:492)  
    at java.lang.Integer.parseInt(Integer.java:527)  
    at Task.run(Task.java:5)  
    at java.lang.Thread.run(Thread.java:722)  
Thread status: RUNNABLE  
```

这部分的输出正好就是我们前面实现UncaughtExceptionHandler接口的定义。

因此，对于unchecked exception，我们也可以采用类似事件注册的机制做一定程度的处理。

# 中断的原理

Java 中断机制是一种协作机制，也就是说通过中断并不能直接终止另一个线程，而需要被中断的线程自己处理中断。

这好比是家里的父母叮嘱在外的子女要注意身体，但子女是否注意身体，怎么注意身体则完全取决于自己。

Java 中断模型也是这么简单，每个线程对象里都有一个 boolean 类型的标识（不一定就要是 Thread 类的字段，实际上也的确不是，这几个方法最终都是通过 native 方法来完成的），代表着是否有中断请求（该请求可以来自所有线程，包括被中断的线程本身）。

例如，当线程 t1 想中断线程 t2，只需要在线程 t1 中将线程 t2 对象的中断标识置为 true，然后线程 2 可以选择在合适的时候处理该中断请求，甚至可以不理会该请求，就像这个线程没有被中断一样。

## Thread 类中断相关的方法

java.lang.Thread 类提供了几个方法来操作这个中断状态，这些方法包括：

| 方法 | 说明 |
|:---|:----|
|   public static boolean interrupted |  测试当前线程是否已经中断。线程的中断状态 由该方法清除。换句话说，如果连续两次调用该方法，则第二次调用将返回 false（在第一次调用已清除了其中断状态之后，且第二次调用检验完中断状态前，当前线程再次中断的情况除外）。 |
|   public boolean isInterrupted() |  测试线程是否已经中断。线程的中断状态不受该方法的影响。  |
|   public void interrupt() |  中断线程。 |

其中，interrupt 方法是唯一能将中断状态设置为 true 的方法。静态方法 interrupted 会将当前线程的中断状态清除，但这个方法的命名极不直观，很容易造成误解，需要特别注意。

上面的例子中，线程 t1 通过调用 interrupt 方法将线程 t2 的中断状态置为 true，t2 可以在合适的时候调用 interrupted 或 isInterrupted 来检测状态并做相应的处理。

此外，类库中的有些类的方法也可能会调用中断，如 FutureTask 中的 cancel 方法，如果传入的参数为 true，它将会在正在运行异步任务的线程上调用 interrupt 方法，如果正在执行的异步任务中的代码没有对中断做出响应，那么 cancel 方法中的参数将不会起到什么效果；又如 ThreadPoolExecutor 中的 shutdownNow 方法会遍历线程池中的工作线程并调用线程的 interrupt 方法来中断线程，所以如果工作线程中正在执行的任务没有对中断做出响应，任务将一直执行直到正常结束。

# 中断的处理

既然 Java 中断机制只是设置被中断线程的中断状态，那么被中断线程该做些什么？

## 处理时机

显然，作为一种协作机制，不会强求被中断线程一定要在某个点进行处理。

实际上，被中断线程只需在合适的时候处理即可，如果没有合适的时间点，甚至可以不处理，这时候在任务处理层面，就跟没有调用中断方法一样。“合适的时候”与线程正在处理的业务逻辑紧密相关。

例如，每次迭代的时候，进入一个可能阻塞且无法中断的方法之前等，但多半不会出现在某个临界区更新另一个对象状态的时候，因为这可能会导致对象处于不一致状态。

处理时机决定着程序的效率与中断响应的灵敏性。频繁的检查中断状态可能会使程序执行效率下降，相反，检查的较少可能使中断请求得不到及时响应。如果发出中断请求之后，被中断的线程继续执行一段时间不会给系统带来灾难，那么就可以将中断处理放到方便检查中断，同时又能从一定程度上保证响应灵敏度的地方。当程序的性能指标比较关键时，可能需要建立一个测试模型来分析最佳的中断检测点，以平衡性能和响应灵敏性。

## 处理方式

### 1、 中断状态的管理

一般说来，当可能阻塞的方法声明中有抛出 InterruptedException 则暗示该方法是可中断的，如 BlockingQueue#put、BlockingQueue#take、Object#wait、Thread#sleep 等，如果程序捕获到这些可中断的阻塞方法抛出的 InterruptedException 或检测到中断后，这些中断信息该如何处理？一般有以下两个通用原则：

如果遇到的是可中断的阻塞方法抛出 InterruptedException，可以继续向方法调用栈的上层抛出该异常，如果是检测到中断，则可清除中断状态并抛出 InterruptedException，使当前方法也成为一个可中断的方法。
若有时候不太方便在方法上抛出 InterruptedException，比如要实现的某个接口中的方法签名上没有 throws InterruptedException，这时就可以捕获可中断方法的 InterruptedException 并通过 Thread.currentThread.interrupt() 来重新设置中断状态。如果是检测并清除了中断状态，亦是如此。
一般的代码中，尤其是作为一个基础类库时，绝不应当吞掉中断，即捕获到 InterruptedException 后在 catch 里什么也不做，清除中断状态后又不重设中断状态也不抛出 InterruptedException 等。因为吞掉中断状态会导致方法调用栈的上层得不到这些信息。

当然，凡事总有例外的时候，当你完全清楚自己的方法会被谁调用，而调用者也不会因为中断被吞掉了而遇到麻烦，就可以这么做。

总得来说，就是要让方法调用栈的上层获知中断的发生。假设你写了一个类库，类库里有个方法 amethod，在 amethod 中检测并清除了中断状态，而没有抛出 InterruptedException，作为 amethod 的用户来说，他并不知道里面的细节，如果用户在调用 amethod 后也要使用中断来做些事情，那么在调用 amethod 之后他将永远也检测不到中断了，因为中断信息已经被 amethod 清除掉了。如果作为用户，遇到这样有问题的类库，又不能修改代码，那该怎么处理？只好在自己的类里设置一个自己的中断状态，在调用 interrupt 方法的时候，同时设置该状态，这实在是无路可走时才使用的方法。

### 2、 中断的响应

程序里发现中断后该怎么响应？

这就得视实际情况而定了。有些程序可能一检测到中断就立马将线程终止，有些可能是退出当前执行的任务，继续执行下一个任务……作为一种协作机制，这要与中断方协商好，当调用 interrupt 会发生些什么都是事先知道的，如做一些事务回滚操作，一些清理工作，一些补偿操作等。若不确定调用某个线程的 interrupt 后该线程会做出什么样的响应，那就不应当中断该线程。

# 4. Thread.interrupt VS Thread.stop

Thread.stop 方法已经不推荐使用了。而在某些方面 Thread.stop 与中断机制有着相似之处。如当线程在等待内置锁或 IO 时，stop 跟 interrupt 一样，不会中止这些操作；当 catch 住 stop 导致的异常时，程序也可以继续执行，虽然 stop 本意是要停止线程，这么做会让程序行为变得更加混乱。

## 那么它们的区别在哪里？

最重要的就是中断需要程序自己去检测然后做相应的处理，而 Thread.stop 会直接在代码执行过程中抛出 ThreadDeath 错误，这是一个 java.lang.Error 的子类。

```java
import java.util.Arrays;
import java.util.Random;
import java.util.concurrent.TimeUnit;
public class TestStop {
	private static final int[] array = new int[80000];
	private static final Thread t = new Thread() {
		public void run() {
			try {
				System.out.println(sort(array));
			} catch (Error err) {
				err.printStackTrace();
			}
			System.out.println("in thread t");
		}
	};
	
	static {
		Random random = new Random();
		for(int i = 0; i < array.length; i++) {
			array[i] = random.nextInt(i + 1);
		}
	}
	
	private static int sort(int[] array) {
		for (int i = 0; i < array.length-1; i++){
			for(int j = 0 ;j < array.length - i - 1; j++){
				if(array[j] < array[j + 1]){
					int temp = array[j];
					array[j] = array[j + 1];
					array[j + 1] = temp;
				}
			}
		}
		return array[0];
	}
	
	public static void main(String[] args) throws Exception {
		t.start();
		TimeUnit.SECONDS.sleep(1);
		System.out.println("go to stop thread t");
		t.stop();
		System.out.println("finish main");
	}
}
```

这个例子很简单，线程 t 里面做了一个非常耗时的排序操作，排序方法中，只有简单的加、减、赋值、比较等操作，一个可能的执行结果如下：

```
go to stop thread t
java.lang.ThreadDeath
	at java.lang.Thread.stop(Thread.java:758)
	at com.ticmy.interrupt.TestStop.main(TestStop.java:44)
finish main
in thread t
```

这里 sort 方法是个非常耗时的操作，也就是说主线程休眠一秒钟后调用 stop 的时候，线程 t 还在执行 sort 方法。就是这样一个简单的方法，也会抛出错误！换一句话说，调用 stop 后，大部分 Java 字节码都有可能抛出错误，哪怕是简单的加法！

## stop 为什么被禁用

如果线程当前正持有锁，stop 之后则会释放该锁。由于此错误可能出现在很多地方，那么这就让编程人员防不胜防，极易造成对象状态的不一致。

例如，对象 obj 中存放着一个范围值：最小值 low，最大值 high，且 low 不得大于 high，这种关系由锁 lock 保护，以避免并发时产生竞态条件而导致该关系失效。假设当前 low 值是 5，high 值是 10，当线程 t 获取 lock 后，将 low 值更新为了 15，此时被 stop 了，真是糟糕，如果没有捕获住 stop 导致的 Error，low 的值就为 15，high 还是 10，这导致它们之间的小于关系得不到保证，也就是对象状态被破坏了！如果在给 low 赋值的时候 catch 住 stop 导致的 Error 则可能使后面 high 变量的赋值继续，但是谁也不知道 Error 会在哪条语句抛出，如果对象状态之间的关系更复杂呢？这种方式几乎是无法维护的，太复杂了！如果是中断操作，它决计不会在执行 low 赋值的时候抛出错误，这样程序对于对象状态一致性就是可控的。

正是因为**可能导致对象状态不一致**，stop 才被禁用。

# 5. 中断的使用

## 中断的场景

通常，中断的使用场景有以下几个：

- 点击某个桌面应用中的取消按钮时；

- 某个操作超过了一定的执行时间限制需要中止时；

- 多个线程做相同的事情，只要一个线程成功其它线程都可以取消时；

- 一组线程中的一个或多个出现错误导致整组都无法继续时；

- 当一个应用或服务需要停止时。

## 具体例子

下面来看一个具体的例子。

这个例子里，本打算采用 GUI 形式，但考虑到 GUI 代码会使程序复杂化，就使用控制台来模拟下核心的逻辑。

这里新建了一个磁盘文件扫描的任务，扫描某个目录下的所有文件并将文件路径打印到控制台，扫描的过程可能会很长。若需要中止该任务，只需在控制台键入 quit 并回车即可。

```java
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;

public class FileScanner {
	private static void listFile(File f) throws InterruptedException {
		if(f == null) {
			throw new IllegalArgumentException();
		}
		if(f.isFile()) {
			System.out.println(f);
			return;
		}
		File[] allFiles = f.listFiles();
		if(Thread.interrupted()) {
			throw new InterruptedException("文件扫描任务被中断");
		}
		for(File file : allFiles) {
			// 还可以将中断检测放到这里 
			listFile(file);
		}
	}
	
	public static String readFromConsole() {
		BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
		try {
			return reader.readLine();
		} catch (Exception e) {
			e.printStackTrace();
			return "";
		}
	}
	
	public static void main(String[] args) throws Exception {
		final Thread fileIteratorThread = new Thread() {
			public void run() {
				try {
					listFile(new File("c:\\"));
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
		};
		new Thread() {
			public void run() {
				while(true) {
					if("quit".equalsIgnoreCase(readFromConsole())) {
						if(fileIteratorThread.isAlive()) {
							fileIteratorThread.interrupt();
							return;
						}
					} else {
						System.out.println("输入 quit 退出文件扫描");
					}
				}
			}
		}.start();
		fileIteratorThread.start();
	}
}
```

在扫描文件的过程中，对于中断的检测这里采用的策略是，如果碰到的是文件就不检测中断，是目录才检测中断，因为文件可能是非常多的，每次遇到文件都检测一次会降低程序执行效率。

此外，在 fileIteratorThread 线程中，仅是捕获了 InterruptedException，没有重设中断状态也没有继续抛出异常，因为我非常清楚它的使用环境，run 方法的调用栈上层已经没有可能需要检测中断状态的方法了。

在这个程序中，输入 quit 完全可以执行 System.exit(0) 操作来退出程序。

但正如前面提到的，这是个 GUI 程序核心逻辑的模拟，在 GUI 中，执行 System.exit(0)会使得整个程序退出。

# 如何中断线程

如果一个线程处于了阻塞状态（如线程调用了thread.sleep、thread.join、thread.wait、1.5中的condition.await、以及可中断的通道上的 I/O 操作方法后可进入阻塞状态），则在线程在检查中断标示时如果发现中断标示为true，则会在这些阻塞方法（sleep、join、wait、1.5中的condition.await及可中断的通道上的 I/O 操作方法）调用处抛出InterruptedException异常，并且在抛出异常后立即将线程的中断标示位清除，即重新设置为false。抛出异常是为了线程从阻塞状态醒过来，并在结束线程前让程序员有足够的时间来处理中断请求。 

## 无法中断的情况

synchronized在获锁的过程中是不能被中断的，意思是说如果产生了死锁，则不可能被中断（请参考后面的测试例子）。

与synchronized功能相似的reentrantLock.lock()方法也是一样，它也不可中断的，即如果发生死锁，那么reentrantLock.lock()方法无法终止，如果调用时被阻塞，则它一直阻塞到它获取到锁为止。

但是如果调用带超时的tryLock方法reentrantLock.tryLock(long timeout, TimeUnit unit)，那么如果线程在等待时被中断，将抛出一个InterruptedException异常，这是一个非常有用的特性，因为它允许程序打破死锁。你也可以调用reentrantLock.lockInterruptibly()方法，它就相当于一个超时设为无限的tryLock方法。 

## 最基础中断形式

某些线程非常重要，以至于它们应该不理会中断，而是在处理完抛出的异常之后继续执行，但是更普遍的情况是，一个线程将把中断看作一个终止请求，这种线程的run方法遵循如下形式： 

```java
public void run() {
  try {
    ...
    /*
     * 不管循环里是否调用过线程阻塞的方法如sleep、join、wait，这里还是需要加上
     * !Thread.currentThread().isInterrupted()条件，虽然抛出异常后退出了循环，显
     * 得用阻塞的情况下是多余的，但如果调用了阻塞方法但没有阻塞时，这样会更安全、更及时。
     */
    while (!Thread.currentThread().isInterrupted()&& more work to do) {
      do more work 
    }
  } catch (InterruptedException e) {
    //线程在wait或sleep期间被中断了
  } finally {
    //线程结束前做一些清理工作
  }
}
```

## 需要重新设置中断状态

上面是while循环在try块里，如果try在while循环里时，应该在catch块里重新设置一下中断标示，因为抛出InterruptedException异常后，中断标示位会自动清除。

此时应该这样： 

```java
public void run() {
  while (!Thread.currentThread().isInterrupted()&& more work to do) {
    try {
      ...
      sleep(delay);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();//重新设置中断标示
    }
  }
}
```

## 底层中断异常处理方式

不要在你的底层代码里捕获InterruptedException异常后不处理，会处理不当，如下：

```java
void mySubTask(){
  try{
    sleep(delay);
  }catch(InterruptedException e){}//不要这样做
}
```

如果你不知道抛InterruptedException异常后如何处理，那么你有如下好的建议处理方式：

1、在catch子句中，调用Thread.currentThread.interrupt()来设置中断状态（因为抛出异常后中断标示会被清除），让外界通过判断Thread.currentThread().isInterrupted()标示来决定是否终止线程还是继续下去，应该这样做： 

```java
void mySubTask() {
  ...
  try {
    sleep(delay);
  } catch (InterruptedException e) {
    Thread.currentThread().isInterrupted();
  }
  ...
}
```

2、或者，更好的做法就是，不使用try来捕获这样的异常，让方法直接抛出：

```java
void mySubTask() throws InterruptedException {
  ...
  sleep(delay);
  ...
}
```

- 小技巧

如果你不知道如何处理异常，外界有需要知道这个异常，就把他抛出去。

## 中断信号量

使用中断信号量中断非阻塞状态的线程

中断线程最好的，最受推荐的方式是，使用共享变量（shared variable）发出信号，告诉线程必须停止正在运行的任务。线程必须周期性的核查这一变量，然后有秩序地中止任务。

Example2描述了这一方式：

```java
class Example2 extends Thread {
  volatile boolean stop = false;// 线程中断信号量
  public static void main(String args[]) throws Exception {
    Example2 thread = new Example2();
    System.out.println("Starting thread...");
    thread.start();
    Thread.sleep(3000);
    System.out.println("Asking thread to stop...");
    // 设置中断信号量
    thread.stop = true;
    Thread.sleep(3000);
    System.out.println("Stopping application...");
  }
  public void run() {
    // 每隔一秒检测一下中断信号量
    while (!stop) {
      System.out.println("Thread is running...");
      long time = System.currentTimeMillis();
      /*
       * 使用while循环模拟 sleep 方法，这里不要使用sleep，否则在阻塞时会 抛
       * InterruptedException异常而退出循环，这样while检测stop条件就不会执行，
       * 失去了意义。
       */
      while ((System.currentTimeMillis() - time < 1000)) {}
    }
    System.out.println("Thread exiting under request...");
  }
}
```

## 使用thread.interrupt()中断非阻塞状态线程

虽然Example2该方法要求一些编码，但并不难实现。同时，它给予线程机会进行必要的清理工作。

这里需注意一点的是需将共享变量定义成volatile 类型或将对它的一切访问封入同步的块/方法（synchronized blocks/methods）中。

上面是中断一个非阻塞状态的线程的常见做法，但对非检测isInterrupted()条件会更简洁:

```java
class Example2 extends Thread {
  public static void main(String args[]) throws Exception {
    Example2 thread = new Example2();
    System.out.println("Starting thread...");
    thread.start();
    Thread.sleep(3000);
    System.out.println("Asking thread to stop...");
    // 发出中断请求
    thread.interrupt();
    Thread.sleep(3000);
    System.out.println("Stopping application...");
  }
  public void run() {
    // 每隔一秒检测是否设置了中断标示
    while (!Thread.currentThread().isInterrupted()) {
      System.out.println("Thread is running...");
      long time = System.currentTimeMillis();
      // 使用while循环模拟 sleep
      while ((System.currentTimeMillis() - time < 1000) ) {
          // 这里应该短暂的 sleep，避免对 CPU 消耗过大
      }
    }
    System.out.println("Thread exiting under request...");
  }
}
```

到目前为止一切顺利！

但是，当线程等待某些事件发生而被阻塞，又会发生什么？

当然，如果线程被阻塞，它便不能核查共享变量，也就不能停止。这在许多情况下会发生，例如调用Object.wait()、ServerSocket.accept()和DatagramSocket.receive()时，这里仅举出一些。他们都可能永久的阻塞线程。即使发生超时，在超时期满之前持续等待也是不可行和不适当的，所以，要使用某种机制使得线程更早地退出被阻塞的状态。

下面就来看一下中断阻塞线程技术。

## 使用thread.interrupt()中断阻塞状态线程

Thread.interrupt()方法不会中断一个正在运行的线程。

这一方法实际上完成的是，设置线程的中断标示位，在线程受到阻塞的地方（如调用sleep、wait、join等地方）抛出一个异常InterruptedException，并且中断状态也将被清除，这样线程就得以退出阻塞的状态。

下面是具体实现： 

```java
class Example3 extends Thread {
  public static void main(String args[]) throws Exception {
    Example3 thread = new Example3();
    System.out.println("Starting thread...");
    thread.start();
    Thread.sleep(3000);
    System.out.println("Asking thread to stop...");
    thread.interrupt();// 等中断信号量设置后再调用
    Thread.sleep(3000);
    System.out.println("Stopping application...");
  }
  public void run() {
    while (!Thread.currentThread().isInterrupted()) {
      System.out.println("Thread running...");
      try {
        /*
         * 如果线程阻塞，将不会去检查中断信号量stop变量，所 以thread.interrupt()
         * 会使阻塞线程从阻塞的地方抛出异常，让阻塞线程从阻塞状态逃离出来，并
         * 进行异常块进行 相应的处理
         */
        Thread.sleep(1000);// 线程阻塞，如果线程收到中断操作信号将抛出异常
      } catch (InterruptedException e) {
        System.out.println("Thread interrupted...");
        /*
         * 如果线程在调用 Object.wait()方法，或者该类的 join() 、sleep()方法
         * 过程中受阻，则其中断状态将被清除
         */
        System.out.println(this.isInterrupted());// false
        //中不中断由自己决定，如果需要真真中断线程，则需要重新设置中断位，如果
        //不需要，则不用调用
        Thread.currentThread().interrupt();
      }
    }
    System.out.println("Thread exiting under request...");
  }
}
```

一旦Example3中的Thread.interrupt()被调用，线程便收到一个异常，于是逃离了阻塞状态并确定应该停止。

上面我们还可以使用共享信号量来替换!Thread.currentThread().isInterrupted()条件，但不如它简洁。

## 死锁状态线程无法被中断

Example4试着去中断处于死锁状态的两个线程，但这两个线都没有收到任何中断信号（抛出异常），所以interrupt()方法是不能中断死锁线程的，因为锁定的位置根本无法抛出异常： 

```java
class Example4 extends Thread {
  public static void main(String args[]) throws Exception {
    final Object lock1 = new Object();
    final Object lock2 = new Object();
    Thread thread1 = new Thread() {
      public void run() {
        deathLock(lock1, lock2);
      }
    };
    Thread thread2 = new Thread() {
      public void run() {
        // 注意，这里在交换了一下位置
        deathLock(lock2, lock1);
      }
    };
    System.out.println("Starting thread...");
    thread1.start();
    thread2.start();
    Thread.sleep(3000);
    System.out.println("Interrupting thread...");
    thread1.interrupt();
    thread2.interrupt();
    Thread.sleep(3000);
    System.out.println("Stopping application...");
  }
  static void deathLock(Object lock1, Object lock2) {
    try {
      synchronized (lock1) {
        Thread.sleep(10);// 不会在这里死掉
        synchronized (lock2) {// 会锁在这里，虽然阻塞了，但不会抛异常
          System.out.println(Thread.currentThread());
        }
      }
    } catch (InterruptedException e) {
      e.printStackTrace();
      System.exit(1);
    }
  }
}
```

## 中断I/O操作

然而，如果线程在I/O操作进行时被阻塞，又会如何？

I/O操作可以阻塞线程一段相当长的时间，特别是牵扯到网络应用时。例如，服务器可能需要等待一个请求（request），又或者，一个网络应用程序可能要等待远端主机的响应。 

实现此InterruptibleChannel接口的通道是可中断的：如果某个线程在可中断通道上因调用某个阻塞的 I/O 操作（常见的操作一般有这些：serverSocketChannel. accept()、socketChannel.connect、socketChannel.open、socketChannel.read、socketChannel.write、fileChannel.read、fileChannel.write）而进入阻塞状态，而另一个线程又调用了该阻塞线程的 interrupt 方法，这将导致该通道被关闭，并且已阻塞线程接将会收到ClosedByInterruptException，并且设置已阻塞线程的中断状态。

另外，如果已设置某个线程的中断状态并且它在通道上调用某个阻塞的 I/O 操作，则该通道将关闭并且该线程立即接收到 ClosedByInterruptException；并仍然设置其中断状态。如果情况是这样，其代码的逻辑和第三个例子中的是一样的，只是异常不同而已。 

如果你正使用通道（channels）（这是在Java 1.4中引入的新的I/O API），那么被阻塞的线程将收到一个ClosedByInterruptException异常。但是，你可能正使用Java1.0之前就存在的传统的I/O，而且要求更多的工作。既然这样，Thread.interrupt()将不起作用，因为线程将不会退出被阻塞状态。Example5描述了这一行为。尽管interrupt()被调用，线程也不会退出被阻塞状态，比如ServerSocket的accept方法根本不抛出异常。 

很幸运，Java平台为这种情形提供了一项解决方案，即**调用阻塞该线程的套接字的close()方法**。

在这种情形下，如果线程被I/O操作阻塞，当调用该套接字的close方法时，该线程在调用accept地方法将接收到一个SocketException（SocketException为IOException的子异常）异常，这与使用interrupt()方法引起一个InterruptedException异常被抛出非常相似，（注，如果是流因读写阻塞后，调用流的close方法也会被阻塞，根本不能调用，更不会抛IOExcepiton，此种情况下怎样中断？我想可以转换为通道来操作流可以解决，比如文件通道）。

下面是具体实现： 

```java
class Example6 extends Thread {
  volatile ServerSocket socket;
  public static void main(String args[]) throws Exception {
    Example6 thread = new Example6();
    System.out.println("Starting thread...");
    thread.start();
    Thread.sleep(3000);
    System.out.println("Asking thread to stop...");
    Thread.currentThread().interrupt();// 再调用interrupt方法
    thread.socket.close();// 再调用close方法
    try {
      Thread.sleep(3000);
    } catch (InterruptedException e) {
    }
    System.out.println("Stopping application...");
  }
  public void run() {
    try {
      socket = new ServerSocket(8888);
    } catch (IOException e) {
      System.out.println("Could not create the socket...");
      return;
    }
    while (!Thread.currentThread().isInterrupted()) {
      System.out.println("Waiting for connection...");
      try {
        socket.accept();
      } catch (IOException e) {
        System.out.println("accept() failed or interrupted...");
        Thread.currentThread().interrupt();//重新设置中断标示位
      }
    }
    System.out.println("Thread exiting under request...");
  }
}
```

## 中断方式小结

一、没有任何语言方面的需求一个被中断的线程应该终止。中断一个线程只是为了引起该线程的注意，被中断线程可以决定如何应对中断。

二、对于处于sleep，join等操作的线程，如果被调用interrupt()后，会抛出InterruptedException，然后线程的中断标志位会由true重置为false，因为线程为了处理异常已经重新处于就绪状态。

三、不可中断的操作，包括进入synchronized段以及Lock.lock()，inputSteam.read()等，调用interrupt()对于这几个问题无效，因为它们都不抛出中断异常。如果拿不到资源，它们会无限期阻塞下去。

对于Lock.lock()，可以改用Lock.lockInterruptibly()，可被中断的加锁操作，它可以抛出中断异常。等同于等待时间无限长的Lock.tryLock(long time, TimeUnit unit)。

对于inputStream等资源，有些(实现了interruptibleChannel接口)可以通过close()方法将资源关闭，对应的阻塞也会被放开。　

# 参考资料

[详解 java 中断机制](https://www.infoq.cn/article/java-interrupt-mechanism)

[如何中断线程](https://www.jb51.net/article/114425.htm)

[处理 InterruptedException](https://www.ibm.com/developerworks/cn/java/j-jtp05236.html?spm=a2c4e.11153940.blogcont369285.11.40e07854VdFty7)

[对Java中interrupt、interrupted和isInterrupted的理解](http://www.php.cn/java-article-339998.html)

[java---interrupt、interrupted和isInterrupted的区别](https://www.cnblogs.com/w-wfy/p/6414801.html)

[深度解析Java线程池的异常处理机制](http://ifeve.com/%E6%B7%B1%E5%BA%A6%E8%A7%A3%E6%9E%90java%E7%BA%BF%E7%A8%8B%E6%B1%A0%E7%9A%84%E5%BC%82%E5%B8%B8%E5%A4%84%E7%90%86%E6%9C%BA%E5%88%B6/)

[Java thread中对异常的处理策略](https://www.cnblogs.com/googlemeoften/p/5769216.html)

# 下期学习目标

## Executor 框架

FutureTask

Future

Fork/Join 框架

栅栏

闭锁

信号量

《JCIP-105》

* any list
{:toc}

