---
layout: post
title: JVM-07-class file
date:  2018-10-08 16:04:16 +0800
categories: [Java]
tags: [sql, java, jvm, sh]
published: true
excerpt: JVM class file 文件信息
---

# class 文件查看

## java 代码

```java
package com.github.houbb.jvm.learn;

public class Main {

    public static void main(String[] args) {
        System.out.println("hello jvm");
    }

}
```

## 编译后参看文件 

```
>javap -verbose Main.class
Classfile /D:/github/jvm-learn/target/classes/com/github/houbb/jvm/learn/Main.class
  Last modified 2018-12-24; size 567 bytes
  MD5 checksum 1ada8a5535444a01fddcea39e1cc34df
  Compiled from "Main.java"
public class com.github.houbb.jvm.learn.Main
  minor version: 0
  major version: 49
  flags: ACC_PUBLIC, ACC_SUPER
Constant pool:
   #1 = Methodref          #6.#20         // java/lang/Object."<init>":()V
   #2 = Fieldref           #21.#22        // java/lang/System.out:Ljava/io/PrintStream;
   #3 = String             #23            // hello jvm
   #4 = Methodref          #24.#25        // java/io/PrintStream.println:(Ljava/lang/String;)V
   #5 = Class              #26            // com/github/houbb/jvm/learn/Main
   #6 = Class              #27            // java/lang/Object
   #7 = Utf8               <init>
   #8 = Utf8               ()V
   #9 = Utf8               Code
  #10 = Utf8               LineNumberTable
  #11 = Utf8               LocalVariableTable
  #12 = Utf8               this
  #13 = Utf8               Lcom/github/houbb/jvm/learn/Main;
  #14 = Utf8               main
  #15 = Utf8               ([Ljava/lang/String;)V
  #16 = Utf8               args
  #17 = Utf8               [Ljava/lang/String;
  #18 = Utf8               SourceFile
  #19 = Utf8               Main.java
  #20 = NameAndType        #7:#8          // "<init>":()V
  #21 = Class              #28            // java/lang/System
  #22 = NameAndType        #29:#30        // out:Ljava/io/PrintStream;
  #23 = Utf8               hello jvm
  #24 = Class              #31            // java/io/PrintStream
  #25 = NameAndType        #32:#33        // println:(Ljava/lang/String;)V
  #26 = Utf8               com/github/houbb/jvm/learn/Main
  #27 = Utf8               java/lang/Object
  #28 = Utf8               java/lang/System
  #29 = Utf8               out
  #30 = Utf8               Ljava/io/PrintStream;
  #31 = Utf8               java/io/PrintStream
  #32 = Utf8               println
  #33 = Utf8               (Ljava/lang/String;)V
{
  public com.github.houbb.jvm.learn.Main();
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
            0       5     0  this   Lcom/github/houbb/jvm/learn/Main;

  public static void main(java.lang.String[]);
    descriptor: ([Ljava/lang/String;)V
    flags: ACC_PUBLIC, ACC_STATIC
    Code:
      stack=2, locals=1, args_size=1
         0: getstatic     #2                  // Field java/lang/System.out:Ljava/io/PrintStream;
         3: ldc           #3                  // String hello jvm
         5: invokevirtual #4                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
         8: return
      LineNumberTable:
        line 10: 0
        line 11: 8
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       9     0  args   [Ljava/lang/String;
}
SourceFile: "Main.java"
```

## 文件格式

Class文件的结构不像XML等描述语言那样松散自由。

由于它没有任何分隔符号，所以，以上数据项无论是顺序还是数量都是被严格限定的。

哪个字节代表什么含义，长度是多少，先后顺序如何，都不允许改变。

![文件格式](http://img.my.csdn.net/uploads/201209/04/1346768613_6175.png)

# 概述

任何一个Class文件都对应唯一一个类或接口的定义信息，但是不是所有的类或接口都得定义在文件中（它们也可以通过类加载器直接生成)。

Class文件是一组以8位字节为基础单位的二进制流，各个数据项严格按顺序排列，没有任何分隔符。Class文件格式采用一种类似于C语言结构体的伪结构来存储数据，这种伪结构只有两种数据类型：无符号数和表。

无符号数：是基本数据类型，以u1、u2、u4、u8分别代表1个字节、2个字节、4个字节、8个字节的无符号数，可以用来描述数字、索引引用、数量值或者按照UTF-8编码构成的字符串值。

表：由多个无符号数或者其他表作为数据项构成的复合数据类型，所有表都习惯性地以“_info”结尾。

整个Class文件本质上就是一张表，如下所示：

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p align="left">类型</p>
</td>
<td valign="top">
<p align="left">名称</p>
</td>
<td valign="top">
<p align="left">数量</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">u4</p>
</td>
<td valign="top">
<p align="left">magic</p>
</td>
<td valign="top">
<p align="left">1</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">minor_version</p>
</td>
<td valign="top">
<p align="left">1</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">major_version</p>
</td>
<td valign="top">
<p align="left">1</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">constant_pool_count</p>
</td>
<td valign="top">
<p align="left">1</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">cp_info</p>
</td>
<td valign="top">
<p align="left">constant_pool</p>
</td>
<td valign="top">
<p align="left">constant_pool_count-1</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">access_flags</p>
</td>
<td valign="top">
<p align="left">1</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">this_class</p>
</td>
<td valign="top">
<p align="left">1</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">super_class</p>
</td>
<td valign="top">
<p align="left">1</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">interfaces_count</p>
</td>
<td valign="top">
<p align="left">1</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">interfaces</p>
</td>
<td valign="top">
<p align="left">interfaces_count</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">fields_count</p>
</td>
<td valign="top">
<p align="left">1</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">field_info</p>
</td>
<td valign="top">
<p align="left">fields</p>
</td>
<td valign="top">
<p align="left">fields_count</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">methods_count</p>
</td>
<td valign="top">
<p align="left">1</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">method_info</p>
</td>
<td valign="top">
<p align="left">methods</p>
</td>
<td valign="top">
<p align="left">methods_count</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">attributes_count</p>
</td>
<td valign="top">
<p align="left">1</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">attribute_info</p>
</td>
<td valign="top">
<p align="left">attributes</p>
</td>
<td valign="top">
<p align="left">attributes_count</p>
<div>&nbsp;</div>
</td>
</tr>
</tbody>
</table>

# class 文件

## java 类

使用以下的类进行说明：

```java
package com.test;

public class Test {
	private int m;
	
	public int getM(){
		return m + 1;
	}
}
```

## 内容

```
00000000   CA FE BA BE 00 00 00 31  00 16 0A 00 04 00 12 09   漱壕   1        
00000010   00 03 00 13 07 00 14 07  00 15 01 00 01 6D 01 00                m  
00000020   01 49 01 00 06 3C 69 6E  69 74 3E 01 00 03 28 29    I   <init>   ()
00000030   56 01 00 04 43 6F 64 65  01 00 0F 4C 69 6E 65 4E   V   Code   LineN
00000040   75 6D 62 65 72 54 61 62  6C 65 01 00 12 4C 6F 63   umberTable   Loc
00000050   61 6C 56 61 72 69 61 62  6C 65 54 61 62 6C 65 01   alVariableTable 
00000060   00 04 74 68 69 73 01 00  0F 4C 63 6F 6D 2F 74 65     this   Lcom/te
00000070   73 74 2F 54 65 73 74 3B  01 00 04 67 65 74 4D 01   st/Test;   getM 
00000080   00 03 28 29 49 01 00 0A  53 6F 75 72 63 65 46 69     ()I   SourceFi
00000090   6C 65 01 00 09 54 65 73  74 2E 6A 61 76 61 0C 00   le   Test.java  
000000A0   07 00 08 0C 00 05 00 06  01 00 0D 63 6F 6D 2F 74              com/t
000000B0   65 73 74 2F 54 65 73 74  01 00 10 6A 61 76 61 2F   est/Test   java/
000000C0   6C 61 6E 67 2F 4F 62 6A  65 63 74 00 21 00 03 00   lang/Object !   
000000D0   04 00 00 00 01 00 02 00  05 00 06 00 00 00 02 00                   
000000E0   01 00 07 00 08 00 01 00  09 00 00 00 2F 00 01 00               /   
000000F0   01 00 00 00 05 2A B7 00  01 B1 00 00 00 02 00 0A        *? ?     
00000100   00 00 00 06 00 01 00 00  00 07 00 0B 00 00 00 0C                   
00000110   00 01 00 00 00 05 00 0C  00 0D 00 00 00 01 00 0E                   
00000120   00 0F 00 01 00 09 00 00  00 31 00 02 00 01 00 00            1      
00000130   00 07 2A B4 00 02 04 60  AC 00 00 00 02 00 0A 00     *?  `?      
00000140   00 00 06 00 01 00 00 00  0C 00 0B 00 00 00 0C 00                   
00000150   01 00 00 00 07 00 0C 00  0D 00 00 00 01 00 10 00                   
00000160   00 00 02 00 11       
```

# 1.魔数

每一个class文件的头4个字节称为魔数，它唯一的作用是确定这个文件是否为一个能被虚拟机接受的Class文件。

非常多文件存储标准中都使用魔数来进行身份识别。譬如图片格式gif、jpeg等。

使用魔数而不是拓展名来进行识别主要是基于安全方面的考虑，由于文件拓展格式能够任意修改。

Class文件的魔数为：`0xCAFEBABE`（咖啡宝贝？）。

这个魔数似乎也预示着日后JAVA这个商标名称的出现。

# 2.版本号

第五六个字节是次版本号（Minor Version），第7和第8个字节是主版本号（Major Version）。

高版本的JDK可以向下兼容以前版本的Class文件，但是无法运行以后版本的Class文件，即使文件格式并未发生变化，虚拟机也必须拒绝执行超过其版本号的Class文件。

## 3.常量池

常量池能够理解为Class文件之中的资源仓库，是Class文件结构中与其它项目关联最多的数据类型，也是占用Class文件空间最大的数据项目之中的一个。

同一时候也是在Class文件里第一个出现的表类型数据项目。

**因为常量池中常量的数目是不固定的，所以在常量池入口须要放置一个2字节长的无符号数constatn_pool_count来代表常量池容量计数值。**

这个容量计数从1而不是0開始。

constant_pool_count：占2字节。0x0016。转化为十进制为22，即说明常量池中有21个常量（仅仅有常量池的计数是从1開始的，其他集合类型均从0開始），索引值为1~22。第0项常量具有特殊意义。假设某些指向常量池索引值的数据在特定情况下须要表达“不引用不论什么一个常量池项目”的含义，这样的情况能够将索引值置为0来表示

常量池中主要存放两大类常量：字面量和符号引用。字面量如文本字符串、声明为final的常量值等。符号引用包含三类常量：类和接口的全限定名、字段的名称和描写叙述符、方法的名称和描写叙述符。

常量池中的每一项常量都是一个表，在JDK1.7之前共同拥有11种结构各不同样的表数据结构。

这些表数据结构在表開始的第一位是一个u1类型的标志位，代表当前这个常量属于那种常量类型。

例如以下表所看到的：

<table>
<tbody>
<tr>
<td valign="top">
<p align="left">类型</p>
</td>
<td valign="top">
<p align="left">简介</p>
</td>
<td valign="top">
<p align="left">项目</p>
</td>
<td valign="top">
<p align="left">类型</p>
</td>
<td valign="top">
<p align="left">描述</p>
</td>
</tr>
<tr>
<td rowspan="3" valign="top">
<p align="left">CONSTANT_Utf8_info</p>
</td>
<td rowspan="3" valign="top">
<p align="left">utf-8缩略编码字符串</p>
</td>
<td valign="top">
<p align="left">tag</p>
</td>
<td valign="top">
<p align="left">u1</p>
</td>
<td valign="top">
<p align="left">值为1</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">length</p>
</td>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">utf-8缩略编码字符串占用字节数</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">bytes</p>
</td>
<td valign="top">
<p align="left">u1</p>
</td>
<td valign="top">
<p align="left">长度为length的utf-8缩略编码字符串</p>
</td>
</tr>
<tr>
<td rowspan="2" valign="top">
<p align="left">CONSTANT_Integer_info</p>
</td>
<td rowspan="2" valign="top">
<p align="left">整形字面量</p>
</td>
<td valign="top">
<p align="left">tag</p>
</td>
<td valign="top">
<p align="left">u1</p>
</td>
<td valign="top">
<p align="left">值为3</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">bytes</p>
</td>
<td valign="top">
<p align="left">u4</p>
</td>
<td valign="top">
<p align="left">按照高位在前储存的int值</p>
</td>
</tr>
<tr>
<td rowspan="2" valign="top">
<p align="left">CONSTANT_Float_info</p>
</td>
<td rowspan="2" valign="top">
<p align="left">浮点型字面量</p>
</td>
<td valign="top">
<p align="left">tag</p>
</td>
<td valign="top">
<p align="left">u1</p>
</td>
<td valign="top">
<p align="left">值为4</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">bytes</p>
</td>
<td valign="top">
<p align="left">u4</p>
</td>
<td valign="top">
<p align="left">按照高位在前储存的float值</p>
</td>
</tr>
<tr>
<td rowspan="2" valign="top">
<p align="left">CONSTANT_Long_info</p>
</td>
<td rowspan="2" valign="top">
<p align="left">长整型字面量</p>
</td>
<td valign="top">
<p align="left">tag</p>
</td>
<td valign="top">
<p align="left">u1</p>
</td>
<td valign="top">
<p align="left">值为5</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">bytes</p>
</td>
<td valign="top">
<p align="left">u8</p>
</td>
<td valign="top">
<p align="left">按照高位在前储存的long值</p>
</td>
</tr>
<tr>
<td rowspan="2" valign="top">
<p align="left">CONSTANT_Double_info</p>
</td>
<td rowspan="2" valign="top">
<p align="left">双精度浮点型字面量</p>
</td>
<td valign="top">
<p align="left">tag</p>
</td>
<td valign="top">
<p align="left">u1</p>
</td>
<td valign="top">
<p align="left">值为6</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">bytes</p>
</td>
<td valign="top">
<p align="left">u8</p>
</td>
<td valign="top">
<p align="left">按照高位在前储存的double值</p>
</td>
</tr>
<tr>
<td rowspan="2" valign="top">
<p align="left">CONSTANT_Class_info</p>
</td>
<td valign="top">
<p align="left">类或接口的符号引用</p>
</td>
<td valign="top">
<p align="left">tag</p>
</td>
<td valign="top">
<p align="left">u1</p>
</td>
<td valign="top">
<p align="left">值为7</p>
</td>
</tr>
<tr>
<td valign="top">&nbsp;</td>
<td valign="top">
<p align="left">index</p>
</td>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">指向全限定名常量项的索引</p>
</td>
</tr>
<tr>
<td rowspan="2" valign="top">
<p align="left">CONSTANT_String_info</p>
</td>
<td rowspan="2" valign="top">
<p align="left">字符串类型字面量</p>
</td>
<td valign="top">
<p align="left">tag</p>
</td>
<td valign="top">
<p align="left">u1</p>
</td>
<td valign="top">
<p align="left">值为8</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">index</p>
</td>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">指向字符串字面量的索引</p>
</td>
</tr>
<tr>
<td rowspan="3" valign="top">
<p align="left">CONSTANT_Fieldref_info</p>
</td>
<td rowspan="3" valign="top">
<p align="left">字段的符号引用</p>
</td>
<td valign="top">
<p align="left">tag</p>
</td>
<td valign="top">
<p align="left">u1</p>
</td>
<td valign="top">
<p align="left">值为9</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">index</p>
</td>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">指向声明字段的类或接口描述符CONSTANT_Class_info的索引项</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">index</p>
</td>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">指向字段描述符CONSTANT_NameAndType_info的索引项</p>
</td>
</tr>
<tr>
<td rowspan="3" valign="top">
<p align="left">CONSTANT_Methodref_info</p>
</td>
<td rowspan="3" valign="top">
<p align="left">类中方法的符号引用</p>
</td>
<td valign="top">
<p align="left">tag</p>
</td>
<td valign="top">
<p align="left">u1</p>
</td>
<td valign="top">
<p align="left">值为10</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">index</p>
</td>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">指向声明方法的类描述符CONSTANT_Class_info的索引项</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">index</p>
</td>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">指向名称及类型描述符CONSTANT_NameAndType_info的索引项</p>
</td>
</tr>
<tr>
<td rowspan="3" valign="top">
<p align="left">CONSTANT_InterfaceMethodref_info</p>
</td>
<td rowspan="3" valign="top">
<p align="left">接口中方法的符号引用</p>
</td>
<td valign="top">
<p align="left">tag</p>
</td>
<td valign="top">
<p align="left">u1</p>
</td>
<td valign="top">
<p align="left">值为11</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">index</p>
</td>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">指向声明方法的接口描述符CONSTANT_Class_info的索引项</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">index</p>
</td>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">指向名称及类型描述符CONSTANT_NameAndType_info的索引项</p>
</td>
</tr>
<tr>
<td rowspan="3" valign="top">
<p align="left">CONSTANT_NameAndType_info</p>
</td>
<td rowspan="3" valign="top">
<p align="left">字段或方法的部分符号引用</p>
</td>
<td valign="top">
<p align="left">tag</p>
</td>
<td valign="top">
<p align="left">u1</p>
</td>
<td valign="top">
<p align="left">值为12</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">index</p>
</td>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">指向该字段或方法名称常量项的索引</p>
</td>
</tr>
<tr>
<td valign="top">
<p align="left">index</p>
</td>
<td valign="top">
<p align="left">u2</p>
</td>
<td valign="top">
<p align="left">指向该字段或方法描述符常量项的索引</p>
<div>&nbsp;</div>
</td>
</tr>
</tbody>
</table>

首先来看常量池中的第一项常量，其标志位为0x07，是一个CONSTANT_Class_info类型常量，此类型常量代表一个类或接口的符号引用。根据其数据结构，接下来2位字节用来保存一个索引值，它指向常量池中一个CONSTANT_Utf8_info类型的常量，此常量代表了这个类或接口的全限定名，索引值为0x0002，即指向了常量池中的第二项常量。

第二项常量标志位为0x01，确实是一个CONSTANT_Utf8_info类型的常量。根据其数据结构，接下来2个字节用来保存utf-8缩略编码字符串长度，其值为0x000D，转化为十进制为13，即接下来的13个字节为一个utf-8缩略编码的字符串，为com/test/Test，可以看到正好是测试类的全限定名。

## 4.访问标志
 
在常量池结束之后，紧接着的两个字节代表访问标志，用于识别一些类或者接口层次的访问信息。

如下表所示。


<table>
<tbody>
<tr>
<td valign="top">
<p>志名称</p>

</td>
<td valign="top">
<p>标志值</p>

</td>
<td valign="top">
<p>含义</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_PUBLIC</p>

</td>
<td valign="top">
<p>0x0001</p>

</td>
<td valign="top">
<p>是否为public类型</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_FINAL</p>

</td>
<td valign="top">
<p>0x0010</p>

</td>
<td valign="top">
<p>是否被声明为final，只有类可设置</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_SUPER</p>

</td>
<td valign="top">
<p>0x0020</p>

</td>
<td valign="top">
<p>是否允许使用invokespecial字节码指令，JDK1.2以后编译出来的类这个标志为真</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_INTERFACE</p>

</td>
<td valign="top">
<p>0x0200</p>

</td>
<td valign="top">
<p>标识这是一个接口</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_ABSTRACT</p>

</td>
<td valign="top">
<p>0x0400</p>

</td>
<td valign="top">
<p>是否为abstract类型，对于接口和抽象类，此标志为真，其它类为假</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_SYNTHETIC</p>

</td>
<td valign="top">
<p>0x1000</p>

</td>
<td valign="top">
<p>标识别这个类并非由用户代码产生</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_ANNOTATION</p>

</td>
<td valign="top">
<p>0x2000</p>

</td>
<td valign="top">
<p>标识这是一个注解</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_ENUM</p>

</td>
<td valign="top">
<p>0x4000</p>

</td>
<td valign="top">
<p>标识这是一个枚举</p>

</td>
</tr>
</tbody>
</table>

根据上面的表格，测试类的访问标志

`0x0021= 0x0001 | 0x0020 =ACC_PUBLIC | ACC_SUPER`

## 5.类索引、父类索引和接口索引集合
 
Class文件中由这3项数据来确定这个类的继承关系

this_class：类索引，用于确定这个类的全限定名，占2字节

super_class：父类索引，用于确定这个类父类的全限定名（Java语言不允许多重继承，故父类索引只有一个。除了java.lang.Object类之外所有类都有父类，故除了java.lang.Object类之外，所有类该字段值都不为0），占2字节

interfaces_count：接口索引计数器，占2字节。如果该类没有实现任何接口，则该计数器值为0，并且后面的接口的索引集合将不占用任何字节，

interfaces：接口索引集合，一组u2类型数据的集合。用来描述这个类实现了哪些接口，这些被实现的接口将按implements语句（如果该类本身为接口，则为extends语句）后的接口顺序从左至右排列在接口的索引集合中

this_class、super_class与interfaces中保存的索引值均指向常量池中一个CONSTANT_Class_info类型的常量，通过这个常量中保存的索引值可以找到定义在CONSTANT_Utf8_info类型的常量中的全限定名字符串

this_class的值为0x0001，即常量池中第一个常量，super_class的值为0x0003，即常量池中的第三个常量，interfaces_counts的值为0x0000，故接口索引集合大小为0

## 6.字段表集合

字段表用于描述接口或者类中声明的变量，包括类级变量和实例级变量(是否是static)，但不包括在方法内部声明的局部变量。

fields_count：字段表计数器，即字段表集合中的字段表数据个数。占2字节，其值为0x0001，即只有一个字段表数据，也就是测试类中只包含一个变量（不算方法内部变量）

fields：字段表集合，一组字段表类型数据的集合。字段表用于描述接口或类中声明的变量，包括类级别（static）和实例级别变量，不包括在方法内部声明的变量

在Java中一般通过如下几项描述一个字段：字段作用域（public、protected、private修饰符）、是类级别变量还是实例级别变量（static修饰符）、可变性（final修饰符）、并发可见性（volatile修饰符）、可序列化与否（transient修饰符）、字段数据类型（基本类型、对象、数组）以及字段名称。在字段表中，变量修饰符使用标志位表示，字段数据类型和字段名称则引用常量池中常量表示，字段表格式如下表所示：

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p align="left">类型</p>

</td>
<td valign="top">
<p>名称</p>

</td>
<td valign="top">
<p>数量</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>access_flags</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>name_index</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>descriptor_index</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>attributes_count</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>attribute_info</p>

</td>
<td valign="top">
<p>attributes</p>

</td>
<td valign="top">
<p>attributes_count</p>
<div>&nbsp;</div>
</td>
</tr>
</tbody>
</table>


字段修饰符放在access_flags中，占2字节，其值为0x0002，可见这个字段由private修饰，与访问标志位十分相似

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p>标志名称</p>

</td>
<td valign="top">
<p>标志值</p>

</td>
<td valign="top">
<p>含义</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_PUBLIC</p>

</td>
<td valign="top">
<p>0x0001</p>

</td>
<td valign="top">
<p>字段是否为public</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_PRIVATE</p>

</td>
<td valign="top">
<p>0x0002</p>

</td>
<td valign="top">
<p>字段是否为private</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_PROTECTED</p>

</td>
<td valign="top">
<p>0x0004</p>

</td>
<td valign="top">
<p>字段是否为protected</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_STATIC</p>

</td>
<td valign="top">
<p>0x0008</p>

</td>
<td valign="top">
<p>字段是否为static</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_FINAL</p>

</td>
<td valign="top">
<p>0x0010</p>

</td>
<td valign="top">
<p>字段是否为final</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_VOLATILE</p>

</td>
<td valign="top">
<p>0x0040</p>

</td>
<td valign="top">
<p>字段是否为volatile</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_TRANSIENT</p>

</td>
<td valign="top">
<p>0x0080</p>

</td>
<td valign="top">
<p>字段是否为transient</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_SYNTHETIC</p>

</td>
<td valign="top">
<p>0x1000</p>

</td>
<td valign="top">
<p>字段是否为编译器自动产生</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_ENUM</p>

</td>
<td valign="top">
<p>0x4000</p>

</td>
<td valign="top">
<p>字段是否为enum</p>

</td>

</tr>

</tbody>

</table>

## 7.方法表集合

methods_count：方法表计数器，即方法表集合中的方法表数据个数。占2字节，其值为0x0002，即测试类中有2个方法(还自动增加了一个构造函数）

methods：方法表集合，一组方法表类型数据的集合。

方法表结构和字段表结构一样：

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p align="left">类型</p>

</td>
<td valign="top">
<p>名称</p>

</td>
<td valign="top">
<p>数量</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>access_flags</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>name_index</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>descriptor_index</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>attributes_count</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>attribute_info</p>

</td>
<td valign="top">
<p>attributes</p>

</td>
<td valign="top">
<p>attributes_count</p>

</td>

</tr>

</tbody>

</table>

数据项的含义非常相似，仅在访问标志位和属性表集合中的可选项上有略微不同

由于ACC_VOLATILE标志和ACC_TRANSIENT标志不能修饰方法，所以access_flags中不包含这两项，同时增加ACC_SYNCHRONIZED标志、ACC_NATIVE标志、ACC_STRICTFP标志和ACC_ABSTRACT标志

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p>标志名称</p>

</td>
<td valign="top">
<p>标志值</p>

</td>
<td valign="top">
<p>含义</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_PUBLIC</p>

</td>
<td valign="top">
<p>0x0001</p>

</td>
<td valign="top">
<p>字段是否为public</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_PRIVATE</p>

</td>
<td valign="top">
<p>0x0002</p>

</td>
<td valign="top">
<p>字段是否为private</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_PROTECTED</p>

</td>
<td valign="top">
<p>0x0004</p>

</td>
<td valign="top">
<p>字段是否为protected</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_STATIC</p>

</td>
<td valign="top">
<p>0x0008</p>

</td>
<td valign="top">
<p>字段是否为static</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_FINAL</p>

</td>
<td valign="top">
<p>0x0010</p>

</td>
<td valign="top">
<p>字段是否为final</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_SYNCHRONIZED</p>

</td>
<td valign="top">
<p>0x0020</p>

</td>
<td valign="top">
<p>字段是否为synchronized</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_BRIDGE</p>

</td>
<td valign="top">
<p>0x0040</p>

</td>
<td valign="top">
<p>方法是否是由编译器产生的桥接方法</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_VARARGS</p>

</td>
<td valign="top">
<p>0x0080</p>

</td>
<td valign="top">
<p>方法是否接受不定参数</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_NATIVE</p>

</td>
<td valign="top">
<p>0x0100</p>

</td>
<td valign="top">
<p>字段是否为native</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_ABSTRACT</p>

</td>
<td valign="top">
<p>0x0400</p>

</td>
<td valign="top">
<p>字段是否为abstract</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_STRICTFP</p>

</td>
<td valign="top">
<p>0x0800</p>

</td>
<td valign="top">
<p>字段是否为strictfp</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_SYNTHETIC</p>

</td>
<td valign="top">
<p>0x1000</p>

</td>
<td valign="top">
<p>字段是否为编译器自动产生</p>

</td>

</tr>

</tbody>

</table>

### 第一个方法（由编译器自动添加的默认构造方法）：

access_flags为0x0001，即public；name_index为0x0007，即常量池中第7个常量；descriptor_index为0x0008，即常量池中第8个常量

```
const #7 = Asciz        <init>;  
const #8 = Asciz        ()V;  
```

接下来2个字节为属性计数器，其值为0x0001，说明这个方法的属性表集合中有一个属性，属性名称为接下来2位0x0009，指向常量池中第9个常量：Code。接下来4位为0x0000002F，表示Code属性值的字节长度为47。接下来2位为0x0001，表示该方法的操作数栈的深度最大值为1。接下来2位依然为0x0001，表示该方法的局部变量占用空间为1。接下来4位为0x0000005，则紧接着的5个字节0x2AB7000AB1为该方法编译后生成的字节码指令（各字节对应的指令不介绍了，可查询虚拟机字节码指令表）。接下来2个字节为0x0000，说明Code属性异常表集合为空。

接下来2个字节为0x0002，说明Code属性带有2个属性，那么接下来2位0x000C即为Code属性第一个属性的属性名称，指向常量池中第12个常量：LineNumberTable。接下来4位为0x00000006，表示LineNumberTable属性值所占字节长度为6。接下来2位为0x0001，即该line_number_table中只有一个line_number_info表，start_pc为0x0000，line_number为0x0003，LineNumberTable属性结束。

接下来2位0x000D为Code属性第二个属性的属性名，指向常量池中第13个常量：LocalVariableTable。该属性值所占的字节长度为0x0000000C=12。接下来2位为0x0001，说明local_variable_table中只有一个local_variable_info表，按照local_variable_info表结构，start_pc为0x0000，length为0x0005，name_index为0x000E，指向常量池中第14个常量：this，descriptor_index为0x000F，指向常量池中第15个常量：Lcom/test/Test;，index为0x0000。第一个方法结束

### 第二个方法：

access_flags为0x0001，即public；name_index为0x0010，即常量池中第16个常量；descriptor_index为0x0011，即常量池中第17个常量

```
const #16 = Asciz       getM;  
const #17 = Asciz       ()I;  
```

接下来2个字节为属性计数器，其值为0x0001，说明这个方法有一个方法属性，属性名称为接下来2位0x0009，指向常量池中第9个常量：Code。接下来4位为0x00000031，表示Code属性值的字节长度为49。接下来2位为0x0002，表示该方法的操作数栈的深度最大值为2。接下来2位为0x0001，表示该方法的局部变量占用空间为1。接下来4位为0x0000007，则紧接着的7个字节0x2AB400120460AC为该方法编译后生成的字节码指令。接下来2个字节为0x0000，说明Code属性异常表集合为空。


接下来2个字节为0x0002，说明Code属性带有2个属性，那么接下来2位0x000C即为Code属性第一个属性的属性名称，指向常量池中第12个常量：LineNumberTable。接下来4位为0x00000006，表示LineNumberTable属性值所占字节长度为6。接下来2位为0x0001，即该line_number_table中只有一个line_number_info表，start_pc为0x0000，line_number为0x0007，LineNumberTable属性结束。


和第一个方法的LocalVariableTable属性基本相同，唯一的区别是局部变量this的作用范围覆盖的长度为7而不是5，第二个方法结束

如果子类没有重写父类的方法，方法表集合中就不会出现父类方法的信息；有可能会出现由编译器自动添加的方法（如：<init>，实例类构造器）

在Java语言中，重载一个方法除了要求和原方法拥有相同的简单名称外，还要求必须拥有一个与原方法不同的特征签名（方法参数集合），由于特征签名不包含返回值，故Java语言中不能仅仅依靠返回值的不同对一个已有的方法重载；但是在Class文件格式中，特征签名即为方法描述符，只要是描述符不完全相同的2个方法也可以合法共存，即2个除了返回值不同之外完全相同的方法在Class文件中也可以合法共存

javap工具在后半部分会列出分析完成的方法（可以看到和我们的分析结果是一样的）：

```
d:\>javap -verbose Test  
......  
{  
public com.test.Test();  
  Code:  
   Stack=1, Locals=1, Args_size=1  
   0:   aload_0  
   1:   invokespecial   #10; //Method java/lang/Object."<init>":()V  
   4:   return  
  LineNumberTable:  
   line 3: 0  
  
  LocalVariableTable:  
   Start  Length  Slot  Name   Signature  
   0      5      0    this       Lcom/test/Test;  
  
public int getM();  
  Code:  
   Stack=2, Locals=1, Args_size=1  
   0:   aload_0  
   1:   getfield        #18; //Field m:I  
   4:   iconst_1  
   5:   iadd  
   6:   ireturn  
  LineNumberTable:  
   line 7: 0  
  
  LocalVariableTable:  
   Start  Length  Slot  Name   Signature  
   0      7      0    this       Lcom/test/Test;  
}  
```

## 8.属性表集合

在Class文件、属性表、方法表中都可以包含自己的属性表集合，用于描述某些场景的专有信息

与Class文件中其它数据项对长度、顺序、格式的严格要求不同，属性表集合不要求其中包含的属性表具有严格的顺序，并且只要属性的名称不与已有的属性名称重复，任何人实现的编译器可以向属性表中写入自己定义的属性信息。

虚拟机在运行时会忽略不能识别的属性，为了能正确解析Class文件，虚拟机规范中预定义了虚拟机实现必须能够识别的9项属性：

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p>属性名称</p>

</td>
<td valign="top">
<p>使用位置</p>

</td>
<td valign="top">
<p>含义</p>

</td>

</tr>
<tr>
<td valign="top">
<p>Code</p>

</td>
<td valign="top">
<p>方法表</p>

</td>
<td valign="top">
<p>Java代码编译成的字节码指令</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ConstantValue</p>

</td>
<td valign="top">
<p>字段表</p>

</td>
<td valign="top">
<p>final关键字定义的常量值</p>

</td>

</tr>
<tr>
<td valign="top">
<p>Deprecated</p>

</td>
<td valign="top">
<p>类文件、字段表、方法表</p>

</td>
<td valign="top">
<p>被声明为deprecated的方法和字段</p>

</td>

</tr>
<tr>
<td valign="top">
<p>Exceptions</p>

</td>
<td valign="top">
<p>方法表</p>

</td>
<td valign="top">
<p>方法抛出的异常</p>

</td>

</tr>
<tr>
<td valign="top">
<p>InnerClasses</p>

</td>
<td valign="top">
<p>类文件</p>

</td>
<td valign="top">
<p>内部类列表</p>

</td>

</tr>
<tr>
<td valign="top">
<p>LineNumberTale</p>

</td>
<td valign="top">
<p>Code属性</p>

</td>
<td valign="top">
<p>Java源码的行号与字节码指令的对应关系</p>

</td>

</tr>
<tr>
<td valign="top">
<p>LocalVariableTable</p>

</td>
<td valign="top">
<p>Code属性</p>

</td>
<td valign="top">
<p>方法的局部变量描述</p>

</td>

</tr>
<tr>
<td valign="top">
<p>SourceFile</p>

</td>
<td valign="top">
<p>类文件</p>

</td>
<td valign="top">
<p>源文件名称</p>

</td>

</tr>
<tr>
<td valign="top">
<p>Synthetic</p>

</td>
<td valign="top">
<p>类文件、方法表、字段表</p>

</td>
<td valign="top">
<p>标识方法或字段是由编译器自动生成的</p>

</td>

</tr>

</tbody>

</table>

每种属性均有各自的表结构。这9种表结构有一个共同的特点，即均由一个u2类型的属性名称开始，可以通过这个属性名称来判段属性的类型

Code属性：Java程序方法体中的代码经过Javac编译器处理后，最终变为字节码指令存储在Code属性中。当然不是所有的方法都必须有这个属性（接口中的方法或抽象方法就不存在Code属性），Code属性表结构如下：

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p>类型</p>

</td>
<td valign="top">
<p>名称</p>

</td>
<td valign="top">
<p>数量</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>attribute_name_index</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u4</p>

</td>
<td valign="top">
<p>attribute_length</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>max_stack</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>max_locals</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u4</p>

</td>
<td valign="top">
<p>code_length</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u1</p>

</td>
<td valign="top">
<p>code</p>

</td>
<td valign="top">
<p>code_length</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>exception_table_length</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>exception_info</p>

</td>
<td valign="top">
<p>exception_table</p>

</td>
<td valign="top">
<p>exception_table_length</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>attributes_count</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>attribute_info</p>

</td>
<td valign="top">
<p>attributes</p>

</td>
<td valign="top">
<p>attributes_count</p>
<div>&nbsp;</div>

</td>

</tr>

</tbody>

</table>

max_stack：操作数栈深度最大值，在方法执行的任何时刻，操作数栈深度都不会超过这个值。虚拟机运行时根据这个值来分配栈帧的操作数栈深度

max_locals：局部变量表所需存储空间，单位为Slot（参见备注四）。并不是所有局部变量占用的Slot之和，当一个局部变量的生命周期结束后，其所占用的Slot将分配给其它依然存活的局部变量使用，按此方式计算出方法运行时局部变量表所需的存储空间

code_length和code：用来存放Java源程序编译后生成的字节码指令。code_length代表字节码长度，code是用于存储字节码指令的一系列字节流。

每一个指令是一个u1类型的单字节，当虚拟机读到code中的一个字节码（一个字节能表示256种指令，Java虚拟机规范定义了其中约200个编码对应的指令），就可以判断出该字节码代表的指令，指令后面是否带有参数，参数该如何解释，虽然code_length占4个字节，但是Java虚拟机规范中限制一个方法不能超过65535条字节码指令，如果超过，Javac将拒绝编译

ConstantValue属性：通知虚拟机自动为静态变量赋值，只有被static关键字修饰的变量（类变量）才可以使用这项属性。其结构如下：

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p>类型</p>

</td>
<td valign="top">
<p>名称</p>

</td>
<td valign="top">
<p>数量</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>attribute_name_index</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u4</p>

</td>
<td valign="top">
<p>attribute_length</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>constantvalue_index</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>

</tbody>

</table>

可以看出ConstantValue属性是一个定长属性，其中attribute_length的值固定为0x00000002，constantvalue_index为一常量池字面量类型常量索引（Class文件格式的常量类型中只有与基本类型和字符串类型相对应的字面量常量，所以ConstantValue属性只支持基本类型和字符串类型）

对非static类型变量（实例变量，如：int a = 123;）的赋值是在实例构造器`<init>`方法中进行的

对类变量（如：static int a = 123;）的赋值有2种选择，在类构造器`<clinit>`方法中或使用ConstantValue属性。当前Javac编译器的选择是：如果变量同时被static和final修饰（虚拟机规范只要求有ConstantValue属性的字段必须设置ACC_STATIC标志，对final关键字的要求是Javac编译器自己加入的要求），并且该变量的数据类型为基本类型或字符串类型，就生成ConstantValue属性进行初始化；否则在类构造器`<clinit>`方法中进行初始化

### Exceptions 属性

列举出方法中可能抛出的受查异常（即方法描述时throws关键字后列出的异常），与Code属性平级，与Code属性包含的异常表不同，其结构为：

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p>类型</p>

</td>
<td valign="top">
<p>名称</p>

</td>
<td valign="top">
<p>数量</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>attribute_name_index</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u4</p>

</td>
<td valign="top">
<p>attribute_length</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>number_of_exceptions</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>exception_index_table</p>

</td>
<td valign="top">
<p>number_of_exceptions</p>

</td>

</tr>

</tbody>

</table>

number_of_exceptions表示可能抛出number_of_exceptions种受查异常

exception_index_table为异常索引集合，一组u2类型exception_index的集合，每一个exception_index为一个指向常量池中一CONSTANT_Class_info型常量的索引，代表该受查异常的类型

### InnerClasses属性

该属性用于记录内部类和宿主类之间的关系。如果一个类中定义了内部类，编译器将会为这个类与这个类包含的内部类生成InnerClasses属性，结构为：

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p>类型</p>

</td>
<td valign="top">
<p>名称</p>

</td>
<td valign="top">
<p>数量</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>attribute_name_index</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u4</p>

</td>
<td valign="top">
<p>attribute_length</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>number_of_classes</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>inner_classes_info</p>

</td>
<td valign="top">
<p>inner_classes</p>

</td>
<td valign="top">
<p>number_of_classes</p>

</td>

</tr>

</tbody>

</table>

inner_classes为内部类表集合，一组内部类表类型数据的集合，number_of_classes即为集合中内部类表类型数据的个数

每一个内部类的信息都由一个inner_classes_info表来描述，inner_classes_info表结构如下：

<table>
<tbody>
<tr>
<td valign="top">
<p>类型</p>

</td>
<td valign="top">
<p>名称</p>

</td>
<td valign="top">
<p>数量</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>inner_class_info_index</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>outer_class_info_index</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>inner_name_index</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>inner_name_access_flags</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>

</tbody>
</table>

inner_class_info_index和outer_class_info_index指向常量池中CONSTANT_Class_info类型常量索引，该CONSTANT_Class_info类型常量指向常量池中CONSTANT_Utf8_info类型常量，分别为内部类的全限定名和宿主类的全限定名

inner_name_index指向常量池中CONSTANT_Utf8_info类型常量的索引，为内部类名称，如果为匿名内部类，则该值为0

inner_name_access_flags类似于access_flags，是内部类的访问标志

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p>标志名称</p>

</td>
<td valign="top">
<p>标志值</p>

</td>
<td valign="top">
<p>含义</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_PUBLIC</p>

</td>
<td valign="top">
<p>0x0001</p>

</td>
<td valign="top">
<p>内部类是否为public</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_PRIVATE</p>

</td>
<td valign="top">
<p>0x0002</p>

</td>
<td valign="top">
<p>内部类是否为private</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_PROTECTED</p>

</td>
<td valign="top">
<p>0x0004</p>

</td>
<td valign="top">
<p>内部类是否为protected</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_STATIC</p>

</td>
<td valign="top">
<p>0x0008</p>

</td>
<td valign="top">
<p>内部类是否为static</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_FINAL</p>

</td>
<td valign="top">
<p>0x0010</p>

</td>
<td valign="top">
<p>内部类是否为final</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_INTERFACE</p>

</td>
<td valign="top">
<p>0x0020</p>

</td>
<td valign="top">
<p>内部类是否为一个接口</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_ABSTRACT</p>

</td>
<td valign="top">
<p>0x0400</p>

</td>
<td valign="top">
<p>内部类是否为abstract</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_SYNTHETIC</p>

</td>
<td valign="top">
<p>0x1000</p>

</td>
<td valign="top">
<p>内部类是否为编译器自动产生</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_ANNOTATION</p>

</td>
<td valign="top">
<p>0x4000</p>

</td>
<td valign="top">
<p>内部类是否是一个注解</p>

</td>

</tr>
<tr>
<td valign="top">
<p>ACC_ENUM</p>

</td>
<td valign="top">
<p>0x4000</p>

</td>
<td valign="top">
<p>内部类是否是一个枚举</p>

</td>

</tr>

</tbody>

</table>


LineNumberTale属性：用于描述Java源码的行号与字节码行号之间的对应关系，非运行时必需属性，会默认生成至Class文件中，可以使用Javac的-g:none或-g:lines关闭或要求生成该项属性信息，其结构如下：

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p>类型</p>

</td>
<td valign="top">
<p>名称</p>

</td>
<td valign="top">
<p>数量</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>attribute_name_index</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u4</p>

</td>
<td valign="top">
<p>attribute_length</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>line_number_table_length</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>line_number_info</p>

</td>
<td valign="top">
<p>line_number_table</p>

</td>
<td valign="top">
<p>line_number_table_length</p>

</td>

</tr>

</tbody>

</table>

line_number_table是一组line_number_info类型数据的集合，其所包含的line_number_info类型数据的数量为line_number_table_length，line_number_info结构如下：

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p>类型</p>

</td>
<td valign="top">
<p>名称</p>

</td>
<td valign="top">
<p>数量</p>

</td>
<td valign="top">
<p>说明</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>start_pc</p>

</td>
<td valign="top">
<p>1</p>

</td>
<td valign="top">
<p>字节码行号</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>line_number</p>

</td>
<td valign="top">
<p>1</p>

</td>
<td valign="top">
<p>Java源码行号</p>

</td>

</tr>

</tbody>

</table>

不生成该属性的最大影响是：1，抛出异常时，堆栈将不会显示出错的行号；2，调试程序时无法按照源码设置断点

LocalVariableTable属性：用于描述栈帧中局部变量表中的变量与Java源码中定义的变量之间的关系，非运行时必需属性，默认不会生成至Class文件中，可以使用Javac的-g:none或-g:vars关闭或要求生成该项属性信息，其结构如下：

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p>类型</p>

</td>
<td valign="top">
<p>名称</p>

</td>
<td valign="top">
<p>数量</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>attribute_name_index</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u4</p>

</td>
<td valign="top">
<p>attribute_length</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>local_variable_table_length</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>local_variable_info</p>

</td>
<td valign="top">
<p>local_variable_table</p>

</td>
<td valign="top">
<p>local_variable_table_length</p>

</td>

</tr>

</tbody>

</table>

local_variable_table是一组local_variable_info类型数据的集合，其所包含的local_variable_info类型数据的数量为local_variable_table_length，local_variable_info结构如下：

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p>类型</p>

</td>
<td valign="top">
<p>名称</p>

</td>
<td valign="top">
<p>数量</p>

</td>
<td valign="top">
<p>说明</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>start_pc</p>

</td>
<td valign="top">
<p>1</p>

</td>
<td valign="top">
<p>局部变量的生命周期开始的字节码偏移量</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>length</p>

</td>
<td valign="top">
<p>1</p>

</td>
<td valign="top">
<p>局部变量作用范围覆盖的长度</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>name_index</p>

</td>
<td valign="top">
<p>1</p>

</td>
<td valign="top">
<p>指向常量池中CONSTANT_Utf8_info类型常量的索引，局部变量名称</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>descriptor_index</p>

</td>
<td valign="top">
<p>1</p>

</td>
<td valign="top">
<p>指向常量池中CONSTANT_Utf8_info类型常量的索引，局部变量描述符</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>index</p>

</td>
<td valign="top">
<p>1</p>

</td>
<td valign="top">
<p>局部变量在栈帧局部变量表中Slot的位置，如果这个变量的数据类型为64位类型（long或double），</p>
<p>它占用的Slot为index和index+1这2个位置</p>

</td>

</tr>

</tbody>

</table>

start_pc + length即为该局部变量在字节码中的作用域范围

不生成该属性的最大影响是：1，当其他人引用这个方法时，所有的参数名称都将丢失，IDE可能会使用诸如arg0、arg1之类的占位符代替原有的参数名称，对代码运行无影响，会给代码的编写带来不便；2，调试时调试器无法根据参数名称从运行上下文中获取参数值

### SourceFile属性

用于记录生成这个Class文件的源码文件名称，为可选项，可以使用Javac的-g:none或-g:source关闭或要求生成该项属性信息，其结构如下：

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p>型</p>

</td>
<td valign="top">
<p>名称</p>

</td>
<td valign="top">
<p>数量</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>attribute_name_index</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u4</p>

</td>
<td valign="top">
<p>attribute_length</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>sourcefile_index</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>

</tbody>

</table>

可以看出SourceFile属性是一个定长属性，sourcefile_index是指向常量池中一CONSTANT_Utf8_info类型常量的索引，常量的值为源码文件的文件名

对大多数文件，类名和文件名是一致的，少数特殊类除外（如：内部类），此时如果不生成这项属性，当抛出异常时，堆栈中将不会显示出错误代码所属的文件名

Deprecated属性和Synthetic属性：这两个属性都属于标志类型的布尔属性，只存在有和没有的区别，没有属性值的概念

Deprecated属性表示某个类、字段或方法已经被程序作者定为不再推荐使用，可在代码中使用@Deprecated注解进行设置

Synthetic属性表示该字段或方法不是由Java源码直接产生的，而是由编译器自行添加的（当然也可设置访问标志中的ACC_SYNTHETIC标志，所有由非用户代码产生的类、方法和字段都应当至少设置Synthetic属性和ACC_SYNTHETIC标志位中的一项，唯一的例外是实例构造器`<init>`和类构造器`<clinit>`方法）

这两项属性的结构为(当然attribute_length的值必须为0x00000000)：

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p>类型</p>

</td>
<td valign="top">
<p>名称</p>

</td>
<td valign="top">
<p>数量</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u2</p>

</td>
<td valign="top">
<p>attribute_name_index</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>
<tr>
<td valign="top">
<p>u4</p>

</td>
<td valign="top">
<p>attribute_length</p>

</td>
<td valign="top">
<p>1</p>

</td>

</tr>

</tbody>

</table>

起始2位为0x0001，说明有一个类属性。接下来2位为属性的名称，0x0014，指向常量池中第20个常量：SourceFile。接下来4位为0x00000002，说明属性体长度为2字节。最后2个字节为0x0014，指向常量池中第21个常量：Test.java，即这个Class文件的源码文件名为Test.java

 

PS：

1，全限定名：将类全名中的“.”替换为“/”，为了保证多个连续的全限定名之间不产生混淆，在最后加上“;”表示全限定名结束。例如："com.test.Test"类的全限定名为"com/test/Test;"

2，简单名称：没有类型和参数修饰的方法或字段名称。例如："public void add(int a,int b){...}"该方法的简单名称为"add"，"int a = 123;"该字段的简单名称为"a"

3，描述符：描述字段的数据类型、方法的参数列表（包括数量、类型和顺序）和返回值。根据描述符规则，基本数据类型和代表无返回值的void类型都用一个大写字符表示，而对象类型则用字符L加对象全限定名表示

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top">
<p>标识字符</p>

</td>
<td valign="top">
<p>含义</p>

</td>

</tr>
<tr>
<td valign="top">
<p>B</p>

</td>
<td valign="top">
<p>基本类型byte</p>

</td>

</tr>
<tr>
<td valign="top">
<p>C</p>

</td>
<td valign="top">
<p>基本类型char</p>

</td>

</tr>
<tr>
<td valign="top">
<p>D</p>

</td>
<td valign="top">
<p>基本类型double</p>

</td>

</tr>
<tr>
<td valign="top">
<p>F</p>

</td>
<td valign="top">
<p>基本类型float</p>

</td>

</tr>
<tr>
<td valign="top">
<p>I</p>

</td>
<td valign="top">
<p>基本类型int</p>

</td>

</tr>
<tr>
<td valign="top">
<p>J</p>

</td>
<td valign="top">
<p>基本类型long</p>

</td>

</tr>
<tr>
<td valign="top">
<p>S</p>

</td>
<td valign="top">
<p>基本类型short</p>

</td>

</tr>
<tr>
<td valign="top">
<p>Z</p>

</td>
<td valign="top">
<p>基本类型boolean</p>

</td>

</tr>
<tr>
<td valign="top">
<p>V</p>

</td>
<td valign="top">
<p>特殊类型void</p>

</td>

</tr>
<tr>
<td valign="top">
<p>L</p>

</td>
<td valign="top">
<p>对象类型，如：Ljava/lang/Object;</p>

</td>

</tr>

</tbody>

</table>

对于数组类型，每一维将使用一个前置的“[”字符来描述，如："int[]"将被记录为"[I","String[][]"将被记录为"[[Ljava/lang/String;"

用描述符描述方法时，按照先参数列表，后返回值的顺序描述，参数列表按照参数的严格顺序放在一组"()"之内，如：方法"String getAll(int id,String name)"的描述符为"(I,Ljava/lang/String;)Ljava/lang/String;"

4，Slot，虚拟机为局部变量分配内存所使用的最小单位，长度不超过32位的数据类型占用1个Slot，64位的数据类型（long和double）占用2个Slot

# 参考资料

《深入理解 jvm》

[JVM系列文章(三):Class文件内容解析](https://www.cnblogs.com/yxwkf/p/5222589.html)

[Java中的.class文件详解](https://blog.csdn.net/xingkongdeasi/article/details/79688505)

[Class文件内容解析](http://www.cnblogs.com/timlong/p/8143839.html)

[解读Java Class文件格式](https://blog.csdn.net/tyrone1979/article/details/964560)

[Class文件详解](https://blog.csdn.net/IT_GJW/article/details/80447947)

[理解JAVA Class文件，破解class文件的第一步](https://blog.csdn.net/tyyj90/article/details/78472986)

[Java二进制字节码的结构、加载](http://www.codeorg.cn/article/detail//java/356)

- 文件解析

[Java字节码结构剖析一：常量池](http://www.importnew.com/30461.html)

[Java字节码结构剖析二：字段表](http://www.importnew.com/30505.html)

[Java字节码结构剖析三：方法表](http://www.importnew.com/30521.html)

* any list
{:toc}