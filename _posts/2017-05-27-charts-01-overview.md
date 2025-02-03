---
layout: post
title:  常见的图形库概览-00-overview 
date:  2017-5-27 13:15:25 +0800
categories: [UI]
tags: [ui, html, charts, js]
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

# chat

## 图形库系列



## 常见图形库对比

| 图形库       | 特点                                                                 | 图表类型                                                                 | 适用场景                          | 依赖项               | 官网/文档                                                                 |
|--------------|----------------------------------------------------------------------|--------------------------------------------------------------------------|-----------------------------------|----------------------|---------------------------------------------------------------------------|
| ECharts  | 功能丰富，支持大规模数据，交互性强                                   | 折线图、柱状图、饼图、地图、雷达图、散点图、热力图等                     | 复杂数据可视化                    | 无                   | [https://echarts.apache.org/](https://echarts.apache.org/)               |
| Chart.js | 简单易用，轻量级，支持响应式设计                                     | 折线图、柱状图、饼图、雷达图、散点图等                                   | 简单图表，快速开发                | 无                   | [https://www.chartjs.org/](https://www.chartjs.org/)                     |
| D3.js    | 功能强大，灵活性高，学习曲线陡峭                                     | 几乎支持所有自定义图表                                                   | 复杂、高度定制化的数据可视化      | 无                   | [https://d3js.org/](https://d3js.org/)                                   |
| Highcharts | 功能丰富，文档齐全，商业版需付费                                   | 折线图、柱状图、饼图、散点图、地图等                                     | 企业级应用，商业项目              | 无                   | [https://www.highcharts.com/](https://www.highcharts.com/)               |
| Plotly.js | 基于 D3.js，支持交互式图表，适合科学计算                            | 折线图、柱状图、3D 图表、地图、热力图等                                  | 科学计算、交互式图表              | 无                   | [https://plotly.com/javascript/](https://plotly.com/javascript/)         |
| ApexCharts | 现代设计，响应式，支持动画和交互                                   | 折线图、柱状图、饼图、雷达图、热力图等                                   | 现代 Web 应用，交互式图表         | 无                   | [https://apexcharts.com/](https://apexcharts.com/)                       |
| Victory  | 基于 React，适合 React 项目，支持移动端                              | 折线图、柱状图、饼图、散点图等                                           | React 项目，移动端应用            | React                | [https://formidable.com/open-source/victory/](https://formidable.com/open-source/victory/) |
| Recharts | 基于 React 和 D3.js，简单易用                                        | 折线图、柱状图、饼图、雷达图等                                           | React 项目，快速开发              | React                | [https://recharts.org/](https://recharts.org/)                           |
| AntV     | 由蚂蚁金服开发，包含多个子项目（G2、G6、F2 等），适合复杂场景        | 多种图表类型，支持关系图、流程图等                                       | 复杂数据可视化，企业级应用        | 无                   | [https://antv.vision/](https://antv.vision/)                             |
| C3.js    | 基于 D3.js，易于使用，适合快速开发                                   | 折线图、柱状图、饼图等                                                   | 快速开发，简单图表                | D3.js                | [https://c3js.org/](https://c3js.org/)                                   |
| Google Charts | 由 Google 提供，功能强大，支持多种图表类型                        | 折线图、柱状图、饼图、地图等                                             | 企业级应用，快速开发              | 无                   | [https://developers.google.com/chart](https://developers.google.com/chart) |

### 对比总结：
- ECharts 和 Highcharts 功能丰富，适合复杂数据可视化。
- Chart.js 和 ApexCharts 轻量易用，适合快速开发。
- D3.js 和 AntV 灵活性高，适合高度定制化的需求。
- Victory 和 Recharts 适合 React 项目。
- Plotly.js 适合科学计算和交互式图表。
- C3.js 和 Google Charts 适合快速开发简单图表。

根据项目需求选择合适的图形库：
- 如果需要高度定制化，选择 D3.js 或 AntV。
- 如果需要快速开发简单图表，选择 Chart.js 或 ApexCharts。
- 如果是 React 项目，选择 Victory 或 Recharts。
- 如果需要企业级支持，选择 Highcharts 或 Google Charts。

* any list
{:toc}
