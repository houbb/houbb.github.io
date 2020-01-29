---
layout: post
title: 矩阵乘法简介 Matrix multiplication
date:  2020-1-28 10:09:32 +0800
categories: [Math]
tags: [math, matrix, sf]
published: true
---

# 矩阵乘法

矩阵相乘最重要的方法是一般矩阵乘积。

**它只有在第一个矩阵的列数（column）和第二个矩阵的行数（row）相同时才有意义。**

一般单指矩阵乘积时，指的便是一般矩阵乘积。

一个m×n的矩阵就是m×n个数排成m行n列的一个数阵。

由于它把许多数据紧凑地集中到了一起，所以有时候可以简便地表示一些复杂的模型，如电力系统网络模型。

## 定义

![image](https://user-images.githubusercontent.com/18375710/73325293-ea2ca000-4288-11ea-89a2-a1540869b189.png)

## 基本性质

- 乘法结合律： (AB)C=A(BC)． 

- 乘法左分配律：(A+B)C=AC+BC  

- 乘法右分配律：C(A+B)=CA+CB  

- 对数乘的结合性k(AB）=(kA)B=A(kB）．

- 转置 (AB)^T=B^T A^T．

- 矩阵乘法一般**不满足交换律。**

## 注意事项

1、当矩阵A的列数（column）等于矩阵B的行数（row）时，A与B可以相乘。

2、矩阵C的行数等于矩阵A的行数，C的列数等于B的列数。

3、乘积C的第m行第n列的元素等于矩阵A的第m行的元素与矩阵B的第n列对应元素乘积之和。

## 其他乘积形式

除了上述的矩阵乘法以外，还有其他一些特殊的“乘积”形式被定义在矩阵上，值得注意的是，当提及“矩阵相乘”或者“矩阵乘法”的时候，并不是指代这些特殊的乘积形式，而是定义中所描述的矩阵乘法。

在描述这些特殊乘积时，使用这些运算的专用名称和符号来避免表述歧义。

![image](https://user-images.githubusercontent.com/18375710/73325473-9f5f5800-4289-11ea-911a-898d8931f3d9.png)

# C 代码实现

## 代码

```cpp
struct Matrix:vector<vector<int> >//使用标准容器vector做基类，需#include语句
{
     
    Matrix(int x=0,int y=0,int z=0)//初始化，默认为0行0列空矩阵
     
    {
         
        assign(x,vector<int>(y,z));
    
    }
     
int h_size()const//常量说明不可省，否则编译无法通过
     
{
         
return size();
     
}
     
int l_size()const
     
{
         
return empty()?0:front().size();//列数要考虑空矩阵的情况
     
}
     
Matrix pow(int k);//矩阵的k次幂，用快速幂实现，k为0时返回此矩阵的单位矩阵
};
 
Matrix operator*(const Matrix &m,const Matrix &n)//常量引用避免拷贝
 
{
    if(m.l_size()!=n.h_size())return Matrix();//非法运算返回空矩阵
     
Matrix ans(m.h_size(),n.l_size());
     
for(int i=0; i!=ans.h_size(); ++i)
         
for(int j=0; j!=ans.l_size(); ++j)
             
for(int k=0; k!=m.l_size(); ++k)
                 
ans[i][j]+=m[i][k]*n[k][j];
    
return ans;
 
}
 
Matrix Matrix::pow(int k)
 
{
     
if(k==0)
     
{
         
Matrix ans(h_size(),h_size());
         
for(int i=0; i!=ans.h_size(); ++i)
             
ans[i][i]=1;
        return ans;
     
}
     
if(k==2)return (*this)*(*this);
     
if(k%2)return pow(k-1)*(*this);
     
return pow(k/2).pow(2);
}
```


# java简单实现

为了简单（其实原理差不多），我们用 Java 实现最简单的的一维数组*二维数组的 java 实现。

```java
/**
 * m*p × p*n
 * 结果：m*n 的数组
 * 这里是一个特例，m=1;
 *
 * @param arrayOne 一维数组 m*p
 * @param arrayTwo 二维数组 p*n
 * @return 一维数组
 */
public static double[] dot(double[] arrayOne, double[][] arrayTwo) {
    // 结果：行=one.行，列= two.列
    double[] result = new double[arrayTwo.length];
    // 要求：one.列=two.行
    assert arrayOne.length == arrayTwo[0].length;
    // 计算
    //one.i=0; 只有一行
    for (int i = 0; i < 1; i++) {
        //two.j 的列
        for (int j = 0; j < arrayTwo.length; j++) {
            // p=one.列=two.行
            double item = 0.0;
            for (int p = 0; p < arrayOne.length; p++) {
                item += arrayOne[p] * arrayTwo[p][j];
            }
            // i,j 的数据存储
            result[j] = item;
        }
    }
    return result;
}
```


## 个人感受

首先不关心这些实现的过程，我们要理解的是整个矩阵乘法的过程。

因为各种计算的流程是固定的，原本对于人而言的复杂计算，一旦流程固定，就可以通过代码去实现。

# 拓展阅读

[python numpy 入门学习](https://houbb.github.io/2019/04/16/numpy-02-quick-start-02)

[数学计算库-colt](https://houbb.github.io/2019/05/10/math-colt-01-overview-01)

[Github 数学库 Commons Math, Colt, Quant](https://houbb.github.io/2019/02/25/github-04-lib-math-04)

[apache common math 库简介](https://houbb.github.io/2019/05/10/math-commons-01-overview-01)

# 参考资料

[百度百科-矩阵乘法](https://baike.baidu.com/item/%E7%9F%A9%E9%98%B5%E4%B9%98%E6%B3%95/5446029?fr=aladdin)

* any list
{:toc}