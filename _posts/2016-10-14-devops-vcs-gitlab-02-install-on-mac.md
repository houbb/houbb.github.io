---
layout: post
title: Gitlab-02-mac docker 安装笔记
date:  2017-01-14 02:17:01 +0800
categories: [Devops]
tags: [gitlab, git, devops, docker, vcs]
published: true
---


# Mac Docker-Kitematic

- 搜索

使用这个直接搜索 gitlab，然后选择 gitlab-ce

- 创建

直接点击【Create】，然后可以看到一系列的日志，这个过程还是很费时间的。

- 访问

什么都不用做，然后执行 

```
$   docker ps
```

内容如下：

```
houbinbindeMacBook-Pro:logs houbinbin$ docker ps
CONTAINER ID        IMAGE                     COMMAND             CREATED             STATUS                    PORTS                                                                  NAMES
6c77fcbd6175        gitlab/gitlab-ce:latest   "/assets/wrapper"   10 minutes ago      Up 10 minutes (healthy)   0.0.0.0:32770->22/tcp, 0.0.0.0:32769->80/tcp, 0.0.0.0:32768->443/tcp   gitlab-ce
```

直接访问 `0.0.0.0:32769->80/tcp` 对应的 URL: [localhost:32769](localhost:32769) 即可。

# Mac 本地安装

借助 Docker 进行安装。

[官方教程](https://docs.gitlab.com/omnibus/docker/)

## Docker 安装

直接参考：[Docker](https://houbb.github.io/2016/10/15/docker)

## 下载镜像

- 镜像

[gitlab-ce](https://hub.docker.com/r/gitlab/gitlab-ce/)

执行命令：

```
$   docker pull gitlab/gitlab-ce
```

- 执行日志

```
$ docker pull gitlab/gitlab-ce
Using default tag: latest
latest: Pulling from gitlab/gitlab-ce
22dc81ace0ea: Pull complete 
1a8b3c87dba3: Pull complete 
91390a1c435a: Pull complete 
07844b14977e: Pull complete 
b78396653dae: Pull complete 
b7b27b5a862c: Pull complete 
b36426107b6c: Pull complete 
3368a63e7ee5: Pull complete 
9af48542e108: Pull complete 
89277d2aced7: Pull complete 
023bfed27041: Pull complete 
Digest: sha256:194d10fcb9421517ce739fb837d8b015bb9154969466e62b0ab057264f063f58
Status: Downloaded newer image for gitlab/gitlab-ce:latest
```

## 打包成容器

- 默认命令 

执行以下命令：

```
sudo docker run --detach \
--hostname gitlab.example.com \
--publish 443:443 --publish 80:80 --publish 22:22 \
--name gitlab \
--restart always \
--volume /srv/gitlab/config:/etc/gitlab \
--volume /srv/gitlab/logs:/var/log/gitlab \
--volume /srv/gitlab/data:/var/opt/gitlab \
gitlab/gitlab-ce:latest
```

端口号说明

GitLab will occupy by default the following ports inside the container:

| 端口号 | 说明 |
|:---|:---|
| 80 | HTTP |
| 443 | if you configure HTTPS |
| 8080 | used by Unicorn |
| 22 | used by the SSH daemon |


- 个人调整

以前系统中装的各种服务占用了端口，此处全部重新调整：

```
sudo docker run --detach \
--hostname 127.0.0.1 \
--publish 80:80 \
--publish 18022:22 \
--name gitlab \
--restart always \
--volume /srv/gitlab/config:/etc/gitlab \
--volume /srv/gitlab/logs:/var/log/gitlab \
--volume /srv/gitlab/data:/var/opt/gitlab \
gitlab/gitlab-ce:latest
```




### 异常

```
docker: Error response from daemon: Mounts denied: 
The paths /srv/gitlab/logs and /srv/gitlab/config and /srv/gitlab/data
are not shared from OS X and are not known to Docker.
You can configure shared paths from Docker -> Preferences... -> File Sharing.
See https://docs.docker.com/docker-for-mac/osxfs/#namespaces for more info.
```

对上述的文件夹没有权限。

- 创建

命令行直接创建上述文件夹：

| Local location	| Container location	| Usage |
|:---|:---|:---|
| /srv/gitlab/data |	/var/opt/gitlab	| For storing application data |
| /srv/gitlab/logs	|   /var/log/gitlab	| For storing logs |
| /srv/gitlab/config | /etc/gitlab |	For storing the GitLab configuration files |

```
houbinbindeMacBook-Pro:gitlab houbinbin$ ls
config	data	logs
houbinbindeMacBook-Pro:gitlab houbinbin$ pwd
/srv/gitlab
```

- Docker 中添加

根据提示，选择 `Docker -> Preferences... -> File Sharing.` 

添加上述文件夹：

![2018-04-22-docker-gitlab-file-sharing.png](https://raw.githubusercontent.com/houbb/resource/master/img/docker/2018-04-22-docker-gitlab-file-sharing.png)

- 重启服务 

点击【Applying & Restart】

使得配置生效。

- 重新执行

(1) 删除容器

如果报错如下：

```
docker: Error response from daemon: Conflict. The container name "/gitlab" is already in use by container "bdcefdcf849f4b974679361179107679b78bde078c7ef327791f404c15d64311". You have to remove (or rename) that container to be able to reuse that name.
See 'docker run --help'.
```

说明这个容器已经存在，但是启动时又是各种问题。此处选择删除：

```
sudo docker rm /gitlab
```

(2) 再次执行命令

```
sudo docker run --detach \
--hostname 127.0.0.1 \
--publish 80:80 \
--publish 18022:22 \
--name gitlab \
--restart always \
--volume /srv/gitlab/config:/etc/gitlab \
--volume /srv/gitlab/logs:/var/log/gitlab \
--volume /srv/gitlab/data:/var/opt/gitlab \
gitlab/gitlab-ce:latest
```


报错如下：

```
docker: Error response from daemon: driver failed programming external connectivity on endpoint gitlab (4f063fa8177915486b565000f0591a9bbbae49df7d1413c2e6038fc093cdb2b9): Error starting userland proxy: Bind for 0.0.0.0:22: unexpected error (Failure EADDRINUSE).
```

在成功执行这个命令之后：

(2.2) 调整配置信息

修改文件 `/etc/gitlab/gitlab.rb`，如果这么文件没有手动创建。

```
# For HTTP
external_url "http://127.0.0.1:80"

# for ssh port
gitlab_rails['gitlab_shell_ssh_port'] = 18022
gitlab_rails['gitlab_ssh_host'] = '127.0.0.1'
```

## 运行容器

- 运行


```
sudo docker exec -it gitlab /bin/bash
```

- 日志

可以查看 docker 日志

```
sudo docker logs gitlab
```

发现一直再重启，为了排除是**权限**的问题，执行以下命令


```
docker exec -it gitlab update-permissions
docker restart gitlab
```

## 访问

[http://127.0.0.1:18000](http://127.0.0.1:18000)

TODO: 不知道为什么访问就是没有效果，有毒。。。

# Jenkins 整合

> [Jenkins 整合](https://docs.gitlab.com/ee/integration/jenkins.html)

# 参考资料

> [wiki](http://www.cnblogs.com/moshang-zjn/p/5757430.html)


* any list
{:toc}