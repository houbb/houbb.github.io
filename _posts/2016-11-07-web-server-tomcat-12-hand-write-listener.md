---
layout: post
title: 从零手写实现 tomcat-12-listener 监听器
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

还记得我们最初 web.xml 中的 listener 吗？

```xml
<!-- Listener 配置 -->
<listener>
    <listener-class>com.github.houbb.minicat.support.listener.foo.MyServletContextAttrListener</listener-class>
</listener>
<listener>
    <listener-class>com.github.houbb.minicat.support.listener.foo.MyServletContextListener</listener-class>
</listener>
<listener>
    <listener-class>com.github.houbb.minicat.support.listener.foo.MyServletReadListener</listener-class>
</listener>
<listener>
    <listener-class>com.github.houbb.minicat.support.listener.foo.MyServletWriteListener</listener-class>
</listener>
<listener>
    <listener-class>com.github.houbb.minicat.support.listener.foo.MyServletRequestListener</listener-class>
</listener>
<listener>
    <listener-class>com.github.houbb.minicat.support.listener.foo.MyServletRequestAttrListener</listener-class>
</listener>
```

listener 作用是什么？我们又该如何解析实现呢？


## listener 是什么?

想象一下，你在参加一个大型的派对，这个派对有很多的环节，比如音乐响起、有人开始跳舞、蛋糕被推出来等等。

在这个派对中，有一些特别的人，他们对派对中的某些事情特别感兴趣，比如摄影师可能对“有人开始跳舞”这个事件感兴趣，而派对的策划者可能对“蛋糕被推出来”感兴趣。

这些人会在派对中“监听”这些特定的事件，一旦这些事件发生，他们就会采取一些行动，比如摄影师开始拍照，策划者开始唱生日歌。

在Tomcat中，Listener也是类似的。它们是一些特殊的类，对Tomcat应用生命周期中的某些事件感兴趣。

当这些事件发生时，Listener会收到通知，并执行一些操作。

这些操作通常是一些全局性的或初始化的工作，比如：

1. **记录日志**：当应用启动或关闭时，一个日志Listener可能会记录这些事件，以便于跟踪应用的状态。

2. **设置资源**：在应用启动时，一个配置Listener可能会初始化一些资源，比如数据库连接池或线程池。

3. **清理资源**：当应用关闭时，一个清理Listener可能会释放之前创建的资源，确保不会有内存泄漏。

4. **Session管理**：一个SessionListener可能会监听用户的会话事件，比如用户登录或退出，然后更新用户的Session状态。

5. **应用状态监控**：一个状态Listener可能会监控应用的运行状态，比如请求数、错误率等，并在发现异常时触发报警。

当然，这个使我们作为客户（参会者）的视角。

那如果是晚会的主办方呢？

## tomcat 如何处理 listener 的？

Tomcat就像是一个大型的晚会现场，而Listener就是那些在晚会中扮演着特定角色的“幕后英雄”。

这些角色可能包括音响师、灯光师、摄影师等，他们虽然不直接参与晚会的表演，但他们的工作对于晚会的成功举办至关重要。

1. **注册监听器**：在晚会开始之前，组织者会安排好所有的工作人员，并告诉他们晚会中需要注意的关键时刻。在Tomcat中，这就像是在`web.xml`配置文件中声明你的应用需要哪些Listener，或者通过注解的方式告诉Tomcat。

2. **监听事件**：晚会进行中，音响师、灯光师和摄影师会密切关注晚会的进展，等待特定的信号或时刻。在Tomcat中，Listener会监听应用生命周期中的各种事件，比如应用启动、会话创建、请求结束等。

3. **接收通知**：当晚会中发生了工作人员需要关注的事情，比如音乐响起、有人开始跳舞等，组织者或现场导演会通过无线电或其他通讯方式通知他们。在Tomcat中，当特定的事件发生时，Tomcat容器会通知所有注册的Listener。

4. **执行操作**：收到通知后，工作人员会立即执行他们的任务。比如，音乐响起时，音响师会调整音量，灯光师会变换灯光效果，摄影师会开始拍摄。在Tomcat中，Listener收到事件通知后，也会执行相应的操作，比如记录日志、初始化资源、清理会话等。

5. **事件处理完毕**：工作人员完成他们的任务后，晚会可以继续顺利进行。在Tomcat中，Listener处理完事件后，请求的处理或应用的运行也会继续进行。

工作流程：

```
晚会开始（Tomcat应用启动）
    |
    V
+------------+       音乐响起（事件触发）       +------------+
|  音响师    |  --------------------------------->|  调整音量  |
+------------+                                   +------------+
    |
    V
+------------+       有人开始跳舞（事件触发）    +------------+
|  灯光师    |  --------------------------------->|  变换灯光  |
+------------+                                   +------------+
    |
    V
+------------+       有人拍照（事件触发）        +------------+
|  摄影师    |  --------------------------------->|  开始拍照  |
+------------+                                   +------------+
    |
晚会结束（Tomcat应用关闭）
    |
    V
+------------+       晚会结束（事件触发）       +------------+
|  清洁工    |  --------------------------------->|  清理现场  |
+------------+                                   +------------+
```

## tomcat 有哪些 listener 类型？

tomcat 中的类型非常多，这里简单介绍介绍一下：

Tomcat中的Listener类型，可以比作是晚会中的不同工作人员，每种工作人员负责监听和处理不同类型的事件。

以下是一些主要的Listener类型，以及它们在Tomcat中的作用：

1. **ServletContextListener**：
   - 想象成晚会的策划者，他们关心整个晚会的整体流程。在Tomcat中，这个监听器用于跟踪Web应用的生命周期，比如应用启动和关闭时的事件。

2. **HttpSessionListener**：
   - 可以看作是负责宾客签到处的工作人员，他们关注宾客的到达和离开。在Tomcat中，这个监听器监听用户的会话创建和销毁事件。

3. **ServletContextAttributeListener**：
   - 这类似于晚会中的道具管理员，他们对晚会中使用的道具（在这里是应用属性）非常敏感。这个监听器用于监听应用范围内属性的添加、删除和替换事件。

4. **HttpSessionAttributeListener**：
   - 想象成是晚会中的个人助理，他们关注特定宾客的需求变化。这个监听器用于监听特定用户会话中属性的变化。

5. **ServletRequestListener**：
   - 可以比作是晚会入口的接待员，他们对每一位宾客的到来和离开都很留心。在Tomcat中，这个监听器监听请求的初始化和销毁事件。

6. **ServletRequestAttributeListener**：
   - 类似于晚会中的服务生，他们注意到宾客请求的每一个小细节。这个监听器用于监听请求属性的变化。

7. **MessageDestinationListener**：
   - 想象成是晚会中的信息台，他们监听和传播晚会中的重要消息。在Tomcat中，这个监听器用于监听JMS消息队列或主题的消息。

8. **LifecycleListener**：
   - 可以看作是晚会的舞台监督，他们对晚会的每一个环节都了如指掌。在Tomcat中，这个监听器用于监听Tomcat容器的生命周期事件。

9. **EngineListener**、**HostListener** 和 **ContextListener**：
   - 这些可以想象成是晚会中的不同管理层级，从整体的晚会经理到负责特定区域的负责人。在Tomcat中，这些监听器分别监听Tomcat引擎、虚拟主机和Web应用的事件。

每种Listener都像是Tomcat晚会中的一个角色，它们在Tomcat应用的不同阶段发挥着重要的作用，帮助开发者在应用的不同生命周期阶段执行特定的任务，从而让整个应用运行得更加顺畅和高效。


# 自己实现

接下来，到我们自己来秀了~

## 接口定义

这里就不定义了，直接复用 servlet 的标准 api

## 接口实现

有各种 listener，我们实现一个简单的作为例子：

```java
package com.github.houbb.minicat.support.listener.foo;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

public class MyServletContextListener implements ServletContextListener {

    private static final Log logger = LogFactory.getLog(MyServletContextListener.class);

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        logger.info("MyServletContextListener contextInitialized");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        logger.info("MyServletContextListener contextDestroyed");
    }

}
```

# 应用启动解析

## listener 管理类

定义一个 listener 的管理类

```java
package com.github.houbb.minicat.support.listener.manager;

import com.github.houbb.heaven.util.lang.StringUtil;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.minicat.exception.MiniCatException;
import com.github.houbb.minicat.support.servlet.manager.DefaultServletManager;

import javax.servlet.listener;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * listener 管理
 *
 * @since 0.6.0
 * @author 老马啸西风
 */
public class DefaultlistenerManager implements IlistenerManager {

    //... 省略基础属性

    @Override
    public void register(String url, listener listener) {
        logger.info("[MiniCat] register listener, url={}, listener={}", url, listener.getClass().getName());

        listenerMap.put(url, listener);
    }

    @Override
    public listener getlistener(String url) {
        return listenerMap.get(url);
    }

    @Override
    public List<listener> getMatchlisteners(String url) {
        List<listener> resultList = new ArrayList<>();

        for(Map.Entry<String, listener> entry : listenerMap.entrySet()) {
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

        //2. 处理 listener
        final IlistenerManager listenerManager = this.miniCatContextConfig.getlistenerManager();
        processWeblistener(root, listenerManager);

        // ...
    } catch (Exception e) {
        throw new MiniCatException(e);
    }
}
```

解析对应的 web.xml 标签内容，注册对应信息：

```java
protected void handlelistenerConfigMap(Map<String, String> listenerClassNameMap, Map<String, String> urlPatternMap, final IlistenerManager listenerManager) {
    try {
        for (Map.Entry<String, String> urlPatternEntry : urlPatternMap.entrySet()) {
            String listenerName = urlPatternEntry.getKey();
            String urlPattern = urlPatternEntry.getValue();
            String className = listenerClassNameMap.get(listenerName);
            if (StringUtil.isEmpty(className)) {
                throw new MiniCatException("className not found for listenerName: " + listenerName);
            }
            Class servletClazz = Class.forName(className);
            listener httpServlet = (listener) servletClazz.newInstance();
            // 构建
            String fullUrlPattern = buildFullUrlPattern(urlPattern);
            listenerManager.register(fullUrlPattern, httpServlet);
        }
    } catch (ClassNotFoundException | InstantiationException | IllegalAccessException e) {
        throw new MiniCatException(e);
    }
}
```

这样就可以后面调用了。

## 调用的时机

我们什么时候调用呢？

当然是一个请求地址过来了，看是否有匹配的 listener，然后进行处理。

```java
@Override
public void dispatch(final IMiniCatRequest request,
                     final IMiniCatResponse response,
                     final MiniCatContextConfig config) {
    final IServletManager servletManager = config.getServletManager();
    // 判断文件是否存在
    String requestUrl = request.getUrl();
    //before
    List<listener> listenerList = config.getlistenerManager().getMatchlisteners(requestUrl);
    // 获取请求分发
    final IRequestDispatcher requestDispatcher = getRequestDispatcher(requestUrl);
    // 请求前
    listenerList.forEach(listener -> {
        try {
            listener.dolistener(request, response, null);
        } catch (IOException | ServletException e) {
            throw new RuntimeException(e);
        }
    });
    // 正式分发
    requestDispatcher.dispatch(request, response, config);
}
```

这样，一个基础的 listener 功能就实现了。

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