---
layout: post
title: 构建基础篇 1：你需要了解的包管理工具与配置项
date: 2021-10-18 21:01:55 +0800
categories: [FrontEnd]
tags: [front-end, vue, web, source-code, sh]
published: true
---

# 包管理

任何一个项目的构建离不开工具和统一的管理标准，在项目开发和维护过程中，我们需要了解安装包的相应工具和配置文件，以此来有效的进行项目的迭代和版本的更新，为项目提供基本的运行环境。

本文将详细介绍构建 Vue.js 项目相关的依赖包安装工具和相应的配置文件，为大家提供参考。

# 介绍

相信大家对于包管理工具的使用一定不会陌生，毕竟它已经成为前端项目中必不可少的一部分，为了照顾部分零基础用户，这里我们做一个简单的介绍。

## 1. npm 与 package.json

npm 是 Node Package Manager 的简称，顾名思义，它是 node 的包管理工具，也是目前世界上最大的开源库生态系统。

官方地址为：https://www.npmjs.com/，你可以在里面找到数以万计的开源包。

使用 npm 包下载量统计工具，比如 npm-start，我们可以查看相应包在一定时间范围内的下载量数据，下面是 vue-cli 和 @vue/cli 的下载量趋势：

![download-numbers](https://img.kancloud.cn/2c/d1/2cd10ec9772d9fa8b813becd5df926d6_988x396.gif)

在上篇文章中我们介绍了使用 vue-cli 来构建自己的项目，并生成了相应的目录结构，而在最外层目录中，我们可以看到有 package.json 这一文件，该文件便是我们需要了解的包管理文件。

我们先来看一下该文件里面的内容：

```js
{
    "name": "my-project", 
    "version": "0.1.0", 
    "private": true, 
    "scripts": {
        "serve": "vue-cli-service serve",
        "build": "vue-cli-service build",
        "lint": "vue-cli-service lint"
    },
    "dependencies": {
        "vue": "^2.5.16",
        "vue-router": "^3.0.1",
        "vuex": "^3.0.1"
    },
    "devDependencies": {
        "@vue/cli-plugin-babel": "^3.0.0-beta.15",
        "@vue/cli-service": "^3.0.0-beta.15",
        "less": "^3.0.4",
        "less-loader": "^4.1.0",
        "vue-template-compiler": "^2.5.16"
    },
    "browserslist": [
        "> 1%",
        "last 2 versions",
        "not ie <= 8"
    ]
}
```

可以看到该文件是由一系列键值对构成的 JSON 对象，每一个键值对都有其相应的作用，比如 scripts 脚本命令的配置，我们在终端启动项目运行的 npm run serve 命令其实便是执行了 scripts 配置下的 serve 项命令 vue-cli-service serve，我们可以在 scripts 下自己修改或添加相应的项目命令。

而 dependencies 和 devDependencies 分别为项目生产环境和开发环境的依赖包配置，也就是说像 @vue/cli-service 这样只用于项目开发时的包我们可以放在 devDependencies 下，但像 vue-router 这样结合在项目上线代码中的包应该放在 dependencies 下。

详细的package.json文件配置项介绍可以参考：[package.json](https://docs.npmjs.com/files/package.json)

# 2. 常用命令

在简单的了解了 package.json 文件后，我们再来看下包管理工具的常用命令。一般在项目的构建和开发阶段，我们常用的 npm 命令有：

```
# 生成 package.json 文件（需要手动选择配置）
npm init

# 生成 package.json 文件（使用默认配置）
npm init -y

# 一键安装 package.json 下的依赖包
npm i

# 在项目中安装包名为 xxx 的依赖包（配置在 dependencies 下）
npm i xxx

# 在项目中安装包名为 xxx 的依赖包（配置在 dependencies 下）
npm i xxx --save

# 在项目中安装包名为 xxx 的依赖包（配置在 devDependencies 下）
npm i xxx --save-dev

# 全局安装包名为 xxx 的依赖包
npm i -g xxx

# 运行 package.json 中 scripts 下的命令
npm run xxx
```

比较陌生但实用的有：

```
# 打开 xxx 包的主页
npm home xxx

# 打开 xxx 包的代码仓库
npm repo xxx

# 将当前模块发布到 npmjs.com，需要先登录
npm publish
```

相比 npm，[yarn](https://classic.yarnpkg.com/lang/en/) 相信大家也不会陌生，它是由 facebook 推出并开源的包管理工具，具有速度快，安全性高，可靠性强等主要优势，它的常用命令如下：

```
# 生成 package.json 文件（需要手动选择配置）
yarn init

# 生成 package.json 文件（使用默认配置）
yarn init -y

# 一键安装 package.json 下的依赖包
yarn

# 在项目中安装包名为 xxx 的依赖包（配置在 dependencies 下）,同时 yarn.lock 也会被更新
yarn add xxx

# 在项目中安装包名为 xxx 的依赖包（配置在配置在 devDependencies 下）,同时 yarn.lock 也会被更新
yarn add xxx --dev

# 全局安装包名为 xxx 的依
yarn global add xxx

# 运行 package.json 中 scripts 下的命令
yarn xxx
```

比较陌生但实用的有：

```
# 列出 xxx 包的版本信息
yarn outdated xxx

# 验证当前项目 package.json 里的依赖版本和 yarn 的 lock 文件是否匹配
yarn check

# 将当前模块发布到 npmjs.com，需要先登录
yarn publish
```

以上便是 npm 与 yarn 包管理工具的常用及实用命令，需要注意的是，本小册的讲解将会优先使用 yarn 命令进行包的管理和安装。

# 3. 第三方插件配置

在上方的 package.json 文件中我们可以看到有 browserslist 这一配置项，那么该配置项便是这里所说的第三方插件配置，该配置的主要作用是用于在不同的前端工具之间共享目标浏览器和 Node.js 的版本：

```
"browserslist": [
    "> 1%", // 表示包含所有使用率 > 1% 的浏览器
    "last 2 versions", // 表示包含浏览器最新的两个版本
    "not ie <= 8" // 表示不包含 ie8 及以下版本
]
```

比如像 [autoprefixer](https://www.npmjs.com/package/autoprefixer) 这样的插件需要把你写的 css 样式适配不同的浏览器，那么这里要针对哪些浏览器呢，就是上面配置中所包含的。

而如果写在 autoprefixer 的配置中，那么会存在一个问题，万一其他第三方插件也需要浏览器的包含范围用于实现其特定的功能，那么就又得在其配置中设置一遍，这样就无法得以共用。

所以在 package.json 中配置 browserslist 的属性使得所有工具都会自动找到目标浏览器。

当然，你也可以单独写在 .browserslistrc 的文件中：

```
# Browsers that we support 

> 1%
last 2 versions
not ie <= 8
```

至于它是如何去衡量浏览器的使用率和版本的，数据都是来源于 [Can I Use](https://caniuse.com/)。

你也可以访问 http://browserl.ist/ 去搜索配置项所包含的浏览器列表，比如搜索 last 2 versions 会得到你想要的结果，或者在项目终端运行如下命令查看：

```
npx browserslist
```

除了上述插件的配置，项目中常用的插件还有：babel、postcss 等，有兴趣的同学可以访问其官网进行了解。

# 4. vue-cli 包安装

在上述的教程中，我们使用 npm 或 yarn 进行了包的安装和配置，除了以上两种方法，vue-cli 3.x 还提供了其专属的 vue add 命令，但是需要注意的是该命令安装的包是以 @vue/cli-plugin 或者 vue-cli-plugin 开头，即只能安装 Vue 集成的包。

比如运行：

```
vue add jquery
```

其会安装 vue-cli-plugin-jquery，很显然这个插件不存在便会安装失败。

又或者你运行：

```
vue add @vue/eslint
```

其会解析为完整的包名 @vue/cli-plugin-eslint，因为该包存在所以会安装成功。

同时，不同于 npm 或 yarn 的安装， vue add 不仅会将包安装到你的项目中，其还会改变项目的代码或文件结构，所以安装前最好提交你的代码至仓库。

另外 vue add 中还有两个特例，如下：

```
# 安装 vue-router
vue add router

# 安装 vuex
vue add vuex
```

这两个命令会直接安装 vue-router 和 vuex 并改变你的代码结构，使你的项目集成这两个配置，并不会去安装添加 vue-cli-plugin 或 @vue/cli-plugin 前缀的包。

# 结语

不积跬步无以至千里，不积小流无以成江海。本文主要介绍了在 Vue 项目构建前期需要了解的包管理工具与配置的知识点，只有了解了基本的工具使用才能熟练的对项目进行按需配置，希望大家在接下来的学习中能够学以致用，付诸实践。

# 思考 & 作业

（1）文章中使用的一些 npm 包名为什么要用 @ 开头？

如果包的名称以@开头,则它是一个范围包.范围是@和斜杠之间的所有内容

```
@scope/project-name
```

```
{
  "name": "@username/project-name"
}
```

更多细节,请访问[范围包](https://docs.npmjs.com/getting-started/scoped-packages) 


（2）除了文章中介绍的 browserslist 这样的配置项可以写在单独的文件中外，还有哪些常用的配置项可以这样操作？又是如何配置的？

（3）Vue CLI 3 还集成了哪些包，可以通过 vue add 命令安装？

# 参考资料

https://www.kancloud.cn/sllyli/vueproject/1244253

* any list
{:toc}
