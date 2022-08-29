---
layout: post
title: 数据分析-08-PerformanceObserver api 
date:  2020-6-3 13:34:28 +0800
categories: [Data]
tags: [data, data-analysis, monitor, apm, sh]
published: true
---


# PerformanceObserver()

PerformanceObserver() 构造函数使用给定的观察者回调创建一个新的 PerformanceObserver 对象。 

当通过 observe() 方法为已注册的条目类型记录性能条目事件时，将调用观察者回调。

## 语法

```js
new PerformanceObserver(callback)
```

## 例子

```js
const observer = new PerformanceObserver((list, obj) => {
  const entries = list.getEntries();
  for (let i=0; i < entries.length; i++) {
    // Process "mark" and "frame" events
  }
});
observer.observe({entryTypes: ["mark", "frame"]});

function perf_observer(list, observer) {
  // Process the "measure" event
}
const observer2 = new PerformanceObserver(perf_observer);
observer2.observe({entryTypes: ["measure"]});
```

## 属性

entries 是 PerformanceEntry，对应的属性如下：

```
duration 持续时间
entryType 类型名称
name 名称
startTime 开始时间
```


# 支持的明细类型

## 获取所有支持的类型

```js
PerformanceObserver.supportedEntryTypes

// returns ["element", "event", "first-input", "largest-contentful-paint", "layout-shift", "longtask", "mark", "measure", "navigation", "paint", "resource"] in Chrome 89
```

## 检查不支持的类型

以下函数检查是否支持一组可能的条目类型。 

不受支持的类型会记录到控制台，但是可以将此信息记录到客户端分析以指示无法观察到特定类型。

```js
function detectSupport(entryTypes) {
  for (const entryType of entryTypes) {
    if (!PerformanceObserver.supportedEntryTypes.includes(entryType)) {
      console.log(entryType);
    }
  }
}

detectSupport(["resource", "mark", "frame"]);
```

# EventType 介绍

各种支持的类型，是什么意思呢？

| value | desc |
|:---|:---|
|   element |  报告元素的加载时间。   |
|   navigation |  文档的地址。 |
|   resource |  请求资源的解析 URL。 即使请求被重定向，该值也不会改变。 |
|   mark |  通过调用 performance.mark() 创建标记时使用的名称。 |
|   measure | 通过调用 performance.measure() 创建度量时使用的名称。  |
|   paint |  'first-paint'或'first-contentful-paint'。 |
|   longtask |  报告长任务的实例 |

# 参考资料

https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver/PerformanceObserver

https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserverEntryList

https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceObserver/PerformanceObserver

https://w3c.github.io/performance-timeline/#abstract

https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry/entryType

* any list
{:toc}