---
layout: post
title: 流程控制-02-vue3项目创建流程引擎前端-02-左侧节点面板拖拽到画布！
date: 2025-8-9 02:30:30 +0800
categories: [FLOW]
tags: [flow, vue3, flow-logic, sh]
published: true
---


# 实现左侧节点面板，

可以拖拽节点到 LogicFlow 画布上，完成**拖拽新增节点**的核心交互。

---

# Step 2：左侧节点面板拖拽新增节点

---

## 2.1 设计思路

* 左侧面板列出可用的节点类型
* 支持鼠标拖拽节点名称到画布
* 放开时，画布在鼠标释放点创建对应节点

---

## 2.2 修改 `FlowEditor.vue`，实现完整左右布局

```vue
{% raw %}
<template>
  <div class="flow-editor">
    <!-- 左侧节点面板 -->
    <div class="node-panel">
      <div
        class="node-item"
        v-for="node in nodeList"
        :key="node.type"
        draggable="true"
        @dragstart="onDragStart(node)"
      >
        {{ node.label }}
      </div>
    </div>

    <!-- 中间画布 -->
    <div
      ref="lfContainer"
      class="flow-canvas"
      @dragover.prevent
      @drop="onDrop"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import LogicFlow from '@logicflow/core'
import '@logicflow/core/dist/index.css'

const lfContainer = ref(null)
let lf = null
const draggedNode = ref(null) // 拖拽中节点数据

// 定义可拖拽节点列表
const nodeList = [
  { type: 'rect', label: '矩形节点' },
  { type: 'circle', label: '圆形节点' },
  // 可以继续扩展节点类型
]

onMounted(() => {
  lf = new LogicFlow({
    container: lfContainer.value,
    width: 800,
    height: 600,
  })
  lf.render()
})

onBeforeUnmount(() => {
  lf && lf.destroy()
  lf = null
})

function onDragStart(node) {
  draggedNode.value = node
}

function onDrop(event) {
  event.preventDefault()
  if (!draggedNode.value) return

  // 计算画布内放置点坐标
  // LogicFlow 容器左上角相对页面的偏移
  const rect = lfContainer.value.getBoundingClientRect()

  // 画布坐标 = 鼠标坐标 - 容器左上角坐标
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  lf.addNode({
    id: `node_${Date.now()}`, // 唯一ID
    type: draggedNode.value.type,
    x,
    y,
    text: draggedNode.value.label,
  })

  draggedNode.value = null
}
</script>

<style scoped>
.flow-editor {
  display: flex;
  gap: 16px;
  padding: 12px;
}

/* 左侧节点面板 */
.node-panel {
  width: 160px;
  border: 1px solid #ccc;
  padding: 8px;
  background: #f9f9f9;
  user-select: none;
}

.node-item {
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #aaa;
  border-radius: 4px;
  cursor: grab;
  background: white;
  text-align: center;
}

.node-item:active {
  cursor: grabbing;
}

/* 画布 */
.flow-canvas {
  flex: 1;
  border: 1px solid #ddd;
  height: 600px;
  background: #fff;
}
</style>
{% endraw %}
```

---

## 2.3 说明

* 左侧 `node-panel` 列出两种基础节点，支持拖拽
* 中间画布支持 `dragover` 和 `drop` 事件，计算准确放置点
* 放下时调用 LogicFlow 的 `addNode` 动态添加新节点

---

## 2.4 你运行看看效果

* 拖拽左侧“矩形节点”或“圆形节点”到画布
* 松开鼠标画布上出现对应节点
* 节点可以拖拽移动

---

这一步是整个流程编辑器最关键的交互，做完后我们就能自由新增节点啦！

---

确认没问题我帮你做下一步：**节点选中后显示右侧属性面板**，方便配置参数。你觉得？





# 参考资料

* any list
{:toc}