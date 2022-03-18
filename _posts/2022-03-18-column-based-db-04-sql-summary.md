---
layout: post
title: 列式数据库-04-sql summary 
date: 2022-03-18 21:01:55 +0800 
categories: [Database]
tags: [database, monetdb, column-based-db, sh]
published: true
---

# CREATE SCHEMA

```sql
CREATE SCHEMA [ IF NOT EXISTS ] [ schema_name ]
    [ AUTHORIZATION auth_name ]
    [ DEFAULT CHARACTER SET character_set_name ]
    [ PATH schema_name [, schema_name] [, ... ] ]
    [ schema_element [, schema_element] [, ... ] ]

   schema_element:
        create_statement | alter_statement | drop_statement | grant | revoke
```

创建一个新的 schema。

例子：

```sql
CREATE SCHEMA tst;
CREATE SCHEMA AUTHORIZATION hrm;
CREATE SCHEMA hr AUTHORIZATION hrm;
SET SCHEMA tst;
SELECT CURRENT_SCHEMA;
```

注意：您必须指定 schema_name 或 auth_name 或两者，请参阅示例。 

auth_name 可以是现有角色或用户名。 架构的所有权只能分配给一个用户/角色，并且在创建后无法修改。 

因此，要共享模式的所有权，必须在创建模式时将模式的所有权分配给角色。 

随后，可以将该角色授予多个用户以拥有该模式。 只有“monetdb”用户和“sysadmin”角色可以创建新模式。 

因此，为了允许其他用户创建模式，“monetdb”用户应将“sysadmin”角色分配给预期用户。 DEFAULT CHARACTER SET 和 PATH 选项（尚未）实现，这里是出于与 SQL 标准的兼容性原因。 默认字符集为 UTF-8 且不可更改。

有关详细信息，请参阅：SchemaDefinitions，

另请参阅：SET SCHEMA CURRENT_SCHEMA、COMMENT ON SCHEMA、DROP SCHEMA。

关联的系统表：sys.schemas。

# ALTER SCHEMA

```
ALTER SCHEMA [ IF NOT EXISTS ] schema_name RENAME TO new_schema_name
```

例子：

```sql
CREATE SCHEMA tst;
ALTER SCHEMA tst RENAME TO tst2;
```

仅当不存在依赖于模式名称的对象（例如表、视图、函数等）时，才允许更改模式的名称。

有关详细信息，请参阅：SchemaDefinitions。

另请参阅：SET SCHEMA、CURRENT_SCHEMA、COMMENT ON SCHEMA、DROP SCHEMA。

关联的系统表：sys.schemas。

# CREATE SEQUENCE

```sql
CREATE SEQUENCE [ schema_name . ] sequence_name
    [ AS datatype ]
    [ START WITH bigint# ]
    [ INCREMENT BY bigint# ]
    [ MINVALUE bigint# | NO MINVALUE ]
    [ MAXVALUE bigint# | NO MAXVALUE ]
    [ CACHE bigint# ]
    [ [ NO ] CYCLE ]
```

定义一个新的整数序列生成器

有关详细信息，请参阅：SerialDataTypes。

另请参阅：ALTER SEQUENCE、COMMENT ON SEQUENCE、NEXT VALUE FOR、DROP SEQUENCE。

关联系统表：sys.sequences。

# CREATE TABLE

```sql
CREATE TABLE [ IF NOT EXISTS ] [ schema_name . ] table_name
    ( column_definition(s)_and_optional_table-constraints_list )
```

定义一个包含数据完整性约束的新表

注意：警告：列检查约束定义被接受但不强制执行！ 它们也不存储在数据字典中，因此在使用 msqldump 时会丢失。 

您还可以使用 LIKE qname 作为列定义的一部分来复制 qname 的列定义（不包括其约束）。 

例如 

```sql
CREATE TABLE webshop.products_new (LIKE webshop.products, descr VARCHAR(9999), pict BLOB);
```

有关详细信息，请参阅：TableDefinitions 和：TableIElements。

参见：ALTER TABLE ADD COLUMN、ALTER TABLE ADD CONSTRAINT、COMMENT ON TABLE、COMMENT ON COLUMN、DROP TABLE。

关联系统表：sys.tables，其中 type = 0。

# CREATE TABLE AS

```sql
CREATE TABLE [ IF NOT EXISTS ] [ schema_name . ] table_name
    [ ( column_name [, column_name] [, ... ] ) ]
    AS SELECT_query
    [ WITH [ NO ] DATA ]
```

根据查询结果定义一个新表。 默认情况下，该表将填充查询的数据。 指定 WITH NO DATA 仅创建表。

注意：默认行为是 WITH DATA。

有关详细信息，请参阅：TableDefinitions 和：TableIElements

参见：ALTER TABLE ADD COLUMN、ALTER TABLE ADD CONSTRAINT、COMMENT ON TABLE、COMMENT ON COLUMN、DROP TABLE。

# CREATE TABLE FROM LOADER

```sql
CREATE TABLE [ IF NOT EXISTS ] [ schema_name . ] table_name
    FROM LOADER function_name ( [ arg1_val [ , arg2_val ] [, ... ] ] )
    [ WITH [ NO ] DATA ]
```

根据（Python）加载器函数的结果定义一个新表。

默认情况下，该表将填充加载器函数的数据。 

指定 WITH NO DATA 仅创建表。

注意：此命令是特定于 MonetDB 的。

有关详细信息，请参阅：Python 加载器

另请参阅：CREATE LOADER、COPY LOADER INTO FROM、COMMENT ON TABLE、COMMENT ON COLUMN、DROP TABLE。

关联系统表：sys.tables where type = 0

# CREATE MERGE TABLE

```sql
CREATE MERGE TABLE [ IF NOT EXISTS ] [ schema_name . ] table_name
    ( column_definition(s)_and_optional_table-constraints_list )
    [ PARTITION BY { RANGE | VALUES }  { ON ( column_name )  |  USING ( expression ) } ]
```

定义一个新的合并表来创建一个水平分区的表。

合并表在逻辑上组合了多个其他表（称为分区表，通过 ALTER TABLE merge_table ADD TABLE partition_table 添加）的数据，这些表都必须具有完全相同的表定义。

与组合多个 SELECT 查询（通过 UNION ALL）并可以更快地处理查询的视图相比，此合并表更容易使用新分区扩展/更改。

同样在指定“PARTITION BY”的情况下，虚拟合并表变得可更新，因此允许直接在合并表而不是分区表上插入、更新、删除和截断。

注意：此命令是特定于 MonetDB 的。有关详细信息，请参阅可更新合并表。使用普通的 DROP TABLE 语句删除合并表（包括其所有分区表信息，但不包括分区表）。没有 DROP MERGE TABLE 语句。

有关详细信息，请参阅：TableDataPartitioning 和可更新合并表以及：TableDefinitions。

参见：ALTER TABLE ADD TABLE、ALTER TABLE DROP TABLE、COMMENT ON TABLE、COMMENT ON COLUMN、DROP TABLE。

关联系统表：sys.tables where type = 3; sys.table_partitions。

# CREATE REMOTE TABLE

```sql
CREATE REMOTE TABLE [ IF NOT EXISTS ] [ schema_name . ] table_name
    ( column definition(s) )
    ON `'mapi:monetdb://host:port/dbname'`
    [ WITH [ USER 'user_login_name_nm' ]   [ [ ENCRYPTED ] PASSWORD 'password' ] ]
```

定义远程表的别名。 远程表必须是另一个正在运行的 MonetDB 服务器上的现有表远程表结构的定义必须与远程数据库中对应的定义完全匹配，因此相同的模式名称、相同的表名、相同的列名和相同的列数据 类型。 

远程服务器 URL 的格式必须符合：`mapi:monetdb://**_host_:_port_/_dbname_**`，其中必须指定所有三个参数（host、port 和 dbname）。

注意：此命令是特定于 MonetDB 的。 有关更多信息，请参阅此博客文章。 使用普通的 DROP TABLE 语句删除远程表定义。 没有 DROP REMOTE TABLE 语句。

有关详细信息，请参阅：DistributedQueryProcessing 和：TableDefinitions。

另请参阅：对表的评论、对列的评论、删除表。

关联系统表：sys.tables where type = 5


# CREATE REPLICA TABLE

```sql
CREATE REPLICA TABLE [ IF NOT EXISTS ] [ schema_name . ] table_name
    ( column_definition(s)_and_optional_table-constraints_list )
```

定义一个新的副本表

注意：此命令是特定于 MonetDB 的。 使用普通的 DROP TABLE 语句删除副本表。 没有 DROP REPLICA TABLE 语句。

有关详细信息，请参阅：TableDefinitions 和：TableElements。

另请参阅：对表的评论、对列的评论、删除表。

关联系统表：sys.tables where type = 6

# CREATE TEMPORARY TABLE

```sql
CREATE [ LOCAL | GLOBAL ] { TEMPORARY | TEMP } TABLE [ IF NOT EXISTS ] [ schema_name . ] table_name
    { ( column_definition(s)_and_optional_table-constraints_list )  |
      [ ( column_name [, column_name ] [, ... ] ) ] AS SELECT_query [ WITH [ NO ] DATA ] }
    [ ON COMMIT { DELETE ROWS | PRESERVE ROWS | DROP } ]
```

定义一个新的临时表。 

可以使用 GLOBAL 控制表对其他会话用户的可见性。 默认为本地。 

用户会话终止后，临时表将自动删除。 

如果未指定 ON COMMIT 子句，则默认行为是 ON COMMIT DELETE ROWS，符合 SQL 标准。 

当使用 AS SELECT ... 默认为 WITH DATA。

例子：

```sql
CREATE TEMP TABLE names (id int NOT NULL PRIMARY KEY, name VARCHAR(99) NOT NULL UNIQUE) ON COMMIT PRESERVE ROWS;
-- Note that temporary tables are implicitly assigned to schema: tmp
INSERT INTO tmp.names VALUES (1, 'one');
INSERT INTO tmp.names VALUES (2, 'two');
INSERT INTO tmp.names VALUES (2, 'dos');
-- Error: INSERT INTO: PRIMARY KEY constraint 'names.names_id_pkey' violated
INSERT INTO tmp.names VALUES (3, 'two');
-- Error: INSERT INTO: UNIQUE constraint 'names.names_name_unique' violated
INSERT INTO tmp.names VALUES (3, 'free');
SELECT * FROM tmp.names;
-- shows 3 rows
DROP TABLE tmp.names;

CREATE GLOBAL TEMP TABLE tmp.name_lengths (name, length)
 AS SELECT DISTINCT name, LENGTH(name) FROM sys.ids ORDER BY 1
 WITH DATA
 ON COMMIT PRESERVE ROWS;
SELECT * FROM tmp.name_lengths WHERE name ILIKE '%\\_id%' ESCAPE '\\';
SELECT COUNT(*) AS count_names, AVG(length) AS avg_name_length FROM tmp.name_lengths;
DROP TABLE tmp.name_lengths;
```

重要提示：在自动提交模式下工作时，指定 ON COMMIT PRESERVE ROWS 以保留行，因为默认行为是 ON COMMIT DELETE ROWS。 不能对临时表或其列添加注释。 使用普通的 DROP TABLE 语句删除临时表。 没有 DROP TEMPORARY TABLE 语句。

有关详细信息，请参阅：TableDefinitions 和：TableElements。

另请参阅：对表的评论、对列的评论、删除表。

关联系统表：sys.tables where type in (20, 30)

# CREATE INDEX

```sql
CREATE [ UNIQUE ] INDEX index_name ON [ schema_name . ] table_name ( column_name [, column_name ] [, ... ] )
```

在特定表的一个或多个列上定义新的二级索引

注意：尽管出于 SQL 合规性目的，MonetDB 解析器接受 CREATE INDEX 命令，但它目前不通过此 SQL 命令创建物理二级索引。 相反，MonetDB 在内部决定在 SQL 查询执行期间创建、保留和使用哪些列搜索加速器。 索引名称在表的模式中必须是唯一的。 您不能为索引指定架构。 它将被放置在与表相同的模式中。 

警告：**UNIQUE 关键字不强制执行唯一性约束。 要创建唯一约束，请改用：ALTER TABLE s.t ADD CONSTRAINT t_uc UNIQUE (c1, c2)。**

有关详细信息，请参阅：索引定义

另请参阅：创建有序索引、更改表添加约束、索引注释、删除索引。

关联系统表：sys.idxs

# CREATE IMPRINTS INDEX

```sql
CREATE IMPRINTS INDEX index_name ON [ schema_name . ] table_name ( column_name )
```

在数值列上，它创建一个索引，该索引在列数据段上存储元数据（最小值、最大值、空值）。 

在查询评估期间使用印记来限制数据访问，从而最大限度地减少内存流量。 

它可以加速具有列选择条件的查询（例如：AGE IS NULL OR AGE BETWEEN 25 AND 65）。 

存储开销只是被索引的列大小的几个百分点。

在字符串列上，它创建一个索引，通过使用快速预过滤算法来加速 LIKE 查询。 

它只能在只读表上创建（使用语法 ALTER TABLE foo SET READ ONLY 将表 foo 标记为只读），因为创建操作代价高昂。

例子：

```sql
CREATE IMPRINTS INDEX my_impr_idx ON myschema.mytable ( my_num_column );
```

注意：此命令是特定于 MonetDB 的。

印记索引是一种新型的实验列索引。

限制是：每个索引只能索引 1 列。 索引名称在表的模式中必须是唯一的。 您不能为索引指定架构。 它将被放置在与表相同的模式中。 对于字符串列，只能在只读表上创建索引。

警告：索引不会自动维护，并且在对列数据进行插入、删除或更新后将变为非活动状态。 使用普通的 DROP INDEX 语句删除印记索引。 没有 DROP IMPRINTS INDEX 语句。

有关详细信息，请参阅：索引定义

另请参阅：创建有序索引、创建索引、索引注释、删除索引。

关联系统表：sys.idxs、sys.storage

# CREATE ORDERED INDEX

```sql
CREATE ORDERED INDEX index_name ON [ schema_name . ] table_name ( column_name )
```

在特定表的一列上定义新的有序索引。 该索引是一个特殊的单列索引，其中的值按升序存储。 它可以加速具有列选择条件（例如：AGE >=18 或 AGE BETWEEN 18 AND 30）或需要排序的查询，例如使用 GROUP BY 时。

例子：

```sql
CREATE ORDERED INDEX my_ord_idx ON myschema.mytable ( my_column );
```

注意：此命令是特定于 MonetDB 的。 有序索引是一种新型的实验列索引。

限制：每个索引只能索引 1 列。 索引名称在表的模式中必须是唯一的。 您不能为索引指定架构。 它将被放置在与表相同的模式中。 2018 年 3 月 (11.29.3) 之前的版本仅允许对固定大小数据类型的列（因此不支持：char、varchar、clob、blob、url、json、inet 和 uuid）进行索引。

警告：索引不会自动维护，并且在对列数据进行插入、删除或更新后将变为非活动状态。 使用普通的 DROP INDEX 语句删除有序索引。 没有 DROP ORDERED INDEX 语句。

有关详细信息，请参阅：索引定义

另请参阅：创建印记索引、创建索引、评论索引、删除索引。

关联系统表：sys.idxs、sys.storage

# CREATE VIEW

```sql
CREATE [ OR REPLACE ] VIEW [ schema_name . ] view_name
    [ ( column_name [, column_name ] [, ... ] ) ]
    AS SELECT_query
    [ WITH CHECK OPTION ]
```

定义一个新的 SQL 视图。 视图是基于存储的 SELECT 查询的结果集的虚拟表。 

视图不物理存储数据。 

降低查询复杂性很有用，因为它可以包括连接、计算、联合、聚合。 

它可以提高标准化和可重用性，并用于控制数据访问，在应用程序和物理表之间提供抽象层，简化报告。

限制：视图不可更新。 “WITH CHECK OPTION”被接受以符合要求，但没有效果。 

不支持递归视图和可引用视图。 注意：支持 SELECT 查询中的“ORDER BY”子句。

有关详细信息，请参阅：查看定义

另请参阅：视图评论、列评论、下拉视图）。

关联系统表：sys.tables where type = 1

# CREATE AGGREGATE EXTERNAL

```sql
CREATE [ OR REPLACE ] AGGREGATE [ FUNCTION ] [ schema_name . ] aggregate_name ( [ arg1_nm_type [ , arg2_nm_type ] [, ... ] ] )
    RETURNS datatype
    EXTERNAL NAME  MAL_function_name
```

定义一个新的用户定义聚合函数，其实现是使用 MAL 和 C 在外部指定的

例子：

```sql
CREATE AGGREGATE quantile(val bigint, q double) RETURNS bigint EXTERNAL NAME "aggr"."quantile";
```

注意：此命令是特定于 MonetDB 的。 外部暗示语言 MAL。 要允许其他用户调用用户定义的聚合函数，您必须授予其他用户（或 PUBLIC）对该聚合函数的 EXECUTE 权限。

有关内置聚合函数，请参阅：AggregateFunctions

另请参阅：对聚合、授予特权、删除聚合、删除所有聚合的评论。

关联的系统表：sys.functions 其中 type = 3 和 language = 1

# CREATE AGGREGATE LANGUAGE

```sql
CREATE [ OR REPLACE ] AGGREGATE [ FUNCTION ] [ schema_name . ] aggregate_name ( [ arg1_nm_type [ , arg2_nm_type ] [, ... ] ] )
    RETURNS datatype
    LANGUAGE { C | CPP | R | PYTHON | PYTHON_MAP | PYTHON3 | PYTHON3_MAP }
    '{' function_body '}'
```

定义一个新的用户自定义聚合函数，其主体实现以特定脚本语言指定

例子：

```python
CREATE AGGREGATE python_aggregate(val INTEGER)
RETURNS INTEGER
LANGUAGE PYTHON {
    try:
        unique = numpy.unique(aggr_group)
        x = numpy.zeros(shape=(unique.size))
        for i in range(0, unique.size):
            x[i] = numpy.sum(val[aggr_group==unique[i]])
    except NameError:
        # aggr_group doesn't exist. no groups, aggregate on all data
        x = numpy.sum(val)
    return(x)
};
```

注意：此命令是特定于 MonetDB 的。支持的语言有：C、C++、R 和 Python。如果您的 Python 代码需要 Python 3 才能正常工作，请使用 PYTHON3 而不是 PYTHON。如果您的 Python 代码可以并行执行（使用多个线程）而没有副作用，请使用 PYTHON_MAP 而不是 PYTHON。 PYTHON3_MAP 的同上。注意：不再支持 Python 2 和语言关键字 PYTHON2 和 PYTHON2_MAP。对于语言 C 和 CPP，C/C++ 编译器必须在部署服务器上可用，并且 MonetDB 服务器以选项启动：--set embedded_c=true。对于语言 R，R 脚本解释器软件必须在部署服务器上可用，并且 MonetDB 服务器使用以下选项启动：--set embedded_r=true。对于语言 PYTHON，Python 脚本解释器软件必须在部署服务器上可用，并且 MonetDB 服务器使用以下选项启动：--set embedded_py=true 或 --set embedded_py=3。要允许其他用户调用用户定义的聚合函数，您必须授予其他用户（或 PUBLIC）对该聚合函数的 EXECUTE 权限。

有关详细信息，请参阅：JIT C/C++ UDF 和嵌入式 pythonnumpy 和嵌入式-r-monetdb

另请参阅：对聚合、授予特权、删除聚合、创建函数语言的评论。

关联系统表：sys.functions where type = 3 and language > 2； sys.function_languages

# CREATE FUNCTION

```sql
CREATE [ OR REPLACE ] FUNCTION [ schema_name . ] function_name ( [ arg1_nm_type [ , arg2_nm_type ] [, ... ] ] )
    RETURNS datatype
    BEGIN function_body END
```

定义一个新的用户定义函数

例子：

```sql
CREATE FUNCTION heapspace(tpe string, i bigint, w int) returns bigint
begin
 if tpe <> 'varchar' and tpe <> 'clob' then return 0;
 end if;
 return 10240 + i * w;
end;
```

注意：除了返回标量值（type = 1）外，还可以定义函数以返回 Table 作为数据类型（type = 5）。 要允许其他用户调用用户定义的函数，您必须授予其他用户（或 PUBLIC）对该函数的 EXECUTE 权限。

对于内置函数，请参阅：FunctionsAndOperators

另请参阅：对功能、授予特权、删除功能、删除所有功能的评论。

关联系统表：sys.functions，其中 type in (1,5) 和 language = 2

# CREATE FUNCTION EXTERNAL

```sql
CREATE [ OR REPLACE ] FUNCTION [ schema_name . ] function_name ( [ arg1_nm_type [ , arg2_nm_type ] [, ... ] ] )
    RETURNS datatype
    EXTERNAL NAME  MAL_function_name
```

定义一个新的用户定义函数，其实现是使用 MAL 和 C 在外部指定的

例子：

```sql
CREATE FUNCTION isa_uuid(s string) RETURNS boolean EXTERNAL NAME uuid."isaUUID";

CREATE OR REPLACE FUNCTION pcre_match(s string, pattern string) RETURNS boolean EXTERNAL NAME pcre."match";
CREATE OR REPLACE FUNCTION pcre_imatch(s string, pattern string) RETURNS boolean EXTERNAL NAME pcre."imatch";
CREATE OR REPLACE FUNCTION pcre_replace(s string, pattern string, repl string, flags string)
  RETURNS string EXTERNAL NAME pcre."replace";
CREATE OR REPLACE FUNCTION pcre_replacefirst(s string, pattern string, repl string, flags string)
  RETURNS string EXTERNAL NAME pcre."replace_first";
```

注意：此命令是特定于 MonetDB 的。 外部暗示语言 MAL。 

除了返回标量值（type = 1）外，还可以定义函数以返回 Table 作为数据类型（type = 5）。 

要允许其他用户调用用户定义的函数，您必须授予其他用户（或 PUBLIC）对该函数的 EXECUTE 权限。 

pcre 示例函数是从使用 PCRE 模式匹配复制而来的。

对于内置函数，请参阅：FunctionsAndOperators 和：UserDefinedFunctions

另请参阅：对函数的评论、授予特权、删除函数、创建函数、创建函数语言。

关联系统表：sys.functions，其中输入 (1,5) 和语言 = 1

# CREATE FUNCTION LANGUAGE

```sql
CREATE [ OR REPLACE ] FUNCTION [ schema_name . ] function_name ( [ arg1_nm_type [ , arg2_nm_type ] [, ... ] ] )
    RETURNS datatype
    LANGUAGE { C | CPP | R | PYTHON | PYTHON_MAP | PYTHON3 | PYTHON3_MAP }
    '{' function_body '}'
```

定义一个新的用户定义函数，其实现以特定脚本语言指定

注意：此命令是特定于 MonetDB 的。支持的语言有：C、C++、R 和 Python。如果您的 Python 代码需要 Python 3 才能正常工作，请使用 PYTHON3 而不是 PYTHON。

如果您的 Python 代码可以并行执行（使用多个线程）而没有副作用，请使用 PYTHON_MAP 而不是 PYTHON。 

PYTHON3_MAP 的同上。注意：不再支持 Python 2 和语言关键字 PYTHON2 和 PYTHON2_MAP。对于语言 C 和 CPP，C/C++ 编译器必须在部署服务器上可用，并且 MonetDB 服务器以选项启动：--set embedded_c=true。对于语言 R，R 脚本解释器软件必须在部署服务器上可用，并且 MonetDB 服务器使用以下选项启动：--set embedded_r=true。对于语言 PYTHON，Python 脚本解释器软件必须在部署服务器上可用，并且 MonetDB 服务器使用以下选项启动：--set embedded_py=true 或 --set embedded_py=3。除了返回标量值（type = 1）外，还可以定义函数以返回 Table 作为数据类型（type = 5）。要允许其他用户调用用户定义的函数，您必须授予其他用户（或 PUBLIC）对该函数的 EXECUTE 权限。

有关详细信息，请参阅：JIT C/C++ UDF 和嵌入式 pythonnumpy-monetdb 和嵌入式-r-monetdb 和 voter-classification-using-monetdbpython。

另请参阅：对函数的评论、授予特权、删除函数、创建聚合语言、创建加载程序。

关联系统表：sys.functions where type in (1,5) and language > 2; sys.function_languages。

# CREATE FILTER FUNCTION EXTERNAL

```sql
CREATE [ OR REPLACE ] FILTER [ FUNCTION ] [ schema_name . ] function_name ( [ arg1_nm_type [ , arg2_nm_type ] [, ... ] ] )
    RETURNS datatype
    EXTERNAL NAME  MAL_function_name
```

定义一个新的用户定义过滤器函数，其实现是使用 MAL 和 C 在外部指定的

例子：

```sql
CREATE FILTER FUNCTION "re_like"(val string, pat string) external name algebra."rexpr_like";
```

注意：此命令是特定于 MonetDB 的。 外部暗示语言 MAL。 要允许其他用户调用用户定义的过滤函数，您必须授予其他用户（或 PUBLIC）对该过滤函数的 EXECUTE 权限。

另请参阅：对过滤器功能、授予特权、删除过滤器功能、删除所有过滤器功能的评论。

关联的系统表：sys.functions，其中 type = 4 和 language = 1。

# CREATE LOADER

```sql
CREATE [ OR REPLACE ] LOADER [ FUNCTION ] [ schema_name . ] function_name ( [ arg1_nm_type [ , arg2_nm_type ] [, ... ] ] )
    LANGUAGE PYTHON
    '{' _python_code_with_emit.emit()function '}'
```

定义一个新的用户定义加载器函数，它的实现是用 Python 语言完成的。 例如，加载器函数可以从特定格式的外部文件读取数据，例如 XML、json、bson、ods、xlsx 等。

例子：

```sql
CREATE LOADER json_loader(filename STRING) LANGUAGE PYTHON {
    import json
    f = open(filename)
    emit.emit(json.load(f))
    f.close()
};
```

注意：此命令是特定于 MonetDB 的。 对于语言 PYTHON，Python 脚本解释器软件必须在部署服务器上可用，并且 MonetDB 服务器使用以下选项启动：`--set embedded_py=true` 或 `--set embedded_py=3`。 

要允许其他用户调用用户定义的加载程序函数，您必须授予其他用户（或 PUBLIC）对该加载程序函数的 EXECUTE 权限。

有关详细信息，请参阅：monetdbpython-loader。

另请参阅：对加载程序的评论、授予特权、删除加载程序、从加载程序创建表、将加载程序复制到从。

关联系统表：sys.functions，其中 type = 7 且 language > 2。

# CREATE PROCEDURE

```sql
CREATE [ OR REPLACE ] PROCEDURE [ schema_name . ] procedure_name ( [ arg1_nm_type [ , arg2_nm_type ] [, ... ] ] )
    BEGIN procedure_body END
```

定义一个新的用户定义过程

注意：要允许其他用户调用和执行用户定义的过程，您必须授予其他用户（或 PUBLIC）对该过程的 EXECUTE 权限。

详情见：程序。

另请参阅：对程序、声明、调用、授予特权、删除程序、删除所有程序的评论。

关联的系统表：sys.functions，其中 type = 2 和 language = 2。

# CREATE PROCEDURE EXTERNAL

```sql
CREATE [ OR REPLACE ] PROCEDURE [ schema_name . ] procedure_name ( [ arg1_nm_type [ , arg2_nm_type ] [, ... ] ] )
    EXTERNAL NAME  MAL_procedure_name
```

定义一个新的用户定义过程，其实现是使用 MAL 和 C 在外部指定的

例子：

```sql
CREATE PROCEDURE sys.createorderindex(sys string, tab string, col string) external name sql.createorderindex;
```

注意：此命令是特定于 MonetDB 的。 外部暗示语言 MAL。 要允许其他用户调用和执行用户定义的过程，您必须授予其他用户（或 PUBLIC）对该过程的 EXECUTE 权限。

详情见：程序。

另请参阅：COMMENT ON PROCEDURE、CALL、GRANT PRIVILEGES GRANT PRIVILEGES、DROP PROCEDURE、DROP ALL PROCEDURE。

关联的系统表：sys.functions，其中 type = 2 和 language = 1。

# CREATE WINDOW EXTERNAL

```sql
CREATE [ OR REPLACE ] WINDOW [ FUNCTION ] [ schema_name . ] window_name ( [ arg1_nm_type [ , arg2_nm_type ] [, ... ] ] )
    RETURNS datatype
    EXTERNAL NAME  MAL_function_name
```

使用 MAL 和 C 定义一个新的用户定义窗口函数，其实现是在外部指定的

例子：

```sql
CREATE OR REPLACE WINDOW stddev(val bigint) RETURNS double EXTERNAL NAME "sql"."stdevp";
```

注意：此命令是特定于 MonetDB 的。 外部暗示语言 MAL。 要允许其他用户调用用户定义的窗口函数，您必须授予其他用户（或 PUBLIC）对该窗口函数的 EXECUTE 权限。

有关内置窗口函数，请参阅：WindowFunctions。

另请参阅：评论窗口、授予特权、删除窗口、删除所有窗口。

关联的系统表：sys.functions，其中 type = 6 和 language = 1。

# CREATE TYPE EXTERNAL

```sql
CREATE TYPE [ schema_name . ] type_name
    EXTERNAL NAME  MAL type_name
```

声明一个新的用户定义数据类型。 必须在 C 代码和 MAL 脚本中从外部指定实现（结构、运算符和函数，包括标量和批量）。 

有关示例，请参见数据类型的 C 实现：inet、json、url 和 uuid。

注意：此命令是特定于 MonetDB 的。 外部暗示语言 MAL。

有关详细信息，请参阅：用户定义类型

另请参阅：DROP TYPE CREATE TABLE

关联系统表：sys.types 其中 eclass = 16。

# CREATE TRIGGER

```sql
CREATE [ OR REPLACE ] TRIGGER trigger_name
    { BEFORE | AFTER }
    { INSERT | DELETE | TRUNCATE | UPDATE [ OF column_name [, column_name] [, ... ] ] }
    ON [ schema_name . ] table_name
    [ REFERENCING { { OLD | NEW } { [ ROW ] | TABLE } [ AS ] ident } [...] ]
    [ FOR [ EACH ] { ROW | STATEMENT } ]
    [ WHEN ( search_condition ) ]
    { trigger_procedure_statement | BEGIN ATOMIC trigger_procedure_statement_list END }
```

在表更新事件上定义新触发器

注意：如果未指定，则 FOR EACH STATEMENT 为默认值。 为触发器名称指定模式名称的选项已被删除。 以前，完全限定触发器名称的架构名称必须与表的架构名称相同。

有关详细信息，请参阅：触发器。

另请参阅：删除触发器、声明、授予特权。

关联系统表：sys.triggers

# COMMENT ON SCHEMA

```sql
COMMENT ON SCHEMA schema_name IS  { 'comment text' | NULL | '' }
```

添加或更新或删除模式的评论

例子：

```sql
COMMENT ON SCHEMA prj4 IS 'schema of new project 4';
COMMENT ON SCHEMA prj0 IS '';
COMMENT ON SCHEMA prjX IS NULL;
```

注意：通过指定 IS NULL 或 IS '' 您可以删除模式的注释。 如果模式被删除，关联的注释也会被删除。

另请参阅：创建模式、删除模式。

关联系统表：sys.comments

# COMMENT ON TABLE

```sql
COMMENT ON TABLE [ schema_name . ] table_name IS  { 'comment text' | NULL | '' }
```

添加或更新或删除表的评论

例子：

```sql
COMMENT ON TABLE sys.comments IS 'contains comments on all db objects'
```

注意：通过指定 IS NULL 或 IS '' 您删除表对象的注释。 如果删除了表，则关联的注释（包括列的注释）也将被删除。 注意：不允许或不可能为模式“tmp”中的临时表添加注释。

另请参阅：创建表、删除表。

关联系统表：sys.comments

# COMMENT ON VIEW

```sql
COMMENT ON VIEW [ schema_name . ] view_name IS  { 'comment text' | NULL | '' }
```

添加或更新或删除视图的评论

例子：

```sql
COMMENT ON VIEW mysch.articles_aggr IS 'view lists aggregated info on articles'
```

注意：通过指定 IS NULL 或 IS '' 您可以删除视图的注释。 如果视图被删除，则关联的评论（包括列的评论）也会被删除。

另请参阅：创建视图、删除视图。

关联系统表：sys.comments


# COMMENT ON COLUMN

```sql
COMMENT ON COLUMN [ schema_name . ] table_or_view_name . column_name IS  { 'comment text' | NULL | '' }
```

添加或更新或删除表或视图的列的注释

例子：

```sql
COMMENT ON COLUMN sys.comments.remark IS 'contains description text'
```

注意：通过指定 IS NULL 或 IS '' 可以删除列的注释。 如果列（或表或视图）被删除，关联的注释也会被删除。 注意：不允许或不可能为模式“tmp”中的临时表的列添加注释。

另请参阅：ALTER TABLE ADD COLUMN、ALTER TABLE DROP COLUMN。

关联系统表：sys.comments

# COMMENT ON INDEX

```sql
COMMENT ON INDEX [ schema_name . ] index_name IS  { 'comment text' | NULL | '' }
```

添加或更新或删除索引的评论

例子：

```sql
COMMENT ON INDEX mysch.article_id IS 'unique index of id key column of article table'
```

注意：通过指定 IS NULL 或 IS '' 删除索引的注释。 如果索引被删除，相关的评论也会被删除。 注意：不允许或不可能为模式“tmp”中的临时表的索引添加注释。

另请参阅：创建索引、删除索引。

关联系统表：sys.comments

# COMMENT ON SEQUENCE

```sql
COMMENT ON SEQUENCE [ schema_name . ] sequence_name IS  { 'comment text' | NULL | '' }
```

添加或更新或删除序列的评论

例子：

```sql
COMMENT ON SEQUENCE mysch.article_id_seq IS 'sequence for article id column'
```

注意：通过指定 IS NULL 或 IS '' 删除序列的注释。 如果序列被删除，相关的评论也会被删除。

另请参阅：创建序列、删除序列

关联系统表：sys.comments

# COMMENT ON FUNCTION

```sql
COMMENT ON FUNCTION [ schema_name . ] function_name IS  { 'comment text' | NULL | '' }
```

添加或更新或删除函数的评论

例子：

```sql
COMMENT ON FUNCTION sys.upper IS 'converts text into uppercase'
```

注意：通过指定 IS NULL 或 IS '' 删除函数的注释。 如果删除该函数，则关联的注释也将被删除。

另请参阅：创建函数、删除函数。

关联系统表：sys.comments

# COMMENT ON PROCEDURE

```sql
COMMENT ON PROCEDURE [ schema_name . ] procedure_name IS  { 'comment text' | NULL | '' }
```

添加或更新或删除过程的注释

例子：

```sql
COMMENT ON PROCEDURE mysch.load_articles IS 'proc which reloads the articles from external file article.csv'
```

注意：通过指定 IS NULL 或 IS ''，您可以删除该过程的注释。 如果删除该过程，则相关的注释也将被删除。

另请参阅：创建过程、删除过程。

关联系统表：sys.comments。

# COMMENT ON AGGREGATE

```sql
COMMENT ON AGGREGATE [ schema_name . ] aggregate_name IS  { 'comment text' | NULL | '' }
```

添加或更新或删除聚合函数的注释

例子：

```sql
COMMENT ON AGGREGATE sys.std_dev IS 'computes the standard deviation of a group of numeric values'
```

注意：通过指定 IS NULL 或 IS '' 您可以删除聚合函数的注释。 如果聚合函数被删除，关联的注释也会被删除。

另请参阅：创建聚合语言、删除聚合。

关联系统表：sys.comments。

# COMMENT ON FILTER FUNCTION

```sql
COMMENT ON FILTER FUNCTION [ schema_name . ] function_name IS  { 'comment text' | NULL | '' }
```

添加或更新或删除过滤器功能的评论

例子：

```sql
COMMENT ON FILTER FUNCTION sys."ilike"(clob, clob) IS 'case insensitive pattern matching';
COMMENT ON FILTER FUNCTION sys."ilike"(clob, clob, clob) IS 'case insensitive pattern matching with user specified escape character';
```

注意：通过指定 IS NULL 或 IS '' 删除过滤器函数的注释。 如果过滤器功能被删除，相关的评论也会被删除。

另请参阅：创建过滤器功能外部拖放过滤器功能

关联系统表：sys.comments。

# COMMENT ON LOADER

```sql
COMMENT ON LOADER [ schema_name . ] function_name IS  { 'comment text' | NULL | '' }
```

添加或更新或删除加载程序函数的注释

例子：

```sql
COMMENT ON LOADER mysch.load_xls_data IS 'custom loader to extract data from external xls file'
```

注意：通过指定 IS NULL 或 IS '' 删除加载器函数的注释。 如果加载器函数被删除，相关的注释也会被删除。

另请参阅：创建加载程序、删除加载程序。

关联系统表：sys.comments。

# COMMENT ON WINDOW

```sql
COMMENT ON WINDOW [ FUNCTION ] [ schema_name . ] window_name IS  { 'comment text' | NULL | '' }
```

添加或更新或删除窗口函数的注释

例子：

```sql
COMMENT ON WINDOW FUNCTION sys.stddev IS 'computes the standard deviation of a group of numeric values'
```

注意：通过指定 IS NULL 或 IS '' 删除窗口函数的注释。 如果窗口函数被删除，相关的注释也会被删除。

另请参阅：外部创建窗口、删除窗口。

关联系统表：sys.comments。

# DECLARE

```sql
DECLARE [ schema_name . ] variable_name [, ... ] datatype
```

声明了一个新变量或相同类型的变量列表

例子：

```sql
DECLARE ts1 timestamp;
SET ts1 = now();
SELECT ts1;
SELECT * FROM sys.var() WHERE name NOT IN (SELECT var_name FROM sys.var_values);
```

注意：声明的变量不是持久的。 关闭连接或会话后它将丢失。

有关详细信息，请参阅：变量。

另请参阅：设置、选择。

关联系统表：sys.var()

# ALTER SEQUENCE

```sql
ALTER SEQUENCE [ schema_name . ] sequence_name [ AS datatype  ]
    [ RESTART [WITH bigint# ] ]
    [ INCREMENT BY bigint# ]
    [ MINVALUE bigint# | NO MINVALUE ]
    [ MAXVALUE bigint# | NO MAXVALUE ]
    [ CACHE bigint# ]
    [ [ NO ] CYCLE ]
```

更改序列生成器的定义

有关详细信息，请参阅：SerialDatatypes

另请参阅：删除序列、创建序列。

关联系统表：sys.sequences。

# ALTER TABLE ADD COLUMN

```sql
ALTER TABLE [ IF EXISTS ] [ schema_name . ] table_name
    ADD [ COLUMN ] column_name { data_type [
    column_option ... ] | SERIAL | BIGSERIAL }
```

向表中添加列

有关详细信息，请参阅：AlterStatement。

另请参阅：ALTER TABLE ADD CONSTRAINT、ALTER TABLE ALTER COLUMN、ALTER TABLE DROP COLUMN。

关联系统表：sys.columns。

# ALTER TABLE ALTER COLUMN

```sql
ALTER TABLE [ IF EXISTS ] [ schema_name . ] table_name
    ALTER [ COLUMN ] column_name { SET NULL | SET NOT NULL | SET DEFAULT value
    | DROP DEFAULT | SET STORAGE {string | NULL} }
```

更改列可空性或默认值或存储

注意：不支持更改列的数据类型。 

而是使用命令序列：

```sql
ALTER TABLE tbl ADD COLUMN new_column new_data_type;
UPDATE tbl SET new_column = CONVERT(old_column, new_data_type);
ALTER TABLE tbl DROP COLUMN old_column RESTRICT;
ALTER TABLE tbl RENAME COLUMN new_column TO old_column;
```

有关详细信息，请参阅：[]AlterStatement](/Documentation/SQLreference/TableDefinitions/AlterStatement)

另请参阅：更改表重命名列，

ALTER TABLE ADD 列，ALTER TABLE DROP 列，ALTER TABLE DROP 约束。

关联系统表：sys.columns。

# ALTER TABLE DROP COLUMN

```sql
ALTER TABLE [ IF EXISTS ] [ schema_name . ] table_name
    DROP [ COLUMN ] column_name
    [ RESTRICT | CASCADE ]
```

从表中删除一列

注意：如果列被引用（例如，从视图、索引、合并表、触发器、外键约束、函数或过程或除注释之外的其他 db 对象），则不能删除它。 使用选项 CASCADE 指定也删除那些引用对象。

有关详细信息，请参阅：AlterStatement。

另请参阅：ALTER TABLE DROP CONSTRAINT、ALTER TABLE ALTER COLUMN、DROP TABLE。

关联系统表：sys.columns。

# ALTER TABLE ADD CONSTRAINT

```sql
ALTER TABLE [ IF EXISTS ] [ schema_name . ] table_name
    ADD [ CONSTRAINT constraint_name ]
    { PRIMARY KEY ( column_name [ , column_name ] [, ... ] )
    |      UNIQUE ( column_name [ , column_name ] [, ... ] )
    | FOREIGN KEY ( column_name [ , column_name ] [, ... ] ) REFERENCES [ schema_name . ] table_name
        [ ( column_name [ , column_name ] [, ... ] ) ]   [ match_options ]   [ ref_actions ]
    }
```

向表中添加表约束

例子：

```sql
ALTER TABLE "tblnm" ADD PRIMARY KEY ("C1_id");
ALTER TABLE if exists "schnm"."tblnm" ADD CONSTRAINT "tblnm_uc" UNIQUE ("name", "desc");
ALTER TABLE "tblnm" ADD CONSTRAINT "tblnm_fk1" FOREIGN KEY ("f_id", "f_seq")
                        REFERENCES "schnm2"."fun" ("id", "seq")  ON UPDATE RESTRICT  ON DELETE CASCADE;
```

注意：每个表只能定义一个 PRIMARY KEY 约束。 添加主键约束后，所有主键列都将隐式变为 NOT NULLable。 如果没有指定约束名，则约束名将由表名、列名和约束类型隐式组成。 （尚）不支持 CHECK 约束。

有关详细信息，请参阅：AlterStatement。

另请参阅：ALTER TABLE DROP CONSTRAINT、ALTER TABLE ALTER COLUMN

关联系统表：sys.keys。

# ALTER TABLE DROP CONSTRAINT

```sql
ALTER TABLE [ IF EXISTS ] [ schema_name . ] table_name
    DROP CONSTRAINT  constraint_name
    [ RESTRICT | CASCADE ]
```

从表中删除表/列约束

注意：如果约束被引用（例如，来自外键约束），则不能删除它。 使用选项 CASCADE 指定也删除那些引用对象。 要删除 NOT NULL 列约束，请使用：ALTER TABLE sch.tbl ALTER COLUMN column_name SET NULL。

有关详细信息，请参阅：AlterStatement。

另请参阅：ALTER TABLE ADD CONSTRAINT、ALTER TABLE ALTER COLUMN。

关联系统表：sys.keys。

# ALTER TABLE RENAME TO

```sql
ALTER TABLE [ IF EXISTS ] [ schema_name . ] table_name
    RENAME TO  new_table_name
```

更改表的名称

注意：只有在不存在依赖于表名的对象时才允许更改表名，例如外键约束、视图、触发器、索引、函数、过程等。将表移动到不同的模式 使用命令：ALTER TABLE ... SET SCHEMA ...

有关详细信息，请参阅：AlterStatement，另请参阅：CREATE TABLE AS、ALTER TABLE SET SCHEMA。

关联系统表：sys.tables。

# ALTER TABLE RENAME COLUMN

```sql
ALTER TABLE [ IF EXISTS ] [ schema_name . ] table_name
    RENAME [ COLUMN ]  column_name TO  new_column_name
```

更改列的名称

注意：只有在不存在依赖于列名的对象时才允许更改列名，例如约束、视图、函数等。

有关详细信息，请参阅：AlterStatement。

另请参阅：ALTER TABLE ADD COLUMN、ALTER TABLE DROP COLUMN、ALTER TABLE DROP CONSTRAINT。

关联系统表：sys.columns。

# ALTER TABLE SET SCHEMA

```sql
ALTER TABLE [ IF EXISTS ] [ schema_name . ] table_name
    SET SCHEMA  new_schema_name
```

更改表的架构名称

注意：只有在不存在依赖于表名的对象时才允许更改表的模式名称，例如外键约束、视图、触发器、索引、函数、过程等。

有关详细信息，请参阅：AlterStatement。

另请参阅：创建表为，更改表重命名为。

关联系统表：sys.tables。

# ALTER TABLE ADD TABLE

```sql
ALTER TABLE [ IF EXISTS ] [ schema_name . ] merge_table_name
    ADD TABLE [ schema_name . ] table_name
    [ AS PARTITION  partition_spec ]

partition_spec:

    IN ( expression [ , expression ] [, ... ] )  [ WITH NULL VALUES ]
    | FROM  { RANGE MINVALUE | expression }  TO  { RANGE MAXVALUE | expression }  [ WITH NULL VALUES ]
    | FOR NULL VALUES
```

可选地使用分区规范添加对合并表集的表引用

注意：此命令是特定于 MonetDB 的。 限制：添加的表必须与合并表具有相同的列定义和布局。 只有用户定义的表和合并表可以添加到合并表集中。 当使用 PARTITION BY 子句创建合并表时，必须指定 AS PARTITION 子句。

有关详细信息，请参阅：DataPartitioning 和 Updatable-merge-tables 以及：AlterStatement。

另请参阅：创建合并表、更改表设置表、更改表删除表

关联系统表：sys.tables where type = 3; sys.range_partitions; ; sys.value_partitions;。

# ALTER TABLE SET TABLE

```sql
ALTER TABLE [ IF EXISTS ] [ schema_name . ] merge_table_name
    SET TABLE [ schema_name . ] table_name
    AS PARTITION  partition_spec

partition_spec:

IN ( expression [ , expression ] [, ... ] )  [ WITH NULL VALUES ]
    | FROM  { RANGE MINVALUE | expression }  TO  { RANGE MAXVALUE | expression }  [ WITH NULL VALUES ]
    | FOR NULL VALUES
```

更改分区表的分区规范

注意：此命令是特定于 MonetDB 的。

有关详细信息，请参阅：Updatable-merge-tables 和 AlterStatement

另请参阅：创建合并表 ALTER TABLE ADD TABLE ALTER TABLE DROP TABLE

关联系统表：sys.tables where type = 3; sys.range_partitions;，sys.value_partitions;。

# ALTER TABLE DROP TABLE

```sql
ALTER TABLE [ IF EXISTS ] [ schema_name . ] merge_table_name
    DROP TABLE [ schema_name . ] table_name
    [ RESTRICT | CASCADE ]
```

从合并表集中删除表引用。 分区表本身不会被删除。

注意：此命令是特定于 MonetDB 的。

有关详细信息，请参阅：DataPartitioning 和：AlterStatement。

另请参阅：创建合并表、更改表添加表。

关联系统表：sys.tables where type = 3; sys.range_partitions;，sys.value_partitions;。

# ALTER TABLE SET INSERT ONLY

```sql
ALTER TABLE [ IF EXISTS ] [ schema_name . ] table_name SET INSERT ONLY
```

更改表的访问权限以仅允许插入

有关详细信息，请参阅：AlterStatement。 另请参阅： ALTER TABLE SET READ ONLY ALTER TABLE SET READ WRITE

关联系统表：sys.tables，其中键入 (0, 3, 4, 5, 6)。

TODO:
...


# 参考资料

https://www.monetdb.org/documentation-Jan2022/user-guide/sql-summary/

* any list
{:toc}