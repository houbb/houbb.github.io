---
layout: post
title:  Math-数学欧几里德算法(辗转相除法) GCD
date:  2017-8-23 10:04:34 +0800
categories: [Math]
tags: [math]
published: true
---


# 欧几里德算法

欧几里德算法又称辗转相除法，是指用于计算两个正整数a，b的最大公约数。

应用领域有数学和计算机两个方面。

## 计算公式

```
gcd(a,b) = gcd(b,a mod b)
```

## 时间复杂度

a mod b必然是小于a/2的，而上一次的b会变成下一次的a，上一次的a mod b会变成下一次的b，最坏情况也就是b在a/2附近，即a mod b在a/2附近。

在最坏情况时每次的值也会减少一半，所以说时间复杂度是 `O(logn)` 的。（实际中往往会更低）

# 证明

## 基本定理

其计算原理依赖于下面的定理：

定理：两个整数的最大公约数等于其中较小的那个数和两数相除余数的最大公约数。

最大公约数（Greatest Common Divisor）缩写为GCD。

```
gcd(a,b) = gcd(b,a mod b) (不妨设a>b 且r=a mod b ,r不为0)
```

## 证法一

a可以表示成a = kb + r（a，b，k，r皆为正整数，且r < b），则r = a mod b

假设d是a,b的一个公约数，记作d|a,d|b，即a和b都可以被d整除。

而r = a - kb，两边同时除以d，r/d=a/d-kb/d=m，由等式右边可知m为整数，因此d|r

因此d也是b,a mod b的公约数

假设d是b,a mod b的公约数, 则d|b,d|(a-k*b),k是一个整数。

进而d|a.因此d也是a,b的公约数

因此(a,b)和(b,a mod b)的公约数是一样的，其最大公约数也必然相等，得证。

## 证法二

第一步：令c=gcd(a,b)，则设a=mc，b=nc

第二步：可知r = a-kb = mc-knc = (m-kn)c

第三步：根据第二步结果可知c也是r的因数

第四步：可以断定m-kn与n互素【否则，可设m-kn=xd,n=yd,(d>1)，则m=kn+xd=kyd+xd=(ky+x)d，则a=mc=(ky+x)dc，b=nc=ycd，故a与b最大公约数≥cd，而非c，与前面结论矛盾】

从而可知gcd(b,r)=c，继而gcd(a,b)=gcd(b,r)，得证

注意: 两种方法是有区别的。

# 主要用途

## 核心功能

计算两个正整数a，b的最大公约数

## 加密

比如 RSA 加密。

应用于单表加密。

## 负载均衡

Robin 轮循。

# 编码实现

## 程序设计

辗转相除法是利用以下性质来确定两个正整数 a 和 b 的最大公因子的：

⒈ 若 r 是 a ÷ b 的余数，且r不为0， 则

gcd(a,b) = gcd(b,r)

⒉ a 和其倍数之最大公因子为 a。

另一种写法是：

⒈ 令r为a/b所得余数（0 ≤ r < b）

若 r=0，算法结束；b 即为答案。

⒉ 互换：置 a←b，b←r，并返回第一步。

## java 版本

```java
int divisor(int m,int n)
{
    if (m % n == 0) {
        return n;
    }
    else {
        return divisor(n,m % n);
    }
}
```

# 拓展阅读

[欧拉定理]()

[扩展欧几里得算法及其应用-乘法逆元]()

[Stein 算法]()

# 推广

## 计算 n 个正整数的最大公约数

# 参考资料

[欧几里德算法-百度百科](https://baike.baidu.com/item/%E6%AC%A7%E5%87%A0%E9%87%8C%E5%BE%B7%E7%AE%97%E6%B3%95)

[关于扩展欧几里得算法？](https://www.zhihu.com/question/30067108)
 
[欧几里得算法与扩展欧几里得算法_C++](https://www.cnblogs.com/hadilo/p/5914302.html)

[扩展欧几里得算法](https://blog.csdn.net/ftx456789/article/details/72884981)

[扩展欧几里得算法](https://cloud.tencent.com/developer/article/1345994)

[欧几里得算法心得(辗转相除法)](https://www.jianshu.com/p/7876eb2dff89)

* any list
{:toc}

