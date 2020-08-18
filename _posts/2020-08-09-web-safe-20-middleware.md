---
layout: post
title:  web 安全系列-20-middleware 中间件常见漏洞
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, web-safe, sf]
published: true
---

#  常见web中间件及其漏洞概述

（一） IIS

1、PUT漏洞

2、短文件名猜解

3、远程代码执行

4、解析漏洞

（二） Apache

1、解析漏洞

2、目录遍历

（三） Nginx

1、文件解析

2、目录遍历

3、CRLF注入

4、目录穿越

（四）Tomcat

1、远程代码执行

2、war后门文件部署

（五）jBoss

1、反序列化漏洞

2、war后门文件部署

（六）WebLogic

1、反序列化漏洞

2、SSRF

3、任意文件上传

4、war后门文件部署

（七）其它中间件相关漏洞

1、FastCGI未授权访问、任意命令执行

2、PHPCGI远程代码执行

# 中间件、容器、服务器傻傻分不清？

在谈中间件安全问题时，我觉得有必要先梳理下以上几种关系以及概念。

当初我在接触这些概念时，脑子里就是一团浆糊，中间件、容器、服务器、webserver等等概念感觉彼此很相似，但又有所区别。

因此在书写本篇时，我特意翻查了一些资料，试图梳理清这几者之间的关系，参考了文章：http://www.voidcn.com/blog/saoraozhe3hao/article/p-2428756.html

## 基础概念与作用

这里只介绍web中间件、web服务器、web容器，因为除了web以外，其概念还可以扩展为数据库等。

- web服务器

web服务器用于提供http服务，即向客户端返回信息，其可以处理HTTP协议，响应针对静态页面或图片的请求，控制页面跳转，或者把动态请求委托其它程序（中间件程序）等。

- web中间件

web中间件用于提供系统软件和应用软件之间的连接，以便于软件各部件之间的沟通，其可以为一种或多种应用程序提供容器。

- web容器

web容器用于给处于其中的应用程序组件（JSP，SERVLET）提供一个环境，是中间件的一个组成部分，它实现了对动态语言的解析。比如tomcat可以解析jsp，是因为其内部有一个jsp容器。

## 所属的类别

web服务器：IIS、Apache、nginx、tomcat、weblogic、websphere等。

web中间件：apache tomcat、BEA WebLogic、IBM WebSphere等。

web容器：JSP容器、SERVLET容器、ASP容器等。

注意：web中间件与web服务器是有重叠的，原因在于tomcat等web中间件也具备web服务器的功能。

## 重点分析

web服务器只是提供静态网页解析（如apache），或者提供跳转的这么一种服务。

而web中间件（其包含web容器）可以解析动态语言，比如tomcat可以解析jsp（因为tomcat含有jsp容器），当然它也可以解析静态资源，因此它既是web中间件也是web服务器。

不过tomcat解析静态资源的速度不如apache，因此常常两者结合使用。

# Tomcat漏洞与防护

tomcat是apache的一个中间件软件，其可以提供jsp或者php的解析服务，为了方便远程管理与部署，安装完tomcat以后默认会有一个管理页面，管理员只需要远程上传一个WAR格式的文件，便可以将内容发布到网站，这一功能方便了管理员的同时也给黑客打开了方便之门，除此之外，tomcat还有一些样本页面，如果处理不当也会导致安全问题。

## tomcat远程部署漏洞详情

tomcat管理地址通常是：

```
http://localhost:8080/manager
```

默认账号密码：

```
root/root
tomcat/tomcat 
admin admin
admin 123456
```

## tomcat口令爆破

在默认不对tomcat做任何配置的时候爆破是无效的，而如果设置了账号密码就可以进行爆破。

Tomcat的认证比较弱，Base64(用户名:密码)编码，请求响应码如果不是401（未经授权：访问由于凭据无效被拒绝。）即表示登录成功。

登录成功后，可直接上传war文件，getshell（当然上传war文件需要manager权限）

## getshell 过程

首先将我们的.jsp shell文件打包为war文件：

```
jar -cvf shell.war shell.jsp
```

## tomcat漏洞防护

- 升级tomcat版本

- 删除远程部署页面，或者限定页面的访问权限。

- 找到/conf/tomcat-users.xml修改用户名密码以及权限。

- 删除样例页面文件

# JBoss漏洞与防护
JBoss这是一个基于JavaEE的应用服务器，与tomcat类似的是jboss也有远程部署平台，但不需要登陆。

漏洞利用过程与tomcat类似，因此不再截图说明。除了远程部署漏洞外，jboss还存在反序列化漏洞，这里不再详述。

## JBoss远程部署漏洞详情

默认管理后台地址：

```
http://localhost:8080
```
 
## getshell 过程　　

访问管理页面，查看jboss配置页面中的JMX Console，这是JBoss的管理台程序，进入后找到Jboss.deployment包，该包下有flavor=URL.type=DeploymentSccanner选项。

进入部署页面后便可以上传war文件，但与tomcat不同的是它不是本地上传war文件，而是从远程地址下载，因此需要自己准备一个文件服务器，用于远程下载war到目标jboss服务器上。

具体方法是在部署页面找到”ADDURL”方法，输入URL地址，点击invoke。

除了以上方法外，JMX-Console提供的BSH方法，同样也可以部署war包。

## JBoss漏洞防护

1. 开启jmx-console密码认证

2. 删除jmx-console.war与web-console.war

# WebLogic漏洞与防护

weblogic是一个基于JavaEE构架的中间件，安装完weblogic默认会监听7001端口。漏洞利用过程与tomcat类似，因此不再截图说明。

## Weblogic远程部署漏洞详情

默认后台地址：

```
http://localhost:7001/console/login/loginForm.jsp
```

账号密码：

```
用户名密码均为：weblogic
用户名密码均为：system
用户名密码均为：portaladmin
用户名密码均为：guest
```

## getshell过程

成功登陆weblogic后台后，找到部署按钮，点击后选择安装，然后可以选择本地上传war包也可以利用远程url下载，部署完成后，weblogic会给出文件地址。

## Weblogic漏洞防护

删除远程部署页面

# axis2漏洞与防护

axis2也是apache的一个项目，是新一代的SOAP引擎，其存在一个任意命令执行漏洞。（该漏洞来自补天平台）

## axis2命令执行漏洞详情

默认后台地址：

```
http://localhost/axis2-admin/
```

默认账号密码：admin与axis2

执行系统命令poc

```
http://localhost/services/Axis2Shell/execCmd?cmd=whoami
```

# IIS漏洞与防护

IIS是微软的一款web服务器，其配置不当容易产生webdav漏洞。

webdav本身是iis的一项扩展功能，开启后可以使用除了get、post以外的一些请求类型，比如put等。

但如果配置不当，就会导致文件上传漏洞。

除了webdav漏洞，近期还爆出了一个远程命令执行漏洞，具体移步：IIS6.0远程命令执行漏洞(CVE-2017-7269)

## IIS Webdav漏洞详情

当测试一个站点是否存在webdav漏洞时，可以先构造一个OPTIONS请求，若返回200，则查看返回头的Allow参数中包含哪些方法（可以请求）。

```
OPTIONS  / HTTP/1.1
Host:thief.one
```

如果存在PUT方法，则可以尝试写入一个txt文件。

```
UT /shell.txt HTTP/1.1
HOST:thief.one
Content-length:30
<%eval request("nmask")%>
```

若返回200则说明上传成功，此时可以手动访问此文件，确认是否存在。

当然也有可能返回403，这表示此目录没有上传的权限，可以尝试上传到其他目录。

通过MOVE或COPY方法改文件后缀名。

```
COPY /shell.txt HTTP/1.1
HOST:thief.one
Destination:http://thief.one/shell.asp
```

## IIS漏洞防护

- 关闭webdav功能

# Apache漏洞与防护

Apache本身也存在一些漏洞，比如slowhttp漏洞，当然官方认为其是apache的特性而不算是一种漏洞，然而事实证明它的危害真的很大。

除了slowhttp漏洞以外，其第三方moudle存在很多反序列化或者远程命令执行的漏洞。

## Apache slowhttp漏洞详情

关于slowhttp漏洞请移步：浅谈DDOS攻击与防御

# HPP漏洞

HPP漏洞是web容器处理http参数时的问题，前面几款web服务器都或多或少存在这样的问题。

```php
<?php
    $str=$_REQUEST['str'];                    #$_REQUEST[]函数可以接受GET/POST。
    Echo $str;
?>
```

比如访问URL:

```
http://www.xxx.com/index.php?str=hello
```

此时页面显示hello

但如果访问:

```
http://www.xxx.com/index.php?str=hello&str=world&str=nmask
```

此时页面显示nmask，把前面参数的值给覆盖了，这就是http参数污染。

## 利用场景

绕过WAF，如：

```
PHP:index.php?str=1&str=select * from admin --
```

因为WAF可能会校验值的第一个单词，如果为select则触发，这样子可以避免被触发。

# 拓展阅读  

[web 安全系列](https://houbb.github.io/2020/08/09/web-safe-00-overview)

# 参考资料

[Web中间件常见漏洞总结](https://www.freebuf.com/articles/web/192063.html)

[中间件安全系列](https://www.cnblogs.com/bmjoker/category/1200606.html)

[浅谈中间件漏洞与防护](https://thief.one/2017/05/25/1/)

* any list
{:toc}