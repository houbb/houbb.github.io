---
layout: post
title: CShape-02-class 
date:  2017-04-09 21:44:46 +0800
categories: [C#]
tags: [cshape, cshape, lang, .net, dotnet]
published: true
---



# array

数组是一个存储相同类型元素的固定大小的顺序集合。数组是用来存储数据的集合，通常认为数组是一个**同一类型变量的集合**。

声明数组变量并不是声明 number0、number1、...、number99 一个个单独的变量，而是声明一个就像 numbers 这样的变量，
然后使用 numbers[0]、numbers[1]、...、numbers[99] 来表示一个个单独的变量。数组中某个指定的元素是通过索引来访问的。

所有的数组都是由连续的内存位置组成的。最低的地址对应第一个元素，最高的地址对应最后一个元素。


(各种语言的数组都是类似的)

一、声明数组

```
datatype[] arrayName;
```

- datatype 用于指定被存储在数组中的元素的类型。

- [] 指定数组的秩（维度）。秩指定数组的大小。

- arrayName 指定数组的名称。


二、初始化

声明一个数组不会在内存中初始化数组。当初始化数组变量时，您可以赋值给数组。
数组是一个引用类型，所以您需要使用 ```new``` 关键字来创建数组的实例。


```c#
double[] doubles = new double[10];
```

三、赋值给数组 & 访问元素

```c#
//2
//1.2
static void InitArray()
{
    double[] doubles = new double[10];
    doubles[0] = 1.2;

    //隐式调用了new 
    int[] ints = { 1, 2, 3};

    Console.WriteLine(ints[1]);
    Console.WriteLine(doubles[0]);
}
```

四、foreach

```c#
//0
//0
//0
//0
static void ForeachTest()
{ 
    double[] doubles = new double[4];

    //类似于 Java 增强的 for 循环
    foreach (double val in doubles)
    {
        Console.WriteLine(val);
    }
}
```

> 多维数组

C# 支持多维数组。多维数组又称为矩形数组。


声明一个 string 变量的二维数组:

```
string [,] names;
```

声明一个 int 变量的三维数组:

```
int [ , , ] m;
```

- TwoDimensionArray()

```c#
static void TwoDimensionArray()
{
    int[,] tdInts = new int[3, 4] { 
        {1, 2, 3, 4},
        {5, 6, 7, 8},
        {9, 10, 11, 12}
    };

    Console.WriteLine("array[1,1]={0}", tdInts[1,1]);   //array[1,1]=6
    Console.WriteLine("len: {0}", tdInts.Length);   //12

    //ints[0, 0] = 1     ints[0, 1] = 2     ints[0, 2] = 3     ints[0, 3] = 4
    //ints[1, 0] = 5     ints[1, 1] = 6     ints[1, 2] = 7     ints[1, 3] = 8
    //ints[2, 0] = 9     ints[2, 1] = 10    ints[2, 2] = 11    ints[2, 3] = 12
    for (int i = 0; i < 3; i++)
    {
        for (int j = 0; j < 4; j++)
        {
            Console.Write("ints[{0},{1}]={2} \t", i, j, tdInts[i,j]);
        }
        Console.WriteLine();
    }
}
```


> 交错数组

交错数组是数组的数组。您可以声明一个带有 int 值的交错数组 scores，如下所示：

```
int [][] scores;
```

声明一个数组不会在内存中创建数组。创建上面的数组:

```
int[][] scores = new int[5][];
for (int i = 0; i < scores.Length; i++) 
{
   scores[i] = new int[4];
}
```

初始化一个交错数组，如下所示：

```
int[][] scores = new int[2][]{new int[]{92,93,94},new int[]{85,66,87,88}};
```

其中，scores 是一个由两个 整型数组 组成的数组。scores[0] 是一个带有 3 个整数的数组，scores[1] 是一个带有 4 个整数的数组。


- InterlaceArray()

```c#
//ints[0][0]=1 	ints[0][1]=2 	ints[0][2]=3 	ints[0][3]=4 	
//ints[1][0]=5 	ints[1][1]=8 	ints[1][2]=7 	
static void InterlaceArray()
{
    const int rows = 2;

    int[][] ints = new int[rows][] { 
        new int[]{1,2,3,4},
        new int[]{5,8,7}
    };

    for (int i = 0; i < rows; i++)
    {
        for (int j = 0; j < ints[i].Length; j++)
        {
            Console.Write("ints[{0}][{1}]={2} \t", i, j, ints[i][j]);
        }
        Console.WriteLine();
    }
}
```

> 参数数组

有时，当声明一个方法时，您不能确定要传递给函数作为参数的参数数目。C# 参数数组解决了这个问题，参数数组通常用于传递未知数量的参数给函数。

(类似 Java 可变参数)

在使用数组作为形参时，C# 提供了 params 关键字，使调用数组为形参的方法时，既可以传递数组实参，也可以只传递一组数组。params 的使用格式为：

```
<access> 返回类型 方法名称( params 类型名称[] 数组名称 )
```

- StringUtil.cs

```c#
public class StringUtil
{
    private StringUtil()
    {
    }

    public const string EMPTY = "";

    public static bool IsEmpty(string str)
    {
        return null == str || EMPTY.Equals(str);
    }

    public static bool HasEmpty(params string[] arrays)
    {
        foreach (string str in arrays)
        {
            if (IsEmpty(str))
            {
                return true;
            }
        }
        return false;
    }

    //False	
    static void Main(string[] args)
    {
        bool result = HasEmpty("1", "asdfasd");
        Console.WriteLine(result);
    }
}
```


# string

一、创建 String 对象

(和 Java 类似)

- 通过给 String 变量指定一个字符串

- 通过使用 String 类构造函数

- 通过使用字符串串联运算符（ + ）

- 通过检索属性或调用一个返回字符串的方法

- 通过格式化方法来转换一个值或对象为它的字符串表示形式


# struct

在 C# 中，结构是值类型数据结构。它使得一个单一变量可以存储各种数据类型的相关数据。struct 关键字用于创建结构。

(老实说这是很老的结构， 类似C)


- Book.cs

```c#
struct Books
{
    public string title;
    public string author;
    public string subject;
    public int bookId;
};


public class BookStruct
{
    static void Main(string[] args)
    {
        Books bookOne;

        bookOne.author = "ryo";
        bookOne.bookId = 1;
        bookOne.title = "book one title";
        bookOne.subject = "book one subject";

        Console.WriteLine("book one subject:{0}", bookOne.subject);	//book one subject:book one subject
    }
}
```



> C# 结构的特点

您已经用了一个简单的名为 Books 的结构。在 C# 中的结构与传统的 C 或 C++ 中的结构不同。C# 中的结构有以下特点：

- 结构可带有方法、字段、索引、属性、运算符方法和事件。

- 结构可定义构造函数，但不能定义析构函数。但是，您不能为结构定义默认的构造函数。默认的构造函数是自动定义的，且不能被改变。

- 与类不同，结构不能继承其他的结构或类。

- 结构不能作为其他结构或类的基础结构。

- 结构可实现一个或多个接口。

- 结构成员不能指定为 abstract、virtual 或 protected。

- 当您使用 New 操作符创建一个结构对象时，会调用适当的构造函数来创建结构。与类不同，结构可以不使用 New 操作符即可被实例化。

- 如果不使用 New 操作符，只有在所有的字段都被初始化之后，字段才被赋值，对象才被使用。



> 类 vs 结构

类和结构有以下几个基本的不同点：

- 类是引用类型，结构是值类型。

- 结构不支持继承。

- 结构不能声明默认的构造函数。

(从某种角度上来说， 可以吧 struct 放弃掉)


# enum

枚举是一组命名整型常量。枚举类型是使用 enum 关键字声明的。
C# 枚举是值数据类型。换句话说，枚举包含自己的值，且不能继承或传递继承

(Java 中是因为 enum 已经继承过了。且Java为单继承)

> 声明 enum 变量

```
enum <enum_name>
{ 
    enumeration list 
};
```

- enum_name 指定枚举的类型名称。

- enumeration list 是一个用逗号分隔的标识符列表。

枚举列表中的每个符号代表一个整数值，一个比它前面的符号大的整数值。默认情况下，第一个枚举符号的值是 0.

例如：


```c#
public enum Days { 
    Sun, Mon, tue, Wed, thu, Fri, Sat	
};


public class DaysExe 
{
    static void Main(string[] args)
    {
        Console.WriteLine(Days.Fri);	//Fri
    }
}
```


# class

当您定义一个类时，您定义了一个数据类型的蓝图。这实际上并没有定义任何的数据，但它定义了类的名称意味着什么，也就是说，类的对象由什么组成及在这个对象上可执行什么操作。对象是类的实例。构成类的方法和变量成为类的成员。


> 类的定义

类的定义是以关键字 class 开始，后跟类的名称。类的主体，包含在一对花括号内。下面是类定义的一般形式： 

```
<access specifier> class  class_name 
{
    // member variables
    <access specifier> <data type> variable1;
    <access specifier> <data type> variable2;
    ...
    <access specifier> <data type> variableN;
    // member methods
    <access specifier> <return type> method1(parameter_list) 
    {
        // method body 
    }
    <access specifier> <return type> method2(parameter_list) 
    {
        // method body 
    }
    ...
    <access specifier> <return type> methodN(parameter_list) 
    {
        // method body 
    }
}
```

注意： 

- 访问标识符 <access specifier> 指定了对类及其成员的访问规则。如果没有指定，则使用默认的访问标识符。类的默认访问标识符是 **internal**，成员的默认访问标识符是 **private**。

- 数据类型 <data type> 指定了变量的类型，返回类型 <return type> 指定了返回的方法返回的数据类型。

- 如果要访问类的成员，您要使用点（.）运算符。

- 点运算符链接了对象的名称和成员的名称。

> 成员函数和封装

类的成员函数是一个在类定义中有它的定义或原型的函数，就像其他变量一样。作为类的一个成员，它能在类的任何对象上操作，且能访问该对象的类的所有成员。

成员变量是对象的属性（从设计角度），且它们保持私有来实现封装。这些变量只能使用公共成员函数来访问。


> C# 中的构造函数

类的 构造函数 是类的一个特殊的成员函数，当创建类的新对象时执行。
构造函数的名称与类的名称完全相同，它没有任何返回类型。
下面的实例说明了构造函数的概念:


```c#
public class Person
{
    private string name;
    private int age;

    public Person()
    {
    }

    public Person(string name, int age)
    {
        this.name = name;
        this.age = age;
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

    //default can not reach by outside;
    public int Age
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

    public void Display()
    { 
        Console.WriteLine("Name:{0}, Age:{1}", this.Age, this.Name);
    }
}


class PersonExe
{
    //Name:10, Age:ryo
    //Name:20, Age:other
    static void Main(string[] args)
    {
        Person person = new Person();
        person.Age = 10;
        person.Name = "ryo";

        person.Display();

        Person other = new Person("other", 20);
        other.Display();
    }
}
```

> C# 中的析构函数

类的 **析构函数** 是类的一个特殊的成员函数，当类的对象超出范围时执行。

析构函数的名称是在类的名称前加上一个波浪形```~```作为前缀，它不返回值，也不带任何参数。

析构函数用于在结束程序（比如关闭文件、释放内存等）之前释放资源。析构函数不能继承或重载。

- ~Person()

```c#
~Person()
{
    Console.WriteLine("person has removed");
}

//Name:20, Age:other
//person has removed
static void Main(string[] args)
{
    Person other = new Person("other", 20);
    other.Display();
}
```

> C# 类的静态成员

我们可以使用 static 关键字把类成员定义为静态的。当我们声明一个类成员为静态时，意味着无论有多少个类的对象被创建，**只会有一个该静态成员的副本**。

关键字 static 意味着类中只有一个该成员的实例。静态变量用于定义常量，因为它们的值可以通过**直接调用类**而不需要创建类的实例来获取。静态变量可在成员函数或类的定义外部进行初始化。您也可以在类的定义内部初始化静态变量。

您也可以把一个成员函数声明为 static。这样的函数只能访问静态变量。静态函数在对象被创建之前就已经存在。

(和 Java 类似)

* any list
{:toc}