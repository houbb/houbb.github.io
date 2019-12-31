---
layout: post
title:  ASM-16-组件组成
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, tree-api, sh]
published: true
---

# 组件组成 

到目前为止，我们只看到了如何创建和转换ClassNode对象，但是还没有看到如何从类的字节数组表示形式构造ClassNode，反之亦然，如何从ClassNode构造此字节数组。

实际上，这是通过组合核心API和树API组件来完成的，如本节所述。

# 介绍

除了图6.1中所示的字段之外，ClassNode类还扩展了ClassVisitor类，并且还提供了一个接受方法，该方法将ClassVisitor作为参数。

accept方法根据ClassNode字段值生成事件，而ClassVisitor方法执行相反的操作，即根据接收到的事件设置ClassNode字段：

```java
public class ClassNode extends ClassVisitor {
    ...
    public void visit(int version, int access, String name,
        String signature, String superName, String[] interfaces[]) {
        this.version = version;
        this.access = access;
        this.name = name;
        this.signature = signature;
        ...
    }

    ...
    public void accept(ClassVisitor cv) {
        cv.visit(version, access, name, signature, ...);
        ...
    }
}
```

## 构造方式

因此，可以通过将字节数组与ClassReader组合在一起来构造ClassNode，以使ClassReader组件消耗ClassReader生成的事件，从而对其字段进行初始化（从上面的代码可以看出） ：

```java
ClassNode cn = new ClassNode();
ClassReader cr = new ClassReader(...);
cr.accept(cn, 0);
```

通过将ClassNode与ClassWriter进行组合，可以对称地将ClassNode转换为其字节数组表示形式，这样ClassWriter就可以使用ClassNode的accept方法生成的事件：

```java
ClassWriter cw = new ClassWriter(0);
cn.accept(cw);
byte[] b = cw.toByteArray();
```

# 模式

通过将以下元素放在一起，可以使用tree API转换类：

```java
ClassNode cn = new ClassNode(ASM4);
ClassReader cr = new ClassReader(...);
cr.accept(cn, 0);
... // here transform cn as you want
ClassWriter cw = new ClassWriter(0);
cn.accept(cw);
byte[] b = cw.toByteArray();
```

先读取类的信息，然后转换，最后获取转换后的字节数组。

可以选择写入，或者根据其创建一个类。

## 结合使用

也可以将基于树的类转换器（例如类适配器）与核心API一起使用。

为此使用了两种常见模式。

### 继承

第一个使用继承：

```java
public class MyClassAdapter extends ClassNode {

    public MyClassAdapter(ClassVisitor cv) {
        super(ASM4);
        this.cv = cv;
    }

    @Override 
    public void visitEnd() {
        // put your transformation code here
        accept(cv);
    }

}
```

在经典转换链中使用此类适配器时：

```java
ClassWriter cw = new ClassWriter(0);
ClassVisitor ca = new MyClassAdapter(cw);
ClassReader cr = new ClassReader(...);
cr.accept(ca, 0);
byte[] b = cw.toByteArray();
```

cr生成的事件由ClassNode ca消耗，这导致该对象的字段初始化。

最后，当visitEnd事件被使用时，ca执行转换，并通过调用其accept方法，生成与转换后的类相对应的新事件，这些新事件由cw消耗。

如果我们假设ca更改了类版本，则相应的序列图如图6.2所示。

当与图2.7中的ChangeVersionAdapter的序列图进行比较时，我们可以看到ca和cw之间的事件发生在cr和ca之间的事件之后，而不是与常规类适配器同时发生。

实际上，这在所有基于树的转换中都会发生，并解释了为什么它们不如基于事件的转换那样受约束。

![image](https://user-images.githubusercontent.com/18375710/70843288-c6dd9b00-1e6a-11ea-9c83-bce09e4503c5.png)

### 委托

可用于获得相同结果的第二种模式（具有类似的序列图）使用委托而不是继承：

```java
public class MyClassAdapter extends ClassVisitor {
    ClassVisitor next;

    public MyClassAdapter(ClassVisitor cv) {
        super(ASM4, new ClassNode());
        next = cv;
    }

    @Override 
    public void visitEnd() {
        ClassNode cn = (ClassNode) cv;
        // put your transformation code here
        cn.accept(next);
    }
}
```

此模式使用两个对象代替一个对象，但是与第一个模式完全相同：

接收的事件用于构造ClassNode，当接收到最后一个事件时，将其转换并转换回基于事件的表示形式。

两种模式都允许您将基于树的类适配器与基于事件的适配器组成。

它们也可以用于组合基于树的适配器，但是，如果您仅需要组合基于树的适配器，则这不是最佳解决方案：

在这种情况下，**使用 ClassTransformer 之类的类将避免在两种表示形式之间进行不必要的转换。**


# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)


* any list
{:toc}