---
layout: post
title: VUE3-02-vue 是什么？vue 入门例子：声明式渲染
date: 2021-08-02 21:01:55 +0800
categories: [VUE]
tags: [vue, hello-world, sh]
published: true
---

# Vue.js 是什么

Vue (读音 /vjuː/，类似于 view) 是一套用于构建用户界面的渐进式框架。

与其它大型框架不同的是，Vue 被设计为可以自底向上逐层应用。

Vue 的核心库只关注视图层，不仅易于上手，还便于与第三方库或既有项目整合。

另一方面，当与现代化的工具链以及各种支持类库结合使用时，Vue 也完全能够为复杂的单页应用提供驱动。

# hello world

尝试 Vue.js 最简单的方法是使用 Hello World 例子

你可以在浏览器新标签页中打开它，跟着例子学习一些基础用法。

安装教程给出了更多安装 Vue 的方式。请注意我们不推荐新手直接使用 vue-cli，尤其是在你还不熟悉基于 Node.js 的构建工具时。

## vue3 引入

为了简单起见，我们使用 CDN 的方式。

```html
{% raw %}

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>hello</title>
</head>
<body>

<div id="hello-vue" class="demo">
  {{ message }}
</div>

<script src="https://unpkg.com/vue@next"></script>
<script>
const HelloVueApp = {
  data() {
    return {
      message: 'Hello Vue!!'
    }
  }
}

Vue.createApp(HelloVueApp).mount('#hello-vue')
</script>
</body>

</html>

{% endraw %}
```

message 将会被文本渲染替换，页面显示 Hello Vue!!

# 声明式渲染

Vue.js 的核心是一个允许采用简洁的模板语法来声明式地将数据渲染进 DOM 的系统：

看起来这跟渲染一个字符串模板非常类似，但是 Vue 在背后做了大量工作。

现在数据和 DOM 已经被建立了关联，所有东西都是响应式的。

我们要怎么确认呢？

请看下面的示例，其中 counter property 每秒递增，你将看到渲染的 DOM 是如何变化的：

## 属性变更

完整的代码如下：

```js
{% raw %}

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>hello</title>
</head>
<body>

<div id="hello-vue" class="demo">
  {{ counter }}
</div>

<script src="https://unpkg.com/vue@next"></script>
<script>
const Counter = {
  data() {
    return {
      counter: 0
    }
  },
  mounted() {
    setInterval(() => {
      this.counter++
    }, 1000)
  }
}


Vue.createApp(Counter).mount('#hello-vue')
</script>
</body>

</html>

{% endraw %}
```

可以看到页面的计数，不断随着时间而变化。

## 属性绑定

除了文本插值，我们还可以像这样绑定元素的 attribute：

```html
<div id="bind-attribute">
  <span v-bind:title="message">
    鼠标悬停几秒钟查看此处动态绑定的提示信息！
  </span>
</div>
```

对应的 js 代码：

```js
const AttributeBinding = {
  data() {
    return {
      message: 'You loaded this page on ' + new Date().toLocaleString()
    }
  }
}

Vue.createApp(AttributeBinding).mount('#bind-attribute')
```

这里我们遇到了一点新东西。

你看到的 v-bind attribute 被称为指令。

指令带有前缀 `v-`，以表示它们是 Vue 提供的特殊 attribute。

可能你已经猜到了，它们会在渲染的 DOM 上应用特殊的响应式行为。

在这里，该指令的意思是：“将这个元素节点的 title attribute 和当前活跃实例的 message property 保持一致”。

# 参考资料

https://v3.cn.vuejs.org/guide/introduction.html#%E5%A3%B0%E6%98%8E%E5%BC%8F%E6%B8%B2%E6%9F%93

* any list
{:toc}