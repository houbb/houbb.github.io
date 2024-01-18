---
layout: post
title:  Apache Hadoop v3.3.6 in action-01-HDFS 部署完成后 java 程序如何访问验证
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# 单机版本配置

## 配置文件 core-site.xml


```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <!-- 指定NameNode的地址,端口一般有8020、9000、9820 -->
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://127.0.0.1:9820</value>
    </property>
    <!-- 指定Hadoop临时数据的存储目录 -->
    <property>
        <name>hadoop.tmp.dir</name>
        <value>/home/houbinbin/hadoop/dfs/temp</value>
    </property>
    <!-- 设置HDFS网页登录使用的静态用户为root -->
    <property>
        <name>hadoop.http.staticuser.user</name>
        <value>root</value>
    </property>
</configuration>
```

## hdfs-site.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>

<configuration>
	<!-- 设置NameNode Web端访问地址 -->
	<property>
		<name>dfs.namenode.http-address</name>
		<value>127.0.0.1:9870</value>
	</property>

	<!-- 配置NameNode 元数据存放位置-->
	<property>
		<name>dfs.namenode.name.dir</name>
		<value>/home/houbinbin/hadoop/dfs/name</value>
	</property>

	<!-- 配置DataNode在本地磁盘存放block的位置-->
	<property>
		<name>dfs.datanode.data.dir</name>
		<value>/home/houbinbin/hadoop/dfs/data</value>
	</property>

	<!-- 配置数据块的副本数,配置默认是3,应小于DataNode机器数量-->
	<property>
		<name>dfs.replication</name>
		<value>1</value>
	</property>
</configuration>
```

# java 程序

## maven 引入

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-client</artifactId>
        <version>3.3.6</version> <!-- 版本号根据你的Hadoop版本调整 -->
    </dependency>
</dependencies>
```

v3.3.6 和服务端保持一致。

## 入门代码

```java
package org.example;


import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.Path;

import java.net.URI;

public class HDFSDemo {

    public static void main(String[] args) {
        try {
            final String testFile = "D:\\github\\hdfs-learn\\src\\main\\resources\\1.txt";

            // 设置Hadoop集群的NameNode地址
            Configuration conf = new Configuration();
            //通过这种方式设置java客户端身份
            FileSystem fs = FileSystem.get(new URI("hdfs://127.0.0.1:9820"),conf,"houbinbin");

            // 在HDFS上创建目录
            Path dirPath = new Path("/home/houbinbin/hadoop/dfs/data/test");
            fs.mkdirs(dirPath);
            System.out.println("Directory created: " + dirPath);

            // 上传本地文件到HDFS
            Path localFilePath = new Path(testFile);

            Path hdfsFilePath = new Path("/home/houbinbin/hadoop/dfs/data/test/file.txt");
            fs.copyFromLocalFile(localFilePath, hdfsFilePath);
            System.out.println("File uploaded to HDFS: " + hdfsFilePath);

            // 读取HDFS上的文件
            Path readFile = new Path("/home/houbinbin/hadoop/dfs/data/test/file.txt");
            // 这里假设文件是文本文件，如果是其他格式，使用适当的API进行读取
            try (FSDataInputStream inputStream = fs.open(readFile)) {
                byte[] buffer = new byte[1024];
                int bytesRead = inputStream.read(buffer);
                while (bytesRead > 0) {
                    System.out.write(buffer, 0, bytesRead);
                    bytesRead = inputStream.read(buffer);
                }
            }

            // 关闭HDFS连接
            fs.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
```

## 报错

```
Caused by: org.apache.hadoop.ipc.RemoteException(org.apache.hadoop.security.AccessControlException): Permission denied: user=Administrator, access=WRITE, inode="/":houbinbin:supergroup:drwxr-xr-x
	at org.apache.hadoop.hdfs.server.namenode.FSPermissionChecker.check(FSPermissionChecker.java:506)
	at org.apache.hadoop.hdfs.server.namenode.FSPermissionChecker.checkPermission(FSPermissionChecker.java:346)
	at org.apache.hadoop.hdfs.server.namenode.FSPermissionChecker.checkPermissionWithContext(FSPermissionChecker.java:370)
	at org.apache.hadoop.hdfs.server.namenode.FSPermissionChecker.checkPermission(FSPermissionChecker.java:240)
	at org.apache.hadoop.hdfs.server.namenode.FSDirectory.checkPermission(FSDirectory.java:1943)
	at org.apache.hadoop.hdfs.server.namenode.FSDirectory.checkPermission(FSDirectory.java:1927)
	at org.apache.hadoop.hdfs.server.namenode.FSDirectory.checkAncestorAccess(FSDirectory.java:1886)
	at org.apache.hadoop.hdfs.server.namenode.FSDirMkdirOp.mkdirs(FSDirMkdirOp.java:60)
	at org.apache.hadoop.hdfs.server.namenode.FSNamesystem.mkdirs(FSNamesystem.java:3441)
	at org.apache.hadoop.hdfs.server.namenode.NameNodeRpcServer.mkdirs(NameNodeRpcServer.java:1167)
	at org.apache.hadoop.hdfs.protocolPB.ClientNamenodeProtocolServerSideTranslatorPB.mkdirs(ClientNamenodeProtocolServerSideTranslatorPB.java:742)
	at org.apache.hadoop.hdfs.protocol.proto.ClientNamenodeProtocolProtos$ClientNamenodeProtocol$2.callBlockingMethod(ClientNamenodeProtocolProtos.java)
	at org.apache.hadoop.ipc.ProtobufRpcEngine2$Server$ProtoBufRpcInvoker.call(ProtobufRpcEngine2.java:621)
	at org.apache.hadoop.ipc.ProtobufRpcEngine2$Server$ProtoBufRpcInvoker.call(ProtobufRpcEngine2.java:589)
	at org.apache.hadoop.ipc.ProtobufRpcEngine2$Server$ProtoBufRpcInvoker.call(ProtobufRpcEngine2.java:573)
	at org.apache.hadoop.ipc.RPC$Server.call(RPC.java:1227)
	at org.apache.hadoop.ipc.Server$RpcCall.run(Server.java:1094)
	at org.apache.hadoop.ipc.Server$RpcCall.run(Server.java:1017)
	at java.security.AccessController.doPrivileged(Native Method)
	at javax.security.auth.Subject.doAs(Subject.java:422)
	at org.apache.hadoop.security.UserGroupInformation.doAs(UserGroupInformation.java:1899)
	at org.apache.hadoop.ipc.Server$Handler.run(Server.java:3048)

	at org.apache.hadoop.ipc.Client.getRpcResponse(Client.java:1567)
	at org.apache.hadoop.ipc.Client.call(Client.java:1513)
	at org.apache.hadoop.ipc.Client.call(Client.java:1410)
	at org.apache.hadoop.ipc.ProtobufRpcEngine2$Invoker.invoke(ProtobufRpcEngine2.java:258)
	at org.apache.hadoop.ipc.ProtobufRpcEngine2$Invoker.invoke(ProtobufRpcEngine2.java:139)
	at com.sun.proxy.$Proxy9.mkdirs(Unknown Source)
	at org.apache.hadoop.hdfs.protocolPB.ClientNamenodeProtocolTranslatorPB.mkdirs(ClientNamenodeProtocolTranslatorPB.java:675)
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
	at java.lang.reflect.Method.invoke(Method.java:498)
	at org.apache.hadoop.io.retry.RetryInvocationHandler.invokeMethod(RetryInvocationHandler.java:433)
	at org.apache.hadoop.io.retry.RetryInvocationHandler$Call.invokeMethod(RetryInvocationHandler.java:166)
	at org.apache.hadoop.io.retry.RetryInvocationHandler$Call.invoke(RetryInvocationHandler.java:158)
	at org.apache.hadoop.io.retry.RetryInvocationHandler$Call.invokeOnce(RetryInvocationHandler.java:96)
	at org.apache.hadoop.io.retry.RetryInvocationHandler.invoke(RetryInvocationHandler.java:362)
	at com.sun.proxy.$Proxy10.mkdirs(Unknown Source)
	at org.apache.hadoop.hdfs.DFSClient.primitiveMkdir(DFSClient.java:2507)
	... 8 more
```

### 解决方式


1） 设置目录权限：

```bash
#执行命令 （后边的路径为,你实际安装Hadoop的路径）
chmod -R 777 /home/houbinbin/hadoop/dfs
```

尝试没效果。

2) 关闭 hdfs 的权限

conf/hdfs-site.xml

```xml
<property>
  <name>dfs.permissions</name>
  <value>false</value>
</property>
```

感觉不太安全。

3) 实际测试有效

```java
FileSystem fs = FileSystem.get(new URI("hdfs://127.0.0.1:9820"),conf,"houbinbin");
```

这里指定了用户，和我们 HDFS 中的一样，则可以。

也可以这样写：

```java
 Configuration conf = new Configuration();

//这里指定使用的是 hdfs文件系统
conf.set("fs.defaultFS", "hdfs://127.0.0.1:9820");

//通过这种方式设置java客户端身份
System.setProperty("HADOOP_USER_NAME", "houbinbin");
FileSystem fs = FileSystem.get(conf);
//或者使用下面的方式设置客户端身份
//FileSystem fs = FileSystem.get(new URI("hdfs://127.0.0.1:9820"),conf,"houbinbin");
```

# 文件去哪里了？

上传完之后，我在 WSL 服务器上并没有找到这个文件。

```
$ cd /home/houbinbin/hadoop/dfs/data/test/
-bash: cd: /home/houbinbin/hadoop/dfs/data/test/: No such file or directory
```

你可以在 HDFS 服务上，使用命令：

```
$ hdfs dfs -ls /home/houbinbin/hadoop/dfs/data/test
Found 1 items
-rw-r--r--   3 houbinbin supergroup         10 2024-01-19 00:40 /home/houbinbin/hadoop/dfs/data/test/file.txt
```

可以看到这个文件。


# 参考资料

[Hadoop3.3.3单机版搭建](https://blog.csdn.net/qq_44896640/article/details/125504968)

https://stackoverflow.com/questions/11593374/permission-denied-at-hdfs

* any list
{:toc}