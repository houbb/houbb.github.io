---
layout: post
title:  React-01-Hello
date:  2018-07-05 21:01:01 +0800
categories: [React]
tags: [react, sh]
published: true
---

# React

[React](https://reactjs.org/) is a JavaScript library for building user interfaces.

# Features

- 声明式(Declarative)

React允许创建交互式ui。为应用程序中的每个状态设计简单的视图，当数据发生更改时，React将有效地更新和呈现正确的组件。

声明性视图使代码更可预测，更易于调试。

- 基于组件的(Component-Based)

构建封装的组件来管理它们自己的状态，然后将它们组合成复杂的ui。

由于组件逻辑是用JavaScript而不是模板编写的，所以您可以通过应用程序轻松地传递丰富的数据，并将状态保持在DOM之外。

- 学习一次,写在任何地方

我们不会对您的其他技术堆栈进行假设，因此您可以在不重写现有代码的情况下开发新的特性。

React还可以使用 Node 在服务器上呈现，使用React Native来运行power mobile应用程序。

# Quick Start

- hello.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Hello React!</title>
    <script src="https://cdn.bootcss.com/react/15.4.2/react.min.js"></script>
    <script src="https://cdn.bootcss.com/react/15.4.2/react-dom.min.js"></script>
    <script src="https://cdn.bootcss.com/babel-standalone/6.22.1/babel.min.js"></script>
  </head>
  <body>
    <div id="example"></div>
    <script type="text/babel">
      ReactDOM.render(
        <h1>Hello, world!</h1>,
        document.getElementById('example')
      );
    </script>
  </body>
</html>
```

打开页面可见

```
Hello, world!
```

## JS 库介绍

- react.min.js 

React 的核心库

- react-dom.min.js 

提供与 DOM 相关的功能

- babel.min.js 

Babel 可以将 ES6 代码转为 ES5 代码，这样我们就能在目前不支持 ES6 浏览器上执行 React 代码。
Babel 内嵌了对 JSX 的支持。通过将 Babel 和 babel-sublime 包（package）一同使用可以让源码的语法渲染上升到一个全新的水平。

> 备注

如果我们需要使用 JSX，则 `<script>` 标签的 type 属性需要设置为 text/babel。

* any list
{:toc}