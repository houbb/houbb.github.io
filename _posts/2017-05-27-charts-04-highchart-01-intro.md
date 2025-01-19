---
layout: post
title: HighCharts 交互式图表-01-入门介绍
date:  2017-5-27 13:15:25 +0800
categories: [UI]
tags: [ui, html, chart, web, js]
published: true
---

# 常见的图形库系列

[常见的图形库概览-00-overview](https://houbb.github.io/2017/05/27/charts-01-overview)

[常见的图形库概览-01-Chart.js 入门例子](https://houbb.github.io/2017/05/27/charts-02-charts-js-01-intro)

[常见的图形库概览-03-D3.js 入门例子](https://houbb.github.io/2017/05/27/charts-03-d3-js-01-intro)

[HighCharts 交互式图表-01-入门介绍](https://houbb.github.io/2017/05/27/charts-04-highchart-01-intro)

[Plotly 函数图像绘制](https://houbb.github.io/2017/05/27/charts-05-plot-01-intro)

[ApexCharts 图表入门例子](https://houbb.github.io/2017/05/27/charts-06-ApexCharts-01-intro)

[Victory 图表基于 React，适合 React 项目，支持移动端](https://houbb.github.io/2017/05/27/charts-07-victory-01-intro)

[Recharts 入门例子](https://houbb.github.io/2017/05/27/charts-08-recharts-01-intro)

[AntV G2 入门例子](https://houbb.github.io/2017/05/27/charts-09-antv-G2-01-intro)

[图表库 C3.js  入门例子](https://houbb.github.io/2017/05/27/charts-10-c3-js-01-intro)

[图表库 Google Charts  入门例子](https://houbb.github.io/2017/05/27/charts-11-google-charts-01-intro)

[ECharts-01-图表库系列](https://houbb.github.io/2017/05/27/echart-01-intro)

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