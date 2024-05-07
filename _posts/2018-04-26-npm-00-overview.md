---
layout: post
title:  NPM-node.js 的包管理工具
date:  2018-04-24 22:22:23 +0800
categories: [NodeJs]
tags: [js, nodejs, npm]
published: true
---


# NPM

NPM 是 node.js 的一种包管理工具。

作用：

- 允许用户从NPM服务器下载别人编写的第三方包到本地使用

- 允许用户从NPM服务器下载并安装别人编写的命令行程序到本地使用

- 允许用户将自己编写的包或命令行程序上传到NPM服务器供别人使用

## 版本

### 查看

```
$ npm -v
5.6.0
```

### 版本号说明

使用NPM下载和发布代码时都会接触到版本号。NPM使用语义版本号来管理代码，这里简单介绍一下。

语义版本号分为X.Y.Z三位，分别代表主版本号、次版本号和补丁版本号。当代码变更时，版本号按以下原则更新。

- 如果只是修复bug，需要更新Z位。

- 如果是新增了功能，但是向下兼容，需要更新Y位。

- 如果有大变动，向下不兼容，需要更新X位。

## 淘宝镜像

有时候国内比较慢，可以参考 [npm 淘宝](http://npm.taobao.org/)

# NPM 安装

## 安装方式

- 命令

```
$   npm install <moduleName>
```

- 引入

安装好之后，`<moduleName>` 包就放在了工程目录下的 **node_modules** 目录中，

引入

```
var module = require('<moduleName>');
```

## 全局安装 & 本地安装

- 命令行区别

```
npm install express          # 本地安装
npm install express -g      # 全局安装
```

### 本地安装

1. 将安装包放在 ./node_modules 下（运行 npm 命令时所在的目录），
如果没有 node_modules 目录，会在当前执行 npm 命令的目录下生成 node_modules 目录。

2. 可以通过 require() 来引入本地安装的包。

### 全局安装

1. 将安装包放在 /usr/local 下或者你 node 的安装目录。
2. 可以直接在命令行里使用。

- 查看所有全局安装的模块

```
npm list -g
```

## 删除

```
$ npm uninstall express
```

## 更新

```
npm update express
```

## 搜索模块

```
npm search express
```


# package.json

大部分的项目依赖较为复杂，使用 `package.json` 可以统一指定所需的依赖。

## 简单文件案例

```json
{
  "name": "webpack-demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "webpack": "^4.6.0",
    "webpack-cli": "^2.0.15"
  },
  "dependencies": {
    "lodash": "^4.17.5"
  }
}
```

## 说明

| 字段 | 说明 |
|:---|:---|
| name | 包名 |
| version | 包的版本号 |
| description | 包的描述 |
| homepage | 包的官网 url |
| author | 包的作者姓名 |
| contributors | 包的其他贡献者姓名 |
| dependencies | 依赖包列表。如果依赖包没有安装，npm 会自动将依赖包安装在 node_module 目录下 |
| repository | 包代码存放的地方的类型，可以是 git 或 svn，git 可在 Github 上 |
| main | main 字段指定了程序的主入口文件，require('moduleName') 就会加载这个文件。这个字段的默认值是模块根目录下面的 index.js |
| keywords | 关键字 |

# npm 的构建和发布

## 构建

创建模块，package.json 文件是必不可少的。我们可以使用 NPM 生成 package.json 文件，生成的文件包含了基本的结果。

```
$   npm init
```

## 发布

```
$   npm publish
```

# npm 常用命令

- npm install [-g] 本地或全局安装模块

- npm uninstall [-g] 本地或全局卸载模块

- npm update 更新模块

- npm ls 查看安装的模块

- npm list 列出已安装模块

- npm show  显示模块详情

- npm info 查看模块的详细信息

- npm search 搜索模块

- npm publish 发布模块

- npm unpublish 删除已发布的模块

- npm -v 或 npm version显示版本信息

- npm view npm versions 列出npm 的所有有效版本

- npm install -g npm@2.14.14 /npm update -g npm@2.14.14  安装指定的npm版本

- npm init 引导创建一个package.json文件，包括名称、版本、作者这些信息等

- npm outdated  #检查模块是否已经过时

- npm root  [-g] 查看包的安装路径，输出 node_modules的路径，

- npm help 查看某条命令的详细帮助 例如输入npm help install

- npm config 管理npm的配置路径

# NPM 常用命令

除了本章介绍的部分外，NPM还提供了很多功能，package.json里也有很多其它有用的字段。

除了可以在 npmjs.org/doc/ 查看官方文档外，这里再介绍一些NPM常用命令。

NPM提供了很多命令，例如install和publish，使用npm help可查看所有命令。

NPM提供了很多命令，例如install和publish，使用npm help可查看所有命令。

使用 `npm help <command>` 可查看某条命令的详细帮助，例如npm help install。

在package.json所在目录下使用 `npm install . -g` 可先在本地安装当前命令行程序，可用于发布前的本地测试。

使用 `npm update <package>` 可以把当前目录下node_modules子目录里边的对应模块更新至最新版本。

使用 `npm update <package>` -g可以把全局安装的对应命令行程序更新至最新版。

使用 `npm cache clear` 可以清空NPM本地缓存，用于对付使用相同版本号发布新版本代码的人。

使用 `npm unpublish <package>@<version>` 可以撤销发布自己发布过的某个版本代码。

* any list
{:toc}