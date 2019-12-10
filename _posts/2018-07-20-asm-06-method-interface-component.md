---
layout: post
title:  ASM-06-Method Interface and Components
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, sh]
published: true
---

# 介绍

用于生成和转换已编译方法的ASM API基于MethodVisitor抽象类（请参见图3.4），该类由ClassVisitor的visitMethod方法返回。

除了下一章中将介绍的与注释和调试信息有关的一些方法外，此类还基于以下内容为每个字节码指令类别定义了一个方法：

这些指令的参数数量和类型（这些类别与3.1.2节中介绍的类别不对应）。

必须按以下顺序调用这些方法（在MethodVisitor接口的Javadoc中指定了一些其他约束）：

```
visitAnnotationDefault?
( visitAnnotation | visitParameterAnnotation | visitAttribute )*
( visitCode
( visitTryCatchBlock | visitLabel | visitFrame | visitXxxInsn |
visitLocalVariable | visitLineNumber )*
visitMaxs )?
visitEnd
```

这意味着对于非抽象方法，必须首先访问注释和属性（如果有的话），然后是方法的字节码。

对于这些方法，必须按顺序访问代码，即在对visitCode的一次调用和对visitMaxs的一次调用之间。

- Figure 3.4.: The MethodVisitor class

```java
abstract class MethodVisitor { // public accessors ommited
    MethodVisitor(int api);
    MethodVisitor(int api, MethodVisitor mv);
    AnnotationVisitor visitAnnotationDefault();
    AnnotationVisitor visitAnnotation(String desc, boolean visible);
    AnnotationVisitor visitParameterAnnotation(int parameter,
    String desc, boolean visible);
    void visitAttribute(Attribute attr);
    void visitCode();
    void visitFrame(int type, int nLocal, Object[] local, int nStack,
    Object[] stack);
    void visitInsn(int opcode);
    void visitIntInsn(int opcode, int operand);
    void visitVarInsn(int opcode, int var);
    void visitTypeInsn(int opcode, String desc);
    void visitFieldInsn(int opc, String owner, String name, String desc);
    void visitMethodInsn(int opc, String owner, String name, String desc);
    void visitInvokeDynamicInsn(String name, String desc, Handle bsm,
    Object... bsmArgs);
    void visitJumpInsn(int opcode, Label label);
    void visitLabel(Label label);
    void visitLdcInsn(Object cst);
    void visitIincInsn(int var, int increment);
    void visitTableSwitchInsn(int min, int max, Label dflt, Label[] labels);
    void visitLookupSwitchInsn(Label dflt, int[] keys, Label[] labels);
    void visitMultiANewArrayInsn(String desc, int dims);
    void visitTryCatchBlock(Label start, Label end, Label handler,
    String type);
    void visitLocalVariable(String name, String desc, String signature,
    Label start, Label end, int index);
    void visitLineNumber(int line, Label start);
    void visitMaxs(int maxStack, int maxLocals);
    void visitEnd();
}
```

因此，visitCode和visitMaxs方法可用于检测一系列事件中方法字节码的开始和结束。

与类一样，visitEnd方法必须最后调用，并且用于检测一系列事件中方法的结束。

可以组合ClassVisitor和MethodVisitor类，以生成完整的类：

```java
ClassVisitor cv = ...;
cv.visit(...);
MethodVisitor mv1 = cv.visitMethod(..., "m1", ...);
mv1.visitCode();
mv1.visitInsn(...);
...
mv1.visitMaxs(...);
mv1.visitEnd();
MethodVisitor mv2 = cv.visitMethod(..., "m2", ...);
mv2.visitCode();
mv2.visitInsn(...);
...
mv2.visitMaxs(...);
mv2.visitEnd();
cv.visitEnd();
```

请注意，不必完成一种方法即可开始访问另一种方法。

实际上，MethodVisitor实例是完全独立的，可以按任何顺序使用（只要未调用 `cv.visitEnd()`）：

```java
ClassVisitor cv = ...;
cv.visit(...);
MethodVisitor mv1 = cv.visitMethod(..., "m1", ...);
mv1.visitCode();
mv1.visitInsn(...);
...
MethodVisitor mv2 = cv.visitMethod(..., "m2", ...);
mv2.visitCode();
mv2.visitInsn(...);
...
mv1.visitMaxs(...);
mv1.visitEnd();
...
mv2.visitMaxs(...);
mv2.visitEnd();
cv.visitEnd();
```

## 生成和转换

ASM提供了三个基于MethodVisitor API的核心组件来生成和转换方法：

- ClassReader类解析已编译方法的内容，并在ClassVisitor返回的MethodVisitor对象上调用相应方法，该对象作为参数传递给其accept方法。

- ClassWriter的visitMethod方法返回MethodVisitor接口的实现，该接口直接以二进制形式构建编译的方法。

- MethodVisitor类将其接收的所有方法委托给另一个MethodVisitor实例。 可以将其视为事件过滤器。

# ClassWriter 选项

正如我们在3.1.5节中所看到的，为一个方法计算堆栈映射帧不是一件容易的事：

您必须计算所有帧，找到与跳转目标相对应或无条件跳转的帧，最后压缩其余的帧框架。

同样，为方法计算局部变量和操作数堆栈部分的大小比较容易，但仍然不是很容易。

## 指定自动计算

希望ASM可以为您计算。 

创建ClassWriter时，可以指定必须自动计算的内容：

### 不计算任何东西

使用新的 `new ClassWriter(0)` 不会自动计算任何内容。

您必须自己计算帧以及局部变量和操作数堆栈的大小。

### 计算局部变量和操作数堆栈部分

使用 `new ClassWriter(ClassWriter.COMPUTE_MAXS)` 将为您计算局部变量和操作数堆栈部分。

您仍然必须调用visitMaxs，但是可以使用任何参数：它们将被忽略并重新计算。

使用此选项，您仍然必须自己计算帧。

### 计算所有

使用 `new ClassWriter(ClassWriter.COMPUTE_FRAMES) ` 会自动计算所有内容。

您不必调用visitFrame，但仍必须调用visitMaxs（参数将被忽略并重新计算）。

- 使用自动计算的代价

使用这些选项很方便，但这会产生成本：

COMPUTE_MAXS选项会使ClassWriter慢10％，而使用COMPUTE_FRAMES选项会使它慢两倍。

必须将此与自己计算所需的时间进行比较：

在特定情况下，与必须处理所有情况的ASM中使用的算法相比，通常有更简便，更快速的算法来进行计算。

## 自己计算的注意事项

请注意，如果您选择自己计算帧，则可以让ClassWriter类为您执行压缩步骤。

为此，您只需要使用 `visitFrame(F_NEW, nLocals, locals, nStack, stack),` 访问未压缩的帧，其中nLocals和nStack是本地数和操作数堆栈大小，而locals和stack是包含相应类型的数组（有关更多详细信息，请参阅Javadoc）。

还要注意，为了自动计算帧，有时需要计算两个给定类的公共超类。

默认情况下，ClassWriter类通过 `getCommonSuperClass()` 方法通过将这两个类加载到JVM中并使用反射API来对此进行计算。

如果要生成几个相互引用的类，这可能是个问题，因为被引用的类可能还不存在。 

在这种情况下，您可以重写getCommonSuperClass方法来解决此问题。

# 生成方法

## getF() 的例子

如果mv是MethodVisitor，则可以使用以下方法调用生成3.1.3节中定义的getF方法的字节码：

```java
mv.visitCode();
mv.visitVarInsn(ALOAD, 0);
mv.visitFieldInsn(GETFIELD, "pkg/Bean", "f", "I");
mv.visitInsn(IRETURN);
mv.visitMaxs(1, 1);
mv.visitEnd();
```

第一次调用开始生成字节码。

随后是三个调用，它们生成此方法的三个指令（如您所见，字节码与ASM API之间的映射非常简单）。

在访问所有说明之后，必须完成对visitMaxs的调用。它用于定义此方法执行帧的局部变量和操作数堆栈部分的大小。

正如我们在3.1.3节中所看到的，这些尺寸每个零件1个插槽。

最后，最后一次调用用于结束方法的生成。

setF方法和构造函数的字节码可以类似的方式生成。


## 更复杂的例子 checkAndSetF()

一个更有趣的示例是 checkAndSetF 方法：

```java
mv.visitCode();
mv.visitVarInsn(ILOAD, 1);
Label label = new Label();
mv.visitJumpInsn(IFLT, label);
mv.visitVarInsn(ALOAD, 0);
mv.visitVarInsn(ILOAD, 1);
mv.visitFieldInsn(PUTFIELD, "pkg/Bean", "f", "I");
Label end = new Label();
mv.visitJumpInsn(GOTO, end);
mv.visitLabel(label);
mv.visitFrame(F_SAME, 0, null, 0, null);
mv.visitTypeInsn(NEW, "java/lang/IllegalArgumentException");
mv.visitInsn(DUP);
mv.visitMethodInsn(INVOKESPECIAL,"java/lang/IllegalArgumentException", "<init>", "()V");
mv.visitInsn(ATHROW);
mv.visitLabel(end);
mv.visitFrame(F_SAME, 0, null, 0, null);
mv.visitInsn(RETURN);
mv.visitMaxs(2, 2);
mv.visitEnd();
```

在visitCode和visitEnd调用之间，您可以看到方法调用完全映射到第3.1.5节末尾显示的字节码：

每个指令，标签或框架一个调用（唯一的例外是label和end Label的声明和构造对象）。

## 注意

一个Label对象指定该标签的visitLabel调用之后的指令。

例如，end指定RETURN指令，而不是紧随其后访问的帧，因为这不是指令。

拥有多个指定同一条指令的标签是完全合法的，但是标签必须恰好指定一条指令。

换句话说，可以使用不同的标签连续调用visitLabel，但是必须使用visitLabel对指令中使用的标签进行一次精确的访问。

最后一个约束是不能共享标签：每个方法必须具有自己的标签。

# 转换方法

## 前言

转换存在的方法，可谓是 aop 中代码增强最有用的一种方法。

当然也有可能很多实现是生成一个代理类，我更喜欢这种修改已经存在方法的方式，可能实现起来会比较麻烦。

## 简介

您现在应该已经猜到方法可以像类一样进行转换，即通过使用方法适配器转发经过修改的方法调用：

更改参数可以用于更改单个指令，不转接收到的调用会删除一条指令，然后插入接收到的调用之间的调用(call)会添加新的指令。

MethodVisitor类提供了这种方法适配器的基本实现，该适配器除了转发所有接收到的方法调用外，什么也不做。

## 方法适配器

为了了解如何使用方法适配器，让我们考虑一个非常简单的适配器，该适配器删除方法内部的NOP指令（可以删除它们，因为它们什么都不做，因此不会出现问题）：

```java
public class RemoveNopAdapter extends MethodVisitor {

    public RemoveNopAdapter(MethodVisitor mv) {
        super(ASM4, mv);
    }

    @Override
    public void visitInsn(int opcode) {
        if (opcode != NOP) {
            mv.visitInsn(opcode);
        }
    }

}
```

这个适配器可以如下使用：

```java
public class RemoveNopClassAdapter extends ClassVisitor {
    public RemoveNopClassAdapter(ClassVisitor cv) {
        super(ASM4, cv);
    }

    @Override
    public MethodVisitor visitMethod(int access, String name,
        String desc, String signature, String[] exceptions) {
        MethodVisitor mv;
        mv = cv.visitMethod(access, name, desc, signature, exceptions);
            if (mv != null) {
            mv = new RemoveNopAdapter(mv);
        }
        return mv;
    }
}
```

换句话说，类适配器只是构建一个方法适配器，封装了链中下一个类访问者返回的方法访问者，然后返回该适配器。

结果是方法适配器链的构造类似于类适配器链（请参见图3.5）。

但是请注意，这不是强制性的：

完全有可能构建与类适配器链不同的方法适配器链。

每个方法甚至可以具有不同的方法适配器链。

### 指定方法

例如，类适配器可以选择仅在方法中而不在构造函数中删除NOP。

可以按照以下步骤进行：

```java
mv = cv.visitMethod(access, name, desc, signature, exceptions);
if (mv != null && !name.equals("<init>")) {
    mv = new RemoveNopAdapter(mv);
}
```

在这种情况下，对于构造函数而言，适配器链较短。

相反，使用几种方法，构造函数的适配器链可能更长。

![image](https://user-images.githubusercontent.com/18375710/70489837-c033e880-1b37-11ea-80ca-f2da03dd9f87.png)

链接在一起的适配器在visitMethod内部创建。

## 类和方法拓扑分离

方法适配器链甚至可以具有与类适配器链不同的拓扑。

例如，类适配器链可以是线性的，而方法适配器链具有分支：

```java
public MethodVisitor visitMethod(int access, String name,
    String desc, String signature, String[] exceptions) {
    MethodVisitor mv1, mv2;
    mv1 = cv.visitMethod(access, name, desc, signature, exceptions);
    mv2 = cv.visitMethod(access, "_" + name, desc, signature, exceptions);
    return new MultiMethodAdapter(mv1, mv2);
}
```

现在我们已经了解了如何在类适配器中使用和组合方法适配器，让我们来看看如何实现比RemoveNopAdapter更有趣的适配器。


# 无状态转换（Stateless transformations）

假设我们要衡量一个程序的每个类所花费的时间。

我们需要在每个类中添加一个静态计时器字段，并且需要将该类的每个方法的执行时间添加到此计时器字段中。

换句话说，我们要转换一个诸如C的类：

```java
public class C {
    public void m() throws Exception {
        Thread.sleep(100);
    }
}
```

变成这样：

```java
public class C {
    public static long timer;

    public void m() throws Exception {
        timer -= System.currentTimeMillis();
        Thread.sleep(100);
        timer += System.currentTimeMillis();
    }
}
```

ps: 这里就是一种代码增强。如果能结合编译时注解，可以做到很强的功能。

## 比较区别

`TraceClassVisitor` 这个类可以告诉我们怎么用 ASM 实现这个功能，非常的好用。

为了了解如何在ASM中实现此目的，我们可以编译这两个类，并比较这两个版本上的 TraceClassVisitor 的输出（使用默认的Textifier后端或使用ASMifier后端）。

使用默认后端，我们得到以下差异（粗体）：

```
GETSTATIC C.timer : J
INVOKESTATIC java/lang/System.currentTimeMillis()J
LSUB
PUTSTATIC C.timer : J

LDC 100
INVOKESTATIC java/lang/Thread.sleep(J)V

GETSTATIC C.timer : J
INVOKESTATIC java/lang/System.currentTimeMillis()J
LADD
PUTSTATIC C.timer : J

RETURN
MAXSTACK = 4
MAXLOCALS = 1
```

我们看到必须在方法的开头添加四条指令，在返回指令之前添加四条其他指令。（第一段和第三段）

我们还需要更新最大操作数堆栈大小。

该方法代码的开头是通过visitCode方法访问的。

因此，我们可以通过在方法适配器中重写此方法来添加前四个指令：

```java
public void visitCode() {
    mv.visitCode();
    mv.visitFieldInsn(GETSTATIC, owner, "timer", "J");
    mv.visitMethodInsn(INVOKESTATIC, "java/lang/System",
    "currentTimeMillis", "()J");
    mv.visitInsn(LSUB);
    mv.visitFieldInsn(PUTSTATIC, owner, "timer", "J");
}
```

必须将owner设置为要转换的类的名称。

现在，我们必须在任何RETURN之前，任何xRETURN或ATHROW之前添加其他四条指令，它们都是终止该方法执行的所有指令。

这些指令没有任何参数，因此可以在visitInsn方法中进行访问。

然后，我们可以覆盖此方法以添加我们的说明：

```java
public void visitInsn(int opcode) {
    if ((opcode >= IRETURN && opcode <= RETURN) || opcode == ATHROW) {
        mv.visitFieldInsn(GETSTATIC, owner, "timer", "J");
        mv.visitMethodInsn(INVOKESTATIC, "java/lang/System",
        "currentTimeMillis", "()J");
        mv.visitInsn(LADD);
        mv.visitFieldInsn(PUTSTATIC, owner, "timer", "J");
    }
    mv.visitInsn(opcode);
}
```

TODO...

# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)

* any list
{:toc}