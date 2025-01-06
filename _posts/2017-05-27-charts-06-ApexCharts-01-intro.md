---
layout: post
title:  ApexCharts 图表入门例子
date:  2017-5-27 13:15:25 +0800
categories: [UI]
tags: [ui, html, chart, math, js]
published: true
---


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

