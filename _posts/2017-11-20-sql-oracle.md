---
layout: post
title:  oracle 插入一个列表，oracle 如何查询 sequence 一次查询出多个？
date:  2017-11-20 10:05:49 +0800
categories: [SQL]
tags: [sql, oracle]
published: true
---

# 插入列表

## oracle

```sql
insert into t_table_name(column1, column2, column_N) 
SELECT t.*
FROM(
  <foreach collection="list" item="item" index="index" separator="UNION ALL">
    SELECT 
    #{column1Val} as column1, 
    #{column2Val} as column2,
    #{columnNVal} as columnN 
    FROM DUAL 
  </foreach>  
) t
```

把列表中的值，放在列表中，通过 UNION ALL 链接。

注意：列表一次性不要太大，避免造成 GC。

## mysql

相对来说就简单许多：

```sql
insert into t_table_name(column1, column2, column_N) 
VALUES
  <foreach collection="list" item="item" index="index" separator=",">
    (
    #{column1Val}, 
    #{column2Val},
    #{columnNVal} 
    )
  </foreach>  
```

# oracle 如何一次性查询多个 seqId


## 查询 1 个

```sql
select SEQXXX.nextval FROM dual;
```

## 查询多个

查询方法如下：

```sql
select SEQXXX.nextval FROM (select 1 from t_tablename where rownum <= 10)
```

这样一次性可以查询 10 个。




* any list
{:toc}
