---
layout: post
title:  Ubuntu Jenkins
date:  2018-08-14 13:46:27 +0800
categories: [Ubuntu]
tags: [ubuntu, ci]
published: true
---

* any list
{:toc}

# 下载

- Download

[download](https://jenkins.io/index.html) jenkies

- Copy it into tomcat

```
cp jenkins.war ~/tool/tomcat/tomcat9/webapps/
```

- Rename it as ```ROOT.war```

```
mv jenkins.war ROOT.war
```

- Start tomcat

```
./startup.sh
```

- init

```
vi /home/hbb/.jenkins/secrets/initialAdminPassword
```

put the content into index of jenkies

- plugins

```
scp all_plugin.zip hbb@192.168.2.108:/home/hbb/.jenkins/plugins/
```

