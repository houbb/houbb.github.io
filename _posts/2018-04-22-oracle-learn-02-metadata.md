---
layout: post
title:  Oracle Learn-02-MetaData 元数据管理
date:  2018-04-22 19:00:57 +0800
categories: [SQL]
tags: [sql, oracle, learn]
published: true
---

# oracle 的元数据

有时候我们希望获取对应表的数据表结构信息。

整理 sql 如下：

```sql
select cols.table_name 表名, cols.column_name 列名, cols.data_type 字段类型, cols.data_length 长度, cols.nullable 是否为空, cols.data_default 默认值, comm.comments 备注 from user_tab_cols cols
left join user_col_comments comm on cols.table_name = comm.table_name and cols.column_name = comm.column_name
where cols.table_name in (select distinct table_name from user_tab_cols)  and  cols.column_id is not null order by cols.table_name, segment_column_id;
```

* any list
{:toc}









 





