---
layout: post
title: 前端 JQuery 入门使用简介
date:  2018-04-22 09:19:44 +0800
categories: [Web]
tags: [web, js, nodejs, sh]
published: true
---

# JQuery 

[JQuery](https://jquery.com/) is a fast, small, and feature-rich JavaScript library. 

It makes things like HTML document traversal and manipulation, event handling, animation, and Ajax much simpler with an easy-to-use API that works across a multitude of browsers.

With a combination of versatility and extensibility, jQuery has changed the way that millions of people write JavaScript.

# 快速开始

```js
<!DOCTYPE html>
<html>
<head>
<script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>
<script>
$(document).ready(function(){
  $("button").click(function(){
    $("#hidden-p").hide();
  });
});
</script>
</head>

<body>
<h2>这是一个标题</h2>
<p>这是一个段落。</p>
<p id="hidden-p">点击我就不见了，注意点。</p>
<button>点我</button>
</body>
</html>
```

## 示例页面

<h2>这是一个标题</h2>
<p>这是一个段落。</p>
<p id="hidden-p">点击我就不见了，注意点。</p>
<button>点我</button>


<script>
$(document).ready(function(){
  $("button").click(function(){
    $("#hidden-p").hide();
  });
});
</script>

# chat

## 详细介绍一下 jQuery

jQuery是一个快速、小巧且功能丰富的JavaScript库。它通过简化HTML文档遍历、事件处理、动画和Ajax交互，使得JavaScript的编写更加简洁。自2006年首次发布以来，jQuery已经成为Web开发中非常流行的工具之一。

### jQuery的主要特点：

1. **易于使用**：jQuery拥有一个直观的API，使得编写JavaScript代码更加容易和快速。

2. **跨浏览器兼容性**：jQuery能够兼容多种浏览器，包括IE6+、Firefox、Chrome、Safari等，隐藏了不同浏览器之间的差异。

3. **链式语法**：jQuery的链式调用语法使得代码更加简洁和易于阅读。

4. **丰富的插件生态**：jQuery有一个庞大的插件生态系统，开发者可以找到各种功能的插件，也可以自己编写插件。

5. **Ajax支持**：jQuery提供了简单的Ajax调用方法，如`$.ajax()`, `$.get()`, `$.post()`等，简化了与服务器的异步数据交互。

6. **动画效果**：jQuery的动画功能允许开发者轻松地为元素添加各种动画效果。

7. **文档就绪**：jQuery的`$(document).ready()`函数确保了在文档加载完成后执行JavaScript代码，无需使用`onload`属性。

### jQuery的基本用法：

1. **引入jQuery库**：在HTML文档的`<head>`或`<body>`中引入jQuery库文件。

```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
```

2. **选择元素**：使用jQuery选择器选择DOM元素，类似于CSS选择器。

```javascript
$('#myId') // 选择ID为myId的元素
$('.myClass') // 选择所有class为myClass的元素
$('p') // 选择所有的段落元素
```

3. **事件处理**：使用jQuery绑定事件处理器。

```javascript
$('#myButton').click(function() {
  alert('Button was clicked!');
});
```

4. **Ajax请求**：使用jQuery进行Ajax调用。

```javascript
$.ajax({
  url: 'myscript.php', // 要请求的URL
  type: 'GET', // 请求方式，GET 或 POST
  success: function(data) {
    // 请求成功后的回调函数
  },
  error: function() {
    // 请求失败后的回调函数
  }
});
```

5. **动画**：使用jQuery添加动画效果。

```javascript
$('#myDiv').fadeIn(); // 淡入效果
$('#myDiv').animate({ left: '+=50px' }, 300); // 向右移动50像素
```

6. **文档就绪**：

```javascript
$(document).ready(function() {
  // 当DOM加载完成后执行的代码
});
```

### jQuery插件：

jQuery插件是扩展jQuery功能的JavaScript文件。它们可以为jQuery添加新的选择器、效果、Ajax行为等。一些流行的jQuery插件包括：

- **Bootstrap**：一个前端UI库，它使用jQuery作为其JavaScript交互的基础。
- **DataTables**：一个表格插件，用于在HTML表格上实现动态排序、分页等。
- **jQuery UI**：由jQuery团队开发的官方插件，提供了一系列交互式组件和小部件。

### jQuery的缺点：

- **性能**：在处理大型DOM操作和动画时，jQuery可能不如原生JavaScript或一些现代框架性能高。

- **现代框架的兴起**：随着React、Vue和Angular等前端框架的流行，jQuery的使用有所减少，因为这些框架提供了更全面和高效的解决方案。

尽管如此，jQuery依然是一个非常有用的工具，特别是在需要跨浏览器兼容性和简化JavaScript编程的场景中。

## 为什么 jQuery 会被逐渐淘汰了？

jQuery 被逐渐淘汰的原因主要有以下几点：

1. **现代浏览器的原生 API 支持**：随着现代浏览器对原生 JavaScript API 的支持越来越好，许多之前需要 jQuery 完成的 DOM 操作和事件处理现在可以用更简洁的原生代码实现。

2. **性能问题**：jQuery 作为一个库，其体积相对较大，会增加页面的加载时间，尤其是在移动设备上，用户对页面加载速度的要求越来越高。

3. **前端框架的发展**：React、Vue.js 和 Angular 等现代前端框架的兴起，它们提供了更丰富的组件和更好的数据管理方式，使得开发者可以在不依赖 jQuery 的情况下构建复杂的单页应用。

4. **单页应用（SPA）的流行**：单页应用通常使用上述现代框架构建，它们减少了对 jQuery 这类传统库的依赖，因为 SPA 更注重组件化和状态管理。

5. **移动开发的需要**：随着移动互联网的普及，对前端交互和页面加载速度有更高的要求，jQuery 作为一个较为重量级的库，在移动设备上的性能表现不如更轻量级的解决方案。

6. **原生 JavaScript 的进步**：ECMAScript 的标准化和更新（如 ES6+）提供了许多新特性，如箭头函数、模板字符串、Promise 等，这些都使得原生 JavaScript 编程更加强大和方便，减少了对 jQuery 的依赖。

7. **社区和工具的支持**：现代前端框架拥有活跃的社区和丰富的工具支持，如 Vue CLI、React 的 create-react-app，这些工具简化了开发流程，使得开发者更容易上手和构建项目。

8. **代码的可维护性**：现代框架推崇组件化开发，使得代码更加模块化和可维护，而 jQuery 通常用于较为零散的 DOM 操作，这在大型项目中可能导致难以维护的问题。

综上所述，jQuery 被逐渐淘汰主要是因为现代浏览器的进步、前端框架的发展、性能需求的提升以及原生 JavaScript 的不断改进。

开发者社区正在向更现代、更高效的工具和实践迁移。

# 拓展阅读


[前端 Boostrap](https://houbb.github.io/2018/04/22/web-bootstrap)

[手写 jQuery 插件](https://houbb.github.io/2020/03/27/html-js-jquery)

# 参考资料

[手写 JQuery 框架](https://www.cnblogs.com/liangyin/p/7764248.html)

[jquery 入门教程](https://www.runoob.com/jquery/jquery-install.html)

* any list
{:toc}