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

# chat

## 介绍一下 Jpom

Jpom 是一款开源的持续集成/持续部署（CI/CD）系统，它专门针对 Java 开发的项目进行构建、部署和管理。

它提供了一套功能强大的工具，帮助开发团队实现自动化构建、测试和部署，从而提高开发效率和软件质量。

以下是 Jpom 的一些主要特性和功能：

1. **Web 界面管理**: Jpom 提供了直观友好的 Web 界面，可以通过浏览器轻松管理项目、配置构建和部署任务。

2. **项目管理**: Jpom 允许用户创建和管理多个项目，并为每个项目配置不同的构建和部署规则。

3. **持续集成**: Jpom 支持持续集成，可以自动从版本控制系统（如 Git）拉取代码，并在每次提交或定时触发时执行构建任务。

4. **构建任务配置**: 用户可以通过 Jpom 配置构建任务，包括编译、打包、测试、静态代码分析等，以及构建成功后的处理方式。

5. **部署管理**: Jpom 允许用户配置自动化部署任务，支持将构建好的应用程序部署到指定的服务器上，可以通过 SSH、FTP 等方式进行部署。

6. **多环境支持**: Jpom 支持多个环境（如开发环境、测试环境、生产环境）的配置和管理，可以针对不同环境配置不同的构建和部署规则。

7. **权限管理**: Jpom 提供了细粒度的权限管理功能，可以根据用户角色对项目和任务进行权限控制，确保安全性和可控性。

8. **日志和报告**: Jpom 会记录构建和部署过程的日志，用户可以通过 Web 界面查看详细的构建日志和部署状态，便于故障排查和监控。

9. **插件扩展**: Jpom 支持插件扩展机制，用户可以根据需要安装和使用各种插件，扩展系统的功能和灵活性。

总的来说，Jpom 是一款功能强大、易于使用的 CI/CD 工具，适用于 Java 开发的项目，能够帮助开发团队实现自动化构建、测试和部署，提高开发效率和软件质量。

## jpom 的核心实现流程和底层原理

Jpom 的核心实现流程主要包括项目配置、构建、部署和监控等步骤，其底层原理涉及到版本控制、构建工具、部署方式等方面。

下面是 Jpom 的核心实现流程和底层原理的详细解释：

1. **项目配置**：
   - 用户通过 Jpom 的 Web 界面创建项目，并配置项目的基本信息，如项目名称、源代码仓库地址、构建脚本、部署目标等。
   - 用户可以为项目配置构建触发条件，如定时触发、提交代码触发等。

2. **构建**：
   - 当触发条件满足时，Jpom 会从指定的版本控制系统（如 Git）拉取代码，并根据用户配置的构建脚本执行构建任务。
   - 构建过程包括编译源代码、运行测试、生成部署包等步骤，具体的构建任务由用户在项目配置中定义。

3. **部署**：
   - 构建成功后，Jpom 可以自动将构建好的部署包部署到预先配置的部署目标，如服务器。
   - 部署方式可以是通过 SSH、FTP 等协议进行文件传输，也可以是调用远程部署脚本实现自定义的部署逻辑。

4. **监控与日志**：
   - 在整个构建和部署过程中，Jpom 会记录详细的日志信息，包括构建日志、部署日志等，方便用户查看和排查问题。
   - Jpom 还提供了监控功能，可以实时监控构建和部署的状态，及时发现和处理异常情况。

底层原理方面，Jpom 主要依赖以下技术和工具实现：

- **版本控制系统**（如 Git）：用于管理项目的源代码，Jpom 可以从版本控制系统中获取最新的代码，并触发构建任务。
  
- **构建工具**（如 Maven、Gradle）：用于编译、打包和测试项目，Jpom 可以调用构建工具执行项目的构建任务。

- **部署方式**：Jpom 支持多种部署方式，可以通过 SSH、FTP 等协议将构建好的部署包传输到目标服务器，并执行部署操作。

- **日志记录和监控**：Jpom 使用日志记录工具记录构建和部署过程中的详细日志信息，同时提供监控功能，实时监测构建和部署任务的状态。

综上所述，Jpom 的核心实现流程涵盖了项目配置、构建、部署和监控等步骤，其底层原理涉及到版本控制、构建工具、部署方式等多个方面的技术和工具。

## jpom 的入门使用教程，详细

以下是 Jpom 的入门使用教程，详细介绍了如何安装、配置和使用 Jpom 进行持续集成和持续部署：

### 步骤 1：安装 Jpom

1. **准备环境**：
   - 确保服务器上已安装 Java 运行环境（Java 8 或以上版本）和 Maven（如果需要构建 Java 项目）。
   - 确保服务器上已安装 Git 或其他版本控制系统（如果需要从代码仓库拉取代码）。

2. **下载 Jpom**：
   - 前往 Jpom 的官方网站或 GitHub 仓库下载最新版本的 Jpom。
   - 解压下载的 Jpom 压缩包到服务器的指定目录。

3. **配置数据库**：
   - Jpom 使用 MySQL 或 SQLite 作为数据库存储数据，需提前准备好数据库，并创建对应的数据库和用户。
   - 修改 Jpom 的配置文件 `jpom/application.yml`，配置数据库连接信息。

4. **启动 Jpom**：
   - 在 Jpom 的安装目录下执行命令 `./jpom.sh start`（Linux）或 `./jpom.bat start`（Windows）启动 Jpom 服务。
   - 访问 `http://your-server-ip:2122`（默认端口为 2122）即可进入 Jpom 的 Web 界面。

### 步骤 2：创建项目

1. **登录 Jpom**：
   - 首次访问 Jpom 时需要设置管理员账户和密码，完成注册后即可登录。

2. **创建项目**：
   - 进入 Jpom 的 Web 界面后，点击界面左侧的“项目管理”，然后点击“新增项目”按钮。
   - 输入项目名称、Git 仓库地址等信息，点击“保存”按钮创建项目。

### 步骤 3：配置构建任务

1. **编辑项目**：
   - 在项目列表中点击要编辑的项目，进入项目详情页面。

2. **配置构建任务**：
   - 在项目详情页面的“构建设置”中，点击“新增构建”按钮。
   - 配置构建任务的触发条件、构建脚本等信息，并保存配置。

### 步骤 4：执行构建

1. **手动触发构建**：
   - 在项目详情页面的“构建设置”中，点击“构建”按钮手动触发构建任务。
   - Jpom 将从代码仓库拉取最新的代码，并根据配置的构建任务执行构建过程。

### 步骤 5：部署项目

1. **配置部署任务**：
   - 在项目详情页面的“部署设置”中，点击“新增部署”按钮配置部署任务。
   - 配置部署目标、部署路径、部署脚本等信息，并保存配置。

2. **手动触发部署**：
   - 在项目详情页面的“部署设置”中，点击“部署”按钮手动触发部署任务。
   - Jpom 将部署构建好的部署包到指定的部署目标。

### 步骤 6：监控和日志

1. **查看日志**：
   - 在项目详情页面的“构建日志”和“部署日志”中可以查看构建和部署过程的详细日志信息。

2. **监控任务状态**：
   - 在项目列表页面可以查看所有项目的构建和部署任务的状态，及时发现和处理异常情况。

### 其他操作

- **插件扩展**：根据需要安装和使用各种插件，扩展 Jpom 的功能和灵活性。
- **权限管理**：在系统设置中配置用户角色和权限，控制用户对项目和任务的访问权限。

通过以上步骤，您可以完成 Jpom 的安装、配置和基本使用，实现持续集成和持续部署。

随着对 Jpom 的进一步了解和实践，您还可以深入探索更多高级功能和技巧。

# 官方教程

ps: 以内内容来自官方网站，作为后续学习之用。

## 😭 日常开发中，您是否有以下痛点？

- <font color="red">**团队中没有专业的运维，开发还要做运维的活**</font>，需要自己手动构建、部署项目。
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
> 让 Jpom 来帮你解决这些痛点吧！然而，这些只是 Jpom 解决的最基础的功能。

### 😁 使用 [Jpom](https://gitee.com/dromara/Jpom) 后

- 方便的用户管理
	1. 用户操作监控，监控指定用户指定操作以邮件形式通知
	2. 多用户管理，用户项目权限独立（上传、删除权限可控制），完善的操作日志，使用工作空间隔离权限
	3. 账号可以开启 **MFA 两步验证**提高账号安全性
- 界面形式实时查看项目运行状态、控制台日志、管理项目文件
	1. 在线修改项目文本文件
- Docker 容器管理、Docker swarm 集群管理（**Docker ui**）
- **在线 SSH 终端**，让您在没有 Xshell、FinalShell 等软件也能轻松管理服务器
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
- 重要路径白名单模式，杜绝用户误操作系统文件

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
访问管理页面（如果不是本机访问，需要把 127.0.0.1 换成你安装的服务器 IP 地址）。

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
>如果在操作系统上放行了端口仍无法访问，并且你使用的是云服务器，请到云服务器后台中检查安全组规则是否放行 2122 端口。
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
	1. agent-x.x.x-release 目录为插件端的全部安装文件
	2. 上传到对应服务器（整个目录）
	3. 启动插件端，Windows 环境用 bat 脚本，Linux 环境用 sh 脚本。（如果出现乱码或者无法正常执行，请检查编码格式、换行符是否匹配。）
	4. 插件端默认运行端口：`2123`
4. 安装服务端
	1. server-x.x.x-release 目录为服务端的全部安装文件
	2. 上传到对应服务器（整个目录）
	3. 启动服务端，Windows 环境用 bat 脚本，Linux 环境用 sh 脚本。（如果出现乱码或者无法正常执行，请检查编码格式、换行符是否匹配。）
	4. 服务端默认运行端口：`2122`，访问管理页面：`http://127.0.0.1:2122/`（非本机访问把 127.0.0.1 换成你的服务器 IP 地址）

### 方式四：⌨️ 编译安装

1. 访问 [Jpom](https://gitee.com/dromara/Jpom) 的码云主页，拉取最新完整代码（建议使用 master 分支）
2. 切换到 `web-vue` 目录，执行 `npm install`（vue 环境需要提前搭建和安装依赖包详情可以查看 web-vue 目录下 README.md）
3. 执行 `npm run build` 进行 vue 项目打包
4. 切换到项目根目录执行：`mvn clean package`
5. 安装插件端
	1. 查看插件端安装包 modules/agent/target/agent-x.x.x-release
	2. 打包上传服务器运行（整个目录）
	3. 启动插件端，Windows 环境用 bat 脚本，Linux 环境用 sh 脚本。（如果出现乱码或者无法正常执行，请检查编码格式、换行符是否匹配。）
	4. 默认运行端口：`2123`
6. 安装服务端
	1. 查看插件端安装包 modules/server/target/server-x.x.x-release
	2. 打包上传服务器运行（整个目录）
	3. 启动服务端，Windows 环境用 bat 脚本，Linux 环境用 sh 脚本。（如果出现乱码或者无法正常执行，请检查编码格式、换行符是否匹配。）
	4. 服务端默认运行端口：`2122`，访问管理页面：`http://127.0.0.1:2122/`（非本机访问把 127.0.0.1 换成你的服务器 IP 地址）

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
6. 启动开发模式，控制台执行 `npm run serve`
7. 根据控制台输出的地址访问前端页面：`http://127.0.0.1:3000/`（非本机访问把 127.0.0.1 换成你的服务器 IP 地址）

## 管理 Jpom 命令

1. Windows 系统使用 bat 脚本文件。

```bash
# 服务端管理脚本 （命令行）
./bin/Server.bat start 启动Jpom服务端
./bin/Server.bat stop 停止Jpom服务端
./bin/Server.bat restart 重启Jpom服务端
./bin/Server.bat status 查看Jpom服务端运行状态
# 服务端管理脚本 （控制面板），按照面板提示输入操作
./bin/Server.bat

# 插件端管理脚本
./bin/Agent.bat start 启动Jpom插件端
./bin/Agent.bat stop 停止Jpom插件端
./bin/Agent.bat restart 重启Jpom插件端
./bin/Agent.bat status 查看Jpom插件端运行状态
# 插件端管理脚本（控制面板），按照面板提示输入操作
./bin/Agent.bat

```

> Windows 系统中执行启动后需要根据日志去跟进启动的状态，如果出现乱码请检查或者修改编码格式，Windows 系统中 bat
> 编码格式推荐为 `GB2312`

2. Linux 系统中使用 sh 脚本文件。

```bash
# 服务端
./bin/Server.sh start     启动Jpom服务端
./bin/Server.sh stop      停止Jpom服务端
./bin/Server.sh restart   重启Jpom服务端
./bin/Server.sh status    查看Jpom服务端运行状态
./bin/Service.sh install    创建Jpom服务端的应用服务（jpom-server）

# 插件端
./bin/Agent.sh start     启动Jpom插件端
./bin/Agent.sh stop      停止Jpom插件端
./bin/Agent.sh restart   重启Jpom插件端
./bin/Agent.sh status    查看Jpom插件端运行状态
./bin/Service.sh install     创建Jpom插件端的应用服务（jpom-agent）
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

## 构建案例仓库代码

1. [Jboot 案例代码](https://gitee.com/keepbx/Jpom-demo-case/tree/master/jboot-test)
2. [SpringBoot 案例代码(ClassPath)](https://gitee.com/keepbx/Jpom-demo-case/tree/master/springboot-test)
3. [SpringBoot 案例代码(Jar)](https://gitee.com/keepbx/Jpom-demo-case/tree/master/springboot-test-jar)
4. [node vue 案例代码(antdv)](https://gitee.com/keepbx/Jpom-demo-case/tree/master/antdv)
5. [python 案例代码](https://gitee.com/keepbx/Jpom-demo-case/tree/master/python)

> nodejs 编译指定目录：

```bash
yarn --cwd xxxx/ install
yarn --cwd xxxx/ build
```

> maven 编译指定目录：

```bash
mvn -f xxxx/pom.xml clean package
```

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

## 🛠️ 整体架构

![jpom-func-arch](https://jpom.top/images/jpom-func-arch.jpg)

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



