---
layout: post
title: 位图法对大量整数进行排序
date: 2019-01-03 08:25:22 +0800
categories: [Althgorim]
tags: [althgorim, sh]
published: true
excerpt: 如何对 1 千万个整数进行排序
---

# 问题

输入：一个最多包含n个正整数的文件，每个数都小于n，其中n=10^7。如果在输入文件中有任何正数重复出现就是致命错误。没有其他数据与该正数相关联。

输出：按升序排列的输入整数的列表。

约束：最多有（大约）1MB的内存空间可用，有充足的磁盘存储空间可用。运行时间最多几分钟，运行时间为10秒就不需要进一步优化。

这是《编程珠玑》中很有意思的一个问题。今天给大家分享一下并附上自己的代码实现。


# 分析

这个问题的限制在于，大约只有1MB的内存空间可用，而存储10^7个整数却大约需要4*10^7字节即大约需要40M内存，显然是不够用的。

- 多次读取

一种思路是，既然总的内存不够，我们可以读取40次，例如，第一次读取0至249 999之间的数，并对其进行排序输出，第二次读取250 000 至499 999之间的数，并对其排序输出。以次类推，在进行了多次排序之后就完成了对所有数据的排序，并输出到文件中。

- 归并排序

另外一种思路是，既然有充足的磁盘存储空间可用，那么我们可以借助中间文件。读入一次输入文件，利用中间文件进行归并排序写入输出文件。

那么能否结合两种思路呢？即只需要读取一次，也不借助中间文件？

或者说，如何用大约1MB内存空间，即大约８00万个比特位最多表示10^７个互异的数呢？

# 位图法

借助位图法当然是可以的。

我们可以用一个比特位来代表一个数。

例如，对于整数集合 `{1,2,5,6,7}`，可以使用下面的比特位表示：

```
0 1 1 0 0 1 1 1 
```

数值存在的比特位置为1，其他位为0，对应上面的即可。分别在第1，2，5，6，7比特位置1即可。而上面的比特位转换为整数值为103，只需要一个字节便可存储。

回到我们之前的问题。对于最多10^7个整数，我们大约需要10^7个比特位，即10^7/(8*1024*1024)MB，约1.2M的内存即可存储。

至此，我们可以梳理出算法大体流程：

1. 对给定大小的数组所有比特位置0

2. 循环读取输入文件的数据，并将对应数值大小的比特位置1

3. 遍历数组各比特位，如果位为1，则输出对应比特位的位置整数

# C 语言实现

```c++
#include<stdio.h>
#include<stdlib.h>
#define CHAR_BIT    8            // char类型占用的bit位数
#define SHIFT        3            //右移的位数
#define MAX_NUM        10000000     
#define BIT_SIZE    10000000*8   //所需比特位总数量
#define MAX_STR     10           //一个整数所需最大字符数
#define INPUT_FILE  "srcNum.txt"
#define OUTPUT_FILE "dstNum.txt"
/*将整数对应的比特位置1*/
int putIntoBitMap(char *bitmap, int num)
{
    int byte = num >> SHIFT;
    char bit = 1 << num % CHAR_BIT;
    bitmap[byte] |= (char) bit;
    return 0;
}
/*判断整数是否在位图中*/
int isInBitMap(char *bitmap, int num)
{
    int byte = num >> SHIFT;
    char bit    = 1 << num % CHAR_BIT;
    if (bitmap[byte] & (char) bit)
        return 1;
    else
        return 0;
}

int main(void)
{
    /*打开源文件*/
    FILE *in = fopen( INPUT_FILE, "r" );
    if(NULL == in)
    {
        printf("open src num failed");
        return -1;
    }

    /*申请位图相关内存，并初始化为0*/
    char string[MAX_STR]    = { 0 };
    char *bitmap = (char*)calloc(MAX_NUM,sizeof(char));
    if(NULL == bitmap)
    {
        fclose(in);
        return -1;
    }
    int num = 0;
    /*循环读取文件中的整数，并将对应位置1*/
    while(fgets(string, MAX_STR, in ) != NULL)
    {
        num = atoi(string);
        putIntoBitMap(bitmap, num);
        //printf("%d
",num);
    }
    fclose(in);

    /*遍历位图中的比特位，为1，则输出整数到文件中*/
    FILE *out = fopen(OUTPUT_FILE, "w+");
    if(NULL == out)
    {
        printf("open dst num failed");
        free(bitmap);
        bitmap = NULL;
        return -1;
    }
    int i;
    for (i = 0; i < BIT_SIZE; i++)
    {
        if (isInBitMap(bitmap , i))
        {
            fprintf(out, "%d
", i);
            //printf("%d
",i);
        }

    }
    fclose(out);
    free(bitmap);
    bitmap = NULL;
    return 0;
}
```

srcNum.txt中存放了早已生成好的小于10^7的大量无重复整数，编译运行结果如下：

```
gcc -o bitmap bitmap.c
time ./bitmap

real    0m1.830s
user    0m1.729s
sys    0m0.100s
```

可以看到运行时间为秒级。

## 关键点说明：

putIntoBitMap和isInBitMap函数是该算法的关键函数

putIntoBitMap将整数对应的比特位置1

isInBitMap 判断整数所在比特位是否为1

例如对于整数81，它所在的字节数是81/8 = 10，第10字节（从0开始数），所在的比特位为81%8=1，第1个比特位。那么我们只需要将第10字节的第1个比特位置1即可。

如何将第n个比特位置1？先将1左移n位（n小于8），得到一个值，再将这个值与该字节进行相或即可。

例如，如果需要将第4个比特位置1，则1左移4位，得到二进制的00010000即16，若原来该字节值为01000000，即64时，只需将64与16逻辑或即可。

```
00010000
01000000   
01010000  #逻辑或之后的结果
```

上面的程序还有很多不足之处，包括未对输入做任何检查，未对输入数量做校验等等。

这一切都基于输入数据都是正确的，但这丝毫不影响我们对该算法思想的理解。

# 总结

位图法适用于大规模数据，但数据状态又不是很多的情况。

对于上面的程序，几乎是做完读取操作之后，排序就完成了，效率惊人。

# 拓展阅读

[java 位运算](https://houbb.github.io/2018/09/13/java-bit-operation)

[布隆过滤器](https://houbb.github.io/2018/12/05/bloom-filter)

# 参考资料

[如何对 1 千万个整数进行快速排序](https://mp.weixin.qq.com/s/OM3DmT33BVkR2Gy2-1jkag)

* any list
{:toc}