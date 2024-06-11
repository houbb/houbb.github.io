---
layout: post
title:  从零手写实现 nginx-17-nginx.conf 全局的默认配置
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

# 目标

这一节我们对 server 中的配置进一步优化，让用户使用起来更加方便。

配置的获取方式流程图：

![获取方式](https://gitee.com/houbinbin/imgbed/raw/master/img/%E9%85%8D%E7%BD%AE%E8%8E%B7%E5%8F%96%E6%96%B9%E5%BC%8F.drawio.png)

1）首先从当前 server 配置获取

2）不存在，则从全局的配置中获取

3）全局配置属性不存在，则直接从默认配置中获取。

# 核心代码调整

我们节选 2 个例子，配置的获取逻辑就变成下面的样子：

```java
private List<String> getHttpServerGzipTypes(final NgxConfig conf, final NgxBlock serverBlock) {
    // value
    NgxParam param = serverBlock.findParam("gzip_types");
    if(param != null) {
        return StringUtil.splitToList(param.getValue(), " ");
    }
    // http 默认
    NgxParam httpParam = conf.findParam("gzip_types");
    if(httpParam != null) {
        return StringUtil.splitToList(httpParam.getValue(), " ");
    }
    return NginxUserServerConfigDefaultConst.gzipTypes;
}

private long getHttpServerGzipMinLen(final NgxConfig conf, final NgxBlock serverBlock) {
    // value
    NgxParam param = serverBlock.findParam("gzip_min_len");
    if(param != null) {
        return Long.parseLong(param.getValue());
    }
    // http 默认
    NgxParam httpParam = conf.findParam("gzip_min_len");
    if(httpParam != null) {
        return Long.parseLong(httpParam.getValue());
    }
    return NginxUserServerConfigDefaultConst.gzipMinLength;
}

private String getHttpServerGzip(final NgxConfig conf, final NgxBlock serverBlock) {
    // value
    NgxParam param = serverBlock.findParam("gzip");
    if(param != null) {
        return param.getValue();
    }
    // http 默认
    NgxParam httpParam = conf.findParam("gzip");
    if(httpParam != null) {
        return httpParam.getValue();
    }
    return NginxUserServerConfigDefaultConst.gzip;
}
```


# 小结

这种配置的默认获取，在技术的实现上难度一般。

这个实现后续可以考虑统一优化，因为存在重复性实现。

但是出发点是站在用户的使用角度，让用户的使用更加便捷。

------------------------------------------------------------------------------------------------------------------------------------

# 参考资料

* any list
{:toc}