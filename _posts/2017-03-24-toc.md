---
layout: post
title: TOC
date:  2017-03-24 19:32:27 +0800
categories: [UI]
tags: [ui, toc]
header-img: "static/app/res/img/python-bg.jpg"
published: true
---


# 滚动监听

[滚动监听](http://v3.bootcss.com/javascript/#scrollspy) bootstrap 实现。

借助 [scrollSpy.js Github](https://github.com/thesmart/jquery-scrollspy)，或者自己实现监听也行。来实现属于我们的滚动监听。


> 原理

比如有标题如下：

```html
<h1 id="section">滚动监听</h1>
```

对应的页面导航：

```html
<ul id="markdown-toc">
  <li style="display: list-item;"><a href="#section" id="markdown-toc-section" class="">滚动监听</a></li>
  <li style="display: list-item;"><a href="#toc" id="markdown-toc-toc" class="active">TOC</a></li>
</ul>
```

监听实现导航栏高亮代码:

```js
/**
 * 滚动监听
 */
this.scrollSpy = function()
{
    var header = $("h1, h2, h3, h4, h5, h6");   //标题
    header.scrollSpy();

    var firstNav = $("#markdown-toc a").first();    //导航栏第一个
    firstNav.addClass("active");    //初始默认为第一个高亮

    header.on('scrollSpy:enter', function() {
        $("#markdown-toc a").removeClass("active");
        var id = $(this).attr("id");
        $("#markdown-toc a[href='#"+id+"']").addClass("active");

        //滚动到页面的最上方 或者是存在其他没有ID的header信息
        //1.由此可见对于HEADER的定义应该更加具有区分性。
        if(!id)
        {
            firstNav.addClass("active");
        }
    });

    header.on('scrollSpy:exit', function() {
    });
};
```

<label class="label label-info">Note</label>

1. 标题可以自定义选择器，最好足够的有区分性。不会与页面其他元素混淆。

2. 导航栏添加`active`的样式可以自定义。

(此处有一个BUG，如果文中存在id为空的header信息，会高亮错误。应该去除之前保留上一个高亮，如果ID不存在就将上一个依然设定为高亮。)

当然TOC导航栏是jekyll自动生成的，如果我们写了个静态网页。如何生成对应的TOC呢？


# TOC

生成的原理也不难，只是比较繁琐。

[jquery.toc](https://github.com/houbb/echoui/tree/master/dist/toc) 这里是一级菜单的个人实现。

## For MarkDown

> [jianshu zh_CN](http://www.jianshu.com/p/34c92cbd0aaf/)

> [md_toc.js](http://hicc.me/md-toc-js/)

## For HTML

> [js zh_CN](https://segmentfault.com/a/1190000004550064)





* any list
{:toc}