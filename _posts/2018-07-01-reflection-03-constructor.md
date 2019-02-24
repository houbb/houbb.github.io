---
layout: post
title:  Reflection-03-constructor 类构造器
date:  2018-07-01 17:07:11 +0800
categories: [Java]
tags: [java, reflect]
published: true
---

# Constructor 类构造器

使用Java反射，你可以在运行时检查类的构造函数和实例化对象。

这是通过Java类java.lang.reflect.Constructor做的。本文将会更详细的介绍Java中的Constructor对象。

下面是所涵盖的主题列表：
  
1. Obtaining Constructor Objects （获取Constructor对象）

2. Constructor Parameters （Constructor的参数）

3. Instantiating Objects using Constructor Object （通过Constructor对象实例化对象）

# Obtaining Constructor Objects

Constructor对象可以从Class对象中获取。

下面是一个例子：

```java
Class aClass = ...//obtain class object
Constructor[] constructors = aClass.getConstructors();
```

数组 constructors 将会存储在类中所有声明为public的构造函数的Constructor实例。

如果你知道你要访问的构造函数的精确参数类型，你可以这样做而不是获取所有的构造函数。

这个例子返回给定类的一个public的且接收一个String类型的变量作为参数的构造函数：

```java
Class aClass = ...//obtain class object
Constructor constructor = aClass.getConstructor(new Class[]{String.class});
```

如果没有和给定的参数相匹配的构造函数，会抛出NoSuchMethodException异常。

# Constructor Parameters

你可以像这样读取一个给定的构造函数所接收的参数：

```java
Constructor constructor = ... // obtain constructor - see above
Class[] parameterTypes = constructor.getParameterTypes();
```


# Instantiating Objects using Constructor Object

你可以像这样实例化一个对象：

```java
//get constructor that takes a String as argument
Constructor constructor = MyObject.class.getConstructor(String.class);
MyObject myObject = (MyObject) constructor.newInstance("constructor-arg1");
```

`Constructor.newInstance()` 方法接受不定个数的参数，但是你必须提供你调用的构造函数需要的每个参数。

在这种情况下，调用接受一个String类型参数的构造函数，你必须提供一个String类型的参数。

# 参考资料

http://tutorials.jenkov.com/java-reflection/index.html
