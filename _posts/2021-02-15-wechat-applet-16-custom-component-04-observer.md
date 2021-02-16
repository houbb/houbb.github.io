---
layout: post
title:  16-微信小程序 Component 数据监听器
date:  2021-2-14 16:52:15 +0800
categories: [Dev]
tags: [dev, windows, sh]
published: true
---

# 数据监听器

数据监听器可以用于监听和响应任何属性和数据字段的变化。从小程序基础库版本 2.6.1 开始支持。

# 使用数据监听器

有时，在一些数据字段被 setData 设置时，需要执行一些操作。

例如， this.data.sum 永远是 this.data.numberA 与 this.data.numberB 的和。此时，可以使用数据监听器进行如下实现。

```js
Component({
  attached: function() {
    this.setData({
      numberA: 1,
      numberB: 2,
    })
  },
  observers: {
    'numberA, numberB': function(numberA, numberB) {
      // 在 numberA 或者 numberB 被设置时，执行这个函数
      this.setData({
        sum: numberA + numberB
      })
    }
  }
})
```

## 监听字段语法

数据监听器支持监听属性或内部数据的变化，可以同时监听多个。一次 setData 最多触发每个监听器一次。

同时，监听器可以监听子数据字段，如下例所示。

```js
Component({
  observers: {
    'some.subfield': function(subfield) {
      // 使用 setData 设置 this.data.some.subfield 时触发
      // （除此以外，使用 setData 设置 this.data.some 也会触发）
      subfield === this.data.some.subfield
    },
    'arr[12]': function(arr12) {
      // 使用 setData 设置 this.data.arr[12] 时触发
      // （除此以外，使用 setData 设置 this.data.arr 也会触发）
      arr12 === this.data.arr[12]
    },
  }
})
```

如果需要监听所有子数据字段的变化，可以使用通配符 `**` 。

```js
Component({
  observers: {
    'some.field.**': function(field) {
      // 使用 setData 设置 this.data.some.field 本身或其下任何子数据字段时触发
      // （除此以外，使用 setData 设置 this.data.some 也会触发）
      field === this.data.some.field
    },
  },
  attached: function() {
    // 这样会触发上面的 observer
    this.setData({
      'some.field': { /* ... */ }
    })
    // 这样也会触发上面的 observer
    this.setData({
      'some.field.xxx': { /* ... */ }
    })
    // 这样还是会触发上面的 observer
    this.setData({
      'some': { /* ... */ }
    })
  }
})
```

特别地，仅使用通配符 `**` 可以监听全部 setData 。

```js
Component({
  observers: {
    '**': function() {
      // 每次 setData 都触发
    },
  },
})
```

## Bugs & Tips:

数据监听器监听的是 setData 涉及到的数据字段，即使这些数据字段的值没有发生变化，数据监听器依然会被触发。

如果在数据监听器函数中使用 setData 设置本身监听的数据字段，可能会导致死循环，需要特别留意。

数据监听器和属性的 observer 相比，数据监听器更强大且通常具有更好的性能。

# 纯数据字段

纯数据字段是一些不用于界面渲染的 data 字段，可以用于提升页面更新性能。从小程序基础库版本 2.8.2 开始支持。

## 组件数据中的纯数据字段

有些情况下，某些 data 中的字段（包括 setData 设置的字段）既不会展示在界面上，也不会传递给其他组件，仅仅在当前组件内部使用。

此时，**可以指定这样的数据字段为“纯数据字段”，它们将仅仅被记录在 this.data 中，而不参与任何界面渲染过程，这样有助于提升页面更新性能。**

指定“纯数据字段”的方法是在 Component 构造器的 options 定义段中指定 pureDataPattern 为一个正则表达式，字段名符合这个正则表达式的字段将成为纯数据字段。

在开发者工具中预览效果

```js
Component({
  options: {
    pureDataPattern: /^_/ // 指定所有 _ 开头的数据字段为纯数据字段
  },
  data: {
    a: true, // 普通数据字段
    _b: true, // 纯数据字段
  },
  methods: {
    myMethod() {
      this.data._b // 纯数据字段可以在 this.data 中获取
      this.setData({
        c: true, // 普通数据字段
        _d: true, // 纯数据字段
      })
    }
  }
})
```

上述组件中的纯数据字段不会被应用到 WXML 上：

```xml
<view wx:if="{{a}}"> 这行会被展示 </view>
<view wx:if="{{_b}}"> 这行不会被展示 </view>
```

## 组件属性中的纯数据字段

属性也可以被指定为纯数据字段（遵循 pureDataPattern 的正则表达式）。

属性中的纯数据字段可以像普通属性一样接收外部传入的属性值，但不能将它直接用于组件自身的 WXML 中。

```js
Component({
  options: {
    pureDataPattern: /^_/
  },
  properties: {
    a: Boolean,
    _b: {
      type: Boolean,
      observer() {
        // 不要这样做！这个 observer 永远不会被触发
      }
    },
  }
})
```

注意：属性中的纯数据字段的属性 observer 永远不会触发！

如果想要监听属性值变化，使用 数据监听器 代替。

从小程序基础库版本 2.10.1 开始，也可以在页面或自定义组件的 json 文件中配置 pureDataPattern （这样就不需在 js 文件的 options 中再配置）。此时，其值应当写成字符串形式：

```js
{
  "pureDataPattern": "^_"
}
```

## 使用数据监听器监听纯数据字段

数据监听器 可以用于监听纯数据字段（与普通数据字段一样）。这样，可以通过监听、响应纯数据字段的变化来改变界面。

下面的示例是一个将 JavaScript 时间戳转换为可读时间的自定义组件。

```js
Component({
  options: {
    pureDataPattern: /^timestamp$/ // 将 timestamp 属性指定为纯数据字段
  },
  properties: {
    timestamp: Number,
  },
  observers: {
    timestamp: function () {
      // timestamp 被设置时，将它展示为可读时间字符串
      var timeString = new Date(this.data.timestamp).toLocaleString()
      this.setData({
        timeString: timeString
      })
    }
  }
})
<view>{{timeString}}</view>
```

# 抽象节点

这个特性自小程序基础库版本 1.9.6 开始支持。

## 在组件中使用抽象节点

有时，自定义组件模板中的一些节点，其对应的自定义组件不是由自定义组件本身确定的，而是自定义组件的调用者确定的。这时可以把这个节点声明为“抽象节点”。

例如，我们现在来实现一个“选框组”（selectable-group）组件，它其中可以放置单选框（custom-radio）或者复选框（custom-checkbox）。这个组件的 wxml 可以这样编写：

代码示例：

```xml
<!-- selectable-group.wxml -->
<view wx:for="{{labels}}">
  <label>
    <selectable disabled="{{false}}"></selectable>
    {{item}}
  </label>
</view>
```

其中，“selectable”不是任何在 json 文件的 usingComponents 字段中声明的组件，而是一个抽象节点。它需要在 componentGenerics 字段中声明：

```js
{
  "componentGenerics": {
    "selectable": true
  }
}
```

## 使用包含抽象节点的组件

在使用 selectable-group 组件时，必须指定“selectable”具体是哪个组件：

```xml
<selectable-group generic:selectable="custom-radio" />
```

这样，在生成这个 selectable-group 组件的实例时，“selectable”节点会生成“custom-radio”组件实例。类似地，如果这样使用：

```xml
<selectable-group generic:selectable="custom-checkbox" />
```

“selectable”节点则会生成“custom-checkbox”组件实例。

注意：上述的 custom-radio 和 custom-checkbox 需要包含在这个 wxml 对应 json 文件的 usingComponents 定义段中。

```js
{
  "usingComponents": {
    "custom-radio": "path/to/custom/radio",
    "custom-checkbox": "path/to/custom/checkbox"
  }
}
```

## 抽象节点的默认组件

抽象节点可以指定一个默认组件，当具体组件未被指定时，将创建默认组件的实例。默认组件可以在 componentGenerics 字段中指定：

```js
{
  "componentGenerics": {
    "selectable": {
      "default": "path/to/default/component"
    }
  }
}
```

- Tips:

节点的 generic 引用 generic:xxx="yyy" 中，值 yyy 只能是静态值，不能包含数据绑定。因而抽象节点特性并不适用于动态决定节点名的场景。

# 参考资料

https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/observer.html

* any list
{:toc}
