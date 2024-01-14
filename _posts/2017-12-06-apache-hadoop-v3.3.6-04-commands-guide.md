---
layout: post
title:  Apache Hadoop v3.3.6-04-Hadoop Commands Guide
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# Hadoop Commands Guide
Overview
Shell Options
Generic Options
User Commands
archive
checknative
classpath
conftest
credential
distch
distcp
dtutil
fs
gridmix
jar
jnipath
kerbname
kdiag
key
kms
trace
version
CLASSNAME
envvars
Administration Commands
daemonlog
Files
etc/hadoop/hadoop-env.sh
etc/hadoop/hadoop-user-functions.sh
~/.hadooprc

# **概述**

所有Hadoop命令和子项目都遵循相同的基本结构：

```bash
Usage: shellcommand [SHELL_OPTIONS] [COMMAND] [GENERIC_OPTIONS] [COMMAND_OPTIONS]
```

## **字段说明**

- **shellcommand：** 被调用的项目的命令。例如，Hadoop通用使用`hadoop`，HDFS使用`hdfs`，YARN使用`yarn`。
- **SHELL_OPTIONS：** 在执行Java之前shell处理的选项。
- **COMMAND：** 要执行的操作。
- **GENERIC_OPTIONS：** 多个命令都支持的一组通用选项。
- **COMMAND_OPTIONS：** 本文档中描述的Hadoop通用子项目的各种命令及其选项。有关HDFS和YARN的信息在其他文档中。

## **Shell Options**

所有shell命令都将接受一组通用的选项。

对于某些命令，这些选项会被忽略。

例如，在仅在单个主机上执行的命令上传递 `--hostnames` 将被忽略。

| SHELL_OPTION | 描述 |
| --- | --- |
| --buildpaths | 启用jar包的开发者版本。 |
| --config confdir | 覆盖默认的配置目录。默认是 $HADOOP_HOME/etc/hadoop。 |
| --daemon mode | 如果命令支持守护进程模式（例如，hdfs namenode），以适当的模式执行。支持的模式有 start（以守护进程模式启动进程），stop（停止进程） 和 status（确定进程的活动状态）。status将返回符合LSB标准的结果代码。如果没有提供选项，支持守护进程的命令将在前台运行。对于不支持守护进程的命令，将忽略此选项。 |
| --debug | 启用shell级别的配置调试信息。 |
| --help | 显示脚本的使用信息。 |
| --hostnames | 当使用 --workers 时，用空格分隔的主机名列表覆盖 workers 文件，在这些主机上执行多主机子命令。如果未使用 --workers，则将忽略此选项。 |
| --hosts | 当使用 --workers 时，用另一个文件覆盖 workers 文件，该文件包含要执行多主机子命令的主机名列表。如果未使用 --workers，则将忽略此选项。 |
| --loglevel loglevel | 覆盖日志级别。有效的日志级别包括 FATAL、ERROR、WARN、INFO、DEBUG 和 TRACE。默认为 INFO。 |
| --workers | 如果可能，将此命令在 workers 文件中的所有主机上执行。 |

## **通用选项**

许多子命令都支持一组通用的配置选项，以更改它们的行为：

| GENERIC_OPTION | 描述 |
| --- | --- |
| -archives <comma separated list of archives> | 指定要在计算机上解压缩的逗号分隔的归档文件。仅适用于 job。 |
| -conf <configuration file> | 指定应用程序配置文件。 |
| -D <property>=<value> | 为给定的属性使用值。 |
| -files <comma separated list of files> | 指定要复制到MapReduce集群的逗号分隔的文件。仅适用于 job。 |
| -fs <file:///> 或 <hdfs://namenode:port> | 指定要使用的默认文件系统URL。覆盖配置中的 ‘fs.defaultFS’ 属性。 |
| -jt <local> 或 <resourcemanager:port> | 指定一个ResourceManager。仅适用于 job。 |
| -libjars <comma separated list of jars> | 指定要包含在类路径中的逗号分隔的jar文件。仅适用于 job。 |

## **Hadoop通用命令**

所有这些命令都是从 `hadoop shell` 命令执行的。

它们已分为用户命令和管理命令。

# **用户命令**

这些命令对于Hadoop集群的用户非常有用。

## 1. **archive**
   - 创建Hadoop存档。更多信息可以在[Hadoop Archives Guide](https://hadoop.apache.org/docs/stable/hadoop-archive-commands/HadoopArchives.html)找到。

   ```bash
   Usage: hadoop archive
   ```

## 2. **checknative**
   - 用于检查Hadoop本地代码的可用性。

   ```bash
   Usage: hadoop checknative [-a] [-h]
   ```

   - **COMMAND_OPTION:**
     - `-a`: 检查所有库的可用性。
     - `-h`: 打印帮助信息。

## 3. **classpath**
   - 打印获取Hadoop jar和所需库所需的类路径。

   ```bash
   Usage: hadoop classpath [--glob |--jar <path> |-h |--help]
   ```

   - **COMMAND_OPTION:**
     - `--glob`: 扩展通配符。
     - `--jar path`: 将类路径写入名为路径的jar文件的清单中。
     - `-h`, `--help`: 打印帮助信息。

## 4. **conftest**

   - 用于验证配置XML文件的有效性。

   ```bash
   Usage: hadoop conftest [-conffile <path>]... 
   ```

   - **COMMAND_OPTION:**
     - `-conffile`: 验证的配置文件或目录的路径。
     - `-h`, `--help`: 打印帮助信息。

验证是相当基本的：XML被解析，检查重复和空属性名称。该命令不支持XInclude；如果使用XInclude来拉取配置项，它将声明XML文件无效。

## **credential**

`hadoop credential`命令用于管理凭据、密码和秘密，这些信息存储在凭据提供程序中。以下是一些`credential`命令的子命令：

1. **create alias**
   - 用于提示用户输入要存储的凭据，作为给定别名的一部分。
   - 可以使用 `-provider` 选项指定提供程序路径，使用 `-strict` 选项在提供程序使用默认密码时导致命令失败。
   - 使用 `-value` 标志提供凭据值（别名密码）而不是提示用户。

   ```bash
   Usage: hadoop credential create alias [-provider provider-path] [-strict] [-value credential-value]
   ```

2. **delete alias**
   - 用于删除具有提供的别名的凭据。
   - 可以使用 `-provider` 选项指定提供程序路径，使用 `-strict` 选项在提供程序使用默认密码时导致命令失败。
   - 使用 `-f` 选项可以避免删除时的确认提示。

   ```bash
   Usage: hadoop credential delete alias [-provider provider-path] [-strict] [-f]
   ```

3. **list**
   - 列出所有凭据别名。
   - 可以使用 `-provider` 选项指定提供程序路径，使用 `-strict` 选项在提供程序使用默认密码时导致命令失败。

   ```bash
   Usage: hadoop credential list [-provider provider-path] [-strict]
   ```

4. **check alias**
   - 检查给定别名的密码。
   - 可以使用 `-provider` 选项指定提供程序路径，使用 `-strict` 选项在提供程序使用默认密码时导致命令失败。

   ```bash
   Usage: hadoop credential check alias [-provider provider-path] [-strict]
   ```

**命令用法:**
```bash
hadoop credential <subcommand> [options]
```

**通用选项:**
- `-provider`: 指定凭据提供程序路径。
- `-strict`: 如果提供程序使用默认密码，则导致命令失败。

**示例:**

```bash
hadoop credential list -provider jceks://file/tmp/test.jceks
```

## **distch**

`hadoop distch`命令用于批量更改多个文件的所有者和权限。以下是该命令的一些子命令：

1. **-f**
   - 指定要更改的对象列表。

2. **-i**
   - 忽略失败。

3. **-log**
   - 指定日志输出的目录。

**命令用法:**
```bash
hadoop distch [-f urilist_url] [-i] [-log logdir] path:owner:group:permissions
```

**COMMAND_OPTION 说明:**
- `-f`: 要更改的对象列表。
- `-i`: 忽略失败。
- `-log`: 指定日志输出的目录。

**示例:**
```bash
hadoop distch -f urilist.txt -i -log /path/to/logdir path:owner:group:permissions
```

---

## **distcp**

`hadoop distcp`命令用于递归地复制文件或目录。

更多信息可以在[Hadoop DistCp Guide](https://hadoop.apache.org/docs/current/hadoop-distcp/DistCp.html)中找到。

**命令用法:**
```bash
hadoop distcp <options> <srcurl>* <desturl>
```

**COMMAND_OPTION 说明:**
- `<srcurl>`: 源URL，指定要复制的文件或目录的位置。
- `<desturl>`: 目标URL，指定要将文件或目录复制到的位置。
- `<options>`: 可用的选项包括：
  - `-update`: 仅在源文件比目标文件新时才复制。
  - `-overwrite`: 覆盖现有目标文件。
  - `-delete`: 删除目标上不在源中的文件。
  - 等等，详细信息请参阅[DistCp文档](https://hadoop.apache.org/docs/current/hadoop-distcp/DistCp.html)。

**示例:**
```bash
hadoop distcp -update -delete hdfs://namenode1:8020/srcdir hdfs://namenode2:8020/destdir
```

---

## dtutil

用法: hadoop dtutil [-keytab keytab文件 -principal principal名称] 子命令 [-format (java|protobuf)] [-alias 别名] [-renewer 更新者] 文件名…

此实用程序用于获取和管理Hadoop委托令牌（delegation tokens）在凭据文件中。它旨在替代更简单的fetchdt命令。有多个子命令，每个都有自己的标志和选项。

对于每个写出文件的子命令，-format选项将指定要使用的内部格式。java是与fetchdt匹配的传统格式。默认是protobuf。

对于每个连接到服务的子命令，提供了方便的标志来指定用于身份验证的Kerberos主体名称和keytab文件。

| 子命令   | 描述 |
| -------- | ---- |
| print    | 打印出文件中包含的令牌的字段（和文件名2 …）。如果指定了别名，则仅打印与别名匹配的令牌。否则，打印所有令牌。 |
| get URL  | 从URL上的服务获取令牌并将其放入文件名中。URL是必需的，必须紧随get之后。URL是服务URL，例如hdfs://localhost:9000。别名将覆盖令牌中的服务字段。适用于具有外部和内部名称的主机，例如firewall.com:14000。文件名应该最后出现，是令牌文件的名称。如果不存在，将创建它。否则，将令牌添加到现有文件中。-service标志应仅与以http或https开头的URL一起使用。以下是等效的：hdfs://localhost:9000/ vs. http://localhost:9000 -service hdfs |
| append   | 将第一个N个文件名的内容附加到最后一个文件名中。当具有相同服务字段的令牌存在于多个文件中时，将覆盖较早文件中的令牌。也就是说，总是保留在最后一个文件中存在的令牌。 |
| remove -alias 别名 | 从每个指定的文件中删除与别名匹配的令牌，并使用指定的格式写出每个文件。必须指定别名。 |
| cancel -alias 别名 | 与remove相似，但使用令牌对象中指定的服务取消令牌。必须指定别名。 |
| renew -alias 别名 | 对于每个指定的文件，续订与别名匹配的令牌，并使用指定的格式写出每个文件。必须指定别名。 |
| import base64 | 从base64令牌导入令牌。别名将覆盖令牌中的服务字段。 |


## fs

该命令在文件系统 Shell Guide 中有文档。当使用 HDFS 时，它是 hdfs dfs 的同义词。

## gridmix

Gridmix 是用于 Hadoop 集群的基准测试工具。更多信息可以在 Gridmix Guide 中找到。

## jar

用法: `hadoop jar <jar文件> [主类] 参数...`

运行一个 jar 文件。

使用 yarn jar 启动 YARN 应用程序。

## jnipath

用法: hadoop jnipath

打印计算得到的 java.library.path。

## kerbname

用法: hadoop kerbname principal

通过 auth_to_local 规则将指定的 principal 转换为 Hadoop 用户名。

示例: hadoop kerbname user@EXAMPLE.COM

## kdiag

用法: hadoop kdiag

诊断 Kerberos 问题

##  key

用法：`hadoop key <子命令> [选项]`

```
COMMAND_OPTION	描述
create keyname [-cipher cipher] [-size size] [-description description] [-attr attribute=value] [-provider provider] [-strict] [-help]	在由-provider参数指定的提供程序中为keyname参数指定的名称创建一个新的密钥。如果提供程序使用默认密码，-strict标志将导致命令失败。您可以使用-cipher参数指定密码。默认密码是“AES/CTR/NoPadding”。默认密钥大小为128。您可以使用-size参数指定请求的密钥长度。可以使用-attr参数指定任意的attribute=value格式属性。-attr可以多次指定，每个属性一次。
roll keyname [-provider provider] [-strict] [-help]	在使用-provider参数指定的提供程序中为指定的密钥创建一个新版本。如果提供程序使用默认密码，-strict标志将导致命令失败。
delete keyname [-provider provider] [-strict] [-f] [-help]	从由-provider指定的提供程序中删除keyname参数指定的密钥的所有版本。如果提供程序使用默认密码，-strict标志将导致命令失败。除非指定了-f，否则该命令将要求用户确认。
list [-provider provider] [-strict] [-metadata] [-help]	显示配置在core-site.xml中或使用-provider参数指定的特定提供程序中包含的密钥名称。如果提供程序使用默认密码，-strict标志将导致命令失败。-metadata显示元数据。
check keyname [-provider provider] [-strict] [-help]	检查配置在core-site.xml中或使用-provider参数指定的特定提供程序中包含的keyname的密码。如果提供程序使用默认密码，-strict标志将导致命令失败。
| -help | 打印此命令的用法 |
```


通过KeyProvider管理密钥。有关KeyProviders的详细信息，请参阅Transparent Encryption Guide。

提供程序通常要求提供密码或其他秘密。如果提供程序需要密码但无法找到密码，它将使用默认密码并发出警告消息，指出正在使用默认密码。如果提供-strict标志，警告消息将变为错误消息，并且命令将立即返回错误状态。

注意：某些KeyProviders（例如org.apache.hadoop.crypto.key.JavaKeyStoreProvider）不支持大写密钥名称。

注意：某些KeyProviders不直接执行密钥删除（例如执行软删除，或延迟实际删除，以防止错误）。在这些情况下，在删除后尝试使用相同名称创建/删除密钥时可能会遇到错误。请查看底层KeyProvider以获取详细信息。

## kms

用法：hadoop kms

运行KMS，密钥管理服务器。

## trace

查看和修改Hadoop跟踪设置。请参阅Tracing Guide。

## version

用法：hadoop version

打印版本信息。

## CLASSNAME

用法：hadoop CLASSNAME

运行名为CLASSNAME的类。该类必须是包的一部分。

## envvars

用法：hadoop envvars

显示计算出的Hadoop环境变量。

# 管理员命令

用于Hadoop集群管理员的有用命令。

## daemonlog

用法：

```
hadoop daemonlog -getlevel <host:port> <classname> [-protocol (http|https)]
hadoop daemonlog -setlevel <host:port> <classname> <level> [-protocol (http|https)]
```

COMMAND_OPTION	描述

-getlevel host:port classname [-protocol (http|https)]	打印在host:port上运行的守护程序中，由限定类名标识的日志的日志级别。-protocol标志指定连接的协议。
-setlevel host:port classname level [-protocol (http|https)]	设置在host:port上运行的守护程序中，由限定类名标识的日志的日志级别。-protocol标志指定连接的协议。
动态获取/设置守护程序中由限定类名标识的日志的日志级别。默认情况下，该命令发送HTTP请求，但可以通过使用参数-protocol https覆盖为发送HTTPS请求。

示例：

```
$ bin/hadoop daemonlog -setlevel 127.0.0.1:9870 org.apache.hadoop.hdfs.server.namenode.NameNode DEBUG
$ bin/hadoop daemonlog -getlevel 127.0.0.1:9871 org.apache.hadoop.hdfs.server.namenode.NameNode DEBUG -protocol https
```

请注意，此设置不是永久性的，将在重新启动守护程序时重置。

此命令通过向守护程序的内部Jetty servlet发送HTTP/HTTPS请求来工作，因此支持以下守护程序：

- Common
密钥管理服务器

- HDFS
名称节点
辅助名称节点
数据节点
日志节点
HttpFS服务器

- YARN
资源管理器
节点管理器
时间轴服务器


# Files

etc/hadoop/hadoop-env.sh
此文件存储所有Hadoop shell命令使用的全局设置。

etc/hadoop/hadoop-user-functions.sh
此文件允许高级用户覆盖一些shell功能。

~/.hadooprc
此文件存储个人用户的环境设置。它在hadoop-env.sh和hadoop-user-functions.sh文件之后进行处理，可以包含相同的设置。

# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/CommandsManual.html

* any list
{:toc}