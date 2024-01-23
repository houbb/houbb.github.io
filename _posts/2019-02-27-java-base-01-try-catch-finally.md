---
layout: post
title: Java try catch finally 详解
date:  2019-2-27 09:48:47 +0800
categories: [Java]
tags: [static, java-base]
published: true
---

# 预备知识

## return 底层知识

首先是关于return返回的底层知识

java方法是在栈幀中执行，栈幀是线程私有栈的单位，执行方法的线程会为每一个方法分配一小块栈空间来作为该方法执行时的内存空间，栈幀分为三个区域：

1. 操作数栈，用来保存正在执行的表达式中的操作数，数据结构中学习过基于栈的多项式求值算法，操作数栈的作用和这个一样

2. 局部变量区，用来保存方法中使用的变量，包括方法参数，方法内部声明的变量，以及方法中使用到的对象的成员变量或类的成员变量（静态变量），最后两种变量会复制到局部变量区，因此在多线程环境下，这种变量需要根据需要声明为volatile类型

3. 字节码指令区，这个不用解释了，就是方法中的代码翻译成的指令

## 关于return与finally

有了上面的预备知识我们就不难理解return和finally之间的关系了，我们要记住的就是在 `return [expression];`

这里跟在return后面的表达式，

返回的是return指令执行的时刻，操作数栈顶的值，不管expression是一个怎样的表达式，究竟做了些什么工作，对于return指令来说都不重要，他只负责把操作数栈顶的值返回。

而return expression是分成两部分执行的:

1. 执行：expression；

2. 执行：return指令；


### 例如：return x+y；

这句代码先执行x+y，再执行return；首先执行将x以及y从局部变量区复制到操作数栈顶的指令，然后执行加法指令，这个时候结果x+y的值会保存在操作数栈的栈顶，最后执行return指令，返回操作数栈顶的值。

对于return x；先执行x，x也是一个表达式，这个表达式只有一个操作数，会执行将变量x从局部变量区复制到操作数栈顶的指令，然后执行return，返回操作数栈顶的值。因此return x实际返回的是return指令执行时，x在操作数栈顶的一个快照或者叫副本，而不是x这个值。

而当存在finally语句块的时候，

## finally 执行顺序

首先我们知道，finally语句是一定会执行，但他们的执行顺序是怎么样的呢？

他们的执行顺序如下：

1、执行：expression，计算该表达式，结果保存在操作数栈顶；

2、执行：操作数栈顶值（expression的结果）复制到局部变量区作为返回值；

3、执行：finally语句块中的代码；

4、执行：将第2步复制到局部变量区的返回值又复制回操作数栈顶；

5、执行：return指令，返回操作数栈顶的值；

我们可以看到，在第一步执行完毕后，整个方法的返回值就已经确定了，由于还要执行finally代码块，因此程序会将返回值暂存在局部变量区，腾出操作数栈用来执行finally语句块中代码，等finally执行完毕，再将暂存的返回值又复制回操作数栈顶。

所以无论finally语句块中执行了什么操作，都无法影响返回值，所以试图在finally语句块中修改返回值是徒劳的。

因此，finally语句块设计出来的目的只是为了让方法执行一些重要的收尾工作，而不是用来计算返回值的。

所以在finally中更改返回值是无效的，因为它只是更改了操作数栈顶端复制到局部变量区的快照，并不能真正的更改返回值，但是如果在

finally中使用return的话则是会将新的操作数栈的顶端数据返回，而不是之前复制到局部变量区用作返回内容快照的值返回，所以这样是可以返回的，同样的在cathch语句块里

也是这样，只有重新出现了return才有可能更改返回值。


## finally  在最后一个 return 前面执行

finally其实是仅在return 语句执行前执行，如果return一个函数，那么会先执行函数，但如果函数内有（return）语句，那么finally就会在这个return 语句前执行。finally在catch中的return之前执行但是如果catch中有返回值而finally中也有返回值的话finally中的返回值会替换catch中的返回值，因为catch中的返回值是存放在一个临时区中，try 中的过程和catch 是一样的。

如果catch块有异常向外抛出，执行顺序呢：我执行我，你抛你得异常，我finally我的语句，我俩互不干涉，你别管我啥时执行，但我一定会执行。

关于finally，此时，应该很明朗了只需记着一点：除非调用system.exit()让程序退出也就是将调用这个程序的进程断开了退出了这个程序就不会执行或断电等因素致使程序停止进程终止，否则无论任何因素finally块都一定会执行。


# finally 异常 

测试了如果 finally 异常，则会导致 return 失败。

所以比较麻烦的写法如下


```java
/**
 * @author binbin.hou
 * @date 2019/4/25
 * @since
 */
public class FinallyDemo {

    public static int test() {
        try {
            System.out.println("common...");
            return 1;
        } catch (Exception e) {
            System.out.println("meet ex...");
            return -1;
        } finally {
            try {
                System.out.println("finally....");
                throw new RuntimeException();
            } catch (RuntimeException e) {
                System.out.println("ex finally...");
            }
        }
    }

    public static void main(String[] args) {
        int value = test();
        System.out.println(value);
    }
}
```

- 日志

```
common...
finally....
ex finally...
```

## TWR

jdk1.7 资源文件关闭，使用 TWR 写法更加简洁。


# 实际使用

比如我想在一系列操作完成之后，进行最后的日志入库。

就应该使用这种方式。

# 参考资料

[JAVA中return与finally的先后关系](https://blog.csdn.net/sinat_22594643/article/details/80509266)

[有return的情况下try catch finally的执行顺序（最有说服力的总结）](https://www.cnblogs.com/fery/p/4709841.html)

[java中的异常以及 try catch finally以及finally的执行顺序](https://www.cnblogs.com/little-fly/p/6972684.html)

[Java异常机制--try catch finally 执行顺序详解-字节码](https://blog.csdn.net/u013309870/article/details/73498860)

- jdk7

[TRW](https://www.jianshu.com/p/62bb65a2e9dc)

* any list
{:toc}











