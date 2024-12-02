---
layout: post
title:  test plateform-00-测试平台设计蓝图规划
date:  2016-04-27 14:10:52 +0800
categories: [Test]
tags: [plateform, system-design, DevOps, test]
published: true
---

# 前言

大家好，我是老马。

最近想设计实现一个测试平台，基本的拼图已经收集的差不多了。

后续就是一步步来落地实践了！

# 设计蓝图

![整体设计](https://gitee.com/houbinbin/imgbed/raw/master/img/%E6%B5%8B%E8%AF%95%E5%B9%B3%E5%8F%B0.png)

# 技术生态

![技术生态](https://gitee.com/houbinbin/imgbed/raw/master/img/UMS%EF%BC%88%E7%94%A8%E6%88%B7%E7%AE%A1%E7%90%86%EF%BC%89.png)

# 测试开源组件

[data-factory: Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[junitperf: Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 测试专题系列

## 单元测试

[test-00-测试知识系统学习，如何设计一个测试框架?](https://houbb.github.io/2016/04/26/test-00-overview)

[test-01-java 单元测试框架 junit 入门介绍](https://houbb.github.io/2016/04/26/test-01-junit-framework)

[test-02-java 单元测试框架 junit5 入门介绍](https://houbb.github.io/2016/04/26/test-02-junit5-framework)

[test-03-java 单元测试框架 testNG 入门介绍](https://houbb.github.io/2016/04/26/test-03-testng-framework)

[junit5 系列](https://houbb.github.io/2018/06/24/junit5-01-hello)

[基于 junit5 实现 junitperf 源码分析](https://houbb.github.io/2021/07/23/junit-performance-junit5)

[Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)

## 断言

[test assert-00-单元测试中的断言](https://houbb.github.io/2016/04/26/test-assert-00-overview)

[test assert-01-Google Truth 断言](https://houbb.github.io/2016/04/26/test-assert-01-google-truth)

[test assert-02-power-assert-js 断言](https://houbb.github.io/2016/04/26/test-assert-02-power-assert-js)

[test assert-03-assertj AssertJ - Fluent Assertions for Java 断言](https://houbb.github.io/2016/04/26/test-assert-03-assertj)

[test assert-04-Java (and original) version of Hamcrest 断言](https://houbb.github.io/2016/04/26/test-assert-04-harmcrest)

## 测试用例生成

[test-01-test case generate 单元测试用例代码生成](https://houbb.github.io/2016/04/26/test-gen-case-01-overview)

[test-02-test case generate 测试用例生成 EvoSuite 介绍](https://houbb.github.io/2016/04/26/test-gen-case-02-EvoSuite-intro)

[test-03-test case generate 测试用例生成 Randoop 介绍](https://houbb.github.io/2016/04/26/test-gen-case-03-randoop-intro)

[test-03-test case generate 测试用例生成 Randoop 快速开始入门例子](https://houbb.github.io/2016/04/26/test-gen-case-03-randoop-quick-start)

[test-04-test case generate 测试用例生成 tcases A model-based test case generator](https://houbb.github.io/2016/04/26/test-gen-case-04-tcases-intro)

[test-04-test case generate 测试用例生成 tcases 快速开始](https://houbb.github.io/2016/04/26/test-gen-case-04-tcases-quick-start)

## MOCK

[test mock-01-什么是 mock? Mockito/EasyMock/PowerMock/JMockit/Spock mock 框架对比](https://houbb.github.io/2016/04/26/test-mock-01-overview)

[test mock-02-easymock 入门介绍](https://houbb.github.io/2016/04/26/test-mock-02-easymock)

[test mock-03-wiremock 模拟 HTTP 服务的开源工具 flexible and open source API mocking](https://houbb.github.io/2016/04/26/test-mock-03-wiremock)

[test mock-04-hoverfly Easy Creation of Stub Http Servers for Testing](https://houbb.github.io/2016/04/26/test-mock-04-hoverfly)

[test mock-05-mockserver mock-server/hoverfly/wiremock 对比](https://houbb.github.io/2016/04/26/test-mock-05-mockserver)

[test mock-06-mountebank Over the wire test doubles mock-server/hoverfly/wiremock/mountbank 对比表格](https://houbb.github.io/2016/04/26/test-mock-06-mountebank)

## 测试混沌工程

[ChaosBlade-01-测试混沌工程平台整体介绍](https://houbb.github.io/2023/08/08/jvm-chaosblade-01-overview)

[ChaosBlade-02-Chaosblade-box：一个具有丰富场景的混沌工程平台](https://houbb.github.io/2023/08/08/jvm-chaosblade-02-chaosblade-box-intro)

[ChaosBlade-03-Chaosblade-exec-jvm 对 Java 应用实施混沌实验的 chaosblade 执行器](https://houbb.github.io/2023/08/08/jvm-chaosblade-03-chaosblade-exec-jvm-intro)

[ChaosBlade-04-Chaosblade chat 聊一聊 Chaosblade](https://houbb.github.io/2023/08/08/jvm-chaosblade-04-chaosblade-chat)

[ChaosBlade-05-混沌工程（Chaos Engineering）介绍](https://houbb.github.io/2023/08/08/jvm-chaosblade-05-chaos-enginnering-intro)

[ChaosBlade-06-混沌工程准则 PRINCIPLES OF CHAOS ENGINEERING POC](https://houbb.github.io/2023/08/08/jvm-chaosblade-06-chaos-principle)

[ChaosBlade-07-混沌工程开源工具 Chaos Monkey](https://houbb.github.io/2023/08/08/jvm-chaosblade-07-chaos-tool-chaos-monkey)

[ChaosBlade-08-混沌工程开源工具 Chaos Monkey for Spring Boot](https://houbb.github.io/2023/08/08/jvm-chaosblade-08-chaos-tool-chaos-monkey-for-sb)

[ChaosBlade-09-混沌工程有哪些成功的应用？](https://houbb.github.io/2023/08/08/jvm-chaosblade-09-usage)

## ui 测试

[test ui-01-UI 页面测试概览 overview](https://houbb.github.io/2016/04/26/test-ui-00-overview)

[test ui-01-UI 测试组件之 Selenium 入门介绍](https://houbb.github.io/2016/04/26/test-ui-01-Selenium)

[test ui-02-UI 测试组件之 Appium 入门介绍](https://houbb.github.io/2016/04/26/test-ui-02-appium)

[test ui-03-cypress 入门介绍](https://houbb.github.io/2016/04/26/test-ui-03-cypress)

[test ui-04-testcomplete 入门介绍](https://houbb.github.io/2016/04/26/test-ui-04-testcomplete)

## 性能测试

[test perf-01-性能测试之 JMeter](https://houbb.github.io/2016/04/26/test-perf-01-jmeter)

[test perf-02-性能测试之 LoadRunner](https://houbb.github.io/2016/04/26/test-perf-02-loadrunner)

[test perf-03-性能测试之 Gatling](https://houbb.github.io/2016/04/26/test-perf-03-gatling)

[test perf-04-性能测试之 locust](https://houbb.github.io/2016/04/26/test-perf-04-locust-io)


# 参考资料

* any list
{:toc}