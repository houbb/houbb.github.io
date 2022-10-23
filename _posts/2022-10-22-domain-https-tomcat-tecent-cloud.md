---
layout: post
title: 腾讯云域名启用 HTTPS tomcat 
date: 2021-08-02 21:01:55 +0800
categories: [System]
tags: [system, tomcat, sh]
published: true
---

# Tencent Cloud

## 购买域名

这里不再赘述。

## 配置

购买完成之后，需要进行域名解析配置。

![配置](https://img-blog.csdnimg.cn/fb83fa4ab6e44070ad4801c4e7a9dd47.png#pic_center)

（1）红框三角，点击之后可以把 DNS 解析分发。

（2）SSL 点击之后，可以选择把域名升级为 HTTPS，这里建议选择免费的。

腾讯云自带的免费的，比 Let's Encrpt 方便一些。会自动帮我们添加对应的 CNAME。

# tomcat 中使用

## 参考文档

可以参考官方文档：

> [如何选择 SSL 证书安装部署类型？](https://cloud.tencent.com/document/product/400/4143)


[Tomcat 服务器 SSL 证书安装部署（JKS 格式）（Linux）](https://cloud.tencent.com/document/product/400/35224)

## 实际记录

tomcat 版本：8.5.x，采用 jks 格式。

域名：houbinbin.fun

### 证书下载

直接去下载 [https://console.cloud.tencent.com/ssl](https://console.cloud.tencent.com/ssl)

选择对应的格式【Tomcat（JKS格式）】。

可以解压，文件夹内容：

```
houbinbin.fun.jks 密钥库
keystorePass.txt 密码文件（若已设置私钥密码，则无 keystorePass.txt 密码文件）
```

### 上传到服务器

到文件夹的目录下，执行命令：

```
$    scp houbinbin.fun.jks root@42.192.74.192:/root/tool/ssl/
```

### 配置 tomcat server.xml

编辑在 server.xml 文件。

添加如下内容：

```xml
<Connector port="443" protocol="HTTP/1.1" SSLEnabled="true"
  maxThreads="150" scheme="https" secure="true"
  keystoreFile="/root/tool/ssl/houbinbin.fun.jks" 
  keystorePass="******"
  clientAuth="false"/>
```

配置文件的主要参数说明如下：

keystoreFile：密钥库文件的存放位置，可以指定绝对路径，也可以指定相对于 `<CATALINA_HOME>` （Tomcat 安装目录）环境变量的相对路径。如果此项没有设定，默认情况下，Tomcat 将从当前操作系统用户的用户目录下读取名为 “.keystore” 的文件。

keystorePass：密钥库密码，指定 keystore 的密码。申请证书时若设置了私钥密码，请填写私钥密码；若申请证书时未设置私钥密码，请填写 Tomcat 文件夹中 keystorePass.txt 文件的密码。

clientAuth：如果设为 true，表示 Tomcat 要求所有的 SSL 客户出示安全证书，对 SSL 客户进行身份验证。

完整的 server.xml 文件，便于直接覆盖：

- server.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>

<Server port="8005" shutdown="SHUTDOWN">
  <Listener className="org.apache.catalina.startup.VersionLoggerListener" />
  <Listener className="org.apache.catalina.core.AprLifecycleListener" SSLEngine="on" />
  <Listener className="org.apache.catalina.core.JreMemoryLeakPreventionListener" />
  <Listener className="org.apache.catalina.mbeans.GlobalResourcesLifecycleListener" />
  <Listener className="org.apache.catalina.core.ThreadLocalLeakPreventionListener" />

  <GlobalNamingResources>
    <Resource name="UserDatabase" auth="Container"
              type="org.apache.catalina.UserDatabase"
              description="User database that can be updated and saved"
              factory="org.apache.catalina.users.MemoryUserDatabaseFactory"
              pathname="conf/tomcat-users.xml" />
  </GlobalNamingResources>

  <Service name="Catalina">
    <Connector port="80" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="443" />

    <Connector port="443" protocol="HTTP/1.1"
               maxThreads="150" SSLEnabled="true" scheme="https" secure="true"
               clientAuth="false"
                keystoreFile="/root/tool/ssl/houbinbin.fun.jks"
                keystorePass="xxxxxxxxxxxxxxxxxxxxxxxxxxx" />

    <Engine name="Catalina" defaultHost="localhost">
      <Realm className="org.apache.catalina.realm.LockOutRealm">
        <Realm className="org.apache.catalina.realm.UserDatabaseRealm"
               resourceName="UserDatabase"/>
      </Realm>

      <Host name="localhost"  appBase="webapps"
            unpackWARs="true" autoDeploy="true">
        <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
               prefix="localhost_access_log" suffix=".txt"
               pattern="%h %l %u %t &quot;%r&quot; %s %b" />
      </Host>
    </Engine>
  </Service>
</Server>
```

keystorePass 我们可以在下载的文件中看到。

## 域名备案

这些搞定之后。

域名还是需要备案，不过国内的会有限制，必须域名实名认证3天后才可以。

所以需要等待。


# 参考资料

[Tomcat Server.xml 配置详解](https://blog.csdn.net/Firstlucky77/article/details/124720089)

* any list
{:toc}