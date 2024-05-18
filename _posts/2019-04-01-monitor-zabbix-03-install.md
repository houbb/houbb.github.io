---
layout: post
title: Zabbix 监控系统-03-windows wls 安装  zabbix 实战
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, zabbix, sh]
published: true
---


# wsl

## docker

```sh
$ docker --version
Docker version 24.0.5, build ced0996
```

## 指定配置文件

### 3. 配置 Docker Compose 文件

在 WSL 的 Linux 环境中创建一个目录并创建 `docker-compose.yml` 文件：

```sh
mkdir zabbix-docker
cd zabbix-docker
nano docker-compose.yml
```

将以下内容粘贴到 `docker-compose.yml` 文件中：

```yaml
version: '3.5'
services:
  mysql:
    image: mysql:5.7
    environment:
      MYSQL_DATABASE: zabbix
      MYSQL_USER: zabbix
      MYSQL_PASSWORD: zabbix_pass
      MYSQL_ROOT_PASSWORD: root_pass
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

  zabbix-server:
    image: zabbix/zabbix-server-mysql:latest
    environment:
      DB_SERVER_HOST: mysql
      MYSQL_DATABASE: zabbix
      MYSQL_USER: zabbix
      MYSQL_PASSWORD: zabbix_pass
      MYSQL_ROOT_PASSWORD: root_pass
    depends_on:
      - mysql
    volumes:
      - zbx_db_data:/var/lib/zabbix
    ports:
      - "10051:10051"
    restart: unless-stopped

  zabbix-web:
    image: zabbix/zabbix-web-apache-mysql:latest
    environment:
      DB_SERVER_HOST: mysql
      MYSQL_DATABASE: zabbix
      MYSQL_USER: zabbix
      MYSQL_PASSWORD: zabbix_pass
      ZBX_SERVER_HOST: zabbix-server
    ports:
      - "8080:8080"
      - "8443:8443"
    depends_on:
      - zabbix-server
    restart: unless-stopped

  zabbix-agent:
    image: zabbix/zabbix-agent:latest
    environment:
      ZBX_SERVER_HOST: zabbix-server
    depends_on:
      - zabbix-server
    ports:
      - "10050:10050"
    restart: unless-stopped

volumes:
  mysql_data:
  zbx_db_data:
```

### 4. 启动 Zabbix

在 `docker-compose.yml` 文件所在的目录中运行以下命令来启动所有服务：

```sh
sudo docker-compose up -d
```

### 5. 找到 WSL 的 IP 地址

为了从 Windows 浏览器访问 Zabbix Web 界面，需要获取 WSL 的 IP 地址。在 WSL 中运行以下命令：

```sh
hostname -I
```

输出的 IP 地址类似于 `172.20.23.45`。

### 6. 在 Windows 浏览器中访问 Zabbix

在 Windows 浏览器中，访问 Zabbix Web 界面，URL 为 `http://<WSL_IP>:8080`，例如：

```
http://172.20.23.45:8080
```

### 7. 配置 Zabbix Web 界面

1. **数据库设置**：
   在第一次访问 Zabbix Web 界面时，需要配置数据库连接。使用以下设置：
   - Database type: MySQL
   - Database host: mysql
   - Database port: 3306
   - Database name: zabbix
   - User: zabbix
   - Password: zabbix_pass

2. **服务器详情**：
   配置 Zabbix Server 详情：
   - Server name: Zabbix server
   - Zabbix server details: zabbix-server

3. **完成安装**：
   检查并确认设置，完成安装。



# chat

## 如何 wls 安装

在 Windows 上使用 Windows Subsystem for Linux (WSL) 和 Docker 启动 Zabbix 后，可以通过以下步骤在 Windows 浏览器中访问 Zabbix Web 界面。

### 1. 安装 WSL 和 Docker

确保你的 Windows 系统上已安装并配置好 WSL 和 Docker。

- **安装 WSL**:
  1. 打开 PowerShell，以管理员身份运行以下命令以启用 WSL：

     ```sh
     wsl --install
     ```

  2. 安装完成后，重新启动计算机。

- **安装 Docker**:
  1. 下载并安装 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)。
  2. 安装过程中，确保启用 WSL 2 集成。

### 2. 启动 Docker

启动 Docker Desktop for Windows，并确保 Docker 使用 WSL 2 引擎。

### 3. 配置 Docker Compose 文件

在 WSL 的 Linux 环境中创建一个目录并创建 `docker-compose.yml` 文件：

```sh
mkdir zabbix-docker
cd zabbix-docker
nano docker-compose.yml
```

将以下内容粘贴到 `docker-compose.yml` 文件中：

```yaml
version: '3.5'
services:
  mysql:
    image: mysql:5.7
    environment:
      MYSQL_DATABASE: zabbix
      MYSQL_USER: zabbix
      MYSQL_PASSWORD: zabbix_pass
      MYSQL_ROOT_PASSWORD: root_pass
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

  zabbix-server:
    image: zabbix/zabbix-server-mysql:latest
    environment:
      DB_SERVER_HOST: mysql
      MYSQL_DATABASE: zabbix
      MYSQL_USER: zabbix
      MYSQL_PASSWORD: zabbix_pass
      MYSQL_ROOT_PASSWORD: root_pass
    depends_on:
      - mysql
    volumes:
      - zbx_db_data:/var/lib/zabbix
    ports:
      - "10051:10051"
    restart: unless-stopped

  zabbix-web:
    image: zabbix/zabbix-web-apache-mysql:latest
    environment:
      DB_SERVER_HOST: mysql
      MYSQL_DATABASE: zabbix
      MYSQL_USER: zabbix
      MYSQL_PASSWORD: zabbix_pass
      ZBX_SERVER_HOST: zabbix-server
    ports:
      - "8080:8080"
      - "8443:8443"
    depends_on:
      - zabbix-server
    restart: unless-stopped

  zabbix-agent:
    image: zabbix/zabbix-agent:latest
    environment:
      ZBX_SERVER_HOST: zabbix-server
    depends_on:
      - zabbix-server
    ports:
      - "10050:10050"
    restart: unless-stopped

volumes:
  mysql_data:
  zbx_db_data:
```

### 4. 启动 Zabbix

在 `docker-compose.yml` 文件所在的目录中运行以下命令来启动所有服务：

```sh
sudo docker-compose up -d
```

### 5. 找到 WSL 的 IP 地址

为了从 Windows 浏览器访问 Zabbix Web 界面，需要获取 WSL 的 IP 地址。在 WSL 中运行以下命令：

```sh
hostname -I
```

输出的 IP 地址类似于 `172.20.23.45`。

### 6. 在 Windows 浏览器中访问 Zabbix

在 Windows 浏览器中，访问 Zabbix Web 界面，URL 为 `http://<WSL_IP>:8080`，例如：

```
http://172.20.23.45:8080
```

### 7. 配置 Zabbix Web 界面

1. **数据库设置**：
   在第一次访问 Zabbix Web 界面时，需要配置数据库连接。使用以下设置：
   - Database type: MySQL
   - Database host: mysql
   - Database port: 3306
   - Database name: zabbix
   - User: zabbix
   - Password: zabbix_pass

2. **服务器详情**：
   配置 Zabbix Server 详情：
   - Server name: Zabbix server
   - Zabbix server details: zabbix-server

3. **完成安装**：
   检查并确认设置，完成安装。

### 总结

通过上述步骤，你可以在 Windows 系统上使用 WSL 和 Docker 启动 Zabbix，并通过 Windows 浏览器访问 Zabbix Web 界面。

此方法结合了 WSL 的灵活性和 Docker 的容器化优势，使得在 Windows 环境中部署 Zabbix 变得简单高效。

# 参考资料

https://www.zabbix.com/documentation/4.0/zh/manual/introduction/about

* any list
{:toc}