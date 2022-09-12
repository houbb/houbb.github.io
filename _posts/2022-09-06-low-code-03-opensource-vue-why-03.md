---
layout: post
title:  低代码开源工具-03-可视化拖拽组件库一些技术要点原理分析（三）
date:  2022-09-03 21:22:02 +0800
categories: [Tool]
tags: [low-code, sh]
published: true
---

# 说明

本文是可视化拖拽系列的第三篇，之前的两篇文章一共对 17 个功能点的技术原理进行了分析：

- 编辑器

- 自定义组件

- 拖拽

- 删除组件、调整图层层级

- 放大缩小

- 撤消、重做

- 组件属性设置

- 吸附

- 预览、保存代码

- 绑定事件

- 绑定动画

- 导入 PSD

- 手机模式

- 拖拽旋转

- 复制粘贴剪切

- 数据交互

- 发布

本文在此基础上，将对以下几个功能点的技术原理进行分析：

- 多个组件的组合和拆分

- 文本组件

- 矩形组件

- 锁定组件

- 快捷键

- 网格线

- 编辑器快照的另一种实现方式

虽然我这个可视化拖拽组件库只是一个 DEMO，但对比了一下市面上的一些现成产品（例如 processon、墨刀），就基础功能来说，我这个 DEMO 实现了绝大部分的功能。

如果你对于低代码平台有兴趣，但又不了解的话。强烈建议将我的三篇文章结合项目源码一起阅读，相信对你的收获绝对不小。

另附上项目、在线 DEMO 地址：

# 18. 多个组件的组合和拆分

组合和拆分的技术点相对来说比较多，共有以下 4 个：

- 选中区域

- 组合后的移动、旋转

- 组合后的放大缩小

- 拆分后子组件样式的恢复

## 选中区域

在将多个组件组合之前，需要先选中它们。

利用鼠标事件可以很方便的将选中区域展示出来：

![选中区域](https://camo.githubusercontent.com/8aab56b752e9a2ac3f5f0ba90b05794260f3ef81bcf3c8158f279f08593c542d/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f31653938316232636536356639656536353933373638386133346464306130612e676966)

1. mousedown 记录起点坐标

2. mousemove 将当前坐标和起点坐标进行计算得出移动区域

3. 如果按下鼠标后往左上方移动，类似于这种操作则需要将当前坐标设为起点坐标，再计算出移动区域

```js
// 获取编辑器的位移信息
const rectInfo = this.editor.getBoundingClientRect()
this.editorX = rectInfo.x
this.editorY = rectInfo.y

const startX = e.clientX
const startY = e.clientY
this.start.x = startX - this.editorX
this.start.y = startY - this.editorY
// 展示选中区域
this.isShowArea = true

const move = (moveEvent) => {
    this.width = Math.abs(moveEvent.clientX - startX)
    this.height = Math.abs(moveEvent.clientY - startY)
    if (moveEvent.clientX < startX) {
        this.start.x = moveEvent.clientX - this.editorX
    }

    if (moveEvent.clientY < startY) {
        this.start.y = moveEvent.clientY - this.editorY
    }
}
```

在 mouseup 事件触发时，需要对选中区域内的所有组件的位移大小信息进行计算，得出一个能包含区域内所有组件的最小区域。

这个效果如下图所示：

![效果](https://camo.githubusercontent.com/2328beadc3676ae1d5cddb30e1cea49b16ec1b056d56239cd57d720e000ec8b1/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f31303436633134613462306534623563386166343535333362363937343461372e676966)

这个计算过程的代码：

```js
createGroup() {
  // 获取选中区域的组件数据
  const areaData = this.getSelectArea()
  if (areaData.length <= 1) {
      this.hideArea()
      return
  }

  // 根据选中区域和区域中每个组件的位移信息来创建 Group 组件
  // 要遍历选择区域的每个组件，获取它们的 left top right bottom 信息来进行比较
  let top = Infinity, left = Infinity
  let right = -Infinity, bottom = -Infinity
  areaData.forEach(component => {
      let style = {}
      if (component.component == 'Group') {
          component.propValue.forEach(item => {
              const rectInfo = $(`#component${item.id}`).getBoundingClientRect()
              style.left = rectInfo.left - this.editorX
              style.top = rectInfo.top - this.editorY
              style.right = rectInfo.right - this.editorX
              style.bottom = rectInfo.bottom - this.editorY

              if (style.left < left) left = style.left
              if (style.top < top) top = style.top
              if (style.right > right) right = style.right
              if (style.bottom > bottom) bottom = style.bottom
          })
      } else {
          style = getComponentRotatedStyle(component.style)
      }

      if (style.left < left) left = style.left
      if (style.top < top) top = style.top
      if (style.right > right) right = style.right
      if (style.bottom > bottom) bottom = style.bottom
  })

  this.start.x = left
  this.start.y = top
  this.width = right - left
  this.height = bottom - top
	
  // 设置选中区域位移大小信息和区域内的组件数据
  this.$store.commit('setAreaData', {
      style: {
          left,
          top,
          width: this.width,
          height: this.height,
      },
      components: areaData,
  })
},
        
getSelectArea() {
    const result = []
    // 区域起点坐标
    const { x, y } = this.start
    // 计算所有的组件数据，判断是否在选中区域内
    this.componentData.forEach(component => {
        if (component.isLock) return
        const { left, top, width, height } = component.style
        if (x <= left && y <= top && (left + width <= x + this.width) && (top + height <= y + this.height)) {
            result.push(component)
        }
    })
	
    // 返回在选中区域内的所有组件
    return result
}
```

简单描述一下这段代码的处理逻辑：

1. 利用 [getBoundingClientRect()](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect) 浏览器 API 获取每个组件相对于浏览器视口四个方向上的信息，也就是 left top right bottom。

2. 对比每个组件的这四个信息，取得选中区域的最左、最上、最右、最下四个方向的数值，从而得出一个能包含区域内所有组件的最小区域。

3. 如果选中区域内已经有一个 Group 组合组件，则需要对它里面的子组件进行计算，而不是对组合组件进行计算。

## 组合后的移动、旋转

为了方便将多个组件一起进行移动、旋转、放大缩小等操作，我新创建了一个 Group 组合组件：

```html
<template>
    <div class="group">
        <div>
             <template v-for="item in propValue">
                <component
                    class="component"
                    :is="item.component"
                    :style="item.groupStyle"
                    :propValue="item.propValue"
                    :key="item.id"
                    :id="'component' + item.id"
                    :element="item"
                />
            </template>
        </div>
    </div>
</template>

<script>
import { getStyle } from '@/utils/style'

export default {
    props: {
        propValue: {
            type: Array,
            default: () => [],
        },
        element: {
            type: Object,
        },
    },
    created() {
        const parentStyle = this.element.style
        this.propValue.forEach(component => {
            // component.groupStyle 的 top left 是相对于 group 组件的位置
            // 如果已存在 component.groupStyle，说明已经计算过一次了。不需要再次计算
            if (!Object.keys(component.groupStyle).length) {
                const style = { ...component.style }
                component.groupStyle = getStyle(style)
                component.groupStyle.left = this.toPercent((style.left - parentStyle.left) / parentStyle.width)
                component.groupStyle.top = this.toPercent((style.top - parentStyle.top) / parentStyle.height)
                component.groupStyle.width = this.toPercent(style.width / parentStyle.width)
                component.groupStyle.height = this.toPercent(style.height / parentStyle.height)
            }
        })
    },
    methods: {
        toPercent(val) {
            return val * 100 + '%'
        },
    },
}
</script>

<style lang="scss" scoped>
.group {
    & > div {
        position: relative;
        width: 100%;
        height: 100%;

        .component {
            position: absolute;
        }
    }
}
</style>
```

Group 组件的作用就是将区域内的组件放到它下面，成为子组件。

并且在创建 Group 组件时，获取每个子组件在 Group 组件内的相对位移和相对大小：

```js
created() {
    const parentStyle = this.element.style
    this.propValue.forEach(component => {
        // component.groupStyle 的 top left 是相对于 group 组件的位置
        // 如果已存在 component.groupStyle，说明已经计算过一次了。不需要再次计算
        if (!Object.keys(component.groupStyle).length) {
            const style = { ...component.style }
            component.groupStyle = getStyle(style)
            component.groupStyle.left = this.toPercent((style.left - parentStyle.left) / parentStyle.width)
            component.groupStyle.top = this.toPercent((style.top - parentStyle.top) / parentStyle.height)
            component.groupStyle.width = this.toPercent(style.width / parentStyle.width)
            component.groupStyle.height = this.toPercent(style.height / parentStyle.height)
        }
    })
},
methods: {
        toPercent(val) {
            return val * 100 + '%'
        },
    },
```

也就是将子组件的 left top width height 等属性转成以 % 结尾的相对数值。

## 为什么不使用绝对数值？

如果使用绝对数值，那么在移动 Group 组件时，除了对 Group 组件的属性进行计算外，还需要对它的每个子组件进行计算。

并且 Group 包含子组件太多的话，在进行移动、放大缩小时，计算量会非常大，有可能会造成页面卡顿。

如果改成相对数值，则只需要在 Group 创建时计算一次。然后在 Group 组件进行移动、旋转时也不用管 Group 的子组件，只对它自己计算即可。

![为什么不使用绝对数值？](https://camo.githubusercontent.com/91eb04070017a1c905b375c7505fda86b2ae6ae0926bad68c6ff376c72b04617/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f33626465363966323261376330303334663332623730383434376533323862652e676966)

## 组合后的放大缩小

组合后的放大缩小是个大问题，主要是因为有旋转角度的存在。

首先来看一下各个子组件没旋转时的放大缩小：

![放大缩小](https://camo.githubusercontent.com/6c1d15ee6deef9a36f7b86de7036d577ff951fbf41a6d5f600d40a5241286c99/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f34663830373234653037356162616264633937393232333963333536643162382e676966)

从动图可以看出，效果非常完美。

各个子组件的大小是跟随 Group 组件的大小而改变的。

现在试着给子组件加上旋转角度，再看一下效果：

### 为什么会出现这个问题？

主要是因为一个组件无论旋不旋转，它的 top left 属性都是不变的。

这样就会有一个问题，虽然实际上组件的 top left width height 属性没有变化。

但在外观上却发生了变化。

下面是两个同样的组件：一个没旋转，一个旋转了 45 度。

![WHY](https://camo.githubusercontent.com/f051e988734cb96de3fa1eafde15cc39825f2b668003d278974f0d5a361f9d74/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f36393135333463333661313266383835613439323830306265333631626137382e706e67)

可以看出来旋转后按钮的 top left width height 属性和我们从外观上看到的是不一样的。

接下来再看一个具体的示例：

![demo](https://camo.githubusercontent.com/463f87312230cdf58f894f6fb83a81b426ef2a8c3217300108dca479fe785de4/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f62313537313836643666336265663866353363623465393832656463336135312e706e67)

上面是一个 Group 组件，它左边的子组件属性为：

```js
transform: rotate(-75.1967deg);
width: 51.2267%;
height: 32.2679%;
top: 33.8661%;
left: -10.6496%;
```

可以看到 width 的值为 51.2267%，但从外观上来看，这个子组件最多占 Group 组件宽度的三分之一。所以这就是放大缩小不正常的问题所在。

### 一个不可行的解决方案（不想看的可以跳过）

一开始我想的是，先算出它相对浏览器视口的 top left width height 属性，再算出这几个属性在 Group 组件上的相对数值。这可以通过 getBoundingClientRect() API 实现。

只要维持外观上的各个属性占比不变，这样 Group 组件在放大缩小时，再通过旋转角度，利用旋转矩阵的知识（这一点在第二篇有详细描述）获取它未旋转前的 top left width height 属性。这样就可以做到子组件动态调整了。

但是这有个问题，通过 getBoundingClientRect() API 只能获取组件外观上的 top left right bottom width height 属性。

再加上一个角度，参数还是不够，所以无法计算出组件实际的 top left width height 属性。

![methods](https://camo.githubusercontent.com/ab407a09ecd53a74c90f814ea6d8060d02915f28076ca83bd8feab33598ae09e/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f35613463346639353766383865306237353965636430376335616538663334612e706e67)

就像上面的这张图，只知道原点 `O(x,y) w h` 和旋转角度，无法算出按钮的宽高。

### 一个可行的解决方案

这是无意中发现的，我在对 Group 组件进行放大缩小时，发现只要保持 Group 组件的宽高比例，子组件就能做到根据比例放大缩小。

那么现在问题就转变成了如何让 Group 组件放大缩小时保持宽高比例。

我在网上找到了这一篇文章，它详细描述了一个旋转组件如何保持宽高比来进行放大缩小，并配有源码示例。

现在我尝试简单描述一下如何保持宽高比对一个旋转组件进行放大缩小（建议还是看看原文）。

> [原文](https://github.com/shenhudong/snapping-demo/wiki/corner-handle)

下面是一个已旋转一定角度的矩形，假设现在拖动它左上方的点进行拉伸。

![一个可行的解决方案](https://camo.githubusercontent.com/24ff0a1bd1b26492a0b497d476c7840bd9598104ecdb90618d450571ecd2febd/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f38393939653565356531343366653930326135396431393639313531626235342e706e67)

第一步，算出组件宽高比，以及按下鼠标时通过组件的坐标（无论旋转多少度，组件的 top left 属性不变）和大小算出组件中心点：

```js
// 组件宽高比
const proportion = style.width / style.height
            
const center = {
    x: style.left + style.width / 2,
    y: style.top + style.height / 2,
}
```

第二步，用当前点击坐标和组件中心点算出当前点击坐标的对称点坐标：

```js
// 获取画布位移信息
const editorRectInfo = document.querySelector('#editor').getBoundingClientRect()

// 当前点击坐标
const curPoint = {
    x: e.clientX - editorRectInfo.left,
    y: e.clientY - editorRectInfo.top,
}

// 获取对称点的坐标
const symmetricPoint = {
    x: center.x - (curPoint.x - center.x),
    y: center.y - (curPoint.y - center.y),
}
```

第三步，摁住组件左上角进行拉伸时，通过当前鼠标实时坐标和对称点计算出新的组件中心点：

```js
const curPositon = {
    x: moveEvent.clientX - editorRectInfo.left,
    y: moveEvent.clientY - editorRectInfo.top,
}

const newCenterPoint = getCenterPoint(curPositon, symmetricPoint)

// 求两点之间的中点坐标
function getCenterPoint(p1, p2) {
    return {
        x: p1.x + ((p2.x - p1.x) / 2),
        y: p1.y + ((p2.y - p1.y) / 2),
    }
}
```

由于组件处于旋转状态，即使你知道了拉伸时移动的 xy 距离，也不能直接对组件进行计算。

否则就会出现 BUG，移位或者放大缩小方向不正确。

因此，我们需要在组件未旋转的情况下对其进行计算。

![calc](https://camo.githubusercontent.com/4d66c55c05440e768fb7799b2d26b7354426f8e0af5a111c55cc4548d0c71945/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f64613964333663343233646238326264373133306332393664363661323764352e706e67)

第四步，根据已知的旋转角度、新的组件中心点、当前鼠标实时坐标可以算出当前鼠标实时坐标 currentPosition 在未旋转时的坐标 newTopLeftPoint。

同时也能根据已知的旋转角度、新的组件中心点、对称点算出组件对称点 sPoint 在未旋转时的坐标 newBottomRightPoint。

对应的计算公式如下：

```js
/**
 * 计算根据圆心旋转后的点的坐标
 * @param   {Object}  point  旋转前的点坐标
 * @param   {Object}  center 旋转中心
 * @param   {Number}  rotate 旋转的角度
 * @return  {Object}         旋转后的坐标
 * https://www.zhihu.com/question/67425734/answer/252724399 旋转矩阵公式
 */
export function calculateRotatedPointCoordinate(point, center, rotate) {
    /**
     * 旋转公式：
     *  点a(x, y)
     *  旋转中心c(x, y)
     *  旋转后点n(x, y)
     *  旋转角度θ                tan ??
     * nx = cosθ * (ax - cx) - sinθ * (ay - cy) + cx
     * ny = sinθ * (ax - cx) + cosθ * (ay - cy) + cy
     */

    return {
        x: (point.x - center.x) * Math.cos(angleToRadian(rotate)) - (point.y - center.y) * Math.sin(angleToRadian(rotate)) + center.x,
        y: (point.x - center.x) * Math.sin(angleToRadian(rotate)) + (point.y - center.y) * Math.cos(angleToRadian(rotate)) + center.y,
    }
}
```

上面的公式涉及到线性代数中旋转矩阵的知识，对于一个没上过大学的人来说，实在太难了。

还好我从知乎上的一个回答中找到了这一公式的推理过程，下面是回答的原文：

> [知乎](https://www.zhihu.com/question/67425734/answer/252724399)

![原文](https://camo.githubusercontent.com/1a436c06d63d0e3ce6348d3face041c68eba34cacc459fb3c9a10140a67d557d/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f38643633383865313866393837373739623565316363336332653066333638342e706e67)

通过以上几个计算值，就可以得到组件新的位移值 top left 以及新的组件大小。

对应的完整代码如下：

```js
function calculateLeftTop(style, curPositon, pointInfo) {
    const { symmetricPoint } = pointInfo
    const newCenterPoint = getCenterPoint(curPositon, symmetricPoint)
    const newTopLeftPoint = calculateRotatedPointCoordinate(curPositon, newCenterPoint, -style.rotate)
    const newBottomRightPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -style.rotate)
  
    const newWidth = newBottomRightPoint.x - newTopLeftPoint.x
    const newHeight = newBottomRightPoint.y - newTopLeftPoint.y
    if (newWidth > 0 && newHeight > 0) {
        style.width = Math.round(newWidth)
        style.height = Math.round(newHeight)
        style.left = Math.round(newTopLeftPoint.x)
        style.top = Math.round(newTopLeftPoint.y)
    }
}
```

现在再来看一下旋转后的放大缩小：

![放大缩小](https://camo.githubusercontent.com/ec01f9dfea44379388baa5b21dde05962686df3432918ac4e6a1a9c4ecc65449/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f31373932353662333334653762663838353163646464626263303031663861372e676966)

第五步，由于我们现在需要的是锁定宽高比来进行放大缩小，所以需要重新计算拉伸后的图形的左上角坐标。

这里先确定好几个形状的命名：

1. 原图形: 　红色部分

2. 新图形: 　蓝色部分

3. 修正图形: 绿色部分，即加上宽高比锁定规则的修正图形

![等比例](https://camo.githubusercontent.com/cabcad24d6f81a978f6218d4998ba226062670c7a88c015f02f81ac183fde90d/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f63356337653736633239613730313436353766333266643165626264633466642e676966)

在第四步中算出组件未旋转前的 newTopLeftPoint newBottomRightPoint newWidth newHeight 后，需要根据宽高比 proportion 来算出新的宽度或高度。

![重新计算](https://camo.githubusercontent.com/f7b44685f44816ad45ebbf3b5eff84676bf9ebe7889739607c4ae90f13dcc1f9/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f32373565363138363930346436333964343762623530356539386163663330382e706e67)

上图就是一个需要改变高度的示例，计算过程如下：

```js
if (newWidth / newHeight > proportion) {
    newTopLeftPoint.x += Math.abs(newWidth - newHeight * proportion)
    newWidth = newHeight * proportion
} else {
    newTopLeftPoint.y += Math.abs(newHeight - newWidth / proportion)
    newHeight = newWidth / proportion
}
```

由于现在求的未旋转前的坐标是以没按比例缩减宽高前的坐标来计算的，所以缩减宽高后，需要按照原来的中心点旋转回去，获得缩减宽高并旋转后对应的坐标。

然后以这个坐标和对称点获得新的中心点，并重新计算未旋转前的坐标。

![calc](https://camo.githubusercontent.com/57a65aeb2780db4fd44750fc0fbe24e7b57d4d8f33e56ccafe889ba278340a5c/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f32636263653638356364386237643935653266616435313238643933373364392e706e67)

![calc-2](https://camo.githubusercontent.com/26741fec010cb5ba94fbf79a5d0736ea6a23017bd7c2889a248bd81e88781993/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f32376235363266626638393062653634633230643138616635663732663139332e706e67)

经过修改后的完整代码如下：

```js
function calculateLeftTop(style, curPositon, proportion, needLockProportion, pointInfo) {
    const { symmetricPoint } = pointInfo
    let newCenterPoint = getCenterPoint(curPositon, symmetricPoint)
    let newTopLeftPoint = calculateRotatedPointCoordinate(curPositon, newCenterPoint, -style.rotate)
    let newBottomRightPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -style.rotate)
  
    let newWidth = newBottomRightPoint.x - newTopLeftPoint.x
    let newHeight = newBottomRightPoint.y - newTopLeftPoint.y

    if (needLockProportion) {
        if (newWidth / newHeight > proportion) {
            newTopLeftPoint.x += Math.abs(newWidth - newHeight * proportion)
            newWidth = newHeight * proportion
        } else {
            newTopLeftPoint.y += Math.abs(newHeight - newWidth / proportion)
            newHeight = newWidth / proportion
        }

        // 由于现在求的未旋转前的坐标是以没按比例缩减宽高前的坐标来计算的
        // 所以缩减宽高后，需要按照原来的中心点旋转回去，获得缩减宽高并旋转后对应的坐标
        // 然后以这个坐标和对称点获得新的中心点，并重新计算未旋转前的坐标
        const rotatedTopLeftPoint = calculateRotatedPointCoordinate(newTopLeftPoint, newCenterPoint, style.rotate)
        newCenterPoint = getCenterPoint(rotatedTopLeftPoint, symmetricPoint)
        newTopLeftPoint = calculateRotatedPointCoordinate(rotatedTopLeftPoint, newCenterPoint, -style.rotate)
        newBottomRightPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -style.rotate)
    
        newWidth = newBottomRightPoint.x - newTopLeftPoint.x
        newHeight = newBottomRightPoint.y - newTopLeftPoint.y
    }

    if (newWidth > 0 && newHeight > 0) {
        style.width = Math.round(newWidth)
        style.height = Math.round(newHeight)
        style.left = Math.round(newTopLeftPoint.x)
        style.top = Math.round(newTopLeftPoint.y)
    }
}
```

保持宽高比进行放大缩小的效果如下：

![等比例](https://camo.githubusercontent.com/c841720ae94c91ee275f2e20ae42927d966ea23501bbcfd3d3c7f8ab1abcc1c1/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f33653039656630633939616530373261313264353162303533343362653663612e676966)

当 Group 组件有旋转的子组件时，才需要保持宽高比进行放大缩小。所以在创建 Group 组件时可以判断一下子组件是否有旋转角度。如果没有，就不需要保持宽度比进行放大缩小。

```js
isNeedLockProportion() {
    if (this.element.component != 'Group') return false
    const ratates = [0, 90, 180, 360]
    for (const component of this.element.propValue) {
        if (!ratates.includes(mod360(parseInt(component.style.rotate)))) {
            return true
        }
    }

    return false
}
```

## 拆分后子组件样式的恢复

将多个组件组合在一起只是第一步，第二步是将 Group 组件进行拆分并恢复各个子组件的样式。

保证拆分后的子组件在外观上的属性不变。

计算代码如下：

```js
// store
decompose({ curComponent, editor }) {
    const parentStyle = { ...curComponent.style }
    const components = curComponent.propValue
    const editorRect = editor.getBoundingClientRect()

    store.commit('deleteComponent')
    components.forEach(component => {
        decomposeComponent(component, editorRect, parentStyle)
        store.commit('addComponent', { component })
    })
}
        
// 将组合中的各个子组件拆分出来，并计算它们新的 style
export default function decomposeComponent(component, editorRect, parentStyle) {
    // 子组件相对于浏览器视口的样式
    const componentRect = $(`#component${component.id}`).getBoundingClientRect()
    // 获取元素的中心点坐标
    const center = {
        x: componentRect.left - editorRect.left + componentRect.width / 2,
        y: componentRect.top - editorRect.top + componentRect.height / 2,
    }

    component.style.rotate = mod360(component.style.rotate + parentStyle.rotate)
    component.style.width = parseFloat(component.groupStyle.width) / 100 * parentStyle.width
    component.style.height = parseFloat(component.groupStyle.height) / 100 * parentStyle.height
    // 计算出元素新的 top left 坐标
    component.style.left = center.x - component.style.width / 2
    component.style.top = center.y - component.style.height / 2
    component.groupStyle = {}
}
```

这段代码的处理逻辑为：

1. 遍历 Group 的子组件并恢复它们的样式

2. 利用 getBoundingClientRect() API 获取子组件相对于浏览器视口的 left top width height 属性。

3. 利用这四个属性计算出子组件的中心点坐标。

4. 由于子组件的 width height 属性是相对于 Group 组件的，所以将它们的百分比值和 Group 相乘得出具体数值。

5. 再用中心点 center(x, y) 减去子组件宽高的一半得出它的 left top 属性。

至此，组合和拆分就讲解完了。

# 19. 文本组件

文本组件 VText 之前就已经实现过了，但不完美。

例如无法对文字进行选中。现在我对它进行了重写，让它支持选中功能。

```html
<template>
    <div v-if="editMode == 'edit'" class="v-text" @keydown="handleKeydown" @keyup="handleKeyup">
        <!-- tabindex >= 0 使得双击时聚集该元素 -->
        <div :contenteditable="canEdit" :class="{ canEdit }" @dblclick="setEdit" :tabindex="element.id" @paste="clearStyle"
            @mousedown="handleMousedown" @blur="handleBlur" ref="text" v-html="element.propValue" @input="handleInput"
            :style="{ verticalAlign: element.style.verticalAlign }"
        ></div>
    </div>
    <div v-else class="v-text">
        <div v-html="element.propValue" :style="{ verticalAlign: element.style.verticalAlign }"></div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { keycodes } from '@/utils/shortcutKey.js'

export default {
    props: {
        propValue: {
            type: String,
            require: true,
        },
        element: {
            type: Object,
        },
    },
    data() {
        return {
            canEdit: false,
            ctrlKey: 17,
            isCtrlDown: false,
        }
    },
    computed: {
        ...mapState([
            'editMode',
        ]),
    },
    methods: {
        handleInput(e) {
            this.$emit('input', this.element, e.target.innerHTML)
        },

        handleKeydown(e) {
            if (e.keyCode == this.ctrlKey) {
                this.isCtrlDown = true
            } else if (this.isCtrlDown && this.canEdit && keycodes.includes(e.keyCode)) {
                e.stopPropagation()
            } else if (e.keyCode == 46) { // deleteKey
                e.stopPropagation()
            }
        },

        handleKeyup(e) {
            if (e.keyCode == this.ctrlKey) {
                this.isCtrlDown = false
            }
        },

        handleMousedown(e) {
            if (this.canEdit) {
                e.stopPropagation()
            }
        },

        clearStyle(e) {
            e.preventDefault()
            const clp = e.clipboardData
            const text = clp.getData('text/plain') || ''
            if (text !== '') {
                document.execCommand('insertText', false, text)
            }

            this.$emit('input', this.element, e.target.innerHTML)
        },

        handleBlur(e) {
            this.element.propValue = e.target.innerHTML || '&nbsp;'
            this.canEdit = false
        },

        setEdit() {
            this.canEdit = true
            // 全选
            this.selectText(this.$refs.text)
        },

        selectText(element) {
            const selection = window.getSelection()
            const range = document.createRange()
            range.selectNodeContents(element)
            selection.removeAllRanges()
            selection.addRange(range)
        },
    },
}
</script>

<style lang="scss" scoped>
.v-text {
    width: 100%;
    height: 100%;
    display: table;

    div {
        display: table-cell;
        width: 100%;
        height: 100%;
        outline: none;
    }

    .canEdit {
        cursor: text;
        height: 100%;
    }
}
</style>
```

改造后的 VText 组件功能如下：

- 双击启动编辑。

- 支持选中文本。

- 粘贴时过滤掉文本的样式。

- 换行时自动扩充文本框的高度。

![pic](https://user-images.githubusercontent.com/22117876/107899987-d1b62300-6f7a-11eb-90a3-823f733af47b.gif)

# 20. 矩形组件

矩形组件其实就是一个内嵌 VText 文本组件的一个 DIV。

```html
<template>
    <div class="rect-shape">
        <v-text :propValue="element.propValue" :element="element" />
    </div>
</template>

<script>
export default {
    props: {
        element: {
            type: Object,
        },
    },
}
</script>

<style lang="scss" scoped>
.rect-shape {
    width: 100%;
    height: 100%;
    overflow: auto;
}
</style>
```

VText 文本组件有的功能它都有，并且可以任意放大缩小。

![pic2](https://user-images.githubusercontent.com/22117876/107900036-e98da700-6f7a-11eb-8841-93b254576590.gif)

# 21. 锁定组件

锁定组件主要是看到 processon 和墨刀有这个功能，于是我顺便实现了。

锁定组件的具体需求为：不能移动、放大缩小、旋转、复制、粘贴等，只能进行解锁操作。

它的实现原理也不难：

1. 在自定义组件上加一个 isLock 属性，表示是否锁定组件。

2. 在点击组件时，根据 isLock 是否为 true 来隐藏组件上的八个点和旋转图标。

3. 为了突出一个组件被锁定，给它加上透明度属性和一个锁的图标。

4. 如果组件被锁定，置灰上面所说的需求对应的按钮，不能被点击。

相关代码如下：

```js
export const commonAttr = {
    animations: [],
    events: {},
    groupStyle: {}, // 当一个组件成为 Group 的子组件时使用
    isLock: false, // 是否锁定组件
}
```

```xml
<el-button @click="decompose" :disabled="!curComponent || curComponent.isLock || curComponent.component != 'Group'">拆分</el-button>

<el-button @click="lock" :disabled="!curComponent || curComponent.isLock">锁定</el-button>
<el-button @click="unlock" :disabled="!curComponent || !curComponent.isLock">解锁</el-button>
```

```html
<template>
    <div class="contextmenu" v-show="menuShow" :style="{ top: menuTop + 'px', left: menuLeft + 'px' }">
        <ul @mouseup="handleMouseUp">
            <template v-if="curComponent">
                <template v-if="!curComponent.isLock">
                    <li @click="copy">复制</li>
                    <li @click="paste">粘贴</li>
                    <li @click="cut">剪切</li>
                    <li @click="deleteComponent">删除</li>
                    <li @click="lock">锁定</li>
                    <li @click="topComponent">置顶</li>
                    <li @click="bottomComponent">置底</li>
                    <li @click="upComponent">上移</li>
                    <li @click="downComponent">下移</li>
                </template>
                <li v-else @click="unlock">解锁</li>
            </template>
            <li v-else @click="paste">粘贴</li>
        </ul>
    </div>
</template>
```

![lock](https://user-images.githubusercontent.com/22117876/107900057-f90cf000-6f7a-11eb-9035-8fd4e0e526b3.gif)

# 22. 快捷键

支持快捷键主要是为了提升开发效率，用鼠标点点点毕竟没有按键盘快。

目前快捷键支持的功能如下：

```js
const ctrlKey = 17, 
    vKey = 86, // 粘贴
    cKey = 67, // 复制
    xKey = 88, // 剪切

    yKey = 89, // 重做
    zKey = 90, // 撤销

    gKey = 71, // 组合
    bKey = 66, // 拆分

    lKey = 76, // 锁定
    uKey = 85, // 解锁

    sKey = 83, // 保存
    pKey = 80, // 预览
    dKey = 68, // 删除
    deleteKey = 46, // 删除
    eKey = 69 // 清空画布
```


实现原理主要是利用 window 全局监听按键事件，在符合条件的按键触发时执行对应的操作：

```js
// 与组件状态无关的操作
const basemap = {
    [vKey]: paste,
    [yKey]: redo,
    [zKey]: undo,
    [sKey]: save,
    [pKey]: preview,
    [eKey]: clearCanvas,
}

// 组件锁定状态下可以执行的操作
const lockMap = {
    ...basemap,
    [uKey]: unlock,
}

// 组件未锁定状态下可以执行的操作
const unlockMap = {
    ...basemap,
    [cKey]: copy,
    [xKey]: cut,
    [gKey]: compose,
    [bKey]: decompose,
    [dKey]: deleteComponent,
    [deleteKey]: deleteComponent,
    [lKey]: lock,
}

let isCtrlDown = false
// 全局监听按键操作并执行相应命令
export function listenGlobalKeyDown() {
    window.onkeydown = (e) => {
        const { curComponent } = store.state
        if (e.keyCode == ctrlKey) {
            isCtrlDown = true
        } else if (e.keyCode == deleteKey && curComponent) {
            store.commit('deleteComponent')
            store.commit('recordSnapshot')
        } else if (isCtrlDown) {
            if (!curComponent || !curComponent.isLock) {
                e.preventDefault()
                unlockMap[e.keyCode] && unlockMap[e.keyCode]()
            } else if (curComponent && curComponent.isLock) {
                e.preventDefault()
                lockMap[e.keyCode] && lockMap[e.keyCode]()
            }
        }
    }

    window.onkeyup = (e) => {
        if (e.keyCode == ctrlKey) {
            isCtrlDown = false
        }
    }
}
```

为了防止和浏览器默认快捷键冲突，所以需要加上 e.preventDefault()。

# 23. 网格线

网格线功能使用 SVG 来实现：

```html
<template>
    <svg class="grid" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <pattern id="smallGrid" width="7.236328125" height="7.236328125" patternUnits="userSpaceOnUse">
                <path 
                    d="M 7.236328125 0 L 0 0 0 7.236328125" 
                    fill="none" 
                    stroke="rgba(207, 207, 207, 0.3)" 
                    stroke-width="1">
                </path>
            </pattern>
            <pattern id="grid" width="36.181640625" height="36.181640625" patternUnits="userSpaceOnUse">
                <rect width="36.181640625" height="36.181640625" fill="url(#smallGrid)"></rect>
                <path 
                    d="M 36.181640625 0 L 0 0 0 36.181640625" 
                    fill="none" 
                    stroke="rgba(186, 186, 186, 0.5)" 
                    stroke-width="1">
                </path>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"></rect>
    </svg>
</template>

<style lang="scss" scoped>
.grid {
    position: absolute;
    top: 0;
    left: 0;
}
</style>
```

对 SVG 不太懂的，建议看一下 MDN 的教程。

> [SVG](https://developer.mozilla.org/zh-CN/docs/Web/SVG)

# 24. 编辑器快照的另一种实现方式

在系列文章的第一篇中，我已经分析过快照的实现原理。

```js
snapshotData: [], // 编辑器快照数据
snapshotIndex: -1, // 快照索引
        
undo(state) {
    if (state.snapshotIndex >= 0) {
        state.snapshotIndex--
        store.commit('setComponentData', deepCopy(state.snapshotData[state.snapshotIndex]))
    }
},

redo(state) {
    if (state.snapshotIndex < state.snapshotData.length - 1) {
        state.snapshotIndex++
        store.commit('setComponentData', deepCopy(state.snapshotData[state.snapshotIndex]))
    }
},

setComponentData(state, componentData = []) {
    Vue.set(state, 'componentData', componentData)
},

recordSnapshot(state) {
    // 添加新的快照
    state.snapshotData[++state.snapshotIndex] = deepCopy(state.componentData)
    // 在 undo 过程中，添加新的快照时，要将它后面的快照清理掉
    if (state.snapshotIndex < state.snapshotData.length - 1) {
        state.snapshotData = state.snapshotData.slice(0, state.snapshotIndex + 1)
    }
},
```

用一个数组来保存编辑器的快照数据。保存快照就是不停地执行 push() 操作，将当前的编辑器数据推入 snapshotData 数组，并增加快照索引 snapshotIndex。

由于每一次添加快照都是将当前编辑器的所有组件数据推入 snapshotData，保存的快照数据越多占用的内存就越多。

对此有两个解决方案：

1. 限制快照步数，例如只能保存 50 步的快照数据。

2. 保存快照只保存差异部分。

## 现在详细描述一下第二个解决方案。

假设依次往画布上添加 a b c d 四个组件，在原来的实现中，对应的 snapshotData 数据为：

```js
// snapshotData
[
  [a],
  [a, b],
  [a, b, c],
  [a, b, c, d],
]
```

从上面的代码可以发现，每一相邻的快照中，只有一个数据是不同的。

所以我们可以为每一步的快照添加一个类型字段，用来表示此次操作是添加还是删除。

那么上面添加四个组件的操作，所对应的 snapshotData 数据为：

```js
// snapshotData
[
  [{ type: 'add', value: a }],
  [{ type: 'add', value: b }],
  [{ type: 'add', value: c }],
  [{ type: 'add', value: d }],
]
```

如果我们要删除 c 组件，那么 snapshotData 数据将变为：

```js
// snapshotData
[
  [{ type: 'add', value: a }],
  [{ type: 'add', value: b }],
  [{ type: 'add', value: c }],
  [{ type: 'add', value: d }],
  [{ type: 'remove', value: c }],
]
```

## 那如何使用现在的快照数据呢？

我们需要遍历一遍快照数据，来生成编辑器的组件数据 componentData。

假设在上面的数据基础上执行了 undo 撤销操作：

```js
// snapshotData
// 快照索引 snapshotIndex 此时为 3
[
  [{ type: 'add', value: a }],
  [{ type: 'add', value: b }],
  [{ type: 'add', value: c }],
  [{ type: 'add', value: d }],
  [{ type: 'remove', value: c }],
]
```

1. snapshotData[0] 类型为 add，将组件 a 添加到 componentData 中，此时 componentData 为 [a]

2. 依次类推 [a, b]

3. [a, b, c]

4. [a, b, c, d]

如果这时执行 redo 重做操作，快照索引 snapshotIndex 变为 4。对应的快照数据类型为 type: 'remove'， 移除组件 c。

则数组数据为 [a, b, d]。

这种方法其实就是时间换空间，虽然每一次保存的快照数据只有一项，但每次都得遍历一遍所有的快照数据。

两种方法都不完美，要使用哪种取决于你，目前我仍在使用第一种方法。

# 总结

从造轮子的角度来看，这是我目前造的第四个比较满意的轮子，其他三个为：

nand2tetris: https://github.com/woai3c/nand2tetris

MIT6.828: https://github.com/woai3c/MIT6.828

mini-vue: https://github.com/woai3c/mini-vue

造轮子是一个很好的提升自己技术水平的方法，但造轮子一定要造有意义、有难度的轮子，并且同类型的轮子只造一个。造完轮子后，还需要写总结，最好输出成文章分享出去。


# 参考资料

https://github.com/woai3c/Front-end-articles/issues/21

[snapping-demo](https://github.com/shenhudong/snapping-demo/wiki/corner-handle)

[processon](https://www.processon.com/)

墨刀

* any list
{:toc}
