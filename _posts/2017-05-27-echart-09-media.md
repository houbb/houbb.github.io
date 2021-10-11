---
layout: post
title:  ECharts-09-midea 交互式
date:  2017-5-27 13:15:25 +0800
categories: [UI]
tags: [ui, html, js]
published: true
---

# ECharts 响应式

ECharts 图表显示在用户指定高宽的 DOM 节点（容器）中。

有时候我们希望在 PC 和 移动设备上都能够很好的展示图表的内容，实现响应式的设计，为了解决这个问题，ECharts 完善了组件的定位设置，并且实现了类似 CSS Media Query 的自适应能力。

# ECharts 组件的定位和布局

大部分『组件』和『系列』会遵循两种定位方式。

## left/right/top/bottom/width/height 定位方式

这六个量中，每个量都可以是『绝对值』或者『百分比』或者『位置描述』。

绝对值

单位是浏览器像素（px），用 number 形式书写（不写单位）。例如 {left: 23, height: 400}。

百分比

表示占 DOM 容器高宽的百分之多少，用 string 形式书写。例如 {right: '30%', bottom: '40%'}。

位置描述

可以设置 left: 'center'，表示水平居中。

可以设置 top: 'middle'，表示垂直居中。

这六个量的概念，和 CSS 中六个量的概念类似：

left：距离 DOM 容器左边界的距离。

right：距离 DOM 容器右边界的距离。

top：距离 DOM 容器上边界的距离。

bottom：距离 DOM 容器下边界的距离。

width：宽度。

height：高度。

在横向，left、right、width 三个量中，只需两个量有值即可，因为任两个量可以决定组件的位置和大小，例如 left 和 right 或者 right 和 width 都可以决定组件的位置和大小。 

纵向，top、bottom、height 三个量，和横向类同不赘述。

## center / radius 定位方式

center

是一个数组，表示 [x, y]，其中，x、y可以是『绝对值』或者『百分比』，含义和前述相同。

radius

是一个数组，表示 [内半径, 外半径]，其中，内外半径可以是『绝对值』或者『百分比』，含义和前述相同。

在自适应容器大小时，百分比设置是很有用的。

## 横向（horizontal）和纵向（vertical）

ECharts的『外观狭长』型的组件（如 legend、visualMap、dataZoom、timeline等），大多提供了『横向布局』『纵向布局』的选择。

例如，在细长的移动端屏幕上，可能适合使用『纵向布局』；在PC宽屏上，可能适合使用『横向布局』。

横纵向布局的设置，一般在『组件』或者『系列』的 orient 或者 layout 配置项上，设置为 'horizontal' 或者 'vertical'。

# 实例

以下实例中我们可以可尝试拖动右下角的圆点，图表会随着屏幕尺寸变化，legend 和 系列会自动改变布局位置和方式。

实例中我们使用了 jQuery 来加载外部数据，使用时我们需要引入 jQuery 库。

```js
$.when(
    $.getScript('https://www.runoob.com/static/js/timelineGDP.js'),
    $.getScript('https://www.runoob.com/static/js/draggable.js')
).done(function () {

    draggable.init(
        $('div[_echarts_instance_]')[0],
        myChart,
        {
            width: 700,
            height: 400,
            throttle: 70
        }
    );

    myChart.hideLoading();



    option = {
        baseOption: {
            title : {
                text: '南丁格尔玫瑰图',
                subtext: '纯属虚构',
                x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                data:['rose1','rose2','rose3','rose4','rose5','rose6','rose7','rose8']
            },
            toolbox: {
                show : true,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    magicType : {
                        show: true,
                        type: ['pie', 'funnel']
                    },
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            calculable : true,
            series : [
                {
                    name:'半径模式',
                    type:'pie',
                    roseType : 'radius',
                    label: {
                        normal: {
                            show: false
                        },
                        emphasis: {
                            show: true
                        }
                    },
                    lableLine: {
                        normal: {
                            show: false
                        },
                        emphasis: {
                            show: true
                        }
                    },
                    data:[
                        {value:10, name:'rose1'},
                        {value:5, name:'rose2'},
                        {value:15, name:'rose3'},
                        {value:25, name:'rose4'},
                        {value:20, name:'rose5'},
                        {value:35, name:'rose6'},
                        {value:30, name:'rose7'},
                        {value:40, name:'rose8'}
                    ]
                },
                {
                    name:'面积模式',
                    type:'pie',
                    roseType : 'area',
                    data:[
                        {value:10, name:'rose1'},
                        {value:5, name:'rose2'},
                        {value:15, name:'rose3'},
                        {value:25, name:'rose4'},
                        {value:20, name:'rose5'},
                        {value:35, name:'rose6'},
                        {value:30, name:'rose7'},
                        {value:40, name:'rose8'}
                    ]
                }
            ]
        },
        media: [
            {
                option: {
                    legend: {
                        right: 'center',
                        bottom: 0,
                        orient: 'horizontal'
                    },
                    series: [
                        {
                            radius: [20, '50%'],
                            center: ['25%', '50%']
                        },
                        {
                            radius: [30, '50%'],
                            center: ['75%', '50%']
                        }
                    ]
                }
            },
            {
                query: {
                    minAspectRatio: 1
                },
                option: {
                    legend: {
                        right: 'center',
                        bottom: 0,
                        orient: 'horizontal'
                    },
                    series: [
                        {
                            radius: [20, '50%'],
                            center: ['25%', '50%']
                        },
                        {
                            radius: [30, '50%'],
                            center: ['75%', '50%']
                        }
                    ]
                }
            },
            {
                query: {
                    maxAspectRatio: 1
                },
                option: {
                    legend: {
                        right: 'center',
                        bottom: 0,
                        orient: 'horizontal'
                    },
                    series: [
                        {
                            radius: [20, '50%'],
                            center: ['50%', '30%']
                        },
                        {
                            radius: [30, '50%'],
                            center: ['50%', '70%']
                        }
                    ]
                }
            },
            {
                query: {
                    maxWidth: 500
                },
                option: {
                    legend: {
                        right: 10,
                        top: '15%',
                        orient: 'vertical'
                    },
                    series: [
                        {
                            radius: [20, '50%'],
                            center: ['50%', '30%']
                        },
                        {
                            radius: [30, '50%'],
                            center: ['50%', '75%']
                        }
                    ]
                }
            }
        ]
    };



    myChart.setOption(option);

});
```

要在 option 中设置 Media Query 须遵循如下格式：

```js
option = {
    baseOption: { // 这里是基本的『原子option』。
        title: {...},
        legend: {...},
        series: [{...}, {...}, ...],
        ...
    },
    media: [ // 这里定义了 media query 的逐条规则。
        {
            query: {...},   // 这里写规则。
            option: {       // 这里写此规则满足下的option。
                legend: {...},
                ...
            }
        },
        {
            query: {...},   // 第二个规则。
            option: {       // 第二个规则对应的option。
                legend: {...},
                ...
            }
        },
        {                   // 这条里没有写规则，表示『默认』，
            option: {       // 即所有规则都不满足时，采纳这个option。
                legend: {...},
                ...
            }
        }
    ]
};
```

上面的例子中，baseOption、以及 media 每个 option 都是『原子 option』，即普通的含有各组件、系列定义的 option。而由『原子option』组合成的整个 option，我们称为『复合 option』。

baseOption 是必然被使用的，此外，满足了某个 query 条件时，对应的 option 会被使用 chart.mergeOption() 来 merge 进去。

## query

每个 query 类似于这样：

```js
{
    minWidth: 200,
    maxHeight: 300,
    minAspectRatio: 1.3
}
```

现在支持三个属性：width、height、aspectRatio（长宽比）。每个属性都可以加上 min 或 max 前缀。

比如，minWidth: 200 表示『大于等于200px宽度』。

两个属性一起写表示『并且』，比如：{minWidth: 200, maxHeight: 300} 表示『大于等于200px宽度，并且小于等于300px高度』。

## option

media中的 option 既然是『原子 option』，理论上可以写任何 option 的配置项。

但是一般我们只写跟布局定位相关的，例如截取上面例子中的一部分 query option：

```js
media: [
    ...,
    {
        query: {
            maxAspectRatio: 1           // 当长宽比小于1时。
        },
        option: {
            legend: {                   // legend 放在底部中间。
                right: 'center',
                bottom: 0,
                orient: 'horizontal'    // legend 横向布局。
            },
            series: [                   // 两个饼图左右布局。
                {
                    radius: [20, '50%'],
                    center: ['50%', '30%']
                },
                {
                    radius: [30, '50%'],
                    center: ['50%', '70%']
                }
            ]
        }
    },
    {
        query: {
            maxWidth: 500               // 当容器宽度小于 500 时。
        },
        option: {
            legend: {
                right: 10,              // legend 放置在右侧中间。
                top: '15%',
                orient: 'vertical'      // 纵向布局。
            },
            series: [                   // 两个饼图上下布局。
                {
                    radius: [20, '50%'],
                    center: ['50%', '30%']
                },
                {
                    radius: [30, '50%'],
                    center: ['50%', '75%']
                }
            ]
        }
    },
    ...
]
```

# 多个 query 被满足时的优先级

注意，可以有多个 query 同时被满足，会都被 mergeOption，定义在后的后被 merge（即优先级更高）。

# 默认 query

如果 media 中有某项不写 query，则表示『默认值』，即所有规则都不满足时，采纳这个option。

# 容器大小实时变化时的注意事项

在不少情况下，并不需要容器DOM节点任意随着拖拽变化大小，而是只是根据不同终端设置几个典型尺寸。

但是如果容器DOM节点需要能任意随着拖拽变化大小，那么目前使用时需要注意这件事：某个配置项，如果在某一个 query option 中出现，那么在其他 query option 中也必须出现，否则不能够回归到原来的状态。

（left/right/top/bottom/width/height 不受这个限制。）

# 『复合 option』 中的 media 不支持 merge

也就是说，当第二（或三、四、五 ...）次 chart.setOption(rawOption) 时，如果 rawOption 是 复合option（即包含 media 列表），那么新的 rawOption.media 列表不会和老的 media 列表进行 merge，而是简单替代。当然，rawOption.baseOption 仍然会正常和老的 option 进行merge。 

其实，很少有场景需要使用『复合 option』来多次 setOption，而我们推荐的做法是，使用 mediaQuery 时，第一次setOption使用『复合 option』，后面 setOption 时仅使用 『原子 option』，也就是仅仅用 setOption 来改变 baseOption。

以下中我们使用了 jQuery 来加载外部数据，使用时我们需要引入 jQuery 库。该实例是一个和时间轴结合的例子：

```js
$.when(
    $.getScript('https://www.runoob.com/static/js/timelineGDP.js'),
    $.getScript('https://www.runoob.com/static/js/draggable.js')
).done(function () {

    draggable.init(
        $('div[_echarts_instance_]')[0],
        myChart,
        {
            width: 700,
            height: 630,
            lockY: true,
            throttle: 70
        }
    );

    myChart.hideLoading();

    var categoryData = [
        '北京','天津','河北','山西','内蒙古','辽宁','吉林','黑龙江',
        '上海','江苏','浙江','安徽','福建','江西','山东','河南',
        '湖北','湖南','广东','广西','海南','重庆','四川','贵州',
        '云南','西藏','陕西','甘肃','青海','宁夏','新疆'
    ];


    option = {
        baseOption: {
            timeline: {
                axisType: 'category',
                autoPlay: true,
                playInterval: 1000,
                data: [
                    '2002-01-01', '2003-01-01', '2004-01-01',
                    '2005-01-01', '2006-01-01', '2007-01-01',
                    '2008-01-01', '2009-01-01', '2010-01-01',
                    '2011-01-01'
                ],
                label: {
                    formatter : function(s) {
                        return (new Date(s)).getFullYear();
                    }
                }
            },
            title: {
                subtext: 'Media Query 示例'
            },
            tooltip: {
                trigger:'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            xAxis: {
                type: 'value',
                name: 'GDP（亿元）',
                max: 30000,
                data: null
            },
            yAxis: {
                type: 'category',
                data: categoryData,
                axisLabel: {interval: 0},
                splitLine: {show: false}
            },
            legend: {
                data: ['第一产业', '第二产业', '第三产业', 'GDP', '金融', '房地产'],
                selected: {
                    'GDP': false, '金融': false, '房地产': false
                }
            },
            calculable : true,
            series: [
                {name: 'GDP', type: 'bar'},
                {name: '金融', type: 'bar'},
                {name: '房地产', type: 'bar'},
                {name: '第一产业', type: 'bar'},
                {name: '第二产业', type: 'bar'},
                {name: '第三产业', type: 'bar'},
                {name: 'GDP占比', type: 'pie'}
            ]
        },
        media: [
            {
                option: {
                    legend: {
                        orient: 'horizontal',
                        left: 'right',
                        itemGap: 10
                    },
                    grid: {
                        left: '10%',
                        top: 80,
                        right: 90,
                        bottom: 100
                    },
                    xAxis: {
                        nameLocation: 'end',
                        nameGap: 10,
                        splitNumber: 5,
                        splitLine: {
                            show: true
                        }
                    },
                    timeline: {
                        orient: 'horizontal',
                        inverse: false,
                        left: '20%',
                        right: '20%',
                        bottom: 10,
                        height: 40
                    },
                    series: [
                        {name: 'GDP占比', center: ['75%', '30%'], radius: '28%'}
                    ]
                }
            },
            {
                query: {maxWidth: 670, minWidth: 550},
                option: {
                    legend: {
                        orient: 'horizontal',
                        left: 200,
                        itemGap: 5
                    },
                    grid: {
                        left: '10%',
                        top: 80,
                        right: 90,
                        bottom: 100
                    },
                    xAxis: {
                        nameLocation: 'end',
                        nameGap: 10,
                        splitNumber: 5,
                        splitLine: {
                            show: true
                        }
                    },
                    timeline: {
                        orient: 'horizontal',
                        inverse: false,
                        left: '20%',
                        right: '20%',
                        bottom: 10,
                        height: 40
                    },
                    series: [
                        {name: 'GDP占比', center: ['75%', '30%'], radius: '28%'}
                    ]
                }
            },
            {
                query: {maxWidth: 550},
                option: {
                    legend: {
                        orient: 'vertical',
                        left: 'right',
                        itemGap: 5
                    },
                    grid: {
                        left: 55,
                        top: '32%',
                        right: 100,
                        bottom: 50
                    },
                    xAxis: {
                        nameLocation: 'middle',
                        nameGap: 25,
                        splitNumber: 3
                    },
                    timeline: {
                        orient: 'vertical',
                        inverse: true,
                        right: 10,
                        top: 150,
                        bottom: 10,
                        width: 55
                    },
                    series: [
                        {name: 'GDP占比', center: ['45%', '20%'], radius: '28%'}
                    ]
                }
            }
        ],
        options: [
            {
                title: {text: '2002全国宏观经济指标'},
                series: [
                    {data: dataMap.dataGDP['2002']},
                    {data: dataMap.dataFinancial['2002']},
                    {data: dataMap.dataEstate['2002']},
                    {data: dataMap.dataPI['2002']},
                    {data: dataMap.dataSI['2002']},
                    {data: dataMap.dataTI['2002']},
                    {data: [
                        {name: '第一产业', value: dataMap.dataPI['2002sum']},
                        {name: '第二产业', value: dataMap.dataSI['2002sum']},
                        {name: '第三产业', value: dataMap.dataTI['2002sum']}
                    ]}
                ]
            },
            {
                title : {text: '2003全国宏观经济指标'},
                series : [
                    {data: dataMap.dataGDP['2003']},
                    {data: dataMap.dataFinancial['2003']},
                    {data: dataMap.dataEstate['2003']},
                    {data: dataMap.dataPI['2003']},
                    {data: dataMap.dataSI['2003']},
                    {data: dataMap.dataTI['2003']},
                    {data: [
                        {name: '第一产业', value: dataMap.dataPI['2003sum']},
                        {name: '第二产业', value: dataMap.dataSI['2003sum']},
                        {name: '第三产业', value: dataMap.dataTI['2003sum']}
                    ]}
                ]
            },
            {
                title : {text: '2004全国宏观经济指标'},
                series : [
                    {data: dataMap.dataGDP['2004']},
                    {data: dataMap.dataFinancial['2004']},
                    {data: dataMap.dataEstate['2004']},
                    {data: dataMap.dataPI['2004']},
                    {data: dataMap.dataSI['2004']},
                    {data: dataMap.dataTI['2004']},
                    {data: [
                        {name: '第一产业', value: dataMap.dataPI['2004sum']},
                        {name: '第二产业', value: dataMap.dataSI['2004sum']},
                        {name: '第三产业', value: dataMap.dataTI['2004sum']}
                    ]}
                ]
            },
            {
                title : {text: '2005全国宏观经济指标'},
                series : [
                    {data: dataMap.dataGDP['2005']},
                    {data: dataMap.dataFinancial['2005']},
                    {data: dataMap.dataEstate['2005']},
                    {data: dataMap.dataPI['2005']},
                    {data: dataMap.dataSI['2005']},
                    {data: dataMap.dataTI['2005']},
                    {data: [
                        {name: '第一产业', value: dataMap.dataPI['2005sum']},
                        {name: '第二产业', value: dataMap.dataSI['2005sum']},
                        {name: '第三产业', value: dataMap.dataTI['2005sum']}
                    ]}
                ]
            },
            {
                title : {text: '2006全国宏观经济指标'},
                series : [
                    {data: dataMap.dataGDP['2006']},
                    {data: dataMap.dataFinancial['2006']},
                    {data: dataMap.dataEstate['2006']},
                    {data: dataMap.dataPI['2006']},
                    {data: dataMap.dataSI['2006']},
                    {data: dataMap.dataTI['2006']},
                    {data: [
                        {name: '第一产业', value: dataMap.dataPI['2006sum']},
                        {name: '第二产业', value: dataMap.dataSI['2006sum']},
                        {name: '第三产业', value: dataMap.dataTI['2006sum']}
                    ]}
                ]
            },
            {
                title : {text: '2007全国宏观经济指标'},
                series : [
                    {data: dataMap.dataGDP['2007']},
                    {data: dataMap.dataFinancial['2007']},
                    {data: dataMap.dataEstate['2007']},
                    {data: dataMap.dataPI['2007']},
                    {data: dataMap.dataSI['2007']},
                    {data: dataMap.dataTI['2007']},
                    {data: [
                        {name: '第一产业', value: dataMap.dataPI['2007sum']},
                        {name: '第二产业', value: dataMap.dataSI['2007sum']},
                        {name: '第三产业', value: dataMap.dataTI['2007sum']}
                    ]}
                ]
            },
            {
                title : {text: '2008全国宏观经济指标'},
                series : [
                    {data: dataMap.dataGDP['2008']},
                    {data: dataMap.dataFinancial['2008']},
                    {data: dataMap.dataEstate['2008']},
                    {data: dataMap.dataPI['2008']},
                    {data: dataMap.dataSI['2008']},
                    {data: dataMap.dataTI['2008']},
                    {data: [
                        {name: '第一产业', value: dataMap.dataPI['2008sum']},
                        {name: '第二产业', value: dataMap.dataSI['2008sum']},
                        {name: '第三产业', value: dataMap.dataTI['2008sum']}
                    ]}
                ]
            },
            {
                title : {text: '2009全国宏观经济指标'},
                series : [
                    {data: dataMap.dataGDP['2009']},
                    {data: dataMap.dataFinancial['2009']},
                    {data: dataMap.dataEstate['2009']},
                    {data: dataMap.dataPI['2009']},
                    {data: dataMap.dataSI['2009']},
                    {data: dataMap.dataTI['2009']},
                    {data: [
                        {name: '第一产业', value: dataMap.dataPI['2009sum']},
                        {name: '第二产业', value: dataMap.dataSI['2009sum']},
                        {name: '第三产业', value: dataMap.dataTI['2009sum']}
                    ]}
                ]
            },
            {
                title : {text: '2010全国宏观经济指标'},
                series : [
                    {data: dataMap.dataGDP['2010']},
                    {data: dataMap.dataFinancial['2010']},
                    {data: dataMap.dataEstate['2010']},
                    {data: dataMap.dataPI['2010']},
                    {data: dataMap.dataSI['2010']},
                    {data: dataMap.dataTI['2010']},
                    {data: [
                        {name: '第一产业', value: dataMap.dataPI['2010sum']},
                        {name: '第二产业', value: dataMap.dataSI['2010sum']},
                        {name: '第三产业', value: dataMap.dataTI['2010sum']}
                    ]}
                ]
            },
            {
                title : {text: '2011全国宏观经济指标'},
                series : [
                    {data: dataMap.dataGDP['2011']},
                    {data: dataMap.dataFinancial['2011']},
                    {data: dataMap.dataEstate['2011']},
                    {data: dataMap.dataPI['2011']},
                    {data: dataMap.dataSI['2011']},
                    {data: dataMap.dataTI['2011']},
                    {data: [
                        {name: '第一产业', value: dataMap.dataPI['2011sum']},
                        {name: '第二产业', value: dataMap.dataSI['2011sum']},
                        {name: '第三产业', value: dataMap.dataTI['2011sum']}
                    ]}
                ]
            }
        ]
    };

    myChart.setOption(option);

});
```

# 参考资料

[ECharts 响应式](https://www.runoob.com/echarts/echarts-mediaqueries.html)

* any list
{:toc}
