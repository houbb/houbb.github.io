---
layout: post
title:  JVM-10-虚拟机字节码执行引擎
date:  2018-10-08 16:04:16 +0800
categories: [JVM]
tags: [java, log, jvm, sf]
published: true
excerpt: JVM 虚拟机字节码执行引擎
---

# Java虚拟机的执行引擎

输入的是字节码文件，处理过程是字节码解析的等效过程，输出的是执行结果。

本章主要是从概念模型的角度讲解虚拟机的方法调用和字节码执行。

# 帧栈

帧栈是用于支持虚拟机进行方法调用和方法执行的数据结构，它是虚拟机运行时数据区中的虚拟机栈的栈元素。

每一个帧栈中都包括以下信息：局部变量表（Local Varable Table）、操作数栈（Operand Stack）、动态连接（Dynamic Linking）、方法返回地址（Return Address）和一些额外的附加信息。

一个帧栈需要分配多大内存，不会受到程序运行期间变量数据的影响，而是在程序代码编译时就确定了的（在方法表的Code属性中，详见类文件结构中的内容）。

一个线程中的方法调用链可能会很长，对于执行引擎来说，在活动线程中，只有位于栈顶的帧栈才是有效的，称为当前帧栈，与这个帧栈相关联的方法称为当前方法。

执行引擎运行的字节码指令都只针对当前帧栈进行操作，在概念模型上，典型的帧栈结构如下（栈是线程私有的，也就是每个线程都会有自己的栈）。

![帧栈](https://upload-images.jianshu.io/upload_images/1932449-a249e30ebf3c5408.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)

## 局部变量表

存放方法参数和方法内部定义的局部变量。在编译阶段，就在Class文件的Code属性的max_locals数据项中确定了该方法所需要分配的局部变量表的最大容量。（仅仅是变量，不包括具体的对象）。

局部变量表内部以变量槽（Variable Slot）为最小单位。对于byte、char、float、int、short、boolean、reference、returnAddress等长度不超过32位的数据类型，每个局部变量占用一个Slot，double和long这两种64位的数据类型则需要两个Slot。

在方法执行时，虚拟机是使用局部变量表完成参数值到参数变量列表的传递的，如果执行的是实例方法（非static方法），则局部变量表中第0位索引的Slot默认是用于传递方法所属对象实例的引用，在方法中通过this来访问这个隐含的参数。

### double float 的非原子性

对于64位的数据类型，比如long和double，JVM会以高位对齐的方式为其分配2个连续的Slot空间。

这里把long和double分割存储的做法与多线程环境下long和double的原子性的做法是一致的。

我们知道，在多线程环境下，long或者double的读具有原子性，而写不能保证具有原子性。

### 局部变量 slot 重用

局部变量表中的Slot是可重用的，如果当前字节码PC计数器的值已经超出了某变量的作用域，则这个变量对应的Slot可以交给其它变量重用。

重用可以节省栈空间，但也会带来副作用：（为虚拟机设置运行参数加上 `-verbose:gc` 即可输出gc日志信息）

- 测试1

```java
public static void main(String[] args){
        byte[] placeholder = new byte[64*1000*1000];
        System.gc();
}
```

查看日志，并未回收

```
[GC (System.gc())  69437K->63438K(251392K), 0.0012879 secs]
[Full GC (System.gc())  63438K->63277K(251392K), 0.0058505 secs]
```

- 测试 2

```java
public static void main(String[] args) {
        {
            byte[] placeholder = new byte[64 * 1000 * 1000];
        }
        System.gc();
}
```

查看日志，并未回收

```
[GC (System.gc())  69437K->63420K(251392K), 0.0011785 secs]
[Full GC (System.gc())  63420K->63277K(251392K), 0.0058676 secs]
```

- 测试 3

```java
public static void main(String[] args) {
        {
            byte[] placeholder = new byte[64 * 1000 * 1000];
        }
        int a = 0;
        System.gc();
}
```

查看日志，回收了

```
[GC (System.gc())  69437K->63454K(251392K), 0.0011921 secs]
[Full GC (System.gc())  63454K->777K(251392K), 0.0056915 secs]
```

测试1中在System.gc()时，变量placeholder还处在作用于之内，不会回收；

测试2在System.gc()时，变量placeholder虽然已经不在作用域，但是placeholder原本所占用的Slot还没有被复用，所以作为GC Root一部分的局部变量表仍然保持着对它的关联，所以也没有回收。这种关联没有被及时打破的影响在绝大部分

### 是否需要手动赋值为 null

下都很轻微，但假如有一个方法，后面的代码有一些耗时很长的操作，而前面又定义了占用大量内存、实际已经不会再使用的变量，则手动将其设为null是有意义的。
还有一点就是，局部变量不像类变量（仅指被static修饰的变量，不包括实例变量）一样存在准备阶段，它不存在系统默认值。

但笔者的观点是**没有必要**把置 null 当做一个普遍的编码规则来推广。

原因有两点：

1. 从编码角度讲，以恰当的变量作用域来控制变量回收时间才是最优雅的解决方法；

2. 从执行角度讲，使用赋null值的操作来优化内存回收是建立在对字节码执行引擎概念模型的理解之上的；

而赋null值的操作在经过 JIT 编译优化后就会被消除掉，这时候将变量设置为null就是没有意义的；

### 局部变量的初始化

局部变量不像前面介绍的类变量那样存在“准备阶段”。

我们知道，类变量在加载过程中要经过两次赋初始值的过程：一次在准备阶段，赋予系统初始值，另外一次在初始化阶段，赋予程序员定义的初始值。

但局部变量不一样，如果一个局部变量定义了但是没有赋初始值是不能使用的。

所有不要认为Java中任何情况下都存在着诸如整型变量默认为0，布尔型变量默认为false之类的默认值。

这一点要好好注意一下。

所以必须为局部变量定义初始值。

```java
public static void main(String[] args) {
    int a;
    System.out.println(a);
}
```

上面的代码无法运行，编译阶段就会报错。

## 操作数栈

操作数栈，也叫操作栈，是先入后出的栈。其中的元素是任意的Java数据类型，包括long和double。

32位数据类型所占容量为1，64位为2。

在方法执行的任何时刻，操作数栈的最大深度都不会超过Code属性中`max_stacks`数据项所设定的最大值。

当一个方法开始执行的时候，操作栈是空的，在方法的执行过程中，会有各种字节码指令出栈/入栈。

例如，在做算术运算的时候，是通过操作栈来进行的，调用其他方法的时候是通过操作栈来进行参数传递的。

例如，整数加法的字节码指令iadd在运行的时候，操作栈中最接近栈顶的两个元素已经存入了两个int型数值，当执行这个指令时，会将这两个int值出栈并相加，然后将相加的结果入栈。

在概念模型中，两个帧栈作为虚拟机栈的元素是完全独立的，但是在大多数虚拟机实现中都会做优化，将两个帧栈出现一部分重叠：让下面帧栈的部分操作栈与上面帧栈的部分局部变量表重叠，以便在方法调用时共用一部分数据，避免不必要的参数复制传递。

## 动态连接

每个帧栈都包含一个指向运行时常量池中该帧栈所属方法的引用。

持有这个引用是为了支持方法调用过程中的动态连接。

字节码中的方法调用指令（这里，“方法调用”是指令的修饰词，不要理解错了）以常量池中指向方法的符号引用作为参数。

这些符号引用一部分会在类加载阶段或者第一次使用的时候就转化为直接引用，这种转化称为静态解析。

另外一部分将在每一次运行期间转化为直接引用，这部分称为动态连接。

## 方法返回地址

当一个方法开始执行后，有两种方式退出这个方法：

## 正常完成出口

执行引擎遇到方法返回的字节码指令，此时将返回值传递给上层的方法调用者（是否有返回值以及返回值的类型由方法返回指令来决定）

## 异常完成出口

方法执行过程中出现异常，并且该异常没有在方法体中处理（可能是Java虚拟机内部产生的异常，也可能代码中使用athrow字节码指令产生的异常）。

方法退出实际就是当前帧出栈，因此退出时可能执行的操作有：恢复上层方法的局部变量表和操作数栈，把返回值（如果有）压入调用者帧栈的操作数栈中，调整PC计数器的值以指向方法调用指令后面的一条指令。

## 附加信息

规范之外的，取决于具体虚拟机实现。



# 方法调用

方法调用并不等同于方法执行，方法调用阶段的唯一目的就是确定被调用的方法的版本（即调用哪个方法）。

一切方法调用在Class文件里存储的都是符号引用，而不是方法的直接引用（方法在实际运行时内存布局中的入口地址）。

在虚拟机中，有5条方法调用字节码指令：

- invokestatic：调用静态方法；

- invokespecial：调用实例构造器 `<init>` 方法、私有方法和父类方法；

- invokevirtual：调用所有的虚方法；

- invokeinterface：调用接口方法，在运行时再确定一个实现此接口的对象；

- invokedynamic：先在运行时动态解析出调用点限定符所引用的方法，然后再执行该方法。

方法的调用可以分为解析调用和分派调用。

## 非虚方法与虚方法

- 非虚方法

只要能被invokestatic 和 invokespecial 指令调用的方法，都可以在解析阶段中确定唯一的调用版本，符合这个条件的有静态方法，私有方法，实例构造器，父类方法4类，他们在类加载的时候就会把符号引用解析为对该方法的直接引用。这些方法称为非虚方法；

- 虚方法：

其他的方法称为虚方法（除去final方法）

## 解析调用

在类加载中的解析阶段，会将方法调用中的目标方法的一部分符号引用转化为直接引用，这部分可以转化的前提是：方法在程序运行之前就有一个可确定的调用版本，并且这个方法的调用版本在运行期间是不可改变的。这类方法的调用称为解析（或解析调用）。

在Java中，符合上述特点（编译器可知，运行期不可变）的方法：静态方法和私有方法。

与对应方法调用指令，只要能被invokestatic和invokespecial指令调用的方法，都是可以在解析阶段确定唯一调用版本的。这类方法称为非虚方法，其他方法都称为虚方法。

在Java中，非虚方法除了invokestatic和invokespecial指令能调用的方法外，还包括final方法。

解析调用一定是静态的过程，在编译期间就可以完全确定，在类加载的解析阶段就可以把方法的符号引用转变为直接引用，不会延迟到运行期间再去完成。

## 分派调用

分派调用是理解继承、封装和多态（尤其是重载和重写）的关键。

对它的理解，可以更清楚虚拟机是如何确定正确的目标方法的。

## 静态分派

首先来理解两个概念：静态类型和实际类型。

```java
Human human = new Man();    //这里假设Man是Human的子类
```

上述代码中：Human为变量的静态类型，Man为变量的实际类型。

虚拟机（准确地说是编译器）在重载时，是通过参数的静态类型而不是实际类型作为判定依据的。

```java
public class StaticDispatch {

    static abstract class Human{}

    static class Man extends Human{}

    static class Woman extends Human{}

    public void sayHello(Human human){
        System.out.println("hello, human");
    }

    public void sayHello(Man man){
        System.out.println("hello, man");
    }

    public void sayHello(Woman woman){
        System.out.println("hello, woman");
    }

    @Test
    public void test(){
        Human man = new Man();
        Human woman = new Woman();
        StaticDispatch dispatch = new StaticDispatch();
        dispatch.sayHello(man);
        dispatch.sayHello(woman);
    }
}
```

- 最终的打印结果如下：

（重载时是以静态类型判断的）

```
hello, human
hello, human
```

### 重载方法

编译器虽然可以确定方法的重载版本，但在很多情况下这个重载版本并不是“唯一的”，往往只能确定一个“更加合适的”版本。

这种情况的产生的主要原因是字面量不需要定义，所以字面量没有显示的静态类型，它的静态类型只能通过语言上的规则去理解和推测。

```java
public class OverLoad {

    public static void sayHello(Object object){
        System.out.println("hello Object");
    }
    public static void sayHello(int a){
        System.out.println("hello int");
    }
    public static void sayHello(long a){
        System.out.println("hello long");
    }
    public static void sayHello(Character character){
        System.out.println("hello Character");
    }
    public static void sayHello(char c){
        System.out.println("hello char");
    }
    public static void sayHello(char... c){
        System.out.println("hello char...");
    }
    public static void sayHello(Serializable serializable){
        System.out.println("hello Serializable");
    }

    @Test
    public void test(){
        sayHello('a');
    }
}
```

以上代码，将打印出hello char；

①将sayHello(char c)注释掉，将打印出：hello int，

②继续将sayHello(int a)注释掉，将打印出：hello long，
这两步的原因是字符a发生自动类型转换（char->int->long->float->double）

③继续将sayHello(long a)注释掉，将打印出：hello Character
原因是字符a被自动装箱为Character类型

④继续将sayHello(Character character)注释掉，将打印出：hello Serializable
原因是a被自动装箱为Character类型后仍然找不到方法，继续自动转型，Character实现了Serializable接口。

⑤继续将sayHello(Serializable serializable)注释掉，将打印出：hello Object
原因是char装箱后转型为父类了，如果有多个父类，将在继承关系中从下往上搜索，约接近上层优先级越低。

⑥继续将sayHello(Object object)注释掉，将打印出：hello char...

可见：可变长参数的重载优先级是最低的。

## 动态分派

在运行期间，根据参数实际类型来确定方法执行版本的过程。

主要对应Java中的重写。

```java
public class DynamicDispatch {

    static abstract class Human {
        abstract void sayHello();
    }

    static class Man extends Human {
        @Override
        void sayHello() {
            System.out.println("man say hello");
        }
    }

    static class Woman extends Human {
        @Override
        void sayHello() {
            System.out.println("woman say hello");
        }
    }

    @Test
    public void test() {
        Human man = new Man();
        Human woman = new Woman();
        man.sayHello();
        woman.sayHello();
    }
}
```

- 打印结果

```
man say hello
woman say hello
```

通过以上可知，静态分派与动态分派是不同情况下方法调用所采取的不同的分派方式，两者并不是非此即彼的，还可能出现一个方法调用在确定直接引用时，既用到静态分派，又用到动态分派。

确定重载方法的时候用到的是静态分派，确定重写方法的时候用到的是动态分派。

即重载看参数静态类型，重写看参数实际类型。

这里的参数，重载时是指方法的参数列表中那个参数，重写时是指该方法的调用者。

## 单分派与多分派

方法的接收者和方法的参数统称为方法的宗量。

根据分派基于多少种宗量，可以将分派划分为单分派和多分派两种。

单分派是根据一个宗量进行选择，多分派是根据多于一个宗量对目标方法进行选择。

这个概念听起来很拗口，我们通过一段代码来进行说明

```java
/**
 * 单分派、多分派演示
 */
public class Dispatch{
    static class QQ{}
    static class _360{}
    public static class Father{
        public void hardChoice(QQ arg){
            System.out.println("father choose QQ");
        }
        public void hardChoice(_360 arg){
            System.out.println("father choose 360");
        }
    }
    public static class Son extends Father{
        public void hardChoice(QQ arg){
            System.out.println("son choose QQ");
        }
        public void hardChoice(_360 arg){
            System.out.println("son choose 360");
        }
    }
    public static void main(String[] args){
        Father father = new Father();
        Father son = new Son();
        father.hardChoice(new _360());
        son.hardChoice(new QQ());
    }
}
```

- 结果

```
father choose 360
son choose QQ
```

对于上述代码，我们首先来看编译阶段编译器的选择过程，也就是静态分派的过程。

这时选择目标方法的依据有两点：一是方法接收者的静态类型是Father还是Son，二是方法参数是QQ还是360。

这次选择结果的最终产物是产生两条invokevirtual指令，两条指令的参数分别为常量池中指向Father.hardChoice(_360)及Father.hardChoice(QQ)方法的符号引用。

因为是根据两个宗量进行选择，所以Java语言的静态分派属于多分派类型。

再看看运行阶段虚拟机的选择，也就是动态分派的过程。

在执行“son.hardChoiece(new QQ())”这句代码时，由于编译期已经确定了目标方法的签名必须为hardChoice(QQ)，此时虚拟机不会关心传递给方法的实际参数，它不会影响虚拟机的选择，唯一可以影响虚拟机选择的因素是此方法的接收者的实际类型是Father还是Son。

因为只有一个宗量作为选择依据，所以说Java语言的动态分派属于单分派类型。

根据上述论证的结果，可以总结一句话：截止到目前为止（以后可能会变），Java语言是一门**静态多分派，动态单分派**的语言。

## 虚拟机动态分派的实现

前面介绍的分派过程，回答了虚拟机在分派中“会做什么”的问题，但是虚拟机“具体是如何做到的”呢？

下面我们来看动态分派的实现原理。

由于动态分派是非常频繁的动作，而且动态分派的方法版本选择过程需要运行时在类的方法元数据中搜索合适的目标方法，出于性能的考虑，大部分虚拟机的真正实现都不会进行如此频繁的搜索。

作为优化，虚拟机会为类在方法区建立一个虚方法表，使用虚方法表索引来代替元数据查找来提高性能。

我们先看看前面用到的代码的虚方法表结构示例，如图

![虚方法表结构示例](https://img-blog.csdn.net/20180615170653692?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0lUX0dKVw==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

虚方法表中存放着各个方法的实际入口地址，如果某个方法在子类中没有被重写，那么子类的虚方法表里面的地址入口和父类相同方法的地址入口是一致的，都指向父类的实现入口。

如果子类重写了这个方法，子类方法表中地址将会指向子类实现版本的入口地址。

图中，Son重写了来自Father的全部方法，因此Son的方法表没有指向Father类型数据的箭头。但是Son和Father都没有重写来自Object的方法，所以它们的方法表中所有从Object继承来的方法都指向了Object的数据类型。

为了程序实现上的方便，具有相同签名的方法，在父类、子类的虚方法表中都应当具有一样的索引序号，这样当类型变换时，仅需要变更要查找的方法表，就可以从不同的虚方法表中按索引转换出所需的入口地址。

方法表一般在类加载的连接阶段进行初始化，准备了类的变量初始化后，虚拟机会把该类的方法表也初始化完毕。

## 动态类型语言支持

什么是动态语言呢？动态语言的类型检查的主体过程发生在运行期而不是编译期。

静态语言：c++/java
动态语言：Grovvy

### java.lang.invoke包

说到java.lang.invoke包，我们有必要搞清楚MethodHandle与反射机制中的Method类的区别？

java.lang.invoke这个包的主要目的是在之前单纯依靠符号引用来确定调用的目标方法这种方式以外，提供一种新的动态确定目标方法的机制，称为MethodHandle。

在Java中，没有办法单独将一个函数作为参数进行传递，通常的做法是使用接口，以实现这个接口的对象作为参数进行传递。

不过在拥有MethodHandle之后，Java语言也可以拥有类似于函数指针或者委托的方法别名的工具了。

```java
import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.MethodType;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class MethodHandlesTest {
    final static Log log = LogFactory.getLog(MethodHandlesTest.class);
    public static void main(String[] args) {
        (new MethodHandlesTest().new Son()).bloodType();
    }
    
    // 祖父类
    class GrandFather{
        public void bloodType(){
            log.info("我的血型是：AB");
        }
    }
    
    // 父类
    class Father extends GrandFather{
        public void bloodType(){
            log.info("我的血型是：A");
        }
    }
    
    // 子类
    class Son extends Father{
        public void bloodType(){
            try{
                MethodType methodType = MethodType.methodType(void.class);
                //MethodHandles methodHandles = lookup().findSpecial(GrandFather.class,"bloodType",methodType,getClass());
                MethodHandles.Lookup methodHandles = MethodHandles.lookup();
                MethodHandle methodHandle = methodHandles.findSpecial(GrandFather.class,"bloodType",methodType,getClass());
                // invoke 是一个本地方法
                methodHandle.invoke(this);
                /**
                 * 
                 * invoke方法的定义：
                 * @PolymorphicSignature
                 * public final native Object invoke(Object[] paramArrayOfObject) throws Throwable;
                 * 
                 */
            }
            catch(Throwable throwable){
                log.debug("catch 捕获异常..." + throwable);
            }
        }
    }
}
```

上面的示例代码，演示了Son子类如何调用父类的父类，也就是GrandFather类中的方法。

主要是使用到了MethodHandle，MethodHandle的使用可以分为下面几步：

1. 创建MethodType对象，指定方法的签名；

2. 在MethodHandles.Lookup查找类型为MethodType的MethodHandle；

3. 传入方法参数，并调用MethodHandle.invoke或者MethodHandle.invokeExat方法；

### MethodType 

MethodType，可以通过MethodHandle类的type方法查看其类型，返回值是MethodType类的对象。

也可以在得到MethodType对象之后，调用MethodHandle.asType(methodType)方法适配得到MethodHandle对象。

创建MethodType对象，主要有下面三种方式：

- MethodType及其重载方法，需要指定返回值类型和参数，例如MethodType.methodType(void.class)；

- MethodType.genericMethodType(0)，需要指定参数的个数，类型都为Object；

- MethodType.fromMethodDescriptorString("bloodType", MethodHandlesTest.class.getClassLoader())

### invoke

`MethodHandles.Lookup()` 相当于MethodHandles的工厂类，通过findSpecial方法，可以得到相应的MethodHandle。

在得到 methodHandle后，就可以进行方法调用了。

methodHandle.invoke(this)，方法调用一共有三种形式，上面的methodHandle.invoke(this)只是其中一种方式。三种方式：

- methodHandle.invoke(this)

- methodHandle.invokeExact(this)

- methodHandle.invokeWithArguments(this)

### invokedynamic

接下来说一下JDK7新增的invokedynamic指令，也在java.lang.invoke包下。

invokedynamic指令与其他4条指令的最大区别是，invokedynamic的分派逻辑不是由虚拟机决定的，而是由程序员决定的。

我们都知道，在java程序中，使用super关键字，很容易调用父类的方法，但是如果要访问父类的父类中的房
法呢？

在JDK7之前，要想达到这个目的，难度很大，原因是子类的方法中，无法获取到实际类型是父类的父类的对象引用。

invokevirtual指令的分派逻辑时按照方法的接收者的实际类型来进行分派的，这个逻辑是固化在JVM中的，程序员无法改变。

但是我们使用invokedynamic指令，就很容易实现了。


# 基于栈的字节码解释执行引擎

主要探讨虚拟机如何执行方法中的字节码指令。

许多Java虚拟机的执行引擎在执行Java代码的时候都有解释执行（通过解释器执行）和编译执行（通过即时编译器生成本地代码执行）两种选择，这里进讨论解释执行。

## 解释执行

![2018-12-25-jvm-byte-exec.png](https://raw.githubusercontent.com/houbb/resource/master/img/jvm/2018-12-25-jvm-byte-exec.png)

Java程序在执行前先对程序源码进行词法分析和语法分析处理，把源码转化为抽象语法树。

对于一门具体语言的实现来说，词法分析、语法分析以及后面的优化器和目标代码生成器都可以选择独立于执行引擎，形成一个完整意义的编译器去实现，这类代表是C/C++语言。

当然也可以选择其中的一部分步骤实现一个半独立的编译器，这类代表是Java语言。

又或者把这些步骤和执行引擎全部集中封装到一个封闭黑匣子中，如大多数的JS执行器。

Java语言中，Javac编译器完成了程序代码经过词法分析、语法分析到抽象语法树，再遍历语法树生成线性的字节码指令流的过程。

因为这一部分动作是在Java虚拟机之外进行的，而解释器在虚拟机的内部，所以Java程序的编译就是半独立的实现。

## 基于栈的指令集和基于寄存器的指令集

Java编译器输入的指令流基本上是一种基于栈的指令集架构，指令流中的指令大部分是零地址指令，其执行过程依赖于操作栈。

另外一种指令集架构则是基于寄存器的指令集架构，典型的应用是x86的二进制指令集，比如传统的PC以及 Android的Davlik虚拟机。

两者之间最直接的区别是，基于栈的指令集架构不需要硬件的支持，而基于寄存器的指令集架构则完全依赖硬件，这意味基于寄存器的指令集架构执行效率更高，单可移植性差，而基于栈的指令集架构的移植性更高，但执行效率相对较慢，初次之外，相同的操作，基于栈的指令集往往需要更多的指令。

### 优缺点

基于栈的指令集的主要优点是可移植，因为它不直接依赖于寄存器，所以不受硬件的约束。

它的主要缺点是执行速度相对会稍慢一些。所有主流物理机的指令集都是寄存器架构也从侧面印证了这一点。

之所以速度慢，原因有两点：一是基于栈的指令集需要更多的指令数量，因为出栈和入栈本身就产生了相当多的指令；

二是因为执行指令时会有频繁的入栈和出栈操作，频繁的栈访问也就意味着频繁的内存访问，相对于处理器而言，内存始终是执行速度的瓶颈。

### 实现逻辑

比如同样执行2+3这种逻辑操作，其指令分别如下： 

- 基于栈的计算流程（以Java虚拟机为例）：

```
iconst_2  //常量2入栈
istore_1  
iconst_3  //常量3入栈
istore_2
iload_1
iload_2
iadd      //常量2、3出栈，执行相加
istore_0  //结果5入栈
```

- 而基于寄存器的计算流程

```
mov eax,2  //将eax寄存器的值设为1
add eax,3  //使eax寄存器的值加3
```



## 基于栈的代码执行示例 

下面我们用简单的案例来解释一下JVM代码执行的过程，代码实例如下：

```java
public class StackExecuteTest {

    public static int add() {
        int result = 0;
        int i = 2;
        int j = 3;
        int c = 5;
        return result = (i + j) * c;
    }

    public static void main(String[] args) {
        StackExecuteTest.add();
    }
}
```

### 编译

编译后通过 `javap -verbose StackExecuteTest.class` 获取对应字节码：

```
Classfile /D:/github/jvm-learn/target/classes/com/github/houbb/jvm/learn/StackExecuteTest.class
  Last modified 2018-12-25; size 618 bytes
  MD5 checksum 1934d39be8455a3cba2db813d1d607bf
  Compiled from "StackExecuteTest.java"
public class com.github.houbb.jvm.learn.StackExecuteTest
  minor version: 0
  major version: 49
  flags: ACC_PUBLIC, ACC_SUPER
Constant pool:
   #1 = Methodref          #4.#25         // java/lang/Object."<init>":()V
   #2 = Methodref          #3.#26         // com/github/houbb/jvm/learn/StackExecuteTest.add:()I
   #3 = Class              #27            // com/github/houbb/jvm/learn/StackExecuteTest
   #4 = Class              #28            // java/lang/Object
   #5 = Utf8               <init>
   #6 = Utf8               ()V
   #7 = Utf8               Code
   #8 = Utf8               LineNumberTable
   #9 = Utf8               LocalVariableTable
  #10 = Utf8               this
  #11 = Utf8               Lcom/github/houbb/jvm/learn/StackExecuteTest;
  #12 = Utf8               add
  #13 = Utf8               ()I
  #14 = Utf8               result
  #15 = Utf8               I
  #16 = Utf8               i
  #17 = Utf8               j
  #18 = Utf8               c
  #19 = Utf8               main
  #20 = Utf8               ([Ljava/lang/String;)V
  #21 = Utf8               args
  #22 = Utf8               [Ljava/lang/String;
  #23 = Utf8               SourceFile
  #24 = Utf8               StackExecuteTest.java
  #25 = NameAndType        #5:#6          // "<init>":()V
  #26 = NameAndType        #12:#13        // add:()I
  #27 = Utf8               com/github/houbb/jvm/learn/StackExecuteTest
  #28 = Utf8               java/lang/Object
{
  public com.github.houbb.jvm.learn.StackExecuteTest();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 7: 0
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       5     0  this   Lcom/github/houbb/jvm/learn/StackExecuteTest;

  public static int add();
    descriptor: ()I
    flags: ACC_PUBLIC, ACC_STATIC
    Code:
      stack=2, locals=4, args_size=0
         0: iconst_0
         1: istore_0
         2: iconst_2
         3: istore_1
         4: iconst_3
         5: istore_2
         6: iconst_5
         7: istore_3
         8: iload_1
         9: iload_2
        10: iadd
        11: iload_3
        12: imul
        13: dup
        14: istore_0
        15: ireturn
      LineNumberTable:
        line 10: 0
        line 11: 2
        line 12: 4
        line 13: 6
        line 14: 8
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            2      14     0 result   I
            4      12     1     i   I
            6      10     2     j   I
            8       8     3     c   I

  public static void main(java.lang.String[]);
    descriptor: ([Ljava/lang/String;)V
    flags: ACC_PUBLIC, ACC_STATIC
    Code:
      stack=1, locals=1, args_size=1
         0: invokestatic  #2                  // Method add:()I
         3: pop
         4: return
      LineNumberTable:
        line 18: 0
        line 19: 4
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       5     0  args   [Ljava/lang/String;
}
SourceFile: "StackExecuteTest.java"
```

# 小结

通过上面的讲述，我们分析了虚拟机在执行代码时，如何找到正确的方法、如何执行方法内的字节码，以及执行代码时涉及的内存结构。

至此，相信你对JVM虚拟机的执行引擎一定有了一个大概的认识。

# 参考资料

[【JVM】虚拟机字节码执行引擎](https://www.jianshu.com/p/3f427d7476b3)

[JVM字节码执行引擎](https://blog.csdn.net/IT_GJW/article/details/80627661)

[JVM字节码执行引擎](https://blog.csdn.net/reggergdsg/article/details/52506117)

[图解 JVM 字节码执行引擎](https://juejin.im/entry/589546638d6d8100583615ee)

[JVM字节码执行引擎](https://blog.csdn.net/IT_GJW/article/details/80627661)

[Java之深入JVM(6) - 字节码执行引擎(转)](http://www.cnblogs.com/royi123/p/3569511.html)

* any list
{:toc}