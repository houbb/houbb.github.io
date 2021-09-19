---
layout: post
title: Java Servlet3.1 规范-03-Request
date:  2021-09-09 14:49:58 +0800
categories: [Java]
tags: [web, servlet, servlet3, sh]
published: true
---

# 请求

request 对象封装了来自客户端请求的所有信息。 

在 HTTP协议，此信息以 HTTP 协议从客户端传输到服务器请求的标头和消息正文。


# HTTP 协议参数

servlet 的请求参数以字符串的形式作为请求的一部分从客户端发送到 servlet 容器。当请求是一个 HttpServletRequest 对象，且符合“参数可用时”描述的条件时，容器从 URI 查询字符串和 POST 数据中填充参数。

参数以一系列的名-值对（name-value）的形式保存。任何给定的参数的名称可存在多个参数值。

ServletRequest 接口的下列方法可访问这些参数：

* getParameter
* getParameterNames
* getParameterValues
* getParameterMap

getParameterValues 方法返回一个 String 对象的数组，包含了与参数名称相关的所有参数值。

getParameter 方法的返回值必须是getParameterValues 方法返回的 String 对象数组中的第一个值。

getParameterMap 方法返回请求参数的一个 java.util.Map 对象，其中以参数名称作为 map 键，参数值作为 map 值。

查询字符串和 POST 请求的数据被汇总到请求参数集合中。查询字符串数据放在 POST 数据之前。

例如，如果请求由查询字符串 a=hello 和 POST 数据 a=goodbye&a=world 组成，得到的参数集合顺序将是 a=(hello, goodbye, world)。

这些 API 不会暴露 GET 请求（HTTP 1.1所定义的）的路径参数。

他们必须从 getRequestURI 方法或 getPathInfo 方法返回的字符串值中解析。

### 当参数可用时

Post 表单数据能填充到参数集（Paramter Set）前必须满足的条件：

1. 该请求是一个 HTTP 或 HTTPS 请求。

2. HTTP 方法是 POST。

3. 内容类型是 application/x-www-form-urlencoded。

4. 该 servlet 已经对请求对象的任意 getParameter 方法进行了初始调用。

如果不满足这些条件，而且参数集中不包括 post 表单数据，那么 servlet 必须可以通过请求对象的输入流得到 post 数据。

如果满足这些条件，那么从请求对象的输入流中直接读取 post 数据将不再有效。

# 文件上传

当数据以`multipart/form-data`的格式发送时，servlet 容器支持文件上传。

如果满足以下任何一个条件，servlet 容器提供 `multipart/form-data`格式数据的处理。

* servlet处理的请求使用了第8.1.5节定义的注解`@MultipartConfig`。

* 为了servlet处理请求，部署描述符包含了一个 `multipart-config`元素。

请求中的 multipart/form-data 类型的数据如何可用，取决于servlet 容器是否提供 multipart/form-data 格式数据的处理：

* 如果 servlet 容器提供 multipart/form-data 格式数据的处理，可通过 HttpServletRequest 中的以下方法得到：

  * `public Collection<Part> getParts()`

  * public Part getPart(String name) 每个 part 都可通过 Part.getInputStream 方法访问头部，相关的内容类型和内容。

    对于表单数据的 Content-Disposition，即使没有文件名，也可使用 part 的名称通过 HttpServletRequest 的 getParameter 和getParameterValues 方法得到 part 的字符串值。

* 如果 servlet 的容器不提供 multi-part/form-data 格式数据的处理，这些数据将可通过 HttpServletReuqest.getInputStream 得到。

# 属性

属性是与请求相关联的对象。属性可以由容器设置来表达信息，否则无法通过 API 表示，或者由 servlet 设置将信息传达给另一个 servlet（通过 RequestDispatcher）。

属性通过 ServletRequest 接口中下面的方法来访问：

* getAttribute
* getAttributeNames
* setAttribute

一个属性名称只能关联一个属性值。

前缀 java. 和 javax. 开头的属性名称是本规范的保留定义。

同样地，前缀 sun. 和 com.sun.，oracle 和 com.oracle 开头的属性名是Oracle Corporation 的保留定义。

建议属性集中所有属性的命名与[Java编程语言的规范](http://docs.oracle.com/javase/specs/)为包命名建议的反向域名约定一致。

# 头

通过下面的 HttpServletRequest 接口方法，servlet 可以访问 HTTP 请求的头信息：

* getHeader
* getHeaders
* getHeaderNames

getHeader 方法返回给定头名称的头。多个头可以具有相同的名称，例如HTTP 请求中的 Cache-Control 头。

如果多个头的名称相同，getHeader方法返回请求中的第一个头。 

getHeaders 方法允许访问所有与特定头名称相关的头值，返回一个 String 对象的 Enumeration（枚举）。

头可包含由 String 形式的 int 或 Date 数据。

HttpServletRequest接口提供如下方便的方法访问这些类型的头数据：

* getIntHeader

* getDateHeader

如果 getIntHeader 方法不能转换为 int 的头值，则抛出NumberFormatException 异常。

如果 getDateHeader 方法不能把头转换成一个 Date 对象，则抛出 IllegalArgumentException 异常。

# 请求路径元素

引导 servlet 服务请求的请求路径由许多重要部分组成。

以下元素从请求URI路径得到，并通过请求对象公开：

* Context Path：与ServletContext相关联的路径前缀是这个Servlet 的一部分。如果这个上下文是基于Web服务器的URL命名空间基础上的“默认”上下文，那么这个路径将是一个空字符串。否则，如果上下文不是基于服务器的命名空间，那么这个路径以“/”字符开始，但不以“/”字符结束。

* Servlet Path：路径部分直接与激活请求的映射对应。这个路径以“/”字符开头，如果请求与“/*”或“”模式匹配，在这种情况下，它是一个空字符串。

* PathInfo：请求路径的一部分，不属于Context Path或Servlet Path。如果没有额外的路径，它要么是null，要么是以“/”开头的字符串。

使用 HttpServletRequest 接口中的下面方法来访问这些信息：

* getContextPath

* getServletPath

* getPathInfo

重要的是要注意，除了请求 URI 和路径部分的 URL 编码差异外，下面的等式永远为真：

	requestURI = contextPath + servletPath + pathInfo

举几个例子来解析上述各点，请考虑以下几点：

TABLE 3-1 Example Context Set Up

| Context Path    | /catalog                                    |
| --------------- | ------------------------------------------- |
| Servlet Mapping | Pattern: /lawn/*    Servlet: LawnServlet    |
| Servlet Mapping | Pattern: /garden/*   Servlet: GardenServlet |
| Servlet Mapping | Pattern: *.jsp Servlet: JSPServlet          |

遵守下列行为：

TABLE 3-2 Observed Path Element Behavior

| 请求路径                    | 路径元素                                                     |
| --------------------------- | ------------------------------------------------------------ |
| /catalog/lawn/index.html    | ContextPath: /catalog ServletPath: /lawn PathInfo: /index.html |
| /catalog/garden/implements/ | ContextPath: /catalog  ServletPath: /garden  PathInfo: /implements/ |
| /catalog/help/feedback.jsp  | ContextPath: /catalog  ServletPath: /help/feedback.jsp  PathInfo: null |


# 路径转换方法

在 API 中有两个方便的方法，允许开发者获得与某个特定的路径等价的文件系统路径。

这些方法是：

* ServletContext.getRealPath

* HttpServletRequest.getPathTranslated

getRealPath 方法需要一个 String 参数，并返回一个 String 形式的路径，这个路径对应一个在本地文件系统上的文件。

getPathTranslated方法推断出请求的 pathInfo 的实际路径。

这些方法在 servlet 容器无法确定一个有效的文件路径 的情况下，如 Web应用程序从归档中，在不能访问本地的远程文件系统上，或在一个数据库中执行时，这些方法必须返回 null。

JAR 文件中 META-INF/resources 目录下的资源，只有当调用 getRealPath() 方法时才认为容器已经从包含它的 JAR 文件中解压，在这种情况下，必须返回解压缩后位置。

# 非阻塞 IO

Web 容器中的非阻塞请求处理有助于提高对改善 Web 容器可扩展性不断增加的需求，增加 Web 容器可同时处理请求的连接数量。

servlet 容器的非阻塞 IO 允许开发人员在数据可用时读取数据或在数据可写时写数据。

非阻塞 IO 仅对在 Servlet 和 Filter（2.3.3.3节定义的，“异步处理”）中的异步请求处理和升级处理（2.3.3.5节定义的，“升级处理”）有效。

否则，当调用 ServletInputStream.setReadListener 或ServletOutputStream.setWriteListener 方法时将抛出IllegalStateException。

ReadListener 为非阻塞IO提供了下面的回调方法：

* ReadListener
  * onDataAvailable().当可以从传入的请求流中读取数据时ReadListener 的 onDataAvailable 方法被调用。当数据可读时容器初次调用该方法。当且仅当下面描述的 ServletInputStream 的isReady 方法返回 false，容器随后将调用 onDataAvailable 方法。
  * onAllDataRead().当读取完注册了此监听器的 ServletRequest 的所有数据时调用 onAllDataRead 方法。
  * onError(Throwable t). 处理请求时如果有任何错误或异常发生时调用 onError 方法。

容器必须线程安全的访问 ReadListener 中的方法。

除了上述 ReadListener 定义的方法外，下列方法已被添加到ServletInputStream 类中：

* ServletInputStream
  * boolean isFinished(). ServletInputStream 相关的请求的所有数据已经读取完时 isFinished 方法返回 true。否则返回 false。
  * boolean isReady().如果可以无阻塞地读取数据 isReady 方法返回 true。如果没有数据可以无阻塞地读取该方法返回 false。如果isReady 方法返回 false，调用 read 方法是非法的，且必须抛出IllegalStateException。
  * void setReadListener(ReadListener listener). 设置上述定义的 ReadListener，调用它以非阻塞的方式读取数据。一旦把监听器与给定的 ServletInputStream 关联起来，当数据可以读取，所有的数据都读取完或如果处理请求时发生错误，容器调用 ReadListener 的方法。注册一个 ReadListener 将启动非阻塞 IO。在那时切换到传统的阻塞IO是非法的，且必须抛出 IllegalStateException。在当前请求范围内，随后调用 setReadListener 是非法的且必须抛出IllegalStateException。

# Cookie

HttpServletRequest 接口提供了 getCookies 方法来获得请求中的cookie 的一个数组。

这些 cookie 是从客户端发送到服务器端的客户端发出的每个请求上的数据。

典型地，客户端发送回的作为 cookie 的一部分的唯一信息是 cookie 的名称和 cookie 值。

当 cookie 发送到浏览器时可以设置其他 cookie 属性，诸如注释，这些信息不会返回到服务器。

该规范还允许的 cookies 是 HttpOnly cookie。HttpOnly cookie 暗示客户端它们不会暴露给客户端脚本代码（它没有被过滤掉，除非客户端知道如何查找此属性）。

使用 HttpOnly cookie 有助于减少某些类型的跨站点脚本攻击。


# SSL 属性

如果请求已经是通过一个安全协议发送，如 HTTPS，必须通过ServletRequest 接口的 isSecure 方法公开该信息。

Web 容器必须公开下列属性给 servlet 程序员：

TABLE 3-3 Protocol Attributes

| 属性         | 属性名称                             | Java类型 |
| ------------ | ------------------------------------ | -------- |
| 密码套件     | javax.servlet.request.cipher_suite   | String   |
| 算法的位大小 | javax.servlet.request.key_size       | Integer  |
| SSL 会话 id  | javax.servlet.request.ssl_session_id | String   |

如果有一个与请求相关的 SSL 证书，它必须由 servlet 容器以java.security.cert.X509Certificate 类型的对象数组暴露给servlet 程序员并可通过一个javax.servlet.request.X509Certificate 类型的 ServletRequest属性访问。

这个数组的顺序是按照信任的升序顺序。证书链中的第一个证书是由客户端设置的，第二个是用来验证第一个的，等等。

# 国际化

客户可以选择希望 Web 服务器用什么语言来响应。

该信息可以和使用Accept-Language 头与 HTTP/1.1 规范中描述的其他机制的客户端通信。

ServletRequest 接口提供下面的方法来确定发送者的首选语言环境：

* getLocale
* getLocales

getLocale 方法将返回客户端要接受内容的首选语言环境。

要了解更多关于 Accept-Language 头必须被解释为确定客户端首选语言的信息，请参阅 RFC 2616（HTTP/1.1）14.4节。

getLocales 方法将返回一个Locale 对象的 Enumeration (枚举)，从首选语言环境开始顺序递减，这些语言环境是可被客户接受的语言环境。

如果客户端没有指定首选语言环境，getLocale 方法返回的语言环境必须是 servlet 容器默认的语言环境，而 getLocales 方法必须返回只包含一个默认语言环境的 Local 元素的枚举。

# 请求数据编码

目前，许多浏览器不随着 Content-Type 头一起发送字符编码限定符，而是根据读取 HTTP 请求确定字符编码。

如果客户端请求没有指定请求默认的字符编码，容器用来创建请求读取器和解析 POST 数据的编码必须是“ISO-8859-1”。

然而，为了向开发人员说明客户端没有指定请求默认的字符编码，在这种情况下，客户端发送字符编码失败，容器从getCharacterEncoding 方法返回 null。

如果客户端没有设置字符编码，并使用不同的编码来编码请求数据，而不是使用上面描述的默认的字符编码，那么可能会发生问题。

为了弥补这种情况，ServletRequest 接口添加了一个新的方法 setCharacterEncoding(String enc)。

开发人员可以通过调用此方法来覆盖由容器提供的字符编码。必须在解析任何 post 数据或从请求读取任何输入之前调用此方法。此方法一旦调用，将不会影响已经读取的数据的编码。

# 请求对象生命周期

每个请求对象只在一个 servlet 的 service 方法的作用域内，或过滤器的 doFilter 方法的作用域内有效，除非该组件启用了异步处理并且调用了请求对象的 startAsync 方法。

在发生异步处理的情况下，请求对象一直有效，直到调用 AsyncContext 的 complete 方法。

容器通常会重复利用请求对象，以避免创建请求对象而产生的性能开销。

开发人员必须注意的是，不建议在上述范围之外保持 startAsync 方法还没有被调用的请求对象的引用，因为这样可能产生不确定的结果。

在升级情况下，如上描述仍成立。

# 参考地址

https://download.oracle.com/otn-pub/jcp/servlet-3_1-fr-eval-spec/servlet-3_1-final.pdf

* any list
{:toc}