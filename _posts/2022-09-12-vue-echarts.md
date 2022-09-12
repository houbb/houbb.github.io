---
layout: post
title:  VUE 中整合使用 echarts 入门例子
date:  2022-09-12 09:22:02 +0800
categories: [VUE]
tags: [js, vue, echarts, sh]
published: true
---

# install

在项目终端安装echarts：

```
npm install echarts --save
```

安装成功后 package.json 中会自动多出这部分：

```
"echarts": "^5.3.3",
```

# 全局引入

全局引入：在 main.js 中全局引入 echarts

```js
import echarts from "echarts";
Vue.prototype.$echarts = echarts;
```

# 使用 

在在绘图前我们需要为 ECharts 准备一个定义了高宽的 DOM 容器。

## 页面

```xml
<div id="myChart" :style="{width: '300px', height: '300px'}"></div>
```

## js

```js
export default {
 name: 'outerErrorStatus',
 data () {
  return {
   msg: 'Welcome to Your Vue.js App'
  }
 },
 mounted(){
  this.drawLine();
 },
 methods: {
  drawLine(){
    // 基于准备好的dom，初始化echarts实例
    let myChart = this.$echarts.init(document.getElementById('myChart'))
    // 绘制图表
    myChart.setOption({
      title: { text: '在Vue中使用echarts' },
      tooltip: {},
      xAxis: {
        data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
      },
      yAxis: {},
      series: [{
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
      }]
    });
  }
 }
}
```


# 参考资料

https://blog.csdn.net/geidongdong/article/details/122561517

https://www.cnblogs.com/myqinyh/p/15743881.html

* any list
{:toc}