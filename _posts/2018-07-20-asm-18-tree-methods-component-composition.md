---
layout: post
title:  ASM-18-Method 组件组成
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, tree-api, sh]
published: true
---

# 成分组成

到目前为止，我们只看到了如何创建和转换MethodNode对象，但是还没有看到与类的字节数组表示形式相关的链接。

像对于类一样，此链接是通过组合核心API和树API组件来完成的，如本节所述。

# 介绍

除了图7.1中所示的字段外，MethodNode类还扩展了MethodVisitor类，并且还提供了两个接受方法，它们将MethodVisitor或ClassVisitor作为参数。

accept方法根据MethodNode字段值生成事件，而MethodVisitor方法执行相反的操作，即根据接收到的事件设置MethodNode字段。

# 模式

像类一样，可以使用基于树的方法转换器，例如带有核心API的方法适配器。

可以用于类的两种模式确实对方法也有效，并且工作方式完全相同。 

## 继承模式

基于继承的模式如下：

```java
public class MyMethodAdapter extends MethodNode {

    public MyMethodAdapter(int access, String name, String desc,
        String signature, String[] exceptions, MethodVisitor mv) {
        super(ASM4, access, name, desc, signature, exceptions);
        this.mv = mv;
    }

    @Override 
    public void visitEnd() {
        // put your transformation code here
        accept(mv);
    }
}
```

## 委托模式

```java
public class MyMethodAdapter extends MethodVisitor {
    MethodVisitor next;
    public MyMethodAdapter(int access, String name, String desc,
        String signature, String[] exceptions, MethodVisitor mv) {
        super(ASM4,
        new MethodNode(access, name, desc, signature, exceptions));
        next = mv;
    }

    @Override 
    public void visitEnd() {
        MethodNode mn = (MethodNode) mv;
        // put your transformation code here
        mn.accept(next);
    }
}
```

第一种模式的一种变体是直接在ClassAdapter的visitMethod中将其与匿名内部类一起使用：

```java
public MethodVisitor visitMethod(int access, String name,
    String desc, String signature, String[] exceptions) {
    return new MethodNode(ASM4, access, name, desc, signature, exceptions)
        {
        @Override 
        public void visitEnd() {
            // put your transformation code here
            accept(cv);
        }
    };
}
```

这些模式表明，仅可能将树API用于方法，而将核心API用于类。

在实践中，经常使用这种策略。


# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)

* any list
{:toc}