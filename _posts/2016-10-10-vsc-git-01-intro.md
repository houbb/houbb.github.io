---
layout: post
title: Git 开源的版本控制系统-01-入门使用介绍
date:  2016-10-10 16:09:36 +0800
categories: [VCS]
tags: [git]
published: true
---

# 拓展阅读

[Subversion 开源的版本控制系统入门介绍 VCS](https://houbb.github.io/2016/09/02/vcs-svn-01-intro)

[Git 开源的版本控制系统-01-入门使用介绍](https://houbb.github.io/2016/10/10/vsc-git-01-intro)

[Git 开源的版本控制系统-02-base usage 基本用法](https://houbb.github.io/2016/10/10/vsc-git-02-base-usage)

[Git 开源的版本控制系统-03-时间数据回溯](https://houbb.github.io/2016/10/10/vsc-git-03-time-data-back)

[Git 开源的版本控制系统-04-branch manage 分支管理](https://houbb.github.io/2016/10/10/vsc-git-04-branch-manage)

[Git 开源的版本控制系统-05-tags 标签管理](https://houbb.github.io/2016/10/10/vsc-git-05-tags)

[Git 开源的版本控制系统-06-share to github 如何把项目代码共享到 github](https://houbb.github.io/2016/10/10/vsc-git-06-share-to-github)

[Git 开源的版本控制系统-07-gitignore 指定忽略版本管理的文件](https://houbb.github.io/2016/10/10/vsc-git-07-gitignore)

# Git

[Git](https://git-scm.com) 是一个免费且开源的分布式版本控制系统，设计初衷是为了快速并高效地处理从小到大的各种项目。


# 初始化 

## 创建 Maven 项目

使用你的 IDE（集成开发环境）来创建一个 Maven 项目。

可能像这样：

```
D:\CODE\git-demo>tree /f
文件夹 PATH 列表
卷序列号为 00000200 3E45:BF16
D:.
│  git-demo.iml
│  pom.xml
│
├─.idea
│  │  compiler.xml
│  │  misc.xml
│  │  modules.xml
│  │  workspace.xml
│  │
│  └─copyright
│          profiles_settings.xml
│
└─src
    ├─main
    │  ├─java
    │  └─resources
    └─test
        └─java
```

## ```.gitignore``` 忽略文件

这个文件可以配置你不想提交的文件类型。

```
# maven ignore
target/
*.jar
*.war
*.zip
*.tar
*.tar.gz

# eclipse ignore
.settings/
.project
.classpath

# idea ignore
.idea/
*.ipr
*.iml
*.iws
```

# chat

## 详细介绍一下 git

Git 是一个分布式版本控制系统，用于跟踪文件和项目的变化。

它最初由Linus Torvalds为了帮助管理Linux内核开发而创建。

Git 提供了一种有效的方式来协作开发项目，无论是个人项目还是团队项目。

下面是 Git 的一些核心概念和特性：

1. **分布式版本控制系统**：与集中式版本控制系统不同，Git 是一种分布式版本控制系统，每个开发者都拥有完整的项目副本。这使得开发者可以在本地进行工作，而不必依赖于中央服务器。

2. **仓库（Repository）**：Git 仓库是包含项目文件的目录，它包括了项目的所有历史记录和元数据。一个仓库可以是本地的（位于你的计算机上）或者远程的（位于服务器上）。

3. **提交（Commit）**：提交是指将文件的当前状态保存到 Git 仓库中。每个提交都包含了一组文件的修改、作者信息、提交时间等元数据。

4. **分支（Branch）**：分支是 Git 中非常重要的概念，它允许开发者在项目中创建新的独立分支来进行开发工作，而不会影响主分支（通常是 `master` 或 `main` 分支）的稳定性。分支的合并使得团队成员可以方便地将自己的工作整合到主分支中。

5. **合并（Merge）**：合并是指将两个或多个分支的修改合并到一起，形成一个新的提交。Git 提供了自动和手动合并的功能，以解决分支之间的冲突。

6. **远程仓库（Remote Repository）**：远程仓库是托管在网络服务器上的 Git 仓库，开发者可以通过网络访问并与之交互。常见的远程仓库托管服务包括 GitHub、GitLab 和 Bitbucket。

7. **克隆（Clone）**：克隆是指从远程仓库中复制项目的完整副本到本地计算机。这允许开发者在本地进行工作而不影响远程仓库中的项目。

8. **拉取（Pull）与推送（Push）**：拉取是指从远程仓库中获取最新的修改并合并到本地仓库中，而推送则是将本地仓库中的修改上传到远程仓库中。

9. **标签（Tag）**：标签是指向某个特定提交的指针，通常用于标记项目的重要里程碑或版本号。

10. **配置（Configuration）**：Git 允许用户配置各种行为和参数，包括用户信息、默认分支、远程仓库地址等。

总的来说，Git 提供了一个强大而灵活的工具集，使得开发者可以高效地管理项目的版本和变更，协作开发，以及追踪项目的历史记录。

## 给出 git 与 svn 的对比表格

下面是 Git 和 SVN（Subversion）之间的简要对比表格：

| 特性            | Git                                       | SVN                               |
|----------------|-------------------------------------------|-----------------------------------|
| 分布式 vs 集中式 | 分布式版本控制系统                         | 集中式版本控制系统                 |
| 仓库            | 每个开发者拥有完整的项目副本               | 开发者依赖于中央服务器             |
| 分支            | 轻量级分支和快速合并                       | 分支较重，合并相对耗时            |
| 提交            | 本地提交，不依赖于中央服务器               | 提交需要与中央服务器交互           |
| 历史记录        | 完整的项目历史记录，离线操作              | 部分历史记录在中央服务器中         |
| 性能            | 高效，快速克隆、提交和合并                 | 相对较慢，特别是在处理大型项目时   |
| 分支命名        | 自由命名，不依赖于中央服务器               | 通常依赖于中央服务器的路径         |
| 冲突解决        | 自动和手动冲突解决，基于三方合并           | 通常需要手动解决冲突               |
| 远程访问        | 通过远程仓库进行访问，如 GitHub、GitLab   | 通过中央服务器进行访问            |
| 社区和生态系统  | 拥有庞大的开源社区和丰富的工具生态系统   | 社区相对较小，工具生态系统相对简单 |

需要注意的是，每个版本控制系统都有其独特的优势和适用场景。

Git 更适合于需要灵活性、高效性和强大分支管理的项目，而 SVN 则更适合于对集中式工作流程习惯的团队或项目。

## git 有哪些优秀的应用案例？比如 github gitlab gitbook 之类的

Git 作为目前最流行的版本控制系统之一，被广泛应用于各种项目和领域。以下是几个优秀的应用案例：

1. **GitHub**：GitHub 是全球最大的基于 Git 的代码托管平台之一，拥有庞大的开发者社区和海量的开源项目。开发者可以在 GitHub 上托管代码、协作开发、管理项目、发布版本等。GitHub 提供了强大的版本控制、代码审查、问题跟踪和协作功能。

2. **GitLab**：GitLab 是另一个流行的基于 Git 的代码托管平台，提供了类似于 GitHub 的功能，但它更侧重于企业和团队的自托管解决方案。GitLab 提供了持续集成、持续部署、容器注册表等功能，可以帮助团队实现 DevOps 流程。

3. **Bitbucket**：Bitbucket 是由 Atlassian 公司提供的基于 Git 和 Mercurial 的代码托管平台，提供了与 GitHub 和 GitLab 类似的功能，包括代码托管、问题跟踪、持续集成等。

4. **GitBook**：GitBook 是一个基于 Git 的文档托管平台，开发者可以使用 GitBook 创建和托管文档、手册、教程等。GitBook 提供了易于使用的 Markdown 编辑器、版本控制、多语言支持等功能，使得团队可以轻松地编写和管理文档。

5. **WordPress**：WordPress 是一个流行的开源内容管理系统（CMS），它使用 Git 进行版本控制，并且托管在 GitHub 上。WordPress 的代码库包含了整个项目的源代码、插件和主题，开发者可以通过 Git 贡献代码、报告问题和提交建议。

这些优秀的应用案例充分展示了 Git 的强大功能和广泛应用性，无论是开源项目、企业团队还是个人开发者，都能从中受益并提高工作效率。

# 参考资料

> [git 中文版](http://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000)

* any list
{:toc}


