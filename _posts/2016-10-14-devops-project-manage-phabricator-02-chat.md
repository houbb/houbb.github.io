---
layout: post
title: 项目管理平台-01-Phabricator 聊一聊
date:  2016-10-14 10:15:54 +0800
categories: [Devops]
tags: [devops, project-manage]
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


# Phabricator 是什么？

Phabricator 是一个功能强大的开源软件开发平台，提供了一系列的工具用于代码评审、任务管理、版本控制集成、项目管理等。它主要用于团队协作和代码质量管理，适用于大型软件开发项目。Phabricator 由 Facebook 的前工程师开发，现由社区维护。以下是 Phabricator 的一些核心功能和特点：

### 1. **代码审查（Differential）**
   Phabricator 的核心功能之一是代码审查（Code Review），通过其 `Differential` 模块，开发者可以提交代码审查请求。团队成员可以对代码进行详细的审查、评论和讨论。这些审查可以包括：
   - **Diffs**：显示两个版本之间的差异，支持单个文件或多个文件的修改比较。
   - **评论和标记**：可以在代码行上添加注释，标记潜在问题或提出改进建议。
   - **自动化检查**：Phabricator 可以与静态代码分析工具和 CI 系统集成，自动检查代码的质量，确保没有常见错误。

### 2. **任务管理（Maniphest）**
   Phabricator 提供了一个名为 `Maniphest` 的任务管理系统，用于追踪任务、缺陷、功能请求等。它允许开发者创建、分配、排序任务，确保项目按时推进。该系统提供了：
   - **任务优先级**：可以设置任务的优先级，帮助团队成员聚焦重要任务。
   - **任务分类**：任务可以被分类、标签化，便于管理和过滤。
   - **进度跟踪**：可以为任务设置状态（如 "待办"、"进行中"、"已完成"）和工作流。
   - **依赖关系**：任务可以有依赖关系，帮助团队了解哪些任务需要先完成。

### 3. **版本控制集成（Git、Mercurial、Subversion）**
   Phabricator 可以与多种版本控制系统集成，支持 Git、Mercurial 和 Subversion。它提供了以下功能：
   - **代码提交和分支管理**：通过 `Diffusion` 模块，可以查看和管理代码仓库，提交记录和分支。
   - **自动化构建与集成**：Phabricator 可以集成 CI/CD 工具，如 Jenkins，自动化测试和构建过程。

### 4. **项目管理（Projects）**
   Phabricator 提供了一个灵活的项目管理工具，允许团队成员组织和分类工作。可以通过设置项目标签来跟踪不同的工作流、优先级、子项目等，进而将任务分配到相应的项目中。

### 5. **文档管理（Conduit）**
   Phabricator 提供了一个名为 `Conduit` 的 API，支持与其他系统集成，自动化操作，或开发自定义功能。它还支持批量导入和导出任务、审查、提交记录等。

### 6. **Wiki 和知识库（Phriction）**
   Phabricator 还包括一个集成的 Wiki 系统，叫做 `Phriction`，用于文档编写和知识共享。它允许团队成员编写和维护项目相关的文档、知识库、开发规范等。

### 7. **安全性和权限控制**
   Phabricator 提供了灵活的权限控制系统，支持对用户和组进行精细化的权限设置。可以控制不同用户或组对任务、代码审查、文档、代码库等的访问权限。

### 8. **多种通知方式**
   Phabricator 支持多种通知方式，包括：
   - **邮件通知**：每当有任务更新、代码审查变更等时，可以通过邮件通知相关人员。
   - **内站通知**：Phabricator 提供了自己的通知中心，用户可以在平台内查看自己的通知。
   - **Slack 集成**：可以与 Slack 等团队通讯工具集成，将通知推送到指定的频道。

### 9. **界面和定制**
   Phabricator 提供了可定制的界面，支持修改主题、插件和外观设置。此外，Phabricator 是一个开源项目，可以根据需求定制和扩展其功能。

### 10. **扩展和插件支持**
   Phabricator 支持通过插件和扩展来增强其功能。例如，可以通过插件集成新的版本控制工具、构建系统、CI/CD 工具，或者增强代码审查功能等。

### 11. **社区和文档**
   Phabricator 拥有活跃的开源社区，用户可以通过论坛、邮件列表或 GitHub 仓库报告问题或贡献代码。Phabricator 提供了详尽的文档，帮助开发者和管理员配置和使用系统。

### 12. **安装和部署**
   Phabricator 可以自托管，支持 Linux 和 macOS 系统的安装，要求 PHP、MySQL 和 Web 服务器。Phabricator 提供了较为详细的安装文档，帮助用户部署和配置系统。

### 适用场景
- **大型团队和开源项目**：Phabricator 的代码审查、任务管理和版本控制集成功能适用于大规模软件开发项目和跨地域协作的团队。
- **复杂的代码库**：Phabricator 支持 Git 和 Mercurial 等多种版本控制系统，适合管理复杂的代码库。
- **高效的任务和进度跟踪**：Phabricator 的任务管理和项目管理功能可以帮助团队更好地组织和分配工作。

### 总结
Phabricator 是一个功能全面的开发协作平台，集成了代码审查、任务管理、版本控制等多种开发流程工具。它适用于需要高效协作和代码质量控制的开发团队，尤其适合大型项目和开源社区。通过开源的方式，Phabricator 也为用户提供了高度的定制性和扩展性。


* any list
{:toc}
