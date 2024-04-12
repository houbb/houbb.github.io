---
layout: post
title: web server apache Tomcat-02-web.xml 详细介绍
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: false
---

# chat

## Q: 详细介绍一下 tomcat web.xml

`web.xml` 是 Java Web 应用程序中的一个配置文件，用于配置 Servlet、过滤器、监听器等组件的部署信息和行为。以下是对 `web.xml` 的详细介绍：

1. **根元素 `<web-app>`：**
   - `web.xml` 的根元素是 `<web-app>`，它定义了整个部署描述符的开始和结束。
   - 可以通过 `version` 属性指定 Servlet 规范的版本，例如 `<web-app version="3.1">`。

2. **Servlet 配置：**
   - 使用 `<servlet>` 元素来配置 Servlet。每个 `<servlet>` 元素都必须包含一个 `<servlet-name>` 子元素和一个 `<servlet-class>` 子元素，分别指定 Servlet 的名称和类名。
   - 可以使用 `<init-param>` 子元素为 Servlet 指定初始化参数。
   - Servlet 的映射由 `<servlet-mapping>` 元素定义，将 Servlet 的名称与 URL 模式关联起来。

3. **Filter 配置：**
   - 使用 `<filter>` 元素来配置过滤器。每个 `<filter>` 元素必须包含一个 `<filter-name>` 子元素和一个 `<filter-class>` 子元素，分别指定过滤器的名称和类名。
   - 可以使用 `<init-param>` 子元素为过滤器指定初始化参数。
   - 过滤器的映射由 `<filter-mapping>` 元素定义，将过滤器的名称与 URL 模式关联起来。

4. **Listener 配置：**
   - 使用 `<listener>` 元素来配置监听器。每个 `<listener>` 元素必须包含一个 `<listener-class>` 子元素，指定监听器的类名。
   - 监听器在 Web 应用程序生命周期内监听事件的发生，比如 ServletContext 的创建和销毁、HttpSession 的创建和销毁等。

5. **Error 页面配置：**
   - 使用 `<error-page>` 元素来配置错误页面。可以为特定的 HTTP 错误码或 Java 异常类型指定错误页面。
   - 错误页面可以是静态页面或 Servlet。

6. **Welcome 文件配置：**
   - 使用 `<welcome-file-list>` 元素来配置欢迎文件列表。当用户请求的 URL 以斜杠结尾时，Servlet 容器会尝试寻找欢迎文件，并返回找到的第一个文件。
   - 可以列出多个欢迎文件，按照优先级顺序进行匹配。

7. **Session 配置：**
   - 使用 `<session-config>` 元素来配置会话管理参数。可以设置会话超时时间和会话追踪模式。

8. **MIME 类型映射配置：**
   - 使用 `<mime-mapping>` 元素来配置 MIME 类型映射。可以为特定的文件扩展名指定 MIME 类型。

以上是 `web.xml` 文件的主要组成部分和常见配置元素。随着 Servlet 规范的不断更新，一些配置也可能会有所变化或扩展。

## 基本的例子

以下是一个简单的示例 `web.xml` 文件，包含了上述提到的元素：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">

    <!-- Servlet 配置 -->
    <servlet>
        <servlet-name>HelloServlet</servlet-name>
        <servlet-class>com.example.HelloServlet</servlet-class>
        <init-param>
            <param-name>greeting</param-name>
            <param-value>Hello, World!</param-value>
        </init-param>
    </servlet>
    <servlet-mapping>
        <servlet-name>HelloServlet</servlet-name>
        <url-pattern>/hello</url-pattern>
    </servlet-mapping>

    <!-- Filter 配置 -->
    <filter>
        <filter-name>LoggingFilter</filter-name>
        <filter-class>com.example.LoggingFilter</filter-class>
        <init-param>
            <param-name>logFile</param-name>
            <param-value>/var/log/myapp.log</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>LoggingFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>

    <!-- Listener 配置 -->
    <listener>
        <listener-class>com.example.MyServletContextListener</listener-class>
    </listener>

    <!-- Error 页面配置 -->
    <error-page>
        <error-code>404</error-code>
        <location>/error404.html</location>
    </error-page>

    <!-- Welcome 文件配置 -->
    <welcome-file-list>
        <welcome-file>index.html</welcome-file>
        <welcome-file>index.jsp</welcome-file>
    </welcome-file-list>

    <!-- Session 配置 -->
    <session-config>
        <session-timeout>30</session-timeout>
        <tracking-mode>COOKIE</tracking-mode>
    </session-config>

    <!-- MIME 类型映射配置 -->
    <mime-mapping>
        <extension>pdf</extension>
        <mime-type>application/pdf</mime-type>
    </mime-mapping>
</web-app>
```

请注意，此示例使用了 Servlet 4.0 的 XML 模式和名称空间，与使用其他版本的 Servlet 规范可能有所不同。

## 详细介绍一下 welcome-file-list

`welcome-file-list` 元素是 `web.xml` 文件中的一个配置元素，用于定义 Web 应用程序的欢迎文件列表。

当用户访问 Web 应用程序的根目录时（即 `http://example.com/`），Servlet 容器会尝试寻找并返回欢迎文件列表中的第一个文件。

如果第一个文件不存在，则继续查找列表中的下一个文件，直到找到存在的文件或遍历完整个列表。

以下是对 `welcome-file-list` 的详细介绍：

1. **配置格式：**
   - `welcome-file-list` 元素包含一个或多个 `welcome-file` 子元素，每个子元素都指定了一个欢迎文件的名称。
   - 欢迎文件应该是 Web 应用程序根目录下的静态文件，如 HTML 文件、JSP 文件等。

2. **优先级顺序：**
   - 欢迎文件列表中的文件按照它们在列表中的顺序进行优先级排序。即第一个文件具有最高的优先级，依次类推。

3. **示例：**
   ```xml
   <welcome-file-list>
       <welcome-file>index.html</welcome-file>
       <welcome-file>index.jsp</welcome-file>
   </welcome-file-list>
   ```
   在上述示例中，如果用户访问了 Web 应用程序的根目录，Servlet 容器会首先尝试返回 `index.html` 文件。如果该文件不存在，则会继续尝试返回 `index.jsp` 文件。

4. **注意事项：**
   - 如果 Web 应用程序的根目录下没有配置的欢迎文件或者 `welcome-file-list` 元素为空，则 Servlet 容器通常会返回目录列表或默认的欢迎页面（如果配置了）。
   - 欢迎文件列表的配置可以增加 Web 应用程序的易用性和用户体验，使用户能够更轻松地访问到他们需要的内容。

总之，`welcome-file-list` 元素允许您为您的 Web 应用程序定义一个或多个默认的欢迎文件，以确保用户在访问应用程序根目录时能够获得预期的内容。

### 页面请求地址是什么的时候会匹配这个页面？

当用户请求的 URL 是 Web 应用程序的根目录时，即请求地址末尾为斜杠 `/` 时，Servlet 容器会尝试匹配 `welcome-file-list` 中定义的欢迎文件列表。

例如，假设您的 Web 应用程序的根目录是 `http://example.com/`，那么当用户访问这个地址时，Servlet 容器将查找 `welcome-file-list` 中定义的欢迎文件列表，并尝试返回其中的第一个文件。

如果 `welcome-file-list` 中的第一个文件存在，Servlet 容器将返回该文件的内容；如果第一个文件不存在，Servlet 容器将继续尝试返回列表中的下一个文件，直到找到存在的文件或遍历完整个列表。

总之，当用户请求的 URL 是 Web 应用程序的根目录时，Servlet 容器会根据 `welcome-file-list` 中定义的欢迎文件列表来匹配并返回合适的欢迎文件。

## Listener 

在Java Web应用程序中，Listener（监听器）是一种特殊的Java类，用于监听Web应用程序中发生的事件并对其进行响应。

通过监听器，开发人员可以在特定事件发生时执行自定义的逻辑，从而实现更灵活和可定制化的Web应用程序。

以下是对Listener的详细介绍：

1. **类型：**Listener在Java EE中有多种类型，用于监听不同类型的事件。

常见的Listener类型包括：
   - ServletContextListener：监听ServletContext的创建和销毁事件。
   - ServletContextAttributeListener：监听ServletContext属性的增加、删除和修改事件。
   - HttpSessionListener：监听HttpSession的创建和销毁事件。
   - HttpSessionAttributeListener：监听HttpSession属性的增加、删除和修改事件。
   - ServletRequestListener：监听ServletRequest的创建和销毁事件。
   - ServletRequestAttributeListener：监听ServletRequest属性的增加、删除和修改事件。
   - ...等等，还有其他自定义的Listener类型。

2. **作用：**

Listener用于处理各种事件，可以在应用程序启动、销毁、会话创建、会话销毁等阶段执行相关逻辑。

它们可以用于进行初始化、资源加载、日志记录、权限验证、会话管理等各种操作。

3. **注册：**要使用Listener，需要在web.xml文件中进行配置。示例如下：
    ```xml
    <listener>
        <listener-class>com.example.MyServletContextListener</listener-class>
    </listener>
    ```
   这样就注册了一个ServletContextListener，当ServletContext被创建或销毁时，`com.example.MyServletContextListener` 中的相应方法将被调用。

4. **生命周期方法：**Listener类通常需要实现特定的生命周期方法，以便在事件发生时执行相应的逻辑。

例如，对于 ServletContextListener，通常会实现`contextInitialized()`方法用于在 ServletContext 被初始化时执行逻辑，以及`contextDestroyed()`方法用于在ServletContext被销毁时执行逻辑。

5. **应用场景：**Listener广泛应用于Web应用程序的各个方面，例如：
   - 在应用程序启动时进行初始化操作，如加载配置信息、初始化数据库连接等。
   - 在会话创建和销毁时进行相关操作，如记录用户登录信息、清理会话数据等。
   - 在请求到达时进行权限验证、日志记录等操作。
   - 在应用程序关闭时进行资源释放、数据持久化等操作。

总之，Listener提供了一种灵活的机制，使开发人员能够监听和响应Java Web应用程序中发生的各种事件，从而实现更加可定制化和高效的应用程序。

## ServletContextListener 监听到ServletContext，会有哪些属性内容？

当 `ServletContextListener` 监听到 `ServletContext` 的创建事件时，可以通过 `ServletContext` 对象获取到一些有用的属性内容，这些内容通常包括：

1. **初始化参数（Init Parameters）：** 在 `web.xml` 中可以为 `ServletContext` 配置一些初始化参数，`ServletContext` 创建时可以通过 `getInitParameter(String name)` 方法获取这些参数的值。

2. **Web 应用程序的上下文路径（Context Path）：** 可以通过 `getContextPath()` 方法获取当前 Web 应用程序的上下文路径，即访问该应用程序的 URL 所需添加的路径部分。

3. **Web 应用程序的部署描述符（Deployment Descriptor）：** 可以通过 `getRealPath(String path)` 方法获取部署描述符（`web.xml` 文件）的真实路径，从而可以读取和解析部署描述符中的配置信息。

4. **Servlet 上下文属性（Servlet Context Attributes）：** `ServletContext` 可以保存一些全局的属性，这些属性在整个 Web 应用程序范围内都是可见的。可以通过 `setAttribute(String name, Object value)` 方法设置属性，通过 `getAttribute(String name)` 方法获取属性的值。

5. **资源访问路径（Resource Paths）：** `ServletContext` 提供了一些方法用于获取 Web 应用程序中的资源路径，如获取资源的真实路径、获取资源的输入流等。

6. **Servlet 注册信息（Servlet Registration Information）：** 可以通过 `getServletRegistration(String servletName)` 方法获取特定 Servlet 的注册信息，包括 Servlet 的类名、初始化参数等。

7. **监听器注册信息（Listener Registration Information）：** 可以通过 `getFilterRegistration(String filterName)` 方法获取特定过滤器的注册信息，包括过滤器的类名、初始化参数等。

8. **其他信息：** 还可以获取一些其他有关 Web 应用程序的信息，如 MIME 类型映射、错误页面配置等。

通过这些属性内容，`ServletContextListener` 可以在 `ServletContext` 创建时进行一些初始化操作，如加载配置信息、初始化资源等，以确保 Web 应用程序能够顺利运行。



* any list
{:toc}