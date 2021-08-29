---
layout: post
title: Vue Router-12-导航守卫
date: 2021-08-29 21:01:55 +0800
categories: [VUE]
tags: [vue, vue-router, sh]
published: true
---

# 导航守卫

正如其名，vue-router 提供的导航守卫主要用来通过跳转或取消的方式守卫导航。

这里有很多方式植入路由导航中：全局的，单个路由独享的，或者组件级的。

# 全局前置守卫

你可以使用 router.beforeEach 注册一个全局前置守卫：

```js
const router = createRouter({ ... })

router.beforeEach((to, from) => {
  // ...
  // 返回 false 以取消导航
  return false
})
```

当一个导航触发时，全局前置守卫按照创建顺序调用。

守卫是异步解析执行，此时导航在所有守卫 resolve 完之前**一直处于等待中**。

每个守卫方法接收两个参数：

1. to: 即将要进入的目标 用一种标准化的方式

2. from: 当前导航正要离开的路由 用一种标准化的方式

可以返回的值如下:

1. false: 取消当前的导航。如果浏览器的 URL 改变了(可能是用户手动或者浏览器后退按钮)，那么 URL 地址会重置到 from 路由对应的地址。

2. 一个路由地址: 通过一个路由地址跳转到一个不同的地址，就像你调用 router.push() 一样，你可以设置诸如 replace: true 或 name: 'home' 之类的配置。当前的导航被中断，然后进行一个新的导航，就和 from 一样。

如果遇到了意料之外的情况，可能会抛出一个 Error。这会取消导航并且调用 router.onError() 注册过的回调。

如果什么都没有，undefined 或返回 true，则导航是有效的，并调用下一个导航守卫

以上所有都同 async 函数 和 Promise 工作方式一样：

```js
router.beforeEach(async (to, from) => {
  // canUserAccess() 返回 `true` 或 `false`
  return await canUserAccess(to)
})
```

## 可选的第三个参数 next

在之前的 Vue Router 版本中，也是可以使用 第三个参数 next 的。

这是一个常见的错误来源，可以通过 RFC 来消除错误。

然而，它仍然是被支持的，这意味着你可以向任何导航守卫传递第三个参数。

在这种情况下，确保 next 在任何给定的导航守卫中都被严格调用一次。它可以出现多于一次，但是只能在所有的逻辑路径都不重叠的情况下，否则钩子永远都不会被解析或报错。

这里有一个在用户未能验证身份时重定向到/login的错误用例：

```js
// BAD
router.beforeEach((to, from, next) => {
  if (to.name !== 'Login' && !isAuthenticated) next({ name: 'Login' })
  // 如果用户未能验证身份，则 `next` 会被调用两次
  next()
})
```

下面是正确的版本:

```js
// GOOD
router.beforeEach((to, from, next) => {
  if (to.name !== 'Login' && !isAuthenticated) next({ name: 'Login' })
  else next()
})
```

# 全局解析守卫

你可以用 router.beforeResolve 注册一个全局守卫。

这和 router.beforeEach 类似，因为它在 每次导航时都会触发，但是确保在导航被确认之前，同时在所有组件内守卫和异步路由组件被解析之后，解析守卫就被正确调用。

这里有一个例子，确保用户可以访问 [自定义 meta 属性](https://next.router.vuejs.org/zh/guide/advanced/meta.html) requiresCamera 的路由：

```js
router.beforeResolve(async to => {
  if (to.meta.requiresCamera) {
    try {
      await askForCameraPermission()
    } catch (error) {
      if (error instanceof NotAllowedError) {
        // ... 处理错误，然后取消导航
        return false
      } else {
        // 意料之外的错误，取消导航并把错误传给全局处理器
        throw error
      }
    }
  }
})
```

router.beforeResolve 是获取数据或执行任何其他操作（如果用户无法进入页面时你希望避免执行的操作）的理想位置。

# 全局后置钩子

你也可以注册全局后置钩子，然而和守卫不同的是，这些钩子不会接受 next 函数也不会改变导航本身：

```js
router.afterEach((to, from) => {
  sendToAnalytics(to.fullPath)
})
```

它们对于分析、更改页面标题、声明页面等辅助功能以及许多其他事情都很有用。

它们也反映了 navigation failures 作为第三个参数：

```js
router.afterEach((to, from, failure) => {
  if (!failure) sendToAnalytics(to.fullPath)
})
```

了解更多关于 navigation failures 的信息在[它的指南](https://next.router.vuejs.org/zh/guide/advanced/navigation-failures.html)中。

# 路由独享的守卫

你可以直接在路由配置上定义 beforeEnter 守卫：

```js
const routes = [
  {
    path: '/users/:id',
    component: UserDetails,
    beforeEnter: (to, from) => {
      // reject the navigation
      return false
    },
  },
]
```

beforeEnter 守卫 只在进入路由时触发，不会在 params、query 或 hash 改变时触发。

例如，从 /users/2 进入到 /users/3 或者从 /users/2#info 进入到 /users/2#projects。它们只有在 从一个不同的 路由导航时，才会被触发。

你也可以将一个函数数组传递给 beforeEnter，这在为不同的路由重用守卫时很有用：

```js
function removeQueryParams(to) {
  if (Object.keys(to.query).length)
    return { path: to.path, query: {}, hash: to.hash }
}

function removeHash(to) {
  if (to.hash) return { path: to.path, query: to.query, hash: '' }
}

const routes = [
  {
    path: '/users/:id',
    component: UserDetails,
    beforeEnter: [removeQueryParams, removeHash],
  },
  {
    path: '/about',
    component: UserDetails,
    beforeEnter: [removeQueryParams],
  },
]
```

请注意，你也可以通过使用[路径 meta 字段](https://next.router.vuejs.org/zh/guide/advanced/meta.html)和[全局导航守卫](https://next.router.vuejs.org/zh/guide/advanced/navigation-guards.html#global-before-guards)来实现类似的行为。

# 组件内的守卫

最后，你可以在路由组件内直接定义路由导航守卫(传递给路由配置的)

## 可用的配置 API

你可以为路由组件添加以下配置：

- beforeRouteEnter

- beforeRouteUpdate

- beforeRouteLeave

```js
const UserDetails = {
  template: `...`,
  beforeRouteEnter(to, from) {
    // 在渲染该组件的对应路由被验证前调用
    // 不能获取组件实例 `this` ！
    // 因为当守卫执行时，组件实例还没被创建！
  },
  beforeRouteUpdate(to, from) {
    // 在当前路由改变，但是该组件被复用时调用
    // 举例来说，对于一个带有动态参数的路径 `/users/:id`，在 `/users/1` 和 `/users/2` 之间跳转的时候，
    // 由于会渲染同样的 `UserDetails` 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
    // 因为在这种情况发生的时候，组件已经挂载好了，导航守卫可以访问组件实例 `this`
  },
  beforeRouteLeave(to, from) {
    // 在导航离开渲染该组件的对应路由时调用
    // 与 `beforeRouteUpdate` 一样，它可以访问组件实例 `this`
  },
}
```

beforeRouteEnter 守卫 不能 访问 this，因为守卫在导航确认前被调用，因此即将登场的新组件还没被创建。

不过，你可以通过传一个回调给 next 来访问组件实例。

在导航被确认的时候执行回调，并且把组件实例作为回调方法的参数：

```js
beforeRouteEnter (to, from, next) {
  next(vm => {
    // 通过 `vm` 访问组件实例
  })
}
```

注意 beforeRouteEnter 是支持给 next 传递回调的唯一守卫。

对于 beforeRouteUpdate 和 beforeRouteLeave 来说，this 已经可用了，所以不支持 传递回调，因为没有必要了：

```js
beforeRouteUpdate (to, from) {
  // just use `this`
  this.name = to.params.name
}
```

这个 离开守卫 通常用来预防用户在还未保存修改前突然离开。

该导航可以通过返回 false 来取消。

```js
beforeRouteLeave (to, from) {
  const answer = window.confirm('Do you really want to leave? you have unsaved changes!')
  if (!answer) return false
}
```

ps: 这个挺有用的！适合表单编辑等页面。

## 使用组合 API

如果你正在使用 [组合 API 和 setup 函数](https://v3.vuejs.org/guide/composition-api-setup.html#setup)来编写组件，你可以通过 onBeforeRouteUpdate 和 onBeforeRouteLeave 分别添加 update 和 leave 守卫。 

请参考[组合 API 部分](https://next.router.vuejs.org/zh/guide/advanced/composition-api.html#%E5%AF%BC%E8%88%AA%E5%AE%88%E5%8D%AB)以获得更多细节。

# 完整的导航解析流程

- 导航被触发。

- 在失活的组件里调用 beforeRouteLeave 守卫。

- 调用全局的 beforeEach 守卫。

- 在重用的组件里调用 beforeRouteUpdate 守卫(2.2+)。

- 在路由配置里调用 beforeEnter。

- 解析异步路由组件。

- 在被激活的组件里调用 beforeRouteEnter。

- 调用全局的 beforeResolve 守卫(2.5+)。

- 导航被确认。

- 调用全局的 afterEach 钩子。

- 触发 DOM 更新。

- 调用 beforeRouteEnter 守卫中传给 next 的回调函数，创建好的组件实例会作为回调函数的参数传入。

# 参考资料

https://next.router.vuejs.org/zh/guide/advanced/navigation-guards.html

* any list
{:toc}