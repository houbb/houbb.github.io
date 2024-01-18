---
layout: post
title: Template Engine-03-模板引擎 Freemarker Advance
date:  2016-5-7 17:21:21 +0800
categories: [Template]
tags: [template]
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

## 定义指令

### 基础

**宏**是与变量关联的模板片段。

```html
<#macro gray>
  <span class="text-muted">Hello Joe!</span>
</#macro>
```

<label class="label label-info">信息</label>

宏指令本身不会打印任何内容；通过在FTL标签中使用<kbd>@</kbd>而不是<kbd>#</kbd>来使用用户定义的指令。使用变量名作为指令名。

```html
<@macro gray></@macro>
```

或者

```html
<@macro/>
```

- 输出

```html
<span class="text-muted">Hello Joe!</span>
```

### 参数

让我们改进灰色宏，使其可以使用任意名称，而不仅仅是Joe。为此，您可以使用**参数**。

- 定义和调用

```html
<#macro gray name>
  <span class="text-muted">Hello ${name}!</span>
</#macro>

<@gray name="echo">
```

- 输出

```html
<span class="text-muted">Hello echo!</span>
```

您可以使用**多个参数**，例如

- 定义和调用

```html
<#macro gray name size>
  <span class="text-muted" size="${size}">Hello ${name}!</span>
</#macro>

<@gray name="echo" size=14 />
```

- 输出

```html
<span class="text-muted" size="14">Hello echo!</span>
```

您可以给方法一个**默认值**，例如

- 定义和调用

```html
<#macro gray name size=14>
  <span class="text-muted" size="${size}">Hello ${name}!</span>
</#macro>

<@gray name="echo" />
```

- 输出

```html
<span class="text-muted" size="14">Hello echo!</span>
```

### 嵌套内容

自定义指令可以具有嵌套内容，类似于预定义指令如
```html
<#if ...>nested content</#if>
```
可以有。

- 定义和调用

```html
<#macro border>
    <div class="warp">
        <#nested>
    </div>
</#macro>

<@border>Here is the nested content.</@border>
```

- 输出

```html
<div class="warp">
    Here is the nested content.
</div>
```

嵌套指令可以被调用**多次**，例如：

- 定义和调用

```html
<#macro do_three>
    <#nested>
    <#nested>
    <#nested>
</#macro>

<@do_three>hello world</@do_three>
```

- 输出

```html
<div class="warp">
Hello world
Hello world
Hello world
</div>
```

宏的局部变量在嵌套内容中是**不可见**的。比如说，这个例子：

- 定义和调用

```html
<#macro repeat count>
  <#local y = "test">
  <#list 1..count as x>
    ${y} ${count}/${x}: <#nested>
  </#list>
</#macro>

<@repeat count=3>${y!"?"} ${x!"?"} ${count!"?"}</@repeat>
```

- 输出

```html
test 3/1: ? ? ?
test 3/2: ? ? ?
test 3/3: ? ? ?
```

### 具有循环变量的宏

用户定义的指令也可以具有循环变量。

- 定义和调用

```html
<#macro do_three>
    <#nested 1>
    <#nested 2>
    <#nested 3>
</#macro>

<@do_three ; x> <#-- 用户定义的指令使用 ";" 而不是 "as" -->
${x} Anything.
</@do_three>
```

- 输出

```html
1 Anything.

2 Anything.

3 Anything.
```

循环变量的名称在用户定义的指令开始标记（<@...>）之后，参数和分号之后指定。

- 定义和调用

```html
<#macro repeat count>
  <#list 1..count as x>
    <#nested x, x/2, x==count>
  </#list>
</#macro>

<@repeat count=4 ; c, halfc, last>
  ${c}. ${halfc}<#if last> Last!</#if>
</@repeat>
```

- 输出

```html
1. 0.5
2. 1
3. 1.5
4. 2 Last!
```

## 定义变量

> 使用 **assign** 创建和替换变量

- 定义

```html
<#assign name = "echo">  <#-- 创建变量 echo -->
${name}
<#assign name = "hello"> <#-- 替换变量 name -->
${name}
```

- 输出

```
echo
hello
```

局部变量**隐藏（而不是覆盖）**同名的普通变量。循环变量隐藏（而不是覆盖）同名的局部和普通变量。例如：

```html
<#assign x = "plain">
1. ${x}  <#-- 在这里我们看到了普通变量 -->
<@test/>
6. ${x}  <#-- 普通变量的值没有更改 -->
<#list ["loop"] as x>
    7. ${x}  <#-- 现在循环变量隐藏了普通变量 -->
    <#assign x = "plain2"> <#-- 替换普通变量，这里隐藏无关紧要 -->
    8. ${x}  <#-- 它仍然隐藏普通变量 -->
</#list>
9. ${x}  <#-- 普通变量的新值 -->

<#macro test>
  2. ${x}  <#-- 在这里我们仍然看到了普通变量 -->
  <#local x = "local">
  3. ${x}  <#-- 现在局部变量隐藏了它 -->
  <#list ["loop"] as x>
    4. ${x}  <#-- 现在循环变量隐藏了局部变量 -->
  </#list>
  5. ${x

}  <#-- 现在我们又看到了局部变量 -->
</#macro>
```

- 输出

```
1. plain
2. plain
3. local
4. loop
5. local
6. plain
7. loop
8. loop
9. plain2
```

## 命名空间

> 创建库

- +添加文件 lib.ftl

```html
<#assign mail = "houbb.echo@gmail.com">

<#macro copyright date name="Echo">
Copyright (C) ${date} ${name}. All rights reserved.
</#macro>
```

- 修改 demo.ftl

```html
<#import "lib.ftl" as my> <#-- 名称为 "my" 的哈希将成为 "gate" -->
<@my.copyright date="1994-2016"/>
${my.mail}

<#assign mail="123456@gmail.com">
${mail}
```

- 输出

```html
Copyright (C) 1994-2016 Echo. All rights reserved.
houbb.echo@gmail.com

123456@gmail.com
```

> 写入导入命名空间的变量

有时，您可能想要**在导入的命名空间中创建或替换变量**。您可以使用assign指令来实现此目的，如果使用其命名空间参数。例如：

- 定义

```html
<#import "lib.ftl" as my> <#-- 名称为 "my" 的哈希将成为 "gate" -->
${my.mail}
<#assign mail="echo@other.com" in my>
${my.mail}
```

- 输出

```html
houbb.echo@gmail.com
echo@other.com
```

> 命名空间和数据模型

- lib.ftl

```html
<#macro copyright date name="${name}">
Copyright (C) ${date} ${name}. All rights reserved.
</#macro>

<#assign mail = "houbb.${name}@gmail.com">
```

- demo.ftl

```html
<#import "lib.ftl" as my> <#-- 名称为 "my" 的哈希将成为 "gate" -->
<@my.copyright date="1994-2016" />
${my.mail}
```

- 数据模型

```java
public class Demo {
    public static void main(String[] args) throws Exception {
        Template template = FreemarkerHelper.getTemplate("demo.ftl");

        //map build
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("name", "echo");

        FileHelper.createFile(template, "demo.html", map);
    }
}
```

- 输出

```html
Copyright (C) 1994-2016 echo. All rights reserved.
houbb.echo@gmail.com
```

> 命名空间的生命周期

如果尝试多次使用相同路径导入，则仅为第一次调用导入创建命名空间并运行指定路径的模板。稍后使用相同路径的导入将只是为同一命名空间创建**gate**哈希。例如：

- ftl

```html
<#import "lib.ftl" as my> <#-- 名称为 "my" 的哈希将成为 "gate" -->
<#import "lib.ftl" as foo> <#-- 名称为 "foo" 的哈希将成为 "gate" -->
<#import "lib.ftl" as bar> <#-- 名称为 "bar" 的哈希将成为 "gate" -->

${my.mail}
${foo.mail}
${bar.mail}

<#assign mail="echo@other.com" in my>

${my.mail}
${foo.mail}
${bar.mail}
```

- 输出

```html
houbb.echo@gmail.com
houbb.echo@gmail.com
houbb.echo@gmail.com

echo@other.com
echo@other.com
echo@other.com
```

## 扩展

现在，我们扩展freemarker，添加了三个指令：
```
@extends,@block,@override
```

<label class="label label-info">目的</label>

父模板定义布局，子模板可以覆盖布局的内容。

- +添加 base.ftl

```html
<html>
<head>
    <@block name="head">base_head_content</@block>
</head>
<body>
    <@block name="body">base_body_content</@block>
</body>
</html>
```

- 更改 demo.ftl

```html
<@override name="body">

<div class='content'>
    Powered By rapid-framework
</div>
</@override>

<@extends name="base.ftl"/>
```

- 输出

```html
<html>
<head>
base_head_content
</head>
<body>

<div class='content'>
    Powered By rapid-framework
</div>

</body>
</html>
```

- 在使用这些扩展指令之前，您应将它们添加到配置中。

```java
/**
 * 定义 Configuration
 * @return
 * @throws Exception
 */
public static Configuration getConfiguration() throws Exception {
    if(configuration == null) {
        configuration = new Configuration();
        configuration.setDirectoryForTemplateLoading(new File(PathHelper.getWebPath()));    //路径
        configuration.setObjectWrapper(new DefaultObjectWrapper());
        configuration.setSharedVariable("block", new BlockDirective());
        configuration.setSharedVariable("override", new OverrideDirective());
        configuration.setSharedVariable("extends", new ExtendsDirective());
    }

    return configuration;
}
```

这些指令属于**rapid-framework**。

> [rapid-framework zh_CN](http://www.oschina.net/p/rapid-framework/)

或者，您也可以将以下文件直接添加到项目中。实际上，它是rapid-framework.jar的一部分。

> <a title="directives" href="{{ site.url }}/static/download/freemarker/freemarker.zip"><i class="fa fa-fw fa-download"></i>&nbsp;freemarker.zip</a>

> <a title="directives" href="{{ site.url }}/static/download/freemarker/FreeMarker_2.3.23_Manual_zh_CN.zip"><i class="fa fa-fw fa-download"></i>&nbsp;freemarker_manual_zh_CN.zip</a>


------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------

## Define directives

> Basics

A **macro** is a template fragment associated with a variable.

```
<#macro gray>
  <span class="text-muted">Hello Joe!</span>
</#macro>
```

<label class="label label-info">Info</label>

The macro directive itself does not print anything;
You use user-defined directives by writing <kbd>@</kbd> instead of <kbd>#</kbd> in the FTL tag. Use the variable name as the directive name.

```
<@macro gray></@macro>
```
or

```
<@macro/>
```

- output

```html
<span class="text-muted">Hello Joe!</span>
```

> Parameters

Let's improve the gray macro so it can use arbitrary name, not only Joe. For this purpose you can use **parameters**.

- define & called

```
<#macro gray name>
  <span class="text-muted">Hello ${name}!</span>
</#macro>

<@gray name="echo">
```

- output

```html
<span class="text-muted">Hello echo!</span>
```

You can use **multiple parameters**, like

- define & called

```
<#macro gray name size>
  <span class="text-muted" size="${size}">Hello ${name}!</span>
</#macro>

<@gray name="echo" size=14 />
```

- output

```html
<span class="text-muted" size="14">Hello echo!</span>
```

You can give method a **default value**, such as

- define & called

```
<#macro gray name size=14>
  <span class="text-muted" size="${size}">Hello ${name}!</span>
</#macro>

<@gray name="echo" />
```

- output

```html
<span class="text-muted" size="14">Hello echo!</span>
```

> Nested content

Custom directive can have nested content, similarly as predefined directives like
```<#if ...>nested content</#if>```
can have.

- define & called

```
<#macro border>
    <div class="warp">
        <#nested>
    </div>
</#macro>

<@border>Here is the nested content.</@border>
```

- output

```html
<div class="warp">
    Here is the nested content.
</div>
```

The nested directive can be called for **multiple times**, for example:

- define & called

```
<#macro do_three>
    <div class="warp">
        <#nested>
        <#nested>
        <#nested>
    </div>
</#macro>

<@do_three>hello world</@do_three>
```

- output

```html
<div class="warp">
Hello world
Hello world
Hello world
</div>
```

The local variables of a macro are **not visible** in the nested content. Say, this:

- define & called

```
<#macro repeat count>
  <#local y = "test">
  <#list 1..count as x>
    ${y} ${count}/${x}: <#nested>
  </#list>
</#macro>

<@repeat count=3>${y!"?"} ${x!"?"} ${count!"?"}</@repeat>
```

- output

```html
test 3/1: ? ? ?
test 3/2: ? ? ?
test 3/3: ? ? ?
```

> Macros with loop variables

User-defined directives can also have loop variables.

- define & called

```
<#macro do_three>
    <#nested 1>
    <#nested 2>
    <#nested 3>
</#macro>

<@do_three ; x> <#-- user-defined directive uses ";" instead of "as" -->
${x} Anything.
</@do_three>
```

- output

```html
1 Anything.

2 Anything.

3 Anything.
```

The name of the loop variable is specified in the user-defined directive open tag (<@...>) after the parameters and a semicolon.

- define & called

```
<#macro repeat count>
  <#list 1..count as x>
    <#nested x, x/2, x==count>
  </#list>
</#macro>

<@repeat count=4 ; c, halfc, last>
  ${c}. ${halfc}<#if last> Last!</#if>
</@repeat>
```

- output

```html
1. 0.5
2. 1
3. 1.5
4. 2 Last!
```

## Define variables

> Create and replace variables with **assign**

- define

```html
<#assign name = "echo">  <#-- create variable echo -->
${name}
<#assign name = "hello"> <#-- replace variable name -->
${name}
```

- output

```
echo
hello
```

Local variables **hide (not overwrite)** plain variables of the same name.
Loop variables hide (not overwrite) local and plain variables of the same name.
For example:

```html
<#assign x = "plain">
1. ${x}  <#-- we see the plain var. here -->
<@test/>
6. ${x}  <#-- the value of plain var. was not changed -->
<#list ["loop"] as x>
    7. ${x}  <#-- now the loop var. hides the plain var. -->
    <#assign x = "plain2"> <#-- replace the plain var, hiding does not mater here -->
    8. ${x}  <#-- it still hides the plain var. -->
</#list>
9. ${x}  <#-- the new value of plain var. -->

<#macro test>
  2. ${x}  <#-- we still see the plain var. here -->
  <#local x = "local">
  3. ${x}  <#-- now the local var. hides it -->
  <#list ["loop"] as x>
    4. ${x}  <#-- now the loop var. hides the local var. -->
  </#list>
  5. ${x}  <#-- now we see the local var. again -->
</#macro>
```

- output

```
1. plain
2. plain
3. local
4. loop
5. local
6. plain
7. loop
8. loop
9. plain2
```

## Namespaces

> Creating a library

- +add file lib.ftl

```html
<#assign mail = "houbb.echo@gmail.com">

<#macro copyright date name="Echo">
Copyright (C) ${date} ${name}. All rights reserved.
</#macro>
```

- define ftl

```html
<#import "lib.ftl" as my> <#-- the hash called "my" will be the "gate" -->

<@my.copyright date="1994-2016"/>
${my.mail}

<#assign mail="123456@gmail.com">
${mail}
```

- output

```html
Copyright (C) 1994-2016 Echo. All rights reserved.
houbb.echo@gmail.com

123456@gmail.com
```

> Writing the variables of imported namespaces

Occasionally you may want to **create or replace a variable in an imported namespace**.
You can do this with the assign directive, if you use its namespace parameter. For example:

- define

```html
<#import "lib.ftl" as my> <#-- the hash called "my" will be the "gate" -->
${my.mail}
<#assign mail="echo@other.com" in my>
${my.mail}
```

- output

```html
houbb.echo@gmail.com
echo@other.com
```

> Namespaces and data-model

- lib.ftl

```html
<#macro copyright date name="${name}">
Copyright (C) ${date} ${name}. All rights reserved.
</#macro>

<#assign mail = "houbb.${name}@gmail.com">
```

- demo.ftl

```html
<#import "lib.ftl" as my> <#-- the hash called "my" will be the "gate" -->
<@my.copyright date="1994-2016" />
${my.mail}
```

- data-model

```java
public class Demo {
    public static void main(String[] args) throws Exception {
        Template template = FreemarkerHelper.getTemplate("demo.ftl");

        //map build
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("name", "echo");

        FileHelper.createFile(template, "demo.html", map);
    }
}
```

- output

```html
Copyright (C) 1994-2016 echo. All rights reserved.
houbb.echo@gmail.com
```

> Life-cycle of namespaces

If you try to import with the same path for multiple times, it will create the namespace and run the template specified
by the path for the very first invocation of import only. The later imports with the same path will just
create a **gate** hash to the same namespace. For example:

- ftl

```html
<#import "lib.ftl" as my> <#-- the hash called "my" will be the "gate" -->
<#import "lib.ftl" as foo> <#-- the hash called "foo" will be the "gate" -->
<#import "lib.ftl" as bar> <#-- the hash called "bar" will be the "gate" -->

${my.mail}
${foo.mail}
${bar.mail}

<#assign mail="echo@other.com" in my>

${my.mail}
${foo.mail}
${bar.mail}
```

- output

```html
houbb.echo@gmail.com
houbb.echo@gmail.com
houbb.echo@gmail.com

echo@other.com
echo@other.com
echo@other.com
```

## Extends

Now, we extends freemarker, add three directive :
```
@extends,@block,@override
```

<label class="label label-info">purpose</label>

Parent template define the layout, child template can **override** the content of layout.


- +add base.ftl

```html
<html>
<head>
    <@block name="head">base_head_content</@block>
</head>
<body>
    <@block name="body">base_body_content</@block>
</body>
</html>
```

- change demo.ftl

```html
<@override name="body">

<div class='content'>
    Powered By rapid-framework
</div>
</@override>

<@extends name="base.ftl"/>
```

- output

```html
<html>
<head>
base_head_content
</head>
<body>

<div class='content'>
    Powered By rapid-framework
</div>

</body>
</html>
```

- Before use these extends directive, you should add them into config.

```java
/**
 * define Configuration
 * @return
 * @throws Exception
 */
public static Configuration getConfiguration() throws Exception {
    if(configuration == null) {
        configuration = new Configuration();
        configuration.setDirectoryForTemplateLoading(new File(PathHelper.getWebPath()));    //path
        configuration.setObjectWrapper(new DefaultObjectWrapper());
        configuration.setSharedVariable("block", new BlockDirective());
        configuration.setSharedVariable("override", new OverrideDirective());
        configuration.setSharedVariable("extends", new ExtendsDirective());
    }

    return configuration;
}
```

these directives belong to **rapid-framework**.

> [rapid-framework zh_CN](http://www.oschina.net/p/rapid-framework/)

Or, you can also just following files into your project.In fact, it's part of rapid-framework.jar

> <a title="directives" href="{{ site.url }}/static/download/freemarker/freemarker.zip"><i class="fa fa-fw fa-download"></i>&nbsp;freemarker.zip</a>

> <a title="directives" href="{{ site.url }}/static/download/freemarker/FreeMarker_2.3.23_Manual_zh_CN.zip"><i class="fa fa-fw fa-download"></i>&nbsp;freemarker_manual_zh_CN.zip</a>


* any list
{:toc}