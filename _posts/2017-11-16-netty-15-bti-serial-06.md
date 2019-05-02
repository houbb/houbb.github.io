---
layout: post
title:  Netty 序列化
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, http, sh]
published: true
---

# 序列化数据

JDK 提供了ObjectOutputStream 和ObjectInputStream，用于通过网络对POJO 的基本数据类型和图进行序列化和反序列化。

该API 并不复杂，而且可以被应用于任何实现了java.io.Serializable 接口的对象。

但是它的性能也不是非常高效的。

在这一节中，我们将看到Netty 必须为此提供什么。

# JDK 序列化

如果你的应用程序必须要和使用了ObjectOutputStream和ObjectInputStream的远程节点交互，并且兼容性也是你最关心的，那么JDK序列化将是正确的选择。

表11-8 中列出了Netty提供的用于和JDK进行互操作的序列化类。

## 核心类

```
CompatibleObjectDecoder  和使用 JDK 序列化的非基于 Netty的远程节点进行互操作的解码器
CompatibleObjectEncoder  和使用JDK 序列化的非基于Netty 的远程节点进行互操作的编码器
ObjectDecoder   构建于JDK 序列化之上的使用自定义的序列化来解码的解码器；当没有其他的外部依赖时，它提供了速度上的改进。否则其他的序列化实现更加可取
ObjectEncoder   构建于JDK 序列化之上的使用自定义的序列化来编码的编码器；当没有其他的外部依赖时，它提供了速度上的改进。否则其他的序列化实现更加可取
```

# 使用JBoss Marshalling 进行序列化

如果你可以自由地使用外部依赖，那么JBoss Marshalling将是个理想的选择：它比JDK序列化最多快3 倍，而且也更加紧凑。

在JBoss Marshalling官方网站主页

JBoss Marshalling 是一种可选的序列化API，它修复了在JDK 序列化API 中所发现的许多问题，同时保留了与java.io.Serializable 及其相关类的兼容性，并添加
了几个新的可调优参数以及额外的特性，所有的这些都是可以通过工厂配置（如外部序列化器、类/实例查找表、类解析以及对象替换等）实现可插拔的。

Netty 通过表11-9 所示的两组解码器/编码器对为Boss Marshalling 提供了支持。

第一组兼容只使用JDK 序列化的远程节点。第二组提供了最大的性能，适用于和使用JBoss Marshalling 的远程节点一起使用。

## JBoss Marshalling 编解码器

```
CompatibleMarshallingDecoder/CompatibleMarshallingEncoder   与只使用JDK 序列化的远程节点兼容
MarshallingDecoder/MarshallingEncoder   适用于使用JBoss Marshalling 的节点。这些类必须一起使用
```

## 示例代码

代码清单11-13 展示了如何使用MarshallingDecoder 和MarshallingEncoder。

同样，几乎只是适当地配置ChannelPipeline 罢了。

```java
import io.netty.buffer.ByteBuf;
import io.netty.channel.Channel;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.marshalling.MarshallerProvider;
import io.netty.handler.codec.marshalling.MarshallingDecoder;
import io.netty.handler.codec.marshalling.MarshallingEncoder;
import io.netty.handler.codec.marshalling.UnmarshallerProvider;

import java.io.Serializable;
import java.nio.ByteBuffer;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class JbossMashInit extends ChannelInitializer<Channel> {

    private final MarshallerProvider marshallerProvider;

    private final UnmarshallerProvider unmarshallerProvider;

    public JbossMashInit(MarshallerProvider marshallerProvider, UnmarshallerProvider unmarshallerProvider) {
        this.marshallerProvider = marshallerProvider;
        this.unmarshallerProvider = unmarshallerProvider;
    }

    @Override
    protected void initChannel(Channel ch) throws Exception {
        //byte==>po
        ch.pipeline().addLast(new MarshallingDecoder(unmarshallerProvider))
                //po=>byte
                .addLast(new MarshallingEncoder(marshallerProvider))
                .addLast(new SerialObjectHandler());
    }

    class SerialObjectHandler extends SimpleChannelInboundHandler<Serializable> {
        @Override
        protected void channelRead0(ChannelHandlerContext ctx, Serializable msg) throws Exception {

        }
    }
}
```

# 通过Protocol Buffers 序列化

Netty序列化的最后一个解决方案是利用Protocol Buffers的编解码器，它是一种由Google公司开发的、现在已经开源的数据交换格式。

Protocol Buffers 以一种紧凑而高效的方式对结构化的数据进行编码以及解码。

它具有许多的编程语言绑定，使得它很适合跨语言的项目。

## netty 相关实现

表11-10 展示了Netty 为支持protobuf 所提供的ChannelHandler 实现。

```
ProtobufDecoder     使用protobuf 对消息进行解码
ProtobufEncoder     使用protobuf 对消息进行编码
ProtobufVarint32FrameDecoder    根据消息中的Google Protocol Buffers 的“Base 128 Varints”a整型长度字段值动态地分割所接收到的ByteBuf
ProtobufVarint32LengthFieldPrepender    向ByteBuf 前追加一个Google Protocal Buffers 的“Base128 Varints”整型的长度字段值
```

## 示例代码

在这里我们又看到了，使用protobuf 只不过是将正确的ChannelHandler 添加到Channel-Pipeline 中，如代码清单11-14 所示。

```java
public class ProtoBufInitializer extends ChannelInitializer<Channel> {
    private final MessageLite lite;
    public ProtoBufInitializer(MessageLite lite) {
        this.lite = lite;
    }
    @Override
    protected void initChannel(Channel ch) throws Exception {
    　　ChannelPipeline pipeline = ch.pipeline();
    　　pipeline.addLast(new ProtobufVarint32FrameDecoder());// 添加ProtobufVarint32FrameDecoder以分隔帧
    　　pipeline.addLast(new ProtobufEncoder()); // 添加ProtobufEncoder以处理消息的编码
    　　pipeline.addLast(new ProtobufDecoder(lite));// 添加ProtobufDecoder以解码消息
    　　pipeline.addLast(new ObjectHandler());// 添加ObjectHandler以处理解码消息
    }
    public static final class ObjectHandler extends SimpleChannelInboundHandler<Object> {
        @Override
        public void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
            // Do something with the object
        }
    }
}
```

ps: 我用的 netty  4.17 没有这个 MessageLite 对象，应该是需要添加依赖。

# 个人收获

1. 序列化可以采用简单的 json。

2. 一个工具如果没有做到极致，就会被替代。

3. 只有标准难以被替代。所有的实现都是标准的附庸品和演绎。

# 拓展阅读

## 序列化

[JSON 序列化](https://houbb.github.io/2018/07/20/json)

[Protocol Buffers](https://houbb.github.io/2018/03/16/google-protocol-buffer)

# 参考资料

《Netty in Action》 P172

* any list
{:toc}