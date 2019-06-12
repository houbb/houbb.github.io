---
layout: post
title: Java Bit Operation-类型转换-02
date:  2018-09-13 13:09:36 +0800
categories: [Java]
tags: [java, java-base, sf]
published: true
---

# 问题

对于 32 位的字符串 `379a1e5df3534885a94001373467f33e`，如果想转换为整数。

# JDK 内置的方法

## 借助 BigInteger

```java
new BigInteger("379a1e5df3534885a94001373467f33e", 16)
```

结果为

```
73907769400197500546813542834226328382
```

## jdk1.8 的方法

```java
long result = Long.parseUnsignedLong("379a1e5df3534885a94001373467f33e", 16);
```

## 最大值问题

这种转换在某种程度上，要考虑到最大值的问题。

# 将 byte 转换为 int

首先：一个int有4个八位，也就是4个字节。

## 代码

如果我们要讲一个 byte[] 数组转换为int类型：

首先看如下代码：

```java
/**
 * byte数组转int类型的对象
 *
 * @param bytes 字节数组
 * @return int
 */
public int byteToInt(byte[] bytes) {
    return (bytes[0] & 0xff) << 24
            | (bytes[1] & 0xff) << 16
            | (bytes[2] & 0xff) << 8
            | (bytes[3] & 0xff);
}
```

## 解释

因为一个byte是八位，int有四个八位，所以将这个byte[0]左移24位，就将这个byte[0]放在了int的最高一个八位上。

同理,byte[1]放置在第二个八位上,byte[2]放置在第三个八位上，byte[3]放置在第四个八位上。

- 问题：为什么要 &0xff？

首先 0xff 是十六进制的255，也就是二进制的1111 1111，对0xff取与，实际上就是要取这个数最低八位的值，截一个字节的长度。

- 如果不用&0xff：

1. 计算机中是用补码的方式进行存储数据。

2. 如果不用&0xff，那么在进行负数的运算时就会出现问题，如：使用-1进行运算，-1的byte补码是：1111 1111，对应的十六进制数字是0xff；

-1的int补码（32位）是1111 1111 1111 1111 1111 1111，如果将byte转换为int，那么对应的十六进制数是0xffff。

结果不正确（对于负数而言）。

所以为了计算结果的正确性，我们就要对字节进行&0xff操作。

## 将int转换为byte[]：

只需要进行相反的方向操作就好：

```java
/**
 * int转byte数组
 *
 * @param num 整数
 * @return byte 数组
 */
public byte[] intToByte(int num) {
    byte[] bytes = new byte[4];
    bytes[0] = (byte) ((num >> 24) & 0xff);
    bytes[1] = (byte) ((num >> 16) & 0xff);
    bytes[2] = (byte) ((num >> 8) & 0xff);
    bytes[3] = (byte) (num & 0xff);
    return bytes;
}
```

# 参考资料

## byteToInt64

[convert-toint64-equivalent-in-java](https://stackoverflow.com/questions/53702801/convert-toint64-equivalent-in-java)

[分布式系统唯一ID生成方案汇总](https://www.cnblogs.com/haoxinyue/p/5208136.html)

## byte 与 int 互转

[Java将byte[]和int的互相转换](https://www.cnblogs.com/duanjt/p/8144192.html)

[关于JAVA中:int和byte的互相转换](https://blog.csdn.net/sheng_Mu555/article/details/78949700)

* any list
{:toc}