---
layout: post
title:  Math-数学基础知识素数 Prime
date:  2017-8-23 10:04:34 +0800
categories: [Math]
tags: [math]
published: true
---

# 素数

质数又称素数。

一个大于1的自然数，除了1和它自身外，不能被其他自然数整除的数叫做质数；否则称为合数。

# 特性

## 1. 素数的个数无限多（不存在最大的素数）

证明：反证法，假设存在最大的素数P，那么我们可以构造一个新的数2 * 3 * 5 * 7 * … * P + 1（所有的素数乘起来加1）。

显然这个数不能被任一素数整除（所有素数除它都余1），这说明我们找到了一个更大的素数。

## 2. 存在任意长的一段连续数，其中的所有数都是合数（相邻素数之间的间隔任意大）

证明：当 0 < a <= n时，n!+a能被a整除。

长度为n-1的数列n!+2, n!+3, n!+4, …, n!+n中，所有的数都是合数。

这个结论对所有大于1的整数n都成立，而n可以取到任意大。

## 3. 所有大于2的素数都可以唯一地表示成两个平方数之差。

证明：大于2的素数都是奇数。

假设这个数是2n+1。由于(n+1)^2=n^2+2n+1，(n+1)^2和n^2就是我们要找的两个平方数。

下面证明这个方案是唯一的。如果素数p能表示成a^2-b^2，则p=a^2-b^2=(a+b)(a-b)。由于p是素数，那么只可能a+b=p且a-b=1，这给出了a和b的唯一解。

## 4. 当n为大于2的整数时，2^n+1和2^n-1两个数中，如果其中一个数是素数，那么另一个数一定是合数。

证明：2^n不能被3整除。

如果它被3除余1，那么2^n-1就能被3整除；如果被3除余2，那么2^n+1就能被3整除。总之，2^n+1和2^n-1中至少有一个是合数。

## 5. 如果p是素数，a是小于p的正整数，那么a^(p-1) mod p = 1。

这个证明就有点麻烦了。

首先我们证明这样一个结论：如果p是一个素数的话，那么对任意一个小于p的正整数a，a, 2a, 3a, …, (p-1)a除以p的余数正好是一个1到p-1的排列。例如，5是素数，3, 6, 9, 12除以5的余数分别为3, 1, 4, 2，正好就是1到4这四个数。

反证法，假如结论不成立的话，那么就是说有两个小于p的正整数m和n使得na和ma除以p的余数相同。

不妨假设n>m，则p可以整除a(n-m)。但p是素数，那么a和n-m中至少有一个含有因子p。这显然是不可能的，因为a和n-m都比p小。

# 简单解法的三种方式

## 最基本的方式

最直观的方法，根据定义，因为质数除了1和本身之外没有其他约数，所以判断n是否为质数，根据定义直接判断从2到n-1是否存在n的约数即可。

C++代码如下：

```c
bool isPrime_1( int num )
{
    int tmp =num- 1;
    for(int i= 2; i <= tmp; i++)
      if(num %i== 0)
         return 0 ;
    return 1 ;
}
```

## 初步改进

上述判断方法，明显存在效率极低的问题。

对于每个数n，其实并不需要从2判断到n-1。

我们知道，一个数若可以进行因数分解，那么分解时得到的两个数一定是一个小于等于sqrt(n)，一个大于等于sqrt(n)。

据此，上述代码中并不需要遍历到n-1，遍历到sqrt(n)即可，因为若sqrt(n)左侧找不到约数，那么右侧也一定找不到约数。

C++代码如下：

```c
bool isPrime_2( int num )
{
     int tmp =sqrt( num);
     for(int i= 2;i <=tmp; i++)
        if(num %i== 0)
          return 0 ;
     return 1 ;
}
```

## 再次改进

方法（2）应该是最常见的判断算法了，时间复杂度O(sqrt(n))，速度上比方法（1）的O(n)快得多。

最近在网上偶然看到另一种更高效的方法，暂且称为方法（3）吧，由于找不到原始的出处，这里就不贴出链接了，如果有原创者看到，烦请联系我，必定补上版权引用。

下面讲一下这种更快速的判断方法；

### 分布规律分析

首先看一个关于质数分布的规律：大于等于5的质数一定和6的倍数相邻。例如5和7，11和13,17和19等等；

证明：令x≥1，将大于等于5的自然数表示如下：

······ 6x-1，6x，6x+1，6x+2，6x+3，6x+4，6x+5，6(x+1），6(x+1)+1 ······

可以看到，不在6的倍数两侧，即6x两侧的数为6x+2，6x+3，6x+4，由于2(3x+1)，3(2x+1)，2(3x+2)，所以它们一定不是素数，再除去6x本身，显然，素数要出现只可能出现在6x的相邻两侧。

这里有个题外话，关于孪生素数，有兴趣的道友可以再另行了解一下，由于与我们主题无关，暂且跳过。

这里要注意的一点是，在6的倍数相邻两侧并不是一定就是质数。

此时判断质数可以6个为单元快进，即将方法（2）循环中i++步长加大为6，加快判断速度，

原因是，假如要判定的数为n，则n必定是6x-1或6x+1的形式，对于循环中6i-1，6i，6i+1,6i+2，6i+3，6i+4，其中如果n能被6i，6i+2，6i+4整除，则n至少得是一个偶数，但是6x-1或6x+1的形式明显是一个奇数，故不成立；

另外，如果n能被6i+3整除，则n至少能被3整除，但是6x能被3整除，故6x-1或6x+1（即n）不可能被3整除，故不成立。

综上，循环中只需要考虑6i-1和6i+1的情况，即循环的步长可以定为6，每次判断循环变量k和k+2的情况即可，理论上讲整体速度应该会是方法（2）的3倍。

### 代码

代码如下：

```java
public static boolean isPrime(final int num) {
    //1. 特殊值的判断
    if (num <= 3) {
        return num > 1;
    }
    //6x+1 6x+5
    if (num % 6 != 1 && num % 6 != 5) {
        return false;
    }

    int tmp = (int) Math.sqrt(num);
    //在6的倍数两侧的也可能不是质数
    for (int i = 5; i <= tmp; i += 6) {
        //可能会被两侧的数分解。
        if (num % i == 0 || num % (i + 2) == 0) {
            return false;
        }
    }
    //排除所有，剩余的是质数
    return true;
}
```

### i 的步长为什么能是 +6 

假设要判断的数为x，那么执行到for循环时，x一定为6n-1或者6n+1的形式，因为其他的形式在之前已经被排除了。 

所以x不可能被6n除尽假设x可以被6n+2除尽，那么x一定可以被2除尽，所以x一定不可能为6n-1或者6n+1的形式。 

与前提相矛盾，因此x不可以被6n+2除尽同理，x不可以被6n+3，6n+4除尽 

证毕


## 个人的优化方案

1. 在 `[3, sqrt(n))` 的范围内，所有的偶数都不是素数。

2. 结合上面 6 的步长，可以优化掉接近 一大半。

# 查表法

可以把一定范围内的所有素数存起来。

用空间换时间。

# 素数筛法

## 问题

埃式筛法：给定一个正整数n(n<=10^6)，问n以内有多少个素数？

## 做法

做法其实很简单，首先将2到n范围内的整数写下来，其中2是最小的素数。

将表中所有的2的倍数划去，表中剩下的最小的数字就是3，他不能被更小的数整除，所以3是素数。

再将表中所有的3的倍数划去……

以此类推，如果表中剩余的最小的数是m，那么m就是素数。

然后将表中所有m的倍数划去，像这样反复操作，就能依次枚举n以内的素数，这样的时间复杂度是 `O(nloglogn)`。

## 题解

如果要是按照一个一个判断是否是素数然后把ans+1，时间复杂度为O(n√n)，对于10^6的数据时间复杂度就是O(10^9)，必定会超时，但此时埃氏筛法的时间复杂度只有O(nloglogn)。

## 示例代码

任意给定一个整数，返回从2-整数范围内的所有整数。

```java
/**
 * 获取对应的素数列表
 *
 * @param limit 最大数值
 * @return 素数列表
 */
public static List<Integer> primeList(final int limit) {
    if (limit <= 1) {
        return Collections.emptyList();
    }
    // 存储素数结果的列表
    List<Integer> resultList = new ArrayList<>();
    // 初始化是否为素数列表
    List<Boolean> isPrimeList = new ArrayList<>(limit);
    for(int i = 0; i <= limit; i++) {
        isPrimeList.add(true);
    }
    isPrimeList.set(0, false);
    isPrimeList.set(1, false);
    for (int i = 2; i <= limit; i++) {
        if (isPrimeList.get(i)) {
            // 加入素数列表
            resultList.add(i);
            // 将其对应的所有倍数，都设置为 false.
            for (int j = 2 * i; j <= limit; j += i) {
                isPrimeList.set(j, false);
            }
        }
    }
    return resultList;
}
```

## 算法分析

- 缺点

存在重复筛选，比如6既可以被2筛掉，又可以被3筛掉。

原因：任意一个整数可以写成一些素数的乘积 `n=p1^a * p2^b * p3^c`，其中p1 < p2 < p3，这样这个数n就能被p1,p2和p3筛掉

- 解决方法

按照一个数的最小素因子筛去(也就是这里的p1)就可以啦，这也就有了线性筛素数

上个图，可能更好理解，这是普通筛法每次循环分别筛掉的数

![重复筛选](https://upload-images.jianshu.io/upload_images/4173887-5856eaa827ed0f2f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)


# 线性筛选

## 基本思想

当前数字是 `n=p1^a * p2^b * p3^c` (p1 < p2 < p3且均为素数)，一次循环筛除小于等于p1的素数乘以n得到的数。

比如p1之前有pi,pj和pk三个素数，则此次循环筛掉pi*n,pj*n,pk*n和p1*n ，

实现见代码的标注一，prime 里的素数都是升序排列的，break时的prime[j] 就是这里的p1。

## 优点

没有重复筛同一个数

## 原因

按照一个数的最小素因子筛选，比如6只按2筛去

![线性筛选](https://upload-images.jianshu.io/upload_images/4173887-4e1c28d9e9651453.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)

从图上我们看到，第一列筛掉的是最小素因子是2的数，第二列筛掉的是最小素因子为3的数，依次类推，可以把所有的合数都筛掉

因为是按照最小素因子筛选，所以可以保证每个数都只会被筛一遍

## 示例代码

```java
    /**
     * 线性筛选(欧拉筛选)
     *
     * @param limit 最大数值
     * @return 结果列表
     */
    public static List<Integer> primeList(final int limit) {
        if (limit <= 1) {
            return Collections.emptyList();
        }

        // 存储素数结果的列表
        List<Integer> resultList = new ArrayList<>();
        // 初始化是否为素数列表
        List<Boolean> isPrimeList = CollectionUtils.fill(limit, true);
        for (int i = 0; i < limit; i++) {
            isPrimeList.add(true);
        }

        for (int i = 2; i < limit; i++) {
            if (isPrimeList.get(i)) {
                // 加入素数列表
                resultList.add(i);
            }

            final int pos = resultList.size();
            for (int j = 0; j < pos && i * resultList.get(j) < limit; j++) {
                int notPrimeIndex = i * resultList.get(j);
                isPrimeList.set(notPrimeIndex, false);
                //标注一
                if (i % resultList.get(j) == 0) {
                    break;
                }
            }
        }

        return resultList;
    }
```

# 总结

1. 最好的算法都是线性的

2. 一般都需要数学作为基础。

# 参考资料
 
[素数-百度百科](https://baike.baidu.com/item/%E8%B4%A8%E6%95%B0/263515?fromtitle=%E7%B4%A0%E6%95%B0&fromid=115069&fr=aladdin)

[数论部分第一节：素数与素性测试](http://www.matrix67.com/blog/archives/234)

[C语言判断素数（求素数）（两种方法）](http://c.biancheng.net/view/498.html)

[经典的找素数算法：Sieve of Eratosthenes](https://blog.csdn.net/endurehero/article/details/82560241)

[素数判断算法(高效率）](https://blog.csdn.net/liukehua123/article/details/5482854)

[素数之美-证明](https://spaces.ac.cn/archives/2800)

[不可思议的素数（上）](https://mp.weixin.qq.com/s?__biz=MzA5ODUxOTA5Mg==&mid=2652560693&idx=1&sn=690c6ba271a7d4ee594ccbd2f0a4c946&chksm=8b7e2c6ebc09a578f6c91ce32e93a3358856db3c3f5bd26b33de0a9738f83d178a24d193bb6a&scene=21#wechat_redirect)


## 经典算法

- 埃氏筛法

[埃氏筛法搜寻1亿以内素数](http://fcode.cn/algorithm-144-1.html)

[筛法求素数(埃氏筛法+线性筛法+6倍数判别法)](https://blog.csdn.net/u011590573/article/details/81451542)

- 线性筛选(欧拉筛选)

[线性筛选(欧拉筛选)](https://www.cnblogs.com/grubbyskyer/p/3852421.html)

[线性筛法(欧拉筛法)求素数](https://www.cnblogs.com/tmzbot/p/4006032.html)

[关于线性素数筛](https://blog.csdn.net/qq_38515845/article/details/82322774)

[线性筛素数 证明详解](https://blog.csdn.net/sdz20172133/article/details/81323662)

[这只菜鸟总算搞懂了线性筛素数](https://www.jianshu.com/p/f16d318efe9b)

[线性筛法](https://www.cnblogs.com/war1111/p/7401426.html)

* any list
{:toc}

