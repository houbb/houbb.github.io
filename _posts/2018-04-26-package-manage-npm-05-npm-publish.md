---
layout: post
title:  NPM-05-npm publish 发布与 CDN
date:  2018-04-24 22:22:23 +0800
categories: [NPM]
tags: [frontend, npm, npm]
published: true
---

# npm 初始化

```
cnpm init
```

一个项目，首先初始化，然后填写对应的基本信息。

## 属性

```
    接着就依次填写, 不想填写的话也可以一路Enter

    name： 模块名，之后发布之后就可以让用户npm install xxxx来引用你的开源模块了 version：
    版本号，语义版本号分为X.Y.Z三位，分别代表主版本号、次版本号和补丁版本号。当代码变更时，版本号按以下原则更新。
    如果只是修复bug，需要更新Z位。 如果是新增了功能，但是向下兼容，需要更新Y位。

    如果有大变动，向下不兼容，需要更新X位。

    description： 简单介绍自己的模块

    main： 入口文件，必要，当通过require(‘xxx’)时，是读取main里声明的文件

    test command： 测试命令

    git repository： git仓库地址

    keywords： 关键词，可以通过npm搜索你填写的关键词找到你的模块

    author： 作者信息，可以之后编辑更详细一些

    license（ISC）： 代码授权许可 可以参考这里

    以上放心可以大胆写，因为之后反正要改。

    初始化项目完成，可以看到目录中出现了一个叫 package.json 的文件
```

## package.json

此时，会生成对应的 package.json

```json
{
  "name": "monitor-web",
  "version": "1.0.0",
  "description": "The web monitor tool.",
  "main": "index.js",
  "directories": {
    "example": "example"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/houbb/monitor-web-js.git"
  },
  "keywords": [
    "monitor"
  ],
  "author": "houbb",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/houbb/monitor-web-js/issues"
  },
  "homepage": "https://github.com/houbb/monitor-web-js#readme"
}
```

# index.js

在 package.json 同级目录下新建 `index.js`，存放要发布到npm上的函数 该文件内容如下

直接把代码全部拷贝到 index.js 中。

# install

执行 `npm install -g` 检查是否报错

日志：

```
λ npm install -g
npm WARN config global `--global`, `--local` are deprecated. Use `--location=global` instead.
npm WARN config global `--global`, `--local` are deprecated. Use `--location=global` instead.

added 1 package, and audited 3 packages in 704ms

found 0 vulnerabilities
```

## link

执行 `npm link`(旨在安装开发包并实时查看更改，而无需继续重新安装)

# 登录npm账号

## 注册

可以在官方网站 [https://registry.npmjs.org/](https://registry.npmjs.org/) 注册账户。

执行 

```
npm login 
```

ps: npm 官方网站也可以。

然后输入对应的账户密码+验证即可。

## 发布

执行 `npm publish` 上传代码到npm包管理库

### 报错：

```
npm ERR! 403 403 Forbidden - PUT https://registry.npmjs.org/monitor-web - You do not have permission to publish "monitor-web". Are you logged in as the correct user?
```

比较奇怪，明明已经做了登录。

后来查了一下，也可能是因为**仓库的名称已经重复了**。

ps: npm 名称作为唯一的标识，所以很容易重复。

### 修正

把 package.json 的名字改了一下，发布成功。

```
λ npm publish
npm WARN config global `--global`, `--local` are deprecated. Use `--location=global` instead.
npm notice
npm notice �  houbb-monitor-web@1.0.0
npm notice === Tarball Contents ===
npm notice 2.1kB  CHANGELOG.md
npm notice 3.4kB  CNPM_INIT.md
npm notice 2.2kB  README.md
npm notice 258B   cgit.bat
npm notice 980B   example/hello.html
npm notice 969B   example/perf.html
npm notice 30.6kB index.js
npm notice 567B   package.json
npm notice 47B    source/error.js
npm notice 599B   source/errorXHR.js
npm notice 30.6kB source/monitor-web.js
npm notice === Tarball Details ===
npm notice name:          houbb-monitor-web
npm notice version:       1.0.0
npm notice filename:      houbb-monitor-web-1.0.0.tgz
npm notice package size:  12.2 kB
npm notice unpacked size: 72.3 kB
npm notice shasum:        d6d973aff774bc747ddac5bfeb09564ae2961ec3
npm notice integrity:     sha512-OnDq/qvjBHqTa[...]0Ubju68fZmeaA==
npm notice total files:   11
npm notice
npm notice Publishing to https://registry.npmjs.org/
+ houbb-monitor-web@1.0.0
```

# 使用

到这里，如果没报错的话，你的代码库就成功提交到npm库了，cnpm会自动将npm中的代码库同步到国内镜像，所以也可以使用cnpm进行部署（刚发布的代码库相对npm有些延迟，cnpm同步频率为10分钟，我自己测试了一下，如果代码量少的话一两分钟就能实现代码同步）

使用（在你需要使用这个库的项目中部署就行了）

## npm install

```
npm install houbb-monitor-web --save
```

## CDN

cdn 的引入方式：

```xml
<script src="https://cdn.jsdelivr.net/npm/houbb-monitor-web@1.0.0/index.js"></script>
```

# 参考资料

https://www.cnblogs.com/yalong/p/15214644.html

* any list
{:toc}







