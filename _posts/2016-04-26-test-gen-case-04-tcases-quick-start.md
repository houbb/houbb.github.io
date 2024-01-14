---
layout: post
title: test-04-test case generate 测试用例生成 tcases 快速开始
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [junit, test, generate]
published: true
---

# 拓展阅读

> [junit5 系列](https://houbb.github.io/2018/06/24/junit5-01-hello)

> [基于 junit5 实现 junitperf 源码分析](https://houbb.github.io/2021/07/23/junit-performance-junit5)

[Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)

[自动生成测试用例](https://github.com/houbb/evosuite-learn)

## 入门指南 ##

### 关于本指南 ###

本指南详细解释了Tcases的工作原理。在涉及示例时，本指南展示了在使用Tcases作为 shell 命令运行时如何操作。如果你使用 [Tcases Maven
Plugin](http://www.cornutum.org/tcases/docs/tcases-maven-plugin/index.html) 运行 Tcases，命令行细节会略有不同，但所有概念都保持不变。

### 安装 Tcases Maven 插件 ###

要获取 Tcases Maven 插件的依赖信息，请访问
插件的[文档站点](http://www.cornutum.org/tcases/docs/tcases-maven-plugin/dependency-info.html)。

### 安装 Tcases 发行版 ###

要获取 Tcases 的命令行版本，请从 Maven Central Repository 下载 Tcases 二进制分发文件，使用以下步骤。

  1. 访问 [Central Repository 页面](https://central.sonatype.com/artifact/org.cornutum.tcases/tcases-shell/4.0.1/versions) 的 `tcases-shell`。
  1. 找到最新版本的条目并点击“浏览”。
  1. 要下载分发的 ZIP 文件，请点击“tcases-shell-_${version}_.zip”。如果你更喜欢压缩的 TAR 文件，请点击“tcases-shell-_${version}_.tar.gz”。

将分发文件的内容解压到任何你喜欢的目录 —— 这现在是你的 _"Tcases 主目录"_。解压分发文件将创建一个 _"Tcases 发布目录"_ —— 一个形式为 `tcases-`_m_._n_._r_ 的子目录，其中包含此版本 Tcases 的所有文件。发布目录包含以下子目录。

  * `bin`: 用于运行 Tcases 的可执行 shell 脚本
  * `docs`: 用户指南、示例和 Javadoc 
  * `lib`: 运行 Tcases 所需的所有 JAR 文件

还有一步，你就可以开始了：将 `bin` 子目录的路径添加到你系统的 `PATH` 环境变量中。

### JSON？还是 XML？ ###

所有 Tcases 文档的首选形式是 JSON，它能够表达所有 Tcases 的特性，并且在本指南的所有示例中都使用 JSON。

但 Tcases 的原始版本使用 XML 作为所有文档的格式，对于较旧的文档，仍然支持 XML。你可以在[本指南的原始版本](http://www.cornutum.org/tcases/docs/Tcases-Guide.htm)中找到有关使用 XML 的所有详细信息，包括[如何将现有的 XML 项目转换为 JSON](http://www.cornutum.org/tcases/docs/Tcases-Guide.htm#json)。

### 从命令行运行 ###

你可以直接从 shell 命令行运行 Tcases。如果你使用 `bash` 或类似的 UNIX shell，可以运行 `tcases` 命令。或者，如果你使用 Windows 命令行，你可以使用 `tcases.bat` 命令文件以完全相同的语法运行 Tcases。

例如，为了快速检查，你可以运行 Tcases 自带的一个示例，使用以下命令。

```bash
cd ${tcases-release-dir}
cd docs/examples/json 
tcases < find-Input.json 
```

关于 `tcases` 命令（以及 `tcases.bat` 命令）的接口的详细信息，请参阅
[`TcasesCommand.Options`](http://www.cornutum.org/tcases/docs/api/org/cornutum/tcases/TcasesCommand.Options.html) 类的 Javadoc。要在命令行上获得帮助，请运行 `tcases -help`。

### 理解 Tcases 的结果 ###

运行 Tcases 时会发生什么？Tcases 读取一个[系统输入定义](#defining-system-functions)，这是一个定义要测试的系统函数的 "输入空间" 的文档。从这个文档中，Tcases 生成一个称为 _系统测试定义_ 的不同文档，它描述了一组测试用例。

尝试在其中一个示例系统输入定义上运行 Tcases。以下命令将为 `find` 命令的[示例](#an-example-the-find-command)生成测试用例，稍后在本指南中[详细说明](#modeling-the-input-space)。

```bash
cd ${tcases-release-dir}
cd docs/examples/json 
tcases < find-Input.json 
```

生成的系统测试定义将写入标准输出。它看起来像这样：对于 `find` [函数](#defining-system-functions)，一个测试用例定义列表，其中每个定义都为函数的所有[变量](#defining-input-variables)定义了值。

```json
{
  "system": "Examples",
  "find": {
    "testCases": [
      {
        "id": 0,
        "name": "pattern='empty'",
        "has": {
          "properties": "fileExists,fileName,patternEmpty"
        },
        "arg": {
          "pattern": {
            "value": "",
            "source": "empty"
          },
          "fileName": {
            "value": "defined"
          }
        },
        "env": {
          "file.exists": {
            "value": true
          },
          "file.contents.linesLongerThanPattern": {
            "NA": true
          },
          "file.contents.patternMatches": {
            "NA": true
          },
          "file.contents.patternsInLine": {
            "NA": true
          }
        }
      },
      ...
    ]
  }
}
```

### 故障排除常见问题 ###

遇到问题了吗？请查看[故障排除FAQ](./Troubleshooting-FAQs.md#troubleshooting-faqs)以获取帮助。

## 对输入空间进行建模 ##

Tcases根据您创建的 _系统输入定义_ 创建测试定义。但是，您如何做到这一点呢？这就是本节的目的。

系统输入定义是对被测系统（SUT）的 "输入空间" 进行建模的文档。我们说它 "建模" 系统输入，因为它并不是字面上列举所有可能的输入值。相反，系统输入定义列出了影响系统结果的系统输入的所有重要方面。可以将其视为描述系统 "输入空间" 中 "变化维度" 的方式。某些变化维度是显而易见的。如果您正在测试 `add` 函数，您知道至少有两个变化维度 —— 被相加的两个不同数字。但是要找到所有关键维度，您可能需要更深入地查看。

例如，考虑如何测试一个简单的 "列出文件" 命令，例如 `UNIX` 中的 `ls` 命令。（为了保持简单，假设没有要担心的命令选项或开关。）显然，变化维度之一是给定的文件名数量。`ls` 应该处理不仅一个文件名，还有许多文件名的列表。如果没有给出文件名，`ls` 预计会产生完全不同的结果。但是每个文件名本身呢？`ls` 将根据名称标识的是简单文件还是目录而产生不同的结果。因此，文件名的类型是一个额外的变化维度。但还不止于此！某些文件名可能标识实际文件，但其他文件名可能是不存在的文件的虚假名称，这种差异会对 `ls` 预计要执行的操作产生重大影响。因此，这是另一个变化维度，与文件名本身无关，而是涉及 `ls` 运行的环境状态。

您可以看到，对输入空间进行建模需要对SUT进行仔细的思考。这是没有任何工具可以为您完成的工作。但是，Tcases为您提供了一种捕捉这种知识并将其转化为有效测试用例的方法。


# 参考资料

* any list
{:toc}