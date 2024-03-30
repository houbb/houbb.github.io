---
layout: post
title: HighCharts 交互式图表-01-入门介绍
date:  2016-10-27 12:35:01 +0800
categories: [UI]
tags: [ui, html, chart, web, js]
published: true
---


# HighCharts

[Highcharts](http://www.highcharts.com/) 使开发人员能够在其网页中轻松设置交互式图表。

> [中文网站](http://www.hcharts.cn/)

# 入门指南

- [下载](http://www.highcharts.com/download)

- 导入 js

Highcharts 依赖于 **jquery**，因此您可以在您的 HTML 页面中导入它们：

```html
<script src="http://cdn.hcharts.cn/jquery/jquery-1.8.3.min.js"></script>
<script src="http://cdn.hcharts.cn/highcharts/highcharts.js"></script>
```

- 创建容器

```html
<div id="highchart-container" style="min-width:800px;height:400px"></div>
```

- 使用 Highcharts

```js
$(function () {
    $('#highchart-container').highcharts({
        chart: {
            type: 'bar'                           
        },
        title: {
            text: '我的第一个图表'                 
        },
        xAxis: {
            categories: ['苹果', '香蕉', '橙子']   
        },
        yAxis: {
            title: {
                text: 'something'                 
            }
        },
        series: [{
            name: '小明',                          
            data: [1, 0, 4]                        
        }, {
            name: '小红',
            data: [5, 7, 3]
        }]
    });
});
```

然后，您可以看到：

<div id="highchart-container" style="min-width:800px;height:400px"></div>

* any list
{:toc}