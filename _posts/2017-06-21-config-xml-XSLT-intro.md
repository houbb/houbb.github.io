---
layout: post
title:  XSLT 转换 XML 文档的语言
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

# XSLT

[XSL](http://www.w3school.com.cn/xsl/index.asp) 指扩展样式表语言（EXtensible Stylesheet Language）。
万维网联盟开始发展 XSL 的起因是由于对基于 XML 的样式表语言的需求。
XSLT 指 XSL 转换。

XSL - 不仅仅是样式表语言

XSL 包括三部分：

- XSLT

一种用于转换 XML 文档的语言。

- XPath

一种用于在 XML 文档中导航的语言。

- XSL-FO

一种用于格式化 XML 文档的语言。

# XSLT - 转换

实例研究：如何使用 XSLT 将 XML 转换为 XHTML。

正确的样式表声明

把文档声明为 XSL 样式表的根元素是 `<xsl:stylesheet>` 或 `<xsl:transform>`。

注释： `<xsl:stylesheet>` 和 `<xsl:transform>` 是完全同义的，均可被使用！

根据 W3C 的 XSLT 标准，声明 XSL 样式表的正确方法是：

```xml
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
```

或者：

```xml
<xsl:transform version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
```
如需访问 XSLT 的元素、属性以及特性，我们必须在文档顶端声明 XSLT 命名空间。

`xmlns:xsl="http://www.w3.org/1999/XSL/Transform"` 指向了官方的 W3C XSLT 命名空间。
如果您使用此命名空间，就必须包含属性  `version="1.0"` 。


一、从一个原始的 XML 文档开始（cdcatalog.xml）

我们现在要把下面这个 XML 文档转换为 XHTML：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<catalog>
  <cd>
    <title>Empire Burlesque</title>
    <artist>Bob Dylan</artist>
    <country>USA</country>
    <company>Columbia</company>
    <price>10.90</price>
    <year>1985</year>
  </cd>
  <!--...-->
</catalog>
```

[查看完整文档](http://www.w3school.com.cn/xsl/cdcatalog.xml)

二、创建 XSL 样式表（cdcatalog.xsl）

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  <html>
  <body>
    <h2>My CD Collection</h2>
    <table border="1">
    <tr bgcolor="#9acd32">
      <th align="left">Title</th>
      <th align="left">Artist</th>
    </tr>
    <xsl:for-each select="catalog/cd">
    <tr>
      <td><xsl:value-of select="title"/></td>
      <td><xsl:value-of select="artist"/></td>
    </tr>
    </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>

</xsl:stylesheet>
```

三、把 XSL 样式表链接到 XML 文档

向 XML 文档 `cdcatalog.xml` 添加 XSL 样式表引用：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<?xml-stylesheet type="text/xsl" href="cdcatalog.xsl"?>
<catalog>
  <cd>
    <title>Empire Burlesque</title>
    <artist>Bob Dylan</artist>
    <country>USA</country>
    <company>Columbia</company>
    <price>10.90</price>
    <year>1985</year>
  </cd>
</catalog>
```

[查看转换结果](http://www.w3school.com.cn/xsl/cdcatalog_with_xsl.xml)

# `<xsl:template>` 

`<xsl:template>` 元素用于构建模板。

match 属性用于关联 XML 元素和模板。match 属性也可用来为整个文档定义模板。match 属性的值是 XPath 表达式（举例，match="/" 定义整个文档）。

上一个例子的简化版本:

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
 <html>
 <body>
   <h2>My CD Collection</h2>
   <table border="1">
     <tr bgcolor="#9acd32">
       <th>Title</th>
       <th>Artist</th>
     </tr>
     <tr>
       <td>.</td>
       <td>.</td>
     </tr>
   </table>
 </body>
 </html>
</xsl:template>

</xsl:stylesheet>
```

简单解释：

1、由于 XSL 样式表本身也是一个 XML 文档，因此它总是由 XML 声明起始;

2、`<xsl:stylesheet>` 定义此文档是一个 XSLT 样式表文档（连同版本号和 XSLT 命名空间属性）。

3、`<xsl:template>` 元素定义了一个模板，内部的内容定义了写到输出结果的 HTML 代码。而 match="/" 属性则把此模板与 XML 源文档的根相联系。

[查看结果](http://www.w3school.com.cn/xsl/cdcatalog_with_ex1.xml)

此例的结果有一点小缺陷，因为数据没有从 XML 文档被复制到输出。

# `<xsl:value-of>`


`<xsl:value-of>` 元素用于提取某个选定节点的值。

如下：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
 <html>
 <body>
   <h2>My CD Collection</h2>
   <table border="1">
     <tr bgcolor="#9acd32">
       <th>Title</th>
       <th>Artist</th>
     </tr>
     <tr>
      <td><xsl:value-of select="catalog/cd/title"/></td>
      <td><xsl:value-of select="catalog/cd/artist"/></td>
     </tr>
   </table>
 </body>
 </html>
</xsl:template>

</xsl:stylesheet>
```


> 注释

select 属性的值是一个 [XPath](http://www.w3school.com.cn/xpath/index.asp) 表达式。此表达式的工作方式类似于定位某个文件系统，在其中正斜杠可选择子目录。


[查看结果](http://www.w3school.com.cn/xsl/cdcatalog_with_ex2.xml)


这个例子的结果有一点缺陷：仅有一行数据从 XML 文档被拷贝到输出结果。


# `<xsl:for-each>`

`<xsl:for-each>` 元素允许您在 XSLT 中进行循环。

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  <html>
  <body>
    <h2>My CD Collection</h2>
    <table border="1">
      <tr bgcolor="#9acd32">
        <th>Title</th>
        <th>Artist</th>
      </tr>
      <xsl:for-each select="catalog/cd">
      <tr>
        <td><xsl:value-of select="title"/></td>
        <td><xsl:value-of select="artist"/></td>
      </tr>
      </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>

</xsl:stylesheet>
```

[查看结果](http://www.w3school.com.cn/xsl/cdcatalog_with_ex3.xml)

## 结果过滤

通过在 `<xsl:for-each>` 元素中添加一个选择属性的判别式，我们也可以过滤从 XML 文件输出的结果。

```xml
<xsl:for-each select="catalog/cd[artist='Bob Dylan']">
```

合法的过滤运算符:

- =  (等于)

- != (不等于)

- &lt; (小于)

- &gt; (大于)

如下：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
 <html>
  <body>
  <h2>My CD Collection</h2>
  <table border="1">
   <tr bgcolor="#9acd32">
      <th>Title</th>
      <th>Artist</th>
   </tr>
   <xsl:for-each select="catalog/cd[artist='Bob Dylan']">
   <tr>
      <td><xsl:value-of select="title"/></td>
      <td><xsl:value-of select="artist"/></td>
   </tr>
   </xsl:for-each>
  </table>
 </body>
 </html>
</xsl:template>

</xsl:stylesheet>
```

[查看结果](http://www.w3school.com.cn/xsl/cdcatalog_filter.xml)


# `<xsl:sort>`

`<xsl:sort>` 元素用于对结果进行排序。

如需对结果进行排序，只要简单地在 XSL 文件中的 `<xsl:for-each>` 元素内部添加一个 `<xsl:sort>` 元素：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  <html>
  <body>
    <h2>My CD Collection</h2>
    <table border="1">
      <tr bgcolor="#9acd32">
        <th>Title</th>
        <th>Artist</th>
      </tr>
      <xsl:for-each select="catalog/cd">
      <xsl:sort select="artist"/>
      <tr>
        <td><xsl:value-of select="title"/></td>
        <td><xsl:value-of select="artist"/></td>
      </tr>
      </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>

</xsl:stylesheet>
```

[查看结果](http://www.w3school.com.cn/xsl/cdcatalog_sort.xml)


# `<xsl:if>`

`<xsl:if>` 元素用于放置针对 XML 文件内容的条件测试

一、语法

如需放置针对 XML 文件内容的条件测试，请向 XSL 文档添加 `<xsl:if>` 元素。

```xml
<xsl:if test="expression">
  ...
  ...如果条件成立则输出...
  ...
</xsl:if>
```


二、实例

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="/">
  <html>
  <body>
    <h2>My CD Collection</h2>
    <table border="1">
      <tr bgcolor="#9acd32">
        <th>Title</th>
        <th>Artist</th>
      </tr>
      <xsl:for-each select="catalog/cd">
      <xsl:if test="price &gt; 10">
        <tr>
          <td><xsl:value-of select="title"/></td>
          <td><xsl:value-of select="artist"/></td>
        </tr>
      </xsl:if>
      </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>
</xsl:stylesheet>
```

> 注释

必选的 test 属性的值包含了需要求值的表达式。
上面的代码仅仅会输出价格高于 10 的 CD 的 title 和 artist 元素。

[查看结果](http://www.w3school.com.cn/xsl/cdcatalog_if.xml)


# `<xsl:choose>`

`<xsl:choose>` 元素用于结合 `<xsl:when>` 和 `<xsl:otherwise>` 来表达多重条件测试。

一、语法

```xml
<xsl:choose>
  <xsl:when test="expression">
    ... 输出 ...
  </xsl:when>
  <xsl:otherwise>
    ... 输出 ....
  </xsl:otherwise>
</xsl:choose>
```

二、实例1

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  <html>
  <body>
    <h2>My CD Collection</h2>
    <table border="1">
      <tr bgcolor="#9acd32">
        <th>Title</th>
        <th>Artist</th>
      </tr>
      <xsl:for-each select="catalog/cd">
      <tr>
        <td><xsl:value-of select="title"/></td>
      	<xsl:choose>
          <xsl:when test="price &gt; 10">
            <td bgcolor="#ff00ff">
            <xsl:value-of select="artist"/></td>
          </xsl:when>
          <xsl:otherwise>
            <td><xsl:value-of select="artist"/></td>
          </xsl:otherwise>
        </xsl:choose>
      </tr>
      </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>

</xsl:stylesheet>
```

[查看结果](http://www.w3school.com.cn/xsl/cdcatalog_choose.xml)


三、实例2

这是另外一个包含两个 <xsl:when> 元素的例子

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  <html>
  <body>
    <h2>My CD Collection</h2>
    <table border="1">
      <tr bgcolor="#9acd32">
        <th>Title</th>
        <th>Artist</th>
      </tr>
      <xsl:for-each select="catalog/cd">
      <tr>
        <td><xsl:value-of select="title"/></td>
      	<xsl:choose>
          <xsl:when test="price &gt; 10">
            <td bgcolor="#ff00ff">
            <xsl:value-of select="artist"/></td>
          </xsl:when>
          <xsl:when test="price &gt; 9">
            <td bgcolor="#cccccc">
            <xsl:value-of select="artist"/></td>
          </xsl:when>
          <xsl:otherwise>
            <td><xsl:value-of select="artist"/></td>
          </xsl:otherwise>
        </xsl:choose>
      </tr>
      </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>

</xsl:stylesheet>
```

[查看结果](http://www.w3school.com.cn/xsl/cdcatalog_choose2.xml)


# `<xsl:apply-templates>`

`<xsl:apply-templates>` 元素可把一个模板应用于当前的元素或者当前元素的子节点。

假如我们向 `<xsl:apply-templates>` 元素添加一个 select 属性，此元素就会仅仅处理与属性值匹配的子元素。我们可以使用 select 属性来规定子节点被处理的顺序。

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
<html>
<body>
<h2>My CD Collection</h2> 
<xsl:apply-templates/> 
</body>
</html>
</xsl:template>

<xsl:template match="cd">
<p>
<xsl:apply-templates select="title"/> 
<xsl:apply-templates select="artist"/>
</p>
</xsl:template>

<xsl:template match="title">
Title: <span style="color:#ff0000">
<xsl:value-of select="."/></span>
<br />
</xsl:template>

<xsl:template match="artist">
Artist: <span style="color:#00ff00">
<xsl:value-of select="."/></span>
<br />
</xsl:template>

</xsl:stylesheet>
```

[查看结果](http://www.w3school.com.cn/xsl/cdcatalog_apply.xml)


PS： 这使我想起了 mybatis ==!

# `<xsl:apply-templates>`

`<xsl:apply-templates>` 元素可把一个模板应用于当前的元素或者当前元素的子节点。

假如我们向 `<xsl:apply-templates>` 元素添加一个 select 属性，此元素就会仅仅处理与属性值匹配的子元素。我们可以使用 select 属性来规定子节点被处理的顺序。

如下所示：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
<html>
<body>
<h2>My CD Collection</h2> 
<xsl:apply-templates/> 
</body>
</html>
</xsl:template>

<xsl:template match="cd">
<p>
<xsl:apply-templates select="title"/> 
<xsl:apply-templates select="artist"/>
</p>
</xsl:template>

<xsl:template match="title">
Title: <span style="color:#ff0000">
<xsl:value-of select="."/></span>
<br />
</xsl:template>

<xsl:template match="artist">
Artist: <span style="color:#00ff00">
<xsl:value-of select="."/></span>
<br />
</xsl:template>

</xsl:stylesheet>
```

[点击查看效果](http://www.w3school.com.cn/xsl/cdcatalog_apply.xml)






* any list
{:toc}







