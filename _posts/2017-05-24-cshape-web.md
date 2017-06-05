---
layout: post
title:  CShape Web 
date:  2017-05-24 01:08:57 +0800
categories: [C#]
tags: [web, dotnet]
published: true
---

# 项目部署

[Autofac](https://autofac.org/) is an addictive Inversion of Control container for .NET Core, ASP.NET Core, .NET 4.5.1+, Universal Windows apps, and more.


# 如何最快更新DLL

对 WEB 项目发布。在发布目标文件夹中，bin 文件夹中，根据时间排序。可以看到最近更新的DLL。直接替换掉就行。

# 疑难杂症


[发布的网站无法正常访问浏览怎么办](http://jingyan.baidu.com/album/9158e0004e40b8a2541228f6.html?picindex=4)



文件没有读写权限：

1. 在IIS【应用程序池】中选择现在项目的对应程序池。右键=》高级设置=》进程模型=》标识。点击...，创建本地用户。(建议使用Admin)；



