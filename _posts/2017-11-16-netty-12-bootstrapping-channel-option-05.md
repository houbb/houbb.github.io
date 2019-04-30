---
layout: post
title:  Netty-12-ChannelOption
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, sh]
published: true
---

# 使用 Netty 的 ChannelOption 和属性

在每个 Channel 创建时都手动配置它可能会变得相当乏味。

幸运的是，你不必这样做。相反，你可以使用 option() 方法来将 ChannelOption 应用到引导。

你所提供的值将会被自动应用到引导所创建的所有 Channel。

可用的 ChannelOption 包括了底层连接的详细信息，如 keep-alive 或者超时属性以及缓冲区设置。

Netty 应用程序通常与组织的专有软件集成在一起，而像Channel 这样的组件可能甚至会在正常的Netty 生命周期之外被使用。
 
在某些常用的属性和数据不可用时，Netty 提供了 AttributeMap 抽象（一个由Channel 和引导类提供的集合）以及AttributeKey<T>（一个用于插入和获取属性值的泛型类）。

使用这些工具，便可以安全地将任何类型的数据项与客户端和服务器Channel（包含ServerChannel 的子Channel）相关联了。

例如，考虑一个用于跟踪用户和Channel 之间的关系的服务器应用程序。这可以通过将用户的ID 存储为Channel 的一个属性来完成。类似的技术可以被用来基于用户的ID 将消息路由给用户，或者关闭活动较少的Channel。

## 代码示例

代码清单 8-7 展示了可以如何使用 ChannelOption 来配置 Channel，以及如果使用属性来存储整型值。

```java
package com.github.houbb.netty.inaction.bootstrap;

import io.netty.bootstrap.Bootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.util.AttributeKey;

import java.net.InetSocketAddress;

/**
 * @author binbin.hou
 * @date 2019/4/30
 * @since 1.0.0
 */
public class ChannelOptionDemo {

    public static void main(String[] args) {
        // 统一为所有的 channel 设置属性
        final AttributeKey<Integer> attributeKey = AttributeKey.newInstance("id");

        Bootstrap bootstrap = new Bootstrap();
        bootstrap.group(new NioEventLoopGroup())
                .channel(NioSocketChannel.class)
                .handler(new SimpleChannelInboundHandler<ByteBuf>() {
                    @Override
                    public void channelRegistered(ChannelHandlerContext ctx) throws Exception {
                        Integer id = ctx.channel().attr(attributeKey).get();
                        // do sth with id
                        System.out.println("key.id="+id);
                    }
                    @Override
                    protected void channelRead0(ChannelHandlerContext ctx, ByteBuf msg) throws Exception {
                        System.out.println("read");
                    }
                });

        // 设置 option
        bootstrap.option(ChannelOption.SO_KEEPALIVE, true)
                .option(ChannelOption.SO_TIMEOUT, 1000)
                .attr(attributeKey, 1024);


        ChannelFuture channelFuture = bootstrap.connect("www.manning.com", 80);
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
        channelFuture.syncUninterruptibly();
    }
}
```

- 日志

运行项目日志如下

```
key.id=1024
success
```

# 参考资料

《Netty in Action》 P128

* any list
{:toc}