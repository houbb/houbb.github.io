---
layout: post
title: web-01-LESS CSS 预处理器
date:  2016-6-29 12:56:00 +0800
categories: [Web]
tags: [less, css, web-stack, web]
published: true
---

# {LESS}

Less 是一种 CSS 预处理器，这意味着它扩展了 CSS 语言，添加了变量、混合（mixins）、函数等功能，使您能够创建更易于维护、主题化和可扩展的 CSS。

> [less](http://lesscss.org/)

> [less zh_CN](http://less.bootcss.com/)

# Hello World

JavaScript 无法直接访问本地的 **.less** 文件，因此您可能需要一个 **HTTP 服务器**，如 Tomcat、Jetty 等。

这里我使用 Tomcat 作为示例。
 
- file list under *webapp*
 
```
│  index.html                                                                                                                                                                                                       
│                                                                                                                                                                                                                   
├─static                                                                                                                                                                                                           
│  ├─app                                                                                                                                                                                                          
│  │  └─less                                                                                                                                                                                                     
│  │          style.less                                                                                                                                                                                           
│  │                                                                                                                                                                                                               
│  └─lib                                                                                                                                                                                                          
│      └─less                                                                                                                                                                                                     
│              less.min.js                                                                                                                                                                                          
│                                                                                                                                                                                                                   
└─WEB-INF                                                                                                                                                                                                          
        web.xml
```

- web.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="2.4"
         xmlns="http://java.sun.com/xml/ns/j2ee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/j2ee http://java.sun.com/xml/ns/j2ee/web-app_2_4.xsd">

    <welcome-file-list>
        <welcome-file>index.html</welcome-file>
    </welcome-file-list>
</web-app>
```

- index.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta http-equiv="x-ua-compatible" content="IE=edge">
    <meta name="renderer" content="webkit">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

    <!--less-->
    <link rel="stylesheet/less" type="text/css" href="/static/app/less/style.less">
</head>


<body>

<div class="content">content</div>

</body>
<!-- JavaScript -->
<script src="/static/lib/less/less.min.js" type="text/javascript"></script>
</html>
```

- style.less

```
@blue: #0099FF;

.content {
	background: @blue;
}
```

- less.min.js

[Download](https://github.com/less/less.js) from the less web site.


<label class="label label-warning">Notice</label>

Your .less files must import **before** the less.min.js.


# Language Features

As an extension to CSS, Less is not only backwards compatible with CSS, but the extra features it adds use existing CSS syntax. 
This makes learning Less a breeze, and if in doubt, lets you fall back to vanilla CSS.

## Variables

> Control commonly used values in a single location.

You may use like these in before

```
a, .link {
  color: #428bca;
}
.widget {
  color: #fff;
  background: #428bca;
}
```

Variables make your code easier to maintain, like this

```
// Variables
@link-color:        #428bca; // sea blue

// Usage
a, .link {
  color: @link-color;
}
.widget {
  color: #fff;
  background: @link-color;
}
```

The variables also can use in following places.

> Selector

```
//selector
@header: header;

.@{header} {
	background: pink;
}
```

is the same as

```
.header {
	background: pink;
}
```

> URLs

```
//URLs
@img-url: "/static/app/img";
.content {
	background: url("@{img-url}/001.jpeg");;
}
```

> Import statement

If I define all colors in one less file, I want to import it.

```
@less-url: "/static/app/less";

@import "@{less-url}/color-constant.less";
```

> Properties

I'm tired of input background, so

```
//properties
@bg: background;

.header {
  @{bg}: #0099FF;
}
```

> Variable Names

```
@fnord:  "I am fnord.";
@var:    "fnord";
content: @@var;
```

complies to

```
content: "I am fnord.";
```

> Lazy Loading

Variables are lazy loaded and do not have to be declared before being used.

```
.header {
  background: @bg-color;
}
@bg-color: red;
```

When defining a variable twice, the last definition of the variable is used, searching from the current scope upwards. 
This is similar to css itself where the last property inside a definition is used to determine the value.

> Default Variables

I define blue-color in color-constant.less.

```
@blue-color: #0099FF;
```

I can easily override it like this.

```
@import "color-constant.less";

.header {
  background: @blue-color;
}

//if no this, color will be #0099ff
@blue-color: blue;
```

## Extend

Extend is a Less Pseudo-Class which merges the selector it is put on with ones that match what it references.

```
.base-color {
  background: #0099FF;
  color: #ffffff;
}

.header {
  &:extend(.base-color);
  font-size: 22px;
}
```

means .header extends all properties from  .base-color.

> Extend syntax

```
.a:extend(.b) {}

// the above block does the same thing as the below block
.a {
  &:extend(.b);
}
```

```
.c:extend(.d all) {
  // extends all instances of ".d" e.g. ".x.d" or ".d.x"
}
.c:extend(.d) {
  // extends only instances where the selector will be output as just ".d"
}
```

```
.e:extend(.f) {}
.e:extend(.g) {}

// the above an the below do the same thing
.e:extend(.f, .g) {}
Extend attached
```

> Extend attached to selector

Extend attached to a selector looks like an ordinary pseudoclass with selector as a parameter. A selector can contain multiple extend clauses, but all extends must be **at the end** of the selector.

- Extend after the selector: ```pre:hover:extend(div pre).```

- Space between selector and extend is allowed: ```pre:hover :extend(div pre)``

- Multiple extends are allowed: ```pre:hover:extend(div pre):extend(.bucket tr)```  is the same as ```pre:hover:extend(div pre, .bucket tr)```


> Extend inside ruleset

Extend can be placed into a ruleset's body using ```&:extend(selector)``` syntax. Placing extend into a body is a shortcut for placing it into every single selector of that ruleset.

```
pre:hover,
.some-class {
  &:extend(div pre);
}
```

same as 

```
pre:hover:extend(div pre),
.some-class:extend(div pre) {}
```

> Extending Nested Selectors

```
.bucket {
  tr { // nested ruleset with target selector
    color: blue;
  }
}
.some-class:extend(.bucket tr) {} // nested ruleset is recognized
```

output

```
.bucket tr,
.some-class {
  color: blue;
}
```

> Exact Matching with Extend

Extend by default looks for exact match between selectors. It does matter whether selector uses leading star or not. 
It does not matter that two nth-expressions have the same meaning, they need to have to **same form in order** to be matched. 
The only exception are *quotes in attribute selector*, less knows they have the same meaning and matches them.

```
.a.class,
.class.a,
.class > .a {
  color: blue;
}
.test:extend(.class) {} // this will NOT match the any selectors above
```

```
*.class {
  color: blue;
}
.noStar:extend(.class) {} // this will NOT match the *.class selector
```

```
link:hover:visited {
  color: blue;
}
.selector:extend(link:visited:hover) {}  // this will NOT match the link:hover:visited selector
```

- nth Expression

```
:nth-child(1n+3) {
  color: blue;
}
.child:extend(:nth-child(n+3)) {}       //NOT match
```

- Quote type in attribute selector does not matter. All of the following are equivalent.

```
[title=identifier] {
  color: blue;
}
[title='identifier'] {
  color: blue;
}
[title="identifier"] {
  color: blue;
}

.noQuote:extend([title=identifier]) {}
.singleQuote:extend([title='identifier']) {}
.doubleQuote:extend([title="identifier"]) {}
```

output

```
[title=identifier],
.noQuote,
.singleQuote,
.doubleQuote {
  color: blue;
}

[title='identifier'],
.noQuote,
.singleQuote,
.doubleQuote {
  color: blue;
}

[title="identifier"],
.noQuote,
.singleQuote,
.doubleQuote {
  color: blue;
}
```

> Extend "all"

When you specify the all keyword last in an extend argument it tells Less to match that selector as part of another selector. 
The selector will be copied and the matched part of the selector only will then be replaced with the extend, making a new selector.

```
.a.b.test,
.test.c {
  color: orange;
}
.test {
  &:hover {
    color: green;
  }
}

.replacement:extend(.test all) {}
```

output

```
.a.b.test,
.test.c,
.a.b.replacement,
.replacement.c {
  color: orange;
}
.test:hover,
.replacement:hover {
  color: green;
}
```

> Selector Interpolation with Extend

Extend is NOT able to match selectors with variables. If selector *contains variable*, extend will **ignore** it.

- Selector with variable will not be matched

```
@variable: .bucket;
@{variable} { // interpolated selector
  color: blue;
}
.some-class:extend(.bucket) {} // does nothing, no match is found
```

- extend with variable in target selector matches nothing:

```
.bucket {
  color: blue;
}
.some-class:extend(@{variable}) {} // interpolated selector matches nothing
@variable: .bucket;
```

- However, :extend attached to an interpolated selector works:

```
.bucket {
  color: blue;
}
@{variable}:extend(.bucket) {}
@variable: .selector;
```

output

```
.bucket, .selector {
  color: blue;
}
```

> Scoping / Extend Inside @media

Extend written inside a media declaration should match only selectors inside the **same media** declaration:

```
@media print {
  .screenClass:extend(.selector) {} // extend inside media
  .selector { // this will be matched - it is in the same media
    color: black;
  }
}
.selector { // ruleset on top of style sheet - extend ignores it
  color: red;
}
@media screen {
  .selector {  // ruleset inside another media - extend ignores it
    color: blue;
  }
}
```

Extend written inside a media declaration does NOT match selectors inside nested declaration:

```
@media screen {
  .screenClass:extend(.selector) {} // extend inside media
  @media (min-width: 1023px) {
    .selector {  // ruleset inside nested media - extend ignores it
      color: blue;
    }
  }
}
```

Top level extend matches **everything** including selectors inside nested media:

```
@media screen {
  .selector {  /* ruleset inside nested media - top level extend works */
    color: blue;
  }
  @media (min-width: 1023px) {
    .selector {  /* ruleset inside nested media - top level extend works */
      color: blue;
    }
  }
}

.topLevel:extend(.selector) {} /* top level extend matches everything */
```

complies to

```
@media screen {
  .selector,
  .topLevel { /* ruleset inside media was extended */
    color: blue;
  }
}
@media screen and (min-width: 1023px) {
  .selector,
  .topLevel { /* ruleset inside nested media was extended */
    color: blue;
  }
}
```

> Reducing CSS Size

Mixins copy all of the properties into a selector, which can lead to unnecessary duplication.
Therefore you can use **extends** instead of **mixins** to move the selector up to the properties you wish to use.

-  with mixin

```
.my-inline-block() {
    display: inline-block;
  font-size: 0;
}
.thing1 {
  .my-inline-block;
}
.thing2 {
  .my-inline-block;
}
```

output

```
.thing1 {
  display: inline-block;
  font-size: 0;
}
.thing2 {
  display: inline-block;
  font-size: 0;
}
```

- with extends

```
.my-inline-block {
  display: inline-block;
  font-size: 0;
}
.thing1 {
  &:extend(.my-inline-block);
}
.thing2 {
  &:extend(.my-inline-block);
}
```

output

```
.my-inline-block,
.thing1,
.thing2 {
  display: inline-block;
  font-size: 0;
}
```

# Mixins

You can mix-in class selectors and id selectors, e.g.

```
.base-color {
  background: #0099FF;
}
#big-font {
  font-size: 36px;
}

.header {
  .base-color;
  #big-font;
}
```

output

```
.base-color {
  background: #0099FF;
}
#big-font {
  font-size: 36px;
}

.header {
  background: #0099FF;
  font-size: 36px;
}
```

The () if optional, that's means  ```.base-color``` the same as ```.base-color()```

> Not Outputting the Mixin

If you want to create a mixin but you do not want that mixin to be output, you can put <kbd>()</kbd> after it.

```
.base-color() {
  background: #0099FF;
}

.header {
  .base-color;
}
```

output 

```
.header {
  background: #0099FF;
}
```

> Selectors in Mixins
 
```
.my-hover-mixin() {
  &:hover {
    border: 1px solid red;
  }
}
button {
  .my-hover-mixin();
}
```

output

```
button:hover {
  border: 1px solid red;
}
```

> Namespaces

```
#outer {
  .inner {
    color: red;
  }
}

.c {
  #outer > .inner;
}
```

Both  ```>```  and whitespace are optional.

> Guarded Namespaces

If namespace have a guard, mixins defined by it are used only if guard condition returns true.

the next two mixins work the same way

```
#namespace when (@mode=huge) {
  .mixin() { /* */ }
}

#namespace {
  .mixin() when (@mode=huge) { /* */ }
}
```

> The **!important** keyword

Use the ```!important``` keyword after mixin call to mark all properties inherited by it as ```!important```:

```
.foo (@bg: #f5f5f5, @color: #900) {
  background: @bg;
  color: @color;
}
.normal {
  .foo();
}
.important {
  .foo() !important;
}
```

output

```
.normal {
  background: #f5f5f5;
  color: #900;
}
.important {
  background: #f5f5f5 !important;
  color: #900 !important;
}
````

## Parametric Mixins

Mixins can also take arguments, which are variables passed to the block of selectors when it is mixed in.

```
.border-radius(@radius: 5px) {
  -webkit-border-radius: @radius;
     -moz-border-radius: @radius;
          border-radius: @radius;
}
```

> Mixins with Multiple Parameters

- It is legal to define multiple mixins with the same name and number of parameters.

```
.mixin(@color) {
  color-1: @color;
}
.mixin(@color; @padding: 2) {
  color-2: @color;
  padding-2: @padding;
}
.mixin(@color; @padding; @margin: 2) {
  color-3: @color;
  padding-3: @padding;
  margin: @margin @margin @margin @margin;
}
.some .selector div {
  .mixin(#008000);
}
```

output

```
.some .selector div {
  color-1: #008000;
  color-2: #008000;
  padding-2: 2;
}
```

> Named Parameters

A mixin reference can supply parameters values by their names instead of just positions. Any parameter can be referenced by its name and they do not have to be in any special order:

```
.mixin(@color: black; @margin: 10px; @padding: 20px) {
  color: @color;
  margin: @margin;
  padding: @padding;
}
.class1 {
  .mixin(@margin: 20px; @color: #33acfe);
}
.class2 {
  .mixin(#efca44; @padding: 40px);
}
```

output

```
.class1 {
  color: #33acfe;
  margin: 20px;
  padding: 20px;
}
.class2 {
  color: #efca44;
  margin: 10px;
  padding: 40px;
}
```

> The ```@arguments``` Variable

```@arguments``` has a special meaning inside mixins, it contains all the arguments passed, when the mixin was called. This is useful if you don't want to deal with individual parameters:

```
.box-shadow(@x: 0; @y: 0; @blur: 1px; @color: #000) {
  -webkit-box-shadow: @arguments;
     -moz-box-shadow: @arguments;
          box-shadow: @arguments;
}
.big-block {
  .box-shadow(2px; 5px);
}
```

output

```
.big-block {
  -webkit-box-shadow: 2px 5px 1px #000;
     -moz-box-shadow: 2px 5px 1px #000;
          box-shadow: 2px 5px 1px #000;
}
```

> Advanced Arguments and the @rest Variable

```
.mixin(...) {        // matches 0-N arguments
.mixin() {           // matches exactly 0 arguments
.mixin(@a: 1) {      // matches 0-1 arguments
.mixin(@a: 1; ...) { // matches 0-N arguments
.mixin(@a; ...) {    // matches 1-N arguments
```

```
.mixin(@a; @rest...) {
   // @rest is bound to arguments after @a
   // @arguments is bound to all arguments
}
```

> Pattern-matching

- define 

```
.mixin(dark; @color) {
  color: darken(@color, 10%);
}
.mixin(light; @color) {
  color: lighten(@color, 10%);
}
.mixin(@_; @color) {
  display: block;
}
```

- run

```
@switch: light;

.class {
  .mixin(@switch; #888);
}
```

- result

```
.class {
  color: #a2a2a2;
  display: block;
}
```

## Mixins as Functions

Variables and mixins defined in a mixin are visible and can be used in caller's scope. 

```
.mixin() {
  @width:  100%;
  @height: 200px;
}

.caller {
  .mixin();
  width:  @width;
  height: @height;
}
```

result

```
.caller {
  width:  100%;
  height: 200px;
}
```

Thus variables defined in a mixin can act as its return values. This allows us to create a mixin that can be used almost like a function.

```
.average(@x, @y) {
  @average: ((@x + @y) / 2);
}

div {
  .average(16px, 50px); // "call" the mixin
  padding: @average;    // use its "return" value
}
```

result

```
div {
  padding: 33px;
}
```

Variables defined directly in callers scope cannot be overridden. However, variables defined in callers parent scope is not protected and will be overridden:

```
.mixin() {
  @size: in-mixin;
  @definedOnlyInMixin: in-mixin;
}

.class {
  margin: @size @definedOnlyInMixin;
  .mixin();
}

@size: globaly-defined-value; // callers parent scope - no protection
```

result

```
.class {
  margin: in-mixin in-mixin;
}
```

Finally, mixin defined in mixin acts as return value too:

```
.unlock(@value) { // outer mixin
  .doSomething() { // nested mixin
    declaration: @value;
  }
}

#namespace {
  .unlock(5); // unlock doSomething mixin
  .doSomething(); //nested mixin was copied here and is usable
}
```

result

```
#namespace {
  declaration: 5;
}
```

* any list
{:toc}
























