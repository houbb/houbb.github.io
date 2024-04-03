---
layout: post
title: 从零手写是实现 tomcat-06-servlet 多线程处理
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: false
---

# 问题

现在的实现看起来一切都好，但是有一个问题，会导致阻塞。

## java 核心实现

```java
while(runningFlag && !serverSocket.isClosed()){
    //TRW
    try (Socket socket = serverSocket.accept()) {
        // 出入参
        InputStream inputStream = socket.getInputStream();
        MiniCatRequest request = new MiniCatRequest(inputStream);
        MiniCatResponse response = new MiniCatResponse(socket.getOutputStream());
        // 分发处理
        final RequestDispatcherContext dispatcherContext = new RequestDispatcherContext();
        dispatcherContext.setRequest(request);
        dispatcherContext.setResponse(response);
        dispatcherContext.setServletManager(servletManager);
        requestDispatcher.dispatch(dispatcherContext);
    } catch (Exception e) {
        logger.error("[MiniCat] server meet ex", e);
        //TODO: 如何保持健壮性？
    }
}
```

一个请求在执行处理时，下一次请求就会被阻塞。

这个可以通过把 servlet 耗时模拟较多，然后同时多个 table 页面调用可验证。

日志：

```
[INFO] [2024-04-03 18:21:03.264] [Thread-0] [c.g.h.m.d.MiniCatRequest.readFromStreamByBuffer] - [MiniCat] method=GET, url=/my
[INFO] [2024-04-03 18:21:03.266] [Thread-0] [c.g.h.m.s.s.MyMiniCatHttpServlet.doGet] - MyMiniCatServlet-get
[INFO] [2024-04-03 18:21:13.279] [Thread-0] [c.g.h.m.s.s.MyMiniCatHttpServlet.doGet] - MyMiniCatServlet-get-end

[INFO] [2024-04-03 18:21:13.282] [Thread-0] [c.g.h.m.d.MiniCatRequest.readFromStreamByBuffer] - [MiniCat] method=GET, url=/my
[INFO] [2024-04-03 18:21:13.282] [Thread-0] [c.g.h.m.s.s.MyMiniCatHttpServlet.doGet] - MyMiniCatServlet-get
[INFO] [2024-04-03 18:21:23.300] [Thread-0] [c.g.h.m.s.s.MyMiniCatHttpServlet.doGet] - MyMiniCatServlet-get-end
```

# v1-线程池优化

## 优化思路

通过线程池处理任务，从而避免阻塞。



## 核心代码

```java

```



# 开源地址

https://github.com/houbb/minicat

# 参考资料

https://www.cnblogs.com/isdxh/p/14199711.html

https://blog.csdn.net/u011662320/article/details/65631800

[java获取路径，文件名的方法总结](https://blog.csdn.net/dudefu011/article/details/49911287)

* any list
{:toc}