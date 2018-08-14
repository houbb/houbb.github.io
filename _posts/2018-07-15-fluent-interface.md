---
layout: post
title:  Fluent Interface
date:  2018-07-16 15:02:07 +0800
categories: [Design]
tags: [design]
published: true
---

# Fluent 接口(链式调用)

自从Martin Fowler谈到fluent接口以来，人们就开始到处都有链接方法，为每个可能的用例创建fluent API(或dsl)。
原则上，几乎所有类型的 [DSL](https://en.wikipedia.org/wiki/Domain-specific_language) 都可以映射到Java。

让我们来看看如何做到这一点。

# DSL rules

DSL(领域特定语言)通常是由大致类似于这些的规则构建的:

```
1. SINGLE-WORD
2. PARAMETERISED-WORD parameter
3. WORD1 [ OPTIONAL-WORD ]
4. WORD2 { WORD-CHOICE-A | WORD-CHOICE-B }
5. WORD3 [ , WORD3 ... ]
```

![2018-07-16-grammar.png](https://raw.githubusercontent.com/houbb/resource/master/img/design/2018-07-16-grammar.png)

```
Grammar  ::= 'SINGLE-WORD'
           | 'PARAMETERISED-WORD' '(' [A-Z]+ ')'
           | 'WORD1' 'OPTIONAL-WORD'?
           | 'WORD2' ( 'WORD-CHOICE-A' | 'WORD-CHOICE-B' )
           | 'WORD3'+
```

# Java 实现

使用Java接口，对上述DSL进行建模非常简单。从本质上讲，你必须遵循以下转换规则:

- 每个DSL“关键字”都变成了一个Java方法。

- 每一个DSL“连接”都成为一个接口

- 当您有一个“强制”选择(您不能跳过下一个关键字)时，该选择的每个关键字都是当前接口中的一个方法。如果只有一个关键字是可能的，那么只有一个方法

- 当您有一个“可选”关键字时，当前接口扩展下一个关键字/方法

- 当您有一个“重复”的关键字时，表示可重复关键字的方法将返回接口本身，而不是下一个接口。

- 每个DSL子定义都成为一个参数。这将允许递归性

注意，也可以使用类而不是接口对上述DSL进行建模。
但是，只要您希望重用类似的关键字，方法的多重继承就会非常方便，而且使用接口可能会更好。

通过设置这些规则，您可以随意重复它们来创建任意复杂的dsl，比如jOOQ。当然，您必须以某种方式实现所有接口，但这是另一回事。

以下是上述规则如何翻译成Java:

```java
// Initial interface, entry point of the DSL
// Depending on your DSL's nature, this can also be a class with static
// methods which can be static imported making your DSL even more fluent
interface Start {
  End singleWord();
  End parameterisedWord(String parameter);
  Intermediate1 word1();
  Intermediate2 word2();
  Intermediate3 word3();
}
 
// Terminating interface, might also contain methods like execute();
interface End {
  void end();
}
 
// Intermediate DSL "step" extending the interface that is returned
// by optionalWord(), to make that method "optional"
interface Intermediate1 extends End {
  End optionalWord();
}
 
// Intermediate DSL "step" providing several choices (similar to Start)
interface Intermediate2 {
  End wordChoiceA();
  End wordChoiceB();
}
 
// Intermediate interface returning itself on word3(), in order to allow
// for repetitions. Repetitions can be ended any time because this 
// interface extends End
interface Intermediate3 extends End {
  Intermediate3 word3();
}
```

通过上面的语法定义，我们现在可以直接在Java中使用这个DSL。以下是所有可能的结构:

```java
Start start = // ...
 
start.singleWord().end();
start.parameterisedWord("abc").end();
 
start.word1().end();
start.word1().optionalWord().end();
 
start.word2().wordChoiceA().end();
start.word2().wordChoiceB().end();
 
start.word3().end();
start.word3().word3().end();
start.word3().word3().word3().end();
```

# 总结

在过去的7年里，Fluent-Api 一直是一种炒作。

马丁·福勒(Martin Fowler)已经成为一个被大量引用的人，并获得了大部分的学分，即使之前有流利的api。

在Java .lang中可以看到Java最古老的“fluent api”之一。

StringBuffer，允许将任意对象附加到字符串中。但是fluent API最大的好处是能够轻松地将“外部dsl”映射到Java中，并将其实现为任意复杂度的“内部dsl”。

# 参考文章

[FluentInterface](https://martinfowler.com/bliki/FluentInterface.html)

[the-java-fluent-api-designer-crash-course](https://blog.jooq.org/2012/01/05/the-java-fluent-api-designer-crash-course/)






* any list
{:toc}