---
layout: post
title: Apache Calcite 源码分析-04-CalciteConnection sql execute 执行过程
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 回顾

我们上一节看了 calcite 如何委托给 calcite Driver 获取 connection 的，可以看出如何得到 CalciteConnection

CalciteConnection 得到后我们可以执行语句：

```java
Statement statement = calciteConnection.createStatement();
ResultSet resultSet = statement.executeQuery(sql);
```

# statatement 的创建：

第一步创建 statatement，见：

```java
public AvaticaStatement createStatement() throws SQLException {
        this.checkOpen();
    return this.createStatement(1003, 1007, this.holdability);
}

public AvaticaStatement createStatement(int resultSetType, int resultSetConcurrency, int resultSetHoldability) throws SQLException {
        this.checkOpen();
        return this.factory.newStatement(this, (Meta.StatementHandle)null, resultSetType, resultSetConcurrency, resultSetHoldability);
}
```

AvaticaJdbc41Factory#newStatement

```java
public AvaticaStatement newStatement(AvaticaConnection connection, Meta.StatementHandle h, int resultSetType, int resultSetConcurrency, int resultSetHoldability) {
        return new AvaticaJdbc41Statement(connection, h, resultSetType, resultSetConcurrency, resultSetHoldability);
}
```

创建的是 `AvaticaStatement` 的子类实现 AvaticaJdbc41Statement

# statement.executeQuery(sql)

接下来，我们重点看一下 statement.executeQuery(sql) 的内容。

```java
public ResultSet executeQuery(String sql) throws SQLException {
    // 校验是否可用
        this.checkOpen();
        this.checkNotPreparedOrCallable("executeQuery(String)");

        try {
            // 内部执行 sql?
            this.executeInternal(sql);
            if (this.openResultSet == null) {
                throw AvaticaConnection.HELPER.createException("Statement did not return a result set");
            } else {
                return this.openResultSet;
            }
        } catch (RuntimeException var3) {
            throw AvaticaConnection.HELPER.createException("Error while executing SQL \"" + sql + "\": " + var3.getMessage(), var3);
        }
    }
```

展开

```java
protected ResultSet executeQueryInternal(Meta.Signature signature, boolean isUpdate) throws SQLException {
        return this.connection.executeQueryInternal(this, signature, (Meta.Frame)null, (QueryState)null, isUpdate);
}
```

## AvaticaConnection#executeQueryInternal

AvaticaConnection#executeQueryInternal

```java
protected ResultSet executeQueryInternal(AvaticaStatement statement, Meta.Signature signature, Meta.Frame firstFrame, QueryState state, boolean isUpdate) throws SQLException {
        Meta.Frame frame = firstFrame;
        Meta.Signature signature2 = signature;
        synchronized(statement) {
            if (statement.openResultSet != null) {
                AvaticaResultSet rs = statement.openResultSet;
                statement.openResultSet = null;

                try {
                    rs.close();
                } catch (Exception var15) {
                    throw HELPER.createException("Error while closing previous result set", var15);
                }
            }

            try {
                if (statement.isWrapperFor(AvaticaPreparedStatement.class)) {
                    AvaticaPreparedStatement pstmt = (AvaticaPreparedStatement)statement;
                    Meta.StatementHandle handle = pstmt.handle;
                    if (isUpdate) {
                        handle = new Meta.StatementHandle(handle.connectionId, handle.id, (Meta.Signature)null);
                    }

                    Meta.ExecuteResult executeResult = this.meta.execute(handle, pstmt.getParameterValues(), statement.getFetchSize());
                    Meta.MetaResultSet metaResultSet = (Meta.MetaResultSet)executeResult.resultSets.get(0);
                    frame = metaResultSet.firstFrame;
                    statement.updateCount = metaResultSet.updateCount;
                    signature2 = ((Meta.MetaResultSet)executeResult.resultSets.get(0)).signature;
                }
            } catch (Exception var14) {
                var14.printStackTrace();
                throw HELPER.createException(var14.getMessage(), var14);
            }

            TimeZone timeZone = this.getTimeZone();
            if (frame == null && signature2 == null && statement.updateCount != -1L) {
                statement.openResultSet = null;
            } else {
                statement.openResultSet = this.factory.newResultSet(statement, state, signature2, timeZone, frame);
            }
        }

        try {
            if (statement.openResultSet != null) {
                statement.openResultSet.execute();
                this.isUpdateCapable(statement);
            }
        } catch (Exception var16) {
            throw HELPER.createException("exception while executing query: " + var16.getMessage(), var16);
        }

        return statement.openResultSet;
    }
```


# TODO...

# 参考资料

https://www.lixin.help/2021/04/11/Calcite-Driver-Register.html

https://www.lixin.help/2021/04/11/Calcite-CalciteJdbc41Statement.html

* any list
{:toc}