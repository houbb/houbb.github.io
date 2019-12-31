---
layout: post
title:  ASM-13-向后兼容守则
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, annotation, sh]
published: true
---

# 守则

本节介绍了使用核心ASM API时必须遵循的准则，以确保您的代码在将来的任何ASM版本中均保持有效（按照上述合同的意义）。

首先，如果您编写类生成器，则没有任何可遵循的准则。

例如，如果您为ASM 4.0编写了一个类生成器，则它可能会包含一个诸如 `visitSource(mySource, myDebug)` 之类的调用，当然也不会包含对visitLicense的调用。

如果使用ASM 5.0不变地运行它，它将调用不推荐使用的visitSource方法，但是ASM 5.0 ClassWriter会在内部将其重定向到visitSource（null，mySource，myDebug），从而产生
预期的结果（但效率要比升级代码以直接调用新方法低）。

同样，不存在对visitLicense的调用也不会出现问题（生成的类版本也不会更改，并且该版本的类也不应具有license属性）。

另一方面，如果您编写类分析器或类适配器，即，如果重写ClassVisitor类（或任何其他类似的类，如FieldVisitor或MethodVisitor），则必须遵循以下几条准则。

# 基本规则

我们在这里考虑直接扩展ClassVisitor的类的简单情况（其他访问者类的讨论和准则是相同的；下一部分将讨论间接子类的情况）。

在这种情况下，只有一个准则：

## 准则1

为ASM版本X编写ClassVisitor子类，以该确切版本作为参数调用ClassVisitor构造函数，然后永远不要覆盖或调用在此版本的ClassVisitor类中不推荐使用的方法（或在更高版本中引入的方法）。

就是这样。 

因此，在我们的示例场景（请参阅5.1.2节）中，为ASM 4.0编写的类适配器必须如下所示：

```java
class MyClassAdapter extends ClassVisitor {

public MyClassAdapter(ClassVisitor cv) {
    super(ASM4, cv);
}
...
public void visitSource(String source, String debug) { // optional
    ...
    super.visitSource(source, debug); // optional
    }
}
```

为ASM 5.0更新后，必须删除  ，因此类必须如下所示：

```java
class MyClassAdapter extends ClassVisitor {
    public MyClassAdapter(ClassVisitor cv) {
        super(ASM5, cv);
    }
    ...
    public void visitSource(String author,
    String source, String debug) { // optional
        ...
        super.visitSource(author, source, debug); // optional
    }
    public void visitLicense(String license) { // optional
        ...
        super.visitLicense(license); // optional
    }
}
```

这是如何运作的？

在内部，ClassVisitor在ASM 4.0中的实现如下：

```java
public abstract class ClassVisitor {
    int api;
    ClassVisitor cv;
    public ClassVisitor(int api, ClassVisitor cv) {
        this.api = api;
        this.cv = cv;
    }
    ...

    public void visitSource(String source, String debug) {
        if (cv != null) cv.visitSource(source, debug);
    }
}
```

In ASM 5.0, this code becomes:

```java
public abstract class ClassVisitor {
    ...
    public void visitSource(String source, String debug) {
    if (api < ASM5) {
        if (cv != null) cv.visitSource(source, debug);
        } else {
        visitSource(null, source, debug);
        }
    }

    public void visitSource(Sring author, String source, String debug) {
        if (api < ASM5) {
        if (author == null) {
        visitSource(source, debug);
        } else {
        throw new RuntimeException();
        }
        } else {
        if (cv != null) cv.visitSource(author, source, debug);
        }
    }

    public void visitLicense(String license) {
    if (api < ASM5) throw new RuntimeException();
        if (cv != null) cv.visitSource(source, debug);
    }
}
```

如果MyClassAdapter 4.0扩展了ClassVisitor 4.0，则一切正常。

如果我们在不更改代码的情况下升级到ASM 5.0，则MyClassAdapter 4.0现在将扩展ClassVisitor 5.0。

但是api字段仍然是 `ASM4 < ASM5`，并且很容易看到在这种情况下，在调用 `visitSource(String, String)` 时，ClassVisitor 5.0的行为类似于ClassVisitor 4.0。

此外，如果使用空作者来调用新的visitSource方法，则该调用将被重定向到旧版本。

最后，如果在输入类中找到了非null的作者或许可证，则执行将失败，这将在我们的合同中定义（在新的visitSource方法中或在visitLicense中）。

如果我们升级到ASM 5.0，并同时更新我们的代码，则我们现在有了MyClassAdapter 5.0扩展了ClassVisitor 5.0。

api字段现在为ASM5，然后visitLicense和新的visitSource方法通过将调用委派给下一个访问者cv来表现。

此外，旧的visitSource方法现在将调用重定向到新的visitSource方法，以确保如果在转换链中在我们自己的适配器之前使用了旧的类适配器，则MyClassAdapter 5.0不会错过此访问事件。

ClassReader将始终调用每个访问方法的最新版本。因此，如果我们将MyClassAdapter 4.0与ASM 4.0一起使用，或者将MyClassAdapter 5.0与ASM 5.0一起使用，则不会发生间接调用。

只有当我们将MyClassAdapter 4.0与ASM 5.0一起使用时，ClassVisitor中才会发生间接访问（在新visitSource方法的第三行）。

因此，尽管旧代码仍可与新ASM版本一起使用，但运行速度会稍慢。

对其进行升级以使用新的API将恢复其性能。

# 继承规则

上面的指南对于ClassVisitor的直接子类或任何其他类似的类就足够了。 

对于间接子类，即，如果定义了继承ClassVisitor的子类A1，其本身被A2扩展，...本身被An扩展，则所有这些子类必须针对相同的ASM版本编写。

实际上，在继承链中混合使用不同的版本可能会导致同一方法的多个版本（例如visitSource（String，String）和visitSource（String，String，String））被同时覆盖，并且行为可能不同，从而导致错误 或无法预测的结果。

如果这些类来自不同的来源，每个来源独立更新并分别发布，则几乎无法确保此属性。

这导致了第二条准则：

## 准则2：

不要使用访问者的继承，而应使用委派（即访问者链）。

一个好的做法是默认情况下将您的访问者班级定为最终班，以确保这一点。

## 例外

实际上，该指南有两个例外：

(1) 如果您自己完全控制继承链，并在同一级别释放层次结构的所有类，则可以使用访问者的继承时间。

然后，您必须确保为相同的ASM版本编写层次结构中的所有类。

尽管如此，将层次结构的叶类定为最终类。

(2) 如果除叶子类之外没有其他类重写任何访问方法，则可以使用“访问者”的继承（例如，如果您在ClassVisitor和具体访问者类之间使用中间类只是为了引入便捷方法）。

仍然，使层次结构的叶类成为最终类（除非它们也不会覆盖任何visit方法；在这种情况下，请提供一个构造器，以ASM版本作为参数，以便子类可以指定为其编写的版本）。


# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)

* any list
{:toc}