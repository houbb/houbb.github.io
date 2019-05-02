---
layout: post
title:  Netty SSL/TLS
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, web-safe, sh]
published: true
---

# Netty 的开箱即用

Netty 为许多通用协议提供了编解码器和处理器，几乎可以开箱即用，这减少了你在那些相当繁琐的事务上本来会花费的时间与精力。

在本章中，我们将探讨这些工具以及它们所带来的好处，其中包括Netty 对于SSL/TLS 和WebSocket 的支持，以及如何简单地通过数据压缩来压榨HTTP，以获取更好的性能。


# 通过SSL/TLS 保护Netty 应用程序

如今，数据隐私是一个非常值得关注的问题，作为开发人员，我们需要准备好应对它。

至少，我们应该熟悉像SSL和TLS这样的安全协议，它们层叠在其他协议之上，用以实现数据安全。

我们在访问安全网站时遇到过这些协议，但是它们也可用于其他不是基于HTTP的应用程序，如安全SMTP（SMTPS）邮件服务器甚至是关系型数据库系统。

为了支持SSL/TLS，Java 提供了javax.net.ssl 包，它的SSLContext 和SSLEngine类使得实现解密和加密相当简单直接。

Netty 通过一个名为 SslHandler 的 ChannelHandler 实现利用了这个API，其中 SslHandler 在内部使用 SSLEngine 来完成实际的工作。

## 数据流

图11-1 展示了使用 SslHandler 的数据流。

![SslHandler 的数据流](https://img-blog.csdnimg.cn/20181222154919784.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L21hamlwZW5nMTk5NTA2MTA=,size_16,color_FFFFFF,t_70)

## Netty 的OpenSSL/SSLEngine 实现

Netty 还提供了使用OpenSSL 工具包（www.openssl.org）的SSLEngine 实现。

这个OpenSsl-Engine 类提供了比JDK 提供的SSLEngine 实现更好的性能。

如果OpenSSL库可用，可以将Netty 应用程序（客户端和服务器）配置为默认使用OpenSslEngine。

如果不可用，Netty 将会回退到JDK 实现。

有关配置OpenSSL 支持的详细说明，参见Netty 文档：http://netty.io/wiki/forked-tomcat-native.html#wikih2-1。

注意，无论你使用JDK 的SSLEngine 还是使用Netty 的OpenSslEngine，SSL API 和数据流都
是一致的。

# SslHandler 类

在大多数情况下，SslHandler 将是ChannelPipeline 中的第一个ChannelHandler。

这确保了只有在所有其他的 ChannelHandler 将它们的逻辑应用到数据之后，才会进行加密。

## 接口

## API

SslHandler 具有一些有用的方法，如表11-1 所示。

例如，在握手阶段，两个节点将相互验证并且商定一种加密方式。

你可以通过配置SslHandler 来修改它的行为，或者在SSL/TLS握手一旦完成之后提供通知，握手阶段完成之后，所有的数据都将会被加密。

SSL/TLS 握手将会被自动执行。

```
方法名称                                 描 述
setHandshakeTimeout (long,TimeUnit)     设置和获取超时时间，超时之后，握手ChannelFuture 将会被通知失败
setHandshakeTimeoutMillis (long)
getHandshakeTimeoutMillis()

setCloseNotifyTimeout (long,TimeUnit)   设置和获取超时时间，超时之后，将会触发一个关闭通知并关闭连接。这也将会导致通知该ChannelFuture 失败
setCloseNotifyTimeoutMillis (long)
getCloseNotifyTimeoutMillis()

handshakeFuture()       返回一个在握手完成后将会得到通知的ChannelFuture。如果握手先前已经执行过了，则返回一个包含了先前的握手结果的ChannelFuture

close()                 发送close_notify 以请求关闭并销毁底层的SslEngine
close(ChannelPromise)
close(ChannelHandlerContext,ChannelPromise)
```

## 代码示例

代码清单11-1 展示了如何使用ChannelInitializer 来将 SslHandler 添加到 ChannelPipeline 中。

回想一下，ChannelInitializer 用于在 Channel 注册好时设置 ChannelPipeline。

### 代码

```java
import io.netty.channel.Channel;
import io.netty.channel.ChannelInitializer;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslHandler;

import javax.net.ssl.SSLEngine;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public class SslChannelInitializer extends ChannelInitializer<Channel> {

    /**
     * ssl 上下文
     */
    private final SslContext sslContext;

    /**
     * 是否开启 tls
     * 1. 如果设置为 true，第一条消息将不会被加密。
     */
    private final boolean startTls;

    public SslChannelInitializer(SslContext sslContext, boolean startTls) {
        this.sslContext = sslContext;
        this.startTls = startTls;
    }

    @Override
    protected void initChannel(Channel ch) throws Exception {
        // 为每一个 channel 新建一个 ssl engine
        SSLEngine sslEngine = sslContext.newEngine(ch.alloc());
        // 创建对应的 handler
        SslHandler sslHandler = new SslHandler(sslEngine, startTls);
        // 将 sslHandler 添加到 pipeline 的最开始
        ch.pipeline().addFirst(sslHandler);
    }
}
```

### 回顾

1. 将 SslHandler 设置为第一个 handler

2. 要懂得 SSL/TLS 协议，才能懂得这些工具的重要性。

# 拓展阅读

[SSL/TSL 详解](https://houbb.github.io/2018/09/26/ssl-tls)


# 个人收获

1. 一些安全协议本身比实现要重要的多。约定优于实现。

2. 过滤器模式是通用的，特别是在加密解密，类似于 mvc 也有这种 filter。

# 参考资料

《Netty in Action》 P161

* any list
{:toc}