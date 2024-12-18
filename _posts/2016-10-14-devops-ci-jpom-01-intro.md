---
layout: post
title: Devops-02-Jpom 简而轻的低侵入式在线构建、自动部署、日常运维、项目监控软件
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


# jpom

🚀简而轻的低侵入式在线构建、自动部署、日常运维、项目监控软件

更是一款原生 ops 软件

# 😭 日常开发中，您是否有以下痛点？

- 团队中没有专业的运维，开发还要做运维的活，需要自己手动构建、部署项目。
- 不同的项目有不同的构建、部署命令。
- 有开发、测试、生产等多环境打包的需求。
- 需要同时监控多个项目的运行状态。
- <u>需要下载 SSH 工具</u>远程连接服务器。
- *需要下载 FTP 工具*传输文件到服务器。
- 多台服务器时，在不同电脑之间账号密码同步不方便。
- 想使用一些自动化工具，但是对服务器性能太高，搭建太麻烦。
- **对自动化工具有个性化的需求，想自己修改项目**，但是市面上的工具太复杂了。

> 如果是分布式的项目，以上步骤则更加繁琐。
>
> 让 Jpom 来帮您解决这些痛点吧！然而，这些只是 Jpom 解决的最基础的功能。

### 😁 使用 [Jpom](https://gitee.com/dromara/Jpom) 后

- 方便的用户管理
	1. 用户操作监控，监控指定用户指定操作以邮件形式通知
	2. 多用户管理，用户项目权限独立（上传、删除权限可控制），完善的操作日志，使用工作空间隔离权限
	3. 账号可以开启 **MFA 两步验证**提高账号安全性
- 界面形式实时查看项目运行状态、控制台日志、管理项目文件
	1. 在线修改项目文本文件
- Docker 容器管理、Docker Swarm 集群管理（**Docker UI**）
- **在线 SSH 终端**，让您在没有 PuTTY、Xshell、FinalShell 等软件也能轻松管理服务器
	1. 登录 Jpom 系统后不需要知道服务器密码
	2. 能指定 SSH 禁止执行的命令，避免执行高风险命令，并且能自动执行命令日志
	3. 设置文件目录，在线查看管理对应项目文件及配置文件
	4. SSH 命令模版在线执行脚本还能定时执行
	5. 在线修改文本文件
	6. **轻量的实现了简单的"堡垒机"功能**
- 使用项目分发一键搞定集群项目多机部署
- 在线构建不用手动更新升级项目
	1. 支持拉取 GIT、SVN 仓库
	2. **支持容器构建（docker）**
	3. 支持 SSH 方式发布
	4. 支持定时构建
	5. 支持 WebHook 形式触发构建
- 支持在线编辑 nginx 配置文件并自动 reload 等操作
	1. 管理 nginx 状态，管理 SSL 证书
- 项目状态监控异常自动报警、自动尝试重启
	1. 支持邮件 + 钉钉群 + 微信群通知，主动感知项目运行状况
- 节点脚本模版+定时执行或者触发器，拓展更多功能
- 重要路径授权配置，杜绝用户误操作系统文件

### 🔔️ 特别提醒

> 1. 在 Windows 服务器中可能有部分功能因为系统特性造成兼容性问题，建议在实际使用中充分测试。Linux 目前兼容性良好
> 2. 服务端和插件端请安装到不同目录中，切勿安装到同一目录中
> 3. 卸载 Jpom 插件端或者服务端，先停止对应服务，然后删除对应的程序文件、日志文件夹、数据目录文件夹即可
> 4. 本地构建依赖的是系统环境，如果构建命令需要使用 maven 或者 node
	 需要在构建项目的服务器安装好对应的环境。如果已经启动服务端再安装的对应环境需要通过命令行重启服务端后环境才会生效。
> 5. 在 Ubuntu/Debian 服务器作为插件端可能会添加失败，请在当前用户的根目录创建 .bash_profile 文件
> 6. 升级 2.7.x 后不建议降级操作，会涉及到数据不兼容的情况
> 7. 由于目前 2.x.x 版本插件端和服务端主要采用 http 协议通讯，插件端和服务端网络要求互通，在使用的时候请注意。
> 8. Jpom 3.0 版本已经开始规划更新了，尽请期待新版本的诞生吧

### 🗒️ [版本更新日志](https://gitee.com/dromara/Jpom/blob/master/CHANGELOG.md)

升级前必看：[CHANGELOG.md](https://gitee.com/dromara/Jpom/blob/master/CHANGELOG.md)

## 📥 安装 Jpom

Jpom 支持多种安装方式，满足不同用户的个性化需求，您只需要选择一种方式安装即可。

### 方式一：🚀（推荐） 一键安装（Linux）

#### 一键安装服务端

> **注意：安装的目录位于执行命令的目录！**
>
> ⚠️ 特别提醒：一键安装的时候注意执行命令不可在同一目录下，即 Server 端和 Agent 端不可安装在同一目录下！
>
> 如果需要修改服务端数据、日志存储的路径请修改
> [`application.yml`](https://gitee.com/dromara/Jpom/blob/master/modules/server/src/main/resources/config_default/application.yml)
> 文件中 `jpom.path` 配置属性。

```shell
# 一键默认安装
curl -fsSL https://jpom.top/docs/install.sh | bash -s Server jdk+default
# 一键默认安装 + 自动配置开机自启服务
curl -fsSL https://jpom.top/docs/install.sh | bash -s Server jdk+default+service

# 安装服务端和 jdk 环境
yum install -y wget && \
wget -O install.sh https://jpom.top/docs/install.sh && \
bash install.sh Server jdk

# 安装服务端和 jdk、maven 环境
yum install -y wget && \
wget -O install.sh https://jpom.top/docs/install.sh && \
bash install.sh Server jdk+mvn

# ubuntu
apt-get install -y wget && \
wget -O install.sh https://jpom.top/docs/install.sh && \
bash install.sh Server jdk
```

启动成功后，服务端的端口为 `2122`，可通过 `http://127.0.0.1:2122/`
访问管理页面（如果不是本机访问，需要把 127.0.0.1 换成您安装的服务器 IP 地址）。

> 如无法访问管理系统，执行命令 `systemctl status firewalld` 检查下是否开启了防火墙
> ，如状态栏看到绿色显示 `Active: active (running)` 需要放行 `2122` 端口。
>
>```bash
># 放行管理系统的 2122 端口
>firewall-cmd --add-port=2122/tcp --permanent
># 重启防火墙才会生效
>firewall-cmd --reload
>```
>
>如果在操作系统上放行了端口仍无法访问，并且您使用的是云服务器，请到云服务器后台中检查安全组规则是否放行 2122 端口。
>
>⚠️ 注意： Linux 系统中有多种防火墙：Firewall、Iptables、SELinux 等，再检查防火墙配置时候需要都检查一下。

#### 一键安装插件端

> 如果安装服务端的服务器也需要被管理，在服务端上也需要安装插件端（同一个服务器中可以同时安装服务端和插件端）
>
> ⚠️ 特别提醒：一键安装的时候注意执行命令不可在同一目录下，即 Server 端和 Agent 端不可安装在同一目录下！
>
> 如果需要修改插件端数据、日志存储的路径请修改
> [`application.yml`](https://gitee.com/dromara/Jpom/blob/master/modules/agent/src/main/resources/config_default/application.yml)
> 文件中 `jpom.path` 配置属性。

```shell
# 一键默认安装
curl -fsSL https://jpom.top/docs/install.sh | bash -s Agent jdk+default
# 一键默认安装 + 自动配置开机自启服务
curl -fsSL https://jpom.top/docs/install.sh | bash -s Agent jdk+default+service

# 安装插件端和 jdk 环境
yum install -y wget && \
wget -O install.sh https://jpom.top/docs/install.sh && \
bash install.sh Agent jdk

# ubuntu
apt-get install -y wget && \
wget -O install.sh https://jpom.top/docs/install.sh && \
bash install.sh Agent jdk
```

启动成功后，插件端的端口为 `2123`，插件端提供给服务端使用。

### 方式二：📦 容器化安装

> ⚠️ 注意：容器化安装方式需要先安装 docker，[点击跳转docker安装文档](https://jpom.top/pages/b63dc5/)

#### 一条命令安装

```shell
docker run -p 2122:2122 --name jpom-server jpomdocker/jpom
```

#### 使用挂载方式存储相关数据（在部分环境可能出现兼容性问题）

1. 阿里仓库

```shell
docker pull registry.cn-chengdu.aliyuncs.com/jpomdocker/jpom
mkdir -p /home/jpom-server/logs
mkdir -p /home/jpom-server/data
mkdir -p /home/jpom-server/conf
docker run -d -p 2122:2122 \
	--name jpom-server \
	-v /home/jpom-server/logs:/usr/local/jpom-server/logs \
	-v /home/jpom-server/data:/usr/local/jpom-server/data \
	-v /home/jpom-server/conf:/usr/local/jpom-server/conf \
	jpomdocker/jpom
```

2. dockerhub 仓库

```shell
docker pull jpomdocker/jpom
mkdir -p /home/jpom-server/logs
mkdir -p /home/jpom-server/data
mkdir -p /home/jpom-server/conf
docker run -d -p 2122:2122 \
	--name jpom-server \
	-v /home/jpom-server/logs:/usr/local/jpom-server/logs \
	-v /home/jpom-server/data:/usr/local/jpom-server/data \
	-v /home/jpom-server/conf:/usr/local/jpom-server/conf \
	jpomdocker/jpom
```

#### 使用容器卷方式存储相关数据

1. 阿里仓库

```shell
docker pull registry.cn-chengdu.aliyuncs.com/jpomdocker/jpom
docker volume create jpom-server-data
docker volume create jpom-server-logs
docker volume create jpom-server-conf
docker run -d -p 2122:2122 \
	--name jpom-server \
	-v jpom-server-data:/usr/local/jpom-server/data \
	-v jpom-server-logs:/usr/local/jpom-server/logs \
	-v jpom-server-conf:/usr/local/jpom-server/conf \
	jpomdocker/jpom
```

2. dockerhub 仓库

```shell
docker pull jpomdocker/jpom
docker volume create jpom-server-data
docker volume create jpom-server-logs
docker volume create jpom-server-conf
docker run -d -p 2122:2122 \
	--name jpom-server \
	-v jpom-server-data:/usr/local/jpom-server/data \
	-v jpom-server-logs:/usr/local/jpom-server/logs \
	-v jpom-server-conf:/usr/local/jpom-server/conf \
	jpomdocker/jpom
```

> 容器化安装仅提供服务端版。由于容器和宿主机环境隔离，而导致插件端的很多功能无法正常使用，因此对插件端容器化意义不大。
>
> 安装docker、配置镜像、自动启动、查找安装后所在目录等可参考文档
> [https://jpom.top/pages/b63dc5/](https://jpom.top/pages/b63dc5/)
>
> 在低版本 docker 中运行可能出现 `ls: cannot access'/usr/local/jpom-server/lib/': Operation not permitted`
> 错误，此时需要添加 `--privileged` 参数
> 如：`docker run -p 2122:2122 --name jpom-server jpomdocker/jpom --privileged`

### 方式三：💾 下载安装

1. 下载安装包 [https://jpom.top/pages/all-downloads/](https://jpom.top/pages/all-downloads/)
2. 解压文件
3. 安装插件端
	1. `agent-x.x.x-release` 目录为插件端的全部安装文件
	2. 上传到对应服务器（整个目录）
	3. 启动插件端，Windows 环境用 bat 脚本，Linux 环境用 sh 脚本。（如果出现乱码或者无法正常执行，请检查编码格式、换行符是否匹配。）
	4. 插件端默认运行端口：`2123`
4. 安装服务端
	1. `server-x.x.x-release` 目录为服务端的全部安装文件
	2. 上传到对应服务器（整个目录）
	3. 启动服务端，Windows 环境用 bat 脚本，Linux 环境用 sh 脚本。（如果出现乱码或者无法正常执行，请检查编码格式、换行符是否匹配。）
	4. 服务端默认运行端口：`2122`，访问管理页面：`http://127.0.0.1:2122/`（非本机访问把 `127.0.0.1` 换成您的服务器 IP 地址）

### 方式四：⌨️ 编译安装

1. 访问 [Jpom](https://gitee.com/dromara/Jpom) 的码云主页，拉取最新完整代码（建议使用 master 分支）
2. 切换到 `web-vue` 目录，执行 `npm install`（vue 环境需要提前搭建和安装依赖包详情可以查看 web-vue 目录下 README.md）
3. 执行 `npm run build` 进行 vue 项目打包
4. 切换到项目根目录执行：`mvn clean package`
5. 安装插件端
	1. 查看插件端安装包 `modules/agent/target/agent-x.x.x-release`
	2. 打包上传服务器运行（整个目录）
	3. 启动插件端，Windows 环境用 bat 脚本，Linux 环境用 sh 脚本。（如果出现乱码或者无法正常执行，请检查编码格式、换行符是否匹配。）
	4. 默认运行端口：`2123`
6. 安装服务端
	1. 查看插件端安装包 `modules/server/target/server-x.x.x-release`
	2. 打包上传服务器运行（整个目录）
	3. 启动服务端，Windows 环境用 bat 脚本，Linux 环境用 sh 脚本。（如果出现乱码或者无法正常执行，请检查编码格式、换行符是否匹配。）
	4. 服务端默认运行端口：`2122`，访问管理页面：`http://127.0.0.1:2122/`（非本机访问把 `127.0.0.1` 换成您的服务器 IP 地址）

> 也可以使用 `script/release.bat` 或 `script/release.sh` 快速打包。

### 方式五：📦 一键启动 docker-compose

- 无需安装任何环境,自动编译构建

> 需要注意修改 `.env` 文件中的 token 值

```shell
yum install -y git
git clone https://gitee.com/dromara/Jpom.git
cd Jpom
docker-compose -f docker-compose.yml up
# docker-compose -f docker-compose.yml up --build
# docker-compose -f docker-compose.yml build --no-cache
# docker-compose -f docker-compose-local.yml up
# docker-compose -f docker-compose-local.yml build --build-arg TEMP_VERSION=.0
# docker-compose -f docker-compose-cluster.yml up --build
```

### 方式六：💻 编译运行

1. 访问 [Jpom](https://gitee.com/dromara/Jpom) 的码云主页 拉取最新完整代码 （建议使用 master 分支，如果想体验新功能可以使用
   dev 分支）
2. 运行插件端
	1. 运行 `org.dromara.jpom.JpomAgentApplication`
	2. 留意控制台打印的默认账号密码信息
	3. 插件端默认运行端口：`2123`
3. 运行服务端
	1. 运行 `org.dromara.jpom.JpomServerApplication`
	2. 服务端默认运行端口：`2122`
4. 构建 vue 页面，切换到 `web-vue` 目录（前提需要本地开发环境有 node、npm 环境）
5. 安装项目 vue 依赖，控制台执行 `npm install`
6. 启动开发模式，控制台执行 `npm run dev`
7. 根据控制台输出的地址访问前端页面：`http://127.0.0.1:3000/`（非本机访问把 `127.0.0.1` 换成您的服务器 IP 地址）

## 管理 Jpom 命令

1. Windows 系统使用 bat 脚本文件。

```bash
# 服务端管理脚本 （命令行）
./bin/Server.bat start   # 启动Jpom服务端
./bin/Server.bat stop    # 停止Jpom服务端
./bin/Server.bat restart # 重启Jpom服务端
./bin/Server.bat status  # 查看Jpom服务端运行状态
# 服务端管理脚本 （控制面板），按照面板提示输入操作
./bin/Server.bat

# 插件端管理脚本
./bin/Agent.bat start   # 启动Jpom插件端
./bin/Agent.bat stop    # 停止Jpom插件端
./bin/Agent.bat restart # 重启Jpom插件端
./bin/Agent.bat status  # 查看Jpom插件端运行状态
# 插件端管理脚本（控制面板），按照面板提示输入操作
./bin/Agent.bat

```

> Windows 系统中执行启动后需要根据日志去跟进启动的状态，如果出现乱码请检查或者修改编码格式，Windows 系统中 bat
> 编码格式推荐为 `GB2312`

2. Linux 系统中使用 sh 脚本文件。

```bash
# 服务端
./bin/Server.sh start     # 启动Jpom服务端
./bin/Server.sh stop      # 停止Jpom服务端
./bin/Server.sh restart   # 重启Jpom服务端
./bin/Server.sh status    # 查看Jpom服务端运行状态
./bin/Service.sh install  # 创建Jpom服务端的应用服务（jpom-server）

# 插件端
./bin/Agent.sh start     # 启动Jpom插件端
./bin/Agent.sh stop      # 停止Jpom插件端
./bin/Agent.sh restart   # 重启Jpom插件端
./bin/Agent.sh status    # 查看Jpom插件端运行状态
./bin/Service.sh install # 创建Jpom插件端的应用服务（jpom-agent）
```

## Linux 服务方式管理

> 这里安装服务仅供参考，实际中可以根据需求自定义配置
>
> 在使用 `./bin/Service.sh install` 成功后
>
> systemctl {status | start | stop | restart} jpom-server
>
> systemctl {status | start | stop | restart} jpom-agent

## ⚙️ Jpom 的参数配置

在项目运行的根路径下的 ：

### 程序配置  `./conf/application.yml`

1. 插件端示例：
   [`application.yml`](https://gitee.com/dromara/Jpom/blob/master/modules/agent/src/main/resources/config_default/application.yml)
2. 服务端示例：
   [`application.yml`](https://gitee.com/dromara/Jpom/blob/master/modules/server/src/main/resources/config_default/application.yml)

### 项目日志  `./conf/logback.xml`

1. 插件端示例：
   [`logback.xml`](https://gitee.com/dromara/Jpom/blob/master/modules/agent/src/main/resources/config_default/logback.xml)
2. 服务端示例：
   [`logback.xml`](https://gitee.com/dromara/Jpom/blob/master/modules/server/src/main/resources/config_default/logback.xml)

## 📝 常见问题、操作说明

- [文档主页](https://jpom.top/)
- [FQA](https://jpom.top/pages/FQA/)
- [名词解释](https://jpom.top/pages/FQA/proper-noun/)

### 实践案例

> 里面有部分图片加载可能比较慢

1. [本地构建 + SSH 发布 java 项目](https://jpom.top/pages/practice/build-java-ssh-release/)
2. [本地构建 + 项目发布 node 项目](https://jpom.top/pages/practice/build-node-release/)
3. [本地构建 + SSH 发布 node 项目](https://jpom.top/pages/practice/build-node-ssh-release/)
4. [本地构建 + 自定义管理 python 项目](https://jpom.top/pages/practice/project-dsl-python/)
5. [自定义管理 java 项目](https://jpom.top/pages/practice/project-dsl-java/)
6. [管理编译安装的 nginx](https://jpom.top/pages/practice/node-nginx/)
7. [管理 docker](https://jpom.top/pages/practice/docker-cli/)
8. [容器构建 + 项目发布 java 项目](https://jpom.top/pages/practice/build-docker-java-node-release/)
9. [更新实践案例>>](https://jpom.top/pages/practice/)

## 构建案例仓库代码

1. [Jboot 案例代码](https://gitee.com/keepbx/Jpom-demo-case/tree/master/jboot-test)
2. [SpringBoot 案例代码(ClassPath)](https://gitee.com/keepbx/Jpom-demo-case/tree/master/springboot-test)
3. [SpringBoot 案例代码(Jar)](https://gitee.com/keepbx/Jpom-demo-case/tree/master/springboot-test-jar)
4. [node vue 案例代码(antdv)](https://gitee.com/keepbx/Jpom-demo-case/tree/master/antdv)
5. [python 案例代码](https://gitee.com/keepbx/Jpom-demo-case/tree/master/python)

> Node.js 编译指定目录：

```bash
yarn --cwd xxxx/ install
yarn --cwd xxxx/ build
```

> Maven 编译指定目录：

```bash
mvn -f xxxx/pom.xml clean package
```

## 🛠️ 整体架构

![jpom-func-arch](https://jpom.top/images/jpom-func-arch.png)


## 🐞 交流讨论 、反馈 BUG、提出建议等

1. 快扫描下方左侧微信群二维码和我们一起交流讨论吧！（添加小助手：备注 Jpom 进群）
2. 开源项目离不开社区的支持，如果项目帮助到了您，并且想给我们加个餐。
   欢迎扫描下方[微信、支付宝收款码赞赏](https://jpom.top/images/qrcode/praise-all.png)
   或通过[码云赞赏](https://gitee.com/dromara/Jpom)
   （在项目首页下方点击捐赠，支持微信和支付宝）。[赞赏记录](https://jpom.top/pages/praise/publicity/)
3. 购买开源周边商品：[周边介绍](https://jpom.top/pages/shop/)
4. 企业技术服务请单独与我们联系沟通服务方案
5. 反馈 BUG、提出建议，欢迎新建：[issues](https://gitee.com/dromara/Jpom/issues)，开发人员会不定时查看回复。
6. 参与贡献，请查看[贡献指南](#贡献指南)。


## 🔨贡献指南

> 提交贡献即认为签署了 [CLA](https://gitee.com/dromara/Jpom/blob/master/CLA.md) 协议

### 贡献须知

Jpom 作为开源项目，离不开社区的支持，欢迎任何人修改和提出建议。贡献无论大小，您的贡献会帮助背后成千上万的使用者以及开发者，您做出的贡献也会永远的保留在项目的贡献者名单中，这也是开源项目的意义所在！

为了保证项目代码的质量与规范，以及帮助您更快的了解项目的结构，请在贡献之前阅读：

- [Jpom 贡献说明](https://gitee.com/dromara/Jpom/blob/master/CODE_OF_CONDUCT.md)
- [中英文排版规范](https://gitee.com/dromara/Jpom/blob/dev/typography-specification.md)

### 贡献步骤

1. Fork 本仓库。

2. Fork 后会在您的账号下多了一个和本仓库一模一样的仓库，把您账号的仓库 clone 到本地。

   注意替换掉链接中的`分支名`和`用户名`。

   如果是贡献代码，分支名填 `dev`；如果是贡献文档，分支名填 `docs`

   ```bash
   git clone -b 分支名 https://gitee.com/用户名/Jpom.git
   ```

3. 修改代码/文档，修改后提交上来。

   ```bash
   # 把修改的文件添加到暂存区
   git add .
   # 提交到本地仓库，说明您具体做了什么修改
   git commit -m '填写您做了什么修改'
   # 推送到远程仓库，分支名替换成 dev 或者 docs
   git push origin 分支名
   ```

4. 登录您的仓库，然后会看到一条 PR 请求，点击请求合并，等待管理员把您的代码合并进来。

### 项目分支说明

| 分支     | 说明                                                   |
|--------|------------------------------------------------------|
| master | 主分支，受保护分支，此分支不接受 PR。在 beta 分支后经过测试没问题后会合并到此分支。       |
| beta   | beta 版本 分支，受保护分支，此分支不接受 PR。在 dev 分支后经过测试没问题后会合并到此分支。 |
| dev    | 开发分支，接受 PR，PR 请提交到 dev 分支。                           |
| docs   | 项目文档分支，接受 PR，介绍项目功能、汇总常见问题等。                         |

> 目前用到的主要是 dev 和 docs 分支，接受 PR 修改，其他的分支为归档分支，贡献者可以不用管。


## 🔔 精品项目推荐

| 项目名称          | 项目地址                                                                       | 项目介绍                                          |
|---------------|----------------------------------------------------------------------------|-----------------------------------------------|
| SpringBoot_v2 | [https://gitee.com/bdj/SpringBoot_v2](https://gitee.com/bdj/SpringBoot_v2) | 基于springboot的一款纯净脚手架                          |
| TLog GVP 项目   | [https://gitee.com/dromara/TLog](https://gitee.com/dromara/TLog)           | 一个轻量级的分布式日志标记追踪神器，10分钟即可接入，自动对日志打标签完成微服务的链路追踪 |
| Sa-Token      | [https://gitee.com/dromara/sa-token](https://gitee.com/dromara/sa-token)   | 这可能是史上功能最全的 Java 权限认证框架！                      |
| Erupt         | [https://gitee.com/erupt/erupt](https://gitee.com/erupt/erupt)             | 零前端代码，纯注解开发 admin 管理后台                        |
| hippo4j       | [https://gitee.com/magegoofy/hippo4j](https://gitee.com/magegoofy/hippo4j) | 强大的动态线程池框架，附带监控报警功能。                          |
| HertzBeat     | [https://gitee.com/dromara/hertzbeat](https://gitee.com/dromara/hertzbeat) | 易用友好的云监控系统, 无需 Agent, 强大自定义监控能力。              |




# 参考资料

https://github.com/dromara/Jpom

* any list
{:toc}



