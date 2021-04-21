---
layout: post
title: 老马学机器学习-12-线性回归（Linear Regression）
date:  2018-11-14 08:38:35 +0800
categories: [ML]
tags: [ML, ai, math, sh]
published: true
---

# 什么是回归分析

回归分析是一种预测性的建模技术，它研究的是因变量（目标）和自变量（预测器）之间的关系。

这种技术通常用于预测分析，时间序列模型以及发现变量之间的因果关系。

**通常使用曲线/线来拟合数据点，目标是使曲线到数据点的距离差异最小。**

# 线性回归

线性回归是回归问题中的一种，线性回归假设目标值与特征之间线性相关，即满足一个多元一次方程。

通过构建损失函数，来求解损失函数最小时的参数w和b。

通长我们可以表达成如下公式：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0419/224227_20380cda_508704.png "屏幕截图.png")

y^为预测值，自变量x和因变量y是已知的，而我们想实现的是预测新增一个x，其对应的y是多少。

因此，为了构建这个函数关系，目标是通过已知数据点，求解线性模型中w和b两个参数。

# 目标/损失函数

求解最佳参数，需要一个标准来对结果进行衡量，为此我们需要定量化一个目标函数式，使得计算机可以在求解过程中不断地优化。

针对任何模型求解问题，都是最终都是可以得到一组预测值y^ ，对比已有的真实值 y ，数据行数为 n ，可以将损失函数定义如下：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0419/224302_7fdfe9e6_508704.png "屏幕截图.png")

即预测值与真实值之间的平均的平方距离，统计中一般称其为MAE(mean square error)均方误差。

把之前的函数式代入损失函数，并且将需要求解的参数w和b看做是函数L的自变量，可得

![输入图片说明](https://images.gitee.com/uploads/images/2021/0419/224320_ce67e16f_508704.png "屏幕截图.png")

现在的任务是求解最小化L时w和b的值，

即核心目标优化式为

![输入图片说明](https://images.gitee.com/uploads/images/2021/0419/224343_094bc952_508704.png "屏幕截图.png")

# 求解方式有两种：

## 1）最小二乘法(least square method)

求解 w 和 b 是使损失函数最小化的过程，在统计中，称为线性回归模型的最小二乘“参数估计”(parameter estimation)。

我们可以将 L(w,b) 分别对 w 和 b 求导，得到

![输入图片说明](https://images.gitee.com/uploads/images/2021/0419/224406_45aec196_508704.png "屏幕截图.png")

令上述两式为0，可得到 w 和 b 最优解的闭式(closed-form)解：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0419/224422_3a6ecefa_508704.png "屏幕截图.png")

## 2）梯度下降(gradient descent)

梯度下降核心内容是对自变量进行不断的更新（针对w和b求偏导），使得目标函数不断逼近最小值的过程

![输入图片说明](https://images.gitee.com/uploads/images/2021/0419/224441_d38882d3_508704.png "屏幕截图.png")

# 最小二乘法公式推导

求出这样一些未知参数使得样本点和拟合线的总误差（距离）最小

最直观的感受如下图。

![输入图片说明](https://images.gitee.com/uploads/images/2021/0421/225459_b206f9ca_508704.png "屏幕截图.png")

而这个误差（距离）可以直接相减，但是直接相减会有正有负，相互抵消了，所以就用差的平方

# 推导过程

## 1 写出拟合方程

y=a+bx

## 2 现有样本(x1,y1),(x2,y2)...(xn,yn)

## 3 设di为样本点到拟合线的距离，即误差

di=yi−(a+bxi)

## 4 设D为差方和（为什么要取平方前面已说，防止正负相互抵消）

![输入图片说明](https://images.gitee.com/uploads/images/2021/0421/225657_53338162_508704.png "屏幕截图 2021-04-21 225643.png")

## 5 根据一阶导数等于0，二阶大于等于0（证明略）求出未知参数

对a求一阶偏导

![输入图片说明](https://images.gitee.com/uploads/images/2021/0421/225747_18de1220_508704.png "屏幕截图 2021-04-21 225738.png")

对b求一阶偏导

![输入图片说明](https://images.gitee.com/uploads/images/2021/0421/225822_75e48b5b_508704.png "屏幕截图 2021-04-21 225811.png")

令偏导等于0得

![输入图片说明](https://images.gitee.com/uploads/images/2021/0421/225912_3eb9e36a_508704.png "屏幕截图 2021-04-21 225902.png")

ps: 知道了公式之后代码实现起来就会非常简单。

# java 实现

```java
package com.github.houbb.gene.math;

import java.util.Arrays;
import java.util.List;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class LinerRegression {

    private static class Point {
        private double x;
        private double y;

        public Point(double x, double y) {
            this.x = x;
            this.y = y;
        }

        public double getX() {
            return x;
        }

        public double getY() {
            return y;
        }
    }

    public void regression(List<Point> list) {
        //1. 計算 x/y 的平均值
        double[] means = calcMean(list);
        double xMean = means[0];
        double yMean = means[1];

        // 假设方程为 y = a + bx
        double sum = 0;
        double sumDiv = 1;
        for(Point point : list) {
            double x = point.getX();
            double y = point.getY();

            sum += (x - xMean) * (y - yMean);
            sumDiv += (x - xMean) * (x - xMean);
        }

        double b = sum / sumDiv;
        double a = yMean - b * xMean;

        System.out.println("线性回归方程：y = " + a + " + ("+ b + ")*x");
    }

    /**
     * 計算 x/y 的平均值
     * @param list 列表
     * @return 结果
     */
    private double[] calcMean(List<Point> list) {
        double xSum = 0;
        double ySum = 0;
        for(Point point : list) {
            xSum += point.getX();
            ySum += point.getY();
        }

        // 平均值
        double xMean = xSum / list.size();
        double yMean = ySum / list.size();
        return new double[]{xMean, yMean};
    }


    public static void main(String[] args) {
        List<Point> list = Arrays.asList(new Point(1,1),
                new Point(2,2), new Point(3,3), new Point(4,4));

        LinerRegression regression = new LinerRegression();
        regression.regression(list);

//        y = 0.4166666666666665 + (0.8333333333333334)*x
        System.out.println(0.4166666666666665 + 0.8333333333333334 * 2);
    }

}
```

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[机器学习 | 算法笔记- 线性回归（Linear Regression）](https://www.cnblogs.com/geo-will/p/10468253.html)

* any list
{:toc}