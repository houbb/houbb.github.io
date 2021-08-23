---
layout: post
title:  Vue Cli-02-install 安装
date:  2018-06-14 15:16:10 +0800
categories: [Vue]
tags: [vue]
published: true
---

# 关于旧版本

Vue CLI 的包名称由 vue-cli 改成了 @vue/cli。 

如果你已经全局安装了旧版本的 vue-cli (1.x 或 2.x)，你需要先通过 `npm uninstall vue-cli -g` 或 `yarn global remove vue-cli` 卸载它。

这里以前安装过，首先移除：

```
removed 236 packages, and audited 1 package in 4s

found 0 vulnerabilities
```

## Node 版本要求

Vue CLI 4.x 需要 Node.js v8.9 或更高版本 (推荐 v10 以上)。你可以使用 n，nvm 或 nvm-windows 在同一台电脑中管理多个 Node 版本。

```
λ node -v
v12.16.2
```

## 安装

可以使用下列任一命令安装这个新的包：

```
npm install -g @vue/cli
# OR
yarn global add @vue/cli
```

安装之后，你就可以在命令行中访问 vue 命令。

你可以通过简单运行 vue，看看是否展示出了一份所有可用命令的帮助信息，来验证它是否安装成功。

你还可以用这个命令来检查其版本是否正确：

```
vue --version
```

* any list
{:toc}