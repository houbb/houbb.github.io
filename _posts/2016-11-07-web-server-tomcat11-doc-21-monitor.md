---
layout: post
title: web server apache tomcat11-21-monitor and management 监控与管理
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 前言

整理这个官方翻译的系列，原因是网上大部分的 tomcat 版本比较旧，此版本为 v11 最新的版本。

## 开源项目

> 从零手写实现 tomcat [minicat](https://github.com/houbb/minicat) 别称【嗅虎】心有猛虎，轻嗅蔷薇。

## 系列文章

[web server apache tomcat11-01-官方文档入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-01-intro)

[web server apache tomcat11-02-setup 启动](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-02-setup)

[web server apache tomcat11-03-deploy 如何部署](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-03-deploy)

[web server apache tomcat11-04-manager 如何管理？](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-04-manager)

[web server apache tomcat11-06-Host Manager App -- Text Interface](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-06-host-manager)

[web server apache tomcat11-07-Realm Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-07-relam)

[web server apache tomcat11-08-JNDI Resources](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-08-jndi)

[web server apache tomcat11-09-JNDI Datasource](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-09-jdbc-datasource)

[web server apache tomcat11-10-Class Loader](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-10-classloader-howto)

...



# 简介

监控是系统管理的关键方面。查看运行中的服务器，获取一些统计信息或重新配置应用程序的某些方面都是日常管理任务。

## 启用 JMX 远程
注意：只有在您要远程监视 Tomcat 时才需要此配置。如果您打算使用与 Tomcat 运行的相同用户在本地监视它，则不需要此配置。

Oracle 网站包含了有关选项列表以及如何在 Java 11 上配置 JMX 远程的信息：[Java 11 JMX 远程配置](http://docs.oracle.com/javase/6/docs/technotes/guides/management/agent.html)。

以下是 Java 11 的快速配置指南：

在 Tomcat 的 setenv.bat 脚本中添加以下参数（有关详细信息，请参阅 RUNNING.txt）。
注意：此语法适用于 Microsoft Windows。命令必须在同一行上。它被包装以增加可读性。如果 Tomcat 作为 Windows 服务运行，请使用其配置对话框为服务设置 Java 选项。对于 Linux、MacOS 等，请从行的开头删除 "set "。

```
set CATALINA_OPTS=-Dcom.sun.management.jmxremote.port=%my.jmx.port%
  -Dcom.sun.management.jmxremote.rmi.port=%my.rmi.port%
  -Dcom.sun.management.jmxremote.ssl=false
  -Dcom.sun.management.jmxremote.authenticate=false
```

如果不设置 com.sun.management.jmxremote.rmi.port，则 JSR 160 JMX-Adaptor 将随机选择一个端口，这将使得配置防火墙以允许访问变得困难。

如果需要 TLS：

更改并添加以下内容：
```
  -Dcom.sun.management.jmxremote.ssl=true
  -Dcom.sun.management.jmxremote.registry.ssl=true
```
要配置协议和/或密码套件，请使用：
```
  -Dcom.sun.management.jmxremote.ssl.enabled.protocols=%my.jmx.ssl.protocols%
  -Dcom.sun.management.jmxremote.ssl.enabled.cipher.suites=%my.jmx.cipher.suites%
```
对于客户端证书身份验证，请使用：
```
  -Dcom.sun.management.jmxremote.ssl.need.client.auth=%my.jmx.ssl.clientauth%
```

如果需要授权（强烈建议始终使用身份验证的 TLS）：

更改并添加以下内容：
```
  -Dcom.sun.management.jmxremote.authenticate=true
  -Dcom.sun.management.jmxremote.password.file=../conf/jmxremote.password
  -Dcom.sun.management.jmxremote.access.file=../conf/jmxremote.access
```
编辑访问授权文件 $CATALINA_BASE/conf/jmxremote.access：
```
monitorRole readonly
controlRole readwrite
```
编辑密码文件 $CATALINA_BASE/conf/jmxremote.password：
```
monitorRole tomcat
controlRole tomcat
```
提示：密码文件应该是只读的，并且只能被 Tomcat 运行的操作系统用户访问。

或者，您可以使用以下配置 JAAS 登录模块：
```
  -Dcom.sun.management.jmxremote.login.config=%login.module.name%
```

如果需要指定用于发送到客户端的 RMI 存根的主机名（例如，因为必须使用的公共主机名与本地主机名不同），则可以设置：

```
set CATALINA_OPTS=-Djava.rmi.server.hostname
```

如果需要为 JMX 服务绑定到的特定接口，请设置：

```
set CATALINA_OPTS=-Dcom.sun.management.jmxremote.host
```

# 使用 JMX 远程 Ant 任务管理 Tomcat

为了简化 Ant 中的 JMX 使用，提供了一组可用于 antlib 的任务。

antlib：将 catalina-ant.jar 从 $CATALINA_HOME/lib 复制到 $ANT_HOME/lib。

以下示例显示了 JMX Accessor 的用法：

注意：这里对 name 属性值进行了包装以增加可读性。它必须全部在同一行上，没有空格。

```xml
<project name="Catalina Ant JMX"
      xmlns:jmx="antlib:org.apache.catalina.ant.jmx"
      default="state"
      basedir=".">
  <property name="jmx.server.name" value="localhost" />
  <property name="jmx.server.port" value="9012" />
  <property name="cluster.server.address" value="192.168.1.75" />
  <property name="cluster.server.port" value="9025" />

  <target name="state" description="Show JMX Cluster state">
    <jmx:open
      host="${jmx.server.name}"
      port="${jmx.server.port}"
      username="controlRole"
      password="tomcat"/>
    <jmx:get
      name=
"Catalina:type=IDataSender,host=localhost,
senderAddress=${cluster.server.address},senderPort=${cluster.server.port}"
      attribute="connected"
      resultproperty="IDataSender.backup.connected"
      echo="false"
    />
    <jmx:get
      name="Catalina:type=ClusterSender,host=localhost"
      attribute="senderObjectNames"
      resultproperty="senderObjectNames"
      echo="false"
    />
    <!-- get current maxActiveSession from ClusterTest application
       echo it to Ant output and store at
       property <em>clustertest.maxActiveSessions.original</em>
    -->
    <jmx:get
      name="Catalina:type=Manager,context=/ClusterTest,host=localhost"
      attribute="maxActiveSessions"
      resultproperty="clustertest.maxActiveSessions.original"
      echo="true"
    />
    <!-- set maxActiveSession to 100
    -->
    <jmx:set
      name="Catalina:type=Manager,context=/ClusterTest,host=localhost"
      attribute="maxActiveSessions"
      value="100"
      type="int"
    />
    <!-- get all sessions and split result as delimiter <em>SPACE</em> for easy
       access all session ids directly with Ant property sessions.[0..n].
    -->
    <jmx:invoke
      name="Catalina:type=Manager,context=/ClusterTest,host=localhost"
      operation="listSessionIds"
      resultproperty="sessions"
      echo="false"
      delimiter=" "
    />
    <!-- Access session attribute <em>Hello</em> from first session.
    -->
    <jmx:invoke
      name="Catalina:type=Manager,context=/ClusterTest,host=localhost"
      operation="getSessionAttribute"
      resultproperty="Hello"
      echo="false"
    >
      <arg value="${sessions.0}"/>
      <arg value="Hello"/>
    </jmx:invoke>
    <!-- Query for all application manager.of the server from all hosts
       and bind all attributes from all found manager MBeans.
    -->
    <jmx:query
      name="Catalina:type=Manager,*"
      resultproperty="manager"
      echo="true"
      attributebinding="true"
    />
    <!-- echo the create properties -->
<echo>
senderObjectNames: ${senderObjectNames.0}
IDataSender.backup.connected: ${IDataSender.backup.connected}
session: ${sessions.0}
manager.length: ${manager.length}
manager.0.name: ${manager.0.name}
manager.1.name: ${manager.1.name}
hello: ${Hello}
manager.ClusterTest.0.name: ${manager.ClusterTest.0.name}
manager.ClusterTest.0.activeSessions: ${manager.ClusterTest.0.activeSessions}
manager.ClusterTest.0.counterSend_EVT_SESSION_EXPIRED:
 ${manager.ClusterTest.0.counterSend_EVT_SESSION_EXPIRED}
manager.ClusterTest.0.counterSend_EVT_GET_ALL_SESSIONS:
 ${manager.ClusterTest.0.counterSend_EVT_GET_ALL_SESSIONS}
</echo>

  </target>

</project>
```

# JMXAccessorOpenTask - JMX open connection task

List of Attributes

### JMX 连接属性说明

| 属性     | 描述                                                   | 默认值                                                       |
|----------|--------------------------------------------------------|--------------------------------------------------------------|
| url      | 设置 JMX 连接 URL，格式为：`service:jmx:rmi:///jndi/rmi://localhost:8050/jmxrmi` | -                                                          |
| host     | 设置主机名，可简化较长的 URL 语法。                    | localhost                                                    |
| port     | 设置远程连接端口。                                     | 8050                                                         |
| username | 远程 JMX 连接用户名。                                  | -                                                            |
| password | 远程 JMX 连接密码。                                    | -                                                            |
| ref      | 内部连接引用的名称。使用此属性，您可以在同一个 Ant 项目中配置多个连接。   | jmx.server                                                   |
| echo     | 显示命令的用法（用于访问分析或调试）。                | false                                                        |
| if       | 仅在当前项目中存在给定名称的属性时执行。               | -                                                            |
| unless   | 仅在当前项目中不存在给定名称的属性时执行。             | -                                                            |

### 打开新的 JMX 连接示例

```xml
<jmx:open
  host="${jmx.server.name}"
  port="${jmx.server.port}"
/>
```

### 从 URL 打开 JMX 连接示例，包含授权，并存储到其他引用

```xml
<jmx:open
  url="service:jmx:rmi:///jndi/rmi://localhost:9024/jmxrmi"
  ref="jmx.server.9024"
  username="controlRole"
  password="tomcat"
/>
```

### 从 URL 打开 JMX 连接示例，包含授权，并存储到其他引用，但仅当属性 jmx.if 存在且 jmx.unless 不存在时执行

```xml
<jmx:open
  url="service:jmx:rmi:///jndi/rmi://localhost:9024/jmxrmi"
  ref="jmx.server.9024"
  username="controlRole"
  password="tomcat"
  if="jmx.if"
  unless="jmx.unless"
/>
```

**注意：** jmxOpen 任务的所有属性也存在于所有其他任务和条件中。

### JMXAccessorGetTask：获取属性值 Ant 任务

#### 属性列表

| 属性                  | 描述                                 | 默认值     |
|-----------------------|--------------------------------------|------------|
| name                  | 完全限定的 JMX ObjectName            | Catalina:type=Server |
| attribute             | 存在的 MBean 属性                     |            |
| ref                   | JMX 连接引用                          | jmx.server |
| echo                  | 显示命令用法（访问和结果）           | false      |
| resultproperty        | 将结果保存在此项目属性中             |            |
| delimiter             | 使用分隔符（java.util.StringTokenizer）分割结果，并使用 resultproperty 作为前缀存储标记 |            |
| separatearrayresults | 当返回值是数组时，将结果保存为属性列表（$resultproperty.[0..N] 和 $resultproperty.length） | true       |

#### 获取默认 JMX 连接的远程 MBean 属性示例

```xml
<jmx:get
  name="Catalina:type=Manager,context=/servlets-examples,host=localhost"
  attribute="maxActiveSessions"
  resultproperty="servlets-examples.maxActiveSessions"
/>
```

#### 获取并将结果数组分割为单独的属性示例

```xml
<jmx:get
    name="Catalina:type=ClusterSender,host=localhost"
    attribute="senderObjectNames"
    resultproperty="senderObjectNames"
/>
```

使用以下方式访问 senderObjectNames 属性：

`${senderObjectNames.length}` 给出返回的发送者列表的数量。

`${senderObjectNames.[0..N]}` 找到所有发送者对象名称。

#### 仅在集群配置时获取 IDataSender 属性的示例

**注意：** 这里包装了 name 属性值以使其更易读。它必须全部在同一行上，没有空格。

```xml
<jmx:query
  failonerror="false"
  name="Catalina:type=Cluster,host=${tomcat.application.host}"
  resultproperty="cluster"
/>
<jmx:get
  name="Catalina:type=IDataSender,host=${tomcat.application.host},senderAddress=${cluster.backup.address},senderPort=${cluster.backup.port}"
  attribute="connected"
  resultproperty="datasender.connected"
  if="cluster.0.name"
/>
```


### JMXAccessorSetTask：设置属性值 Ant 任务

#### 属性列表

| 属性                  | 描述                                 | 默认值     |
|-----------------------|--------------------------------------|------------|
| name                  | 完全限定的 JMX ObjectName            | Catalina:type=Server |
| attribute             | 存在的 MBean 属性                     |            |
| value                 | 设置给属性的值                       |            |
| type                  | 属性的类型                           | java.lang.String |
| ref                   | JMX 连接引用                          | jmx.server |
| echo                  | 显示命令用法（访问和结果）           | false      |

#### 设置远程 MBean 属性值的示例

```xml
<jmx:set
  name="Catalina:type=Manager,context=/servlets-examples,host=localhost"
  attribute="maxActiveSessions"
  value="500"
  type="int"
/>
```

### JMXAccessorInvokeTask：调用 MBean 操作 Ant 任务

#### 属性列表

| 属性                  | 描述                                 | 默认值     |
|-----------------------|--------------------------------------|------------|
| name                  | 完全限定的 JMX ObjectName            | Catalina:type=Server |
| operation             | 存在的 MBean 操作                     |            |
| ref                   | JMX 连接引用                          | jmx.server |
| echo                  | 显示命令用法（访问和结果）           | false      |
| resultproperty        | 将结果保存在此项目属性中             |            |
| delimiter             | 使用分隔符（java.util.StringTokenizer）分割结果，并使用 resultproperty 作为前缀存储标记 |            |
| separatearrayresults | 当返回值是数组时，将结果保存为属性列表（$resultproperty.[0..N] 和 $resultproperty.length） | true       |

#### 停止应用程序的示例

```xml
<jmx:invoke
  name="Catalina:type=Manager,context=/servlets-examples,host=localhost"
  operation="stop"
/>
```

现在您可以在 ${sessions.[0..N} 属性中找到 sessionid，并通过 ${sessions.length} 属性访问计数。

#### 获取所有 sessionids 的示例

```xml
<jmx:invoke
  name="Catalina:type=Manager,context=/servlets-examples,host=localhost"
  operation="listSessionIds"
  resultproperty="sessions"
  delimiter=" "
/>
```

现在您可以在 ${sessions.[0..N} 属性中找到 sessionid，并通过 ${sessions.length} 属性访问计数。

#### 从 session ${sessionid.0} 获取远程 MBean session 属性的示例

```xml
<jmx:invoke
    name="Catalina:type=Manager,context=/ClusterTest,host=localhost"
    operation="getSessionAttribute"
    resultproperty="hello">
     <arg value="${sessionid.0}"/>
     <arg value="Hello" />
</jmx:invoke>
```

### JMXAccessorQueryTask：查询 MBean Ant 任务

#### 属性列表

| 属性                     | 描述                                               | 默认值       |
|--------------------------|----------------------------------------------------|--------------|
| name                     | JMX ObjectName 查询字符串                          | Catalina:type=Manager,* |
| ref                      | JMX 连接引用                                       | jmx.server   |
| echo                     | 显示命令用法（访问和结果）                        | false        |
| resultproperty           | 将所有找到的 MBeans 前缀项目属性名称              |              |
| attributebinding         | 绑定所有 MBean 属性，除了名称                     | false        |
| delimiter                | 使用分隔符（java.util.StringTokenizer）分割结果，并使用 resultproperty 作为前缀存储标记 |            |
| separatearrayresults     | 当返回值是数组时，将结果保存为属性列表（$resultproperty.[0..N] 和 $resultproperty.length） | true         |

#### 获取所有服务和主机的 Manager ObjectNames

```xml
<jmx:query
  name="Catalina:type=Manager,*"
  resultproperty="manager" />
```

现在您可以在 ${manager.[0..N].name} 属性中找到 Session Manager，并通过 ${manager.length} 属性访问结果对象计数。

#### 从 servlet-examples 应用程序获取 Manager 并绑定所有 MBean 属性的示例

```xml
<jmx:query
  name="Catalina:type=Manager,context=/servlet-examples,host=localhost*"
  attributebinding="true"
  resultproperty="manager.servletExamples" />
```

现在您可以在 ${manager.servletExamples.0.name} 属性中找到 manager，并且可以使用 ${manager.servletExamples.0.[manager 属性名称]} 访问此 manager 的所有属性。来自 MBeans 的结果对象计数存储在 ${manager.length} 属性中。

#### 获取服务器中的所有 MBeans 并存储在外部 XML 属性文件中的示例

```xml
<project name="jmx.query"
            xmlns:jmx="antlib:org.apache.catalina.ant.jmx"
            default="query-all" basedir=".">
<property name="jmx.host" value="localhost"/>
<property name="jmx.port" value="8050"/>
<property name="jmx.username" value="controlRole"/>
<property name="jmx.password" value="tomcat"/>

<target name="query-all" description="Query all MBeans of a server">
  <!-- Configure connection -->
  <jmx:open
    host="${jmx.host}"
    port="${jmx.port}"
    ref="jmx.server"
    username="${jmx.username}"
    password="${jmx.password}"/>

  <!-- Query MBean list -->
  <jmx:query
    name="*:*"
    resultproperty="mbeans"
    attributebinding="false"/>

  <echoproperties
    destfile="mbeans.properties"
    prefix="mbeans."
    format="xml"/>

  <!-- Print results -->
  <echo message=
    "Number of MBeans in server ${jmx.host}:${jmx.port} is ${mbeans.length}"/>
</target>
</project>
```

### JMXAccessorCreateTask：远程创建 MBean Ant 任务

#### 属性列表

| 属性                  | 描述                                                    | 默认值       |
|-----------------------|---------------------------------------------------------|--------------|
| name                  | 完全限定的 JMX ObjectName                               | Catalina:type=MBeanFactory |
| className             | 存在的 MBean 完全限定类名（参见上面的 Tomcat MBean 描述）|              |
| classLoader           | 服务器或 Web 应用程序类加载器的 ObjectName（Catalina:type=ServerClassLoader,name=[server,common,shared] 或 Catalina:type=WebappClassLoader,context=/myapps,host=localhost） |              |
| ref                   | JMX 连接引用                                             | jmx.server   |
| echo                  | 显示命令用法（访问和结果）                              | false        |

#### 创建远程 MBean 的示例

```xml
<jmx:create
  ref="${jmx.reference}"
  name="Catalina:type=MBeanFactory"
  className="org.apache.commons.modeler.BaseModelMBean"
  classLoader="Catalina:type=ServerClassLoader,name=server">
  <arg value="org.apache.catalina.mbeans.MBeanFactory" />
</jmx:create>
```

**警告：** 许多 Tomcat MBeans 在创建后无法与其父级关联。

阀门、集群和域 MBeans 不会自动与其父级连接。

请改用 MBeanFactory 创建操作。

### JMXAccessorUnregisterTask：远程注销 MBean Ant 任务

#### 属性列表

| 属性                  | 描述                                               | 默认值       |
|-----------------------|----------------------------------------------------|--------------|
| name                  | 完全限定的 JMX ObjectName                          | Catalina:type=MBeanFactory |
| ref                   | JMX 连接引用                                       | jmx.server   |
| echo                  | 显示命令用法（访问和结果）                        | false        |

#### 注销远程 MBean 的示例

```xml
<jmx:unregister
  name="Catalina:type=MBeanFactory"
/>
```

**警告：** 很多 Tomcat MBeans 无法注销。这些 MBeans 未与其父级解除链接。请改用 MBeanFactory 删除操作。

### JMXAccessorCondition：表达式条件

#### 属性列表

| 属性                  | 描述                                                      | 默认值       |
|-----------------------|-----------------------------------------------------------|--------------|
| url                   | 设置 JMX 连接 URL，格式为：`service:jmx:rmi:///jndi/rmi://localhost:8050/jmxrmi` | -       |
| host                  | 设置主机名，可简化较长的 URL 语法。                         | localhost    |
| port                  | 设置远程连接端口。                                        | 8050         |
| username              | 远程 JMX 连接用户名。                                     |              |
| password              | 远程 JMX 连接密码。                                       |              |
| ref                   | 内部连接引用的名称。使用此属性，您可以在同一个 Ant 项目中配置多个连接。| jmx.server |
| name                  | 完全限定的 JMX ObjectName                                |              |
| echo                  | 显示条件用法（访问和结果）                              | false        |
| if                    | 仅在当前项目中存在给定名称的属性时执行。                  |              |
| unless                | 仅在当前项目中不存在给定名称的属性时执行。                |              |
| value (required)      | 操作的第二个参数。                                       |              |
| type                  | 表达操作的值类型（支持 long 和 double）                  | long         |
| operation             | 表达一个操作                                             |              |
| ==                    | 等于                                                     |              |
| !=                    | 不等于                                                   |              |
| >                     | 大于                                                     |              |
| >=                    | 大于或等于                                               |              |
| <                     | 小于                                                     |              |
| <=                    | 小于或等于                                               |              |

#### 等待服务器连接并检查集群备份节点是否可访问的示例

```xml
<target name="wait">
  <waitfor maxwait="${maxwait}" maxwaitunit="second" timeoutproperty="server.timeout" >
    <and>
      <socket server="${server.name}" port="${server.port}"/>
      <http url="${url}"/>
      <jmx:condition
        operation="=="
        host="localhost"
        port="9014"
        username="controlRole"
        password="tomcat"
        name=
"Catalina:type=IDataSender,host=localhost,senderAddress=192.168.111.1,senderPort=9025"
        attribute="connected"
        value="true"
      />
    </and>
  </waitfor>
  <fail if="server.timeout" message="Server ${url} don't answer inside ${maxwait} sec" />
  <echo message="Server ${url} alive" />
</target>
```

### JMXAccessorEqualsCondition：MBean 相等 Ant 条件

#### 属性列表

| 属性                  | 描述                                                      | 默认值       |
|-----------------------|-----------------------------------------------------------|--------------|
| url                   | 设置 JMX 连接 URL，格式为：`service:jmx:rmi:///jndi/rmi://localhost:8050/jmxrmi` | -       |
| host                  | 设置主机名，可简化较长的 URL 语法。                         | localhost    |
| port                  | 设置远程连接端口。                                        | 8050         |
| username              | 远程 JMX 连接用户名。                                     |              |
| password              | 远程 JMX 连接密码。                                       |              |
| ref                   | 内部连接引用的名称。使用此属性，您可以在同一个 Ant 项目中配置多个连接。| jmx.server |
| name                  | 完全限定的 JMX ObjectName                                |              |
| echo                  | 显示条件用法（访问和结果）                              | false        |

#### 等待服务器连接并检查集群备份节点是否可访问的示例

```xml
<target name="wait">
  <waitfor maxwait="${maxwait}" maxwaitunit="second" timeoutproperty="server.timeout" >
    <and>
      <socket server="${server.name}" port="${server.port}"/>
      <http url="${url}"/>
      <jmx:equals
        host="localhost"
        port="9014"
        username="controlRole"
        password="tomcat"
        name=
"Catalina:type=IDataSender,host=localhost,senderAddress=192.168.111.1,senderPort=9025"
        attribute="connected"
        value="true"
      />
    </and>
  </waitfor>
  <fail if="server.timeout" message="Server ${url} don't answer inside ${maxwait} sec" />
  <echo message="Server ${url} alive" />
</target>
```

### 使用 JMXProxyServlet

Tomcat 提供了一种替代方案，可以在不使用远程（甚至本地）JMX连接的情况下，仍然让您访问 JMX 的所有功能：Tomcat 的 JMXProxyServlet。

JMXProxyServlet 允许客户端通过 HTTP 接口发出 JMX 查询。与直接从客户端程序使用 JMX 相比，这种技术具有以下优势：

- 您无需启动完整的 JVM 并建立远程 JMX 连接，只需从正在运行的服务器请求一个小数据片段即可。
- 您无需了解如何使用 JMX 连接。
- 您不需要进行本页其余部分所涵盖的复杂配置。
- 您的客户端程序不必使用 Java 编写。

一个完美的 JMX 过度使用案例可以在流行的服务器监控软件（如 Nagios 或 Icinga）中看到：如果您想通过 JMX 监视 10 个项目，您将不得不启动 10 个 JVM，建立 10 个 JMX 连接，然后每隔几分钟关闭它们。使用 JMXProxyServlet，您只需建立 10 个 HTTP 连接即可完成。

您可以在 Tomcat 管理器的文档中找到有关 JMXProxyServlet 的更多信息。

# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/monitoring.html

* any list
{:toc}