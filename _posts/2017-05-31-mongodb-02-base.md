---
layout: post
title:  MongoDB-02-base 
date:  2017-05-31 11:41:22 +0800
categories: [SQL]
tags: [sql, nosql, mongodb]
published: true
---


# MongoDB Concept


| SQL术语/概念	| MongoDB术语/概念	| 解释/说明 |
|:---|:---|:---|
| database	    | database	        | 数据库 |
| table	        | collection	    | 数据库表/集合 |
| row	        | document	        | 数据记录行/文档 |
| column	    | field	            | 数据字段/域 |
| index	        | index	            | 索引 |
| table         | joins	 	        | 表连接,MongoDB不支持 |
| primary key	| primary key	    | 主键,MongoDB自动将_id字段设置为主键 |


# MongoDB Connect

标准 URI 连接语法：

```
mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
```

- mongodb:// 这是固定的格式，必须要指定。

- username:password@ 可选项，如果设置，在连接数据库服务器之后，驱动都会尝试登陆这个数据库

- host1 必须的指定至少一个host, host1 是这个URI唯一要填写的。它指定了要连接服务器的地址。如果要连接复制集，请指定多个主机地址。

- portX 可选的指定端口，如果不填，默认为27017

- /database 如果指定username:password@，连接并验证登陆指定数据库。若不指定，默认打开admin数据库。

- ?options 是连接选项。如果不使用/database，则前面需要加上/。所有连接选项都是键值对name=value，键值对之间通过&或;（分号）隔开



* any list
{:toc}