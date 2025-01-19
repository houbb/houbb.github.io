---
layout: post
title: Recharts 入门例子
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

# 入门

Recharts 是一个基于 React 的图表库，专为 React 项目设计，使用简单且功能强大。

## 例子

```javascript
<% raw %>

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// 数据
const data = [
    { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
];

function App() {
    return (
        <div style={{ width: '800px', margin: '0 auto' }}>
            <h1>Recharts 折线图示例</h1>
            <LineChart
                width={800}
                height={400}
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" /> {/* 网格线 */}
                <XAxis dataKey="name" /> {/* X 轴 */}
                <YAxis /> {/* Y 轴 */}
                <Tooltip /> {/* 提示框 */}
                <Legend /> {/* 图例 */}
                <Line type="monotone" dataKey="uv" stroke="#8884d8" /> {/* 第一条折线 */}
                <Line type="monotone" dataKey="pv" stroke="#82ca9d" /> {/* 第二条折线 */}
            </LineChart>
        </div>
    );
}

export default App;

<% endraw %>
```

## 关键点说明

- `LineChart`：折线图容器，用于包裹其他 Recharts 组件。

- `Line`：折线组件，`dataKey` 指定数据字段，`stroke` 设置折线颜色。

- `XAxis` 和 `YAxis`：X 轴和 Y 轴组件，`dataKey` 指定 X 轴的数据字段。

- `CartesianGrid`：网格线组件，`strokeDasharray` 设置虚线样式。

- `Tooltip`：提示框组件，鼠标悬停时显示数据详情。

- `Legend`：图例组件，用于切换显示/隐藏折线。


* any list
{:toc}

