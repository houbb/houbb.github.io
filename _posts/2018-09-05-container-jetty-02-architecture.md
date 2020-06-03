---
layout: post
title:  jetty architecture jetty 架构介绍
date:  2018-09-05 15:48:38 +0800
categories: [Container]
tags: [jetty, servlet, apache, container, sh]
published: true
---

# 概述

Jetty在设计各个组件类时，都遵守大量的规范，这样整个Jetty源码是高度规范的

jetty的口号“Don't deploy your application in Jetty, deploy Jetty in your application.”

## 具体规范

骨架抽象类：为每个组件接口实现一个基础的骨架类，将一些公用的操作抽象到上层，复用代码（如AbstractHandler、AbstractConnector）

模板方法：对于骨架抽象类中未知的实现，但是需要调用的操作，使用模板方法，让子类自行实现（如AbstractLifeCycle，将doStart、doStop具体实现由子类可重写；ScopedHandler，将doScope、doHandle交由子类实现）

生命周期（LifeCycle）：Jetty中的大部分组件都具有声明周期，拥有启动、停止、状态机的实现（如Handler、Server、Connector都具有生命周期）

容器化（Container）：部分组件具有容器特性，可以将子对象加入到自身容器里面，这样可以子对象可以实现统一的生命周期管理（如Server、ServletHandler）

# 架构设计

Jetty 作为高性能 Web 服务器，它的架构相比于 Tomcat 要简单很多，组件抽象更简洁，接下来我们就来看下

![架构设计](https://default-1251260339.cos.ap-chengdu.myqcloud.com/jetty-arch-1)

上图中，绿色部分是Jetty开放给开发者使用的；浅橙色表示JDK或Servlet规范定义的（或开发者实现的），不属于Jetty自身实现；

蓝色部分表示Jetty内部实现的一些组件，不对外暴露

上图基本展示了数据交互的整体流向，我们下面从组件的生命周期来分析这些操作的交互

# 官方案例

## 源码地址

[jetty.project](https://github.com/eclipse/jetty.project)

## 示例

```java
package org.eclipse.jetty.embedded;

import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.handler.DefaultHandler;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.servlet.ServletContextHandler;

public class ExampleServer
{
    public static Server createServer(int port)
    {
        Server server = new Server();

        ServerConnector connector = new ServerConnector(server);
        connector.setPort(port);
        server.setConnectors(new Connector[]{connector});

        ServletContextHandler context = new ServletContextHandler();
        context.setContextPath("/");
        context.addServlet(HelloServlet.class, "/hello");
        context.addServlet(AsyncEchoServlet.class, "/echo/*");

        server.setHandler(new HandlerList(context, new DefaultHandler()));

        return server;
    }

    public static void main(String[] args) throws Exception
    {
        int port = ExampleUtil.getPort(args, "jetty.http.port", 8080);
        Server server = createServer(port);
        server.start();
        server.join();
    }
}
```

开发者首先创建一个Server，然后创建ServerConnector作为通信层，并关联到Server，再创建ServletContextHandler作为Handler来处理业务，可以看到这里加了2个Servlet，然后把这2个Servlet放到一个集合传给Server，最后调用Server.start启动服务器

可以看到所有的组件最终都被关联到了Server，其实Server就是一个大容器，将容器内的所有具有生命周期的组件全部逐层启动（start），另一些不具有生命周期的组件仍然可以把Server看成一个IOC容器，后续可以直接获取到实例对象

从架构图中可以看到Server触发Connector、Handler组件启动，而Connector又会触发SelectorManager、ManagedSelector启动，这样其实是逐级启动，Server是一个大容器，而Handler也可能是一个大容器（例如WebAppContext，感兴趣的读者可以跳到后续文章），这个启动过程其实是LifeCycle组件定义的，如果这里不明白，可以看下后续LifeCycle的文章

## 连接

当client与Jetty服务器建立连接时，连接会直接打到SelectorManager提供的ServerSocketChannel，accept后，拿到这个client对应的SocketChannel后，会选择一个ManagedSelector来执行IO事件检测，并创建好这条连接对应的EndPoint以及Connection

## 请求

当client向刚才建立的连接中写入请求数据时，ManagedSelector对应的事件检测循环（感兴趣的读者可以跳到后续Connector组件阅读）会探测到读事件，会触发SelectChannelEndPoint触发读回调，从而调用到HttpConnection.onFillable，onFillable里面借助于ByteBufferPool、HttpParser完成数据读取及解析，将解析后的元数据放入Request，直接触发HttpChannel.handle，这会打到Server.handle方法，Server会找到之前关联到自身的Handler，执行这个Handler的handle方法，这样就开启了Handler执行链（感兴趣的读者可以提前跳到Handler组件阅读），层层调用，最后调用到应用层Filter、Servlet，完成业务操作

## 响应

当应用层完成业务操作后，调用Response.getWriter或Response.getOutputStream，最终会调用到HttpOutput.write方法，触发数据回写，这时调用到HttpChannel.write，这里会触发HttpConnection.send，而HttpConnection会利用HttpGenerator生成响应报文，然后触发SelectChannelEndPoint向SocketChannel刷数据，这样就完成了响应（当然真实的细节还有很多，例如一次刷不完，下一次哪里刷？感兴趣的读者可以跳到后续Connection阅读）

# 基本架构

Jetty相较于Tomcat更加轻便，虽然架构更加简单，但是看起来可并不轻松。

Spring是设计初衷是用来管理应用中的实例Bean，因而是基于Bean的架构；

Jetty则更倾向于流程和组件的管理，采用了基于handler的架构。

handler的嵌套和链式结构，LifeCycle和doStart、doHandler模式无不印证了这点。

本文主要从基本架构、LifeCycle结构、Handler体系结构、Jetty启动过程、接受并处理请求的流程和与Tomcat的比较来简要介绍下Jetty，细节部分后面的博文会有分析。

## Jetty 的基本架构

前面的博文谈及应用服务期的架构已经说过了几个基本模块的概念，connection、Threadpool等~

拷贝了许令波画的图(文中关于基本架构的描述挺详细的，参考了其目录结构哈~不过对于有些知识点有自己的看法，因此总结该文)：

![核心组件](http://static.oschina.net/uploads/img/201302/27100023_bjbx.jpg)

该博文中谈到“Jetty 中还有一些可有可无的组件，我们可以在它上做扩展。如 JMX，我们可以定义一些 Mbean 把它加到 Server 中，当 Server 启动的时候，这些 Bean 就会一起工作。”

我的理解是，Jetty中的JMX是提供给server的Container，使得注册到server的Handler同时注册到JMX上，以便于运行时的监控和管理，应该是先有server再有JMX，而不是反过来的。

## LifeCycle 体系结构

Jetty是基于Handler的架构模式，对于组件化的概念很容易理解，那Jetty又是如何管理流程和Handler的生命周期的呢，这就需要从下节的Handler的体系架构来解释，本节主要分析LifeCycle

![LifeCycle](http://static.oschina.net/uploads/space/2013/0227/103117_nvuQ_947581.png)

上图包含四层涵义：

1、每个Handler都是一个LifeCycle

2、AggregateLifeCycle 正如起名，聚集在一起的生命周期。Jetty把Handler生命周期所关联的一些subHandler注册在Hahdler上，eg:server->deployManager正是如此。

3、监听器的概念就是一个观察者模式的应用，触发于Handler的doStart,doStop,doFail等事件。

4、Jetty的LifeCycle结构主要影响Jetty的初始化，而Handler结构影响Jetty的处理功能。

## Handler 体系结构

既然Jetty是基于Handler的架构，那么Handler体系关乎着Jetty的方方面面：

![体系结构](http://static.oschina.net/uploads/space/2013/0227/112110_2H4v_947581.png)

上图有几层涵义：

1、红色的server即Jetty的核心Handler，它依赖的几个类虽然不是Handler，也在图中标出以方便理解，server需要Deploy部署，需要Connector，自然需要inner Handler，这里的红色的虚线是默认的依赖关系，嵌入式的Jetty或自定义情况下是可以变的，比如换成ResourceHandler,WebAppContext等~

2、AbatractHandlerContainer提供对嵌套Handler获取Childs的方法支持，因此位于很顶层。

3、ContextHandlerCollection不同于普通的HandlerCollection的区别在于，提供了对于Context的支持，即依据生产的app建立app与name的映射关系并对于url请求依据该映射关系分发到指定的app中。

4、HandlerWrapper仅仅提供了简单的对于Wapper的handler等操作，其实handler操作并不是主要的，Jetty中主要是用它来创建Handler的嵌套结构，就如ScopedHander一样，而handler操作大多数时候无用。

5、ScopedHandler这个真是折腾我好久，这样设计的意图着实不好理解，后面有专题解释，为理解本文，你可以将实现了继承了该类的Handler理解成已经是一个完整的嵌套Handler即可。

6、ContextHandler从图中可以看到，由DeployManager生产，并和ServletHandler等构成了嵌套Handler。ContextHandler的本质可理解为ServletContext,取到ServletContext,由于嵌套Handler的构造继而会调用ServletHandler等初始化和相关操作，最后走到web应用中处理业务代码。其实这个嵌套关系是可以修改的，比如应用中用不到sessionHandler，完全可以将其删除掉，但问题在与这种关系写在了代码中，为什么就不能留在配置文件中呢？也许配置文件也可以，没有验证过。

## Jetty 的启动过程

![jetty 的启动过程](http://static.oschina.net/uploads/space/2013/0227/143356_Pl7d_947581.png)

实际流程比较复杂，上面的时序图是个简化版本。启动的时序图有几点需要注意：

1、红线部分的第一次其实并没有handler，因为没有生产webappcontext，第二次再次调用start的时候才真的运作

2、蓝线部分描述的就是app的生产到contextHandler的生产的过程，后面的contextHandler的初始化是由于deployManager注册了事件监听器触发的。

3、最后打开Http连接，监听请求的到来

## 接受请求

由于Jetty默认采用NIO的方式接受请求，本文基于NIO的方式简单介绍下实现原理，因为NIO内容比较多，会在下面的文章中给出总结。

![接受请求](http://static.oschina.net/uploads/space/2013/0227/151331_6t8g_947581.png)

## 处理请求

主要介绍jetty接收到请求后如何生产并解析Request，Response等属性并最终走到handler方法体内。

![处理请求](http://static.oschina.net/uploads/space/2013/0227/161034_TLSC_947581.png)

这里面涉及到的connection有多个,SelectorChannelConnector、SelectorChannelEndPoint、AsyncHttpConnection,功能各不相同，下面NIO章节会详细总结。

# Jetty 与 Tomcat 的区别

由于没有研究过Tomcat，所以区别不好说，这里暂时就网上的一些言论和自己所了解到的一些总结下(摘自于许令波)。

## 架构层面

Jetty 的架构从前面的分析可知，它的所有组件都是基于 Handler 来实现，当然它也支持 JMX。

但是主要的功能扩展都可以用 Handler 来实现。

可以说 Jetty 是面向 Handler 的架构，就像 Spring 是面向 Bean 的架构，iBATIS 是面向 statement 一样，而 Tomcat 是以多级容器构建起来的，它们的架构设计必然都有一个“元神”，所有以这个“元神“构建的其它组件都是肉身。

从设计模板角度来看 Handler 的设计实际上就是一个责任链模式，接口类 HandlerCollection 可以帮助开发者构建一个链，而另一个接口类 ScopeHandler 可以帮助你控制这个链的访问顺序。另外一个用到的设计模板就是观察者模式，用这个设计模式控制了整个 Jetty 的生命周期，只要继承了 LifeCycle 接口，你的对象就可以交给 Jetty 来统一管理了。所以扩展 Jetty 非常简单，也很容易让人理解，整体架构上的简单也带来了无比的好处，Jetty 可以很容易被扩展和裁剪。

相比之下，Tomcat 要臃肿很多，Tomcat 的整体设计上很复杂，前面说了 Tomcat 的核心是它的容器的设计，从 Server 到 Service 再到 engine 等 container 容器。作为一个应用服务器这样设计无口厚非，容器的分层设计也是为了更好的扩展，这是这种扩展的方式是将应用服务器的内部结构暴露给外部使用者，使得如果想扩展 Tomcat，开发人员必须要首先了解 Tomcat 的整体设计结构，然后才能知道如何按照它的规范来做扩展。这样无形就增加了对 Tomcat 的学习成本。

不仅仅是容器，实际上 Tomcat 也有基于责任链的设计方式，像串联 Pipeline 的 Vavle 设计也是与 Jetty 的 Handler 类似的方式。

要自己实现一个 Vavle 与写一个 Handler 的难度不相上下。

表面上看，Tomcat 的功能要比 Jetty 强大，因为 Tomcat 已经帮你做了很多工作了，而 Jetty 只告诉，你能怎么做，如何做，有你去实现。

## 性能对比

单纯比较 Tomcat 与 Jetty 的性能意义不是很大，只能说在某种使用场景下，它表现的各有差异。因为它们面向的使用场景不尽相同。

从架构上来看 Tomcat 在处理少数非常繁忙的连接上更有优势，也就是说连接的生命周期如果短的话，Tomcat 的总体性能更高。

而 Jetty 刚好相反，Jetty 可以同时处理大量连接而且可以长时间保持这些连接。

例如像一些 web 聊天应用非常适合用 Jetty 做服务器，像淘宝的 web 旺旺就是用 Jetty 作为 Servlet 引擎。

## 按需加载

另外由于 Jetty 的架构非常简单，作为服务器它可以按需加载组件，这样不需要的组件可以去掉，这样无形可以减少服务器本身的内存开销，处理一次请求也是可以减少产生的临时对象，这样性能也会提高。

另外 Jetty 默认使用的是 NIO 技术在处理 I/O 请求上更占优势，Tomcat 默认使用的是 BIO，在处理静态资源时，Tomcat 的性能不如 Jetty。

# jetty 启动流程

## 启动方式

- 启动 jetty 

```
java -jar start.jar。
```

运行jetty `java -jar start.jar` 等效于 `java -jar start.jar etc/jetty.xml[默认的jetty配置文件]`

- 参数指定

启动jetty若需要的更多参数，可以统一通过 start.ini 文件来配置

```ini
#==========================================================
# Jetty start.ini example
#-----------------------------------------------------------
OPTIONS=Server  #指定构建过程中这个目录下面的所有jar都需要添加
etc/jetty.xml   #它会添加到启动start.jar命令的后头
etc/jetty-http.xml
```

在start.ini中同时可以指定JVM的参数,只是必须添加 --exec

```ini
#===========================================================
# Jetty start.jar arguments
#-----------------------------------------------------------
--exec
-Xmx512m
-XX:OnOutOfMemoryError='kill -3 %p'
-Dcom.sun.management.jmxremote
OPTIONS=Server,jmx,resources
etc/jetty-jmx.xml
etc/jetty.xml
etc/jetty-ssl.xml
```
 
这么做是因为这里添加的 JVM 参数并没有影响 start.jar 的启动，而是另起一个新的JVM，会加上这些参数来运行

## Jetty的启动start.jar分析

- 核心代码

```java
 // execute Jetty in another JVM
if (args.isExec()){
    //获取参数
    CommandLineBuilder cmd = args.getMainArgs(true);
    ...
    ProcessBuilder pbuilder = new ProcessBuilder(cmd.getArgs());
    StartLog.endStartLog();
    final Process process = pbuilder.start();
    ...
    process.waitFor();
    System.exit(0); // exit JVM when child process ends.
    return;
}
```

提取参数的过程中，对于非JPMS,会在最后添加

```java
cmd.addRawArg("-cp");
cmd.addRawArg(classpath.toString());
cmd.addRawArg(getMainClassname());    
```

可以追踪 MainClassname 得到

```java
private static final String MAIN_CLASS = "org.eclipse.jetty.xml.XmlConfiguration";
```

后续新建一个进程，真正的去运行目的程序

```java
pid = forkAndExec(launchMechanism.ordinal() + 1, //获取系统类型
                          helperpath, //对于java来说就是获取 java 命令地址
                          prog,
                          argBlock, argc,
                          envBlock, envc,
                          dir,
                          fds,
                          redirectErrorStream);
```

## XmlConfiguration启动

主要就是加载所有的xml文件，然后运行实现了LifeCycle接口的方法

```java
List<Object> objects = new ArrayList<>(args.length);
for (int i = 0; i < args.length; i++)
{
    if (!args[i].toLowerCase(Locale.ENGLISH).endsWith(".properties") && (args[i].indexOf('=')<0))
    {
        XmlConfiguration configuration = new XmlConfiguration(Resource.newResource(args[i]).getURI().toURL());
        if (last != null)
            configuration.getIdMap().putAll(last.getIdMap());
        if (properties.size() > 0)
        {
            Map<String, String> props = new HashMap<>();
            for (Object key : properties.keySet())
            {
                props.put(key.toString(),String.valueOf(properties.get(key)));
            }
            configuration.getProperties().putAll(props);
        }

        Object obj = configuration.configure();
        if (obj!=null && !objects.contains(obj))
            objects.add(obj);
        last = configuration;
    }
}

// For all objects created by XmlConfigurations, start them if they are lifecycles.
for (Object obj : objects)
{
    if (obj instanceof LifeCycle)
    {
        LifeCycle lc = (LifeCycle)obj;
        if (!lc.isRunning())
            lc.start(); //运行
    }
}
```

对应着jetty.xml中的配置，他就是Server的start方法

## jetty.xml文件

它是默认的jetty配置文件，主要包括：

- 服务器的类和全局选项

- 连接池（最大最小线程数）

- 连接器（端口，超时时间，缓冲区，协议等）

- 处理器（handler structure,可用默认的处理器或者上下文处理搜集器contextHandlerCollections）

- 发布管理器（用来扫描要发布的webapp和上下文）

- 登录服务（做权限检查）

- 请求日志

jetty支持多配置文件，每一个配置文件中通过指定要初始化的服务器实例，ID来标识，每个ID都会在同一个JVM中创建一个新的服务，如果在多个配置文件中用同一个ID，这些所有的配置都会用到同一个服务上

- 配置文件一般样式

```xml
<?xml version="1.0"?>
<!DOCTYPE Configure PUBLIC "-//Jetty//Configure//EN" "http://www.eclipse.org/jetty/configure.dtd">

//<configure> 根元素，指定以下配置是给那个类，一般在jetty.xml中server,或者jetty-web.xml中的WebAppContext
<Configure id="foo" class="com.acme.Foo">

//<set> setter方法调用的标识。name属性用来标识setter的方法名，如果这个方法没有找到，就把name中值当做字段来使用。如果有属性class表明这个set方法是静态方法
  <Set name="name">demo</Set>
  <Set name="nested">
  
  //<new>初始化对象，class决定new对象的类型，需要写全路径类名，没有用<arg>则调用默认的构造函数
    <New id="bar" class="com.acme.Bar
  
    //<arg> 作为构造函数或者一个方法的参数，用于<call>和<new>
      <Arg>true</Arg>
      <Set name="wibble">10</Set>
      <Set name="wobble">xyz</Set>
      <Set name="parent"><Ref id="foo"/></Set>
  
      //<call>调用对象的某个方法，name属性表明确确调用的方法的名字
      <Call name="init">
         <Arg>false</Arg>
      </Call>
    </New>
  </Set>

//<ref>引用之前已经生成对象的id
  <Ref id="bar">
    <Set name="wibble">20</Set>
  
    //<get>调用当前对象的get方法，同set
    <Get name="parent">
      <Set name="name">demo2</Set>
    </Get>
  </Ref>
</Configure>
```

等价于 java 代码

```java
com.acme.Foo foo = new com.acme.Foo();
foo.setName("demo");

com.acme.Bar bar = new com.acme.Bar(true);
bar.setWibble(10);
bar.setWobble("xyz");
bar.setParent(foo);
bar.init(false);

foo.setNested(bar);

bar.setWibble(20);
bar.getParent().setName("demo2");
```

# web项目中的一般配置

web服务指定的服务类一般为 org.eclipse.jetty.server.Server，然后构建对应的实例

ThreadPool。

Connector。

Handler。

这也是jetty整个架构的体现,Connector用来接收连接，Handler用来处理request和response

## QueuedThreadPool

jetty的线程池默认使用的就是 QueuedThreadPool,它的构造函数如下

```java
public QueuedThreadPool(@Name("maxThreads") int maxThreads, @Name("minThreads") int minThreads, @Name("idleTimeout") int idleTimeout, @Name("reservedThreads") int reservedThreads, @Name("queue") BlockingQueue<Runnable> queue, @Name("threadGroup") ThreadGroup threadGroup)
{
    if (maxThreads < minThreads) {
        throw new IllegalArgumentException("max threads ("+maxThreads+") less than min threads ("
                +minThreads+")");
    }
    setMinThreads(minThreads);
    setMaxThreads(maxThreads);
    setIdleTimeout(idleTimeout);
    setStopTimeout(5000);
    setReservedThreads(reservedThreads);
    if (queue==null)
    {
        int capacity=Math.max(_minThreads, 8);
        queue=new BlockingArrayQueue<>(capacity, capacity);
    }
    _jobs=queue;
    _threadGroup=threadGroup;
    setThreadPoolBudget(new ThreadPoolBudget(this));
}
```

本质上也是使用最大线程最小线程阻塞队列来实现

## ServerConnector

```java
public ServerConnector(
    @Name("server") Server server,
    @Name("executor") Executor executor,
    @Name("scheduler") Scheduler scheduler,
    @Name("bufferPool") ByteBufferPool bufferPool,
    @Name("acceptors") int acceptors,
    @Name("selectors") int selectors,
    @Name("factories") ConnectionFactory... factories)
{
    super(server,executor,scheduler,bufferPool,acceptors,factories);
    _manager = newSelectorManager(getExecutor(), getScheduler(),selectors);
    addBean(_manager, true);//在ServerConnector启动的过程中，会被启动
    setAcceptorPriorityDelta(-2);
}
```

factories：默认使用HttpConnectionFactory

acceptors：表示用来接收新的TCP/IP连接的线程个数

```java
int cores = ProcessorUtils.availableProcessors(); 

if (acceptors < 0)    
    acceptors=Math.max(1, Math.min(4,cores/8)); 

if (acceptors > cores)     
    LOG.warn("Acceptors should be <= availableProcessors: " + this); 

_acceptors = new Thread[acceptors]; 
```

## WebAppContext

处理web请求使用的handler，一般使用默认的构造函数，通过set方法来实例化对应的属性。

在jetty.xml中比如指定属性configurationClasses一般取值如下

```xml
<Array id="plusConfig" type="java.lang.String">
    <Item>org.eclipse.jetty.webapp.WebInfConfiguration</Item>
    <Item>org.eclipse.jetty.webapp.WebXmlConfiguration</Item>
    <Item>org.eclipse.jetty.webapp.MetaInfConfiguration</Item>
    <Item>org.eclipse.jetty.webapp.FragmentConfiguration</Item>
    <Item>org.eclipse.jetty.plus.webapp.EnvConfiguration</Item>
    <Item>org.eclipse.jetty.plus.webapp.PlusConfiguration</Item>
    <Item>org.eclipse.jetty.annotations.AnnotationConfiguration</Item>
    <Item>org.eclipse.jetty.webapp.JettyWebXmlConfiguration</Item>
    <Item>org.eclipse.jetty.webapp.TagLibConfiguration</Item>
</Array>
```

比如web有两个WebInfConfiguration和WebXmlConfiguration，从名字可以感受到，WebInfConfiguration就是对应web项目中的WEB-INF目录，而WebXmlConfiguration就是对应着web.xml文件

## Server启动

Server类是Jetty的HTTP Servlet服务器，它实现了LifeCycle接口。

调用的start实现真正执行的就是Server自身的doStart

```java
//AbstractLifeCycle中
@Override
public final void start() throws Exception
{
    synchronized (_lock)
    {
    ...
        doStart();
    ...
    }
}
```

类似的后续的所有相关LifeCycle的start启动,其实就是调用实现了它的类的doStart()方法

....待续


# 个人收获

类似 spring 的面向 Bean，jetty 面向 handler 设计（感觉和 netty 非常类似的思想），值得学习。

各种图形绘制还是要用起来的，一图胜千言。


# 参考资料

[Jetty9 源码剖析 - 设计规范](https://blog.csdn.net/qq_41084324/article/details/83313902)

[Jetty9 源码剖析 - 总体架构](https://blog.csdn.net/qq_41084324/article/details/83343130)

[Jetty源码学习-编译Jetty源码二三事](https://www.cnblogs.com/grass-cao/p/6155102.html)

[Jetty 源码学习4-基本架构与工作原理](https://my.oschina.net/tryUcatchUfinallyU/blog/110553)

## 具体的类

[深入Jetty源码之ServletHandler](https://yq.aliyun.com/articles/46925)

[源码之 connector & server](https://www.cnblogs.com/zhukunrong/p/3810562.html)

[Jetty源码分析之AbstractHandler](https://blog.csdn.net/acm_lkl/article/details/78848282)

[Jetty源码分析(一)](https://www.cnblogs.com/laimu/p/6057761.html)

## 启动

[jetty启动web项目源码分析](https://cloud.tencent.com/developer/article/1459936)

[Jetty源码结构及启动过程](https://blog.csdn.net/elricboa/article/details/78698135)

* any list
{:toc}