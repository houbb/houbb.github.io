---
layout: post
title:  Netty-12-DatagramChannel UDP 无连接协议
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, sh]
published: true
---

# 引导 DatagramChannel

前面的引导代码示例使用的都是基于TCP 协议的SocketChannel，但是Bootstrap 类也可以被用于无连接的协议。

为此，Netty 提供了各种 DatagramChannel 的实现。

唯一区别就是，不再调用 connect() 方法，而是只调用 bind() 方法，

## 代码示例

如代码清单8-8 所示。

```java
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.oio.OioEventLoopGroup;
import io.netty.channel.socket.DatagramChannel;
import io.netty.channel.socket.DatagramPacket;
import io.netty.channel.socket.oio.OioDatagramChannel;

/**
 * @author binbin.hou
 * @date 2019/4/30
 * @since 0.0.1
 */
public class DatagramBootstrap {

    public static void main(String[] args) {
        Bootstrap bootstrap = new Bootstrap();
        bootstrap.group(new OioEventLoopGroup())
                .channel(OioDatagramChannel.class)
                .handler(new SimpleChannelInboundHandler<DatagramPacket>() {
                    @Override
                    protected void channelRead0(ChannelHandlerContext ctx, DatagramPacket msg) throws Exception {
                        //do sth with msg
                    }
                });

        // 直接连接
        ChannelFuture channelFuture = bootstrap.bind(0).syncUninterruptibly();
        channelFuture.addListener(new ChannelFutureListener() {
            @Override
            public void operationComplete(ChannelFuture future) throws Exception {
                if(future.isSuccess()) {
                    System.out.println("success");
                } else {
                    future.cause().printStackTrace();
                }
            }
        });

    }
}
```

# 个人收获

1. 一切的原理就是 udp/tcp 协议。知道原理是最好的方式，万变不离其宗。

# 参考资料

《Netty in Action》 P128

* any list
{:toc}