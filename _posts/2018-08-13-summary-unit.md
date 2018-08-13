---
layout: post
title:  Unit Test 
date:  2018-08-13 17:37:15 +0800
categories: [Summary]
tags: [summary, test, manager, sf]
published: true
---

# Unit

## 概念

在计算机编程中，单元测试（英语：Unit Testing）又称为模块测试, 是针对程序模块（软件设计的最小单位）来进行正确性检验的测试工作。

程序单元是应用的**最小可测试部件**。

在过程化编程中，一个单元就是单个程序、函数、过程等；对于面向对象编程，最小单元就是方法，包括基类（超类）、抽象类、或者派生类（子类）中的方法。

## 意义

1. 适应变更

2. 简化集成

3. 文档记录

4. 表达设计

# Junit

## 单元测试框架

- junit4

[junit4](https://junit.org/junit4/) is a simple framework to write repeatable tests. 

It is an instance of the xUnit architecture for unit testing frameworks.

- junit5

[junit5](https://junit.org/junit5/) The new major version of the programmer-friendly testing framework for Java 8 and beyond.

- testNG

[testNG](https://testng.org/doc/index.html)  is a testing framework inspired from JUnit and NUnit but introducing some new functionalities that make it more powerful and easier to use.


## 参数化测试

[junit5 参数化测试](https://houbb.github.io/2018/06/25/junit5-15-parameterized)

# 断言

## 断言

可用于自动校验测试结果。

## Truth

[Truth](https://github.com/google/truth) is Fluent assertions for Java.

# 测试覆盖率

## 意义

1. 分析未覆盖部分的代码，从而反推在前期测试设计是否充分，没有覆盖到的代码是否是测试设计的盲点，为什么没有考虑到？需求/设计不够清晰，测试设计的理解有误，工程方法应用后的造成的策略性放弃等等，之后进行补充测试用例设计。

2. 检测出程序中的废代码，可以逆向反推在代码设计中思维混乱点，提醒设计/开发人员理清代码逻辑关系，提升代码质量。

3. 代码覆盖率高不能说明代码质量高，但是反过来看，代码覆盖率低，代码质量不会高到哪里去，可以作为测试自我审视的重要工具之一。

## 持续集成

持续集成指的是，频繁地（一天多次）将代码集成到主干。

它的好处主要有两个。

（1）快速发现错误。每完成一点更新，就集成到主干，可以快速发现错误，定位错误也比较容易。

（2）防止分支大幅偏离主干。如果不是经常集成，主干又在不断更新，会导致以后集成的难度变大，甚至难以集成。

持续集成的目的，就是让产品可以快速迭代，同时还能保持高质量。它的核心措施是，代码集成到主干之前，必须通过自动化测试。只要有一个测试用例失败，就不能集成。

Martin Fowler说过，"持续集成并不能消除Bug，而是让它们非常容易发现和改正。"

与持续集成相关的，还有两个概念，分别是持续交付和持续部署。

## 持续交付

持续交付（Continuous delivery）指的是，频繁地将软件的新版本，交付给质量团队或者用户，以供评审。如果评审通过，代码就进入生产阶段。

持续交付可以看作持续集成的下一步。它强调的是，不管怎么更新，软件是随时随地可以交付的。

## 持续部署

持续部署（continuous deployment）是持续交付的下一步，指的是代码通过评审以后，自动部署到生产环境。

持续部署的目标是，代码在任何时刻都是可部署的，可以进入生产阶段。

持续部署的前提是能自动化完成测试、构建、部署等步骤。

# Mock

## 意义

去代替那些被测试代码所依赖的，但不可信赖东西。

## 框架

- mockito

[mockito](https://site.mockito.org/) is tasty mocking framework for unit tests in Java.

- power-mockito

[PowerMock](https://github.com/powermock/powermock/wiki/Mockito) provides a class called "PowerMockito" for creating mock/object/class 
and initiating verification, and expectations, everything else you can still use Mockito to setup and verify expectation.

- mock-server

[mock-server](http://www.mock-server.com/) can be used for mocking any system you integrate with via HTTP or HTTPS (i.e. services, web sites, etc).

When MockServer receives a requests it matches the request against active expectations that have been configured.

An expectations defines the action that is taken, for example, a response could be returned.

# 数据库

## 测试框架

- dbunit

[DbUnit](http://dbunit.sourceforge.net/)  is a JUnit extension (also usable with Ant) targeted at database-driven projects that, among other things, puts your database into a known state between test runs.

## 内存数据库

- db2

[db2](https://www.ibm.com/analytics/us/en/db2/)

# 性能

## 框架

[jmeter](https://jmeter.apache.org/) application is open source software, a 100% pure Java application designed to load test functional behavior and measure performance. 

[junitperf](https://github.com/houbb/junitperf)

# 参考资料

- 单元测试

https://zh.wikipedia.org/wiki/%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95

- assert

https://www.geeksforgeeks.org/assertions-in-java/

https://www.tutorialspoint.com/junit/junit_using_assertion.htm

https://www.zhihu.com/question/24461924

- code-coverage

https://tech.youzan.com/code-coverage/

- CI

http://www.ruanyifeng.com/blog/2015/09/continuous-integration.html


* any list
{:toc}