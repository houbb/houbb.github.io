---
layout: post
title:  Oracle Learn-01-Query
date:  2018-04-22 19:00:57 +0800
categories: [SQL]
tags: [sql, oracle, learn]
published: true
---


# Oracle 安装

学习 oracle 之前，是对应服务的安装。不是本文的重点。

- Docker 安装

[Oracle Docker 安装](https://houbb.github.io/2018/04/21/docker-install-oracle)

# Oracle 版本信息

- 脚本

```sql
select * from v$version;
```

- 结果

```
BANNER
--------------------------------------------------------------------------------
Oracle Database 11g Express Edition Release 11.2.0.2.0 - 64bit Production
PL/SQL Release 11.2.0.2.0 - Production
CORE	11.2.0.2.0	Production
TNS for Linux: Version 11.2.0.2.0 - Production
NLSRTL Version 11.2.0.2.0 - Production
```

- 版本号说明

| 位置 | 名称 | 说明|
|:----|:----|:----|
| 1 | Major Database Release Number | 它代表的是一个新版本软件，也标志着一些新的功能。如11g，10g |
| 2 | Database Maintenance Release Number | 代表一个maintenance release 级别，也可能包含一些新的特性 |
| 3 | Fusion Middleware Release Number | 反应Oracle 中间件（Oracle Fusion Middleware）的版本号 |
| 4 | Component-Specific Release Number | 主要是针对组件的发布级别。不同的组件具有不同的号码。 比如Oracle 的patch包 |
| 5 | Platform-Specific Release Number | 这个数字位标识一个平台的版本。 通常表示patch 号 |


# Oracle 数据库名称

- 脚本

```sql
select name from v$database;
```

- 结果

```
NAME
---------
XE
```

# Oracle 所有表信息

- 脚本

```sql
select * from all_tables;
```

# Oracle 表结构

- 脚本

```sql
desc ${table_name};
```

# Oracle 数据库切换

```sql
database ${database_name};
```


# windows 19c 安装

全局数据库名：orcl

设置口令，8个字符以上，包含数字和字母。

取消勾选 【创建为容器库】

ps: Aliyun 如果可以引入这个服务就好了。

## 配置

Oracle19c不用再额外的安装客户端，刚才解压的文件中已经自带了，然后我们需要做一些配置：

点击【菜单】–> Oracle OraDB19Home1 --> Net Manager 或者

在我的电脑中打开：C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Oracle - OraDB19Home1\配置和移植工具\ Net Manager（ProgramData文件在隐藏的项目中，勾选上才能看到）

### 创建服务：

点击【本地】->【服务命名】，点击左上角绿色的 +

1) 网络服务名自己起，这个没什么要求，下一步

比如：myOracle

2) 选择 TCP/IP 协议。

3) 主机名只能填 localhost 或者 127.0.0.1

端口号默认为 1521

，下一步

4） 【服务名】:orcl，下一步


5） 进行连接测试


```
初始化首次测试请使用用户名: scott, 口令: tiger
正在尝试使用以下用户 ID 连接:scott
测试没有成功。
ORA-01017: 用户名/口令无效; 登录被拒绝

在输入的字段中可能有错误, 
或者服务器连接未就绪。 
```
6) 更改登录，改成 system 用户，口令是当初设置的那个，点击确定，进行测试

日志：

```
正在尝试使用以下用户 ID 连接:system
连接测试成功。
```

7) 7.最后别忘了保存！！！💢（关闭窗口时会提醒你）

## 登录验证

至此，Oracle数据库的基本安装配置操作全部完成了，我们可以在SQL Plus里验证以下

点击【菜单】–> Oracle OraDB19Home1 --> SQL Plus 或者

在我的电脑中打开：C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Oracle - OraDB19Home1\应用程序开发\SQL Plus




# 参考资料

https://blog.csdn.net/qq_33593667/article/details/130494033

* any list
{:toc}









 





