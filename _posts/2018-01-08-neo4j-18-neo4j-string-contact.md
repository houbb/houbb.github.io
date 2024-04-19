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

传入的变量值通过对应的值拼接。


# 正确的写法


## 写法

```
WITH 'Hello, ' AS firstName, 'world!' AS lastName
CREATE (p:Person {
  firstName: firstName,
  lastName: lastName,
  fullName: firstName + '-' + lastName
})
RETURN p
```

效果

```
{
  "identity": 175,
  "labels": [
    "Person"
  ],
  "properties": {
    "firstName": "Hello, ",
    "lastName": "world!",
    "fullName": "Hello, -world!"
  },
  "elementId": "175"
}
```


# 参考资料

* any list
{:toc}

