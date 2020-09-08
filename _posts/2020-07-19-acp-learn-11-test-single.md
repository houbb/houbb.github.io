---
layout: post
title:  ACP 学习-11-单选题汇总
date:  2020-7-19 16:40:20 +0800
categories: [Cloud]
tags: [cloud, sf]
published: true
---

# 1、

以下创建ECS镜像时,哪个步骤的描述有错？C

A、输入的自定义镜像描述可以为空   B、选择全部快照 ,可以看到快照的列表   C、输入自定义镜像名称,可以为空   D、登陆阿里云的控制台来创建ECS镜像

# 2、

RAM中可授权的SLB资源类型是哪个？A

A、LoadBalancer B、BackendServer C、Listener D、Region

https://help.aliyun.com/document_detail/27575.html

在进行RAM子账号授权时，SLB资源的描述方式如下：

LoadBalancer

Certificate

ACL

# 3、

当阿里云用户想要通过API进行ECS实例删除的操作的时候,必须保证ECS实例状态为____,才可以进行删除操作,删除后实例的状态变为____？A

A、Stopped；Deleted B、Stopped；Starting C、Stopping；Deleted D、Stopping；Starting


# 4、

下列哪个参数代表的是SLB实例的唯一标识？A

A、LoadBalancerId B、RegionId C、Address D、LoadBalancerName


# 5、

在对ECS实例进行续费操作时,无法实现以下哪个操作？D

A、增加CPU规格 B、带宽升级 C、增加内存空间 D、无需重启即可享受升级后的配置

# 6、

下列关于ECS连接实例的说法错误的是？D

A、Windows 2008默认允许最多2个session远程连接   B、可以通过两种方式连接和管理用户实例：远程连接客户端和阿里云ECS控制台   

C、Linux或Mac OS X环境连接Linux实例,直接使用ssh命令   D、如果用户使用远程连接的工具访问ECS实例,使用公网和私网IP的实例都能被远程连接


# 7、

用户通过CES管理控制台查看其拥有的某个区域拥有的所有ECS实例的步骤包括： 

a. 进入ECS管理控制台;  b.选择地域； c.选择ECS实例管理,    则正确的排列顺序是？B

A、b;a;c B、a;b;c C、a;c;b D、c;b;a


进入ECS管理控制台;=>选择地域；=>选择ECS实例管理

# 8、

如果用户需要创建SLB实例,为能够真正的实现应用负载分担,那么要保证至少要有多少个ECS实例？B

A、5个  B、2个  C、3个  D、1个

至少需要2台才能进行负载

# 9、

下列关于RDS内网连接说法错误的是？B

A、用户可以在RDS内网和外网间切换  B、RDS实例内外网切换不会影响其他与RDS实例的连接  

C、ECS可以使用内网地址连接RDS实例  D、用户可以在RDS管理控制台的实例基本信息中查看当前实例使用的连接方式

https://help.aliyun.com/knowledge_detail/41872.html

# 10、

在OSS服务中,单个object的大小限制为_____？C

A、24.4TB B、50TB C、48.8TB D、38.8GB

# 11、

下列关于SLB API ServerCertificate的说法错误的是？A	

 A、一次可以上传多份证书  B、证书和PrivateKey一定要对应  C、一次只能上传一个PrivateKey  D、返回结果为成功或者错误码

https://help.aliyun.com/document_detail/27587.html

UploadServerCertificate一次只能上传一份证书和对应的PrivateKey，返回结果为成功或者错误码。

# 12、

RDS采用什么形式的网络架构？什么实例可完成"数据回溯"功能？

B

A、点对点技术架构；只读实例 B、主从备份架构；临时实例 

C、点对点技术架构；临时实例 D、主从备份架构；只读实例

https://help.aliyun.com/document_detail/30188.html

每个RDS实例可以创建一个临时实例，临时实例有只读权限，并且继承备份点的账号和密码以及内外网状态，创建成功后48个小时内有效

# 13、

VPC实例的状态变为什么之后,表示VPC创建成功,可以进行下一步的管理操作

C

A、Standby  B、Runing  C、Available  D、Inavailable

# 14、

关于OSS域名绑定描述正确的是？C

A、OSS域名绑定（CNAME）功能目前仅支持OSS以二级域名访问方式进行绑定。 B、OSS域名绑定时的访问方式为（Bucket name）.${zone}.aliyuncs.com 

C、以上都不对  D、OSS cname绑定的域名必须经过阿里云备案

https://help.aliyun.com/knowledge_detail/39614.html

OSS目前已不支持二级域名访问，仅支持三级域名的访问。三级域名外链访问：

http://bucketname.oss.aliyuncs.com/object

https://help.aliyun.com/document_detail/31902.html?spm=5176.7739649.2.1.X4F70z

OSS访问方式为（Bucket name）.${region}.aliyuncs.com

# 15、

SLB LoadBalancer中哪个接口是用来修改SLB实例的计费方式的？A

A、ModifyLoadBalancerInternetSpec  B、CreateLoadBalancer   

C、SetLoadBalancerStatus   D、SetLoadBalancerName

https://help.aliyun.com/document_detail/27578.html


# 16、

当ECS处于以下哪个状态时可以挂载磁盘? D

 A、更换系统中 B、启动中 C、重置中  D、已停止

https://help.aliyun.com/document_detail/25446.html

挂载磁盘时，实例需要满足以下条件：状态必须为 运行中 (Running) 或者 已停止（Stopped）

ps: 处理中一般都不支持挂载磁盘

# 17、

某保险公司的线上平台每天在线订单量超过20万笔,一年来频繁受到大流量攻击,使服务断断续续,严重影响了公司的品牌和业务量。

请你为该公司推荐一个云盾的服务或产品,提供强大的攻击防护能力,保证业务不中断。

C

A、服务器安全托管   B、态势感知   C、DDoS高防IP   D、网络安全专家服务


# 18、

阿里云OSS图片处理服务,绑定域名需要做线上验证,其中一步是下载验证文件并上传到您域名的______下,此步骤为验证您对绑定域名的所有权。（请选择最准确的描述）B

A、有效率 B、根目录 C、顶级目录 D、子目录

https://help.aliyun.com/knowledge_detail/39665.html?spm=5176.10695662.1996646101.searchclickresult.7bfb295cVsiI1k

ps: 一般都是根目录


# 19、

实现VPC中ECS服务器切换/迁移到同VPC下的其他交换机,包括以下几步,请选择正确的顺序：

1、打开云服务器管理控制台；2、找到对应的需要切换/迁移的云服务器；3、选择您所需的交换机,同时指定新交换机下的IP；4、修改云服务器的私网地址；A

A、1,2,3,4  B、1,2,4,3  C、1,3,2,4  D、1,3,4,2

https://help.aliyun.com/knowledge_detail/38759.html


# 20、

ESS的一个伸缩组内最多只能创建几个伸缩规则?   50个

A、5个   B、10个    C、15个   D、20个

https://help.aliyun.com/document_detail/25920.html?spm=a2c4g.11186623.4.6.2c534670ZXjjlT


# 21、

下列关于SLB说法错误的是？ C

A、不同操作系统的ECS可以同时做为SLB服务的后端服务器   B、SLB的服务能力与后端ECS的公网宽带规格无关   

C、同一组ECS不可以搭建多个网站并同时进行负载均衡   D、在使用SLB的过程中随时调整后端ECS的数目

# 22、

当用户想以个人身份向OSS发送请求时,需要首先将发送的请求按照OSS指定的格式生成签名字符串；然后使用AccessKeySecret对签名字符串进行加密产生验证码。

OSS收到请求以后,会通过AccessKeyID找到对应的AccessKeySecret,以同样的方法提取签名字符串和验证码,如果计算出来的验证码和提供的一样即认为该请求是有效的；否则,OSS将拒绝处理这次请求,并返回HTTP错误状态码是多少？C

A、错误状态码:405   B、错误状态码:400   C、错误状态码:403   D、错误状态码:500

https://help.aliyun.com/document_detail/31867.html

三种身份验证方式：AK验证、RAM验证、STS验证


# 23、

下列哪种SLB后端服务器的状态表示未开启SLB健康检查？A

A、unavailable B、available C、abnormal D、normal

https://help.aliyun.com/document_detail/27635.html

后端服务器的健康状况为normal,abnormal和unavailable三种。

其中unavailable表示这个负载均衡实例没有配置健康检查，无法获取后端服务器的健康状况。


# 24、

ECS服务的API服务地址是什么？ C

A、ecsapi.aliyuncs.com B、ecs.aliyun-api.com 

C、ecs.aliyuncs.com D、ecs.aliyun.com

https://help.aliyun.com/document_detail/25692.html 

# 25、

在阿里云ECS中,无论每次接口调用请求是否成功,系统都会返回一个唯一识别码（返回参数）_______给用户？  D

A、Version   B、AccessKeyId   C、Response   D、RequestId

https://help.aliyun.com/document_detail/25490.html


# 26、

如果ECS实例采用linux系统,关于能否开启NetWorkManager服务说法正确的是？  A

A、linux系统请不要开启NetWorkManager服务，否服务出现冲突,导致网络异常  B、linux系统可以开启NetWorkManager服务 

C、以上都不对 D、linux系统请可以开启NetWorkManager服务,但需要进行相应的配置调整

# 27、

阿里云CDN和淘宝CDN用的是一套系统,下列哪个资源是隔离分开的？ B

A、项目方案 B、使用资源 C、运维团队 D、技术

# 28、

ECS外部系统可以通过API在请求时传入参数来指定返回的数据格式,默认为什么格式？  D

 A、JSP   B、HTTP   C、以上都不对   D、xml

数据格式，默认为 xml

# 29、

用户如果想要在OSS中模拟实现文件夹的创建操作,需要使用的API是哪个？B

A、Multipart Upload   B、putObject   C、Get Object   D、Copy Object

https://help.aliyun.com/document_detail/31910.html?spm=a2c4g.11186623.4.3.16747cfbgQBxZt

创建模拟文件夹本质上来说是创建了一个空文件，对于这个文件照样可以上传下载,只是控制台会对以"/"结尾的文件以文件夹的方式展示，所以用户可以使用上述方式来实现创建模拟文件夹。


# 30、

以下针对ECS地域和可用区的描述不正确的是哪一个？A

A、同账号下,同一地域不同可用区的ECS实例内网不能互通 B、若购买的ECS需要和阿里其他服务搭配使用,建议选择相同地域

C、一个地域拥有多个可用区 D、在购买了ECS实例后,地域不可改

# 31、

下列关于ECS磁盘的说法错误的是？B

A、相对云磁盘,本地磁盘则吞吐性能更好  B、云磁盘的数据安全性比本地磁盘低   

C、本地SSD盘比云磁盘数据安全性能低   D、本地SSD盘比云磁盘和本地磁盘的IO性能提升


# 32、

除了通过PUT Object接口上传文件到OSS以外,OSS还提供了另外一种上传模式是？C

A、Get Object B、Put Bucket C、Multipart Upload D、Head Object

# 33、

云盾反欺诈服务可以对哪类应用的风险进行防控？B

A、WEB应用   B、WEB应用和移动APP   C、后台数据分析   D、移动APP

# 34、

下面哪一项不是安骑士包含的功能？D

A、木马文件检查  B、异地登录报警  C、高危漏洞修复  D、防WEB应用系统密码破解

为了给您提供登录审计、疑似帐号提醒、暴力破解拦截功能，Agent会定期上传您的本地帐号信息（用户名、用户权限、是否为隐藏或疑似帐号）和登录日志信息（登录名、登录IP），若发生异地登录事件或被暴力破解成功事件将会给您发送安全告警通知。

# 35、

ESS产品,对于所有地域和所有伸缩组,一个用户最多能弹性伸缩多少台ECS实例？ D

A、150台   B、50台  C、100台  D、200台

# 36、

在新建的Linux ECS 实例中,启动 OFBiz 服务的时候,步骤如下：

a. # chmod +x ant；

b. # cd ofbiz-release12.04；

c. # ./ant run； # ./ant start & ；

d. # ./ant；# ./ant run-install。          

则下列排序正确的是？ C

 A、a；c；b；d   B、a；b；c；d    C、b；a；d；c    D、b；c；d；a

# 37、

阿里云CDN单节点带宽处理能力是多少？ A

A、40G B、30G C、10G D、20G

https://help.aliyun.com/document_detail/27103.html?spm=a2c4g.11186623.6.544.48fd6cf2T59mmW

阿里云CDN节点带宽没有限制，目前单节点的**服务能力是40G**，总处理能力为120T+。

# 38、

中国大陆范围内网站都需要做ICP备案,在架构设计时应该告诉客户提前多少就需要准备提交备案？D

A、网站上线前一天 B、网站上线当天 C、网站上线前一周 D、网站上线前一个月

https://beian.aliyun.com/  

https://help.aliyun.com/knowledge_detail/36914.html?spm=5176.8087400.600753.4.379a15c9bCRjMZ

各网站在工信部备案成功后，需在网站开通之日起30日内到公司实际经营地或个人常住地公安机关履行公安备案手续

# 39、

ESS伸缩规则指的是B

A、定义了SLB的监听规则   B、定义了具体的扩展或收缩操作   

C、定义了组内ECS实例数的最大值、最小值   D、定义了用于弹性伸缩的ECS实例的配置信息

https://help.aliyun.com/document_detail/25893.html?spm=5176.10695662.1996646101.searchclickresult.19c45ba5zxFzmP

https://help.aliyun.com/document_detail/25890.html?spm=a2c4g.11186623.4.3.373a4670ll3CgF


# 40、

下列哪个阿里提供的操作系统是自带图形化界面的？A

A、windows server2008   B、OpenSUSE   C、Ubuntu   D、CentOS


windows server 是自带图形化界面的

# 41、以下对ECS的带宽临时升级操作的描述错误的是哪一个？D/B

A、支持在当前生命周期内,设定时间段区间内临时增加带宽 B、可以多次叠加操作,支持随时操作,不受任何操作影响 

C、可以按天进行升级,升级后如云服务器ECS续费,仍然按照原基础带宽进行续费 D、不支持按天升级,升级之后按升级之后的带宽进行续费

https://help.aliyun.com/document_detail/50467.html?spm=5176.10695662.1996646101.searchclickresult.2ea75cdb6bdOUA


这题应该选择D，肯定是支持按天升级的。

# 42、

专有网络可以与什么产品结合使用实现与传统数据中心组成一个按需定制的网络环境,实现应用的平滑迁移上云？ B

A、SLB   B、VPN   C、ECS   D、OCS


按需定制的网络环境：VPN


# 43、

在管理控制台,对阿里云CDN加速域名进行“停用”或“删除”前,需要做什么操作,以确保网站可以正常访问？   D

A、保证源站服务器的带宽充足就够了 B、不需要做什么 C、保证源站服务器正常开启即可 D、到该域名所在的域名解析服务商处恢复域名A记录

https://help.aliyun.com/document_detail/27267.html

A (Address) 记录是用来指定主机名（或域名）对应的IP地址记录；

CNAME记录，即：别名记录。这种记录允许您将多个名字映射到同一台计算机。通常用于同时提供WWW和MAIL服务的计算机。 

将自己的域名CNAME修改成自己的A记录地址，指向到自己的源站，再在控制台停止CDN服务。

“停用”该加速域名后，该条加速域名信息仍保留，针对加速域名的请求系统将做自动回源处理

“删除”该加速域名后，将删除该加速域名的全部相关记录，对于仅需要暂停使用该加速域名，推荐选择“停用”方式在控制台上“删除”某加速域名，需要保证该加速域名已处于“停用”状态

注意：强烈推荐用户在“停用”或者“删除”某加速域名前，到该域名所在的域名解析服务商处恢复域名A记录，保证用户站点可正常访问

https://yq.aliyun.com/ask/59575?spm=5176.10695662.1996646101.searchclickresult.315c2e0c2O5Zxa


# 44、

在OSS API中通过哪个参数的操作可以实现设置object头？  D

A、Multipart Upload   B、Get Object   C、Get Bucket   D、Copy Object

https://help.aliyun.com/document_detail/31979.html 

可以通过拷贝操作来实现修改已有Object的meta信息。

# 45、

为了防止因本地IP对阿里云服务器频繁访问而被屏蔽的情况,可以通过云盾的什么功能进行设置？ A

A、IP白名单   B、webshell云查杀   C、安全网络   D、常用登录地管理

https://help.aliyun.com/knowledge_detail/37914.html


# 46、

渗透测试是通过模拟什么的攻击方法,来评估计算机网络系统安全的一种评估方法？ C

A、网络专家   B、高并发客户   C、恶意黑客   D、正常客户

# 47、

在SLB中的证书管理服务,证书无需上传到后端的什么云产品中？ C

 A、RDS   B、OSS   C、ECS   D、OCS

https://help.aliyun.com/document_detail/27661.html

## 证书需要上传到后端ECS吗？

不需要，负载均衡 HTTPS 提供证书管理系统管理和存储用户证书，证书不需要上传到后端ECS，用户上传到证书管理系统的私钥都会加密存储

# 48、

有很多10或100开头的IP在频繁访问我SLB的后端ECS实例,而安全检查没有报告问题,可能的原因是？ C

A、ECS服务器故障  B、正在遭受网络攻击  C、SLB系统的健康检查和可用性监控  D、真实用户的访问

https://help.aliyun.com/document_detail/55477.html?spm=5176.10695662.1996646101.searchclickresult.34eb3913NPpMKs


# 49、

关于弹性IP说法错误的是   B

A、可以单独购买一个弹性公网IP,而不是与其他计算资源或存储资源绑定购买  B、弹性公网IP支持绑在经典网络的ECS实例上 

C、弹性公网IP能动态绑定到不同的ECS实例上,绑定和解绑时无需停机  D、弹性公网IP只能绑定在相同Region的VPC类型的云产品实例上

https://help.aliyun.com/knowledge_detail/38753.html

# 50、

下列关于ECS实例快照说法错误的是？ CD

A、可以在全部快照列表和本实例快照列表中看到每个快照的具体创建时间  B、用户只能选择系统盘或者数据盘进行快照  

C、用户没有执行任何设置,也会启动 3+1自动快照模式  D、用户不能手动删除自动快照

https://help.aliyun.com/knowledge_detail/40552.html

# 参考资料

[DDos 防護](https://help.aliyun.com/product/28396.html?spm=a2c4g.750001.list.196.74f67b13eaOf4q)

* any list
{:toc}