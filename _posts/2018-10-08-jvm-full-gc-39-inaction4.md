---
layout: post
title: java 多线程实现通用方法 threadpool implement in java 
date: 2018-10-08 23:36:46 +0800
categories: [Java]
tags: [jvm, gc, thread, sh]
published: true
---

# 拓展阅读

[JVM FULL GC 生产问题 I-多线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-37-inaction)

[JVM FULL GC 生产问题 II-如何定位内存泄露？ 线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction2)

[JVM FULL GC 生产问题 III-多线程执行队列的封装实现，进一步抽象](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction3)

[java 多线程实现通用方法 threadpool implement in java](https://houbb.github.io/2018/10/08/jvm-full-gc-39-inaction4)


# 业务说明

有时候业务需要全量做一些事情。

比如给全量用户推送数据、全量抓取数据。

一般而言，如果处理的信息可以过滤，那最好先做一层过滤。

**如果无法过滤，数量又比较多的情况下，那使用多线程处理不失为一种解决方式。**

# 抽象目标方法

java 实现如下：

```java
import cn.hutool.core.collection.CollectionUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.*;

/**
 * 说明：全量推送，当数量较多时，推送较慢。所以采用多线程的方式。
 */
@Component
@Slf4j
public abstract class AbstractThreadBiz {

    /**
     * 初始化的线程池
     */
    private final ExecutorService executorService = new ThreadPoolExecutor(getThreadNum(), getThreadNum(), 0L,
            TimeUnit.MILLISECONDS, new LinkedBlockingQueue<>(getThreadNum()),
            new ThreadFactory() {
                private int i = 1;
                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r, String.format("THREAD-POOL-%s", i++));
                    t.setDaemon(true);
                    return t;
                }
            });

    /**
     * 线程数量
     * @return 数量
     */
    protected int getThreadNum() {
        return 5;
    }

    /**
     * 是否需要推送标识
     * @return 推送标识
     */
    protected boolean needPushFlag() {
        return true;
    }

    /**
     * 处理业务
     * @param bizId 业务标识
     * @param transTime 交易时间
     */
    protected abstract void doHandleBiz(String bizId, String transTime);

    /**
     * 查询所有的业务列表
     */
    protected abstract List<String> doQueryAllBizList();

    /**
     * 对外的处理入口
     * @param transTime 执行时间
     */
    public void execute(String transTime) {
        boolean needPushFlag = needPushFlag();
        if(!needPushFlag) {
            log.warn("{} 推送标识关闭，忽略推送处理", transTime);
            return;
        }

        //0. 插入初始化任务
        String taskId = IdUtil.uuid32();
        try {
            //1. 查询所有的业务标识
            List<String> bizIdList = doQueryAllBizList();

            //2. 多线程处理
            this.threadHandleBizList(bizIdList, transTime);

            //3. 任务结束
        } catch (Exception exception) {
            //4. 任务失败
            log.error("任务执行异常", exception);
        }
    }

    /**
     * 多线程处理业务列表
     * @param list 所有的列表
     * @param transTime 交易时间
     */
    protected void threadHandleBizList(List<String> list,
                                       String transTime) {
        if(CollectionUtil.isEmpty(list)) {
            log.warn("绑定列表为空，完成处理");
            return;
        }

        int threadNum = getThreadNum();
        int count = list.size();
        log.info("总业务数量 {}, 总线程数量 {}", count, threadNum);

        // 每个线程处理量
        final int countPerThread = count / threadNum;
        final String mdcId = LogUtil.getMdcId();

        // 数量较少时
        if(countPerThread <= 0) {
            log.warn("数量较少直接单线程执行 count {}, threadNum {}", count, threadNum);
            handleBizList(list, transTime, mdcId);
            return;
        }

        int startIndex = 0;
        int endIndex = 0;

        CountDownLatch countDown = new CountDownLatch(threadNum);
        for (int i = 0; i < threadNum; i++) {
            startIndex = endIndex;
            endIndex = startIndex + countPerThread;
            // 最后一个分剩余的所有
            if (i == threadNum - 1) {
                endIndex = list.size();
            }

            List<String> subList = list.subList(startIndex, endIndex);
            executorService.submit(() -> {
                handleBizList(subList, transTime, mdcId);
                // 计数递减1
                countDown.countDown();
            });
        }

        try {
            // 等待所有线程结束
            countDown.await();
        } catch (Exception e) {
            log.error("主线程等待异常", e);
        }
    }

    /**
     * 处理业务列表
     * @param list 列表
     * @param mdcId 日志标识
     */
    protected void handleBizList(List<String> list,
                                 String transTime,
                                 String mdcId) {
        try {
            // 异步线程注意设置 mdcId

            LogUtil.putMdc(mdcId);
            final int size = list.size();
            log.info("开始处理子列表 {}", size);

            for(String bizId : list) {
                log.info("开始处理业务标识：{}", bizId);
                
                //TODO: 业务处理逻辑
                doHandleBiz(bizId, transTime);

                log.info("完成处理业务标识：{}", bizId);
            }

            log.info("完成处理子列表 {}", size);
        } catch (Exception exception) {
            log.error("处理异常", exception);
        }
    }
}
```

## 分页优化

有时候我们不适合直接查出所有的信息。

可以把一次性查出所有，改成分页查询。

注意结合业务。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

* any list
{:toc}