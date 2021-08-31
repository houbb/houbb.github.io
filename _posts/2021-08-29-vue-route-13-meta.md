---
layout: post
title: Vue Router-13-元信息
date: 2021-08-29 21:01:55 +0800
categories: [VUE]
tags: [vue, vue-router, sh]
published: true
---

# 路由元信息

有时，你可能希望将任意信息附加到路由上，如过渡名称、谁可以访问路由等。

这些事情可以通过接收属性对象的meta属性来实现，并且它可以在路由地址和导航守卫上都被访问到。

定义路由的时候你可以这样配置 meta 字段：

```js
const routes = [
  {
    path: '/posts',
    component: PostsLayout,
    children: [
      {
        path: 'new',
        component: PostsNew,
        // 只有经过身份验证的用户才能创建帖子
        meta: { requiresAuth: true }
      },
      {
        path: ':id',
        component: PostsDetail
        // 任何人都可以阅读文章
        meta: { requiresAuth: false }
      }
    ]
  }
]
```

那么如何访问这个 meta 字段呢？

首先，我们称呼 routes 配置中的每个路由对象为 路由记录。路由记录可以是嵌套的，因此，当一个路由匹配成功后，它可能匹配多个路由记录。

例如，根据上面的路由配置，/posts/new 这个 URL 将会匹配父路由记录 (path: '/posts') 以及子路由记录 (path: 'new')。

一个路由匹配到的所有路由记录会暴露为 $route 对象(还有在导航守卫中的路由对象)的$route.matched 数组。我们需要遍历这个数组来检查路由记录中的 meta 字段，但是 Vue Router 还为你提供了一个 $route.meta 方法，它是一个非递归合并所有 meta 字段的（从父字段到子字段）的方法。

这意味着你可以简单地写

```js
router.beforeEach((to, from) => {
  // 而不是去检查每条路由记录
  // to.matched.some(record => record.meta.requiresAuth)
  if (to.meta.requiresAuth && !auth.isLoggedIn()) {
    // 此路由需要授权，请检查是否已登录
    // 如果没有，则重定向到登录页面
    return {
      path: '/login',
      // 保存我们所在的位置，以便以后再来
      query: { redirect: to.fullPath },
    }
  }
})
```

// ps: 可以在 login 之后判断，更新对应的 `auth.isLoggedIn()` 状态为 true。也可以节点的结合 token 判断。

# TypeScript

可以通过扩展 RouteMeta 接口来输入 meta 字段：

```js
// typings.d.ts or router.ts
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    // 是可选的
    isAdmin?: boolean
    // 每个路由都必须声明
    requiresAuth: boolean
  }
}
```

# 参考资料

https://next.router.vuejs.org/zh/guide/advanced/meta.html

* any list
{:toc}