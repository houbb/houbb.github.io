---
layout: post
title: Typescript-02-install 安装
date:  2021-3-09 16:52:15 +0800
categories: [Web]
tags: [web, js, typescript, ts, ts-learn, js-learn, typescript-learn, sh]
published: true
---

# TypeScript 安装

本文介绍 TypeScript 环境的安装。

# NPM 安装 TypeScript

如果你的本地环境已经安装了 npm 工具，可以使用以下命令来安装。

## npm 安装

此处不再赘述，可参考 [npm 使用入门](https://houbb.github.io/2018/04/24/npm)

```
λ npm -version
6.14.4
```

## 安装 TypeScript

```
npm install -g typescript
```

可能会出现安装比较慢的情况，可以设置国内安装源：

```
npm config set registry https://registry.npm.taobao.org
```

### 版本查看

```
λ tsc -v
Version 4.2.3
```

# 入门例子


## 创建 ts 文件

我们新建一个 `.ts` 结尾的文件，

- app.ts

```js
var message:string = "Hello World" 
console.log(message)
```

### 编译

```
tsc app.ts
```

可以将 ts 文件，编译为 js 文件。执行后可以发现多了一个 app.js 文件，内容如下：

```js
var message = "Hello World";
console.log(message);
```

### 执行

```
$ node app.js
Hello World
```

# 参考资料

https://www.runoob.com/typescript/ts-install.html

* any list
{:toc}