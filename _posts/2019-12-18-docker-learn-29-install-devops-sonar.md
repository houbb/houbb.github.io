---
layout: post
title: Docker learn-29-docker 安装 sonarQube with mysql
date:  2019-12-18 11:34:23 +0800
categories: [Devpos]
tags: [docker, devops, in-action, sh]
published: true
---

# sonarQube 

关于 sonarQube，以前学习过一次。

参见 [sonarQube 入门](https://houbb.github.io/2016/10/14/sonarQube)

# 安装 mysql

## 作用

安装sonarqube 使用mysql版本必须大于5.7，并且数据中心版本不支持mysql。

一旦所有SonarQube表都使用InnoDB引擎，首先要做的是使用innodb_buffer_pool_size参数为MySQL实例分配最大量的RAM，并为参数提供至少15Mb query_cache_size。

## 运行 

```
$   docker run -d -p 3306:3306 --name mysql-sonarqube -e "MYSQL_ROOT_PASSWORD=123456" mysql:5.7
```

我们直接下载 5.7 版本的 mysql

- 查看

```
docker ps -l
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                               NAMES
998057d73807        mysql:5.7           "docker-entrypoint.s…"   6 minutes ago       Up 6 minutes        0.0.0.0:3306->3306/tcp, 33060/tcp   mysql-sonarqube
```

## 配置 sonarqube 数据库

### 登录进入 mysql 

进入容器

```
$   docker exec -it mysql-sonarqube /bin/bash
```

登录 mysql

```
root@998057d73807:/# mysql -uroot -p
Enter password: 
```

### 配置 sonar 相关信息

```
mysql> CREATE DATABASE sonar CHARACTER SET utf8 COLLATE utf8_general_ci;
mysql> GRANT ALL ON sonar.* TO 'sonar'@'localhost' IDENTIFIED BY 'sonar';
mysql> GRANT ALL ON sonar.* TO 'sonar'@'%' IDENTIFIED BY 'sonar';
mysql> FLUSH PRIVILEGES;
```

# 安装 sonarQube

## 文件准备

- 创建文件

```
mkdir -p /opt/sonarqube
```

- 赋权

```
sudo chmod -R 777 /opt/sonarqube
```

## 运行镜像

```
docker run -d --name devops-sonarqube \
-p 9000:9000 \
-e sonar.web.context=/sonarqube \
-e sonar.jdbc.username=sonar \
-e sonar.jdbc.password=sonar \
-e "sonar.jdbc.url=jdbc:mysql://192.168.99.100:3306/sonar?useUnicode=true&characterEncoding=utf8&rewriteBatchedStatements=true&useConfigs=maxPerformance" \
-v /opt/sonarqube/conf:/opt/sonarqube/conf \
-v /opt/sonarqube/data:/opt/sonarqube/data \
-v /opt/sonarqube/logs:/opt/sonarqube/logs \
-v /opt/sonarqube/extensions:/opt/sonarqube/extensions \
sonarqube:7.6-community
```

主要是指定了一个 mysql 的连接信息。

- 状态查看

```
$ docker ps -l
CONTAINER ID        IMAGE                     COMMAND             CREATED             STATUS                      PORTS               NAMES
4f88e667241e        sonarqube:7.6-community   "./bin/run.sh"      30 seconds ago      Exited (0) 25 seconds ago                       devops-sonarqube
```

### 报错说明

```
$ docker logs -f devops-sonarqube
```

异常如下：

```
ERROR Unable to create file /opt/sonarqube/logs/es.log java.io.IOException: Permission denied
```

## 配置说明

使用环境变量SONARQUBE_JDBC_USERNAME，SONARQUBE_JDBC_PASSWORD并且SONARQUBE_JDBC_URL已弃用，并将在将来的版本中停止工作。

sonarqube_conf:/opt/sonarqube/conf：配置文件，例如 sonar.properties

sonarqube_data:/opt/sonarqube/data：数据文件，例如嵌入式H2数据库和Elasticsearch索引

sonarqube_logs:/opt/sonarqube/logs

sonarqube_extensions:/opt/sonarqube/extensions：插件，如语言分析器

### 挂载

sonarqube_conf:/opt/sonarqube/conf：配置文件，例如 sonar.properties

sonarqube_data:/opt/sonarqube/data：数据文件，例如嵌入式H2数据库和Elasticsearch索引

sonarqube_logs:/opt/sonarqube/logs

sonarqube_extensions:/opt/sonarqube/extensions：插件，如语言分析器

- 挂载参考：

```
docker run -d --name sonarqube
-p 9000:9000
-v /path/to/conf:/opt/sonarqube/conf
-v /path/to/data:/opt/sonarqube/data
-v /path/to/logs:/opt/sonarqube/logs
-v /path/to/extensions:/opt/sonarqube/extensions
sonarqube:7.6-community
```

### web 相关配置

如果要修改sonarqube web 访问的根路径需要配置参数

```
sonar.web.context=/sonarqube #将根路径修改为/sonarqube，默认的路径为/
```

其它配置参数：

```
sonar.web.host=192.0.0.1
sonar.web.port=80
sonar.web.context=/sonarqube
```

### 配置Elasticsearch存储路径

默认情况下，Elasticsearch数据存储在 `$SONARQUBE-HOME/data` 中，但不建议用于生产实例。

相反，您应该将此数据存储在其他位置，最好是在具有快速I/O的专用卷中。

除了保持可接受的性能之外，这样做还可以简化SonarQube的升级。

编辑 `$SONARQUBE-HOME/conf/sonar.properties` 以配置以下设置：

```
sonar.path.data=/var/sonarqube/data
sonar.path.temp=/var/sonarqube/temp
```

## 异常 

```
docker logs -f devops-sonarqube
```

可以看到异常日志：

```
ERROR Unable to create file /opt/sonarqube/logs/es.log java.io.IOException: Permission denied
```



## 登录访问

直接登录 [http://192.168.99.100:9000](http://192.168.99.100:9000)

# 拓展阅读

[Devops](https://houbb.github.io/2018/03/16/devops)

[Jenkins](https://houbb.github.io/2016/10/14/jenkins)

[Gitlab](https://houbb.github.io/2017/01/13/gitlab)

[Nexus](https://houbb.github.io/2016/08/06/Nexus)

## 更多学习



# 参考资料

[docker安装sonarqube](https://blog.csdn.net/u011659193/article/details/88761890)

* any list
{:toc}
