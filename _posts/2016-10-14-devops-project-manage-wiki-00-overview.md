---
layout: post
title: 项目管理文档 wiki-00-企业级的文档管理 wiki 
date:  2016-10-14 10:15:54 +0800
categories: [Devops]
tags: [devops, project-manage, wiki]
published: true
---

# 拓展阅读

[Devops-01-devops 是什么？](https://houbb.github.io/2016/10/14/devops-01-overview)

[Devops-02-Jpom 简而轻的低侵入式在线构建、自动部署、日常运维、项目监控软件](https://houbb.github.io/2016/10/14/devops-02-jpom)

[代码质量管理 SonarQube-01-入门介绍](https://houbb.github.io/2016/10/14/devops-sonarqube-01-intro)

[项目管理平台-01-jira 入门介绍 缺陷跟踪管理系统，为针对缺陷管理、任务追踪和项目管理的商业性应用软件](https://houbb.github.io/2016/10/14/project-manage-jira-01-intro)

[项目管理平台-01-Phabricator 入门介绍 一套集成的强大工具，帮助公司构建更高质量的软件](https://houbb.github.io/2016/10/14/project-manage-phabricator-01-overview)

[持续集成平台 01 jenkins 入门介绍](https://houbb.github.io/2016/10/14/devops-jenkins-01-intro)

[持续集成平台 02 jenkins plugin 插件](https://houbb.github.io/2016/10/14/devops-jenkins-02-plugin)

[test coverate-05-测试覆盖率 SonarQube 是一个综合性的代码质量管理平台，其中包含了对测试覆盖率的支持](https://houbb.github.io/2016/04/26/test-coverage-05-sonarqube)

[Docker learn-29-docker 安装 sonarQube with mysql](https://houbb.github.io/2019/12/18/docker-learn-29-install-devops-sonar)

# 主流

主流企业文档管理系统：

1. PingCode；
2. Worktile；
3. 飞书文档；
4. 语雀；
5. 腾讯文档；
6. Confluence；
7. Google Docs。
8. 石墨文档；
9. WPS Office；
10. Zoho Docs；
11. Confluence。

# 工具概览

以下是对企业级文档 Wiki 管理工具的详细信息，包括开发语言、是否开源、免费情况等：

| 序号 | 工具名称      | 开发语言        | 是否开源 | 免费情况          | 适用行业                | 私有部署支持      |
|------|---------------|-----------------|----------|-------------------|-------------------------|-------------------|
| 1    | Notion    | JavaScript (React) | 否       | 免费版提供基础功能，付费版功能更丰富 | 小型团队、个人项目管理 | 支持（企业版可私有部署） |
| 2    | GitBook   | JavaScript (Node.js) | 是       | 免费版功能有限，付费版支持高级功能和团队协作 | 开发团队、技术团队       | 支持               |
| 3    | MediaWiki | PHP             | 是       | 完全免费           | 大中型企业、知识库管理   | 支持（可自行部署）  |
| 4    | Tiki Wiki CMS Groupware | PHP         | 是       | 完全免费           | 中小型企业、教育机构     | 支持（可自行部署）  |
| 5    | DokuWiki  | PHP             | 是       | 完全免费           | 小型团队、企业协作       | 支持（可自行部署）  |
| 6    | Slite     | JavaScript (React) | 否       | 免费版支持小团队，付费版有更多协作功能 | 中小型团队、企业协作   | 不支持             |
| 7    | Zoho Wiki | Java             | 否       | 免费版有限制，付费版有更多功能 | 中小型企业、跨部门协作 | 支持（Zoho 企业版） |
| 8    | Nuclino   | JavaScript (React) | 否       | 免费版提供基本功能，付费版提供更多协作功能 | 小型团队、创意团队     | 支持（企业版可私有部署） |
| 9    | XWiki     | Java             | 是       | 完全免费（社区版），企业版付费 | 大中型企业、技术团队   | 支持（可自行部署）  |
| 10   | Evernote Business | Java (Android), Swift (iOS) | 否       | 提供免费基础功能，付费版有更多功能 | 中小型企业、团队协作   | 不支持             |
| 11   | Coda      | JavaScript (React) | 否       | 免费版提供基础功能，付费版提供更多功能 | 创意团队、产品管理     | 不支持             |

## 详细说明

- Notion: 是一款功能强大的文档管理和团队协作工具，支持自定义模板和数据库，适合小型团队使用。其基础版免费，但企业版需要付费，支持私有部署。

- GitBook: 主要针对技术团队，提供文档管理、版本控制和团队协作功能，免费版功能有限，付费版有更多企业级功能，支持私有部署。

- MediaWiki: 一款经典的开源 Wiki 软件，非常适合大规模文档管理。完全免费，支持扩展和自定义，支持私有部署。

- Tiki Wiki CMS Groupware: 提供 Wiki、文档管理、任务管理等功能，是一款功能全面的开源工具，完全免费，支持私有部署。

- DokuWiki: 轻量级的开源 Wiki，易于使用且支持插件扩展。免费，支持私有部署，适合小型团队使用。

- Slite: 专注于文档协作，界面简洁直观，适合团队协作和共享文档。免费版有使用限制，付费版提供更多协作功能，但不支持私有部署。

- Zoho Wiki: 与 Zoho 的其他工具（如 Zoho Projects、Zoho CRM）无缝集成，适合跨部门协作。提供免费版，企业版有更多功能，支持私有部署。

- Nuclino: 专注于知识共享和团队协作，支持实时编辑。免费版适合小型团队，付费版提供更多团队协作功能，支持私有部署。

- XWiki: 强大的开源 Wiki 系统，支持文档协作、权限管理、定制化。免费版支持所有基本功能，企业版支持更多高级功能，支持私有部署。

- Evernote Business: 适合笔记管理和团队协作，提供免费基础功能，付费版支持更多团队协作功能，但不支持私有部署。

- Coda: 集成了文档、表格、任务等功能，支持灵活的视图和协作功能。免费版提供基础功能，付费版有更多高级功能，但不支持私有部署。

这些工具大多支持在线服务，也提供了私有部署选项，可以根据团队或公司的需求选择合适的工具进行文档和知识管理。

# chat

## 企业级的文档 wiki 管理，除了 confluence 还有哪些？



* any list
{:toc}
