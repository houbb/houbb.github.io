---
layout: post
title:  Java Static
date:  2018-08-30 13:21:33 +0800
categories: [Java]
tags: [java, jvm, sf]
published: true
---

# java static

## 代码块

静态代码块：用 staitc 声明，jvm 加载类时执行，仅执行一次

构造代码块：类中直接用 `{}` 定义，每一次创建对象时执行。

执行顺序优先级：静态块, main(), 构造块, 构造方法。

## 静态代码块

### 代码

```java
static{}
```

### 特性

它是随着类的加载而执行，只执行一次，并优先于主函数。

具体说，静态代码块是由类调用的。类调用时，先执行静态代码块，然后才执行主函数的。

静态代码块其实就是给类初始化的，而构造代码块是给对象初始化的。

静态代码块中的变量是局部变量，与普通函数中的局部变量性质没有区别。

一个类中可以有多个静态代码块。

```java
public class MultiStaticBlock {

    private static int cnt = 6;

    static {
        cnt += 9;
    }

    public static void main(String[] args) {
        // 输出结果：5
        System.out.println(cnt);
    }

    static {
        cnt /= 3;
    }
}
```

## 单个类执行顺序

### 代码

```java
public class CodeBlockOrder {

    public CodeBlockOrder(){
        System.out.println("构造函数");
    }

    {
        System.out.println("构造代码块");
    }

    static {
        System.out.println("静态代码块");
    }
    public static void main(String[] args) {
        CodeBlockOrder codeBlockOrder = new CodeBlockOrder();
    }

}
```

打印日志

```
静态代码块
构造代码块
构造函数
```

### 总结

对于一个类而言，按照如下顺序执行：

1. 执行静态代码块

2. 执行构造代码块

3. 执行构造函数

对于静态变量、静态初始化块、变量、初始化块、构造器，它们的初始化顺序依次是（静态变量、静态初始化块）>（变量、初始化块）>构造器。

## 继承类的执行顺序

当前类继承了父类：CodeBlockOrder

```java
public class ExtendCodeBlockOrder extends CodeBlockOrder {

    public ExtendCodeBlockOrder(){
        System.out.println("子类构造函数");
    }

    {
        System.out.println("子类构造代码块");
    }

    static {
        System.out.println("子类静态代码块");
    }
    public static void main(String[] args) {
        ExtendCodeBlockOrder extendCodeBlockOrder = new ExtendCodeBlockOrder();
    }

}
```

日志输出如下：

```
静态代码块
子类静态代码块
构造代码块
构造函数
子类构造代码块
子类构造函数
```

# static 静态代码块加载时机

## 时机

- StaticCodeDemo.java

```java
public class StaticCodeDemo {

    static {//静态块
        System.out.println("static block ");
    }

}
```

- CallStaticCodeDemo.java

```java
public class CallStaticCodeDemo {

    public static void main(String[] args) {
        System.out.println("hello word: " + StaticCodeDemo.class);
    }

}
```

输出日志:

```
hello word: class com.github.houbb.java.learn.base.statics.jvm.StaticCodeDemo
```

并没有调用 static 静态代码块的内容

## jvm 加载类的时机

- 静态代码块的执行是处在类加载的最后一个阶段“初始化”。

```
加载=》验证=》准备=》解析=》初始化(静态代码块的执行)
```

> [JVM Loading, Linking, and Initializing](https://docs.oracle.com/javase/specs/jvms/se7/html/jvms-5.html)

根据上面文档，显然：StaticCodeDemo.class 这种使用方式，并不会触发StaticCodeDemo 类的初始化。所以并不会执行静态代码块。

# 参考资料

- 执行顺序

https://www.jianshu.com/p/8a3d0699a923

http://wiki.jikexueyuan.com/project/java-enhancement/java-twelve.html

https://www.cnblogs.com/Qian123/p/5713440.html

- 加载时机

https://blog.csdn.net/jiese1990/article/details/40154329


* any list
{:toc}