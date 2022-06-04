---
layout: post
title:  如何实现短链服务 short url-01-long 值进行 Base64 编码原理详解
date:  2022-06-02 09:22:02 +0800
categories: [Tool]
tags: [tool, sh]
published: true
---

# long 值进行 Base64 编码原理详解

分析一下long值；

1、有符号long值，64bit，8字节，取值范围 -2^63——2^63-1，第一位符号位，负数为1，正数为0；

2、正数，符号位0，后63位为正数值；

3、负数，符号位1，整个64位取反、加1，加负号即为负数值；

# Base64 是做什么？

把任意二进制数据转换为可显示字符，总共64种可显示字符。

具体转换规则为每6个bit为一段，映射为一个可显示字符，总bit数不能被6整除的，后面补0，且只能按整字节补，即每次至少补8个bit，直到能被6整除。

6bit与可打印字符的转换规则为：

![转换规则](https://img2020.cnblogs.com/blog/509576/202012/509576-20201222104658681-1057124490.png)

最后两个字符特殊，或是URLEcoder可换成"-" "_"。

另，末尾补的0通常不记成A，而记为=。

# Java中的Base64算法。

早期jdk提供的sun.misc.BASE64Encoder；

apache提供的org.apache.commons.codec.binary.Base64;

jdk8内置的java.util.Base64；效率高一些。

# 回归题目。long值进行Base64编码。

1、今有long值0，左移11位+1，再左移5位+1，再左移42位+1，得

二进制数  0000 0100   0000 0000   1000 0100   0000 0000   0000 0000   0000 0000  0000 0000   0000 0001

16进制数  400840000000001

十进制数  288375511686578177

2、把该二制long值转为长度为8的byte数组，

[4, 0, -124, 0, 0, 0, 0, 1]

其中注意-124的由来，“1000 0100”取反+1得，0111 1100，即为-124。

3、由于该byte数组，并不是每个元素都能对应 ASCII编码中的可打印字符，所以即使把byte数据转成字符串类型可无法打印出来，强行打印会打出不可识别的符号。

4、把该byte数组进行Base64编码，Base64.getUrlEncoder().encode(uidBytes)得到编码后byte数组

[66, 65, 67, 69, 65, 65, 65, 65, 65, 65, 69, 61]

编码byte数组长度为12，因为8*8=64，可转10段6bit，剩4bit，补1字节即8bit，多出2段6bit，总个12段6bit；

编码byte数组，每个元素均能对应ASCII编码中的可打印字符，按ASCII编码打印得

BACEAAAAAAE=

5、以上过程逆向运算，仍能把BACEAAAAAAE=转成原来的long值；

6、附上 ASCII 编码表

![ASCII 编码表](https://img2020.cnblogs.com/blog/509576/202012/509576-20201222111842640-127172848.png)

# 测试代码

```java
public void testBase64() throws Exception {
    Long uid = 288375511686578177L;
    LOGGER.info(String.valueOf(uid));
    LOGGER.info(Long.toHexString(uid));
    LOGGER.info(Long.toBinaryString(uid));
    String uidstr = String.valueOf(uid);
    byte[] bytes = uidstr.getBytes();
    byte[] encodeBytes = Base64.getEncoder().encode(bytes);
    String encode = new String(encodeBytes, "UTF-8");
    LOGGER.info(encode);
    LOGGER.info(Base64.getEncoder().encodeToString(bytes));
    byte b = 0;
    char bb = '0';
    short ss = (short) bb;
    byte[] uidBytes = new byte[8];
    for (int i = 0; i < uidBytes.length; i++) {
        uidBytes[i] = (byte) (uid >> (8 * (8 - 1 - i)));
    }
    // uidBytes[0] = (byte)(uid >> (8*7));
    LOGGER.info(new String(uidBytes, "UTF-8"));
    byte[] encodeUid = Base64.getUrlEncoder().encode(uidBytes);
    String dstUid = new String(encodeUid, "UTF-8");
    LOGGER.info(dstUid);
    //dstUid = "BACEAAAAAAcA";
    byte[] decodeUid = Base64.getUrlDecoder().decode(dstUid.getBytes());
    long rsUid = 0L;
    for (int i = 0; i < decodeUid.length; i++) {
        long temp = decodeUid[i] & 0xFF; // 把有符号扩大为无符号
        rsUid += temp << (8 * (8 - 1 - i));
    }
    LOGGER.info(String.valueOf(rsUid));
    LOGGER.info(Long.toHexString(rsUid));
}
```

生成long的代码如下：

```java
public int initId() {// 初始化id的规则如下：
   // 最高1bit符号位+5bit区域编号（1~32）+11bit服务器编号（1~2048）+5bit服务编号（1~32）+42bit自增数据
   // 最高1bit符号位
   long min = 0;
   // 5位区域编号
   min = min + 1;
   // 11位服务器编号
   min = min << 11; // 左移11位 给serverId空出11个位置 共1~2048个
   min = min + 1;
   // 5位服务编号
   min = min << 5; // 左移5位 给servicesId空出5个位置 共1~32个
   min = min + 1;
   // 42bit自增数据
   min = min << 42; // 左移42位 给表主键空出42个位置 共1~10^42个
   // 最后64-42-5-11=6，剩下的首部6位，区域编号显5个，最首部1位是符号位
   return min;
}
```



# 参考资料

[Java——long值进行Base64编码原理详解](https://www.cnblogs.com/xingchong/p/14172046.html)

* any list
{:toc}