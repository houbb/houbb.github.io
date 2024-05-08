---
layout: post
title: 前端 css 库 Boostrap 简介
date:  2018-04-22 09:19:44 +0800
categories: [Web]
tags: [web, css, css-lib, front, sh]
published: true
---

# Boostrap 

[Boostrap](https://getbootstrap.com/docs/4.4/getting-started/introduction/) 简洁、直观、强悍的前端开发框架，让web开发更迅速、简单。

# 入门模板

```html
<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">

    <title>Hello, world!</title>
  </head>
  <body>
    <h1>Hello, world!</h1>

    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>
  </body>
</html>
```

# chat

## 详细介绍一下 bootstrap

Bootstrap是一个流行的前端开源工具包，用于开发响应式和移动优先的网页。它由Twitter的Mark Otto和Jacob Thornton共同开发，并在MIT License下开源。以下是Bootstrap的一些详细介绍：

### 1. 响应式布局

Bootstrap的核心特性之一是其响应式布局，它使用一系列预定义的类和网格系统来创建灵活的布局，能够适应不同大小的屏幕。

### 2. 预定义组件

Bootstrap提供了丰富的UI组件，如按钮、表格、表单、导航条、下拉菜单、模态框、轮播图等，这些组件在设计和功能上都经过了精心的打磨。

### 3. 栅格系统

Bootstrap的栅格系统基于行和列，它允许你创建布局的行，然后在这些行中添加列。Bootstrap默认提供12列的栅格系统，可以很容易地通过预定义的类创建分栏布局。

### 4. 预设样式

Bootstrap为HTML元素提供了一套预设样式，如边距、内边距、字体大小等，这使得开发者能够快速地开始构建页面，而不需要从零开始设置样式。

### 5. JavaScript插件

除了CSS样式，Bootstrap还包含了一些JavaScript插件，如模态框、下拉菜单、轮播图、弹窗、滚动监听等，这些插件增强了网页的交互性。

### 6. 移动设备优先

Bootstrap在设计上遵循移动设备优先的原则，这意味着Bootstrap的样式首先是为移动设备设计的，然后通过媒体查询为桌面设备提供更宽的布局。

### 7. 定制性

Bootstrap允许高度定制，你可以通过修改源码中的变量来定制主题，或者使用Bootstrap的定制工具来生成定制版Bootstrap。

### 8. 社区和文档

Bootstrap有一个活跃的社区和详尽的文档，这为学习和使用Bootstrap提供了丰富的资源。

### 9. 版本

Bootstrap已经经历了多个版本的迭代，每个版本都带来了新的特性和改进。截至2023年，Bootstrap 5是最新版本，它引入了对暗色模式的支持、新的组件和改进的栅格系统等。

### 使用Bootstrap

要在项目中使用Bootstrap，你可以通过以下方式之一：

- 下载Bootstrap的CSS和JavaScript文件，然后在HTML中引入它们。
- 使用CDN（内容分发网络）直接链接Bootstrap资源。
- 通过npm或yarn等包管理器安装Bootstrap。

### 示例：在HTML中引入Bootstrap

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- 引入Bootstrap的CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/5.1.3/css/bootstrap.min.css">
</head>
<body>
    <div class="container">
        <h1>Hello, Bootstrap!</h1>
        <p class="lead">这是一个使用Bootstrap样式的段落。</p>
        <button class="btn btn-primary">点击我</button>
    </div>

    <!-- 引入Bootstrap的JavaScript和依赖项 -->
    <script src="https://code.jquery.com/jquery-3.6.0.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/5.1.3/js/bootstrap.min.js"></script>
</body>
</html>
```

在这个示例中，我们通过CDN引入了Bootstrap 5的CSS和JavaScript文件。

然后，我们使用Bootstrap的类来添加样式和创建一个按钮。

Bootstrap是一个强大的工具，可以帮助你快速构建美观、响应式的网页。

通过使用Bootstrap，你可以节省大量时间，并确保你的设计在不同设备上都能良好展示。

## 类似于 bootstrap 的前端样式库还有哪些？给出网址

类似于Bootstrap的前端样式库有很多，它们提供了丰富的组件和响应式布局，以便开发者能够快速构建美观的网页。

以下是一些流行的替代选项以及它们的网址：

1. **Pico.css**
   - 一个简单轻量化的CSS UI框架，它基于HTML原始标签名和内置属性来定义样式，减少class的使用，使得代码语义清晰，可维护性强。
   - 网址：[Pico.css](https://picocss.com)

2. **Pure.css**
   - 一个小型、功能丰富的CSS框架，专注于为小型网站提供快速、可重用的样式。
   - 网址：[Pure.css](https://purecss.io/)

3. **Element UI**
   - 由饿了么团队开发，是一个专为开发者、设计师和产品经理准备的桌面端组件库，基于Vue.js。
   - 网址：[Element UI](https://element.eleme.cn/)

4. **Ant Design**
   - 蚂蚁金服出品，基于React的UI设计语言。
   - 网址：[Ant Design](https://ant.design/)

5. **Foundation**
   - 一套灵活适配于任何设备的框架，提供丰富的响应式UI组件。
   - 网址：[Foundation](https://foundation.zurb.com/)

6. **MDUI**
   - 遵循Material Design设计规范，使用Web Components技术开发的开源前端组件库。
   - 网址：[MDUI](https://www.mdui.org/zh-cn/)

7. **Layui**
   - 一套开源免费的Web UI组件库，采用极简的轻量级模块化规范，易于上手。
   - 网址：[Layui](https://layui.dev/)

8. **Sober**
   - 轻量级的Material You设计前端组件库，极致轻量化，无侵入性，无需引入任何CSS样式文件。
   - 网址：[Sober](https://soberjs.com/)

9. **AmazeUI**
   - 以移动优先，从小屏逐步扩展到大屏，实现所有屏幕适配，关注中文排版效果。
   - 网址：[AmazeUI](https://amazeui.org/)

10. **ZUI**
    - 一套开源HTML5跨屏框架，基于Bootstrap深度定制，帮助你快速构建现代跨屏应用。
    - 网址：[ZUI](https://zui.sexy/)

这些样式库各有特点，开发者可以根据项目需求和个人喜好选择合适的工具。

# 参考资料

[node.js、npm、vue、webpack之间的关系](https://www.cnblogs.com/chudonghai/p/11325485.html)

* any list
{:toc}