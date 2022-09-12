---
layout: post
title:  js 任务定时执行
date:  2022-08-28 09:22:02 +0800
categories: [JS]
tags: [js, id, uuid, sh]
published: true
---

#  js 定时器有以下两个方法：

setInterval(): 按照指定的周期（以毫秒计）来调用函数或计算表达式。方法会不停地调用函数，直到 clearInterval() 被调用或窗口被关闭。

setTimeout(): 在指定的毫秒数后调用函数或计算表达式。 


# setInterval()

## 语法

```js
setInterval(code,millisec,lang)
```

| 参数 | 	描述 | 
|:---|:---|
| code | 	必需。要调用的函数或要执行的代码串。| 
|  millisec | 	必须。周期性执行或调用 code 之间的时间间隔，以毫秒计。| 
|  lang 	| 可选。 `JScript | VBScript | JavaScript` | 

以下实例在每 1000 毫秒执行 clock() 函数。

实例中也包含了停止执行的按钮:

```html
<html>
<body>

<input type="text" id="clock" />
<script type="text/javascript">
var int=self.setInterval("clock()",1000);
function clock()
{
var d=new Date();
var t=d.toLocaleTimeString();
document.getElementById("clock").value=t;
}
</script>

<button onclick="int=window.clearInterval(int)">停止</button>

</body>
</html>
```

# setTimeout()

## 语法

```js
setTimeout(code,millisec,lang)
```

| 参数 | 	描述 | 
|:---|:---|
| code | 	必需。要调用的函数或要执行的代码串。| 
|  millisec | 	必须。周期性执行或调用 code 之间的时间间隔，以毫秒计。| 
|  lang 	| 可选。 `JScript | VBScript | JavaScript` | 

## 实例

```js
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>菜鸟教程(runoob.com)</title>
</head>
<body>

<p>点击按钮，在等待 3 秒后弹出 "Hello"。</p>
<button onclick="myFunction()">点我</button>

<script>
function myFunction()
{
    setTimeout(function(){alert("Hello")},3000);
}
</script>

</body>
</html>
```

# 小结

定时任务，对于延迟执行的任务非常有用。



# 参考资料

https://www.runoob.com/w3cnote/js-timer.html

* any list
{:toc}