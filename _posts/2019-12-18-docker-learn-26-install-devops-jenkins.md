---
layout: post
title: Docker learn-26-docker 安装 jenkins
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
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

sonar: 代码质量检测

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
docker run -d -p 8080:8080 -p 50000:50000 -v /var/jenkins_home:/var/jenkins_home --name devops-jenkins --restart=always jenkins
```

- 查看运行

```
$ docker ps -l
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                                              NAMES
0e7fd22035a9        jenkins             "/bin/tini -- /usr/l…"   9 seconds ago       Up 8 seconds        0.0.0.0:50000->50000/tcp, 0.0.0.0:8080->8080/tcp   devops-jenkins
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
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                                              NAMES
0e7fd22035a9        jenkins             "/bin/tini -- /usr/l…"   9 seconds ago       Up 8 seconds        0.0.0.0:50000->50000/tcp, 0.0.0.0:8080->8080/tcp   devops-jenkins
```


```
$ docker restart 0e7fd22035a9
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

界面访问 [http://192.168.99.100:8080](http://192.168.99.100:8080), 自动跳转至登录界面

- 初始界面

![image](https://user-images.githubusercontent.com/18375710/71441575-05ae0380-273d-11ea-9c4c-61ff8ef552d3.png)

- 密码

这里的日志在刚才的日志中 `de747efd31ca40509294aa24114cf6ac`

- 离线安装

![image](https://user-images.githubusercontent.com/18375710/71441813-0c894600-273e-11ea-8c27-9cf372f91ba8.png)

可参考 [离线安装文档](https://wiki.jenkins.io/display/JENKINS/Offline+Jenkins+Installation)

我选择跳过插件安装，点击【skipping plugin installation】

## 创建 admin

直接创建一个 admin 用户。

![image](https://user-images.githubusercontent.com/18375710/71441889-730e6400-273e-11ea-92a1-f2d2087f8acb.png)

此处直接保存并结束，点击【save and finish】

## 开始使用

直接进入如下界面，我们就可以开始自己的 Jenkins 之旅了。

登录页面如下：

![image](https://user-images.githubusercontent.com/18375710/71443392-9ab4fa80-2745-11ea-919f-61115d9f6e0d.png)

直接输入 admin 的信息登录即可。

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



# 参考资料

## 书籍

《第一本 Docker 书》

## 博客

[使用docker搭建持续集成(CI)环境](https://blog.csdn.net/u014647285/article/details/82728236)

[Docker 之 Jenkins自动化部署](https://www.jianshu.com/p/a1aef2f7da56)

[GitLab、Jenkins 、SonarQube、Nexus 搭建 CI/CD、代码质量检查](https://hacpai.com/article/1557292536979)

* any list
{:toc}
