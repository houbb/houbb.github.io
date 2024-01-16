---
layout: post
title: ETL-25-apache SeaTunnel 实战 seaTunnel 任务到底是如何执行的？
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 命令行

最基本的，可以直接 shell 执行


```bash
./bin/seatunnel.sh -c config/v2.batch.config.template -m local
```

# 本地方法

在写单测的时候，基于方法执行。

个人理解应该是封装了 shell 命令：

```java
public static void main(String[] args)
        throws FileNotFoundException, URISyntaxException, CommandException {
    String configurePath = args.length > 0 ? args[0] : "/examples/mysql_to_console.conf";
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
```

# web 是如何执行的

## web 配置

web 页面简单的搭建了一下，这个可以配置，指定任务执行的，到底是如何实现的？

## JobExecutorController

主要可以看一下这个任务执行类，底层实现。

```java
    @Override
    public Result<Long> jobExecute(Integer userId, Long jobDefineId) {
        // 配置信息获取   
        JobExecutorRes executeResource =
                jobInstanceService.createExecuteResource(userId, jobDefineId);
        String jobConfig = executeResource.getJobConfig();

        String configFile = writeJobConfigIntoConfFile(jobConfig, jobDefineId);

        // 执行
        Long jobInstanceId =
                executeJobBySeaTunnel(userId, configFile, executeResource.getJobInstanceId());
        return Result.success(jobInstanceId);
    }
```

最核心的是这一句：

```java
executeJobBySeaTunnel(userId, configFile, executeResource.getJobInstanceId());
```

如下：

```java
    public Long executeJobBySeaTunnel(Integer userId, String filePath, Long jobInstanceId) {
        Common.setDeployMode(DeployMode.CLIENT);
        JobConfig jobConfig = new JobConfig();
        jobConfig.setName(jobInstanceId + "_job");
        SeaTunnelClient seaTunnelClient = createSeaTunnelClient();
        try {
            JobExecutionEnvironment jobExecutionEnv =
                    seaTunnelClient.createExecutionContext(filePath, jobConfig);
            final ClientJobProxy clientJobProxy = jobExecutionEnv.execute();
            JobInstance jobInstance = jobInstanceDao.getJobInstance(jobInstanceId);
            jobInstance.setJobEngineId(Long.toString(clientJobProxy.getJobId()));
            jobInstanceDao.update(jobInstance);

            CompletableFuture.runAsync(
                    () -> {
                        waitJobFinish(
                                clientJobProxy,
                                userId,
                                jobInstanceId,
                                Long.toString(clientJobProxy.getJobId()),
                                seaTunnelClient);
                    });

        } catch (ExecutionException | InterruptedException e) {
            ExceptionUtils.getMessage(e);
            throw new RuntimeException(e);
        }
        return jobInstanceId;
    }
```

这里是通过 SeaTunnelClient 实现的，我们看一下 `seaTunnelClient.createExecutionContext(filePath, jobConfig)`

1) 创建：

```java
    private SeaTunnelClient createSeaTunnelClient() {
        ClientConfig clientConfig = ConfigProvider.locateAndGetClientConfig();
        clientConfig.setClusterName(getClusterName("seatunnel"));
        return new SeaTunnelClient(clientConfig);
    }
```

2) 获取执行环境

```java
    public JobExecutionEnvironment createExecutionContext(
            @NonNull String filePath, @NonNull JobConfig jobConfig) {
        return new JobExecutionEnvironment(jobConfig, filePath, hazelcastClient);
    }
```

3) 执行：

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
    return jobClient.createJobProxy(jobImmutableInformation);
}
```

最后还是基于 ClientJobProxy 类实现的

## ClientJobProxy 类

私有属性：

```java
public class ClientJobProxy implements Job {
    private static final ILogger LOGGER = Logger.getLogger(ClientJobProxy.class);
    private final SeaTunnelHazelcastClient seaTunnelHazelcastClient;
    private final Long jobId;
    private JobResult jobResult;
```

任务执行：

```java
private void submitJob(JobImmutableInformation jobImmutableInformation) {
    LOGGER.info(
            String.format(
                    "Start submit job, job id: %s, with plugin jar %s",
                    jobImmutableInformation.getJobId(),
                    jobImmutableInformation.getPluginJarsUrls()));

    ClientMessage request =
            SeaTunnelSubmitJobCodec.encodeRequest(
                    jobImmutableInformation.getJobId(),
                    seaTunnelHazelcastClient
                            .getSerializationService()
                            .toData(jobImmutableInformation));
    PassiveCompletableFuture<Void> submitJobFuture =
            seaTunnelHazelcastClient.requestOnMasterAndGetCompletableFuture(request);
    submitJobFuture.join();
    LOGGER.info(
            String.format(
                    "Submit job finished, job id: %s, job name: %s",
                    jobImmutableInformation.getJobId(), jobImmutableInformation.getJobName()));
}
```

对应的 seaTunnelHazelcastClient

```java
    public PassiveCompletableFuture<Void> requestOnMasterAndGetCompletableFuture(
            @NonNull ClientMessage request) {
        // 获取 master 的 uuid
        UUID masterUuid = hazelcastClient.getClientClusterService().getMasterMember().getUuid();

        // 调用请求
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
```

对应的 invoke 实现类：

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

* any list
{:toc}