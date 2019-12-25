---
layout: post
title: Docker learn-25-docker 安装 jenkins
date:  2019-12-18 10:50:21 +0800
categories: [Devpos]
tags: [docker, devops, in-action, sh]
published: true
---

# 持续集成

![image](https://user-images.githubusercontent.com/18375710/71437540-23736c80-272d-11ea-9e23-1e0c5802b056.png)

## 核心组件

gitlab: 存放代码

nexus: jar 私有仓库

jenkins: 持续集成利器

registry/docker-register-web：容器页面

## 流程

开发push代码到gitlab，触发jenkins自动pull代码，通过maven编译、打包，然后通过执行shell脚本使docker构建镜像并push到 nexus 仓库。

此操作完成后jenkins服务器上再执行SSH命令登录到部署服务器，docker从仓库（私服）拉取镜像，启动容器。

整个操作流程完成。

## 目标

全部调试通过，然后发布对应的容器到仓库。

前缀：`devops-xxx`

为了降低压力，我们将各个安装分开学习记录。

# 安装 jenkies

## 运行

```
docker run -d -p 8002:8080 -v /var/jenkins_home:/var/jenkins_home --name devops-jenkins --restart=always jenkins
```

- 查看运行

```
$ docker ps -l                                                                                                                      
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                         PORTS               NAMES
a6daf6ed2de9        jenkins             "/bin/tini -- /usr/l…"   18 seconds ago      Restarting (1) 3 seconds ago                       devops-jenkins
```

## 异常

- 查看容器日志

```
docker logs -f devops-jenkins
```

### 文件读写权限

如下：

```
touch: cannot touch '/var/jenkins_home/copy_reference_file.log': Permission denied
Can not write to /var/jenkins_home/copy_reference_file.log. Wrong volume permissions?
```

这个异常很明显是没有权限，开启权限：

- 创建文件

```
mkdir -p /var/jenkins_home
```

- 赋权

```
chown -R 1000 /var/jenkins_home
```

- 重新运行

```
$ docker ps -l
CONTAINER ID        IMAGE               COMMAND                  CREATED              STATUS              PORTS                               NAMES
8bc738ac79a3        jenkins             "/bin/tini -- /usr/l…"   About a minute ago   Up About a minute   50000/tcp, 0.0.0.0:8002->8080/tcp   devops-jenkins
```

日志如下:

```
Jenkins initial setup is required. An admin user has been created and a password generated.
Please use the following password to proceed to installation:

de747efd31ca40509294aa24114cf6ac

This may also be found at: /var/jenkins_home/secrets/initialAdminPassword
```

还有一个警告

```
WARNING: Upgrading Jenkins. Failed to update the default Update Site 'default'. Plugin upgrades may fail.
java.net.SocketTimeoutException: connect timed out
```

这个我们暂时忽略。

## 访问

界面访问 [http://127.0.0.1:8002](http://127.0.0.1:8002), 自动跳转至登录界面

# 拓展阅读

## docker

[docker 实战之静态网站](https://houbb.github.io/2019/12/18/docker-learn-24-static-web-in-action)

[docker 实战之 java web](https://houbb.github.io/2019/12/18/docker-learn-25-java-web-in-action)

[docker 推送到中央仓库](https://houbb.github.io/2019/12/18/docker-learn-22-image-push-to-hub)

## devops

[Devops](https://houbb.github.io/2018/03/16/devops)

[Jenkins](https://houbb.github.io/2016/10/14/jenkins)

[Gitlab](https://houbb.github.io/2017/01/13/gitlab)

[Nexus](https://houbb.github.io/2016/08/06/Nexus)

## 更多学习

关注公众号：老马啸西风

![image](https://user-images.githubusercontent.com/18375710/71187778-b427f380-22ba-11ea-8b72-cab863753533.png)

# 参考资料

## 书籍

《第一本 Docker 书》

## 博客

[使用docker搭建持续集成(CI)环境](https://blog.csdn.net/u014647285/article/details/82728236)

[Docker 之 Jenkins自动化部署](https://www.jianshu.com/p/a1aef2f7da56)

* any list
{:toc}
