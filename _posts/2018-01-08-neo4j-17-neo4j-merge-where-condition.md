---
layout: post
title:  Neo4j-17-neo4j merge 满足条件后才执行
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j, go, go-lang]
published: true
---



# 场景

需要实现如下的场景：

传入用户的 id, user_status, username。

如果传入的 user_status 不在 1,2,3 中，则不做任何执行；    

如果状态在 1,2,3中，根据 id 匹配，找到就更新，找不到就创建。

neo4j 版本：v5.12.0，不同版本可能不同。需要实际验证。


# 正确的写法

## 方式1

### 满足条件的

1）第一次执行

```sql
WITH 1 AS id, 1 AS status, '用户1' AS username
WHERE status IN [1, 2, 3]
MERGE (u:User {id: id}) SET u.status = status, u.username = username, u.create_time=timestamp()
RETURN u;
```

结果：

```
╒════════════════════════════════════════════════════════════════════╕
│u                                                                   │
╞════════════════════════════════════════════════════════════════════╡
│(:User {create_time: 1712917794838,id: 1,username: "用户1",status: 1})│
└────────────────────────────────────────────────────────────────────┘
```

2）再次执行

则发现可以更新执行时间。

```
╒════════════════════════════════════════════════════════════════════╕
│u                                                                   │
╞════════════════════════════════════════════════════════════════════╡
│(:User {create_time: 1712917816646,id: 1,username: "用户1",status: 1})│
└────────────────────────────────────────────────────────────────────┘
```



### 不满条件的

1) 已存在的 id

已经存在的 id=1. 不满足的状态 status=9

```sql
WITH 1 AS id, 9 AS status, '用户1' AS username
WHERE status IN [1, 2, 3]
MERGE (u:User {id: id}) SET u.status = status, u.username = username, u.create_time=timestamp()
RETURN u;
```

无任何变化：

```
(no changes, no records)
```

2) 不存在的 id

```sql
WITH 99 AS id, 9 AS status, '用户1' AS username
WHERE status IN [1, 2, 3]
MERGE (u:User {id: id}) SET u.status = status, u.username = username, u.create_time=timestamp()
RETURN u;
```

结果：

```
(no changes, no records)
```

符合预期。

总体而言这种写法比较优雅，下面的方法也行，感兴趣可以继续阅读。

### 调整的写法

也可以调整如下：

```sql
WITH 2 AS status
WHERE status IN [1, 2, 3]
MERGE (u:User {id: 72}) SET u.status = status, u.username = 'u-72', u.create_time=timestamp()
RETURN u;
```

只把需要处理的状态提上去，其他的正常写。


## 方式2

### 满足条件的状态

1）第一次执行

```sql
WITH 2 AS id, 1 AS user_status, '用户2' AS username
WHERE user_status IN [1, 2, 3]
MERGE (n:User {id: id})
ON CREATE SET n.username = username, n.user_status = user_status, n.create_time=timestamp()
ON MATCH SET n.username = username, n.user_status = user_status, n.create_time=timestamp()
RETURN n
```

再次执行：

```sql
WITH 2 AS id, 1 AS user_status, '用户2' AS username
WHERE user_status IN [1, 2, 3]
MERGE (n:User {id: id})
ON CREATE SET n.username = username, n.user_status = user_status, n.create_time=timestamp()
ON MATCH SET n.username = username, n.user_status = user_status, n.create_time=timestamp()
RETURN n
```

对应的时间发生更新。符合预期。

### 不满足条件的状态

1）不存在的 id 和状态。

```sql
WITH 3 AS id, 9 AS user_status, '用户3' AS username
WHERE user_status IN [1, 2, 3]
MERGE (n:User {id: id})
ON CREATE SET n.username = username, n.user_status = user_status, n.create_time=timestamp()
ON MATCH SET n.username = username, n.user_status = user_status, n.create_time=timestamp()
RETURN n
```

此时没有任何变化。

```
(no changes, no records)
```

符合预期。


2）不符合条件的状态+已经存在的 id 呢？

id=2 的数据，我们前面已经创建了。

```
╒══════════════════════════════════════════════════════════════════════╕
│n                                                                     │
╞══════════════════════════════════════════════════════════════════════╡
│(:User {user_status: 1,create_time: 1712917401770,id: 2,username: "用户2│
│"})                                                                   │
└──────────────────────────────────────────────────────────────────────┘
```

执行：

```sql
WITH 2 AS id, 9 AS user_status, '用户3' AS username
WHERE user_status IN [1, 2, 3]
MERGE (n:User {id: id})
ON CREATE SET n.username = username, n.user_status = user_status, n.create_time=timestamp()
ON MATCH SET n.username = username, n.user_status = user_status, n.create_time=timestamp()
RETURN n
```

结果：

```
(no changes, no records)
```

符合预期。




--------------------------------------------------------------------------------

失败的尝试。



# 节点存在时更新，不存在时创建

语句满足一定条件时才执行，不满足时不执行。

```sql
MERGE (p:User {id: 1})
WHERE p.user_status = '1' OR p.user_status = '2' OR p.user_status = '3'
SET p.username = '新的用户名', p.user_status = '1';
```


## on create

这个实际上是一个限定条件，表达的是当创建的时候(匹配不到时)才执行，不创建就不执行：



1）第一次不存在

如果不存在 id=2 的数据

```sql
merge (c:User{id:2})
on create set c.username = '用户名', c.id = 2
return c
```

2) 如果存在的时候，则不执行：

```sql
merge (c:User{id:2})
on create set c.username = '用户名-2', c.id = 2
return c
```

## on match

这个命令和上述表达差不多，不同的是它是匹配上了就进行set

1) 匹配上

```sql
merge (c:User{id:2})
on MATCH set c.username = '用户名-match'
return c
```

2) 没有匹配的 


这个时候发现结果是直接 merge 了一个 id=3 的实体。

```sql
merge (c:User{id:3})
on MATCH set c.username = '用户名-match-3'
return c
```

## 二者合并

1) 没有的时候

```sql
MERGE (c:User {id: 4, status: [1,2,3]})
ON CREATE SET c.username = '用户名-创建-4', c.status=1
ON MATCH SET c.username = '用户名-match-4', c.status=1
RETURN c;
```

原始模板：

```sql
MERGE (u:User {id: $userId, user_status IN [过滤条件列表，可以改成其他的]}) 
ON CREATE SET u.username = $username, u.user_status = $user_status
ON MATCH SET u.username = $username, u.user_status = $user_status
```

### 报错场景

实际测试

```sql
MERGE (u:User {id: 5}) 
WHERE 1 IN [1,2,3]
ON CREATE SET u.username = '用户5-create', u.user_status = 1
ON MATCH SET u.username = '用户5-update', u.user_status = 1  
```

报错：

```
Invalid input 'WHERE': 
expected
  "("
  "CALL"
  "CREATE"
  "DELETE"
  "DETACH"
  "FOREACH"
  "LOAD"
  "MATCH"
  "MERGE"
  "ON"
  "OPTIONAL"
  "REMOVE"
  "RETURN"
  "SET"
  "UNION"
  "UNWIND"
  "USE"
  "WITH"
  <EOF> (line 2, column 1 (offset: 25))
"WHERE 1 IN [1,2,3]"
```

插入上下文替换后，假设 userId=5，username='用户5', user_status=1

### 第一次尝试

1) 没有的场景

```sql
MERGE (u:User {id: 5, user_status: ['1','2','3']}) 
ON CREATE SET u.username = '用户5-create', u.user_status = '1'
ON MATCH SET u.username = '用户5-update', u.user_status = '1'
RETURN u;
```

数据：

```
╒═════════════════════════════════════════════════════╕
│n                                                    │
╞═════════════════════════════════════════════════════╡
│(:User {user_status: 1,id: 5,username: "用户5-create"})│
└─────────────────────────────────────────────────────┘
```

2) 已经存在的场景

```sql
MERGE (u:User {id: 5, user_status IN [1,2,3]}) 
ON CREATE SET u.username = '用户5-create', u.user_status = 1
ON MATCH SET u.username = '用户5-update', u.user_status = 1
RETURN u;
```

发现第二次没有执行。

猜测是直接把 user_status 当做值为 [1,2,3]





# 小结

merge 可以考虑和 unwind 批量操作，这样会方便很多。

# 参考资料

[图数据库(六)：Neo4j中Cypher语言merge关键字](https://blog.csdn.net/weixin_43145427/article/details/123996574)

* any list
{:toc}

