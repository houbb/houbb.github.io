---
layout: post
title:  Math-数学拓展欧几里德算法
date:  2017-8-23 10:04:34 +0800
categories: [Math]
tags: [math]
published: true
---


# 拓展欧几里得算法

对于不完全为 0 的非负整数 a，b，gcd（a，b）表示 a，b 的最大公约数，必然

存在整数对 x，y ，使得 `gcd（a，b）=ax+by`。

## 求解过程

求解 x，y的方法及证明 （设 a>b）

1，显然当 b=0，gcd（a，b）=a。此时 x=1，y=0；

2，a>b>0 时，设 ax1+ by1= gcd(a,b);

bx2+ (a mod b)y2= gcd(b,a mod b);

根据朴素的欧几里德原理有 gcd(a,b) = gcd(b,a mod b);

则: ax1+ by1= bx2+ (a mod b)y2;

即: ax1+ by1 = bx2+ (a - [a / b] * b)y2 = ay2 + bx2- [a / b] * by2;

说明： `a-[a/b]*b` 即为mod运算。`[a/b]`代表取小于a/b的最大整数。

也就是 ax1+ by1 == ay2+ b(x2- [a / b] *y2);

根据恒等定理得：x1=y2; y1=x2- [a / b] *y2;

这样我们就得到了求解 x1,y1 的方法：x1，y1 的值基于 x2，y2.

上面的思想是以递归定义的，因为 gcd 不断的递归求解一定会有个时候 b=0，所以递归可以结束。

递归边界：gcd（a,0）=1*a-0*0=a。

# 代码实现

扩展欧几里德算法是用来在已知a, b求解一组x，y使得ax+by = Gcd(a, b) =d(解一定存在，根据数论中的相关定理)。

扩展欧几里德常用在求解模线性方程及方程组中。

下面是一个使用C++的实现：

## 递归形式

```c++
#include<iostream>
using namespace std;

int exgcd(int a,int b,int &x,int &y)
{
     if(b==0)
    {
        x=1;
        y=0;
        return a;
    }
    int gcd=exgcd(b,a%b,x,y);
    int x2=x,y2=y;
    x=y2;
    y=x2-(a/b)*y2;
    return gcd;
}
```

## 非递归

```c
int exgcd(int a,int b,int &x,int &y)
{
    int x1,y1,x0,y0;
    x0=1; y0=0;
    x1=0; y1=1;
    x=0; y=1;
    int r=a%b;
    int q=(a-r)/b;
    while(r)
    {
        x=x0-q*x1; y=y0-q*y1;
        x0=x1; y0=y1;
        x1=x; y1=y;
        a=b; b=r; r=a%b;
        q=(a-r)/b;
    }
    return b;
}
```


# 乘法逆元

（A和MOD互素的时候才存在，否则不存在逆元）

## 比如单表乘法加密

26 个英文字母

5 和 26 互素。

5*21 = 105%26 = 1

- 什么意思呢？

字母A，首先乘以5，变为 ABCDE 中的 E

然后怎么变回来？

乘以对应的逆元。E*21=105%26=1=A  又回到了最初的位置。

## 同余模定理

首先同余模定理如下：

(a+b)%c=(a%c+b%c)%c;

(a*b)%c=(a%c*b%c)%c;

也就是说对于取模的加减法，和乘法我们都可以运用同余模定理来进行计算，那么，对于除法我们应该怎么办呢？

首先想到的就是把除法转换成乘法，然后就可以运用定理了。

## 逆元

怎么转换呢，在普通乘法中，我们知道，除以一个数就等于乘上一个数的倒数，其实这个倒数就是我们所谓的逆元。

A*（A的逆元）=单位元。

在普通的乘法中 A的逆元就是它的倒数。 

那么，在模n乘法中，我们应该怎么求逆元呢？

我们设A的逆元为X，那么我们就可以得到 `(A*X)%MOD=1`（模n乘法的单位元也是1）。

对这个式子进行变形 ，就可以得到：

(A*X)%MOD=1；那么肯定存在k使得

A*X=k*MOD+1；

移项可得：A*X-k*MOD=1;

所以，当A和MOD互素时，就可以写成

A*X-k*MOD=gcd(A,MOD)；

如果把A看做a，MOD看做b，X看做x，-k看做y的话，则上式可化为：

ax+by=gcd(a,b)；

这样就可以用扩展欧几里得算法求出来x了，也就是我们要找的逆元。

# 求解ax=c(mod b)

（也就是ax+by=c（同上逆元的变化方式））的x的最小整数解

ax=c(mod b)可以转化为ax+by=c。

（变化的方式同求逆元的时候的变化。）

我们可以用扩展欧几里得算法得出ax+by=gcd(a,b) 的一组解（x1,y1），那么其他解呢？

任取另一组解（x2,y2）,则ax1+by1=ax2+by2（因为它们都等于gcd(a,b) ），变形得a(x1-x2)=b(y2-y1)。假设gcd(a,b)=g，方程左右两边同时除以g（如果g=0，说明a或b等于0，可以特殊判断），得a'(x1-x2)=b'(y2-y1)，其中a'=a/g，b'=b/g。

注意，此时a'和b'互素（想想分数的化简），则因此x1-x2一定是b'的整数倍（因为a'中不包含b'，所以x1-x2一定包含b'）。

设它为kb'，计算得y2-y1=ka'。

注意，上述的推导过程并没有用到“ax+by的右边是什么”，因此得出以下结论：

设a,b,c为任意整数，若方程ax+by=c的一组解是（x0,y0），则它的任意整数解都可以写成（x0+kb',y0-ka'），其中a'=a/gcd(a,b)，b'=b/gcd(a,b)，k取任意整数。

这样我们就可以求出来最小的整数解了。（先用扩展欧几里得算法求出一组解，然后进行变换）。

```c
int cal(int a,int b,int c)
{
	int x,y;
	int gcd=(a,b,x,y);
	if(c%gcd!=0)
		return -1;//代表无解 
	//  ax0+by0=gcd(a,b)                                方程一 
	//同时乘以c/gcd(a,b)得   
	// (a*c/gcd(a,b))*x0+(b*c/gcd(a,b))*y0=c;
	// 令 x1=c/gcd(a,b)*x0  y1=c/gcd(a,b)*y0;
	// 则可得 ax1+by1=c                                 方程二 
	// 这时得出方程的一个解   x1=x0*c/gcd(a,b)     y1=y0*c/gcd(a,b)  
	x*=c/gcd; //将 方程一的一个特解转化成方程2的一个特解 
	//套用上文的公式可得对方程二
	// b'=b/gcd(a,b);
	b/=gcd;   
	if(b<0)//处理小于0的特殊情况 
		b=-b;
	//对特解x  +- kb'  找到最小整数解
	//设x=kb'+r
	//那么我们想要求的整数解就是r
	//直接取模运算即可 
	int ans=x%b; 
	//把负数的r转化成正数的 
	if(ans<=0)
		ans+=b;
	return ans;
}
```

# 直线上的整数点

在平面坐标系下，ax+by=c是一条直线方程。

知道一个点，我们就可以用应用二中的方法去求直线上的所有整数点。

# 参考资料

[算法学习 之 欧几里得算法和扩展欧几里得算法（二）](https://www.cnblogs.com/haveyoueverbeen/p/4612753.html)

[扩展欧几里德算法](https://baike.baidu.com/item/%E6%89%A9%E5%B1%95%E6%AC%A7%E5%87%A0%E9%87%8C%E5%BE%B7%E7%AE%97%E6%B3%95/1053275?fr=aladdin)

- 乘法逆元

[乘法逆元](http://www.51ui.cn/zldl/chengfaniyuan/)

* any list
{:toc}

