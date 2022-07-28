---
layout: post
title:  Netty 源码学习-02-ServerBootstrap 服务端引导类
date:  2022-07-22 09:22:02 +0800
categories: [Netty]
tags: [netty, source-code, sh]
published: true
---

# 服务端启动

## netty 版本

不同版本的 Netty 实现可能会略有差异，此处版本为：

```xml
<dependency>
    <groupId>io.netty</groupId>
    <artifactId>netty-all</artifactId>
    <version>4.1.17.Final</version>
</dependency>
```


## 启动代码

为了便于代码的定位，我们首先从服务端的启动开始看。

```java
public class RpcServer extends Thread {

    //省略

    @Override
    public void run() {
        // 启动服务端
        log.info("RPC 服务开始启动服务端");

        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            serverBootstrap.group(workerGroup, bossGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<Channel>() {
                        @Override
                        protected void initChannel(Channel ch) throws Exception {
                            ch.pipeline().addLast(new RpcServerHandler());
                        }
                    })
                    // 这个参数影响的是还没有被accept 取出的连接
                    .option(ChannelOption.SO_BACKLOG, 128)
                    // 这个参数只是过一段时间内客户端没有响应，服务端会发送一个 ack 包，以判断客户端是否还活着。
                    .childOption(ChannelOption.SO_KEEPALIVE, true);

            // 绑定端口，开始接收进来的链接
            ChannelFuture channelFuture = serverBootstrap.bind(port).syncUninterruptibly();
            log.info("RPC 服务端启动完成，监听【" + port + "】端口");

            channelFuture.channel().closeFuture().syncUninterruptibly();
            log.info("RPC 服务端关闭完成");
        } catch (Exception e) {
            log.error("RPC 服务异常", e);
        } finally {
            workerGroup.shutdownGracefully();
            bossGroup.shutdownGracefully();
        }
    }

}
```

上一节内容，我们学习了 NioEventLoopGroup 相关的内容。

这一节，让我们一起学习一下 ServerBootstrap 引导类。

# AbstractBootstrap 抽象引导类

这个类作为引导类的基础父类。

## 基本属性

```java
public abstract class AbstractBootstrap<B extends AbstractBootstrap<B, C>, C extends Channel> implements Cloneable {

    // 线程池
    volatile EventLoopGroup group;

    // channel 工厂
    @SuppressWarnings("deprecation")
    private volatile ChannelFactory<? extends C> channelFactory;

    // socket 地址信息
    private volatile SocketAddress localAddress;

    // ChannelOption
    private final Map<ChannelOption<?>, Object> options = new LinkedHashMap<ChannelOption<?>, Object>();

    // 属性
    private final Map<AttributeKey<?>, Object> attrs = new LinkedHashMap<AttributeKey<?>, Object>();

    // handler
    private volatile ChannelHandler handler;

}
```

## 构造器

```java
AbstractBootstrap() {
    // Disallow extending from a different package.
}

// 引用自身，比较有趣
AbstractBootstrap(AbstractBootstrap<B, C> bootstrap) {
    group = bootstrap.group;
    channelFactory = bootstrap.channelFactory;
    handler = bootstrap.handler;
    localAddress = bootstrap.localAddress;

    // 同步加锁
    synchronized (bootstrap.options) {
        options.putAll(bootstrap.options);
    }
    // 同步加锁
    synchronized (bootstrap.attrs) {
        attrs.putAll(bootstrap.attrs);
    }
}
```

## 指定 group 线程池信息

```java
/**
 * The {@link EventLoopGroup} which is used to handle all the events for the to-be-created {@link Channel}
 */
public B group(EventLoopGroup group) {
    //check
    if (group == null) {
        throw new NullPointerException("group");
    }
    if (this.group != null) {
        throw new IllegalStateException("group set already");
    }
    // 设置
    this.group = group;

    // 返回自身
    return self();
}
```

其中返回自己，是一个基本方法：

```java
@SuppressWarnings("unchecked")
private B self() {
    return (B) this;
}
```

## 指定 channel

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

    // 这里需要一个无参的类，通过反射创建。
    return channelFactory(new ReflectiveChannelFactory<C>(channelClass));
}
```

ReflectiveChannelFactory 的创建实例，基于反射：

```java
@Override
public T newChannel() {
    try {
        return clazz.getConstructor().newInstance();
    } catch (Throwable t) {
        throw new ChannelException("Unable to create Channel from class " + clazz, t);
    }
}
```

ps: 所以这里需要其**有无参构造函数**。

其中对应的 channelFactory

```java
/**
 * @deprecated Use {@link #channelFactory(io.netty.channel.ChannelFactory)} instead.
 */
@Deprecated
public B channelFactory(ChannelFactory<? extends C> channelFactory) {
    if (channelFactory == null) {
        throw new NullPointerException("channelFactory");
    }
    if (this.channelFactory != null) {
        throw new IllegalStateException("channelFactory set already");
    }
    this.channelFactory = channelFactory;
    return self();
}

/**
 * {@link io.netty.channel.ChannelFactory} which is used to create {@link Channel} instances from
 * when calling {@link #bind()}. This method is usually only used if {@link #channel(Class)}
 * is not working for you because of some more complex needs. If your {@link Channel} implementation
 * has a no-args constructor, its highly recommend to just use {@link #channel(Class)} for
 * simplify your code.
 */
@SuppressWarnings({ "unchecked", "deprecation" })
public B channelFactory(io.netty.channel.ChannelFactory<? extends C> channelFactory) {
    return channelFactory((ChannelFactory<C>) channelFactory);
}
```

## localAddress

```java
/**
 * The {@link SocketAddress} which is used to bind the local "end" to.
 */
public B localAddress(SocketAddress localAddress) {
    this.localAddress = localAddress;
    return self();
}

/**
 * @see #localAddress(SocketAddress)
 */
public B localAddress(int inetPort) {
    return localAddress(new InetSocketAddress(inetPort));
}

/**
 * @see #localAddress(SocketAddress)
 */
public B localAddress(String inetHost, int inetPort) {
    return localAddress(SocketUtils.socketAddress(inetHost, inetPort));
}

/**
 * @see #localAddress(SocketAddress)
 */
public B localAddress(InetAddress inetHost, int inetPort) {
    return localAddress(new InetSocketAddress(inetHost, inetPort));
}
```

## 指定 option

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
        // 空，则进行移除
        synchronized (options) {
            options.remove(option);
        }
    } else {
        // 同步设置信息
        synchronized (options) {
            options.put(option, value);
        }
    }
    return self();
}
```

## 指定 attr

```java
/**
 * Allow to specify an initial attribute of the newly created {@link Channel}.  If the {@code value} is
 * {@code null}, the attribute of the specified {@code key} is removed.
 */
public <T> B attr(AttributeKey<T> key, T value) {
    if (key == null) {
        throw new NullPointerException("key");
    }
    if (value == null) {
        // 空则移除
        synchronized (attrs) {
            attrs.remove(key);
        }
    } else {
        // 否则添加
        synchronized (attrs) {
            attrs.put(key, value);
        }
    }
    return self();
}
```

## register 注册

```java
/**
 * Create a new {@link Channel} and register it with an {@link EventLoop}.
 */
public ChannelFuture register() {
    validate();
    return initAndRegister();
}
```

第一步是参数校验：

```java
/**
 * Validate all the parameters. Sub-classes may override this, but should
 * call the super method in that case.
 */
public B validate() {
    if (group == null) {
        throw new IllegalStateException("group not set");
    }
    if (channelFactory == null) {
        throw new IllegalStateException("channel or channelFactory not set");
    }
    return self();
}
```

第二步则是进行初始化：

```java
final ChannelFuture initAndRegister() {
    Channel channel = null;
    try {
        // 根据构造器创建 channel
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

    // 注册 channel 到对应的线程池中
    ChannelFuture regFuture = config().group().register(channel);
    if (regFuture.cause() != null) {
        if (channel.isRegistered()) {
            channel.close();
        } else {
            channel.unsafe().closeForcibly();
        }
    }
    // If we are here and the promise is not failed, it's one of the following cases:
    // 1) If we attempted registration from the event loop, the registration has been completed at this point.
    //    i.e. It's safe to attempt bind() or connect() now because the channel has been registered.
    // 2) If we attempted registration from the other thread, the registration request has been successfully
    //    added to the event loop's task queue for later execution.
    //    i.e. It's safe to attempt bind() or connect() now:
    //         because bind() or connect() will be executed *after* the scheduled registration task is executed
    //         because register(), bind(), and connect() are all bound to the same thread.
    return regFuture;
}
```

## bind 绑定

```java
/**
 * Create a new {@link Channel} and bind it.
 */
public ChannelFuture bind() {
    validate();
    SocketAddress localAddress = this.localAddress;
    if (localAddress == null) {
        throw new IllegalStateException("localAddress not set");
    }
    return doBind(localAddress);
}

/**
 * Create a new {@link Channel} and bind it.
 */
public ChannelFuture bind(int inetPort) {
    return bind(new InetSocketAddress(inetPort));
}
/**
 * Create a new {@link Channel} and bind it.
 */
public ChannelFuture bind(String inetHost, int inetPort) {
    return bind(SocketUtils.socketAddress(inetHost, inetPort));
}
/**
 * Create a new {@link Channel} and bind it.
 */
public ChannelFuture bind(InetAddress inetHost, int inetPort) {
    return bind(new InetSocketAddress(inetHost, inetPort));
}
/**
 * Create a new {@link Channel} and bind it.
 */
public ChannelFuture bind(SocketAddress localAddress) {
    validate();
    if (localAddress == null) {
        throw new NullPointerException("localAddress");
    }
    return doBind(localAddress);
}
```

最核心的还是回到 doBind 方法：

```java
private ChannelFuture doBind(final SocketAddress localAddress) {
    // 初始化并且注册
    final ChannelFuture regFuture = initAndRegister();
    final Channel channel = regFuture.channel();
    if (regFuture.cause() != null) {
        return regFuture;
    }

    if (regFuture.isDone()) {
        // At this point we know that the registration was complete and successful.
        ChannelPromise promise = channel.newPromise();
        doBind0(regFuture, channel, localAddress, promise);
        return promise;
    } else {
        // Registration future is almost always fulfilled already, but just in case it's not.
        final PendingRegistrationPromise promise = new PendingRegistrationPromise(channel);
        // 添加监听器
        regFuture.addListener(new ChannelFutureListener() {
            @Override
            public void operationComplete(ChannelFuture future) throws Exception {
                Throwable cause = future.cause();
                if (cause != null) {
                    // Registration on the EventLoop failed so fail the ChannelPromise directly to not cause an
                    // IllegalStateException once we try to access the EventLoop of the Channel.
                    promise.setFailure(cause);
                } else {
                    // Registration was successful, so set the correct executor to use.
                    // See https://github.com/netty/netty/issues/2586
                    promise.registered();
                    doBind0(regFuture, channel, localAddress, promise);
                }
            }
        });
        return promise;
    }
}
```

其中 doBind0 实现如下：

```java
private static void doBind0(
        final ChannelFuture regFuture, final Channel channel,
        final SocketAddress localAddress, final ChannelPromise promise) {

    // This method is invoked before channelRegistered() is triggered.  
    // Give user handlers a chance to set up the pipeline in its channelRegistered() implementation.
    channel.eventLoop().execute(new Runnable() {
        @Override
        public void run() {
            // 线程池执行对应的方法
            if (regFuture.isSuccess()) {
                channel.bind(localAddress, promise).addListener(ChannelFutureListener.CLOSE_ON_FAILURE);
            } else {
                promise.setFailure(regFuture.cause());
            }
        }
    });
}
```

# ServerBootstrap

服务端引导来的源码为：

## 私有属性

```java
public class ServerBootstrap extends AbstractBootstrap<ServerBootstrap, ServerChannel> {

    private static final InternalLogger logger = InternalLoggerFactory.getInstance(ServerBootstrap.class);

    // 子 Option
    private final Map<ChannelOption<?>, Object> childOptions = new LinkedHashMap<ChannelOption<?>, Object>();

    // 子 属性
    private final Map<AttributeKey<?>, Object> childAttrs = new LinkedHashMap<AttributeKey<?>, Object>();

    // 配置
    private final ServerBootstrapConfig config = new ServerBootstrapConfig(this);

    // 对应的线程池
    private volatile EventLoopGroup childGroup;

    // channel handler
    private volatile ChannelHandler childHandler;

}
```

## 构造器

```java
public ServerBootstrap() { }

private ServerBootstrap(ServerBootstrap bootstrap) {
    super(bootstrap);
    childGroup = bootstrap.childGroup;
    childHandler = bootstrap.childHandler;
    // 同步锁
    synchronized (bootstrap.childOptions) {
        childOptions.putAll(bootstrap.childOptions);
    }
    // 同步锁
    synchronized (bootstrap.childAttrs) {
        childAttrs.putAll(bootstrap.childAttrs);
    }
}
```

## 属性设置方法

对应的属性设置方法为：

```java
ServerBootstrap serverBootstrap = new ServerBootstrap();
serverBootstrap.group(workerGroup, bossGroup)
        .channel(NioServerSocketChannel.class)
        .childHandler(new ChannelInitializer<Channel>() {
            @Override
            protected void initChannel(Channel ch) throws Exception {
                ch.pipeline().addLast(new RpcServerHandler());
            }
        })
        // 这个参数影响的是还没有被accept 取出的连接
        .option(ChannelOption.SO_BACKLOG, 128)
        // 这个参数只是过一段时间内客户端没有响应，服务端会发送一个 ack 包，以判断客户端是否还活着。
        .childOption(ChannelOption.SO_KEEPALIVE, true);
```

### group 方法

设置对应的线程池。

```java
/**
 * Set the {@link EventLoopGroup} for the parent (acceptor) and the child (client). 
 * 为父级（接受者）和子级（客户端）设置 {@link EventLoopGroup}。
 * These {@link EventLoopGroup}'s are used to handle all the events and IO for {@link ServerChannel} and {@link Channel}'s.
 * 这些 {@link EventLoopGroup} 用于处理 {@link ServerChannel} 和 {@link Channel} 的所有事件和 IO。
 */
public ServerBootstrap group(EventLoopGroup parentGroup, EventLoopGroup childGroup) {
    // 父类的设置
    super.group(parentGroup);

    // 参数校验
    if (childGroup == null) {
        throw new NullPointerException("childGroup");
    }
    // 不可重复设置
    if (this.childGroup != null) {
        throw new IllegalStateException("childGroup set already");
    }
    this.childGroup = childGroup;
    return this;
}
```

其中 super.group 实现如下：

```java
/**
 * The {@link EventLoopGroup} which is used to handle all the events for the to-be-created {@link Channel}
 * {@link EventLoopGroup} 用于处理待创建的 {@link Channel} 的所有事件
 */
public B group(EventLoopGroup group) {
    // 校验不可为空，不可重复设置
    if (group == null) {
        throw new NullPointerException("group");
    }
    if (this.group != null) {
        throw new IllegalStateException("group set already");
    }

    // 设置值
    this.group = group;
    return self();
}
```

### channel 

channel 的实现在父类抽象实现中

```java
public B channel(Class<? extends C> channelClass) {
    return this.channelFactory((io.netty.channel.ChannelFactory)(new ReflectiveChannelFactory((Class)ObjectUtil.checkNotNull(channelClass, "channelClass"))));
}
```

我们跟一下这个方法：

```java
public B channelFactory(io.netty.channel.ChannelFactory<? extends C> channelFactory) {
    return this.channelFactory((ChannelFactory)channelFactory);
}
```

底层的实现，发现一个被废弃的方法:

```java
/** @deprecated */
@Deprecated
public B channelFactory(ChannelFactory<? extends C> channelFactory) {
    // 参数校验，不可重复设置
    ObjectUtil.checkNotNull(channelFactory, "channelFactory");
    if (this.channelFactory != null) {
        throw new IllegalStateException("channelFactory set already");
    } else {
        // 设置，并且返回自身
        this.channelFactory = channelFactory;
        return this.self();
    }
}
```

### childOption()

```java
/**
 * Allow to specify a {@link ChannelOption} which is used for the {@link Channel} instances once they get created (after the acceptor accepted the {@link Channel}). 
 * Use a value of {@code null} to remove a previous set {@link ChannelOption}.

 * 允许指定用于 {@link Channel} 实例的 {@link ChannelOption} 一旦它们被创建（在接受者接受 {@link Channel} 之后）。
 * 使用 {@code null} 的值来删除先前设置的 {@link ChannelOption}。
 */
public <T> ServerBootstrap childOption(ChannelOption<T> childOption, T value) {
    // childOption 不可为空
    if (childOption == null) {
        throw new NullPointerException("childOption");
    }
    // value 为空，则加锁进行值移除
    if (value == null) {
        synchronized (childOptions) {
            childOptions.remove(childOption);
        }
    } else {
        // 有值，则进行设置
        synchronized (childOptions) {
            childOptions.put(childOption, value);
        }
    }
    return this;
}
```

### childAttr

这个方法和上面的类似。

```java
/**
 * Set the specific {@link AttributeKey} with the given value on every child {@link Channel}. 
 * If the value is {@code null} the {@link AttributeKey} is removed

 * 在每个子 {@link Channel} 上使用给定值设置特定的 {@link AttributeKey}。
 * 如果值为 {@code null}，则删除 {@link AttributeKey}
 */
public <T> ServerBootstrap childAttr(AttributeKey<T> childKey, T value) {
    if (childKey == null) {
        throw new NullPointerException("childKey");
    }
    if (value == null) {
        childAttrs.remove(childKey);
    } else {
        childAttrs.put(childKey, value);
    }
    return this;
}
```

### childHandler

```java
/**
 * Set the {@link ChannelHandler} which is used to serve the request for the {@link Channel}'s.
 * 设置用于为 {@link Channel} 的请求提供服务的 {@link ChannelHandler}。
 */
public ServerBootstrap childHandler(ChannelHandler childHandler) {
    if (childHandler == null) {
        throw new NullPointerException("childHandler");
    }
    this.childHandler = childHandler;
    return this;
}
```

我们在使用时，使用的是：

```java
.childHandler(new ChannelInitializer<Channel>() {
    @Override
    protected void initChannel(Channel ch) throws Exception {
        ch.pipeline().addLast(new RpcServerHandler());
    }
})
```

这里是一个非常巧妙的接口设计，就是责任链模式。

我们定义多个 Handler，也可以通过 ChannelInitializer 方便的指定顺序，同时也是一个接口实现。

保证了接口的简洁性，实现定义的灵活性。

## init 初始化方法

```java
@Override
void init(Channel channel) throws Exception {
    //ChannelOption 处理
    final Map<ChannelOption<?>, Object> options = options0();
    synchronized (options) {
        setChannelOptions(channel, options, logger);
    }

    //AttributeKey 处理
    final Map<AttributeKey<?>, Object> attrs = attrs0();
    synchronized (attrs) {
        for (Entry<AttributeKey<?>, Object> e: attrs.entrySet()) {
            @SuppressWarnings("unchecked")
            AttributeKey<Object> key = (AttributeKey<Object>) e.getKey();
            channel.attr(key).set(e.getValue());
        }
    }

    //
    ChannelPipeline p = channel.pipeline();
    final EventLoopGroup currentChildGroup = childGroup;
    final ChannelHandler currentChildHandler = childHandler;
    final Entry<ChannelOption<?>, Object>[] currentChildOptions;
    final Entry<AttributeKey<?>, Object>[] currentChildAttrs;

    // 设置 currentChildOptions
    synchronized (childOptions) {
        currentChildOptions = childOptions.entrySet().toArray(newOptionArray(childOptions.size()));
    }
    // 设置 currentChildAttrs
    synchronized (childAttrs) {
        currentChildAttrs = childAttrs.entrySet().toArray(newAttrArray(childAttrs.size()));
    }

    // 用道最后添加初始化
    p.addLast(new ChannelInitializer<Channel>() {
        @Override
        public void initChannel(final Channel ch) throws Exception {
            final ChannelPipeline pipeline = ch.pipeline();
            ChannelHandler handler = config.handler();

            // 配置中的 handler 不为空，则添加到最后
            if (handler != null) {
                pipeline.addLast(handler);
            }

            // 线程池异步执行
            ch.eventLoop().execute(new Runnable() {
                @Override
                public void run() {
                    pipeline.addLast(new ServerBootstrapAcceptor(
                            ch, currentChildGroup, currentChildHandler, currentChildOptions, currentChildAttrs));
                }
            });
        }
    });
}
```

## ServerBootstrapAcceptor

```java
private static class ServerBootstrapAcceptor extends ChannelInboundHandlerAdapter {
    // 基本属性
    private final EventLoopGroup childGroup;
    private final ChannelHandler childHandler;
    private final Entry<ChannelOption<?>, Object>[] childOptions;
    private final Entry<AttributeKey<?>, Object>[] childAttrs;
    private final Runnable enableAutoReadTask;

    // 构造器
    ServerBootstrapAcceptor(
            final Channel channel, EventLoopGroup childGroup, ChannelHandler childHandler,
            Entry<ChannelOption<?>, Object>[] childOptions, Entry<AttributeKey<?>, Object>[] childAttrs) {
        this.childGroup = childGroup;
        this.childHandler = childHandler;
        this.childOptions = childOptions;
        this.childAttrs = childAttrs;
        // Task which is scheduled to re-enable auto-read.
        // It's important to create this Runnable before we try to submit it as otherwise the URLClassLoader may
        // not be able to load the class because of the file limit it already reached.
        //
        // See https://github.com/netty/netty/issues/1328
        enableAutoReadTask = new Runnable() {
            @Override
            public void run() {
                channel.config().setAutoRead(true);
            }
        };
    }

    // 读取
    @Override
    @SuppressWarnings("unchecked")
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        final Channel child = (Channel) msg;
        child.pipeline().addLast(childHandler);
        setChannelOptions(child, childOptions, logger);
        for (Entry<AttributeKey<?>, Object> e: childAttrs) {
            child.attr((AttributeKey<Object>) e.getKey()).set(e.getValue());
        }
        try {
            childGroup.register(child).addListener(new ChannelFutureListener() {
                @Override
                public void operationComplete(ChannelFuture future) throws Exception {
                    if (!future.isSuccess()) {
                        forceClose(child, future.cause());
                    }
                }
            });
        } catch (Throwable t) {
            forceClose(child, t);
        }
    }

    // 强制关闭
    private static void forceClose(Channel child, Throwable t) {
        child.unsafe().closeForcibly();
        logger.warn("Failed to register an accepted channel: {}", child, t);
    }

    // 异常捕获
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        final ChannelConfig config = ctx.channel().config();
        if (config.isAutoRead()) {
            // stop accept new connections for 1 second to allow the channel to recover
            // See https://github.com/netty/netty/issues/1328
            config.setAutoRead(false);
            ctx.channel().eventLoop().schedule(enableAutoReadTask, 1, TimeUnit.SECONDS);
        }
        // still let the exceptionCaught event flow through the pipeline to give the user
        // a chance to do something with it
        ctx.fireExceptionCaught(cause);
    }
}
```

# 参考资料

[Netty 核心源码解析](https://blog.csdn.net/weixin_41385912/article/details/110944462)

[Netty 源码分析-终结篇](https://www.pianshen.com/article/2786550023/)

[Netty 源码剖析](https://blog.csdn.net/youweics/article/details/124570058)

[三. Netty源码](https://www.jianshu.com/p/cfbce3a407d2)

[Netty源码看这篇就够了](https://www.cnblogs.com/nortyr/articles/15570738.html)

https://www.jianshu.com/p/568f2c25f63e

https://www.jianshu.com/p/568f2c25f63e

* any list
{:toc}