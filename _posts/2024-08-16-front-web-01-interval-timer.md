---
layout: post
title: 前端如何设置定时触发查询？setInterval
date: 2024-08-05 21:01:55 +0800
categories: [Web]
tags: [web, front, js, sh]
published: true
---

# chat

## 前端 vue，如何设置定时触发一个查询方法？

在 Vue.js 中，你可以使用 JavaScript 的 `setInterval` 方法来设置定时触发一个查询方法。你可以将这个定时器放在 Vue 组件的生命周期钩子 `mounted` 中，这样当组件被挂载到 DOM 上后，定时器就会开始运行。

以下是一个简单的示例：

```javascript
<template>
  <div>
    <!-- 你的组件模板 -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      timer: null,  // 保存定时器的引用
    };
  },
  methods: {
    queryMethod() {
      // 这是你要定时执行的查询方法
      console.log("查询方法被触发");
      // 在这里编写你的查询逻辑
    }
  },
  mounted() {
    // 组件挂载后，设置定时器，每隔5秒执行一次 queryMethod
    this.timer = setInterval(this.queryMethod, 5000);
  },
  beforeDestroy() {
    // 在组件销毁前清除定时器，避免内存泄漏
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
};
</script>

<style scoped>
/* 你的组件样式 */
</style>
```

### 关键点说明：
1. **`mounted` 钩子**：在组件挂载到 DOM 之后执行一次，可以用来初始化定时器。
2. **`beforeDestroy` 钩子**：在组件销毁之前清除定时器，以避免内存泄漏或其他问题。
3. **`setInterval`**：用于设置定时器，按指定时间间隔（以毫秒为单位）重复执行一个函数。

通过这种方式，你可以定期触发一个查询方法，执行相应的操作。

## 改成 ts 语法

使用 TypeScript 编写的 Vue 组件代码如下：

```typescript
<template>
  <div>
    <!-- 你的组件模板 -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      timer: null as number | null, // 定时器的引用，类型为 number 或 null
    };
  },
  methods: {
    queryMethod(): void {
      // 这是你要定时执行的查询方法
      console.log("查询方法被触发");
      // 在这里编写你的查询逻辑
    }
  },
  mounted() {
    // 组件挂载后，设置定时器，每隔5秒执行一次 queryMethod
    this.timer = window.setInterval(this.queryMethod, 5000);
  },
  beforeUnmount() {
    // 在组件销毁前清除定时器，避免内存泄漏
    if (this.timer !== null) {
      clearInterval(this.timer);
    }
  }
});
</script>

<style scoped>
/* 你的组件样式 */
</style>
```

### 关键点说明：
1. **`lang="ts"`**：指定脚本语言为 TypeScript。
2. **`defineComponent`**：在使用 TypeScript 时，推荐使用 `defineComponent` 函数来定义组件，以获得更好的类型推断。
3. **类型声明**：
   - `timer` 被声明为 `number | null`，因为 `setInterval` 返回一个 `number`，在清除定时器之前它可能是 `null`。
   - `queryMethod` 方法的返回类型为 `void`，表示这个方法不返回任何值。

   


# 参考资料

* any list
{:toc}