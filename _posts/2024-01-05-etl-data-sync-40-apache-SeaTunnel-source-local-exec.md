---
layout: post
title: ETL-40-apache SeaTunnel 源码分析 source-code SeaTunnel.run(clientCommandArgs.buildCommand());
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 业务需求

测试的时候，执行了本地的一个单元测试，但是任务是如何执行的？

和 web 调用异曲同工之妙。

# source

## 测试类

```java
import org.apache.seatunnel.core.starter.SeaTunnel;
import org.apache.seatunnel.core.starter.enums.MasterType;
import org.apache.seatunnel.core.starter.exception.CommandException;
import org.apache.seatunnel.core.starter.seatunnel.args.ClientCommandArgs;

import java.io.FileNotFoundException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Paths;

public class SeaTunnelEngineExampleHttpToConsoleRawStreaming {

    //file:/D:/_my/seatunnel-2.3.3-release-slim/seatunnel-engine/seatunnel-engine-common/target/classes/seatunnel.yaml
    public static void main(String[] args)
            throws FileNotFoundException, URISyntaxException, CommandException {
        String configurePath = args.length > 0 ? args[0] : "/examples/http_to_consoleRaw.conf";
        String configFile = getTestConfigFile(configurePath);
        ClientCommandArgs clientCommandArgs = new ClientCommandArgs();
        clientCommandArgs.setConfigFile(configFile);
        clientCommandArgs.setCheckConfig(false);
        clientCommandArgs.setJobName(Paths.get(configFile).getFileName().toString());
        // Change Execution Mode to CLUSTER to use client mode, before do this, you should start
        // SeaTunnelEngineServerExample
        clientCommandArgs.setMasterType(MasterType.LOCAL);
        SeaTunnel.run(clientCommandArgs.buildCommand());
    }

    public static String getTestConfigFile(String configFile)
            throws FileNotFoundException, URISyntaxException {
        URL resource = SeaTunnelEngineExampleHttpToConsoleRawStreaming.class.getResource(configFile);
        if (resource == null) {
            throw new FileNotFoundException("Can't find config file: " + configFile);
        }
        return Paths.get(resource.toURI()).toString();
    }
}
```

下面的代码只是在构建参数：

```java
String configurePath = args.length > 0 ? args[0] : "/examples/http_to_consoleRaw.conf";
String configFile = getTestConfigFile(configurePath);
ClientCommandArgs clientCommandArgs = new ClientCommandArgs();
clientCommandArgs.setConfigFile(configFile);
clientCommandArgs.setCheckConfig(false);
clientCommandArgs.setJobName(Paths.get(configFile).getFileName().toString());
// Change Execution Mode to CLUSTER to use client mode, before do this, you should start
// SeaTunnelEngineServerExample
clientCommandArgs.setMasterType(MasterType.LOCAL);
```

然后核心的执行代码是：

```java
SeaTunnel.run(clientCommandArgs.buildCommand());
```

下面调用的还是 `ClientExecuteCommand.execute()` 方法。

## 执行 ClientExecuteCommand debug

下面的分支比较多，我们可以本地 debug 跟一下代码实现，重点看一下 ClientExecuteCommand#execute 方法

进入时：

```java
JobMetricsRunner.JobMetricsSummary jobMetricsSummary = null;    //统计类？
LocalDateTime startTime = LocalDateTime.now();  // 开始时间
LocalDateTime endTime = LocalDateTime.now();    // 结束时间
SeaTunnelConfig seaTunnelConfig = ConfigProvider.locateAndGetSeaTunnelConfig(); //配置类
```

`ConfigProvider.locateAndGetSeaTunnelConfig()` 这一行，是去加载对应的配置引擎信息，暂时不做展开。

就是读取我们配置的配置文件：

```
EngineConfig(backupCount=1, printExecutionInfoInterval=60, printJobMetricsInfoInterval=60, jobMetricsBackupInterval=10, taskExecutionThreadShareMode=OFF, slotServiceConfig=SlotServiceConfig(dynamicSlot=true, slotNum=2), checkpointConfig=CheckpointConfig(checkpointInterval=300000, checkpointTimeout=10000, schemaChangeCheckpointTimeout=30000, storage=CheckpointStorageConfig(storage=localfile, maxRetainedCheckpoints=3, storagePluginConfig={namespace=C:\ProgramData\seatunnel\checkpoint\})), queueType=BLOCKINGQUEUE, historyJobExpireMinutes=1440)

Config{configurationUrl=null, configurationFile=null, classLoader=null, properties={hazelcast.operation.generic.thread.count=50, hazelcast.invocation.max.retry.count=20, hazelcast.tcp.join.port.try.count=30, hazelcast.logging.type=log4j2}, instanceName='null', clusterName='seatunnel', networkConfig=NetworkConfig{publicAddress='null', port=5801, portCount=100, portAutoIncrement=true, join=JoinConfig{multicastConfig=MulticastConfig [enabled=false, multicastGroup=224.2.2.3, multicastPort=54327, multicastTimeToLive=32, multicastTimeoutSeconds=2, trustedInterfaces=[], ...
```

对应我们的 

- seatunnel.yaml

```yaml
seatunnel:
    engine:
        backup-count: 1
        queue-type: blockingqueue
        print-execution-info-interval: 60
        slot-service:
            dynamic-slot: true
        checkpoint:
            interval: 300000
            timeout: 10000
            storage:
                type: localfile
                max-retained: 3
                plugin-config:
                    namespace: C:\ProgramData\seatunnel\checkpoint\
```

- hazelcast.yaml

```yaml
hazelcast:
  cluster-name: seatunnel
  network:
    rest-api:
      enabled: true
      endpoint-groups:
        CLUSTER_WRITE:
          enabled: true
        DATA:
          enabled: true
    join:
      tcp-ip:
        enabled: true
        member-list:
          - localhost
    port:
      auto-increment: true
      port-count: 100
      port: 5801
  properties:
    hazelcast.invocation.max.retry.count: 20
    hazelcast.tcp.join.port.try.count: 30
    hazelcast.logging.type: log4j2
    hazelcast.operation.generic.thread.count: 50
```

### 本地模式

我们本地测试，用的是本地模式

```java
String clusterName = clientCommandArgs.getClusterName();  //默认是 null，我们未设置
if (clientCommandArgs.getMasterType().equals(MasterType.LOCAL)) {

    // 随机创建一个名称？比如 seatunnel-926147
    clusterName =
            creatRandomClusterName(
                    StringUtils.isNotEmpty(clusterName)
                            ? clusterName
                            : Constant.DEFAULT_SEATUNNEL_CLUSTER_NAME);

    // 创建一个内部的服务                        
    instance = createServerInLocal(clusterName, seaTunnelConfig);

    // 设置集群名称 
    if (StringUtils.isNotEmpty(clusterName)) {
        seaTunnelConfig.getHazelcastConfig().setClusterName(clusterName);
    }
}
```

我们重点看一下 createServerInLocal 方法：

```java
private HazelcastInstance createServerInLocal(
        String clusterName, SeaTunnelConfig seaTunnelConfig) {
    seaTunnelConfig.getHazelcastConfig().setClusterName(clusterName);
    seaTunnelConfig.getHazelcastConfig().getNetworkConfig().setPortAutoIncrement(true);
    return HazelcastInstanceFactory.newHazelcastInstance(
            seaTunnelConfig.getHazelcastConfig(),
            Thread.currentThread().getName(),
            new SeaTunnelNodeContext(seaTunnelConfig));
}
```

这个是基于 clusterName+seaTunnelConfig，基于分布式内存 Hazelcast 直接常见一个 server。

### client 创建

下面一段是创建 SeaTunnelClient 的代码。

```java
ClientConfig clientConfig = ConfigProvider.locateAndGetClientConfig();
if (StringUtils.isNotEmpty(clusterName)) {
    clientConfig.setClusterName(clusterName);
}
engineClient = new SeaTunnelClient(clientConfig);
```

ConfigProvider.locateAndGetClientConfig() 用于加载 client 配置，也是解析 yaml 配置

- hazelcast-client.yaml

```yaml
hazelcast-client:
  cluster-name: seatunnel
  properties:
      hazelcast.logging.type: log4j2
  network:
    cluster-members:
      - localhost:5801
      - localhost:5802
      - localhost:5803
      - localhost:5804
      - localhost:5805
      - localhost:5806
      - localhost:5807
      - localhost:5808
      - localhost:5809
      - localhost:5810
      - localhost:5811
      - localhost:5812
      - localhost:5813
      - localhost:5814
      - localhost:5815
```

配置信息 debug 内容截取：

```
ClientConfig{properties={hazelcast.logging.type=log4j2}, clusterName=seatunnel, securityConfig=ClientSecurityConfig{identityConfig=null, realmConfigs={}}, networkConfig=ClientNetworkConfig{addressList=[localhost:5801, localhost:5802, localhost:5803, localhost:5804, localhost:5805, localhost:5806, localhost:5807, localhost:5808, localhost:5809, localhost:5810, localhost:5811, localhost:5812, localhost:5813, localhost:5814, localhost:5815], ....
```

## job 类别=》任务执行

### 任务状态 --list

不同的任务类别，处理方式应该是不同的。

```java
if (clientCommandArgs.isListJob()) {
    String jobStatus = engineClient.getJobClient().listJobStatus(true);
    System.out.println(jobStatus);
} 
```

这个对应的是命令行查看任务状态：

```java
@Parameter(
        names = {"-l", "--list"},
        description = "list job status")
private boolean listJob = false;
```

### 获取运行状态 --get_running_job_metrics

```java
else if (clientCommandArgs.isGetRunningJobMetrics()) {
    String runningJobMetrics = engineClient.getJobClient().getRunningJobMetrics();
    System.out.println(runningJobMetrics);
} 
```

对应命令：

```java
@Parameter(
            names = {"--get_running_job_metrics"},
            description = "Gets metrics for running jobs")
private boolean getRunningJobMetrics = false;
```

### jobId 存在，显示 任务状态 -j

```java
 else if (null != clientCommandArgs.getJobId()) {
    String jobState =
            engineClient
                    .getJobClient()
                    .getJobDetailStatus(Long.parseLong(clientCommandArgs.getJobId()));
    System.out.println(jobState);
} 
```

```java
@Parameter(
            names = {"-j", "--job-id"},
            description = "Get job status by JobId")
    private String jobId;
```

这里没指定。

### 任务取消 -can

```java
else if (null != clientCommandArgs.getCancelJobId()) {
    engineClient
            .getJobClient()
            .cancelJob(Long.parseLong(clientCommandArgs.getCancelJobId()));
} 
```

对应：

```java
@Parameter(
        names = {"-can", "--cancel-job"},
        description = "Cancel job by JobId")
private String cancelJobId;
```

### 统计信息 --metrics

```java
else if (null != clientCommandArgs.getMetricsJobId()) {
    String jobMetrics =
            engineClient
                    .getJobClient()
                    .getJobMetrics(Long.parseLong(clientCommandArgs.getMetricsJobId()));
    System.out.println(jobMetrics);
} 
```

对应：

```java
@Parameter(
        names = {"--metrics"},
        description = "Get job metrics by JobId")
private String metricsJobId;
```

### 保存点 -s 

```java
else if (null != clientCommandArgs.getSavePointJobId()) {
    engineClient
            .getJobClient()
            .savePointJob(Long.parseLong(clientCommandArgs.getSavePointJobId()));
} 
```

对应：

```java
@Parameter(
        names = {"-s", "--savepoint"},
        description = "savepoint job by jobId")
private String savePointJobId;
```

### 其他

如果不是上述的分支：

```java
    // 这里获取到的就是我们指定的测试配置文件：~/examples/http_to_consoleRaw.conf
    Path configFile = FileUtils.getConfigPath(clientCommandArgs);
    checkConfigExist(configFile);


    JobConfig jobConfig = new JobConfig();
    JobExecutionEnvironment jobExecutionEnv;
    jobConfig.setName(clientCommandArgs.getJobName());

    // restore 存在
    if (null != clientCommandArgs.getRestoreJobId()) {
        jobExecutionEnv =
                engineClient.restoreExecutionContext(
                        configFile.toString(),
                        jobConfig,
                        Long.parseLong(clientCommandArgs.getRestoreJobId()));
    } else {
        // 本地测试不存在，走到了这里
        // 根据 config 文件，创建执行上下文。

        jobExecutionEnv =
                engineClient.createExecutionContext(configFile.toString(), jobConfig);
    }


    // 这里其实额外加几个参数比较好，任务触发，到任务开始执行，中间等待了一段时间
    // get job start time
    startTime = LocalDateTime.now();

    // create job proxy
    ClientJobProxy clientJobProxy = jobExecutionEnv.execute();

    // 本地模式，禁止异步？
    if (clientCommandArgs.isAsync()) {
        if (clientCommandArgs.getMasterType().equals(MasterType.LOCAL)) {
            log.warn("The job is running in local mode, can not use async mode.");
        } else {
            return;
        }
    }


    // register cancelJob hook
    // 取消任务的钩子函数
    Runtime.getRuntime()
            .addShutdownHook(
                    new Thread(
                            () -> {
                                CompletableFuture<Void> future =
                                        CompletableFuture.runAsync(
                                                () -> {
                                                    log.info(
                                                            "run shutdown hook because get close signal");
                                                    shutdownHook(clientJobProxy);
                                                });
                                try {
                                    future.get(15, TimeUnit.SECONDS);
                                } catch (Exception e) {
                                    log.error("Cancel job failed.", e);
                                }
                            }));

    // get job id
    long jobId = clientJobProxy.getJobId();
    JobMetricsRunner jobMetricsRunner = new JobMetricsRunner(engineClient, jobId);
    executorService =
            Executors.newSingleThreadScheduledExecutor(
                    new ThreadFactoryBuilder()
                            .setNameFormat("job-metrics-runner-%d")
                            .setDaemon(true)
                            .build());
    executorService.scheduleAtFixedRate(
            jobMetricsRunner,
            0,
            seaTunnelConfig.getEngineConfig().getPrintJobMetricsInfoInterval(),
            TimeUnit.SECONDS);
    // wait for job complete
    jobStatus = clientJobProxy.waitForJobComplete();
    // get job end time
    endTime = LocalDateTime.now();
    // get job statistic information when job finished
    jobMetricsSummary = engineClient.getJobMetricsSummary(jobId);
}
```


`ClientJobProxy clientJobProxy = jobExecutionEnv.execute();` 这里创建了对应的任务执行代理：

```java
public ClientJobProxy execute() throws ExecutionException, InterruptedException {
    JobImmutableInformation jobImmutableInformation =
            new JobImmutableInformation(
                    Long.parseLong(jobConfig.getJobContext().getJobId()),
                    jobConfig.getName(),
                    isStartWithSavePoint,
                    seaTunnelHazelcastClient.getSerializationService().toData(getLogicalDag()),
                    jobConfig,
                    new ArrayList<>(jarUrls));
    // 创建代理，就是往下调用。
    return jobClient.createJobProxy(jobImmutableInformation);
}

public ClientJobProxy createJobProxy(@NonNull JobImmutableInformation jobImmutableInformation) {
    return new ClientJobProxy(hazelcastClient, jobImmutableInformation);
}

public ClientJobProxy(
        @NonNull SeaTunnelHazelcastClient seaTunnelHazelcastClient,
        @NonNull JobImmutableInformation jobImmutableInformation) {
    this.seaTunnelHazelcastClient = seaTunnelHazelcastClient;
    this.jobId = jobImmutableInformation.getJobId();
    submitJob(jobImmutableInformation);
}
```

submitJob(jobImmutableInformation); 提交任务如下：

```java
private void submitJob(JobImmutableInformation jobImmutableInformation) {
    LOGGER.info(
            String.format(
                    "Start submit job, job id: %s, with plugin jar %s",
                    jobImmutableInformation.getJobId(),
                    jobImmutableInformation.getPluginJarsUrls()));

    // 客户端请求信息
    ClientMessage request =
            SeaTunnelSubmitJobCodec.encodeRequest(
                    jobImmutableInformation.getJobId(),
                    seaTunnelHazelcastClient
                            .getSerializationService()
                            .toData(jobImmutableInformation));


    // 调用 master，并且获取到 Future 对象
    // 看到这里，感觉和 web 触发一样
    // 看起来是本地模式，实际上还是通过网络通信。保证分布式情况下的一致性
    PassiveCompletableFuture<Void> submitJobFuture =
            seaTunnelHazelcastClient.requestOnMasterAndGetCompletableFuture(request);
    submitJobFuture.join();

    LOGGER.info(
            String.format(
                    "Submit job finished, job id: %s, job name: %s",
                    jobImmutableInformation.getJobId(), jobImmutableInformation.getJobName()));
}
```

`seaTunnelHazelcastClient.requestOnMasterAndGetCompletableFuture(request)` 展开如下:

```java
public PassiveCompletableFuture<Void> requestOnMasterAndGetCompletableFuture(
        @NonNull ClientMessage request) {
    //获取 masterUUID
    UUID masterUuid = hazelcastClient.getClientClusterService().getMasterMember().getUuid();

    // 请求
    return requestAndGetCompletableFuture(masterUuid, request);
}

public PassiveCompletableFuture<Void> requestAndGetCompletableFuture(
        @NonNull UUID uuid, @NonNull ClientMessage request) {
    ClientInvocation invocation = new ClientInvocation(hazelcastClient, request, null, uuid);
    try {
        return new PassiveCompletableFuture<>(invocation.invoke().thenApply(r -> null));
    } catch (Throwable t) {
        throw ExceptionUtil.rethrow(t);
    }
}

// 对象构建
protected ClientInvocation(HazelcastClientInstanceImpl client, ClientMessage clientMessage, Object objectName, int partitionId, UUID uuid, Connection connection) {
    super(((ClientInvocationServiceImpl)client.getInvocationService()).invocationLogger);
    this.allowRetryOnRandom = true;
    this.lifecycleService = client.getLifecycleService();
    this.invocationService = (ClientInvocationServiceImpl)client.getInvocationService();
    this.executionService = client.getTaskScheduler();
    this.objectName = objectName;
    this.clientMessage = clientMessage;
    this.partitionId = partitionId;
    this.uuid = uuid;
    this.connection = connection;
    this.startTimeMillis = System.currentTimeMillis();
    this.retryPauseMillis = this.invocationService.getInvocationRetryPauseMillis();
    this.callIdSequence = this.invocationService.getCallIdSequence();
    this.clientInvocationFuture = new ClientInvocationFuture(this, clientMessage, this.logger, this.callIdSequence);
    this.invocationTimeoutMillis = this.invocationService.getInvocationTimeoutMillis();
    this.isSmartRoutingEnabled = this.invocationService.isSmartRoutingEnabled();
}
```


`invocation.invoke()` 如下：

```java
    public ClientInvocationFuture invoke() {
        this.clientMessage.setCorrelationId(this.callIdSequence.next());
        this.invokeOnSelection();
        return this.clientInvocationFuture;
    }


    private void invokeOnSelection() {
        try {
            INVOKE_COUNT.incrementAndGet(this);
            if (!this.urgent) {
                this.invocationService.checkInvocationAllowed();
            }

            boolean invoked;
            if (this.isBindToSingleConnection()) {
                invoked = this.invocationService.invokeOnConnection(this, (ClientConnection)this.connection);
                if (!invoked) {
                    this.notifyExceptionWithOwnedPermission(new IOException("Could not invoke on connection " + this.connection));
                }

                return;
            }

            if (this.isSmartRoutingEnabled) {
                if (this.partitionId != -1) {
                    invoked = this.invocationService.invokeOnPartitionOwner(this, this.partitionId);
                } else if (this.uuid != null) {
                    invoked = this.invocationService.invokeOnTarget(this, this.uuid);
                } else {
                    invoked = this.invocationService.invoke(this);
                }

                if (this.allowRetryOnRandom && !invoked) {
                    invoked = this.invocationService.invoke(this);
                }
            } else {
                invoked = this.invocationService.invoke(this);
            }

            if (!invoked) {
                this.notifyExceptionWithOwnedPermission(new IOException("No connection found to invoke"));
            }
        } catch (Throwable var2) {
            this.notifyExceptionWithOwnedPermission(var2);
        }

    }
```

# 小结

从本地调用，看起来比较简单。

但是考虑到分布式调度，这个问题就必须要涉及到分布式的网络请求。

后续如果自己设计类似的框架，也可以参考这个工具。

可以让本地调用+远程调用，对应用户的体验是一样的。

# 参考资料

* any list
{:toc}