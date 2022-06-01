---
layout: post
title:  Solidity-06-Installing the Solidity Compiler
date:  2022-05-22 09:22:02 +0800
categories: [Lang]
tags: [lang, solidity, sh]
published: true
---

# 版本控制

Solidity 版本遵循语义版本控制。

此外，主版本 0（即 0.x.y）的补丁级别版本将不包含重大更改。

这意味着使用版本 0.x.y 编译的代码可以预期使用 0.x.z 编译，其中 z > y。

除了发布之外，我们还提供夜间开发版本，目的是让开发人员更容易尝试即将推出的功能并提供早期反馈。

但是请注意，虽然夜间构建通常非常稳定，但它们包含来自开发分支的前沿代码，并且不能保证始终有效。尽管我们尽了最大努力，但它们可能包含未记录和/或损坏的更改，这些更改不会成为实际版本的一部分。它们不适用于生产用途。

**部署合约时，您应该使用最新发布的 Solidity 版本。**

这是因为定期引入重大更改以及新功能和错误修复。

我们目前使用 0.x 版本号来表示这种快速变化。

# Remix

我们推荐 Remix 用于小型合约和快速学习 Solidity。

在线访问 Remix，您无需安装任何东西。 如果您想在不连接 Internet 的情况下使用它，请转到 https://github.com/ethereum/remix-live/tree/gh-pages 并按照该页面上的说明下载 .zip 文件。 

Remix 也是无需安装多个 Solidity 版本即可测试夜间构建的便捷选项。

此页面上的更多选项详细说明了在您的计算机上安装命令行 Solidity 编译器软件。 

如果您正在处理更大的合同或需要更多编译选项，请选择命令行编译器。

# npm / Node.js

使用 npm 以方便且可移植的方式安装 solcjs，一个 Solidity 编译器。 

solcjs 程序的功能比本页后面描述的访问编译器的方式要少。 

使用命令行编译器文档假设您使用的是全功能编译器 solc。 

solcjs 的使用记录在其自己的存储库中。

注意：solc-js 项目是使用 Emscripten 从 C++ solc 派生的，这意味着两者都使用相同的编译器源代码。 

solc-js 可以直接用在 JavaScript 项目中（比如 Remix）。 

有关说明，请参阅 solc-js 存储库。

```
npm install -g solc
```

命令行可执行文件名为 solcjs。

solcjs 的命令行选项与 solc 不兼容，并且期望 solc 行为的工具（例如 geth）不适用于 solcjs。


# 参考资料

https://docs.soliditylang.org/en/latest/installing-solidity.html

* any list
{:toc}