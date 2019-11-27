---
layout: post
title: Ocean Base-03-解决方案之数据迁移
date:  2019-11-20 11:18:30 +0800
categories: [Database]
tags: [database, distributed-database, olap, oltp, htap, sh]
published: true
---

# OceanBase 迁移服务

全面帮助企业实现分布式架构的平滑迁移

OceanBase 迁移服务（OceanBase Migration Service，简称OMS）是 OceanBase 为客户提供的全流程数据迁移解决方案。

OceanBase 迁移服务全面帮助企业的应用和数据迁移到 OceanBase 上，让更多企业享受分布式数据库的技术价值。

# 行业现状及痛点

## 应用改造量评估

在决策采用新系统之前，无法准确地掌握业务改造的工作量，无法有效控制项目进度风险

## 据迁移的成本和质量

无法保证关键数据迁移过程中的迁移效率和数据质量，长时间的业务停写通常是不可避免的

## 性能风险

无法对新系统进行准确的容量评估，无法提前识别和规避切换后系统可能出现的性能问题

## 稳定性风险

缺乏整体可回滚能力，切换后一旦新系统发生不可预期的稳定性问题，业务将严重受损

# 方案架构

## 迁移流程

![迁移流程](https://gw.alipayobjects.com/mdn/ob_asset/afts/img/A*i-TuQY_8GdoAAAAAAAAAAABjAQAAAQ/original)

## 整体架构

![整体架构](https://gw.alipayobjects.com/mdn/ob_asset/afts/img/A*E7evSY2wnaoAAAAAAAAAAABjAQAAAQ/original)

# 方案优势

## 多种类型数据库支持

目前支持源端数据库类型有 Oracle、MySQL、OceanBase，支持全量迁移和增量数据同步

## 分钟级即时回滚

切换到 OceanBase 后，将 OceanBase 的增量实时同步回源库，并在较小延时的情况下可以立即完成回滚

## 一键完成迁移

整个数据迁移链路和回滚机制的搭建都是在页面上连贯操作完成，使用简便

## 负载回放验证

采集源端数据库的 SQL 流量，在目标库 OceanBase 上回放，可以验证其在 OceanBase 上的功能是否兼容、性能是否出现问题等

## 秒级数据验证

数据增量同步过程中，可以定时校验两边的数据增量是否一致。

同时展示差异数据，提供快速订正途径

# 参考资料

[OceanBase 迁移服务](https://oceanbase.alipay.com/solution/oms)

* any list
{:toc}
