---
layout: post
title: React Grab 允许你在应用中直接选择一个页面元素，并复制该元素的完整上下文信息
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---

# React Grab

**React Grab** 允许你在应用中**直接选择一个页面元素，并复制该元素的完整上下文信息**（例如 HTML、React 组件、源文件等）。

这样可以把这些上下文直接提供给 AI 编程工具，例如：

* Cursor
* Claude Code
* Copilot

从而让 AI **更快理解代码并生成修改建议**。 ([GitHub][1])

官方宣称，这种方式可以让 AI 编码工具的效率提升 **最高约 66%**。 ([GitHub][1])

---

# 核心功能

React Grab 的核心能力是：

> **在网页上点击一个 UI 元素 → 自动获取该元素的代码上下文**

复制的内容可能包括：

* HTML 结构
* React 组件名称
* 对应源码文件
* JSX 代码
* DOM 层级

然后可以直接复制到剪贴板或发送给 AI 编程 Agent。 ([note（ノート）][2])

典型工作流程：

```
网页 UI
   ↓
点击某个元素
   ↓
React Grab 提取上下文
   ↓
发送给 AI Coding Agent
   ↓
AI 修改代码
```

---

# 安装方式

## 使用 CLI 安装（推荐）

在项目根目录运行：

```
npx @react-grab/cli@latest
```

确保在包含以下文件的目录中执行：

```
next.config.ts
vite.config.ts
```

---

# 手动安装

## Next.js（App Router）

在 `app/layout.tsx` 中加入：

```tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## Next.js（Pages Router）

在 `pages/_document.tsx` 中：

```tsx
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

---

## Vite

在 `index.html` 中：

```html
<script type="module">
  if (import.meta.env.DEV) {
    import("react-grab");
  }
</script>
```

---

## Webpack

先安装：

```
npm install react-grab
```

然后在入口文件：

```
src/index.tsx
```

加入：

```ts
if (process.env.NODE_ENV === "development") {
  import("react-grab");
}
```

---

# 与 AI Coding Agent 集成（Beta）

React Grab 可以直接把选中的元素上下文发送给 **AI 编程 Agent**。

支持：

* Claude Code
* Cursor CLI
* Opencode

这样可以实现一种新的开发方式：

```
点击 UI 元素
   ↓
AI 获取组件上下文
   ↓
AI 自动修改代码
```

无需手动复制粘贴代码。

---

# Claude Code 集成

### Server

服务器运行在：

```
4567
```

在 `package.json` 中：

```json
{
  "scripts": {
    "dev": "npx @react-grab/claude-code@latest && next dev"
  }
}
```

---

### Client

在 HTML `<head>` 中加入：

```html
<script src="//unpkg.com/react-grab/dist/index.global.js"></script>
<script src="//unpkg.com/@react-grab/claude-code/dist/client.global.js"></script>
```

---

# Cursor CLI 集成

服务器端口：

```
5567
```

配置：

```json
{
  "scripts": {
    "dev": "npx @react-grab/cursor@latest && next dev"
  }
}
```

---

# Opencode 集成

服务器端口：

```
6567
```

配置：

```json
{
  "scripts": {
    "dev": "npx @react-grab/opencode@latest && next dev"
  }
}
```

---

# 扩展 API

React Grab 提供自定义 API：

```ts
import { init } from "react-grab/core";

const api = init({
  theme: {
    enabled: true,
    hue: 180,
    crosshair: {
      enabled: false,
    },
    elementLabel: {
      enabled: false,
    },
  },

  onElementSelect: (element) => {
    console.log("Selected:", element);
  },

  onCopySuccess: (elements, content) => {
    console.log("Copied:", content);
  },

  onStateChange: (state) => {
    console.log("Active:", state.isActive);
  },
});
```

示例操作：

```
api.activate()
api.copyElement(...)
api.getState()
```

---

# 使用场景

React Grab 主要解决 **AI 编程上下文不足的问题**。

典型场景：

### 1 AI 修改 UI

```
点击按钮
↓
获取组件代码
↓
AI 修改按钮样式
```

---

### 2 AI Debug

```
点击报错组件
↓
发送组件上下文
↓
AI 分析问题
```

---

### 3 大型 React 项目理解

```
新人开发
↓
点击页面组件
↓
AI解释代码结构
```

---

# 项目 License

MIT License

---

# 项目总结

**React Grab 本质上是一个：**

> **AI 编程时代的 UI → Code Context 桥梁**

核心价值：

1️⃣ 从 **UI 直接定位源码**
2️⃣ 自动提取 **React 组件上下文**
3️⃣ 直接喂给 **AI Coding Agent**
4️⃣ 减少 Prompt 编写和上下文复制

---

如果你愿意，我可以再给你深入拆一下 **这个项目真正厉害的地方**：

**为什么 React Grab 其实是 AI 编程工具链里的一个“关键组件”**

我可以给你画出完整架构：

```
UI
↓
Context Extractor (react-grab)
↓
Coding Agent
↓
Code Edit
↓
Hot Reload
```

这个其实是 **未来 AI IDE 的标准架构**。

[1]: https://github.com/aidenybai/react-grab?utm_source=chatgpt.com "GitHub - aidenybai/react-grab: Grab any element on in your app and give it to Cursor, Claude Code, etc"
[2]: https://note.com/trend_idea_bit/n/ndc969ee1a48f?utm_source=chatgpt.com "〖今日の爆速トレンド〗GitHub TOP10（2026年03月07日）｜アイデアのかけら"

# 参考资料

* any list
{:toc}