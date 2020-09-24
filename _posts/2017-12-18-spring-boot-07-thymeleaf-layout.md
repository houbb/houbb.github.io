---
layout: post
title:  Spring Boot-07-thymeleaf 模板指定 layout 或引入其他页面
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, exception, spring, springboot]
published: true
---

# 背景

html 中编写一般都有很多重复的内容。

比如 header、footer 等相同的内容，最简单的方式是使用 layout 或者直接 include 对应的页面。

这样做可以避免内容的重复编写，也便于后期统一维护修改。

# 方案1：fragement 

将页面里的每个部分都分成块 -> fragment 使用 `th:include` 和 `th:replace` 来引入页面

这种用法没有layout的概念, 因为每个部分都是 fragment, 下面例子说明

```html
<!-- index.html -->
<html>
<head>
    <meta charset="utf-8"/>
    <title>demo</title>
</head>
<body>
    <div th:include="components/header :: header"></div>
    <div class="container">
        <h1>hello world</h1>
    </div>
    <div th:include="components/footer :: footer"></div>
</body>
</html>

<!-- components/header.html -->
<header th:fragment="header">
<ul>
    <li>news</li>
    <li>blog</li>
    <li>post</li>
</ul>
</header>
<!-- components/footer.html -->
<header th:fragment="footer">
<div>i am footer.</div>
</header>
```

上面例子里用到的是th:include, 也就是把定义好的fragment引入的意思, 还有一个是th:replace, 意思是替换

# layout 布局

## maven 依赖

```xml
<dependency>
  <groupId>nz.net.ultraq.thymeleaf</groupId>
  <artifactId>thymeleaf-layout-dialect</artifactId>
  <version>2.3.0</version>
</dependency>
```

## 编写布局代码

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/web/thymeleaf/layout">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>layout布局方案</title>
    <style>
        * {font-family: Microsoft YaHei, Tahoma, Helvetica, Arial, sans-serif;}
        .header {background-color: #f5f5f5;padding: 20px;}
        .header a {padding: 0 20px;}
        .container {padding: 20px;margin:20px auto;}
        .footer {height: 40px;background-color: #f5f5f5;border-top: 1px solid #ddd;padding: 20px;}
    </style>
 
</head>
<body>
    <header class="header">
        <div>
            采用layout方式进行布局
        </div>
    </header>
    <div  class="container" layout:fragment="content"></div>
    <footer class="footer">
        <div>
            <p style="float: left">&copy; Hylun 2017</p>
            <p style="float: right">
                Powered by <a href="http://my.oschina.net/alun" target="_blank">Alun</a>
            </p>
        </div>
    </footer>
 
</body>
</html>
```

关键点：

```
xmlns:layout="http://www.ultraq.net.nz/web/thymeleaf/layout"： 引入layout标签
<div  class="container" layout:fragment="content">页面正文内容</div>  设置页面正文内容所在位置
```


## 编写内容页面

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/web/thymeleaf/layout"
      layout:decorator="demo/layout2">
    <div layout:fragment="content">
        正文内容222222222222
    </div>
</html>
```

关键点：

```
layout:decorator="demo/layout2"  ：此位置指向layout2.html页面位置
layout:fragment="content"  ：指定页面正文内容 content要与layout2.html页面中定义的名字一致
```

# 拓展阅读

freemarker include

webpack 打包

requirejs 引入

# 参考资料

[thymeleaf的layout常用的有两种方式用法](https://www.cnblogs.com/goingforward/p/7215314.html)

* any list
{:toc}
