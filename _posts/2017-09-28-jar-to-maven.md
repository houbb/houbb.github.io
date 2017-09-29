---
layout: post
title:  Jar to Maven
date:  2017-09-28 18:52:13 +0800
categories: [Maven]
tags: [maven]
published: true
---

# Jar to Maven


我们经常去 maven 上搜索使用的 jar，非常的方便。但是怎么样将自己的 jar 上传到 Maven 仓库呢？

> [jar发布到maven中央仓库小记](http://blog.csdn.net/hj7jay/article/details/51130398)

## Register Sonatype

[注册](https://issues.sonatype.org/secure/Signup!default.jspa) 一个 Jira 账户。

Sonatype 还提供了一个名为 OSS 的系统，具体的构件发布是在这个 [OSS](https://oss.sonatype.org) 系统上。

[登录](https://oss.sonatype.org) Sonatype，使用刚才注册的账号。


## Create Issue

![sonatype-create-issue]({{ site.url }}/static/app/img/nexus/2017-09-28-sonatype-create-issue.png)

点击 **Create** 按钮，将信息补充完整。


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

</project>
```

- 必须包括：name、description、url、licenses、developers、scm 等基本信

- snapshotRepository 与 repository 中的 id 一定要与 `setting.xml` 中 server 的 id 保持一致。

- maven 多模块只需要在父模块中添加以上信息即可。


# 上传到 OOS
 
```
$   mvn clean deploy -P sonatype-oss-release -Darguments="gpg.passphrase=设置gpg设置密钥时候输入的Passphrase" 
```

mvn clean deploy -P release -Darguments="gpg.passphrase=houbinbin146"
 

http://blog.csdn.net/hj7jay/article/details/51130398

http://blog.csdn.net/wf632856695/article/details/71405311

http://blog.csdn.net/ljbmxsm/article/details/78009268



TBC....


* any list
{:toc}












 

