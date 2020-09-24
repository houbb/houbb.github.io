---
layout: post
title:  RequireJs-Text 文本
date:  2018-08-27 10:59:01 +0800
categories: [Web]
tags: [web, js, requirejs, sh]
published: true
---

# 背景

管理 html css 等资源。

## text.js 是什么

text.js是require.js的一个插件，用于异步加载文本资源，如txt、css、html、xml、svg等。

# 入门

## 安装

- 官方下载

[https://github.com/requirejs/text/blob/master/text.js](https://github.com/requirejs/text/blob/master/text.js) 官网下载。

- npm

```
npm install requirejs/text
```

- 个人

我直接取官方下载了文件，保存到本地：`require-text.js`

## 使用

### 文件层级

使用到的文件在同一个文件夹：

```
require-text.js
test.html
header.html
```

### 文件内容

- test.html

内容如下

```js
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>require-js</title>
    <script src="https://cdn.bootcss.com/require.js/2.3.5/require.js"></script>
<body>
    <div id="header"></div>
</body>
<script>
    requirejs.config({
        paths:{
            // 默认就是 js 资源，不需要使用后缀
            "text": "require-text",
        }
    });

    requirejs(["text!header.html"], function(header) {
        // 将文件内容写入到当前页面
        console.log(header);
        document.getElementById("header").innerHTML = header;
    });
</script>
</html>
```

- header.html

内容如下：

```html
<div>
    表头信息
</div>
```

## 效果

打开 test.html，就可以看到 header 的内容已经被加到页面了。

# 参考资料

https://github.com/requirejs/text

[在Html中使用Requirejs进行模块化开发](https://www.cnblogs.com/xing901022/p/5392438.html)

[[require.js插件] text.js异步加载文本资源](https://www.cnblogs.com/sharpest/p/8242321.html)

[require.js插件-text.js使用](https://blog.csdn.net/qq_29132907/article/details/79408455)

https://cdnjs.com/libraries/require-text

* any list
{:toc}