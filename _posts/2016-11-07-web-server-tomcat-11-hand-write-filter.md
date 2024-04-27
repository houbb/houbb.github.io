---
layout: post
title: 从零手写实现 tomcat-11-filter 过滤器
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

还记得我们最初 web.xml 中的 filter 吗？

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<web-app>
    <!-- Filter 配置 -->
    <filter>
        <filter-name>LoggingFilter</filter-name>
        <filter-class>com.github.houbb.minicat.support.filter.MyMiniCatLoggingHttpFilter</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>LoggingFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
</web-app>
```

他的作用是什么？我们又该如何解析实现呢？


## filter 是什么?

在Tomcat中，Filter可以被看作是一个网络请求的“安检员”。

就像你进火车站或机场前要经过安检一样，网络请求在到达它最终的目的地（比如一个Servlet）之前，也可以先经过一些Filter的处理。

Filter主要有以下几个作用：

过滤请求：Filter可以检查进入的请求，看看它是否满足某些条件。如果不满足，Filter可以拒绝这个请求，就像安检员发现你携带了违禁品，就不让你进站一样。

修改请求：除了检查请求，Filter还可以修改请求。比如，它可以添加一些请求头，或者改变请求参数等。

过滤响应：同样，Filter也可以检查服务器的响应，看看它是否满足某些条件。如果不满足，Filter可以修改这个响应。

修改响应：除了检查响应，Filter也可以修改响应的内容。比如，它可以添加一些额外的信息，或者改变响应的格式等。

## tomcat 如何处理 filter 的？

客户端（比如浏览器）发送一个请求到Tomcat。

Tomcat的连接器（Connector）接收到这个请求。

请求首先经过所有的Filter链。每个Filter都有机会检查和修改这个请求。

一旦所有的Filter都处理完毕，请求就到达它的目标Servlet。

Servlet处理请求，并生成一个响应。

响应再次经过Filter链，每个Filter都有机会检查和修改这个响应。

最后，响应被发送回客户端。

# 自己实现

## 接口定义

这里就不定义了，直接复用 servlet 的标准 api

## 接口实现

简单的实现

```java
package com.github.houbb.minicat.support.filter;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpFilter;
import java.io.IOException;

/**
 * 
 * @since 0.6.0
 */
public class MyMiniCatLoggingHttpFilter extends HttpFilter {

    private static final Log logger = LogFactory.getLog(MyMiniCatLoggingHttpFilter.class);

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        logger.info("[MiniCat] MyMiniCatLoggingHttpFilter#doFilter req={}, resp={}", req, res);

        super.doFilter(req, res, chain);
    }

}
```

# 应用启动解析

## DefaultFilterManager

定义一个 filter 的管理类

```java
package com.github.houbb.minicat.support.filter.manager;

import com.github.houbb.heaven.util.lang.StringUtil;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.minicat.exception.MiniCatException;
import com.github.houbb.minicat.support.servlet.manager.DefaultServletManager;

import javax.servlet.Filter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * filter 管理
 *
 * @since 0.6.0
 * @author 老马啸西风
 */
public class DefaultFilterManager implements IFilterManager {

    //... 省略基础属性

    @Override
    public void register(String url, Filter filter) {
        logger.info("[MiniCat] register Filter, url={}, Filter={}", url, filter.getClass().getName());

        filterMap.put(url, filter);
    }

    @Override
    public Filter getFilter(String url) {
        return filterMap.get(url);
    }

    @Override
    public List<Filter> getMatchFilters(String url) {
        List<Filter> resultList = new ArrayList<>();

        for(Map.Entry<String, Filter> entry : filterMap.entrySet()) {
            String urlPattern = entry.getKey();
            if(url.matches(urlPattern)) {
                resultList.add(entry.getValue());
            }
        }

        return resultList;
    }


}
```

## register 的时机

以本地的 web.xml 解析为例

```java
/**
 * 处理 web 文件
 */
protected void processWebXml() {
    try {
        SAXReader reader = new SAXReader();
        Document document = reader.read(webXmlFile);
        Element root = document.getRootElement();

        // ...

        //2. 处理 filter
        final IFilterManager filterManager = this.miniCatContextConfig.getFilterManager();
        processWebFilter(root, filterManager);

        // ...
    } catch (Exception e) {
        throw new MiniCatException(e);
    }
}
```

解析对应的 web.xml 标签内容，注册对应信息：

```java
protected void handleFilterConfigMap(Map<String, String> filterClassNameMap, Map<String, String> urlPatternMap, final IFilterManager filterManager) {
    try {
        for (Map.Entry<String, String> urlPatternEntry : urlPatternMap.entrySet()) {
            String filterName = urlPatternEntry.getKey();
            String urlPattern = urlPatternEntry.getValue();
            String className = filterClassNameMap.get(filterName);
            if (StringUtil.isEmpty(className)) {
                throw new MiniCatException("className not found for filterName: " + filterName);
            }
            Class servletClazz = Class.forName(className);
            Filter httpServlet = (Filter) servletClazz.newInstance();
            // 构建
            String fullUrlPattern = buildFullUrlPattern(urlPattern);
            filterManager.register(fullUrlPattern, httpServlet);
        }
    } catch (ClassNotFoundException | InstantiationException | IllegalAccessException e) {
        throw new MiniCatException(e);
    }
}
```

这样就可以后面调用了。

## 调用的时机

我们什么时候调用呢？

当然是一个请求地址过来了，看是否有匹配的 filter，然后进行处理。

```java
@Override
public void dispatch(final IMiniCatRequest request,
                     final IMiniCatResponse response,
                     final MiniCatContextConfig config) {
    final IServletManager servletManager = config.getServletManager();
    // 判断文件是否存在
    String requestUrl = request.getUrl();
    //before
    List<Filter> filterList = config.getFilterManager().getMatchFilters(requestUrl);
    // 获取请求分发
    final IRequestDispatcher requestDispatcher = getRequestDispatcher(requestUrl);
    // 请求前
    filterList.forEach(filter -> {
        try {
            filter.doFilter(request, response, null);
        } catch (IOException | ServletException e) {
            throw new RuntimeException(e);
        }
    });
    // 正式分发
    requestDispatcher.dispatch(request, response, config);
}
```

这样，一个基础的 filter 功能就实现了。

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