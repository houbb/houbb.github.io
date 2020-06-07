---
layout: post
title: java 发送邮件 css-style 样式丢失错乱问题，有解决方案
date:  2019-12-25 16:57:12 +0800
categories: [Java]
tags: [java, sf]
published: true
---

# 问题描述

使用 email 发送邮件时，发现所有的 css 样式丢失。

感觉有些奇怪，看了下邮件设置也是 html 格式。

后来一想就知道原因了，其实邮箱也是基于 css 显示的，如果邮件内容有全局格式，肯定会导致显示，甚至安全问题。

所以去查了下相关原因，并且记录下自己的解决方案。

# 问题原因

使用java发送html到qq邮箱后，发现采用“外部样式表”的css都没有

外部样式表：

```csshtml
<link rel="stylesheet" type="text/css" href="css/my.css">
```

推测邮箱是从出于安全策略（推测是防止CSRF跨站请求伪造）才会过滤掉外部引用的，为了绕过这个拦截，改为使用“内部样式表”写法

```html
<head>
    <style type="text/css">

    </style>
</head>
```

发送后qq邮箱可以了，但是126邮箱不行，126邮箱比qq邮箱更严格，居然把style标签里的内容全部过滤掉了，这说明不同的邮箱过滤策略不一样。

那大企业发的邮件，为啥样式都显示正常？

为了一探究竟就找了领英的邮件看了看，发现它将样式都写在标签了，也就是“内联式”写法。

发送邮件的邮件内容，可以去掉head、body，只留需要的部分，因为，邮箱会过滤head、body，并将这个两个标签的样式全部过滤掉，所以发送html邮件时，直接上内容就好，比如

```html
<div style="background-image: url('http://domain:port/a.png');font-size:14px;">
  <h1 style="text-align: center;">邮件标题</h1>
  <p>邮件内容</p>
</div>
```

# 内嵌式格式解决方案

这种我们当然不可能一个个手动去改，这样就太笨了。

类似的框架网上比较多，[CssToInlineStyles-PHP](https://github.com/tijsverkoyen/CssToInlineStyles) 和 [juice-JS](https://github.com/Automattic/juice)。

如果你有需求，可以考虑使用符合自己语言的，比如 java。

此处我只是简单使用下，所以采用了网页版本 [网页版-juice](http://automattic.github.io/juice/)。

发送转换后的 html，发现显示正常。

# 开源框架

## email 发送

[email-java 发送工具](https://github.com/houbb/email)

## css

[CssToInlineStyles](https://github.com/tijsverkoyen/CssToInlineStyles)

[Juice inlines CSS stylesheets into your HTML source.](https://github.com/Automattic/juice)

[网页版-juice](http://automattic.github.io/juice/)

# 参考资料

[HTML 邮件兼容问题](https://blog.csdn.net/young_gao/article/details/83658454)

[在发送邮件HTML中，CSS等问题](https://blog.csdn.net/fenglailea/article/details/80250570)

[发送邮件到qq邮箱、126邮箱后丢失样式](https://blog.csdn.net/wangjun5159/article/details/78626410)

* any list
{:toc}