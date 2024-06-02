---
layout: post
title:  从零手写实现 nginx-03-nginx 基于 Netty 实现
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, nginx-in-action, sh]
published: true
---


# 前言

大家好，我是老马。很高兴遇到你。

我们希望实现最简单的 http 服务信息，可以处理静态文件。

如果你想知道 servlet 如何处理的，可以参考我的另一个项目：

> 手写从零实现简易版 tomcat [minicat](https://github.com/houbb/minicat) 

## netty 相关

如果你对 netty 不是很熟悉，可以读一下

[Netty 权威指南-01-BIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-01-bio)

[Netty 权威指南-02-NIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-02-nio)

[Netty 权威指南-03-AIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-03-aio)

[Netty 权威指南-04-为什么选择 Netty？Netty 入门教程](https://houbb.github.io/2019/05/10/netty-definitive-gudie-04-why-netty)

## 手写 nginx 系列

如果你对 nginx 原理感兴趣，可以阅读：

[从零手写实现 nginx-01-为什么不能有 java 版本的 nginx?](https://houbb.github.io/2018/11/22/nginx-write-01-how-to)

[从零手写实现 nginx-02-nginx 的核心能力](https://houbb.github.io/2018/11/22/nginx-write-02-basic-http)

[从零手写实现 nginx-03-nginx 基于 Netty 实现](https://houbb.github.io/2018/11/22/nginx-write-03-basic-http-netty)

[从零手写实现 nginx-04-基于 netty http 出入参优化处理](https://houbb.github.io/2018/11/22/nginx-write-04-netty-http-optimize)

[从零手写实现 nginx-05-MIME类型（Multipurpose Internet Mail Extensions，多用途互联网邮件扩展类型）](https://houbb.github.io/2018/11/22/nginx-write-05-mime-type)

[从零手写实现 nginx-06-文件夹自动索引](https://houbb.github.io/2018/11/22/nginx-write-06-dir-list)

[从零手写实现 nginx-07-大文件下载](https://houbb.github.io/2018/11/22/nginx-write-07-big-file)

[从零手写实现 nginx-08-范围查询](https://houbb.github.io/2018/11/22/nginx-write-08-range)

[从零手写实现 nginx-09-文件压缩](https://houbb.github.io/2018/11/22/nginx-write-09-comparess)

[从零手写实现 nginx-10-sendfile 零拷贝](https://houbb.github.io/2018/11/22/nginx-write-10-sendfile)

[从零手写实现 nginx-11-file+range 合并](https://houbb.github.io/2018/11/22/nginx-write-11-file-and-range-merge)

[从零手写实现 nginx-12-keep-alive 连接复用](https://houbb.github.io/2018/11/22/nginx-write-12-keepalive)

[从零手写实现 nginx-13-nginx.conf 配置文件介绍](https://houbb.github.io/2018/11/22/nginx-write-13-nginx-conf-intro)

[从零手写实现 nginx-14-nginx.conf 和 hocon 格式有关系吗？](https://houbb.github.io/2018/11/22/nginx-write-14-nginx-conf-hocon)

[从零手写实现 nginx-15-nginx.conf 如何通过 java 解析处理？](https://houbb.github.io/2018/11/22/nginx-write-15-nginx-conf-parser)

[从零手写实现 nginx-16-nginx 支持配置多个 server](https://houbb.github.io/2018/11/22/nginx-write-16-nginx-conf-multi-server)

# 基本实现

## 思路

上一节我们实现了基于 serverSocket 的处理监听，那个性能毕竟一般。

这一次我们一起通过 netty 对代码进行改造升级。

## 核心实现

### 启动类

INginxServer 接口不变，我们加一个 netty 的实现类。

这里针对 EventLoopGroup 的配置我们暂时使用默认值，后续可以考虑可以让用户自定义。

```java
/**
 * netty 实现
 * 
 * @author 老马啸西风
 * @since 0.2.0
 */
public class NginxServerNetty implements INginxServer {

    private static final Log log = LogFactory.getLog(NginxServerNetty.class);


    private NginxConfig nginxConfig;

    @Override
    public void init(NginxConfig nginxConfig) {
        this.nginxConfig = nginxConfig;
    }

    @Override
    public void start() {
        // 服务器监听的端口号
        String host = InnerNetUtil.getHost();
        int port = nginxConfig.getHttpServerListen();

        EventLoopGroup bossGroup = new NioEventLoopGroup();
        //worker 线程池的数量默认为 CPU 核心数的两倍
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            serverBootstrap.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline().addLast(new NginxNettyServerHandler(nginxConfig));
                        }
                    })
                    .option(ChannelOption.SO_BACKLOG, 128)
                    .childOption(ChannelOption.SO_KEEPALIVE, true);

            // Bind and start to accept incoming connections.
            ChannelFuture future = serverBootstrap.bind(port).sync();

            log.info("[Nginx4j] listen on http://{}:{}", host, port);

            // Wait until the server socket is closed.
            future.channel().closeFuture().sync();
        } catch (InterruptedException e) {
            log.error("[Nginx4j] start meet ex", e);
            throw new Nginx4jException(e);
        } finally {
            workerGroup.shutdownGracefully();
            bossGroup.shutdownGracefully();

            log.info("[Nginx4j] shutdownGracefully", host, port);
        }
    }

}
```

### 处理类

核心的处理逻辑都在 NginxNettyServerHandler 这个类。

这里主要做 3 件事

1. 解析请求类

2. 根据请求获取对应的内容

3. 返回响应内容

```java
/**
 * netty 处理类
 * @author 老马啸西风
 * @since 0.2.0
 */
public class NginxNettyServerHandler extends ChannelInboundHandlerAdapter {

    private static final Log logger = LogFactory.getLog(NginxNettyServerHandler.class);

    private final NginxConfig nginxConfig;

    public NginxNettyServerHandler(NginxConfig nginxConfig) {
        this.nginxConfig = nginxConfig;
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        ByteBuf buf = (ByteBuf) msg;
        byte[] bytes = new byte[buf.readableBytes()];
        buf.readBytes(bytes);
        String requestString = new String(bytes, nginxConfig.getCharset());
        logger.info("[Nginx] channelRead requestString={}", requestString);

        // 请求体
        final NginxRequestConvertor requestConvertor = nginxConfig.getNginxRequestConvertor();
        NginxRequestInfoBo nginxRequestInfoBo = requestConvertor.convert(requestString, nginxConfig);

        // 分发
        final NginxRequestDispatch requestDispatch = nginxConfig.getNginxRequestDispatch();
        String respText = requestDispatch.dispatch(nginxRequestInfoBo, nginxConfig);

        // 结果响应
        ByteBuf responseBuf = Unpooled.copiedBuffer(respText.getBytes());
        ctx.writeAndFlush(responseBuf)
                .addListener(ChannelFutureListener.CLOSE); // Close the channel after sending the response
        logger.info("[Nginx] channelRead writeAndFlush DONE");
    }

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        ctx.flush();
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        logger.error("[Nginx] exceptionCaught", cause);
        ctx.close();
    }

}
```

其中请求的解析为对象，便于后续开发中使用。

分发处理只是加了一层抽象，整体实现和上一节类似。

感兴趣可以[阅读源码](https://github.com/houbb/nginx4j)。

# 小结

本节我们使用 netty 大幅度提升一下响应性能。

到这里我们实现了一个简单的 http 服务器，当然这是远远不够的。

后续我们会继续一起实现更多的 nginx 特性。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

# 参考资料

https://nginx.org/en/

* any list
{:toc}