---
layout: post
title: 一键发布入门概览
date: 2024-03-27 21:01:55 +0800
categories: [Tool]
tags: [tool, sh]
published: false
---

# 登录

https://github.com/xchaoinfo/fuck-login

# 开源工具

## BlogHelper

帮助国内用户写作的托盘助手，一键发布本地文章到主流博客平台（知乎、简书、博客园、CSDN、SegmentFault、掘金、开源中国），剪贴板图片一键上传至图床（新浪、Github、图壳、腾讯云、阿里云、又拍云、七牛云）（欢迎Star，🚫禁止Fork）

https://github.com/onblog/BlogHelper


## Wechatsync

一键同步文章到多个内容平台，支持今日头条、WordPress、知乎、简书、掘金、CSDN、typecho各大平台，一次发布，多平台同步发布。解放个人生产力

https://github.com/wechatsync/Wechatsync


# 测试代码

## html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>简单页面</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/wechatsync/article-syncjs@latest/dist/styles.css" />
</head>
<body>
    <h1>欢迎来到我的网页</h1>
    <p>这是一个简单的HTML5页面。</p>
    <script src="https://cdn.jsdelivr.net/gh/wechatsync/article-syncjs@latest/dist/main.js"></script>
    <script>
        window.syncPost && window.syncPost({
            title: 'Ractor 下多线程 Ruby 程序指南',
            desc: '什么是 Ractor? Ractor 是 Ruby 3 新引入的特性。Ractor 顾名思义是 Ruby 和',
            content: 'hello world',
            thumb: 'http://mmbiz.qpic.cn/mmbiz_jpg/CJcVm4ThlNOeib5w5A6MYk4Eg9ErnzZ73dEicribs3gPPUB4cCxiaeRm2ZfNOibHfl4TIo8h6VlFZeBRmLoMKgibvPdw/0?wx_fmt=jpeg'
        });
    </script>
</body>
</html>
```

## 小结

问题是永恒的，但是解法却多是多变的。

在**人类历史的长河中，我们总是在不断地努力接近答案**。

我是老马，期待与你的下次重逢。

# 参考资料

* any list
{:toc}
