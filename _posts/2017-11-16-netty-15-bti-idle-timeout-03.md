---
layout: post
title:  Netty 空闲的连接和超时
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, http, sh]
published: true
---

# 空闲的连接和超时

## 连接管理

到目前为止，我们的讨论都集中在Netty 通过专门的编解码器和处理器对HTTP 的变型HTTPS 和WebSocket 的支持上。

只要你有效地管理你的网络资源，这些技术就可以使得你的应用程序更加高效、易用和安全。

所以，让我们一起来探讨下首先需要关注的——连接管理吧。

## 核心 API

检测空闲连接以及超时对于及时释放资源来说是至关重要的。

由于这是一项常见的任务，Netty 特地为它提供了几个ChannelHandler 实现。

表11-4 给出了它们的概述。

- IdleStateHandler

当连接空闲时间太长时，将会触发一个 IdleStateEvent 事件。

然后，你可以通过在你的ChannelInboundHandler 中重写userEventTriggered()方法来处理该IdleStateEvent 事件

- ReadTimeoutHandler

如果在指定的时间间隔内没有收到任何的入站数据，则抛出一个ReadTimeoutException 并关闭对应的Channel。

可以通过重写你的 ChannelHandler 中的exceptionCaught()方法来检测该ReadTimeoutException

- WriteTimeoutHandler

如果在指定的时间间隔内没有任何出站数据写入，则抛出一个Write-TimeoutException 并关闭对应的Channel。

可以通过重写你的 ChannelHandler 的 exceptionCaught() 方法检测该 WriteTimeoutException

## 示例代码

让我们仔细看看在实践中使用得最多的IdleStateHandler 吧。

代码清单11-7 展示了当使用通常的发送心跳消息到远程节点的方法时，如果在60 秒之内没有接收或者发送任何的数据，

我们将如何得到通知；如果没有响应，则连接会被关闭。

写之前的理解：

1. 添加一个 IdleStateHandler，然后添加我们相应的心跳处理

2. 心跳触发时发送消息，失败时关闭连接。

```java
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.*;
import io.netty.handler.timeout.IdleStateEvent;
import io.netty.handler.timeout.IdleStateHandler;

import java.nio.charset.Charset;
import java.util.concurrent.TimeUnit;

/**
 * 心跳检测
 * @author binbin.hou
 * @since 1.0.0
 */
public class IdleHeartBeatChannelInit extends ChannelInitializer<Channel> {
    @Override
    protected void initChannel(Channel ch) throws Exception {
        ch.pipeline().addLast(new IdleStateHandler(0, 0, 60, TimeUnit.SECONDS))
                .addLast(new HeartBeatHandler());
    }

    /**
     * 心跳机制实现类
     */
    class HeartBeatHandler extends ChannelInboundHandlerAdapter {
        /**
         * 永不释放的心跳 buffer
         */
        private final ByteBuf HEART_BEAT_SEQ = Unpooled.unreleasableBuffer(
                Unpooled.copiedBuffer("heartbeat", Charset.defaultCharset())
        );

        @Override
        public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
            if(evt instanceof IdleStateEvent) {
                // 处理 idle 事件，发送心跳包
                ctx.writeAndFlush(HEART_BEAT_SEQ.duplicate())
                        // 如果遇到异常，则关闭当前连接
                        .addListener(ChannelFutureListener.CLOSE_ON_FAILURE);
            } else {
                super.userEventTriggered(ctx, evt);
            }
        }
    }
}
```

这个示例演示了如何使用IdleStateHandler 来测试远程节点是否仍然还活着，并且在它失活时通过关闭连接来释放资源。

如果连接超过60 秒没有接收或者发送任何的数据，那么IdleStateHandler 将会使用一个IdleStateEvent 事件来调用fireUserEventTriggered()方法。

HeartbeatHandler 实现了userEventTriggered()方法，如果这个方法检测到IdleStateEvent 事件，它将会发送心跳消息，并且添加一个将在发送操作失败时关闭该连接的ChannelFutureListener 。

# 参考资料

《Netty in Action》 P161

* any list
{:toc}