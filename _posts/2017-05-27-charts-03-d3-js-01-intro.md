---
layout: post
title:  常见的图形库概览-03-D3.js 入门例子
date:  2017-5-27 13:15:25 +0800
categories: [UI]
tags: [ui, html, charts, js]
published: true
---

# 入门例子

以下是一个简单的 D3.js 入门示例，展示如何使用 D3.js 创建一个基本的柱状图（Bar Chart）。D3.js 是一个功能强大且灵活的库，适合创建高度定制化的数据可视化。

## 代码

普通的例子：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>D3.js 入门示例</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
</head>
<body>
    <div id="chart"></div>

    <script>
        // 数据
        const data = [30, 86, 168, 281, 303, 365];

        // 设置图表的宽度和高度
        const width = 500;
        const height = 300;
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };

        // 创建 SVG 画布
        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        // 创建比例尺
        const x = d3.scaleBand()
            .domain(d3.range(data.length)) // X 轴范围
            .range([margin.left, width - margin.right]) // X 轴宽度
            .padding(0.1); // 柱子之间的间距

        const y = d3.scaleLinear()
            .domain([0, d3.max(data)]) // Y 轴范围
            .range([height - margin.bottom, margin.top]); // Y 轴高度

        // 添加柱子
        svg.selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", (d, i) => x(i)) // X 轴位置
            .attr("y", d => y(d)) // Y 轴位置
            .attr("width", x.bandwidth()) // 柱子宽度
            .attr("height", d => height - margin.bottom - y(d)) // 柱子高度
            .attr("fill", "steelblue"); // 柱子颜色

        // 添加 X 轴
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickFormat(i => i + 1));

        // 添加 Y 轴
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));
    </script>
</body>
</html>
```

## 关键点说明

- `d3.scaleBand()`：用于创建 X 轴的比例尺，适合离散数据（如柱状图）。
- `d3.scaleLinear()`：用于创建 Y 轴的比例尺，适合连续数据。
- `d3.axisBottom()` 和 `d3.axisLeft()`：分别用于创建 X 轴和 Y 轴。
- `d3.select()`：选择 DOM 元素，类似于 jQuery 的选择器。
- `data().join()`：将数据绑定到 DOM 元素，并处理数据的增删改。

* any list
{:toc}
