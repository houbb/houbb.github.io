---
layout: post
title: ETL-18-apache SeaTunnel Engine checkpoint-storage
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 简介

检查点是一种容错恢复机制。此机制确保当程序运行时，即使突然遇到异常，也能够自我恢复。

# 检查点存储

检查点存储是用于存储检查点数据的存储机制。

SeaTunnel Engine 支持以下检查点存储类型：

- HDFS（OSS、S3、HDFS、LocalFile）
- LocalFile（本地文件）（已弃用：请改用 Hdfs（LocalFile））

我们使用了微内核设计模式，将检查点存储模块与引擎分离。这使用户能够实现自己的检查点存储模块。

checkpoint-storage-api 是检查点存储模块的 API，它定义了检查点存储模块的接口。

如果您想要实现自己的检查点存储模块，需要实现 CheckpointStorage 并提供相应的 CheckpointStorageFactory 实现。

# 检查点存储配置

seatunnel-server 模块的配置位于 seatunnel.yaml 文件中。

```yml
seatunnel:
    engine:
        checkpoint:
            storage:
                type: hdfs #plugin name of checkpoint storage, we support hdfs(S3, local, hdfs), localfile (native local file) is the default, but this plugin is de
              # plugin configuration
                plugin-config: 
                  namespace: #checkpoint storage parent path, the default value is /seatunnel/checkpoint/
                  K1: V1 # plugin other configuration
                  K2: V2 # plugin other configuration   
```

注意：namespace 必须以 "/" 结尾。

## OSS

阿里云 OSS 基于 HDFS-File，因此您可以 [参考 Hadoop OSS 文档配置 OSS](https://hadoop.apache.org/docs/stable/hadoop-aliyun/tools/hadoop-aliyun/index.html)。

除了与 OSS 存储桶交互时，OSS 客户端需要与存储桶交互所需的凭证。该客户端支持多种身份验证机制，并且可以配置使用哪些机制以及它们的使用顺序。还可以使用 org.apache.hadoop.fs.aliyun.oss.AliyunCredentialsProvider 的自定义实现。如果使用 AliyunCredentialsProvider（可以从阿里云 Access Key Management 获取），这些凭证包括访问密钥和密钥。您可以进行如下配置：

```yaml
seatunnel:
  engine:
    checkpoint:
      interval: 6000
      timeout: 7000
      storage:
        type: hdfs
        max-retained: 3
        plugin-config:
          storage.type: oss
          oss.bucket: your-bucket
          fs.oss.accessKeyId: your-access-key
          fs.oss.accessKeySecret: your-secret-key
          fs.oss.endpoint: endpoint address
          fs.oss.credentials.provider: org.apache.hadoop.fs.aliyun.oss.AliyunCredentialsProvider
```

关于 Hadoop Credential Provider API 的详细信息请参阅：[Credential Provider API](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/CredentialProviderAPI.html)。

阿里云 OSS Credential Provider 实现请参阅：[Auth Credential Providers](https://github.com/aliyun/aliyun-oss-java-sdk/tree/master/src/main/java/com/aliyun/oss/common/auth)。

## S3

S3 基于 HDFS-File，因此您可以参考 Hadoop S3 文档配置 S3。

除了与公共 S3 存储桶交互时，S3A 客户端需要与存储桶交互所需的凭证。

该客户端支持多种身份验证机制，并且可以配置使用哪些机制以及它们的使用顺序。还可以使用 com.amazonaws.auth.AWSCredentialsProvider 的自定义实现。

如果使用 SimpleAWSCredentialsProvider（可以从亚马逊安全令牌服务获取），这些凭证包括访问密钥和密钥。您可以进行如下配置：

```yaml
seatunnel:
    engine:
        checkpoint:
            interval: 6000
            timeout: 7000
            storage:
                type: hdfs
                max-retained: 3
                plugin-config:
                    storage.type: s3
                    s3.bucket: your-bucket
                    fs.s3a.access.key: your-access-key
                    fs.s3a.secret.key: your-secret-key
                    fs.s3a.aws.credentials.provider: org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider
```

如果使用 InstanceProfileCredentialsProvider，它支持在 EC2 VM 中运行时使用实例配置文件凭证，您可以检查 iam-roles-for-amazon-ec2。您可以进行如下配置：

```yaml
seatunnel:
  engine:
    checkpoint:
      interval: 6000
      timeout: 7000
      storage:
        type: hdfs
        max-retained: 3
        plugin-config:
          storage.type: s3
          s3.bucket: your-bucket
          fs.s3a.endpoint: your-endpoint
          fs.s3a.aws.credentials.provider: org.apache.hadoop.fs.s3a.InstanceProfileCredentialsProvider
```

关于 Hadoop Credential Provider API 的详细信息请参阅：Credential Provider API。

## HDFS

如果您使用 HDFS，可以进行如下配置：

```yaml
seatunnel:
  engine:
    checkpoint:
      storage:
        type: hdfs
        max-retained: 3
        plugin-config:
          storage.type: hdfs
          fs.defaultFS: hdfs://localhost:9000
          # 如果使用 Kerberos，可以进行如下配置：
          kerberosPrincipal: your-kerberos-principal
          kerberosKeytab: your-kerberos-keytab  
```

如果 HDFS 处于 HA 模式下，可以进行如下配置：

```yaml
seatunnel:
  engine:
    checkpoint:
      storage:
        type: hdfs
        max-retained: 3
        plugin-config:
          storage.type: hdfs
          fs.defaultFS: hdfs://usdp-bing
          seatunnel.hadoop.dfs.nameservices: usdp-bing
          seatunnel.hadoop.dfs.ha.namenodes.usdp-bing: nn1,nn2
          seatunnel.hadoop.dfs.namenode.rpc-address.usdp-bing.nn1: usdp-bing-nn1:8020
          seatunnel.hadoop.dfs.namenode.rpc-address.usdp-bing.nn2: usdp-bing-nn2:8020
          seatunnel.hadoop.dfs.client.failover.proxy.provider.usdp-bing: org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider
```

如果 HDFS 在 hdfs-site.xml 或 core-site.xml 中有其他配置，请使用 seatunnel.hadoop. 前缀设置 HDFS 配置。

## LocalFile

```yml
seatunnel:
  engine:
    checkpoint:
      interval: 6000
      timeout: 7000
      storage:
        type: hdfs
        max-retained: 3
        plugin-config:
          storage.type: hdfs
          fs.defaultFS: file:/// # Ensure that the directory has written permission 
```


### 实际测试

上面的写法本地启动不一定成功，我本地实际测试的配置文件如下：

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

#            storage:
#                type: hdfs
#                max-retained: 3
#                plugin-config:
#                    namespace: /tmp/seatunnel/checkpoint_snapshot/
#                    storage.type: hdfs
#                    fs.defaultFS: file:///tmp/
```


# 参考资料

https://seatunnel.apache.org/docs/2.3.3/seatunnel-engine/checkpoint-storage

* any list
{:toc}