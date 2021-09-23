---
layout: post
title:  ECharts-01-入门开始 
date:  2017-5-27 13:15:25 +0800
categories: [UI]
tags: [ui, html, js]
published: true
---


# ECharts

[ECharts](http://echarts.baidu.com/feature.html)，一个纯 Javascript 的图表库，可以流畅的运行在 PC 和移动设备上，兼容当前绝大部分浏览器（IE8/9/10/11，Chrome，Firefox，Safari等），底层依赖轻量级的 Canvas 类库 ZRender，提供直观，生动，可交互，可高度个性化定制的数据可视化图表。

ECharts 3 中更是加入了更多丰富的交互功能以及更多的可视化效果，并且对移动端做了深度的优化。


#  ECharts-X

[ECharts-X](http://echarts.baidu.com/echarts2/x/doc/index.html) 的定位是 ECharts 的扩展，因此在使用和配置项上跟 ECharts 上尽量保持一致，可以使用 ECharts 中的组件比如legend, dataRange。也可以和 ECharts 中的折柱饼图混搭。
不过当然在引入 ECharts-X 前需要先引入 ECharts，如果之前没有使用过 ECharts，可以先去了解 ECharts 的入门教程，或者看看 ECharts 的诸多示例。


# PS

1. 有人说，Echarts 之于 [HighCharts](https://www.highcharts.com/products/highcharts/)。犹如WPS和EXCEL。个人还是很喜欢WPS的，因为EXCEL太大。不过HighCharts的文档详细，底蕴深厚是不争的事实。


# ECharts 入门例子

## 安装

- npm

```
npm install echarts --save
```

- cdn

```
https://cdn.jsdelivr.net/npm/echarts@5.2.0/dist/echarts.min.js
```

[https://www.jsdelivr.com/package/npm/echarts](https://www.jsdelivr.com/package/npm/echarts)

- github

github 下载。

[https://github.com/apache/echarts](https://github.com/apache/echarts)

## 入门

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <!-- 引入刚刚下载的 ECharts 文件 -->
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.2.0/dist/echarts.min.js"></script>
  </head>
</html>
```

打开这个 index.html，你会看到一片空白。但是不要担心，打开控制台确认没有报错信息，就可以进行下一步。

### 绘制一个简单的图表

在绘图前我们需要为 ECharts 准备一个定义了高宽的 DOM 容器。

在刚才的例子 `</head>` 之后，添加：

```html
<body>
  <!-- 为 ECharts 准备一个定义了宽高的 DOM -->
  <div id="main" style="width: 600px;height:400px;"></div>
</body>
```

然后就可以通过 echarts.init 方法初始化一个 echarts 实例并通过 setOption 方法生成一个简单的柱状图，下面是完整代码。

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>ECharts</title>
    <!-- 引入刚刚下载的 ECharts 文件 -->
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.2.0/dist/echarts.min.js"></script>
  </head>
  <body>
    <!-- 为 ECharts 准备一个定义了宽高的 DOM -->
    <div id="main" style="width: 600px;height:400px;"></div>
    <script type="text/javascript">
      // 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById('main'));

      // 指定图表的配置项和数据
      var option = {
        title: {
          text: 'ECharts 入门示例'
        },
        tooltip: {},
        legend: {
          data: ['销量']
        },
        xAxis: {
          data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
        },
        yAxis: {},
        series: [
          {
            name: '销量',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
          }
        ]
      };

      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    </script>
  </body>
</html>
```

* any list
{:toc}
