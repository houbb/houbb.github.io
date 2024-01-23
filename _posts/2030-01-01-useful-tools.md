---
layout: post
title: 有用的工具网址汇总大全 github 访问慢
date: 2030-01-01 21:01:55 +0800
categories: [Awesome]
tags: [awesome, tool, sh]
published: true
---

# github 访问慢

直接访问 [https://raw.hellogithub.com/hosts](https://raw.hellogithub.com/hosts) 下载 hosts 文件

hosts 文件在每个系统的位置不一，详情如下：

Windows 系统：C:\Windows\System32\drivers\etc\hosts
Linux 系统：/etc/hosts
Mac（苹果电脑）系统：/etc/hosts
Android（安卓）系统：/system/etc/hosts
iPhone（iOS）系统：/etc/hosts
修改方法，把第一步的内容复制到文本末尾：

Windows 使用记事本。
Linux、Mac 使用 Root 权限：sudo vi /etc/hosts。
iPhone、iPad 须越狱、Android 必须要 root。
2.1.3 激活生效
大部分情况下是直接生效，如未生效可尝试下面的办法，刷新 DNS：

Windows：在 CMD 窗口输入：ipconfig /flushdns

Linux 命令：sudo nscd restart，如报错则须安装：sudo apt install nscd 或 sudo /etc/init.d/nscd restart

Mac 命令：sudo killall -HUP mDNSResponder

Tips： 上述方法无效可以尝试重启机器。

# 绘图/UI

开源免费 online:    [draw.io 在线流程图绘制](https://app.diagrams.net/)

![效果图](https://markdownpicture.oss-cn-qingdao.aliyuncs.com/20210130232121.png)

## 手绘风格

excalidraw

如果你觉得这个是不是太正式了？我想让图片更像手绘的，安排！！！

![效果](https://markdownpicture.oss-cn-qingdao.aliyuncs.com/20210130234851.png)

excalidraw就是这么一个软件，也是开源的： https://github.com/excalidraw/excalidraw

中文字体地址：https://board.oktangle.com/

地址：https://excalidraw.com/

如果使用docker安装怎么办？地址：https://hub.docker.com/r/excalidraw/excalidraw

命令：

```
docker pull excalidraw/excalidraw
```

## other

[幕布精选社区](https://mubu.com/explore)

[蓝湖](https://lanhuapp.com/web/#/item)

[百度脑图](https://naotu.baidu.com/)


[processon 免费在线流程图思维导图](https://www.processon.com/)

[photopea PS 线上版本](https://www.photopea.com/)

[ps.gaoding PS 国内线上版本](https://ps.gaoding.com/#/)

[图片压缩](https://docsmall.com/)

# 图片库

[pixabay](https://pixabay.com/)

[pixiv](https://www.pixiv.net/?lang=zh)

[deathtothestockphoto](https://deathtothestockphoto.com/)

[Beautiful FREE stock photos](https://picjumbo.com/)

[Truly unique. Usually whimsy ;) Always free.](https://gratisography.com/)

[Beautiful Public Domain Images For Free](https://publicdomainarchive.com/)

[觅元素](https://www.51yuansu.com/)

## AI 绘制

[wombo art](https://app.wombo.art/)

[AI Art Generator](https://creator.nightcafe.studio/)

# 书籍

[idata 资源搜索](https://www.cn-ki.net/)

[全国图书馆联盟](http://www.ucdrs.superlib.net/)

[书享家](http://shuxiangjia.cn/)

[免费资料库](https://www.oalib.com/)

[计算机系列书籍介绍](https://aicsbook.github.io/)

[由 iBooker 建立的公益性文档和教程翻译项目](https://github.com/apachecn)

[豆瓣 1929-2022 美国奥斯卡金像奖最佳影片](https://www.douban.com/doulist/3151124/?start=75&sort=time&sub_type=)

[linux 公社](https://www.linuxidc.com/Linux/2011-08/41135.htm)

# 编程利器

[编程命名](https://unbug.github.io/codelf/)

[gitignore 生成](https://www.toptal.com/developers/gitignore/)

[万物皆可 RSS](http://fetchrss.com/)

[All-in-one bookmark manager](https://raindrop.io/)

[0宽字符]()

[匿名邮箱](https://app.anonaddy.com/)

## java

[JVM 虚拟参数配置](https://opts.console.perfma.com/result/generate/r2xnX)

## 文本转 ASCII

[ascii](http://www.network-science.de/ascii/)

[to ascii](http://patorjk.com/software/taag/#p=display&f=Graffiti&t=Type%20Something)

# 工具

## 编辑器

[wxformat](https://lab.lyric.im/wxformat/)

[wangeditor](https://www.wangeditor.com/)

## chrome 插件

[crx4chrome](https://www.crx4chrome.com/)

[chrome 插件](https://huajiakeji.com/)

## 软件分享

[MAC 分享](https://xclient.info/?_=a52dae8e0223d9651b825587a606f66f)

## 云盘

[pansoso](https://www.pansoso.com/zh/docker)

[daysou](https://www.daysou.com/)

[百度云搜索引擎](http://yun.java1234.com/search?q=Kafka%20%E5%85%A5%E9%97%A8%E4%B8%8E%E5%AE%9E%E8%B7%B5)

# 资源整合网站

[阿虚同学](https://axutongxue.com/)

[爱达杂货铺](https://adzhp.com/)

[书签地球](https://www.bookmarkearth.com/)

[不死鸟](https://iui.su/)

[精品实用网络资源导航，助你学习、工作和生活](https://imyshare.com/)

[提供一站式快速搜索图像服务](https://www.91sotu.com/)

[超能搜-云盘资源](https://www.chaonengsou.com/)

[学吧导航](https://www.xue8nav.com/)

[产品经理导航](https://www.pmbaobao.com/)

[大数据导航](http://hao.bigdata.ren/)

[数字生活导航](https://nav.guidebook.top/)

[好资源不私藏今日份汇总](https://www.207788.xyz/)

## SIC-HUB

[SCI-Hub论文下载可用网址链接](https://tool.yovisun.com/scihub/)

[科塔学术](https://site.sciping.com/)

[GOOGLE 学术](https://gg.xueshu5.com/)

# 参考资料

日常整理

* any list
{:toc}