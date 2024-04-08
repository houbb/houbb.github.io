---
layout: post
title: 规则引擎-05-liteflow
date:  2020-5-26 16:05:35 +0800
categories: [Engine]
tags: [design, rule-engine, sf] 
published: true
---

## 🌈概述

LiteFlow是一个轻量且强大的国产规则引擎框架，可用于复杂的组件化业务的编排领域，独有的DSL规则驱动整个复杂业务，并可实现平滑刷新热部署，支持多种脚本语言规则的嵌入。帮助系统变得更加丝滑且灵活。

LiteFlow于2020年正式开源，2021年获得开源中国年度最受欢迎开源软件殊荣。

于2022年获得Gitee最有价值开源项目(GVP)荣誉。是一个正处在高速发展中的开源项目。

LiteFlow是一个由社区驱动的项目，我们非常重视社区建设，拥有一个4000多人的使用者社区，在使用中碰到任何问题或者建议都可以在社区中反应。

你在官网中可以找到加入社区的方式！

## 官网链接：[点这里进入官网](https://liteflow.cc/)

## 文档链接：[点这里进入文档进行学习](https://liteflow.cc/pages/5816c5/)

## 示例工程：[DEMO1](https://github.com/bryan31/message-demo) | [DEMO2](https://gitee.com/bryan31/liteflow-example)

## 🍬特性

* **组件定义统一：** 所有的逻辑都是组件，为所有的逻辑提供统一化的组件实现方式，小身材，大能量。

* **规则轻量：** 基于规则文件来编排流程，学习规则入门只需要5分钟，一看既懂。

* **规则多样化：** 规则支持xml、json、yml三种规则文件写法方式，喜欢哪种用哪个。

* **任意编排：** 再复杂的逻辑过程，利用LiteFlow的规则，都是很容易做到的，看规则文件就能知道逻辑是如何运转的。

* **规则持久化：** 框架原生支持把规则存储在标准结构化数据库，Nacos，Etcd，Zookeeper，Apollo，redis。您也可以自己扩展，把规则存储在任何地方。

* **优雅热刷新机制：** 规则变化，无需重启您的应用，即时改变应用的规则。高并发下不会因为刷新规则导致正在执行的规则有任何错乱。

* **支持广泛：** 不管你的项目是不是基于Springboot，Spring还是任何其他java框架构建，LiteFlow都能游刃有余。

* **JDK支持：** 从JDK8到JDK17，全部支持。无需担心JDK版本。

* **Springboot支持全面：** 支持Springboot 2.X到最新的Springboot 3.X。

* **脚本语言支持：** 可以定义脚本语言节点，支持Groovy，Javascript，QLExpress，Python，Lua，Aviator，Java。未来还会支持更多的脚本语言。

* **脚本和Java全打通：** 所有脚本语言均可调用Java方法，甚至于可以引用任意的实例，在脚本中调用RPC也是支持的。

* **规则嵌套支持：** 只要你想的出，你可以利用简单的表达式完成多重嵌套的复杂逻辑编排。

* **组件重试支持：** 组件可以支持重试，每个组件均可自定义重试配置和指定异常。

* **上下文隔离机制：** 可靠的上下文隔离机制，你无需担心高并发情况下的数据串流。

* **声明式组件支持：** 你可以让你的任意类秒变组件。

* **详细的步骤信息：** 你的链路如何执行的，每个组件耗时多少，报了什么错，一目了然。

* **稳定可靠：** 历时2年多的迭代，在各大公司的核心系统上稳定运行。

* **性能卓越：** 框架本身几乎不消耗额外性能，性能取决你的组件执行效率。

* **自带简单监控：** 框架内自带一个命令行的监控，能够知道每个组件的运行耗时排行。


## ☘️什么场景适用

LiteFlow是一款编排式的规则引擎，最擅长去解耦你的系统，如果你的系统业务复杂，并且代码臃肿不堪，那LiteFlow框架会是一个非常好的解决方案。

LiteFlow利用规则表达式为驱动引擎，去驱动你定义的组件。

你有想过类似以下的多线程流程编排该如何写吗？

这一切利用LiteFlow轻而易举！框架的表达式语言学习门槛很低，但是却可以完成超高复杂度的编排。

LiteFlow拥有极其详细易懂的文档体系，能帮助你解决在使用框架的时候95%以上的问题。

目前为止，LiteFlow拥有1500多个测试用例，并且不断在增加中。完备的文档+覆盖全面的测试用例保障了LiteFlow框架的稳定性！

# LiteFlow不适用于哪些场景

LiteFlow自开源来，经常有一些小伙伴来问我，如何做角色任务之间的流转，类似于审批流，A审批完应该是B审批，然后再流转到C角色。

这里申明下，LiteFlow只做基于逻辑的流转，而不做基于角色任务的流转。

如果你想做基于角色任务的流转，推荐使用 [flowable](https://flowable.com/open-source/)，[activiti](https://www.activiti.org/) 这2个框架。


# 入门例子

虽说Springboot/Spring已经成为了Java项目中的标配，但是为了照顾到启用其他框架的小伙伴（其更重要的原因是强耦合Spring我始终觉得是瑕疵，有点代码洁癖），现在在非Spring体系的环境中也能使用LiteFlow框架带来的便捷和高效。

LiteFlow文档中提到的98%以上的特性功能都能在非Spring体系中生效。

其中不生效的特性和功能有：

- ruleSource的模糊路径匹配特性在非Spring体系下不生效

- LiteflowComponent在非Spring体系下无法使用

- 监控功能在非Spring体系中无法使用

## maven 依赖

```xml
<dependency>
	<groupId>com.yomahub</groupId>
    <artifactId>liteflow-core</artifactId>
	<version>2.11.4.2</version>
</dependency>
```

## 定义你的组件

你需要定义并实现一些组件。

```java
public class ACmp extends NodeComponent {

    @Override
    public void process() {
        //do your business
    }
}
```

再分别定义b,c组件：

```java
public class BCmp extends NodeComponent {

	@Override
	public void process() {
		//do your business
	}
}

public class CCmp extends NodeComponent {

	@Override
	public void process() {
		//do your business
	}
}
```

## 规则文件的配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<flow>
	<nodes>
		<node id="a" class="com.yomahub.liteflow.test.component.AComponent"/>
		<node id="b" class="com.yomahub.liteflow.test.component.BComponent"/>
		<node id="c" class="com.yomahub.liteflow.test.component.CComponent"/>
	</nodes>
	
	<chain name="chain1">
		THEN(a, b, c);
	</chain>
</flow>
```

## 初始化你的FlowExecutor执行器

通过以下代码你可以轻易的初始化FlowExecutor处理器：

```java
LiteflowConfig config = new LiteflowConfig();
config.setRuleSource("config/flow.el.xml");
FlowExecutor flowExecutor = FlowExecutorHolder.loadInstance(config);
```

提示

要注意的是，不建议每次执行流程都去初始化FlowExecutor，这个对象的初始化工作相对比较重，全局只需要初始化一次就好了。建议在项目启动时初始化或者第一次执行的时候初始化。

## 用FlowExecutor执行

```java
LiteflowResponse response = flowExecutor.execute2Resp("chain1", "arg");
```

提示

这个DefaultContext是默认的上下文，用户可以用最自己的任意Bean当做上下文传入，如果需要传入自己的上下文，则需要传用户Bean的Class属性，具体请看数据上下文这一章节。

# 参考资料

https://github.com/dromara/liteflow/blob/master/README.zh-CN.md

* any list
{:toc}