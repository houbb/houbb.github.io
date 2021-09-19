---
layout: post
title: Java Servlet3.1 规范-02-接口
date:  2021-09-09 14:49:58 +0800
categories: [Java]
tags: [web, servlet, servlet3, sh]
published: true
---

# Servlet 接口

Servlet 接口是 Java Servlet API 的核心抽象。

所有 Servlet 类必须直接或间接的实现该接口，或者更通常做法是通过继承一个实现了该接口的类从而复用许多共性功能。

目前有 GenericServlet 和 HttpServlet这两个类实现了 Servlet 接口。

大多数情况下，开发者只需要继承HttpServlet 去实现自己的 Servlet 即可。


# 请求处理方法

基础的 Servlet 接口定义了 service 方法用于处理客户端的请求。当有请求到达时，该方法由 servlet 容器路由到一个 servlet 实例来调用。

Web 应用的并发请求处理通常需要 Web 开发人员去设计适合多线程执行的Servlet，从而保证 service 方法能在一个特定时间点处理多线程并发执行。

（**译者注**： Servlet 默认是线程不安全的，需要开发人员处理多线程问题）

通常 Web 容器对于并发请求将使用同一个 servlet 处理，并且在不同的线程中并发执行 service 方法。

### 基于 HTTP 规范的请求处理方法

HttpServlet 抽象子类在基本的 Servlet 之上添加了些协议相关的方法，并且这些方法能根据 HTTP 请求类型自动的由 HttpServlet 中实现的 service 方法转发到相应的协议相关的处理方法上。

这些方法是：

* doGet 处理 HTTP GET 请求
* doPost 处理 HTTP POST 请求
* doPut 处理 HTTP PUT 请求
* doDelete 处理 HTTP DELETE 请求
* doHead 处理 HTTP HEAD 请求
* doOptions 处理 HTTP OPTIONS 请求
* doTrace 处理 HTTP TRACE 请求

一般的，开发基于 HTTP 的 servlet 时, Servlet 开发人员只需去实现 doGet 和 doPost 请求处理方法即可。

如果开发人员想使用其他处理方法，其使用方式跟之前的是类似的，即 HTTP 编程都是类似。

## 附加方法

doPut 和 doDelete 方法允许 Servlet 开发人员让支持 HTTP/1.1 的客户端使用这些功能。

HttpServlet 中的 doHead 方法可以认为是 doGet 方法的一个特殊形式，它仅返回由 doGet 方法产生的 header 信息。

doOptions 方法返回当前 servlet 支持的 HTTP 方法。doTrace 方法返回的响应包含TRACE请求的所有头信息。

## 有条件 GET 支持

HttpServlet 定义了用于支持有条件 GET 操作的 getLastModified 方法。

所谓的有条件 GET 操作是指客户端通过 GET 请求获取资源时，当资源自第一次获取那个时间点发生更改后才再次发生数据，否则将使用客户端缓存的数据。

在一些适当的场合，实现此方法可以更有效的利用网络资源，减少不必要的数据发送。


# 实例数量

通过注解描述的（[第8章 注解和可插拔性](../docs/Annotations and pluggability/8. Annotations and pluggability.md)）或者在 Web 应用程序的部署描述符（[第14章 部署描述符](../docs/Deployment Descriptor/14. Deployment Descriptor.md)）中描述的 servlet 声明，控制着 servlet 容器如何提供 servlet 实例。

对于未托管在分布式环境中（默认）的 servlet 而言，servlet 容器对于每一个 Servlet 声明必须且只能产生一个实例。

不过，如果 Servlet实现了 SingleThreadModel 接口，servlet 容器可以选择实例化多个实例以便处理高负荷请求或者串行化请求到一个特定实例。

如果 servlet 以分布式方式进行部署，容器可以为每个 Java Virtual Machine (JVM™) 的每个 Servlet 声明产生一个实例。但是，如果在分布式环境中 servlet 实现了 SingleThreadModel 接口，此时容器可以为每个容器的 JVM 实例化多个 Servlet 实例。

## 关于 Single Thread Model

SingleThreadModel 接口的作用是保证一个特定 servlet 实例的service 方法在一个时刻仅能被一个线程执行，一定要注意，此保证仅适用于每一个 servlet 实例，因此容器可以选择池化这些对象。

有些对象可以在同一时刻被多个 servlet 实例访问，如 HttpSession 实例，可以在一个特定的时间对多个 Servlet 可用，包括那些实现了SingleThreadModel 接口的 Servlet。

建议开发人员采取其他手段来解决这些问题,而不是实现这个接口,如避免使用实例变量或同步的代码块访问这些资源。SingleThreadModel 接口已经在本版本规范中弃用。

# Servlet 生命周期

`Servlet` 是按照一个严格定义的生命周期被管理，该生命周期规定了Servlet 如何被加载、实例化、初始化、处理客户端请求，以及何时结束服务。

该声明周期可以通过 javax.servlet.Servlet 接口中的 init、service 和 destroy 这些 API 来表示，所有 Servlet 必须直接或间接的实现 GenericServlet 或 HttpServlet 抽象类。

ps: 这里还是一图盛千言，纯文字看的太累。

### 加载和实例化

Servlet 容器负责加载和实例化 Servlet。加载和实例化可以发生在容器启动时，或者延迟初始化直到容器决定有请求需要处理时。

当 Servlet 引擎启动后，servlet 容器必须定位所需要的 Servlet 类。Servlet 容器使用普通的 Java 类加载设施加载 Servlet 类。可以从本地文件系统或远程文件系统或者其他网络服务加载。

加载完 Servlet 类后，容器就可以实例化它并使用了。

### 初始化

servlet 对象实例化后，容器必须初始化 servlet 之后才能处理客户端的请求。初始化的目的是以便 Servlet 能读取持久化配置数据，初始化一些代价高的资源（比如JDBC™ API 连接），或者执行一些一次性的动作。

容器通过调用 Servlet 实例的 init 方法完成初始化，init 方法定义在Servlet 接口中，并且提供一个唯一的 ServletConfig 接口实现的对象作为参数，该对象每个 Servlet 实例一个。

配置对象允许 Servlet 访问由 Web 应用配置信息提供的键-值对的初始化参数。

该配置对象也提供给Servlet 去访问一个 ServletContext 对象，ServletContext 描述了Servlet 的运行时环境。请参考第4章 “Servlet 上下文”获取ServletContext 接口的更多信息。

#### 初始化时的错误条件

在初始化阶段，servlet 实例可能抛出 UnavailableException 或ServletException 异常。

在这种情况下，servlet 不能放置到活动服务中，servlet 容器必须释放它。如果初始化没有成功，destroy 方法不应该被调用。

在实例初始化失败后容器可能再实例化和初始化一个新的实例。

此规则的例外是，当抛出的 UnavailableException 表示一个不可用的最小时间，容器在创建和初始化一个新的 servlet 实例之前必须等待一段时间。

### 使用工具时的注意事项

当一个工具加载并内省某个 Web 应用时触发的静态初始化，这种用法与调用 init 初始化方法是有区别的。

在 Servlet 的 init 方法没被调用，开发人员不应该假定其处于活动的容器环境内。

比如，当某个 Servlet 仅有静态方法被调用时，不应该与数据库或企业级 JavaBean（EJB）容器建立连接。

### 请求处理

servlet 完成初始化后，servlet 容器就可以使用它处理客户端请求了。客户端请求由 ServletRequest 类型的请求对象表示。

servlet 封装响应并返回给请求的客户端，该响应由 ServletResponse 类型的响应对象表示。

这两个对象是由容器通过参数传递到Servlet接口的service方法的。

在 HTTP 请求的场景下，容器提供的请求和响应对象具体类型分别是HttpServletRequest 和 HttpServletResponse。

需要注意的是，由 servlet 容器初始化的某个 servlet 实例在服务期间，可以在其生命周期中不处理任何请求。

#### 多线程问题

servlet 容器可以并发的发送多个请求到 servlet 的 service 方法。为了处理这些请求，Servlet 开发者必须为 service 方法的多线程并发处理做好充足的准备。

一个替代的方案是开发人员实现 SingleThreadModel 接口，由容器保证一个 service 方法在同一个时间点仅被一个请求线程调用，但是此方案是不推荐的。

servlet 容器可以通过串行化访问 servlet的请求，或者维护一个 servlet 实例池完成该需求。

如果 Web 应用中的 servlet 被标注为分布式的，容器应该为每一个分布式应用程序的 JVM 维护一个 Servlet 实例池。

对于那些没有实现 SingleThreadModel 接口的 servlet，但是它的service 方法（或者是那些 HttpServlet 中通过 service 方法分派的doGet、doPost 等分派方法）是通过 synchronized 关键词定义的，servlet 容器不能使用实例池方案，并且只能使用序列化请求进行处理。

强烈推荐开发人员不要去同步 service 方法（或者那些由 service 分派的方法），因为这将严重影响性能。

#### 请求处理时的异常

servlet 在处理一个请求时可能抛出 ServletException 或UnavailableException 异常。ServletException 表示在处理请求时出现了一些错误，容器应该采取适当的措施清理掉这个请求。

UnavailableException 表示 servlet 目前无法处理请求，或者临时性的或者永久性的。

如果 UnavailableException 表示的是一个永久性的不可用，servlet 容器必须从服务中移除这个 servlet，调用它的 destroy 方法，并释放servlet 实例。所有被容器拒绝的请求，都会返回一个 SC_NOT_FOUND (404) 响应。

如果 UnavailableException 表示的是一个临时性的不可用，容器可以选择在临时不可用的这段时间内路由任何请求到 Servlet。所以在这段时间内被容器拒绝的请求，都会返回一个 SC_SERVICE_UNAVAILABLE (503) 响应状态码，且同时会返回一个 Retry-After 头指示此 servlet 什么时候可用。容器可以选择忽略永久性和临时性不可用的区别，并把UnavailableException 视为永久性的，从而 servlet 抛出UnavailableException 后需要把它从服务中移除。


#### 异步处理

有时候，Filter及/或 Servlet 在生成响应之前必须等待一些资源或事件以便完成请求处理。比如，Servlet 在进行生成一个响应之前可能等待一个可用的 JDBC 连接，或者一个远程 web 服务的响应，或者一个 JMS 消息，或者一个应用程序事件。在 Servlet 中等待是一个低效的操作，因为这是阻塞操作，从而白白占用一个线程或其他一些受限资源。许多线程为了等待一个缓慢的资源比如数据库经常发生阻塞，可能引起线程饥饿，且降低整个 Web 容器的服务质量。

引入了异步处理请求的能力，使线程可以返回到容器，从而执行更多的任务。当开始异步处理请求时，另一个线程或回调可以或者产生响应，或者调用完成（complete）或请求分派（dispatch），这样，它可以在容器上下文使用 AsyncContext.dispatch 方法运行。一个典型的异步处理事件顺序是：

1. 请求被接收到，通过一系列如用于验证的等标准的 filter 之后被传递到 Servlet。
2. servlet 处理请求参数及（或）内容体从而确定请求的类型。
3. 该 servlet 发出请求去获取一些资源或数据，例如，发送一个远程web 服务请求或加入一个等待 JDBC 连接的队列。
4. servlet 不产生响应并返回。
5. 过了一段时间后，所请求的资源变为可用，此时处理线程继续处理事件，要么在同一个线程，要么通过 AsyncContext 分派到容器中的一个资源上。

Java 企业版的功能，如第15.2.2节，在“Web应用环境”和第15.3.1节，在“EJB调用的安全标识传播”，仅在初始化请求的线程执行，或者请求经过AsyncContext.dispatch 方法被分派到容器。Java 企业版的功能可能支持由 AsyncContext.start(Runnable) 方法使用其他线程直接操作响应对象。

第八章描述的 `@WebServlet` 和 `@WebFilter` 注解有一个属性——asyncSupported，boolean 类型默认值为 false。当 asyncSupported 设置为 true，应用通过执行 startAsync（见下文）可以启动一个单独的线程中进行异步处理，并把请求和响应的引用传递给这个线程，然后退出原始线程所在的容器。这意味着响应将遍历（相反的顺序）与进入时相同的过滤器（或过滤器链）。直到 AsyncContext 调用 complete（见下文）时响应才会被提交。如果异步任务在容器启动的分派之前执行，且调用了 startAsync 并返回给容器，此时应用需负责处理请求和响应对象的并发访问。

从一个 Servlet 分派时，把 asyncSupported=true 设置为 false 是允许的。这种情况下，当 servlet 的 service 方法不支持异步退出时，响应将被提交，且容器负责调用 AsyncContext 的 complete，以便所有感兴趣的 AsyncListener 得到触发。过滤器作为清理要完成的异步任务持有的资源的一种机制，也应该使用 AsyncListener.onComplete 触发的结果。

从一个同步 Servlet 分派到另一个异步 Servlet 是非法的。不过与该点不同的是当应用调用 startAsync 时将抛出 IllegalStateException。这将允许 servlet 只能作为同步的或异步的 Servlet。

应用在一个与初始请求所用的不同的线程中等待异步任务直到可以直接写响应，这个线程不知道任何过滤器。如果过滤器想处理新线程中的响应，那就必须在处理进入时的初始请求时包装响应，并且把包装的响应传递给链中的下一个过滤器，并最终交给 Servlet。因此，如果响应是包装的（可能被包装多次，每一个过滤器一次），并且应用处理请求并直接写响应，这将只写响应的包装对象，即任何输出的响应都会由响应的包装对象处理。当应用在一个单独的线程中读请求时，写内容到响应的包装对象，这其实是从请求的包装对象读取，并写到响应的包装对象，因此对包装对象操作的所有输入及（或）输出将继续存在。

如果应用选择这样做的话，它将可以使用 AsyncContext 从一个新线程发起到容器资源的分派请求。

这将允许在容器范围内使用像 JSP 这种内容生成技术。

除了注解属性外，我们还添加了如下方法/类：

* ServletRequest
  * public AsyncContext startAsync(ServletRequest req, ServletResponse res)。这个方法的作用是将请求转换为异步模式，并使用给定的请求及响应对象和 getAsyncTimeout 返回的超时时间初始化它的 AsyncContext。ServletRequest 和 ServletResponse 参数必须是与传递给 servlet 的 service 或 filter 的 doFilter方法相同的对象，或者是 ServletRequestWrapper 和ServletResponseWrapper 子类的包装对象。当应用退出 service 方法时，调用该方法必须确保响应没有被提交。当调用返回的AsyncContext 的 AsyncContext.complete 或 AsyncContext 超时并且没有监听器处理超时时，它将被提交。异步超时定时器直到请求和它关联的响应从容器返回时才启动。AsyncContext 可以被异步线程用来写响应，它也能用来通知没有关闭和提交的响应。

如果请求在不支持异步操作的servlet或filter范围中调用 startAsync，或者响应已经被提交或关闭，或者在同一个分派期间重复调用，这些是非法的。从调用 startAsync 返回的 AsyncContext 可以接着被用来进行进一步的异步处理。调用返回的 AsyncContext 的hasOriginalRequestResponse() 方法将返回 false，除非传过去的ServletRequest 和 ServletResponse 参数是最原始的那个或不是应用提供的包装器。

在请求设置为异步模式后，在入站调用期间添加的一些请求及（或）响应的包装器可能需要在异步操作期间一直保持，并且它们关联的资源可能也不会释放，出站方向调用的所有过滤器可以以此作为一个标志。
一个在入站调用期间的过滤器应用的 ServletRequestWrapper 可以被出站调用的过滤器释放，只有当给定的 ServletRequest 是由 AsyncContext 初始化的且通过调用 AsyncContext.getRequest() 返回的，不包括之前说的 ServletRequestWrapper。这规则同样适用于ServletResponseWrapper 实例。

  * public AsyncContext startAsync() 是一个简便方法，使用原始的请求和响应对象用于异步处理。请注意，如果它们在你想调用此方法之前被包装了，这个方法的使用者应该刷出（flush）响应，确保数据写到被包装的响应中没有丢失。
  * public AsyncContext getAsyncContext() – 返回由 startAsync 调用创建的或初始化的 AsyncContext。如果请求已经被设置为异步模式，调用 getAsyncContext 是非法的。
  * public boolean isAsyncSupported() – 如果请求支持异常处理则返回 true，否则返回 false。一旦请求传给了过滤器或 servlet 不支持异步处理（通过指定的注解或声明），异步支持将被禁用。
  * public boolean isAsyncStarted() – 如果请求的异步处理已经开始将返回 true，否则返回 false。如果这个请求自从被设置为异步模式后已经使用任意一个 AsyncContext.dispatch 方法分派，或者成功调用了 AsynContext.complete 方法，这个方法将返回false。
  * public DispatcherType getDispatcherType() – 返回请求的分派器（dispatcher）类型。容器使用请求的分派器类型来选择需要应用到请求的过滤器。只有匹配分派器类型和 url 模式（url pattern）的过滤器才会被应用。允许一个过滤器配置多个分派器类型，过滤器可以根据请求的不同分派器类型处理请求。请求的初始分派器类型定义为 DispatcherType.REQUEST 。使用RequestDispatcher.forward(ServletRequest, ServletResponse) 或 RequestDispatcher.include(ServletRequest, ServletResponse) 分派时，它们的请求的分派器类型分别是 DispatcherType.FORWARD 或 DispatcherType.INCLUDE ，当一个异步请求使用任意一个AsyncContext.dispatch 方法分派时该请求的分派器类型是DispatcherType.ASYNC。最后，由容器的错误处理机制分派到错误页面的分派器类型是 DispatcherType.ERROR 。
* AsyncContext – 该类表示在 ServletRequest 启动的异步操作执行上下文，AsyncContext 由之前描述的 ServletRequest.startAsync 创建并初始化。AsyncContext 的方法：
  * public ServletRequest getRequest() – 返回调用 startAsync用于初始化 AsyncContext 的请求对象。当在异步周期之前调用了complete 或任意一个 dispatch 方法，调用 getRequest 将抛出IllegalStateException。
  * public ServletResponse getResponse() –返回调用 startAsync 用于初始化 AsyncContext 的响应对象。当在异步周期之前调用了 complete 或任意一个 dispatch 方法，调用getResponse 将抛出 IllegalStateException。
  * public void setTimeout(long timeoutMilliseconds) – 设置异步处理的超时时间，以毫秒为单位。该方法调用将覆盖容器设置的超时时间。如果没有调用 setTimeout 设置超时时间，将使用容器默认的超时时间。一个小于等于0的数表示异步操作将永不超时。当调用任意一个 ServletRequest.startAsync 方法时，一旦容器启动的分派返回到容器，超时时间将应用到 AsyncContext。当在异步周期开始时容器启动的分派已经返回到容器后，再设置超时时间是非法的，这将抛出一个 IllegalStateException 异常。
  * public long getTimeout() – 获取 AsyncContext 关联的超时时间的毫秒值。该方法返回容器默认的超时时间，或最近一次调用setTimeout 设置超时时间。
  * public void addListener(AsyncListener listener, ServletRequest req, ServletResponse res) – 注册一个用于接收的 onTimeout, onError, onComplete 或 onStartAsync 通知的监听器。前三个是与最近通过调用任意 ServletRequest.startAsync 方法启动的异步周期相关联的。onStartAsync 是与通过任意 ServletRequest.startAsync 启动的一个新的异步周期相关联的。异步监听器将以它们添加到请求时的顺序得到通知。当 AsyncListener 得到通知，传入到该方法的请求响应对象与 AsyncEvent.getSuppliedRequest() 和AsyncEvent.getSuppliedResponse() 是完全相同的。不应该对这些对象进行读取或写入，因为自从注册了 AsyncListener 后可能发生了额外的包装，不过可以被用来按顺序释放与它们关联的资源。容器启动的分派在异步周期启动后返回到容器后，或者在一个新的异步周期启动之前，调用该方法是非法的，将抛出IllegalStateException。
  * `public <T extends AsyncListener> createListener(Class<T> clazz)`– 实例化指定的 AsyncListener 类。返回的AsyncListener 实例在使用下文描述的 addListener 方法注册到AsyncContext 之前可能需要进一步的自定义。给定的AsyncListener 类必须定义一个用于实例化的空参构造器，该方法支持适用于 AsyncListener 的所有注解。
  * public void addListener(AsyncListener) – 注册给定的监听器用于接收 onTimeout, onError, onComplete 或 onStartAsync通知。前三个是与最近通过调用任意 ServletRequest.startAsync方法启动的异步周期相关联的。onStartAsync 是与通过任意ServletRequest.startAsync 启动的一个新的异步周期相关联的。异步监听器将以它们添加到请求时的顺序得到通知。当AsyncListener 接收到通知，如果在请求时调用 startAsync(req, res) 或 startAsync()，从 AsyncEvent 会得到同样的请求和响应对象。请求和响应对象可以是或者不是被包装的。异步监听器将以它们添加到请求时的顺序得到通知。容器启动的分派在异步周期启动后返回到容器后，或者在一个新的异步周期启动之前，调用该方法是非法的，将抛出 IllegalStateException。
  * public void dispatch(String path) – 将用于初始化AsyncContext 的请求和响应分派到指定的路径的资源。该路径以相对于初始化 AsyncContext 的 ServletContext 进行解析。与请求查询方法相关的所有路径，必须反映出分派的目标，同时原始请求的URI，上下文，路径信息和查询字符串都可以从请求属性中获取，请求属性定义在9.7.2章节，“分派的请求参数”。这些属性必须反映最原始的路径元素，即使在多次分派之后。
  * public void dispatch() – 一个简便方法，使用初始化AsyncContext 时的请求和响应进行分派，如下所示。 如果使用startAsync(ServletRequest, ServletResponse) 初始化AsyncContext，且传入的请求是 HttpServletRequest 的一个实例，则使用 HttpServletRequest.getRequestURI() 返回的 URI 进行分派。否则分派的是容器最后分派的请求 URI。下面的代码示例2-1，代码示例2-2和代码示例2-3演示了不同情况下分派的目标 URI是什么。

CODE EXAMPLE 2-1

```java
// REQUEST to /url/A
AsyncContext ac = request.startAsync();
...
ac.dispatch(); // ASYNC dispatch to /url/A
```


CODE EXAMPLE 2-2

```java
// REQUEST to /url/A
// FORWARD to /url/B
request.getRequestDispatcher(“/url/B”).forward(request,
response);
// Start async operation from within the target of the FORWARD
AsyncContext ac = request.startAsync();
ac.dispatch(); // ASYNC dispatch to /url/A
```

CODE EXAMPLE 2-3

```java
// REQUEST to /url/A
// FORWARD to /url/B
request.getRequestDispatcher(“/url/B”).forward(request,
response);
// Start async operation from within the target of the FORWARD
AsyncContext ac = request.startAsync(request, response);
ac.dispatch(); // ASYNC dispatch to /url/B
```

  * public void dispatch(ServletContext context, String path) -将用于初始化 AsyncContext 的请求和响应分派到指定ServletContext的指定路径的资源。
  * 上面定义了 dispatch 方法的全部3个变体，调用这些方法且将请求和响应对象传入到容器的一个托管线程后将立即返回，在托管线程中异步操作将被执行。请求的分派器类型设置为异步（ASYNC）。不同于RequestDispatcher.forward(ServletRequest, ServletResponse) 分派，响应的缓冲区和头信息将不会重置，即使响应已经被提交分派也是合法的。控制委托给分派目标的请求和响应，除非调用了ServletRequest.startAsync() 或 ServletRequest.startAsync(ServletRequest, ServletResponse)，否则响应将在分派目标执行完成时被关闭。在调用了 startAsync 方法的容器启动的分派没有返回到容器之前任何dispatch方法的调用将没有任何作用。AsyncListener.onComplete(AsyncEvent), AsyncListener.onTimeout(AsyncEvent) 和AsyncListener.onError(AsyncEvent) 的调用将被延迟到容器启动的分派返回到容器之后。通过调用 ServletRequest.startAsync.启动的每个异步周期至多只有一个异步分派操作。相同的异步周期内任何试图执行其他的异步分派操作是非法的并将导致抛出IllegalStateException。如果后来在已分派的请求上调用startAsync，那么所有的 dispatch 方法调用将和之上具有相同的限制。
  * 任何在执行 dispatch 方法期间可能抛出的错误或异常必须由容器抓住和处理，如下所示：
    * i. 调用所有由AsyncContext创建的并注册到ServletRequest的AsyncListener 实例的AsyncListener.onError(AsyncEvent) 方法， 可以通过AsyncEvent.getThrowable()获取到捕获的Throwable。
    * ii. 如果没有监听器调用 AsyncContext.complete 或任何AsyncContext.dispatch 方法，然后执行一个状态码为HttpServletResponse.SC_INTERNAL_SERVER_ERROR的出错分派，并且可以通过 RequestDispatcher.ERROR_EXCEPTION 请求属性获取 Throwable 值。
    * iii. 如果没有找到匹配的错误页面，或错误页面没有调用AsyncContext.complete() 或任何 AsyncContext.dispatch 方法，则容器必须调用 AsyncContext.complete。
   * public boolean hasOriginalRequestAndResponse() – 该方法检查AsyncContext 是否以原始的请求和响应对象调用ServletRequest.startAsync()完成初始化的，或者是否通过调用ServletRequest.startAsync(ServletRequest, ServletResponse)完成初始化的，且传入的ServletRequest 和ServletResponse 参数都不是应用提供的包装器，这样的话将返回true。如果AsyncContext 使用包装的请求及（或）响应对象调用ServletRequest.startAsync(ServletRequest, ServletResponse)完成初始化，那么将返回false。在请求处于异步模式后，该信息可以被出站方向调用的过滤器使用，用于决定是否在入站调用时添加的请求及（或）响应包装器需要在异步操作期间被维持或者被释放。
   * public void start(Runnable r) – 该方法导致容器分派一个线程，该线程可能来自托管的线程池，用于运行指定的 Runnable 对象。容器可能传播相应的上下文信息到该Runnable 对象。
   * public void complete() – 如果调用了 request.startAsync，则必须调用该方法以完成异步处理并提交和关闭响应。如果请求分派到一个不支持异步操作的 Servlet，或者由 AsyncContext.dispatch调用的目标 servlet 之后没有调用 startAsync，则 complete 方法会由容器调用。这种情况下，容器负责当 servlet 的 service 方法一退出就调用 complete()。 如果 startAsync 没有被调用则必须抛出IllegalStateException。在调用 ServletRequest.startAsync() 或 ServletRequest.startAsync(ServletRequest, ServletResponse) 之后且在调用任意 dispatch 方法之前的任意时刻调用 complete() 是合法的。在调用了 startAsync 方法的容器启动的分派没有返回到容器之前该方法的调用将没有任何作用。AsyncListener.onComplete(AsyncEvent) 的调用将被延迟到容器启动的分派返回到容器之后。
* ServletRequestWrapper
  * public boolean isWrapperFor(ServletRequest req)- 检查该包装器是否递归的包装了给定的 ServletRequest，如果是则返回 true，否则返回 false。
* ServletResponseWrapper
  * public boolean isWrapperFor(ServletResponse res)- 检查该包装器是否递归的包装了给定的 ServletResponse，如果是则返回 true，否则返回 false。
* AsyncListener
  * public void onComplete(AsyncEvent event) – 用于通知监听器在Servlet 上启动的异步操作完成了。
  * public void onError(AsyncEvent event) – 用于通知监听器异步操作未能完成。
  * public void onStartAsync(AsyncEvent event) – 用于通知监听器正在通过调用一个 ServletRequest.startAsync 方法启动一个新的异步周期。正在被重新启动的异步操作对应的 AsyncContext 可以通过调用给定的event 上调用 AsyncEvent.getAsyncContext 获取。
* 在异步操作超时的情况下，容器必须按照如下步骤运行：
  * 当异步操作启动后调用注册到 ServletRequest 的所有 AsyncListener 实例的 AsyncListener.onTimeout 方法。
  * 如果没有监听器调用 AsyncContext.complete() 或任何AsyncContext.dispatch 方法，执行一个状态码为HttpServletResponse.SC_INTERNAL_SERVER_ERROR 出错分派。
  * 如果没有找到匹配的错误页面，或者错误页面没有调用AsyncContext.complete() 或任何AsyncContext.dispatch 方法，则容器必须调用AsyncContext.complete()。
* 如果在AsyncListener中调用方法抛出异常，将记录下来 且将不影响任何其他AsyncListener的调用。
* 默认情况下是不支持 JSP 中的异步处理，因为它是用于内容生成且异步处理可能在内容生成之前已经完成。这取决于容器如何处理这种情况。一旦完成了所有的异步活动，使用 AsyncContext.dispatch 分派到的 JSP 页面可以用来生成内容。
* 下面所示的图2-1描述了各种异步操作的状态转换。

FIGURE 2-1 State transition diagram for asynchronous operations

![在这里插入图片描述](https://img-blog.csdnimg.cn/deba3efe5bfa46c2a118a4f98ca2fcc6.png)

#### 线程安全

除了startAsync 和 complete 方法，请求和响应对象的实现都不保证线程安全。这意味着它们应该仅在请求处理线程范围内使用或应用确保线程安全的访问请求和响应对象。

如果应用使用容器管理对象创建一个线程，例如请求或响应对象，这些对象必须在其生命周期内被访问，就像定义在3.12节的“请求对象的生命周期”和5.7节的“响应对象的生产周期”。请注意，除了 startAsync 和complete 方法，请求和响应对象不是线程安全的。如果这些对象需要多线程访问，需要同步这些访问或通过包装器添加线程安全语义，比如，同步化调用访问请求属性的方法，或者在线程内为响应对象使用一个局部输出流。

#### 升级处理

在HTTP/1.1，Upgrade 通用头允许客户端指定其支持和希望使用的其他通信协议。

如果服务器找到合适的切换协议，那么新的协议将在之后的通信中使用。Servle t容器提供了 HTTP 升级机制。

不过，Servlet 容器本身不知道任何升级协议。协议处理封装在 HttpUpgradeHandler 协议处理器。

在容器和 HttpUpgradeHandler 协议处理器之间通过字节流进行数据读取或写入。

当收到一个升级请求，servlet 可以调用 HttpServletRequest.upgrade方法启动升级处理。该方法实例化给定的 HttpUpgradeHandler 类，返回的 HttpUpgradeHandler 实例可以被进一步的定制。应用准备和发送一个合适的响应到客户端。退出 servlet service 方法之后，servlet 容器完成所有过滤器的处理并标记连接已交给 HttpUpgradeHandler 协议处理器处理。然后调用 HttpUpgradeHandler 协议处理器的 init 方法，传入一个 WebConnection 以允许 HttpUpgradeHandler 协议处理器访问数据流。

Servlet 过滤器仅处理初始的 HTTP 请求和响应，然后它们将不会再参与到后续的通信中。换句话说，一旦请求被升级，它们将不会被调用。

HttpUpgradeHandler 可以使用非阻塞 IO（non blocking IO）消费和生产消息。

当处理 HTTP 升级时，开发人员负责线程安全的访问 ServletInputStream 和 ServletOutputStream。

当升级处理已经完成，将调用 HttpUpgradeHandler.destroy 方法

### 服务的终止

servlet 容器没必要保持装载的 servlet 持续任何特定的一段时间。一个 servlet 实例可能会在 servlet 容器内保持活跃（active）持续一段时间（以毫秒为单位），servlet容器的寿命可能是几天，几个月，或几年，或者是任何之间的时间。

当 servlet 容器确定 servlet 应该从服务中移除时，将调用 Servlet 接口的 destroy 方法以允许 servlet 释放它使用的任何资源和保存任何持久化的状态。例如，当想要节省内存资源或它被关闭时，容器可以做这个。

在 servlet 容器调用 destroy 方法之前，它必须让当前正在执行service 方法的任何线程完成执行，或者超过了服务器定义的时间限制。

一旦调用了 servlet 实例的 destroy 方法，容器无法再路由其他请求到该 servlet 实例了。

如果容器需要再次使用该 servlet，它必须用该servlet 类的一个新的实例。在 destroy 方法完成后，servlet 容器必须释放 servlet 实例以便被垃圾回收。

# 参考地址

[SUMMARY.md](https://github.com/waylau/servlet-3.1-specification/blob/master/SUMMARY.md)

* any list
{:toc}