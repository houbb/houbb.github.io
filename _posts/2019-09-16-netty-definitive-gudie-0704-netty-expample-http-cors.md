---
layout: post
title: Netty 权威指南-07-Netty example http cors
date:  2019-5-10 11:08:59 +0800
categories: [Netty]
tags: [netty, sh]
published: true
---

# Cross-Origin Resource Sharing (CORS)

COSR（跨站点资源分享）通俗的讲是跨域问题，严格来说它是跨域问题的解决方案之一，而且是官方解决方案。

在CORS成为标准之前，是没有办法请求不同域名的后端API的，因为安全原因。请求会被同源策略阻止，现在也是。

参考 [HTTP CORS](https://houbb.github.io/2018/04/04/cors)

# 实例代码

## 例子说明

```
28  /**
29   * This example server aims to demonstrate
30   * <a href="http://www.w3.org/TR/cors/">Cross Origin Resource Sharing</a> (CORS) in Netty.
31   * It does not have a client like most of the other examples, but instead has
32   * a html page that is loaded to try out CORS support in a web browser.
33   * <p>
34   *
35   * CORS is configured in {@link HttpCorsServerInitializer} and by updating the config you can
36   * try out various combinations, like using a specific origin instead of a
37   * wildcard origin ('*').
38   * <p>
39   *
40   * The file {@code src/main/resources/cors/cors.html} contains a very basic example client
41   * which can be used to try out different configurations. For example, you can add
42   * custom headers to force a CORS preflight request to make the request fail. Then
43   * to enable a successful request, configure the CorsHandler to allow that/those
44   * request headers.
45   *
46   * <h2>Testing CORS</h2>
47   * You can either load the file {@code src/main/resources/cors/cors.html} using a web server
48   * or load it from the file system using a web browser.
49   *
50   * <h3>Using a web server</h3>
51   * To test CORS support you can serve the file {@code src/main/resources/cors/cors.html}
52   * using a web server. You can then add a new host name to your systems hosts file, for
53   * example if you are on Linux you may update /etc/hosts to add an additional name
54   * for you local system:
55   * <pre>
56   * 127.0.0.1   localhost domain1.com
57   * </pre>
58   * Now, you should be able to access {@code http://domain1.com/cors.html} depending on how you
59   * have configured you local web server the exact url may differ.
60   *
61   * <h3>Using a web browser</h3>
62   * Open the file {@code src/main/resources/cors/cors.html} in a web browser. You should see
63   * loaded page and in the text area the following message:
64   * <pre>
65   * 'CORS is not working'
66   * </pre>
67   *
68   * If you inspect the headers being sent using your browser you'll see that the 'Origin'
69   * request header is {@code 'null'}. This is expected and happens when you load a file from the
70   * local file system. Netty can handle this by configuring the CorsHandler which is done
71   * in the {@link HttpCorsServerInitializer}.
72   *
73   */
```

## 验证浏览器是否支持 cors

<a href="/tools/netty/cors.html">cors.html</a>

## 访问验证

修改 hosts 文件：

```
127.0.0.1   localhost domain1.com
```

访问：http://domain1.com/cors.html 直接指到对应的文件位置。

此处不再演示。

直接看下代码吧。

# 代码

## 服务端

- HttpCorsServer.java

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
import io.netty.handler.codec.http.cors.CorsConfig;
import io.netty.handler.codec.http.cors.CorsConfigBuilder;
import io.netty.handler.codec.http.cors.CorsHandler;
import io.netty.handler.stream.ChunkedWriteHandler;

/**
 * <p> </p>
 *
 * <pre> Created: 2019/9/22 10:20 AM  </pre>
 * <pre> Project: netty-learn  </pre>
 *
 * @author houbinbin
 */
public class HttpCorsServer {

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
                            CorsConfig corsConfig = CorsConfigBuilder
                                    .forAnyOrigin()
                                    .allowNullOrigin()
                                    .allowCredentials()
                                    .build();

                            //http 响应编码
                            ch.pipeline().addLast(new HttpResponseEncoder())
                                    //http 请求解码
                                    .addLast(new HttpRequestDecoder())
                                    // 将 http 消息和内容聚合成一个完成的 http 请求信息
                                    .addLast(new HttpObjectAggregator(65536))
                                    // 较大的内容写处理
                                    .addLast(new ChunkedWriteHandler())
                                    // cors 处理器
                                    .addLast(new CorsHandler(corsConfig))
                                    // 为请求返回 ok 响应
                                    .addLast(new OkResponseHandler());
                        }
                    })
                    .bind(8889)
                    .syncUninterruptibly();
            channelFuture.channel().closeFuture().syncUninterruptibly();
        } finally {
            workerGroup.shutdownGracefully();
            bossGroup.shutdownGracefully();
        }
    }

}
```

- OkResponseHandler.java

为请求返回 ok 响应

```java
public class OkResponseHandler extends SimpleChannelInboundHandler<Object> {

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
        final FullHttpResponse response = new DefaultFullHttpResponse(
                HttpVersion.HTTP_1_1, HttpResponseStatus.OK, Unpooled.EMPTY_BUFFER);
        response.headers().set("custom-response-header", "Some value");
        ctx.writeAndFlush(response)
                .addListener(ChannelFutureListener.CLOSE);
    }

}
```



# 参考资料

[netty 官方例子](https://netty.io/4.1/xref/io/netty/example/http/file/package-summary.html)

[cors.html](https://github.com/netty/netty/blob/4.1/example/src/main/resources/cors/cors.html)

[cors code](https://netty.io/4.1/xref/io/netty/example/http/cors/package-summary.html)

* any list
{:toc}