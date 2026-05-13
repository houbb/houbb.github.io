---
layout: post 
title: millionco/react-doctor  你的代理写出了糟糕的 React 代码。这个工具能帮你发现它。
date: 2026-05-13 21:01:55 +0800
categories: [AI]
tags: [ai, agent]
published: true
---


# GitHub - millionco/react-doctor: 你的代理写出了糟糕的 React 代码。这个工具能帮你发现它。

你的代理写出了糟糕的 React 代码，这个工具能帮你发现它。

通过一条命令扫描你的代码库，并输出一个 **0 到 100 的健康评分**，同时提供可操作的诊断信息。

适用于 Next.js、Vite 和 React Native。

### 查看实际效果 →

## 安装

在项目根目录下运行此命令：

```bash
npx -y react-doctor@latest .
```

你将获得一个评分（75 分以上为**优秀**，50 到 74 分为**需要改进**，50 分以下为**严重**），以及一系列涵盖状态与副作用、性能、架构、安全性、可访问性和死代码等方面的问题列表。规则会根据你的框架和 React 版本自动切换。

（此处为视频占位符）

## 为你的编码代理安装

教导你的编码代理 React 最佳实践，让它从源头上停止编写糟糕的代码。

```bash
npx -y react-doctor@latest install
```

系统会提示你选择要为哪些检测到的代理进行安装。传递 `--yes` 参数可跳过提示。

适用于 Claude Code、Cursor、Codex、OpenCode 以及 50 多种其他代理。

## GitHub Actions

本仓库包含一个复合操作。将其放入 `.github/workflows/react-doctor.yml` 文件中：

```yaml
name: React Doctor

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read
  pull-requests: write # 需要此权限来发布 PR 评论

jobs:
  react-doctor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0 # 需要此参数来支持 `diff` 功能
      - uses: millionco/react-doctor@main
        with:
          diff: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

当在 `pull_request` 事件中设置了 `github-token` 时，发现的问题会作为 PR 评论发布（并更新）。该操作还会暴露一个 `score` 输出（0–100），你可以在后续步骤中使用它。

**输入参数：** `directory`, `verbose`, `project`, `diff`, `github-token`, `fail-on` (`error` / `warning` / `none`), `offline`, `node-version`。完整描述请参见 `action.yml`。

不想使用市场操作？使用纯粹的 `npx` 形式也可以：

```yaml
- run: npx -y react-doctor@latest --fail-on warning
```

## 配置

在项目根目录下创建一个 `react-doctor.config.json` 文件：

```json
{
  "ignore": {
    "rules": ["react/no-danger", "jsx-a11y/no-autofocus"],
    "files": ["src/generated/**"],
    "overrides": [
      {
        "files": ["components/modules/diff/**"],
        "rules": ["react-doctor/no-array-index-as-key", "react-doctor/no-render-in-render"]
      },
      {
        "files": ["components/search/HighlightedSnippet.tsx"],
        "rules": ["react/no-danger"]
      }
    ]
  }
}
```

三个嵌套键，三个粒度级别——选择最适合的最细粒度：

*   **`ignore.rules`** 在整个代码库中静默某个规则。
*   **`ignore.files`** 在匹配的文件上静默**所有**规则（请谨慎使用——这会丢失对其他不相关规则的覆盖）。
*   **`ignore.overrides`** 仅在匹配的文件上静默列出的规则，而保持所有其他规则处于活动状态。当某个文件（或 glob 模式）确实需要豁免一两个规则，但仍应扫描其他所有规则时，这就是你想要的配置。

你也可以在 `package.json` 中使用 `"reactDoctor"` 键。CLI 标志始终会覆盖配置值。

React Doctor 会尊重 `.gitignore`、`.eslintignore`、`.oxlintignore`、`.prettierignore` 以及 `.gitattributes` 中的 `linguist-vendored` / `linguist-generated` 注解。行内的 `// eslint-disable*` 和 `// oxlint-disable*` 注释同样会被尊重。

如果你有一个 JSON 格式的 oxlint 或 eslint 配置文件（`.oxlintrc.json` 或 `.eslintrc.json`），其规则会被自动合并到扫描中，并计入评分。设置 `adoptExistingLintConfig: false` 可选择退出此行为。

#### 可选的配套插件

当以下 ESLint 插件在被扫描的项目中安装时（或在你的 monorepo 中被提升），React Doctor 会将它们的规则折叠到同一次扫描中。两者都被列为**可选的 peer 依赖**——只安装你需要的即可。

| 插件 | 添加的内容 | 命名空间 |
| :--- | :--- | :--- |
| `eslint-plugin-react-hooks` (v6 或 v7) | React Compiler 前端的正确性规则——当项目中检测到 React Compiler 时触发。 | `react-hooks-js/*` |
| `eslint-plugin-react-you-might-not-need-an-effect` (v0.10+) | 补充性的副作用反模式规则（`no-derived-state`、`no-chain-state-updates`、`no-event-handler`、`no-pass-data-to-parent` 等），与 React Doctor 原生的状态与副作用规则一同运行。 | `effect/*` |

### 行内抑制

```javascript
// react-doctor-disable-next-line react-doctor/no-cascading-set-state
useEffect(() => {
  setA(value);
  setB(value);
}, [value]);
```

当同一行触发了两个规则时，你有两个等效的选项。在单条注释中用逗号分隔规则 ID：

```javascript
// react-doctor-disable-next-line react-doctor/rerender-state-only-in-handlers, react-doctor/no-derived-useState
const [localSearch, setLocalSearch] = useState(searchQuery);
```

或者直接在诊断行的上方堆叠注释，每条注释对应一个规则。只要在堆叠注释和目标行之间没有除其他 `react-doctor-disable-next-line` 注释之外的任何内容，堆叠的注释就会被识别：

```javascript
// react-doctor-disable-next-line react-doctor/rerender-state-only-in-handlers
// react-doctor-disable-next-line react-doctor/no-derived-useState
const [localSearch, setLocalSearch] = useState(searchQuery);
```

堆叠注释之间的代码行会中断链式识别：只有紧邻诊断行上方的那条注释（以及任何堆叠在其上方的、连续的 `react-doctor-disable-next-line` 注释）会被识别。如果一条注释看起来是邻近的，但规则仍然触发，请运行 `react-doctor --explain <file:line>` ——它会报告在该位置附近是否找到了抑制注释、它覆盖了哪些规则，以及为什么它没有生效。

在 JSX 内部可以使用块注释：

```jsx
{/* react-doctor-disable-next-line react/no-danger */}
<div dangerouslySetInnerHTML={{ __html }} />
```

对于多行 JSX，将注释紧贴在开始标签上方将覆盖整个属性列表（遵循 ESLint 约定）。

## Lint 插件（独立）

同一套规则集既可作为 oxlint 插件，也可作为 ESLint 插件提供，因此你可以将其接入项目已运行的任何 lint 引擎。

**oxlint** 在 `.oxlintrc.json` 中：

```json
{
  "jsPlugins": [{ "name": "react-doctor", "specifier": "react-doctor/oxlint-plugin" }],
  "rules": {
    "react-doctor/no-fetch-in-effect": "warn",
    "react-doctor/no-derived-state-effect": "warn"
  }
}
```

**ESLint** 扁平配置：

```javascript
import reactDoctor from "react-doctor/eslint-plugin";

export default [
  reactDoctor.configs.recommended,
  reactDoctor.configs.next,
  reactDoctor.configs["react-native"],
  reactDoctor.configs["tanstack-start"],
  reactDoctor.configs["tanstack-query"],
];
```

完整的规则列表位于 `oxlint-config.ts` 中。

## CLI 参考

```text
Usage: react-doctor [directory] [options]

Options:
  -v, --version           显示版本号
  --no-lint               跳过 linting
  --no-dead-code          跳过死代码检测
  --verbose               显示每条规则及每个文件的详细信息（默认显示前 3 条规则）
  --score                 仅输出分数
  --json                  输出一个结构化的 JSON 报告
  -y, --yes               跳过提示，扫描所有工作区项目
  --full                  跳过提示，始终运行完整扫描
  --project <name>        选择工作区项目（逗号分隔多个）
  --diff [base]           仅扫描与基础分支相比有变更的文件
  --staged                仅扫描暂存区文件（用于 pre-commit 钩子）
  --offline               跳过遥测
  --fail-on <level>       根据诊断级别退出并报错：error, warning, none
  --annotations           将诊断输出为 GitHub Actions 注解
  --explain <file:line>   诊断为何触发规则或为何抑制未生效
  --why <file:line>       --explain 的别名
  -h, --help              显示帮助
```

当抑制规则不生效时，`--explain <file:line>`（或其别名 `--why <file:line>`）会报告扫描器在该位置看到的情况，包括为什么邻近的 `react-doctor-disable-next-line` 注释没有生效。该诊断会区分常见的失效模式——邻近的注释针对的是不同的规则（请使用逗号分隔形式）、注释和诊断之间存在代码行（链式识别已中断），或者附近根本没有抑制注释。同样的提示会在使用 `--verbose` 时为每个标记的位置内联显示，并在 `--json` 输出中作为 `diagnostic.suppressionHint` 提供，因此一次扫描即可兼作抑制规则审计，无需单独的标志。

`--json` 会在标准输出上生成一个可解析的对象，并抑制所有人类可读的输出。错误仍然会生成一个带有 `ok: false` 的 JSON 对象，因此标准输出始终是一个有效的文档。

### 配置键

| 键 | 类型 | 默认值 |
| :--- | :--- | :--- |
| `ignore.rules` | `string[]` | `[]` |
| `ignore.files` | `string[]` | `[]` |
| `ignore.overrides` | `{ files, rules? }[]` | `[]` |
| `lint` | `boolean` | `true` |
| `deadCode` | `boolean` | `true` |
| `verbose` | `boolean` | `false` |
| `diff` | `boolean | string` | |
| `failOn` | `"error" | "warning" | "none"` | `"none"` |
| `customRulesOnly` | `boolean` | `false` |
| `share` | `boolean` | `true` |
| `offline` | `boolean` | `false` |
| `textComponents` | `string[]` | `[]` |
| `rawTextWrapperComponents` | `string[]` | `[]` |
| `respectInlineDisables` | `boolean` | `true` |
| `adoptExistingLintConfig` | `boolean` | `true` |
| `ignore.tags` | `string[]` | `[]` |
| `entryFiles` | `string[]` | `[]` |

`textComponents` 是 `rn-no-raw-text` 规则的通用逃生口——列出那些本身行为类似 React Native 的 `<Text>` 的组件（例如自定义的 `Typography`、`NativeTabs.Trigger.Label` 等），该规则就会将它们视为文本容器，无论它们的子元素看起来像什么。

`rawTextWrapperComponents` 是一个更窄的选项，用于那些本身不是文本元素，但能安全地将纯字符串子元素通过内部的 `<Text>` 渲染的组件（例如 `heroui-native` 的 `Button`，它会将子元素字符串化，并通过 `ButtonLabel` 渲染）。列出的包装器仅在其子元素完全可字符串化时，才会抑制 `rn-no-raw-text` 规则。一个具有混合子元素的包装器——例如 `<Button>Save<Icon /></Button>`——仍然会报告，因为包装器无法安全地将纯文本与同级的 JSX 元素一起路由。

`ignore.tags` 通过标签抑制整个类别的规则。例如，`"tags": ["design"]` 会禁用所有有观点的设计规则（渐变文本、纯黑背景、侧边标签边框、默认 Tailwind 调色板）。可用标签：`"design"`。

`entryFiles` 告诉死代码检测器那些是直接执行而非被导入的文件（测试运行器配置、eval 脚本、CLI 入口点）。这些会被作为额外的入口点转发给 knip。示例：`"entryFiles": ["scripts/*.ts", "evalite.config.ts"]`。如果你的项目已经有一个 `knip.json`，这些入口点会被自动识别。

`offline` 跳过评分 API 调用，在本地计算评分。在 CI 环境（GitHub Actions、GitLab CI、CircleCI）中会自动启用。在配置中设置为 `true` 可始终在本地评分。

## 评分

健康评分公式：`100 - (unique_error_rules x 1.5) - (unique_warning_rules x 0.75)`。

关键细节：

*   评分计数的是**触发的不同规则**，而不是总实例数。修复 50 个 `no-barrel-import` 违规中的 49 个并不会改变评分；修复全部 50 个则会移除该规则对应的 0.75 分惩罚。
*   错误严重级别的规则每条扣 1.5 分。警告严重级别的规则每条扣 0.75 分。
*   输出中显示的类别细分仅供展示，不影响评分。
*   运行 `--verbose` 可以查看具体哪些规则影响了评分以及惩罚是如何计算的。

评分标签：75 分以上是**优秀**，50 到 74 分是**需要改进**，50 分以下是**严重**。

随着新规则的加入，评分可能会在不同版本间降低。每一条在你的代码库中触发的新规则都会引入额外的惩罚。这是预期行为——意味着工具发现了更多问题，而不是你的代码变差了。如果你需要在升级过程中保持评分稳定，可以在 CI 中将 react-doctor 固定到特定版本。

## Diff 和暂存模式

React Doctor 可以只扫描变更的文件，而不是整个项目：

*   **`--diff [base]`** 扫描相对于基础分支有变更的文件。会自动检测 `main`/`master`，或者传递一个明确的分支：`--diff develop`。也可以作为配置键使用：`"diff": true` 或 `"diff": "develop"`。
*   **`--staged`** 仅扫描 git 暂存区中的文件。专为 pre-commit 钩子设计——会将暂存区的文件内容物化到一个临时目录中，以便扫描结果准确反映即将提交的内容。
*   **`--full`** 强制执行完整扫描，会覆盖配置或 CLI 中的任何 `diff` 值。

当在特性分支上且没有使用明确标志时，系统会提示：“仅扫描变更的文件？” 此提示在 CI、`--json` 模式和非交互式环境中会被抑制。

`--staged` 和 `--diff` 不能结合使用。这两种模式都会跳过死代码检测（knip 需要完整的项目来检测未使用的文件）。

## 代理与 CI 集成

React Doctor 可检测 50 多种编码代理（Claude Code、Cursor、Codex、OpenCode、Windsurf 等），并自动调整其行为：

*   **为代理安装**：`npx react-doctor@latest install` 会在你的项目中写入特定于代理的规则文件（SKILL.md、AGENTS.md、.cursorrules），从而让代理学习 React 最佳实践。
*   **JSON 输出**：`--json` 会在标准输出上生成一个结构化的 `JsonReport`。错误仍然会生成一个带有 `ok: false` 的有效 JSON 文档。使用 `--json-compact` 可最小化空白字符。
*   **仅输出评分**：`--score` 仅输出数字评分（0-100），适用于代理循环中的阈值检查。
*   **GitHub Actions 注解**：`--annotations` 会以 `::error` / `::warning` 格式输出，用于内联 PR 注解。
*   **退出代码**：`--fail-on error`（默认）在发现错误严重级别的诊断时非零退出。使用 `--fail-on warning` 或 `--fail-on none` 来调整 CI 的门控。
*   **程序化 API**：`import { diagnose } from "react-doctor/api"` 用于脚本和自动化中的直接集成。

在 CI 环境中，提示会自动跳过，并且评分会在本地运行（离线模式）。

## Node.js API

```javascript
import { diagnose, toJsonReport, summarizeDiagnostics } from "react-doctor/api";

const result = await diagnose("./path/to/your/react-project");

console.log(result.score); // { score: 82, label: "Great" } 或 null
console.log(result.diagnostics); // Diagnostic[]
console.log(result.project); // 检测到的框架、React 版本等
```

`diagnose` 接受第二个参数：`{ lint?: boolean, deadCode?: boolean }`。

```javascript
const report = toJsonReport(result, { version: "1.0.0" });
const counts = summarizeDiagnostics(result.diagnostics);
```

`react-doctor/api` 重新导出了 `JsonReport`、`JsonReportSummary`、`JsonReportProjectEntry`、`JsonReportMode`，以及更低层的 `buildJsonReport` 和 `buildJsonReportError` 构建器。完整类型请参见 `packages/react-doctor/src/api.ts`。

## 排行榜

由 React Doctor 扫描的顶级 React 代码库，按评分排名。数据自动更新自 millionco/react-doctor-benchmarks。

| # | 仓库 | 评分 |
| :--- | :--- | :--- |
| 1 | executor | 94 |
| 2 | nodejs.org | 86 |
| 3 | tldraw | 70 |
| 4 | t3code | 68 |
| 5 | better-auth | 64 |
| 6 | excalidraw | 63 |
| 7 | mastra | 63 |
| 8 | payload | 60 |
| 9 | typebot | 57 |
| 10 | plane | 56 |

查看完整排行榜。

## 资源与贡献

想尝试一下？请查看演示。

希望贡献代码？克隆仓库、安装、构建，然后提交 PR。

```bash
git clone https://github.com/millionco/react-doctor
cd react-doctor
pnpm install
pnpm build
node packages/react-doctor/bin/react-doctor.js /path/to/your/react-project
```

发现 bug？请访问问题跟踪器。

### 许可证

React Doctor 是根据 MIT 许可证发布的开源软件。

## 关于

你的代理写出了糟糕的 React 代码。这个工具能帮你发现它。

网址：react.doctor

**话题标签**

`react` `doctor` `skill` `code-review` `agents`


# 参考资料

* any list
{:toc}