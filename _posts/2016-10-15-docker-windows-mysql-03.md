---
layout: post
title: Docker mysql windows 安装
date:  2016-10-15 22:41:45 +0800
categories: [Docker]
tags: [docker, windows, mysql, sf]
published: true
---


# 查看镜像 

```
$ docker image list
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
```

发现没有

# 下载

```
$    docker pull myql
```

大概 400M 左右，需要耐心等待

# 启动

```
docker run -d --name mysql -e MYSQL_ROOT_HOST=% -e MYSQL_ROOT_PASSWORD=root -e MYSQL_USER=root -e MYSQL_PASSWORD=123456 -p 3306:3306 -v /d/docker/mysql:/var/lib/mysql mysql
```

参数“-v /d/docker/mysql:/var/lib/mysql”表示将windows目录d:\docker\mysql映射到/var/lib/mysql，这里存放了数据库文件。

参数“-e MYSQL_ROOT_PASSWORD" 指定了root用户的密码

参数“-e MYSQL_USER=mysql"  指定了用户名

参数“-e MYSQL_PASSWORD=mysql“ 指定了用户密码

## 查看

```
$    docker ps

CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                               NAMES
52907595fed0        mysql               "docker-entrypoint.s…"   18 minutes ago      Up 17 minutes       0.0.0.0:3306->3306/tcp, 33060/tcp   mysql
```



## 自动退出的问题

发现已启动，然后就很快退出了。

## 日志查看

```
$docker logs ${container_id}
```


# 访问

访问容器内的终端

```
$ docker exec -it mysql bash
```

执行登录命令：

```
mysql -uroot -proot
```

这个密码和我们指定的一致。

## 测试

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

## 创建数据库

```
mysql> create database jdbc;
Query OK, 1 row affected (0.00 sec)

mysql> use jdbc;
Database changed
```

## 建立表

```sql
mysql> create table meta_field
    -> (
    ->    ID                   int not null auto_increment comment '',
    ->    uid                  varchar(36) comment '唯一标识',
   uid                  varchar(36) comment '',
    ->    name                 varchar(125) comment '',
    ->    dbName         varchar(36) comment '',
    ->    alias                varchar(125) comment '',
    ->    comment          varchar(255) comment '',
    ->    isNullable           bool comment '',
    ->    dataType             varchar(36) comment '',
    ->    createTime           datetime comment '',
    ->    updateTime           datetime comment '',
    ->    primary key (ID)
    -> )
    -> auto_increment = 1000
    -> DEFAULT CHARSET=utf8;
Query OK, 0 rows affected, 1 warning (0.00 sec)


mysql> 
mysql> alter table meta_field comment '';
Query OK, 0 rows affected (0.01 sec)
Records: 0  Duplicates: 0  Warnings: 0
```

# 使用工具连接

使用 data-grip 成功访问

## 代码访问失败

Method threw 'com.mysql.jdbc.exceptions.jdbc4.MySQLNonTransientConnectionException' exception.


### 原因

[mysql 8.0 Druid连接时调用getServerCharset报空指针异常解决方法](https://www.cnblogs.com/zhjh256/p/9020049.html)

最新版的 mysql 版本变化了。

### 关闭最新版本

```
docker container stop mysql
```

# 安装 mysql:5.7

## 下载

```
docker pull mysql:5.7
```

# 参考资料

[docker windows 7 mysql安装使用教程](https://www.cnblogs.com/jjg0519/p/6070241.html)

[在Windows上体验Docker（四）运行mysql镜像](https://blog.csdn.net/maxwoods/article/details/81329953)

[Docker为什么刚运行就退出了?](https://blog.csdn.net/meegomeego/article/details/50707532)

* any list
{:toc}