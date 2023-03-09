---
layout: post
title: java BigDecimal compare equals 
date:  2023-03-09 +0800
categories: [Java]
tags: [java, base, sh]
published: true
---

# 场景

接口中的金额，使用的是 string 类型。

但是需要判断一下金额是否为0，需要一些简单的特判。

# 错误姿势：equals

```java
BigDecimal amt = new BigDecimal(actAmt);
if(BigDecimal.ZERO.equals(amt)) {
    //.xxxx
}
```

但是这个其实有一定的限制，如果数据库的金额为 `0.00` 之类的，其实 equals 比较并不相等。

所以推荐使用 compareTo

## 正确姿势：compareTo

```java
BigDecimal amt = new BigDecimal(actAmt);
if(BigDecimal.ZERO.compareTo(amt) == 0) {
    //.xxxx
}
```

这个时候比较的就是值大小，无论存储的是 `0` 还是 `0.00`。都是符合的。

* any list
{:toc}