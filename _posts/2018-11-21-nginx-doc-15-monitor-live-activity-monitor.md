---
layout: post
title:  Nginx R31 doc-15-Live Activity Monitoring 实时活动监控
date: 2018-11-22 8:01:55 +0800 
categories: [Web]
tags: [nginx, windows, sh]
published: true
---

# 实时活动监控

跟踪 NGINX Plus 和您的应用程序在内置的实时活动监控仪表板上的性能，或通过将 JSON 提供给其他工具。

本文介绍如何配置和使用 NGINX Plus 中的运行时监控服务：交互式仪表板和 NGINX Plus REST API。

## 关于实时活动监控

NGINX Plus 提供了各种监控工具，用于您的服务器基础设施：

- 自 NGINX Plus Release 9 起提供的交互式仪表板页面 - 实时活动监控界面，显示服务器基础设施的关键负载和性能指标。

- 自 NGINX Plus Release 14 起提供的 NGINX REST API - 一个接口，可以获取扩展状态信息、重置统计信息、动态管理上游服务器以及管理键值存储。通过该 API，您可以将 NGINX Plus 状态信息连接到支持 JSON 接口的第三方工具，例如 NewRelic 或您自己的仪表板。

注意：在 NGINX Plus R14 之前，仪表板中收集统计信息和管理上游服务器是使用 status 和 upstream_conf 模块执行的。现在，扩展状态和 upstream_conf 模块已被 api 模块取代。从 R16 开始，status 和 upstream_conf 模块将被移除，并完全被 api 模块取代。

![关于实时活动监控](https://www.nginx.com/wp-content/uploads/2023/08/nginx-plus-dashboard_R30-overview-2.png)


# 参考资料

https://docs.nginx.com/nginx/admin-guide/monitoring/live-activity-monitoring/

* any list
{:toc}