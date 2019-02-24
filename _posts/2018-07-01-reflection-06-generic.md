---
layout: post
title:  Reflection-06-generic 泛型
date:  2018-07-01 17:07:11 +0800
categories: [Java]
tags: [java, reflect]
published: true
---

# Java反射——泛型

我经常在一些文章和论坛中看有人说Java泛型信息都会在编译时被擦除，所以你不能在运行时访问任何相关的信息。
 
这也不完全对。在运行时，在少数情况下也是可以访问到泛型信息的。
 
实际上，这些情况中已经满足了我们对Java泛型信息的需求。
 
本文将解释这几种情况。
 
下面是本文所涵盖的主题列表：

The Generics Reflection Rule of Thumb （）
Generic Method Return Type (方法返回值类型的泛型）
Generic Method Parameter Types （方法参数类型的泛型）
Generic Field Types （字段类型的泛型）

# java 泛型反射的规则

使用Java泛型无外乎就下面两种情况中的一种：

Declaring a class/interface as being parameterizable. （声明类、接口参数化）

Using a parameterizable class.（使用参数化的类）

当你写一个类或者接口的时候，你可以指定它可以被参数化。java.util.List接口就是这种用法。

你可以使java.util.List参数化的创建一个String的列表，而不是创建一个Object的列表。

当在运行时检查参数化类型它自己的类型时，如java.util.List，没有办法知道它具体被参数化成了什么类型。

这样也合理，因为在同一应用程序中参数化的类型可以是所有类型。

但是，当你检查用参数化类型声明的方法或者字段时，你可以知道它们在运行时参数化成了什么类型。

简而言之：

在运行时，你不会知道参数化类型它自己的类型，但是你能知道用了参数化类型的字段和方法的类型。

换句话说，它们有具体的参数类型。

下面的部分我们将更进一步的来看这几种情况。

# 方法返回值类型的泛型

如果你获得了java.lang.reflect.Method对象，你也是有可能获得它的返回值类型的泛型信息的。

这不会是任何参数化类型的Method对象，除了在类里面使用了参数化类型。

你可以去看“Java泛型：方法”来了解如何获取Method对象。

下面是一个例子，类中有参数化返回值类型的返回值：

```java
public class MyClass {
  protected List<String> stringList = ...;
  public List<String> getStringList(){
    return this.stringList;
  }
}
```

在这种情况下，可以取得getStringList()方法的泛型返回值类型。

换句话说，是可以检测到getStringList()方法返回的是List<String>类型而不仅仅是List。

下面是如何来取：

```java
Method method = MyClass.class.getMethod("getStringList", null);
Type returnType = method.getGenericReturnType();
if(returnType instanceof ParameterizedType){
    ParameterizedType type = (ParameterizedType) returnType;
    Type[] typeArguments = type.getActualTypeArguments();
    for(Type typeArgument : typeArguments){
        Class typeArgClass = (Class) typeArgument;
        System.out.println("typeArgClass = " + typeArgClass);
    }
}
```

这段代码将会打印出“typeArgClass = java.lang.String”。

数组 typeArguments 中包含一个项——一个代表实现了Type接口的java.lang.String.Class的Class实例。

# 方法参数类型的泛型

在运行时，你也可以用Java反射机制访问泛型参数的类型。

下面是一个例子，类里面有一个参数化类型的参数：

```java
public class MyClass {
  protected List<String> stringList = ...;
  public void setStringList(List<String> list){
    this.stringList = list;
  }
}
```

你可以像这样来访问其方法参数的参数化类型：

```java
method = Myclass.class.getMethod("setStringList", List.class);
Type[] genericParameterTypes = method.getGenericParameterTypes();
for(Type genericParameterType : genericParameterTypes){
    if(genericParameterType instanceof ParameterizedType){
        ParameterizedType aType = (ParameterizedType) genericParameterType;
        Type[] parameterArgTypes = aType.getActualTypeArguments();
        for(Type parameterArgType : parameterArgTypes){
            Class parameterArgClass = (Class) parameterArgType;
            System.out.println("parameterArgClass = " + parameterArgClass);
        }
    }
}
```

这段代码将会打印出“parameterArgType = java.lang.String”。
 
数组parameterArgTypes中包含一个项——一个代表实现了Type接口的java.lang.String.Class的Class实例。

# 字段泛型类型

字段是类的成员变量——要么是静态变量，要么是实体变量。

你可以去看“Java泛型：字段”来了解如何获取Field对象。

下面是一个很早之前的例子，类中有有一个叫stringList的实体字段：

```java
public class MyClass {
  public List<String> stringList = ...;
}

Field field = MyClass.class.getField("stringList");
Type genericFieldType = field.getGenericType();
if(genericFieldType instanceof ParameterizedType){
    ParameterizedType aType = (ParameterizedType) genericFieldType;
    Type[] fieldArgTypes = aType.getActualTypeArguments();
    for(Type fieldArgType : fieldArgTypes){
        Class fieldArgClass = (Class) fieldArgType;
        System.out.println("fieldArgClass = " + fieldArgClass);
    }
}
```

这段代码将会打印出“fieldArgClass = java.lang.String”。

fieldArgTypes数组中包含一个项——一个代表实现了Type接口的java.lang.String.Class的Class实例。
     
# 参考资料

http://tutorials.jenkov.com/java-reflection/index.html

