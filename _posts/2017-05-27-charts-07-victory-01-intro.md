---
layout: post
title: Victory 图表基于 React，适合 React 项目，支持移动端
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

Victory 是一个基于 React 的图表库，适合在 React 项目中使用。

## 例子

入门示例，展示如何使用 Victory 创建一个基本的柱状图（Bar Chart）。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Victory in Native HTML/JS</title>
    <!-- 引入 React 和 ReactDOM -->
    <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
    <!-- 引入 Victory -->
    <script src="https://unpkg.com/victory@35/dist/victory.min.js"></script>
</head>
<body>
    <div id="root"></div>

    <script>
        // 在这里编写 React 和 Victory 代码
		// 获取 Victory 组件
		const { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } = Victory;

		// 数据
		const data = [
			{ quarter: 1, earnings: 13000 },
			{ quarter: 2, earnings: 16500 },
			{ quarter: 3, earnings: 14250 },
			{ quarter: 4, earnings: 19000 }
		];

		// 定义 React 组件
		function App() {
			return React.createElement(VictoryChart, {
				theme: VictoryTheme.material,
				domainPadding: 20
			},
				React.createElement(VictoryAxis, {
					tickValues: [1, 2, 3, 4],
					tickFormat: ["Q1", "Q2", "Q3", "Q4"]
				}),
				React.createElement(VictoryAxis, {
					dependentAxis: true,
					tickFormat: (x) => `$${x / 1000}k`
				}),
				React.createElement(VictoryBar, {
					data: data,
					x: "quarter",
					y: "earnings"
				})
			);
		}

		// 渲染 React 组件到 DOM
		ReactDOM.render(
			React.createElement(App),
			document.getElementById('root')
		);
    </script>
</body>
</html>
```

## React 引入方式

```javascript
<% raw %>

import React from 'react';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory';

// 数据
const data = [
    { quarter: 1, earnings: 13000 },
    { quarter: 2, earnings: 16500 },
    { quarter: 3, earnings: 14250 },
    { quarter: 4, earnings: 19000 }
];

function App() {
    return (
        <div style={{ width: '600px', margin: '0 auto' }}>
            <h1>Victory 柱状图示例</h1>
            <VictoryChart
                theme={VictoryTheme.material} // 使用 Material 主题
                domainPadding={20} // 柱子之间的间距
            >
                <VictoryAxis
                    tickValues={[1, 2, 3, 4]} // X 轴刻度值
                    tickFormat={["Q1", "Q2", "Q3", "Q4"]} // X 轴标签
                />
                <VictoryAxis
                    dependentAxis // Y 轴
                    tickFormat={(x) => `$${x / 1000}k`} // Y 轴标签格式
                />
                <VictoryBar
                    data={data} // 数据
                    x="quarter" // X 轴数据字段
                    y="earnings" // Y 轴数据字段
                />
            </VictoryChart>
        </div>
    );
}

export default App;
<% endraw %>
```


* any list
{:toc}

