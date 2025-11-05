---
layout: post
title: docker docker_data.vhdx 占用磁盘特别大压缩实战笔记
date: 2025-11-05 14:12:33 +0800
categories: [Docker]
tags: [docker, sh]
published: true
---

# 背景

docker 使用之后，发现本地的 `C:\Users\dh\AppData\Local\Docker\wsl\disk\docker_data.vhdx`

占用磁盘空间位 15G，很不合理。

这里记录一下清理过程。

# 基础数据清空

## 占用分布

```
>docker system df
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          0         0         0B        0B
Containers      0         0         0B        0B
Local Volumes   0         0         0B        0B
Build Cache     0         0         0B        0B
```

可以发现，已经下载的信息都删除掉了。

但是还是发现 `docker_data.vhdx` 占用的空间还是很大。

## 压缩

1）关闭Docker Desktop和所有WSL2发行版

首先，退出Docker Desktop（确保完全退出，包括系统托盘中的图标）。

然后，以管理员身份打开PowerShell或命令提示符，运行以下命令来关闭所有WSL2发行版：

2）压缩命令

```sh
# 启动diskpart
diskpart

# 选择虚拟磁盘文件
select vdisk file="C:\Users\dh\AppData\Local\Docker\wsl\disk\docker_data.vhdx"

# 设置为只读附件（为了压缩）
attach vdisk readonly

# 压缩虚拟磁盘
compact vdisk

# 分离虚拟磁盘
detach vdisk

# 退出diskpart
exit
```

3) 效果

此时可以看到 docker_data.vhdx 已经压缩到 1.8GB，效果不错！ 

# 参考资料

* any list
{:toc}