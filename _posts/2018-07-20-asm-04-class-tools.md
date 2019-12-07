---
layout: post
title:  ASM-04-class tools
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, sh]
published: true
---

# 工具类 

除了ClassVisitor类以及相关的ClassReader和ClassWriter组件之外，ASM在org.objectweb.asm.util包中还提供了一些工具，这些工具在类生成器或适配器的开发过程中很有用，但不需要 在运行时。

ASM还提供了一个实用程序类，用于在运行时处理内部名称，类型描述符和方法描述符。

所有这些工具在下面介绍。

# 类型(Type)

如您在前几节中所见，ASM API公开了Java类型，因为它们存储在编译的类中，即作为内部名称或类型描述符。

可以将它们公开显示在源代码中，以使代码更具可读性。

但这需要在ClassReader和ClassWriter中的两种表示形式之间进行系统的转换，这会降低性能。

这就是为什么ASM不会将内部名称和类型描述符透明地转换为等效的源代码形式的原因。

但是，它提供了Type类，以便在必要时手动执行此操作。

Type对象表示Java类型，可以从类型描述符或从Class对象构造。

Type类还包含表示原始类型的静态变量。

例如，Type.INT_TYPE是表示int类型的Type对象。

## 内部名称

getInternalName方法返回Type的内部名称。

例如，`eType.getType(String.class).getInternalName()` 给出String类的内部名称，即 `java/lang/String`。

此方法必须仅用于类或接口类型。

## 描述符

getDescriptor方法返回Type的描述符。 

因此，例如，不要使用 `Ljava/lang/String;`

在您的代码中，您可以使用 `Type.getType(String.class).getDescriptor()`。

或者，可以使用 Type.INT_TYPE.getDescriptor() 代替I。

## 标识方法类型

Type对象也可以表示方法类型。

可以从方法描述符或从方法对象构造此类对象。

然后，getDescriptor方法返回与此类型相对应的方法描述符。

另外，可以使用getArgumentTypes和getReturnType方法获取与方法的参数类型和返回类型相对应的Type对象。

例如，Type.getArgumentTypes("(I)V") 返回包含单个元素Type.INT_TYPE的数组。

同样，对 Type.getReturnType("(I)V") 的调用将返回Type.VOID_TYPE对象。


# TraceClassVisitor

## 人类可读

为了检查生成的或转换的类是否符合您的期望，ClassWriter返回的字节数组并没有真正的帮助，因为它是人类无法读取的。

文本表示将更易于使用。这是TraceClassVisitor类提供的。

顾名思义，该类扩展了ClassVisitor类，并构造了所访问类的文本表示形式。

因此，可以使用TraceClassVisitor而不是使用ClassWriter来生成类，以便获得对实际生成内容的可读记录。

或者，甚至更好的是，您可以同时使用两者。

## 委派给其他 visitor

实际上，TraceClassVisitor除了其默认行为外，还可以将对其方法的所有调用委派给另一个访问者，例如ClassWriter：

```java
ClassWriter cw = new ClassWriter(0);
TraceClassVisitor cv = new TraceClassVisitor(cw, printWriter);
cv.visit(...);
...
cv.visitEnd();
byte b[] = cw.toByteArray();
```

这段代码创建了一个TraceClassVisitor，它将接收到的所有调用委托给cw，并将这些调用的文本表示输出到printWriter。

例如，在2.2.3节的示例中使用TraceClassVisitor将给出：

```java
// class version 49.0 (49)
// access flags 1537
public abstract interface pkg/Comparable implements pkg/Mesurable {
// access flags 25
public final static I LESS = -1
// access flags 25
public final static I EQUAL = 0
// access flags 25
public final static I GREATER = 1
// access flags 1025
public abstract compareTo(Ljava/lang/Object;)I
}
```

## 使用时机

请注意，您可以在生成或转换链中的任何时候使用TraceClassVisitor，而不仅是在ClassWriter之前，还可以使用TraceClassVisitor，以查看链中此刻发生的情况。

还要注意，此适配器生成的类的文本表示形式可用于通过 String.equals() 轻松比较类。


# CheckClassAdapter

## 为什么需要

ClassWriter类不会检查其方法是否以适当的顺序和有效的参数被调用。

因此，可以生成将被Java虚拟机验证程序拒绝的无效类。

为了尽快检测到其中一些错误，可以使用CheckClassAdapter类。

## 简介

与TraceClassVisitor一样，此类扩展了ClassVisitor类，并将对其方法的所有调用委派给另一个ClassVisitor，例如TraceClassVisitor或ClassWriter。

但是，该类不会打印访问的类的文本表示形式，而是在委派给下一个访问者之前，检查是否以适当的顺序调用了带有有效参数的方法。

如果发生错误，则抛出IllegalStateException或IllegalArgumentException。

## 使用方式

为了检查一个类，打印该类的文本表示形式，最后创建一个字节数组表示形式，您应该使用类似以下内容的方法：

```java
ClassWriter cw = new ClassWriter(0);
TraceClassVisitor tcv = new TraceClassVisitor(cw, printWriter);
CheckClassAdapter cv = new CheckClassAdapter(tcv);
cv.visit(...);
...
cv.visitEnd();
byte b[] = cw.toByteArray();
```

请注意，如果以不同的顺序链接这些类访问者，则它们执行的操作也将以不同的顺序完成。 

例如，使用以下代码，检查将在跟踪之后进行：

```java
ClassWriter cw = new ClassWriter(0);
CheckClassAdapter cca = new CheckClassAdapter(cw);
TraceClassVisitor cv = new TraceClassVisitor(cca, printWriter);
```

## 使用时机

与TraceClassVisitor一样，您可以在任何位置使用CheckClassAdapter 指向生成或转换链中的一个点，不仅要在ClassWriter之前，还可以在链中此点检查类。

# ASMifier

## 作用

此类为TraceClassVisitor工具提供了一个备用后端（默认情况下使用Textifier后端，产生上面显示的那种输出）。

此后端使TraceClassVisitor类的每个方法都能打印用于调用它的Java代码。

例如，调用visitEnd()方法将打印cv.visitEnd();。

结果是，当具有ASMifier后端的TraceClassVisitor访问者访问类时，它将打印源代码以使用ASM生成此类。

如果您使用此访问者访问已经存在的 class ，这将很有用。

## 引用场景

例如，如果您不知道如何使用ASM生成一些已编译的类，请编写相应的源代码，使用javac进行编译，然后使用ASMifier访问已编译的类。

您将获得ASM代码来生成此编译的类！

## 命令行使用形式

可以从命令行使用ASMifier类。

例如使用：

```
java -classpath asm.jar：asm-util.jar \
org.objectweb.asm.util.ASMifier \
java.lang.Runnable
```

产生缩进后的代码为：

```java
package asm.java.lang;
import org.objectweb.asm.*;

public class RunnableDump implements Opcodes {

    public static byte[] dump() throws Exception {
        ClassWriter cw = new ClassWriter(0);
        FieldVisitor fv;
        MethodVisitor mv;
        AnnotationVisitor av0;
        
        cw.visit(V1_5, ACC_PUBLIC + ACC_ABSTRACT + ACC_INTERFACE,
        "java/lang/Runnable", null, "java/lang/Object", null);
        {
            mv = cw.visitMethod(ACC_PUBLIC + ACC_ABSTRACT, "run", "()V",
            null, null);
            mv.visitEnd();
        }
        cw.visitEnd();
        return cw.toByteArray();
    }
}
```


# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)

* any list
{:toc}