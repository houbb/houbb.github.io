---
layout: post
title: RxJava 是一个在 Java 虚拟机（JVM）上实现的响应式扩展库
date: 2024-03-05 21:01:55 +0800
categories: [Java]
tags: [java, jvm, sh]
published: true
---

# RxJava

RxJava，即Reactive Extensions for the JVM（Java Virtual Machine的反应式扩展），是一个为Java虚拟机（JVM）设计的库，用于通过可观察序列（observable sequences）来组合异步和基于事件的程序。

RxJava提供了一种响应式编程（Reactive Programming）的方式，这是一种在编程范式中异步处理数据流的方法。这种方法对于处理复杂的异步流程，尤其是那些涉及到多个并发操作的情况，非常有用。

在RxJava中，所有的操作都是异步的，并且可以很容易地组合在一起，以形成复杂的数据处理流程。它使用了"可观察序列"（Observable sequences）的概念，这是一种可以发出事件的对象。你可以订阅这些事件，并在事件发生时执行一些操作。

RxJava的主要特点包括：

1. **异步编程**：RxJava提供了一种异步编程的模型，可以更容易地处理那些需要在不同时间发生的操作。
2. **组合性**：RxJava的操作可以很容易地组合在一起，形成复杂的流程。你可以将多个操作链接在一起，形成一个完整的流程。
3. **错误处理**：RxJava提供了一种统一的错误处理机制。如果在处理流程中发生错误，你可以很容易地捕获并处理这些错误。
4. **背压（Backpressure）**：背压是RxJava中一个重要的概念，它允许你在数据产生过快时放慢数据的处理速度，以防止系统过载。

总的来说，RxJava是一种强大的工具，可以帮助你更好地处理异步和基于事件的数据流，使你的代码更加简洁、清晰和易于维护。

# 版本特性

## 版本 3.x ([Javadoc](http://reactivex.io/RxJava/3.x/javadoc/))

* 单一依赖：[Reactive-Streams](https://github.com/reactive-streams/reactive-streams-jvm)。
* 需要 Java 8+ 或 Android API 21+。
* 支持 Java 8 的 lambda 友好型 API。
* 对 [Android](https://github.com/ReactiveX/RxAndroid) desugar 友好。
* 修正了 RxJava 2 中的 API 错误和许多限制。
* 旨在成为 RxJava 2 的替代品，只有相对较少的二进制不兼容更改。
* 不对并发源（线程、池、事件循环、纤维、演员等）发表意见。
* 异步或同步执行。
* 用于参数化并发的虚拟时间和调度器。
* 通过测试调度器、测试消费者和插件钩子提供测试和诊断支持。
* 通过第三方库与更新的 JDK 版本进行互操作，例如：
  - [Java 9 Flow API](https://github.com/akarnokd/RxJavaJdk9Interop#rxjavajdk9interop)
  - [Java 21 虚拟线程](https://github.com/akarnokd/RxJavaFiberInterop#rxjavafiberinterop)

在 <a href="https://github.com/ReactiveX/RxJava/wiki">Wiki Home</a> 上了解更多关于 RxJava 的信息。

:information_source: 请阅读 [3.0 中的不同之处](https://github.com/ReactiveX/RxJava/wiki/What's-different-in-3.0) 以获取从 2.x 升级时的更改和迁移信息。

## 版本 2.x

自 **2021 年 2 月 28 日** 起，2.x 版本已终止维护。

将不再进行进一步的开发、支持、维护和 PR，也不会进行更新。最后一个版本 **2.2.21** 的 [Javadoc]([Javadoc](http://reactivex.io/RxJava/2.x/javadoc/)) 将仍然可以访问。

## 版本 1.x

自 **2018 年 3 月 31 日** 起，1.x 版本已终止维护。

将不再进行进一步的开发、支持、维护和 PR，也不会进行更新。最后一个版本 **1.3.8** 的 [Javadoc]([Javadoc](http://reactivex.io/RxJava/1.x/javadoc/)) 将仍然可以访问。


## 开始使用

### 设置依赖

第一步是将RxJava 3添加到你的项目中，例如，作为Gradle编译依赖：

```groovy
implementation "io.reactivex.rxjava3:rxjava:3.x.y"
```

（请将`x`和`y`替换为最新的版本号：[![Maven Central](https://maven-badges.herokuapp.com/maven-central/io.reactivex.rxjava3/rxjava/badge.svg)](https://maven-badges.herokuapp.com/maven-central/io.reactivex.rxjava3/rxjava)
）

### Hello World

第二步是编写**Hello World**程序：

```java
package rxjava.examples;

import io.reactivex.rxjava3.core.*;

public class HelloWorld {
    public static void main(String[] args) {
        Flowable.just("Hello world").subscribe(System.out::println);
    }
}
```

请注意，RxJava 3的组件现在位于`io.reactivex.rxjava3`下，基础类和接口位于`io.reactivex.rxjava3.core`下。

### 基础类

RxJava 3提供了几个基础类，你可以在这些类上发现操作符：

  - [`io.reactivex.rxjava3.core.Flowable`](http://reactivex.io/RxJava/3.x/javadoc/io/reactivex/rxjava3/core/Flowable.html)：0..N个流的流动，支持Reactive-Streams和背压
  - [`io.reactivex.rxjava3.core.Observable`](http://reactivex.io/RxJava/3.x/javadoc/io/reactivex/rxjava3/core/Observable.html)：0..N个流的流动，不支持背压
  - [`io.reactivex.rxjava3.core.Single`](http://reactivex.io/RxJava/3.x/javadoc/io/reactivex/rxjava3/core/Single.html)：一个流，恰好包含1个元素或错误
  - [`io.reactivex.rxjava3.core.Completable`](http://reactivex.io/RxJava/3.x/javadoc/io/reactivex/rxjava3/core/Completable.html)：一个流，不包含元素，仅包含完成或错误信号
  - [`io.reactivex.rxjava3.core.Maybe`](http://reactivex.io/RxJava/3.x/javadoc/io/reactivex/rxjava3/core/Maybe.html)：一个流，不包含元素，恰好包含1个元素或错误

请确保你使用了与你的项目兼容的最新RxJava版本，并检查文档以获取最新的API和操作符列表。

### 一些术语

#### 上游（Upstream）和下游（Downstream）

RxJava中的数据流由源（source）开始，接着是零个或多个中间步骤，最后是一个数据消费者或组合步骤（其中该步骤负责以某种方式消费数据流）：

```java
source.operator1().operator2().operator3().subscribe(consumer);

source.flatMap(value -> source.operator1().operator2().operator3());
```

在上面的例子中，如果我们想象自己在`operator2`的位置，那么向左看向源头的部分被称为**上游**。向右看向订阅者/消费者的部分被称为**下游**。当每个元素都单独写在一行上时，这一点通常更加明显：

```java
source
  .operator1()
  .operator2()
  .operator3()
  .subscribe(consumer)
```

#### 运动中的对象

在RxJava的文档中，**emission**、**emits**、**item**、**event**、**signal**、**data**和**message**被认为是同义词，并代表沿着数据流传输的对象。

#### 背压（Backpressure）

当数据流通过异步步骤时，每个步骤可能以不同的速度执行不同的操作。为了避免使这些步骤承受过大的压力，这通常会表现为由于临时缓冲或需要跳过/丢弃数据而增加的内存使用，因此应用了所谓的背压，这是一种流控制形式，其中步骤可以表达它们准备处理多少项目。这允许在步骤通常无法知道上游将向其发送多少项目的情况下，限制数据流的内存使用。

在RxJava中，专门的`Flowable`类被指定为支持背压，而`Observable`则专门用于非背压操作（短序列、GUI交互等）。其他类型，如`Single`、`Maybe`和`Completable`，不支持背压也不应该支持；总是有余地临时存储一个项目。

#### 组装时间（Assembly Time）

组装时间是指通过应用各种中间操作符来准备数据流的过程：

```java
Flowable<Integer> flow = Flowable.range(1, 5)
.map(v -> v * v)
.filter(v -> v % 3 == 0)
;
```

在这个阶段，数据还没有开始流动，也没有发生任何副作用。

#### 订阅时间（Subscription Time）

当对流调用`subscribe()`方法时，将建立内部处理步骤的链，这是一个临时状态：

```java
flow.subscribe(System.out::println)
```

这是触发**订阅副作用**的时候（参见`doOnSubscribe`）。在这个状态下，一些源会阻塞或立即开始发射项目。

#### 运行时间（Runtime）

当流积极地发射项目、错误或完成信号时，就处于运行时间状态：

```java
Observable.create(emitter -> {
     while (!emitter.isDisposed()) {
         long time = System.currentTimeMillis();
         emitter.onNext(time);
         if (time % 2 != 0) {
             emitter.onError(new IllegalStateException("Odd millisecond!"));
             break;
         }
     }
})
.subscribe(System.out::println, Throwable::printStackTrace);
```

实际上，上面的示例代码的主体部分就是在运行时间中执行的。在这个阶段，流开始活跃地处理数据，并且根据之前在组装时间中定义的规则，将项目、错误或完成信号传递给消费者。

### 简单的后台计算

RxJava的常见用例之一是在后台线程上运行一些计算或网络请求，并在UI线程上显示结果（或错误）：

```java
import io.reactivex.rxjava3.schedulers.Schedulers;

Flowable.fromCallable(() -> {
    Thread.sleep(1000); // 模拟昂贵的计算
    return "Done";
})
  .subscribeOn(Schedulers.io()) // 指定在IO线程上进行订阅操作
  .observeOn(Schedulers.single()) // 指定在单线程上进行观察操作
  .subscribe(System.out::println, Throwable::printStackTrace); // 订阅并处理结果或错误

Thread.sleep(2000); // <--- 等待流程结束
```

这种链式方法调用的风格被称为**流畅API**，类似于**构建器模式**。然而，RxJava的反应类型是不可变的；每个方法调用都会返回一个新的`Flowable`，并添加新的行为。为了说明这一点，可以将示例重写为以下形式：

```java
Flowable<String> source = Flowable.fromCallable(() -> {
    Thread.sleep(1000); // 模拟昂贵的计算
    return "Done";
});

Flowable<String> runBackground = source.subscribeOn(Schedulers.io()); // 在后台线程上运行

Flowable<String> showForeground = runBackground.observeOn(Schedulers.single()); // 在前台线程上观察

showForeground.subscribe(System.out::println, Throwable::printStackTrace); // 订阅并处理结果或错误

Thread.sleep(2000);
```

通常，您可以通过`subscribeOn`将计算或阻塞的IO操作移到其他线程。一旦数据准备就绪，您可以通过`observeOn`确保它们在前台或GUI线程上进行处理。

TODO....






# 参考资料

https://cdn.openai.com/papers/dall-e-3.pdf

* any list
{:toc}
