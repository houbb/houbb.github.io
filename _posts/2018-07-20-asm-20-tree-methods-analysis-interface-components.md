---
layout: post
title:  ASM-19-Method 分析接口与组件
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, tree-api, sh]
published: true
---

# 接口和组件

用于代码分析的ASM API在 org.objectweb.asm.tree.analysis 软件包中。

就像包名称所暗示的那样，它基于树API。

实际上，该程序包提供了进行正向数据流分析的框架。

为了能够使用或多或少的精确值集执行各种数据流分析，数据流分析算法分为两部分：

一个是固定的，由框架提供，另一个是可变的，由用户提供。 

更确切地说：

在Analyzer和Frame类中，一劳永逸地实现了整个数据流分析算法，以及从堆栈弹出并推回堆栈的任务，并使用了适当数量的值。

组合值和计算值集并集的任务由解释器和值抽象类的用户定义子类执行。 

提供了几个预定义的子类，并在下一节中进行说明。

尽管该框架的主要目标是执行数据流分析，但Analyzer类也可以构造所分析方法的控制流图。

这可以通过重写此类的newControlFlowEdge和newControlFlowExceptionEdge方法来完成，这些方法默认情况下不执行任何操作。

该结果可用于进行控制流分析。

# 基本数据流分析

BasicInterpreter类是Interpreter抽象类的预定义子类之一。

它通过使用七个来模拟字节码指令的效果在BasicValue类中定义的一组值：

- UNINITIALIZED_VALUE表示“所有可能的值”。

- INT_VALUE表示“所有int，short，byte，boolean或char值”。

- FLOAT_VALUE表示“所有浮点值”。

- LONG_VALUE表示“所有长值”。

- DOUBLE_VALUE表示“所有双精度值”。

- REFERENCE_VALUE表示“所有对象和数组值”。

- RETURNADDRESS_VALUE用于子例程（请参阅附录A.2）。

该解释器本身并不是很有用（方法框架已经提供了此类信息，具有更多详细信息，请参见第3.1.5节），但可以将其用作“空”解释器实现，以构造分析器。

然后，可以使用此分析器来检测方法中无法访问的代码。

实际上，即使通过在跳转指令中跟随两个分支，也无法访问从第一条指令无法访问的代码。

结果是，在进行分析之后，无论采用哪种Interpreter实现，Analyzer.getFrames方法返回的计算帧对于无法到达的指令都是空的。

此属性可用于非常轻松地实现RemoveDeadCodeAdapter类（有更有效的方法，但它们需要编写更多代码）：

```java
public class RemoveDeadCodeAdapter extends MethodVisitor {
    String owner;
    MethodVisitor next;

    public RemoveDeadCodeAdapter(String owner, int access, String name,String desc, MethodVisitor mv) {
        super(ASM4, new MethodNode(access, name, desc, null, null));
        this.owner = owner;
        next = mv;
    }

    @Override 
    public void visitEnd() {
        MethodNode mn = (MethodNode) mv;
        Analyzer<BasicValue> a = new Analyzer<BasicValue>(new BasicInterpreter());
        try {
            a.analyze(owner, mn);
            Frame<BasicValue>[] frames = a.getFrames();
            AbstractInsnNode[] insns = mn.instructions.toArray();
            for (int i = 0; i < frames.length; ++i) {
                if (frames[i] == null && !(insns[i] instanceof LabelNode)) {
                    mn.instructions.remove(insns[i]);
                }
            }
        } catch (AnalyzerException ignored) {
        }
        mn.accept(next);
    }
}
```

当与第7.1.5节的OptimizeJumpAdapter结合使用时，将删除由跳转优化器引入的无效代码。 

例如，在checkAndSetF方法上使用此适配器链可以得到：

```
// after OptimizeJump // after RemoveDeadCode
    ILOAD 1 ILOAD 1
    IFLT label IFLT label
    ALOAD 0 ALOAD 0
    ILOAD 1 ILOAD 1
    PUTFIELD ... PUTFIELD ...
    RETURN RETURN
label: label:
F_SAME F_SAME
    NEW ... NEW ...
    DUP DUP
    INVOKESPECIAL ... INVOKESPECIAL ...
    ATHROW ATHROW
end: end:
F_SAME
    RETURN
```

请注意，死标签不会被去除。

这样做是有目的的：实际上，它不会更改结果代码，但是避免删除标签，该标签虽然不可访问，但是可能在LocalVariableNode中引用。

# 基本数据流验证器

BasicVerifier类扩展BasicInterpreter类。 

它使用相同的七个集合，但是与BasicInterpreter不同，它检查指令是否正确使用。

例如，它检查IADD指令的操作数是否为INTEGER_VALUE值（而BasicInterpreter仅返回结果，即INTEGER_VALUE）。

此类可以在类生成器或适配器的开发过程中用于调试目的，如3.3节所述。

例如，此类可以检测到ISTORE 1 ALOAD 1序列无效。

它可以包含在这样的实用程序方法适配器中（实际上是使用CheckMethodAdapter类更为简单，可以将其配置为使用BasicVerifier）：

```java
public class BasicVerifierAdapter extends MethodVisitor {
    String owner;
    MethodVisitor next;

    public BasicVerifierAdapter(String owner, int access, String name,
        String desc, MethodVisitor mv) {
        super(ASM4, new MethodNode(access, name, desc, null, null));
        this.owner = owner;
        next = mv;
    }

    @Override 
    public void visitEnd() {
        MethodNode mn = (MethodNode) mv;
        Analyzer<BasicValue> a = new Analyzer<BasicValue(new BasicVerifier());
        try {
            a.analyze(owner, mn);
        } catch (AnalyzerException e) {
            throw new RuntimeException(e.getMessage());
        }
        mn.accept(next);
    }
}
```

# 简单的数据流验证器

SimpleVerifier类扩展BasicVerifier类。 

它使用更多的集合来模拟字节码指令的执行：实际上，每个类都由自己的集合表示，该集合表示该类的所有可能对象。

因此，它可以检测更多错误，例如对可能值是“Thread类型的所有对象”的对象调用String类中定义的方法的事实。

此类使用Java反射API来执行与类层次结构有关的验证和计算。

因此，它将方法引用的类加载到JVM中。 

可以通过重写此类的受保护方法来更改此默认行为。

与BasicVerifier一样，可以在开发类生成器或适配器的过程中使用此类，以便更轻松地查找错误。

但是它也可以用于其他目的。

一个示例是一个转换，该转换消除了方法中不必要的强制转换：如果此分析器发现CHECKCAST to指令的操作数是值“所有from类型的对象”的集合，如果to是from的超类，则CHECKCAST 指令是不必要的，可以删除。

此转换的实现如下：

```java
public class RemoveUnusedCastTransformer extends MethodTransformer {
    String owner;
    public RemoveUnusedCastTransformer(String owner, MethodTransformer mt) {
        super(mt);
        this.owner = owner;
    }

    @Override 
    public MethodNode transform(MethodNode mn) {
        Analyzer<BasicValue> a = new Analyzer<BasicValue>(new SimpleVerifier());
        try {
            a.analyze(owner, mn);
            Frame<BasicValue>[] frames = a.getFrames();
            AbstractInsnNode[] insns = mn.instructions.toArray();
            for (int i = 0; i < insns.length; ++i) {
                AbstractInsnNode insn = insns[i];
                if (insn.getOpcode() == CHECKCAST) {
                    Frame f = frames[i];
                    if (f != null && f.getStackSize() > 0) {
                        Object operand = f.getStack(f.getStackSize() - 1);
                        Class<?> to = getClass(((TypeInsnNode) insn).desc);
                        Class<?> from = getClass(((BasicValue) operand).getType());
                        if (to.isAssignableFrom(from)) {
                            mn.instructions.remove(insn);
                        }
                    }
                }
            }
        } catch (AnalyzerException ignored) {
        }
        return mt == null ? mn : mt.transform(mn);
    }

    private static Class<?> getClass(String desc) {
        try {
            return Class.forName(desc.replace(’/’, ’.’));
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e.toString());
        }
    }

    private static Class<?> getClass(Type t) {
        if (t.getSort() == Type.OBJECT) {
            return getClass(t.getInternalName());
        }
        return getClass(t.getDescriptor());
    }
}
```

但是，对于Java 6类（或使用COMPUTE_FRAMES升级到Java 6的类），使用AnalyzerAdapter通过核心API进行此操作更为简单和高效：

```java
public class RemoveUnusedCastAdapter extends MethodVisitor {
    public AnalyzerAdapter aa;

    public RemoveUnusedCastAdapter(MethodVisitor mv) {
        super(ASM4, mv);
    }

    @Override 
    public void visitTypeInsn(int opcode, String desc) {
        if (opcode == CHECKCAST) {
            Class<?> to = getClass(desc);
            if (aa.stack != null && aa.stack.size() > 0) {
                Object operand = aa.stack.get(aa.stack.size() - 1);
                if (operand instanceof String) {
                    Class<?> from = getClass((String) operand);
                    if (to.isAssignableFrom(from)) {
                        return;
                    }
                }
            }
        }

        mv.visitTypeInsn(opcode, desc);
    }

    private static Class getClass(String desc) {
        try {
            return Class.forName(desc.replace(’/’, ’.’));
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e.toString());
        }
    }
}
```


# 用户定义的数据流分析

假设我们想检测潜在的空对象上的字段访问和方法调用，

例如下面的源代码片段（其中第一行阻止某些编译器检测错误，否则将被检测为 "o may not have been initialized" 错误）：

```java
Object o = null;
while (...) {
    o = ...;
}
o.m(...); // potential NullPointerException!
```

然后，我们需要进行数据流分析，以告诉我们，在对应于最后一行的INVOKEVIRTUAL指令处，对应于o的底部堆栈值可能为null。

为此，我们需要区分三个参考值集：

包含空值的NULL集，包含所有非空参考值的NONNULL集以及包含所有参考值的MAYBENULL集。

然后，我们只需要考虑ACONST_NULL将操作数堆栈上的NULL集合压入操作，而将其他引用值压入堆栈上的所有其他指令则将NONNULL设置压入（换句话说，我们认为任何字段访问或方法调用的结果都是 不为null –如果不对程序的所有类进行全局分析，我们将无法做得更好。

MAYBENULL集是表示NULL和NONNULL集的并集所必需的。

以上规则必须在自定义解释器子类中实现。

可以从头开始实现它，但是通过扩展BasicInterpreter类也可以并且更容易实现它。

确实，如果我们认为BasicValue.REFERENCE_VALUE对应于NONNULL集，那么我们只需要重写模拟ACONST_NULL执行的方法，以便它返回NULL，以及计算集合并集的方法：

```java
class IsNullInterpreter extends BasicInterpreter {

    public final static BasicValue NULL = new BasicValue(null);
    public final static BasicValue MAYBENULL = new BasicValue(null);

    public IsNullInterpreter() {
        super(ASM4);
    }

    @Override 
    public BasicValue newOperation(AbstractInsnNode insn) {
        if (insn.getOpcode() == ACONST_NULL) {
            return NULL;
        }
        return super.newOperation(insn);
    }

    @Override 
    public BasicValue merge(BasicValue v, BasicValue w) {
        if (isRef(v) && isRef(w) && v != w) {
            return MAYBENULL;
        }
        return super.merge(v, w);
    }

    private boolean isRef(Value v) {
        return v == REFERENCE_VALUE || v == NULL || v == MAYBENULL;
    }
}
```

然后，很容易使用此IsNullnterpreter来检测可能导致潜在的空指针异常的指令：

```java
public class NullDereferenceAnalyzer {

    public List<AbstractInsnNode> findNullDereferences(String owner, MethodNode mn) throws AnalyzerException {
        List<AbstractInsnNode> result = new ArrayList<AbstractInsnNode>();
        Analyzer<BasicValue> a = new Analyzer<BasicValue>(new IsNullInterpreter());
        a.analyze(owner, mn);
        Frame<BasicValue>[] frames = a.getFrames();
        AbstractInsnNode[] insns = mn.instructions.toArray();
        for (int i = 0; i < insns.length; ++i) {
            AbstractInsnNode insn = insns[i];
            if (frames[i] != null) {
                Value v = getTarget(insn, frames[i]);
                if (v == NULL || v == MAYBENULL) {
                    result.add(insn);
                }
            }
        }
        return result;
    }

    private static BasicValue getTarget(AbstractInsnNode insn, Frame<BasicValue> f) {
        switch (insn.getOpcode()) {
            case GETFIELD:
            case ARRAYLENGTH:
            case MONITORENTER:
            case MONITOREXIT:
                return getStackValue(f, 0);
            case PUTFIELD:
                return getStackValue(f, 1);
            case INVOKEVIRTUAL:
            case INVOKESPECIAL:
            case INVOKEINTERFACE:
                String desc = ((MethodInsnNode) insn).desc;
                return getStackValue(f, Type.getArgumentTypes(desc).length);
        }
        return null;
    }

    private static BasicValue getStackValue(Frame<BasicValue> f,
        int index) {
        int top = f.getStackSize() - 1;
        return index <= top ? f.getStack(top - index) : null;
    }
}
```

findNullDereferences方法使用IsNullInterpreter分析给定的方法节点。

然后，对于每条指令，它测试其参考操作数的可能值集（如果有）是否为NULL或NONNULL集。

如果是这种情况，则该指令可能导致空指针异常，因此将其添加到此方法返回的此类指令的列表中。

getTarget方法在帧f中返回与insn的对象操作数相对应的Value，如果insn没有对象操作数，则返回null。

它的主要作用是从操作数堆栈的顶部计算该值的偏移量，具体取决于指令的类型。

# 控制流分析

控制流分析可以有许多应用。

一个简单的例子是计算方法的循环复杂度。

此度量标准定义为控制流程图中的边数减去节点数再加上二。

例如，checkAndSetF方法的循环复杂度为 `11 − 12 + 2 = 1`，其控制流程图在8.1.2节中显示。

该度量标准很好地表明了方法的“复杂性”（此数字与方法中错误的平均数目之间存在相关性）。

它还提供了“正确”测试方法所必需的建议测试用例数。

可以使用ASM分析框架来实现计算该指标的算法（有很多更有效的方法，仅基于核心API，但是它们需要编写更多的代码）。

## 构建流程图

第一步需要构建控制流程图。

正如我们在本章开始所说的那样，可以通过重写Analyzer类的newControlFlowEdge方法来完成此操作。

此类将节点表示为Frame对象。

如果要将图形存储在这些对象中，则需要扩展Frame类：

```java
class Node<V extends Value> extends Frame<V> {

    Set< Node<V> > successors = new HashSet< Node<V> >();

    public Node(int nLocals, int nStack) {
        super(nLocals, nStack);
    }

    public Node(Frame<? extends V> src) {
        super(src);
    }
}
```

然后，我们可以提供一个Analyzer子类，该子类构造我们的控制流程图，并使用其结果来计算边的数量，节点的数量以及最终的圈复杂度：

```java
public class CyclomaticComplexity {

    public int getCyclomaticComplexity(String owner, MethodNode mn) throws AnalyzerException {
        Analyzer<BasicValue> a = new Analyzer<BasicValue>(new BasicInterpreter()) {
            protected Frame<BasicValue> newFrame(int nLocals, int nStack) {
                return new Node<BasicValue>(nLocals, nStack);
            }

            protected Frame<BasicValue> newFrame(
                Frame<? extends BasicValue> src) {
                return new Node<BasicValue>(src);
            }

            protected void newControlFlowEdge(int src, int dst) {
                Node<BasicValue> s = (Node<BasicValue>) getFrames()[src];
                s.successors.add((Node<BasicValue>) getFrames()[dst]);
            }
        };

        a.analyze(owner, mn);
        Frame<BasicValue>[] frames = a.getFrames();
        int edges = 0;
        int nodes = 0;
            for (int i = 0; i < frames.length; ++i) {
            if (frames[i] != null) {
                edges += ((Node<BasicValue>) frames[i]).successors.size();
                nodes += 1;
            }
        }
        return edges - nodes + 2;
    }
}
```


# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)

* any list
{:toc}