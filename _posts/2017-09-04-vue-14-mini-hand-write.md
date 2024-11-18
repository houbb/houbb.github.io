---
layout: post
title:  Vue-14-手写简易版本 vue
date:  2017-09-04 20:38:53 +0800
categories: [Vue]
tags: [ui, vue, learn-note, sh]
published: true
---

# chat

## vue 最核心的能力是什么？原理是什么？

Vue.js 的核心能力体现在其**响应式系统**和**组件化开发模型**上，这些能力使得 Vue 成为一个高效、灵活的前端框架。

以下是 Vue 的核心能力及其原理的详细解析：

---

## 核心能力

### 1. **响应式系统**
Vue 的响应式系统是其最核心的特性，能够自动追踪数据变化并更新视图，而无需手动操作 DOM。
- **特点**：
  - 数据驱动视图（Data-Driven Views）。
  - 双向绑定（使用 `v-model` 实现）。
  - 自动高效地更新界面（依赖追踪 + 最小化 DOM 操作）。

### 2. **组件化开发**
Vue 推崇组件化开发，使应用的开发和维护更高效：
- 组件通过 **Props** 接收数据，**Emit** 分发事件。
- 支持组合式 API（Composition API）和选项式 API（Options API），方便代码复用和逻辑拆分。
- 提供插槽（Slot）和作用域插槽（Scoped Slot）支持灵活的组件结构设计。

### 3. **轻量高效**
- 体积小（相较于其他框架，Vue 更轻量）。
- 编译优化：Vue 的模板语法通过编译器转换为高效的渲染函数，提升运行时性能。

### 4. **生态系统丰富**
- 内置指令（如 `v-for`、`v-bind`、`v-if` 等）简化常见操作。
- 与工具链（如 Vue CLI、Vite）结合，提供完整的前端开发体验。
- 配套官方库（如 Vue Router、Pinia/Vuex）扩展能力。

---

## 核心原理

### 1. **响应式原理**
Vue 的响应式系统以**依赖收集**和**发布订阅模式**为基础。
- **实现机制**：
  1. Vue 通过 `Object.defineProperty`（Vue 2）或 `Proxy`（Vue 3）来劫持数据的读取和写入操作。
  2. **依赖收集**：当组件渲染时，访问数据触发 `getter`，将依赖（如 Watcher 或组件的渲染函数）记录下来。
  3. **派发更新**：当数据发生变化时，触发 `setter`，通知所有依赖重新计算或更新视图。
- **优化点**：
  - Vue 会按需追踪依赖，避免不必要的更新。
  - Vue 3 中使用 Proxy 支持深层次劫持且性能更高。

### 2. **虚拟 DOM 和 Diff 算法**
Vue 使用虚拟 DOM（Virtual DOM）来高效管理和更新真实 DOM：
- **虚拟 DOM**：将真实 DOM 的状态表示为一个 JavaScript 对象。
- **Diff 算法**：在更新时比较新旧虚拟 DOM，生成最小的更新操作并应用到真实 DOM 上。
- Vue 通过模板编译生成优化后的渲染函数，结合虚拟 DOM 实现高效的视图更新。

### 3. **模板编译与渲染**
- Vue 的模板语法会在编译阶段转换为渲染函数（Render Function），这使得：
  - 可以提前优化静态节点（静态提升）。
  - 动态内容的更新只需要关注必要部分，降低运行时开销。

### 4. **组件通信机制**
Vue 提供多种组件通信方式：
- 父子组件通过 `Props` 和 `Emit` 通信。
- 兄弟组件可以通过状态管理（如 Pinia）或事件总线。
- 深层嵌套组件通过 `provide` 和 `inject` 传递数据。

---

## 总结

Vue.js 的核心能力围绕**响应式系统**和**组件化开发模型**展开，并通过虚拟 DOM、模板编译等技术优化性能。

其设计哲学是简单易用，同时不失灵活性，为开发者提供了直观的开发体验，同时能够满足复杂应用的需求。

## 如果让你从零开始实现简易版本的 vue，你要如何实现？给出思路

要从零开始实现一个简易版的 Vue，我们可以从其核心特性入手：**响应式数据绑定**、**模板渲染**、和**组件化开发**。这里我将逐步解释如何实现这些功能。

---

## 思路概述

### 1. **响应式数据绑定**
首先，我们需要创建一个**响应式系统**，即能够自动监控数据的变化，并在数据发生改变时更新视图。

### 2. **模板解析与渲染**
Vue 的核心之一是通过模板（HTML-like 语法）动态更新视图。因此，我们需要能够**解析模板**并**渲染**它，确保视图的变化能响应数据的改变。

### 3. **组件化开发**
最后，我们需要能够**分离组件**，每个组件包含自己的数据、模板、方法和生命周期。组件之间的通信通常通过 `props` 和 `events`。

---

### 具体步骤

#### 1. **响应式数据绑定**

我们需要实现一个简单的响应式系统，当数据变化时，视图能够自动更新。可以通过 **getter/setter**（`Object.defineProperty` 或 `Proxy`）来实现数据的劫持与依赖收集。

##### 示例（使用 Proxy）

```javascript
class Reactive {
  constructor(data) {
    this.data = data;
    this.watchers = {};  // 用于存储数据变化时需要更新的视图
    return this.observe(data);
  }

  // 使用 Proxy 劫持数据
  observe(data) {
    return new Proxy(data, {
      get: (target, key) => {
        if (this.watchers[key]) {
          this.watchers[key].forEach(watcher => watcher());
        }
        return target[key];
      },
      set: (target, key, value) => {
        target[key] = value;
        if (this.watchers[key]) {
          this.watchers[key].forEach(watcher => watcher());
        }
        return true;
      }
    });
  }

  // 添加 watcher
  watch(key, watcher) {
    if (!this.watchers[key]) {
      this.watchers[key] = [];
    }
    this.watchers[key].push(watcher);
  }
}

let data = new Reactive({ message: 'Hello Vue' });

data.watch('message', () => {
  console.log('message changed');
});
```

#### 2. **模板解析与渲染**

我们需要将模板中的数据与实际的数据进行绑定。一个简单的实现方式是通过 **正则表达式** 或 **AST（抽象语法树）** 来解析模板中的变量，然后在视图中绑定数据。

##### 示例（简单模板渲染）

```javascript
class Vue {
  constructor(options) {
    this.data = new Reactive(options.data);
    this.el = options.el;
    this.template = options.template;
    
    this.compile();  // 编译模板
  }

  // 编译模板
  compile() {
    const compiledTemplate = this.template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
      // 使用数据更新视图
      this.data.watch(key.trim(), () => this.update());
      return this.data.data[key.trim()];
    });
    
    this.update(compiledTemplate);
  }

  // 更新视图
  update(content) {
    document.querySelector(this.el).innerHTML = content;
  }
}

let app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue'
  },
  template: '<div>{{ message }}</div>'
});
```

这里，我们通过正则表达式替换模板中的 `{{ message }}`，然后将数据绑定到 HTML 中。当数据变化时，调用 `update` 方法刷新视图。

#### 3. **组件化开发**

为了支持组件化，我们可以设计一个简单的组件系统，每个组件有自己的模板、数据和方法。

组件之间的通信通过 **props** 和 **events** 进行。

##### 示例（组件化实现）

```javascript
class Component {
  constructor(options) {
    this.data = new Reactive(options.data);
    this.template = options.template;
    this.methods = options.methods;
    this.el = options.el;
  }

  // 渲染组件
  render() {
    let content = this.template;
    for (let key in this.data.data) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), this.data.data[key]);
    }
    document.querySelector(this.el).innerHTML = content;
  }

  // 注册事件
  bindEvents() {
    for (let method in this.methods) {
      let button = document.querySelector(this.methods[method].el);
      if (button) {
        button.addEventListener('click', this.methods[method].fn.bind(this));
      }
    }
  }
}

let app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue'
  },
  template: '<div>{{ message }}</div>',
});

let buttonComponent = new Component({
  el: '#button',
  data: { label: 'Click me' },
  template: '<button>{{ label }}</button>',
  methods: {
    changeMessage: {
      el: '#button',
      fn() {
        app.data.data.message = 'Message changed!';
      }
    }
  }
});

buttonComponent.render();
buttonComponent.bindEvents();
```

通过上述方式，我们实现了一个简单的组件化系统，每个组件都有自己的模板、数据和事件处理方法。组件间通过 `props` 和 `emit` 实现数据的传递和事件的触发。

---

## 总结

从零开始实现简易版 Vue 的步骤大致如下：
1. **响应式系统**：使用 `Proxy` 或 `Object.defineProperty` 实现数据的劫持，自动追踪依赖和更新视图。
2. **模板解析**：通过正则表达式或模板编译来实现模板与数据的绑定，更新视图。
3. **组件化**：设计简单的组件系统，实现每个组件具有独立的模板、数据和事件处理。

这个简易版 Vue 实现了 Vue 的最基本功能，但缺乏很多优化和特性（如虚拟 DOM、异步更新等）。通过不断扩展和优化，最终可以实现更完整的功能。

## 我们实现的简易版本 vue 要如何使用？

在实现了简易版的 Vue 之后，我们需要提供一种简便的方式让用户使用这个框架来创建应用。以下是如何使用我们简易版本 Vue 的步骤，包括如何定义数据、模板、组件和事件等。

### 使用简易版 Vue 的步骤

假设我们已经完成了上面提到的 `Vue` 类和 `Component` 类，并且实现了简单的响应式数据绑定和模板解析功能。接下来，用户可以按照以下方式使用这个框架。

---

### 1. **创建 Vue 实例**

用户可以使用 `new Vue()` 来创建一个 Vue 实例，并传入 `data`（数据对象）和 `template`（模板字符串）。

```html
<!-- index.html -->
<div id="app"></div>

<script src="path/to/vue.js"></script>
<script>
  let app = new Vue({
    el: '#app',  // 绑定元素
    data: {
      message: 'Hello, Vue!'  // 数据
    },
    template: '<div>{{ message }}</div>'  // 模板
  });
</script>
```

### 2. **模板渲染**

我们在实例化 `Vue` 时传入一个 `template` 字符串，其中包含 `{{ message }}` 等占位符。`Vue` 会解析模板中的数据并替换为实际的数据值。

在这个例子中，`message` 将会替换成 `Hello, Vue!`，渲染到页面中。

### 3. **响应式数据更新**

用户可以直接修改 `data` 中的数据，简易版 Vue 会自动更新视图。

```html
<script>
  setTimeout(() => {
    app.data.message = 'Hello, World!';  // 数据更新
  }, 2000);
</script>
```

这段代码会在 2 秒后更新 `message`，并自动刷新视图显示新的值 `Hello, World!`。

### 4. **组件化使用**

我们可以通过定义组件来组织应用的结构。每个组件有自己的模板和数据。组件也可以包含方法（如事件处理函数）。

#### 定义组件

```javascript
class ButtonComponent extends Component {
  constructor(options) {
    super(options);  // 调用父类构造函数
  }

  render() {
    let content = this.template.replace('{{ label }}', this.data.data.label);
    document.querySelector(this.el).innerHTML = content;
  }
}

let button = new ButtonComponent({
  el: '#button',  // 绑定元素
  data: { label: 'Click Me' },  // 组件数据
  template: '<button>{{ label }}</button>',  // 组件模板
  methods: {
    changeMessage: {
      el: '#button',
      fn() {
        app.data.data.message = 'Message Changed!';
      }
    }
  }
});

button.render();  // 渲染组件
button.bindEvents();  // 绑定事件
```

#### 在 HTML 中使用组件

```html
<!-- index.html -->
<div id="app">
  <p>{{ message }}</p>
  <div id="button"></div>
</div>

<script src="path/to/vue.js"></script>
<script>
  // 创建 Vue 实例
  let app = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!'
    },
    template: '<div>{{ message }}</div>'
  });

  // 创建并渲染按钮组件
  let buttonComponent = new ButtonComponent({
    el: '#button',
    data: { label: 'Click me' },
    template: '<button>{{ label }}</button>',
    methods: {
      changeMessage: {
        el: '#button',
        fn() {
          app.data.data.message = 'Message changed!';
        }
      }
    }
  });

  buttonComponent.render();
  buttonComponent.bindEvents();
</script>
```

- **数据**：`ButtonComponent` 组件中的数据是独立的（例如 `label`）。
- **事件**：按钮点击事件会调用 `changeMessage` 方法，更新 `app` 中的 `message`。

### 5. **事件处理与数据通信**

组件之间的数据通信通过 **props** 和 **methods** 来进行。上面的例子中，`ButtonComponent` 通过 `methods` 绑定了事件（点击按钮时更新 `message`）。

---

### 6. **其他特性**

#### 6.1 **更新视图**

简易版 Vue 在每次数据变化时，会自动触发视图更新。在 `message` 更改时，我们会调用 `update()` 来重新渲染视图。你可以进一步优化视图更新机制，使其更加高效，比如通过虚拟 DOM 或 Diff 算法。

#### 6.2 **动态模板和插值**

用户可以通过模板字符串动态显示数据，例如：

```html
<div id="app">
  <p>{{ message }}</p>
  <p>{{ message.toUpperCase() }}</p>  <!-- 使用 JavaScript 表达式 -->
</div>
```

你可以扩展模板解析功能，支持更复杂的表达式或条件渲染。

---

### 总结

用户使用我们实现的简易版 Vue 时，可以按照以下步骤进行：

1. **创建 Vue 实例**：通过 `new Vue()` 创建实例，定义 `data` 和 `template`。
2. **响应式数据绑定**：数据变化时，视图会自动更新。
3. **组件化开发**：通过创建 `Component` 类来实现组件化开发，支持模板、数据和事件处理。
4. **事件绑定和数据更新**：通过定义事件处理方法和更新数据来实现视图交互。

这些步骤提供了一个最基础的 Vue 风格的开发体验，用户可以根据需要扩展和完善功能，逐渐实现更复杂的特性。

## 完整的 vue.js 例子+HTML

### vue.js

```js
class Vue {
  constructor(options) {
    this.el = options.el;
    this.data = new Reactive(options.data);
    this.template = options.template;
    this.methods = options.methods || {};
    this.compile();  // 编译模板
  }

  // 编译模板并进行数据绑定
  compile() {
    const compiledTemplate = this.template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
      // 清理变量并绑定数据
      const property = key.trim();
      this.data.watch(property, () => this.render());
      return this.data.data[property];
    });

    this.render(compiledTemplate);
  }

  // 渲染模板
  render(content) {
    document.querySelector(this.el).innerHTML = content;
  }
}

class Reactive {
  constructor(data) {
    this.data = data;
    this.watchers = {};
    return this.observe(data);
  }

  // 使用 Proxy 实现响应式数据
  observe(data) {
    return new Proxy(data, {
      get: (target, key) => {
        if (this.watchers[key]) {
          this.watchers[key].forEach(watcher => watcher());
        }
        return target[key];
      },
      set: (target, key, value) => {
        target[key] = value;
        if (this.watchers[key]) {
          this.watchers[key].forEach(watcher => watcher());
        }
        return true;
      }
    });
  }

  // 添加观察者
  watch(key, watcher) {
    if (!this.watchers[key]) {
      this.watchers[key] = [];
    }
    this.watchers[key].push(watcher);
  }
}

class Component {
  constructor(options) {
    this.el = options.el;
    this.data = new Reactive(options.data);
    this.template = options.template;
    this.methods = options.methods || {};
    this.render();
    this.bindEvents();
  }

  // 渲染组件
  render() {
    let content = this.template;
    for (let key in this.data.data) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), this.data.data[key]);
    }
    document.querySelector(this.el).innerHTML = content;
  }

  // 绑定事件
  bindEvents() {
    for (let method in this.methods) {
      const button = document.querySelector(this.methods[method].el);
      if (button) {
        button.addEventListener('click', this.methods[method].fn.bind(this));
      }
    }
  }
}

// 创建一个简易的 Vue 实例
const app = new Vue({
  el: '#app',
  data: {
    message: 'Hello, Vue!'
  },
  template: '<div>{{ message }}</div>'
});

// 创建并渲染按钮组件
const buttonComponent = new Component({
  el: '#button',
  data: { label: 'Click Me' },
  template: '<button>{{ label }}</button>',
  methods: {
    changeMessage: {
      el: '#button',
      fn() {
        app.data.data.message = 'Message Changed!';
      }
    }
  }
});
```

### html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue Simplified</title>
</head>
<body>
  <div id="app">
    <p>{{ message }}</p>
  </div>
  
  <div id="button"></div>

  <script src="path/to/vue.js"></script>
  <script>
    // Vue 实例和组件代码，见上面
  </script>
</body>
</html>
```

# 参考资料

https://blog.csdn.net/u013948858/article/details/118342541

* any list
{:toc}