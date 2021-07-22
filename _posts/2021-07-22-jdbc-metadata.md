---
layout: post
title: 从代码生成说起，带你深入理解 mybatis generator 源码
date: 2018-11-21 8:01:55 +0800
categories: [JDBC]
tags: [jdbc, open-source, source-code, sh]
published: true
---

# 枯燥的任务

这一切都要从多年前说起。

那时候刚入职一家新公司，项目经理给我分配了一个比较简单的工作，为所有的数据库字段整理一张元数据表。

因为很多接手的项目文档都不全，所以需要统一整理一份基本的字典表。

如果是你，你会怎么处理这个任务呢？

## 重复的工作

一开始我是直接准备人工把所有的字段整理一遍，然后整理出对应的 SQL 插入到元数据库管理表中。

meta_table 元数据表信息

meta_field 元数据字段信息

一开始还有点激情，后来就是无尽的重复，感觉十分无聊。

于是，我自己动手写了一个开源的小工具。

> [https://github.com/houbb/metadata](https://github.com/houbb/metadata)

# 元数据管理

metadata 可以自动将所有的表信息和字段信息存入元数据表中，便于统一查阅。

(注释需要保证库本身已经包含了对于表和字段的注释)

## 数据库表设计

一开始实现了 3 种常见的数据库：mysql oracle sql-server。

以 mysql 为例，对应的建表语句为：

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
   dbObjectName         varchar(36) comment '数据库表名',
   alias                varchar(125) comment '别名',
   description          varchar(255) comment '描述',
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
   dbObjectName         varchar(36) comment '数据库表名',
   alias                varchar(125) comment '别名',
   description          varchar(255) comment '描述',
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

## 数据初始化

metadata 是一个 web 应用，部署启动后，页面指定数据库连接信息，就可以完成所有数据的初始化。

![metadata](https://img-blog.csdnimg.cn/8cee33c32bcc4cab8c77bb1787f1aa7f.png)

以测试脚本

```sql
CREATE DATABASE `metadata-test`
  DEFAULT CHARACTER SET UTF8;
USE `metadata-test`;

CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '唯一标识',
  `username` varchar(255) DEFAULT NULL COMMENT '用户名',
  `password` varchar(255) DEFAULT NULL COMMENT '密码',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=UTF8 COMMENT='用户表';
```

为例，可以将对应的表和字段信息全部初始化到对应的表中。

一切看起来都很棒，几分钟就搞定了。不是吗？

# 代码自动生成

本来 metadata 没有意外的话，我几乎不会再去修改他了。

直接前不久，我基于 mybatis-plus-generator 实现了一个代码自动生成的低代码平台。

开源地址如下：

> [http://github.com/houbb/low-code](http://github.com/houbb/low-code)

我发现了 metadata 这个应用虽然作为 web 应用还不错，但是本身的复用性很差，我无法在这个基础上实现一个代码生成工具。

于是，就诞生了实现一个最基础的 jdbc 元数据管理工具的想法。

他山之石，可以攻玉。

我们就直接以 MPG 的源码为例，学习并且改造。

# 数据库元数据

## 核心原理

元数据管理最核心的一点在于所有的数据库本身就有元数据管理。

我们以 mysql 为例，查看所有表信息。

```sql
show table status;
```

如下：

```
+------+--------+---------+------------+------+----------------+-------------+-----------------+--------------+-----------+----------------+---------------------+-------------+------------+-----------------+----------+----------------+--------------+
| Name | Engine | Version | Row_format | Rows | Avg_row_length | Data_length | Max_data_length | Index_length | Data_free | Auto_increment | Create_time         | Update_time | Check_time | Collation       | Checksum | Create_options | Comment      |
+------+--------+---------+------------+------+----------------+-------------+-----------------+--------------+-----------+----------------+---------------------+-------------+------------+-----------------+----------+----------------+--------------+
| word | InnoDB |      10 | Compact    |    0 |              0 |       16384 |               0 |            0 |         0 |              1 | 2021-07-22 19:39:13 | NULL        | NULL       | utf8_general_ci |     NULL |                | 敏 感词表     |
+------+--------+---------+------------+------+----------------+-------------+-----------------+--------------+-----------+----------------+---------------------+-------------+------------+-----------------+----------+----------------+--------------+
1 row in set (0.00 sec)
```

对应的字段信息查看

```sql
show full fields from word;
```

输出如下：

```
mysql> show full fields from word;
+-------------+------------------+-----------------+------+-----+-------------------+-----------------------------+---------------------------------+--------------------+
| Field       | Type             | Collation       | Null | Key | Default           | Extra                       | Privileges                      | Comment            |
+-------------+------------------+-----------------+------+-----+-------------------+-----------------------------+---------------------------------+--------------------+
| id          | int(10) unsigned | NULL            | NO   | PRI | NULL              | auto_increment              | select,insert,update,references | 应用自增主键       |
| word        | varchar(128)     | utf8_general_ci | NO   | UNI | NULL              |                             | select,insert,update,references | 单词               |
| type        | varchar(8)       | utf8_general_ci | NO   |     | NULL              |                             | select,insert,update,references | 类型               |
| status      | char(1)          | utf8_general_ci | NO   |     | S                 |                             | select,insert,update,references | 状态               |
| remark      | varchar(64)      | utf8_general_ci | NO   |     |                   |                             | select,insert,update,references | 配置描述           |
| operator_id | varchar(64)      | utf8_general_ci | NO   |     | system            |                             | select,insert,update,references | 操作员名称         |
| create_time | timestamp        | NULL            | NO   |     | CURRENT_TIMESTAMP |                             | select,insert,update,references | 创建时间戳         |
| update_time | timestamp        | NULL            | NO   |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP | select,insert,update,references | 更新时间戳         |
+-------------+------------------+-----------------+------+-----+-------------------+-----------------------------+---------------------------------+--------------------+
8 rows in set (0.01 sec)
```

可以获取到非常全面的信息，**代码生成就是基于这些基本信息，生成对应的代码文本**。

其中，word 的建表语句如下：

```sql
create table word
(
    id int unsigned auto_increment comment '应用自增主键' primary key,
    word varchar(128) not null comment '单词',
    type varchar(8) not null comment '类型',
    status char(1) not null default 'S' comment '状态',
    remark varchar(64) not null comment '配置描述' default '',
    operator_id varchar(64) not null default 'system' comment '操作员名称',
    create_time timestamp default CURRENT_TIMESTAMP not null comment '创建时间戳',
    update_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间戳'
) comment '敏感词表' ENGINE=Innodb default charset=UTF8 auto_increment=1;
create unique index uk_word on word (word) comment '唯一索引';
```

## 拓展性

虽然上面介绍元数据获取，是以 mysql 为例。

但是我们在实现工具的时候，一定要考虑对应的可拓展性。

可以是 mysql，也可以是常见的 oracle/sql-server。

每一种数据库的获取方式都是不同的，所以需要根据配置不同，实现也要不同。

获取到元数据之后，处理的方式也可以非常多样化。

可以控台输出，可以入库，可以生成对应的 markdown/html/pdf/word/excel 不同形式的文档等。

## 易用性

好的工具，应该对用户屏蔽复杂的实现细节。

用户只需要简单的指定配置信息，想要获取的表，处理方式即可。

至于如何实现，用户可以不关心。

# 源码实现

接下来，我们结合 MPG 的源码，抽取最核心的部分进行讲解。

## 获取数据库连接

如何根据连接信息获取 connection？

希望经常使用 mybatis 等工具的你还记得：

```java
public class DbConnection implements IDbConnection {

    /**
     * 驱动连接的URL
     */
    private String url;
    /**
     * 驱动名称
     */
    private String driverName;
    /**
     * 数据库连接用户名
     */
    private String username;
    /**
     * 数据库连接密码
     */
    private String password;

    //getter&setter

    @Override
    public Connection getConnection() {
        Connection conn = null;
        try {
            Class.forName(driverName);
            conn = DriverManager.getConnection(url, username, password);
        } catch (ClassNotFoundException | SQLException e) {
            throw new JdbcMetaException(e);
        }
        return conn;
    }

}
```

IDbConnection 接口的定义非常简单：

```java
public interface IDbConnection {

    /**
     * 获取数据库连接
     * @return 连接
     * @since 1.0.0
     */
    Connection getConnection();

}
```

这样便于后期替换实现，你甚至可以使用数据库连接池：

> [https://github.com/houbb/jdbc-pool](https://github.com/houbb/jdbc-pool)

## 元数据查询脚本

对于不同的数据库，查询的方式不同。

以 mysql 为例，实现如下：

```java
public class MySqlQuery extends AbstractDbQuery {

    @Override
    public DbType dbType() {
        return DbType.MYSQL;
    }


    @Override
    public String tablesSql() {
        return "show table status";
    }


    @Override
    public String tableFieldsSql() {
        return "show full fields from `%s`";
    }


    @Override
    public String tableName() {
        return "NAME";
    }


    @Override
    public String tableComment() {
        return "COMMENT";
    }


    @Override
    public String fieldName() {
        return "FIELD";
    }


    @Override
    public String fieldType() {
        return "TYPE";
    }


    @Override
    public String fieldComment() {
        return "COMMENT";
    }


    @Override
    public String fieldKey() {
        return "KEY";
    }


    @Override
    public boolean isKeyIdentity(ResultSet results) throws SQLException {
        return "auto_increment".equals(results.getString("Extra"));
    }

    @Override
    public String nullable() {
        return "Null";
    }

    @Override
    public String defaultValue() {
        return "Default";
    }

}
```

其中 `show table status` 用于查看所有的表元数据；`show full fields from %s` 可以查看具体表的字段元数据。

nullable() 和 defaultValue() 这两个属性是老马新增的，MPG 中是没有的，因为代码生成不关心这两个字段。

## 核心实现

做好上面的准备工作之后，我们可以开始进行核心代码编写。

```java
@Override
public List<TableInfo> getTableList(TableInfoContext context) {
    // 连接
    Connection connection = getConnection(context);

    DbType dbType = DbTypeUtils.getDbType(context.getDriverName());
    IDbQuery dbQuery = DbTypeUtils.getDbQuery(dbType);

    // 构建元数据查询 SQL
    String tableSql = buildTableSql(context);

    // 执行查询
    List<TableInfo> tableInfoList = queryTableInfos(connection, tableSql, dbQuery, context);
    return tableInfoList;
}
```

### 具体数据库实现

具体数据库的实现是不同的，可以根据 driverName 获取。

DbTypeUtils 的实现如下：

```java
/**
 * @author binbin.hou
 * @since 1.0.0
 */
public final class DbTypeUtils {

    private DbTypeUtils(){}

    /**
     * 根据驱动获取 dbType
     * @param driverName 驱动信息
     * @return 结果
     * @since 1.1.0
     */
    public static DbType getDbType(final String driverName) {
        DbType dbType = null;
        if (driverName.contains("mysql")) {
            dbType = DbType.MYSQL;
        } else if (driverName.contains("oracle")) {
            dbType = DbType.ORACLE;
        } else if (driverName.contains("postgresql")) {
            dbType = DbType.POSTGRE_SQL;
        } else {
            throw new JdbcMetaException("Unknown type of database!");
        }

        return dbType;
    }

    /**
     * 获取对应的数据库查询类型
     * @param dbType 数据库类型
     * @return 结果
     * @since 1.0.0
     */
    public static IDbQuery getDbQuery(final DbType dbType) {
        IDbQuery dbQuery = null;
        switch (dbType) {
            case ORACLE:
                dbQuery = new OracleQuery();
                break;
            case SQL_SERVER:
                dbQuery = new SqlServerQuery();
                break;
            case POSTGRE_SQL:
                dbQuery = new PostgreSqlQuery();
                break;
            default:
                // 默认 MYSQL
                dbQuery = new MySqlQuery();
                break;
        }
        return dbQuery;
    }

}
```

### 表数据查询 sql

根据对应的 IDbQuery 构建表数据查询的 sql。

```java
/**
 * 构建 table sql
 * @param context 上下文
 * @return 结果
 * @since 1.0.0
 */
private String buildTableSql(final TableInfoContext context) {
    // 获取 dbType & DbQuery
    final String jdbcUrl = context.getDriverName();
    DbType dbType = DbTypeUtils.getDbType(jdbcUrl);
    IDbQuery dbQuery = DbTypeUtils.getDbQuery(dbType);
    String tablesSql = dbQuery.tablesSql();
    if (DbType.POSTGRE_SQL == dbQuery.dbType()) {
        //POSTGRE_SQL 使用
        tablesSql = String.format(tablesSql, "public");
    }
    
    // 简化掉 oracle 的特殊处理

    return tablesSql;
}
```

直接获取对应的 tablesSql 即可，非常简答。

### 表信息构建

直接根据构建好的 tableSql 查询，然后构建最基本的表信息。

```java
try(PreparedStatement preparedStatement = connection.prepareStatement(tablesSql);) {
    List<TableInfo> tableInfoList = new ArrayList<>();
    ResultSet results = preparedStatement.executeQuery();
    TableInfo tableInfo;
    while (results.next()) {
        String tableName = results.getString(dbQuery.tableName());
        if (StringUtil.isNotEmpty(tableName)) {
            String tableComment = results.getString(dbQuery.tableComment());
            tableInfo = new TableInfo();
            tableInfo.setName(tableName);
            tableInfo.setComment(tableComment);
            tableInfoList.add(tableInfo);
        } else {
            System.err.println("当前数据库为空！！！");
        }
    }
} catch (SQLException e) {
    throw new JdbcMetaException(e);
}
```

此处省去对表信息的过滤。

### 字段信息构建

表信息构建为完成后，构建具体的字段信息。

```java
try {
    String tableFieldsSql = dbQuery.tableFieldsSql();
    if (DbType.POSTGRE_SQL == dbQuery.dbType()) {
        tableFieldsSql = String.format(tableFieldsSql, "public", tableInfo.getName());
    } else {
        tableFieldsSql = String.format(tableFieldsSql, tableInfo.getName());
    }
    PreparedStatement preparedStatement = connection.prepareStatement(tableFieldsSql);
    ResultSet results = preparedStatement.executeQuery();
    while (results.next()) {
        TableField field = new TableField();

        // 省略 ID 相关的处理
        // 省略自定义字段查询
        
        // 处理其它信息
        field.setName(results.getString(dbQuery.fieldName()));
        field.setType(results.getString(dbQuery.fieldType()));
        String propertyName = getPropertyName(field.getName());
        DbColumnType dbColumnType = typeConvert.getTypeConvert(field.getType());
        field.setPropertyName(propertyName);
        field.setColumnType(dbColumnType);
        field.setComment(results.getString(dbQuery.fieldComment()));
        field.setNullable(results.getString(dbQuery.nullable()));
        field.setDefaultValue(results.getString(dbQuery.defaultValue()));
        fieldList.add(field);
    }
} catch (SQLException e) {
    throw new JdbcMetaException(e);
}
```

字段信息的实现也比较简单，直接根据对应的 sql 进行查询，然后构建即可。

## 结果的处理

在经过大量的删减之后，我们可以获取最基础的表元数据信息。

但是要怎么处理这个列表信息呢？

我们可以定义一个接口：

```java
public interface IResultHandler {

    /**
     * 处理
     * @param context 上下文
     * @since 1.0.0
     */
    void handle(final IResultHandlerContext context);

}
```

context 的属性比较简单，目前就是 `List<TableInfo>`。

我们可以实现一个控台输出：

```java
public class ConsoleResultHandler implements IResultHandler {

    @Override
    public void handle(IResultHandlerContext context) {
        List<TableInfo> tableInfoList = context.tableInfoList();

        for(TableInfo tableInfo : tableInfoList) {
            // 数据
            System.out.println("> " + tableInfo.getName() + " " + tableInfo.getComment());
            System.out.println();

            List<TableField> tableFields = tableInfo.getFields();
            System.out.println("| 序列 | 列名 | 类型 | 是否为空 | 缺省值 | 描述 |");
            System.out.println("|:---|:---|:---|:---|:---|:---|");
            String format = "| %d | %s | %s | %s | %s | %s |";
            int count = 1;
            for (TableField field : tableFields) {
                String info = String.format(format, count, field.getName(),
                        field.getType(), field.getNullable(), field.getDefaultValue(),
                        field.getComment());
                System.out.println(info);
                count++;
            }
            System.out.println("\n\n");
        }
    }

}
```

在控台输出对应的 markdown 字段信息。

你也可以实现自己的 html/pdf/word/excel 等等。

# 测试验证

我们前面写了这么多主要是原理实现。

那么工具是否好用，还是要体验一下。

## 测试代码

```java
JdbcMetadataBs.newInstance()
                .url("jdbc:mysql://127.0.0.1:3306/test")
                .includes("word")
                .execute();
```

指定输出 test.word 的表信息。

## 效果

对应的日志如下：

```
> word 敏感词表

| 序列 | 列名 | 类型 | 是否为空 | 缺省值 | 描述 |
|:---|:---|:---|:---|:---|:---|
| 1 | id | int(10) unsigned | NO | null | 应用自增主键 |
| 2 | word | varchar(128) | NO | null | 单词 |
| 3 | type | varchar(8) | NO | null | 类型 |
| 4 | status | char(1) | NO | S | 状态 |
| 5 | remark | varchar(64) | NO |  | 配置描述 |
| 6 | operator_id | varchar(64) | NO | system | 操作员名称 |
| 7 | create_time | timestamp | NO | CURRENT_TIMESTAMP | 创建时间戳 |
| 8 | update_time | timestamp | NO | CURRENT_TIMESTAMP | 更新时间戳 |
```

这个就是简单的 markdown 格式，实际效果如下：

> word 敏感词表

| 序列 | 列名 | 类型 | 是否为空 | 缺省值 | 描述 |
|:---|:---|:---|:---|:---|:---|
| 1 | id | int(10) unsigned | NO | null | 应用自增主键 |
| 2 | word | varchar(128) | NO | null | 单词 |
| 3 | type | varchar(8) | NO | null | 类型 |
| 4 | status | char(1) | NO | S | 状态 |
| 5 | remark | varchar(64) | NO |  | 配置描述 |
| 6 | operator_id | varchar(64) | NO | system | 操作员名称 |
| 7 | create_time | timestamp | NO | CURRENT_TIMESTAMP | 创建时间戳 |
| 8 | update_time | timestamp | NO | CURRENT_TIMESTAMP | 更新时间戳 |

这样，我们就拥有了一个最简单的 jdbc 元数据管理工具。

当然，这个只是 v1.0.0 版本，后续还有许多特性需要添加。

# 小结

MPG 基本上每一个使用 mybatis 必备的工具，大大提升了我们的效率。

知道对应的实现原理，可以让我们更好的使用它，并且在其基础上，实现自己的脑洞。

我是老马，期待与你的下次重逢。

备注：涉及的代码较多，文中做了简化。若你对源码感兴趣，可以關註{老马啸西风}，後臺回復{代码生成}即可获得。

# 参考资料

[聊聊API网关的作用](https://www.cnblogs.com/coolfiry/p/8193768.html)

* any list
{:toc}