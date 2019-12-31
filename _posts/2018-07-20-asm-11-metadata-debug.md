---
layout: post
title:  ASM-11-Metadata Debug 调试
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, annotation, sh]
published: true
---

# Debug

使用 `javac -g` 编译的类包含其源文件的名称，源行号和字节码指令之间的映射以及源代码中的本地变量名称和字节码中的本地变量槽之间的映射。

此可选信息在调试器中以及可用时在异常堆栈跟踪中使用。

# 结构体

类的源文件名存储在专用的类文件结构部分中（请参见图2.1）。

源行号和字节码指令之间的映射存储为方法的已编译代码部分中（行号，标签）对的列表。

例如，如果l1，l2和l3是按此顺序出现的三个标签，则以下对：

```
(n1, l1)
(n2, l2)
(n3, l3)
```

表示l1和l2之间的指令来自第n1行，l2和l3之间的指令来自第n2行，l3之后的指令来自第n3行。

请注意，给定的行号可以成对出现。

这是因为与出现在单个源代码行上的表达式相对应的指令在字节码中可能不是连续的。

例如对于 `(init; cond; incr` 语句； 通常按以下顺序编译：init语句incr cond。

源代码中的本地变量名称与字节码中的本地变量插槽之间的映射存储为方法的已编译代码部分中的（名称，类型描述符，类型签名，开始，结束，索引）元组的列表。

这样的元组意味着，在两个标签的开始和结束之间，插槽索引中的局部变量对应于其源代码中名称和类型由前三个元组元素给出的局部变量。

注意，编译器可以使用相同的局部变量槽来存储具有不同范围的不同源局部变量。

相反，可以将唯一的源局部变量编译为具有不连续范围的局部变量槽。 例如，可能会出现以下情况：

```
l1:
... // here slot 1 contains local variable i
l2:
... // here slot 1 contains local variable j
l3:
... // here slot 1 contains local variable i again
end:
```

相应的元组是：

```
("i", "I", null, l1, l2, 1)
("j", "I", null, l2, l3, 1)
("i", "I", null, l3, end, 1)
```

# 接口和组件

使用ClassVisitor和MethodVisitor类的三种方法访问调试信息：

1. 使用的visitSource方法访问源文件名ClassVisitor类；

2. 源行号和字节码指令之间的映射通过MethodVisitor类的visitLineNumber方法访问，一次一对。

3. 使用MethodVisitor类的visitLocalVariable方法访问源代码中的本地变量名称和字节码中的本地变量插槽之间的映射，一次访问一个元组。

在访问作为参数传递的标签之后，必须调用visitLineNumber方法。

实际上，在该标签之后调用它，这使得在方法访问者中很容易知道当前指令的源代码行：

```java
public class MyAdapter extends MethodVisitor {
    int currentLine;

    public MyAdapter(MethodVisitor mv) {
        super(ASM4, mv);
    }

    @Override
    public void visitLineNumber(int line, Label start) {
        mv.visitLineNumber(line, start);
        currentLine = line;
    }
    ...
}
```

同样，在访问作为参数传递的标签之后，必须调用visitLocalVariable方法。

这是与上一节中介绍的对和元组相对应的示例方法调用：

```java
visitLineNumber(n1, l1);
visitLineNumber(n2, l2);
visitLineNumber(n3, l3);
visitLocalVariable("i", "I", null, l1, l2, 1);
visitLocalVariable("j", "I", null, l2, l3, 1);
visitLocalVariable("i", "I", null, l3, end, 1);
```

# 忽略调试信息

为了访问行号和局部变量名，ClassReader类可能需要引入“人工” Label对象，从某种意义上说，跳转指令不需要它们，而只是代表调试信息。

这可能会在诸如3.2.5节中解释的情况下引入误报，在这种情况下，指令序列中间的Label被视为跳转目标，因此阻止了该序列的删除。

为了避免这些误报，可以在ClassReader.accept方法中使用 SKIP_DEBUG 选项。

使用此选项，类读取器不会访问调试信息，也不会为其创建人工标签。

当然，调试信息将从类中删除，因此仅当这对您的应用程序来说不是问题时才可以使用此选项。

注意：ClassReader类提供了其他选项，例如SKIP_CODE跳过对已编译代码的访问（如果只需要类结构，这将很有用），SKIP_FRAMES跳过堆栈映射框架，以及EXPAND_FRAMES取消压缩这些框架。

# 工具类

与泛型类型和注释一样，您可以使用TraceClassVisitor，CheckClassAdapter和ASMifier类来查找如何使用调试信息。


# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)

* any list
{:toc}