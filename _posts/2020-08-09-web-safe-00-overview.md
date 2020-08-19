---
layout: post
title:  web 安全系列-00-web 安全概览
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, web-safe, sf]
published: true
---

#  web 安全的重要性

所有的开发其实一直在追求三样东西：

（1）特性

（2）速度

（3）安全

本系列重点讲述一下 web 的安全问题。

# 主要内容

[01-SQL 注入](https://houbb.github.io/2020/08/09/web-safe-01-sql-injection)

[02-XSS 跨站脚本攻击](https://houbb.github.io/2020/08/09/web-safe-02-xss)

[03-CRLF 回车换行攻击](https://houbb.github.io/2020/08/09/web-safe-03-crlf)

[04-CSRF 跨站请求伪造](https://houbb.github.io/2020/08/09/web-safe-04-csrf)

[05-weak password 弱口令](https://houbb.github.io/2020/08/09/web-safe-05-weak-password)

[06-URL redirect 开放重定向漏洞](https://houbb.github.io/2020/08/09/web-safe-06-redirect)

[07-XXE XML 外部实体](https://houbb.github.io/2020/08/09/web-safe-07-xxe)

[08-SSRF 服务端请求伪造](https://houbb.github.io/2020/08/09/web-safe-08-ssrf)

[09-OS 命令注入](https://houbb.github.io/2020/08/09/web-safe-09-command)

[10-webshell 攻击](https://houbb.github.io/2020/08/09/web-safe-10-webshell)

[11-xpath 注入](https://houbb.github.io/2020/08/09/web-safe-11-xpath)

[12-SSTI 模板注入](https://houbb.github.io/2020/08/09/web-safe-12-ssti)

[13-序列化漏洞](https://houbb.github.io/2020/08/09/web-safe-13-serial)

[14-目录穿越](https://houbb.github.io/2020/08/09/web-safe-14-path-travel)

[15-ddos 攻击](https://houbb.github.io/2020/07/19/acp-learn-08-DDos)

[16-子域劫持](https://houbb.github.io/2020/08/09/web-safe-15-subdomain-takeover)

[17-缓冲区溢出](https://houbb.github.io/2020/08/09/web-safe-16-buffer-overflow)

配置安全

web cache 欺骗攻击

HTTP 请求走私

中间件

文件读取

文件上传

文件包含

# 信息加密

## 加密

Base64

Md5

SHA-256

screct 加密项目，收集常见的加密算法。

---------------------

敏感信息泄露：加密+脱敏

CFCA 加密签名

跨域问题

# 认证方式

SSO

OAUTH

JWT

Kerberos

SAML

# TOP10

从以上图例观察，这三次发布的Top10 Web安全漏洞排行中，初步分析：

1. 注入漏洞、失效的身份认证始终分列在第1位和第2位，一定程度说明其重要性和攻击危害的程度

oauth2

2. 跨站脚本攻击，在13年前后一段时间里排行也比较靠前，当时XSS算是比较多存在的情况，最近几年也存在不少，但比以往网站已经提高了安全意识进行防御

3. 敏感信息泄露，由不安全的加密存储和传输层保护不足合并而成。以往也普遍存在该漏洞，当时重视程度并不算太高，但最近几年一些知名的公司暴露出大量用户的隐私信息事件之后，所造成的负面影响比较大，因此越来越开始重视起来

4. 失效的访问控制，由不安全的直接对象引用和功能级访问控制缺失合并而成。对于攻击者伪造成特权用户、管理员等身份进行数据的操纵，对正常用户和网站管理房都有比较大的威胁，引起危害性较大，近年来也比较受重视

5. 安全配置错误，这个也是历年来比较常见而且重要的安全问题，因相关配置没有控制好权限和安全规范，导致一些敏感信息暴露，异常抛出时也把权限以外的数据展示出来

6. 跨站请求伪造，在最近几年似乎没有前几年那么活跃，可能网站管理者对这方面的安全意识越来越高，被利用的难度和代价加大

7. 使用含有已知漏洞的组件，比如库、框架、模块本身存在已知公开的漏洞还继续使用，则有可能被攻击者所利用，对数据存储、服务器权限操作有安全隐患

8. 近年新出现的：XML外部实体、不安全的反序列化、不足的日志记录和监控。
 
1）XXE，基于XML的Web服务，若支持XML外部文件上传提交，可能在XML文件中插入不受信任的数据，提交后由XML处理器解析存在安全风险

2）不安全的反序列化，可能导致远程代码执行，以及权限升级攻击

3）不足的日志记录和监控，缺陷没有及早在本地环境检测和监控到并加以防范，导致有的缺陷一致暴露在正式访问环境中，很有可能被攻击者所利用

# 前景规划

专门设计一个项目：websafe  针对上面的每一个点，专门设计一个模块，处理对应的安全问题。

websafe-sql

websafe-xss

# 参考资料

[从OWASP Top10简要分析Web安全漏洞的趋势](https://www.jianshu.com/p/a88e0f8ff89a)

[Web安全学习笔记](https://www.bookstack.cn/read/LyleMi-Learn-Web-Hacking/3f79e2c413ce452f.md)

* any list
{:toc}