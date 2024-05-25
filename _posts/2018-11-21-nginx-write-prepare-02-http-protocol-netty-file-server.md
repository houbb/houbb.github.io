---
layout: post
title:  从零手写实现 nginx 准备知识-02-netty 构建文件服务器
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

# HTTP开发入门-静态文件服务器

netty天生异步事件驱动的架构，无论是在性能上还是在可靠性上，都表现优异，非常适合在非Web容器的场景下应用，相比于传统的Tomcat，Jetty等Web容器，更加的轻量和小巧、灵活性和定制性也更好。

我们以文件服务器为例学习Netty的HTTP服务端入门开发，例程场景如下：

- 文件服务器使用HTTP协议对外提供服务

- 当客户端通过浏览器访问文件服务器时，对访问路径进行检查，检查失败返回403

- 检查通过，以链接的方式打开当前文件目录，每个目录或者都是个超链接，可以递归访问

- 如果是目录，可以继续递归访问它下面的目录或者文件，如果是文件并且可读，则可以在浏览器端直接打开，或者通过[目标另存为]下载

```java
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpRequestDecoder;
import io.netty.handler.codec.http.HttpResponseEncoder;
import io.netty.handler.stream.ChunkedWriteHandler;

/**
 * @version 1.0
 * @date 2014年2月14日
 */
public class HttpFileServer {

    private static final String DEFAULT_URL = "/";

    public void run(final int port, final String url) throws Exception {
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch)
                                throws Exception {
                            ch.pipeline().addLast("http-decoder",
                                    new HttpRequestDecoder()); // 请求消息解码器
                            ch.pipeline().addLast("http-aggregator",
                                    new HttpObjectAggregator(65536));// 目的是将多个消息转换为单一的request或者response对象
                            ch.pipeline().addLast("http-encoder",
                                    new HttpResponseEncoder());//响应解码器
                            ch.pipeline().addLast("http-chunked",
                                    new ChunkedWriteHandler());//目的是支持异步大文件传输（）
                            ch.pipeline().addLast("fileServerHandler",
                                    new HttpFileServerHandler(url));// 业务逻辑
                        }
                    });
            ChannelFuture future = b.bind("127.0.0.1", port).sync();
            System.out.println("HTTP文件目录服务器启动，网址是 : " + "http://127.0.0.1:"
                    + port + url);
            future.channel().closeFuture().sync();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }

    public static void main(String[] args) throws Exception {
        int port = 8080;
        if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException e) {
                e.printStackTrace();
            }
        }
        String url = DEFAULT_URL;
        if (args.length > 1)
            url = args[1];
        new HttpFileServer().run(port, url);
    }
}
```

重点在于编解码器，首先添加的HTTP请求消息解码器HttpRequestDecoder,然后是HttpObjectAggregator解码器，它的作用是将多个消息转换为单一的FullHttpRequest或者FullHttpResponse，原因是HTTP解码器在每个HTTP消息中会生成多个消息对象。

(1) HttpRequest/HttpResponse;

(2) HttpContent;

(3) LastHttpContent;

下面是FileServerHandler:

```java
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.*;
import io.netty.handler.codec.http.*;
import io.netty.handler.stream.ChunkedFile;
import io.netty.util.CharsetUtil;

import javax.activation.MimetypesFileTypeMap;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.RandomAccessFile;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.regex.Pattern;

import static io.netty.handler.codec.http.HttpMethod.GET;
import static io.netty.handler.codec.http.HttpResponseStatus.*;
import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;

/**
 * @author lilinfeng
 * @version 1.0
 * @date 2014年2月14日
 */
public class HttpFileServerHandler extends
        SimpleChannelInboundHandler<FullHttpRequest> {
    private final String url;

    public HttpFileServerHandler(String url) {
        this.url = url;
    }


    @Override
    protected void channelRead0(ChannelHandlerContext ctx, FullHttpRequest request) throws Exception {
        /*如果无法解码400*/
        if (!request.decoderResult().isSuccess()) {
            sendError(ctx, BAD_REQUEST);
            return;
        }

        /*只支持GET方法*/
        if (request.method() != GET) {
            sendError(ctx, METHOD_NOT_ALLOWED);
            return;
        }

        final String uri = request.uri();
        /*格式化URL，并且获取路径*/
        final String path = sanitizeUri(uri);
        if (path == null) {
            sendError(ctx, FORBIDDEN);
            return;
        }
        File file = new File(path);
        /*如果文件不可访问或者文件不存在*/
        if (file.isHidden() || !file.exists()) {
            sendError(ctx, NOT_FOUND);
            return;
        }
        /*如果是目录*/
        if (file.isDirectory()) {
            //1. 以/结尾就列出所有文件
            if (uri.endsWith("/")) {
                sendListing(ctx, file);
            } else {
                //2. 否则自动+/
                sendRedirect(ctx, uri + '/');
            }
            return;
        }
        if (!file.isFile()) {
            sendError(ctx, FORBIDDEN);
            return;
        }
        RandomAccessFile randomAccessFile = null;
        try {
            randomAccessFile = new RandomAccessFile(file, "r");// 以只读的方式打开文件
        } catch (FileNotFoundException fnfe) {
            sendError(ctx, NOT_FOUND);
            return;
        }
        long fileLength = randomAccessFile.length();
        //创建一个默认的HTTP响应
        HttpResponse response = new DefaultHttpResponse(HTTP_1_1, OK);
        //设置Content Length
        HttpUtil.setContentLength(response, fileLength);
        //设置Content Type
        setContentTypeHeader(response, file);
        //如果request中有KEEP ALIVE信息
        if (HttpUtil.isKeepAlive(request)) {
            response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.KEEP_ALIVE);
        }
        ctx.write(response);
        ChannelFuture sendFileFuture;
        //通过Netty的ChunkedFile对象直接将文件写入发送到缓冲区中
        sendFileFuture = ctx.write(new ChunkedFile(randomAccessFile, 0,
                fileLength, 8192), ctx.newProgressivePromise());
        sendFileFuture.addListener(new ChannelProgressiveFutureListener() {
            @Override
            public void operationProgressed(ChannelProgressiveFuture future,
                                            long progress, long total) {
                if (total < 0) { // total unknown
                    System.err.println("Transfer progress: " + progress);
                } else {
                    System.err.println("Transfer progress: " + progress + " / "
                            + total);
                }
            }

            @Override
            public void operationComplete(ChannelProgressiveFuture future)
                    throws Exception {
                System.out.println("Transfer complete.");
            }
        });
        ChannelFuture lastContentFuture = ctx
                .writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT);
        //如果不支持keep-Alive，服务器端主动关闭请求
        if (!HttpUtil.isKeepAlive(request)) {
            lastContentFuture.addListener(ChannelFutureListener.CLOSE);
        }
    }


    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause)
            throws Exception {
        cause.printStackTrace();
        if (ctx.channel().isActive()) {
            sendError(ctx, INTERNAL_SERVER_ERROR);
        }
    }

    private static final Pattern INSECURE_URI = Pattern.compile(".*[<>&\"].*");


    private String sanitizeUri(String uri) {
        try {
            uri = URLDecoder.decode(uri, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            try {
                uri = URLDecoder.decode(uri, "ISO-8859-1");
            } catch (UnsupportedEncodingException e1) {
                throw new Error();
            }
        }
        if (!uri.startsWith(url)) {
            return null;
        }
        if (!uri.startsWith("/")) {
            return null;
        }
        uri = uri.replace('/', File.separatorChar);
        if (uri.contains(File.separator + '.')
                || uri.contains('.' + File.separator) || uri.startsWith(".")
                || uri.endsWith(".") || INSECURE_URI.matcher(uri).matches()) {
            return null;
        }
        return System.getProperty("user.dir") + File.separator + uri;
    }

    private static final Pattern ALLOWED_FILE_NAME = Pattern
            .compile("[A-Za-z0-9][-_A-Za-z0-9\\.]*");

    private static void sendListing(ChannelHandlerContext ctx, File dir) {
        FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, OK);
        response.headers().set(HttpHeaderNames.CONTENT_TYPE, "text/html; charset=UTF-8");
        StringBuilder buf = new StringBuilder();
        String dirPath = dir.getPath();
        buf.append("<!DOCTYPE html>\r\n");
        buf.append("<html><head><title>");
        buf.append(dirPath);
        buf.append(" 目录：");
        buf.append("</title></head><body>\r\n");
        buf.append("<h3>");
        buf.append(dirPath).append(" 目录：");
        buf.append("</h3>\r\n");
        buf.append("<ul>");
        buf.append("<li>链接：<a href=\"../\">..</a></li>\r\n");
        for (File f : dir.listFiles()) {
            if (f.isHidden() || !f.canRead()) {
                continue;
            }
            String name = f.getName();
            if (!ALLOWED_FILE_NAME.matcher(name).matches()) {
                continue;
            }
            buf.append("<li>链接：<a href=\"");
            buf.append(name);
            buf.append("\">");
            buf.append(name);
            buf.append("</a></li>\r\n");
        }
        buf.append("</ul></body></html>\r\n");
        ByteBuf buffer = Unpooled.copiedBuffer(buf, CharsetUtil.UTF_8);
        response.content().writeBytes(buffer);
        buffer.release();
        ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
    }

    private static void sendRedirect(ChannelHandlerContext ctx, String newUri) {
        FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, FOUND);
        response.headers().set(HttpHeaderNames.LOCATION, newUri);
        ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
    }

    private static void sendError(ChannelHandlerContext ctx,
                                  HttpResponseStatus status) {
        FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1,
                status, Unpooled.copiedBuffer("Failure: " + status.toString()
                + "\r\n", CharsetUtil.UTF_8));
        response.headers().set(HttpHeaderNames.CONTENT_TYPE, "text/plain; charset=UTF-8");
        ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
    }

    private static void setContentTypeHeader(HttpResponse response, File file) {
        MimetypesFileTypeMap mimeTypesMap = new MimetypesFileTypeMap();
        response.headers().set(HttpHeaderNames.CONTENT_TYPE,
                mimeTypesMap.getContentType(file.getPath()));
    }
}
```

上面的代码注释相对详细，这里大致梳理一下。

(1) 不能解码返回400，只支持GET请求，否则返回405.

(2) 对url包装，使用UTF-8字符集，转换为绝对path

(3) 如果是目录，创建一个html页面

(4) 如果是文件，设置content-type和content-length，使用netty的chunkedfile直接写到缓冲，异步的方式

(5) 如果是非keepalived的，服务器端主动关闭，否则等待客户端主动关闭。

# 参考资料

https://www.cnblogs.com/luxiaoxun/p/3959450.html

https://www.cnblogs.com/carl10086/p/6185095.html

https://blog.csdn.net/suifeng3051/article/details/22800171

https://blog.csdn.net/sinat_34163739/article/details/108820355

* any list
{:toc}