---
layout: post
title: Freemarker Advance
date:  2016-5-8 09:51:26 +0800
categories: [HTML]
tags: [Freemarker]
published: false
---

* any list
{:toc}

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