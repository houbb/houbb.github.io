---
layout: post
title: AI-05-MCP(大模型上下文)
date: 2025-3-7 19:49:19 +0800
categories: [AI]
tags: [ai, sh]
published: true
---




# 为什么是 MCP？

MCP逐渐被接受，是因为MCP是开放标准。

在AI项目开发中可以发现，集成AI模型复杂，现有框架如LangChain Tools、LlamaIndex和Vercel AI SDK存在问题。LangChain和LlamaIndex代码抽象高，商业化过重；Vercel AI SDK与Nextjs绑定过深。

MCP的优势在于：一是开放标准利于服务商开发API，二是避免开发者重复造轮子，可利用现有MCP服务增强Agent。

# 一、什么是MCP（Model Context Protocol）

## 定义

MCP（Model Context Protocol，模型上下文协议） ，2024年11月底，由 Anthropic 推出的一种开放标准，旨在统一大型语言模型（LLM）与外部数据源和工具之间的通信协议。

MCP 的主要目的在于解决当前 AI 模型因数据孤岛限制而无法充分发挥潜力的难题，MCP 使得 AI 应用能够安全地访问和操作本地及远程数据，为 AI 应用提供了连接万物的接口。

Function Calling是AI模型调用函数的机制，MCP是一个标准协议，使AI模型与API无缝交互，而AI Agent是一个自主运行的智能系统，利用Function Calling和MCP来分析和执行任务，实现特定目标。

## MCP 的价值

举个栗子，在过去，为了让大模型等 AI 应用使用我们的数据，要么复制粘贴，要么上传下载，非常麻烦。

即使是最强大模型也会受到数据隔离的限制，形成信息孤岛，要做出更强大的模型，每个新数据源都需要自己重新定制实现，使真正互联的系统难以扩展，存在很多的局限性。

现在，MCP 可以直接在 AI 与数据（包括本地数据和互联网数据）之间架起一座桥梁，通过 MCP 服务器和 MCP 客户端，大家只要都遵循这套协议，就能实现“万物互联”。

有了MCP，可以和数据和文件系统、开发工具、Web 和浏览器自动化、生产力和通信、各种社区生态能力全部集成，实现强大的协作工作能力，它的价值远不可估量。

![MCP](https://picx.zhimg.com/v2-fa3cdcd616cd3dc22732fa3f529cc7f7_1440w.jpg)

## MCP 与 Function Calling 的区别

MCP（Model Context Protocol），模型上下文协议

Function Calling，函数调用

这两种技术都旨在增强 AI 模型与外部数据的交互能力，但 MCP 不止可以增强 AI 模型，还可以是其他的应用系统。

![Function Calling 的区别](https://pic4.zhimg.com/v2-b82dc0e2da4a258438b84484d1af8319_1440w.jpg)

## 数据安全性

这样一个理想的“万物互联”生态系统看着很让人着迷。

但是大家是不是担心通过 MCP Server 暴露出来的数据会泄露或被非法访问，这个头疼的问题 MCP 也考虑到了。

MCP 通过标准化的数据访问接口，大大减少了直接接触敏感数据的环节，降低了数据泄露的风险。

还有，MCP 内置了安全机制，确保只有经过验证的请求才能访问特定资源，相当于在数据安全又加上了一道防线。

同时，MCP协议还支持多种加密算法，以确保数据在传输过程中的安全性。

例如，MCP 服务器自己控制资源，不需要将 API 密钥等敏感信息提供给 LLM 提供商。这样一来，即使 LLM 提供商受到攻击，攻击者也无法获取到这些敏感信息。

不过，MCP 这套协议/标准，需要大家一起来共建，这个生态才会繁荣，现在，只是测试阶段，一切才刚刚开始，当然，还会涌现出更多的问题。

## 工作原理

MCP 协议采用了一种独特的架构设计，它将 LLM 与资源之间的通信划分为三个主要部分：客户端、服务器和资源。

客户端负责发送请求给 MCP 服务器，服务器则将这些请求转发给相应的资源。

这种分层的设计使得 MCP 协议能够更好地控制访问权限，确保只有经过授权的用户才能访问特定的资源。

以下是 MCP 的基本工作流程：

初始化连接：客户端向服务器发送连接请求，建立通信通道。
发送请求：客户端根据需求构建请求消息，并发送给服务器。
处理请求：服务器接收到请求后，解析请求内容，执行相应的操作（如查询数据库、读取文件等）。
返回结果：服务器将处理结果封装成响应消息，发送回客户端。
断开连接：任务完成后，客户端可以主动关闭连接或等待服务器超时关闭。

![工作原理](https://pic2.zhimg.com/v2-bb82edf5b8651051be151c279e7679e1_1440w.jpg)

## MCP 核心架构

MCP 遵循客户端-服务器架构（client-server），其中包含以下几个核心概念：

MCP 主机（MCP Hosts）：发起请求的 LLM 应用程序（例如 Claude Desktop、IDE 或 AI 工具）。
MCP 客户端（MCP Clients）：在主机程序内部，与 MCP server 保持 1:1 的连接。
MCP 服务器（MCP Servers）：为 MCP client 提供上下文、工具和 prompt 信息。
本地资源（Local Resources）：本地计算机中可供 MCP server 安全访问的资源（例如文件、数据库）。
远程资源（Remote Resources）：MCP server 可以连接到的远程资源（例如通过 API）。

![MCP struct](https://picx.zhimg.com/v2-492a176fa0a06b585e752dc676d28b77_r.jpg)


### MCP Client

MCP client 充当 LLM 和 MCP server 之间的桥梁，MCP client 的工作流程如下：

MCP client 首先从 MCP server 获取可用的工具列表。
将用户的查询连同工具描述通过 function calling 一起发送给 LLM。
LLM 决定是否需要使用工具以及使用哪些工具。
如果需要使用工具，MCP client 会通过 MCP server 执行相应的工具调用。
工具调用的结果会被发送回 LLM。
LLM 基于所有信息生成自然语言响应。
最后将响应展示给用户。
Claude Desktop 和Cursor都支持了MCP Server接入能力，它们就是作为 MCP client来连接某个MCP Server感知和实现调用。

### MCP Server

MCP server 是 MCP 架构中的关键组件，它可以提供 3 种主要类型的功能：

资源（Resources）：类似文件的数据，可以被客户端读取，如 API 响应或文件内容。
工具（Tools）：可以被 LLM 调用的函数（需要用户批准）。
提示（Prompts）：预先编写的模板，帮助用户完成特定任务。
这些功能使 MCP server 能够为 AI 应用提供丰富的上下文信息和操作能力，从而增强 LLM 的实用性和灵活性。

你可以在 MCP Servers Repository 和 Awesome MCP Servers 这两个 repo 中找到许多由社区实现的 MCP server。

使用 TypeScript 编写的 MCP server 可以通过 npx 命令来运行，使用 Python 编写的 MCP server 可以通过 uvx 命令来运行。

## 通信机制

MCP 协议支持两种主要的通信机制：基于标准输入输出的本地通信和基于SSE（Server-Sent Events）的远程通信。

这两种机制都使用 JSON-RPC 2.0 格式进行消息传输，确保了通信的标准化和可扩展性。

本地通信：通过 stdio 传输数据，适用于在同一台机器上运行的客户端和服务器之间的通信。

远程通信：利用 SSE 与 HTTP 结合，实现跨网络的实时数据传输，适用于需要访问远程资源或分布式部署的场景。

# 二、MCP的功能与应用：

## 如何使用 MCP

如果你还没有尝试过如何使用 MCP 的话，我们可以考虑用 Cursor(本人只尝试过 Cursor)，Claude Desktop 或者 Cline 来体验一下。

当然，我们并不需要自己开发 MCP Servers，MCP 的好处就是通用、标准，所以开发者并不需要重复造轮子（但是学习可以重复造轮子）。

首先推荐的是官方组织的一些 Server：官方的 MCP Server 列表。

目前社区的 MCP Server 还是比较混乱，有很多缺少教程和文档，很多的代码功能也有问题，我们可以自行尝试一下 Cursor Directory 的一些例子，具体的配置和实战笔者就不细讲了，大家可以参考官方文档。

## MCP的功能

MCP通过引入多样化的MCP Server能力，显著增强了AI工具的功能，例如我们常用的Cursor和Claude。以下是一些官方参考服务器，展示了MCP的核心功能和SDK的应用：

数据与文件系统：

文件系统：提供安全文件操作，带可配置的访问控制。

PostgreSQL：提供只读数据库访问，具备架构检查功能。

SQLite：支持数据库交互和商业智能功能。

Google Drive：实现Google Drive的文件访问和搜索功能。

开发工具：

Git：工具用于读取、搜索和操作Git仓库。

GitHub：集成仓库管理、文件操作和GitHub API。

GitLab：支持项目管理的GitLab API集成。

Sentry：从http://Sentry.io获取并分析问题。

网络与浏览器自动化：

Brave Search：利用Brave的搜索API进行网络和本地搜索。

Fetch：为LLM优化的网络内容获取和转换。

Puppeteer：提供浏览器自动化和网页抓取功能。

生产力和通信：

Slack：支持频道管理和消息功能。

Google Maps：提供位置服务、路线和地点详情。

Memory：基于知识图谱的持久记忆系统。

AI与专业工具：

EverArt：使用多种模型进行AI图像生成。

Sequential Thinking：通过思维序列进行动态问题解决。

AWS KB Retrieval：使用Bedrock Agent Runtime从AWS知识库检索。

官方集成工具：

这些MCP服务器由公司维护，用于其平台：

Axiom：使用自然语言查询和分析日志、跟踪和事件数据。

Browserbase：云端自动化浏览器交互。

Cloudflare：在Cloudflare开发者平台上部署和管理资源。

E2B：在安全的云沙箱中执行代码。

Neon：与Neon无服务器Postgres平台交互。

Obsidian Markdown Notes：读取和搜索Obsidian知识库中的Markdown笔记。

Qdrant：使用Qdrant向量搜索引擎实现语义记忆。

Raygun：访问崩溃报告和监控数据。

Search1API：统一的API用于搜索、爬虫和网站地图。

Tinybird：与Tinybird无服务器ClickHouse平台交互。

集成工具：

Docker：管理容器、镜像、卷和网络。

Kubernetes：管理pod、部署和服务。

Linear：项目管理和问题跟踪。

Snowflake：与Snowflake数据库交互。

Spotify：控制Spotify播放和管理播放列表。

Todoist：任务管理集成。

## MCP 如何工作

那我们来介绍一下 MCP 的工作原理。首先我们看一下官方的 MCP 架构图。

![MCP](https://pica.zhimg.com/v2-2a3cda8621b4165cfba4debd84eb4b86_1440w.jpg)

总共分为了下面五个部分：

MCP Hosts: Hosts 是指 LLM 启动连接的应用程序，像 Cursor, Claude Desktop、Cline 这样的应用程序。
MCP Clients: 客户端是用来在 Hosts 应用程序内维护与 Server 之间 1:1 连接。
MCP Servers: 通过标准化的协议，为 Client 端提供上下文、工具和提示。
Local Data Sources: 本地的文件、数据库和 API。
Remote Services: 外部的文件、数据库和 API。

整个 MCP 协议核心的在于 Server，因为 Host 和 Client 相信熟悉计算机网络的都不会陌生，非常好理解，但是 Server 如何理解呢？

看看 Cursor 的 AI Agent 发展过程，我们会发现整个 AI 自动化的过程发展会是从 Chat 到 Composer 再进化到完整的 AI Agent。

AI Chat 只是提供建议，如何将 AI 的 response 转化为行为和最终的结果，全部依靠人类，例如手动复制粘贴，或者进行某些修改。

AI Composer 是可以自动修改代码，但是需要人类参与和确认，并且无法做到除了修改代码之外的其它操作。

AI Agent 是一个完全的自动化程序，未来完全可以做到自动读取 Figma 的图片，自动生产代码，自动读取日志，自动调试代码，自动 push 代码到 GitHub。

而 MCP Server 就是为了实现 AI Agent 的自动化而存在的，它是一个中间层，告诉 AI Agent 目前存在哪些服务，哪些 API，哪些数据源，AI Agent 可以根据 Server 提供的信息来决定是否调用某个服务，然后通过 Function Calling 来执行函数。

# MCP Server 的工作原理

我们先来看一个简单的例子，假设我们想让 AI Agent 完成自动搜索 GitHub Repository，接着搜索 Issue，然后再判断是否是一个已知的 bug，最后决定是否需要提交一个新的 Issue 的功能。

那么我们就需要创建一个 Github MCP Server，这个 Server 需要提供查找 Repository、搜索 Issues 和创建 Issue 三种能力。

我们直接来看看代码：

```ts
const server = new Server(
  {
    name: "github-mcp-server",
    version: VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_repositories",
        description: "Search for GitHub repositories",
        inputSchema: zodToJsonSchema(repository.SearchRepositoriesSchema),
      },
      {
        name: "create_issue",
        description: "Create a new issue in a GitHub repository",
        inputSchema: zodToJsonSchema(issues.CreateIssueSchema),
      },
      {
        name: "search_issues",
        description: "Search for issues and pull requests across GitHub repositories",
        inputSchema: zodToJsonSchema(search.SearchIssuesSchema),
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (!request.params.arguments) {
      throw new Error("Arguments are required");
    }

    switch (request.params.name) {
      case "search_repositories": {
        const args = repository.SearchRepositoriesSchema.parse(request.params.arguments);
        const results = await repository.searchRepositories(
          args.query,
          args.page,
          args.perPage
        );
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      case "create_issue": {
        const args = issues.CreateIssueSchema.parse(request.params.arguments);
        const { owner, repo, ...options } = args;
        const issue = await issues.createIssue(owner, repo, options);
        return {
          content: [{ type: "text", text: JSON.stringify(issue, null, 2) }],
        };
      }

      case "search_issues": {
        const args = search.SearchIssuesSchema.parse(request.params.arguments);
        const results = await search.searchIssues(args);
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {}
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GitHub MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
```

上面的代码中，我们通过 server.setRequestHandler 来告诉 Client 端我们提供了哪些能力，通过 description 字段来描述这个能力的作用，通过 inputSchema 来描述完成这个能力需要的输入参数。

我们再来看看具体的实现代码：


```ts
export const SearchOptions = z.object({
  q: z.string(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.number().min(1).optional(),
  per_page: z.number().min(1).max(100).optional(),
});

export const SearchIssuesOptions = SearchOptions.extend({
  sort: z.enum([
    "comments",
    ...
  ]).optional(),
});

export async function searchUsers(params: z.infer<typeof SearchUsersSchema>) {
  return githubRequest(buildUrl("https://api.github.com/search/users", params));
}

export const SearchRepositoriesSchema = z.object({
  query: z.string().describe("Search query (see GitHub search syntax)"),
  page: z.number().optional().describe("Page number for pagination (default: 1)"),
  perPage: z.number().optional().describe("Number of results per page (default: 30, max: 100)"),
});

export async function searchRepositories(
  query: string,
  page: number = 1,
  perPage: number = 30
) {
  const url = new URL("https://api.github.com/search/repositories");
  url.searchParams.append("q", query);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("per_page", perPage.toString());

  const response = await githubRequest(url.toString());
  return GitHubSearchResponseSchema.parse(response);
}
```

可以很清晰的看到，我们最终实现是通过了 https://api.github.com 的 API 来实现和 Github 交互的，我们通过 githubRequest 函数来调用 GitHub 的 API，最后返回结果。

在调用 Github 官方的 API 之前，MCP 的主要工作是描述 Server 提供了哪些能力(给 LLM 提供)，需要哪些参数(参数具体的功能是什么)，最后返回的结果是什么。

所以 MCP Server 并不是一个新颖的、高深的东西，它只是一个具有共识的协议。

如果我们想要实现一个更强大的 AI Agent，例如我们想让 AI Agent 自动的根据本地错误日志，自动搜索相关的 GitHub Repository，然后搜索 Issue，最后将结果发送到 Slack。

那么我们可能需要创建三个不同的 MCP Server，一个是 Local Log Server，用来查询本地日志；一个是 GitHub Server，用来搜索 Issue；还有一个是 Slack Server，用来发送消息。

AI Agent 在用户输入 我需要查询本地错误日志，将相关的 Issue 发送到 Slack 指令后，自行判断需要调用哪些 MCP Server，并决定调用顺序，最终根据不同 MCP Server 的返回结果来决定是否需要调用下一个 Server，以此来完成整个任务。


# 参考资料

https://zhuanlan.zhihu.com/p/27327515233

* any list
{:toc}