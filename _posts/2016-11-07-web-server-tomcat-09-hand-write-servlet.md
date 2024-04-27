---
layout: post
title: 从零手写实现 tomcat-09-servlet 处理类
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 创作缘由

平时使用 tomcat 等 web 服务器不可谓不多，但是一直一知半解。

于是想着自己实现一个简单版本，学习一下 tomcat 的精髓。

# 系列教程

[从零手写实现 apache Tomcat-01-入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat-02-hand-write-overview)

[从零手写实现 apache Tomcat-02-web.xml 入门详细介绍](https://houbb.github.io/2016/11/07/web-server-tomcat-02-hand-write-web-xml)

[从零手写实现 tomcat-03-基本的 socket 实现](https://houbb.github.io/2016/11/07/web-server-tomcat-03-hand-write-simple-socket)

[从零手写实现 tomcat-04-请求和响应的抽象](https://houbb.github.io/2016/11/07/web-server-tomcat-04-hand-write-request-and-resp)

[从零手写实现 tomcat-05-servlet 处理支持](https://houbb.github.io/2016/11/07/web-server-tomcat-05-hand-write-servlet-web-xml)

[从零手写实现 tomcat-06-servlet bio/thread/nio/netty 池化处理](https://houbb.github.io/2016/11/07/web-server-tomcat-06-hand-write-thread-pool)

[从零手写实现 tomcat-07-war 如何解析处理三方的 war 包？](https://houbb.github.io/2016/11/07/web-server-tomcat-07-hand-write-war)

[从零手写实现 tomcat-08-tomcat 如何与 springboot 集成？](https://houbb.github.io/2016/11/07/web-server-tomcat-08-hand-write-embed)

[从零手写实现 tomcat-09-servlet 处理类](https://houbb.github.io/2016/11/07/web-server-tomcat-09-hand-write-servlet)

[从零手写实现 tomcat-10-static resource 静态资源文件](https://houbb.github.io/2016/11/07/web-server-tomcat-10-hand-write-static-resource)

[从零手写实现 tomcat-11-filter 过滤器](https://houbb.github.io/2016/11/07/web-server-tomcat-11-hand-write-filter)

[从零手写实现 tomcat-12-listener 监听器](https://houbb.github.io/2016/11/07/web-server-tomcat-12-hand-write-listener)

# 前言

还记得我们最初 web.xml 中的 servlet 吗？

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<web-app>
    <!-- servlet 配置 -->
    <servlet>
        <servlet-name>my</servlet-name>
        <servlet-class>com.github.houbb.minicat.support.servlet.MyMiniCatHttpServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>my</servlet-name>
        <url-pattern>/my</url-pattern>
    </servlet-mapping>
</web-app>
```

servlet 是什么？我们又该如何解析实现呢？

## servlet 是什么？

Servlet可以被看作是Tomcat中的一个“服务员”。

就像餐厅里的服务员负责接待顾客、接收点餐、上菜等任务一样，Servlet在Web服务器中负责处理网络请求，并返回响应结果。

Servlet的主要工作包括：

1. **接收请求**：当浏览器（客户端）发送一个HTTP请求到Tomcat时，这个请求会被映射到一个特定的Servlet。

2. **处理请求**：Servlet会根据请求的类型（比如GET或POST）和内容，执行相应的处理逻辑。比如，如果请求是要显示一个网页，Servlet就会生成这个网页的内容。

3. **生成响应**：处理完请求后，Servlet会生成一个HTTP响应，这个响应包含了客户端需要的信息，比如网页内容、图片、视频等。

4. **返回响应**：最后，Servlet把生成的响应返回给客户端，客户端收到响应后，就可以展示网页或者进行其他操作。

## servlet 处理流程

1. 客户端（比如浏览器）发送一个HTTP请求到Tomcat。

2. Tomcat的请求分发器（RequestDispatcher）会根据请求的URL，找到对应的Servlet。

3. Tomcat调用Servlet的`service()`方法，把请求交给Servlet处理。在`service()`方法内部，Servlet会根据HTTP请求的方法（GET、POST等）调用相应的处理方法。

4. Servlet处理请求，并生成响应。比如，如果是GET请求，Servlet可能会查询数据库，生成一个网页；如果是POST请求，Servlet可能会处理表单数据，执行一些业务逻辑。

5. Servlet把生成的响应返回给Tomcat。

6. Tomcat把响应发送回客户端。

通过使用Servlet，你可以灵活地处理各种HTTP请求，并生成相应的响应。

## 举个板栗

好的，让我们用餐厅的例子来比喻Tomcat中的Servlet：

想象一下，你走进一家餐厅，服务员会过来接待你。

服务员会问你需要什么服务，这就像是HTTP请求。在Tomcat中，Servlet就扮演了服务员的角色。

1. **接收点餐**：当顾客（客户端）进入餐厅（访问网站），服务员（Servlet）会过来记录顾客的点餐（接收HTTP请求）。

2. **处理点餐**：服务员会根据顾客的点餐内容（请求类型，如GET或POST），去厨房（后端逻辑）准备食物（处理请求）。

3. **上菜**：食物准备好后，服务员会将食物（响应内容）端上桌（生成HTTP响应）。

4. **结账**：顾客享用完毕后，服务员会拿来账单（请求结束，返回响应），顾客结账离开。

Servlet通过这种方式，可以处理各种类型的点餐（请求），无论是简单的查看菜单（静态页面请求），还是复杂的定制菜品（复杂的业务逻辑请求）。

通过合理设计Servlet，餐厅（网站）可以提供丰富多样的服务（功能）。

# 自己实现

## 接口定义

这里就不定义了，直接复用 servlet 的标准 api

## 抽象类

我们实现一个基础的抽象类：

```java
package com.github.houbb.minicat.support.servlet;

import com.github.houbb.minicat.constant.HttpMethodType;

import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public abstract class AbstractMiniCatHttpServlet extends HttpServlet {

    public abstract void doGet(HttpServletRequest request, HttpServletResponse response);

    public abstract void doPost(HttpServletRequest request, HttpServletResponse response);

    @Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) req;
        HttpServletResponse httpServletResponse = (HttpServletResponse) res;
        if(HttpMethodType.GET.getCode().equalsIgnoreCase(httpServletRequest.getMethod())) {
            this.doGet(httpServletRequest, httpServletResponse);
            return;
        }

        this.doPost(httpServletRequest, httpServletResponse);
    }

}
```

## 接口实现

简单的实现

```java
package com.github.houbb.minicat.support.servlet;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.minicat.dto.IMiniCatResponse;
import com.github.houbb.minicat.dto.MiniCatResponseBio;
import com.github.houbb.minicat.util.InnerHttpUtil;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 仅用于测试
 *
 * @since 0.3.0
 * @author 老马啸西风
 */
public class MyMiniCatHttpServlet extends AbstractMiniCatHttpServlet {

    private static final Log logger = LogFactory.getLog(MyMiniCatHttpServlet.class);


    // 方法实现
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) {
        logger.info("MyMiniCatServlet-get");
        // 模拟耗时
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        String content = "MyMiniCatServlet-get";
        IMiniCatResponse miniCatResponse = (IMiniCatResponse) response;
        miniCatResponse.write(InnerHttpUtil.http200Resp(content));
        logger.info("MyMiniCatServlet-get-end");
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) {
        String content = "MyMiniCatServlet-post";

        IMiniCatResponse miniCatResponse = (IMiniCatResponse) response;
        miniCatResponse.write(InnerHttpUtil.http200Resp(content));
    }

}
```

# 应用启动解析

那么, 应该如何解析处理 servlet 呢？

## DefaultServletManager

定义一个 servlet 的管理类

```java
package com.github.houbb.minicat.support.servlet.manager;

import com.github.houbb.heaven.util.lang.StringUtil;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.minicat.exception.MiniCatException;

import javax.servlet.http.HttpServlet;
import java.util.HashMap;
import java.util.Map;

/**
 * servlet 管理
 *
 * 基于 web.xml 的读取解析
 * @since 0.5.0
 * @author 老马啸西风
 */
public class DefaultServletManager implements IServletManager {

    // 基础属性省略

    @Override
    public void register(String url, HttpServlet servlet) {
        logger.info("[MiniCat] register servlet, url={}, servlet={}", url, servlet.getClass().getName());

        servletMap.put(url, servlet);
    }

    @Override
    public HttpServlet getServlet(String url) {
        return servletMap.get(url);
    }

}
```

## register 的时机

以本地的 web.xml 解析为例

1) 解析对应的 web.xml 中的 servlet 

```java
protected void processWebServlet(Element root, final IServletManager servletManager) {
    Map<String, String> servletClassNameMap = new HashMap<>();
    Map<String, String> urlPatternMap = new HashMap<>();
    List<Element> servletElements = root.elements("servlet");
    for (Element servletElement : servletElements) {
        String servletName = servletElement.elementText("servlet-name");
        String servletClass = servletElement.elementText("servlet-class");
        servletClassNameMap.put(servletName, servletClass);
    }
    List<Element> urlMappingElements = root.elements("servlet-mapping");
    for (Element urlElem : urlMappingElements) {
        String servletName = urlElem.elementText("servlet-name");
        String urlPattern = urlElem.elementText("url-pattern");
        urlPatternMap.put(servletName, urlPattern);
    }
    handleServletConfigMap(servletClassNameMap, urlPatternMap, servletManager);
}
```

2) 注册对应的信息

```java
protected void handleServletConfigMap(Map<String, String> servletClassNameMap, Map<String, String> urlPatternMap, final IServletManager servletManager) {
    try {
        for (Map.Entry<String, String> urlPatternEntry : urlPatternMap.entrySet()) {
            String servletName = urlPatternEntry.getKey();
            String urlPattern = urlPatternEntry.getValue();
            String className = servletClassNameMap.get(servletName);
            if (StringUtil.isEmpty(className)) {
                throw new MiniCatException("className not found for servletName: " + servletName);
            }
            Class servletClazz = Class.forName(className);
            HttpServlet httpServlet = (HttpServlet) servletClazz.newInstance();
            // 构建
            String fullUrlPattern = buildFullUrlPattern(urlPattern);
            servletManager.register(fullUrlPattern, httpServlet);
        }
    } catch (ClassNotFoundException | InstantiationException | IllegalAccessException e) {
        throw new MiniCatException(e);
    }
}
```

## 调用的时机

servlet 注册好了，我们什么时候使用呢？

当然是根据请求地址 url 分发处理了。

```java
public class ServletRequestDispatcher implements IRequestDispatcher {

    private static final Log logger = LogFactory.getLog(ServletRequestDispatcher.class);

    public void dispatch(final IMiniCatRequest request,
                         final IMiniCatResponse response,
                         final MiniCatContextConfig config) {
        final IServletManager servletManager = config.getServletManager();

        // 直接和 servlet 映射
        final String requestUrl = request.getUrl();
        HttpServlet httpServlet = servletManager.getServlet(requestUrl);
        if(httpServlet == null) {
            logger.warn("[MiniCat] requestUrl={} mapping not found", requestUrl);
            response.write(InnerHttpUtil.http404Resp());
        } else {
            // 正常的逻辑处理
            try {
                httpServlet.service(request, response);
            } catch (Exception e) {
                logger.error("[MiniCat] http servlet handle meet ex", e);

                throw new MiniCatException(e);
            }
        }
    }
}
```

这样，一个简单的 servlet 处理流程就实现了。

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