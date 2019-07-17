---
layout: post
title: Redis Learn-18-01-Sort 排序
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, lua, sh]
published: true
---

# Sort

## 命令

SORT 命令的最简单执行形式为：

```
SORT <key>
```

这个命令可以对一个包含数字值的键 key 进行排序。

## 例子

以下示例展示了如何使用 SORT 命令对一个包含三个数字值的列表键进行排序：

```
redis> RPUSH numbers 3 1 2
(integer) 3

redis> SORT numbers
1) "1"
2) "2"
3) "3"
```

## 详细步骤

服务器执行 SORT numbers 命令的详细步骤如下：

创建一个和 numbers 列表长度相同的数组， 该数组的每个项都是一个 `redis.h/redisSortObject` 结构， 如图 IMAGE_CREATE_ARRAY 所示。

遍历数组， 将各个数组项的 obj 指针分别指向 numbers 列表的各个项， 构成 obj 指针和列表项之间的一对一关系， 如图 IMAGE_POINT_OBJ 所示。

遍历数组， 将各个 obj 指针所指向的列表项转换成一个 double 类型的浮点数， 并将这个浮点数保存在相应数组项的 u.score 属性里面， 如图 IMAGE_SET_SCORE 所示。

根据数组项 u.score 属性的值， 对数组进行数字值排序， 排序后的数组项按 u.score 属性的值从小到大排列， 如图 IMAGE_SORTED 所示。

遍历数组， 将各个数组项的 obj 指针所指向的列表项作为排序结果返回给客户端： 

程序首先访问数组的索引 0 ， 返回 u.score 值为 1.0 的列表项 "1" ； 

然后访问数组的索引 1 ， 返回 u.score 值为 2.0 的列表项 "2" ； 

最后访问数组的索引 2 ， 返回 u.score 值为 3.0 的列表项 "3" 。

其他 `SORT <key>` 命令的执行步骤也和这里给出的 SORT numbers 命令的执行步骤类似。

![IMAGE_CREATE_ARRAY](http://redisbook.com/_images/graphviz-50134101a2411c66a68e9089fefda31e01e649d9.png)

![IMAGE_POINT_OBJ](http://redisbook.com/_images/graphviz-fa054d26e13d181296780a491b4fb559fb1ec8d7.png)

![IMAGE_SET_SCORE](http://redisbook.com/_images/graphviz-173ac0782ff3b828f9335886f6b097c1c649f165.png)

![IMAGE_SORTED](http://redisbook.com/_images/graphviz-304b960a90fd953c18cfdd27c4fd0974823b7783.png)

### 结构定义

以下是 redisSortObject 结构的完整定义：

```c
typedef struct _redisSortObject {

    // 被排序键的值
    robj *obj;

    // 权重
    union {

        // 排序数字值时使用
        double score;

        // 排序带有 BY 选项的字符串值时使用
        robj *cmpobj;

    } u;

} redisSortObject;
```

SORT 命令为每个被排序的键都创建一个与键长度相同的数组， 数组的每个项都是一个 redisSortObject 结构， 根据 SORT 命令使用的选项不同， 程序使用 redisSortObject 结构的方式也不同， 稍后介绍 SORT 命令的各种选项时我们会看到这一点。


ps: 感觉这个属于细节命令，应该不是很重要。此处不再做深入学习。


# 参考资料

[SORT <key> 命令的实现](http://redisbook.com/preview/sort/sort_key.html)

* any list
{:toc}