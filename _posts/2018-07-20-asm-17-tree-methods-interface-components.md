---
layout: post
title:  ASM-17-接口与组件
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, tree-api, sh]
published: true
---

# 方法

本章介绍如何使用ASM树API生成和转换方法。

它从仅提供树API的介绍开始，并提供一些说明性示例，然后介绍如何与核心API组合。

下一章介绍了用于泛型和注解的树形API。

# Interfaces and components 说明

## MethodNode

用于生成和转换方法的ASM树API基于MethodNode类（请参见图7.1）。

- Figure 7.1.: The MethodNode class (only fields are shown)

```java
public class MethodNode ... {
    public int access;
    public String name;
    public String desc;
    public String signature;
    public List<String> exceptions;
    public List<AnnotationNode> visibleAnnotations;
    public List<AnnotationNode> invisibleAnnotations;
    public List<Attribute> attrs;
    public Object annotationDefault;
    public List<AnnotationNode>[] visibleParameterAnnotations;
    public List<AnnotationNode>[] invisibleParameterAnnotations;
    public InsnList instructions;
    public List<TryCatchBlockNode> tryCatchBlocks;
    public List<LocalVariableNode> localVariables;
    public int maxStack;
    public int maxLocals;
}
```

此类的大多数字段与ClassNode中的相应字段相似。

从说明字段开始，最重要的是最后一个。

## InsnList

此字段是由InsnList对象管理的指令列表，其公共API如下：

```java
public class InsnList { // public accessors omitted
    int size();
    AbstractInsnNode getFirst();
    AbstractInsnNode getLast();
    AbstractInsnNode get(int index);
    boolean contains(AbstractInsnNode insn);
    int indexOf(AbstractInsnNode insn);
    void accept(MethodVisitor mv);
    ListIterator iterator();
    ListIterator iterator(int index);
    AbstractInsnNode[] toArray();
    void set(AbstractInsnNode location, AbstractInsnNode insn);
    void add(AbstractInsnNode insn);
    void add(InsnList insns);
    void insert(AbstractInsnNode insn);
    void insert(InsnList insns);
    void insert(AbstractInsnNode location, AbstractInsnNode insn);
    void insert(AbstractInsnNode location, InsnList insns);
    void insertBefore(AbstractInsnNode location, AbstractInsnNode insn);
    void insertBefore(AbstractInsnNode location, InsnList insns);
    void remove(AbstractInsnNode insn);
    void clear();
}
```

InsnList是指令的双链表，其链接存储在AbstractInsnNode对象本身中。

## AbstractInsnNode

这一点非常重要，因为它对必须使用指令对象和指令列表的方式产生许多影响：

一个AbstractInsnNode对象不能在指令列表中出现多次。

- AbstractInsnNode对象不能同时属于多个指令列表。

- 因此，将AbstractInsnNode添加到列表需要将其从其所属的列表中删除（如果有）。

- 另一个结果是，将列表的所有元素添加到另一个列表中会清除第一个列表。

AbstractInsnNode 类是表示字节码指令的类的超类。

其公共API如下：

```java
public abstract class AbstractInsnNode {
    public int getOpcode();
    public int getType();
    public AbstractInsnNode getPrevious();
    public AbstractInsnNode getNext();
    public void accept(MethodVisitor cv);
    public AbstractInsnNode clone(Map labels);
}
```

### 子类

它的子类是与MethodVisitor接口的visitXxx Insn方法相对应的Xxx InsnNode类，并且都以相同的方式构建。

例如，VarInsnNode类对应于visitVarInsn方法，并具有以下结构：

```java
public class VarInsnNode extends AbstractInsnNode {
    public int var;

    public VarInsnNode(int opcode, int var) {
        super(opcode);
        this.var = var;
    }
    ...
}
```

## 其他

标签和框架以及行号（虽然不是指令）也由AbstractInsnNode类的子类（即LabelNode，FrameNode和LineNumberNode类）表示。

这样就可以将它们插入到列表中相应的实际指令之前，就像在核心API中一样（其中标签和框架在其相应指令之前访问）。

因此，通过AbstractInsnNode类提供的getNext方法很容易找到跳转指令的目标：

这是目标标签之后的第一个AbstractInsnNode，它是真实指令。 

另一个结果是，与核心API一样，只要标签保持不变，删除一条指令就不会破坏跳转指令。

# 产生方法

使用树API生成方法包括创建MethodNode和初始化其字段。

最有趣的部分是方法代码的生成。

例如，可以如下生成3.1.5节的checkAndSetF方法：

```java
MethodNode mn = new MethodNode(...);
InsnList il = mn.instructions;
il.add(new VarInsnNode(ILOAD, 1));
LabelNode label = new LabelNode();
il.add(new JumpInsnNode(IFLT, label));
il.add(new VarInsnNode(ALOAD, 0));
il.add(new VarInsnNode(ILOAD, 1));
il.add(new FieldInsnNode(PUTFIELD, "pkg/Bean", "f", "I"));
LabelNode end = new LabelNode();
il.add(new JumpInsnNode(GOTO, end));
il.add(label);
il.add(new FrameNode(F_SAME, 0, null, 0, null));
il.add(new TypeInsnNode(NEW, "java/lang/IllegalArgumentException"));
il.add(new InsnNode(DUP));
il.add(new MethodInsnNode(INVOKESPECIAL,"java/lang/IllegalArgumentException", "<init>", "()V"));
il.add(new InsnNode(ATHROW));
il.add(end);
il.add(new FrameNode(F_SAME, 0, null, 0, null));
il.add(new InsnNode(RETURN));
mn.maxStack = 2;
mn.maxLocals = 2;
```

与类一样，与使用核心API相比，使用树API生成方法花费更多的时间并消耗更多的内存。

但这使以任何顺序生成其内容成为可能。

特别是，指令可以以与顺序不同的顺序生成，这在某些情况下可能很有用。

## 场景

例如考虑一个表达式编译器。

通常，表达式e1 + e2的编译是通过发出e1的代码，然后发出e2的代码，然后发出用于将两个值相加的代码来进行的。

但是，如果e1和e2不是同一原始类型，则必须在e1的代码之后插入一个强制类型转换，而在e2的代码之后插入另一个强制类型。

但是，必须发出的确切类型转换取决于e1和e2类型。

现在，如果表达式的类型是由发出已编译代码的方法返回的，则使用核心API时会遇到问题：

必须在e2编译后才知道必须在e1之后插入的强制类型转换，但这 为时已晚，因为我们无法在先前访问的指令之间插入指令。

使用tree API时，此问题不存在。

例如，一种可能性是使用编译方法，例如：

```java
public Type compile(InsnList output) {
    InsnList il1 = new InsnList();
    InsnList il2 = new InsnList();
    Type t1 = e1.compile(il1);
    Type t2 = e2.compile(il2);
    Type t = ...; // compute common super type of t1 and t2
    output.addAll(il1); // done in constant time
    output.add(...); // cast instruction from t1 to t
    output.addAll(il2); // done in constant time
    output.add(...); // cast instruction from t2 to t
    output.add(new InsnNode(t.getOpcode(IADD)));
    return t;
}
```

# Transforming methods

使用树API转换方法仅在于修改MethodNode对象的字段，尤其是指令列表。

尽管可以以任意方式修改此列表，但是一种常见的模式是在迭代时对其进行修改。

实际上，与常规ListIterator合同不同，InsnList返回的ListIterator支持许多concurrent2列表修改。

实际上，您可以使用InsnList方法删除当前元素之前（包括当前元素）的一个或多个元素，以删除一个或多个元素。
在下一个元素之后添加更多元素（即，不仅在当前元素之后，而且在其后继元素之后），或者在当前元素之前或后继元素之后插入一个或多个元素。

这些更改将反映在迭代器中，即，在迭代器中可以看到（看不见）下一个元素之后插入（删除）的元素。

当您需要在列表中的指令i之后插入几条指令时，修改指令列表的另一种常见模式是将这些新指令添加到临时指令列表中，并将此临时列表一步一步地插入主指令中：

```java
InsnList il = new InsnList();
il.add(...);
...
il.add(...);
mn.instructions.insert(i, il);
```

也可以一个接一个地插入指令，但是比较麻烦，因为插入点必须在每次插入后进行更新。

# 有状态与无状态转换

让我们举一些例子来具体了解如何使用tree API转换方法。

为了查看内核API和树API之间的差异，有趣的是重新实现3.2.4节的AddTimerAdapter示例和3.2.5节的RemoveGetFieldPutFieldAdapter。

计时器示例可以实现如下：

```java
public class AddTimerTransformer extends ClassTransformer {
    public AddTimerTransformer(ClassTransformer ct) {
        super(ct);
    }

    @Override 
    public void transform(ClassNode cn) {
        for (MethodNode mn : (List<MethodNode>) cn.methods) {
            if ("<init>".equals(mn.name) || "<clinit>".equals(mn.name)) {
                continue;
            }
            InsnList insns = mn.instructions;
            if (insns.size() == 0) {
                continue;
            }
            Iterator<AbstractInsnNode> j = insns.iterator();
            while (j.hasNext()) {
                AbstractInsnNode in = j.next();
                int op = in.getOpcode();
                if ((op >= IRETURN && op <= RETURN) || op == ATHROW) {
                    InsnList il = new InsnList();
                    il.add(new FieldInsnNode(GETSTATIC, cn.name, "timer", "J"));
                    il.add(new MethodInsnNode(INVOKESTATIC, "java/lang/System",
                    "currentTimeMillis", "()J"));
                    il.add(new InsnNode(LADD));
                    il.add(new FieldInsnNode(PUTSTATIC, cn.name, "timer", "J"));
                    insns.insert(in.getPrevious(), il);
                }
            }
            InsnList il = new InsnList();
            il.add(new FieldInsnNode(GETSTATIC, cn.name, "timer", "J"));
            il.add(new MethodInsnNode(INVOKESTATIC, "java/lang/System",
            "currentTimeMillis", "()J"));
            il.add(new InsnNode(LSUB));
            il.add(new FieldInsnNode(PUTSTATIC, cn.name, "timer", "J"));
            insns.insert(il);
            mn.maxStack += 4;
        }
        int acc = ACC_PUBLIC + ACC_STATIC;
        cn.fields.add(new FieldNode(acc, "timer", "J", null, null));
        super.transform(cn);
    }
}
```

您可以在此处看到上一部分中讨论的在指令列表中插入多条指令的模式，其中包括使用临时指令列表。

此示例还显示，可以在遍历指令列表的同时在当前指令之前插入指令。

请注意，实现此适配器所需的代码量与核心和树API大致相同。

## 删除字段

删除字段自赋值的方法适配器（请参阅3.2.5节）可以按以下方式实现（如果我们假设MethodTransformer与上一章的ClassTransformer类相似）：

```java
public class RemoveGetFieldPutFieldTransformer extends MethodTransformer {

    public RemoveGetFieldPutFieldTransformer(MethodTransformer mt) {
        super(mt);
    }

    @Override 
    public void transform(MethodNode mn) {
        InsnList insns = mn.instructions;
        Iterator<AbstractInsnNode> i = insns.iterator();
        while (i.hasNext()) {
            AbstractInsnNode i1 = i.next();
            if (isALOAD0(i1)) {
                AbstractInsnNode i2 = getNext(i1);
                    if (i2 != null && isALOAD0(i2)) {
                    AbstractInsnNode i3 = getNext(i2);
                        if (i3 != null && i3.getOpcode() == GETFIELD) {
                            AbstractInsnNode i4 = getNext(i3);
                            if (i4 != null && i4.getOpcode() == PUTFIELD) {
                            if (sameField(i3, i4)) {
                                while (i.next() != i4) {
                                }
                                insns.remove(i1);
                                insns.remove(i2);
                                insns.remove(i3);
                                insns.remove(i4);
                            }
                        }
                    }
                }
            }
        }

        super.transform(mn);
    }

    private static AbstractInsnNode getNext(AbstractInsnNode insn) {
        do {
            insn = insn.getNext();
            if (insn != null && !(insn instanceof LineNumberNode)) {
                break;
            }
        } while (insn != null);

        return insn;
    }

    private static boolean isALOAD0(AbstractInsnNode i) {
        return i.getOpcode() == ALOAD && ((VarInsnNode) i).var == 0;
    }

    private static boolean sameField(AbstractInsnNode i,AbstractInsnNode j) {
        return ((FieldInsnNode) i).name.equals(((FieldInsnNode) j).name);
    }
}
```

在这里我们再次看到可以在迭代指令列表时删除指令列表中的指令。

但是请注意 `while (i.next() != i4) {}` 循环：

将迭代器放置在必须删除的指令之后是必要的（因为不可能在当前指令之后删除指令）。

基于访客和树的实现都可以在要检测的序列中间检测标签和框架，在这种情况下，请不要将其删除。

但是，与基于核心的API相比，基于树的API（请参见getNext方法）要忽略序列中的行号，需要更多的代码。

但是，这两种实现之间的主要区别在于，**树API不需要状态机。尤其是三个或三个以上连续ALOAD 0指令的特殊情况（这很容易被忽略）不再是问题。**

通过上述实现，给定指令可以被检查一次以上，因为在while循环的每个步骤中，i2，i3和i4（将在将来的迭代中进行检查）也可以在该迭代中进行检查。

实际上，可以使用更高效的实现，其中每个指令最多检查一次：

```java
public class RemoveGetFieldPutFieldTransformer2 extends MethodTransformer {
    //...

    @Override 
    public void transform(MethodNode mn) {
        InsnList insns = mn.instructions;
        Iterator i = insns.iterator();
        while (i.hasNext()) {
            AbstractInsnNode i1 = (AbstractInsnNode) i.next();
            if (isALOAD0(i1)) {
                AbstractInsnNode i2 = getNext(i);
                if (i2 != null && isALOAD0(i2)) {
                    AbstractInsnNode i3 = getNext(i);
                    while (i3 != null && isALOAD0(i3)) {
                        i1 = i2;
                        i2 = i3;
                        i3 = getNext(i);
                    }

                    if (i3 != null && i3.getOpcode() == GETFIELD) {
                        AbstractInsnNode i4 = getNext(i);
                        if (i4 != null && i4.getOpcode() == PUTFIELD) {
                            if (sameField(i3, i4)) {
                            insns.remove(i1);
                            insns.remove(i2);
                            insns.remove(i3);
                            insns.remove(i4);
                            }
                        }
                    }
                }
            }
        }
        super.transform(mn);
    }

    private static AbstractInsnNode getNext(Iterator i) {
        while (i.hasNext()) {
            AbstractInsnNode in = (AbstractInsnNode) i.next();
            if (!(in instanceof LineNumberNode)) {
                return in;
            }
        }
        return null;
    }
    //...
}
```

与先前实现的区别是getNext方法，该方法现在作用于列表迭代器。

识别序列后，迭代器就紧随其后，因此不再需要 `while (i.next() != i4) {}` 循环。

但是这里又出现了三个或三个以上连续ALOAD 0指令的特殊情况（请参见 `while (i3 != null && isALOAD0(i3))` 循环）。

# 全局转换

到目前为止，我们所看到的所有方法转换都是局部的，甚至是有状态的转换，从某种意义上说，指令i的转换仅取决于距i固定距离的指令。

但是，存在全局转换，其中指令i的转换可能取决于可以在i任意距离处的指令。

对于这些转换，树API确实很有帮助，即使用核心API来实现它们确实很复杂。

一个示例是一种转换，该转换将跳转到GOTO标签的指令替换为跳转到label的指令，并用此RETURN指令替换从GOTO到RETURN指令的指令。

实际上，跳转指令的目标可以在该指令之前或之后的任意距离处。

可以按以下方式实现这种转换：

```java
public class OptimizeJumpTransformer extends MethodTransformer {
    
    public OptimizeJumpTransformer(MethodTransformer mt) {
        super(mt);
    }

    @Override 
    public void transform(MethodNode mn) {
        InsnList insns = mn.instructions;
        Iterator<AbstractInsnNode> i = insns.iterator();
        while (i.hasNext()) {
            AbstractInsnNode in = i.next();
            if (in instanceof JumpInsnNode) {
                LabelNode label = ((JumpInsnNode) in).label;
                AbstractInsnNode target;
                // while target == goto l, replace label with l
                while (true) {
                    target = label;
                    while (target != null && target.getOpcode() < 0) {
                        target = target.getNext();
                    }
                    if (target != null && target.getOpcode() == GOTO) {
                        label = ((JumpInsnNode) target).label;
                    } else {
                        break;
                    }
                }

                // update target
                ((JumpInsnNode) in).label = label;
                // if possible, replace jump with target instruction
                if (in.getOpcode() == GOTO && target != null) {
                    int op = target.getOpcode();
                    if ((op >= IRETURN && op <= RETURN) || op == ATHROW) {
                        // replace ’in’ with clone of ’target’
                        insns.set(in, target.clone(null));
                    }
                }
            }
        }
        super.transform(mn);
    }
}
```

该代码的工作方式如下：

找到跳转指令后，其目标存储在label中。

然后，使用最里面的while循环搜索此标签之后的指令（不代表真实指令的AbstractInsnNode对象（例如FrameNode或LabelNode）具有一个
否定的“操作码”）。

只要该指令是GOTO，就将标签替换为该指令的目标，并重复前面的步骤。

最后，将in的目标标签替换为该更新的标签值，如果in本身是GOTO且更新后的目标是RETURN指令，则将in替换为该return指令的副本（请注意，指令对象不能再出现 一次在指令列表中）。

下面显示了此转换对3.1.5节中定义的checkAndSetF方法的影响：

```
// before // after
    ILOAD 1 ILOAD 1
    IFLT label IFLT label
    ALOAD 0 ALOAD 0
    ILOAD 1 ILOAD 1
    PUTFIELD ... PUTFIELD ...
    GOTO end RETURN
label: label:
F_SAME F_SAME
    NEW ... NEW ...
    DUP DUP
    INVOKESPECIAL ... INVOKESPECIAL ...
    ATHROW ATHROW
end: end:
F_SAME F_SAME
    RETURN RETURN
```

请注意，尽管此转换更改了跳转指令（更正式地是控制流程图），但并不需要更新方法的框架。

实际上，每个指令的执行帧状态都保持不变，并且由于没有引入新的跳转目标，因此不必访问任何新帧。

但是，可能不再需要框架。

例如，在上面的示例中，在转换后不再使用结束标签，以及在其后的F_SAME帧和RETURN指令。

希望访问比严格要求更多的帧是完全合法的，并且在方法中包括未使用的代码（称为无效代码或无法访问的代码）。

因此，即使可以改进上面的方法适配器以除去无效代码和帧，上述方法适配器也是正确的。


# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)

* any list
{:toc}