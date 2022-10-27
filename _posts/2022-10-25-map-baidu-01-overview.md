---
layout: post
title: 百度地图-01-JS 概览
date: 2022-10-25 21:01:55 +0800
categories: [JS]
tags: [js, map, sh]
published: true
---

# JavaScript API GL

## 产品简介

百度地图JavaScript API GL 是一套由JavaScript语言编写的应用程序接口，使用了WebGL对地图、覆盖物等进行渲染，支持3D视角展示地图。

帮助开发者在网站中构建功能丰富、交互性强的地图应用，支持PC端和移动端基于浏览器的地图应用开发。

JavaScript API GL提供了丰富的功能接口，包括地图展示、定位、覆盖物、检索、路线规划等，适配多样化的业务场景。

百度地图JavaScript API支持HTTP和HTTPS，免费对外开放。

在使用前，您需先申请密钥（ak）才可使用。在您使用百度地图JavaScript API之前，请先阅读百度地图开放平台《服务条款》。

任何非营利性应用请直接使用，商业应用请参考使用须知。

JavaScript API GL的使用方式请参考开发指南，详细的接口类说明请参考类参考文档，快速了解JavaScript API GL可支持的功能请参考示例中心提供的示例demo。

如果您在使用过程遇到技术问题，可查看常见问题或通过工单联系我们。


## 注册申请 AK

首先注册成为开发者。

然后申请一下 ak 即可。

参考：

> [账号和获取密钥](https://lbsyun.baidu.com/index.php?title=jspopularGL/guide/getkey)

## 服务配额

请您务必先申请密钥（AK）再使用JS API提供的相关服务，接口无使用次数限制，请开发者放心使用。

如有问题请随时通过工单系统联系我们。

# hello world

## 代码

- helloword.html

```html
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
	<style type="text/css">
	body, html,#allmap {width: 100%;height: 100%;overflow: hidden;margin:0;font-family:"微软雅黑";}
	</style>
	<script type="text/javascript" src="//api.map.baidu.com/api?type=webgl&v=1.0&ak=您的密钥"></script>
	<title>地图展示</title>
</head>
<body>
	<div id="allmap"></div>
</body>
</html>
<script type="text/javascript">
    // GL版命名空间为BMapGL
    // 按住鼠标右键，修改倾斜角和角度
	var map = new BMapGL.Map("allmap");    // 创建Map实例
	map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 11);  // 初始化地图,设置中心点坐标和地图级别
	map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
</script>
```

## 效果如下：

<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
	<style type="text/css">
	    #allmap {width: 800px;height: 600px;overflow: auto;margin:0;font-family:"微软雅黑";}
	</style>
	<script type="text/javascript" src="//api.map.baidu.com/api?type=webgl&v=1.0&ak=bTyl2kLG4HPMSBnBsOg5o1GMY74GZwKk"></script>
	<title>地图展示</title>
</head>
<body>
	<div id="allmap"></div>
</body>
</html>
<script type="text/javascript">
    // GL版命名空间为BMapGL
    // 按住鼠标右键，修改倾斜角和角度
	var map = new BMapGL.Map("allmap");    // 创建Map实例
	map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 11);  // 初始化地图,设置中心点坐标和地图级别
	map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
</script>



# 参考资料

[JavaScript API GL](https://lbsyun.baidu.com/index.php?title=jspopularGL)

* any list
{:toc}