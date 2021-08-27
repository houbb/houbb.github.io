---
layout: post
title: VUE3-07-Class 与 Style 绑定
date: 2021-08-02 21:01:55 +0800
categories: [VUE]
tags: [vue, hello-world, sh]
published: true
---

# class 与 style 绑定

操作元素的 class 列表和内联样式是数据绑定的一个常见需求。

因为它们都是 attribute，所以我们可以用 v-bind 处理它们：只需要通过表达式计算出字符串结果即可。

不过，字符串拼接麻烦且易错。

因此，在将 v-bind 用于 class 和 style 时，Vue.js 做了专门的增强。

表达式结果的类型除了字符串之外，还可以是对象或数组。

# 绑定 HTML Class

## 对象语法

我们可以传给 :class (v-bind:class 的简写) 一个对象，以动态地切换 class：

```xml
<div :class="{ active: isActive }"></div>
```

上面的语法表示 active 这个 class 存在与否将取决于数据 property isActive 的 truthiness。

你可以在对象中传入更多字段来动态切换多个 class。

此外，:class 指令也可以与普通的 class attribute 共存。

当有如下模板：

```html
<div
  class="static"
  :class="{ active: isActive, 'text-danger': hasError }"
></div>
```

和如下 data：

```js
data() {
  return {
    isActive: true,
    hasError: false
  }
}
```

渲染的结果为：

```xml
<div class="static active"></div>
```

当 isActive 或者 hasError 变化时，class 列表将相应地更新。

例如，如果 hasError 的值为 true，class 列表将变为 "static active text-danger"。

绑定的数据对象不必内联定义在模板里：

```xml
<div :class="classObject"></div>
```

```js
data() {
  return {
    classObject: {
      active: true,
      'text-danger': false
    }
  }
}
```

渲染的结果和上面一样。我们也可以在这里绑定一个返回对象的计算属性。这是一个常用且强大的

```xml
<div :class="classObject"></div>
```

```js
data() {
  return {
    isActive: true,
    error: null
  }
},
computed: {
  classObject() {
    return {
      active: this.isActive && !this.error,
      'text-danger': this.error && this.error.type === 'fatal'
    }
  }
}
```

## 数组语法

我们可以把一个数组传给 :class，以应用一个 class 列表：

```xml
<div :class="[activeClass, errorClass]"></div>
```

```js
data() {
  return {
    activeClass: 'active',
    errorClass: 'text-danger'
  }
}
```

渲染的结果为：

```xml
<div class="active text-danger"></div>
```

如果你想根据条件切换列表中的 class，可以使用三元表达式：

```xml
<div :class="[isActive ? activeClass : '', errorClass]"></div>
```

这样写将始终添加 errorClass，但是只有在 isActive 为 truthy[1] 时才添加 activeClass。

不过，当有多个条件 class 时这样写有些繁琐。

所以在数组语法中也可以使用对象语法：

```xml
<div :class="[{ active: isActive }, errorClass]"></div>
```

## 在组件上使用

这个章节假设你已经对 Vue 组件有一定的了解。

当然你也可以先跳过这里，稍后再回过头来看。

例如，如果你声明了这个组件：

```js
const app = Vue.createApp({})

app.component('my-component', {
  template: `<p class="foo bar">Hi!</p>`
})
```

然后在使用它的时候添加一些 class：

```xml
<div id="app">
  <my-component class="baz boo"></my-component>
</div>
```

HTML 将被渲染为：

```xml
<p class="foo bar baz boo">Hi</p>
```

对于带数据绑定 class 也同样适用：

```xml
<my-component :class="{ active: isActive }"></my-component>
```

当 isActive 为 truthy[1] 时，HTML 将被渲染成为：

```js
<p class="foo bar active">Hi</p>
```

如果你的组件有多个根元素，你需要定义哪些部分将接收这个类。

可以使用 $attrs 组件属性执行此操作：

```xml
<div id="app">
  <my-component class="baz"></my-component>
</div>
```

```js
const app = Vue.createApp({})

app.component('my-component', {
  template: `
    <p :class="$attrs.class">Hi!</p>
    <span>This is a child component</span>
  `
})
```



# 参考资料

https://vue3js.cn/docs/zh/guide/class-and-style.html#%E7%BB%91%E5%AE%9A-html-class

* any list
{:toc}