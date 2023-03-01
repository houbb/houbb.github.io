---
layout: post
title: 项目复盘梳理-07-全量增量的思想
date:  2023-02-13 +0800
categories: [Project]
tags: [in-actions, project, sh]
published: false
---

# 配置

对于比较多的多的配置。

如果需要迁移，可以首先全量，然后增量。节约时间。

同样，配置的加载也是同样的道理。

可以初始化的时候，全量加载，然后定时增量加载。

# 要求

要求配置信息，必须要包含对应的 update_time。

# 拓展阅读

[https://github.com/houbb/checksum](https://github.com/houbb/checksum)

* any list
{:toc}