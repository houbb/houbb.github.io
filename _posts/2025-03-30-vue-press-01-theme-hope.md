---
layout: post
title: vuepress-01-theme hope 主题体验
date: 2025-3-30 12:56:46 +0800
categories: [Vue]
tags: [vue, blog, sh]
published: true
---

# 前言

大家好，我是老马。

以前的基于 jekyll 的博客实在是太老了，就像体验一下新的 vuepress，看了下 hope 主题还不错。

# 主题介绍

VuePress 在一定程度上扩展了 Markdown 语法，但仍然缺少一些常用的功能，例如文本对齐、标记、流程图、公式、演示等，同时默认主题提供的一些功能较弱或缺失，如图片预览、代码块复制、目录页等。

同时 VuePress 默认主题太简陋，功能不够强大。在这种情况下，vuepress-theme-hope 和一些系列插件就应运诞生。

与默认主题相比，我们不仅大大改进了美观度，而且通过主题插件为 VuePress 提供了全方位的增强功能。

# 快速入门

## 创建

```
npm init vuepress-theme-hope@latest vpress
```

### 配置

按照自己选择即可

```
>npm init vuepress-theme-hope@latest vpress
Need to install the following packages:
create-vuepress-theme-hope@2.0.0-rc.77
Ok to proceed? (y) y
√ Select a language to display / 选择显示语言 简体中文
√ 选择包管理器 npm
√ 你想要使用哪个打包器？ vite
生成 package.json...
√ 设置应用名称 vpress
√ 设置应用描述 vue press hope blogs
√ 设置应用版本号 2.0.0
√ 设置协议 MIT
生成 tsconfig.json...
√ 你想要创建什么类型的项目？ blog
√ 项目需要用到多语言么? Yes
生成模板...
√ 是否初始化 Git 仓库? Yes
√ 是否需要一个自动部署文档到 GitHub Pages 的工作流？ Yes
√ 选择你想使用的源 当前源
安装依赖...
这可能需要数分钟，请耐心等待.
我们无法正确输出子进程的进度条，所以进程可能会看似未响应

added 397 packages in 23s

105 packages are looking for funding
  run `npm fund` for details
模板已成功生成!
√ 是否想要现在启动 Demo 查看? Yes
启动开发服务器...
启动成功后，请在浏览器输入给出的开发服务器地址(默认为 'localhost:8080')

> vpress@2.0.0 docs:dev
> vuepress-vite dev src


  vite v6.1.2 dev server running at:

  ➜  Local:   http://localhost:8080/
```

然后直接打开 [http://localhost:8080/](http://localhost:8080/) 就可以访问。

# 图标

默认的图标支持为 https://icon-sets.iconify.design/

https://theme-hope.vuejs.press/zh/guide/interface/icon.html#%E5%9C%A8%E7%BB%84%E4%BB%B6%E4%B8%AD

# 引入搜索功能

这里还是优先选择 `@vuepress/plugin-slimsearch`

## 安装

```
npm i -D @vuepress/plugin-slimsearch@next
```

## 配置

你可以将 plugins.slimsearch 设置为 true 来直接启用它，或者将其设置为一个对象来自定义插件。

```ts
import { hopeTheme } from "vuepress-theme-hope";

export default {
  theme: hopeTheme({
    plugins: {
      // 插件选项
      slimsearch: {
        // ...
      },
      // 或 slimsearch: true,
    },
  }),
};
```

重新启动项目后，则支持搜索功能。


 

# 参考资料

https://theme-hope.vuejs.press/zh/guide/intro/intro.html#%E5%86%85%E7%BD%AE%E6%8F%92%E4%BB%B6-%F0%9F%A7%A9

* any list
{:toc}