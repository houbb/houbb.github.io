---
layout: post
title:  Quartz 15-JDBCJobStore 模式介绍
date:  2017-12-19 14:43:25 +0800
categories: [Schedule]
tags: [java, quartz, job, schedule, sh]
published: true
---

# 表关系和解释

## 表关系

![表关系](https://img-blog.csdn.net/20170204145258590?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY0ODU1NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

## 解释

```
QRTZ_CALENDARS 以 Blob 类型存储 Quartz 的 Calendar 信息 
QRTZ_CRON_TRIGGERS 存储 Cron Trigger，包括 Cron表达式和时区信息 
QRTZ_FIRED_TRIGGERS 存储与已触发的 Trigger 相关的状态信息，以及相联 Job的执行信息 QRTZ_PAUSED_TRIGGER_GRPS 存储已暂停的 Trigger 组的信息 
QRTZ_SCHEDULER_STATE 存储少量的有关 Scheduler 的状态信息，和别的 Scheduler实例(假如是用于一个集群中) 
QRTZ_LOCKS 存储程序的悲观锁的信息(假如使用了悲观锁) 
QRTZ_JOB_DETAILS 存储每一个已配置的 Job 的详细信息 
QRTZ_JOB_LISTENERS 存储有关已配置的 JobListener 的信息 
QRTZ_SIMPLE_TRIGGERS 存储简单的Trigger，包括重复次数，间隔，以及已触的次数 
QRTZ_BLOG_TRIGGERS Trigger 作为 Blob 类型存储(用于 Quartz 用户用 JDBC创建他们自己定制的 Trigger 类型，JobStore 并不知道如何存储实例的时候) 
QRTZ_TRIGGER_LISTENERS 存储已配置的 TriggerListener 的信息 
QRTZ_TRIGGERS 存储已配置的 Trigger 的信息 
```

## 数据库脚本

注释内容：

```
#
# In your Quartz properties file, you'll need to set
# org.quartz.jobStore.driverDelegateClass = org.quartz.impl.jdbcjobstore.StdJDBCDelegate
#
#
# By: Ron Cordell - roncordell
#  I didn't see this anywhere, so I thought I'd post it here. This is the script from Quartz to create the tables in a MySQL database, modified to use INNODB instead of MYISAM.
```

- mysql 脚本

```sql
DROP TABLE IF EXISTS QRTZ_FIRED_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_PAUSED_TRIGGER_GRPS;
DROP TABLE IF EXISTS QRTZ_SCHEDULER_STATE;
DROP TABLE IF EXISTS QRTZ_LOCKS;
DROP TABLE IF EXISTS QRTZ_SIMPLE_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_SIMPROP_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_CRON_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_BLOB_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_JOB_DETAILS;
DROP TABLE IF EXISTS QRTZ_CALENDARS;

CREATE TABLE QRTZ_JOB_DETAILS(
SCHED_NAME VARCHAR(120) NOT NULL,
JOB_NAME VARCHAR(190) NOT NULL,
JOB_GROUP VARCHAR(190) NOT NULL,
DESCRIPTION VARCHAR(250) NULL,
JOB_CLASS_NAME VARCHAR(250) NOT NULL,
IS_DURABLE VARCHAR(1) NOT NULL,
IS_NONCONCURRENT VARCHAR(1) NOT NULL,
IS_UPDATE_DATA VARCHAR(1) NOT NULL,
REQUESTS_RECOVERY VARCHAR(1) NOT NULL,
JOB_DATA BLOB NULL,
PRIMARY KEY (SCHED_NAME,JOB_NAME,JOB_GROUP))
ENGINE=InnoDB;

CREATE TABLE QRTZ_TRIGGERS (
SCHED_NAME VARCHAR(120) NOT NULL,
TRIGGER_NAME VARCHAR(190) NOT NULL,
TRIGGER_GROUP VARCHAR(190) NOT NULL,
JOB_NAME VARCHAR(190) NOT NULL,
JOB_GROUP VARCHAR(190) NOT NULL,
DESCRIPTION VARCHAR(250) NULL,
NEXT_FIRE_TIME BIGINT(13) NULL,
PREV_FIRE_TIME BIGINT(13) NULL,
PRIORITY INTEGER NULL,
TRIGGER_STATE VARCHAR(16) NOT NULL,
TRIGGER_TYPE VARCHAR(8) NOT NULL,
START_TIME BIGINT(13) NOT NULL,
END_TIME BIGINT(13) NULL,
CALENDAR_NAME VARCHAR(190) NULL,
MISFIRE_INSTR SMALLINT(2) NULL,
JOB_DATA BLOB NULL,
PRIMARY KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP),
FOREIGN KEY (SCHED_NAME,JOB_NAME,JOB_GROUP)
REFERENCES QRTZ_JOB_DETAILS(SCHED_NAME,JOB_NAME,JOB_GROUP))
ENGINE=InnoDB;

CREATE TABLE QRTZ_SIMPLE_TRIGGERS (
SCHED_NAME VARCHAR(120) NOT NULL,
TRIGGER_NAME VARCHAR(190) NOT NULL,
TRIGGER_GROUP VARCHAR(190) NOT NULL,
REPEAT_COUNT BIGINT(7) NOT NULL,
REPEAT_INTERVAL BIGINT(12) NOT NULL,
TIMES_TRIGGERED BIGINT(10) NOT NULL,
PRIMARY KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP),
FOREIGN KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP)
REFERENCES QRTZ_TRIGGERS(SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP))
ENGINE=InnoDB;

CREATE TABLE QRTZ_CRON_TRIGGERS (
SCHED_NAME VARCHAR(120) NOT NULL,
TRIGGER_NAME VARCHAR(190) NOT NULL,
TRIGGER_GROUP VARCHAR(190) NOT NULL,
CRON_EXPRESSION VARCHAR(120) NOT NULL,
TIME_ZONE_ID VARCHAR(80),
PRIMARY KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP),
FOREIGN KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP)
REFERENCES QRTZ_TRIGGERS(SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP))
ENGINE=InnoDB;

CREATE TABLE QRTZ_SIMPROP_TRIGGERS
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(190) NOT NULL,
    TRIGGER_GROUP VARCHAR(190) NOT NULL,
    STR_PROP_1 VARCHAR(512) NULL,
    STR_PROP_2 VARCHAR(512) NULL,
    STR_PROP_3 VARCHAR(512) NULL,
    INT_PROP_1 INT NULL,
    INT_PROP_2 INT NULL,
    LONG_PROP_1 BIGINT NULL,
    LONG_PROP_2 BIGINT NULL,
    DEC_PROP_1 NUMERIC(13,4) NULL,
    DEC_PROP_2 NUMERIC(13,4) NULL,
    BOOL_PROP_1 VARCHAR(1) NULL,
    BOOL_PROP_2 VARCHAR(1) NULL,
    PRIMARY KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP)
    REFERENCES QRTZ_TRIGGERS(SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP))
ENGINE=InnoDB;

CREATE TABLE QRTZ_BLOB_TRIGGERS (
SCHED_NAME VARCHAR(120) NOT NULL,
TRIGGER_NAME VARCHAR(190) NOT NULL,
TRIGGER_GROUP VARCHAR(190) NOT NULL,
BLOB_DATA BLOB NULL,
PRIMARY KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP),
INDEX (SCHED_NAME,TRIGGER_NAME, TRIGGER_GROUP),
FOREIGN KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP)
REFERENCES QRTZ_TRIGGERS(SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP))
ENGINE=InnoDB;

CREATE TABLE QRTZ_CALENDARS (
SCHED_NAME VARCHAR(120) NOT NULL,
CALENDAR_NAME VARCHAR(190) NOT NULL,
CALENDAR BLOB NOT NULL,
PRIMARY KEY (SCHED_NAME,CALENDAR_NAME))
ENGINE=InnoDB;

CREATE TABLE QRTZ_PAUSED_TRIGGER_GRPS (
SCHED_NAME VARCHAR(120) NOT NULL,
TRIGGER_GROUP VARCHAR(190) NOT NULL,
PRIMARY KEY (SCHED_NAME,TRIGGER_GROUP))
ENGINE=InnoDB;

CREATE TABLE QRTZ_FIRED_TRIGGERS (
SCHED_NAME VARCHAR(120) NOT NULL,
ENTRY_ID VARCHAR(95) NOT NULL,
TRIGGER_NAME VARCHAR(190) NOT NULL,
TRIGGER_GROUP VARCHAR(190) NOT NULL,
INSTANCE_NAME VARCHAR(190) NOT NULL,
FIRED_TIME BIGINT(13) NOT NULL,
SCHED_TIME BIGINT(13) NOT NULL,
PRIORITY INTEGER NOT NULL,
STATE VARCHAR(16) NOT NULL,
JOB_NAME VARCHAR(190) NULL,
JOB_GROUP VARCHAR(190) NULL,
IS_NONCONCURRENT VARCHAR(1) NULL,
REQUESTS_RECOVERY VARCHAR(1) NULL,
PRIMARY KEY (SCHED_NAME,ENTRY_ID))
ENGINE=InnoDB;

CREATE TABLE QRTZ_SCHEDULER_STATE (
SCHED_NAME VARCHAR(120) NOT NULL,
INSTANCE_NAME VARCHAR(190) NOT NULL,
LAST_CHECKIN_TIME BIGINT(13) NOT NULL,
CHECKIN_INTERVAL BIGINT(13) NOT NULL,
PRIMARY KEY (SCHED_NAME,INSTANCE_NAME))
ENGINE=InnoDB;

CREATE TABLE QRTZ_LOCKS (
SCHED_NAME VARCHAR(120) NOT NULL,
LOCK_NAME VARCHAR(40) NOT NULL,
PRIMARY KEY (SCHED_NAME,LOCK_NAME))
ENGINE=InnoDB;

CREATE INDEX IDX_QRTZ_J_REQ_RECOVERY ON QRTZ_JOB_DETAILS(SCHED_NAME,REQUESTS_RECOVERY);
CREATE INDEX IDX_QRTZ_J_GRP ON QRTZ_JOB_DETAILS(SCHED_NAME,JOB_GROUP);

CREATE INDEX IDX_QRTZ_T_J ON QRTZ_TRIGGERS(SCHED_NAME,JOB_NAME,JOB_GROUP);
CREATE INDEX IDX_QRTZ_T_JG ON QRTZ_TRIGGERS(SCHED_NAME,JOB_GROUP);
CREATE INDEX IDX_QRTZ_T_C ON QRTZ_TRIGGERS(SCHED_NAME,CALENDAR_NAME);
CREATE INDEX IDX_QRTZ_T_G ON QRTZ_TRIGGERS(SCHED_NAME,TRIGGER_GROUP);
CREATE INDEX IDX_QRTZ_T_STATE ON QRTZ_TRIGGERS(SCHED_NAME,TRIGGER_STATE);
CREATE INDEX IDX_QRTZ_T_N_STATE ON QRTZ_TRIGGERS(SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP,TRIGGER_STATE);
CREATE INDEX IDX_QRTZ_T_N_G_STATE ON QRTZ_TRIGGERS(SCHED_NAME,TRIGGER_GROUP,TRIGGER_STATE);
CREATE INDEX IDX_QRTZ_T_NEXT_FIRE_TIME ON QRTZ_TRIGGERS(SCHED_NAME,NEXT_FIRE_TIME);
CREATE INDEX IDX_QRTZ_T_NFT_ST ON QRTZ_TRIGGERS(SCHED_NAME,TRIGGER_STATE,NEXT_FIRE_TIME);
CREATE INDEX IDX_QRTZ_T_NFT_MISFIRE ON QRTZ_TRIGGERS(SCHED_NAME,MISFIRE_INSTR,NEXT_FIRE_TIME);
CREATE INDEX IDX_QRTZ_T_NFT_ST_MISFIRE ON QRTZ_TRIGGERS(SCHED_NAME,MISFIRE_INSTR,NEXT_FIRE_TIME,TRIGGER_STATE);
CREATE INDEX IDX_QRTZ_T_NFT_ST_MISFIRE_GRP ON QRTZ_TRIGGERS(SCHED_NAME,MISFIRE_INSTR,NEXT_FIRE_TIME,TRIGGER_GROUP,TRIGGER_STATE);

CREATE INDEX IDX_QRTZ_FT_TRIG_INST_NAME ON QRTZ_FIRED_TRIGGERS(SCHED_NAME,INSTANCE_NAME);
CREATE INDEX IDX_QRTZ_FT_INST_JOB_REQ_RCVRY ON QRTZ_FIRED_TRIGGERS(SCHED_NAME,INSTANCE_NAME,REQUESTS_RECOVERY);
CREATE INDEX IDX_QRTZ_FT_J_G ON QRTZ_FIRED_TRIGGERS(SCHED_NAME,JOB_NAME,JOB_GROUP);
CREATE INDEX IDX_QRTZ_FT_JG ON QRTZ_FIRED_TRIGGERS(SCHED_NAME,JOB_GROUP);
CREATE INDEX IDX_QRTZ_FT_T_G ON QRTZ_FIRED_TRIGGERS(SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP);
CREATE INDEX IDX_QRTZ_FT_TG ON QRTZ_FIRED_TRIGGERS(SCHED_NAME,TRIGGER_GROUP);

commit;
```

## 创建的表

```
mysql>  show tables;
+--------------------------+
| Tables_in_job            |
+--------------------------+
| qrtz_blob_triggers       |
| qrtz_calendars           |
| qrtz_cron_triggers       |
| qrtz_fired_triggers      |
| qrtz_job_details         |
| qrtz_locks               |
| qrtz_paused_trigger_grps |
| qrtz_scheduler_state     |
| qrtz_simple_triggers     |
| qrtz_simprop_triggers    |
| qrtz_triggers            |
+--------------------------+
11 rows in set (0.00 sec)
```

## jdbc 操作顺序

主要的JDBC操作类，执行sql顺序。

```
Simple_trigger ：插入顺序
qrtz_job_details --->  qrtz_triggers --->  qrtz_simple_triggers
qrtz_fired_triggers

Cron_Trigger：插入顺序
qrtz_job_details --->  qrtz_triggers --->  qrtz_cron_triggers
qrtz_fired_triggers
```

# 定位排查

```sql
SELECT * FROM qrtz_simple_triggers;
select * from qrtz_triggers;
```

## 报警 

```
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
```

缺少 jar 包，需要导入。

# 准备工作

## maven 引入

```xml
<properties>
    <quartz.version>2.3.0</quartz.version>
    <slf4j-api.version>1.6.4</slf4j-api.version>
    <logback-classic.version>0.9.28</logback-classic.version>
    <jcl-over-slf4j.version>1.6.4</jcl-over-slf4j.version>
</properties>
<dependencies>
    <dependency>
        <groupId>org.quartz-scheduler</groupId>
        <artifactId>quartz</artifactId>
        <version>${quartz.version}</version>
    </dependency>
    <dependency>
        <groupId>org.quartz-scheduler</groupId>
        <artifactId>quartz-jobs</artifactId>
        <version>${quartz.version}</version>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>5.1.47</version>
    </dependency>
    <!-- 日志框架API -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>${slf4j-api.version}</version>
    </dependency>
    <!-- 日志实现提供者 -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>${logback-classic.version}</version>
        <exclusions>
            <exclusion>
                <groupId>commons-logging</groupId>
                <artifactId>commons-logging</artifactId>
            </exclusion>
        </exclusions>
        <scope>runtime</scope>
    </dependency>
    <!-- 拦截 apache commons logging -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>jcl-over-slf4j</artifactId>
        <version>${jcl-over-slf4j.version}</version>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

此处使用 mysql 作为测试的数据库。

slf4j 建议引入，可以快速的排查出问题所在，不然可能出现不执行，但是看不到异常的情况。

## 配置文件

- quartz.properties

放在 resources 根目录下，配置如下：

```properties
//调度标识名 集群中每一个实例都必须使用相同的名称 （区分特定的调度器实例）
org.quartz.scheduler.instanceName:DefaultQuartzScheduler
//ID设置为自动获取 每一个必须不同 （所有调度器实例中是唯一的）
org.quartz.scheduler.instanceId:AUTO

//表的前缀
org.quartz.jobStore.tablePrefix:QRTZ_
//设置为TRUE不会出现序列化非字符串类到 BLOB 时产生的类版本问题
//org.quartz.jobStore.useProperties:true
//加入集群 true 为集群 false不是集群
org.quartz.jobStore.isClustered:false
//调度实例失效的检查时间间隔
org.quartz.jobStore.clusterCheckinInterval:20000
//容许的最大作业延长时间
org.quartz.jobStore.misfireThreshold:60000
//ThreadPool 实现的类名
#org.quartz.threadPool.class:org.quartz.simpl.SimpleThreadPool

//线程数量
org.quartz.threadPool.threadCount:50
//线程优先级
//org.quartz.threadPool.threadPriority:5
# 自创建父线程
org.quartz.threadPool.threadsInheritContextClassLoaderOfInitializingThread:true

//数据库别名
org.quartz.jobStore.dataSource:qzDS
//设置数据源
org.quartz.dataSource.qzDS.driver:com.mysql.jdbc.Driver
org.quartz.dataSource.qzDS.URL:jdbc:mysql://localhost:3306/job?useSSL=false
org.quartz.dataSource.qzDS.user:root
org.quartz.dataSource.qzDS.password:123456
#org.quartz.dataSource.qzDS.maxConnections:10
org.quartz.jobStore.driverDelegateClass = org.quartz.impl.jdbcjobstore.StdJDBCDelegate
# 数据保存方式为持久化
org.quartz.jobStore.class:org.quartz.impl.jdbcjobstore.JobStoreTX
```

## 定义 JOB

```java
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;


/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class MyJob implements Job  {
    public void execute(JobExecutionContext context) throws JobExecutionException {
        System.out.println("========================================= my job");
    }
}
```

## 定义触发器

这里将 job 的执行合并在一起写。

```java
import com.github.houbb.quartz.jobs.learn.job.MyJob;
import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;

import java.util.concurrent.TimeUnit;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class JdbcScheduler {

    public static void main(String[] args) throws SchedulerException, InterruptedException {
        // define the job and tie it to our MyJob class
        JobDetail job = JobBuilder.newJob(MyJob.class)
                .withIdentity("job1", "group1")
                .build();

        // Trigger the job to run now, and then repeat every 5 seconds
        Trigger trigger = TriggerBuilder.newTrigger()
                .withIdentity("trigger1", "group1")
                .startNow()
                .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                        .withIntervalInSeconds(5)
                        .withRepeatCount(5))
                .build();

        // Grab the Scheduler instance from the Factory
        Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();
        // and start it off
        scheduler.start();
        // Tell quartz to schedule the job using our trigger
        scheduler.scheduleJob(job, trigger);

        TimeUnit.HOURS.sleep(1);
    }

}
```

## 运行日志

```
2020-07-27 10:11:05.675 [main] INFO  org.quartz.impl.StdSchedulerFactory - Using ConnectionProvider class 'org.quartz.utils.C3p0PoolingConnectionProvider' for data source 'qzDS'
2020-07-27 10:11:05.716 [MLog-Init-Reporter] INFO  com.mchange.v2.log.MLog - MLog clients using slf4j logging.
2020-07-27 10:11:05.958 [main] INFO  com.mchange.v2.c3p0.C3P0Registry - Initializing c3p0-0.9.5.2 [built 08-December-2015 22:06:04 -0800; debug? true; trace: 10]
2020-07-27 10:11:06.027 [main] INFO  org.quartz.impl.StdSchedulerFactory - Using default implementation for ThreadExecutor
2020-07-27 10:11:06.029 [main] INFO  org.quartz.simpl.SimpleThreadPool - Job execution threads will use class loader of thread: main
2020-07-27 10:11:06.048 [main] INFO  org.quartz.core.SchedulerSignalerImpl - Initialized Scheduler Signaller of type: class org.quartz.core.SchedulerSignalerImpl
2020-07-27 10:11:06.048 [main] INFO  org.quartz.core.QuartzScheduler - Quartz Scheduler v.2.3.0 created.
2020-07-27 10:11:06.049 [main] INFO  org.quartz.impl.jdbcjobstore.JobStoreTX - Using thread monitor-based data access locking (synchronization).
2020-07-27 10:11:06.050 [main] INFO  org.quartz.impl.jdbcjobstore.JobStoreTX - JobStoreTX initialized.
2020-07-27 10:11:06.050 [main] INFO  org.quartz.core.QuartzScheduler - Scheduler meta-data: Quartz Scheduler (v2.3.0) 'DefaultQuartzScheduler' with instanceId 'NON_CLUSTERED'
  Scheduler class: 'org.quartz.core.QuartzScheduler' - running locally.
  NOT STARTED.
  Currently in standby mode.
  Number of jobs executed: 0
  Using thread pool 'org.quartz.simpl.SimpleThreadPool' - with 50 threads.
  Using job-store 'org.quartz.impl.jdbcjobstore.JobStoreTX' - which supports persistence. and is not clustered.

2020-07-27 10:11:06.050 [main] INFO  org.quartz.impl.StdSchedulerFactory - Quartz scheduler 'DefaultQuartzScheduler' initialized from default resource file in Quartz package: 'quartz.properties'
2020-07-27 10:11:06.050 [main] INFO  org.quartz.impl.StdSchedulerFactory - Quartz scheduler version: 2.3.0
2020-07-27 10:11:06.080 [main] INFO  c.m.v2.c3p0.impl.AbstractPoolBackedDataSource - Initializing c3p0 pool... com.mchange.v2.c3p0.ComboPooledDataSource [ acquireIncrement -> 3, acquireRetryAttempts -> 30, acquireRetryDelay -> 1000, autoCommitOnClose -> false, automaticTestTable -> null, breakAfterAcquireFailure -> false, checkoutTimeout -> 0, connectionCustomizerClassName -> null, connectionTesterClassName -> com.mchange.v2.c3p0.impl.DefaultConnectionTester, contextClassLoaderSource -> caller, dataSourceName -> 1bqqx35ab13erxsszvsjfu|4748dc72, debugUnreturnedConnectionStackTraces -> false, description -> null, driverClass -> com.mysql.jdbc.Driver, extensions -> {}, factoryClassLocation -> null, forceIgnoreUnresolvedTransactions -> false, forceSynchronousCheckins -> false, forceUseNamedDriverClass -> false, identityToken -> 1bqqx35ab13erxsszvsjfu|4748dc72, idleConnectionTestPeriod -> 0, initialPoolSize -> 3, jdbcUrl -> jdbc:mysql://localhost:3306/job?useSSL=false, maxAdministrativeTaskTime -> 0, maxConnectionAge -> 0, maxIdleTime -> 0, maxIdleTimeExcessConnections -> 0, maxPoolSize -> 10, maxStatements -> 0, maxStatementsPerConnection -> 120, minPoolSize -> 1, numHelperThreads -> 3, preferredTestQuery -> null, privilegeSpawnedThreads -> false, properties -> {user=******, password=******}, propertyCycle -> 0, statementCacheNumDeferredCloseThreads -> 0, testConnectionOnCheckin -> false, testConnectionOnCheckout -> false, unreturnedConnectionTimeout -> 0, userOverrides -> {}, usesTraditionalReflectiveProxies -> false ]
2020-07-27 10:11:06.396 [main] INFO  org.quartz.impl.jdbcjobstore.JobStoreTX - Freed 0 triggers from 'acquired' / 'blocked' state.
2020-07-27 10:11:06.407 [main] INFO  org.quartz.impl.jdbcjobstore.JobStoreTX - Recovering 0 jobs that were in-progress at the time of the last shut-down.
2020-07-27 10:11:06.407 [main] INFO  org.quartz.impl.jdbcjobstore.JobStoreTX - Recovery complete.
2020-07-27 10:11:06.409 [main] INFO  org.quartz.impl.jdbcjobstore.JobStoreTX - Removed 0 'complete' triggers.
2020-07-27 10:11:06.410 [main] INFO  org.quartz.impl.jdbcjobstore.JobStoreTX - Removed 0 stale fired job entries.
2020-07-27 10:11:06.412 [main] INFO  org.quartz.core.QuartzScheduler - Scheduler DefaultQuartzScheduler_$_NON_CLUSTERED started.
========================================= my job
========================================= my job
========================================= my job
========================================= my job
========================================= my job
```

这里的执行实际上会把数据存储到数据库中。

实际生产中，我们一般是直接将需要执行的任务存储在数据库中，然后通过页面进行处理。

TODO: 后续添加 spring-boot 整合 quartz

# 重新执行

job 已经被我们存储在数据库中，如果处理呢？

## 代码

```java
try {
    SchedulerFactory schedulerFactory = new StdSchedulerFactory();
    Scheduler scheduler = schedulerFactory.getScheduler();
    JobKey jobKey = new JobKey("job1", "group1");
    scheduler.resumeJob(jobKey);
    scheduler.start();
} catch (SchedulerException e) {
    e.printStackTrace();
}
```

## 日志

```
2020-07-27 10:15:54.417 [main] INFO  org.quartz.impl.StdSchedulerFactory - Using ConnectionProvider class 'org.quartz.utils.C3p0PoolingConnectionProvider' for data source 'qzDS'
2020-07-27 10:15:54.444 [MLog-Init-Reporter] INFO  com.mchange.v2.log.MLog - MLog clients using slf4j logging.
2020-07-27 10:15:54.574 [main] INFO  com.mchange.v2.c3p0.C3P0Registry - Initializing c3p0-0.9.5.2 [built 08-December-2015 22:06:04 -0800; debug? true; trace: 10]
2020-07-27 10:15:54.622 [main] INFO  org.quartz.impl.StdSchedulerFactory - Using default implementation for ThreadExecutor
2020-07-27 10:15:54.624 [main] INFO  org.quartz.simpl.SimpleThreadPool - Job execution threads will use class loader of thread: main
2020-07-27 10:15:54.640 [main] INFO  org.quartz.core.SchedulerSignalerImpl - Initialized Scheduler Signaller of type: class org.quartz.core.SchedulerSignalerImpl
2020-07-27 10:15:54.640 [main] INFO  org.quartz.core.QuartzScheduler - Quartz Scheduler v.2.3.0 created.
2020-07-27 10:15:54.641 [main] INFO  org.quartz.impl.jdbcjobstore.JobStoreTX - Using thread monitor-based data access locking (synchronization).
2020-07-27 10:15:54.641 [main] INFO  org.quartz.impl.jdbcjobstore.JobStoreTX - JobStoreTX initialized.
2020-07-27 10:15:54.642 [main] INFO  org.quartz.core.QuartzScheduler - Scheduler meta-data: Quartz Scheduler (v2.3.0) 'DefaultQuartzScheduler' with instanceId 'NON_CLUSTERED'
  Scheduler class: 'org.quartz.core.QuartzScheduler' - running locally.
  NOT STARTED.
  Currently in standby mode.
  Number of jobs executed: 0
  Using thread pool 'org.quartz.simpl.SimpleThreadPool' - with 50 threads.
  Using job-store 'org.quartz.impl.jdbcjobstore.JobStoreTX' - which supports persistence. and is not clustered.

2020-07-27 10:15:54.642 [main] INFO  org.quartz.impl.StdSchedulerFactory - Quartz scheduler 'DefaultQuartzScheduler' initialized from default resource file in Quartz package: 'quartz.properties'
2020-07-27 10:15:54.642 [main] INFO  org.quartz.impl.StdSchedulerFactory - Quartz scheduler version: 2.3.0
2020-07-27 10:15:54.662 [main] INFO  c.m.v2.c3p0.impl.AbstractPoolBackedDataSource - Initializing c3p0 pool... com.mchange.v2.c3p0.ComboPooledDataSource [ acquireIncrement -> 3, acquireRetryAttempts -> 30, acquireRetryDelay -> 1000, autoCommitOnClose -> false, automaticTestTable -> null, breakAfterAcquireFailure -> false, checkoutTimeout -> 0, connectionCustomizerClassName -> null, connectionTesterClassName -> com.mchange.v2.c3p0.impl.DefaultConnectionTester, contextClassLoaderSource -> caller, dataSourceName -> 1bqqx35ab13ey4jv11trikb|4091630f, debugUnreturnedConnectionStackTraces -> false, description -> null, driverClass -> com.mysql.jdbc.Driver, extensions -> {}, factoryClassLocation -> null, forceIgnoreUnresolvedTransactions -> false, forceSynchronousCheckins -> false, forceUseNamedDriverClass -> false, identityToken -> 1bqqx35ab13ey4jv11trikb|4091630f, idleConnectionTestPeriod -> 0, initialPoolSize -> 3, jdbcUrl -> jdbc:mysql://localhost:3306/job?useSSL=false, maxAdministrativeTaskTime -> 0, maxConnectionAge -> 0, maxIdleTime -> 0, maxIdleTimeExcessConnections -> 0, maxPoolSize -> 10, maxStatements -> 0, maxStatementsPerConnection -> 120, minPoolSize -> 1, numHelperThreads -> 3, preferredTestQuery -> null, privilegeSpawnedThreads -> false, properties -> {user=******, password=******}, propertyCycle -> 0, statementCacheNumDeferredCloseThreads -> 0, testConnectionOnCheckin -> false, testConnectionOnCheckout -> false, unreturnedConnectionTimeout -> 0, userOverrides -> {}, usesTraditionalReflectiveProxies -> false ]
2020-07-27 10:15:54.954 [main] INFO  org.quartz.impl.jdbcjobstore.JobStoreTX - Freed 1 triggers from 'acquired' / 'blocked' state.
2020-07-27 10:15:54.959 [main] INFO  org.quartz.impl.jdbcjobstore.JobStoreTX - Handling 1 trigger(s) that missed their scheduled fire-time.
2020-07-27 10:15:54.981 [main] INFO  org.quartz.impl.jdbcjobstore.JobStoreTX - Recovering 0 jobs that were in-progress at the time of the last shut-down.
2020-07-27 10:15:54.982 [main] INFO  org.quartz.impl.jdbcjobstore.JobStoreTX - Recovery complete.
2020-07-27 10:15:54.983 [main] INFO  org.quartz.impl.jdbcjobstore.JobStoreTX - Removed 0 'complete' triggers.
2020-07-27 10:15:54.985 [main] INFO  org.quartz.impl.jdbcjobstore.JobStoreTX - Removed 1 stale fired job entries.
2020-07-27 10:15:54.987 [main] INFO  org.quartz.core.QuartzScheduler - Scheduler DefaultQuartzScheduler_$_NON_CLUSTERED started.
========================================= my job
```


# 导航目录

> [导航目录](https://blog.csdn.net/ryo1060732496/article/details/79794802)

# 参考资料

[quartz-scheduler-2.3.0](http://www.quartz-scheduler.org/documentation/quartz-2.3.0/)

[精进 Quartz—Quartz大致介绍（一）](https://blog.csdn.net/u010648555/article/details/54863144)

[通过maven添加quartz-spring 整合](https://www.cnblogs.com/jgig11/p/4383302.html )

[开源框架-PowerJob](https://github.com/KFCFans/PowerJob)

[Establishing SSL connection without server's identit](https://blog.csdn.net/weixin_44779019/article/details/93342054)

[不执行的问题](https://blog.52itstyle.vip/archives/155/)

[quartz中设置Job不并发执行](https://www.cnblogs.com/wpcnblog/p/9354806.html)

* any list
{:toc}