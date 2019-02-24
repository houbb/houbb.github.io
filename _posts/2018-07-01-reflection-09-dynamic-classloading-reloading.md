---
layout: post
title:  Reflection-09-dynamic classLoading & ReLoading 动态类加载和重新加载
date:  2018-07-01 17:07:11 +0800
categories: [Java]
tags: [java, reflect]
published: true
---

# Java反射——动态类加载和重新加载

可以在Java中运行时加载和重新加载类，尽管它并不像人们希望的那样简单。 

本文将解释何时以及如何在Java中加载和重载类。

您可以争论Java的动态类加载功能是否真的是Java Reflection的一部分，或者是核心Java平台的一部分。 

无论如何，这篇文章已被放入Java Reflection小道，因为它缺乏一个更好的地方。

# ClassLoader

Java应用程序中的所有类都使用java.lang.ClassLoader的某个子类加载。

因此，动态加载类也必须使用java.lang.ClassLoader子类来完成。
  
 加载类时，它引用的所有类也都会加载。此类加载模式以递归方式发生，直到加载所需的所有类。
 
 这可能不是应用程序中的所有类。在引用它们之前，不会加载未引用的类。
  
# ClassLoader层次结构
 
Java中的类加载器被组织成层次结构。创建新的标准Java ClassLoader时，必须为其提供父ClassLoader。

如果要求ClassLoader加载一个类，它将要求其父类加载器加载它。如果父类加载器找不到该类，则子类加载器会尝试自己加载它。
  
# Class Loading 

给定类加载器在加载类时使用的步骤是：
  
1. 检查该类是否已加载。

2. 如果未加载，请让父类加载器加载该类。

3. 如果父类加载器无法加载类，请尝试在此类加载器中加载它。

4. 当您实现一个能够重新加载类的类加载器时，您需要偏离此序列。不应由父类加载器请求加载要重新加载的类。稍后会详细介绍。

# 动态类加载

动态加载类很容易。 

您需要做的就是获取ClassLoader并调用其loadClass()方法。 

这是一个例子：

```java
public class MainClass {

  public static void main(String[] args){

    ClassLoader classLoader = MainClass.class.getClassLoader();

    try {
        Class aClass = classLoader.loadClass("com.jenkov.MyClass");
        System.out.println("aClass.getName() = " + aClass.getName());
    } catch (ClassNotFoundException e) {
        e.printStackTrace();
    }

}
```

# 动态类重新加载

动态类重新加载更具挑战性。 

Java的内置类加载器总是在加载之前检查类是否已经加载。 

因此，使用Java的内置类加载器无法重新加载类。 

要重新加载类，您必须实现自己的ClassLoader子类。
  
即使使用ClassLoader的自定义子类，您也会遇到挑战。 

每个加载的类都需要链接。 

这是使用ClassLoader.resolve() 方法完成的。 

此方法是最终的，因此无法在ClassLoader子类中重写。 

resolve() 方法不允许任何给定的ClassLoader实例两次链接同一个类。 

因此，每次要重新加载类时，都必须使用ClassLoader子类的新实例。 

这不是不可能的，但在设计类重装时必须知道。

# 为类重新加载设计代码

如前所述，您无法使用已加载该类一次的ClassLoader重新加载类。 

因此，您必须使用不同的ClassLoader实例重新加载该类。 

但这带来了新的挑战。
  
Java应用程序中加载的每个类都由其完全限定名称（包名称+类名称）以及加载它的ClassLoader实例标识。 

这意味着，类加载器A加载的类MyObject与加载类加载器B的MyObject类不是同一个类。

看看这段代码：

```java
MyObject object = (MyObject)
    myClassReloadingFactory.newInstance("com.jenkov.MyObject");
```

请注意代码中如何引用MyObject类作为对象变量的类型。 

这导致MyObject类由加载此代码所在类的相同类加载器加载。

如果myClassReloadingFactory对象工厂使用与上述代码所在的类不同的类加载器重新加载MyObject类，则无法将重新加载的MyObject类的实例强制转换为对象变量的MyObject类型。 

由于两个MyObject类加载了不同的类加载器，因此它们被视为不同的类，即使它们具有相同的完全限定类名。 

尝试将一个类的对象强制转换为另一个类的对象将导致ClassCastException。

可以解决此限制，但您必须以两种方式之一更改代码：

1. 使用接口作为变量类型，只需重新加载实现类。

2. 使用超类作为变量类型，只需重新加载子类。

```java
MyObjectInterface object = (MyObjectInterface)
    myClassReloadingFactory.newInstance("com.jenkov.MyObject");
```

```java
MyObjectSuperclass object = (MyObjectSuperclass)
    myClassReloadingFactory.newInstance("com.jenkov.MyObject");
```

如果在重新加载实现类或子类时不重新加载变量，接口或超类的类型，则这两种方法中的任何一种都可以工作。

为了完成这项工作，您当然需要实现您的类加载器，以使其父级加载接口或超类。 

当要求您的类加载器加载MyObject类时，还会要求它加载MyObjectInterface类或MyObjectSuperclass类，因为它们是从MyObject类中引用的。 

您的类加载器必须将这些类的加载委托给加载包含接口或超类类型变量的类的同一个类加载器。

# ClassLoader加载/重新加载示例

上面的文字包含了很多话题。 

我们来看一个简单的例子。 下面是一个简单的ClassLoader子类的示例。 

注意它如何将类加载委托给它的父类，除了它能够重新加载的一个类。 

如果将此类的加载委托给父类加载器，则以后不能重新加载。 

请记住，类只能由同一个ClassLoader实例加载一次。
  
如前所述，这只是一个示例，用于向您展示ClassLoader行为的基础知识。 

它不是您自己的类加载器的生产就绪模板。 您自己的类加载器可能不应限于单个类，而是您知道需要重新加载的类的集合。 

此外，您可能不应该对类路径进行硬编码。

```java
public class MyClassLoader extends ClassLoader{

    public MyClassLoader(ClassLoader parent) {
        super(parent);
    }

    public Class loadClass(String name) throws ClassNotFoundException {
        if(!"reflection.MyObject".equals(name))
                return super.loadClass(name);

        try {
            String url = "file:C:/data/projects/tutorials/web/WEB-INF/" +
                            "classes/reflection/MyObject.class";
            URL myUrl = new URL(url);
            URLConnection connection = myUrl.openConnection();
            InputStream input = connection.getInputStream();
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            int data = input.read();

            while(data != -1){
                buffer.write(data);
                data = input.read();
            }

            input.close();

            byte[] classData = buffer.toByteArray();

            return defineClass("reflection.MyObject",
                    classData, 0, classData.length);

        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }

}
```

下面是使用 ClassLoader 的例子：

```java
public static void main(String[] args) throws
    ClassNotFoundException,
    IllegalAccessException,
    InstantiationException {

    ClassLoader parentClassLoader = MyClassLoader.class.getClassLoader();
    MyClassLoader classLoader = new MyClassLoader(parentClassLoader);
    Class myObjectClass = classLoader.loadClass("reflection.MyObject");

    AnInterface2       object1 =
            (AnInterface2) myObjectClass.newInstance();

    MyObjectSuperClass object2 =
            (MyObjectSuperClass) myObjectClass.newInstance();

    //create new class loader so classes can be reloaded.
    classLoader = new MyClassLoader(parentClassLoader);
    myObjectClass = classLoader.loadClass("reflection.MyObject");

    object1 = (AnInterface2)       myObjectClass.newInstance();
    object2 = (MyObjectSuperClass) myObjectClass.newInstance();

}
```

这是使用类加载器加载的reflection.MyObject类。 注意它如何扩展超类并实现接口。 

这只是为了举例。 

在您自己的代码中，您只需要两个中的一个 - 扩展或实现。

```java
public class MyObject extends MyObjectSuperClass implements AnInterface2{
    //... body of class ... override superclass methods
    //    or implement interface methods
}
```


# 个人总结

实际上这一节内容应该放在 JVM 中，这里有些跨域了。

# 参考资料

http://tutorials.jenkov.com/java-reflection/dynamic-class-loading-reloading.html

