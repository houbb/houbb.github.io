---
layout: post
title: config 配置方式概览-config overview
date:  2017-06-21 13:59:45 +0800
categories: [Config]
tags: [config, overview]
published: true
---


# 拓展阅读

[toml-01-toml 配置文件介绍](https://houbb.github.io/2017/06/21/config-toml-01-overview)

[YAML-01-yml 配置文件介绍](https://houbb.github.io/2017/06/21/config-yam-01-intro)

[YAML-02-yml 配置文件 java 整合使用 yamlbeans + snakeyaml + jackson-dataformat-yaml](https://houbb.github.io/2017/06/21/config-yaml-02-java-integration)

[json 专题系列](https://houbb.github.io/2018/07/20/json-00-overview)

# 组件

XML

json

yaml

properties

ini

TOML

HCL

CFG

## 其他

csv

excel 

converter

# chat

## Q: 常见的配置方式，除了 yaml、properties、ini、json 还有哪些格式?

除了 YAML、Properties、INI 和 JSON 格式之外，还有一些常见的配置格式，包括：

1. **XML**：虽然 XML 主要用于标记数据，但它也被广泛用作配置文件格式，特别是在较早的项目中。
   
2. **TOML**（Tom's Obvious, Minimal Language）：TOML 是一种用于配置文件的简单格式，旨在比 JSON 更易读。它具有类似 INI 文件的结构，但提供了更丰富的数据类型和功能。

3. **HCL**（HashiCorp Configuration Language）：HCL 是一种由 HashiCorp 开发的配置语言，通常用于配置 HashiCorp 工具（如 Terraform、Consul 和 Vault）。它结合了 JSON 和 HCL 的优点，提供了一种更简洁、更易读的配置语法。

4. **CFG**（Configuration File）：CFG 文件是一种简单的文本配置文件格式，通常用于存储程序或系统的配置信息。它们可能具有自定义的语法和结构，因此格式可能会有所不同。

5. **INI+**：INI+ 是一种扩展了传统 INI 格式的配置文件格式。它通常支持更多的数据类型、嵌套结构和其他功能，使其更适合于复杂的配置需求。

6. **YAML 2.0**：YAML 的下一个版本（YAML 2.0）正在开发中，它将引入一些改进和扩展，以解决当前 YAML 标准中存在的一些问题，并提供更丰富的功能。

这些是一些常见的配置文件格式，每种格式都有其适用的场景和优缺点。

选择最合适的配置格式取决于项目的需求、团队的偏好以及与其他系统的集成需求。

# 小结

配置的方式多样，可以汇总为一个系列。

然后每一种配置方式，java 整合的组件实现。

* any list
{:toc}
