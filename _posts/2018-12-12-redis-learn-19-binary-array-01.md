---
layout: post
title: Redis Learn-19-二维数组-02
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, lua, sh]
published: true
---

# 基本概念

redis提供了setbit、getbit、bitcount、bitop四个命令用于处理二进制数组，称为bit array，又叫位数组。

setbit命令用于位数组指定偏移量上的二进制设置值，偏移量从0开始计算，值可以是0或者是1。

getbit获取指定位置上的值。

bitcount统计位数组里面，值为1的二进制位的数量。

bitop可以有and、or、xor，即与、或、异或的位运算。

# 位数组的表示

redis 使用字符串对象 sds 来表示位数组，因为其数据结构是二进制安全的。

因此，其末尾也会用 `\0` 来表示结尾。

一字节长度的位数组，在结构中表示如下：

![一字节长度的位数组](https://ask.qcloudimg.com/http-save/yehe-1327360/uy6r1i4x88.jpeg?imageView2/2/w/1620)

其中，`buf[0]` 存放1字节的二进制数组，即长度是8位的二进制数组。

`buf[1]` 空字符即是 `\0`。

为了便于查看，采用如下方式：

![二进制数组](https://ask.qcloudimg.com/http-save/yehe-1327360/y5qj8g2f7f.jpeg?imageView2/2/w/1620)

# getbit 实现

## 命令

getbit 返回位于数组 bitarray 的 offset 偏移量的值，命令即 `getbit <bitarray> <offset>`。

## 执行流程

命令执行流程如下：

1）计算byte=offset/8，向下取整。该值记录了保存在offset偏移量的位数保存在哪个字节中，即上述的获取buf数组的下标。

2）计算bit=(offset mod 8)+1，获取二进制的位数是哪一位，即上述 `buf[byte]` 数组具体的位置。

3）根据上述的结果，获取 `buf[byte][bit]` 的值。

4）将结果返回给客户端。

例如对于某个二进制数组，`getbit<bitarray> 10`：

![getbit](https://ask.qcloudimg.com/http-save/yehe-1327360/z6zms4y1ou.jpeg?imageView2/2/w/1620)

getbit 所有操作都可以在常数时间完成，时间复杂度是O(1)。

# setbit 实现

## 普通 setbit

setbit 设置位于数组 bitarray 的 offset 偏移量的值为 value，命令即 `setbit <bitarray> <offset> <value>`。

命令执行流程如下：

1）执行 getbit 的 1、2 两步，确定需要修改的二进制的具体位置。

2）获取对应位置的值进行暂存到 oldvalue，并且将新的值设置进去。

3）将 oldvalue 返回给客户端。

setbit 时间复杂度也是 O(1)。

## 带扩展操作的 setbit

当设置的offset计算出的byte的结果超出现有的数组长度，即 `buf[byte]` 的下标超出现有的范围，则需要扩展。

例如，现有是 1 个字节，执行 `setbit<bitarray> 12 1`，则算出 byte=12/8 取整，值是1，但是当前不存在buf[1]，则redis会新开辟空间。

另外，redis基于redis开辟空间的策略（以前文章有提到），会扩展到5字节，剩余的空间是预留空间。

![带扩展操作的 setbit](https://ask.qcloudimg.com/http-save/yehe-1327360/5pi9z62hoh.jpeg?imageView2/2/w/1620)

接着，按照前面的方式 setbit，并返回旧的bit值。

![setbit](https://ask.qcloudimg.com/http-save/yehe-1327360/5ueanupusi.jpeg?imageView2/2/w/1620)

由于redis采用逆序保存二进制数组，因此在对buf进行扩展后，可以直接将值设置到对应的bit，而不必改动现有的二进制位。

如果是采用顺序方式保存，则每次扩展后，需要将位数组中已有的位进行移动，然后才能执行写入操作，则过程复杂。




# 应用场景

关注关系需求中 关注对象 和 被关注人 都是 0-几千万 的数据对象，存储这种对应关系时，采用bitmap 这种位数组，明显要比 uid 的 set 方式要节省存储空间，redis 的内存是很宝贵的，这值得作为考量的地方。

位数组大致可表示为：0101010000100000....0100 这样的二进制串， 在 Redis 的 SDS字符串 一文中可以看到 Redis 中的字符串对象实现，SDS数据结构是二进制安全的，所以 Redis 可以使用字符串来表示位数组 。 

所以根据上面说的，位数组是以字符串的形式：`buf[0]|buf[1]...` 这样一个一个字节存放的。

# 命令

## SETBIT 和 GETBIT

GETBIT 的实现：

```
# 返回 位数组 bitarray 在 offset 偏移量上的二进制位(byte*8+bit)的值
getbit <bitarray> <offset>
# 字节
byte = offset / 8  
# 位
bit = (offset mod 8) + 1
# 可以看到 O(1)
```

## SETBIT 的实现：

```
# 将 位数组 bitarray 在offset 偏移量上的二进制位的值设置为 value
setbit <bitarray> <offset> <value>
# 计算保存二进制位需要多少 字节
len = [offset / 8] + 1 
# 鱿鱼二进制位数组使用的数据结构是 sds ，而 sds 记录长度的是len ，正常进行扩展，同空间预分配 ，扩展位为`00000`
# 字节
byte = offset / 8  
# 位
bit = (offset mod 8) + 1 
# 记录 (byte*8+bit) 上 oldvalue ，再赋予新值，返回 oldvalue
```

# Bitcount 的实现

BITCOUNT 统计给定位数组中，值为 1 的数量，也就是统计汉明重量（见 Leetcode 191、338），其实是一个老问题，看看几种算法，和 redis 的做法。

bitcount 返回给定二进制数组中，值为1的二进制位的数量。

例如对于下图，返回的结果是 12。

![bitcount](https://ask.qcloudimg.com/http-save/yehe-1327360/otmfpkku3t.jpeg?imageView2/2/w/1620)

## 粗暴遍历 O(n)

遍历算法是最简单但也最低效的方法，即遍历每个二进制位，当是1的时候，计数器加1。

这种算法中，遍历100MB长度的二进制数组，需要执行操作近8亿次。

```c
class Solution(object):
    def hammingWeight(self, n):
        rst = 0
        mask = 1
        for i in range(32):
            if n & mask :
                rst += 1
            mask = mask << 1
        return  rst
```

## 查表法

对于一个集合来说，集合元素的排列方式是有限的；对于一个有限长度的数组来说，它能表示的二进制位的排列也是有限的。

根据上述原理，可以创建一个表，表的键为某种排列的位数组，值是1的二进制位的数量。例如下图是以8位长度作为键的表。

![表](https://ask.qcloudimg.com/http-save/yehe-1327360/gvfc0tnr6u.jpeg?imageView2/2/w/1620)

创建这个表后，则无需对位数组进行检查，只要查表就可以知道结果。利用上述的8位长度的表，每次可以查出8位二进制的1的数量，进而100MB长度的二进制数组，查找的次数减少到1亿次。

同理，如果创建一个更大的表，如16位的表，则1次可以查出16位二进制数组的1的数量，进而100MB长度只需要5000万次查找。

理论上来说，是可以创建一个足够大的表，则查询的次数可以降到很低，但是表会收到实际情况的限制：

1）查表法是典型的以空间换时间的方式，节约计算时间带来的是花费更多的内存，创建键长度为16位的二进制表，只需要几百KB；而32位，则需要超过10GB。通常服务器接受几百KB消耗还可以，但是十几个GB难以接受。

2）除了内存消耗，查表法的效果还会收到CPU缓存的限制。对于固定大小的缓存来说，创建的表格越大，CPU能保存的缓存的内容相比整个表格的比例就越少，查表的缓存不命中的概率越高，导致缓存的换入换出频繁切换，影响实际效率。

因此，要使用查表法，通常会建立8位或者16位的表。

## 3.variable-precision SWAR 算法 

bitcount需要实现的计算二进制位的数量，在数学上称为计算汉明重量。

目前最好的算法是variable-precision SWAR，该算法通过一系列的位移和位运算操作，可以在常数时间内计算多个字节的汉明重量，并且不需要耗费额外的内存。

### 算法如下：

```c
uint32_t swar(uint32_t i){
//步骤1
i = (i & 0x55555555) + ((i >> 1) &0x55555555);
//步骤2
i = (i & 0x33333333) + ((i >> 2) &0x33333333);
//步骤3
i = (i & 0x0F0F0F0F) + ((i >> 4) &0x0F0F0F0F);
//步骤4
i = (i * (0x01010101) >> 24);
}
```

### 说明

具体说明如下：

1）步骤1

计算出值i的二进制表示，可以按每两个二进制位为一组进行分组，各组的十进制位就表示该组的汉明重量。

解释：

0x55555555 = 0b01010101010101010101010101010101，可以看到奇数位都是1，偶数位都是0。

因此，假设j = i& 0x55555555，即j的偶数位都是0，奇数位是原始i的奇数位的1的数量。

(i >> 1) & 0x55555555，是将i右移一位以后，此时得到的临时变量还是奇数位的1和i右移后的奇数位的1的数量一样。

因此，也就是i右移之前的i的偶数位的1的数量。

因此，这两个数相加以后，得到的是两位一组的情况下，每两位的二进制位中1的数量。

2）步骤2

计算出值i的二进制表示，可以按每四个二进制位为一组进行分组，各组的十进制位就表示该组的汉明重量。

因为 0x33333333= 0b00110011001100110011001100110011，具体过程同第一步。

3）步骤3

计算出值i的二进制表示，可以按每八个二进制位为一组进行分组，各组的十进制位就表示该组的汉明重量。

因为 0x0F0F0F0F= 00001111000011110000111100001111，具体过程同第一步。

4）步骤4

i * (0x01010101) 计算出的是bitarray的汉明重量，并记录在二进制位的最高八位。通过>>24右移运算，将汉明重量移动到最低八位。得到的结果就是最终的结果。

这个要分两步来理解。

```
0x01010101 = 00000001000000010000000100000001 = (1 << 24) + (1<< 16) + (1 << 8) + 1
```

因此，

```
k * 0x01010101 = (k << 24) + (k << 16) + (k << 8)+ k
```

由于前三步已经将结果分好组，这一步即求出每组上面二进制的值即可。

![SWR](https://ask.qcloudimg.com/http-save/yehe-1327360/352n13iamf.png?imageView2/2/w/1620)


![SWR-2](https://ask.qcloudimg.com/http-save/yehe-1327360/ecym73v35y.png?imageView2/2/w/1620)

至于右移24位，只是将结果移到最低位而已。

该算法每次执行，可以计算长度为32位的二进制数组。上面提到用查表法的时候，32位需要耗费内存超过10GB，无法接受。而采用此方式，不需要额外耗费内存，而速度又是查表法的2倍。 

另外，再每次循环总的数组的时候，调用1次swar就相当于32位，但是如果调用4次，将等于128位的计算。

当然，多次调用是有极限的，一旦循环中处理的位数组大小超过了缓存的大小，这种优化效果会降低。

## redis的实现

redis的bitcount，同时实现了查表法和swar算法。查找法使用8位长度的表，swar方面使用每个循环调用4次，即128位。

在执行bitcount的时候，redis会根据二进制位的数量。

如果大于128位，则用swar；否则用查表法。

基本流程是，先将二进制位数组转换成无符号整数；再判断其长度，对于大于128位的，循环中调用swar算法，每次循环调用四次算法，并且总长度减去128位；如果长度小于8位，则调用查找表算法，每次调用1次8位表，并且总长度减去8位。

bitcount 的时间复杂度是O(n)，n是二进制位数组的长度。

使用swar时，共需要循环n/128向下取整次；使用查找表，共需要循环n mod 128次。


# bitop实现

bitop 接受选项and、or、xor、not，分别对应c语言中的 `&、|、^、~`。

例如，键x、y分别保存的二进制位，如下图左右图所示。

![bitop](https://ask.qcloudimg.com/http-save/yehe-1327360/wg4ag06g9x.jpeg?imageView2/2/w/1620)

## 流程

执行 `bitop andresult x y`，流程如下：

1）创建一个空白数组value，用于保存and操作的结果。

2）分别对两个数组的 `buf[0]~buf[2]` 进行&的计算，将结果分别保存在新的value中的 `buf[0]~buf[3]`。

![bitop-flow](https://ask.qcloudimg.com/http-save/yehe-1327360/h9c8hosr3b.jpeg?imageView2/2/w/1620)

and、or、xor选项支持多个键，但是not只支持1个键的计算。

# 统计活跃用户

1 亿个用户，用户有频繁登陆的，也有不频繁登陆的

如何记录用户的登陆信息

如何查询活跃用户，如一周内登陆3次的

# 一段时间内，曾经登陆过某网站的会员人数

Redis 提供了 setbit、getbit、bitcount、bitop、BITPOS 5个命令用于处理二进制位数组。

## 命令例子

```
# SETBIT key pos [0/1]  设置key的第pos位置为0或者1
> setbit bit 0 1 # 设置第0位为1   00000001
> setbit bit 0 1 # 设置第2位为1   00000101
> setbit bit 0 0 # 设置第0位为0   00000100
```

```
# GETBIT bit 3   # 获取第3位的值
(integer) 1
```

```
# BITCOUNT key [start end]
> 获取 bitmap 指定范围[start end]，位值为1的总个数
```

```
# BITOP operation destkey key [key ...]  # 对一个或多个bitmap 进行位元操作，并将结果保存到 destkey 上。
  operation 可以是 AND 、 OR 、 NOT 、 XOR 这四种操作中的任意一种：
   - AND：并
   - OR：或
   - XOR：异或
   - NOT：非
```

```
# BITPOS key targetBit [start] [end]
计算 bitmap 指定范围[start end]，第一个偏移量对应的值等于targetBit的位置
```

# 个人收获

## 算法

算法的重要性

# 参考资料

[How to count the number of set bits in a 32-bit integer?](https://stackoverflow.com/questions/109023/how-to-count-the-number-of-set-bits-in-a-32-bit-integer)

[Redis二进制位数组BitMap](https://blog.csdn.net/weixin_36750623/article/details/84196132)

[Redis二进制数组 Bitmap](https://blog.csdn.net/qq_28018283/article/details/88698399)

* any list
{:toc}