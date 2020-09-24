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

# import 引入

href链接引入的html文件，id可以看做页面引导，在script中用到

```html
<head>
    <meta charset="utf-8" />
    <title>主页面</title>
    <!--import引入-->
    <link rel="import" href="top.html" id="page1"/>
    <link rel="import" href="fotter.html" id="page2"/>
</head>
```

- js 写入

```js
!--注意顺序-->
<!--import在头部引入，里面是啥就是啥-->
<script type="text/javascript">
    document.write(page1.import.body.innerHTML);
</script>
你好呀！    <!--本页面写入内容-->
<script type="text/javascript">
    document.write(page2.import.body.innerHTML);
</script>
```

由上图可以看出，import引入除开script标签，在其他html body中写入什么就引入什么，完全的内容格式.

# JS 引入

```js
<!--注意顺序-->
<!--使用js引入，引入整个文档，但是没有html和body，相当于body里面的数据-->
<div class="top"></div>
<div class="center">
    <p>你好，我在中间！</p>
</div>
<div class="footer"></div>

<script src="js/jq/jquery-3.2.1.min.js"></script>
<script type="text/javascript">
    //在js中引入
    $(document).ready(function () {
        $('.top').load('top.html');
        $('.footer').load('fotter.html');
    });
</script>
```

使用js引入，相当于把引入的html中head和body标签中的数据拖出来，在外面包了一个你自己写的标签，比如说上面代码中的

`<div class="top"></div>`

运行结果同import相同，这里不再展示

注意：是head和body标签中的数据，不带标签，下图是浏览器显示代码



# include.js 引入

include 引入(涉及到一个从网上扒的封装函数,下面有)（head和body标签中的数据直接引入）

```html
<body>
    <!--include引入，顺序很重要-->
    <script src="js/include.js"></script>
    <include src="top.html"></include>
    <include src="center.html"></include>
    <div id="">
        <p>你没有看错，我在这！</p>
    </div>
    <include src="footer.html"></include>
</body>
```

include.js 压缩代码：

```js
(function(window,document,undefined){var Include39485748323=function(){};Include39485748323.prototype={forEach:function(array,callback){var size=array.length;for(var i=size-1;i>=0;i-=1){callback.apply(array[i],[i])}},getFilePath:function(){var curWwwPath=window.document.location.href;var pathName=window.document.location.pathname;var localhostPaht=curWwwPath.substring(0,curWwwPath.indexOf(pathName));var projectName=pathName.substring(0,pathName.substr(1).lastIndexOf('/')+1);return localhostPaht+projectName},getFileContent:function(url){var ie=navigator.userAgent.indexOf('MSIE')>0;var o=ie?new ActiveXObject('Microsoft.XMLHTTP'):new XMLHttpRequest();o.open('get',url,false);o.send(null);return o.responseText},parseNode:function(content){var objE=document.createElement("div");objE.innerHTML=content;return objE.childNodes},executeScript:function(content){var mac=/<script>([\s\S]*?)<\/script>/g;var r="";while(r=mac.exec(content)){eval(r[1])}},getHtml:function(content){var mac=/<script>([\s\S]*?)<\/script>/g;content.replace(mac,"");return content},getPrevCount:function(src){var mac=/\.\.\//g;var count=0;while(mac.exec(src)){count+=1}return count},getRequestUrl:function(filePath,src){if(/http:\/\//g.test(src)){return src}var prevCount=this.getPrevCount(src);while(prevCount--){filePath=filePath.substring(0,filePath.substr(1).lastIndexOf('/')+1)}return filePath+"/"+src.replace(/\.\.\//g,"")},replaceIncludeElements:function(){var $this=this;var filePath=$this.getFilePath();var includeTals=document.getElementsByTagName("include");this.forEach(includeTals,function(){var src=this.getAttribute("src");var content=$this.getFileContent($this.getRequestUrl(filePath,src));var parent=this.parentNode;var includeNodes=$this.parseNode($this.getHtml(content));var size=includeNodes.length;for(var i=0;i<size;i+=1){parent.insertBefore(includeNodes[0],this)}$this.executeScript(content);parent.removeChild(this);})}};window.onload=function(){new Include39485748323().replaceIncludeElements()}})(window,document);
```

# 参考资料

[html页面引入另一个html页面](https://www.jianshu.com/p/c4f18bea8cab)

[在html 静态页面中引用外部页面 Include , 包含 ，嵌入](https://blog.csdn.net/weixin_34273479/article/details/90134491)

[html文件引入其它html文件的几种方法：include方式](https://blog.csdn.net/anwei7037/article/details/101815858)

* any list
{:toc}