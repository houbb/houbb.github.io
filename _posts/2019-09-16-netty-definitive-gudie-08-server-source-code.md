---
layout: post
title: Netty 权威指南-08-netty 服务端启动流程源码详解
date:  2019-5-10 11:08:59 +0800
categories: [Netty]
tags: [netty, sh]
published: true
---

# ServerBoostrap

用户可以通过 netty 的 ServerBoostrap 启动服务端，时序图如下：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1221/212743_3a889bfd_508704.png "server-seq.png")

## 入门例子

为了便于大家理解，我们把服务端启动的代码放在下面：

```java
public void run() throws Exception {
    /**
     * EventLoopGroup 是用来处理I/O操作的多线程事件循环器
     * bossGroup: 用来接收进来的连接
     * workerGroup: 用来处理已经被接收的连接
     * 一旦‘boss’接收到连接，就会把连接信息注册到‘worker’上。
     */
    EventLoopGroup bossGroup = new NioEventLoopGroup(); // (1)
    EventLoopGroup workerGroup = new NioEventLoopGroup();
    try {
        /**
         * ServerBootstrap 是一个启动 NIO 服务的辅助启动类。
         * 你可以在这个服务中直接使用 Channel，但是这会是一个复杂的处理过程，在很多情况下你并不需要这样做。
         */
        ServerBootstrap b = new ServerBootstrap(); // (2)
        b.group(bossGroup, workerGroup)
                //指定使用 NioServerSocketChannel 类来举例说明一个新的 Channel 如何接收进来的连接。
                .channel(NioServerSocketChannel.class) // (3)
                /**
                 * 这里的事件处理类经常会被用来处理一个最近的已经接收的 Channel。
                 * ChannelInitializer 是一个特殊的处理类，他的目的是帮助使用者配置一个新的 Channel。
                 * 也许你想通过增加一些处理类比如DiscardServerHandler 来配置一个新的 Channel 或者其对应的ChannelPipeline 来实现你的网络程序。
                 * 当你的程序变的复杂时，可能你会增加更多的处理类到 pipeline 上，然后提取这些匿名类到最顶层的类上。
                 */
                .childHandler(new ChannelInitializer<SocketChannel>() { // (4)
                    @Override
                    public void initChannel(SocketChannel ch) throws Exception {
                        ch.pipeline().addLast(new DiscardServerHandler());
                    }
                })
                /**
                 * 你可以设置这里指定的 Channel 实现的配置参数。
                 * 我们正在写一个TCP/IP 的服务端，因此我们被允许设置 socket 的参数选项比如tcpNoDelay 和 keepAlive。
                 * 请参考 ChannelOption 和详细的 ChannelConfig 实现的接口文档以此可以对ChannelOption 的有一个大概的认识。
                 *
                 * option() 是提供给 NioServerSocketChannel 用来接收进来的连接。
                 * childOption() 是提供给由父管道 ServerChannel 接收到的连接，在这个例子中也是 NioServerSocketChannel。
                 */
                .option(ChannelOption.SO_BACKLOG, 128)          // (5)
                .childOption(ChannelOption.SO_KEEPALIVE, true); // (6)
        /**
         * 剩下的就是绑定端口然后启动服务。这里我们在机器上绑定了机器所有网卡上的 8080 端口。
         * 当然现在你可以多次调用 bind() 方法(基于不同绑定地址)。
         */
        // 绑定端口，开始接收进来的连接
        ChannelFuture f = b.bind(port).sync(); // (7)
        System.out.println("DiscardServer start...");
        // 等待服务器  socket 关闭 。
        // 在这个例子中，这不会发生，但你可以优雅地关闭你的服务器。
        f.channel().closeFuture().sync();
    } finally {
        workerGroup.shutdownGracefully();
        bossGroup.shutdownGracefully();
    }
}
```


## 浅析

（1）Builder 构建者模式

为了解决参数较多的问题，这里 netty ServerBootstrap 使用了  builder 模式，可以大大降低我们的配置量，也可以灵活指定配置。

（2）EventLoopGroup 线程池

为了提升性能，线程池是一个自然的选择。

（3）设置并且绑定 channel

可以发现我们源码中只有一句话 `channel(NioServerSocketChannel.class)`

这个方法源码如下：

```java
public B channel(Class<? extends C> channelClass) {
    if (channelClass == null) {
        throw new NullPointerException("channelClass");
    }
    return channelFactory(new ReflectiveChannelFactory<C>(channelClass));
}
```

很显然，这里使用了工厂模式。

我们只需要简单的指定 class 信息，netty 会自动通过反射创建对应的实现类。

（4）初始化 ChannelPipeline 

流水线使用了责任链模式，用于处理一系列的 ChannelHandler。

（5）添加 ChannelHandler

netty 这里的 initChannel 方法，可以让我们非常方便的添加 ChannelHandler。

对个人的影响也比较大，我写的很多工具方法也会采用类似的模式。

（6）绑定并且启动监听端口

我们使用时只有非常优雅的一句话 `ChannelFuture f = b.bind(port).sync();`，实际上 netty 为我们做了一些封装：

虽然我们只指定了 port，本质上肯定还是 socket 地址，只不过默认 ip 为本地而已。

```java
public ChannelFuture bind(SocketAddress localAddress) {
    validate();
    if (localAddress == null) {
        throw new NullPointerException("localAddress");
    }
    return doBind(localAddress);
}
```

doBind 的实现还是比较多的，暂时不做展开。

（7）selector 轮训 & 触发

写过 java nio 的小伙伴们肯定知道，需要通过 selector 轮训获取消息。

实际上 netty 将这些细节封装了起来。轮训准备就绪 Channel 之后，将由 Reactor 线程 NioEventLoop 执行 ChannelPipeline 的响应方法，最终调用到 ChannelHandler。

ChannelHandler 中包含了系统内置的处理类，和用户自定义的处理类。


# 源码解析

每一个版本的源码可能有差异，这里老马的版本是 `4.1.17.Final`。

## EventLoopGroup

EventLoopGroup 就是 Reactor 线程池。

group 方法如下：

```java
/**
 * Set the {@link EventLoopGroup} for the parent (acceptor) and the child (client). These
 * {@link EventLoopGroup}'s are used to handle all the events and IO for {@link ServerChannel} and
 * {@link Channel}'s.
 */
public ServerBootstrap group(EventLoopGroup parentGroup, EventLoopGroup childGroup) {
    super.group(parentGroup);
    if (childGroup == null) {
        throw new NullPointerException("childGroup");
    }
    if (this.childGroup != null) {
        throw new IllegalStateException("childGroup set already");
    }
    this.childGroup = childGroup;
    return this;
}
```

这里调用了父类的方法 `super.group(parentGroup);`，实现如下:

```java
/**
 * The {@link EventLoopGroup} which is used to handle all the events for the to-be-created
 * {@link Channel}
 */
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

这个方法主要用于设置 IO 线程，执行和调度网络事件的读写。

## channel 

channel 的方法如下：

```java
public B channel(Class<? extends C> channelClass) {
    if (channelClass == null) {
        throw new NullPointerException("channelClass");
    }
    return channelFactory(new ReflectiveChannelFactory<C>(channelClass));
}
```

ReflectiveChannelFactory 反射的核心实现如下：

```java
public ReflectiveChannelFactory(Class<? extends T> clazz) {
    if (clazz == null) {
        throw new NullPointerException("clazz");
    }
    this.clazz = clazz;
}

@Override
public T newChannel() {
    try {
        return clazz.getConstructor().newInstance();
    } catch (Throwable t) {
        throw new ChannelException("Unable to create Channel from class " + clazz, t);
    }
}
```

实际上就是通过 NioServerSocketChannel 创建了 Channel 对象。

## 启动类设置 Handler

启动类可以为启动服务类和父类，分别设置 Handler。

这个也是一开始老马学习 netty 比较迷惑的地方，这两个有啥区别呢？

![输入图片说明](https://images.gitee.com/uploads/images/2020/1221/215911_98259d9a_508704.png "server-handler.png")

本质区别：

（1）ServerBoostrap 中的 Handler 是 NioServerSocketChannel 使用的，所有连接这个监听端口的客户端都会执行。

（2）父类 AbstractServerBoostrap 中的 Handler 是一个工厂类，会为每一个接入的客户端都创建一个新的 Handler。

## 端口绑定

最后，还有服务端的端口绑定。我们上面只是简单的过了一下，这里做一下展开：

```java
private ChannelFuture doBind(final SocketAddress localAddress) {
    //1. 创建 channel 并注册
    final ChannelFuture regFuture = initAndRegister();
    final Channel channel = regFuture.channel();
    if (regFuture.cause() != null) {
        return regFuture;
    }

    //2. 创建完成后，设置对应的附加属性
    if (regFuture.isDone()) {
        // At this point we know that the registration was complete and successful.
        ChannelPromise promise = channel.newPromise();
        doBind0(regFuture, channel, localAddress, promise);
        return promise;
    } else {
        // Registration future is almost always fulfilled already, but just in case it's not.
        final PendingRegistrationPromise promise = new PendingRegistrationPromise(channel);
        regFuture.addListener(new ChannelFutureListener() {
            //3. 添加监听器
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

### 创建 channel 并注册

`initAndRegister()` 完整实现如下：

```java
final ChannelFuture initAndRegister() {
    Channel channel = null;
    try {
        //1. 通过 channelFactory 创建新的 channel
        channel = channelFactory.newChannel();
        //2. 初始化相关属性
        init(channel);
    } catch (Throwable t) {
        // 省略
    }
    // 省略
    return regFuture;
}
```

init 是一个抽象方法，服务端实现如下：

```java
@Override
void init(Channel channel) throws Exception {
    final Map<ChannelOption<?>, Object> options = options0();

    //1. 设置 Socket 参数和 NioserverSocketChannel 的 附加属性
    synchronized (options) {
        setChannelOptions(channel, options, logger);
    }
    final Map<AttributeKey<?>, Object> attrs = attrs0();
    synchronized (attrs) {
        for (Entry<AttributeKey<?>, Object> e: attrs.entrySet()) {
            @SuppressWarnings("unchecked")
            AttributeKey<Object> key = (AttributeKey<Object>) e.getKey();
            channel.attr(key).set(e.getValue());
        }
    }

    // 属性省略
    p.addLast(new ChannelInitializer<Channel>() {
        @Override
        public void initChannel(final Channel ch) throws Exception {
            final ChannelPipeline pipeline = ch.pipeline();

            //2. 将 AbstractBoostrap 的 Handler 添加到 NioserverSocketChannel 的 pipeline 中
            ChannelHandler handler = config.handler();
            if (handler != null) {
                pipeline.addLast(handler);
            }

            //3. 将用于服务端注册的 ServerBootstrapAcceptor 添加到 pipeline 中
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

到这里，服务端的监听相关资源已经初始化完毕。

接下来，需要把 NioserverSocketChannel 注册到 Reactor 线程的多路复用选择器上，然后轮训客户端事件。


#### NioserverSocketChannel 简介

构造器如下：

```java
public NioServerSocketChannel() {
    this(newSocket(DEFAULT_SELECTOR_PROVIDER));
}
```

这个就是默认 channel 初始化的构造器，实际调用的是：

```java
private static final SelectorProvider DEFAULT_SELECTOR_PROVIDER = SelectorProvider.provider();

private static ServerSocketChannel newSocket(SelectorProvider provider) {
    return provider.openServerSocketChannel();
}
```

归根到底，默认的 SelectorProvider 应该是 jdk nio 的 DefaultSelectorProvider。

实际上，还是根据初始化 ServerSocketChannel：
 
```java
public NioServerSocketChannel(ServerSocketChannel channel) {
    super(null, channel, SelectionKey.OP_ACCEPT);
    config = new NioServerSocketChannelConfig(this, javaChannel().socket());
}
```

可以看到，这里默认注册监听了 `SelectionKey.OP_ACCEPT` 事件。 

其中 SelectionKey 只有 4 种：

```java
public static final int OP_ACCEPT = 1 << 4;

public static final int OP_CONNECT = 1 << 3;

public static final int OP_WRITE = 1 << 2;

public static final int OP_READ = 1 << 0;
```

#### NioserverSocketChannel 注册

注册的源码比较多，看得人云里雾里的。

可以理解，就是首先注册自己感兴趣的事件，发生的时候通知你即可。

注册的方法如下我们主要看 NioEventLoop 即可，这个类继承自 SingleThreadEventLoop 类。

实现了 SingleThreadEventExecutor 类的 run 方法，如下：

```java
@Override
protected void run() {
    for (;;) {
        try {
            switch (selectStrategy.calculateStrategy(selectNowSupplier, hasTasks())) {
                case SelectStrategy.CONTINUE:
                    continue;
                case SelectStrategy.SELECT:
                    select(wakenUp.getAndSet(false));
                    if (wakenUp.get()) {
                        selector.wakeup();
                    }
                    // fall through
                default:
            }
            // 省略
            processSelectedKeys();
            // 省略
        } catch (Throwable t) {
            handleLoopException(t);
        }
        // Always handle shutdown even if the loop processing threw an exception.
        // 省略
    }
}
```

我们只看核心的部分，这里实际上就是一个死循环，注册的部分核心如下：

```java
public void register(final SelectableChannel ch, final int interestOps, final NioTask<?> task) {
    // 省略
    ch.register(selector, interestOps, task);
    // 省略
}
```

在 AbstractSelectableChannel 中的实现如下:

```java
public final SelectionKey register(Selector sel, int ops,
                                   Object att)
    throws ClosedChannelException
{
    synchronized (regLock) {
        // 省略
        SelectionKey k = findKey(sel);
        if (k != null) {
            k.interestOps(ops);
            k.attach(att);
        }
        if (k == null) {
            // New registration
            synchronized (keyLock) {
                if (!isOpen())
                    throw new ClosedChannelException();
                k = ((AbstractSelector)sel).register(this, ops, att);
                addKey(k);
            }
        }
        return k;
    }
}
```

这里实际上是注册感兴趣的事件，服务端到这里基本上已经告一段落了。

## 客户端接入源码分析

下面我们看一下 NioEventLoop 是如何处理客户端请求的。

当多路复用器就绪时，默认执行 processSelectedKeysOptimized() 方法：

```java
private void processSelectedKeysOptimized() {
    for (int i = 0; i < selectedKeys.size; ++i) {
        final SelectionKey k = selectedKeys.keys[i];
        selectedKeys.keys[i] = null;
        final Object a = k.attachment();
        // 这里处理的 attachment 是 AbstractNioChannel
        if (a instanceof AbstractNioChannel) {
            processSelectedKey(k, (AbstractNioChannel) a);
        } else {
            @SuppressWarnings("unchecked")
            NioTask<SelectableChannel> task = (NioTask<SelectableChannel>) a;
            processSelectedKey(k, task);
        }
        if (needsToSelectAgain) {
            // null out entries in the array to allow to have it GC'ed once the Channel close
            // See https://github.com/netty/netty/issues/2363
            selectedKeys.reset(i + 1);
            selectAgain();
            i = -1;
        }
    }
}
```

这里实际上是根据不同的的类型，执行不同的操作：

```java
private void processSelectedKey(SelectionKey k, AbstractNioChannel ch) {
        final AbstractNioChannel.NioUnsafe unsafe = ch.unsafe();
        // 省略
        try {
            int readyOps = k.readyOps();
            if ((readyOps & SelectionKey.OP_CONNECT) != 0) {
                int ops = k.interestOps();
                ops &= ~SelectionKey.OP_CONNECT;
                k.interestOps(ops);

                unsafe.finishConnect();
            }

            // Process OP_WRITE first as we may be able to write some queued buffers and so free memory.
            if ((readyOps & SelectionKey.OP_WRITE) != 0) {
                // Call forceFlush which will also take care of clear the OP_WRITE once there is nothing left to write
                ch.unsafe().forceFlush();
            }

            // Also check for readOps of 0 to workaround possible JDK bug which may otherwise lead
            // to a spin loop
            if ((readyOps & (SelectionKey.OP_READ | SelectionKey.OP_ACCEPT)) != 0 || readyOps == 0) {
                unsafe.read();
            }
        } catch (CancelledKeyException ignored) {
            unsafe.close(unsafe.voidPromise());
        }
    }
```

我们来重点关注下 read 方法。

NioUnsafe 是一个接口，有两个子类：NioByteUnsafe 和 NioMessageUnsafe。

NioServerSocketChannel 继承自 AbstractNioMessageChannel，使用的是 NioMessageUnsafe 类。

### read 方法

实现如下：

```java
@Override
public void read() {
    assert eventLoop().inEventLoop();
    final ChannelConfig config = config();
    final ChannelPipeline pipeline = pipeline();
    final RecvByteBufAllocator.Handle allocHandle = unsafe().recvBufAllocHandle();
    allocHandle.reset(config);
    boolean closed = false;
    Throwable exception = null;
    try {
        try {
            do {
                // 核心方法
                int localRead = doReadMessages(readBuf);
                if (localRead == 0) {
                    break;
                }
                if (localRead < 0) {
                    closed = true;
                    break;
                }
                allocHandle.incMessagesRead(localRead);
            } while (allocHandle.continueReading());
        } catch (Throwable t) {
            exception = t;
        }
        // 处理读取的信息
        int size = readBuf.size();
        for (int i = 0; i < size; i ++) {
            readPending = false;
            // 触发 channel read 
            pipeline.fireChannelRead(readBuf.get(i));
        }
        readBuf.clear();
        allocHandle.readComplete();

        // 触发 read complete
        pipeline.fireChannelReadComplete();
    } finally {
        // 省略
    }
}
```

doReadMessages 在 NioServerSocketChannel 类中实现如下：

```java
@Override
protected int doReadMessages(List<Object> buf) throws Exception {
    SocketChannel ch = SocketUtils.accept(javaChannel());
    try {
        if (ch != null) {
            buf.add(new NioSocketChannel(this, ch));
            return 1;
        }
    } catch (Throwable t) {
        // 省略
    }
    return 0;
}
```

这里就是 jdk nio 中的接收到一个新的客户端请求的方法实现。

读取完成之后，触发 fireChannelRead，如下：

```java
@Override
public final ChannelPipeline fireChannelRead(Object msg) {
    AbstractChannelHandlerContext.invokeChannelRead(head, msg);
    return this;
}
```

如下：

```java
static void invokeChannelRead(final AbstractChannelHandlerContext next, Object msg) {
    final Object m = next.pipeline.touch(ObjectUtil.checkNotNull(msg, "msg"), next);
    EventExecutor executor = next.executor();
    if (executor.inEventLoop()) {
        next.invokeChannelRead(m);
    } else {
        executor.execute(new Runnable() {
            @Override
            public void run() {
                next.invokeChannelRead(m);
            }
        });
    }
}
```

invokeChannelRead 如下：

```java
private void invokeChannelRead(Object msg) {
    if (invokeHandler()) {
        try {
            ((ChannelInboundHandler) handler()).channelRead(this, msg);
        } catch (Throwable t) {
            notifyHandlerException(t);
        }
    } else {
        fireChannelRead(msg);
    }
}
```

实际上最后就是一个责任链去调用各种 ChannelInboundHandler 类。

到此，客户端接入完成。

可以进行网络读写等 IO 操作。

# 小结

读到这里的小伙伴们肯定会发现，netty 使用起来简单，实际上背后做了很多的封装。

这一切封装的背后，都需要扎实的 java 基础和网络编程知识作为支撑。

下一节我们将一起学习下客户端启动的源码。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

《Netty 权威指南》

- other

[Netty 系列之 Netty 百万级推送服务设计要点](https://www.infoq.cn/article/netty-million-level-push-service-design-points/)

[使用netty自定义推送](https://blog.csdn.net/yinbucheng/article/details/77094973)

[使用netty实现网络推送](https://blog.csdn.net/yinbucheng/article/details/77076302)

[使用netty开发私有栈协议](https://blog.csdn.net/yinbucheng/article/details/77439878)

* any list
{:toc}