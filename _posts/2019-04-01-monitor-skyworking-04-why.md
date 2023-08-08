---
layout: post
title: 监控-skywalking-04-字节码增强原理
date:  2019-4-1 19:24:57 +0800
categories: [APM]
tags: [monitor, apm, sf]
published: true
---


# 字节码增强

问题：在不修改原有Java代码的条件下，如何增加我们的新功能？（例如方法调用前打印一条日志）

## 字节码和Java类加载机制

![字节码增强](https://ask.qcloudimg.com/http-save/yehe-8907256/637431cdf46af92fe1e8d404b28d2f16.png)

## 运行时类的重载

### 代码AOP

我们在最初，总是会这样来统计方法访问的时间：

```java
public void a() 
{
    long startTimeMs = System.currentTimeMillis();
    log.info("processing...");
    long runningTimeMs = System.currentTimeMillis() - startTimeMs;
}
```

当有很多个方法都要修改，我们可能用到一些AOP切面，统一去处理。但这样是需要修改代码的，有侵入性。

### 静态重写

为了保证无侵入，如果我们在类被加载前，将这些语句写入.class字节码文件，就OK了。

利用ASM和Javassist等工具很容易做到。

问题是，这样的操作我们需要一个一个文件手动修改，如何让它自动化呢？

### 动态重载

JVMTI、Instrumentation、Bytebuddy

JVM不允许在运行时动态重载一个类（加载1个类2次），因此考虑使用Java类库Instrument，对已加载类进行修改。

JVMTI（JVM Tool Interface），是JVM暴露出来供用户扩展的接口集合，类似于JVM的后门。

实现上面就是运行到逻辑点后就插入回调接口的执行，例如前面的“加载”，就插入一些“before加载”，"after加载"等回调钩子。
 
Java Instrumentation（java.lang.instrument.Instrumentation）是利用JVMTI的接口提供了代理加载的动态库，

JDK1.5支持“JVM启动时加载Agent”（premain，-javaagent:yourAgent.jar，例如skywalking），

JDK1.6支持“JVM运行时加载Agent”（agentmain，com.sun.tools.attach，例如Arthas）。

Agent可以翻译为“代理”或者“探针”。
 
Bytebuddy基于ASM实现，封装了非常友好的API，避免接触JVM底层细节。skywalking正是利用Bytebuddy进行了字节码增强。
 
（1）skywalking和其他使用java agent技术的组件兼容性不是特别好，例如Arthas：when use skywalking agent ,arthas is can‘t work well。

在8.1.0版本已利用Cache机制修复，稳定性没有验证过：Java Agent：[Core] Support instrumented class cached in memory or file, to be compatible with other agents, such as Arthas。

（2）一些破解程序也是利用premain的形式，对校验部分的方法体进行修改，完成破解的：

（3）著名的BTrace正是利用agent+ASM进行动态调试的，但操作复杂，因此2018年阿里开源了Arthas，可以线上体验，动态调试非常好用。

（4）阿里著名的混沌测试工具chaosblade也是通过java agent的agentmain注入故障的。

## premain和 agentmain premain

### 【premain】

![premain](https://ask.qcloudimg.com/http-save/yehe-8907256/549402696a34b875f9215d174c34add6.png)

```java
public static void premain(String agentArgs, Instrumentation inst) 
{
    inst.addTransformer(new ClassFileTransformer() 
    {
      @Override
      public byte[] transform(……)
      {
        ……
      }
    }, true);
}
```

1、在类加载前，注册自己的classFileTransformer到Instrumention实例中，在classFileTransformer中通过targetClassName可以指定要修改的类限定名；

2、class文件读入内存后，触发ClassFileLoadHook回调，在该回调中会遍历所有的Instrumentation实例，并执行其中所有的ClassFileTransformer的transform方法，修改字节码

这样指定类的字节码就被我们动态修改了，且这些代码都是在agent里面，不会影响原有业务代码。

### agentmain premain

![agentmain premain](https://ask.qcloudimg.com/http-save/yehe-8907256/402948a3c364ed4a0120634ba02318d8.png)

```java
public static void agentmain(String agentArgs, Instrumentation inst) 
{
    inst.addTransformer(new ClassFileTransformer() 
    {
      @Override
      public byte[] transform(……)
       {
          ……
      }
    }, true);
    inst.retransformClasses(xxxxxxxx.class);
}
```

1、通过另一个进程JVM，利用Attach API，在native函数的Agent_OnAttach中请求目标加载agent，创建InstrumentationImpl对象、监听ClassFileLoadHook事件，注册机的transformer。

2、触发retransformClasses方法，然后会去读取ClassFile，触发ClassFileLoadHook事件，后面的流程与premain一致。

（1）动态替换时，如果该类的方法正处于运行点怎么办？

redefineClasses依赖VMThread单线程操作，该线程维护一个vm操作队列，执行vm操作必须在安全点（safepoint）执行。常见的安全点如方法调用前、方法返回、for循环调用前等等。

常见的vm操作例如GC，或者这里的redefineClasses。

通过SafepointSynchronize使得所有线程进入安全点，再执行vm操作，完成之后再唤醒所有线程。

因此该类正在运行的线程会被挂起，且是STW的。

当线程恢复后，旧类中正在执行的方法仍然会使用旧类的定义，后续代码均使用新类定义。

（2）retransformClasses对类的修改有限制，只能修改方法体、常量池和属性，不能添加、删除、重命名字段或者方法，不能更改方法签名，不能更改继承关系。

## 字节码增强

字节码增强（bytecode-enhance）指的是在Java字节码生成之后，对其进行修改，从而增强其功能。

字节码增强有很多方式，例如编译期增强，直接使用ASM等工具修改字节码，或者运行期增强，例如使用Java Agent等技术。

字节码增强可以用来做很多事情，例如开发期间热部署、或者测试时做一些Mock（如Mockito利用了ASM），或者做一些Trace、性能诊断、故障注入等等。

# Skywalking实现

Skywalking是一个可观测性分析平台（Observability Analysis Platform，OAP）和一个应用性能管理（Application Performance Management，APM）系统。

## skywalking整体架构

![struct](https://ask.qcloudimg.com/http-save/yehe-8907256/58484596f7ac2218462ee50998088929.png)

**Skywalking目前想要做成跟踪、监控、日志一体的解决方案（Tracing, Metrics and Logging all-in-one solution）**。

数据收集：Tracing依赖探针（Agent），Metrics依赖Prometheus或者新版的Open Telemetry，日志通过ES或者Fluentd。

数据传输：通过kafka、Grpc、HTTP传输到Skywalking Reveiver

数据解析和分析：OAP系统进行数据解析和分析。

数据存储：后端接口支持多种存储实现，例如ES。

UI模块：通过GraphQL进行查询，然后通过VUE搭建的前端进行展示。

告警：可以对接多种告警，最新版已经支持钉钉。

这里着重提一下新版本已经支持日志收集和查询，但功能有限（[可以在线体验](http://demo.skywalking.apache.org/)：用户名skywalking，密码skywalking），本质上是利用日志框架直接传输日志到Skywalking后端（OAP）。

## 追踪实现原理

### Agent和Plugin

skywalking agent为了能够让更多开发者加入开发，并且能够有足够的自由度（比如一些私有协议），使用了插件机制。 

agent启动时会加载所有plugins，进行字节码增强。

Plugins的核心问题有2个：

- 创建span，让它能够显示Trace调用链
 
- 考虑如何传输，例如Kafka需要考虑如何把它加入kafka header中；HTTP需要考虑加入Http Header中。

```java
org.apache.skywalking.apm.plugin.kafka.KafkaProducerInterceptor 
public class KafkaProducerInterceptor implements InstanceMethodsAroundInterceptor 
{
 
    @Override
    public void beforeMethod(EnhancedInstance objInst, Method method, Object[] allArguments, Class<?>[] argumentsTypes,
                             MethodInterceptResult result) throws Throwable
                              {
		……
		// 创建span信息
        AbstractSpan activeSpan = ContextManager.createExitSpan(OPERATE_NAME_PREFIX + topicName + PRODUCER_OPERATE_NAME_SUFFIX, contextCarrier, (String) objInst
                .getSkyWalkingDynamicField());
 
        Tags.MQ_BROKER.set(activeSpan, (String) objInst.getSkyWalkingDynamicField());
        Tags.MQ_TOPIC.set(activeSpan, topicName);
        SpanLayer.asMQ(activeSpan);
        activeSpan.setComponent(ComponentsDefine.KAFKA_PRODUCER);
 
        ……
		// 加入Kafka头部
        while (next.hasNext()) 
        {
            next = next.next();
            record.headers().add(next.getHeadKey(), next.getHeadValue().getBytes());
        }
		……
    }
 
    @Override
    public Object afterMethod(EnhancedInstance objInst, Method method, Object[] allArguments, Class<?>[] argumentsTypes,
                              Object ret) throws Throwable 
                              {
        ContextManager.stopSpan();
        return ret;
    }
 
    @Override
    public void handleMethodException(EnhancedInstance objInst, Method method, Object[] allArguments,
                                      Class<?>[] argumentsTypes, Throwable t) 
                                      {
    }
```

## TraceSegment设计

skywalking没有使用传统的span模型，处于性能考虑，将span保存为数组，存放到TraceSegment结构中批量发送；同时Segment可以很好地在UI上展示信息。

一个TraceSegment是Trace在一个进程内所有span的集合。如果是多个线程协同产生1个Trace（例如多次RPC调用不同的方法），它们只会共同创建1个TraceSegment。

由于支持多个入口，因此skywalking去掉了RootSpan的概念，skywalking提出了3种span类型：

EntrySpan：进入TraceSegment的请求，一般为HTTP/RPC服务，如SpringMVC。
 
LocalSpan：内部请求，一般为方法调用，或者跨线程调用。
 
ExitSpan：从TraceSegment调出，一般为httpClient。

## UI

当Kafka等进行批量消费时，消费的数据可能来自于不同的生产者，由于skywalking的TraceSegment支持多个EntrySpan，使得生产和消费的调用链可以保存在同一个Trace中。

跨度类型可以从UI上观察到：

skywalking的TraceSegment从UI上看，可以通过颜色区分：

![ui](https://ask.qcloudimg.com/http-save/yehe-8907256/bfa999b9d55aac2953f851e9e4347693.png)

## TraceId设计

```java
org.apache.skywalking.apm.agent.core.context.ids：GlobalIdGenerator.java
```

类似雪花算法的原理（在《Apache Skywalking实战》中，作者直接称其为雪花算法）

![UUID](https://ask.qcloudimg.com/http-save/yehe-8907256/d42cde3e8d84599b07911c4725514231.png)

- 32位去掉横线的UUID，表示应用实例的ID
 
- 当前线程ID
 
- 当前毫秒时间戳，例如这里的1621825236671时间为：2021-05-24 11:00:36
 
- 4位从0000到9999的，循环单调递增的随机数。实现上采用ThreadLocal保证线程安全。

时钟回拨（time-shift-back）问题：机器依赖NTP服务进行时间校准，当出现问题时，可能发生新生成的ID时间戳比旧ID时间戳更小，导致可能产生2个完全相同的时间戳。

skywalking的解决方法是：**产生一个随机数字替代时间戳。但它的实现上面使用了random.nextInt()的方法，注意实际上可能产生负数，这里比较迷。**

## 请求采样设计

```java
org.apache.skywalking.apm.agent.core.sampling：SamplingService
```

有两种方式可以调整请求采样：

### 1、skywalking agent调整采样率，减少数据上传

通过agent.sample_n_per_3_secs设置3秒内采样的数量，一般500~2000是合适的值。默认-1全采样。 

在设置agent采样率后，如果调用链上游进行了采样，那么下游会忽略采样率进行强制采样，保证Trace调用链完整。

### 2、collector调整采样率，丢弃数据

通过sampleRate调整采样率，丢弃部分数据。默认10000是全采样，如果设置为5000则会有50%数据被丢弃。 

丢弃数据只会影响Trace功能，不会影响Metric功能，Metric的所有数据都是根据全量数据计算的。

Trace功能：调用链。

Metric功能：性能检测指标，如成功率等等。

8.4.0 开始支持Agent参数配置动态调整，在修改agent采样率时不必重启应用。

## 数据收集和消费（轻量级队列内核）

```java
org.apache.skywalking.apm.commons.datacarrier.buffer
```

为了解耦数据上传和消费，平衡上传速度和消费速度，skywalking在内部构建了一个轻量级的消息队列。

![buffer](https://ask.qcloudimg.com/http-save/yehe-8907256/5162290c2df66b823c514c24d3b13288.png)

channel可以类比为Topic，Buffer可以类比为Partition。

### 1、生产数据，先判断存储在哪个Buffer中，再判断存储在Buffer的哪个位置。

 Partition：默认实现为从第一个到最后一个Buffer轮询。
 
 判断存储位置：Buffer维护了一个从0开始的循环索引，记录下个可用位置：
 
 BLOCKING：如果当前位置还有数据未消费，则阻塞新数据写入，且产生回调事件
 
 OVERRIDE：如果当前位置还有数据未消费，直接覆盖新数据
 
 IF_POSSIBLE：从当前index往后找n位，如果有空闲位置，则保留，如果没有，则丢弃。
 
### 2、消费消息，每个消费者可以有多个消费线程

如果Buffer队列数量>消费线程数量，则1个线程可以消费多个Buffer，和普通消息队列一样；

如果Buffer队列数量<消费线程数量，则部分Buffer可能对应多个线程，对应的方式是平分Buffer长度，例如长度500，平分0249给Thead4，250499给Thread3。 

在消息消费时，消费线程会初始化一个1500长度的consumeList，然后把Buffer从头到尾遍历，遇到非null值就存入consumeList中，并将index置为null可写，然后调用consume方法执行具体的消费逻辑。

## 性能剖析实现原理

当线上代码运行缓慢时，我们希望找出缓慢的原因。

一种常见的方式就是增加日志打印→重新编译→重新提测→上线观察→找到问题后修改代码→重新编译……一套流程走下来一周就过去了。 

因此skywalking利用自身tracing优势+java agent技术，实现了“性能剖析”功能。

### 1、线程堆栈分析

![1、线程堆栈分析](https://ask.qcloudimg.com/http-save/yehe-8907256/91148767c505bb2578a3d9d5647b7838.png)

当性能剖析开始后，会对执行线程周期性地创建线程栈快照，并将所有快照进行汇总分析。

当两个连续的快照含有同样的方法栈，说明大概率这段时间都在执行这个方法，估算出方法执行时间，就能够帮助判断性能问题出在哪里。

另外，LineNumberTable也是在方法信息里的，因此可以直接看到代码行数，实现代码级别的性能问题定位：

![行级别确认](https://ask.qcloudimg.com/http-save/yehe-8907256/7616b4218132a04c54ddbb57df1bc369.png)

### 2、性能损耗控制 

由于操作的是生产环境，不能对现有代码产生严重影响，所以需要控制性能损耗。

相比于侵入性地编写log打印，skywalking的性能剖析不需要埋点，也就不会增加额外的日志打印开销，也不会对日志系统/监控系统产生压力（例如有些应用会要求线上开启debug进行调试）。
 
采样间隔、采样数量，采样时间段，采样接口等都可以配置，且大于指定执行时间的调用链才会被监控。
 
监控时间可以设置定时，在业务低谷期进行处理 几乎是无损耗。




# 参考资料

[分布式链路追踪Skywalking Skywalking 存储客户端设计](https://cloud.tencent.com/developer/article/1681266)

[可以用于云原生中Skywalking框架原理你真的懂吗](https://cloud.tencent.com/developer/article/1989637)

[分布式链路追踪：集群管理设计](http://learn.lianglianglee.com/%E6%96%87%E7%AB%A0/%E5%88%86%E5%B8%83%E5%BC%8F%E9%93%BE%E8%B7%AF%E8%BF%BD%E8%B8%AA%EF%BC%9A%E9%9B%86%E7%BE%A4%E7%AE%A1%E7%90%86%E8%AE%BE%E8%AE%A1.md)

[谈谈Skywalking架构和设计](https://juejin.cn/post/7070293280147111966)

https://my.oschina.net/klblog/blog/4945743

https://blog.51cto.com/jackl/3313088

* any list
{:toc}