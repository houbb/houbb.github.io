---
layout: post
title: uniapp 教程-11-web hosting 前端网页托管
date: 2021-11-15 21:01:55 +0800
categories: [WEB]
tags: [web, cross-plateform, uni-app, sh]
published: true
---
 

# 简介

DCloud为开发者提供了uni发布平台，包括网站发布、App发布和统一门户页面。

前端网页托管是其中的网页发布环节产品。

前端网页托管基于uniCloud的能力，为开发者的html网页提供更快速、更安全、更省心、更便宜的网站发布。

更快速：不经过web server，页面和资源直接上cdn，就近访问，速度更快。

更安全：不存在传统服务器各种操作系统、web server的漏洞，不用天天想着打补丁。不怕DDoS攻击，永远打不垮的服务。

更省心：无需再购买虚拟机、安装操作系统、配置web服务器、处理负载均衡、处理大并发、处理DDoS攻击......您什么都不用管，只需上传您写的页面文件

更便宜：uniCloud由DCloud联合阿里云和腾讯云推出，享受云厂商政策优惠。

# 案例

HBuilderX文档网站，是一个基于markdown的文档系统，域名：https://hx.dcloud.net.cn/

uni统计官网现已部署到uniCloud，一份报表，掌握业务全景，域名：https://tongji.dcloud.net.cn

hello uni-app项目现已部署到uniCloud，线上地址：https://hellouniapp.dcloud.net.cn

# 开通

首先开发者需要开通uniCloud，登录https://unicloud.dcloud.net.cn/ (opens new window)。

然后选择或创建一个服务空间。

最后在上述网页左侧导航点击前端网页托管，即可开始使用。

前端网页托管和云函数没有绑定关系，可以和云函数部署在一个服务空间，也可以是不同的空间，甚至是不同云服务商的空间。

阿里云前端网页托管免费。

腾讯云前端网页托管需付费开通，定价由腾讯云提供。腾讯云的不同档套餐有不同规格，见文末附表：

# 使用

开通后，需要把开发者的前端网页，上传到uniCloud的前端网页托管中。

目前提供了2种方式操作：

方式1. 通过uniCloud控制台 (opens new window)，在web界面上传。

上传时，可以按文件上传，也可以按文件夹上传。

如果是按文件夹上传，可以选择上传后的目录是否包含上传文件夹的根目录。

PS: 主要是一些云使用，此处省略。

# 案例

# 参考资料

https://uniapp.dcloud.net.cn/uniCloud/hosting.html

* any list
{:toc}
