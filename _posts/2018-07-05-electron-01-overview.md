---
layout: post
title:  Electron-01-构建跨平台的桌面应用程序
date:  2018-07-05 21:01:28 +0800
categories: [Tool]
tags: [tool, electron, sh]
published: true
---

# Electron

[Electron](https://electronjs.org/) 使用 JavaScript, HTML 和 CSS 构建跨平台的桌面应用

如果你可以建一个网站，你就可以建一个桌面应用程序。 
Electron 是一个使用 JavaScript, HTML 和 CSS 等 Web 技术创建原生程序的框架，它负责比较难搞的部分，你只需把精力放在你的应用的核心上即可。

# 快速入门

## 安装 nodejs

直接[官网下载](https://nodejs.org/en/)安装即可。

- 测试

```
node -v
v12.16.2

npm -v
6.14.4
```

## 安装

```sh
$   npm install electron --save-dev
```

## 实例代码

```
# 克隆示例项目的仓库
$ git clone https://github.com/electron/electron-quick-start

# 进入这个仓库
$ cd electron-quick-start

# 安装依赖并运行
$ npm install && npm start
```

然后会有一个简单的页面弹窗，这就是将 html 转换为 windows 程序的结果。

一个如下的简单页面：

```
Hello World!
We are using Node.js 14.16.0, Chromium 91.0.4472.106, and Electron 13.1.4.
```

# 参考资料

[官网](https://www.electronjs.org)

* any list
{:toc}