---
layout: post
title: 持续集成平台 03 jenkins 聊一聊
date:  2016-10-14 23:51:50 +0800
categories: [Devops]
tags: [devops, ci, plugin]
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

## Jenkins 如果想自己从零实现 需要做哪些核心功能？

要自己从零实现一个类似Jenkins的持续集成/持续部署（CI/CD）系统，需要考虑以下几个核心功能：

1. **构建管理**：
   - 每个构建都应该有一个唯一的构建编号。
   - 记录构建的日志，以便用户可以查看构建过程的详细输出。
   - 提供构建的状态信息（成功、失败、稳定等）。
   - 在构建后可以进行通知、报告生成或进一步的操作。

2. **插件系统**：
   - Jenkins的核心功能非常基础，通过插件可以对其进行扩展，支持更多的功能和第三方工具的集成。
   - 插件可以支持与多种版本控制系统（如Git、SVN）集成，提供源代码管理功能。
   - 插件支持构建工具集成（如Maven、Gradle）和自动化部署工具（如Docker、Kubernetes）。
   - 插件还可以集成其他持续集成工具，如SonarQube、JUnit、Nexus等。

3. **用户界面（UI）**：
   - 提供一个基于Web的用户界面，使得用户可以通过浏览器访问和管理Jenkins。
   - 提供图形化的作业配置和管理界面。
   - 支持查看构建状态和历史记录，查看构建日志。
   - 用户界面支持查看报告、趋势、测试结果等。
   - 提供权限管理和用户角色控制，以确保系统的安全性。

4. **Jenkinsfile（管道文件）**：
   - Jenkinsfile是定义Jenkins Pipeline的文件，通常是一个Groovy脚本。
   - Jenkinsfile描述了一个完整的流水线，从源码拉取、构建、测试、部署等步骤。
   - Jenkinsfile使得Jenkins的流水线能够版本化，并且可以存储在版本控制系统中。

5. **触发器（Trigger）**：
   - 触发器用于定义何时启动构建。
   - Jenkins提供了多种内置触发器，如定时触发器、SCM触发器（如Git或SVN的push事件触发）。
   - 可以通过实现Trigger接口，创建基于特定条件的自定义触发器。

6. **构建步骤（Builder）与发布者（Publisher）**：
   - Builder用于定义构建过程中的具体步骤，如编译代码、运行测试等。
   - Publisher在构建完成后执行的操作，如生成报告、部署应用到服务器等。

7. **通知器（Notifier）**：
   - 通知器用于在构建完成时发送通知，如通过邮件、Slack、HipChat等方式。

8. **Action**：
   - Action是附加到构建结果上的信息或操作，如测试报告、覆盖率报告等。

9. **多节点支持**：
   - 支持主从架构，允许构建任务在多个节点上分布式执行。

10. **安全性**：
    - 确保系统安全，包括用户认证、权限控制、安全通信等。

这些是构建一个基本的CI/CD系统所需的核心功能。

实现这些功能需要深入理解软件开发流程、自动化构建和部署的最佳实践，以及如何通过插件和脚本扩展系统功能。

## 类似的开源 持续集成系统 还有哪些？

以下是一些类似Jenkins的开源持续集成/持续部署（CI/CD）系统，它们支持Java开发，并以其在Java领域的应用排在前面：

1. **Jenkins**
   - Jenkins是一个用Java编写的开源自动化服务器，可以处理任何类型的构建、测试和部署流程。它以其强大的插件生态系统而闻名，使其高度可扩展和适应各种开发环境。Jenkins的流水线功能允许开发者定义复杂的工作流程，并与Git等版本控制系统无缝集成。

2. **GitLab CI/CD**
   - GitLab CI/CD是集成在GitLab平台上的内置CI/CD功能。它提供了一个完整的DevOps平台，允许开发者在单一集成环境中管理源代码、CI/CD管道和容器注册表。

3. **Travis CI**
   - Travis CI是一个云基础的CI/CD服务，提供与GitHub仓库的无缝集成。它支持在多种环境中构建和测试Java应用程序，以其简单和易用性而闻名，是开源项目的优秀选择。

4. **CircleCI**
   - CircleCI是一个云基础的CI/CD平台，旨在自动化软件开发生命周期。它支持Java应用程序，并提供并行性以实现更快的构建。CircleCI与流行的版本控制系统如GitHub和Bitbucket集成，并提供简单的YAML配置以定义构建工作流程。

5. **Bamboo**
   - Atlassian的Bamboo是一个CI/CD服务器，与Jira和Bitbucket等其他Atlassian产品无缝集成。它提供了一个用户友好的界面，用于配置构建计划和部署项目，使其成为使用Atlassian生态系统的组织的一个有吸引力的选择。

这些工具各有特点，可以根据团队的具体需求和偏好来选择。例如，如果需要与Atlassian生态系统集成，Bamboo可能是一个好选择；如果项目托管在GitLab上，GitLab CI/CD可能更合适；而对于需要高度自定义和插件支持的项目，Jenkins可能是最佳选择。


## 有类似于 jpom 的开源项目吗

以下是一些类似于Jpom的开源项目，它们提供了在线构建、自动部署、日常运维和项目监控等功能：

1. **GitLab**
   - GitLab是一个提供一站式服务的DevOps平台，包括代码托管、CI/CD、项目管理和监控等功能。它通过.gitlab-ci.yml文件定义CI/CD流水线，并支持Docker和Kubernetes集成。
   - 项目地址：[GitLab](https://gitlab.com/)

2. **Choerodon**
   - Choerodon（猪齿鱼）是一个全场景效能平台，提供体系化方法论和协作、测试、DevOps及容器工具，帮助企业提高管理效率和质量。
   - 项目地址：[Choerodon](https://github.com/open-hand/choerodon)

3. **SPUG**
   - SPUG是一个面向中小型企业设计的无Agent的自动化运维平台，整合了主机管理、批量执行、在线终端、文件上传下载、应用发布、任务计划、配置中心、监控、报警等功能。
   - 项目地址：[SPUG](https://gitee.com/o)

4. **Drone**
   - Drone是一个基于容器的CI/CD工具，支持多种容器化技术，如Docker、Kubernetes等，具有高性能和灵活性。
   - 项目地址：[Drone](https://github.com/drone/drone)

5. **Buildbot**
   - Buildbot是一个通用的开源框架，专门用于自动化软件开发中复杂的构建、测试和发布流程。
   - 项目地址：[Buildbot](https://buildbot.net/)

这些项目各有特点，可以根据项目需求和团队偏好选择最适合的工具。


* any list
{:toc}
