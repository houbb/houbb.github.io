---
layout: post
title: Vue Router 是 Vue.js 的官方路由。它与 Vue.js 核心深度集成，让用 Vue.js 构建单页应用变得轻而易举
date: 2024-05-07 21:01:55 +0800
categories: [Web]
tags: [web, vue, vue-router, sh]
published: true
---

# Vue Router

Vue Router 是 Vue.js 的官方路由。

它与 Vue.js 核心深度集成，让用 Vue.js 构建单页应用变得轻而易举。

功能包括：

- 嵌套路由映射

- 动态路由选择

- 模块化、基于组件的路由配置

- 路由参数、查询、通配符

- 展示由 Vue.js 的过渡系统提供的过渡效果

- 细致的导航控制

- 自动激活 CSS 类的链接

- HTML5 history 模式或 hash 模式

- 可定制的滚动行为

- URL 的正确编码

# chat

## 详细介绍一下 vue-router

Vue Router 是 Vue.js 的官方路由管理器，它允许你为单页应用程序创建页面路由。

使用 Vue Router，你可以定义不同的路由，为用户导航到不同的视图，同时保持应用程序的单页特性。以下是 Vue Router 的一些核心特性：

1. **动态路由**：Vue Router 允许你定义动态路由，即路由的某些部分可以作为变量。

2. **嵌套路由**：支持嵌套的路由，这意味着你可以将一个 Vue 组件作为另一个组件的子路由。

3. **路由参数**：可以捕获 URL 中的参数，并在你的 Vue 组件中使用这些参数。

4. **查询参数**：Vue Router 可以解析和使用 URL 查询字符串参数。

5. **视图切换**：支持使用 `<router-view>` 组件在不同路由之间动态切换视图。

6. **编程式导航**：除了在模板中使用 `<router-link>` 进行声明式导航外，Vue Router 还支持编程式导航。

7. **滚动行为**：可以自定义滚动行为，例如在路由切换后滚动到顶部或保持原先的滚动位置。

8. **路由守卫**：Vue Router 提供了路由守卫（钩子），允许你在路由变化前或变化后执行某些逻辑。

9. **命名视图**：支持定义命名视图，可以在单个路由中显示多个视图，有助于布局的复用。

10. **官方支持**：作为 Vue.js 的官方路由管理器，Vue Router 与 Vue.js 紧密集成，确保了良好的兼容性和性能。

11. **模块化**：Vue Router 支持模块化，可以根据需要导入和使用。

12. **TypeScript 支持**：Vue Router 支持 TypeScript，提供了类型定义文件，方便开发者进行类型检查和自动完成。

使用 Vue Router 的基本步骤通常包括：

1. **安装**：通过 npm 或 yarn 安装 Vue Router。

   ```bash
   npm install vue-router
   ```

2. **创建路由**：定义路由对象，描述不同的 URL 路径和对应的 Vue 组件。

   ```javascript
   const routes = [
     {
       path: '/',
       component: Home,
     },
     {
       path: '/about',
       component: About,
     },
   ];
   ```

3. **创建 Router 实例**：创建 `VueRouter` 实例并传入 `routes`。

   ```javascript
   const router = new VueRouter({
     routes,
   });
   ```

4. **配置 Vue 实例**：在 Vue 应用实例中使用 `router` 配置项。

   ```javascript
   new Vue({
     router,
     render: h => h(App),
   }).$mount('#app');
   ```

5. **使用 `<router-view>`**：在应用的模板中使用 `<router-view>` 标签来显示当前路由对应的组件。

   ```vue
   <template>
     <div id="app">
       <router-view></router-view>
     </div>
   </template>
   ```

6. **使用 `<router-link>`**：在模板中使用 `<router-link>` 组件来创建导航链接。

   ```vue
   <template>
     <div id="app">
       <router-link to="/">Home</router-link>
       <router-link to="/about">About</router-link>
     </div>
   </template>
   ```

7. **编程式导航**：在 JavaScript 代码中使用 `router.push` 或 `router.replace` 进行导航。

   ```javascript
   router.push('/about');
   ```

Vue Router 是构建单页应用程序的强大工具，它通过提供灵活的路由系统，帮助开发者创建复杂且用户友好的应用程序。


# 参考资料

https://github.com/jekip/naive-ui-admin

* any list
{:toc}
