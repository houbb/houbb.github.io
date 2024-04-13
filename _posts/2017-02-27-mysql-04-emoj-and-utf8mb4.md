---
layout: post
title: MySQL 04-EMOJI 表情与 UTF8MB4 的故事
date:  2017-02-27 21:44:46 +0800
categories: [SQL]
tags: [mysql, database, sql]
published: true
---

# 拓展阅读

[MySQL 00 View](https://houbb.github.io/2017/02/27/mysql-00-view)

[MySQL 01 Ruler mysql 日常开发规范](https://houbb.github.io/2017/02/27/mysql-01-ruler)

[MySQL 02 truncate table 与 delete 清空表的区别和坑](https://houbb.github.io/2017/02/27/mysql-truncate)

[MySQL 03 Expression 1 of ORDER BY clause is not in SELECT list,references column](https://houbb.github.io/2017/02/27/mysql-03-error)

[MySQL 04 EMOJI 表情与 UTF8MB4 的故事](https://houbb.github.io/2017/02/27/mysql-04-emoj-and-utf8mb4)

[MySQL 05 MySQL入门教程（MySQL tutorial book）](https://houbb.github.io/2017/02/27/mysql-05-learn-book)

[MySQL 06 mysql 如何实现类似 oracle 的 merge into](https://houbb.github.io/2017/02/27/mysql-06-merge-into)

[MySQL 07 timeout 超时异常](https://houbb.github.io/2017/02/27/mysql-07-timeout-errors)

[MySQL 08 datetime timestamp 以及如何自动更新，如何实现范围查询](https://houbb.github.io/2017/02/27/mysql-08-datetime-timestamp)

[MySQL 09 MySQL-09-SP mysql 存储过程](https://houbb.github.io/2017/02/27/mysql-09-sp)



# emoji

想在 mysql 数据库插入  emoji 表情，结果报错：

```
### Cause: java.sql.SQLException: Incorrect string value: '\xF0\x9F\x92\x8B' for column 'name' at row 1
```

错误原因很多小伙伴也知道，mysql 种的 utf8 和 java 的 utf-8 并不是完全对等的。

应该指定 mysql 的编码为 utf8mb4 才是正确的。

# 修改编码

## 查看编码

```sql
show variables like 'character_set_database'; # 查看数据库编码
show create table comment; # 查看表编码
```

## 修改数据库 & 表编码

可以在原来的基础上直接修改：

```sql
alter database <数据库名> character set utf8mb4; # 修改数据库
alter table <表名> character set utf8mb4; # 修改表
alter table <表名> change <字段名> <字段名> <类型> character set utf8mb4; # 修改字段
```

## 建表时指定

```sql
drop database echo_blog;
CREATE DATABASE echo_blog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

drop table comment;
create table comment
(
    id int unsigned auto_increment comment '主键' primary key,
    create_time timestamp default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
) comment '评论信息' ENGINE=Innodb default charset=UTF8MB4 auto_increment=1;
```

## 乱码问题

修改完成之后，插入成功。

但是数据库中全部是 `???` 之类的内容，而不是表情内容。

到底哪里出问题了呢？

# mysql 编码问题

## 查看 mysql 编码

```
SHOW VARIABLES WHERE Variable_name LIKE 'character_set_%' OR Variable_name LIKE 'collation%';
```

如下：

```
mysql> SHOW VARIABLES WHERE Variable_name LIKE 'character_set_%' OR Variable_name LIKE 'collation%';
+--------------------------+----------------------------------------------------+
| Variable_name            | Value                                              |
+--------------------------+----------------------------------------------------+
| character_set_client     | utf8mb4                                            |
| character_set_connection | utf8mb4                                            |
| character_set_database   | utf8mb4                                            |
| character_set_filesystem | binary                                             |
| character_set_results    | utf8mb4                                            |
| character_set_server     | utf8mb4                                            |
| character_set_system     | utf8                                               |
| character_sets_dir       | D:\tools\mysql\mysql-5.7.24-winx64\share\charsets\ |
| collation_connection     | utf8mb4_unicode_ci                                 |
| collation_database       | utf8mb4_unicode_ci                                 |
| collation_server         | utf8mb4_unicode_ci                                 |
+--------------------------+----------------------------------------------------+
```

属性说明：

character_set_client

主要用来设置客户端使用的字符集。通俗的讲就是mysql把客户端传递过来的数据都当成是utf8mb4

character_set_connection

主要用来设置连接数据库时的字符集，如果程序中没有指明连接数据库使用的字符集类型则按照这个字符集设置。

character_set_database

主要用来设置默认创建数据库的编码格式，如果在创建数据库时没有设置编码格式，就按照这个格式设置。

character_set_filesystem

文件系统的编码格式，把操作系统上的文件名转化成此字符集，即把 character_set_client转换character_set_filesystem， 默认binary是不做任何转换的。

character_set_results

数据库给客户端返回时使用的编码格式，如果没有指明，使用服务器默认的编码格式。通俗的讲就是mysql发送个客户端的数据是utf8mb4的

character_set_server

服务器安装时指定的默认编码格式，这个变量建议由系统自己管理，不要人为定义。

character_set_system

数据库系统使用的编码格式，这个值一直是utf8，不需要设置，它是为存储系统元数据的编码格式。

character_sets_dir

这个变量是字符集安装的目录。


### Mysql的字符集内部处理

1.mysql Server收到请求时将请求数据从 character_set_client 转换为 character_set_connection

2.进行内部操作前将请求数据从 character_set_connection 转换为内部操作字符集,步骤如下

　　A. 使用每个数据字段的 CHARACTER SET 设定值；

　　B. 若上述值不存在，则使用对应数据表的字符集设定值

　　C. 若上述值不存在，则使用对应数据库的字符集设定值；

　　D. 若上述值不存在，则使用 character_set_server 设定值。

3.最后将操作结果从内部操作字符集转换为 character_set_results

![mysql charsets](https://upload-images.jianshu.io/upload_images/14079828-9e79bb8527143ae1.png)

## 临时修改配置

上面的配置都可以通过命令临时修改：

```
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_database = utf8mb4;
SET character_set_results = utf8mb4;
SET character_set_server = utf8mb4;

SET collation_connection = utf8mb4_unicode_ci;
SET collation_database = utf8mb4_unicode_ci;
SET collation_server = utf8mb4_unicode_ci;
```

当然，也可以通过修改 my.ini 配置文件。

## 修改 mysql 服务器配置文件

比如 windows 下个人的 mysql 安装目录为：`D:\tools\mysql\mysql-5.7.24-winx64`

那就在下面创建 my.ini（如果没有的话）。

内容如下：

```ini
[mysql]
# 设置mysql客户端默认字符集
default-character-set=utf8mb4
 
[mysqld]
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

character-set-client-handshake = FALSE
explicit_defaults_for_timestamp=true
 
[client]
default-character-set=utf8mb4
```

修改完成后需要重启 mysql 服务。

可以在 bin 下执行 `mysqld restart`。这个实践下来只初始化了部分编码。

个人实在 windows services（服务） 下，把 mysql 服务进行了重新启动。


# jdbc 配置

## druid 数据源配置

```yml
spring:
  datasource:
    druid:
      username: root
      password: xxxxxx
      url: jdbc:mysql://localhost:3306/echo_blog?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=UTC
      driver-class-name: com.mysql.jdbc.Driver
      connection-init-sqls: set names utf8mb4;
```

## 官方资料

[https://dev.mysql.com/doc/connectors/en/connector-j-reference-charsets.html](https://dev.mysql.com/doc/connectors/en/connector-j-reference-charsets.html)

```
Notes
For Connector/J 8.0.12 and earlier: In order to use the utf8mb4 character set for the connection, the server MUST be configured with character_set_server=utf8mb4; if that is not the case, when UTF-8 is used for characterEncoding in the connection string, it will map to the MySQL character set name utf8, which is an alias for utf8mb3.

For Connector/J 8.0.13 and later:

When UTF-8 is used for characterEncoding in the connection string, it maps to the MySQL character set name utf8mb4.

If the connection option connectionCollation is also set alongside characterEncoding and is incompatible with it, characterEncoding will be overridden with the encoding corresponding to connectionCollation.

Because there is no Java-style character set name for utfmb3 that you can use with the connection option charaterEncoding, the only way to use utf8mb3 as your connection character set is to use a utf8mb3 collation (for example, utf8_general_ci) for the connection option connectionCollation, which forces a utf8mb3 character set to be used, as explained in the last bullet.

Warning
Do not issue the query SET NAMES with Connector/J, as the driver will not detect that the character set has been changed by the query, and will continue to use the character set configured when the connection was first set up.
```

说明：

```
提示
mysql-connector-java 版本在8.0.12之前的，包括8.0.12，服务端必须设置character_set_server=utf8mb4;如果不是的话，就算设置了characterEncoding=UTF-8，照样会被设置为MYSQL的 utf8字符集，也就是utf8mb3。

对于8.0.13和以后的版本，如果设置了characterEncoding=UTF-8，他会映射到MYSQL的utf8mb4字符集。

如果connectionCollation 也和characterEncoding一起设置了，但是不兼容，characterEncoding会被connectionCollation的设置覆盖掉。

由于没有Java-Style的utfmb3对应的字符集名称可以用在connection选项charaterEncoding上，唯一的设置utf8mb3的方式就是在连接选项设置utf8mb3 collation（例如utf8_general_ci），这会强制使用utf8mb3字符集，正如上文所述。

警告
不要通过Connector发起SET NAMES指令，因为driver不会检测字符集是不是被查询语句改动，并且当连接第一次建立之后，会继续使用当时的字符集设置。
```

可以发现 jdbc 中的配置 `connection-init-sqls: set names utf8mb4;` 这句话是没啥用的。

建议老老实实的修改 mysql 服务端的配置。

# 依然乱码

这个时候 java 客户端保存 emoji，依然有部分乱码。

比如：

```
💔✊💓💖😧😯 I Love this!
```

用命令行查看，数据库变成了：

```
 �✊���� I Love this!
```

部分乱码？ what's up？

## java 程序断点

在 java 应用中进行断点，发现内容是对的。

## mysql 命令行插入

我们直接在 mysql 命令行执行插入：

```sql
insert into comment (content) values ('💔✊💓💖😧😯 I Love this!');
```

MD，发现无法执行，这条路走不通。

命令行终端不支持 emoji 表情。

## 乱码的原因

这个乱码是因为 mysql 终端导致的，还是别的原因？

我们测试一下，使用 java 程序对内容进行查询。

### 测试代码

```java
@RunWith(SpringRunner.class)
@SpringBootTest(classes = Application.class)
public class CommentServiceTest {

    @Autowired
    private CommentService commentService;

    @Test
    public void selectTest() {
        Comment comment = commentService.selectById(20);
        System.out.println(comment);
    }

}
```

### 测试效果

日志如下：

```
Comment{id=20, content=💔✊💓💖😧😯 I Love this!, ackFlag=N, createTime=Sun Aug 15 10:13:56 CST 2021, updateTime=Sun Aug 15 10:13:56 CST 2021}
```

可以发现，存储的数据本身是没有问题的。

是命令行终端的问题。

# 命令行的问题

## 已有的命令行

一开始使用的是 windows10 自带的 cmd，发现不行。

使用 cmder 命令行，还是不行。

## powershell

我们测试下微软商店的 Terminal 命令行，也就是新版本的 powershell。

```
cd D:\tools\mysql\mysql-5.7.24-winx64\bin
.\mysql -uroot -p
```

登录后执行查询，结果如下：

```
💔✊💓💖😧😯 I Love this! 
```

纠结了半天的乱码，经确认是命令行终端的问题。

# 参考资料

[MySQL的utf8、utf8mb4、编码问题详解](https://www.jianshu.com/p/0abaee1aabea)

[mysql字符集utf8mb4失效踩坑](https://blog.csdn.net/sz85850597/article/details/99695874)

[Mysql UTF-8mb4字符集的问题](https://www.cnblogs.com/slankka/p/10116258.html)

* any list
{:toc}