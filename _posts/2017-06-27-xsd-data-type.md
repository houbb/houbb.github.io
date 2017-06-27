---
layout: post
title:  XSD-03-data type
date:  2017-6-27 17:51:13 +0800
categories: [XML]
tags: [xsd]
published: true
---


# 字符串

字符串数据类型可包含字符、换行、回车以及制表符。

一、字符串数据类型

scheme 中字符串声明的例子：

```xml
<xs:element name="customer" type="xs:string"/>
```

元素应该如下:

```xml
<customer>John Smith</customer>
```

or 

```xml
<customer>	John Smith	</customer>
```

> 注释

如果您使用字符串数据类型，XML 处理器就不会更改其中的值。

二、规格化字符串数据类型

规格化字符串数据类型源自于字符串数据类型。
规格化字符串数据类型同样可包含字符，但是 XML 处理器会**移除折行，回车以及制表符**。
下面是一个关于在某个 schema 中规格化字符串数据类型的例子：

```xml
<xs:element name="customer" type="xs:normalizedString"/>
```

使用和上面一样。但是 XML 处理器会使用空格替换所有的制表符。

三、Token 数据类型

Token 数据类型同样源自于字符串数据类型。
Token 数据类型同样可包含字符，但是 XML 处理器会**移除换行符、回车、制表符、开头和结尾的空格以及（连续的）空格**。


