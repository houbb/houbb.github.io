---
layout: post
title:  ASM-22-Tree 向后兼容能力
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, tree-api, sh]
published: true
---

# 介绍

与核心API一样，ASM 4.0的树API中也引入了一种新机制，以确保在将来的ASM版本中向后兼容。

但是，这里再次不能单独通过ASM来确保此属性。

要求用户在编写自己的文章时遵循一些简单的准则
码。

本章的目的是介绍这些准则，并给出ASM树API中使用的内部机制的概念，以确保向后兼容。

# 指导方针

本节介绍了使用ASM树API时必须遵循的准则，以确保您的代码在以后的任何ASM版本中保持有效（按照5.1.1节中定义的约定）。

首先，如果您使用树API编写类生成器，则没有遵循的指南（与核心API一样）。 

您可以使用任何构造函数创建ClassNode和其他元素，并使用这些类的任何方法。

另一方面，如果您使用树API编写类分析器或类适配器，即，如果您使用ClassNode或通过 `ClassReader.accept()` 直接或间接填充的其他类似类，或者重写了这些类，那么您必须遵循以下几条准则。

# Basic rules

## 创建类节点

我们在这里考虑以下情况：

创建一个ClassNode，通过ClassReader填充它，然后分析或转换它，然后再选择使用ClassWriter编写结果（其他节点类的讨论和准则是相同的；分析或转换ClassNode 由其他人创建的内容将在下一部分中讨论）。

在这种情况下，只有一个准则：

### 准则3：

要使用ASM版本X的树API编写类分析器或适配器，请使用具有该确切版本作为参数的构造函数（而不是没有参数的默认构造函数）来创建ClassNode。

本指南的目标是在通过ClassReader（在向后兼容性合同中定义）填充ClassNode时，遇到未知功能时立即引发错误。

如果不遵循它，则您的分析或转换代码可能会在以后遇到未知元素时失败，或者可能会成功，但会产生错误结果，因为它不应该忽略这些未知元素。

换句话说，如果不遵守该准则，则可能无法确保合同的最后条款。

这是如何运作的？ 在内部，ClassNode在ASM 4.0中实现如下（我们在此重用5.1.2节的示例）：

```java
public class ClassNode extends ClassVisitor {
    public ClassNode() {
        super(ASM4, null);
    }

    public ClassNode(int api) {
        super(api, null);
    }
    ...
    public void visitSource(String source, String debug) {
        // store source and debug in local fields ...
    }
}
```

在ASM 5.0中，此代码变为：

```java
public class ClassNode extends ClassVisitor {
    ...
    public void visitSource(String source, String debug) {
        if (api < ASM5) {
            // store source and debug in local fields ...
        } else {
            visitSource(null, source, debug);
        }
    }

    public void visitSource(Sring author, String source, String debug) {
        if (api < ASM5) {
            if (author == null)
                visitSource(source, debug);
            else
                throw new RuntimeException();
        } else {
            // store author, source and debug in local fields ...
        }
    }

    public void visitLicense(String license) {
        if (api < ASM5) throw new RuntimeException();
        // store license in local fields ...
    }
}
```

如果使用ASM 4.0，则创建ClassNode（ASM4）并没有什么特别的。

但是，如果升级到ASM 5.0，而无需更改代码，则将获得ClassNode 5.0，其api字段将为 `ASM4 < ASM5`。

然后很容易看到，如果输入类包含非null的author或license属性，则按照我们的合同中的定义，通过ClassReader填充ClassNode将失败。

如果还升级代码，将api字段更改为ASM5并更新其余代码以考虑这些新属性，则在填充节点时不会引发任何错误。

请注意，ClassNode 5.0代码与ClassVisitor 5.0代码非常相似。

如果定义ClassNode的子类（类似于ClassVisitor的子类-参见10.2.2节），则可以确保语义正确。


## 使用现有的类节点

如果您的类分析器或适配器收到了其他人创建的ClassNode，则不能确定创建时已传递给其构造函数的ASM版本。

您可以自己检查api字段，但是如果您发现此版本高于您支持的版本，则仅拒绝该类将太保守。

确实，此类可能不包含任何未知功能。

另一方面，您无法测试是否存在未知功能（在我们的示例场景中，由于您不知道，在编写用于ASM 4.0的代码时，如何测试您的ClassNode中不存在未知许可证字段？ 在现阶段是否会在将来添加这样的字段？）。

`ClassNode.check()` 方法旨在解决此问题。

这导致了以下准则：

### 准则4：

准则4：使用其他人创建的ClassNode，使用ASM版本X的树API编写类分析器或适配器，在以任何方式使用ClassNode之前，以其确切版本作为参数调用其 check() 方法。

目标与准则3相同：如果不遵循该准则，则可能无法确保合同的最后条款。

在内部，检查方法是在ASM 4.0中实现的

```java
public class ClassNode extends ClassVisitor {
    ...
    public void check(int api) {
    // nothing to do
    }
}
```

In ASM 5.0 this code becomes:

```java
public class ClassNode extends ClassVisitor {
    ...
    public void check(int api) {
        if (api < ASM5 && (author != null || license != null)) {
            throw new RuntimeException();
        }
    }
}
```

如果您的代码是针对ASM 4.0编写的，并且如果您获得的ClassNode 4.0（其api字段为ASM4），则不会出现问题，并且检查不执行任何操作。

但是，如果您获得ClassNode 5.0，则如果该节点实际上包含非空作者或许可证，即如果它包含ASM 4.0中未知的新功能，则check（ASM4）方法将失败。

### 注意

如果您自己创建ClassNode，也可以使用此准则。

然后，您无需遵循准则3，即无需在ClassNode构造函数中指定ASM版本。

这些检查将改为在check方法中进行（但是，这可能会比填充ClassNode时进行更早的检查效率低）。


# 继承规则

如果要提供ClassNode的子类或其他类似的节点类，则适用准则1和2。

请注意，在特殊情况下（通常使用）重写了 `visitEnd()` 方法的MethodNode匿名子类：

```java
class MyClassVisitor extends ClassVisitor {
    ...
    public MethodVisitor visitMethod(...) {
        final MethodVisitor mv = super.visitMethod(...);
        if (mv != null) {
            return new MethodNode(ASM4) {
                public void visitEnd() {
                    // perform a transformation
                accept(mv);
                }
            }
        }
        return mv;
    }
}
```

则准则2将自动执行（尽管匿名类未明确声明为final，但不能重写该匿名类）。 

您只需要遵循准则3，即在MethodNode构造函数中指定ASM版本（或遵循准则4，即在执行转换之前调用check（ASM4））。

# 其他包

每个构造函数的 asm.util 和 asm.commons 中的类都有两个变体：

一个带有ASM版本参数，一个带有ASM版本参数。

如果您只想实例化和使用asm.util中的ASMifier，Textifier或CheckXxxAdapter类，或者asm.commons包中的任何类，则可以使用不带ASM版本的构造函数实例化它们
参数。

您也可以使用带有ASM版本参数的构造函数，但这不必要地将这些组件限制为指定的ASM版本（使用no-arg构造函数等效于说“使用最新的ASM版本”）。

这就是为什么将使用ASM版本参数的构造函数声明为受保护的原因。

另一方面，如果您要覆盖ASMifier，TextifierVisitor， 或asm.util中的CheckXxxAdapter类，或asm.commons包中的任何类，则适用准则1和2。

特别是，您的构造函数必须使用要用作参数的ASM版本调用super（...）。

最后，如果要使用vs.覆盖asm.tree.analysis中的Interpreter类或其子类，则必须进行相同的区分。

还要注意，在使用分析包之前，您必须创建一个MethodNode或从其他人那里获得一个MethodNode，并且在将此节点传递到Analyzer之前，必须在此处使用准则3和4。

# 个人感受

代码之间的兼容性是一件非常重要的事情。


# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)

* any list
{:toc}