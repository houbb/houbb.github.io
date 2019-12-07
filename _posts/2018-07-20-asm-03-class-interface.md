---
layout: post
title:  ASM-03-classes Interface
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, sh]
published: true
---

# 接口和组件

# 介绍

用于生成和转换已编译类的ASM API基于ClassVisitor抽象类（请参见图2.4）。 

此类中的每个方法都对应于同名的类文件结构部分（请参见图2.1）。

通过单个方法调用可以访问简单部分，该方法的参数描述其内容，并返回void。 

可以通过返回辅助访问者类的初始方法调用来访问其内容可以具有任意长度和复杂度的节。

visitAnnotation，visitField和visitMethod方法就是这种情况，它们分别返回AnnotationVisitor，FieldVisitor和MethodVisitor。

这些辅助类递归使用相同的原理。 

例如，FieldVisitor抽象类中的每个方法（请参见图2.5）对应于具有相同名称的类文件子结构，visitAnnotation 也是如此。

## 接口简介

- Figure 2.4.: The ClassVisitor class

```java
public abstract class ClassVisitor {
    public ClassVisitor(int api);
    public ClassVisitor(int api, ClassVisitor cv);
    public void visit(int version, int access, String name,
    String signature, String superName, String[] interfaces);
    public void visitSource(String source, String debug);
    public void visitOuterClass(String owner, String name, String desc);
    AnnotationVisitor visitAnnotation(String desc, boolean visible);
    public void visitAttribute(Attribute attr);
    public void visitInnerClass(String name, String outerName,
    String innerName, int access);
    public FieldVisitor visitField(int access, String name, String desc,
    String signature, Object value);
    public MethodVisitor visitMethod(int access, String name, String desc,
    String signature, String[] exceptions);
    void visitEnd();
}
```

与ClassVisitor中一样，返回一个辅助AnnotationVisitor。 

创作这些辅助访问者的用法将在下一章中说明：

实际上，本章仅限于可以通过ClassVisitor类解决的简单问题。

- Figure 2.5.: The FieldVisitor class

```java
public abstract class FieldVisitor {
    public FieldVisitor(int api);
    public FieldVisitor(int api, FieldVisitor fv);
    public AnnotationVisitor visitAnnotation(String desc, boolean visible);
    public void visitAttribute(Attribute attr);
    public void visitEnd();
}
```

必须按照该类的Javadoc中指定的以下顺序调用ClassVisitor类的方法：

```java
visit visitSource? visitOuterClass? ( visitAnnotation | visitAttribute )*
( visitInnerClass | visitField | visitMethod )*
visitEnd
```

这意味着必须先调用访问，然后最多调用一次visitSource，然后最多一次调用visitOuterClass，然后按任意顺序按任意顺序访问任意多个visitAnnotation和visitAttribute，然后按任意顺序任意多次调用 访问visitInnerClass，visitField和visitMethod，并通过单次调用visitEnd终止。

## 核心组件类

ASM提供了三个基于ClassVisitor API的核心组件来生成和转换类：

### ClassReader

ClassReader 类解析作为字节数组给出的已编译类，并在作为参数传递给其accept方法的ClassVisitor实例上调用相应的visitXxx方法。 可以将其视为事件产生器。

### ClassWriter

ClassWriter类是ClassVisitor抽象类的子类，该类直接以二进制形式构建编译的类。 

它产生一个包含已编译类的字节数组作为输出，可以使用toByteArray方法进行检索。 

可以将其视为事件消费者。

### ClassVisitor

ClassVisitor 类将其接收的所有方法委托给另一个ClassVisitor实例。 

可以将其视为事件过滤器。

下一节将通过具体示例显示如何使用这些组件来生成和转换类。

TODO：...


# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)

* any list
{:toc}