---
layout: post
title:  cross-plateform 跨平台应用-01-tauri 快速入门例子
date: 2024-09-05 21:01:55 +0800
categories: [WEB]
tags: [web, cross-plateform, uni-app, sh]
published: true
---

# 简介

## 安装项目引导

```sh
npm install -g create-tauri-app
```

## 创建项目

```sh
npx create-tauri-app@latest
Need to install the following packages:
create-tauri-app@4.5.7
Ok to proceed? (y) y
✔ Project name · tauri-app
✔ Identifier · com.tauri-app.app
✔ Choose which language to use for your frontend · TypeScript / JavaScript - (pnpm, yarn, npm, deno, bun)
✔ Choose your package manager · npm
✔ Choose your UI template · Vue - (https://vuejs.org/)
✔ Choose your UI flavor · TypeScript

Template created! To get started run:
  cd tauri-app
  npm install
  npm run tauri android init

For Desktop development, run:
  npm run tauri dev

For Android development, run:
  npm run tauri android dev
```

## 安装依赖

```sh
cd tauri-app
npm install
```

## run dev

```sh
npm run tauri dev
```

日志：

```
> tauri-app@0.1.0 tauri
> tauri dev

    Running BeforeDevCommand (`npm run dev`)

> tauri-app@0.1.0 dev
> vite


  VITE v5.4.11  ready in 740 ms

  ➜  Local:   http://localhost:1420/
    Updating crates.io index
    Info Watching C:\Users\Administrator\tauri-app\src-tauri for changes...
       Fetch [=====>                           ] 0 comp...
```

访问，打开：http://localhost:1420/


... 感觉要下载很多东西的样子

## 打包

```
npm run tauri build
```

# 参考资料

https://v2.tauri.app/start/

* any list
{:toc}