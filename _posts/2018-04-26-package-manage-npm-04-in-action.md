---
layout: post
title:  NPM-03-npm 配置实现
date:  2018-04-24 22:22:23 +0800
categories: [NPM]
tags: [frontend, npm, npm]
published: true
---

# 简单的配置

- package.json

```json
{
    "name": "vue-admin",
    "version": "1.0.0",
    "private": true,
    "scripts": {
        "dev": "vue-cli-service serve",
        "build:test": "vue-cli-service build --mode test",
        "build:prod": "vue-cli-service build --mode production",
        "build": "vue-cli-service build",
        "lint": "vue-cli-service lint"
    },
    "dependencies": {
        "axios": "^0.19.2",
        "core-js": "^3.6.4",
        "element-ui": "^2.15.5",
        "iview": "^3.5.4",
        "moment": "^2.29.1",
        "node-sass": "^4.14.1",
        "vue": "^2.6.11",
        "vue-router": "^3.0.7",
        "vuex": "^3.1.2"
    },
    "devDependencies": {
        "@vue/cli-plugin-babel": "^4.2.0",
        "@vue/cli-plugin-eslint": "^4.2.0",
        "@vue/cli-service": "^4.2.0",
        "@vue/eslint-config-standard": "^5.1.0",
        "babel-eslint": "^10.0.3",
        "eslint": "^6.7.2",
        "eslint-plugin-import": "^2.20.1",
        "eslint-plugin-node": "^11.0.0",
        "eslint-plugin-promise": "^4.2.1",
        "eslint-plugin-standard": "^4.0.0",
        "eslint-plugin-vue": "^6.1.2",
        "sass-loader": "^8.0.2",
        "vue-template-compiler": "^2.6.11"
    }
}
```

# 启动

```
npm install
```

安装所有的依赖包。

```
npm install dev
```

实际上运行的是：

```
vue-cli-service serve
```

也就是我们配置的命令。

那么，这个 vue-cli-service 是何许人也？

# 参考资料

[about-npm](https://docs.npmjs.com/about-npm)

* any list
{:toc}







