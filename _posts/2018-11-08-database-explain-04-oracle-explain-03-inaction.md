---
layout: post
title: Oracle Explain-03-获取 oracle 执行计划实战笔记
date:  2018-11-8 18:55:36 +0800
categories: [SQL]
tags: [sql, oracle, sh]
published: true
---

# docker install oracle

> [docker-install-oracle](https://houbb.github.io/2018/04/21/docker-install-oracle)

# windows11 wsl 安装实战笔记

## docker

```
$ docker --version
Docker version 24.0.5, build 24.0.5-0ubuntu1~22.04.1
```

## 下载 oracle

```
dh@d:~$ docker pull alexeiled/docker-oracle-xe-11g
Using default tag: latest
Error response from daemon: pull access denied for alexeiled/docker-oracle-xe-11g, repository does not exist or may require 'docker login': denied: requested access to the resource is denied
```

报错，我们首先查询

```sh
docker search docker-oracle-xe-11g 
```

如下：

```
dh@d:~$ docker search docker-oracle-xe-11g
NAME                                 DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
deepdiver/docker-oracle-xe-11g                                                       44                   [OK]
epiclabs/docker-oracle-xe-11g        Customized Oracle XE 11g build for CI and de…   27                   [OK]
arahman/docker-oracle-xe-11g         phusion/baseimage based spin off of alexei-l…   9                    [OK]
konnecteam/docker-oracle-xe-11g      Fork of https://github.com/wnameless/docker-…   4                    [OK]
deadok22/docker-oracle-xe-11g        docker-oracle-xe-11g                            0
pengbai/docker-oracle-xe-11g-r2      oracle xe 11g r2 with sql initdb and web con…   10                   [OK]
rafaelri/docker-oracle-xe-11g        Fork from wnameless/docker-oracle-xe-11g        3                    [OK]
nguoianphu/docker-oracle-xe-11g      Oracle Express Edition 11g Release 2 on Ubun…   0                    [OK]
ignatov/docker-oracle-xe-11g         Dockerfile of Oracle Database Express Editio…   3                    [OK]
```

我们选择第一个：

```sh
docker pull deepdiver/docker-oracle-xe-11g
```

## 运行

```sh
docker run -h "oracle" --name "oracle" -d -p 49160:22 -p 49161:1521 -p 49162:8080 deepdiver/docker-oracle-xe-11g
```

效果

```
$ docker ps
CONTAINER ID   IMAGE                            COMMAND                  CREATED         STATUS         PORTS
                                                                                                                    NAMES
a9b88e77fe5e   deepdiver/docker-oracle-xe-11g   "/bin/sh -c 'sed -i …"   5 seconds ago   Up 4 seconds   0.0.0.0:49160->22/tcp, :::49160->22/tcp, 0.0.0.0:49161->1521/tcp, :::49161->1521/tcp, 0.0.0.0:49162->8080/tcp, :::49162->8080/tcp   oracle
```

# 连接

本地 oracle 对应链接信息，可以使用 jdbc 的连接工具。

```
属性	值
hostname	localhost
port	49161
sid	xe
username	system
password	oracle
SYS的密码	oracle
```

jdbcUrl=jdbc:oracle:thin:@localhost:49161:xe


## 初始化建表

oracle 和 mysql 不同，建表语句：

```sql
CREATE TABLE users (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(50),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 查看执行计划

```sql
EXPLAIN PLAN FOR select * from users;
```

这会将查询计划存储在Oracle的数据字典中。

然后你可以使用以下语句来查看计划：

```sql
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
```

### 分别执行

但是返回：

```
EXPLAIN PLAN FOR select * from users;
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
```

```
Error: cannot fetch last explain plan from PLAN_TABLE
```

### 一起执行

```sql
EXPLAIN PLAN FOR SELECT * FROM users;
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
```

效果

```
Plan hash value: 3461732445
 
---------------------------------------------------------------------------
| Id  | Operation         | Name  | Rows  | Bytes | Cost (%CPU)| Time     |
---------------------------------------------------------------------------
|   0 | SELECT STATEMENT  |       |     1 |    53 |     2   (0)| 00:00:01 |
|   1 |  TABLE ACCESS FULL| USERS |     1 |    53 |     2   (0)| 00:00:01 |
---------------------------------------------------------------------------
 
Note
-----
   - dynamic sampling used for this statement (level=2)
```

### 一起执行2

```sql
EXPLAIN PLAN FOR SELECT * FROM users where name='123'; 
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
```

结果：

```
Plan hash value: 3461732445
 
---------------------------------------------------------------------------
| Id  | Operation         | Name  | Rows  | Bytes | Cost (%CPU)| Time     |
---------------------------------------------------------------------------
|   0 | SELECT STATEMENT  |       |     1 |    53 |     2   (0)| 00:00:01 |
|*  1 |  TABLE ACCESS FULL| USERS |     1 |    53 |     2   (0)| 00:00:01 |
---------------------------------------------------------------------------
 
Predicate Information (identified by operation id):
---------------------------------------------------
 
"   1 - filter(""NAME""='123')"
 
Note
-----
   - dynamic sampling used for this statement (level=2)
```

这种返回的感觉是非格式化的。最好我们有格式化的数据。


# XML 格式化的数据

[jdbc 执行explain plan set 输出执行计划](https://blog.csdn.net/wangting424/article/details/84228581)

## 核心代码

```java
protected ExplainResult doExplain(ExplainSqlContext context, String sql) {
    try {
        Connection conn = super.getConnection(context);
        Statement statement1 = conn.createStatement();
        String id = context.getId().id();
        statement1.execute("explain plan set STATEMENT_ID = '" + id + "' for " + sql);
        statement1.executeQuery("select to_clob(dbms_xplan.build_plan_xml(statement_id => '" + id + "')) AS XPLAN FROM dual");
        ResultSet resultSet = statement1.getResultSet();
        return buildResult(resultSet);
    } catch (SQLException e) {
        throw new ExplainRuntimeException(e);
    }
}
```

## SQL 执行

我们可以看一下对应 sql 的结果。STATEMENT_ID 每次要生成唯一的标识。

```sql
explain plan set STATEMENT_ID = '123456789' for  SELECT * FROM users where name='123';
select to_clob(dbms_xplan.build_plan_xml(statement_id => '123456789')) AS XPLAN FROM dual;
```

语句解释：

这两条语句用于在Oracle中获取执行计划，并以XML格式返回。让我逐步解释：

1. `EXPLAIN PLAN SET STATEMENT_ID = '123456789' FOR SELECT * FROM users WHERE name='123';`

   这个语句用于为特定的SQL语句生成执行计划，并将其保存在数据库中以备后续检索。通过使用`STATEMENT_ID`参数，你可以为执行计划指定一个唯一的标识符，这对于后续检索执行计划是很有用的。在这个例子中，执行计划将被保存在数据库中，并使用`123456789`作为标识符。

2. `SELECT TO_CLOB(DBMS_XPLAN.BUILD_PLAN_XML(STATEMENT_ID => '123456789')) AS XPLAN FROM dual;`

   这个语句用于检索先前生成的执行计划，并将其以XML格式返回。它使用了`DBMS_XPLAN.BUILD_PLAN_XML`函数来构建执行计划的XML表示。在这个函数中，你需要指定之前生成执行计划时使用的`STATEMENT_ID`，以便检索正确的执行计划。然后，`TO_CLOB`函数用于将XML结果转换为`CLOB`类型的数据，最后将结果作为一个名为`XPLAN`的列返回给客户端。


实际效果：

```xml
<plan>
  <operation name="SELECT STATEMENT" id="0" depth="0" pos="2">
    <card>1</card>
    <bytes>53</bytes>
    <cost>2</cost>
    <io_cost>2</io_cost>
    <cpu_cost>0</cpu_cost>
    <time>00:00:01 </time>
  </operation>
  <operation name="TABLE ACCESS" options="FULL" id="1" depth="1" pos="1">
    <object>USERS</object>
    <card>1</card>
    <bytes>53</bytes>
    <cost>2</cost>
    <io_cost>2</io_cost>
    <cpu_cost>0</cpu_cost>
    <time>00:00:01 </time>
    <project>&quot;USERS&quot;.&quot;ID&quot;[NUMBER,22], &quot;NAME&quot;[VARCHAR2,50], &quot;USERS&quot;.&quot;CREATE_TIME&quot;[TIMESTAMP,11]</project>
    <predicates type="filter">&quot;NAME&quot;=&apos;123&apos;</predicates>
    <qblock>SEL$1</qblock>
    <object_alias>USERS@SEL$1</object_alias>
    <other_xml>
      <info type="db_version">11.2.0.2</info>
      <info type="parse_schema"><![CDATA["SYSTEM"]]></info>
      <info type="dynamic_sampling">2</info>
      <info type="plan_hash">3461732445</info>
      <info type="plan_hash_2">493328486</info>
      <outline_data>
        <hint><![CDATA[FULL(@"SEL$1" "USERS"@"SEL$1")]]></hint>
        <hint><![CDATA[OUTLINE_LEAF(@"SEL$1")]]></hint>
        <hint><![CDATA[ALL_ROWS]]></hint>
        <hint><![CDATA[DB_VERSION('11.2.0.2')]]></hint>
        <hint><![CDATA[OPTIMIZER_FEATURES_ENABLE('11.2.0.2')]]></hint>
        <hint><![CDATA[IGNORE_OPTIM_EMBEDDED_HINTS]]></hint>
      </outline_data>
    </other_xml>
  </operation>
</plan>
```


# 如果是复杂一点的查询呢？

## 建表

以下是上述建表语句的Oracle语法版本：

```sql
-- Orders 表的建表语句
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    total_price NUMBER(10, 2),
    order_date DATE
);

-- Customers 表的建表语句
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    customer_name VARCHAR2(100),
    customer_level VARCHAR2(10) CHECK (customer_level IN ('Normal', 'VIP')),
    customer_email VARCHAR2(100)
);
```

## 执行计划

```sql
explain plan set STATEMENT_ID = 'o_1234567890' for SELECT o.order_id, o.total_price, c.customer_name
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.total_price > 100
AND c.customer_level = 'VIP';
select to_clob(dbms_xplan.build_plan_xml(statement_id => 'o_1234567890')) AS XPLAN FROM dual;
```

对应的 xml 结果如下：

```xml
<plan>
  <operation name="SELECT STATEMENT" id="0" depth="0" pos="3">
    <card>1</card>
    <bytes>111</bytes>
    <cost>3</cost>
    <io_cost>3</io_cost>
    <cpu_cost>9261</cpu_cost>
    <time>00:00:01 </time>
  </operation>
  <operation name="NESTED LOOPS" id="1" depth="1" pos="1">
    <project>(#keys=0) &quot;O&quot;.&quot;ORDER_ID&quot;[NUMBER,22], &quot;O&quot;.&quot;TOTAL_PRICE&quot;[NUMBER,22], &quot;C&quot;.&quot;CUSTOMER_NAME&quot;[VARCHAR2,100]</project>
    <qblock>SEL$58A6D7F6</qblock>
    <other_xml>
      <info type="db_version">11.2.0.2</info>
      <info type="parse_schema"><![CDATA["SYSTEM"]]></info>
      <info type="dynamic_sampling">2</info>
      <info type="plan_hash">1519215519</info>
      <info type="plan_hash_2">1408438123</info>
      <outline_data>
        <hint><![CDATA[NLJ_BATCHING(@"SEL$58A6D7F6" "C"@"SEL$1")]]></hint>
        <hint><![CDATA[USE_NL(@"SEL$58A6D7F6" "C"@"SEL$1")]]></hint>
        <hint><![CDATA[LEADING(@"SEL$58A6D7F6" "O"@"SEL$1" "C"@"SEL$1")]]></hint>
        <hint><![CDATA[INDEX(@"SEL$58A6D7F6" "C"@"SEL$1" ("CUSTOMERS"."CUSTOMER_ID"))]]></hint>
        <hint><![CDATA[FULL(@"SEL$58A6D7F6" "O"@"SEL$1")]]></hint>
        <hint><![CDATA[OUTLINE(@"SEL$1")]]></hint>
        <hint><![CDATA[OUTLINE(@"SEL$2")]]></hint>
        <hint><![CDATA[MERGE(@"SEL$1")]]></hint>
        <hint><![CDATA[OUTLINE_LEAF(@"SEL$58A6D7F6")]]></hint>
        <hint><![CDATA[ALL_ROWS]]></hint>
        <hint><![CDATA[DB_VERSION('11.2.0.2')]]></hint>
        <hint><![CDATA[OPTIMIZER_FEATURES_ENABLE('11.2.0.2')]]></hint>
        <hint><![CDATA[IGNORE_OPTIM_EMBEDDED_HINTS]]></hint>
      </outline_data>
    </other_xml>
  </operation>
  <operation name="NESTED LOOPS" id="2" depth="2" pos="1">
    <card>1</card>
    <bytes>111</bytes>
    <cost>3</cost>
    <io_cost>3</io_cost>
    <cpu_cost>9261</cpu_cost>
    <time>00:00:01 </time>
    <project>(#keys=0) &quot;O&quot;.&quot;ORDER_ID&quot;[NUMBER,22], &quot;O&quot;.&quot;TOTAL_PRICE&quot;[NUMBER,22], &quot;C&quot;.ROWID[ROWID,10]</project>
  </operation>
  <operation name="TABLE ACCESS" options="FULL" id="3" depth="3" pos="1">
    <object>ORDERS</object>
    <card>1</card>
    <bytes>39</bytes>
    <cost>2</cost>
    <io_cost>2</io_cost>
    <cpu_cost>0</cpu_cost>
    <time>00:00:01 </time>
    <project>&quot;O&quot;.&quot;ORDER_ID&quot;[NUMBER,22], &quot;O&quot;.&quot;CUSTOMER_ID&quot;[NUMBER,22], &quot;O&quot;.&quot;TOTAL_PRICE&quot;[NUMBER,22]</project>
    <predicates type="filter">&quot;O&quot;.&quot;TOTAL_PRICE&quot;&gt;100</predicates>
    <qblock>SEL$58A6D7F6</qblock>
    <object_alias>O@SEL$1</object_alias>
  </operation>
  <operation name="INDEX" options="UNIQUE SCAN" id="4" depth="3" pos="2">
    <object>SYS_C006990</object>
    <card>1</card>
    <cost>0</cost>
    <io_cost>0</io_cost>
    <cpu_cost>1900</cpu_cost>
    <time>00:00:01 </time>
    <project>&quot;C&quot;.ROWID[ROWID,10]</project>
    <predicates type="access">&quot;O&quot;.&quot;CUSTOMER_ID&quot;=&quot;C&quot;.&quot;CUSTOMER_ID&quot;</predicates>
    <qblock>SEL$58A6D7F6</qblock>
    <object_alias>C@SEL$1</object_alias>
  </operation>
  <operation name="TABLE ACCESS" options="BY INDEX ROWID" id="5" depth="2" pos="2">
    <object>CUSTOMERS</object>
    <card>1</card>
    <bytes>72</bytes>
    <cost>1</cost>
    <io_cost>1</io_cost>
    <cpu_cost>9261</cpu_cost>
    <time>00:00:01 </time>
    <project>&quot;C&quot;.&quot;CUSTOMER_NAME&quot;[VARCHAR2,100]</project>
    <predicates type="filter">&quot;C&quot;.&quot;CUSTOMER_LEVEL&quot;=&apos;VIP&apos;</predicates>
    <qblock>SEL$58A6D7F6</qblock>
    <object_alias>C@SEL$1</object_alias>
  </operation>
</plan>
```

# chat

## Q: 详解介绍一下 oracle 的执行计划

Oracle的执行计划是数据库引擎对SQL查询语句执行的预估执行路径和步骤的计划。该计划描述了数据库引擎在执行查询时选择的操作顺序、访问方法和使用的索引，以及连接、过滤和排序等操作的执行顺序。了解执行计划可以帮助优化查询性能，识别潜在的性能瓶颈并制定改进策略。

以下是Oracle执行计划中常见的关键术语和概念：

1. **操作（Operation）**：执行计划中的每个步骤都被称为一个操作，代表了数据库引擎在执行查询时执行的具体操作，例如表扫描、索引扫描、排序等。

2. **访问方法（Access Method）**：操作使用的方法来访问表或索引的数据。常见的访问方法包括全表扫描、索引扫描、唯一索引扫描、范围扫描等。

3. **连接方法（Join Method）**：当查询涉及多个表时，连接方法描述了如何连接这些表的数据。常见的连接方法包括嵌套循环连接、哈希连接和排序合并连接。

4. **过滤条件（Filter）**：操作中的过滤条件描述了操作所涉及的数据的限制条件，这些条件可以用来过滤出满足查询条件的数据。

5. **估算成本（Estimated Cost）**：每个操作的成本估计，用来评估执行计划的性能。成本通常以数据库引擎内部的单位表示，不是一个实际的时间单位。

6. **行数估计（Estimated Rows）**：每个操作的行数估计，用来预测该操作返回的行数。这对于数据库引擎选择合适的执行路径和优化查询非常重要。

7. **执行计划树（Execution Plan Tree）**：执行计划以树形结构的形式呈现，树的顶部是最外层的操作，而树的叶子节点是最内层的操作。每个操作都可以有一个或多个子操作，表示了执行计划的执行顺序。

8. **优化器（Optimizer）**：Oracle的优化器负责生成执行计划。优化器根据查询的复杂度、可用的索引和统计信息等因素来选择最优的执行路径。

通过查看和分析执行计划，可以确定查询中存在的潜在性能问题，并采取适当的措施来优化查询，例如创建索引、重新编写查询、调整统计信息等。

## Q: 执行的结果如何解析？

这个结果展示了一个典型的Oracle执行计划。每一行代表一个操作，列则显示了该操作的属性，例如操作类型、表名、预估行数、预估字节数、成本等。

要解析这个执行计划，你可以编写一个简单的解析器，通过读取每一行并提取关键信息来分析执行计划。以下是一个基本的Java解析器示例，演示了如何解析执行计划的信息：

```java
import java.util.regex.*;

public class ExecutionPlanParser {
    public static void main(String[] args) {
        String executionPlan = "Plan hash value: 3461732445\n" +
                "\n" +
                "---------------------------------------------------------------------------\n" +
                "| Id  | Operation         | Name  | Rows  | Bytes | Cost (%CPU)| Time     |\n" +
                "---------------------------------------------------------------------------\n" +
                "|   0 | SELECT STATEMENT  |       |     1 |    53 |     2   (0)| 00:00:01 |\n" +
                "|*  1 |  TABLE ACCESS FULL| USERS |     1 |    53 |     2   (0)| 00:00:01 |\n" +
                "---------------------------------------------------------------------------\n" +
                "\n" +
                "Predicate Information (identified by operation id):\n" +
                "---------------------------------------------------\n" +
                "\n" +
                "\"   1 - filter(\"\"NAME\"\"='123')\"\n" +
                "\n" +
                "Note\n" +
                "-----\n" +
                "   - dynamic sampling used for this statement (level=2)";

        // 使用正则表达式匹配操作行
        String regex = "\\|\\s*(\\d+)\\s*\\|\\s*(\\w+(?: \\w+)*)\\s*\\|\\s*(\\w*)\\s*\\|\\s*(\\d+)\\s*\\|\\s*(\\d+)\\s*\\|\\s*(\\d+)\\s*\\((\\d+)\\)\\|\\s*(\\d+:\\d+:\\d+)\\s*\\|";
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(executionPlan);

        // 解析并输出匹配的操作行
        while (matcher.find()) {
            System.out.println("Operation ID: " + matcher.group(1));
            System.out.println("Operation Type: " + matcher.group(2));
            System.out.println("Table Name: " + matcher.group(3));
            System.out.println("Rows: " + matcher.group(4));
            System.out.println("Bytes: " + matcher.group(5));
            System.out.println("Cost: " + matcher.group(6));
            System.out.println("CPU %: " + matcher.group(7));
            System.out.println("Time: " + matcher.group(8));
            System.out.println("-----------------------------------");
        }

        // 使用正则表达式匹配谓词信息
        regex = "\"(.*?)\"";
        pattern = Pattern.compile(regex);
        matcher = pattern.matcher(executionPlan);

        // 解析并输出匹配的谓词信息
        while (matcher.find()) {
            System.out.println("Predicate Information: " + matcher.group(1));
        }

        // 输出Note信息
        regex = "Note\\s*\\n-*\\n(.*?)\\n";
        pattern = Pattern.compile(regex);
        matcher = pattern.matcher(executionPlan);
        if (matcher.find()) {
            System.out.println("Note: " + matcher.group(1));
        }
    }
}
```

这段代码使用正则表达式从执行计划文本中提取了操作的各个属性，并将其打印出来。

你可以根据实际情况扩展这个解析器，以匹配更多操作和属性，并将解析结果用于性能分析和优化。




# 拓展阅读

[Understanding Oracle Explain Plans](https://logicalread.com/understanding-oracle-explain-plans-h01/#.W-QWtpMzY2w)

[如何看懂ORACLE执行计划](https://www.cnblogs.com/cxxjohnson/p/6725967.html)

[在sqlplus中执行set autotrace on 报cannot set autotrace 错误解决方法](https://www.cnblogs.com/cangos/archive/2011/12/19/2293935.html)

[如何看懂Oracle执行计划](https://www.cnblogs.com/cxxjohnson/p/6725967.html)

* any list
{:toc}