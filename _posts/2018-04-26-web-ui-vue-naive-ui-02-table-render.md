---
layout: post
title: Naive Ui-02-表格 n-data-table 如何将列渲染为可以跳转的信息 
date: 2024-05-07 21:01:55 +0800
categories: [Web]
tags: [web, vue, admin, sh]
published: true
---



# chat

## 需求

vue naive 前端中，如何将 n-data-table 中的一个 id 列，渲染为一个可以点击的链接。

点击后实现 `router.push({name: 'rule-info', params{id: $id}})` 的跳转效果。

## 实现

在 Vue Naive UI 中，要实现 `n-data-table` 的一个 `id` 列渲染为可点击的链接，并在点击后通过 `router.push` 实现页面跳转，你可以使用渲染函数（render function）来自定义单元格的内容。

以下是具体的实现步骤：

1. **定义路由**：首先确保你的 Vue 路由配置中有对应的路由定义。

例如，如果你要跳转到名为 `rule-info` 的页面，你的路由配置可能如下：

```javascript
{
  path: '/rule-info/:id',
  name: 'rule-info',
  component: () => import('@/views/RuleInfo.vue')
}
```

2. **自定义 `n-data-table` 的列**：使用 `render` 函数来自定义 `id` 列的内容，使其成为一个可点击的链接。

```html
<n-data-table :columns="columns" :data="data"></n-data-table>
```

3. **定义 `columns` 数组**：在 `columns` 数组中，为 `id` 列添加一个 `render` 函数，用于生成链接。

```javascript
import { h } from 'vue';
import { NButton } from 'naive-ui';

const columns = [
  // ... 其他列的配置
  {
    title: 'ID',
    key: 'id',
    render: (row) => {
      return h(NButton, {
        strong: true,
        onClick: () => {
          // 使用 router.push 实现跳转，传递 id 作为参数
          router.push({ name: 'rule-info', params: { id: row.id } });
        }
      }, `${row.id}`);
    }
  }
];
```

在上述代码中，我们使用了 `h` 函数来创建一个 `NButton` 组件，并通过 `onClick` 事件监听器来处理点击事件。

当按钮被点击时，`router.push` 方法会被调用，并且 `id` 作为参数传递给目标路由。

确保你的组件中已经正确导入了 `router` 对象，并且 `data` 是你的表格数据源。

这样，当用户点击 `id` 列时，就会跳转到 `rule-info` 页面，并且 `id` 作为参数传递给该页面。

# 参考资料

https://github.com/jekip/naive-ui-admin

* any list
{:toc}
