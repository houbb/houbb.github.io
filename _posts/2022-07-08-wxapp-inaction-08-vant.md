---
layout: post
title:  微信公众号项目开发实战-08-vant 组件整合使用
date:  2022-07-08 09:22:02 +0800
categories: [Wechat]
tags: [wechat, sh]
published: true
---

# 快速开始

## 步骤一 通过 npm 安装

使用 npm 构建前，请先阅读微信官方的 npm 支持

```
# 通过 npm 安装
npm i @vant/weapp -S --production
```

## 步骤二 修改 app.json

将 app.json 中的 `"style": "v2"` 去除，小程序的新版基础组件强行加上了许多样式，难以覆盖，不关闭将造成部分组件样式混乱。

## 步骤三 修改 project.config.json

开发者工具创建的项目，miniprogramRoot 默认为 miniprogram，package.json 在其外部，npm 构建无法正常工作。

需要手动在 project.config.json 内添加如下配置，使开发者工具可以正确索引到 npm 依赖的位置。

```json
{
  ...
  "setting": {
    ...
    "packNpmManually": true,
    "packNpmRelationList": [
      {
        "packageJsonPath": "./package.json",
        "miniprogramNpmDistDir": "./miniprogram/"
      }
    ]
  }
}
```

注意： 由于目前新版开发者工具创建的小程序目录文件结构问题，npm构建的文件目录为miniprogram_npm，并且开发工具会默认在当前目录下创建miniprogram_npm的文件名，所以新版本的miniprogramNpmDistDir配置为'./'即可

## 步骤四 构建 npm 包

打开微信开发者工具，点击 工具 -> 构建 npm，并勾选 使用 npm 模块 选项，构建完成后，即可引入组件。

![构建 npm 包](https://img.yzcdn.cn/public_files/2019/08/15/fa0549210055976cb63798503611ce3d.png)

# 使用

## 引入组件

以 Button 组件为例，只需要在app.json或index.json中配置 Button 对应的路径即可。

所有组件文档中的引入路径均以 npm 安装为例，如果你是通过下载源代码的方式使用 `@vant/weapp`，请将路径修改为项目中 @vant/weapp 所在的目录。

```js
// 通过 npm 安装
// app.json
"usingComponents": {
  "van-button": "@vant/weapp/button/index"
}
```

```js
// 通过下载源码使用 es6版本
// app.json
"usingComponents": {
  "van-button": "path/to/@vant/weapp/dist/button/index"
}
```

## 使用组件

引入组件后，可以在 wxml 中直接使用组件

```xml
<van-button type="primary">按钮</van-button>
```

# 参考资料

[微信小程序中使用vant框架，方法步骤清晰，简单适用](https://blog.csdn.net/qq_44890362/article/details/122288546)

https://youzan.github.io/vant-weapp/#/home

* any list
{:toc}