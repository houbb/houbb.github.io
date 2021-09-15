---
layout: post
title: vue3 量化交易系统-01-项目初始化
date: 2021-09-09 21:01:55 +0800
categories: [VUE]
tags: [vue3, quant, sh]
published: true
---

# 前端应用初始化

## 基本环境安装

```
λ node -v
v12.16.2

λ npm -v
7.21.0
```

因为网速原因，此处使用 cnpm

```
λ cnpm -v
cnpm@7.0.0
```

已经安装的 vue-cli 版本：

```
λ vue -V
@vue/cli 4.5.13
```

## 初始化项目

```
vue create quant-h5
```

选择 vue3 创建项目，日志如下：

```
$ vue create quant-h5
? Please pick a preset: (Use arrow keys)
? Please pick a preset: Default ([Vue 2] babel, eslint)
✨  Creating project in D:\code\quant-h5.
🗃  Initializing git repository...
⚙️  Installing CLI plugins. This might take a while...


added 1281 packages in 1m
npm notice
npm notice New minor version of npm available! 7.21.0 -> 7.23.0
npm notice Changelog: <https://github.com/npm/cli/releases/tag/v7.23.0>
npm notice Run `npm install -g npm@7.23.0` to update!
npm notice
🚀  Invoking generators...
📦  Installing additional dependencies...


added 51 packages in 21s
⚓  Running completion hooks...

📄  Generating README.md...

🎉  Successfully created project quant-h5.
👉  Get started with the following commands:

 $ cd quant-h5
 $ npm run serve
```

## 启动

运行下面的命令启动：

```
$ cd quant-h5
$ cnpm run serve
```

启动日志如下:

```
...

  App running at:
  - Local:   http://localhost:8080/
  - Network: http://192.168.0.110:8080/

  Note that the development build is not optimized.
  To create a production build, run npm run build.
```

直接打开对应的地址即可：

![http://localhost:8080/](http://localhost:8080/)

# 分支初始化

## release_1.0.0

为了便于后期迭代学习，将默认的分支定义为 v1.0.0

```
git checkout -b release_1.0.0
git push --set-upstream origin release_1.0.0
```

## 切回 main

然后我们切回 main 分支，后续这里开发

```
git checkout main
```

# 参考资料

https://github.com/cncounter/translation/blob/master/README.md

* any list
{:toc}