---
layout: post
title: 数据分析-08-PerformanceObserver 性能监控使用入门
date:  2020-6-3 13:34:28 +0800
categories: [Data]
tags: [data, data-analysis, monitor, apm, sh]
published: true
---


# 介绍

PerformanceObserver 可用于获取性能相关的数据，例如首帧fp、首屏fcp、首次有意义的绘制 fmp等等。

## 构造函数

PerformanceObserver() 创建并返回一个新的 PerformanceObserver 对象。

## 提供的方法

`PerformanceObserver.observe()` 当记录的性能指标在指定的 entryTypes 之中时，将调用性能观察器的回调函数。


`PerformanceObserver.disconnect()` 停止性能观察者回调接收到性能指标。


`PerformanceObserver.takeRecords()` 返回存储在性能观察器中的性能指标的列表，并将其清空。

## observer.observe(options);

- options

一个只装了单个键值对的对象，该键值对的键名规定为 entryTypes。

entryTypes 的取值要求如下: **一个放字符串的数组，字符串的有效值取值在性能条目类型 中有详细列出。**

如果其中的某个字符串取的值无效，浏览器会自动忽略它。

另：若未传入 options 实参，或传入的 options 实参为空数组，会抛出 TypeError。

### 例子

```js
<script>
 const observer = new PerformanceObserver((list) => {
  for(const entry of list.getEntries()){
   console.groupCollapsed(entry.name);
   console.log(entry.entryType);
   console.log(entry.startTime);
   console.log(entry.duration);
   console.groupEnd(entry.name);
  }
 }) 
 observer.observe({entryTypes:['longtask','frame','navigation','resource','mark','measure','paint']});
</script>
```

根据打印结果我们可以推测出来：

entryTypes里的值其实就是我们告诉PerformanceObserver，我们想要获取的某一方面的性能值。

例如传入paint，就是说我们想要得到fcp和fp。

所以我们看打印，它打印出来了fp和fcp

![print](https://img-blog.csdnimg.cn/20200820152637312.png)

- 开始了吗？页面开始加载了吗？得到了服务端的回应吗？

首次绘制、首次内容绘制 First Paint (FP) / First Contentful Paint (FCP)

- 有用吗？有足够用户期望看到的内容被渲染出来了吗？

首次有效绘制、主要元素时间点 First Meaningful Paint (FMP) / Hero Element Timing

- 能用吗？用户能够与我们的页面交互了吗？还是依然在加载？

可交互时间点 Time to Interactive (TTI)

- 好用吗？交互是否流畅、自然、没有延迟与其他的干扰？

慢会话 Long Tasks (从技术上来讲应该是：没有慢会话)

![long task](https://img-blog.csdnimg.cn/20200820214448948.png)


## 概念解释

这里有必要解释一下什么是fp，fcp，fpm

```
TTFB：Time To First Byte，首字节时间
FP：First Paint，首次绘制，绘制Body
FCP：First Contentful Paint，首次有内容的绘制，第一个dom元素绘制完成
FMP：First Meaningful Paint，首次有意义的绘制
TTI：Time To Interactive，可交互时间，整个内容渲染完成
```

看下图

![看下图](https://img-blog.csdnimg.cn/img_convert/1961d1a323bcca39fbd0189083bcaff4.png)

FP仅有一个div根节点

FCP包含页面的基本框架，但没有数据内容

FMP包含页面的所有元素及数据

# 实际使用

## 例子 1

好了，我们在实际项目中怎么取获取呢？可以看看我的实现参考一下：

```js
// 使用 PerformanceObserver 监听 fcp
if (!!PerformanceObserver){
  try {
    const type = 'paint';
    if ((PerformanceObserver.supportedEntryTypes || []).includes(type)) {
      observer = new PerformanceObserver((entryList)=>{
        for(const entry of entryList.getEntriesByName('first-contentful-paint')){
          const { startTime,duration } = entry;
          console.log('[assets-load-monitor] PerformanceObserver fcp:', startTime+duration);
          
          // 上报startTime操作
        }
      });
      observer.observe({
        entryTypes: [type],
      });
      return;
    }
  } catch (e) {
    // ios 不支持这种entryTypes，会报错 https://caniuse.com/?search=PerformancePaintTiming
    console.warn('[assets-load-monitor] PerformanceObserver error:', (e || {}).message ? e.message : e);
  }
}
```

这里用了判断是否可以使用PerformanceObserver，不能使用的话，我们是用其他方法的，例如MutationObserver，这个我们我们后面再讲。

## 例子 2

监听页面中耗时过长的操作,或者资源加载时间等

```js
<body>
<div>
    <button onclick="runMeasure()">measure</button>
    <button onclick="runLongtask()">longtask</button>
    <button onclick="runNotLongtask()">not longtask</button>
</div>
<div id="output">

</div>
<script>
    let $output = document.querySelector('#output');
    if(!('PerformanceObserver' in window)) {
        $output.innerHTML = '您的浏览器不支持 PerformanceObserver API';
    }

    const observer = new PerformanceObserver((list) => {
        let output;
        for (const item of list.getEntries()) {
            console.log(item);
            output = {
                entryType: item.entryType,
                name: item.name,
                startTime: item.startTime,
                duration: item.duration
            };
            $output.innerHTML += '<pre>' + JSON.stringify(output) + '</pre>';
            if(item.entryType === 'longtask') {
                report();
            }
        }
    });

    // resource  资源加载时间 如 js,css
    observer.observe({ entryTypes: ['mark', 'measure', 'longtask', 'paint', 'navigation', 'resource',] });

    //events
    function runMeasure () {

        //performance.mark 可触发 mark 事件
        performance.mark('start')
        var now = new Date();
        while (new Date() - now < 40) { }
        performance.mark('end')
        console.error(performance.now());
        // performance.measure 可触发 measure 事件
        performance.measure('taskA_mark', 'start', 'end');
    }

    //模拟长任务
    function runLongtask () {
        var now = new Date();
        while (new Date() - now < 1 * 1000) { }
    }

    //短任务
    function runNotLongtask() {
        var now = new Date();
        while (new Date() - now < 30) { }
    }

    //上报
    function report (funName) {
        fetch('/report/to/path?longtask=1')
    }

</script>
</body>
```

# 是否支持

能否支持一个 web 功能，我们可以在下面的网址查看。 

> [https://caniuse.com/](https://caniuse.com/)

# 参考资料

[ALL IN ONE](https://www.cnblogs.com/xgqfrms/p/13840517.html)

https://blog.csdn.net/weixin_43964148/article/details/124089667

https://blog.csdn.net/weixin_40970987/article/details/108121988

[PerformanceObserver 性能监听](https://www.kancloud.cn/idcpj/python/2743240)

* any list
{:toc}