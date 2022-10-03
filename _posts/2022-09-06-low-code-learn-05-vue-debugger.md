---
layout: post
title:  低代码开源源码学习-05-vscode vue debug 代码调试
date:  2022-09-03 21:22:02 +0800
categories: [Tool]
tags: [low-code, sh]
published: true
---

# 方式

vue官方提供了两种debugger的方式：

1. 使用 Vue Devtools 插件，该方式需要安装翻墙插件才可以； 

2. 在vscode软件上安装 Debugger for Chrome 插件进行调试。

## 1. vue devtools

[https://github.com/vuejs/devtools](https://github.com/vuejs/devtools)

## 2. Debugger for Chrome

以下是 Debugger for Chrome 插件的安装和使用方式，本文重点说一下。

### 1. 安装插件

打开vscode软件，点击左边的扩展插件，安装 Debugger for Chrome

![Debugger for Chrome](https://img-blog.csdnimg.cn/ecc16e4643b5490888cf22524f477b05.png)

###  2. 配置 launch.json

按住键盘上的 `ctrl + shift + d` 快捷键，选择创建Chrome类型的一个 launch.json 文件

![config](https://img-blog.csdnimg.cn/41a97bfec6e44cb7b77108305ee6b91a.png)

- launch.json

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
      {
          "type": "pwa-chrome",
          "request": "launch",
          "name": "Launch Chrome against localhost",
          "url": "http://localhost:8080",
          "webRoot": "${workspaceFolder}"
      }
  ]
}
```

解释下对应字段：

type  是你调试类型，现在我们使用Chrome浏览器调试，所以选择 Chrome

name  调试名称，随你起名字，这个可以随意

file  本地文件路径，调试本地文件（ workspaceRoot 是项目根目录），由于没有具体调试那个文件，案例中调试的是src下的所有文件

url  调试的地址

### 3. 运行项目

使用 `npm run dev` 运行项目

### 4. 启用调试

项目运行好后回到vscode页面，按键盘上的 `F5`，这时候即可看到浏览器会自动打开一个新的网页，地址就是刚刚输入的url地址。

### 5. 设置断点

回到vscode软件，在需要断点的地方鼠标左键点击一下，即可看到一个小圆圈，表示断点成功。

![设置断点](https://img-blog.csdnimg.cn/f754785b725447eeb11b8fcf72a8e0c4.png)

ps: 这里说一下，如果断点是灰色，说明没有成功。

### 6. 断点状态

在页面上点击对应的操作，即可看到页面已经进入断点状态

![断点状态](https://img-blog.csdnimg.cn/915301f42a8440bc8bb9ed1bd26a8be9.png)

# 参考资料

[vue如何debugger](https://blog.csdn.net/hua_ban_yu/article/details/123691405)

[vue调试工具vue-devtools安装及使用（亲测有效，望采纳）](https://www.cnblogs.com/sunny3158/p/16023940.html)

[vue 的 3种调试方式](http://t.zoukankan.com/langxiansheng-p-12718928.html)

[Vue笔记：使用 VS Code 断点调试](https://www.cnblogs.com/xifengxiaoma/p/9530737.html)

* any list
{:toc}
