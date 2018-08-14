---
layout: post
title:  Ubuntu JDK
date:  2018-08-14 13:46:27 +0800
categories: [Ubuntu]
tags: [ubuntu, java]
published: true
---

* any list
{:toc}

# 下载

- download from the html

```
http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html
```

- copy it into target place

```
houbinbindeMacBook-Pro:~ houbinbin$ cd ~/Downloads/
houbinbindeMacBook-Pro:Downloads houbinbin$ scp jdk-8u112-linux-x64.tar.gz hbb@192.168.2.108:/home/hbb/too/jdk/
```


- unzip it

```
tar -zxf jdk-8u112-linux-x64.tar.gz
```

- root path

```
$ pwd
/home/hbb/tool/jdk/jdk1.8.0_112
```

- config jdk

```
vi ~/.bashrc


```
 add content

```
# set for jdk
export JAVA_HOME=/home/hbb/tool/jdk/jdk1.8.0_112
export CLASSPATH=${JAVA_HOME}/lib
export PATH=${JAVA_HOME}/bin:$PATH
```

- make it work

```
source ~/.bashrc
```

- test

```
$ java -version
java version "1.8.0_112"
Java(TM) SE Runtime Environment (build 1.8.0_112-b15)
Java HotSpot(TM) 64-Bit Server VM (build 25.112-b15, mixed mode)
```

