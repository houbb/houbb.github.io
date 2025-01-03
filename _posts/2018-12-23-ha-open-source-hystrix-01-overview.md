---
layout: post
title:  高可用开源库之 Hystrix-01-概览
date: 2018-12-23 13:55:13 +0800
categories: [Distributed]
tags: [distributed, sh]
published: true
---

# 高可用系列

[高可用开源库之 Hystrix-01-概览](https://houbb.github.io/2018/12/23/ha-open-source-hystrix-01-overview)

[高可用开源库之 Hystrix-02-聊一聊](https://houbb.github.io/2018/12/23/ha-open-source-hystrix-02-chat)

[高可用开源库之 Resilience4j-01-Netflix Hystrix 的替代者 overview](https://houbb.github.io/2018/12/23/ha-open-source-resilience4j-01-overview)

[高可用开源库之 Resilience4j-02-chat 聊一聊](https://houbb.github.io/2018/12/23/ha-open-source-resilience4j-02-chat)

[高可用开源库之 阿里流控组件 sentinel-01-overview 面向云原生微服务的高可用流控防护组件](https://houbb.github.io/2018/12/23/ha-open-source-sentinel-01-overview)

[高可用开源库之 阿里流控组件 sentinel-02-chat](https://houbb.github.io/2018/12/23/ha-open-source-sentinel-02-chat)

# Hystrix

[Hystrix](https://github.com/Netflix/Hystrix) 是一个延迟和容错库，旨在隔离对远程系统、服务和第三方库的访问点，防止级联故障，
并在不可避免出现故障的复杂分布式系统中恢复能力。


## 特性

- 延迟和容错

停止级联故障。回退和优雅的退化。快速失败和快速恢复。

带断路器的线程和信号量隔离。

- 实时操作

实时监控和配置更改。观察服务和财产变化立即生效，因为他们分散在一个舰队。

警惕，做出决定，影响改变，在几秒钟内看到结果。

- 并发性

并行执行。并发性意识到请求缓存。通过请求崩溃自动批处理。

# 快速开始

## jar 引入

```xml
<dependency>
    <groupId>com.netflix.hystrix</groupId>
    <artifactId>hystrix-core</artifactId>
    <version>1.5.12</version>
</dependency>
```

## HystrixCommand 

`HystrixCommand` 的最简单实现：

```java
public class CommandHelloWorld extends HystrixCommand<String> {

    private final String name;

    public CommandHelloWorld(String name) {
        super(HystrixCommandGroupKey.Factory.asKey("ExampleGroup"));
        this.name = name;
    }

    @Override
    protected String run() {
        // a real example would do work like a network call here
        return "Hello " + name + "!";
    }
}
```

ps: 还有一个等效的开始类，HystrixObservableCommand 此处省去不谈。

## 同步执行

```java
String s = new CommandHelloWorld("World").execute();
```

## 异步执行

- Future

```java
Future<String> fs = new CommandHelloWorld("World").queue();
String s = fs.get();
```

## 监听

### 实现方式

```java
Observable<String> ho = new CommandHelloWorld("World").observe();
// or Observable<String> co = new CommandHelloWorld("World").toObservable();
```

监听方式

```java
ho.subscribe(new Action1<String>() {

    @Override
    public void call(String s) {
         // value emitted here
    }

});
```

### 实际案例

- testObservable()

```java
@Test
public void testObservable() throws Exception {
    Observable<String> fWorld = new CommandHelloWorld("World").observe();
    Observable<String> fBob = new CommandHelloWorld("Bob").observe();
    // blocking
    assertEquals("Hello World!", fWorld.toBlocking().single());
    assertEquals("Hello Bob!", fBob.toBlocking().single());
    // non-blocking
    // - this is a verbose anonymous inner-class approach and doesn't do assertions
    fWorld.subscribe(new Observer<String>() {
        @Override
        public void onCompleted() {
            // nothing needed here
        }
        @Override
        public void onError(Throwable e) {
            e.printStackTrace();
        }
        @Override
        public void onNext(String v) {
            System.out.println("onNext: " + v);
        }
    });
    // non-blocking
    // - also verbose anonymous inner-class
    // - ignore errors and onCompleted signal
    fBob.subscribe(new Action1<String>() {
        @Override
        public void call(String v) {
            System.out.println("call: " + v);
        }
    });
}
```

- 输出日志

```
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.

onNext: Hello World!
call: Hello Bob!
```


# 替代方案

[resilience4j](https://houbb.github.io/2018/11/28/resilience4j)

* any list
{:toc}
