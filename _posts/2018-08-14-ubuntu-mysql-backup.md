---
layout: post
title:  Ubuntu MySQL backup
date:  2018-08-14 13:46:27 +0800
categories: [Ubuntu]
tags: [ubuntu, sql]
published: true
---

* any list
{:toc}

# mysql开启日志功能

- 查看是否开启

```
mysql> show variables like 'log_bin';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| log_bin       | OFF   |
+---------------+-------+
1 row in set (0.00 sec)
```

- 查看当前日志

```
mysql> show variables like 'log_bin';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| log_bin       | OFF   |
+---------------+-------+
1 row in set (0.00 sec)

mysql> show master status;
Empty set (0.00 sec)
```

- 编辑配置文件 ```my.cnf```

```
vi /etc/mysql/my.cnf
```

开启日志:

```
log-bin = /var/mysqllog/logbin.log
```

- 查看状态

```
service mysql restart

mysql>  show variables like 'log_bin';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| log_bin       | ON    |
+---------------+-------+
1 row in set (0.00 sec)
mysql> show master status;
+------------------+----------+--------------+------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB |
+------------------+----------+--------------+------------------+
| mysql-bin.000001 |      107 |              |                  |
+------------------+----------+--------------+------------------+
1 row in set (0.00 sec)
```


# 备份还原

1、备份一个数据库

mysqldump基本语法：

```
mysqldump -u username -p dbname table1 table2 ...-> BackupName.sql
```

其中：
dbname参数表示数据库的名称；
table1和table2参数表示需要备份的表的名称，为空则整个数据库备份；
```BackupName.sql``` 参数表设计备份文件的名称，文件名前面可以加上一个绝对路径。通常将数据库被分成一个后缀名为sql的文件；


如:

```
mysqldump -u root -p blog_view  > /root/backup/blog_view.sql;
```


- 备份多个数据库

```
mysqldump -u username -p --databases dbname2 dbname2 > Backup.sql
```

- 备份所有数据库

```
mysqldump -u username -p -all-databases > BackupName.sql
```



2、还原一个数据库

```
mysql -u root -p [dbname] < backup.sq
```


> 定时备份

- 创建定时备份脚本:

```
vi backup_blog_view.sh
```

- 添加内容如下:

```
#!/bin/bash
mysqldump -uroot -p123456 blog_view > /root/backup/blog_view_$(date +%Y%m%d_%H%M%S).sql
```

- 进行备份压缩:

```
#!/bin/bash
mysqldump -uroot -p123456 blog_view | gzip > /root/backup/blog_view_$(date +%Y%m%d_%H%M%S).sql.gz
```

- 添加权限,执行测试:

```
chmod +x backup_blog_view.sh
./backup_blog_view.sh
```

- 定时运行

ubuntu 下受用 crontab
```
$   ~# crontab -e
```

添加内容如下:

```
0 2 * * * /root/shell/backup_blog_view.sh
```

意思为凌晨2点执行备份脚本。

- 重启 CRON 进程:

```
~# /etc/init.d/cron restart
```










