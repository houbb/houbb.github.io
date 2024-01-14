---
layout: post
title:  Apache Hadoop v3.3.6-16-Hadoop in Secure Mode
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# Introduction

在默认配置中，我们期望您确保攻击者无法通过限制所有网络访问来访问您的Hadoop集群。

如果您希望对可以远程访问数据或提交作业的用户进行任何限制，您必须按照本文档中描述的方式保护Hadoop集群的身份验证和访问。

当Hadoop配置为在安全模式下运行时，每个Hadoop服务和每个用户都必须通过Kerberos进行身份验证。

必须正确配置所有服务主机的正向和反向主机查找，以允许服务相互进行身份验证。主机查找可以使用DNS或/etc/hosts文件进行配置。

在尝试配置安全模式下的Hadoop服务之前，建议具备Kerberos和DNS的工作知识。

Hadoop的安全功能包括身份验证、服务级别授权、Web控制台的身份验证和数据保密性。

# 身份验证

## 终端用户帐户

在启用服务级身份验证时，终端用户必须在与Hadoop服务进行交互之前进行身份验证。最简单的方式是用户使用Kerberos的kinit命令进行交互式身份验证。当使用kinit进行交互式登录不可行时，可以使用Kerberos keytab文件进行编程身份验证。

## Hadoop守护程序的用户帐户

确保HDFS和YARN守护程序以不同的Unix用户运行，例如hdfs和yarn。此外，确保MapReduce JobHistory服务器作为不同的用户运行，例如mapred。

建议它们共享一个Unix组，例如hadoop。另请参阅“从用户到组的映射”以获取组管理信息。

## 用户:组	守护程序

hdfs:hadoop	NameNode、Secondary NameNode、JournalNode、DataNode
yarn:hadoop	ResourceManager、NodeManager
mapred:hadoop	MapReduce JobHistory 服务器
Hadoop守护程序的Kerberos主体
每个Hadoop服务实例都必须配置其Kerberos主体和keytab文件位置。

服务主体的一般格式是ServiceName/_HOST@REALM.TLD。例如，dn/_HOST@EXAMPLE.COM。

Hadoop简化了配置文件的部署，允许将服务主体的主机名组件指定为_HOST通配符。每个服务实例将在运行时用自己的完全限定的主机名替换_HOST。这允许管理员在所有节点上部署相同的配置文件。但是，keytab文件将是不同的。

### HDFS

每个NameNode主机上的NameNode keytab文件应如下所示：

```bash
$ klist -e -k -t /etc/security/keytab/nn.service.keytab
Keytab name: FILE:/etc/security/keytab/nn.service.keytab
KVNO Timestamp         Principal
   4 07/18/11 21:08:09 nn/full.qualified.domain.name@REALM.TLD (AES-256 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 nn/full.qualified.domain.name@REALM.TLD (AES-128 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 nn/full.qualified.domain.name@REALM.TLD (ArcFour with HMAC/md5)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (AES-256 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (AES-128 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (ArcFour with HMAC/md5)
```

每个Secondary NameNode主机上的Secondary NameNode keytab文件应如下所示：

```bash
$ klist -e -k -t /etc/security/keytab/sn.service.keytab
Keytab name: FILE:/etc/security/keytab/sn.service.keytab
KVNO Timestamp         Principal
   4 07/18/11 21:08:09 sn/full.qualified.domain.name@REALM.TLD (AES-256 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 sn/full.qualified.domain.name@REALM.TLD (AES-128 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 sn/full.qualified.domain.name@REALM.TLD (ArcFour with HMAC/md5)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (AES-256 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (AES-128 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (ArcFour with HMAC/md5)
```

每个DataNode主机上的DataNode keytab文件应如下所示：

```bash
$ klist -e -k -t /etc/security/keytab/dn.service.keytab
Keytab name: FILE:/etc/security/keytab/dn.service.keytab
KVNO Timestamp         Principal
   4 07/18/11 21:08:09 dn/full.qualified.domain.name@REALM.TLD (AES-256 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 dn/full.qualified.domain.name@REALM.TLD (AES-128 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 dn/full.qualified.domain.name@REALM.TLD (ArcFour with HMAC/md5)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (AES-256 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (AES-128 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (ArcFour with HMAC/md5)
```

### YARN

每个ResourceManager主机上的ResourceManager keytab文件应如下所示：

```bash
$ klist -e -k -t /etc/security/keytab/rm.service.keytab
Keytab name: FILE:/etc/security/keytab/rm.service.keytab
KVNO Timestamp         Principal
   4 07/18/11 21:08:09 rm/full.qualified.domain.name@REALM.TLD (AES-256 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 rm/full.qualified.domain.name@REALM.TLD (AES-128 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 rm/full.qualified.domain.name@REALM.TLD (ArcFour with HMAC/md5)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (AES-256 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (AES-128 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (ArcFour with HMAC/md5)
```

每个NodeManager主机上的NodeManager keytab文件应如下所示：

```bash
$ klist -e -k -t /etc/security/keytab/nm.service.keytab
Keytab name: FILE:/etc/security/keytab/nm.service.keytab
KVNO Timestamp         Principal
   4 07/18/11 21:08:09 nm/full.qualified.domain.name@REALM.TLD (AES-256 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 nm/full.qualified.domain.name@REALM.TLD (AES-128 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 nm/full.qualified.domain.name@REALM.TLD (ArcFour with HMAC/md5)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (AES-256 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (AES-128 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (ArcFour with HMAC/md5)
```

### MapReduce JobHistory Server

MapReduce JobHistory Server的keytab文件，位于该主机上，应如下所示：

```bash
$ klist -e -k -t /etc/security/keytab/jhs.service.keytab
Keytab name: FILE:/etc/security/keytab/jhs.service.keytab
KVNO Timestamp         Principal
   4 07/18/11 21:08:09 jhs/full.qualified.domain.name@REALM.TLD (AES-256 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 jhs/full.qualified.domain.name@REALM.TLD (AES-128 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 jhs/full.qualified.domain.name@REALM.TLD (ArcFour with HMAC/md5)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (AES-256 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (AES-128 CTS mode with 96-bit SHA-1 HMAC)
   4 07/18/11 21:08:09 host/full.qualified.domain.name@REALM.TLD (ArcFour with HMAC/md5)
```

## Mapping from Kerberos principals to OS user accounts

Kerberos主体与操作系统（系统）帐户之间的映射由hadoop.security.auth_to_local规则指定。

Hadoop如何评估这些规则取决于hadoop.security.auth_to_local.mechanism的设置。

在默认的Hadoop模式中，Kerberos主体必须与将主体转换为简单形式的规则匹配，即一个没有'@'或'/'的用户帐户名称，否则主体将无法获得授权，并将记录错误。在MIT模式下，规则的工作方式与Kerberos配置文件（krb5.conf）中的auth_to_local相同，而Hadoop模式的限制则不适用。如果使用MIT模式，建议使用在/etc/krb5.conf中指定的与默认领域的一致的auth_to_local规则。在Hadoop和MIT模式下，规则被应用于所有主体，而不管其指定的领域如何。此外，请注意，不应依赖于auth_to_local规则作为ACL，并使用适当的（操作系统）机制。

auth_to_local的可能值为：

- RULE:exp：本地名称将从exp中公式化。exp的格式为[n:string](regexp)s/pattern/replacement/g。整数n表示目标主体应该具有多少个组件。如果匹配，则将从字符串中形成一个字符串，将主体的领域替换为$0，将主体的第n个组件替换为$n（例如，如果主体是johndoe/admin，则[2:$2$1foo]将导致字符串adminjohndoefoo）。如果此字符串匹配regexp，则将在字符串上运行s//[g]替换命令。可选的g将导致在字符串上进行全局替换，而不仅仅替换字符串中的第一个匹配项。作为MIT的扩展，Hadoop auth_to_local映射支持/L标志，它会将返回的名称转换为小写。

- DEFAULT：仅当领域与default_realm匹配时，将主体名称的第一个组件选择为系统用户名（通常在/etc/krb5.conf中定义）。例如，默认规则将主体host/full.qualified.domain.name@MYREALM.TLD映射到系统用户host，如果默认领域是MYREALM.TLD。

如果没有指定规则，Hadoop将默认使用DEFAULT，这可能不适用于大多数集群。

请注意，Hadoop不支持多个默认领域（例如Heimdal）。此外，Hadoop不会对映射进行验证，即本地系统帐户是否存在。

示例规则：

```xml
<property>
  <name>hadoop.security.auth_to_local</name>
  <value>
    RULE:[2:$1/$2@$0]([ndj]n/.*@REALM.\TLD)s/.*/hdfs/
    RULE:[2:$1/$2@$0]([rn]m/.*@REALM\.TLD)s/.*/yarn/
    RULE:[2:$1/$2@$0](jhs/.*@REALM\.TLD)s/.*/mapred/
    DEFAULT
  </value>
</property>
```

这将映射来自REALM.TLD领域的任何主体nn、dn、jn到本地系统帐户hdfs。

其次，它将来自REALM.TLD领域的任何主体rm、nm映射到本地系统帐户yarn。

第三，它将来自REALM.TLD领域的任何主体jhs映射到本地系统帐户mapred。

最后，将映射来自默认领域的任何主体到该主体的用户组件。

可以使用`hadoop kerbname`命令测试自定义规则。此命令允许指定主体并应用Hadoop当前的auth_to_local规则集。

## 用户到组

用户到组的系统用户到系统组的映射机制可以通过`hadoop.security.group.mapping`进行配置。详细信息请参阅Hadoop Groups Mapping。

在实践中，您需要使用Kerberos和LDAP管理Hadoop中的SSO环境，以确保在安全模式下运行。

## 代理用户

一些产品，例如Apache Oozie，它代表最终用户访问Hadoop服务，需要能够模拟最终用户。详细信息请参阅代理用户文档。

## 安全的DataNode Secure DataNode

由于DataNode数据传输协议不使用Hadoop RPC框架，因此DataNode必须使用由`dfs.datanode.address`和`dfs.datanode.http.address`指定的特权端口进行身份验证。这种身份验证是基于这样一个假设：攻击者将无法在DataNode主机上获得root特权。

当您以root身份执行`hdfs datanode`命令时，服务器进程首先绑定特权端口，然后丢弃特权并以`HDFS_DATANODE_SECURE_USER`指定的用户帐户身份运行。此启动过程使用JSVC_HOME中安装的jsvc程序。您必须在启动时（在`hadoop-env.sh`中）将`HDFS_DATANODE_SECURE_USER`和`JSVC_HOME`指定为环境变量。

从版本2.6.0开始，可以使用SASL对数据传输协议进行身份验证。在此配置中，不再需要在受保护的集群上使用jsvc以root身份启动DataNode并绑定到特权端口。要在数据传输协议上启用SASL，请在`hdfs-site.xml`中设置`dfs.data.transfer.protection`。启用SASL的DataNode可以通过以下两种方式之一以安全模式启动：1. 为`dfs.datanode.address`设置非特权端口。2. 将`dfs.http.policy`设置为`HTTPS_ONLY`或将`dfs.datanode.http.address`设置为特权端口，并确保`HDFS_DATANODE_SECURE_USER`和`JSVC_HOME`环境变量在启动时正确指定（在`hadoop-env.sh`中）。

为了迁移以前使用根身份验证的现有集群，以开始使用SASL，首先确保在所有集群节点以及需要连接到集群的任何外部应用程序上都部署了版本2.6.0或更高版本。

只有版本2.6.0及更高版本的HDFS客户端才能连接到使用SASL进行数据传输协议身份验证的DataNode，因此在迁移之前，确保所有调用方都具有正确的版本至关重要。

在所有地方部署了版本2.6.0或更高版本后，更新任何外部应用程序的配置以启用SASL。如果启用了SASL的HDFS客户端，则它可以成功连接到使用根身份验证或SASL身份验证运行的DataNode。

更改所有客户端的配置确保后续对DataNode的配置更改不会影响应用程序。最后，可以通过更改其配置并重新启动来迁移每个单独的DataNode。

在此迁移期间，有一些DataNode以root身份运行，有一些DataNode以SASL身份运行是可以接受的，因为启用SASL的HDFS客户端可以连接到两者。

# Data confidentiality

## 数据加密在RPC上

在Hadoop服务和客户端之间传输的数据可以在传输过程中进行加密。

在`core-site.xml`中将`hadoop.rpc.protection`设置为privacy将激活数据加密。

## 数据块传输的数据加密。

在`hdfs-site.xml`中将`dfs.encrypt.data.transfer`设置为true，以激活DataNode的数据传输协议的数据加密。

可选地，您可以将`dfs.encrypt.data.transfer.algorithm`设置为3des或rc4，以选择特定的加密算法。如果未指定，则使用系统上配置的JCE默认值，通常为3DES。

将`dfs.encrypt.data.transfer.cipher.suites`设置为AES/CTR/NoPadding将激活AES加密。默认情况下，未指定此项，因此不使用AES。当使用AES时，在初始密钥交换期间仍然使用`dfs.encrypt.data.transfer.algorithm`中指定的算法。AES密钥位长度可以通过将`dfs.encrypt.data.transfer.cipher.key.bitlength`设置为128、192或256来配置。默认值为128。

AES提供了最大的密码强度和最佳的性能。目前，在Hadoop集群中更常使用3DES和RC4。

## HTTP上的数据加密

Web控制台和客户端之间的数据传输通过SSL（HTTPS）进行保护。建议配置SSL，但不是必需的，以使用Kerberos配置Hadoop安全性。

要为HDFS守护程序的Web控制台启用SSL，在`hdfs-site.xml`中将`dfs.http.policy`设置为HTTPS_ONLY或HTTP_AND_HTTPS。请注意，KMS和HttpFS不遵守此参数。有关启用KMS over HTTPS和HttpFS over HTTPS的说明，请参阅Hadoop KMS和Hadoop HDFS over HTTP - Server Setup。

要为YARN守护程序的Web控制台启用SSL，在`yarn-site.xml`中将`yarn.http.policy`设置为HTTPS_ONLY。

要为MapReduce JobHistory服务器的Web控制台启用SSL，在`mapred-site.xml`中将`mapreduce.jobhistory.http.policy`设置为HTTPS_ONLY。

# 配置

## HDFS和本地文件系统路径的权限

以下表格列出了HDFS和本地文件系统（所有节点上）上的各种路径以及推荐的权限：

文件系统	路径	用户:组	权限
本地	dfs.namenode.name.dir	hdfs:hadoop	drwx------
本地	dfs.datanode.data.dir	hdfs:hadoop	drwx------
本地	$HADOOP_LOG_DIR	hdfs:hadoop	drwxrwxr-x
本地	$YARN_LOG_DIR	yarn:hadoop	drwxrwxr-x
本地	yarn.nodemanager.local-dirs	yarn:hadoop	drwxr-xr-x
本地	yarn.nodemanager.log-dirs	yarn:hadoop	drwxr-xr-x
本地	container-executor	root:hadoop	--Sr-s--*
本地	conf/container-executor.cfg	root:hadoop	r-------*
HDFS	/	hdfs:hadoop	drwxr-xr-x
HDFS	/tmp	hdfs:hadoop	drwxrwxrwxt
HDFS	/user	hdfs:hadoop	drwxr-xr-x
HDFS	yarn.nodemanager.remote-app-log-dir	yarn:hadoop	drwxrwxrwxt
HDFS	mapreduce.jobhistory.intermediate-done-dir	mapred:hadoop	drwxrwxrwxt
HDFS	mapreduce.jobhistory.done-dir	mapred:hadoop	drwxr-x---

## 通用配置

为了在Hadoop中启用RPC身份验证，将hadoop.security.authentication属性的值设置为"kerberos"，并适当设置以下列出的与安全相关的设置。

以下属性应该在集群中所有节点的core-site.xml中。

参数	值	注释
hadoop.security.authentication	kerberos	simple：无身份验证。（默认）kerberos：通过Kerberos启用身份验证。
hadoop.security.authorization	true	启用RPC服务级授权。
hadoop.rpc.protection	authentication	authentication：仅身份验证（默认）；integrity：除了身份验证外还进行完整性检查；privacy：除了完整性外还进行数据加密
hadoop.security.auth_to_local	RULE:exp1 RULE:exp2 … DEFAULT	该值是一个包含换行字符的字符串。有关exp格式，请参阅Kerberos文档。
hadoop.proxyuser.superuser.hosts		允许超级用户访问模拟的逗号分隔主机。*表示通配符。
hadoop.proxyuser.superuser.groups		超级用户模拟的用户所属的逗号分隔组。*表示通配符。

## NameNode

参数	值	注释
dfs.block.access.token.enable	true	启用HDFS块访问令牌以进行安全操作。
dfs.namenode.kerberos.principal	nn/_HOST@REALM.TLD	NameNode的Kerberos主体名称。
dfs.namenode.keytab.file	/etc/security/keytab/nn.service.keytab	NameNode的Kerberos keytab文件。
dfs.namenode.kerberos.internal.spnego.principal	HTTP/_HOST@REALM.TLD	NameNode用于Web UI SPNEGO身份验证的服务器主体。SPNEGO服务器主体以HTTP/前缀开头，根据约定。如果该值为“*”，则Web服务器将尝试使用在keytab文件dfs.web.authentication.kerberos.keytab中指定的每个主体登录。对于大多数部署，可以将其设置为${dfs.web.authentication.kerberos.principal}，即使用dfs.web.authentication.kerberos.principal的值。
dfs.web.authentication.kerberos.keytab	/etc/security/keytab/spnego.service.keytab	NameNode的SPNEGO keytab文件。在HA集群中，此设置与Journal节点共享。
以下设置允许配置对NameNode Web UI的SSL访问（可选）。

参数	值	注释
dfs.http.policy	HTTP_ONLY or HTTPS_ONLY or HTTP_AND_HTTPS	HTTPS_ONLY关闭http访问。如果使用SASL对数据传输协议进行身份验证，而不是以root身份运行DataNode并使用特权端口，则必须将此属性设置为HTTPS_ONLY，以确保HTTP服务器的身份验证。（参见dfs.data.transfer.protection。）
dfs.namenode.https-address	0.0.0.0:9871	此参数用于非HA模式和无联邦的情况。有关详细信息，请参见HDFS高可用性和HDFS联邦。

## Secondary NameNode

参数	值	注释
dfs.namenode.secondary.http-address	0.0.0.0:9868	Secondary NameNode的HTTP Web UI地址。
dfs.namenode.secondary.https-address	0.0.0.0:9869	Secondary NameNode的HTTPS Web UI地址。
dfs.secondary.namenode.keytab.file	/etc/security/keytab/sn.service.keytab	Secondary NameNode的Kerberos keytab文件。
dfs.secondary.namenode.kerberos.principal	sn/_HOST@REALM.TLD	Secondary NameNode的Kerberos主体名称。
dfs.secondary.namenode.kerberos.internal.spnego.principal	HTTP/_HOST@REALM.TLD	Secondary NameNode用于Web UI SPNEGO身份验证的服务器主体。SPNEGO服务器主体以HTTP/前缀开头，根据约定。如果该值为“*”，则Web服务器将尝试使用在keytab文件dfs.web.authentication.kerberos.keytab中指定的每个主体登录。对于大多数部署，可以将其设置为${dfs.web.authentication.kerberos.principal}，即使用dfs.web.authentication.kerberos.principal的值。

## JournalNode

参数	值	注释
dfs.journalnode.kerberos.principal	jn/_HOST@REALM.TLD	JournalNode的Kerberos主体名称。
dfs.journalnode.keytab.file	/etc/security/keytab/jn.service.keytab	JournalNode的Kerberos keytab文件。
dfs.journalnode.kerberos.internal.spnego.principal	HTTP/_HOST@REALM.TLD	JournalNode用于启用Kerberos安全性时进行Web UI SPNEGO身份验证的服务器主体。SPNEGO服务器主体以HTTP/前缀开头，根据约定。如果该值为“*”，则Web服务器将尝试使用在keytab文件dfs.web.authentication.kerberos.keytab中指定的每个主体登录。对于大多数部署，可以将其设置为${dfs.web.authentication.kerberos.principal}，即使用dfs.web.authentication.kerberos.principal的值。
dfs.web.authentication.kerberos.keytab	/etc/security/keytab/spnego.service.keytab	JournalNode的SPNEGO keytab文件。在HA集群中，此设置与NameNode共享。
dfs.journalnode.https-address	0.0.0.0:8481	JournalNode的HTTPS Web UI地址。

## DataNode

参数	值	注释
dfs.datanode.data.dir.perm	700	
dfs.datanode.address	0.0.0.0:1004	为了确保服务器安全启动，安全的DataNode必须使用特权端口。这意味着服务器必须通过jsvc启动。或者，如果使用SASL来认证数据传输协议，则必须将其设置为非特权端口（请参阅dfs.data.transfer.protection）。
dfs.datanode.http.address	0.0.0.0:1006	为了确保服务器安全启动，安全的DataNode必须使用特权端口。这意味着服务器必须通过jsvc启动。
dfs.datanode.https.address	0.0.0.0:9865	Data Node的HTTPS Web UI地址。
dfs.datanode.kerberos.principal	dn/_HOST@REALM.TLD	DataNode的Kerberos主体名称。
dfs.datanode.keytab.file	/etc/security/keytab/dn.service.keytab	DataNode的Kerberos keytab文件。
dfs.encrypt.data.transfer	false	在使用数据加密时设置为true
dfs.encrypt.data.transfer.algorithm	在使用数据加密时，可以选择设置为3des或rc4以控制加密算法
dfs.encrypt.data.transfer.cipher.suites	在使用数据加密时，可以选择设置为AES/CTR/NoPadding，以在使用数据加密时激活AES加密
dfs.encrypt.data.transfer.cipher.key.bitlength	在使用AES进行数据加密时，可以选择设置为128、192或256以控制密钥位长度
dfs.data.transfer.protection	authentication：仅身份验证；integrity：除身份验证外还进行完整性检查；privacy：在完整性的基础上进行数据加密 默认情况下，此属性未指定。设置此属性启用SASL以进行数据传输协议的身份验证。如果启用了此功能，则dfs.datanode.address必须使用非特权端口，dfs.http.policy必须设置为HTTPS_ONLY，并且在启动DataNode进程时必须未定义HDFS_DATANODE_SECURE_USER环境变量。

## WebHDFS

参数	值	注释
dfs.web.authentication.kerberos.principal	http/_HOST@REALM.TLD	WebHDFS的Kerberos主体名称。在HA集群中，此设置通常由JournalNodes用于通过SPNEGO保护对JournalNode HTTP服务器的访问。
dfs.web.authentication.kerberos.keytab	/etc/security/keytab/http.service.keytab	WebHDFS的Kerberos keytab文件。在HA集群中，此设置通常由JournalNodes用于通过SPNEGO保护对JournalNode HTTP服务器的访问。

## ResourceManager

参数	值	注释
yarn.resourcemanager.principal	rm/_HOST@REALM.TLD	ResourceManager的Kerberos主体名称。
yarn.resourcemanager.keytab	/etc/security/keytab/rm.service.keytab	ResourceManager的Kerberos keytab文件。
yarn.resourcemanager.webapp.https.address	${yarn.resourcemanager.hostname}:8090	非HA情况下RM Web应用程序的https地址。在HA集群中，为每个ResourceManager使用yarn.resourcemanager.webapp.https.address.rm-id。有关详细信息，请参阅ResourceManager High Availability。

## NodeManager

参数	值	注释
yarn.nodemanager.principal	nm/_HOST@REALM.TLD	NodeManager的Kerberos主体名称。
yarn.nodemanager.keytab	/etc/security/keytab/nm.service.keytab	NodeManager的Kerberos keytab文件。
yarn.nodemanager.container-executor.class	org.apache.hadoop.yarn.server.nodemanager.LinuxContainerExecutor	使用LinuxContainerExecutor。
yarn.nodemanager.linux-container-executor.group	hadoop	NodeManager的Unix组。
yarn.nodemanager.linux-container-executor.path	/path/to/bin/container-executor	Linux容器执行器可执行文件的路径。
yarn.nodemanager.webapp.https.address	0.0.0.0:8044	NM Web应用程序的https地址。

## WebAppProxy的配置

WebAppProxy提供了一个在应用程序导出的Web应用程序和最终用户之间的代理。如果启用了安全性，则它将在访问潜在不安全的Web应用程序之前警告用户。代理使用与任何其他特权Web应用程序一样处理的身份验证和授权。

参数	值	注释
yarn.web-proxy.address	代理到AM Web应用程序的WebAppProxy主机：端口。	host:port，如果与yarn.resourcemanager.webapp.address相同或未定义，则ResourceManager将运行代理，否则需要启动一个独立的代理服务器。
yarn.web-proxy.keytab	/etc/security/keytab/web-app.service.keytab	WebAppProxy的Kerberos keytab文件。
yarn.web-proxy.principal	wap/_HOST@REALM.TLD	WebAppProxy的Kerberos主体名称。

## LinuxContainerExecutor

YARN框架使用的ContainerExecutor，定义了如何启动和控制任何容器。

以下是Hadoop YARN中可用的ContainerExecutor：

ContainerExecutor	描述
DefaultContainerExecutor	YARN用于管理容器执行的默认执行器。容器进程具有与NodeManager相同的Unix用户。
LinuxContainerExecutor	仅在GNU/Linux上受支持，该执行器将容器作为提交应用程序的YARN用户（启用完整安全性时）运行，或者作为专用用户（默认为nobody）运行，当未启用完整安全性时。启用完整安全性时，此执行器要求在启动容器的群集节点上创建所有用户帐户。它使用Hadoop分发中包含的setuid可执行文件。NodeManager使用此可执行文件来启动和杀死容器。setuid可执行文件切换到提交应用程序的用户并启动或杀死容器。为了最大限度地提高安全性，此执行器设置了容器使用的本地文件和目录（例如共享对象、jar、中间文件、日志文件等）的受限权限和用户/组所有权。特别注意，由于这个原因，除了应用程序所有者和NodeManager之外，没有其他用户可以访问作为分布式缓存的一部分本地化的任何本地文件/目录。

要构建LinuxContainerExecutor可执行文件，请运行：

```
$ mvn package -Dcontainer-executor.conf.dir=/etc/hadoop/
```

传递的 -Dcontainer-executor.conf.dir 中的路径应该是群集节点上应该位于其中的setuid可执行文件的配置文件的路径。可执行文件应安装在 $HADOOP_YARN_HOME/bin 中。

可执行文件必须具有特定的权限：6050或--Sr-s--- 权限，由root（超级用户）拥有用户，并由一个特殊组（例如hadoop）拥有用户，NodeManager Unix用户是该组的成员，而没有普通应用程序用户是该组的成员。如果任何应用程序用户属于此特殊组，则会破坏安全性。此特殊组名称应在 conf/yarn-site.xml 和 conf/container-executor.cfg 中的配置属性 yarn.nodemanager.linux-container-executor.group 中指定。

例如，假设NodeManager以用户yarn身份运行，该用户是用户组users和hadoop的成员，其中任何一个都是主组。还假设users既有yarn，另一个用户（应用程序提交者）alice也是它的成员，而alice不属于hadoop。根据上述描述，setuid/setgid可执行文件应设置为6050或--Sr-s---，其用户所有者为yarn，组所有者为hadoop，其具有yarn作为成员（而不是users，它的成员除了yarn外还有alice）。

LinuxTaskController要求在yarn.nodemanager.local-dirs和yarn.nodemanager.log-dirs中指定的目录中，包括并引导路径设置为755权限，如上面关于目录权限的表中所述。

conf/container-executor.cfg
该可执行文件需要一个名为 container-executor.cfg 的配置文件存在于上述提到的mvn目标传递的配置目录中。

配置文件必须由运行NodeManager的用户（上面的示例中的用户yarn）拥有，由任何人拥有，并且应具有权限0400或r--------。

以下是`conf/container-executor.cfg`文件中需要包含的配置项，每行都应以简单的键值对形式提供：

| 参数                                     | 值            | 备注                                                     |
| ---------------------------------------- | ------------- | -------------------------------------------------------- |
| yarn.nodemanager.linux-container-executor.group | hadoop        | NodeManager的Unix组。container-executor二进制文件的组所有者应为此组。应与NodeManager配置的值相同。此配置对于验证container-executor二进制文件的安全访问是必需的。                     |
| banned.users                             | hdfs,yarn,mapred,bin | 禁止用户。                                            |
| allowed.system.users                     | foo,bar       | 允许的系统用户。                                       |
| min.user.id                              | 1000          | 防止其他超级用户。                                      |

回顾一下，以下是与LinuxContainerExecutor相关的各个路径所需的本地文件系统权限：

| 文件系统 | 路径                                     | 用户:组       | 权限           |
| ---------- | ---------------------------------------- | ------------- | -------------- |
| local    | container-executor                    | root:hadoop    | --Sr-s--*      |
| local    | conf/container-executor.cfg            | root:hadoop    | r-------*      |
| local    | yarn.nodemanager.local-dirs            | yarn:hadoop    | drwxr-xr-x     |
| local    | yarn.nodemanager.log-dirs              | yarn:hadoop    | drwxr-xr-x     |

## MapReduce JobHistory Server

以下是MapReduce JobHistory Server的配置参数：

| 参数                                | 值                                      | 备注                                   |
| ----------------------------------- | --------------------------------------- | -------------------------------------- |
| mapreduce.jobhistory.address        | MapReduce JobHistory Server 主机:端口     | 默认端口为10020。                        |
| mapreduce.jobhistory.keytab         | /etc/security/keytab/jhs.service.keytab | MapReduce JobHistory Server 的Kerberos keytab文件。 |
| mapreduce.jobhistory.principal      | jhs/_HOST@REALM.TLD                    | MapReduce JobHistory Server 的Kerberos principal名称。 |

# 多主机设置 Multihoming

多主机设置中，每个主机在DNS中有多个主机名（例如，对应于公共和私有网络接口的不同主机名）可能需要额外的配置才能使Kerberos身份验证正常工作。

请参阅[HDFS对多宿主网络的支持](<相关文档链接>)

# 故障排除 Troubleshooting

Kerberos的设置复杂，调试起来更加困难。常见的问题包括：

- 网络和DNS配置。
- 主机上的Kerberos配置（/etc/krb5.conf）。
- Keytab的创建和维护。
- 环境设置：JVM、用户登录、系统时钟等。

JVM生成的错误消息基本上没有实际意义，这不利于诊断和修复此类问题。

可以为客户端和任何服务启用额外的调试信息：

1. 设置环境变量`HADOOP_JAAS_DEBUG`为true。

    ```bash
    export HADOOP_JAAS_DEBUG=true
    ```

2. 编辑log4j.properties文件，将Hadoop的安全包记录为DEBUG级别。

    ```properties
    log4j.logger.org.apache.hadoop.security=DEBUG
    ```

3. 通过设置一些系统属性启用JVM级别的调试。

    ```bash
    export HADOOP_OPTS="-Djava.net.preferIPv4Stack=true -Dsun.security.krb5.debug=true -Dsun.security.spnego.debug"
    ```

# 使用 KDiag 进行故障排除

Hadoop提供了一个工具来辅助验证设置：KDiag。

它包含一系列用于JVM配置和环境的探针，会输出一些系统文件（如/etc/krb5.conf、/etc/ntp.conf），显示一些系统状态，然后尝试以当前用户或具有特定主体的指定Keytab文件名登录到Kerberos。

该命令的输出可用于本地诊断，或转发给支持集群的人员。

KDiag命令有其独立的入口点；通过将`kdiag`传递给`bin/hadoop`命令来调用它。因此，它将显示调用它的命令的Kerberos客户端状态。

```bash
hadoop kdiag
```

该命令对于成功的诊断运行返回状态码0。这并不意味着Kerberos正在工作，仅仅表示KDiag命令未从其有限的探针集中识别出任何问题。特别是，由于它不尝试连接到任何远程服务，因此它不验证客户端是否受任何服务的信任。

如果失败，退出码为：

- `-1`：由于未知原因命令失败。
- `41`：未经授权（类似于HTTP的401）。KDiag检测到导致Kerberos无法正常工作的条件。检查输出以识别问题。

## 使用方法

KDiag: 诊断Kerberos问题
```
  [-D key=value] : 定义配置选项。
  [--jaas] : 要求在java.security.auth.login.config中定义JAAS文件。
  [--keylen <keylen>] : 要求JVM支持的加密密钥的最小大小。默认值：256。
  [--keytab <keytab> --principal <principal>] : 以特定主体的身份从keytab登录。
  [--nofail] : 不在第一个问题上失败。
  [--nologin] : 不尝试登录。
  [--out <file>] : 将输出写入文件。
  [--resource <resource>] : 加载XML配置资源。
  [--secure] : 要求Hadoop配置是安全的。
  [--verifyshortname <principal>]: 验证特定主体的短名称不包含'@'或'/'。
```

#### --jaas: 要求在java.security.auth.login.config中定义JAAS文件
如果设置了 --jaas，则Java系统属性`java.security.auth.login.config`必须设置为JAAS文件；该文件必须存在，是非零字节的简单文件，并且当前用户有权读取。不执行更详细的验证。

Hadoop本身不需要JAAS文件，但某些服务（例如Zookeeper）确实需要它们以实现安全操作。

#### --keylen <length>: 要求JVM支持的加密密钥的最小大小
如果JVM不支持此长度，命令将失败。默认值为256，适用于AES256加密方案。没有安装Java Cryptography Extensions的JVM不支持这样的密钥长度。除非配置Kerberos使用较短的密钥长度的加密方案，否则Kerberos将无法工作。

#### --keytab <keytab> --principal <principal>: 从keytab登录
以特定主体的身份从keytab登录。

文件必须包含特定主体，包括任何指定的主机名。也就是说，没有从 _HOST 到当前主机名的映射。KDiag将注销并尝试重新登录。这可以捕捉到过去存在的JVM兼容性问题。（Hadoop的Kerberos支持要求使用/内省到特定于JVM的类）。

#### --nofail: 不在第一个问题上失败
KDiag将尽力诊断所有Kerberos问题，而不是在第一个问题上停止。这有一些限制；检查按问题浮出的顺序进行（例如，首先检查密钥长度），因此早期失败可能会触发更多问题。但它确实生成了更详细的报告。

#### --nologin: 不尝试登录
跳过尝试登录。这优先于 --keytab 选项，并且还禁用尝试以当前kinited用户身份登录到Kerberos。当在应用程序内调用KDiag命令时，这很有用，因为它不设置Hadoop的静态安全状态，仅检查一些基本的Kerberos前提条件。

#### --out outfile: 将输出写入文件
```bash
hadoop kdiag --out out.txt
```
大部分诊断信息来自JRE（写入stderr）和Log4j（写入stdout）。为了获取所有输出，最好将这两个输出流重定向到同一个文件，并省略 --out 选项。

```bash
hadoop kdiag --keytab zk.service.keytab --principal zookeeper/devix.example.org@REALM > out.txt 2>&1
```
即使在那里，两个流的输出，跨多个线程发出，可能会有点令人困惑。随着实践的增加，情况会变得更容易。在Log4j输出中查看线程名称以区分后台线程和主线程有助于在Hadoop级别识别，但无法帮助JVM级别的日志记录。

#### --resource <resource>: 要加载的XML配置资源
为了加载XML配置文件，可以使用此选项。默认情况下，仅加载core-default和core-site XML资源。当额外的配置文件具有任何与Kerberos相关的配置时，这将非常有帮助。

```bash
hadoop kdiag --resource hbase-default.xml --resource hbase-site.xml
```

#### --secure: 如果未在安全集群上执行命令，则失败
也就是说，如果集群的身份验证机制被明确或隐式地设置为“简单”：

```xml
<property>
  <name>hadoop.security.authentication</name>
  <value>simple</value>
</property>
```

不用说，这样配置的应用程序无法与安全的Hadoop集群通信。

#### --verifyshortname <principal>: 验证主体的短名称
这将验证主体的短名称是否不包含'@'或'/'。

## 示例

```bash
hadoop kdiag \
  --nofail \
  --resource hdfs-site.xml --resource yarn-site.xml \
  --keylen 1024 \
  --keytab zk.service.keytab --principal zookeeper/devix.example.org@REALM
```

此命令尝试执行所有诊断而不提前失败，加载HDFS和YARN XML资源，要求密钥长度至少为1024字节，并以主体`zookeeper/devix.example.org@REALM`的身份登录，其密钥必须在`zk.service.keytab`中。

### 参考文献

- O’Malley O et al. [Hadoop Security Design](ReferenceLink1)
- O’Malley O, [Hadoop Security Architecture](ReferenceLink2)
- [Troubleshooting Kerberos on Java 7](ReferenceLink3)
- [Troubleshooting Kerberos on Java 8](ReferenceLink4)
- [Java 7 Kerberos Requirements](ReferenceLink5)
- [Java 8 Kerberos Requirements](ReferenceLink6)
- Loughran S., [Hadoop and Kerberos: The Madness beyond the Gate](ReferenceLink7)

[ReferenceLink1]: <ReferenceLink1>
[ReferenceLink2]: <ReferenceLink2>
[ReferenceLink3]: <ReferenceLink3>
[ReferenceLink4]: <ReferenceLink4>
[ReferenceLink5]: <ReferenceLink5>
[ReferenceLink6]: <ReferenceLink6>
[ReferenceLink7]: <ReferenceLink7>


# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/SecureMode.html

* any list
{:toc}