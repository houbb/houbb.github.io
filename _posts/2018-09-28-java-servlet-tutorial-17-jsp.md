---
layout: post
title: Java Servlet 教程-17-JSP
date:  2018-10-06 16:52:37 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程-17-JSP
---

# JSP 

## 概念 

[JSP](https://www.oracle.com/technetwork/java/index-jsp-138231.html)（全称JavaServer Pages）是由Sun Microsystems公司主导创建的一种动态网页技术标准。

## 优势

与ASP相比：JSP有两大优势。首先，动态部分用Java编写，而不是VB或其他MS专用语言，所以更加强大与易用。第二点就是JSP易于移植到非MS平台上。

与纯 Servlet 相比：JSP可以很方便的编写或者修改HTML网页而不用去面对大量的println语句。

与SSI相比：SSI无法使用表单数据、无法进行数据库链接。

与JavaScript相比：虽然JavaScript可以在客户端动态生成HTML，但是很难与服务器交互，因此不能提供复杂的服务，比如访问数据库和图像处理等等。

与静态HTML相比：静态HTML不包含动态信息。

## JSP 与 servlet

JSP 最后会被编译成为 servlet。

```
MyJSP.jsp=> MyJSP_jsp.java=> MyJSP_jsp.class=>MyJSP_jsp Servlet
```

# 入门案例

之所以需要 jsp，是因为我们不想在 servlet 中写太多的 html 相关的代码。

jsp 中我们可以使用 java 的语法，结合 html。

## hello.jsp

此文件放在 webapp 根目录下。

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Title</title>
</head>
<body>
    <%
        out.println("Hello World！");
    %>
</body>
</html>
```

## 直接访问

浏览器打开 [http://localhost:8081/hello.jsp](http://localhost:8081/hello.jsp) 

页面内容为：

```
Hello World！
```

## servlet 转发

当然我们也可以使用 servlet 转发到此 jsp 页面。

- JspServlet.java

```java
@WebServlet("/jsp")
public class JspServlet extends HttpServlet {

    private static final long serialVersionUID = -2288088652547508947L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.getRequestDispatcher("/hello.jsp").forward(req, resp);
    }

}
```

或者使用

```java
resp.sendRedirect("/hello.jsp");
```

- 访问

浏览器访问 [http://localhost:8081/jsp](http://localhost:8081/jsp) 即可跳转到 hello.jsp

# 避免直接访问

jsp 文件放在 **WEB-INF** 文件夹下面，此时只能通过 servlet 页面跳转到指定页面。

# 拓展阅读

实际使用中不建议使用 jsp。

可以使用 [Freemarker](https://houbb.github.io/2016/05/07/freemarker) 或者 [Velocity](https://houbb.github.io/2018/06/08/velocity)

# 参考资料

https://www.oracle.com/technetwork/java/index-jsp-138231.html

https://www.tutorialspoint.com/jsp/

http://www.runoob.com/jsp/jsp-tutorial.html

https://www.cnblogs.com/cyy-13/p/5733034.html

* any list
{:toc}