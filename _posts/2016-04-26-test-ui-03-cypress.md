---
layout: post
title:  test ui-03-cypress 入门介绍
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, ui-test, test]
published: true
---


#  cypress 是什么？

简而言之，Cypress 是一款专为现代Web构建的下一代前端测试工具。我们解决了开发人员和质量保证工程师在测试现代应用程序时面临的关键问题。

我们使以下操作成为可能：

- 设置测试
- 编写测试
- 运行测试
- 调试测试

Cypress经常与Selenium进行比较；然而，Cypress在根本上和体系结构上都是不同的。Cypress不受Selenium相同的限制。

这使您能够编写更快、更简便且更可靠的测试。

## 谁在使用Cypress？

我们的用户通常是使用现代JavaScript框架构建Web应用程序的开发人员或质量保证工程师。

Cypress使您能够编写各种类型的测试：

- 端到端测试
- 组件测试
- 集成测试
- 单元测试

Cypress可以测试在浏览器中运行的任何内容。

## Cypress生态系统

Cypress由一个免费的、开源的、本地安装的应用程序和Cypress Cloud组成，用于记录您的测试。

首先：Cypress帮助您在本地构建应用程序时每天设置和开始编写测试。最佳的测试驱动开发！

然后：在构建一套测试并将Cypress与您的CI提供程序集成之后，Cypress Cloud可以记录您的测试运行。您将不再想知道：为什么会失败？

## 我们的使命

我们的使命是建立一个繁荣的、开源的生态系统，提高生产力，使测试成为一种愉快的体验，并带来开发者的幸福感。我们将自己视为倡导一个实际有效的测试过程的责任人。

我们相信我们的文档应该是平易近人的。这意味着使我们的读者完全理解不仅是什么，还包括为什么。

我们希望帮助开发人员更快、更好地构建新一代现代应用程序，而不会因管理测试而产生压力和焦虑。我们的目标是通过主动识别改进区域以生成可操作见解，借助测试结果提升软件开发的艺术。

我们知道，为了取得成功，我们必须使一个依赖于开源的生态系统繁荣。每一行测试代码都是对您代码库的一种投资，它永远不会与我们作为一个付费服务或公司相耦合。测试将能够独立运行和工作，始终如此。

我们相信测试需要很多 ❤️，我们在这里构建一个每个人都能学到并受益的工具、服务和社区。

我们正在解决每个在Web上工作的开发人员共享的最困难的痛点。

我们相信这个使命，并希望您加入我们，使Cypress成为一个持久的生态系统，使每个人都感到满意。

## 功能特性

Cypress是一个功能齐全、即插即用的测试框架。以下是它能够完成，而其他测试框架无法做到的一些事情：

**时光旅行（Time Travel）：** Cypress在运行测试时会生成快照。在命令日志中悬停在命令上，以查看每个步骤发生的确切情况。

**可调试性（Debuggability）：** 不再猜测测试失败的原因。直接从熟悉的工具（如开发者工具）中进行调试。我们可读的错误和堆栈跟踪使调试速度极快。

**自动等待（Automatic Waiting）：** 永远不要在测试中添加等待或睡眠。Cypress会在继续之前自动等待命令和断言。不再有异步地狱。

**间谍、存根和时钟（Spies, Stubs, and Clocks）：** 验证和控制函数、服务器响应或定时器的行为。单元测试中喜爱的相同功能现在近在咫尺。

**网络流量控制（Network Traffic Control）：** 轻松控制、存根和测试边缘情况，而无需涉及服务器。您可以按照自己的喜好存根网络流量。

**一致的结果（Consistent Results）：** 我们的架构不使用Selenium或WebDriver。迎接快速、一致且可靠的无故障测试。

**截图、视频和测试重放（Screenshots, Videos, and Test Replay）：** 在失败时自动查看屏幕截图，或者如果启用，查看从CLI运行时整个测试套件的视频。将录制上传到Cypress Cloud，使用测试重放进行零配置调试，以按照运行时的方式重放测试。

**跨浏览器测试（Cross Browser Testing）：** 在本地和持续集成流水线中在Firefox和Chrome系列浏览器（包括Edge和Electron）中运行测试。

**智能编排（Smart Orchestration）：** 一旦设置为录制到Cypress Cloud，轻松并行化测试套件，使用Spec Prioritization首先重新运行失败的规范，并在失败时使用Auto Cancellation取消测试运行，以获得紧密的反馈循环。

**不稳定测试检测（Flake Detection）：** 使用Cypress Cloud的Flaky测试管理发现和诊断不稳定的测试。

# 测试类型

Cypress可以用于编写多种不同类型的测试。

这可以进一步确保您要测试的应用程序按照预期的方式运行。

**端到端测试（End-to-end）：**
Cypress最初设计用于在运行在浏览器中的任何内容上运行端到端（E2E）测试。

典型的端到端测试访问浏览器中的应用程序，并通过用户界面执行操作，就像真实用户一样。

```javascript
it('添加待办事项', () => {
  cy.visit('https://example.cypress.io/')
  cy.get('[data-testid="new-todo"]')
    .type('编写代码{enter}')
    .type('编写测试{enter}')
  // 确认应用程序显示两个条目
  cy.get('[data-testid="todos"]').should('have.length', 2)
})
```

**组件测试（Component）：**
您还可以使用Cypress挂载来自支持的Web框架的组件并执行组件测试。

```javascript
import TodoList from './components/TodoList'

it('包含正确数量的待办事项', () => {
  const todos = [
    { text: '买牛奶', id: 1 },
    { text: '学习组件测试', id: 2 },
  ]

  cy.mount(<TodoList todos={todos} />)
  // 组件开始运行，就像一个小型Web应用程序
  cy.get('[data-testid="todos"]').should('have.length', todos.length)
})
```

**API测试：**
Cypress可以执行任意的HTTP调用，因此您可以将其用于API测试。

```javascript
it('添加待办事项', () => {
  cy.request({
    url: '/todos',
    method: 'POST',
    body: {
      title: '编写REST API',
    },
  })
    .its('body')
    .should('deep.contain', {
      title: '编写REST API',
      completed: false,
    })
})
```

**其他类型：**
最后，通过大量官方和第三方插件，您可以编写Cypress可访问性、视觉、电子邮件等其他类型的测试。


# chat

## 详细介绍一下 ui 测试 cypress

Cypress 是一个现代的 JavaScript 测试框架，主要用于端到端（End-to-End）的前端测试。

它专注于提供简单、快速、可靠的 UI 测试体验。

 以下是 Cypress 的一些主要特性和概念：

1. **自动化测试：** Cypress 提供了一套强大的 API，可以用于编写和运行自动化测试。这些测试主要用于模拟用户与应用程序交互，例如点击按钮、填写表单等。

2. **实时重新加载：** Cypress 支持实时重新加载，这意味着你可以在编写测试的同时，实时观察测试执行的结果。这有助于提高开发和调试效率。

3. **直观的断言：** Cypress 使用直观的断言语法，使测试代码易于理解和编写。这包括类似于 `should` 和 `expect` 的语法，使得验证应用程序的行为变得简单明了。

4. **可见即可测（Time-Travel）：** Cypress 具有一种独特的功能，允许你在测试运行时查看应用程序的状态。这使得在测试过程中定位问题变得更加容易。

5. **支持异步测试：** 在现代前端应用程序中，很多操作都是异步的，Cypress 提供了简单而强大的方式来处理异步操作，确保测试在合适的时候等待、检查和验证。

6. **无头浏览器：** Cypress 在默认情况下是无头（headless）运行的，但也提供了一个可选的图形用户界面（GUI），方便调试。

7. **易于安装和使用：** Cypress 的安装过程相对简单，使用起来也较为直观。它有丰富的文档和社区支持，使得学习和解决问题更加容易。

8. **适用于多种项目：** Cypress 不仅支持 Web 应用程序的测试，还可以用于桌面应用程序、移动应用程序等不同类型的前端项目。

一个基本的 Cypress 测试用例可能包括以下步骤：

```javascript
// 示例测试用例
describe('My First Test', function() {
  it('Visits the Kitchen Sink', function() {
    // 访问一个网站
    cy.visit('https://example.cypress.io')

    // 与页面交互
    cy.contains('type').click()

    // 写入文本框
    cy.url().should('include', '/commands/actions')

    // 验证文本框中的值
    cy.get('.action-email').type('test@example.com').should('have.value', 'test@example.com')
  })
})
```

这只是一个简单的示例，Cypress 提供了丰富的 API 和功能，使得测试更加灵活和强大。

你可以根据项目的具体需求来编写更复杂的测试用例。

## 什么叫端到端（End-to-End）测试？

端到端（End-to-End，简称E2E）测试是一种软件测试方法，旨在验证整个应用程序的工作流程，从用户界面到数据库和应用程序中的各个组件。

这种测试方法的目标是模拟真实用户的使用场景，确保整个系统能够按照预期的方式运行。

端到端测试关注的是应用程序的端到端的行为，而不仅仅是单个组件或模块的功能。

端到端测试的主要特点包括：

1. **涵盖整个系统：** 端到端测试不仅仅关注前端或后端的某个部分，而是覆盖整个应用程序的各个层面，包括用户界面、业务逻辑、数据库等。

2. **模拟用户交互：** 端到端测试试图模拟真实用户的行为，包括点击按钮、填写表单、导航页面等。这样的测试能够捕捉到用户在应用程序中的真实体验。

3. **多组件测试：** 在端到端测试中，多个组件、模块或服务可以同时被测试，以确保它们在协同工作时能够正确地交互和产生期望的结果。

4. **验证系统集成：** 端到端测试有助于验证整个系统的集成，包括不同组件之间的交互、数据流动等。

5. **自动化测试：** 由于端到端测试通常需要覆盖大量的用户交互和系统行为，因此自动化是一种常见的实践。自动化端到端测试工具能够模拟用户的行为，执行测试脚本，并提供详细的测试结果。

6. **发现全局问题：** 端到端测试有助于发现那些只在整个系统中才能暴露出的问题，例如集成问题、跨组件的错误等。

总体而言，端到端测试是确保整个应用程序在真实使用条件下能够正常工作的一种关键测试方法。

虽然它在一些方面比单元测试和集成测试更为耗时和复杂，但它提供了对整个系统的高级别保证。

## cypress 如何实现 实时重新加载 的？

Cypress 实现实时重新加载的机制主要基于其自动化测试框架的设计和执行流程。

以下是 Cypress 实现实时重新加载的基本原理：

1. **持续监控文件变化：** Cypress 在运行测试时，会持续监控项目文件的变化，包括测试代码、应用程序代码以及其他相关文件。这可以通过监听文件系统的变化来实现。

2. **重新执行测试：** 一旦检测到文件发生变化，Cypress 将重新执行相关的测试。这样，开发人员在编辑代码后，不需要手动重新运行测试，Cypress 会自动检测变化并重新执行相关测试用例。

3. **实时反馈：** 在重新执行测试的过程中，Cypress 提供了实时的反馈。这意味着测试结果、日志和其他输出会实时更新，开发人员可以即时查看测试执行的状态和结果。

4. **快速定位问题：** 实时重新加载使得开发人员能够更快速地定位代码变更引起的问题。通过实时观察测试执行结果，开发人员可以立即看到他们的修改是否导致测试失败，从而更快地进行调试和修复。

这个实时重新加载的特性是 Cypress 设计中的一个关键点，旨在提高开发者的工作效率。在开发过程中，开发人员可以专注于编写代码，同时 Cypress 负责在后台监控和执行测试，确保及时地提供反馈。

在使用 Cypress 进行测试时，你可以在终端中看到类似以下的输出，表明 Cypress 正在监听文件变化并重新执行测试：

```
Watching the file system...
```

请注意，Cypress 的版本可能有所更新，具体的实现细节可能会有所不同。

建议查阅 Cypress 的官方文档以获取最新的信息。

## cypress 是如何支持异步测试的？

Cypress 支持异步测试的方式主要通过 Cypress 的命令（commands）和断言（assertions）来处理。

在现代的前端应用中，很多操作是异步的，例如通过 AJAX 请求获取数据、等待元素在页面上加载等。

Cypress 提供了一种直观且强大的方式来处理异步操作。

以下是 Cypress 如何支持异步测试的几个关键点：

1. **命令队列（Command Queue）：** Cypress 通过命令队列来执行测试命令。每个 Cypress 命令都被加入队列，并按照顺序执行。这确保了在测试代码中执行的异步命令按照正确的顺序执行。

2. **命令的链式调用：** Cypress 命令是可链式调用的，这使得在一个命令的回调中执行另一个命令成为可能。这对于处理异步操作非常有帮助，因为你可以在前一个命令的回调中执行下一个命令，确保在异步操作完成后继续测试流程。

   ```javascript
   // 示例：链式调用异步命令
   cy.get('button').click().then(() => {
     cy.get('.result').should('contain', 'Success');
   });
   ```

3. **等待命令：** Cypress 提供了一系列的等待命令，如 `cy.wait()` 和 `cy.contains().should()`，用于等待异步操作完成后再继续执行测试。这些等待命令会自动重试直到指定条件满足。

   ```javascript
   // 示例：等待元素包含指定文本
   cy.get('.result').should('contain', 'Success');
   ```

4. **自动等待：** Cypress 通过智能等待的方式来处理页面中的异步操作。在执行命令时，Cypress 会等待元素出现、动画完成等，而不需要手动添加显式的等待。

5. **异步断言：** Cypress 断言语法支持 Promise，这使得可以在断言中执行异步操作。

例如，在 `.should()` 断言中，你可以返回一个 Promise 对象。

   ```javascript
   // 示例：异步断言
   cy.get('.result').should(($el) => {
     return new Promise((resolve) => {
       // 异步逻辑
       setTimeout(() => {
         expect($el).to.have.text('Success');
         resolve();
       }, 1000);
     });
   });
   ```

通过这些机制，Cypress 提供了一种清晰而强大的方式来处理异步测试场景，使得开发者能够编写稳健而可靠的端到端测试。

## 给出学习 cypress 的资料地址，包含网址

以下是学习 Cypress 的一些官方和非官方资源：

1. **官方文档：**
   - [Cypress 官方文档](https://docs.cypress.io/)
   - [Cypress GitHub 仓库](https://github.com/cypress-io/cypress)

2. **视频教程：**
   - [Cypress 入门视频教程 - Codevolution](https://www.youtube.com/watch?v=NgbdyMjzWfE)
   - [Cypress 实战教程 - Academind](https://www.youtube.com/watch?v=r9HdJ8P6GQI)

3. **博客和文章：**
   - [Cypress: End-to-End Testing Framework](https://www.cypress.io/blog/2017/11/15/intro-to-cypress/)
   - [A Comprehensive Guide to Cypress Testing](https://www.cypress.io/blog/2019/01/03/cypress-2018-in-review/)

4. **社区论坛：**
   - [Cypress 论坛](https://www.cypress.io/blog/2017/11/15/intro-to-cypress/)

5. **Cypress 在 GitHub 上的示例项目：**
   - [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app): 一个示例应用，用于演示 Cypress 的不同特性。

6. **在线课程：**
   - [Test Automation University - End to End JavaScript Testing with Cypress](https://testautomationu.applitools.com/end-to-end-javascript-testing-with-cypress/)

请注意，Cypress 是一个活跃的项目，因此官方文档和社区资源可能会更新。始终建议查看最新的官方文档和社区讨论，以获取最新的信息和最佳实践。


## 如果让你深入学习 cypress, 你会问哪10个问题？为什么？

当深入学习 Cypress 时，以下是一些可能有助于全面理解和掌握 Cypress 的问题：

1. **Cypress 是什么？它解决了什么问题？**

   - 这个问题有助于理解 Cypress 的设计目标和优势。
   
   Cypress 是一个端到端的前端测试框架，主要用于自动化测试，并旨在提供简单、快速、可靠的测试体验。

2. **Cypress 的核心特性是什么？**
   - 这有助于理解 Cypress 提供了哪些功能和工具，例如实时重新加载、直观的断言、可见即可测（Time-Travel）等。

3. **Cypress 如何处理异步测试？**
   - 异步测试是前端应用中常见的情景，了解 Cypress 如何处理异步操作，以及它提供的等待命令和异步断言是至关重要的。

4. **Cypress 的命令队列是如何工作的？**
   - Cypress 使用命令队列执行测试命令。了解这个机制有助于理解 Cypress 的执行流程，特别是在处理链式调用和异步操作时。

5. **Cypress 如何实现实时重新加载？**
   - 实时重新加载是 Cypress 的一项重要特性，使得在测试时实时观察代码变化。了解实时重新加载的原理有助于更好地利用这一功能。

6. **Cypress 如何处理跨浏览器兼容性？**
   - Cypress 支持在多种浏览器中运行测试，但它与传统的 Selenium 不同。了解 Cypress 的跨浏览器测试策略对于开发具有广泛兼容性的应用程序至关重要。

7. **Cypress 如何进行元素选择和交互？**
   - 了解 Cypress 如何选择页面上的元素，并通过命令进行交互是编写测试用例的关键。包括了解如何使用 `cy.get()`、`cy.contains()` 等命令。

8. **如何在 Cypress 中执行钩子和定制测试流程？**
   - Cypress 提供了一些钩子和定制选项，以支持在测试运行过程中执行特定的操作。了解如何使用 `before`, `beforeEach`, `after`, `afterEach` 等钩子可以更好地定制测试流程。

9. **Cypress 如何处理测试数据和测试环境？**
   - 了解 Cypress 如何处理测试数据、测试环境配置以及如何模拟网络请求，可以帮助编写更健壮的测试用例，覆盖各种应用场景。

10. **Cypress 的社区和生态系统如何？**

    - 了解 Cypress 的社区活跃度、插件生态系统以及社区支持对于解决问题和获取帮助至关重要。
    
    检查 GitHub 仓库、论坛和其他社交媒体渠道。

# 参考资料

https://docs.cypress.io/guides/overview/why-cypress

* any list
{:toc}