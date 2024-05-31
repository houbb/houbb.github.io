---
layout: post
title:  XSD-02-multi type 复合元素
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

# 复合元素

一、 什么是复合元素？

复合元素指包含其他元素及/或属性的 XML 元素。

有四种类型的复合元素：

- 空元素

```xml
<product pid="1345"/>
```

- 包含其他元素的元素

```xml
<employee>
<firstname>John</firstname>
<lastname>Smith</lastname>
</employee>
```

- 仅包含文本的元素

```xml
<food type="dessert">Ice cream</food>
```

- 包含元素和文本的元素

```xml
<description>
It happened on <date lang="norwegian">03.03.99</date> 
</description>
```

> 注释

上述元素均可包含属性！


二、如何定义复合元素？

在 XML Schema 中，我们有两种方式来定义复合元素


1、通过命名此元素，可直接对"employee"元素进行声明，就像这样：

```xml
<xs:element name="employee">
  <xs:complexType>
    <xs:sequence>
      <xs:element name="firstname" type="xs:string"/>
      <xs:element name="lastname" type="xs:string"/>
    </xs:sequence>
  </xs:complexType>
</xs:element>
```

假如您使用上面所描述的方法，那么仅有 "employee" 可使用所规定的复合类型。请注意其子元素，"firstname" 以及 "lastname"，被包围在指示器 `<sequence>` 中。这意味着子元素必须以它们被声明的次序出现。

2、"employee" 元素可以使用 type 属性，这个属性的作用是引用要使用的复合类型的名称：

```xml
<xs:element name="employee" type="personinfo"/>

<xs:complexType name="personinfo">
  <xs:sequence>
    <xs:element name="firstname" type="xs:string"/>
    <xs:element name="lastname" type="xs:string"/>
  </xs:sequence>
</xs:complexType>
```

如果您使用了上面所描述的方法，那么若干元素均可以使用相同的复合类型，比如这样：

```xml
<xs:element name="employee" type="personinfo"/>
<xs:element name="student" type="personinfo"/>
<xs:element name="member" type="personinfo"/>

<xs:complexType name="personinfo">
  <xs:sequence>
    <xs:element name="firstname" type="xs:string"/>
    <xs:element name="lastname" type="xs:string"/>
  </xs:sequence>
</xs:complexType>
```

您也可以在已有的复合元素之上以某个复合元素为基础，然后添加一些元素，就像这样：

```xml
<xs:element name="employee" type="fullpersoninfo"/>

<xs:complexType name="personinfo">
  <xs:sequence>
    <xs:element name="firstname" type="xs:string"/>
    <xs:element name="lastname" type="xs:string"/>
  </xs:sequence>
</xs:complexType>

<xs:complexType name="fullpersoninfo">
  <xs:complexContent>
    <xs:extension base="personinfo">
      <xs:sequence>
        <xs:element name="address" type="xs:string"/>
        <xs:element name="city" type="xs:string"/>
        <xs:element name="country" type="xs:string"/>
      </xs:sequence>
    </xs:extension>
  </xs:complexContent>
</xs:complexType>
```

# 空元素

空的复合元素不能包含内容，只能含有属性。

```xml
<product prodid="1345" />
```

上面的 "product" 元素根本没有内容。为了定义无内容的类型，我们就必须声明一个在其内容中只能包含元素的类型，但是实际上我们并不会声明任何元素，比如这样：

```xml
<xs:element name="product">
  <xs:complexType>
    <xs:complexContent>
      <xs:restriction base="xs:integer">
        <xs:attribute name="prodid" type="xs:positiveInteger"/>
      </xs:restriction>
    </xs:complexContent>
  </xs:complexType>
</xs:element>
```

也可以更加紧凑地声明此 "product" 元素：

```xml
<xs:element name="product">
  <xs:complexType>
    <xs:attribute name="prodid" type="xs:positiveInteger"/>
  </xs:complexType>
</xs:element>
```

或者您可以为一个 complexType 元素起一个名字，然后为 "product" 元素设置一个 type 属性并引用这个 complexType 名称（通过使用此方法，若干个元素均可引用相同的复合类型）：

```xml
<xs:element name="product" type="prodtype"/>

<xs:complexType name="prodtype">
  <xs:attribute name="prodid" type="xs:positiveInteger"/>
</xs:complexType>
```

# 仅含元素

仅含元素的复合类型元素是只能包含其他元素的元素。

```xml
<person>
<firstname>John</firstname>
<lastname>Smith</lastname>
</person>
```

可在 schema 中这样定义 "person" 元素：

```xml
<xs:element name="person">
  <xs:complexType>
    <xs:sequence>
      <xs:element name="firstname" type="xs:string"/>
      <xs:element name="lastname" type="xs:string"/>
    </xs:sequence>
  </xs:complexType>
</xs:element>
```

请留意这个 <xs:sequence>。它意味着被定义的元素必须按上面的次序出现在 "person" 元素中。

或者您可以为 complexType 元素设定一个名称，并让 "person" 元素的 type 属性来引用此名称（如使用此方法，若干元素均可引用相同的复合类型）：

```xml
<xs:element name="person" type="persontype"/>

<xs:complexType name="persontype">
  <xs:sequence>
    <xs:element name="firstname" type="xs:string"/>
    <xs:element name="lastname" type="xs:string"/>
  </xs:sequence>
</xs:complexType>
```

# 仅含文本

仅含文本的复合元素可包含文本和属性。

此类型仅包含简易的内容（文本和属性），因此我们要向此内容添加 simpleContent 元素。当使用简易内容时，我们就必须在 simpleContent 元素内定义扩展或限定，就像这样：

```xml
<xs:element name="某个名称">
  <xs:complexType>
    <xs:simpleContent>
      <xs:extension base="basetype">
        ....
        ....
      </xs:extension>     
    </xs:simpleContent>
  </xs:complexType>
</xs:element>
```

or

```xml
<xs:element name="某个名称">
  <xs:complexType>
    <xs:simpleContent>
      <xs:restriction base="basetype">
        ....
        ....
      </xs:restriction>     
    </xs:simpleContent>
  </xs:complexType>
</xs:element>
```

> 提示

请使用 **extension** 或 **restriction** 元素来扩展或限制元素的基本简易类型。


仅包含文本的例子：

```xml
<shoesize country="france">35</shoesize>
```

下面这个例子声明了一个复合类型，其内容被定义为整数值，并且 "shoesize" 元素含有名为 "country" 的属性：

```xml
<xs:element name="shoesize">
  <xs:complexType>
    <xs:simpleContent>
      <xs:extension base="xs:integer">
        <xs:attribute name="country" type="xs:string" />
      </xs:extension>
    </xs:simpleContent>
  </xs:complexType>
</xs:element>
```

# 混合属性

混合的复合类型可包含属性、元素以及文本。

```xml
<letter>
Dear Mr.<name>John Smith</name>.
Your order <orderid>1032</orderid>
will be shipped on <shipdate>2001-07-13</shipdate>.
</letter>
```

下面这个 schema 声明了这个 "letter" 元素：

```xml
<xs:element name="letter">
  <xs:complexType mixed="true">
    <xs:sequence>
      <xs:element name="name" type="xs:string"/>
      <xs:element name="orderid" type="xs:positiveInteger"/>
      <xs:element name="shipdate" type="xs:date"/>
    </xs:sequence>
  </xs:complexType>
</xs:element>
```

> 注释

为了使字符数据可以出现在 "letter" 的子元素之间，mixed 属性必须被设置为 "true"。`<xs:sequence>` 标签 (name、orderid 以及 shipdate ) 意味着被定义的元素必须依次出现在 "letter" 元素内部。

# 复合类型指示器

通过指示器，我们可以控制在文档中使用元素的方式。

## Order 指示器

Order 指示器用于定义元素的顺序。

一、All 指示器

`<all>` 指示器规定子元素可以按照任意顺序出现，且每个子元素必须只出现一次：

```xml
<xs:element name="person">
  <xs:complexType>
    <xs:all>
      <xs:element name="firstname" type="xs:string"/>
      <xs:element name="lastname" type="xs:string"/>
    </xs:all>
  </xs:complexType>
</xs:element>
```

> 注释

当使用 `<all>` 指示器时，你可以把 `<minOccurs>` 设置为 0 或者 1，而只能把 <maxOccurs> 指示器设置为 1（稍后将讲解 <minOccurs> 以及 <maxOccurs>）。

二、Choice 指示器

`<choice>` 指示器规定可出现某个子元素或者可出现另外一个子元素（非此即彼）：

```xml
<xs:element name="person">
  <xs:complexType>
    <xs:choice>
      <xs:element name="employee" type="employee"/>
      <xs:element name="member" type="member"/>
    </xs:choice>
  </xs:complexType>
</xs:element>
```

> 提示

如需设置子元素出现任意次数，可将 `<maxOccurs>` （稍后会讲解）设置为 unbounded（无限次）。

三、Sequence 指示器

`<sequence>` 规定子元素必须按照特定的顺序出现：

```xml
<xs:element name="person">
  <xs:complexType>
    <xs:sequence>
      <xs:element name="firstname" type="xs:string"/>
      <xs:element name="lastname" type="xs:string"/>
    </xs:sequence>
  </xs:complexType>
</xs:element>
```

## Occurrence 指示器

Occurrence 指示器用于定义某个元素出现的频率。

> 注释

对于所有的 "Order" 和 "Group" 指示器（any、all、choice、sequence、group name 以及 group reference），其中的 maxOccurs 以及 minOccurs 的默认值均为 1。

一、maxOccurs 指示器

`<maxOccurs>` 指示器可规定某个元素可出现的最大次数：

```xml
<xs:element name="person">
  <xs:complexType>
    <xs:sequence>
      <xs:element name="full_name" type="xs:string"/>
      <xs:element name="child_name" type="xs:string" maxOccurs="10"/>
    </xs:sequence>
  </xs:complexType>
</xs:element>
```

二、minOccurs 指示器

`<minOccurs>` 指示器可规定某个元素能够出现的最小次数：

```xml
<xs:element name="person">
  <xs:complexType>
    <xs:sequence>
      <xs:element name="full_name" type="xs:string"/>
      <xs:element name="child_name" type="xs:string"
      maxOccurs="10" minOccurs="0"/>
    </xs:sequence>
  </xs:complexType>
</xs:element>
```

> 提示

如需使某个元素的出现次数不受限制，请使用 maxOccurs="unbounded" 这个声明


## Group 指示器

Group 指示器用于定义相关的数批元素。

一、元素组

```xml
<xs:group name="组名称">
  ...
</xs:group>
```

您必须在 group 声明内部定义一个 all、choice 或者 sequence 元素。下面这个例子定义了名为 "persongroup" 的 group，它定义了必须按照精确的顺序出现的一组元素：

```xml
<xs:group name="persongroup">
  <xs:sequence>
    <xs:element name="firstname" type="xs:string"/>
    <xs:element name="lastname" type="xs:string"/>
    <xs:element name="birthday" type="xs:date"/>
  </xs:sequence>
</xs:group>
```

在您把 group 定义完毕以后，就可以在另一个定义中引用它了：


```xml
<xs:group name="persongroup">
  <xs:sequence>
    <xs:element name="firstname" type="xs:string"/>
    <xs:element name="lastname" type="xs:string"/>
    <xs:element name="birthday" type="xs:date"/>
  </xs:sequence>
</xs:group>

<xs:element name="person" type="personinfo"/>

<xs:complexType name="personinfo">
  <xs:sequence>
    <xs:group ref="persongroup"/>
    <xs:element name="country" type="xs:string"/>
  </xs:sequence>
</xs:complexType>
```

二、属性组

属性组通过 attributeGroup 声明来进行定义：

```xml
<xs:attributeGroup name="组名称">
  ...
</xs:attributeGroup>
```

下面这个例子定义了名为 "personattrgroup" 的一个属性组：

```xml
<xs:attributeGroup name="personattrgroup">
  <xs:attribute name="firstname" type="xs:string"/>
  <xs:attribute name="lastname" type="xs:string"/>
  <xs:attribute name="birthday" type="xs:date"/>
</xs:attributeGroup>
```

在您已定义完毕属性组之后，就可以在另一个定义中引用它了，就像这样：

```xml
<xs:attributeGroup name="personattrgroup">
  <xs:attribute name="firstname" type="xs:string"/>
  <xs:attribute name="lastname" type="xs:string"/>
  <xs:attribute name="birthday" type="xs:date"/>
</xs:attributeGroup>

<xs:element name="person">
  <xs:complexType>
    <xs:attributeGroup ref="personattrgroup"/>
  </xs:complexType>
</xs:element>
```

# Any

`<any>` 元素使我们有能力通过未被 schema 规定的元素来拓展 XML 文档！

下面这个例子是从名为 "family.xsd" 的 XML schema 中引用的片段。它展示了一个针对 "person" 元素的声明。通过使用 `<any>` 元素，我们可以通过任何元素（在 `<lastname>` 之后）扩展 "person" 的内容：

```xml
<xs:element name="person">
  <xs:complexType>
    <xs:sequence>
      <xs:element name="firstname" type="xs:string"/>
      <xs:element name="lastname" type="xs:string"/>
      <xs:any minOccurs="0"/>
    </xs:sequence>
  </xs:complexType>
</xs:element>
```

现在，我们希望使用 "children" 元素来扩展 "person" 元素。这此种情况下我们就可以这么做，即使以上这个 schema 的作者没有声明任何 "children" 元素。
请看这个 schema 文件，名为 "children.xsd"：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
targetNamespace="http://www.w3school.com.cn"
xmlns="http://www.w3school.com.cn"
elementFormDefault="qualified">

<xs:element name="children">
  <xs:complexType>
    <xs:sequence>
      <xs:element name="childname" type="xs:string"
      maxOccurs="unbounded"/>
    </xs:sequence>
  </xs:complexType>
</xs:element>

</xs:schema>
```

下面这个 XML 文件（名为 "Myfamily.xml"），使用了来自两个不同的 schema 中的成分，"family.xsd" 和 "children.xsd"：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>

<persons xmlns="http://www.microsoft.com"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:SchemaLocation="http://www.microsoft.com family.xsd
http://www.w3school.com.cn children.xsd">

<person>
<firstname>David</firstname>
<lastname>Smith</lastname>
<children>
  <childname>mike</childname>
</children>
</person>

<person>
<firstname>Tony</firstname>
<lastname>Smith</lastname>
</person>

</persons>
```

# anyAttribute

`<anyAttribute>` 元素使我们有能力通过未被 schema 规定的属性来扩展 XML 文档！

下面的例子是来自名为 "family.xsd" 的 XML schema 的一个片段。它为我们展示了针对 "person" 元素的一个声明。通过使用 `<anyAttribute>` 元素，我们就可以向 "person" 元素添加任意数量的属性：


```xml
<xs:element name="person">
  <xs:complexType>
    <xs:sequence>
      <xs:element name="firstname" type="xs:string"/>
      <xs:element name="lastname" type="xs:string"/>
    </xs:sequence>
    <xs:anyAttribute/>
  </xs:complexType>
</xs:element>
```

现在，我们希望通过 "gender" 属性来扩展 "person" 元素。在这种情况下我们就可以这样做，即使这个 schema 的作者从未声明过任何 "gender" 属性。
请看这个 schema 文件，名为 "attribute.xsd"：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
targetNamespace="http://www.w3school.com.cn"
xmlns="http://www.w3school.com.cn"
elementFormDefault="qualified">

<xs:attribute name="gender">
  <xs:simpleType>
    <xs:restriction base="xs:string">
      <xs:pattern value="male|female"/>
    </xs:restriction>
  </xs:simpleType>
</xs:attribute>

</xs:schema>
```

下面这个 XML（名为 "Myfamily.xml"），使用了来自不同 schema 的成分，"family.xsd" 和 "attribute.xsd"：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>

<persons xmlns="http://www.microsoft.com"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:SchemaLocation="http://www.microsoft.com family.xsd
http://www.w3school.com.cn attribute.xsd">

<person gender="female">
<firstname>Jane</firstname>
<lastname>Smith</lastname>
</person>

<person gender="male">
<firstname>David</firstname>
<lastname>Smith</lastname>
</person>

</persons>
```




# 元素替换

让我们举例说明：我们的用户来自英国和挪威。我们希望有能力让用户选择在 XML 文档中使用挪威语的元素名称还是英语的元素名称。

为了解决这个问题，我们可以在 XML schema 中定义一个 `substitutionGroup`。首先，我们声明主元素，然后我们会声明次元素，这些次元素可声明它们能够替换主元素。


```xml
<xs:element name="name" type="xs:string"/>
<xs:element name="navn" substitutionGroup="name"/>
```

在上面的例子中，"name" 元素是主元素，而 "navn" 元素可替代 "name" 元素。

请看一个 XML schema 的片段：

```xml
<xs:element name="name" type="xs:string"/>
<xs:element name="navn" substitutionGroup="name"/>

<xs:complexType name="custinfo">
  <xs:sequence>
    <xs:element ref="name"/>
  </xs:sequence>
</xs:complexType>

<xs:element name="customer" type="custinfo"/>
<xs:element name="kunde" substitutionGroup="customer"/>
```

有效的 XML 文档类似这样（根据上面的 schema）：

```xml
<customer>
  <name>John Smith</name>
</customer>
```

或类似这样：

```xml
<kunde>
  <navn>John Smith</navn>
</kunde>
```

一、阻止元素替换

为防止其他的元素替换某个指定的元素，请使用 block 属性：

```xml
<xs:element name="name" type="xs:string" block="substitution"/>
```

请看某个 XML schema 的片段：
```xml
<xs:element name="name" type="xs:string" block="substitution"/>
<xs:element name="navn" substitutionGroup="name"/>

<xs:complexType name="custinfo">
  <xs:sequence>
    <xs:element ref="name"/>
  </xs:sequence>
</xs:complexType>

<xs:element name="customer" type="custinfo" block="substitution"/>
<xs:element name="kunde" substitutionGroup="customer"/>
```
合法的 XML 文档应该类似这样（根据上面的 schema）：

```xml
<customer>
  <name>John Smith</name>
</customer>
```

但是下面的文档不再合法：

```xml
<kunde>
  <navn>John Smith</navn>
</kunde>
```

二、使用 substitutionGroup

可替换元素的类型必须和主元素相同，或者从主元素衍生而来。假如可替换元素的类型与主元素的类型相同，那么您就不必规定可替换元素的类型了。

请注意，substitutionGroup 中的所有元素（主元素和可替换元素）必须被声明为全局元素，否则就无法工作！





* any list
{:toc}
