---
layout: post
title: VUE3-20-VUE 入门例子实战
date: 2021-08-02 21:01:55 +0800
categories: [VUE]
tags: [vue, hello-world, vue-learn, sh]
published: true
---

# vue-cli 安装

## 依赖

```
λ node -v
v12.16.2

λ npm -v
6.14.4
```

## 安装

```
npm install -g cnpm --registry=https://registry.npm.taobao.org
cnpm install -g @vue/cli
```

# 创建应用

## 创建

```
vue create vue-hello
```

生成后的目录如下：

```
λ ls -a

.git/  .gitignore  babel.config.js  node_modules/  package.json  package-lock.json  public/  README.md  src/
```

## 文件介绍

```
.git  git 相关文件
.gitignore  git 忽略配置
babel.config.js babel 相关配置
node_modules  npm 安装包文件夹
package.json npm 配置
package-lock.json 锁定安装时的包的版本号，并且需要上传到git，以保证其他人在npm install时大家的依赖能保证一致。
public 公共资源文件夹
README.md 说明文档
src 源目录
```

##  .gitignore

默认内容如下:

```
.DS_Store
node_modules
/dist


# local env files
.env.local
.env.*.local

# Log files
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

## babel.config.js

```js
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ]
}
```

## package.json

```js
{
  "name": "vue-hello",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "lint": "vue-cli-service lint"
  },
  "dependencies": {
    "core-js": "^3.6.5",
    "vue": "^2.6.11"
  },
  "devDependencies": {
    "@vue/cli-plugin-babel": "~4.5.0",
    "@vue/cli-plugin-eslint": "~4.5.0",
    "@vue/cli-service": "~4.5.0",
    "babel-eslint": "^10.1.0",
    "eslint": "^6.7.2",
    "eslint-plugin-vue": "^6.2.2",
    "vue-template-compiler": "^2.6.11"
  },
  "eslintConfig": {
    "root": true,
    "env": {
      "node": true
    },
    "extends": [
      "plugin:vue/essential",
      "eslint:recommended"
    ],
    "parserOptions": {
      "parser": "babel-eslint"
    },
    "rules": {}
  },
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ]
}
```

## public 文件夹

下面两个文件：

```
favicon.ico   #vue 的 logo

index.html    #初始化页面
```

- index.html

```html
<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="icon" href="<%= BASE_URL %>favicon.ico">
    <title><%= htmlWebpackPlugin.options.title %></title>
  </head>
  <body>
    <noscript>
      <strong>We're sorry but <%= htmlWebpackPlugin.options.title %> doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
    </noscript>
    <div id="app"></div>
    <!-- built files will be auto injected -->
  </body>
</html>
```





# 参考资料

https://v3.cn.vuejs.org/guide/introduction.html#%E5%A3%B0%E6%98%8E%E5%BC%8F%E6%B8%B2%E6%9F%93

[package-lock.json的作用](https://www.cnblogs.com/cangqinglang/p/8336754.html)

* any list
{:toc}