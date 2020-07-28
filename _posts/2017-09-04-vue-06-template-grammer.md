---
layout: post
title:  Vue-06-模板语法
date:  2017-09-04 20:38:53 +0800
categories: [Vue]
tags: [ui, vue, learn-note, sh]
published: true
---

# 插入值

## 文本

```html
<div id="vue">
    <h1>\{\{ message \}\}</h1>
</div>
<script type="text/javascript">
    var vm = new Vue({
        el: '#vue',
        data: {
            message: '你好呀，李银河！'
        }
    })
</script>
```

## html

```html
<div id="vue">
    <div v-html="message"></div>
    <div>\{\{ message \}\}</div>
</div>
<script type="text/javascript">
    var vm = new Vue({
        el: '#vue',
        data: {
            message: '<b>你好呀，李银河</b>'
        }
    })
</script>
```

内容如下：

```
你好呀，李银河
<b>你好呀，李银河</b>
```

第一个 v-html 声明的内容，会被当做真正的 html 来处理。

## 属性

HTML 属性中的值应使用 `v-bind` 指令。

以下实例判断 use 的值，如果为 true 使用 class1 类的样式，否则不使用该类：

```html
<div id="app">
  <label for="r1">修改颜色</label><input type="checkbox" v-model="use" id="r1">
  <br><br>
  <div v-bind:class="{'class1': use}">
    v-bind:class 指令
  </div>
</div>
    
<script>
new Vue({
    el: '#app',
  data:{
      use: false
  }
});
</script>
```

当 checkbox 被勾选的时候， use 值为真，此时下方的 class1 样式就会生效。

## 表达式

Vue.js 都提供了完全的 JavaScript 表达式支持。

```js
<div id="app">
    \{\{5+5\}\}<br>
    \{\{ ok ? 'YES' : 'NO' \}\}<br>
    \{\{ message.split('').reverse().join('') \}\}
    <div v-bind:id="'list-' + id">菜鸟教程</div>
</div>

<script>
    new Vue({
        el: '#app',
        data: {
            ok: true,
            message: 'RUNOOB',
            id : 1
        }
    })
</script>
```

内容如下：

```
10
YES
BOONUR
菜鸟教程
```

ps: 用 js 实现了解析 js 的引擎，禁止套娃。。。


# 指令

指令是带有 `v-` 前缀的特殊属性。

指令用于在表达式的值改变时，将某些行为应用到 DOM 上。

如下例子：

```html
<div id="app">
    <p v-if="seen">现在你看到我了</p>
</div>
    
<script>
new Vue({
  el: '#app',
  data: {
    seen: true
  }
})
</script>
```

这里， v-if 指令将根据表达式 seen 的值(true 或 false )来决定是否插入 p 元素。

## 参数

参数在指令后以冒号指明。

例如， v-bind 指令被用来响应地更新 HTML 属性：

```html
<div id="app">
    <pre><a v-bind:href="url">菜鸟教程</a></pre>
</div>
    
<script>
new Vue({
  el: '#app',
  data: {
    url: 'http://www.runoob.com'
  }
})
</script>
```

在这里 href 是参数，告知 v-bind 指令将该元素的 href 属性与表达式 url 的值绑定。

另一个例子是 v-on 指令，它用于监听 DOM 事件：

```html
<a v-on:click="doSomething">
```

在这里参数是监听的事件名。

## 修饰符

修饰符是以半角句号 `.` 指明的特殊后缀，用于指出一个指令应该以特殊方式绑定。

例如，.prevent 修饰符告诉 v-on 指令对于触发的事件调用 event.preventDefault()：

```html
<form v-on:submit.prevent="onSubmit"></form>
```

## 综合的例子

```html
<div id="app">
    <div v-if="seen">
        你看见我了
    </div>

    <div v-bind:title="title">
        鼠标悬浮试试
    </div>

    <button v-on:click="alertWhenClick">米奇不妙按钮</button>

</div>

<script>
    new Vue({
        el: '#app',
        data: {
            seen: true,
            title: '响应式标题',
        },
        methods: {
            alertWhenClick: function () {
                alert("click");
                this.seen = false;
                this.title = "点击之后我就变身！";
            }
        }
    })
</script>
```

# 用户输入

在 input 输入框中我们可以使用 v-model 指令来实现双向数据绑定：

v-model 指令用来在 input、select、textarea、checkbox、radio 等表单控件元素上创建双向数据绑定，根据表单上的值，自动更新绑定的元素的值。

按钮的事件我们可以使用 v-on 监听事件，并对用户的输入进行响应。

```html
<div id="app">
    <p>\{\{ message \}\}</p>

    <input v-model="message"/>

    <button v-on:click="reverseMessage">反转</button>

</div>

<script>
    new Vue({
        el: '#app',
        data: {
            message: '公众号：老马啸西风'
        },
        methods: {
            reverseMessage: function () {
                this.message = this.message.split('')
                    .reverse().join('');
            }
        }
    })
</script>
```

当我们操作输入框的时候，message 的信息都会随之变动。

到这里，我们就可以体会到数据绑定的快乐了，这种快乐和以前使用 jQuery 一点点去操作是完全不同的。


# 过滤器

Vue.js 允许你自定义过滤器，被用作一些常见的文本格式化。

由"管道符"指示, 格式如下：

```html
<!-- 在两个大括号中 -->
\{\{ message | capitalize \}\}

<!-- 在 v-bind 指令中 -->
<div v-bind:id="rawId | formatId"></div>
```

过滤器函数接受表达式的值作为第一个参数。

以下实例对输入的字符串第一个字母转为大写：

```html
<div id="app">
  \{\{ message | capitalize \}\}
</div>
    
<script>
new Vue({
  el: '#app',
  data: {
    message: 'runoob'
  },
  filters: {
    capitalize: function (value) {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  }
})
</script>
```

## 串联

过滤器可以串联：

```
\{\{ message | filterA | filterB \}\}
```

## 接受参数

过滤器是 JavaScript 函数，因此可以接受参数：

```
\{\{ message | filterA('arg1', arg2) \}\}
```

这里，message 是第一个参数，字符串 'arg1' 将传给过滤器作为第二个参数， arg2 表达式的值将被求值然后传给过滤器作为第三个参数。

# 缩写


## v-bind 缩写

Vue.js 为两个最为常用的指令提供了特别的缩写：

```html
<!-- 完整语法 -->
<a v-bind:href="url"></a>
<!-- 缩写 -->
<a :href="url"></a>
```

## v-on 缩写

```html
<!-- 完整语法 -->
<a v-on:click="doSomething"></a>
<!-- 缩写 -->
<a @click="doSomething"></a>
```

# 拓展阅读

[NPM-node.js 的包管理工具](https://houbb.github.io/2018/04/24/npm)

[webpack](https://houbb.github.io/2018/04/23/webpack-01-quick-start)

# 参考资料

[菜鸟教程](https://www.runoob.com/vue2/vue-tutorial.html)

[NPM 使用介绍](https://www.runoob.com/nodejs/nodejs-npm.html#taobaonpm)

* any list
{:toc}