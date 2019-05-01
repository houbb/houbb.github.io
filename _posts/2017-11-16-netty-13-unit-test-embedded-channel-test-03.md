---
layout: post
title:  Netty-13-EmbeddedChannel 测试 ChannelHandler 
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, test, sh]
published: true
---

在这一节中，我们将讲解如何使用EmbeddedChannel 来测试ChannelHandler。

# Junit 断言

org.junit.Assert 类提供了很多用于测试的静态方法。

失败的断言将导致一个异常被抛出，并将终止当前正在执行中的测试。

导入这些断言的最高效的方式是通过一个import static 语句来实现：

```java
import static org.junit.Assert.*;
```

一旦这样做了，就可以直接调用Assert 方法了：

```java
assertEquals(buf.readSlice(3), read);
```

# 解码器与编码器

## 解码器

Netty 提供了丰富的解码器抽象基类，我们可以很容易的实现这些基类来自定义解码器。主要分两类：

1. 解码字节到消息（ByteToMessageDecoder 和 ReplayingDecoder）

2. 解码消息到消息（MessageToMessageDecoder）

decoder 负责将“入站”数据从一种格式转换到另一种格式，Netty的解码器是一种 ChannelInboundHandler 的抽象实现。

实践中使用解码器很简单，就是将入站数据转换格式后传递到 ChannelPipeline 中的下一个ChannelInboundHandler 进行处理；这样的处理是很灵活的，我们可以将解码器放在 ChannelPipeline 中，重用逻辑。

## 编码器

就像decoder一样，Netty 也为你提供了一组类来写 encoder ，当然这些类提供的是与 decoder 完全相反的方法，如下所示：

1. 编码从消息到字节

2. 编码从消息到消息

# 测试入站消息

## 场景

我们先来编写一个简单的 ByteToMessageDecoder 实现，在有足够的数据可以读取的情况下将产生固定大小的包，如果没有足够的数据可以读取，则会等待下一个数据块并再次检查是否可以产生一个完整包。

如图所示，它可能会占用一个以上的“event”以获取足够的字节产生一个数据包，并将它传递到 ChannelPipeline 中的下一个 ChannelHandler，

![测试入站消息](https://7n.w3cschool.cn/attachments/image/20170808/1502160371497444.jpg)

正如可以从图9-2 右侧的帧看到的那样，这个特定的解码器将产生固定为 3 字节大小的帧。

因此，它可能会需要多个事件来提供足够的字节数以产生一个帧。

最终，每个帧都会被传递给 ChannelPipeline 中的下一个ChannelHandler。

该解码器的实现，如代码清单9-1 所示。

## 编码

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
public class FixedLengthFrameDecoder extends ByteToMessageDecoder {

    /**
     * 指定帧的长度
     */
    private final int length;

    public FixedLengthFrameDecoder(int length) {
        this.length = length;
    }

    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception {
        // 当可读取的字节数大于帧指定的长度，则一直读取，并将内容添加到解码的消息列表中。
        while (in.readableBytes() >= length) {
            ByteBuf byteBuf = in.readBytes(length);
            out.add(byteBuf);
        }
    }

}
```

## 单元测试

为了验证我们代码的正确性，我们来编写一个测试用例，测试下我们的代码。

正如我们前面所指出的，即使是在简单的代码中，单元测试也能帮助我们防止在将来代码重构时可能会导致的问题，并且能在问题发生时帮助我们诊断它们。

```java
package com.github.houbb.netty.inaction.chap09;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.embedded.EmbeddedChannel;
import org.junit.Assert;
import org.junit.Test;

/**
 * @author binbin.hou
 * @date 2019/5/1
 * @since 0.0.1
 */
public class FixedLengthFrameDecoderTest {

    @Test
    public void inTestOne() {
        // 指定创建一个大小为9的 buffer
        ByteBuf byteBuf = Unpooled.buffer();
        for(int i = 0; i < 9; i++) {
            // 写入信息，此时 writeIndex 会自动加1
            byteBuf.writeByte(i);
        }

        final int frameLength = 3;
        // 复制一个 byteBuffer 的拷贝，二者内容是共享的。（浅拷贝）
        ByteBuf input = byteBuf.duplicate();
        EmbeddedChannel embeddedChannel = new EmbeddedChannel(new FixedLengthFrameDecoder(frameLength));
        // 引用计数+1，并写入到输入流
        Assert.assertTrue(embeddedChannel.writeInbound(input.retain()));
        Assert.assertTrue(embeddedChannel.finish());


        //读取所生成的消息，并且验证是否有3 帧（切片），其中每帧（切片）都为3 字节
        ByteBuf read = embeddedChannel.readInbound();
        // 断言大小为3
        Assert.assertEquals(3, read.capacity());
        //释放当前字节资源，并且将引用计数-1
        read.release();

        read = embeddedChannel.readInbound();
        Assert.assertEquals(3, read.capacity());
        //释放当前字节资源，并且将引用计数-1
        read.release();

        read = embeddedChannel.readInbound();
        Assert.assertEquals(3, read.capacity());
        //释放当前字节资源，并且将引用计数-1
        read.release();

        // 断言已经没有内容了
        Assert.assertNull(embeddedChannel.readInbound());
        // 释放点 buffer
        byteBuf.release();
    }

}
```

- 测试2

二者的区别就是在写入的时候，一开始写入2，因为小于指定的3，所以返回 false。

后面读取二者是完全一致的。

```java
    @Test
    public void inTestTwo() {
        //1. 初始化
        ByteBuf byteBuf = Unpooled.buffer(9);
        for(int i = 0; i < 9; i++) {
            byteBuf.writeByte(i);
        }

        //2. 设置输入流
        ByteBuf input = byteBuf.duplicate();
        EmbeddedChannel embeddedChannel = new EmbeddedChannel(new FixedLengthFrameDecoder(3));
        Assert.assertFalse(embeddedChannel.writeInbound(input.readBytes(2)));
        Assert.assertTrue(embeddedChannel.writeInbound(input.readBytes(7)));
        Assert.assertTrue(embeddedChannel.finish());


        // 读取验证
        ByteBuf read = embeddedChannel.readInbound();
        Assert.assertEquals(3, read.capacity());
        read.release();

        read = embeddedChannel.readInbound();
        Assert.assertEquals(3, read.capacity());
        read.release();

        read = embeddedChannel.readInbound();
        Assert.assertEquals(3, read.capacity());
        read.release();

        read = embeddedChannel.readInbound();
        Assert.assertNull(read);
    }
```

# 测试出站消息

## 入站与出站

二者是类似的。

写入入站，对应读取入站。

写入出站，对应读取出站。

## 简介

测试出站消息的处理过程和刚才所看到的类似。

在下面的例子中，我们将会展示如何使用EmbeddedChannel 来测试一个编码器形式的ChannelOutboundHandler，编码器是一种将一种消息格式转换为另一种的组件。

你将在下一章中非常详细地学习编码器和解码器，所以现在我们只需要简单地提及我们正在测试的处理器—AbsIntegerEncoder，它是Netty MessageToMessageEncoder 的一个特殊化的实现，用于将负值整数转换为绝对值。

该示例将会按照下列方式工作：

1. 持有AbsIntegerEncoder 的EmbeddedChannel 将会以4 字节的负整数的形式写出站数据；

2. 编码器将从传入的ByteBuf 中读取每个负整数，并将会调用Math.abs()方法来获取其绝对值；

3. 编码器将会把每个负整数的绝对值写到ChannelPipeline 中。

图9-3 展示了该逻辑。

![测试出站消息](https://img-blog.csdn.net/2018093011123055?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2xqejIwMTY=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

## 绝对值整数编码器

```java
package com.github.houbb.netty.inaction.chap09;

import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToMessageEncoder;

import java.util.List;

/**
 * 整数绝对值编码器
 * @author binbin.hou
 * @date 2019/5/1
 * @since 0.0.1
 */
public class AbsIntegerEncoder extends MessageToMessageEncoder<ByteBuf> {
    @Override
    protected void encode(ChannelHandlerContext ctx, ByteBuf msg, List<Object> out) throws Exception {
        // 一个整形是4个字节
        while(msg.readableBytes() >= 4) {
            int value = msg.readInt();
            //将绝对值设置进入编码信息列表
            out.add(Math.abs(value));
        }
    }
}
```

## 测试代码

注意：此处写入的时候为 `writeInt()` 和编码器一一对应。

```java
package com.github.houbb.netty.inaction.chap09;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.embedded.EmbeddedChannel;
import org.junit.Assert;
import org.junit.Test;

/**
 * @author binbin.hou
 * @date 2019/5/1
 * @since 0.0.1
 */
public class AbsIntegerEncoderTest {

    @Test
    public void outTest() {
        //1. 初始化 buffer
        ByteBuf byteBuf = Unpooled.buffer();
        for(int i = 1; i < 10; i++) {
            // 写入负数
            byteBuf.writeInt(i*(-1));
        }

        //2. 初始化 channel
        // 通过 api 可以知道，channel 可以指定多个编码/解码器。优秀的设计！
        EmbeddedChannel embeddedChannel = new EmbeddedChannel(new AbsIntegerEncoder());
        Assert.assertTrue(embeddedChannel.writeOutbound(byteBuf));
        Assert.assertTrue(embeddedChannel.finish());

        //3. 读取测试
        for(int i = 1; i < 10; i++) {
            // 读取的时候，每4个字节会被转化为对应的int信息流
            int data = embeddedChannel.readOutbound();
            Assert.assertEquals(i, data);
        }
    }

}
```



# 参考资料

《Netty in Action》 P137

## api

### Unpooled

[Unpooled](https://netty.io/4.0/api/io/netty/buffer/Unpooled.html)

- public static ByteBuf buffer(int initialCapacity)

Creates a new big-endian Java heap buffer with the specified capacity, which expands its capacity boundlessly on demand. 

The new buffer's readerIndex and writerIndex are 0.

### ByteBuf

- public abstract ByteBuf retain()

Description copied from interface: ReferenceCounted Increases the reference count by 1.

- readSlice

```java
    /**
     * Returns a new slice of this buffer's sub-region starting at the current
     * {@code readerIndex} and increases the {@code readerIndex} by the size
     * of the new slice (= {@code length}).
     * <p>
     * Also be aware that this method will NOT call {@link #retain()} and so the
     * reference count will NOT be increased.
     *
     * @param length the size of the new slice
     *
     * @return the newly created slice
     *
     * @throws IndexOutOfBoundsException
     *         if {@code length} is greater than {@code this.readableBytes}
     */
    public abstract ByteBuf readSlice(int length);
```

### channel

- readInBound()

Return received data from this {@link Channel}

* any list
{:toc}