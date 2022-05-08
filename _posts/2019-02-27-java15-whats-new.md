---
layout: post
title: JDK15 新特性详解，2020-09-15 正式发布
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# 在 CharSequence 中添加了 isEmpty 默认方法

定义isEmpty用于测试字符序列是否为空的默认方法，CharSequence::isEmpty可以用作方法参考。

实现的类java.lang.CharSequence和定义isEmpty方法的另一个接口应注意这一点，因为可能需要对其进行修改以覆盖isEmpty方法。

# 支持 Unicode 13.0

此版本将Unicode支持升级到13.0，其中包括:java.lang.Character13.0水平，这增加了13.0 5930个字符，总共143859个字符类支持Unicode字符数据库。

这些增加的内容包括4个新脚本，总共154个脚本，以及55个新表情符号字符。

# TreeMap 新方法

TreeMap 重新实现压倒性一切的如：putIfAbsent、computeIfAbsent、computeIfPresent、compute、merage

举例说明 putIfAbsent 等价于如下：

```java
default V putIfAbsent​(K key, V value)

V v = map.get(key);
if (v == null){
    v = map.put(key, value);
}
   
return v;
```

# 文本块（最终版）

优势：简化了编写 Java 程序的任务，同时避免了常见情况下的转义序列；增强 Java 程序中表示用非 Java 语言编写的代码的字符串的可读性。

```java
String html = """ <html> <body> <p>Hello, world</p> </body> </html> """;

String query = """    
                SELECT `EMP_ID`, `LAST_NAME` FROM `EMPLOYEE_TB`
                WHERE `CITY` = 'INDIANAPOLIS'
                ORDER BY `EMP_ID`, `LAST_NAME`;
               """;
```

# 隐藏类

基于 JVM 构建的许多语言实现都依靠动态类生成来提高灵活性和效率。

[详情可见 --> JEP371](https://openjdk.java.net/jeps/371)

# GC 回收期

淘汰 - XXUseAdaptiveGDBoundary

# 改进的序列化处理，IO

使用java.io.ObjectInputStream.setObjectInputFilter方法设置序列化过滤器时，必须在从流中读取任何对象之前调用它。

如果调用readObject或方法readUnshared，则该setObjectInputFilter方法将引发IllegalStateException。

# 优化空子字符串处理，String.substring

在某些情况下，String.substring返回“”，但在子字符串长度为零时，在所有情况下都可以进行改进。

之前逻辑是返回 “”，需要增加一个新的地址，而目前为 null，如下

```java
public static String stripLeading(byte[] value) {
  int left = indexOfNonWhitespace(value);
  if (left == value.length) {
    return "";
  }
  return (left != 0) ? newString(value, left, value.length - left) : null;
}
```

# 支持货币分组分隔符

DecimalFormat / DecimalFormatSymbols类现在可以处理货币值的分组分隔符。

例如，在奥地利（de-AT语言环境）中使用的德语语言的货币分组分隔符为“。”，

而在其他德语语言环境中的货币分组分隔符为“。”。

# time 用默认值覆盖本地化值

`java.time.format.DateTimeFormatter.localizedBy(Locale)` 方法现在采用默认的语言环境值，例如Chronology和/或DecimalStyle指定的语言环境参数。

例如，在先前的 JDK 版本中：

```java
jshell> DateTimeFormatter.ofLocalizedDate(FormatStyle.FULL)
    .localizedBy(Locale.forLanguageTag("fa"))
    .format(LocalDate.now())
$3 ==> "جمعه 1 مهٔ 2020"
```

数字是阿拉伯文（西文）数字，在 JDK 15 中：

```java
jshell> DateTimeFormatter.ofLocalizedDate(FormatStyle.FULL)
    .localizedBy(Locale.forLanguageTag("fa"))
    .format(LocalDate.now())
$3 ==> "جمعه ۱ مهٔ ۲۰۲۰"
```

这些数字使用扩展阿拉伯语 - 印度数字，因为它是波斯语区域设置的默认编号系统。

# time ValueRange.of

`ValueRange.of(long min，long maxSmallest，long maxLargest)`，如果最小值大于最小最大值，则将引发异常。但是，仅当最小值大于最大最大值时才会发生例外。

# 性能改进 InflaterOutputStream.write

1、InflaterOutputStream(OutputStream out, Inflater infl, int bufLen) 允许指定要使用的解压缩器和缓冲区大小。

2、InflaterOutputStream.write(byte[] b, int off, int len)正在使用最大512字节的缓冲区大小写入数据。

3、从JDK 15开始，通过InflaterOutputStream(OutputStream out, Inflater infl,int bufLen) 所指定的缓冲区大小将在对的调用中使用InflaterOutputStream.write(byte[] b,int off, int len)。如果在调用InflaterOutputStream 构造函数时未指定缓冲区大小，则默认为512字节。

# 集合性能提升（Better Listing of Arrays）

复制集合的首选方法是使用“复制构造函数”。

例如，要将集合复制到新的ArrayList中，可以编写new ArrayList<>(collection)。

在某些情况下，可能会制作其他临时副本，如果要复制的集合非常大，则应用程序应（意识到/监视）制作副本所需的大量资源。

# GC：G1 优化

针对 G1 堆区域大小的改进

默认的堆区域大小计算已更改为默认情况下返回较大的区域。

计算仍以2048个区域为目标，但是两个方面发生了变化，这些更改提高了启动和运行时性能

1、仅考虑最大堆大小。旧的计算还考虑了初始堆大小，但是当未设置堆大小时，这可能会产生意外的行为。

2、区域大小四舍五入到最接近的2的幂，而不是减小。在最大堆大小不是2的幂的情况下，这将返回更大的区域大小。

# ZGC 一种可扩展低延迟垃圾收集器

Z垃圾收集器（ZGC）现在可以在生产中使用，不再标记为实验功能。

通过使用 `-XX:+UseZGC` 命令行选项启用ZGC 

# 模式匹配的 instanceof（第二预览版）

提供模式匹配来 增强 Java 编程语言 instanceof

```java
if (obj instanceof String s) { 
    // can use s here 
    } else {
     // can't use s here 
}
```

# Record（第二预览版）

```java
@Data
@AllArgsConstructor
class Group {
    // 组名
    private String name;
    // 人数
    private int nums;
}
```

使用它可以替代构造器、equal 方法、toString 方法，hashCode 方法

```java
Point（String name,int nums）{}
```

Java 语言中一种新型的类型声明。像枚举一样 enum， record 是类的受限形式。声明其表示形式，并提交与该表示形式匹配的 API。记录放弃了类通常享有的自由：将 API 与表示分离的能力。作为回报，记录获得了很大程度的简洁性。

# Sealed Classes（第一预览版）

通过密封的类和接口增强 Java 编程语言。密封的类和接口限制可以扩展或实现它们的其他类或接口。

> [详细参考 --》起因](https://cr.openjdk.java.net/~briangoetz/amber/datum.html)

# 参考资料

https://my.oschina.net/mdxlcj/blog/4586284

* any list
{:toc}