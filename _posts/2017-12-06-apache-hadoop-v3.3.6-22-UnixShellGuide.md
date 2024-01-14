---
layout: post
title:  Apache Hadoop v3.3.6-22-Unix Shell Guide
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# **重要的终端用户环境变量**

Apache Hadoop有许多环境变量，用于控制软件的各个方面（请参阅`hadoop-env.sh`和相关文件）。其中一些环境变量专用于帮助终端用户管理其运行时。

**HADOOP_CLIENT_OPTS**

此环境变量用于所有终端用户非守护进程操作。它可用于设置任何Java选项以及通过系统属性定义任何Apache Hadoop选项。例如：

```bash
HADOOP_CLIENT_OPTS="-Xmx1g -Dhadoop.socks.server=localhost:4000" hadoop fs -ls /tmp
```

将增加内存并通过SOCKS代理服务器发送此命令。

**注意：如果定义了`YARN_CLIENT_OPTS`，在使用`yarn`运行命令时，它将替换`HADOOP_CLIENT_OPTS`。**

**(command)_(subcommand)_OPTS**

还可以根据子命令设置每个子命令的选项。这允许为特定情况创建特殊选项。模式的第一部分是使用的命令，但全部大写。命令的第二部分是使用的子命令。然后在后面跟着字符串`_OPT`。

例如，要配置`mapred distcp`使用2GB堆，可以使用：

```bash
MAPRED_DISTCP_OPTS="-Xmx2g"
```

这些选项将在执行期间出现在`HADOOP_CLIENT_OPTS`之后，通常会优先生效。

**HADOOP_CLASSPATH**

**注意：应通过shellprofile条目配置全站点设置，应通过`${HOME}/.hadooprc`使用`hadoop_add_classpath`函数配置永久用户范围的设置。有关更多信息，请参见下面。**

Apache Hadoop脚本具有通过设置此环境变量将更多内容注入到运行命令的类路径中的功能。它应该是一个以冒号分隔的目录、文件或通配符位置的列表。

```bash
HADOOP_CLASSPATH=${HOME}/lib/myjars/*.jar hadoop classpath
```

用户可以通过`HADOOP_USER_CLASSPATH_FIRST`变量提供对路径位置的提示。将其设置为任何值将告诉系统尝试将这些路径推到前面。

**自动设置变量**

如果用户具有常见的设置，可以将它们放入`${HOME}/.hadoop-env`文件。该文件始终被读取以初始化和覆盖用户可能想要自定义的任何变量。它使用bash语法，类似于`.bashrc`文件：

例如：

```bash
#
# 我的自定义Apache Hadoop设置！
#

HADOOP_CLIENT_OPTS="-Xmx1g"
MAPRED_DISTCP_OPTS="-Xmx2g"
HADOOP_DISTCP_OPTS="-Xmx2g"
```

`.hadoop-env`文件还可以用于扩展功能并教导Apache Hadoop新技巧。例如，要运行访问由环境变量`${HADOOP_SERVER}`引用的服务器的hadoop命令，`.hadoop-env`中的以下内容将完成此操作：

```bash
if [[ -n ${HADOOP_SERVER} ]]; then
  HADOOP_CONF_DIR=/etc/hadoop.${HADOOP_SERVER}
fi
```

一个警告：并非所有Unix Shell API例程都可用或在`.hadoop-env`中正常工作。有关`.hadooprc`的更多信息，请参见下文。

# **管理员环境**

除了各种XML文件之外，管理员在使用Unix Shell时配置Apache Hadoop的两个关键功能：

1. 许多环境变量影响系统运行的方式。本指南仅突出显示一些关键变量。在各种`*-env.sh`文件中通常包含更多信息。
2. 对现有脚本进行一些平台特定的补充或更改。Apache Hadoop提供了功能覆盖的能力，以便可以在不进行全部工作的情况下更改现有代码库。替换功能将在后面的Shell API文档中进行介绍。

**(command)_(subcommand)_OPTS**

迄今为止，最重要的是一系列控制守护程序工作方式的_OPT变量。这些变量应该包含所有相关的守护程序设置。

与上面的用户命令类似，所有守护程序都将遵循`(command)_(subcommand)_OPTS`模式。通常建议在`hadoop-env.sh`中设置这些变量，以确保系统将在重新启动时知道应使用哪些设置。与面向用户的子命令不同，守护程序将不会遵循`HADOOP_CLIENT_OPTS`。

此外，以额外安全模式运行的守护程序还支持`(command)_(subcommand)_SECURE_EXTRA_OPTS`。这些选项是对通用`*_OPTS`的补充，因此通常会出现在其后，因此通常具有优先权。

**(command)_(subcommand)_USER**

Apache Hadoop提供了一种在每个子命令执行用户检查的方式。尽管可以轻松绕过此方法，并且不应将其视为安全功能，但它提供了一种通过该机制防止意外的方法。例如，设置`HDFS_NAMENODE_USER=hdfs`将使`hdfs namenode`和`hdfs --daemon start namenode`命令验证运行命令的用户是否是hdfs用户，通过检查`USER`环境变量。这也适用于非守护进程。设置`HADOOP_DISTCP_USER=jane`将验证在允许执行`hadoop distcp`命令之前`USER`是否设置为jane。

如果存在`_USER`环境变量，并且使用特权运行命令（例如，作为root；请参阅API文档中的`hadoop_privilege_check`），则将首先切换到指定的用户。对于支持出于安全原因切换用户帐户的命令，因此具有`SECURE_USER`变量的命令（见下文更多信息），基本`_USER`变量需要是预期用于切换到`SECURE_USER`帐户的用户。例如：

```bash
HDFS_DATANODE_USER=root
HDFS_DATANODE_SECURE_USER=hdfs
```

将强制`hdfs --daemon start datanode`为root，但在特权工作完成后最终将切换到hdfs用户。

请注意，如果使用`--workers`标志，则在调用ssh之后进行用户切换。然而，`sbin`中的多守护进程启动和停止命令在执行之前将进行切换（如果适用），因此将使用指定的`_USER`的键。

# **开发人员和高级管理员环境**

## **Shell配置文件**

Apache Hadoop允许第三方通过各种可插拔的接口轻松添加新功能。其中包括一个shell代码子系统，使得很容易将必要的内容注入基础安装中。

这一功能的核心是shell配置文件的概念。Shell配置文件是可注入的shell片段，可以执行添加JAR包到类路径、配置Java系统属性等操作。

Shell配置文件可以安装在`${HADOOP_CONF_DIR}/shellprofile.d`或`${HADOOP_HOME}/libexec/shellprofile.d`中。libexec目录中的Shell配置文件是基本安装的一部分，无法被用户覆盖。如果最终用户在运行时更改了配置目录，则可能会忽略配置目录中的Shell配置文件。

以下是libexec目录中一个Shell配置文件的示例。

## **Shell API**

Apache Hadoop的Shell代码具有一个函数库，供管理员和开发人员使用，以帮助其进行配置和高级功能管理。这些API遵循标准的Apache Hadoop接口分类，有一个附加的分类：Replaceable（可替代）。

Shell代码允许核心函数被替换。然而，并非所有函数都可以或者是安全替换的。如果函数不能安全替换，它将具有Replaceable属性：No。如果函数可以安全替换，它将具有Replaceable属性：Yes。

为了替换一个函数，创建一个名为`hadoop-user-functions.sh`的文件，放置在`${HADOOP_CONF_DIR}`目录中。只需在此文件中定义新的替代函数，系统将自动获取它。在此文件中可以有任意数量的替代函数。函数替代的示例在`hadoop-user-functions.sh.example`文件中。

标有Public和Stable的函数可以在Shell配置文件中原样使用。其他函数可能在次要版本中发生更改。

## **用户级API访问**

除了`.hadoop-env`允许单个用户覆盖`hadoop-env.sh`之外，用户还可以使用`.hadooprc`。这在配置Apache Hadoop shell环境后调用，允许进行完整的shell API函数调用。

例如：

```bash
hadoop_add_classpath /some/path/custom.jar
```

将被放入`.hadooprc`文件。

## **动态子命令**

利用Shell API，第三方可以将自己的子命令添加到主要的Hadoop shell脚本（hadoop、hdfs、mapred、yarn）中。

在执行子命令之前，主要的脚本将检查是否存在`(scriptname)_subcommand_(subcommand)`函数。此函数将以设置为所有剩余命令行参数的方式执行。例如，如果定义了以下函数：

```bash
function yarn_subcommand_hello
{
  echo "$@"
  exit $?
}
```

然后执行`yarn --debug hello world I see`将激活脚本调试并调用`yarn_subcommand_hello`函数，参数为：

```
world I see you
```

这将导致输出：

```
world I see you
```

还可以将新的子命令添加到用法输出中。`hadoop_add_subcommand`函数向用法输出添加文本。通过使用标准的`HADOOP_SHELL_EXECNAME`变量，我们可以限制哪个命令获取我们的新函数。

```bash
if [[ "${HADOOP_SHELL_EXECNAME}" = "yarn" ]]; then
  hadoop_add_subcommand "hello" client "Print some text to the screen"
fi
```

我们将子命令类型设置为“client”，因为没有特殊的限制、额外的功能等。此功能还可用于覆盖内置命令。例如，定义：

```bash
function hdfs_subcommand_fetchdt
{
  ...
}
```

将替换现有的`hdfs fetchdt`子命令为自定义命令。

一些用于动态子命令的关键环境变量：

- **HADOOP_CLASSNAME：**程序执行继续时要使用的Java类的名称。
  
- **HADOOP_PRIV_CLASSNAME：**当预计会以特权模式运行守护程序时要使用的Java类的名称（见下文）。
  
- **HADOOP_SHELL_EXECNAME：**正在执行的脚本的名称。它将是hadoop、hdfs、mapred或yarn中的一个。

- **HADOOP_SUBCMD：**传递到命令行的子命令。
  
- **HADOOP_SUBCMD_ARGS：**此数组包含在Apache Hadoop通用参数处理完成后的参数列表，是传递给子命令函数的相同列表。例如，如果在命令行上执行了`hadoop --debug subcmd 1 2 3`，那么`${HADOOP_SUBCMD_ARGS[0]}`将是1，并且`hadoop_subcommand_subcmd`也将使$1等于1。子命令函数可以通过修改此数组列表来添加或删除参数，以进行进一步的处理。

- **HADOOP_SECURE_CLASSNAME：**如果此子命令运行支持安全模式的服务，则应将此变量设置为安全版本的类名。

- **HADOOP_SUBCMD_SECURESERVICE：**将其设置为true将强制子命令以安全模式运行，而不考虑`hadoop_detect_priv_subcmd`。预期`HADOOP_SECURE_USER`将设置为将执行最终进程的用户。有关安全模式的更多信息请参见下文。

- **HADOOP_SUBCMD_SUPPORTDAEMONIZATION：**如果此命令可以作为守护程序执行，则设置为true。

- **HADOOP_USER_PARAMS：**这是命令行的完整内容，在进行任何解析之前。它将包含诸如`--debug`之类的标志。它**不能**被操作。

Apache Hadoop运行时设施要求如果不需要进一步处理，函数必须退出。

例如，在上面的hello示例中，不需要Java和其他设施，所以简单的`exit $?`就足够了。但是，如果函数要使用`HADOOP_CLASSNAME`，则必须继续执行程序，以便使用带有给定Java类的Apache Hadoop特定参数启动Java。另一个例子是在出现不可恢复的错误时。函数有责任打印适当的消息（最好使用`hadoop_error` API调用）并适当地退出。

## **以特权运行（安全模式）**

某些守护程序，如DataNode和NFS网关，可以在特权模式下运行。这意味着它们预计将以root身份启动，然后（默认情况下）通过jsvc切换到另一个用户ID。

这允许这些守护程序在正常执行期间捕获低特权端口，然后放弃超级用户权限。对于使用动态子命令的第三方，也可以使用特权运行。

如果以下条件为真：

- `(command)_(subcommand)_SECURE_USER`环境变量被定义并指向一个有效的用户名。
- `HADOOP_SECURE_CLASSNAME`被定义并指向一个有效的Java类。

那么脚本将尝试以特权运行类作为命令，就像它对内置命令所做的一样。

一般来说，用户预计会定义`_SECURE_USER`变量，而开发人员会在其脚本引导中定义`_CLASSNAME`。

# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/UnixShellGuide.html

* any list
{:toc}