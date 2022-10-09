---
layout: post
title: Mybatis PageHelper 进阶
date:  2018-10-27 06:41:12 +0800
categories: [Mybatis]
tags: [mybatis, java, sf]
published: true
excerpt:  Mybatis 分页插件 PageHelper
---

# Mybatis PageHelper

[MyBatis 分页插件 PageHelper](https://pagehelper.github.io/)

如果你也在用 MyBatis，建议尝试该分页插件，这一定是最方便使用的分页插件。

分页插件支持任何复杂的单表、多表分页。

## 拓展阅读

[分页插件介绍](https://houbb.github.io/2018/10/26/mybatis-page-helper)

# 基本的使用

```java
// 查询条件
UserExample userExample = new UserExample;

long count = userService.count(userExample);
long totalPageSize = count / pageSize;
// 注意是否整除的问题
if(count % pageSize != 0) {
    totalPageSize++;
}

// 分页处理
for(int i = 1; i <= totalPageSize; i++) {
    List<User> list = userService.queryByPage(userExample, i, pageSize);
    // 处理结果
}
```

# 通用的分页设计

## 接口

```java
public interface IBizQueue {

    /**
     * 处理入参
     * @param baseRequest 入参
     */
    void handle(BaseRequest baseRequest);

}
```

## 基本实现

```java
/**
 * 抽象业务队列
 *
 * @author binbin.hou
 */
public abstract class AbstractBizQueue<T> implements IBizQueue {

    private static final Logger logger = LoggerFactory.getLogger(AbstractBizQueue.class);

    protected ArrayBlockingQueue<T> queue = null;

    /**
     * 计算总数
     */
    private AtomicLong counter = null;

    /**
     * 请求入参
     */
    private BaseRequest baseRequest = null;

    /**
     * 分页大小
     *
     * @return 大小
     */
    protected int getPageSize() {
        return 10000;
    }

    /**
     * 线程数量
     *
     * @return 数量
     */
    protected int getThreadNum() {
        return 10;
    }

    /**
     * 等待的毫秒数
     *
     * @return 等待
     */
    protected long getAwaitMills() {
        return 2000;
    }

    /**
     * 获取任务名称
     *
     * @return 结果
     */
    protected String getTaskName() {
        return this.getClass().getSimpleName();
    }



    /**
     * 单个处理逻辑
     *
     * @param request 入参
     * @param t 单个实体
     */
    protected abstract void doHandle(BaseRequest request, T t);

    /**
     * 查询总数
     *
     * @param request 条件
     * @return 结果
     */
    protected abstract long queryCount(BaseRequest request);

    /**
     * 分页查询
     *
     * @param pageNum  当前页
     * @param pageSize 大小
     * @param request  请求
     * @return 结果
     */
    protected abstract List<T> queryByPage(int pageNum, int pageSize, BaseRequest request);

    /**
     * 查询列表
     *
     * @param ids     指定查询的 id 列表
     * @param request 请求
     * @return 结果
     */
    protected abstract List<T> queryByIds(List<String> ids, BaseRequest request);

    public AbstractBizQueue() {
        final int threadNum = getThreadNum();
        final String taskName = getTaskName();

        //1. 初始化
        // 消费者线程池
        final ExecutorService executor = Executors.newFixedThreadPool(threadNum, new ThreadFactory() {
            int i = 1;

            @Override
            public Thread newThread(Runnable r) {
                Thread t = new Thread(r, String.format(taskName + "-THREAD-%s", i++));
                t.setDaemon(true);
                return t;
            }
        });
        logger.info("完成初始化线程池 {}", taskName);
        this.queue = new ArrayBlockingQueue<>(2 * getPageSize(), true);
        this.counter = new AtomicLong(0);

        //2. 初始化消费者线程
        for (int i = 0; i < threadNum; i++) {
            ConsumerTask task = new ConsumerTask();
            executor.execute(task);

            logger.info("{}-消费者线程-{} 启动完成", taskName, i);
        }
    }

    /**
     * 处理多线程
     * @param baseRequest 请求
     */
    protected void handleMultiThread(BaseRequest baseRequest) {
        final int pageSize = this.getPageSize();

        long count = this.queryCount(baseRequest);
        long totalNo = count % pageSize == 0 ? count / pageSize : (count / pageSize) + 1;
        logger.info("开始处理信息，总数据量{},总共{}页", count, totalNo);

        // 注意：采用分页一定要保证查询的条件不能在迭代中被修改，否则会导致有些更新不到。
        for (int currentNo = 1; currentNo <= totalNo; currentNo++) {
            // 生产者等待
            awaitQueue();

            logger.info("当前处理第 {} 页数据", currentNo);
            List<T> pageList = this.queryByPage(currentNo, pageSize, baseRequest);
            logger.info("完成查询第 {} 页，结果大小: {}", currentNo, pageList.size());

            queue.addAll(pageList);
            logger.info("添加到队列完成: {}", pageList.size());
        }
    }

    @Override
    public void handle(BaseRequest baseRequest) {
        try {
            counter = new AtomicLong(0);
            this.baseRequest = baseRequest;
            logger.info("开始处理入参：{}", baseRequest);

            if (YesOrNoEnum.Y.getCode().equals(baseRequest.getFlag())) {
                this.handleMultiThread(baseRequest);
            } else {
                List<String> idList = baseRequest.getMerIdList();
                List<T> list = this.queryByIds(idList, baseRequest);

                if (CollectionUtils.isEmpty(list)) {
                    logger.info("{} 对应的列表为空，忽略处理。", baseRequest);
                    return;
                }

                for (T entity : list) {
                    this.doHandle(baseRequest, entity);
                }
            }

            logger.info("完成处理入参：{}", baseRequest);
        } catch (Exception exception) {
            logger.error("{} 处理异常", baseRequest, exception);
        } finally {
            TraceIdUtil.remove();
        }
    }

    // 消费线程任务
    private class ConsumerTask implements Runnable {
        @Override
        public void run() {
            while (true) {
                try {
                    // 会阻塞直到获取到元素
                    T entity = queue.take();

                    logger.info("开始处理元素：{}", JSON.toJSON(entity));
                    doHandle(baseRequest, entity);

                    long num = counter.incrementAndGet();
                    logger.info("当前已完成处理的总数: {}, queue.size {}", num, queue.size());
                } catch (InterruptedException e) {
                    logger.error("消费者线程执行异常 999999", e);
                }
            }
        }
    }

    /**
     * 等待，直到 queue 的小于等于 limit，才进行生产处理
     */
    protected void awaitQueue() {
        while (true) {
            // 获取阻塞队列的大小
            int size = queue.size();

            // 对于可变的更新，需要保证查询的内容不重复。
            final int limitSize = 1;
            final long awaitMills = getAwaitMills();

            if (size >= limitSize) {
                try {
                    logger.info("当前队列大小：{}, 限制大小: {}，睡眠等待", size, limitSize);
                    // 根据实际的情况进行调整
                    Thread.sleep(awaitMills);
                } catch (InterruptedException e) {
                    logger.error("等待队列异常", e);
                }
            } else {
                logger.info("生产者等待结束。");
                break;
            }
        }
    }

}
```

## 抽象可变的实现

如果我们是一变查询，一边修改。

那么，就可以改为如下的实现：

```java
/**
 * 抽象业务队列-支持一遍查询，一遍修改的方式
 *
 * @author binbin.hou
 */
public abstract class AbstractBizModifyQueue<T> extends AbstractBizQueue<T> {

    private static final Logger logger = LoggerFactory.getLogger(AbstractBizModifyQueue.class);

    /**
     * 处理多线程
     *
     * 一遍查询一遍修改，就是每一次都从第一页开始查询，边查询遍修改。
     * @param baseRequest 请求
     */
    @Override
    protected void handleMultiThread(BaseRequest baseRequest) {
        final int pageSize = this.getPageSize();

        long count = this.queryCount(baseRequest);
        long totalNo = count % pageSize == 0 ? count / pageSize : (count / pageSize) + 1;
        logger.info("开始处理信息，总数据量{},总共{}页", count, totalNo);

        // 注意：采用分页一定要保证查询的条件不能在迭代中被修改，否则会导致有些更新不到。
        // 这里有一个小问题，因为数据一直在更新，所以不应该使用页数的方式
        int pageCount = 1;
        int handleCount = 0;
        while (true) {
            // 生产者等待
            awaitQueue();

            logger.info("当前处理第 {} 页数据", pageCount);
            // 定时添加到阻塞队列中
            List<T> list = this.queryByPage(1, pageSize, baseRequest);
            if(CollectionUtils.isEmpty(list)) {
                logger.info("当前队列信息为空，停止处理。");
                break;
            }

            queue.addAll(list);
            pageCount++;

            // 避免死循环
            handleCount += list.size();
            logger.info("添加到队列完成: {}, 已添加总数: {}", list.size(), handleCount);
            if(handleCount > count) {
                logger.info("处理总数 {} 已超过 {}，跳出循环。", handleCount, count);
                break;
            }
        }
    }

}
```


* any list
{:toc}