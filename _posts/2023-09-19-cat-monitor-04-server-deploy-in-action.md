---
layout: post
title: cat monitor-04-cat 服务端部署实战
date: 2023-09-19 21:01:55 +0800
categories: [Monitor]
tags: [monitor, sh]
published: true
---


# 服务端部署方式

[https://github.com/dianping/cat/wiki/readme_server](https://github.com/dianping/cat/wiki/readme_server) 官方文档中很详细，我们实际操作一下。

为了简单，这里采用 docker 部署的方式。

## 大致步骤

1. 从 github 上下载完整源码
2. 将 docker/docker-compose.yml 文件中的汉字都删除, 否则之后的 docker-compose up 命令会报错.
3. 运行 docker-compose up 命令, 该命令将完成:
    (1)cat docker 容器镜像的编译
    (2)mysql 镜像下载,
    (3) 启动 mysql 容器和 cat 容器.
4. 第一次运行以后,数据库中没有表结构,需要通过下面的命令创建表

```
docker exec <container_id> bash -c "mysql -uroot -Dcat < /init.sql"
```

说明：`<container_id>` 需要替换为 cat 容器的真实 id. 通过 docker ps 可以查看到 mysql 容器 id

## 1. 下载源码

```
git clone --depth=1 https://github.com/dianping/cat.git
```

项目目录结构如下：

```
    目录: D:\github\cat


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         2023/9/19     16:28                .github
d-----         2023/9/19     16:28                cat-alarm
d-----         2023/9/19     16:28                cat-client
d-----         2023/9/19     16:28                cat-consumer
d-----         2023/9/19     16:28                cat-core
d-----         2023/9/19     16:28                cat-hadoop
d-----         2023/9/19     16:28                cat-home
d-----         2023/9/19     16:28                docker
d-----         2023/9/19     16:28                helm
d-----         2023/9/19     16:28                integration
d-----         2023/9/19     16:28                lib
d-----         2023/9/19     16:28                script
-a----         2023/9/19     16:28             88 .gitattributes
-a----         2023/9/19     16:28            549 .gitignore
-a----         2023/9/19     16:28             99 .gitmodules
-a----         2023/9/19     16:28           2312 .travis.yml
-a----         2023/9/19     16:28          31175 java_formatter.xml
-a----         2023/9/19     16:28          11560 LICENSE
-a----         2023/9/19     16:28           1430 NOTICE.txt
-a----         2023/9/19     16:28          12495 pom.xml
-a----         2023/9/19     16:28           5888 README.md
-a----         2023/9/19     16:28            567 SECURITY.md
```

## 2. 运行

运行下面的命令：

```
cd docker
docker-compose up
```

`docker-compose up` 是一个命令，用于启动根据 `docker-compose.yml` 文件定义的服务。

```
PS D:\github\cat\docker> docker-compose up
[+] Running 23/23
 ✔ mysql 11 layers [⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿]      0B/0B      Pulled                                                                                              275.4s
   ✔ 4be315f6562f Pull complete                                                                                                                      120.6s
   ✔ 96e2eb237a1b Pull complete                                                                                                                       78.0s
   ✔ 8aa3ac85066b Pull complete                                                                                                                       86.6s
   ✔ ac7e524f6c89 Pull complete                                                                                                                       91.8s
   ✔ f6a88631064f Pull complete                                                                                                                       95.1s
   ✔ 15bb3ec3ff50 Pull complete                                                                                                                      129.1s
   ✔ ae65dc337dcb Pull complete                                                                                                                      124.2s
   ✔ 291c7612f7a8 Pull complete                                                                                                                      127.5s
   ✔ ffdc84226e0b Pull complete                                                                                                                      264.4s
   ✔ 81340df4a52c Pull complete                                                                                                                      132.4s
   ✔ f3ec63f52b87 Pull complete                                                                                                                      138.6s
 ✔ cat 10 layers [⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿]      0B/0B      Pulled                                                                                                 205.6s
   ✔ e7c96db7181b Pull complete                                                                                                                        9.3s
   ✔ f910a506b6cb Pull complete                                                                                                                        3.5s
   ✔ b6abafe80f63 Pull complete                                                                                                                       76.4s
   ✔ d8c966ddef98 Pull complete                                                                                                                        7.9s
   ✔ 07e652475ee6 Pull complete                                                                                                                       37.2s
   ✔ c42103cfa50f Pull complete                                                                                                                       12.7s
   ✔ 699c76f581ed Pull complete                                                                                                                      198.3s
   ✔ 2196458bf012 Pull complete                                                                                                                       41.4s
   ✔ bc2a2788dd3c Pull complete                                                                                                                       47.6s
   ✔ 73821b5409c7 Pull complete                                                                                                                       52.5s
[+] Running 3/3
 ✔ Network docker_cat   Created                                                                                                                        0.1s
 ✔ Container cat-mysql  Created                                                                                                                        0.4s
 ✔ Container cat        Created                                                                                                                        0.1s
Attaching to cat, cat-mysql
Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:3306 -> 0.0.0.0:0: listen tcp 0.0.0.0:3306: bind: Only one usage of each socket address (protocol/network address/port) is normally permitted.
```

### 3306 端口占用

```
Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:3306 -> 0.0.0.0:0: listen tcp 0.0.0.0:3306: bind: Only one usage of each socket address (protocol/network address/port) is normally permitted.
```

这是因为我本地启用了 mysql 服务。

直接在【服务】中直接把 mysql 服务停止，或者把命令端口关闭。

### 2280 端口占用

重新启动。

```
PS D:\github\cat\docker> docker-compose up
Attaching to cat, cat-mysql
cat-mysql  | 2023-09-19 08:57:56+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 5.7.37-1debian10 started.
Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:2280 -> 0.0.0.0:0: listen tcp 0.0.0.0:2280: bind: An attempt was made to access a socket in a way forbidden by its access permissions.
```

- 找到端口占用

```
netstat -ano | findstr "2280"
```

发现端口没有占用。

- 解决方法，重启 winnnat

解决需要先关闭Windows NAT服务，通过管理员权限处理。

```
net stop winnat
net start winnat
```

并且关闭 docker ps 中启动到一半的服务。

### 正常启动日志

```
cat        | 19-Sep-2023 17:07:38.824 INFO [main] org.apache.coyote.AbstractProtocol.start Starting ProtocolHandler ["http-nio-8080"]
cat        | 19-Sep-2023 17:07:38.837 INFO [main] org.apache.coyote.AbstractProtocol.start Starting ProtocolHandler ["ajp-nio-8009"]
cat        | 19-Sep-2023 17:07:38.850 INFO [main] org.apache.catalina.startup.Catalina.start Server startup in 8535 ms
cat        | [INFO] Working directory is /usr/local/tomcat
cat        | [INFO] War root is /usr/local/tomcat/webapps/cat
```

对应的镜像

```
docker ps
CONTAINER ID   IMAGE                  COMMAND                   CREATED          STATUS          PORTS                                            NAMES
4bc4c62686ec   meituaninc/cat:3.0.1   "/bin/sh -c './datas…"   29 minutes ago   Up 25 seconds   0.0.0.0:2280->2280/tcp, 0.0.0.0:8080->8080/tcp   cat
e2f963deb044   mysql:5.7.37           "docker-entrypoint.s…"   29 minutes ago   Up 26 seconds   0.0.0.0:3306->3306/tcp, 33060/tcp                cat-mysql
```

## 3. mysql 脚本初始化

### 操作说明

第一次运行以后,数据库中没有表结构,需要通过下面的命令创建表

```
docker exec <container_id> bash -c "mysql -uroot -Dcat < /init.sql"
```

说明：`<container_id>` 需要替换为容器的真实id。通过 docker ps 可以查看到mysql容器id

### 实际记录

```sh
docker exec e2f963deb044 bash -c "mysql -uroot -Dcat < /init.sql"
```

- 命令解释 `mysql -uroot -Dcat < /init.sql`

这是一个 MySQL 命令的示例，它执行以下操作：

1. `mysql`：这是 MySQL 数据库的命令行客户端工具，用于与 MySQL 服务器交互。

2. `-uroot`：这是一个命令行选项，用于指定登录 MySQL 数据库的用户名。在这个示例中，用户名是 `root`，这意味着使用 root 用户身份登录。

3. `-Dcat`：这是另一个命令行选项，用于指定要连接到的数据库的名称。在这个示例中，数据库名称是 `cat`，意味着连接到名为 `cat` 的数据库。

4. `< /init.sql`：这是一个输入重定向操作符 (`<`)，它将文件 `/init.sql` 的内容输入到 `mysql` 命令中。`/init.sql` 文件通常包含一系列 SQL 命令，用于初始化或导入数据到指定的数据库。在这个示例中，`mysql` 命令将执行 `/init.sql` 文件中的 SQL 命令。

综合起来，这个命令的作用是使用 MySQL 数据库的 root 用户身份连接到名为 `cat` 的数据库，并执行 `/init.sql` 文件中包含的 SQL 命令。

这通常用于在数据库中创建表格、插入数据或执行其他数据库操作。


### 文件不存在 & 虚拟终端交互

执行时，发现 `init.sql` 文件不存在。

那么，是新版本的文件变化了吗？还是已经默认执行好了？

```
docker exec -it e2f963deb044 bash
```

然后进入 mysql

```
mysql -uroot
```

可以空密码直接进入，发现表已经初始化好了。官方文档没有及时更新而已。

```
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| cat                |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.04 sec)

mysql> show tables;
+------------------------+
| Tables_in_cat          |
+------------------------+
| alert                  |
| alert_summary          |
| alteration             |
| baseline               |
| businessReport         |
| business_config        |
| config                 |
| config_modification    |
| daily_report_content   |
| dailyreport            |
| hostinfo               |
| hourly_report_content  |
| hourlyreport           |
| metric_graph           |
| metric_screen          |
| monthly_report_content |
| monthreport            |
| operation              |
| overload               |
| project                |
| server_alarm_rule      |
| task                   |
| topologyGraph          |
| user_define_rule       |
| weekly_report_content  |
| weeklyreport           |
+------------------------+
26 rows in set (0.00 sec)
```

## 4. 访问验证:

构建后 直接访问

[http://127.0.0.1:8080/cat/](http://127.0.0.1:8080/cat/)

3.0 版本默认密码: admin/admin
2.0 版本密码: catadmin/catadmin

页面效果如下：

![页面效果](https://img-blog.csdnimg.cn/685ce9433f3a44909ad4d457d0b50de4.png#pic_center)

进入【服务端配置】页面修改IP地址

链接地址：http://127.0.0.1:8080/cat/s/config?op=serverConfigUpdate

# 拓展阅读

## Q1-docker 命令，docker-compose up

`docker` 和 `docker-compose` 是用于容器化应用程序的两个常用工具，它们可以帮助您创建、运行和管理容器化的应用程序。

以下是关于这两个工具的简要说明：

1. **docker 命令**：

   `docker` 是用于管理容器的命令行工具。以下是一些常用的 `docker` 命令：

   - `docker run <options> <image>`：运行一个容器，可以使用不同的选项来配置容器的行为。
   - `docker build <options> <path/to/Dockerfile>`：根据 Dockerfile 构建一个新的镜像。
   - `docker ps`：列出正在运行的容器。
   - `docker images`：列出本地可用的镜像。
   - `docker stop <container_id>`：停止一个运行中的容器。
   - `docker rm <container_id>`：删除一个停止的容器。
   - `docker rmi <image_id>`：删除一个本地的镜像。

2. **docker-compose up**：

   `docker-compose` 是一个用于定义和管理多容器应用的工具。通常，它使用一个 `docker-compose.yml` 文件来定义应用程序的组件、服务和配置。
   
   `docker-compose up` 是一个命令，用于启动根据 `docker-compose.yml` 文件定义的服务。
   
   例如，如果您有一个包含多个容器的应用程序，并且在 `docker-compose.yml` 文件中定义了这些容器的配置，您可以使用以下命令启动它们：

   ```bash
   docker-compose up
   ```

   这将会启动所有在 `docker-compose.yml` 文件中定义的服务，并将它们连接在一起，以构建完整的应用程序。
   
   通常，`docker-compose` 还支持其他命令，如 `docker-compose down`（停止并删除服务）和 `docker-compose ps`（查看服务状态）等。

总之，`docker` 用于单个容器的管理，而 `docker-compose` 用于多容器应用程序的定义和管理。

当您需要管理多个相关联的容器时，`docker-compose` 是一个非常有用的工具。

## Q2-docker 命令 docker exec container_id bash -c

`docker exec` 命令用于在正在运行的 Docker 容器内执行命令。

以下是该命令的基本语法：

```bash
docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
```

- `OPTIONS`：可以包括一些选项，例如 `-it` 用于分配一个伪终端并保持交互性。
- `CONTAINER`：指定要在其中执行命令的容器的名称或 ID。
- `COMMAND`：要在容器内执行的命令。
- `ARG`：可选的命令参数，可以跟随在 `COMMAND` 后面。

您提到的命令 `docker exec <container_id> bash -c` 的作用是在指定的容器内启动一个 Bash shell 并在其中运行一个命令（通过 `-c` 参数指定）。

这通常用于进入容器并执行一些特定的操作或调试。

例如，如果要进入名为 `my_container` 的容器并执行一个命令，可以使用以下命令：

```bash
docker exec -it my_container bash -c "ls /app"
```

这将在 `my_container` 中启动一个 Bash shell，然后运行 `ls /app` 命令以列出容器内 `/app` 目录的内容。 

`-it` 选项用于分配一个交互式的伪终端，允许您与容器进行交互。

# 参考资料

https://github.com/dianping/cat/wiki/readme_server

https://github.com/dianping/cat/wiki/readme_client

https://www.lmlphp.com/user/59731/article/item/1461653/

http://wed.xjx100.cn/news/231808.html?action=onClick

https://stackoverflow.com/questions/70797971/docker-error-response-from-daemon-ports-are-not-available-listen-tcp-0-0-0-0

[docker启动容器，端口被占用：An attempt was made to access a socket in a way forbidden by its access permissions](https://blog.csdn.net/xiaoxiao_ziteng/article/details/123988145)

* any list
{:toc}