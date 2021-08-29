---
layout: post
title: Vue Router-16-过渡动效
date: 2021-08-29 21:01:55 +0800
categories: [VUE]
tags: [vue, vue-router, sh]
published: true
---

# 过渡动效

想要在你的路径组件上使用转场，并对导航进行动画处理，你需要使用 v-slot API：

```xml
<router-view v-slot="{ Component }">
  <transition name="fade">
    <component :is="Component" />
  </transition>
</router-view>
```

Transition 的所有功能 在这里同样适用。

# 单个路由的过渡

上面的用法会对所有的路由使用相同的过渡。

如果你想让每个路由的组件有不同的过渡，你可以将元信息和动态的 name 结合在一起，放在 `<transition>` 上：

```js
const routes = [
  {
    path: '/custom-transition',
    component: PanelLeft,
    meta: { transition: 'slide-left' },
  },
  {
    path: '/other-transition',
    component: PanelRight,
    meta: { transition: 'slide-right' },
  },
]
```

```xml
<router-view v-slot="{ Component, route }">
  <!-- 使用任何自定义过渡和回退到 `fade` -->
  <transition :name="route.meta.transition || 'fade'">
    <component :is="Component" />
  </transition>
</router-view>
```

# 基于路由的动态过渡

也可以根据目标路由和当前路由之间的关系，动态地确定使用的过渡。

使用和刚才非常相似的片段：

```xml
<!-- 使用动态过渡名称 -->
<router-view v-slot="{ Component, route }">
  <transition :name="route.meta.transition">
    <component :is="Component" />
  </transition>
</router-view>
```

我们可以添加一个 [after navigation hook](https://next.router.vuejs.org/zh/guide/advanced/navigation-guards.html#%E5%85%A8%E5%B1%80%E5%90%8E%E7%BD%AE%E9%92%A9%E5%AD%90)，根据路径的深度动态添加信息到 meta 字段。

```js
router.afterEach((to, from) => {
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length
  to.meta.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
})
```


# 参考资料

https://next.router.vuejs.org/zh/guide/advanced/transitions.html

* any list
{:toc}