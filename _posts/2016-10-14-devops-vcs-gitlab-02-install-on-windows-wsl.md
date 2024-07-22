---
layout: post
title: Devops-ci-code-02-代码仓库持续部署 gitlab install 安装笔记
date:  2016-10-14 10:15:54 +0800
categories: [Devops]
tags: [devops, ci, sh]
published: true
---

# 拓展阅读

[Devops-01-devops 是什么？](https://houbb.github.io/2016/10/14/devops-01-overview)

[Devops-02-Jpom 简而轻的低侵入式在线构建、自动部署、日常运维、项目监控软件](https://houbb.github.io/2016/10/14/devops-02-jpom)

[代码质量管理 SonarQube-01-入门介绍](https://houbb.github.io/2016/10/14/devops-sonarqube-01-intro)

[项目管理平台-01-jira 入门介绍 缺陷跟踪管理系统，为针对缺陷管理、任务追踪和项目管理的商业性应用软件](https://houbb.github.io/2016/10/14/project-manage-jira-01-intro)

[项目管理平台-01-Phabricator 入门介绍 一套集成的强大工具，帮助公司构建更高质量的软件](https://houbb.github.io/2016/10/14/project-manage-phabricator-01-overview)

[持续集成平台 01 jenkins 入门介绍](https://houbb.github.io/2016/10/14/devops-jenkins-01-intro)


# Gitlab介绍

GitLab 是一个用于代码仓库管理系统的开源项目，使用Git作为代码管理工具，并在此基础上搭建起来的Web服务平台，

通过该平台可以实现Github类似的web系统，可以实现浏览代码、管理项目、管理团队人员、管理代码分支、代码提交记录等功能。Gitlab是目前互联网公司最流行的代码版本控制平台。

# gitlab与github对比

gitlab:比较适合公司内部的项目管理，用来管理项目成员、代码提交、项目运维。

分为社区免费版和企业收费版，针对中小型公司推荐使用社区免费版，功能就够用了。

github：作为“最大的同性交友网站”，里面的大部分项目都是开源的，通过全世界最大的程序员交流平台，可以分享自己的技术、提升自己的知名度。作为公司的内部项目管理就不太适合了。

# Gitlab安装教程

安装GitLab官方推荐至少4G的内存，否则可能会卡顿或者运行非常慢，建议小伙伴们采用4G以上的云服务进行测试，或者本地搭建虚拟机的方式来做。

## 搜索Gitlab镜像

```sh
docker search gitlab
```

## 下载Gitlab社区免费版最新镜像

说明：ce 表示社区免费版 ，ee 表示企业付费版

```sh
docker pull gitlab/gitlab-ce
```

# chat

## 本地如何安装运行 gitlab ?





# 参考资料

[使用 Docker 方式安装 Gitlab，没你想得那么简单](https://lewang.dev/posts/2018-12-18-gitlab-docker-install/)

https://wangchujiang.com/docker-tutorial/gitlab/index.html

https://blog.csdn.net/qq_31424825/article/details/128557992

https://blog.csdn.net/lianxiaohei/article/details/122665812

https://github.com/sameersbn/docker-gitlab

https://docs.gitlab.cn/jh/install/docker.html

https://www.51cto.com/article/720303.html

https://blog.csdn.net/tabingbuxiaode/article/details/131115898

* any list
{:toc}