---
layout: post
title:  Netty-14-encoder 编码器
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, codec, sh]
published: true
---

# 编码器

回顾一下我们先前的定义，编码器实现了ChannelOutboundHandler，并将出站数据从一种格式转换为另一种格式，和我们方才学习的解码器的功能正好相反。

Netty 提供了一组类，用于帮助你编写具有以下功能的编码器：

1. 将消息编码为字节；

2. 将消息编码为消息

# 抽象类 MessageToByteEncoder

我们将首先从抽象基类 MessageToByteEncoder 开始来对这些类进行考察。

前面我们看到了如何使用ByteToMessageDecoder 来将字节转换为消息。


## API

现在我们将使用 MessageToByteEncoder 来做逆向的事情。

表10-3 展示了该API。

- encode()

```java
/**
 * Encode a message into a {@link ByteBuf}. This method will be called for each written message that can be handled
 * by this encoder.
 *
 * @param ctx           the {@link ChannelHandlerContext} which this {@link MessageToByteEncoder} belongs to
 * @param msg           the message to encode
 * @param out           the {@link ByteBuf} into which the encoded message will be written
 * @throws Exception    is thrown if an error occurs
 */
protected abstract void encode(ChannelHandlerContext ctx, I msg, ByteBuf out) throws Exception;
```

### 和解码器的不同

你可能已经注意到了，这个类只有一个方法，而解码器有两个。

原因是解码器通常需要在Channel 关闭之后产生最后一个消息（因此也就有了decodeLast()方法）。

这显然不适用于编码器的场景——在连接被关闭之后仍然产生一个消息是毫无意义的。

## 示例代码

图10-3 展示了ShortToByteEncoder，其接受一个Short 类型的实例作为消息，将它编码为Short 的原子类型值，并将它写入ByteBuf 中，其将随后被转发给ChannelPipeline 中的下一个ChannelOutboundHandler。

- 流程

```
出站 Short==>编码为 ByteBuf ==> [1][2]==》写入到 ChannelOutbounderHandler
```

每个传出的Short 值都将会占用ByteBuf 中的2 字节。

ShortToByteEncoder 的实现如代码清单10-5 所示。

```java
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToByteEncoder;

/**
 * short->byte 编码器
 * @author binbin.hou
 * @since 0.0.1
 */
public class ShortToByteEncoder extends MessageToByteEncoder<Short> {
    @Override
    protected void encode(ChannelHandlerContext ctx, Short msg, ByteBuf out) throws Exception {
        // 将 byte 信息写入
        out.writeShort(msg);
    }
}
```

Netty 提供了一些专门化的MessageToByteEncoder，你可以基于它们实现自己的编码器。

WebSocket08FrameEncoder 类提供了一个很好的实例。你可以在io.netty.handler.codec.http.websocketx 包中找到它。

# 抽象类MessageToMessageEncoder

你已经看到了如何将入站数据从一种消息格式解码为另一种。

MessageToMessageEncoder 类的 encode()方法提供了这种能力。

## 接口

```java
public abstract class MessageToMessageEncoder<I> extends ChannelOutboundHandlerAdapter {}
```

## API

```java
/**
 * Encode from one message to an other. This method will be called for each written message that can be handled
 * by this encoder.
 *
 * @param ctx           the {@link ChannelHandlerContext} which this {@link MessageToMessageEncoder} belongs to
 * @param msg           the message to encode to an other one
 * @param out           the {@link List} into which the encoded msg should be added
 *                      needs to do some kind of aggregation
 * @throws Exception    is thrown if an error occurs
 */
protected abstract void encode(ChannelHandlerContext ctx, I msg, List<Object> out) throws Exception;
```

## 示例代码

编码器将每个出站 Integer 的 String 表示添加到了该List 中。

```java
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToByteEncoder;
import io.netty.handler.codec.MessageToMessageEncoder;

import java.util.List;

/**
 * 整形->字符串 编码器
 * @author binbin.hou
 * @since 0.0.1
 */
public class IntegerToStringEncoder extends MessageToMessageEncoder<Integer> {
    @Override
    protected void encode(ChannelHandlerContext ctx, Integer msg, List<Object> out) throws Exception {
        out.add(msg.toString());
    }
}
```

# 更多信息

关于有趣的 MessageToMessageEncoder 的专业用法，请查看io.netty.handler.codec.protobuf.ProtobufEncoder 类

它处理了由Google 的Protocol Buffers 规范所定义的数据格式。

# 参考资料

《Netty in Action》 P150

- Other

[Netty的Encoder(编码器)](https://www.w3cschool.cn/essential_netty_in_action/essential_netty_in_action-312k28by.html)

* any list
{:toc}