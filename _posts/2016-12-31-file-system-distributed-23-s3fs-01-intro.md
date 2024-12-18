---
layout: post
title: 分布式存储系统-23-S3FS 可以将 S3 对象存储通过 FUSE 挂载到本地，像本地磁盘一样进行读写访问。
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, dfs, cloud-native, file]
published: true
---

# s3fs

s3fs 允许 Linux、macOS 和 FreeBSD 通过 [FUSE（用户空间文件系统）](https://github.com/libfuse/libfuse) 挂载 S3 存储桶。  
s3fs 使您能够像操作本地文件系统一样操作 S3 存储桶中的文件和目录。  
s3fs 保留文件的原生对象格式，允许使用其他工具，如 [AWS CLI](https://github.com/aws/aws-cli)。

[![s3fs-fuse CI](https://github.com/s3fs-fuse/s3fs-fuse/actions/workflows/ci.yml/badge.svg)](https://github.com/s3fs-fuse/s3fs-fuse/actions/workflows/ci.yml)
[![Twitter Follow](https://img.shields.io/twitter/follow/s3fsfuse.svg?style=social&label=Follow)](https://twitter.com/s3fsfuse)

![s3fs-fuse](https://github.com/ggtakec/s3fs-fuse-images/blob/master/images/s3fslogo.png)

## 特性

* 支持大部分 POSIX 特性，包括文件读取/写入、目录、符号链接、模式、uid/gid 和扩展属性
* 与 Amazon S3 兼容，也支持其他 [基于 S3 的对象存储](https://github.com/s3fs-fuse/s3fs-fuse/wiki/Non-Amazon-S3)
* 支持随机写入和追加
* 支持大文件的多部分上传
* 通过服务器端复制支持重命名
* 可选的服务器端加密
* 数据完整性通过 MD5 哈希值保证
* 内存中的元数据缓存
* 本地磁盘数据缓存
* 支持用户指定区域，包括 Amazon GovCloud
* 支持通过 v2 或 v4 签名进行身份验证

## 安装

许多系统提供了预构建的安装包：

* Amazon Linux 通过 EPEL 安装：

  ```
  sudo amazon-linux-extras install epel
  sudo yum install s3fs-fuse
  ```

* Arch Linux：

  ```
  sudo pacman -S s3fs-fuse
  ```

* Debian 9 和 Ubuntu 16.04 或更新版本：

  ```
  sudo apt install s3fs
  ```

* Fedora 27 或更新版本：

  ```
  sudo dnf install s3fs-fuse
  ```

* Gentoo：

  ```
  sudo emerge net-fs/s3fs
  ```

* RHEL 和 CentOS 7 或更新版本通过 EPEL 安装：

  ```
  sudo yum install epel-release
  sudo yum install s3fs-fuse
  ```

* SUSE 12 和 openSUSE 42.1 或更新版本：

  ```
  sudo zypper install s3fs
  ```

* macOS 10.12 和更新版本通过 [Homebrew](https://brew.sh/) 安装：

  ```
  brew install --cask macfuse
  brew install gromgit/fuse/s3fs-mac
  ```

* FreeBSD：

  ```
  pkg install fusefs-s3fs
  ```

* Windows：

  Windows 有自己的安装方式，详情请见 [此链接](COMPILATION.md)。

否则，请参考 [编译说明](COMPILATION.md)。

## 示例

s3fs 支持标准的 [AWS 凭证文件](https://docs.aws.amazon.com/cli/latest/userguide/cli-config-files.html)，该文件存储在 `${HOME}/.aws/credentials` 中。或者，s3fs 也支持自定义密码文件。最后，s3fs 会识别 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` 和 `AWS_SESSION_TOKEN` 环境变量。

s3fs 密码文件的默认位置可以通过以下方式创建：

* 使用用户主目录中的 `.passwd-s3fs` 文件（即 `${HOME}/.passwd-s3fs`）
* 使用系统范围的 `/etc/passwd-s3fs` 文件

将凭证输入文件 `${HOME}/.passwd-s3fs` 并设置仅限用户访问的权限：

```
echo ACCESS_KEY_ID:SECRET_ACCESS_KEY > ${HOME}/.passwd-s3fs
chmod 600 ${HOME}/.passwd-s3fs
```

使用现有的存储桶 `mybucket` 和目录 `/path/to/mountpoint` 运行 s3fs：

```
s3fs mybucket /path/to/mountpoint -o passwd_file=${HOME}/.passwd-s3fs
```

如果遇到错误，可以启用调试输出：

```
s3fs mybucket /path/to/mountpoint -o passwd_file=${HOME}/.passwd-s3fs -o dbglevel=info -f -o curldbg
```

您还可以通过将以下行添加到 `/etc/fstab` 文件来在启动时自动挂载：

```
mybucket /path/to/mountpoint fuse.s3fs _netdev,allow_other 0 0
```

如果您使用的是非 Amazon S3 实现，可以指定 URL 和路径请求样式：

```
s3fs mybucket /path/to/mountpoint -o passwd_file=${HOME}/.passwd-s3fs -o url=https://url.to.s3/ -o use_path_request_style
```

或（fstab 文件）

```
mybucket /path/to/mountpoint fuse.s3fs _netdev,allow_other,use_path_request_style,url=https://url.to.s3/ 0 0
```

注意：您可能还需要先创建全局凭证文件

```
echo ACCESS_KEY_ID:SECRET_ACCESS_KEY > /etc/passwd-s3fs
chmod 600 /etc/passwd-s3fs
```

注意2：您可能还需要确保 `netfs` 服务在启动时启动。

## 限制

通常，S3 无法提供与本地文件系统相同的性能或语义。

具体来说：

* 文件的随机写入或追加需要重写整个对象，并通过多部分上传复制进行优化
* 由于网络延迟，列出目录等元数据操作的性能较差
* 非 AWS 提供商可能具有 [最终一致性](https://en.wikipedia.org/wiki/Eventual_consistency)，因此读取可能会暂时返回过时数据（AWS 从 2020 年 12 月起提供 [写后读一致性](https://aws.amazon.com/about-aws/whats-new/2020/12/amazon-s3-now-delivers-strong-read-after-write-consistency-automatically-for-all-applications/)）
* 不支持原子重命名文件或目录
* 多个客户端挂载相同存储桶时无法协调
* 不支持硬链接
* inotify 仅检测本地修改，不检测其他客户端或工具的外部修改

## 参考资料

* [CSI for S3](https://github.com/ctrox/csi-s3) - Kubernetes CSI 驱动
* [docker-s3fs-client](https://github.com/efrecon/docker-s3fs-client) - 包含 s3fs 的 Docker 镜像
* [goofys](https://github.com/kahing/goofys) - 类似于 s3fs，但具有更好的性能和较少的 POSIX 兼容性
* [s3backer](https://github.com/archiecobbs/s3backer) - 将 S3 存储桶挂载为单个文件
* [S3Proxy](https://github.com/gaul/s3proxy) - 与 s3fs 配合使用，挂载 Backblaze B2、EMC Atmos、Microsoft Azure 和 OpenStack Swift 存储桶
* [s3ql](https://github.com/s3ql/s3ql/) - 类似于 s3fs，但使用自己的对象格式
* [YAS3FS](https://github.com/danilop/yas3fs) - 类似于 s3fs，但使用 SNS 允许多个客户端挂载一个存储桶

## 常见问题解答

* [FAQ 维基页面](https://github.com/s3fs-fuse/s3fs-fuse/wiki/FAQ)
* [s3fs 在 Stack Overflow 上](https://stackoverflow.com/questions/tagged/s3fs)
* [s3fs 在 Server Fault 上](https://serverfault.com/questions/tagged/s3fs)

## 许可证

Copyright (C) 2010 Randy Rizun <rrizun@gmail.com>

根据 GNU GPL 第 2 版许可


# 参考资料

https://github.com/s3fs-fuse/s3fs-fuse/blob/master/README.md

* any list
{:toc}