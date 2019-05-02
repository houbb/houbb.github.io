---
layout: post
title:  Netty 基于分隔符的协议和基于长度的协议
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, http, sh]
published: true
---

# 解码基于分隔符的协议和基于长度的协议

在使用 Netty 的过程中，你将会遇到需要解码器的基于分隔符和帧长度的协议。

下一节将解释 Netty 所提供的用于处理这些场景的实现。

# 基于分隔符的协议

基于分隔符的（delimited）消息协议使用定义的字符来标记的消息或者消息段（通常被称为帧）的开头或者结尾。

由RFC文档正式定义的许多协议（如SMTP、POP3、IMAP以及Telnet）都是这样的。

此外，当然，私有组织通常也拥有他们自己的专有格式。

## 核心 API

无论你使用什么样的协议，表11-5 中列出的解码器都能帮助你定义可以提取由任意标记（token）序列分隔的帧的自定义解码器。

```
DelimiterBasedFrameDecoder      使用任何由用户提供的分隔符来提取帧的通用解码器
LineBasedFrameDecoder           提取由行尾符（\n 或者\r\n）分隔的帧的解码器。这个解码器比DelimiterBasedFrameDecoder 更快
```

## 解析流程

![基于分隔符的解析流程](https://images2018.cnblogs.com/blog/1112095/201803/1112095-20180314132744168-1041219417.png)

## LineBasedFrameDecoder 示例代码

代码清单11-8 展示了如何使用 LineBasedFrameDecoder 来处理图11-5 所示的场景。

```java
import io.netty.buffer.ByteBuf;
import io.netty.channel.*;
import io.netty.handler.codec.LineBasedFrameDecoder;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class LineBaseChannelInit extends ChannelInitializer<Channel> {
    @Override
    protected void initChannel(Channel ch) throws Exception {
        ch.pipeline().addLast(new LineBasedFrameDecoder(64 * 1024))
                .addLast(new LineBaseHandler());
    }

    /**
     * 每一行的处理类
     */
    class LineBaseHandler extends SimpleChannelInboundHandler<ByteBuf> {
        @Override
        protected void channelRead0(ChannelHandlerContext ctx, ByteBuf msg) throws Exception {
            // do sth...
        }
    }
}
```

## DelimiterBasedFrameDecoder

如果你正在使用除了行尾符之外的分隔符分隔的帧，那么你可以以类似的方式使用DelimiterBasedFrameDecoder，只需要将特定的分隔符序列指定到其构造函数即可。

这些解码器是实现你自己的基于分隔符的协议的工具。


## 基于 LineBasedFrameDecoder 自定义自己的解码实现

### 协议规范

作为示例，我们将使用下面的协议规范：

1. 传入数据流是一系列的帧，每个帧都由换行符（\n）分隔；

2. 每个帧都由一系列的元素组成，每个元素都由单个空格字符分隔；

3. 一个帧的内容代表一个命令，定义为一个命令名称后跟着数目可变的参数。

我们用于这个协议的自定义解码器将定义以下类：

1. Cmd—将帧（命令）的内容存储在ByteBuf 中，一个ByteBuf 用于名称，另一个用于参数；

2. CmdDecoder—从被重写了的decode()方法中获取一行字符串，并从它的内容构建一个Cmd 的实例

3. CmdHandler —从CmdDecoder 获取解码的Cmd 对象，并对它进行一些处理；

4. CmdHandlerInitializer —为了简便起见，我们将会把前面的这些类定义为专门的ChannelInitializer 的嵌套类，其将会把这些ChannelInboundHandler 安装
到ChannelPipeline 中。

### 代码示例

核心流程

1. 基于 LineBasedFrameDecoder 解析每一行，再根据我们的 cmd 协议，解析对象。

2. 整体流程比较简答。cmd 对象, 我们自定义的 decoder+handler。

3. 进行整体的 channel 装载。

```java
import io.netty.buffer.ByteBuf;
import io.netty.channel.Channel;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.LineBasedFrameDecoder;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class CmdChannelInit extends ChannelInitializer<Channel> {
    @Override
    protected void initChannel(Channel ch) throws Exception {
        ch.pipeline().addLast(new CmdDecoder(64 * 1024))
                .addLast(new CmdHandler());
    }

    class Cmd {
        /**
         * 名称
         */
        private ByteBuf name;

        /**
         * 参数
         */
        private ByteBuf arg;

        public Cmd(ByteBuf name, ByteBuf arg) {
            this.name = name;
            this.arg = arg;
        }

        public ByteBuf getName() {
            return name;
        }

        public void setName(ByteBuf name) {
            this.name = name;
        }

        public ByteBuf getArg() {
            return arg;
        }

        public void setArg(ByteBuf arg) {
            this.arg = arg;
        }
    }

    /**
     * 自定义解码器
     */
    class CmdDecoder extends LineBasedFrameDecoder {
        private static final byte SPACE = ' ';
        public CmdDecoder(int maxLength) {
            super(maxLength);
        }

        @Override
        protected Object decode(ChannelHandlerContext ctx, ByteBuf buffer) throws Exception {
            ByteBuf frame = (ByteBuf) super.decode(ctx, buffer);
            if (frame == null) {
                return null;
            }
            // 索引一行中的空格
            // 空格前面是名称，后面是参数
            int index = frame.indexOf(frame.readerIndex(), frame.writerIndex(), SPACE);
            return new Cmd(frame.slice(frame.readerIndex(), index),
                    frame.slice(index + 1, frame.writerIndex()));
        }
    }

    class CmdHandler extends SimpleChannelInboundHandler<Cmd> {
        @Override
        protected void channelRead0(ChannelHandlerContext ctx, Cmd msg) throws Exception {
            //do sth...
        }
    }
}
```


# 基于长度的协议

基于长度的协议通过将它的长度编码到帧的头部来定义帧，而不是使用特殊的分隔符来标记它的结束。


## 核心解码器

表11-6 列出了Netty提供的用于处理这种类型的协议的两种解码器。

```
FixedLengthFrameDecoder         提取在调用构造函数时指定的定长帧
LengthFieldBasedFrameDecoder    根据编码进帧头部中的长度值提取帧；该字段的偏移量以及长度在构造函数中指定
```

## 流程
 
下图展示了 FixedLengthFrameDecoder 的功能，其在构造时已经指定了帧长度为8字节。

![FixedLengthFrameDecoder](https://images2018.cnblogs.com/blog/1112095/201803/1112095-20180319103429487-1087470907.png)

你将经常会遇到被编码到消息头部的帧大小不是固定值的协议。

为了处理这种变长帧，你可以使用 LengthFieldBasedFrameDecoder，它将从头部字段确定帧长，然后从数据流中提取指定的字节数。

下图展示了将变长帧大小编码进头部的消息的示例，其中长度字段在帧中的偏移量为0，并且长度为2字节。

![LengthFieldBasedFrameDecoder](https://images2018.cnblogs.com/blog/1112095/201803/1112095-20180319103608883-869509608.png)

LengthFieldBasedFrameDecoder 提供了几个构造函数来支持各种各样的头部配置情况。

## 示例代码

代码清单11-10 展示了如何使用其 3 个构造参数分别为maxFrameLength、lengthFieldOffset 和lengthFieldLength 的构造函数。

在这个场景中，帧的长度被编码到了帧起始的前8 个字节中。

```java
import io.netty.buffer.ByteBuf;
import io.netty.channel.Channel;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.LengthFieldBasedFrameDecoder;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class LenBasedInit extends ChannelInitializer<Channel> {
    @Override
    protected void initChannel(Channel ch) throws Exception {
        //使用LengthFieldBasedFrameDecoder 解码将帧长度编码到帧起始的前8 个字节中的消息
        ch.pipeline().addLast(new LengthFieldBasedFrameDecoder(64*1024, 0, 8))
                .addLast(new LenBaseHandler());
    }

    class LenBaseHandler extends SimpleChannelInboundHandler<ByteBuf> {
        @Override
        protected void channelRead0(ChannelHandlerContext ctx, ByteBuf msg) throws Exception {
        }
    }
}
```

# 参考资料

《Netty in Action》 P172

* any list
{:toc}