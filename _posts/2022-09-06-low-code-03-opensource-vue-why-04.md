---
layout: post
title:  低代码开源工具-03-可视化拖拽组件库一些技术要点原理分析（四）
date:  2022-09-03 21:22:02 +0800
categories: [Tool]
tags: [low-code, sh]
published: true
---

# 说明

本文是可视化拖拽系列的第四篇，比起之前的三篇文章，这篇功能点要稍微少一点，总共有五点：

- SVG 组件

- 动态属性面板

- 数据来源（接口请求）

- 组件联动

- 组件按需加载

# SVG 组件

目前项目里提供的自定义组件都是支持自由放大缩小的，不过他们有一个共同点——都是规则形状。

也就是说对它们放大缩小，直接改变宽高就可以实现了，无需做其他处理。

但是不规则形状就不一样了，譬如一个五角星，你得考虑放大缩小时，如何成比例的改变尺寸。

最终，我采用了 svg 的方案来实现（还考虑过用 iconfont 来实现，不过有缺陷，放弃了），下面让我们来看看具体的实现细节。

## 用 SVG 画一个五角星

假设我们需要画一个 100 * 100 的五角星，它的代码是这样的：

```xml
<svg 
    version="1.1" 
    baseProfile="full" 
    xmlns="http://www.w3.org/2000/svg"
>
    <polygon 
        points="50 0,62.5 37.5,100 37.5,75 62.5,87.5 100,50 75,12.5 100,25 62.5,0 37.5,37.5 37.5" 
        stroke="#000" 
        fill="rgba(255, 255, 255, 1)" 
        stroke-width="1"
    ></polygon>
</svg>
```


svg 上的版本、命名空间之类的属性不是很重要，可以先忽略。

重点是 polygon 这个元素，它在 svg 中定义了一个由一组首尾相连的直线线段构成的闭合多边形形状，最后一点连接到第一点。

也就是说这个多边形由一系列坐标点组成，相连的点之间会自动连上。

polygon 的 points 属性用来表示多边形的一系列坐标点，每个坐标点由 x y 坐标组成，每个坐标点之间用 `,` 逗号分隔。

![pic](https://camo.githubusercontent.com/d6df270267be9dcd18a62f0d1e1baecb3d23e99ff2cfcf9a2302b2b24770d34f/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f30303164353338346566343834316539616631363731386437363964613930622e706e67)

上图就是一个用 svg 画的五角星，它由十个坐标点组成 50 0,62.5 37.5,100 37.5,75 62.5,87.5 100,50 75,12.5 100,25 62.5,0 37.5,37.5 37.5。

由于这是一个 100*100 的五角星，所以我们能够很容易的根据每个坐标点的数值算出它们在五角星（坐标系）中所占的比例。

譬如第一个点是 p1(50,0)，那么它的 x y 坐标比例是 50%, 0；第二个点 p2(62.5,37.5)，对应的比例是 62.5%, 37.5%...

```js
// 五角星十个坐标点的比例集合
const points = [
    [0.5, 0],
    [0.625, 0.375],
    [1, 0.375],
    [0.75, 0.625],
    [0.875, 1],
    [0.5, 0.75],
    [0.125, 1],
    [0.25, 0.625],
    [0, 0.375],
    [0.375, 0.375],
]
```

既然知道了五角星的比例，那么要画出其他尺寸的五角星也就易如反掌了。

我们只需要在每次对五角星进行放大缩小，改变它的尺寸时，等比例的给出每个坐标点的具体数值即要。

```html
<div class="svg-star-container">
    <svg
        version="1.1"
        baseProfile="full"
        xmlns="http://www.w3.org/2000/svg"
    >
        <polygon
            ref="star"
            :points="points"
            :stroke="element.style.borderColor"
            :fill="element.style.backgroundColor"
            stroke-width="1"
        />
    </svg>
    <v-text :prop-value="element.propValue" :element="element" />
</div>

<script>
function drawPolygon(width, height) {
    // 五角星十个坐标点的比例集合
    const points = [
        [0.5, 0],
        [0.625, 0.375],
        [1, 0.375],
        [0.75, 0.625],
        [0.875, 1],
        [0.5, 0.75],
        [0.125, 1],
        [0.25, 0.625],
        [0, 0.375],
        [0.375, 0.375],
    ]

    const coordinatePoints = points.map(point => width * point[0] + ' ' + height * point[1])
    this.points = coordinatePoints.toString() // 得出五角星的 points 属性数据
}
</script>
```

![pic-resize](https://camo.githubusercontent.com/7f0a9a752cc1d8c1415d13b7168f4733315b3f4b9ff2abc49ddc12443bc4e067/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f63396337363661643730363234333231393035303134613465386536313061302e676966237069635f63656e746572)

## 其他 SVG 组件

同理，要画其他类型的 svg 组件，我们只要知道它们坐标点所占的比例就可以了。

如果你不知道一个 svg 怎么画，可以网上搜一下，先找一个能用的 svg 代码（这个五角星的 svg 代码，就是在网上找的）。

然后再计算它们每个坐标点所占的比例，转成小数点的形式，最后把这些数据代入上面提供的 drawPolygon() 函数即可。

譬如画一个三角形的代码是这样的：

```js
function drawTriangle(width, height) {
    const points = [
        [0.5, 0.05],
        [1, 0.95],
        [0, 0.95],
    ]

    const coordinatePoints = points.map(point => width * point[0] + ' ' + height * point[1])
    this.points = coordinatePoints.toString() // 得出三角形的 points 属性数据
}
```

![pic3](https://camo.githubusercontent.com/4bf7636f4cc8f4b25443e3f05749f586dc573b7e02507b9c4701dbe8fd2a397f/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f37316635313831666266383734636437613765653464356433623533613062372e706e67)

# 动态属性面板

目前所有自定义组件的属性面板都共用同一个 AttrList 组件。

因此弊端很明显，需要在这里写很多 if 语句，因为不同的组件有不同的属性。

例如矩形组件有 content 属性，但是图片没有，一个不同的属性就得写一个 if 语句。

```xml
<el-form-item v-if="name === 'rectShape'" label="内容">
   <el-input />
</el-form-item>
<!-- 其他属性... -->
```

幸好，这个问题的解决方案也不难。

在本系列的第一篇文章中，有讲解过如何动态渲染自定义组件：

```xml
<component :is="item.component"></component> <!-- 动态渲染组件 -->
```

在每个自定义组件的数据结构中都有一个 component 属性，这是该组件在 Vue 中注册的名称。

因此，每个自定义组件的属性面板可以和组件本身一样（利用 component 属性），做成动态的：

```xml
<!-- 右侧属性列表 -->
<section class="right">
    <el-tabs v-if="curComponent" v-model="activeName">
        <el-tab-pane label="属性" name="attr">
            <component :is="curComponent.component + 'Attr'" /> <!-- 动态渲染属性面板 -->
        </el-tab-pane>
        <el-tab-pane label="动画" name="animation" style="padding-top: 20px;">
            <AnimationList />
        </el-tab-pane>
        <el-tab-pane label="事件" name="events" style="padding-top: 20px;">
            <EventList />
        </el-tab-pane>
    </el-tabs>
    <CanvasAttr v-else></CanvasAttr>
</section>
```

同时，自定义组件的目录结构也需要做下调整，原来的目录结构为：

```
- VText.vue
- Picture.vue
...
```

调整后变为：

```
- VText
	- Attr.vue <!-- 组件的属性面板 -->
	- Component.vue <!-- 组件本身 -->
- Picture
	- Attr.vue
	- Component.vue
```

现在每一个组件都包含了组件本身和它的属性面板。经过改造后，图片属性面板代码也更加精简了：

```xml
<template>
    <div class="attr-list">
        <CommonAttr></CommonAttr> <!-- 通用属性 -->
        <el-form>
            <el-form-item label="镜像翻转">
                <div style="clear: both;">
                    <el-checkbox v-model="curComponent.propValue.flip.horizontal" label="horizontal">水平翻转</el-checkbox>
                    <el-checkbox v-model="curComponent.propValue.flip.vertical" label="vertical">垂直翻转</el-checkbox>
                </div>
            </el-form-item>
        </el-form>
    </div>
</template>
```

这样一来，组件和对应的属性面板都变成动态的了。以后需要单独给某个自定义组件添加属性就非常方便了。

![attr](https://camo.githubusercontent.com/8b73f37c75d25a7dec0a3564c2425b20fabd4159e1b3dd4768ab7390948d4d9c/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f39633531633561656364336134303539386336353664383436363564383536642e676966237069635f63656e746572)

# 数据来源（接口请求）

有些组件会有动态加载数据的需求，所以特地加了一个 Request 公共属性组件，用于请求数据。

当一个自定义组件拥有 request 属性时，就会在属性面板上渲染接口请求的相关内容。

至此，属性面板的公共组件已经有两个了：

```
-common
	- Request.vue <!-- 接口请求 -->
	- CommonAttr.vue <!-- 通用样式 -->
```

```js
// VText 自定义组件的数据结构
{
    component: 'VText',
    label: '文字',
    propValue: '双击编辑文字',
    icon: 'wenben',
    request: { // 接口请求
        method: 'GET',
        data: [],
        url: '',
        series: false, // 是否定时发送请求
        time: 1000, // 定时更新时间
        paramType: '', // string object array
        requestCount: 0, // 请求次数限制，0 为无限
    },
    style: { // 通用样式
        width: 200,
        height: 28,
        fontSize: '',
        fontWeight: 400,
        lineHeight: '',
        letterSpacing: 0,
        textAlign: '',
        color: '',
    },
}
```

![request](https://camo.githubusercontent.com/39993ed2475c83e86cbf1738f4b80746d3d0fdd070056569f0db5774190ed697/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f30633433633663616133663434353066383436363038323565333334306131352e676966237069635f63656e746572)

从上面的动图可以看出，api 请求的方法参数等都是可以手动修改的。

但是怎么控制返回来的数据赋值给组件的某个属性呢？这可以在发出请求的时候把组件的整个数据对象 obj 以及要修改属性的 key 当成参数一起传进去，当数据返回来时，就可以直接使用 obj[key] = data 来修改数据了。


```js
// 第二个参数是要修改数据的父对象，第三个参数是修改数据的 key，第四个数据修改数据的类型
this.cancelRequest = request(this.request, this.element, 'propValue', 'string')
```

# 组件联动

组件联动：当一个组件触发事件时，另一个组件会收到通知，并且做出相应的操作。

![组件联动](https://camo.githubusercontent.com/c943b01f1e8d0473cc7a2174399491a3d83d1335aa6728175788c9e2093a1c51/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f66616535616136333435356234316535616565633731346139656331653964312e676966237069635f63656e746572)


上面这个动图的矩形，它分别监听了下面两个按钮的悬浮事件，第一个按钮触发悬浮并广播事件，矩形执行回调向右旋转移动；第二个按钮则相反，向左旋转移动。

要实现这个功能，首先要给自定义组件加一个新属性 linkage，用来记录所有要联动的组件：

```js
{
	// 组件的其他属性...
	linkage: {
	     duration: 0, // 过渡持续时间
	     data: [ // 组件联动
	         {
	             id: '', // 联动的组件 id
	             label: '', // 联动的组件名称
	             event: '', // 监听事件
	             style: [{ key: '', value: '' }], // 监听的事件触发时，需要改变的属性
	         },
	     ],
	 }
}
```

对应的属性面板为：

![联动](https://camo.githubusercontent.com/01a62b3ed31c0b88b9ef0a46292e8c3487e6e798e5568e73ef9b250b3fbaaeb3/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f37393666626633386430343034316634623231373633643238303934613064312e706e67)

组件联动本质上就是订阅/发布模式的运用，每个组件在渲染时都会遍历它监听的所有组件。

## 事件监听

```js
<script>
import eventBus from '@/utils/eventBus'

export default {
    props: {
        linkage: {
            type: Object,
            default: () => {},
        },
        element: {
            type: Object,
            default: () => {},
        },
    },
    created() {
        if (this.linkage?.data?.length) {
            eventBus.$on('v-click', this.onClick)
            eventBus.$on('v-hover', this.onHover)
        }
    },
    mounted() {
        const { data, duration } = this.linkage || {}
        if (data?.length) {
            this.$el.style.transition = `all ${duration}s`
        }
    },
    beforeDestroy() {
        if (this.linkage?.data?.length) {
            eventBus.$off('v-click', this.onClick)
            eventBus.$off('v-hover', this.onHover)
        }
    },
    methods: {
        changeStyle(data = []) {
            data.forEach(item => {
                item.style.forEach(e => {
                    if (e.key) {
                        this.element.style[e.key] = e.value
                    }
                })
            })
        },

        onClick(componentId) {
            const data = this.linkage.data.filter(item => item.id === componentId && item.event === 'v-click')
            this.changeStyle(data)
        },

        onHover(componentId) {
            const data = this.linkage.data.filter(item => item.id === componentId && item.event === 'v-hover')
            this.changeStyle(data)
        },
    },
}
</script>
```


从上述代码可以看出：

1. 每一个自定义组件初始化时，都会监听 v-click v-hover 两个事件（目前只有点击、悬浮两个事件）

2. 事件回调函数触发时会收到一个参数——发出事件的组件 id（譬如多个组件都触发了点击事件，需要根据 id 来判断是否是自己监听的组件）

3. 最后再修改对应的属性

## 事件触发

```html
<template>
    <div @click="onClick" @mouseenter="onMouseEnter">
        <component
            :is="config.component"
            ref="component"
            class="component"
            :style="getStyle(config.style)"
            :prop-value="config.propValue"
            :element="config"
            :request="config.request"
            :linkage="config.linkage"
        />
    </div>
</template>

<script>
import eventBus from '@/utils/eventBus'

export default {
    methods: {
        onClick() {
            const events = this.config.events
            Object.keys(events).forEach(event => {
                this[event](events[event])
            })

            eventBus.$emit('v-click', this.config.id)
        },

        onMouseEnter() {
            eventBus.$emit('v-hover', this.config.id)
        },
    },
}
</script>
```

从上述代码可以看出，在渲染组件时，每一个组件的最外层都监听了 click mouseenter 事件，当这些事件触发时，eventBus 就会触发对应的事件（ v-click 或 v-hover ），并且把当前的组件 id 作为参数传过去。

最后再捊一遍整体逻辑：

- a 组件监听原生事件 click mouseenter

- 用户点击或移动鼠标到组件上触发原生事件 click 或 mouseenter

- 事件回调函数再用 eventBus 触发 v-click 或 v-hover 事件

- 监听了这两个事件的 b 组件收到通知后再修改 b 组件的相关属性（例如上面矩形的 x 坐标和旋转角度）


# 组件按需加载

目前这个项目本身是没有做按需加载的，但是我把实现方案用文字的形式写出来其实也差不多。

## 第一步，抽离

第一步需要把所有的自定义组件出离出来，单独存放。建议使用 monorepo 的方式来存放，所有的组件放在一个仓库里。

每一个 package 就是一个组件，可以单独打包。

```
- node_modules
- packages
	- v-text # 一个组件就是一个包 
	- v-button
	- v-table
- package.json
- lerna.json
```

## 第二步，打包

建议每个组件都打包成一个 js 文件 ，例如叫 bundle.js。

打包好直接调用上传接口放到服务器存起来（发布到 npm 也可以），每个组件都有一个唯一 id。

前端每次渲染组件的时，通过这个组件 id 向服务器请求组件资源的 URL。

## 第三步，动态加载组件

动态加载组件有两种方式：

```
import()
<script> 标签
```

第一种方式实现起来比较方便：

```js
const name = 'v-text' // 组件名称
const component = await import('https://xxx.xxx/bundile.js')
Vue.component(name, component)
```

但是兼容性上有点小问题，如果要支持一些旧的浏览器（例如 IE），可以使用 `<script>` 标签的形式来加载：

```js
function loadjs(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = url
        script.onload = resolve
        script.onerror = reject
    })
}

const name = 'v-text' // 组件名称
await loadjs('https://xxx.xxx/bundile.js')
// 这种方式加载组件，会直接将组件挂载在全局变量 window 下，所以 window[name] 取值后就是组件
Vue.component(name, window[name])
```

为了同时支持这两种加载方式，在加载组件时需要判断一下浏览器是否支持 ES6。

如果支持就用第一种方式，如果不支持就用第二种方式：

```js
function isSupportES6() {
    try {
        new Function('const fn = () => {};')
    } catch (error) {
        return false
    }

    return true
}
```

最后一点，打包也要同时兼容这两种加载方式：

```js
import VText from './VText.vue'

if (typeof window !== 'undefined') {
    window['VText'] = VText
}

export default VText
```

同时导出组件和把组件挂在 window 下。

# 其他小优化

## 图片镜像翻转

![镜像翻转](https://camo.githubusercontent.com/af56f115141a8cee063dfc15ba087d38e0b0904c1c815af545352492922b5424/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f64383562313538326434363934616638393265393862316565383336326537392e676966237069635f63656e746572)

图片镜像翻转需要使用 canvas 来实现，主要使用的是 canvas 的 translate() scale() 两个方法。

假设我们要对一个 100*100 的图片进行水平镜像翻转，它的代码是这样的：

```js
<canvas width="100" height="100"></canvas>

<script>
    const canvas = document.querySelector('canvas')
    const ctx = canvas.getContext('2d')
    const img = document.createElement('img')
    const width = 100
    const height = 100
    img.src = 'https://avatars.githubusercontent.com/u/22117876?v=4'
    img.onload = () => ctx.drawImage(img, 0, 0, width, height)

    // 水平翻转
    setTimeout(() => {
        // 清除图片
        ctx.clearRect(0, 0, width, height)
        // 平移图片
        ctx.translate(width, 0)
        // 对称镜像
        ctx.scale(-1, 1)
        ctx.drawImage(img, 0, 0, width, height)
        // 还原坐标点
        ctx.setTransform(1, 0, 0, 1, 0, 0)
    }, 2000)
</script>
```

ctx.translate(width, 0) 这行代码的意思是把图片的 x 坐标往前移动 width 个像素，所以平移后，图片就刚好在画布外面。

然后这时使用 ctx.scale(-1, 1) 对图片进行水平翻转，就能得到一个水平翻转后的图片了。

垂直翻转也是一样的原理，只不过参数不一样：

```js
// 原来水平翻转是 ctx.translate(width, 0)
ctx.translate(0, height) 
// 原来水平翻转是 ctx.scale(-1, 1)
ctx.scale(1, -1)
```

## 实时组件列表

画布中的每一个组件都是有层级的，但是每个组件的具体层级并不会实时显现出来。

因此，就有了这个实时组件列表的功能。

这个功能实现起来并不难，它的原理和画布渲染组件是一样的，只不过这个列表只需要渲染图标和名称。

```xml
<div class="real-time-component-list">
    <div
        v-for="(item, index) in componentData"
        :key="index"
        class="list"
        :class="{ actived: index === curComponentIndex }"
        @click="onClick(index)"
    >
        <span class="iconfont" :class="'icon-' + getComponent(index).icon"></span>
        <span>{{ getComponent(index).label }}</span>
    </div>
</div>
```

但是有一点要注意，在组件数据的数组里，越靠后的组件层级越高。

所以不对数组的数据索引做处理的话，用户看到的场景是这样的（假设添加组件的顺序为文本、按钮、图片）：

![组件列表](https://camo.githubusercontent.com/60fd3c2f4733cc3d376b4fb5399614e50d31540a75c0562db025c2bbfbf195f9/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f36343832623066386633623734343334393434653535323431326265643963362e706e67)

从用户的角度来看，层级最高的图片，在实时列表里排在最后。这跟我们平时的认知不太一样。

所以，我们需要对组件数据做个 reverse() 翻转一下。譬如文字组件的索引为 0，层级最低，它应该显示在底部。

那么每次在实时列表展示时，我们可以通过下面的代码转换一下，得到翻转后的索引，然后再渲染，这样的排序看起来就比较舒服了。

```html
<div class="real-time-component-list">
    <div
        v-for="(item, index) in componentData"
        :key="index"
        class="list"
        :class="{ actived: transformIndex(index) === curComponentIndex }"
        @click="onClick(transformIndex(index))"
    >
        <span class="iconfont" :class="'icon-' + getComponent(index).icon"></span>
        <span>{{ getComponent(index).label }}</span>
    </div>
</div>

<script>
function getComponent(index) {
    return componentData[componentData.length - 1 - index]
}

function transformIndex(index) {
    return componentData.length - 1 - index
}
</script>
```

![组件](https://camo.githubusercontent.com/c1d7cd8a99649633fa38ca5433618b80fabcc933ad7bc27077d2e9d3307b3374/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f63366661363965313865633634663534613935663430336433633437363036372e706e67)

# 参考资料

https://github.com/woai3c/Front-end-articles/issues/33

* any list
{:toc}
