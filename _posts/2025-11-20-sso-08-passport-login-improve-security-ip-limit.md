---
layout: post
title: 权限体系之-08-passport 登录登出提升安全之 IP 登录次数限制
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---


# 

按照这个设计文档，帮我实现前后端功能，SQL脚本放在 db/migrate 中，版本依次增加

代码风格，脚本位置等和以前尽量保持一致。可以适当优化。

数据初始化：给一些基本的测试数据。

## Q

类似的，希望实现一个系统级别的登录 IP 频率限制管理，触发限流的单独记录一张表，相关信息尽可能的详细。

限流策略最好是业界公认合理阈值的（尽量减少对普通用户的打扰，同时减少恶意IP的攻击）：

比如分钟内限制、小时内限制、一天内限制等。多重的限制策略，初期代码写死即可。

给管理功能点+交互+设计方案，不需要具体的代码实现

数据库表必须包含如下字段。

+-------------+--------------+------+-----+----------------------+--------------------------------+
| Field       | Type         | Null | Key | Default              | Extra                          |
+-------------+--------------+------+-----+----------------------+--------------------------------+
| id          | bigint(20)   | NO   | PRI | NULL                 | auto_increment                 |
| status      | tinyint(4)   | NO   | MUL | 1                    |                                |
| create_time | datetime(3)  | NO   | MUL | CURRENT_TIMESTAMP(3) |                                |
| update_time | datetime(3)  | NO   |     | CURRENT_TIMESTAMP(3) | on update CURRENT_TIMESTAMP(3) |
| creator_id  | bigint(20)   | YES  |     | NULL                 |                                |
| updater_id  | bigint(20)   | YES  |     | NULL                 |                                |
| delete_flag | tinyint(4)   | NO   | MUL | 0                    |                                |

## 开发规范

尽可能学习1-2个旧的代码类实现风格。尽可能复用已有的代码方法、工具方法。

后端代码，高内聚、内耦合。（适当） 

1) 禁止 lombok+beanCopy。

2) mybatis xml 中不要用 AND create_time >= #{startTime}，大于、小于之类的特殊符号，要做好转义处理

前端代码：可服用，组件化。（适当）

3) 遵循 vue3 规范

## 视角拆分

管理员视角、用户视角 前端页面拆分。

api 调用拆分，对应后端的 controller 也要拆分。避免混乱

管理员管理页面可以管理所有的登录限流的 ip 信息。

用户暂时不需要关心这个页面。






* any list
{:toc}