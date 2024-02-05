---
layout: post
title: mysql 外键索引入门介绍-02-元数据管理
date: 2024-02-05 21:01:55 +0800
categories: [Database]
tags: [database, sql, mysql, index, sh]
published: true
---

# 背景

对数据进行统一的管理处理，后续方便使用。

# 基本信息

见上一篇的处理。

```sql
select * from information_schema.KEY_COLUMN_USAGE where REFERENCED_TABLE_SCHEMA = 'test' \G;

*************************** 1. row ***************************
           CONSTRAINT_CATALOG: def
            CONSTRAINT_SCHEMA: test
              CONSTRAINT_NAME: user_extra_ibfk_1
                TABLE_CATALOG: def
                 TABLE_SCHEMA: test
                   TABLE_NAME: user_extra
                  COLUMN_NAME: user_id
             ORDINAL_POSITION: 1
POSITION_IN_UNIQUE_CONSTRAINT: 1
      REFERENCED_TABLE_SCHEMA: test
        REFERENCED_TABLE_NAME: users
       REFERENCED_COLUMN_NAME: id
1 row in set (0.06 sec)
```

## 字段解释

这是一个查询信息模式（information_schema）中的关键列使用情况的SQL语句，通过指定条件`REFERENCED_TABLE_SCHEMA = 'test'`筛选了特定的数据库（test）。

下面是查询结果的详细解释：

1. **CONSTRAINT_CATALOG:** 表示外键约束所属的目录，这里是默认值 "def"。
   
2. **CONSTRAINT_SCHEMA:** 表示外键约束所属的数据库，这里是 "test"。
   
3. **CONSTRAINT_NAME:** 表示外键约束的名称，这里是 "user_extra_ibfk_1"。
   
4. **TABLE_CATALOG:** 表示表所属的目录，这里是默认值 "def"。
   
5. **TABLE_SCHEMA:** 表示表所属的数据库，这里是 "test"。
   
6. **TABLE_NAME:** 表示表的名称，这里是 "user_extra"。
   
7. **COLUMN_NAME:** 表示表中的列名，这里是 "user_id"。
   
8. **ORDINAL_POSITION:** 表示列在表中的顺序位置，这里是第1列。
   
9. **POSITION_IN_UNIQUE_CONSTRAINT:** 表示在唯一约束中的位置，这里是第1个位置。
   
10. **REFERENCED_TABLE_SCHEMA:** 表示被引用表所属的数据库，这里是 "test"。
   
11. **REFERENCED_TABLE_NAME:** 表示被引用表的名称，这里是 "users"。
    
12. **REFERENCED_COLUMN_NAME:** 表示被引用表中的列名，这里是 "id"。

这个查询的结果告诉我们，在数据库 "test" 中，表 "user_extra" 中的 "user_id" 列是一个外键，它参照了表 "users" 中的 "id" 列，外键的约束名称为 "user_extra_ibfk_1"。

# TODO...


# 外键



# 参考资料

https://www.cnblogs.com/JavaEdge/p/17829164.html

* any list
{:toc}
