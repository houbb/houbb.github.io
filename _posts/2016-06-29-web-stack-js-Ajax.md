---
layout: post
title: Ajax
date:  2016-6-29 12:56:00 +0800
categories: [Web]
tags: [less, css, web-stack, web]
published: true
---


# Ajax

AJAX = Asynchronous JavaScript and XML（异步的 JavaScript 和 XML）。
AJAX 不是新的编程语言，而是一种使用现有标准的新方法。
AJAX 是与服务器交换数据并更新部分网页的艺术，在不重新加载整个页面的情况下。

# AJAX 简介

## 什么是 AJAX ？

AJAX = 异步 JavaScript 和 XML。
AJAX 是一种用于创建快速动态网页的技术。
通过在后台与服务器进行少量数据交换，AJAX 可以使网页实现异步更新。这意味着可以在不重新加载整个网页的情况下，对网页的**某部分进行更新**。
传统的网页（不使用 AJAX）如果需要更新内容，必需重载整个网页面。

## 工作原理

![ajax](https://raw.githubusercontent.com/houbb/resource/master/img/2016-07-12-ajax.gif)


# 创建 XMLHttpRequest 对象

所有现代浏览器均支持 XMLHttpRequest 对象（IE5 和 IE6 使用 ActiveXObject）。
XMLHttpRequest 用于在后台与服务器交换数据。这意味着可以在不重新加载整个网页的情况下，对网页的某部分进行更新。

为了应对所有的现代浏览器，包括 IE5 和 IE6，请检查浏览器是否支持 XMLHttpRequest 对象。如果支持，则创建 XMLHttpRequest 对象。如果不支持，则创建 ActiveXObject ：

```js
var xmlhttp;
if (window.XMLHttpRequest){
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp=new XMLHttpRequest();
}else {
    // code for IE6, IE5
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
}
```

# 向服务器发送请求请求

如需将请求发送到服务器，我们使用 XMLHttpRequest 对象的 open() 和 send() 方法：

> open(method,url,async)

规定请求的类型、URL 以及是否异步处理请求。

- method：请求的类型；GET 或 POST
- url：文件在服务器上的位置
- async：true（异步）或 false（同步）

> send(string)

将请求发送到服务器。

- string：仅用于 POST 请求

## GET 还是 POST？

与 POST 相比，**GET 更简单也更快**，并且在大部分情况下都能用。
然而，在以下情况中，请使用 POST 请求：

- 无法使用缓存文件（更新服务器上的文件或数据库）
- 向服务器发送大量数据（POST 没有数据量限制）
- 发送包含未知字符的用户输入时，POST 比 GET 更稳定也更可靠

## URL

open() 方法的 url 参数是服务器上文件的地址：
```
xmlhttp.open("GET","ajax_test.html",true);
```
该文件可以是任何类型的文件，比如 ```.txt``` 和 .```xml```，或者服务器脚本文件，比如 ```.asp``` 和 ```.php``` （在传回响应之前，能够在服务器上执行任务）。

## 异步 - True 或 False？

AJAX 指的是异步 JavaScript 和 XML（Asynchronous JavaScript and XML）。
XMLHttpRequest 对象如果要用于 AJAX 的话，其 open() 方法的 async 参数必须设置为 true：
```
xmlhttp.open("GET","ajax_test.html",true);
```
对于 web 开发人员来说，发送异步请求是一个巨大的进步。很多在服务器执行的任务都相当费时。AJAX 出现之前，这可能会引起应用程序挂起或停止。
通过 AJAX，JavaScript **无需等待服务器的响应**，而是：
- 在等待服务器响应时执行其他脚本
- 当响应就绪后对响应进行处理

## 服务器 响应

服务器响应
如需获得来自服务器的响应，请使用 XMLHttpRequest 对象的 ```responseText``` 或 ```responseXML``` 属性。

- responseText 属性

如果来自服务器的响应并非 XML，请使用 responseText 属性。

```
document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
```

- responseXML 属性

如果来自服务器的响应是 XML，而且需要作为 XML 对象进行解析，请使用 responseXML 属性：

```
xmlDoc=xmlhttp.responseXML;
txt="";
x=xmlDoc.getElementsByTagName("ARTIST");
for (i=0;i<x.length;i++)
  {
  txt=txt + x[i].childNodes[0].nodeValue + "<br>";
  }
document.getElementById("myDiv").innerHTML=txt;
```

# onreadystatechange 事件

当请求被发送到服务器时，我们需要执行一些基于响应的任务。
每当 readyState 改变时，就会触发 ```onreadystatechange``` 事件。
readyState 属性存有 XMLHttpRequest 的状态信息。
下面是 XMLHttpRequest 对象的三个重要的属性：

> readyState

存有 XMLHttpRequest 的状态。从 0 到 4 发生变化。
- 0: 请求未初始化
- 1: 服务器连接已建立
- 2: 请求已接收
- 3: 请求处理中
- 4: 请求已完成，且响应已就绪

> status

- 200: "OK"
- 404: 未找到页面

当 readyState 等于 4 且状态为 200 时，表示响应已就绪.


* any list
{:toc}