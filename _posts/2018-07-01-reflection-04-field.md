---
layout: post
title:  Reflection-04-field 字段
date:  2018-07-01 17:07:11 +0800
categories: [Java]
tags: [java, reflect]
published: true
---

# Java反射——字段

使用java反射，你可以在运行时检查类的字段（成员变量）并且get/set它们的值。这些是通过Java类java.lang.reflect.Field做的。

本文将会给出更详细的关于Field对象的信息。请记住也去查阅Sun的JavaDoc。

下面是主题列表：

Obtaining Field Objects （获取Field对象）
Field Name （字段名）
Field Type （字段类型）
Getting and Setting Field Values （get/set字段的值）

# 获取 Field 对象

从Class对象中获取Field对象。这里有一个例子：

```java
Class aClass = ...//obtain class object
Field[] fields = aClass.getFields();
```

数组 fields 将会存储在类中声明的所有为public的字段的Field对象。

如果你知道你想要访问的字段的字段名，你可以像这样来访问它：

```java
Class  aClass = MyObject.class
Field field = aClass.getField("someField");
```

上面的例子将会返回Field实例，和下面MyObject声明的字段someField对应：

```java
public class MyObject{
  public String someField = null;
}
```

如果不存在和方法 `getField()` 接受的参数一致的字段，会抛出NoSuchFieldException异常。


# 字段名

一旦你获取了一个Field实例，你可以像这样通过Field.getName()方法取得字段名：

```java
Field field = ... //obtain field object
String fieldName = field.getName();
```

# 字段类型

你可以通过Field.getType() 方法取得字段类型（String, int etc.) ：

```java
Field field = aClass.getField("someField");
Object fieldType = field.getType();
```

# 字段值的获取和设置

一旦你获取了Field对象的引用，你可以像这样通过Field.get()方法和Field.set()方法get/set字段的值：

```java
Class  aClass = MyObject.class
Field field = aClass.getField("someField");
MyObject objectInstance = new MyObject();
Object value = field.get(objectInstance);
field.set(objectInstance, value);
```

传给get和set方法的参数objectInstance必须是拥有该字段的实例。

在上面的例子中，用了一个MyObject的实例，因为someField是类MyObject的成员实例。

如果字段是静态字段（public static …），则传null作为get和set方法的参数，而不是上面传的objectInstance。

# 私有字段

尽管普遍的观点是不能直接访问私有字段和私有方法的，实际上通过Java反射是可以访问其他类的私有字段和私有方法的。它甚至不是那么困难。在单元测试期间很容易使用。本文将介绍你怎么做。
注：这个只会作用在运行独立的Java应用程序时，如写单元测试和常规应用。

如果你尝试在Java Applet内使用它，你需要处理好SecurityManager。

但是，因为这不是你经常要做的事情，所以在本文中将不会涉及它。

为了访问私有字段，你需要调用Class.getDeclaredField(String name)方法或者Class.getDeclaredFields()方法。

Class.getField(String name)和Class.getFields()方法只会返回public的字段，所有它们不会工作。
 
## 代码
 
下面是一个简单的例子，通过Java反射去访问一个类的私有字段：
 
```java
public class PrivateObject {

  private String privateString = null;

  public PrivateObject(String privateString) {
    this.privateString = privateString;
  }
}

PrivateObject privateObject = new PrivateObject("The Private Value");

Field privateStringField = PrivateObject.class.getDeclaredField("privateString");

privateStringField.setAccessible(true);

String fieldValue = (String) privateStringField.get(privateObject);
System.out.println("fieldValue = " + fieldValue);
```

这段代码示例将会打印出文本“fieldValue = The Private Value”，是PrivateObject实例在代码示例最开始赋值给私有字段privateString的。

注意这里使用的方法PrivateObject.class.getDeclaredField("privateString")。

是这个方法调用返回了私有字段的值。这个方法只会返回在给定类里声明的字段的值，而不是其他任何在超类里声明的字段的值。

仅仅针对反射，通过调用 `Field.setAccessible(true)` 方法，关闭了对特定的Field实例的访问检查。

现在你可以访问它，尽管它是private，或者protected，或者是package scope，即使调用者不在这个范围内。

你仍然不能通过一般的代码去访问这些字段。编译器不允许这样干。

# 参考资料

http://tutorials.jenkov.com/java-reflection/index.html
