---
layout: post
title: IM 即时通讯系统-43-简单的仿QQ聊天安卓APP
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

[简单的仿QQ聊天安卓APP](https://github.com/xiuweikang/IM)

该项目用JAVA的socket实现，包含客户端，服务器与数据库，如果想运行需要注意一下几点：

 1. 服务器更改配置文件dbcpconfig.properties

 2. 我已经将所需的依赖库也上传了，如果还缺少某些依赖库，需要你自己去下

 3. 注意客户端的端口号应与服务器的端口号一致。

 4. 客户端出现服务器异常时，请注意客户端的SERVER_IP，需要保证客户端ping通服务器
 
### 运行效果图：

![image](https://github.com/xiuweikang/IM/raw/master/screenshot/login.png)

![image](https://github.com/xiuweikang/IM/raw/master/screenshot/register1.png)

![image](https://github.com/xiuweikang/IM/raw/master/screenshot/register2.png)

![image](https://github.com/xiuweikang/IM/raw/master/screenshot/search.png)

![image](https://github.com/xiuweikang/IM/raw/master/screenshot/messageTab.png)

![image](https://github.com/xiuweikang/IM/raw/master/screenshot/chat.png)

##该APP的部分UI参考网上流传的高仿陌陌,在此表示感谢。

# 参考资料

* any list
{:toc}