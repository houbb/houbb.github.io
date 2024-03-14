---
layout: post
title: JVM FULL GC 生产问题 II-如何定位内存泄露？ 线程通用实现
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


# 情景回顾

我们在上一篇 [JVM FULL GC 生产问题笔记](https://houbb.github.io/2018/10/08/jvm-full-gc-37-inaction) 中提出了如何更好的实现一个多线程消费的实现方式。

没有看过的小伙伴建议看一下。

本来以为一切都可以结束的，不过又发生了一点点意外，这里记录一下，避免自己和小伙伴们踩坑。

# 生产-消费者模式

## 简介

上一节中我们尝试了多种多线程方案，总会有各种各样奇怪的问题。

于是最后决定使用生产-消费者模式去实现。

## 实现如下：

这里使用 AtomicLong 做了一个简单的计数。

`userMapper.handle2(Arrays.asList(user));` 这个方法是同事以前的方法，当然做了很多简化。

就没有修改，入参是一个列表。这里为了兼容，使用 Arrays.asList() 简单封装了一下。

```java
import com.github.houbb.thread.demo.dal.entity.User;
import com.github.houbb.thread.demo.dal.mapper.UserMapper;
import com.github.houbb.thread.demo.service.UserService;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 分页查询
 * @author binbin.hou
 * @since 1.0.0
 */
 2
 
public class UserServicePageQueue implements UserService {

    // 分页大小
    private final int pageSize = 10000;

    private static final int THREAD_NUM = 20;

    private final Executor executor = Executors.newFixedThreadPool(THREAD_NUM);

    private final ArrayBlockingQueue<User> queue = new ArrayBlockingQueue<>(2 * pageSize, true);


    // 模拟注入
    private UserMapper userMapper = new UserMapper();

    /**
     * 计算总数
     */
    private AtomicLong counter = new AtomicLong(0);

    // 消费线程任务
    public class ConsumerTask implements Runnable {

        @Override
        public void run() {
            while (true) {
                try {
                    // 会阻塞直到获取到元素
                    User user = queue.take();
                    userMapper.handle2(Arrays.asList(user));

                    long count = counter.incrementAndGet();
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

        // 充值计数器
        counter = new AtomicLong(0);

        // 分页查询
        int total = userMapper.count();
        int totalPage = total / pageSize;
        for(int i = 1; i <= totalPage; i++) {
            // 等待消费者处理已有的信息
            awaitQueue(pageSize);

            System.out.println(UserMapper.currentTime() + " 第 " + i + " 页查询开始");
            List<User> userList = userMapper.selectList(i, pageSize);

            // 直接往队列里面扔
            queue.addAll(userList);

            System.out.println(UserMapper.currentTime() + " 第 " + i + " 页查询全部完成");
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
                    // 根据实际的情况进行调整
                    Thread.sleep(1000);
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

## 测试验证

当然这个方法在集成环境跑没有任何的问题。

于是就开始直接上生产验证，结果开始很快，然后就可以变慢了。

一看 GC 日志，梅开二度，FULL GC。

可恶，圣斗士竟然会被同一招打败 2 次吗？

## FULL GC 的产生

一般要发现 full gc，最直观的感受就是程序很慢。

这时候你就需要添加一下 GC 日志打印，看一下是否有 full gc 即可。

这个最坑的地方就在于，性能问题是测试一般无法验证的，除非你进行压测。

压测还要同时满足两个条件：

（1）数据量足够大，或者说 QPS 足够高。持续压

（2）资源足够少，也就是还想马儿跑，还想马儿不吃草。

好巧不巧，我们同时赶上了两点。

那么问题又来了，如何定位为什么 FULL GC 呢？

## 内存泄露

程序变慢并不是一开始就慢，而是开始很快，然后变慢，接着就是不停的 FULL GC。

这就和自然的想到是内存泄露。

如何定位内存泄露呢？

你可以分成下面几步：

（1）看代码，是否有明显存在内存泄露的地方。然后修改验证。如果无法解决，则找出可能存在问题的地方，执行第二步。

（2）把 FULL GC 时的堆栈信息 dump 下来，分析到底是什么数据过大，然后结合 1 去解决。

接下来，让我们一起看一下这个过程的简化版本记录。

# 问题定位

## 看代码

最基本的生产者-消费者模式确认了即便，感觉没啥问题。

于是就要看一下消费者模式中调用其他人的方法问题。

### 方法的核心目的

（1）遍历入参列表，执行业务处理。

（2）把当前批次的处理结果写入到文件中。

### 方法实现

简化版本如下：

```java
/**
 * 模拟用户处理
 *
 * @param userList 用户列表
 */
public void handle2(List<User> userList) {
    String targetDir = "D:\\data\\";
    // 理论让每一个线程只读写属于自己的文件
    String fileName = Thread.currentThread().getName()+".txt";
    String fullFileName = targetDir + fileName;
    FileWriter fileWriter = null;
    BufferedWriter bufferedWriter = null;
    User userExample;
    try {
        fileWriter = new FileWriter(fullFileName);
        bufferedWriter = new BufferedWriter(fileWriter);
        StringBuffer stringBuffer = null;
        for(User user : userList) {
            stringBuffer = new StringBuffer();

            // 业务逻辑
            userExample = new User();
            userExample.setId(user.getId());
            // 如果查询到的结果已存在，则跳过处理
            List<User> userCountList = queryUserList(userExample);
            if(userCountList != null && userCountList.size() > 0) {
                return;
            }
            // 其他处理逻辑

            // 记录最后的结果
            stringBuffer.append("用户")
                    .append(user.getId())
                    .append("同步结果完成");
            bufferedWriter.newLine();
            bufferedWriter.write(stringBuffer.toString());
        }
        // 处理结果写入到文件中
        bufferedWriter.newLine();
        bufferedWriter.flush();
        bufferedWriter.close();
        fileWriter.close();
    } catch (Exception exception) {
        exception.printStackTrace();
    } finally {
        try {
            if (null != bufferedWriter) {
                bufferedWriter.close();
            }
            if (null != fileWriter) {
                fileWriter.close();
            }
        } catch (Exception e) {
        }
    }
}
```

这种代码怎么说呢，大概就是祖传代码吧，不晓得大家有没有见过，或者写过呢？

我们可以不看文件部分，核心部分实际上只有：

```java
User userExample;
for(User user : userList) {
    // 业务逻辑
    userExample = new User();
    userExample.setId(user.getId());
    // 如果查询到的结果已存在，则跳过处理
    List<User> userCountList = queryUserList(userExample);
    if(userCountList != null && userCountList.size() > 0) {
        return;
    }
    // 其他处理逻辑
}
```

### 代码存在的问题

你觉得上面的代码有哪些问题？

什么地方可能存在内存泄露呢？

有应该如何改进呢？

## 看堆栈

如果你看代码已经确定了疑惑的地方，那么接下来就是去看一下堆栈，验证下自己的猜想。

### 堆栈的查看方式

jvm 堆栈查看的方式很多，我们这里以 jmap 命令为例。

（1）找到 java 进程的 pid

你可以执行 `jps` 或者 `ps ux` 等，选择一个你喜欢的。

我们 windows 本地测试了下（实际生产一般是 linux 系统）：

```
D:\Program Files\Java\jdk1.8.0_192\bin>jps
11168 Jps
3440 RemoteMavenServer36
4512
11660 Launcher
11964 UserServicePageQueue
```

UserServicePageQueue 是我们执行的测试程序，所以 pid 是 11964

（2）执行 jmap 获取堆栈信息

命令：

```
jmap -histo 11964
```

效果如下：

```
D:\Program Files\Java\jdk1.8.0_192\bin>jmap -histo 11964

 num     #instances         #bytes  class name
----------------------------------------------
   1:        161031       20851264  [C
   2:        157949        3790776  java.lang.String
   3:          1709        3699696  [B
   4:          3472        3688440  [I
   5:        139358        3344592  com.github.houbb.thread.demo.dal.entity.User
   6:        139614        2233824  java.lang.Integer
   7:         12716         508640  java.io.FileDescriptor
   8:         12714         406848  java.io.FileOutputStream
   9:          7122         284880  java.lang.ref.Finalizer
  10:         12875         206000  java.lang.Object
  ...
```

当然下面还有很多，你可以使用 head 命令过滤。

当然，如果服务器不支持这个命令，你可以把堆栈信息输出到文件中：

```
jmap -histo 11964 >> dump.txt
```

## 堆栈分析

我们可以很明显发现不合理的地方：

`[C` 这里指的是 chars，有 161031。

String 是字符串，有 157949。

当然还有 User 对象，有 139358。

我们每一次分页是 1W 个，queue 中最多是 19999 个，这么多对象显然不合理。

## 代码中的问题

### chars 和 String 为什么这么多

代码给人的第一感受，就是和业务逻辑没啥关系的写文件了。

很多小伙伴肯定想到了可以使用 TWR 简化一下代码，不过这里存在两个问题：

（1）最后文件中能记录所有的执行结果吗？

（2）有没有更好的方式呢？

对于问题1，答案是不能。虽然我们为每一个线程创建一个文件，但是实际测试，发现文件会被覆盖。

实际上比起我们自己写文件，更应该使用 log 去记录结果，这样更加优雅。

于是，最后把代码简化如下：

```java
//日志

User userExample;
for(User user : userList) {
    // 业务逻辑
    userExample = new User();
    userExample.setId(user.getId());
    // 如果查询到的结果已存在，则跳过处理
    List<User> userCountList = queryUserList(userExample);
    if(userCountList != null && userCountList.size() > 0) {
        // 日志
        return;
    }
    // 其他处理逻辑

    // 日志记录结果
}
```

### user 对象为什么这里多？

我们看一下核心业务代码：

```java
User userExample;
for(User user : userList) {
    // 业务逻辑
    userExample = new User();
    userExample.setId(user.getId());
    // 如果查询到的结果已存在，则跳过处理
    List<User> userCountList = queryUserList(userExample);
    if(userCountList != null && userCountList.size() > 0) {
        return;
    }
    // 其他处理逻辑
}
```

这里在判断是否存在的时候构建了一个 mybatis 中常用的 User 查询条件，然后判断查询的列表大小。

这里有两个问题：

（1）判断是否存在，最好使用 count，而不是判断列表结果大小。

（2）User userExample 的作用域尽量小一点。

调整如下：

```java
for(User user : userList) {
    // 业务逻辑
    User userExample = new User();
    userExample.setId(user.getId());
    // 如果查询到的结果已存在，则跳过处理
    int count = selectCount(userExample);
    if(count > 0) {
        return;
    }
    // 其他业务逻辑
}
```

## 调整之后的代码

这里的 System.out.println 实际使用时用 log 替代，这里只是为了演示。

```java
/**
 * 模拟用户处理
 *
 * @param userList 用户列表
 */
public void handle3(List<User> userList) {
    System.out.println("入参：" + userList);
    for(User user : userList) {
        // 业务逻辑
        User userExample = new User();
        userExample.setId(user.getId());
        // 如果查询到的结果已存在，则跳过处理
        int count = selectCount(userExample);
        if(count > 0) {
            System.out.println("如果查询到的结果已存在，则跳过处理");
            continue;
        }
        // 其他业务逻辑
        System.out.println("业务逻辑处理结果");
    }
}
```

## 生产验证

全部改完之后，重新部署验证，一切顺利。

希望不会有第三篇。:)

# 小结

当然验证的过程中还发生过一点小插曲，比如开发没有权限看堆栈信息，执行命令时程序已经假死等等。

生产 full gc 是一个比较麻烦的问题，一个是难以复现，另一个是如果是偶发性的，又是实时链路，可能也不好执行 dump 命令。

所以写代码还是写的尽可能简单的好，不然会有各种问题。

能复用已有的工具、中间件尽量复用。

这样看来，我们自己写的生产-消费者模式也不太好，因为复用性不强，所以建议使用公司已有的 mq 工具，不过如何选择，还是看具体的业务场景。

**架构，就是权衡。**

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

* any list
{:toc}