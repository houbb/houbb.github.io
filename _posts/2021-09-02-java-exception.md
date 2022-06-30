---
layout: post
title: Java 异常 exception 整理
date: 2021-09-01 21:01:55 +0800
categories: [java]
tags: [java, sh]
published: true
---

# 30、描述一下 Java 异常层次结构。

![异常层次结构](https://img-blog.csdnimg.cn/20210427103902192.png)

在 Java 中，所有的异常都有一个共同的祖先 Throwable（可抛出）。Throwable 指定代码中可用异常传播机制通过 Java 应用程序传输的任何问题的共性。

Throwable： 有两个重要的子类：Exception（异常）和 Error（错误），二者都是 Java 异常处理的重要子类，各自都包含大量子类。

Error（错误）:是程序无法处理的错误，表示运行应用程序中较严重问题。大多数错误与代码编写者执行的操作无关，而表示代码运行时 JVM（Java 虚拟机）出现的问题。例如，Java虚拟机运行错误（Virtual MachineError），当 JVM 不再有继续执行操作所需的内存资源时，将出现 OutOfMemoryError。这些异常发生时，Java虚拟机（JVM）一般会选择线程终止。

这些错误表示故障发生于虚拟机自身、或者发生在虚拟机试图执行应用时，如Java虚拟机运行错误（Virtual MachineError）、类定义错误（NoClassDefFoundError）等。

这些错误是不可查的，因为它们在应用程序的控制和处理能力之外，而且绝大多数是程序运行时不允许出现的状况。对于设计合理的应用程序来说，即使确实发生了错误，本质上也不应该试图去处理它所引起的异常状况。

在 Java中，错误通过Error的子类描述。

Exception（异常）:是程序本身可以处理的异常。

Exception 类有一个重要的子类 RuntimeException。RuntimeException 类及其子类表示“JVM 常用操作”引发的错误。例如，若试图使用空值对象引用、除数为零或数组越界，则分别引发运行时异常（NullPointerException、ArithmeticException）和 ArrayIndexOutOfBoundException。

注意：异常和错误的区别：**异常能被程序本身可以处理，错误是无法处理。**

通常，Java的异常(包括Exception和Error)分为可查的异常（checked exceptions）和不可查的异常（unchecked exceptions）。

可查异常（编译器要求必须处置的异常）：正确的程序在运行中，很容易出现的、情理可容的异常状况。可查异常虽然是运行时异常的特点是Java编译器不会检查它，也就是说，当程序中可能出现这类异常，即使没有用try-catch语句捕获它，也没有用throws子句声明抛出它，也会编译通过。

非运行时异常 （编译异常）：是RuntimeException以外的异常，类型上都属于Exception类及其子类。从程序语法角度讲是必须进行处理的异常，如果不处理，程序就不能编译通过。如IOException、SQLException等以及用户自定义的Exception异常，一般情况下不自定义检查异常。

# 处理异常机制

在 Java 应用程序中，异常处理机制为：抛出异常，捕捉异常。

抛出异常：当一个方法出现错误引发异常时，方法创建异常对象并交付运行时系统，异常对象中包含了异常类型和异常出现时的程序状态等异常信息。运行时系统负责寻找处置异常的代码并执行。

捕获异常：在方法抛出异常之后，运行时系统将转为寻找合适的异常处理器（exception handler）。潜在的异常处理器是异常发生时依次存留在调用栈中的方法的集合。当异常处理器所能处理的异常类型与方法抛出的异常类型相符时，即为合适 的异常处理器。运行时系统从发生异常的方法开始，依次回查调用栈中的方法，直至找到含有合适异常处理器的方法并执行。当运行时系统遍历调用栈而未找到合适 的异常处理器，则运行时系统终止。同时，意味着Java程序的终止。

对于运行时异常、错误或可查异常，Java技术所要求的异常处理方式有所不同。

由于运行时异常的不可查性，为了更合理、更容易地实现应用程序，Java规定，运行时异常将由Java运行时系统自动抛出，允许应用程序忽略运行时异常。

对于方法运行中可能出现的Error，当运行方法不欲捕捉时，Java允许该方法不做任何抛出声明。因为，大多数Error异常属于永远不能被允许发生的状况，也属于合理的应用程序不该捕捉的异常。

对于所有的可查异常，Java规定：一丼�常状况，但在一定程度上它的发生是可以预计的，而且一旦发生这种异常状况，就必须采取某种方式进行处理。

除了RuntimeException及其子类以外，其他的Exception类及其子类都属于可查异常。这种异常的特点是Java编译器会检查它，也就是说，当程序中可能出现这类异常，要么用try-catch语句捕获它，要么用throws子句声明抛出它，否则编译不会通过。

不可查异常(编译器不要求强制处置的异常)：包括运行时异常（RuntimeException与其子类）和错误（Error）。

Exception 这种异常分两大类运行时异常和非运行时异常(编译异常)。程序中应当尽可能去处理这些异常。

运行时异常：都是RuntimeException类及其子类异常，如NullPointerException(空指针异常)、IndexOutOfBoundsException(下标越界异常)等，这些异常是不检查异常，程序中可以选择捕获处理，也可以不处理。这些异常一般是由程序逻辑错误引起的，程序应该从逻辑角度尽可能避免这类异常的发生。

能够捕捉异常的方法，需要提供相符类型的异常处理器。所捕捉的异常，可能是由于自身语句所引发并抛出的异常，也可能是由某个调用的方法或者Java运行时 系统等抛出的异常。也就是说，一个方法所能捕捉的异常，一定是Java代码在某处所抛出的异常。简单地说，异常总是先被抛出，后被捕捉的。

任何Java代码都可以抛出异常，如：自己编写的代码、来自Java开发环境包中代码，或者Java运行时系统。无论是谁，都可以通过Java的throw语句抛出异常。

从方法中抛出的任何异常都必须使用throws子句。

捕捉异常通过try-catch语句或者try-catch-finally语句实现。

总体来说，Java规定：对于可查异常必须捕捉、或者声明抛出。允许忽略不可查的RuntimeException和Error。

# Finally 块一定会执行吗？

先说结论： Java中的finally代码块不一定会被执行。

下面具体分析一下finally代码块不会被执行的两种情况。

## 情况1：当代码在try语句之前结束运行时，finally代码块不会被执行

换句话说，**当try代码块得不到执行时，相应的finally块也不会被执行。**

例如，当程序在try语句之前就return时，finally代码块就不会被执行，详情见下面代码示例及输出结果。

```java
public class FinallyTest {
    public static void main(String[] args) {
        int i = 0;
        if (i == 0) {
            return;
        }

        try {
            System.out.println("this is try ...");
        } catch (Exception e) {
            System.out.println("this is catch ...");
        } finally {
            System.out.println("this is finally ...");
        }
    }
}
```

ps: 这是肯定的，方法还没走到。。

## 情况2：当执行try语句块的线程终止时，finally代码块不会被执行

当在try语句块里执行了System.exit()或者该线程被中断被kill，这些情况也会使得finally代码块得不到执行，详情见下面代码示例及输出结果。

```java
public class FinallyTest {
    public static void main(String[] args) {
        int i = 0;

        try {
            System.out.println("this is try ...");
            System.exit(0);
        } catch (Exception e) {
            System.out.println("this is catch ...");
        } finally {
            System.out.println("this is finally ...");
        }
    }
}
```

程序输出：

```
this is try ...

Process finished with exit code 0
```

上面是finally代码块不会被执行的两种情况，下面本文介绍一下try_catch_finally和return的执行顺序问题。

也就是说，除了上面两种情况，finally块是都会被执行的，问题在于何时被执行。


# 正常情况下，当在try块或catch块中遇到return语句时，finally语句在方法返回之前还是之后被执行？

先说结论：**finally块的执行时间点在try和catch中return语句的表达式值计算之后返回之前**

不论try和catch代码块中有没有return语句，执行顺序都是先计算try或catch中return语句的表达式的值并暂存，然后执行finally代码块。

若finally代码块中无return，则返回之前try或catch中暂存的return语句的表达式的值；若finally代码块中有return，则直接就地返回。

请看下面的代码示例：

```java
public class FinallyTest {
    public static void main(String[] args) {
        System.out.println("the result of test is: " + test());
    }

    private static int test() {
        int i = 0;

        try {
            i++;
            System.out.println("this is try ...");
            System.out.println("the value of i is: " + i);
            return calc(i);
        } catch (Exception e) {
            System.out.println("this is catch ...");
        } finally {
            i++;
            System.out.println("this is finally ...");
            System.out.println("the value of i is: " + i);
        }

        return i;
    }

    private static int calc(int i) {
        System.out.println("this is calc ...");
        System.out.println("the value of i is: " + i);
        return i;
    }
}
```

根据之前所述结论，test方法的返回值应当是1，你猜对了吗？

程序运行结果如下：

```
this is try ...
the value of i is: 1
this is calc ...
the value of i is: 1
this is finally ...
the value of i is: 2
the result of test is: 1

Process finished with exit code 0
```

# 参考资料

https://blog.csdn.net/u011816231/article/details/54409607

https://blog.csdn.net/CSDN_of_ding/article/details/116193863

https://www.pianshen.com/article/2670653145/

https://blog.51cto.com/u_15080021/3849678

https://java366.com/blog/detail/10560468ba463aeab47ddd0cb2ae4d7f

https://www.runoob.com/java/java-exceptions.html

https://www.jianshu.com/p/edd27da3b09d

* any list
{:toc}