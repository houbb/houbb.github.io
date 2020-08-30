---
layout: post
title:  jsp 学习笔记-16-session 
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, http, jsp, sf]
published: true
---

# JSP Session

HTTP是无状态协议，这意味着每次客户端检索网页时，都要单独打开一个服务器连接，因此服务器不会记录下先前客户端请求的任何信息。

有三种方法来维持客户端与服务器的会话：

## Cookies

网络服务器可以指定一个唯一的session ID作为cookie来代表每个客户端，用来识别这个客户端接下来的请求。

这可能不是一种有效的方式，因为**很多时候浏览器并不一定支持cookie**，所以我们不建议使用这种方法来维持会话。

ps: 现在出于安全的考虑，cookies 的读取应该越来越严格。

## 隐藏表单域

一个网络服务器可以发送一个隐藏的HTML表单域和一个唯一的session ID，就像下面这样：

```html
<input type="hidden" name="sessionid" value="12345">
```

这个条目意味着，当表单被提交时，指定的名称和值将会自动包含在GET或POST数据中。

每当浏览器发送一个请求，session_id的值就可以用来保存不同浏览器的轨迹。

这种方式可能是一种有效的方式，但点击 `<A HREF>` 标签中的超链接时不会产生表单提交事件，因此隐藏表单域也不支持通用会话跟踪。

## 重写 URL

您可以在每个URL后面添加一些额外的数据来区分会话，服务器能够根据这些数据来关联session标识符。

举例来说，http://github.com;sessionid=12345， session标识符为sessionid=12345，服务器可以用这个数据来识别客户端。

相比而言，重写URL是更好的方式来，就算浏览器不支持cookies也能工作，但缺点是您**必须为每个URL动态指定session ID，就算这是个简单的HTML页面**。

# session对象

除了以上几种方法外，JSP利用servlet提供的HttpSession接口来识别一个用户，存储这个用户的所有访问信息。

默认情况下，JSP允许会话跟踪，一个新的HttpSession对象将会自动地为新的客户端实例化。

禁止会话跟踪需要显式地关掉它，通过将page指令中session属性值设为false来实现，就像下面这样：

```jsp
<%@ page session="false" %>
```

JSP引擎将隐含的session对象暴露给开发者。

由于提供了session对象，开发者就可以方便地存储或检索数据。

## 重要方法

下表列出了session对象的一些重要方法：

| 方法 | 说明 |
|:---|:---|
| public Object getAttribute(String name) | 返回session对象中与指定名称绑定的对象，如果不存在则返回null |
| public Enumeration getAttributeNames() | 返回session对象中所有的对象名称 |
| public long getCreationTime() | 返回session对象被创建的时间， 以毫秒为单位，从1970年1月1号凌晨开始算起 |
| public String getId() | 返回session对象的ID |
| public long getLastAccessedTime() | 返回客户端最后访问的时间，以毫秒为单位，从1970年1月1号凌晨开始算起 |
| public int getMaxInactiveInterval() | 返回最大时间间隔，以秒为单位，servlet 容器将会在这段时间内保持会话打开 |
| public void invalidate() | 将session无效化，解绑任何与该session绑定的对象 |
| public boolean isNew() | 返回是否为一个新的客户端，或者客户端是否拒绝加入session |
| public void removeAttribute(String name) | 移除session中指定名称的对象 |
| public void setAttribute(String name, Object value)  | 使用指定的名称和值来产生一个对象并绑定到session中 |
| public void setMaxInactiveInterval(int interval) | 用来指定时间，以秒为单位，servlet容器将会在这段时间内保持会话有效 |

# JSP Session 实战

这个例子描述了如何使用HttpSession对象来获取创建时间和最后一次访问时间。

我们将会为request对象关联一个新的session对象，如果这个对象尚未存在的话。

## 后端

```java
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Controller
@RequestMapping("/session")
public class SessionController {

    @GetMapping("/index")
    public String index(HttpServletRequest request,
                        HttpServletResponse response) {
        return "session/session";
    }

}
```

## 前端

```jsp
<!DOCTYPE html>
<%@page contentType="text/html; charset=UTF-8" %>
<html lang="zh">
<head>
    <title>JSP 设置 session</title>
</head>
<body>

<h2>设置 session</h2>

<%
    String userId = "老马啸西风";
    int count = 0;

    //新登录
    if(session.isNew()) {
        session.setAttribute("userId", userId);
        session.setAttribute("count", count);
    } else {
        // 老用户
        count = (int) session.getAttribute("count");
        count++;
        session.setAttribute("count", count);
    }
%>

SESSION ID：<%=session.getId()%>
<br/>

初次登录时间：<%=session.getCreationTime()%>
<br/>

最近登录时间：<%=session.getLastAccessedTime()%>
<br/>

用户ID：<%=userId%>
<br/>

用户访问次数：<%=count%>
<br/>

</body>
</html>
```

## 测试

访问：http://localhost:8080/session/index

效果：

```
设置 session
SESSION ID：0B7077A063328CD5295C88EB54A5D8D9
初次登录时间：1598781685533
最近登录时间：1598781685533
用户ID：老马啸西风
用户访问次数：0
```

多次访问，最近登录时间和访问次数会发生变化。


# 删除Session数据

当处理完一个用户的会话数据后，您可以有如下选择：

## 移除一个特定的属性：

调用 public void removeAttribute(String name)  方法来移除指定的属性。

## 删除整个会话：


调用 public void invalidate() 方法来使整个session无效。

##  设置会话有效期：

调用 public void setMaxInactiveInterval(int interval)  方法来设置session超时。

## 登出用户：

支持servlet2.4版本的服务器，可以调用 logout()方法来登出用户，并且使所有相关的session无效。

## 配置web.xml文件：

如果使用的是Tomcat，可以向下面这样配置web.xml文件：

```xml
<session-config>
    <session-timeout>15</session-timeout>
</session-config>
```

超时以分钟为单位，Tomcat中的默认的超时时间是30分钟。

Servlet 中的 getMaxInactiveInterval() 方法以秒为单位返回超时时间。

如果在 web.xml 中配置的是15分钟，则 getMaxInactiveInterval() 方法将会返回900。

# 参考资料

https://www.runoob.com/jsp/jsp-session.html

* any list
{:toc}