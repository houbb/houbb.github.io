---
layout: post
title: Netty 权威指南-06-使用 POJO 代替 Bytebuf
date:  2019-5-10 11:08:59 +0800
categories: [Netty]
tags: [netty, sh]
published: true
---

# 情景导入

学习了前面的基础信息，我们发现我们的大部分内容都是基于 Bytebuf 去处理的。

对于 java 这一门 OO 的语言而言，我们更加习惯的是使用 Pojo 去处理。

# 代码示例

## 对象定义

- UnixTime.java

```java
public class UnixTime {

    private final long value;

    public UnixTime() {
        this(System.currentTimeMillis() / 1000L + 2208988800L);
    }

    public UnixTime(long value) {
        this.value = value;
    }

    public long value() {
        return value;
    }

    @Override
    public String toString() {
        return new Date((value() - 2208988800L) * 1000L).toString();
    }

}
```

## 服务端

- PojoTimeServer.java

```java
public class PojoTimeServer {

    public static void main(String[] args) {
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            ChannelFuture channelFuture = serverBootstrap.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline().addLast(new TimeEncoder()).addLast(new PojoTimeServerHandler());
                        }
                    }).bind(8888)
                    .syncUninterruptibly();

            channelFuture.channel().closeFuture().syncUninterruptibly();
        } finally {
            workerGroup.shutdownGracefully();
            bossGroup.shutdownGracefully();
        }
    }

}
```

其中两个 handler 分别为：

- TimeEncoder.java

将对象转换为 Bybebuf

```java
public class TimeEncoder extends MessageToByteEncoder<UnixTime> {

    @Override
    protected void encode(ChannelHandlerContext ctx, UnixTime msg, ByteBuf out) throws Exception {
        // 对象序列化
        long value = msg.value();

        // 写入到 Bytebuf
        out.writeLong(value);
    }

}
```

- PojoTimeServerHandler.java

处理客户端 channel 链接时，发送时间到客户端。

```java
public class PojoTimeServerHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        // 字节写入时间戳
        // 后续 encoder 会将其转换为 Bybebuf
        ctx.writeAndFlush(new UnixTime());
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }

}
```

## 客户端

- PojoTimeClient.java

```java
public class PojoTimeClient  {

    public static void main(String[] args) {
        EventLoopGroup bossGroup = new NioEventLoopGroup();

        try {
            Bootstrap bootstrap = new Bootstrap();
            ChannelFuture channelFuture = bootstrap.group(bossGroup)
                    .channel(NioSocketChannel.class)
                    .handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline().addLast(new TimeDecoder()).addLast(new PojoTimeClientHandler());
                        }
                    })
                    .connect("localhost", 8888);

            channelFuture.channel().closeFuture().syncUninterruptibly();
        } finally {
            bossGroup.shutdownGracefully();
        }
    }
}
```

其中 handler 如下：

- TimeDecoder.java

对时间戳进行解码为对象。

```java
public class TimeDecoder extends ByteToMessageDecoder {

    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception {
        // 将字节转化为对象
        long value = in.readLong();
        UnixTime unixTime = new UnixTime(value);

        // 将对象输出到结果
        out.add(unixTime);
    }

}
```

- PojoTimeClientHandler.java

直接以对象的方式处理服务端信息。

```java
public class PojoTimeClientHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        UnixTime unixTime = (UnixTime) msg;
        System.out.println("Receive data from server: " + unixTime);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }

}
```

# 个人感受

将转换和具体业务代码，使用 pipiline 的方式，可以提高复用率。

也可以使得代码变得简单专注。

## 实际使用

实际使用中，我们当然不会这么辛苦的去转换每一个对象。

直接结合 [序列化框架概览](https://houbb.github.io/2018/07/20/json-00-overview) 就可以非常简单的处理。

专业的事情交给专业的工具去处理。

# 拓展阅读

[Netty-14-encoder 编码器](https://houbb.github.io/2017/11/16/netty-14-codec-03-encoder-03)

# 参考资料

《Netty 权威指南》

[speaking-in-pojo-instead-of-bytebuf](https://netty.io/wiki/user-guide-for-4.x.html#speaking-in-pojo-instead-of-bytebuf)


* any list
{:toc}