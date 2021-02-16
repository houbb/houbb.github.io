---
layout: post
title:  13-微信小程序自定义组件
date:  2021-2-14 16:52:15 +0800
categories: [Dev]
tags: [dev, windows, sh]
published: true
---

# 自定义组件

从小程序基础库版本 1.6.3 开始，小程序支持简洁的组件化编程。所有自定义组件相关特性都需要基础库版本 1.6.3 或更高。

开发者可以将页面内的功能模块抽象成自定义组件，以便在不同的页面中重复使用；也可以将复杂的页面拆分成多个低耦合的模块，有助于代码维护。自定义组件在使用时与基础组件非常相似。

# 创建自定义组件

类似于页面，一个自定义组件由 json wxml wxss js 4个文件组成。

要编写一个自定义组件，首先需要在 json 文件中进行自定义组件声明（将 component 字段设为 true 可将这一组文件设为自定义组件）：

```json
{
  "component": true
}
```

同时，还要在 wxml 文件中编写组件模板，在 wxss 文件中加入组件样式，它们的写法与页面的写法类似。

具体细节和注意事项参见 [组件模板和样式](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html) 。

## 代码示例：

```xml
<!-- 这是自定义组件的内部WXML结构 -->
<view class="inner">
  {{innerText}}
</view>
<slot></slot>
/* 这里的样式只应用于这个自定义组件 */
.inner {
  color: red;
}
```

注意：在组件wxss中不应使用ID选择器、属性选择器和标签名选择器。

在自定义组件的 js 文件中，需要使用 Component() 来注册组件，并提供组件的属性定义、内部数据和自定义方法。

组件的属性值和内部数据将被用于组件 wxml 的渲染，其中，属性值是可由组件外部传入的。

更多细节参见 [Component构造器](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html) 。

# 使用自定义组件

使用已注册的自定义组件前，首先要在页面的 json 文件中进行引用声明。

此时需要提供每个自定义组件的标签名和对应的自定义组件文件路径：

```json
{
  "usingComponents": {
    "component-tag-name": "path/to/the/custom/component"
  }
}
```

这样，在页面的 wxml 中就可以像使用基础组件一样使用自定义组件。

节点名即自定义组件的标签名，节点属性即传递给组件的属性值。

开发者工具 1.02.1810190 及以上版本支持在 app.json 中声明 usingComponents 字段，在此处声明的自定义组件视为全局自定义组件，在小程序内的页面或自定义组件中可以直接使用而无需再声明。

- 代码示例：

```xml
<view>
  <!-- 以下是对一个自定义组件的引用 -->
  <component-tag-name inner-text="Some text"></component-tag-name>
</view>
```

自定义组件的 wxml 节点结构在与数据结合之后，将被插入到引用位置内。

## 细节注意事项

一些需要注意的细节：

- 因为 WXML 节点标签名只能是小写字母、中划线和下划线的组合，所以自定义组件的标签名也只能包含这些字符。

- 自定义组件也是可以引用自定义组件的，引用方法类似于页面引用自定义组件的方式（使用 usingComponents 字段）。

- 自定义组件和页面所在项目根目录名不能以“wx-”为前缀，否则会报错。

注意，是否在页面文件中使用 usingComponents 会使得页面的 this 对象的原型稍有差异，包括：

- 使用 usingComponents 页面的原型与不使用时不一致，即 Object.getPrototypeOf(this) 结果不同。

- 使用 usingComponents 时会多一些方法，如 selectComponent 。

- 出于性能考虑，使用 usingComponents 时， setData 内容不会被直接深复制，即 this.setData({ field: obj }) 后 this.data.field === obj 。（深复制会在这个值被组件间传递时发生。）

如果页面比较复杂，新增或删除 usingComponents 定义段时建议重新测试一下。

# 组件模板和样式

类似于页面，自定义组件拥有自己的 wxml 模板和 wxss 样式。

## 组件模板

组件模板的写法与页面模板相同。

组件模板与组件数据结合后生成的节点树，将被插入到组件的引用位置上。

在组件模板中可以提供一个 `<slot>` 节点，用于承载组件引用时提供的子节点。

- 代码示例：

```xml
<!-- 组件模板 -->
<view class="wrapper">
  <view>这里是组件的内部节点</view>
  <slot></slot>
</view>

<!-- 引用组件的页面模板 -->
<view>
  <component-tag-name>
    <!-- 这部分内容将被放置在组件 <slot> 的位置上 -->
    <view>这里是插入到组件slot中的内容</view>
  </component-tag-name>
</view>
```

注意，在模板中引用到的自定义组件及其对应的节点名需要在 json 文件中显式定义，否则会被当作一个无意义的节点。除此以外，节点名也可以被声明为抽象节点。

## 模板数据绑定

与普通的 WXML 模板类似，可以使用数据绑定，这样就可以向子组件的属性传递动态数据。

- 代码示例：

```xml
<!-- 引用组件的页面模板 -->
<view>
  <component-tag-name prop-a="{{dataFieldA}}" prop-b="{{dataFieldB}}">
    <!-- 这部分内容将被放置在组件 <slot> 的位置上 -->
    <view>这里是插入到组件slot中的内容</view>
  </component-tag-name>
</view>
```

在以上例子中，组件的属性 propA 和 propB 将收到页面传递的数据。页面可以通过 setData 来改变绑定的数据字段。

注意：这样的数据绑定只能传递 JSON 兼容数据。自基础库版本 2.0.9 开始，还可以在数据中包含函数（但这些函数不能在 WXML 中直接调用，只能传递给子组件）

## 组件 wxml 的 slot

在组件的 wxml 中可以包含 slot 节点，用于承载组件使用者提供的 wxml 结构。

默认情况下，一个组件的 wxml 中只能有一个 slot 。需要使用多 slot 时，可以在组件 js 中声明启用。

```js
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: { /* ... */ },
  methods: { /* ... */ }
})
```

此时，可以在这个组件的 wxml 中使用多个 slot ，以不同的 name 来区分。

```xml
<!-- 组件模板 -->
<view class="wrapper">
  <slot name="before"></slot>
  <view>这里是组件的内部细节</view>
  <slot name="after"></slot>
</view>
```

使用时，用 slot 属性来将节点插入到不同的 slot 上。

```xml
<!-- 引用组件的页面模板 -->
<view>
  <component-tag-name>
    <!-- 这部分内容将被放置在组件 <slot name="before"> 的位置上 -->
    <view slot="before">这里是插入到组件slot name="before"中的内容</view>
    <!-- 这部分内容将被放置在组件 <slot name="after"> 的位置上 -->
    <view slot="after">这里是插入到组件slot name="after"中的内容</view>
  </component-tag-name>
</view>
```

## 组件样式

组件对应 wxss 文件的样式，只对组件wxml内的节点生效。

编写组件样式时，需要注意以下几点：

- 组件和引用组件的页面不能使用id选择器（#a）、属性选择器（[a]）和标签名选择器，请改用class选择器。

- 组件和引用组件的页面中使用后代选择器（.a .b）在一些极端情况下会有非预期的表现，如遇，请避免使用。

- 子元素选择器（.a>.b）只能用于 view 组件与其子节点之间，用于其他组件可能导致非预期的情况。

- 继承样式，如 font 、 color ，会从组件外继承到组件内。

- 除继承样式外， app.wxss 中的样式、组件所在页面的的样式对自定义组件无效（除非更改组件样式隔离选项）。


```
#a { } /* 在组件中不能使用 */
[a] { } /* 在组件中不能使用 */
button { } /* 在组件中不能使用 */
.a > .b { } /* 除非 .a 是 view 组件节点，否则不一定会生效 */
```

除此以外，组件可以指定它所在节点的默认样式，使用 `:host` 选择器（需要包含基础库 1.7.2 或更高版本的开发者工具支持）。

```xml
/* 组件 custom-component.wxss */
:host {
  color: yellow;
}
<!-- 页面的 WXML -->
<custom-component>这段文本是黄色的</custom-component>
```

## 组件样式隔离

默认情况下，自定义组件的样式只受到自定义组件 wxss 的影响。

除非以下两种情况：

1. app.wxss 或页面的 wxss 中使用了标签名选择器（或一些其他特殊选择器）来直接指定样式，这些选择器会影响到页面和全部组件。通常情况下这是不推荐的做法。

2. 指定特殊的样式隔离选项 styleIsolation 。

```js
Component({
  options: {
    styleIsolation: 'isolated'
  }
})
```

styleIsolation 选项从基础库版本 2.6.5 开始支持。

它支持以下取值：

isolated 表示启用样式隔离，在自定义组件内外，使用 class 指定的样式将不会相互影响（一般情况下的默认值）；

apply-shared 表示页面 wxss 样式将影响到自定义组件，但自定义组件 wxss 中指定的样式不会影响页面；

shared 表示页面 wxss 样式将影响到自定义组件，自定义组件 wxss 中指定的样式也会影响页面和其他设置了 apply-shared 或 shared 的自定义组件。（这个选项在插件中不可用。）
使用后两者时，请务必注意组件间样式的相互影响。

如果这个 Component 构造器用于构造页面 ，则默认值为 shared ，且还有以下几个额外的样式隔离选项可用：

page-isolated 表示在这个页面禁用 app.wxss ，同时，页面的 wxss 不会影响到其他自定义组件；

page-apply-shared 表示在这个页面禁用 app.wxss ，同时，页面 wxss 样式不会影响到其他自定义组件，但设为 shared 的自定义组件会影响到页面；

page-shared 表示在这个页面禁用 app.wxss ，同时，页面 wxss 样式会影响到其他设为 apply-shared 或 shared 的自定义组件，也会受到设为 shared 的自定义组件的影响。

从小程序基础库版本 2.10.1 开始，也可以在页面或自定义组件的 json 文件中配置 styleIsolation （这样就不需在 js 文件的 options 中再配置）。

例如：

```js
{
  "styleIsolation": "isolated"
}
```

此外，小程序基础库版本 2.2.3 以上支持 addGlobalClass 选项，即在 Component 的 options 中设置 addGlobalClass: true 。 这个选项等价于设置 styleIsolation: apply-shared ，但设置了 styleIsolation 选项后这个选项会失效。

代码示例：

```js
/* 组件 custom-component.js */
Component({
  options: {
    addGlobalClass: true,
  }
})
<!-- 组件 custom-component.wxml -->
<text class="red-text">这段文本的颜色由 `app.wxss` 和页面 `wxss` 中的样式定义来决定</text>
/* app.wxss */
.red-text {
  color: red;
}
```

## 外部样式类

基础库 1.9.90 开始支持，低版本需做兼容处理。

有时，组件希望接受外部传入的样式类。此时可以在 Component 中用 externalClasses 定义段定义若干个外部样式类。

这个特性可以用于实现类似于 view 组件的 hover-class 属性：页面可以提供一个样式类，赋予 view 的 hover-class ，这个样式类本身写在页面中而非 view 组件的实现中。

注意：在同一个节点上使用普通样式类和外部样式类时，两个类的优先级是未定义的，因此最好避免这种情况。

代码示例：

```js
/* 组件 custom-component.js */
Component({
  externalClasses: ['my-class']
})
<!-- 组件 custom-component.wxml -->
<custom-component class="my-class">这段文本的颜色由组件外的 class 决定</custom-component>
```

这样，组件的使用者可以指定这个样式类对应的 class ，就像使用普通属性一样。在 2.7.1 之后，可以指定多个对应的 class 。

- 代码示例：

```xml
<!-- 页面的 WXML -->
<custom-component my-class="red-text" />
<custom-component my-class="large-text" />
<!-- 以下写法需要基础库版本 2.7.1 以上 -->
<custom-component my-class="red-text large-text" />
.red-text {
  color: red;
}
.large-text {
  font-size: 1.5em;
}
```

## 引用页面或父组件的样式

基础库 2.9.2 开始支持，低版本需做兼容处理。

即使启用了样式隔离 isolated ，组件仍然可以在局部引用组件所在页面的样式或父组件的样式。

例如，如果在页面 wxss 中定义了：

```css
.blue-text {
  color: blue;
}
```

在这个组件中可以使用 `~` 来引用这个类的样式：

```xml
<view class="~blue-text"> 这段文本是蓝色的 </view>
```

如果在一个组件的父组件 wxss 中定义了：

```css
.red-text {
  color: red;
}
```

在这个组件中可以使用 `^` 来引用这个类的样式：

```xml
<view class="^red-text"> 这段文本是红色的 </view>
```

也可以连续使用多个 ^ 来引用祖先组件中的样式。

注意：如果组件是比较独立、通用的组件，请优先使用外部样式类的方式，而非直接引用父组件或页面的样式。

## 虚拟化组件节点

基础库 2.11.2 开始支持，低版本需做兼容处理。

默认情况下，自定义组件本身的那个节点是一个“普通”的节点，使用时可以在这个节点上设置 class style 、动画、 flex 布局等，就如同普通的 view 组件节点一样。

```xml
<!-- 页面的 WXML -->
<view style="display: flex">
  <!-- 默认情况下，这是一个普通的节点 -->
  <custom-component style="color: blue; flex: 1">蓝色、满宽的</custom-component>
</view>
```

但有些时候，自定义组件并不希望这个节点本身可以设置样式、响应 flex 布局等，而是希望自定义组件内部的第一层节点能够响应 flex 布局或者样式由自定义组件本身完全决定。

这种情况下，可以将这个自定义组件设置为“虚拟的”：

```js
Component({
  options: {
    virtualHost: true
  },
  properties: {
    style: { // 定义 style 属性可以拿到 style 属性上设置的值
      type: String,
    }
  },
  externalClasses: ['class'], // 可以将 class 设为 externalClasses
})
```

这样，可以将 flex 放入自定义组件内：

```xml
<!-- 页面的 WXML -->
<view style="display: flex">
  <!-- 如果设置了 virtualHost ，节点上的样式将失效 -->
  <custom-component style="color: blue">不是蓝色的</custom-component>
</view>
<!-- custom-component.wxml -->
<view style="flex: 1">
  满宽的
  <slot></slot>
</view>
```

需要注意的是，自定义组件节点上的 class style 和动画将不再生效，但仍可以：

1. 将 style 定义成 properties 属性来获取 style 上设置的值；

2. 将 class 定义成 externalClasses 外部样式类使得自定义组件 wxml 可以使用 class 值。




# 参考资料

https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/

* any list
{:toc}
