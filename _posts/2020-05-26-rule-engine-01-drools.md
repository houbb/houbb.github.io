---
layout: post
title: 规则引擎-01-drools 框架入门
date:  2020-5-26 16:05:35 +0800
categories: [Engine]
tags: [design, rule-engine, sf]
published: true
---

# Drools

[Drools](http://www.drools.org) 是一个针对 Java 的规则引擎、DMN 引擎和复杂事件处理（CEP）引擎。

适用于Java™和JVM平台的开源规则引擎，DMN引擎和复杂事件处理（CEP）引擎。

Drools是一个业务规则管理系统，具有基于前向链接和后向链接推理的规则引擎，可以快速，可靠地评估业务规则和进行复杂的事件处理。 

规则引擎还是创建专家系统的基本构建块，在人工智能中，该专家系统是模拟人类专家的决策能力的计算机系统。

[英文文档](https://drools.org/learn/documentation.html)

[中文文档](http://www.drools.org.cn/category/use)

# Drools 介绍

Drools 是一个基于Charles Forgy's的RETE算法的，易于访问企业策略、易于调整以及易于管理的开源业务规则引擎，符合业内标准，速度快、效率高。

业务分析师人员或审核人员可以利用它轻松查看业务规则，从而检验是否已编码的规则执行了所需的业务规则。

Drools 是用Java语言编写的开放源码规则引擎，使用Rete算法对所编写的规则求值。

Drools允许使用声明方式表达业务逻辑。可以使用非XML的本地语言编写规则，从而便于学习和理解。

并且，还可以将Java代码直接嵌入到规则文件中，这令Drools的学习更加吸引人。

## Drools优点：

- 非常活跃的社区支持

- 易用

- 快速的执行速度

- 在 Java 开发人员中流行

- 与 Java Rule Engine API（JSR 94）兼容

## Drools相关概念：

- 事实（Fact）：对象之间及对象属性之间的关系

- 规则（rule）：是由条件和结论构成的推理语句，一般表示为if...Then。一个规则的if部分称为LHS，then部分称为RHS。

- 模式（module）：就是指IF语句的条件。这里IF条件可能是有几个更小的条件组成的大条件。模式就是指的不能在继续分割下去的最小的原子条件。

Drools通过事实、规则和模式相互组合来完成工作，drools在开源规则引擎中使用率最广，但是在国内企业使用偏少，保险、支付行业使用稍多。

# 入门案例

drools有专门的规则语法drl，就是专门描述活动的规则是如何执行的，按照小明的需求规则如下：

## drl 

Point-rules.drl 文件内容

```drl
package rules

import com.neo.drools.entity.Order

rule "zero"
    no-loop true
    lock-on-active true
    salience 1
    when
        $s : Order(amout <= 100)
    then
        $s.setScore(0);
        update($s);
end

rule "add100"
    no-loop true
    lock-on-active true
    salience 1
    when
        $s : Order(amout > 100 && amout <= 500)
    then
        $s.setScore(100);
        update($s);
end

rule "add500"
    no-loop true
    lock-on-active true
    salience 1
    when
        $s : Order(amout > 500 && amout <= 1000)
    then
        $s.setScore(500);
        update($s);
end

rule "add1000"
    no-loop true
    lock-on-active true
    salience 1
    when
        $s : Order(amout > 1000)
    then
        $s.setScore(1000);
        update($s);
end    
```

package 与Java语言类似，drl的头部需要有package和import的声明,package不必和物理路径一致。

import 导出java Bean的完整路径，也可以将Java静态方法导入调用。

rule 规则名称，需要保持唯一,可以无限次执行。

no-loop 定义当前的规则是否不允许多次循环执行,默认是 false,也就是当前的规则只要满足条件,可以无限次执行。

lock-on-active 将lock-on-active属性的值设置为true,可避免因某些Fact对象被修改而使已经执行过的规则再次被激活执行。

salience 用来设置规则执行的优先级,salience 属性的值是一个数字,数字越大执行优先级越高, 同时它的值可以是一个负数。默认情况下,规则的 salience 默认值为 
0。如果不设置规则的 salience 属性,那么执行顺序是随机的。

when 条件语句，就是当到达什么条件的时候

then 根据条件的结果，来执行什么动作

end 规则结束

这个规则文件就是描述了，当符合什么条件的时候，应该去做什么事情，每当规则有变动的时候，我们只需要修改规则文件，然后重新加载即可生效。

## kmodule.xml

这里需要有一个配置文件告诉代码规则文件drl在哪里，在drools中这个文件就是kmodule.xml，放置到resources/META-INF目录下。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<kmodule xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://www.drools.org/xsd/kmodule">

    <kbase name="point-rulesKB" packages="rules">
        <ksession name="point-rulesKS"/>
    </kbase>

</kmodule>
```

以下对配置说明进行简单说明：

Kmodule 中可以包含一个到多个 kbase,分别对应 drl 的规则文件。

Kbase 需要一个唯一的 name,可以取任意字符串。

packages 为drl文件所在resource目录下的路径。注意区分drl文件中的package与此处的package不一定相同。多个包用逗号分隔。默认情况下会扫描 resources目录下
所有(包含子目录)规则文件。

kbase的default属性,标示当前KieBase是不是默认的,如果是默认的则不用名称就可以查找到该 KieBase,但每个 module 最多只能有一个默认 KieBase。

kbase 下面可以有一个或多个 ksession, ksession 的 name 属性必须设置,且必须唯一。

## 代码端

```java
public static final void main(final String[] args) throws Exception{
    KieServices ks = KieServices.Factory.get();
    KieContainer kc = ks.getKieClasspathContainer();
    execute( kc );
}

public static void execute( KieContainer kc ) throws Exception{
    KieSession ksession = kc.newKieSession("point-rulesKS");
    List<Order> orderList = getInitData();
    for (int i = 0; i < orderList.size(); i++) {
        Order o = orderList.get(i);
        ksession.insert(o);
        ksession.fireAllRules();
        addScore(o);
    }
    ksession.dispose();
}
```

代码解释：首先通过请求获取 KieServices，通过KieServices获取KieContainer，KieContainer加载规则文件并获取KieSession，KieSession来执行规则引擎，KieSession是一个轻量级组建，每次执行完销毁。

KieContainer是重量级组建可以考虑复用。

# 拓展阅读

[drools](https://github.com/kiegroup/drools)

[QLExpress 系列](https://houbb.github.io/2018/06/10/qlexpress-01-quick-start)

ILog、Jess、JBoss Rules

# 参考资料

[Drools 规则文件语法概述](https://www.jianshu.com/p/ae9a62588da4)

[小明的烦恼](https://www.cnblogs.com/ityouknow/archive/2017/08/07/7297524.html)

[开源规则流引擎实践](https://www.ibm.com/developerworks/cn/opensource/os-drools/index.html)

[Drools 规则引擎详解（一）](https://blog.csdn.net/hc_ttxs/article/details/85248696)

[Drools 规则引擎接入详解](https://blog.csdn.net/wmq880204/article/details/96649361)

[Drools规则引擎 系列教程（三）Drools规则语法 & RHS动作 & header详解](https://www.jianshu.com/p/6917dbee3a33)

* any list
{:toc}