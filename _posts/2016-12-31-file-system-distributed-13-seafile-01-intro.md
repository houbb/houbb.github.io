---
layout: post
title: 分布式存储系统-13-Seafile是一个具有隐私保护和团队协作功能的开源云存储系统-01-intro 入门介绍
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, dfs, file]
published: true
---



## 介绍 

Seafile是一个具有隐私保护和团队协作功能的开源云存储系统。

文件集合被称为库（libraries）。

每个库可以单独同步。

库也可以使用用户选择的密码进行加密。

Seafile还允许用户创建群组，并轻松地在群组中共享文件。

## 功能概要

Seafile具有以下功能：

### 文件同步

1. 任意文件夹的选择性同步。
2. 基于历史记录而非时间戳正确处理文件冲突。
3. 仅将内容差异传输到服务器。中断的传输可以恢复。
4. 与两个或更多服务器同步。
5. 与现有文件夹同步。

### 文件共享和协作

1. 在用户之间或群组中共享文件夹。
2. 带密码保护的下载链接。
3. 上传链接。
4. 版本控制。

### 驱动客户端

* 通过虚拟驱动器访问云中的所有文件。
* 按需同步文件。

### 隐私保护

1. 使用用户选择的密码对库进行加密。
2. 使用桌面同步时进行客户端加密。

### 在线文档和知识管理（新）

* 以所见即所得的方式在线编辑Markdown。
* 在线文档的草稿审核工作流程。
* 元数据管理，包括：
  * 文件标签
  * 相关文档
* 维基模式
* 实时通知

## Seafile组件的源代码仓库

Seafile的每个组件都有自己的GitHub源代码仓库。

* 同步客户端守护进程（此仓库）：[https://github.com/haiwen/seafile](https://github.com/haiwen/seafile) 
* 同步客户端GUI：[https://github.com/haiwen/seafile-client](https://github.com/haiwen/seafile-client) 
* 服务器核心：[https://github.com/haiwen/seafile-server](https://github.com/haiwen/seafile-server) 
* 服务器Web UI：[https://github.com/haiwen/seahub](https://github.com/haiwen/seahub) 
* iOS应用：[https://github.com/haiwen/seafile-iOS](https://github.com/haiwen/seafile-iOS) 
* Android应用：[https://github.com/haiwen/seadroid](https://github.com/haiwen/seadroid) 
* WebDAV：[https://github.com/haiwen/seafdav](https://github.com/haiwen/seafdav) 

在6.0版本之前，“同步客户端守护进程”和“服务器核心”的源代码混合在一起：[https://github.com/haiwen/seafile](https://github.com/haiwen/seafile)。
但在6.0版本之后，服务器核心被分离到自己的仓库中。
因此，同步客户端守护进程仓库仍然是GitHub上Seafile项目的“首页”。

构建和运行
=============

参见 <https://manual.seafile.com/build_seafile/server> 

Bug和功能请求报告
===============================

请仅在GitHub问题中提交错误报告（Pro客户应通过电子邮件与我们联系）：

* 服务器、Web界面（Seahub）和桌面客户端：[https://github.com/haiwen/seafile/issues](https://github.com/haiwen/seafile/issues) 
* Android客户端：[https://github.com/haiwen/seadroid/issues](https://github.com/haiwen/seadroid/issues) 
* iOS客户端：[https://github.com/haiwen/seafile-iOS/issues](https://github.com/haiwen/seafile-iOS/issues) 

功能请求可以在论坛上提出，安装/使用问题也可以在论坛上讨论：[https://forum.seafile.com/](https://forum.seafile.com/)。

国际化（I18n）
===========================

* [翻译Seafile Web UI](https://github.com/haiwen/seahub/?tab=readme-ov-file#internationalization-i18n) 
* [翻译Seafile桌面客户端](https://github.com/haiwen/seafile-client/#internationalization) 
* [翻译Seafile Android应用](https://github.com/haiwen/seadroid#internationalization) 
* [翻译Seafile iOS应用](https://github.com/haiwen/seafile-ios#internationalization-i18n) 

更新日志
===========

参见 <https://manual.seafile.com/changelog/server-changelog/> 

为什么选择开源
===============

我们的主要目标是打造一款一流的产品。我们认为这个目标只有通过与全世界的合作才能实现。

贡献
===========

更多信息请阅读[贡献](https://manual.seafile.com/contribution/)。

许可证
=======

- Seafile iOS客户端：Apache许可证 v2
- Seafile Android客户端：GPLv3
- 桌面同步客户端（此仓库）：GPLv2
- Seafile服务器核心：AGPLv3
- Seahub（Seafile服务器Web UI）：Apache许可证 v2

联系方式
=======

Twitter：@seafile <https://twitter.com/seafile> 

论坛：[https://forum.seafile.com](https://forum.seafile.com)

# 参考资料

https://github.com/haiwen/seafile

* any list
{:toc}