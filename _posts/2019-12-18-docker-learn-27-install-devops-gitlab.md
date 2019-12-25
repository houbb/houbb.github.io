---
layout: post
title: Docker learn-27-docker 安装 gitlab
date:  2019-12-18 10:50:21 +0800
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

## 运行镜像

```
$ docker run -d  -p 443:443 -p 80:80 -p 222:22 --name devops-gitlab --restart always -v /home/gitlab/config:/etc/gitlab -v /home/gitlab/logs:/var/log/gitlab -v /home/gitlab/data:/var/opt/gitlab gitlab/gitlab-ce

# -d：后台运行
# -p：将容器内部端口向外映射
# --name：命名容器名称
# -v：将容器内数据文件夹或者日志、配置等文件夹挂载到宿主机指定目录
```

# 拓展阅读

[Devops](https://houbb.github.io/2018/03/16/devops)

[Jenkins](https://houbb.github.io/2016/10/14/jenkins)

[Gitlab](https://houbb.github.io/2017/01/13/gitlab)

[Nexus](https://houbb.github.io/2016/08/06/Nexus)

## 更多学习

关注公众号：老马啸西风

![image](https://user-images.githubusercontent.com/18375710/71187778-b427f380-22ba-11ea-8b72-cab863753533.png)

# 参考资料

[docker下gitlab安装配置使用(完整版)](https://www.jianshu.com/p/080a962c35b6)

* any list
{:toc}
