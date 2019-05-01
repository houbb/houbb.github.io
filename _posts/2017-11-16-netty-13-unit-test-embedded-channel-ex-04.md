---
layout: post
title:  Netty-13-EmbeddedChannel 异常测试
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, test, sh]
published: true
---

# 为什么需要异常处理

有时候网络资源是比较珍贵的，可能是恶意攻击，可能是程序故障。

如果传入一个非常大的字节信息，我们一般应该直接拒绝掉这个请求，而不是消耗大量的资源去处理这个请求。

下面我们一起来写一个关于异常处理的例子。

他类似于前面的入站操作测试。

# 解码器与测试

## 入站解码器

```java
package com.github.houbb.netty.inaction.chap09;

import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.ByteToMessageDecoder;

import java.util.List;

/**
 * 限制长度的解码器
 * @author binbin.hou
 * @date 2019/5/1
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
            throw new RuntimeException("max byte limit is: " + maxLimitLength);
        }

        // 如果没有超出最大长度，则写入到输出列表
        out.add(in.readBytes(length));
    }

}
```

## 测试

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
public class FrameLimitLengthDecoderTest {

    @Test
    public void inTest() {
        //1. 初始化
        ByteBuf byteBuf = Unpooled.buffer();
        for(int i = 0; i < 10; i++) {
            byteBuf.writeByte(i);
        }

        //2. channel
        EmbeddedChannel embeddedChannel = new EmbeddedChannel(new FrameLimitLengthDecoder(3));
        Assert.assertTrue(embeddedChannel.writeInbound(byteBuf.readBytes(2)));

        // 超过最大限制长度，会异常
        try {
            embeddedChannel.writeInbound(byteBuf.readBytes(4));
            // 断言程序运行异常
            Assert.fail();
        } catch (Exception e) {
            e.printStackTrace();
        }

        //read check
        ByteBuf read = embeddedChannel.readInbound();
        Assert.assertEquals(2, read.capacity());
        read.release();


        read = embeddedChannel.readInbound();
        Assert.assertNull(read);
    }
}
```

异常堆栈信息如下：

```
io.netty.handler.codec.DecoderException: java.lang.RuntimeException: max byte limit is: 3
	at io.netty.handler.codec.ByteToMessageDecoder.callDecode(ByteToMessageDecoder.java:459)
	...
    ...
```

# 参考资料

《Netty in Action》 P150

* any list
{:toc}