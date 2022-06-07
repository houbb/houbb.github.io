---
layout: post
title: uniapp 教程-01-overview
date: 2021-11-15 21:01:55 +0800
categories: [WEB]
tags: [web, cross-plateform, uni-app, sh]
published: true
---
 

# 开发规范

为了实现多端兼容，综合考虑编译速度、运行性能等因素，uni-app 约定了如下开发规范：

- 页面文件遵循 Vue 单文件组件 (SFC) 规范(opens new window)

- 组件标签靠近小程序规范，详见uni-app 组件规范

- 接口能力（JS API）靠近微信小程序规范，但需将前缀 wx 替换为 uni，详见uni-app接口规范

- 数据绑定及事件处理同 Vue.js 规范，同时补充了App及页面的生命周期

- 为兼容多端运行，建议使用flex布局进行开发


# 工程简介

一个 uni-app 工程，就是一个 Vue 项目，你可以通过 HBuilderX 或 cli 方式快速创建 uni-app 工程，详见：[快速上手](https://uniapp.dcloud.net.cn/quickstart-hx.html#%E5%88%9B%E5%BB%BAuni-app)。

# 目录结构

一个uni-app工程，默认包含如下目录及文件：

```
┌─uniCloud              云空间目录，阿里云为uniCloud-aliyun,腾讯云为uniCloud-tcb（详见uniCloud）
│─components            符合vue组件规范的uni-app组件目录
│  └─comp-a.vue         可复用的a组件
├─hybrid                App端存放本地html文件的目录，详见
├─platforms             存放各平台专用页面的目录，详见
├─pages                 业务页面文件存放的目录
│  ├─index
│  │  └─index.vue       index页面
│  └─list
│     └─list.vue        list页面
├─static                存放应用引用的本地静态资源（如图片、视频等）的目录，注意：静态资源只能存放于此
├─uni_modules           存放[uni_module](/uni_modules)。
├─wxcomponents          存放小程序组件的目录，详见
├─nativeplugins         App原生插件 详见
├─unpackage             非工程代码，一般存放运行或发行的编译结果
├─main.js               Vue初始化入口文件
├─App.vue               应用配置，用来配置App全局样式以及监听 应用生命周期
├─manifest.json         配置应用名称、appid、logo、版本等打包信息，详见
├─pages.json            配置页面路由、导航条、选项卡等页面类信息，详见
└─uni.scss              这里是uni-app内置的常用样式变量 
```

## Tips

编译到任意平台时，static 目录下的文件均会被完整打包进去，且不会编译。非 static 目录下的文件（vue、js、css 等）只有被引用到才会被打包编译进去。

static 目录下的 js 文件不会被编译，如果里面有 es6 的代码，不经过转换直接运行，在手机设备上会报错。

css、less/scss 等资源不要放在 static 目录下，建议这些公用的资源放在自建的 common 目录下。

HbuilderX 1.9.0+ 支持在根目录创建 ext.json、sitemap.json 等小程序需要的文件。

| 有效目录	| 说明    |
|:---|:---|
| app-plus	|   App |
| h5	|   H5  |
| mp-weixin	|   微信小程序  |
| mp-alipay	|   支付宝小程序    |
| mp-baidu	|   百度小程序  |
| mp-qq	|   QQ小程序    |
| mp-toutiao	|   字节小程序  |
| mp-lark	|   飞书小程序  |
| mp-kuaishou	|   快手小程序  |
| mp-jd	|   京东小程序  |

# 参考资料

https://uniapp.dcloud.net.cn/tutorial/

* any list
{:toc}
