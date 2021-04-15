---
layout: post
title: 老马学机器学习-04-java 类似于 numpy 的开源库 ND4j 简介
date:  2019-4-16 10:55:13 +0800
categories: [ML]
tags: [ML, ai, math, sh]
published: true
---

# 序言

API 有一个非常强大之处在于，是完全可以跨语言的。

numpy 工具强大到令人赞叹，那么 java 有没有类似的开源库呢？

答案是有的。

numpy 对应就是 ND4j。

# ND4j

[ND4J](http://nd4j.org/cn/getstarted) 是Java编写的开源、分布式深度学习项目，由总部位于旧金山的商业智能和企业软件公司Skymind牵头开发。

团队成员包括数据专家、深度学习专家、Java程序员和具有一定感知力的机器人。
 
通过科学计算，分析师能够从大数据中挖掘出价值。我们认为，业内对深入理解和挖掘数据之货币价值的旅程才刚刚起步。

因此，我们决定在Java虚拟机（JVM）环境下运用科学计算。

# 快速开始

## maven 引入

```xml
<dependency>
    <groupId>org.nd4j</groupId>
    <artifactId>nd4j-native-platform</artifactId>
    <version>1.0.0-beta6</version>
</dependency>
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.1.7<</version>
</dependency>
```

# 矩阵的创建

## 创建一个全0的矩阵

创建一个全0的矩阵使用zeros方法

```java
INDArray zeros = Nd4j.zeros(3,5);
```

构造一个3行5列的全0 的 ndarray。

如下：

```
[[         0,         0,         0,         0,         0], 
 [         0,         0,         0,         0,         0], 
 [         0,         0,         0,         0,         0]]
```

## 创建一个全1的矩阵

```java
INDArray ones = Nd4j.ones(3,5);
```

如下：

```
[[    1.0000,    1.0000,    1.0000,    1.0000,    1.0000], 
 [    1.0000,    1.0000,    1.0000,    1.0000,    1.0000], 
 [    1.0000,    1.0000,    1.0000,    1.0000,    1.0000]]
```

## 创建一个随机矩阵

```java
INDArray rand = Nd4j.rand(3,5);
```

如下：

```
[[    0.7856,    0.6902,    0.9957,    0.2112,    0.6514], 
 [    0.2687,    0.9486,    0.2844,    0.5083,    0.0264], 
 [    0.8163,    0.3329,    0.0089,    0.1918,    0.0853]]
```

## 根据数组来创建矩阵

```java
INDArray array1 = Nd4j.create(new float[]{2,2,2,2} ,new int[]{1,4});
```

如下：

```
[[    2.0000,    2.0000,    2.0000,    2.0000]]
```

```java
INDArray array2 = Nd4j.create(new float[]{5,2,6,2,6,6,6,6,9},new int[]{3,3});
```

如下：

```
[[    5.0000,    2.0000,    6.0000], 
 [    2.0000,    6.0000,    6.0000], 
 [    6.0000,    6.0000,    9.0000]]
```

# 矩阵的修改

## 创建

```java
INDArray nd = Nd4j.create(new float[]{1,2,3,4,5,6,7,8},new int[]{2,4});
```

如下：

```
[[    1.0000,    2.0000,    3.0000,    4.0000], 
[    5.0000,    6.0000,    7.0000,    8.0000]]
```

```java
double value = nd.getDouble(1, 3);      //8.0 
```

## 修改

现在对矩阵的值进行修改。

第1行第4列的值改为100

```java
nd.putScalar(0,3,100);
```

## 获取矩阵的一行

```java
INDArray row = nd.getRow(1);
```

- 替换第一行数据

```java
INDArray row2 = Nd4j.create(new float[] {2,4,6,8});
nd.putRow(1,row2);
```

# 矩阵的计算

## 创建

```java
//1*2
INDArray nd1 = Nd4j.create(new float[]{2,2},new int[]{1,2});
//2*1
INDArray nd2 = Nd4j.create(new float[]{3,3},new int[]{2,1});
//2*2
INDArray nd3 = Nd4j.create(new float[]{3,3,3,3},new int[]{2,2});
//2*2
INDArray nd4 = Nd4j.create(new float[]{4,4,4,4},new int[]{2,2});
```

## 矩阵加法

### 标量

矩阵1[2,2] 加上 一个标量 6 = [8,8]

```java
INDArray add_num = nd1.add(6);
```

结果：

```
[[    8.0000,    8.0000]]
```

### 矩阵

矩阵3 + 矩阵 4

```java
INDArray add_NDArray = nd3.add(nd4);
```

结果：

```
[[    7.0000,    7.0000],
 [    7.0000,    7.0000]]
```

## 矩阵减法

### 标量

```java
INDArray sub_num = nd1.sub(6);
```

输出：

```
[[   -4.0000,   -4.0000]] 
```

### 矩阵

```java
INDArray sub_NDArray = nd3.sub(nd4);
```

输出：

```
[[   -1.0000,   -1.0000], 
 [   -1.0000,   -1.0000]]
```

## 矩阵乘法

### 矩阵1 乘 矩阵2

```java
INDArray add = nd1.mmul(nd2);
```

结果

```
[[12.0000]]
```

### 矩阵2 乘 矩阵1

```java
INDArray add = nd2.mmul(nd1);
```

结果：

```
[[    6.0000,    6.0000], 
[    6.0000,    6.0000]]
```

## 矩阵除法

```java
INDArray div_num = nd1.div(2);
```

输出

```
 [[    1.0000,    1.0000]] 
```

## 矩阵转置

```java
INDArray transpose = nd2.transpose();
```

```
nd2 = [[3.0000],
       [3.0000]]
       
转置 = [[    3.0000,    3.0000]]
```

# 总结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

《统计学习方法》

[ND4J矩阵的基本操作](https://xiaoshuai.blog.csdn.net/article/details/104858991)

http://nd4j.org/cn/userguide#creating

* any list
{:toc}