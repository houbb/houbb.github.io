---
layout: post 
title: Harbor 是一个开源的可信云原生仓库项目，用于存储、签名和扫描内容。
date: 2026-04-09 21:01:55 +0800
categories: [DevOps]
tags: [devops, docker, harbor]
published: true
---

# Harbor

**注意**：开发期间 `main` 分支可能处于*不稳定甚至损坏状态*。

为了获得稳定的二进制文件，请使用[发行版](https://github.com/goharbor/harbor/releases)而不是 `main` 分支。

Harbor 是一个开源的可信云原生仓库项目，用于存储、签名和扫描内容。

Harbor 扩展了开源 Docker Distribution，增加了用户通常所需的安全、身份和管理功能。

将仓库置于更靠近构建和运行环境的位置可以提高镜像传输效率。Harbor 支持仓库间的镜像复制，并提供高级安全特性，如用户管理、访问控制和活动审计。

Harbor 由[云原生计算基金会](https://cncf.io)（CNCF）托管。

如果您是一个希望帮助塑造云原生技术演进的组织，请考虑加入 CNCF。有关谁参与以及 Harbor 如何发挥作用的详细信息，请阅读 CNCF [公告](https://www.cncf.io/blog/2018/07/31/cncf-to-host-harbor-in-the-sandbox/)。

## 特性

* **云原生仓库**：同时支持容器镜像和 [Helm](https://helm.sh) chart，Harbor 可作为容器运行时和编排平台等云原生环境的仓库。
* **基于角色的访问控制**：用户通过“项目”访问不同的仓库，用户对项目下的镜像或 Helm chart 可拥有不同的权限。
* **基于策略的复制**：基于策略（使用过滤器：仓库、标签和标签）可以在多个仓库实例之间复制（同步）镜像和 chart。如果遇到任何错误，Harbor 会自动重试复制。这可用于辅助负载均衡、实现高可用，并促进混合云和多云场景中的多数据中心部署。
* **漏洞扫描**：Harbor 定期扫描镜像中的漏洞，并通过策略检查阻止有漏洞的镜像被部署。
* **LDAP/AD 支持**：Harbor 与现有企业 LDAP/AD 集成，用于用户认证和管理，并支持将 LDAP 组导入 Harbor，然后赋予其特定项目的权限。
* **OIDC 支持**：Harbor 利用 OpenID Connect (OIDC) 验证由外部授权服务器或身份提供者认证的用户身份。可以启用单点登录登录 Harbor 门户。
* **镜像删除与垃圾回收**：系统管理员可以运行垃圾回收作业，以便删除镜像（悬空的 manifest 和未引用的 blob）并定期释放其空间。
* **Notary**：支持使用 Docker Content Trust（基于 Notary）对容器镜像进行签名，以保证真实性和来源。此外，还可以激活阻止未签名镜像被部署的策略。
* **图形化用户门户**：用户可以轻松浏览、搜索仓库和管理项目。
* **审计**：对仓库的所有操作都会通过日志进行跟踪。
* **RESTful API**：提供 RESTful API 以方便管理操作，并易于与外部系统集成。内置 Swagger UI 可用于探索和测试 API。
* **轻松部署**：Harbor 可以通过 Docker Compose 以及 Helm Chart 进行部署，最近还添加了 Harbor Operator。

## 架构

了解 Harbor 的架构设计，请查阅文档 [Harbor 架构概览](https://github.com/goharbor/harbor/wiki/Architecture-Overview-of-Harbor)。

## API

* Harbor RESTful API：提供 Harbor 大部分管理操作的 API，可用于以编程方式与 Harbor 集成。
  * 第 1 部分：[新增或更改的 API](https://editor.swagger.io/?url=https://raw.githubusercontent.com/goharbor/harbor/main/api/v2.0/swagger.yaml)

## 安装与运行
**系统要求：**

**在 Linux 主机上：** docker 20.10.10-ce+ 和 docker-compose 1.18.0+。

下载 **[Harbor 发行版](https://github.com/goharbor/harbor/releases)** 的二进制文件，并按照 **[安装与配置指南](https://goharbor.io/docs/latest/install-config/)** 安装 Harbor。

如果要在 Kubernetes 上部署 Harbor，请使用 **[Harbor chart](https://github.com/goharbor/harbor-helm)**。

有关如何使用 Harbor 的更多详细信息，请参阅 **[文档](https://goharbor.io/docs/)**。

### 验证发布签名
从 v2.15.0 开始，Harbor 发布构件使用 Cosign 进行加密签名，以确保真实性和完整性。

从 Harbor 发布页面下载安装程序和签名包。

#### 快速验证
```bash
# 安装 Cosign（v2.0+）
brew install sigstore/tap/cosign

# 验证签名
cosign verify-blob \
  --bundle harbor-offline-installer-v2.15.0.tgz.sigstore.json \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp '^https://github.com/goharbor/harbor/.github/workflows/publish_release.yml@refs/tags/v.*$' \
  harbor-offline-installer-v2.15.0.tgz
```
- *预期输出：* Verified OK

- *完整验证指南：* [docs/signature-verification.md](docs/signature-verification.md)

## OCI Distribution 一致性测试

查看 Harbor 的 OCI Distribution 一致性测试[报告](https://storage.googleapis.com/harbor-conformance-test/report.html)。

## 兼容性

[兼容性列表](https://goharbor.io/docs/edge/install-config/harbor-compatibility-list/)文档提供了 Harbor 组件的兼容性信息。

* [复制适配器](https://goharbor.io/docs/edge/install-config/harbor-compatibility-list/#replication-adapters)
* [OIDC 适配器](https://goharbor.io/docs/edge/install-config/harbor-compatibility-list/#oidc-adapters)
* [扫描器适配器](https://goharbor.io/docs/edge/install-config/harbor-compatibility-list/#scanner-adapters)

## 社区

* **Twitter：** [@project_harbor](https://twitter.com/project_harbor)
* **用户组：** 加入 Harbor 用户邮件组：[harbor-users@lists.cncf.io](https://lists.cncf.io/g/harbor-users) 获取 Harbor 新闻、功能、发布的更新，或提供建议和反馈。
* **开发者组：** 加入 Harbor 开发者邮件组：[harbor-dev@lists.cncf.io](https://lists.cncf.io/g/harbor-dev) 讨论 Harbor 开发和贡献。
* **Slack：** 加入 Harbor 社区进行讨论和提问：[云原生计算基金会](https://slack.cncf.io/)，频道：[#harbor](https://cloud-native.slack.com/messages/harbor/) 和 [#harbor-dev](https://cloud-native.slack.com/messages/harbor-dev/)

## 演示

* **[在线演示](https://demo.goharbor.io)** - 一个安装了最新稳定版 Harbor 的演示环境。更多信息请参考[此页面](https://goharbor.io/docs/latest/install-config/demo-server/)。
* **[视频演示](https://github.com/goharbor/harbor/wiki/Video-demos-for-Harbor)** - Harbor 功能演示，持续更新。

## 合作伙伴与用户

用户列表请参阅 [ADOPTERS.md](ADOPTERS.md)。

## 安全

### 安全审计

2019 年 10 月，第三方安全审计由 Cure53 完成。您可以[在此](https://goharbor.io/docs/2.0.0/security/Harbor_Security_Audit_Oct2019.pdf)查看完整报告。

### 报告安全漏洞

如果您在 Harbor 中发现了安全相关问题、漏洞或潜在漏洞，请将漏洞详细信息告知 [Harbor 安全团队](mailto:cncf-harbor-security@lists.cncf.io)。我们会发送确认邮件以确认收到您的报告，并在我们肯定或否定地确认问题后发送另一封邮件。

更多详细信息请参阅完整的[安全发布流程](SECURITY.md)。

## 许可证

Harbor 在 [Apache 2 许可证](LICENSE) 下可用。

本项目使用的开源组件可能有额外的许可条款。这些开源组件的官方 Docker 镜像和许可条款可在以下位置找到：

* Photon OS 1.0：[Docker 镜像](https://hub.docker.com/_/photon/)，[许可证](https://github.com/vmware/photon/blob/master/COPYING)

## Fossa 状态

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fgoharbor%2Fharbor.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fgoharbor%2Fharbor?ref=badge_large)

# 参考资料

* any list
{:toc}