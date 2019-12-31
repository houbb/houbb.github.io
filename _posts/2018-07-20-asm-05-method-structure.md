---
layout: post
title:  ASM-05-Method Structure
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, sh]
published: true
---

# 方法

本章说明如何使用核心ASM API生成和转换编译方法。

它首先介绍了已编译的方法，然后提供了许多说明性示例，介绍了相应的ASM接口，组件以及生成和转换它们的工具。

# 结构体

在已编译的类中，方法的代码存储为一系列字节码指令。

为了生成和转换类，了解这些指令并理解它们的工作原理至关重要。

本节概述了这些指令，这些指令应足以开始对简单的类生成器和转换器进行编码。

要获得完整的定义，您应该阅读Java虚拟机规范。

## 执行模式

在提供字节码指令之前，必须提供Java虚拟机执行模型。

如您所知，Java代码是在线程内部执行的。

每个线程都有其自己的执行堆栈，该堆栈由框架组成。

每个框架代表一个方法调用：每次调用一个方法时，都会在当前线程的执行堆栈上推送一个新框架。

当方法返回时，无论是正常还是由于异常，此帧都会从执行堆栈中弹出，并在调用方法中继续执行（其框现在位于堆栈的顶部）。

### 帧内容

每帧包含两部分：局部变量部分和操作数堆栈部分。

局部变量部分包含可由其索引以随机顺序访问的变量。 

顾名思义，操作数堆栈部分是一堆值，这些值被字节码指令用作操作数。

这意味着只能以后进先出的顺序访问此堆栈中的值。

不要混淆操作数栈和线程的执行栈：执行栈中的每一帧都包含自己的操作数栈。

### 大小

局部变量和操作数堆栈部分的大小取决于方法的代码。

它在编译时计算，并与字节码指令一起存储在已编译的类中。 

结果，与给定方法的调用相对应的所有框架都具有相同的大小，但是与不同方法相对应的框架的局部变量和操作数堆栈部分可以具有不同的大小。

![image](https://user-images.githubusercontent.com/18375710/70383186-7f579a80-19a4-11ea-9a70-5d8adca40c9b.png)

图3.1显示了一个具有3帧的示例执行堆栈。

第一帧包含3个局部变量，其操作数堆栈的最大大小为4，并且包含两个值。

第二帧在其操作数堆栈中包含2个局部变量和两个值。

最后，在执行堆栈顶部的第三帧包含4个局部变量和两个操作数。

创建框架后，将使用空堆栈初始化框架，并使用目标对象this（对于非静态方法）和方法的参数初始化其局部变量。

例如，调用方法 `a.equals(b)` 创建一个具有空堆栈的框架，并将前两个局部变量初始化为a和b（其他局部变量未初始化）。

- slot 内容

局部变量和操作数堆栈部分中的每个插槽都可以容纳任何Java值，但long和double值除外。这些值需要两个插槽。

这使局部变量的管理复杂化：

例如，第ith个方法参数不一定存储在局部变量i中。

例如，调用 `Math.max(1L, 2L)` 创建一个帧，该帧的前两个局部变量插槽中值为1L，第三个和第四个插槽中值为2L。

# 字节码指令

字节码指令由标识该指令的操作码和固定数量的参数组成：

操作码是一个无符号的字节值–因此是字节码名称–并由助记符标识。

例如，操作码值0由助记符NOP设计，并且对应于不执行任何操作的指令。参数是静态值，用于定义精确的指令行为。它们在操作码之后给出。 

例如，操作码值为167的GOTO标签指令将自变量标签指定为要执行的下一条指令。

指令参数不能与指令操作数混淆：

参数值是静态已知的，并存储在编译后的代码中，而操作数值来自操作数堆栈，并且仅在运行时才知道。

## 指令分类

字节码指令可分为两类：

一小组指令旨在将值从局部变量传输到操作数堆栈，反之亦然； 

其他指令仅作用于操作数堆栈：它们从堆栈中弹出一些值，根据这些值计算结果，然后将其压回堆栈。

ILOAD，LLOAD，FLOAD，DLOAD和ALOAD指令读取局部变量并将其值压入操作数堆栈。

他们将必须读取的局部变量的索引i作为参数。 

ILOAD用于加载布尔，字节，char，short或int局部变量。

LLOAD，FLOAD和DLOAD分别用于加载long，float或double值（LLOAD和DLOAD实际上加载了两个插槽i和i + 1）。

最后，ALOAD用于加载任何非原始值，即对象和数组引用。

对称地，ISTORE，LSTORE，FSTORE，DSTORE和ASTORE指令从操作数堆栈中弹出一个值，并将其存储在其索引i所指定的局部变量中。

## 各种指令列表

如您所见，输入了xLOAD和xSTORE指令（实际上，正如您将在下面看到的那样，几乎所有指令都已输入）。 

这用于确保不进行任何非法转换。

确实，将值存储在局部变量中然后将其装入其他类型是非法的。

例如，`ISTORE 1 ALOAD 1` 序列是非法的–它将允许在本地变量1中存储任意内存地址，并将该地址转换为对象引用！

但是，将一个值的类型与存储在该局部变量中的当前值的类型不同的值存储在局部变量中是完全合法的。

这意味着局部变量的类型，即存储在该局部变量中的值的类型可以在方法执行期间改变。

如上所述，所有其他字节码指令仅在操作数堆栈上工作。

它们可以分为以下类别（请参阅附录A.1）：

### Stack

这些指令用于操作堆栈上的值：

POP将值弹出到堆栈顶部，DUP推入顶部堆栈值的副本，SWAP弹出两个值并以相反顺序推入它们，依此类推。

### Constants

这些指令将一个常数值压入操作数堆栈：

ACONST_NULL推入null，

ICONST_0推入int值0，

FCONST_0推入0f，

DCONST_0推入0d，

BIPUSH b推入字节值b，

SIPUSH s推入短值s，

LDC cst推入任意int，float，long，double，String，或class1常数cst等。

### 算术与逻辑(Arithmetic and logic)

这些指令从操作数堆栈中弹出数值，并将它们组合在一起并将结果压入堆栈。

他们没有任何论点。 

xADD，xSUB，xMUL，xDIV和xREM对应于+，-，*，/和％运算，其中x为I，L，F或D。

同样，对于int和long值，还有与`<<`，`>>`，`>>>`，|，＆和^对应的其他指令。


### casts

这些指令从堆栈中弹出一个值，将其转换为另一种类型，然后将结果推回。

它们与Java中的转换表达式相对应。 

I2F，F2D，L2D等将数值从一种数值类型转换为另一种数值类型。

CHECKCAST t将参考值转换为类型t。


### 对象（objects）

这些指令用于创建对象，锁定对象，测试其类型等。

例如，NEW类型指令将类型为type的新对象压入堆栈（其中type是内部名称）。

### Fields

这些指令读取或写入字段的值。

GETFIELD所有者名称desc会弹出对象引用，并推送其名称字段的值。

PUTFIELD所有者名称desc会弹出一个值和一个对象引用，并将此值存储在其name字段中。

在这两种情况下，对象都必须是所有者类型，并且其字段必须是desc类型。

GETSTATIC和PUTSTATIC是相似的指令，但用于静态字段。

### Methods

这些指令调用方法或构造函数。

它们弹出与方法参数一样多的值，再加上目标对象的一个值，然后推送方法调用的结果。

INVOKEVIRTUAL所有者名称desc调用在类所有者中定义的name方法，其方法描述符为desc。

INVOKESTATIC用于静态方法，INVOKESPECIAL用于私有方法和构造函数，INVOKEINTERFACE用于接口中定义的方法。

最后，对于Java 7类，INVOKEDYNAMIC用于新的动态方法调用机制。

### 数组（Arrays）

这些指令用于读取和写入数组中的值。

xALOAD指令弹出一个索引和一个数组，然后将数组元素的值压入该索引。

xASTORE指令弹出一个值，一个索引和一个数组，并将该值存储在数组中的该索引处。

x可以是I，L，F，D或A，也可以是B，C或S。

### 跳（Jumps）

如果某些条件为真或无条件，这些指令将跳转到任意指令。

它们用于在是否中断，继续执行指令时进行编译。

例如，IFEQ label从堆栈中弹出一个int值，如果该值为0，则跳至label设计的指令（否则，执行将继续执行下一条指令）。

存在许多其他跳转指令，例如IFNE或IFGE。

最后，TABLESWITCH和LOOKUPSWITCH对应于switch Java指令。

### 返回（Return）

最后，xRETURN和RETURN指令用于终止方法的执行并将其结果返回给调用方。

RETURN用于返回void的方法，xRETURN用于其他方法。

# Example

让我们看一些基本示例，以更具体地了解字节码指令的工作方式。

考虑以下bean类：

```java
package pkg;

public class Bean {
    private int f;
    
    public int getF() {
        return this.f;
    }

    public void setF(int f) {
        this.f = f;
    }
}
```

## get 方法字节码

get 方法的字节码如下：

```
ALOAD 0
GETFIELD pkg/Bean f I
IRETURN
```

第一条指令读取局部变量0，该局部变量在创建此方法调用的框架期间已初始化为0，并将此值压入操作数堆栈。

第二条指令从堆栈中弹出此值，即this，并推送此对象的f字段，即this.f.

最后一条指令从堆栈中弹出该值，并将其返回给调用方。

此方法的执行帧的连续状态如图3.2所示。

![image](https://user-images.githubusercontent.com/18375710/70383849-21c94b00-19b0-11ea-8685-fe117883ee3e.png)

## set 方法字节码

set 方法字节码

```
ALOAD 0
ILOAD 1
PUTFIELD pkg/Bean f I
RETURN
```

与以前一样，第一条指令将其压入操作数堆栈。

第二条指令压入局部变量1，该局部变量在创建用于此方法调用的框架期间使用f参数值初始化。

第三条指令弹出这两个值，并将int值存储在所引用对象的f字段中，即在this.f中。

最后一条指令在源代码中是隐式的，而在编译后的代码中是强制性的，它破坏当前执行框架并返回给调用者。

此方法的执行帧的连续状态如图3.3所示。

![image](https://user-images.githubusercontent.com/18375710/70383882-a320dd80-19b0-11ea-963e-4ffd2875441f.png)

## 无参构造器

Bean类还具有由编译器生成的默认公共构造函数，因为程序员没有定义任何显式构造函数。

此默认的公共构造函数生成为

```java
Bean() { super(); } 
```

该构造函数的字节码如下：

```
ALOAD 0
INVOKESPECIAL java/lang/Object <init> ()V
RETURN
```

第一条指令将其压入操作数堆栈。 第二条指令从堆栈中弹出该值，并调用Object类中定义的 `<init>` 方法。

这对应于 super() 调用，即对超类Object的构造函数的调用。

您可以在此处看到，在编译类和源类中，构造函数的名称不同：

在已编译的类中，它们始终被命名为 `<init>`，而在源类中，它们具有其定义所在类的名称。

最后，最后一条指令返回给调用者。

## 更加复杂的场景

现在让我们考虑一个稍微复杂一些的setter方法：

```java
public void checkAndSetF(int f) {
    if (f >= 0) {
        this.f = f;
    } else {
        throw new IllegalArgumentException();
    }
}
```

字节码如下：

```
ILOAD 1
IFLT label
ALOAD 0
ILOAD 1
PUTFIELD pkg/Bean f I
GOTO end
label:
NEW java/lang/IllegalArgumentException
DUP
INVOKESPECIAL java/lang/IllegalArgumentException <init> ()V
ATHROW
end:
RETURN
```

第一条指令将局部变量1（初始化为f）压入操作数堆栈。

IFLT指令从堆栈中弹出该值，并将其与0进行比较。

如果小于（LT）0，则跳转到标签标签指定的指令，否则不执行任何操作，并继续执行下一条指令。

接下来的三个指令与setF方法中的指令相同。

GOTO指令无条件跳转到由结束标签指定的指令，即RETURN指令。

标签和结束标签之间的指令创建并引发异常：NEW指令创建异常对象并将其压入操作数堆栈。

DUP指令在堆栈上复制此值。

INVOKESPECIAL指令弹出这两个副本之一，并在其上调用异常构造函数。

最后，ATHROW指令弹出剩余的副本并将其作为异常抛出（因此执行不会继续执行下一条指令）。

# Exception handlers

没有字节码指令可以捕获异常：

相反，方法的字节码与异常处理程序列表相关联，该异常处理程序列表指定了在方法的给定部分中引发异常时必须执行的代码。

异常处理程序类似于try catch块：

它具有一个范围，该范围是与try块的内容相对应的一系列指令，以及一个与catch块的内容相对应的处理程序。

该范围由开始和结束标签指定，而处理程序由开始标签指定。

## 例子

例如下面的源代码：

```java
public static void sleep(long d) {
    try {
        Thread.sleep(d);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}
```

可以被编译为字节码：

```
TRYCATCHBLOCK try catch catch java/lang/InterruptedException
try:
LLOAD 0
INVOKESTATIC java/lang/Thread sleep (J)V
RETURN
catch:
INVOKEVIRTUAL java/lang/InterruptedException printStackTrace ()V
RETURN
```

try和catch标签之间的代码对应于try块，而catch标签之后的代码对应于catch块。

TRYCATCHBLOCK行指定一个异常处理程序，该处理程序覆盖try和catch标签之间的范围，该处理程序从catch标签开始，并且其类是InterruptedException的子类的异常。

这意味着，如果在try和catch之间的任何地方抛出了这样的异常，则该堆栈被清除，该异常将被推入该空堆栈，并且在catch处继续执行。


# 帧（Frames）

用Java 6或更高版本编译的类除包含字节码指令外，还包含一组堆栈映射框架，用于加速Java虚拟机内部的类验证过程。

堆栈映射框架（frame）给出了方法执行过程中某个时刻的执行框架状态。

更准确地说，它提供了在执行某些特定字节码指令之前每个局部变量插槽和每个操作数堆栈插槽中包含的值的类型。

例如，如果考虑上一节的getF方法，则可以定义三个堆栈映射框架，这些框架映射框架给出了执行框架的状态，这些状态恰好在ALOAD之前，GETFIELD之前和IRETURN之前。

这三个堆栈映射框架对应于图3.2中所示的三种情况，可以描述如下，其中第一个方括号之间的类型对应于局部变量，其他类型对应于操作数堆栈：

```
State of the execution frame before Instruction
[pkg/Bean] []                       ALOAD 0
[pkg/Bean] [pkg/Bean]               GETFIELD
[pkg/Bean] [I]                      IRETURN
```

checkAndSetF() 也可以表示如下：

```
State of the execution frame before     Instruction
[pkg/Bean I] []                         ILOAD 1
[pkg/Bean I] [I]                        IFLT label
[pkg/Bean I] []                         ALOAD 0
[pkg/Bean I] [pkg/Bean]                 ILOAD 1
[pkg/Bean I] [pkg/Bean I]               PUTFIELD
[pkg/Bean I] []                         GOTO end
[pkg/Bean I] []                         label :
[pkg/Bean I] []                         NEW
[pkg/Bean I] [Uninitialized(label)]     DUP
[pkg/Bean I] [Uninitialized(label) Uninitialized(label)] INVOKESPECIAL
[pkg/Bean I] [java/lang/IllegalArgumentException] ATHROW
[pkg/Bean I] []                         end :
[pkg/Bean I] []                         RETURN
```

除 `Uninitialized(label)` 类型外，这与以前的方法类似。

这是一种仅在堆栈映射框架中使用的特殊类型，它指定一个对象，该对象的内存已分配但尚未调用其构造函数。

该参数指定创建此对象的指令。

可以在此类型的值上调用的唯一可能方法是构造函数。

调用它时，框架中所有这种类型的事件都将替换为实际类型，此处为IllegalArgumentException。

堆栈映射框架可以使用其他三种特殊类型：UNINITIALIZED_THIS是构造函数中局部变量0的初始类型，TOP对应于未定义的值，而NULL对应于null。

### JDK6 的堆栈帧引入

如上所述，从Java 6开始，编译后的类除字节码外还包含一组堆栈映射框架。

为了节省空间，每条指令的编译方法不包含一帧：

实际上，它仅包含与跳转目标或异常处理程序相对应或无条件跳转指令之后的指令框架。

实际上，可以从这些框架中轻松快速地推断出其他框架。

- 对于 checkAndSetF 方法

对于checkAndSetF方法，这意味着仅存储两个帧：

一种用于NEW指令，因为它是IFLT指令的目标，还因为它遵循无条件跳转GOTO指令，一种用于RETURN指令，因为它是GOTO指令的目标，并且还因为它遵循 “无条件跳转” ATHROW指令。

**为了节省更多空间，通过仅存储与前一帧相比的差异来压缩每个帧，并且根本不存储初始帧，因为可以轻松地从方法参数类型中推导出它。**

在使用checkAndSetF方法的情况下，必须存储的两个帧相等并且等于初始帧，因此将它们存储为F_SAME助记符指定的单字节值。

这些帧可以在它们关联的字节码指令之前被表示。

### 最终字节码

这给出了checkAndSetF方法的最终字节码：

```
    ILOAD 1
    IFLT label
    ALOAD 0
    ILOAD 1
    PUTFIELD pkg/Bean f I
    GOTO end
label:
    F_SAME
    NEW java/lang/IllegalArgumentException
    DUP
    INVOKESPECIAL java/lang/IllegalArgumentException <init> ()V
    ATHROW
end:
F_SAME
    RETURN
```


# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)

* any list
{:toc}