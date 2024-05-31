---
layout: post
title: XML 非法字符,PCDATA invalid Char value 8,非法字符 0X0
date:  2017-06-21 13:59:45 +0800
categories: [Config]
tags: [xml, error, sf]
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

# 错误场景

`feed.xml` 出现两个非法字符。导致 xml 解析失败。感觉 js 出发非法字符的能力还是有些弱。

# PCDATA invalid Char value 8

`<0x08>` 这种东西，普通编辑器还是看不见的。

在 sublime 中可以看到。

# 非法字符 0X0

`{?}` 一个实心的符号，xml 解析直接就跪了。

手动找到并且删除的。

# 暂时处理方式

直接删除

# 参考资料

https://github.com/jankotek/mapdb

[怎样去除 XML 中像 ^H 等无效字符？ PCDATA invalid Char value 8](http://ju.outofmemory.cn/entry/31232)

* any list
{:toc}