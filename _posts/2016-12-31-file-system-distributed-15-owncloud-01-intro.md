---
layout: post
title: 分布式存储系统-15-nextcloud 文件共享和协作服务-01-intro 入门介绍
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, dfs, file]
published: true
---


# ownCloud 核心

**[ownCloud](http://ownCloud.com) 提供了全球超过2亿用户信赖的文件共享和协作服务，无论设备或位置如何。**

![](https://github.com/owncloud/screenshots/blob/master/files/sidebar_1.png) 

## 为什么这么棒？

* :file_folder: **访问你的数据** 你可以在任何你选择的服务器上存储文件、联系人、日历等。
* :package: **同步你的数据** 你可以在设备之间保持文件、联系人、日历等的同步。
* :arrows_counterclockwise: **分享你的数据** 你可以与他人分享数据，并让他们访问你最新的照片画廊、日历或任何其他你希望他们看到的内容。
* :rocket: **可通过数十个应用扩展** ……比如日历、联系人、邮件或新闻。
* :cloud: **云的所有好处** ……都在你自己的服务器上。
* :lock: **加密** 你可以使用安全的https连接加密传输中的数据。你可以启用加密应用来加密存储中的数据，以提高安全性和隐私保护。
* ...

## 安装说明

有关安装ownCloud的说明，请参见官方
[ownCloud 10](https://doc.owncloud.com/server/latest/admin_manual/installation/) 安装手册。

## 开发构建先决条件
请注意，当进行本地开发构建时，你需要安装 **Composer v2**。如果你的操作系统提供的版本低于v2，你可以手动安装Composer v2。例如，可能也适用于其他版本/发行版的，参见[如何在Ubuntu 22.04 | 20.04 LTS上安装Composer](https://www.how2shout.com/linux/how-to-install-composer-on-ubuntu-22-04-20-04-lts/)。

你还必须安装了 `yarn` 和 `node`（版本14或更高）。

## 贡献指南
https://owncloud.com/contribute/ 

## 提交信息
为了简化将提交带入上下文，CI作业检查提交信息是否满足为提交信息添加人类和机器可读意义的规范。详情参见：[Conventional Commits](www.conventionalcommits.org/)。请注意，如果不满足常规提交，CI将不会是绿色的。在这种情况下，你需要重写git提交历史以满足要求。

你至少必须提供一个 `type` + `description`，如[示例](https://www.conventionalcommits.org/en/v1.0.0/#examples)部分所述。

快速开始，可以使用以下类型：

`fix:`, `feat:`, `build:`, `chore:`, `ci:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`

## 支持
了解你可以获得ownCloud支持的不同方式：https://owncloud.com/support/ 

## 联系方式
* :clipboard: [论坛](https://central.owncloud.org) 
* :hash: [IRC频道](https://web.libera.chat/?channels=#owncloud) 
* :busts_in_silhouette: [Facebook](https://facebook.com/ownclouders) 
* :hatching_chick: [Twitter](https://twitter.com/ownCloud) 

## 关于翻译的重要通知

请通过Transifex提交翻译：

https://explore.transifex.com/owncloud-org/ 

有关[翻译](https://doc.owncloud.com/server/latest/developer_manual/core/translation.html)的详细信息请参阅此处。

# 参考资料

https://github.com/owncloud/core/blob/master/README.md

* any list
{:toc}