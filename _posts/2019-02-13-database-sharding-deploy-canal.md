---
layout: post
title: canal 阿里巴巴 MySQL binlog 增量订阅&消费组件
date:  2019-2-13 09:48:27 +0800
categories: [Database]
tags: [database, sharding, mysql, sh]
published: true
---

# Canal

[Canal](https://github.com/alibaba/canal)，译意为水道/管道/沟渠，主要用途是基于 MySQL 数据库增量日志解析，提供增量数据订阅和消费

早期阿里巴巴因为杭州和美国双机房部署，存在跨机房同步的业务需求，实现方式主要是基于业务 trigger 获取增量变更。

从 2010 年开始，业务逐步尝试数据库日志解析获取增量变更进行同步，由此衍生出了大量的数据库增量订阅和消费业务。

基于日志增量订阅和消费的业务包括

- 数据库镜像

- 数据库实时备份

- 索引构建和实时维护(拆分异构索引、倒排索引等)

- 业务 cache 刷新

- 带业务逻辑的增量数据处理

当前的 canal 支持源端 MySQL 版本包括 5.1.x , 5.5.x , 5.6.x , 5.7.x , 8.0.x

![mysql](https://camo.githubusercontent.com/63881e271f889d4a424c55cea2f9c2065f63494fecac58432eac415f6e47e959/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f32303139313130343130313733353934372e706e67)

# 工作原理

## MySQL主备复制原理

![MySQL主备复制原理](https://camo.githubusercontent.com/c26e367a6ffcce8ae6ecb39476a01bef14af6572124a6df050c4dc0c7f1074f3/687474703a2f2f646c2e69746579652e636f6d2f75706c6f61642f6174746163686d656e742f303038302f333038362f34363863316131342d653761642d333239302d396433642d3434616335303161373232372e6a7067)


MySQL master 将数据变更写入二进制日志( binary log, 其中记录叫做二进制日志事件binary log events，可以通过 show binlog events 进行查看)

MySQL slave 将 master 的 binary log events 拷贝到它的中继日志(relay log)

MySQL slave 重放 relay log 中事件，将数据变更反映它自己的数据

## canal 工作原理

canal 模拟 MySQL slave 的交互协议，伪装自己为 MySQL slave ，向 MySQL master 发送dump 协议

MySQL master 收到 dump 请求，开始推送 binary log 给 slave (即 canal )

canal 解析 binary log 对象(原始为 byte 流)



# 参考资料 

[数据库分库分表后如何部署上线](https://mp.weixin.qq.com/s/DvRpJRY3M06-yi7LFPyghg)

[分库分表技术演进&最佳实践](https://mp.weixin.qq.com/s?__biz=MzAxODcyNjEzNQ==&mid=2247486161&idx=1&sn=a8b68997a8e3e1623e66b83d5c21ce88&chksm=9bd0a749aca72e5f240a6ad1b28bcc923ee2874e16d9b9641b7efd99bc368baa963d081e2ba0&scene=21#wechat_redirect)

[为什么分库分表后不建议跨分片查询](https://mp.weixin.qq.com/s/l1I5u3n-lSwDYfxC-V3low)

* any list
{:toc}