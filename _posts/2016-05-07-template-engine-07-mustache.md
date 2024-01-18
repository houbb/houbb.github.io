---
layout: post
title:  Template Engine-07-模板引擎 Mustache 入门介绍 Logic-less templates.
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

# 什么是 Mustache

Available in Ruby, JavaScript, Python, Erlang, Elixir, PHP, Perl, Raku, Objective-C, Java, C#/.NET, Android, C++, CFEngine, Go, Lua, ooc, ActionScript, ColdFusion, Scala, Clojure[Script], Clojure, Fantom, CoffeeScript, D, Haskell, XQuery, ASP, Io, Dart, Haxe, Delphi, Racket, Rust, OCaml, Swift, Bash, Julia, R, Crystal, Common Lisp, Nim, Pharo, Tcl, C, ABAP, Elm, Kotlin, SQL, PowerShell, and for Odin

Works great with TextMate, Vim, Emacs, Coda, and Atom

The Manual: mustache(5) and mustache(1)

Specification

Playground

Chat: +mustache:matrix.org on Matrix.org

GitHub pages: https://github.com/mustache/mustache.github.com

PS: 格局确实很大，可以在这么多语言中使用。

# Mustache - 无逻辑模板

## 概要
一个典型的Mustache模板：

```
Hello {{name}}
You have just won {{value}} dollars!
{{#in_ca}}
Well, {{taxed_value}} dollars, after taxes.
{{/in_ca}}
```

给定以下哈希：

```json
{
  "name": "Chris",
  "value": 10000,
  "taxed_value": 10000 - (10000 * 0.4),
  "in_ca": true
}
```

将产生以下结果：

```
Hello Chris
You have just won 10000 dollars!
Well, 6000.0 dollars, after taxes.
```

## 描述
Mustache可用于HTML、配置文件、源代码等任何内容。它通过在模板中使用哈希或对象中提供的值来展开标签。

我们称之为“无逻辑”，因为没有if语句、else子句或for循环。相反，只有标签。一些标签被替换为值，一些为空，而其他一些是一系列值。这份文档解释了Mustache标签的不同类型。

Mustache语言有一个正式的规范。当前manpage反映了规范的1.3.0版本，包括官方但可选的用于lambda和继承的扩展。

## 标签类型
标签由双花括号指示。`{{person}}`是一个标签，`{{#person}}`也是。在这两个例子中，我们将`person`称为键或标签键。让我们讨论一下不同类型的标签。

### 变量
最基本的标签类型是变量。在基本模板中，`{{name}}`标签将尝试在当前上下文中查找`name`键。如果没有`name`键，将递归检查父上下文。如果达到顶层上下文并且`name`键仍然找不到，则不会呈现任何内容。

默认情况下，所有变量都会进行HTML转义。如果要返回未经转义的原始内容，请使用三个花括号：`{{{name}}}`。

您还可以使用`&`返回其原始内容：`{{& name}}`。当更改分隔符时（参见“设置分隔符”下面），这可能会很有用。

默认情况下，变量“未命中”会返回一个空字符串。这通常可以在Mustache库中配置。例如，Mustache的Ruby版本支持在这种情况下引发异常。

模板：

```mustache
* {{name}}
* {{age}}
* {{company}}
* {{{company}}}
```

哈希：

```json
{
  "name": "Chris",
  "company": "<b>GitHub</b>"
}
```

输出：

```html
* Chris
*
* &lt;b&gt;GitHub&lt;/b&gt;
* <b>GitHub</b>
```

### 带点的名称
如果名称中包含点，则它将在点上拆分以获取多个键。首先将在上下文中查找第一个键，如果找到，则在前一个结果中查找下一个键。这将重复，直到找不到键或找到最后一个键。最终结果将像上面一样插值。

模板：

```mustache
* {{client.name}}
* {{age}}
* {{client.company.name}}
* {{{company.name}}}
```

哈希：

```json
{
  "client": {
    "name": "Chris & Friends",
    "age": 50
  },
  "company": {
    "name": "<b>GitHub</b>"
  }
}
```

输出：

```html
* Chris &amp; Friends
*
*
* <b>GitHub</b>
```

### 隐式迭代器
作为特殊情况，如果名称只包含一个点而没有其他内容，则当前上下文的值将作为整体插值。如果父上下文是一个列表，这是特别有用的；参见下面的“Sections”。

模板：

```mustache
* {{.}}
```

当前上下文：

```
"Hello!"
```

输出：

```html
* Hello!
```

### Lambda
如果在查找过程中找到的任何值都是可调用对象，例如函数或lambda，则将使用零参数调用此对象。然后使用返回的值而不是可调用对象本身。

规范的一个可选部分规定，如果名称中的最终键是返回字符串的lambda，则应在插值之前将该字符串呈现为Mustache模板。它将使用默认分隔符（参见下面的“设置分隔符”）针对当前上下文呈现。

模板：

```mustache
* {{time.hour}}
* {{today}}
```

哈希：

```json
{
  "year": 1970,
  "month": 1,
  "day": 1,
  "time": function() {
    return {
      "hour": 0,
      "minute": 0,
      "second": 0
    }
  },
  "today": function() {
    return "{{year}}-{{month}}-{{day}}"
  }
}
```

输出：

```
* 0
* 1970-1-1
```

### Sections
Sections根据当前上下文中键的值零次或多次呈现文本块。

点名的查找方式与变量相同，除了对lambda的稍微不同的处理方式。稍后会详细讨论这一点。

一个section以井号开始，以斜杠结束。也就是说，`{{#person}}`开始了一个“person”部分，而`{{/person}}`结束了它。

section的行为由键查找的最终值确定。

#### 假值或空列表
如果person键存在并且其值为false或空列表，则在井号和斜杠之间的HTML将不会显示。

模板：

```mustache
Shown.
{{#person}}
  Never shown!
{{/person}}
```

哈希：

```json
{
  "person": false
}
```

输出：

```
Shown.
```

#### 非空列表
如果person键存在并且具有非

false值，则在井号和斜杠之间的HTML将呈现并显示一次或多次。

当值是非空列表时，块中的文本将针对列表中的每个项目显示一次。块的上下文将在每次迭代中设置为当前项目。通过这种方式，我们可以循环遍历集合。

模板：

```mustache
{{#repo}}
  <b>{{name}}</b>
{{/repo}}
```

哈希：

```json
{
  "repo": [
    { "name": "resque" },
    { "name": "hub" },
    { "name": "rip" }
  ]
}
```

输出：

```html
  <b>resque</b>
  <b>hub</b>
  <b>rip</b>
```

可以通过使用隐式迭代器（参见上面的变量）而不是嵌套对象来实现与上述相同的效果。

模板：

```mustache
{{#repo}}
  <b>{{.}}</b>
{{/repo}}
```

哈希：

```json
{
  "repo": ["resque", "hub", "rip"]
}
```

输出：

```html
  <b>resque</b>
  <b>hub</b>
  <b>rip</b>
```

#### Lambda
当在查找过程中找到的任何值是可调用对象，例如函数或lambda时，该对象将被调用并传递文本块。传递的文本是文字块，未呈现。`{{tags}}`将不会被展开。

规范的一个可选部分规定，如果名称中的最终键是返回字符串的lambda，则该字符串将替换部分的内容。它将使用与原始部分内容相同的分隔符（参见下面的“设置分隔符”）进行呈现。通过这种方式，您可以实现过滤器或缓存。

模板：

```mustache
{{#wrapped}}{{name}} is awesome.{{/wrapped}}
```

哈希：

```json
{
  "name": "Willy",
  "wrapped": function(text) {
    return "<b>" + text + "</b>"
  }
}
```

输出：

```html
<b>Willy is awesome.</b>
```

#### 非假值
当值是非false但不是列表时，它将用作块的单次呈现的上下文。

模板：

```mustache
{{#person?}}
  Hi {{name}}!
{{/person?}}
```

哈希：

```json
{
  "person?": { "name": "Jon" }
}
```

输出：

```
  Hi Jon!
```

### 反转的Sections
反转的section以插入符（脱帽）开始，并以斜杠结束。也就是说，`{{^person}}`开始了一个“person”反转的section，而`{{/person}}`结束了它。

虽然section可以根据键的值零次或多次呈现文本，但反转的section可能会基于键的反向值呈现文本一次。也就是说，它们将在键不存在、为false或为空列表时呈现。

模板：

```mustache
{{#repo}}
  <b>{{name}}</b>
{{/repo}}
{{^repo}}
  No repos :(
{{/repo}}
```

哈希：

```json
{
  "repo": []
}
```

输出：

```
  No repos :(
```

### 注释
注释以感叹号开始，将被忽略。以下模板：

```html
<h1>Today{{! ignore me }}.</h1>
```

将呈现如下：

```html
<h1>Today.</h1>
```

注释可能包含换行符。

### 部分
部分以大于号开始，如 `{{> box}}`。

部分在运行时呈现（而不是编译时），因此递归部分是可能的。只需避免无限循环。

它们还继承调用上下文。而在ERB中可能会这样：

```html
<%= partial :next_more, :start => start, :size => size %>
```

Mustache只需要这样：

```mustache
{{> next_more}}
```

为什么？因为`next_more.mustache`文件将继承来自调用上下文的`size`和`start`方法。

因此，您可能想将部分视为包含或模板扩展，即使这不是字面上的事实。

例如，此模板和部分：

**base.mustache**:
```html
<h2>Names</h2>
{{#names}}
  {{> user}}
{{/names}}
```

**user.mustache**:
```html
<strong>{{name}}</strong>
```

可以被视为单个扩展的模板：

```html
<h2>Names</h2>
{{#names}}
  <strong>{{name}}</strong>
{{/names}}
```

#### 动态名称
部分可以使用动态名称在运行时动态加载；这是Mustache规范的一个可选部分，允许在运行时动态确定标记的内容。

动态名称由星号开头，后跟与变量标记中相同的符号和解析，即 `{{>*dynamic}}`。可以将其视为以下假设的标记（不允许！）： `{{>{{dynamic}}}}`。

模板：

**main.mustache**:
```mustache
Hello {{>*dynamic}}
```

**world.template**:
```
everyone!
```

哈希：

```json
{
  "dynamic": "world"
}
```

输出：

```
Hello everyone!
```

### 块

块以美元符号开始，以斜杠结束。也就是说，`{{$title}}`开始了一个“title”块，而`{{/title}}`结束了它。

块标记模板的可能被覆盖的部分。这可以通过调用模板中具有相同名称的块来完成（参见下面的“父母”）。如果没有被覆盖，块的内容将像没有`{{$title}}`和`{{/title}}`标签一样呈现。

块可以被看作是模板参数或传递到另一个模板的内联局部。它们是可选的继承扩展的一部分。

模板 article.mustache：

```mustache
<h1>{{$title}}今天的新闻{{/title}}</h1>
{{$body}}
<p>没什么特别的事情发生。</p>
{{/body}}
```

输出：

```html
<h1>今天的新闻</h1>
<p>没什么特别的事情发生。</p>
```

父模板
父模板以小于号开头，以斜杠结束。也就是说，{{<article}} 开始一个 "article" 父模板，{{/article}} 结束。

与 {{>article}} 局部模板不同，父模板允许你在当前模板内部扩展另一个模板。与局部模板不同，父模板还允许你覆盖另一个模板的块。

父模板中的块可以再次被包含模板覆盖。父模板中的其他内容将被忽略，就像注释一样。

模板：

```mustache
{{<article}}
  永远不会显示
  {{$body}}
    {{#headlines}}
    <p>{{.}}</p>
    {{/headlines}}
  {{/body}}
{{/article}}

{{<article}}
  {{$title}}昨天{{/title}}
{{/article}}
```

哈希：

```json
{
  "headlines": [
    "一只哈巴狗的主人留起了胡子。",
    "多么激动人心的一天！"
  ]
}
```

输出，假设之前的 article.mustache 模板：

```html
<h1>今天的新闻</h1>
<p>一只哈巴狗的主人留起了胡子。</p>
<p>多么激动人心的一天！</p>

<h1>昨天</h1>
<p>没什么特别的事情发生。</p>
```

动态名称
一些 Mustache 实现可能允许在父标记中使用动态名称，类似于局部标记中的动态名称。以下是父标记中动态名称的工作原理示例。

模板：

```mustache
{{!normal.mustache}}
{{$text}}Here goes nothing.{{/text}}

{{!bold.mustache}}
<b>{{$text}}Here also goes nothing but it's bold.{{/text}}</b>

{{!dynamic.mustache}}
{{<*dynamic}}
  {{$text}}Hello World!{{/text}}
{{/*dynamic}}
```

哈希：

```json
{
  "dynamic": "bold"
}
```

输出：

```html
<b>Hello World!</b>
```

设置分隔符
设置分隔符标签以等号开头，将标记分隔符从 {{ 和 }} 更改为自定义字符串。

考虑以下刻意的例子：

```mustache
* {{default_tags}}
{{=<% %>=}}
* <% erb_style_tags %>
<%={{ }}=%>
* {{ default_tags_again }}
```

这里有一个包含三个项目的列表。第一个项目使用默认的标记样式，第二个使用由设置分隔符标记定义的 erb 样式，第三个在另一个设置分隔符声明之后返回默认样式。

根据 ctemplates，这 "对于像 TeX 这样的语言很有用，其中双大括号可能出现在文本中，对于标记而言很笨拙"。

自定义分隔符不能包含空格或等



# Mustache 模板引擎详细介绍， 

Mustache 是一种逻辑-less模板语言，可以在多种编程语言中使用，具有简单、一致和易于学习的特点。

它最初是由[Chris Wanstrath](https://github.com/defunkt) 创建的，目前被广泛应用于Web开发和其他领域。

## 特点

1. **逻辑-less：** Mustache 是一种逻辑-less 模板引擎，即它没有条件判断、循环等控制语句。这使得模板保持简单、干净、易于理解。

2. **多语言支持：** Mustache 模板可以在多种编程语言中使用，包括 JavaScript、Java、Python、Ruby、Go 等。这意味着你可以在不同的环境中共享相同的模板文件。

3. **简洁性：** 模板语法非常简洁，主要由`{{ }}`标签组成，易于阅读和书写。

4. **数据驱动：** Mustache 模板是数据驱动的，即它的输出取决于提供给它的数据。这种数据与视图的分离使其成为一个理想的模板引擎。

## 语法

Mustache 的语法非常简单，由两种主要标签组成：

- `{{ expression }}`: 双大括号标签，用于输出变量值或执行简单的表达式。

- `{{# section }} ... {{/ section }}`: 井号标签，用于定义一个节（section）。根据提供的数据，这个节可以是重复的块、条件块等。

下面是一个简单的 Mustache 模板示例：

```mustache
Hello, {{name}}!
{{#attended}}
  Welcome to our event!
{{/attended}}
```

在这个例子中，`{{name}}` 将被替换为提供的 `name` 值。如果 `attended` 是真值（true），则 `Welcome to our event!` 也将被输出。

## 使用示例

### JavaScript 中使用 Mustache

在 JavaScript 中使用 Mustache 非常简单。你可以通过引入 Mustache 库，并使用它的 `render` 函数将数据渲染到模板中。

```javascript
// 引入 Mustache 库
const Mustache = require('mustache');

// 定义模板
const template = 'Hello, {{name}}!';

// 提供数据
const data = { name: 'John' };

// 渲染模板
const output = Mustache.render(template, data);

// 输出结果
console.log(output); // Hello, John!
```

### HTML 中使用 Mustache

在 HTML 中使用 Mustache 通常需要引入 Mustache.js 库，并在页面中加载该库。以下是一个简单的 HTML 示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mustache Example</title>
  <!-- 引入 Mustache.js 库 -->
  <script src="https://cdn.jsdelivr.net/npm/mustache@4.0.1/mustache.min.js"></script>
</head>
<body>
  <!-- 定义模板容器 -->
  <div id="output"></div>

  <script>
    // 定义模板
    const template = 'Hello, {{name}}!';

    // 提供数据
    const data = { name: 'Jane' };

    // 渲染模板
    const output = Mustache.render(template, data);

    // 将渲染结果插入到页面中
    document.getElementById('output').innerHTML = output;
  </script>
</body>
</html>
```

## Mustache 模板引擎的优缺点

### 优点

1. **简单易学：** Mustache 的语法非常简单，几乎没有学习成本。这使得它成为入门模板引擎的理想选择。

2. **逻辑分离：** 由于没有复杂的控制语句，Mustache 强调逻辑与数据的分离。这有助于保持清晰的模板结构。

3. **多语言支持：** Mustache 支持多种编程语言，使得相同的模板可以在不同的环境中使用。

### 缺点

1. **逻辑受限：** Mustache 的逻辑非常受限，不能执行复杂的逻辑操作。这使得它在某些情况下可能不够灵活。

2. **功能有限：** 由于其逻辑-less 的设计，Mustache 缺少一些其他模板引擎可能具有的高级功能。

3. **依赖外部库：** 在某些环境中，使用 Mustache 需要引入外部库，增加了一些依赖关系。

## 结语

Mustache 是一种简单而强大的模板引擎，特别适合那些强调简洁性和逻辑分离的场景。它被广泛用于前端和后端开发，并在不同的编程语言中取得了成功。尽管在处理复杂逻辑和功能丰富的场

## Mustache 的跨语言是如何实现的？是写了多套吗

Mustache 的跨语言实现并不是通过编写多套模板引擎来实现的。

相反，Mustache 采用了一种标准的模板语法规范，以确保在不同编程语言中都能实现一致的行为。

这种一致性使得在不同语言中使用相同的模板文件成为可能。

Mustache 语法规范定义了一组标签和规则，包括 `{{ expression }}`、`{{# section }} ... {{/ section }}` 等，以及输出、条件块等基本操作。各个语言的 Mustache 实现都需要遵循这些规范，以确保对相同模板和数据的处理结果是一致的。

在不同的编程语言中，Mustache 的实现通常包括以下核心功能：

1. **模板解析：** 将 Mustache 模板解析成内部数据结构，以便后续的数据填充和渲染。

2. **数据填充：** 将解析后的模板与提供的数据结合，替换模板中的变量和执行相应的条件块。

3. **输出生成：** 生成最终的输出结果，可以是 HTML、文本或其他格式，取决于模板的用途。

由于这些功能都是根据 Mustache 语法规范实现的，因此在不同语言中的实现可以保持一致。例如，JavaScript、Java、Python、Ruby 等不同语言中的 Mustache 库都遵循相同的规范，使得相同的模板可以在这些环境中使用。

因此，Mustache 的跨语言实现是通过在不同语言中遵循相同的规范和语法来实现的，而不是通过编写多套模板引擎。这使得 Mustache 成为一种非常灵活和可移植的模板引擎。

## 给出 Mustache 深入学习的资料，包含网址

以下是深入学习 Mustache 的一些建议和资源，包括网址：

1. **官方文档：**
   - [Mustache Official Documentation](https://mustache.github.io/): Mustache 官方文档提供了详细的语法规范、用法示例以及一些常见问题的解答。

2. **GitHub 仓库：**
   - [Mustache GitHub Repository](https://github.com/mustache/mustache): Mustache 的 GitHub 仓库包含源代码、issues、和一些贡献者的讨论。这是深入了解 Mustache 实现和参与社区讨论的好地方。

3. **Mustache 教程：**
   - [Mustache Tutorial](https://mustache.github.io/mustache.5.html): Mustache 官方网站上的教程，逐步介绍 Mustache 的基本概念和用法。

4. **Mustache Wiki：**
   - [Mustache Wiki](https://github.com/mustache/mustache/wiki): Mustache 的 Wiki 页面包含一些额外的资源、实践建议和与其他库集成的信息。

5. **JavaScript 版本 Mustache.js 的文档：**
   - [Mustache.js Documentation](https://github.com/janl/mustache.js/): 如果你在 JavaScript 环境下使用 Mustache，Mustache.js 的文档提供了详细的 JavaScript 版本的信息。

6. **Ruby 版本 Mustache.rb 的文档：**
   - [Mustache.rb Documentation](https://github.com/mustache/mustache): Mustache.rb 是 Ruby 中的 Mustache 实现，其文档包含 Ruby 版本的具体信息。

请注意，Mustache 是一种模板语言，因此深入学习的最佳方式是通过实践，创建和修改模板，理解它是如何处理变量、条件、循环等操作的。

通过查看实际的应用案例和示例代码，你可以更好地理解 Mustache 的灵活性和用法。

# 参考资料

https://handlebarsjs.com/guide/#what-is-handlebars

* any list
{:toc}