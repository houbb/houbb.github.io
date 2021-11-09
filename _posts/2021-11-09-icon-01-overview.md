---
layout: post
title: ICON 图标框架 element-ui + ionicons + fontawesome
date: 2021-11-09 21:01:55 +0800
categories: [WEB]
tags: [web, front-end, icon, sh]
published: true
---

# 常见的 icon 

fontawesome

ionicons

element-ui

# element-ui

## 简介

[element-ui](https://element.eleme.io/#/zh-CN/component/icon) 前端框架自带的图标。

```html
<i class="el-icon-edit"></i>
```

## 缺点

个数不多。

# IonIcons

## 简介

[Ionicons](https://ionic.io/ionicons/usage) 是一个完全开源的图标集，包含 1,300 个为 Web、iOS、Android 和桌面应用程序制作的图标。 

Ionicons 是为 Ionic Framework 制作的，它是一个跨平台的混合渐进式 Web 应用程序框架。

## 使用 Web 组件

Ionicons Web 组件是在您的应用程序中使用 Ionicons 的一种简单且高效的方式。 

该组件将为每个图标动态加载一个 SVG，因此您的应用程序仅请求您需要的图标。

另请注意，仅加载可见图标，并且“低于折叠”并隐藏在用户视图中的图标不会对 svg 资源发出获取请求。

### 安装

如果您使用的是 Ionic Framework，则默认情况下会打包 Ionicons，因此无需安装。 

想在没有 Ionic Framework 的情况下使用 Ionicons？ 

将以下 `<script>` 放在靠近页面末尾的 `</body>` 结束标记之前，以启用它们。

```xml
<script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
<script nomodule src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>
```

### 基本使用

要使用 Ionicons 包中的内置图标，请填充 ion-icon 组件上的 name 属性：

```xml
<ion-icon name="heart"></ion-icon>
```

### 自定义图标

要使用自定义 SVG，请在 src 属性中提供其 url 以请求外部 SVG 文件。 

src 属性的工作方式与 `<img src="...">` 相同，因为必须可以从请求图像的网页访问 url。 

此外，外部文件只能是有效的 svg，并且不允许在 svg 元素中包含脚本或事件。

```xml
<ion-icon src="/path/to/external/file.svg"></ion-icon>
```

## 变体

Ionicons 中的每个应用程序图标都有一个填充、轮廓和锐利的变体。 

提供这些不同的变体是为了让您的应用程序感觉适合各种平台。 

填充的变体使用没有后缀的默认名称。 

注意：徽标图标没有轮廓或尖锐的变体。

```xml
<ion-icon name="heart"></ion-icon> <!--filled-->
<ion-icon name="heart-outline"></ion-icon> <!--outline-->
<ion-icon name="heart-sharp"></ion-icon> <!--sharp-->
```

### 平台特性

在 Ionic Framework 中使用图标时，您可以为每个平台指定不同的图标。 

使用 md 和 ios 属性并提供平台特定的图标/变体名称。

```xml
<ion-icon ios="heart-outline" md="heart-sharp"></ion-icon>
```

## 尺寸

要指定图标大小，您可以使用我们预定义字体大小的 size 属性。

```xml
<ion-icon size="small"></ion-icon>
<ion-icon size="large"></ion-icon>
```

或者您可以通过在 ion-icon 组件上应用 font-size CSS 属性来设置特定大小。 

建议使用 8 的倍数（8、16、32、64 等）的像素大小

```css
ion-icon {
  font-size: 64px;
}
```

## 颜色

通过在 ion-icon 组件上应用 color CSS 属性来指定图标颜色。

```css
ion-icon {
  color: blue;
}
```

## 行程重量(Stroke weight)

使用轮廓图标变体时，可以调整笔画粗细，以改善相对于图标大小或相邻文本粗细的视觉平衡。 

您可以通过将 --ionicon-stroke-weight CSS 自定义属性应用于 ion-icon 组件来设置特定大小。 

默认值为 32px

```xml
<ion-icon name="heart-outline"></ion-icon>
```

```css
ion-icon {
  --ionicon-stroke-width: 16px;
}
```


# FontAwesome

## 最基本的使用


```xml
<link rel="stylesheet" href="path/to/font-awesome/css/font-awesome.min.css">
```

然后就可以正常使用：

你可以通过设置CSS前缀fa和图标的具体名称，来把Font Awesome 图标放在任意位置。

Font Awesome 被设计为用于行内元素（我们喜欢用更简短的 `<i>` 标签，它的语义更加精准）。 


```xml
<i class="fa fa-camera-retro"></i> fa-camera-retro
```

## vue 中直接使用

1、在项目中安装fontawesome：`npm install font-awesome --save`

2、在main.js中引入相关的文件：`import 'font-awesome/css/font-awesome.min.css'`

3、在需要使用的地方，class=`fa 类名`，请注意一定要在前面添加fa类，否则无法正常显示；

## vue 插件

[Set Up with Vue.js](https://fontawesome.com/v6.0/docs/web/use-with/vue/)

### 1.添加 SVG 核心

首先，您需要使用 npm 或 yarn 安装核心包，其中包含使图标工作的所有实用程序：

```
# install the beta package - using the @next flag
npm i --save @fortawesome/fontawesome-svg-core@next
```

### 2.添加图标包

接下来，您将安装要使用的图标 - 您可以选择免费或专业图标，并选择我们的任何样式。

免费的：

```
# Free icons styles
npm i --save @fortawesome/free-solid-svg-icons@next
npm i --save @fortawesome/free-regular-svg-icons@next
```

### 3.添加 Vue 组件

最后，安装 Font Awesome Vue 组件：

```
npm i --save @fortawesome/vue-fontawesome@latest
```

# 参考资料

http://www.fontawesome.com.cn/

[Vue 项目中使用 FontAwesome](https://blog.csdn.net/u013840388/article/details/108293432)

https://fontawesome.com/v6.0/docs/web/use-with/vue/add-icons

* any list
{:toc}