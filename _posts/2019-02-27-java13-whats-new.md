---
layout: post
title: JDK13 新特性详解，2019-09-17 正式发布
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# switch 优化更新（预览版）

什么是预览版，也就是说当前版本有这个功能，下一个版本不确定会有，如果该功能效果不是很好，会被下一版本移除该功能。

## JDK11 以及之前的版本

```java
switch (day) {
    case MONDAY: 
    case FRIDAY:
    case SUNDAY:
         System.out.println(6); 
         break; 
    case TUESDAY: 
        System.out.println(7); 
        break; case THURSDAY: 
    case SATURDAY: 
        System.out.println(8);
         break; 
    case WEDNESDAY:
         System.out.println(9);
         break; 
}
```

## JDK12

```java
switch (day) {
    case MONDAY, FRIDAY, SUNDAY -> System.out.println(6); 
    case TUESDAY -> System.out.println(7); 
    case THURSDAY, SATURDAY -> System.out.println(8); 
    case WEDNESDAY -> System.out.println(9);
}
```

## JDK13

```java
@Test
void test1() {
   int k = 2;
   String result = switch (k) {
      case  1 -> "one";
      case  2 -> "two";
      default -> "many";
   };
   System.out.println(result);  //two
}
```

# 文本块升级

## HTML

- JDK13 之前

```java
String html = "<html>\n" +
              "    <body>\n" +
              "        <p>Hello, world</p>\n" +
              "    </body>\n" +
              "</html>\n";
```

- JDK13 优化

```java
String html = """
              <html>
                  <body>
                      <p>Hello, world</p>
                  </body>
              </html>
              """;
```

## SQL

- JDK13 以前

```java
String query = "SELECT `EMP_ID`, `LAST_NAME` FROM `EMPLOYEE_TB`\n" +
               "WHERE `CITY` = 'INDIANAPOLIS'\n" +
               "ORDER BY `EMP_ID`, `LAST_NAME`;\n";
```

- JDK13

```java
String query = """    
                SELECT `EMP_ID`, `LAST_NAME` FROM `EMPLOYEE_TB`
                WHERE `CITY` = 'INDIANAPOLIS'
                ORDER BY `EMP_ID`, `LAST_NAME`;
               """;
```

## 解释

- 文本块

```java
"""
line 1
line 2
line 3
"""
```

相当于字符串文字：

```java
"line 1\nline 2\nline 3\n"
```

# 动态 CDS 档案

目标：

提高应用程序类 - 数据共享（AppCDS）的可用性。

消除了用户进行试运行以创建每个应用程序的类列表的需要。

-Xshare:dump 使用类列表由该选项启用的静态归档应继续工作。这包括内置类加载器和用户定义的类加载器的类。

# 取消使用未使用的内存

## 摘要：

增强ZGC以将未使用的堆内存返回给操作系统。

## 动机：

ZGC目前没有取消提交并将内存返回给操作系统，即使该内存长时间未使用。

对于所有类型的应用程序和环境，此行为并非最佳，尤其是那些需要关注内存占用的应用程序和环境。 

例如：通过使用支付资源的容器环境。

应用程序可能长时间处于空闲状态并与许多其他应用程序共享或竞争资源的环境。

应用程序在执行期间可能具有非常不同的堆空间要求。

例如，启动期间所需的堆可能大于稳态执行期间稍后所需的堆。

HotSpot中的其他垃圾收集器，如G1和Shenandoah，提供了这种功能，某些类别的用户发现它非常有用。

将此功能添加到ZGC将受到同一组用户的欢迎。

# 重新实现旧版套接字 API    

## 摘要：


使用更简单，更现代的实现替换java.net.Socket和java.net.ServerSocketAPI使用的底层实现，易于维护和调试。

新的实现很容易适应用户模式线程，也就是光纤，目前正在Project Loom中进行探索。

##  动机：

在java.net.Socket和java.net.ServerSocketAPI，以及它们的底层实现，可以追溯到JDK1.0。

实现是遗留Java和C代码的混合，维护和调试很痛苦。

该实现使用线程堆栈作为I/O缓冲区，这种方法需要多次增加默认线程堆栈大小。

该实现使用本机数据结构来支持异步关闭，这是多年来微妙可靠性和移植问题的根源。

该实现还有几个并发问题，需要进行大修才能正确解决。在未来的光纤世界环境中，而不是在本机方法中阻塞线程，当前的实现不适用于目的。

# FileSystems.newFileSystem 新方法

核心库 /java.nio 中添加了 `FileSystems.newFileSystem(Path，Map <String，？>)`方法 

添加了三种新方法 java.nio.file.FileSystems，以便更轻松地使用将文件内容视为文件系统的文件系统提供程序。

```
1、newFileSystem(Path)
2、newFileSystem(Path, Map<String, ?>)
3、newFileSystem(Path, Map<String, ?>, ClassLoader)
```

添加为 `newFileSystem(Path, Map<String, ?>)` 已使用现有2-arg newFileSystem(Path,ClassLoader)并指定类加载器的代码创建源（但不是二进制）兼容性问题。

例如，由于引用 newFileSystem 不明确，因此无法编译以下内容：

```java
FileSystem fs = FileSystems.newFileSystem(path, null),
```

为了避免模糊引用，需要修改此代码以将第二个参数强制转换为java.lang.ClassLoader。

#  nio 新方法

核心库 /java.nio 中新的 java.nio.ByteBuffer 批量获取 / 放置方法转移字节而不考虑缓冲区位置。

java.nio.ByteBufferjava.nio 现在，其他缓冲区类型定义绝对批量get和put传输连续字节序列的方法，而不考虑或影响缓冲区位置。

# 核心库 /java.time

新日本时代名称Reiwa，此更新中添加了代表新Reiwa时代的实例。与其他时代不同，这个时代没有公共领域。

它可以通过调用JapaneseEra.of(3)或获得JapaneseEra.valueOf("Reiwa")。JDK13及更高版本将有一个新的公共领域来代表这个时代。

NewEra从2019年5月1日开始的日本时代的占位符名称“ ”已被新的官方名称取代。依赖占位符名称获取新时代单例（JapaneseEra.valueOf("NewEra")）的应用程序将不再起作用。

# 核心库 /java.util 中：I18N

支持 Unicode 12.1，此版本将 Unicode 支持升级到 12.1，其中包括以下内容：

java.lang.Character支持12.1级的Unicode字符数据库，其中12.0从11.0开始增加554个字符，总共137,928个字符。

这些新增内容包括4个新脚本，总共150个脚本，以及61个新的表情符号字符。

U+32FF SQUARE ERA NAME REIWA从12.0开始，12.1只添加一个字符。

java.text.Bidi和java.text.Normalizer类分别支持12.0级的Unicode标准附件，＃9和＃15。

java.util.regexpackage支持基于12.0级Unicode标准附件＃29的扩展字形集群。

# 热点 / GC

- JEP 351 ZGC取消提交未使用的存储器 

- 添加了-XXSoftMaxHeapSize标志

- ZGC支持的最大堆大小从4TB增加到16TB

# 安全库 /java.security

该com.sun.security.crl.readtimeout系统属性设置为CRL检索的最大读取超时，单位为秒。

如果尚未设置该属性，或者其值为负，则将其设置为默认值15秒。值0表示无限超时。

新的keytool -showinfo -tls用于显示TLS配置信息的命令 `keytool -showinfo -tls` 添加 了一个显示TLS配置信息的新命令。

SunMSCAPI提供程序现在支持以下一代加密（CNG）格式读取私钥。

这意味着CNG格式的RSA和EC密钥可从Windows密钥库加载，例如“Windows-MY”。

与EC（签名算法SHA1withECDSA，SHA256withECDSA等等）也支持。

# 删除功能

删除的部分功能：

核心库/java.net中，不再支持Pre-JDK 1.4 SocketImpl实现java.net.SocketImpl此版本已删除对为JavaSE1.3及更早版本编译的自定义实现的支持。

此更改对SocketImpl为Java SE 1.4（2002年发布）或更新版本编译的实现没有影响。

核心库/java.lang中，删除运行时跟踪方法，过时的方法traceInstructions(boolean)，并traceMethodCalls(boolean)已经从删除java.lang.Runtime类。

这些方法对许多版本都不起作用，它们的预期功能由Java虚拟机工具接口（JVMTI）提供。


# 参考资料

https://my.oschina.net/mdxlcj/blog/3107021

* any list
{:toc}