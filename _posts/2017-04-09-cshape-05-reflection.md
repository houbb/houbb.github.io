---
layout: post
title: CShape-05-reflection
date:  2017-04-09 21:44:46 +0800
categories: [C#]
tags: [cshape, cshape, lang, .net, dotnet]
published: true
---



# Attribute

特性（Attribute）是用于在运行时传递程序中各种元素（比如类、方法、结构、枚举、组件等）的行为信息的声明性标签。您可以通过使用特性向程序添加声明性信息。

一个声明性标签是通过放置在它所应用的元素前面的方括号`[]`来描述的。

特性（Attribute）用于添加元数据，如编译器指令和注释、描述、方法、类等其他信息。.Net 框架提供了两种类型的特性：预定义特性和自定义特性。

（类似Java中的注解，同样的道理这里只是定时使用。真正的解析需要借助于反射）

一、规定特性

语法如下：

```
[attribute(positional_parameters, name_parameter = value, ...)]
element
```

特性（Attribute）的名称和值是在方括号内规定的，放置在它所应用的元素之前。positional_parameters 规定必需的信息，name_parameter 规定可选的信息。


二、预定义特性（Attribute）

.Net 框架提供了三种预定义特性：

1、 AttributeUsage

预定义特性 AttributeUsage 描述了如何使用一个自定义特性类。它规定了特性可应用到的项目的类型。

规定该特性的语法如下：

```
[AttributeUsage(
   validon,
   AllowMultiple=allowmultiple,
   Inherited=inherited
)]
```

其中：

- validon 规定特性可被放置的语言元素。它是枚举器 AttributeTargets 的值的组合。默认值是 AttributeTargets.All。

- allowmultiple（可选的）为该特性的 AllowMultiple 属性（property）提供一个布尔值。如果为 true，则该特性是多用的。默认值是 false（单用的）。

- inherited（可选的）为该特性的 Inherited 属性（property）提供一个布尔值。如果为 true，则该特性可被派生类继承。默认值是 false（不被继承）。

eg:

```c#
[AttributeUsage(AttributeTargets.Class |
AttributeTargets.Constructor |
AttributeTargets.Field |
AttributeTargets.Method |
AttributeTargets.Property, 
AllowMultiple = true)]
```




2、 Conditional

这个预定义特性标记了一个条件方法，其执行依赖于它顶的**预处理标识符**。

它会引起方法调用的条件编译，取决于指定的值，比如 Debug 或 Trace。例如，当调试代码时显示变量的值。

规定该特性的语法如下：

```c#
[Conditional(
   conditionalSymbol
)]
```

限制：

- Conditional特性只可以应用在整个方法上。

- 任何使用了 Conditional 特性的方法都只能返回 void 类型。

> [Conditional doc](https://msdn.microsoft.com/zh-cn/library/4xssyw96(VS.80).aspx)

- AttributeConditionalDemo.cs

如果将 `#define DEBUG_ON` 注释掉， 则不会打印。

```c#
#define DEBUG_ON

using System;
using System.Diagnostics;

namespace cshape_test
{
	public class AttributeConditionalDemo
	{
		[Conditional("DEBUG_ON")]
		public static void ShowDebugInfo()
		{
			Console.WriteLine("Show me debug info");
		}

		//Show me debug info
		static void Main(string[] args)
		{
			ShowDebugInfo();
		}
	}
}
```

3、 Obsolete

这个预定义特性标记了不应被使用的程序实体。它可以让您通知编译器丢弃某个特定的目标元素。
例如，当一个新方法被用在一个类中，但是您仍然想要保持类中的旧方法，您可以通过显示一个应该使用新方法，而不是旧方法的消息，来把它标记为 obsolete（过时的）。

(类似于 Java中的`@Deprecated`)

语法如下：

```c#
[Obsolete(
   message,
   iserror
)]
```

- 参数 message，是一个字符串，描述项目为什么过时的原因以及该替代使用什么。

- 参数 iserror，是一个布尔值。如果该值为 true，编译器应把该项目的使用当作一个错误。默认值是 false（编译器生成一个警告）。


- ObsoleteDemo.cs

```c#
using System;
namespace cshape_test
{
	public class ObsoleteDemo
	{
		[Obsolete("Warn: Please use NewMethod() instead!", false)]
		static void WarnOldMethod()
		{ 
			Console.WriteLine("WarnOldMethod...");
		}

		[Obsolete("Error: Please use NewMethod() instead!", true)]
		static void ErrorOldMethod()
		{
			Console.WriteLine("ErrorOldMethod...");
		}

		static void NewMethod()
		{
			Console.WriteLine("new method...");
		}

		static void Main(string[] args)
		{
			WarnOldMethod();
			//ErrorOldMethod();
		}
	}
}
```

三、创建自定义特性

.Net 框架允许创建自定义特性，用于存储声明性的信息，且可在运行时被检索。该信息根据设计标准和应用程序需要，可与任何目标元素相关。

（和Java中自定义注解类似）

创建并使用自定义特性包含四个步骤：

1. 声明自定义特性

2. 构建自定义特性

3. 在目标程序元素上应用自定义特性

4. 通过反射访问特性

(相比较而言，C#的特性别注解要更接近于面向对象。因为Java的注解只是停留在方法级别，C#的特性就是一个类，可以有属性方法。)

1、声明自定义特性

一个新的自定义特性应派生自 **System.Attribute** 类。例如：

```c#
public class MyAttribute : System.Attribute
{
}
```


2、构建 & 应用

可以放置的位置： 类，构造器，字段，方法，属性（Property）。

```c#
using System;
namespace cshape_test
{
    [AttributeUsage(AttributeTargets.Class |
       AttributeTargets.Constructor |
       AttributeTargets.Field |
       AttributeTargets.Method |
       AttributeTargets.Property,
       AllowMultiple = true)]
	public class MyAttribute : Attribute
	{
		/// <summary>
		/// The bug no.
		/// </summary>
		private string bugNo;

		/// <summary>
		/// The dev no.
		/// </summary>
		private string devNo;

		/// <summary>
		/// The message.
		/// </summary>
		private string msg;

		public MyAttribute(string bugNo, string devNo)
		{
			this.bugNo = bugNo;
			this.devNo = devNo;
		}

		public MyAttribute(string bugNo, string devNo, string msg)
		{
			this.bugNo = bugNo;
			this.devNo = devNo;
			this.msg = msg;
		}

		string BugNo
		{
			get
			{
				return bugNo;
			}
		}

		string DevNo
		{
			get
			{
				return devNo;
			}
		}

		string Msg
		{
			get
			{
				return msg;
			}
		}
		
		public override string ToString()
        {
            return string.Format("[MyAttribute: bugNo={0}, devNo={1}, msg={2}]", bugNo, devNo, msg);
        }
	}

    [MyAttribute("bug-000", "dev-001", "no bug just for test")]
	public class MyAttributeExe
	{
		/// <summary>
		/// Div the specified dividend and divisor.
		/// </summary>
		/// <param name="dividend">Dividend.</param>
		/// <param name="divisor">Divisor.</param>
		[MyAttribute("bug-001", "dev-001", msg="未考虑除数可能为0的情况")]
		public static int div(int dividend, int divisor)
		{
			return dividend / divisor;
		}
		
		public int add(int first, int second)
        {
            return first + second;
        }
	}
}
```

3、下一节学习反射后进行解析。

# Reflection

反射指程序可以访问、检测和修改它本身状态或行为的一种能力。
程序集包含模块，而模块包含类型，类型又包含成员。反射则提供了封装程序集、模块和类型的对象。
您可以使用反射动态地创建类型的实例，将类型绑定到现有对象，或从现有对象中获取类型。然后，可以调用类型的方法或访问其字段和属性。

优缺点
优点：
1、反射提高了程序的灵活性和扩展性。
2、降低耦合性，提高自适应能力。
3、它允许程序创建和控制任何类的对象，无需提前硬编码目标类。

缺点：
1、性能问题：使用反射基本上是一种解释操作，用于字段和方法接入时要远慢于直接代码。因此反射机制主要应用在对灵活性和拓展性要求很高的**系统框架**上，普通程序不建议使用。（其实也没有多慢）
2、使用反射会模糊程序内部逻辑；程序员希望在源代码中看到程序的逻辑，反射却绕过了源代码的技术，因而会带来维护的问题，反射代码比相应的直接代码更复杂。

一、用途

- 在运行时查看属性（attribute）信息。

- 审查集合中的各种类型，以及实例化这些类型。

- 延迟绑定的方法和属性（property）。

- 在运行时创建新类型，然后使用这些类型执行一些任务。

二、查看元数据

使用反射（Reflection）可以查看属性（attribute）信息。

System.Reflection 类的 MemberInfo 对象需要被初始化，用于发现与类相关的属性（attribute）。为了做到这点，您可以定义目标类的一个对象，

```c#
System.Reflection.MemberInfo info = typeof(className);
```

- MyAttributeTest
 
测试上节的自定义特性。 

```c#
class MyAttributeTest
	{
		static void Main(string[] args)
		{
			Type type = typeof(MyAttributeExe); //like class of java

			//get attribute of class
			foreach (Object attribute in type.GetCustomAttributes(false))
			{
				MyAttribute myAttribute = (MyAttribute)attribute;
				if (myAttribute != null)
				{
					Console.WriteLine("myAttribute of class is:{0}", myAttribute);
				}
			}

			//get attribute of method
			foreach (MethodInfo methodInfo in type.GetMethods())
			{
				Console.WriteLine("Method current: {0}", methodInfo.Name);
				foreach (Object attribute in methodInfo.GetCustomAttributes(true))
				{
					//C#特殊之处，即使是NULL，也可以直接进行转型。
					MyAttribute myAttribute = (MyAttribute)attribute;
					if (myAttribute != null)
					{
						Console.WriteLine("myAttribute of class is:{0}", myAttribute);
					}
				}
			}
		}
	}
```

运行结果：

```
myAttribute of class is:[MyAttribute: bugNo=bug-000, devNo=dev-001, msg=no bug just for test]
Method current: div
myAttribute of class is:[MyAttribute: bugNo=bug-001, devNo=dev-001, msg=未考虑除数可能为0的情况]
Method current: add
Method current: Equals
Method current: GetHashCode
Method current: GetType
Method current: ToString
```

备注：

1、C#中貌似无法直接获取用户自己声明的方法。Equals()及后面的3个都会被反射获取到。



# Property

属性（Property） 是类（class）、结构（structure）和接口（interface）的命名（named）成员。
类或结构中的成员变量或方法称为 域（Field）。属性（Property）是域（Field）的扩展，且可使用相同的语法来访问。它们使用 访问器（accessors） 让私有域的值可被读写或操作。
属性（Property）不会确定存储位置。相反，它们具有可读写或计算它们值的 访问器（accessors）。

一、访问器（Accessors）

属性（Property）的访问器（accessor）包含有助于获取（读取或计算）或设置（写入）属性的可执行语句。访问器（accessor）声明可包含一个 get 访问器、一个 set 访问器，或者同时包含二者。例如：

(同样是封装。这里C#算是对于属性访问的简化。比较Java的Getter、Setter方法使用方便。)

- PropertyDemo.cs

```c#
using System;
namespace cshape_test
{
	public class PropertyDemo
	{
		private string name;

		private int age;

		string Name
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

		int Age
		{
			get
			{
				return age;
			}

			set
			{
				age = value;
			}
		}

		public override string ToString()
		{
			return string.Format("[PropertyDemo: name={0}, age={1}]", name, age);
		}

		//Demo is:[PropertyDemo: name=ryo, age=12]
		static void Main()
		{
			PropertyDemo demo = new PropertyDemo();
			demo.Name = "ryo";
			demo.Age = 12;
			Console.WriteLine("Demo is:{0}", demo);
		}
	}
}
```

二、抽象属性（Abstract Properties）

抽象类可拥有抽象属性，这些属性应在派生类中被实现。下面的程序说明了这点：

```c#
public abstract class Person
{
    public abstract string Name
    {
        get;
        set;
    }
    public abstract int Age
    {
        get;
        set;
    }
}

public class Student : Person
{
    private int age;

    private string name;

    public override int Age
    {
        get
        {
            return age;
        }

        set
        {
            age = value;
        }
    }

    public override string Name
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
}
```

# Indexer

索引器（Indexer）允许一个对象可以像数组一样被索引。当您为类定义一个索引器时，该类的行为就会像一个 虚拟数组（virtual array）一样。
您可以使用数组访问运算符`[]`来访问该类的实例。

一、语法

```c#
element-type this[int index] 
{
   // get 访问器
   get 
   {
      // 返回 index 指定的值
   }

   // set 访问器
   set 
   {
      // 设置 index 指定的值 
   }
}
```


二、用途

索引器的行为的声明在某种程度上类似于属性（property）。就像属性（property），您可使用 get 和 set 访问器来定义索引器。

但是，属性返回或设置一个特定的数据成员，而索引器返回或设置对象实例的一个特定值。换句话说，**它把实例数据分为更小的部分，并索引每个部分，获取或设置每个部分**。

定义一个属性（property）包括提供属性名称。索引器定义的时候不带有名称，但带有 `this` 关键字，它指向对象实例。

下面的实例演示了这个概念：


- IndexerDemo.cs


```c#
using System;
namespace cshape_test
{
	public class IndexerDemo
	{
		private string name;

		private string hobby;

		/// <summary>
		/// 索引器（Indexer）
		/// </summary>
		/// <param name="index">Index.</param>
		public object this[int index]
		{
			get
			{
				if (0 == index)
				{
					return name;
				}
				else if (1 == index)
				{
					return hobby;
				}
				return null;
			}

			set
			{
				if (0 == index)
				{
					name = (string)value;
				}
				else if (1 == index)
				{
					hobby = (string)value;
				}
				else
				{
					// do nothing
				}
			}
		}

		public override string ToString()
		{
			return string.Format("[IndexerDemo: name={0}, hobby={1}]", name, hobby);
		}
	}


	class IndexerDemoExe
	{
		//Indexer: [IndexerDemo: name=ryo, hobby=comic]
		static void Main(string[] args)
		{
			IndexerDemo indexDemo = new IndexerDemo();
			indexDemo[0] = "ryo";
			indexDemo[1] = "comic";
			Console.WriteLine("Indexer: {0}", indexDemo);
		}
	}

}
```

三、重载

比如可以变成以字符串为参数， 而不是以下标。一样的道理，此处不再演示。


# Delegate

C# 中的委托（Delegate）类似于 C 或 C++ 中函数的指针。委托（Delegate） 是存有对某个方法的引用的一种引用类型变量。引用可在运行时被改变。

委托（Delegate）特别用于实现事件和回调方法。所有的委托（Delegate）都派生自 **System.Delegate** 类。



一、声明委托

委托声明决定了可由该委托引用的方法。委托可指向一个与其具有相同标签的方法。

声明委托的语法如下：

```c#
delegate <return type> <delegate-name> <parameter list>
```


例如，假设有一个委托：

```c#
public delegate int MyDelegate (string s);
```

上面的委托可被用于引用任何一个带有一个单一的 string 参数的方法，并返回一个 int 类型变量。

二、实例化委托

一旦声明了委托类型，委托对象必须使用 new 关键字来创建，且与一个特定的方法有关。当创建委托时，传递到 new 语句的参数就像方法调用一样书写，但是不带有参数。

例如：

```c#
public delegate void printString(string s);

printString ps1 = new printString(WriteToScreen);
printString ps2 = new printString(WriteToFile);
```


实际例子如下：

（个人认为这个例子没有体现出委托的精妙所在）

- DelegateDemo.cs

```c#
using System;
namespace cshape_test
{
	/// <summary>
	/// Number changer of delegate.
	/// </summary>
	public delegate int NumberChanger(int num);

	public class DelegateDemo
	{
		private static int staticVal = 10;

		public static int Add(int val)
		{
			staticVal += val;
			return staticVal;
		}

		public static int Multi(int val)
		{
			staticVal *= val;
			return staticVal;
		}

		public static int GetStaticVal()
		{
			return staticVal;
		}
	}

	class DelegateDemoExe
	{
		//Static val is: 60
		static void Main(string[] args)
		{
			NumberChanger ncOne = new NumberChanger(DelegateDemo.Add);
			NumberChanger ncTwo = new NumberChanger(DelegateDemo.Multi);

			ncOne(20);
			ncTwo(2);
			Console.WriteLine("Static val is: {0}", DelegateDemo.GetStaticVal());
		}
	}
}
```

三、委托的多播

委托对象可使用 `+` 运算符进行合并。一个合并委托调用它所合并的两个委托。只有相同类型的委托可被合并。`-` 运算符可用于从合并的委托中移除组件委托。

使用委托的这个有用的特点，您可以创建一个委托被调用时要调用的方法的调用列表。这被称为委托的 多播（multicasting），也叫组播。

下面的程序演示了委托的多播：


```c#
class DelegateDemoExe
{
    //Static val is: 200
    //(10+10)*10 = 200
    static void Main(string[] args)
    {
        NumberChanger nc;
        NumberChanger ncOne = new NumberChanger(DelegateDemo.Add);
        NumberChanger ncTwo = new NumberChanger(DelegateDemo.Multi);

        nc = ncOne + ncTwo;
        nc(10);
        Console.WriteLine("Static val is: {0}", DelegateDemo.GetStaticVal());
    }
}
```

# Event

事件（Event） 基本上说是一个用户操作，如按键、点击、鼠标移动等等，或者是一些出现，如系统生成的通知。应用程序需要在事件发生时响应事件。例如，中断。事件是用于进程间通信。

一、通过事件使用委托

事件在类中声明且生成，且通过使用同一个类或其他类中的委托与事件处理程序关联。包含事件的类用于发布事件。这被称为 发布器（publisher） 类。其他接受该事件的类被称为 订阅器（subscriber） 类。
事件使用 发布-订阅（publisher-subscriber） 模型。

**发布器（publisher）** 是一个包含事件和委托定义的对象。事件和委托之间的联系也定义在这个对象中。发布器（publisher）类的对象调用这个事件，并通知其他的对象。

**订阅器（subscriber）** 是一个接受事件并提供事件处理程序的对象。在发布器（publisher）类中的委托调用订阅器（subscriber）类中的方法（事件处理程序）。


> [delegate and event](http://www.cnblogs.com/chengxingliang/archive/2013/05/21/3051912.html)

二、声明事件（Event）

在类的内部声明事件，首先必须声明该事件的委托类型。

例如：

```c#
public delegate void BoilerLogHandler(string status);
```

然后，声明事件本身，使用 `event` 关键字：

```c#
// 基于上面的委托定义事件
public event BoilerLogHandler BoilerEventLog;
```

上面的代码定义了一个名为 BoilerLogHandler 的委托和一个名为 BoilerEventLog 的事件，该事件在生成的时候会调用委托。


- SimpleEvent.cs

```c#
using System;
namespace cshape_test
{
	public class SimpleEvent
	{
		private int num;

		public SimpleEvent(int num)
		{
			this.num = num;
		}

		/// <summary>
		/// Define the delegate.
		/// </summary>
		public delegate void NumChangeHandler();

		/// <summary>
		/// Define the event for num-change handler;
		/// </summary>
		public event NumChangeHandler ChangeNumEvent;

		/// <summary>
		/// Ons the change number.
		/// </summary>
		public void OnChangeNum()
		{
			Console.WriteLine("(ChangeNumEvent != null):{0}", ChangeNumEvent != null);
			if (ChangeNumEvent != null)
			{
				ChangeNumEvent();	//总觉得此处怪怪的，过会重新看下
			}
			else
			{
				Console.WriteLine("The num has changed!");
			}
		}

		public void ChangeNum(int newNum)
		{
			Console.WriteLine("Change num is:{0}", newNum);
			if (num != newNum)
			{
				num = newNum;
				OnChangeNum();
			}
		}
	}

	class SimpleEventExe
	{
	    //Change num is:10
        //Change num is:20
        //(ChangeNumEvent != null):False
        //The num has changed!
        //Change num is:40
        //(ChangeNumEvent != null):False
        //The num has changed!
		static void Main(string[] args)
		{
			SimpleEvent simpleEvent = new SimpleEvent(10);
			simpleEvent.ChangeNum(10);
			simpleEvent.ChangeNum(20);
			simpleEvent.ChangeNum(40);
		}
	}
}
```

* any list
{:toc}