---
layout: post
title:  分布式标识 Distributed ID-02-UUID
date:  2018-09-05 08:53:10 +0800
categories: [Distributed]
tags: [id, distributed, random, sh]
published: true
---

# UUID

## 基本实现

```java
@Override
public String genId() {
    return UUID.randomUUID().toString()
            .replaceAll(PunctuationConst.MIDDLE_LINE, PunctuationConst.EMPTY);
}
```

## 测试代码

```java
System.out.println(new UUIDId().genId())
```

日志信息

```
379a1e5df3534885a94001373467f33e
```

# 源码解析

## toString()

```java
public String toString() {
    return (digits(mostSigBits >> 32, 8) + "-" +
            digits(mostSigBits >> 16, 4) + "-" +
            digits(mostSigBits, 4) + "-" +
            digits(leastSigBits >> 48, 4) + "-" +
            digits(leastSigBits, 12));
}
```

### digits()

```java
private static String digits(long val, int digits) {
    long hi = 1L << (digits * 4);
    return Long.toHexString(hi | (val & (hi - 1))).substring(1);
}
```

### toHexString()

```java
public static String toHexString(long i) {
        return toUnsignedString(i, 4);
}
```

- toUnsignedString

```java
/**
 * Convert the integer to an unsigned number.
 */
private static String toUnsignedString(long i, int shift) {
    char[] buf = new char[64];
    int charPos = 64;
    int radix = 1 << shift;
    long mask = radix - 1;
    do {
        buf[--charPos] = Integer.digits[(int)(i & mask)];
        i >>>= shift;
    } while (i != 0);
    return new String(buf, charPos, (64 - charPos));
}
```

其中 Integer.digits 是最基本的常量

```java
/**
 * All possible chars for representing a number as a String
 */
final static char[] digits = {
    '0' , '1' , '2' , '3' , '4' , '5' ,
    '6' , '7' , '8' , '9' , 'a' , 'b' ,
    'c' , 'd' , 'e' , 'f' , 'g' , 'h' ,
    'i' , 'j' , 'k' , 'l' , 'm' , 'n' ,
    'o' , 'p' , 'q' , 'r' , 's' , 't' ,
    'u' , 'v' , 'w' , 'x' , 'y' , 'z'
};
```

## random()

```java
public static UUID randomUUID() {
    SecureRandom ng = Holder.numberGenerator;
    byte[] randomBytes = new byte[16];
    ng.nextBytes(randomBytes);
    randomBytes[6]  &= 0x0f;  /* clear version        */
    randomBytes[6]  |= 0x40;  /* set to version 4     */
    randomBytes[8]  &= 0x3f;  /* clear variant        */
    randomBytes[8]  |= 0x80;  /* set to IETF variant  */
    return new UUID(randomBytes);
}
```

### SecureRandom 单例初始化

其中 Holder.numberGenerator 创建单例 SecureRandom

```java
private static class Holder {
    static final SecureRandom numberGenerator = new SecureRandom();
}
```

### UUID(bytes)

构造器，内容如下

```java
private UUID(byte[] data) {
    long msb = 0;
    long lsb = 0;
    assert data.length == 16 : "data must be 16 bytes in length";
    for (int i=0; i<8; i++)
        msb = (msb << 8) | (data[i] & 0xff);
    for (int i=8; i<16; i++)
        lsb = (lsb << 8) | (data[i] & 0xff);
    this.mostSigBits = msb;
    this.leastSigBits = lsb;
}
```

# UUID 的缺点

1）没有排序，无法保证趋势递增。

2）UUID往往是使用字符串存储，查询的效率比较低。

3）存储空间比较大，如果是海量数据库，就需要考虑存储量的问题。

4）传输数据量大

5）不可读。

## 太长

一般为 32 位。

如果用来做唯一主键，占用内容较长，且有无序的问题，影响性能。

## 无序

- 无需为什么会影响性能？

因为索引是 [B+ Tree](https://houbb.github.io/2018/09/12/b-tree)

但是，如果我们的插入完全无序，不但会导致一些中间节点产生分裂，也会白白创造出很多不饱和的节点，这样大大降低了数据库插入的性能。

### 顺序插入的好处

如果我们的ID按递增的顺序来插入，比如陆续插入8，9，10，新的ID都只会插入到最后一个节点当中。

当最后一个节点满了，会裂变出新的节点。

这样的插入是性能比较高的插入，因为这样节点的分裂次数最少，而且充分利用了每一个节点的空间。

ps: 这也正是为什么 mysql 使用自增主键，oracle 建议使用 seq 序列号。

## 不利于阅读

`379a1e5df3534885a94001373467f33e` 这种序列号我们无法获取对应的信息。

比如交易订单的 id，交易发生在什么时候？

交易属于哪一个系统？

我们希望看到的是这样的时间戳？

```
0001 201906121639111 XXX
```

假设 `0001` 是一个系统的编号

201906121639111 是交易发生的时间。

下面我们针对这些问题，逐步改进。

# 改进为更短的展示

原来是 0-9 a-z 可以把大小写加上，位数变得更短。

## 8 位的 uuid 

```java
import com.github.houbb.heaven.annotation.ThreadSafe;
import com.github.houbb.heaven.util.guava.Guavas;
import com.github.houbb.heaven.util.id.Id;

import java.util.List;

/**
 * 在数据量较多的时候，
 *
 * 如果基于 ID 添加索引，字符串越长，则性能越差。
 *
 * （1）uuid 是基于 16 进制的，将 128 位的 bit ，变为 16 进制。
 *  0-F   0123456789ABCDEFG
 *  （2）转换为 62 进制的信息，考虑便于阅读
 *  0-9  52 个字母 共计 62 位
 *
 *  所以 32 位，分成 8 组，每一组 4 位。
 *
 *  16 * 4 = 64 位。
 *
 *  如果不想重复，需要 0xffff 共计 65535 的字符。
 *
 * （3）缺点：会存在重复
 *
 * 重复的概率：
 *
 * 取62模会导致重复率大增 P(A)
 *
 * 短uuid重复概率未知 P(B)
 *
 * uuid重复概率=x
 *
 * P(A|B)=1
 *
 * P(A|B') =y
 *
 * 全概率公式计算 P(A)=P(B)P(A|B)+P(B')P(A|B') =x+y-xy
 *
 * 其中y=((64-62)/64)^8=2^(-40) 看出x远小于y，所以短uuid的重复概率完全取决于y的值
 *
 * （4）建议应用场景
 *
 * 可以用来生成一个 8 位的 token，而不是用来做唯一标识
 *
 * @author binbin.hou
 * @since 0.1.12
 * @see 19 位 uuid https://pittlu.iteye.com/blog/2093880
 */
@ThreadSafe
public class UUID8 implements Id {

    /**
     * 62 进制符号
     */
    private static final char[] CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();

    @Override
    public String genId() {
        final List<String> uuidUnits = uuidUnits();
        StringBuilder stringBuilder = new StringBuilder();
        for (String unit : uuidUnits) {
            int x = Integer.parseInt(unit, 16);
            stringBuilder.append(CHARS[x % 62]);
        }
        return stringBuilder.toString();
    }

    /**
     * 获取 uuid 分段后的内容
     * @return 分段后的内容
     */
    private List<String> uuidUnits() {
        final String uuid32 = new UUID32().genId();
        final int size = 8;

        List<String> units = Guavas.newArrayList(size);
        for(int i = 0; i < size; i++) {
            units.add(uuid32.substring(i * 4, i * 4 + 4));
        }
        return units;
    }

}
```

# 可读性改进

将 string 转换为 Int 

```java
new BigInteger("379a1e5df3534885a94001373467f33e", 16)
```

结果

```
73907769400197500546813542834226328382
```

# 解决无序性的算法

为了解决UUID无序的问题，NHibernate在其主键生成方式中提供了Comb算法（combined guid/timestamp）。

保留GUID的10个字节，用另6个字节表示GUID生成的时间（DateTime）。

```java
/// <summary> 
/// Generate a new <see cref="Guid"/> using the comb algorithm. 
/// </summary> 
private Guid GenerateComb()
{
    byte[] guidArray = Guid.NewGuid().ToByteArray();
 
    DateTime baseDate = new DateTime(1900, 1, 1);
    DateTime now = DateTime.Now;
 
    // Get the days and milliseconds which will be used to build    
    //the byte string    
    TimeSpan days = new TimeSpan(now.Ticks - baseDate.Ticks);
    TimeSpan msecs = now.TimeOfDay;
 
    // Convert to a byte array        
    // Note that SQL Server is accurate to 1/300th of a    
    // millisecond so we divide by 3.333333    
    byte[] daysArray = BitConverter.GetBytes(days.Days);
    byte[] msecsArray = BitConverter.GetBytes((long)
      (msecs.TotalMilliseconds / 3.333333));
 
    // Reverse the bytes to match SQL Servers ordering    
    Array.Reverse(daysArray);
    Array.Reverse(msecsArray);
 
    // Copy the bytes into the guid    
    Array.Copy(daysArray, daysArray.Length - 2, guidArray,
      guidArray.Length - 6, 2);
    Array.Copy(msecsArray, msecsArray.Length - 4, guidArray,
      guidArray.Length - 4, 4);
 
    return new Guid(guidArray);
}
```

# 个人收获

## uuid

uuid 从实现上看起来很简单，一个方法即可。

但是其中的原理是一样的。

## 组合

组合是一种非常好的方式。

其实后面的随机序列也是一种组合。

时间戳+随机数的组合

前者保证顺序性，后者保证唯一性。

* any list
{:toc}