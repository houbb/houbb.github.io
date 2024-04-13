---
layout: post
title: CShape-06-collection
date:  2017-04-09 21:44:46 +0800
categories: [C#]
tags: [cshape, cshape, lang, .net, dotnet]
published: true
---


# Collection
 
集合（Collection）类是专门用于数据存储和检索的类。这些类提供了对栈（stack）、队列（queue）、列表（list）和哈希表（hash table）的支持。大多数集合类实现了相同的接口。

集合（Collection）类服务于不同的目的，如为元素动态分配内存，基于索引访问列表项等等。这些类创建 Object 类的对象的集合。在 C# 中，Object 类是所有数据类型的基类。

常见集合类：

| 集合 | 简述 |
|:----|:----|
| 动态数组（ArrayList）|	它代表了可被单独索引的对象的有序集合。它基本上可以替代一个数组。但是，与数组不同的是，您可以使用索引在指定的位置添加和移除项目，动态数组会自动重新调整它的大小。它也允许在列表中进行动态内存分配、增加、搜索、排序各项。|
| 哈希表（Hashtable）|	它使用键来访问集合中的元素。当您使用键访问元素时，则使用哈希表，而且您可以识别一个有用的键值。哈希表中的每一项都有一个键/值对。键用于访问集合中的项目。|
| 排序列表（SortedList）	| 它可以使用键和索引来访问列表中的项。排序列表是数组和哈希表的组合。它包含一个可使用键或索引访问各项的列表。如果您使用索引访问各项，则它是一个动态数组（ArrayList），如果您使用键访问各项，则它是一个哈希表（Hashtable）。集合中的各项总是按键值排序。|
| 堆栈（Stack）| 它代表了一个后进先出的对象集合。当您需要对各项进行后进先出的访问时，则使用堆栈。当您在列表中添加一项，称为推入元素，当您从列表中移除一项时，称为弹出元素。|
| 队列（Queue）| 它代表了一个先进先出的对象集合。当您需要对各项进行先进先出的访问时，则使用队列。当您在列表中添加一项，称为入队，当您从列表中移除一项时，称为出队。|
| 点阵列（BitArray）|	它代表了一个使用值 1 和 0 来表示的二进制数组。当您需要存储位，但是事先不知道位数时，则使用点阵列。您可以使用整型索引从点阵列集合中访问各项，索引从零开始。|


(此处暂时个人认为集合类应该是Java设计的更好一点。所谓的术业有专攻大概就是这个意思。Java中ArrayList、LinkedList侧重点不同。)

学习的时候多看些源码。这玩意不难，就是个类而已。

```c#
[Serializable]
public class ArrayList : IList, ICloneable, ICollection, IEnumerable
{
   //...
}
```

## ArrayList

备注：

1. ArrayList 没有重载 `ToString()`， 直接打印无意义。

2. 对于 Sort 的设计和Java类似

```c#
public virtual void Sort (int index, int count, IComparer comparer);

public virtual void Sort (IComparer comparer);

public virtual void Sort ();
```

- ArrayListDemo.cs

> [字符串拼接性能](http://www.cnblogs.com/cad2/p/4386048.html)

```c#
using System;
using System.Collections;
using System.Text;

namespace RYO.Collection
{

	public class ArrayListUtil
	{
		public static string ToString(ArrayList arrayList)
		{
			int count = arrayList.Count;
			if (count == 0)
			{
				return "[]";
			}

			StringBuilder stringBuilder = new StringBuilder();
			stringBuilder.Append("[");
			foreach (object obj in arrayList)
			{
				stringBuilder.Append(obj).Append(",").Append(" ");
			}

			//Remove the last , append;
			stringBuilder.Remove(stringBuilder.Length-2, 2);
			stringBuilder.Append("]");

			return stringBuilder.ToString();
		}

		public static void Print(ArrayList arrayList)
		{
			Console.WriteLine(ToString(arrayList));
		}
	}

	public class ArrayListDemo
	{
		//[9, 5, 2, 7]
		//After sort:
		//[2, 5, 7, 9]
		static void Main(string[] args)
		{
			ArrayList arrayList = new ArrayList();
			arrayList.Add(9);
			arrayList.Add(5);
			arrayList.Add(2);
			arrayList.Add(7);

			ArrayListUtil.Print(arrayList);

			arrayList.Sort();

			Console.WriteLine("After sort:");
			ArrayListUtil.Print(arrayList);
		}
	}
}
```


## Hashtable

备注：

1. Key 不可为 NULL

2. 不可重复放置相同的 KEY

- HashTableDemo.cs

```c#
public class HashTableDemo
{
    static void Main(string[] args)
    {
        Hashtable table = new Hashtable();
        //table.Add(null, "can it be null?");
        table.Add("key", "v");
        //table.Add("key", "can it be add twice?");

        // 获取键的集合 
        ICollection key = table.Keys;
        foreach (string k in key)
        {
            Console.WriteLine(k + ": " + table[k]);
        }
    }
}
```


# Generic

泛型（Generic） 允许您延迟编写类或方法中的编程元素的数据类型的规范，直到实际在程序中使用它的时候。换句话说，泛型允许您编写一个可以与任何数据类型一起工作的类或方法。

您可以通过数据类型的替代参数编写类或方法的规范。当编译器遇到类的构造函数或方法的函数调用时，它会生成代码来处理指定的数据类型。下面这个简单的实例将有助于您理解这个概念：


(和Java中的泛型类似。不过Java中的数组不支持泛型)

- GenericDemo.cs

```c#
using System;
using System.Text;

namespace RYO.Collection
{

	public class GenericArray<T>
	{
		private T[] array;

		public GenericArray(int size)
		{
			array = new T[size];
		}

		public T GetItem(int index)
		{
			return array[index];	
		}

		public void SetItem(int index, T value)
		{
			array[index] = value;
		}

		public override string ToString()
		{
			StringBuilder sb = new StringBuilder();
			foreach (T t in array)
			{
				sb.Append(t).Append(" ");
			}
			return sb.ToString();
		}
	}

	public class GenericDemo
	{
		//int array info: 1 2 0 0 0 
		//string array info: hello
		static void Main(string[] args)
		{
			GenericArray<int> gai = new GenericArray<int>(5);
			gai.SetItem(0, 1);
			gai.SetItem(1, 2);

			Console.WriteLine("int array info: {0}", gai);

			GenericArray<string> gas = new GenericArray<string>(2);
			gas.SetItem(0, "hello");
			Console.WriteLine("string array info: {0}", gas);
		}
	}
}
```

一、泛型（Generic）的特性

使用泛型是一种增强程序功能的技术，具体表现在以下几个方面：

- 它有助于您最大限度地重用代码、保护类型的安全以及提高性能。

- 您可以创建泛型集合类。.NET 框架类库在 **System.Collections.Generic** 命名空间中包含了一些新的泛型集合类。您可以使用这些泛型集合类来替代 **System.Collections** 中的集合类。

- 您可以创建自己的泛型接口、泛型类、泛型方法、泛型事件和泛型委托。

- 您可以对泛型类进行约束以访问特定数据类型的方法。

- 关于泛型数据类型中使用的类型的信息可在运行时通过使用反射获取。


二、泛型方法

我们可以通过类型参数声明泛型方法。

- GenericMethod.cs

```c#
using System;
namespace RYO.Collection
{
	public class GenericMethod
	{
		public static void Swap<T>(ref T first, ref T second)
		{
			T temp = first;
			first = second;
			second = temp;
		}

		public static void Show<T>(T first, T second)
		{
			Console.WriteLine("First: {0}, Second: {1}", first, second);
		}

		//First: 200, Second: 100
		//First: world, Second: hello
		static void Main(string[] args)
		{
			int a = 100;
			int b = 200;
			Swap(ref a, ref b);
			Show(a, b);

			string one = "hello";
			string two = "world";
			Swap(ref one, ref two);
			Show(one, two);
		}

	}
}
```

三、泛型（Generic）委托

- GenericDelegate.cs

```c#
using System;
namespace RYO.Collection
{
	/// <summary>
	/// Value change delegate of generic.
	/// </summary>
	public delegate T ValChangeDelegate<T>(T val);

	public class GenericDelegate
	{
		private static int num = 10;


		public static void ShowNum()
		{
			Console.WriteLine("num value is :{0}", num);
		}

		public static int Add(int val)
		{
			num += val;
			return num;
		}

		public static int Multi(int val)
		{
			num *= val;
			return num;
		}

		//num value is :10
		//num value is :20
		//num value is :80
		static void Main(string[] args)
		{
			ValChangeDelegate<int> csdAdd = new ValChangeDelegate<int>(GenericDelegate.Add);
			ValChangeDelegate<int> csdMulti = new ValChangeDelegate<int>(GenericDelegate.Multi);

			ShowNum();
			csdAdd(10);
			ShowNum();

			csdMulti(4);
			ShowNum();
		}
	}
}
```

* any list
{:toc}











