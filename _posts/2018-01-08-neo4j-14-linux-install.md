---
layout: post
title:  Neo4j-14-linux install linux 环境如何安装 neo4j, linux 安装 jdk
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j, go, go-lang]
published: true
---

# 前言

真正的安装记录这里就不记录了。

neo4j 依赖 java，所以需要先配置 jdk。

## linux 安装 jdk

> [CentOS7 安装 jdk8 笔记](https://houbb.github.io/2021/08/02/centos7-07-jdk)

# chat

## Q1: linux 如何安装 neo4j

要在Linux上安装Neo4j，可以按照以下步骤进行操作。

请注意，这里提供的步骤可能会随Neo4j的版本而变化，建议查看官方文档以获取最新信息。

1. **下载Neo4j：** 打开 [Neo4j 下载页面](https://neo4j.com/download/)，选择适合你系统的版本。通常，你可以选择Community Edition。

2. **下载命令：** 通过命令行或终端窗口使用 `wget` 或 `curl` 下载Neo4j。例如：

    ```bash
    wget https://neo4j.com/artifact.php?name=neo4j-community-<version>-unix.tar.gz
    ```

    或者使用 `curl`：

    ```bash
    curl -O https://neo4j.com/artifact.php?name=neo4j-community-<version>-unix.tar.gz
    ```

    请注意， `<version>` 是你想要下载的Neo4j版本号。

3. **解压文件：** 使用以下命令解压下载的文件：

    ```bash
    tar -xvzf neo4j-community-<version>-unix.tar.gz
    ```

4. **移动文件：** 将解压得到的文件夹移动到一个合适的位置，例如 `/opt` 目录：

    ```bash
    sudo mv neo4j-community-<version> /opt/neo4j
    ```

5. **配置Neo4j：** 进入Neo4j安装目录并编辑 `conf/neo4j.conf` 文件以配置Neo4j。你可能需要修改数据库的位置、监听地址等。例如：

    ```bash
    cd /opt/neo4j/conf
    sudo nano neo4j.conf
    ```

6. **启动Neo4j：** 使用以下命令启动Neo4j：

    ```bash
    cd /opt/neo4j
    sudo bin/neo4j start
    ```

    这将启动Neo4j服务器。你可以通过访问 `http://localhost:7474` 来使用Neo4j的Web界面。

7. **访问Web界面：** 打开浏览器，输入 `http://localhost:7474`，然后按照提示进行初始设置。默认用户名为 `neo4j`，密码为 `neo4j`。首次登录时系统会要求你更改密码。

请注意，这只是一个基本安装过程的概述。具体的步骤可能会根据你的系统和Neo4j版本而有所不同。在安装之前，请务必查阅 [Neo4j 官方文档](https://neo4j.com/docs/) 以获取最新和详细的信息。



## linux 的下载地址

> [https://neo4j.com/artifact.php?name=neo4j-desktop-offline-1.5.9-x86_64.AppImage](https://neo4j.com/artifact.php?name=neo4j-desktop-offline-1.5.9-x86_64.AppImage)

# 如何修改 neo4j 的账户名密码？

要修改Neo4j数据库的账户名和密码，可以使用Neo4j的命令行工具或通过Web界面进行操作。

以下是两种方法：

### 方法一：通过 Neo4j 命令行工具

1. **停止 Neo4j 服务：**
   
    ```bash
    sudo neo4j stop
    ```

2. **使用 `neo4j-admin` 工具更改密码：**

    ```bash
    sudo neo4j-admin set-initial-password <new-password>
    ```

    请用你想要的新密码替换 `<new-password>`。

3. **启动 Neo4j 服务：**

    ```bash
    sudo neo4j start
    ```

### 方法二：通过 Neo4j Web 界面

1. 打开浏览器，访问 Neo4j 的 Web 界面，默认地址是 `http://localhost:7474`。

2. 使用默认账户名 `neo4j` 和初始密码 `neo4j` 登录。

3. 第一次登录时，系统会提示你更改密码。输入当前密码 `neo4j`，然后输入你想要的新密码。

4. 如果已经登录，你也可以通过点击右上角的用户名，选择 "Change Password" 来修改密码。

无论使用哪种方法，都请确保在修改密码后，你的应用程序或脚本中也更新了连接数据库所需的新密码。

### 方法三：通过 cypher-shell 修改密码

在Neo4j 4.1.1 版本及更高版本中，你可以使用 `cypher-shell` 工具来初始化密码。

注意：这个密码只会让你确认输入一次，所以最好先保存原始密码，复制过去。

以下是在命令行中执行的步骤：

1. 打开命令行终端。

2. 使用以下命令连接到 Neo4j 数据库（默认情况下，Neo4j数据库在本地运行并监听 `bolt://localhost:7687`）：

    ```bash
    cypher-shell -u neo4j -p your_current_password
    ```

    请用当前的密码替换 `your_current_password`。

3. 连接成功后，使用以下命令修改密码：

    ```cypher
    ALTER USER neo4j SET PASSWORD 'your_new_password';
    ```

    请用你希望设置的新密码替换 `your_new_password`。

4. 如果需要，可以退出 `cypher-shell`：

    ```cypher
    :exit
    ```

    然后，你可以使用新密码重新连接数据库。

请确保在修改密码后更新你的应用程序或脚本中的连接信息，以使用新的密码进行连接。

# 小结


# 参考资料

chat

* any list
{:toc}

