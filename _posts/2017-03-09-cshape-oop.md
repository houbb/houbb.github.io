---
layout: post
title: CShape-03-oop 
date:  2017-03-09 09:11:55 +0800
categories: [Programming Language]
tags: [cshape]
published: true
---

* any list
{:toc}

# 继承

继承是面向对象程序设计中最重要的概念之一。继承允许我们根据一个类来定义另一个类，这使得**创建和维护应用程序变得更容易。同时也有利于重用代码和节省开发时间**。(代码的复用性提高， 且便于管理。)

当创建一个类时，程序员不需要完全重新编写新的数据成员和成员函数，只需要设计一个新的类，继承了已有的类的成员即可。这个已有的类被称为的基类，这个新的类被称为派生类。

继承的思想实现了 **属于（IS-A）** 关系。

一、 基类和派生类

一个类可以派生自多个类或接口，这意味着它可以从多个基类或接口继承数据和函数。

C# 中创建派生类的语法如下：

```
<acess-specifier> class <base_class>
{
...
}
class <derived_class> : <base_class>
{
...
}
```

- InheritDemo.cs

```c#
class Fruit
{
    private string name;

    public Fruit()
    {
    }
    public Fruit(string name)
    {
        this.name = name;
    }

    public string Name
    {
        get
        {
            return name;
        }

        set
        {
            name = value;
        }
    }

    public override string ToString()
    {
        return string.Format("[Fruit: name={0}]", name);
    }
}

class Apple : Fruit
{
    private string color;

    public Apple()
    {
    }
    public Apple(string name, string color) : base(name)
    {
        this.color = color;
    }

    public string Color
    {
        get
        {
            return color;
        }

        set
        {
            color = value;
        }
    }

    public override string ToString()
    {
        return string.Format("[Apple: color={0}], {1}", color, base.ToString());
    }

}


//[Apple: color=red], [Fruit: name=apple]
//[Apple: color=blue], [Fruit: name=apple]
class AppleExe
{
    static void Main(string[] args)
    {
        Apple apple = new Apple();
        apple.Color = "red";
        apple.Name = "apple";
        Console.WriteLine(apple);

        Apple blueApple = new Apple("apple", "blue");
        Console.WriteLine(blueApple);
    }
}
```

备注

1、这种继承更接近于 C++
2、base 类似于 Java 中的 super
3、this 都是类似的


二、 多重继承

C# **不支持**多重继承。

多重继承指的是一个类别可以同时从多于一个父类继承行为与特征的功能。与单一继承相对，单一继承指一个类别只可以继承自一个父类。

(这一点和Java一致，为了避免混乱)


# 多态性

多态性意味着有多重形式。在面向对象编程范式中，多态性往往表现为"一个接口，多个功能"。

多态性可以是静态的或动态的。在静态多态性中，函数的响应是在**编译**时发生的。在动态多态性中，函数的响应是在**运行**时发生的。


一、 静态多态性

在编译时，函数和对象的连接机制被称为早期绑定，也被称为静态绑定。C# 提供了两种技术来实现静态多态性。分别为：

- 函数重载

- 运算符重载

将在下一章节讨论。

二、 动态多态性

C# 允许您使用关键字 `abstract` 创建抽象类，用于提供接口的部分类的实现。当一个派生类继承自该抽象类时，实现即完成。抽象类包含抽象方法，抽象方法可被派生类实现。派生类具有更专业的功能。

请注意，下面是有关抽象类的一些规则：

- 不能创建一个抽象类的实例。

- 不能在一个抽象类外部声明一个抽象方法。

- 通过在类定义前面放置关键字 `sealed`，可以将类声明为密封类。当一个类被声明为 sealed 时，它不能被继承。抽象类不能被声明为 sealed。（类似于 Java 的 `final`）

下面的程序演示了一个抽象类：

- PolymorphismDemo.cs

```c#
//抽象类
public abstract class Shape
{
    //如果需要被继承，则此方法不能为 private
    public abstract void Area();

    public void Show()
    {
        Console.WriteLine("Hello abstract class");
    }
}

public class Rectangle : Shape
{
    private int length;
    private int width;

    public Rectangle(int length, int width)
    {
        this.length = length;
        this.width = width;
    }

    public override void Area()
    {
        Console.WriteLine("Rectangle 类的面积：{0}", width*length);
    }
}

class RectanlgeExe
{
    //Hello abstract class
    //Rectangle 类的面积：200
    static void Main(string[] args)
    {
        Rectangle rectanlge = new Rectangle(10, 20);
        rectanlge.Show();
        rectanlge.Area();
    }
}
```


当有一个定义在类中的函数需要在继承类中实现时，可以使用虚方法。虚方法是使用关键字 `virtual` 声明的。虚方法可以在不同的继承类中有不同的实现。对虚方法的调用是在运行时发生的。

动态多态性是通过 **抽象类** 和 **虚方法** 实现的。(Just as C++)

换言之， 和Java有所不同的是，并不是父类的每个方法都可以直接重载。子类允许重载的方法必须声明为`virtual`/`abstract`等。对于`virtual`声明的方法，子类也可以不重载。

这样设计的好处是可以直观的看到哪些方法允许被重载，但是很麻烦。


- VirtualDemo.cs

```c#
class Animal
{
    public virtual void Cry()
    {
        Console.WriteLine("the common animal cry...");
    }

    public void BaseInfo()
    {
        Console.WriteLine("This is animal base...");
    }
}

class Cat : Animal
{ 
    public override void Cry()
    {
        Console.WriteLine("cat cry is miawu~~~");
    }
}

class Unkown : Animal
{ 
    
}

//  cat cry is miawu ~~~
//	the common animal cry...
public class VirtualDemo
{
    static void Main(string[] args)
    {
        Cat cat = new Cat();
        cat.Cry();

        Unkown unknown = new Unkown();
        unknown.Cry();
    }
}
```


# 静态多态性

在编译时，函数和对象的连接机制被称为早期绑定，也被称为静态绑定。C# 提供了两种技术来实现静态多态性。分别为：

- 函数重载

- 运算符重载

一、函数重载

您可以在同一个范围内对相同的函数名有多个定义。函数的定义必须彼此不同，可以是参数列表中的参数类型不同，也可以是参数个数不同。不能重载只有返回类型不同的函数声明。

1、返回值不同并不能区分， 因为有时当你不关心返回值时，编译器无法确定你到底想调用哪一个。

2、重载其实是为了方便简洁，你不要为相似的事情去进行不同的命名。这点人文关怀同样体现在构造器的参数上。

- FunctionOverload.cs

```c#
public class FunctionOverload
{
    public static void Show(int i)
    {
        Console.WriteLine("int value is:{0}", i);
    }

    public static void Show(double d)
    {
        Console.WriteLine("double value is:{0}", d);
    }
}

class FunctionOverloadExe
{
    //int value is:20
    //double value is:2.2
    static void Main(string[] args)
    {
        int i = 20;
        double d = 2.2;

        FunctionOverload.Show(i);
        FunctionOverload.Show(d);
    }
}
```


二、运算符重载

您可以重定义或重载 C# 中内置的运算符。因此，程序员也可以使用用户自定义类型的运算符。

重载运算符是具有特殊名称的函数，是通过关键字 `operator` 后跟运算符的符号来定义的。与其他函数一样，重载运算符有返回类型和参数列表。（Just as C++）

| 运算符 | 描述 |
|:----|:----|
| +, -, !, ~, ++, --						| 这些一元运算符只有一个操作数，且可以被重载。|
| +, -, *, /, %							| 这些二元运算符带有两个操作数，且可以被重载。|
| ==, !=, <, >, <=, >=					| 这些比较运算符可以被重载。|
| &&, `||`									| 这些条件逻辑运算符不能被直接重载。|
| +=, -=, *=, /=, %=						| 这些赋值运算符不能被重载。|
| =, ., ?:, ->, new, is, sizeof, typeof	| 这些运算符不能被重载。| 


- OperatorOverload.cs 

```c#
namespace com.ryo.cshape.overload
{
	class Rectangle
	{
		private int length;

		private int width;

		public Rectangle(int length, int width)
		{
			this.length = length;
			this.width = width;
		}

		public void ShowArea()
		{
			Console.WriteLine("length:{0}, width:{1}, area:{2}", length, width, length*width);
		}

		//静态
		public static Rectangle operator + (Rectangle one, Rectangle two)
		{
			int length = one.length+two.length;
			int width = one.width+two.width;
			Rectangle result = new Rectangle(length, width);
			return result;
		}
	}

	//length:30, width:30, area:900
	public class OperatorOverload
	{
		static void Main(string[] args)
		{
			Rectangle one = new Rectangle(10, 10);
			Rectangle two = new Rectangle(20, 20);

			Rectangle three = one+two;
			three.ShowArea();
		}
	}
}
```

# 接口

接口定义了所有类继承接口时应遵循的语法合同。接口定义了语法合同 "是什么" 部分，派生类定义了语法合同 "怎么做" 部分。

接口定义了属性、方法和事件，这些都是接口的成员。接口只包含了成员的声明。成员的定义是派生类的责任。接口提供了派生类应遵循的标准结构。

抽象类在某种程度上与接口类似，但是，它们大多只是用在当只有少数方法由基类声明由派生类实现时。

(Just as Java)

一、声明接口

接口使用 `interface` 关键字声明，它与类的声明类似。接口声明默认是 **public** 的。


二、实例

- InterfaceDemo.cs

```c#
public interface Id
{
    void Id();
}


class FirstId : Id
{
    public void Id()
    {
        Console.WriteLine("this is the first id.");
    }
}

class SecondId : Id
{
    public void Id()
    {
        Console.WriteLine("this is the second id.");
    }
}

public class InterfaceDemo
{
    //this is the first id.
    //this is the second id.	
    static void Main(string[] args)
    {
        Id first = new FirstId();
        first.Id();

        Id second = new SecondId();
        second.Id();
    }
}
```


# 命名空间

命名空间(namespace)的设计目的是提供一种让一组名称与其他名称分隔开的方式。在一个命名空间中声明的类的名称与另一个命名空间中声明的相同的类的名称不冲突。

（类似于 Java 中的 `package`, 很明显本教程是学C++过来的==！）

一、定义命名空间

命名空间的定义是以关键字 `namespace` 开始，后跟命名空间的名称，如下所示：

```
namespace namespaceName
{
   // code...
}
```

为了调用支持命名空间版本的函数或变量，会把命名空间的名称置于前面，如下所示：

```
namespaceName.itemName;
```

创建命名空间的名称时应使用以下原则：

- **公司名称.技术名称**

例如，Microsoft.Word 命名空间就符合此原则。

- 命名时**不要使用下划线、连字符或任何其他非字母数字字符**




> NamespaceDemo.cs 


```c#
using System;

namespace com.ryo.First
{
	public class Apple
	{
		public void Show()
		{
			Console.WriteLine("apple in first.");
		}

	}
}
namespace com.ryo.Second
{
	public class Apple
	{
		public void Show()
		{
			Console.WriteLine("apple in second.");
		}

	}
}


class NamespaceTest
{
	//apple in first.
	//apple in second.
	static void Main(string[] args)
	{ 
		com.ryo.First.Apple first = new com.ryo.First.Apple();
		com.ryo.Second.Apple second = new com.ryo.Second.Apple();

		first.Show();
		second.Show();
	}
}
```


二、using

`using` 关键字表明程序使用的是给定命名空间中的名称。(类似于 Java 中 `import`， 只要不会引起混乱， 就没必要写完全限定。)

例如，我们在程序中使用 System 命名空间，其中定义了类 Console。我们可以只写:

```c#
Console.WriteLine ("Hello there");
```

我们可以写完全限定名称，如下：

```c#
System.Console.WriteLine("Hello there");
```

您也可以使用 using 命名空间指令，这样在使用的时候就不用在前面加上命名空间名称。该指令告诉编译器随后的代码使用了指定命名空间中的名称。下面的代码演示了命名空间的应用。


> NamespaceTest.cs

```c#
using System;
using com.ryo.First;
using com.ryo.Second;

namespace com.ryo.First
{
	public class Apple
	{
		public void Show()
		{
			Console.WriteLine("apple in first.");
		}

	}
}
namespace com.ryo.Second
{
	public class Orange
	{
		public void Show()
		{
			Console.WriteLine("orange in second.");
		}

	}
}


class NamespaceTest
{
	//apple in first.
	//orange in second.
	static void Main(string[] args)
	{ 
		Apple apple = new Apple();
		Orange orange = new Orange();

		apple.Show();
		orange.Show();
	}
}

```


三、嵌套命名空间

命名空间可以被嵌套，即您可以在一个命名空间内定义另一个命名空间。(类似于Java中的子包。只不过包对于文件的分类更令人习惯？)

```
namespace namespaceName1 
{
   // 代码声明
   namespace namespaceName2 
   {
     // 代码声明
   }
}
```

您可以使用点`.`运算符访问嵌套的命名空间的成员，如下所示：

- NestNamespaceDemo.cs

```c#
using System;
namespace com.ryo.OutSpace
{
	namespace com.ryo.InnerSpace
	{
		public class Inner
		{
			public static void Say()
			{
				Console.WriteLine("say() in com.ryo.InnerSpace.Inner");
			}
		}
	}

	public class NestNamespaceDemo
	{
		//say() in com.ryo.InnerSpace.Inner
		static void Main(string[] args)
		{
			com.ryo.InnerSpace.Inner.Say();
		}
	}
}
```

























