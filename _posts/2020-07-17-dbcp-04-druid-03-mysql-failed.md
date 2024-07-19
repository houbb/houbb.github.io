---
layout: post
title:  alibaba druid-03-mysql 报错 The last packet successfully received from the server was XXX milliseconds ago
date:  2020-7-17 16:52:15 +0800
categories: [Database]
tags: [database, sql, dbcp, sh]
published: true
---

# 场景

使用 alibaba druid 访问 mysql，执行一段时间后报错：

```
The last packet successfully received from the server was XXX milliseconds ago
```

## 原因

MySQL连接已经超时了，即长时间没有收到新的查询请求。连接处于空闲状态而被MySQL服务器关闭。

# 解决方式

你可以尝试使用以下方法来解决这个问题：

1. 检查数据库服务器和应用服务器之间的网络连接是否正常，特别是在高延迟或不稳定的网络环境下。

2. 增加数据库连接的超时时间，这可以通过在JDBC URL中添加"autoReconnect=true&autoReconnectForPools=true&connectTimeout=30000&socketTimeout=60000"参数实现（具体数值可以根据实际情况调整）。

3. 使用 数据库连接池来管理连接，可以更好地控制连接的超时时间和重连逻辑。

4. 检查数据库是否已满，如果数据库已经使用了大量的系统资源，那么此时数据库的性能可能很低，以至于无法响应新的查询请求。

# 实战笔记

## 查询超时时间

```
mysql> show variables like '%timeout%';
+-----------------------------+----------+
| Variable_name               | Value    |
+-----------------------------+----------+
| connect_timeout             | 10       |
| delayed_insert_timeout      | 300      |
| have_statement_timeout      | YES      |
| innodb_flush_log_at_timeout | 1        |
| innodb_lock_wait_timeout    | 50       |
| innodb_rollback_on_timeout  | OFF      |
| interactive_timeout         | 28800    |
| lock_wait_timeout           | 31536000 |
| net_read_timeout            | 30       |
| net_write_timeout           | 60       |
| rpl_stop_slave_timeout      | 31536000 |
| slave_net_timeout           | 60       |
| wait_timeout                | 28800    |
+-----------------------------+----------+
```

属性解释如下：

当然，以下是以表格形式返回的 MySQL 超时相关变量及其解释：

| Variable_name               | Value    | 解释                                         |
|-----------------------------|----------|----------------------------------------------|
| connect_timeout             | 10       | 服务器等待客户端连接的时间（秒）。默认10秒。  |
| delayed_insert_timeout      | 300      | `INSERT DELAYED` 插入数据的等待时间（秒）。默认300秒。 |
| have_statement_timeout      | YES      | 指示是否支持 SQL 语句的超时设置。默认支持。  |
| innodb_flush_log_at_timeout | 1        | InnoDB 日志缓冲区的刷新间隔时间（秒）。默认1秒。 |
| innodb_lock_wait_timeout    | 50       | InnoDB 事务等待锁释放的时间（秒）。默认50秒。 |
| innodb_rollback_on_timeout  | OFF      | 事务超时时是否回滚整个事务。默认不回滚。     |
| interactive_timeout         | 28800    | 交互式客户端空闲超时时间（秒）。默认28800秒。 |
| lock_wait_timeout           | 31536000 | 锁等待超时时间（秒）。默认31536000秒。       |
| net_read_timeout            | 30       | 服务器等待从客户端读取数据的时间（秒）。默认30秒。 |
| net_write_timeout           | 60       | 服务器等待向客户端写入数据的时间（秒）。默认60秒。 |
| rpl_stop_slave_timeout      | 31536000 | 复制停止从服务器的超时时间（秒）。默认31536000秒。 |
| slave_net_timeout           | 60       | 从服务器等待主服务器数据的时间（秒）。默认60秒。 |
| wait_timeout                | 28800    | 非交互式客户端空闲超时时间（秒）。默认28800秒。 |

## 修改配置

我们可以修改 mysql 的配置文件 my.cnf（/etc/my.cnf 文件所在位置）

```
wait_timeout=1200000
interactive_timeout=1200000
```

重启 mysql 服务在次执行 `show variables like ‘%timeout%’;` 命令查看wait_timeout连接等待时间

## jdbc url 调整

连接mysql url添加参数 

```sh
&keepAlive=true&autoReconnect=true&autoReconnectForPools=true&connectTimeout=30000&socketTimeout=60000
```

解释：

| 属性名                        | 值       | 解释                                                      |
|-------------------------------|----------|-----------------------------------------------------------|
| keepAlive                     | true     | 启用 TCP keep-alive 功能，以检测和保持连接的活跃状态。    |
| autoReconnect                 | true     | 启用自动重新连接功能，当连接失效时，自动重新建立连接。    |
| autoReconnectForPools         | true     | 启用自动重新连接功能，专用于连接池中的连接自动恢复。      |
| connectTimeout                | 30000    | 指定连接超时时间（以毫秒为单位），默认30,000毫秒（30秒）。|
| socketTimeout                 | 60000    | 指定套接字读写操作的超时时间（以毫秒为单位），默认60,000毫秒（60秒）。|


# druid 推荐的配置

## 例子

```json
{
	"initial-size": 10,
	"min-idle": 5,
	"maxActive": 30,
	"timeBetweenEvictionRunsMillis": 50000,
	"validationQuery": "SELECT 1",
	"testWhileIdle": true,
	"test-on-borrow": false,
	"test-on-return": false,
	"test-while-idle": false,
	"min-evictable-idle-time-millis": 300000,
	"max-evictable-idle-time-millis": 600000
}
```

解释：

| 属性名                          | 值       | 解释                                                                                  |
|---------------------------------|----------|---------------------------------------------------------------------------------------|
| initial-size                    | 10       | 初始化时建立的连接数。                                                                |
| min-idle                        | 5        | 连接池中最小空闲连接数。                                                              |
| maxActive                       | 30       | 连接池中最大活动连接数。                                                              |
| timeBetweenEvictionRunsMillis   | 50000    | 两次空闲连接回收器运行之间的时间间隔（以毫秒为单位）。                                 |
| validationQuery                 | SELECT 1 | 用于检测连接是否有效的 SQL 查询语句。                                                  |
| testWhileIdle                   | true     | 指定空闲连接是否需要经过验证。                                                         |
| test-on-borrow                  | false    | 指定从连接池借用连接时是否需要经过验证。                                               |
| test-on-return                  | false    | 指定从连接池归还连接时是否需要经过验证。                                               |
| test-while-idle                 | false    | （重复属性）指定空闲连接是否需要经过验证。                                             |
| min-evictable-idle-time-millis  | 300000   | 连接在池中保持空闲而不被驱逐的最小时间（以毫秒为单位）。                               |
| max-evictable-idle-time-millis  | 600000   | 连接在池中保持空闲而不被驱逐的最大时间（以毫秒为单位）。                               |

这里要保证 `max-evictable-idle-time-millis` 小于 mysql 设置的最大等待时间。

testWhileIdle=true，timeBetweenEvictionRunsMillis=60s 左右，定期检测连接的有效性。 

经过上面的几步，问题解决。

# 参考资料

[mysql 超时](https://www.cnblogs.com/jbtys/p/18142319)

https://blog.csdn.net/weixin_43103956/article/details/136389845

https://blog.csdn.net/JGMa_TiMo/article/details/130404972

* any list
{:toc}