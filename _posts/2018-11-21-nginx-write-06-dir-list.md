---
layout: post
title:  从零手写实现 nginx-06-如何文件夹内容的自动索引展示?
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, nginx-in-action, sh]
published: true
---


# 前言

大家好，我是老马。很高兴遇到你。

我们为 java 开发者实现了 java 版本的 nginx, 可以处理静态文件

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

如果你想知道 servlet 如何处理的，可以参考我的另一个项目：

> 手写从零实现简易版 tomcat [https://github.com/houbb/minicat](https://github.com/houbb/minicat) 

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


# 系列

从零手写实现 nginx-01-为什么不能有 java 版本的 nginx?

从零手写实现 nginx-02-nginx 的核心能力

从零手写实现 nginx-03-nginx 基于 Netty 实现

从零手写实现 nginx-04-基于 netty 优化 http 出入参处理

从零手写实现 nginx-05-MIME类型（多用途互联网邮件扩展类型）

# 目标

这一节我们想实现如果访问的是文件夹，我们就把文件夹内容全部列出来。

然后用户可以自己点击跳转，实现文件夹的自动索引。

## 思路

直接判断是否为文件夹，如果是则列出所有的文件信息。

然后构建一个 html 返回即可。

# 核心实现

## 文件夹响应

```java
    /**
     * 构建文件夹结果
     * @param targetFile 目标文件
     * @param request 请求
     * @param nginxConfig 配置
     * @return 结果
     * @since 0.5.0
     * @author 老马啸西风
     */
    protected FullHttpResponse buildDirResp(File targetFile, final FullHttpRequest request, final NginxConfig nginxConfig) {
        try {
            String html = generateFileListHTML(targetFile, request, nginxConfig);

            byte[] fileContent = html.getBytes(nginxConfig.getCharset());
            FullHttpResponse response = buildCommentResp(fileContent, HttpResponseStatus.OK, request, nginxConfig);
            setContentType(response, "text/html;");
            return response;
        } catch (Exception e) {
            throw new Nginx4jException(e);
        }
    }
```

## 文件夹对应的内容

```java
protected String generateFileListHTML(File directory, final FullHttpRequest request, final NginxConfig nginxConfig) {
        // 确保传入的是一个目录
        if (!directory.isDirectory()) {
            return "Error: The specified path is not a directory.";
        }

        StringBuilder htmlBuilder = new StringBuilder();
        htmlBuilder.append("<html><head><title>File List</title></head><body>");
        htmlBuilder.append("<h1>File List</h1>");
        htmlBuilder.append("<ul>");

        File[] fileList = directory.listFiles();

        for (File file : fileList) {
            String fileName = file.getName();
            String fileLink = getFileLink(file, request, nginxConfig);
            htmlBuilder.append("<li><a href=\"").append(fileLink).append("\">").append(fileName).append("</a></li>");
        }

        htmlBuilder.append("</ul></body></html>");
        return htmlBuilder.toString();
}
```

其中链接的构建也很简单：

```java
protected String getFileLink(File file, final FullHttpRequest request, final NginxConfig nginxConfig) {
    String fileName = file.getName();
    return FileUtil.buildFullPath(request.uri(), fileName);
}
```

# 小结

本节我们实现了一个文件夹的自动索引支持，整体而言非常简单。

当然，也可以添加样式，或者是【..】之类的上级跳转，让用户体验更佳。我们暂时不做处理。

甚至做的更好一些，可以加上常见文件类型的 logo。

下一节，我们一起来看一下大文件分段请求的处理。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

# 参考资料

https://www.cnblogs.com/luxiaoxun/p/3959450.html

https://www.cnblogs.com/carl10086/p/6185095.html

https://blog.csdn.net/suifeng3051/article/details/22800171

https://blog.csdn.net/sinat_34163739/article/details/108820355

* any list
{:toc}