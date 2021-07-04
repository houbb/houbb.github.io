---
layout: post
title: 监控利器之 grafana 入门安装笔记
date:  2021-06-20 16:52:15 +0800
categories: [APM]
tags: [apm, grafana]
published: true
---


# 序言

应用程序的监控非常必要，因为图表更加直观，门槛也更加低。

就算是非技术出身的部门负责人也可以从图表中发现问题，趋势预测等等。

# grafana

## 是什么

Grafana是一款用Go语言开发的开源数据可视化工具，可以做数据监控和数据统计，带有告警功能。

目前使用grafana的公司有很多，如paypal、ebay、intel等。

## 标语

Dashboard anything. Observe everything.

无论数据存储在何处，都可以查询、可视化、提醒和了解您的数据。 

借助 Grafana，您可以通过美观、灵活的仪表板创建、探索和共享所有数据。

## 为什么选择 Grafana?

### 统一您的数据，而不是您的数据库

Grafana 不需要您将数据摄取到后端存储或供应商数据库。 

相反，Grafana 采取了一种独特的方法，通过统一您现有的数据，无论它存在于何处，来提供“单一管理平台”。

使用 Grafana，您可以从您的 Kubernetes 集群、树莓派、不同的云服务，甚至 Google 表格中获取任何现有数据，并根据需要将其可视化，所有这些都来自一个仪表板。

### 每个人都可以看到的数据

Grafana 建立在这样一个原则之上：组织中的每个人都应该可以访问数据，而不仅仅是单个运维人员。

通过使数据民主化，Grafana 有助于促进一种文化，在这种文化中，需要数据的人可以轻松使用和访问数据，从而帮助打破数据孤岛并赋予团队权力。

### 任何人都可以使用的仪表板

Grafana 仪表板不仅为从众多来源收集的数据赋予深刻的意义，而且您还可以与其他团队成员共享您创建的仪表板，让您可以一起探索数据。

使用 Grafana，任何人都可以创建和共享动态仪表板以促进协作和透明度。

### 灵活性和多功能性

将您的任何数据转换并转换为灵活且多功能的仪表板。 

与其他工具不同，Grafana 允许您专门为您和您的团队构建仪表板。

借助高级查询和转换功能，您可以自定义面板以创建对您真正有用的可视化效果。

ps: 当然这里提到的数据每个人都能访问，本身就是各有利弊的。很多公司依然会进行权限控制，而不是每一个人都能看到所有东西。

# windows10 安装笔记

## 平台支持

Grafana 作为一款优秀的监控服务，本身就是支持跨平台的。

这里便于大家学习，以 windows10 为例，演示一下 grafana 的安装。

## 下载

可以在 [https://grafana.com/grafana/download](https://grafana.com/grafana/download?pg=get&plcmt=selfmanaged-box1-cta1&platform=windows) 进入下载界面。

可以选择所有的历史版本，并且选择对应的平台。

![下载](https://images.gitee.com/uploads/images/2021/0704/102530_fb8afca4_508704.png "download.png")

### 功能本版

分为企业版和开源版。此处选择默认的开源版本。

企业版包括开源版的所有功能。 

所有开源功能都可以免费使用，并且可以选择升级到完整的付费企业功能集，包括对企业插件的支持。

ps：这里就涉及到一个商业模式，开源促进生态的繁荣和推广的普及，企业级别负责支撑公司运转。类似 mongodb，idea 等知名软件都是采用的这种模式。

### 安装形式

可以直接下载对应的 [Download the installer](https://dl.grafana.com/oss/release/grafana-8.0.4.windows-amd64.msi) 或者 [Download the zip file](https://dl.grafana.com/oss/release/grafana-8.0.4.windows-amd64.zip)。

为了简单，我们选择 installer。

## 安装 & 运行

下载完成后，直接点击安装即可。

本质上这是一个 web 服务，我们直接打开浏览器即可进行访问：

[http://localhost:3000/](http://localhost:3000/)

我们使用管理员账户 admin/admin 进行登录。第一次登录，会提示我们输入新的密码。

登录后的页面如下：

![首页](https://images.gitee.com/uploads/images/2021/0704/102600_99ccdfa8_508704.png "overview.png")

## 选择您的配置选项

Grafana 后端在其配置文件（通常位于 Linux 系统上的 /etc/grafana/grafana.ini）中定义了许多配置选项。

在此配置文件中，您可以更改默认管理员密码、http 端口、grafana 数据库（sqlite3、mysql、postgres）、身份验证选项（google、github、ldap、auth 代理）以及许多其他选项。

启动你的 grafana 服务器。 

使用您的管理员用户登录（默认为 admin/admin）。 

打开侧边菜单（单击顶部菜单中的 Grafana 图标）前往数据源并添加您的数据源。

# 创建 dashboard

为了简单，我们首先演示一下官方的入门案例。

## 创建第一个 dashboard

1. 单击侧面菜单上的 + 图标。

2. 在仪表板上，单击添加空面板。

3. 在新建仪表板/编辑面板视图中，转到查询选项卡。

4. 通过从数据源选择器中选择 -- Grafana -- 来配置您的查询。 这将生成随机游走仪表板。

5. 单击屏幕右上角的保存图标以保存仪表板。

6. 添加描述性名称，然后单击保存。

ps: 其中 3、4 这两步我们可以不做，直接使用系统默认的。

## 效果

将生成一个随机游走仪表板，给人一种股票行情的感觉。

![随机游走仪表板](https://images.gitee.com/uploads/images/2021/0704/103131_349c380c_508704.png "first-panel.png")

# 后续学习

## 下一步

继续尝试您构建的内容，尝试探索工作流程或其他可视化功能。 

请参阅数据源以获取支持的数据源列表以及有关[如何添加数据源](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/)的说明。 

您会感兴趣以下主题：

[面板](https://grafana.com/docs/grafana/latest/panels/)

[仪表盘](https://grafana.com/docs/grafana/latest/dashboards/)

[键盘快捷键](https://grafana.com/docs/grafana/latest/dashboards/shortcuts/)

[插件](https://grafana.com/grafana/plugins?orderBy=weight&direction=asc)

## 管理员

Grafana 服务器管理员用户感兴趣的主题如下：

[Grafana 配置](https://grafana.com/docs/grafana/latest/administration/configuration/)

[验证](https://grafana.com/docs/grafana/latest/auth/overview/)

[用户权限和角色](https://grafana.com/docs/grafana/latest/permissions/)

[供应](https://grafana.com/docs/grafana/latest/administration/provisioning/)

[Grafana 命令行界面](https://grafana.com/docs/grafana/latest/administration/cli/)

# 参考资料

https://grafana.com/docs/grafana/latest/installation/windows/

https://grafana.com/docs/grafana/latest/getting-started/getting-started/

[Grafana的介绍与使用](https://www.jianshu.com/p/0d82c7ccc85a)

* any list
{:toc}