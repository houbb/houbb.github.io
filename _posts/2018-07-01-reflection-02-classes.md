---
layout: post
title:  Reflection-02-classes 类信息
date:  2018-07-01 17:07:11 +0800
categories: [Java]
tags: [java, reflect]
published: true
---

# Class 类信息

在运行时，你可以用Java反射检查Java类。当你使用反射时，你经常做的第一件事是检查类。从类中你可以获取下列相关信息：

Class Name
Class Modifies (public, private, synchronized etc.)
Package Info
Superclass
Implemented Interfaces
Constructors
Methods
Fields
Annotations

再加上很多和Java类相关的信息。如果想要完整的列表，你应该去查阅java.lang.Class的JavaDoc。

本篇文章将会简要地涉及上述提到的信息。一些主题也会在单独的文章中做更详细地研究。

例如，本文将会告诉你怎么获取所有的方法或者一个特定的方法，而在其他单独的文章中将会告诉你如何调用该方法，在多个方法拥有相同方法名的情况下如何找到和给定参数匹配的方法，通过反射调用一个方法时会抛出什么异常，如何识别出getter/setter方法等。这篇文章的目的主要是为了介绍Class对象以及你可以从中获取哪些信息。

# The Class Object

在你能对一个类做任何检查之前，你需要获取该类的java.lang.Class对象。

Java中包括原始类型（int, long, float, etc.）和数组在内的所有类型都有一个相关联的Class对象。

如果你在编译的时候知道一个类的类名，你可以像下面这样获取一个Class对象：

```java
Class myObjectClass = MyObject.class;
```

如果在编译的时候你不知道类名，但是在运行时有一个字符串形式的类名，你可以这样做：

```java
String className = ... //obtain class name as string at runtime Class class = Class.forName(className);
```

当使用 `Class.forName()` 方法时，你必须提供完整有效的类名。这个类名包括完整的包名。

例如，如果MyObject位于包com.jenkov.myapp中，那么完整有效的类名为com.jenkov.myapp.MyObject。

运行时，如果该类在classpath中找不到，则Class.forName()方法会抛ClassNotFoundException。

# Class Name

  从一个Class对象中，你可以得到两种类名。像下面这样通过getName()方法可以得到完成有效的类名（包括包名）：
  
```java
Class aClass = ... //obtain Class object. See prev. section
String className = aClass.getName();
```
如果你想要获取不包含包名的类名，你可以像下面这样使用getSimpleName()方法获取：

```java
Class  aClass = ... //obtain Class object. See prev. section
String simpleClassName = aClass.getSimpleName();
```  

# Modifiers

你可以通过Class对象访问类的修饰符。类的修饰符即“public”、“private”、“static”等关键字。

你可以像这样获取类的修饰符：

```java
Class  aClass = ... //obtain Class object. See prev. section
int modifiers = aClass.getModifiers();
```

修饰符被打包成一个int，每个修饰符是一个标志位，可以被置位或清零。

你可以用java.lang.reflect.Modifier中的这些方法来检查修饰符：

```java
Modifier.isAbstract(int modifiers)
Modifier.isFinal(int modifiers)
Modifier.isInterface(int modifiers)
Modifier.isNative(int modifiers)
Modifier.isPrivate(int modifiers)
Modifier.isProtected(int modifiers)
Modifier.isPublic(int modifiers)
Modifier.isStatic(int modifiers)
Modifier.isStrict(int modifiers)
Modifier.isSynchronized(int modifiers)
Modifier.isTransient(int modifiers)
Modifier.isVolatile(int modifiers)
```

# Package Info

你可以像这样从Class对象中获取包的相关信息：

```java
Class  aClass = ... //obtain Class object. See prev. section
Package package = aClass.getPackage();
```
  
从Package对象中，你可以访问像包名这样的信息。你也可以访问在classpath中的JAR包中Manifest文件所指定的该包的信息。
       
例如，你可以在Manifest文件中指定包的版本号。你可以从java.lang.Package中阅读更多和Package类相关的信息。 

# Superclass

你可以用Class对象访问超类。如下：

```java
Class superclass = aClass.getSuperclass();
```  
  
超类的Class对象和其他类的Class对象一样，所以你也可以继续在超类上用类的反射。

# Implemented Interfaces

可以得到一个给定类实现的接口的列表。如下：

```java
Class  aClass = ... //obtain Class object. See prev. section
Class[] interfaces = aClass.getInterfaces();
```

一个类可以实现多个接口。因此会返回一个Class类型的数组。

在Java反射机制中，接口也是由Class对象来表示的。

注：只有被给定类特别声明实现过的接口才会被返回。

如果一个超类实现了一个接口，但是该类没有特别声明它已经实现了这个接口，那么这个接口不会出现在返回的数组中。

即使该类实际上在它的超类中实现过该接口。要获取一个给定类的完整的所实现接口的列表，你将不得不递归的去查询该类以及它的超类。

# Constructors

你可以像这样访问一个类的构造函数：

```java
Constructor[] constructors = aClass.getConstructors();
```  
  
构造函数在 Java反射——构造函数 中会有详细介绍。

# Methods

你可以像这样访问一个类的方法：

```java
Method[] method = aClass.getMethods();
```  
  
方法在 Java反射——方法 中会有详细介绍。

# Fields

你可以像这样访问类的字段（成员变量）：

```java
Field[] method = aClass.getFields();
```  
  
字段在 Java反射——字段 中会有详细介绍。

# Annotations

你可以像这样访问类的注解：

```java
Annotation[] annotations = aClass.getAnnotations();
```

注解在 Java反射——注解 中会有详细介绍。

# 参考资料

http://tutorials.jenkov.com/java-reflection/index.html
