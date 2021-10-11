---
layout: post
title:  ECharts-12-旭日图
date:  2017-5-27 13:15:25 +0800
categories: [UI]
tags: [ui, html, js]
published: true
---

# ECharts 旭日图

旭日图（Sunburst）由多层的环形图组成，在数据结构上，内圈是外圈的父节点。因此，它既能像饼图一样表现局部和整体的占比，又能像矩形树图一样表现层级关系。

ECharts 创建旭日图很简单，只需要在 series 配置项中声明类型为 sunburst 即可，data 数据结构以树形结构声明，看下一个简单的实例：

```js
var option = {
    series: {
        type: 'sunburst',
        data: [{
            name: 'A',
            value: 10,
            children: [{
                value: 3,
                name: 'Aa'
            }, {
                value: 5,
                name: 'Ab'
            }]
        }, {
            name: 'B',
            children: [{
                name: 'Ba',
                value: 4
            }, {
                name: 'Bb',
                value: 2
            }]
        }, {
            name: 'C',
            value: 3
        }]
    }
};
```

# 颜色等样式调整

默认情况下会使用全局调色盘 color 分配最内层的颜色，其余层则与其父元素同色。

在旭日图中，扇形块的颜色有以下三种设置方式：

- 在 series.data.itemStyle 中设置每个扇形块的样式。

- 在 series.levels.itemStyle 中设置每一层的样式。

- 在 series.itemStyle 中设置整个旭日图的样式。

上述三者的优先级是从高到低的，也就是说，配置了 series.data.itemStyle 的扇形块将会覆盖 series.levels.itemStyle 和 series.itemStyle 的设置。

下面，我们将整体的颜色设为灰色 #aaa，将最内层的颜色设为蓝色 blue，将 Aa、B 这两块设为红色 red。

```js
var option = {
    series: {
        type: 'sunburst',
        data: [{
            name: 'A',
            value: 10,
            children: [{
                value: 3,
                name: 'Aa',
                itemStyle: {
                    color: 'red'
                }
            }, {
                value: 5,
                name: 'Ab'
            }]
        }, {
            name: 'B',
            children: [{
                name: 'Ba',
                value: 4
            }, {
                name: 'Bb',
                value: 2
            }],
            itemStyle: {
                color: 'red'
            }
        }, {
            name: 'C',
            value: 3
        }],
        itemStyle: {
            color: '#aaa'
        },
        levels: [{
            // 留给数据下钻的节点属性
        }, {
            itemStyle: {
                color: 'blue'
            }
        }]
    }
};
```

按层配置样式是一个很常用的功能，能够很大程度上提高配置的效率。

# 数据下钻

旭日图默认支持数据下钻，也就是说，当点击了扇形块之后，将以该扇形块的数据作为根节点，进一步显示该数据的细节。

在数据下钻后，图形的中间会出现一个用于返回上一层的图形，该图形的样式可以通过 levels[0] 配置。

```js
var data = [{
    name: 'Grandpa',
    children: [{
        name: 'Uncle Leo',
        value: 15,
        children: [{
            name: 'Cousin Jack',
            value: 2
        }, {
            name: 'Cousin Mary',
            value: 5,
            children: [{
                name: 'Jackson',
                value: 2
            }]
        }, {
            name: 'Cousin Ben',
            value: 4
        }]
    }, {
        name: 'Father',
        value: 10,
        children: [{
            name: 'Me',
            value: 5
        }, {
            name: 'Brother Peter',
            value: 1
        }]
    }]
}, {
    name: 'Nancy',
    children: [{
        name: 'Uncle Nike',
        children: [{
            name: 'Cousin Betty',
            value: 1
        }, {
            name: 'Cousin Jenny',
            value: 2
        }]
    }]
}];

option = {
    series: {
        type: 'sunburst',
        // highlightPolicy: 'ancestor',
        data: data,
        radius: [0, '90%'],
        label: {
            rotate: 'radial'
        }
    }
};
```

如果不需要数据下钻功能，可以通过将 nodeClick 设置为 false 来关闭，也可以设为 'link'，并将 data.link 设为点击扇形块对应打开的链接。

# 高亮相关扇形块

旭日图支持鼠标移动到某扇形块时，高亮相关数据块的操作，可以通过设置 highlightPolicy，包括以下几种高亮方式：

- 'descendant'（默认值）：高亮鼠标移动所在扇形块与其后代元素；

- 'ancestor'：高亮鼠标所在扇形块与其祖先元素；

- 'self'：仅高亮鼠标所在扇形块；

- 'none'：不会淡化（downplay）其他元素。

上面提到的"高亮"，对于鼠标所在的扇形块，会使用 emphasis 样式；对于其他相关扇形块，则会使用 highlight 样式。

通过这种方式，可以很方便地实现突出显示相关数据的需求。

具体来说，对于配置项：

```js
itemStyle: {
    color: 'yellow',
    borderWidth: 2,
    emphasis: {
        color: 'red'
    },
    highlight: {
        color: 'orange'
    },
    downplay: {
        color: '#ccc'
    }
}
```

highlightPolicy 为 'descendant':

```js
option = {
    silent: true,
    series: {
        radius: ['15%', '95%'],
        center: ['50%', '60%'],
        type: 'sunburst',
        sort: null,
        highlightPolicy: 'descendant',
        data: [{
            value: 10,
            children: [{
                name: 'target',
                value: 4,
                children: [{
                    value: 2,
                    children: [{
                        value: 1
                    }]
                }, {
                    value: 1
                }, {
                    value: 0.5
                }]
            }, {
                value: 2
            }]
        }, {
            value: 4,
            children: [{
                children: [{
                    value: 2
                }]
            }]
        }],
        label: {
            normal: {
                rotate: 'none',
                color: '#fff'
            }
        },
        levels: [],
        itemStyle: {
            color: 'yellow',
            borderWidth: 2
        },
        emphasis: {
            itemStyle: {
                color: 'red'
            }
        },
        highlight: {
            itemStyle: {
                color: 'orange'
            }
        },
        downplay: {
            itemStyle: {
                color: '#ccc'
            }
        }
    }
};

setTimeout(function () {
    myChart.dispatchAction({
        type: 'sunburstHighlight',
        targetNodeId: 'target'
    });
});
```

# 参考资料

https://www.runoob.com/echarts/echarts-sunburst.html

https://www.echartsjs.com/zh/option.html#series-sunburst

* any list
{:toc}
