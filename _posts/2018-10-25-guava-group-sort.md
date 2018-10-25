---
layout: post
title: Guava Sort Group
date:  2018-10-25 13:40:20 +0800
categories: [Java]
tags: [guava, java, sh]
published: true
excerpt:  Guava Sort Group
---

# 场景

有时候 SQL 查询会有很多限制。

所以借助 Guava 进行分组排序等功能。

## 例子

比如查询 Person 的记录列表，要求按照 cardId 进行分组，选出这个分组最小的 createTime 和 最大的 updateTime。

查询得结果，还需要包含当前 Person 的对应所有 remark 列表信息。

这个直接使用 SQL 查询会导致很难实现和维护。

# 实战

## maven 引入

```xml
<dependencies>
    <dependency>
        <groupId>com.google.guava</groupId>
        <artifactId>guava</artifactId>
        <version>14.0.1</version>
    </dependency>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.12</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## 代码

- Person.java

模拟查询对象

```java
public class Person {

    /**
     * 身份标识
     */
    private String cardId;

    /**
     * 标识
     */
    private String remark;

    /**
     * 创建日期
     */
    private String createDate;

    /**
     * 更新日期
     */
    private String updateDate;

    public Person(String cardId, String remark, String createDate, String updateDate) {
        this.cardId = cardId;
        this.remark = remark;
        this.createDate = createDate;
        this.updateDate = updateDate;
    }
}    
```

- GroupSortTest.java

测试代码如下：

```java
import com.google.common.base.Function;
import com.google.common.collect.Collections2;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Multimaps;
import com.google.common.collect.Ordering;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * 分组排序测试
 */
public class GroupSortTest {

    @Test
    public void groupTest() {
        //1. 分组
        ImmutableMap<String, Collection<Person>> multimap =
                Multimaps.index(queryRandomPersons(), new Function<Person, String>() {
                    @Override
                    public String apply(Person person) {
                        return person.getCardId();
                    }
                }).asMap();

        //2. 排序
        //2.1 创建时间排序规则
        Ordering<Person> createTimeOrdering = new Ordering<Person>() {
            @Override
            public int compare(Person left, Person right) {
                return left.getCreateDate().compareTo(right.getCreateDate());
            }
        };
        Ordering<Person> updateTimeOrdering = new Ordering<Person>() {
            @Override
            public int compare(Person left, Person right) {
                return right.getUpdateDate().compareTo(left.getUpdateDate());
            }
        };

        //2.2 排序整理
        for (String card : multimap.keySet()) {
            System.out.println("\nCard 开始: " + card);
            Collection<Person> people = multimap.get(card);

            //1. 获取最小的 createTime
            String minCreateTime = createTimeOrdering.min(people).getCreateDate();
            System.out.println("minCreateTime = " + minCreateTime);

            //2. 获取最大的 updateTime
            String maxUpdateTime = updateTimeOrdering.min(people).getUpdateDate();
            System.out.println("maxUpdateTime = " + maxUpdateTime);

            // 获取所有的 remark 列表
            Collection<String> remarks = Collections2.transform(people, new Function<Person, String>() {
                @Override
                public String apply(Person person) {
                    return person.getRemark();
                }
            });
            System.out.println("remarks = " + remarks);
        }
    }

    /**
     * 查询获取一个乱序的结果
     * 模拟数据库查询结果
     * @return 列表
     */
    private List<Person> queryRandomPersons() {
        List<Person> people = new ArrayList<>();
        people.add(new Person("1", "1-1", "20181022", "20181020"));
        people.add(new Person("1", "1-2", "20181010", "20181026"));
        people.add(new Person("1", "1-3", "20181015", "20181008"));

        people.add(new Person("2", "2-1", "20181008", "20181024"));
        people.add(new Person("2", "2-2", "20181023", "20181007"));
        people.add(new Person("2", "2-3", "20181010", "20181022"));
        return people;
    }

}
```


- 测试日志

```
Card 开始: 1
minCreateTime = 20181010
maxUpdateTime = 20181026
remarks = [1-1, 1-2, 1-3]

Card 开始: 2
minCreateTime = 20181008
maxUpdateTime = 20181024
remarks = [2-1, 2-2, 2-3]
```

* any list
{:toc}