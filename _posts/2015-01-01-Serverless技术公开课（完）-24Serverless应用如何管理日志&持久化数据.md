---
layout: post
title:  Serverless技术公开课（完）-24Serverless应用如何管理日志&持久化数据
date:   2015-01-01 23:20:27 +0800
categories: [Serverless技术公开课（完）]
tags: [Serverless技术公开课（完）, other]
published: true
---



24 Serverless 应用如何管理日志&持久化数据
### 实时日志

![图片1.png](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Serverless%20%e6%8a%80%e6%9c%af%e5%85%ac%e5%bc%80%e8%af%be%ef%bc%88%e5%ae%8c%ef%bc%89/assets/2020-10-26-040934.png)

首先，SAE 支持查看应用实例分组下各个 Pod 的实时日志。当应用出现异常情况时，可以通过查看 Pod 的实时日志定位问题。当应用运行时，可以在【控制台 - 日志管理菜单下 - 实时日志子菜单】方便地看到应用实例的实时日志。

### 文件日志

![图片2.png](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Serverless%20%e6%8a%80%e6%9c%af%e5%85%ac%e5%bc%80%e8%af%be%ef%bc%88%e5%ae%8c%ef%bc%89/assets/2020-10-26-040936.png)

SAE 将业务文件日志（不包含 stdout 和 stderr 日志）收集并输入 SLS 中，实现无限制行数查看日志、自行聚合分析日志，方便业务日志对接，并按日志使用量计费。

您可以在部署应用时配置日志收集服务，填入需要采集的日志源，对于滚动日志的场景，可以填入通配符进行解决。

![图片3.PNG](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Serverless%20%e6%8a%80%e6%9c%af%e5%85%ac%e5%bc%80%e8%af%be%ef%bc%88%e5%ae%8c%ef%bc%89/assets/2020-10-26-040939.png)

当配置完成后，可以在【控制台 - 日志管理菜单 - 文件日志子菜单】方便地看到采集的文件日志。

### NAS 持久化存储

![图片4.png](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Serverless%20%e6%8a%80%e6%9c%af%e5%85%ac%e5%bc%80%e8%af%be%ef%bc%88%e5%ae%8c%ef%bc%89/assets/2020-10-26-040940.png)

由于存储在容器中数据是非持久化的，SAE 支持了 NAS 存储功能，解决了应用实例数据持久化和实例间多读共享数据的问题。

您可以通过部署应用来配置持久化存储，选择创建好的 NAS，并填入容器中对应的挂载路径即可。

![幻灯片9.PNG](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Serverless%20%e6%8a%80%e6%9c%af%e5%85%ac%e5%bc%80%e8%af%be%ef%bc%88%e5%ae%8c%ef%bc%89/assets/2020-10-26-040942.png)

当配置完成后，可以通过 cat /proc/mount | grep nfs 命令查看是否挂载成功，或者可以准备 2 个应用实例，A 和 B，分别挂载 NAS。对 A 执行写入命令 echo “hello” > tmp.txt，对 B 执行读取命令 cat tmp.txt。如果 B 中能够读取到在 A 中写入的 hello，表示 NAS 挂载成功。




# 参考资料

https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Serverless%20%e6%8a%80%e6%9c%af%e5%85%ac%e5%bc%80%e8%af%be%ef%bc%88%e5%ae%8c%ef%bc%89/24%20Serverless%20%e5%ba%94%e7%94%a8%e5%a6%82%e4%bd%95%e7%ae%a1%e7%90%86%e6%97%a5%e5%bf%97&%e6%8c%81%e4%b9%85%e5%8c%96%e6%95%b0%e6%8d%ae.md

* any list
{:toc}
