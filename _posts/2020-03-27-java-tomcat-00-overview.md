---
layout: post
title: Tomcat 系列-简易版 tomcat 实现
date:  2020-3-27 12:58:05 +0800
categories: [Java]
tags: [tomcat, jetty, java, sh]
published: true
---

# 背景

[Tomcat](http://tomcat.apache.org/index.html) 作 为Web服务器深受市场欢迎，有必要对其进行深入的研究。

在工作中，我们经常会把写好的代码打包放在Tomcat里并启动，然后在浏览器里就能愉快的调用我们写的代码来实现相应的功能了，那么Tomcat是如何工作的？

## 个人

个人主要是觉得 tomcat 过于冗余（或者说功能强大），有时候我只需要一个非常简单的功能即可。

所以想实现一个最简单的 tomcat。

# Tomcat工作原理

我们启动Tomcat时双击的startup.bat文件的主要作用是找到catalina.bat，并且把参数传递给它，而 catalina.bat 中有这样一段话：

```
set MAINCLASS=org.apache.catalina.startup.Bootstrap
```

ps: 此处以我本地的 `apache-tomcat-7.0.6-1` 为例。

## Bootstrap 引导类 

我们可以直接在 catalina.bat 文件当前目录看到 `bootstrap.jar`，其中 Bootstrap.class 的代码就可以在这里查看。

Bootstrap.class 是整个Tomcat 的入口，我们在Tomcat源码里找到这个类，其中就有我们经常使用的main方法：

### main()

```java
public static void main(String[] args) {
    if (daemon == null) {
        Bootstrap bootstrap = new Bootstrap();
        try {
            bootstrap.init();
        } catch (Throwable var4) {
            handleThrowable(var4);
            var4.printStackTrace();
            return;
        }
        daemon = bootstrap;
    }
    try {
        String command = "start";
        if (args.length > 0) {
            command = args[args.length - 1];
        }
        if (command.equals("startd")) {
            args[args.length - 1] = "start";
            daemon.load(args);
            daemon.start();
        } else if (command.equals("stopd")) {
            args[args.length - 1] = "stop";
            daemon.stop();
        } else if (command.equals("start")) {
            daemon.setAwait(true);
            daemon.load(args);
            daemon.start();
        } else if (command.equals("stop")) {
            daemon.stopServer(args);
        } else if (command.equals("configtest")) {
            daemon.load(args);
            if (null == daemon.getServer()) {
                System.exit(1);
            }
            System.exit(0);
        } else {
            log.warn("Bootstrap: command \"" + command + "\" does not exist.");
        }
    } catch (Throwable var3) {
        handleThrowable(var3);
        var3.printStackTrace();
        System.exit(1);
    }
}
```

### 作用

这个类有两个作用 ：

1. 初始化一个守护进程变量、加载类和相应参数。

2. 解析命令，并执行。

## server.xml

源码不过多赘述，我们在这里只需要把握整体架构，有兴趣的同学可以自己研究下源码。

Tomcat的server.xml配置文件中可以对应构架图中位置，多层的表示可以配置多个：

```xml
<Server port="8885" shutdown="SHUTDOWN">

  <!--APR library loader. Documentation at /docs/apr.html -->
  <Listener SSLEngine="on" className="org.apache.catalina.core.AprLifecycleListener"/>
  <!--Initialize Jasper prior to webapps are loaded. Documentation at /docs/jasper-howto.html -->
  <Listener className="org.apache.catalina.core.JasperListener"/>
  <!-- Prevent memory leaks due to use of particular java/javax APIs-->
  <Listener className="org.apache.catalina.core.JreMemoryLeakPreventionListener"/>
  <Listener className="org.apache.catalina.mbeans.GlobalResourcesLifecycleListener"/>
  <Listener className="org.apache.catalina.core.ThreadLocalLeakPreventionListener"/>

  <!-- Global JNDI resources
       Documentation at /docs/jndi-resources-howto.html
  -->
  <GlobalNamingResources>
    <!-- Editable user database that can also be used by
         UserDatabaseRealm to authenticate users
    -->
    <Resource auth="Container" description="User database that can be updated and saved" factory="org.apache.catalina.users.MemoryUserDatabaseFactory" name="UserDatabase" pathname="conf/tomcat-users.xml" type="org.apache.catalina.UserDatabase"/>
  </GlobalNamingResources>

  <!-- A "Service" is a collection of one or more "Connectors" that share
       a single "Container" Note:  A "Service" is not itself a "Container", 
       so you may not define subcomponents such as "Valves" at this level.
       Documentation at /docs/config/service.html
   -->
  <Service name="Catalina">
  
    <!--The connectors can use a shared executor, you can define one or more named thread pools-->
    <!--
    <Executor name="tomcatThreadPool" namePrefix="catalina-exec-" 
        maxThreads="150" minSpareThreads="4"/>
    -->
    
    
    <!-- A "Connector" represents an endpoint by which requests are received
         and responses are returned. Documentation at :
         Java HTTP Connector: /docs/config/http.html (blocking & non-blocking)
         Java AJP  Connector: /docs/config/ajp.html
         APR (HTTP/AJP) Connector: /docs/apr.html
         Define a non-SSL HTTP/1.1 Connector on port 8080
    -->
    <Connector connectionTimeout="20000" port="9999" protocol="HTTP/1.1" redirectPort="8443"/>
    <!-- A "Connector" using the shared thread pool-->
    <!--
    <Connector executor="tomcatThreadPool"
               port="8080" protocol="HTTP/1.1" 
               connectionTimeout="20000" 
               redirectPort="8443" />
    -->           
    <!-- Define a SSL HTTP/1.1 Connector on port 8443
         This connector uses the JSSE configuration, when using APR, the 
         connector should be using the OpenSSL style configuration
         described in the APR documentation -->
    <!--
    <Connector port="8443" protocol="HTTP/1.1" SSLEnabled="true"
               maxThreads="150" scheme="https" secure="true"
               clientAuth="false" sslProtocol="TLS" />
    -->

    <!-- Define an AJP 1.3 Connector on port 8009 -->
    <Connector port="8899" protocol="AJP/1.3" redirectPort="8443"/>


    <!-- An Engine represents the entry point (within Catalina) that processes
         every request.  The Engine implementation for Tomcat stand alone
         analyzes the HTTP headers included with the request, and passes them
         on to the appropriate Host (virtual host).
         Documentation at /docs/config/engine.html -->

    <!-- You should set jvmRoute to support load-balancing via AJP ie :
    <Engine name="Catalina" defaultHost="localhost" jvmRoute="jvm1">         
    --> 
    <Engine defaultHost="localhost" name="Catalina">

      <!--For clustering, please take a look at documentation at:
          /docs/cluster-howto.html  (simple how to)
          /docs/config/cluster.html (reference documentation) -->
      <!--
      <Cluster className="org.apache.catalina.ha.tcp.SimpleTcpCluster"/>
      -->        

      <!-- Use the LockOutRealm to prevent attempts to guess user passwords
           via a brute-force attack -->
      <Realm className="org.apache.catalina.realm.LockOutRealm">
        <!-- This Realm uses the UserDatabase configured in the global JNDI
             resources under the key "UserDatabase".  Any edits
             that are performed against this UserDatabase are immediately
             available for use by the Realm.  -->
        <Realm className="org.apache.catalina.realm.UserDatabaseRealm" resourceName="UserDatabase"/>
      </Realm>

      <Host appBase="webapps" autoDeploy="true" name="localhost" unpackWARs="true">

        <!-- SingleSignOn valve, share authentication between web applications
             Documentation at: /docs/config/valve.html -->
        <!--
        <Valve className="org.apache.catalina.authenticator.SingleSignOn" />
        -->

        <!-- Access log processes all example.
             Documentation at: /docs/config/valve.html
             Note: The pattern used is equivalent to using pattern="common" -->
        <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs" pattern="%h %l %u %t &quot;%r&quot; %s %b" prefix="localhost_access_log." resolveHosts="false" suffix=".txt"/>

      </Host>
    </Engine>
  </Service>
</Server>
```

其实整体也不难理解。

### 组成

即一个由 Server->Service->Engine->Host->Context 组成的结构，从里层向外层分别是：

- Server：

服务器Tomcat的顶级元素，它包含了所有东西。

- Service：

一组 Engine(引擎) 的集合，包括线程池 Executor 和连接器 Connector 的定义。

- Engine(引擎)：
一个 Engine代表一个完整的 Servlet 引擎，它接收来自Connector的请求，并决定传给哪个Host来处理。

- Container(容器)：

Host、Context、Engine和Wraper都继承自Container接口，它们都是容器。

- Connector(连接器)：

将Service和Container连接起来，注册到一个Service，把来自客户端的请求转发到Container。

- Host：

即虚拟主机，所谓的”一个虚拟主机”可简单理解为”一个网站”。

- Context(上下文 )： 

即 Web 应用程序，一个 Context 即对于一个 Web 应用程序。

Context容器直接管理Servlet的运行，Servlet会被其给包装成一个StandardWrapper类去运行。

Wrapper负责管理一个Servlet的装载、初始化、执行以及资源回收，它是最底层容器。

# 梳理自己的 Tomcat 实现思路

## 整体思路

效果整体思路如下：

1. ServerSocket占用8080端口，用while（true）循环等待用户发请求。

2. 拿到浏览器的请求，解析并返回URL地址，用I/O输入流读取本地磁盘上相应文件。

3. 读取文件，不存在构建响应报文头、HTML正文内容，存在则写到浏览器端。

## 代码结构

```
├─bs
│      ColaBs.java
│
├─constant
│      ColaConst.java
│
├─domain
│      Request.java
│      Response.java
│
└─exception
        ColaException.java
```

其中常量和异常类可以不做关心。


## 代码

- ColaBs.java

```java
package com.github.houbb.cola.bs;

import com.github.houbb.cola.domain.Request;
import com.github.houbb.cola.domain.Response;
import com.github.houbb.cola.exception.ColaException;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.UnknownHostException;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public final class ColaBs {

    /**
     * 用于判断是否需要关闭容器
     *
     * @since 0.0.1
     */
    private static volatile boolean shutdown = false;

    /**
     * 接受信息等待
     *
     * @since 0.0.1
     */
    private static void acceptWait() throws UnknownHostException {
        final int port = 8080;
        final InetAddress inetAddress = InetAddress.getByName("127.0.0.1");
        try(ServerSocket serverSocket = new ServerSocket(port, 1, inetAddress)) {
            System.out.println("Server start and listen on " + port);
            // 等待用户发请求
            while (!shutdown) {
                Socket socket = serverSocket.accept();
                InputStream is = socket.getInputStream();
                OutputStream os = socket.getOutputStream();

                // 接受请求参数
                Request request = new Request(is);

                // 创建用于返回浏览器的对象
                Response response = new Response(request, os);
                response.flush();

                //关闭一次请求的socket,因为http请求就是采用短连接的方式
                socket.close();

                //如果请求地址是/shutdown  则关闭容器
                shutdown = request.getUrl().equals("/shutdown");
            }

            System.out.println("Server shut down!");
        } catch (IOException e) {
            throw new ColaException(e);
        }
    }

    public static void main(String[] args) {
        try {
            ColaBs.acceptWait();
        } catch (UnknownHostException e) {
            e.printStackTrace();
        }
    }

}
```

- Request.java

```java
package com.github.houbb.cola.domain;

import com.github.houbb.cola.constant.ColaConst;
import com.github.houbb.cola.exception.ColaException;
import com.github.houbb.heaven.util.lang.StringUtil;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/**
 * 请求入参
 * @author binbin.hou
 * @since 0.0.1
 */
public class Request {

    /**
     * 输入流
     * @since 0.0.1
     */
    private String url;

    /**
     * 新建请求对象
     * @param is 输入流
     * @since 0.0.1
     */
    public Request(InputStream is) {
        try {
            // 只读取固定长度的内容。
            byte[] bytes = new byte[ColaConst.BUFFER_SIZE];
            int readSize = is.read(bytes);
            final String requestString = new String(bytes, StandardCharsets.UTF_8);

            System.out.println("[Request] received request " + requestString);
            // 处理请求头信息
            this.url = parseUrL(requestString);
        } catch (IOException e) {
            throw new ColaException(e);
        }
    }

    /**
     * 获取 url 信息
     * @since 0.0.1
     */
    public String getUrl() {
        return this.url;
    }

    /**
     * 转换 url
     *
     * 1. 直接根据 http 请求头进行截取。
     * @param requestString 请求字符串
     * @return 结果
     * @since 0.0.1
     */
    private String parseUrL(String requestString) {
        try {
            int index1, index2;
            //看socket获取请求头是否有值
            index1 = requestString.indexOf(' ');
            if (index1 != -1) {
                // 截取 GET 之后的内容
                index2 = requestString.indexOf(' ', index1 + 1);
                if (index2 > index1) {
                    String url = requestString.substring(index1 + 1, index2);
                    // 进行一次反转义，避免中文等被处理
                    return URLDecoder.decode(url, "UTF-8");
                }
            }

            return StringUtil.EMPTY;
        } catch (UnsupportedEncodingException e) {
            throw new ColaException(e);
        }
    }

}
```

- Response.java

```java
package com.github.houbb.cola.domain;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * 请求出参
 * @author binbin.hou
 * @since 0.0.1
 */
public class Response {

    /**
     * 请求信息
     *
     * @since 0.0.1
     */
    private Request request;

    /**
     * 输出流
     *
     * @since 0.0.1
     */
    private OutputStream outputStream;

    public Response(Request request, OutputStream outputStream) {
        this.request = request;
        this.outputStream = outputStream;
    }

    /**
     * 刷回文件内容到页面
     *
     * @throws IOException 浏览器
     * @since 0.0.1
     */
    public void flush() throws IOException {
        final String url = request.getUrl();
        //返回给浏览器响应提示,这里可以拼接HTML任何元素
        String returnMessage = "HTTP/1.1 200\r\n" +
                "Content-Type: text/html;charset=UTF-8\r\n" +
                "Content-Length: " + url.length() + "\r\n" +
                "\r\n" +
                url;
        outputStream.write(returnMessage.getBytes(StandardCharsets.UTF_8));
    }

}
```

# 入门例子

## 启动服务端

直接运行 ColaBs.main() 方法启动应用

## 页面访问

浏览器访问 [http://127.0.0.1:8080/dd](http://127.0.0.1:8080/dd)

页面返回

```
/dd
```

## 后台日志

其实每次页面请求，对应的都是一个 Http 请求如下：

```
[Request] received request 
GET /dd HTTP/1.1
Host: 127.0.0.1:8080
Connection: keep-alive
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36
Sec-Fetch-Dest: document
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Sec-Fetch-Site: none
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
```

这里是标准的 Http 协议，我们可以通过解析获取对应的信息。

# 拓展思路

读者可以自己做的优化，扩展的点

1. web.xml 灵活配置

在WEB_INF文件夹下读取web.xml解析，通过请求名找到对应的类名，通过类名创建对象，用反射来初始化配置信息，如welcome页面，Servlet、servlet-mapping，filter，listener，启动加载级别等。

2. 抽象Servlet类来转码处理请求和响应的业务。

发过来的请求会有很多，也就意味着我们应该会有很多的Servlet，例如：RegisterServlet、LoginServlet等等还有很多其他的访问。

可以用到类似于工厂模式的方法处理，随时产生很多的Servlet，来满足不同的功能性的请求。

3. 使用多线程技术。

本文的代码是死循环，且只能有一个链接，而现实中的情况是往往会有很多很多的客户端发请求，可以把每个浏览器的通信封装到一个线程当中。

这里其实应该是使用 NIO，建议后期直接采用 netty 重写。

# 完整代码地址

> [cola](https://github.com/houbb/cola)

# 参考资料

[手写一个简化版Tomcat](https://www.jianshu.com/p/bc9343a95554)

[tomcat7 文档](http://tomcat.apache.org/tomcat-7.0-doc/index.html)

[HTTP/1.1详解](https://blog.csdn.net/u013870094/article/details/79098628)

* any list
{:toc}