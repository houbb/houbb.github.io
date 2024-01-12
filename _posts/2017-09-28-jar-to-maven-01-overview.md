---
layout: post
title:  maven 发布到中央仓库-01-概览
date:  2017-09-28 18:52:13 +0800
categories: [Maven]
tags: [maven, mvn]
published: true
---

# Jar to Maven


我们经常去 maven 上搜索使用的 jar，非常的方便。但是怎么样将自己的 jar 上传到 Maven 仓库呢？

## Register Sonatype

[注册](https://issues.sonatype.org/secure/Signup!default.jspa) 一个 Jira 账户。

Sonatype 还提供了一个名为 OSS 的系统，具体的构件发布是在这个 [OSS](https://oss.sonatype.org) 系统上。

[登录](https://oss.sonatype.org) Sonatype，使用刚才注册的账号。


## Create Issue

![sonatype-create-issue](https://raw.githubusercontent.com/houbb/resource/master/img/nexus/2017-09-28-sonatype-create-issue.png)

点击 <kbd>Create</kbd> 按钮，将信息补充完整。

选择 

- Community Support - Open Source Project Repository Hosting (OSSRH)

- New Project

其他按照你自己的项目情况填写。


一般，很快会收到回复。内容大致如下：

```
com.github.houbb has been prepared, now user(s) houbbEcho can:
* Deploy snapshot artifacts into repository https://oss.sonatype.org/content/repositories/snapshots
* Deploy release artifacts into the staging repository https://oss.sonatype.org/service/local/staging/deploy/maven2
* Promote staged artifacts into repository 'Releases'
* Download snapshot and release artifacts from group https://oss.sonatype.org/content/groups/public
* Download snapshot, release and staged artifacts from staging group https://oss.sonatype.org/content/groups/staging
```



## Generate GPG


### windows 安装

PS: Windows 请下载 [gpg4win](https://www.gpg4win.org/download.html)


ps: 从官方下载有点慢，我直接从华军软件园下载的。

[V2.3.1](http://www.onlinedown.net/soft/56460.htm)

- 安装检测

```
λ gpg --version
gpg (GnuPG) 2.0.30 (Gpg4win 2.3.1)
libgcrypt 1.6.5
Copyright (C) 2015 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Home: C:/Users/Administrator/AppData/Roaming/gnupg
Supported algorithms:
Pubkey: RSA, RSA, RSA, ELG, DSA
Cipher: IDEA, 3DES, CAST5, BLOWFISH, AES, AES192, AES256, TWOFISH,
        CAMELLIA128, CAMELLIA192, CAMELLIA256
Hash: MD5, SHA1, RIPEMD160, SHA256, SHA384, SHA512, SHA224
Compression: Uncompressed, ZIP, ZLIB, BZIP2
```

- 生成密匙

```
λ gpg --gen-key                                          
gpg (GnuPG) 2.0.30; Copyright (C) 2015 Free Software Foun
This is free software: you are free to change and redistr
There is NO WARRANTY, to the extent permitted by law.    
                                                         
gpg: keyring `C:/Users/Administrator/AppData/Roaming/gnup
gpg: keyring `C:/Users/Administrator/AppData/Roaming/gnup
Please select what kind of key you want:                 
   (1) RSA and RSA (default)                             
   (2) DSA and Elgamal                                   
   (3) DSA (sign only)                                   
   (4) RSA (sign only)                                   
Your selection?                                          
RSA keys may be between 1024 and 4096 bits long.         
What keysize do you want? (2048)                         
Requested keysize is 2048 bits                           
Please specify how long the key should be valid.         
         0 = key does not expire                         
      <n>  = key expires in n days                       
      <n>w = key expires in n weeks                      
      <n>m = key expires in n months                     
      <n>y = key expires in n years                      
Key is valid for? (0)                                    
Key does not expire at all                               
Is this correct? (y/N) y                                 
                                                         
GnuPG needs to construct a user ID to identify your key. 
                                                         
Real name:                                               
```

全部选择默认，然后让输入名称。

- 输入基本信息

```
Real name: houbb
Email address: 1060732496@qq.com
Comment: houbb
You selected this USER-ID:
    "houbb (houbb) <1060732496@qq.com>"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O
You need a Passphrase to protect your secret key.

We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.
gpg: C:/Users/Administrator/AppData/Roaming/gnupg/trustdb.gpg: trustdb created
gpg: key 93A5D37E marked as ultimately trusted
public and secret key created and signed.

gpg: checking the trustdb
gpg: 3 marginal(s) needed, 1 complete(s) needed, PGP trust model
gpg: depth: 0  valid:   1  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 1u
pub   2048R/93A5D37E 2019-11-05
      Key fingerprint = 9937 FCD0 3381 7A78 5835  0BFA FF95 C30D 93A5 D37E
uid       [ultimate] houbb (houbb) <1060732496@qq.com>
sub   2048R/5F300F72 2019-11-05
```

- 查看公匙

```
$    gpg --list-keys

C:/Users/Administrator/AppData/Roaming/gnupg/pubring.gpg
--------------------------------------------------------
pub   2048R/93A5D37E 2019-11-05
uid       [ultimate] houbb (houbb) <1060732496@qq.com>
sub   2048R/5F300F72 2019-11-05
```


`9937 FCD0 3381 7A78 5835  0BFA FF95 C30D 93A5 D37E` 这个就是公钥ID。


- 将公钥发布到 PGP 密钥服务器
 
```
λ gpg --keyserver hkp://keyserver.ubuntu.com:11371 --send-keys 9937FCD033817A7858350BFAFF95C30D93A5D37E
gpg: sending key 93A5D37E to hkp server keyserver.ubuntu.com
```


- 验证是否上传成功

```
λ gpg --keyserver hkp://keyserver.ubuntu.com:11371 --recv-keys 9937FCD033817A7858350BFAFF95C30D93A5D37E
gpg: requesting key 93A5D37E from hkp server keyserver.ubuntu.com
gpg: key 93A5D37E: "houbb (houbb) <1060732496@qq.com>" not changed
gpg: Total number processed: 1
gpg:              unchanged: 1
```

搞定，上传成功。


- 另一次

```
gpg --keyserver hkp://keyserver.ubuntu.com:11371 --send-keys 9B765573E9EE7DF5DB1C9CC84A125640BEBB2D5B
gpg --keyserver hkp://keyserver.ubuntu.com:11371 --recv-keys 9B765573E9EE7DF5DB1C9CC84A125640BEBB2D5B
```

### Mac 安装

Mac 系统。安装 [GPG](http://www.ruanyifeng.com/blog/2013/07/gpg.html)

```
$   brew install gpg
```

- 校验是否安装成功

```
$   gpg --version
```

如下:

```
gpg (GnuPG) 2.2.1
libgcrypt 1.8.1
Copyright (C) 2017 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <https://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Home: /Users/houbinbin/.gnupg
支持的算法：
公钥：RSA, ELG, DSA, ECDH, ECDSA, EDDSA
对称加密：IDEA, 3DES, CAST5, BLOWFISH, AES, AES192, AES256,
     TWOFISH, CAMELLIA128, CAMELLIA192, CAMELLIA256
散列：SHA1, RIPEMD160, SHA256, SHA384, SHA512, SHA224
压缩：不压缩, ZIP, ZLIB, BZIP2
```

- 生成密匙

```
$   gpg --gen-key
```

按照操作执行，最后提示如下：

```
公钥和私钥已经生成并经签名。

pub   rsa2048 2017-09-28 [SC] [有效至：2019-09-28]
      XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
uid                      XXX <XXX@XX.com>
sub   rsa2048 2017-09-28 [E] [有效至：2019-09-28]
```

- 查看公匙

```
$    gpg --list-keys
```

如下：

```
houbinbindeMacBook-Pro:~ houbinbin$ gpg --list-keys
gpg: 正在检查信任度数据库
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: 深度：0 有效性：  1 已签名：  0 信任度：0-，0q，0n，0m，0f，1u
gpg: 下次信任度数据库检查将于 2019-09-28 进行
/Users/houbinbin/.gnupg/pubring.kbx
-----------------------------------
pub   rsa2048 2017-09-28 [SC] [有效至：2019-09-28]
      6107DF0A8EE6A62EABFDD12914F722543E7D2C1E
uid           [ 绝对 ] houbb <xxx@xx.com>
sub   rsa2048 2017-09-28 [E] [有效至：2019-09-28]
```


`6107DF0A8EE6A62EABFDD12914F722543E7D2C1E` 这个就是公钥ID。


- 将公钥发布到 PGP 密钥服务器
 
```
$   gpg --keyserver hkp://keyserver.ubuntu.com:11371 --send-keys 6107DF0A8EE6A62EABFDD12914F722543E7D2C1E
```

结果

```
gpg: 将密钥‘14F722543E7D2C1E’上传到 hkp://keyserver.ubuntu.com:11371
```

- 验证是否上传成功

```
$   gpg --keyserver hkp://keyserver.ubuntu.com:11371 --recv-keys 6107DF0A8EE6A62EABFDD12914F722543E7D2C1E
```

如下

```
gpg: 密钥 14F722543E7D2C1E：“houbb <XXX@XX.com>”未改变
gpg: 合计被处理的数量：1
gpg:           未改变：1
```

# Maven 

对于 [maven](https://houbb.github.io/2016/10/22/maven) 需要进行配置修改。

```
$ mvn -v

Apache Maven 3.3.9 (bb52d8502b132ec0a5a3f4c09453c07478323dc5; 2015-11-11T00:41:47+08:00)
Maven home: /usr/local/maven/maven3.3.9
Java version: 1.8.0_91, vendor: Oracle Corporation
Java home: /Library/Java/JavaVirtualMachines/jdk1.8.0_91.jdk/Contents/Home/jre
Default locale: zh_CN, platform encoding: UTF-8
OS name: "mac os x", version: "10.12.6", arch: "x86_64", family: "mac"
```

## settings.xml

- 用户名/密码

修改 maven 全局配置 `settings.xml`，

```xml
<servers>
    <server>
        <id>oss</id>
        <username>用户名</username>
        <password>密码</password>
    </server>
</servers>
```


用户名/密码为最初我们在 JIRA(Sonatype) 申请的账户信息。

- GPG 配置

```xml
<profiles>
    <profile>
        <id>release</id>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
        
        <properties>
            <gpg.executable>gpg</gpg.executable>
            <gpg.passphrase>密钥的密码</gpg.passphrase>
        </properties>
    </profile>
</profiles>
```

配置这个之后就不用每次 GPG 加密手动指定密码了。

## pom.xml

此文件为需要上传的 maven project `pom.xml`。

添加配置如下：

```xml
<project>


<!--============================== ADD For sonatype START ==============================-->
<name>thread</name>
<description>thread4j</description>

<parent>
    <groupId>org.sonatype.oss</groupId>
    <artifactId>oss-parent</artifactId>
    <version>7</version>
</parent>
<licenses>
    <license>
        <name>The Apache Software License, Version 2.0</name>
        <url>http://www.apache.org/licenses/LICENSE-2.0.txt</url>
        <distribution>repo</distribution>
    </license>
</licenses>
<scm>
    <url>https://github.com/houbb/thread</url>
    <connection>https://github.com/houbb/thread.git</connection>
    <developerConnection>https://houbb.github.io/</developerConnection>
</scm>
<developers>
    <developer>
        <name>houbb</name>
        <email>houbinbin.echo@gmail.com</email>
        <url>https://houbb.github.io/</url>
    </developer>
</developers>


<distributionManagement>
        <snapshotRepository>
            <id>oss</id>
            <name>OSS Snapshots Repository</name>
            <url>https://oss.sonatype.org/content/repositories/snapshots/</url>
        </snapshotRepository>
        <repository>
            <id>oss</id>
            <name>OSS Releases Repository</name>
            <url>https://oss.sonatype.org/service/local/staging/deploy/maven2/</url>
        </repository>
</distributionManagement>
<!--============================== ADD For sonatype END ==============================-->

    <profiles>
        <profile>
            <id>release</id>
            <build>
                <plugins>
                    <!-- Source -->
                    <plugin>
                        <groupId>org.apache.maven.plugins</groupId>
                        <artifactId>maven-source-plugin</artifactId>
                        <version>2.2.1</version>
                        <executions>
                            <execution>
                                <phase>package</phase>
                                <goals>
                                    <goal>jar-no-fork</goal>
                                </goals>
                            </execution>
                        </executions>
                    </plugin>
                    <!-- Javadoc -->
                    <plugin>
                        <groupId>org.apache.maven.plugins</groupId>
                        <artifactId>maven-javadoc-plugin</artifactId>
                        <version>2.9.1</version>
                        <executions>
                            <execution>
                                <phase>package</phase>
                                <goals>
                                    <goal>jar</goal>
                                </goals>
                            </execution>
                        </executions>
                    </plugin>
                    <!-- GPG -->
                    <plugin>
                        <groupId>org.apache.maven.plugins</groupId>
                        <artifactId>maven-gpg-plugin</artifactId>
                        <version>1.5</version>
                        <executions>
                            <execution>
                                <phase>verify</phase>
                                <goals>
                                    <goal>sign</goal>
                                </goals>
                            </execution>
                        </executions>
                    </plugin>
                </plugins>
            </build>
            <distributionManagement>
                <snapshotRepository>
                    <id>oss</id>
                    <url>https://oss.sonatype.org/content/repositories/snapshots/</url>
                </snapshotRepository>
                <repository>
                    <id>oss</id>
                    <url>https://oss.sonatype.org/service/local/staging/deploy/maven2/</url>
                </repository>
            </distributionManagement>
        </profile>
    </profiles>
    
</project>
```

- 必须包括：name、description、url、licenses、developers、scm 等基本信

- snapshotRepository 与 repository 中的 id 一定要与 `setting.xml` 中 server 的 id 保持一致。

- maven 多模块只需要在父模块中添加以上信息即可。


# 上传到 OOS
 
```
$   mvn clean deploy -P sonatype-oss-release -Darguments="gpg.passphrase=设置gpg设置密钥时候输入的Passphrase" 
```

mvn clean deploy -P release -Darguments="gpg.passphrase=XXXXXXXX"
 

如果只输入 `mvn clean deploy -P release` 会弹出密码输入框，输入对应的密码。(Windows 环境)

然后等待发布完成即可。

[stagingRepositories](https://oss.sonatype.org/#stagingRepositories) 中拉倒最下方或者是直接模糊查询，应该可以找到我们刚才发布的 jar。

![mvn-stage-repo](https://raw.githubusercontent.com/houbb/resource/master/img/maven/2017-10-19-mvn-stage-repo.jpg)

## close

勾选我们的jar，点击上方的 **close**。会对项目进行校验(源码、文档、签名等)

如果不合格下方会有对应的错误提示。

顺利的话 status 会变成 closed。然后进行下一步。

## release

勾选我们的jar，点击上方的 **release**。

点击之后，当前构件就会消失。

## 构件已成功发布

在 [Issue](https://issues.sonatype.org/issues) 下面回复一条 `构件已成功发布` 的评论，
这是为了通知 Sonatype 的工作人员为需要发布的构件做审批，发布后会关闭该 Issue。

这个，又只能等待了，当然他们晚上上班，还是第二天看。当审批通过后，将会收到邮件通知。

## 从中央仓库中搜索构件

这时，就可以在 maven 的中央仓库中搜索到自己发布的构件了，以后可以直接在 pom.xml 中使用了！

中央仓库搜索网站：http://search.maven.org/

第一次成功发布之后，以后就不用这么麻烦了，可以直接使用 Group Id 发布任何的构件，当然前提是 Group Id 没有变。

以后的发布流程：

1. 构件完成后直接使用 maven 在命令行上传构建；

2. 在 [https://oss.sonatype.org/](https://oss.sonatype.org/) 中 close 并 release 构件；

3. 等待同步好（大约2小时多）之后，就可以使用了


# BLOG

http://blog.csdn.net/hj7jay/article/details/51130398

http://blog.csdn.net/wf632856695/article/details/71405311

http://blog.csdn.net/ljbmxsm/article/details/78009268


# 常见问题

## GPG 签名失败

- 问题描述

不知道是否是 windows 和 mac 同时操作，会导致一方失效。

Mac 上传 jar 时出现报错：

```
gpg: 签名时失败： Inappropriate ioctl for device 
gpg: signing failed: Inappropriate ioctl for device
```

- 解决方式

1、命令行打开 `~/.gnupg` 文件夹

2、添加 `gpg.conf` 文件，内容如下：

```
use-agent 
pinentry-mode loopback 
```
3、添加 `gpg-agent.conf`，内容如下：

```
allow-loopback-pinentry
```

重新尝试即可。

# setting.xml

文件内容如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<!--
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
-->

<!--
 | This is the configuration file for Maven. It can be specified at two levels:
 |
 |  1. User Level. This settings.xml file provides configuration for a single user,
 |                 and is normally provided in ${user.home}/.m2/settings.xml.
 |
 |                 NOTE: This location can be overridden with the CLI option:
 |
 |                 -s /path/to/user/settings.xml
 |
 |  2. Global Level. This settings.xml file provides configuration for all Maven
 |                 users on a machine (assuming they're all using the same Maven
 |                 installation). It's normally provided in
 |                 ${maven.home}/conf/settings.xml.
 |
 |                 NOTE: This location can be overridden with the CLI option:
 |
 |                 -gs /path/to/global/settings.xml
 |
 | The sections in this sample file are intended to give you a running start at
 | getting the most out of your Maven installation. Where appropriate, the default
 | values (values used when the setting is not specified) are provided.
 |
 |-->
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
  <!-- localRepository
   | The path to the local repository maven will use to store artifacts.
   |
   | Default: ${user.home}/.m2/repository
  <localRepository>/path/to/local/repo</localRepository>
  -->

  <!-- interactiveMode
   | This will determine whether maven prompts you when it needs input. If set to false,
   | maven will use a sensible default value, perhaps based on some other setting, for
   | the parameter in question.
   |
   | Default: true
  <interactiveMode>true</interactiveMode>
  -->

  <!-- offline
   | Determines whether maven should attempt to connect to the network when executing a build.
   | This will have an effect on artifact downloads, artifact deployment, and others.
   |
   | Default: false
  <offline>false</offline>
  -->

  <!-- pluginGroups
   | This is a list of additional group identifiers that will be searched when resolving plugins by their prefix, i.e.
   | when invoking a command line like "mvn prefix:goal". Maven will automatically add the group identifiers
   | "org.apache.maven.plugins" and "org.codehaus.mojo" if these are not already contained in the list.
   |-->
  <pluginGroups>
    <!-- pluginGroup
     | Specifies a further group identifier to use for plugin lookup.
    <pluginGroup>com.your.plugins</pluginGroup>
    -->
    <pluginGroup>org.sonarsource.scanner.maven</pluginGroup>
  </pluginGroups>

  <!-- proxies
   | This is a list of proxies which can be used on this machine to connect to the network.
   | Unless otherwise specified (by system property or command-line switch), the first proxy
   | specification in this list marked as active will be used.
   |-->
  <proxies>
    <!-- proxy
     | Specification for one proxy, to be used in connecting to the network.
     |
    <proxy>
      <id>optional</id>
      <active>true</active>
      <protocol>http</protocol>
      <username>proxyuser</username>
      <password>proxypass</password>
      <host>proxy.host.net</host>
      <port>80</port>
      <nonProxyHosts>local.net|some.host.com</nonProxyHosts>
    </proxy>
    -->
  </proxies>

  <!-- servers
   | This is a list of authentication profiles, keyed by the server-id used within the system.
   | Authentication profiles can be used whenever maven must make a connection to a remote server.
   |-->
  <servers>
    <!-- server
     | Specifies the authentication information to use when connecting to a particular server, identified by
     | a unique name within the system (referred to by the 'id' attribute below).
     |
     | NOTE: You should either specify username/password OR privateKey/passphrase, since these pairings are
     |       used together.
     |
    <server>
      <id>deploymentRepo</id>
      <username>repouser</username>
      <password>repopwd</password>
    </server>
    -->

    <!-- Another sample, using keys to authenticate.
    <server>
      <id>siteServer</id>
      <privateKey>/path/to/private/key</privateKey>
      <passphrase>optional; leave empty if not used.</passphrase>
    </server>
    -->

   <!-- add nexus admin server -->
    <server>
        <id>releases</id>
        <username>admin</username>
        <password>admin123</password>
    </server>
    <server>
        <id>snapshots</id>
        <username>admin</username>
        <password>admin123</password>
    </server>

   <!-- add for oss -->
    <server>
    <id>oss</id>
    <username>用户名</username>
    <password>密码</password>
   </server>
  </servers>

  <!-- mirrors
   | This is a list of mirrors to be used in downloading artifacts from remote repositories.
   |
   | It works like this: a POM may declare a repository to use in resolving certain artifacts.
   | However, this repository may have problems with heavy traffic at times, so people have mirrored
   | it to several places.
   |
   | That repository definition will have a unique id, so we can create a mirror reference for that
   | repository, to be used as an alternate download site. The mirror site will be the preferred
   | server for that repository.
   |-->
  <mirrors>
    <!-- mirror
     | Specifies a repository mirror site to use instead of a given repository. The repository that
     | this mirror serves has an ID that matches the mirrorOf element of this mirror. IDs are used
     | for inheritance and direct lookup purposes, and must be unique across the set of mirrors.
     |
    <mirror>
      <id>mirrorId</id>
      <mirrorOf>repositoryId</mirrorOf>
      <name>Human Readable Name for this Mirror.</name>
      <url>http://my.repository.com/repo/path</url>
    </mirror>
     -->
   <!--
        <mirror>  
            <id>nexus-osc</id>  
            <mirrorOf>central</mirrorOf>  
            <name>Nexus osc</name>  
            <url>http://maven.oschina.net/content/groups/public/</url>  
        </mirror>  
        <mirror>  
            <id>nexus-osc-thirdparty</id>  
            <mirrorOf>thirdparty</mirrorOf>  
            <name>Nexus osc thirdparty</name>  
            <url>http://maven.oschina.net/content/repositories/thirdparty/</url>  
        </mirror>
   --> 
  <!-- add neuxs mirror config
  <mirror>
    <id>nexus</id>
    <mirrorOf>*</mirrorOf>
    <url>http://localhost:8081/nexus/content/groups/public</url>
  </mirror>
 --> 
       <!-- 阿里云仓库 -->
       <!--
       <mirror>
            <id>alimaven</id>
            <mirrorOf>central</mirrorOf>
            <name>aliyun maven</name>
            <url>http://maven.aliyun.com/nexus/content/repositories/central/</url>
        </mirror>
        -->
  </mirrors>

  <!-- profiles
   | This is a list of profiles which can be activated in a variety of ways, and which can modify
   | the build process. Profiles provided in the settings.xml are intended to provide local machine-
   | specific paths and repository locations which allow the build to work in the local environment.
   |
   | For example, if you have an integration testing plugin - like cactus - that needs to know where
   | your Tomcat instance is installed, you can provide a variable here such that the variable is
   | dereferenced during the build process to configure the cactus plugin.
   |
   | As noted above, profiles can be activated in a variety of ways. One way - the activeProfiles
   | section of this document (settings.xml) - will be discussed later. Another way essentially
   | relies on the detection of a system property, either matching a particular value for the property,
   | or merely testing its existence. Profiles can also be activated by JDK version prefix, where a
   | value of '1.4' might activate a profile when the build is executed on a JDK version of '1.4.2_07'.
   | Finally, the list of active profiles can be specified directly from the command line.
   |
   | NOTE: For profiles defined in the settings.xml, you are restricted to specifying only artifact
   |       repositories, plugin repositories, and free-form properties to be used as configuration
   |       variables for plugins in the POM.
   |
   |-->
  <profiles>
   <profile>
     <id>sonar</id>
     <activation>
         <activeByDefault>true</activeByDefault>
     </activation>
     <properties>
          <sonar.jdbc.url>
          jdbc:mysql://localhost:3306/sonar?useUnicode=true&amp;characterEncoding=utf8
          </sonar.jdbc.url>
          <sonar.jdbc.driver>com.mysql.jdbc.Driver</sonar.jdbc.driver>
          <sonar.jdbc.username>sonar</sonar.jdbc.username>
          <sonar.jdbc.password>sonar</sonar.jdbc.password>
          <sonar.host.url>http://localhost:9000</sonar.host.url>
     </properties>
  </profile>
    <!-- profile
     | Specifies a set of introductions to the build process, to be activated using one or more of the
     | mechanisms described above. For inheritance purposes, and to activate profiles via <activatedProfiles/>
     | or the command line, profiles have to have an ID that is unique.
     |
     | An encouraged best practice for profile identification is to use a consistent naming convention
     | for profiles, such as 'env-dev', 'env-test', 'env-production', 'user-jdcasey', 'user-brett', etc.
     | This will make it more intuitive to understand what the set of introduced profiles is attempting
     | to accomplish, particularly when you only have a list of profile id's for debug.
     |
     | This profile example uses the JDK version to trigger activation, and provides a JDK-specific repo.
    <profile>
      <id>jdk-1.4</id>

      <activation>
        <jdk>1.4</jdk>
      </activation>

      <repositories>
        <repository>
          <id>jdk14</id>
          <name>Repository for JDK 1.4 builds</name>
          <url>http://www.myhost.com/maven/jdk14</url>
          <layout>default</layout>
          <snapshotPolicy>always</snapshotPolicy>
        </repository>
      </repositories>
    </profile>
    -->

    <!--
     | Here is another profile, activated by the system property 'target-env' with a value of 'dev',
     | which provides a specific path to the Tomcat instance. To use this, your plugin configuration
     | might hypothetically look like:
     |
     | ...
     | <plugin>
     |   <groupId>org.myco.myplugins</groupId>
     |   <artifactId>myplugin</artifactId>
     |
     |   <configuration>
     |     <tomcatLocation>${tomcatPath}</tomcatLocation>
     |   </configuration>
     | </plugin>
     | ...
     |
     | NOTE: If you just wanted to inject this configuration whenever someone set 'target-env' to
     |       anything, you could just leave off the <value/> inside the activation-property.
     |
    <profile>
      <id>env-dev</id>

      <activation>
        <property>
          <name>target-env</name>
          <value>dev</value>
        </property>
      </activation>

      <properties>
        <tomcatPath>/path/to/tomcat/instance</tomcatPath>
      </properties>
    </profile>
    -->

   <profile>
        <!--this profile will allow snapshots to be searched when activated-->
        <id>public-snapshots</id>
        <repositories>
            <repository>
                <id>public-snapshots</id>
                <url>http://localhost:8081/nexus/content/groups/public</url>
                <releases><enabled>true</enabled></releases>
                <snapshots><enabled>true</enabled></snapshots>
            </repository>
        </repositories>
        <pluginRepositories>
            <pluginRepository>
                <id>public-snapshots</id>
                <url>http://localhost:8081/nexus/content/groups/public</url>
                <releases><enabled>true</enabled></releases>
                <snapshots><enabled>true</enabled></snapshots>
            </pluginRepository>
        </pluginRepositories>
    </profile>


   <profile>
        <id>ossrh</id>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
        
        <properties>
            <gpg.executable>gpg</gpg.executable>
            <gpg.passphrase>密码</gpg.passphrase>
        </properties>
    </profile>

  </profiles>

  <!-- activeProfiles
   | List of profiles that are active for all builds.
   |
  <activeProfiles>
    <activeProfile>alwaysActiveProfile</activeProfile>
    <activeProfile>anotherAlwaysActiveProfile</activeProfile>
    <activeProfile>public-snapshots</activeProfile>
  </activeProfiles>
  -->
</settings>
```


# windows 实战记录

## 下载 gpg

[gpg4win](https://www.gpg4win.org/get-gpg4win.html) 下载安装

推荐使用 [Gpg4win-Vanilla](http://files.gpg4win.org/) 版本，因为它仅包括 GnuPG，这个工具才是我们所需要的。

此处我下载的是 `gpg4win-vanilla-2.3.4.exe	2017-07-06 15:46	3.2M` 这个文件。

## 安装

直接双击安装。

- 验证

```
$   gpg --version
```

日志信息如下：

```
C:\Users\binbin.hou>gpg --version
gpg (GnuPG) 2.0.30 (Gpg4win 2.3.4)
libgcrypt 1.7.8
Copyright (C) 2015 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Home: C:/Users/binbin.hou/AppData/Roaming/gnupg
Supported algorithms:
Pubkey: RSA, RSA, RSA, ELG, DSA
Cipher: IDEA, 3DES, CAST5, BLOWFISH, AES, AES192, AES256, TWOFISH,
        CAMELLIA128, CAMELLIA192, CAMELLIA256
Hash: MD5, SHA1, RIPEMD160, SHA256, SHA384, SHA512, SHA224
Compression: Uncompressed, ZIP, ZLIB, BZIP2
```

## 生成密钥对

```
$   gpg --gen-key   
```

这里选择默认的第一个。

之后往下，会让你输入用户名和邮箱，还有一个Passphase，相当于密钥库密码，不要忘记。

## 查看公钥

```
gpg --list-keys
```

如下：

```
C:/Users/binbin.hou/AppData/Roaming/gnupg/pubring.gpg
-----------------------------------------------------
pub   2048R/401804C3 2019-05-01
uid       [ultimate] houbb (gpg) <1060732496@qq.com>
sub   2048R/C45E13DE 2019-05-01
```

我这里的公钥 ID 是 `401804C3` 马上就会用到了。


## 将公钥发布到 PGP 密钥服务器
 
```
$   gpg --keyserver hkp://keyserver.ubuntu.com:11371 --send-keys 401804C3
```

## 验证是否上传成功

```
$   gpg --keyserver hkp://keyserver.ubuntu.com:11371 --recv-keys 401804C3
```

日志信息如下：

```
gpg: requesting key 401804C3 from hkp server keyserver.ubuntu.com
gpg: key 401804C3: "houbb (gpg) <1060732496@qq.com>" not changed
gpg: Total number processed: 1
gpg:              unchanged: 1
```

剩下的就和 mac 一样了。

## setting.xml

有时候 idea 指定 的 xml 好像没有用，建议使用 setting.xml 进行相关的修改。

## 过期报错

时隔一段时间之后，发现 gpg 验证时报错。

大概意思就是【17f0276c401804c3】在 http://pool.sks-keyservers.net:11371 找不到。

```
gpg --keyserver hkp://pool.sks-keyservers.net:11371 --send-keys 17f0276c401804c3
gpg --keyserver hkp://pool.sks-keyservers.net:11371 --recv-keys 17f0276c401804c3
```

这个直接重新上传，然后等待一段时间即可

## GPG 删除 keys 

一开始生成多个，感觉没啥用，这里执行以下删除。

查看：

`gpg --k` 或者 `gpg --list-keys` 查看已有的信息：

```
C:/Users/dh/AppData/Roaming/gnupg/pubring.gpg
---------------------------------------------
pub   2048R/48848916 2022-08-17
uid       [ultimate] houbb <1060732496@qq.com>
sub   2048R/C424FB1D 2022-08-17

pub   2048R/CEC51B24 2022-08-17
uid       [ultimate] houbb <1060732496@qq.com>
sub   2048R/91CB7C04 2022-08-17
```


删除私钥：

```
gpg --delete-secret-keys 48848916
```

执行删除公钥：

```
gpg --delete-keys 48848916
```


# 访问 maven 太慢

## 测速

直接站长工具测速，[http://tool.chinaz.com/speedtest/oss.sonatype.org](http://tool.chinaz.com/speedtest/oss.sonatype.org)

## 修改 hosts

```
35.169.48.141 https://oss.sonatype.org/
```

## 立刻生效

cmd 执行命令：

```
ipconfig /flushdns
```

# 执行报错

## 报错

```
'gpg' 不是内部或外部命令，也不是可运行的程序或批处理文件。
```

## 原因

对应的 pgp 在当前路径找不到。需要配置对应的 PATH。

然后就是安装路径中，exe 只有 pgp2.exe

## 解决方案

- setting.xml

```xml
<profile>
    <id>release</id>
    <activation>
        <activeByDefault>true</activeByDefault>
    </activation>
    
    <properties>
        <gpg.executable>gpg2</gpg.executable>
        <gpg.passphrase>密码</gpg.passphrase>
    </properties>
</profile>
```

- 执行命令

不过这个是临时的，也可以配置环境变量，设置为永久的。

```
SET PATH=%PATH%;C:\Program Files (x86)\GNU\GnuPG
```

# 参考资料

http://blog.csdn.net/hj7jay/article/details/51130398

https://stackoverrun.com/cn/q/6500169

* any list
{:toc}