---
layout: post
title:  JVM 常见面试题之双亲委派
date:  2022-05-10 09:22:02 +0800
categories: [Interview]
tags: [interview, jvm, sh]
published: true
---

# 系列目录

[spring 常见面试题](https://houbb.github.io/2022/05/10/interview-01-spring)

[spring-boot 常见面试题](https://houbb.github.io/2022/05/10/interview-02-springboot)

[redis 常见面试题](https://houbb.github.io/2022/05/10/interview-04-redis)

[mysql 常见面试题](https://houbb.github.io/2022/05/10/interview-05-mysql)

[mq 常见面试题](https://houbb.github.io/2022/05/10/interview-07-mq)

[rpc/dubbo 常见面试题](https://houbb.github.io/2022/05/10/interview-06-dubbo)

[ZooKeeper 面试题](https://houbb.github.io/2022/05/10/interview-08-zookeeper)

[JVM 常见面试题之双亲委派](https://houbb.github.io/2022/05/10/interview-09-jvm-classloader)

[JVM 常见面试题之 GC 垃圾回收](https://houbb.github.io/2022/05/10/interview-09-jvm-gc)

[JVM 常见面试题之 java 内存结构](https://houbb.github.io/2022/05/10/interview-09-jvm-struct)

[JVM 常见面试题之 java 内存结构2](https://houbb.github.io/2022/05/10/interview-11-java-jvm)

[【面试】mybatis 常见面试题汇总](https://houbb.github.io/2022/05/10/interview-03-mybatis)

[面试官：你们项目中是怎么做防重复提交的？](https://houbb.github.io/2022/05/10/interview-10-repeat)

[java 基础之 event 事件机制](https://houbb.github.io/2022/05/10/interview-11-java-basic-event)

[Reflection-01-java 反射机制](https://houbb.github.io/2018/07/01/reflection-01-overview)

[distributed 分布式相关专题汇总](https://houbb.github.io/2022/05/10/interview-11-java-distribute)

[web 常见面试题](https://houbb.github.io/2022/05/10/interview-11-java-web)

[其他常见面试题](https://houbb.github.io/2022/05/10/interview-12-other)

# 拓展阅读


# 前言

大家好，我是老马。

JVM 在面试中频率也比较高，对常见问题进行整理，便于平时查阅收藏。


# 双亲委派

## 定义

双亲委派机制定义：当一个类加载器收到了类加载的请求的时候，他不会直接去加载指定的类，而是把这个请求委托给自己的父加载器去加载。只有父加载器无法加载这个类的时候，才会由当前这个加载器来负责类的加载。

## JVM 类加载流程

在介绍双亲委派机制的时候，不得不提ClassLoader（类加载器）。

说ClassLoader之前，我们得先了解下Java的基本知识。  

Java是运行在Java的虚拟机(JVM)中的，但是它是如何运行在JVM中了呢？

我们在IDE中编写的Java源代码被编译器编译成.class的字节码文件。

然后由我们得ClassLoader负责将这些class文件给加载到JVM中去执行。 


## 类加载器

Java中提供如下四种类型的加载器，每一种加载器都有指定的加载对象，具体如下

Bootstrap ClassLoader（启动类加载器） ：主要负责加载Java核心类库，%JRE_HOME%\lib下的rt.jar、resources.jar、charsets.jar和class等。

Extention ClassLoader（扩展类加载器）：主要负责加载目录%JRE_HOME%\lib\ext目录下的jar包和class文件。

Application ClassLoader（应用程序类加载器） ：主要负责加载当前应用的classpath下的所有类

User ClassLoader（用户自定义类加载器） ： 用户自定义的类加载器,可加载指定路径的class文件

这四种类加载器存在如下关系，当进行类加载的时候，虽然用户自定义类不会由bootstrap classloader或是extension classloader加载（由类加载器的加载范围决定），但是代码实现还是会一直委托到bootstrap classloader, 上层无法加载，再由下层是否可以加载，如果都无法加载，就会触发findclass,抛出classNotFoundException.

![class loader](https://upload-images.jianshu.io/upload_images/4005155-aa3e6d6f5537d9f9.png)

# jvm 类的加载机制

那如果有一个我们写的Hello.java编译成的Hello.class文件，它是如何被加载到JVM中的呢？

别着急，请继续往下看。

![加载机制](https://upload-images.jianshu.io/upload_images/14200547-c1b63350b194b663)

## 1.加载

通过全限定类名来获取class的字节流，存储到元空间中，并且定义class对象，作为该类的访问入口

## 2.连接

a. 验证（确保被加载的类符合jvm的规范） 

b. 准备（类变量分配初始值int i =0,int j=0 obj=null） 

c. 解析 (常量池中的符号引用替换为直接引用，在sysout,s变为“abc”)

```java
public class Test{
   public static void main() {
     String s=”adc”;
     System.out.println(“s=”+s);
   }
}
```

## 3.初始化

a. clinit 类初始化

类变量（静态域）赋值初始化过程，其实是执行类变量代码赋值过程以及执行静态代码块中的逻辑，从上到下执行，int i = 20; int j = 20,obj = Object ，同时虚拟机会保证多线程初始化类的时候被正确的加锁和同步，，注意使用单例的懒汉模式过程中，要加volatile,防止指令重排序，出现返回null的空情况

b. init对象初始化

执行类构造函数

## 4. 使用

## 5. 卸载


# 类的加载时机

## 1.主动引用

new，main方法，反射，初始化类的时候，父类没有初始化，调用类的静态成员（final常量除外） 等情况，类需要被先初始化

## 2.被动引用

通过子类引用父类的静态变量，不会导致子类初始化，而是会导致父类初始化

引用常量池中的常量

通过数组定义类的引用，不会导致类被初始化







# 双亲委派机制

我打开了我的AndroidStudio，搜索了下“ClassLoader”,然后打开“java.lang”包下的ClassLoader类。

然后将代码翻到loadClass方法：

```java
public Class<?> loadClass(String name) throws ClassNotFoundException {
    return loadClass(name, false);
}

//              -----??-----
protected Class<?> loadClass(String name, boolean resolve)
    throws ClassNotFoundException
{
        // 首先，检查是否已经被类加载器加载过
        Class<?> c = findLoadedClass(name);
        if (c == null) {
            try {
                // 存在父加载器，递归的交由父加载器
                if (parent != null) {
                    c = parent.loadClass(name, false);
                } else {
                    // 直到最上面的Bootstrap类加载器
                    c = findBootstrapClassOrNull(name);
                }
            } catch (ClassNotFoundException e) {
                // ClassNotFoundException thrown if class not found
                // from the non-null parent class loader
            }

            if (c == null) {
                // If still not found, then invoke findClass in order
                // to find the class.
                c = findClass(name);
            }
        }
        return c;
}
```

其实这段代码已经很好的解释了双亲委派机制，为了大家更容易理解，我做了一张图来描述一下上面这段代码的流程：  

![flow](https://img-blog.csdnimg.cn/20201217213314510.png)


从上图中我们就更容易理解了，当一个Hello.class这样的文件要被加载时。

不考虑我们自定义类加载器，首先会在AppClassLoader中检查是否加载过，如果有那就无需再加载了。

如果没有，那么会拿到父加载器，然后调用父加载器的loadClass方法。父类中同理也会先检查自己是否已经加载过，如果没有再往上。

注意这个**类似递归的过程，直到到达Bootstrap classLoader之前，都是在检查是否加载过，并不会选择自己去加载。**

直到BootstrapClassLoader，已经没有父加载器了，这时候开始考虑自己是否能加载了，如果自己无法加载，会下沉到子加载器去加载，一直到最底层，如果没有任何加载器能加载，就会抛出ClassNotFoundException。

那么有人就有下面这种疑问了？

# 为什么要设计这种机制

这种设计有个好处是，如果有人想替换系统级别的类：String.java。

篡改它的实现，在这种机制下这些系统的类已经被Bootstrap classLoader加载过了（为什么？因为当一个类需要加载的时候，最先去尝试加载的就是BootstrapClassLoader），所以其他类加载器并没有机会再去加载，从一定程度上防止了危险代码的植入。

## 优势

1. 避免类的重复加载

2. 保护程序安全，防止核心API被随意篡改

## 沙箱安全机制

自定义String类，但是在加载自定义String类的时候会率先使用引导类加载器加载，而引导类加载器在加载的过程中会先加载jdk自带的文件(rt.jar包中java\lang\String.class)，报错信息说没有main方法，就是因为加载的是rt.jar包中的String类。这样可以保证对java核心源代码的保护，这就是沙箱安全机制。


# 打破双亲委派机制

TCCL 线程上下文类加载器（默认继承application classloader）

Java 提供了很多服务提供者接口（Service Provider Interface，SPI），允许第三方为这些接口提供实现。

常见的 SPI 有 JDBC、JCE、JNDI、JAXP 和 JBI 等。

这些 SPI 的接口由 Java 核心库来提供，而这些 SPI 的实现代码则是作为 Java 应用所依赖的 jar 包被包含进类路径（CLASSPATH）里。

SPI接口中的代码经常需要加载具体的实现类。

那么问题来了，SPI的接口是Java核心库的一部分，是由启动类加载器(Bootstrap Classloader)来加载的；

SPI的实现类是由系统类加载器(System ClassLoader)来加载的。引导类加载器是无法找到 SPI 的实现类的，因为依照双亲委派模型，BootstrapClassloader无法委派AppClassLoader来加载类。

## 问题 基础类无法调用类加载器加载用户提供的代码?

双亲委派很好地解决了各个类加载器的基础类的统一问题（越基础的类由越上层的加载器进行加载），但如果基础类又要调用用户的代码，比如jdbc，但启动类加载器只能加载基础类，无法加载用户类。

## 解决：

为此 Java 引入了线程上下文类加载器（Thread Context ClassLoader）。

这个类加载器可以通过 java.lang.Thread.setContextClassLoaser() 方法进行设置，如果创建线程时还未设置，它将会从父线程中继承一个，如果在应用程序的全局范围内都没有设置过的话，那这个类加载器默认就是应用程序类加载器。

如此，JNDI 服务使用这个线程上下文类加载器去加载所需要的 SPI 代码，也就是父类加载器请求子类加载器去完成类加载的动作，这种行为实际上就是打通了双亲委派模型的层次结构来逆向使用类加载器，实际上已经违背了双亲委派模型的一般性原则，但这也是无可奈何的事情。

Java 中所有涉及 SPI 的加载动作基本上都采用这种方式，例如 JNDI、JDBC、JCE、JAXB 和 JBI 等。

线程上下文类加载器破坏了“双亲委派模型”，可以在执行线程中抛弃双亲委派加载链模式，使程序可以逆向使用类加载器。

![class loader](https://upload-images.jianshu.io/upload_images/15041653-f14ad4171266d952.png)

# 总结

双亲委派机制有他存在的意义，不过也存在许多场景是需要破坏这个机制的，所以双亲委派机制也非必然。

比如 tomcat web容器里面部署了很多的应用程序，但是这些应用程序对于第三方类库的依赖版本却不一样，但这些第三方类库的路径又是一样的，如果采用默认的双亲委派类加载机制，那么是无法加载多个相同的类。

所以，Tomcat破坏双亲委派原则，提供隔离的机制，为每个web容器单独提供一个WebAppClassLoader加载器。

# Tomcat的类加载机制

为了实现隔离性，优先加载 Web 应用自己定义的类，所以没有遵照双亲委派的约定，每一个应用自己的类加载器——WebAppClassLoader负责加载本身的目录下的class文件，加载不到时再交给CommonClassLoader加载，这和双亲委派刚好相反。

# 参考资料

https://blog.csdn.net/m0_46689661/article/details/123076236

https://blog.csdn.net/codeyanbao/article/details/82875064

[jvm 类加载过程和双亲委派机制以及打破双亲委派机制](https://www.jianshu.com/p/16007e5d6828)

https://www.jianshu.com/p/240e65d54397

* any list
{:toc}`