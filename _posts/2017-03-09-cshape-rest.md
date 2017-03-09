---
layout: post
title: CShape-04-rest 
date:  2017-03-09 16:37:07 +0800
categories: [Programming Language]
tags: [cshape]
published: true
---

* any list
{:toc}

# 预处理命令

预处理器指令指导编译器在实际编译开始之前对信息进行预处理。

所有的预处理器指令都是以 `#` 开始。且在一行上，只有空白字符可以出现在预处理器指令之前。

预处理器指令不是语句，所以它们不以分号`;`结束。

C# 编译器没有一个单独的预处理器，但是，指令被处理时就像是有一个单独的预处理器一样。
在 C# 中，预处理器指令用于在条件编译中起作用。与 C 和 C++ 不同的是，它们不是用来创建宏。
一个预处理器指令必须是该行上的唯一指令。

(这种预处理命令应该摒弃掉)

一、指令列表

| 预处理器指令	| 描述 |
|:---|:---|
| #define		| 它用于定义一系列成为符号的字符。|
| #undef		| 它用于取消定义符号。|
| #if			| 它用于测试符号是否为真。|
| #else			| 它用于创建复合条件指令，与 #if 一起使用。|
| #elif			| 它用于创建复合条件指令。|
| #endif		| 指定一个条件指令的结束。|
| #line			| 它可以让您修改编译器的行数以及（可选地）输出错误和警告的文件名。|
| #error		| 它允许从代码的指定位置生成一个错误。|
| #warning		| 它允许从代码的指定位置生成一级警告。|
| #region		| 它可以让您在使用 Visual Studio Code Editor 的大纲特性时，指定一个可展开或折叠的代码块。|
| #endregion	| 它标识着 #region 块的结束。|

二、#define 预处理器

`#define` 预处理器指令创建符号常量。
`#define` 允许您定义一个符号，这样，通过使用符号作为传递给 `#if` 指令的表达式，表达式将返回 true。它的语法如下：

```
#define symbol
```


- DefineDemo.cs

```c#
#define PI

using System;

namespace cshape_test
{
	public class DefineDemo
	{
		//PI has been defined!
		static void Main(string[] args)
		{
			#if (PI)
				Console.WriteLine("PI has been defined!");
			#else
				Console.WriteLine("PI has not been defined!");
			#endif
		}
	}
}
```

三、条件指令

您可以使用 `#if` 指令来创建一个条件指令。条件指令用于测试符号是否为真。如果为真，编译器会执行 `#if` 和下一个指令之间的代码。

条件指令的语法：

```
#if symbol [operator symbol]...
```

其中，symbol 是要测试的符号名称。您也可以使用 true 和 false，或在符号前放置否定运算符。

运算符符号是用于评价符号的运算符。可以运算符可以是下列运算符之一：

- == (equality)

- != (inequality)

- && (and)

- `||` (or)

您也可以用括号把符号和运算符进行分组。条件指令用于在调试版本或编译指定配置时编译代码。
一个以 `#if` 指令开始的条件指令，必须显示地以一个 `#endif` 指令终止。

下面的程序演示了条件指令的用法：

- ConditionOrder()

```c#
#define NIGHT
#define VOICE

using System;

namespace cshape_test
{
	
	public class DefineDemo
	{
		//night and voice defined!
		static void ConditionOrder()
		{
			#if (NIGHT && VOICE)
				Console.WriteLine("night and voice defined!");
			#elif(!NIGHT && !VOICE)
				Console.WriteLine("night and voice not defined!");
			#endif
				
		}
	}
}
```

# 正则表达式

正则表达式 是一种匹配输入文本的模式。**.Net** 框架提供了允许这种匹配的正则表达式引擎。
模式由一个或多个字符、运算符和结构组成。

(正则表达式很多语言都支持， 并不是 C# 的专属。平时使用到再看也可。暂时跳过。)

一、定义正则表达式

下面列出了用于定义正则表达式的各种类别的字符、运算符和结构。

- 字符转义

- 字符类

- 定位点

- 分组构造

- 限定符

- 反向引用构造

- 备用构造

- 替换

- 杂项构造


二、Regex 实例

- RegexDemo.cs

```c#
using System;
using System.Text.RegularExpressions;

namespace cshape_test
{
	public class RegexDemo
	{
		//显示所有已S开头的单词
		static void ShowStartWithS(String text)
		{
			string regex = @"\bs\S{0,}";

			MatchCollection mc = Regex.Matches(text, regex);

			foreach (Match match in mc)
			{
				Console.WriteLine("match: {0}", match);
			}
		}

		//match: start
		//match: spring
		static void Main(string[] agrs)
		{
			String str = "hello world start from spring";
			ShowStartWithS(str);
		}
	}
}
```

# 异常处理

异常是在程序执行期间出现的问题。C# 中的异常是对程序运行时出现的特殊情况的一种响应，比如尝试除以零。

异常提供了一种把程序控制权从某个部分转移到另一个部分的方式。C# 异常处理时建立在四个关键词之上的：try、catch、finally 和 throw。

- try

一个 try 块标识了一个将被激活的特定的异常的代码块。后跟一个或多个 catch 块。

- catch
    
程序通过异常处理程序捕获异常。catch 关键字表示异常的捕获。
    
- finally
    
finally 块用于执行给定的语句，不管异常是否被抛出都会执行。例如，如果您打开一个文件，不管是否出现异常文件都要被关闭。
    
- throw

当问题出现时，程序抛出一个异常。使用 throw 关键字来完成。


一、语法

假设一个块将出现异常，一个方法使用 try 和 catch 关键字捕获异常。try/catch 块内的代码为受保护的代码，
使用 try/catch 语法如下所示：

```
try
{
   // 引起异常的语句
}
catch( ExceptionName e1 )
{
   // 错误处理代码
}
catch( ExceptionName e2 )
{
   // 错误处理代码
}
catch( ExceptionName eN )
{
   // 错误处理代码
}
finally
{
   // 要执行的语句
}
```

二、C# 中的异常类

C# 异常是使用类来表示的。C# 中的异常类主要是直接或间接地派生于 System.Exception 类。
System.ApplicationException 和 System.SystemException 类是派生于 System.Exception 类的异常类。

**System.ApplicationException** 类支持由应用程序生成的异常。所以程序员定义的异常都应派生自该类。

System.SystemException 类是所有预定义的系统异常的基类。

下表列出了一些派生自 Sytem.SystemException 类的预定义的异常类：


| 异常类	| 描述 |
|:---|:---|
| System.IO.IOException				| 处理 I/O 错误。|
| System.IndexOutOfRangeException	| 处理当方法指向超出范围的数组索引时生成的错误。|
| System.ArrayTypeMismatchException	| 处理当数组类型不匹配时生成的错误。|
| System.NullReferenceException		| 处理当依从一个空对象时生成的错误。|
| System.DivideByZeroException		| 处理当除以零时生成的错误。|
| System.InvalidCastException		| 处理在类型转换期间生成的错误。|
| System.OutOfMemoryException		| 处理空闲内存不足生成的错误。
| System.StackOverflowException		| 处理栈溢出生成的错误。|
 
 
 三、异常处理
 
C# 以 try 和 catch 块的形式提供了一种结构化的异常处理方案。使用这些块，把核心程序语句与错误处理语句分离开。

这些错误处理块是使用 try、catch 和 finally 关键字实现的。下面是一个当除以零时抛出异常的实例：


- ExceptionHandleDemo.cs

```c#
public class ExceptionHandleDemo

    static void Divide(int dividend, int divisor)
    {
        int result = 0;

        try
        {
            result = dividend / divisor;
        }
        catch (DivideByZeroException ex)
        {
            Console.WriteLine("Exception caught: {0}", ex);
        }
        finally 
        { 
            Console.WriteLine("Result: {0}", result);
        }
    }

//	Exception caught: System.DivideByZeroException: Attempted to divide by zero.
// at cshape_test.ExceptionHandleDemo.divide(System.Int32 dividend, System.Int32 divisor) [0x00004] in /Users/houbinbin/Projects/cshape_test/cshape_test/ExceptionHandleDemo.cs:17 
//Result: 0
    static void Main(string[] args)
    {
        Divide(10, 0);
    }
}
```

四、创建用户自定义异常

您也可以定义自己的异常。用户自定义的异常类是派生自 **ApplicationException** 类。
(C#中没有检查异常和运行时异常之别)

下面的实例演示了这点：


- MyException.cs

```c#
using System;
namespace cshape_test
{
	class MyException : ApplicationException
	{ 
		public MyException()
		{
		}

		public MyException(string message) : base(message)
		{
		}
	}


	public class ExceptionHandleDemo
	{
		static int MyExceptionTest(int dividend, int divisor)
		{
			if (0 == divisor)
			{
				throw new MyException("divisor can not be zero!");
			}

			return dividend / divisor;
		}

 //		Exception caught: cshape_test.MyException: divisor can not be zero!
 // 	at cshape_test.ExceptionHandleDemo.MyExceptionTest(System.Int32 dividend, System.Int32 divisor) [0x0000d] in /Users/houbinbin/Projects/cshape_test/cshape_test/ExceptionHandleDemo.cs:27 
 // 	at cshape_test.ExceptionHandleDemo.Main(System.String[] args) [0x00005] in /Users/houbinbin/Projects/cshape_test/cshape_test/ExceptionHandleDemo.cs:60 
		static void Main(string[] args)
		{
			try
			{
				int result = MyExceptionTest(10, 0);
			}
			catch (MyException ex)
			{
				Console.WriteLine("Exception caught: {0}", ex);
			}
		}
	}
}
```

五、抛出对象

如果异常是直接或间接派生自 **System.Exception** 类，您可以抛出一个对象。
您可以在 catch 块中使用 throw 语句来抛出当前的对象，如下所示：

```c#
Catch(Exception e)
{
   //...
   Throw e
}
```

# 文件的输入与输出

一个 **文件** 是一个存储在磁盘中带有指定名称和目录路径的数据集合。当打开文件进行读写时，它变成一个 **流**。
从根本上说，流是通过通信路径传递的字节序列。有两个主要的流：输入流 和 输出流。

**输入流**用于从文件读取数据（读操作）。

**输出流**用于向文件写入数据（写操作）。

(这类的知识比较多， 建议使用时学习)

一、I/O 类

System.IO 命名空间有各种不同的类，用于执行各种文件操作，如创建和删除文件、读取或写入文件，关闭文件等。

下表列出了一些 System.IO 命名空间中常用的非抽象类：

| I/O 类				| 描述 |
|:----|:----|
| BinaryReader		| 从二进制流读取原始数据。|
| BinaryWriter		| 以二进制格式写入原始数据。|
| BufferedStream	| 字节流的临时存储。|
| Directory			| 有助于操作目录结构。|
| DirectoryInfo		| 用于对目录执行操作。|
| DriveInfo			| 提供驱动器的信息。|
| File				| 有助于处理文件。|
| FileInfo			| 用于对文件执行操作。|
| FileStream		| 用于文件中任何位置的读写。|
| MemoryStream		| 用于随机访问存储在内存中的数据流。|
| Path				| 对路径信息执行操作。|
| StreamReader		| 用于从字节流中读取字符。|
| StreamWriter		| 用于向一个流中写入字符。|
| StringReader		| 用于读取字符串缓冲区。|
| StringWriter		| 用于写入字符串缓冲区。| 


> FileStream 类
 
System.IO 命名空间中的 FileStream 类有助于文件的读写与关闭。该类派生自抽象类 Stream。

您需要创建一个 FileStream 对象来创建一个新的文件，或打开一个已有的文件。创建 FileStream 对象的语法如下：

```
FileStream <object_name> = new FileStream( <file_name>,
<FileMode Enumerator>, <FileAccess Enumerator>, <FileShare Enumerator>);
```
 
(可见需要指定的参数比较多，所以可以编写点默认的文件工具类。应该有默认的)

1、**FileMode** 

枚举定义了各种打开文件的方法。FileMode 枚举的成员有：

- Append：打开一个已有的文件，并将光标放置在文件的末尾。如果文件不存在，则创建文件。

- Create：创建一个新的文件。如果文件已存在，则删除旧文件，然后创建新文件。

- CreateNew：指定操作系统应创建一个新的文件。如果文件已存在，则抛出异常。

- Open：打开一个已有的文件。如果文件不存在，则抛出异常。

- OpenOrCreate：指定操作系统应打开一个已有的文件。如果文件不存在，则用指定的名称创建一个新的文件打开。

- Truncate：打开一个已有的文件，文件一旦打开，就将被截断为零字节大小。
然后我们可以向文件写入全新的数据，但是保留文件的初始创建日期。如果文件不存在，则抛出异常。


2、**FileAccess**

枚举的成员有：Read、ReadWrite 和 Write。

3、**FileShare**

FileShare 枚举的成员有：

- Inheritable：允许文件句柄可由子进程继承。Win32 不直接支持此功能。

- None：谢绝共享当前文件。文件关闭前，打开该文件的任何请求（由此进程或另一进程发出的请求）都将失败。

- Read：允许随后打开文件读取。如果未指定此标志，则文件关闭前，任何打开该文件以进行读取的请求（由此进程或另一进程发出的请求）都将失败。
但是，即使指定了此标志，仍可能需要附加权限才能够访问该文件。

- ReadWrite：允许随后打开文件读取或写入。如果未指定此标志，则文件关闭前，任何打开该文件以进行读取或写入的请求（由此进程或另一进程发出）都将失败。
但是，即使指定了此标志，仍可能需要附加权限才能够访问该文件。

- Write：允许随后打开文件写入。如果未指定此标志，则文件关闭前，任何打开该文件以进行写入的请求（由此进程或另一进过程发出的请求）都将失败。
但是，即使指定了此标志，仍可能需要附加权限才能够访问该文件。

- Delete：允许随后删除文件。



> FileStreamDemo.cs


```c#
using System;
using System.IO;

namespace cshape_test
{
	public class FileStreamDemo
	{
		/// <summary>
		/// Reads the content of the file.
		/// </summary>
		/// <param name="filePath">File path.</param>
		static void ReadFileContent(String filePath)
		{
			FileStream stream = new FileStream(filePath,
			FileMode.OpenOrCreate, FileAccess.ReadWrite);

			for (int i = 1; i <= 20; i++)
			{
				stream.WriteByte((byte)i);
			}

			stream.Position = 0;

			for (int i = 0; i <= 20; i++)
			{
				Console.Write(stream.ReadByte() + " ");
			}
			stream.Close();
		}

		//1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 108 
		static void Main(string[] args)
		{
			string filePath = "/Users/houbinbin/mail.html";
			ReadFileContent(filePath);		
		}
	}
}
```


二、文本文件的读写

它涉及到文本文件的读写。StreamReader 和 StreamWriter 类有助于完成文本文件的读写。
这些类从抽象基类 Stream 继承，Stream 支持文件流的字节读写。

1、StreamReader 类

StreamReader 类继承自抽象基类 TextReader，表示阅读器读取一系列字符。

```c#
/// <summary>
/// Reads the first line by stream reader.
/// </summary>
/// <param name="filePath">File path.</param>
static void ReadFirstLineByStreamReader(string filePath)
{
    try
    {
        // 创建一个 StreamReader 的实例来读取文件 
        // using 语句也能关闭 StreamReader
        using (StreamReader sr = new StreamReader(filePath))
        {
            string firstLine = sr.ReadLine().Trim();
            Console.WriteLine("first line of file {0} is: {1}", filePath, firstLine);
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine("Read file of {0} has exception: {1}", filePath, ex);
    }
}

//first line of file /Users/houbinbin/ali.sh is: #!/bin/sh
static void Main(string[] args)
{
    string filePath = "/Users/houbinbin/ali.sh";
    ReadFirstLineByStreamReader(filePath);
}
```

2、StreamWriter  类

```c#
/// <summary>
/// Writes the file by stream writer.
/// </summary>
/// <param name="filePath">File path.</param>
/// <param name="content">Content to write</param>
static void WriteByStreamWriter(string filePath, string content)
{
    try
    {
        using (StreamWriter sw = new StreamWriter(filePath))
        {
            sw.WriteLine(content);
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine("Write file of {0} has exception: {1}", filePath, ex);
    }
}

static void Main(string[] args)
{
    string filePath = "/Users/houbinbin/WriteByStreamWriter.txt";
    string content = "hello WriteByStreamWriter";
    WriteByStreamWriter(filePath, content);
}
```

三、二进制文件的读写

它涉及到二进制文件的读写。BinaryReader 和 BinaryWriter 类有助于完成二进制文件的读写。

- BinaryDemo.cs

```c#
using System;
using System.IO;

namespace cshape_test
{
	public class BinaryRWDemo
	{
		private const string PATH = "/Users/houbinbin/binary.txt";

		static void BinaryWrite()
		{
			int i = 20;
			double d = 12.5;
			string str = "hello";

			FileStream fileStream = null;
			try
			{
				fileStream = new FileStream(PATH, FileMode.Create);
				BinaryWriter bw = new BinaryWriter(fileStream);
				bw.Write(i);
				bw.Write(d);
				bw.Write(str);
			}
			catch (IOException ex)
			{
				Console.WriteLine("Write of file {0} has meet exception :{1}", PATH, ex);	
			}
			finally
			{
				if (fileStream != null)
				{
					fileStream.Close();
				}
			}
		}

		

		//Read int is: 20
		//Read double is: 12.5
		//Read string is: hello
		static void Main(string[] args)
		{
			BinaryWrite();
		}
	}
}
```

直接用 TEXTLINE 打开文件内容为:

```
1400 0000 0000 0000 0000 2940 0568 656c
6c6f
```

- BinaryRead()

```c#
//Read int is: 20
//Read double is: 12.5
//Read string is: hello
static void BinaryRead()
{
    FileStream fileStream = null;
    try
    {
        fileStream = new FileStream(PATH, FileMode.Open);
        BinaryReader br = new BinaryReader(fileStream);

        int i = br.ReadInt32();
        Console.WriteLine("Read int is: {0}", i);

        double d = br.ReadDouble();
        Console.WriteLine("Read double is: {0}", d);

        string str = br.ReadString();
        Console.WriteLine("Read string is: {0}", str);
    }
    catch (Exception ex)
    {
        Console.WriteLine("Read of file {0} has meet exception :{1}", PATH, ex);
    }
    finally 
    {
        if (null != fileStream)
        {
            fileStream.Close();
        }	
    }

}
```

四、Windows 文件系统的操作

它让 C# 程序员能够浏览并定位 Windows 文件和目录。

```c#
using System;
using System.IO;

namespace cshape_test
{
	public class FileInfoDemo
	{

		/// <summary>
		/// Shows the dir info.
		/// </summary>
		/// <param name="dirPath">Dir path.</param>
		static void ShowDirInfo(string dirPath)
		{
			DirectoryInfo dir = new DirectoryInfo(dirPath);
			FileInfo[] files = dir.GetFiles();

			foreach (FileInfo file in files)
			{
				Console.WriteLine("Name: {0}, Size: {1}", file.FullName, file.Length);
			}
		}

		//Name: /Users/houbinbin/logs/.DS_Store, Size: 6148
		//Name: /Users/houbinbin/logs/test-log4j.log, Size: 0
		static void Main(string[] args)
		{
			string dirPath = "/Users/houbinbin/logs";
			ShowDirInfo(dirPath);
		}

	}
}
```










