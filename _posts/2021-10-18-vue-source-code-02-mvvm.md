---
layout: post
title: 响应式系统的基本原理
date: 2021-10-18 21:01:55 +0800
categories: [FrontEnd]
tags: [front-end, vue, web, source-code, sh]
published: true
---

# 响应式系统

Vue.js 是一款 MVVM 框架，数据模型仅仅是普通的 JavaScript 对象，但是对这些对象进行操作时，却能影响对应视图，它的核心实现就是「响应式系统」。

尽管我们在使用 Vue.js 进行开发时不会直接修改「响应式系统」，但是理解它的实现有助于避开一些常见的「坑」，也有助于在遇见一些琢磨不透的问题时可以深入其原理来解决它。

## Object.defineProperty

首先我们来介绍一下 Object.defineProperty，Vue.js就是基于它实现「响应式系统」的。

首先是使用方法：

```js
/*
    obj: 目标对象
    prop: 需要操作的目标对象的属性名
    descriptor: 描述符
    
    return value 传入对象
*/
Object.defineProperty(obj, prop, descriptor)
```

descriptor的一些属性，简单介绍几个属性，具体可以参考 MDN 文档。

- enumerable，属性是否可枚举，默认 false。

- configurable，属性是否可以被修改或者删除，默认 false。

- get，获取属性的方法。

- set，设置属性的方法。

## 实现 observer（可观察的）

知道了 Object.defineProperty 以后，我们来用它使对象变成可观察的。

这一部分的内容我们在第二小节中已经初步介绍过，在 init 的阶段会进行初始化，对数据进行「响应式化」。

![observer（可观察的）](https://img.kancloud.cn/c4/dd/c4dd695d1c4423aeb8ea55e67fff486d_828x336.gif)

为了便于理解，我们不考虑数组等复杂的情况，只对对象进行处理。

首先我们定义一个 cb 函数，这个函数用来模拟视图更新，调用它即代表更新视图，内部可以是一些更新视图的方法。

```js
function cb (val) {
    /* 渲染视图 */
    console.log("视图更新啦～");
}
```

然后我们定义一个 defineReactive ，这个方法通过 Object.defineProperty 来实现对对象的「响应式」化，入参是一个 obj（需要绑定的对象）、key（obj的某一个属性），val（具体的值）。

经过 defineReactive 处理以后，我们的 obj 的 key 属性在「读」的时候会触发 reactiveGetter 方法，而在该属性被「写」的时候则会触发 reactiveSetter 方法。

```js
function defineReactive (obj, key, val) {
    Object.defineProperty(obj, key, {
        enumerable: true,       /* 属性可枚举 */
        configurable: true,     /* 属性可被修改或删除 */
        get: function reactiveGetter () {
            return val;         /* 实际上会依赖收集，下一小节会讲 */
        },
        set: function reactiveSetter (newVal) {
            if (newVal === val) return;
            cb(newVal);
        }
    });
}
```

当然这是不够的，我们需要在上面再封装一层 observer。

这个函数传入一个 value（需要「响应式」化的对象），通过遍历所有属性的方式对该对象的每一个属性都通过 defineReactive 处理。

（注：实际上 observer 会进行递归调用，为了便于理解去掉了递归的过程）

```js
function observer (value) {
    if (!value || (typeof value !== 'object')) {
        return;
    }
    
    Object.keys(value).forEach((key) => {
        defineReactive(value, key, value[key]);
    });
}
```

最后，让我们用 observer 来封装一个 Vue 吧！

在 Vue 的构造函数中，对 options 的 data 进行处理，这里的 data 想必大家很熟悉，就是平时我们在写 Vue 项目时组件中的 data 属性（实际上是一个函数，这里当作一个对象来简单处理）。

```js
class Vue {
    /* Vue构造类 */
    constructor(options) {
        this._data = options.data;
        observer(this._data);
    }
}
```

这样我们只要 new 一个 Vue 对象，就会将 data 中的数据进行「响应式」化。

如果我们对 data 的属性进行下面的操作，就会触发 cb 方法更新视图。

```js
let o = new Vue({
    data: {
        test: "I am test."
    }
});
o._data.test = "hello,world.";  /* 视图更新啦～ */
```

至此，响应式原理已经介绍完了，接下来让我们学习「响应式系统」的另一部分 ——「依赖收集」。

注：本节代码参考[《响应式系统的基本原理》](https://github.com/answershuto/VueDemo/blob/master/%E3%80%8A%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F%E7%9A%84%E5%9F%BA%E6%9C%AC%E5%8E%9F%E7%90%86%E3%80%8B.js)。

# 参考资料

https://www.kancloud.cn/sllyli/vuejs/1244018

* any list
{:toc}
