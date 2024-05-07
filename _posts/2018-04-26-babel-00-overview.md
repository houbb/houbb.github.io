---
layout: post
title:  Babel JS 的语法兼容转化
date:  2018-07-06 11:15:29 +0800
categories: [Web]
tags: [web, babel, js]
published: true
---

# Babel

[Babel](http://babeljs.io/) is a JavaScript compiler.

Use next generation JavaScript, today.

Babel是一个工具链，主要用于在旧的浏览器或环境中将ECMAScript 2015+代码转换为向后兼容的JavaScript版本。

## 简单的例子

ES6 语法：

```js
let yourTurn = "Type some code in here!";
```

实际输出：

```js
var yourTurn = "Type some code in here!";
```

## 浏览器版本

```html
<head>
    <meta charset="utf-8"/>
    <!--    解决 es6 语法问题-->
    <script src="https://unpkg.com/babel-standalone@6.15.0/babel.min.js"></script>
<!--    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.4.4/babel.min.js"></script>-->
</head>
<body>
```

引入这个就可以使用 ES6 的语法了。

# 参考资料

[Babel 入门教程](http://www.ruanyifeng.com/blog/2016/01/babel.html)

* any list
{:toc}