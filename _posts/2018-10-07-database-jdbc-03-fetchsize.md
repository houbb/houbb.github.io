---
layout: post
title: database Jdbc-03-fetchsize
date:  2018-10-07 14:51:25 +0800
categories: [Database]
tags: [database, jdbc, sql, sh]
published: true
---

# 聊聊jdbc statement的fetchSize 

在使用MySQL的JDBC时，如果查询结果集过大，使用一次查询，可能会出现Java.lang.OutOfMemoryError: Java heap space问题，因为DB服务器端一次将查询到的结果集全部发送到Java端保存在内存中而造成OOM。

MySQL JDBC需要一条SQL从数据库读取大量数据，而不发生JVM OOM，可以采用以下方法之一：

1、当statement设置以下属性时，采用的是流数据接收方式，每次只从服务器接收部份数据，直到所有数据处理完毕，不会发生JVM OOM。

```java
setResultSetType(ResultSet.TYPE_FORWARD_ONLY);
setFetchSize(Integer.MIN_VALUE); 
```

2、调用statement的enableStreamingResults方法，实际上enableStreamingResults方法内部封装的就是第1种方式。

3、设置连接属性useCursorFetch=true (5.0版驱动开始支持)，statement以TYPE_FORWARD_ONLY打开，再设置fetch size参数，表示采用服务器端游标，每次从服务器取fetch_size条数据。

## 解决方式

故采用如下方式就可以解决OOM问题：

```java
ps = (PreparedStatement) con.prepareStatement("select * from bigTable", ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY);
ps.setFetchSize(Integer.MIN_VALUE);
ps.setFetchDirection(ResultSet.FETCH_REVERSE);
```

在Statement和ResultSet接口中都有setFetchSize方法

```java
void setFetchSize(int rows) throws SQLException
```

Statement接口中是这样解释的：

为JDBC 驱动程序提供一个提示，它提示此Statement 生成的ResultSet 对象需要更多行时应该从数据库获取的行数。指定的行数仅影响使用此语句创建的结果集合。如果指定的值为 0，则忽略该提示。默认值为 0。

ResultSet中是这样解释的：

为 JDBC 驱动程序设置此ResultSet 对象需要更多行时应该从数据库获取的行数。如果指定的获取大小为零，则 JDBC 驱动程序忽略该值，随意对获取大小作出它自己的最佳猜测。默认值由创建结果集的Statement 对象设置。获取大小可以在任何时间更改。

网上有下面这样的一段摘录1：

缺省时，驱动程序一次从查询里获取所有的结果。这样可能对于大的数据集来说是不方便的， 因此 JDBC 驱动提供了一个用于设置从一个数据库游标抽取若干行的 ResultSet 的方法。在连接的客户端这边缓冲了一小部分数据行，并且在用尽之后， 则通过重定位游标检索下一个数据行块。

摘录2:

setFetchSize 最主要是为了减少网络交互次数设计的。访问ResultSet时，如果它每次只从服务器上取一行数据，则会产生大量的开销。setFetchSize的意 思是当调用rs.next时，ResultSet会一次性从服务器上取得多少行数据回来，这样在下次rs.next时，它可以直接从内存中获取出数据而不 需要网络交互，提高了效率。 

这个设置可能会被某些JDBC驱动忽略的，而且设置过大也会造成内存的上升。

# 源码分析：

fetchSize

这里以postgres jdbc driver为例，主要是因为postgres的jdbc driver有公开源码，而且命名比较规范。

之前看oracle jdbc，由于没有源码，反编译出来一大堆var1，var2等的变量命名，非常晦涩。

默认情况下pgjdbc driver会一次性拉取所有结果集，也就是在executeQuery的时候。对于大数据量的查询来说，非常容易造成OOM。这种场景就需要设置fetchSize，执行query的时候先返回第一批数据，之后next完一批数据之后再去拉取下一批。

但是这个有几个要求：

数据库必须使用V3协议，即pg7.4+

connection的autoCommit必须为false，因为开启autoCommit的话，查询完成cursor会被关闭，那么下次就不能再fetch了。另外ResultSet必须是ResultSet.TYPE_FORWARD_ONLY类型，这个是默认的。也就是说无法向后滚动。

查询语句必须是单条，不能是用分号组成的多条查询

# 实例代码

```java
    @Test
    public void testReadTimeout() throws SQLException {
        Connection connection = dataSource.getConnection();
        //https://jdbc.postgresql.org/documentation/head/query.html
        connection.setAutoCommit(false); //NOTE 为了设置fetchSize,必须设置为false

        String sql = "select * from demo_table";
        PreparedStatement pstmt;
        try {
            pstmt = (PreparedStatement)connection.prepareStatement(sql);
            pstmt.setFetchSize(50);
            System.out.println("ps.getQueryTimeout():" + pstmt.getQueryTimeout());
            System.out.println("ps.getFetchSize():" + pstmt.getFetchSize());
            System.out.println("ps.getFetchDirection():" + pstmt.getFetchDirection());
            System.out.println("ps.getMaxFieldSize():" + pstmt.getMaxFieldSize());

            ResultSet rs = pstmt.executeQuery();
            //NOTE 这里返回了就代表statement执行完成,默认返回fetchSize的数据
            int col = rs.getMetaData().getColumnCount();
            System.out.println("============================");
            while (rs.next()) {
                for (int i = 1; i <= col; i++) {
                    System.out.print(rs.getObject(i));
                }
                System.out.println("");
            }
            System.out.println("============================");
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            //close resources
        }
    }
```

# 源码解析

postgresql-9.4.1212.jre7-sources.jar!/org/postgresql/jdbc/PgPreparedStatement.java

```java
/*
   * A Prepared SQL query is executed and its ResultSet is returned
   *
   * @return a ResultSet that contains the data produced by the * query - never null
   *
   * @exception SQLException if a database access error occurs
   */
  public java.sql.ResultSet executeQuery() throws SQLException {
    if (!executeWithFlags(0)) {
      throw new PSQLException(GT.tr("No results were returned by the query."), PSQLState.NO_DATA);
    }

    if (result.getNext() != null) {
      throw new PSQLException(GT.tr("Multiple ResultSets were returned by the query."),
          PSQLState.TOO_MANY_RESULTS);
    }

    return result.getResultSet();
  }
executeQuery首先调用executeWithFlags方法，源码里头直接写在if里头的，这个不是推荐的方式，因为放在if比较容易忽略。
executeWithFlags
public boolean executeWithFlags(int flags) throws SQLException {
    try {
      checkClosed();

      if (connection.getPreferQueryMode() == PreferQueryMode.SIMPLE) {
        flags |= QueryExecutor.QUERY_EXECUTE_AS_SIMPLE;
      }

      execute(preparedQuery, preparedParameters, flags);

      return (result != null && result.getResultSet() != null);
    } finally {
      defaultTimeZone = null;
    }
  }

protected final void execute(CachedQuery cachedQuery, ParameterList queryParameters, int flags)
      throws SQLException {
    try {
      executeInternal(cachedQuery, queryParameters, flags);
    } catch (SQLException e) {
      // Don't retry composite queries as it might get partially executed
      if (cachedQuery.query.getSubqueries() != null
          || !connection.getQueryExecutor().willHealOnRetry(e)) {
        throw e;
      }
      cachedQuery.query.close();
      // Execute the query one more time
      executeInternal(cachedQuery, queryParameters, flags);
    }
}
```

这里又调用execute方法，在调用executeInternal

executeInternal

postgresql-9.4.1212.jre7-sources.jar!/org/postgresql/jdbc/PgPreparedStatement.java

```java
private void executeInternal(CachedQuery cachedQuery, ParameterList queryParameters, int flags)
      throws SQLException {
    closeForNextExecution();

    // Enable cursor-based resultset if possible.
    if (fetchSize > 0 && !wantsScrollableResultSet() && !connection.getAutoCommit()
        && !wantsHoldableResultSet()) {
      flags |= QueryExecutor.QUERY_FORWARD_CURSOR;
    }

    if (wantsGeneratedKeysOnce || wantsGeneratedKeysAlways) {
      flags |= QueryExecutor.QUERY_BOTH_ROWS_AND_STATUS;

      // If the no results flag is set (from executeUpdate)
      // clear it so we get the generated keys results.
      //
      if ((flags & QueryExecutor.QUERY_NO_RESULTS) != 0) {
        flags &= ~(QueryExecutor.QUERY_NO_RESULTS);
      }
    }

    if (isOneShotQuery(cachedQuery)) {
      flags |= QueryExecutor.QUERY_ONESHOT;
    }
    // Only use named statements after we hit the threshold. Note that only
    // named statements can be transferred in binary format.

    if (connection.getAutoCommit()) {
      flags |= QueryExecutor.QUERY_SUPPRESS_BEGIN;
    }

    // updateable result sets do not yet support binary updates
    if (concurrency != ResultSet.CONCUR_READ_ONLY) {
      flags |= QueryExecutor.QUERY_NO_BINARY_TRANSFER;
    }

    Query queryToExecute = cachedQuery.query;

    if (queryToExecute.isEmpty()) {
      flags |= QueryExecutor.QUERY_SUPPRESS_BEGIN;
    }

    if (!queryToExecute.isStatementDescribed() && forceBinaryTransfers
        && (flags & QueryExecutor.QUERY_EXECUTE_AS_SIMPLE) == 0) {
      // Simple 'Q' execution does not need to know parameter types
      // When binaryTransfer is forced, then we need to know resulting parameter and column types,
      // thus sending a describe request.
      int flags2 = flags | QueryExecutor.QUERY_DESCRIBE_ONLY;
      StatementResultHandler handler2 = new StatementResultHandler();
      connection.getQueryExecutor().execute(queryToExecute, queryParameters, handler2, 0, 0,
          flags2);
      ResultWrapper result2 = handler2.getResults();
      if (result2 != null) {
        result2.getResultSet().close();
      }
    }

    StatementResultHandler handler = new StatementResultHandler();
    result = null;
    try {
      startTimer();
      connection.getQueryExecutor().execute(queryToExecute, queryParameters, handler, maxrows,
          fetchSize, flags);
    } finally {
      killTimerTask();
    }
    result = firstUnclosedResult = handler.getResults();

    if (wantsGeneratedKeysOnce || wantsGeneratedKeysAlways) {
      generatedKeys = result;
      result = result.getNext();

      if (wantsGeneratedKeysOnce) {
        wantsGeneratedKeysOnce = false;
      }
    }
}
```

主要看这段

```java
connection.getQueryExecutor().execute(queryToExecute, queryParameters, handler, maxrows,fetchSize, flags);
```

通过把fetchSize传递进去，拉取指定大小的 result 最后调用sendExecute以及processResults方法来拉取数据

`postgresql-9.4.1212.jre7-sources.jar!/org/postgresql/core/v3/QueryExecutorImpl.java`

```java
private void sendExecute(SimpleQuery query, Portal portal, int limit) throws IOException {
    //
    // Send Execute.
    //

    if (logger.logDebug()) {
      logger.debug(" FE=> Execute(portal=" + portal + ",limit=" + limit + ")");
    }

    byte[] encodedPortalName = (portal == null ? null : portal.getEncodedPortalName());
    int encodedSize = (encodedPortalName == null ? 0 : encodedPortalName.length);

    // Total size = 4 (size field) + 1 + N (source portal) + 4 (max rows)
    pgStream.sendChar('E'); // Execute
    pgStream.sendInteger4(4 + 1 + encodedSize + 4); // message size
    if (encodedPortalName != null) {
      pgStream.send(encodedPortalName); // portal name
    }
    pgStream.sendChar(0); // portal name terminator
    pgStream.sendInteger4(limit); // row limit

    pendingExecuteQueue.add(new ExecuteRequest(query, portal, false));
  }

protected void processResults(ResultHandler handler, int flags) throws IOException {
    boolean noResults = (flags & QueryExecutor.QUERY_NO_RESULTS) != 0;
    boolean bothRowsAndStatus = (flags & QueryExecutor.QUERY_BOTH_ROWS_AND_STATUS) != 0;

    List<byte[][]> tuples = null;

    int c;
    boolean endQuery = false;

    // At the end of a command execution we have the CommandComplete
    // message to tell us we're done, but with a describeOnly command
    // we have no real flag to let us know we're done. We've got to
    // look for the next RowDescription or NoData message and return
    // from there.
    boolean doneAfterRowDescNoData = false;

    while (!endQuery) {
      c = pgStream.receiveChar();
      switch (c) {
        case 'A': // Asynchronous Notify
          receiveAsyncNotify();
          break;

        case '1': // Parse Complete (response to Parse)
          pgStream.receiveInteger4(); // len, discarded

          SimpleQuery parsedQuery = pendingParseQueue.removeFirst();
          String parsedStatementName = parsedQuery.getStatementName();
          //...
      }
  }
}
```

next
postgresql-9.4.1212.jre7-sources.jar!/org/postgresql/jdbc/PgResultSet.java

```java
public boolean next() throws SQLException {
    checkClosed();
    if (onInsertRow) {
      throw new PSQLException(GT.tr("Can''t use relative move methods while on the insert row."),
          PSQLState.INVALID_CURSOR_STATE);
    }
    if (current_row + 1 >= rows.size()) {
      if (cursor == null || (maxRows > 0 && row_offset + rows.size() >= maxRows)) {
        current_row = rows.size();
        this_row = null;
        rowBuffer = null;
        return false; // End of the resultset.
      }

      // Ask for some more data.
      row_offset += rows.size(); // We are discarding some data.

      int fetchRows = fetchSize;
      if (maxRows != 0) {
        if (fetchRows == 0 || row_offset + fetchRows > maxRows) {
          // Fetch would exceed maxRows, limit it.
          fetchRows = maxRows - row_offset;
        }
      }
      // Execute the fetch and update this resultset.
      connection.getQueryExecutor().fetch(cursor, new CursorResultHandler(), fetchRows);
      current_row = 0;

      // Test the new rows array.
      if (rows.isEmpty()) {
        this_row = null;
        rowBuffer = null;
        return false;
      }
    } else {
      current_row++;
    }
    initRowBuffer();
    return true;
  }
```

next方法可以看到，首先判断current_row + 1是否小于rows.size()，小于的话，那就current_row++；否则表示这一批fetchSize的数据被消费完了，需要判断是否结束或者拉取下一批数据，之后更新current_row

```java
connection.getQueryExecutor().fetch(cursor, new CursorResultHandler(), fetchRows);
```

这个方法拉取fetchRows条数的下一批数据

initRowBuffer

```java
private void initRowBuffer() {
    this_row = rows.get(current_row);
    // We only need a copy of the current row if we're going to
    // modify it via an updatable resultset.
    if (resultsetconcurrency == ResultSet.CONCUR_UPDATABLE) {
      rowBuffer = new byte[this_row.length][];
      System.arraycopy(this_row, 0, rowBuffer, 0, this_row.length);
    } else {
      rowBuffer = null;
    }
}
```

这就是next移动之后，把要消费的这行数据放到rowBuffer里头。

# 小结

对于查询数据量大的场景下，非常有必要设置fetchSize，否则全量拉取很容易OOM，但是使用fetchSize的时候，要求数据能够在遍历resultSet的时候及时处理，而不是收集完所有数据返回回去再去处理。

# 参考资料 

[聊聊jdbc statement的fetchSize](https://www.cnblogs.com/fnlingnzb-learner/p/10245971.html)

https://blog.csdn.net/zero__007/article/details/51464386

https://www.cnblogs.com/firstdream/p/7834833.html

https://blog.csdn.net/bisal/article/details/82735614

* any list
{:toc}