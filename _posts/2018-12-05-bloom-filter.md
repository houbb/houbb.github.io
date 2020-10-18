---
layout: post
title: Bloom Filter 
date: 2018-12-05 11:35:23 +0800
categories: [Althgorim]
tags: [althgorim, sh]
published: true
excerpt: Bloom Filter 布隆过滤器算法
---

# Bloom Filter 

布隆过滤器（英语：Bloom Filter）是1970年由布隆提出的。

它实际上是一个很长的二进制向量和一系列随机映射函数。

布隆过滤器可以用于检索一个元素是否在一个集合中。

它的优点是空间效率和查询时间都远远超过一般的算法，缺点是有一定的误识别率和删除困难。

![布隆过滤器](https://p3-tt.byteimg.com/origin/dfic-imagehandler/78523def-3c95-4b69-bf22-56281132af9a?from=pc)

## 布隆过滤器速成

布隆过滤器在本质上是二进制向量。在高层级上，布隆过滤器以下面的方式工作：

添加元素到过滤器。

对元素进行几次哈希运算，当索引匹配哈希的结果时，将该位设置为 1 的。

如果要检测元素是否属于集合，使用相同的哈希运算步骤，检查相应位的值是1还是0。这就是布隆过滤器明确元素不存在的过程。如果位未被设置，则元素绝不可能存在于集合中。

当然，一个肯定的答案意味着，要不就是元素存在于集合中，要不就是遇见了**哈希冲突**。

> 注意

1. 一个值，设置了多个 hash，也就是存储了多个位置。这样为了提高准确性。

## 特点

所以布隆过滤有以下几个特点：

1. 只要返回数据不存在，则肯定不存在。

2. 返回数据存在，但只能是大概率存在。

3. 同时不能清除其中的数据。

# 应用场景

判断大量元素中包含一个数：

网页爬虫对URL的去重，避免爬取相同的URL地址；

反垃圾邮件，从数十亿个垃圾邮件列表中判断某邮箱是否垃圾邮箱（同理，垃圾短信）；

缓存击穿，将已存在的缓存放到布隆中，当黑客访问不存在的缓存时迅速返回避免缓存及DB挂掉。

使用布隆过滤器优化SQL查询

# Guava BloomFliter 使用

## 引入 jar

```xml
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>14.0.1</version>
</dependency>
```

## 测试 demo

- Person.java

```java
public class Person {

    public int id;
    public String firstName;
    public String lastName;
    public int birthYear;

    public Person(int id, String firstName, String lastName, int birthYear) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthYear = birthYear;
    }
}
```

- BloomFilter.java

```java
import com.google.common.base.Charsets;
import com.google.common.hash.BloomFilter;
import com.google.common.hash.Funnel;
import com.google.common.hash.PrimitiveSink;
import org.junit.Test;

import java.util.Arrays;
import java.util.List;

public class BloomFilterTest {

    Funnel<Person> personFunnel = new Funnel<Person>() {
        @Override
        public void funnel(Person person, PrimitiveSink into) {
            into.putInt(person.id)
                    .putString(person.firstName, Charsets.UTF_8)
                    .putString(person.lastName, Charsets.UTF_8)
                    .putInt(person.birthYear);
        }
    };

    @Test
    public void test() {
        BloomFilter<Person> friends = BloomFilter.create(personFunnel, 500, 0.01);
        for (Person friend : personList()) {
            friends.put(friend);
        }

        Person dude = new Person(1, "1", "1", 1);

        // much later
        if (friends.mightContain(dude)) {
            // the probability that dude reached this place if he isn't a friend is 1%
            // we might, for example, start asynchronously loading things for dude while we do a more expensive exact check
            System.out.println("也许存在哦。。。");
        }
    }

    private List<Person> personList() {
        Person person = new Person(1, "1", "1", 1);
        Person person2 = new Person(2, "1", "1", 1);
        Person person3 = new Person(3, "1", "1", 1);
        Person person4 = new Person(4, "1", "1", 1);

        return Arrays.asList(person, person2, person3, person4);
    }

}
```

测试结果输出：

```
也许存在哦。。。
```

# 算法原理和复杂度

参考 [wiki](https://en.wikipedia.org/wiki/Bloom_filter)


# 回顾

上一节我们简单介绍了 BloomFilter 的原理，并且介绍了 guava BloomFilter 的使用。

今天让我们更上一层楼，实现一个属于自己的 BoolFilter。

![思维导图](https://p6-tt.byteimg.com/origin/pgc-image/347ec620e13349569dc9f2dc09f00723?from=pc)

# 实现原理

## 原理回顾

布隆过滤器在本质上是二进制向量。

在高层级上，布隆过滤器以下面的方式工作：

添加元素到过滤器。

对元素进行几次哈希运算，当索引匹配哈希的结果时，将该位设置为 1 的。

如果要检测元素是否属于集合，使用相同的哈希运算步骤，检查相应位的值是1还是0。这就是布隆过滤器明确元素不存在的过程。如果位未被设置，则元素绝不可能存在于集合中。

当然，一个肯定的答案意味着，要不就是元素存在于集合中，要不就是遇见了哈希冲突。

## 实现思路

我们再加入一个元素时，通过多种不同的 hash 算法，然后设置到 bit 数组中。

判断是否存在的时候，也对元素采用多种不同的 hash 算法，如果都为 true，则说明可能存在。如果有不为 true 的，说明一定不不存在。

![源码](https://p3-tt.byteimg.com/origin/pgc-image/069c7d29e2874585bb574cc3516bd0f6?from=pc)

# 自己实现简单版本

## hash 算法

可以参考 [hash 算法介绍](https://houbb.github.io/2018/05/30/hash)

- IHash.java

```java
public interface IHash {

    /**
     * 根据 key 获取对应的hash值
     * @param key 字符串
     * @return hash 值
     */
    int hashIndex(final String key);

}
```

三个简单的实现：

- HashOne

```java
public class HashOne implements IHash {

    @Override
    public int hashIndex(String key) {
        int hash = 0;
        for(int i = 0; i < key.length(); i++) {
            hash = 33 * hash + key.charAt(i);
        }

        return Math .abs(hash);
    }

}
```

- HashTwo

```java
public class HashTwo implements IHash {

    @Override
    public int hashIndex(String key) {
        final int p = 16777619;
        int hash = (int) 2166136261L;

        for(int i = 0 ; i < key.length(); i++) {
            hash = (hash ^ key.charAt(i)) * p;
        }
        hash += hash << 13;
        hash ^= hash >> 7;
        hash += hash << 3;
        hash ^= hash >> 17;
        hash += hash << 5;
        return Math.abs(hash);
    }
}
```

- HashThree

```java
public class HashThree implements IHash {

    @Override
    public int hashIndex(String key) {
        int hash, i;

        for (hash = 0, i = 0; i < key.length(); ++i) {
            hash += key.charAt(i);
            hash += (hash << 10);
            hash ^= (hash >> 6);
        }

        hash += (hash << 3);
        hash ^= (hash >> 11);
        hash += (hash << 15);
        return Math.abs(hash);
    }
}
```

## Bloom Fliter 实现

- IBloomFilter.java

```java
public interface IBloomFilter {

    /**
     * 添加一个元素
     * @param key  元素
     */
    void add(final String key);

    /**
     * 可能包含元素
     * @param key 元素
     * @return 可能包含
     */
    boolean mightContains(final String key);

}
```

- SimpleBloomFilter.java

```java
import com.github.houbb.guava.learn.bloom.hash.HashOne;
import com.github.houbb.guava.learn.bloom.hash.HashThree;
import com.github.houbb.guava.learn.bloom.hash.HashTwo;

public class SimpleBloomFilter implements IBloomFilter {

    private final int size;

    private boolean[] array;

    public SimpleBloomFilter(int size) {
        this.size = size;
        this.array = new boolean[size];
    }

    @Override
    public void add(String key) {
        // 做三次 hash
        int hashOne = new HashOne().hashIndex(key);
        int hashTwo = new HashTwo().hashIndex(key);
        int hashThree = new HashThree().hashIndex(key);

        this.array[hashOne%array.length] = true;
        this.array[hashTwo%array.length] = true;
        this.array[hashThree%array.length] = true;
    }

    @Override
    public boolean mightContains(String key) {
        // 做三次 hash
        int hashOne = new HashOne().hashIndex(key);
        int hashTwo = new HashTwo().hashIndex(key);
        int hashThree = new HashThree().hashIndex(key);

        if(!array[hashOne]) {
            return false;
        }
        if(!array[hashTwo]) {
            return false;
        }
        if(!array[hashThree]) {
            return false;
        }

        return true;
    }
}
```


# 小结

当然我们实现版本的性能比较差，可以参考下 guava 的实现。

本文简单介绍了布隆过滤器的发展历史和应用场景，并给出了 guava BloomFliter 使用案例。希望大家对 bloom filter 有一个最基本的认识。

下一节我们将和大家一起实现属于自己的布隆过滤器。

觉得本文对你有帮助的话，欢迎点赞评论收藏关注一波。你的鼓励，是我最大的动力~

不知道你有哪些收获呢？或者有其他更多的想法，欢迎留言区和我一起讨论，期待与你的思考相遇。

# 参考资料

[布隆过滤器](https://zh.wikipedia.org/wiki/%E5%B8%83%E9%9A%86%E8%BF%87%E6%BB%A4%E5%99%A8)

[如何判断一个元素在亿级数据中是否存在？](https://mp.weixin.qq.com/s/aMp0xoGPlY0XmJORzTmUZw)

- Guava

[Google Guava 中的布隆过滤](https://www.oschina.net/translate/guava-bloomfilter?print)

[GUava hash](https://github.com/google/guava/wiki/HashingExplained)

- Bit 数组

https://blog.csdn.net/zimu666/article/details/8284906

https://blog.csdn.net/zimu666/article/details/8295724

https://www.cnblogs.com/varlxj/p/5168157.html

https://yuhuang-neil.iteye.com/blog/1190574

* any list
{:toc}