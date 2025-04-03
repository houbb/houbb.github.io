---
layout: post
title: okhttp-02-okhttp 与 ip 代理原理介绍
date: 2025-4-3 14:03:48 +0800
categories: [Java]
tags: [java, http, ip, proxy, sh]
published: true
---


# proxy 基础介绍

在OkHttp框架中，已经集成好了网络请求代理Proxy的功能，我们只需要调用如下API，即可实现使用代理地址访问目标服务器：

```java
OkHttpClient.Builder builder = new OkHttpClient.Builder();
 
// 设置代理地址
SocketAddress sa = new InetSocketAddress("代理服地址", 代理端口);
builder.proxy(new Proxy(Proxy.Type.HTTP, sa));
 
OkHttpClient client = builder.build();
Request.Builder requestBuilder = new Request.Builder();
requestBuilder.url("目标服务器地址");
client.newCall(requestBuilder.build());
```

那么  什么是代理？该如何实现代理呢？

我将用3篇文章来详细回答上面这个问题：

这篇文章主要是弄清楚代理(Proxy)的基本原理

接下来下一篇中，介绍防火墙的相关知识点

最后一篇通过介绍自己搭建代理服务器，实现合理翻墙

# Proxy基本原理

最常见的代理有2种：正向代理、反向代理。

## 正向代理（forward proxy）

是一个位于客户端和目标服务器之间的服务器(代理服务器)，为了从目标服务器取得内容，客户端向代理服务器发送一个请求并指定目标，然后代理服务器向目标服务器转交请求并将获得的内容返回给客户端。

这种代理其实在生活中是比较常见的，比如访问外国技术网站(Google、Medium等)，其用到的就是正向代理技术。

当我们想访问Google时，国内网络是无法直接访问的，但是通常我们可以通过各种代理工具来间接访问，这方面做得不错的有 Shadowsocks 和 Astrill等。

通过Shadowsocks和Astrill，浏览器会将所有用户请求先发送到代理服务器上，由代理服务器代为转发请求，并且该代理服务器也会将请求的响应再返回给了浏览。

整个流程如下图所示：

![正向代理](https://i-blog.csdnimg.cn/blog_migrate/7eb583f6e7acda90ac91516d87c76faf.png)

正向代理有个明显的特点：代理服务器是在客户端设置的

所以，正向代理，其实是"代理服务器"代理了"客户端"，去和"目标服务器"进行交互。

通过"正向代理服务器"访问"目标服务器"，"目标服务器"是不知道真正的"客户端"是谁的，甚至不知道访问自己的是一个"代理"。

## 反向代理（reverse proxy）

是指"服务器端"主动部署"代理服务器"来接受互联网上的连接请求，然后将请求转发给内部网络上的服务器，并将从服务器上得到的结果返回给客户端，此时代理服务器对外就表现为一个反向代理服务器。

生活中有一个例子非常像反向代理，当我们在网络平台上租房时，为了过滤掉不良中介，有时会筛选出租者为“个人”的选项。

我们以为我们接触的是房东，其实有时候也有可能并非房主本人，有可能是他的亲戚、朋友，甚至是二房东。但是我们并不知道和我们沟通的并不是真正的房东。这种帮助真正的房主租房的二房东其实就是反向代理服务器，这个过程就是反向代理。

对于常用的场景，就是我们在Web开发中用到的负载均衡服务器。

比如我们在浏览器中直接访问链接 baidu.com 时，我们以为这个链接就是百度的服务器地址，但实际上DNS查询到的baidu.com IP地址只是百度一个负载均衡的代理服务器地址。由这个负载均衡来将相应的请求分发到不同的内部服务器中进行处理。

最终结果也是由负载均衡器返回到客户端。

整个过程如下图所示：

![反向代理](https://i-blog.csdnimg.cn/blog_migrate/8a79bdc12749f6913292cb155fe46fab.png)

反向代理有个明显的特点：代理服务器是部署在服务器端的

所以，反向代理，其实是"代理服务器"代理了"目标服务器"，去和"客户端"进行交互。

通过反向代理服务器访问目标服务器时，客户端是不知道真正的目标服务器是谁的，甚至不知道自己访问的是一个代理。

## 总结

用一句话总结正向代理和反向代理的区别就是：**正向代理隐藏真实客户端，反向代理隐藏真实服务端**。


# 参开资料

[基本使用——OkHttp3详细使用教程](https://www.cnblogs.com/it-tsz/p/11748674.html)

[OkHttp解析大总结](https://blog.csdn.net/zxm317122667/article/details/53217644)

[OkHttp框架中Proxy的那点事儿（一）](https://blog.csdn.net/zxm317122667/article/details/111940287)

[How to Use a Proxy With OkHttp [Tutorial 2025]](https://www.zenrows.com/blog/okhttp-proxy#proxy-authentication)

[OkHttp proxy settings](https://stackoverflow.com/questions/37866902/okhttp-proxy-settings)

[HTTPS proxy is not supported](https://github.com/square/okhttp/issues/3787)


# 参考资料

https://github.com/browser-use/browser-use/blob/main/README.md

* any list
{:toc}