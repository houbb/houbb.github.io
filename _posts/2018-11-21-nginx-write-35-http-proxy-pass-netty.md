---
layout: post
title:  从零手写实现 nginx-35-proxy_pass netty 如何实现？
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, nginx-in-action, sh]
published: true
---

# 前言

大家好，我是老马。很高兴遇到你。

我们为 java 开发者实现了 java 版本的 nginx

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

如果你想知道 servlet 如何处理的，可以参考我的另一个项目：

> 手写从零实现简易版 tomcat [minicat](https://github.com/houbb/minicat) 

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

[从零手写实现 nginx-17-nginx 默认配置优化](https://houbb.github.io/2018/11/22/nginx-write-17-nginx-conf-global-default)

[从零手写实现 nginx-18-nginx 请求头+响应头操作](https://houbb.github.io/2018/11/22/nginx-write-18-nginx-conf-header-oper)

[从零手写实现 nginx-19-nginx cors](https://houbb.github.io/2018/11/22/nginx-write-19-cors)

[从零手写实现 nginx-20-nginx 占位符 placeholder](https://houbb.github.io/2018/11/22/nginx-write-20-placeholder)

[从零手写实现 nginx-21-nginx modules 模块信息概览](https://houbb.github.io/2018/11/22/nginx-write-21-modules-overview)

[从零手写实现 nginx-22-nginx modules 分模块加载优化](https://houbb.github.io/2018/11/22/nginx-write-22-modules-load)

[从零手写实现 nginx-23-nginx cookie 的操作处理](https://houbb.github.io/2018/11/22/nginx-write-23-cookie-oper)

[从零手写实现 nginx-24-nginx IF 指令](https://houbb.github.io/2018/11/22/nginx-write-24-directives-if)

[从零手写实现 nginx-25-nginx map 指令](https://houbb.github.io/2018/11/22/nginx-write-25-directives-map)

[从零手写实现 nginx-26-nginx rewrite 指令](https://houbb.github.io/2018/11/22/nginx-write-26-directives-rewrite)

[从零手写实现 nginx-27-nginx return 指令](https://houbb.github.io/2018/11/22/nginx-write-27-directives-return)

[从零手写实现 nginx-28-nginx error_pages 指令](https://houbb.github.io/2018/11/22/nginx-write-28-directives-error-pages)

[从零手写实现 nginx-29-nginx try_files 指令](https://houbb.github.io/2018/11/22/nginx-write-29-directives-try_files)

[从零手写实现 nginx-30-nginx proxy_pass upstream 指令](https://houbb.github.io/2018/11/22/nginx-write-30-proxy-pass)

[从零手写实现 nginx-31-nginx load-balance 负载均衡](https://houbb.github.io/2018/11/22/nginx-write-31-load-balance)

[从零手写实现 nginx-32-nginx load-balance 算法 java 实现](https://houbb.github.io/2018/11/22/nginx-write-32-load-balance-java-impl)

[从零手写实现 nginx-33-nginx http proxy_pass 测试验证](https://houbb.github.io/2018/11/22/nginx-write-33-http-proxy-pass-test)

[从零手写实现 nginx-34-proxy_pass 配置加载处理](https://houbb.github.io/2018/11/22/nginx-write-34-http-proxy-pass-config-load)

[从零手写实现 nginx-35-proxy_pass netty 如何实现？](https://houbb.github.io/2018/11/22/nginx-write-35-http-proxy-pass-netty)

# netty 如何实现反向代理?

## 整体思路

1. 根据原始的 request 请求，构建新的请求对象 forwardedRequest

2. 根据指定的路由策略，获取一个目标服务器。

3. 根据目标服务器的 host+port，用 netty 直接模拟 http 客户端，直接访问远程服务端，然后把远程的响应写回到当前的客户端 resp 

## 实现代码

核心实现如下：

```java
/**
 * netty 实现反向代理
 * 
 * @since 0.27.0
 * @author 老马啸西风
 */
public class NginxRequestDispatchProxyPass extends AbstractNginxRequestDispatch {

    private static final Log logger = LogFactory.getLog(NginxRequestDispatchProxyPass.class);

    @Override
    public void doDispatch(NginxRequestDispatchContext context) {
        // 原始的请求
        final FullHttpRequest request = context.getRequest();
        final ChannelHandlerContext ctx = context.getCtx();

        // 创建一个新的 FullHttpRequest 转发到目标服务器
        FullHttpRequest forwardedRequest = new DefaultFullHttpRequest(
                request.protocolVersion(), request.method(), request.uri(), request.content().retainedDuplicate());
        forwardedRequest.headers().set(request.headers());

        final NginxLoadBalanceConfig nginxLoadBalanceConfig = context.getBalanceConfig();

        // 创建一个新的 Bootstrap 进行 HTTP 请求
        Bootstrap b = new Bootstrap();
        b.group(ctx.channel().eventLoop())
                .channel(NioSocketChannel.class)
                .handler(new ChannelInitializer<Channel>() {
                    @Override
                    protected void initChannel(Channel ch) throws Exception {
                        //...

                        ch.pipeline().addLast(new SimpleChannelInboundHandler<FullHttpResponse>() {
                            @Override
                            protected void channelRead0(ChannelHandlerContext clientCtx, FullHttpResponse response) throws Exception {
                                // 将目标服务器的响应写回到客户端
                                FullHttpResponse clientResponse = new DefaultFullHttpResponse(
                                        response.protocolVersion(), response.status(), response.content().retainedDuplicate());

                                clientResponse.headers().set(response.headers());

                                ctx.writeAndFlush(clientResponse).addListener(ChannelFutureListener.CLOSE);
                                clientCtx.close();
                            }

                            @Override
                            public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
                                logger.error("exceptionCaught meet ex", cause);
                                ctx.close();
                            }
                        });
                    }
                });

        // 连接到目标服务器并发送请求
        final IServer server = getActualServer(nginxLoadBalanceConfig);
        b.connect(server.host(), server.port()).addListener((ChannelFutureListener) future -> {
            if (future.isSuccess()) {
                future.channel().writeAndFlush(forwardedRequest);
            } else {
                ctx.close();
            }
        });
    }
}
```

## 负载均衡

负载均衡策略，可以看我以前的文章：

> [从零手写实现 nginx-32-load balance 负载均衡算法 java 实现](https://houbb.github.io/2018/11/22/nginx-write-32-load-balance-java-impl)

# 小结

到这里开始，我们基本实现了反向代理。

当然，其中还有很多细节需要处理。

# 参考资料

* any list
{:toc}