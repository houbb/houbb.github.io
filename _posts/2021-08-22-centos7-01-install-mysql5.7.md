---
layout: post
title: CentOS7 安装 mysql 5.7 笔记
date: 2021-08-02 21:01:55 +0800
categories: [System]
tags: [system, mysql, sh]
published: true
---

# 背景

CentOS7 安装 mysql 5.7，记录一下。

官方文档：https://dev.mysql.com/doc/refman/5.7/en/installing.html

命令行安装文档：https://dev.mysql.com/doc/mysql-sles-repo-quick-guide/en/

## 安装方式

Linux上安装软件常见的几种方式：

源码编译

压缩包解压（一般为tar.gz）

编译好的安装包（RPM、DPKG等）

在线安装（YUM、APT等）

以上几种方式便捷性依次增加，但通用性依次下降，比如直接下载压缩包进行解压，这种方式一般需要自己做一些额外的配置工作，但只要掌握了方法，各个平台基本都适用，YUM虽然简单，但是平台受限，网络受限，必要的时候还需要增加一些特定YUM源。

几种安装方式最好都能掌握，原则上能用简单的就用简单的：YUM>RPM>tar.gz>源码

# YUM

## 检查是否已经安装

```
rpm -qa|grep mysql
```

## 删除MySQL

如果不存在（上面检查结果返回空）则跳过步骤

```
rpm -e --nodeps xxx
```

我这里是空，跳过这个步骤。

## 查看系统版本

```
# cat /etc/redhat-release
CentOS Linux release 7.9.2009 (Core)
```

选择对应的版本进行下载，例如CentOS 7当前在官网查看最新Yum源的下载地址为： 

https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm

下载：

```
wget https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm
```


## 安装

```
sudo rpm -Uvh mysql80-community-release-el7-3.noarch.rpm
```

### 查看是否安装成功

执行成功后会在/etc/yum.repos.d/目录下生成两个repo文件mysql-community.repo及 mysql-community-source.repo

并且通过 `yum repolist` 可以看到mysql相关资源 

# 选择 mysql 版本

使用MySQL Yum Repository安装MySQL，默认会选择当前最新的稳定版本，例如通过上面的MySQL源进行安装的话，默安装会选择MySQL 8.0版本，如果就是想要安装该版本，可以直接跳过此步骤，如果不是，比如我这里希望安装MySQL5.7版本，就需要“切换一下版本”：

## 查看版本

查看当前MySQL Yum Repository中所有MySQL版本（每个版本在不同的子仓库中）

```
yum repolist all | grep mysql
```

## 切换版本

```
shell> sudo yum-config-manager --disable mysql80-community
shell> sudo yum-config-manager --enable mysql57-community
```

### 报错

```
sudo: yum-config-manager: command not found
```

通过

```
yum -y install yum-utils 
```

除了使用yum-config-manager之外，还可以直接编辑/etc/yum.repos.d/mysql-community.repo文件

enabled=0禁用

```
[mysql80-community]
name=MySQL 8.0 Community Server
baseurl=http://repo.mysql.com/yum/mysql-8.0-community/el/7/$basearch/
enabled=0
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-mysql
```

enabled=1启用

```
# Enable to use MySQL 5.7
[mysql57-community]
name=MySQL 5.7 Community Server
baseurl=http://repo.mysql.com/yum/mysql-5.7-community/el/7/$basearch/
enabled=1
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-mysql
```



安装

## 检查当前启用的MySQL仓库

```
shell> yum repolist enabled | grep mysql
```

我这里采用 5.7，日志如下：

```
# yum repolist enabled | grep mysql
mysql-connectors-community/x86_64 MySQL Connectors Community                 212
mysql-tools-community/x86_64      MySQL Tools Community                      132
mysql57-community/x86_64          MySQL 5.7 Community Server                 524
```

# 安装MySQL

## 命令

```
sudo yum install mysql-community-server
```

该命令会安装MySQL服务器 (mysql-community-server) 及其所需的依赖、相关组件，包括mysql-community-client、mysql-community-common、mysql-community-libs等

如果带宽不够，这个步骤时间会比较长，请耐心等待~

期间需要用户交互 2 次，不然进度不会向下走。

## 启动MySQL

- 启动

```
sudo systemctl start mysqld.service
```

- 查看状态

```
sudo systemctl status mysqld.service
```

- 停止

```
sudo systemctl stop mysqld.service
```

- 重启

```
sudo systemctl restart mysqld.service
```

# 修改密码

## 初始密码

MySQL第一次启动后会创建超级管理员账号root@localhost，初始密码存储在日志文件中：

```
sudo grep 'temporary password' /var/log/mysqld.log
```

日志：

```
2021-08-22T02:56:03.411041Z 1 [Note] A temporary password is generated for root@localhost: xxxx
```

## 修改默认密码

```
mysql -uroot -p
```

使用临时密码登录。

```
ALTER USER 'root'@'localhost' IDENTIFIED BY '123456';
ERROR 1819 (HY000): Your password does not satisfy the current policy requirements
```

出现上面的提示是因为密码太简单了，解决方法如下：

1. 使用复杂密码，MySQL默认的密码策略是要包含数字、字母及特殊字符；

2. 如果只是测试用，不想用那么复杂的密码，可以修改默认策略，即validate_password_policy（以及validate_password_length等相关参数），使其支持简单密码的设定，具体方法可以自行百度；

3. 修改配置文件/etc/my.cnf，添加validate_password=OFF，保存并重启MySQL

```
mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY '123456';
Query OK, 0 rows affected (0.00 sec)
```

此处不建议这么干，还是使用略微复杂一点的密码。

这一步必须修改，否则无法继续使用。

## 允许root远程访问

```
mysql> GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '123456' WITH GRANT OPTION;
mysql> FLUSH PRIVILEGES;
```

这个可以不开启，根据个人需求而定。

## 设置开机启动

```
systemctl enable mysqld
systemctl daemon-reload
```

## 设置编码

- 查看编码

```
mysql> SHOW VARIABLES WHERE Variable_name LIKE 'character_set_%' OR Variable_name LIKE 'collation%';
```

如下：

```
+--------------------------+----------------------------+
| Variable_name            | Value                      |
+--------------------------+----------------------------+
| character_set_client     | utf8                       |
| character_set_connection | utf8                       |
| character_set_database   | latin1                     |
| character_set_filesystem | binary                     |
| character_set_results    | utf8                       |
| character_set_server     | latin1                     |
| character_set_system     | utf8                       |
| character_sets_dir       | /usr/share/mysql/charsets/ |
| collation_connection     | utf8_general_ci            |
| collation_database       | latin1_swedish_ci          |
| collation_server         | latin1_swedish_ci          |
+--------------------------+----------------------------+
```

- 修改配置文件


编辑 `/etc/my.cnf`，

原始配置为：

```ini
# For advice on how to change settings please see
# http://dev.mysql.com/doc/refman/5.7/en/server-configuration-defaults.html

[mysqld]
#
# Remove leading # and set to the amount of RAM for the most important data
# cache in MySQL. Start at 70% of total RAM for dedicated server, else 10%.
# innodb_buffer_pool_size = 128M
#
# Remove leading # to turn on a very important data integrity option: logging
# changes to the binary log between backups.
# log_bin
#
# Remove leading # to set options mainly useful for reporting servers.
# The server defaults are faster for transactions and fast SELECTs.
# Adjust sizes as needed, experiment to find the optimal values.
# join_buffer_size = 128M
# sort_buffer_size = 2M
# read_rnd_buffer_size = 2M
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock

# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0

log-error=/var/log/mysqld.log
pid-file=/var/run/mysqld/mysqld.pid
```

调整配置如下：

```ini
[mysql]
# 设置mysql客户端默认字符集
default-character-set=utf8mb4
 
[mysqld]
# 原始配置部分
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock
symbolic-links=0
log-error=/var/log/mysqld.log
pid-file=/var/run/mysqld/mysqld.pid

# 设置3306端口
port=3306
# 允许最大连接数
max_connections=20
# 服务端使用的字符集默认为8比特编码的latin1字符集
character-set-server=utf8mb4
# 创建新表时将使用的默认存储引擎
default-storage-engine=INNODB
 
collation-server=utf8mb4_unicode_ci
init_connect='SET NAMES utf8mb4'

character-set-client-handshake=FALSE
explicit_defaults_for_timestamp=true

lower_case_table_names=1

[client]
default-character-set=utf8mb4
```

- 重启 mysql 服务

```
sudo systemctl restart mysqld.service
```

- 查看配置

```
mysql> SHOW VARIABLES WHERE Variable_name LIKE 'character_set_%' OR Variable_name LIKE 'collation%';
+--------------------------+----------------------------+
| Variable_name            | Value                      |
+--------------------------+----------------------------+
| character_set_client     | utf8mb4                    |
| character_set_connection | utf8mb4                    |
| character_set_database   | utf8mb4                    |
| character_set_filesystem | binary                     |
| character_set_results    | utf8mb4                    |
| character_set_server     | utf8mb4                    |
| character_set_system     | utf8                       |
| character_sets_dir       | /usr/share/mysql/charsets/ |
| collation_connection     | utf8mb4_unicode_ci         |
| collation_database       | utf8mb4_unicode_ci         |
| collation_server         | utf8mb4_unicode_ci         |
+--------------------------+----------------------------+
```

# 大小写敏感

## linux 系统

mysql是通过lower_case_table_names变量来处理大小写问题的。 

首先查询该变量

mysql在Linux下数据库名、表名、列名、表别名大小写规则如下：

1、数据库名与表名严格区分大小写；

2、表别名严格区分大小写；

3、列名和列别名在所有情况下都是忽略大小写的；

4、变量名也是严格区分大小写的；

mysql在windows下都不区分大小写。

## 查看大小写敏感

```
show Variables like '%table_names';
```

结果如下：

```
mysql> show Variables like '%table_names';
+------------------------+-------+
| Variable_name          | Value |
+------------------------+-------+
| lower_case_table_names | 0     |
+------------------------+-------+
```

lower_case_table_names=0（默认）区分大小写，lower_case_table_names=1表示不区分大小写

## 更改解决

修改 `/etc/my.cnf` ,在 `[mysqld]` 后边添加 `lower_case_table_names=1` 重启mysql服务。

```
vi /etc/my.cnf
```

重启服务：

```
sudo systemctl restart mysqld.service
```

重新后再确认下即可。

# mysql 自动登录脚本

## 脚本

```sh
#!/usr/bin/expect

spawn mysql -h 127.0.0.1 -uroot -p 
set timeout 100
expect "Enter password:"
send "password\r"
interact
```

说明如下：

#!/usr/bin/expect     就是在上面获取的expect的安装路径，expect类似于一个sh

spawn  是expect的语句，执行命令前都要加这句

expect "Enter password:"  这句要加上，不加上会报错

send "password\r"   密码中如果有%等关键字，需要加转义符号/

interact 代表执行完留在远程控制台

## 执行报错

```
-bash: ./log.sh: /usr/bin/expect: bad interpreter: No such file or directory
```

网上说的比较多的原因就是 windows 和 unix 系统的编码不同导致。

## 编码问题？

查看文件编码

vi 文件执行，执行下面的命令

```
:set ff 或 :set fileformat
```

结果如下：

```
fileformat=unix
```

发现编码是 unix，那就是没有安装的问题

## 安装 expect 命令

```
yum install tcl-devel
yum install expect
```

重新尝试后，问题解决。

# mysql 内存占用过大的问题

## 内存占用

查看内存使用情况

```
free -h
```

查看谁在占用？

```
top
```

看了下 mysql 的内存占用大概 20% 左右，还能接受。

## 配置调整

解决思路很明确，就是修改配置文件 `/etc/my.cnf`，以下是我修改后的配置，大家请参考。

```ini
[mysqld]
lower_case_table_names=1
character-set-server=utf8
max_connections = 300
sql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES 

key_buffer_size = 16k
max_allowed_packet = 1M
thread_stack = 64k
sort_buffer_size = 64k
net_buffer_length = 2k
performance_schema_max_table_instances = 12500
table_open_cache_instances = 1
eq_range_index_dive_limit = 10
innodb_buffer_pool_dump_at_shutdown = OFF
innodb_buffer_pool_load_at_startup = OFF
innodb_checksum_algorithm = innodb
innodb_file_format = Antelope
innodb_file_format_max = Antelope
innodb_large_prefix = OFF
innodb_purge_threads = 1
innodb_strict_mode = OFF
max_seeks_for_key = 4294967295
max_write_lock_count = 4294967295
myisam_max_sort_file_size = 2146435072
performance_schema_accounts_size = 100
performance_schema_hosts_size = 100
performance_schema_max_cond_instances = 6900
performance_schema_max_file_classes = 50
performance_schema_max_mutex_instances = 21000
performance_schema_max_rwlock_instances = 10800
performance_schema_max_table_handles = 4000
performance_schema_max_thread_instances = 2100
performance_schema_setup_actors_size = 100
performance_schema_setup_objects_size = 100
performance_schema_users_size = 100
sync_binlog = 0
innodb_buffer_pool_size = 8M
innodb_log_buffer_size = 1M
```

上面的配置我是参考我本地的5.6.25配置修改的，因为我发现我本地的这个版本占用内存非常小。当然在windows上和linux上或许是有区别的。修改完之后mysql内存占用率下降到了26%左右，也就是占用260兆左右，现在我的剩余内存能保持在300兆左右了。

也是经过这个事情我才发现安装在linux上的mysql要比在windows上更吃内存，起初我以为是阿里云服务器的原因，查看了一下其他linux上的mysql占用内存情况也都在600兆左右，只不过其他服务器内存配置都挺高所以感觉不出来。

如果遇到问题请查看mysql的日志文件/var/log/mysqld.log，里面的错误记录如[ERROR] unknown variable 'have_crypt=NO'，这就表示你的版本没有have_crypt这个变量，删掉即可。

# centos7 yum mysql 5.7 安装笔记（2021-12-20）

## 配置 yum 源

去 MySQL 官网下载 YUM 的 RPM 安装包，http://dev.mysql.com/downloads/repo/yum/

（1）下载

```
$   sudo wget https://dev.mysql.com/get/mysql57-community-release-el7-11.noarch.rpm
```

（2）安装 mysql 源

```
$   sudo yum localinstall mysql57-community-release-el7-11.noarch.rpm
```

（3）检查 mysql 源是否安装成功

```
$   yum repolist enabled | grep "mysql.*-community.*"
```

如下：

```
mysql-connectors-community/x86_64   MySQL Connectors Community               221
mysql-tools-community/x86_64        MySQL Tools Community                    135
mysql57-community/x86_64            MySQL 5.7 Community Server               544
```

## 安装 mysql

```
$   sudo yum install -y mysql-community-server
```

## 启动 mysql 服务

在 CentOS 7 下，新的启动/关闭服务的命令是 `systemctl start|stop`

（1）启动

```
$   sudo systemctl start mysqld
```

（2）状态查看

```
$   sudo systemctl status mysqld
```

日志如下：

```
mysqld.service - MySQL Server
   Loaded: loaded (/usr/lib/systemd/system/mysqld.service; enabled; vendor preset: disabled)
   Active: active (running) since Mon 2021-12-20 14:49:30 CST; 1min 11s ago
     Docs: man:mysqld(8)
           http://dev.mysql.com/doc/refman/en/using-systemd.html
  Process: 24492 ExecStart=/usr/sbin/mysqld --daemonize --pid-file=/var/run/mysqld/mysqld.pid $MYSQLD_OPTS (code=exited, status=0/SUCCESS)
  Process: 24433 ExecStartPre=/usr/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
 Main PID: 24496 (mysqld)
   CGroup: /system.slice/mysqld.service
           └─24496 /usr/sbin/mysqld --daemonize --pid-file=/var/run/mysqld/mysqld.pid

Dec 20 14:49:25 VM-12-8-centos systemd[1]: Starting MySQL Server...
Dec 20 14:49:30 VM-12-8-centos systemd[1]: Started MySQL Server.
```

## 设置开机启动

```
$ sudo systemctl enable mysqld
```

重载所有修改过的配置文件

```
$ sudo systemctl daemon-reload
```

## 修改 root 本地账户密码

（1）临时默认密码

mysql 安装完成之后，生成的默认密码在 `/var/log/mysqld.log` 文件中。

使用 grep 命令找到日志中的密码。

```
$   grep 'temporary password' /var/log/mysqld.log
```

如下：

```
2021-12-20T06:49:26.697576Z 1 [Note] A temporary password is generated for root@localhost: XXXXXXXX
```

（2）登录修改

使用临时密码登录。

```
$   mysql -uroot -p
```

修改密码命令：

```
$   ALTER USER 'root'@'localhost' IDENTIFIED BY 'MyNewPassword!'; 
```

或者：

```
$   set password for 'root'@'localhost'=password('MyNewPass4!'); 
```

注意：

mysql 5.7 默认安装了密码安全检查插件（validate_password），默认密码检查策略要求密码必须包含：大小写字母、数字和特殊符号，并且长度不能少于8位。

否则会提示 ERROR 1819 (HY000): Your password does not satisfy the current policy requirements 错误。

[查看 MySQL官网密码详细策略](https://links.jianshu.com/go?to=https%3A%2F%2Fdev.mysql.com%2Fdoc%2Frefman%2F5.7%2Fen%2Fvalidate-password-options-variables.html%23sysvar_validate_password_policy)


## 配置文件调整

mysql 安装后默认不支持中文，需要修改编码。

修改 `/etc/my.cnf` 配置文件。

可参考的配置如下：

```ini
[mysql]
# 设置mysql客户端默认字符集
default-character-set=utf8mb4
 
[mysqld]
# 原始配置部分
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock
symbolic-links=0
log-error=/var/log/mysqld.log
pid-file=/var/run/mysqld/mysqld.pid

# 设置3306端口
port=3306
# 允许最大连接数
max_connections=20
# 服务端使用的字符集默认为8比特编码的latin1字符集
character-set-server=utf8mb4
# 创建新表时将使用的默认存储引擎
default-storage-engine=INNODB
 
collation-server=utf8mb4_unicode_ci
init_connect='SET NAMES utf8mb4'

character-set-client-handshake=FALSE
explicit_defaults_for_timestamp=true

# mysql 大小写敏感
lower_case_table_names=1

[client]
default-character-set=utf8mb4
```

- 重启 mysql 服务

```
sudo systemctl restart mysqld.service
```

- 登录查看配置

```
mysql> SHOW VARIABLES WHERE Variable_name LIKE 'character_set_%' OR Variable_name LIKE 'collation%';
+--------------------------+----------------------------+
| Variable_name            | Value                      |
+--------------------------+----------------------------+
| character_set_client     | utf8mb4                    |
| character_set_connection | utf8mb4                    |
| character_set_database   | utf8mb4                    |
| character_set_filesystem | binary                     |
| character_set_results    | utf8mb4                    |
| character_set_server     | utf8mb4                    |
| character_set_system     | utf8                       |
| character_sets_dir       | /usr/share/mysql/charsets/ |
| collation_connection     | utf8mb4_unicode_ci         |
| collation_database       | utf8mb4_unicode_ci         |
| collation_server         | utf8mb4_unicode_ci         |
+--------------------------+----------------------------+
```

# 参考资料

[CentOS安装MySQL详解](https://juejin.cn/post/6844903870053761037)

[Linux执行shell出现错误bad interpreter: No such file or directory解决方法](https://blog.csdn.net/wangkai_123456/article/details/53504237)

[CentOS上mysql占用内存过大之解决](https://www.caogenjava.com/detail/69.html)

[CentOS 7 下 Yum 安装 MySQL 5.7](https://qizhanming.com/blog/2017/05/10/how-to-yum-install-mysql-57-on-centos-7)

[CentOS 7 下 MySQL 5.7 的安装与配置](https://www.jianshu.com/p/1dab9a4d0d5f)

* any list
{:toc}