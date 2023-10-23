---
layout: post
title: JavaParser 系列学习-06-comments 注释
date:  2020-5-29 14:24:18 +0800
categories: [java]
tags: [aop, ast, sh]
published: true
---

# 注释-这里是龙

这个问题从哪里开始？ -用经典的程序员隐喻看来。

我想说，作为开发人员社区，已经花了更多时间讨论关于注释解析的想法，而不是JavaParser项目中的任何其他功能。

很难开始，也许是因为它的尾巴（坏双关语）还没有结束。

在撰写本文时，该库的下一个主要版本计划从头开始重建行为。

为什么评论如此具有挑战性？ 

好的，正式的注释不构成语言的抽象语法树的一部分。 

抽象部分意味着它省略了元素编译器不感兴趣的语法树。

因此，Java语言规范并没有真正涵盖它们，仅需一页即可。 

在800页的文件中，这几乎不构成脚注。

在大多数情况下，您在注释令牌中包含的内容以及包含在注释令牌中的内容都将成为“监狱规则”，即一切正常。

即使您认为能够满足所有可能的情况，也会有人为注释解析不足的情况提供新的案例。

与由于注释在语法树中的位置而与其他语言概念，类，方法，字段等明确关联的注释不同，注释不是。 

反过来，这意味着归因的概念，即所评论的内容可能变得模棱两可； 因此，不可避免地，这种实现方式并非始终适合所有人。

综上所述，这是图书馆的一项非常受欢迎的功能。

这对您作为用户意味着什么？

好吧，尽管我们已尽最大努力以明智且健壮的方式进行评论解析和归因工作。

它可能无法满足某些人对其工作方式的期望，尤其是在您有复杂需求的情况下。

例如，当前行为并不总是希望节点与注释之间的关系为1：1。

考虑：

```java
// TODO: Fix this
// Super important method
public void doAllTheThings(){
...
}
```

在这种情况下，作为一个人，您可以轻松地理解TODO注释与方法声明有关； 但是，解析器会将其设为孤立对象，并且仅将以下行归为属性。

可以理解的是，图书馆的用户如何可能会对此有所不同。

在库开发的现阶段，我们主要是选择使用合理的默认值，而不是提供许多可配置的选项，因为它们本身可能会更加令人困惑。

在上述情况下，可以说程序员可以使用多行注释，我们可以避免该问题！ 

本身就是一个很好的练习； 看看是否可以识别出现在行注释连续多行，并使其成为一个单独的块注释。

## （注释属性）

一个节点最多可以有一个与之关联的注释，该注释在其注释字段中引用。

然后，您可能期望的注释类型将是LineComment，BlockComment或JavadocComment之一。

节点和注释之间的关系是双向的，因此Comment维护了commentedNode引用。

在尝试确定注释的归属位置时，首先要考虑注释的类型； 块和Javadoc样式的行为相同，但是行注释略有不同。

在归因期间，注释解析器将看起来将块或Javadoc样式注释分配给以下节点； 在同一行或后续行上。

另一方面，当行注释与另一个节点出现在同一行时，行注释将被分配给它们之前的节点，而当行注释出现在自己的行中时，行注释将被分配给后一个节点。

但是，仅当注释“明智地”放置在两个标记之间时，以上内容才适用。

## 独立注释

我们在本书的其他章节中都谈到了这个概念，但是需要重复。

不能归因于树中特定节点的注释被视为孤立的。

通常，如果找不到您期望的节点的注释，则该注释将在其他地方成为孤立的。

最有可能在您期望的节点的父节点中。

考虑以下：

```java
// Orphaned 1
// Attributed 1
public class TimePrinterWithComments {

// Orphaned 2
// Attributed 2
public static void main(String args[]){
System.out.print(LocalDateTime.now());
}
// Orphaned 3
}
```

![image](https://user-images.githubusercontent.com/18375710/83344145-8c42be80-a335-11ea-8f59-ef02631c0755.png)

所有Node对象都专门通过以下方式公开其孤立注释：getOrphanComments; 但它们也将作为getAllContainedComments的一部分返回。

## 使用评论

与大多数情况一样，我们倾向于建议使用访客来满足您的需求，我们之前在快速入门一章中已经看到了一个示例。飞行访问。

如果您跳到本章，则应参考该章。

除了访问者之外，在代码中使用注释的另一个不错的选择是CompilationUnit的getAllContainedComments方法。

如果您正在执行的当前任务主要与注释，这为您提供了以注释为中心的代码视图。

从返回的列表中，您仍然可以通过commentedNode关系将其归因于AST中的Node。

除此之外，注释本身就是Node类型，因此它们是编译单元中的一等公民。

它们拥有与任何AST节点相同的信息。

有一些区别；他们不能将评论归因于他们并且没有孩子，但这应该很直观。

因此，一般而言，就检查和操作而言，您可以通过与其他任何节点类似的方式来使用它们。

## 解析选项

到目前为止，我们通常仅通过立即在StaticJavaParser类上调用静态解析方法来创建CompilationUnit。

这是因为假定解析器有许多合理的默认值。 

但是，在使用注释解析时，可以调整几个拨号盘。

### 关闭注释分析

默认情况下，注释分析是启用的，如果您决定禁用它，则可以提供ParserConfiguration的一个实例，其中setAttributeComments为false。

这样做将加快解析速度，尽管在处理单个源文件时这是不明显的，但是如果要解析大量文件，则应记住这一点。

```java
ParserConfiguration parserConfiguration = new ParserConfiguration().setAttributeComments(false);
StaticJavaParser.setConfiguration(parserConfiguration);
```

您可以使用的第二个选项使您可以控制是否考虑行号之前的注释。

考虑以下代码：

```java
class A {
 // Blah

    boolean f() { return false }
}
```

在这种情况下，如果启用了注释属性，则注释// Blah将归于方法f。

它是否真正属于该方法，或者它描述了后续行中将要发生的事情？

像许多事情一样，答案可能是“取决于”。

JavaParser提供的替代行为是将注释归因于包含节点。

在上述情况下，对于A类，将在orphanComments列表中显示为条目。

默认情况下，解析器将使用以前的将注释归因于下一个下一个节点的行为。

### 设置为孤立注释

如果您希望将其视为孤立注释，请使用以下配置。

```java
ParserConfiguration parserConfiguration = new ParserConfiguration().setDoNotAssignCommentsPrecedingEmptyLines(true);
```

# 注释实战

因此，这是一个有趣的小类，我们将其汇总在一起，以夸大围绕注释代码（无论发生什么情况的“监狱规则”）的早期观点。

信不信由你，这些实际上是更多我们见过的理智的例子。

让我们解释一下类本身，以便它不会分散我们在此处实际使用的内容（评论）的注意力。

与我们的类比类似，我们使用线程来竞争谁是第一个/最后一个写入控制台的人。

我们定义了一个简单的线程类，其中包含一个字段，该字段将成为每个线程的个人流行语。

当线程调用run时，它将打印其标语。 main方法使用不同的流行短语实例化三个不同的线程，然后调用start方法。

现在，大多数情况下，此代码将以您期望的方式运行，但不能保证！

尽管在一堂课中有如此多的评论特别令人讨厌，但这些案例确实出现了，有时可能会违反直觉。

```java
package com.github.houbb.javaparser.learn.chap3;

public class PrisonRules /* Maybe use Runnable? */ extends Thread {

    @Deprecated
    // What is
    // dibbs?
    private final String dibbs;

    public PrisonRules(final String dibbs) {
        this.dibbs = dibbs;
    }

    @Override // Is this really overridden?
    public void run() {
        System.out.println(dibbs);
    }

    public static void main(String[/* We should pass arguments in here */] args) {
        Thread t1 = new Thread(new PrisonRules("mine!") /* This should run first */);
        Thread t2 = new Thread(new PrisonRules("yoink!"));
        Thread t3 = new Thread(new PrisonRules("finders keepers!"));

        // Here Be Dragons
        t1/*(^_^)*/.start();
        t2/*(@_@)*/./*(¬_¬)*/start();
        /** We need more JavaDocs! */
        t3.start();

    }

}
```

ps: 这个注释无敌了。。


# Q: JavaParser 可以获取代码的注释信息吗

是的，JavaParser 可以用于获取Java代码中的注释信息。

JavaParser 解析Java源代码，并将其表示为抽象语法树（AST）。AST 包含了源代码的所有结构，包括注释。

您可以使用 JavaParser 的 API 来遍历 AST，并从中提取注释信息。

以下是一个简单的示例，演示了如何使用 JavaParser 获取Java代码中的注释：

```java
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.comments.Comment;

import java.io.File;

public class CommentExtractor {
    public static void main(String[] args) throws Exception {
        // 从文件中读取Java源代码
        File file = new File("Example.java");
        CompilationUnit cu = StaticJavaParser.parse(file);

        // 获取所有注释
        cu.getAllComments().forEach(comment -> {
            // 处理注释，例如打印注释内容
            System.out.println("Comment: " + comment.getContent());
        });
    }
}
```

在上述示例中，`cu.getAllComments()` 返回源代码中的所有注释。

您可以遍历这些注释并执行所需的操作，比如将其输出到控制台或保存到文件中。

请确保在代码中使用适当的异常处理，以便处理文件读取和解析时可能出现的异常情况。

# 参考资料

官方语法书

* any list
{:toc}