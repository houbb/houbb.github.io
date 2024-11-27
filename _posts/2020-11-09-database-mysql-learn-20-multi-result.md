---
layout: post
title:  mysql-20-mysql 查询出现笛卡尔积，如何解决？
date:  2020-10-17 16:15:55 +0800
categories: [Database]
tags: [database, mysql, log, buffer, sf]
published: true
---

# 背景

我有三张表。raw, mapping 和 route。

其中 mapping 中记录了每一次 raw 的通知，raw_uid 和 notify_uid 多对多，每一次通知 notify_uid 在 route 表中可能对应多个渠道。

```sql
select route.id, raw.type 
from route r join mapping m on m.notify_uid=r.notify_uid
left join raw orgi on orgi.raw_uid = m.raw_uid
where  r.create_time between '2024-11-14 15:40:00' AND '2024-11-14 16:40:00'
```

主要是想查询 route 的基本信息，但是有些信息只有 raw 表才有。

但是发现结果出现笛卡尔积，如何改造才能避免笛卡尔积呢？ 

# 方式

```sql
SELECT 
    r.id, 
    (
        SELECT orgi.type 
        FROM raw orgi
        WHERE orgi.raw_uid = (
            SELECT m.raw_uid 
            FROM mapping m 
            WHERE m.notify_uid = r.notify_uid
            LIMIT 1
        )
    ) AS raw_type,
    (
        SELECT orgi.name 
        FROM raw orgi
        WHERE orgi.raw_uid = (
            SELECT m.raw_uid 
            FROM mapping m 
            WHERE m.notify_uid = r.notify_uid
            LIMIT 1
        )
    ) AS raw_name
FROM 
    route r
WHERE  
    r.create_time BETWEEN '2024-11-14 15:40:00' AND '2024-11-14 16:40:00';
```

可以通过这种方式，实现避免笛卡尔积。

# 参考资料

...

* any list
{:toc}

