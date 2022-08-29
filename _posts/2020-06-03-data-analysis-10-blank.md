---
layout: post
title: 数据分析-10-页面白屏实现
date:  2020-6-3 13:34:28 +0800
categories: [Data]
tags: [data, data-analysis, monitor, apm, sh]
published: true
---


# elementsFromPoint 

elementsFromPoint 方法可以获取到当前视口内指定坐标处，由里到外排列的所有元素

根据 elementsFromPoint api，获取屏幕水平中线和竖直中线所在的元素

## 语法

```js
var elements = document.elementsFromPoint(x, y);
```

### 参数

x 坐标点的水平坐标值

y 坐标点的垂向坐标值

### 返回值

一个包含 element 对象的数组。

# 实现

```js
 
// 监听页面白屏
export function blankScreen() {
    // 页面加载完毕
    function onload(callback) {
        if (document.readyState === 'complete') {
            callback();
        } else {
            window.addEventListener('load', callback);
        }
    }
    // 定义属于白屏元素的白屏点
    let wrapperElements = ['html', 'body', '#container', '.content'];
    // 白屏点个数
    let emptyPoints = 0;
    // 选中dom点的名称
    function getSelector(element) {
        if (element.id) {
            return "#" + element.id;
        } else if (element.className) {// a b c => .a.b.c
            return "." + element.className.split(' ').filter(item => !!item).join('.');
        } else {
            return element.nodeName.toLowerCase();
        }
    }
    // 是否是白屏点判断
    function isWrapper(element) {
        let selector = getSelector(element);
        if (wrapperElements.indexOf(selector) != -1) {
            emptyPoints++;
        }
    }
    // 页面加载完毕初始化
    onload(function () {
        for (let i = 1; i <= 9; i++) {
            let xElements = document.elementsFromPoint(
                window.innerWidth * i / 10, window.innerHeight / 2);
            let yElements = document.elementsFromPoint(
                window.innerWidth / 2, window.innerHeight * i / 10);
            isWrapper(xElements[0]);
            isWrapper(yElements[0]);
        }
        // 总共18个点超过16个点算作白屏
        if (emptyPoints >= 16) {
            let centerElements = document.elementsFromPoint(
                window.innerWidth / 2, window.innerHeight / 2
            );
            console.log('页面白屏',{
                kind: 'stability',
                type: 'blank',
                emptyPoints,
                screen: window.screen.width + "X" + window.screen.height,
                viewPoint: window.innerWidth + "X" + window.innerHeight,
                selector: getSelector(centerElements[0])
            });
        }
    });
 
}
```

# 参考资料

https://github.com/GoogleChrome/lighthouse

* any list
{:toc}