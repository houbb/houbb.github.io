---
layout: post
title: Vue Router-07-命名路由
date: 2021-08-29 21:01:55 +0800
categories: [VUE]
tags: [vue, vue-router, sh]
published: true
---

# 命名路由

除了 path 之外，你还可以为任何路由提供 name。

这有以下优点：

- 没有硬编码的 URL

- params 的自动编码/解码。

- 防止你在 url 中出现打字错误。

- 绕过路径排序（如显示一个）

```js
const routes = [
  {
    path: '/user/:username',
    name: 'user',
    component: User
  }
]
```

要链接到一个命名的路由，可以向 router-link 组件的 to 属性传递一个对象：

```xml
<router-link :to="{ name: 'user', params: { username: 'erina' }}">
  User
</router-link>
```

这跟代码调用 router.push() 是一回事：

```js
router.push({ name: 'user', params: { username: 'erina' } })
```

在这两种情况下，路由将导航到路径 /user/erina。

完整的例子[这里](https://github.com/vuejs/vue-router/blob/dev/examples/named-routes/app.js).

# 参考资料

https://next.router.vuejs.org/zh/guide/essentials/named-routes.html

* any list
{:toc}