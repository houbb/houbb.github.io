---
layout: post
title: test mock-06-mountebank Over the wire test doubles
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [test, mock, sh]
published: true
---

# 拓展阅读

[test 之 jmockit-01-overview](https://houbb.github.io/2023/05/09/test-jmockit-01-overview)

[jmockit-01-test 之 jmockit 入门使用案例](https://houbb.github.io/2023/05/09/test-jmockit-00-intro)

[mockito-01-overview mockito 简介及入门使用](https://houbb.github.io/2023/05/09/test-mockito-01-overview)

[PowerMock](https://houbb.github.io/2017/10/27/powermock)

[Mock Server](https://houbb.github.io/2017/11/03/mock-server)

[ChaosBlade-01-测试混沌工程平台整体介绍](https://houbb.github.io/2023/08/08/jvm-chaosblade-01-overview)

[jvm-sandbox 入门简介](https://houbb.github.io/2020/06/04/jvm-sandbox-00-overview)

# mountebank

Mountebank 是唯一一款在协议多样性、功能性和性能方面与商业服务虚拟化工具竞争的开源工具。

以下是 Capital One 关于其移动云迁移的描述（强调为原文）：

实际上，中途我们发现我们的公司模拟软件无法处理我们在这个项目中运行的大量性能测试（我们在这个过程中完全击败了一些相当强大的企业软件）。

因此，我们决定将整个程序迁移到基于 Mountebank OSS 的解决方案，通过自定义配置，使我们能够根据需求扩展/缩减我们的模拟需求。

目前，Mountebank 支持以下协议，可以直接在工具中实现，或作为社区扩展：

- http
- https
- tcp（文本和二进制）
- smtp
- ldap
- grpc
- websockets
- graphql
- snmp
- telnet
- ssh
- netconf

Mountebank 支持模拟验证、具有高级谓词的存根设置、JavaScript 注入以及通过代理进行录制和回放。

![overview](https://github.com/bbyars/mountebank/blob/master/src/public/images/overview.gif?raw=true)

# 入门

install

```
npm install -g mountebank
```

run

```
mb
```

如果需要自定义 Mountebank，有许多命令行选项可供使用。

所有的 Mountebank 预发布版本都可以通过 beta npm 标签获取。

除非通过了所有测试，否则不会发布任何 beta 版本。

# 为什么选择 Mountebank？

Mountebank 的目标包括：

1. **易于入门：** Mountebank 安装简便，没有任何平台依赖性。

它致力于提供有趣且全面的文档，包含大量示例，并提供一个漂亮的 UI，让您可以交互地探索 API。

2. **一个平台，而不仅仅是一个工具：** Mountebank 旨在实现完全跨平台，具有本地语言绑定。当现有功能不足以满足需求时，服务器可以通过脚本进行扩展。

3. **强大：** Mountebank 是唯一一个非模态且支持多协议的开源服务虚拟化工具。虽然存在商业解决方案，但其许可平台使得将测试移到开发附近变得困难，甚至可能需要专门的集成开发环境（IDE）。Mountebank 免费提供服务虚拟化，没有任何平台限制。

目前，并非所有 Mountebank 的目标都已实现，但请放心，因为它拥有一支顶级的开源开发团队，而且他们众多。


# chat

## 详细介绍一下 mountebank

**Mountebank** 是一款开源的服务虚拟化工具，用于模拟和测试系统之间的交互。

以下是 Mountebank 的一些关键特点和功能：

1. **易于入门：** Mountebank 的安装非常简单，没有平台依赖性。用户可以轻松地开始使用，无需复杂的配置。

2. **跨平台：** Mountebank 的目标是成为完全跨平台的工具，支持各种操作系统。它具有本地语言绑定，使得可以在不同平台上轻松运行。

3. **多协议支持：** Mountebank 是唯一一个支持多协议的开源服务虚拟化工具。它可以模拟 HTTP、HTTPS、TCP、SMTP、LDAP、gRPC、WebSockets、GraphQL、SNMP、Telnet、SSH、Netconf 等多种协议。

4. **强大的扩展性：** Mountebank 的服务器是可扩展的，用户可以通过脚本扩展其功能。这意味着如果默认功能无法满足需求，可以通过自定义脚本来实现更复杂的行为。

5. **用户友好的文档和 UI：** Mountebank 提供了详细的文档，包含丰富的示例，以及交互式的 UI，使用户能够轻松地探索 API 和配置虚拟服务。

6. **免费且无平台限制：** Mountebank 提供免费的服务虚拟化功能，没有任何平台限制。这意味着用户可以在不受许可限制的情况下自由使用工具。

总体而言，Mountebank 是一个强大而灵活的工具，适用于各种场景，包括单元测试、集成测试、性能测试等，帮助开发人员更轻松地模拟和测试系统的不同方面。

## mountebank 是如何设计的，让其支持多协议？

Mountebank 之所以能够支持多协议，是因为其设计上具有灵活性和可扩展性。以下是 Mountebank 的一些设计特点：

1. **模块化架构：** Mountebank 的架构设计是模块化的，允许轻松地添加新的协议模块。每个协议都可以被视为一个独立的模块，而 Mountebank 的核心系统负责协调它们之间的交互。

2. **插件机制：** Mountebank 提供了插件机制，使得用户可以编写自定义插件来支持新的协议。这样，用户可以根据需要自定义协议的实现，而不需要修改 Mountebank 的核心代码。

3. **脚本扩展：** Mountebank 允许用户通过 JavaScript 脚本扩展其功能。通过脚本，用户可以定义更复杂的行为，包括对特定协议的定制逻辑。这种灵活性使得用户能够根据实际需求定义协议的行为。

4. **协议抽象层：** Mountebank 的设计包含了一个协议抽象层，该层将不同协议的实现与核心系统分离。这使得在不同协议之间切换变得相对简单，而不会影响到整个系统的稳定性。

5. **跨语言支持：** Mountebank 提供本地语言绑定，使得它可以在多种编程语言中运行。这种设计允许用户使用不同的语言编写协议实现，使得支持新协议变得更加灵活。

通过以上设计特点，Mountebank 实现了对多协议的支持，使其成为一个通用的服务虚拟化工具，而不仅仅局限于特定的通信协议。这也是为什么 Mountebank 能够灵活适应不同场景和需求的原因。

# 小结

这种作为一个 mock 平台的设计思想非常优秀，不在拘泥于一种语言。

# 参考资料

https://github.com/bbyars/mountebank

https://www.mbtest.org/docs/gettingStarted

* any list
{:toc}
