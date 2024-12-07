---
layout: post
title: SSO open-source 开源项目-01-kawhii sso cas单点登录系统，其中包括cas认证服务，配置中心，监控平台，服务管理的高可用项目
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

# sso

https://github.com/kawhii/sso

cas单点登录系统，其中包括cas认证服务，配置中心，监控平台，服务管理的高可用项目


打造一个单点登录平台，其中包括以下子系统

* CAS SERVER
* 配置中心
* 服务管理系统
* 监控平台
* 客户端集成(cas client、pac4j、shiro)

# 特性

* Docker快速启动
* GitHub授权登录
* Cas Clint、Shiro Pac4j Client集成
* jdbc用户密码加密
* 自定义主题
* 配置统一管理
* 根据官网5.1.x新版本迭代
* 各阶段发布博客教程
* 密码管理
* 一键启动
* 第三方登录接入(QQ,WeChat,CSDN,GitHub)
* 绑定用户
* 验证码输出
* 自定义校验器
* 多属性返回
* 验证码发送、校验（注册发送邮箱验证码）
* 服务监控检测
* 校验码登录
* 单用户登录

## Tutorial: 

[![Csdn Blog Tutorial](https://img.shields.io/badge/csdn%20blog-tutorial-orange.svg)](http://blog.csdn.net/u010475041/article/category/7156505)

* [Blog](http://blog.csdn.net/u010475041/article/category/7156505)
* [Support](https://github.com/kawhii/sso/wiki)

域名：localhost

用户：

| 用户名 |密码|是否可登录|备注|
|:-------|:-------|:-------|:-------|
|admin|123|√||
|zhangsan|12345678|√||
|zhaosi|1234|×|禁用|
|wangwu|12345|√|需修改密码|


---

### [Docker 快速启动](https://hub.docker.com/r/kawhii/sso/)

*目前仅部署了配置中心及cas服务到docker环境中*

```cmd
docker run -d --restart=always  -p 8443:8443 kawhii/sso
```

若采用docker启动，访问为：http://dockerip:8443/cas


### 注意
* 由于修改密码功能目前是发送到笔者的邮箱，若调整，需要修改`sso-server/src/main/resources/profile/dev/sql/data-dev.sql`
* 密码修改功能可以关闭问题回答功能

## 模块介绍


| 模块名 |模块介绍|端口情况|必须https|path|启动循序
|:-------|:-------|:----|:-------|:-----|:--|
|sso-server|cas服务|8443|√|cas|2|
|sso-config|配置中心|8888|×|config|1|
|sso-management|service管理|8081|×|cas-management|3|
|sso-cas-client-demo|cas-client-demo|8080|×|/sample|4|
|sso-client-shiro-demo|shiro-client-demo|8083|×|/|5|
|sso-client-proxy-demo|OAuth2代理转发客户端|8808|×|/|6|
|sso-monitor|监控服务|8444|×|/|7|

* jdk8
* maven3

### 帮助

```cmd
build.cmd help
```

输出以下帮助信息

```cmd
"Usage: build.bat [help|sso-server|sso-management|sso-config|cas-client-demo|shiro-client-demo|run-all|hosts]"
1. sso-config: Config Server
2. sso-server: CAS Server
3. sso-management: Cas Management
4. cas-client-demo: CasClient Demo
5. shiro-client-demo: ShiroDemo
6. run: Run all server
7. init: set '127.0.0.1 passport.sso.cm' to HOSTS, import cert to D:\soft\work\java\jdk1.8-144\jre\lib\security\cacerts
```

### 初始化

<!--
1. 负责把`passport.sso.com`设置到host文件
2. 把域名自签名证书导入到java环境（提示信息，第一个需要输入密码为**123456**，第二个导入密码为**changeit**）
 -->

```cmd
build.cmd init
```

### 启动服务

> 由于启动服务多，开始占用CPU、内容稍高

```cmd
build.cmd run
```


* sso-config [配置中心](http://localhost:8888/config)
* sso-server [单点登录服务](http://localhost:8443/cas)
* cas-client-demo [cas客户端](http://localhost:8080/sample)
* shiro-client-demo [shiro客户端](http://localhost:8083)
* sso-management [服务管理客户端](http://localhost:8081/cas-management)
* sso-monitor [服务监控](http://localhost:8444)

```cmd
#server-id 为上面的各服务名称，
#如启动sso-management为，build.cmd sso-management

build.cmd [server-id]
```

# 参考资料

* any list
{:toc}  