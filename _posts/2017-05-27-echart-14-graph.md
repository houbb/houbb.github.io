---
layout: post
title:  ECharts-14-graph 关系图
date:  2017-5-27 13:15:25 +0800
categories: [UI]
tags: [ui, html, js]
published: true
---

# 1. 基本的 echarts

## 代码

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ECharts 关系图示例</title>
    <script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>
</head>
<body>
    <div id="relation-chart" style="width: 800px; height: 600px;"></div>

    <script type="text/javascript">
        var chartDom = document.getElementById('relation-chart');
        var myChart = echarts.init(chartDom);

        var option = {
            title: {
                text: '关系图示例',
                left: 'center'
            },
            tooltip: {},
            animationDurationUpdate: 1500,
            animationEasingUpdate: 'quinticInOut',
            series: [
                {
                    type: 'graph',
                    layout: 'force',
                    roam: true,
                    draggable: true,
                    force: {
                        repulsion: 100
                    },
                    data: [
                        { name: '节点1' },
                        { name: '节点2' },
                        { name: '节点3' }
                        // 添加更多节点
                    ],
                    links: [
                        { source: '节点1', target: '节点2' },
                        { source: '节点1', target: '节点3' }
                        // 添加更多边
                    ],
                    label: {
                        show: true,
                        position: 'top'
                    },
                    edgeSymbol: ['circle', 'arrow'],
                    edgeSymbolSize: [4, 10],
                    emphasis: {
                        focus: 'adjacency',
                        lineStyle: {
                            width: 10
                        }
                    }
                }
            ]
        };

        myChart.setOption(option);
    </script>
</body>
</html>
```

# 2.如何添加额外的属性

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ECharts 关系图示例</title>
    <script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>
</head>
<body>
    <div id="relation-chart" style="width: 800px; height: 600px;"></div>

    <script type="text/javascript">
        var chartDom = document.getElementById('relation-chart');
        var myChart = echarts.init(chartDom);

        var option = {
            title: {
                text: '关系图示例',
                left: 'center'
            },
            tooltip: {},
            animationDurationUpdate: 1500,
            animationEasingUpdate: 'quinticInOut',
            series: [
                {
                    type: 'graph',
                    layout: 'force',
                    roam: true,
                    draggable: true,
                    force: {
                        repulsion: 100
                    },
                    data: [
                        { name: '节点1', category: '类别A', value: 10, color: '#ff5733' },
                        { name: '节点2', category: '类别B', value: 15, color: '#c70039' },
                        { name: '节点3', category: '类别C', value: 15, color: '#900c3f' },
                        { name: '节点4', category: '类别C', value: 15, color: '#581845' },
                        // 添加更多节点，每个节点可以有不同的属性
                    ],
                    links: [
                        { source: '节点1', target: '节点2' },
						{ source: '节点2', target: '节点3' },
						{ source: '节点3', target: '节点4' },
                        // 添加更多边
                    ],
                    itemStyle: {
                        normal: {
                            color: function(params) {
                                return params.data.color || '#ff5733'; // 如果节点定义了颜色属性，使用节点的颜色，否则使用默认颜色
                            }
                        }
                    },
                    label: {
                        show: true,
                        position: 'top',
                        formatter: function(params) {
                            return params.data.category + '-' + params.data.value; // 显示节点的类别信息
                        }
                    },
					edgeSymbol: ['circle', 'arrow'],
					edgeSymbolSize: [4, 10],
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 16,
                            fontWeight: 'bold'
                        },
                        lineStyle: {
                            width: 5
                        }
                    }
                }
            ]
        };

        myChart.setOption(option);
    </script>
</body>
</html>
```

# 3. 动态调整按钮的大小

## 代码

点击对应的按钮，可以让对应的节点和大小改变。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ECharts 关系图示例</title>
    <script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>
</head>
<body>
    <div id="relation-chart" style="width: 800px; height: 600px;"></div>
	<button onclick="updateNodes('cA')">分类A</button>
    <button onclick="updateNodes('cB')">分类B</button>
    <button onclick="updateNodes('cC')">分类C</button>
	<button onclick="reset('')">重置</button>

    <script type="text/javascript">
        var chartDom = document.getElementById('relation-chart');
        var myChart = echarts.init(chartDom);

        var option = {
            title: {
                text: '关系图示例',
                left: 'center'
            },
            tooltip: {},
            animationDurationUpdate: 1500,
            animationEasingUpdate: 'quinticInOut',
            series: [
                {
                    type: 'graph',
                    layout: 'force',
                    roam: true,
                    draggable: true,
                    force: {
                        repulsion: 100
                    },
                    data: [
                        { name: '节点1', category: 'cA', value: 10, color: '#ff5733', symbolSize: 10},
                        { name: '节点2', category: 'cB', value: 15, color: '#c70039', symbolSize: 10 },
                        { name: '节点3', category: 'cC', value: 15, color: '#900c3f', symbolSize: 10 },
                        { name: '节点4', category: 'cC', value: 15, color: '#581845', symbolSize: 10 },
                        // 添加更多节点，每个节点可以有不同的属性
                    ],
                    links: [
                        { source: '节点1', target: '节点2' },
						{ source: '节点2', target: '节点3' },
						{ source: '节点3', target: '节点4' },
                        // 添加更多边
                    ],
                    itemStyle: {
                        normal: {
                            color: function(params) {
                                return params.data.color || '#ff5733'; // 如果节点定义了颜色属性，使用节点的颜色，否则使用默认颜色
                            }
                        }
                    },
                    label: {
                        show: true,
                        position: 'top',
                        formatter: function(params) {
                            return params.data.name; // 显示节点的类别信息
                        }
                    },
					edgeSymbol: ['circle', 'arrow'],
					edgeSymbolSize: [4, 10],
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 16,
                            fontWeight: 'bold'
                        },
                        lineStyle: {
                            width: 5
                        }
                    }
                }
            ]
        };

        myChart.setOption(option);
		
		
		function updateNodes(category) {
            var newData = option.series[0].data.map(function(item) {
                if (item.category === category) {
                    item.symbolSize = 16; // 将符合分类的节点大小设置为20
                } else {
                    item.symbolSize = 2; // 将其他节点大小恢复为10
                }
                return item;
            });

            option.series[0].data = newData;
            myChart.setOption(option);
        }
		
		function reset() {
            var newData = option.series[0].data.map(function(item) {
                item.symbolSize = 10; // 将其他节点大小恢复为10
                return item;
            });

            option.series[0].data = newData;
            myChart.setOption(option);
        }
    </script>
</body>
</html>
```

# 参考资料

chat

* any list
{:toc}
