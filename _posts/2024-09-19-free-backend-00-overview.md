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

### 2. **Vercel**

- **免费计划**：虽然 Vercel 主要用于前端部署，但它的无服务器函数也可以用作后端服务。免费计划允许你使用一定数量的无服务器函数和其他资源。
- **特点**：自动化部署、全球 CDN、集成 GitHub/GitLab/Bitbucket，适合前后端集成的应用。

### 3. **Netlify**
- **免费计划**：Netlify 提供了免费的部署计划，支持静态网站和无服务器函数（Netlify Functions）。免费计划适合小型项目和开发测试环境。
- **特点**：简单的部署流程、集成 Git、支持无服务器函数和持续集成。

亮点功能：

- 单个成员席位
- 全球边缘网络
- 带有协作界面的实时站点预览
- 100GB 带宽
- 300 分钟构建时间
- 即时回滚
- 静态资源
- 动态无服务器函数

附加服务：

- 额外带宽
- 额外构建时间

### 4. **Glitch**
- **免费计划**：Glitch 提供了一个免费的计划，用于创建和部署 Node.js 应用程序。它适合用作开发和测试环境。
- **特点**：实时协作编辑、自动部署、简单的界面和开发工具。

开始使用 Glitch 的基础功能免费体验。我们直观的代码编辑器让你的开发环境随时准备就绪。

- 项目和代码默认是公开的
- 全栈应用在 5 分钟后进入休眠状态
- 无限数量的静态网站始终在线
- 支持 GitHub 导入/导出和 Prettier 格式化工具

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

### ~~1. **Heroku**~~
- **免费计划**：Heroku 提供了一个免费的计划，允许你部署和管理应用程序。虽然免费计划有一些限制，比如每月有限的运行时间和休眠策略，但对于轻量级的应用程序和开发环境来说，它是一个不错的选择。
- **特点**：支持多种编程语言（如 Node.js、Python、Ruby、Java），提供易于使用的 CLI 和 web 界面，内置数据库和插件支持。

PS: 这个已经不再免费。

这些平台大多数提供免费层级，但可能会有一些资源和功能限制。

如果你的需求超出了这些免费计划的范围，你可能需要考虑付费计划或其他云服务提供商。


## GitHub 本身不直接支持部署后端服务，但你可以使用 GitHub 作为代码托管平台，结合其他平台来实现免费的后端服务部署。以下是几种常见的免费部署后端服务的方式，通常与 GitHub 配合使用：

### 1. **GitHub Pages (仅限前端)**
   - GitHub Pages 是 GitHub 提供的用于静态网站托管的服务，适用于 HTML、CSS 和 JavaScript 项目。
   - **局限性**：仅支持静态内容，不支持后端逻辑或动态服务器端渲染。

### 2. **GitHub + Vercel (支持 Node.js 后端)**
   - **Vercel** 提供了免费的服务器端支持，允许你通过 GitHub 直接部署 Node.js 后端函数（如 API endpoints）。
   - **优点**：与 GitHub 无缝集成，每次提交代码后会自动部署更新。支持快速部署，并适合小型后端服务。
   - **使用步骤**：
     - 将代码存储在 GitHub 上。
     - 连接 Vercel，选择仓库后即可一键部署。
   - **语言支持**：Vercel 主要支持 JavaScript 和 TypeScript（Node.js 环境）。

### 3. **GitHub + Render (支持多种后端语言)**
   - **Render** 是一个全栈云平台，支持自动化的 GitHub 集成，可以轻松部署各种后端服务，如 Node.js、Python、Ruby、Go、Java、Docker 等。
   - **优点**：免费套餐支持小型的后端应用。每次推送到 GitHub 时自动触发构建和部署。
   - **使用步骤**：
     - 将代码托管在 GitHub 上。
     - 在 Render 平台上选择你的 GitHub 仓库，一键部署应用。

### 4. **GitHub + Heroku**
   - **Heroku** 提供了免费的云服务平台，适合部署小型应用。支持 Node.js、Ruby、Python、Java、PHP 等多种语言。
   - **优点**：集成 GitHub，一旦配置好，每次推送到 GitHub 仓库时，Heroku 可以自动重新构建和部署应用。
   - **使用步骤**：
     - 在 GitHub 上托管代码。
     - 通过 Heroku 的 GitHub 集成进行部署。

### 5. **GitHub Actions + Docker**
   - 如果你希望使用容器化技术来管理后端服务，可以通过 GitHub Actions 自动构建 Docker 镜像，并将它部署到支持 Docker 的平台（如 Render、DigitalOcean 或 Vercel）。
   - **优点**：可以高度自定义部署流程，支持复杂的持续集成和持续部署（CI/CD）方案。

### 总结

GitHub 本身不提供直接的后端托管服务，但通过和第三方服务（如 Vercel、Render、Heroku 等）的集成，可以轻松部署免费的后端服务。每个平台都支持自动化的 GitHub 代码更新部署，方便快捷。

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