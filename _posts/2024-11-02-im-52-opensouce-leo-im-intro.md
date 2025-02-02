---
layout: post
title: IM 即时通讯系统-52-leo-im 服务端
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

https://github.com/lining90567/leo-im-server


# Leo-IM

![Leo-IM](https://raw.githubusercontent.com/wiki/lining90567/leo-im-server/leo-im.png)

Leo-IM，开源好用的IM。

Leo-IM是基于Java语言、Netty框架、Vue+Element-UI开发的轻量级IM，服务端可独立运行（无需部署到web容器），HTTP服务和Socket服务可分开部署，使用基于Netty扩展的[netty-rest-server](https://github.com/lining90567/netty-rest-server)RESTful框架提供Web服务，简单易用，方便扩展。

## 在线演示

演示地址：<a href="http://43.138.44.47:8000" target="_blank">http://43.138.44.47:8000</a>

建议使用Chrome浏览器

- 演示用户1：用户名 test1，口令 123456
- 演示用户2：用户名 test2，口令 123456
- 演示用户3：用户名 test3，口令 123456

## 运行环境要求

- 服务端：Java8、MySQL5.5+
- 客户端：Chrome、IE10+

## 主要功能

- 私聊
- 群聊
- 文字、表情、图片、文件

## 构建与部署

- 安装netty-rest-server到本地仓库

	mvn install:install-file -Dfile=netty-rest-server-1.0.jar -DgroupId=org.leo -DartifactId=netty-rest-server -Dversion=1.0 -Dpackaging=jar

- 创建数据库，并设置字符集（my.cnf或my.ini）

	[client]
	
	default-character-set=utf8mb4

	[mysqld]
	
	character-set-client-handshake = FALSE

	character-set-server = utf8mb4

	collation-server = utf8mb4_unicode_ci

	init_connect=’SET NAMES utf8mb4'

	[mysql]
	
	default-character-set=utf8mb4

- 构建

	mvn package

- 部署

	解压leo-im-1.0.zip，修改conf/app.conf的相关配置

- 启动

	nohup bin/run.sh >/dev/null 2>&1 &
	
- Web端代码
	
	<a href="http://43.138.44.47:8000" target="_blank">https://github.com/lining90567/leo-im-web</a>
	
## 联系方式
- **邮箱** - lining90567@sina.com
- **QQ** - 328616209


# 参考资料

* any list
{:toc}