---
layout: post
title:  jsp 学习笔记-06-jsp 是什么?
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, http, jsp, sf]
published: true
---

# 什么是Java Server Pages?

JSP全称Java Server Pages，是一种动态网页开发技术。它使用JSP标签在HTML网页中插入Java代码。

标签通常以`<%`开头以`%>`结束。

JSP是一种Java servlet，主要用于实现Java web应用程序的用户界面部分。网页开发者们通过结合HTML代码、XHTML代码、XML元素以及嵌入JSP操作和命令来编写JSP。

JSP通过网页表单获取用户输入数据、访问数据库及其他数据源，然后动态地创建网页。

JSP标签有多种功能，比如访问数据库、记录用户选择信息、访问JavaBeans组件等，还可以在不同的网页中传递控制信息和共享信息。

# 为什么使用JSP？

JSP程序与CGI程序有着相似的功能，但和CGI程序相比，JSP程序有如下优势：

性能更加优越，因为JSP可以直接在HTML网页中动态嵌入元素而不需要单独引用CGI文件。

服务器调用的是已经编译好的JSP文件，而不像CGI/Perl那样必须先载入解释器和目标脚本。

JSP 基于Java Servlet API，因此，JSP拥有各种强大的企业级Java API，包括JDBC，JNDI，EJB，JAXP等等。

JSP页面可以与处理业务逻辑的 Servlet 一起使用，这种模式被Java servlet 模板引擎所支持。

最后，JSP是Java EE不可或缺的一部分，是一个完整的企业级应用平台。这意味着JSP可以用最简单的方式来实现最复杂的应用。

# JSP的优势

以下列出了使用JSP带来的其他好处：

与ASP相比：JSP有两大优势。

首先，动态部分用Java编写，而不是VB或其他MS专用语言，所以更加强大与易用。

第二点就是JSP易于移植到非MS平台上。

与纯 Servlet 相比：JSP可以很方便的编写或者修改HTML网页而不用去面对大量的println语句。

与SSI相比：SSI无法使用表单数据、无法进行数据库链接。

与JavaScript相比：虽然JavaScript可以在客户端动态生成HTML，但是很难与服务器交互，因此不能提供复杂的服务，比如访问数据库和图像处理等等。

与静态HTML相比：静态HTML不包含动态信息。

# JSP 结构

网络服务器需要一个 JSP 引擎，也就是一个容器来处理 JSP 页面。容器负责截获对 JSP 页面的请求。

本教程使用内嵌 JSP 容器的 Apache 来支持 JSP 开发。

JSP 容器与 Web 服务器协同合作，为JSP的正常运行提供必要的运行环境和其他服务，并且能够正确识别专属于 JSP 网页的特殊元素。

下图显示了 JSP 容器和 JSP 文件在 Web 应用中所处的位置。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0830/092443_9d6e1699_508704.png)

# JSP 处理

以下步骤表明了 Web 服务器是如何使用JSP来创建网页的：

就像其他普通的网页一样，您的浏览器发送一个 HTTP 请求给服务器。

Web 服务器识别出这是一个对 JSP 网页的请求，并且将该请求传递给 JSP 引擎。通过使用 URL 或者 `.jsp` 文件来完成。

**JSP 引擎从磁盘中载入 JSP 文件，然后将它们转化为 Servlet。这种转化只是简单地将所有模板文本改用 println() 语句，并且将所有的 JSP 元素转化成 Java 代码。**

JSP 引擎将 Servlet 编译成可执行类，并且将原始请求传递给 Servlet 引擎。

Web 服务器的某组件将会调用 Servlet 引擎，然后载入并执行 Servlet 类。

在执行过程中，Servlet 产生 HTML 格式的输出并将其内嵌于 HTTP response 中上交给 Web 服务器。

Web 服务器以静态 HTML 网页的形式将 HTTP response 返回到您的浏览器中。

最终，Web 浏览器处理 HTTP response 中动态产生的HTML网页，就好像在处理静态网页一样。

以上提及到的步骤可以用下图来表示：

![输入图片说明](https://images.gitee.com/uploads/images/2020/0830/092628_171e68bc_508704.png)

一般情况下，JSP 引擎会检查 JSP 文件对应的 Servlet 是否已经存在，并且检查 JSP 文件的修改日期是否早于 Servlet。

如果 JSP 文件的修改日期早于对应的 Servlet，那么容器就可以确定 JSP 文件没有被修改过并且 Servlet 有效。

这使得整个流程与其他脚本语言（比如 PHP）相比要高效快捷一些。

总的来说，JSP 网页就是用另一种方式来编写 Servlet 而不用成为 Java 编程高手。

除了解释阶段外，JSP 网页几乎可以被当成一个普通的 Servlet 来对待。

* any list
{:toc}