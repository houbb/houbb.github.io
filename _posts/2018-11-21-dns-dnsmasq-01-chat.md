---
layout: post
title: dnsmasq 简单介绍 linux ubuntu 安装笔记
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [web-server, dns, jmdns, sh]
published: true
---


# wsl 安装

在 Linux 终端中，运行以下命令以更新软件包列表和安装 Dnsmasq：

   ```
   sudo apt update
   sudo apt install dnsmasq
   ```

## 启动报错

安装报错：

```
Created symlink /etc/systemd/system/multi-user.target.wants/dnsmasq.service → /lib/systemd/system/dnsmasq.service.
Job for dnsmasq.service failed because the control process exited with error code.
See "systemctl status dnsmasq.service" and "journalctl -xeu dnsmasq.service" for details.
invoke-rc.d: initscript dnsmasq, action "start" failed.
× dnsmasq.service - dnsmasq - A lightweight DHCP and caching DNS server
     Loaded: loaded (/lib/systemd/system/dnsmasq.service; enabled; vendor preset: enabled)
     Active: failed (Result: exit-code) since Sun 2024-05-12 19:57:14 CST; 7ms ago
    Process: 10231 ExecStartPre=/etc/init.d/dnsmasq checkconfig (code=exited, status=0/SUCCESS)
    Process: 10239 ExecStart=/etc/init.d/dnsmasq systemd-exec (code=exited, status=2)

May 12 19:57:14 PC-20230404XHIO systemd[1]: Starting dnsmasq - A lightweight DHCP and caching DNS server...
May 12 19:57:14 PC-20230404XHIO dnsmasq[10239]: dnsmasq: failed to create listening socket for port 53: Address already in use
May 12 19:57:14 PC-20230404XHIO dnsmasq[10239]: failed to create listening socket for port 53: Address already in use
May 12 19:57:14 PC-20230404XHIO dnsmasq[10239]: FAILED to start up
May 12 19:57:14 PC-20230404XHIO systemd[1]: dnsmasq.service: Control process exited, code=exited, status=2/INVALIDARGUMENT
May 12 19:57:14 PC-20230404XHIO systemd[1]: dnsmasq.service: Failed with result 'exit-code'.
May 12 19:57:14 PC-20230404XHIO systemd[1]: Failed to start dnsmasq - A lightweight DHCP and caching DNS server.
Processing triggers for man-db (2.10.2-1) ...
Processing triggers for dbus (1.12.20-2ubuntu4.1) ...
```

查看端口占用：

```sh
netstat -tuln | grep :53
```

如下：

```
$ netstat -tuln | grep :53
tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN
udp        0      0 127.0.0.53:53           0.0.0.0:*
```

这个输出表明端口 53 的监听是由 systemd-resolved 进程占用的。systemd-resolved 是系统的 DNS 解析器和缓存服务，它默认监听在 127.0.0.53:53 上。

由于 Dnsmasq 也要监听端口 53 提供 DNS 服务，因此与 systemd-resolved 冲突了。解决方法之一是修改 Dnsmasq 的配置，让它监听其他端口，然后重启 Dnsmasq 服务。

### 修改配置

我们把这个配置释放出来

```
sudo vi /etc/dnsmasq.conf
```

```
# Listen on this specific port instead of the standard DNS port
# (53). Setting this to zero completely disables DNS function,
# leaving only DHCP and/or TFTP.
port=5353
```

重新启动 Dnsmasq 服务：修改配置文件后，执行以下命令重新启动 Dnsmasq 服务：

   ```
   sudo systemctl restart dnsmasq
   ```

### 确认状态

```
sudo systemctl status dnsmasq
```

如下，状态正常：

```
$ sudo systemctl status dnsmasq
● dnsmasq.service - dnsmasq - A lightweight DHCP and caching DNS server
     Loaded: loaded (/lib/systemd/system/dnsmasq.service; enabled; vendor preset: enabled)
     Active: active (running) since Sun 2024-05-12 20:03:41 CST; 43s ago
    Process: 11838 ExecStartPre=/etc/init.d/dnsmasq checkconfig (code=exited, status=0/SUCCESS)
    Process: 11846 ExecStart=/etc/init.d/dnsmasq systemd-exec (code=exited, status=0/SUCCESS)
    Process: 11855 ExecStartPost=/etc/init.d/dnsmasq systemd-start-resolvconf (code=exited, status=0/SUCCESS)
   Main PID: 11854 (dnsmasq)
      Tasks: 1 (limit: 19147)
     Memory: 952.0K
     CGroup: /system.slice/dnsmasq.service
             └─11854 /usr/sbin/dnsmasq -x /run/dnsmasq/dnsmasq.pid -u dnsmasq -7 /etc/dnsmasq.d,.dpkg-dist,.dpkg-old,.d>

May 12 20:03:41 PC-20230404XHIO systemd[1]: Starting dnsmasq - A lightweight DHCP and caching DNS server...
May 12 20:03:41 PC-20230404XHIO dnsmasq[11854]: started, version 2.90 cachesize 150
May 12 20:03:41 PC-20230404XHIO dnsmasq[11854]: DNS service limited to local subnets
May 12 20:03:41 PC-20230404XHIO dnsmasq[11854]: compile time options: IPv6 GNU-getopt DBus no-UBus i18n IDN2 DHCP DHCPv>
May 12 20:03:41 PC-20230404XHIO dnsmasq[11854]: reading /etc/resolv.conf
May 12 20:03:41 PC-20230404XHIO dnsmasq[11854]: using nameserver 172.23.224.1#53
May 12 20:03:41 PC-20230404XHIO dnsmasq[11854]: read /etc/hosts - 9 names
May 12 20:03:41 PC-20230404XHIO systemd[1]: Started dnsmasq - A lightweight DHCP and caching DNS server.
```

# 如何通过 dnsmasq 让访问 http://githubhoubb 的请求转发到 http://127.0.0.1:3000

是的，只用 Nginx 就可以实现将 `http://githubhoubb` 的 HTTP 请求转发到 `http://127.0.0.1:3000`。下面是详细的步骤，包括安装、配置和测试。

### 1. 安装 Nginx

首先，需要安装 Nginx。如果你的系统上还没有安装 Nginx，可以使用以下命令进行安装：

#### 在 Ubuntu 上：
```bash
sudo apt update
sudo apt install nginx
```

#### 在 CentOS 上：
```bash
sudo yum install epel-release
sudo yum install nginx
```

### 2. 配置 Nginx

接下来，需要配置 Nginx 来实现请求转发。可以通过修改 Nginx 的默认配置文件或创建一个新的配置文件来实现。

#### 编辑 Nginx 配置文件

创建或编辑一个配置文件，例如 `/etc/nginx/conf.d/githubhoubb.conf`：

```bash
sudo vi /etc/nginx/conf.d/githubhoubb.conf
```

在文件中添加以下内容：

```nginx
server {
    listen 80;
    server_name githubhoubb;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

这个配置会将所有发往 `githubhoubb` 的 HTTP 请求转发到 `http://127.0.0.1:3000`。

### 3. 测试和应用配置

保存配置文件后，测试 Nginx 配置以确保没有语法错误：

```bash
sudo nginx -t
```

如果测试通过，重启 Nginx 以应用新的配置：

```bash
sudo systemctl restart nginx
```

### 4. 更新主机文件（仅用于本地开发）

如果 `githubhoubb` 只是一个本地开发环境的域名，你需要在本地机器的 `/etc/hosts` 文件中添加一条记录，以便将 `githubhoubb` 解析到本地地址：

```bash
sudo nano /etc/hosts
```

添加以下内容：

```plaintext
127.0.0.1 githubhoubb
```

保存并关闭文件。

### 完成

现在，当你在浏览器中访问 `http://githubhoubb` 时，Nginx 会将请求转发到 `http://127.0.0.1:3000`。

### 注意事项

1. **域名解析**：在生产环境中，需要将域名 `githubhoubb` 解析到你的服务器 IP 地址。
2. **防火墙**：确保你的防火墙允许通过 80 端口的 HTTP 流量。
3. **权限**：确保 Nginx 有权限读取配置文件和访问相关目录。

通过这些步骤，只使用 Nginx 就可以实现 HTTP 请求的转发。


## 实际测试

```
$ curl http://githubhoubb
curl: (6) Could not resolve host: githubhoubb
```

## 一般公司内网域名到机器的映射都是如何实现的？



### 不修改，有其他方式吗？

如果你不想修改本地的 `/etc/hosts` 文件，还有几种方法可以实现域名到机器 IP 的映射：

### 1. 使用 Nginx 配置中的 `resolver` 指令

Nginx 允许在配置文件中使用 `resolver` 指令来指定 DNS 服务器，以解析后端服务器的域名。虽然这通常用于上游服务器的名称解析，但你可以尝试在配置中明确指定解析域名。

### 2. 使用 Docker 和 Docker Compose

如果你在使用 Docker，可以使用 Docker Compose 来定义服务，并在 Docker Compose 文件中设置别名。

### 3. 在应用程序中处理

在某些情况下，你可以在应用程序代码中处理域名解析。

### 4. 使用自定义 DNS 服务器

设置一个本地 DNS 服务器，并在其上添加自定义域名解析记录。

### 具体实现方法

#### 方法 1：使用 Nginx 配置中的 `resolver` 指令

虽然 Nginx 的 `resolver` 指令主要用于解析上游服务器的名称，但它并不直接解决你提到的问题。你仍然需要在某个地方指定域名和 IP 的映射。

#### 方法 2：使用 Docker 和 Docker Compose

如果你使用 Docker，可以通过 Docker Compose 文件实现服务之间的域名解析。以下是一个示例：

创建一个 `docker-compose.yml` 文件：

```yaml
version: '3'
services:
  web:
    image: nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
  app:
    image: your_app_image
    expose:
      - "3000"
```

在 Nginx 配置文件中（例如 `nginx.conf`），你可以使用服务名作为主机名：

```nginx
server {
    listen 80;
    server_name githubhoubb;

    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

在这种情况下，Docker Compose 会自动将 `app` 解析为对应的容器 IP。

#### 方法 3：在应用程序中处理

你可以在应用程序代码中显式地将 `githubhoubb` 映射到 `127.0.0.1`，具体方法取决于你使用的编程语言和框架。

#### 方法 4：使用自定义 DNS 服务器

设置本地 DNS 服务器，并在其中添加域名解析记录。例如，可以使用 `dnsmasq`：

1. 安装 `dnsmasq`：

   ```bash
   sudo apt-get install dnsmasq
   ```

2. 配置 `dnsmasq`：

   编辑 `/etc/dnsmasq.conf` 文件，添加以下内容：

   ```plaintext
   address=/githubhoubb/127.0.0.1
   ```

3. 重启 `dnsmasq`：

   ```bash
   sudo systemctl restart dnsmasq
   ```

4. 配置系统使用 `dnsmasq` 作为 DNS 服务器：

   编辑 `/etc/resolv.conf` 文件，添加以下内容：

   ```plaintext
   nameserver 127.0.0.1
   ```

### 总结

最简单和推荐的方式是在开发环境中修改 `/etc/hosts` 文件。

如果你无法修改该文件，可以使用 Docker 和 Docker Compose 来实现域名解析，或者设置一个本地 DNS 服务器（如 `dnsmasq`），这些方法都可以在不修改 `/etc/hosts` 文件的情况下实现域名到 IP 的映射。

## chat

要通过 `dnsmasq` 将对 `http://githubhoubb` 的请求转发到 `http://127.0.0.1:3000`，你需要进行以下几个步骤：

1. **安装和配置 `dnsmasq`**：
   
   首先，确保你已经安装了 `dnsmasq`。在大多数 Linux 发行版上，你可以使用包管理器来安装它。例如，在 Debian/Ubuntu 上：

   ```sh
   sudo apt-get install dnsmasq
   ```

2. **配置 `dnsmasq`**：

   编辑 `dnsmasq` 配置文件（通常是 `/etc/dnsmasq.conf`）。你需要添加一个条目来解析 `githubhoubb` 到 `127.0.0.1`。添加以下行：

   ```sh
   address=/githubhoubb/127.0.0.1
   ```

3. **配置 `/etc/hosts` 文件（可选）**：

   虽然 `dnsmasq` 已经可以处理域名解析，但为了确保本地解析一致，你可以在 `/etc/hosts` 文件中添加一行：

   ```sh
   127.0.0.1 githubhoubb
   ```

4. **重启 `dnsmasq` 服务**：

   在修改配置文件之后，重启 `dnsmasq` 服务以应用更改：

   ```sh
   sudo systemctl restart dnsmasq
   ```

5. **配置本地服务器**：

   确保你的本地服务器（在端口 `3000` 上运行的服务）正确地处理来自 `githubhoubb` 的请求。

6. **设置本地解析器**：

   如果 `dnsmasq` 没有默认用作你的 DNS 解析器，你需要更新你的网络设置以使用 `dnsmasq` 作为 DNS 服务器。通常这涉及到编辑 `/etc/resolv.conf` 文件或更新网络管理工具中的 DNS 设置。

   编辑 `/etc/resolv.conf`，添加一行指向本地主机：

   ```sh
   nameserver 127.0.0.1
   ```

   记住，如果你的系统使用网络管理器（如 `NetworkManager`），你可能需要在相应的配置界面中设置 DNS 服务器，而不是直接编辑 `/etc/resolv.conf`。

7. **使用反向代理（可选）**：

   如果你想确保 `http://githubhoubb` 重定向到 `http://127.0.0.1:3000`，你可能需要设置一个反向代理。
   
   你可以使用 Nginx 来实现这一点：

   安装 Nginx：

   ```sh
   sudo apt-get install nginx
   ```

   编辑 Nginx 配置文件，添加一个新的服务器块：

   ```sh
   server {
       listen 80;
       server_name githubhoubb;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   保存文件并重启 Nginx 服务：

   ```sh
   sudo systemctl restart nginx
   ```

通过上述步骤，访问 `http://githubhoubb` 的请求将被 DNS 解析为 `127.0.0.1` 并通过 Nginx 反向代理转发到 `http://127.0.0.1:3000`。

# chat

## 如何验证 dnsmasq 是否启动成功？


## 详细介绍下 dnsmasq

Dnsmasq 是一个轻量级的网络服务软件，主要用于提供 DNS 解析、DHCP 服务和网络引导等功能。

它被设计用于小型网络环境，如家庭网络、小型办公室网络或者嵌入式系统中。

下面是关于 Dnsmasq 的详细介绍：

### 1. DNS 解析服务：
Dnsmasq 提供了 DNS 服务器功能，能够解析主机名（如 example.com）到 IP 地址（如 192.168.1.1）。它可以在本地缓存 DNS 查询结果，以提高 DNS 查询的速度和效率。同时，它还可以从上游 DNS 服务器获取没有缓存的域名解析请求。

### 2. DHCP 服务：
Dnsmasq 还可以充当 DHCP 服务器，为网络中的设备分配 IP 地址、子网掩码、默认网关和 DNS 服务器等网络配置信息。这对于管理小型网络非常方便，例如家庭网络或小型办公室网络。

### 3. PXE 引导服务：
Dnsmasq 支持 PXE（Preboot Execution Environment）引导服务，可以帮助网络中的计算机通过网络引导启动操作系统安装程序或其他网络引导程序。

### 4. 轻量级和易配置：
Dnsmasq 是一个轻量级的软件，非常适合嵌入式系统和资源受限的环境。它的配置文件相对简单，易于理解和管理。用户可以通过编辑配置文件来定制 Dnsmasq 的行为，满足特定的需求。

### 5. 安全性和稳定性：
Dnsmasq 以其安全性和稳定性而闻名。它的设计简洁，代码库相对较小，因此更容易进行审计和维护。同时，它在多个操作系统上都有良好的支持，并且具有广泛的用户群体，从而保证了软件的稳定性和可靠性。

### 6. 多平台支持：
Dnsmasq 可以运行在多种操作系统上，包括 Linux、Unix、macOS 和 Windows 等。这使得它成为一个通用的解决方案，可以在不同的环境中使用和部署。

总的来说，Dnsmasq 是一个功能强大、灵活易用的网络服务软件，适用于小型网络环境和资源受限的设备。它的简洁性、可靠性和多平台支持使得它成为了许多网络管理员和系统管理员的首选工具之一。

## windows 下如何安装 Dnsmasq

在 Windows 系统上安装 Dnsmasq 可能不像在 Linux 或 macOS 等操作系统上那么直接，因为 Dnsmasq 主要是针对类 Unix 系统设计的。但是你可以通过使用 WSL（Windows Subsystem for Linux）来在 Windows 上安装和运行 Dnsmasq。下面是在 Windows 上使用 WSL 安装 Dnsmasq 的步骤：

### 步骤一：安装 WSL
1. 打开 PowerShell 作为管理员。
2. 运行以下命令以启用 WSL：
   ```
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   ```
3. 重新启动计算机。

### 步骤二：安装 Linux 发行版
1. 打开 Microsoft Store。
2. 搜索并选择一个你喜欢的 Linux 发行版（如 Ubuntu、Debian 等）。
3. 安装所选的 Linux 发行版。

### 步骤三：配置和安装 Dnsmasq
1. 打开已安装的 Linux 发行版。
2. 在 Linux 终端中，运行以下命令以更新软件包列表和安装 Dnsmasq：
   ```
   sudo apt update
   sudo apt install dnsmasq
   ```
3. 安装完成后，你可以编辑 Dnsmasq 的配置文件 `/etc/dnsmasq.conf`，根据你的需求配置 DNS 解析和 DHCP 服务等功能。

### 步骤四：启动和管理 Dnsmasq
1. 在 Linux 终端中，你可以使用以下命令来启动、停止和重新加载 Dnsmasq 服务：
   - 启动 Dnsmasq 服务：
     ```
     sudo systemctl start dnsmasq
     ```
   - 停止 Dnsmasq 服务：
     ```
     sudo systemctl stop dnsmasq
     ```
   - 重新加载配置：
     ```
     sudo systemctl reload dnsmasq
     ```

通过上述步骤，在 Windows 上通过 WSL 安装和配置 Dnsmasq 应该是可行的。记得在配置 Dnsmasq 之后，可以通过修改 Windows 的 DNS 设置来将本地 DNS 请求重定向到 Dnsmasq。

## 启动失败如下解决

这个错误信息表明 Dnsmasq 无法启动，因为端口 53 已经被占用。端口 53 是 DNS 服务的默认端口，通常是由其他 DNS 服务或者已经运行的 Dnsmasq 实例占用了。

要解决这个问题，你可以执行以下步骤：

1. **检查端口占用情况：**你可以使用 `netstat` 命令或者类似的工具来查看哪个程序占用了端口 53。在 Linux 终端中运行以下命令：
   ```
   sudo netstat -tuln | grep :53
   ```
   这将列出所有占用了端口 53 的程序及其进程 ID。

2. **关闭占用端口 53 的程序：**如果端口 53 已经被其他程序占用，你可以关闭或者停止该程序，或者更改 Dnsmasq 的配置来使用其他端口。

3. **修改 Dnsmasq 配置：**如果你决定让 Dnsmasq 使用其他端口，你需要编辑 Dnsmasq 的配置文件 `/etc/dnsmasq.conf`，找到 `port=53` 的配置项，将其修改为其他未被占用的端口，然后重新启动 Dnsmasq 服务。

4. **重新启动 Dnsmasq 服务：**修改配置文件后，执行以下命令重新启动 Dnsmasq 服务：
   ```
   sudo systemctl restart dnsmasq
   ```

通过上述步骤，你应该能够解决 Dnsmasq 启动失败的问题。确保端口冲突得到解决后，Dnsmasq 应该能够正常启动并提供 DNS 解析和 DHCP 服务。

这个输出表明端口 53 的监听是由 systemd-resolved 进程占用的。systemd-resolved 是系统的 DNS 解析器和缓存服务，它默认监听在 127.0.0.53:53 上。

由于 Dnsmasq 也要监听端口 53 提供 DNS 服务，因此与 systemd-resolved 冲突了。解决方法之一是修改 Dnsmasq 的配置，让它监听其他端口，然后重启 Dnsmasq 服务。

你可以按照以下步骤进行操作：

1. 编辑 Dnsmasq 的配置文件 `/etc/dnsmasq.conf`。

2. 找到 `port=53` 的配置项，将其修改为其他未被占用的端口，例如 `port=5353`。

3. 保存并退出配置文件。

4. 重新启动 Dnsmasq 服务：
   ```
   sudo systemctl restart dnsmasq
   ```

这样就避免了端口冲突，Dnsmasq 应该能够正常启动并提供 DNS 解析和 DHCP 服务。

# 参考资料

https://github.com/jmdns/jmdns/blob/main/README.md

* any list
{:toc}



