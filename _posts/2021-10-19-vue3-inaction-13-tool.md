---
layout: post
title: 开发拓展篇 1：扩充你的开发工具
date: 2021-10-18 21:01:55 +0800
categories: [FrontEnd]
tags: [front-end, vue, web, source-code, sh]
published: true
---

# 开发拓展篇 1：扩充你的开发工具

在项目开发中，工具的使用起到了至关重要的作用，正所谓工欲善其事，必先利其器，掌握一些实用的开发工具能够使我们的开发效率事半功倍。

那么我们应该掌握哪些开发工具的使用方法呢？

其实一路走来，我们已经介绍的开发工具包括了 npm、yarn、webpack 以及一些集成在项目中的工具包，这些工具一定程度上都大大简化了我们的开发流程，起到了项目助推剂的作用。

因此在开发工具的学习上我们应该抱着宜多不宜少的心态，积极主动的扩充自己的工具库。

# 巧用 Chrome 插件

首先，既然说到工具，那我们不得不介绍下占据浏览器市场份额霸主地位的 Chrome 了。

相信每一个从事前端开发的同学都对其寄存着一种亲切感，因为只要是参与 web 项目的开发就基本上离不开它的关照，比如它提供的调试控制台以及数以万计的插件等。

而作为一名前端开发人员，我想你的 Chrome 浏览器地址栏右侧肯定排列着几款你钟爱的插件，使用的插件数量越多说明了你掌握的 Chrome 技能越多，同时一定程度上也凸显了你的开发能力。

那么接下来我们不妨来认识一下几款实用的 Chrome 插件：

## Vue.js devtools

首先介绍的肯定是 Vue.js devtools，它是 Vue 官方发布的一款调试 Vue 项目的插件，支持数据模拟与调试。

相信从事过 Vue 项目开发的同学都已经把它收入在自己的工具库中了，它的界面如下：

![vue](https://img.kancloud.cn/ec/c6/ecc61d9a55913f3d54626f16136be546_1036x391.gif)

成功安装它之后，在 Vue 项目的页面中我们可以打开 Chrome 控制台选择 Vue 的 tab 进行页面调试。

## Vue Performance Devtool

在《Vue API 盲点解析》章节我们已经介绍了 Vue Performance Devtool 这款插件，它可以分析我们页面中各个组件的性能情况，从而在其基础上我们可以有针对性的对组件的代码进行优化，如下图所示：

![vue p](https://img.kancloud.cn/d6/79/d679a67255735816e0ec112676f68478_1100x146.gif)

同样安装完毕后，我们可以打开 Chrome 控制台选择 Vue Performance 的 tab 进行组件的性能观察。

## Postman

Postman 相信大家都比较熟悉，它是一款非常好用的接口调试工具。

在 Vue 项目开发中，我们或多或少需要对后台提供的接口进行测试，比如传递数据并查看返回结果等，这时候使用 Postman 便可以完成这些任务。

![postman](https://img.kancloud.cn/d7/85/d7851484e8865af4668117985d47bb35_1080x589.gif)

Postman 会当作 Chrome 应用程序安装到你的电脑上，打开后我们可以选择请求方式（GET／POST），输入请求 URL 以及设置传递参数来进行接口的调用。

## Web Developer

Web Developer 是一款强大的用于操作网页中各项资源与浏览器的插件，比如一键禁用 JS、编辑 CSS、清除 Cookie 等。

![web dev](https://img.kancloud.cn/f4/29/f4291d11e16d4a27f2f1378b14232fad_814x154.gif)

虽然说一些功能我们也可以在 Chrome 控制台实现，但其提供的快捷键能够十分方便的让我们在页面中操作某些资源。

## Google PageSpeed Insights API Extension

PageSpeed Insights (PSI) 是 Google 在全球范围内应用最广的开发者工具之一，其中文网页版 developers.google.cn/speed/pagespeed/insights/ 也已经发布。

作为一款专注于改进网页性能的开发者工具，它主要具有以下两个优势：真实的网页运行速度 及 优化建议。

![google](https://img.kancloud.cn/e1/10/e1101d6bfb9300a76ec436c6639ff9b6_1081x576.gif)

为了便于使用，我们可以直接下载 Chrome 插件 Google PageSpeed Insights API Extension 来对当前访问网址进行测试和分析。

## FeHelper

FeHelper 是百度 FE 团队开发的一款前端工具集插件，包含代码压缩／性能检测／字符串编解码等功能，能够帮助我们完成一些琐碎的开发任务。

![fe](https://img.kancloud.cn/92/06/92060f89cd7515a71ab8b384e9c2feb9_1220x633.gif)

FeHelper 为我们提供了十多种快捷功能，在需要的时候我们直接点击插件图标选择对应功能即可，操作起来十分便捷。

## Can I Use

Can I Use 是 https://caniuse.com/ 网页版的插件。我们可以使用其来查看某一特性的浏览器支持程度，确保主流浏览器的支持。


使用 Chrome 插件形式的 Can I Use 我们可以快捷的查看项目中用到的某一特性的浏览器支持范围，同时还可以查看支持程度和兼容方式。

# 其他实用插件

- JSONView ：一款可以将后台返回的 JSON 字符串数据自动格式化成规范 JSON 格式的插件

- WhatFont：一款可以显示浏览器中选择文字的字体类型／字号／颜色的插件

- The QR Code Extension：一款允许当前页面生成二维码，并使用网络摄像头扫描二维码的插件

- Test IE：一款可以模拟 IE 及其他主流浏览器的插件，但大部分模拟场景需要付费才能使用

- Wappalyzer：一款查看当前网站使用的前后端技术的插件，帮助你学习和认识优秀网站的技术选型

- Mobile/Responsive Web Design Tester：一款用于测试页面在不同机型下呈现的插件

- Resolution Test：一款用于测试页面在不同分辨率下呈现的插件

以上我们介绍了一些非常实用的 chrome 拓展插件来助力我们的前端开发，为项目开发提供了工具解决方案，同时也有助于帮助大家开启以工具为向导的开发模式。

# 分析你的包文件

每当我们使用 webpack 打包项目代码的时候，你可能需要关注一下打包生成的每个 js 文件的大小以及其包含的内容，这对于优化项目打包速度和提升页面加载性能都有十分大的帮助。

这里我们推荐使用 webpack-bundle-analyzer 这一款 webpack 插件来进行包文件的分析，下面我们就来介绍下其配置和使用方法。

首先作为一款需要内置在代码中的开发分析工具，我们需要安装并在 webpack 的 plugins 中添加该插件：

```
#  安装命令
yarn add webpack-bundle-analyzer --dev
```

```js
/* vue.config.js */
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const isPro = process.env.NODE_ENV === 'production'

module.exports = {
    
    ... 
    
    configureWebpack: config => {
        if (isPro) {
            return {
                plugins: [
                
                    // 使用包分析工具
                    new BundleAnalyzerPlugin()
                ]
            }
        }
    },
    
    ...
}
```

这样我们在生产环境下打包便可以在浏览器 8888 端口（默认）下打开页面进行包文件的分析，如下图所示：

图中区域内包含了我们打包出的所有 js 文件，我们可以以不同的颜色进行区分，同时我们也可以点击某一区块进行放大观察，以此来分析是否存在较大或重复的模块。而在页面左侧存在一个筛选面板，在该面板中我们能勾选需要查看的文件来进行显示，同时也可以切换查看原始、普通及 GZIP 压缩模式下的文件大小。

使用好 webpack-bundle-analyzer 工具我们可以快速的找到需要合并的模块，解决文件冗余，为资源优化提供可行性方案。

# 调试移动端页面

除了 Chrome 插件及打包分析工具的介绍外，我们再来了解下移动端页面的调试工具。相比 PC 端调试，移动端调试可能稍微复杂一点，但是只要熟练的使用好 “工具” 这一东西，我们同样可以在移动端的世界中游刃有余。

作为一名 Mac 及 iOS 用户，这里我主要介绍在 iPhone 手机中调试页面的方法，当然最后也会简单介绍一下 Android 手机页面的调试方法。

首先我们得具备这些工具：iPhone 手机一部、数据线一条、Mac 电脑一台。在满足以上要求后我们需要把手机通过数据线连接上 Mac 电脑，连接完毕后便可以进行如下步骤的设置：

1. 打开苹果手机的 Web 检查器 （设置 > Safari浏览器 > 高级 > Web检查器），一般情况下默认是开启的

2. 打开 Mac 上的 Safari 的 “开发”菜单，一般情况下默认是开启的

3. 在手机 Safari 浏览器中打开你需要调试的页面

4. 在 Mac Safari 浏览器中选择你需要调试的页面（开发 > 你的 iPhone > 你的页面地址）

5. 点击地址后弹出如图所示的控制台，你便可以在该控制台中进行调试了

最后你可以针对你的移动端页面进行断点调试、操作缓存、查看网络及资源等，帮助你快速的定位和解决问题。

而在 Android 手机中，我们同样可以对移动端页面进行调试，主要不同点在于 IOS 使用的工具是 iPhone 和 Mac，Android 使用的工具主要是 Android 手机和 Windows 系统罢了（Mac 也可以使用模拟器），当然还需要借助 Chrome 的帮助。

这里主要介绍一下 Chrome 中的 inspect，我们可以在 Chrome 地址栏输入：chrome://inspect/ 来捕获手机访问的页面地址，前提是你的 Android 手机通过数据线连接上了电脑并开启了相应权限，最后获取到的地址会在 Remote Target 中显示：

点击相应的地址会弹出一个控制台，你可以在该控制台中进行页面的调试。

# 结语

本文介绍了 Vue 项目开发时常用的 Chrome 插件、包分析工具以及移动端调试工具，这些开发工具的使用能够帮助我们快速的定位项目中出现的一些疑难杂症，而唯有 “用正确的工具，做正确的事情” 才能有效的彰显工具对于项目开发和维护的重要性，使我们的工具库能够发挥它真正的价值。

# 思考 & 作业

- webpack-bundle-analyzer 有哪些配置项？分别有什么作用？

- 除了本文介绍的开发工具外，还有哪些比较实用的开发工具？

# 参考资料

https://www.kancloud.cn/sllyli/vueproject/1244265

* any list
{:toc}
