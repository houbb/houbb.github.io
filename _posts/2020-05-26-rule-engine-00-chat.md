---
layout: post
title: 规则引擎-00-入门 聊一聊
date:  2020-5-26 16:05:35 +0800
categories: [Engine]
tags: [rule, rule-engine, sf]
published: true
---


# chat

## Q: 详细介绍一下 java 规则引擎

Java规则引擎是一种软件设计模式，它允许开发者将业务决策从应用程序代码中分离出来，并通过一组可配置的规则来实现业务逻辑。

这样做的好处是提高了业务逻辑的可维护性和可扩展性，因为规则可以不修改代码的情况下动态地更改。

下面将详细介绍Java规则引擎的概念、特点、使用场景以及一个流行的Java规则引擎库——Easy Rules。

### 概念【6】【1】【3】【4】【5】

规则引擎通过定义一系列的规则来处理业务逻辑，每个规则通常包含条件（当...时）和动作（则...）。

当输入数据（称为事实）与规则的条件部分匹配时，就会触发该规则的执行，并执行相应的动作。

### 特点【4】【5】【6】【1】【3】

1. **轻量级框架**：Java规则引擎通常设计为轻量级，便于集成到各种规模的应用程序中。
2. **易于学习的API**：提供简单直观的API，使得开发者可以快速上手并使用规则引擎。
3. **基于POJO的开发**：允许使用普通的Java对象（POJO）来定义规则，无需复杂的配置或依赖。
4. **支持组合规则**：可以将多个简单的规则组合成复杂的规则，以满足更复杂的业务逻辑。
5. **表达式语言支持**：支持使用表达式语言（如MVEL、SpEL和JEXL）来定义规则，提高了规则定义的灵活性和表达能力。

### 使用场景【5】【6】【1】【3】【4】

- **业务逻辑复杂多变**：当业务逻辑复杂且经常变化时，使用规则引擎可以更容易地管理和修改规则。
- **业务决策需要分离**：为了实现关注点分离，将业务决策从应用程序代码中分离出来，提高代码的清晰度和可维护性。
- **动态业务规则**：当业务规则需要频繁更改，但不希望修改和重新部署应用程序代码时，规则引擎提供了一种动态修改规则的机制。

### Easy Rules引擎介绍【3】【4】【5】【6】【1】

Easy Rules是一个开源的Java规则引擎库，它简单易用且功能强大。Easy Rules提供了以下特性：

- **轻量级**：易于集成和部署，对系统资源的占用小。
- **易于上手**：提供了简单直观的API，可以快速学习和使用。
- **基于POJO**：可以使用普通的Java对象来定义规则，无需额外的配置。
- **组合规则**：支持将多个规则组合成一个复杂的规则集。
- **表达式语言**：支持多种表达式语言，如MVEL、SpEL和JEXL，使得规则定义更加灵活。
- **规则优先级**：可以为规则设置优先级，控制规则的执行顺序。
- **规则监听器**：可以注册监听器来监听规则的执行事件，增强了规则执行的可观察性。

### 使用Easy Rules的示例【4】【5】【6】

假设我们需要实现一个FizzBuzz应用程序，规则如下：

- 如果数字是3的倍数，则打印“Fizz”。

- 如果数字是5的倍数，则打印“Buzz”。

- 如果同时是3和5的倍数，则打印“FizzBuzz”。

- 否则打印数字本身。

使用Easy Rules，我们可以定义三个规则（FizzRule、BuzzRule和FizzBuzzRule）和一个非FizzBuzz规则（NonFizzBuzzRule），然后将这些规则注册到一个规则集中，并使用规则引擎来触发它们。

代码示例如下：

```java
public class FizzBuzzWithEasyRules {
    public static void main(String[] args) {
        // 创建规则引擎
        RulesEngineParameters parameters = new RulesEngineParameters().skipOnFirstAppliedRule(true);
        RulesEngine fizzBuzzEngine = new DefaultRulesEngine(parameters);

        // 创建规则
        Rules rules = new Rules();
        rules.register(new FizzRule());
        rules.register(new BuzzRule());
        rules.register(new FizzBuzzRule(new FizzRule(), new BuzzRule()));
        rules.register(new NonFizzBuzzRule());

        // 触发规则
        for (int i = 1; i <= 100; i++) {
            Facts facts = new Facts();
            facts.put("number", i);
            fizzBuzzEngine.fire(rules, facts);
            System.out.print(facts.get("output"));
            System.out.println();
        }
    }
}
```

在这个示例中，我们定义了规则引擎的参数，创建了规则引擎实例，注册了规则，并在循环中为每个数字创建了事实，然后触发了规则引擎。规则引擎将根据定义的规则输出相应的结果。

通过上述介绍，我们可以看到Java规则引擎，特别是Easy Rules，是一种强大的工具，可以帮助开发者以一种更加声明式和灵活的方式处理复杂的业务逻辑。



## Q: 类似 easy-rules 的开源组件有哪些？

类似于 Easy Rules 的开源组件有很多，它们提供了不同的功能和特性，以满足不同业务场景的需求。

以下是一些流行的开源规则引擎组件，每个都有其独特的优势和应用场景：

1. **Drools** 【3】
   - Drools 是一个基于 Java 的强大开源规则引擎，它提供了一个完整的业务规则管理系统，支持复杂的业务规则和决策表。Drools 基于 RETE 算法，具有高效的规则执行能力，并且拥有一个活跃的社区和丰富的文档资源。

2. **Jess** 【2】
   - Jess 是一个基于 Java 的规则引擎，它是 CLIPS 程序设计语言的超集。Jess 适用于需要复杂逻辑编程的场景，常被称为“专家系统外壳”。它适合于构建自动化专家系统和智能代理系统。

3. **RuleGo** 【2】
   - RuleGo 是一个基于 Go 语言的轻量级、高性能的规则引擎。它支持异构系统数据集成，并且提供了灵活配置和高度定制化的事件处理框架。RuleGo 特别适合在边缘服务器上运行，因为它在资源占用和执行效率方面表现优异。

4. **Aviator** 【7】
   - Aviator 是一个高性能、轻量级的 Java 表达式求值引擎，它支持动态求值各种表达式。虽然它不是一个完整的规则引擎，但它可以用于动态规则评估和表达式计算。

5. **OpenRules** 【7】
   - OpenRules 是一个基于 Java 的完全开源的商业规则管理框架。它利用了 MS Excel、Eclipse IDE 和其他 Java 开源类库来构建、维护、部署和执行复杂的商业逻辑规则。

6. **JEOPS** 【7】
   - JEOPS 是一个基于 Java 的演绎法规则引擎，适用于在 Java 应用服务器、Java 客户端程序和 Servlets 中通过规则提高商业处理能力。

7. **InfoSapient** 【7】
   - InfoSapient 是一个开源的规则引擎，设计用于表达、执行和维护商业规则。它基于纯 Java 开发，并使用了多种设计模式，如 MVC、Strategy 等。

8. **Easy Rules** 【4】【5】【8】
   - Easy Rules 是一个简单而强大的 Java 规则引擎，提供了轻量级框架和易于学习的 API。它支持基于 POJO 的开发和注解编程模型，允许定义抽象的业务规则并轻松应用它们。Easy Rules 支持从简单规则创建组合规则，并且可以使用表达式语言（如 MVEL 和 SpEL）定义规则。

这些开源组件各有特点，开发者可以根据项目需求和个人偏好选择合适的规则引擎。

在选择时，需要考虑规则引擎的性能、易用性、社区支持、文档完整性以及是否符合项目的技术栈等因素。





# 参考资料

[我应该使用规则引擎吗？](https://martinfowler.com/bliki/RulesEngine.html)

[Drools 规则文件语法概述](https://www.jianshu.com/p/ae9a62588da4)

[小明的烦恼](https://www.cnblogs.com/ityouknow/archive/2017/08/07/7297524.html)

[Drools（JBoss Rules） 总结](https://www.cnblogs.com/wangzn/p/6024146.html)

* any list
{:toc}