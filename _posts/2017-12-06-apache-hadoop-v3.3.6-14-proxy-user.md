---
layout: post
title:  Apache Hadoop v3.3.6-14-Proxy user - Superusers Acting On Behalf Of Other Users
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# 介绍

本文档描述了超级用户如何代表另一个用户提交作业或访问HDFS。

## 用例

下一节中描述的代码示例适用于以下用例。

一个名为'super'的超级用户想要代表用户joe提交作业并访问hdfs。超级用户具有Kerberos凭据，但用户joe没有。

任务需要以用户joe的身份运行，并且需要在Namenode上以用户joe的身份执行任何文件访问。

需要用户joe能够连接到使用超级Kerberos凭据进行身份验证的Namenode或JobTracker。

换句话说，超级用户正在代表用户joe进行身份验证。

一些产品，如Apache Oozie，需要这样做。

## 代码示例

在这个例子中，超级用户的凭证用于登录，并为joe创建了代理用户UGI对象。

在这个代理用户UGI对象的doAs方法中执行操作。

```java
...
// 为joe创建UGI。登录用户是'super'。
UserGroupInformation ugi =
        UserGroupInformation.createProxyUser("joe", UserGroupInformation.getLoginUser());
ugi.doAs(new PrivilegedExceptionAction<Void>() {
  public Void run() throws Exception {
    // 提交作业
    JobClient jc = new JobClient(conf);
    jc.submitJob(conf);
    // 或者访问hdfs
    FileSystem fs = FileSystem.get(conf);
    fs.mkdir(someFilePath);
  }
}
```

## 配置

您可以使用属性`hadoop.proxyuser.$superuser.hosts`，以及`hadoop.proxyuser.$superuser.groups`和/或`hadoop.proxyuser.$superuser.users`中的一个或两个配置代理用户。

通过在core-site.xml中指定如下，名为super的超级用户只能从host1和host2连接，以模拟属于group1和group2的用户。

```xml
<property>
  <name>hadoop.proxyuser.super.hosts</name>
  <value>host1,host2</value>
</property>
<property>
  <name>hadoop.proxyuser.super.groups</name>
  <value>group1,group2</value>
</property>
```

如果不存在这些配置，则将不允许模拟，并且连接将失败。

如果更宽松的安全性更可取，则可以使用通配符值`*`，以允许从任何主机模拟任何用户。

例如，在core-site.xml中指定如下，名为oozie的用户可以从任何主机访问，可以模拟任何属于任何组的用户。

```xml
<property>
  <name>hadoop.proxyuser.oozie.hosts</name>
  <value>*</value>
</property>
<property>
  <name>hadoop.proxyuser.oozie.groups</name>
  <value>*</value>
</property>
```

`hadoop.proxyuser.$superuser.hosts`接受IP地址列表、CIDR格式的IP地址范围和/或主机名。

例如，通过如下指定，名为super的用户可以从位于10.222.0.0-10.222.255.255和10.113.221.221范围内的主机访问，可以模拟user1和user2。

```xml
<property>
  <name>hadoop.proxyuser.super.hosts</name>
  <value>10.222.0.0/16,10.113.221.221</value>
</property>
<property>
  <name>hadoop.proxyuser.super.users</name>
  <value>user1,user2</value>
</property>
```

## 注意事项

如果集群运行在安全模式下，则超级用户必须具有Kerberos凭证才能模拟另一个用户。

它不能使用委派令牌进行此功能。如果超级用户将其自己的委派令牌添加到代理用户ugi中，将允许代理用户使用超级用户的特权连接到服务，这是错误的。

然而，如果超级用户确实想要给joe一个委派令牌，它必须首先模拟joe并为joe获取一个委派令牌，就像上面的代码示例一样，并将其添加到joe的ugi中。

这样委派令牌的所有者将是joe。

# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/Superusers.html

* any list
{:toc}