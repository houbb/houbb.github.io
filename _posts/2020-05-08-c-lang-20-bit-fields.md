---
layout: post
title: C语言学习笔记-20-位域
date:  2020-5-8 19:23:59 +0800
categories: [C]
tags: [c, lang, sf]
published: true
---

# C 位域

如果程序的结构中包含多个开关量，只有 TRUE/FALSE 变量，如下：

```c
struct
{
  unsigned int widthValidated;
  unsigned int heightValidated;
} status;
```

这种结构需要 8 字节的内存空间，但在实际上，在每个变量中，我们只存储 0 或 1。

在这种情况下，C 语言提供了一种更好的利用内存空间的方式。如果您在结构内使用这样的变量，您可以定义变量的宽度来告诉编译器，您将只使用这些字节。

例如，上面的结构可以重写成：

```c
struct
{
  unsigned int widthValidated : 1;
  unsigned int heightValidated : 1;
} status;
```

现在，上面的结构中，status 变量将占用 4 个字节的内存空间，但是只有 2 位被用来存储值。

如果您用了 32 个变量，每一个变量宽度为 1 位，那么 status 结构将使用 4 个字节，但只要您再多用一个变量，如果使用了 33 个变量，那么它将分配内存的下一段来存储第 33 个变量，这个时候就开始使用 8 个字节。

让我们看看下面的实例来理解这个概念：

## 实例

```c
#include <stdio.h>
#include <string.h>
 
/* 定义简单的结构 */
struct
{
  unsigned int widthValidated;
  unsigned int heightValidated;
} status1;
 
/* 定义位域结构 */
struct
{
  unsigned int widthValidated : 1;
  unsigned int heightValidated : 1;
} status2;
 
int main( )
{
   printf( "Memory size occupied by status1 : %d\n", sizeof(status1));
   printf( "Memory size occupied by status2 : %d\n", sizeof(status2));
 
   return 0;
}
```

-  输出

```
Memory size occupied by status1 : 8
Memory size occupied by status2 : 4
```

# 位域声明

在结构内声明位域的形式如下：

```c
struct
{
  type [member_name] : width ;
};
```

下面是有关位域中变量元素的描述：

| 元素	      | 描述 |
|:---|:---|
| type	      | 只能为 int(整型)，unsigned int(无符号整型)，signed int(有符号整型) 三种类型，决定了如何解释位域的值。 |
| member_name	| 位域的名称。 |
| width 	   | 位域中位的数量。宽度必须小于或等于指定类型的位宽度。 |

带有预定义宽度的变量被称为位域。

位域可以存储多于 1 位的数。


## 存储 3 位数

例如，需要一个变量来存储从 0 到 7 的值，您可以定义一个宽度为 3 位的位域，如下：

```c
struct
{
  unsigned int age : 3;
} Age;
```

上面的结构定义指示 C 编译器，age 变量将只使用 3 位来存储这个值，如果您试图使用超过 3 位，则无法完成。

让我们来看下面的实例：

```c
#include <stdio.h>
#include <string.h>
 
struct
{
  unsigned int age : 3;
} Age;
 
int main( )
{
   Age.age = 4;
   printf( "Sizeof( Age ) : %d\n", sizeof(Age) );
   printf( "Age.age : %d\n", Age.age );
 
   Age.age = 7;
   printf( "Age.age : %d\n", Age.age );
 
   Age.age = 8; // 二进制表示为 1000 有四位，超出
   printf( "Age.age : %d\n", Age.age );
 
   return 0;
}
```

- 输出

```
Sizeof( Age ) : 4
Age.age : 4
Age.age : 7
Age.age : 0
```

# 参考资料

[C 位域](https://www.runoob.com/cprogramming/c-bit-fields.html)

* any list
{:toc}