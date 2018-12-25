---
layout: post
title:  JVM-13-compile optimize
date:  2018-10-08 16:04:16 +0800
categories: [JVM]
tags: [java, log, jvm, sf]
published: true
excerpt: JVM 编译时期优化
---

# JVM编译器优化

JVM的编译器可以分为三个编译器： 

1、前端编译器：把.java转变为.class的过程。如Sun的Javac、Eclipse JDT中的增量式编译器（ECJ）。 
2、JIT编译器：把字节码转变为机器码的过程，如HotSpot VM的C1、C2编译器。 

3、AOT编译器：静态提前编译器，直接将*.java文件编译本地机器代码的过程。

# Javac编译器

Javac编译器本身是由Java语言编写的程序。

java语言的编译期是一段不确定的过程，因为它可能是指一个前端编译器（sun的javac、eclipse JDT中的ECJ），把.java文件转为..class文件；

也可能是指虚拟机的后端运行期编译器（JIT:C1、C2）把字节吗转变为机器码的过程；

还有可能指使用静态提前编译器(AOT：GCJ)直接把.java文件编译成本地机器码的过程。 

这里所说的编译器和编译期都是指第一类前端编译器过程,那么这里谈优化就比较简单，因为虚拟机设计团队把性能的优化集中到了后端的即时编译器，这样可以使那些不是javac产生的class文件（JRuby，Groovy等语言的class文件）也同样能享受到编译器优化所带来的好处。

但是javac做了许多针对Java语言编码过程的优化措施来改善程序员的编码风格和提高编码效率。

相当多的新生的java语法特性，都是靠编译器的语法糖来实现的，而不是依赖虚拟机底层改进来支持。 

可以说，Java中的即时编译器在运行期的优化对于程序来说更重要，而前端编译器在编译期的优化过程对于编码来说关系更加密切。 

## Javac的源码和调试

javac的源码存放在 `JDK_SRC_HOME/langtools/src/share/slasses/com/sun/tools/javac` 中。 

编译过程大致可以分为3个过程：

1、解析与填充符号表过程。 

2、插入式注解处理器的注解处理过程。 

3、分析与字节码生成过程。 

![编译过程](https://img-blog.csdn.net/20180605215405830?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzI2NTY0ODI3/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

## 解析与符号填充 

解析：包括经典程序编译原理中的词法分析和语法分析两个过程 

### 词法与语法分析 

词法分析是将源代码的字符流转为标记（Token）集合，单个字符是程序编写过程中的最小元素，而标记则是编译过程中的最小元素，关键字 
变量名、字面量、运算符都可以成为标记：如int a=b+2 这句代码有6个标记，其中int表示三个字符（空格算不算字符？） 
语法分析是根据Token序列构造出抽象语法树的过程，抽象语法树是一种用来表述程序代码语法结构的树形表示方式，语法树的每一个节点都代表程序代码中的一个语法结构，比如包、类、修饰符、运算符、接口…. 
经过这个阶段之后，编译器就基本不会再对源码文件操作了，都是建立在语法树之上。 

### 填充符号表 

符号表是一组符号地址和符号信息构成的表格，可以想象成哈希表中K-V值对的形式。符号表中所登记的信息在编译的不同阶段都会用到。在语义分析中，符号表所登记的内容将用于语义检查（比如检查一个名字的使用和原先的说明是否一致）和产生中间代码。在目标代码生成阶段（目标代码生成是编译的最后一个阶段。目标代码生成器把语法分析后或优化后的中间代码变换成目标代码），当对符号名进行地址分配时，符号表就是地址分配的依据。

## 注解处理器

JDK1.5之后，出现的注解与普通的Java代码一样，是在运行期发挥作用。

jdk1.6提供了一组插入式注解处理器的标准API在编译器对注解进行处理。

可以把它看做是一组编译器的插件，可以读取、修改、添加抽象语法树的任意元素（使得根据注解添加实例域/方法成为可能,比如生成setter和getter方法。

如果在处理注解期间对语法树进行了修改，编译器将回到解析及填充符号表的过程，直至语法书没有任何修改如上图。 

## 语义分析与字节码生成 

虽然语法分析后得到的语法树能表示一个结构正确的源程序的抽象，但无法保证源程序是符合逻辑的。而语义分析主要任务是对结构上的正确的源程序进行上下文有关性质的审查，如进行类型审查：int a=1；char c=2;后续可能会出现c=a+c； 

### 1. 标注检查

javac编译过程中，语义分析分为标注检查和数据及控制流分析两个过程 
标注检查:包括变量使用前是否已被声明、变量与赋值之间的数据类型是否匹配。还有一个常量折叠动作：int a=1+2；虽然在语法树上还可以看到字面量“1”“2”以及操作符+，但经过常量折叠之后，就会变成字面量3。 

### 2. 数据及控制流分析

是对程序上下文逻辑的更进一步的验证，可以检查出局部变量在使用前是否已经赋值、方法的每条出路是否有返回值、是否所有的受查异常都被正确处理等。 

编译时期的数据及控制流分析与类加载时期数据及控制流分析的目的基本上是一致的，但校检范围有所不同，有一些校检项只能在编译器或者运行期才能进行：

```java
//方法一带有final修饰
public void foo（final int arg）{
    final int var=0；
    //do something
}
// 方法二没有final修饰
public void foo（ int arg）{
    int var=0；
    //do something
}
```

参数和局部变量定义使用了final修饰符，在代码编写时肯定会受到final修饰符的影响，arg var值是不能改变的，但是这两段代码编译出来的Class文件却没有任何区别。

局部变量和字段是有区别的，局部变量在常量池中没有CONSTANT_Fieldref_info的符号引用，自然就没有Access_Flags访问标志的信息，甚至连名称都不会保存下来，自然在Class文件中不可能知道一个局部变量是不是声明为final。

因此将局部变量声明为final，对运行期没有影响，变量的不变性仅仅是由编译器在编译期保障。 

### 3. 解语发糖

语法糖也称糖衣语法，是指计算机语言中添加的某种语法，这种语法对语言的功能没有影响，但是更方便程序员使用。

能够增加程序的可读性，从而减少程序代码出错的机会。 

java中常用的语法糖主要是泛型、变长参数、自动装箱/拆箱等，虚拟机运行时不支持这些语法，他们在编译阶段还原回简单的基础语法结构，这个过程称为解语法糖。 

### 4. 字节码生成 

字节码生成是javac编译过程的最后一个阶段，这个阶段不仅把前面各个步骤所生成的信息（语法树、符号表）转化成字节码写到磁盘里，编译器还进行了少量的代码添加和转换工作。 
比如：

实力构造器()方法和类构造器()方法就是在这个阶段添加到语法树中（并不是默认构造函数，如何用户代码中没有任何构造函数，添加默认构造函数是在填充符号表阶段完成） 

# Java语法糖的味道 

## 泛型与类型檫除 

泛型技术在C#中无论是在程序源码中、编译后的IL中，或运行期CLR中，都是切实存在的，List与List就是两个不同的类型，他们在系统运行期生成，

有自己的虚方法表和类型数据，这种实现称为类型膨胀，基于这种方法实现的泛型称为真实泛型。 

而Java中的泛型不一样，它只在程序源码中存在，在编译后的字节码文件中就已经替换为原来的原生类型（裸类型），并且在相应的地方插入强制转型代码。

因此对于运行期的java语言来说，ArrayList与ArrayList就是同一个类，所以泛型技术就是一颗语法糖，java语言中的泛型实现方法称为类型檫除，基于这种方法实现的泛型称为伪泛型。 

```java
public static void main(String args){
    Map<String,String>map=new HashMap<String,String>();
    map.put("hello","你好");
    map.put("how are you?","吃了没？")
    System.out.println(map.get("hello"));
    System.out.println(map.get("how are you?"));
}
```

- 泛型擦除后的例子

```java
public static void main(String args){
    Mapmap=new HashMap();
    map.put("hello","你好");
    map.put("how are you?","吃了没？")
    System.out.println((String)map.get("hello"));
    System.out.println((String)map.get("how are you?"));
}
```

### 泛型和重载

```java
import java.util.List;

public class GenericType {
    public static void method(List<String>list){
        System.out.println("invoke method(List<String>list)");
    }
    public static void method(List<Integer>list){
        System.out.println("invoke method(List<Integer>list)");
    }
}

public class GenericType {
    public static String  method(List<String> list){
        System.out.println("invoke method(List<String>list)");
        return "";
    }
    public static int  method(List<Integer> list){
        System.out.println("invoke method(List<String>list)");
        return 1;
    }
}
```

无论第一个类还是第二个类，在JDK1.7中的javac都不能编译成功，但是第二个类中的方法加上返回类型就在JDK1.6中可以编译成功，其他的却不行。

都是提示在类型檫除后方法重复。

Signature是比较重要的一项，它存储一个方法字节码层面的特征签名（区别java层面特征签名，还包含返回值和受查异常表），这个属性中保存的参数类型并不是原生的类型，而是参数化的类型信息。

但是虚拟机要识别49.0以上的版本Class文件的Signature参数。

那么可以得出结论，檫除类型只是檫除Code属性中的字节码，实际上元数据还保留了泛型信息。 

## 自动装箱、拆箱与遍历循环 

虽然这些语法糖不能与泛型相比（思想与实现上）,但他们确是使用最多的的语法糖。

```java
public static void main(String []args){
    List<Integer> list=ArrayList.aslist(1,2,3,4);
    //在1.7中还可以进一步简化List<Integer> list=[1,2,3,4] 
    int sum=0;
    for(int i:list){
    sum+=i;
	System.out.println(sum);
}
```

```java
public static void main(String args){
    List list=Arrays.asList(new Integer[]{
    Integer.valueOf(1),
    Integer.valueOf(2),
    Integer.valueOf(3),
    Integer.valueOf(4),
});
int sum=0;
for(Iterator localIterator=list.iterator();localIterator.hasNext();){
    int i=((Integer)localIterator.hasNext()).intValue();
    sum+=i;
}
System.out.println(sum);
}
```

上面代码实现了泛型、自动装箱、自动拆箱、遍历循环与变长参数5种语法糖。 

遍历循环把代码还原成了迭代器的实现，这也是为何遍历循环需要被遍历的类实现Iterable接口的原因。

最后在看看变长参数（asList() ），它在调用的时候变成了一个数组类型的参数，在变长参数出来之前，程序员使用数组来完成类似功能。 

- 自动装箱的错误用法：

```java
public class AutoBox {
    public static void main(String[] args) {
        Integer a=1;
        Integer b=2;
        Integer c=3;
        Integer d=3;
        Integer e=321;
        Integer f=321;
        Long g=3L;
        System.out.println("c==d:"+(c==d));
        System.out.println("e==f:"+(e==f));
        System.out.println("c==(a+b):"+(c==(a+b)));
        System.out.println("c.equals(a+b)"+(c.equals(a+b)));
        System.out.println("g==(a+b)"+(g==(a+b)));
        System.out.println("g.equals(a+b):"+g.equals(a+b));
    }
}
运行结果：
c==d:true
e==f:false
c==(a+b):true
c.equals(a+b)true
g==(a+b)true
g.equals(a+b):false
```

从上面可以看出，第一个输出的结果与第二行输出的结果有很大的区别，类型都一样，除了数值大小不一样，为什么结果不一样那？ 

首先来说一下在包装类遇到“==”号的情况下，如果不遇到算数运算符（+、-、*、……）是不会自动拆箱的.所以这里“==”比较的是对象（地址），既然比较的是对象地址，为什么第一个会相等那？

其实和实现有关，对于Integer 类型，整型的包装类系统会自动在常量池中初始化-128至127的值，如果c和d都指向同一个对象，即同一个地址。

但是对于超出范围外的值就是要通过new来创建包装类型，所以内存地址也不相等，这也是为什么e==f:false。 

c==(a+b):true这个相等时因为遇到运算符自动拆箱变为数值比较，所以相等。 

包装类都重写了equals() 方法，他们进行比较时是比的拆箱后数值。但是并不会进行类型转换 

```java
public boolean equals(Object obj) { 
if (obj instanceof Integer) { //首先看比较的类型是不是同一个类型，如果是，则比较值是否相等，否则是Long则直接返回false 
return value == ((Integer)obj).intValue(); 
} 
return false; 
} 
c.equals(a+b)true： 
```

这里a+b返回还是包装类型，然后进行equals方法进行比较时，根据上面的源码可以看出返回true； 

g==(a+b)true是因为==遇到算数运算符会自动拆箱（long） 3==（int）3 

g.equals(a+b):false 从上面的Integer的equals方法可以看出类似的，首先比较a+b类型是不是Long，不是则直接返回false。 

注意：包装类型在遇到“==”情况下，没有遇到算数运算符不会自动拆箱，遇到会自动拆箱比较值。

而在equals情况下，即使遇到算数运算符也不会进行拆箱操作，也不会进行类型装换（从equals方法可以看出，是要包装类型不相等，即使值相等也是返回false。）

## 条件编译

Java语言使用条件为常量的if语句，此代码中的if语句不同于其他Java代码，它在编译阶段就会被运行，生成的字节码之中只包含条件正确的部分。 

Java语言中条件编译的实现，也是Java语言的一颗语法糖，根据布尔常量值的真假，编译器将会把分支中不成立的代码块消除掉，这是在解语法糖阶段实现的。

而 `while(false){ }` 这样的代码块是通过不了编译的，会提示“Unreachable code”

Java语言中还有不少的其他语言糖，如内部类、枚举类、断言语句、对枚举和字符串的switch支持、try语句中定义和关闭资源等等。

# 参考资料

《深入理解 jvm》

[JVM总结（六）：早期（编译期）优化](https://www.cnblogs.com/zhouyuqin/p/5223180.html)

[JVM之早期(编译期)优化（十）](https://blog.csdn.net/qq_26564827/article/details/80587418)

* any list
{:toc}