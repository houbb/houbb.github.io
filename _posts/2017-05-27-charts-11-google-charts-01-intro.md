---
layout: post
title: 图表库 Google Charts  入门例子
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

Google Charts 是一个功能强大的图表库，支持多种图表类型，并且易于使用。

> [Google Charts ](https://developers.google.com/chart/interactive/docs)

## 例子

以下是一个简单的 Google Charts 入门示例，展示如何使用 Google Charts 创建一个基本的柱状图（Bar Chart）。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Charts 入门示例</title>
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
    <script>
        // 加载 Google Charts 库
        google.charts.load('current', { packages: ['corechart'] });

        // 设置回调函数，当库加载完成后执行
        google.charts.setOnLoadCallback(drawChart);

        // 绘制图表的函数
        function drawChart() {
            // 创建数据表
            const data = google.visualization.arrayToDataTable([
                ['Month', 'Sales'], // 列标题
                ['Jan', 1000],      // 数据行
                ['Feb', 1170],
                ['Mar', 660],
                ['Apr', 1030],
                ['May', 800],
                ['Jun', 1200]
            ]);

            // 配置选项
            const options = {
                title: 'Monthly Sales', // 图表标题
                hAxis: { title: 'Month' }, // 水平轴标题
                vAxis: { title: 'Sales' }, // 垂直轴标题
                legend: 'none' // 不显示图例
            };

            // 创建图表实例并绑定到容器
            const chart = new google.visualization.ColumnChart(document.getElementById('chart'));

            // 绘制图表
            chart.draw(data, options);
        }
    </script>
</head>
<body>
    <div id="chart" style="width: 900px; height: 500px;"></div>
</body>
</html>
```

* any list
{:toc}