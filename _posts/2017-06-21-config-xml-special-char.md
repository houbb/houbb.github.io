---
layout: post
title: XML 中如何指定特殊符号？比如 xml 如何包含双引号、单引号
date:  2017-06-21 13:59:45 +0800
categories: [Config]
tags: [config, xml, sh]
published: true
---

# 场景

在 xml 中,有一些符号作为XML 的标记符号，一些特定情况下，属性值必须带有这些特殊符号。
 
## 例子

例:　双引号的使用。

双引号作为XML 属性值的开始结束符号，因此无法在值中直接使用 `""`。

处理方式可以分为两种。

a: 属性值中没有单引号’ ，那么可以用单引号'作为属性值的开始结束符号

```xml
<addkey="IPhone"value="apple"/>  
```

若属性值为 "apple”

解决：　 

```xml
<addkey="IPhone"value=’"apple"‘/> 
```

 b: 属性值中有单引号‘ ，也有双引号”。 若属性值为 "'apple"

```xml
<addkey="IPhone"value="&quot;&apos;apple&quot;"/> 
```

# xml 的内置实体

下表为 XML 标记使用的字符列出了五种内置实体。

| 实体| 实体引用  | 	含义 |
|:---|:---|:---|
| lt   |   <         | <（小于号） |
| gt   |   >         | >（大于号） |
| apos |   '         | 单引号符号 |
| quot |   "         | 双引号符号 |


# 参考资料

https://blog.csdn.net/xixi8865/article/details/23849125

* any list
{:toc}