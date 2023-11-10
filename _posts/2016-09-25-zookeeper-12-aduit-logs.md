---
layout: post
title: ZooKeeper-12-aduit logs
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---

# ZooKeeper审核日志

Apache ZooKeeper支持3.6.0版以上的审核日志。 

默认情况下，审核日志处于禁用状态。 

要启用审核日志，请在conf/zoo.cfg中配置audit.enable = true。 

审核日志并非记录在所有的ZooKeeper服务器上，而是仅记录在连接客户端的服务器上，如下图所示。

![zkAuditLogs](https://zookeeper.apache.org/doc/r3.6.2/images/zkAuditLogs.jpg)

审核日志捕获有关选择要审核的操作的详细信息。 

审核信息被编写为以下键的一组键=值对

```
Key	    Value
session	客户端会话ID
user	逗号分隔的与客户端会话相关联的用户列表。 有关更多信息，请参阅在审核日志中将谁作为用户。
ip	客户端IP地址
operation	所选的任何一项操作以进行审核。 可能的值为（serverStart，serverStop，创建，删除，setData，setAcl，multiOperation，reconfig，ephemeralZNodeDeleteOnSessionClose）
znode	znode路径
znode type	操作时的znode类型znode类型
acl	znode ACL的字符串表示形式，如cdrwa（创建，删除，读取，写入，管理）。 仅记录setAcl操作
result	可能的值为（成功/失败/调用）。 结果“已调用”用于serverStop操作，因为在确保服务器实际停止之前已记录了stop。
```

比如下面的例子：

```
user=zookeeper/192.168.1.3 operation=serverStart   result=success
session=0x19344730000   user=192.168.1.2,zkcli@HADOOP.COM  ip=192.168.1.2    operation=create    znode=/a    znode_type=persistent  result=success
session=0x19344730000   user=192.168.1.2,zkcli@HADOOP.COM  ip=192.168.1.2    operation=create    znode=/a    znode_type=persistent  result=failure
session=0x19344730000   user=192.168.1.2,zkcli@HADOOP.COM  ip=192.168.1.2    operation=setData   znode=/a    result=failure
session=0x19344730000   user=192.168.1.2,zkcli@HADOOP.COM  ip=192.168.1.2    operation=setData   znode=/a    result=success
session=0x19344730000   user=192.168.1.2,zkcli@HADOOP.COM  ip=192.168.1.2    operation=setAcl    znode=/a    acl=world:anyone:cdrwa  result=failure
session=0x19344730000   user=192.168.1.2,zkcli@HADOOP.COM  ip=192.168.1.2    operation=setAcl    znode=/a    acl=world:anyone:cdrwa  result=success
session=0x19344730000   user=192.168.1.2,zkcli@HADOOP.COM  ip=192.168.1.2    operation=create    znode=/b    znode_type=persistent  result=success
session=0x19344730000   user=192.168.1.2,zkcli@HADOOP.COM  ip=192.168.1.2    operation=setData   znode=/b    result=success
session=0x19344730000   user=192.168.1.2,zkcli@HADOOP.COM  ip=192.168.1.2    operation=delete    znode=/b    result=success
session=0x19344730000   user=192.168.1.2,zkcli@HADOOP.COM  ip=192.168.1.2    operation=multiOperation    result=failure
session=0x19344730000   user=192.168.1.2,zkcli@HADOOP.COM  ip=192.168.1.2    operation=delete    znode=/a    result=failure
session=0x19344730000   user=192.168.1.2,zkcli@HADOOP.COM  ip=192.168.1.2    operation=delete    znode=/a    result=success
session=0x19344730001   user=192.168.1.2,zkcli@HADOOP.COM  ip=192.168.1.2    operation=create   znode=/ephemral znode_type=ephemral result=success
session=0x19344730001   user=zookeeper/192.168.1.3   operation=ephemeralZNodeDeletionOnSessionCloseOrExpire  znode=/ephemral result=success
session=0x19344730000   user=192.168.1.2,zkcli@HADOOP.COM  ip=192.168.1.2    operation=reconfig  znode=/zookeeper/config result=success
user=zookeeper/192.168.1.3 operation=serverStop    result=invoked
```

# ZooKeeper审核日志配置

默认情况下，审核日志处于禁用状态。 

要启用审核日志，请在conf / zoo.cfg中配置audit.enable = true。 

审核日志记录使用log4j完成。 

以下是conf / log4j.properties中审核日志的默认log4j配置

```
#
# zk audit logging
#
zookeeper.auditlog.file=zookeeper_audit.log
zookeeper.auditlog.threshold=INFO
audit.logger=INFO, RFAAUDIT
log4j.logger.org.apache.zookeeper.audit.Log4jAuditLogger=${audit.logger}
log4j.additivity.org.apache.zookeeper.audit.Log4jAuditLogger=false
log4j.appender.RFAAUDIT=org.apache.log4j.RollingFileAppender
log4j.appender.RFAAUDIT.File=${zookeeper.log.dir}/${zookeeper.auditlog.file}
log4j.appender.RFAAUDIT.layout=org.apache.log4j.PatternLayout
log4j.appender.RFAAUDIT.layout.ConversionPattern=%d{ISO8601} %p %c{2}: %m%n
log4j.appender.RFAAUDIT.Threshold=${zookeeper.auditlog.threshold}

# Max log file size of 10MB
log4j.appender.RFAAUDIT.MaxFileSize=10MB
log4j.appender.RFAAUDIT.MaxBackupIndex=10
```

# 谁是审核日志中的用户？

默认情况下，只有四个身份验证提供程序：

- IP认证提供者

- SASLAuthenticationProvider

- X509AuthenticationProvider

- DigestAuthenticationProvider


根据配置的身份验证提供程序确定用户：

- 配置IPAuthenticationProvider后，将经过身份验证的IP用作用户

- 配置SASLAuthenticationProvider时，将客户端主体作为用户

- 配置X509AuthenticationProvider时，将客户端证书作为用户

- 配置DigestAuthenticationProvider时，经过身份验证的用户为user

自定义身份验证提供程序可以重写org.apache.zookeeper.server.auth.AuthenticationProvider.getUserName（String id）以提供用户名。

如果身份验证提供程序未覆盖此方法，则将org.apache.zookeeper.data.Id.id中存储的内容作为用户。

通常，只有用户名存储在此字段中，但是取决于用户身份验证提供者存储在其中的内容。对于审核日志记录，将org.apache.zookeeper.data.Id.id的值作为用户。

在ZooKeeper服务器中，并非所有操作都由客户端完成，而是某些操作由服务器本身完成。

例如，当客户端关闭会话时，临时znode将被服务器删除。这些删除操作不是由客户端直接完成的，而是由服务器本身完成的，这些操作称为系统操作。对于这些系统操作，在审核记录这些操作时，会将与ZooKeeper服务器关联的用户视为用户。

例如，如果在ZooKeeper中，服务器主体是zookeeper/hadoop.hadoop.com@HADOOP.COM，则它将成为系统用户，并且所有系统操作都将使用该用户名记录。

```
user=zookeeper/hadoop.hadoop.com@HADOOP.COM operation=serverStart result=success
```

如果没有与ZooKeeper服务器关联的用户，则将启动ZooKeeper服务器的用户视为该用户。例如，如果服务器由root启动，则将root作为系统用户

```
user=root operation=serverStart result=success
```

单个客户端可以将多个身份验证方案附加到会话，在这种情况下，所有身份验证方案都将以用户身份使用，并以逗号分隔的列表形式显示。例如，如果客户端通过主体zkcli@HADOOP.COM和ip 127.0.0.1进行身份验证，则创建znode审核日志将如下所示：

```
session=0x10c0bcb0000 user=zkcli@HADOOP.COM,127.0.0.1 ip=127.0.0.1 operation=create znode=/a result=success
```

# 参考资料

https://zookeeper.apache.org/doc/r3.6.2/zookeeperAuditLogs.html

* any list
{:toc}