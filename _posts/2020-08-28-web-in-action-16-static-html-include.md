---
layout: post
title:  web 实战-16-静态页面如何 include 其他页面
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 背景

在asp、asp.net页面中引用外部页面很简单，使用以下语句就可以：<!--  include   file ="要引用的页面" ->

但是在 html 静态页面中引用外部页面则没那么方便，主要方法有：

# iframe 

使用框架来实现，但是那样占用线程较多，速度慢；

```html
<IFRAME NAME="neepage" width=100% height=30 marginwidth=0 marginheight=0 SRC="header.htm" ></IFRAME>
```

加上它的一些属性可以实现一些透明,无滚动条等具体的效果.大家可以html教程的相关介绍

# js 脚本

使用.  js 脚本来实现

就是把相关的html文件转化为 js 文件.再在调用的时候用

```html
<script src="import.js "></script>
```

此时import.asp中的内容必须使用 js 输入才行。

如果你用此方法来包含像头部,导航条的话,它将不利于搜索引擎的搜集。

另外，编写 js 输出的内容代码较凌乱，容易出错。

# 页面包含

下面是一种实现方法：

最好能有一种方法，就像asp页面包含其他页面时那样，用一小段包含语句就可以实现，不要将需要包含的内容出现在本页面内，而是分割出去到另外一个自己的页面。

```html
<span id=showImport1></span>
<IE:Download ID="oDownload1" STYLE="behavior:url(#default#download)" />
<script>
function onDownloadDone(downData){
showImport1.innerHTML=downData
}
oDownload1.startDownload('top.htm',onDownloadDone)
</script>
```

注：包含的页面为 top.htm 只要把需要包含的页面改掉就可以了！其中id=showimport 不能改为其他，这种写法为一次包含一个文件。

# object 引入

个人觉得此法方便比较好

```html
<object type="text/x-scriptlet" data="import.htm" width=100% height=30></object>
```

# Behavior的download方式

```html
<span id=showImport></span> 
<IE:Download ID="oDownload" STYLE="behavior:url(#default#download)" /> 
<script> 
function onDownloadDone(downDate){ 
showImport.innerHTML=downDate 
} 
oDownload.startDownload('import.htm',onDownloadDone) 
</script>
```

# include.js




# 参考资料

[html页面引入另一个html页面](https://www.jianshu.com/p/c4f18bea8cab)

[在html 静态页面中引用外部页面 Include , 包含 ，嵌入](https://blog.csdn.net/weixin_34273479/article/details/90134491)

[html文件引入其它html文件的几种方法：include方式](https://blog.csdn.net/anwei7037/article/details/101815858)

* any list
{:toc}