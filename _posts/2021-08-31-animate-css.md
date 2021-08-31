---
layout: post
title: Animate.css 动态 CSS
date: 2021-08-29 21:01:55 +0800
categories: [WEB]
tags: [web, css, sh]
published: true
---

# Animate.css

Animate.css 是一个随时可用的跨浏览器动画库，可用于您的 Web 项目。 

非常适合强调、主页、滑块和注意力引导提示。

# Installation and usage

## 安装

```
$ npm install animate.css --save
```

or

```
$ yarn add animate.css
```

or:

```
import "animate.css"
```

或者使用 CDN

```html
<head>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
  />
</head>
```

# 基本用法

安装 Animate.css 后，将类 animate__animated 添加到元素中，以及任何动画名称（不要忘记 animate__ 前缀！）：

```html
<h1 class="animate__animated animate__bounce">An animated element</h1>
```

就是这样！ 你有一个 CSS 动画元素。 极好的！

动画可以改善界面的用户体验，但请记住，它们也会妨碍您的用户！ 

请阅读最佳实践和陷阱部分，以尽可能最好的方式让您的网络事物栩栩如生。

# 使用@keyframes

尽管该库为您提供了一些帮助类，例如动画类来让您快速运行，但您可以直接使用提供的动画关键帧。 

这提供了一种灵活的方式来将 Animate.css 用于您当前的项目，而无需重构您的 HTML 代码。

例子：

```css
.my-element {
  display: inline-block;
  margin: 0 0.5rem;

  animation: bounce; /* referring directly to the animation's @keyframe declaration */
  animation-duration: 2s; /* don't forget to set a duration! */
}
```

请注意，某些动画取决于动画类上设置的 animation-timing 属性。 

更改或不声明它可能会导致意想不到的结果。

# CSS 自定义属性（CSS 变量）

从版本 4 开始，Animate.css 使用自定义属性（也称为 CSS 变量）来定义动画的持续时间、延迟和迭代次数。 

这使得 Animate.css 非常灵活和可定制。 

需要更改动画持续时间？ 只需在全局或本地设置一个新值。

例子：

```css
/* This only changes this particular animation duration */
.animate__animated.animate__bounce {
  --animate-duration: 2s;
}

/* This changes all the animations globally */
:root {
  --animate-duration: 800ms;
  --animate-delay: 0.9s;
}
```

自定义属性还可以轻松地动态更改所有动画的时间受限属性。 

这意味着您可以使用 javascript one-liner 获得慢动作或延时效果：

```js
// All animations will take twice the time to accomplish
document.documentElement.style.setProperty('--animate-duration', '2s');

// All animations will take half the time to accomplish
document.documentElement.style.setProperty('--animate-duration', '.5s');
```

尽管一些老旧的浏览器不支持自定义属性，但 Animate.css 提供了适当的回退，扩大了对任何支持 CSS 动画的浏览器的支持。

# 参考资料

https://animate.style/


* any list
{:toc}