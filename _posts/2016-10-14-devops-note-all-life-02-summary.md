---
layout: post
title: devops-全生命周期开发笔记-02-简单梳理
date:  2016-10-14 23:51:50 +0800
categories: [Devops]
tags: [gitlab, git, devops, docker, vcs]
published: true
---


# 全生命周期

![全生命周期](https://gitee.com/houbinbin/imgbed/raw/master/img/%E8%BD%AF%E4%BB%B6%E5%85%A8%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F.png)

# 监控 

监控：日志+SQL+普米+CAT

不同内容之间的组合。

## 影响面

影响到了哪些商户？

监控除了对于应用的影响范围，还可以向业务影响靠拢。影响的时间+范围+次数==》自动定级

标签：影响到哪些接口  每一个接口对应的场景。

业务场景

## 根因

需要 cmdb 非常标准的数据信息。==》辅助人的分析。

# 日志处理

![](https://gitee.com/houbinbin/imgbed/raw/master/img/%E6%97%A5%E5%BF%97-TRACE-%E6%8C%87%E6%A0%87.drawio.png)

日志的标准化输出：格式统一+全链路

日志的解析处理

# 人员-角色-菜单(资源)-权限

![](https://gitee.com/houbinbin/imgbed/raw/master/img/%E4%BA%BA%E5%91%98-%E8%A7%92%E8%89%B2-%E8%8F%9C%E5%8D%95-%E6%9D%83%E9%99%90drawio.drawio.png)


以人为本：sso

资源为本：cmdb

关系分析？

客户端通过 sdk 访问服务端。

服务端拆分：web(web+vue)+server

前后端分离

配置与服务分离

# 参考资料

* any list
{:toc}