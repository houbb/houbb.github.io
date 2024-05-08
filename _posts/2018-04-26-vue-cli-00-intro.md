---
layout: post
title:  Vue Cli
date:  2018-06-14 15:16:10 +0800
categories: [Vue]
tags: [vue]
published: true
---

# Vue Cli

Vue 提供一个官方命令行工具，可用于快速搭建大型单页应用。

该工具为现代化的前端开发工作流提供了开箱即用的构建配置。

只需几分钟即可创建并启动一个带热重载、保存时静态检查以及可用于生产环境的构建配置的项目：

> [Vue-Cli 官方教程](https://cn.vuejs.org/v2/guide/installation.html#%E5%91%BD%E4%BB%A4%E8%A1%8C%E5%B7%A5%E5%85%B7-CLI)

## 一些生态

√ 请输入项目名称： ... vue-project
√ 是否使用 TypeScript 语法？ ... 否 / 是
√ 是否启用 JSX 支持？ ... 否 / 是

√ 是否引入 Vue Router 进行单页面应用开发？ ... 否 / 是
√ 是否引入 Pinia 用于状态管理？ ... 否 / 是

√ 是否引入 Vitest 用于单元测试？ ... 否 / 是
√ 是否要引入一款端到端（End to End）测试工具？ » 不需要   cypress/nightwatch/playwright

√ 是否引入 ESLint 用于代码质量检测？ ... 否 / 是
√ 是否引入 Vue DevTools 7 扩展用于调试? (试验阶段) ... 否 / 是

打包工具：

vite
webpack

编程语言：js ts jsx


# 快速开始

## 环境依赖

### node

```
$ node -v
v9.10.1
```

### npm

```
$ npm -v
5.6.0
```

### vue

- install

```
$ sudo npm install -g vue-cli
npm WARN deprecated coffee-script@1.12.7: CoffeeScript on NPM has moved to "coffeescript" (no hyphen)
/usr/local/bin/vue -> /usr/local/lib/node_modules/vue-cli/bin/vue
/usr/local/bin/vue-init -> /usr/local/lib/node_modules/vue-cli/bin/vue-init
/usr/local/bin/vue-list -> /usr/local/lib/node_modules/vue-cli/bin/vue-list
+ vue-cli@2.9.6
added 252 packages in 24.807s
```

- version

```
$ vue -V
2.9.6
```

- list

```
$ vue list

  Available official templates:

  ★  browserify - A full-featured Browserify + vueify setup with hot-reload, linting & unit testing.
  ★  browserify-simple - A simple Browserify + vueify setup for quick prototyping.
  ★  pwa - PWA template for vue-cli based on the webpack template
  ★  simple - The simplest possible Vue setup in a single HTML file
  ★  webpack - A full-featured Webpack + vue-loader setup with hot reload, linting, testing & css extraction.
  ★  webpack-simple - A simple Webpack + vue-loader setup for quick prototyping.
```

## 构建

### 创建项目

- 当前目录

```
$ pwd
/Users/houbinbin/code/_vue
```

- 创建

输入选项，以供自定义创建项目：

```
vue init webpack vue-demo
```

`vue-demo` 是项目名称

- 自定义

选择如下：

```
? Project name vue-demo
? Project description Demo for vue cli
? Author houbb 1060732496@qq.com
? Vue build standalone
? Install vue-router? Yes
? Use ESLint to lint your code? Yes
? Pick an ESLint preset Standard
? Set up unit tests Yes
? Pick a test runner jest
? Setup e2e tests with Nightwatch? No
? Should we run `npm install` for you after the project has been created? (recommended) npm

   vue-cli · Generated "vue-demo".
```

- 创建日志

```
# Installing project dependencies ...
# ========================

npm WARN deprecated istanbul-lib-hook@1.2.1: 1.2.0 should have been a major version bump

> fsevents@1.2.4 install /Users/houbinbin/code/_vue/vue-demo/node_modules/fsevents
> node install

[fsevents] Success: "/Users/houbinbin/code/_vue/vue-demo/node_modules/fsevents/lib/binding/Release/node-v59-darwin-x64/fse.node" is installed via remote

> uglifyjs-webpack-plugin@0.4.6 postinstall /Users/houbinbin/code/_vue/vue-demo/node_modules/webpack/node_modules/uglifyjs-webpack-plugin
> node lib/post_install.js

npm notice created a lockfile as package-lock.json. You should commit this file.
added 1546 packages in 41.585s


Running eslint --fix to comply with chosen preset rules...
# ========================


> vue-demo@1.0.0 lint /Users/houbinbin/code/_vue/vue-demo
> eslint --ext .js,.vue src test/unit "--fix"


# Project initialization finished!
# ========================

To get started:

  cd vue-demo
  npm run dev
```

### 运行项目

- 定位到项目下

打开项目 **vue-demo**

```
$ cd vue-demo/
$ pwd
/Users/houbinbin/code/_vue/vue-demo
```

- 安装依赖

```
$ npm install
```

日志

```
up to date in 6.661s
```

- 运行项目

```
$ npm run dev
```

日志

```
> vue-demo@1.0.0 dev /Users/houbinbin/code/_vue/vue-demo
> webpack-dev-server --inline --progress --config build/webpack.dev.conf.js

 95% emitting                                                                        

 DONE  Compiled successfully in 2902ms                                                                                                                                       15:41:49

 I  Your application is running here: http://localhost:8080
```

- 访问

> [http://localhost:8080](http://localhost:8080)

# 项目结构介绍

## 项目结构

```
.
├── README.md
├── build
│   ├── build.js
│   ├── check-versions.js
│   ├── logo.png
│   ├── utils.js
│   ├── vue-loader.conf.js
│   ├── webpack.base.conf.js
│   ├── webpack.dev.conf.js
│   └── webpack.prod.conf.js
├── config
│   ├── dev.env.js
│   ├── index.js
│   ├── prod.env.js
│   └── test.env.js
├── index.html
├── package-lock.json
├── package.json
├── src
│   ├── App.vue
│   ├── assets
│   │   └── logo.png
│   ├── components
│   │   └── HelloWorld.vue
│   ├── main.js
│   └── router
│       └── index.js
└── static
```

## 目录及文件作用简介

- main.js

main.js 是我们的入口文件，主要作用是初始化vue实例，并使用我们需要的插件

- App.vue

App.vue 是我们的根组件，所有页面都是在App.vue下面进行切换的，
可以理解为所有的组件都是App.vue的子组件，我
们可以把头部和底部及每个页面都出现的内容放在App.vue里面。

- index.html

文件入口

- build

文件夹中配置了 webpack 的基本配置、开发环境配置、生产环境配置等

- config

文件夹中配置了路径端口值等

- src

放置组件和入口文件

- node_modules

为依赖的模块


* any list
{:toc}







