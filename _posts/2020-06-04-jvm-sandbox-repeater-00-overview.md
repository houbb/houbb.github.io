---
layout: post
title: jvm-sandbox-repeater-00-overview 入门介绍
date:  2020-6-4 13:34:28 +0800
categories: [Jvm]
tags: [jvm, sandbox, aop, sh]
published: true
---

# 基于JVM-Sandbox的录制/回放通用解决方案

jvm-sandbox-repeater是JVM-Sandbox生态体系下的重要模块，它具备了JVM-Sandbox的所有特点，插件式设计便于快速适配各种中间件，封装请求录制/回放基础协议，也提供了通用可扩展的各种丰富API。

## 目标人群 - 面向测试开发工程师

- 线上有个用户请求一直不成功，我想在测试环境Debug一下，能帮我复现一下吗？

- 压测流量不知道怎么构造，数据结构太复杂，压测模型也难以评估，有什么好的办法吗？

- 不想写接口测试脚本了，我想做一个流量录制系统，把线上用户场景做业务回归，可能会接入很多服务系统，不想让每个系统都进行改造，有好的框架选择吗？

- 我想做一个业务监控系统，对线上核心接口采样之后做一些业务校验，实时监控业务正确性。

如果你有以上的想法或需求，jvm-sandbox-repeater 都将是你的不二选择方案；框架基于JVM-Sandbox，拥有JVM-Sandbox的一切特性，同时封装了以下能力：

- 录制/回放基础协议，可快速配置/编码实现一类中间件的录制/回放

- 开放数据上报，对于录制结果可上报到自己的服务端，进行监控、回归、问题排查等上层平台搭建

# 项目简介

## repeater 的核心能力是什么？

1. 通用录制/回放能力

无侵入式录制HTTP/Java/Dubbo入参/返回值录制能力（业务系统无感知）

基于TTL提供多线程子调用追踪，完整追踪一次请求的调用路径

入口请求（HTTP/Dubbo/Java）流量回放、子调用（Java/Dubbo）返回值Mock能力

2. 快速可扩展API实现

录制/回放插件式架构

提供标准接口，可通过配置/简单编码实现一类通用插件

3. standalone工作模式

无需依赖任何服务端/存储，可以单机工作，提供录制/回放能力

## repeater 的可以应用到哪些场景？

1. 业务快速回归

基于线上流量的录制/回放，无需人肉准备自动化测试脚本、准备测试数据

2. 线上问题排查

录制回放提供"昨日重现"能力，还原线上真实场景到线下做问题排查和Debug

动态方法入参/返回值录制，提供线上快速问题定位

3. 压测流量准备

0成本录制HTTP/Dubbo等入口流量，作为压测流量模型进行压测

4. 实时业务监控

动态业务监控，基于核心接口数据录制回流到平台，对接口返回数据正确性进行校验和监控

# 核心原理

## 流量录制

对于Java调用，一次流量录制包括一次入口调用(entranceInvocation)（eg：HTTP/Dubbo/Java）和若干次子调用(subInvocations)。

流量的录制过程就是把入口调用和子调用绑定成一次完整的记录，框架抽象了基础录制协议，调用的组装由调用插件(InvokePlugin)来完成，需要考虑解决的核心问题：

- 快速开发和适配新插件

- 绑定入口调用和子调用（解决多线程上下文传递问题）

- invocation唯一定位，保障回放时精确匹配

- 自定义流量采样、过滤、发送、存储

框架的核心逻辑录制协议基于JVM-Sandbox的BEFORE、RETRUN、THROW事件机制进行录制流程控制，详见DefaultEventListener：

基于TTL解决跨线程上下文传递问题，开启RepeaterConfig.useTtl之后支持多线程子调用录制

开放插件定义enhance埋点/自定义调用组装方式快速实现插件适配

Invocation抽象Identity统一定位由插件自己扩展实现

基于Tracer实现应用内链路追踪、采样；同时支持多种过滤方式，插件可自由扩展；

```java
public void onEvent(Event event) throws Throwable {
    try {
        /*
         * event过滤；针对单个listener，只处理top的事件
         */
        /** -------- **/
        /*
         * 初始化Tracer开启上下文追踪[基于TTL，支持多线程上下文传递]
         */
        /** -------- **/
        /*
         * 执行基础过滤
         */
        /** -------- **/
        /*
         * 执行采样计算
         */
        /** -------- **/
        /*
         * processor filter
         */
        /** -------- **/
        /*
         * 分发事件处理
         */
    } catch (ProcessControlException pe) {
        /*
         * sandbox流程干预
         */
    } catch (Throwable throwable) {
    	 /*
    	  * 统计异常
    	  */
    } finally {
        /*
         * 清理上下文
         */
    }
}
```

## 流量回放

流量回放，获取录制流量的入口调用入参，再次发起调用。

注意：读接口或者幂等写接口可以直接回放，否则在生产环境请谨慎使用，可能会造成脏数据；用户可自行选择mock回放或者非mock，回放过程要解决的核心问题：

- 多种入口(HTTP/Dubbo/Java)的回放发起

- 自定义回放流量数据来源、回放结果的上报

- 自定义mock/非mock回放、回放策略

- 开放回放流程关键节点hook

回放过程通过异步EventBus方式订阅回放请求；基于FlowDispather进行回放流量分发，每个类型回放插件实现RepeaterSPI完成回放请求发起；每次回放请求可决定本地回放是否mock，插件也自由实现mock逻辑，mock流程代码

mock回放：回放流量子调用（eg:mybatis/dubbo)不发生真实调用，从录制子调用中根据 MockStrategy 搜索匹配的子调用，利用JVM-Sandbox的流程干预能力，有匹配结果，进行throwReturnImmediately返回，没有匹配结果则抛出异常阻断流程，避免重复调用污染数据

```java
public void doMock(BeforeEvent event, Boolean entrance, InvokeType type) throws ProcessControlException {
    /*
     * 获取回放上下文
     */
    RepeatContext context = RepeatCache.getRepeatContext(Tracer.getTraceId());
    /*
     * mock执行条件
     */
    if (!skipMock(event, entrance, context) && context != null && context.getMeta().isMock()) {
        try {
            /*
             * 构建mock请求
             */
            final MockRequest request = MockRequest.builder()
                    ...
                    .build();
            /*
             * 执行mock动作
             */
            final MockResponse mr = StrategyProvider.instance().provide(context.getMeta().getStrategyType()).execute(request);
            /*
             * 处理策略推荐结果
             */
            switch (mr.action) {
  					...
            }
        } catch (ProcessControlException pce) {
            throw pce;
        } catch (Throwable throwable) {
            ProcessControlException.throwThrowsImmediately(new RepeatException("unexpected code snippet here.", throwable));
        }
    }
}
```

# 参考资料

https://github.com/alibaba/jvm-sandbox-repeater

* any list
{:toc}