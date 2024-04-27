---
layout: post
title: 从零手写实现 tomcat-05-servlet 处理支持
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

# 整体思路

模拟实现 servlet 的逻辑处理，而不是局限于上一节的静态文件资源。

## 整体流程

1）定义 servlet 标准的 接口+实现

2）解析 web.xml 获取对应的 servlet 实例与 url 之间的映射关系。

3）调用请求

# 1. servlet 实现

## api 接口

servlet 接口，我们直接引入 servlet-api 的标准。

```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>${javax.servlet.version}</version>
</dependency>
```

## 抽象 servlet 定义

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

根据请求方式分别处理

## 简单的实现例子

下面是一个简单的处理实现：

- MyMiniCatHttpServlet.java

```java
package com.github.houbb.minicat.support.servlet;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.minicat.dto.MiniCatResponse;
import com.github.houbb.minicat.util.InnerHttpUtil;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 仅用于测试
 *
 * @since 0.3.0
 */
public class MyMiniCatHttpServlet extends AbstractMiniCatHttpServlet {

    private static final Log logger = LogFactory.getLog(MyMiniCatHttpServlet.class);

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) {
        String content = "MyMiniCatServlet-get";

        MiniCatResponse miniCatResponse = (MiniCatResponse) response;
        miniCatResponse.write(InnerHttpUtil.http200Resp(content));
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) {
        String content = "MyMiniCatServlet-post";

        MiniCatResponse miniCatResponse = (MiniCatResponse) response;
        miniCatResponse.write(InnerHttpUtil.http200Resp(content));
    }

}
```


# 2. web.xml 解析

## 说明

web.xml 需要解析处理。

比如这样的：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<web-app>

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

## 解析方式

### 接口定义

```java
package com.github.houbb.minicat.support.servlet;

import javax.servlet.Servlet;
import javax.servlet.http.HttpServlet;

/**
 * servlet 管理
 *
 * @since 0.3.0
 */
public interface IServletManager {

    /**
     * 注册 servlet
     *
     * @param url     url
     * @param servlet servlet
     */
    void register(String url, HttpServlet servlet);

    /**
     * 获取 servlet
     *
     * @param url url
     * @return servlet
     */
    HttpServlet getServlet(String url);

}
```

### web.xml

web.xml 的解析方式，核心的处理方式:

```java
    //1. 解析 web.xml
    //2. 读取对应的 servlet mapping
    //3. 保存对应的 url + servlet 示例到 servletMap
    private void loadFromWebXml() {
        InputStream resourceAsStream = this.getClass().getClassLoader().getResourceAsStream("web.xml");
        SAXReader saxReader = new SAXReader();
        try {
            Document document = saxReader.read(resourceAsStream);
            Element rootElement = document.getRootElement();

            List<Element> selectNodes = rootElement.selectNodes("//servlet");
            //1, 找到所有的servlet标签，找到servlet-name和servlet-class
            //2, 根据servlet-name找到<servlet-mapping>中与其匹配的<url-pattern>
            for (Element element : selectNodes) {
                /**
                 * 1, 找到所有的servlet标签，找到servlet-name和servlet-class
                 */
                Element servletNameElement = (Element) element.selectSingleNode("servlet-name");
                String servletName = servletNameElement.getStringValue();
                Element servletClassElement = (Element) element.selectSingleNode("servlet-class");
                String servletClass = servletClassElement.getStringValue();

                /**
                 * 2, 根据servlet-name找到<servlet-mapping>中与其匹配的<url-pattern>
                 */
                //Xpath表达式：从/web-app/servlet-mapping下查询，查询出servlet-name=servletName的元素
                Element servletMapping = (Element) rootElement.selectSingleNode("/web-app/servlet-mapping[servlet-name='" + servletName + "']'");

                String urlPattern = servletMapping.selectSingleNode("url-pattern").getStringValue();
                HttpServlet httpServlet = (HttpServlet) Class.forName(servletClass).newInstance();

                this.register(urlPattern, httpServlet);
            }

        } catch (Exception e) {
            logger.error("[MiniCat] read web.xml failed", e);

            throw new MiniCatException(e);
        }
    }
```

解析之后的 HttpServlet 全部放在 servletMap 中。

然后在对应的 url 我们选取处理即可。

# 3. url 的处理

## 说明

根据 url 找到对应的 servlet 进行处理。

主要分为 3 大类：

1）url 不存在

2）url 为 html 等静态资源

3) servlet 的处理逻辑

## 设计

我们把这部分抽象为接口：

```java
public void dispatch(RequestDispatcherContext context) {
    final MiniCatRequest request = context.getRequest();
    final MiniCatResponse response = context.getResponse();
    final IServletManager servletManager = context.getServletManager();
    // 判断文件是否存在
    String requestUrl = request.getUrl();
    if (StringUtil.isEmpty(requestUrl)) {
        emptyRequestDispatcher.dispatch(context);
    } else {
        // 静态资源
        if (requestUrl.endsWith(".html")) {
            staticHtmlRequestDispatcher.dispatch(context);
        } else {
            // servlet 
            servletRequestDispatcher.dispatch(context);
        }
    }
}
```

## servlet 例子

如果是 servlet 的话，核心处理逻辑如下：

```java
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
```

# 4. 读取 request 的问题修复

## 问题

发现 request 读取输入流的时候，有时候读取为空，但是页面明明是正常请求的。


## 原始代码

```java
private void readFromStream() {
    try {
        //从输入流中获取请求信息
        int count = inputStream.available();
        byte[] bytes = new byte[count];
        int readResult = inputStream.read(bytes);
        String inputsStr = new String(bytes);
        logger.info("[MiniCat] readCount={}, input stream {}", readResult, inputsStr);
        if(readResult <= 0) {
            logger.info("[MiniCat] readCount is empty, ignore handle.");
            return;
        }
        //获取第一行数据
        String firstLineStr = inputsStr.split("\\n")[0];  //GET / HTTP/1.1
        String[] strings = firstLineStr.split(" ");
        this.method = strings[0];
        this.url = strings[1];
        logger.info("[MiniCat] method={}, url={}", method, url);
    } catch (IOException e) {
        logger.error("[MiniCat] readFromStream meet ex", e);
        throw new RuntimeException(e);
    }
}
```

## 问题分析

问题其实出在 `inputStream.available()` 中，网络流（如 Socket 流）与文件流不同，网络流的 `available()` 方法可能返回 0，即使实际上有数据可读。这是因为网络通讯是间断性的，数据可能分多个批次到达。

## 修正

由于 `available()` 方法在网络流中可能不准确，您可以尝试不使用此方法来预分配字节数组。

相反，您可以使用一个固定大小的缓冲区，或者使用 `read()` 方法的循环来动态读取数据。

```java
    /**
     * 直接根据 available 有时候读取不到数据
     * @since 0.3.0
     */
    private void readFromStreamByBuffer() {
        byte[] buffer = new byte[1024]; // 使用固定大小的缓冲区
        int bytesRead = 0;

        try {
            while ((bytesRead = inputStream.read(buffer)) != -1) { // 循环读取数据直到EOF
                String inputStr = new String(buffer, 0, bytesRead);

                // 检查是否读取到完整的HTTP请求行
                if (inputStr.contains("\n")) {
                    // 获取第一行数据
                    String firstLineStr = inputStr.split("\\n")[0];
                    String[] strings = firstLineStr.split(" ");
                    this.method = strings[0];
                    this.url = strings[1];

                    logger.info("[MiniCat] method={}, url={}", method, url);
                    break; // 退出循环，因为我们已经读取到请求行
                }
            }

            if ("".equals(method)) {
                logger.info("[MiniCat] No HTTP request line found, ignoring.");
                // 可以选择抛出异常或者返回空请求对象
            }
        } catch (IOException e) {
            logger.error("[MiniCat] readFromStream meet ex", e);
            throw new RuntimeException(e);
        }
    }
```

# 开源地址

```
 /\_/\  
( o.o ) 
 > ^ <
```

mini-cat 是简易版本的 tomcat 实现。别称【嗅虎】(心有猛虎，轻嗅蔷薇。)

开源地址：[https://github.com/houbb/minicat](https://github.com/houbb/minicat)

# 参考资料

https://www.cnblogs.com/isdxh/p/14199711.html

https://blog.csdn.net/u011662320/article/details/65631800

[java获取路径，文件名的方法总结](https://blog.csdn.net/dudefu011/article/details/49911287)

* any list
{:toc}