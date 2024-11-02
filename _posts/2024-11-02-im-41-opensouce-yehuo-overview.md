---
layout: post
title: IM 即时通讯系统-41-开源 野火IM 专注于即时通讯实时音视频技术，提供优质可控的IM+RTC能力
date: 2024-11-02 21:01:55 +0800
categories: [IM]
tags: [im, opensource, sh]
published: true
---


# 野火IM解决方案

野火IM是专业级的即时通讯和实时音视频整体解决方案，由北京野火无限网络科技有限公司维护和支持。

## 功能特性
* 极致地硬件利用率，IM服务最低128M内存即可运行，上不封顶。
* 协议先进，采用MQTT+Protobuf组合，流量和性能极致优化。
* 性能强大，专业版IM服务支持百万在线和集群部署，业内顶尖性能水平，详情参考野火性能报告。
* 部署运维简单，依赖服务少，稍加配置一键启动。
* 安全加密。网络连接AES加密。客户端数据库SqlCipher加密。安全无小事。
* 全平台客户端，支持Android、iOS、鸿蒙、Web、小程序、UniApp、Flutter、Windows、Mac OS、Linux等所有常见平台。
* 四端同时在线（移动端，pc端，web端和小程序端），数据和状态多端完美同步。
* 支持国产化。支持国产化操作系统、国产化芯片和国产数据库。支持国密加密。
* 客户端使用微信[mars](https://github.com/tencent/mars)连接库，野火IM可能是最适应中国网络国情的即时通讯服务。
* 支持加速点加速，即可用于全球应用，也可用于政企内外双网复杂的网络环境。
* 支持阅读回执和在线状态功能，适用于办公环境。
* 音视频多种解决方案，丰俭由人，可自由选择。
* 高级音视频功能强大，支持9人以上的群组视频通话，支持1080P视频，支持会议模式，支持百人以上会议，支持服务器端录制。
* 全私有部署，可不依赖任何第三方服务，完全内网部署。
* 功能齐全，涵盖所有常见即时通讯功能。另外具有强大的可扩展能力。代码开源率高，二次开发简单。
* 结构设计合理，客户端分功能库、UI库和应用三层。应用成熟完善，开箱即用，也可把SDK嵌入其它应用。
* 拥有应用开放平台，可以开发和创建自建应用，扩展您的工作台。
* API丰富，方便与其它服务系统的对接。
* 拥有机器人和公众号功能，免费的频道（公众号）管理后台。
* 超级群组功能，可以支持万人大群。
* 支持多个IM服务组网互通，打破孤岛，适用于集团公司下多个分公司互联互通。
* 社区版IM服务和移动端免费商用，可以免费构建出完备的移动互联网应用。
* 收费项目非常便宜，野火独有的试用模式，可以先部署到客户环境试用6个月，试用满意后再购买，避免上当受骗。
* 技术支持专业高效，***核心研发***及时处理issue和工单，能最快解决用户的技术难题。技术支持不收费，让客户顺利使用是我们最大的愿望。

## 野火开源项目
主要包括以下项目：

| [GitHub仓库](https://github.com/wildfirechat)      | [码云仓库](https://gitee.com/wfchat)        | 说明                                                                                      
| ------------------------------------------------------------ | ----------------------------------------------------- | --------------------------------------------------------------------------
| [im-server](https://github.com/wildfirechat/im-server)       | [im-server](https://gitee.com/wfchat/im-server)          | 野火社区版IM服务，野火IM的核心服务，处理所有IM相关业务。  |
| [app-server](https://github.com/wildfirechat/app-server)     | [app-server](https://gitee.com/wfchat/app-server)     | Demo应用服务，模拟客户的应用服登陆处理逻辑及部分二次开发示例。 |
| [robot_server](https://github.com/wildfirechat/robot_server) | [robot_server](https://gitee.com/wfchat/robot_server) | 机器人服务，演示野火机器人对接其它系统的方法。 |
| [push_server](https://github.com/wildfirechat/push_server)   | [push_server](https://gitee.com/wfchat/push_server)   | 推送服务器，可以对接所有的系统厂商推送服务或者第三方推送服务。 |
| [wf-minio](https://github.com/wildfirechat/WF-minio)   | [wf-minio](https://gitee.com/wfchat/WF-minio)   | 私有对象存储服务，用来支持野火IM专业版的文件存储。 |
| [wf-janus](https://github.com/wildfirechat/wf-janus  )   | [wf-janus](https://gitee.com/wfchat/wf-janus  )   | 高级音视频媒体服务。 |
| [open-platform](https://github.com/wildfirechat/open-platform)   | [open-platform](https://gitee.com/wfchat/open-platform)   | 野火开放平台服务。  |
| [daily-report](https://github.com/wildfirechat/daily-report)   | [daily-report](https://github.com/wildfirechat/daily-report)   | 野火开放平台日报 demo服务。 |
| [channel-platform](https://github.com/wildfirechat/channel-platform)   | [channel-platform](https://gitee.com/wfchat/channel-platform)   | 野火频道(公众号)平台服务。  |
| [organization-platform](https://github.com/wildfirechat/organization-platform)   | [organization-platform](https://gitee.com/wfchat/organization-platform)   | 野火组织通讯录服务。  |
| [android-chat](https://github.com/wildfirechat/android-chat) | [android-chat](https://gitee.com/wfchat/android-chat) | 野火IM Android SDK源码和App源码。 |
| [ios-chat](https://github.com/wildfirechat/ios-chat)         | [ios-chat](https://gitee.com/wfchat/ios-chat)         | 野火IM iOS SDK源码和App源码。|
| [pc-chat](https://github.com/wildfirechat/vue-pc-chat)       | [pc-chat](https://gitee.com/wfchat/vue-pc-chat)       | 基于[Electron](https://electronjs.org/)的PC 端，支持Windows、Mac、Linux（包括国产化linux系统和CPU）。   |
| [web-chat](https://github.com/wildfirechat/vue-chat)         | [web-chat](https://gitee.com/wfchat/vue-chat)         | 野火IM Web 端, [体验地址](https://web.wildfirechat.cn)。  |
| [wx-chat](https://github.com/wildfirechat/wx-chat)           | [wx-chat](https://gitee.com/wfchat/wx-chat)           | 小程序平台的Demo(支持微信、百度、阿里、字节、QQ 等小程序平台)。  |
| [uni-chat](https://github.com/wildfirechat/uni-chat)           | [uni-chat](https://gitee.com/wfchat/uni-chat)           | UniApp平台移动端应用(使用原生插件)。   |
| [uni-wfc-client](https://github.com/wildfirechat/uni-wfc-client)           | [uni-wfc-client](https://gitee.com/wfchat/uni-wfc-client)           | UniApp平台原生插件。已[商店](https://ext.dcloud.net.cn/plugin?id=7895)上架   |
| [wfc_flutter_plugins](https://github.com/wildfirechat/wfc_flutter_plugins)           | [flutter_imclient](https://gitee.com/wfchat/wfc_flutter_plugins)           | Flutter平台原生插件，支持IM和音视频通话。   |
| [docs](https://github.com/wildfirechat/docs)                 | [docs](https://gitee.com/wfchat/docs)                 | 野火IM相关文档，包含设计、概念、开发、使用说明，[在线查看](https://docs.wildfirechat.cn/)。 |

## 野火开发文档

[在线文档](https://docs.wildfirechat.cn/)

## 野火IM论坛
[野火IM论坛](https://bbs.wildfirechat.cn)

## 野火性能测试报告及测试方法
[Github](https://github.com/wildfirechat/Performance_Test), [码云](https://gitee.com/wfchat/Performance_Test)。

## 野火Demo
请使用微信扫码下载安装体验野火IM移动客户端

![野火IM](http://static.wildfirechat.cn/download_qrcode.png)

Web客户端点击[这里](https://web.wildfirechat.cn)

PC客户端点[这里](https://github.com/wildfirechat/vue-pc-chat/releases)下载安装。

小程序客户端请用微信扫码

![野火IM](http://static.wildfirechat.net/wx.jpg)

## 快速开始
可以按照[快速开始](https://docs.wildfirechat.cn/quick_start/)来部署应用服务和IM服务，然后打包移动端，就可以完成聊天和通话功能。

之后再部署开放平台服务、频道（公众号）服务、机器人服务、推送服务、Turn服务（音视频服务）来实现完整的应用功能，详情可以详细阅读文档。

# 参考资料

* any list
{:toc}