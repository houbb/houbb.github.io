---
layout: post
title:  Oracle 系统学习-06-oracle windows install oracle windows 安装 oracle
date:  2018-06-20 10:46:06 +0800
categories: [Oracle]
tags: [oracle, windows, install]
published: true
---

# windows 下如何安装 oracle

要在Windows上安装Oracle数据库，您可以按照以下步骤进行操作：

1. 下载Oracle数据库软件：
   访问Oracle官方网站（https://www.oracle.com/database/technologies/）并下载适用于Windows平台的Oracle数据库软件。选择与您的操作系统版本和位数相匹配的软件。

2. 运行安装程序：
   打开下载的安装程序，并运行它。根据提示选择安装类型，通常选择“Custom”（自定义）以便可以选择安装位置和组件。

3. 设置安装选项：
   在安装向导中，您需要提供一些配置信息，包括安装路径、数据库类型和密码等。请按照向导的指示进行操作。确保记住您设置的数据库密码，因为它将在以后访问数据库时使用。

4. 进行安装：
   点击“Install”（安装）按钮开始安装过程。这可能需要一段时间，具体取决于您的系统性能和所选的组件。

5. 完成安装：
   安装完成后，您将看到安装向导的“Finish”（完成）页面。选中“Create Database”（创建数据库）复选框，然后点击“Finish”（完成）按钮。

6. 配置数据库：
   在“Database Configuration Assistant”（数据库配置助手）中，选择“Create a Database”（创建数据库）选项，并按照向导的指示提供数据库的名称、管理密码和其他配置信息。

7. 启动数据库：
   在安装完成后，您可以在开始菜单中找到Oracle文件夹，并启动“Oracle Database”应用程序。这将启动Oracle数据库实例。

这些步骤仅适用于Oracle数据库的基本安装。如果您需要更详细的配置或特定的设置，建议参考Oracle的官方文档或寻求专业支持。

# windows10 实战笔记

## 下载

[https://download.oracle.com/otn/nt/oracle19c/193000/WINDOWS.X64_193000_db_home.zip](https://download.oracle.com/otn/nt/oracle19c/193000/WINDOWS.X64_193000_db_home.zip)

注意：文件略大，可以放在D盘，注意路径中不能有空格或者中文字符之类的。

or: https://www.oracle.com/rs/database/technologies/oracle19c-windows-downloads.html


## install

关闭所有的杀毒类软件，电脑管家

解压之前的安装包，以管理员身份运行目录下 `D:\tool\oracle\WINDOWS.X64_193000_db_home` 的 setup.exe

1） 选择：创建并配置单实例数据库，然后“下一步”：

![创建并配置单实例数据库](https://img-blog.csdnimg.cn/2c87c2f5c3cd4623a2263dd256ed02e6.png)

2) 选择：桌面类，然后“下一步”：

![桌面类](https://img-blog.csdnimg.cn/daadbfd954e54b34b206538c4a296de8.png)

3) 选择：创建新Windows用户，用户名英文，同时注意口令设置（统一为 Sa23456），尽量包含大小写字母和数字（选择使用Windows内置帐户也可，推荐），选择下一步

![创建](https://img-blog.csdnimg.cn/e1f75a21281e46cea4237316ae1a165c.png)

```
username: oracle
password: Sa23456
```

4) 目录

Oracle基目录选择一个好找的目录，推荐为 `D:\tool\oracle`（自行新建），简单纯英文，无空格

**记住全局数据库名orcl，然后设置口令Sa23456**

“创建为容器数据库”点掉，不要勾选

```
oracle 基本目录：D:\tool\oracle
oracle 数据目录：D:\tool\oracle\oradata
```

![目录](https://img-blog.csdnimg.cn/10bd9763ca7c45fd9482a9c4577a43a3.png)

5) 等待安装

弹出配置检查界面，一般没啥问题，点击“安装”：

![install](https://img-blog.csdnimg.cn/7d28839126c94f91a7517d989a755e7d.png)

![install-2](https://img-blog.csdnimg.cn/c67ea8f91f114d559f68deee663a1fcd.png)

中途可能有防火墙警告，全部允许

在安装过程中，可能会遇到，卡在42%不动的情况，这个一般不要惊慌，等一会儿自动就装好了。

![42%](https://img-blog.csdnimg.cn/21c31c2033b94809a619be02daa43c27.png)

注意：如果进度卡在42%超过半小时以上，就去看一下重要的应用有没有安装完成，若已经完成，把安装页面关掉就行，初学者使用已经够了。

![installed](https://img-blog.csdnimg.cn/3803a77af269430fa4e8d2453222a163.png)

6) 安装完成后，界面如下：

![done](https://img-blog.csdnimg.cn/1792bdcd2efd42e9aad0db43b7b128c5.png)

## 四、安装后检查

打开cmd，输入SQLPLUS，回车

进入到弹出登录提醒，输入conn as sysdba(注意空格），回车，提示输入密码，sysdba是后门进入，不用密码（如果你喜欢有仪式感，输几个你喜欢的数字也可以，但是系统会隐藏掉🙈），回车。

显示如下即成功🎉🎉🎉

![SQLPLUS](https://img-blog.csdnimg.cn/22d159ca2bbf4be791d7f1113be1b805.png)

# oracle创建一个数据库步骤

以前开发的时候用得比较多的是mysql和sql server，oracle用的比较少，用起来比较生疏，mysql和sql server用起来比较类似，就oracle的使用方式和他们不同，oracle在创建数据库的时候要对应一个用户，数据库和用户一般一一对应，mysql和sql server 直接通过create databse “数据库名” 就可以直接创建数据库了，而oracle创建一个数据库需要以下三个步骤：

1. 创建两个数据库的文件

2. 创建用户与上面创建的文件形成映射关系

3. 给用户添加权限

## 一、创建两个数据库的文件(monitor.dbf 和monitor_temp.dbf 两个文件)

```sql
CREATE TABLESPACE monitor LOGGING DATAFILE 'E:\app\owner\oradata\orcl\monitor.dbf' 
SIZE 100M AUTOEXTEND ON NEXT 32M MAXSIZE 500M EXTENT MANAGEMENT LOCAL; 

create temporary tablespace monitor_temp tempfile 'E:\app\owner\oradata\orcl\monitor_temp.dbf' 
size 100m autoextend on next 32m maxsize 500m extent management local; 
```

## 二、创建用户与上面创建的文件形成映射关系(用户名为monitor,密码为monitor)

代码如下:

```sql
CREATE USER monitor IDENTIFIED BY monitor DEFAULT TABLESPACE monitor TEMPORARY TABLESPACE monitor_temp;
```

## 三、添加权限

```sql
grant connect,resource,dba to monitor; 
grant create session to monitor; 
```

有时候也会用到删除数据库和删除用户的操作，这里也给出删除的语句

## 四、删除数据库

```sql
DROP TABLESPACE monitor INCLUDING CONTENTS AND DATAFILES; 
```

五、删除用户

```sql
DROP TABLESPACE monitor INCLUDING CONTENTS AND DATAFILES; 
```

以上就是oracle创建一个数据库的全部过程，大家可以尝试创建一个数据库，希望可以帮到大家。


# oracle 新建数据库及入门操作

## 1. 新建数据库

cmd 通过 SQLPlus 登录。

```
> sqlplus
> conn as sysdba
```

通过上面两行命令，可以以 admin 登录到 oracle。

如果没有启动服务，还要启动服务：

```
SQL> startup
```

## 2. 执行操作

确定是以管理员身份登录的，然后执行以下操作：

```
1.首先，创建（新）用户：

    create user username identified by password;
    username：新用户名的用户名
    password: 新用户的密码

也可以不创建新用户，而仍然用以前的用户，如：继续利用scott用户

2.创建表空间：

    create tablespace tablespacename datafile 'd:\data.dbf' size xxxm;
    tablespacename：表空间的名字
    d:\data.dbf'：表空间的存储位置
    xxx表空间的大小，m单位为兆(M)

3.将空间分配给用户：

   alter user username default tablespace tablespacename;
   将名字为tablespacename的表空间分配给username 

4.给用户授权：

   grant create session,create table,unlimited tablespace to username;

5.然后再以楼主自己创建的用户登录，登录之后创建表即可。

   conn username/password;
```


实战记录：

1) 创建新用户

```sql
create user root identified by 123456;

create tablespace test datafile 'D:\tool\oracle\oradata\testdata.dbf' size 200m;

alter user root default tablespace test;

grant create session,create table,unlimited tablespace to root;
```

日志如下：

```

SQL> create user root identified by 123456;

用户已创建。

SQL> create tablespace test datafile 'D:\tool\oracle\oradata\testdata.dbf' size 200m;

表空间已创建。

SQL> alert user root default tablespace test;
SP2-0734: 未知的命令开头 "alert user..." - 忽略了剩余的行。
SQL> alter user root default tablespace test;

用户已更改。

SQL> grant create session,create table,unlimited tablespace to root;

授权成功。
```

2) 创建表

首先登录

```sql
conn root/123456;
```

执行建表语句

```sql
create table lc_enum_mapping
(
    ID int,
    TABLE_NAME varchar(128) not null,
    COLUMN_NAME varchar(128) not null,
    "KEY" varchar(128) not null,
    LABEL varchar(256) not null,
    CREATE_TIME date,
    UPDATE_TIME date
);

insert into lc_enum_mapping(id, table_name, column_name, "KEY", label, create_time, update_time) values (1, 'user', 'status', 'Y', '启用', sysdate, sysdate);
insert into lc_enum_mapping(id, table_name, column_name, "KEY", label, create_time, update_time) values (2, 'user', 'status', 'N', '禁用', sysdate, sysdate);
```

查询

```
SQL> select count(*) from lc_enum_mapping;

  COUNT(*)
----------
         2
```

清空

```
SQL> delete from lc_enum_mapping;
```
# 常用命令

## oracle 启动服务命令

```
C:\Users\Jasmine>net start oracleserviceorcl
服务正在启动或停止中，请稍候片刻后再试一次。


C:\Users\Jasmine>sqlplus /nolog

SQL*Plus: Release 11.2.0.1.0 Production on Tue Feb 19 09:26:31 2013
Copyright (c) 1982, 2010, Oracle. All rights reserved.
SQL> conn / as sysdba
Connected.

SQL> startup
ORA-01081: cannot start already-running ORACLE - shut it down first

--现在可以正常试用
SQL> create table test(new varchar2(25));
```

## oracle 启动监听命令

```
C:\Users\Jasmine>lsnrctl start

查看状态用 lsnrctl status
关闭用      lsnrctl stop
```

## 其他特殊查询：

- 查询 sid         

```sql
select instance_name from v$instance;
```

- 查询用户名    

```sql
select username from dba_users;
```

- 查看 Oracle 每个用户下的所有表的 size

```sql
select owner, sum(bytes) from dba_segments where segement_type='TABLE' group by owner;
```

## 5. 常用操作

1. 执行 sql 脚本文件中的 sql 语句

```
sqlplus 
SQL>  @c:\create_sql.sql;
```

2. 表所占用的空间的大小：

```sql
SELECT segment_name AS TABLENAME,BYTES B,BYTES/1024 KB,BYTES/1024/1024 MB FROM user_segments WHERE segment_name='表名';
```

3. 修改用户密码的有效期

```
查看用户的proifle是哪个，一般是default：
sql>SELECT username,PROFILE FROM dba_users;
查看指定概要文件（如default）的密码有效期设置：
sql>SELECT * FROM dba_profiles s WHERE s.profile='DEFAULT' AND resource_name='PASSWORD_LIFE_TIME';
(如果这样写有可能提示“你未选中行”，其实这样就行了
SELECT * FROM dba_profiles WHERE resource_name='PASSWORD_LIFE_TIME';)
将密码有效期由默认的180天修改成“无限制”：
sql>ALTER PROFILE DEFAULT LIMIT PASSWORD_LIFE_TIME UNLIMITED;
```

4. 解锁被锁定的用户

```
--多次密码输入错误后会报错：
--ORA-28000: the account is locked
--此时需要dba权限登录后解锁被锁定的用户，如下：

ALTER USER lyy ACCOUNT UNLOCK;
```

# 查考资料

https://www.php.cn/faq/485887.html

https://blog.csdn.net/liangmengbk/article/details/125690405

https://blog.csdn.net/weixin_57263771/article/details/128269842

[win10 Oracle数据库的安装(不可错过版）](https://blog.csdn.net/weixin_57263771/article/details/128269842)

[oracle创建一个数据库步骤](http://www.codebaoku.com/it-oracle/it-oracle-70850.html)

[oracle 新建数据库及入门操作](https://my.oschina.net/liuyuanyuangogo/blog/315628)

* any list
{:toc}







