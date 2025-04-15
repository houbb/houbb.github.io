---
layout: post
title: AI MCP(大模型上下文)-12-AWS MCP
date: 2025-4-15 17:51:19 +0800
categories: [AI]
tags: [ai, mcp, sh]
published: true
---


# AWS MCP 服务器

一套专为 AWS 打造的 MCP 服务器，帮助你在任何使用 MCP 的场景下充分利用 AWS 的能力。

[![GitHub](https://img.shields.io/badge/github-awslabs/mcp-blue.svg?style=flat&logo=github)](https://github.com/awslabs/mcp)  
[![License](https://img.shields.io/badge/license-Apache--2.0-brightgreen)](LICENSE)

## 可用的服务器

本 Monorepo（单体代码仓库）包含以下 MCP 服务器：

### 核心 MCP 服务器

[![PyPI version](https://img.shields.io/pypi/v/awslabs.core-mcp-server.svg)](https://pypi.org/project/awslabs.core-mcp-server/)

用于管理和协调其他 AWS Labs MCP 服务器的服务器。

- 自动化 MCP 服务器管理  
- 规划与引导 AWS Labs MCP 服务器的编排  
- 支持 UVX 安装  
- 集中配置管理  

[了解更多](src/core-mcp-server/README.md) | [文档](https://awslabs.github.io/mcp/servers/core-mcp-server/)

### AWS 文档 MCP 服务器

[![PyPI version](https://img.shields.io/pypi/v/awslabs.aws-documentation-mcp-server.svg)](https://pypi.org/project/awslabs.aws-documentation-mcp-server/)

用于访问 AWS 官方文档和最佳实践的服务器。

- 通过官方 AWS 搜索 API 进行文档检索  
- 为 AWS 文档页面提供内容推荐  
- 将文档转换为 Markdown 格式  

[了解更多](src/aws-documentation-mcp-server/README.md) | [文档](https://awslabs.github.io/mcp/servers/aws-documentation-mcp-server/)

### Amazon Bedrock 知识库检索 MCP 服务器

[![PyPI version](https://img.shields.io/pypi/v/awslabs.bedrock-kb-retrieval-mcp-server.svg)](https://pypi.org/project/awslabs.bedrock-kb-retrieval-mcp-server/)

用于访问 Amazon Bedrock 知识库的服务器。

- 发现知识库及其数据源  
- 使用自然语言查询知识库  
- 按数据源过滤结果  
- 对结果重新排序  

[了解更多](src/bedrock-kb-retrieval-mcp-server/README.md) | [文档](https://awslabs.github.io/mcp/servers/bedrock-kb-retrieval-mcp-server/)

### AWS CDK MCP 服务器

[![PyPI version](https://img.shields.io/pypi/v/awslabs.cdk-mcp-server.svg)](https://pypi.org/project/awslabs.cdk-mcp-server/)

用于 AWS CDK 最佳实践的服务器。

- 分析 AWS CDK 项目并提供辅助  
- 推荐合适的 CDK 构造  
- 基础设施即代码（IaC）最佳实践  

[了解更多](src/cdk-mcp-server/README.md) | [文档](https://awslabs.github.io/mcp/servers/cdk-mcp-server/)

### 成本分析 MCP 服务器

[![PyPI version](https://img.shields.io/pypi/v/awslabs.cost-analysis-mcp-server.svg)](https://pypi.org/project/awslabs.cost-analysis-mcp-server/)

用于 AWS 成本分析的服务器。

- 分析并可视化 AWS 成本  
- 使用自然语言查询成本数据  
- 生成成本报告与洞察  

[了解更多](src/cost-analysis-mcp-server/README.md) | [文档](https://awslabs.github.io/mcp/servers/cost-analysis-mcp-server/)

### Amazon Nova Canvas 图像生成 MCP 服务器

[![PyPI version](https://img.shields.io/pypi/v/awslabs.nova-canvas-mcp-server.svg)](https://pypi.org/project/awslabs.nova-canvas-mcp-server/)

使用 Amazon Nova Canvas 生成图像的服务器。

- 基于文本的图像生成，支持自定义参数  
- 按色彩调色板生成图像  
- 工作区集成以保存生成的图像  
- 通过 AWS 账号进行身份验证  

[了解更多](src/nova-canvas-mcp-server/README.md) | [文档](https://awslabs.github.io/mcp/servers/nova-canvas-mcp-server/)

### AWS 架构图 MCP 服务器

[![PyPI version](https://img.shields.io/pypi/v/awslabs.aws-diagram-mcp-server.svg)](https://pypi.org/project/awslabs.aws-diagram-mcp-server/)

用于使用 Python diagrams DSL 创建架构图的服务器。

- 使用 Python 代码生成专业图表  
- 支持 AWS 架构图、时序图、流程图和类图  
- 自定义图表外观、布局和样式  
- 代码扫描保障图表生成安全  

[了解更多](src/aws-diagram-mcp-server/README.md) | [文档](https://awslabs.github.io/mcp/servers/aws-diagram-mcp-server/)

### AWS Lambda MCP 服务器

允许以 MCP 工具的形式选择并运行 AWS Lambda 函数，无需修改代码。

- 该服务器充当 MCP 客户端与 Lambda 函数之间的桥梁，使基础模型（FMs）可以将 Lambda 函数作为工具调用  
- 可用于访问如内部应用、私有数据库等私有资源，无需开放公网访问  
- 支持通过 MCP 客户端访问 AWS 服务、私有网络和公网  
- Lambda 函数的描述用于向 FM 传达其用途、使用方式、参数需求等信息  

[了解更多](src/lambda-mcp-server/README.md) | [文档](https://awslabs.github.io/mcp/servers/lambda-mcp-server/)

## 什么是 Model Context Protocol（MCP）？它如何与 AWS MCP 服务器配合使用？

> Model Context Protocol（MCP）是一个开放协议，使 LLM 应用能够无缝集成外部数据源和工具。无论你是在构建 AI IDE、增强聊天界面，还是创建自定义 AI 工作流，MCP 都提供了一种标准化方式，让 LLM 连接所需上下文。
>
> &mdash; [Model Context Protocol README](https://github.com/modelcontextprotocol#:~:text=The%20Model%20Context,context%20they%20need.)

AWS MCP 服务器基于 MCP 协议，为 AI 应用提供对 AWS 文档、上下文建议和最佳实践的访问能力。通过标准化的 MCP 客户端-服务器架构，AWS 的能力得以成为开发环境或 AI 应用的智能延伸。

比如，你可以使用 **AWS 文档 MCP 服务器** 来帮助 AI 助手检索 AWS 服务（如 Amazon Bedrock Inline agents）的相关内容与代码生成。或者使用 **CDK MCP 服务器** 让 AI 助手根据最新 API 和最佳实践生成 IaC 代码。

AWS MCP 服务器促进了云原生开发、基础设施管理和 AI 辅助开发工作流程的提升，使 AI 驱动的云计算更加高效便捷。

MCP 是由 Anthropic PBC 运营的开源项目，欢迎社区贡献。

## 安装与设置

每个服务器都有特定的安装指南。一般步骤如下：

1. 从 [Astral](https://docs.astral.sh/uv/getting-started/installation/) 安装 `uv`  
2. 使用 `uv python install 3.10` 安装 Python  
3. 配置 AWS 凭证，确保可访问所需服务  
4. 将服务器添加到 MCP 客户端配置中  

Amazon Q CLI MCP 的配置示例（`~/.aws/amazonq/mcp.json`）：

```json
{
  "mcpServers": {
    "awslabs.core-mcp-server": {
      "command": "uvx",
      "args": ["awslabs.core-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR",
        "MCP_SETTINGS_PATH": "path to your mcp settings file"
      }
    },
    "awslabs.nova-canvas-mcp-server": {
      "command": "uvx",
      "args": ["awslabs.nova-canvas-mcp-server@latest"],
      "env": {
        "AWS_PROFILE": "your-aws-profile",
        "AWS_REGION": "us-east-1",
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    },
    "awslabs.bedrock-kb-retrieval-mcp-server": {
      "command": "uvx",
      "args": ["awslabs.bedrock-kb-retrieval-mcp-server@latest"],
      "env": {
        "AWS_PROFILE": "your-aws-profile",
        "AWS_REGION": "us-east-1",
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    },
    "awslabs.cost-analysis-mcp-server": {
      "command": "uvx",
      "args": ["awslabs.cost-analysis-mcp-server@latest"],
      "env": {
        "AWS_PROFILE": "your-aws-profile",
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    },
    "awslabs.cdk-mcp-server": {
      "command": "uvx",
      "args": ["awslabs.cdk-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    },
    "awslabs.aws-documentation-mcp-server": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": []
    },
    "awslabs.lambda-mcp-server": {
      "command": "uvx",
      "args": ["awslabs.lambda-mcp-server@latest"],
      "env": {
        "AWS_PROFILE": "your-aws-profile",
        "AWS_REGION": "us-east-1",
        "FUNCTION_PREFIX": "your-function-prefix",
        "FUNCTION_LIST": "your-first-function, your-second-function",
        "FUNCTION_TAG_KEY": "your-tag-key",
        "FUNCTION_TAG_VALUE": "your-tag-value"
      }
    }
  }
}
```

详细配置请参考各个服务器的 README 文件。

## 示例

可在 [samples](samples/) 目录中找到各 MCP 服务器的示例。这些示例提供了可直接运行的代码和逐步指南，帮助你快速上手。

## 文档

所有服务器的完整文档可在 [官方文档站点](https://awslabs.github.io/mcp/) 获取。

具体服务器文档：

- [核心 MCP 服务器](https://awslabs.github.io/mcp/servers/core-mcp-server/)  
- [Amazon Bedrock 知识库 MCP 服务器](https://awslabs.github.io/mcp/servers/bedrock-kb-retrieval-mcp-server/)  
- [AWS CDK MCP 服务器](https://awslabs.github.io/mcp/servers/cdk-mcp-server/)  
- [成本分析 MCP 服务器](https://awslabs.github.io/mcp/servers/cost-analysis-mcp-server/)  
- [Amazon Nova Canvas MCP 服务器](https://awslabs.github.io/mcp/servers/nova-canvas-mcp-server/)  
- [AWS 架构图 MCP 服务器](https://awslabs.github.io/mcp/servers/aws-diagram-mcp-server/)

文档内容包括：

- 各服务器详细指南  
- 安装与配置说明  
- API 参考文档  
- 使用示例  

## 安全性

参见 [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) 获取关于安全问题的更多信息。

## 贡献指南

感谢所有贡献者！你们让这个项目变得更好！

[![contributors](https://contrib.rocks/image?repo=awslabs/mcp&max=2000)](https://github.com/awslabs/mcp/graphs/contributors)

欢迎任何形式的贡献！详细说明请参见我们的 [贡献者指南](CONTRIBUTING.md)。

## 开发者指南

如需添加新的 MCP 服务器，请参考我们的 [开发指南](DEVELOPER_GUIDE.md)。

## 协议许可

本项目采用 Apache-2.0 开源许可协议。

## 免责声明

在使用 MCP 服务器之前，建议你进行独立评估，以确保使用过程符合你自身的安全控制、质量规范及适用的法律法规。




# 参考资料

https://github.com/awslabs/mcp/blob/main/README.md

* any list
{:toc}