---
layout: post
title: Java Servlet3.1 规范-04-servlet context 上下文
date:  2021-09-09 14:49:58 +0800
categories: [Java]
tags: [web, servlet, servlet3, sh]
published: true
---

# ServletContext 接口介绍

ServletContext 接口定义了 servlet 运行在的 Web 应用的视图。

容器供应商负责提供 servlet 容器的 ServletContext 接口的实现。

servlet 可以使用 ServletContext 对象记录事件，获取 URL 引用的资源，存取当前上下文的其他 servlet 可以访问的属性。

ServletContext 是 Web 服务器中已知路径的根。

例如，servlet 上下文可以从 http://www.waylau.com/catalog 找出，/catalog 请求路径称为上下文路径，所有以它开头的请求都会被路由到与 ServletContext 相关联的 Web 应用。

# ServletContext 接口作用域

每一个部署到容器的 Web 应用都有一个 ServletContext 接口的实例与之关联。

在容器分布在多台虚拟机的情况下，每个 JVM 的每个 Web 应用将有一个 ServletContext 实例。

如果容器内的 Servlet 没有部署到 Web 应用中，则隐含的作为“默认” Web 应用的一部分，并有一个默认的 ServletContext。

在分布式的容器中，默认的 ServletContext 是非分布式的且仅存在于一个 JVM 中。

# 初始化参数

如下 ServletContext 接口方法允许 servlet 访问由应用开发人员在 Web 应用中的部署描述符中指定的上下文初始化参数：

* getInitParameter

* getInitParameterNames

应用开发人员使用初始化参数来表达配置信息。

代表性的例子是一个网络管理员的 e-mail 地址，或保存关键数据的系统名称。

# 配置方法

下面的方法从 Servlet 3.0 开始添加到 ServletContext，以便启用编程方式定义 Servlet、Filter 和它们映射到的 url 模式。

这些方法只能从 ServletContextListener 实现的 contexInitialized 方法或者ServletContainerInitializer 实现的 onStartup 方法进行的应用初始化过程中调用。 

除了添加 Servlet 和 Filter，也可以查找关联到Servlet 或 Filter 的一个 Registration 对象实例，或者到 Servlet 或 Filter 的所有 Registration 对象的 map。

如果 ServletContext 传到了 ServletContextListener 的contextInitialized 方法，但该 ServletContextListener 既没有在 web.xml 或 web-fragment.xml 中声明也没有使用 @WebListener 注解，则在 ServletContext 中定义的用于
Servlet、Filter 和 Listener 的编程式配置的所有方法必须抛出UnsupportedOperationException。

### 编程式添加和配置 Servlet

编程式添加 Servlet 到上下文对框架开发者是很有用的。例如，框架可以使用这个方法声明一个控制器 servlet。

这个方法将返回一个ServletRegistration 或 ServletRegistration.Dynamic 对象，允许我们进一步配置如 init-params，url-mapping 等 Servlet 的其他参数。

下面描述了该方法的三个重载版本。

#### addServlet(String servletName, String className)

该方法允许应用以编程方式声明一个 servlet。它添加给定的servlet名称和class名称到 servlet 上下文。

#### addServlet(String servletName, Servlet servlet)

该方法允许应用以编程方式声明一个 Servlet。它添加给定的名称和Servlet 实例的 Servlet 到 servlet 上下文。

#### addServlet(String servletName, Class <? extends Servlet> servletClass)

该方法允许应用以编程方式声明一个 Servlet。它添加给定的名称和Servlet 类的一个实例的 Servlet 到 servlet 上下文。

#### `<T extends Servlet> T createServlet(Class<T> clazz)`

该方法实例化一个给定的 Servlet class，该方法必须支持适用于Servlet 的除了 @WebServlet 的所有注解。

返回的 Servlet 实例通过调用上边定义的 addServlet(String, Servlet) 注册到 ServletContext 之前，可以进行进一步的定制。

#### ServletRegistration getServletRegistration(String servletName)

该方法返回与指定名字的 Servlet 相关的 ServletRegistration，或者如果没有该名字的 ServletRegistration 则返回 null。

如果ServletContext 传到了 ServletContextListener 的contextInitialized 方法，但该 ServletContextListener 既没有在web.xml或web-fragment.xml 中声明也没有使用javax.servlet.annotation.WebListener 注解，则必须抛出UnsupportedOperationException。

#### `Map<String, ? extends ServletRegistration> getServletRegistrations()`

该方法返回 ServletRegistration 对象的 map，由名称作为键并对应着注册到 ServletContext 的所有 Servlet。如果没有 Servlet 注册到ServletContext 则返回一个空的 map。返回的 Map 包括所有声明和注解的 Servlet 对应的 ServletRegistration 对象，也包括那些使用addServlet 方法添加的所有 Servlet 对于的 ServletRegistration 对象。返回的 Map 的任何改变不影响 ServletContext。如果ServletContext 传到了 ServletContextListener 的contextInitialized 方法，但该 ServletContextListener 既没有在web.xml 或 web-fragment.xml 中声明也没有使用javax.servlet.annotation.WebListener 注解，则必须抛出UnsupportedOperationException。

### 编程式添加和配置 Filter

#### addFilter(String filterName, String className)

该方法允许应用以编程方式声明一个 Filter。它添加以给定的名称和class 名称的 Filter 到 web 应用。

#### addFilter(String filterName, Filter filter)

该方法允许应用以编程方式声明一个 Filter。它添加以给定的名称和filter 实例的 Filter 到 web 应用。

#### addFilter(String filterName, Class <? extends Filter> filterClass)

该方法允许应用以编程方式声明一个 Filter。它添加以给定的名称和filter 类的一个实例的 Filter 到 web 应用。

#### `<T extends Filter> T createFilter(Class<T> clazz)`

该方法实例化一个给定的 Filter class，该方法必须支持适用于 Filter的所有注解。

返回的 Filter 实例通过调用上边定义的 addFilter(String, Filter)注册到 ServletContext 之前，可以进行进一步的定制。给定的 Filter 类必须定义一个用于实例化的空参构造器。

#### FilterRegistration getFilterRegistration(String filterName)

该方法返回与指定名字的 Filter 相关的 FilterRegistration，或者如果没有该名字的 FilterRegistration 则返回 null。

如果ServletContext 传到了 ServletContextListener 的contextInitialized 方法，但该 ServletContextListener 既没有在web.xml 或 web-fragment.xml 中声明也没有使用javax.servlet.annotation.WebListener 注解，则必须抛出UnsupportedOperationException。

#### `Map<String, ? extends FilterRegistration> getFilterRegistrations()`

该方法返回 FilterRegistration 对象的 map，由名称作为键并对应着注册到 ServletContext 的所有 Filter。

如果没有 Filter 注册到ServletContext 则返回一个空的 Map。返回的 Map 包括所有声明和注解的 Filter 对应的 FilterRegistration 对象，也包括那些使用addFilter 方法添加的所有 Servlet 对于的 ServletRegistration 对象。

返回的 Map 的任何改变不影响 ServletContext。如果ServletContext 传到了 ServletContextListener 的contextInitialized 方法，但该 ServletContextListener 既没有在web.xml 或 web-fragment.xml 中声明也没有使用javax.servlet.annotation.WebListener 注解，则必须抛出UnsupportedOperationException。

### 编程式添加和配置 Listener

#### void addListener(String className)

往 ServletContext 添加指定 class 名称的监听器。ServletContext 将使用由与应用关联的 classloader 装载加载该给定名称的 class，且它们必须实现一个或多个以下接口：

* javax.servlet.ServletContextAttributeListener
* javax.servlet.ServletRequestListener
* javax.servlet.ServletRequestAttributeListener
* javax.servlet.http.HttpSessionListener
* javax.servlet.http.HttpSessionAttributeListener
* javax.servlet.http.HttpSessionIdListener

如果 ServletContext 传到了 ServletContainerInitializer 的onStartup 方法，则给定名字的类可以实现除上面列出的接口之外的javax.servlet.ServletContextListener。作为该方法调用的一部分，容器必须装载指定类名的 class，以确保其实现了所需的接口之一。如果给定名字的类实现了一个监听器接口，则其调用顺序和声明顺序是一样的，换句话说，如果它实现了 javax.servlet.ServletRequestListener 或 javax.servlet.http.HttpSessionListener，那么新的监听器将被添加到该接口的有序监听器列表的末尾。

#### `<T extends EventListener> void addListener(T t)`

往 ServletContext 添加一个给定的监听器。给定的监听器实例必须实现一个或多个如下接口：

* javax.servlet.ServletContextAttributeListener
* javax.servlet.ServletRequestListener
* javax.servlet.ServletRequestAttributeListener
* javax.servlet.http.HttpSessionListener
* javax.servlet.http.HttpSessionAttributeListener
* javax.servlet.http.HttpSessionIdListener

如果 ServletContext 传到了 ServletContainerInitializer 的onStartup 方法，则给定的监听器实例可以实现除上面列出的接口之外的javax.servlet.ServletContextListener。如果给定的监听器实例实现了一个监听器接口，则其调用顺序和声明顺序是一样的，换句话说，如果它实现了 javax.servlet.ServletRequestListener 或 javax.servlet.http.HttpSessionListener，那么新的监听器将被添加到该接口的有序监听器列表的末尾。

#### `void addListener(Class <? extends EventListener> listenerClass)`

往 ServletContext 添加指定 class 类型的监听器。给定的监听器类必须实现是一个或多个如下接口：

* javax.servlet.ServletContextAttributeListener
* javax.servlet.ServletRequestListener
* javax.servlet.ServletRequestAttributeListener
* javax.servlet.http.HttpSessionListener
* javax.servlet.http.HttpSessionAttributeListener
* javax.servlet.http.HttpSessionIdListener

如果 ServletContext 传到了 ServletContainerInitializer 的onStartup 方法，则给定的监听器类可以实现除上面列出的接口之外的javax.servlet.ServletContextListener。

如果给定的监听器类实现了一个监听器接口，则其调用顺序和声明顺序是一样的，换句话说，如果它实现了 javax.servlet.ServletRequestListener 或 javax.servlet.http.HttpSessionListener，那么新的监听器将被添加到该接口的有序监听器列表的末尾。

#### `<T extends EventListener> void createListener(Class<T> clazz)`

该方法实例化给定的 EventListener 类。指定的 EventListener 类必须实现至少一个如下接口：

* javax.servlet.ServletContextAttributeListener
* javax.servlet.ServletRequestListener
* javax.servlet.ServletRequestAttributeListener
* javax.servlet.http.HttpSessionListener
* javax.servlet.http.HttpSessionAttributeListener
* javax.servlet.http.HttpSessionIdListener

该方法必须支持该规范定义的适用于如上接口的所有注解。返回的EventListener 实例可以在通过调用 addListener(T t) 注册到ServletContext 之前进行进一步的定制。给定的 EventListener 必须定义一个用于实例化的空参构造器。

#### 用于编程式添加 Servlet、Filter 和 Listener 的注解处理需求

除了需要一个实例的 addServlet 之外，当使用编程式API添加Servlet或创建Servlet时，以下类中的有关的注解必须被内省且其定义的元数据必须被使用，除非它被 ServletRegistration.Dynamic / ServletRegistration 中调用的API覆盖了。

@ServletSecurity、@RunAs、@DeclareRoles、@MultipartConfig。

对于 Filter 和 Listener 来说，不需要使用注解来内省。

除了通过需要一个实例的方法添加的那些组件，编程式添加或创建的所有组件（Servlet，Filter和Listener）上的资源注入，只有当组件是一个CDI Managed Bean时才被支持。进一步了解更多细节请参考15.5.15，“JavaEE 要求的上下文和依赖注入”。


# 上下文属性

servlet 可以通过名字将对象属性绑定到上下文。

同一个 Web 应用内的其他任何 servlet 都可以使用绑定到上下文的任意属性。

以下 ServletContext 接口中的方法允许访问此功能：

* setAttribute
* getAttribute
* getAttributeNames
* removeAttribute

### 分布式容器中的上下文属性

在 JVM 中创建的上下文属性是本地的，这可以防止从一个分布式容器的共享内存存储中获取 ServletContext 属性。

当需要在运行在分布式环境的Servlet 之间共享信息时，该信息应该被放到会话中（请看第7章，“会话”），或存储到数据库，或者设置到  Enterprise JavaBeans™ （企业级 JavaBean）组件。

# 资源

ServletContext 接口提供了直接访问 Web 应用中仅是静态内容层次结构的文件的方法，包括 HTML，GIF 和 JPEG 文件：

* getResource

* getResourceAsStream

getResource 和 getResourceAsStream 方法需要一个以 “/” 开头的String 作为参数，给定的资源路径是相对于上下文的根，或者相对于 web应用的 WEB-INF/lib 目录下的 JAR 文件中的 META-INF/resources 目录。

这两个方法首先根据请求的资源查找 web 应用上下文的根，然后查找所有 WEB-INF/lib 目录下的 JAR 文件。查找 WEB-INF/lib 目录中 JAR文件的顺序是不确定的。这种层次结构的文件可以存在于服务器的文件系统，Web 应用的归档文件，远程服务器，或在其他位置。

这两个方法不能用于获取动态内容。例如，在支持 [JavaServer Pages™规范](http://java.sun.com/products/jsp)的容器中，如 getResource("/index.jsp") 形式的方法调用将返回 JSP 源码而不是处理后的输出。

请看第9章，“分发请求”获取更多关于动态内容的信息。

可以使用 getResourcePaths(String path) 方法访问 Web 应用中的资源的完整列表。该方法的语义的全部细节可以从本规范的 API 文档中找到。


# 多主机和 Servlet 上下文

Web 服务器可以支持多个逻辑主机共享一个服务器 IP 地址。有时，这种能力被称为“虚拟主机”。

这种情况下，每一个逻辑主机必须有它自己的 servlet 上下文或一组 servlet 上下文。

servlet 上下文不会在虚拟主机之间共享。

ServletContext 接口的 getVirtualServerName 方法允许访问ServletContext 部署在的逻辑主机的配置名字。

该方法必须对所有部署在逻辑主机上的所有 servlet 上下文返回同一个名字。且该方法返回的名字必须是明确的、每个逻辑主机稳定的、和适合用于关联服务器配置信息和逻辑主机。


# 重载注意事项

尽管 Container Provider (容器供应商)不需要实现类的重加载模式以便易于开发，但是任何此类的实现必须确保所有 servlet 及它们使用的类（Servlet使用的系统类异常可能使用的是一个不同的 class loader）在一个单独的 class loader 范围内被加载。为了保证应用像开发人员预期的那样工作，该要求是必须的。

作为一个开发辅助，容器应支持到会话绑定到的监听器的完整通知语义以用于当 class 重加载时会话终结的监控。

之前几代的容器创建新的 class loader 来加载 servlet，且与用于加载在 servlet 上下文中使用的其他 servlet 或类的 class loader 是完全不同的。

这可能导致 servlet 上下文中的对象引用指向意想不到的类或对象，并引起意想不到的行为。

为了防止因创建新的 class loader 所引起的问题，该要求是必须的。

### 临时工作目录

每一个 servlet 上下文都需要一个临时的存储目录。

servlet 容器必须为每一个 servlet 上下文提供一个私有的临时目录，并将通过javax.servlet.context.tempdir 上下文属性使其可用，关联该属性的对象必须是 java.io.File 类型。

该要求公认为在多个 servlet 引擎实现中提供一个通用的便利。当 servlet 容器重启时，它不需要去保持临时目录中的内容，但必须确保一个 servlet 上下文的临时目录中的内容对运行在同一个 servlet 容器的其他 Web 应用的上下文不可见。

# 参考地址

https://download.oracle.com/otn-pub/jcp/servlet-3_1-fr-eval-spec/servlet-3_1-final.pdf

* any list
{:toc}