---
layout: post
title: 图表库 C3.js  入门例子
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

C3.js 是一个基于 D3.js 的图表库，封装了常见的图表类型，使用简单且功能丰富。

## 例子

以下是一个简单的 C3.js 入门示例，展示如何使用 C3.js 创建一个基本的柱状图（Bar Chart）。


```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>C3.js 入门示例</title>
    <!-- 引入 D3.js 5.x -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/5.16.0/d3.min.js"></script>
    <!-- 引入 C3.js -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.js"></script>
</head>
<body>
    <div id="chart"></div>

    <script>
        // 创建图表
        const chart = c3.generate({
            bindto: '#chart', // 绑定到容器的 ID
            data: {
                columns: [
                    ['data1', 30, 86, 168, 281, 303, 365], // 数据系列 1
                    ['data2', 50, 100, 150, 200, 250, 300]  // 数据系列 2
                ],
                type: 'bar' // 图表类型：柱状图
            },
            axis: {
                x: {
                    type: 'category', // X 轴类型：分类
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] // X 轴标签
                }
            },
            bar: {
                width: {
                    ratio: 0.5 // 柱子的宽度比例
                }
            }
        });
    </script>
</body>
</html>
```

## 关键点说明

- `c3.generate()`：创建图表实例，`bindto` 指定图表容器的 ID。

- `data.columns`：数据系列，每个数组表示一个数据系列。

- `data.type`：图表类型，`bar` 表示柱状图。

- `axis.x`：X 轴配置，`type: 'category'` 表示分类轴，`categories` 指定 X 轴标签。

- `bar.width`：柱子的宽度配置，`ratio` 表示柱子宽度的比例。

* any list
{:toc}