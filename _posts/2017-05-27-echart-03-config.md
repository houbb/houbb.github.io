---
layout: post
title:  ECharts-03-config 配置信息
date:  2017-5-27 13:15:25 +0800
categories: [UI]
tags: [ui, html, js]
published: true
---

# ECharts 配置语法

本章节我们将为大家介绍使用 ECharts 生成图表的一些配置。

# 第一步：创建 HTML 页面

创建一个 HTML 页面，引入 echarts.min.js：

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <!-- 引入 ECharts 文件 -->
    <script src="echarts.min.js"></script>
</head>
</html>
```

# 第二步: 为 ECharts 准备一个具备高宽的 DOM 容器

实例中 id 为 main 的 div 用于包含 ECharts 绘制的图表:

```html
<body>
    <!-- 为 ECharts 准备一个具备大小（宽高）的 DOM -->
    <div id="main" style="width: 600px;height:400px;"></div>
</body>
```

# 第三步: 设置配置信息

ECharts 库使用 json 格式来配置。

```js
echarts.init(document.getElementById('main')).setOption(option);
```

这里 option 表示使用 json 数据格式的配置来绘制图表。步骤如下：

## 标题

为图表配置标题：

```js
title: {
    text: '第一个 ECharts 实例'
}
```

## 提示信息

配置提示信息：

```js
tooltip: {},
```

## 图例组件

图例组件展现了不同系列的标记(symbol)，颜色和名字。

可以通过点击图例控制哪些系列不显示。

```js
legend: {
    data: [{
        name: '系列1',
        // 强制设置图形为圆。
        icon: 'circle',
        // 设置文本为红色
        textStyle: {
            color: 'red'
        }
    }]
}
```

## X 轴

配置要在 X 轴显示的项:

```js
xAxis: {
    data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
}
```

## Y 轴

配置要在 Y 轴显示的项。

```js
yAxis: {}
```

## 系列列表

每个系列通过 type 决定自己的图表类型:

```js
series: [{
    name: '销量',  // 系列名称
    type: 'bar',  // 系列图表类型
    data: [5, 20, 36, 10, 10, 20]  // 系列中的数据内容
}]
```

每个系列通过 type 决定自己的图表类型：

```
type: 'bar'：柱状/条形图
type: 'line'：折线/面积图
type: 'pie'：饼图
type: 'scatter'：散点（气泡）图
type: 'effectScatter'：带有涟漪特效动画的散点（气泡）
type: 'radar'：雷达图
type: 'tree'：树型图
type: 'treemap'：树型图
type: 'sunburst'：旭日图
type: 'boxplot'：箱形图
type: 'candlestick'：K线图
type: 'heatmap'：热力图
type: 'map'：地图
type: 'parallel'：平行坐标系的系列
type: 'lines'：线图
type: 'graph'：关系图
type: 'sankey'：桑基图
type: 'funnel'：漏斗图
type: 'gauge'：仪表盘
type: 'pictorialBar'：象形柱图
type: 'themeRiver'：主题河流
type: 'custom'：自定义系列
```

# 实际例子

```js
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>第一个 ECharts 实例</title>
    <!-- 引入 echarts.js -->
    <script src="https://cdn.staticfile.org/echarts/4.3.0/echarts.min.js"></script>
</head>
<body>
    <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
    <div id="main" style="width: 600px;height:400px;"></div>
    <script type="text/javascript">
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('main'));
 
        // 指定图表的配置项和数据
        var option = {
            title: {
                text: '第一个 ECharts 实例'
            },
            tooltip: {},
            legend: {
                data:['销量']
            },
            xAxis: {
                data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
            },
            yAxis: {},
            series: [{
                name: '销量',
                type: 'bar',
                data: [5, 20, 36, 10, 10, 20]
            }]
        };
 
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
    </script>
</body>
</html>
```

# 参考资料

[ECharts 配置语法](https://www.runoob.com/echarts/echarts-setup.html)

* any list
{:toc}
