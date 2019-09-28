---
layout: post
title:  Hash 完美 hash
date:  2018-05-30 09:57:55 +0800
categories: [Algorithm]
tags: [algorithm, hash, sh]
published: true
---

# 缘起

前几天去参加云栖大会 2019，在会上听到这个名词。

感觉很有趣，值得学习一波。

# 完美哈希函数(Perfect Hash Function)

完美 哈希函数（Perfect Hash Function，简称PHF）是没有冲突的哈希函数，也就是，函数 H 将 N 个 KEY 值映射到 M 个整数上，这里 M>=N ，而且，对于任意的 KEY1 ，KEY2 ，H( KEY1 ) != H( KEY2 ) ，并且，如果 M = = N ，则 H 是最小完美哈希函数（Minimal Perfect Hash Function，简称MPHF）。

完美哈希函数是静态的，就意味着事前必须知道需要哈希哪些数据。

同时生成的算法比较复杂，需要很长的时间来建立索引。没有办法实时添加更新。给他的应用范围提了个极大的限制。

## 使用场景

在现实情况中，很难构造完美的散列算法。

因为通常几乎不可能提前知道要散列的完整数据集。例

如，在我们马上将探讨的一个程序中，散列表用于统计文本中的重复单词。

由于我们事先不知道哪些单词出现在文本中，就不能编写一个完美的算法。

数据仓库的查询索引，还有一些不需要更新且对性能有要求的场景，这个算法是适用的。

## 什么时候使用PHF和MPHF

通常情况下，PHF或MPHF是针对静态集合的。

也就是，在使用PHF或MPHF时，所有的 KEY 值是事先已知并且固定的。

不过，这里有针对动态集合的一个算法。

> [针对动态集合的一个算法](http://citeseer.ist.psu.edu/dietzfelbinger90dynamic.html)


# 使用PHF和MPHF的一般流程

## （准备阶 段）

将已知的所有的 KEY 值传给PHF或MPHF生成算法，生成PHF或MPHF以及相应的数据；

【这也是完美hash函数的一大缺点：必须事前必须知道原数据集，并且需要花一定的CPU来生成这个函数】

## （使用阶 段）

调用已有的PHF或MPHF以及相应的数据快速计算哈希值并进行相应的操作。

其实在实际使用中我们只关心步骤2，但步骤1的生成算法却是PHF或MPHF的关键。

# PHF和MPHF的集中生成程序库

## gperf

GNU的完美哈希函数生成程序，可以生成PHF和MPHF，生成MPHF时和输入数据以及参数设置的关系比较大。

使用的应该是比较简单的算法， 生成的效率不高，当数据量大时，程序就没什么反应了。

生成的结果是代码（里面包含有数据，直接组织在代码里），移植性非常好。

很多编译器对保留字的处理都采用gperf来建立完美哈希函数。

Windows版的可执行文件可以从[这里下载](http://gnuwin32.sourceforge.net/packages/gperf.htm)，
源代码可以从[这里下载](http://directory.fsf.org/GNU/gperf.html)，一篇介绍论文[在这里](http://www.cse.wustl.edu/~doc/pspdfs/gperf.pdf)， 
说明书[在这里](http://cclib.nsu.ru/projects/gnudocs/gnudocs/gperf/gperf_toc.html)，说明书中文翻译[在这里](http://blog.csdn.net/wenfengmtd/archive/2006/06/12/792692.aspx)。

易用性：5
稳定性：5
移植性：5
效率： 2
MPHF： 2

> [gperf](http://www.gnu.org/software/gperf/)

## CMPH

巴西的这个哥们Fabiano C. Botelho发了很多MPHF方面的论文。

CMPH应该他和其他几个人开发的开源的生成MPHF的程序库。 

这里面封装了4个算法，而且设计了一个程序框架（搞不懂他们为什么要设计这样一个框架，用MPHF的人不会像他们做研究那样会一次使用那么多个算法的，而这样一个框架明显增加了使用的难度）。

里面有几个算法是针对大数据量的，但简单试了试，发现并不像他们论文里宣称的那样高效，而且由于是一个框架，生成的MPHF并不能直接脱离他们的环境来使用。

这里是他们在 [SourceForge](http://sourceforge.net/projects/cmph) 上的链接。

易用性：3
稳定性：2
移植性：2
效率： 2
MPHF：5

> [CMPH](http://cmph.sourceforge.net/index.html)


## mph

又一个牛人写的生成MPHF的算法，注意了，他写这个纯粹是为了好玩。

简单试了试，可以直接生成代码，但不是很好用，针对大数据量效率也不行。

易用性：3
稳定性：3
移植性：4
效率 ： 3
MPHF：5


> [mph](http://www.ibiblio.org/pub/Linux/devel/lang/c/mph-1.2.tar.gz)

## 无名

又又一个牛人写的生成MPHF的算法，比较好用，可以处理大数据量的集合，而且比较有特色的是关键字不仅仅可以是字符串，还可以是整数等。

易用性：5
稳定性：5
移植性：4
效率： 5
MPHF：5

> [无名](http://burtleburtle.net/bob/hash/perfect.html)

## perfect_hash.py

以上都是用C/C++来实现的PHF或MPHF生成程序，这是一个用Python实现的MPHF生成程序。

还是比较好用的，遗憾的是对大数据量效率不行。

易用性：5
稳定性：5
移植性：4
效率 ：3
MPHF：5

[perfect_hash.py](http://www.amk.ca/python/code/perfect-hash)


# 最小完美哈希函数算法的实现（例子说明）

## 算法实现

该算法的实现方法是这样的。

先构造两个普通的哈希函数h1(x)和h2(x),还有一个用数组实现的函数g(x)。

使得h(x)=g(h1(x))+g(h2(x)) mod n,其中n是参数的总个数，H(x)就是最终的有序最小完美哈希函数了。

以上是定义，说不清楚，举个例子就明白了。

## 例子

取一个n为12的数据集。

首先构造这三个函数：

函数h1和h2:

```
x	    h1函数	h2函数
jezebel	5	    9
jezer	5	    7
...	    ...	    ...
```

函数g:

```
x	g函数
5	0
7	1
9	0
...	...
```

根据上文的公式h(x)=g(h1(x))+g(h2(x)) mod n，可以得出：

```
x	    h计算步骤	h值
jezebel	g(5)+g(9)	0
jezer	g(5)+g(7)	1
...	    ...         ...
```

这里的h就可以最小完美哈希函数算出的值了，很神奇，不是吗？

大致的流程走了一遍，现在最最关键的是h1(x),h2(x)和g(x)是怎么得来的。

h1(x)和h2(x)比较简单，可以使用一个很简便的方法获得：

先定义一个权重数组w[i],这个数据是一系列随机的数。

```
h1=(t[1]∗w[1]+t[2]∗w[2]+...+t[i]∗w[i]) mod m
```

其中t[i]指得的字符串x的第i个字符,m值得的函数的值域。

只要更换一个权重数组，就可以重新构造一个新函数。有很多方法可以构造这两个函数。

g(x)的获得就比较复杂。可以是凑出来的。就如同上面的例子，因为g(5)+g(9) mod 12=0,g(5)+g(7) mod 12=1。

所以我们可以凑出g(5)=0,g(7)=1,g(9)=0这样就可以满足上面的两个条件了。

需要一个数组来存储函数g的结果，当然凑也不能瞎凑，是有方法的，下面专门讲凑的步骤。

# 算法函数生成

首先随意设定一个数，比如是7，设为g(7)=1,因为我们已知g(5)+g(7) mod 12=1，所以可以推论出g(5)=0。

因为g(5)+g(9) mod 12=0，所以可以推出g(9)=0，以此类推就可以了。

但要注意的是千万不能重复设定一个数两次，这样就会形成一个环，永远也推不完。

所以遇到已经推算过的数的时候，要检测环的存在。

这样下去，就可以猜出全部的值了。

现在需要的就是分析这个凑的过程的运行效率问题。这个就要涉及到h1,h2这两个函数的值域大小，如果越大，越容易凑出一个g函数，但是g函数的参数域就会比较大，存储这个g函数的数据就需要占用更多的空间。相反如果值域越小，在凑的时候就非常容易出现环，需要更长的时间才能凑出这个g函数。

## 怎么办呢？

我们可以使用3个的h函数来降低形成环的可能，就是这样h(x)=g(h1(x))+g(h2(x))+g(h3(x)) mod n，这样虽然推理g函数的过程会复杂一些，但是很有效，有实验分析表明，当h函数的值域大约参数域的1.23倍的时候，这个g函数的创建尝试次数是常数。

至此，这个算法介绍完了。这个方法是从《Managing Gigabytes》这本书看到的，这里的讲述更浅显一些。


# C++ 示例代码

```cpp
class Hash {
public:
    Hash(std::list<int> keys)
        :size_(keys.size())
        ,region_sizes(keys.size())
        ,offset_table(keys.size())
        ,a2_array(keys.size()){
 
        // 一级hash
        int sum = 10 * size_;
        int max_sum = 5 * size_;
        while (sum > max_sum) { // 获得分布相对均匀的hash
          a = rnd.rand();
          sum = 0;
 
          for (auto& v : region_sizes) {
              v = 0;
          }
 
          for (auto key : keys) {
              int h = key * a % MAXP % size_;
              ++region_sizes[h];
              sum += region_sizes[h] * region_sizes[h];
          }
        }
 
        // 二级hash
        sum *= 2;
        hash_table.resize(sum, MAXP);
 
        for (auto& v : region_sizes) {
            v *= 2;
        }
        // 计数个区间起始位置
        offset_table[0] = 0;
        for (int i = 1; i < size_; ++i) {
            offset_table[i] = offset_table[i-1] + region_sizes[i-1];
        }
        // 生成二级hash映射系数
        for (auto& v : a2_array) {
            v = rnd.rand();
        }
 
        // 检查是否有碰撞， 如果有碰撞，重新生成映射系数，直到没有碰撞为止
        bool isCollision = true;
        while (isCollision) {
            isCollision = false;
 
            for (auto key : keys) {
                int h1 = a * key % MAXP % size_;
                int h2 = a2_array[h1] * key % MAXP % region_sizes[h1] + offset_table[h1];
 
                if (hash_table[h2] == MAXP
                    || hash_table[h2] == key) {
                    hash_table[h2] = key;
                }
                else {
                    isCollision = true;
                    a2_array[h1] = 0; // 系数需要重新生成
                }
            }
 
            if (isCollision) {
                for (int i = 0; i < size_; ++i) {
                    if (a2_array[i] == 0) {
                        a2_array[i] = rnd.rand();
 
                        // 清除对应区的hash表
                        for (int j = offset_table[i]; j < offset_table[i] + region_sizes[i]; ++j) {
                            hash_table[j] = MAXP;
                        }
                    }
                }
 
            }
        }
    }
 
    int hash(int key) {
        int h1 = a * key % MAXP % size_;
        return a2_array[h1] * key % MAXP % region_sizes[h1] + offset_table[h1];
    }
 
private:
    int a; // 原始映射系数
    int size_; // 所以key的数量
    std::vector<int> region_sizes; // 一级hash计数及保存最终hash表的各区间长度
    std::vector<int> offset_table; // 各区间的起始位置
    std::vector<int> a2_array; // 各区间的映射系数
    std::vector<int> hash_table; // 最终hash表
    HashRand rnd; // 用于生成在区间[1,46337)的随机数
};
```

# 拓展阅读

[bloom filter](https://houbb.github.io/2018/12/05/bloom-filter)

# 参考资料

[计算完美HASH](https://www.xuebuyuan.com/1572933.html)

[哈希表和完美哈希](https://www.cnblogs.com/gaochundong/p/hashtable_and_perfect_hashing.html)

[算法打基础——HashⅡ: 全域哈希与完美哈希](https://www.cnblogs.com/soyscut/p/3396216.html)

[数据结构-最小完美哈希和保序最小完美哈希函数](https://blog.csdn.net/tiankong_/article/details/76789076)

[最小完美哈希函数](http://blog.chinaunix.net/uid-14789604-id-84624.html)

* any list
{:toc}