---
layout: post
title: Apache Calcite doc avatica-07-Compatibility 兼容性
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 兼容性

## Avatica技术兼容性套件（TCK）
Avatica TCK项目是一个旨在自动测试Avatica客户端与Avatica服务器的框架。一组JUnit测试、一个YAML配置文件和一个Ruby脚本定义了TCK。JUnit测试调用Avatica的客户端和服务器组件的特定部分，以验证它们是否按预期工作。Ruby脚本使用YAML配置文件定义要对JUnit测试进行的一组客户端和服务器版本对。

在YAML配置文件中，一个名称（例如1.6.0）和以下三个项目定义了Avatica版本：

1. Avatica客户端jar的文件系统路径（例如groupId=org.apache.calcite.avatica，artifactId=avatica）
2. 运行中的Avatica服务器实例的URL
3. Avatica客户端JDBC驱动程序的到Avatica服务器的JDBC URL模板。

TCK的用户通过一个YAML配置文件定义版本的集合（由上述信息定义），以及avatica-tck jar的位置。一个示例的YAML配置文件与项目捆绑在一起。

传统上，Avatica不提供任何Avatica服务器的实现，因为Avatica的价值在于集成项目中被识别（例如Apache Drill或Apache Phoenix）。然而，为了兼容性测试的目的，Avatica提供了一个独立的服务器实例是有意义的。Avatica引入了一个新的与原始TCK代码库相同的artifact，称为avatica-standalone-server。这个artifact是一个可运行的jar（例如java -jar），它在随机端口上使用内存中的HSQLDB数据库启动Avatica服务器的一个实例。这个artifact使得为要测试的特定版本的Avatica启动Avatica服务器变得非常简单。

正如前面提到的，Ruby脚本是TCK的入口点。调用Ruby脚本会打印一个总结，测试每个指定版本与自身以及YAML配置中的所有其他版本的兼容性。下面是一个示例总结，它是对版本1.6.0、1.7.1和1.8.0-SNAPSHOT进行测试的结果：

**总结：**

**身份测试场景（共运行3次）**

* 对版本v1.6.0进行身份验证：通过
* 对版本v1.7.1进行身份验证：通过
* 对版本v1.8.0-SNAPSHOT进行身份验证：失败

**所有测试场景（共运行6次）**

* 将客户端v1.6.0与服务器v1.7.1进行测试：通过
* 将客户端v1.6.0与服务器v1.8.0-SNAPSHOT进行测试：失败
* 将客户端v1.7.1与服务器v1.6.0进行测试：通过
* 将客户端v1.7.1与服务器v1.8.0-SNAPSHOT进行测试：失败
* 将客户端v1.8.0-SNAPSHOT与服务器v1.6.0进行测试：失败
* 将客户端v1.8.0-SNAPSHOT与服务器v1.7.1进行测试：失败

并不总是期望所有测试的版本对都能通过，除非测试针对Avatica本身的过去错误有具体了解。虽然Avatica尝试隐式处理所有这些边缘情况，但这并不总是可行或可取的。添加新的测试用例就像在TCK模块中编写一个JUnit测试用例一样简单，但目前没有自动化来验证测试用例是否作为Maven构建的一部分。

要了解更多关于运行此TCK的信息，包括运行TCK的具体说明，请参阅提供的README文件。

# 参考资料

https://calcite.apache.org/avatica/docs/compatibility.html

* any list
{:toc}