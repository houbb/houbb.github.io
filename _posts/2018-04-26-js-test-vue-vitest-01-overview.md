---
layout: post
title:  Vitest-01-下一代测试框架 一个原生支持 Vite 的测试框架。非常快速！
date:  2018-07-05 21:01:28 +0800
categories: [Tool]
tags: [tool, js, test, sh]
published: true
---

# 为什么是 Vitest

Vite 原生测试运行器的必要性
Vite 天然支持常见的 Web 模式，同时支持 glob 导入和 SSR 等功能，而且它拥有许多插件和集成框架，从而慢慢形成一个活跃的生态社区。它的开发和构建模式是其成功的关键。对于文档构建框架，Vite 提供了一些基于 SSG 的替代方案。但是 Vite 的单元测试形式还不是十分清晰，而对于目前一些现有方案，比如 Jest 而言，它们会在不同的上下文环境中被创建的。并且 Jest 和 Vite 之间有很多重复的部分，让用户不得不创建两个不同的配置文件。

使用 Vite 开发服务器在测试过程中对文件进行转换，使得创建一个简单的测试运行器变得更加容易。该测试运行器无需处理源文件转换的复杂性，只需专注于提供最佳的开发体验。Vitest 与你的应用使用相同的配置（通过 vite.config.js ），在开发、构建和测试过程中共享相同的转换流水线。它还提供了可扩展的插件 API ，让你和你的工具维护者能够与 Vite 进行一流的集成。Vitest 从一开始就考虑了与 Vite 的协同工作，充分利用了 Vite 在开发体验方面的改进，如即时的热模块重载（ HMR ）。这就是 Vitest ，一个由 Vite 驱动的下一代测试框架。

由于 Jest 的大规模使用，Vitest 提供了与之兼容的 API，允许大家在大多数项目中将其作为备选使用。同时还包括了单元测试时最常见的功能（模拟，快照以及覆盖率）。Vitest 非常注重性能，尽可能多地使用 Worker 线程进行并发运行。并且在一些端口的测试运行速度提高了一个数量级。监听模式默认启用，与 Vite 推动开发者优先体验的理念保持一致。 即使在开发体验上进行了改进，Vitest 通过仔细挑选其依赖项（或直接内联所需的部分）来保持轻量级。

Vitest 旨在将自己定位为 Vite 项目的首选测试框架，即使对于不使用 Vite 的项目也是一个可靠的替代方案。

继续阅读 快速起步

# Vitest 与 X 有何不同？

你可以查看 比较 部分，了解有关 Vitest 与其他类似工具有何不同的更多详细信息。

## Jest

Jest 通过为大多数 JavaScript 项目提供开箱即用的支持、舒适的 API（it 和 expect）以及大多数设置所需的完整测试功能（快照、模拟和覆盖率），在测试框架领域占据了主导地位。我们感谢 Jest 团队和社区创建了一个令人愉悦的测试 API，并推动了许多现在成为 Web 生态系统标准的测试模式。

可以在 Vite 设置中使用 Jest。@sodatea 开发了 vite-jest ，旨在为 Jest 提供一流的 Vite 集成。Jest 中最后的阻碍已经解决，因此这是你单元测试的有效选项。

然而，在 Vite 为最常见的 Web 工具（TypeScript、JSX、最流行的 UI 框架）提供支持的世界中，引入 Jest 代表了复杂性的重复。如果你的应用由 Vite 驱动，那么需要配置和维护两个不同的管道是不合理的。使用 Vitest，你可以将开发、构建和测试环境的配置定义为一个管道，共享相同的插件和 vite.config.js 文件。

即使你的库没有使用 Vite（例如，如果它是使用 esbuild 或 rollup 构建的），Vitest 也是一个有趣的选择，因为它可以让你更快地运行单元测试，并通过默认使用 Vite 的即时热模块重载（HMR）观察模式来提高 DX。 Vitest 提供了与大多数 Jest API 和生态系统库兼容性，因此在大多数项目中，它应该可以作为 Jest 的替代品直接使用。

## Cypress

Cypress 是基于浏览器的测试工具，是 Vitest 的补充工具之一。

如果你想使用 Cypress，建议将 Vitest 用于测试项目中非浏览器逻辑，将 Cypress 用于测试依赖浏览器的逻辑。

Cypress 是著名的端到端测试工具，他们最新的组件测试运行器 对测试 Vite 组件有很好的支持，是测试任何在浏览器中渲染的东西的理想选择。

基于浏览器运行测试的框架，例如 Cypress, WebdriverIO 和 Web Test Runner，会捕获到 Vitest 无法捕获的问题，因为他们都是使用真实的浏览器和 APIs。

Cypress 的测试更加专注于确定元素是否可见，是否可以访问和交互。Cypress 专门为 UI 开发和测试而构建，它的开发体验趋向于测试你的视觉组件，你会看到程序的组件和测试报告一起出现。测试完成后，组件将保持交互状态，你可以使用浏览器开发工具调试发生的任何故障。

相比之下，Vitest 专注于为非浏览器逻辑提供最佳的开发体验。像 Vitest 这样的基于 Node.js 的测试框架支持各种实现部分浏览器环境的第三方包，例如 jsdom ，他们实现的足够多，就可以让我们快速的对于任何引用浏览器 APIs 的代码进行单元测试。

其代价是，这些浏览器环境在实现上有局限性。

例如，jsdom 缺少相当数量的特性，诸如 window.navigation 或者布局引擎（ offsetTop 等）。

最后，与 Web Test Runner 相比，Cypress 更像是一个 IDE 而不是测试框架，因为你还可以在浏览器中看到真实呈现的组件，以及它的测试结果和日志。

Cypress 还一直在 尝试将 Vite 集成进他们自己的产品中：使用 Vitesse 重新构建他们的应用的 UI，并使用 Vite 来测试驱动他们项目的开发。

我们认为 Cypress 不是对业务代码进行单元测试好选择，但使用 Cypress（用于端对端和组件测试）配合 Vitest（用于非浏览器逻辑的单元测试）将满足你应用的测试需求。

## WebdriverIO

WebdriverIO 类似于 Cypress，一个基于浏览器的替代测试运行器和 Vitest 的补充工具。它可以用作端到端测试工具以及测试 web 组件。它甚至在底层使用了 Vitest 的组件，例如对于组件测试中的 mocking and stubing。

WebdriverIO 具有与 Cypress 相同的优点，允许你在真实浏览器中测试逻辑。然而，它使用实际的 web 标准进行自动化，在运行 Cypress 测试时克服了一些权衡和限制。此外，它还允许你在移动设备上运行测试，使你可以在更多环境中测试应用。

## Web Test Runner

@web/test-runner在无头浏览器中运行测试，提供与 web 应用程序相同的执行环境，而无需模仿浏览器 API 或 DOM。

这也使得使用 devtools 在真实的浏览器中进行调试成为可能，尽管没有像 Cypress 测试那样显示用于逐步完成测试的 UI。

要在 Vite 项目中使用 @web/test-runner，请使用@remcovaes/web-test-runn-Vite-plugin。@web/testrunner 不包括断言或模拟对象库，所以由你来添加它们。

## uvu

uvu 是一个适用于 Node.js 和浏览器的测试运行器。它在单个线程中运行测试，因此测试不是隔离的，可能会跨文件泄漏。然而，Vitest 使用工作线程来隔离测试并并行运行它们。对于转换你的代码，uvu 依赖 require 和 loader 钩子。Vitest 使用 Vite，因此文件使用 Vite 的插件系统进行转换。在我们拥有 Vite 提供支持最常见 Web 工具（ TypeScript 、JSX 、最流行的 UI 框架）的世界中，uvu 代表了复杂性重复。

如果你的应用由 Vite 提供支持，则配置和维护两个不同管道是不可接受的。使用 Vitest，你可以将开发、构建和测试环境的配置定义为一个单一的流程，并共享相同的插件和 vite.config.js。 

uvu 不提供智能监视模式以重新运行更改后的测试, 而 Vitest 则通过默认监视模式使用 Vite 实时热更新 (HMR) 功能带给你惊人开发体验。 

uvu 是运行简单测试快速选项, 但对于更复杂的测试和项目, Vitest 可能更快、更可靠。

# 快速开始

## 总览

Vitest 是由 Vite 驱动的下一代测试框架。

你可以在 为什么是 Vitest 中了解有关该项目背后的基本原理的更多信息。

## 在线试用 Vitest

你可以在 StackBlitz 上在线尝试 Vitest 。

> [Vitest](https://stackblitz.com/edit/vitest-dev-vitest-n4hjpv?file=README.md&initialPath=__vitest__/)

它直接在浏览器中运行 Vitest，它几乎与本地设置相同，但不需要在你的计算机上安装任何东西。

## 将 Vitest 安装到项目

```sh
npm install -D vitest
```

建议你使用上面列出的方法之一在 package.json 中安装 vitest 的副本。 

但是，如果你希望直接运行 vitest，可以使用 npx vitest（npm 和 Node.js 附带 npx 命令）。

npx 命令将从本地 node_modules/.bin 执行命令，安装命令运行所需的任何包。 

默认情况下，npx 将检查命令是否存在于 $PATH 或本地项目二进制文件中，并执行它。 如果未找到命令，它将在执行之前安装。

## 编写测试

例如，我们将编写一个简单的测试来验证将两个数字相加的函数的输出。


```js
// sum.js
export function sum(a, b) {
  return a + b
}

// sum.test.js
import { expect, test } from 'vitest'
import { sum } from './sum'

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})
```

一般情况下，执行测试的文件名中必须包含 ".test." 或 ".spec." 。

接下来，为了执行测试，请将以下部分添加到你的 package.json 文件中：

```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

最后，运行 npm run test、yarn test 或 pnpm test，具体取决于你的包管理器，Vitest 将打印此消息：


```
✓ sum.test.js (1)
  ✓ adds 1 + 2 to equal 3

Test Files  1 passed (1)
    Tests  1 passed (1)
  Start at  02:15:44
  Duration  311ms
```

了解更多关于 Vitest 的使用，请参考 API 索引 部分。

## 配置 Vitest

Vitest 的主要优势之一是它与 Vite 的统一配置。

如果存在，vitest 将读取你的根目录 vite.config.ts 以匹配插件并设置为你的 Vite 应用。

例如，你的 Vite 有 resolve.alias 和 plugins 的配置将会在 Vitest 中开箱即用。如果你想在测试期间想要不同的配置，你可以:

创建 vitest.config.ts，优先级将会最高。

将 --config 选项传递给 CLI，例如 vitest --config ./path/to/vitest.config.ts。

在 defineConfig 上使用 process.env.VITEST 或 mode 属性（如果没有被覆盖，将设置为 test）有条件地在 vite.config.ts 中应用不同的配置。

Vitest 支持与 Vite 相同的配置文件扩展名：.js、.mjs、.cjs、.ts、.cts、.mts。 Vitest 不支持 .json 扩展名。

如果你不使用 Vite 作为构建工具，你可以使用配置文件中的 test 属性来配置 Vitest：

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // ...
  },
})
```

如果你已经在使用 Vite，请在 Vite 配置中添加 test 属性。你还需要使用 三斜杠指令 在你的配置文件的顶部引用。

```js
/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    // ...
  },
})
```

## 支持工作空间

使用 Vitest Workspaces 在同一项目中运行不同的项目配置。

你可以在vitest.workspace文件中定义工作区的文件和文件夹列表。

该文件支持 js / ts / json 扩展名。此功能非常适合配合 monorepo 使用。

```js
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // 你可以用一个 glob 模式列表来定义你的工作空间
  // Vitest 希望一系列配置文件
  // 或者包含一个配置文件的目录
  'packages/*',
  'tests/*/vitest.config.{e2e,unit}.ts',
  // 你甚至可以在同一个 "vitest" 进程中以不同的配置
  // 运行相同的测试
  {
    test: {
      name: 'happy-dom',
      root: './shared_tests',
      environment: 'happy-dom',
      setupFiles: ['./setup.happy-dom.ts'],
    },
  },
  {
    test: {
      name: 'node',
      root: './shared_tests',
      environment: 'node',
      setupFiles: ['./setup.node.ts'],
    },
  },
])
```

## 命令行

在安装了 Vitest 的项目中，你可以在 npm 脚本中使用 vitest 脚本，或者直接使用 npx vitest 运行它。 

以下是脚手架 Vitest 项目中的默认 npm 脚本：

```js
{
  "scripts": {
    "test": "vitest",
    "coverage": "vitest run --coverage"
  }
}
```

要在不监视文件更改的情况下运行一次测试，请使用 vitest run。 

你还可以指定其他 CLI 选项，例如 --port 或 --https。 

有关 CLI 选项的完整列表，可以在你的项目中运行 npx vitest --help。

了解更多有关 命令行界面 的更多信息

# 参考资料

https://cn.vitest.dev/guide/why.html


* any list
{:toc}