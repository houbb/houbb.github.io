---
layout: post
title:  常见的图形库概览-01-Chart.js 入门例子
date:  2017-5-27 13:15:25 +0800
categories: [UI]
tags: [ui, html, charts, js]
published: true
---

# 入门例子

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chart.js 入门示例</title>
    <!-- 引入 Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div style="width: 600px; height: 400px;">
        <!-- 创建一个 canvas 元素用于渲染图表 -->
        <canvas id="myChart"></canvas>
    </div>

    <script>
        // 在这里编写 Chart.js 代码
        // 获取 canvas 元素的上下文
const ctx = document.getElementById('myChart').getContext('2d');

// 创建图表
const myChart = new Chart(ctx, {
    type: 'bar', // 图表类型：柱状图
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'], // X 轴标签
        datasets: [{
            label: 'Monthly Sales', // 数据集的标签
            data: [65, 59, 80, 81, 56, 55], // 数据值
            backgroundColor: [ // 柱状图的背景颜色
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [ // 柱状图的边框颜色
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1 // 边框宽度
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true // Y 轴从 0 开始
            }
        }
    }
});
    </script>
</body>
</html>
```

## 关键点

- `type: 'bar'`：指定图表类型为柱状图。Chart.js 还支持其他类型，如 `line`（折线图）、`pie`（饼图）等。
- `data.labels`：X 轴的标签。
- `data.datasets`：数据集，可以包含多个数据集（例如多个系列的柱状图）。
- `backgroundColor` 和 `borderColor`：设置柱状图的颜色。
- `options.scales.y.beginAtZero`：确保 Y 轴从 0 开始。

* any list
{:toc}
