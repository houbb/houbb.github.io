---
layout: post
title: Netty 权威指南-07-Netty 实战：如何实现自定义协议消息推送？
date:  2019-5-10 11:08:59 +0800
categories: [Netty]
tags: [netty, sh]
published: true
---

# 推送业务

## 思路

消息推送一般的思路就是： 

1.轮询（Pull）客户端定时的去询问服务器是否有新消息需要下发；确点很明显Android后台不停的访问网络费电还浪费流量。

2.推送（Push）服务端有新消息立即发送给客户端，这就没有时间的延迟，消息及时到达。

当时需求过来之后就首先考虑的这两个，开发的角度Pull实现起来简单省事，但从用户来说省电和省流量才是主要的，所以最后选用Push。

客户端与服务端使用长连接，客户端定时向服务端发送心跳包维持长连接。

## 心跳周期

那么这里会有一个问题，心跳包的周期多少才合理？

由于移动无线网络的特点，推送服务的心跳周期并不能设置的太长，否则长连接会被释放，造成频繁的客户端重连，但是也不能设置太短，否则在当前缺乏统一心跳框架的机制下很容易导致信令风暴（例如微信心跳信令风暴问题）。

具体的心跳周期并没有统一的标准，180S也许是个不错的选择，微信为300S。

# 代码实现

## 公共代码

- PushMsg.java

定义消息结构体：

```java
public class PushMsg implements Serializable {

    private static final long serialVersionUID = 4631960168572447268L;

    public static PushMsg newInstance() {
        return new PushMsg();
    }

    /**
     * 推送类型
     */
    private PushTypeEnum pushType;

    /**
     * 推送消息
     */
    private String info;

    public PushTypeEnum pushType() {
        return pushType;
    }

    public PushMsg pushType(PushTypeEnum pushType) {
        this.pushType = pushType;
        return this;
    }

    public String info() {
        return info;
    }

    public PushMsg info(String info) {
        this.info = info;
        return this;
    }

    @Override
    public String toString() {
        return "PushMsg{" +
                "pushType=" + pushType +
                ", info='" + info + '\'' +
                '}';
    }
}
```

- PushTypeEnum.java

定义各种消息推送的类型枚举

```java
public enum PushTypeEnum {

    /**
     * 请求连接
     */
    CONNECT_REQ,
    /**
     * 连接成功
     */
    CONNECT_SUCCESS,
    /**
     * 连接失败
     */
    CONNECT_FAIL,
    /**
     * 心跳请求
     */
    HEARTBEAT_REQ,
    /**
     * 心跳响应
     */
    HEARTBEAT_RESP,
    /**
     * 消息推送
     */
    MSG_PUSH;

}
```

- ChannelMaps.java

用于存放 channel 信息，此处使用 channel.id() 对应的长文本，作为 key。

因为 id 长文本是唯一的。

```java
public class ChannelMaps {

    private ChannelMaps(){}

    private static final Map<String, Channel> CHANNEL_MAP = new HashMap<>();

    public static void addChannel(Channel channel) {
        CHANNEL_MAP.put(channel.id().asLongText(), channel);
    }

    public static void removeChannel(Channel channel) {
        CHANNEL_MAP.remove(channel.id().asLongText());
    }

    public static Collection<Channel> getAllChannel() {
        return CHANNEL_MAP.values();
    }

}
```

## 服务端

- PushServer.java

服务端核心启动代码。

push() 负责向客户端推送消息。

```java
public class PushServer {

    public static void main(String[] args) {
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        EventLoopGroup bossGroup = new NioEventLoopGroup();

        try {
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            ChannelFuture channelFuture = serverBootstrap.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .option(ChannelOption.SO_BACKLOG, 100)
                    .handler(new LoggingHandler(LogLevel.INFO))
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline().addLast(
                                new ObjectEncoder(),
                                new ObjectDecoder(ClassResolvers.cacheDisabled(null)),
                                new ReadTimeoutHandler(100),
                                new ConnectServerHandler(),
                                new HeartBeatServerHandler()
                            );
                        }
                    })
                    .bind(8888)
                    .syncUninterruptibly();

            System.out.println("server start on 8888...");

            // 这里可以推送信息
            // 需要将 channel 有效信息存储在 map 中。
            push();

            channelFuture.channel().closeFuture().syncUninterruptibly();
        } finally {
            workerGroup.shutdownGracefully();
            bossGroup.shutdownGracefully();
        }
    }

    /**
     * 推送到所有客户端
     */
    private static void push() {
        try {
            while (ChannelMaps.getAllChannel().isEmpty()) {
                TimeUnit.SECONDS.sleep(5);
                // 循环等待，直到有客户端加入。
            }

            System.out.println("Start push...");
            PushMsg pushMsg = new PushMsg();
            pushMsg.pushType(PushTypeEnum.MSG_PUSH).info("hello client");

            // 循环所有的客户端，发送消息
            for(Channel channel : ChannelMaps.getAllChannel()) {
                System.out.println("start push client channel : " + channel.id().asLongText());
                channel.writeAndFlush(pushMsg);
            }
            System.out.println("End push...");
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

}
```

- ConnectServerHandler.java

这里是对连接相关的处理。

我们这里模拟了 auth 验证，如果用户输入的信息为 "天王盖地虎"，我们才会认为认证成功。

```java
public class ConnectServerHandler extends SimpleChannelInboundHandler<PushMsg> {

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, PushMsg msg) throws Exception {
        //如果是连接信息，判断是否是黑名单ip
        if(PushTypeEnum.CONNECT_REQ.equals(msg.pushType())){
            PushMsg response = new PushMsg();

            // 口号判断
            if("天王盖地虎".equals(msg.info())) {
                response.pushType(PushTypeEnum.CONNECT_SUCCESS).info("宝塔镇河妖");
            } else {
                response.pushType(PushTypeEnum.CONNECT_FAIL).info("有内鬼，终止交易");
            }
            ctx.writeAndFlush(response);
        }else{
            ctx.fireChannelRead(msg);
        }
    }

}
```

- HeartBeatServerHandler.java

服务端的心跳包处理。

如果接收到心跳包信息，则直接响应 pong。

并且将发送 ping 的客户端，认为是活着的，放在 channel 列表中

```java
public class HeartBeatServerHandler extends SimpleChannelInboundHandler<PushMsg> {

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, PushMsg msg) throws Exception {
        //如果是心跳包ping，则返回pong
        if(PushTypeEnum.HEARTBEAT_REQ.equals(msg.pushType())){
            System.out.println("Received client heart beat : " + msg.info());
            // 如果接收到心跳，则认为连接成功。
            ChannelMaps.addChannel(ctx.channel());

            // 返回响应
            PushMsg response = new PushMsg();
            response.pushType(PushTypeEnum.HEARTBEAT_RESP).info("pong");
            ctx.writeAndFlush(response);
        }else{
            ctx.fireChannelRead(msg);
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        // 如果接收到心跳异常，则直接移除当前连接
        ChannelMaps.removeChannel(ctx.channel());

        ctx.close();
    }
}
```

## 客户端

- PushClient.java

客户端启动代码如下：

```java
public class PushClient {

    public static void main(String[] args) {
        EventLoopGroup workGroup = new NioEventLoopGroup();

        try {
            Bootstrap bootstrap = new Bootstrap();
            ChannelFuture channelFuture = bootstrap
                    .group(workGroup)
                    .channel(NioSocketChannel.class)
                    .option(ChannelOption.SO_KEEPALIVE, true)
                    .handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            ChannelPipeline p = ch.pipeline();
                            p.addLast(new IdleStateHandler(20, 10, 0));
                            p.addLast(new ObjectEncoder());
                            p.addLast(new ObjectDecoder(ClassResolvers.cacheDisabled(null)));
                            p.addLast(new ReadTimeoutHandler(100));
                            p.addLast(new ConnectClientHandler());
                            p.addLast(new HeatBeatClientHandler());
                            p.addLast(new PushClientHandler());
                        }
                    })
                    .connect("localhost", 8888)
                    .syncUninterruptibly();

            final String id = channelFuture.channel().id().asLongText();
            System.out.println("client started: " + id);
            channelFuture.channel().closeFuture().syncUninterruptibly();
            System.out.println("client closed: " + id);
        } finally {
            workGroup.shutdownGracefully();
            // 这里可以进行重登尝试
        }
    }

}
```

- ConnectClientHandler.java

连接处理类信息。

会在 channel 连接上服务端之后，发送一个请求信息。

并且输出客户端对应的响应信息。

```java
public class ConnectClientHandler extends SimpleChannelInboundHandler<PushMsg> {

    // 三次握手完成，发送连接请求
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        PushMsg pushMsg = PushMsg.newInstance().pushType(PushTypeEnum.CONNECT_REQ).info("天王盖地虎");
        ctx.writeAndFlush(pushMsg);
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, PushMsg msg) throws Exception {
        // 判断是否验证成功
        if(PushTypeEnum.CONNECT_SUCCESS.equals(msg.pushType())) {
            // 发送心跳
            System.out.println("连接成功，服务端信息: " + msg.info());
            ctx.fireChannelRead(msg);
        } else if(PushTypeEnum.CONNECT_FAIL.equals(msg.pushType())) {
            System.err.println("连接失败");
            ctx.close();
        } else {
            ctx.fireChannelRead(msg);
        }
    }

}
```

- HeatBeatClientHandler.java

心跳包处理信息。

登录成功的 client 端，会定时 30s 发送一次心跳请求到服务端。

此处也会处理心跳的响应信息。

```java
public class HeatBeatClientHandler extends SimpleChannelInboundHandler<PushMsg> {

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, PushMsg msg) throws Exception {
        // 判断是否验证成功，则循环发送心跳包
        if(PushTypeEnum.CONNECT_SUCCESS.equals(msg.pushType())) {
            System.out.println("连接成功，开始发送心跳包。。。");
            //30s 发送一次心跳
            ctx.executor().scheduleAtFixedRate(
                    new HeatBeatClientTask(ctx), 0, 30, TimeUnit.SECONDS);
        } else if(PushTypeEnum.HEARTBEAT_RESP.equals(msg.pushType())) {
            // 处理响应信息
            System.out.println("接收到 server 响应: " + msg.info());
        } else {
            ctx.fireChannelRead(msg);
        }
    }

    private class HeatBeatClientTask implements Runnable {

        private ChannelHandlerContext ctx;

        public HeatBeatClientTask(ChannelHandlerContext ctx) {
            this.ctx = ctx;
        }

        @Override
        public void run() {
            ctx.writeAndFlush(PushMsg.newInstance().pushType(PushTypeEnum.HEARTBEAT_REQ).info("hello client"));
        }

    }

}
```

- PushClientHandler.java

对于服务端的消息，进行处理。

此处非常简单，直接做一个输出即可，实际业务可以根据自己的需求进行处理。

```java
public class PushClientHandler extends SimpleChannelInboundHandler<PushMsg> {

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, PushMsg msg) throws Exception {
        //TODO: 你可以在这里实现更加复杂的逻辑。
        System.out.println("Received info from server: " + msg);
    }

}
```

## 测试验证

### 启动服务端

- 服务端日志

```
九月 29, 2019 4:57:08 下午 io.netty.handler.logging.LoggingHandler channelRegistered
信息: [id: 0xe899a8b1] REGISTERED
九月 29, 2019 4:57:08 下午 io.netty.handler.logging.LoggingHandler bind
信息: [id: 0xe899a8b1] BIND: 0.0.0.0/0.0.0.0:8888
server start on 8888...
九月 29, 2019 4:57:08 下午 io.netty.handler.logging.LoggingHandler channelActive
信息: [id: 0xe899a8b1, L:/0:0:0:0:0:0:0:0:8888] ACTIVE
九月 29, 2019 4:57:17 下午 io.netty.handler.logging.LoggingHandler channelRead
信息: [id: 0xe899a8b1, L:/0:0:0:0:0:0:0:0:8888] READ: [id: 0xcd6512eb, L:/127.0.0.1:8888 - R:/127.0.0.1:57451]
九月 29, 2019 4:57:17 下午 io.netty.handler.logging.LoggingHandler channelReadComplete
信息: [id: 0xe899a8b1, L:/0:0:0:0:0:0:0:0:8888] READ COMPLETE
```

### 启动客户端

- 服务端日志

```
Received client heart beat : hello client
Start push...
start push client channel : 00155dfffe2b601d-00004658-00000001-2d40d35bac46078d-cd6512eb
End push...
```

- 客户端日志

```
client started: 00155dfffe2b601d-0000124c-00000000-d9cc2eabac460700-140980b9
连接成功，服务端信息: 宝塔镇河妖
连接成功，开始发送心跳包。。。
接收到 server 响应: pong
Received info from server: PushMsg{pushType=MSG_PUSH, info='hello client'}
```

### 后续心跳信息

- 服务端

```
Received client heart beat : hello client
Received client heart beat : hello client
Received client heart beat : hello client
Received client heart beat : hello client
Received client heart beat : hello client
Received client heart beat : hello client
Received client heart beat : hello client
```

- 客户端

```
接收到 server 响应: pong
接收到 server 响应: pong
接收到 server 响应: pong
接收到 server 响应: pong
接收到 server 响应: pong
接收到 server 响应: pong
接收到 server 响应: pong
```

# 小结

实际上掌握这个能力，就可以实现很多想要实现的功能。

比如最常见的配置中心，就是这种推拉结合的策略。也可以自己从零写一个 RPC 框架之类的。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 拓展阅读

[面试经典：linux 的 5 种 I/O 模型详解](https://www.toutiao.com/item/6908238524617785863/)

[java 中的 BIO/NIO/AIO 详解](https://www.toutiao.com/item/6908281789907730947/)

[为什么选择 Netty？Netty 入门教程](https://www.toutiao.com/item/6908298138885603844/)

[netty 解决拆包和粘包问题的 4 种方法，你会几种？](https://www.toutiao.com/item/6908695608308154894/)

[netty 服务端启动流程源码详解](https://www.toutiao.com/item/6909058613290009092/)

[netty 客户端启动流程及源码详解](https://www.toutiao.com/item/6909457669397168644/)

[Netty 实战：如何实现文件服务器？](https://www.toutiao.com/item/6909824595721830924/)

[Netty 实战：如何实现 HTTP 服务器？](https://www.toutiao.com/item/6909827419687895555/)

# 参考资料

《Netty 权威指南》

- other

[Netty 系列之 Netty 百万级推送服务设计要点](https://www.infoq.cn/article/netty-million-level-push-service-design-points/)

[使用netty自定义推送](https://blog.csdn.net/yinbucheng/article/details/77094973)

[使用netty实现网络推送](https://blog.csdn.net/yinbucheng/article/details/77076302)

[使用netty开发私有栈协议](https://blog.csdn.net/yinbucheng/article/details/77439878)

* any list
{:toc}