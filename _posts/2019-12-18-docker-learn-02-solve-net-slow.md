---
layout: post
title: Docker Learn-02-解决 Docker 国内较慢的问题
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, problem, sf]
published: true
---

# 背景

有时候国内访问 docker 下载速度 K 为单位，写一个 image 几G 的要等很久。

# 临时解决方案

## 国内镜像

此处介绍使用中国科学技术大学（LUG@USTC）的开源镜像，本人亲测公司内的网络达到十几兆/秒。

```
https://docker.mirrors.ustc.edu.cn
```

## 修改配置

新版的 Docker 使用 /etc/docker/daemon.json（Linux） 或者 %programdata%\docker\config\daemon.json（Windows） 来配置 Daemon。

请在该配置文件中加入（没有该文件的话，请先建一个）：

### windows

`C:\ProgramData\Docker\config`

新建一个文件 `daemon.json`，内容如下：

```json
{
  "registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"]
}
```

## 重启 docker 

然后需要重新启动，再次下载即可实现比较快的访问速度。

# 参考资料

[国内获取Docker镜像缓慢](https://blog.csdn.net/small_to_large/article/details/77334973)

[解决Docker pull镜像速度过慢的问题](https://blog.csdn.net/qq_39723363/article/details/82922931)

* any list
{:toc}