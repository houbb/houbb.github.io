---
layout: post
title:  Reflection-07-array 数组
date:  2018-07-01 17:07:11 +0800
categories: [Java]
tags: [java, reflect]
published: true
---

# Java反射——数组

用Java反射来处理数组有时候是技巧性很强的。

特别是如果你需要获取一个给定类型的数组的Class对象，像int[]等。

本文将讲述怎么用Java反射来创建数组和获取数组的Class对象。

下面是所涵盖的主题列表：

java.lang.reflect.Array 
Creating Arrays 
Accessing Arrays
Obtaining the Class Object of an Array
Obtaining the Component Type of an Array
     
# java.lang.reflect.Array 

通过Java反射来处理数组需要用到java.lang.reflect.Array类。

不要和Java集合中的java.util.Arrays类搞混淆了，它包含一些工具方法，像给数组排序、将数组转换成集合等。

# 创建数组
 
通过Java反射来创建数组需要用到java.lang.reflect.Array类。

下面的这个例子中会展示如何去创建一个数组：

```java
int[] intArray = (int[]) Array.newInstance(int.class, 3);
```

这段代码示例创建了一个int型的数组。

Array.newInstance() 方法的第一个参数int.class指定了数组中的每个元素应该是什么类型。

第二个参数声明了该数组应该为多少个元素开辟空间。

# 访问数组元素

也可以通过Java反射来访问数组中的元素。这是通过Array.get(…)和Array.set(…)方法做到的。

下面是一个例子：

```java
int[] intArray = (int[]) Array.newInstance(int.class, 3);

Array.set(intArray, 0, 123);
Array.set(intArray, 1, 456);
Array.set(intArray, 2, 789);

System.out.println("intArray[0] = " + Array.get(intArray, 0));
System.out.println("intArray[1] = " + Array.get(intArray, 1));
System.out.println("intArray[2] = " + Array.get(intArray, 2));
```

# 通过Java反射获得数组的Class对象

如何通过Java反射获得数组的Class对象。不用反射你可以这样做：

```java
Class stringArrayClass = String[].class;
```

对数组用Class.forName()不是很直观。

例如，你可以像这样访问基本类型数组的Class对象：

```java
Class intArray = Class.forName("[I");
```

JVM中用字母I代表int。在左边加上[（左中括号）表示我比较感兴趣的int数组的类。

这对所有其他的基本类型同样有效。

对于对象，你需要用一个稍微不同的符号：  

```java
Class stringArrayClass = Class.forName("[Ljava.lang.String;");
```

注意类名左边的 `[L` 和右边的分号(`;`)。这表示一个你指定类型的对象的数组。

附注，你不能用Class.forName()获取基本类型的Class对象。

下面的例子都会导致ClassNotFoundException:

```java
Class intClass1 = Class.forName("I");
Class intClass2 = Class.forName("int");
```

## 获取基本类型和对象的类名

我通常像这样做来获取基本类型和对象的类型名：

```java
public Class getClass(String className){
  if("int" .equals(className)) return int .class;
  if("long".equals(className)) return long.class;
  ...
  return Class.forName(className);
}
```

## 获取对应类型的数组

一旦你获取了一种类型的Class对象，你也可以很简单的获取一个数组类型的Class对象。

方案，或者你叫它变通措施，是先创建一个你期望的类型的空数组，然后从这个空数组获取它的Class对象。

这感觉有作弊的嫌疑，但是很有效。

下面是它看起来的样子：

 
```java
Class theClass = getClass(theClassName);
Class stringArrayClass = Array.newInstance(theClass, 0).getClass();
```

这代表一个单一的、统一的访问任何类类型的数组。没有摆弄类名等。

为了确认该Class对象的确是一个数组，你可以调用Class.isArray()来检查：

```java
Class stringArrayClass = Array.newInstance(String.class, 0).getClass();
System.out.println("is array: " + stringArrayClass.isArray());
```

# 获取数组元素类型

一旦你获取了数组的Class对象，你可以通过Class.getComponentType()方法访问它的元素类型。

元素类型是数组中元素的类型。

例如，int[]数组的元素类型是int.class的Class对象。

String[]数组的元素类型是java.lang.String的Class对象。

下面是一个访问数组元素类型的例子：

```java
String[] strings = new String[3];
Class stringArrayClass = strings.getClass();
Class stringArrayComponentType = stringArrayClass.getComponentType();
System.out.println(stringArrayComponentType);
```

这个例子将会输出String数组的元素类型"java.lang.String"。

# 参考资料

http://tutorials.jenkov.com/java-reflection/index.html

