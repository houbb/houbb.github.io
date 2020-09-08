---
layout: post
title:  ACP 学习-11-多选题汇总
date:  2020-7-19 16:40:20 +0800
categories: [Cloud]
tags: [cloud, sf]
published: true
---

# 1、

以下哪些操作会导致自定义镜像制作失败？ ABC

A、不设置自定义镜像名称 B、选择数据盘快照制作 C、不设置自定义镜像描述 D、选择系统盘快照制作


# 2、

SLB中,针对7层（HTTP协议）的服务监听,您可以进行哪些功能配置?  ABCD

A、转发规则 B、获取真实IP C、健康检查 D、会话保持

https://help.aliyun.com/knowledge_detail/39410.html

针对7层（HTTP协议）的服务监听，您可以进行“转发规则”、“获取真实IP”、“会话保持”和“健康检查”的功能配置；


# 3、

以下哪些状态属于ECS生命周期中的稳定状态？ ABC

A、运行中 B、已停止 C、已过期 D、停止中

# 4、

您可以通过以下哪些方式为提供数据库服务？ BC

A、Linux的环境安装包安装数据库 B、单独购买RDS数据库 C、使用镜像市场免费配置环境的数据库 D、Windows的环境安装包安装数据库


# 5、

CDN缓存是为了加速页面的访问,阿里云CDN提供了哪几种刷新缓存的方法？ BCD

A、整站刷新 B、目录刷新 C、URL 预热 D、URL 刷新

https://help.aliyun.com/document_detail/27140.html

URL刷新：强制回源拉取更新的文件，并更新CDN Cache节点上的指定文件

目录刷新：强制回源拉取更新的目录，并更新CDN Cache节点上的指定文件目录，适用于多内容较多的的场景。

URL预热：将源站的内容主动预热到L2 Cache节点上，用户首次访问可直接命中缓存，缓解源站压力。

# 6. 

以下哪些存储,数据库类的阿里云产品结合才能满足大多数互联网应用的需求？ABC

A、OSS存储服务 B、ECS云服务器 C、RDS关系型数据库 D、OTS结构化数据库


# 7、

哪些云产品可以创建为专有网络类型？ABD

A、ECS   B、RDS   C、ODPS   D、SLB

# 8、

以下哪些配置是在购买ECS时需要指定的？ABCD

A、CPU B、内存 C、地域 D、镜像

# 9、

OSS控制台支持哪些功能?  ABCD

A、bucket所在地域   B、创建时间   C、对于bucket操作   D、bucket列表

https://help.aliyun.com/knowledge_detail/39626.html


# 10、

在ECS中挂载磁盘的时候哪些请求参数时必须的？ ABC

A、DiskId B、InstanceId C、Action D、Device

https://help.aliyun.com/document_detail/25515.html

# 11、Channel是OSS 图片服务API的基本概念之一,Channel是IMG上的命名空间,它具有以下哪些功能？( 老版本图片服务API )  

ABC   

A、控制权限   B、日志记录   C、计费  D、管理Object

https://help.aliyun.com/document_detail/32207.html

Channel 是 IMG上的命名空间，也是计费、权限控制、日志记录等高级功能的管理实体。

IMG名称在整个图片处理服务中具有全局唯一性，且不能修改。

一个用户最多可创建 10 个 Channel，但每个Channel中存放的object的数量没有限制，存储容量每个Channel最高支持2PB。目前Channel跟OSS的Bucket相对应，即用户只能创建与自己在OSS上Bucket同名的Channel。


# 12、云盾DDoS防护功能可以防护哪些类型的攻击？ABCD

A、ACK Flood   B、SYN Flood   C、ICMP Flood    D、UDP Flood

https://help.aliyun.com/knowledge_detail/40051.html，还有DNS Flood、CC攻击等

# 13、下列关于ECS独立云盘说法正确的是？ BCD

A、重新初始化磁盘,快照会被自动删除 B、更换系统盘时,用户快照不会被删除 C、更换系统盘时,磁盘ID会发生变化 D、更换系统盘,用户系统数据会丢失

https://help.aliyun.com/knowledge_detail/40553.html

# 14、

SLB到期之后,会对SLB的后端ECS实例造成什么影响?  AD

A、ECS服务器本身不会受到影响  B、如果域名是解析到SLB上的,那么不会影响站点的访问  

C、ECS服务器会同时到期  D、如果部署在ECS上的应用对应的域名是解析到SLB上的,那么会影响站点的访问

# 15、地域（Region）是指ECS实例所在的物理位置。目前全球可供选择的地域有哪些？ABCD

A、北京 B、青岛 C、香港 D、杭州

# 16、ECS如何克隆一台一模一样的实例？ AD

A、通过快照,创建一个新的系统盘,生成新的实例  B、对已经配置完成的数据盘进行打快照,然后在购买或者升级页面,添加磁盘的地方点：“用快照创建磁盘”,选择你要的快照即可。 

C、启动新生成的ECS登陆检查数据及环境  D、通过创建自定义镜像的方式,创建一个自定义镜像,然后使用这个自定义镜像创建ECS即可

# 17、使用了阿里云CDN后,如果缓存命中率比较低,可能的原因是什么？ ABCD

A、缓存配置不合理,针对某些文件设置较短,导致CDN节点频繁回源  B、HTTP Header设置导致无法缓存,需要用户检查源站的 Cache-Control 设置或者 Expires 的设置  

C、源站动态资源较多,多为不可缓存的内容,也会导致频繁回源拉取  D、网站访问量较低,文件热度不够,CDN收到请求较少无法有效命中缓存

https://help.aliyun.com/document_detail/27266.html

# 18、CDN的数据服务等级指标有哪些?  BCD

A、数据可移植性 B、数据知情权 C、数据私密性 D、数据持久性

https://help.aliyun.com/knowledge_detail/40161.html，

还有数据可清除性、数据可迁移性、数据可审查性、服务功能、服务可用性、服务资源调度能力、故障恢复能力、网络接入性能、服务计量准确性

# 19、下面可能是ECS实例的稳定状态的是？  AB

 A、运行中 B、已停止 C、停止中 D、创建中

AB

其他两个都是一个动作的处理过程

# 20、通过阿里云“弹性伸缩”服务自动创建的ECS符合以下哪些特征？  BC

A、创建的ECS会配置相同的IP地址 B、如果伸缩组里指定了RDS实例,系统会自动将ECS的IP加入指定的RDS访问白名单当中 

C、如果伸缩组里指定了SLB实例,系统会自动将ECS的加入到SLB组里 D、创建的ECS配置都是相同的

https://help.aliyun.com/document_detail/25890.html?spm=a2c4g.11186623.6.570.21ba58bcECyMwD

# 21、ECS服务器使用注意事项说法正确的是？ AD

A、云服务器的内核和操作系统版本不要随意升级  B、Linux的云服务器数据盘未做分区和格式化,使用前请挂载数据盘  

C、Windows操作系统的云服务器建议使用虚拟内存 D、网卡的MAC地址不要修改

不支持虚拟内存的

# 22、云盾”基础DDoS防护“功能在管理控制台可以配置针对云服务器的流量清洗触发值,请选出可配置的所有维度,达到任意一个值即开始流量清洗？ CD

A、ECS公网IP每秒接收的字节数(b)  B、ECS公网IP每秒发送的字节数(b)   

C、ECS公网IP每秒处理的报文数量（PPS）   D、ECS公网IP每秒处理的流量值（bps）

https://help.aliyun.com/knowledge_detail/40051.html


处理的报文数量+流量值

# 23、阿里云OSS与自建存储相比,有哪些优点？ ABCD

A、海量存储 B、低成本 C、安全 D、多线BGP接入

# 24、以下哪些是ESS弹性伸缩服务的术语  ABCD

A、伸缩规则  B、伸缩组  C、伸缩配置   D、伸缩活动

https://help.aliyun.com/document_detail/25898.html

# 25、SLB实例监听可选择的协议类型有哪些？  ABD

 A、TCP   B、HTTPS   C、FTP   D、HTTP

# 26、以下关于OSS图片处理API channel说法正确的有哪些？ ABD

A、一个用户最多可创建 10 个 Channel B、存储容量每个Channel最高支持2PB 

C、IMG名称在整个图片处理服务中具有全局唯一性,且不能修改 D、每个Channel中存放的 Object 的数量和大小总和没有限制

https://help.aliyun.com/document_detail/32207.html


Channel 是IMG上的命名空间，也是计费、权限控制、日志记录等高级功能的管理实体。IMG名称在整个图片处理服务中具有全局唯一性，且不能修改。

一个用户最多可创建10个Channel，但**每个Channel中存放的object的数量没有限制**。

目前Channel跟OSS的Bucket相对应，即用户只能创建与自己在OSS上Bucket同名的Channel。


# 27、阿里云官网的帐号安全包括哪些具体措施？ BCD

A、密保问题  B、多因子认证  C、手机绑定  D、登录密码

# 28、以下是ECS实例数据盘挂载点的是： ABD

A、/dev/xvdz  B、/dev/xvdd  C、/dev/xvda  D、/dev/xvdb

https://help.aliyun.com/knowledge_detail/50920.html，/dev/xvda是系统盘

# 29、如何避免SLB服务本身故障导致的单点问题?  ABC

A、在不同地域（Region）创建多个SLB实例, 通过DNS轮询的方式对外提供服务,从而提高跨地域的可用性  B、SLB实例后端的ECS 可以是不同Zone下的机器, 从而提高本地可用性  

C、在同一地域 （Region）创建多个SLB实例,通过DNS轮询的方式对外提供服务,从而提高本地可用性  D、无法避免

https://help.aliyun.com/document_detail/42788.html

# 30、云服务器ECS在哪些状态下才能创建快照？ AD

A、Running  B、Stopping  C、任何状态  D、Stopped	

# 三、判断题（共20题，每题1分，共20分）

1、云盾的DDoS防护功能可以保护阿里云机房内的所有云产品,包括： ECS、SLB、RDS、OCS、OSS、ODPS、ADS等。 F   是 否

2、云盾安骑士可以保防阿里云以外的服务器   T   是 否

3、云盾反欺诈服务可以输出风险评估报告,实时呈现今日、昨日及特定时间段的风险情况,便捷跟踪、掌握风险防控情况   T   是 否

4、当用户通过ECS Open API进行跨账户的ECS资源访问时,ECS后台向RAM进行权限检查,以确保资源拥有者将相关资源的相应权限授予给了调用者。 T  是 否

5、报警任务名称在用户账号下唯一。如果该报警任务名称已经存在,则用新的值进行替换  T  是 否

https://help.aliyun.com/document_detail/25907.html，弹性伸缩创建报警任务

6、对安全组的操作调整,对用户的服务连续性没有影响   T  是 否

7、阿里云CDN不仅支持图片和css文件加速,还支持视频流媒体加速  T 是 否

8、阿里云的云数据库可以完美兼容Oracle的PL/SQL、数据类型、高级函数、数据字典  F 是 否

9、无论伸缩组内是否有伸缩活动, 都可以停用伸缩组F 是 否

https://help.aliyun.com/document_detail/25886.html?spm=5176.doc25907.6.580.SH0nS1

**只有在当前伸缩组没有任何伸缩活动进行时，才能停用伸缩组。**

当伸缩组为生效（Active）状态，才可以执行此功能。

10、经典网络的内网网段不支持用户自定义,专有网络用户可自定义内网网段T 是 否

11、弹性伸缩一定要搭配SLB、云监控才能使用F 是 否

12、ECS API调用成功返回的数据格式主要有XML和JSON两种,外部系统可以在请求时传入参数来制定返回的数据格式,默认为JSON格式F 是 否

默认是 xml

13、动静分离是指将一个网站的动态和静态内容分成两个以上的站点分别承载, 动静分离的网站不利于通过CDN加速。F 是 否

14、选择阿里云本地磁盘或者本地SSD盘的ECS实例,一旦创建后,不能修改实例规格F 是 否

15、不同VPC之间内部网络完全隔离,只能通过对外映射的IP（弹性IP和NAT IP）互联F 是 否

16、对于阿里云OSS服务来说,每个Bucket中只能存放10000个Object  F  是 否

17、某客户的网站在原服务商做过ICP备案,拥有了自己的备案号,现在他想将网站迁移至阿里云ECS,必须在阿里云进行一次备案接入操作  T  是 否

18、ECS实例不支持强制停止,强制停止等同于断电,可能会丢失ECS实例操作系统中所有磁盘的数据 F

https://help.aliyun.com/document_detail/25501.html，实例支持强制停止，强制停止等同于断电处理，可能丢失实例操作系统中未写入磁盘的数据。

19、对ECS API接口调用是通过向ECS API的服务端地址发送HTTP GET请求,并按照接口说明在请求中加入相应请求参数来完成的 T  是 否

https://help.aliyun.com/document_detail/25488.html，根据请求的处理情况，系统会返回处理结果。

20、开放存储服务OSS仅支持按照存储容量付费。 F  是 否

* any list
{:toc}