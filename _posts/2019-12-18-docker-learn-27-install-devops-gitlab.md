---
layout: post
title: Docker learn-27-docker 安装 gitlab
date:  2019-12-18 11:34:23 +0800
categories: [Devpos]
tags: [docker, devops, in-action, sh]
published: true
---

# Gitlab 

关于 gitlab，以前学习过一次。

参见 [gitlab 入门](https://houbb.github.io/2017/01/13/gitlab)

# 安装流程

## 下载镜像

```
# gitlab-ce为稳定版本，后面不填写版本则默认pull最新latest版本
$ docker pull gitlab/gitlab-ce
```

## 创建文件夹

为镜像映射做准备。

```
mkdir /home/gitlab/config
mkdir /home/gitlab/logs
mkdir /home/gitlab/data
```

ps: 其实可以跳过这一步，会自动创建。

## 运行镜像

```
docker run -d  -p 443:443 -p 80:80 -p 222:22 --name devops-gitlab --restart always  \
-v /home/gitlab/config:/etc/gitlab \
-v /home/gitlab/logs:/var/log/gitlab \
-v /home/gitlab/data:/var/opt/gitlab \
gitlab/gitlab-ce

# -d：后台运行
# -p：将容器内部端口向外映射
# --name：命名容器名称
# -v：将容器内数据文件夹或者日志、配置等文件夹挂载到宿主机指定目录
```

### 参数说明

| Local location      | Container location      | Usage |
|:---|:---|:---|
| /srv/gitlab/data    | /var/opt/gitlab         | For storing application data |
| /srv/gitlab/logs    | /var/log/gitlab         | For storing logs |
| /srv/gitlab/config  | /etc/gitlab             | For storing the GitLab configuration files |

### 日志

这个启动过程比较长，你可以通过如下的命令观察日志：

```
$   docker logs -f devops-gitlab
```

- 异常

```
docker ps -l
fatal error: runtime: out of memory

runtime stack:
runtime.throw(0x1e5ff66, 0x16)
```

- 内存查看

```
$ free -mh
              total        used        free      shared  buff/cache   available
Mem:          989Mi       902Mi        10Mi        53Mi        76Mi        17Mi
Swap:         1.1Gi       1.1Gi       0.0Ki
```

直接 OOM 了，估计内存不足。

我们其他的几个应用暂时关闭。

关闭其他容器，然后重启。

感觉还是分配给 docker 的初始化内存太小了，跑不起来 gitlab。

参考：[https://github.com/moby/moby/issues/31604](https://github.com/moby/moby/issues/31604)

## 显式指定内存大小

`-m 2g` 来指定运行内存。

```
docker run -d -m 2g -p 443:443 -p 80:80 -p 222:22 --name devops-gitlab --restart always  \
-v /home/gitlab/config:/etc/gitlab \
-v /home/gitlab/logs:/var/log/gitlab \
-v /home/gitlab/data:/var/opt/gitlab \
gitlab/gitlab-ce
```

## 访问

直接访问  [http://192.168.99.100:80](http://192.168.99.100:80)

# 拓展阅读

[Devops](https://houbb.github.io/2018/03/16/devops)

[Jenkins](https://houbb.github.io/2016/10/14/jenkins)

[Gitlab](https://houbb.github.io/2017/01/13/gitlab)

[Nexus](https://houbb.github.io/2016/08/06/Nexus)

## 更多学习



# 参考资料

[docker下gitlab安装配置使用(完整版)](https://www.jianshu.com/p/080a962c35b6)

## oom

[docker出现Out Of Memory Exception:内存异常：查看docker使用cpu、内存、网络、io情况](https://blog.csdn.net/loveliness_peri/article/details/88310473)

* any list
{:toc}
