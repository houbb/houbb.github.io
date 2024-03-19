---
layout: post
title:  Docker 安装 MySQL
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, mysql, sh]
published: true
excerpt: Docker 安装 mysql
---

# Docker 安装 mysql

## 拓展阅读

[Docker 入门介绍](https://houbb.github.io/2018/09/05/container-docker-hello)

[Mysql 5.6.0 安装](https://houbb.github.io/2018/01/25/mysql-5.6-install)


# 安装流程

测试环境为 mac。

友情提示：下面的安装遇到了坑，如果想跳过，直接到 [mysql 5.7 安装](#mysql-57-安装)

## 下载 mysql 

- 拉取镜像

```
$   docker pull mysql
```

- 查看镜像

```
$ docker image list | grep mysql

mysql                            latest              6a834f03bd02        3 days ago          484MB
```

## 运行

```
sudo docker run --name first-mysql -p 13306:3306 -e MYSQL_ROOT_PASSWORD=123456 -d mysql
```

- 参数说明

```
--name first-mysql 设置名称
-p 13306:3306 映射端口为 13306
-e MYSQL_ROOT_PASSWORD=123456 设置密码
-d 守护进程，后台运行
```

- 查看状态

```
$ docker ps | grep mysql
a502ef8fce79        mysql               "docker-entrypoint.s…"   8 seconds ago       Up 7 seconds        33060/tcp, 0.0.0.0:13306->3306/tcp   first-mysql
```

## mysql-client

我本地以前安装过 mysql，所以这一步跳过。

## 访问

```
$   mysql -h127.0.0.1 -P13306 -uroot -p123456
```

然后报错如下:

```
promote:~ houbinbin$ mysql -h127.0.0.1 -P13306 -uroot -p123456
Warning: Using a password on the command line interface can be insecure.
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading initial communication packet', system error: 0
promote:~ houbinbin$ mysql -h127.0.0.1 -P13306 -uroot -p
Enter password: 
ERROR 2059 (HY000): Authentication plugin 'caching_sha2_password' cannot be loaded: dlopen(/usr/local/mysql/lib/plugin/caching_sha2_password.so, 2): image not found
```

### 问题解决

[docker-mysql-auth](https://github.com/docker-library/mysql/issues/419) 和 [mysql-auth](https://stackoverflow.com/questions/49194719/authentication-plugin-caching-sha2-password-cannot-be-loaded) 两个帖子看了一下。

- 原因

最新版 8.0 可能存在这方面的问题。主要是不会配置 T_T

决定使用 `mysql 5.7`。

- 当前 container 的处理

停止并且删除

```
$   docker stop ${container_id}
$   docker rm ${container_id}
```

# mysql 5.7 安装

## 查询

```
$ docker search mysql

NAME                                                   DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
mysql                                                  MySQL is a widely used, open-source relation…   6898                [OK]                
mariadb                                                MariaDB is a community-developed fork of MyS…   2201                [OK]                
...
```

## 下载 

- 指定版本为 5.7

```
$   docker pull mysql:5.7
```

- 查看镜像

```
$ docker image list | grep mysql
mysql                            5.7                 563a026a1511        3 days ago          372MB
```

## 运行

```
sudo docker run --name first-mysql -p 13306:3306 -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7
```

- 查看状态

```
$ docker ps

CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                                NAMES
fa101df40fe2        mysql:5.7           "docker-entrypoint.s…"   5 seconds ago       Up 3 seconds        33060/tcp, 0.0.0.0:13306->3306/tcp   first-mysql
```

### 表名大小写敏感

mybatis 大小写敏感会出问题，可以使用如下配置：

```
sudo docker run --name first-mysql -p 13306:3306 -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7 --lower_case_table_names=1
```

## 访问

```
$ mysql -h127.0.0.1 -P13306 -uroot -p123456

Warning: Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 2
Server version: 5.7.23 MySQL Community Server (GPL)

Copyright (c) 2000, 2016, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
```

- 测试

```
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
4 rows in set (0.00 sec)
```

# 参考资料

- mac

[how-do-i-install-command-line-mysql-client-on-mac](https://stackoverflow.com/questions/30990488/how-do-i-install-command-line-mysql-client-on-mac)


- docker mysql

[Docker 安装 MySQL](http://www.runoob.com/docker/docker-install-mysql.html)

[使用docker运行mysql实例](https://www.jianshu.com/p/c24e3e5f5b58)

* any list
{:toc}