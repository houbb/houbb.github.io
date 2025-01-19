---
layout: post
title:  ApexCharts 图表入门例子
date:  2017-5-27 13:15:25 +0800
categories: [UI]
tags: [ui, html, chart, math, js]
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

# 入门例子

## 源码

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ApexCharts 入门示例</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/apexcharts@latest/dist/apexcharts.css">
    <script src="https://cdn.jsdelivr.net/npm/apexcharts@latest"></script>
</head>
<body>
    <div id="chart"></div>

    <script>
        // 配置选项
        const options = {
            chart: {
                type: 'line', // 图表类型：折线图
                height: 350,  // 图表高度
            },
            series: [{
                name: 'Sales', // 数据系列名称
                data: [30, 40, 35, 50, 49, 60, 70, 91, 125] // 数据值
            }],
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'] // X 轴标签
            },
            stroke: {
                curve: 'smooth' // 平滑曲线
            },
            colors: ['#008FFB'] // 折线颜色
        };

        // 创建图表
        const chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
    </script>
</body>
</html>
```

## 关键点

- `type: 'line'`：指定图表类型为折线图。ApexCharts 还支持其他类型，如 `bar`（柱状图）、`pie`（饼图）等。

- `series`：数据系列，可以包含多个数据集（例如多条折线）。

- `xaxis.categories`：X 轴的标签。

- `stroke.curve`：设置折线的样式，`smooth` 表示平滑曲线。

- `colors`：设置折线的颜色。

>  [ApexCharts 官方文档](https://apexcharts.com/docs/)。


* any list
{:toc}

