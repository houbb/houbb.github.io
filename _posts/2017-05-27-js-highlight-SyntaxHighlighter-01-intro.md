---
layout: post
title: JavaScript 代码语法高亮器 SyntaxHighlighter-01-入门介绍 
date:  2016-10-23 12:29:20 +0800
categories: [UI]
tags: [ui, html, web, js]
published: true
---

# SyntaxHighlighter

[SyntaxHighlighter](http://alexgorbatchev.com/SyntaxHighlighter/) 是一个完全功能齐全的自包含的 JavaScript 代码语法高亮器。

要了解 SyntaxHighlighter 的功能，请查看演示页面。

# Hello World

## 下载

- [下载](http://alexgorbatchev.com/SyntaxHighlighter/)

## 导入 js/css

```html
<link type="text/css" rel="stylesheet" href="styles/shCoreDefault.css"/>
<script type="text/javascript" src="scripts/shCore.js"></script>
<script type="text/javascript" src="scripts/shBrushJScript.js"></script>
```

## 编写代码

像这样编写代码：

```html
<pre class="brush: js;">
function foo()
{
    if (counter <= 10)
        return;
    // it works!
}
</pre>
```

## 使用  SyntaxHighlighter

在你的页面中添加以下 js：

```js
<script type="text/javascript">SyntaxHighlighter.all();</script>
```

然后你可以看到：

```js
function foo()
{
    if (counter <= 10)
        return;
    // it works!
}
```

* any list
{:toc}




