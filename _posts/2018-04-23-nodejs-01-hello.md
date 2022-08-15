---
layout: post
title:  NodeJs-01 Hello nodejs install windows11 npm/cnpm install
date:  2018-04-23 09:19:44 +0800
categories: [NodeJs]
tags: [js, nodejs]
published: true
---

# NodeJs

[Node.js®](https://nodejs.org/en/) is a JavaScript runtime built on Chrome's V8 JavaScript engine. 

Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.
 
Node.js' package ecosystem, npm, is the largest ecosystem of open source libraries in the world.


# 相关教程

> [正确学习 node](https://i5ting.github.io/How-to-learn-node-correctly/)

> [Node.js 教程](https://github.com/wangdoc/node-tutorial)

# 安装

- 安装

直接首页下载安装即可，比较简单。

- 测试确认

```
$ node -v
v6.2.2
```

## windows11 安装实战

> [node-v16.16.0-x64.msi](https://nodejs.org/dist/v16.16.0/node-v16.16.0-x64.msi)

调整默认的安装路径：

```
D:\Program Files\nodejs\
```

查看版本：

```
λ node -v
v16.16.0
```

## cnpm 安装处理

```
λ npm -v
npm WARN config global `--global`, `--local` are deprecated. Use `--location=global` instead.
8.11.0
```

npm 作为默认的安装路径，在国内可能会比较慢。

cnpm install 安装 

```
npm install -g cnpm --registry=https://registry.npm.taobao.org
```

# 入门案例

- hello-world.js

```js
console.log("hello, nodejs!");
```

- 编译

命令行直接执行

```
$   node hello-world.js
```

- 结果

```
$ node hello-world.js 
hello, nodejs!
```


# 版本更新

原来的版本相对较老，为了方便后期学习，更新至最新版，

## 教程

- 第一步，先查看本机 node.js 版本

```
$ node -v
```

- 第二步，清除 node.js 的 cache

```
$ sudo npm cache clean -f
```

- 第三步，安装 n 工具，这个工具是专门用来管理 node.js 版本的

```
$ sudo npm install -g n
```

- 第四步，安装最新版本的node.js

```
$ sudo n stable
```

- 第五步，再次查看本机的node.js版本：

```
$ node -v
```

## 实际操作

```
houbinbindeMacBook-Pro:~ houbinbin$ sudo npm cache clean -f
Password:
npm WARN using --force I sure hope you know what you are doing.
houbinbindeMacBook-Pro:~ houbinbin$ sudo npm install -g n
/usr/local/bin/n -> /usr/local/lib/node_modules/n/bin/n
/usr/local/lib
└── n@2.1.8 

houbinbindeMacBook-Pro:~ houbinbin$ sudo n stable

     install : node-v9.10.1
       mkdir : /usr/local/n/versions/node/9.10.1
       fetch : https://nodejs.org/dist/v9.10.1/node-v9.10.1-darwin-x64.tar.gz
######################################################################## 100.0%
   installed : v9.10.1

houbinbindeMacBook-Pro:~ houbinbin$ node -v
v9.10.1
```


* any list
{:toc}