---
layout: post
title: Netty 权威指南-08-netty 客户端启动流程及源码详解
date:  2019-5-10 11:08:59 +0800
categories: [Netty]
tags: [netty, sh]
published: true
---

# Boostrap

上一节我们学习了 [netty 服务端启动流程源码详解](https://www.toutiao.com/i6909058613290009092/)，这一节来一起学习下客户端的启动流程。

客户端可以通过 Boostrap 引导创建，时序图如下：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1222/204800_9be729ae_508704.png "client-seq.png")

## 启动实例

为了便于大家理解，这里给出一个常用的客户端启动例子：

```java
import com.ryo.netty.guide.time.TimeClientHandler;
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;


/**
 * 抽象 server
 * @author 老马啸西风
 * @version 1.0.0
 */
public abstract class AbstractClient {

    protected abstract ChannelHandler newChannelHandler();

    // 启动的端口号
    private int port;

    public AbstractClient(int port) {
        this.port = port;
    }

    public void run() throws Exception {

        // 启动的 ip 地址    
        final String host = "127.0.0.1";

        // 客户端启动的线程池
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            // 新建引导类
            Bootstrap b = new Bootstrap(); // (1)
            // 通过 group 指定对应的线程组
            b.group(workerGroup); // (2)
            // 指定对应的 channel 
            b.channel(NioSocketChannel.class); // (3)
            // 客户端的 tcp 参数设置
            b.option(ChannelOption.SO_KEEPALIVE, true); // (4)
            // 指定对应的 handler
            b.handler(new ChannelInitializer<SocketChannel>() {
                @Override
                public void initChannel(SocketChannel ch) throws Exception {
                    ch.pipeline().addLast(new TimeClientHandler());
                }
            });

            // 启动客户端
            ChannelFuture f = b.connect(host, port).sync(); // (5)

            // 等待连接关闭
            f.channel().closeFuture().sync();
        } finally {
            workerGroup.shutdownGracefully();
        }
    }

}
```

# 源码分析

## group 

我们可以通过 group 方法指定对应的线程组。

方法定义如下：

```java
public B group(EventLoopGroup group) {
    if (group == null) {
        throw new NullPointerException("group");
    }
    if (this.group != null) {
        throw new IllegalStateException("group set already");
    }
    this.group = group;
    return self();
}
```

## channel

这里实际上和服务端类似，实现如下：

```java
/**
 * The {@link Class} which is used to create {@link Channel} instances from.
 * You either use this or {@link #channelFactory(io.netty.channel.ChannelFactory)} if your
 * {@link Channel} implementation has no no-args constructor.
 */
public B channel(Class<? extends C> channelClass) {
    if (channelClass == null) {
        throw new NullPointerException("channelClass");
    }
    return channelFactory(new ReflectiveChannelFactory<C>(channelClass));
}
```

此处一般使用的 channel 类是 NioSocketChannel。

## option TCP 参数设置

netty 支持通过 option 方法，快捷的指定各种连接参数。

实现如下：

```java
/**
 * Allow to specify a {@link ChannelOption} which is used for the {@link Channel} instances once they got
 * created. Use a value of {@code null} to remove a previous set {@link ChannelOption}.
 */
public <T> B option(ChannelOption<T> option, T value) {
    if (option == null) {
        throw new NullPointerException("option");
    }
    if (value == null) {
        synchronized (options) {
            options.remove(option);
        }
    } else {
        synchronized (options) {
            options.put(option, value);
        }
    }
    return self();
}
```

可以发现这里通过 synchronized 锁住 options，保证并发安全性。

### 常见的 TCP 参数

下面的常见配置可以在 `ChannelOption` 中找到，实际上都是 ChannelOption 的一个具体实现类，这样后期拓展更加灵活。

- SO_TIMEOUT

控制读取操作将阻塞多少毫秒，如果返回值为0，计时器就被禁止了，该线程将被无限期阻塞。

- SO_SNDBUF

套接字使用的发送缓冲区大小

- SO_RCVBUF

套接字使用的接收缓冲区大小

- SO_REUSEADDR

是否允许重用端口。默认值与系统相关。

- CONNECT_TIMEOUT_MILLIS

客户端连接超时时间，原生NIO不提供该功能，Netty使用的是自定义连接超时定时器检测和超时控制

- TCP_NODELAY

是否使用Nagle算法，设置为true关闭Nagle算法。

如果是时延敏感型的应用，建议关闭。

Nagle算法将小的碎片数据连接成更大的报文来最小化所发送的报文的数量。

- SO_KEEPALIVE

是否使用TCP的心跳机制。

当设置该选项以后，如果在两小时内没有数据的通信时，TCP会自动发送一个活动探测数据报文。

建议：心跳机制由应用层自己实现；

## 设置 Handler

可以通过 handler 设置对应的处理类。

```java
/**
 * the {@link ChannelHandler} to use for serving the requests.
 */
public B handler(ChannelHandler handler) {
    if (handler == null) {
        throw new NullPointerException("handler");
    }
    this.handler = handler;
    return self();
}
```

netty 设计的最巧妙的地方在于，如果有多个 handler，设置的时候依然可以保持接口不变。

就像上面例子中的 `ChannelInitializer`，这个类依然是 ChannelHandler 的子类。


这个类会在 TCP 链接成功之后，调用 initChannel 方法，用于设置用户设置的 Handler。

```java
@Override
public final void channelRegistered(ChannelHandlerContext ctx) throws Exception {
    // Normally this method will never be called as handlerAdded(...) should call initChannel(...) and remove
    // the handler.
    if (initChannel(ctx)) {
        // we called initChannel(...) so we need to call now pipeline.fireChannelRegistered() to ensure we not
        // miss an event.
        ctx.pipeline().fireChannelRegistered();
    } else {
        // Called initChannel(...) before which is the expected behavior, so just forward the event.
        ctx.fireChannelRegistered();
    }
}
```

## connect 客户端发起连接

当这些配置都指定完成之后，就可以通过 connet 方法连接到指定的服务端了。

connet 的方法看起来也不难：

```java
/**
 * Connect a {@link Channel} to the remote peer.
 */
public ChannelFuture connect(String inetHost, int inetPort) {
    return connect(InetSocketAddress.createUnresolved(inetHost, inetPort));
}
```

接下来就和服务单有些类似了，封装了较多的内容：

```java
private ChannelFuture doResolveAndConnect(final SocketAddress remoteAddress, final SocketAddress localAddress) {
    final ChannelFuture regFuture = initAndRegister();
    final Channel channel = regFuture.channel();
    if (regFuture.isDone()) {
        if (!regFuture.isSuccess()) {
            return regFuture;
        }
        return doResolveAndConnect0(channel, remoteAddress, localAddress, channel.newPromise());
    } 
    // 省略
}
```

### 初始化并且注册

初始化方法：

```java
final ChannelFuture initAndRegister() {
    Channel channel = null;
    try {
        // 新建一个 channel 
        channel = channelFactory.newChannel();
        // 初始化 channel
        init(channel);
    } catch (Throwable t) {
        if (channel != null) {
            // channel can be null if newChannel crashed (eg SocketException("too many open files"))
            channel.unsafe().closeForcibly();
        }
        // as the Channel is not registered yet we need to force the usage of the GlobalEventExecutor
        return new DefaultChannelPromise(channel, GlobalEventExecutor.INSTANCE).setFailure(t);
    }

    // 注册对应的 channel 
    ChannelFuture regFuture = config().group().register(channel);
    if (regFuture.cause() != null) {
        if (channel.isRegistered()) {
            channel.close();
        } else {
            channel.unsafe().closeForcibly();
        }
    }
    return regFuture;
}
```

Bootstrap 初始化的实现如下：

```java
void init(Channel channel) throws Exception {
    ChannelPipeline p = channel.pipeline();
    p.addLast(config.handler());
    final Map<ChannelOption<?>, Object> options = options0();
    synchronized (options) {
        setChannelOptions(channel, options, logger);
    }
    final Map<AttributeKey<?>, Object> attrs = attrs0();
    synchronized (attrs) {
        for (Entry<AttributeKey<?>, Object> e: attrs.entrySet()) {
            channel.attr((AttributeKey<Object>) e.getKey()).set(e.getValue());
        }
    }
}
```

可以看出主要是设置 options 和 attrs，都通过 synchronized 保证了并发安全性。 

初始化 channel 完成之后，就是将其设置到 selector 上，这个感觉和服务端非常类似。

### 发起 TCP 请求

链路创建成功以后，发起异步的 tcp 请求。

```java
private static void doConnect(
        final SocketAddress remoteAddress, final SocketAddress localAddress, final ChannelPromise connectPromise) {
    // This method is invoked before channelRegistered() is triggered.  Give user handlers a chance to set up
    // the pipeline in its channelRegistered() implementation.
    final Channel channel = connectPromise.channel();
    channel.eventLoop().execute(new Runnable() {
        @Override
        public void run() {
            if (localAddress == null) {
                channel.connect(remoteAddress, connectPromise);
            } else {
                channel.connect(remoteAddress, localAddress, connectPromise);
            }
            connectPromise.addListener(ChannelFutureListener.CLOSE_ON_FAILURE);
        }
    });
}
```

这里 channel.eventLoop() 获取到一个 EventLoop，然后异步执行连接。


### 超时处理

当然，所有的网络通讯中都应该有一个超时时间。

我们可以通过指定 option 的 CONNECT_TIMEOUT_MILLIS 属性来指定连接到服务端的超时时间。

这里配置实际上在 `AbstractNioChannel` 类中会使用到：

```java
// Schedule connect timeout.
int connectTimeoutMillis = config().getConnectTimeoutMillis();
if (connectTimeoutMillis > 0) {
    connectTimeoutFuture = eventLoop().schedule(new Runnable() {
        @Override
        public void run() {
            ChannelPromise connectPromise = AbstractNioChannel.this.connectPromise;
            if (connectPromise != null && !connectPromise.isDone()
                    && connectPromise.tryFailure(new ConnectTimeoutException(
                            "connection timed out: " + remoteAddress))) {
                close(voidPromise());
            }
        }
    }, connectTimeoutMillis, TimeUnit.MILLISECONDS);
}
```

这里是一个定时任务，超时的时候就会抛出对应的异常信息 ConnectTimeoutException

# 小结

这一节我们一起学习了 netty 客户端的启动流程，简单分析了对应的实现源码。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

《Netty 权威指南》

[Netty框架 - TCP参数设置ChannelOption](https://blog.csdn.net/okxuewei/article/details/104862067)

* any list
{:toc}