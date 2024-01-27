---
layout: post
title: database mysql install on windows10 WSL
date: 2024-01-05 21:01:55 +0800
categories: [Database]
tags: [database, mysql sh]
published: true
---

# 背景

希望在 windows10 的 WSL 中安装 mysql。

推荐使用root用户，或者在每条命令前面加上sudo

# 安装

## 1.1-寻找 mysql

搜索MySQL： 


```bash
sudo apt update
sudo apt search mysql-server
```

如下：

```
dh@d:~$ apt search mysql-server
Sorting... Done
Full Text Search... Done
default-mysql-server/jammy 1.0.8 all
  MySQL database server binaries and system database setup (metapackage)

default-mysql-server-core/jammy 1.0.8 all
  MySQL database server binaries (metapackage)

mysql-server/jammy-updates,jammy-security 8.0.35-0ubuntu0.22.04.1 all
  MySQL database server (metapackage depending on the latest version)

mysql-server-8.0/jammy-updates,jammy-security 8.0.35-0ubuntu0.22.04.1 amd64
  MySQL database server binaries and system database setup

mysql-server-core-8.0/jammy-updates,jammy-security 8.0.35-0ubuntu0.22.04.1 amd64
  MySQL database server binaries
```

我们选择安装这一个版本

```
mysql-server/jammy-updates,jammy-security 8.0.35-0ubuntu0.22.04.1 all
  MySQL database server (metapackage depending on the latest version)
```

## 1.2-指定版本

```bash
sudo apt install mysql-server
```

## 1.3-安装完成后登录

```
mysql -uroot -p
```

5.7 默认密码应该是空，但是 8.0 需要密码，通过下面方式查看

```bash
sudo cat /etc/mysql/debian.cnf
```

```cnf
dh@d:~$ sudo cat /etc/mysql/debian.cnf
# Automatically generated for Debian scripts. DO NOT TOUCH!
[client]
host     = localhost
user     = debian-sys-maint
password = 4qqwwJNFI7mzyIsZ
socket   = /var/run/mysqld/mysqld.sock
[mysql_upgrade]
host     = localhost
user     = debian-sys-maint
password = 4qqwwJNFI7mzyIsZ
socket   = /var/run/mysqld/mysqld.sock
```

我们通过这个账户密码登录：debian-sys-maint/4qqwwJNFI7mzyIsZ

```bash
mysql -udebian-sys-maint -p
```

成功效果：

```
dh@d:~$ mysql -udebian-sys-maint -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 12
Server version: 8.0.35-0ubuntu0.22.04.1 (Ubuntu)

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```


# 修改配置

## 配置文件修改

首先需要改变MySQL的配置,执行


```bash
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf
```

将找到 bind-address = 127.0.0.1 并注释掉 → # bind-address = 127.0.0.1 （如下图）

把下面 2 行都注释掉：

```ini
# Instead of skip-networking the default is now to listen only on
# localhost which is more compatible and is not less secure.
#bind-address           = 127.0.0.1
#mysqlx-bind-address    = 127.0.0.1
```

同时把端口从 3306 改为 13306

```ini
[mysqld]
#
# * Basic Settings
#
user            = mysql
# pid-file      = /var/run/mysqld/mysqld.pid
# socket        = /var/run/mysqld/mysqld.sock
port            = 13306
# datadir       = /var/lib/mysql


# If MySQL is running as a replication slave, this should be
# changed. Ref https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_tmpdir
# tmpdir                = /tmp
#
# Instead of skip-networking the default is now to listen only on
# localhost which is more compatible and is not less secure.
#bind-address           = 127.0.0.1
#mysqlx-bind-address    = 127.0.0.1
#
# * Fine Tuning
#
key_buffer_size         = 16M
# max_allowed_packet    = 64M
# thread_stack          = 256K
```

### 如果你想 Binlog

`[mysqld]` 下面添加如下内容：s

```ini
# Enable binary replication log and set the prefix, expiration, and log format.
# The prefix is arbitrary, expiration can be short for integration tests but would
# be longer on a production system. Row-level info is required for ingest to work.
# Server ID is required, but this will vary on production systems
server-id         = 223344
log_bin           = mysql-bin
expire_logs_days  = 10
binlog_format     = row
binlog_row_image  = FULL

# enable gtid mode
gtid_mode = on
enforce_gtid_consistency = on
```

启动后确认 mysql 结果如下则说明成功：

```
mysql> show variables where variable_name in ('log_bin', 'binlog_format', 'binlog_row_image', 'gtid_mode', 'enforce_gtid_consistency');
+--------------------------+-------+
| Variable_name            | Value |
+--------------------------+-------+
| binlog_format            | ROW   |
| binlog_row_image         | FULL  |
| enforce_gtid_consistency | ON    |
| gtid_mode                | ON    |
| log_bin                  | ON    |
+--------------------------+-------+
```

> [mysql binlog windows10 环境的开启和解析笔记](https://houbb.github.io/2021/08/29/mysql-binlog)

### 重启服务

```bash
sudo service mysql restart
```

## 查看机器配置

```
dh@d:~$ ifconfig
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.24.20.97  netmask 255.255.240.0  broadcast 172.24.31.255
        inet6 fe80::215:5dff:fe3a:8c5c  prefixlen 64  scopeid 0x20<link>
        ether 00:15:5d:3a:8c:5c  txqueuelen 1000  (Ethernet)
        RX packets 198295  bytes 482781640 (482.7 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 146606  bytes 10747478 (10.7 MB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 335  bytes 35633 (35.6 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 335  bytes 35633 (35.6 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

对应的 ip 为 `172.24.20.97`

# 创建 newroot 账户

在 MySQL 中，要创建一个新的用户（例如 root），设置密码并初始化所有权限，您可以使用以下步骤：

1. **登录到 MySQL：**

    ```bash
    mysql -u root -p
    ```

    输入您当前的 root 用户密码。

2. **创建新用户：**

    在 MySQL 提示符下，运行以下 SQL 命令以创建新用户（假设您要创建一个名为 `newroot` 的用户）：

    ```sql
    CREATE USER 'newroot'@'localhost' IDENTIFIED BY '123456';
    ```

    这将创建一个名为 `newroot` 的用户，限定其只能从本地主机登录，并设置密码为 '123456'。

3. **授予权限：**

    为了给新用户赋予所有权限，可以使用以下 SQL 命令：

    ```sql
    GRANT ALL PRIVILEGES ON *.* TO 'newroot'@'localhost' WITH GRANT OPTION;
    ```

    这将为用户 `newroot` 赋予所有数据库和表的权限，并允许他授予权限给其他用户。

4. **刷新权限：**

    在修改权限后，需要刷新 MySQL 的权限缓存：

    ```sql
    FLUSH PRIVILEGES;
    ```

    这会使新的权限立即生效。

5. **退出 MySQL：**

    ```sql
    exit;
    ```

    退出 MySQL 提示符。

现在，您已经创建了一个名为 `newroot` 的用户，密码为 '123456'，并且该用户拥有所有数据库和表的权限。

6.  **登录验证：**

```
mysql -unewroot -p
```

可以正常登录即可。

# 创建一个支持远程访问的用户

newroot/123456 登录上去：

```
mysql -unewroot -p
```

执行：

```sql
CREATE USER 'admin'@'%' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;
flush privileges;
```

新增远程访问用户和用户密码 admin/123456

测试：

```
msql -uadmin -p
```

登录验证。

# 远程访问实际测试

## 简单的 user_info

```sql
create database test_source;
use test_source;

drop table if exists user_info;
create table user_info
(
    id int unsigned auto_increment comment '主键' primary key,
    username varchar(128) not null comment '用户名',
    create_time timestamp default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
) comment '用户信息表' ENGINE=Innodb default charset=utf8mb4 auto_increment=1;
```

初始化数据

```sql
insert into user_info (username) values ('u1');
insert into user_info (username) values ('u2');
insert into user_info (username) values ('u3');
insert into user_info (username) values ('u4');
insert into user_info (username) values ('u5');
```

## admin 账户初始化测试表

```sql
create database migrate;
use migrate;

drop table if exists lc_enum_mapping;
create table lc_enum_mapping
(
    id int unsigned auto_increment comment '主键' primary key,
    table_name varchar(128) not null comment '表名称',
    column_name varchar(128) not null comment '字段名称',
    `key` varchar(128) not null comment '字段编码',
    label varchar(256) not null comment '字段显示',
    create_time timestamp default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
) comment '枚举映射表' ENGINE=Innodb default charset=utf8mb4 auto_increment=1;
create unique index ix_lc_enum_mapping on lc_enum_mapping (table_name, column_name, `key`) comment '标识索引';

drop table if exists lc_enum_mapping_temp;
create table lc_enum_mapping_temp
(
    id int unsigned auto_increment comment '主键' primary key,
    table_name varchar(128) not null comment '表名称',
    column_name varchar(128) not null comment '字段名称',
    `key` varchar(128) not null comment '字段编码',
    label varchar(256) not null comment '字段显示',
    create_time timestamp default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
) comment '枚举映射表' ENGINE=Innodb default charset=utf8mb4 auto_increment=1;
create unique index ix_lc_enum_mapping on lc_enum_mapping_temp (table_name, column_name, `key`) comment '标识索引';

-- select count(*) from lc_enum_mapping_temp;
-- select count(*) from lc_enum_mapping;
```

## 查看 WSL 对应的 ip

WSL 中使用 ifconfig，查看对应的 ip 为 `172.24.20.97`

## 访问配置

```java
List<MysqlToNeo4jResult> list =  MysqlToNeo4jBs.newInstance()
                .username("admin")
                .password("123456")
                .url("jdbc:mysql://172.24.20.97:13306/migrate?useSSL=false&serverTimezone=Asia/Shanghai")
                .init()
                .execute();

System.out.println(JSON.toJSON(list));
```

是可以测试成功的。

# 参考资料

[windows连接WSL-ubuntu里安装的MySQL，附安装教程](https://blog.csdn.net/sexyluna/article/details/105007828)

https://blog.csdn.net/sexyluna/article/details/105007828

https://blog.csdn.net/weixin_42946900/article/details/107300863

* any list
{:toc}