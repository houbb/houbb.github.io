---
layout: post
title: npm 引入 css 样式库之后如何使用
date: 2021-11-09 21:01:55 +0800
categories: [WEB]
tags: [web, front-end, web, icon, sh]
published: true
---

# vue 中安装及使用 animate.css

animate官网 https://animate.style/

## 一、npm安装animate.css

```
npm install animate.css --save
```

## 二、main.js页面引入animate

//animate动画库

```js
import animated from 'animate.css' // npm install animate.css --save安装，再引入
Vue.use(animated)
```

## 三、页面应用

vue应用animate有几种方法，这里介绍常用的两种

1、直接使用类名

```xml
<h1 class="animate__animated animate__flash">
Animate.css //class内不管是用哪个动画效果，animate__animated 都一定要放，不然可能不会有想要的效果，后面那个便是要使用的动画类名，若要无限使用效果就加个infinite类名
</h1>
```

2、css中使用

```css
h1{ //h1为要应用的地方，也可以使用类名和id等其他选择器
animation-name:flash ; //flash为要使用的动画效果名，在这里不需要加animate前缀
animation-duration: 3s; //这里设定完成该动画的时间
/*animation:turn 1s linear infinite;*/
}
```





# 参考资料

[vue中安装及使用animate.css](https://www.cnblogs.com/yite/p/13536548.html)

* any list
{:toc}