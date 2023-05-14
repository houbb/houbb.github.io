---
layout: post
title: JDK19 新特性详解，2022-09-20发布GA版本
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# jdk19

JDK19于2022-09-20发布GA版本，本文将会详细介绍JDK19新特性的使用。

JDK 19：https://openjdk.org/projects/jdk/19

# 新特性列表

新特性列表如下：

JPE-405：Record模式（预览功能）
JPE-422：JDK移植到Linux/RISC-V
JPE-424：外部函数和内存API（预览功能）
JPE-425：虚拟线程，也就是协程（预览功能）
JPE-426：向量API（第四次孵化）
JPE-427：switch匹配模式（第三次预览）
JPE-428：结构化并发（孵化功能）

# Record模式

使用Record模式增强Java编程语言以解构Record值。

可以嵌套Record模式和Type模式，以实现强大的、声明性的和可组合的数据导航和处理形式。

这个描述看起来有点抽象，下面举几个JEP-405的例子结合文字理解一下。以JDK16扩展的instanceof关键字下使用Type模式来看：

```java
// JDK16以前
private static void oldInstanceOf(Object x) {
    if (x instanceof String) {
        String s = (String) x;
        System.out.println(s);
    }
}

// JDK16或之后启用instanceof下的Type模式
private static void newInstanceOfTypePattern(Object x) {
    if (x instanceof String s) {
        System.out.println(s);
    }
}
```

Type模式在JDK17和JDK18扩展到switch预览功能中，应用于其case标签：

```java
// DEMO-1
private static void switchTypePattern(String s) {
    switch (s) {
        case null -> System.out.println("NULL");
        case "Foo", "Bar" -> System.out.println("Foo or Bar");
        default -> System.out.println("Default");
    }
}

// DEMO-2
interface Shape{}
class Rectangle implements Shape{}
class Triangle implements Shape{
    public int calculateArea(){
        return 200;
    }
}

private static void switchTypePatternForShape(Shape shape) {
    switch (shape) {
        case null:
            break;
        case Rectangle r:
            System.out.printf("Rectangle[%s]\n", r);
            break;
        case Triangle t:
            if (t.calculateArea() > 100) {
                System.out.printf("Large triangle[%s]\n", t);
            }
        default:
            System.out.println("Default shape");
    }
}

// DEMO-3 patterns in labels
private static void switchTypeForLabels(Object x) {
    String formatted = switch (x) {
        case Integer i -> String.format("int => %d", i);
        case Long l -> String.format("long => %d", l);
        case Double d -> String.format("double => %f", d);
        case String s -> String.format("string => %s", s);
        default -> x.toString();
    };
}
```

本次的Record模式预览功能就是基于record关键字实现上面的Type类型或者switch模式。

例如：

```java
// DEMO-1
record Point(int x,int y){}

private static void printSum(Object o){
    if (o instanceof Point(int x,int y)){
        System.out.println(x + y);
    }
}
```

record类中如果存在泛型参数可以进行类型转换和推导，例如：

```java
// DEMO-2
record Holder<T>(T target){}

// 擦除后
private void convert(Holder<Object> holder){
    if (Objects.nonNull(holder) && holder instanceof Holder<Object>(String target)) {
        System.out.printf("string => %s\n", target);
    }
}

// 非擦除
private <T> void convert(Holder<T> holder){
    if (Objects.nonNull(holder) && holder instanceof Holder<T>(String target)) {
        System.out.printf("string => %s\n", target);
    }
}
```

然后看record和switch结合使用：

```java
// DEMO-3
sealed interface I permits C, D {}
final class C implements I {}
final class D implements I {}

Second<I,I> second;

private void recordSwitch() {
    second = new Second<>(new D(), new C());
    // second = new Second<>(new C(), new D());
    switch (second) {
        case Second<I, I>(C c,D d) -> System.out.printf("c => %s,d => %s", c, d);
        case Second<I, I>(D d,C c) -> System.out.printf("d => %s,c => %s", d, c);
        default -> System.out.println("default");
    }
}
```

这种模式比较复杂，因为涉及到record类、switch模式、泛型参数并且参数类型是接口，case子句处理的时候必须覆盖该泛型参数接口的所有子类型

不得不说，JDK引入的语法糖越来越复杂，功能看起来是强大的，但是编码的可读性在未适应期有所下降

# Linux/RISC-V移植

通过Linux/RISC-V移植，Java将获得对硬件指令集的支持，该指令集已被广泛的语言工具链支持。

RISC-V是一种包含矢量指令的通用64位 ISA，目前该端口支持以下的HotSpot VM选项：

模板解释器
客户端JIT编译器
服务端JIT编译器
包括ZGC和Shenandoah在内的主流垃圾收集器

该移植基本已经完成，JEP的重点是将该端口集成到JDK的主仓库中。

# 外部函数和内存API

外部函数和内存API的主要功能是引入一组API，Java程序可以通过该组API与Java运行时之外的代码和数据进行交互。有以下目标：

易用性：通过卓越的纯Java开发模型代替JNI
高性能：提供能与当前JNI或者Unsafe相当甚至更优的性能
通用性：提供支持不同种类的外部内存（如本地内存、持久化内存和托管堆内存）的API，并随着时间推移支持其他操作系统甚至其他语言编写的外部函数
安全性：允许程序对外部内存执行不安全的操作，但默认警告用户此类操作

核心的API和功能如下：

分配外部内存：MemorySegment、MemoryAddress和SegmentAllocator
操作和访问结构化的外部内存：MemoryLayout和VarHandle
控制外部内存：MemorySession
调用外部函数：Linker、FunctionDescriptor和SymbolLookup

这些API统称为FFM API，位于java.base模块的java.lang.foreign包中。

由于API比较多并且不算简单，这里只举一个简单的例子：

```java
public class AllocMemoryMain {

    public static void main(String[] args) {
        new AllocMemoryMain().allocMemory();
    }

    /**
     * 分配内存
     * struct Point {
     * int x;
     * int y;
     * } pts[10];
     */
    public void allocMemory() {
        Random random = new Random();
        // 分配本地内存
        MemorySegment segment = MemorySegment.allocateNative(2 * 4 * 10, MemorySession.openImplicit());
        // 创建顺序内存布局
        SequenceLayout ptsLayout = MemoryLayout.sequenceLayout(10, MemoryLayout.structLayout(
                ValueLayout.JAVA_INT.withName("x"),
                ValueLayout.JAVA_INT.withName("y")));
        // 对内存设置值
        VarHandle xHandle = ptsLayout.varHandle(MemoryLayout.PathElement.sequenceElement(), MemoryLayout.PathElement.groupElement("x"));
        VarHandle yHandle = ptsLayout.varHandle(MemoryLayout.PathElement.sequenceElement(), MemoryLayout.PathElement.groupElement("y"));
        for (int i = 0; i < ptsLayout.elementCount(); i++) {
            int x = i * random.nextInt(100);
            int y = i * random.nextInt(100);
            xHandle.set(segment,/* index */ (long) i,/* value to write */x); // x
            yHandle.set(segment,/* index */ (long) i,/* value to write */ y); // y
            System.out.printf("index => %d, x = %d, y = %d\n", i, x, y);
        }
        // 获取内存值
        int xValue = (int) xHandle.get(segment, 5);
        System.out.println("Point[5].x = " + xValue);
        int yValue = (int) yHandle.get(segment, 6);
        System.out.println("Point[6].y = " + yValue);
    }
}

// 某次执行输出结果
index => 0, x = 0, y = 0
index => 1, x = 79, y = 16
index => 2, x = 164, y = 134
index => 3, x = 150, y = 60
index => 4, x = 152, y = 232
index => 5, x = 495, y = 240
index => 6, x = 54, y = 162
index => 7, x = 406, y = 644
index => 8, x = 464, y = 144
index => 9, x = 153, y = 342
Point[5].x = 495
Point[6].y = 162
```

FFM API是一组极度强大的API，有了它可以灵活地安全地使用外部内存和外部（跨语言）函数。

# 虚拟线程

虚拟线程，就是轻量级线程，也就是俗称的协程，虚拟线程的资源分配和调度由VM实现，与平台线程（platform thread）有很大的不同。

从目前的源代码来看，虚拟线程的状态管理、任务提交、休眠和唤醒等也是完全由VM实现。

可以通过下面的方式创建虚拟线程：

```java
// 方式一：直接启动虚拟线程，因为默认参数原因这样启动的虚拟线程名称为空字符串
Thread.startVirtualThread(() -> {
    Thread thread = Thread.currentThread();
    System.out.printf("线程名称:%s,是否虚拟线程:%s\n", thread.getName(), thread.isVirtual());
});

// 方式二：Builder模式构建
Thread vt = Thread.ofVirtual().allowSetThreadLocals(false)
        .name("VirtualWorker-", 0)
        .inheritInheritableThreadLocals(false)
        .unstarted(() -> {
            Thread thread = Thread.currentThread();
            System.out.printf("线程名称:%s,是否虚拟线程:%s\n", thread.getName(), thread.isVirtual());
        });
vt.start();

// 方式三：Factory模式构建
ThreadFactory factory = Thread.ofVirtual().allowSetThreadLocals(false)
        .name("VirtualFactoryWorker-", 0)
        .inheritInheritableThreadLocals(false)
        .factory();
Thread virtualWorker = factory.newThread(() -> {
    Thread thread = Thread.currentThread();
    System.out.printf("线程名称:%s,是否虚拟线程:%s\n", thread.getName(), thread.isVirtual());
});
virtualWorker.start();
// 可以构建"虚拟线程池"
ExecutorService executorService = Executors.newThreadPerTaskExecutor(factory);
```

由于虚拟线程的功能还处于预览阶段，创建协程的时候无法自定义执行器（准确来说是运载线程），目前所有虚拟线程都是交由一个内置的全局ForkJoinPool实例执行，实现方式上和JDK8中新增的并行流比较接近。

另外，目前来看虚拟线程和原来的JUC类库是亲和的，可以把虚拟线程替换原来JUC类库中的Thread实例来尝试使用（在生产应用建议等该功能正式发布）

# 向量API

向量API目前是第四次孵化，功能是表达向量计算，在运行时编译为CPU 架构上的最佳向量指令，从而实现优于等效标量计算的性能。

目前相关API都在jdk.incubator.vector包下，使用的例子如下：

```java
static final VectorSpecies<Float> SPECIES = FloatVector.SPECIES_256;

private static void vectorComputation(float[] a, float[] b, float[] c) {
    for (int i = 0; i < a.length; i += SPECIES.length()) {
        var m = SPECIES.indexInRange(i, a.length);
        var va = FloatVector.fromArray(SPECIES, a, i, m);
        var vb = FloatVector.fromArray(SPECIES, b, i, m);
        var vc = va.mul(va).add(vb.mul(vb)).neg();
        vc.intoArray(c, i, m);
    }
}

public static void main(String[] args) {
    float[] a = new float[]{1.0f, 3.0f, 2.0f};
    float[] b = {1.0f, -1.0f, 5.0f};
    float[] c = {1.0f, 6.0f, 1.0f};
    vectorComputation(a, b, c);
    System.out.println(Arrays.toString(c));
}
```

Vector有很多特化子类，可以通过不同的VectorSpecies进行定义。

# switch匹配模式

switch匹配模式第三次预览，主要是对匹配模式进行了扩展。主要有几点改进：

增强类型校验，case子句支持多种类型

```java
record Point(int i, int j) {}
enum Color { RED, GREEN, BLUE; }

private void multiTypeCase(Object o) {
    switch (o) {
        case null -> System.out.println("null");
        case String s -> System.out.println("String");
        case Color c -> System.out.println("Color: " + c.toString());
        case Point p -> System.out.println("Record class: " + p.toString());
        case int[] ia -> System.out.println("Array of ints of length" + ia.length);
        default -> System.out.println("Something else");
    }
}
```

增强表达式和语句的表现力和适用性，可以实现selector模式

```java
private int selector(Object o) {
    return switch (o) {
        case String s -> s.length();
        case Integer i -> i;
        default -> 0;
    };
}
```

扩展模式变量声明范围

```java
private void switchScope(Object o) {
    switch (o) {
        case Character c
                when c.charValue() == 7:
            System.out.println("Seven!");
            break;
        default:
            break;
    }
}
```

优化null处理

```java
private void switchNull(Object o) {
    switch (o) {
        case null -> System.out.println("null!");
        case String s -> System.out.println("String");
        default -> System.out.println("Something else");
    }
}
```

# 结构化并发

结构化并发功能在孵化阶段，该功能旨在通过结构化并发库来简化多线程编程。

结构化并发提供的特性将在不同线程中运行的多个任务视为一个工作单元，以简化错误处理和取消，提高了可靠性和可观测性。

```java
record User(String name, Long id){}
record Order(String orderNo, Long id){}
record Response(User user, Order order){}

private User findUser(){
    throw new UnsupportedOperationException("findUser");
}

private Order fetchOrder(){
    throw new UnsupportedOperationException("fetchOrder");
}

private Response handle() throws ExecutionException, InterruptedException {
    try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
        Future<User> user = scope.fork(() -> findUser());
        Future<Order> order = scope.fork(() -> fetchOrder());
        scope.join();           // Join both forks
        scope.throwIfFailed();  // ... and propagate errors
        // Here, both forks have succeeded, so compose their results
        return new Response(user.resultNow(), order.resultNow());
    }
}
```

# 参考资料

https://juejin.cn/post/7146948066409447454

* any list
{:toc}