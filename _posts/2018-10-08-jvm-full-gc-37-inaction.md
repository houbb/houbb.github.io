---
layout: post
title: JVM FULL GC 生产问题笔记多线程通用实现
date: 2018-10-08 23:36:46 +0800
categories: [Java]
tags: [jvm, gc, bytecode, sh]
published: true
---

# 拓展阅读

[JVM FULL GC 生产问题 I-多线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-37-inaction)

[JVM FULL GC 生产问题 II-如何定位内存泄露？ 线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction2)

[JVM FULL GC 生产问题 III-多线程执行队列的封装实现，进一步抽象](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction3)

[java 多线程实现通用方法 threadpool implement in java](https://houbb.github.io/2018/10/08/jvm-full-gc-39-inaction4)

# 故事的开始

早晨 8 点多，同事给我发了一条消息。

“跑批程序很慢，负载过高，上午帮忙看一下。”

我一边走路，一遍回复好的，整个人都是懵的，一方面是因为没睡饱，另一方面是因为对同事的程序一无所知。

而这，就是今天整个故事的开始。

## 问题的定位

到了公司，简单了解情况之后，开始登陆机器，查看日志。

一看好家伙，最简单的一个请求 10S+，换做实时链路估计直接炸锅了。

于是想到两种可能：

（1）数据库有慢 SQL，归档等严重影响性能的操作

（2）应用 FULL GC

于是让 DBA 帮忙定位是否有第一种情况的问题，自己登陆机器看是否有 FULL GC。

## 初步的解决

十几分钟后，DBA 告诉我确实有慢 SQL，已经 kill 掉了。

> [GC 日志](https://houbb.github.io/2018/10/08/jvm-27-gc-log)

不过查看 GC 日志的道路却一点都不顺利。

（1）发现应用本身没打印 gc log

（2）想使用 jstat 发现 docker 用户没权限，醉了。

于是让配管帮忙重新配置 jvm 参数加上 gc 日志，幸运的是，这个程序属于跑批程序，可以随时发布。

剩下的就等同事来了，下午验证一下即可。

# FULL-GC 的源头

## 慢的源头

有了 GC 日志之后，很快就定位到慢是因为一直在发生 full gc 导致的。

那么为什么会一直有 full gc 呢？

## jvm 配置的调整

一开始大家都以为是 jvm 的新生代配置的太小了，于是重新调整了 jvm 的参数配置。

结果很不幸，执行不久之后还是会触发 full gc。

要定位 full gc 的源头，只有开始看代码了。

# 代码与需求

## 需求

首先说一下应用内需要解决的问题还是比较简单的。

把数据库里的数据全部查出来，依次执行处理，不过有两点需要注意：

（1）数据量相对较大，百万级

（2）单条数据处理比较慢，希望处理的尽可能快。

## 业务简化

为了便于大家理解，我们这里简化所有的业务，使用最简单的 User 类来模拟业务。

- User.java

基本的数据库实体。

```java
/**
 * 用户信息
 * @author binbin.hou
 * @since 1.0.0
 */
public class User {

    private Integer id;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                '}';
    }

}
```

- UserMapper.java

模拟数据库查询操作。

```java
public class UserMapper {

    // 总数，可以根据实际调整为 100W+
    private static final int TOTAL = 100;

    public int count() {
        return TOTAL;
    }

    public List<User> selectAll() {
        return selectList(1, TOTAL);
    }

    public List<User> selectList(int pageNum, int pageSize) {
        List<User> list = new ArrayList<User>(pageSize);

        int start = (pageNum - 1) * pageSize;
        for (int i = start; i < start + pageSize; i++) {
            User user = new User();
            user.setId(i);
            list.add(user);
        }

        return list;
    }

    /**
     * 模拟用户处理
     *
     * @param user 用户
     */
    public void handle(User user) {
        try {
            // 模拟不同的耗时
            int id = user.getId();
            if(id % 2 == 0) {
                Thread.sleep(100);
            } else {
                Thread.sleep(200);
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(System.currentTimeMillis() + " " + Thread.currentThread().getName() + " " + user);
    }

}
```

这里提供了几个简单的方法，这里为了演示方便，将总数固定为 100。

- UserService.java

定义需要处理所有实体的一个接口。

```java
/**
 * 用户服务接口
 * @author binbin.hou
 * @since 1.0.0
 */
public interface UserService {


    /**
     * 处理所有的用户
     */
    void handleAllUser();

}
```


## v1-全部加载到内存

最简单粗暴的方式，就是把所有数据直接加载到内存。

```java
public class UserServiceAll implements UserService {


    /**
     * 处理所有的用户
     */
    public void handleAllUser() {
        UserMapper userMapper = new UserMapper();
        // 全部加载到内存

        List<User> userList = userMapper.selectAll();
        for(User user : userList) {
            // 处理单个用户
            userMapper.handle(user);
        }
    }

}
```

这种方式非常的简单，容易理解。

不过缺点也比较大，数据量较大的时候会直接把内存打爆。

我也尝试了一下这种方式，应用直接假死，所以不可行。

## v2-分页加载到内存

既然不能一把加载，那我很自然的就想到分页。

```java
/**
 * 分页查询
 * @author binbin.hou
 * @since 1.0.0
 */
public class UserServicePage implements UserService {

    /**
     * 处理所有的用户
     */
    public void handleAllUser() {
        UserMapper userMapper = new UserMapper();
        // 分页查询
        int total = userMapper.count();
        int pageSize = 10;

        int totalPage = total / pageSize;
        for(int i = 1; i <= totalPage; i++) {
            System.out.println("第" + i + " 页查询开始");
            List<User> userList = userMapper.selectList(i, pageSize);

            for(User user : userList) {
                // 处理单个用户
                userMapper.handle(user);
            }
        }
    }

}
```

一般这样处理也就够了，不过因为想追求更快的处理速度，同事使用了多线程，大概实现如下。


## v3-分页多线程

这里使用 Executor 线程池进行单个数据的消费处理。

主要注意点有两个地方：

（1）使用 sublist 控制每一个线程处理的数据范围

（2）使用 CountDownLatch 保证当前页处理完成后，才进行到下一次分页的查询和处理。

```java
import com.github.houbb.thread.demo.dal.entity.User;
import com.github.houbb.thread.demo.dal.mapper.UserMapper;
import com.github.houbb.thread.demo.service.UserService;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * 分页查询多线程
 * @author binbin.hou
 * @since 1.0.0
 */
public class UserServicePageExecutor implements UserService {

    private static final int THREAD_NUM = 5;

    private static final Executor EXECUTOR = Executors.newFixedThreadPool(THREAD_NUM);

    /**
     * 处理所有的用户
     */
    public void handleAllUser() {
        UserMapper userMapper = new UserMapper();
        // 分页查询
        int total = userMapper.count();
        int pageSize = 10;

        int totalPage = total / pageSize;
        for(int i = 1; i <= totalPage; i++) {
            System.out.println("第 " + i + " 页查询开始");
            List<User> userList = userMapper.selectList(i, pageSize);

            // 使用多线程处理
            int count = userList.size();
            int countPerThread = count / THREAD_NUM;

            // 通过 CountDownLatch 保证当前分页执行完成，才继续下一个分页的处理。
            CountDownLatch countDownLatch = new CountDownLatch(THREAD_NUM);
            for(int j = 0; j < THREAD_NUM; j++) {
                int startIndex = j * countPerThread;
                int endIndex = startIndex + countPerThread;
                // 最后一个
                if(j == THREAD_NUM - 1) {
                    endIndex = count;
                }

                final int finalStartIndex = startIndex;
                final int finalEndIndex = endIndex;
                EXECUTOR.execute(()->{
                    List<User> subList = userList.subList(finalStartIndex, finalEndIndex);
                    handleList(subList);

                    // countdown
                    countDownLatch.countDown();
                });
            }


            try {
                countDownLatch.await();

                System.out.println("第 " + i + " 页查询全部完成");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    private void handleList(List<User> userList) {
        UserMapper userMapper = new UserMapper();

        // 处理
        for(User user : userList) {
            // 处理单个用户
            userMapper.handle(user);
        }
    }

}
```

这个实现是有一点复杂，但是第一感觉还是没啥问题。

为什么就 full gc 了呢？

### sublist 的坑

这里使用了 sublist 方法，性能很好，也达到了分割范围的作用。

不过一开始，我却怀疑这里导致了内存泄漏。

SubList 的源码：

```java
private class SubList extends AbstractList<E> implements RandomAccess {
        private final AbstractList<E> parent;
        private final int parentOffset;
        private final int offset;
        int size;

        SubList(AbstractList<E> parent,
                int offset, int fromIndex, int toIndex) {
            this.parent = parent;
            this.parentOffset = fromIndex;
            this.offset = offset + fromIndex;
            this.size = toIndex - fromIndex;
            this.modCount = ArrayList.this.modCount;
        }
}
```

可以看出SubList原理：

1. 保存父ArrayList的引用；

2. 通过计算offset和size表示subList在原始list的范围；

由此可知，这种方式的subList保存对原始list的引用，而且是强引用，导致GC不能回收，故而导致内存泄漏，当程序运行一段时间后，程序无法再申请内存，抛出内存溢出错误。

解决思路是使用工具类替代掉 sublist 方法，缺点是内存占用会变多，比如：

```java
/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class ListUtils {

    @SuppressWarnings("all")
    public static List copyList(List list, int start, int end) {
        List results = new ArrayList();
        for(int i = start; i < end; i++) {
            results.add(list.get(i));
        }
        return results;
    }
    
}
```

经过实测，发现并不是这个原因导致的。orz

### lambda 的坑

因为使用的 jdk8，所以大家也就习惯性的使用 lambda 表达式。

```java
EXECUTOR.execute(()->{
    //...
});
```

这里实际上是一个语法糖，会导致 executor 引用 sublist。

因为 executor 的生命周期是非常长的，从而会让 sublist 一直得不到释放。

后来把代码调整了如下，full gc 也确认解决了。

## v4-分页多线程 Task

我们使用 Task，让 sublist 放在 task 中去处理。

```java
public class UserServicePageExecutorTask implements UserService {

    private static final int THREAD_NUM = 5;

    private static final Executor EXECUTOR = Executors.newFixedThreadPool(THREAD_NUM);

    /**
     * 处理所有的用户
     */
    public void handleAllUser() {
        UserMapper userMapper = new UserMapper();
        // 分页查询
        int total = userMapper.count();
        int pageSize = 10;

        int totalPage = total / pageSize;
        for(int i = 1; i <= totalPage; i++) {
            System.out.println("第 " + i + " 页查询开始");
            List<User> userList = userMapper.selectList(i, pageSize);

            // 使用多线程处理
            int count = userList.size();
            int countPerThread = count / THREAD_NUM;

            // 通过 CountDownLatch 保证当前分页执行完成，才继续下一个分页的处理。
            CountDownLatch countDownLatch = new CountDownLatch(THREAD_NUM);
            for(int j = 0; j < THREAD_NUM; j++) {
                int startIndex = j * countPerThread;
                int endIndex = startIndex + countPerThread;
                // 最后一个
                if(j == THREAD_NUM - 1) {
                    endIndex = count;
                }

                Task task = new Task(countDownLatch, userList, startIndex, endIndex);
                EXECUTOR.execute(task);
            }

            try {
                countDownLatch.await();

                System.out.println("第 " + i + " 页查询全部完成");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    private void handleList(List<User> userList) {
        UserMapper userMapper = new UserMapper();

        // 处理
        for(User user : userList) {
            // 处理单个用户
            userMapper.handle(user);
        }
    }

    private class Task implements Runnable {

        private final CountDownLatch countDownLatch;

        private final List<User> allList;

        private final int startIndex;

        private final int endIndex;

        private Task(CountDownLatch countDownLatch, List<User> allList, int startIndex, int endIndex) {
            this.countDownLatch = countDownLatch;
            this.allList = allList;
            this.startIndex = startIndex;
            this.endIndex = endIndex;
        }

        @Override
        public void run() {
            try {
                List<User> subList = allList.subList(startIndex, endIndex);
                handleList(subList);
            } catch (Exception exception) {
                exception.printStackTrace();
            } finally {
                countDownLatch.countDown();
            }
        }
    }

}
```

我们这里做了一点上面没有考虑到的点，countDownLatch 可能无法被执行，导致线程被卡主。

于是我们把 `countDownLatch.countDown();` 放在 finally 中去执行。

辛苦搞了大半天，按理说到这里故事应该就结束了，不过现实比理论更加梦幻。

实际执行的时候，这个程序总是会卡主一段时间，导致整体的效果很差，还没有不适用多线程的效果好。

和其他同事沟通了一下，还是建议使用 生产-消费者 模式去实现比较好，原因如下：

（1）实现相对简单，不会产生奇奇怪怪的 BUG

（2）相对于 countDownLatch 的强制等待，生产-消费者模式可以做到基本无锁，性能更好。

于是，我晚上就花时间写了一个简单的 demo。

## v5-生产消费者模式

这里我们使用 ArrayBlockingQueue 作为阻塞队列，也就是消息的存储媒介。

当然，你也可以使用公司的 mq 中间件来实现类似的效果。

```java
import com.github.houbb.thread.demo.dal.entity.User;
import com.github.houbb.thread.demo.dal.mapper.UserMapper;
import com.github.houbb.thread.demo.service.UserService;

import java.util.List;
import java.util.concurrent.*;

/**
 * 分页查询-生产消费
 * @author binbin.hou
 * @since 1.0.0
 */
public class UserServicePageQueue implements UserService {

    // 分页大小
    private final int pageSize = 10;

    private static final int THREAD_NUM = 5;

    private final Executor executor = Executors.newFixedThreadPool(THREAD_NUM);

    private final ArrayBlockingQueue<User> queue = new ArrayBlockingQueue<>(2 * pageSize, true);

    // 模拟注入
    private UserMapper userMapper = new UserMapper();

    // 消费线程任务
    public class ConsumerTask implements Runnable {

        @Override
        public void run() {
            while (true) {
                try {
                    // 会阻塞直到获取到元素
                    User user = queue.take();
                    userMapper.handle(user);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    // 初始化消费者进程
    // 启动五个进程去处理
    private void startConsumer() {
        for(int i = 0; i < THREAD_NUM; i++) {
            ConsumerTask task = new ConsumerTask();
            executor.execute(task);
        }
    }

    /**
     * 处理所有的用户
     */
    public void handleAllUser() {
        // 启动消费者
        startConsumer();

        // 分页查询
        int total = userMapper.count();
        int pageSize = 10;

        int totalPage = total / pageSize;
        for(int i = 1; i <= totalPage; i++) {
            // 等待消费者处理已有的信息
            awaitQueue(pageSize);

            System.out.println("第 " + i + " 页查询开始");
            List<User> userList = userMapper.selectList(i, pageSize);

            // 直接往队列里面扔
            queue.addAll(userList);

            System.out.println("第 " + i + " 页查询全部完成");
        }
    }

    /**
     * 等待，直到 queue 的小于等于 limit，才进行生产处理
     *
     * 首先判断队列的大小，可以调整为0的时候，才查询。
     * 不过因为查询也比较耗时，所以可以调整为小于 pageSize 的时候就可以准备查询
     * 从而保障消费者不会等待太久
     * @param limit 限制
     */
    private void awaitQueue(int limit) {
        while (true) {
            // 获取阻塞队列的大小
            int size = queue.size();

            if(size >= limit) {
                try {
                    System.out.println("当前大小：" + size + ", 限制大小: " + limit);
                    // 根据实际的情况进行调整
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            } else {
                break;
            }
        }
    }
}
```

整体的实现确实简单很多，因为查询比处理一般要快，所以往队列中添加元素时，这里进行了等待。

当然可以根据你的实际业务进行调整等待时间等。

这里保证小于等于 pageSize 时才插入新的元素，保证不超过队列的总长度，同时尽可能的让消费者不会进入空闲等待状态。

# 小结

总的来说，造成 full gc 的原因一般都是内存泄漏。

GC 日志真的很重要，遇到问题一定要记得添加上，这样才能更好的分析解决问题。

很多技术知识，我们以为熟悉了，往往还是存在不少坑。

要永远记得**如无必要，勿增实体**。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料 

[Java-ArrayList-subList()方法不恰当使用引起的OutOfMemoryError](https://blog.csdn.net/wang704987562/article/details/83107674)

[String类的split方法引起的内存泄漏](https://blog.csdn.net/freebird_lb/article/details/7460556)

[List#subList和Spring#split的使用陷阱](https://www.jianshu.com/p/583714e96859?utm_campaign=maleskine&utm_content=note&utm_medium=seo_notes&utm_source=recommendation)

[java lambda 表达式内存泄露_介绍 Java 中的内存泄漏](https://blog.csdn.net/weixin_39852688/article/details/114815911)

* any list
{:toc}