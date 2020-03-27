---
layout: post
title: 前端 JQuery 入门使用简介
date:  2018-04-22 09:19:44 +0800
categories: [Web]
tags: [web, js, nodejs, sh]
published: true
---

# JQuery 

[JQuery](https://jquery.com/) is a fast, small, and feature-rich JavaScript library. 

It makes things like HTML document traversal and manipulation, event handling, animation, and Ajax much simpler with an easy-to-use API that works across a multitude of browsers.

With a combination of versatility and extensibility, jQuery has changed the way that millions of people write JavaScript.

# 快速开始

```js
<!DOCTYPE html>
<html>
<head>
<script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>
<script>
$(document).ready(function(){
  $("button").click(function(){
    $("#hidden-p").hide();
  });
});
</script>
</head>

<body>
<h2>这是一个标题</h2>
<p>这是一个段落。</p>
<p id="hidden-p">点击我就不见了，注意点。</p>
<button>点我</button>
</body>
</html>
```

## 示例页面

<h2>这是一个标题</h2>
<p>这是一个段落。</p>
<p id="hidden-p">点击我就不见了，注意点。</p>
<button>点我</button>


<script>
$(document).ready(function(){
  $("button").click(function(){
    $("#hidden-p").hide();
  });
});
</script>

# 拓展阅读

[前端 Boostrap](https://houbb.github.io/2018/04/22/web-bootstrap)

[手写 jQuery 插件](https://houbb.github.io/2020/03/27/html-js-jquery)

# 参考资料

[手写 JQuery 框架](https://www.cnblogs.com/liangyin/p/7764248.html)

[jquery 入门教程](https://www.runoob.com/jquery/jquery-install.html)

* any list
{:toc}