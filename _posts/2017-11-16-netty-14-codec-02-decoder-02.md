---
layout: post
title:  Netty-14-decoder 解码器
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, codec, sh]
published: true
---

# 解码器

在这一节中，我们将研究Netty 所提供的解码器类，并提供关于何时以及如何使用它们的具体示例。

这些类覆盖了两个不同的用例：

1. 将字节解码为消息——ByteToMessageDecoder 和 ReplayingDecoder；

2. 将一种消息类型解码为另一种——MessageToMessageDecoder。

因为解码器是负责将入站数据从一种格式转换到另一种格式的，所以知道Netty 的解码器实现了ChannelInboundHandler 也不会让你感到意外。

## 使用场景

什么时候会用到解码器呢？

很简单：每当需要为ChannelPipeline 中的下一个ChannelInboundHandler 转换入站数据时会用到。

此外，得益于ChannelPipeline 的设计，可以将多个解码器链接在一起，以实现任意复杂的转换逻辑，这也是Netty 是如何支持代码的模块化以及
复用的一个很好的例子。


# 抽象类 ByteToMessageDecoder

将字节解码为消息（或者另一个字节序列）是一项如此常见的任务，以至于Netty 为它提供了一个抽象的基类：ByteToMessageDecoder。

由于你不可能知道远程节点是否会一次性地发送一个完整的消息，所以这个类会对入站数据进行缓冲，直到它准备好处理。

## API

下面解释了它最重要的两个方法。

- decode(ChannelHandlerContext ctx,ByteBuf in,List<Object> out)

这是你必须实现的唯一抽象方法。decode()方法被调用时将会传入一个包含了传入数据的ByteBuf，以及一个用来添加解码消息的List。

对这个方法的调用将会重复进行，直到确定没有新的元素被添加到该List，或者该ByteBuf 中没有更多可读取的字节时为止。

然后，如果该List 不为空，那么它的内容将会被传递给 ChannelPipeline 中的下一个ChannelInboundHandler

- decodeLast(ChannelHandlerContext ctx,ByteBuf in,List<Object> out)

Netty提供的这个默认实现只是简单地调用了decode()方法。

当Channel的状态变为非活动时，这个方法将会被调用一次。可以重写该方法以提供特殊的处理。

## 应用案例

下面举一个如何使用这个类的示例，假设你接收了一个包含简单int 的字节流，每个int都需要被单独处理。

在这种情况下，你需要从入站ByteBuf 中读取每个int，并将它传递给ChannelPipeline 中的下一个ChannelInboundHandler。

为了解码这个字节流，你要扩展ByteToMessageDecoder 类。

（需要注意的是，原子类型的int 在被添加到List 中时，会被自动装箱为Integer。）

每次从入站ByteBuf 中读取4 字节，将其解码为一个int，然后将它添加到一个List 中。

当没有更多的元素可以被添加到该List 中时，它的内容将会被发送给下一个ChannelInboundHandler。

- ToIntegerDecoder.java

```java
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.ByteToMessageDecoder;

import java.util.List;

/**
 * @author binbin.hou
 * @date 2019/5/1
 * @since 0.0.1
 */
public class ToIntegerDecoder extends ByteToMessageDecoder {
    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception {
        if(in.readableBytes() >= 4) {
            // 读取一个整数，添加到输出流。
            out.add(in.readInt());
        }
    }
}
```

虽然ByteToMessageDecoder 使得可以很简单地实现这种模式，但是你可能会发现，在调用readInt()方法前不得不验证所输入的ByteBuf 是否具有足够的数据有点繁琐。

在下一节中，我们将讨论ReplayingDecoder，它是一个特殊的解码器，以少量的开销消除了这个步骤。

## 编解码器中的引用计数

正如我们在第 5 章和第 6 章中所提到的，引用计数需要特别的注意。

对于编码器和解码器来说，其过程也是相当的简单：一旦消息被编码或者解码，它就会被ReferenceCountUtil.release(message)调用自动释放。

如果你需要保留引用以便稍后使用，那么你可以调用ReferenceCountUtil.retain(message)方法。这将会增加该引用计数，从而防止该消息被释放。


# 抽象类ReplayingDecoder

ReplayingDecoder扩展了ByteToMessageDecoder类（如代码清单10-1 所示），使得我们不必调用readableBytes()方法。

它通过使用一个自定义的ByteBuf实现，ReplayingDecoderByteBuf，包装传入的ByteBuf实现了这一点，其将在内部执行该调用。

## 接口定义

这个类的完整声明是：

```java
public abstract class ReplayingDecoder<S> extends ByteToMessageDecoder {
```

类型参数 S 指定了用于状态管理的类型，其中Void 代表不需要状态管理。

看得出来，这个类，继承自 ByteToMessageDecoder。

## 代码示例

展示了基于 ReplayingDecoder 重新实现的ToIntegerDecoder。

```java
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.ByteToMessageDecoder;
import io.netty.handler.codec.ReplayingDecoder;

import java.util.List;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public class ToIntegerReplyDecoder extends ReplayingDecoder<Void> {
    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception {
        out.add(in.readInt());
    }
}
```

和之前一样，从ByteBuf中提取的int将会被添加到List中。

如果没有足够的字节可用，这个readInt()方法的实现将会抛出一个Error，其将在基类中被捕获并处理。

当有更多的数据可供读取时，该decode()方法将会被再次调用。（参见表10-1 中关于decode()方法的描述。）

### 注意

请注意ReplayingDecoderByteBuf 的下面这些方面：

1. 并不是所有的 ByteBuf 操作都被支持，如果调用了一个不被支持的方法，将会抛出一个UnsupportedOperationException；

2. ReplayingDecoder 稍慢于 ByteToMessageDecoder。

# 更多的解码器

下面的这些类处理更加复杂的用例：

- io.netty.handler.codec.LineBasedFrameDecoder

这个类在Netty 内部也有使用，它使用了行尾控制字符（\n 或者\r\n）来解析消息数据；

- io.netty.handler.codec.http.HttpObjectDecoder—一个HTTP 数据的解码器。

在io.netty.handler.codec 子包下面，你将会发现更多用于特定用例的编码器和解码器实现。


# 抽象类MessageToMessageDecoder

在这一节中，我们将解释如何使用下面的抽象基类在两个消息格式之间进行转换

（例如，从一种POJO 类型转换为另一种）：

## 接口

```java
public abstract class MessageToMessageDecoder<I> extends ChannelInboundHandlerAdapter
```

类型参数I 指定了decode()方法的输入参数msg 的类型，它是你必须实现的唯一方法。

## API

```java
/**
 * Decode from one message to an other. This method will be called for each written message that can be handled
 * by this encoder.
 *
 * @param ctx           the {@link ChannelHandlerContext} which this {@link MessageToMessageDecoder} belongs to
 * @param msg           the message to decode to an other one
 * @param out           the {@link List} to which decoded messages should be added
 * @throws Exception    is thrown if an error occurs
 */
protected abstract void decode(ChannelHandlerContext ctx, I msg, List<Object> out) throws Exception;
```

## 示例代码

在这个示例中，我们将编写一个 IntegerToStringDecoder 解码器来扩展MessageTo-MessageDecoder<Integer>。

它的decode()方法会把Integer 参数转换为它的String表示。

```java
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToMessageDecoder;

import java.util.List;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public class IntegerToStringDecoder extends MessageToMessageDecoder<Integer> {
    @Override
    protected void decode(ChannelHandlerContext ctx, Integer msg, List<Object> out) throws Exception {
        // 将 integer => string，并且添加到输出列表
        out.add(msg.toString());
    }
}
```

## 更加复杂的场景

- HttpObjectAggregator

有关更加复杂的例子，请研究 io.netty.handler.codec.http.HttpObjectAggregator 类，

它扩展了MessageToMessageDecoder<HttpObject>。

# TooLongFrameException 类

由于Netty 是一个异步框架，所以需要在字节可以解码之前在内存中缓冲它们。

因此，不能让解码器缓冲大量的数据以至于耗尽可用的内存。

为了解除这个常见的顾虑，Netty 提供了TooLongFrameException 类，其将由解码器在帧超出指定的大小限制时抛出。

为了避免这种情况，你可以设置一个最大字节数的阈值，如果超出该阈值，则会导致抛出一个TooLongFrameException（随后会被ChannelHandler.exceptionCaught()方法捕获）。

然后，如何处理该异常则完全取决于该解码器的用户。

某些协议（如HTTP）可能允许你返回一个特殊的响应。

而在其他的情况下，唯一的选择可能就是关闭对应的连接。

## 示例

代码清单10-4 展示了ByteToMessageDecoder 是如何使用TooLongFrameException来通知ChannelPipeline 中的其他ChannelHandler 发生了帧大小溢出的。

需要注意的是，如果你正在使用一个可变帧大小的协议，那么这种保护措施将是尤为重要的。

```java
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.ByteToMessageDecoder;
import io.netty.handler.codec.TooLongFrameException;

import java.util.List;

/**
 * 限制长度的解码器
 * @author binbin.hou
 * @since 0.0.1
 */
public class FrameLimitLengthDecoder extends ByteToMessageDecoder {

    /**
     * 限制字节数最大长度
     */
    private final int maxLimitLength;

    public FrameLimitLengthDecoder(int maxLimitLength) {
        this.maxLimitLength = maxLimitLength;
    }

    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception {
        int length = in.readableBytes();
        if(length > maxLimitLength) {
            in.clear();
            throw new TooLongFrameException("max byte limit is: " + maxLimitLength);
        }

        // 如果没有超出最大长度，则写入到输出列表
        out.add(in.readBytes(length));
    }
}
```

# 小结

到目前为止，我们已经探讨了解码器的常规用例，以及Netty 所提供的用于构建它们的抽象基类。

但是解码器只是硬币的一面。硬币的另一面是编码器，它将消息转换为适合于传出传输的格式。

这些编码器完备了编解码器API，它们将是我们的下一个主题。

# 参考资料

《Netty in Action》 P150

- Other

[Netty提供的Decoder(解码器)](https://www.w3cschool.cn/essential_netty_in_action/essential_netty_in_action-x7mn28bx.html)

* any list
{:toc}