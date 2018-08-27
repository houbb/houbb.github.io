---
layout: post
title:  CFETS New Plateform
date:  2018-08-27 10:52:03 +0800
categories: [Biz]
tags: [biz, cfets, sh]
published: false
---

## 本币新平台咨询汇总

#### 问题一：新平台更新后开发文档怎么申请，开发材料在哪里下载？

已通过问询，邮件回复如下：

------

新平台本币交易接口连接信息：
IP地址是：200.31.156.161，其中，
NDM是：17662端口，
QDM交易是：17660端口，
QDM行情是: 17663端口。

2.新本币cut终端下载链接：https://200.31.156.161/cut-release
点击地址转换，修改生产地址为https://200.31.156.161，登录时选择生产环境
使用首席交易员登录cut，设置机构托管账户和资金账户（内部管理->账户设置），进行交易。

3.本币新平台交易接口开发指南获取途径如下；
IMIX网站开发包下载地址：http://imix.chinamoney.com.cn/logonAction!toLogon.html
本币会员用户名/密码：FI_2018 / FI_download_2018

如需准备联调测试，请咨询外汇交易中心业务二部边宇卒 （[bianyuzu@chinamoney.com.cn](mailto:bianyuzu@chinamoney.com.cn)）申请验收测试。

------

#### 问题二：新平台对目前的CSTP、CMDS有没有影响？

发布过CSTP和CMDS新平台的开发指引，但是CSTP改动很小，增加了些字段，如果不使用，可以继续用现有版本.CMDS有些服务整合和删除了，即对于下发消息理论上现有版本都有正常处理，整合部分需要机构进行评估。具体可以见中心四月份的通知：http://www.chinamoney.com.cn/chinese/xtyxtz/20180423/1080353.html?cp=jszc

#### 问题三：目前的新平台测试过程中，为避免出现：bondcode error错误，建议使用债券：100007、1000002

#### 问题四：新平台更新后，对新机构的申请是否有影响？

电话咨询技术支持部门，回应拨打市场二部电话，拨通市场二部电话后给出的回复：目前新平台的事宜直接和技术以及测试部门沟通即可，还未有正式的申请流程出台。

#### 问题五：联系方式备份。

技术部门——4009787878转5转3

市场二部——4009787878转2转5

#### 问题六：本币新平台需要申请新的账号，已申请，账户信息为：

------

新平台本币交易接口环境搭建信息如下：
1.新本币cut终端下载链接：<http://200.31.156.161/cut-release>
点击地址转换，修改生产地址为[http://200.31.156.161，登录时选择生产环境，无证书可点击应急登录。](http://200.31.156.161%EF%BC%8C%E7%99%BB%E5%BD%95%E6%97%B6%E9%80%89%E6%8B%A9%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%EF%BC%8C%E6%97%A0%E8%AF%81%E4%B9%A6%E5%8F%AF%E7%82%B9%E5%87%BB%E5%BA%94%E6%80%A5%E7%99%BB%E5%BD%95%E3%80%82)
同时登录多个终端需将安装目录下CIBMTS.exe的config文件中的AllowMultipleInstance对应值改成True。
使用交易员登录cut，点击左上角设置相关信息，查询交易，点击最右边￥标识进行交易。
注意：初期链接为[http://200.31.156.161/cut-release，之后长期链接为https://200.31.156.161/cut-release](http://200.31.156.161/cut-release%EF%BC%8C%E4%B9%8B%E5%90%8E%E9%95%BF%E6%9C%9F%E9%93%BE%E6%8E%A5%E4%B8%BAhttps://200.31.156.161/cut-release)

2.新平台本币交易接口连接信息，开通相应防火墙：
对外地址是：200.31.156.161，其中，
NDM是：17662端口，
QDM交易是：17660端口，
QDM行情是: 17663端口。

配置文件中设置：
SenderCompID=21位机构代码
TargetSubID=NDM/QDM
SenderSubID=API用户

3.本币新平台交易接口开发指南（现券市场）获取途径如下；
IMIX网站开发包下载地址：<http://imix.chinamoney.com.cn/downloadAllAction!toDownloadMain.html>
本币会员用户名/密码：FI_2018 / FI_download_2018

4.机构账户信息：
（1）本方机构信息：
机构简称：XXX
21位机构码：XXX

NDM/QDM交易接口用户/密码：XXX

交易员信息：
普通交易员用户/密码：XXX
API交易员用户/密码：XXX

（2）对手方机构信息：
机构简称：XXX
21位机构码：XXX
对手方交易员账号/密码（登录cut完成交易）：XXX

因初期环境不稳定，机构可向bdyhdealer2发送报价，致电支持组配合完成测试。

------

#### 问题七：关于新平台的CSTP、CMDS、RDI、交易接口等接口账号和客户端账号都是需要重新申请的吗？

不需要重新申请

#### 问题八：新平台对应的新CSTP、CMDS、rdi相关事宜。

新平台环境的CSTP、CMDS、RDI还未就绪，不能接受新平台信息，后期就绪后使用原有账号。

#### 问题九：关于交易账户组功能、本币交易员身份实名认证相关功能、资金账户维护及托管账户DVP绑定功能和机构用户管理功能相关问题。

移步：

[其他问题解答]: https://mp.weixin.qq.com/s?__biz=MzIxODA3NDM1NA==&amp;mid=2247484179&amp;idx=1&amp;sn=5567660c1c37c7da7929eaba31176304&amp;chksm=97f15e8ea086d798f9b55849a8518cced0dd4cc78a3d961a181a0bb2df0275196f845bdee67f&amp;mpshare=1&amp;scene=23&amp;srcid=0822vzqt51na9c9rqSy3eo4e#rd

#### 问题十：我方新旧平台的切换情况。

为加快申请账号事宜，请求账号时提供了XXX机构信息，现今阶段旧的XXX账号合并为当前的新平台账号。

交易账号信息等请参考问题六解答。

接下来如果再有问题再后续补充。


* any list
{:toc}