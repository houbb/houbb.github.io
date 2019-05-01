---
layout: post
title:  Netty-14-抽象编解码器
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, codec, sh]
published: true
---

# 抽象的编解码器类

虽然我们一直将解码器和编码器作为单独的实体讨论，但是你有时将会发现在同一个类中管理入站和出站数据和消息的转换是很有用的。

Netty 的抽象编解码器类正好用于这个目的，因为它们每个都将捆绑一个解码器/编码器对，以处理我们一直在学习的这两种类型的操作。

正如同你可能已经猜想到的，这些类同时实现了ChannelInboundHandler 和ChannelOutboundHandler 接口。

## 为什么优先使用单独类

为什么我们并没有一直优先于单独的解码器和编码器使用这些复合类呢？

因为通过尽可能地将这两种功能分开，最大化了代码的可重用性和可扩展性，这是Netty 设计的一个基本原则。

在我们查看这些抽象的编解码器类时，我们将会把它们与相应的单独的解码器和编码器进行比较和参照。

# 抽象类 ByteToMessageCodec

## 场景

让我们来研究这样的一个场景：我们需要将字节解码为某种形式的消息，可能是POJO，随后再次对它进行编码。

ByteToMessageCodec 将为我们处理好这一切，因为它结合了ByteToMessageDecoder 以及它的逆向——MessageToByteEncoder。

任何的请求/响应协议都可以作为使用 ByteToMessageCodec 的理想选择。

例如，在某个SMTP的实现中，编解码器将读取传入字节，并将它们解码为一个自定义的消息类型，如SmtpRequest而在接收端，当一个响应被创建时，将会产生一个SmtpResponse，其将被编码回字节以便进行传输。

> [基于Netty 的SMTP/LMTP 客户端项目中](https://github.com/normanmaurer/niosmtp)

## 接口

```java
public abstract class ByteToMessageCodec<I> extends ChannelDuplexHandler {}
```

## API

```java
/**
 * @see MessageToByteEncoder#encode(ChannelHandlerContext, Object, ByteBuf)
 */
protected abstract void encode(ChannelHandlerContext ctx, I msg, ByteBuf out) throws Exception;

/**
 * @see ByteToMessageDecoder#decode(ChannelHandlerContext, ByteBuf, List)
 */
protected abstract void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception;

/**
 * @see ByteToMessageDecoder#decodeLast(ChannelHandlerContext, ByteBuf, List)
 */
protected void decodeLast(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception {
    if (in.isReadable()) {
        // Only call decode() if there is something left in the buffer to decode.
        // See https://github.com/netty/netty/issues/4386
        decode(ctx, in, out);
    }
}
```

# 抽象类MessageToMessageCodec

在10.3.1 节中，你看到了一个扩展了MessageToMessageEncoder 以将一种消息格式转换为另外一种消息格式的例子。

通过使用MessageToMessageCodec，我们可以在一个单个的类中实现该转换的往返过程。

MessageToMessageCodec 是一个参数化的类，定义如下：

## 接口

```java
public abstract class MessageToMessageCodec<INBOUND_IN, OUTBOUND_IN> extends ChannelDuplexHandler {}
```

## API

```java
/**
 * @see MessageToMessageEncoder#encode(ChannelHandlerContext, Object, List)
 */
protected abstract void encode(ChannelHandlerContext ctx, OUTBOUND_IN msg, List<Object> out)
        throws Exception;

/**
 * @see MessageToMessageDecoder#decode(ChannelHandlerContext, Object, List)
 */
protected abstract void decode(ChannelHandlerContext ctx, INBOUND_IN msg, List<Object> out)
        throws Exception;
```

decode() 方法是将INBOUND_IN 类型的消息转换为OUTBOUND_IN 类型的消息， 而encode()方法则进行它的逆向操作。

将INBOUND_IN类型的消息看作是通过网络发送的类型，而将OUTBOUND_IN类型的消息看作是应用程序所处理的类型，将可能有助于理解这两个类型签名的实际意义。

虽然这个编解码器可能看起来有点高深，但是它所处理的用例却是相当常见的：在两种不同的消息API 之间来回转换数据。

当我们不得不和使用遗留或者专有消息格式的 API 进行互操作时，我们经常会遇到这种模式。

## WebSocket 协议

下面关于MessageToMessageCodec 的示例引用了一个新出的WebSocket 协议，这个协议能实现Web 浏览器和服务器之间的全双向通信。

我们将在第 12 章中详细地讨论Netty 对于WebSocket 的支持。


## 示例

TDDO...

# CombinedChannelDuplexHandler 类

正如我们前面所提到的，结合一个解码器和编码器可能会对可重用性造成影响。

但是，有一种方法既能够避免这种惩罚，又不会牺牲将一个解码器和一个编码器作为一个单独的单元部署所带来的便利性。

CombinedChannelDuplexHandler 提供了这个解决方案。

## 接口

其声明为：

```java
public class CombinedChannelDuplexHandler<I extends ChannelInboundHandler, O extends ChannelOutboundHandler>
        extends ChannelDuplexHandler {}
```

这个类充当了ChannelInboundHandler 和ChannelOutboundHandler（该类的类型参数I 和O）的容器。

通过提供分别继承了解码器类和编码器类的类型，我们可以实现一个编解码器，而又不必直接扩展抽象的编解码器类。

我们将在下面的示例中说明这一点。

## 案例

首先，让我们研究代码清单10-8 中的 ByteToCharDecoder。

注意，该实现扩展了 ByteToMessageDecoder，因为它要从 ByteBuf 中读取字符。

- ByteToCharDecoder.java

```java
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.ByteToMessageDecoder;

import java.util.List;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public class ByteToCharDecoder extends ByteToMessageDecoder {
    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception {
        while (in.readableBytes() >= 2) {
            // 将 byte 转换为 char 添加到输出列表
            out.add(in.readChar());
        }
    }
}
```

- CharToByteEncoder.java

```java
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.ByteToMessageDecoder;
import io.netty.handler.codec.MessageToByteEncoder;

import java.util.List;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public class CharToByteEncoder extends MessageToByteEncoder<Character> {
    @Override
    protected void encode(ChannelHandlerContext ctx, Character msg, ByteBuf out) throws Exception {
        //将Character 解码为char，并将其写入到出站ByteBuf 中
        out.writeChar(msg);
    }
}
```

- CombinedByteCharCodec.java

```java
import io.netty.channel.CombinedChannelDuplexHandler;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public class CombinedByteCharCodec extends CombinedChannelDuplexHandler<ByteToCharDecoder, CharToByteEncoder> {

    public CombinedByteCharCodec() {
        super(new ByteToCharDecoder(), new CharToByteEncoder());
    }

}
```

## 感受

netty 对于复用的理念，贯彻的特别透彻。

这让 netty 非常的灵活，复用性也非常的高。

感觉以后自己在设计框架的时候，可以效仿 netty 这种精益求精的设计精神。

# 参考资料

《Netty in Action》 P155

- Other

[Netty的Encoder(编码器)](https://www.w3cschool.cn/essential_netty_in_action/essential_netty_in_action-312k28by.html)

* any list
{:toc}