---
layout: post
title:  Redux 状态管理工具
date:  2018-07-05 21:01:28 +0800
categories: [Tool]
tags: [tool, redux, state, sh]
published: true
---

# Redux

[Redux](https://redux.js.org/) is predictable state container for JavaScript apps.

## 文档

[Redux 入门教程](http://www.ruanyifeng.com/blog/2016/09/redux_tutorial_part_one_basic_usages.html)

[Redux 中文文档](http://www.redux.org.cn/)

# 介绍

## 动机

随着 JavaScript 单页应用开发日趋复杂，**JavaScript 需要管理比任何时候都要多的 state （状态）**。 
这些 state 可能包括服务器响应、缓存数据、本地生成尚未持久化到服务器的数据，也包括 UI 状态，如激活的路由，被选中的标签，是否显示加载动效或者分页器等等。

管理不断变化的 state 非常困难。如果一个 model 的变化会引起另一个 model 变化，那么当 view 变化时，就可能引起对应 model 以及另一个 model 的变化，依次地，可能会引起另一个 view 的变化。直至你搞不清楚到底发生了什么。state 在什么时候，由于什么原因，如何变化已然不受控制。 
当系统变得错综复杂的时候，想重现问题或者添加新功能就会变得举步维艰。

我们总是将两个难以理清的概念混淆在一起：变化和异步。 

紧随着 [Flux](http://facebook.github.io/flux)、[CQRS](http://martinfowler.com/bliki/CQRS.html)、
[EventSourcing](https://martinfowler.com/eaaDev/EventSourcing.html)

通过限制更新发生的时间和方式，Redux 试图让 state 的变化变得可预测。

## 核心概念

Redux 本身很简单。

当使用普通对象来描述应用的 state 时。例如，todo 应用的 state 可能长这样：

```js
{
  todos: [{
    text: 'Eat food',
    completed: true
  }, {
    text: 'Exercise',
    completed: false
  }],
  visibilityFilter: 'SHOW_COMPLETED'
}
```

这个对象就像 “Model”，区别是它并没有 setter（修改器方法）。因此其它的代码不能随意修改它，造成难以复现的 bug。

要想更新 state 中的数据，你需要发起一个 action。
Action 就是一个普通 JavaScript 对象（注意到没，这儿没有任何魔法？）用来描述发生了什么。

下面是一些 action 的示例：

```js
{ type: 'ADD_TODO', text: 'Go to swimming pool' }
{ type: 'TOGGLE_TODO', index: 1 }
{ type: 'SET_VISIBILITY_FILTER', filter: 'SHOW_ALL' }
```

强制使用 action 来描述所有变化带来的好处是可以清晰地知道应用中到底发生了什么。
如果一些东西改变了，就可以知道为什么变。action 就像是描述发生了什么的指示器。
最终，为了把 action 和 state 串起来，开发一些函数，这就是 reducer。
再次地，没有任何魔法，reducer 只是一个接收 state 和 action，并返回新的 state 的函数。 
对于大的应用来说，不大可能仅仅只写一个这样的函数，所以我们编写很多小函数来分别管理 state 的一部分：

```js
function visibilityFilter(state = 'SHOW_ALL', action) {
  if (action.type === 'SET_VISIBILITY_FILTER') {
    return action.filter;
  } else {
    return state;
  }
}

function todos(state = [], action) {
  switch (action.type) {
  case 'ADD_TODO':
    return state.concat([{ text: action.text, completed: false }]);
  case 'TOGGLE_TODO':
    return state.map((todo, index) =>
      action.index === index ?
        { text: todo.text, completed: !todo.completed } :
        todo
   )
  default:
    return state;
  }
}
```

再开发一个 reducer 调用这两个 reducer，进而来管理整个应用的 state：

```js
function todoApp(state = {}, action) {
  return {
    todos: todos(state.todos, action),
    visibilityFilter: visibilityFilter(state.visibilityFilter, action)
  };
}
```

这差不多就是 Redux 思想的全部。注意到没我们还没有使用任何 Redux 的 API。
Redux 里有一些工具来简化这种模式，但是主要的想法是如何根据这些 action 对象来更新 state，
而且 90% 的代码都是纯 JavaScript，没用 Redux、Redux API 和其它魔法。

# 三大原则

## 单一数据源

整个应用的 state 被储存在一棵 object tree 中，并且这个 object tree 只存在于唯一一个 store 中。

这让同构应用开发变得非常容易。来自服务端的 state 可以在无需编写更多代码的情况下被序列化并注入到客户端中。
由于是单一的 state tree ，调试也变得非常容易。
在开发中，你可以把应用的 state 保存在本地，从而加快开发速度。此外，受益于单一的 state tree ，以前难以实现的如“撤销/重做”这类功能也变得轻而易举。

```js
console.log(store.getState())

/* 输出
{
  visibilityFilter: 'SHOW_ALL',
  todos: [
    {
      text: 'Consider using Redux',
      completed: true,
    },
    {
      text: 'Keep all state in a single tree',
      completed: false
    }
  ]
}
*／
```

## State 是只读的

唯一改变 state 的方法就是触发 action，action 是一个用于描述已发生事件的普通对象。

这样确保了视图和网络请求都不能直接修改 state，相反它们只能表达想要修改的意图。因为所有的修改都被集中化处理，且严格按照一个接一个的顺序执行，因此不用担心 race condition 的出现。 Action 就是普通对象而已，因此它们可以被日志打印、序列化、储存、后期调试或测试时回放出来。

```js
store.dispatch({
  type: 'COMPLETE_TODO',
  index: 1
})

store.dispatch({
  type: 'SET_VISIBILITY_FILTER',
  filter: 'SHOW_COMPLETED'
})
```

## 使用纯函数来执行修改

为了描述 action 如何改变 state tree ，你需要编写 reducers。

Reducer 只是一些纯函数，它接收先前的 state 和 action，并返回新的 state。
刚开始你可以只有一个 reducer，随着应用变大，你可以把它拆成多个小的 reducers，
分别独立地操作 state tree 的不同部分，因为 reducer 只是函数，你可以控制它们被调用的顺序，传入附加数据，
甚至编写可复用的 reducer 来处理一些通用任务，如分页器。

```js
function visibilityFilter(state = 'SHOW_ALL', action) {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter
    default:
      return state
  }
}

function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ]
    case 'COMPLETE_TODO':
      return state.map((todo, index) => {
        if (index === action.index) {
          return Object.assign({}, todo, {
            completed: true
          })
        }
        return todo
      })
    default:
      return state
  }
}

import { combineReducers, createStore } from 'redux'
let reducer = combineReducers({ visibilityFilter, todos })
let store = createStore(reducer)
```

就是这样，现在你应该明白 Redux 是怎么回事了。


# 先前技术

Redux 是一个混合产物。它和一些设计模式及技术相似，但也有不同之处。让我们来探索一下这些相似与不同。

## Flux

Redux 可以被看作 Flux 的一种实现吗？ 是，也可以说 不是。

（别担心，它得到了Flux 作者的认可，如果你想确认。）

Redux 的灵感来源于 Flux 的几个重要特性。
和 Flux 一样，Redux 规定，将模型的更新逻辑全部集中于一个特定的层（Flux 里的 store，Redux 里的 reducer）。
Flux 和 Redux 都不允许程序直接修改数据，而是用一个叫作 “action” 的普通对象来对更改进行描述。

而不同于 Flux ，Redux 并没有 dispatcher 的概念。
原因是它依赖纯函数来替代事件处理器。纯函数构建简单，也不需额外的实体来管理它们。
你可以将这点看作这两个框架的差异或细节实现，取决于你怎么看 Flux。
Flux 常常被表述为 `(state, action) => state`。从这个意义上说，
Redux 无疑是 Flux 架构的实现，且得益于纯函数而更为简单。

和 Flux 的另一个重要区别，是 Redux 设想你永远不会变动你的数据。
你可以很好地使用普通对象和数组来管理 state ，而不是在多个 reducer 里变动数据。
正确且简便的方式是，你应该在 reducer 中返回一个新对象来更新 state， 同时配合 object spread 运算符提案 或一些库，如 Immutable。

虽然出于性能方面的考虑，写不纯的 reducer 来变动数据在技术上是可行的，但我们并不鼓励这么做。
不纯的 reducer 会使一些开发特性，如时间旅行、记录/回放或热加载不可实现。
此外，在大部分实际应用中，这种数据不可变动的特性并不会带来性能问题，就像 Om 所表现的，即使对象分配失败，仍可以防止昂贵的重渲染和重计算。
而得益于 reducer 的纯度，应用内的变化更是一目了然。

## Elm

Elm 是一种函数式编程语言，由 Evan Czaplicki 受 Haskell 语言的启发开发。
它执行一种 “model view update” 的架构 ，更新遵循 (state, action) => state 的规则。 
Elm 的 “updater” 与 Redux 里的 reducer 服务于相同的目的。

不同于 Redux，Elm 是一门语言，因此它在执行纯度，静态类型，不可变动性，action 和模式匹配等方面更具优势。
即使你不打算使用 Elm，也可以读一读 Elm 的架构，尝试一把。
基于此，有一个有趣的使用 JavaScript 库实现类似想法 的项目。
Redux 应该能从中获得更多的启发！ 为了更接近 Elm 的静态类型，Redux 可以使用一个类似 Flow 的渐进类型解决方案 。

## Immutable

Immutable 是一个可实现持久数据结构的 JavaScript 库。它性能很好，并且命名符合 JavaScript API 的语言习惯 。

Immutable 及类似的库都可以与 Redux 对接良好。尽可随意捆绑使用！

Redux 并不在意你如何存储 state，state 可以是普通对象，不可变对象，或者其它类型。 
为了从 server 端写同构应用或融合它们的 state ，你可能要用到序列化或反序列化的机制。
但除此以外，你可以使用任何数据存储的库，只要它支持数据的不可变动性。
举例说明，对于 Redux state ，Backbone 并无意义，因为 Backbone model 是可变的。

注意，即便你使用支持 cursor 的不可变库，也不应在 Redux 的应用中使用。
整个 state tree 应被视为只读，并需通过 Redux 来更新 state 和订阅更新。
因此，通过 cursor 来改写，对 Redux 来说没有意义。
而如果只是想用 cursor 把 state tree 从 UI tree 解耦并逐步细化 cursor，应使用 selector 来替代。 
Selector 是可组合的 getter 函数组。具体可参考 reselect，这是一个优秀、简洁的可组合 selector 的实现。

## Baobab

Baobab 是另一个流行的库，实现了数据不可变特性的 API，用以更新纯 JavaScript 对象。你当然可以在 Redux 中使用它，但两者一起使用并没有什么优势。

Baobab 所提供的大部分功能都与使用 cursors 更新数据相关，而 Redux 更新数据的唯一方法是分发一个 action 。
可见，两者用不同方法，解决的却是同样的问题，相互并无增益。

不同于 Immutable ，Baobab 在引擎下还不能实现任何特别有效的数据结构，同时使用 Baobab 和 Redux 并无裨益。这种情形下，使用普通对象会更简便。

## Rx

Reactive Extensions (和它们正在进行的 现代化重写) 是管理复杂异步应用非常优秀的方案。
以外，还有致力于构建将人机交互作模拟为相互依赖的可观测变量的库。

同时使用它和 Redux 有意义么？当然！它们配合得很好。将 Redux store 视作可观察变量非常简便，例如：

```js
function toObservable(store) {
  return {
    subscribe({ next }) {
      const unsubscribe = store.subscribe(() => next(store.getState()))
      next(store.getState())
      return { unsubscribe }
    }
  }
}
```

使用类似方法，你可以组合不同的异步流，将其转化为 action ，再提交到 store.dispatch() 。

问题在于: 在已经使用了 Rx 的情况下，你真的需要 Redux 吗？ 不一定。通过 Rx 重新实现 Redux 并不难。
有人说仅需使用一两句的 `.scan()` 方法即可。这种做法说不定不错！

如果你仍有疑虑，可以去查看 Redux 的源代码 (并不多) 以及生态系统 (例如开发者工具)。如果你无意于此，仍坚持使用交互数据流，可以去探索一下 Cycle 这样的库，或把它合并到 Redux 中。记得告诉我们它运作得如何！

* any list
{:toc}