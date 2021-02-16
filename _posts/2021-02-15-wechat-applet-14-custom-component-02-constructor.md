---
layout: post
title:  14-微信小程序 Component 构造器
date:  2021-2-14 16:52:15 +0800
categories: [Dev]
tags: [dev, windows, sh]
published: true
---

# Component 构造器

Component 构造器可用于定义组件，调用 Component 构造器时可以指定组件的属性、数据、方法等。

详细的参数含义和使用请参考 [Component 参考文档](https://developers.weixin.qq.com/miniprogram/dev/reference/api/Component.html)。

```js
Component({

  behaviors: [],

  properties: {
    myProperty: { // 属性名
      type: String,
      value: ''
    },
    myProperty2: String // 简化的定义方式
  },
  
  data: {}, // 私有数据，可用于模板渲染

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () { },
    moved: function () { },
    detached: function () { },
  },

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached: function () { }, // 此处attached的声明会被lifetimes字段中的声明覆盖
  ready: function() { },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () { },
    hide: function () { },
    resize: function () { },
  },

  methods: {
    onMyButtonTap: function(){
      this.setData({
        // 更新属性和数据的方法与更新页面数据的方法类似
      })
    },
    // 内部方法建议以下划线开头
    _myPrivateMethod: function(){
      // 这里将 data.A[0].B 设为 'myPrivateData'
      this.setData({
        'A[0].B': 'myPrivateData'
      })
    },
    _propertyChange: function(newVal, oldVal) {

    }
  }

})
```

## 使用 Component 构造器构造页面

事实上，小程序的页面也可以视为自定义组件。

因而，页面也可以使用 Component 构造器构造，拥有与普通组件一样的定义段与实例方法。

但此时要求对应 json 文件中包含 usingComponents 定义段。

此时，组件的属性可以用于接收页面的参数，如访问页面 /pages/index/index?paramA=123&paramB=xyz ，如果声明有属性 paramA 或 paramB ，则它们会被赋值为 123 或 xyz 。

页面的生命周期方法（即 on 开头的方法），应写在 methods 定义段中。

```js
{
  "usingComponents": {}
}
Component({

  properties: {
    paramA: Number,
    paramB: String,
  },

  methods: {
    onLoad: function() {
      this.data.paramA // 页面参数 paramA 的值
      this.data.paramB // 页面参数 paramB 的值
    }
  }

})
```

使用 Component 构造器来构造页面的一个好处是可以使用 behaviors 来提取所有页面中公用的代码段。

例如，在所有页面被创建和销毁时都要执行同一段代码，就可以把这段代码提取到 behaviors 中。

```js
// page-common-behavior.js
module.exports = Behavior({
  attached: function() {
    // 页面创建时执行
    console.info('Page loaded!')
  },
  detached: function() {
    // 页面销毁时执行
    console.info('Page unloaded!')
  }
})
// 页面 A
var pageCommonBehavior = require('./page-common-behavior')
Component({
  behaviors: [pageCommonBehavior],
  data: { /* ... */ },
  methods: { /* ... */ },
})
// 页面 B
var pageCommonBehavior = require('./page-common-behavior')
Component({
  behaviors: [pageCommonBehavior],
  data: { /* ... */ },
  methods: { /* ... */ },
})
```

# 组件间通信

组件间的基本通信方式有以下几种。

WXML 数据绑定：用于父组件向子组件的指定属性设置数据，仅能设置 JSON 兼容数据（自基础库版本 2.0.9 开始，还可以在数据中包含函数）。

事件：用于子组件向父组件传递数据，可以传递任意数据。

如果以上两种方式不足以满足需要，父组件还可以通过 this.selectComponent 方法获取子组件实例对象，这样就可以直接访问组件的任意数据和方法。

## 监听事件

事件系统是组件间通信的主要方式之一。

自定义组件可以触发任意的事件，引用组件的页面可以监听这些事件。

关于事件的基本概念和用法，参见 [事件](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html) 。

监听自定义组件事件的方法与监听基础组件事件的方法完全一致：

```js
<!-- 当自定义组件触发“myevent”事件时，调用“onMyEvent”方法 -->
<component-tag-name bindmyevent="onMyEvent" />
<!-- 或者可以写成 -->
<component-tag-name bind:myevent="onMyEvent" />
Page({
  onMyEvent: function(e){
    e.detail // 自定义组件触发事件时提供的detail对象
  }
})
```

## 触发事件

自定义组件触发事件时，需要使用 triggerEvent 方法，指定事件名、detail对象和事件选项：

```js
<!-- 在自定义组件中 -->
<button bindtap="onTap">点击这个按钮将触发“myevent”事件</button>
Component({
  properties: {},
  methods: {
    onTap: function(){
      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('myevent', myEventDetail, myEventOption)
    }
  }
})
```

触发事件的选项包括：

| 选项名	      | 类型	     | 是否必填	| 默认值 | 	描述 |
|:---|:---|:---|:---|:---|
| bubbles	      | Boolean | 	  否	|     false	   | 事件是否冒泡 |
| composed	    | Boolean | 	  否	|     false	   | 事件是否可以穿越组件边界，为false时，事件将只能在引用组件的节点树上触发，不进入其他任何组件内部 |
| capturePhase | Boolean | 	  否	|     false	   | 事件是否拥有捕获阶段 |

```xml
// 页面 page.wxml
<another-component bindcustomevent="pageEventListener1">
  <my-component bindcustomevent="pageEventListener2"></my-component>
</another-component>
// 组件 another-component.wxml
<view bindcustomevent="anotherEventListener">
  <slot />
</view>
// 组件 my-component.wxml
<view bindcustomevent="myEventListener">
  <slot />
</view>
// 组件 my-component.js
Component({
  methods: {
    onTap: function(){
      this.triggerEvent('customevent', {}) // 只会触发 pageEventListener2
      this.triggerEvent('customevent', {}, { bubbles: true }) // 会依次触发 pageEventListener2 、 pageEventListener1
      this.triggerEvent('customevent', {}, { bubbles: true, composed: true }) // 会依次触发 pageEventListener2 、 anotherEventListener 、 pageEventListener1
    }
  }
})
```

## 获取组件实例

可在父组件里调用 this.selectComponent ，获取子组件的实例对象。（插件的自定义组件将返回 null）

调用时需要传入一个匹配选择器 selector，如：this.selectComponent(".my-component")。

selector 详细语法可查看 selector 语法参考文档。

```js
// 父组件
Page({
  data: {},
  getChildComponent: function () {
    const child = this.selectComponent('.my-component');
    console.log(child)
  }
})
```

在上例中，父组件将会获取 class 为 my-component 的子组件实例对象，即子组件的 this 。

若需要自定义 selectComponent 返回的数据，可使用内置 behavior: wx://component-export

从基础库版本 2.2.3 开始提供支持。

使自定义组件中支持 export 定义段，这个定义段可以用于指定组件被 selectComponent 调用时的返回值。

代码示例：

```js
// 自定义组件 my-component 内部
Component({
  behaviors: ['wx://component-export'],
  export() {
    return { myField: 'myValue' }
  }
})
<!-- 使用自定义组件时 -->
<my-component id="the-id" />
// 父组件调用
const child = this.selectComponent('#the-id') // 等于 { myField: 'myValue' }
```

在上例中，父组件获取 id 为 the-id 的子组件实例的时候，得到的是对象 { myField: 'myValue' } 。

# 组件生命周期

组件的生命周期，指的是组件自身的一些函数，这些函数在特殊的时间点或遇到一些特殊的框架事件时被自动触发。

其中，最重要的生命周期是 created attached detached ，包含一个组件实例生命流程的最主要时间点。

组件实例刚刚被创建好时， created 生命周期被触发。

此时，组件数据 this.data 就是在 Component 构造器中定义的数据 data。 

此时还不能调用 setData 。 

通常情况下，这个生命周期只应该用于给组件 this 添加一些自定义属性字段。

在组件完全初始化完毕、进入页面节点树后， attached 生命周期被触发。

此时， this.data 已被初始化为组件的当前值。这个生命周期很有用，绝大多数初始化工作可以在这个时机进行。

在组件离开页面节点树后， detached 生命周期被触发。退出一个页面时，如果组件还在页面节点树中，则 detached 会被触发。


## 定义生命周期方法

生命周期方法可以直接定义在 Component 构造器的第一级参数中。

自小程序基础库版本 2.2.3 起，组件的的生命周期也可以在 lifetimes 字段内进行声明（这是推荐的方式，其优先级最高）。

```js
Component({
  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  // 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
  attached: function() {
    // 在组件实例进入页面节点树时执行
  },
  detached: function() {
    // 在组件实例被从页面节点树移除时执行
  },
  // ...
})
```

在 behaviors 中也可以编写生命周期方法，同时不会与其他 behaviors 中的同名生命周期相互覆盖。

但要注意，如果一个组件多次直接或间接引用同一个 behavior ，这个 behavior 中的生命周期函数在一个执行时机内只会执行一次。

可用的全部生命周期如下表所示。

| 生命周期	| 参数  | 	描述	| 最低版本 |
|:---|:---|:---|:---|
| created	  | 无	  | 在组件实例刚刚被创建时执行	            | 1.6.3 |
| attached	| 无	  | 在组件实例进入页面节点树时执行	        |   1.6.3 |
| ready	    | 无	  | 在组件在视图层布局完成后执行	          |   1.6.3 |
| moved	    | 无	  | 在组件实例被移动到节点树另一个位置时执行| 	1.6.3 |
| detached	| 无	  | 在组件实例被从页面节点树移除时执行	    |   1.6.3 |
| error	    | Object Error	| 每当组件方法抛出错误时执行      | 	2.4.1 |

## 组件所在页面的生命周期

还有一些特殊的生命周期，它们并非与组件有很强的关联，但有时组件需要获知，以便组件内部处理。

这样的生命周期称为“组件所在页面的生命周期”，在 pageLifetimes 定义段中定义。

其中可用的生命周期包括：

| 生命周期	| 参数  | 	描述	| 最低版本 |
|:---|:---|:---|:---|
| show	  | 无	        | 组件所在的页面被展示时执行 |	2.2.3 |
| hide	  | 无	        | 组件所在的页面被隐藏时执行 |	2.2.3 |
| resize	| Object Size	| 组件所在的页面尺寸变化时执行 |	2.4.0 |

```js
Component({
  pageLifetimes: {
    show: function() {
      // 页面被展示
    },
    hide: function() {
      // 页面被隐藏
    },
    resize: function(size) {
      // 页面尺寸变化
    }
  }
})
```

# 参考资料

https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/

* any list
{:toc}
