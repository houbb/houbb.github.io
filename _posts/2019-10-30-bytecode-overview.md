---
layout: post
title: 字节码概览
date:  2019-10-30 11:18:30 +0800
categories: [Java]
tags: [java, bytecode, sf]
published: true
---

# class 文件简介及加载

Java编译器编译好Java文件之后，产生 .class 文件在磁盘中。

这种class文件是二进制文件，内容是只有JVM虚拟机能够识别的机器码。

JVM虚拟机读取字节码文件，取出二进制数据，加载到内存中，解析 .class 文件内的信息，生成对应的 Class对象:

![class file](https://img-blog.csdn.net/20140427155129031)

## 文件格式

class字节码文件是根据JVM虚拟机规范中规定的字节码组织规则生成的、具体class文件是怎样组织类信息的，可以参考此博文：

[《深入理解Java Class文件格式系列》](https://blog.csdn.net/zhangjg_blog/article/details/21486985)。

或者是 [Java 虚拟机规范](https://docs.oracle.com/javase/specs/index.html)。


# 实例化流程

下面通过一段代码演示手动加载 class文件字节码到系统内，转换成class对象，然后再实例化的过程：

## 定义一个类

```java
public class Programmer {
 
	public void code() {
		System.out.println("I'm a Programmer,Just Coding.....");
	}

}
```

## 自定义一个类加载器

```java
/**
 * 自定义一个类加载器，用于将字节码转换为class对象
 * @author louluan
 */
public class MyClassLoader extends ClassLoader {
 
	public Class<?> defineMyClass( byte[] b, int off, int len) 
	{
		return super.defineClass(b, off, len);
	}
	
}
```

## 编译

然后编译成 Programmer.class 文件，在程序中读取字节码，然后转换成相应的class对象，再实例化：

```java
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
 
public class MyTest {
 
	public static void main(String[] args) throws IOException {
		//读取本地的class文件内的字节码，转换成字节码数组
		File file = new File(".");
		InputStream  input = new FileInputStream(file.getCanonicalPath()+"\\bin\\samples\\Programmer.class");
		byte[] result = new byte[1024];
		
		int count = input.read(result);
		// 使用自定义的类加载器将 byte字节码数组转换为对应的class对象
		MyClassLoader loader = new MyClassLoader();
		Class clazz = loader.defineMyClass( result, 0, count);
		//测试加载是否成功，打印class 对象的名称
		System.out.println(clazz.getCanonicalName());
    //实例化一个Programmer对象
    Object o= clazz.newInstance();
    try {
     //调用Programmer的code方法
      clazz.getMethod("code", null).invoke(o, null);
    } catch (IllegalArgumentException | InvocationTargetException | NoSuchMethodException | SecurityException e) {
       e.printStackTrace();
    }
}
```

以上代码演示了，通过字节码加载成 class 对象的能力，下面看一下在代码中如何生成class文件的字节码。


# 在运行期的代码中生成二进制字节码

## 动态能力

由于JVM通过字节码的二进制信息加载类的，那么，如果我们在运行期系统中，遵循Java编译系统组织.class文件的格式和结构，生成相应的二进制数据，然后再把这个二进制数据加载转换成对应的类，这样，就完成了在代码中，动态创建一个类的能力了。

![动态能力](https://img-blog.csdn.net/20140427160344203?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbHVhbmxvdWlz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

在运行时期可以按照Java虚拟机规范对class文件的组织规则生成对应的二进制字节码。

当前有很多开源框架可以完成这些功能，如ASM，Javassist。




# 拓展阅读

## 框架

[asm](https://houbb.github.io/2018/07/20/asm)

[javassist](https://houbb.github.io/2018/07/23/javassist)

[cglib](https://houbb.github.io/2018/07/23/cglib)

[byte buddy](https://houbb.github.io/2019/10/30/bytecode-byte-buddy-01-overview)

## 基础知识

[java 编译时注解](https://houbb.github.io/2018/07/02/annotation-07-java-complie-annotation)

[java 动态代理](https://houbb.github.io/2018/07/20/java-proxy)

[jvm 系列](https://houbb.github.io/2018/10/07/jvm-01-java-overview)


# 参考资料

[Java动态代理机制详解（JDK 和CGLIB，Javassist，ASM）](https://blog.csdn.net/luanlouis/article/details/24589193)

* any list
{:toc}
