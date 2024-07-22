---
layout: post
title: Devops-ci-code-02-代码仓库持续部署 gitlab install windows wsl docker 方式
date:  2016-10-14 10:15:54 +0800
categories: [Devops]
tags: [devops, ci, docker, gitlab, git, sh]
published: true
---

# 拓展阅读

[Devops-01-devops 是什么？](https://houbb.github.io/2016/10/14/devops-01-overview)

[Devops-02-Jpom 简而轻的低侵入式在线构建、自动部署、日常运维、项目监控软件](https://houbb.github.io/2016/10/14/devops-02-jpom)

[代码质量管理 SonarQube-01-入门介绍](https://houbb.github.io/2016/10/14/devops-sonarqube-01-intro)

[项目管理平台-01-jira 入门介绍 缺陷跟踪管理系统，为针对缺陷管理、任务追踪和项目管理的商业性应用软件](https://houbb.github.io/2016/10/14/project-manage-jira-01-intro)

[项目管理平台-01-Phabricator 入门介绍 一套集成的强大工具，帮助公司构建更高质量的软件](https://houbb.github.io/2016/10/14/project-manage-phabricator-01-overview)

[持续集成平台 01 jenkins 入门介绍](https://houbb.github.io/2016/10/14/devops-jenkins-01-intro)


# docker 安装

```
sudo apt remove docker docker-engine docker.io
sudo apt install apt-transport-https ca-certificates curl software-properties-common gnupg
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
 
sudo apt update
 
# 安装docker
sudo apt install docker-ce
 
# 启动docker
sudo service docker start
```

# gitlab 安装

## 拉取镜像

```sh
sudo docker pull gitlab/gitlab-ce
```

> [https://hub.docker.com/r/gitlab/gitlab-ce](https://hub.docker.com/r/gitlab/gitlab-ce)

发现一直卡主...

### 1）尝试1 

```sh
# 清理 Docker 缓存，实际无效
sudo docker system prune
```

清理无效。

### 2）尝试2 修改镜像源头

> [镜像超时](https://gist.github.com/y0ngb1n/7e8f16af3242c7815e7ca2f0833d3ea6)

```sh
sudo mkdir -p /etc/docker/
sudo vi daemon.json
```

or

```sh
sudo vi /etc/docker/daemon.json
```

内容如下：

```json
{
    "registry-mirrors": [
        "https://dockerproxy.com",
        "https://docker.mirrors.ustc.edu.cn",
        "https://docker.nju.edu.cn"
    ]
}
```

重启 docker 

```sh
sudo systemctl daemon-reload
sudo systemctl restart docker
```

发现是 docker 的名字问题，可以用下面的方式查询名称：

```sh
$ systemctl list-units --type=service | grep -i docker
  snap.docker.dockerd.service                            loaded    active running Service for snap application docker.dockerd \
```

对应的名字就是 `snap.docker.dockerd.service`

重新启动：

```sh
sudo systemctl restart snap.docker.dockerd.service
```

重新拉取：

```sh
sudo docker pull gitlab/gitlab-ce
```

## 完整的方式

我想在镜像网站 https://registry.cn-hangzhou.aliyuncs.com，拉取 gitlab/gitlab-ce。完整的命令怎么写？

```sh
sudo docker pull registry.cn-hangzhou.aliyuncs.com/gitlab/gitlab-ce:latest
```

# 2、创建目录

```sh
# 创建config目录
mkdir -p /home/gitlab/config  
# 创建logs目录 
mkdir -p /home/gitlab/logs    
# 创建data目录
mkdir -p /home/gitlab/data    
```

# 3、运行脚本启动GitLab

```sh
docker run --detach \
    --hostname 192.168.1.55 \
    --publish 7001:443 --publish 7002:80 --publish 7003:22 \
    --name gitlab --restart always \
    --volume /home/gitlab/config:/etc/gitlab \
    --volume /home/gitlab/logs:/var/log/gitlab \
    --volume /home/gitlab/data:/var/opt/gitlab gitlab/gitlab-ce:latest
```



# 参考资料

https://blog.csdn.net/bmseven/article/details/126760783

https://zhuanlan.zhihu.com/p/381115119

* any list
{:toc}