---
layout: post
title:  互联网风控笔记
date:  2021-2-14 16:52:15 +0800
categories: [BIZ]
tags: [biz, risk, sh]
published: true
---


# 拓展阅读

[风控知识总结](https://github.com/yangliang1415/awesome-risk-control)

[星云（TH-Nebula)业务风控系统介绍](https://github.com/threathunterX/nebula)

[“六道”实时业务风控系统](https://github.com/ysrc/Liudao)

[风险控制笔记，适用于互联网企业](https://github.com/WalterInSH/risk-management-note)

[互联网资安风控实战](https://github.com/xdite/internet-security)

[轻量级JAVA实时业务风控系统框架](https://github.com/search?q=%E9%A3%8E%E6%8E%A7&type=repositories)

[风控、大数据、算法](https://github.com/fgyeason/algorithm-and-risk-management)

[金融风控系统（springboot+drools）、flink流计算、mongodb](https://github.com/wikke/ppdai_risk_evaluation)

[陌陌风控系统静态规则引擎，零基础简易便捷的配置多种复杂规则，实时高效管控用户异常行为。](https://github.com/momosecurity/aswan)

[风控、实时计算、技术框架、架构方案、Groovy规则引擎、规则决策](https://github.com/aalansehaiyang/risk-talk)

[实时风控系统，基于spark-streaming、drools、kafka、redis](https://github.com/janecd/RiskRule)

[拍拍贷网贷数据挖掘，风控建模](https://github.com/quicklysnail/PPD-data-mining)

[风控系统](https://github.com/madfroghe/riskManage)

# 异常发现

使用频繁项集(Frequent Pattern)发现异常

时间序列检测： LSTM

# proxy-ip

地区 ip 的限制

公共免费 ip

[ip2region](https://github.com/houbb/ip2region)

[ip-filter](https://github.com/houbb/ip-filter.git)

# 身份证

isReal?

就可以成为一个服务

# 邮箱

isReal?

就可以成为一个服务

# 手机号

isReal?

就可以成为一个服务

# 设备信息

如何识别设备信息？？？

机型

时区

网络信息：wifi 网络供应商？

# 地理位置

经纬度

# 用户行为

## 单个用户的历史行为

## 同类用户的行为

# 阈值要怎么选取？

- 尽量搜集相关数据

- 察数据分布

- 分布中找到区分黑产和普通用户分界点

- 据分界点和影响范围选取阈值

- 则上线后的跟近

# 情报信息

## 第三方情报公司有(排名不分先后)：

- 微步在线

- 同盾科技

- 邦盛科技

- 蚂蚁金服 蚁盾

- 威胁猎人

## 开放的名单

我们除了从自己公司的数据中统计高危名单，也会参考其他公司开放的数据。


携程安全云 https://security.ctrip.com/

阿里云IP表 http://www.tcpiputils.com/browse/as/37963

# 验证手段

## 扫码登录

扫二维码登录是国内大厂喜欢的电脑端验证手段，本质是用已验证的移动设备来认证电脑端的行为。

## 动态密码登陆

2013年-2015年流行一个理念：传统数字密码是落后的、不安全的、体验不好的。很多安全甲乙方公司都在提N年内消灭密码，创造一个没有密码的时代。提出了很多新的验证方式，例如指纹、声音、虹膜等生物特征。

其中有些已经广泛普及，有些技术因为准确性不够仍处在实验室阶段，有些受限于硬件未能普及。

动态密码是真真切切的让用户不需要记忆密码，极大改善了用户体验。

可是企业还是会提供传统的用户名密码登陆，原因有3个：

- 要求用户注册时绑定手机号（这个在国内不是大问题）

- 短信如果有延迟，用户体验其实更差。如果收不到短信，那就更糟了

- 对于大厂，短信费也很贵啊

## 两步验证

两步验证(2-Step Verification)又叫双因子验证(2-Factor Verification)，简单理解就是除了用户名和密码，还要进行第二步验证。

往往是网站向已绑定的手机号或者邮箱发送一串随机数字，用户在网站或者App上填写收到的数字。

还有一个类似的思路叫上行短信验证（上面Google的例子是下行短信验证），页面上显示一串数字，请用户使用已绑定的手机向企业的号码发送这串数据。

上行短信校验比较少见，个人认为是体验问题，用户要输入网站手机号（10位），又要输入随机数（6位），还要花用户1毛钱。体验不是一般差！

ps：现在可以调整为手机扫码，然后发送短信。缺点是还是要花用户钱，不过还可以接受。


# 蜜罐

通过一些手段，引诱黑灰产通过或攻击普通用户无法触达的资源，从而清晰的将黑灰产和普通用户流量区分的过程。这其中的资源就是蜜罐。

## 羊毛论坛

http://www.zuanke8.com

http://www.79tao.com

http://www.hym68.com/

http://www.0818tuan.com/

http://www.hxwz2.com/

https://www.iqshw.com/

https://www.52pojie.cn/

思路：黑白通吃。一个羊毛论坛，同时获取到羊毛党的信息。

# 图分析技术

图的另一个主要应用场景就是风险控制。

因为很多时候我们需要：

- 顺藤摸瓜找到风险发生的根本原因或者主体，例如电信诈骗中顺着钱在不同账户的流向来确定犯罪嫌疑人

- 挖出团伙，例如使用同一IP地址的可疑账号

- 当单个实体信息较少，无法判断风险的时候，利用其相关实体来辅助判断，例如金融借贷


# 参考资料

https://github.com/WalterInSH/risk-management-note

https://github.com/yangliang1415/awesome-risk-control

[异常发现](https://github.com/WalterInSH/risk-management-note/blob/master/%E5%BC%82%E5%B8%B8%E5%8F%91%E7%8E%B0.md)

* any list
{:toc}
