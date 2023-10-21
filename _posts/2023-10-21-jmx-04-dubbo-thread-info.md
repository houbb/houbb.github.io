---
layout: post
title: jmx-04-dubbo thread pool info 如何获取 dubbo 线程池信息
date:  2021-10-21 13:41:43 +0800
categories: [Java]
tags: [java, jmx, monitor]
published: true
---


# 已有的开源实现

完整的实现应该没有，至少我还没用过，也没有那种去搜索引擎一搜就大把结果的现状，于是我在Dubbo的Github上找到了一个相关的项目dubbo-spring-boot-actuator。

https://github.com/apache/dubbo-spring-boot-project/tree/master/dubbo-spring-boot-actuator

dubbo-spring-boot-actuator看名称就知道，提供了Dubbo相关的各种信息端点和健康检查。从这里面也许能发现点有用的代码。

果不其然，在介绍页面中看到了想要的内容，线程池的指标数据，只不过是拼接成了字符串显示而已。

```json
"threadpool": {
      "source": "management.health.dubbo.status.extras",
      "status": {
        "level": "OK",
        "message": "Pool status:OK, max:200, core:200, largest:0, active:0, task:0, service port: 12345",
        "description": null
      }
}
```

然后就去翻dubbo-spring-boot-actuator的代码了，没找到线程池这块的代码。

后面在dubbo.jar中找到了ThreadPoolStatusChecker这个类，核心逻辑在这里面。

现在已经解决了第一个问题，就是获取到Dubbo的线程池对象。

# 版本差异性

> [dubbo2.7.5+，如何做dubbo线程池监控](https://github.com/apache/dubbo/issues/6625)

## 环境

Dubbo version: 2.7.5+

Operating System version: centos

Java version: 1.8

## 问题

dubbo2.7.5以前，可以通过DataStore来获取

```java
DataStore dataStore = ExtensionLoader.getExtensionLoader(DataStore.class).getDefaultExtension();
Map<String, Object> providerExecutors = dataStore.get(EXECUTOR_SERVICE_COMPONENT_KEY);
```

具体DataStore.put(xxx,xxxExecutorService)的逻辑，是在WrappedChannelHandler内部。

WrappedChannelHandler（dubbo2.7.5以下版本）如图：

![wrap](https://user-images.githubusercontent.com/3169716/90587151-421dfa80-e20b-11ea-9161-be8867fad48a.png)

但是dubbo2.7.5以上版本，去掉了DataStore.put(xxx,xxxExecutorService)的逻辑，无法再通过datastore获取。

内部线程池通过 ExecutorRepository来统一管理，其中包含了port:线程池的map，如下：

```java
private ConcurrentMap<String, ConcurrentMap<Integer, ExecutorService>> data = new ConcurrentHashMap<>();
```

DefaultExecutorRepository 内部线程池 如图：

![内部线程池](https://user-images.githubusercontent.com/3169716/90587454-fcadfd00-e20b-11ea-91d4-d98ec21193ef.png)

我理解是使用threadless线程模式，才调整这部分逻辑。但provider端默认是fixed类型线程池，实际是可以做线程池监控的。

请问，有什么官方推荐方式获取provider端（主要）/consumer端的线程池信息么？

## 解决方式

可以通过如下方式获取

```java
ExtensionLoader.getExtensionLoader(ExecutorRepository.class).getDefaultExtension().getExecutor(url)
```

现在用的是url的端口号做key，你可以看下源码。所以要注意url的端口号是否改变了，否则获取不到线程池。

消费者用的是业务线程，dubbo无法监控

### q

嗯，这是一个方式。但线程池监控一般单独定时轮询，不会在请求流程（如filter）中采集，就获取不到invoker对象中的url信息。

（1）如何获取所有url信息？
（2）还有其他更好的方式吗？

A: 可以使用filter维护一个全局的HashMap，目前我们采用的是这种方式

## 一些工具方法

```java
ExecutorRepository executorRepository = ExtensionLoader.getExtensionLoader(ExecutorRepository.class).getDefaultExtension();

if (executorRepository instanceof DefaultExecutorRepository) {
    DefaultExecutorRepository defaultExecutorRepository = (DefaultExecutorRepository) executorRepository;

    //String componentKey = EXECUTOR_SERVICE_COMPONENT_KEY;
    //        if (CONSUMER_SIDE.equalsIgnoreCase(url.getParameter(SIDE_KEY))) {
    //            componentKey = CONSUMER_SIDE;
    //        }
    // data的key是固定的，要么是 EXECUTOR_SERVICE_COMPONENT_KEY 要么是 CONSUMER_SIDE
// 反射读取data字段
    ConcurrentMap<String, ConcurrentMap<Integer, ExecutorService>> data = (ConcurrentMap<String, ConcurrentMap<Integer, ExecutorService>>) ReflectUtil.read(defaultExecutorRepository, "data");

    //provider
    ConcurrentMap<Integer, ExecutorService> executors = data.get(CommonConstants.EXECUTOR_SERVICE_COMPONENT_KEY);
    if (executors != null) {
        List<MetricDTO> metrics = new ArrayList<>();

        executors.forEach((port, executor) -> {
            if (executor instanceof ThreadPoolExecutor) {
                ThreadPoolExecutor tpe = (ThreadPoolExecutor) executor;
                ThreadPoolStatus status = ThreadPoolUtil.getStatus(tpe);


                //TODO 监控数据上报
                Map<String, String> tags = new HashMap<>(1, 1);
                tags.put(TagConst.PORT, "" + port);

                metrics.add(buildMetric("dubbo.thread.pool.max", status.getMax(), tags));
                metrics.add(buildMetric("dubbo.thread.pool.core", status.getCore(), tags));
                metrics.add(buildMetric("dubbo.thread.pool.largest", status.getLargest(), tags));
                metrics.add(buildMetric("dubbo.thread.pool.active", status.getActive(), tags));
                metrics.add(buildMetric("dubbo.thread.pool.task", status.getTask(), tags));
                metrics.add(buildMetric("dubbo.thread.pool.active.percent", status.getActivePercent(), tags));

            }
        });
    }

} else {
    log.warn("unchecked thread pool implement. Plz contact developer.");
}
```

```java
public class ThreadPoolUtil {


    /**
     * get thread pool status
     *
     * @param tpe
     * @return
     */
    public static ThreadPoolStatus getStatus(ThreadPoolExecutor tpe) {
        ThreadPoolStatus status = new ThreadPoolStatus();
        if (tpe == null) {
            return status;
        }

        status.setMax(tpe.getMaximumPoolSize());
        status.setCore(tpe.getCorePoolSize());
        status.setLargest(tpe.getLargestPoolSize());
        status.setActive(tpe.getActiveCount());
        status.setTask(tpe.getTaskCount());
        status.setActivePercent(NumberUtil.divide(status.getActive(), status.getMax(), 3, RoundingMode.UP).doubleValue());
        return status;
    }
}
```

# 如何可视化

## 可视化工具

选择 grafna 或者 prometheus 这种采集工具。

线程池对象能拿到了，各种数据也就能获取了。

接下来的问题就是如何暴露出去给prometheus采集。

两种方式，一种是自定义一个新的端点暴露，一种是直接在已有的 prometheus 端点中增加指标数据的输出，也就是依葫芦画瓢。

看源码中已经有很多Metrics的实现了，我们也实现一个Dubbo 线程池的Metrics即可。

实现的主要逻辑就是实现一个MeterBinder接口，然后将你需要的指标进行输出即可。

于是打算在bindTo方法中获取Dubbo的线程池对象，然后输出指标。

经过测试，在MeterBinder实例化的时候Dubbo还没初始化好，拿不到线程池对象，绑定后无法成功输出指标。

后面还是打算采用定时采样的方式来输出，自定义一个后台线程，定时去输出数据。

可以用Timer，我这图简单就直接while循环了。

```java
/**
 * Dubbo线程池指标
 *
 * @author yinjihuan
 */
@Configuration
public class DubboThreadMetrics {
    @Autowired
    private MeterRegistry meterRegistry;
    private final Iterable<Tag> TAG = Collections.singletonList(Tag.of("thread.pool.name", "dubboThreadPool"));
    @PostConstruct
    public void init() {
        new Thread(() -> {
            while (true) {
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                DataStore dataStore = ExtensionLoader.getExtensionLoader(DataStore.class).getDefaultExtension();
                Map<String, Object> executors = dataStore.get(Constants.EXECUTOR_SERVICE_COMPONENT_KEY);
                for (Map.Entry<String, Object> entry : executors.entrySet()) {
                    ExecutorService executor = (ExecutorService) entry.getValue();
                    if (executor instanceof ThreadPoolExecutor) {
                        ThreadPoolExecutor tp = (ThreadPoolExecutor) executor;
                        Gauge.builder("dubbo.thread.pool.core.size", tp, ThreadPoolExecutor::getCorePoolSize)
                                .description("核心线程数")
                                .baseUnit("threads")
                                .register(meterRegistry);
                        Gauge.builder("dubbo.thread.pool.largest.size", tp, ThreadPoolExecutor::getLargestPoolSize)
                                .description("历史最高线程数")
                                .baseUnit("threads")
                                .register(meterRegistry);
                        Gauge.builder("dubbo.thread.pool.max.size", tp, ThreadPoolExecutor::getMaximumPoolSize)
                                .description("最大线程数")
                                .baseUnit("threads")
                                .register(meterRegistry);
                        Gauge.builder("dubbo.thread.pool.active.size", tp, ThreadPoolExecutor::getActiveCount)
                                .description("活跃线程数")
                                .baseUnit("threads")
                                .register(meterRegistry);
                        Gauge.builder("dubbo.thread.pool.thread.count", tp, ThreadPoolExecutor::getPoolSize)
                                .description("当前线程数")
                                .baseUnit("threads")
                                .register(meterRegistry);
                        Gauge.builder("dubbo.thread.pool.queue.size", tp, e -> e.getQueue().size())
                                .description("队列大小")
                                .baseUnit("threads")
                                .register(meterRegistry);
                        Gauge.builder("dubbo.thread.pool.taskCount", tp, ThreadPoolExecutor::getTaskCount)
                                .description("任务总量")
                                .baseUnit("threads")
                                .register(meterRegistry);
                        Gauge.builder("dubbo.thread.pool.completedTaskCount", tp, ThreadPoolExecutor::getCompletedTaskCount)
                                .description("已完成的任务量")
                                .baseUnit("threads")
                                .register(meterRegistry);
                    }
                }
            }
        }).start();
    }
}
```


# 小结

这里也可以发现一个系统的设计问题。

如果用户非常关心线程池的信息，那可以把这部分做一个封装，而不是让用户自己处理。

还可能存在版本不兼容的情况。

# 参考资料

[Dubbo 线程池监控](https://juejin.cn/post/7116395745548173348)

[Dubbo 线程池监控](https://juejin.cn/post/6890555049022324743)

https://zhuanlan.zhihu.com/p/539925601

https://github.com/apache/dubbo/issues/6625

https://www.cnblogs.com/yinjihuan/p/14386361.html

https://github.com/apache/dubbo-spring-boot-project/tree/master/dubbo-spring-boot-actuator

* any list
{:toc}