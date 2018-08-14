---
layout: post
title:  Ubuntu Maven
date:  2018-08-14 13:46:27 +0800
categories: [Ubuntu]
tags: [ubuntu, maven]
published: true
---

* any list
{:toc}

# 下载

Ensure you has install jdk before!

- download

```
wget http://apache.fayea.com/maven/maven-3/3.3.9/binaries/apache-maven-3.3.9-bin.tar.gz
```

- unzip

```
$ tar -zxf apache-maven-3.3.9-bin.tar.gz
$ ls
apache-maven-3.3.9  apache-maven-3.3.9-bin.tar.gz
```


- get root path

```
$ pwd
/home/hbb/tool/maven/apache-maven-3.3.9
```

- config maven

```
vi ~/.bashrc
```

add content

```
# set maven environment
export M2_HOME=/home/hbb/tool/maven/apache-maven-3.3.9
export PATH=$M2_HOME/bin:$PATH
```

make it work at once

```
source ~/.bashrc
```

- test

```
$   mvn --version

Apache Maven 3.3.9 (bb52d8502b132ec0a5a3f4c09453c07478323dc5; 2015-11-11T00:41:47+08:00)
Maven home: /home/hbb/tool/maven/apache-maven-3.3.9
Java version: 1.8.0_112, vendor: Oracle Corporation
Java home: /home/hbb/tool/jdk/jdk1.8.0_112/jre
Default locale: en_US, platform encoding: UTF-8
OS name: "linux", version: "4.4.0-57-generic", arch: "amd64", family: "unix"
```


