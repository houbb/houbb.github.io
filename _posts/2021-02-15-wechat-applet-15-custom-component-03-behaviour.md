---
layout: post
title:  14-微信小程序 Component behaviors
date:  2021-2-14 16:52:15 +0800
categories: [Dev]
tags: [dev, windows, sh]
published: true
---

# behaviors

behaviors 是用于组件间代码共享的特性，类似于一些编程语言中的 “mixins” 或 “traits”。

每个 behavior 可以包含一组属性、数据、生命周期函数和方法。

组件引用它时，它的属性、数据和方法会被合并到组件中，生命周期函数也会在对应时机被调用。 

每个组件可以引用多个 behavior ，behavior 也可以引用其它 behavior 。

详细的参数含义和使用请参考 [Behavior 参考文档](https://developers.weixin.qq.com/miniprogram/dev/reference/api/Behavior.html)。

## 组件中使用

组件引用时，在 behaviors 定义段中将它们逐个列出即可。

代码示例：

```js
// my-component.js
var myBehavior = require('my-behavior')
Component({
  behaviors: [myBehavior],
  properties: {
    myProperty: {
      type: String
    }
  },
  data: {
    myData: 'my-component-data'
  },
  created: function () {
    console.log('[my-component] created')
  },
  attached: function () { 
    console.log('[my-component] attached')
  },
  ready: function () {
    console.log('[my-component] ready')
  },
  methods: {
    myMethod: function () {
      console.log('[my-component] log by myMethod')
    },
  }
})
```

在上例中， my-component 组件定义中加入了 my-behavior，

而 my-behavior 结构为：

属性：myBehaviorProperty
数据字段：myBehaviorData
方法：myBehaviorMethod
生命周期函数：attached、created、ready

这将使 my-component 最终结构为：

属性：myBehaviorProperty、myProperty
数据字段：myBehaviorData、myData
方法：myBehaviorMethod、myMethod
生命周期函数：attached、created、ready

当组件触发生命周期时，上例生命周期函数执行顺序为：

```
[my-behavior] created
[my-component] created
[my-behavior] attached
[my-component] attached
[my-behavior] ready
[my-component] ready
```

# 同名字段的覆盖和组合规则

组件和它引用的 behavior 中可以包含同名的字段，对这些字段的处理方法如下：

（1）如果有同名的属性 (properties) 或方法 (methods)：

若组件本身有这个属性或方法，则组件的属性或方法会覆盖 behavior 中的同名属性或方法；

若组件本身无这个属性或方法，则在组件的 behaviors 字段中定义靠后的 behavior 的属性或方法会覆盖靠前的同名属性或方法；

在 2 的基础上，若存在嵌套引用 behavior 的情况，则规则为：父 behavior 覆盖 子 behavior 中的同名属性或方法。

（2）如果有同名的数据字段 (data)：

若同名的数据字段都是对象类型，会进行对象合并；

其余情况会进行数据覆盖，覆盖规则为：组件 > 父 behavior > 子 behavior 、 靠后的 behavior > 靠前的 behavior。（优先级高的覆盖优先级低的，最大的为优先级最高）

（3）生命周期函数不会相互覆盖，而是在对应触发时机被逐个调用：

对于不同的生命周期函数之间，遵循组件生命周期函数的执行顺序；

对于同种生命周期函数，遵循如下规则：

behavior 优先于组件执行；

子 behavior 优先于 父 behavior 执行；

靠前的 behavior 优先于 靠后的 behavior 执行；

如果同一个 behavior 被一个组件多次引用，它定义的生命周期函数只会被执行一次。

# 内置 behaviors

自定义组件可以通过引用内置的 behavior 来获得内置组件的一些行为。

```js
Component({
  behaviors: ['wx://form-field']
})
```

在上例中， wx://form-field 代表一个内置 behavior ，它使得这个自定义组件有类似于表单控件的行为。

内置 behavior 往往会为组件添加一些属性。在没有特殊说明时，组件可以覆盖这些属性来改变它的 type 或添加 observer 。

### wx://form-field

使自定义组件有类似于表单控件的行为。 

form 组件可以识别这些自定义组件，并在 submit 事件中返回组件的字段名及其对应字段值。

详细用法以及代码示例可见：form 组件参考文档

### wx://form-field-group

从基础库版本 2.10.2 开始提供支持。

使 form 组件可以识别到这个自定义组件内部的所有表单控件。

详细用法以及代码示例可见：form 组件参考文档

### wx://form-field-button

从基础库版本 2.10.3 开始提供支持。

使 form 组件可以识别到这个自定义组件内部的 button。

如果自定义组件内部有设置了 form-type 的 button ，它将被组件外的 form 接受。

详细用法以及代码示例可见：form 组件参考文档

### wx://component-export

从基础库版本 2.2.3 开始提供支持。

使自定义组件支持 export 定义段。

这个定义段可以用于指定组件被 selectComponent 调用时的返回值。

详细用法以及代码示例可见：selectComponent 参考文档

# 组件间关系

## 定义和使用组件间关系

有时需要实现这样的组件：

```xml
<custom-ul>
  <custom-li> item 1 </custom-li>
  <custom-li> item 2 </custom-li>
</custom-ul>
```

这个例子中， custom-ul 和 custom-li 都是自定义组件，它们有相互间的关系，相互间的通信往往比较复杂。

此时在组件定义时加入 relations 定义段，可以解决这样的问题。

示例：

```js
// path/to/custom-ul.js
Component({
  relations: {
    './custom-li': {
      type: 'child', // 关联的目标节点应为子节点
      linked: function(target) {
        // 每次有custom-li被插入时执行，target是该节点实例对象，触发在该节点attached生命周期之后
      },
      linkChanged: function(target) {
        // 每次有custom-li被移动后执行，target是该节点实例对象，触发在该节点moved生命周期之后
      },
      unlinked: function(target) {
        // 每次有custom-li被移除时执行，target是该节点实例对象，触发在该节点detached生命周期之后
      }
    }
  },
  methods: {
    _getAllLi: function(){
      // 使用getRelationNodes可以获得nodes数组，包含所有已关联的custom-li，且是有序的
      var nodes = this.getRelationNodes('path/to/custom-li')
    }
  },
  ready: function(){
    this._getAllLi()
  }
})
// path/to/custom-li.js
Component({
  relations: {
    './custom-ul': {
      type: 'parent', // 关联的目标节点应为父节点
      linked: function(target) {
        // 每次被插入到custom-ul时执行，target是custom-ul节点实例对象，触发在attached生命周期之后
      },
      linkChanged: function(target) {
        // 每次被移动后执行，target是custom-ul节点实例对象，触发在moved生命周期之后
      },
      unlinked: function(target) {
        // 每次被移除时执行，target是custom-ul节点实例对象，触发在detached生命周期之后
      }
    }
  }
})
```

注意：必须在两个组件定义中都加入relations定义，否则不会生效。

## 关联一类组件

有时，需要关联的是一类组件，如：

```xml
<custom-form>
  <view>
    input
    <custom-input></custom-input>
  </view>
  <custom-submit> submit </custom-submit>
</custom-form>
```

custom-form 组件想要关联 custom-input 和 custom-submit 两个组件。

此时，如果这两个组件都有同一个behavior：

```js
// path/to/custom-form-controls.js
module.exports = Behavior({
  // ...
})
// path/to/custom-input.js
var customFormControls = require('./custom-form-controls')
Component({
  behaviors: [customFormControls],
  relations: {
    './custom-form': {
      type: 'ancestor', // 关联的目标节点应为祖先节点
    }
  }
})
// path/to/custom-submit.js
var customFormControls = require('./custom-form-controls')
Component({
  behaviors: [customFormControls],
  relations: {
    './custom-form': {
      type: 'ancestor', // 关联的目标节点应为祖先节点
    }
  }
})
```

则在 relations 关系定义中，可使用这个behavior来代替组件路径作为关联的目标节点：

```js
// path/to/custom-form.js
var customFormControls = require('./custom-form-controls')
Component({
  relations: {
    'customFormControls': {
      type: 'descendant', // 关联的目标节点应为子孙节点
      target: customFormControls
    }
  }
})
```

## relations 定义段

relations 定义段包含目标组件路径及其对应选项，可包含的选项见下表。

| 选项	       | 类型	   | 是否必填	 | 描述 | 
|:---|:---|:---|:---|
| type	       | String	  | 是	    | 目标组件的相对关系，可选的值为 parent 、 child 、 ancestor 、 descendant | 
| linked	     | Function	| 否	    | 关系生命周期函数，当关系被建立在页面节点树中时触发，触发时机在组件attached生命周期之后 | 
| linkChanged	 | Function	| 否	    | 关系生命周期函数，当关系在页面节点树中发生改变时触发，触发时机在组件moved生命周期之后 | 
| unlinked	   | Function	| 否	    | 关系生命周期函数，当关系脱离页面节点树时触发，触发时机在组件detached生命周期之后 | 
| target	     | String	  | 否	    | 如果这一项被设置，则它表示关联的目标节点所应具有的behavior，所有拥有这一behavior的组件节点都会被关联 | 

# 参考资料

https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/behaviors.html

* any list
{:toc}
