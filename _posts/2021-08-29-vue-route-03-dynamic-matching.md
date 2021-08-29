---
layout: post
title: Vue Router-03-带参数的动态路由匹配
date: 2021-08-29 21:01:55 +0800
categories: [VUE]
tags: [vue, vue-router, sh]
published: true
---

# 带参数的动态路由匹配

很多时候，我们需要将给定匹配模式的路由映射到同一个组件。

例如，我们可能有一个 User 组件，它应该对所有用户进行渲染，但用户 ID 不同。

在 Vue Router 中，我们可以在路径中使用一个动态段来实现，我们称之为 路径参数 ：

```js
const User = {
  template: '<div>User</div>',
}

// 这些都会传递给 `createRouter`
const routes = [
  // 动态段以冒号开始
  { path: '/users/:id', component: User },
]
```

现在像 /users/johnny 和 /users/jolyne 这样的 URL 都会映射到同一个路由。

路径参数 用冒号 `:` 表示。

当一个路由被匹配时，它的 params 的值将在每个组件中以 this.$route.params 的形式暴露出来。

因此，我们可以通过更新 User 的模板来呈现当前的用户 ID：

```js
const User = {
  template: '<div>User {{ $route.params.id }}</div>',
}
```

你可以在同一个路由中设置有多个 路径参数，它们会映射到 $route.params 上的相应字段。

例如：

| 匹配模式	| 匹配路径	| $route.params |
|:----|:----|:----|
| /users/:username	| /users/eduardo	|  { username: 'eduardo' } |
| /users/:username/posts/:postId	|  /users/eduardo/posts/123	 | { username: 'eduardo', postId: '123' } |

除了 $route.params 之外，$route 对象还公开了其他有用的信息，如 $route.query（如果 URL 中存在参数）、$route.hash 等。

你可以在 API 参考中查看完整的细节。

这个例子的 demo 可以在这里找到。

# 响应路由参数的变化

使用带有参数的路由时需要注意的是，当用户从 /users/johnny 导航到 /users/jolyne 时，相同的组件实例将被重复使用。

因为两个路由都渲染同个组件，比起销毁再创建，复用则显得更加高效。

不过，这也意味着组件的生命周期钩子不会被调用。

要对同一个组件中参数的变化做出响应的话，你可以简单地 watch $route 对象上的任意属性，在这个场景中，就是 $route.params ：

```js
const User = {
  template: '...',
  created() {
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        // 对路由变化做出响应...
      }
    )
  },
}
```

或者，使用 beforeRouteUpdate 导航守卫，它也可以取消导航：

```js
const User = {
  template: '...',
  async beforeRouteUpdate(to, from) {
    // 对路由变化做出响应...
    this.userData = await fetchUser(to.params.id)
  },
}
```

# 捕获所有路由或 404 Not found 路由

常规参数只匹配 url 片段之间的字符，用 `/` 分隔。

如果我们想匹配任意路径，我们可以使用自定义的 路径参数 正则表达式，在 路径参数 后面的括号中加入 正则表达式 :

```js
const routes = [
  // 将匹配所有内容并将其放在 `$route.params.pathMatch` 下
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  // 将匹配以 `/user-` 开头的所有内容，并将其放在 `$route.params.afterUser` 下
  { path: '/user-:afterUser(.*)', component: UserGeneric },
]
```

在这个特定的场景中，我们在括号之间使用了自定义正则表达式，并将pathMatch 参数标记为可选可重复。

这样做是为了让我们在需要的时候，可以通过将 path 拆分成一个数组，直接导航到路由：

更多内容请[参见重复参数部分](https://next.router.vuejs.org/zh/guide/essentials/route-matching-syntax.html#%E5%8F%AF%E9%87%8D%E5%A4%8D%E7%9A%84%E5%8F%82%E6%95%B0)。

如果你正在使用[历史模式](https://next.router.vuejs.org/zh/guide/essentials/history-mode.html)，请务必按照说明正确配置你的服务器。

# 高级匹配模式

Vue Router 使用自己的路径匹配语法，其灵感来自于 express，因此它支持许多高级匹配模式，如可选的参数，零或多个 / 一个或多个，甚至自定义的正则匹配规则。

请查看[高级匹配](https://next.router.vuejs.org/zh/guide/essentials/route-matching-syntax.html)文档来探索它们。

# 参考资料

https://next.router.vuejs.org/zh/guide/essentials/dynamic-matching.html

* any list
{:toc}