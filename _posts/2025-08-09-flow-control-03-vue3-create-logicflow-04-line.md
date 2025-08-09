---
layout: post
title: 流程控制-02-vue3项目创建流程引擎前端-04-支持连线和连线属性编辑
date: 2025-8-9 02:30:30 +0800
categories: [FLOW]
tags: [flow, vue3, flow-logic, sh]
published: true
---


# 节点选中后显示右侧属性面板

好！我们进入第4步：支持连线和连线属性编辑

好嘞！进入第4步，支持连线（Edge）以及连线属性编辑。

---

## 目标

* 允许用户在画布上拖拽连线连接节点（LogicFlow 默认支持连线交互）
* 监听连线选中事件，展示右侧「连线属性面板」
* 右侧属性面板可以编辑连线文本（label）或其他属性，实时更新画布

---

## 实现思路

### 1. 允许连线交互（默认开启）

LogicFlow 默认支持连线创建和编辑，无需额外配置。

---

### 2. 监听连线选中事件

LogicFlow 2.x 事件名是 `edge:click`，参数是连线数据对象。

```js
lf.on('edge:click', (edgeData) => {
  emit('edgeSelected', edgeData)
})
```

---

### 3. 在顶层组件增加状态区分：

* `selectedNode`（节点选中）
* `selectedEdge`（连线选中）

---

### 4. 属性面板支持节点和连线两种数据类型的显示与编辑

---

## 具体代码示范

### FlowCanvas.vue

```js
// 事件绑定
lf.on('node:click', (nodeData) => {
  emit('nodeSelected', nodeData)
})
lf.on('edge:click', (edgeData) => {
  emit('edgeSelected', edgeData)
})
lf.on('blank:click', () => {
  emit('nodeSelected', null)
  emit('edgeSelected', null)
})
```

---

### FlowEditor.vue

```vue
<script setup>
import { ref } from 'vue'
import NodePanel from './NodePanel.vue'
import FlowCanvas from './FlowCanvas.vue'
import PropertyPanel from './PropertyPanel.vue'

const draggedNode = ref(null)
const selectedNode = ref(null)
const selectedEdge = ref(null)
const lfInstance = ref(null)
const flowCanvasRef = ref(null)

function onDragStart(node) {
  draggedNode.value = node
}

function onNodeSelected(node) {
  selectedNode.value = node
  selectedEdge.value = null
}

function onEdgeSelected(edge) {
  selectedEdge.value = edge
  selectedNode.value = null
}

onMounted(() => {
  lfInstance.value = flowCanvasRef.value.getLogicFlow()
})
</script>

<template>
  <div class="flow-editor">
    <NodePanel @dragstart="onDragStart" />
    <FlowCanvas
      :draggedNode="draggedNode"
      @nodeSelected="onNodeSelected"
      @edgeSelected="onEdgeSelected"
      ref="flowCanvasRef"
    />
    <PropertyPanel
      :node="selectedNode"
      :edge="selectedEdge"
      :lfInstance="lfInstance"
    />
  </div>
</template>
```

---

### PropertyPanel.vue

```vue
<template>
  <div v-if="node">
    <h3>节点属性</h3>
    <label>文本：</label>
    <input v-model="nodeText" @blur="updateNodeText" />
    <!-- 你可以继续加节点其他属性 -->
  </div>

  <div v-else-if="edge">
    <h3>连线属性</h3>
    <label>文本：</label>
    <input v-model="edgeText" @blur="updateEdgeText" />
    <!-- 你可以继续加连线其他属性 -->
  </div>

  <div v-else>
    <p>请选中节点或连线查看属性</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  node: Object,
  edge: Object,
  lfInstance: Object,
})

const nodeText = ref('')
const edgeText = ref('')

watch(
  () => props.node,
  (newNode) => {
    if (newNode) {
      nodeText.value = newNode.text || ''
    } else {
      nodeText.value = ''
    }
  },
  { immediate: true }
)

watch(
  () => props.edge,
  (newEdge) => {
    if (newEdge) {
      edgeText.value = newEdge.text || ''
    } else {
      edgeText.value = ''
    }
  },
  { immediate: true }
)

function updateNodeText() {
  if (!props.node || !props.lfInstance) return
  const nodeModel = props.lfInstance.getNodeModelById(props.node.id)
  if (nodeModel) {
    nodeModel.setProperties({ text: nodeText.value })
    props.lfInstance.emit('model:change')
  }
}

function updateEdgeText() {
  if (!props.edge || !props.lfInstance) return
  const edgeModel = props.lfInstance.getEdgeModelById(props.edge.id)
  if (edgeModel) {
    edgeModel.setProperties({ text: edgeText.value })
    props.lfInstance.emit('model:change')
  }
}
</script>
```

---

## 总结

* 新增监听 `edge:click`，选中时把 `selectedEdge` 设值，清空 `selectedNode`
* 属性面板根据选中不同展示不同内容
* 通过 `getEdgeModelById` 和 `setProperties` 更新连线属性，触发 `model:change` 让界面刷新

---

需要我帮你写完整的组件代码吗？


# 参考资料

* any list
{:toc}