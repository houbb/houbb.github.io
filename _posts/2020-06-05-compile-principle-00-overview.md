---
layout: post
title: 编译原理系列-00-入门
date:  2020-6-4 13:34:28 +0800
categories: [Java]
tags: [java, compiling-principle, sf]
published: true
---

# 序言

至于《编译原理》，相信很多人都学习过。

就和《计算机组成原理》、《汇编语言》一样学的时候云里雾里，学完之后九霄云外。

这些知识属于难学少用，所以很容易忘记。

以前也学过 2 遍左右的编译原理，知道个大概，但是终究没有深入学习。

## 个人重学的理由

最新在写 [lombok-ex](https://github.com/houbb/lombok-ex) 一个类似于 lombok 的小工具。

想把 AOP 再提升一个档次，虽然磕磕绊绊也写了一些，但是对于编译原理不深入，终究还是写的不顺畅。

还想把这个做一个类似于 javaParser 的工具，让每一个开发者都很方便的编写编译时注解。

## 其他理由

对于知识的更迭，很多人会有一种很快的错觉。

实际上并不是，大部分的技术底层原理都是一样的。

技术的最底层可能就是 0+1 这种最纯粹的东西，然后向上是《信息论》《编译原理》《汇编语言》《计算机组成原理》，语言无论是 RUST/R/GO 还是什么其他语言，
本质并没有区别。

在向上就是设计模式+协议+CAP/ACID 等数学理论，如此种种。

**新技术是学不完的，但是原理可以。**

希望自己牢记：

```
程序 = 数据结构+算法
```

所以后期可能会多花些时间学习：

（1）数学

（2）数据结构+算法

（3）编译原理+计算机组成原理+ linux 操作系统

（4）分布式理论+网络通讯协议

（5）业务-所有的技术都是为了业务服务的

## 个人收获

可以有助于个人编写 lombok-ex

可以模拟一个 jvm，加深理解，编写 java 的文本解析工具。（编辑器、规则引擎）

创造属于自己的语言

# java 编译流程

java源代码(符合语言规范)-->javac-->.class(二进制文件)-->jvm-->机器语言(不同平台不同种类)

如何让java的语法规则适应java虚拟机的语法规则？

这个任务由javac编译器来完成java语言规范转换成java虚拟机语言规范。

编译流程：

![image](https://user-images.githubusercontent.com/18375710/83835220-cd1a4900-a722-11ea-867a-ac55b636eb4c.png)

流程：

- 词法分析器：将源码转换为Token流

将源代码划分成一个个Token(找出java语言中的if，else，for等关键字)

- 语法分析器：将Token流转化为语法树

将上述的一个个Token组成一句句话（或者说成一句句代码块），检查这一句句话是不是符合Java语言规范(如if后面跟的是不是布尔判断表达式)

- 语义分析器：将语法树转化为注解语法树

将复杂的语法转化成简单的语法（eg.注解、foreach转化为for循环、去掉永不会用到的代码块）并做一些检查，添加一些代码(默认构造器)

- 代码生成器：将注解语法树转化为字节码(即将一个数据结构转化成另一个数据结构)

ps：要获取javac编译器，可以通过OpenJDK来下载源码，可以自己编译javac的源码，也可以通过调用jdk的com.sun.tools.javac.main.Main类来手动编译指定的类。

Javac编译动作的入口是 com.sun.tools.javac.main.JavaCompiler 类，代码逻辑集中在这个类的 compile() 和 compile2() 方法中，整个编译最关键的处理就由图中标注的8个方法来完成，

![image](https://user-images.githubusercontent.com/18375710/83835396-4619a080-a723-11ea-842a-398fa4ada89c.png)

# 词法分析器

目的：将源码转换为Token流

流程：

一个字符一个字符的读取源代码，形成规范化的Token流。

规范化的Token包含：

java关键词：package、import、public、class、int等

自定义单词：包名、类名、变量名、方法名

符号：=、;、+、-、*、/、%、{、}等

## 源码关键：

词法分析过程是在的 JavacParser.parseCompilationUnit() 中完成的

- com.sun.tools.javac.parser.JavacParser　　

规定哪些词符合Java语言规范，具体读取和归类不同词法的操作由scanner完成

- com.sun.tools.javac.parser.Scanner　　

负责逐个读取源代码的单个字符,然后解析符合Java语言规范的Token序列，调用一次nextToken()都构造一个Token

- com.sun.tools.javac.parser.Tokens$TokenKind　　

里面包含了所有token的类型，譬如BOOLEAN,BREAK,BYTE,CASE。

- com.sun.tools.javac.util.Names　　

用来存储和表示解析后的词法，每个字符集合都会是一个Name对象，所有的对象都存储在Name.Table这个内部类中。

- com.sun.tools.javac.parser.KeyWords　　

负责将字符集合对应到token集合中，如，package zxy.demo.com; Token.PACKAGE = package， Token.IDENTIFIER = zxy.demo.com,(这部分又分为读取第一个token,为zxy，判断下一个token是否为“.”，是的话接着读取下一个Token.IDENTIFIER类型的token，反复直至下一个token不是”.”,也就是说下一个不是Token.IDENIFIER类型的token，Token.SEMI = ；即这个TIDENTIFIER类型的token的Name读完），KeyWords类负责此任务。

## 例子

```java
package compile;
public class Cifa {
    int a;
    int c = a + 1;
}
```

以上代码转化为的 Token 流：

![image](https://user-images.githubusercontent.com/18375710/83836374-d1943100-a725-11ea-92d1-1c775ef936f3.png)

# 语法分析器

## 目的

将进行词法分析后形成的Token流中的一个个Token组成一句句话，检查这一句句话是不是符合Java语言规范。

## 流程

package

import

类（包含class、interface、enum），一下提到的类泛指这三类，并不单单是指class

## 源码关键：

- com.sun.tools.javac.tree.TreeMaker　　

所有语法节点都是由它生成的，根据Name对象构建一个语法节点

- com.sun.tools.javac.tree.JCTree$JCIf 　　

所有的节点都会继承 jctree 和实现 `＊＊tree`，

譬如 JCIf extends JCTree.JCStatement implements IfTree

- com.sun.tools.javac.tree.JCTree 的三个属性

Tree tag:每个语法节点都会以整数的形式表示，下一个节点在上一个节点上加1；

pos：也是一个整数，它存储的是这个语法节点在源代码中的起始位置，一个文件的位置是0，而－1表示不存在

type：它代表的是这个节点是什么java类型，如int，float，还是string等

## 例子

```java
package compile;
public class Yufa {
    int a;
    private int c = a + 1;
    //getter
    public int getC() {
        return c;
    }
    //setter
    public void setC(int c) {
        this.c = c;
    }
}
```

- 最终语法树

![image](https://user-images.githubusercontent.com/18375710/83836405-e7a1f180-a725-11ea-809e-18ff989daf2e.png)

![image](https://user-images.githubusercontent.com/18375710/83836442-04d6c000-a726-11ea-84bf-aadd48445a7e.png)

ps：左边还少一个import的语法节点

- 说明：

每一个包 package 下的所有类都会放在一个 JCCompilationUnit 节点下，在该节点下包含：package语法树（作为pid）、各个类的语法树

每一个从JCClassDecl发出的分支都是一个完整的代码块，上述是四个分支，对应我们代码中的两行属性操作语句和两个方法块代码块，这样其实就完成了语法分析器的作用：将一个个Token单词组成了一句句话（或者说成一句句代码块）

在上述的语法树部分，对于属性操作部分是完整的，但是对于两个方法块，省略了一些语法节点，例如：方法修饰符public、方法返回类型、方法参数。

# 语义分析器

目的：将语法树转化为注解语法树

## 流程：

（1）添加默认的无参构造器（在没有指定任何有参构造器的情况下），把引用其他类的方法或者变量，抑或是继承实现来的变量和方法等输入到类自身的符号表中

（2）处理注解

（3）标注：检查语义合法性、进行逻辑判断

检查语法树中的变量类型是否匹配（eg.String s = 1 + 2;//这样"="两端的类型就不匹配）

检查变量、方法或者类的访问是否合法（eg.一个类无法访问另一个类的private方法）

变量在使用前是否已经声明、是否初始化

常量折叠（eg.代码中：String s = "hello" + "world"，语义分析后String s = "helloworld"）

推导泛型方法的参数类型

（4）数据流分析

变量的确定性赋值（eg.有返回值的方法必须确定有返回值）

final变量只能赋一次值，在编译的时候再赋值的话会报错

所有的检查型异常是否抛出或捕获

所有的语句都要被执行到（return后边的语句就不会被执行到，除了finally块儿）

（5）进一步语义分析

去掉永假代码（eg.if(false)）

变量自动转换（eg.int和Integer）自动装箱拆箱

去掉语法糖（eg.foreach转化为for循环，assert转化为if，内部类解析成一个与外部类相关联的外部类）

（6）最后，将经过上述处理的语法树转化为最后的注解语法树

## 源码关键：

- com.sun.tools.javac.comp.Enter　　

将 java 类中的符号输入到符号表中，主要是两个步骤：

将所有类中出现的符号输入到类自身的符号表中，所有类符号、类的参数类型符号（泛型参数类型）、超类符号和继承的接口类型符号等都存储到一个未处理的列表中。

将这个未处理的列表中所有的类都解析到各自的类符号列表中，这个操作是在MemberEnter.complete()中完成(默认构造器也是在这里完成的)。

com.sun.tools.javac.processing.JavacProcessingEnvironment　　处理注解

com.sun.tools.javac.comp.Attr　　检查语义的合理性并进行逻辑判断，类型是否匹配，是否初始化，泛型是否可推导，字符串常量合并

com.sun.tools.javac.comp.Check　　协助attr，变量类型是否正确

com.sun.tools.javac.comp.Resolve　　协助attr，变量方法类的访问是否合法，是否是静态变量

com.sun.tools.javac.comp.ConstFold　　协助attr，常量折叠

com.sun.tools.javac.comp.Infer　　协助attr，推导泛型

com.sun.tools.javac.comp.Flow　　数据流分析和替换等价源代码的分析（即上面的进一步语义分析）

# 代码生成器

## 目的

将注解语法树转化成字节码，并将字节码写入*.class文件。

## 流程

将java的代码块转化为符合JVM语法的命令形式，这就是字节码

按照JVM的文件组织格式将字节码输出到*.class文件中

## 源码关键：

com.sun.tools.javac.jvm.Gen　　遍历语法树生成最终的java字节码

com.sun.tools.javac.jvm.Items　　辅助gen，这个类表示任何可寻址的操作项，这些操作项都可以作为一个单位出现在操作栈上

com.sun.tools.javac.jvm.Code　　辅助gen，存储生成的字节码，并提供一些能够影射操作码的方法

# 个人收获

可以看到实际上源码==》语法树，语法树==》字节码。

这里有 2 处可以进行代码调整，我以前的思路一直是操作 AST，那么是否可以在语法树到字节码进行增量呢？

应该是可以的， asm 这种框架也可以提供支持。

# OCR 思路

PDF==》图片

图片==》文本

文本自动保存

# 参考资料

《现代编译原理 java》

[《现代编译原理:C语言描述》](https://book.douban.com/subject/1806974/)

[javac 编译原理](https://www.cnblogs.com/wade-luffy/p/5925728.html)

[java 编译原理](https://www.cnblogs.com/qingshanli/p/9281760.html)

## OCR

[OCR软件哪个好？](https://www.zhihu.com/question/34873811)

[github OCR](https://github.com/search?q=ocr)

* any list
{:toc}