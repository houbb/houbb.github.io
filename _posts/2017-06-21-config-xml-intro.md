---
layout: post
title:  XML 入门介绍
date:  2017-06-21 13:59:45 +0800
categories: [Config]
tags: [xml, config]
published: true
---

# 拓展阅读

[config 配置方式概览-8 种配置文件介绍对比 xml/json/proeprties/ini/yaml/TOML/hcl/hocon](https://houbb.github.io/2017/06/21/config-00-overivew)

[config HCL（HashiCorp Configuration Language） 配置文件介绍](https://houbb.github.io/2017/06/21/config-hcl-01-intro)

[config HCL（HashiCorp Configuration Language） 官方文档翻译](https://houbb.github.io/2017/06/21/config-hcl-02-doc)

[config HOCON（Human-Optimized Config Object Notation）配置文件介绍](https://houbb.github.io/2017/06/21/config-hocon-01-intro)

[config ini 配置文件介绍](https://houbb.github.io/2017/06/21/config-ini-01-intro)

[config properties 配置文件介绍](https://houbb.github.io/2017/06/21/config-properties-01-intro)

[toml-01-toml 配置文件介绍](https://houbb.github.io/2017/06/21/config-toml-01-overview)

[XStream java 实现 xml 与对象 pojo 之间的转换](https://houbb.github.io/2017/06/21/config-xml-XStream-intro)

[java 实现 xml 与对象 pojo 之间的转换的几种方式 dom4j/xstream/jackson](https://houbb.github.io/2017/06/21/config-xml-to-pojo)

[YAML-01-yml 配置文件介绍](https://houbb.github.io/2017/06/21/config-yaml-01-intro)

[YAML-02-yml 配置文件 java 整合使用 yamlbeans + snakeyaml + jackson-dataformat-yaml](https://houbb.github.io/2017/06/21/config-yaml-02-java-integration)

[YAML-03-yml 配置文件介绍官方文档翻译](https://houbb.github.io/2017/06/21/config-yaml-03-doc)

[json 专题系列](https://houbb.github.io/2018/07/20/json-00-overview)

# XML

[XML](https://www.xml.com/) 为 可扩展标记语言（EXtensible Markup Language）。本身仅仅是纯文本，无任何作为。

如下：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<root>
    <title>xml demo</title>
</root>
```

# 语法

- 所有 XML 元素都须有关闭标签

```xml
<p>this is a simple demo</p>
```

> 注释

您也许已经注意到 XML 声明没有关闭标签。这不是错误。声明不属于XML本身的组成部分。它不是 XML 元素，也不需要关闭标签。

- XML 标签对大小写敏感

- XML 文档必须有根元素

XML 文档必须有一个元素是所有其他元素的父元素。该元素称为**根**元素。

- XML 的属性值须加引号

- 实体引用

在 XML 中，只有字符 `<` 和 `&` 确实是非法的。大于号是合法的，但是用实体引用来代替它是一个好习惯。

| 实体引用 | 代替非法值 | 简单说明 |
|:--|:---|:---|
| &lt;	    | <	  | 小于  |
| &gt;	    | >	  | 大于  |
| &amp; 	| &	  | 和号  |
| &apos;	| '	  | 单引号  |
| &quot;	| "	  | 引号  |


- 注释

```xml
<!--this is a comment-->
```

- 在 XML 中，空格会被保留

# 元素

一、何为元素

XML 元素指的是从（且包括）开始标签直到（且包括）结束标签的部分。

元素可包含其他元素、文本或者两者的混合物。元素也可以拥有属性。

例如：

```xml
<bookstore>
<book category="CHILDREN">
  <title>Harry Potter</title> 
  <author>J K. Rowling</author> 
  <year>2005</year> 
  <price>29.99</price> 
</book>
<book category="WEB">
  <title>Learning XML</title> 
  <author>Erik T. Ray</author> 
  <year>2003</year> 
  <price>39.95</price> 
</book>
</bookstore>
```

`<bookstore>` 和 `<book>` 都拥有元素内容，因为它们包含了其他元素。
`<author>` 只有文本内容，因为它仅包含文本。
`<book>` 元素拥有属性 (category="CHILDREN")。


二、命名规范

可使用任何名称，没有保留的字词。

- 名称可以含字母、数字以及其他的字符

- 名称不能以数字或者标点符号开始

- 名称不能以字符 `xml`（或者 XML、Xml）开始

- 名称不能包含空格

# 属性

属性 (Attribute) 提供关于元素的额外（附加）信息。

XML 属性必须加引号(单引号、双引号皆可。)

```xml
<person sex="female"/>
```

一、属性 vs 元素

XML 中，您应该尽量避免使用属性。如果信息感觉起来很像数据，那么请使用子元素吧。

上面的例子也可以写作：

```xml
<person>
    <sex>female</sex>
</person>
```

二、属性的缺点

- 属性无法包含多重的值（元素可以）

- 属性无法描述树结构（元素可以）

- 属性不易扩展（为未来的变化）

- 属性难以阅读和维护

请尽量使用元素来描述数据。而仅仅使用属性来提供与数据无关的信息。

三、针对元数据的 XML 属性

有时候会向元素分配 ID 引用。这些 ID 索引可用于标识 XML 元素，它起作用的方式与 HTML 中 ID 属性是一样的。
上面的 ID 仅仅是一个标识符，用于标识不同的便签。它并不是便签数据的组成部分。
在此我们极力向您传递的理念是：元数据（有关数据的数据）应当存储为属性，而数据本身应当存储为元素。

```xml
<messages>
  <note id="501">
    <to>George</to>
    <from>John</from>
  </note>
  <note id="502">
    <to>John</to>
    <from>George</from>
  </note> 
</messages>
```

# Namespaces

这个概念在很多语言中都有，作用也是一致的——**避免命名冲突**。

Suppose, 我们有2个 XML，其内容如下：

```xml
<table>
   <tr>
   <td>Apples</td>
   <td>Bananas</td>
   </tr>
</table>
```

和

```xml
<table>
   <name>African Coffee Table</name>
   <width>80</width>
   <length>120</length>
</table>
```

两个 XML 文档被一起使用，由于两个文档都包含带有不同内容和定义的 <table> 元素，就会发生命名冲突。

一、使用前缀

直接做如下修改即可：

```xml
<h:table>
   <h:tr>
   <h:td>Apples</h:td>
   <h:td>Bananas</h:td>
   </h:tr>
</h:table>
```

```xml
<f:table>
   <f:name>African Coffee Table</f:name>
   <f:width>80</f:width>
   <f:length>120</f:length>
</f:table>
```

二、使用命名空间

与仅仅使用前缀不同，我们为 `<table>` 标签添加了一个 xmlns 属性，这样就为前缀赋予了一个与某个命名空间相关联的限定名称。

```xml
<h:table xmlns:h="http://www.w3.org/TR/html4/">
   <h:tr>
   <h:td>Apples</h:td>
   <h:td>Bananas</h:td>
   </h:tr>
</h:table>
```

```xml
<f:table xmlns:f="http://www.w3school.com.cn/furniture">
   <f:name>African Coffee Table</f:name>
   <f:width>80</f:width>
   <f:length>120</f:length>
</f:table>
```

三、Namespace (xmlns) 属性

XML 命名空间属性被放置于元素的开始标签之中，并使用以下的语法：

```
xmlns:namespace-prefix="namespaceURI"
```

当命名空间被定义在元素的开始标签中时，所有带有相同前缀的子元素都会与同一个命名空间相关联。

> 注释

用于标示命名空间的地址不会被解析器用于查找信息。其惟一的作用是赋予命名空间一个惟一的名称。不过，很多公司常常会作为指针来使用命名空间指向实际存在的网页，这个网页包含关于命名空间的信息。

# CDATA

所有 XML 文档中的文本均会被解析器解析。
只有 `CDATA` 区段（CDATA section）中的文本会被解析器忽略。

一、CDATA

术语 CDATA 指的是不应由 XML 解析器进行解析的文本数据（Unparsed Character Data）。

在 XML 元素中，<" 和 "&" 是非法的。

"<" 会产生错误，因为解析器会把该字符解释为新元素的开始。
"&" 也会产生错误，因为解析器会把该字符解释为字符实体的开始。
某些文本，比如 JavaScript 代码，包含大量 "<" 或 "&" 字符。为了避免错误，可以将脚本代码定义为 CDATA。
CDATA 部分中的所有内容都会被解析器忽略。
CDATA 部分由 `<![CDATA[` 开始，由 `]]>` 结束：

```xml
<script>
<![CDATA[
function matchwo(a,b)
{
if (a < b && a < 0) then
  {
  return 1;
  }
else
  {
  return 0;
  }
}
]]>
</script>
```

> 注释

CDATA 部分不能包含字符串 "]]>"。也不允许嵌套的 CDATA 部分。
标记 CDATA 部分结尾的 "]]>" 不能包含空格或折行。

# 编码

XML 文档可以包含非 ASCII 字符，比如法语。

为了避免错误，需要规定 XML 编码，或者将 XML 文档存为 Unicode。

编码属性应当被指定为文档被保存时所使用的编码。建议是：

-使用支持编码的编辑器

- 确定编辑器使用的编码

在您的 XML 文档中使用**相同的编码属性**


* any list
{:toc}
