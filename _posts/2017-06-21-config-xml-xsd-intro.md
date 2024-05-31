---
layout: post
title:  XSD-01-描述 XML 文档的结构
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

# XSD

[XML Schema](http://www.w3school.com.cn/schema/index.asp) 描述 XML 文档的结构。

XML Schema 语言也称作 XML Schema 定义（XML Schema Definition，XSD）。

XML Schema 是基于 XML 的 [DTD](http://www.w3school.com.cn/dtd/index.asp) 替代者。


一、为何使用？

1、通过对数据类型的支持

2、使用 XML 语法

3、可保护数据通信

4、可扩展


二、如何使用？

- note.xml

```xml
<?xml version="1.0"?>
<note>
<to>George</to>
<from>John</from>
<heading>Reminder</heading>
<body>Don't forget the meeting!</body>
</note>
```

- note.xsd

```xml
<?xml version="1.0"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
targetNamespace="http://www.w3school.com.cn"
xmlns="http://www.w3school.com.cn"
elementFormDefault="qualified">

<xs:element name="note">
    <xs:complexType>
      <xs:sequence>
	<xs:element name="to" type="xs:string"/>
	<xs:element name="from" type="xs:string"/>
	<xs:element name="heading" type="xs:string"/>
	<xs:element name="body" type="xs:string"/>
      </xs:sequence>
    </xs:complexType>
</xs:element>

</xs:schema>
```

- 命名空间和前缀

```
xmlns:xs="http://www.w3.org/2001/XMLSchema"
```

显示 schema 中用到的元素和数据类型来自命名空间 "http://www.w3.org/2001/XMLSchema"。同时它还规定了来自命名空间 "http://www.w3.org/2001/XMLSchema" 的元素和数据类型应该使用前缀 xs;


- 命名空间

```
targetNamespace="http://www.w3school.com.cn" 
```

显示被此 schema 定义的元素 (note, to, from, heading, body) 来自命名空间： "http://www.w3school.com.cn"。


- 默认命名空间 
 
```
xmlns="http://www.w3school.com.cn" 
```

指出默认的命名空间是 "http://www.w3school.com.cn"。

- 限定范围

```
elementFormDefault="qualified" 
```

指出任何 XML 实例文档所使用的且在此 schema 中声明过的元素必须被命名空间限定。


引用：

```xml
<?xml version="1.0"?>
<note
xmlns="http://www.w3school.com.cn"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://www.w3school.com.cn note.xsd">

<to>George</to>
<from>John</from>
<heading>Reminder</heading>
<body>Don't forget the meeting!</body>
</note>
```

- 默认命名空间

```
xmlns="http://www.w3school.com.cn" 
```

规定了默认命名空间的声明。此声明会告知 schema 验证器，在此 XML 文档中使用的所有元素都被声明于 "http://www.w3school.com.cn" 这个命名空间。
一旦您拥有了可用的 XML Schema 实例命名空间：

```
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
```

您就可以使用 schemaLocation 属性了。此属性有两个值。第一个值是需要使用的命名空间。第二个值是供命名空间使用的 XML schema 的位置：

```
xsi:schemaLocation="http://www.w3school.com.cn note.xsd"
```


# Simple Data Type

简易元素指那些只包含文本的元素。它不会包含任何其他的元素或属性。

不过，“仅包含文本”这个限定却很容易造成误解。文本有**很多类型**。它可以是 XML Schema 定义中包括的类型中的一种（布尔、字符串、数据等等），或者它也可以是您自行定义的定制类型。

一、简易元素语法

```xml
<xs:element name="xxx" type="yyy"/>
```

此处 xxx 指元素的名称，yyy 指元素的数据类型。


二、简单例子

- simple.xml

```xml
<lastname>Smith</lastname>
<age>28</age>
<dateborn>1980-03-27</dateborn>
```

- simple.xsd

```xml
<xs:element name="lastname" type="xs:string"/>
<xs:element name="age" type="xs:integer"/>
<xs:element name="dateborn" type="xs:date"/> 
```

三、简易元素的默认值和固定值

当没有其他的值被规定时，默认值就会自动分配给元素。

在下面的例子中，缺省值是 "red"：

```xml
<xs:element name="color" type="xs:string" default="red"/>
```

固定值同样会自动分配给元素，并且您**无法规定另外一个值**。
在下面的例子中，固定值是 "red"：

```xml
<xs:element name="color" type="xs:string" fixed="red"/>
```


# 属性

所有的属性均作为简易类型来声明。

简易元素无法拥有属性。假如某个元素拥有属性，它就会被当作某种复合类型。但是**属性本身总是作为简易类型被声明的**。


一、如何声明属性

```xml
<xs:attribute name="xxx" type="yyy"/>
```

在此处，xxx 指属性名称，yyy 则规定属性的数据类型。

二、简单例子

- simple.xml

```xml
<lastname lang="EN">Smith</lastname>
```

- simple.xsd

```xml
<xs:attribute name="lang" type="xs:string"/>
```

三、属性的默认值和固定值

当没有其他的值被规定时，默认值就会自动分配给元素。
在下面的例子中，缺省值是 "EN"：

```xml
<xs:attribute name="lang" type="xs:string" default="EN"/>
```

固定值同样会自动分配给元素，并且您无法规定另外的值。
在下面的例子中，固定值是 "EN"：

```xml
<xs:attribute name="lang" type="xs:string" fixed="EN"/>
```


四、可选与必须的属性

在缺省的情况下，属性是可选的。如需规定属性为必选，请使用 "use" 属性：

```xml
<xs:attribute name="lang" type="xs:string" use="required"/>
```

五、对内容的限定

当 XML 元素或属性拥有被定义的数据类型时，就会向元素或属性的内容添加限定。

假如 XML 元素的类型是 "xs:date"，而其包含的内容是类似 "Hello World" 的字符串，元素将不会（通过）验证。

通过 XML schema，您也可向您的 XML 元素及属性添加自己的限定。这些限定被称为 facet（编者注：意为(多面体的)面，可译为限定面）。您会在下一节了解到更多有关 facet 的知识。


# 限定

限定（restriction）用于为 XML 元素或者属性定义可接受的值。对 XML 元素的限定被称为 facet。


一、对值的限定

下面的例子定义了带有一个限定且名为 "age" 的元素。age 的值不能低于 0 或者高于 120：

```xml
<xs:element name="age">

<xs:simpleType>
  <xs:restriction base="xs:integer">
    <xs:minInclusive value="0"/>
    <xs:maxInclusive value="120"/>
  </xs:restriction>
</xs:simpleType>

</xs:element> 
```

二、对一组值的限定

如需把 XML 元素的内容限制为一组可接受的值，我们要使用枚举约束（enumeration constraint）。
下面的例子定义了带有一个限定的名为 "car" 的元素。可接受的值只有：Audi, Golf, BMW：

```xml
<xs:element name="car">

<xs:simpleType>
  <xs:restriction base="xs:string">
    <xs:enumeration value="Audi"/>
    <xs:enumeration value="Golf"/>
    <xs:enumeration value="BMW"/>
  </xs:restriction>
</xs:simpleType>

</xs:element> 
```

三、对一系列值的限定

如需把 XML 元素的内容限制定义为一系列可使用的数字或字母，我们要使用模式约束（pattern constraint）。
下面的例子定义了带有一个限定的名为 "letter" 的元素。可接受的值只有小写字母 a - z 其中的一个：

```xml
<xs:element name="letter">

<xs:simpleType>
  <xs:restriction base="xs:string">
    <xs:pattern value="[a-z]"/>
  </xs:restriction>
</xs:simpleType>

</xs:element> 
```

四、对一系列值的其他限定

下面的例子定义了带有一个限定的名为 "letter" 的元素。可接受的值是 a - z 中零个或多个字母：

```xml
<xs:element name="letter">

<xs:simpleType>
  <xs:restriction base="xs:string">
    <xs:pattern value="([a-z])*"/>
  </xs:restriction>
</xs:simpleType>

</xs:element>
```

五、对空白字符的限定

如需规定对空白字符（whitespace characters）的处理方式，我们需要使用 whiteSpace 限定。
下面的例子定义了带有一个限定的名为 "address" 的元素。这个 whiteSpace 限定被设置为 `"preserve"`，这意味着 XML 处理器不会移除任何空白字符：

```xml
<xs:element name="address">

<xs:simpleType>
  <xs:restriction base="xs:string">
    <xs:whiteSpace value="preserve"/>
  </xs:restriction>
</xs:simpleType>

</xs:element> 
```


这个 whiteSpace 限定被设置为 "replace"，这意味着 XML 处理器将移除所有空白字符（换行、回车、空格以及制表符）;

这个 whiteSpace 限定被设置为 "collapse"，这意味着 XML 处理器将移除所有空白字符（换行、回车、空格以及制表符会被替换为空格，开头和结尾的空格会被移除，而多个连续的空格会被缩减为一个单一的空格）;


六、对长度的限定

如需限制元素中值的长度，我们需要使用 length、maxLength 以及 minLength 限定。

本例定义了带有一个限定且名为 "password" 的元素。其值必须精确到 8 个字符：

```xml
<xs:element name="password">

<xs:simpleType>
  <xs:restriction base="xs:string">
    <xs:length value="8"/>
  </xs:restriction>
</xs:simpleType>

</xs:element> 
```

限定列表：

| 限定    	       | 描述 |
|:---|:----|
| enumeration	   | 定义可接受值的一个列表 |
| fractionDigits|	定义所允许的最大的小数位数。必须大于等于0。 |
| length	       | 定义所允许的字符或者列表项目的精确数目。必须大于或等于0。|
| maxExclusive	   | 定义数值的上限。所允许的值必须小于此值。|
| maxInclusive	   | 定义数值的上限。所允许的值必须小于或等于此值。|
| maxLength	       | 定义所允许的字符或者列表项目的最大数目。必须大于或等于0。|
| minExclusive	   | 定义数值的下限。所允许的值必需大于此值。|
| minInclusive	   | 定义数值的下限。所允许的值必需大于或等于此值。|
| minLength	       | 定义所允许的字符或者列表项目的最小数目。必须大于或等于0。|
| pattern	       | 定义可接受的字符的精确序列。|
| totalDigits	   | 定义所允许的阿拉伯数字的精确位数。必须大于0。|
| whiteSpace	   | 定义空白字符（换行、回车、空格以及制表符）的处理方式。|


* any list
{:toc}







