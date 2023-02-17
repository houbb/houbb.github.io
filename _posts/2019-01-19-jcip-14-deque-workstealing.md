---
layout: post
title:  JCIP-14-双端队列与工作密取
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, lock, data-struct, sh]
published: true
excerpt: JCIP-14-双端队列与工作密取
---

# 双端队列

Deque 是 Double ended queue (双端队列) 的缩写,读音和 deck 一样，蛋壳。
 
Deque 主要实现类有ArrayDeque 和 LinkedBlockingDeque。

## 使用场景

Deque 的实现类主要分为两种场景：

- 一般场景 

LinkedList 大小可变的链表双端队列，允许元素为 null

ArrayDeque 大下可变的数组双端队列，不允许 null

- 并发场景 

LinkedBlockingDeque 如果队列为空时，获取操作将会阻塞，知道有元素添加

性能最好的应该是：ConcurrentLinkedDeque

## 常见实现及说明

ArrayBlockingQueue：基于数组实现的一个有界阻塞队，大小不能重新定义。所以当你试图向一个满的队列添加元素的时候，就会受到阻塞，直到另一个方法从队列中取出元素。

ConcurrentLinkedDeque / ConcurrentLinkedQueue：基于链表实现的无界队列，添加元素不会堵塞。但是这就要求这个集合的消费者工作速度至少要和生产这一样快，不然内存就会耗尽。严重依赖于CAS(compare-and-set)操作。

DelayQueue：无界的保存Delayed元素的集合。元素只有在延时已经过期的时候才能被取出。队列的第一个元素延期最小（包含负值——延时已经过期）。当你要实现一个延期任务的队列的时候使用（不要自己手动实现——使用ScheduledThreadPoolExecutor）。

LinkedBlockingDeque / LinkedBlockingQueue：可选择有界或者无界基于链表的实现。在队列为空或者满的情况下使用ReentrantLock-s。

LinkedTransferQueue：基于链表的无界队列。除了通常的队列操作，它还有一系列的transfer方法，可以让生产者直接给等待的消费者传递信息，这样就不用将元素存储到队列中了。这是一个基于CAS操作的无锁集合。
PriorityBlockingQueue：PriorityQueue的无界的版本。

SynchronousQueue：一个有界队列，其中没有任何内存容量。这就意味着任何插入操作必须等到响应的取出操作才能执行，反之亦反。如果不需要Queue接口的话，通过Exchanger类也能完成响应的功能。

## list 适合做双端队列吗？

list是天生的双端队列,前后伸展都很容易。如果说它不适合,是因为:

1) 如果单个数据节点不大,每个节点都加上prev和next两个指针域(占八个字节),实在太浪费了。如数据仅仅是一个int,list就要用三倍的空间!

2) 如果空间配置器不支持内存池分配,数据单位字节数少而数量多,产生的内存碎片会很多,还有堆空间前面四个字节的小甜饼占了太多内存,理由跟1)一样,还是内存!

# 工作密取

在 生产者-消费者 模式中，所有消费者都从一个工作队列中取元素，一般使用阻塞队列实现；
而在 工作密取 模式中，每个消费者有其单独的工作队列，如果它完成了自己双端队列中的全部工作，那么它就可以从其他消费者的双端队列末尾秘密地获取工作。

## vs 生产者-消费者

工作密取模式对比传统的 生产者-消费者模式，更为灵活。

因为多个线程不会因为在同一个工作队列中抢占内容发生竞争。

在大多数时候，它们只是访问自己的双端队列。即使需要访问另一个队列时，也是从队列的尾部获取工作，降低了队列上的竞争程度。

## 适用场景

工作密取非常适用于即是消费者也是生产者问题。

当执行某个工作时可能导致出现更多的工作。

例如，在网页爬虫程序中处理一个页面时，通常会发现有更多的页面需要处理。类似的还有许多搜索图的算法，例如在垃圾回收阶段对堆进行标记，都可以通过工作密取机制来实现高效并行。当一个工作线程找到新的任务单元时，它会将其放到自己队列的末尾（或者在工作共享模式中，放入其它工作者线程的队列中）。当双端队列为空时，它会在另一个线程的队列末尾查找新的任务，从而确保每个线程都保持忙碌状态。

# 工作密取算法

```java
public interface WorkStealingEnableChannel<P> extends Chanel<P> {
    P take(BlockingDeque<P> preferredQueue) throws InterruptedException;
}

public class WorkStealingChannel<P> implements WorkStealingEnableChannel<P> {
    //双端队列，可以从2端插入值或获取值，继承了BlockingQueue
    private final BlockingDeque<P>[] managedQueues;

    public WorkStealingChannel(BlockingDeque<P>[] managedQueues) {
        super();
        this.managedQueues = managedQueues;
    }

    @Override
    public P take() throws InterruptedException {
        return take(null);
    }

    @Override
    public void put(P product) throws InterruptedException {
        int targetIndex = (product.hashCode() % managedQueues.length);
        BlockingQueue<P> targetQueue = managedQueues[targetIndex];
        targetQueue.put(product);
    }

    @Override
    public P take(BlockingDeque<P> preferredQueue) throws InterruptedException {
        BlockingDeque<P> targetQueue = preferredQueue;
        P product = null;

        //优先从指定的队列获取值
        if(null != targetQueue){
            product = targetQueue.poll();
        }

        int queueIndex = -1;

        while(null != product){
            queueIndex = (queueIndex +1) % managedQueues.length;
            targetQueue = managedQueues[queueIndex];
            //试图从其他受管队列的队尾“窃取”“产品”
            product = targetQueue.pollLast();
            if(preferredQueue == targetQueue){
                break;
            }
        }

        if(null == product){
            //随机窃取 其他受管队列的产品
            queueIndex = (int) (System.currentTimeMillis() % managedQueues.length);
            targetQueue = managedQueues[queueIndex];
            product = targetQueue.pollLast();
            System.out.println("stealed from " + queueIndex + ": " + product);
        }

        return product;
    }
}


public class WorkStealingExample {
    private final WorkStealingEnableChannel<String> channel;
    private final TerminationToken token = new TerminationToken();

    public static void main(String[] args) throws InterruptedException {
        WorkStealingExample wse = new WorkStealingExample();
        //Thread.sleep(3500);
    }

    public WorkStealingExample(){
        int nCPU = Runtime.getRuntime().availableProcessors();
        int consumerCount = nCPU/2 + 1;

        BlockingDeque<String>[] managedQueues = new LinkedBlockingDeque[consumerCount];

        channel = new WorkStealingChannel<String>(managedQueues);

        Consumer[] consumers = new Consumer[consumerCount];
        for(int i=0; i<consumerCount; i++){
            managedQueues[i] = new LinkedBlockingDeque<String>();
            consumers[i] = new Consumer(token, managedQueues[i]);
        }
        for(int i=0; i<nCPU; i++){
            new Producer().start();
        }
        for(int i=0; i<consumerCount; i++){
            consumers[i].start();
        }
    }

    private class Producer extends AbstractTerminatableThread{
        private int i = 0;

        @Override
        protected void doRun() throws Exception {
            channel.put(String.valueOf(i++));
            Thread.sleep(10);
            token.reservations.incrementAndGet();
        }
    }

    private class Consumer extends AbstractTerminatableThread{
        private final BlockingDeque<String> workQueue;

        public Consumer(TerminationToken token, BlockingDeque<String> workQueue) {
            super(token);
            this.workQueue = workQueue;
        }

        @Override
        protected void doRun() throws Exception {
            /**
             * 实现了工作窃取算法
             */
            String product = channel.take();
            if(product != null){

            }
            System.out.println("Processing product:" + product);

            try {
                Thread.sleep(new Random().nextInt(50));
            } catch (Exception e) {

            }finally{
                token.reservations.decrementAndGet();
            }
        }
    }
}
```




# 参考资料

https://www.cnblogs.com/drizzlewithwind/p/6392229.html?utm_source=itdadao&utm_medium=referral

https://blog.csdn.net/u011240877/article/details/52865173

https://blog.csdn.net/liangdong2014/article/details/40790037

[生产者消费者模式之工作窃取算法](https://blog.csdn.net/huzhiqiangCSDN/article/details/55251384)

* any list
{:toc}

