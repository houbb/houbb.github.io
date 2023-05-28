---
layout: post
title: 多态在底层如何实现? --- Java虚方法详解
date:  2023-05-28 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# 前言

多态作为 Java 三大特性之一自然是十分重要，在各种设计模式中多态的影子也是随处可见。

所以能更好更深的理解多态，可以大大提交我们的代码能力，写出优雅的代码。

（我将本文的内容分为两大块用分割线隔开，前半段的内容会讲java中实现多态的基本规则，后半段算是进阶篇主要讲解JVM是如何实现多态的和即时编译器对虚方法的优化。）

# Java中方法的分派机制

Java中的分派也被称为动态分派，它实现了Java中的“重写”（Override），而重写则是Java多态性的重要体现。

我们先来看一段代码：

```java
public class Person {
    public void sayHello(){
        System.out.println("Hello person!");
    }

}

class Man extends Person{
    @Override
    public void sayHello() {
        System.out.println("Hello man!");
    }
}

class Women extends Person{
    @Override
    public void sayHello() {
        System.out.println("Hello women!");
    }
}

class DispatchDemo {

    public static void main(String[] args) {

        Person man = new Man();
        Person women = new Women();

        man.sayHello(); 
        women.sayHello(); 
    }
}
```

结果：

```
Hello man!
Hello women!
```

这段代码是一段平平无奇的代码，它的执行结果也并不出人意料。

但请各位小伙伴思考虚拟机为什么没有采用“Person”的sayHello()而是分别采用了“Man”和“Women”的sayHello()呢？

在搞清楚这个问题之前，我想先说两个关键概念。

# 静态类型与实际类型

```java
Person man = new Man();
```

上面这段代码中“Person”我们称之为“静态类型”或“外观类型”，而“Man”被称为“实际类型”或“运行时类型”。

他们的区别在于静态类型是编译期可知的，即使在静态变量发生变化时。

而实际类型则在编译期不可知，“Person”的类型到底是“Man”还是“Women”则必须等待程序运行时才能确定。

搞清楚了静态类型与实际类型的概念，我们在回到刚才的那段代码中。

显然java在选择方法的版本时采用了实际类型，因为Person的两个变量产生了不同的行为。

导致这个现象的根本原因就是两个变量实际类型的不同。

为了再次确认我们的猜想，下面我们来看看这段代码的字节码：

```
0 new #2 <com/chris/spring/dispatch/Man> //创建一个类实例的引用,将这个引用压入操作数栈顶
 3 dup                                    //复制栈顶的这个引用,并让这个引用入栈（额外多复制一个引用）
 4 invokespecial #3 <com/chris/spring/dispatch/Man.<init> : ()V> //调用构造方法（会消耗一个栈顶的引用）
 7 astore_1                               //将剩余的对象引用存入变量槽_1
 8 new #4 <com/chris/spring/dispatch/Women>
11 dup
12 invokespecial #5 <com/chris/spring/dispatch/Women.<init> : ()V>
15 astore_2
16 aload_1
17 invokevirtual #6 <com/chris/spring/dispatch/Person.sayHello : ()V>
20 aload_2
21 invokevirtual #6 <com/chris/spring/dispatch/Person.sayHello : ()V>
24 return
```

这段字节码中 0-7 与 8-15 我们不用关注（PS：但作为良心博主，我还是把这段字节码的翻译写了出来），它对应的代码就是这两行：

```java
Person man = new Man();
Person women = new Women();
```

重点在于16-21行，这才是我们应该关注的。

可以看到17行与21行的**invokevirtual字节码指令是完完全全一样的，他们甚至指向了同一个常量池索引（index #6）**，很明显这段完全相同的字节码指令在编译期是无论如何都无法判断最终调用的方法版本的，这个动作的完成显然是在运行期。

**这类在编译期无法被确定的方法被称为“虚方法”**。

# 虚方法与非虚方法

与虚方法相反的则是非虚方法，在Java中符合“编译期可知，运行期不可变”的都可以被称作“非虚方法”，非虚方法包含：静态方法、私有方法、实例构造器、父类方法和被final修饰的方法。

Java为调用不同类型的方法，设计了不同的字节码指令，目前JVM支持的指令有5种，如下：

- invokestatic：用于调用静态方法。

- invokespecial：用于调用实例构造器 `<init>()` 方法、私有方法和父类中的方法。

- invokevirtual：调用所有的虚方法（final除外）。

- invokeinterface：用于调用接口方法，会在运行时再确定一个实现对象。

- invokedynamic：先在运行时动态解析出调用点限定符所引用的方法，然后再执行该方法。它的分派逻辑并不由JVM内部来决定，而是根据用户设定的引导方法来决定的。

这里必须额外说明final修饰的方法，虽然这种方法被invokevirtual调用，但它实际上是一个非虚方法。

它在执行时会告知编译器关闭这种“动态绑定”的规则，它的派生类中是必不能有重写的方法的，于是虚拟机可以判断这个虚方法只有一种可能的调用目标。

补充说明：理论上被final修饰的方法在执行时有更好的性能，但实际上并非如此。

例如：hotspot可以通过CHA（类层次分析）同样做到判断一个虚方法是否只有一个调用的版本，他们的优化程度是一摸一样的。所以如果单纯为了提高性能而使用final修饰这个方法并不是一个好的选择。

# “重载”到底算不算多态？

这个问题事实上一直争论不休，至今一直没有一个准确的答案，可以说是公说公有理婆说婆有理，我个人倾向于“重载”并不算多态。

在说明理由前我们先来看看JVM是如何实现“重载”的。

代码：

```java
public class StaticDispatchDemo {
    public void sayHello(Person person) {
        System.out.println("Hello person!");
    }

    public void sayHello(Man man) {
        System.out.println("Hello man!");
    }


    public void sayHello(Women women) {
        System.out.println("Hello women!");
    }

    public static void main(String[] args) {
        Person man = new Man();
        Person women = new Women();

        StaticDispatchDemo sdd = new StaticDispatchDemo();
        sdd.sayHello(man);      
        sdd.sayHello(women);    
        sdd.sayHello((Man) man);
    }
}
```

执行结果：

```
Hello person!
Hello person!
Hello man!
```

上面这段代码中我们可以清楚的看到sdd.sayHello()方法参数的实际类型并没有在重载中起到作用，**编译器在重载时采用了静态类型而不是实际类型作为判断的依据，编译期完全可知，这种通过静态类型实现的分派方式被称为“静态分派”**。

（PS：静态分派是否是一种“分派”行为，和重载是否属于多态一样存在争议。因为静态分派完全由javac在编译期决定方法调用的版本，这个过程甚至都不需要JVM的参与。）

这里需要注意javac编译器在确认重载版本时并不是“唯一的”。

我们再来看一段代码：

```java
public class StaticDispatchDemo02 {
    public void sayHello(char c) {
        System.out.println("Hello char : " + c);
    }

    public void sayHello(int i) {
        System.out.println("Hello int : " + i);
    }

    public static void main(String[] args) {
        StaticDispatchDemo02 sdd2 = new StaticDispatchDemo02();
        sdd2.sayHello('1');
    }
}
```

输出结果：

```
Hello char : 1
```

字节码：

```
0 new #12 <com/chris/spring/dispatch/StaticDispatchDemo02>
 3 dup
 4 invokespecial #13 <com/chris/spring/dispatch/StaticDispatchDemo02.<init> : ()V>
 7 astore_1
 8 aload_1
 9 bipush 49
11 invokevirtual #14 <com/chris/spring/dispatch/StaticDispatchDemo02.sayHello : (C)V>
14 return
```

代码执行到这里似乎没有什么不正常的，编译期正确的找到了应该被重载的版本 `<com/chris/spring/dispatch/StaticDispatchDemo02.sayHello : (C)V>`

但如果此时我们将第一个方法注释掉呢？

```java
public class StaticDispatchDemo02 {
//    public void sayHello(char c) {
//        System.out.println("Hello char : " + c);
//    }

    public void sayHello(int i) {
        System.out.println("Hello int : " + i);
    }

    public static void main(String[] args) {
        StaticDispatchDemo02 sdd2 = new StaticDispatchDemo02();
        sdd2.sayHello('1');
    }

}
```

执行结果：

```
Hello int : 49
```

字节码：

```
 0 new #10 <com/chris/spring/dispatch/StaticDispatchDemo02>
 3 dup
 4 invokespecial #11 <com/chris/spring/dispatch/StaticDispatchDemo02.<init> : ()V>
 7 astore_1
 8 aload_1
 9 bipush 49
11 invokevirtual #12 <com/chris/spring/dispatch/StaticDispatchDemo02.sayHello : (I)V>
14 return
```

我们可以的发现，此时此刻程序并没有报错，而是重载了参数为int的类型的版本 `<com/chris/spring/dispatch/StaticDispatchDemo02.sayHello : (I)V>`

方法的描述符从“(C)V”变成了“(I)V”。

这是为什么呢？

**其根本的原因在于字面量的模糊性，字面量是没有显式的静态类型的，它的静态类型只能从语言、语法的规则去理解和推敲**。

如果你还不理解，请再看一段下面的代码：

```java
public class Test01 {
    private static final int i  = 49;
    private static final char c  = '1';
}
```

用这段代码作为比喻其实是十分不贴切的，只是为了让给位小伙伴更好的理解，此时的属性“i”与属性“c”再字段表中是可以区别的，他们有着不同的描述符，我们在这里先抛开这两个属性的描述符不谈。

我们只关注他们的 Constant Value（常量值），属性“i”和属性“c”他们的常量值索引都指向了常量池中同一个字面量 CONSTANT_Integer_info：49。我们根据这一特性反向推敲一下刚才的重载时编译器的逻辑，对于编译期来说‘1’其实它的本体就是字面量49，至于它的静态类型到底是什么则取决于此时的语法，因为我们在传参的时候并未指定‘1’的静态类型是什么，所以**此时的编译器会根据自己的优先级找到合乎逻辑的重载方法**。

看到这你应该对重载很清楚了，我为什么认为重载不属于多态的一个重要原因是因为我认为java的多态性来自于“分派”这一特征，或者说是对方法的后期绑定，而重载则是在编译期就能完全确定方法的版本。

但各位小伙伴也无需纠结于这一点，对于重载是否属于多态的争论事实上是毫无意义的，我们更重要的是更好的了解重载与重写的本质，而不是对一个名词刨根问底。

# 后期绑定

此刻我们已经对Java中的分派与静态分派有了一些基本的了解，貌似懂了但又没完全懂。

JVM到底是如何在运行时进行分派的？我们还没有搞清楚，那我们就继续探索，看看JVM是如何在运行期找到对应的方法版本的。

我们再次将目光回到本文开头展示“重写”的那段字节码继续分析：

```
0 new #2 <com/chris/spring/dispatch/Man> //创建一个类实例的引用,将这个引用压入操作数栈顶
 3 dup                                    //复制栈顶的这个引用,并让这个引用入栈（额外多复制一个引用）
 4 invokespecial #3 <com/chris/spring/dispatch/Man.<init> : ()V> //调用构造方法（会消耗一个栈顶的引用）
 7 astore_1                               //将剩余的对象引用存入变量槽_1
 8 new #4 <com/chris/spring/dispatch/Women>
11 dup
12 invokespecial #5 <com/chris/spring/dispatch/Women.<init> : ()V>
15 astore_2
16 aload_1
17 invokevirtual #6 <com/chris/spring/dispatch/Person.sayHello : ()V>
20 aload_2
21 invokevirtual #6 <com/chris/spring/dispatch/Person.sayHello : ()V>
24 return
```

我们可以看到，虽然17和21行的两段invokevirtual字节码指令虽然完全相同，但细心的小伙伴应该已经发现在这两段字节码执行前有两个aload指令，而这两个指令并不相同。

> 字节码指令aload：将局部变量表中相应位置的元素压入栈顶

aload_1将局部变量槽中下标为1的对象引用压入栈中，这个引用则刚好是实例对象“Man”的引用，然后字节码invokevirtual根据栈顶的元素执行方法的调用，这个动作是只能发生在运行期的。

这种**在运行期根据对象的实际类型进行方法版本绑定的形式，被称为“后期绑定”，java中后期绑定的机制是实现多态性的关键**。

# invokevirtual 字节码详解

我们现在知道方法的版本会根据操作数栈栈顶元素来决定，但这里似乎还存在一些问题。

比如栈顶对象中如果并没有我们要调用的方法呢？

```java
public class Person {
    public void sayHello(){
        System.out.println("Hello person!");
    }
}

class Man extends Person{
    
}

class DispatchDemo {

    public static void main(String[] args) {
        Person man = new Man();
        man.sayHello(); //Hello person!
    }
}
```

bytecode:

```
0 new #2 <com/chris/spring/dispatch/Man>
 3 dup
 4 invokespecial #3 <com/chris/spring/dispatch/Man.<init> : ()V>
 7 astore_1
 8 aload_1
 9 invokevirtual #4 <com/chris/spring/dispatch/Person.sayHello : ()V>
12 return
```

咦？此时栈顶的对象引用依然是实例对象“Man”的引用，但方法仍然正确的调用到了Person.sayHello()，这是为什么呢？它的关键就是invokevirtual字节码。

## jvm 规范

根据《java虚拟机规范》中对invokevirtual的描述进行总结（重点）：

无符号数 indexbyte1 和 indexbyte2 构建当前类的运行时常量池的索引，这个索引指向的是运行时常量池的一个方法的符号引用（包含了方法的符号引用和描述符，以及这个方法的接口符号引用）。
注：这里说的符号引用一定是被解析过的，事实上它是一个直接引用。虽然运行时常量池中允许未解析的符号引用的存在（运行时常量池本身就是动态性的）但invokevirtual在执行前必须执行解析（编译/运行期解析）操作，所以它一定是一个直接引用。另外需要注意的是，此时的直接引用指向的是Person.sayHello()

如果此时调用的实际类型中有我们要找的实例方法sayHello()，则覆盖符号引用中表示的方法。如果没有找到则按顺序递归搜索这个实际类型的父类直到找到sayHello()方法为止。（如果没有找到则抛出AbstractMethodError异常）

在《java虚拟机规范》中也就对方法覆盖的描述： 要声明在C类中的实例方法m1覆盖（overriding）另外一个声明在A类中的实例方法m2，当且仅当下面的条件都成立才合法： 1. C是A的子类。 2. m2与m1拥有相同的名称及方法描述符。 3. m2的权限描述符是ACC——PUBLIC、ACC_PROTECTED或默认权限。 4. m1覆盖方法m3，m3与m1不同，m3也与m2不同，并且m3覆盖了m2。

现在我们知道找到**正确的方法版本是因为invokevirtual字节码通过了方法覆盖的规则才找到正确的方法版本**。

PS：如果有小伙伴自己去翻《java虚拟机规范》时请注意invokevirtual关于“签名多态性”的描述，这是调用方法句柄时的操作，不要被“多态”二字所迷惑，它与我们今天聊的东西没有任何关系

# 虚方法表

我们通过上文已经知道，java中绝大多数的方法都是虚方法，它们都有invokevirtual调用。

但**invokevirtual中关于分派动作看起来实在是不怎么高效，完成方法的覆盖就必须频繁反复的搜索类型的元数据，如果只是为了“多态性”，那这样的性能损耗显得十分不值得。**

面对这种情况“虚方法表（Virtual Method Table，简称vtable）”应运而生。

它与类型数据一起被放在方法区中，是一种最基础的优化方式，通过使用vtable来代替元数据的查找以提高性能。

虚方法表中存放着各个方法的实际入口地址，如果某个方法在子类中没有被重写，那么子类的虚方法表中的地址就和父类相同方法的地址是一致的，都指向父类的实现入口。

虚方法表是《java虚拟机规范》中对“方法覆盖”的实现之一，即使实际类型发生了变换，仅需要变更查找的虚方法表，就可以从不同的虚方法表中按索引转化所需的地址。

虚方法表一般在类加载的连接阶段进行初始化，准备了类的变量初始值后，虚拟机会把该类的虚方法表也一同初始化了。

# 去虚化（devirtualization）

去虚化是一种思想，解释起来就是“不需要通过虚分派而可以直接调用目标”。

它与下面所有要讲的优化手段都属于编译器优化（这里与下文中的编译器是指C1或C2即时编译器）

# 类层级分析（Class Hierarchy Analysis，简称CHA）

如果你认为JVM对于虚方法的优化只有vtable那就大错特错了。事实上如果需要查找vtable对JVM来说已经是一种很慢的分派了。

其实在上文中我们已经提到 final 是否可以提升虚方法性能的问题，理论上 final 直接告诉JVM关闭了“动态绑定”看起来似乎是更高效的，它直接指定了一个唯一的方法版本让JVM完成分派。但为什么我在上文中否定了final更快这个答案呢？我们继续看看CHA是怎么做的。

CHA是整个应用程序范围内的类型分析技术，用于确定在目前已加载的类中，某个接口是否有多于一种的实现、某个类是否存在子类、某个子类是否覆盖了父类的某个虚方法等信息。这样，编译器在内联（方法内联，编译器重要的优化手段）时就会根据不同的情况采用不同的处理

- 非虚方法：这是一种完全去虚化（devirtualize）并且完全内联，没有任何虚方法分派或调用的开销。

- 虚方法但只有一个版本：这是一种条件去虚化并内联（guarded devirtualize），有简单的直接类型检查的开销，除此之外没有额外的调用开销。但因为java程序是动态链接的，如果虚拟机在执行过程中方法的接收者的继承关系发生了变化，则会放弃编译，退回解释状态执行。否则这个内联优化的代码可以一直执行下去。

- 虚方法但有多个版本：即时编译器做出的最后一次努力，使用内联缓存（inline cache）的方式，有直接类型检查的开销，也有直接调用的开销。他会在第一次调用发生时记录下方法接收者的版本信息，并且在每次调用时都比较接收者的版本。如果每次调用的方法版本都是一样的，那么这时它就是一种单态内联缓存（monomorphic inline cache），此时的性能还是略优于直接查vtable的。但如果出现方法接收者不一致的情况，就说明程序真的用到了虚方法的多态性，这时候会退化成超多态内联缓存（megamorphic inline cache）此时实际上已经是通过vtable来查找目标方法了，这是最慢的情况之一。

# 结语

本文部分资料引用《java 虚拟机规范》、《深入理解java虚拟机》以及R大博客中的一些片段（R大 yyds~）

# 参考资料

https://zhuanlan.zhihu.com/p/483910917

* any list
{:toc}