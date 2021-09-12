---
layout: post
title: Java Servlet3.1 规范-09-dispatch request 请求分发
date:  2021-09-09 14:49:58 +0800
categories: [Java]
tags: [web, servlet, servlet3, sh]
published: true
---

# Web 应用

Web 应用是一个 servlets,HTML 页面,类,和其他资源的集合，用于一个在 Web 服务器的完成的应用。

Web 应用可以捆绑和运行来自多个供应商的在多个容器。

# Web 服务器中的 Web 应用

在 Web 服务器中 Web 应用程序的根目录是一个特定的路径。

例如，一个catalog应用，可以位于 http://www.mycorp.com/catalog。以这个前缀开始的所有请求将被路由到代表 catalog 应用的 ServletContext 环境中。

servlet 容器能够制定Web应用程序自动生成的规则。

例如，一个~user/映射可用于映射到一个基于/home /user/public_html/ 的 Web 应用。

默认情况下，在任何时候一个 Web 应用程序的实例必须运行在一个虚拟机（VM）中。如果应用程序通过其部署描述文件标记为“分布式”的，那么可以覆盖此行为。

标记为分布式的应用程序必须遵守比普通的 Web 应用程序更严格的规则。本规范中陈述了这些规则。

# 与 ServletContext 的关系

servlet 容器必须强制 Web 应用程序和 ServletContext 之间一对一对应的关系。ServletContext 对象提供了一个 servlet 和它的应用程序视图。

# Web 应用的元素

Web 应用可能由下面几部分组成：

* Servlet
* [JSP™ 页面](http://java.sun.com/products/jsp)
* 工具类
* 静态文档 (HTML, 图片, 声音, 等等.)
* 客户端 Java applet, bean, 和 类
* 结合上述所有要素的描述性的元信息

# 部署层次结构

本规范定义了一个用于部署和打包用途的，可存在于开放文件系统、归档文件或一些其他形式中的层次结构。

建议 servlet 容器支持这种结构作为运行时表示形式，但不是必须的.

# 目录结构

一个 Web 应用程序以结构化的目录层次结构存在。层次结构的根目录作为文件的归档目录，这些文件是应用的一部分。

例如，对于 Web 容器中一个 Web 应用程序的上下文路径/catalog，在 Web 应用程序层次结构中的 index.html 文件，或在 WEB-INF/lib 目录下的 JAR 文件中的META-INF/resources 目录下包括的 index.html 文件，可以满足从 /catalog/index.html送达的请求。如果在根上下文中和应用的 WEB-INF/lib 目录下的 JAR 文件中的 META-INF/resources 目录中都存在一个 index.html 文件，那么必须使用根上下文中的index.html。

匹配的 URL 到上下文路径的规则安排在第12章：“请求映射到servlet”中。由于应用的上下文路径确定了 Web 应用内容的 URL 命名空间，Web容器必须拒绝 Web 应用定义的上下文路径，因为可能在这个 URL 命名空间中导致潜在的冲突。

例如，试图部署两个具有相同上下文路径的 Web 应用时可能发生这种情况。由于把请求匹配到资源是区分大小写的，所以在确定潜在冲突时也必须区分大小写。

应用程序层次结构中存在一个名为“WEB-INF”的特殊目录。这个目录包含了与应用程序相关的所有东西，这些东西不在应用程序的归档目录中。大多数 WEB-INF 节点都不是应用程序公共文档树的一部分。

除了 WEB-INF/lib 目录下打包在 JAR 文件中 META-INF/resources 目录下的静态资源和 JSP 文件之外，WEB-INF 目录下包含的其他任何文件都不能由容器直接提供给客户端访问。

然而，WEB-INF 目录中的内容可以通过 servlet代码调用 ServletContext 的 getResource 和 getResourceAsStream方法来访问，并可使用 RequestDispatcher 调用公开这些内容。

因此，如果应用开发人员想通过 servlet 代码访问这些内容，而不愿意直接对客户端公开应用程序指定配置信息，那么可以把它放在这个目录下。

由于把请求匹配到资源的映射区分大小写，例如，客户端请求‘/WEB-INF/foo’，‘/WEb-iNf/foo’，不应该返回位于/WEB-INF下的Web应用程序的内容，也不应该返回其中任何形式的目录列表。

WEB-INF目录中的内容有：

* /WEB-INF/web.xml 部署描述文件。

* servlet 和实用工具类目录 /WEB-INF/classes/。此目录中的类对应用程序类加载器必须是可见的。

* java 归档文件区域 /WEB-INF/lib/*.jar。这些文件中包括了servlet，bean，静态资源和打包在JAR文件中的 JSP 文件，以及其他对Web 应用程序有用的实用工具类。Web 应用程序的类加载器必须能够从这些归档文件中加载类。

Web 应用程序类加载器必须先从 WEB-INF/classes 目录下加载类，然后从 WEB-INF/lib 目录下的 JAR 库中加载。

此外，除了静态资源打包在JAR 文件中的情况外，任何来自客户端的请求访问 WEB-INF/目录中的资源必须返回一个 SC_NOT_FOUND（404）的响应。

### 应用程序目录结构示例

下面是一个示例 Web 应用程序的文件清单：

```
/index.html
/howto.jsp
/feedback.jsp
/images/banner.gif
/images/jumping.gif
/WEB-INF/web.xml
/WEB-INF/lib/jspbean.jar
/WEB-INF/lib/catalog.jar!/META-INF/resources/catalog/moreOffers/books.html
/WEB-INF/classes/com/mycorp/servlets/MyServlet.class
/WEB-INF/classes/com/mycorp/util/MyUtils.class
```

# Web应用归档文件

可以使用标准的 Java 归档工具把 Web 应用程序打包并签名到一个 Web 存档格式（WAR）文件中。

例如，一个关于“issue tracking”的应用程序可以分布在一个称为 issuetrack.war 的归档文件中。

当打包成这种形式时，将生成一个 META-INF 目录，其中包含了对 java归档工具有用的信息。

尽管这个目录的内容可以通过 servlet 代码调用ServletContext 的 getResource 和 getResourceAsStream 方法来访问，容器也不能把这个目录当作内容来响应客户端请求。

此外，任何请求访问 META-INF 目录中的资源必须返回一个 SC_NOT_FOUND（404）的响应。

# Web 应用部署描述符

Web 应用程序部署描述文件（见第14章，“部署描述文件”）的配置和部署信息包括以下几种类型：

* ServletContext 的初始化参数
* Session 配置
* Servlet/JSP 的定义
* Servlet/JSP 的映射
* MIME 类型映射
* 欢迎文件列表
* 错误页面
* 安全

### 扩展的依赖关系

当许多应用程序使用相同的代码或资源，通常将它们安装在容器的库文件中。这些文件往往是通用的或标准的 API，可以在不牺牲可移植性的情况下使用。

仅由一个或几个应用程序使用的文件将作为 Web 应用程序的一部分来访问。容器必须为这些库提供一个目录。

放置在这个目录中的文件必须对所有的Web应用可见。此目录的位置由容器指定。servlet 容器用于加载这些库文件的类加载器必须和在同一个 JVM 中的所有 Web 应用的类加载器相同。这个类加载器的实例必须在 Web 应用程序类加载器的父类加载器链中。

为了保持可移植性，应用程序开发人员需要知道 Web 容器中安装了哪些扩展，而容器需要知道 WAR 中的 servlet 依赖哪些库。

依赖这样的扩展的应用开发人员必须在 WAR 文件中提供一个列出所有 WAR 文件所需扩展的 META-INF/MANIFEST.MF 文件。

清单文件的格式应该遵循标准的 JAR 清单格式。在部署 Web 应用程序的时候，Web容器必须使正确的扩展版本对遵循可选包版本控制（Optional Package Versioning）机制（http://java.sun.com/j2se/1.4/docs/guide/extensions/）定义的规则的应用程序可见。

Web 容器也必须能够识别出 WAR 文件中 WEB-INF/lib 目录下的任意一个 JAR 包中的清单文件声明的依赖关系。

如果 Web 容器不能够满足以这种方式声明的依赖关系，它应该使用一条有意义的错误消息拒绝该应用程序。

### Web 应用程序类加载器

容器用于加载 WAR 文件中 servlet 的类加载器必须允许开发人员使用getResource 加载遵循正常 JavaSE 语义的 WAR 文件的 JAR 包中包含的任何资源。

和 Java EE 许可协议中描述的一样，不属于 Java EE 产品的 servlet 容器不应该允许应用程序覆盖 Java SE 平台中的类，如在 java.* 和 javax.* 命名空间中的类，Java SE 不允许进行修改。

容器不应该允许应用程序覆盖或访问容器的实现类。同时建议应用程序类加载器实现成 WAR 文件中的类和资源优先于属于容器范围内的 JAR 包中的类和资源加载。

一个类加载器的实现必须保证对部署到容器的每个 web 应用，调用 Thread.currentThread.getContextClassLoader() 返回一个实现了本节规定的约定的 ClassLoader  实例。

此外，部署的每个 Web应用程序的 ClassLoader 实例必须是一个单独的实例。

容器必须在任何回调（包括侦听器回调）到Web应用程序之前设置上面描述的线程上下文 ClassLoader，一旦回调返回，需要把它设置成原来的 ClassLoader。

# Web 应用部署描述符

Web 应用程序部署描述文件（见第14章，“部署描述文件”）的配置和部署信息包括以下几种类型：

* ServletContext 的初始化参数
* Session 配置
* Servlet/JSP 的定义
* Servlet/JSP 的映射
* MIME 类型映射
* 欢迎文件列表
* 错误页面
* 安全

### 扩展的依赖关系

当许多应用程序使用相同的代码或资源，通常将它们安装在容器的库文件中。这些文件往往是通用的或标准的 API，可以在不牺牲可移植性的情况下使用。

仅由一个或几个应用程序使用的文件将作为 Web 应用程序的一部分来访问。容器必须为这些库提供一个目录。放置在这个目录中的文件必须对所有的Web应用可见。

此目录的位置由容器指定。servlet 容器用于加载这些库文件的类加载器必须和在同一个 JVM 中的所有 Web 应用的类加载器相同。这个类加载器的实例必须在 Web 应用程序类加载器的父类加载器链中。

为了保持可移植性，应用程序开发人员需要知道 Web 容器中安装了哪些扩展，而容器需要知道 WAR 中的 servlet 依赖哪些库。

依赖这样的扩展的应用开发人员必须在 WAR 文件中提供一个列出所有 WAR 文件所需扩展的 META-INF/MANIFEST.MF 文件。清单文件的格式应该遵循标准的 JAR 清单格式。

在部署 Web 应用程序的时候，Web容器必须使正确的扩展版本对遵循可选包版本控制（Optional Package Versioning）机制（http://java.sun.com/j2se/1.4/docs/guide/extensions/）定义的规则的应用程序可见。

Web 容器也必须能够识别出 WAR 文件中 WEB-INF/lib 目录下的任意一个 JAR 包中的清单文件声明的依赖关系。

如果 Web 容器不能够满足以这种方式声明的依赖关系，它应该使用一条有意义的错误消息拒绝该应用程序。

### Web 应用程序类加载器

容器用于加载 WAR 文件中 servlet 的类加载器必须允许开发人员使用getResource 加载遵循正常 JavaSE 语义的 WAR 文件的 JAR 包中包含的任何资源。

和 Java EE 许可协议中描述的一样，不属于 Java EE 产品的 servlet 容器不应该允许应用程序覆盖 Java SE 平台中的类，如在 java.* 和 javax.* 命名空间中的类，Java SE 不允许进行修改。

容器不应该允许应用程序覆盖或访问容器的实现类。同时建议应用程序类加载器实现成 WAR 文件中的类和资源优先于属于容器范围内的 JAR 包中的类和资源加载。

一个类加载器的实现必须保证对部署到容器的每个 web 应用，调用 Thread.currentThread.getContextClassLoader() 返回一个实现了本节规定的约定的 ClassLoader  实例。

此外，部署的每个 Web应用程序的 ClassLoader 实例必须是一个单独的实例。容器必须在任何回调（包括侦听器回调）到Web应用程序之前设置上面描述的线程上下文 ClassLoader，一旦回调返回，需要把它设置成原来的 ClassLoader。

# 更新 Web 应用

服务器应该能够更新一个新版本的应用程序，而无需重启容器。当一个应用程序更新时，容器应提供一个可靠的方法来保存该应用程序的会话数据。

# 错误处理

### 请求属性

在发生错误时，Web 应用程序必须能够详细说明，应用程序中的其他资源被用来提供错误响应的内容主体。这些资源的规定在部署描述文件中配置。

如果错误处理位于一个servlet或JSP页面：

* 原来打开的由容器创建的请求和响应对象被传递给servlet或JSP页面。。
* 请求路径和属性被设置成如同RequestDispatcher.forward跳转到已经完成的错误资源一样。
* 必须设置表10-1中的请求属性。

TABLE 10-1 Request Attributes and their types

| 请求属性                           | 类型                |
| ---------------------------------- | ------------------- |
| javax.servlet.error.status_code    | java.lang.Integer   |
| javax.servlet.error.exception_type | java.lang.Class     |
| javax.servlet.error.message        | java.lang.String    |
| javax.servlet.error.exception      | java.lang.Throwable |
| javax.servlet.error.request_uri    | java.lang.String    |
| javax.servlet.error.servlet_name   | java.lang.String    |

这些属性允许 servlet 根据状态码、异常类型、错误消息、传播的异常对象、发生错误时由 servlet 处理的请求 URI（像调用 getRequestURI方法确定的 URI 一样）、以及发生错误的 servlet 的逻辑名称来生成专门的内容。

由于本规范的2.3版本引入了异常对象属性列表，异常类型和错误消息属性是多余的。他们保留向后兼容早期的 API 版本。

### 错误页面

为了使开发人员能够在 servlet 产生一个错误时自定义内容的外观返回到 Web 客户端，部署描述文件中定义了一组错误页面说明。

这种语法允许当 servlet 或过滤器调用响应对象的 sendError 方法指定状态码时，或如果 servlet 产生一个异常或错误传播给容器时，由容器返回资源配置。

如果调用应对象的 sendError 方法，容器参照为 Web 应用声明的错误页面列表，使用状态码语法并试图匹配一个错误页面。

如果找到一个匹配的错误页面，容器返回这个位置条目指示的资源。

在处理请求的时候 servlet 或过滤器可能会抛出以下异常：

* 运行时异常或错误

* ServletException或它的子类异常

* IOException或它的子类异常

Web 应用程序可以使用 exception-type 元素声明错误页面。在这种情况下，容器通过比较抛出的异常与使用 exception-type 元素定义的error-page 列表来匹配异常类型。在容器中的匹配结果返回这个位置条目指示的资源。在类层次中最接近的匹配将被返回。

如果声明的 error-page 中没有包含 exception-type 适合使用的类层次结构的匹配，那么抛出一个 ServletException 异常或它的子类异常，容器通过 ServletException.getRootCause 方法提取包装的异常。第二遍通过修改错误页面声明，使用包装的异常再次尝试匹配声明的错误页面。

使用 exception-type 元素声明的 error-page 在部署描述文件中必须唯一的，由 exception-type 的类名决定它的唯一性。同样地， 使用status-code 元素声明的 error-page 在部署描述文件中必须是唯一的，由状态码决定它的唯一性。

如果部署描述中的一个 error-page 元素没包含一个 exception-type 或  error-code 元素，错误页面是默认的错误页面。

当错误发生时，错误页面机制不会干预调用使用 RequestDispatcher 或filter.doFilter 方法。用这种方法，过滤器或 Servlet 有机会使用RequestDispatcher 处理产生的错误。

如果上述错误页面机制没有处理 servlet 产生的错误，那么容器必须确保发送一个状态500的响应。

默认的 servlet 和容器将使用 sendError 方法，发送4xx和5xx状态的响应，这样错误机制才可能会被调用。默认的servlet和容器将使用setStatus 方法，设置2xx和3xx的响应，并不会调用错误页面机制。

如果应用程序使用第2.3.3.3节，“异步处理”中描述的异步操作，那么处理应用程序创建的线程的所有错误是应用程序的职责。

容器应该通过AsyncContext.start 方法注意线程发出的错误。对于处理AsyncContext.dispatch 过程中发生的错误，请参照相关章节，“执行dispatch 方法的时候可能发生的错误或异常必须被容器按照如下的方式捕获并处理”。

### 错误过滤器

错误页面机制运行在由容器创建的原来未包装过的或未经过过滤的请求或响应对象上。

在第6.2.5节“过滤器和请求转发”中描述的机制可以在产生一个错误响应之前用来指定要应用的过滤器。

# 欢迎文件

Web 应用程序开发人员可以在 Web 应用程序部署描述文件中定义一个称为欢迎文件的局部 URI 有序列表。在 Web 应用程序部署描述文件模式中描述了部署描述文件中欢迎文件列表的语法。

这种机制的目的是，当一个对应到 WAR文件中一个目录条目的请求 URI没有映射到一个 Web 组件时，允许部署者为容器用于添加 URI 指定局部URI 有序列表。这种请求被认为是有效的局部请求。

通过下面常见的例子来明确这种用法的便利：可以定义‘index.html’欢迎文件，以便像请求 URL host:port/webapp/directory/，其中‘directory’是 WAR 文件中的一个不能映射到 servlet 或 JSP 页面的条目，以下面的形式返回给客户端：‘host:port/webapp/directory/index.html’。

如果 Web 容器接收到一个有效的局部请求，Web 容器必须检查部署描述文件中定义的欢迎文件列表。欢迎文件列表是一个没有尾随或前导/的局部URL 有序列表。Web 服务器必须把部署描述文件中按指定顺序的每个欢迎文件添加到局部请求，并检查 WAR 文件中的静态资源是否映射到请求 URI。如果没有找到匹配的，Web 服务器必须再把部署描述文件中按指定顺序的每个欢迎文件添加到局部请求,并检查 servlet 是否映射到请求 URI。 Web 容器必须将请求发送到 WAR 文件中第一个匹配的资源。容器可使用转发、重定向、或容器指定的机制将请求发送到欢迎资源，这与直接请求没有什么区别。

如果按上述的方式没有找到匹配的欢迎文件，容器可能会使用它认为合适的方式处理该请求。

对于有的配置来说，这可能意味着返回一个目录列表，对其他配置来说可能返回一个404响应。

考虑一个 Web 应用程序：

* 部署描述文件列出了以下的欢迎文件。

```xml
    <welcome-file-list>
        <welcome-file>index.html</welcome-file>
        <welcome-file>default.jsp</welcome-file>
    </welcome-file-list>
```

* WAR 文件中的静态内容如下

```
    /foo/index.html
    /foo/default.jsp
    /foo/orderform.html
    /foo/home.gif
    /catalog/default.jsp
    /catalog/products/shop.jsp
    /catalog/products/register.jsp
```

* 请求URI /foo将被重定向到URI /foo/。
* 请求URI /foo/将返回/foo/index.html的。
* 请求URI /catalog将被重定向到URI /catalog/。
* 请求URI /catalog/将返回/catalog/default.jsp。
* 请求URI /catalog/index.html将导致404未找到错误。
* 请求URI /catalog/products将重定向到URI /catalog/products/。
* 请求URI /catalog/products/将被传递给“默认”的 servlet（如果有默认的 servlet 的话）。如果没有映射到“默认”的 servlet，请求可能会导致一个404未找到错误，可能会导致一个包括 shop.jsp 和 register.jsp目录列表，或可能导致容器定义的其他行为。请参见12.2节，“映射规范”定义的“默认” servlet。
* 所有上述的静态内容都可以打包到 JAR 文件的 META-INF/resources目录中。这个 JAR 文件可以放到 Web 应用的 WEB-INF/lib 目录下。

# Web 环境

servlet 容器不属于 Java EE 技术标准的实现，鼓励实现这个容器但不是必需的，实现应用环境的功能请参见第15.2.2节中描述的“Web应用环境”和 Java EE 规范。

如果他们没有实现需要支持这种环境的条件，根据部署依赖它们的应用程序，容器应该提供一个警告。

# Web 应用部署

当一个 Web 应用程序部署到容器中，在 Web 应用程序开始处理客户端请求之前，必须按照下述步骤顺序执行。

* 实例化部署描述文件中`<listener>`元素标识的每个事件监听器的一个实例。

* 对于已实例化的实现了 ServletContextListener 接口的监听器实例，调用 contextInitialized() 方法。

* 实例化部署描述文件中`<filter>`元素标识的每个过滤器的一个实例，并调用每个过滤器实例的init()方法。

* 包含`<load-on-startup>`元素的`<servlet>`元素，根据 load-on-startup 元素值定义的顺序为每个 servlet 实例化一个实例，并调用每个 servlet 实例的 init() 方法。

# 包含 web.xml 部署描述符

如果 Web 应用不包含任何 servlet、过滤器、或监听器组件或使用注解声明相同的，那么可以不需要 web.xml 文件。

换句话说，只包含静态文件或 JSP 页面的应用程序并不需要一个 web.xml 的存在。

# 参考地址

https://download.oracle.com/otn-pub/jcp/servlet-3_1-fr-eval-spec/servlet-3_1-final.pdf

* any list
{:toc}