---
layout: post
title: IM 即时通讯系统-44-仿QQ即时通讯系统服务端
date: 2024-11-02 21:01:55 +0800
categories: [IM]
tags: [im, opensource, sh]
published: true
---

# IM 开源系列

[IM 即时通讯系统-41-开源 野火IM 专注于即时通讯实时音视频技术，提供优质可控的IM+RTC能力](https://houbb.github.io/2024/11/02/im-41-opensouce-yehuo-overview)

[IM 即时通讯系统-42-基于netty实现的IM服务端,提供客户端jar包,可集成自己的登录系统](https://houbb.github.io/2024/11/02/im-42-opensouce-yuanrw-im-intro)

[IM 即时通讯系统-43-简单的仿QQ聊天安卓APP](https://houbb.github.io/2024/11/02/im-43-opensouce-xiuweikang-im)

[IM 即时通讯系统-44-仿QQ即时通讯系统服务端](https://houbb.github.io/2024/11/02/im-44-opensouce-kingston-csj-im)

[IM 即时通讯系统-45-merua0oo0 IM 分布式聊天系统](https://houbb.github.io/2024/11/02/im-45-opensouce-merua0oo0-im)

[IM 即时通讯系统-46-OpenIM 提供了专为开发者设计的开源即时通讯解决方案](https://houbb.github.io/2024/11/02/im-46-opensouce-open-im-intro)

[IM 即时通讯系统-47-beardlessCat IM 使用netty开发分布式Im，提供分布netty集群解决方案](https://houbb.github.io/2024/11/02/im-47-opensouce-beardlessCat-im-intro)

[IM 即时通讯系统-48-aurora-imui 是个通用的即时通讯（IM）UI 库，不特定于任何 IM SDK](https://houbb.github.io/2024/11/02/im-48-opensouce-aurora-imui-intro)

[IM 即时通讯系统-49-云信 IM UIKit 是基于 NIM SDK（网易云信 IM SDK）开发的一款即时通讯 UI 组件库，包括聊天、会话、圈组、搜索、群管理等组件](https://houbb.github.io/2024/11/02/im-49-opensouce-nim-uikit-android-intro)

[IM 即时通讯系统-50-📲cim(cross IM) 适用于开发者的分布式即时通讯系统](https://houbb.github.io/2024/11/02/im-50-opensouce-cim-intro)

[IM 即时通讯系统-51-MPush开源实时消息推送系统](https://houbb.github.io/2024/11/02/im-51-opensouce-mpush-intro)

[IM 即时通讯系统-52-leo-im 服务端](https://houbb.github.io/2024/11/02/im-52-opensouce-leo-im-intro)

[IM 即时通讯系统-53-im system server](https://houbb.github.io/2024/11/02/im-53-opensouce-linyu-intro)


# IM

https://github.com/kingston-csj/im

## im(仿QQ聊天室服务端)
### 主要使用的第三方技术  
*  Netty，通信网关  
*  spring，作为IOC容器  
*  MyBatics，作为持久化方案  

### 功能列表  
*  用户注册/登录/好友列表/私聊界面(包括用户界面)  
*  通过http后台请求管理服务进程  
*  用户数据的持久化  
*  使用独立线程池处理用户消息 　

### ToDoList  
*  使用SpringCloud打造为分布式系统   
*  在线/离线文件传输   
*  异步处理用户数据的持久化  
*  开发更多的交互功能        

### QuickStart  
1. 安装git后，使用命令 git clone https://github.com/kingston-csj/im 
2. 新建数据库im，导入im-chat/src/test/resources目录下的chat_room.sql   
3. 在applicationContext.xml文件配置本地数据库连接属性，启动ServerStartup
4. 另起新目录，下载客户端代码 git clone https://github.com/kingston-csj/wechat
5. 启动ClientStartup类, 即可看到登录界面（临时密码为000）  
   (多人聊天，需要开启多个ClientStartup客户端即可)

### 部分客户端运行效果

登录界面  

![登录界面](https://github.com/kingston-csj/im/raw/master/screenshots/login.png)  

主界面  

![主界面](https://github.com/kingston-csj/im/raw/master/screenshots/main.png)  
　　
### 案例教程 

栏目教程 --> [csdn专栏博客](https://blog.csdn.net/littleschemer/article/category/9269527)  

wiki说明 --> [wiki](https://github.com/kingston-csj/im/wiki)
 
### 客户端源代码  

--> [客户端wechat](https://github.com/kingston-csj/wechat)

# 参考资料

* any list
{:toc}