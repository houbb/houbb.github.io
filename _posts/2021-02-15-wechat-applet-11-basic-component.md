---
layout: post
title:  11-微信小程序基本组件
date:  2021-2-14 16:52:15 +0800
categories: [Dev]
tags: [dev, windows, sh]
published: true
---

# 基础组件

框架为开发者提供了一系列基础组件，开发者可以通过组合这些基础组件进行快速开发。

详细介绍请参考[组件文档](https://developers.weixin.qq.com/miniprogram/dev/component/)。

## 什么是组件：

- 组件是视图层的基本组成单元。

- 组件自带一些功能与微信风格一致的样式。

- 一个组件通常包括 开始标签 和 结束标签，属性 用来修饰这个组件，内容 在两个标签之内。

```xml
<tagname property="value">
Content goes here ...
</tagname>
```

注意：所有组件与属性都是小写，以连字符 `-` 连接

## 属性类型

| 类型	| 描述	| 注解 | 
|:---|:---|:---|
| Boolean	      布尔值 | 组件写上该属性，不管是什么值都被当作 true；只有组件上没有该属性时，属性值才为false。 如果属性值为变量，变量的值会被转换为Boolean类型 | 
| Number	      数字	 | 1, 2.5 | 
| String	      字符串 | "string" | 
| Array	        数组	 | [ 1, "string" ] | 
| Object	      对象	 | { key: value } | 
| EventHandler	事件处理函数名	| "handlerName" 是 Page 中定义的事件处理函数名 | 
| Any	          任意属性 |	 | 

## 公共属性

所有组件都有以下属性：

| 属性名	| 类型	| 描述	| 注解 |
|:---|:---|:---|:---|
| id	  | String	| 组件的唯一标示	| 保持整个页面唯一 |
| class	| String	| 组件的样式类	  | 在对应的 WXSS 中定义的样式类 |
| style	| String	| 组件的内联样式	| 可以动态设置的内联样式 |
| hidden	        | Boolean	      | 组件是否显示	| 所有组件默认显示 |
| `data-*`	      | Any	          | 自定义属性	  | 组件上触发的事件时，会发送给事件处理函数 |
| `bind*/catch*`	| EventHandler	| 组件的事件	  | 详见[事件](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html) |

## 特殊属性

几乎所有组件都有各自定义的属性，可以对该组件的功能或样式进行修饰，请参考各个 [组件](https://developers.weixin.qq.com/miniprogram/dev/component/) 的定义。

# 获取界面上的节点信息

## WXML节点信息

[节点信息查询 API](https://developers.weixin.qq.com/miniprogram/dev/api/wxml/wx.createSelectorQuery.html) 可以用于获取节点属性、样式、在界面上的位置等信息。

最常见的用法是使用这个接口来查询某个节点的当前位置，以及界面的滚动位置。

示例代码：

```js
const query = wx.createSelectorQuery()
query.select('#the-id').boundingClientRect(function(res){
  res.top // #the-id 节点的上边界坐标（相对于显示区域）
})
query.selectViewport().scrollOffset(function(res){
  res.scrollTop // 显示区域的竖直滚动位置
})
query.exec()
```

上述示例中， #the-id 是一个节点选择器，与 CSS 的选择器相近但略有区别，请参见 SelectorQuery.select 的相关说明。

在自定义组件或包含自定义组件的页面中，推荐使用 this.createSelectorQuery 来代替 wx.createSelectorQuery ，这样可以确保在正确的范围内选择节点。

## WXML节点布局相交状态

[节点布局相交状态 API](https://developers.weixin.qq.com/miniprogram/dev/api/wxml/wx.createIntersectionObserver.html) 可用于监听两个或多个组件节点在布局位置上的相交状态。

这一组API常常可以用于推断某些节点是否可以被用户看见、有多大比例可以被用户看见。

这一组API涉及的主要概念如下。

- 参照节点：监听的参照节点，取它的布局区域作为参照区域。如果有多个参照节点，则会取它们布局区域的 交集 作为参照区域。页面显示区域也可作为参照区域之一。

- 目标节点：监听的目标，默认只能是一个节点（使用 selectAll 选项时，可以同时监听多个节点）。

- 相交区域：目标节点的布局区域与参照区域的相交区域。

- 相交比例：相交区域占参照区域的比例。

- 阈值：相交比例如果达到阈值，则会触发监听器的回调函数。阈值可以有多个。

以下示例代码可以在目标节点（用选择器 .target-class 指定）每次进入或离开页面显示区域时，触发回调函数。

```js
Page({
  onLoad: function(){
    wx.createIntersectionObserver().relativeToViewport().observe('.target-class', (res) => {
      res.id // 目标节点 id
      res.dataset // 目标节点 dataset
      res.intersectionRatio // 相交区域占目标节点的布局区域的比例
      res.intersectionRect // 相交区域
      res.intersectionRect.left // 相交区域的左边界坐标
      res.intersectionRect.top // 相交区域的上边界坐标
      res.intersectionRect.width // 相交区域的宽度
      res.intersectionRect.height // 相交区域的高度
    })
  }
})
```

以下示例代码可以在目标节点（用选择器 .target-class 指定）与参照节点（用选择器 .relative-class 指定）在页面显示区域内相交或相离，且相交或相离程度达到目标节点布局区域的20%和50%时，触发回调函数。

- 示例代码：

```js
Page({
  onLoad: function(){
    wx.createIntersectionObserver(this, {
      thresholds: [0.2, 0.5]
    }).relativeTo('.relative-class').relativeToViewport().observe('.target-class', (res) => {
      res.intersectionRatio // 相交区域占目标节点的布局区域的比例
      res.intersectionRect // 相交区域
      res.intersectionRect.left // 相交区域的左边界坐标
      res.intersectionRect.top // 相交区域的上边界坐标
      res.intersectionRect.width // 相交区域的宽度
      res.intersectionRect.height // 相交区域的高度
    })
  }
})
```

注意：与页面显示区域的相交区域并不准确代表用户可见的区域，因为参与计算的区域是“布局区域”，布局区域可能会在绘制时被其他节点裁剪隐藏（如遇祖先节点中 overflow 样式为 hidden 的节点）或遮盖（如遇 fixed 定位的节点）。

在自定义组件或包含自定义组件的页面中，推荐使用 this.createIntersectionObserver 来代替 wx.createIntersectionObserver ，这样可以确保在正确的范围内选择节点。

# 响应显示区域变化

## 显示区域尺寸

显示区域指小程序界面中可以自由布局展示的区域。

在默认情况下，小程序显示区域的尺寸自页面初始化起就不会发生变化。

但以下两种方式都可以改变这一默认行为。

## 在手机上启用屏幕旋转支持

从小程序基础库版本 2.4.0 开始，小程序在手机上支持屏幕旋转。使小程序中的页面支持屏幕旋转的方法是：在 app.json 的 window 段中设置 "pageOrientation": "auto" ，或在页面 json 文件中配置 "pageOrientation": "auto" 。

以下是在单个页面 json 文件中启用屏幕旋转的示例。

```json
{
  "pageOrientation": "auto"
}
```

如果页面添加了上述声明，则在屏幕旋转时，这个页面将随之旋转，显示区域尺寸也会随着屏幕旋转而变化。

从小程序基础库版本 2.5.0 开始， pageOrientation 还可以被设置为 landscape ，表示固定为横屏显示。

## 在 iPad 上启用屏幕旋转支持

从小程序基础库版本 2.3.0 开始，在 iPad 上运行的小程序可以支持屏幕旋转。使小程序支持 iPad 屏幕旋转的方法是：在 app.json 中添加 "resizable": true 。

代码示例：

```json
{
  "resizable": true
}
```

如果小程序添加了上述声明，则在屏幕旋转时，小程序将随之旋转，显示区域尺寸也会随着屏幕旋转而变化。

注意：在 iPad 上不能单独配置某个页面是否支持屏幕旋转。

## Media Query

有时，对于不同尺寸的显示区域，页面的布局会有所差异。此时可以使用 media query 来解决大多数问题。

代码示例：

```css
.my-class {
  width: 40px;
}

@media (min-width: 480px) {
  /* 仅在 480px 或更宽的屏幕上生效的样式规则 */
  .my-class {
    width: 200px;
  }
}
```

在 WXML 中，可以使用 match-media 组件来根据 media query 匹配状态展示、隐藏节点。

此外，可以在页面或者自定义组件 JS 中使用 this.createMediaQueryObserver() 方法来创建一个 MediaQueryObserver 对象，用于监听指定的 media query 的匹配状态。

## 屏幕旋转事件

有时，仅仅使用 media query 无法控制一些精细的布局变化。此时可以使用 js 作为辅助。

在 js 中读取页面的显示区域尺寸，可以使用 selectorQuery.selectViewport 。

页面尺寸发生改变的事件，可以使用页面的 onResize 来监听。对于自定义组件，可以使用 resize 生命周期来监听。回调函数中将返回显示区域的尺寸信息。（从基础库版本 2.4.0 开始支持。）

- 代码示例：

```js
Page({
  onResize(res) {
    res.size.windowWidth // 新的显示区域宽度
    res.size.windowHeight // 新的显示区域高度
  }
})
Component({
  pageLifetimes: {
    resize(res) {
      res.size.windowWidth // 新的显示区域宽度
      res.size.windowHeight // 新的显示区域高度
    }
  }
})
```

此外，还可以使用 wx.onWindowResize 来监听（但这不是推荐的方式）。

## Bug & tips:

Bug： Android 微信版本 6.7.3 中， live-pusher 组件在屏幕旋转时方向异常。

# 动画

33界面动画的常见方式

在小程序中，通常可以使用 CSS 渐变 和 CSS 动画 来创建简易的界面动画。

动画过程中，可以使用 bindtransitionend bindanimationstart bindanimationiteration bindanimationend 来监听动画事件。

| 事件名              |  	含义 | 
|:---|:---|
| transitionend	      |  CSS 渐变结束或 wx.createAnimation 结束一个阶段 | 
| animationstart	    |  CSS 动画开始 | 
| animationiteration | 	CSS 动画结束一个阶段 | 
| animationend	      |  CSS 动画结束 | 

注意：这几个事件都不是冒泡事件，需要绑定在真正发生了动画的节点上才会生效。

同时，还可以使用 wx.createAnimation 接口来动态创建简易的动画效果。（新版小程序基础库中推荐使用下述的关键帧动画接口代替。）

## 关键帧动画

基础库 2.9.0 开始支持，低版本需做兼容处理。

从小程序基础库 2.9.0 开始支持一种更友好的动画创建方式，用于代替旧的 wx.createAnimation 。

它具有更好的性能和更可控的接口。

在页面或自定义组件中，当需要进行关键帧动画时，可以使用 this.animate 接口：

```js
this.animate(selector, keyframes, duration, callback)
```

### 参数说明

| 属性	    | 类型	    | 必填   | 	说明 |
|:---|:---|:---|:---|
| selector	| String	 | 是	   | 选择器（同 SelectorQuery.select 的选择器格式） |
| keyframes	| Array		  | 是	   | 关键帧信息 |
| duration	| Number	 | 是	   | 动画持续时长（毫秒为单位） |
| callback	| function | 否	   | 动画完成后的回调函数 |


## 滚动驱动的动画

我们发现，根据滚动位置而不断改变动画的进度是一种比较常见的场景，这类动画可以让人感觉到界面交互很连贯自然，体验更好。

因此，从小程序基础库 2.9.0 开始支持一种由滚动驱动的动画机制。

基于上述的关键帧动画接口，新增一个 ScrollTimeline 的参数，用来绑定滚动元素（目前只支持 scroll-view）。

接口定义如下：

```js
this.animate(selector, keyframes, duration, ScrollTimeline)
```

## 高级的动画方式

在一些复杂场景下，上述的动画方法可能并不适用。

WXS 响应事件 的方式可以通过使用 WXS 来响应事件的方法来动态调整节点的 style 属性。

通过不断改变 style 属性的值可以做到动画效果。

同时，这种方式也可以根据用户的触摸事件来动态地生成动画。

连续使用 setData 来改变界面的方法也可以达到动画的效果。

这样可以任意地改变界面，但通常会产生较大的延迟或卡顿，甚至导致小程序僵死。此时可以通过将页面的 setData 改为 自定义组件 中的 setData 来提升性能。

# 初始渲染缓存

基础库 2.11.1 开始支持，低版本需做兼容处理。

## 初始渲染缓存工作原理

小程序页面的初始化分为两个部分。

1. 逻辑层初始化：载入必需的小程序代码、初始化页面 this 对象（也包括它涉及到的所有自定义组件的 this 对象）、将相关数据发送给视图层。

2. 视图层初始化：载入必需的小程序代码，然后等待逻辑层初始化完毕并接收逻辑层发送的数据，最后渲染页面。

在启动页面时，尤其是小程序冷启动、进入第一个页面时，逻辑层初始化的时间较长。在页面初始化过程中，用户将看到小程序的标准载入画面（冷启动时）或可能看到轻微的白屏现象（页面跳转过程中）。

启用初始渲染缓存，可以使视图层不需要等待逻辑层初始化完毕，而直接提前将页面初始 data 的渲染结果展示给用户，这可以使得页面对用户可见的时间大大提前。

## 工作原理

它的工作原理如下：

1. 在小程序页面第一次被打开后，将页面初始数据渲染结果记录下来，写入一个持久化的缓存区域（缓存可长时间保留，但可能因为小程序更新、基础库更新、储存空间回收等原因被清除）；

2. 在这个页面被第二次打开时，检查缓存中是否还存有这个页面上一次初始数据的渲染结果，如果有，就直接将渲染结果展示出来；

3. 如果展示了缓存中的渲染结果，这个页面暂时还不能响应用户事件，等到逻辑层初始化完毕后才能响应用户事件。

利用初始渲染缓存，可以：

- 快速展示出页面中永远不会变的部分，如导航栏；

- 预先展示一个骨架页，提升用户体验；

- 展示自定义的加载提示；

- 提前展示广告，等等。

## 支持的组件

在初始渲染缓存阶段中，复杂组件不能被展示或不能响应交互。

目前支持的内置组件：

```
<view />
<text />
<button />
<image />
<scroll-view />
<rich-text />
```

自定义组件本身可以被展示（但它们里面用到的内置组件也遵循上述限制）。

## 静态初始渲染缓存

若想启用初始渲染缓存，最简单的方法是在页面的 json 文件中添加配置项 "initialRenderingCache": "static" ：

```json
{
  "initialRenderingCache": "static"
}
```

如果想要对所有页面启用，可以在 app.json 的 window 配置段中添加这个配置：

```json
{
  "window": {
    "initialRenderingCache": "static"
  }
}
```

添加这个配置项之后，在手机中预览小程序首页，然后杀死小程序再次进入，就会通过初始渲染缓存来渲染首页。

注意：这种情况下，初始渲染缓存记录的是页面 data 应用在页面 WXML 上的结果，不包含任何 setData 的结果。

例如，如果想要在页面中展示出“正在加载”几个字，这几个字受到 loading 数据字段控制：

```xml
<view wx:if="{{loading}}">正在加载</view>
```

这种情况下， loading 应当在 data 中指定为 true ，如：

```js
// 正确的做法
Page({
  data: {
    loading: true
  }
})
```

而不能通过 setData 将 loading 置为 true ：

```js
// 错误的做法！不要这么做！
Page({
  data: {},
  onLoad: function() {
    this.setData({
      loading: true
    })
  }
})
```

换而言之，这种做法只包含页面 data 的渲染结果，即页面的纯静态成分。

## 在初始渲染缓存中添加动态内容

有些场景中，只是页面 data 的渲染结果会比较局限。有时会想要额外展示一些可变的内容，如展示的广告图片 URL 等。

这种情况下可以使用“动态”初始渲染缓存的方式。首先，配置 "initialRenderingCache": "dynamic" ：

```json
{
  "initialRenderingCache": "dynamic"
}
```

此时，初始渲染缓存不会被自动启用，还需要在页面中调用 this.setInitialRenderingCache(dynamicData) 才能启用。

其中， dynamicData 是一组数据，与 data 一起参与页面 WXML 渲染。

```js
Page({
  data: {
    loading: true
  },
  onReady: function() {
    this.setInitialRenderingCache({
      loadingHint: '正在加载' // 这一部分数据将被应用于界面上，相当于在初始 data 基础上额外进行一次 setData
    })
  }
})
<view wx:if="{{loading}}">{{loadingHint}}</view>
```

从原理上说，在动态生成初始渲染缓存的方式下，页面会在后台使用动态数据重新渲染一次，因而开销相对较大。

因而要尽量避免频繁调用 this.setInitialRenderingCache ，如果在一个页面内多次调用，仅最后一次调用生效。

### 注意：

- this.setInitialRenderingCache 调用时机不能早于 Page 的 onReady 或 Component 的 ready 生命周期，否则可能对性能有负面影响。

- 如果想禁用初始渲染缓存，调用 this.setInitialRenderingCache(null) 。

# 参考资料

https://developers.weixin.qq.com/miniprogram/dev/framework/view/two-way-bindings.html

[动画](https://developers.weixin.qq.com/miniprogram/dev/framework/view/animation.html)

* any list
{:toc}