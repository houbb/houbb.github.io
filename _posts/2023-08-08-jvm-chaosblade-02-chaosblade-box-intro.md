---
layout: post
title: ChaosBlade-02-Chaosblade-box：一个具有丰富场景的混沌工程平台
date:  2023-08-08 +0800
categories: [JVM]
tags: [jvm, bytebuddy, bytecode, chaos-engineering, sh]
published: true
---



# Chaosblade-box：一个具有丰富场景的混沌工程平台

## 简介

Chaosblade-box 是一个具有丰富场景的混沌工程平台，当前包含的场景有：

* [chaosblade-exec-os](https://github.com/chaosblade-io/chaosblade-exec-os)：基础资源实验场景的实现。

* [chaosblade-exec-docker](https://github.com/chaosblade-io/chaosblade-exec-docker)：Docker 容器实验场景的实现，通过调用 Docker API 进行标准化。

* [chaosblade-operator](https://github.com/chaosblade-io/chaosblade-operator)：Kubernetes 平台实验场景的实现，混沌实验通过 Kubernetes 标准的 CRD 方法进行定义，使用 Kubernetes 资源操作方法（如 kubectl、client-go 等）非常方便地创建、更新和删除实验场景，同时也可以使用上述的 chaosblade cli 工具。

* [chaosblade-exec-jvm](https://github.com/chaosblade-io/chaosblade-exec-jvm)：Java 应用实验场景的实现，使用 Java Agent 技术动态挂载，无需任何访问，零成本使用，还支持卸载并完全回收 Agent 创建的各种资源。

* [chaosblade-exec-cplus](https://github.com/chaosblade-io/chaosblade-exec-cplus)：C++ 应用实验场景的实现，使用 GDB 技术进行方法和代码行级的实验场景注入。

* [limus-chaos-generic](https://github.com/litmuschaos/litmus)：一个用于进行云原生混沌工程的工具集。

## 编译

进入克隆的项目根目录并执行编译：

```bash
mvn clean package -Dmaven.test.skip=true
```

如果要编译 chaosblade-box 镜像，可以执行：

```bash
make build_image
```

清理编译：

```bash
mvn clean
```

helm 打包：

```bash
helm package deploy/chaosblade-box
```

## 主机应用预运行

1. 如果没有安装 Ansible，您需要安装 `ansible`：

```bash
# 检查是否已安装
ansible --version

# 安装 ansible，例如：Fedora 或 RedHat
yum install ansible -y
```

2. 如果没有安装 expect，您需要安装 `expect`，并将 [sshKey.sh](https://github.com/chaosblade-io/chaosblade-box/blob/main/ssh/sshKey.sh) 和 chaosblade-box-1.0.5.jar 放到一个目录下：

```bash
# 检查是否已安装
expect -v

# 安装 expect，例如：Fedora 或 RedHat
yum install expect -y
```

3. 生成公钥：

```bash
# 检查是否已有密钥，如果有，删除之前的备份
ls ~/.ssh
rm -rf ~/.ssh/*

# 生成公钥
ssh-keygen -t rsa
```

## 运行应用

如果您已经安装了 MySQL，您需要创建一个名为 `chaosblade` 的 schema。

如果您没有安装 MySQL，可以通过 Docker 运行，运行方法如下：

```bash
docker run -d -it -p 3306:3306 \
            -e MYSQL_DATABASE=chaosblade \
            -e MYSQL_ROOT_PASSWORD=[DATASOURCE_PASSWORD] \
            --name mysql-5.6 mysql:5.6 \
            --character-set-server=utf8mb4 \
            --collation-server=utf8mb4_unicode_ci \
            --default-time_zone='+8:00' \
            --lower_case_table_names=1
```
注意：您必须替换以下参数：`DATASOURCE_HOST`、`DATASOURCE_USERNAME`、`DATASOURCE_PASSWORD`、`BOX-HOST`（例如：`*.*.*.*:7001`）。

然后运行应用，运行方法如下：

```bash
nohup java -Duser.timezone=Asia/Shanghai -jar chaosblade-box-1.0.0.jar --spring.datasource.url="jdbc:mysql://DATASOURCE_HOST:3306/chaosblade?characterEncoding=utf8&useSSL=false" --spring.datasource.username=DATASOURCE_USERNAME --spring.datasource.password=DATASOURCE_PASSWORD --chaos.server.domain=BOX-HOST> chaosblade-box.log 2>&1 &
```

您可以通过浏览器访问 [http://127.0.0.1:7001](http://127.0.0.1:7001) 网站来使用该平台。

如果您部署在 Kubernetes 上，使用方法如下：

```bash
helm install chaosblade-box chaosblade-box-1.0.0.tgz --namespace chaosblade --set spring.datasource.password=DATASOURCE_PASSWORD
```

您可以通过服务获取 BOX-HOST，使用浏览器访问 [http://10.10.10.03:7001](http://10.10.10.03:7001) 网站来使用该平台。

```bash
➜  shell kubectl get services -n chaosblade
NAME                        TYPE           CLUSTER-IP       EXTERNAL-IP      PORT(S)           AGE
chaosblade-box              LoadBalancer   192.168.255.01   10.10.10.03     7001:32250/TCP    12h
chaosblade-box-mysql        ClusterIP      192.168.168.02    <none>           3306/TCP          12h
```

## 参数解析
* `spring.datasource.url`：MySQL 的 URL。如果使用 helm 启动，则无需赋值。
* `spring.datasource.username`：MySQL 的用户名。如果使用 helm 启动，则无需赋值。
* `spring.datasource.password`：MySQL 密码。必填。
* `chaos.function.sync.type`：初始化混沌数据。如果是首次启动，可以使用 `ALL`。可用值：`ALL`、`ChaosBlade`、`UserApp`、`None`、`LITMUS_CHAOS`。默认值为 `ALL`。
* `chaos.agent.version`：chaosblade-box-agent 版本。默认值为 `1.0.0`。
* `chaos.agent.repository`：chaosblade-box-agent 镜像仓库。默认值为 `chaosbladeio/chaosblade-agent`。
* `chaos.agent.url`：chaosblade-box-agent 二进制包的 URL。默认值为 `https://chaosblade.oss-cn-hangzhou.aliyuncs.com/platform/release/1.0.0/chaosagent.tar.gz`。
* `chaos.agent.helm`：chaosblade-box-agent 的 helm 包 URL。默认值为 `https://chaosblade.oss-cn-hangzhou.aliyuncs.com/platform/release/1.0.0/chaosblade-box-agent-1.0.0.tgz`。

## 错误报告与反馈
如有错误报告、问题或讨论，请提交 [GitHub Issues](https://github.com/chaosblade-io/chaosblade-box/issues)。

您还可以通过以下方式联系我们：
* 钉钉群（推荐中文用户）：23177705
* Slack 群组：[chaosblade-io](https://join.slack.com/t/chaosblade-io/shared_invite/zt-f0d3r3f4-TDK13Wr3QRUrAhems28p1w)
* Gitter 房间：[chaosblade community](https://gitter.im/chaosblade-io/community)
* 邮箱：chaosblade.io.01@gmail.com
* Twitter：[chaosblade.io](https://twitter.com/ChaosbladeI)

## 贡献
我们欢迎每一项贡献，即使只是标点符号的修正。详情请参见 [CONTRIBUTING](CONTRIBUTING.md)。

## 企业注册
我们开源项目的初衷是降低企业实施混沌工程的门槛，因此我们非常重视项目在企业中的使用。欢迎大家在这里注册 [ISSUE](https://github.com/chaosblade-io/chaosblade/issues/32)。注册后，您将被邀请加入企业邮件组，共同讨论企业中实施混沌工程遇到的问题，并分享实施经验。

## 许可
Chaosblade-box 采用 Apache License 2.0 许可协议。完整的许可文本请参见 [LICENSE](LICENSE)。

# 参考资料

https://chaosblade.io/docs

* any list
{:toc}