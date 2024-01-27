---
layout: post
title: ETL-11-apache SeaTunnel Connector v2 sink jdbc
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# JDBC 汇聚连接器

## 描述

通过 JDBC 写入数据。支持批处理模式和流处理模式，支持并发写入，支持精确一次传输语义（使用 XA 事务保证）。

提示

警告：为了许可合规性，您必须自行提供数据库驱动程序，并将其复制到 $SEATNUNNEL_HOME/lib/ 目录中以使其生效。

例如，如果使用 MySQL，应下载并将 mysql-connector-java-xxx.jar 复制到 $SEATNUNNEL_HOME/lib/。对于 Spark/Flink，您还应将其复制到 $SPARK_HOME/jars/ 或 $FLINK_HOME/lib/。

## 主要特性

√ 精确一次传输 使用 XA 事务来确保精确一次传输。因此，仅支持支持 XA 事务的数据库的精确一次传输。您可以设置 is_exactly_once=true 来启用它。

√ 变更数据捕获（CDC）

# 选项

| 名称                                  | 类型      | 是否必需 | 默认值              |
|---------------------------------------|-----------|----------|---------------------|
| url                                   | 字符串    | 是       | -                   |
| driver                                | 字符串    | 是       | -                   |
| user                                  | 字符串    | 否       | -                   |
| password                              | 字符串    | 否       | -                   |
| query                                | 字符串    | 否       | -                   |
| compatible_mode                      | 字符串    | 否       | -                   |
| database                              | 字符串    | 否       | -                   |
| table                                | 字符串    | 否       | -                   |
| primary_keys                         | 数组      | 否       | -                   |
| support_upsert_by_query_primary_key_exist | 布尔      | 否       | false               |
| connection_check_timeout_sec         | 整数      | 否       | 30                  |
| max_retries                          | 整数      | 否       | 0                   |
| batch_size                           | 整数      | 否       | 1000                |
| is_exactly_once                      | 布尔      | 否       | false               |
| generate_sink_sql                    | 布尔      | 否       | false               |
| xa_data_source_class_name             | 字符串    | 否       | -                   |
| max_commit_attempts                   | 整数      | 否       | 3                   |
| transaction_timeout_sec              | 整数      | 否       | -1                  |
| auto_commit                           | 布尔      | 否       | true                |
| common-options                        | 无        | 否       | -                   |

请用实际的配置值替换上述选项中的 `${...}` 部分。

- `driver` [字符串]
  用于连接到远程数据源的 JDBC 类名，如果使用 MySQL，则值为 `com.mysql.cj.jdbc.Driver`。

- `user` [字符串]
  用户名。

- `password` [字符串]
  密码。

- `url` [字符串]
  JDBC 连接的 URL。例如：`jdbc:postgresql://localhost/test`。

- `query` [字符串]
  使用此 SQL 将上游输入数据写入数据库。例如，`INSERT ...`。

- `compatible_mode` [字符串]
  数据库的兼容模式，在数据库支持多个兼容模式时需要设置。例如，使用 OceanBase 数据库时，需要设置为 `'mysql'` 或 `'oracle'`。对于 Postgres 9.5 版本或更低版本，请将其设置为 `'postgresLow'` 以支持 CDC。

- `database` [字符串]
  使用此数据库和表名自动生成 SQL，并接收上游输入数据写入数据库。此选项与 `query` 互斥，并具有更高的优先级。

- `table` [字符串]
  使用数据库和此表名自动生成 SQL，并接收上游输入数据写入数据库。此选项与 `query` 互斥，并具有更高的优先级。

- `primary_keys` [数组]
  此选项用于在自动生成 SQL 时支持插入、删除和更新等操作。

- `support_upsert_by_query_primary_key_exist` [布尔]
  选择基于查询主键是否存在使用 INSERT SQL、UPDATE SQL 来处理更新事件（INSERT、UPDATE_AFTER）。此配置仅在数据库不支持 upsert 语法时使用。注意：此方法性能较低。

- `connection_check_timeout_sec` [整数]
  用于等待用于验证连接的数据库操作完成的时间（以秒为单位）。

- `max_retries` [整数]
  用于提交失败的重试次数（executeBatch）。

- `batch_size` [整数]
  用于批量写入，当缓冲记录数达到 `batch_size` 或时间达到 `checkpoint.interval` 时，数据将刷新到数据库。

- `is_exactly_once` [布尔]
  是否启用精确一次传输语义，这将使用 XA 事务。如果启用，需要设置 `xa_data_source_class_name`。

- `generate_sink_sql` [布尔]
  根据要写入的数据库表生成 SQL 语句。

- `xa_data_source_class_name` [字符串]
  数据库驱动程序的 XA 数据源类名，例如，MySQL 为 `com.mysql.cj.jdbc.MysqlXADataSource`，其他数据源请参考附录。

- `max_commit_attempts` [整数]
  事务提交失败的重试次数。

- `transaction_timeout_sec` [整数]
  事务打开后的超时时间，默认为 -1（永不超时）。请注意，设置超时可能会影响精确一次传输语义。

- `auto_commit` [布尔]
  默认启用自动事务提交。

- `common options` [无]
  汇聚插件的常见参数，请参考[汇聚插件常见选项](#sink-common-options)以获取详细信息。


注意事项
在 `is_exactly_once = "true"` 的情况下，将使用 XA 事务。这需要数据库的支持，而某些数据库可能需要一些设置：
1. 对于 PostgreSQL，需要设置 `max_prepared_transactions > 1`，例如 `ALTER SYSTEM set max_prepared_transactions to 10`。
2. MySQL 版本需要 >= 8.0.29，并且非 root 用户需要授予 XA_RECOVER_ADMIN 权限，例如 `grant XA_RECOVER_ADMIN on test_db.* to 'user1'@'%'`。
3. 对于 MySQL，可以尝试在 URL 中添加 `rewriteBatchedStatements=true` 参数以获得更好的性能。

# 附录

以下是一些参数的参考值。

| 数据源   | 驱动程序                           | URL                                              | XA 数据源类名                                | Maven 地址                                                   |
|----------|------------------------------------|--------------------------------------------------|---------------------------------------------|--------------------------------------------------------------|
| MySQL    | com.mysql.cj.jdbc.Driver            | jdbc:mysql://localhost:3306/test                  | com.mysql.cj.jdbc.MysqlXADataSource          | [MySQL Connector/J](https://mvnrepository.com/artifact/mysql/mysql-connector-java) |
| PostgreSQL | org.postgresql.Driver             | jdbc:postgresql://localhost:5432/postgres         | org.postgresql.xa.PGXADataSource            | [PostgreSQL JDBC](https://mvnrepository.com/artifact/org.postgresql/postgresql) |
| DM       | dm.jdbc.driver.DmDriver             | jdbc:dm://localhost:5236                         | dm.jdbc.driver.DmdbXADataSource             | [DmJdbcDriver18](https://mvnrepository.com/artifact/com.dameng/DmJdbcDriver18) |
| Phoenix  | org.apache.phoenix.queryserver.client.Driver | jdbc:phoenix:thin:url=http://localhost:8765;serialization=PROTOBUF | /                                           | [ali-phoenix-shaded-thin-client](https://mvnrepository.com/artifact/com.aliyun.phoenix/ali-phoenix-shaded-thin-client) |
| SQL Server | com.microsoft.sqlserver.jdbc.SQLServerDriver | jdbc:sqlserver://localhost:1433                   | com.microsoft.sqlserver.jdbc.SQLServerXADataSource | [Microsoft SQL Server JDBC Driver](https://mvnrepository.com/artifact/com.microsoft.sqlserver/mssql-jdbc) |
| Oracle   | oracle.jdbc.OracleDriver           | jdbc:oracle:thin:@localhost:1521/xepdb1           | oracle.jdbc.xa.OracleXADataSource           | [Oracle JDBC Driver](https://mvnrepository.com/artifact/com.oracle.database.jdbc/ojdbc8) |
| SQLite   | org.sqlite.JDBC                    | jdbc:sqlite:test.db                              | /                                           | [SQLite JDBC](https://mvnrepository.com/artifact/org.xerial/sqlite-jdbc) |
| GBase8a  | com.gbase.jdbc.Driver              | jdbc:gbase://e2e_gbase8aDb:5258/test               | /                                           | [gbase-connector-java](https://www.gbase8.cn/wp-content/uploads/2020/10/gbase-connector-java-8.3.81.53-build55.5.7-bin_min_mix.jar) |
| StarRocks | com.mysql.cj.jdbc.Driver           | jdbc:mysql://localhost:3306/test                  | /                                           | [MySQL Connector/J](https://mvnrepository.com/artifact/mysql/mysql-connector-java) |
| DB2      | com.ibm.db2.jcc.DB2Driver          | jdbc:db2://localhost:50000/testdb                 | com.ibm.db2.jcc.DB2XADataSource             | [IBM Data Server Driver for JDBC and SQLJ](https://mvnrepository.com/artifact/com.ibm.db2.jcc/db2jcc/db2jcc4) |
| SAP HANA | com.sap.db.jdbc.Driver              | jdbc:sap://localhost:39015                        | /                                           | [SAP HANA JDBC Driver](https://mvnrepository.com/artifact/com.sap.cloud.db.jdbc/ngdbc) |
| Doris    | com.mysql.cj.jdbc.Driver            | jdbc:mysql://localhost:3306/test                  | /                                           | [MySQL Connector/J](https://mvnrepository.com/artifact/mysql/mysql-connector-java) |
| Teradata | com.teradata.jdbc.TeraDriver        | jdbc:teradata://localhost/DBS_PORT=1025,DATABASE=test | /                                        | [Teradata JDBC Driver](https://mvnrepository.com/artifact/com.teradata.jdbc/terajdbc) |
| Redshift | com.amazon.redshift.jdbc42.Driver  | jdbc:redshift://localhost:5439/testdb             | com.amazon.redshift.xa.RedshiftXADataSource | [Amazon Redshift JDBC Driver](https://mvnrepository.com/artifact/com.amazon.redshift/redshift-jdbc42) |
| Snowflake | net.snowflake.client.jdbc.SnowflakeDriver | jdbc:snowflake://<account_name>.snowflakecomputing.com | /                                        | [Snowflake JDBC Driver](https://mvnrepository.com/artifact/net.snowflake/snowflake-jdbc) |
| Vertica  | com.vertica.jdbc.Driver            | jdbc:vertica://localhost:5433                     | /                                           | [Vertica JDBC Driver](https://repo1.maven.org/maven2/com/vertica/jdbc


示例

简单示例：

```conf
jdbc {
    url = "jdbc:mysql://localhost:3306/test"
    driver = "com.mysql.cj.jdbc.Driver"
    user = "root"
    password = "123456"
    query = "insert into test_table(name,age) values(?,?)"
}
```

精确一次传输示例：

```conf
jdbc {
    url = "jdbc:mysql://localhost:3306/test"
    driver = "com.mysql.cj.jdbc.Driver"
    max_retries = 0
    user = "root"
    password = "123456"
    query = "insert into test_table(name,age) values(?,?)"
    is_exactly_once = "true"
    xa_data_source_class_name = "com.mysql.cj.jdbc.MysqlXADataSource"
}
```

CDC（变更数据捕获）事件示例：

```conf
sink {
    jdbc {
        url = "jdbc:mysql://localhost:3306"
        driver = "com.mysql.cj.jdbc.Driver"
        user = "root"
        password = "123456"
        database = "sink_database"
        table = "sink_table"
        primary_keys = ["key1", "key2", ...]
    }
}
```

PostgreSQL 9.5 版本以下支持 CDC（变更数据捕获）事件示例：

```conf
sink {
    jdbc {
        url = "jdbc:postgresql://localhost:5432"
        driver = "org.postgresql.Driver"
        user = "root"
        password = "123456"
        compatible_mode = "postgresLow"
        database = "sink_database"
        table = "sink_table"
        support_upsert_by_query_primary_key_exist = true
        generate_sink_sql = true
        primary_keys = ["key1", "key2", ...]
    }
}
```

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/connector-v2/sink/Mysql

https://seatunnel.apache.org/docs/2.3.3/connector-v2/sink/Jdbc/

* any list
{:toc}