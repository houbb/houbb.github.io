---
layout: post
title:  ECharts-02-install 安装入门 
date:  2017-5-27 13:15:25 +0800
categories: [UI]
tags: [ui, html, js]
published: true
---

# ECharts

ECharts 是一个使用 JavaScript 实现的开源可视化库，涵盖各行业图表，满足各种需求。

ECharts 遵循 Apache-2.0 开源协议，免费商用。

ECharts 兼容当前绝大部分浏览器（IE8/9/10/11，Chrome，Firefox，Safari等）及兼容多种设备，可随时随地任性展示。

# 第一个例子

```html
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

# ECharts 特性

ECharts 包含了以下特性：

丰富的可视化类型: 提供了常规的折线图、柱状图、散点图、饼图、K线图，用于统计的盒形图，用于地理数据可视化的地图、热力图、线图，用于关系数据可视化的关系图、treemap、旭日图，多维数据可视化的平行坐标，还有用于 BI 的漏斗图，仪表盘，并且支持图与图之间的混搭。

多种数据格式无需转换直接使用: 内置的 dataset 属性（4.0+）支持直接传入包括二维表，key-value 等多种格式的数据源，此外还支持输入 TypedArray 格式的数据。

千万数据的前端展现: 通过增量渲染技术（4.0+），配合各种细致的优化，ECharts 能够展现千万级的数据量。

移动端优化: 针对移动端交互做了细致的优化，例如移动端小屏上适于用手指在坐标系中进行缩放、平移。 PC 端也可以用鼠标在图中进行缩放（用鼠标滚轮）、平移等。

多渲染方案，跨平台使用: 支持以 Canvas、SVG（4.0+）、VML 的形式渲染图表。

深度的交互式数据探索: 提供了 图例、视觉映射、数据区域缩放、tooltip、数据刷选等开箱即用的交互组件，可以对数据进行多维度数据筛取、视图缩放、展示细节等交互操作。

多维数据的支持以及丰富的视觉编码手段: 对于传统的散点图等，传入的数据也可以是多个维度的。

动态数据: 数据的改变驱动图表展现的改变。

绚丽的特效: 针对线数据，点数据等地理数据的可视化提供了吸引眼球的特效。

通过 GL 实现更多更强大绚丽的三维可视化: 在 VR，大屏场景里实现三维的可视化效果。

无障碍访问（4.0+）: 支持自动根据图表配置项智能生成描述，使得盲人可以在朗读设备的帮助下了解图表内容，让图表可以被更多人群访问！

# 安装

## 1、独立版本

我们可以在直接下载 echarts.min.js 并用 `<script>` 标签引入。

[echarts.min.js(4.7.0)](https://cdn.staticfile.org/echarts/4.7.0/echarts.min.js)

另外，开发环境下可以使用源代码版本 echarts.js 并用 `<script>` 标签引入，源码版本包含了常见的错误提示和警告。

[echarts.js(4.7.0)](https://cdn.staticfile.org/echarts/4.7.0/echarts.js)

我们也可以在 ECharts 的官网上直接下载更多丰富的版本，包含了不同主题跟语言，下载地址：https://echarts.apache.org/zh/download.html。

这些构建好的 echarts 提供了下面这几种定制：

完全版：echarts/dist/echarts.js，体积最大，包含所有的图表和组件，所包含内容参见：echarts/echarts.all.js。

常用版：echarts/dist/echarts.common.js，体积适中，包含常见的图表和组件，所包含内容参见：echarts/echarts.common.js。

精简版：echarts/dist/echarts.simple.js，体积较小，仅包含最常用的图表和组件，所包含内容参见：echarts/echarts.simple.js。

## 2、使用 CDN 方法

以下推荐国外比较稳定的两个 CDN，国内还没发现哪一家比较好，目前还是建议下载到本地。

Staticfile CDN（国内） : https://cdn.staticfile.org/echarts/4.3.0/echarts.min.js

jsDelivr：https://cdn.jsdelivr.net/npm/echarts@4.3.0/dist/echarts.min.js。

cdnjs : https://cdnjs.cloudflare.com/ajax/libs/echarts/4.3.0/echarts.min.js

## 3、NPM 方法

由于 npm 安装速度慢，本教程使用了淘宝的镜像及其命令 cnpm，安装使用介绍参照：使用淘宝 NPM 镜像。

npm 版本需要大于 3.0，如果低于此版本需要升级它：

```
# 查看版本
$ npm -v
2.3.0

#升级 npm
cnpm install npm -g


# 升级或安装 cnpm
npm install cnpm -g
```

通过 cnpm 获取 echarts：

```
# 最新稳定版
$ cnpm install echarts --save
```

使用：

```js
var echarts = require('echarts');
 
// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('main'));
// 绘制图表
myChart.setOption({
    title: {
        text: 'ECharts 入门示例'
    },
    tooltip: {},
    xAxis: {
        data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
    },
    yAxis: {},
    series: [{
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
    }]
});
```

# 参考资料

[ECharts 教程](https://www.runoob.com/echarts/echarts-tutorial.html)

* any list
{:toc}
