---
layout: post
title:  Vue Cli-03-prototype 项目原型快速开发
date:  2018-06-14 15:16:10 +0800
categories: [Vue]
tags: [vue]
published: true
---

# 快速原型开发

你可以使用 vue serve 和 vue build 命令对单个 `*.vue` 文件进行快速原型开发，不过这需要先额外安装一个全局的扩展：

```
npm install -g @vue/cli-service-global
```

vue serve 的缺点就是它需要安装全局依赖，这使得它在不同机器上的一致性不能得到保证。

因此这只适用于快速原型开发。

## vue serve

```
Usage: serve [options] [entry]

在开发环境模式下零配置为 .js 或 .vue 文件启动一个服务器


Options:

  -o, --open  打开浏览器
  -c, --copy  将本地 URL 复制到剪切板
  -h, --help  输出用法信息
```

你所需要的仅仅是一个 App.vue 文件：

```vue
<template>
  <h1>Hello!</h1>
</template>
```

然后在这个 App.vue 文件所在的目录下运行：

```
vue serve
```

直接就可以启动，日志如下：

```
App running at:
- Local:   http://localhost:8080/
- Network: http://172.31.30.151:8080/

Note that the development build is not optimized.
To create a production build, run npm run build.
```

vue serve 使用了和 vue create 创建的项目相同的默认设置 (webpack、Babel、PostCSS 和 ESLint)。

它会在当前目录自动推导入口文件——入口可以是 main.js、index.js、App.vue 或 app.vue 中的一个。

你也可以显式地指定入口文件：

```
vue serve MyComponent.vue
```

如果需要，你还可以提供一个 index.html、package.json、安装并使用本地依赖、甚至通过相应的配置文件配置 Babel、PostCSS 和 ESLint。

## vue build

```
Usage: build [options] [entry]

在生产环境模式下零配置构建一个 .js 或 .vue 文件


Options:

  -t, --target <target>  构建目标 (app | lib | wc | wc-async, 默认值：app)
  -n, --name <name>      库的名字或 Web Components 组件的名字 (默认值：入口文件名)
  -d, --dest <dir>       输出目录 (默认值：dist)
  -h, --help             输出用法信息
```

你也可以使用 vue build 将目标文件构建成一个生产环境的包并用来部署：

```
vue build MyComponent.vue
```

vue build 也提供了将组件构建成为一个库或一个 Web Components 组件的能力。

查阅构建目标了解更多。

### 实际例子

```
vue build App.vue
```

可以在 dist 文件夹下看到编译后的内容：

index.html 以及对应的 *.js 文件。

# 参考资料

https://cli.vuejs.org/zh/guide/prototyping.html

* any list
{:toc}