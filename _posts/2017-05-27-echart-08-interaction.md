---
layout: post
title:  ECharts-08-interaction 交互
date:  2017-5-27 13:15:25 +0800
categories: [UI]
tags: [ui, html, js]
published: true
---

# ECharts 交互组件

ECharts 提供了很多交互组件：例组件 legend、标题组件 title、视觉映射组件 visualMap、数据区域缩放组件 dataZoom、时间线组件 timeline。

接下来的内容我们将介绍如何使用数据区域缩放组件 dataZoom。

# dataZoom

dataZoom 组件可以实现通过鼠标滚轮滚动，放大缩小图表的功能。

默认情况下 dataZoom 控制 x 轴，即对 x 轴进行数据窗口缩放和数据窗口平移操作。

```js
option = {
    xAxis: {
        type: 'value'
    },
    yAxis: {
        type: 'value'
    },
    dataZoom: [
        {   // 这个dataZoom组件，默认控制x轴。
            type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
            start: 10,      // 左边在 10% 的位置。
            end: 60         // 右边在 60% 的位置。
        }
    ],
    series: [
        {
            type: 'scatter', // 这是个『散点图』
            itemStyle: {
                opacity: 0.8
            },
            symbolSize: function (val) {
                return val[2] * 40;
            },
            data: [["14.616","7.241","0.896"],["3.958","5.701","0.955"],["2.768","8.971","0.669"],["9.051","9.710","0.171"],["14.046","4.182","0.536"],["12.295","1.429","0.962"],["4.417","8.167","0.113"],["0.492","4.771","0.785"],["7.632","2.605","0.645"],["14.242","5.042","0.368"]]
        }
    ]
}
```

上面的实例只能拖动 dataZoom 组件来缩小或放大图表。如果想在坐标系内进行拖动，以及用鼠标滚轮（或移动触屏上的两指滑动）进行缩放，那么需要 再再加上一个 inside 型的 dataZoom 组件。

在以上实例基础上我们再增加 type: 'inside' 的配置信息：


```js
option = {
    ...,
    dataZoom: [
        {   // 这个dataZoom组件，默认控制x轴。
            type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
            start: 10,      // 左边在 10% 的位置。
            end: 60         // 右边在 60% 的位置。
        },
        {   // 这个dataZoom组件，也控制x轴。
            type: 'inside', // 这个 dataZoom 组件是 inside 型 dataZoom 组件
            start: 10,      // 左边在 10% 的位置。
            end: 60         // 右边在 60% 的位置。
        }
    ],
    ...
}
```

当然我们可以通过 dataZoom.xAxisIndex 或 dataZoom.yAxisIndex 来指定 dataZoom 控制哪个或哪些数轴。

```js
var data1 = [];
var data2 = [];
var data3 = [];

var random = function (max) {
    return (Math.random() * max).toFixed(3);
};

for (var i = 0; i < 500; i++) {
    data1.push([random(15), random(10), random(1)]);
    data2.push([random(10), random(10), random(1)]);
    data3.push([random(15), random(10), random(1)]);
}

option = {
    animation: false,
    legend: {
        data: ['scatter', 'scatter2', 'scatter3']
    },
    tooltip: {
    },
    xAxis: {
        type: 'value',
        min: 'dataMin',
        max: 'dataMax',
        splitLine: {
            show: true
        }
    },
    yAxis: {
        type: 'value',
        min: 'dataMin',
        max: 'dataMax',
        splitLine: {
            show: true
        }
    },
    dataZoom: [
        {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 1,
            end: 35
        },
        {
            type: 'slider',
            show: true,
            yAxisIndex: [0],
            left: '93%',
            start: 29,
            end: 36
        },
        {
            type: 'inside',
            xAxisIndex: [0],
            start: 1,
            end: 35
        },
        {
            type: 'inside',
            yAxisIndex: [0],
            start: 29,
            end: 36
        }
    ],
    series: [
        {
            name: 'scatter',
            type: 'scatter',
            itemStyle: {
                normal: {
                    opacity: 0.8
                }
            },
            symbolSize: function (val) {
                return val[2] * 40;
            },
            data: data1
        },
        {
            name: 'scatter2',
            type: 'scatter',
            itemStyle: {
                normal: {
                    opacity: 0.8
                }
            },
            symbolSize: function (val) {
                return val[2] * 40;
            },
            data: data2
        },
        {
            name: 'scatter3',
            type: 'scatter',
            itemStyle: {
                normal: {
                    opacity: 0.8,
                }
            },
            symbolSize: function (val) {
                return val[2] * 40;
            },
            data: data3
        }
    ]
}
```

# 参考资料

[ECharts 交互组件](https://www.runoob.com/echarts/echarts-interaction.html)

* any list
{:toc}
