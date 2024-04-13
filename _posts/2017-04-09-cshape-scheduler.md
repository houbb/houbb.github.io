---
layout: post
title:  Scheduler .Net
date:  2017-04-09 21:44:46 +0800
categories: [C#]
tags: [cshape, cshape, lang, .net, dotnet]
published: true
---


# 任务调度系统

> [LTS](https://houbb.github.io/2016/10/22/LTS)

> [.net 分布式架构之任务调度平台](http://www.cnblogs.com/chejiangyi/p/4934991.html)

# .NET 分布式架构之任务调度平台 

用于.net dll,exe的任务的挂载，任务的隔离，调度执行，访问权限控制，监控，管理，日志，错误预警，性能分析等。

1) 平台基于quartz.net进行任务调度功能开发，采用C#代码编写, 支持corn表达式和第三方自定义的corn表达式扩展。

2) 架构以插件形式开发，具有良好的功能扩展性，稳定性，简单性，便于第三方开发人员进一步进行功能扩展。

3) 支持多节点集群，便于集群服务器的资源有效分配，任务的相互隔离。

4) 支持邮件形式的错误预警，便于运维及时处理任务异常等。


- Download

[Download](http://git.oschina.net/chejiangyi/Dyd.BaseService.TaskManager) 

- Compile

编译失败，原因可能如下：

git下载源码后部分开发人员无法编译的问题（挺诡异的问题）,可以按照以下两种方式尝试解决:
1）改成.net 4.5 framework 再试试。
2）直接下载BSF源码进行编译

至于BSF源码请点[这里](http://git.oschina.net/chejiangyi/XXF)，编译之后将 `BSF.DLL` 替换掉 **引用** 原来的文件即可。

# 简单使用

安装说明参见 **安装文档**、**文档**。

一、执行数据库安装脚本，安装数据库；

- 执行数据库数据初始化脚本。

本地创建 `dyd_bs_task` 数据库(SQL Server)。然后执行**安装文档**中脚本即可。 
  
二、部署web站点,并配置好 web.config 

- 数据库配置连接

- 管理员账号密码（不要删除admin用户,admin的密码可以改）

以上两点在**TaskManager.Web**子项目下，修改 `web.config` 中此处内容

```
<appSettings>
    ...
    <!--任务调度数据库连接字符串-->
    <add key="TaskConnectString" value="server=localhost;Initial Catalog=dyd_bs_task;User ID=sa;Password=******;"/>
    <!--登陆用户 用户名密码,分隔多个用户 必须;开头;结尾
    格式:用户工号,密码;
    备注:这里的用户名就是后台数据库的用户工号
    -->
    <add key="LoginUser" value=";admin,123;che,123;"/>
  </appSettings>
```
  
三、打开web站点,新建服务节点 

- 默认数据库初始化脚本会初始化一个测试用的node节点，有其他需要可以自己再建一个。

启动项目:【TaskManager.Web】设置为启动项目，【Views】文件夹右键浏览器打开。默认为**admin/123**登录即可。

<label class="label label-danger">ERROR</label>

可能会出现提示: ASP.NET 状态服务不可用之类信息。

解决方式: 【计算机】右键->【管理】->【服务】->【ASP.NET 状态服务】开启即可。为了方便，可以设置为自动。


![hello](https://raw.githubusercontent.com/houbb/resource/master/img/schedular/dotnet/2017-04-19-Scheduler-nodes.png)
  
(默认数据库初始化的时候已经有一NODE了。暂时可以不设置。)

四、部署node winserver服务，并配置好config文件

部署服务节点（建议使用 单机多个节点安装.bat，建议部署两个以上节点）

- 新建 node

比如我们在上一步新建一个NODE——测试节点2。比较重要的是，记住其【ID为2】。初始状态应该是停止。

接下来要做的就是让其运行。

- 配置 `App.config`

在子项目【TaskManager.WinService】中打开文件 `App.config`，如下：

TaskManagerWebUrl 对应上面【TaskManager.Web】项目运行的IP:port。

NodeID 就是新建 node 时需要记住的ID。当然你可以指定任意一个已有的nodeId。

```
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <appSettings>
    <!--任务调度网站站点url-->
    <add key="TaskManagerWebUrl" value="http://localhost:6948"/>
    <!--当前节点id 与管理站点的id号对应-->
    <!--和管理界面任务的ID对应-->
    <add key="NodeID" value="2"/> 
  </appSettings>
    <startup> 
        <supportedRuntime version="v4.0" sku=".NETFramework,Version=v4.0"/>
    </startup>
</configuration>
```

- 编译 

接下来需要编译【TaskManager.WinService】。需要生成对应的EXE文件。

(如果没有将项目右键-》【属性】-》【输出类型】设置为【windows应用程序】，后面不再重复)

- 安装运行

我直接尝试了作者说的bat文件，但是没有成功。(也可能是权限问题，没有细究。PS：需要将bat中的路径修改为【TaskManager.WinService】生成exe路径)

我们需要借助一个软件。使用时，请使用**管理员**身份运行，否则可能出错如下：安装失败，已执行回滚。

软件下载[这里]({{ site.url }}/static/download/dotnet/WSWinForm.rar)

软件使用起来很简单，浏览找到【TaskManager.WinService】生成exe路径。安装、运行即可。

如果你发现，你指定的NODE在网页上变为**运行**，说明成功了。

五、测试

此处使用子项目【TaskManager.Demo】进行测试。

web页面上【任务管理】->【任务列表】新建任务如下：

![new task](https://raw.githubusercontent.com/houbb/resource/master/img/scheduler/dotnet/2017-04-19-Scheduler-task.png)

注意：

1. 节点需要选择一个**运行**状态的节点。

2. 任务入口类的命名空间对应`命名空间.类名`；任务入口dll文件名为对应的`编译后的EXE`；上传文件为`编译后debug/release下所有的文件的压缩文件`，不包括**zh-Hans**。



六、 系统级任务

打开web站点,发布两个系统级任务(错误邮件发送的任务和长时间运行的任务检测任务) 

【TaskManager.MonitorTasks】这个项目。和上面测试的新建方法是一样的。此版本包含长时间运行任务预警、异常发送邮件2个功能。
  
若成功大概界面如下：


![task list](https://raw.githubusercontent.com/houbb/resource/master/img/scheduler/dotnet/2017-04-19-Scheduler-task-list.png)

  
七、 安装redis。（redis做即时通知使用，如果没有redis，进行任务开启，卸载等操作时界面反应速度较慢,【系统必须】Redis内部实时通讯专用,密码为空）

  6.1 安装redis。（可以是windows版本的安装包，建议不设置用户名密码。）
  6.2 “配置管理”中配置“RedisServer”。如"192.168.1.209:6379"
  
  这个暂未测试。



# 项目企划草案


一、从LTS学习

> [LTS DOC](https://qq254963746.gitbooks.io/lts/content/introduce/architecture.html)

## 任务支持

- 实时任务：提交了之后立即就要执行的任务。

- 定时任务：在指定时间点执行的任务，譬如 今天3点执行（单次）。

- Cron任务：CronExpression，和quartz类似（但是不是使用quartz实现的）譬如 0 0/1 * ?

- Repeat任务：譬如每隔5分钟执行一次，重复50次就停止。


前三种是很有必要的。


## 架构设计

架构设计上，LTS框架中包含以下五种类型的节点：

- JobClient :主要负责提交任务, 并接收任务执行反馈结果。

- JobTracker :负责任务调度，接收并分配任务。

- TaskTracker :负责执行任务，执行完反馈给JobTracker。

- LTS-Monitor :主要负责收集各个节点的监控信息，包括任务监控信息，节点JVM监控信息

- LTS-Admin :管理后台）主要负责节点管理，任务队列管理，监控管理等。

LTS的这五种节点都是无状态的，都可以部署多个，动态扩容，来实现负载均衡，实现更大的负载量, 并且框架采用FailStore策略使LTS具有很好的容错能力。

这个可以简化。


## 执行结果


LTS框架提供四种执行结果支持，EXECUTE_SUCCESS，EXECUTE_FAILED，EXECUTE_LATER，EXECUTE_EXCEPTION，并对每种结果采取相应的处理机制，譬如重试。

- EXECUTE_SUCCESS: 执行成功,这种情况，直接反馈客户端（如果任务被设置了要反馈给客户端）。

- EXECUTE_FAILED：执行失败，这种情况，直接反馈给客户端，不进行重试。

- EXECUTE_LATER：稍后执行（需要重试），这种情况，不反馈客户端，重试策略采用30s的策略，默认最大重试次数为10次，用户可以通过参数设置修改这些参数。

- EXECUTE_EXCEPTION：执行异常, 这中情况也会重试(重试策略，同上)


可根据自己需要细化。


## 优秀点

- 动态扩容和容错重试。

- 故障转移









