---
layout: post
title:  Path for CShape
date:  2017-05-19 22:29:08 +0800
categories: [C#]
tags: [path, dotnet]
published: true
---


# 项目运行时路径

- Main()

```c#
Console.WriteLine(Environment.CurrentDirectory);
Console.WriteLine(AppDomain.CurrentDomain.BaseDirectory);
Console.WriteLine(System.Threading.Thread.GetDomain().BaseDirectory);


string appPath = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().GetModules()[0].FullyQualifiedName);
Console.WriteLine(appPath);

Console.ReadKey();
```

结果如下：

```
d:\我的文档\visual studio 2013\Projects\XmlTest\XmlTest\bin\Release
d:\我的文档\visual studio 2013\Projects\XmlTest\XmlTest\bin\Release\
d:\我的文档\visual studio 2013\Projects\XmlTest\XmlTest\bin\Release\
d:\我的文档\visual studio 2013\Projects\XmlTest\XmlTest\bin\Release
```

但是这些路径有一个缺点。那就是，他总是以 `EXE` 所在的路径为准。如果我想拿到项目本身的根路径，怎么办呢？


# 项目本身根路径

其实这个问题，我查了没有查到。但是考虑到 `Release/Debug` 两种模式下，项目的根路径都是当前路径的父类的父类。

所以下面的方法，也可以实现：

```c#
//1.当前目录的上级目录
string fullPathPath = Path.GetFullPath("../");
Console.WriteLine(fullPathPath);

//2. 当前目录的上级的上级目录
fullPathPath = Path.GetFullPath("../../");
Console.WriteLine(fullPathPath);
```

结果如下：

```
d:\我的文档\visual studio 2013\Projects\XmlTest\XmlTest\bin\
d:\我的文档\visual studio 2013\Projects\XmlTest\XmlTest\
```

