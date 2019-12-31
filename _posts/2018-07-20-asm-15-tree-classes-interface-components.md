---
layout: post
title:  ASM-15-Tree Classes Interface and Components
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, tree-api, sh]
published: true
---

# 本章简介

本章介绍如何使用ASM树API生成和转换类。

它从仅介绍tree API入手，然后进行说明如何与核心API组合在一起。 

在下一章中将说明用于方法，注解和泛型内容的树形API。

# Interfaces and components

# Presentation（介绍）

## 类节点信息

用于生成和转换已编译Java类的ASM树API基于ClassNode类（请参见图6.1）。

- Figure 6.1.: The ClassNode class (only fields are shown)

```java
public class ClassNode ... {
    public int version;
    public int access;
    public String name;
    public String signature;
    public String superName;
    public List<String> interfaces;
    public String sourceFile;
    public String sourceDebug;
    public String outerClass;
    public String outerMethod;
    public String outerMethodDesc;
    public List<AnnotationNode> visibleAnnotations;
    public List<AnnotationNode> invisibleAnnotations;
    public List<Attribute> attrs;
    public List<InnerClassNode> innerClasses;
    public List<FieldNode> fields;
    public List<MethodNode> methods;
}
```

如您所见，该类的公共字段与图2.1中显示的类文件结构部分相对应。

这些字段的内容与核心API中的内容相同。

ps: 这里是 asm 的两种访问模式，所以信息是一一对应的。

例如，实例名称是内部名称，签名是类签名（请参见2.1.2和4.1节）。

一些字段包含其他Xxx Node类：这些类将在下一章中详细介绍，它们具有类似的结构，即具有与类文件结构的子部分相对应的字段。

## 字段节点

例如，FieldNode类如下所示：

```java
public class FieldNode ... {
    public int access;
    public String name;
    public String desc;
    public String signature;
    public Object value;
    public FieldNode(int access, String name, String desc,
    String signature, Object value) {
    ...
    }
    ...
}
```

## 方法节点

类似

```java
public class MethodNode ... {
    public int access;
    public String name;
    public String desc;
    public String signature;
    public List<String> exceptions;
    ...
    public MethodNode(int access, String name, String desc,
    String signature, String[] exceptions)
    {
    ...
    }
}
```

# 生成类

使用树API生成类仅包括创建ClassNode对象和初始化其字段。

例如，可以按如下方式构建2.2.3节中的Comparable接口，并使用与2.2.3节中大致相同的代码量：

```java
ClassNode cn = new ClassNode();
cn.version = V1_5;
cn.access = ACC_PUBLIC + ACC_ABSTRACT + ACC_INTERFACE;
cn.name = "pkg/Comparable";
cn.superName = "java/lang/Object";
cn.interfaces.add("pkg/Mesurable");
cn.fields.add(new FieldNode(ACC_PUBLIC + ACC_FINAL + ACC_STATIC,
"LESS", "I", null, new Integer(-1)));
cn.fields.add(new FieldNode(ACC_PUBLIC + ACC_FINAL + ACC_STATIC,
"EQUAL", "I", null, new Integer(0)));
cn.fields.add(new FieldNode(ACC_PUBLIC + ACC_FINAL + ACC_STATIC,
"GREATER", "I", null, new Integer(1)));
cn.methods.add(new MethodNode(ACC_PUBLIC + ACC_ABSTRACT,
"compareTo", "(Ljava/lang/Object;)I", null, null));
```

与使用核心API相比，使用树API生成类要花费大约30％的时间（请参阅附录A.1），并消耗更多的内存。

但这使以任何顺序生成类元素成为可能，这在某些情况下很方便。

# 添加或者移除类成员变量

添加和删除类成员只是在ClassNode对象的字段或方法列表中添加或删除元素。

例如，如果我们按以下方式定义ClassTransformer类，则可以轻松组成类转换器：

```java
public class ClassTransformer {
    protected ClassTransformer ct;
    
    public ClassTransformer(ClassTransformer ct) {
        this.ct = ct;
    }

    public void transform(ClassNode cn) {
        if (ct != null) {
            ct.transform(cn);
        }
    }
}
```

## 移除方法

然后可以按以下方式实现2.2.5节中的RemoveMethodAdapter：

```java
public class RemoveMethodTransformer extends ClassTransformer {
    private String methodName;
    private String methodDesc;

    public RemoveMethodTransformer(ClassTransformer ct,
        String methodName, String methodDesc) {
        super(ct);
        this.methodName = methodName;
        this.methodDesc = methodDesc;
    }

    @Override 
    public void transform(ClassNode cn) {
        Iterator<MethodNode> i = cn.methods.iterator();
        while (i.hasNext()) {
            MethodNode mn = i.next();
            if (methodName.equals(mn.name) && methodDesc.equals(mn.desc)) {
                i.remove();
            }
        }
        super.transform(cn);
    }
}
```

可以看出，**与核心API的主要区别在于，您需要遍历所有方法，而无需使用核心API进行迭代（这是在ClassReader中完成的）**。

实际上，这种差异对于几乎所有基于树的转换都是有效的。

## 新增字段

例如，在使用树形API实现时，第2.2.6节的AddFieldAdapter也需要一个迭代器：

```java
public class AddFieldTransformer extends ClassTransformer {
    private int fieldAccess;
    private String fieldName;
    private String fieldDesc;

    public AddFieldTransformer(ClassTransformer ct, int fieldAccess,
        String fieldName, String fieldDesc) {
        super(ct);
        this.fieldAccess = fieldAccess;
        this.fieldName = fieldName;
        this.fieldDesc = fieldDesc;
    }

    @Override 
    public void transform(ClassNode cn) {
        boolean isPresent = false;
        for (FieldNode fn : cn.fields) {
            if (fieldName.equals(fn.name)) {
                isPresent = true;
                break;
            }
        }
        if (!isPresent) {
            cn.fields.add(new FieldNode(fieldAccess, fieldName, fieldDesc,
            null, null));
        }
        super.transform(cn);
    }
}
```

# 二者的区别

就像用于类生成一样，与使用核心API相比，**使用树API转换类会花费更多的时间并消耗更多的内存。但这使得更容易实现某些转换成为可能。**

例如，在将包含其内容的数字签名的注解添加到类的转换就是这种情况。

使用核心API，仅当访问了所有类时才可以计算数字签名，但是添加包含它的注解为时已晚，因为必须在访问注解之前的类成员。

使用tree API时，此问题消失了，因为在这种情况下没有这种约束。

实际上，可以使用核心API来实现AddDigitialSignature示例，但随后必须通过两次转换来转换类。

在第一阶段中，使用ClassReader（而不使用ClassWriter）访问该类，以便基于该类内容计算数字签名。

在第二遍中，相同的ClassReader被重用以再次访问该类，这一次是将AddAnnotationAdapter链接到ClassWriter。

通过概括此论点，我们看到，实际上，可以单独使用核心API进行任何转换，必要时可以使用多次传递。

但是，这增加了转换代码的复杂性，这需要在遍之间存储状态（这可能像完整的树表示一样复杂！），并且多次解析类会产生一定的开销，必须将该开销与构造相应的开销进行比较。类节点。

结论是，**树API通常用于无法使用核心API一次性完成的转换。**

但是当然也有例外。

例如，一个混淆器不能一次实现，因为您不能在完全构造从原始名称到混淆名称的映射之前转换类，而这需要解析所有类。

但是树API也不是一个好的解决方案，因为它需要将所有类的对象表示保留在内存中以进行混淆。

在这种情况下，最好通过两次使用核心API：

一次计算原始名称和混淆名称之间的映射（一个简单的哈希表，比所有类的完整对象表示所需的内存少得多），以及一次转换基于此映射的类。


# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)


* any list
{:toc}