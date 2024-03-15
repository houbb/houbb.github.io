---
layout: post
title: 如何将单次落库合并为批量落库，提升处理性能？
date: 2024-03-15 21:01:55 +0800
categories: [Java]
tags: [java, stream, batch, sh]
published: true
---

# 场景

在一些流处理中，比如 kafka 消费等，我们需要不停的解析处理消息，然后进行入库。

有时候消息需要进行落库，每次都是单个落库，对数据库的压力比较大。

可不可以把单个操作变化为批量入库，来提升性能呢？

# 单个落库改为批量

## 目的

比如 100 条数据要落库，单个调用数据库 100 次，比一次批量入库耗时要多。

所以我们可以想办法把单个调用进行合并，然后调用入库。

## 单个同步落库

最基础的单个同步落库流程如下：

![单个同步落库](https://img-blog.csdnimg.cn/direct/15a6c4bfc4544089903e97362d625451.png#pic_center)

## 根据固定数量批量

我们可以固定一个内存大小，比如满足 100 个才进行入库，否则就放在内存中。

流程如下：

![固定数量批量](https://img-blog.csdnimg.cn/direct/bae1deab444a4b2988134b5ce56232b4.png#pic_center)

## 定时触发批量入库

固定数量适合触发比较多的情况。

如果命中的数据不多， 比如一些异常匹配处理等，但是对实时性要求又比较高。

可以通过定时任务来触发批量信息的入库，其他没变。

# 核心实现代码

## 单个数据的落库

每一次数据处理时，直接放入内存队列。

```java
// 感觉这里可以直接替换为 COW，保持高并发。
// 或者使用 concurrentHashMap，不过需要处理 key
protected synchronized void addToList(final T object) {
    this.innerList.add(object);
    // 事后处理
    this.addToListAfter(object);
}
```

## 固定数量的场景

如果是固定数量的批量入库，我们可以在每一次加入内存队列之后，判断是否满足入库条件。

```java
/**
 * 触发是否满足 fixed size?
 * @param object 对象
 */
protected void addToListAfter(final T object) {
    if(this.innerList.size() >= this.batchConfig.getBatchSize()) {
        log.debug("[Stream2Batch] addToListAfter fired save start...");
        // 真正触发保存
        fireBatchSave();
        log.debug("[Stream2Batch] addToListAfter fired save end...");
    }
}
```

## 真正的批量保存逻辑

批量保存时，为了提升性能，也可以转换为异步入库。

```java
protected void fireBatchSave() {
    try {
        log.info("[Stream2Batch] Fire batch save start...");
        // 资源加锁
        synchronized (innerList) {
            // 拷贝资源
            final List<T> copyList = new ArrayList<>(innerList);
            // 执行保存
            // 同步保存
            if(batchConfig.isBatchSaveAsyncFlag()) {
                actualSaveThread.submit(new Runnable() {
                    @Override
                    public void run() {
                        actualBatchSave(copyList);
                    }
                });
            } else {
                this.actualBatchSave(copyList);
            }
            // 资源清空
            innerList.clear();
        }
        log.info("[Stream2Batch] Fire batch save end...");
    } catch (Exception e) {
        log.error("[Stream2Batch] FireBatchSave meet ex", e);
        batchConfig.getFireBatchSaveErrorHandler().onError(e);
    }
}
```

## 定时调度触发

定时调度触发批量的方式，可以定时触发是否入库。

```java
/**
 * 初始化保存调度线程池
 */
private void initSaveFireThread() {
    saveFireThread.scheduleAtFixedRate(new Runnable() {
        @Override
        public void run() {
            // 触发保存
            fireBatchSave();
        }
    }, batchConfig.getBatchFixedTimeInterval(), batchConfig.getBatchFixedTimeInterval(), TimeUnit.SECONDS);
}
```

其他不变。

# 已有的实现

## 说明

当然，我们每次自己定义也比较麻烦。有一些已有的实现可以直接使用。

## maven 依赖

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>stream2batch-core</artifactId>
    <version>0.1.0</version>
</dependency>
```

## 固定时间间隔

适合场景：匹配的数量一般，对实时性有一定的要求。可以通过定时调度的方式驱动。

我们只需要定义好对应的 storeSingle/storeBatch 即可。

其他的很多属性也都可以自定义配置。

```java
IStream2Batch<UserInfo> stream2Batch = Stream2BatchBs.<UserInfo>newInstance()
        // 单个保存策略
        .storeSingle(new FakeStoreSingle<>())
        // 批量保存策略
        .storeBatch(new FakeStoreBatch<>())
        .fixedTime();

        for(int i = 0; i < 100; i++) {
                UserInfo userInfo = new UserInfo();
                userInfo.setUsername("u-"+i);
                stream2Batch.execute(userInfo);
        }

TimeUnit.SECONDS.sleep(10);

// 资源关闭
stream2Batch.shutdown();
```

## 固定大小

使用场景：匹配的数量会比较多，为了避免内存压力过大，采用固定数量的方式驱动。

```java
public static void main(String[] args) throws InterruptedException {
    IStream2Batch<UserInfo> stream2Batch = Stream2BatchBs.<UserInfo>newInstance()
            // 单个保存策略
            .storeSingle(new FakeStoreSingle<>())
            // 批量保存策略
            .storeBatch(new FakeStoreBatch<>())
            .batchSize(10)
            .fixedSize();

    for(int i = 0; i < 100; i++) {
        UserInfo userInfo = new UserInfo();
        userInfo.setUsername("u-"+i);
        stream2Batch.execute(userInfo);
    }

    TimeUnit.SECONDS.sleep(10);

    // 资源关闭
    stream2Batch.shutdown();
}
```

# 小结

流式处理转批量处理是一个比较场景的优化方式。

异步入库也可以大幅度提升吞吐量，在一个实时链路场景可以考虑使用。

# 拓展阅读

[JVM FULL GC 生产问题 I-多线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-37-inaction)

[JVM FULL GC 生产问题 II-如何定位内存泄露？ 线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction2)

[JVM FULL GC 生产问题 III-多线程执行队列的封装实现，进一步抽象](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction3)

[java 多线程实现通用方法 threadpool implement in java](https://houbb.github.io/2018/10/08/jvm-full-gc-39-inaction4)


# 参考资料



* any list
{:toc}
