---
layout: post
title:  ASM-07-Method Tools 工具类
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, sh]
published: true
---

# Tools 

org.objectweb.asm.commons 软件包包含一些预定义的方法适配器，这些适配器可用于定义您自己的适配器。

本节介绍其中的三个，并说明如何将它们与3.2.4节的AddTimerAdapter示例一起使用。

它还显示了如何使用上一章中介绍的工具简化方法的生成或转换。

# Basic tools

2.3 节中介绍的工具也可以用于方法。

## Type

许多字节码指令（例如xLOAD，xADD或xRETURN）取决于它们所应用的类型。

Type类提供了一个getOpcode方法，对于这些指令，该方法可用于获取与给定类型相对应的操作码。

此方法将int类型的操作码作为参数，并返回对其进行调用的类型的操作码。

例如，如果t等于Type.FLOAT_TYPE，则t.getOpcode（IMUL）返回FMUL。

## TraceClassVisitor

上一章已经介绍过的该类，以与本章中使用的形式非常相似的形式，打印出所访问类的文本表示形式，包括其方法的文本表示形式。

因此，它可用于跟踪转换链中任何点上已生成或已转换方法的内容。

例如：

```
java -classpath asm.jar:asm-util.jar \
org.objectweb.asm.util.TraceClassVisitor \
java.lang.Void
```

输出

```java
// class version 49.0 (49)
// access flags 49
public final class java/lang/Void {
// access flags 25
// signature Ljava/lang/Class<Ljava/lang/Void;>;
// declaration: java.lang.Class<java.lang.Void>
public final static Ljava/lang/Class; TYPE
// access flags 2
private <init>()V
ALOAD 0
INVOKESPECIAL java/lang/Object.<init> ()V
RETURN
MAXSTACK = 1
MAXLOCALS = 1
// access flags 8
static <clinit>()V
LDC "void"
INVOKESTATIC java/lang/Class.getPrimitiveClass (...)...
PUTSTATIC java/lang/Void.TYPE : Ljava/lang/Class;
RETURN
MAXSTACK = 1
MAXLOCALS = 0
}
```

这显示了如何生成静态块static {...}，即 `<clinit>` 方法（对于CLass INITializer）。

请注意，如果要跟踪链中某个位置的单个方法的内容，而不是跟踪其类的所有内容，可以使用TraceMethodVisitor而不是TraceClassVisitor（在这种情况下，您必须明确指定后端；在这里，我们必须 使用Textifier）：


```java
public MethodVisitor visitMethod(int access, String name, String desc, String signature, String[] exceptions) {
    MethodVisitor mv = cv.visitMethod(access, name, desc, signature,exceptions);
    if (debug && mv != null && ...) { // if this method must be traced
        Printer p = new Textifier(ASM4) {
            @Override 
            public void visitMethodEnd() {
                print(aPrintWriter); // print it after it has been visited
            }
        };
        mv = new TraceMethodVisitor(mv, p);
    }

    return new MyMethodAdapter(mv);
}
```

此代码在通过MyMethodAdapter转换后打印方法。

## CheckClassAdapter

该类已经在上一章中介绍过，它检查以正确的顺序调用ClassVisitor方法，并带有有效的参数，并且对MethodVisitor方法也是如此。

因此，可以使用它来检查在转换链中的任何点上是否正确使用了MethodVisitor API。

与TraceMethodVisitor一样，可以使用CheckMethodAdapter类来检查单个方法，而不是检查其所有类：

```java
public MethodVisitor visitMethod(int access, String name, String desc, String signature, String[] exceptions) {
    MethodVisitor mv = cv.visitMethod(access, name, desc, signature,exceptions);
    if (debug && mv != null && ...) { // if this method must be checked
        mv = new CheckMethodAdapter(mv);
    }
    return new MyMethodAdapter(mv);
}
```

此代码检查MyMethodAdapter是否正确使用MethodVisitor API。

但是请注意，此适配器不会检查字节码是否正确：

例如，它不会检测到ISTORE 1 ALOAD 1无效。

实际上，如果使用CheckMethodAdapter的其他构造函数（请参见Javadoc），并且在visitMaxs中提供有效的maxStack和maxLocals参数，则可以检测到此类错误。

## ASMifier

上一章已经介绍过的该类也适用于方法的内容。

它可以用来了解如何使用ASM生成一些已编译的代码：

只需用Java编写相应的源代码，然后使用javac进行编译，然后使用ASMifier来访问此类。

您将获得ASM代码，以生成与您的源代码相对应的字节码。

# AnalyzerAdapter

该方法适配器根据visitFrame中访问的帧在每个指令之前计算堆栈映射帧。

确实，如第3.1.5节中所述，为节省空间，并且“可以从这些框架中轻松而快速地推断出其他框架”，仅在方法中的某些特定指令之前调用visitFrame。

这就是适配器的功能。

当然，它仅适用于包含预先计算的堆栈映射框架的类，即使用Java 6或更高版本进行编译的类（或以前使用COMPUTE_FRAMES选项使用ASM适配器升级到Java 6的类）。

在我们的AddTimerAdapter示例中，此适配器可用于获取RETURN指令之前的操作数堆栈的大小，从而允许为visitMaxs中的maxStack计算最佳转换值（实际上，不建议使用此方法， 因为它比使用COMPUTE_MAXS效率低得多）：


```java
class AddTimerMethodAdapter2 extends AnalyzerAdapter {

    private int maxStack;

    public AddTimerMethodAdapter2(String owner, int access,
        String name, String desc, MethodVisitor mv) {
        super(ASM4, owner, access, name, desc, mv);
    }

    @Override 
    public void visitCode() {
        super.visitCode();
        mv.visitFieldInsn(GETSTATIC, owner, "timer", "J");
        mv.visitMethodInsn(INVOKESTATIC, "java/lang/System",
        "currentTimeMillis", "()J");
        mv.visitInsn(LSUB);
        mv.visitFieldInsn(PUTSTATIC, owner, "timer", "J");
        maxStack = 4;
    }

    @Override 
    public void visitInsn(int opcode) {
        if ((opcode >= IRETURN && opcode <= RETURN) || opcode == ATHROW) {
            mv.visitFieldInsn(GETSTATIC, owner, "timer", "J");
            mv.visitMethodInsn(INVOKESTATIC, "java/lang/System",
            "currentTimeMillis", "()J");
            mv.visitInsn(LADD);
            mv.visitFieldInsn(PUTSTATIC, owner, "timer", "J");
            maxStack = Math.max(maxStack, stack.size() + 4);
        }
        super.visitInsn(opcode);
    }

    @Override 
    public void visitMaxs(int maxStack, int maxLocals) {
        super.visitMaxs(Math.max(this.maxStack, maxStack), maxLocals);
    }
}
```

堆栈字段在AnalyzerAdapter类中定义，并且包含操作数堆栈中的类型。

更准确地说，在visitXxxInsn中，在调用重写方法之前，此列表包含此指令之前的操作数堆栈的状态。

请注意，必须调用重写的方法，以便正确更新栈字段（因此在原始代码中使用super而不是mv）。

或者，可以通过调用超类的方法插入新指令：

结果是这些指令的帧将由AnalyzerAdapter计算。

此外，由于此适配器基于其计算的帧来更新visitMaxs的参数，因此我们不需要自己更新它们：

```java
class AddTimerMethodAdapter3 extends AnalyzerAdapter {

    public AddTimerMethodAdapter3(String owner, int access,
        String name, String desc, MethodVisitor mv) {
        super(ASM4, owner, access, name, desc, mv);
    }

    @Override 
    public void visitCode() {
        super.visitCode();
        super.visitFieldInsn(GETSTATIC, owner, "timer", "J");
        super.visitMethodInsn(INVOKESTATIC, "java/lang/System",
        "currentTimeMillis", "()J");
        super.visitInsn(LSUB);
        super.visitFieldInsn(PUTSTATIC, owner, "timer", "J");
    }

    @Override 
    public void visitInsn(int opcode) {
        if ((opcode >= IRETURN && opcode <= RETURN) || opcode == ATHROW) {
            super.visitFieldInsn(GETSTATIC, owner, "timer", "J");
            super.visitMethodInsn(INVOKESTATIC, "java/lang/System",
            "currentTimeMillis", "()J");
            super.visitInsn(LADD);
            super.visitFieldInsn(PUTSTATIC, owner, "timer", "J");
        }
        super.visitInsn(opcode);
    }
}
```

#  LocalVariablesSorter

此方法适配器按照在该方法中出现的顺序对方法中使用的局部变量进行重新编号。

例如，在具有两个参数的方法中，分配了第一个读取或写入的索引大于或等于3的局部变量–前三个局部变量与此相对应，并且与两个方法参数相对应，因此不能更改–被分配 索引3，第二个分配索引4，依此类推。

该适配器对于在方法中插入新的局部变量很有用。

如果没有该适配器，则必须在所有现有变量之后添加新的局部变量，但是不幸的是，直到方法结束时，在visitMaxs中才知道它们的数量。

为了说明如何使用此适配器，假设我们要使用局部变量来实现AddTimerAdapter：

```java
public class C {
    public static long timer;

    public void m() throws Exception {
        long t = System.currentTimeMillis();
        Thread.sleep(100);
        timer += System.currentTimeMillis() - t;
    }
}
```

这可以通过扩展LocalVariablesSorter以及使用此类中定义的newLocal方法轻松完成：

```java
class AddTimerMethodAdapter4 extends LocalVariablesSorter {
    
    private int time;

    public AddTimerMethodAdapter4(int access, String desc,
        MethodVisitor mv) {
        super(ASM4, access, desc, mv);
    }

    @Override 
    public void visitCode() {
        super.visitCode();
        mv.visitMethodInsn(INVOKESTATIC, "java/lang/System",
        "currentTimeMillis", "()J");
        time = newLocal(Type.LONG_TYPE);
        mv.visitVarInsn(LSTORE, time);
    }

    @Override 
    public void visitInsn(int opcode) {
        if ((opcode >= IRETURN && opcode <= RETURN) || opcode == ATHROW) {
            mv.visitMethodInsn(INVOKESTATIC, "java/lang/System",
            "currentTimeMillis", "()J");
            mv.visitVarInsn(LLOAD, time);
            mv.visitInsn(LSUB);
            mv.visitFieldInsn(GETSTATIC, owner, "timer", "J");
            mv.visitInsn(LADD);
            mv.visitFieldInsn(PUTSTATIC, owner, "timer", "J");
        }
        super.visitInsn(opcode);
    }

    @Override 
    public void visitMaxs(int maxStack, int maxLocals) {
        super.visitMaxs(maxStack + 4, maxLocals);
    }
}
```

请注意，当对局部变量重新编号时，与该方法关联的原始框架将变得无效，而在插入新的局部变量时，此框架将变得无效。

希望有可能避免从头开始重新计算这些框架：实际上不必添加或删除任何框架，并且“足够”对原始框架中的局部变量的内容进行重新排序以获得转换方法的框架。

LocalVariablesSorter会自动进行处理。

如果您还需要为其中一个方法适配器进行增量堆栈映射框架更新，则可以从此类的源中激发自己的灵感。

正如您在上面看到的那样，使用局部变量并不能解决我们在此类的原始版本中遇到的有关maxStack最坏情况值的问题。

如果要使用AnalyzerAdapter来解决此问题，除了LocalVariablesSorter之外，还必须通过委派而不是通过继承使用这些适配器（因为无法进行多重继承）：

```java
class AddTimerMethodAdapter5 extends MethodVisitor {
    public LocalVariablesSorter lvs;
    public AnalyzerAdapter aa;
    private int time;
    private int maxStack;

    public AddTimerMethodAdapter5(MethodVisitor mv) {
        super(ASM4, mv);
    }

    @Override 
    public void visitCode() {
        mv.visitCode();
        mv.visitMethodInsn(INVOKESTATIC, "java/lang/System",
        "currentTimeMillis", "()J");
        time = lvs.newLocal(Type.LONG_TYPE);
        mv.visitVarInsn(LSTORE, time);
        maxStack = 4;
    }

    @Override 
    public void visitInsn(int opcode) {
        if ((opcode >= IRETURN && opcode <= RETURN) || opcode == ATHROW) {
            mv.visitMethodInsn(INVOKESTATIC, "java/lang/System",
            "currentTimeMillis", "()J");
            mv.visitVarInsn(LLOAD, time);
            mv.visitInsn(LSUB);
            mv.visitFieldInsn(GETSTATIC, owner, "timer", "J");
            mv.visitInsn(LADD);
            mv.visitFieldInsn(PUTSTATIC, owner, "timer", "J");
            maxStack = Math.max(aa.stack.size() + 4, maxStack);
        }
        mv.visitInsn(opcode);
    }

    @Override 
    public void visitMaxs(int maxStack, int maxLocals) {
        mv.visitMaxs(Math.max(this.maxStack, maxStack), maxLocals);
    }
}
```

为了使用此适配器，您必须将LocalVariablesSorter链接到AnalyzerAdapter，而它本身也链接到您的适配器：

第一个适配器将对局部变量进行排序并相应地更新帧，分析器适配器将考虑在前一个适配器中完成的重新编号后计算中间帧，并且您的适配器将可以访问这些重新编号的中间帧。

该链可以在visitMethod中构造如下

```java
mv = cv.visitMethod(access, name, desc, signature, exceptions);
if (!isInterface && mv != null && !name.equals("<init>")) {
    AddTimerMethodAdapter5 at = new AddTimerMethodAdapter5(mv);
    at.aa = new AnalyzerAdapter(owner, access, name, desc, at);
    at.lvs = new LocalVariablesSorter(access, desc, at.aa);
    return at.lvs;
}
```

# AdviceAdapter

该方法适配器是一个抽象类，可用于在方法的开头以及任何RETURN或ATHROW指令之前插入代码。

它的主要优点是它也适用于构造函数，在这些构造函数中，不能仅在构造函数的开始处而是在调用超级构造函数之后插入代码。

实际上，此适配器的大多数代码专用于检测此超级构造函数调用。

如果您仔细查看3.2.4节中的AddTimerAdapter类，则会看到AddTimerMethodAdapter不用于构造函数，因为存在此问题。

通过从AdviceAdapter继承，该方法适配器也可以改进以在构造函数上工作（请注意，AdviceAdapter继承自LocalVariablesSorter，因此我们也可以轻松地使用局部变量）：

ps: 有种 aop 的感觉。

```java
class AddTimerMethodAdapter6 extends AdviceAdapter {
    public AddTimerMethodAdapter6(int access, String name, String desc,
        MethodVisitor mv) {
        super(ASM4, mv, access, name, desc);
    }

    @Override 
    protected void onMethodEnter() {
        mv.visitFieldInsn(GETSTATIC, owner, "timer", "J");
        mv.visitMethodInsn(INVOKESTATIC, "java/lang/System",
        "currentTimeMillis", "()J");
        mv.visitInsn(LSUB);
        mv.visitFieldInsn(PUTSTATIC, owner, "timer", "J");
    }

    @Override 
    protected void onMethodExit(int opcode) {
        mv.visitFieldInsn(GETSTATIC, owner, "timer", "J");
        mv.visitMethodInsn(INVOKESTATIC, "java/lang/System",
        "currentTimeMillis", "()J");
        mv.visitInsn(LADD);
        mv.visitFieldInsn(PUTSTATIC, owner, "timer", "J");
    }

    @Override 
    public void visitMaxs(int maxStack, int maxLocals) {
        super.visitMaxs(maxStack + 4, maxLocals);
    }
}
```

# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)

* any list
{:toc}