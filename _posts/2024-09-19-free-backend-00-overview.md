---
layout: post
title: 免费的后端服务器？概览
date: 2024-09-19 21:01:55 +0800
categories: [Cloud]
tags: [cloud, deploy, sh]
published: true
---

# chat

## 有没有可以免费部署后端服务的云服务器？

是的，有几种提供免费计划的云服务器平台，适合用来部署后端服务。以下是一些主要选项：

### 1. **Heroku**
- **免费计划**：Heroku 提供了一个免费的计划，允许你部署和管理应用程序。虽然免费计划有一些限制，比如每月有限的运行时间和休眠策略，但对于轻量级的应用程序和开发环境来说，它是一个不错的选择。
- **特点**：支持多种编程语言（如 Node.js、Python、Ruby、Java），提供易于使用的 CLI 和 web 界面，内置数据库和插件支持。

### 2. **Vercel**
- **免费计划**：虽然 Vercel 主要用于前端部署，但它的无服务器函数也可以用作后端服务。免费计划允许你使用一定数量的无服务器函数和其他资源。
- **特点**：自动化部署、全球 CDN、集成 GitHub/GitLab/Bitbucket，适合前后端集成的应用。

### 3. **Netlify**
- **免费计划**：Netlify 提供了免费的部署计划，支持静态网站和无服务器函数（Netlify Functions）。免费计划适合小型项目和开发测试环境。
- **特点**：简单的部署流程、集成 Git、支持无服务器函数和持续集成。

### 4. **Glitch**
- **免费计划**：Glitch 提供了一个免费的计划，用于创建和部署 Node.js 应用程序。它适合用作开发和测试环境。
- **特点**：实时协作编辑、自动部署、简单的界面和开发工具。

### 5. **Render**
- **免费计划**：Render 提供免费的计划，支持部署静态网站、Web 服务和无服务器功能。免费计划有资源限制，但足够用于轻量级的项目。
- **特点**：支持多种编程语言、自动部署、SSL 和自定义域名。

### 6. **Fly.io**
- **免费计划**：Fly.io 提供免费的计划，用于部署和运行分布式应用程序。它允许在多个数据中心部署应用以提供更好的全球覆盖。
- **特点**：支持容器化应用、自动扩展、全球部署。

### 7. **Railway**
- **免费计划**：Railway 提供免费的计划，允许你轻松部署后端服务和数据库。它的免费计划适合中小型项目。
- **特点**：简单的设置和管理、自动部署、内置数据库支持。

### 8. **Firebase**
- **免费计划**：Firebase 提供了免费的计划，适合使用其云函数（Firebase Cloud Functions）来处理后端逻辑。Firebase 的免费计划适合小型应用和开发测试。
- **特点**：与 Google Cloud Platform 集成、支持无服务器函数、实时数据库和身份验证。

这些平台大多数提供免费层级，但可能会有一些资源和功能限制。

如果你的需求超出了这些免费计划的范围，你可能需要考虑付费计划或其他云服务提供商。

## 其他替代的免费方案

### 1、render.com

官網：https://render.com/
免費額度：每月 750 小時
支援語言：Node、Python、Go、Ruby、PHP 等
Web service 最大可以 512 GB RAM 及 64 個 CPU
甚至可以使用自定義 Dockerfile 打包環境
提供 Disks 可以 mount 到某個路徑供服務使用
還能開 terminal 進到服務中，檢查程式或系統狀況
這些特點都很不錯，但如果專案很大
build 的時候會需要很多時間
如果像我有掛載額外 disk 時，原本在跑的服務會是中斷的
實屬可惜，畢竟我們都不允許服務有中斷的可能

### 2、fly.io

官網：https://fly.io/
免費額度：可開 2 個服務、 3 GB disks
支援語言：Node、Python、Laravel、Go、Ruby 等
價格比 Heroku 便宜、社群討論比 render 還多

### 3、Deta

官網：https://www.deta.sh/
免費額度：目前全面免費
支援語言：Node、Python
功能較為陽春，但免費的很有誠意

### 4、Google Cloud Run

官網：https://cloud.google.com/run?hl=zh-tw
免費額度：每月 200 萬次要求
支援語言：Node、Python、Go、Java、NET 等
會特別提 GCP 是因為僅次於 Heroku
我也放了不少專案在這邊
Cloud Run 比 Cloud Function 更彈性、比 Cloud App 便宜單純
完全就是 Heroku 的替代方案
有多種 RAM 和 CPU 的規格可選擇
甚至能夠自動調配執行數量與流量
對於不想自己處理那些事情的人超級方便
搭配 Cloud Scheduler 就能做到 cron job



# 参考资料

https://github.com/ctripcorp/x-pipe

* any list
{:toc}