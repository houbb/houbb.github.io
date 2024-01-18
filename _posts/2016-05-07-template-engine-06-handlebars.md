---
layout: post
title:  Template Engine-06-模板引擎 Handlebars 入门介绍
date:  2016-5-7 17:21:21 +0800
categories: [Template]
tags: [template, sh]
published: true
---

# 拓展阅读

[java 表达式引擎](https://houbb.github.io/2020/06/21/expression-for-java)

[logstash 日志加工处理-08-表达式执行引擎 AviatorScript+MVEL+OGNL+SpEL+JEXL+JUEL+Janino](https://houbb.github.io/2023/10/30/logstash-07-express-engine)

[QLExpress 阿里表达式引擎系统学习](https://houbb.github.io/2018/06/10/qlexpress-01-quick-start)

[Spring Boot-07-thymeleaf 模板引擎整合使用](https://houbb.github.io/2017/12/19/spring-boot-07-thymeleaf)

[Template Engine-01-模板引擎简介](https://houbb.github.io/2016/05/07/template-engine-01-overview)

[Template Engine-02-模板引擎 Freemarker](https://houbb.github.io/2016/05/07/template-engine-02-freemarker)

[Template Engine-03-模板引擎 Freemarker Advance](https://houbb.github.io/2016/05/07/template-engine-03-freemarker-advanced)

[Template Engine-04-模板引擎 Velocity](https://houbb.github.io/2016/05/07/template-engine-04-velocity)

[Template Engine-05-模板引擎 Thymeleaf 入门介绍](https://houbb.github.io/2016/05/07/template-engine-05-thymeleaf)

[Template Engine-06-模板引擎 Handlebars 入门介绍](https://houbb.github.io/2016/05/07/template-engine-06-handlebars)

[Template Engine-07-模板引擎 Mustache 入门介绍 Logic-less templates.](https://houbb.github.io/2016/05/07/template-engine-07-mustache)

# 什么是 Handlebars？
Handlebars 是一种简单的模板语言。

它使用模板和输入对象生成 HTML 或其他文本格式。Handlebars 模板看起来像带有嵌入的 Handlebars 表达式的常规文本。

模板

```
{% raw %}
<p>{{firstname}} {{lastname}}</p>
{% endraw %}
```

Handlebars 表达式是 {% raw %}{{，一些内容，后跟一个 }}{% endraw %}。

当执行模板时，这些表达式将被输入对象中的值替换。

了解更多：表达式

# 安装

测试 Handlebars 的最快方法是从 CDN 加载它并嵌入到 HTML 文件中。

```js
{% raw %}
<!-- 从 CDN 包含 Handlebars -->
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.js"></script>
<script>
  // 编译模板
  var template = Handlebars.compile("Handlebars <b>{{doesWhat}}</b>");
  // 执行已编译的模板并将输出打印到控制台
  console.log(template({ doesWhat: "rocks!" }));
</script>
{% endraw %}
```

警告

这种方法适用于小型页面和测试。当面向真实的生产系统时，有几种其他使用 Handlebars 的方法。

了解更多：安装

# 语言特性

## 简单表达式
如前所示，以下模板定义了两个 Handlebars 表达式

模板

```
{% raw %}<p>{{firstname}} {{lastname}}</p>{% endraw %}
```

如果应用于输入对象

输入

```
{
  firstname: "Yehuda",
  lastname: "Katz",
}
```

则表达式将被相应属性替换。结果如下

输出

```
{% raw %}<p>Yehuda Katz</p>{% endraw %}
```

# 嵌套输入对象

有时，输入对象包含其他对象或数组。例如：

输入

```
{
  person: {
    firstname: "Yehuda",
    lastname: "Katz",
  },
}
```

在这种情况下，您可以使用点符号来访问嵌套属性

模板

```
{% raw %}{{person.firstname}} {{person.lastname}}{% endraw %}
```

了解更多：表达式

一些内置助手允许您将当前上下文更改为嵌套对象。然后，您可以像访问根对象一样访问此对象

# 评估上下文

内置的块助手 each 和 with 允许您更改当前评估上下文。

with 助手深入到对象属性中，使您可以访问其属性

模板

```
{% raw %}
{{#with person}}
{{firstname}} {{lastname}}
{{/with}}
{% endraw %}
```
输入

```
{
  person: {
    firstname: "Yehuda",
    lastname: "Katz",
  },
}
```
each 助手遍历数组，允许您通过简单的 Handlebars 表达式访问每个对象的属性。

模板

```
{% raw %}
<ul class="people_list">
  {{#each people}}
    <li>{{this}}</li>
  {{/each}}
</ul>
{% endraw %}
```

输入
```
{
  people: [
    "Yehuda Katz",
    "Alan Johnson",
    "Charles Jolley",
  ],
}
```

了解更多：内置助手

# 模板注释
您可以在 Handlebars 代码中使用注释，就像在代码中一样。由于通常存在一定程度的逻辑，这是一种良好的实践。

注释不会出现在生成的输出中。如果希望注释显示出来，只需使用 HTML 注释，它们



# chat

## 详细介绍一下 模板引擎 Handlebars

# Handlebars模板引擎详细介绍

## 1. 概述
Handlebars是一款简单而强大的模板引擎，用于将数据和模板合并生成HTML。它是一个逻辑-less、零配置的工具，专注于数据绑定和模板渲染。Handlebars的设计目标是使模板更加清晰、简洁，让开发人员专注于数据和结构。

## 2. 基本语法
Handlebars使用两对花括号（`{{`和`}}`）表示要插入的变量。以下是一些基本语法的示例：

### 2.1 插值
```handlebars
<p>Hello, {{name}}!</p>
```
在这个例子中，`{{name}}`将会被实际数据替换，生成类似于`<p>Hello, John!</p>`的HTML。

### 2.2 表达式
Handlebars支持简单的表达式，可以在模板中执行一些基本的逻辑。例如：
```handlebars
{{#if isAdmin}}
  <p>Welcome, Administrator!</p>
{{else}}
  <p>Welcome, User!</p>
{{/if}}
```
这里使用了`{{#if}}`和`{{else}}`语法来根据条件显示不同的欢迎消息。

### 2.3 循环
Handlebars允许对数组进行循环操作，以便在模板中重复渲染相同的结构：
```handlebars
<ul>
  {{#each users}}
    <li>{{this.name}}</li>
  {{/each}}
</ul>
```
在这个例子中，`{{#each users}}`会对`users`数组进行循环，对每个用户生成一个列表项。

### 2.4 部分（Partial）
Handlebars支持将模板分割为可重用的部分，称为部分。这使得可以在多个地方使用相同的结构。例如：
```handlebars
<!-- user.hbs -->
<p>{{name}}</p>
```
```handlebars
<!-- profile.hbs -->
<div class="user-profile">
  {{> user}}
</div>
```
在`profile.hbs`中，通过`{{> user}}`引入了`user.hbs`的内容。

## 3. 注册Helper
Handlebars允许注册自定义的Helper函数，以执行更高级的逻辑。Helper是模板中的函数，可以接受参数。例如：
```handlebars
{{#ifCond value1 '==' value2}}
  <p>Values are equal!</p>
{{else}}
  <p>Values are not equal!</p>
{{/ifCond}}
```
上述例子中的`ifCond`就是一个自定义Helper，执行了两个值的相等性检查。

## 4. 使用Handlebars

在使用Handlebars时，需要引入Handlebars库，并加载模板文件。

在浏览器端，可以通过CDN引入Handlebars库，或者使用Node.js和NPM进行安装。

### 4.1 浏览器端示例
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Handlebars Example</title>
</head>
<body>

  <script src="https://cdn.jsdelivr.net/npm/handlebars/dist/handlebars.min.js"></script>

  <script id="my-template" type="text/x-handlebars-template">
    <p>Hello, {{name}}!</p>
  </script>

  <script>
    // Compile the template
    var source = document.getElementById('my-template').innerHTML;
    var template = Handlebars.compile(source);

    // Data
    var context = { name: 'John' };

    // Render the template with data
    var html = template(context);

    // Insert the rendered HTML into the document
    document.body.innerHTML += html;
  </script>

</body>
</html>
```

### 4.2 Node.js示例

首先，通过NPM安装Handlebars：
```bash
npm install handlebars
```
然后，使用Handlebars在Node.js中渲染模板：
```javascript
const Handlebars = require('handlebars');

// Template source
const source = '<p>Hello, {{name}}!</p>';

// Compile the template
const template = Handlebars.compile(source);

// Data
const context = { name: 'John' };

// Render the template with data
const html = template(context);

// Output the rendered HTML
console.log(html);
```

## 5. 总结

Handlebars是一个简单而强大的模板引擎，通过清晰的语法和基本的逻辑处理，使得数据绑定和模板渲染变得简单而直观。

它适用于浏览器端和Node.js环境，广泛应用于前端开发和服务器端渲染。 

Handlebars的简单性和可扩展性使其成为流行的模板引擎之一。

## 给出 Handlebars 深入学习的资料，包含网址

以下是深入学习Handlebars的一些资料和网址：

1. **Handlebars 官方文档**:
   - [Handlebars.js Documentation](https://handlebarsjs.com/)
     Handlebars的官方文档包含了详细的使用说明、语法、API参考等内容。

2. **Handlebars GitHub 仓库**:
   - [Handlebars GitHub Repository](https://github.com/handlebars-lang/handlebars.js)
     Handlebars的源代码托管在GitHub上，你可以查看最新的源码、提交记录以及问题跟踪。

3. **Handlebars 辅助学习资源**:
   - [Learning Handlebars.js - Code School](https://www.codeschool.com/courses/warming-up-with-ember-js)
     Code School提供的 Handlebars.js 课程，通过实际案例演示如何使用 Handlebars。

4. **Handlebars 教程和示例**:
   - [Handlebars Tutorial](https://handlebarsjs.com/guide/)
     Handlebars官方网站上的教程部分，提供了基础和进阶的 Handlebars 使用示例。

5. **Handlebars 深入理解**:
   - [Handlebars - A Template Engine](https://medium.com/@chetanverma01/handlebars-a-template-engine-5de216012329)
     本文深入介绍Handlebars的原理和用法，适合想深入理解其内部机制的开发者。

6. **Handlebars.js 教程 - W3Schools**:
   - [Handlebars.js Tutorial](https://www.w3schools.com/whatis/whatis_handlebars.asp)
     W3Schools提供的Handlebars.js教程，适合初学者入门。

请注意，由于互联网上的内容可能随时更改，建议访问官方文档和学习资源以获取最新信息。

# 参考资料

https://handlebarsjs.com/guide/#what-is-handlebars

* any list
{:toc}