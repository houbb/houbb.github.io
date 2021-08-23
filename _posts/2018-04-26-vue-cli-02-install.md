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

Vue CLI 4.x 需要 Node.js v8.9 或更高版本 (推荐 v10 以上)。

你可以使用 n，nvm 或 nvm-windows 在同一台电脑中管理多个 Node 版本。

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

### 异常

出现了这个错误(太长了，具体执行到npm install joi时开始报错)：

```
npm ERR! gyp ERR! not ok
```

我本身配置的是淘宝的镜像源，但是还是安装失败了，也试过用梯子+官方仓库，还是不行，最后使用了淘宝的cnpm安装成功了

```
npm install -g cnpm --registry=https://registry.npm.taobao.org
cnpm install -g @vue/cli
```

### 版本确认

安装之后，你就可以在命令行中访问 vue 命令。

你可以通过简单运行 vue，看看是否展示出了一份所有可用命令的帮助信息，来验证它是否安装成功。

你还可以用这个命令来检查其版本是否正确：

```
λ vue -V
@vue/cli 4.5.13
```

# 升级

如需升级全局的 Vue CLI 包，请运行：

```
npm update -g @vue/cli

# 或者
yarn global upgrade --latest @vue/cli
```

## 项目依赖

上面列出来的命令是用于升级全局的 Vue CLI。

如需升级项目中的 Vue CLI 相关模块（以 @vue/cli-plugin- 或 vue-cli-plugin- 开头），请在项目目录下运行 vue upgrade：

```
用法： upgrade [options] [plugin-name]

（试用）升级 Vue CLI 服务及插件

选项：
  -t, --to <version>    升级 <plugin-name> 到指定的版本
  -f, --from <version>  跳过本地版本检测，默认插件是从此处指定的版本升级上来
  -r, --registry <url>  使用指定的 registry 地址安装依赖
  --all                 升级所有的插件
  --next                检查插件新版本时，包括 alpha/beta/rc 版本在内
  -h, --help            输出帮助内容
```

# 参考资料

[安装@vue/cli报错，npm ERR! gyp ERR! not ok](https://www.cnblogs.com/pangqianjin/p/14931304.html)

* any list
{:toc}