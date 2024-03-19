---
layout: post
title: Docker 安装 mysql Windows 环境
date:  2019-12-18 11:34:23 +0800
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

## 退出 exec

```
root@52907595fed0:/# exit
exit
```

或者使用 `CRTL+D`

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


# 无法显示中文问题

## 现象

所有的中文都会消失。

-  额外信息

使用工具也看不到注释等中文信息，确信是丢失了。

确切的说是变成了 `""` 空白的信息。

## 排查过程

- 连接软件

使用的 SecureCRT 软件，看了编码设置是没问题的。

- 查看 mysql 数据库编码配置

```
mysql> show variables like 'character_set_database';
+------------------------+---------+
| Variable_name          | Value   |
+------------------------+---------+
| character_set_database | utf8mb4 |
+------------------------+---------+
1 row in set (0.00 sec)
```

- 查看表的编码配置

```
mysql> show create table meta_field;

ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8 
```

发现都是指定编码了。

## 容器本身

是否需要在进入容器的时候指定编码呢？


### 直接登录

```
docker@default:~$ docker exec -it mysql bash
root@52907595fed0:/# locale
LANG=
LANGUAGE=
LC_CTYPE="POSIX"
LC_NUMERIC="POSIX"
LC_TIME="POSIX"
LC_COLLATE="POSIX"
LC_MONETARY="POSIX"
LC_MESSAGES="POSIX"
LC_PAPER="POSIX"
LC_NAME="POSIX"
LC_ADDRESS="POSIX"
LC_TELEPHONE="POSIX"
LC_MEASUREMENT="POSIX"
LC_IDENTIFICATION="POSIX"
LC_ALL=
```

会导致编码环境的不正确性。

### 指定编码登录

```
docker run -it mysql env LANG=C.UTF-8 /bin/bash
```

剩下就是解决 locale 的问题了。

也很简单，只需要启动或者进入容器的时候添加个参数 `env LANG=C.UTF-8` 即可。 

```
docker@default:~$ docker run -it mysql env LANG=C.UTF-8 /bin/bash
root@c3a39ae5121b:/# locale
LANG=C.UTF-8
LANGUAGE=
LC_CTYPE="C.UTF-8"
LC_NUMERIC="C.UTF-8"
LC_TIME="C.UTF-8"
LC_COLLATE="C.UTF-8"
LC_MONETARY="C.UTF-8"
LC_MESSAGES="C.UTF-8"
LC_PAPER="C.UTF-8"
LC_NAME="C.UTF-8"
LC_ADDRESS="C.UTF-8"
LC_TELEPHONE="C.UTF-8"
LC_MEASUREMENT="C.UTF-8"
LC_IDENTIFICATION="C.UTF-8"
LC_ALL=
```

- 登录尝试

```
root@c3a39ae5121b:/# mysql -root -p
Enter password: 
ERROR 2002 (HY000): Can't connect to local MySQL server through socket '/var/run/mysqld/mysqld.sock' (2)
```

发现登录失败。

- 重启服务测试

```

```

## 连接报错

结果连接报错

```
root@42433c238c70:/# mysql -uroot -p
Enter password: 

ERROR 2002 (HY000): Can't connect to local MySQL server through socket '/var/run/mysqld/mysqld.sock' (2)
```

### 重启服务测试

重启服务提示没这个服务

### 建立软连接

- 查找对应的 mysql.sock

```
# find / -name mysql.sock
/tmp/mysql.sock
```

是可以找到的。

- 这个文件的作用 

在这之前，需要明白mysql.sock这个文件有什么用？

连接localhost通常通过一个Unix域套接字文件进行，一般是/tmp/mysql.sock。

如果套接字文件被删除了，本地客户就不能连接。这可能发生在你的系统运行一个cron任务删除了/tmp下的临时文件。

如果你因为丢失套接字文件而不能连接，你可以简单地通过重启服务器重新创建得到它。因为服务器在启动时重新创建它。

- 建立软连接

```
 $  ln -s /var/run/mysqld/mysqld.sock /tmp/mysql.sock
```

```
$  ln -s /tmp/mysql.sock /var/run/mysqld/mysqld.sock 
```

发现还是不行

只用把my.cnf的socket原先是 /uer/local/mysql/tmp/mysql.sock 改为 /tmp/mysql.sock 一步就解决了

意思是一样的。

### 初始化指定的方式

```
1、先创建好mysql容器
$   docker run -p 13306:3306 --name mysql7   -v /opt/mysql/data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7
2、进入容器
$   docker exec -it mysql7 env LANG=C.UTF-8  /bin/bash
3、登陆容器内数据库
mysql -u root -p 设置的密码
```

按照上面的方式成功启动。

# 数据库执行流程

## 数据库

```
mysql> create database jdbc;
Query OK, 1 row affected (0.00 sec)

mysql> use jdbc
Database changed
```

## 脚本

```sql
drop table if exists meta_field;

drop table if exists meta_model;

/*==============================================================*/
/* Table: meta_field                                            */
/*==============================================================*/
create table meta_field
(
   ID                   int not null auto_increment comment '自增长主键',
   uid                  varchar(36) comment '唯一标识',
   name                 varchar(125) comment '名称',
   dbName         varchar(36) comment '数据库表名',
   alias                varchar(125) comment '别名',
   comment          varchar(255) comment '描述',
   isNullable           bool comment '是否可为空',
   dataType             varchar(36) comment '数据类型',
   createTime           datetime comment '创建时间',
   updateTime           datetime comment '更新时间',
   primary key (ID)
)
auto_increment = 1000
DEFAULT CHARSET=utf8;

alter table meta_field comment '元数据字段表';

/*==============================================================*/
/* Table: meta_model                                            */
/*==============================================================*/
create table meta_model
(
   ID                   int not null auto_increment comment '自增长主键',
   uid                  varchar(36) comment '唯一标识',
   name                 varchar(125) comment '名称',
   dbName         varchar(36) comment '数据库表名',
   alias                varchar(125) comment '别名',
   comment          varchar(255) comment '描述',
   category             varchar(36) comment '分类',
   isVisible            bool comment '是否可查询',
   isEditable           bool comment '是否可编辑',
   createTime           datetime comment '创建时间',
   updateTime           datetime comment '更新时间',
   primary key (ID)
)
DEFAULT CHARSET=utf8;

alter table meta_model comment '元数据实体表';
```

## 测试查询

```

```



# 参考资料

[docker windows 7 mysql安装使用教程](https://www.cnblogs.com/jjg0519/p/6070241.html)

[在Windows上体验Docker（四）运行mysql镜像](https://blog.csdn.net/maxwoods/article/details/81329953)

[Docker为什么刚运行就退出了?](https://blog.csdn.net/meegomeego/article/details/50707532)

## 中文无法输入问题

[docker下终端无法输入中文问题](https://blog.csdn.net/wen3qin/article/details/78386654)

## mysql 无法启动问题

[亲测有效，解决Can 't connect to local MySQL server through socket '/tmp/mysql.sock '(2) ";](https://blog.csdn.net/hjf161105/article/details/78850658)

[Can't connect to local MySQL server through socket '/var/run/mysqld/mysqld.sock](https://blog.csdn.net/weixin_43445841/article/details/85040252)

* any list
{:toc}