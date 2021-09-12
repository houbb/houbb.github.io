---
layout: post
title: Java Servlet3.1 规范-05-response 响应
date:  2021-09-09 14:49:58 +0800
categories: [Java]
tags: [web, servlet, servlet3, sh]
published: true
---

# 响应

响应对象封装了从服务器返回到客户端的所有信息。

在HTTP协议中，这些信息是包含在从服务器传输到客户端的HTTP头信息或响应的消息体中。

# 缓冲

出于性能的考虑，servlet 容器允许（但不要求）缓存输出到客户端的内容。

一般的，服务器是默认执行缓存，但应该允许 servlet 来指定缓存参数。

下面是 ServletResponse 接口允许 servlet 来访问和设置缓存信息的方法：

* getBufferSize
* setBufferSize
* isCommitted
* reset
* resetBuffer
* flushBuffer

不管 servlet 使用的是一个 ServletOutputStream 还是一个 Writer，ServletResponse 接口提供的这些方法允许执行缓冲操作。

getBufferSize 方法返回使用的底层缓冲区大小。如果没有使用缓冲，该方法必须返回一个 int 值 0。

Servlet 可以请求 setBufferSize 方法设置一个最佳的缓冲大小。不一定分配 servlet 请求大小的缓冲区，但至少与请求的大小一样大。

这允许容器重用一组固定大小的缓冲区，如果合适，可以提供一个比请求时更大的缓冲区。该方法必须在使用 ServletOutputStream 或 Writer 写任何内容之前调用。

如果已经写了内容或响应对象已经提交，则该方法必须抛出IllegalStateException。

isCommitted 方法返回一个表示是否有任何响应字节已经返回到客户端的boolean 值。flushBuffer 方法强制刷出缓冲区的内容到客户端。

当响应没有提交时，reset方法清空缓冲区的数据。头信息，状态码和在调用 reset 之前 servlet 调用 getWriter 或 getOutputStream 设置的状态也必须被清空。

如果响应没有被提交，resetBuffer 方法将清空缓冲区中的内容，但不清空请求头和状态码。

如果响应已经提交并且 reset 或 resetBuffer 方法已被调用，则必须抛出 IllegalStateException，响应及它关联的缓冲区将保持不变。

当使用缓冲区时，容器必须立即刷出填满的缓冲区内容到客户端。如果这是最早发送到客户端的数据，且认为响应被提交了。

# 头

servlet 可以通过下面 HttpServletResponse 接口的方法来设置 HTTP 响应头：

* setHeader

* addHeader

setHeader 方法通过给定的名字和值来设置头。前面的头会被后来的新的头替换。如果已经存在同名的头集合的值，集合中的值会被清空并用新的值替换。

addHeader 方法使用给定的名字添加一个头值到集合。如果没有头与给定的名字关联，则创建一个新的集合。

头可能包含表示 int 或 Date 对象的数据。以下 HttpServletResponse接口提供的便利方法允许 servlet 对适当的数据类型用正确的格式设置一个头：

* setIntHeader

* setDateHeader

* addIntHeader

* addDateHeader

为了成功的传回给客户端，头必须在响应提交前设置。响应提交后的头设置将被 servlet 容器忽略。

servlet 程序员负责保证为 servlet 生成的内容设置合适的响应对象的Content-Type 头。HTTP 1.1 规范中没有要求在 HTTP 响应中设置此头。当 servlet 程序员没有设置该类型时，servlet 容器也不能设置默认的内容类型。

建议容器使用 X-Powered-By HTTP 头公布它的实现信息。

该字段值应考虑一个或多个实现类型，如"Servlet/3.1"。容器应该可以配置来隐藏该头。可选的容器补充的信息和底层 Java 平台可以被放在括号内并添加到实现类型之后。

```
X-Powered-By: Servlet/3.1
X-Powered-By: Servlet/3.1 JSP/2.3 (GlassFish Server Open Source
Edition 4.0 Java/Oracle Corporation/1.7)
```

# 非阻塞 IO

非阻塞 IO 仅对在 Servlet 和 Filter（2.3.3.3节定义的，“异步处理”）中的异步请求处理和升级处理（2.3.3.5节定义的，“升级处理”）有效。

否则，当调用 ServletInputStream.setReadListener 或ServletOutputStream.setWriteListener 方法时将抛出IllegalStateException。

为了支持在 Servlet 容器中的非阻塞写，除了在3.7节描述的“非阻塞IO” 对 ServletRequest 做的更改之外，下面做出的更改以便于处理响应相关的类/接口。

WriteListener 提供了如下适用于容器调用的回调方法。

* WriteListener

  * void onWritePossible(). 当一个 WriteListener 注册到ServletOutputStream 时，当可以写数据时该方法将被容器首次调用。当且仅当下边描述的 ServletOutputStream的isReady 方法返回false，容器随后将调用该方法。

  * onError(Throwable t). 当处理响应过程中出现错误时回调。

    除了 WriteListener 外，还有如下方法被添加到 ServletOutputStream类并允许开发人员运行时检查是否可以

* ServletOutputStream

  * boolean isReady(). 如果往 ServletOutputStream 写会成功，则该方法返回 true，其他情况会返回 false。如果该方法返回 true，可以在 ServletOutputStream 上执行写操作。如果没有后续的数据能写到 ServletOutputStream，那么直到底层的数据被刷出之前该方法将一直返回 false。且在此时容器将调用 WriteListener 的onWritePossible 方法。随后调用该方法将返回 true。

  * void setWriteListener(WriteListener listener). 关联WriteListener 和当前的 ServletOutputStream，当ServletOutputStream 可以写入数据时容器会调用WriteListener的回调方法。注册了 WriteListener 将开始非阻塞IO。此时再切换到传统的阻塞 IO 是非法的。

容器必须线程安全的访问 WriteListener 中的方法。

# 简便方法

HttpServletResponse提供了如下简便方法：

* sendRedirect

* sendError

sendRedirect 方法将设置适当的头和内容体将客户端重定向到另一个地址。使用相对 URL 路径调用该方法是合法的，但是底层的容器必须将传回到客户端的相对地址转换为全路径 URL。无论出于什么原因，如果给定的URL是不完整的，且不能转换为一个有效的URL，那么该方法必须抛出IllegalArgumentException。

sendError 方法将设置适当的头和内容体用于返回给客户端返回错误消息。可以 sendError 方法提供一个可选的 String 参数用于指定错误的内容体。

如果响应已经提交并终止，这两个方法将对提交的响应产生负作用。这两个方法调用后 servlet 将不会产生到客户端的后续的输出。这两个方法调用后如果有数据继续写到响应，这些数据被忽略。 

如果数据已经写到响应的缓冲区，但没有返回到客户端（例如，响应没有提交），则响应缓冲区中的数据必须被清空并使用这两个方法设置的数据替换。如果响应已提交，这两个方法必须抛出 IllegalStateException。

# 国际化

Servlet 应设置响应的 locale 和字符集。

使用ServletResponse.setLocale 方法设置 locale。该方法可以重复的调用；但响应被提交后调用该方法不会产生任何作用。

如果在页面被提交之前 servlet 没有设置 locale，容器的默认 locale 将用来确定响应的locale，但是没有制定与客户端通信的规范，例如使用 HTTP 情况下的Content-Language 头。

```xml
<locale-encoding-mapping-list>
    <locale-encoding-mapping>
        <locale>ja</locale>
        <encoding>Shift_JIS</encoding>
    </locale-encoding-mapping>
</locale-encoding-mapping-list>
```

如果该元素不存在或没有提供映射，setLocale 使用容器依赖的映射。

setCharacterEncoding，setContentType 和 setLocale 方法可以被重复的调用来改变字符编码。

如果在 servlet 响应的 getWriter 方法已经调用之后或响应被提交之后，调用相关方法设置字符编码将没有任何作用。

只有当给定的上下文类型字符串提供了一个 charset 属性值，调用 setContentType 可以设置字符编码。

只有当既没有调用 setCharacterEncoding 也没有调用 setContentType 去设置字符编码之前调用 setLocale 才可以设置字符编码。

在 ServletResponse 接口的 getWriter 方法被调用或响应被提交之前，如果 servlet 没有指定字符编码，默认使用 ISO-8859-1。

如果使用的协议提供了一种这样做的方式，容器必须传递 servlet 响应的writer 使用的 locale 和字符编码到客户端。

使用 HTTP 的情况下，locale 可以使用 Content-Language 头传递，字符编码可以作为用于指定文本媒体类型的 Content-Type 头的一部分传递。

注意，如果没有指定上下文类型，字符编码不能通过 HTTP 头传递；但是仍使用它来编码通过servlet 响应的 writer 写的文本。

# 结束响应对象

当响应被关闭时，容器必须立即刷出响应缓冲区中的所有剩余的内容到客户端。

以下事件表明 servlet 满足了请求且响应对象即将关闭：

* servlet 的 service 方法终止。

* 响应的 setContentLength 或 setContentLengthLong 方法指定了大于零的内容量，且已经写入到响应。

* sendError 方法已调用。5.6

* sendRedirect 方法已调用。

* AsyncContext 的 complete 方法已调用

# 响应对象的生命周期

每个响应对象只有当在 servlet 的 service 方法的范围内或在 filter 的 doFilter 方法范围内是有效的，除非该组件关联的请求对象已经开启异步处理。

如果相关的请求已经启动异步处理，那么直到AsyncContext 的 complete 方法被调用，请求对象一直有效。

为了避免响应对象创建的性能开销，容器通常回收响应对象。

在相关的请求的startAsync 还没有调用时，开发人员必须意识到保持到响应对象引用，超出之上描述的范围可能导致不确定的行为。

# 参考地址

https://download.oracle.com/otn-pub/jcp/servlet-3_1-fr-eval-spec/servlet-3_1-final.pdf

* any list
{:toc}