---
layout: post
title:  HTML5-01-入门介绍
date:  2017-03-29 22:55:48 +0800
categories: [Web]
tags: [html5, web,]
published: true
---

# HTML5

[HTML5](http://www.runoob.com/html/html5-intro.html) 是 HTML 最新的修订版本，2014年10月由万维网联盟（W3C）完成标准制定。

HTML5 的设计目的是为了在移动设备上支持多媒体。

> 有趣的新特性：

- 用于绘画的 canvas 元素

- 用于媒介回放的 video 和 audio 元素

- 对本地离线存储的更好的支持

- 新的特殊内容元素

比如 article、footer、header、nav、section

- 新的表单控件

比如 calendar、date、time、email、url、search

# Hello World

- hello.html

```html
<!DOCTYPE HTML>
<html>
<head>
<meta charset="utf-8"> 
<title>菜鸟教程(runoob.com)</title> 
</head>
<body>
 
<video width="320" height="240" controls>
  <source src="movie.mp4" type="video/mp4">
  你的浏览器不支持 video 标签。
</video>
 
</body>
</html>
```

# Canvas

HTML5 `<canvas>` 元素用于图形的绘制，通过脚本 (通常是 JavaScript )来完成.

`<canvas>` 标签只是图形容器，您必须使用脚本来绘制图形。

你可以通过多种方法使用 Canvas 绘制路径,盒、圆、字符以及添加图像。


## 创建并绘制

```
<!DOCTYPE html>
<html>
<head> 
<meta charset="utf-8"> 
<title>菜鸟教程(runoob.com)</title> 
</head>
<body>

<canvas id="myCanvas" width="200" height="100" style="border:1px solid #c3c3c3;">
您的浏览器不支持 HTML5 canvas 标签。
</canvas>

<script>

var c=document.getElementById("myCanvas");
var ctx=c.getContext("2d");
ctx.fillStyle="#0099FF";
ctx.fillRect(0,0,150,75);

</script>

</body>
</html>
```


<canvas id="myCanvas" width="200" height="100" style="border:1px solid #c3c3c3;">
您的浏览器不支持 HTML5 canvas 标签。
</canvas>

<script>

var c=document.getElementById("myCanvas");
var ctx=c.getContext("2d");
ctx.fillStyle="#0099FF";
ctx.fillRect(0,0,150,75);

</script>

## 坐标

canvas 是一个二维网格。canvas 的左上角坐标为 (0,0).

<script>
function cnvs_getCoordinates(e)
{
    x=e.clientX;
    y=e.clientY;
    document.getElementById("coordiv").innerHTML="  (x,y): (" + x + "," + y + ")";
}
function cnvs_clearCoordinates()
{
    document.getElementById("coordiv").innerHTML="";
}
</script>
<div id="coordiv" style="width:199px;height:99px;border:1px solid #c3c3c3" onmousemove="cnvs_getCoordinates(event)" 
onmouseout="cnvs_clearCoordinates()"></div>


## 路径

定义开始坐标(0,0), 和结束坐标 (200,100)。然后使用 stroke() 方法来绘制线条:

<canvas id="canvas-path" width="200" height="100" style="border:1px solid #d3d3d3;">
    您的浏览器不支持 HTML5 canvas 标签。
</canvas>

<script>
    var c=document.getElementById("canvas-path");
    var ctx=c.getContext("2d");
    ctx.moveTo(0,0);
    ctx.lineTo(200,100);
    ctx.stroke();
</script>

## Text

使用 Arial 字体在画布上绘制一个高 30px 的文字（实心）：

<canvas id="canvas-text" width="200" height="100" style="border:1px solid #d3d3d3;">
    您的浏览器不支持 HTML5 canvas 标签。
</canvas>

<script>
    var c=document.getElementById("canvas-text");
    var ctx=c.getContext("2d");
    ctx.font="30px Arial";
    ctx.fillText("Hello World",20,50);
</script>

## 渐变

创建一个线性渐变。使用渐变填充矩形:

<canvas id="canvas-gradient" width="200" height="100" style="border:1px solid #d3d3d3;">
您的浏览器不支持 HTML5 canvas 标签。
</canvas>

<script>
var c=document.getElementById("canvas-gradient");
var ctx=c.getContext("2d");

// Create gradient
var grd=ctx.createLinearGradient(0,0,200,0);
grd.addColorStop(0,"#0099FF");
grd.addColorStop(1,"white");

// Fill with gradient
ctx.fillStyle=grd;
ctx.fillRect(10,10,150,80);
</script>

## Image

<img id="scream" src="{{ site.url }}/static/app/res/img/python-bg.jpg" alt="The Scream" width="500" height="360"/>

<canvas id="canvas-image" width="250" height="300" style="border:1px solid #d3d3d3;">
您的浏览器不支持 HTML5 canvas 标签。
</canvas>

<script>
var c=document.getElementById("canvas-image");
var ctx=c.getContext("2d");
var img=document.getElementById("scream");

img.onload = function() {
	ctx.drawImage(img,10,10);
} 
</script>


# MathML

(经测试chrome不支持，safari支持。)

<math xmlns="http://www.w3.org/1998/Math/MathML">
 <mrow>
    <msup><mi>a</mi><mn>2</mn></msup>
    <mo>+</mo>
    <msup><mi>b</mi><mn>2</mn></msup>
    <mo>=</mo>
    <msup><mi>c</mi><mn>2</mn></msup>
 </mrow>
</math>
      
* any list
{:toc}