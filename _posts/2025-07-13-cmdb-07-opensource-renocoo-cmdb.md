---
layout: post
title: cmdb-07-开源项目 roncoo/roncoo-cmdb
date: 2025-7-13 14:12:33 +0800
categories: [CMDB]
tags: [cmdb, sh]
published: true
---


# roncoo-cmdb

龙果学院推出开源运维平台，目前版本实现：权限控制，CMDB,cobbler装机平台，zabbix管理平台，机柜展示，图像展示，故障申报<br />
后期会持续推出发布平台，批量管理平台、希望跟大家交流学习、表结构也有更新，大家重新下载然后创建表结构
功能说明：非常感谢51reboot几位老师的指导，www.51reboot.com

相关视频地址：http://www.roncoo.com/course/view/a2d58fe08172447696412fb7af1de620

  一、装机平台：基于cobbler来做二次开发.


    平台指定安装操作系统版本镜像，安装的分区规划。当然定制ks文件这一块可以随机修改。

     通过厂商MAC地址，指定IP,MAC,网关等，通过管理平台指定IP和系统版本之后，机房相关人员插上网线开机即可安装。

     记录操作数据。


  二、用户权限管理：


       可以对用户进行管理，对用户增删改查修改密码等。

     用户权限管理，比如监控组有zabbix操作权限，故障申报所有人都有权限，故障下架处理由管理员执行


  三、CMDB管理：


       机房，机柜的相关管理增删改查，这一块只有admin用户可以查看和修改。

     脚本采集系统硬件数据，通过API方式提交和人工录入的半自动方式。

     数据收集参数和删除。


  四、zabbix管理：<br />


     通过CMDB平台联动到zabbix数据库。

     实现对zabbix主机的批量模板绑定、删除；基本上已经完成zabbix管理工作。

     主机出现问题，或者维护数据时候添加维护周期。

     调用zabbix图形在运维平台展示
     
  五、系统保障处理:<br />
     工程师把处理的故障上报平台，管理员，项目经理知悉；并且异步发送邮件到管理员有些，管理员给出操作指示，下架等操作
     
  
  六、机柜机房拓扑展示：<br />
      根据录入的主机机房，机柜信息，进行拓扑展示。告警结合zabbix API动态展示机器状态
  

# 参考资料

https://github.com/roncoo/roncoo-cmdb/blob/master/README.md

* any list
{:toc}