---
layout: post
title: HighCharts
date:  2016-10-27 12:35:01 +0800
categories: [Js]
tags: [highCharts, chart]
published: false
---

* any list
{:toc}

# HighCharts

[Highcharts](http://www.highcharts.com/) makes it easy for developers to set up interactive charts in their web pages.

> [zh_CN](http://www.hcharts.cn/)

# Get Start

<uml>
    Download->Install:
</uml>

- [Download](http://www.highcharts.com/download)

- Import js

hightcharts is depends on **jquery**, so you can import them in your html page:

```html
<script src="http://cdn.hcharts.cn/jquery/jquery-1.8.3.min.js"></script>
<script src="http://cdn.hcharts.cn/highcharts/highcharts.js"></script>
```

- Create Container

```html
<div id="highchart-container" style="min-width:800px;height:400px"></div>
```

- Use highcharts

<sh class="js">
$(function () {
    $('#highchart-container').highcharts({                  //图表展示容器，与 div 的 id 保持一致
        chart: {
            type: 'bar'                           //指定图表的类型，默认是折线图（line）
        },
        title: {
            text: '我的第一个图表'                 //指定图表标题
        },
        xAxis: {
            categories: ['苹果', '香蕉', '橙子']   //指定x轴分组
        },
        yAxis: {
            title: {
                text: 'something'                 //指定y轴的标题
            }
        },
        series: [{                                 //指定数据列
            name: '小明',                          //数据列名
            data: [1, 0, 4]                        //数据
        }, {
            name: '小红',
            data: [5, 7, 3]
        }]
    });
});
</sh>

and then, you can see:

<div id="highchart-container" style="min-width:800px;height:400px"></div>


# Base

The composition of charset.

![highcharts compostion](https://raw.githubusercontent.com/houbb/resource/master/img/highcharts/2016-10-27-highcharts-compostion.jpg)



