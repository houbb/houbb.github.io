---
layout: post
title: RCA 根因分析推断笔记
date: 2025-4-19 14:31:52 +0800
categories: [Note]
tags: [note, rca, sh]
published: true
---


# 根因分析

相关内容以前记录的比较多。

# 逐渐级别推断

资源

应用视角==》单个报警


# alarm 报警

报警的主视角

## metric 指标

普米: （cpu/mem/disk/net）

SQL: SQL 报警

CAT

log===>异常日志

知识库

## 日志

top3 去重的异常日志？

## Trace

cmdb

rpc

## 事件

变更（标准化）

# 监听深入

## 变化值

相对的变化值？

更细致 更加准确？

开始+结束的时间

是否和 alarm 重复？


# 资源集中度(离散度)

pageRank 算法

当前报警的 ip

# app

app 和资源之间的关系


# 分析策略

## 下钻

规则==》到具体的指标===

## 上探

上游的流量增加

## 共同依赖

依赖的资源 pageRank

## 离散度

异常的分布性

机器

机房

# 参考资料


* any list
{:toc}