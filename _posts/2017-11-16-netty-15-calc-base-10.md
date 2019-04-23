---
layout: post
title:  Netty-15-计算的例子
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, io, sh]
published: false
---

# 本地调用

## 接口 

```java
package com.github.houbb.netty.calc.api;

/**
 * 计算接口
 * @author binbin.hou
 * @date 2019/4/22
 * @since 0.0.1
 */
public interface ICalc {

    /**
     * 将两个元素添加起来
     * @param first 第一个元素
     * @param second 第二个元素
     * @return 累计的结果
     */
    int add(int first, int second);

}
```

## 本地调用

```java
package com.github.houbb.netty.calc.local;

import com.github.houbb.netty.calc.api.ICalc;

/**
 * 本地实现
 * @author binbin.hou
 * @date 2019/4/22
 * @since 0.0.1
 */
public class LocalCalc implements ICalc {

    @Override
    public int add(int first, int second) {
        return first+second;
    }

    public static void main(String[] args) {
        ICalc calc = new LocalCalc();
        System.out.println(calc.add(10, 20));
    }

}
```


# 参考资料


* any list
{:toc}

