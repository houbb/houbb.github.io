---
layout: post
title: domain 域名购买与 centos 服务器绑定
date: 2021-08-02 21:01:55 +0800
categories: [System]
tags: [system, tomcat, sh]
published: true
---

# 背景

购买域名。

对比了几家，最后选择 Namesilo。因为便宜。

# Namesilo 简介

[Namesilo](https://www.namesilo.com/) 是 ICANN 认证的域名域名注册商之一，注册和转入都很人性化，安全保护到位而且性价比很高。

## 优势

价格便宜稳定，无套路

Namesilo 域名本身价格就比较便宜，COM 域名 $8.99/年，除了一个一美元优惠码（优惠码 okoff 或者 go2think），基本没有其他大幅度促销活动，域名续费和首年购买价格一致。

套路指那些首年极其便宜，但次年续费很贵的。如 Godaddy，首年 $0.99，次年续费要 102 元人民币，而且隐私保护还需要额外再加 60 元。

Namesilo 价格表：Domain Pricing

永久免费的隐私保护

Namesilo 提供永久免费的域名隐私保护，防止别人通过 WHOIS 查询获取域名所有者的个人注册信息。作为对比，Godaddy 的隐私保护是 60 元/年，Namecheap 是免费提供第一年。

安全性高

支持账户登陆二次验证和 Domain Defender，保护账户和域名安全。登陆、解锁域名等，都可以设置邮件或短信提醒。

支付方便
支持支付宝、Paypal、信用卡等多种方式付款。

## 不足

网站风格比较 “传统”，英文页面，功能强大的同时也带来了很多的选项，对于不熟悉的新手可能不太好找。

总结：个人体验和服务上，我觉得除了第一次使用时面板选项不太好找外，其它方面真的没啥黑点和问题，网上评价也很高，以后除了续费也不需要管太多。已经把域名全部迁移到这里了。

# 查找域名

## 账户注册

进入 Namesilo ，点击右上角 “Create New Account” 注册账号。

* 为必填内容，建议如实填写；勾选 “Keep my information private” 默认使用隐私保护，保护我们的注册信息。

这里必须保证邮箱正确，因为需要使用邮箱去验证。

## 查找

首先去找域名。

个人理解，很多域名之所以冷门，是因为没有人用来做什么事情，总体而言 .com 是最贵的。

量力而为。


## 购买

确认订单，设置域名续费规则、注册时长等。

![购买](https://pic1.zhimg.com/80/v2-47febc8d3aad8c008f3661025bfd9c70_720w.jpg)

注意：

（1）取消自动续费

（2）选择隐私保护

在 “Have a Coupon……” 处输入优惠码 okoff 或者 go2think ，点击 “Submit”应用，优惠一美元。

支付的方式可以是支付宝+微信，很方便。


# 域名解析 / 设置DNS服务器

域名注册购买成功后，我们就可以把域名解析到服务器了。

这里我们可以直接使用 Namesilo 解析域名；也可以使用其它解析服务，然后更改 DNS 服务器地址。

![设置DNS服务器](https://pic3.zhimg.com/80/v2-d685f9aa06f1c2668f0fdcf9c867d2b2_720w.jpg)

配置地址：[https://www.namesilo.com/account_domains.php](https://www.namesilo.com/account_domains.php)

## 方法一：使用 Namesilo 解析域名

点击 蓝色小球，编辑 DNS，可以自己设置，也可以使用下面提供的模版。

一般设置 example.com 和 www.example.com 指向自己的服务器 IP 地址就够用了。

![Namesilo](https://pic4.zhimg.com/80/v2-96099b7c9debdaf41bee705a2e147f7b_720w.jpg)


# 域名解析说明

域名解析，就是将自己的网站域名与网站所在服务器/主机/VPS 的 IP 地址对应起来。

![域名解析说明](https://pic2.zhimg.com/80/v2-c11219a53b10027cf000214a80ff2829_720w.jpg)

一般只要解析带 www 的和不带 www 的两条域名记录就够了，即将 example.com 和 www.example.com 这两个域名指向主机 IP。

当然，也有的用户喜欢用 blog.example.com 之类的，设置方法是相同的，将 www 位置换为 blog 就行了。

解析记录里要填的四个项目：（名称可能有出入）

HOSTNAME：主机名，
空着 -> example.com，
填 www -> www.example.com，
填 blog -> blog.example.com；
TYPE：常用 A 和 CNAME 两种记录类型；
ADDRESS：网站所在主机的 IP 地址；
TTL：一般设置为 3600。

## 方式一：A + A

点击 “Add/Edit a Resource Record” 栏中的 A，依次添加两条 A 记录，将域名指向主机 IP，设置如下：

第一条：HOSTNAME：空，ADDRESS：网站主机 IP 地址，TTL：3600；
第二条：HOSTNAME：www，ADDRESS：网站主机 IP 地址，TTL：3600。

## 方式二：A + CNAME

也可以将第二条 www 的设置为 CNAME 记录，第一条 A 记录同上，具体设置如下：

第一条：HOSTNAME：空，ADDRESS：网站主机 IP 地址，TTL：3600；
第二条：HOSTNAME：www，ADDRESS：http://example.com，TTL：3600。

以上两种设置方法均可，最常用的应该是方式一（两条 A 记录），个人使用的第二种方法。

新手无需纠结，任选一种直接用，先把网站运行起来，其它的以后再慢慢研究。

# 如何启用 HTTPS

## 说明

购买域名的时候，其实可以选择 SSL，不过比较贵。

这里可以采用免费的 Let's Encrypt。




# 参考资料

https://zhuanlan.zhihu.com/p/116916962

https://zhuanlan.zhihu.com/p/33921436

[Namesilo优惠码注册域名购买教程](https://www.1deng.me/namesilo-sign-up-tutorial.html)

[Namesilo DNS 域名解析教程和常见问题解决方法汇总](https://zhuanlan.zhihu.com/p/86961133)

[NAMESILO如何注册域名和添加解析](https://www.zzygx.cc/?p=916)

* any list
{:toc}