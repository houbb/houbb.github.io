---
layout: post
title: 规则引擎-10-rulebook
date:  2020-5-26 16:05:35 +0800
categories: [Engine]
tags: [design, rule-engine, sf] 
published: true
---

# 为什么选择 RuleBook？

RuleBook 的规则是按照 Java 开发者的思维方式构建的：Java 代码。它们以程序员期望的方式执行：按顺序执行。RuleBook 还允许您使用易于使用的 Lambda 启用的领域特定语言或使用您定义的 POJO 来指定规则！

厌倦了充斥着 if/then/else 语句的类？

需要一个很好的抽象来让规则可以轻松地以一种将它们彼此解耦的方式进行指定？

想要以与您编写代码的其他部分[Java 中]相同的方式编写规则？RuleBook 可能就是您一直在等待的规则抽象！

# 1 获取 RuleBook

## 1.1 构建 RuleBook

```bash
git clone https://github.com/Clayton7510/RuleBook.git
cd RuleBook
./gradlew build
```

## 1.2 Maven 中央仓库版本

* rulebook-core &nbsp;&nbsp;&nbsp;[![Maven 中央仓库](https://img.shields.io/badge/maven%20central-0.12-brightgreen.svg)][RuleBook-Core Maven Central]
* rulebook-spring [![Maven 中央仓库](https://img.shields.io/badge/maven%20central-0.12-brightgreen.svg)][RuleBook-Spring Maven Central]

## 1.3 最新 Sonatype SNAPSHOT (开发) 版本

* rulebook-core &nbsp;&nbsp;&nbsp;[![Sonatype Nexus](https://img.shields.io/badge/SNAPSHOT-0.13-green.svg)](https://oss.sonatype.org/content/repositories/snapshots/)
* rulebook-spring [![Sonatype Nexus](https://img.shields.io/badge/SNAPSHOT-0.13-green.svg)](https://oss.sonatype.org/content/repositories/snapshots/)

## 1.4 将 RuleBook 添加到您的 Maven 项目中

_将以下代码添加到您的 pom.xml 文件中_

```xml
<dependency>
    <groupId>com.deliveredtechnologies</groupId>
    <artifactId>rulebook-core</artifactId>
    <version>0.12</version>
</dependency>
```

## 1.5 将 RuleBook 添加到您的 Gradle 项目中

_将以下代码添加到您的 build.gradle 文件中_

```groovy
compile 'com.deliveredtechnologies:rulebook-core:0.12'
```

# 2 使用 RuleBook

## 2.1 HelloWorld 示例
```java
RuleBook ruleBook = RuleBookBuilder.create()
    .addRule(rule -> rule.withNoSpecifiedFactType()
      .then(f -> System.out.print("Hello "))
      .then(f -> System.out.println("World")))
    .build();
```
**...或者使用两个规则**
```java
RuleBook ruleBook = RuleBookBuilder.create()
    .addRule(rule -> rule.withNoSpecifiedFactType().then(f -> System.out.print("Hello ")))
    .addRule(rule -> rule.withNoSpecifiedFactType().then(f -> System.out.println("World")))
    .build();
```
**现在，运行它！**
```java
ruleBook.run(new FactMap());
```

## 2.2 使用 Facts 的上述示例
```java
RuleBook ruleBook = RuleBookBuilder.create()
    .addRule(rule -> rule.withFactType(String.class)
      .when(f -> f.containsKey("hello"))
      .using("hello")
      .then(System.out::print))
    .addRule(rule -> rule.withFactType(String.class)
      .when(f -> f.containsKey("world"))
      .using("world")
      .then(System.out::println))
    .build();
```
**...或者可以是单个规则**
```java
RuleBook ruleBook = RuleBookBuilder.create()
  .addRule(rule -> rule.withFactType(String.class)
    .when(f -> f.containsKey("hello") && f.containsKey("world"))
    .using("hello").then(System.out::print)
    .using("world").then(System.out::println))
  .build();
```
**现在，运行它！**
```java
NameValueReferableMap factMap = new FactMap();
factMap.setValue("hello", "Hello ");
factMap.setValue("world", " World");
ruleBook.run(factMap);
```

## 2.3 [稍微] 复杂的场景示例

_MegaBank 发放房屋贷款。如果申请人的信用评分低于 600 分，则必须支付当前利率的 4 倍。如果申请人的信用评分在 600 到 700 之间，则必须在他们的利率上再增加一点。如果申请人的信用评分至少为 700，并且他们手头至少有 $25,000 现金，则他们的利率会减少四分之一。如果申请人是首次购房者，则他们的计算利率在根据信用评分进行调整后会减少 20%（注意：首次购房者折扣仅适用于信用评分为 600 分或更高的申请人）。_

```java
public class ApplicantBean {
  private int creditScore;
  private double cashOnHand;
  private boolean firstTimeHomeBuyer;

  public ApplicantBean(int creditScore, double cashOnHand, boolean firstTimeHomeBuyer) {
    this.creditScore = creditScore;
    this.cashOnHand = cashOnHand;
    this.firstTimeHomeBuyer = firstTimeHomeBuyer;
  }

  public int getCreditScore() {
    return creditScore;
  }

  public void setCreditScore(int creditScore) {     
    this.creditScore = creditScore;
  }

  public double getCashOnHand() {
    return cashOnHand;
  }

  public void setCashOnHand(double cashOnHand) {
    this.cashOnHand = cashOnHand;
  }

  public boolean isFirstTimeHomeBuyer() {
    return firstTimeHomeBuyer;
  }

  public void setFirstTimeHomeBuyer(boolean firstTimeHomeBuyer) {
    this.firstTimeHomeBuyer = firstTimeHomeBuyer;
  }
}
```
```java
public class HomeLoanRateRuleBook extends CoRRuleBook<Double> {
  @Override
  public void defineRules() {
    //信用评分低于 600 分的利率增加 4 倍
    addRule(RuleBuilder.create().withFactType(ApplicantBean.class).withResultType(Double.class)
      .when(facts -> facts.getOne().getCreditScore() < 600)
      .then((facts, result) -> result.setValue(result.getValue() * 4))
      .stop()
      .build());

    //信用评分在 600 到 700 之间的利率增加 1 点
    addRule(RuleBuilder.create().withFactType(ApplicantBean.class).withResultType(Double.class)
      .when(facts -> facts.getOne().getCreditScore() < 700)
      .then((facts, result) -> result.setValue(result.getValue() + 1))
      .build());

    //信用评分为 700 且手头至少有 $25,000 现金的申请人
    addRule(RuleBuilder.create().withFactType(ApplicantBean.class).withResultType(Double.class)
      .when(facts ->


            facts.getOne().getCreditScore() >= 700 &&
            facts.getOne().getCashOnHand() >= 25000)
      .then((facts, result) -> result.setValue(result.getValue() - 0.25))
      .build());

    //首次购房者的利率减少 20%（如果他们的信用评分低于 600 分，则不适用）
    addRule(RuleBuilder.create().withFactType(ApplicantBean.class).withResultType(Double.class)
      .when(facts -> facts.getOne().isFirstTimeHomeBuyer())
      .then((facts, result) -> result.setValue(result.getValue() * 0.80))
      .build());
    }
}
```
```java
public class ExampleSolution {
  public static void main(String[] args) {
    RuleBook homeLoanRateRuleBook = RuleBookBuilder.create(HomeLoanRateRuleBook.class).withResultType(Double.class)
      .withDefaultResult(4.5)
      .build();
    NameValueReferableMap facts = new FactMap();
    facts.setValue("applicant", new ApplicantBean(650, 20000.0, true));
    homeLoanRateRuleBook.run(facts);

    homeLoanRateRuleBook.getResult().ifPresent(result -> System.out.println("申请人符合以下利率条件：" + result));
  }
}
```
**...或者放弃 ApplicantBean，只使用独立的 Facts**
```java
public class HomeLoanRateRuleBook extends CoRRuleBook<Double> {
  @Override
  public void defineRules() {
    //信用评分低于 600 分的利率增加 4 倍
    addRule(RuleBuilder.create().withResultType(Double.class)
      .when(facts -> facts.getIntVal("Credit Score") < 600)
      .then((facts, result) -> result.setValue(result.getValue() * 4))
      .stop()
      .build());

    //信用评分在 600 到 700 之间的利率增加 1 点
    addRule(RuleBuilder.create().withResultType(Double.class)
      .when(facts -> facts.getIntVal("Credit Score") < 700)
      .then((facts, result) -> result.setValue(result.getValue() + 1))
      .build());

    //信用评分为 700 且手头至少有 $25,000 现金的申请人
    addRule(RuleBuilder.create().withResultType(Double.class)
      .when(facts ->
        facts.getIntVal("Credit Score") >= 700 &&
        facts.getDblVal("Cash on Hand") >= 25000)
      .then((facts, result) -> result.setValue(result.getValue() - 0.25))
      .build());

    //首次购房者的利率减少 20%（如果他们的信用评分低于 600 分，则不适用）
    addRule(RuleBuilder.create().withFactType(Boolean.class).withResultType(Double.class)
      .when(facts -> facts.getOne())
      .then((facts, result) -> result.setValue(result.getValue() * 0.80))
      .build());
  }
}
```
```java
public class ExampleSolution {
  public static void main(String[] args) {
    RuleBook homeLoanRateRuleBook = RuleBookBuilder.create(HomeLoanRateRuleBook.class).withResultType(Double.class)
     .withDefaultResult(4.5)
     .build();

    NameValueReferableMap facts = new FactMap();
    facts.setValue("Credit Score", 650);
    facts.setValue("Cash on Hand", 20000);
    facts.setValue("First Time Homebuyer", true);

    homeLoanRateRuleBook.run(facts);

    homeLoanRateRuleBook.getResult().ifPresent(result -> System.out.println("申请人符合以下利率条件：" + result));
    }
}
```

## 2.4 线程安全

RuleBooks 是线程安全的。然而，FactMaps 和其他实现了 NameValueReferableMap 的类则不是。这意味着可以在不同的线程中使用不同的 Facts 来运行单个 RuleBook 实例而不会出现意外结果。然而，在不同的线程中使用相同的 Exact FactMap 可能会导致意外结果。Facts 表示 RuleBook 单次调用的数据，而 RuleBooks 表示可重用的规则集。

## 3 RuleBook 领域特定语言解释

RuleBook Java 领域特定语言 (DSL) 使用了行为驱动开发 (BDD) 中的 Given-When-Then 格式，该格式被行为驱动开发和相关测试框架 (例如 Cucumber 和 Spock) 所推广。许多创建 RuleBook Java DSL 的想法也借鉴了 BDD，包括：_**句子应该用于描述规则**_ 和 _**应使用通用语言定义规则，以便将其转换为代码库**_。

### 3.1 Given-When-Then：RuleBook 语言的基础

与 BDD 中用于定义测试的 Given-When-Then 语言非常相似，RuleBook 使用 Given-When-Then 语言来定义规则。RuleBook Given-When-Then 方法具有以下含义。

* **Given** 一些事实
* **When** 条件评估为真时
* **Then** 触发一个动作

**Given** 方法可以接受一个或多个事实，以各种不同的形式，用作单个规则提供的信息集合。当将规则分组到 RuleBook 中时，在运行 RuleBook 时，将事实提供给规则，因此可以推断出'Given'。

**When** 方法接受一个 Predicate，根据提供的事实评估条件。每个规则只能指定一个 when() 方法。

**Then** 方法接受一个 Consumer（或对于具有结果的规则，是 BiConsumer），描述如果 when() 方法中的条件评估为 true，则触发的操作。在规则中可以指定多个 then() 方法，如果 when() 条件评估为 true，则所有指定的 then() 方法都将按照指定的顺序被调用。

### 3.2 Using 方法
**Using** 方法可以减少 then() 方法中可用的事实集。如果需要，还可以链接多个 using() 方法。在 then() 方法之前立即紧随的所有 using() 方法中指定的名称的事实的聚合将被提供给该 then() 方法。[上述示例](#22-the-above-example-using-facts)展示了 using() 的工作原理。

### 3.3 Stop 方法
**Stop** 方法用于中断规则链。如果在定义规则时指定了 stop() 方法，则意味着如果 when() 条件评估为 true，则在 then() 动作完成后，应该中断规则链，并且不应该评估该链中的更多规则。

### 3.4 使用 Facts
可以使用 given() 方法将事实提供给规则。在 RuleBooks 中，当运行 RuleBook 时，事实将被提供给规则。可供规则和 RuleBooks 使用的事实包含在 NameValueReferableMap 中（基本实现为 FactMap），它是一种特殊类型的 Map，可以轻松访问其中包含的对象。存在事实的原因是为了始终有一个引用指向规则处理的对象 - 即使例如，不可变对象被替换，也会认为事实仍然存在，并且提供了对代表性对象的命名引用。

#### 3.4.1 单一事实方便方法
事实实际上只有一个方便的方法。由于 NameValueReferableMap (例如 FactMap) 是传递给 when() 和 then() 方法的内容，因此大多数围绕事实的便利方法都可以在 Map 中使用。但是，在 Fact 类中包含一个方便的方法... 构造函数。事实由名称值对组成。但在某些情况下，事实的名称应该只是它包含的对象的字符串值。在这些情况下，可以使用具有包含在事实中的对象类型的单个参数的构造函数。

#### 3.4.2 FactMap 方便方法
虽然 NameValueReferableMap (通常称为 FactMap) 的原因很重要，但这并不意味着任何人都想要链接一堆样板调用以获取到底层 Fact 中包含的值对象。因此，在使用 when() 和 then() 方法时，一些便利方法可以使生活更轻松。

**getOne()** 获取 FactMap 中唯一的 Fact 的值

**getValue(String name)** 根据 Fact 的名称获取其值

**setValue(String name, T value)** 将指定名称的 Fact 设置为新值

**put(Fact fact)** 向 FactMap 中添加 Fact，使用 Fact 的名称作为 Map 的键

**toString()** 当 FactMap 中只有一个 Fact 时，toString() 获取 Fact 的值的 toString() 方法

以下方法是 NameValueReferrableTypeConvertible 接口的一部分，该接口由 TypeConvertibleFactMap 类作为 NameValue

Referrable 装饰器实现。您可以将其视为 FactMaps 的装饰器（因为它也是！）并且它用于将事实注入 when() 和 then() 方法中。

**getStrVal(String name)** 按名称获取事实的值为字符串

**getDblVal(String)** 按名称获取事实的值为 Double

**getIntVal(String)** 按名称获取事实的值为 Integer

**getBigDeciVal(String)** 按名称获取事实的值为 BigDecimal

**getBoolVal(String)** 按名称获取事实的值为 Boolean

### 3.5 规则审核
可以在构造 RuleBook 时通过指定 _asAuditor()_ 来启用规则审核，如下所示。

```java
RuleBook rulebook = RuleBookBuilder.create().asAuditor()
   .addRule(rule -> rule.withName("Rule1").withNoSpecifiedFactType()
     .when(facts -> true)
     .then(facts -> { } ))
   .addRule(rule -> rule.withName("Rule2").withNoSpecifiedFactType()
     .when(facts -> false)
     .then(facts -> { } )).build();
     
 rulebook.run(new FactMap());
```

通过使用 _asAuditor()_，RuleBook 中的每个规则可以在其名称被指定时注册自身为 _可审计规则_。每个添加到 RuleBook _Auditor_ 中的 _可审计规则_ 在 RuleBook 中的状态会被记录。当规则被注册为 RuleBook 中的可审计规则时，其 RuleStatus 是 _NONE_。在运行 RuleBook 后，对于失败或条件不评估为 true 的所有规则，其 RuleStatus 会更改为 _SKIPPED_。对于条件评估为 true 且 then() 动作成功完成的规则，其 RuleStatus 会更改为 _EXECUTED_。

可以通过以下方式检索规则的状态。

```java
Auditor auditor = (Auditor)rulebook;
 System.out.println(auditor.getRuleStatus("Rule1")); //打印 EXECUTED
 System.out.println(auditor.getRuleStatus("Rule2")); //打印 SKIPPED
```

可以如下方式检索所有规则名称及其相应状态的映射。

```java
 Map<String, RuleStatus> auditMap = auditor.getRuleStatusMap();
```

### 3.6 规则链行为
默认情况下，加载规则时发现的错误或运行规则时抛出的异常将从规则链中删除这些规则。换句话说，错误的规则将被跳过。此外，默认情况下，仅当规则的条件评估为 true 并且其动作成功完成时，规则才能停止规则链。

但是，可以按照每个规则的要求更改此行为。

```java
RuleBook ruleBook = RuleBookBuilder.create()
    .addRule(
        RuleBuilder.create(GoldenRule.class, RuleChainActionType.STOP_ON_FAILURE)
            .withFactType(String.class)
            .when(facts -> true)
            .then(consumer)
            .stop()
            .build())
    .addRule(
        RuleBuilder.create()
            .withFactType(String.class)
            .when(facts -> true)
            .then(consumer)
            .build())
    .build();
```

在上面的示例中，默认的 RuleChainActionType.CONTINUE_ON_FAILURE 被更改为 RuleChainActionType.STOP_ON_FAILURE。这将确保如果第一个规则出现错误，则永远不会调用第二个规则。但是，不会抛出任何错误。

如果期望的行为是在第一个规则中发生任何异常并停止规则链，可以使用以下代码。

```java
RuleBook ruleBook = RuleBookBuilder.create()
    .addRule(
        RuleBuilder.create(GoldenRule.class, RuleChainActionType.ERROR_ON_FAILURE)
            .withFactType(String.class)
            .when(facts -> true)
            .then(consumer)
            .build())
    .addRule(
        RuleBuilder.create()
            .withFactType(String.class)
            .when(facts -> true)
            .then(consumer)
            .build())
    .build();
```

#### 3.6.1 定义规则链行为类型

| RuleChainActionType | 描述                     |
| ------------------- | ------------------------------- |
| CONTINUE_ON_FAILURE | 默认的 RuleChainActionType；如果规则条件为 false 或出现错误，则规则会被跳过| 
| ERROR_ON_FAILURE    | 规则引发的异常会停止规则链，并将异常作为 RuleException 冒泡 |
| STOP_ON_FAILURE     | 如果规则的 RuleState 设置为 BREAK，则当规则的条件为 false 或抛出异常时将停止规则链 |


## 4 POJO 规则

从 RuleBook v0.2 开始，支持 POJO 规则。只需在包中定义带有注解的 POJO 规则，然后使用 _RuleBookRunner_ 扫描包中的规则，并创建 RuleBook 即可。就是这么简单！

### 4.1 Hello World 示例

```java
package com.example.rulebook.helloworld;

import com.deliveredtechnologies.rulebook.annotations.*;
import com.deliveredtechnologies.rulebook.RuleState;

@Rule
public class HelloWorld {

  @Given("hello")
  private String hello;

  @Given("world")
  private String world;

  @Result
  private String helloworld;

  @When
  public boolean when() {
      return true;
  }

  @Then
  public RuleState then() {
      helloworld = hello + " " + world;
      return RuleState.BREAK;
  }
}
```
```java

public static void main(String args[]) {
  RuleBookRunner ruleBook = new RuleBookRunner("com.example.rulebook.helloworld");
  NameValueReferableMap facts = new FactMap();
  facts.setValue("hello", "Hello");
  facts.setValue("world", "World");
  ruleBook.run(facts);
  ruleBook.getResult().ifPresent(System.out::println); //prints "Hello World"
}
```

### 4.2 使用 POJO 规则的新 MegaBank 示例
_MegaBank 更改了其利率调整政策。他们现在还接受包括多达 3 名申请人的贷款申请。如果所有申请人的信用评分都低于 600，那么他们必须支付当前利率的 4 倍。然而，如果所有申请人的信用评分都低于 700，但至少有一个申请人的信用评分高于 600，那么他们必须在利率之上额外支付一点。此外，如果任何申请人的信用评分达到 700 或更高，并且所有申请人的手头现金总额大于或等于 50000 美元，则他们的利率会降低四分之一。如果至少有一名申请人是首次购房者，并且至少有一名申请人的信用评分超过 600，则在进行所有其他调整后，他们的计算利率将降低 20%。_

**...使用上面定义的 ApplicantBean**
```java
@Rule(order = 1) //order specifies the order the rule should execute in; if not specified, any order may be used
public class ApplicantNumberRule {
  @Given
  private List<ApplicantBean> applicants; //Annotated Lists get injected with all Facts of the declared generic type

  @When
  public boolean when() {
    return applicants.size() > 3;
  }

  @Then
  public RuleState then() {
    return RuleState.BREAK;
  }
}
```
```java
@Rule(order = 2)
public class LowCreditScoreRule {
  @Given
  private List<ApplicantBean> applicants;

  @Result
  private double rate;

  @When
  public boolean when() {
    return applicants.stream()
      .allMatch(applicant -> applicant.getCreditScore() < 600);
  }

  @Then
  public RuleState then() {
    rate *= 4;
    return BREAK;
  }
}
```
```java
@Rule(order = 3)
public class QuarterPointReductionRule {
  @Given
  List<ApplicantBean> applicants;

  @Result
  private double rate;

  @When
  public boolean when() {
    return
      applicants.stream().anyMatch(applicant -> applicant.getCreditScore() >= 700) &&
      applicants.stream().map(applicant -> applicant.getCashOnHand()).reduce(0.0, Double::sum) >= 50000;
  }

  @Then
  public void then() {
    rate = rate - (rate * 0.25);
  }
}
```
```java
@Rule(order = 3)
public class ExtraPointRule {
  @Given
  List<ApplicantBean> applicants;

  @Result
  private double rate;

  @When
  public boolean when() {
    return
      applicants.stream().anyMatch(applicant -> applicant.getCreditScore() < 700 && applicant.getCreditScore() >= 600);
  }

  @Then
  public void then() {
    rate += 1;
  }
}
```
```java
@Rule(order = 4)
public class FirstTimeHomeBuyerRule {
  @Given
  List<ApplicantBean> applicants;

  @Result
  private double rate;

  @When
  public boolean when() {
    return
      applicants.stream().anyMatch(applicant -> applicant.isFirstTimeHomeBuyer());
  }

  @Then
  public void then() {
    rate = rate - (rate * 0.20);
  }
}
```
```java
public class ExampleSolution {
  public static void main(String[] args) {
    RuleBookRunner ruleBook = new RuleBookRunner("com.example.rulebook.megabank");
    NameValueReferableMap<ApplicantBean> facts = new FactMap<>();
    ApplicantBean applicant1 = new ApplicantBean(650, 20000, true);
    ApplicantBean applicant2 = new ApplicantBean(620, 30000, true);
    facts.put(new Fact<>(applicant1));
    facts.put(new Fact<>(applicant2));

    ruleBook.setDefaultResult(4.5);
    ruleBook.run(facts);
    ruleBook.getResult().ifPresent(result -> System.out.println("Applicant qualified for the following rate: " + result));
  }
}
```

### 4.3 POJO 规则解释

POJO 规则在类级别使用 @Rule 进行注释。这让 RuleBookRunner 知道您定义的类实际上是一个规则。通过 @Given 注解将事实注入 POJO 规则。传递给 @Given 注解的值是赋予 RuleBookRunner 的 Fact 的名称。@Given 注解的类型可以是匹配 Fact 的泛型类型，也可以是上面看到的 Fact 类型。两者之间的主要区别在于，如果更改了不可变对象，则不会将更改传播到规则链下游，如果更改了 Fact 的泛型对象（因为它将成为一个新对象）。但是，如果在 Fact 对象上设置了值，那么这些更改将沿着规则链传播下去。

@When 注解表示用作执行 'then' 动作条件的方法。使用 @When 注解的方法不应接受参数，并且应返回布尔结果。



@Then 注解表示规则执行 'when' 条件评估为 true 时执行的动作。使用 @Then 注解的方法不应接受参数，如果需要，可以选择返回 RuleState 结果。如果 POJO 规则中有多个方法使用 @Then 注解，则所有使用 @Then 注解的规则都在 'when' 条件评估为 true 时执行。

@Result 注解表示规则的结果。当然，有些规则可能没有结果。在这种情况下，只需不使用 @Result 注解。就是这么简单。

#### 4.3.1 对 POJO 规则进行排序

'顺序' 属性可以\[可选地\]与 @Rule 注解一起使用，以指定 POJO 规则的执行顺序\[如上所示\](#42-a-new-megabank-example-with-pojo-rules)。如果未指定 order 属性，则规则可以按任何顺序执行。同样，多个规则可以具有相同的顺序，这意味着具有匹配顺序的规则可以按任何顺序执行 - 在这种情况下，顺序将表示一组规则，其中组的执行在其他规则之间进行排序，但是组内规则的执行顺序无关紧要。

#### 4.3.2 将集合注入到 POJO 规则中

如果满足以下条件，则将所有泛型类型 Facts 中包含的对象注入到集合中：

* List、Set、Map 或 FactMap 使用 @Given 注解
* 集合上的 @Given 注解未指定值
* List、Set、Map 的泛型类型（Map 中的第一个泛型类型是 String - 表示注入的 Fact 名称）与提供给 RuleBookRunner 的至少一个 Fact 的类型相同

#### 4.3.3 POJO 规则注解继承

从 v.0.3.2 开始，RuleBook 支持 POJO 规则上的注解继承。这意味着如果您有一个子类，其父类带有 RuleBook 注解（即 @Given、@When、@Then、@Result），那么子类将继承父类的注解。在父类中注入的 @Given 和 @Result 属性将可用于子类。在父类中定义的 @Then 和 @When 方法将在子类中可见。

#### 4.3.4 审核 POJO 规则

通过 RuleBookRunner 内置到 POJO 规则中的审核功能。如果在 @Rule 属性中指定了名称，则该名称用于审核。否则，POJO 规则的类名将用于审核。例如，假设有一个名为 "My Rule" 的 POJO 规则由 RuleBookRunner 运行，那么可以如下方式检索该规则执行的状态。

```java
 Auditor auditor = (Auditor)rulebookRunner;
 RuleStatus myRuleStatus = auditor.getRuleStatus("My Rule");
```

#### 4.3.5 POJO 规则链行为

```java
@Rule(ruleChainAction = ERROR_ON_FAILURE)
public class ErrorRule {
  @When
  public boolean when() {
    return true;
  }

  @Then
  public void then() throws Exception {
    throw new CustomException("Sumthin' Broke!");
  }
}
```

如上面直接的示例所示，ruleChainAction Rule 参数可用于更改特定规则的规则链行为，详细信息请参见 [3.6 规则链行为](#36-rule-chain-behavior)。

## 5 使用 Spring 的 RuleBook

RuleBook 可以与 Spring 集成，以便注入从包中创建的 POJO 的 RuleBook 实例。
RuleBook 可以使用 Java DSL 或 POJO 规则指定。由于 RuleBook 是线程安全的，因此它们可以用作单例，Spring 的默认方式用于注入 bean。此外，现在可以使 POJO 规则了解 Spring，因此可以使用 @Autowired 注入 Spring 组件。

### 5.1 将 RuleBook Spring 支持添加到项目中

使用 Spring 的首选方式是配置 SpringAwareRuleBookRunner。然后，只需将 @RuleBean 注解添加到您希望与 Spring 一起使用的任何 POJO 规则中即可。如果省略 @RuleBean 注解，则 @POJO 规则（s）没有 @RuleBean 也可以被加载和运行，它们只是不会被 Spring 管理或适当地作用域化，并且 @Autowired 在规则内不起作用。

### 5.2 创建 Spring 启用的 POJO 规则

可以像上面没有 Spring 一样创建 POJO 规则，但是带有一些额外的 Spring 特性！要创建 Spring 启用的 POJO 规则，首先将 rulebook-spring 添加为依赖项。

Maven:

```xml
<dependency>
    <groupId>com.deliveredtechnologies</groupId>
    <artifactId>rulebook-spring</artifactId>
    <version>0.12</version>
</dependency>
```

Gradle:

```groovy
compile 'com.deliveredtechnologies:rulebook-spring:0.12'
```

_注意：目前唯一提供 SpringAwareRuleBookRunner 的 rulebook-spring 版本是 0.11，它允许规则具有注入的 @Autowired Spring 组件。_

下面的简单示例演示了基本功能。

```java

package com.exampl.rulebook.helloworld.component;

@Component
public class HelloWorldComponent {
  public String getHelloWorld(String hello, String world) {
    return hello + " " + world + "!";
  }
}

```

```java

package com.example.rulebook.helloworld;

@RuleBean
@Rule(order = 1)
public class HelloSpringRule {
  @Given("hello")
  private String hello;

  @Result
  private String result;

  @When
  public boolean when() {
    return hello != null;
  }

  @Then
  public void then() {
    result = hello;
  }
}
```

```java

package com.example.rulebook.helloworld;

@RuleBean
@Rule(order = 2)
public class WorldSpringRule {
  @Autowired
  HelloWorldComponent helloWorldComponent;
  
  @Given("world")
  private String world;

  @Result
  private String result;

  @When
  public boolean when() {
    return world != null;
  }

  @Then
  public void then() {
    result = helloWorldComponent.getHelloWorld(result, world);
  }
}
```

### 5.3 在 Spring 中配置 RuleBook

```java
@Configuration
@ComponentScan("com.example.rulebook.helloworld")
public class SpringConfig {
  @Bean
  public RuleBook ruleBook() {
    RuleBook ruleBook = new SpringAwareRuleBookRunner("com.example.rulebook.helloworld");
    return ruleBook;
  }
}
```

### 5.4 使用 Spring 启用的 RuleBook

```java
  @Autowired
  private RuleBook ruleBook;

  public void printResult() {
    NameValueReferableMap<String> facts = new FactMap<>();
    facts.setValue("hello", "Hello ");
    facts.setValue("world", "World");
    ruleBook.run(facts);
    ruleBook.getResult().ifPresent(System.out::println); //prints Hello World!
  }
```

### 5.5 使用 Spring 进行规则排序

如果使用 RuleBean 注解创建了 Spring 启用的规则，则所有这些功能仍然有效。并且有 Spring 启用的 POJO 规则仍然可以在 Spring 中配置 RuleBook \[使用 SpringRuleBook\]。

但是 RuleBean 没有 order 属性。因此，如果需要对使用 RuleBookFactoryBean 扫描的 bean 进行排序，请像对待常规非 Spring 启用的 POJO 规则一样使用 @Rule 注解。它的工作方式完全相同！

## 6 如何贡献

欢迎提出建议和代码贡献！请参阅下面的 _开发者指南_。

### 6.1 开发者指南

贡献必须符合以下标准：

1. forked 仓库必须是公开可见的。
2. 请求中解决的问题必须与已接受的问题关联。
3. 构建（即 ./gradlew build）必须无错误或警告。
4. 所有新的和现有测试必须通过。
5. 代码必须符合包含在 checkstyle 配置中的样式指南（即无 checkstyle 错误）。
6. 新引入的代码必须至少有 85% 的测试覆盖率。
7. Pull 请求必须针对 _develop_ 分支。
8. gradle.properties 中的版本号应该与其关联的里程碑的版本号匹配，后面跟着 _-SNAPSHOT_（例如 0.2-SNAPSHOT）。

任何人都可以提交一个问题，它可以是增强/功能请求或要纠正的错误。如果批准了功能请求或错误（大多数合理的请求都将被批准），完成了并且提交了一个符合上述标准的关联的 Pull 请求，那么将合并该 Pull 请求，并将贡献者添加到以下发布中的贡献者列表中。



# 参考资料

https://github.com/deliveredtechnologies/rulebook

* any list
{:toc}