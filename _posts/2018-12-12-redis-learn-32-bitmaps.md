---
layout: post
title: Redis Learn-32-BitMaps
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, in-action, sh]
published: true
---

#  数据结构模型

现代计算机用二进制（位）作为信息的基础单位，1个字节等于8位。

例如“big”字符串是由3个字节组成，但实际在计算机存储时将其用二进制表示。

“big”分别对应的ASCII码分别是98、105、103，对应的二进制分别是01100010、01101001和01100111。

## 操作位

许多开发语言都提供了操作位的功能，合理地使用位能够有效地提高内存使用率和开发效率。

Redis提供了Bitmaps这个“数据结构”可以实现对位的操作。

## Redis BitMpas 的特性

把数据结构加上引号主要因为：


- Bitmaps本身不是一种数据结构，实际上它就是字符串（如图3-10所示），但是它可以对字符串的位进行操作。

```
key:
value: 01100010 01101001 01100111
```

ps: 可以理解为将字符串转为二进制。

- Bitmaps单独提供了一套命令，所以在Redis中使用Bitmaps和使用字符串的方法不太相同。

可以把Bitmaps想象成一个以位为单位的数组，数组的每个单元只能存储0和1，数组的下标在Bitmaps中叫做偏移量。

# 命令

本节将每个独立用户是否访问过网站存放在Bitmaps中，将访问的用户记做1，没有访问的用户记做0，用偏移量作为用户的id。

## 设置值

```
> setbit key offset value
```

设置键的第offset个位的值（从0算起），假设现在有20个用户，userid=0，5，11，15，19的用户对网站进行了访问，那么当前Bitmaps初始
化结果如图3-11所示。

具体操作过程如下，unique：users：2016-04-05代表2016-04-05这天的独立访问用户的Bitmaps：

```
127.0.0.1:6379> setbit unique:users:2016-04-05 0 1
(integer) 0
127.0.0.1:6379> setbit unique:users:2016-04-05 5 1
(integer) 0
127.0.0.1:6379> setbit unique:users:2016-04-05 11 1
(integer) 0
127.0.0.1:6379> setbit unique:users:2016-04-05 15 1
(integer) 0
127.0.0.1:6379> setbit unique:users:2016-04-05 19 1
(integer) 0
```

如果此时有一个userid=50的用户访问了网站，那么Bitmaps的结构变成了图3-12，第20位~49位都是0。

很多应用的用户id以一个指定数字（例如10000）开头，直接将用户id和Bitmaps的偏移量对应势必会造成一定的浪费，通常的做法是每次做setbit操作时将用户id减去这个指定数字。

## 注意

在第一次初始化Bitmaps时，假如偏移量非常大，那么整个初始化过程执行会比较慢，可能会造成Redis的阻塞。

# 获取值

```
> gitbit key offset
```

获取键的第offset位的值（从0开始算），下面操作获取id=8的用户是否在2016-04-05这天访问过，返回0说明没有访问过：

```
127.0.0.1:6379> getbit unique:users:2016-04-05 8
(integer) 0
```

由于offset=1000000根本就不存在，所以返回结果也是0：

```
127.0.0.1:6379> getbit unique:users:2016-04-05 1000000
(integer) 0
```

# 获取 Bitmaps 指定范围值为1的个数

```
bitcount [start][end]
```

下面操作计算2016-04-05这天的独立访问用户数量：

```
127.0.0.1:6379> bitcount unique:users:2016-04-05
(integer) 5
```

`[start]` 和 `[end] 代表起始和结束字节数，下面操作计算用户id在第1个字节到第3个字节之间的独立访问用户数，对应的用户id是11，15，19。

```
127.0.0.1:6379> bitcount unique:users:2016-04-05 1 3
(integer) 3
```


# Bitmaps间的运算

```
bitop op destkey key[key....]
```

bitop是一个复合操作，它可以做多个Bitmaps的and（交集）、or（并集）、not（非）、xor（异或）操作并将结果保存在destkey中。

TODO: 这里需要实际使用

# Bitmaps分析

假设网站有1亿用户，每天独立访问的用户有5千万，如果每天用集合类型和Bitmaps分别存储活跃用户可以得到表3-3。

| 数据类型 | 每个 id 占位 | 数据量 | 大小 |
|:----|:----|:----|:----|
| 集合 | 64 | 5kw | 400M |
| BitMaps | 1 | 1E | 12.5M |

很明显，这种情况下使用Bitmaps能节省很多的内存空间，尤其是随着时间推移节省的内存还是非常可观的。

## 运行不佳的场景

但Bitmaps并不是万金油，假如该网站每天的独立访问用户很少。

例如只有10万（大量的僵尸用户），那么两者的对比如表3-5所示，很显然，这时候使用Bitmaps就不太合适了，因为基本上大部分位都是0。

| 数据类型 | 每个 id 占位 | 数据量 | 大小 |
|:----|:----|:----|:----|
| 集合 | 64 | 10w | 800K |
| BitMaps | 1 | 1E | 12.5M |

ps: 实际占用的大小可能不同 [Java 对象占用内存大小与 java 对象格式](https://houbb.github.io/2019/02/26/java-object-size-03)

# 拓展阅读

[数据结构之 bitmap](https://houbb.github.io/2018/12/25/bitmap)

[如何计算多少个1]()

# 参考资料

《Redis 开发与运维》

[算法-LeetCode-整数的二进制表示中1的个数](https://blog.csdn.net/u014801432/article/details/81286735)

* any list
{:toc}