---
layout: post
title:  分布式标识 Distributed ID-03-Random
date:  2018-09-05 08:53:10 +0800
categories: [Distributed]
tags: [id, distributed, random, sh]
published: true
---

# 实现方式

```java
package com.github.houbb.heaven.util.id.impl;

import com.github.houbb.heaven.annotation.ThreadSafe;
import com.github.houbb.heaven.util.id.Id;
import com.github.houbb.heaven.util.util.DateUtil;
import com.github.houbb.heaven.util.util.RandomUtil;

import java.util.Date;

/**
 * 基于随机数生成的随机数字标识
 *
 * 组成方式：前缀+15位时间戳+后续随机数字
 *
 * 重复概率：1 Mills 内重复的概率为 1/(10)^10
 *
 * 应用场景：平时生成随机的标识。
 *
 * 优点：便于阅读，生成方便。
 * 缺点：重复的概率和后续随机的长度有关，有时候可能会过长。
 *
 * @author binbin.hou
 * @since 0.1.12
 * @see com.github.houbb.heaven.util.util.DateUtil#TIMESTAMP_FORMAT_15 15 位时间戳
 */
@ThreadSafe
public class RandomNumId implements Id {

    @Override
    public String genId() {
        final int randomLength = 10;
        final String timestamp = DateUtil.getDateFormat(new Date(), DateUtil.TIMESTAMP_FORMAT_15);
        return timestamp+ RandomUtil.randomNumber(randomLength);
    }

}
```

# 个人收获

## 概率

是否会碰撞，本身就是一件概率事件。

* any list
{:toc}