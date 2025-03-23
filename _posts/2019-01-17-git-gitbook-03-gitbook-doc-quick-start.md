---
layout: post
title:  GitBook-03-gitbook 快速开始
date: 2019-1-17 09:34:35 +0800
categories: [Git]
tags: [git, devops, git-learn, git-topic, gitbook, sh]
published: true
---

# 是什么？

### GitBook 文档  

创建并发布用户喜爱的精美文档

GitBook 提供您所需的全套工具，可帮助您从产品指南到API参考文档📚等各类文档的创建。  

我们的使命  

GitBook 致力于为用户提供用户友好且支持协作的解决方案，用于创建、编辑和共享产品及API文档。  

# 快速上手

几分钟内快速上手 GitBook 并发布首个文档站点

#### 🚀 开始使用  
前提条件  
要发布文档，您需要拥有 GitBook 账户。

若尚未注册，可点击此处[免费注册](https://www.gitbook.com/signup)。  

---

#### 📂 创建文档站点  
1. 初始引导  
   首次注册时，系统将通过 文档站点创建向导 引导您创建首个站点。  
   - 后续可通过侧边栏 "文档站点"标题旁的 + 按钮 随时重新启动向导，创建新站点。  

2. 向导流程  
   🔹 命名站点：为站点设置名称  
   🔹 内容选择：  
     - 从空白站点开始  
     - 或添加示例模板内容  
   🔹 发布选项：选择是否立即发布  

耗时仅需几分钟 ⏱️  

![创建文档站点](https://1050631731-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNkEGS7hzeqa35sMXQZ4X%2Fuploads%2Ftr45YCskBmSWji7m4HZj%2Fgetting-started-quickstart.svg?alt=media&token=160e7114-067b-46cb-979d-5b6ce7b5d0c9)

#### ✍️ 编辑内容  
1. 内容迁移  
   - 若已有 GitHub/GitLab 文档仓库，可通过 Git同步功能（技术术语：Git Sync）快速迁移内容至 GitBook。  
   - ▶️ 详细操作参见《[使用 Git Sync 迁移内容指南](https://docs.gitbook.com/guides/product-guides/import-or-migrate-your-content-to-gitbook-with-git-sync)》  

2. 内置编辑器  
   - 支持添加 交互式内容块（如代码片段、可折叠面板）  
   - 自由定制页面布局  
   - 实时协作编辑  

延伸学习资源：  
📌 [发起变更请求](https://docs.gitbook.com/collaboration/change-requests) - 团队协作编辑指南  
📌 [安装集成工具](https://docs.gitbook.com/integrations/install-an-integration) - 第三方工具对接说明  
📌 [添加 OpenAPI 规范](https://docs.gitbook.com/creating-content/openapi) - 直接嵌入 API 方法文档  

![编辑内容  ](https://1050631731-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNkEGS7hzeqa35sMXQZ4X%2Fuploads%2FzvuPBpE9H98mgDoBbYdy%2FIntegrations.svg?alt=media&token=ab5c2d76-8103-4fe8-becb-cd7cd2174925)

#### 🎨 自定义站点  
1. 视觉定制  
   - 修改 Logo、配色方案与字体  
   - 通过 站点分区与变体 增强内容结构  
   - 调整可见性设置（公开/私有）  

2. 高级配置  
   📌 [自定义站点外观](https://docs.gitbook.com/publishing-documentation/customization) - 品牌风格指南  
   📌 [绑定自定义域名](https://docs.gitbook.com/publishing-documentation/custom-domain) - 专属域名设置教程  
   📌 [更新站点设置](https://docs.gitbook.com/publishing-documentation/site-settings) - 发布后参数调整  

---

#### 🌐 发布文档  
1. 一键发布  
   - 若未在向导中直接发布，可随时通过 站点控制面板 手动发布  
   - 生成可分享的专属链接  

2. 技术支持  
   ❓ 遇到问题？  
   - 加入 [GitBook 社区](https://github.com/orgs/GitbookIO/discussions) 交流  
   - 直接 [联系支持团队](https://github.com/orgs/GitbookIO/discussions)  

深度指南：  
📖 《[GitBook 内容创建与发布完全指南](https://docs.gitbook.com/guides/product-guides/complete-guide-to-publishing-docs-gitbook)》  


# 通过 git-sync 导入

> [通过 git-sync 导入](https://docs.gitbook.com/guides/product-guides/import-or-migrate-your-content-to-gitbook-with-git-sync)

1. [产品指南](/guides/product-guides)

通过 GitBook 的 [Git Sync](https://docs.gitbook.com/getting-started/git-sync) 功能，您可以轻松从之前的文档提供商（或 GitHub/GitLab）导入内容到 GitBook。这是将现有文档快速迁移到 GitBook 组织的便捷方式。

### 从 GitHub 导入

1. 在 GitBook [空间](https://docs.gitbook.com/creating-content/content-structure/space) 右上角点击 **设置 Git Sync**，进入配置弹窗。
2. 需先在 GitHub 上安装 [GitBook 应用](https://github.com/apps/gitbook-com/installations/select_target)。若未安装，页面会提示您授权 GitBook 访问特定仓库或所有仓库。
3. 授权后，选择需要同步的 GitHub 仓库及分支。
4. 设置初始同步方向：
   - **GitHub -> GitBook**：将仓库中的 Markdown 内容同步至 GitBook（适用于已有内容的仓库）。
   - **GitBook -> GitHub**：将 GitBook 内容同步至空仓库（适用于从零开始的项目）。

这个需要耐心等待一下，确保页面对应的信息都已经正确出现了。

![效果](https://i-blog.csdnimg.cn/direct/a85edd2c765b4f118df91e1ff0b226e3.png#pic_center)

### 连接 GitLab

1. 在 GitBook 空间右上角点击 **设置 Git Sync**，进入 GitLab 配置弹窗。
2. 需先在 GitLab 的 **设置 > 访问令牌** 中创建包含以下权限的令牌：
   - `api`
   - `read_repository`
   - `write_repository`
3. 将生成的令牌粘贴至 GitBook 的认证框，点击 **认证**。
4. 选择需要同步的 GitLab 仓库及分支。
5. 设置初始同步方向：
   - **GitLab -> GitBook**：同步仓库内容至 GitBook。
   - **GitBook -> GitLab**：同步 GitBook 内容至空仓库。

---

同步完成后，GitHub/GitLab 仓库与 GitBook 空间将保持双向同步。

任何一方的更改都会实时同步至另一方。

# 参考资料

https://docs.gitbook.com/

https://docs.gitbook.com/getting-started/quickstart

* any list
{:toc}