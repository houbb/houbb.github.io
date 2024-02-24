---
layout: post
title: Apache Calcite doc avatica-04-Json reference
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 请求链接集合

## Requests

该集合包含所有被 Avatica 接受的 JSON 对象，作为请求。所有请求都包括一个请求属性，用于唯一标识具体请求与其他请求的区别。

### CatalogsRequest

此请求用于获取数据库中可用的目录名称。

```json
{
  "request": "getCatalogs",
  "connectionId": "000000-0000-0000-00000000"
}
```

**connectionId** (必需字符串)：要使用的连接的标识符。

### CloseConnectionRequest

此请求用于关闭 Avatica 服务器中由给定 ID 标识的连接对象。

```json
{
  "request": "closeConnection",
  "connectionId": "000000-0000-0000-00000000"
}
```

**connectionId** (必需字符串)：要关闭的连接的标识符。

### CloseStatementRequest

此请求用于关闭 Avatica 服务器中由给定 ID 标识的语句对象。

```json
{
  "request": "closeStatement",
  "connectionId": "000000-0000-0000-00000000",
  "statementId": 12345
}
```

**connectionId** (必需字符串)：语句所属的连接的标识符。

**statementId** (必需整数)：要关闭的语句的标识符。

### ColumnsRequest

此请求用于根据一些可选的过滤条件从数据库中获取列。

```json
{
  "request": "getColumns",
  "connectionId": "000000-0000-0000-00000000",
  "catalog": "catalog",
  "schemaPattern": "schema_pattern.*",
  "tableNamePattern": "table_pattern.*",
  "columnNamePattern": "column_pattern.*"
}
```

**connectionId** (必需字符串)：要获取列的连接的标识符。

**catalog** (可选字符串)：限制返回列的目录名称。

**schemaPattern** (可选字符串)：针对模式的 Java Pattern，限制返回列。

**tableNamePattern** (可选字符串)：针对表名称的 Java Pattern，限制返回列。

**columnNamePattern** (可选字符串)：针对列名称的 Java Pattern，限制返回列。

### CommitRequest

此请求用于在 Avatica 服务器中的连接上执行提交。

```json
{
  "request": "commit",
  "connectionId": "000000-0000-0000-00000000"
}
```

**connectionId** (必需字符串)：要执行提交的连接的标识符。

## Responses

该集合包含所有作为 Avatica 响应返回的 JSON 对象。所有响应都包括一个响应属性，用于唯一标识具体响应与其他响应的区别。

### CloseConnectionResponse

关闭连接请求的响应。

```json
{
  "response": "closeConnection",
  "rpcMetadata": RpcMetadata
}
```

**rpcMetadata**：关于此调用的服务器元数据。

### CloseStatementResponse

关闭语句请求的响应。

```json
{
  "response": "closeStatement",
  "rpcMetadata": RpcMetadata
}
```

**rpcMetadata**：关于此调用的服务器元数据。

### CommitResponse

提交请求的响应。

```json
{
  "response": "commit"
}
```

此响应上没有额外属性。

### Miscellaneous

AvaticaParameter 等其他对象的描述。

### ErrorResponse

请求执行时捕获到错误时的响应。任何请求都可能返回此响应。

```json
{
  "response": "error",
  "exceptions": [ "stacktrace", "stacktrace", ... ],
  "errorMessage": "The error message",
  "errorCode": 42,
  "sqlState": "ABC12",
  "severity": AvaticaSeverity,
  "rpcMetadata": RpcMetadata
}
```

**exceptions**：Java 堆栈跟踪的字符串列表。

**errorMessage**：人类可读的错误消息。

**errorCode**：此错误的数字代码。

**sqlState**：此错误的五个字符的字母数字代码。

**severity**：一个 AvaticaSeverity 对象，表示错误的严重程度。

**rpcMetadata**：关于此调用的服务器元数据。

### ExecuteBatchResponse

ExecuteBatchRequest 和 PrepareAndExecuteRequest 的响应，封装了一批更新的更新计数。

```json
{
  "response": "executeBatch",
  "connectionId": "000000-0000-0000-00000000",
  "statementId": 12345,
  "updateCounts": [ 1, 1, 0, 1, ... ],
  "missingStatement": false,
  "rpcMetadata": RpcMetadata
}
```

**connectionId**：用于创建语句的连接的标识符。

**statementId**：已创建语句的标识符。

**updateCounts**：与执行的每个更新对应的整数数组。

**missingStatement**：如果操作因服务器中未缓存语句而失败，则为 true；否则为 false。

**rpcMetadata**：关于此调用的服务器元数据。

### ExecuteResponse

ExecuteRequest 的响应，包含元数据查询的结果。

```json
{
  "response": "executeResults",
  "resultSets": [ ResultSetResponse, ResultSetResponse, ... ],
  "missingStatement": false,
  "rpcMetadata": RpcMetadata
}
```

**resultSets**：一个 ResultSetResponses 数组。

**missingStatement**：一个布尔值，表示请求是否由于缺少语句而失败。

**rpcMetadata**：关于此调用的服务器元数据。

### FetchResponse

FetchRequest 的响应，包含查询的请求。

```json
{
  "response": "fetch",
  "frame": Frame,
  "missingStatement": false,
  "missingResults": false,
  "rpcMetadata": RpcMetadata
}
```

**frame**：包含获取结果的 Frame。

**missingStatement**：一个布尔值，表示请求是否由于缺少语句而失败。

**missingResults**：一个布尔值，表示请求是否由于缺少 ResultSet 而失败。

**rpcMetadata**：关于此调用的服务器元数据。

### OpenConnectionResponse

OpenConnectionRequest 的响应。客户端应在后续调用中使用提供的连接 ID。

```json
{
  "response": "openConnection",
  "rpcMetadata": RpcMetadata
}
```

**rpcMetadata**：关于此调用的服务器元数据。

### PrepareResponse

PrepareRequest 的响应。此响应包括一个 StatementHandle，客户端必须使用该句柄从语句中获取结果。

```json
{
  "response": "prepare",
  "statement": StatementHandle,
  "rpcMetadata": RpcMetadata
}
```

**statement**：一个 StatementHandle 对象。

**rpcMetadata**：关于此调用的服务器元数据。

### ResultSetResponse

包含查询结果和类型详细信息的响应。

```json
{
  "response": "resultSet",
  "connectionId": "000000-0000-0000-00000000",
  "statementId": 12345,
  "ownStatement": true,
  "signature": Signature,
  "firstFrame": Frame,
  "updateCount": 10,
  "rpcMetadata": RpcMetadata
}
```

**connectionId**：生成此响应的连接的标识符。

**statementId**：生成此响应的语句的标识符。

**ownStatement**：结果集是否有自己的专用语句。如果为 true，则服务器在关闭结果集时必须自动关闭语句。例如，用于 JDBC 元数据结果集。

**signature**：表示语句准备的 Signature 对象。

**firstFrame**：包含获取结果的 Frame 的可选对象。

**updateCount**：正常结果集始终为 -1 的数字。任何其他值表示“虚拟”结果集，仅包含此计数，而不包含其他数据。

**rpcMetadata**：关于此调用的服务器元数据。

### RollbackResponse

RollBackRequest 的响应。

```json
{
  "response": "rollback"
}
```

此响应上没有额外属性。

### SyncResultsResponse

SyncResultsRequest 的响应。当 moreResults 为 true 时，应发出 FetchRequest 以获取下一

批结果。

```json
{
  "response": "syncResults",
  "moreResults": true,
  "missingStatement": false,
  "missingResults": false,
  "rpcMetadata": RpcMetadata
}
```

**moreResults**：如果尚未返回所有结果，则为 true；否则为 false。

**missingStatement**：一个布尔值，表示请求是否由于缺少语句而失败。

**missingResults**：一个布尔值，表示请求是否由于缺少 ResultSet 而失败。

**rpcMetadata**：关于此调用的服务器元数据。

### UnwrapResponse

UnwrapRequest 的响应。

```json
{
  "response": "unwrap",
  "rpcMetadata": RpcMetadata
}
```

**rpcMetadata**：关于此调用的服务器元数据。

### Fetch

一个 Frame，用于检索一批行。

```json
{
  "offset": 0,
  "done": false,
  "rows": [ [ "row1col1", "row1col2", ... ], [ "row2col1", "row2col2", ... ], ... ]
}
```

**offset**：请求的第一行的偏移量。

**done**：如果没有更多行，则为 true；否则为 false。

**rows**：结果行的二维数组。


# 杂项
## 杂项链接

# Avatica参数
## Avatica参数链接

此对象描述了结果中列的“简单”或标量的 JDBC 类型表示。这不包括诸如数组之类的复杂类型。

```json
{
  "signed": true,
  "precision": 10,
  "scale": 2,
  "parameterType": 8,
  "typeName": "integer",
  "className": "java.lang.Integer",
  "name": "number"
}
```

- signed：一个布尔值，表示列是否为有符号数值。
- precision：此列支持的最大数值精度。
- scale：此列支持的最大数值刻度。
- parameterType：与 JDBC Types 类对应的整数，表示列的类型。
- typeName：此列的 JDBC 类型名称。
- className：支持此列的 JDBC 类型的 Java 类。
- name：列的名称。

# Avatica严重程度
## Avatica严重程度链接

此枚举描述了 Avatica 服务器中错误的各种关注级别。

其中之一：

- UNKNOWN
- FATAL
- ERROR
- WARNING

# Avatica类型
## Avatica类型链接

此对象描述了列的简单或复杂类型。复杂类型将在 component 或 columns 属性中包含额外信息，描述复杂父类型的嵌套类型。

```json
{
  "type": "scalar",
  "id": "identifier",
  "name": "column",
  "rep": Rep,
  "columns": [ ColumnMetaData, ColumnMetaData, ... ],
  "component": AvaticaType
}
```

- type：其中之一：scalar、array、struct。
- id：根据 JDBC Types 类对象类型的数字值。
- name：JDBC 类型的可读名称。
- rep：Avatica 使用的嵌套 Rep 对象，用于保存附加的类型信息。
- columns：对于 STRUCT 类型，列在该 STRUCT 中包含的列的列表。
- component：对于 ARRAY 类型，该 ARRAY 中包含的元素的类型。

# 列元数据
## 列元数据链接

此对象表示列的 JDBC ResultSetMetaData。

```json
{
  "ordinal": 0,
  "autoIncrement": true,
  "caseSensitive": true,
  "searchable": false,
  "currency": false,
  "nullable": 0,
  "signed": true,
  "displaySize": 20,
  "label": "Description",
  "columnName": "col1",
  "schemaName": "schema",
  "precision": 10,
  "scale": 2,
  "tableName": "table",
  "catalogName": "catalog",
  "type": AvaticaType,
  "readOnly": false,
  "writable": true,
  "definitelyWritable": true,
  "columnClassName": "java.lang.String"
}
```

- ordinal：位置偏移数字。
- autoIncrement：一个布尔值，表示列是否自动递增。
- caseSensitive：一个布尔值，表示列是否区分大小写。
- searchable：一个布尔值，表示此列是否支持所有 WHERE 搜索子句。
- currency：一个布尔值，表示此列是否代表货币。
- nullable：一个数字，表示此列是否支持空值。
  - 0 = 不允许空值
  - 1 = 允许空值
  - 2 = 未知是否允许空值
- signed：一个布尔值，表示列是否为有符号数值。
- displaySize：列的字符宽度。
- label：此列的描述。
- columnName：列的名称。
- schemaName：此列所属的模式。
- precision：此列支持的最大数值精度。
- scale：此列支持的最大数值刻度。
- tableName：此列所属的表的名称。
- catalogName：此列所属的目录的名称。
- type：表示列类型的嵌套 AvaticaType。
- readOnly：一个布尔值，表示列是否只读。
- writable：一个布尔值，表示列是否可以更新。
- definitelyWritable：一个布尔值，表示列是否绝对可更新。
- columnClassName：列的类型的 Java 类的名称。

# 连接属性
## 连接属性链接

此对象表示给定 JDBC 连接的属性。

```json
{
  "connProps": "connPropsImpl",
  "autoCommit": true,
  "readOnly": true,
  "transactionIsolation": 0,
  "catalog": "catalog",
  "schema": "schema"
}
```

- autoCommit（可选布尔值）：一个布尔值，表示是否为事务启用自动提交。
- readOnly（可选布尔值）：一个布尔值，表示 JDBC 连接是否只读。
- transactionIsolation（可选整数）：一个整数，表示事务隔离级别，与 JDBC 规范中定义的值相对应。
  - 0 = 不支持事务
  - 1 = 可能发生脏读、不可重复读和幻读。
  - 2 = 阻止脏读，但可能发生不可重复读和幻读。
  - 4 = 阻止脏读和不可重复读，但可能发生幻读。
  - 8 = 阻止脏读、不可重复读和幻读。
- catalog（可选字符串）：获取连接属性时要包含的目录的名称。
- schema（可选字符串）：获取连接属性时要包含的模式的名称。
- isDirty（内部布尔值）：仅供内部使用的布尔值（Avatica 协议不需要）。此字段将在将来的版本中从协议中删除。

# 游标工厂
## 游标工厂链接

此对象表示将未类型化的对象转换为某些结果所需类型的信息。

```json
{
  "style": Style,
  "clazz": "java.lang.String",
  "fieldNames": [ "column1", "column2", ... ]
}
```

- style：表示包含对象样式的字符串。
- clazz：Java 类型的名称。
- fieldNames：字段名称的数组。

# 数据库属性
## 数据库属性链接

此对象表示通过 Avatica 服务器连接的连接所暴露的数据库属性。

其中之一：

- GET_STRING_FUNCTIONS
- GET_NUMERIC_FUNCTIONS
- GET_SYSTEM_FUNCTIONS


- GET_TIME_DATE_FUNCTIONS
- GET_S_Q_L_KEYWORDS
- GET_DEFAULT_TRANSACTION_ISOLATION

# 帧
## 帧链接

此对象表示一批结果，跟踪结果集中的偏移和是否仍存在更多结果需要在 Avatica 服务器中获取。

```json
{
  "offset": 100,
  "done": true,
  "rows": [ [ val1, val2, ... ], ... ]
}
```

- offset：结果集中这些行的起始位置。
- done：一个布尔值，表示此结果集是否还有更多结果。
- rows：与结果集中的行和列对应的数组数组。

# 查询状态
## 查询状态链接

此对象表示在 Avatica 服务器中创建 ResultSet 的方式。 ResultSet 可以由用户提供的 SQL 创建，也可以通过带有该操作的参数的 DatabaseMetaData 操作创建。

```json
{
  "type": StateType,
  "sql": "SELECT * FROM table",
  "metaDataOperation": MetaDataOperation,
  "operationArgs": ["arg0", "arg1", ... ]
}
```

- type：表示支持此查询的 ResultSet 的操作类型。
- sql：创建此查询的 ResultSet 的 SQL 语句。如果类型为 SQL，则为必需项。
- metaDataOperation：创建此查询的 ResultSet 的 DML 操作。如果类型为 METADATA，则为必需项。
- operationArgs：调用的 DML 操作的参数。如果类型为 METADATA，则为必需项。

# 表示
## 表示链接

此枚举表示某个值的具体 Java 类型。

其中之一：

- PRIMITIVE_BOOLEAN
- PRIMITIVE_BYTE
- PRIMITIVE_CHAR
- PRIMITIVE_SHORT
- PRIMITIVE_INT
- PRIMITIVE_LONG
- PRIMITIVE_FLOAT
- PRIMITIVE_DOUBLE
- BOOLEAN
- BYTE
- CHARACTER
- SHORT
- INTEGER
- LONG
- FLOAT
- DOUBLE
- JAVA_SQL_TIME
- JAVA_SQL_TIMESTAMP
- JAVA_SQL_DATE
- JAVA_UTIL_DATE
- BYTE_STRING
- STRING
- NUMBER
- OBJECT

# RPC元数据
## RPC元数据链接

此对象包含由Avatica服务器返回的各种调用/上下文元数据。

```json
{
  "serverAddress": "localhost:8765"
}
```

- serverAddress：创建此对象的服务器的主机:端口。

# 签名
## 签名链接

此对象表示在Avatica服务器中准备语句的结果。

```json
{
  "columns": [ ColumnMetaData, ColumnMetaData, ... ],
  "sql": "SELECT * FROM table",
  "parameters": [ AvaticaParameter, AvaticaParameter, ... ],
  "cursorFactory": CursorFactory,
  "statementType": StatementType
}
```

- columns：表示结果集架构的ColumnMetaData对象数组。
- sql：执行的SQL语句。
- parameters：表示类型特定详细信息的AvaticaParameter对象数组。
- cursorFactory：表示帧的Java表示的CursorFactory对象。
- statementType：表示Statement类型的StatementType对象。

# 状态类型
## 状态类型链接

此枚举表示是否使用用户提供的SQL或DatabaseMetaData操作来创建某个ResultSet。

其中之一：

- SQL
- METADATA

# 语句句柄
## 语句句柄链接

此对象封装了在Avatica服务器中创建的语句的所有信息。

```json
{
  "connectionId": "000000-0000-0000-00000000",
  "id": 12345,
  "signature": Signature
}
```

- connectionId：此语句所属连接的标识符。
- id：语句的标识符。
- signature：语句的Signature对象。

# 语句类型
## 语句类型链接

此枚举表示语句的种类。

其中之一：

- SELECT
- INSERT
- UPDATE
- DELETE
- UPSERT
- MERGE
- OTHER_DML
- CREATE
- DROP
- ALTER
- OTHER_DDL
- CALL

# 样式
## 样式链接

此枚举表示值的通用“类”类型。

其中之一：

- OBJECT
- RECORD
- RECORD_PROJECTION
- ARRAY
- LIST
- MAP

# 类型化值
## 类型化值链接

此对象封装了行中列的类型和值。

```json
{
  "type": "type_name",
  "value": object
}
```

- type：指向存储在value中的对象类型的名称。

- value：JDBC类型的JSON表示。

以下图表记录了每个Rep值如何序列化为JSON值。有关JSON中有效属性的更多信息，请参阅JSON文档。

| Rep值            | 序列化     | 描述                                                                                      |
|-------------------|------------|-------------------------------------------------------------------------------------------|
| PRIMITIVE_BOOLEAN | boolean    |                                                                                           |
| BOOLEAN           | boolean    |                                                                                           |
| PRIMITIVE_BYTE    | number     | 字节的数值值。                                                                             |
| BYTE              | number     |                                                                                           |
| PRIMITIVE_CHAR    | string     |                                                                                           |
| CHARACTER         | string     |                                                                                           |
| PRIMITIVE_SHORT   | number     |                                                                                           |
| SHORT             | number     |                                                                                           |
| PRIMITIVE_INT     | number     |                                                                                           |
| INTEGER           | number     |                                                                                           |
| PRIMITIVE_LONG    | number     |                                                                                           |
| LONG              | number     |                                                                                           |
| PRIMITIVE_FLOAT   | number     |                                                                                           |
| FLOAT             | number     |                                                                                           |
| PRIMITIVE_DOUBLE  | number     |                                                                                           |
| DOUBLE            | number     |                                                                                           |
| BIG_INTEGER       | number     | 由Jackson隐式处理。                                                                        |
| BIG_DECIMAL       | number     | 由Jackson隐式处理。                                                                        |
| JAVA_SQL_TIME     | number     | 作为整数，从午夜开始的毫秒数。                                                            |
| JAVA_SQL_DATE     | number     | 作为整数，自纪元以来的天数。                                                              |
| JAVA_SQL_TIMESTAMP| number     | 作为长整数，自纪元以来的毫秒数。                                                          |
| JAVA_UTIL_DATE    | number     | 作为长整数，自纪元以来的毫秒数。                                                          |
| BYTE_STRING       | string     | Base64编码的字符串。                                                                       |
| STRING            | string     |                                                                                           |
| NUMBER            | number     | 一般数值，未知具体类型。                                                                   |
| OBJECT            | null       | 由Jackson隐式转换。                                                                        |
| NULL              | null       | 由Jackson隐式转换。                                                                        |
| ARRAY             | N/A        | 由Jackson隐式处理。                                                                        |
| STRUCT            | N/A        | 由Jackson隐式处理。                                                                        |
| MULTISET          | N/A        | 由Jackson隐式处理。                                                                        |

# 参考资料

https://calcite.apache.org/avatica/docs/json_reference.html

* any list
{:toc}