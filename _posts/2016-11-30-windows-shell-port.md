---
layout: post
title: windows 端口占用 Port 端口占用-如何发现端口占用并且强杀？kill windows port 
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell]
published: true
---


# Port

各端口分配, 个人整理设计。

| Port           |   Server        |  Default port   |
| :------------- |:----------      |:--------------- |
| 80             | Apache          | 80              |
| 1234           | Phabricator     |                 |
| 2181           | zookeeper       | 2181            |
| 2280           | CAT server      | 2280            |
| 2281           | CAT tomcat      | 2281            |
| 4000           | jekyll          | 4000            |
| 6379           | Redis           | 6379            |
| 8081           | Sonatype Nexus  | 8081            |
| 8888           | tomcat          | 8080            |
| 9000           | SonarQube       | 9000            |
| 5601           | kibana          | 5601            |
| 9200           | elasticsearch   | 9200            |
| 7000           | logstash        | 7000            |


# 端口占用情况

1. ```lsof -i:XXX``` 查看

2. ```sudo netstat -apn | grep XXX``` 查看

3. ```ps -aux | grep XXX``` 详细信息

4. ```ps -ef | grep XXX``` 根据分类条件查询信息


# 发现并强杀

```
>netstat -ano | findstr "8226"
  TCP    0.0.0.0:8226           0.0.0.0:0              LISTENING       17064

>tasklist|findstr "17064"
winrdlv3.exe                 17064 Services                   0     34,664 K
```

【使用管理员启动命令行】

```
>taskkill /f /t /im "winrdlv3.exe"
```

# 3306 端口占用

```
netstat -ano | findstr "3306"
```



* any list
{:toc}





