---
layout: post
title: CShape-07-lambda
date:  2017-04-09 21:44:46 +0800
categories: [C#]
tags: [cshape, cshape, lang, .net, dotnet]
published: true
---


# Anonymous methods

**匿名方法**（Anonymous methods） 提供了一种传递代码块作为委托参数的技术。在匿名方法中您不需要指定返回类型，它是从方法主体内的 return 语句推断的。

一、定义语法

匿名方法是通过使用 `delegate` 关键字创建委托实例来声明的。

eg:

```c#
delegate void NumberChanger(int n);

NumberChanger nc = delegate(int x)
{
    /**
     * This is the body of Anonymous methods;
     */
    Console.WriteLine("Anonymous Method: {0}", x);
};
```

二、调用

委托可以通过匿名方法调用，也可以通过命名方法调用，即，通过向委托对象传递方法参数。

eg:

```c#
nc(20);
```

- AnonymousMethod.cs

实践时，匿名的方法必须有一个返回值。和案例不同。

```c#
using System;
namespace cshape_test
{
	delegate void NumDelegate(int num);

	public class AnonymousMethod
	{
		private static int num;

		void Add(int val)
		{
			num += val;
		}
		void Multi(int val)
		{
			num *= val;
		}

		//the val is:20
		static void Main(string[] args)
		{
			NumberChanger nc = delegate (int val)
			{
				Console.WriteLine("the val is:{0}", val);
				return 0;
			};
			nc(20);
		}
	}

}
```



# Lambda

[Lambda](https://msdn.microsoft.com/zh-cn/library/bb397687.aspx) 表达式是一种可用于创建委托或表达式目录树类型的*匿名函数*。
通过使用 lambda 表达式，可以写入可作为参数传递或作为函数调用值返回的本地函数。
 
一、创建方式

若要创建 Lambda 表达式，需要在 Lambda 运算符 `=>` 左侧指定输入参数（如果有），然后在另一侧输入表达式或语句块。 

例如，lambda 表达式 `x => x * x` 指定名为 x 的参数并返回 x 的平方值。

- Lambda.cs

```c#
using System;

namespace cshape_test
{
	delegate int Multi(int x);

	public class Lambda
	{
		static void Main(string[] args)
		{
			Multi myMulti = x=> x*x;

			Console.WriteLine(myMulti(10));	//100
		}
	}
}
```

<label class="label label-warn">Warn</label>

1. 在 `is` 或 `as` 运算符的左侧不允许使用 Lambda。

2. 适用于匿名方法的所有限制也适用于 Lambda 表达式。


## 表达式 lambda

表达式位于 `=>` 运算符右侧的 lambda 表达式称为 **“表达式 lambda”**。 表达式 lambda 广泛用于表达式树的构造。 表达式 lambda 会返回表达式的结果，并采用以下基本形式

```c#
(input parameters) => expression 
```

仅当 lambda 只有一个输入参数时，括号才是可选的；否则括号是**必需**的。 括号内的两个或更多输入参数使用逗号加以分隔：

```c#
(x, y) => x == y  
```

有时，编译器难以或无法推断输入类型。 如果出现这种情况，你可以按以下示例中所示方式显式指定类型：

```c#
(int x, string s) => s.Length > x
```
使用空括号指定零个输入参数：

```c#
() => SomeMethod()  
```

在上一个示例中，请注意表达式 Lambda 的主体可以包含一个方法调用。 但是，如果要创建在 .NET Framework 之外计算的表达式目录树（例如，在 SQL Server 中），
则不应在 lambda 表达式中使用方法调用。 在 .NET 公共语言运行时上下文之外，方法将没有任何意义。

## 语句 lambda

语句 lambda 与表达式 lambda 表达式类似，只是语句括在大括号中：

```c#
(input parameters) => {statement;} 
```

语句 lambda 的主体可以包含任意数量的语句；但是，实际上通常不会多于两个或三个。

```c#
delegate void Show(string str);
public class Lambda
{
    static void Main(string[] args)
    {
        Show show = n => {
            string result = n + "world";
            Console.WriteLine("Result: {0}", result);
        };
        show("hello");	//Result: helloworld
    }
} 
```

跳过内容：

- 异步 lambda

- 带有标准查询运算符的 lambda

## Lambda 中的类型推理

在编写 lambda 时，通常不必为输入参数指定类型，因为编译器可以根据 lambda 主体、参数的委托类型以及 C# 语言规范中描述的其他因素来推断类型。 
对于大多数标准查询运算符，第一个输入是源序列中的元素类型。 因此，如果要查询 IEnumerable<Customer>，则输入变量将被推断为 Customer 对象，这意味着你可以访问其方法和属性：

```c#
customers.Where(c => c.City == "London"); 
```

Lambda 的一般规则如下：

- Lambda 包含的参数数量必须与委托类型包含的参数数量相同。

- Lambda 中的每个输入参数必须都能够隐式转换为其对应的委托参数。

- Lambda 的返回值（如果有）必须能够隐式转换为委托的返回类型。

请注意，lambda 表达式本身没有类型，因为常规类型系统没有“Lambda 表达式”这一内部概念。 
但是，有时以一种非正式的方式谈论 lambda 表达式的“类型”会很方便。 在这些情况下，类型是指委托类型或 lambda 表达式所转换到的 Expression 类型。

## Lambda 表达式中的变量范围

在定义 lambda 函数的方法内或包含 lambda 表达式的类型内，Lambda 可以引用范围内的外部变量（请参阅匿名方法）。 
以这种方式捕获的变量将进行存储以备在 lambda 表达式中使用，即使在其他情况下，这些变量将超出范围并进行垃圾回收。 必须明确地分配外部变量，然后才能在 lambda 表达式中使用该变量。 下面的示例演示这些规则：

下列规则适用于 lambda 表达式中的变量范围：

- 捕获的变量将不会被作为垃圾回收，直至引用变量的委托符合垃圾回收的条件。

- 在外部方法中看不到 lambda 表达式内引入的变量。

- Lambda 表达式无法从封闭方法中直接捕获 `ref` 或 `out` 参数。

- Lambda 表达式中的返回语句不会导致封闭方法返回。

- 如果跳转语句的目标在块外部，则 lambda 表达式不能包含位于 lambda 函数内部的 goto 语句、break 语句或 continue 语句。 同样，如果目标在块内部，则在 lambda 函数块外部使用跳转语句也是错误的。


- LambdaRange.cs

```c#
using System;
namespace cshape_test
{
	delegate void DelOne();
	delegate void DelTwo(int num);

	public class LambdaRange
	{
		private DelOne delOne;
		private DelTwo delTwo;



		public void Range(int input)
		{
			int original = 10;
			delOne = () =>
			{
				original = input;
				Show(input, original);
			};

			delTwo = (x) =>
			{
				Console.WriteLine("x:{0}, original:{1}", x, original);
			};



			Console.WriteLine("At begin, original value is:{0}", original);
			delOne();
			Console.WriteLine("After delOne, original value is:{0}", original);
		}


		private void Show(int input, int original)
		{
			Console.WriteLine("Input:{0}, original:{1}", input, original);
		}

		//At begin, original value is:10
		//Input:3, original:3
		//After delOne, original value is:3
		//x:88, original:3
		static void Main(string[] args)
		{
			LambdaRange lr = new LambdaRange();
			lr.Range(3);
			lr.delTwo(88);
		}
	}
}
```




* any list
{:toc}



