---
layout: post
title:  Vuex 状态管理模式-00-chat 聊一聊 vuex
date:  2018-07-06 15:42:03 +0800
categories: [Web]
tags: [web, js, vue, state]
published: true
---

# chat

## 详细介绍一下 vuex

Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式和库。

它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

Vuex 能够解决多个组件共享状态时的复杂性，并且提供了一种更结构化的方法来组织应用程序的数据。

### Vuex 的核心概念

1. **State**：应用的状态，是一个单一的对象，包含了应用中大部分的状态信息。

2. **Getters**：类似于 Vue 的计算属性，允许你从 store 中的 state 中派生出一些状态，以便于在多个组件中复用。

3. **Mutations**：更改 Vuex 的 store 中的状态的唯一方法是提交 mutation。Vuex 中的 mutation 非常类似于事件：每个 mutation 都有一个字符串类型的事件类型 (type) 和一个回调函数 (handler)。这个回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数。

4. **Actions**：类似于 mutation，不同在于它们提交的是 mutation，而不是直接变更状态。Action 可以包含任意异步操作。

5. **Modules**：当应用变得非常复杂时，store 对象就可能变得相当臃肿。为了解决这个问题，Vuex 允许我们将 store 分割成模块（module）。每个模块拥有自己的 state、mutation、action、getter，甚至是嵌套子模块。

### Vuex 的使用

1. **创建 store**：首先，你需要创建一个 Vuex store 实例。

```javascript
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    count: 0
  },
  getters: {
    doubleCount: state => state.count * 2
  },
  mutations: {
    increment(state) {
      state.count++;
    }
  },
  actions: {
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('increment');
      }, 1000);
    }
  }
});
```

2. **在 Vue 组件中使用**：在 Vue 组件内部，你可以通过 `this.$store` 访问到 Vuex 的 store 实例。

```javascript
export default {
  computed: {
    doubleCount() {
      return this.$store.getters.doubleCount;
    }
  },
  methods: {
    increment() {
      this.$store.commit('increment');
    },
    incrementAsync() {
      this.$store.dispatch('incrementAsync');
    }
  }
};
```

3. **模块化**：如果应用足够复杂，你可能需要将 store 分割成模块。

```javascript
const moduleA = {
  state: { ... },
  getters: { ... },
  actions: { ... },
  mutations: { ... }
};

const store = new Vuex.Store({
  modules: {
    a: moduleA
  }
});
```

### 为什么要使用 Vuex

- **状态共享**：Vuex 提供了一种机制来共享多个组件之间的状态，而无需手动在每个组件间传递 props。
- **集中式管理**：将组件的状态集中管理，使得状态的变化更加可追踪和易于调试。
- **响应式更新**：Vuex 中的 state 是响应式的，当 state 发生变化时，所有依赖于该 state 的组件都会自动更新。
- **严格规则**：Vuex 强制使用 mutation 来更改 state，这有助于保持状态更改的可预测性。

Vuex 是构建大型 Vue.js 应用时管理状态的强大工具，它通过提供一种清晰和结构化的方法来维护应用程序的状态，使得开发和维护变得更加容易。

## 已经有 redux 了，为什么还有 vuex?

Redux 和 Vuex 都是状态管理库，但它们分别服务于不同的前端框架。

Redux 主要与 React 框架一起使用，而 Vuex 是专门为 Vue.js 框架设计的。尽管它们在概念上有很多相似之处，如集中式状态管理、纯函数的 reducer（或 mutation）、以及通过 actions 触发状态变更等，但它们之间存在一些关键的差异和原因，为什么开发者可能会选择 Vuex 而不是 Redux，反之亦然。

以下是一些原因，为什么在 Vue.js 应用中使用 Vuex 而不是 Redux：

1. **框架集成**：Vuex 与 Vue.js 高度集成，利用了 Vue 的响应式系统，这意味着 Vuex 的状态变化会自动触发视图的更新，无需额外的逻辑。

2. **简化语法**：Vuex 提供了更简洁的 API 和语法，这使得在 Vue 中使用状态管理更为直观和方便。

3. **模块化**：Vuex 支持模块化，允许你将状态分割成模块，每个模块拥有自己的 state、getters、actions 和 mutations，这有助于大型应用的组织和维护。

4. **更小的体积**：Vuex 通常比 Redux 体积更小，这可以减少应用的打包大小。

5. **官方支持**：Vuex 是 Vue.js 的官方状态管理库，这意味着它与 Vue.js 的开发和更新更加同步。

6. **社区和生态系统**：Vue.js 和 Vuex 拥有一个活跃的社区和丰富的生态系统，提供了大量的插件、工具和文档资源。

7. **开发者熟悉度**：对于已经熟悉 Vue.js 的开发者来说，学习 Vuex 会更容易，因为它遵循了 Vue.js 的设计哲学和模式。

8. **单向数据流**：Vuex 强制执行单向数据流，这有助于避免复杂的状态管理逻辑。

9. **工具支持**：Vue Devtools 等工具对 Vuex 提供了很好的支持，使得开发者可以更容易地调试应用的状态。

尽管 Redux 是一个非常强大和灵活的状态管理解决方案，适用于各种类型的前端框架，但在 Vue.js 应用中，Vuex 提供了更加定制化和优化的体验。

选择使用哪一个库，很大程度上取决于你的具体需求、团队的熟悉度以及你所使用的前端框架。

* any list
{:toc}