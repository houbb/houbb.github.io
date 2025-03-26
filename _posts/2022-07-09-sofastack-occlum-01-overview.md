---
layout: post
title: Occlum 是一个内存安全的、支持多进程的 library OS，特别适用于 Intel SGX。
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, test, sh]
published: true
---

## 前言

大家好，我是老马。

sofastack 其实出来很久了，第一次应该是在 2022 年左右开始关注，但是一直没有深入研究。

最近想学习一下 SOFA 对于生态的设计和思考。

## sofaboot 系列

[SOFABoot-00-sofaboot 概览](https://houbb.github.io/2022/07/09/sofastack-sofaboot-00-overview)

[SOFABoot-01-蚂蚁金服开源的 sofaboot 是什么黑科技？](https://houbb.github.io/2022/07/09/sofastack-sofaboot-01-intro)

[SOFABoot-02-模块化隔离方案](https://houbb.github.io/2022/07/09/sofastack-sofaboot-02-module-iosolation)

[SOFABoot-03-sofaboot 介绍](https://houbb.github.io/2022/07/09/sofastack-sofaboot-03-intro)

[SOFABoot-04-快速开始](https://houbb.github.io/2022/07/09/sofastack-sofaboot-04-quick-start)

[SOFABoot-05-依赖管理](https://houbb.github.io/2022/07/09/sofastack-sofaboot-05-depency-solve)

[SOFABoot-06-健康检查](https://houbb.github.io/2022/07/09/sofastack-sofaboot-06-health-check)

[SOFABoot-07-版本查看](https://houbb.github.io/2022/07/09/sofastack-sofaboot-07-version)

[SOFABoot-08-启动加速](https://houbb.github.io/2022/07/09/sofastack-sofaboot-08-speed-up)

[SOFABoot-09-模块隔离](https://houbb.github.io/2022/07/09/sofastack-sofaboot-09-module-isolation)

[SOFABoot-10-聊一聊 sofatboot 的十个问题](https://houbb.github.io/2022/07/09/sofastack-sofaboot-10-chat-10-q)

# Occlum

**最新动态：** 我们的论文《Occlum：英特尔SGX单个飞地内安全高效的多任务处理》已被[ASPLOS'20](https://asplos-conference.org/programs/)接收。该研究论文重点阐述了Occlum采用单地址空间架构的优势，并描述了一种新颖的飞地内隔离机制以补充这一设计。

论文可在[ACM数字图书馆](https://dl.acm.org/doi/abs/10.1145/3373376.3378469)和[Arxiv](https://arxiv.org/abs/2001.07450)查阅。

Occlum是一个专为[英特尔SGX](https://software.intel.com/en-us/sgx)设计的**内存安全**、**多进程**库操作系统（LibOS）。

作为LibOS，它能让**传统应用程序**在SGX上运行而**几乎无需修改源代码**，从而透明地保护用户工作负载的机密性与完整性。

Occlum具备以下显著特性：

  * **高效多任务处理。** Occlum提供**轻量级**LibOS进程：所有LibOS进程共享同一个SGX飞地，相较于重量级的单飞地LibOS进程，Occlum的轻量级LibOS进程启动速度**快达1000倍**，IPC性能**快达3倍**。此外，Occlum还提供可选的[**PKU**](./docs/pku_manual.md)（用户空间保护密钥）功能，以增强LibOS与用户空间进程间的故障隔离（按需启用）。
  * **多文件系统支持。** Occlum支持多种文件系统类型，如**只读哈希FS**（完整性保护）、**可写加密FS**（机密性保护）、**非受信主机FS**（便于LibOS与宿主机OS间数据交换）。
  * **内存安全。** Occlum是**首个**采用内存安全编程语言（[Rust](https://www.rust-lang.org/)）编写的SGX LibOS，极大减少了底层内存安全漏洞的可能性，更值得托管安全关键型应用。
  * **易用性。** Occlum提供用户友好的构建与命令行工具。在SGX飞地内运行应用程序，仅需数条Shell命令即可完成（参见下一章节）。

自0.30.0版本起，Occlum引入EDMM作为可选功能。借助EDMM，Occlum配置更灵活，飞地加载时间显著缩短。详情请参阅[edmm_config_guide](./docs/edmm/edmm_config_guide.md)。

## Occlum文档

官方文档请访问[`https://occlum.readthedocs.io`](https://occlum.readthedocs.io)。

以下为快速链接：

* [`快速入门`](https://occlum.readthedocs.io/en/latest/quickstart.html#)
* [`构建与安装`](https://occlum.readthedocs.io/en/latest/build_and_install.html#)
* [`Occlum配置`](https://occlum.readthedocs.io/en/latest/occlum_configuration.html)
* [`Occlum兼容可执行二进制文件`](https://occlum.readthedocs.io/en/latest/binaries_compatibility.html)
* [`演示案例`](https://occlum.readthedocs.io/en/latest/Demos/demos.html)
* [`常见问题`](https://occlum.readthedocs.io/en/latest/qa.html)

## 当前实现状态如何？

Occlum正处于积极开发阶段。当前重点在于实现更多系统调用及生产环境所需功能，包括裸金属服务器与公有云（阿里云、Azure等）虚拟机支持。

此外，专用分支**1.0.0-preview**用于下一代Occlum开发。

## 内部工作原理？

Occlum的高层架构如下图所示：

![架构概览](https://github.com/occlum/occlum/blob/master/docs/images/arch_overview.png)

## 项目命名由来？

Occlum之名源自J.K.罗琳在《哈利·波特》系列中创造的咒语**Occlumency**（大脑封闭术）。在《哈利·波特与凤凰社》中，该咒语被描述为：

> 一种抵御外部入侵的心灵魔法防御术。虽属冷门分支，却极为实用……正确使用大脑封闭术，可助你屏蔽他人窥探或影响。

Occlum对程序而言亦有异曲同工之妙：

> 一种抵御外部入侵的程序魔法防御术。虽属前沿技术分支，却极为实用……正确使用Occlum，可助你守护程序免受访问或干扰。

当然，Occlum需运行于支持SGX的英特尔x86 CPU上方能施展其"魔法"。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

https://github.com/occlum/occlum

* any list
{:toc}