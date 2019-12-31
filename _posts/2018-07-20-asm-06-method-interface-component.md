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

下面的这种流程，我们自己进行编程的时候也可以学习。

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

### visitcode 修改

该方法代码的开头是通过 visitCode 方法访问的。

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

### visitInsn 修改

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

### 更新最大操作数堆栈大小

最后，我们必须更新最大操作数堆栈大小。

我们添加的指令会推入两个long值，因此在操作数堆栈上需要四个插槽。

在方法开始时，操作数堆栈最初为空，因此我们知道在开始处添加的四条指令需要一叠大小为4。

我们也知道，插入的代码使堆栈状态保持不变（因为它弹出的次数与所推送的一样多）。

结果，如果原始代码需要一个大小为s的堆栈，则转换后的方法所需的最大堆栈大小为 max(4, s)。

不幸的是，我们还在返回指令之前添加了四个指令，并且在这里我们不知道这些指令之前的操作数堆栈的大小。

我们只知道它小于或等于s。

因此，我们只能说在返回指令之前添加的代码可能需要最大为 `s + 4` 的操作数堆栈。

这种最坏情况在实践中很少发生：

对于普通的编译器，在RETURN之前的操作数堆栈仅包含返回值，即，其大小最大为0、1或2。

但是，如果我们想处理所有可能的情况，则需要使用最坏情况方案2。

然后，我们必须按如下方式重写visitMaxs方法：

```java
public void visitMaxs(int maxStack, int maxLocals) {
    mv.visitMaxs(maxStack + 4, maxLocals);
}
```

当然，可以不用担心最大堆栈大小，而可以依靠 COMPUTE_MAXS 选项来计算最佳值，而不是最坏情况的值。

但是对于这样简单的转换，手动更新 maxStack 不需要花费太多精力。

ps: 简单的计算自己做，如果依赖选项当然也简单，可是性能的损耗上面也说了。

## 堆栈映射帧（Frame）如何？

现在一个有趣的问题是：堆栈映射 Frame 如何？

原始代码不包含任何 Frame，也没有转换的 Frame，但这是由于我们用作示例的特定代码吗？

在某些情况下必须更新 Frame？

答案是否定的，因为

1）插入的代码使操作数堆栈保持不变，

2）插入的代码不包含跳转指令，并且

3）原始代码的跳转指令（或更正式的说是控制流程图）没有被修改。

这意味着原始帧不会更改，并且由于不必为插入的代码存储任何新帧，因此压缩的原始帧也不会更改。

## 将一切连接起来

```java
public class AddTimerAdapter extends ClassVisitor {

    private String owner;
    private boolean isInterface;
    
    public AddTimerAdapter(ClassVisitor cv) {
        super(ASM4, cv);
    }


    @Override 
    public void visit(int version, int access, String name,
        String signature, String superName, String[] interfaces) {
        cv.visit(version, access, name, signature, superName, interfaces);
        owner = name;
        isInterface = (access & ACC_INTERFACE) != 0;
    }

    @Override 
    public MethodVisitor visitMethod(int access, String name,
        String desc, String signature, String[] exceptions) {
        MethodVisitor mv = cv.visitMethod(access, name, desc, signature,
        exceptions);
        if (!isInterface && mv != null && !name.equals("<init>")) {
            mv = new AddTimerMethodAdapter(mv);
        }
        return mv;
    }

    @Override 
    public void visitEnd() {
        if (!isInterface) {
            FieldVisitor fv = cv.visitField(ACC_PUBLIC + ACC_STATIC, "timer", "J", null, null);
            if (fv != null) {
                fv.visitEnd();
            }
        }
        cv.visitEnd();
    }


    class AddTimerMethodAdapter extends MethodVisitor {
        
        public AddTimerMethodAdapter(MethodVisitor mv) {
            super(ASM4, mv);
        }

        @Override 
        public void visitCode() {
            mv.visitCode();
            mv.visitFieldInsn(GETSTATIC, owner, "timer", "J");
            mv.visitMethodInsn(INVOKESTATIC, "java/lang/System",
            "currentTimeMillis", "()J");
            mv.visitInsn(LSUB);
            mv.visitFieldInsn(PUTSTATIC, owner, "timer", "J");
        }

        @Override 
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

        @Override 
        public void visitMaxs(int maxStack, int maxLocals) {
            mv.visitMaxs(maxStack + 4, maxLocals);
        }
    }
}
```

类适配器用于实例化方法适配器（构造函数除外），还用于添加计时器字段并将要转换的类的名称存储在可从方法适配器访问的字段中。

# 有状态转换（Statefull transformations）

## 无状态转换

上一节中看到的转换是局部的，并且不依赖于当前指令之前已访问的指令：

开头添加的代码始终相同并且始终会添加，同样，对于每个RETURN指令之前插入的代码 。

这种转换称为无状态转换。

它们很容易实现，但是只有最简单的转换才能验证此属性。

更复杂的转换需要记住有关当前指令之前已访问的指令的某种状态。

## 有状态转换

例如，考虑一个删除所有出现的ICONST_0 IADD序列的转换，其空效果为加0。

很明显，当访问IADD指令时，只有最后访问的指令是ICONST_0时，才必须删除它。

这需要将状态存储在方法适配器内部。因此，这种转换称为**有状态转换**。

让我们在此示例中查看更多详细信息。 

当访问ICONST_0时，仅当下一条指令为IADD时，才必须将其删除。

问题在于下一条指令尚不知道。

解决方案是将该决定推迟到下一条指令：

如果是IADD，则删除两条指令，否则发出ICONST_0和当前指令。

为了实现删除或替换某些指令序列的转换，可以方便地引入MethodVisitor子类，该子类的visitXxx Insn方法调用通用的 visitInsn() 方法：

```java
public abstract class PatternMethodAdapter extends MethodVisitor {
    protected final static int SEEN_NOTHING = 0;
    protected int state;

    public PatternMethodAdapter(int api, MethodVisitor mv) {
        super(api, mv);
    }

    @Overrid 
    public void visitInsn(int opcode) {
        visitInsn();
        mv.visitInsn(opcode);
    }

    @Override 
    public void visitIntInsn(int opcode, int operand) {
        visitInsn();
        mv.visitIntInsn(opcode, operand);
    }

    ...
    protected abstract void visitInsn();
}
```

上面的转换接口可以实现如下：

```java
public class RemoveAddZeroAdapter extends PatternMethodAdapter {

    private static int SEEN_ICONST_0 = 1;
    
    public RemoveAddZeroAdapter(MethodVisitor mv) {
        super(ASM4, mv);
    }

    @Override 
    public void visitInsn(int opcode) {
        if (state == SEEN_ICONST_0) {
            if (opcode == IADD) {
                state = SEEN_NOTHING;
                return;
            }
        }
        visitInsn();
        if (opcode == ICONST_0) {
            state = SEEN_ICONST_0;
            return;
        }
        mv.visitInsn(opcode);
    }

    @Override 
    protected void visitInsn() {
        if (state == SEEN_ICONST_0) {
            mv.visitInsn(ICONST_0);
        }
        state = SEEN_NOTHING;
    }
}
```

`visitInsn(int)` 方法首先测试是否已检测到序列。

在这种情况下，它将重新初始化状态并立即返回，这具有删除序列的作用。

在其他情况下，它调用公共visitInsn方法，如果这是最后访问的指令，则该方法将发出一个ICONST_0。

然后，如果当前指令是ICONST_0，它将记住该事实并返回，以推迟有关该指令的决定。 

在所有其他情况下，当前指令将转发给下一位访客。

## 标签(Label)和 帧(Frames)

如前几节所述，标签和 Frame 在它们相关的指令之前被访问。

换句话说，尽管它们本身不是指令，但它们与指令同时访问。

这对检测指令序列的转换有影响，但是这种影响实际上是一个优势。

确实，如果我们删除的指令之一是跳转指令的目标，将会发生什么？

如果某些指令可能跳转到ICONST_0，则意味着有一个标签指定该指令。

删除这两个说明后，此标签将指定删除的IADD之后的指令，这就是我们想要的。

但是，如果某些指令可能跳转到IADD，则无法删除指令序列（我们无法确定在此跳转之前将0压入堆栈）。

希望在这种情况下，ICONST_0之间必须有标签IADD，这很容易被发现。

### 堆栈映射

堆栈映射 Frames 的推理是相同的：

如果在两条指令之间访问了堆栈映射框架，我们将无法删除它们。

两种情况都可以通过将标签和帧视为模式匹配算法中的指令来处理。

这可以在 PatternMethodAdapter 中完成（请注意，visitMaxs还会调用通用的visitInsn方法；这用于处理方法的结尾是必须检测到的序列的前缀的情况）：

```java
public abstract class PatternMethodAdapter extends MethodVisitor {
    ...
    @Override 
    public void visitFrame(int type, int nLocal, Object[] local,
        int nStack, Object[] stack) {
        visitInsn();
        mv.visitFrame(type, nLocal, local, nStack, stack);
    }

    @Override 
    public void visitLabel(Label label) {
        visitInsn();
        mv.visitLabel(label);
    }

    @Override 
    public void visitMaxs(int maxStack, int maxLocals) {
        visitInsn();
        mv.visitMaxs(maxStack, maxLocals);
    }
}
```

正如我们将在下一章中看到的那样，编译后的方法可能包含信息有关源文件行号的信息，例如在异常堆栈跟踪中使用。

使用visitLineNumber方法访问此信息，该方法也与指令同时调用。

但是，在此，指令序列中间的行号对转换或删除它的可能性没有任何影响。

因此，解决方案是在模式匹配算法中完全忽略它们。


## 一个更复杂的例子

前面的示例可以轻松地推广到更复杂的指令序列。

例如，考虑一个转换，该转换通常由于输入错误而删除了自身字段分配，

例如f = f；或以字节码表示，ALOAD 0 ALOAD 0 GETFIELD f PUTFIELD f。

在执行此转换之前，最好设计状态机以识别此序列（请参见图3.6）。

![image](https://user-images.githubusercontent.com/18375710/70499757-c84e5100-1b54-11ea-9b17-55d7a3c8115d.png)

每个转换都用条件（当前指令的值）和操作（必须发出的指令序列，以粗体显示）标记。

例如，如果当前指令不是ALOAD 0，则会发生从S1到S0的转换。

在这种情况下，将发出被访问以达到此状态的ALOAD 0。

注意从S2到自身的过渡：当发现三个或更多连续的ALOAD 0时，就会发生这种情况。

在这种情况下，我们保持访问两个ALOAD 0的状态，然后发出第三个ALOAD 0。

找到状态机后，编写相应的方法适配器

一旦找到状态机，就可以直接编写相应的方法适配器（8个切换用例对应于图中的8个转换）：

```java
class RemoveGetFieldPutFieldAdapter extends PatternMethodAdapter {

    private final static int SEEN_ALOAD_0 = 1;
    private final static int SEEN_ALOAD_0ALOAD_0 = 2;
    private final static int SEEN_ALOAD_0ALOAD_0GETFIELD = 3;

    private String fieldOwner;
    private String fieldName;
    private String fieldDesc;

    public RemoveGetFieldPutFieldAdapter(MethodVisitor mv) {
        super(mv);
    }

    @Override
    public void visitVarInsn(int opcode, int var) {
        switch (state) {
            case SEEN_NOTHING: // S0 -> S1
                if (opcode == ALOAD && var == 0) {
                state = SEEN_ALOAD_0;
                return;
                }
                break;

            case SEEN_ALOAD_0: // S1 -> S2
                if (opcode == ALOAD && var == 0) {
                    state = SEEN_ALOAD_0ALOAD_0;
                    return;
                }
                break;
            case SEEN_ALOAD_0ALOAD_0: // S2 -> S2
                if (opcode == ALOAD && var == 0) {
                    mv.visitVarInsn(ALOAD, 0);
                    return;
                }
                break;
        }
        visitInsn();
        mv.visitVarInsn(opcode, var);
    }

    @Override
    public void visitFieldInsn(int opcode, String owner, String name,
        String desc) {
        switch (state) {
            case SEEN_ALOAD_0ALOAD_0: // S2 -> S3
                if (opcode == GETFIELD) {
                    state = SEEN_ALOAD_0ALOAD_0GETFIELD;
                    fieldOwner = owner;
                    fieldName = name;
                    fieldDesc = desc;
                    return; 
                }
                break;
                
            case SEEN_ALOAD_0ALOAD_0GETFIELD: // S3 -> S0
                if (opcode == PUTFIELD && name.equals(fieldName)) {
                    state = SEEN_NOTHING;
                    return;
                }
                break;
        }
        visitInsn();
        mv.visitFieldInsn(opcode, owner, name, desc);
    }

    @Override protected void visitInsn() {
        switch (state) {
            case SEEN_ALOAD_0: // S1 -> S0
                mv.visitVarInsn(ALOAD, 0);
                break;
            case SEEN_ALOAD_0ALOAD_0: // S2 -> S0
                mv.visitVarInsn(ALOAD, 0);
                mv.visitVarInsn(ALOAD, 0);
                break;
            case SEEN_ALOAD_0ALOAD_0GETFIELD: // S3 -> S0
                mv.visitVarInsn(ALOAD, 0);
                mv.visitVarInsn(ALOAD, 0);
                mv.visitFieldInsn(GETFIELD, fieldOwner, fieldName, fieldDesc);
                break;
        }
        state = SEEN_NOTHING;
    }
}
```

请注意，出于与第3.2.4节中的AddTimerAdapter情况相同的原因，本节中介绍的有状态转换无需转换堆栈映射帧：

原始帧在转换后仍然有效。

他们甚至不需要转换局部变量和操作数堆栈大小。

最后，必须注意的是，状态转换不限于检测和转换指令序列的转换。

许多其他类型的转换也是全状态的。

例如，下一节中介绍的方法适配器就是这种情况。


# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)

* any list
{:toc}