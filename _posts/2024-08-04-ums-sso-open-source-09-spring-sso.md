---
layout: post
title: SSO open-source 开源项目-09-spring-Oauth-sso CAS
date: 2024-08-04 21:01:55 +0800
categories: [SSO]
tags: [sso, open-source, ums, priviliage, sh]
published: true
---


# 前言

大家好，我是老马。

今天我们来一起介绍一些常见的 sso 开源项目。

# 项目

前后端合一:

[privilege-admin 权限管理](https://github.com/houbb/privilege-admin)

前后端分离：

> [ums-server](https://github.com/houbb/ums-server)

> [ums-server-h5](https://github.com/houbb/ums-server-h5)

# spring-Oauth-sso

## 1.SSO介绍

###   	什么是SSO

​	SSO英文全称Single Sign On，单点登录。SSO是在多个应用系统中，用户只需要登录一次就可以访问所有相互信任的应用系统。它包括可以将这次主要的登录映射到其他应用中用于同一个用户的登录的机制。它是目前比较流行的企业业务整合的解决方案之一。

​	简单来说，SSO出现的目的在于解决同一产品体系中，多应用共享用户session的需求。SSO通过将用户登录信息映射到浏览器cookie中，解决其它应用免登获取用户session的问题。

### 	为什么需要SSO

​	开放平台业务本身不需要SSO，但是如果平台的普通用户也可以在申请后成为一个应用开发者，那么就需要将平台加入到公司的整体账号体系中去，另外，对于企业级场景来说，一般都会有SSO系统，充当统一的账号校验入口。

### CAS协议中概念介绍

SSO单点登录只是一个方案，而目前市面上最流行的单端登录系统是由耶鲁大学开发的CAS系统，而由其实现的CAS协议，也成为目前SSO协议中的既定协议，下文中的单点登录协议及结构，均为CAS中的体现结构

CAS协议中有以下几个概念：

1.CAS Client：需要集成单点登录的应用，称为单点登录客户端

2.CAS Server：单点登录服务器，用户登录鉴权、凭证下发及校验等操作

3.TGT：ticker granting ticket，用户凭证票据，用以标记用户凭证，用户在单点登录系统中登录一次后，再其有效期内，TGT即代表用户凭证，用户在其它client中无需再进行二次登录操作，即可共享单点登录系统中的已登录用户信息

4.ST：service ticket，服务票据，服务可以理解为客户端应用的一个业务模块，体现为客户端回调url，CAS用以进行服务权限校验，即CAS可以对接入的客户端进行管控

5.TGC：ticket granting cookie，存储用户票据的cookie，即用户登录凭证最终映射的cookies

![](https://img2018.cnblogs.com/blog/1373932/201905/1373932-20190504102528208-1014155182.gif)

#### 2.接口测试

```java
首先启动server项目,在先后启动client1和client2不然会报找不到认证服务器异常:
访问URL:
http://127.0.0.1:8060/client2/index.html
此时会进行认证服务器的登录校验,用户名随便填写,密码我这里固定设置为123456
跳转后点击访问client2即可访问client2的相关内容,至此完成Sso不同应用间单点登录的功能
```

# 参考资料

https://github.com/charlienss/springOauth-sso-CAS

* any list
{:toc}  