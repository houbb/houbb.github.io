---
layout: post
title:  Disruptor-02-Get start
date:  2018-07-02 14:30:21 +0800
categories: [Concurrent]
tags: [concurrent]
published: true
---

# Get start

## maven 导入

```xml
<dependency>
    <groupId>com.lmax</groupId>
    <artifactId>disruptor</artifactId>
    <version>3.4.2</version>
</dependency>
```

## 基础的事件生产者和消费者

为了开始分析破坏者，我们将考虑一个非常简单且经过设计的示例，它将把一个长值从生产者传递给消费者，消费者只需打印出这个值。
首先，我们将定义携带数据的事件。

- LongEvent.java

```java
public class LongEvent {

    private long value;

    public void set(long value)
    {
        this.value = value;
    }

    @Override
    public String toString() {
        return "LongEvent{" +
                "value=" + value +
                '}';
    }
}
```

- LongEventFactory.java

为了让破坏者为我们预先分配这些事件，我们需要一个EventFactory来执行构建

```java
import com.lmax.disruptor.EventFactory;

public class LongEventFactory implements EventFactory<LongEvent> {

    @Override
    public LongEvent newInstance() {
        return new LongEvent();
    }

}
```

- LongEventHandler.java

一旦定义了事件，我们需要创建一个使用者来处理这些事件。在本例中，我们要做的就是将值输出到控制台。

```java
import com.lmax.disruptor.EventHandler;

public class LongEventHandler implements EventHandler<LongEvent> {

    @Override
    public void onEvent(LongEvent longEvent, long l, boolean b) throws Exception {
        System.out.println("Event: " + longEvent);
    }

}
```

- LongEventProducer.java

我们将需要这些事件的源，为了一个示例，我将假设数据来自某种I/O设备，例如以ByteBuffer的形式的网络或文件。

```java
import com.lmax.disruptor.RingBuffer;

import java.nio.ByteBuffer;

public class LongEventProducer {

    private final RingBuffer<LongEvent> ringBuffer;

    public LongEventProducer(RingBuffer<LongEvent> ringBuffer) {
        this.ringBuffer = ringBuffer;
    }

    public void onData(ByteBuffer bb) {
        // Grab the next sequence
        long sequence = ringBuffer.next();
        try {
            // Get the entry in the Disruptor
            LongEvent event = ringBuffer.get(sequence);
            // for the sequence
            // Fill with data
            event.set(bb.getLong(0));
        } finally {
            ringBuffer.publish(sequence);
        }
    }
}
```

与使用简单的队列相比，事件发布变得更加复杂。
这是由于对事件预分配的渴望。它要求(在最低级别上)消息发布采用两阶段的方法，即声明循环缓冲区中的槽，然后发布可用数据。
还需要在try/finally块中包装发布。如果我们在环缓冲区中声明一个插槽(调用RingBuffer.next()))，那么我们必须发布这个序列。
如果不这样做，会导致破坏者的状态被破坏。
具体地说，在多生产者的情况下，这将导致消费者在没有重新启动的情况下无法恢复。

## Using version 3 Translators

- LongEventProducerWithTranslator.java

在破坏者3.0版本中，一个更丰富的lambda风格的API被添加进来，通过将这种复杂性封装在环形缓冲区中来帮助开发人员，
因此post-3.0发布消息的首选方法是通过API的事件发布者/事件转换器部分。如:

```java
package com.github.houbb.jdk.disruptor;

import com.lmax.disruptor.EventTranslatorOneArg;
import com.lmax.disruptor.RingBuffer;

import java.nio.ByteBuffer;

public class LongEventProducerWithTranslator {

    private final RingBuffer<LongEvent> ringBuffer;

    public LongEventProducerWithTranslator(RingBuffer<LongEvent> ringBuffer)
    {
        this.ringBuffer = ringBuffer;
    }

    private static final EventTranslatorOneArg<LongEvent, ByteBuffer> TRANSLATOR =
            new EventTranslatorOneArg<LongEvent, ByteBuffer>()
            {
                @Override
                public void translateTo(LongEvent event, long sequence, ByteBuffer bb)
                {
                    event.set(bb.getLong(0));
                }
            };

    public void onData(ByteBuffer bb)
    {
        ringBuffer.publishEvent(TRANSLATOR, bb);
    }
}
```

这种方法的另一个优点是，转换器代码可以被拉到一个单独的类中，并且可以很容易地独立地进行单元测试。
破坏者提供了许多不同的接口(EventTranslator、EventTranslatorOneArg、EventTranslatorTwoArg等)，
可以实现这些接口来提供翻译人员。
这样做的原因是允许将翻译人员表示为静态类或非捕获lambda(当Java 8滚动的时候)，因为对翻译方法的参数通过调用环缓冲区的调用传递给翻译人员。

最后一步是将整个过程连接起来。手动连接所有组件是可能的，但是这可能有点复杂，因此提供了DSL来简化构建。
有些更复杂的选项不能通过DSL获得，但是它适用于大多数情况。


- LongEventMain.java

```java
package com.github.houbb.jdk.disruptor;

import com.lmax.disruptor.dsl.Disruptor;
import com.lmax.disruptor.RingBuffer;

import java.nio.ByteBuffer;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

public class LongEventMain {

    public static void main(String[] args) throws Exception {
        // Executor that will be used to construct new threads for consumers
        Executor executor = Executors.newCachedThreadPool();

        // The factory for the event
        LongEventFactory factory = new LongEventFactory();

        // Specify the size of the ring buffer, must be power of 2.
        int bufferSize = 1024;

        // Construct the Disruptor
        Disruptor<LongEvent> disruptor = new Disruptor<>(factory, bufferSize, executor);

        // Connect the handler
        disruptor.handleEventsWith(new LongEventHandler());

        // Start the Disruptor, starts all threads running
        disruptor.start();

        // Get the ring buffer from the Disruptor to be used for publishing.
        RingBuffer<LongEvent> ringBuffer = disruptor.getRingBuffer();

        LongEventProducer producer = new LongEventProducer(ringBuffer);

        ByteBuffer bb = ByteBuffer.allocate(8);
        for (long l = 0; true; l++) {
            bb.putLong(0, l);
            producer.onData(bb);
            Thread.sleep(1000);
        }
    }
}
```

## 使用 JDK8

“破坏者”API的一个设计影响是，Java 8将依赖功能接口的概念作为Java Lambdas的类型声明。
破坏者API中的大多数接口定义都符合函数接口的要求，因此可以使用Lambda而不是自定义类，从而减少所需的锅炉空间。

- LongEventJdk8Main.java

```java
package com.github.houbb.jdk.disruptor;

import com.lmax.disruptor.dsl.Disruptor;
import com.lmax.disruptor.RingBuffer;

import java.nio.ByteBuffer;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

public class LongEventJdk8Main {


    public static void main(String[] args) throws Exception {
        // Executor that will be used to construct new threads for consumers
        Executor executor = Executors.newCachedThreadPool();

        // Specify the size of the ring buffer, must be power of 2.
        int bufferSize = 1024;

        // Construct the Disruptor
        Disruptor<LongEvent> disruptor = new Disruptor<>(LongEvent::new, bufferSize, executor);

        // Connect the handler
        disruptor.handleEventsWith((event, sequence, endOfBatch) -> System.out.println("Event: " + event));

        // Start the Disruptor, starts all threads running
        disruptor.start();

        // Get the ring buffer from the Disruptor to be used for publishing.
        RingBuffer<LongEvent> ringBuffer = disruptor.getRingBuffer();

        ByteBuffer bb = ByteBuffer.allocate(8);
        for (long l = 0; true; l++) {
            bb.putLong(0, l);
            ringBuffer.publishEvent((event, sequence, buffer) -> event.set(buffer.getLong(0)), bb);
            Thread.sleep(1000);
        }
    }

}
```


* any list
{:toc}