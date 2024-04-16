---
layout: post
title: java 键盘鼠标操作-03-java jna keyboard 操作键盘按键 
date: 2024-03-27 21:01:55 +0800
categories: [Java]
tags: [java, robot, sh]
published: false
---

# 需求

希望通过 java 在硬件级别操作 keyboard.

**标题：使用本地库的Java技术文档翻译**

**引言**

有时，您可能希望使用作为原生库而不是Java组件提供的第三方库。

有两种方法可以使用本地库：JNA和JNI（详见下文）。

**使用本地库的缺点**

虽然JNA和JNI为使用本地库提供了一定的便利性，但使用本地库也存在重大缺点：

- 使用本地库违背了Java的平台独立性。
- 没有“编译一次，随处运行”的优势。
- 使用本地库更容易导致致命错误，从而导致整个Java虚拟机崩溃。

**JNA与JNI比较**

JNA相对于JNI的优势包括：

- 可脚本化
- 无需C编译器
- 可直接添加额外平台的本地库，无需重新编译

而JNI相对于JNA的优势包括：

- 是Java的官方部分
- 更快
- JNI更“类型安全”（即Java和原生代码通过相同的类型定义访问数据）

**JNA**

JNA项目（Java Native Access）试图提供一种简单、纯Java的方式来使用原生库。

**函数**

为此，开发者需要定义一个描述库提供的函数的Java接口。例如：

```java
import com.sun.jna.Library;

public interface C extends Library {
    public int symlink(String oldpath, String newpath);
}
```

注意：

- 即使包名是com.sun.jna，JNA并不是Java的官方部分，因此支持的平台比官方Java本身少。
- 不需要声明本地库提供的所有函数。在此示例中，仅声明了symlink。
- Java类型String在C层被映射为const char *。其他原始Java类型也是如此。

**使用库的方法**

```java
import com.sun.jna.Native;

C c = (C)Native.loadLibrary("c", C.class);
int result = c.symlink(source, target);
```

**指定库搜索路径**

如果要使用的库没有安装在平台默认搜索库的位置，您可能需要告诉JNA在哪里找到库：

```java
NativeLibrary.addSearchPath("opencv", "C:\\opencv");
OpenCV openCV = (OpenCV)NativeLibrary.loadLibrary("opencv", OpenCV.class);
```

**常量/枚举**

如果C头文件使用#define语句定义常量，那么编译后的本地库中将找不到该常量。因此，需要在接口中定义常量和枚举。

例如，此C头文件：

```c
#ifndef MY_HEADER_H
#define MY_HEADER_H

#define OFF 0
#define ON 0xff

enum counter_t {
    ZERO,
    ONE,
    TWO,
    THREE
};

extern counter_t get_counter(void);
#endif
```

需要使用如下基于JNA的接口处理：

```java
public interface MyLibrary extends Library {
    public final int OFF = 0;
    public final int ON = 0xff;
    public final int ZERO = 0;
    public final int ONE = 1;
    public final int TWO = 2;
    public final int THREE = 3;

    public int get_counter();
}
```

**标题：结构**

**结构体**

有些函数不接受简单数据类型作为参数，而是所谓的结构体。这些结构体必须被定义为接口的内部静态类，并且它们需要扩展com.sun.jna.Structure类：

```java
import com.sun.jna.Library;
import com.sun.jna.Structure;

public interface C extends Library {
    public static class timeval implements Structure {
        long tv_sec, tv_usec;
    }
    public static class timezone implements Structure {
        int tz_minuteswest, tz_dsttime;
    }
    public int gettimeofday(timeval timeval, timezone timezone);
}
```

结构体的某些字段可能是固定大小的数组（例如，unsigned char path[1024]）。这些字段应该在Java中使用默认初始化器声明（例如，byte[] path = new byte[1024];）。

**通过指针访问结构体**

您调用的函数可能会返回指向结构体的指针。为了初始化Java版本的这种结构体的字段，您可以使用useMemory(Pointer)和read()方法：

```java
public static class MyStruct {
    public MyStruct(Pointer p) {
        // 不能使用super(p)，因为存在固定大小的数组字段
        super();
        useMemory(p); // 设置指针
        read(); // 初始化字段
    }

    public MyStruct() {
        super();
        // 正确处理固定大小的数组字段
        ensureAllocated();
    }
}
```

**按值传递结构体**

如果要将Structure的实例作为值传递，内存将自动分配并写入，并传递指针。

如果要按值传递结构体，则必须对其进行子类化并实现Structure.ByValue接口。此接口纯粹是一个标记，不需要定义任何其他函数。

示例：

```java
public class Timespec extends Structure {
    long tv_sec;
    long tv_usec;
}

public class Stat extends Structure {
    long st_dev; 
    long st_ino; 
    long st_nlink; 
    int st_mode; 
    int st_uid; 
    int st_gid; 
    int __pad0;
    long st_rdev; 
    long st_size; 
    long st_blksize; 
    int st_blocks;  
    Timespec st_atime; 
    Timespec st_mtime; 
    Timespec st_ctime; 
}

public class StatByValue extends Stat implements Structure.ByValue {
    public StatByValue(Stat stat) {
        super();
        ensureAllocated();
        byte[] buffer = new byte[size()];
        stat.getPointer().read(0, buffer, 0, buffer.length);
        getPointer().write(0, buffer, 0, buffer.length);
        read();
    }
}
```

**JNA脚本化**

在BeanShell中，不可能扩展接口，因此无法模仿纯Java使用JNA的方式。其他脚本语言在涉及JNA时也存在类似的问题。

但是您可以使用NativeLibrary的getFunction(String)方法来获取函数对象，其方法invokeInt(Object[])、invokePointer(Object[])等将允许您调用该函数。

如果结果不是基本类型，您可以使用Pointer的方法访问数据。BeanShell示例：

```java
import com.sun.jna.NativeLibrary;

// 获取C运行时库
c = NativeLibrary.getInstance("c");

// 检索getenv()函数并调用它
getenv = c.getFunction("getenv");
print(getenv.invokePointer(new Object[] { "HELLO" }).getString(0));

// 检索并使用setenv()函数
setenv = c.getFunction("setenv");
print(setenv.invokeInt(new Object[] { "HELLO", "world", new Integer(1) }));

// 显示它的作用
print(getenv.invokePointer(new Object[] { "HELLO" }).getString(0));

// 请注意，System.getenv()保持不变
print(System.getenv("HELLO"));
```

可能会出现重大的复杂性：某些函数名称实际上并不指向本地库中的函数，而是通过预处理器重定向到另一个函数。例如：至少在Linux上，lstat()实际上调用__lxstat()并附加参数。

此外，您选择的脚本语言中定义的类可能不适用于JNA。例如，BeanShell添加了两个JNA不能（也不应该）处理的字段。作为解决方法，您可以使用Pointer的get系列方法。

示例：

```java
import com.sun.jna.Memory;
import com.sun.jna.NativeLibrary;

import java.util.Date;

c = NativeLibrary.getInstance("c");
lstat = c.getFunction("__lxstat");
errno = c.getFunction("errno");

path = System.getProperty("imagej.dir");
print(path);
stat = new Memory(144);
result = lstat.invokeInt(new Object[] { new Integer(0), path, stat });

print("result: " + result);
if (result < 0) {
    strerror = c.getFunction("strerror");
    err = errno.getInt(0);
    error = strerror.invokePointer(new Object[] { new Integer(err) }).getString(0);
    print("errno: " + error + " (" + err + ")");
}
print("blocks: " + stat.getInt(64));
print("atime: " + new Date(stat.getLong(72) * 1000));
print("mtime: " + new Date(stat.getLong(88) * 1000));
print("ctime: " + new Date(stat.getLong(104) * 1000));
```

**JNI**

JNI是Java本地接口的缩写。它是从Java内部访问本地库的原始且最受支持的方式。因此，它是强大的，但使用起来有点繁琐。

**初步步骤**

在实现任何本地（C或C++）代码之前，您需要声明一个本地函数。示例：

```java
public class Hello_World_JNI {
    public native void helloWorld();
}
```

这告诉JVM方法helloWorld()是由本地库实现的（必须单独加载）。

接下来，需要生成一个C头文件，其中包含实现该方法的C函数的声明：

```bash
javac Hello_World_JNI.java
javah -classpath . Hello_World_JNI
```

请注意，可执行文件javah仅适用于.class文件，因此我们必须先编译.java源文件。输出是一个.h

文件。

接下来，需要在一个单独的.c文件中实现实际工作的代码。这应该包括javah生成的头文件，并编译为共享库：在Windows上是.dll，在macOS上是.dylib（Apple的Java也使用扩展.jnilib），在其他所有地方都是.so。

在可以调用本地方法之前，JVM需要加载本地库。基本上有两种不同的方法可以做到这一点，System.loadLibrary()和System.load()。前者在系统范围的库搜索路径中查找库，而后者期望动态链接库文件的绝对路径。对于ImageJ的目的，通常更喜欢后者，因为我们希望避免要求用户有管理员权限。

**在ImageJ中的支持**

位于：

```
<ImageJ-directory>/lib/<platform>/
```

的本地库将自动添加到java.library.path中，使它们暴露在Java地方 - 在那里它们仍然需要被加载。加载的一个选项是创建一个服务，在其initialize()方法中加载本地库。例如，查看ITK兼容性层。

Fiji构建系统还通过使用gcc编译以.c结尾的源文件支持本地目标。如果找到C源文件，将调用javah，并使用GCC编译，生成的共享库将放入<fiji-directory>/lib/<platform>/目录。

最后，fiji-lib.jar中的fiji.JNI类提供了加载本地库的便利方法。示例：

```java
static {
    JNI.loadLibrary("hello-world");
}
```

**从C中使用Java本地接口**

当从C访问Java类、实例和方法时，需要记住几件事。

最重要的是：Java有自己的内存管理。与C相比，当需要时，它会移动东西。在C中，一旦您获得了某些数据的地址，程序员的职责就是确保该内存范围在没有变量持有任何引用（地址）的情况下有效。要访问存储在Java虚拟机的内存范围（堆）中的数据，必须将这些数据固定到某个内存位置，并告知JVM何时可以再次移动数据。

当使用JNI时，此固定问题是最棘手的问题，因为很容易编写出在测试阶段仅仅由于偶然而运行的代码。

从Java到本地函数的每次调用都会传递一个对JNI环境的引用作为第一个参数。这是对内部状态变量的不透明指针，这些变量需要与Java的每次交互都要求。

例如：

```c
JNIEXPORT void JNICALL Java_Hello_1World_helloWorld
    (JNIEnv *env, jclass object, jstring message);
```

通常，您会使用在可能的适用于原始类型的地方提供的原始类型。这些通常与本地C类型char、short、int、long相同（但并不总是；魔鬼在于跨平台的细节，如常常发生的那样）。

jchar是一个值得注意的例外，它不等同于char。Unix的作者们决定他们只需要7位，或者最多8位来编码文本。Java的作者知道这是错误的，因此jchar引用16位的Unicode字符。在C中，您通常会使用UTF-8（出于便利和节省内存的原因），因此确保您使用JNI API的*UTF函数（例如NewStringUTF()，而不是NewString()）。

**调用JNI API**

JNI API中有许多函数，几乎所有这些函数都存储在JNIEnv实例中作为函数指针。由于许多函数需要访问环境以与用户隐藏的状态变量交互，大多数调用看起来像这样，将环境作为第一个参数返回给函数：

```c
(*env)->NameOfTheFunction(env, ...);
```

**调用方法和访问字段**

如果需要从C调用Java方法，首先需要引用类。注意：类名必须以UTF-8格式和斜线格式而不是点格式传递。例如：

```c
jclass image_plus_class = (*env)->FindClass(env, "ij/ImagePlus");
```

原始类型没有相应的jclass实例，对于每个原始类型，都有单独的访问器（如果适用）。

如果需要访问数组，请在类名前加上一个开放的方括号，例如“[ij/process/ImageProcessor”；

原始类型的数组是特殊的：“类名”是大写字母，例如B表示字节，I表示整数，Z表示布尔值。然后相应的数组的类名是[B、[I和[Z。

确定类名的最简单方法是在Java中实例化类并在实例上调用instance.getClass

().getName()。

要调用方法，您需要先获取方法id：

```c
jmethodID get_title_method = (*env)->GetMethodID(env,
    image_plus_class, "getTitle", "Ljava/lang/String;()");
```

第四个参数是指定输入参数和返回值类型的签名。找出确切签名的最简单方法是在类上调用javap，传递-s选项以显示签名以外的人类可消化的信息。

一旦您有了方法id，就可以调用该方法，传递相应类的实例：

```c
(*env)->CallVoidMethod(env, instance, image, get_title_method);
```

Call<return-type>Method()函数系列采取可变数量的参数。非常小心地传递正确数量和类型的参数！

**一些提示**

永远不要假设方法的引用，或者甚至JNIEnv参数在本地函数之间的调用中是常量。这是导致段错误/访问违例并使整个JVM崩溃的非常可能的来源。

总是确保尽快释放通过JNI访问的内存。这不仅可以避免内存泄漏，还可以避免由于阻止JVM的内存管理执行其任务而导致的性能问题。

出于性能考虑，应最小化对FindClass()和GetMethodID()的使用：尽管Java 7承诺为这些函数提供更好的性能，但仍有很多人使用Java 5或Java 6，其中这些调用很慢。

注意编译器的警告。它们不仅仅是为了好玩。

**注意事项**

最重要的问题是，您应该知道需要支持哪些平台（操作系统和架构的组合，即i386 Windows和x86_64 Windows是不同的）并确保本地库存在。否则，您的用户将看到大量无助的UnsatisfiedLinkError异常。

通常，您不需要担心这些问题，因为Fiji会方便地为您隐藏它们（这是Fiji的任务之一，隐藏不必要且令人讨厌的繁琐细节）。

C源代码需要使用定义的_JNI_IMPLEMENTATION_符号进行编译。这是由于Windows需要.dll文件明确标记库提供的符号和需要从另一个库导入的符号。

在Windows上，默认情况下，符号是自动版本化的。这与JNI所需的常量名称冲突。因此，您需要使用GCC链接器选项-kill-at进行C源代码的编译。如果您要求GCC为您链接，您需要传递该选项作为-Wl,-kill-at。

java属性java.library.path需要设置为可以找到.so、.dylib/.jnilib或.dll文件的路径（对于Linux/BSD/Haiku/etc、macOS和Windows，分别是如此）。

除了java.library.path属性外，环境变量LD_LIBRARY_PATH、DYLD_LIBRARY_PATH或PATH还应相应调整（对于Linux/BSD/Haiku/etc、macOS和Windows，分别是如此）。

如果您不仅需要加载一个库，而且该库需要加载另一个库，您应该设置搜索路径，以便动态链接器在与原始库相同的目录中查找，以避免必须调整系统范围的搜索路径（这需要管理员权限）。GCC链接器选项称为-R$ORIGIN/（注意，您必须防止命令行扩展$字符）。

**进一步阅读**

有关JNI的完整信息，请参阅Sun's/Oracle's JNI程序员指南。

# 参考资料

https://imagej.net/develop/native-libraries

http://java.sun.com/docs/books/jni/html/jniTOC.html

* any list
{:toc}
