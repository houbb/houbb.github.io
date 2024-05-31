---
layout: post
title:  XML 格式校验-01-DTD 简介
date:  2017-06-21 13:59:45 +0800
categories: [Config]
tags: [xsd, xml, dtd, sf]
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

# DTD 是什么

文档类型定义（DTD）是一组标记声明，它们为SGML系列标记语言（GML，SGML，XML，HTML）定义了文档类型。

DTD定义XML文档的有效构件。 

它定义了带有已验证元素和属性列表的文档结构。 

DTD可以在XML文档中内联声明，也可以作为外部引用。

XML使用SGML DTD的子集。

截至2009年，更新的XML名称空间感知模式语言（例如W3C XML Schema和ISO RELAX NG）已在很大程度上取代了DTD。 

DTD的名称空间感知版本正在作为ISO DSDL的第9部分开发。 

DTD在需要特殊发布字符的应用程序中仍然存在，例如XML和HTML字符实体引用，这些引用源自ISO SGML标准工作中定义的较大集合。

# 声明方式

## 内部的 DOCTYPE 声明

假如 DTD 被包含在您的 XML 源文件中，它应当通过下面的语法包装在一个 DOCTYPE 声明中：

```xml
<!DOCTYPE 根元素 [元素声明]>
```

带有 DTD 的 XML 文档实例：

```xml
<?xml version="1.0"?>
<!DOCTYPE note [
  <!ELEMENT note (to,from,heading,body)>
  <!ELEMENT to      (#PCDATA)>
  <!ELEMENT from    (#PCDATA)>
  <!ELEMENT heading (#PCDATA)>
  <!ELEMENT body    (#PCDATA)>
]>
<note>
  <to>George</to>
  <from>John</from>
  <heading>Reminder</heading>
  <body>Don't forget the meeting!</body>
</note>
```

解释如下：

以上 DTD 解释如下：

!DOCTYPE note (第二行)定义此文档是 note 类型的文档。

!ELEMENT note (第三行)定义 note 元素有四个元素："to、from、heading,、body"

!ELEMENT to (第四行)定义 to 元素为 "#PCDATA" 类型

!ELEMENT from (第五行)定义 from 元素为 "#PCDATA" 类型

!ELEMENT heading (第六行)定义 heading 元素为 "#PCDATA" 类型

!ELEMENT body (第七行)定义 body 元素为 "#PCDATA" 类型

## 外部文档声明

假如 DTD 位于 XML 源文件的外部，那么它应通过下面的语法被封装在一个 DOCTYPE 定义中：

```
<!DOCTYPE 根元素 SYSTEM "文件名">
```

这个 XML 文档和上面的 XML 文档相同，但是拥有一个外部的 DTD: 

```xml
<?xml version="1.0"?>
<!DOCTYPE note SYSTEM "note.dtd">
<note>
<to>George</to>
<from>John</from>
<heading>Reminder</heading>
<body>Don't forget the meeting!</body>
</note> 
```

这是包含 DTD 的 "note.dtd" 文件：

```xml
<!ELEMENT note (to,from,heading,body)>
<!ELEMENT to (#PCDATA)>
<!ELEMENT from (#PCDATA)>
<!ELEMENT heading (#PCDATA)>
<!ELEMENT body (#PCDATA)>
```

ps: 实际使用肯定是优先使用第二种方式，约束固定，只需要引入即可。

## 为什么使用 DTD？

通过 DTD，您的每一个 XML 文件均可携带一个有关其自身格式的描述。

通过 DTD，独立的团体可一致地使用某个标准的 DTD 来交换数据。

而您的应用程序也可使用某个标准的 DTD 来验证从外部接收到的数据。

您还可以使用 DTD 来验证您自身的数据。

# XML 构建模块

## XML 文档构建模块

所有的 XML 文档（以及 HTML 文档）均由以下简单的构建模块构成：

- 元素

- 属性

- 实体

- PCDATA

- CDATA

下面是每个构建模块的简要描述。

## 元素

元素是 XML 以及 HTML 文档的主要构建模块。

HTML 元素的例子是 "body" 和 "table"。

XML 元素的例子是 "note" 和 "message" 。

元素可包含文本、其他元素或者是空的。

空的 HTML 元素的例子是 "hr"、"br" 以及 "img"。

实例：

```xml
<body>body text in between</body>
<message>some message in between</message>
```

## 属性

属性可提供有关元素的额外信息。

属性总是被置于某元素的开始标签中。属性总是以名称/值的形式成对出现的。下面的 "img" 元素拥有关于源文件的额外信息：

```xml
<img src="computer.gif" />
```

元素的名称是 "img"。属性的名称是 "src"。属性的值是 "computer.gif"。由于元素本身为空，它被一个 "/" 关闭。

## 实体

实体是用来定义普通文本的变量。实体引用是对实体的引用。

大多数同学都了解这个 HTML 实体引用：`&nbsp;`。

这个“无折行空格”实体在 HTML 中被用于在某个文档中插入一个额外的空格。

当文档被 XML 解析器解析时，实体就会被展开。

下面的实体在 XML 中被预定义：

| 实体引用	| 字符 |
|:----|:----|
| `&lt;`	| `<` |
| `&gt;`	| `>` |
| `&amp;`	| `&` |
| `&quot;`	| `"` |
| `&apos;`	| `'` |

## PCDATA

PCDATA 的意思是被解析的字符数据（parsed character data）。

可把字符数据想象为 XML 元素的开始标签与结束标签之间的文本。

**PCDATA 是会被解析器解析的文本。这些文本将被解析器检查实体以及标记。**

文本中的标签会被当作标记来处理，而实体会被展开。

不过，被解析的字符数据不应当包含任何 `&`、`<` 或者 `>` 字符；

需要使用 `&amp;`、`&lt;` 以及 `&gt;` 实体来分别替换它们。

## CDATA

CDATA 的意思是字符数据（character data）。

CDATA 是不会被解析器解析的文本。

在这些文本中的标签不会被当作标记来对待，其中的实体也不会被展开。

# 元素

在一个 DTD 中，元素通过元素声明来进行声明。

## 声明一个元素

在 DTD 中，XML 元素通过元素声明来进行声明。元素声明使用下面的语法：

```xml
<!ELEMENT 元素名称 类别>
```

或者

```xml
<!ELEMENT 元素名称 (元素内容)>
```

## 空元素

空元素通过类别关键词EMPTY进行声明：

```xml
<!ELEMENT 元素名称 EMPTY>
```

### 例子：

```xml
<!ELEMENT br EMPTY>
```

xml 

```xml
<br/>
```

## 只有 PCDATA 的元素

只有 PCDATA 的元素通过圆括号中的 #PCDATA 进行声明：

```xml
<!ELEMENT 元素名称 (#PCDATA)>
```

例子：

```xml
<!ELEMENT from (#PCDATA)>
```

## 带有任何内容的元素

通过类别关键词 ANY 声明的元素，可包含任何可解析数据的组合：

```xml
<!ELEMENT 元素名称 ANY>
```

例子：

```xml
<!ELEMENT note ANY>
```

## 带有子元素（序列）的元素

带有一个或多个子元素的元素通过圆括号中的子元素名进行声明：

```xml
<!ELEMENT 元素名称 (子元素名称 1)>
```

或者

```xml
<!ELEMENT 元素名称 (子元素名称 1,子元素名称 2,.....)>
```

例子：

```xml
<!ELEMENT note (to,from,heading,body)>
```

当子元素按照由逗号分隔开的序列进行声明时，这些子元素必须按照相同的顺序出现在文档中。

在一个完整的声明中，子元素也必须被声明，同时子元素也可拥有子元素。

"note" 元素的完整声明是：

```xml
<!ELEMENT note (to,from,heading,body)>
<!ELEMENT to      (#PCDATA)>
<!ELEMENT from    (#PCDATA)>
<!ELEMENT heading (#PCDATA)>
<!ELEMENT body    (#PCDATA)>
```

## 声明只出现一次的元素

```xml
<!ELEMENT 元素名称 (子元素名称)>
```

例子：

```xml
<!ELEMENT note (message)>
```

上面的例子声明了：message 子元素必须出现一次，并且必须只在 "note" 元素中出现一次。


## 声明最少出现一次的元素

```xml
<!ELEMENT 元素名称 (子元素名称+)>
```

例子：

```xml
<!ELEMENT note (message+)>
```

上面的例子中的加号声明了：message 子元素必须在 "note" 元素内出现至少一次。

## 声明出现零次或多次的元素

```xml
<!ELEMENT 元素名称 (子元素名称*)>
```

例子：

```xml
<!ELEMENT note (message*)>
```

上面的例子中的星号声明了：子元素 message 可在 "note" 元素内出现零次或多次。

## 声明出现零次或一次的元素

```xml
<!ELEMENT 元素名称 (子元素名称?)>
```

例子：

```xml
<!ELEMENT note (message?)>
```

上面的例子中的问号声明了：子元素 message 可在 "note" 元素内出现零次或一次。

## 声明“非.../既...”类型的内容

例子：

```xml
<!ELEMENT note (to,from,header,(message|body))>
```

上面的例子声明了："note" 元素必须包含 "to" 元素、"from" 元素、"header" 元素，以及非 "message" 元素既 "body" 元素。

## 声明混合型的内容

例子：

```xml
<!ELEMENT note (#PCDATA|to|from|header|message)*>
```

上面的例子声明了："note" 元素可包含出现零次或多次的 PCDATA、"to"、"from"、"header" 或者 "message"。

# 属性

在 DTD 中，属性通过 ATTLIST 声明来进行声明。

## 声明属性

属性声明使用下列语法：

```xml
<!ATTLIST 元素名称 属性名称 属性类型 默认值>
```

- DTD 实例:

```xml
<!ATTLIST payment type CDATA "check">
```

- XML 实例:

```xml
<payment type="check" />
```

### 选项

以下是属性类型的选项：

| 类型	| 描述 | 
|:---|:---|:---|
| CDATA	       | 值为字符数据 (character data) |
| `(en1|en2|..)`	| 此值是枚举列表中的一个值 |
| ID	           | 值为唯一的 id |
| IDREF	       | 值为另外一个元素的 id |
| IDREFS	       | 值为其他 id 的列表 |
| NMTOKEN	       | 值为合法的 XML 名称 |
| NMTOKENS	   | 值为合法的 XML 名称的列表 |
| ENTITY      	| 值是一个实体 |
| ENTITIES	   | 值是一个实体列表 |
| NOTATION	   | 此值是符号的名称 |
| xml:	       | 值是一个预定义的 XML 值 |

默认值参数可使用下列值：

| 值	| 属性的默认值 | 
|:---|:---|
| #REQUIRED	    | 属性值是必需的 |
| #IMPLIED	    | 属性不是必需的 |
| #FIXED value	| 属性值是固定的 |

## 规定一个默认的属性值

- DTD:

```xml
<!ELEMENT square EMPTY>
<!ATTLIST square width CDATA "0">
```

合法的 XML:

```xml
<square width="100" />
```

在上面的例子中，"square" 被定义为带有 CDATA 类型的 "width" 属性的空元素。

如果宽度没有被设定，其默认值为0。

## #IMPLIED

语法

```xml
<!ATTLIST 元素名称 属性名称 属性类型 #IMPLIED>
```

例子

- DTD:

```xml
<!ATTLIST contact fax CDATA #IMPLIED>
```

- 合法的 XML:

```xml
<contact fax="555-667788" />
```

合法的 XML:

```xml
<contact />
```

假如您不希望强制作者包含属性，并且您没有默认值选项的话，请使用关键词 `#IMPLIED`。

## #REQUIRED

- 语法

```xml
<!ATTLIST 元素名称 属性名称 属性类型 #REQUIRED>
```

- 例子

DTD:

```xml
<!ATTLIST person number CDATA #REQUIRED>
```

合法的 XML:

```xml
<person number="5677" />
```

非法的 XML:

```xml
<person />
```

假如您没有默认值选项，但是仍然希望强制作者提交属性的话，请使用关键词 #REQUIRED。

## #FIXED 固定值

- 语法

```xml
<!ATTLIST 元素名称 属性名称 属性类型 #FIXED "value">
```

例子

DTD:

```xml
<!ATTLIST sender company CDATA #FIXED "Microsoft">
```

合法的 XML:

```xml
<sender company="Microsoft" />
```

非法的 XML:

```xml
<sender company="W3School" />
```
如果您希望属性拥有固定的值，并不允许作者改变这个值，请使用 #FIXED 关键词。

如果作者使用了不同的值，XML 解析器会返回错误。

## 列举属性值

语法：

```xml
<!ATTLIST 元素名称 属性名称 (en1|en2|..) 默认值>
```

DTD 例子:

```xml
<!ATTLIST payment type (check|cash) "cash">
```

XML 例子:

```xml
<payment type="check" />
```

或者

```xml
<payment type="cash" />
```

如果您希望属性值为一系列固定的合法值之一，请使用列举属性值。

# 实体

实体是用于定义引用普通文本或特殊字符的快捷方式的变量。

实体引用是对实体的引用。

实体可在内部或外部进行声明。

## 一个内部实体声明

### 语法

```xml
<!ENTITY 实体名称 "实体的值">
```

### 例子

- DTD 例子:

```xml
<!ENTITY writer "Bill Gates">
<!ENTITY copyright "Copyright W3School.com.cn">
```

XML 例子:

```xml
<author>&writer;&copyright;</author>
```

注释: 一个实体由三部分构成: 一个和号 (&), 一个实体名称, 以及一个分号 (;)。


## 一个外部实体声明

### 语法

```xml
<!ENTITY 实体名称 SYSTEM "URI/URL">
```

### 例子

DTD 例子:

```xml
<!ENTITY writer SYSTEM "http://www.w3school.com.cn/dtd/entities.dtd">
<!ENTITY copyright SYSTEM "http://www.w3school.com.cn/dtd/entities.dtd">
```

XML 例子:

```xml
<author>&writer;&copyright;</author>
```

# DTD 的验证

## 通过 XML 解析器进行验证

当您试图打开某个 XML 文档时，XML 解析器有可能会产生错误。通过访问 parseError 对象，就可以取回引起错误的确切代码、文本甚至所在的行。

注释：load() 方法用于文件，而 loadXML() 方法用于字符串。

```js
var xmlDoc = new ActiveXObject("Microsoft.XMLDOM")
xmlDoc.async="false"
xmlDoc.validateOnParse="true"
xmlDoc.load("note_dtd_error.xml")

document.write("<br>Error Code: ")
document.write(xmlDoc.parseError.errorCode)
document.write("<br>Error Reason: ")
document.write(xmlDoc.parseError.reason)
document.write("<br>Error Line: ")
document.write(xmlDoc.parseError.line)
```

## 关闭验证

通过把 XML 解析器的 validateOnParse 设置为 "false"，就可以关闭验证。

```xml
var xmlDoc = new ActiveXObject("Microsoft.XMLDOM")
xmlDoc.async="false"
xmlDoc.validateOnParse="false"
xmlDoc.load("note_dtd_error.xml")

document.write("<br>Error Code: ")
document.write(xmlDoc.parseError.errorCode)
document.write("<br>Error Reason: ")
document.write(xmlDoc.parseError.reason)
document.write("<br>Error Line: ")
document.write(xmlDoc.parseError.line)
```

# Mybatis 的实际例子

## DTD

```xml
<?xml version="1.0" encoding="UTF-8" ?>
        <!ELEMENT configuration (dataSource?, mappers?, plugins?, typeAliases?, typeHandlers?, objectFactory?)>

        <!ELEMENT typeAliases (typeAlias*)>

        <!ELEMENT typeAlias EMPTY>
        <!ATTLIST typeAlias
                type CDATA #REQUIRED
                alias CDATA #IMPLIED
                >

        <!ELEMENT typeHandlers (typeHandler*)>
        <!ELEMENT typeHandler EMPTY>
        <!ATTLIST typeHandler
                javaType CDATA #REQUIRED
                jdbcType CDATA #IMPLIED
                handler CDATA #REQUIRED
                >

        <!ELEMENT objectFactory (#PCDATA)>
        <!ATTLIST objectFactory
                type CDATA #REQUIRED
                >

        <!ELEMENT plugins (plugin+)>
        <!ELEMENT plugin (#PCDATA)>
        <!ATTLIST plugin
                interceptor CDATA #REQUIRED
                >

        <!ELEMENT dataSource (property*)>
        <!ELEMENT property EMPTY>
        <!ATTLIST property
                name CDATA #REQUIRED
                value CDATA #REQUIRED
                >

        <!ELEMENT mappers (mapper*)>
        <!ELEMENT mapper EMPTY>
        <!ATTLIST mapper
                resource CDATA #IMPLIED
                url CDATA #IMPLIED
                class CDATA #IMPLIED
                >
```

## xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "mybatis-config.dtd">
<configuration>

    <dataSource>
        <property name="driver" value="com.mysql.jdbc.Driver"/>
        <property name="url" value="jdbc:mysql://localhost:3306/test"/>
        <property name="username" value="root"/>
        <property name="password" value="123456"/>
    </dataSource>

    <mappers>
        <mapper resource="mapper/UserMapper.xml"/>
    </mappers>

    <plugins>
        <plugin interceptor="com.github.houbb.mybatis.plugin.SimpleLogInterceptor"/>
    </plugins>

    <typeHandlers>
        <typeHandler javaType="date" handler="com.github.houbb.mybatis.typehandler.DateTypeHandler"/>
    </typeHandlers>

    <objectFactory type="com.github.houbb.mybatis.support.MyObjectFactory"/>

</configuration>
```

# DTD 概要

本教程已经向您讲解了如何描述 XML 文档的结构。

您学习到了如何使用 DTD 来定义一个 XML 文档的合法元素，以及如何在您的 XML 内部或者作为一个外部引用来声明 DTD。

您已经学习了如何为 XML 文档声明合法的元素、属性、实体以及 CDATA 部分。

您也看到了如何根据某个 DTD 来验证一个 XML 文档。

# 您已经学习了 DTD，下一步学习什么内容呢？

下一步应当学习 XML Schema。

XML Schema 用于定义 XML 文档的合法元素，类似 DTD。

我们认为 XML Schema 很快会将 DTD 取而代之，被用在大部分的网络应用程序中。

XML Schema 是基于 XML 的 DTD 替代物。

与 DTD 不同，XML Schema 支持数据类型和命名空间。

# 参考资料

[wiki](https://en.wikipedia.org/wiki/Document_type_definition)

[XSD-wiki](https://en.wikipedia.org/wiki/XML_Schema_(W3C))

* any list
{:toc}