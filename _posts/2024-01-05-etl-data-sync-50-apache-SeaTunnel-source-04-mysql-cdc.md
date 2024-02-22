---
layout: post
title: ETL-50-apache SeaTunnel v2.3.3 源码之 connector-cdc-mysql 01 schema change 已经支持了？但是为什么实际测试无效？
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, source-code, sh]
published: true
---

# 基础知识

官方使用配置：https://seatunnel.apache.org/docs/2.3.0/connector-v2/source/MySQL-CDC/

技术设计：[ETL-40-apache SeaTunnel cdc 设计](https://houbb.github.io/2024/01/05/etl-data-sync-40-apache-SeaTunnel-design-02-cdc-overview)

以及底层依赖的 debezium: 

[Debezium-01-为捕获数据更改(change data capture,CDC)提供了一个低延迟的流式处理平台](https://houbb.github.io/2019/02/13/database-sharding-cdc-debezium)

[Debezium-02-Debezium mysql cdc 实战笔记](https://houbb.github.io/2019/02/13/database-sharding-cdc-debezium-02-inaction)

感兴趣的可以先看一下，后续不再赘述。

# 一些疑问

## 快照阶段

```
snapshot.split.size	Integer	No	8096
snapshot.fetch.size	Integer	No	1024
```

fetch size 代表一次批量读的数据，为什么 split size 会大一些？

split size 具体是什么？

## 实际测试遇到的问题

因为数据同步的实际需要，有两个 cdc 任务：

- cdc task1

mysqlA==>neo4j

- cdc task2

mysqlB=>mysqlA

然后发现 task2 本来单个执行应该特别快的任务，此时却卡主了？

变得特变慢，资源各方面应该还算充足，为什么？

## checkpoint

还有就是 checkpoint，seatunnel.yaml 和具体的每一个任务中的 interval。是不是任务配置中的优先级更加的高？

我们带着这些疑问学习一下。

# connector-cdc-mysql

## 整体目录

整体的 java 目录

```
└─org
    └─apache
        └─seatunnel
            └─connectors
                └─seatunnel
                    └─cdc
                        └─mysql
                            ├─config
                            │      MySqlSourceConfig.java
                            │      MySqlSourceConfigFactory.java
                            │      ServerIdRange.java
                            │
                            ├─source
                            │  │  MySqlDialect.java
                            │  │  MySqlIncrementalSource.java
                            │  │  MySqlIncrementalSourceFactory.java
                            │  │  MysqlPooledDataSourceFactory.java
                            │  │  MySqlSourceOptions.java
                            │  │
                            │  ├─eumerator
                            │  │      MySqlChunkSplitter.java
                            │  │
                            │  ├─offset
                            │  │      BinlogOffset.java
                            │  │      BinlogOffsetFactory.java
                            │  │
                            │          ├─binlog
                            │          │      MySqlBinlogFetchTask.java
                            │          │
                            │          └─scan
                            │                  MySqlSnapshotFetchTask.java
                            │                  MySqlSnapshotSplitReadTask.java
                            │                  SnapshotSplitChangeEventSourceContext.java
                            │
                            └─utils
                                    MySqlConnectionUtils.java
                                    MySqlSchema.java
                                    MySqlTypeUtils.java
                                    MySqlUtils.java
                                    TableDiscoveryUtils.java
```

config 配置类

utils 工具类

source 针对 mysql 的方言等处理，eumerator snapshopt 阶段的 id 拆分，offset 涉及到 binlog 的读取偏移等等细节。

我们主要看一下 source 这个目录下的实现类。

## maven 依赖

mysql cdc 有一些依赖，

connector-jdbc / connector-cdc-base。seatunnel 的基础类依赖，后续展开。

debezium-connector-mysql / mysql-connector-java mysql 的三方驱动

```xml
<dependencies>

        <dependency>
            <groupId>org.apache.seatunnel</groupId>
            <artifactId>connector-cdc-base</artifactId>
        </dependency>

        <dependency>
            <groupId>io.debezium</groupId>
            <artifactId>debezium-connector-mysql</artifactId>
            <exclusions>
                <exclusion>
                    <groupId>mysql</groupId>
                    <artifactId>mysql-connector-java</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>org.apache.seatunnel</groupId>
            <artifactId>connector-jdbc</artifactId>
            <version>${project.version}</version>
        </dependency>

        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>mysql</artifactId>
        </dependency>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.2</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>
    </dependencies>
```

# MySqlDialect 

这个是 JdbcDataSourceDialect 针对 mysql 的实现类。

## 基础属性+构造器

```java
/** The {@link JdbcDataSourceDialect} implementation for MySQL datasource. */
public class MySqlDialect implements JdbcDataSourceDialect {

    private static final long serialVersionUID = 1L;

    // 配置
    private final MySqlSourceConfig sourceConfig;
    // mysql schema 信息
    private transient MySqlSchema mySqlSchema;

    // 根据工厂类，直接创建配置    
    public MySqlDialect(MySqlSourceConfigFactory configFactory) {
        this.sourceConfig = configFactory.create(0);
    }

    @Override
    public String getName() {
        return "MySQL";
    }
```

## 基础方法

这里我们直接在代码的基础上加注释，特别的做额外展开，

```java
    @Override
    public boolean isDataCollectionIdCaseSensitive(JdbcSourceConfig sourceConfig) {
        // 判断表的 id 是否大小写敏感

        // 根据配置，创建 jdbc 连接。然后判断 mysql 配置中的 lower_case_table_names
        try (JdbcConnection jdbcConnection = openJdbcConnection(sourceConfig)) {
            return isTableIdCaseSensitive(jdbcConnection);
        } catch (SQLException e) {
            throw new SeaTunnelException("Error reading MySQL variables: " + e.getMessage(), e);
        }
    }

    @Override
    public ChunkSplitter createChunkSplitter(JdbcSourceConfig sourceConfig) {
        // chunk 拆分类，下面展开
        return new MySqlChunkSplitter(sourceConfig, this);
    }

    @Override
    public JdbcConnectionPoolFactory getPooledDataSourceFactory() {
        // mysql 工厂类实现，直接根据 jdbcUrl 构建。底层依赖是 HikariDataSource 
        return new MysqlPooledDataSourceFactory();
    }

    @Override
    public List<TableId> discoverDataCollections(JdbcSourceConfig sourceConfig) {
        MySqlSourceConfig mySqlSourceConfig = (MySqlSourceConfig) sourceConfig;
        try (JdbcConnection jdbcConnection = openJdbcConnection(sourceConfig)) {
            // 工具类，直接找到所有的表信息。
            //  核心步骤：
            // 1）SHOW DATABASES  查看数据库。
            // 2) SHOW FULL TABLES IN " + quote(dbName) + " where Table_Type = 'BASE TABLE'  每一个数据库的表。
            return TableDiscoveryUtils.listTables(
                    jdbcConnection, mySqlSourceConfig.getTableFilters());
        } catch (SQLException e) {
            throw new SeaTunnelException("Error to discover tables: " + e.getMessage(), e);
        }
    }

    @Override
    public TableChanges.TableChange queryTableSchema(JdbcConnection jdbc, TableId tableId) {
        // 表信息，下面展开。
        if (mySqlSchema == null) {
            mySqlSchema =
                    new MySqlSchema(sourceConfig, isDataCollectionIdCaseSensitive(sourceConfig));
        }
        return mySqlSchema.getTableSchema(jdbc, tableId);
    }

    @Override
    public MySqlSourceFetchTaskContext createFetchTaskContext(
            SourceSplitBase sourceSplitBase, JdbcSourceConfig taskSourceConfig) {
                // 上下文创建，一个对象上下文。
        return new MySqlSourceFetchTaskContext(taskSourceConfig, this);
    }

    @Override
    public FetchTask<SourceSplitBase> createFetchTask(SourceSplitBase sourceSplitBase) {
        // 任务
        // 拆分为两个部分：snaopshot 阶段 + 增量阶段任务。
        if (sourceSplitBase.isSnapshotSplit()) {
            return new MySqlSnapshotFetchTask(sourceSplitBase.asSnapshotSplit());
        } else {
            return new MySqlBinlogFetchTask(sourceSplitBase.asIncrementalSplit());
        }
    }
```

## MySqlSnapshotFetchTask 快照阶段拉取任务

### 属性

```java
public class MySqlSnapshotFetchTask implements FetchTask<SourceSplitBase> {

    //snapshot 拆分     
    private final SnapshotSplit split;

    // 任务是否运行？
    private volatile boolean taskRunning = false;

    // 读任务
    private MySqlSnapshotSplitReadTask snapshotSplitReadTask;

    public MySqlSnapshotFetchTask(SnapshotSplit split) {
        this.split = split;
    }
```

SnapshotSplit 对应的就是配置中的拆分属性：

```java
public class SnapshotSplit extends SourceSplitBase {
    private static final long serialVersionUID = 1L;
    private final TableId tableId;
    private final SeaTunnelRowType splitKeyType;
    private final Object[] splitStart;
    private final Object[] splitEnd;

    private final Offset lowWatermark;
    private final Offset highWatermark;
```

### 核心方法 execute

最核心的是 execute 执行方法

```java
    public void execute(FetchTask.Context context) throws Exception {
        // 源 fetch 任务创建
        MySqlSourceFetchTaskContext sourceFetchContext = (MySqlSourceFetchTaskContext) context;
        // 设置为任务运行
        taskRunning = true;
        // 创建读任务，读本身内容也较多，单独展开。
        snapshotSplitReadTask =
                new MySqlSnapshotSplitReadTask(
                        sourceFetchContext.getDbzConnectorConfig(),
                        sourceFetchContext.getOffsetContext(),
                        sourceFetchContext.getSnapshotChangeEventSourceMetrics(),
                        sourceFetchContext.getDatabaseSchema(),
                        sourceFetchContext.getConnection(),
                        sourceFetchContext.getDispatcher(),
                        split);
        //change 事件上下文                
        SnapshotSplitChangeEventSourceContext changeEventSourceContext =
                new SnapshotSplitChangeEventSourceContext();
        // 执行读取        
        SnapshotResult snapshotResult =
                snapshotSplitReadTask.execute(
                        changeEventSourceContext, sourceFetchContext.getOffsetContext());
        // 读取未完成（读取失败）                
        if (!snapshotResult.isCompletedOrSkipped()) {
            taskRunning = false;
            throw new IllegalStateException(
                    String.format("Read snapshot for split %s fail", split));
        }

        // 这里就涉及到水位线的设计
        boolean changed =
                changeEventSourceContext
                        .getHighWatermark()
                        .isAfter(changeEventSourceContext.getLowWatermark());
        // 确切一次：使用幂等+两段式提交来保证                
        if (!context.isExactlyOnce()) {
            taskRunning = false;
            if (changed) {
                log.debug("Skip merge changelog(exactly-once) for snapshot split {}", split);
            }
            return;
        }

        // 这个作用是什么？
        final IncrementalSplit backfillSplit = createBackfillBinlogSplit(changeEventSourceContext);
        // optimization that skip the binlog read when the low watermark equals high
        // watermark
        if (!changed) {
                // bindlog 结束事件任务分发
            dispatchBinlogEndEvent(
                    backfillSplit,
                    ((MySqlSourceFetchTaskContext) context).getOffsetContext().getPartition(),
                    ((MySqlSourceFetchTaskContext) context).getDispatcher());
            taskRunning = false;
            return;
        }

        // 这里会创建一个 binlog split 读的任务
        // 应该是水位线到达之后，采用单线程处理增量的 binlog
        final MySqlBinlogFetchTask.MySqlBinlogSplitReadTask backfillReadTask =
                createBackfillBinlogReadTask(backfillSplit, sourceFetchContext);
        log.info(
                "start execute backfillReadTask, start offset : {}, stop offset : {}",
                backfillSplit.getStartupOffset(),
                backfillSplit.getStopOffset());
        backfillReadTask.execute(
                new SnapshotBinlogSplitChangeEventSourceContext(),
                sourceFetchContext.getOffsetContext());
        log.info("backfillReadTask execute end");

        taskRunning = false;
    }
```

## MySqlSnapshotSplitReadTask 

### 属性

```java
public class MySqlSnapshotSplitReadTask extends AbstractSnapshotChangeEventSource {

    private static final Logger LOG = LoggerFactory.getLogger(MySqlSnapshotSplitReadTask.class);

    /** Interval for showing a log statement with the progress while scanning a single table. */
    private static final Duration LOG_INTERVAL = Duration.ofMillis(10_000);

    //连接配置    
    private final MySqlConnectorConfig connectorConfig;
    // 数据库信息
    private final MySqlDatabaseSchema databaseSchema;
    // jdbc 连接
    private final MySqlConnection jdbcConnection;
    // 事件分发
    private final JdbcSourceEventDispatcher dispatcher;
    // 时钟？应该是在构建数据事件计算耗时的
    private final Clock clock;
    // 拆分的配置
    private final SnapshotSplit snapshotSplit;

    private final MySqlOffsetContext offsetContext;
    // 执行监听类
    private final SnapshotProgressListener snapshotProgressListener;
    // 文本协议字段读取？？
    private final MysqlTextProtocolFieldReader mysqlTextProtocolFieldReader =
            new MysqlTextProtocolFieldReader();
```

### execute 方法

```java
    public SnapshotResult execute(
            ChangeEventSource.ChangeEventSourceContext context, OffsetContext previousOffset)
            throws InterruptedException {
        //这个只是一个简单的对象
        SnapshottingTask snapshottingTask = getSnapshottingTask(previousOffset);
        final SnapshotContext ctx;
        try {
            // 这里直接返回 MySqlSnapshotContext，入参都没用到..    
            ctx = prepare(context);
        } catch (Exception e) {
            LOG.error("Failed to initialize snapshot context.", e);
            throw new RuntimeException(e);
        }
        try {
            return doExecute(context, previousOffset, ctx, snapshottingTask);
        } catch (InterruptedException e) {
            LOG.warn("Snapshot was interrupted before completion");
            throw e;
        } catch (Exception t) {
            throw new DebeziumException(t);
        }
    }
```

重点看一下 doExecute

```java
     protected SnapshotResult doExecute(
            ChangeEventSource.ChangeEventSourceContext context,
            OffsetContext previousOffset,
            AbstractSnapshotChangeEventSource.SnapshotContext snapshotContext,
            AbstractSnapshotChangeEventSource.SnapshottingTask snapshottingTask)
            throws Exception {
        final RelationalSnapshotChangeEventSource.RelationalSnapshotContext ctx =
                (RelationalSnapshotChangeEventSource.RelationalSnapshotContext) snapshotContext;
        ctx.offset = offsetContext;

       //binlog 的低水位
        final BinlogOffset lowWatermark = currentBinlogOffset(jdbcConnection);
        LOG.info(
                "Snapshot step 1 - Determining low watermark {} for split {}",
                lowWatermark,
                snapshotSplit);
        ((SnapshotSplitChangeEventSourceContext) context).setLowWatermark(lowWatermark);
        // 任务分发
        dispatcher.dispatchWatermarkEvent(
                offsetContext.getPartition(), snapshotSplit, lowWatermark, WatermarkKind.LOW);

        LOG.info("Snapshot step 2 - Snapshotting data");
        // 这里其实是比较重要的一个步骤
        // 按照限制查询数据，然后触发对应的 data event 事件
        createDataEvents(ctx, snapshotSplit.getTableId());

       // 高水位
        final BinlogOffset highWatermark = currentBinlogOffset(jdbcConnection);
        LOG.info(
                "Snapshot step 3 - Determining high watermark {} for split {}",
                highWatermark,
                snapshotSplit);
        ((SnapshotSplitChangeEventSourceContext) context).setHighWatermark(highWatermark);
        dispatcher.dispatchWatermarkEvent(
                offsetContext.getPartition(), snapshotSplit, highWatermark, WatermarkKind.HIGH);
        return SnapshotResult.completed(ctx.offset);
    }
```

数据触发的核心代码：

```java
    /** Dispatches the data change events for the records of a single table. */
    private void createDataEventsForTable(
            RelationalSnapshotChangeEventSource.RelationalSnapshotContext snapshotContext,
            EventDispatcher.SnapshotReceiver snapshotReceiver,
            Table table)
            throws InterruptedException {

        long exportStart = clock.currentTimeInMillis();
        LOG.info("Exporting data from split '{}' of table {}", snapshotSplit.splitId(), table.id());

        // 按照条件，构建查询语句。
        final String selectSql =
                buildSplitScanQuery(
                        snapshotSplit.getTableId(),
                        snapshotSplit.getSplitKeyType(),
                        snapshotSplit.getSplitStart() == null,
                        snapshotSplit.getSplitEnd() == null);
        LOG.info(
                "For split '{}' of table {} using select statement: '{}'",
                snapshotSplit.splitId(),
                table.id(),
                selectSql);

        
        try (PreparedStatement selectStatement =
                        readTableSplitDataStatement(
                                jdbcConnection,
                                selectSql,
                                snapshotSplit.getSplitStart() == null,
                                snapshotSplit.getSplitEnd() == null,
                                snapshotSplit.getSplitStart(),
                                snapshotSplit.getSplitEnd(),
                                snapshotSplit.getSplitKeyType().getTotalFields(),
                                connectorConfig.getSnapshotFetchSize());
                ResultSet rs = selectStatement.executeQuery()) {

            ColumnUtils.ColumnArray columnArray = ColumnUtils.toArray(rs, table);
            long rows = 0;
            Threads.Timer logTimer = getTableScanLogTimer();

            // 去数据库执行语句，然后遍历结果集合。
            while (rs.next()) {
                rows++;
                final Object[] row = new Object[columnArray.getGreatestColumnPosition()];

                // 根据元数据信息，做一些处理。
                for (int i = 0; i < columnArray.getColumns().length; i++) {
                    Column actualColumn = table.columns().get(i);
                    row[columnArray.getColumns()[i].position() - 1] =
                            mysqlTextProtocolFieldReader.readField(rs, i + 1, actualColumn, table);
                }
                if (logTimer.expired()) {
                    long stop = clock.currentTimeInMillis();
                    LOG.info(
                            "Exported {} records for split '{}' after {}",
                            rows,
                            snapshotSplit.splitId(),
                            Strings.duration(stop - exportStart));
                    snapshotProgressListener.rowsScanned(table.id(), rows);
                    logTimer = getTableScanLogTimer();
                }
                dispatcher.dispatchSnapshotEvent(
                        table.id(),
                        getChangeRecordEmitter(snapshotContext, table.id(), row),
                        snapshotReceiver);
            }
            LOG.info(
                    "Finished exporting {} records for split '{}', total duration '{}'",
                    rows,
                    snapshotSplit.splitId(),
                    Strings.duration(clock.currentTimeInMillis() - exportStart));
        } catch (SQLException e) {
            throw new ConnectException("Snapshotting of table " + table.id() + " failed", e);
        }
    }
```

获取到每一行信息之后，触发 row 信息：

```java
   protected ChangeRecordEmitter getChangeRecordEmitter(
            AbstractSnapshotChangeEventSource.SnapshotContext snapshotContext,
            TableId tableId,
            Object[] row) {
        snapshotContext.offset.event(tableId, clock.currentTime());
        return new SnapshotChangeRecordEmitter(snapshotContext.offset, row, clock);
    }
```

## MySqlChunkSplitter  拆分实现

实现了 AbstractJdbcSourceChunkSplitter 抽象方法。 

```java
public class MySqlChunkSplitter extends AbstractJdbcSourceChunkSplitter {

    // 配置直接构造
    public MySqlChunkSplitter(JdbcSourceConfig sourceConfig, JdbcDataSourceDialect dialect) {
        super(sourceConfig, dialect);
    }

    // SELECT MIN(%s), MAX(%s) FROM %s     通过SQL直接查询表 id 的最小+最大值
    @Override
    public Object[] queryMinMax(JdbcConnection jdbc, TableId tableId, String columnName)
            throws SQLException {
        return MySqlUtils.queryMinMax(jdbc, tableId, columnName);
    }

    // SELECT MIN(%s) FROM %s WHERE %s > ?    按照范围查询一个最小值
    @Override
    public Object queryMin(
            JdbcConnection jdbc, TableId tableId, String columnName, Object excludedLowerBound)
            throws SQLException {
        return MySqlUtils.queryMin(jdbc, tableId, columnName, excludedLowerBound);
    }

    // "SELECT %s FROM %s", quote(columnName), quote(tableId)    
    // 底层实际根据 inverseSamplingRate 做一个全表查询，按照采样比例返回数据。
    // 为什么要采样？可能要看后续具体的用途
    @Override
    public Object[] sampleDataFromColumn(
            JdbcConnection jdbc, TableId tableId, String columnName, int inverseSamplingRate)
            throws SQLException {
        return MySqlUtils.skipReadAndSortSampleData(jdbc, tableId, columnName, inverseSamplingRate);
    }

    // 查询下一个 chunk 的最大值
    // SELECT MAX($quotedColumn) FROM (SELECT $quotedColumn FROM $quoteTable WHERE $quotedColumn >= ? ORDER BY $quotedColumn ASC LIMIT $chunkSize) 
    // 分成 2 步：
    // 1. 子查询  从目标表，查询指定列，列大于限制条件。
    // 2. 取最大的指定列
    // 从这里也可以看出，我们的拆分列必须是一个可排序类型的，支持排序。不然可能会错乱。

    @Override
    public Object queryNextChunkMax(
            JdbcConnection jdbc,
            TableId tableId,
            String columnName,
            int chunkSize,
            Object includedLowerBound)
            throws SQLException {
        return MySqlUtils.queryNextChunkMax(
                jdbc, tableId, columnName, chunkSize, includedLowerBound);
    }

    // 近似的获取表 count
    // 为什么不是 selct count(*) from table 呢？
    // The statement used to get approximate row count which is less accurate than COUNT(*), but is more efficient for large table.
    // 没有 count(*) 精准，但是在大表的时候会比较快
    // SHOW TABLE STATUS LIKE '%s';  直接从 mysql 的元数据中获取
    @Override
    public Long queryApproximateRowCnt(JdbcConnection jdbc, TableId tableId) throws SQLException {
        return MySqlUtils.queryApproximateRowCnt(jdbc, tableId);
    }

    // 构建拆分的扫描查询语句
    // 没特别仔细看，应该是每一次拆分，构建对应的查询 SQL。
    // 第一次拆分，最后一次拆分做了特别处理。    
    @Override
    public String buildSplitScanQuery(
            TableId tableId,
            SeaTunnelRowType splitKeyType,
            boolean isFirstSplit,
            boolean isLastSplit) {
        return MySqlUtils.buildSplitScanQuery(tableId, splitKeyType, isFirstSplit, isLastSplit);
    }

    // 数据库类别==》转换为 seatunnel 的数据类别    
    @Override
    public SeaTunnelDataType<?> fromDbzColumn(Column splitColumn) {
        return MySqlTypeUtils.convertFromColumn(splitColumn);
    }
}
```


看的出来，没有感情，全是技巧。

# MySqlSchema

## 属性

```java
public class MySqlSchema {
    // 展示建表语句 前缀    
    private static final String SHOW_CREATE_TABLE = "SHOW CREATE TABLE ";
    private static final String DESC_TABLE = "DESC ";

    // 数据库连接配置    
    private final MySqlConnectorConfig connectorConfig;
    // 数据库 schema
    private final MySqlDatabaseSchema databaseSchema;

    // 根据 mapId 的 schema 信息缓存
    private final Map<TableId, TableChange> schemasByTableId;

    public MySqlSchema(MySqlSourceConfig sourceConfig, boolean isTableIdCaseSensitive) {
        this.connectorConfig = sourceConfig.getDbzConnectorConfig();
        // 这里只是构建了 MySqlDatabaseSchema 对象，MySqlDatabaseSchema 本身内容还是有的，下面展开。
        this.databaseSchema =
                MySqlConnectionUtils.createMySqlDatabaseSchema(
                        connectorConfig, isTableIdCaseSensitive);
        this.schemasByTableId = new HashMap<>();
    }
```

show create table，会返回一张表的表名称 + 建表语句。

例如：

```
mysql> show create table user_info;
+-----------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table     | Create Table


                                                                                   |
+-----------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| user_info | CREATE TABLE `user_info` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` varchar(128) NOT NULL COMMENT '用户名',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_info` (`username`) COMMENT '标识索引'
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='枚举映射表'                       |
+-----------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.02 sec)
```

## 方法

```java
  /**
     * Gets table schema for the given table path. It will request to MySQL server by running `SHOW
     * CREATE TABLE` if cache missed.
     */
    public TableChange getTableSchema(JdbcConnection jdbc, TableId tableId) {
        // read schema from cache first
        TableChange schema = schemasByTableId.get(tableId);
        if (schema == null) {
            schema = readTableSchema(jdbc, tableId);
            schemasByTableId.put(tableId, schema);
        }
        return schema;
    }
```

只是从 map 中获取，核心逻辑在 readTableSchema

```java
   private TableChange readTableSchema(JdbcConnection jdbc, TableId tableId) {
        final Map<TableId, TableChange> tableChangeMap = new HashMap<>();

        // 这个就是 show create table tableName，返回建表语句
        // 
        final String sql = SHOW_CREATE_TABLE + MySqlUtils.quote(tableId);
        try {
            jdbc.query(
                    sql,
                    rs -> {
                        if (rs.next()) {
                            // 第一个是表名称，第二个是建表语句    
                            final String ddl = rs.getString(2);

                            final MySqlOffsetContext offsetContext =
                                    MySqlOffsetContext.initial(connectorConfig);

                            // 建表语句是文本，所以这里需要解析一下。        
                            // parse 还挺麻烦的，下面展开
                            List<SchemaChangeEvent> schemaChangeEvents =
                                    databaseSchema.parseSnapshotDdl(
                                            ddl, tableId.catalog(), offsetContext, Instant.now());
                            for (SchemaChangeEvent schemaChangeEvent : schemaChangeEvents) {
                                for (TableChange tableChange :
                                        schemaChangeEvent.getTableChanges()) {
                                    tableChangeMap.put(tableId, tableChange);
                                }
                            }
                        }
                    });
        } catch (SQLException e) {
            throw new RuntimeException(
                    String.format("Failed to read schema for table %s by running %s", tableId, sql),
                    e);
        }
        if (!tableChangeMap.containsKey(tableId)) {
            throw new RuntimeException(
                    String.format("Can't obtain schema for table %s by running %s", tableId, sql));
        }

        return tableChangeMap.get(tableId);
    }
```


### databaseSchema.parseSnapshotDdl

这里其实有一个问题：SchemaChangeEvent 具体作用是什么？

为什么需要从建表语句中获取什么呢？

一般的字段+索引，在 mysql 的元数据管理中应该是有的，解析更加直接方便。

所以这个作用是不是用来直接同步表的创建？

对应配置：

```java
INCLUDE_SCHEMA_CHANGES = Field.create("include.schema.changes").withDisplayName("Include database schema changes").withType(Type.BOOLEAN).withWidth(Width.SHORT).withImportance(Importance.MEDIUM).withDescription("Whether the connector should publish changes in the database schema to a Kafka topic with the same name as the database server ID. Each schema change will be recorded using a key that contains the database name and whose value include logical description of the new schema and optionally the DDL statement(s).The default is 'true'. This is independent of how the connector internally records database history.").withDefault(true);
```

v2.3.3 实际测试的时候，schema 的变化并不会被同步。所以问题出在哪里了？

```java
private List<SchemaChangeEvent> parseDdl(String ddlStatements, String databaseName, MySqlOffsetContext offset, Instant sourceTime, boolean snapshot) {
        List<SchemaChangeEvent> schemaChangeEvents = new ArrayList(3);

        //"BEGIN", "END", "FLUSH PRIVILEGES"  这几个语句会被忽略
        if (this.ignoredQueryStatements.contains(ddlStatements)) {
            return schemaChangeEvents;
        } else {
            // 重置+转换    
            try {
                this.ddlChanges.reset();
                this.ddlParser.setCurrentSchema(databaseName);
                this.ddlParser.parse(ddlStatements, this.tables());
            } catch (MultipleParsingExceptions | ParsingException var8) {
                if (!this.databaseHistory.skipUnparseableDdlStatements()) {
                    throw var8;
                }

                LOGGER.warn("Ignoring unparseable DDL statement '{}': {}", ddlStatements, var8);
            }

            
            // this.isGlobalSetVariableStatement(ddlStatements, databaseName) 这里是跳过 SET 命令语句
            // this.databaseHistory.storeOnlyCapturedTables() 见下方 STORE_ONLY_MONITORED_TABLES_DDL 属性

            if (this.databaseHistory.storeOnlyCapturedTables() && !this.isGlobalSetVariableStatement(ddlStatements, databaseName) && !this.ddlChanges.anyMatch(this.filters)) {
                LOGGER.debug("Changes for DDL '{}' were filtered and not recorded in database history", ddlStatements);
            } else if (!this.ddlChanges.isEmpty()) {
                // 如果发现存在 ddl 变更

                this.ddlChanges.getEventsByDatabase((dbName, events) -> {
                    String sanitizedDbName = dbName == null ? "" : dbName;
                    if (this.acceptableDatabase(dbName)) {
                        Set<TableId> tableIds = new HashSet();
                        events.forEach((event) -> {
                            TableId tableId = this.getTableId(event);
                            if (tableId != null) {
                                tableIds.add(tableId);
                            }

                        });

                        // 遍历每一个 ddl event
                        events.forEach((event) -> {

                            TableId tableId = this.getTableId(event);
                            offset.tableEvent(dbName, tableIds, sourceTime);
                            // 如果是表创建，触发变更事件
                            if (event instanceof DdlParserListener.TableCreatedEvent) {
                                this.emitChangeEvent(offset, schemaChangeEvents, sanitizedDbName, event, tableId, SchemaChangeEventType.CREATE, snapshot);
                            } else if (!(event instanceof DdlParserListener.TableAlteredEvent) && !(event instanceof DdlParserListener.TableIndexCreatedEvent) && !(event instanceof DdlParserListener.TableIndexDroppedEvent)) {
                                // 如果是表 drop，触发对应事件。
                                if (event instanceof DdlParserListener.TableDroppedEvent) {
                                    this.emitChangeEvent(offset, schemaChangeEvents, sanitizedDbName, event, tableId, SchemaChangeEventType.DROP, snapshot);
                                } else if (event instanceof DdlParserListener.SetVariableEvent) {
                                    // 表的属性设置事件
                                    DdlParserListener.SetVariableEvent varEvent = (DdlParserListener.SetVariableEvent)event;
                                    if (varEvent.order() == 0) {
                                        this.emitChangeEvent(offset, schemaChangeEvents, sanitizedDbName, event, tableId, SchemaChangeEventType.DATABASE, snapshot);
                                    }
                                } else {

                                    this.emitChangeEvent(offset, schemaChangeEvents, sanitizedDbName, event, tableId, SchemaChangeEventType.DATABASE, snapshot);
                                }
                            } else {
                                //alter 事件
                                this.emitChangeEvent(offset, schemaChangeEvents, sanitizedDbName, event, tableId, SchemaChangeEventType.ALTER, snapshot);
                            }

                        });
                    }

                });
            } else {
                offset.databaseEvent(databaseName, sourceTime);
                schemaChangeEvents.add(new SchemaChangeEvent(offset.getPartition(), offset.getOffset(), offset.getSourceInfo(), databaseName, (String)null, ddlStatements, (Table)null, SchemaChangeEventType.DATABASE, snapshot));
            }

            return schemaChangeEvents;
        }
    }
```



### STORE_ONLY_MONITORED_TABLES_DDL 属性

`if (this.databaseHistory.storeOnlyCapturedTables()` 对应配置：

```java
Field STORE_ONLY_MONITORED_TABLES_DDL = Field.create("database.history.store.only.monitored.tables.ddl").withDisplayName("Store only DDL that modifies tables that are captured based on include/exclude lists").withType(Type.BOOLEAN).withWidth(Width.SHORT).withImportance(Importance.LOW).withValidation(new Field.Validator[]{DatabaseHistory::validateMonitoredTables}).withDescription("Controls what DDL will Debezium store in database history. By default (false) Debezium will store all incoming DDL statements. If set to true, then only DDL that manipulates a monitored table will be stored (deprecated, use \"" + STORE_ONLY_CAPTURED_TABLES_DDL.name() + "\" instead)").withDefault(false);
```

### 事件的触发

看起来确实已经支持 schema 事件了，后面的事件触发我们大概看一下，

实际只是做了一个保存？什么时候真正的触发呢？

```java
private void emitChangeEvent(MySqlOffsetContext offset, List<SchemaChangeEvent> schemaChangeEvents, String sanitizedDbName, DdlParserListener.Event event, TableId tableId, SchemaChangeEvent.SchemaChangeEventType type, boolean snapshot) {
        schemaChangeEvents.add(new SchemaChangeEvent(offset.getPartition(), offset.getOffset(), offset.getSourceInfo(), sanitizedDbName, (String)null, event.statement(), tableId != null ? this.tableFor(tableId) : null, type, snapshot));
}
```

apply 的代码

```java
   public void applySchemaChange(SchemaChangeEvent schemaChange) {
        // 根据类别，分别处理
        switch (schemaChange.getType()) {
            case CREATE:
            case ALTER:
                schemaChange.getTableChanges().forEach((x) -> {
                    // 创建对应的 schema 信息，key=tableId，放入 schemasByTableId map 中
                    this.buildAndRegisterSchema(x.getTable());
                });
                break;
            case DROP:
                schemaChange.getTableChanges().forEach((x) -> {
                    // 直接 drop    
                    this.removeSchema(x.getId());
                });
        }

        if (this.databaseHistory.storeOnlyCapturedTables() && !this.isGlobalSetVariableStatement(schemaChange.getDdl(), schemaChange.getDatabase())) {
            Stream var10000 = schemaChange.getTables().stream().map(Table::id);
            Tables.TableFilter var10001 = this.filters.dataCollectionFilter();
            Objects.requireNonNull(var10001);
            if (!var10000.anyMatch(var10001::isIncluded)) {
                return;
            }
        }

        LOGGER.debug("Recorded DDL statements for database '{}': {}", schemaChange.getDatabase(), schemaChange.getDdl());
        // 这里执行吗？
        this.record(schemaChange, schemaChange.getTableChanges());
    }
```

这里有一个数据库 history, MySqlSourceConfigFactory 中默认配置如下：

```java
        props.setProperty("database.history", EmbeddedDatabaseHistory.class.getCanonicalName());
        props.setProperty("database.history.instance.name", UUID.randomUUID() + "_" + subtaskId);
        props.setProperty("database.history.skip.unparseable.ddl", String.valueOf(true));
        props.setProperty("database.history.refer.ddl", String.valueOf(true));
```


所谓 record 就是通知所有的 listener 监听者

```java
    public void record(
            Map<String, ?> source,
            Map<String, ?> position,
            String databaseName,
            String schemaName,
            String ddl,
            TableChanges changes)
            throws DatabaseHistoryException {
        final HistoryRecord record =
                new HistoryRecord(source, position, databaseName, schemaName, ddl, changes);
        listener.onChangeApplied(record);
    }
```

DatabaseHistoryListener 默认又是什么呢？

感觉还是直接 debug 来的更加方便，下午我们本地 debug 一下，看一下具体的流程。

# 本地 debug

## conf

我们来模拟从源 mysql cdc 同步到目标库 mysql。

```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  parallelism = 1
  job.mode = "STREAMING"
  job.name = "merge_cdc.schema-STREAMING"
  checkpoint.interval = 10000
}
source{
    MySQL-CDC {
        base-url = "jdbc:mysql://127.0.0.1:3306/cdc?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.jdbc.Driver"
        username = "admin"
        password = "123456"
        table-names = ["cdc.user_info", "cdc.role_info"]

        startup.mode = "initial"
    }
}

transform {
    # If you would like to get more information about how to configure seatunnel and see full list of transform plugins,
    # please go to https://seatunnel.apache.org/docs/transform-v2/sql
}

sink {
    jdbc {
        database = "cdc_target"
        url = "jdbc:mysql://localhost:3306/cdc_target?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.cj.jdbc.Driver"
        user = "admin"
        password = "123456"
        generate_sink_sql = true
    }
}
```

## 准备工作

建表语句：

```sql
drop table role_info;
CREATE TABLE "role_info" (
  "id" int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  "role_name" varchar(128) NOT NULL COMMENT '角色名',
  "create_time" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  "update_time" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY ("id")
) ENGINE=InnoDB COMMENT='角色表';

drop table user_info;
CREATE TABLE "user_info" (
  "id" int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  "username" varchar(128) NOT NULL COMMENT '用户名',
  "create_time" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  "update_time" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  "remark" varchar(128) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY ("id")
) ENGINE=InnoDB COMMENT='用户表';
```

首先让 cdc 和 cdc_target 两个库都是相同的表。

```
mysql> use cdc;
Database changed
mysql>
mysql> show tables;
+---------------+
| Tables_in_cdc |
+---------------+
| role_info     |
| user_info     |
+---------------+
2 rows in set (0.00 sec)

mysql>
mysql>
mysql> use cdc_target;
Database changed
mysql>
mysql>
mysql> show tables;
+----------------------+
| Tables_in_cdc_target |
+----------------------+
| role_info            |
| user_info            |
+----------------------+
2 rows in set (0.00 sec)
```

## 启动

发现启动的时候，其实就会加载处理源数据库的信息。

日志可以看到：

```
2024-02-22 13:53:42,825 DEBUG io.debezium.connector.mysql.MySqlDatabaseSchema - Processing snapshot DDL 'CREATE TABLE "user_info" (
  "id" int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  "username" varchar(128) NOT NULL COMMENT '用户名',
  "create_time" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  "update_time" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  "remark" varchar(128) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY ("id")
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COMMENT='用户表'' for database 'cdc'
```

## s1-源头加表，配置文件监听表不变。

我们暂停服务，在 mysql 源头创建表。

配置不变化，看一下目标库会加表吗？

```sql
CREATE TABLE `user_info_test` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` varchar(128) NOT NULL COMMENT '用户名',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_info` (`username`) COMMENT '标识索引'
) ENGINE=InnoDB COMMENT='用户信息测试';
```

确认：

```
mysql> use cdc;
Database changed
mysql> show tables;
+----------------+
| Tables_in_cdc  |
+----------------+
| role_info      |
| user_info      |
| user_info_test |
+----------------+
```

重新启动测试代码。

发现目标库没有新的表，是需要改配置文件吗？

## s2-调整配置文件

我们在 1 的基础上，修改 source 配置，加上新表。

重新启动：

```conf
source{
    MySQL-CDC {
        base-url = "jdbc:mysql://127.0.0.1:3306/cdc?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.jdbc.Driver"
        username = "admin"
        password = "123456"
        table-names = ["cdc.user_info", "cdc.role_info", "cdc.user_info_test"]

        startup.mode = "initial"
    }
}
```

启动之后，发现目标库并没有建表。

我们在源头插入一条数据呢？

```sql
insert into user_info_test(username) values ('t1');
```

此时发现和以前的测试场景就一样了，目标表 不存在，直接报错：

```sql
Caused by: java.sql.SQLSyntaxErrorException: Table 'cdc_target.user_info_test' doesn't exist
	at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:120)
	at com.mysql.cj.jdbc.exceptions.SQLExceptionsMapping.translateException(SQLExceptionsMapping.java:122)
	at com.mysql.cj.jdbc.ClientPreparedStatement.executeInternal(ClientPreparedStatement.java:953)
	at com.mysql.cj.jdbc.ClientPreparedStatement.executeUpdateInternal(ClientPreparedStatement.java:1098)
	at com.mysql.cj.jdbc.ClientPreparedStatement.executeBatchSerially(ClientPreparedStatement.java:832)
	... 23 more

	at org.apache.seatunnel.engine.client.job.ClientJobProxy.waitForJobComplete(ClientJobProxy.java:122)
	at org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand.execute(ClientExecuteCommand.java:184)
	... 2 more
```

## debug 为何 ddl 无效？

为什么代码中有，但实际无效呢？

是需要配置吗？还是能力目前不全？

### 配置简化

我们把 debug 的表只保留一个 cdc 有的，cdc_target 没有的。

```conf
source{
    MySQL-CDC {
        base-url = "jdbc:mysql://127.0.0.1:3306/cdc?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.jdbc.Driver"
        username = "admin"
        password = "123456"
        table-names = ["cdc.user_info_test"]

        startup.mode = "initial"
    }
}
```

### debug 位置

主要看一下为什么 schema 变化未生效。

MySqlDatabaseSchema 类。

ddl 的转换：

```java
List<SchemaChangeEvent> parseDdl(String ddlStatements, String databaseName, MySqlOffsetContext offset, Instant sourceTime, boolean snapshot)
```

以及 sql 的执行位置：

```java
applySchemaChange(SchemaChangeEvent schemaChange)
```

1）监听到建表语句的创建

可以看到会走到这里

![建表创建](https://img-blog.csdnimg.cn/direct/23a92fdc5d1a482ba260e55c84bd3b4f.png#pic_center)

Event 信息：

```
SchemaChangeEvent [database=cdc, schema=null, ddl=CREATE TABLE "user_info_test" (
  "id" int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  "username" varchar(128) NOT NULL COMMENT '用户名',
  "create_time" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  "update_time" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY ("id"),
  UNIQUE KEY "user_info" ("username") COMMENT '标识索引'
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='用户信息测试', tables=[columns: {
  id INT UNSIGNED(10) NOT NULL AUTO_INCREMENTED GENERATED
  username VARCHAR(128) CHARSET utf8 NOT NULL
  create_time TIMESTAMP NOT NULL DEFAULT VALUE 1970-01-01T00:00:00Z
  update_time TIMESTAMP NOT NULL DEFAULT VALUE 1970-01-01T00:00:00Z
}
primary key: [id]
default charset: utf8
], type=CREATE]
```

发现这个 parseDdl 被处理多次，但是没看到 apply 被调用？

# apply 什么时候被调用的?

## 调用的地方

SinkFlowLifeCycle#received 方法中，有这个部分。

```java
else if (record.getData() instanceof SchemaChangeEvent) {
    if (prepareClose) {
        return;
    }
    SchemaChangeEvent event = (SchemaChangeEvent) record.getData();
    writer.applySchemaChange(event);
} 
```

这个是直接接收到对应的消息 record。

除了数据本身，只看了锁。

```
CheckpointBarrier 6 @ 1708583703970 Options: CHECKPOINT_TYPE
```

发现并没有被调用到。

# 参考资料

* any list
{:toc}