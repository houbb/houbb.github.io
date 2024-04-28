---
layout: post
title: web server apache tomcat11-27-Security Considerations
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---


# 前言

整理这个官方翻译的系列，原因是网上大部分的 tomcat 版本比较旧，此版本为 v11 最新的版本。

## 开源项目

> 从零手写实现 tomcat [minicat](https://github.com/houbb/minicat) 别称【嗅虎】心有猛虎，轻嗅蔷薇。

## 系列文章

[web server apache tomcat11-01-官方文档入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-01-intro)

[web server apache tomcat11-02-setup 启动](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-02-setup)

[web server apache tomcat11-03-deploy 如何部署](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-03-deploy)

[web server apache tomcat11-04-manager 如何管理？](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-04-manager)

[web server apache tomcat11-06-Host Manager App -- Text Interface](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-06-host-manager)

[web server apache tomcat11-07-Realm Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-07-relam)

[web server apache tomcat11-08-JNDI Resources](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-08-jndi)

[web server apache tomcat11-09-JNDI Datasource](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-09-jdbc-datasource)

[web server apache tomcat11-10-Class Loader](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-10-classloader-howto)

[web server apache tomcat11-11-Jasper 2 JSP Engine](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-11-jsps)

[web server apache tomcat11-12-SSL/TLS Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-12-ssl)

[web server apache tomcat11-13-SSI](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-13-ssi)

[web server apache tomcat11-14-CGI](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-14-cgi)

[web server apache tomcat11-15-proxy](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-15-proxy)

[web server apache tomcat11-16-mbean](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-16-mbean)

[web server apache tomcat11-17-default-servlet](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-17-default-servlet)

[web server apache tomcat11-18-clusting 集群](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-18-clusting)

[web server apache tomcat11-19-load balance 负载均衡](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-19-load-balance)

[web server apache tomcat11-20-connectors 连接器](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-20-connectors)

[web server apache tomcat11-21-monitor and management 监控与管理](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-21-monitor)

[web server apache tomcat11-22-logging 日志](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-22-logging)

[web server apache tomcat11-23-APR](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-23-apr)

[web server apache tomcat11-24-Virtual Hosting and Tomcat](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-24-virtual-host)

[web server apache tomcat11-25-Advanced IO and Tomcat](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-25-aio)

[web server apache tomcat11-26-maven jars](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-26-maven-jars)

[web server apache tomcat11-27-Security Considerations](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-27-security)

[web server apache tomcat11-28-Windows Service](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-28-windows-service)

[web server apache tomcat11-29-Windows Authentication](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-29-windows-auth)

[web server apache tomcat11-30-The Tomcat JDBC Connection Pool](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-30-tomcat-jdbc-pool)

[web server apache tomcat11-31-websocket](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-31-websocket)

[web server apache tomcat11-32-rewrite](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-32-rewrite)

[web server apache tomcat11-33-CDI](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-33-cdi)

[web server apache tomcat11-34-Ahead of Time compilation support](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-34-aot)



## 介绍

默认情况下，Tomcat 被配置为在大多数使用情况下具有合理的安全性。某些环境可能需要更多或更少安全的配置。本页面旨在提供一个配置选项的单一参考点，这些选项可能会影响安全性，并对更改这些选项的预期影响提供一些评论。意图是提供一个配置选项列表，应在评估Tomcat安装的安全性时考虑。

**注意：** 阅读本页面并不代替阅读和理解详细的配置文档。这些属性的更详细描述可能在相关的文档页面中找到。

### 非Tomcat设置

Tomcat 配置不应该是唯一的防线。系统中的其他组件（操作系统、网络、数据库等）也应该进行安全配置。

Tomcat 不应该在 root 用户下运行。为Tomcat进程创建一个专用用户，并为该用户提供操作系统所需的最低权限。例如，不应该使用Tomcat用户远程登录。

文件权限也应该适当限制。在 .tar.gz 发行版中，文件和目录不是全局可读的，且组没有写访问权限。在类Unix操作系统中，Tomcat 运行时的默认 umask 是 0027，以维护Tomcat正在运行时（例如，日志文件、扩展的WAR文件等）创建的文件的权限。

以 ASF 的 Tomcat 实例为例（其中自动部署已禁用，Web 应用程序部署为已展开的目录），标准配置是所有 Tomcat 文件由 root 拥有，组为 Tomcat，而所有者具有读/写权限，组只有读权限，全局没有权限。日志、临时目录和工作目录是由Tomcat用户而不是root用户拥有的例外。这意味着即使攻击者入侵了Tomcat进程，他们也不能更改Tomcat配置，部署新的Web应用程序或修改现有的Web应用程序。Tomcat 进程使用 umask 007 来维护这些权限。

在网络层面，考虑使用防火墙来限制只允许期望存在的传入和传出连接。

### JMX

JMX 连接的安全性取决于 JRE 提供的实现，因此超出了 Tomcat 的控制范围。

通常，访问控制非常有限（对所有内容只读或对所有内容读写）。Tomcat通过 JMX 公开大量的内部信息和控制以帮助调试、监视和管理。考虑到可用的有限访问控制，JMX 访问应被视为相当于本地 root/admin 访问并相应地进行限制。

大多数（全部？）JRE 供应商提供的 JMX 访问控制不会记录失败的身份验证尝试，也不会在重复失败的身份验证后提供帐户锁定功能。这使得进行暴力攻击变得容易且难以检测。

鉴于以上所有情况，应当小心确保，如果使用，JMX 接口已适当地保护。您可能希望考虑以下选项来保护 JMX 接口：

- 为所有 JMX 用户配置强密码；
- 将 JMX 监听器绑定到内部网络；
- 将对 JMX 端口的网络访问限制为受信任的客户端；
- 为外部监控系统提供一个特定应用的健康页面。

## 默认 Web 应用程序

### 一般

Tomcat 默认启用了许多 Web 应用程序。过去在这些应用程序中发现了漏洞。不需要的应用程序应该被移除，这样如果发现其他漏洞，系统就不会有风险。

### ROOT

ROOT Web 应用程序几乎没有安全风险，但它包含了正在使用的 Tomcat 版本。通常应该从公开访问的 Tomcat 实例中移除 ROOT Web 应用程序，不是出于安全原因，而是为了向用户显示更合适的默认页面。

### Documentation

文档 Web 应用程序几乎没有安全风险，但它确实标识了正在使用的 Tomcat 版本。通常应该从公开访问的 Tomcat 实例中移除文档 Web 应用程序。

### Examples

示例 Web 应用程序应始终从任何安全敏感的安装中移除。虽然示例 Web 应用程序不包含任何已知漏洞，但已知它包含功能（特别是显示所有接收内容并允许设置新 cookie 的 cookie 示例），可能会与部署在 Tomcat 实例上的其他应用程序的漏洞一起被攻击者使用，以获取否则无法获得的额外信息。

### Manager

管理器应用程序允许远程部署 Web 应用程序，并经常成为攻击目标，原因是由于弱密码的广泛使用以及启用了管理器应用程序的公开访问的 Tomcat 实例。管理器应用程序默认不可访问，因为没有配置具有必要访问权限的用户。如果启用了管理器应用程序，则应遵循“安全管理应用程序”部分的指导。

### Host Manager

主机管理器应用程序允许创建和管理虚拟主机 - 包括为虚拟主机启用管理器应用程序。主机管理器应用程序默认不可访问，因为没有配置具有必要访问权限的用户。如果启用了主机管理器应用程序，则应遵循“安全管理应用程序”部分的指导。

### 安全管理应用程序

在部署提供 Tomcat 实例管理功能的 Web 应用程序时，应遵循以下准则：

- 确保被允许访问管理应用程序的任何用户都有强密码。
- 不要移除 LockOutRealm 的使用，以防止针对用户密码的暴力攻击。
- 在 context.xml 文件中为管理应用程序配置 RemoteAddrValve，该阀门默认限制对 localhost 的访问。如果需要远程访问，请使用此阀门将其限制为特定 IP 地址。


## 安全管理器

自 Tomcat 11 起，已删除了对安全管理器的支持。在专用环境（如容器或虚拟机）中，通过在专用的 Tomcat 实例上运行单个 Web 应用程序，可以获得类似（甚至更好）的功能。

### server.xml

#### 一般

默认的 server.xml 包含大量的注释，包括一些被注释掉的示例组件定义。移除这些注释会使 server.xml 的阅读和理解变得更加容易。

如果未列出组件类型，则没有直接影响安全性的该类型的设置。

#### Server

将 port 属性设置为 -1 会禁用关闭端口。

如果未禁用关闭端口，则应为关闭配置一个强密码。

#### 监听器

- APR 生命周期监听器在使用 gcc 在 Solaris 上编译时不稳定。如果在 Solaris 上使用 APR/native 连接器，请使用 Sun Studio 编译器进行编译。
  
- JNI 库加载监听器可用于加载本机代码。应仅用于加载可信任的库。

- 安全生命周期监听器应启用并根据需要进行配置。

#### 连接器

- 默认情况下，非 TLS、HTTP/1.1 连接器在端口 8080 上进行配置。将不使用的连接器从 server.xml 中删除。

- AJP 连接器应仅在受信任的网络上使用，或者使用适当的 secret 属性进行适当的安全保护。

- AJP 连接器阻止具有未知请求属性的转发请求。通过为 allowedRequestAttributesPattern 属性配置适当的正则表达式，可以允许已知的安全和/或预期的属性。

- address 属性可用于控制连接器监听的 IP 地址。默认情况下，连接器监听所有配置的 IP 地址。

- allowBackslash 属性允许对请求 URI 进行非标准解析。在位于反向代理后面时，将此属性设置为非默认值可能会使攻击者能够绕过代理强制执行的任何安全约束。

- allowTrace 属性可用于启用 TRACE 请求，这对于调试很有用。由于某些浏览器处理 TRACE 请求的响应方式（这使得浏览器容易受到 XSS 攻击），默认情况下禁用了对 TRACE 请求的支持。

- discardFacades 属性设置为 true 会导致每个请求创建一个新的 facade 对象。这是默认值，它降低了应用程序中的错误可能将一个请求的数据暴露给另一个请求的机会。

- encodedSolidusHandling 属性允许对请求 URI 进行非标准解析。在位于反向代理后面时，将此属性设置为非默认值可能会使攻击者能够绕过代理强制执行的任何安全约束。

- 如果 enforceEncodingInGetWriter 属性设置为 false，则具有安全性影响。许多用户代理违反了 RFC 7230，尝试猜测文本媒体类型的字符编码，而规定的默认值应该使用 ISO-8859-1。某些浏览器将解释为 UTF-7 的响应，其中包含对于 ISO-8859-1 是安全的字符，但如果解释为 UTF-7 则会触发 XSS 漏洞。

- maxPostSize 属性控制将被解析以获取参数的 POST 请求的最大大小。参数在请求期间缓存，因此默认情况下限制为 2 MiB，以减少暴露给 DOS 攻击的可能性。

- maxSavePostSize 属性控制在 FORM 和 CLIENT-CERT 认证以及 HTTP/1.1 升级期间保存请求主体。对于 FORM 认证，请求主体在认证期间缓存在 HTTP 会话中，因此默认情况下缓存请求主体为 4 KiB，以减少暴露给 DOS 攻击的可能性。为了进一步减少通过限制 FORM 认证的允许持续时间来减少对 DOS 攻击的暴露，如果会话由 FORM 认证创建，则使用较短的会话超时。此减少的超时由 FORM 认证器的 authenticationSessionTimeout 属性控制。

- maxParameterCount 属性控制从查询字符串和（对于 POST 请求）请求主体获取的请求参数（包括上传的文件）的最大总数。将拒绝具有过多参数的请求。

- xpoweredBy 属性控制是否在每个请求中发送 X-Powered-By HTTP 头。如果发送，则标头的值包含 Servlet 和 JSP 规范版本、完整的 Tomcat 版本（例如，Apache Tomcat/11.0）、JVM 供应商的名称和 JVM 的版本。默认情况下禁用此标头。此标头可以为合法客户端和攻击者提供有用信息。

- server 属性控制 Server HTTP 标头的值。对于 Tomcat 4.1.x 到 8.0.x，默认情况下此标头的默认值是 Apache-Coyote/1.1。从 8.5.x 开始，默认情况下不设置此标头。此标头可以为合法客户端和攻击者提供有限信息。

- SSLEnabled、scheme 和 secure 属性都可以单独设置。当 Tomcat 位于反向代理后面并且代理通过 HTTP 或 HTTPS 连接到 Tomcat 时，通常会使用它们。它们允许 Tomcat 查看客户端和代理之间的连接的 SSL 属性，而不是代理和 Tomcat 之间的连接。例如，客户端可以通过 HTTPS 连接到代理，但代理使用 HTTP 连接到 Tomcat。如果需要 Tomcat 能够区分代

理接收的安全和非安全连接，则代理必须使用不同的连接器将安全和非安全请求传递给 Tomcat。如果代理使用 AJP，则通过 AJP 协议传递客户端连接的 SSL 属性，因此不需要单独的连接器。

- tomcatAuthentication 和 tomcatAuthorization 属性与 AJP 连接器一起使用，以确定是否应由 Tomcat 处理所有身份验证和授权，还是应将身份验证委派给反向代理（经过身份验证的用户名作为 AJP 协议的一部分传递给 Tomcat），并且 Tomcat 仍然可以执行授权。

- AJP 连接器中的 requiredSecret 属性配置了 Tomcat 和 Tomcat 前面的反向代理之间的共享秘密。它用于防止通过 AJP 协议进行未经授权的连接。

## 主机

主机元素控制部署。自动部署可简化管理，但也会使攻击者更容易部署恶意应用程序。自动部署由 autoDeploy 和 deployOnStartup 属性控制。如果两者都设置为 false，则只会部署 server.xml 中定义的上下文，并且任何更改都需要重新启动 Tomcat。

在不受信任的托管环境中，可以将 deployXML 属性设置为 false，以忽略与尝试为 Web 应用程序分配增加权限的 context.xml 打包在一起的任何上下文。请注意，如果启用了安全管理器，则 deployXML 属性将默认设置为 false。

### 上下文

这适用于所有可以定义 Context 元素的位置：server.xml 文件、默认 context.xml 文件、每个主机的 context.xml.default 文件、配置目录中的 Web 应用程序上下文文件或 Web 应用程序内部。

- crossContext 属性控制一个上下文是否允许访问另一个上下文的资源。默认情况下为 false，应仅为受信任的 Web 应用程序更改。

- privileged 属性控制上下文是否允许使用容器提供的 Servlet，如 Manager Servlet。默认情况下为 false，应仅为受信任的 Web 应用程序更改。

- 嵌套 Resources 元素的 allowLinking 属性控制上下文是否允许使用链接文件。如果启用，并且上下文被卸载，那么在删除上下文资源时将跟随这些链接。从默认情况下 false 到启用此设置（这包括 Windows 在内的大小写不敏感操作系统）将禁用许多安全措施，并允许，除其他外，直接访问 WEB-INF 目录。

- sessionCookiePathUsesTrailingSlash 可用于解决一些浏览器（Internet Explorer、Safari 和 Edge）中的错误，以防止在应用程序共享公共路径前缀的情况下会话 cookie 在应用程序之间暴露。但是，启用此选项可能会为映射到 /* 的 Servlets 的应用程序创建问题。还应注意 RFC6265 第 8.5 节指出，不同的路径不应被视为足以将 cookie 与其他应用程序隔离开。

- 当 antiResourceLocking 被启用时，Tomcat 将解压 Web 应用程序并将其复制到由 java.io.tmpdir 系统属性定义的目录（默认为 $CATALINA_BASE/temp）。此位置应使用适当的文件权限进行安全设置-通常为 Tomcat 用户读/写，其他用户无访问权限。

### 阀门

- 强烈建议配置 AccessLogValve。默认的 Tomcat 配置包括一个 AccessLogValve。这些通常按主机配置，但根据需要也可以按引擎或上下文进行配置。

- 任何管理应用程序都应受到 RemoteAddrValve（此阀门也可用作过滤器）的保护。应使用 allow 属性将访问限制为一组已知的受信任主机。

- 默认的 ErrorReportValve 在发送给客户端的响应中包含 Tomcat 版本号。为了避免这种情况，可以在每个 Web 应用程序内部显式配置自定义错误处理。或者，可以明确配置一个 ErrorReportValve，并将其 showServerInfo 属性设置为 false。或者，可以通过创建以下内容的文件 CATALINA_BASE/lib/org/apache/catalina/util/ServerInfo.properties 来更改版本号：

  ```
  server.info=Apache Tomcat/11.0.x
  ```

  根据需要修改值。请注意，这也将更改某些管理工具中报告的版本号，并可能使确定安装的真实版本变得更加困难。CATALINA_HOME/bin/version.bat|sh 脚本仍将报告正确的版本号。

- 默认的 ErrorReportValve 在发生错误时可以显示堆栈跟踪和/或 JSP 源代码给客户端。为了避免这种情况，可以在每个 Web 应用程序内部配置自定义错误处理。或者，可以明确配置一个 ErrorReportValve，并将其 showReport 属性设置为 false。

- RewriteValve 使用正则表达式，而编写不良形式的正则表达式模式可能会对“灾难性回溯”或“ReDoS”产生漏洞。有关更多详细信息，请参阅 Rewrite 文档。

### 领域

- MemoryRealm 不适用于生产用途，因为对 tomcat-users.xml 的任何更改都需要重新启动 Tomcat 才能生效。

- UserDatabaseRealm 不适用于大规模安装。它适用于小规模、相对静态的环境。

- JAASRealm 并不广泛使用，因此代码与其他领域相比不够成熟。建议在使用此领域之前进行额外的测试。

- 默认情况下，领域不实现任何形式的帐户锁定。这意味着暴力破解攻击可能会成功。为防止

暴力破解攻击，所选择的领域应该包装在 LockOutRealm 中。

### 管理器

- 管理器组件用于生成会话 ID。

- 可以使用 randomClass 属性更改用于生成随机会话 ID 的类。

- 可以使用 sessionIdLength 属性更改会话 ID 的长度。

- 在使用 JDBCStore 时，会话存储应该受到保护（专用凭据、适当的权限），以便只有 JDBCStore 能够访问持久化的会话数据。特别是，JDBCStore 不应通过任何对 Web 应用程序可用的凭据访问。

# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/maven-jars.html

* any list
{:toc}