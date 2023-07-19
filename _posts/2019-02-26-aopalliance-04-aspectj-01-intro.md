---
layout: post
title: aspectj-01-Introduction to AspectJ
date:  2019-2-26 09:48:47 +0800
categories: [Java]
tags: [java, aop, sh]
published: true
---

# 概述

本编程指南描述了 AspectJ 语言。 配套指南描述了 AspectJ 开发环境中的工具。

如果您对 AspectJ 完全陌生，您应该首先阅读 AspectJ 入门，以获取 AspectJ 编程的广泛概述。 

如果您已经熟悉 AspectJ，但想要更深入地了解，您应该阅读 AspectJ 语言并查看本章中的示例。 

如果您想要 AspectJ 的更正式的定义，您应该阅读 [Semantics](https://eclipse.dev/aspectj/doc/released/progguide/semantics.html)。

# Preface

本编程指南做了三件事。 它

- 介绍 AspectJ 语言

- 定义每个 AspectJ 的构造及其语义，以及

- 提供了它们的使用示例。

它包括提供 AspectJ 语法参考的附录、AspectJ 语义的更正式描述以及有关 AspectJ 实现的注释的描述。

第一部分“AspectJ 入门”提供了编写 AspectJ 程序的简要概述。 它还展示了如何分阶段将 AspectJ 引入到现有的开发工作中，从而降低相关风险。 

如果这是您第一次接触 AspectJ 并且您想了解 AspectJ 的全部内容，那么您应该阅读本节。

第二部分“AspectJ 语言”更详细地介绍了该语言的功能，并使用代码片段作为示例。 涵盖了该语言的所有基础知识，阅读本节后，您应该能够正确使用该语言。

下一节“示例”包含一组完整的程序，它们不仅显示正在使用的功能，还尝试说明推荐的实践。 您应该在熟悉 AspectJ 的元素后阅读本节。

最后，有两章，一章是习语，一章是陷阱。

后面的内容包含几个附录，其中涵盖了该语言语法的 AspectJ 快速参考、对其语义的更深入的介绍以及对其实现注释所享有的自由度的描述。

# 介绍

许多软件开发人员都被面向方面编程 (AOP) 的理念所吸引，但不确定如何开始使用该技术。 

他们认识到横切关注点的概念，并且知道他们过去在实施此类关注点时遇到过问题。 

但如何在开发过程中采用AOP还有很多问题。 

常见问题包括：

- 我可以在现有代码中使用方面吗？

- 我可以通过使用方面获得哪些好处？

- 如何在我的程序中找到方面？

- AOP 的学习曲线有多陡？

- 使用这项新技术有哪些风险？

本章在 AspectJ 的背景下解决这些问题：AspectJ：Java 的通用面向方面扩展。 

一系列简短的示例说明了程序员可能希望使用 AspectJ 实现的方面类型以及与这样做相关的好处。 

想要更详细地了解这些示例，或者想要学习如何对此类示例进行编程的读者，可以从 AspectJ 网站 (http://eclipse.org/aspectj) 链接找到更完整的示例和支持材料。

采用任何新技术的一个重大风险是进展太快。 

对这种风险的担忧导致许多组织对采用新技术持保守态度。 

为了解决这个问题，本章中的示例分为三大类，其中更容易采用到本章前面的现有开发项目中的方面。 

下一节“AspectJ 简介”中，我们将介绍 AspectJ 的核心功能，而在“开发方面”中，我们将介绍有助于执行应用程序的调试、测试和性能调整等任务的方面。 

并且，在下面的“生产方面”部分中，我们介绍了实现 Java 应用程序中常见的横切功能的方面。 我们将推迟讨论第三类切面（可重用切面），直到 AspectJ 语言。

这些类别是非正式的，这种排序并不是采用 AspectJ 的唯一方法。 

一些开发人员可能想立即使用生产方面。 

但我们对当前 AspectJ 用户的经验表明，这是一种可以让开发人员快速获得 AOP 技术经验（并从中受益）的订购，同时还能最大限度地降低风险。

# AspectJ简介

本节简要介绍本章后面使用的 AspectJ 的功能。 

这些功能是该语言的核心，但这绝不是 AspectJ 的完整概述。

这些功能是使用简单的图形编辑器系统来呈现的。 

图形由许多图形元素组成，这些图形元素可以是点或线。 

Figure 类提供工厂服务。 还有一个显示器。 本章后面的大多数示例程序也基于该系统。

![uml](https://eclipse.dev/aspectj/doc/released/progguide/figureUML.gif)

AspectJ（以及面向方面的编程）的动机是认识到传统编程方法无法很好地捕获一些问题或关注点。 

考虑在某些应用程序中执行安全策略的问题。 

就其本质而言，安全性跨越了应用程序模块化的许多自然单元。 

此外，随着应用程序的发展，安全策略必须统一应用于任何添加。 

正在应用的安全策略本身可能会演变。 

在传统编程语言中，以严格的方式捕获安全策略等问题非常困难且容易出错。

安全性等问题跨越了模块化的自然单元。 对于面向对象的编程语言，模块化的自然单位是类。 

但在面向对象的编程语言中，横切关注点并不容易转化为类，因为它们跨越了类，因此它们不可重用，无法细化或继承，它们以无纪律的方式散布在程序中，简而言之，它们很难使用。

面向方面编程是一种模块化横切关注点的方法，就像面向对象编程是一种模块化常见关注点的方法一样。 

AspectJ 是 Java 面向方面编程的实现。

AspectJ 向 Java 添加的只是一个新概念，即连接点 —— 这实际上只是现有 Java 概念的一个名称。 

它只向 Java 添加了一些新结构：切入点（join point）、建议（advice）、类型间声明和方面（inter-type declarations and aspects）。 

切入点和建议动态地影响程序流程，类型间声明静态地影响程序的类层次结构，而方面封装了这些新的构造。

连接点是程序流中定义明确的点。 切入点挑选出某些连接点和这些点上的值。 一条建议是到达连接点时执行的代码。 这些是 AspectJ 的动态部分。

AspectJ 还具有不同类型的类型间声明，允许程序员修改程序的静态结构，即其类的成员以及类之间的关系。

AspectJ 的方面是横切关注点的模块化单元。 它们的行为有点像 Java 类，但也可能包括切入点、建议和类型间声明。

在接下来的部分中，我们首先将了解连接点以及它们如何组成切入点。 

然后我们将查看通知，即到达切入点时运行的代码。 

我们将了解如何将切入点和建议结合到方面（AspectJ 的可重用、可继承的模块化单元）中。 

最后，我们将了解如何使用类型间声明来处理程序类结构的横切关注点。

## 动态连接点模型(The Dynamic Join Point Model)

任何面向方面的语言设计中的一个关键元素是连接点模型。 

连接点模型提供了通用的参考框架，使得定义横切关注点的动态结构成为可能。 

本章介绍AspectJ的动态连接点，其中连接点是程序执行过程中某些明确定义的点。

AspectJ 提供了多种连接点，但本章仅讨论其中一种：方法调用连接点（method call join points）。 

方法调用连接点包含接收方法调用的对象的操作。 

它包括构成方法调用的所有操作，从计算所有参数开始，直到返回（通常或通过抛出异常）。

运行时的每个方法调用都是不同的连接点，即使它来自程序中的相同调用表达式。 

许多其他连接点可能会在方法调用连接点执行时运行 - 执行方法主体时以及从主体调用的那些方法中发生的所有连接点。 

我们说这些连接点在原始调用连接点的动态上下文中执行。

## Pointcuts

在 AspectJ 中，切入点挑选出程序流中的某些连接点。 

例如，切入点

```java
call(void Point.setX(int))
```

挑选出每个连接点，该连接点是对具有签名 `void Point.setX(int)` 的方法的调用，即具有单个 int 参数的 Point 的 void setX 方法。

可以使用 and、or 和 not（拼写为 `&&、|| 、！`）从其他切入点构建切入点。 

例如：

```java
call(void Point.setX(int)) || call(void Point.setY(int))
```

挑选出每个连接点，该连接点要么是对 setX 的调用，要么是对 setY 的调用。

切入点可以识别许多不同类型的连接点——换句话说，它们可以横切类型。 

例如，

```java
call(void FigureElement.setXY(int,int)) ||
call(void Point.setX(int))              ||
call(void Point.setY(int))              ||
call(void Line.setP1(Point))            ||
call(void Line.setP2(Point));
```

挑选出每个连接点，该连接点是对五个方法之一的调用（顺便说一句，第一个方法是接口方法）。

在我们的示例系统中，当 FigureElement 移动时，该切入点捕获所有连接点。 

虽然这是指定此横切关注点的有用方法，但它有点拗口。 

因此，AspectJ 允许程序员使用切入点形式定义自己的命名切入点。 

因此，下面声明了一个新的、命名的切入点：

```java
pointcut move():
    call(void FigureElement.setXY(int,int)) ||
    call(void Point.setX(int))              ||
    call(void Point.setY(int))              ||
    call(void Line.setP1(Point))            ||
    call(void Line.setP2(Point));
```

只要这个定义可见，程序员就可以简单地使用 move() 来捕获这个复杂的切入点。

前面的切入点都是基于一组方法签名的显式枚举。 我们有时称其为基于名称的横切。 

AspectJ 还提供了一些机制，可以根据方法的属性而不是其确切名称来指定切入点。 我们称之为基于属性的横切。 其中最简单的是在方法签名的某些字段中使用通配符。 

例如，切入点

```java
call(void Figure.make*(..))
```

挑选出每个连接点，该连接点是对Figure 上定义的 void 方法的调用，该方法的名称以“make”开头，无论该方法的参数如何。 

在我们的系统中，它会挑选出对工厂方法 makePoint 和 makeLine 的调用。 

切入点 `call(public * Figure.* (..))` 挑选出对Figure 的公共方法的每次调用。

但通配符并不是 AspectJ 支持的唯一属性。 

另一个切入点 cflow 根据连接点是否出现在其他连接点的动态上下文中来识别连接点。 

所以 `cflow(move())` 挑选出由 move()（我们上面定义的命名切入点）挑选出的连接点的动态上下文中出现的每个连接点。 

因此，这会挑选出调用 move 方法和返回（正常或抛出异常）之间发生的每个连接点。

## Advice

所以切入点挑选出连接点。 

但除了挑选连接点之外，他们什么也不做。 

为了实际实现横切行为，我们使用 Advice。 Advice 将切入点（以挑选出连接点）和代码体（以在每个连接点处运行）结合在一起。

AspectJ 有几种不同类型的建议。 

在到达连接点时运行建议之前，在程序继续处理连接点之前。 

例如，关于方法调用连接点的建议在实际方法开始运行之前运行，就在方法调用的参数计算之后。

```java
before(): move() {
    System.out.println("about to move");
}
```

关于特定连接点的建议在程序继续该连接点后运行。 

例如，关于方法调用连接点的建议在方法主体运行之后、控制权返回给调用者之前运行。 

因为 Java 程序可以“正常”或通过抛出异常来离开连接点，所以存在三种类型的后通知：返回后、抛出后和普通后（在返回或抛出后运行，就像 Java 的 finally）。

```java
after() returning: move() {
    System.out.println("just successfully moved");
}
```

关于连接点的周围建议在到达连接点时运行，并且可以明确控制程序是否继续处理连接点。 本节不讨论周围建议。

### 在切入点中公开上下文 Exposing Context in Pointcuts

切入点不仅挑选出连接点，它们还可以在连接点处公开部分执行上下文。 切入点公开的值可以在通知声明的正文中使用。

建议声明有一个参数列表（如方法），为它使用的所有上下文片段提供名称。 

例如，之后的建议

```java
after(FigureElement fe, int x, int y) returning:
        ...SomePointcut... {
    ...SomeBody...
}
```

使用三个公开的上下文，一个名为 fe 的FigureElement，以及两个名为 x 和 y 的 int。

建议的正文使用与方法参数一样的名称，因此

```java
after(FigureElement fe, int x, int y) returning:
        ...SomePointcut... {
    System.out.println(fe + " moved to (" + x + ", " + y + ")");
}
```

建议的切入点发布建议参数的值。 

三个原始切入点 this、target 和 args 用于发布这些值。 

现在我们可以写出完整的建议：

```java
after(FigureElement fe, int x, int y) returning:
        call(void FigureElement.setXY(int, int))
        && target(fe)
        && args(x, y) {
    System.out.println(fe + " moved to (" + x + ", " + y + ")");
}
```

切入点公开了对 setXY 的调用的三个值：目标FigureElement（它发布为 fe，因此它成为后通知的第一个参数）和两个 int 参数（它发布为 x 和 y，因此它们成为后通知的第二个和第三个参数）。

因此，建议在每次 setXY 方法调用后打印已移动的图形元素及其新的 x 和 y 坐标。

命名切入点可能有参数，例如一条建议。 当使用命名切入点（通过建议或在另一个命名切入点）时，它会按名称发布其上下文，就像 this、target 和 args 切入点一样。 

所以上述建议的另一种写法是

```java
pointcut setXY(FigureElement fe, int x, int y):
    call(void FigureElement.setXY(int, int))
    && target(fe)
    && args(x, y);

after(FigureElement fe, int x, int y) returning: setXY(fe, x, y) {
    System.out.println(fe + " moved to (" + x + ", " + y + ").");
}
```

## Inter-type declarations

AspectJ 中的类型间声明是跨越类及其层次结构的声明。 

他们可能会声明跨越多个类的成员，或者改变类之间的继承关系。 

与主要动态运行的建议不同，引入在编译时静态运行。

考虑表达一些现有类共享的功能的问题，这些现有类已经是类层次结构的一部分，即它们已经扩展了一个类。 

在 Java 中，创建一个捕获这一新功能的接口，然后向每个受影响的类添加一个实现该接口的方法。

AspectJ 可以通过使用类型间声明在一处表达关注点。 

该方面声明实现新功能所需的方法和字段，并将这些方法和字段与现有类相关联。

假设我们想让 Screen 对象观察 Point 对象的变化，其中 Point 是一个现有的类。 

我们可以通过编写一个方面来实现这一点，声明类 Point Point 有一个实例字段观察者，它跟踪正在观察点的 Screen 对象。

```java
aspect PointObserving {
    private Vector Point.observers = new Vector();
    ...
}
```

观察者字段是私有的，因此只有 PointObserving 可以看到它。 

因此，可以使用方面的静态方法 addObserver 和 removeObserver 添加或删除观察者。

```java
aspect PointObserving {
    private Vector Point.observers = new Vector();

    public static void addObserver(Point p, Screen s) {
        p.observers.add(s);
    }
    public static void removeObserver(Point p, Screen s) {
        p.observers.remove(s);
    }
    ...
}
```

除此之外，我们还可以定义一个切入点更改来定义我们想要观察的内容，而后通知则定义当我们观察到更改时我们想要做什么。

```java
aspect PointObserving {
    private Vector Point.observers = new Vector();

    public static void addObserver(Point p, Screen s) {
        p.observers.add(s);
    }
    public static void removeObserver(Point p, Screen s) {
        p.observers.remove(s);
    }

    pointcut changes(Point p): target(p) && call(void Point.set*(int));

    after(Point p): changes(p) {
        Iterator iter = p.observers.iterator();
        while ( iter.hasNext() ) {
            updateObserver(p, (Screen)iter.next());
        }
    }

    static void updateObserver(Point p, Screen s) {
        s.display(p);
    }
}
```

请注意，Screen 和  Point 的代码都不需要修改，并且支持此新功能所需的所有更改都是此方面的本地更改。

## Aspects

方面将切入点、建议和类型间声明包装在横切实现的模块化单元中。 

它的定义非常类似于类，除了横切成员之外，还可以具有方法、字段和初始值设定项。 

因为只有方面可能包括这些横切成员，所以这些效果的声明是本地化的。

与类一样，方面可以被实例化，但 AspectJ 控制实例化的发生方式——因此您不能使用 Java 的新形式来构建新的方面实例。 

默认情况下，每个方面都是单例，因此会创建一个方面实例。 这意味着如果需要保持状态，建议可以使用方面的非静态字段：

```java
aspect Logging {
    OutputStream logStream = System.err;

    before(): move() {
        logStream.println("about to move");
    }
}
```

方面还可能有更复杂的实例化规则，但这些将在后面的章节中描述。

# 参考资料

https://eclipse.dev/aspectj/doc/released/progguide/index.html

* any list
{:toc}