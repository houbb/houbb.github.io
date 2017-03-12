---
layout: post
title: CShape-01-base 
date:  2017-03-06 17:08:05 +0800
categories: [Programming Language]
tags: [cshape, base]
published: true
---

* any list
{:toc}


# CShape

[C#](http://www.runoob.com/csharp) 是一个现代的、通用的、面向对象的编程语言，它是由[Microsoft](https://www.microsoft.com/zh-cn)开发的，由 Ecma 和 ISO 核准认可的。

C# 是由 Anders Hejlsberg 和他的团队在 .Net 框架开发期间开发的。

C# 是专为公共语言基础结构（CLI）设计的。CLI 由可执行代码和运行时环境组成，允许在不同的计算机平台和体系结构上使用各种高级语言。


> 环境

本博客使用 [mono](http://www.mono-project.com/download/) 环境。仅仅用作基础知识的学习笔记。（本篇博客无技术含量，请放心跳过）。


# Hello World

- HelloWorld.cs

```c#
using System;

namespace cshape_test 
{
	class MainClass
	{
		static void Main(string[] args)
		{
			Console.WriteLine("Hello World!");
		}
	}
}
```


1、```using System;``` using 关键字用于在程序中包含 System 命名空间。

2、```namespace``` 一个 namespace 是一系列的类。类似于 java 中的 package

3、**class MainClass** 为类声明。

3、**static void Main(string[] args)** 定义 Main(), 为程序的入口。

注意：

1）C# 中的方法名称是大写的。

2）文件名可以不同于类的名称。


# 基本语法

- Rectangle.cs

```c#
using System;

namespace RectangleApp
{
	public class Rectangle
	{
		/*
			成员变量演示		  
		*/
		//define the height and width 
		double width;
		double height;


		/*
			成员方法演示		  
		*/
		//init the width and height
		public void Init()
		{
			width = 10.2;
			height = 2.3;
		}

		public double CalcArea()
		{
			return width * height;
		}

		public void Display()
		{
			Console.WriteLine("Area is " + CalcArea());
		}

		/*
			重载方法演示		  
		*/
		public override string ToString()
		{
			return string.Format("[Rectangle: width={0}, height={1}]", width, height);
		}

		/*
			简单测试演示	
			
		Area is 23.46
		Rectangle is[Rectangle: width=10.2, height=2.3]
		*/
		static void Main(string[] args)
		{

			Rectangle rectangle = new Rectangle();
			rectangle.Init();
			rectangle.Display();
			Console.WriteLine("Rectangle is" + rectangle);
		}
	}

}
```

> 标识符

标识符是用来识别类、变量、函数或任何其它用户定义的项目。

在 C# 中，类的命名必须遵循如下基本规则：

- 标识符必须以字母或下划线```_```开头，后面可以跟一系列的字母、数字或下划线。标识符中的第一个字符不能是数字。

- 标识符必须不包含任何嵌入的空格或符号，比如 ```? - +! @ # % ^ & * ( ) [ ] { } . ; : " ' / \```。 但是，可以使用下划线。

- 标识符不能是 C# 关键字。


> 关键字

关键字是 C# 编译器预定义的保留字。这些关键字不能用作标识符，但是，如果您想使用这些关键字作为标识符，可以在关键字前面加上 ```@``` 字符作为前缀


- 保留关键字

| abstract	| as	    |base		| bool		| break	| byte		| case |
| catch	    | char	    |checked	| class		| const	| continue	| decimal |
| default	| delegate	|do			| double	| else	| enum		| event |
| explicit	| extern	|false		| finally	| fixed	| float		| for |
| foreach	| goto	    |if			| implicit	| in	| in (generic modifier) | int |
| interface	| internal	|is			| lock		| long	| namespace	| new |
| null	    | object	|operator	| out		| out(generic modifier) |  override	| params    |
| private	| protected	|public		| readonly	| ref	| return	| sbyte |
| sealed	| short	    |sizeof		| stackalloc| static	| string |	struct |
| switch	| this	    |throw		| true		| try	| typeof	| uint | 
| ulong	    | unchecked	|unsafe		| ushort	| using	| virtual	| void | 
| volatile	| while | 

- 上下文关键字

| add	    | alias	| ascending	| descending	| dynamic	| from | get |
| global	| group	| into	| join	| let	| orderby	| partial(type) | 
| partial(method) |


# 数据类型

在 C# 中，变量分为以下几种类型：

- 值类型（Value types）

- 引用类型（Reference types）

- 指针类型（Pointer types）

> 值类型（Value types）

值类型变量可以直接分配给一个值。它们是从类 **System.ValueType** 中派生的。
值类型直接包含数据。比如 int、char、float，它们分别存储数字、字母、浮点数。当您声明一个 int 类型时，系统分配内存来存储值。

可以简单的将其类比为java中的包装类对象。(但是更偏向于8大基本类型)

下表列出了 C# 2010 中可用的值类型：

| 类型	     |   描述	                | 范围	            	| 默认值 |
|:----|:----|:----|:----|
| bool	| 布尔值	                | True 或 False			| False |
| byte	| 8 位无符号整数	        | 0 到 255				| 0 |
| char	| 16 位 Unicode 字符	    | U +0000 到 U +ffff		| '\0' |
| decimal	| 128 位精确的十进制值    | (-7.9 x 1028 到 7.9 x 1028) / 100 到 28 |	0.0M |
| double	| 64 位双精度浮点型	    | (+/-)5.0 x 10-324 到 (+/-)1.7 x 10308	| 0.0D |
| float	| 32 位单精度浮点型	    | -3.4 x 1038 到 + 3.4 x 1038	| 0.0F |
| int	    | 32 位有符号整数类型	    | -2,147,483,648 到 2,147,483,647	| 0 |
| long	| 64 位有符号整数类型	    | -923,372,036,854,775,808 到 9,223,372,036,854,775,807	| 0L |
| sbyte	| 8 位有符号整数类型	    | -128 到 127	| 0 |
| short	| 16 位有符号整数类型	    | -32,768 到 32,767	| 0 |
| uint	| 32 位无符号整数类型	    | 0 到 4,294,967,295	 | 0 |
| ulong	| 64 位无符号整数类型	    | 0 到 18,446,744,073,709,551,615 |	0 |
| ushort	| 16 位无符号整数类型	    | 0 到 65,535	| 0 |


- ValueType.cs

```c#
using System;
namespace cshape_test
{
	public class ValueType
	{
		public ValueType()
		{
			
		}

        //boolVal False
        //intVal 2147483647
        //sizeof(int): 4
		static void Main(string[] args) 
		{ 
			bool boolVal = false;
			Console.WriteLine("boolVal " + boolVal);
			int intVal = int.MaxValue;
			Console.WriteLine("intVal " + intVal);
			Console.WriteLine("sizeof(int): " + sizeof(int));
		}
	}
}
```

> 引用类型（Reference types）

引用类型不包含存储在变量中的实际数据，但它们包含对变量的引用。

换句话说，它们指的是一个**内存位置**。使用多个变量时，引用类型可以指向一个内存位置。如果内存位置的数据是由一个变量改变的，其他变量会自动反映这种值的变化。

内置的 引用类型有：object、dynamic 和 string。

一、对象（Object）类型

对象（Object）类型 是 C# 通用类型系统（Common Type System - CTS）中所有数据类型的终极基类。

Object 是 System.Object 类的别名。所以对象（Object）类型可以被分配任何其他类型（值类型、引用类型、预定义类型或用户自定义类型）的值。但是，在分配值之前，需要先进行类型转换。

当一个值类型转换为对象类型时，则被称为*装箱*；另一方面，当一个对象类型转换为值类型时，则被称为*拆箱*。

> [box and unbox](http://www.cnblogs.com/yukaizhao/archive/2011/10/18/csharp_box_unbox_1.html)

- ReferenceType.cs

```c#
using System;
namespace cshape_test
{
	public class ReferenceType
	{
		public ReferenceType()
		{
		}

		//对象（Object）类型
		static void ObjectType()
		{
			object obj = 100;   //this is box
			int intVal = (int)obj;  //this is un-box

			Console.WriteLine("object val is: {0}", obj);
			Console.WriteLine("int val is: {0}", intVal);
		}

		static void Main(string[] args)
		{
//			object val is: 100
//			int val is: 100
			ReferenceType.ObjectType();
		}
	}
}
```

二、动态（Dynamic）类型

您可以存储任何类型的值在动态数据类型变量中。这些变量的类型检查是在运行时发生的。

动态类型与对象类型相似，但是对象类型变量的类型检查是在*编译*时发生的，而动态类型变量的类型检查是在*运行*时发生的。


声明动态类型的语法：

```c#
dynamic <variable_name> = value;
```

- DynamicType()


```c#
static void DynamicType()
{
    dynamic d = 20;
    Console.WriteLine("The dynamic value: {0}", d);
}
```

因为是mac系统，运行可能会报错如下: (暂时跳过)

```
/Users/houbinbin/Projects/cshape_test/cshape_test/ReferenceType.cs(12,12): 
Error CS1969: 
Dynamic operation cannot be compiled without `Microsoft.CSharp.dll' assembly reference (CS1969) (cshape_test)
```

> [Microsoft.CSharp.dll error](http://stackoverflow.com/questions/11417047/c-sharp-dynamic-compilation-and-microsoft-csharp-dll-error)


三、字符串（string）类型

字符串（string）类型 允许您给变量分配任何字符串值。字符串（String）类型是 System.String 类的别名。它是从对象（Object）类型派生的。

字符串（String）类型的值可以通过两种形式进行分配：引号和 @引号。

1、C# string 字符串的前面可以加 @（称作"逐字字符串"）将转义字符（\）当作普通字符对待。

- StringType()

```c#
//common str is: hello \string
//at str is: hello \\string
static void StringType()
{
    string str = "hello \\string";
    Console.WriteLine("common str is: {0}", str);

    string atStr = @"hello \\string";
    Console.WriteLine("at str is: {0}", atStr);
}
```

- StringAnyLine()


2、@ 字符串中可以任意换行，换行符及缩进空格都计算在字符串长度之内。


```c#
//any line str is: <script type = "text/javascript" >
//	< !--
//	-->
//	</ script >
static void StringAnyLine()
{ 
    string str = @"<script type=""text/javascript"">
    <!--
    -->
    </script>";
    Console.WriteLine("any line str is: {0}", str);
}
```


三、指针类型（Pointer types）

指针类型变量存储另一种类型的内存地址。C# 中的指针与 C 或 C++ 中的指针有相同的功能。

> [c swap](http://blog.csdn.net/xueyushenzhou/article/details/38756533)

声明指针类型的语法：

```
type* identifier;
```

这个C#不推荐使用，暂时不深入学习。


# 类型转换

类型转换从根本上说是类型铸造，或者说是把数据从一种类型转换为另一种类型。在 C# 中，类型铸造有两种形式：

- 隐式类型转换 

这些转换是 C# 默认的以安全方式进行的转换。例如，从小的整数类型转换为大的整数类型，从派生类转换为基类。

- 显式类型转换 

这些转换是通过用户使用预定义的函数显式完成的。显式转换需要强制转换运算符。

下面的实例显示了一个显式的类型转换：


- TypeConversion.cs

```c#
public class TypeConversion
{
    static void ImplictConversion()
    {
        int intVal = 100;
        long longVal = intVal;  //隐式转换
        Console.WriteLine("longVal is: {0}", longVal);
    }

    static void EmplictConversion()
    {
        double doubleVal = 3.14;
        int intVal = (int)doubleVal;	//显式转换
        Console.WriteLine("intVal is: {0}", intVal);
    }

    static void Main(string[] args)
    {
        //longVal is: 100
        //intVal is: 3
        ImplictConversion();
        EmplictConversion();
    }
}
```

> 内置方法

没什么难的。知道就行，想转换了直接使用即可。

| 序号 | 方法 | 描述 |
|:----|:----|:----|
| 1	| ToBoolean       | 如果可能的话，把类型转换为布尔型 |
| 2	| ToByte          | 把类型转换为字节类型 |
| 3	| ToChar          | 如果可能的话，把类型转换为单个 Unicode 字符类型 |
| 4	| ToDateTime      | 把类型（整数或字符串类型）转换为 日期-时间 结构 |
| 5	| ToDecimal       | 把浮点型或整数类型转换为十进制类型 |
| 6	| ToDouble        | 把类型转换为双精度浮点型 |
| 7	| ToInt16         | 把类型转换为 16 位整数类型 |
| 8	| ToInt32         | 把类型转换为 32 位整数类型 |
| 9	| ToInt64         | 把类型转换为 64 位整数类型 |
| 10	| ToSbyte         | 把类型转换为有符号字节类型 |
| 11	| ToSingle        | 把类型转换为小浮点数类型 |
| 12	| ToString        | 把类型转换为字符串类型 |
| 13	| ToType          | 把类型转换为指定类型 |
| 14	| ToUInt16        | 把类型转换为 16 位无符号整数类型 |
| 15	| ToUInt32        | 把类型转换为 32 位无符号整数类型 |
| 16	| ToUInt64        | 把类型转换为 64 位无符号整数类型 |




# 变量

一个变量只不过是一个供程序操作的存储区的名字。

在 C# 中，每个变量都有一个特定的类型，类型决定了变量的内存大小和布局。范围内的值可以存储在内存中，可以对变量进行一系列操作。

C# 允许定义其他值类型的变量，比如 **enum**，也允许定义引用类型变量，比如 **class**

我们已经讨论了各种数据类型。C# 中提供的基本的值类型大致可以分为以下几类：

| 类型 |	举例 |
|:----|:----|
| 整数类型	| sbyte、byte、short、ushort、int、uint、long、ulong 和 char |
| 浮点型	    | float 和 double |
| 十进制类型	| decimal |
| 布尔类型	| true 或 false 值，指定的值 |
| 空类型	    | 可为空值的数据类型 |



一、变量定义

```
<data_type> <variable_list>;
```

二、变量初始化

变量通过在等号后跟一个常量表达式进行初始化（赋值）。初始化的一般形式为：

```
variable_name = value;
```

变量可以在声明时被初始化（指定一个初始值）。初始化由一个等号后跟一个常量表达式组成，如下所示：

```
<data_type> <variable_name> = value;
```

三、接受来自用户的值

```c#
public class VarDemo
{
    static void Main(string[] args)
    {
        string inputContent = Console.ReadLine();
        Console.WriteLine("What you input is:{0}", inputContent);
    }
}
```

四、Lvalues 和 Rvalues

C# 中的两种表达式：

- lvalue：lvalue 表达式可以出现在赋值语句的左边或右边。

- rvalue：rvalue 表达式可以出现在赋值语句的右边，不能出现在赋值语句的左边。

变量是 lvalue 的，所以可以出现在赋值语句的左边。数值是 rvalue 的，因此不能被赋值，不能出现在赋值语句的左边。(这点很多语言都是一样的)。



# 常量

常量是固定值，程序执行期间**不会改变**。常量可以是任何基本数据类型，比如整数常量、浮点常量、字符常量或者字符串常量，还有枚举常量。


一、整数常量

整数常量可以是十进制、八进制或十六进制的常量。前缀指定基数：0x 或 0X 表示十六进制，0 表示八进制，没有前缀则表示十进制。

整数常量也可以有后缀，可以是 U 和 L 的组合，其中，U 和 L 分别表示 unsigned 和 long。后缀可以是大写或者小写，多个后缀以任意顺序进行组合。


二、浮点常量

一个浮点常量是由整数部分、小数点、小数部分和指数部分组成。您可以使用小数形式或者指数形式来表示浮点常量。

使用小数形式表示时，必须包含小数点、指数或同时包含两者。使用指数形式表示时，必须包含整数部分、小数部分或同时包含两者。有符号的指数是用 e 或 E 表示的。


三、字符常量

字符常量是括在单引号里，例如，'x'，且可存储在一个简单的字符类型变量中。一个字符常量可以是一个普通字符（例如 'x'）、一个转义序列（例如 '\t'）或者一个通用字符（例如 '\u02C0'）。


转义字符(和Java类似)


| 转义序列	| 含义 |
|:---|:---|
| \\		| \ 字符 |
| \'		| ' 字符 |
| \"		| " 字符 |
| \?		| ? 字符 |
| \a		| Alert 或 bell |
| \b		| 退格键（Backspace）| 
| \f		| 换页符（Form feed）| 
| \n		| 换行符（Newline）| 
| \r		| 回车 |
| \t		| 水平制表符 tab |
| \v		| 垂直制表符 tab |
| \ooo	| 一到三位的八进制数 |
| \xhh    | 一个或多个数字的十六进制数| 


四、字符串常量

字符常量是括在双引号 ```""``` 里，或者是括在 ```@""``` 里。字符串常量包含的字符与字符常量相似，可以是：普通字符、转义序列和通用字符

使用字符串常量时，可以把一个很长的行拆成多个行，可以使用空格分隔各个部分。

这里是一些字符串常量的实例。下面所列的各种形式表示相同的字符串。


```c#
//commonStr: hello world?
//atStr: hello \t world?
static void StringConstant()
{
    string commonStr = "hello \t world?";
    Console.WriteLine("commonStr: {0}", commonStr);

    string atStr = @"hello \t world?";
    Console.WriteLine("atStr: {0}", atStr);
}
```


五、定义常量

常量是使用 ```const``` 关键字来定义的 。（类似C/C++）

```
const <data_type> <constant_name> = value;
```


- ConstDemo()

```c#
//area is 12.5663704
static void ConstDemo()
{
    const double PI = 3.1415926;
    int radis = 2;
    double area = PI * radis * radis;
    Console.WriteLine("area is {0}", area);
}
```

# 运算符

运算符是一种告诉编译器执行特定的数学或逻辑操作的符号。C# 有丰富的内置运算符，分类如下：

(这一点，众多语言都是类似的。虽然有些琐碎，但还需耐心记录一遍)

- 算术运算符

- 关系运算符

- 逻辑运算符

- 位运算符

- 赋值运算符

- 其他运算符


一、算术运算符

和Java、C、C++是一样的。

```c#
//a+b=30
//a-b=-10
//a* b = 200
//a/b=0
//a%b=10
static void MathCalcDemo()
{
    const int a = 10;
    const int b = 20;

    Console.WriteLine("a+b={0}", a + b);
    Console.WriteLine("a-b={0}", a - b);
    Console.WriteLine("a*b={0}", a * b);
    Console.WriteLine("a/b={0}", a / b);
    Console.WriteLine("a%b={0}", a % b);
}


//c++=5
//c=6
//++c=7
//c=7
//d--=15
//d=16
//--d=15
//d=15
static void MathCalcAddSubDemo()
{
    int c = 5;
    int d = 15;

    Console.WriteLine("c++={0}", c++);
    Console.WriteLine("c={0}", c);
    Console.WriteLine("++c={0}", ++c);
    Console.WriteLine("c={0}", c);

    Console.WriteLine("d--={0}", d++);
    Console.WriteLine("d={0}", d);
    Console.WriteLine("--d={0}", --d);
    Console.WriteLine("d={0}", d);
}
```


二、关系运算符

假设变量 A 的值为 10，变量 B 的值为 20，则：

|运算符	| 描述													|	实例 |
|:---|:---|:---|
|==		| 检查两个操作数的值是否相等，如果相等则条件为真。				|(A == B) 不为真。|
|!=		| 检查两个操作数的值是否相等，如果不相等则条件为真。			|(A != B) 为真。|
|>		| 检查左操作数的值是否大于右操作数的值，如果是则条件为真。		|(A > B) 不为真。|
|<		| 检查左操作数的值是否小于右操作数的值，如果是则条件为真。		|(A < B) 为真。|
|>=		| 检查左操作数的值是否大于或等于右操作数的值，如果是则条件为真。	|(A >= B) 不为真。|
|<=		| 检查左操作数的值是否小于或等于右操作数的值，如果是则条件为真。	|(A <= B) 为真。|


三、逻辑运算符

备注： ```||``` 和 MD 的 列表语法有冲突，所以高亮处理。 

假设变量 A 为布尔值 true，变量 B 为布尔值 false，则：

| 运算符	| 描述	                                                                    | 实例 |
|:---|:----|:---|
| &&	| 称为逻辑与运算符。如果两个操作数都非零，则条件为真。                            	| (A && B) 为假。 |
| ```||```    | 称为逻辑或运算符。如果两个操作数中有任意一个非零，则条件为真。	            | (A ```||``` B) 为真。 |
| !	    | 称为逻辑非运算符。用来逆转操作数的逻辑状态。如果条件为真则逻辑非运算符将使其为假。	| !(A && B) 为真。 |


四、位运算符

假设变量 A 的值为 60(0011 1100b)，变量 B 的值为 13(0000 1101b)

| 运算符	| 描述																			| 实例 |
|:------|:---|:---|
| &		| 如果同时存在于两个操作数中，二进制 AND 运算符复制一位到结果中。						| (A & B) 将得到 12，即为 0000 1100 |
| ```|```		| 如果存在于任一操作数中，二进制 OR 运算符复制一位到结果中。					| (A ```|``` B) 将得到 61，即为 0011 1101 |
| ^		| 如果存在于其中一个操作数中但不同时存在于两个操作数中，二进制异或运算符复制一位到结果中。	| (A ^ B) 将得到 49，即为 0011 0001 |
| ~		| 二进制补码运算符是一元运算符，具有"翻转"位效果，即0变成1，1变成0。						| (~A ) 将得到 -61，即为 1100 0011，一个有符号二进制数的补码形式。|
| <<	| 二进制左移运算符。左操作数的值向左移动右操作数指定的位数。								| A << 2 将得到 240，即为 1111 0000 |
| >>	| 二进制右移运算符。左操作数的值向右移动右操作数指定的位数。								| A >> 2 将得到 15，即为 0000 1111 | 



五、赋值运算符

| 运算符		| 描述														| 实例 |
|:----|:----|:-----|
| =			| 简单的赋值运算符，把右边操作数的值赋给左边操作数					| C = A + B 将把 A + B 的值赋给 C |
| +=		| 加且赋值运算符，把右边操作数加上左边操作数的结果赋值给左边操作数	| C += A 相当于 C = C + A |
| -=		| 减且赋值运算符，把左边操作数减去右边操作数的结果赋值给左边操作数	| C -= A 相当于 C = C - A |
| *=		| 乘且赋值运算符，把右边操作数乘以左边操作数的结果赋值给左边操作数	| C *= A 相当于 C = C * A |
| /=		| 除且赋值运算符，把左边操作数除以右边操作数的结果赋值给左边操作数	| C /= A 相当于 C = C / A |
| %=		| 求模且赋值运算符，求两个操作数的模赋值给左边操作数				| C %= A 相当于 C = C % A |
| <<=		| 左移且赋值运算符												| C <<= 2 等同于 C = C << 2 |
| >>=		| 右移且赋值运算符												| C >>= 2 等同于 C = C >> 2 |
| &=		| 按位与且赋值运算符											| C &= 2 等同于 C = C & 2 |
| ^=		| 按位异或且赋值运算符											| C ^= 2 等同于 C = C ^ 2 |
| `|=`		| 按位或且赋值运算符											| C `|=` 2 等同于 C = C `|` 2 |
 
 
六、其他运算符

| 运算符		| 描述 |
|:---|:---|
| sizeof()	| 返回数据类型的大小。	|
| typeof()	| 返回 class 的类型。	|
| &			| 返回变量的地址。	|
| *			| *a; 将指向一个变量。|
| ? :		| 条件表达式。|
| is		| 判断对象是否为某一类型。|
| as		| 强制转换，即使转换失败也不会抛出异常。|

七、运算符优先级

优先级不进行记录。如有需要，使用**()**来进行分割。


# 判断

判断结构要求程序员指定一个或多个要评估或测试的条件，以及条件为真时要执行的语句（必需的）和条件为假时要执行的语句（可选的）。

此处 C# 和 Java 没啥区别。

一、判断语句

| 语句			|描述 |
|:---|:---|
| if 			|一个 if 语句 由一个布尔表达式后跟一个或多个语句组成。|
| if...else 	|一个 if 语句 后可跟一个可选的 else 语句，else 语句在布尔表达式为假时执行。|
| 嵌套 if 		|可以在一个 if 或 else if 语句内使用另一个 if 或 else if 语句。|
| switch 		|一个 switch 语句允许测试一个变量等于多个值时的情况。|
| 嵌套switch     |可以在一个 switch 语句内使用另一个 switch 语句。|

二、三目运算符

它的一般形式如下：

```
Exp1 ? Exp2 : Exp3;
```

其中，Exp1、Exp2 和 Exp3 是表达式。请注意，冒号的使用和位置。

? 表达式的值是由 Exp1 决定的。如果 Exp1 为真，则计算 Exp2 的值，结果即为整个 ? 表达式的值。如果 Exp1 为假，则计算 Exp3 的值，结果即为整个 ? 表达式的值。


# 循环

循环语句允许我们多次执行一个语句或语句组。

一、循环类型


| 循环类型		| 描述 |
|:----|:-----|
| while 		| 当给定条件为真时，重复语句或语句组。它会在执行循环主体之前测试条件。|
| for 			| 多次执行一个语句序列，简化管理循环变量的代码。|
| do...while 	| 除了它是在循环主体结尾测试条件外，其他与 while 语句类似。|
| 嵌套循环		| 您可以在 while、for 或 do..while 循环内使用一个或多个循环。| 


二、循环控制语句

循环控制语句更改执行的正常序列。当执行离开一个范围时，所有在该范围中创建的自动对象都会被销毁。

| 控制语句		| 描述 |
|:----|:----|
| break 		| 终止 loop 或 switch 语句，程序流将继续执行紧接着 loop 或 switch 的下一条语句。|
| continue		| 引起循环跳过主体的剩余部分，立即重新开始测试条件。|


- WhileDemo.cs

```c#
//i = 0
//i = 1
//i = 2
static void BreakDemo()
{
    for (int i = 0; i < 5; i++)
    {
        if (i == 3)
        {
            break;
        }
        Console.WriteLine("i = {0}", i);
    }
}

//i = 0
//i = 1
//i = 2
//i = 4
static void ContinueDemo()
{
    for (int i = 0; i < 5; i++)
    {
        if (i == 3)
        {
            continue;
        }
        Console.WriteLine("i = {0}", i);
    }
}
```



三、无限循环

如果条件永远不为假，则循环将变成无限循环。for 循环在传统意义上可用于实现无限循环。由于构成循环的三个表达式中任何一个都不是必需的，您可以将某些条件表达式留空来构成一个无限循环。

我更倾向于使用 

```
while(true)
```

# 可空类型

一、可空类型

C# 提供了一个特殊的数据类型，nullable 类型（可空类型），可空类型可以表示其**基础值类型正常范围内的值，再加上一个 null 值。**

例如，Nullable< Int32 >，读作"可空的 Int32"，可以被赋值为 -2,147,483,648 到 2,147,483,647 之间的任意值，也可以被赋值为 null 值。类似的，Nullable< bool > 变量可以被赋值为 true 或 false 或 null。

在处理数据库和其他包含可能未赋值的元素的数据类型时，将 null 赋值给数值类型或布尔型的功能特别有用。例如，数据库中的布尔型字段可以存储值 true 或 false，或者，该字段也可以未定义。


声明一个 nullable 类型（可空类型）的语法如下：

```
< data_type> ? <variable_name> = null;
```

(这种感觉就行是对Java中的基本类型，添加可为NULL的这一特性)


- Nullable()

```c#
//nullableInt:【】
//nullableInt:【5】
static void Nullable()
{
    int? nullableInt = null;
    Console.WriteLine("nullableInt:【{0}】", nullableInt);
    nullableInt = 5;
    Console.WriteLine("nullableInt:【{0}】", nullableInt);
}
```

二、Null 合并运算符（ ?? ）

Null 合并运算符用于定义可空类型和引用类型的默认值。Null 合并运算符为类型转换定义了一个预设值，以防可空类型的值为 Null。

Null 合并运算符把操作数类型隐式转换为另一个可空（或不可空）的值类型的操作数的类型。

如果第一个操作数的值为 null，则运算符返回第二个操作数的值，否则返回第一个操作数的值。

- NullMerge()

```c#
//resultOne: 6
//resultTwo: 4
static void NullMerge()
{
    int? nullableIntOne = null;
    int? nullableIntTwo = 4;

    int resultOne = nullableIntOne ?? 6;
    int resultTwo = nullableIntTwo ?? 7;

    Console.WriteLine("resultOne: {0}", resultOne);
    Console.WriteLine("resultTwo: {0}", resultTwo);
}
```


# 封装

(本来想将这个地方放在对象那一块，但是方法中涉及到访问限定符。所以还是放在此处简单了解)

封装 被定义为"把一个或多个项目封闭在一个物理的或者逻辑的包中"。在面向对象程序设计方法论中，封装是为了防止对实现细节的访问。

抽象和封装是面向对象程序设计的相关特性。抽象允许相关信息可视化，封装则使程序员实现所需级别的抽象。

封装使用 访问修饰符 来实现。一个 访问修饰符 定义了一个类成员的范围和可见性。


C# 支持的访问修饰符如下所示：

- Public

- Private

- Protected

（以上三个和Java一致）

- Internal

- Protected internal


一、Public 访问修饰符

Public 访问修饰符允许一个类将其成员变量和成员函数暴露给其他的函数和对象。任何公有成员可以被外部的类访问。

二、Private 访问修饰符

Private 访问修饰符允许一个类将其成员变量和成员函数对其他的函数和对象进行隐藏。只有同一个类中的函数可以访问它的私有成员。即使是类的实例也不能访问它的私有成员。

三、Protected 访问修饰符

Protected 访问修饰符允许子类访问它的基类的成员变量和成员函数。这样有助于实现继承。我们将在继承的章节详细讨论这个。

四、Internal 访问修饰符

Internal 访问说明符允许一个类将其成员变量和成员函数暴露给当前程序中的其他函数和对象。

换句话说，带有 internal 访问修饰符的任何成员可以被定义在该成员所定义的应用程序内的任何类或方法访问。

举个栗子:

- InternalDemo.cs

```c#
public class InternalDemo
{
    //成员变量
    internal double length;
    internal double width;

    //如果没有指定访问修饰符，则使用类成员的默认访问修饰符，即为 private
    double CalcArea()
    {
        return length * width;
    }

    public void Display()
    {
        Console.WriteLine("Width: {0}, Length: {1}, Area: {2}", width, length, CalcArea());
    }
}


class ExeInternalDemo
{
    //Width: 3.6, Length: 2.5, Area: 9
    static void Main(string[] args)
    {
        InternalDemo demo = new InternalDemo();
        demo.length = 2.5;
        demo.width = 3.6;

        demo.Display();
    }
}
```

五、Protected Internal 访问修饰符

Protected Internal 访问修饰符允许一个类将其成员变量和成员函数对同一应用程序内的子类以外的其他的类对象和函数进行隐藏。这也被用于实现继承。


# 方法

一个方法是把一些相关的语句组织在一起，用来执行一个任务的语句块。

一、定义方法

当定义一个方法时，从根本上说是在声明它的结构的元素。

```
<Access Specifier> <Return Type> <Method Name>(Parameter List)
{
   Method Body
}
```

- Access Specifier

访问修饰符，这个决定了变量或方法对于另一个类的可见性。

- Return type

返回类型，一个方法可以返回一个值。返回类型是方法返回的值的数据类型。如果方法不返回任何值，则返回类型为 void。

- Method name

方法名称，是一个唯一的标识符，且是大小写敏感的。它不能与类中声明的其他标识符相同。

- Parameter list

参数列表，使用圆括号括起来，该参数是用来传递和接收方法的数据。参数列表是指方法的参数类型、顺序和数量。参数是可选的，也就是说，一个方法可能不包含参数。

- Method body

方法主体，包含了完成任务所需的指令集。


# 参数传递

当调用带有参数的方法时，您需要向方法传递参数。在 C# 中，有三种向方法传递参数的方式：

（Java 只有按值传递。）

| 方式	|	描述 |
|:----|:-----|
| 值参数 |	这种方式复制参数的实际值给函数的形式参数，实参和形参使用的是两个不同内存中的值。在这种情况下，当形参的值发生改变时，不会影响实参的值，从而保证了实参数据的安全。|
| 引用参数	| 这种方式复制参数的内存位置的引用给形式参数。这意味着，当形参的值发生改变时，同时也改变实参的值。|
| 输出参数	| 这种方式可以返回多个值。|


一、按值传递参数

这是参数传递的默认方式。在这种方式下，当调用一个方法时，会为每个值参数创建一个新的存储位置。

实际参数的值会复制给形参，实参和形参使用的是两个不同内存中的值。所以，当形参的值发生改变时，不会影响实参的值，从而保证了实参数据的安全。下面的实例演示了这个概念：

- ValTransmit.cs

```c#
public class ValTransmit
{
    static void Swap(int x, int y)
    {
        int temp = x;
        x = y;
        y = temp;

        Display(x, y);
    }

    static void Display(int x, int y)
    {
        Console.WriteLine("First elem:{0}, Second elem:{1}", x, y);
    }

    //First elem:200, Second elem:100
    //After swap in Main(): 
    //First elem:100, Second elem:200
    static void Main(string[] args)
    {
        int a = 100;
        int b = 200;
        Swap(a, b);

        Console.WriteLine("After swap in Main(): ");
        Display(a, b);
    }
}
```

结果表明，即使在函数内改变了值，值也没有发生任何的变化。

二、按引用传递参数

引用参数是一个对变量的**内存位置的引用**。当按引用传递参数时，与值参数不同的是，它不会为这些参数创建一个新的存储位置。引用参数表示与提供给方法的实际参数具有相同的内存位置。

在 C# 中，使用 ```ref``` 关键字声明引用参数。

```c#
static void Swap(ref int x, ref int y)
{ 
    int temp = x;
    x = y;
    y = temp;

    Display(x, y);
}

//First elem:200, Second elem:100
//After swap in Main(): 
//First elem:200, Second elem:100
static void Main(string[] args)
{
    int a = 100;
    int b = 200;
    Swap(ref a, ref b);

    Console.WriteLine("After swap in Main(): ");
    Display(a, b);
}
```

结果表明，Swap() 函数内的值改变了，且这个改变可以在 Main() 函数中反映出来。

三、按输出传递参数

return 语句可用于只从函数中返回一个值。但是，可以使用 输出参数 来从函数中返回两个值。输出参数会把方法输出的数据赋给自己，其他方面与引用参数相似。


- OutTransmit.cs

```c#
public class OutTransmit
{
    static void getVal(out int val)
    {
        val = 5;
    }

    static void Show(int a)
    {
        Console.WriteLine("int value is:{0}", a);
    }

    //int value is:100
    //int value is:5
    static void Main(string[] args)
    {
        int a = 100;
        Show(a);

        getVal(out a);
        Show(a);
    }
}
```

提供给输出参数的变量不需要赋值。当需要**从一个参数没有指定初始值的方法中返回值时**，输出参数特别有用。请看下面的实例，来理解这一点：

简单理解： 多个返回值需要返回，用这种方式很方便。(Java 没有的特性)


```c#
static void getVals(out int x, out int y)
{
    x = 10;
    y = 20;
}

static void Show(int x, int y)
{ 
    Console.WriteLine("x value is:{0}, y value is:{1}", x, y);
}

//x value is:10, y value is:20
static void Main(string[] args)
{
    int x;
    int y;
    getVals(out x, out y);
    Show(x, y);
}
```



































































