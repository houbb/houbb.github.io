---
layout: post
title:  XSD-03-data type xml 数据类型
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

下面是在 schema 中一个有关 token 声明的例子：

```xml
<xs:element name="customer" type="xs:token"/>
```

使用与上面类似。

# 日期

一、日期数据类型

日期数据类型用于定义日期。

日期使用此格式进行定义："YYYY-MM-DD"，其中：

- YYYY 表示年份

- MM 表示月份

- DD 表示天数

> 注释

所有的成分都是必需的！


下面是一个有关 schema 中日期声明的例子：

```xml
<xs:element name="start" type="xs:date"/>
```

文档中的元素看上去应该类似这样：

```xml
<start>2002-09-24</start>
```

2、时区

如需规定一个时区，您也可以通过在日期后加一个 `Z` 的方式，使用世界调整时间（UTC time）来输入一个日期 - 比如这样：

```xml
<start>2002-09-24Z</start>
```

或者也可以通过在日期后添加一个正的或负时间的方法，来规定以世界调整时间为准的偏移量：

```xml
<start>2002-09-24-06:00</start>
```

or

```xml
<start>2002-09-24+06:00</start>
```

二、时间数据类型

时间数据类型用于定义时间。

时间使用下面的格式来定义："hh:mm:ss"，其中

- hh 表示小时

- mm 表示分钟

- ss 表示秒

> 注释

所有的成分都是必需的！

下面是一个有关 schema 中时间声明的例子：

```xml
<xs:element name="start" type="xs:time"/>
```
文档中的元素看上去应该类似这样：

```xml
<start>09:00:00</start>
```

or

```xml
<start>09:30:10.5</start>
```

2、时区

和上面一样。

三、日期时间数据类型

日期时间数据类型用于定义日期和时间。

日期时间使用下面的格式进行定义："YYYY-MM-DDThh:mm:ss"，其中：

- YYYY 表示年份

- MM 表示月份

- DD 表示日

- T 表示必需的时间部分的起始

- hh 表示小时

- mm 表示分钟

- ss 表示秒

> 注释

所有的成分都是必需的！

下面是一个有关 schema 中日期时间声明的例子：

```xml
<xs:element name="startdate" type="xs:dateTime"/>
```

文档中的元素看上去应该类似这样：

```xml
<startdate>2002-05-30T09:00:00</startdate>
```

or

```xml
<startdate>2002-05-30T09:30:10.5</startdate>
```

四、持续时间数据类型

持续时间数据类型用于规定时间间隔。

时间间隔使用下面的格式来规定："PnYnMnDTnHnMnS"，其中：

- P 表示周期(必需)

- nY 表示年数

- nM 表示月数

- nD 表示天数

- T 表示时间部分的起始 （如果您打算规定小时、分钟和秒，则此选项为必需）

- nH 表示小时数

- nM 表示分钟数

- nS 表示秒数

下面是一个有关 schema 中持续时间声明的例子：

```xml
<xs:element name="period" type="xs:duration"/>
```

文档中的元素看上去应该类似这样：

```xml
<period>P5Y</period>
```
上面的例子表示一个 5 年的周期。

或者类似这样：

```xml
<period>P5Y2M10D</period>
```

上面的例子表示一个 5 年、2 个月及 10 天的周期。

五、负的持续时间

如需规定一个负的持续时间，请在 P 之前输入减号：

```xml
<period>-P10D</period>
```

上面的例子表示一个负 10 天的周期。

# 数值数据类型


一、十进制数据类型

十进制数据类型用于规定一个数值。

下面是一个关于某个 scheme 中十进制数声明的例子。

```xml
<xs:element name="prize" type="xs:decimal"/>
```

文档中的元素看上去应该类似这样：

```xml
<prize>999.50</prize>
```

or

```xml
<prize>+999.5450</prize>
```

> 注释

您可规定的十进制数字的最大位数是 18 位。


二、整数数据类型

整数数据类型用于规定无小数成分的数值。

下面是一个关于某个 scheme 中整数声明的例子。

```xml
<xs:element name="prize" type="xs:integer"/>
```

文档中的元素看上去应该类似这样：

```xml
<prize>999</prize>
```

或者类似这样：

```xml
<prize>+999</prize>
```

# 杂项数据类型

其他杂项数据类型包括逻辑、base64Binary、十六进制、浮点、双精度、anyURI、anyURI 以及 NOTATION。


一、逻辑数据类型

逻辑数据性用于规定 true 或 false 值。

下面是一个关于某个 scheme 中逻辑声明的例子：

```xml
<xs:attribute name="disabled" type="xs:boolean"/>
```

文档中的元素看上去应该类似这样：

```xml
<prize disabled="true">999</prize>
```

> 注释

合法的布尔值是 true、false、1（表示 true） 以及 0（表示 false）。


二、二进制数据类型

二进制数据类型用于表达二进制形式的数据。

我们可使用两种二进制数据类型：

- base64Binary (Base64 编码的二进制数据)

- hexBinary (十六进制编码的二进制数据)

下面是一个关于某个 scheme 中 hexBinary 声明的例子：

```xml
<xs:element name="blobsrc" type="xs:hexBinary"/>
```

三、AnyURI 数据类型

anyURI 数据类型用于规定 URI。

下面是一个关于某个 scheme 中 anyURI 声明的例子：

```xml
<xs:attribute name="src" type="xs:anyURI"/>
```

文档中的元素看上去应该类似这样：

```xml
<pic src="http://www.w3school.com.cn/images/smiley.gif" />
```

> 注释

假如某个 URI 含有空格，请用 %20 替换它们。


* any list
{:toc}














