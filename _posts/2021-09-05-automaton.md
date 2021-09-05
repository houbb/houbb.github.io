---
layout: post
title: dk.brics.automaton
date: 2021-09-05 21:01:55 +0800
categories: [java]
tags: [java, regex, sh]
published: true
---

# dk.brics.automaton

这个 Java 包包含一个带有 Unicode 字母表 (UTF16) 的 DFA/NFA（有限状态自动机）实现，并支持标准正则表达式操作（连接、联合、Kleene 星）和许多非标准操作（交集、补集、 等等。）

与许多其他自动机/regexp 包相比，这个包快速、紧凑，并实现了真正的、不受限制的常规操作。 

它使用基于 Unicode 字符间隔的符号表示。

完整的源代码和文档在 BSD 许可下可用。

最新版本 1.12-3 于 2021 年 8 月 11 日发布。 (ChangeLog)

dk.brics.automaton 包由奥胡斯大学的 Anders Møller 开发，其中包括来自 Alexandar Bakic、Jodi Moran、Brandon Lee、David Lutterkort、John Gibson、Alex Meyer、Daniel Lowe、Harald Zauner、Dawid Weiss 的贡献、建议和错误报告 、罗伯特·缪尔、汉斯-马丁·阿多夫、戴尔·理查森、雅尼克·弗斯利、古斯塔夫·伦德、维克多·贝切特、阿斯特丽德·穆里尔·温贾·尤南、瓦伦丁·维斯托尔茨、西蒙·格雷格森和刘易斯·约翰·麦吉布尼。


# 经常问的问题

这个包是否使用与 Perl 或 java.util.regex 相同类型的“正则表达式”？

不。这个包使用确定性有限状态自动机 (DFA)，与大多数其他基于非确定性自动机 (NFA) 的正则表达式包不同。这意味着：

这里使用的“正则表达式”的概念完全具有古老的正则语言的表达能力。

这个包支持诸如补码（~运算符）和交集（& 运算符）之类的操作。

`*` 运算符在数学上是 Kleene 星形运算符（即我们没有贪婪/不情愿/占有变体）。

模式匹配的时间是最佳的：一旦将正则表达式转换为自动机，检查它是否与表达式匹配的字符串长度需要线性时间 - 与表达式的复杂性无关。 （基于 NFA 的包使用回溯。）

不支持捕获组。

某些符号，例如 ^ 和 $，可能意味着超出您预期的其他含义。

你能举一个使用包做简单模式匹配的例子吗？

这是一个非常简单的示例，可以帮助您入门：

```java
RegExp r = new RegExp("ab(c|d)*");
Automaton a = r.toAutomaton();
String s = "abcccdc";
System.out.println("Match: " + a.run(s)); // prints: true
```

这个包支持的正则表达式语法的描述在哪里？

     在 javadoc 中查找 RegExp 类。 请注意，这可能与您习惯的语法不完全相同！

如何使用此包进行真正快速的模式匹配？

     将您的自动机转换为 RunAutomaton。

如何在我的正则表达式中使用预构建的自动机，如 `<URI>`？

     使用 x.toAutomaton(new DatatypesAutomatonProvider()) 将表达式 x 转换为自动机。 这是预先构建的自动机的列表。

如何在出版物中引用 dk.brics.automaton？

     使用此 BibTeX 条目。

为什么 [...] 没有自动机操作？

     因为目前还没有这个需求。

我如何报告错误或提出改进建议？

     请使用 github 问题跟踪器，或发送电子邮件至 amoeller@cs.au.dk。


# 参考资料

https://www.brics.dk/automaton/

* any list
{:toc}