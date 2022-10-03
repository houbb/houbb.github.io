---
layout: post
title:  低代码开源源码学习-04-Editor 编辑器源码实现
date:  2022-09-03 21:22:02 +0800
categories: [Tool]
tags: [low-code, sh]
published: true
---

# 整体结构

页面整体样式如下：

![整体结构](https://camo.githubusercontent.com/911202316e8098af1ef54650fdda701cc76695c60bc0d77d0d91cd6f626e5d4f/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f696d675f636f6e766572742f62366466303433316662376232373733386466356564643739313164363061612e706e67)

# 代码分析

## 整体结构

```xml
<template>
    <div class="home">
        <Toolbar />

        <main>
            <!-- 左侧组件列表 -->
            <section class="left">
                <ComponentList />
            </section>

            <!-- 中间画布 -->
            <section class="center">
                <div
                    class="content"
                    @drop="handleDrop"
                    @dragover="handleDragOver"
                    @mousedown="handleMouseDown"
                    @mouseup="deselectCurComponent"
                >
                    <Editor />
                </div>
            </section>

            <!-- 右侧属性列表 -->
            <section class="right">
                <el-tabs v-if="curComponent" v-model="activeName">
                    <el-tab-pane label="属性" name="attr">
                        <component :is="curComponent.component + 'Attr'" />
                    </el-tab-pane>
                </el-tabs>
                <CanvasAttr v-else></CanvasAttr>
            </section>
        </main>
    </div>
</template>
```

我们逐个简单看一下

## Toolbar

最上方的工具栏

```vue
<template>
    <div>
        <div class="toolbar">
            <div class="canvas-config">
                <span>画布大小</span>
                <input v-model="canvasStyleData.width">
                <span>*</span>
                <input v-model="canvasStyleData.height">
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    components: { },
    data() {
        return {
            scale: 100,
        }
    },
    computed: mapState([
        'canvasStyleData',
    ]),
    created() {
        this.scale = this.canvasStyleData.scale
    },
    methods: {
    },
}
</script>
```

这里可以改变画布的大小，还有一个 scale 缩放比例，为了简单，我们暂时固定为 100。

## ComponentList

左侧的组件列表

```vue 
<template>
    <div class="component-list" @dragstart="handleDragStart">
        <div
            v-for="(item, index) in componentList"
            :key="index"
            class="list"
            draggable
            :data-index="index"
        >
            <span class="iconfont" :class="'icon-' + item.icon"></span>
        </div>
    </div>
</template>

<script>
import componentList from '@/custom-component/component-list'

export default {
    data() {
        return {
            componentList,
        }
    },
    methods: {
        handleDragStart(e) {
            e.dataTransfer.setData('index', e.target.dataset.index)
        },
    },
}
</script>
```

### 配置

其中 componentList 是一堆关于组件的属性配置。

```js
// 公共样式
export const commonStyle = {
    rotate: 0, // 旋转
    opacity: 1, // 透明度
}

export const commonAttr = {
    animations: [], // 动画
    events: {}, // 事件
    groupStyle: {}, // 当一个组件成为 Group 的子组件时使用
    isLock: false, // 是否锁定组件
    collapseName: 'style', // 编辑组件时记录当前使用的是哪个折叠面板，再次回来时恢复上次打开的折叠面板，优化用户体验
}

// 编辑器左侧组件列表
const list = [
    {
        component: 'VText',
        label: '文字',
        propValue: '双击编辑文字',
        icon: 'wenben',
        style: {
            width: 200,
            height: 28,
            fontSize: '',
            fontWeight: 400,
            lineHeight: '',
            letterSpacing: 0,
            textAlign: '',
            color: '',
        },
    },
]

// 初始化整个组件样式列表
for (let i = 0, len = list.length; i < len; i++) {
    const item = list[i]
    item.style = { ...commonStyle, ...item.style }
    list[i] = { ...commonAttr, ...item }
}

export default list
```

### 拖拽事件

handleDragStart 指定了当前拖拽属性的标识。

这个和画布中的一一对应。

## 画布

```xml
<!-- 中间画布 -->
<section class="center">
    <div
        class="content"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @mousedown="handleMouseDown"
        @mouseup="deselectCurComponent"
    >
        <Editor />
    </div>
</section>
```

### handleDrop

handleDrop 对应的是鼠标放下的事件：

```js
handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    const index = e.dataTransfer.getData('index')
    const rectInfo = this.editor.getBoundingClientRect()
    if (index) {
        // 深度拷贝
        const component = deepCopy(componentList[index])
        component.style.top = e.clientY - rectInfo.y
        component.style.left = e.clientX - rectInfo.x
        // 生成唯一标识
        component.id = generateID()
        // 根据画面比例修改组件样式比例 https://github.com/woai3c/idrag/issues/91
        changeComponentSizeWithScale(component)
        
        this.$store.commit('addComponent', { component })
    }
},
```

根据鼠标按下时对应的组件，深度拷贝后，添加到当前的页面中。

其中 addComponent 在 store/index.js 中

```js
addComponent(state, { component, index }) {
    if (index !== undefined) {
        state.componentData.splice(index, 0, component)
    } else {
        state.componentData.push(component)
    }
},
```

### vText 组件

简单的文本组件。

```xml
<template>
    <div
        v-if="editMode == 'edit'"
        class="v-text"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
    >
        <!-- tabindex >= 0 使得双击时聚焦该元素 -->
        <div
            ref="text"
            :contenteditable="canEdit"
            :class="{ 'can-edit': canEdit }"
            tabindex="0"
            :style="{ verticalAlign: element.style.verticalAlign }"
            @dblclick="setEdit"
            @paste="clearStyle"
            @mousedown="handleMousedown"
            @blur="handleBlur"
            @input="handleInput"
            v-html="element.propValue"
        ></div>
    </div>
    <div v-else class="v-text preview">
        <div :style="{ verticalAlign: element.style.verticalAlign }" v-html="element.propValue"></div>
    </div>
</template>
```

## Editor 编辑器

这个可以理解为画布的真正实现

```xml
<template>
    <div
        id="editor"
        class="editor"
        :class="{ edit: isEdit }"
        :style="{
            ...getCanvasStyle(canvasStyleData),
            width: changeStyleWithScale(canvasStyleData.width) + 'px',
            height: changeStyleWithScale(canvasStyleData.height) + 'px',
        }"
        @mousedown="handleMouseDown"
    >
        <!-- 网格线 -->
        <Grid />

        <!--页面组件列表展示-->
        <Shape
            v-for="(item, index) in componentData"
            :key="item.id"
            :default-style="item.style"
            :style="getShapeStyle(item.style)"
            :active="item.id === (curComponent || {}).id"
            :element="item"
            :index="index"
            :class="{ lock: item.isLock }"
        >

            <component
                :is="item.component"
                v-if="item.component.startsWith('SVG')"
                :id="'component' + item.id"
                :style="getSVGStyle(item.style)"
                class="component"
                :prop-value="item.propValue"
                :element="item"
                :request="item.request"
            />

            <component
                :is="item.component"
                v-else-if="item.component != 'VText'"
                :id="'component' + item.id"
                class="component"
                :style="getComponentStyle(item.style)"
                :prop-value="item.propValue"
                :element="item"
                :request="item.request"
            />

            <component
                :is="item.component"
                v-else
                :id="'component' + item.id"
                class="component"
                :style="getComponentStyle(item.style)"
                :prop-value="item.propValue"
                :element="item"
                :request="item.request"
                @input="handleInput"
            />
        </Shape>
    </div>
</template>
```

### 画布大小

最上方样式指定了画布的大小，可以在 Toolbar 中变化。

### Grid 网格线

```xml
<template>
    <svg
        class="grid"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <pattern
                id="smallGrid"
                width="7.236328125"
                height="7.236328125"
                patternUnits="userSpaceOnUse"
            >
                <path 
                    d="M 7.236328125 0 L 0 0 0 7.236328125" 
                    fill="none" 
                    stroke="rgba(207, 207, 207, 0.3)" 
                    stroke-width="1"
                >
                </path>
            </pattern>
            <pattern
                id="grid"
                width="36.181640625"
                height="36.181640625"
                patternUnits="userSpaceOnUse"
            >
                <rect width="36.181640625" height="36.181640625" fill="url(#smallGrid)"></rect>
                <path 
                    d="M 36.181640625 0 L 0 0 0 36.181640625" 
                    fill="none" 
                    stroke="rgba(186, 186, 186, 0.5)" 
                    stroke-width="1"
                >
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

基于 SVG 实现的，感觉比较巧妙。

### 组件渲染

shape 中是对 componentData 组件数组的渲染。

这个数组就是上面拖拽后变化的。

### shape 形状

```xml
<template>
    <div
        class="shape"
        :class="{ active }"
        @click="selectCurComponent"
        @mousedown="handleMouseDownOnShape"
    >
        <span v-show="isActive()" class="iconfont icon-xiangyouxuanzhuan" @mousedown="handleRotate"></span>
        <span v-show="element.isLock" class="iconfont icon-suo"></span>
        <div
            v-for="item in (isActive()? getPointList() : [])"
            :key="item"
            class="shape-point"
            :style="getPointStyle(item)"
            @mousedown="handleMouseDownOnPoint(item, $event)"
        >
        </div>
        <slot></slot>
    </div>
</template>
```

点击之后，出现的旋转按钮，和 8 个方向按钮。

便于后续实现放大缩小，旋转。

## 属性列表

```xml
<!-- 右侧属性列表 -->
<section class="right">
    <el-tabs v-if="curComponent" v-model="activeName">
        <el-tab-pane label="属性" name="attr">
            <component :is="curComponent.component + 'Attr'" />
        </el-tab-pane>
    </el-tabs>
    <CanvasAttr v-else></CanvasAttr>
</section>
```

### curComponent 当前组件

这个属性对象在很多地方会被改变，基于 vuex 的统一管理。

渲染为对应的属性。

#### VTextAttr

文本的属性示例：

```vue
<template>
    <div class="attr-list">
        <CommonAttr></CommonAttr>
        <el-form>
            <el-form-item label="内容">
                <el-input v-model="curComponent.propValue" type="textarea" :rows="3" />
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import CommonAttr from '@/custom-component/common/CommonAttr.vue'

export default {
    components: { CommonAttr },
    computed: {
        curComponent() {
            return this.$store.state.curComponent
        },
    },
}
</script>
```

#### CommonAttr 通用属性

通用属性。

```xml
<template>
    <div class="v-common-attr">
        <el-collapse v-model="activeName" accordion @change="onChange">
            <el-collapse-item title="通用样式" name="style">
                <el-form>
                    <el-form-item v-for="({ key, label }, index) in styleKeys" :key="index" :label="label">
                        <el-color-picker v-if="isIncludesColor(key)" v-model="curComponent.style[key]" show-alpha></el-color-picker>
                        <el-select v-else-if="selectKey.includes(key)" v-model="curComponent.style[key]">
                            <el-option
                                v-for="item in optionMap[key]"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            ></el-option>
                        </el-select>
                        <el-input v-else v-model.number="curComponent.style[key]" type="number" />
                    </el-form-item>
                </el-form>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>
```

### CanvasAttr 画布属性

如果没有选中任何组件，默认显示的是画布属性。

```xml
<template>
    <div class="attr-container">
        <p class="title">画布属性</p>
        <el-form style="padding: 20px;">
            <el-form-item v-for="(key, index) in Object.keys(options)" :key="index" :label="options[key]">
                <el-color-picker v-if="isIncludesColor(key)" v-model="canvasStyleData[key]" show-alpha></el-color-picker>
                <el-input v-else v-model.number="canvasStyleData[key]" type="number" />
            </el-form-item>
        </el-form>
    </div>
</template>
```


# 参考资料

https://blog.csdn.net/m0_60559048/article/details/123359788

* any list
{:toc}
