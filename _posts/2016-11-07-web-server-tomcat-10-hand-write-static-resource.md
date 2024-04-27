---
layout: post
title: 从零手写实现 tomcat-10-static resource 静态资源文件
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 拓展阅读

[Netty 权威指南-01-BIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-01-bio)

[Netty 权威指南-02-NIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-02-nio)

[Netty 权威指南-03-AIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-03-aio)

[Netty 权威指南-04-为什么选择 Netty？Netty 入门教程](https://houbb.github.io/2019/05/10/netty-definitive-gudie-04-why-netty)

# 前言

## 静态资源文件都有啥？

在Tomcat中，静态文件通常指的是那些不需要服务器动态处理就可以直接返回给客户端的文件，比如HTML页面、CSS样式表、JavaScript脚本、图片等。

这些文件的内容是固定的，不会根据每个请求而改变。

## 举个板栗

处理静态文件请求的过程，可以比作一个小卖部的自动售货机：

1. **请求静态文件**：当顾客（客户端）想要一瓶饮料（请求静态文件），他们会向自动售货机（Tomcat服务器）投入硬币（发送HTTP请求）。

2. **查找文件**：自动售货机会检查库存（查找服务器上的文件系统），看看顾客想要的饮料（请求的文件）是否有货。

3. **返回文件**：如果饮料（文件）有货，自动售货机会将饮料（文件内容）直接推出（返回给客户端）。顾客拿到饮料就完成了购买。

4. **处理失败**：如果饮料（文件）缺货，自动售货机会告诉顾客并退回硬币（返回错误响应，如404 Not Found）。

下面是一个模拟的自动售货机处理顾客请求的步骤，用以比喻Tomcat处理静态文件请求的过程：

```
顾客投入硬币（客户端发送HTTP请求到Tomcat服务器）

    +------+      请求文件     +------+      查找文件
    | 顾客 |  -------------->| 售货机 |  <---+ 查找文件系统
    +------+                 +------+      |
                                |         |
    +------+      返回文件     +------+      |
    | 顾客 |  <--------------| 售货机 |  <---+ 文件存在
    +------+                 +------+      |
                                |         |
                                |         |
    +------+      处理失败     +------+      |
    | 顾客 |  <--------------| 售货机 |  <---+ 文件不存在
    +------+                 +------+      |
                                |
顾客拿到饮料（客户端接收到文件内容）
```

# 自己实现

相比 serlvet，这个就要简单的多。

但是我们还是要处理好统一的请求分发逻辑。

## 请求的分发

静态资源文件的处理

```java
package com.github.houbb.minicat.support.request;

import com.github.houbb.heaven.util.io.FileUtil;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.minicat.bs.MiniCatBootstrap;
import com.github.houbb.minicat.dto.IMiniCatRequest;
import com.github.houbb.minicat.dto.IMiniCatResponse;
import com.github.houbb.minicat.support.context.MiniCatContextConfig;
import com.github.houbb.minicat.util.InnerHttpUtil;
import com.github.houbb.minicat.util.InnerResourceUtil;

/**
 * 静态页面
 * @author 老马啸西风
 */
public class StaticHtmlRequestDispatcher implements IRequestDispatcher {

    private static final Log logger = LogFactory.getLog(StaticHtmlRequestDispatcher.class);

    public void dispatch(final IMiniCatRequest request,
                         final IMiniCatResponse response,
                         final MiniCatContextConfig config) {

        String absolutePath = InnerResourceUtil.buildFullPath(config.getBaseDir(), request.getUrl());
        String content = FileUtil.getFileContent(absolutePath);
        logger.info("[MiniCat] static html path: {}, content={}", absolutePath, content);
        String html = InnerHttpUtil.http200Resp(content);
        response.write(html);
    }

}
```

## 调用入口

在接收到请求，根据请求地址统一分发处理。

不同分发逻辑的匹配

```java
package com.github.houbb.minicat.support.request;

/**
 * 请求分发管理器
 *
 * @since 0.3.0
 */
public class RequestDispatcherManager implements IRequestDispatcher {

    private static final Log logger = LogFactory.getLog(RequestDispatcherManager.class);

    private final IRequestDispatcher emptyRequestDispatcher = new EmptyRequestDispatcher();
    private final IRequestDispatcher servletRequestDispatcher = new ServletRequestDispatcher();
    private final IRequestDispatcher staticHtmlRequestDispatcher = new StaticHtmlRequestDispatcher();

    @Override
    public void dispatch(final IMiniCatRequest request,
                         final IMiniCatResponse response,
                         final MiniCatContextConfig config) {
        final IServletManager servletManager = config.getServletManager();


        // 判断文件是否存在
        String requestUrl = request.getUrl();

        // 获取请求分发
        final IRequestDispatcher requestDispatcher = getRequestDispatcher(requestUrl);

        // 正式分发
        requestDispatcher.dispatch(request, response, config);
    }

    private IRequestDispatcher getRequestDispatcher(String requestUrl) {
        if (StringUtil.isEmpty(requestUrl)) {
            return emptyRequestDispatcher;
        } else {
            if (requestUrl.endsWith(".html")) {
                return staticHtmlRequestDispatcher;
            } else {
                return servletRequestDispatcher;
            }
        }
    }

}
```

调用逻辑：

```java
class MiniCatServerHandler extends ChannelInboundHandlerAdapter {

    // ... 省略

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        // ... 省略

        // 分发调用
        requestDispatcher.dispatch(request, response, miniCatContextConfig);

        // ... 省略
    }

    // ... 省略
}
```


这样，一个简单的静态资源文件处理流程就实现了。

# 开源地址

```
 /\_/\  
( o.o ) 
 > ^ <
```

mini-cat 是简易版本的 tomcat 实现。别称【嗅虎】(心有猛虎，轻嗅蔷薇。)

开源地址：[https://github.com/houbb/minicat](https://github.com/houbb/minicat)

# 参考资料

https://www.cnblogs.com/yuhushen/p/15396612.html

* any list
{:toc}