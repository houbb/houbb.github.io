---
layout: post
title: Oracle Group By
date:  2018-10-31 06:48:58 +0800
categories: [SQL]
tags: [sql, sf]
published: true
excerpt: Oracle 按照指定条件分组，某列按照逗号分隔
---

# 情景

假设有表 `user_log`，要求按照 user_id 字段分组，然后对应的 remark 用 `,` 隔开。

```
user_id   remark
1         124
1         222 
2         124
2         134
```

# Group By 实现方式

## wm_contact

直接按照逗号分隔 remark 结果。

```sql
SELECT wm_concat(remark), user_id FROM user_log
GROUP BY user_id;
```


- 使用报错

```
oracle wmsys.wm_concat ORA-00932: 数据类型不一致: 应为 -, 但却获得 CLOB
```

oracle 函数 wmsys.wm_concat 在 10.2.0.4版本以前是 varchar2 类型，但是 从 10.2.0.5 开始，是 CLOB 类型，是一个坑！！

改成 `to_char(wm_concat( ...... ))` 解决


## LISTAGG

当然需求是多变的，还有可能按照其他符号分隔。

使用 `LISTAGG(remark,’,’)` 第二个参数可以指定连接符号。

```sql
SELECT user_id, (LISTAGG(remark,',') WITHIN group(order by remark)) AS remark
FROM user_log
GROUP BY user_id;
```

# 给予内存分组

还有一种方式。首先查询出所有结果，然后基于内存进行分组。

可以参考：[基于 guava 的内存分组](https://houbb.github.io/2018/10/25/guava-group-sort)


# 删除重复配置

## 场景描述

有时候我们需要移除重复的配置，并且删除掉重复的配置，并且只保留一个需要的配置。

## 分析

需要根据判定是否重复的字段

```sql
group by XXX, XXX having count(0) > 1;
```

## 示例 sql

```sql
DELETE MY_CONFIG t
where exists (
select * from (
select max(rowid) rowid_, xxx,count(0) cnt
from MY_CONFIG group by xxx
) b where cnt >1 and t.rowid = b.rowid_
);
```

这里就是把分组后得到 cnt > 1（有重复的配置）选取出第一条，然后进行删除。

# 拓展阅读

[TreeMap](https://houbb.github.io/2019/03/28/data-struct-treemap)

* any list
{:toc}