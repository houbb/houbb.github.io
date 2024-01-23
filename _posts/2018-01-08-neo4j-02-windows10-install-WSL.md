---
layout: post
title:  Neo4j-02-图数据库 neo4j install on windows10 WSL 安装笔记 sdkman install jdk11 neo4j 配置详解 neo4j.conf 
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---



# 一.配置jdk

neo4j 4.x版本依赖jdk11，需要安装jdk11才能正常启动（安装高版本或低版本jdk都不行）

1）执行 `uname -a` 看下系统架构

```
$ uname -a
Linux d 5.15.133.1-microsoft-standard-WSL2 #1 SMP Thu Oct 5 21:02:42 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux
```

2）根据系统架构下载对应安装包

https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html

系统架构是ARM 64就下载ARM 64的，x86_64就下载x64的

rpm是执行rpm安装，Compressed的是解压

## sdkman 

这里是通过 sdkman 管理 jdk 版本，切换到 jdk11

```
$ java -version
openjdk version "11.0.12" 2021-07-20 LTS
OpenJDK Runtime Environment Zulu11.50+19-CA (build 11.0.12+7-LTS)
OpenJDK 64-Bit Server VM Zulu11.50+19-CA (build 11.0.12+7-LTS, mixed mode)
```

# 安装 neo4j

1）下载安装包

https://neo4j.com/download-center/

![下载](https://img-blog.csdnimg.cn/8e98da9450de4180bdedbeecb84e3522.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBA5Zyo5aKZ6KeS6Lmy552A55S75ZyI5ZyI,size_20,color_FFFFFF,t_70,g_se,x_16)

下载命令：

> [https://go.neo4j.com/download-thanks.html?edition=community&release=4.4.29&flavour=unix](https://go.neo4j.com/download-thanks.html?edition=community&release=4.4.29&flavour=unix)

直接 wget 可能无法下载。所以需要添加对应的处理。

可以下载之后，然后 scp 等方式，上传到 linux 服务器。

2) 解压

```bash
tar -zxvf neo4j-community-4.4.29-unix.tar.gz
```

如下：

```
$ pwd
/home/dh/neo4j/neo4j-community-4.4.29

$ ls
LICENSE.txt   NOTICE.txt  UPGRADE.txt  certificates  data    labs  licenses  plugins
LICENSES.txt  README.txt  bin          conf          import  lib   logs      run
```

3) 配置文件

配置文件，在 conf 下的 neo4j.conf

主要改一下网络监听，避免 WSL 中的和 windows 中的冲突。

正常使用，不需要修改端口号。

```conf
# 在默认配置下，Neo4j仅接受本地连接。
# 若要接受非本地连接，请取消注释此行：
dbms.default_listen_address=0.0.0.0  # 默认监听地址

# Bolt连接器
dbms.connector.bolt.enabled=true  # 启用Bolt连接器
#dbms.connector.bolt.tls_level=DISABLED
dbms.connector.bolt.listen_address=:17687  # Bolt连接器监听地址
dbms.connector.bolt.advertised_address=:17687  # Bolt连接器公告地址

# HTTP连接器。可以有零个或一个HTTP连接器。
dbms.connector.http.enabled=true  # 启用HTTP连接器
dbms.connector.http.listen_address=:17474  # HTTP连接器监听地址
dbms.connector.http.advertised_address=:17474  # HTTP连接器公告地
```


4) 启动服务

启动服务，neo4j根目录

```bash
bin/neo4j start
```

日志：

```
Started neo4j (pid:98357). It is available at http://0.0.0.0:17474
There may be a short delay until the server is ready.
```

5) 其他

设置开机自启可参考：https://blog.csdn.net/daidaineteasy/article/details/54864776

./neo4j 参数	说明
start	启动
status	查看状态
stop	停止
restart	重启

```
bin/neo4j stop
```

6) 登录

直接登录 http://localhost:17474/browser/

默认账户密码：neo4j/neo4j

登录后需要修改密码，我们改成 12345678 测试，实际使用需要使用安全复杂的密码。



# neo4j.conf

翻译后的参数配置：

```conf
#*****************************************************************
# Neo4j配置
#
# 有关更多详细信息和完整的设置列表，请参阅
# https://neo4j.com/docs/operations-manual/current/reference/configuration-settings/
#*****************************************************************

# 默认数据库的名称
#dbms.default_database=neo4j

# 安装目录中的目录路径。
#dbms.directories.data=data  # 数据存储路径
#dbms.directories.plugins=plugins  # 插件路径
#dbms.directories.logs=logs  # 日志路径
#dbms.directories.lib=lib  # 库路径
#dbms.directories.run=run  # 运行路径
#dbms.directories.licenses=licenses  # 许可证路径
#dbms.directories.transaction.logs.root=data/transactions  # 事务日志根路径

# 此设置将所有 `LOAD CSV` 导入文件限制在 `import` 目录下。如果要允许从文件系统的任何位置加载文件，请删除或注释掉此行；
# 这会引入潜在的安全问题。有关详细信息，请参阅手册中的 `LOAD CSV` 部分。
dbms.directories.import=import  # 导入文件路径

# Neo4j请求是否需要身份验证。
# 要禁用身份验证，请取消注释此行
#dbms.security.auth_enabled=false

# 启用此选项以能够升级存储库到旧版本。
#dbms.allow_upgrade=true

#********************************************************************
# 内存设置
#********************************************************************
#
# 内存设置以 'k' 后缀表示千字节，'m' 表示兆字节，'g' 表示吉字节。
# 如果 Neo4j 在专用服务器上运行，则通常建议为操作系统留出约 2-4 吉字节，
# 为 JVM 提供足够的堆空间以容纳所有事务状态和查询上下文，然后为页面缓存留下其余部分。

# Java堆大小：默认情况下，Java堆大小根据可用系统资源动态计算。
# 取消注释以下行以设置特定的初始和最大堆大小。
#dbms.memory.heap.initial_size=512m  # 初始堆大小
#dbms.memory.heap.max_size=512m  # 最大堆大小

# 用于映射存储文件的内存量。
# 默认的页面缓存内存假定机器专用于运行 Neo4j，并以启发式方式设置为RAM的50%，减去Java堆大小。
#dbms.memory.pagecache.size=10g  # 页面缓存大小

# 限制所有正在运行的事务可以消耗的内存量。
# 默认情况下没有限制。
#dbms.memory.transaction.global_max_size=256m  # 全局事务最大内存大小

# 限制单个事务可以消耗的内存量。
# 默认情况下没有限制。
#dbms.memory.transaction.max_size=16m  # 单个事务最大内存大小

# 事务状态位置。建议使用ON_HEAP。
dbms.tx_state.memory_allocation=ON_HEAP  # 事务状态内存分配方式

#*****************************************************************
# 网络连接器配置
#*****************************************************************

# 在默认配置下，Neo4j仅接受本地连接。
# 若要接受非本地连接，请取消注释此行：
#dbms.default_listen_address=0.0.0.0  # 默认监听地址

# 您还可以选择特定的网络接口，并为每个连接器配置非默认端口，通过设置它们的单独的listen_address。

# 服务器可被其客户端访问的地址。这可以是服务器的IP地址或DNS名称，
# 也可以是服务器前面的反向代理的地址。此设置可以在下面为单个连接器覆盖。
#dbms.default_advertised_address=localhost  # 默认公告地址

# 您还可以选择特定的公告主机名或IP地址，并为每个连接器配置广告端口，通过设置它们的
# 单独的advertised_address。

# 默认情况下，加密是关闭的。
# 若要启用加密，需要为连接器配置一个ssl策略。
# 有关如何定义SSL策略的详细信息，请参阅此文件中的SSL策略部分。

# Bolt连接器
dbms.connector.bolt.enabled=true  # 启用Bolt连接器
#dbms.connector.bolt.tls_level=DISABLED
#dbms.connector.bolt.listen_address=:7687  # Bolt连接器监听地址
#dbms.connector.bolt.advertised_address=:7687  # Bolt连接器公告地址

# HTTP连接器。可以有零个或一个HTTP连接器。
dbms.connector.http.enabled=true  # 启用HTTP连接器
#dbms.connector.http.listen_address=:7474  # HTTP连接器监听地址
#dbms.connector.http.advertised_address=:7474  # HTTP连接器公告地址

# HTTPS连接器。可以有零个或一个HTTPS连接器。
dbms.connector.https.enabled=false  # 启用HTTPS连接器
#dbms.connector.https.listen_address=:7473  # HTTPS连接器监听地址
#dbms.connector.https.advertised_address=:7473  # HTTPS连接器公告地址

# Neo4j工作线程数。
#dbms.threads.worker_count=

#*****************************************************************
# SSL策略配置
#*****************************************************************

# 每个策略都在单独的命名空间下配置，例如
#    dbms.ssl.policy.<scope>.*
#    <scope> 可以是 'bolt'、'https'、'cluster' 或 'backup' 中的任何一个
#
# scope是策略将被用于的组件的名称
# 每个需要使用ssl策略的组件都需要声明策略的至少一个设置。
# 允许的值为 'bolt'、'https'、'cluster' 或 'backup'。

# 例如，如果bolt和https连接器应该使用相同的策略，可以声明如下：
#   dbms.ssl.policy.bolt.base_directory=certificates/default
#   dbms.ssl.policy.https.base_directory=certificates/default
# 但是，强烈建议不要为多个范围使用相同的密钥对。

# 注意：必须配置连接器以支持/要求SSL/TLS，才能实际使用策略。
# 请参阅：dbms.connector.*.tls_level

# SSL设置（dbms.ssl.policy.<scope>.*）
#  .base_directory       SSL策略路径的基本目录。SSL配置中的所有相对路径将从基本目录解析。
#
#  .private_key          相对于 '.base_directory' 的密钥文件路径。
#
#  .private_key_password 私钥的密码。
#
#  .public_certificate   相对于 '.base_directory' 的公共证书文件路径。
#
#  .trusted_dir          包含受信任证书的目录路径。
#
#  .revoked_dir          包含证书吊销列表（CRLs）的目录路径。
#
#  .verify_hostname      如果为true，则服务器将验证客户端用于连接的主机名。
#                        为了使此功能正常工作，服务器公共证书必须具有有效的CN和/或匹配的Subject Alternative Names。
#
#  .client_auth          客户端应该如何被授权。可能的值为：'none'、'optional'、'require'。
#
#  .tls_versions         允许的TLS版本的逗号分隔列表。默认情况下只允许TLSv1.2。
#
#  .trust_all            将此设置为'true'将忽略信任库，信任所有客户端和服务器。
#                        不鼓励使用此模式。它会提供加密但没有安全性。
#
#  .ciphers              允许密码的逗号分隔列表。默认密码是JVM平台的默认值。

# Bolt SSL配置
dbms.ssl.policy.bolt.enabled=true  # 启用Bolt SSL
dbms.ssl.policy.bolt.base_directory=certificates/bolt  # Bolt SSL基本目录
dbms.ssl.policy.bolt.private_key=private.key  # 密钥文件路径
dbms.ssl.policy.bolt.public_certificate=public.crt  # 公共证书文件路径
dbms.ssl.policy.bolt.client_auth=NONE  # 客户端授权设置

# Https SSL配置
dbms.ssl.policy.https.enabled=true  # 启用HTTPS SSL
dbms.ssl.policy.https.base_directory=certificates/https  # HTTPS SSL基本目录
dbms.ssl.policy.https.private_key=private.key  # 密钥文件路径
dbms.ssl.policy.https.public_certificate=public.crt  # 公共证书文件路径
dbms.ssl.policy.https.client_auth=NONE  # 客户端授权设置

# 集群 SSL 配置
dbms.ssl.policy.cluster.enabled=true  # 启用集群 SSL
dbms.ssl.policy.cluster.base_directory=certificates/cluster  # 集群 SSL 基本目录
dbms.ssl.policy.cluster.private_key=private.key  # 密钥文件路径
dbms.ssl.policy.cluster.public_certificate=public.crt  # 公共证书文件路径

# 备份 SSL 配置
dbms.ssl.policy.backup.enabled=true  # 启用备份 SSL
dbms.ssl.policy.backup.base_directory=certificates/backup  # 备份 SSL 基本目录
dbms.ssl.policy.backup.private_key=private.key  # 密钥文件路径
dbms.ssl.policy.backup.public_certificate=public.crt  # 公共证书文件路径

#*****************************************************************
# 日志配置
#*****************************************************************

# 要启用HTTP日志，请取消注释此行
#dbms.logs.http.enabled=true

# 保留的HTTP日志数量。
#dbms.logs.http.rotation.keep_number=5

# 每个保留的HTTP日志的大小。
#dbms.logs.http.rotation.size=20m

# 要启用GC日志，请取消注释此行
#dbms.logs.gc.enabled=true

# GC日志选项
# 请参阅 https://docs.oracle.com/en/java/javase/11/tools/java.html#GUID-BE93ABDC-999C-4CB5-A88B-1994AAAC74D5
#dbms.logs.gc.options=-Xlog:gc*,safepoint,age*=trace

# 保留的GC日志数量。
#dbms.logs.gc.rotation.keep_number=5

# 每个保留的GC日志的大小。
#dbms.logs.gc.rotation.size=20m

# 调试日志的日志级别。可以是 DEBUG、INFO、WARN 和 ERROR 中的一个。请注意，以 DEBUG 级别记录日志可能非常冗长。
#dbms.logs.debug.level=INFO

# 调试日志轮换的大小阈值。如果设置为零，则不会发生轮换。接受二进制后缀 "k"、"m" 或 "g"。
#dbms.logs.debug.rotation.size=20m

# 内部日志的最大历史文件数。
#dbms.logs.debug.rotation.keep_number=7

#*****************************************************************
# 其他配置
#*****************************************************************

# 启用此项以指定除默认解析器外的解析器。
#cypher.default_language_version=3.5

# 确定Cypher是否允许在使用'LOAD CSV'时使用文件URL。
# 将此值设置为`false`将导致Neo4j失败`LOAD CSV`从文件系统加载数据的子句。
#dbms.security.allow_csv_import_from_file_urls=true

# Access-Control-Allow-Origin 头部的值在任何HTTP或HTTPS连接器上发送。
# 默认为'*'，允许最广泛的兼容性。请注意，此处提供的任何URI都会将HTTP/HTTPS访问限制为该URI。
#dbms.security.http_access_control_allow_origin=*

# HTTP Strict-Transport-Security（HSTS）响应头的值。此头告诉浏览器，一个网页应该只能使用HTTPS而不是HTTP进行访问。
# 它附加到每个HTTPS响应。默认情况下未设置，因此不发送'Strict-Transport-Security'头。该值应包含诸如'max-age'、'includeSubDomains'和'preload'等指令。
#dbms.security.http_strict_transport_security=

# 执行恢复和备份所需的事务日志的保留策略。
dbms.tx_log.rotation.retention_policy=1 days  # 事务日志保留策略

# 是否任何此实例上的数据库默认为只读。
# 如果为false，则可以使用dbms.database.read_only将单个数据库标记为只读。
# 如果为true，则可以使用dbms.databases.writable将单个数据库标记为可写。
#dbms.databases.default_to_read_only=false

# 包含JAX-RS资源的JAX-RS包的逗号分隔列表，每个挂载点一个包名。
# 所列的包名将在指定的挂载点下加载。
# 取消注释此行以挂载 neo4j-server-examples 中的 org.neo4j.examples.server.unmanaged.HelloWorldResource.java，
# 结果的最终URL为http://localhost:7474/examples/unmanaged/helloworld/{nodeId}
#dbms.unmanaged_extension_classes=org.neo4j.examples.server.unmanaged=/examples/unmanaged

# 允许完全访问数据库的存储过程和用户定义函数的逗号分隔列表，
# 通过不受支持/不安全的内部API。默认情况下未配置此项，以防止潜在的安全风险。
#dbms.security.procedures.unrestricted=my.extensions.example,my.procedures.*

# 用于默认加载的存储过程的逗号分隔列表。
# 如果不配置此项，将加载找到的所有存储过程。
#dbms.security.procedures.allowlist=apoc.coll.*,apoc.load.*,gds.*

#********************************************************************
# JVM 参数
#********************************************************************

# G1GC通常在吞吐量和尾部延迟之间取得了良好的平衡，而没有太多调整。
dbms.jvm.additional=-XX:+UseG1GC

# 使常见的异常继续产生堆栈跟踪，以便可以调试，而不管日志如何频繁地旋转。
dbms.jvm.additional=-XX:-OmitStackTraceInFastThrow

# 在启动数据库之前，确保“initmemory”不仅被分配，而且被提交到进程中。
# 这减少了内存碎片，增加了透明大页的有效性。它还减少了由于堆增长的GC事件导致性能下降的可能性，
# 在这种事件中，可用页面缓存的减少导致平均IO响应时间的增加。
# 如果此标志降低性能，请尝试减小堆内存。
dbms.jvm.additional=-XX:+AlwaysPreTouch

# 信任非静态最终字段确实是最终的。
# 这允许更多的优化，提高了整体性能。
# 注意：如果使用嵌入模式，或者有使用反射或序列化更改最终字段值的扩展或依赖关系，请禁用此选项！
dbms.jvm.additional=-XX:+UnlockExperimentalVMOptions
dbms.jvm.additional=-XX:+TrustFinalNonStaticFields

# 禁用显式垃圾回收，这有时由JDK本身调用。
dbms.jvm.additional=-XX:+DisableExplicitGC

# 增加可以内联的最大嵌套调用数，从 9（默认值）增加到 15
dbms.jvm.additional=-XX:MaxInlineLevel=15

# 禁用偏向锁定
dbms.jvm.additional=-XX:-UseBiasedLocking

# 限制JDK缓冲区缓存大小为256 KB
dbms.jvm.additional=-Djdk.nio.maxCachedBufferSize=262144

# 通过允许直接无清理器缓冲区来在Netty中更有效地分配缓冲区。
dbms.jvm.additional=-Dio.netty.tryReflectionSetAccessible=true

# 在内存不足错误的第一次出现时退出JVM。最好在发生内存不足错误时重新启动VM。
# dbms.jvm.additional=-XX:+ExitOnOutOfMemoryError

# 将Diffie Hellman（DH）密钥大小从默认的1024扩展到2048，用于在服务器TLS握手中使用的DH-RSA密码套件。
# 这是为了保护服务器免受潜在的被动窃听。
dbms.jvm.additional=-Djdk.tls.ephemeralDHKeySize=2048

# 这缓解了DDoS向量。
dbms.jvm.additional=-Djdk.tls.rejectClientInitiatedRenegotiation=true

# 启用远程调试
#dbms.jvm.additional=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005

# 此过滤器阻止通过java对象序列化反序

列化任意对象，以防止潜在的漏洞。
# 默认情况下，此过滤器将所有neo4j类列入白名单，以及来自hazelcast库和java标准库的类。
# 仅专业用户应更改这些默认值！
# 有关详细信息（包括过滤器语法），请参阅：https://openjdk.java.net/jeps/290
#dbms.jvm.additional=-Djdk.serialFilter=java.**;org.neo4j.**;com.neo4j.**;com.hazelcast.**;net.sf.ehcache.Element;com.sun.proxy.*;org.openjdk.jmh.**;!*

# 将默认飞行记录器堆栈采样深度从64增加到256，以避免在进行剖析时截断帧。
dbms.jvm.additional=-XX:FlightRecorderOptions=stackdepth=256

# 允许分析器在保护点之间进行采样。没有此选项，采样分析器可能产生较不准确的结果。
dbms.jvm.additional=-XX:+UnlockDiagnosticVMOptions
dbms.jvm.additional=-XX:+DebugNonSafepoints

# 禁用日志记录JMX端点。
dbms.jvm.additional=-Dlog4j2.disable.jmx=true

# 限制JVM元空间和代码缓存以允许垃圾回收。由Cypher用于代码生成，可能会无限增长，除非受到限制。
# 在内存受限制的环境中很有用
#dbms.jvm.additional=-XX:MaxMetaspaceSize=1024m
#dbms.jvm.additional=-XX:ReservedCodeCacheSize=512m

#********************************************************************
# 包装器Windows NT/2000/XP服务属性
#********************************************************************
# 警告 - 当使用此配置文件的应用程序已安装为服务时，不要修改这些属性。
# 在修改此部分之前，请卸载服务。然后可以重新安装服务。

# 服务的名称
dbms.windows_service_name=neo4j

#********************************************************************
# 其他Neo4j系统属性
#********************************************************************
```

原始如下：

```conf
$ cat neo4j.conf
#*****************************************************************
# Neo4j configuration
#
# For more details and a complete list of settings, please see
# https://neo4j.com/docs/operations-manual/current/reference/configuration-settings/
#*****************************************************************

# The name of the default database
#dbms.default_database=neo4j

# Paths of directories in the installation.
#dbms.directories.data=data
#dbms.directories.plugins=plugins
#dbms.directories.logs=logs
#dbms.directories.lib=lib
#dbms.directories.run=run
#dbms.directories.licenses=licenses
#dbms.directories.transaction.logs.root=data/transactions

# This setting constrains all `LOAD CSV` import files to be under the `import` directory. Remove or comment it out to
# allow files to be loaded from anywhere in the filesystem; this introduces possible security problems. See the
# `LOAD CSV` section of the manual for details.
dbms.directories.import=import

# Whether requests to Neo4j are authenticated.
# To disable authentication, uncomment this line
#dbms.security.auth_enabled=false

# Enable this to be able to upgrade a store from an older version.
#dbms.allow_upgrade=true

#********************************************************************
# Memory Settings
#********************************************************************
#
# Memory settings are specified kilobytes with the 'k' suffix, megabytes with
# 'm' and gigabytes with 'g'.
# If Neo4j is running on a dedicated server, then it is generally recommended
# to leave about 2-4 gigabytes for the operating system, give the JVM enough
# heap to hold all your transaction state and query context, and then leave the
# rest for the page cache.

# Java Heap Size: by default the Java heap size is dynamically calculated based
# on available system resources. Uncomment these lines to set specific initial
# and maximum heap size.
#dbms.memory.heap.initial_size=512m
#dbms.memory.heap.max_size=512m

# The amount of memory to use for mapping the store files.
# The default page cache memory assumes the machine is dedicated to running
# Neo4j, and is heuristically set to 50% of RAM minus the Java heap size.
#dbms.memory.pagecache.size=10g

# Limit the amount of memory that all of the running transaction can consume.
# By default there is no limit.
#dbms.memory.transaction.global_max_size=256m

# Limit the amount of memory that a single transaction can consume.
# By default there is no limit.
#dbms.memory.transaction.max_size=16m

# Transaction state location. It is recommended to use ON_HEAP.
dbms.tx_state.memory_allocation=ON_HEAP

#*****************************************************************
# Network connector configuration
#*****************************************************************

# With default configuration Neo4j only accepts local connections.
# To accept non-local connections, uncomment this line:
#dbms.default_listen_address=0.0.0.0

# You can also choose a specific network interface, and configure a non-default
# port for each connector, by setting their individual listen_address.

# The address at which this server can be reached by its clients. This may be the server's IP address or DNS name, or
# it may be the address of a reverse proxy which sits in front of the server. This setting may be overridden for
# individual connectors below.
#dbms.default_advertised_address=localhost

# You can also choose a specific advertised hostname or IP address, and
# configure an advertised port for each connector, by setting their
# individual advertised_address.

# By default, encryption is turned off.
# To turn on encryption, an ssl policy for the connector needs to be configured
# Read more in SSL policy section in this file for how to define a SSL policy.

# Bolt connector
dbms.connector.bolt.enabled=true
#dbms.connector.bolt.tls_level=DISABLED
#dbms.connector.bolt.listen_address=:7687
#dbms.connector.bolt.advertised_address=:7687

# HTTP Connector. There can be zero or one HTTP connectors.
dbms.connector.http.enabled=true
#dbms.connector.http.listen_address=:7474
#dbms.connector.http.advertised_address=:7474

# HTTPS Connector. There can be zero or one HTTPS connectors.
dbms.connector.https.enabled=false
#dbms.connector.https.listen_address=:7473
#dbms.connector.https.advertised_address=:7473

# Number of Neo4j worker threads.
#dbms.threads.worker_count=

#*****************************************************************
# SSL policy configuration
#*****************************************************************

# Each policy is configured under a separate namespace, e.g.
#    dbms.ssl.policy.<scope>.*
#    <scope> can be any of 'bolt', 'https', 'cluster' or 'backup'
#
# The scope is the name of the component where the policy will be used
# Each component where the use of an ssl policy is desired needs to declare at least one setting of the policy.
# Allowable values are 'bolt', 'https', 'cluster' or 'backup'.

# E.g if bolt and https connectors should use the same policy, the following could be declared
#   dbms.ssl.policy.bolt.base_directory=certificates/default
#   dbms.ssl.policy.https.base_directory=certificates/default
# However, it's strongly encouraged to not use the same key pair for multiple scopes.
#
# N.B: Note that a connector must be configured to support/require
#      SSL/TLS for the policy to actually be utilized.
#
# see: dbms.connector.*.tls_level

# SSL settings (dbms.ssl.policy.<scope>.*)
#  .base_directory       Base directory for SSL policies paths. All relative paths within the
#                        SSL configuration will be resolved from the base dir.
#
#  .private_key          A path to the key file relative to the '.base_directory'.
#
#  .private_key_password The password for the private key.
#
#  .public_certificate   A path to the public certificate file relative to the '.base_directory'.
#
#  .trusted_dir          A path to a directory containing trusted certificates.
#
#  .revoked_dir          Path to the directory with Certificate Revocation Lists (CRLs).
#
#  .verify_hostname      If true, the server will verify the hostname that the client uses to connect with. In order
#                        for this to work, the server public certificate must have a valid CN and/or matching
#                        Subject Alternative Names.
#
#  .client_auth          How the client should be authorized. Possible values are: 'none', 'optional', 'require'.
#
#  .tls_versions         A comma-separated list of allowed TLS versions. By default only TLSv1.2 is allowed.
#
#  .trust_all            Setting this to 'true' will ignore the trust truststore, trusting all clients and servers.
#                        Use of this mode is discouraged. It would offer encryption but no security.
#
#  .ciphers              A comma-separated list of allowed ciphers. The default ciphers are the defaults of
#                        the JVM platform.

# Bolt SSL configuration
#dbms.ssl.policy.bolt.enabled=true
#dbms.ssl.policy.bolt.base_directory=certificates/bolt
#dbms.ssl.policy.bolt.private_key=private.key
#dbms.ssl.policy.bolt.public_certificate=public.crt
#dbms.ssl.policy.bolt.client_auth=NONE

# Https SSL configuration
#dbms.ssl.policy.https.enabled=true
#dbms.ssl.policy.https.base_directory=certificates/https
#dbms.ssl.policy.https.private_key=private.key
#dbms.ssl.policy.https.public_certificate=public.crt
#dbms.ssl.policy.https.client_auth=NONE

# Cluster SSL configuration
#dbms.ssl.policy.cluster.enabled=true
#dbms.ssl.policy.cluster.base_directory=certificates/cluster
#dbms.ssl.policy.cluster.private_key=private.key
#dbms.ssl.policy.cluster.public_certificate=public.crt

# Backup SSL configuration
#dbms.ssl.policy.backup.enabled=true
#dbms.ssl.policy.backup.base_directory=certificates/backup
#dbms.ssl.policy.backup.private_key=private.key
#dbms.ssl.policy.backup.public_certificate=public.crt

#*****************************************************************
# Logging configuration
#*****************************************************************

# To enable HTTP logging, uncomment this line
#dbms.logs.http.enabled=true

# Number of HTTP logs to keep.
#dbms.logs.http.rotation.keep_number=5

# Size of each HTTP log that is kept.
#dbms.logs.http.rotation.size=20m

# To enable GC Logging, uncomment this line
#dbms.logs.gc.enabled=true

# GC Logging Options
# see https://docs.oracle.com/en/java/javase/11/tools/java.html#GUID-BE93ABDC-999C-4CB5-A88B-1994AAAC74D5
#dbms.logs.gc.options=-Xlog:gc*,safepoint,age*=trace

# Number of GC logs to keep.
#dbms.logs.gc.rotation.keep_number=5

# Size of each GC log that is kept.
#dbms.logs.gc.rotation.size=20m

# Log level for the debug log. One of DEBUG, INFO, WARN and ERROR. Be aware that logging at DEBUG level can be very verbose.
#dbms.logs.debug.level=INFO

# Size threshold for rotation of the debug log. If set to zero then no rotation will occur. Accepts a binary suffix "k",
# "m" or "g".
#dbms.logs.debug.rotation.size=20m

# Maximum number of history files for the internal log.
#dbms.logs.debug.rotation.keep_number=7

#*****************************************************************
# Miscellaneous configuration
#*****************************************************************

# Enable this to specify a parser other than the default one.
#cypher.default_language_version=3.5

# Determines if Cypher will allow using file URLs when loading data using
# `LOAD CSV`. Setting this value to `false` will cause Neo4j to fail `LOAD CSV`
# clauses that load data from the file system.
#dbms.security.allow_csv_import_from_file_urls=true


# Value of the Access-Control-Allow-Origin header sent over any HTTP or HTTPS
# connector. This defaults to '*', which allows broadest compatibility. Note
# that any URI provided here limits HTTP/HTTPS access to that URI only.
#dbms.security.http_access_control_allow_origin=*

# Value of the HTTP Strict-Transport-Security (HSTS) response header. This header
# tells browsers that a webpage should only be accessed using HTTPS instead of HTTP.
# It is attached to every HTTPS response. Setting is not set by default so
# 'Strict-Transport-Security' header is not sent. Value is expected to contain
# directives like 'max-age', 'includeSubDomains' and 'preload'.
#dbms.security.http_strict_transport_security=

# Retention policy for transaction logs needed to perform recovery and backups.
dbms.tx_log.rotation.retention_policy=1 days

# Whether or not any database on this instance are read_only by default.
# If false, individual databases may be marked as read_only using dbms.database.read_only.
# If true, individual databases may be marked as writable using dbms.databases.writable.
#dbms.databases.default_to_read_only=false

# Comma separated list of JAX-RS packages containing JAX-RS resources, one
# package name for each mountpoint. The listed package names will be loaded
# under the mountpoints specified. Uncomment this line to mount the
# org.neo4j.examples.server.unmanaged.HelloWorldResource.java from
# neo4j-server-examples under /examples/unmanaged, resulting in a final URL of
# http://localhost:7474/examples/unmanaged/helloworld/{nodeId}
#dbms.unmanaged_extension_classes=org.neo4j.examples.server.unmanaged=/examples/unmanaged

# A comma separated list of procedures and user defined functions that are allowed
# full access to the database through unsupported/insecure internal APIs.
#dbms.security.procedures.unrestricted=my.extensions.example,my.procedures.*

# A comma separated list of procedures to be loaded by default.
# Leaving this unconfigured will load all procedures found.
#dbms.security.procedures.allowlist=apoc.coll.*,apoc.load.*,gds.*

#********************************************************************
# JVM Parameters
#********************************************************************

# G1GC generally strikes a good balance between throughput and tail
# latency, without too much tuning.
dbms.jvm.additional=-XX:+UseG1GC

# Have common exceptions keep producing stack traces, so they can be
# debugged regardless of how often logs are rotated.
dbms.jvm.additional=-XX:-OmitStackTraceInFastThrow

# Make sure that `initmemory` is not only allocated, but committed to
# the process, before starting the database. This reduces memory
# fragmentation, increasing the effectiveness of transparent huge
# pages. It also reduces the possibility of seeing performance drop
# due to heap-growing GC events, where a decrease in available page
# cache leads to an increase in mean IO response time.
# Try reducing the heap memory, if this flag degrades performance.
dbms.jvm.additional=-XX:+AlwaysPreTouch

# Trust that non-static final fields are really final.
# This allows more optimizations and improves overall performance.
# NOTE: Disable this if you use embedded mode, or have extensions or dependencies that may use reflection or
# serialization to change the value of final fields!
dbms.jvm.additional=-XX:+UnlockExperimentalVMOptions
dbms.jvm.additional=-XX:+TrustFinalNonStaticFields

# Disable explicit garbage collection, which is occasionally invoked by the JDK itself.
dbms.jvm.additional=-XX:+DisableExplicitGC

#Increase maximum number of nested calls that can be inlined from 9 (default) to 15
dbms.jvm.additional=-XX:MaxInlineLevel=15

# Disable biased locking
dbms.jvm.additional=-XX:-UseBiasedLocking

# Restrict size of cached JDK buffers to 256 KB
dbms.jvm.additional=-Djdk.nio.maxCachedBufferSize=262144

# More efficient buffer allocation in Netty by allowing direct no cleaner buffers.
dbms.jvm.additional=-Dio.netty.tryReflectionSetAccessible=true

# Exits JVM on the first occurrence of an out-of-memory error. Its preferable to restart VM in case of out of memory errors.
# dbms.jvm.additional=-XX:+ExitOnOutOfMemoryError

# Expand Diffie Hellman (DH) key size from default 1024 to 2048 for DH-RSA cipher suites used in server TLS handshakes.
# This is to protect the server from any potential passive eavesdropping.
dbms.jvm.additional=-Djdk.tls.ephemeralDHKeySize=2048

# This mitigates a DDoS vector.
dbms.jvm.additional=-Djdk.tls.rejectClientInitiatedRenegotiation=true

# Enable remote debugging
#dbms.jvm.additional=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005

# This filter prevents deserialization of arbitrary objects via java object serialization, addressing potential vulnerabilities.
# By default this filter whitelists all neo4j classes, as well as classes from the hazelcast library and the java standard library.
# These defaults should only be modified by expert users!
# For more details (including filter syntax) see: https://openjdk.java.net/jeps/290
#dbms.jvm.additional=-Djdk.serialFilter=java.**;org.neo4j.**;com.neo4j.**;com.hazelcast.**;net.sf.ehcache.Element;com.sun.proxy.*;org.openjdk.jmh.**;!*

# Increase the default flight recorder stack sampling depth from 64 to 256, to avoid truncating frames when profiling.
dbms.jvm.additional=-XX:FlightRecorderOptions=stackdepth=256

# Allow profilers to sample between safepoints. Without this, sampling profilers may produce less accurate results.
dbms.jvm.additional=-XX:+UnlockDiagnosticVMOptions
dbms.jvm.additional=-XX:+DebugNonSafepoints

# Disable logging JMX endpoint.
dbms.jvm.additional=-Dlog4j2.disable.jmx=true

# Limit JVM metaspace and code cache to allow garbage collection. Used by cypher for code generation and may grow indefinitely unless constrained.
# Useful for memory constrained environments
#dbms.jvm.additional=-XX:MaxMetaspaceSize=1024m
#dbms.jvm.additional=-XX:ReservedCodeCacheSize=512m

#********************************************************************
# Wrapper Windows NT/2000/XP Service Properties
#********************************************************************
# WARNING - Do not modify any of these properties when an application
#  using this configuration file has been installed as a service.
#  Please uninstall the service before modifying this section.  The
#  service can then be reinstalled.

# Name of the service
dbms.windows_service_name=neo4j

#********************************************************************
# Other Neo4j system properties
#********************************************************************
```



# chat

## skdman 如何切换 jdk 版本到 jdk11



在使用 `sdkman` 切换 JDK 版本时，你可以通过以下步骤将 JDK 版本切换到 JDK 11：

sdkman 一来 zip

```bash
sudo apt install zip
```

1. **安装 SDKMAN:**

   如果你还没有安装 `sdkman`，可以使用以下命令进行安装：

   ```bash
   curl -s "https://get.sdkman.io" | bash
   source "$HOME/.sdkman/bin/sdkman-init.sh"
   ```

   或者使用 `wget` 安装：

   ```bash
   wget -q -O - "https://get.sdkman.io" | bash
   source "$HOME/.sdkman/bin/sdkman-init.sh"
   ```

2. **安装 JDK 11:**

   使用以下命令安装 JDK 11：

   ```bash
   sdk install java 11.0.12-zulu
   ```

   这里使用了 Zulu JDK 11，你也可以选择其他提供的 JDK 版本，例如 AdoptOpenJDK 等。

3. **切换 JDK 版本:**

   安装完成后，你可以使用以下命令切换 JDK 版本：

   ```bash
   sdk use java 11.0.12-zulu
   ```

   将上述命令中的版本号替换为你安装的 JDK 版本。

4. **验证切换:**

   确保切换成功，可以使用以下命令查看当前使用的 JDK 版本：

   ```bash
   java -version
   ```

   应该输出 JDK 11 的版本信息。

通过这些步骤，你就可以使用 `sdkman` 轻松地安装和切换不同版本的 JDK。

如果你需要切换回其他 JDK 版本，可以重复上述步骤，选择相应的版本进行安装和切换。

## 安装

要在Windows Subsystem for Linux (WSL) 上安装Neo4j，您可以按照以下步骤进行操作：

5. **安装Java:**
   - 在WSL终端中运行以下命令安装Java：
     ```bash
     sudo apt install default-jre -y
     ```

6. **下载并安装Neo4j:**
   - 在WSL终端中，使用wget或浏览器下载Neo4j Community Edition的tarball文件。可以在 [Neo4j 下载页面](https://neo4j.com/download/) 找到最新的版本。
     ```bash
     wget <Neo4j下载链接>
     ```
   - 解压tarball文件，并将Neo4j移动到适当的位置。
     ```bash
     tar -xf <下载的文件.tar.gz>
     sudo mv <解压后的Neo4j目录> /opt/
     ```

7. **启动Neo4j:**
   - 进入Neo4j目录，并运行启动命令：
     ```bash
     cd /opt/<Neo4j目录>
     bin/neo4j start
     ```

8. **访问Neo4j浏览器:**
   - 打开Web浏览器，访问 [http://localhost:7474](http://localhost:7474/)。
   - 使用默认用户名 "neo4j" 和密码 "neo4j" 登录。

现在，您应该能够在WSL上成功安装和运行Neo4j数据库。请注意，上述步骤可能会因Neo4j版本的不同而有所变化，因此请参考Neo4j官方文档以获取详细的安装说明。


```
// 创建应用节点  
CREATE (appA:Application {name: '应用A'})  
CREATE (appB:Application {name: '应用B'})  
  
// 创建方法节点  
CREATE (methodA:Method {name: 'methodA', app: appA})  
CREATE (methodB:Method {name: 'methodB', app: appB})  
  
// 创建调用关系  
CREATE (methodA)-[:CALLS]->(methodB)
```

# 参考资料

[【数据库】linux安装neo4j教程（neo4j 4.x）](https://blog.csdn.net/weixin_42584156/article/details/122786519)

* any list
{:toc}

