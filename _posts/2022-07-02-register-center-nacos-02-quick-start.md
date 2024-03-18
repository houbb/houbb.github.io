---
layout: post
title:  分布式注册中心 nacos-02-quick start 入门例子
date:  2022-07-02 09:22:02 +0800
categories: [Distributed]
tags: [distributed, register-center, sofa, sh]
published: true
---


# windows10 安装笔记

## 下载

```sh
git clone https://github.com/alibaba/nacos.git
```

## 编译

```sh
cd nacos

mvn -Prelease-nacos -Dmaven.test.skip=true clean install -U  
```

查看编译结果：

```sh
ls -al distribution/target/
```

对应的结果:

```
total 292970
drwxr-xr-x 1 dh 197121         0 11月 10 15:43 ./
drwxr-xr-x 1 dh 197121         0 11月 10 15:43 ../
drwxr-xr-x 1 dh 197121         0 11月 10 15:43 archive-tmp/
-rw-r--r-- 1 dh 197121        89 11月 10 15:43 checkstyle-cachefile
-rw-r--r-- 1 dh 197121     10057 11月 10 15:43 checkstyle-checker.xml
-rw-r--r-- 1 dh 197121        84 11月 10 15:43 checkstyle-result.xml
drwxr-xr-x 1 dh 197121         0 11月 10 15:43 nacos-server-2.3.0-BETA/
-rw-r--r-- 1 dh 197121 149981978 11月 10 15:43 nacos-server-2.3.0-BETA.tar.gz
-rw-r--r-- 1 dh 197121 149988820 11月 10 15:43 nacos-server-2.3.0-BETA.zip
-rw-r--r-- 1 dh 197121      1837 11月 10 15:43 rat.txt
```


对应的另一个目录：

```
λ pwd
d:\github\nacos\distribution
```

如下：

```
λ ls -al
total 88
drwxr-xr-x 1 dh 197121     0 11月 10 15:43 ./
drwxr-xr-x 1 dh 197121     0 11月 10 15:35 ../
-rw-r--r-- 1 dh 197121  5011 11月 10 15:43 .flattened-pom.xml
drwxr-xr-x 1 dh 197121     0 11月 10 15:33 bin/
drwxr-xr-x 1 dh 197121     0 11月 10 15:33 conf/
-rw-r--r-- 1 dh 197121 16899 11月 10 15:33 LICENSE-BIN
-rw-r--r-- 1 dh 197121  1340 11月 10 15:33 NOTICE-BIN
-rw-r--r-- 1 dh 197121  9539 11月 10 15:33 pom.xml
-rw-r--r-- 1 dh 197121  1979 11月 10 15:33 release-address.xml
-rw-r--r-- 1 dh 197121  2353 11月 10 15:33 release-client.xml
-rw-r--r-- 1 dh 197121  2350 11月 10 15:33 release-config.xml
-rw-r--r-- 1 dh 197121  2301 11月 10 15:33 release-core.xml
-rw-r--r-- 1 dh 197121  2141 11月 10 15:33 release-nacos.xml
-rw-r--r-- 1 dh 197121  2353 11月 10 15:33 release-naming.xml
drwxr-xr-x 1 dh 197121     0 11月 10 15:43 target/
```

## 启动



我们可以在  `D:\github\nacos\distribution\target\nacos-server-2.3.0-BETA\nacos\bin` 目录下，看到

```
λ ls -al
total 20
drwxr-xr-x 1 dh 197121    0 11月 10 15:43 ./
drwxr-xr-x 1 dh 197121    0 11月 10 15:43 ../
-rw-r--r-- 1 dh 197121 1229 11月 10 15:33 shutdown.cmd
-rwxr-xr-x 1 dh 197121  903 11月 10 15:33 shutdown.sh*
-rw-r--r-- 1 dh 197121 3482 11月 10 15:33 startup.cmd
-rwxr-xr-x 1 dh 197121 5535 11月 10 15:33 startup.sh*
```

运行命令：

```
startup.cmd -m standalone
```

对应的启动日志：

```
λ startup.cmd -m standalone
"nacos is starting with standalone"

         ,--.
       ,--.'|
   ,--,:  : |                                           Nacos 2.3.0-BETA
,`--.'`|  ' :                       ,---.               Running in stand alone mode, All function modules
|   :  :  | |                      '   ,'\   .--.--.    Port: 8848
:   |   \ | :  ,--.--.     ,---.  /   /   | /  /    '   Pid: 8356
|   : '  '; | /       \   /     \.   ; ,. :|  :  /`./   Console: http://172.20.93.124:8848/nacos/index.html
'   ' ;.    ;.--.  .-. | /    / ''   | |: :|  :  ;_
|   | | \   | \__\/: . ..    ' / '   | .; : \  \    `.      https://nacos.io
'   : |  ; .' ," .--.; |'   ; :__|   :    |  `----.   \
|   | '`--'  /  /  ,.  |'   | '.'|\   \  /  /  /`--'  /
'   : |     ;  :   .'   \   :    : `----'  '--'.     /
;   |.'     |  ,     .-./\   \  /            `--'---'
'---'        `--`---'     `----'

2023-11-10 15:54:30,221 INFO Tomcat initialized with port(s): 8848 (http)

2023-11-10 15:54:30,522 INFO Root WebApplicationContext: initialization completed in 2638 ms

2023-11-10 15:54:35,604 INFO Adding welcome page: class path resource [static/index.html]

2023-11-10 15:54:36,109 WARN You are asking Spring Security to ignore Ant [pattern='/**']. This is not recommended -- please use permitAll via HttpSecurity#authorizeHttpRequests instead.

2023-11-10 15:54:36,109 INFO Will not secure Ant [pattern='/**']

2023-11-10 15:54:36,125 INFO Will secure any request with [org.springframework.security.web.session.DisableEncodeUrlFilter@1ee4730, org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter@59a67c3a, org.springframework.security.web.context.SecurityContextPersistenceFilter@2de366bb, org.springframework.security.web.header.HeaderWriterFilter@27e0f2f5, org.springframework.security.web.csrf.CsrfFilter@660e9100, org.springframework.security.web.authentication.logout.LogoutFilter@72c927f1, org.springframework.security.web.savedrequest.RequestCacheAwareFilter@61a002b1, org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter@780ec4a5, org.springframework.security.web.authentication.AnonymousAuthenticationFilter@5003041b, org.springframework.security.web.session.SessionManagementFilter@6db66836, org.springframework.security.web.access.ExceptionTranslationFilter@9cd25ff]

2023-11-10 15:54:36,165 INFO Exposing 1 endpoint(s) beneath base path '/actuator'

2023-11-10 15:54:36,204 INFO Tomcat started on port(s): 8848 (http) with context path '/nacos'

2023-11-10 15:54:36,236 INFO Nacos started successfully in stand alone mode. use embedded storage
```

### 配置修改

修改conf目录下的application.properties文件。

设置其中的nacos.core.auth.plugin.nacos.token.secret.key值，详情可查看鉴权-自定义密钥.

注意，文档中的默认值SecretKey012345678901234567890123456789012345678901234567890123456789和VGhpc0lzTXlDdXN0b21TZWNyZXRLZXkwMTIzNDU2Nzg=为公开默认值，可用于临时测试，实际使用时请务必更换为自定义的其他有效值。


# 服务注册&发现和配置管理

## 服务注册

```sh
curl -X POST "http://127.0.0.1:8848/nacos/v1/ns/instance?serviceName=nacos.naming.serviceName&ip=20.18.7.10&port=8080"
```

## 服务发现

```sh
curl -X GET "http://127.0.0.1:8848/nacos/v1/ns/instance/list?serviceName=nacos.naming.serviceName"
```

日志如下:

```json
{"name":"DEFAULT_GROUP@@nacos.naming.serviceName","groupName":"DEFAULT_GROUP","clusters":"","cacheMillis":10000,"hosts":[{"instanceId":"20.18.7.10#8080#DEFAULT#DEFAULT_GROUP@@nacos.naming.serviceName","ip":"20.18.7.10","port":8080,"weight":1.0,"healthy":true,"enabled":true,"ephemeral":true,"clusterName":"DEFAULT","serviceName":"DEFAULT_GROUP@@nacos.naming.serviceName","metadata":{},"ipDeleteTimeout":30000,"instanceHeartBeatTimeOut":15000,"instanceIdGenerator":"simple","instanceHeartBeatInterval":5000}],"lastRefTime":1699603088420,"checksum":"","allIPs":false,"reachProtectionThreshold":false,"valid":true}
```

## 发布配置

```sh
curl -X POST "http://127.0.0.1:8848/nacos/v1/cs/configs?dataId=nacos.cfg.dataId&group=test&content=HelloWorld"
```

## 获取配置

```sh
curl -X GET "http://127.0.0.1:8848/nacos/v1/cs/configs?dataId=nacos.cfg.dataId&group=test"
```

返回：

```
HelloWorld
```

# 6.关闭服务器

## Linux/Unix/Mac

```sh
sh shutdown.sh
```

## Windows

```sh
shutdown.cmd
```

或者双击shutdown.cmd运行文件。


# 参考资料

https://nacos.io/zh-cn/docs/v2/quickstart/quick-start.html

* any list
{:toc}