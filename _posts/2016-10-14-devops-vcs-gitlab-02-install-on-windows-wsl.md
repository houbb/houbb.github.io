---
layout: post
title: Devops-ci-code-02-代码仓库持续部署 gitlab install windows wsl 清华镜像的安装方式
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
sudo docker pull gitlab/gitlab-ce:latest
```

### 下载非常慢

发现下载非常慢。

> [GitLab CE 软件仓库](https://mirror.tuna.tsinghua.edu.cn/help/gitlab-ce/)

首先查看 ubuntu 的版本

```
$ cat /etc/*release
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=22.04
DISTRIB_CODENAME=jammy
DISTRIB_DESCRIPTION="Ubuntu 22.04.3 LTS"
PRETTY_NAME="Ubuntu 22.04.3 LTS"
NAME="Ubuntu"
VERSION_ID="22.04"
VERSION="22.04.3 LTS (Jammy Jellyfish)"
VERSION_CODENAME=jammy
ID=ubuntu
ID_LIKE=debian
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"
PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
UBUNTU_CODENAME=jammy
```

### chat 方案

根据你提供的信息，你的 WSL 环境是 Ubuntu 22.04.3 LTS（代号 Jammy Jellyfish）。

要将 GitLab 镜像设置为清华大学开源软件镜像站的国内镜像，请按照以下步骤操作：

1. **信任 GitLab 的 GPG 公钥**：
   打开 WSL 的终端，然后运行以下命令来信任 GitLab 的 GPG 公钥：
   ```shell
   curl https://packages.gitlab.com/gpg.key | sudo apt-key add -
   ```

2. **添加 GitLab 镜像源**：
   接下来，将清华大学的 GitLab 镜像源添加到你的 `/etc/apt/sources.list.d/` 目录下。你可以使用文本编辑器来创建一个新的 `.list` 文件，例如 `gitlab-ce.list`：
   ```shell
   echo "deb https://mirrors.tuna.tsinghua.edu.cn/gitlab-ce/debian bookworm main" | sudo tee /etc/apt/sources.list.d/gitlab-ce.list
   ```
   注意：你的 Ubuntu 版本是 22.04，代号为 Jammy，但清华大学的镜像站可能没有为这个版本提供专门的镜像。如果 `bookworm` 不适合你的版本，你可能需要替换为 `main` 或其他适合你版本的代码名。

3. **更新本地包索引**：
   更新你的包索引，以确保你的系统知道新的镜像源：
   ```shell
   sudo apt-get update
   ```

4. **安装 GitLab**：
   现在你可以安装 GitLab 社区版（gitlab-ce）：
   ```shell
   sudo apt-get install gitlab-ce
   ```

5. **配置 GitLab**（如果需要）：
   安装完成后，你可能需要根据你的需要配置 GitLab。配置文件通常位于 `/etc/gitlab/gitlab.rb`。你可以使用你喜欢的文本编辑器来编辑这个文件，并根据清华大学镜像站的说明或 GitLab 官方文档进行配置调整。

6. **启动 GitLab 服务**：
   安装完成后，你可以启动 GitLab 服务：
   ```shell
   sudo gitlab-ctl reconfigure
   sudo gitlab-ctl start
   ```

请注意，如果你在执行这些步骤时遇到任何问题，比如版本不匹配或权限问题，请参考清华大学镜像站的详细说明或 GitLab 官方文档来获取帮助。此外，如果你打算在生产环境中使用 GitLab，请确保遵循最佳安全实践。

安装完成后的笔记：

```
It looks like GitLab has not been configured yet; skipping the upgrade script.

       *.                  *.
      ***                 ***
     *****               *****
    .******             *******
    ********            ********
   ,,,,,,,,,***********,,,,,,,,,
  ,,,,,,,,,,,*********,,,,,,,,,,,
  .,,,,,,,,,,,*******,,,,,,,,,,,,
      ,,,,,,,,,*****,,,,,,,,,.
         ,,,,,,,****,,,,,,
            .,,,***,,,,
                ,*,.



     _______ __  __          __
    / ____(_) /_/ /   ____ _/ /_
   / / __/ / __/ /   / __ `/ __ \
  / /_/ / / /_/ /___/ /_/ / /_/ /
  \____/_/\__/_____/\__,_/_.___/


Thank you for installing GitLab!
GitLab was unable to detect a valid hostname for your instance.
Please configure a URL for your GitLab instance by setting `external_url`
configuration in /etc/gitlab/gitlab.rb file.
Then, you can start your GitLab instance by running the following command:
  sudo gitlab-ctl reconfigure

For a comprehensive list of configuration options please see the Omnibus GitLab readme
https://gitlab.com/gitlab-org/omnibus-gitlab/blob/master/README.md

Help us improve the installation experience, let us know how we did with a 1 minute survey:
https://gitlab.fra1.qualtrics.com/jfe/form/SV_6kVqZANThUQ1bZb?installation=omnibus&release=17-2

Processing triggers for man-db (2.10.2-1) ...
Processing triggers for libc-bin (2.35-0ubuntu3.7) ...
```

### 修改配置

```sh
sudo gitlab-ctl reconfigure
```

需要等待一段时间：

```
Notes:
Default admin account has been configured with following details:
Username: root
Password: You didn't opt-in to print initial root password to STDOUT.
Password stored to /etc/gitlab/initial_root_password. This file will be cleaned up in first reconfigure run after 24 hours.

NOTE: Because these credentials might be present in your log files in plain text, it is highly recommended to reset the password following https://docs.gitlab.com/ee/security/reset_user_password.html#reset-your-root-password.

gitlab Reconfigured!
```

### 启动

启动日志：

```
dh@d:~$ sudo gitlab-ctl start
ok: run: alertmanager: (pid 50191) 628s
ok: run: gitaly: (pid 50118) 631s
ok: run: gitlab-exporter: (pid 50147) 629s
ok: run: gitlab-kas: (pid 49093) 739s
ok: run: gitlab-workhorse: (pid 50092) 632s
ok: run: logrotate: (pid 48667) 768s
ok: run: nginx: (pid 53407) 2s
ok: run: node-exporter: (pid 50137) 630s
ok: run: postgres-exporter: (pid 50210) 627s
ok: run: postgresql: (pid 48898) 745s
ok: run: prometheus: (pid 50161) 629s
ok: run: puma: (pid 49301) 703s
ok: run: redis: (pid 48726) 762s
ok: run: redis-exporter: (pid 50150) 629s
ok: run: sidekiq: (pid 49346) 697s
```

# 访问

浏览器打开 [http://localhost:8080/users/sign_in](http://localhost:8080/users/sign_in)

发现 css 丢失。

# 卸载

## 停止

```sh
sudo gitlab-ctl stop
```

## 卸载

当然可以，使用 `apt-get` 命令是卸载软件包的一种简单有效的方法。以下是使用 `apt-get` 命令卸载 GitLab CE 的步骤：

1. **停止 GitLab 服务**：
   ```bash
   sudo gitlab-ctl stop
   ```

2. **卸载 GitLab 软件包**：
   ```bash
   sudo apt-get remove gitlab-ce
   ```

3. **自动移除不再需要的依赖包**：
   ```bash
   sudo apt-get autoremove
   ```

4. **清理缓存**：
   ```bash
   sudo apt-get clean
   ```

5. **可选：删除 GitLab 的配置文件和日志文件**：
   - 删除配置文件：
     ```bash
     sudo rm -rf /etc/gitlab
     ```
   - 删除日志文件：
     ```bash
     sudo rm -rf /var/log/gitlab
     ```

通过这些步骤，你可以比较彻底地卸载 GitLab CE 并清理相关的文件和配置。

# 参考资料

https://blog.csdn.net/bmseven/article/details/126760783

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