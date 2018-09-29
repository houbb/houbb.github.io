---
layout: post
title: Java Servlet 教程-07-上下文 ServletContext 
date:  2018-09-28 15:54:28 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程-07-上下文 ServletContext 
---

# ServletContext

## 定义

定义servlet用于与其servlet容器通信的一组方法，例如，获取文件的MIME类型、分派请求或写入日志文件。

对于每个Java虚拟机，每个“web应用程序”都有一个上下文。(“web应用程序”是servlet和内容的集合，安装在服务器URL名称空间(如/catalog)的特定子集下，可能通过.war文件安装。)

对于在部署描述符中标记为“分布式”的web应用程序，每个虚拟机都有一个上下文实例。在这种情况下，上下文不能用作共享全局信息的位置(因为这些信息不是真正的全局信息)。使用外部资源，如数据库。

ServletContext对象包含在ServletConfig对象中，Web服务器在servlet初始化时提供servlet。

## 创建时机

容器启动的时候，并为其提供Servlet初始化参数的名/值对的引用。

## 获取方式

在Servlet中可以通过两种方式获取到ServletConfig：

1. 通过重载的 init() 初始化方法参数中直接获取。

2. 直接调用 getServletConfig() 方法（继承自GenericServlet）

# 方法

## 得到初始化参数和获取/设置属性

如下 ServletContext 接口方法允许 servlet 访问由应用开发人员在Web 应用中的部署描述符中指定的上下文初始化参数：

应用开发人员使用初始化参数来表达配置信息。代表性的例子是一个网络管理员的 e-mail 地址，或保存关键数据的系统名称。

1. getInitParameter(String)

2. getInitParameterNames()

## 操作上下文属性

1. getAttribute(String)

2. getAttributeNames()

3. setAttribute(String,Object)

4. removeAttribute(String)

## 得到有关服务器（及容器）信息

1. getMajorVersion()

2. getServerInfo()

## 访问资源文件

1. getResource(String parh)

2. getResourceAsStream(String parh) 

getResource 和 getResourceAsStream 方法需要一个以 `/` 开头的String 作为参数，给定的资源路径是相对于上下文的根，或者相对于 web应用的 `WEB-INF/lib` 目录下的 JAR 文件中的 META-INF/resources 目录。

这两个方法首先根据请求的资源查找 web 应用上下文的根，然后查找所有 WEB-INF/lib 目录下的 JAR 文件。查找 WEB-INF/lib 目录中 JAR文件的顺序是不确定的。

这种层次结构的文件可以存在于服务器的文件系统，Web 应用的归档文件，远程服务器，或在其他位置。

这两个方法不能用于获取动态内容。例如，在支持 JavaServer Pages™规范的容器中，如 getResource("/index.jsp") 形式的方法调用将返回 JSP 源码而不是处理后的输出。

## 实现Servlet的转发

```java
context.getRequestDispatcher("/index.jsp").forword(request, response);  
```

## 记录服务器（如tomcat）日志文件。

1. log(String msg)

此处可以使用 [Slf4j](https://houbb.github.io/2018/08/27/slf4j) 等成熟的日志框架。

## 初始化参数

1. getInitParameter

2. getInitParameterNames

# 重载注意事项

尽管 Container Provider (容器供应商)不需要实现类的重加载模式以便易于开发，但是任何此类的实现必须确保所有 servlet 及它们使用的类（Servlet使用的系统类异常可能使用的是一个不同的 class loader）在一个单独的 class loader 范围内被加载。

为了保证应用像开发人员预期的那样工作，该要求是必须的。作为一个开发辅助，容器应支持到会话绑定到的监听器的完整通知语义以用于当 class 重加载时会话终结的监控。

之前几代的容器创建新的 class loader 来加载 servlet，且与用于加载在 servlet 上下文中使用的其他 servlet 或类的 class loader 是完全不同的。这可能导致 servlet 上下文中的对象引用指向意想不到的类或对象，并引起意想不到的行为。为了防止因创建新的 class loader 所引起的问题，该要求是必须的。

## 临时工作目录

每一个 servlet 上下文都需要一个临时的存储目录。

servlet 容器必须为每一个 servlet 上下文提供一个私有的临时目录，并将通过javax.servlet.context.tempdir 上下文属性使其可用，关联该属性的对象必须是 java.io.File 类型。

该要求公认为在多个 servlet 引擎实现中提供一个通用的便利。

当 servlet 容器重启时，它不需要去保持临时目录中的内容，但必须确保一个 servlet 上下文的临时目录中的内容对运行在同一个 servlet 容器的其他 Web 应用的上下文不可见。

# 实际案例

## 初始化参数

- web.xml

配置如下：

```xml
<context-param>
    <param-name>global-email</param-name>
    <param-value>www.google.com</param-value>
</context-param>
```

- ContextXmlServlet.java

在 Servlet 类中取得 context 中指定的属性。

```java
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/context/xml")
public class ContextXmlServlet extends HttpServlet {

    private static final long serialVersionUID = -4188524517356470483L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        final String email = getServletContext().getInitParameter("global-email");
        PrintWriter printWriter = resp.getWriter();
        printWriter.write("Email: " + email);
    }
}
```

## 属性设置

此处为了方便，将设置和获取放在了一起。

实际使用过程中，设置和获取可以是不同的 Servlet。

```java
@WebServlet("/context/attr")
public class ContextAttributeServlet extends HttpServlet {
    private static final long serialVersionUID = 1363903348852718740L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        //1. 设置属性
        final String attrKey = "name";
        final String randomValue = UUID.randomUUID().toString();
        getServletContext().setAttribute(attrKey, randomValue);

        //2. 获取属性 实际使用时可以是不同的 Servlet
        final String attrValue = getServletContext().getAttribute(attrKey).toString();
        PrintWriter printWriter = resp.getWriter();
        printWriter.write("Attr: " + attrValue);
    }
}
```

## 网页计数器

- ContextPageCounterServlet.java

```java
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/context/counter")
public class ContextPageCounterServlet extends HttpServlet {

    private static final long serialVersionUID = 2853152264384162008L;

    /**
     * 点击总数
     */
    private static final String HIT_COUNT = "hit.count";

    /**
     * 点击总数
     * 实际使用 可以从数据库等地方读取这个数值
     */
    private static int countNum = 0;

    @Override
    public void init(ServletConfig config) throws ServletException {
        countNum = 0;
        super.init(config);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 设置响应内容类型为纯文本，编码为 UTF8
        resp.setContentType("text/plain;charset=UTF-8");
        PrintWriter printWriter = resp.getWriter();
        ServletContext servletContext = getServletContext();

        countNum++;
        // 其他的 servlet 也可以获取并且更新这个点击信息
        servletContext.setAttribute(HIT_COUNT, countNum);
        printWriter.write("点击总数：" + countNum);
    }

    @Override
    public void destroy() {
        //持久化存储点击总数
    }
}
```

- 过滤器

当然这种方式如果我想拦截很多 Servlet，一个个写未免太愚笨了些。

可以参见 [过滤器]()

# 参考资料

[tomcat-ServletContext](https://tomcat.apache.org/tomcat-5.5-doc/servletapi/javax/servlet/ServletContext.html)

https://waylau.gitbooks.io/servlet-3-1-specification/docs/Servlet%20Context/4.1%20Introduction%20to%20the%20ServletContext%20Interface.html

https://blog.csdn.net/gavin_john/article/details/51399425

* any list
{:toc}