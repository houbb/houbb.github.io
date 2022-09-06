---
layout: post
title:  低代码开源工具-03-一个低代码（可视化拖拽）教学项目
date:  2022-09-03 21:22:02 +0800
categories: [Tool]
tags: [low-code, sh]
published: true
---

低代码平台的前端部分，靠拖拉拽生成页面。

# 功能点

这是本项目具有的功能点，如果想了解详情请参考本项目的四篇文档，每个功能点都有不同程度的描述以及动图帮助你理解。

- 编辑器

- 自定义组件（文本、图片、矩形、圆形、直线、星形、三角形、按钮、表格、组合）

- 接口请求（通过接口请求组件数据）

- 组件联动

- 拖拽

- 删除组件、调整图层层级

- 放大缩小

- 撤消、重做

- 组件属性设置

- 吸附

- 预览、保存代码

- 绑定事件

- 绑定动画

- 拖拽旋转

- 复制粘贴剪切

- 多个组件的组合和拆分

- 锁定组件

- 网格线

## 在线例子

> [https://woai3c.github.io/visual-drag-demo/](https://woai3c.github.io/visual-drag-demo/)

# 1. 编辑器

先来看一下页面的整体结构。

![编辑器](https://camo.githubusercontent.com/911202316e8098af1ef54650fdda701cc76695c60bc0d77d0d91cd6f626e5d4f/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f62366466303433316662376232373733386466356564643739313164363061612e706e67)

这一节要讲的编辑器其实就是中间的画布。

它的作用是：当从左边组件列表拖拽出一个组件放到画布中时，画布要把这个组件渲染出来。

这个编辑器的实现思路是：

1. 用一个数组 componentData 维护编辑器中的数据。

2. 把组件拖拽到画布中时，使用 push() 方法将新的组件数据添加到 componentData。

3. 编辑器使用 v-for 指令遍历 componentData，将每个组件逐个渲染到画布（也可以使用 JSX 语法结合 render() 方法代替）。

编辑器渲染的核心代码如下所示：

```xml
<component 
  v-for="item in componentData"
  :key="item.id"
  :is="item.component"
  :style="item.style"
  :propValue="item.propValue"
/>
```

每个组件数据大概是这样：

```js
{
    component: 'v-text', // 组件名称，需要提前注册到 Vue
    label: '文字', // 左侧组件列表中显示的名字
    propValue: '文字', // 组件所使用的值
    icon: 'el-icon-edit', // 左侧组件列表中显示的名字
    animations: [], // 动画列表
    events: {}, // 事件列表
    style: { // 组件样式
        width: 200,
        height: 33,
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '',
        letterSpacing: 0,
        textAlign: '',
        color: '',
    },
}
```

在遍历 componentData 组件数据时，主要靠 is 属性来识别出真正要渲染的是哪个组件。

例如要渲染的组件数据是 { component: 'v-text' }，则 `<component :is="item.component" />` 会被转换为 `<v-text />`。

当然，你这个组件也要提前注册到 Vue 中。

如果你想了解更多 is 属性的资料，请查看官方文档。

# 2. 自定义组件

原则上使用第三方组件也是可以的，但建议你最好封装一下。

不管是第三方组件还是自定义组件，每个组件所需的属性可能都不一样，所以每个组件数据可以暴露出一个属性 propValue 用于传递值。

例如 a 组件只需要一个属性，你的 propValue 可以这样写：propValue: 'aaa'。

如果需要多个属性，propValue 则可以是一个对象：

```js
propValue: {
  a: 1,
  b: 'text'
}
```

在这个 DEMO 组件库中我定义了三个组件。

图片组件 Picture：

```xml
<template>
    <div style="overflow: hidden">
        <img :src="propValue">
    </div>
</template>

<script>
export default {
    props: {
        propValue: {
            type: String,
            require: true,
        },
    },
}
</script>
```

按钮组件 VButton:

```xml
<template>
    <button class="v-button">{{ propValue }}</button>
</template>

<script>
export default {
    props: {
        propValue: {
            type: String,
            default: '',
        },
    },
}
</script>
```

文本组件 VText:

```xml
<template>
    <textarea 
        v-if="editMode == 'edit'"
        :value="propValue"
        class="text textarea"
        @input="handleInput"
        ref="v-text"
    ></textarea>
    <div v-else class="text disabled">
        <div v-for="(text, index) in propValue.split('\n')" :key="index">{{ text }}</div>
    </div>
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
    },
    computed: mapState([
        'editMode',
    ]),
    methods: {
        handleInput(e) {
            this.$emit('input', this.element, e.target.value)
        },
    },
}
</script>
```

# 3. 拖拽

## 3.1 从组件列表到画布

一个元素如果要设为可拖拽，必须给它添加一个 draggable 属性。

另外，在将组件列表中的组件拖拽到画布中，还有两个事件是起到关键作用的：

dragstart 事件，在拖拽刚开始时触发。它主要用于将拖拽的组件信息传递给画布。

drop 事件，在拖拽结束时触发。主要用于接收拖拽的组件信息。

先来看一下左侧组件列表的代码：

```xml
<div @dragstart="handleDragStart" class="component-list">
    <div v-for="(item, index) in componentList" :key="index" class="list" draggable :data-index="index">
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
    </div>
</div>
```

```js
handleDragStart(e) {
    e.dataTransfer.setData('index', e.target.dataset.index)
}
```

可以看到给列表中的每一个组件都设置了 draggable 属性。另外，在触发 dragstart 事件时，使用 dataTransfer.setData() 传输数据。再来看一下接收数据的代码：

```xml
<div class="content" @drop="handleDrop" @dragover="handleDragOver" @click="deselectCurComponent">
    <Editor />
</div>
```

```js
handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    const component = deepCopy(componentList[e.dataTransfer.getData('index')])
    this.$store.commit('addComponent', component)
}
```










# 参考资料

https://github.com/woai3c/visual-drag-demo

* any list
{:toc}