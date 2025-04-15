---
layout: post
title: AI MCP(大模型上下文)-13-github MCP
date: 2025-4-15 17:51:19 +0800
categories: [AI]
tags: [ai, mcp, sh]
published: true
---

# GitHub MCP Server（GitHub 模型上下文协议服务器）

GitHub MCP Server 是一个 [模型上下文协议（Model Context Protocol, MCP）](https://modelcontextprotocol.io/introduction) 服务器，它通过与 GitHub API 的无缝集成，为开发者和工具提供了高级自动化和交互能力。

[![通过 VS Code 使用 Docker 安装](https://img.shields.io/badge/VS_Code-Install_Server-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=github&inputs=%5B%7B%22id%22%3A%22github_token%22%2C%22type%22%3A%22promptString%22%2C%22description%22%3A%22GitHub%20Personal%20Access%20Token%22%2C%22password%22%3Atrue%7D%5D&config=%7B%22command%22%3A%22docker%22%2C%22args%22%3A%5B%22run%22%2C%22-i%22%2C%22--rm%22%2C%22-e%22%2C%22GITHUB_PERSONAL_ACCESS_TOKEN%22%2C%22ghcr.io%2Fgithub%2Fgithub-mcp-server%22%5D%2C%22env%22%3A%7B%22GITHUB_PERSONAL_ACCESS_TOKEN%22%3A%22%24%7Binput%3Agithub_token%7D%22%7D%7D)  
[![通过 VS Code Insiders 使用 Docker 安装](https://img.shields.io/badge/VS_Code_Insiders-Install_Server-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=github&inputs=%5B%7B%22id%22%3A%22github_token%22%2C%22type%22%3A%22promptString%22%2C%22description%22%3A%22GitHub%20Personal%20Access%20Token%22%2C%22password%22%3Atrue%7D%5D&config=%7B%22command%22%3A%22docker%22%2C%22args%22%3A%5B%22run%22%2C%22-i%22%2C%22--rm%22%2C%22-e%22%2C%22GITHUB_PERSONAL_ACCESS_TOKEN%22%2C%22ghcr.io%2Fgithub%2Fgithub-mcp-server%22%5D%2C%22env%22%3A%7B%22GITHUB_PERSONAL_ACCESS_TOKEN%22%3A%22%24%7Binput%3Agithub_token%7D%22%7D%7D&quality=insiders)

---

## 应用场景

- 自动化 GitHub 工作流与流程  
- 提取并分析 GitHub 仓库中的数据  
- 构建可与 GitHub 生态交互的 AI 工具与应用  

---

## 先决条件

1. 要在容器中运行服务器，你需要先安装 [Docker](https://www.docker.com/)  
2. 安装后，确保 Docker 服务已启动  
3. 你还需要 [创建一个 GitHub 个人访问令牌（Personal Access Token）](https://github.com/settings/personal-access-tokens/new)  
MCP 服务器将使用 GitHub 的多种 API，所以你可以根据自己的需求授予令牌相应权限（了解更多请查看 [官方文档](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)）

---

## 安装方式

### 在 VS Code 中使用

如果想快速安装，请点击本 README 顶部的“一键安装”按钮。

如果你想手动配置，可以将以下 JSON 添加到 VS Code 的用户设置（User Settings）中。方法是按 `Ctrl + Shift + P`，然后搜索并打开 `Preferences: Open User Settings (JSON)`。

你也可以选择将其添加到工作区中的 `.vscode/mcp.json` 文件中，以便与他人共享配置。

> 注意：`.vscode/mcp.json` 文件中 **不需要** 包含 `mcp` 键。

```json
{
  "mcp": {
    "inputs": [
      {
        "type": "promptString",
        "id": "github_token",
        "description": "GitHub Personal Access Token",
        "password": true
      }
    ],
    "servers": {
      "github": {
        "command": "docker",
        "args": [
          "run",
          "-i",
          "--rm",
          "-e",
          "GITHUB_PERSONAL_ACCESS_TOKEN",
          "ghcr.io/github/github-mcp-server"
        ],
        "env": {
          "GITHUB_PERSONAL_ACCESS_TOKEN": "${input:github_token}"
        }
      }
    }
  }
}
```

关于 VS Code 中 MCP 服务器工具的更多使用方法，请参考 [agent mode 官方文档](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)。

---

### 在 Claude Desktop 中使用

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

---

### 从源码构建

如果你不使用 Docker，也可以使用 `go build` 命令在 `cmd/github-mcp-server` 目录中构建可执行文件，并使用 `github-mcp-server stdio` 命令运行。在运行前，请通过环境变量 `GITHUB_PERSONAL_ACCESS_TOKEN` 设置好你的 GitHub Token。

你也可以使用 `-o` 参数指定构建的输出路径。然后在配置文件中将构建出的可执行文件设置为 `command`。示例：

```json
{
  "mcp": {
    "servers": {
      "github": {
        "command": "/path/to/github-mcp-server",
        "args": ["stdio"],
        "env": {
          "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>"
        }
      }
    }
  }
}
```

---

## GitHub 企业版支持

可以使用 `--gh-host` 参数或环境变量 `GH_HOST` 来设置 GitHub 企业服务器的主机名。

---

## 国际化 / 覆盖工具描述

你可以通过在可执行文件所在目录创建 `github-mcp-server-config.json` 文件，来自定义覆盖工具的描述文本。

该文件应包含一个 JSON 对象，键为工具名称，值为你希望显示的描述。例如：

```json
{
  "TOOL_ADD_ISSUE_COMMENT_DESCRIPTION": "一个替代描述",
  "TOOL_CREATE_BRANCH_DESCRIPTION": "在 GitHub 仓库中创建一个新分支"
}
```

你可以通过运行以下命令导出当前的翻译模板：

```sh
./github-mcp-server --export-translations
cat github-mcp-server-config.json
```

该命令会保留你已有的自定义翻译，并添加新增加的内容，方便维护。

也可以使用环境变量来覆盖描述，环境变量的名称与 JSON 文件中的键相同，只需加上 `GITHUB_MCP_` 前缀并大写。例如：

```sh
export GITHUB_MCP_TOOL_ADD_ISSUE_COMMENT_DESCRIPTION="一个替代描述"
```

好的，继续翻译下面的部分：

---

## 工具列表

### TOOL_CREATE_ISSUE

**功能说明**：在 GitHub 仓库中创建一个新的问题（Issue）。  
**输入参数**：
- `repository`: GitHub 仓库的名称（例如：`owner/repo`）。  
- `title`: 问题的标题。  
- `body`（可选）：问题的描述内容。  

**示例**：

```json
{
  "tool": "TOOL_CREATE_ISSUE",
  "inputs": {
    "repository": "myorg/myrepo",
    "title": "This is a new issue",
    "body": "Detailed description of the issue"
  }
}
```

### TOOL_ADD_ISSUE_COMMENT

**功能说明**：在 GitHub 问题中添加评论。  
**输入参数**：
- `repository`: GitHub 仓库的名称（例如：`owner/repo`）。  
- `issue_number`: 需要添加评论的 Issue 编号。  
- `body`: 评论的内容。  

**示例**：

```json
{
  "tool": "TOOL_ADD_ISSUE_COMMENT",
  "inputs": {
    "repository": "myorg/myrepo",
    "issue_number": 1,
    "body": "This is a comment on the issue"
  }
}
```

### TOOL_CREATE_BRANCH

**功能说明**：在 GitHub 仓库中创建一个新分支。  
**输入参数**：
- `repository`: GitHub 仓库的名称（例如：`owner/repo`）。  
- `branch_name`: 新分支的名称。  
- `base`（可选）：基于哪个分支创建新分支，默认为 `main`。  

**示例**：

```json
{
  "tool": "TOOL_CREATE_BRANCH",
  "inputs": {
    "repository": "myorg/myrepo",
    "branch_name": "feature-branch"
  }
}
```

### TOOL_CREATE_PULL_REQUEST

**功能说明**：在 GitHub 仓库中创建一个新的拉取请求（Pull Request）。  
**输入参数**：
- `repository`: GitHub 仓库的名称（例如：`owner/repo`）。  
- `title`: 拉取请求的标题。  
- `head`: 要合并的分支（例如：`feature-branch`）。  
- `base`（可选）：目标分支，默认为 `main`。  
- `body`（可选）：拉取请求的描述内容。  

**示例**：

```json
{
  "tool": "TOOL_CREATE_PULL_REQUEST",
  "inputs": {
    "repository": "myorg/myrepo",
    "title": "Add new feature",
    "head": "feature-branch",
    "base": "main",
    "body": "This PR adds a new feature to the repo"
  }
}
```

### TOOL_MERGE_PULL_REQUEST

**功能说明**：合并 GitHub 仓库中的拉取请求（Pull Request）。  
**输入参数**：
- `repository`: GitHub 仓库的名称（例如：`owner/repo`）。  
- `pull_request_number`: 需要合并的拉取请求编号。  

**示例**：

```json
{
  "tool": "TOOL_MERGE_PULL_REQUEST",
  "inputs": {
    "repository": "myorg/myrepo",
    "pull_request_number": 5
  }
}
```

### TOOL_CREATE_RELEASE

**功能说明**：在 GitHub 仓库中创建一个新的发布版本（Release）。  
**输入参数**：
- `repository`: GitHub 仓库的名称（例如：`owner/repo`）。  
- `tag_name`: 发布的标签名称。  
- `name`（可选）：发布版本的名称。  
- `body`（可选）：发布说明。  

**示例**：

```json
{
  "tool": "TOOL_CREATE_RELEASE",
  "inputs": {
    "repository": "myorg/myrepo",
    "tag_name": "v1.0.0",
    "name": "First Release",
    "body": "This is the first release of the project"
  }
}
```

### TOOL_UPLOAD_ASSET_TO_RELEASE

**功能说明**：将文件上传到 GitHub 仓库的发布版本中。  
**输入参数**：
- `repository`: GitHub 仓库的名称（例如：`owner/repo`）。  
- `release_id`: 关联的发布版本 ID。  
- `file_path`: 本地文件的路径。  
- `asset_name`（可选）：上传文件的名称。  

**示例**：

```json
{
  "tool": "TOOL_UPLOAD_ASSET_TO_RELEASE",
  "inputs": {
    "repository": "myorg/myrepo",
    "release_id": 1,
    "file_path": "/path/to/file.zip",
    "asset_name": "file.zip"
  }
}
```

---

以上是工具的功能介绍和示例。你可以根据自己的需求通过 MCP 服务器与 GitHub 进行自动化交互，提升工作效率。


# 参考资料

https://github.com/github/github-mcp-server

* any list
{:toc}