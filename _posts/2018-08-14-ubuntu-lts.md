---
layout: post
title:  Ubuntu LTS
date:  2018-08-14 13:46:27 +0800
categories: [Ubuntu]
tags: [ubuntu, lts]
published: true
---

* any list
{:toc}

# 下载

- Download

```
$   git clone https://github.com/ltsopensource/light-task-scheduler
```

- Prepare

1. JDK
2. Maven
3. Zookeeper
4. MySQL


- Build

```
$ pwd
/home/hbb/tool/lts/light-task-scheduler
$ ls
build.cmd  build.sh  docs  LICENSE  lts  lts-admin  lts-core  lts-jobclient  lts-jobtracker  lts-monitor  lts-spring  lts-startup  lts-tasktracker  pom.xml  README.md  开发者规范.md  开发计划.md
$ chmod +x build.sh
$ ./build.sh
```


## 部署 LTS-admin





