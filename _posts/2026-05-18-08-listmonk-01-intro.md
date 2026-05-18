---
layout: post 
title: knadh/listmonk：高性能、可自托管的新闻通讯和邮件列表管理器
date: 2026-05-18 21:01:55 +0800
categories: [AI]
tags: [ai, biz]
published: true
---


# GitHub - knadh/listmonk：高性能、可自托管的新闻通讯和邮件列表管理器，配备现代化仪表盘，单个二进制文件 · GitHub

listmonk 是一个独立的、可自托管的新闻通讯和邮件列表管理器。它**速度快、功能丰富**，并且打包为**单个二进制文件**。它使用 **PostgreSQL** 数据库作为其数据存储。访问 [listmonk.app](https://listmonk.app) 了解更多信息。查看 [**在线演示**](https://demo.listmonk.app)。

## 安装

### Docker

最新镜像可在 DockerHub 上获取：[`listmonk/listmonk:latest`](https://hub.docker.com/r/listmonk/listmonk/tags?page=1&ordering=last_updated&name=latest)。下载并使用示例 [docker-compose.yml](https://github.com/knadh/listmonk/blob/master/docker-compose.yml) 文件。

```bash
# 下载 compose 文件到当前目录
curl -LO https://github.com/knadh/listmonk/raw/master/docker-compose.yml

# 在后台运行服务
docker compose up -d
```
访问 `http://localhost:9000`

参见[安装文档](https://listmonk.app/docs/installation)。

---

### 二进制文件

*   下载[最新发布版本](https://github.com/knadh/listmonk/releases)并解压 `listmonk` 二进制文件。
*   运行 `./listmonk --new-config` 生成 `config.toml` 配置文件，然后编辑它。
*   运行 `./listmonk --install` 来设置 PostgreSQL 数据库（或使用 `--upgrade` 升级现有数据库。升级是幂等的，多次运行不会有副作用）。
*   运行 `./listmonk`，然后访问 `http://localhost:9000`。

参见[安装文档](https://listmonk.app/docs/installation)。

---

## 开发者

listmonk 是采用 **AGPLv3** 许可证的自由开源软件。如果您有兴趣贡献代码，请参考[开发者设置指南](https://listmonk.app/docs/developer-setup)。后端使用 **Go** 编写，前端使用 **Vue** 和 **Buefy** 构建 UI。

## 许可证

listmonk 采用 AGPL v3 许可证。

## 关于

高性能、可自托管的新闻通讯和邮件列表管理器，配备现代化仪表盘。单个二进制文件。[listmonk.app](https://listmonk.app)

### 话题

[电子邮件营销](https://github.com/topics/email-marketing)、[自托管](https://github.com/topics/self-hosted)、[新闻通讯](https://github.com/topics/newsletter)、[SMTP](https://github.com/topics/smtp)、[事务性邮件](https://github.com/topics/transactional-emails)、[营销活动](https://github.com/topics/campaign)、[邮件列表](https://github.com/topics/mailing-list)、[短信网关](https://github.com/topics/sms-gateway)、[邮件订阅](https://github.com/topics/email-subscription)、[新闻通讯管理](https://github.com/topics/newsletter-management)、[新闻通讯软件](https://github.com/topics/newsletter-software)、[营销活动管理](https://github.com/topics/campaign-management)、[listmonk](https://github.com/topics/listmonk)

### 资源

### 许可证

### 贡献

### 安全政策

### 哎呀！加载时出错。
请重新加载此页面。

[活动](https://github.com/knadh/listmonk/activity)

### Stars

[**20.7k** stars](https://github.com/knadh/listmonk/stargazers)

### Watchers

[**133** watching](https://github.com/knadh/listmonk/watchers)

### Forks

[**2.2k** forks](https://github.com/knadh/listmonk/forks)

[举报仓库](https://github.com/contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fknadh%2Flistmonk&report=knadh+%28user%29)

## [Releases 40](https://github.com/knadh/listmonk/releases)

[**v6.1.0** 最新版本，2026年3月29日](https://github.com/knadh/listmonk/releases/tag/v6.1.0) [+ 39 个发布版本](https://github.com/knadh/listmonk/releases)

## [Packages 1](https://github.com/users/knadh/packages?repo_name=listmonk)

*   [listmonk](https://github.com/users/knadh/packages/container/package/listmonk)

### 哎呀！加载时出错。
请重新加载此页面。

## [Contributors 246](https://github.com/knadh/listmonk/graphs/contributors)

[+ 232 位贡献者](https://github.com/knadh/listmonk/graphs/contributors)

## 语言构成

*   **Go 41.3%**
*   **Vue 24.9%**
*   **JavaScript 19.7%**
*   **TypeScript 8.8%**
*   HTML 1.8%
*   SCSS 1.6%
*   其他 1.9%

## 最新提交

[Koushik-1729](https://github.com/knadh/listmonk/commits?author=Koushik-1729) 和 [koushik-reddy25](https://github.com/knadh/listmonk/commits?author=koushik-reddy25) [fix: prevent nil pointer crash in BounceWebhook when bounce processin…](https://github.com/knadh/listmonk/commit/0db024ab64e7780dc85eb611bb33e9902a8b1d3e)，2026年5月15日 [`0db024a`](https://github.com/knadh/listmonk/commit/0db024ab64e7780dc85eb611bb33e9902a8b1d3e) · 2026年5月15日

## 历史记录

[**1,975 次提交**](https://github.com/knadh/listmonk/commits/master/)

| 名称 | 最后提交信息 | 最后提交日期 |
|---|---|---|
| [.devcontainer](https://github.com/knadh/listmonk/tree/master/.devcontainer) | [修复过时的 Docker 本地开发套件 (](https://github.com/knadh/listmonk/commit/98934e601eb50e073e138b7c34a7b735570cf39e)[#2200](https://github.com/knadh/listmonk/pull/2200)[)](https://github.com/knadh/listmonk/commit/98934e601eb50e073e138b7c34a7b735570cf39e) | 2024年12月11日 |
| [.github](https://github.com/knadh/listmonk/tree/master/.github) | [将 Hodor 升级到 0.3.4（添加了 python3、shellcheck、file、diffstat）(](https://github.com/knadh/listmonk/commit/1d33d95d30e933f9ac4a16cbf4f56d86ee84f155)[#2943](https://github.com/knadh/listmonk/pull/2943)[)](https://github.com/knadh/listmonk/commit/1d33d95d30e933f9ac4a16cbf4f56d86ee84f155) | 2025年6月11日 |

---

<details>
<summary>📋 补充背景信息（基于第三方资料整理）</summary>

**核心定位**

listmonk 是一个**高性能、可自托管**的邮件列表和新闻通讯管理器。它被设计为一个完整的解决方案，用于管理订阅者、创建和发送营销活动以及处理弹回邮件。

**核心价值**

*   **单一二进制文件**：无需复杂的依赖环境，下载即可运行。
*   **高性能**：后端使用 Go 语言编写，能够高效处理大规模邮件发送。
*   **自托管**：用户拥有完全的数据控制权。
*   **现代化仪表盘**：提供直观的 Web 界面，方便管理。

**技术架构**

*   **后端**：Go 语言。
*   **前端**：Vue.js + Buefy UI 组件库。
*   **数据库**：PostgreSQL。

**功能特性**

*   订阅者管理（支持导入/导出）。
*   创建和发送邮件营销活动。
*   支持自定义模板（使用 WYSIWYG 编辑器）。
*   弹回邮件处理。
*   提供 REST API。
*   支持多用户。

</details>

# 参考资料

* any list
{:toc}