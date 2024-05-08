---
layout: post
title:  端到端测试-01-cypress
date:  2018-07-05 21:01:28 +0800
categories: [Tool]
tags: [tool, js, test, end-to-end-test, sh]
published: true
---

# Why Cypress?

你将学到什么：

- Cypress 是什么，以及为什么你应该使用它

- 我们的使命，以及我们的信念

- Cypress 的关键特性

- Cypress 设计的测试类型

- 简而言之

Cypress 是一个为现代网络构建的下一代前端测试工具。我们解决了开发人员和 QA 工程师在测试现代应用程序时面临的关键痛点。

我们使以下操作成为可能：

- 设置测试

- 编写测试

- 运行测试

- 调试测试

Cypress 最常与 Selenium 进行比较；然而，Cypress 在根本上和架构上都有所不同。Cypress 不受与 Selenium 相同的限制。

这使你能够编写更快、更简单、更可靠的测试。

## 谁在使用 Cypress？

我们的用户通常是使用现代 JavaScript 框架构建 Web 应用程序的开发人员或 QA 工程师。

Cypress 使你能够编写各种类型的测试：

- 端到端测试
- 组件测试
- 集成测试
- 单元测试

Cypress 可以测试在浏览器中运行的任何内容。

## Cypress 生态系统

Cypress 包括一个免费的、开源的、本地安装的应用程序和 Cypress Cloud，用于记录你的测试。

首先：Cypress 帮助你每天在构建应用程序的同时设置和开始编写测试。这是 TDD 的最佳实践！

之后：构建了一套测试并将 Cypress 与你的 CI 提供商集成后，Cypress Cloud 可以记录你的测试运行。你将不再疑惑：为什么会失败？

## 我们的使命

我们的使命是构建一个繁荣的、开源的生态系统，提高生产率，使测试成为一种愉快的体验，并带来开发者的幸福感。我们对自己的工作负责，推动一个真正有效的测试流程。

我们相信我们的文档应该是平易近人的。这意味着让我们的读者完全理解不仅是什么，还有为什么。

我们希望帮助开发人员更快、更好地构建新一代的现代应用程序，而不用担心管理测试带来的压力和焦虑。我们的目标是通过利用测试结果生成可操作的见解来提升软件开发的艺术水平，通过主动识别改进空间来实现长期稳定性。

我们知道，为了取得成功，我们必须激发、培育和促进一个以开源为基础的生态系统。每一行测试代码都是对你代码库的投资，它永远不会与我们作为付费服务或公司捆绑在一起。测试将能够独立运行和工作，永远不会依赖于我们。

我们相信测试需要大量的❤️，我们在这里建立一个每个人都能学习和受益的工具、服务和社区。我们正在解决每个在 Web 上工作的开发者共享的最艰难的痛点。我们相信这个使命，并希望你加入我们，使 Cypress 成为一个持久的生态系统，让每个人都感到满意。

## 特点

Cypress 已经全面成熟，功能齐全。以下是它可以做到而其他测试框架无法做到的事情的列表：

时间旅行：Cypress 在你的测试运行时拍摄快照。将鼠标悬停在命令日志中的命令上，以查看每个步骤发生的具体情况。

可调试性：不再猜测你的测试为什么失败。直接从熟悉的工具（如开发者工具）进行调试。我们可读的错误和堆栈跟踪使调试速度快得惊人。

自动等待：不再为测试添加等待或休眠时间。Cypress 在继续之前会自动等待命令和断言。不再有异步地狱。

间谍、存根和时钟：验证和控制函数、服务器响应或定时器的行为。你从单元测试中喜欢的相同功能现在就在你的指尖。

网络流量控制：轻松地控制、存根和测试边缘情况，而不需要涉及你的服务器。你可以根据需要存根网络流量。

一致的结果：我们的架构不使用 Selenium 或 WebDriver。与闪烁的测试说再见，迎接快速、一致和可靠的测试。

截图、视频和测试重放：查看自动在失败时拍摄的屏幕截图，或者（如果启用）整个测试套件的视频，当从 CLI 运行时。记录到 Cypress Cloud 并使用测试重放进行零配置调试时，回放测试的执行情况。

跨浏览器测试：在 Firefox 和 Chrome 家族浏览器（包括 Edge 和 Electron）中本地运行测试，并在持续集成管道中进行优化。

智能编排：一旦你设置好了记录到 Cypress Cloud，轻松地并行化你的测试套件，使用规范优先权重新运行失败的规范，并使用自动取消功能在失败时取消测试运行，以获得紧密的反馈循环。

闪烁检测：使用 Cypress Cloud 的闪烁测试管理发现和诊断不可靠的测试。





# 测试类型

Cypress 可用于编写多种不同类型的测试。这可以更加确保你要测试的应用程序按预期工作。

## 端到端

Cypress 最初设计用于在浏览器中运行端到端（E2E）测试，测试任何在浏览器中运行的内容。典型的端到端测试会在浏览器中访问应用程序，并通过用户界面执行操作，就像真实用户一样。

```javascript
it('adds todos', () => {
  cy.visit('https://example.cypress.io/')
  cy.get('[data-testid="new-todo"]')
    .type('write code{enter}')
    .type('write tests{enter}')
  // 确认应用程序显示了两个项目
  cy.get('[data-testid="todos"]').should('have.length', 2)
})
```

## 组件

你还可以使用 Cypress 挂载来自支持的 Web 框架的组件，并执行组件测试。

```javascript
import TodoList from './components/TodoList'

it('包含正确数量的待办事项', () => {
  const todos = [
    { text: 'Buy milk', id: 1 },
    { text: 'Learn Component Testing', id: 2 },
  ]

  cy.mount(<TodoList todos={todos} />)
  // 组件开始运行就像一个迷你 Web 应用程序一样
  cy.get('[data-testid="todos"]').should('have.length', todos.length)
})
```

## API

Cypress 可以执行任意的 HTTP 调用，因此你可以用它进行 API 测试。

```javascript
it('添加一个待办事项', () => {
  cy.request({
    url: '/todos',
    method: 'POST',
    body: {
      title: 'Write REST API',
    },
  })
    .its('body')
    .should('deep.contain', {
      title: 'Write REST API',
      completed: false,
    })
})
```

## 其他

最后，通过大量的官方和第三方插件，你可以编写 Cypress 辅助功能、视觉、电子邮件和其他类型的测试。

# Cypress in the Real World

Cypress 让开始测试变得快速简单，当你开始测试你的应用程序时，你经常会想知道是否在使用最佳实践或可扩展的策略。

为了指导你，Cypress 团队创建了真实世界应用程序（RWA），这是一个完整的堆栈示例应用程序，展示了在实际和现实场景中使用 Cypress 进行测试。

RWA 通过跨多个浏览器和设备尺寸的端到端测试实现了全代码覆盖，同时还包括视觉回归测试、API 测试、单元测试，并在高效的 CI 流水线中运行所有这些测试。使用 RWA 来学习、实验、调整和实践使用 Cypress 进行 Web 应用程序测试。

该应用程序打包了一切你需要的东西，只需克隆存储库并开始测试。

# 参考资料

https://docs.cypress.io/guides/overview/why-cypress


* any list
{:toc}