---
layout: post
title: 开源监控利器之 netdata-03-windows10 WSL 安装实战
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, api, opensource, sf]
published: true
---


# netdata

Netdata 是一个开源的、实时的系统监控工具，旨在提供对系统、应用程序和服务的全面监控。

它具有直观的Web界面，能够实时显示各种系统指标，如CPU使用率、内存使用情况、磁盘活动、网络流量等。

# windows WSL 安装

是的，你可以直接通过 `apt` 命令在 Ubuntu 上安装 Netdata，但这需要确保你的系统使用了合适的软件源。在某些情况下，Ubuntu 的默认软件源中提供的 Netdata 版本可能不是最新的，或者没有包含所有功能。如果你需要最新版本的 Netdata，建议使用官方安装脚本。

如果你想通过 `apt` 安装 Netdata，可以按照以下步骤：

### 使用 `apt` 安装 Netdata

1. 更新 apt 包索引：
   ```bash
   sudo apt update
   ```

2. 安装 Netdata：
   直接通过 `apt` 安装 Netdata：
   ```bash
   sudo apt install netdata
   ```

3. 启动 Netdata：
   安装完成后，Netdata 通常会自动启动。如果没有启动，你可以手动启动它：
   ```bash
   sudo systemctl start netdata
   ```

4. 检查 Netdata 状态：
   使用以下命令来检查 Netdata 是否正在运行：
   ```bash
   sudo systemctl status netdata
   ```

   最终的启动日志如下：

   ```
   ● netdata.service - netdata - Real-time performance monitoring
     Loaded: loaded (/lib/systemd/system/netdata.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2024-12-11 10:16:32 CST; 17s ago
       Docs: man:netdata
             file:///usr/share/doc/netdata/html/index.html
             https://github.com/netdata/netdata
   Main PID: 1701 (netdata)
      Tasks: 33 (limit: 9361)
     Memory: 93.5M
     CGroup: /system.slice/netdata.service
             ├─1701 /usr/sbin/netdata -D
             ├─1703 /usr/sbin/netdata --special-spawn-server
             ├─1947 /usr/lib/netdata/plugins.d/apps.plugin 1
             ├─1949 /usr/lib/netdata/plugins.d/nfacct.plugin 1
             ├─1950 bash /usr/lib/netdata/plugins.d/tc-qos-helper.sh 1
             └─1954 /usr/bin/python3 /usr/lib/netdata/plugins.d/python.d.plugin 1

Dec 11 10:16:32 d systemd[1]: Started netdata - Real-time performance monitoring.
Dec 11 10:16:32 d netdata[1701]: CONFIG: cannot load cloud config '/var/lib/netdata/cloud.d/cloud.conf'. Running with i>
Dec 11 10:16:32 d netdata[1701]: 2024-12-11 10:16:32: netdata INFO  : MAIN : CONFIG: cannot load cloud config '/var/lib>
Dec 11 10:16:32 d netdata[1701]: 2024-12-11 10:16:32: netdata INFO  : MAIN : Found 0 legacy dbengines, setting multidb >
Dec 11 10:16:32 d netdata[1701]: 2024-12-11 10:16:32: netdata INFO  : MAIN : Created file '/var/lib/netdata/dbengine_mu>
Dec 11 10:16:32 d netdata[1701]: Found 0 legacy dbengines, setting multidb diskspace to 256MB
Dec 11 10:16:32 d netdata[1701]: Created file '/var/lib/netdata/dbengine_multihost_size' to store the computed value
   ```

5. 访问 Netdata Web 界面：
   在浏览器中访问 `http://localhost:19999` 来查看 Netdata 的监控界面。

   如果你在 WSL 中安装 Netdata，可以使用 WSL 分配的 IP 地址来访问：
   ```bash
   http://<wsl-ip>:19999
   ```

   页面效果看起来还是很酷炫的。

   ![页面效果](https://gitee.com/houbinbin/imgbed/raw/master/img/%E7%BB%93%E6%9E%9C%E5%A4%84%E7%90%86.png)

### 使用 `apt` 安装的注意事项

- 版本问题：如果你需要最新版本的 Netdata，可能需要使用官方安装脚本，因为 `apt` 中的版本可能会稍显过时。官方安装脚本会提供最新的稳定版本，包含所有最新的功能和修复。

- 依赖问题：如果你通过 `apt` 安装时遇到任何依赖性问题，确保你已经安装了所有必需的依赖项。

- 自动启动：安装完成后，Netdata 通常会设置为自动启动。如果你想确保 Netdata 在每次启动时自动运行，可以使用：
  ```bash
  sudo systemctl enable netdata
  ```

# 启用之后的操作

在 Netdata 服务启动后，你可以通过 `systemctl` 命令来控制 Netdata 服务的启动、暂停和查看状态。

以下是常见的操作：

### 1. 启动 Netdata 服务
   如果 Netdata 服务没有自动启动，或者你需要手动启动它，可以使用以下命令：
   ```bash
   sudo systemctl start netdata
   ```

### 2. 暂停 Netdata 服务
   如果你想暂停或停止 Netdata 服务，可以使用：
   ```bash
   sudo systemctl stop netdata
   ```

### 3. 重启 Netdata 服务
   如果你对 Netdata 的配置进行了修改，或者需要重启服务来应用新配置，可以使用：
   ```bash
   sudo systemctl restart netdata
   ```

### 4. 查看 Netdata 服务状态
   要查看 Netdata 服务的当前状态（是否运行、是否启用等），使用以下命令：
   ```bash
   sudo systemctl status netdata
   ```

### 5. 启用/禁用服务开机启动

   - 启用开机启动：如果你想让 Netdata 在系统启动时自动启动，可以使用：
     ```bash
     sudo systemctl enable netdata
     ```
   - 禁用开机启动：如果你不希望 Netdata 自动启动，可以使用：
     ```bash
     sudo systemctl disable netdata
     ```

### 6. 查看所有服务的状态
   如果你想查看所有正在运行的服务，可以使用：
   ```bash
   sudo systemctl list-units --type=service
   ```

   这将列出所有正在运行的服务，包括 Netdata。


# 如果我的机器无法联网，有压缩包的安装版本吗？（离线安装-未验证）

是的，Netdata 提供了 离线安装 的方式，适合那些无法联网的环境。

你可以下载 Netdata 的压缩包，在有互联网连接的机器上下载并将其转移到目标机器上进行安装。

### 离线安装步骤

1. 下载 Netdata 压缩包

   你可以在有互联网连接的机器上访问 Netdata 的 GitHub 发布页面，下载适合的安装包：
   
   - Netdata GitHub 发布页面：  
     [https://github.com/netdata/netdata/releases](https://github.com/netdata/netdata/releases)
   
   - 从页面中选择适合你的操作系统和架构的版本下载。例如，你可以下载 `.tar.gz` 或 `.tar.xz` 格式的压缩包。
   
   例如，下载 `netdata-x.x.x-x.tar.gz` 压缩包（替换 `x.x.x-x` 为实际的版本号）。

2. 将压缩包传输到目标机器

   使用 USB 驱动器、SCP（如果有局域网连接）或其他方式，将下载好的压缩包传输到目标 Linux 机器。

3. 解压压缩包并安装

   在目标机器上，打开终端并执行以下步骤：
   
   - 解压压缩包：
     ```bash
     tar -xzvf netdata-x.x.x-x.tar.gz
     ```
     这将解压出一个名为 `netdata-x.x.x-x` 的文件夹。
   
   - 进入解压后的目录：
     ```bash
     cd netdata-x.x.x-x
     ```

4. 手动安装 Netdata

   Netdata 提供了一个简单的安装脚本，你可以使用以下命令来进行安装：
   
   ```bash
   sudo ./netdata-installer.sh
   ```
   - 如果没有 `netdata-installer.sh` 文件，可以参考 Netdata 的官方文档来手动编译和安装，安装过程中会自动检查和安装所需的依赖。
   
5. 启动 Netdata 服务

   安装完成后，你可以使用以下命令来启动 Netdata 服务：
   ```bash
   sudo systemctl start netdata
   ```

   如果你希望 Netdata 在每次启动时自动启动，可以启用它：
   ```bash
   sudo systemctl enable netdata
   ```

6. 访问 Netdata Web 界面

   默认情况下，Netdata 会启动 Web 服务器并监听 `19999` 端口。你可以通过浏览器访问：
   ```bash
   http://localhost:19999
   ```
   
   如果你在一个没有图形界面的服务器上运行 Netdata，可以通过浏览器访问机器的 IP 地址来查看监控数据。

### 7. 离线配置和插件支持

- 如果你希望使用特定的插件或自定义配置，通常你需要手动下载相应的插件包并进行安装。Netdata 的文档提供了关于如何在离线环境中配置插件的详细指导。

### 总结

虽然在没有互联网连接的环境中安装 Netdata 会稍微麻烦一点，但通过下载压缩包并将其转移到目标机器上，你仍然可以顺利完成安装。

安装完成后，你可以通过 Web 界面查看和管理监控数据，所有的功能都与在线安装相同。

# 参考资料

https://github.com/dromara/hertzbeat/blob/master/README_CN.md

* any list
{:toc}