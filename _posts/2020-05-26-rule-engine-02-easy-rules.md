---
layout: post
title: 规则引擎-02-easy rules
date:  2020-5-26 16:05:35 +0800
categories: [Engine]
tags: [design, rule-engine, sf]
published: true
---

# easy rules

[easy rules](https://github.com/j-easy/easy-rules) 是一个受 Martin Fowler 文章《我应该使用规则引擎吗？》启发的 Java 规则引擎。在这篇文章中，Martin 表示：

> 你可以自己构建一个简单的规则引擎。你所需要做的就是创建一堆带有条件和动作的对象，将它们存储在一个集合中，并运行它们来评估条件并执行动作。

这正是Easy Rules所做的，它提供Rule抽象以创建具有条件和动作的规则，并提供RuleEngine API，该API通过一组规则运行以评估条件并执行动作。

## 核心特性

- 轻量级库和易于学习的API

- 基于POJO的开发与注释编程模型

- 有用的抽象定义业务规则并通过Java轻松应用

- 从原始规则创建复合规则的能力

- 使用表达式语言（如MVEL和SpEL）定义规则的能力

ps: 个人感觉比如 drools，这个设计更加符合我的口味。

# 快速入门

## maven 引入

```xml
<dependency>
	<groupId>org.jeasy</groupId>
	<artifactId>easy-rules-core</artifactId>
	<version>3.1.0</version>
</dependency>
<dependency>
    <groupId>org.jeasy</groupId>
    <artifactId>easy-rules-mvel</artifactId>
    <version>3.1.0</version>
</dependency>
```

## 定义你的规则

### 注解式

```java
@Rule(name = "weather rule", description = "if it rains then take an umbrella" )
public class WeatherRule {

    @Condition
    public boolean itRains(@Fact("rain") boolean rain) {
        return rain;
    }
    
    @Action
    public void takeAnUmbrella() {
        System.out.println("It rains, take an umbrella!");
    }
}
```

### 声明式

```java
Rule weatherRule = new RuleBuilder()
        .name("weather rule")
        .description("if it rains then take an umbrella")
        .when(facts -> facts.get("rain").equals(true))
        .then(facts -> System.out.println("It rains, take an umbrella!"))
        .build();
```

### 使用 EL 表达式

```java
Rule weatherRule = new MVELRule()
        .name("weather rule")
        .description("if it rains then take an umbrella")
        .when("rain == true")
        .then("System.out.println(\"It rains, take an umbrella!\");");
```


### 使用规则描述符

类似于 `weather-rule.yml` 的写法：

```yml
name: "weather rule"
description: "if it rains then take an umbrella"
condition: "rain == true"
actions:
  - "System.out.println(\"It rains, take an umbrella!\");"
```

- 使用

```java
MVELRuleFactory ruleFactory = new MVELRuleFactory(new YamlRuleDefinitionReader());
Rule weatherRule = ruleFactory.createRule(new FileReader("weather-rule.yml"));
```

## 触发

```java
public static void main(String[] args) {
    // define facts
    Facts facts = new Facts();
    facts.put("rain", true);
    // define rules
    Rule weatherRule = ...
    Rules rules = new Rules();
    rules.register(weatherRule);
    // fire rules on known facts
    RulesEngine rulesEngine = new DefaultRulesEngine();
    rulesEngine.fire(rules, facts);
}
```

# 个人收获

除却几种丰富的初始化方式之外，还可以各种组合。

所以值得学习一下这个框架的设计理念，并实现一个更加适合自己的工具。

# 参考资料

https://github.com/j-easy/easy-rules/wiki

[easy-rules 入门使用](https://blog.csdn.net/weixin_34397291/article/details/87994508)

* any list
{:toc}