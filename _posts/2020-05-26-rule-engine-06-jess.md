---
layout: post
title: 规则引擎-06-jess 程序设计语言 商业
date:  2020-5-26 16:05:35 +0800
categories: [Engine]
tags: [design, rule-engine, sf] 
published: true
---

# jess

Jess是Java平台上的规则引擎，它是CLIPS程序设计语言的超集，由桑迪亚国家实验室的Ernest Friedman-Hill开发。

它的第一个版本写于1995年晚期。

Jess提供适合自动化专家系统的逻辑编程，它常被称作“专家系统外壳”。近年来，智能代理系统也在相似的能力上发展起来。

与一个程序中有一个只运行一次的循环的指令式编程语言不同，Jess使用的宣告式编程通过一个名为“模式匹配”的过程连续的对一个事实的集合运用一系列规则。规则可以修改事实集合，或者运行任何Java代码。

Jess可以被用来构建使用规则定义形式的知识来推倒结论和推论的Java Servlet、EJB、Applet和应用程序。因为不同的规则匹配不同的输入，所以有了一些有效的通用匹配算法。Jess规则引擎使用Rete算法。

# 代码实例

```java
(deftemplate male   "" (declare (ordered TRUE)))
(deftemplate female "" (declare (ordered TRUE)))
(deftemplate parent "" (declare (ordered TRUE)))
(deftemplate father "" (declare (ordered TRUE)))
(deftemplate mother "" (declare (ordered TRUE)))

(deffacts initialFacts
  (male bill)
  (female jane)
  (female sally)
  (parent bill sally)
  (parent jane sally)
  )

(defrule father
  (parent ?x ?y)
  (male ?x)
  =>
  (printout t crlf ?x " is the father of " ?y crlf)
  )

(defrule mother
  (parent ?x ?y)
  (female ?x)
  =>
  (printout t crlf ?x " is the mother of " ?y crlf)
  )

(reset)
(facts)
(run)

(printout t crlf)
```


# 参考资料

https://zh.wikipedia.org/wiki/Jess%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%E8%AF%AD%E8%A8%80

* any list
{:toc}