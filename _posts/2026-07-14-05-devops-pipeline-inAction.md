---
layout: post 
title: core-plateform-05-devops pipeline mac 安装笔记
date: 2026-10-24 21:01:55 +0800
categories: [Core]
tags: [core]
published: true
---


# 要去

请为我的 Mac 生成详细研发流水线安装方案。芯片：apple；内存：16GB；主要用途：full；代码托管：gitea。

优先考虑本地私有化、资源占用、数据持久化、JDK17+、权限和可恢复性。给出可直接复制的配置文件和命令。


# Mac 本地研发流水线：完整安装方案

针对你的 Apple Silicon Mac、16GB 内存、Gitea 自建代码托管，以及 Java 17+、本地构建、测试、Docker 部署的完整需求，我建议采用：

Gitea + Jenkins LTS + 独立构建/发布 Agent + Docker Compose。

先不安装 Harbor、SonarQube、独立 PostgreSQL 和 Kubernetes。16GB 内存足够你运行一套轻量的本地研发流水线，但同时运行 IDE、大型 Java 项目和多个容器时，需要控制并发。

## 最终架构

Mac 本机

IDE / Terminal / Git

Gitea

代码、仓库、PR

端口 3000

Jenkins

触发、编排、日志

端口 8080

独立 Agent

JDK 21 + Maven + Docker CLI

编译 → 测试 → 打包 → 构建镜像 → 本地部署

本地制品与应用

JAR / Docker Image / 本地运行服务

持久化数据保存在 Mac 上的专用目录；所有 Web 服务默认只绑定本机地址，不对局域网开放。

为什么仍然选择 Jenkins，而不是直接用 Gitea Actions？因为你前面想建设的是可逐步演进的研发流水线，Jenkins 在共享流水线、执行节点隔离、发布控制和插件生态方面更灵活。Gitea 专注代码管理，Jenkins 专注 CI/CD，职责清晰。Gitea 与 Jenkins 均可通过容器部署；Docker Desktop 自带 Docker Engine 和 Compose。

[image](https://www.google.com/s2/favicons?domain=https://docs.gitea.com\&sz=32)

Gitea Documentation

+2



## 一、先准备 Mac

### 1. 安装 Docker Desktop

[Docker Desktop for Mac 官方安装指南](https://docs.docker.com/desktop/setup/install/mac-install/?utm_source=chatgpt.com)

安装 Apple Silicon 版本，启动后在终端检查：

```
docker --version
docker compose version
docker info
```

`docker info` 能正常返回服务端信息，才算 Docker Engine 已经启动。

#### 版本的选择

```
uname -m

x86_64
```

判断输出：
- arm64 → 下载 Apple silicon 版本。
- x86_64 → 下载 Intel chip 版本。

发现两个都不行。


#### 命令的安装方式

1）安装 homebrew

```
% /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
Homebrew on macOS is only supported on Apple Silicon processors!
```






### 2. 分配 Docker 资源

Docker Desktop 设置中，建议先从以下配置开始：

| 设置           | 建议值          |
| ------------ | ------------ |
| Docker CPU   | 4 核左右        |
| Docker 内存    | 6 GB         |
| Swap         | 1–2 GB       |
| 磁盘镜像空间       | 60–100 GB 起步 |
| Jenkins 并发构建 | 1            |

16GB 内存不要全部分配给 Docker。macOS、IDE 和浏览器仍然需要内存；如果后续要跑大型 Maven 多模块项目，再逐步调整。

### 3. 创建目录

下面的方案使用宿主机目录保存重要数据，便于备份、迁移和检查。

```
mkdir -p ~/devops-ci/{data/gitea,data/jenkins,backup,config}
cd ~/devops-ci

chmod 700 ~/devops-ci
chmod 700 ~/devops-ci/backup
```

项目源码可以继续放在你平时使用的开发目录中，不需要全部搬进这个目录。

## 二、一次性创建配置文件

下面创建一套 Compose 配置。先启动 Gitea 和 Jenkins，完成初始化后，再注册 Agent。

### 1. 创建 `.env`

```
cd ~/devops-ci

cat > .env <<'EOF'
TZ=Asia/Tokyo
JENKINS_AGENT_SECRET=replace-me-after-agent-creation
EOF

chmod 600 .env
```

这个文件用于保存本地配置。不要把 `.env` 提交到 Git 仓库。

### 2. 创建 `compose.yaml`

```
services:
  gitea:
    image: docker.gitea.com/gitea:1
    container_name: devops-gitea
    restart: unless-stopped
    environment:
      USER_UID: "1000"
      USER_GID: "1000"
      TZ: ${TZ}
      GITEA__server__ROOT_URL: http://localhost:3000/
      GITEA__server__DOMAIN: localhost
      GITEA__server__SSH_DOMAIN: localhost
      GITEA__server__SSH_PORT: "2222"
      GITEA__service__DISABLE_REGISTRATION: "true"
    ports:
      - "127.0.0.1:3000:3000"
      - "127.0.0.1:2222:22"
    volumes:
      - ./data/gitea:/data
    networks:
      - devops
    healthcheck:
      test: ["CMD-SHELL", "curl -fsS http://127.0.0.1:3000/api/healthz || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 5
      start_period: 30s

  jenkins:
    image: jenkins/jenkins:lts-jdk21
    container_name: devops-jenkins
    restart: unless-stopped
    environment:
      TZ: ${TZ}
      JAVA_OPTS: >-
        -Xms256m
        -Xmx1536m
        -XX:+UseG1GC
    ports:
      - "127.0.0.1:8080:8080"
    volumes:
      - ./data/jenkins:/var/jenkins_home
    networks:
      - devops
    mem_limit: 2g
    cpus: 2.0

  agent:
    build:
      context: ./config/agent
    container_name: devops-agent
    restart: unless-stopped
    init: true
    environment:
      JENKINS_URL: http://jenkins:8080/
      JENKINS_AGENT_NAME: mac-docker
      JENKINS_SECRET: ${JENKINS_AGENT_SECRET}
      JENKINS_AGENT_WORKDIR: /home/jenkins/agent
      JENKINS_WEB_SOCKET: "true"
      TZ: ${TZ}
    volumes:
      - agent-workspace:/home/jenkins/agent
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - devops
    depends_on:
      - jenkins
    mem_limit: 3g
    cpus: 3.0
    profiles:
      - ci

networks:
  devops:
    driver: bridge

volumes:
  agent-workspace:
```

这份配置做了几项重要限制：

- Gitea 和 Jenkins 只监听本机回环地址。
- Gitea 使用本地持久化目录，暂时采用默认 SQLite，减少数据库容器。
- Jenkins 通过 `-Xmx1536m` 限制 JVM 最大堆内存。
- Agent 独立运行，不在 Jenkins Controller 中执行构建。
- Agent 使用 Docker Socket 进行本地镜像构建和部署；这相当于授予 Agent 很高的 Docker 管理权限，因此只能运行你信任的流水线，不能执行不可信 PR 的任意脚本。
- Agent 放在 `ci` Profile 下，避免初始化 Jenkins 时就因尚未创建 Agent 而启动失败。

Gitea 官方提供了 Docker Compose 部署方式，并支持用持久化卷保存数据。

[image](https://www.google.com/s2/favicons?domain=https://docs.gitea.com\&sz=32)

Gitea Documentation



### 3. 创建构建 Agent 镜像

```
mkdir -p ~/devops-ci/config/agent
cd ~/devops-ci/config/agent
```

创建 `Dockerfile`：

```

FROM jenkins/inbound-agent:jdk21

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       maven docker.io git curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

USER jenkins

```

这里安装的是 JDK 21、Maven 和 Docker CLI。虽然 `docker.io` 包可能包含 Docker Engine 相关文件，但我们不在这个 Agent 容器里启动守护进程；Docker 命令通过挂载的 Socket 与 Docker Desktop 通信。

在构建环境中还应使用项目自带的 Maven Wrapper（`./mvnw`），让项目锁定自己的 Maven 版本。

> 注意：以上使用的是方便初始化的标签。完成首次验证后，应将镜像固定到经过测试的明确版本，并定期更新；不要把 `latest` 或浮动标签当作可复现的生产版本。

## 三、启动 Gitea 和 Jenkins

在项目根目录执行：

```
cd ~/devops-ci

docker compose config
docker compose up -d gitea jenkins
docker compose ps
```

检查日志：

```
docker compose logs --tail=100 gitea
docker compose logs --tail=100 jenkins
```

如果 Gitea 的健康检查一直显示 `unhealthy`，但服务实际上可以访问，可能是镜像中没有 `curl`。这时先删除 `compose.yaml` 中的 `healthcheck` 部分，再执行：

```
docker compose up -d --force-recreate gitea
```

### 1. 初始化 Gitea

打开 [http://localhost:3000](http://localhost:3000?utm_source=chatgpt.com)。

首次启动进入安装页面时，建议使用：

- 数据库：SQLite3。
- 仓库根目录：保持默认的 `/data/git/repositories`。
- 应用 URL：`http://localhost:3000/`。
- SSH 端口：`2222`。
- 不允许公开注册。

完成初始化后，创建管理员账号，再创建一个专门用于开发的组织，例如 `local-dev`。

之后可以创建仓库，例如 `demo-java-app`。

### 2. 初始化 Jenkins

打开 [http://localhost:8080](http://localhost:8080?utm_source=chatgpt.com)。

获取首次启动密码：

```
docker exec devops-jenkins \
  cat /var/jenkins_home/secrets/initialAdminPassword
```

输入密码后，安装推荐插件并创建管理员账号。

在 Jenkins 中确认安装了以下插件：

- Pipeline。
- Git。
- Credentials Binding。
- JUnit。
- SSH Build Agents 不需要，因为这里使用 inbound Agent。

不需要为了这个方案安装几十个额外插件。插件越少，升级、许可证审查和恢复工作就越简单。

## 四、注册独立构建 Agent

这是把流水线真正跑起来的关键步骤。

1. 进入 Jenkins → Manage Jenkins → Nodes（不同版本的菜单名称可能略有不同）。
2. 创建一个永久节点，名称为 `mac-docker`。
3. 远程工作目录填写 `/home/jenkins/agent`。
4. 标签填写 `mac-docker`。
5. 启动方式选择通过 WebSocket 连接的 inbound Agent，或按当前版本提供的等效选项。
6. 保存后，获取该节点对应的 Secret。

把 `.env` 中的 `JENKINS_AGENT_SECRET` 替换成真实 Secret：

```
cd ~/devops-ci
nano .env
```

不要把 Secret 放进 `Jenkinsfile`、Git 仓库或聊天记录。

然后启动 Agent：

```
docker compose --profile ci up -d --build agent
docker compose logs -f agent
```

在 Jenkins 节点页面确认 `mac-docker` 显示为在线。

### Agent 安全说明

这个 Agent 可以通过 Docker Socket 创建、删除容器和镜像，因此实际上拥有很高的 Docker 管理权限。它适合你的个人可信代码仓库，但不适合运行陌生人提交的 PR。

如果将来要开放给其他开发者使用，应该拆成：

- `java-build`：只编译和测试，不挂 Docker Socket。
- `local-deploy`：只执行受信任的部署流水线，才挂 Docker Socket。

这比单纯依赖 Jenkins 的 Job 权限更可靠。

## 五、创建第一个完整 CI/CD 项目

我们用一个最小的 Spring Boot / Maven 项目作为模板。你的实际项目只需要有 Maven Wrapper、`pom.xml` 和一个 `Dockerfile`。

### 1. 项目 `Dockerfile`

在 Java 项目根目录创建：

```

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

```

如果你的项目是 Java 17，基础镜像也可以改成 `eclipse-temurin:17-jre`。建议运行时 JDK 与项目的目标 Java 版本保持一致。

### 2. 项目 `Jenkinsfile`

```

pipeline {
    agent {
        label 'mac-docker'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(
            numToKeepStr: '20',
            artifactNumToKeepStr: '10'
        ))
    }

    environment {
        IMAGE_NAME = 'local/demo-java-app'
        CONTAINER_NAME = 'demo-java-app'
        APP_PORT = '8081'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git rev-parse HEAD'
            }
        }

        stage('Build and Test') {
            steps {
                sh '''
                    set -eu
                    chmod +x mvnw
                    ./mvnw -B -ntp clean verify
                '''
            }
            post {
                always {
                    junit(
                        testResults: '**/target/surefire-reports/*.xml,**/target/failsafe-reports/*.xml',
                        allowEmptyResults: false
                    )
                }
            }
        }

        stage('Package') {
            steps {
                sh '''
                    set -eu
                    test -n "$(find . -path '*/target/*.jar' -type f -print -quit)"
                '''
                archiveArtifacts(
                    artifacts: '**/target/*.jar',
                    fingerprint: true
                )
            }
        }

        stage('Build Image') {
            steps {
                sh '''
                    set -eu
                    docker build \
                      --label "org.opencontainers.image.revision=$(git rev-parse HEAD)" \
                      -t "${IMAGE_NAME}:${BUILD_NUMBER}" .
                '''
            }
        }

        stage('Deploy Local') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    set -eu

                    docker rm -f "${CONTAINER_NAME}" 2>/dev/null || true

                    docker run -d \
                      --name "${CONTAINER_NAME}" \
                      --restart unless-stopped \
                      -p "127.0.0.1:${APP_PORT}:8080" \
                      "${IMAGE_NAME}:${BUILD_NUMBER}"
                '''
            }
        }

        stage('Smoke Test') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    set -eu
                    echo "等待应用启动..."
                    sleep 5
                    docker ps --filter "name=${CONTAINER_NAME}"
                '''
            }
        }
    }
}

```

这份是入门模板，不是生产发布脚本。 它假设项目根目录下存在 Dockerfile，并且应用能在 8080 端口启动。正式使用时应增加应用健康检查、发布前状态校验、失败回滚、制品摘要和发布审计。

另外，当前示例会在部署前删除同名容器。它适合本地演示，但并没有完整实现发布幂等或零停机部署。正式改进时，应以 `releaseId` 和目标环境状态为依据，避免在结果未知时直接重复部署。

### 3. Gitea 仓库连接 Jenkins

将项目推送到 Gitea 后，在 Jenkins 创建 Pipeline Job：

- Pipeline 定义选择 `Pipeline script from SCM`。
- SCM 选择 Git。
- Repository URL 填写 `http://gitea:3000/local-dev/demo-java-app.git`。
- 如果是私有仓库，添加仅具有只读权限的 Git 凭据。
- Script Path 使用 `Jenkinsfile`。

由于 Jenkins 和 Gitea 在同一个 Docker 网络内，Jenkins 可以使用服务名 `gitea` 访问 Gitea；浏览器则使用 `localhost:3000`。

如果使用私有仓库，请优先用只读凭据，不要在 URL 中直接写用户名和密码。

### 4. 自动触发构建

第一阶段可以手动点击 Build Now，确认全链路正常。

第二阶段再配置 Gitea Webhook：

- Payload URL：`http://jenkins:8080/` 对应的实际触发端点，或使用 Jenkins 的 Gitea 集成插件提供的触发地址。
- 选择 Push 事件。
- 设置 Webhook Secret。
- 验证重复事件不会造成重复部署。

不同 Jenkins 插件的 Webhook URL 和触发方式可能不同，因此不要直接假设根路径 `/` 就能触发构建。先选择确定的插件或使用轮询方案，再按该插件文档配置准确的回调路径。

## 六、备份与恢复

本地部署最大的风险通常不是流水线不能跑，而是 Mac 磁盘空间不足、误删数据、升级后无法启动，或 Jenkins 数据损坏。

### 1. 创建备份脚本

在 `~/devops-ci` 下创建 `backup.sh`：

```

#!/usr/bin/env bash
set -euo pipefail

cd "$HOME/devops-ci"

mkdir -p backup
STAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE="backup/devops-ci-${STAMP}.tar.gz"

# 停止服务，避免备份期间数据库或配置继续变化
docker compose --profile ci stop

# 备份 Gitea、Jenkins 数据和部署配置
tar -czf "$ARCHIVE" \
  data \
  compose.yaml \
  config

shasum -a 256 "$ARCHIVE" > "${ARCHIVE}.sha256"

# 重新启动服务
docker compose --profile ci up -d

echo "备份完成：$ARCHIVE"
echo "校验文件：${ARCHIVE}.sha256"

```

赋予执行权限：

```
chmod +x ~/devops-ci/backup.sh
~/devops-ci/backup.sh
```

这个脚本会短暂停止流水线服务。备份完成后应确认容器已经重新启动；如果备份命令失败，脚本可能不会执行到重新启动服务的步骤。

建议把备份文件复制到外置硬盘或其他独立存储。备份放在同一块 Mac 磁盘上，只能防误操作，不能防磁盘故障。

不要把 `.env` 中的 Agent Secret 直接放进普通备份包。若需要完整恢复，应将密钥和凭据恢复材料单独加密保管。

### 2. 恢复方式

恢复前先校验文件：

```
cd ~/devops-ci
shasum -a 256 -c backup/devops-ci-YYYYMMDD-HHMMSS.tar.gz.sha256
```

然后停止容器，将现有 `data` 目录另行保存，再从经过校验的备份中恢复数据。确认配置和密钥恢复材料可用后，启动：

```
docker compose --profile ci up -d
docker compose ps
```

首次恢复后，检查：

- Gitea 仓库是否完整。
- Jenkins Job、凭据引用和插件是否存在。
- Agent 是否在线。
- 最近的流水线能否重新执行。
- 本地应用是否可以重新部署。

Jenkins 的运行状态和凭据恢复依赖完整的 `JENKINS_HOME` 及对应密钥文件，不能只备份 `Jenkinsfile`。恢复演练比单纯确认压缩包存在更重要。

## 七、资源、权限与日常运维

### 建议的日常操作命令

```
cd ~/devops-ci

# 查看运行状态
docker compose ps

# 查看服务日志
docker compose logs --tail=100 gitea jenkins

# 启动基础服务
docker compose up -d gitea jenkins

# 启动 Agent
docker compose --profile ci up -d agent

# 停止所有服务
docker compose --profile ci down

# 查看 Docker 资源使用
docker stats
```

`docker compose down` 默认不会删除持久化数据目录，但不要随意执行 `docker compose down -v`，因为 `-v` 会删除相关命名卷；误操作可能丢失数据。

### 本地安全基线

- Gitea 禁止公开注册，使用强密码。
- Jenkins 只允许本机访问，启用登录认证。
- Git 读取凭据与部署凭据分离。
- 只允许可信代码使用挂载 Docker Socket 的 Agent。
- `.env`、Jenkins 凭据和 SSH 私钥不能进入 Git。
- 定期清理旧镜像、无用容器、构建缓存和过期日志。
- 记录 Jenkins、Gitea、Agent 的镜像版本，升级前先备份。

如果未来将这套环境用于商业工作，还需要单独核对 Docker Desktop 的订阅条款。官方说明，个人使用和符合条件的小企业可以免费使用，但大型企业商业使用可能需要付费订阅。

[image](https://www.google.com/s2/favicons?domain=https://docs.docker.com\&sz=32)

Docker Docs



## 八、建议的安装顺序与验收标准

不要一次性把所有功能都装完。按这个顺序，每完成一步就验证一次。

## 安装验收清单

0/7 已完成

Docker Desktop 已启动

docker info 和 docker compose version 正常

Gitea 已初始化

能够创建仓库、推送和拉取代码

Jenkins 已初始化

管理员登录成功，数据目录持久化

Agent 已上线

mac-docker 节点在线，Java 和 Maven 可用

Java 构建成功

clean verify 成功，测试报告可查看

本地部署成功

Docker 镜像构建成功，应用可访问

备份恢复验证

恢复后仓库、Job 和凭据均可正常使用

复制验收清单

官方参考文档：

- [Docker Desktop for Mac](https://docs.docker.com/desktop/setup/install/mac-install/?utm_source=chatgpt.com)
- [Gitea Docker 安装](https://docs.gitea.com/installation/install-with-docker/?utm_source=chatgpt.com)
- [Jenkins Docker 安装](https://www.jenkins.io/doc/book/installing/docker/?utm_source=chatgpt.com)
- [Jenkins Pipeline](https://www.jenkins.io/doc/book/pipeline/?utm_source=chatgpt.com)

最后强调一个架构取舍： 你的 Mac 既是开发机，也是流水线服务器。当前方案适合个人使用和验证，但它不是高可用部署。如果未来需要每天持续构建、多人协作或长期保存重要发布记录，下一步最值得做的不是增加更多工具，而是把构建执行器迁到一台独立 Linux 主机上，让 Mac 主要承担开发、管理和操作入口的职责。



# 参考资料

* any list
{:toc}