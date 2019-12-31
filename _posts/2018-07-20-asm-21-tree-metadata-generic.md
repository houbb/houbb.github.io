---
layout: post
title:  ASM-21-Metadata Generic Annotation Debug  
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, tree-api, sh]
published: true
---

# 元数据

本章介绍了用于已编译Java类元数据（例如注解）的树API。

之所以很短，是因为这些元数据已经在第4章中介绍过，并且因为一旦知道了相应的 core API，树API就很简单。

# 泛型

**树API不提供对泛型类型的任何支持！**

确实，它代表了带有签名的泛型类型，就像在核心API中一样，但是没有提供与SignatureVisitor对应的SignatureNode类，尽管这是可能的（实际上，使用多个Node类来区分类型，方法和类会很方便。 签名）。


# 注解

用于注解的树形API基于AnnotationNode类，其公共API如下：

```java
public class AnnotationNode extends AnnotationVisitor {
    public String desc;
    public List<Object> values;
    public AnnotationNode(String desc);
    public AnnotationNode(int api, String desc);
    ... // methods of the AnnotationVisitor interface
    public void accept(AnnotationVisitor av);
}
```

desc字段包含注解类型，而values字段包含名称值对，其中每个名称后均带有其关联的值（值的表示形式在Javadoc中进行了描述）。

如您所见，AnnotationNode类扩展了AnnotationVisitor类，并且还提供了一个accept方法，该方法将此类对象作为参数，例如ClassNode和MethodNode类以及类和方法访问者类。

因此，我们在类和方法上看到的模式也可以用于组成注释的核心和树API组件。

例如，基于继承的模式的“匿名内部类”变体（请参阅第7.2.2节）适用于注解，它给出：

```java
public AnnotationVisitor visitAnnotation(String desc, boolean visible) {
    return new AnnotationNode(ASM4, desc) {
        @Override public void visitEnd() {
            // put your annotation transformation code here
            accept(cv.visitAnnotation(desc, visible));
        }
    };
}
```

# 除错

编译类的源文件存储在ClassNode的sourceFile字段中。

有关源行号的信息存储在LineNumberNode对象中，该对象的类继承自AbstractInsnNode。

与核心API类似，在核心API中，与指令同时访问有关行号的信息，LineNumberNode对象是指令列表的一部分。

最后，源局部变量的名称和类型存储在MethodNode的localVariables字段中，该字段是LocalVariableNode对象的列表。


# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)

* any list
{:toc}