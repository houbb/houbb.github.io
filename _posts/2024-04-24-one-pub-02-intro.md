---
layout: post
title: 一键分发多平台方法
date: 2024-03-27 21:01:55 +0800
categories: [Tool]
tags: [tool, sh]
published: true
---

# 一键发布多平台方案

## 序

一直都有做笔记的习惯，以前都是将记录在印象笔记，但只能给自己看，不利于技术的分享，希望在平台上记录下自己的点点滴滴，方便自己，也是方便他人。

首先要想到的一个问题，就是现在技术平台那么多，总不能登录每个网站，一个一个登录、复制、黏贴发布吧，我们可是程序员！！这种低效率的手动工作可不能做，因此参考多个大佬的方案，自己也测试了很久，终于有了这篇，仅供大家参考，如果有更好的方案，也希望能推荐下，共勉！！

## 方案

Typora + PicGo + Gitee + Openwrite

Typora： 本地 Markdown 编辑器，用于本地编写文档

PicGo：一个用于快速上传图片并获取图片 URL 链接的工具，可以与 Typora 集成，实现黏贴图片后自动上传图片到图床，支持集成多个平台的图床

Gitee： 是一个版本控制和协作的代码托管平台(不仅可以托管代码，还可以托管文档与图片资料），国内Github版，可以作为免费图床使用。

Openwrite：一键同步文章到多个内容平台的平台，支持微信公众号、WordPress、知乎、简书、掘金、CSDN等各大平台

## Gitee（免费图床）

官网 地址：https://gitee.com/

### 步骤

1) 创建账号

百度一下

2) 创建仓库

![创建仓库](https://img2023.cnblogs.com/other/3272173/202309/3272173-20230910122821026-109485423.png)

![创建仓库-2](https://img2023.cnblogs.com/other/3272173/202309/3272173-20230910122823230-1793644971.png)

3) 设置开源

如果不设置开源，则从外部URL地址，访问不了图片

![设置开源](https://img2023.cnblogs.com/other/3272173/202309/3272173-20230910122823948-683732620.png)

4) 获取【私人令牌】，给PicGo使用

![令牌](https://img2023.cnblogs.com/other/3272173/202309/3272173-20230910122824402-1587001540.png)

![令牌2](https://img2023.cnblogs.com/other/3272173/202309/3272173-20230910122824850-1419476863.png)

![令牌3](https://img2023.cnblogs.com/other/3272173/202309/3272173-20230910122825455-986215267.png)

![令牌4](https://img2023.cnblogs.com/other/3272173/202309/3272173-20230910122826042-2072525749.png)

​ PS : 这个界面只会显示一次，记住这个令牌 ！！！

​ 最终获取【私人令牌】，这个在图床配置PicGo要用到

## PicGo

官网 地址：https://molunerfinn.com/PicGo/

下载地址
Github - 最新，但访问慢

https://github.com/Molunerfinn/PicGo/releases

山东大学镜像站 - 国内，访问快

https://mirrors.sdu.edu.cn/github-release/Molunerfinn_PicGo

配置

[图床方案之（Gitee+PicGo）](https://zhuanlan.zhihu.com/p/355919389)

视频

[PicGo + Gitee 搭建私人图床](https://www.bilibili.com/video/BV1hT4y1f7Mf/?spm_id_from=333.337.search-card.all.click&vd_source=1d31e698afb74bb3222db3bb76f9b408)

## Typora

下载地址 地址： https://typoraio.cn/

### 配置

![配置](https://img2023.cnblogs.com/other/3272173/202309/3272173-20230910122826779-1455247145.png)

![配置2](https://img2023.cnblogs.com/other/3272173/202309/3272173-20230910122831020-801580144.png)

![配置3](https://img2023.cnblogs.com/other/3272173/202309/3272173-20230910122832198-1060525066.png)

## 使用

图片一键上传

点击上传所有本地图片后，会通过PicGo上传图片，并且自动替换成图床上的地址

![图片一键上传](https://img2023.cnblogs.com/other/3272173/202309/3272173-20230910122835017-1411979643.png)

单图片上传

截图

Snipaste : F1

上传

command + shift + p

等到上传到图床提示

黏贴

command + v

## Openwrite

对比Bloghelper、Wechatsync等工具，还是Openwrite好用，而且现在也没有发布次数限制了，推荐！！

官网 https://openwrite.cn/

配置 https://openwrite.cn/guide/postpublish/chrome-plugin.html

使用

目前总共有支持9个渠道

![](https://gitee.com/houbinbin/imgbed/raw/master/img/diary-968592_1280.jpg)

# 参考资料

https://www.cnblogs.com/leovany/p/17691019.html

* any list
{:toc}
