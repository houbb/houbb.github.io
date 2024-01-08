---
layout: post
title:  BI 可视化工具-02-Datart is a next generation Data Visualization Open Platform
date:  2021-1-25 16:52:15 +0800
categories: [BI]
tags: [bi, apache, database, sh]
published: true
---

# Datart


新一代数据可视化开放平台，支持报表、仪表板、大屏、分析和可视化数据应用的敏捷构建。

## What is datart?

datart 是新一代数据可视化开放平台，支持各类企业数据可视化场景需求，如创建和使用报表、仪表板和大屏，进行可视化数据分析，构建可视化数据应用等。

由原 davinci 主创团队出品，datart 更加开放、可塑和智能，并在数据与艺术之间寻求最佳平衡。

## 设计理念 Design Philosophy

### 开放 Openness

BI产品作为标准化产品成熟度已经很高，但大多数BI产品为封闭系统，即用户只能使用BI产品内置提供的数据源、数据图表、可视化元素等。我们认为数据可视化平台可以在其系统边界范围内，在多个层面提供开放可扩展能力，新的扩展支持可以通过即插即用方式安装、更新或卸载。因此 datart 试图建立起一套标准化的 数据可视化开放平台 体系，标准化和开放性体现在以下方面：

流程标准化：基于 Source > View > Chart > Visualization 建立 受管控的数据可视化应用 （Managed VizApp）开发、发布和使用的标准化流程
交互标准化：Visualization 支持权限可控的标准化交互能力，如筛选、钻取、联动、跳转、弹窗、分享、下载、发送等
插件标准化：在 Source、Chart、Visualization 层提供标准化可插拔扩展接口或SDK规范，支持开放扩展或按需定制

### 可塑 Integrability

datart 可作为独立平台使用，但不仅限于此，为了更好支持快速构建定制化数据应用系统，datart 可以很容易被整合、被内嵌至其他三方系统，承担数据可视化部分功能。通过 datart 的登录对接能力、权限对接能力、Source 层对接能力和 Visualization 层分享、SDK等能力，用户可以基于 datart 平台对接或二开以快速满足业务系统定制化需求。

### 智能 Augmented Analytics

传统BI产品只能对已有数据进行勘察，而现代BI产品更加重视对数据延展洞见，以形成完整数据分析洞察能力，或增强分析能力。

datart 会在平台层面提供可扩展数据增强分析能力，基于数据通过可视化方式不仅回答 What，并且可以回答 Why。

## 功能特性 Features

![Features](https://camo.githubusercontent.com/09bc2b126e5de4dd07463bf9c8cd6e23e645b87c3c9553fe6ee96d6049e677a5/68747470733a2f2f72756e6e696e672d656c657068616e742e6769746875622e696f2f6461746172742d646f63732f696d616765732f61626f75742f6461746172742d76732d646176696e63692e706e67)

## 在线体验 Demo

http://datart-demo.retech.cc

用户名：demo

密码：123456

# 架构模块 Architecture

![struct](https://camo.githubusercontent.com/45b058d51af77d62447dea387ed007c2f8e794f043f1db244981ec5bb6d19a3e/68747470733a2f2f72756e6e696e672d656c657068616e742e6769746875622e696f2f6461746172742d646f63732f696d616765732f61626f75742f6172636869746563747572652e706e67)

# 快速开始

> [快速开始](https://running-elephant.github.io/datart-docs/docs/first-visualization.html)

# 参考资料

https://github.com/running-elephant/datart

https://mp.weixin.qq.com/s/luqCxsEcxJrYXqkFoR-iqQ

https://github.com/running-elephant/datart/blob/master/Deployment.md

* any list
{:toc}