---
layout: post
title:  Vue todo-01-Prepare
date:  2018-07-18 15:49:21 +0800
categories: [Vue]
tags: [vue, in action]
published: true
---

# Vue Todo

本项目用于实战开发 [Vue](https://cn.vuejs.org/v2/guide/#Vue-js-%E6%98%AF%E4%BB%80%E4%B9%88)，用于学习使用 Vue。

# 准备工作

## 环境准备

- node

> [node 入门](https://houbb.github.io/2018/04/23/nodejs-01-hello)

- npm

> [npm](https://houbb.github.io/2018/04/24/npm)

- vue-cli

> [vue-cli](https://houbb.github.io/2018/06/14/vue-cli)

## 配置项目

```sh
$ vue init webpack vue-todo

? Project name vue-todo
? Project description Todo list implements of vue.
? Author houbb <1060732496@qq.com
? Vue build standalone
? Install vue-router? Yes
? Use ESLint to lint your code? Yes
? Pick an ESLint preset Standard
? Set up unit tests No
? Setup e2e tests with Nightwatch? No
? Should we run `npm install` for you after the project has been created? (recommended) npm

   vue-cli · Generated "vue-todo".


# Installing project dependencies ...
# ========================


> fsevents@1.2.4 install /Users/houbinbin/code/_github/vue-todo/node_modules/fsevents
> node install

[fsevents] Success: "/Users/houbinbin/code/_github/vue-todo/node_modules/fsevents/lib/binding/Release/node-v59-darwin-x64/fse.node" is installed via remote

> uglifyjs-webpack-plugin@0.4.6 postinstall /Users/houbinbin/code/_github/vue-todo/node_modules/webpack/node_modules/uglifyjs-webpack-plugin
> node lib/post_install.js

npm notice created a lockfile as package-lock.json. You should commit this file.
added 1311 packages from 701 contributors and audited 9284 packages in 36.712s
found 1 moderate severity vulnerability
  run `npm audit fix` to fix them, or `npm audit` for details


Running eslint --fix to comply with chosen preset rules...
# ========================


> vue-todo@1.0.0 lint /Users/houbinbin/code/_github/vue-todo
> eslint --ext .js,.vue src "--fix"


# Project initialization finished!
# ========================

To get started:

  cd vue-todo
  npm run dev
  
Documentation can be found at https://vuejs-templates.github.io/webpack
```

## 启动项目

- 启动命令

```sh
$ cd vue-todo
$ npm run dev
```

- 启动日志

```
> vue-todo@1.0.0 dev /Users/houbinbin/code/_github/vue-todo
> webpack-dev-server --inline --progress --config build/webpack.dev.conf.js

 95% emitting                                                                        

 DONE  Compiled successfully in 2870ms                                                                                                                                       15:52:54

 I  Your application is running here: http://localhost:8080
```

打开 [http://localhost:8080](http://localhost:8080) 访问即可。


# 参考

> [todomvc](http://todomvc.com/)

> [vue-todo](https://github.com/liangxiaojuan/vue-todos)

* any list
{:toc}