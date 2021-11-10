---
layout: post
title: jam icons 免费开源的图标使用入门
date: 2021-11-09 21:01:55 +0800
categories: [WEB]
tags: [web, front-end, web, icon, sh]
published: true
---

# JAM 

[Jam](https://jam-icons.com) 图标是一组为 Web 项目、插图、印刷项目等设计的 SVG 图标。

MIT 许可。 

图标：https://jam-icons.com

# v2

网址：https://v2.jam-icons.com/

# 快速开始

## JS

它将您的标记转换为干净的svg标记。

您只需使用span或whatever标记内的data-jam属性来选择图标（属性如下所示）。所以如果你写：

```xml
<span class="your-custom-class" data-jam="backpack" data-fill="#222"></span>
```

将会被转换为：

```xml
<svg class="jam jam-backpack your-custom-class" data-fill="#222">[...]</svg>
```

### install

通过CDN（推荐）

```xml
<script src="https://unpkg.com/jam-icons/js/jam.min.js"></script>
```

or npm

```
$ npm install jam-icons
```

或者手动下载 JS 放入本地。

```
<script src="/path/to/js/jam.min.js"></script>
```

## 属性

data-jam（必需）要使用的图标，例如data-jam="backpack"

data-fill（可选）RGB或十六进制，例如data-fill="#F5C25A"

data-width（可选）整数，例如data-width="32"

data-height（可选）整数，例如data-height="32"

# CSS/字体

## Usage

另一种方法。

加载CSS样式表并使用Jam图标作为字体图标。您只需使用jam类，后跟要使用的图标名称，前缀为jam-，如下所示：

```xml
<span class="jam jam-backpack"></span>
```

## install

- cdn

```xml
<link rel="stylesheet" href="https://unpkg.com/jam-icons/css/jam.min.css">
```

- npm

```
npm install jam-icons
```

- manually

```xml
<link rel="stylesheet" type="text/css" href="/path/to/css/jam.min.css">
```

# vue 整合实战

## 项目安装

```
cnpm install jam-icons --save
```

此时 package.json 配置文件会发生变化：

```js
"dependencies": {
    "axios": "^0.19.2",
    "core-js": "^3.6.4",
    "element-ui": "^2.15.5",
    "iview": "^3.5.4",
    "jam-icons": "^2.0.0",
    "vue": "^2.6.11",
    "vuex": "^3.1.2",
  },
```

## 引入使用

我们在 main.js 中使用

```js
import 'jam-icons/css/jam.min.css'
```

直接引入对应的样式。

## 页面使用

```xml
<i class="jam jam-clock"></i>
```


# 参考资料

https://www.5axxw.com/wiki/content/w5ndet

* any list
{:toc}