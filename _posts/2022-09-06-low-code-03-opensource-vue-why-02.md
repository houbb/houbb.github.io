---
layout: post
title:  低代码开源工具-03-可视化拖拽组件库一些技术要点原理分析（二）
date:  2022-09-03 21:22:02 +0800
categories: [Tool]
tags: [low-code, sh]
published: true
---

# 说明

本文是对《可视化拖拽组件库一些技术要点原理分析》的补充。

上一篇文章主要讲解了以下几个功能点：

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

现在这篇文章会在此基础上再补充 4 个功能点，分别是：

- 拖拽旋转

- 复制粘贴剪切

- 数据交互

- 发布

友善提醒：建议结合源码一起阅读，效果更好（这个 DEMO 使用的是 Vue 技术栈）。

# 14. 拖拽旋转

在写上一篇文章时，原来的 DEMO 已经可以支持旋转功能了。

但是这个旋转功能还有很多不完善的地方：

- 不支持拖拽旋转。

- 旋转后的放大缩小不正确。

- 旋转后的自动吸附不正确。

- 旋转后八个可伸缩点的光标不正确。

这一小节，我们将逐一解决这四个问题。

## 拖拽旋转

拖拽旋转需要使用 [Math.atan2()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2) 函数。

Math.atan2() 返回从原点(0,0)到(x,y)点的线段与x轴正方向之间的平面角度(弧度值)，也就是Math.atan2(y,x)。

Math.atan2(y,x)中的y和x都是相对于圆点(0,0)的距离。

简单的说就是以组件中心点为原点 (centerX,centerY)，用户按下鼠标时的坐标设为 (startX,startY)，鼠标移动时的坐标设为 (curX,curY)。

旋转角度可以通过 (startX,startY) 和 (curX,curY) 计算得出。

![拖拽旋转](https://camo.githubusercontent.com/9872220c7b91230a8e3336d7234cc65e3abab90b013a459ffcc63d84143c7b9c/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f63326465306534636434326633633261326137346232666135643338663865362e706e67)

那我们如何得到从点 (startX,startY) 到点 (curX,curY) 之间的旋转角度呢？

第一步，鼠标点击时的坐标设为 (startX,startY)：

```js
const startY = e.clientY
const startX = e.clientX
```

第二步，算出组件中心点：

```js
// 获取组件中心点位置
const rect = this.$el.getBoundingClientRect()
const centerX = rect.left + rect.width / 2
const centerY = rect.top + rect.height / 2
```

第三步，按住鼠标移动时的坐标设为 (curX,curY)：

```js
const curX = moveEvent.clientX
const curY = moveEvent.clientY
```

第四步，分别算出 (startX,startY) 和 (curX,curY) 对应的角度，再将它们相减得出旋转的角度。

另外，还需要注意的就是 Math.atan2() 方法的返回值是一个弧度，因此还需要将弧度转化为角度。

所以完整的代码为：

```js
// 旋转前的角度
const rotateDegreeBefore = Math.atan2(startY - centerY, startX - centerX) / (Math.PI / 180)
// 旋转后的角度
const rotateDegreeAfter = Math.atan2(curY - centerY, curX - centerX) / (Math.PI / 180)
// 获取旋转的角度值， startRotate 为初始角度值
pos.rotate = startRotate + rotateDegreeAfter - rotateDegreeBefore
```

![rotate](https://camo.githubusercontent.com/fe44e92228fb202af2ed89bbe29c55b5a01d114edbf993586887f73a8f13a442/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f66373265646639396565616362636530386335613935346563393038333530632e676966)

## 放大缩小

组件旋转后的放大缩小会有 BUG。

![放大缩小](https://camo.githubusercontent.com/50285ebc71ceefac5cb1e5e1ed08ff7e08fc836f33c69c278a84cb0eabcf78d1/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f64373738383937306432653135363763313561643066633739383534343563632e676966)

从上图可以看到，放大缩小时会发生移位。

另外伸缩的方向和我们拖动的方向也不对。

造成这一 BUG 的原因是：当初设计放大缩小功能没有考虑到旋转的场景。所以**无论旋转多少角度，放大缩小仍然是按没旋转时计算的**。

下面再看一个具体的示例：

![示例](https://camo.githubusercontent.com/54921a9ee2a292fe744d67ec81bc760e9d21565f16f84edf7a88a93cee10656f/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f33653831356135396637346232613531626231313431663731366331376531322e706e67)

从上图可以看出，在没有旋转时，按住顶点往上拖动，只需用 y2 - y1 就可以得出拖动距离 s。这时将组件原来的高度加上 s 就能得出新的高度，同时将组件的 top、left 属性更新。

![lizi](https://camo.githubusercontent.com/e91d5c9b7d18eb3030a34bce97e4ebf822bcf2dca7bfaf0739a974ef2f2709af/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f61646565646639666630666263396461363832353962383032316133656136392e706e67)

现在旋转 180 度，如果这时拖住顶点往下拖动，我们期待的结果是组件高度增加。但这时计算的方式和原来没旋转时是一样的，所以结果和我们期待的相反，组件的高度将会变小（如果不理解这个现象，可以想像一下没有旋转的那张图，按住顶点往下拖动）。

![旋转 180 度](https://camo.githubusercontent.com/85da75da9d9dd5941ae81d03929fb96861be85d340e5a8d5a072333156b55193/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f66303133633031383734663737646536313961393130656436313464383634662e676966)

如何解决这个问题呢？我从 github 上的一个项目 [snapping-demo](https://github.com/shenhudong/snapping-demo/wiki/corner-handle) 找到了解决方案：将放大缩小和旋转角度关联起来。

## 解决方案

下面是一个已旋转一定角度的矩形，假设现在拖动它左上方的点进行拉伸。

![解决方案](https://camo.githubusercontent.com/24ff0a1bd1b26492a0b497d476c7840bd9598104ecdb90618d450571ecd2febd/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f38393939653565356531343366653930326135396431393639313531626235342e706e67)

现在我们将一步步分析如何得出拉伸后的组件的正确大小和位移。

第一步，按下鼠标时通过组件的坐标（无论旋转多少度，组件的 top left 属性不变）和大小算出组件中心点：

```js
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

![position](https://camo.githubusercontent.com/4d66c55c05440e768fb7799b2d26b7354426f8e0af5a111c55cc4548d0c71945/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f64613964333663343233646238326264373133306332393664363661323764352e706e67)

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

![rotate](https://camo.githubusercontent.com/1a436c06d63d0e3ce6348d3face041c68eba34cacc459fb3c9a10140a67d557d/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f38643633383865313866393837373739623565316363336332653066333638342e706e67)

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

![rotate-resize](https://camo.githubusercontent.com/ec01f9dfea44379388baa5b21dde05962686df3432918ac4e6a1a9c4ecc65449/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f31373932353662333334653762663838353163646464626263303031663861372e676966)

## 自动吸附

自动吸附是根据组件的四个属性 top left width height 计算的，在将组件进行旋转后，这些属性的值是不会变的。

所以无论组件旋转多少度，吸附时仍然按未旋转时计算。

这样就会有一个问题，虽然实际上组件的 top left width height 属性没有变化。![](https://camo.githubusercontent.com/bce2b85c87ede38f51f1e34511fc99de00d853428fc7ca53e58208cb187f6046/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f66333134373263636162356461643236613837336432393532303336303333352e676966)

但在外观上却发生了变化。

下面是两个同样的组件：一个没旋转，一个旋转了 45 度。

![自动吸附](https://camo.githubusercontent.com/f051e988734cb96de3fa1eafde15cc39825f2b668003d278974f0d5a361f9d74/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f36393135333463333661313266383835613439323830306265333631626137382e706e67)

可以看出来旋转后按钮的 height 属性和我们从外观上看到的高度是不一样的，所以在这种情况下就出现了吸附不正确的 BUG。

![BUGS](https://camo.githubusercontent.com/bce2b85c87ede38f51f1e34511fc99de00d853428fc7ca53e58208cb187f6046/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f66333134373263636162356461643236613837336432393532303336303333352e676966)

## 解决方案

如何解决这个问题？我们需要拿组件旋转后的大小及位移来做吸附对比。

也就是说不要拿组件实际的属性来对比，而是拿我们看到的大小和位移做对比。

![解决方案](https://camo.githubusercontent.com/e6de1910595b5a91cf02e48400868266770602b19136821179a3282a6337cfdb/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f63393938643131356636623362613137396439393665633137383566656562622e706e67)

从上图可以看出，旋转后的组件在 x 轴上的投射长度为两条红线长度之和。这两条红线的长度可以通过正弦和余弦算出，左边的红线用正弦计算，右边的红线用余弦计算：

```js
const newWidth = style.width * cos(style.rotate) + style.height * sin(style.rotate)
```

同理，高度也是一样：

```js
const newHeight = style.height * cos(style.rotate) + style.width * sin(style.rotate)
```

新的宽度和高度有了，再根据组件原有的 top left 属性，可以得出组件旋转后新的 top left 属性。

下面附上完整代码：

```js
translateComponentStyle(style) {
    style = { ...style }
    if (style.rotate != 0) {
        const newWidth = style.width * cos(style.rotate) + style.height * sin(style.rotate)
        const diffX = (style.width - newWidth) / 2
        style.left += diffX
        style.right = style.left + newWidth

        const newHeight = style.height * cos(style.rotate) + style.width * sin(style.rotate)
        const diffY = (newHeight - style.height) / 2
        style.top -= diffY
        style.bottom = style.top + newHeight

        style.width = newWidth
        style.height = newHeight
    } else {
        style.bottom = style.top + style.height
        style.right = style.left + style.width
    }

    return style
}
```


经过修复后，吸附也可以正常显示了。

![fixed](https://camo.githubusercontent.com/db26ef53e5fa1755e7a53d49c072a48ca85be7bb808519a680a34c2138b8c398/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f62623539626136343964366637316334393631383137376663636666353132392e676966)


## 光标

光标和可拖动的方向不对，是因为八个点的光标是固定设置的，没有随着角度变化而变化。

![光标](https://camo.githubusercontent.com/7ecae92dd1207073d1eda2c2d95b1f2a69666233f21d98d3a8be08e97a992d21/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f63363664316364626338623364616532363937633166336332313332316466372e676966)

### 解决方案

由于 360 / 8 = 45，所以可以为每一个方向分配 45 度的范围，每个范围对应一个光标。

同时为每个方向设置一个初始角度，也就是未旋转时组件每个方向对应的角度。

![解决方案](https://camo.githubusercontent.com/78cddb06976afc78326b5a1de694fa40d20b30e2ed26ae75012a6cbe453629b7/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f62646438633431626139633934313161363563353339666635353564313633622e706e67)

```js
pointList: ['lt', 't', 'rt', 'r', 'rb', 'b', 'lb', 'l'], // 八个方向
initialAngle: { // 每个点对应的初始角度
    lt: 0,
    t: 45,
    rt: 90,
    r: 135,
    rb: 180,
    b: 225,
    lb: 270,
    l: 315,
},
angleToCursor: [ // 每个范围的角度对应的光标
    { start: 338, end: 23, cursor: 'nw' },
    { start: 23, end: 68, cursor: 'n' },
    { start: 68, end: 113, cursor: 'ne' },
    { start: 113, end: 158, cursor: 'e' },
    { start: 158, end: 203, cursor: 'se' },
    { start: 203, end: 248, cursor: 's' },
    { start: 248, end: 293, cursor: 'sw' },
    { start: 293, end: 338, cursor: 'w' },
],
cursors: {},
```

计算方式也很简单：

1. 假设现在组件已旋转了一定的角度 a。

2. 遍历八个方向，用每个方向的初始角度 + a 得出现在的角度 b。

3. 遍历 angleToCursor 数组，看看 b 在哪一个范围中，然后将对应的光标返回。

经过上面三个步骤就可以计算出组件旋转后正确的光标方向。

具体的代码如下：

```js
getCursor() {
    const { angleToCursor, initialAngle, pointList, curComponent } = this
    const rotate = (curComponent.style.rotate + 360) % 360 // 防止角度有负数，所以 + 360
    const result = {}
    let lastMatchIndex = -1 // 从上一个命中的角度的索引开始匹配下一个，降低时间复杂度
    pointList.forEach(point => {
        const angle = (initialAngle[point] + rotate) % 360
        const len = angleToCursor.length
        while (true) {
            lastMatchIndex = (lastMatchIndex + 1) % len
            const angleLimit = angleToCursor[lastMatchIndex]
            if (angle < 23 || angle >= 338) {
                result[point] = 'nw-resize'
                return
            }

            if (angleLimit.start <= angle && angle < angleLimit.end) {
                result[point] = angleLimit.cursor + '-resize'
                return
            }
        }
    })

    return result
},
```

![btn](https://camo.githubusercontent.com/ebebbfc370a3648eda09c279505f0920d736bc50a291fd9c93f56f352443bfaf/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f36653562623163363231373863323462626261653438353833316162373330342e676966)

从上面的动图可以看出来，现在八个方向上的光标是可以正确显示的。

# 15. 复制粘贴剪切

相对于拖拽旋转功能，复制粘贴就比较简单了。

```js
const ctrlKey = 17, vKey = 86, cKey = 67, xKey = 88
let isCtrlDown = false

window.onkeydown = (e) => {
    if (e.keyCode == ctrlKey) {
        isCtrlDown = true
    } else if (isCtrlDown && e.keyCode == cKey) {
        this.$store.commit('copy')
    } else if (isCtrlDown && e.keyCode == vKey) {
        this.$store.commit('paste')
    } else if (isCtrlDown && e.keyCode == xKey) {
        this.$store.commit('cut')
    }
}

window.onkeyup = (e) => {
    if (e.keyCode == ctrlKey) {
        isCtrlDown = false
    }
}
```

监听用户的按键操作，在按下特定按键时触发对应的操作。

## 复制操作

在 vuex 中使用 copyData 来表示复制的数据。

当用户按下 ctrl + c 时，将当前组件数据深拷贝到 copyData。

```js
copy(state) {
    state.copyData = {
        data: deepCopy(state.curComponent),
        index: state.curComponentIndex,
    }
},
```

同时需要将当前组件在组件数据中的索引记录起来，在剪切中要用到。

## 粘贴操作

```js
paste(state, isMouse) {
    if (!state.copyData) {
        toast('请选择组件')
        return
    }

    const data = state.copyData.data

    if (isMouse) {
        data.style.top = state.menuTop
        data.style.left = state.menuLeft
    } else {
        data.style.top += 10
        data.style.left += 10
    }

    data.id = generateID()
    store.commit('addComponent', { component: data })
    store.commit('recordSnapshot')
    state.copyData = null
},
```

粘贴时，如果是按键操作 ctrl+v。则将组件的 top left 属性加 10，以免和原来的组件重叠在一起。

如果是使用鼠标右键执行粘贴操作，则将复制的组件放到鼠标点击处。

## 剪切操作

```js
cut(state) {
    if (!state.curComponent) {
        toast('请选择组件')
        return
    }
    
    if (state.copyData) {
        store.commit('addComponent', { component: state.copyData.data, index: state.copyData.index })
        if (state.curComponentIndex >= state.copyData.index) {
            // 如果当前组件索引大于等于插入索引，需要加一，因为当前组件往后移了一位
            state.curComponentIndex++
        }
    }

    store.commit('copy')
    store.commit('deleteComponent')
},
```

剪切操作本质上还是复制，只不过在执行复制后，需要将当前组件删除。

为了避免用户执行剪切操作后，不执行粘贴操作，而是继续执行剪切。

这时就需要将原先剪切的数据进行恢复。

所以复制数据中记录的索引就起作用了，可以通过索引将原来的数据恢复到原来的位置中。

## 右键操作

右键操作和按键操作是一样的，一个功能两种触发途径。

```html
<li @click="copy" v-show="curComponent">复制</li>
<li @click="paste">粘贴</li>
<li @click="cut" v-show="curComponent">剪切</li>

cut() {
    this.$store.commit('cut')
},

copy() {
    this.$store.commit('copy')
},

paste() {
    this.$store.commit('paste', true)
},
```

# 16. 数据交互

## 方式一

提前写好一系列 ajax 请求API，点击组件时按需选择 API，选好 API 再填参数。

例如下面这个组件，就展示了如何使用 ajax 请求向后台交互：

```js
<template>
    <div>{{ propValue.data }}</div>
</template>

<script>
export default {
    // propValue: {
    //     api: {
    //             request: a,
    //             params,
    //      },
    //     data: null
    // }
    props: {
        propValue: {
            type: Object,
            default: () => {},
        },
    },
    created() {
        this.propValue.api.request(this.propValue.api.params).then(res => {
            this.propValue.data = res.data
        })
    },
}
</script>
```

## 方式二

方式二适合纯展示的组件，例如有一个报警组件，可以根据后台传来的数据显示对应的颜色。

在编辑页面的时候，可以通过 ajax 向后台请求页面能够使用的 websocket 数据：

```js
const data = ['status', 'text'...]
```

然后再为不同的组件添加上不同的属性。

例如有 a 组件，它绑定的属性为 status。

```js
// 组件能接收的数据
props: {
    propValue: {
        type: String,
    },
    element: {
        type: Object,
    },
    wsKey: {
        type: String,
        default: '',
    },
},
```

在组件中通过 wsKey 获取这个绑定的属性。等页面发布后或者预览时，通过 weboscket 向后台请求全局数据放在 vuex 上。

组件就可以通过 wsKey 访问数据了。

```js
<template>
    <div>{{ wsData[wsKey] }}</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    props: {
        propValue: {
            type: String,
        },
        element: {
            type: Object,
        },
        wsKey: {
            type: String,
            default: '',
        },
    },
    computed: mapState([
        'wsData',
    ]),
</script>
```

和后台交互的方式有很多种，不仅仅包括上面两种，我在这里仅提供一些思路，以供参考。

# 17. 发布

页面发布有两种方式：一是将组件数据渲染为一个单独的 HTML 页面；二是从本项目中抽取出一个最小运行时 runtime 作为一个单独的项目。

这里说一下第二种方式，本项目中的最小运行时其实就是预览页面加上自定义组件。

将这些代码提取出来作为一个项目单独打包。发布页面时将组件数据以 JSON 的格式传给服务端，同时为每个页面生成一个唯一 ID。

假设现在有三个页面，发布页面生成的 ID 为 a、b、c。访问页面时只需要把 ID 带上，这样就可以根据 ID 获取每个页面对应的组件数据。

```
www.test.com/?id=a
www.test.com/?id=c
www.test.com/?id=b
```

## 按需加载

如果自定义组件过大，例如有数十个甚至上百个。

这时可以将自定义组件用 import 的方式导入，做到按需加载，减少首屏渲染时间：

```js
import Vue from 'vue'

const components = [
    'Picture',
    'VText',
    'VButton',
]

components.forEach(key => {
    Vue.component(key, () => import(`@/custom-component/${key}`))
})
```

## 按版本发布

自定义组件有可能会有更新的情况。

例如原来的组件使用了大半年，现在有功能变更，为了不影响原来的页面。

建议在发布时带上组件的版本号：

```
- v-text
  - v1.vue
  - v2.vue
```

例如 v-text 组件有两个版本，在左侧组件列表区使用时就可以带上版本号：

```js
{
  component: 'v-text',
  version: 'v1'
  ...
}
```

这样导入组件时就可以根据组件版本号进行导入：

```js
import Vue from 'vue'
import componentList from '@/custom-component/component-list`

componentList.forEach(component => {
    Vue.component(component.name, () => import(`@/custom-component/${component.name}/${component.version}`))
})
```

# 参考资料

https://github.com/woai3c/Front-end-articles/issues/20

[Math](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math)

[通过Math.atan2 计算角度](https://www.jianshu.com/p/9817e267925a)

[为什么矩阵能用来表示角的旋转？](https://www.zhihu.com/question/67425734/answer/252724399)

[snapping-demo](https://github.com/shenhudong/snapping-demo/wiki/corner-handle)

[vue-next-drag](https://github.com/lycHub/vue-next-drag)

* any list
{:toc}