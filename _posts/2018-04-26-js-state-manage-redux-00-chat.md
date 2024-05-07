---
layout: post
title:  Redux 状态管理工具
date:  2018-07-05 21:01:28 +0800
categories: [Tool]
tags: [tool, redux, state, sh]
published: true
---

# chat

## 详细介绍下 Redux

Redux 是一个流行的 JavaScript 状态管理库，最初由 Dan Abramov 在 2015 年创建，常用于 React 应用程序，但也可用于任何其他 JavaScript 框架或无框架 JavaScript 代码中。Redux 的设计哲学是为应用程序状态提供一个可预测化的单向数据流。

以下是 Redux 的一些核心概念和特性：

1. **单一数据源**：Redux 应用的 state 被存储在一个单一的 object tree 中，这个 object tree 由一个单一的 store 持有。

2. **状态是只读的**：唯一改变 state 的方法是 dispatch 一个 action，action 是一个描述发生事情类型的普通对象。

3. **reducers 是纯函数**：要改变 state，你需要编写 reducers，它们接受当前 state 和 action，并返回新的 state。Reducers 是纯函数，这意味着在不改变输入参数的情况下，对于相同的输入总是返回相同的输出。

4. **Middleware**：Redux 中间件允许你编写代码在 dispatch 之前或之后运行，可以用来处理异步逻辑、日志、调试工具、声明式副作用等。

5. **DevTools**：Redux DevTools 是一个时序的调试工具，可以查看不同时间点的 state，以及由 action 触发的 state 变化。

## 使用步骤

Redux 的工作流程通常包括以下几个步骤：

1. **创建 Store**：使用 `createStore` 函数创建 Redux store，它接受一个 reducer 函数作为参数。

   ```javascript
   const store = createStore(reducer, preloadedState, enhancer);
   ```

2. **编写 Reducers**：编写一个或多个 reducer 函数，这些函数根据 action 的类型返回新状态。

   ```javascript
   function counterReducer(state = { count: 0 }, action) {
     switch (action.type) {
       case 'increment':
         return { count: state.count + 1 };
       // ... other cases
       default:
         return state;
     }
   }
   ```

3. **创建 Actions**：定义 action 创建函数，返回一个包含 `type` 属性的 action 对象，也可以包含其他数据。

   ```javascript
   function increment() {
     return { type: 'increment' };
   }
   ```

4. **Dispatch Actions**：从应用程序代码中 dispatch action，触发 state 的更改。

   ```javascript
   store.dispatch(increment());
   ```

5. **Subscribe to Store**：监听 store，当 state 更改时执行一些操作，比如渲染 UI。

   ```javascript
   const unsubscribe = store.subscribe(() => {
     const state = store.getState();
     // 更新 UI
   });
   ```

6. **Provider 和 Connect**：在 React 中，使用 `Provider` 组件包装应用，使其下的组件能够访问到 Redux store。使用 `connect` 函数将 React 组件连接到 Redux store，实现数据和行为的同步。

Redux 通过提供一个可预测的状态管理方案，使得在大型复杂的前端应用中协作和调试变得更加容易。Redux 也因其强大的中间件系统和 DevTools 支持而受到开发者的喜爱。尽管 Redux 在小型项目中可能显得过于复杂，但在需要多人协作的大型项目中，Redux 可以提供很大帮助。

## 为什么需要 redux

Redux 作为一个广泛使用的状态管理库，其需求主要基于以下几个原因：

1. **可预测的状态管理**：Redux 通过集中式存储和单向数据流，使得应用的状态变化变得可预测和易于管理。

2. **简化大型应用**：在大型应用中，Redux 有助于组织和维护组件之间的状态，特别是对于那些跨组件共享的状态。

3. **调试友好**：Redux 提供了强大的调试工具，如 Redux DevTools，它允许开发者跟踪 action 的分派，查看状态变更历史，并在出错时回滚到之前的状态。

4. **异步逻辑处理**：Redux 中间件如 Redux Thunk 或 Redux Saga 可以轻松处理异步逻辑，如 API 调用，而不会使得应用逻辑变得复杂。

5. **代码可维护性**：Redux 的 reducer 必须是纯函数，这强制开发者遵循函数编程的一些原则，从而提高代码的可维护性。

6. **社区和生态系统**：Redux 拥有一个活跃的社区和丰富的生态系统，提供了大量的扩展库和工具，如 React-Redux、Redux-Form 等。

7. **跨框架使用**：Redux 不仅限于 React，它可以与任何使用 JavaScript 的前端框架或库一起使用，甚至是无框架的 JavaScript 应用。

8. **模块化和可扩展性**：Redux 允许将应用状态分割成多个模块，每个模块有自己的 reducer，这有助于构建模块化和可扩展的应用程序。

9. **性能优化**：Redux 通过只更新变化的部分状态（而不是整个状态树）来优化性能，这在处理大型状态树时尤其有用。

10. **状态序列化**：Redux 状态可以方便地被序列化和反序列化，这对于本地存储、网络传输或服务器端渲染非常有用。

11. **无状态的 UI 组件**：Redux 鼓励将 UI 组件保持无状态，状态只存在于 store 中，这使得组件更容易理解和测试。

12. **服务器端渲染**：Redux 可以与服务器端渲染（SSR）技术很好地结合，提高首屏加载性能和搜索引擎优化（SEO）。

13. **跨组件共享数据**：Redux 提供了一个集中的 store 来共享数据，避免了在组件之间通过 props 手动传递数据的繁琐。

14. **结构清晰**：Redux 的结构清晰，易于新开发者理解和上手，有助于团队协作。

尽管 Redux 在小型项目中可能显得过于复杂，但在需要多人协作的大型项目中，Redux 可以提供很大帮助，确保应用状态管理的一致性和可维护性。

## 没有这种状态管理框架之前，状态一般是如何管理的?

在 Redux 等现代状态管理框架出现之前，状态管理主要依赖于以下几种方法：

1. **全局变量**：在 JavaScript 中，全局变量可以被访问和修改，因此它们被用来存储和管理状态。

2. **闭包**：使用闭包来创建私有状态，通过函数返回值来更新状态。

3. **事件系统**：通过自定义事件来在组件之间传递消息，从而间接管理状态。

4. **回调函数**：使用回调函数在组件之间传递状态更新。

5. **发布/订阅模式**：实现一个简单的发布/订阅系统，组件可以发布消息，其他组件订阅这些消息来更新状态。

6. **纯组件**：在 React 中，通过编写纯组件（没有内部状态的组件）来避免状态管理的复杂性。

7. **继承**：在类组件中，通过继承来共享状态和行为。

8. **混入（Mixins）**：在 React 早期版本中，混入是一种在多个组件间共享行为的方式。

9. **设计模式**：使用如观察者模式等设计模式来管理状态。

10. **状态模式**：使用状态模式来管理对象在其内部状态发生改变时的行为。

11. **服务层**：在服务层中管理状态，然后通过 API 将状态传递给视图层。

12. **双向数据绑定**：使用如 Angular 1.x 这样的框架，它们提供了双向数据绑定来自动同步模型和视图的状态。

13. **手动状态迁移**：在表单中，开发者需要手动处理状态的迁移和表单的提交。

14. **直接 DOM 操作**：直接操作 DOM 来显示和更新状态。

15. **jQuery**：在前端开发中，jQuery 等库提供了一些方法来管理和操作 DOM 元素的状态。

这些方法通常缺乏 Redux 提供的可预测性、可维护性和调试友好性。随着应用的增长，这些手动的状态管理方法可能会变得难以维护。Redux 通过提供一个集中的状态 store、单向数据流和强大的中间件系统，极大地简化了状态管理的复杂性。

## 类似于 redux 的 js 库还有哪些？ 

类似于 Redux 的 JavaScript 库主要用于状态管理，它们提供了不同的方法来实现可预测的状态更新和组件间的状态共享。以下是一些流行的 Redux 替代品：

1. **MobX**：基于响应式编程，允许简单的状态更新和异步处理，与 Redux 相比，MobX 通常更简单易用，性能也更好。

2. **Zustand**：一个轻量级的状态管理库，它利用了 React 的 Context API 和 Hooks，提供了一种更简洁的方式来管理状态。

3. **Recoil**：由 Facebook 提供的状态管理库，它使用原子状态和选择器来管理复杂的应用状态，支持 React Concurrent Mode。

4. **Jotai**：一个小型的全局状态管理库，模仿了 useState 和 useReducer，提供了一种声明式的状态管理方式。

5. **Valtio**：一个基于 Proxy 的状态管理库，它提供细粒度的渲染优化和易于上手的 API。

6. **Rematch**：是对 Redux 的重构，移除了 Redux 中的许多样板代码，提供了更简洁的 API。

7. **Vuex**：虽然主要用于 Vue.js，但它是 Redux 理念的实现，提供了集中式的状态管理。

8. **Akita**：一个受 NgRx 启发的状态管理库，它旨在提供一种更简单、更轻量级的状态管理解决方案。

9. **Redux Toolkit**：是 Redux 的扩展，它提供了一些实用的函数和约定，以减少样板代码并简化常见的 Redux 模式。

10. **Context API + useReducer**：React 提供的原生 Hook，可以结合使用以模拟 Redux 的一些功能，适用于不需要额外库的简单状态管理。

这些库各有优势和特点，开发者可以根据项目需求和个人偏好选择合适的状态管理工具。



* any list
{:toc}