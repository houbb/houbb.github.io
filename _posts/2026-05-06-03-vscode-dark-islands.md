---
layout: post 
title: Islands Dark 一款适用于 Visual Studio Code 的深色主题，灵感来源于 easemate IDE。具有浮动玻璃面板、圆角、平滑动画和深度精细的用户界面。
date: 2026-05-06 21:01:55 +0800
categories: [Docs]
tags: [docs]
published: true
---


# Islands Dark

一款适用于 Visual Studio Code 的深色主题，灵感来源于 easemate IDE。具有浮动玻璃面板、圆角、平滑动画和深度精细的用户界面。

- [easemate](https://x.com/easemate)
- [easemate Nav](https://x.com/Jakubantalik/status/1952672176450215944)
- [easemate effects](https://x.com/aaroniker/status/1989727838992539655)

![Islands Dark 截图](assets/CleanShot%202026-02-19%20at%2019.37.59@2x.png)

## 功能特性

- 深色画布（`#131217`）配浮动面板
- 玻璃质感边框，带方向性光线模拟（上/左较亮，下/右较暗）
- 所有面板、通知、命令面板和侧边栏均带有圆角
- 药丸形活动栏，带玻璃质感选中指示器
- 面包屑栏和状态栏，未悬停时变暗
- 标签页关闭按钮仅在悬停时淡入显示
- 侧边栏选中项、滚动条和状态栏带有平滑过渡效果
- 药丸形滚动条滑块
- 颜色匹配的图标发光效果（搭配 [Seti Folder](https://marketplace.visualstudio.com/items?itemName=l-igh-t.vscode-theme-seti-folder) 图标主题效果最佳）
- 暖色语法高亮，支持多种语言（JS/TS、Python、Go、Rust、HTML/CSS、JSON、YAML、Markdown）
- 编辑器使用 IBM Plex Mono，终端使用 FiraCode Nerd Font Mono

![Islands Dark UI 截图](assets/CleanShot%202026-02-14%20at%2021.45.00@2x.png)

## 安装

本主题包含两部分：**颜色主题** 和 **CSS 自定义**，后者用于创建浮动玻璃面板外观。

### 一键安装（推荐）

最快的安装方式：

#### macOS/Linux

```bash
curl -fsSL https://raw.githubusercontent.com/bwya77/vscode-dark-islands/main/bootstrap.sh | bash
```

#### Windows

```powershell
irm https://raw.githubusercontent.com/bwya77/vscode-dark-islands/main/bootstrap.ps1 | iex
```

### 手动克隆安装

如果您希望先克隆仓库：

#### macOS/Linux

```bash
git clone https://github.com/bwya77/vscode-dark-islands.git islands-dark
cd islands-dark
./install.sh
```

#### Windows

```powershell
git clone https://github.com/bwya77/vscode-dark-islands.git islands-dark
cd islands-dark
.\install.ps1
```

这些脚本会自动：
- ✅ 安装 Islands Dark 主题扩展
- ✅ 安装 Custom UI Style 扩展
- ✅ 安装 Bear Sans UI 字体
- ✅ 备份您现有的设置并应用 Islands Dark 设置
- ✅ 启用 Custom UI Style 并重新加载 VS Code

> **注意：** IBM Plex Mono 和 FiraCode Nerd Font Mono 需要单独安装（脚本会给出提示）。

### Nix Flake 安装

如果您使用 Nix，可以直接运行一个预先配置好的 VS Code（或 VSCodium）实例，其中已捆绑了主题、扩展和字体。

直接运行（无需安装）：

```bash
# 运行 VS Code
nix run github:bwya77/vscode-dark-islands#vscode

# 或运行 VSCodium
nix run github:bwya77/vscode-dark-islands#vscodium
```

要在您的 NixOS 或 Home Manager 配置中使用它，请将其添加到 flake inputs：

```nix
{
  inputs.islands-dark.url = "github:bwya77/vscode-dark-islands";

  outputs = { self, nixpkgs, islands-dark, ... }: {
    # 然后您可以添加并使用：
    # islands-dark.packages.${pkgs.stdenv.hostPlatform.system}.vscode
    # islands-dark.packages.${pkgs.stdenv.hostPlatform.system}.vscodium
  };
}
```

> **注意：** Nix flake 会自动包含 **Custom UI Style** 扩展、**Seti Folder** 图标主题以及所有必需的字体（**Bear Sans UI**、**IBM Plex Mono** 和 **FiraCode Nerd Font**）。它还会在首次运行时复制推荐的 `settings.json`。

### 手动安装

如果您希望手动安装，请按以下步骤操作：

#### 第 1 步：安装主题

克隆此仓库并复制扩展文件：

```bash
git clone https://github.com/bwya77/vscode-dark-islands.git islands-dark
cd islands-dark
mkdir -p ~/.vscode/extensions/bwya77.islands-dark-1.0.0
cp package.json ~/.vscode/extensions/bwya77.islands-dark-1.0.0/
cp -r themes ~/.vscode/extensions/bwya77.islands-dark-1.0.0/
```

在 Windows（PowerShell）上：
```powershell
git clone https://github.com/bwya77/vscode-dark-islands.git islands-dark
cd islands-dark
$ext = "$env:USERPROFILE\.vscode\extensions\bwya77.islands-dark-1.0.0"
New-Item -ItemType Directory -Path $ext -Force
Copy-Item package.json $ext\
Copy-Item themes $ext\themes -Recurse
```

#### 第 2 步：安装 Custom UI Style 扩展

浮动面板、圆角、玻璃边框和动画效果由 **Custom UI Style** 扩展提供。

1. 在 VS Code 中打开 **扩展**（`Cmd+Shift+X` / `Ctrl+Shift+X`）
2. 搜索 **Custom UI Style**（作者 `subframe7536`）
3. 点击 **安装**

#### 第 3 步：安装推荐的图标主题

为了获得颜色匹配图标发光效果的最佳体验，请安装 **Seti Folder** 图标主题：

1. 在 VS Code 中打开 **扩展**（`Cmd+Shift+X` / `Ctrl+Shift+X`）
2. 搜索 **[Seti Folder](https://marketplace.visualstudio.com/items?itemName=l-igh-t.vscode-theme-seti-folder)**（作者 `l-igh-t`）
3. 点击 **安装**
4. 将其设置为您的图标主题：**命令面板** > **首选项：文件图标主题** > **Seti Folder**

#### 第 5 步：安装字体

本主题使用两种字体：

- **IBM Plex Mono** — 用于编辑器
- **FiraCode Nerd Font Mono** — 用于终端
- **Bear Sans UI** — 用于侧边栏、标签页、命令中心和状态栏（位于 `fonts/` 文件夹中）

安装 Bear Sans UI：
1. 打开本仓库中的 `fonts/` 文件夹
2. 选择所有 `.otf` 文件，双击在字体册中打开（macOS）或右键单击 > 安装（Windows）

如果您偏好不同的字体，请在设置中更新 `editor.fontFamily`、`terminal.integrated.fontFamily` 以及 `font-family` 的值。

#### 第 6 步：应用设置

将本仓库中 `settings.json` 的内容复制到您的 VS Code 设置中：

1. 打开 **命令面板**（`Cmd+Shift+P` / `Ctrl+Shift+P`）
2. 搜索 **首选项：打开用户设置（JSON）**
3. 将本仓库 `settings.json` 的内容合并到您的设置文件中

> **注意：** 如果您已有现有设置，请谨慎合并。关键的设置是 `workbench.colorTheme`、`custom-ui-style.stylesheet` 以及字体/缩进首选项。

#### 第 7 步：启用 Custom UI Style

1. 打开 **命令面板**（`Cmd+Shift+P` / `Ctrl+Shift+P`）
2. 运行 **Custom UI Style: Enable**
3. VS Code 将重新加载

> **注意：** 启用后您可能会看到“安装损坏”的警告。这是预期行为，因为 Custom UI Style 会向 VS Code 注入 CSS。点击警告上的齿轮图标，选择 **不再显示**。

## CSS 自定义的作用

| **元素** | **效果** |
|----------|----------|
| **画布** | 所有面板后方的深色背景（`--islands-bg-canvas`） |
| **侧边栏** | 浮动，带圆角（`--islands-panel-radius`）、玻璃边框、阴影 |
| **编辑器** | 浮动，带圆角（`--islands-panel-radius`）、玻璃边框、浏览器标签页效果 |
| **活动栏** | 药丸形，带玻璃内阴影、圆形选中指示器 |
| **命令中心** | 药丸形，带玻璃效果 |
| **底部面板** | 浮动，带圆角（`--islands-panel-radius`）、玻璃边框 |
| **右侧边栏** | 浮动，带圆角（`--islands-panel-radius`）、玻璃边框 |
| **通知** | 圆角（`--islands-widget-radius`）、玻璃边框、深度阴影 |
| **命令面板** | 圆角（`--islands-widget-radius`）、玻璃边框、圆角列表行 |
| **滚动条** | 药丸形滑块，带淡入淡出过渡 |
| **标签页** | 浏览器标签页样式（活动标签页底部开口），关闭按钮悬停时淡入 |
| **面包屑** | 隐藏直至悬停，带平滑淡入淡出过渡 |
| **状态栏** | 文字变暗，悬停时变亮 |
| **文件图标** | 通过 drop-shadow 实现颜色匹配的发光效果（搭配 Seti Folder 图标主题效果最佳） |

## 自定义

所有关键视觉属性均由 `settings.json` 中 `custom-ui-style.stylesheet` 顶部定义的 CSS 自定义属性控制。编辑 `.monaco-workbench` 上的变量可快速调整外观：

```json
".monaco-workbench": {
    "--islands-panel-radius": "24px",
    "--islands-widget-radius": "14px",
    "--islands-input-radius": "12px",
    "--islands-item-radius": "6px",
    "--islands-panel-gap": "8px",
    "--islands-panel-top": "8px",
    "--islands-bg-canvas": "#121216",
    "--islands-bg-surface": "#181a1d",
    "background-color": "var(--islands-bg-canvas) !important"
}
```

### 颜色

| **变量** | **默认值** | **应用对象** |
|----------|------------|--------------|
| `--islands-bg-canvas` | `#121216` | 所有面板后方的深色背景（工作台、标题栏、状态栏、活动栏） |
| `--islands-bg-surface` | `#181a1d` | 面板/表面背景（聊天输入框、编辑器组件） |

这两种颜色定义了主题的深度。canvas 是面板之间可见的较深基底图层，而 surface 是用于交互元素的稍浅颜色。要覆盖主题的面板颜色（侧边栏、编辑器、终端背景），请在设置中使用 VS Code 的 `workbench.colorCustomizations`。

### 圆角

| **变量** | **默认值** | **应用对象** |
|----------|------------|--------------|
| `--islands-panel-radius` | `24px` | 侧边栏、编辑器、终端/底部面板、辅助栏 |
| `--islands-widget-radius` | `14px` | 通知、聊天输入框、命令面板 |
| `--islands-input-radius` | `12px` | 搜索栏、SCM 提交输入框、按钮、悬停提示 |
| `--islands-item-radius` | `6px` | 列表行、标签页、窗格标题、终端标签页 |

例如，要使所有元素更锐利，将所有值设为 `8px`。要获得完全圆润的外观，可以尝试 `32px` / `20px` / `16px` / `8px`。药丸形元素（活动栏、滚动条滑块、命令中心、徽章）不受这些变量影响。

### 面板间距

| **变量** | **默认值** | **应用对象** |
|----------|------------|--------------|
| `--islands-panel-gap` | `8px` | 侧边栏、编辑器、聊天/辅助栏、终端和通知之间的水平间距 |
| `--islands-panel-top` | `8px` | 面板的顶部边距（标题栏下方空间） |

增大到 `12px` 或 `16px` 可获得更宽松的布局，或减小到 `4px` 以获得更紧凑的外观。

## 故障排除

### 更改未生效
尝试禁用并重新启用 Custom UI Style：
1. **命令面板** > **Custom UI Style: Disable**
2. 重新加载 VS Code
3. **命令面板** > **Custom UI Style: Enable**
4. 重新加载 VS Code

### “安装损坏”警告
启用 Custom UI Style 后出现此警告是预期行为。忽略它或选择 **不再显示**。

### 之前使用过 “Custom CSS and JS Loader” 扩展
如果您之前使用过 **Custom CSS and JS Loader** 扩展（`be5invis.vscode-custom-css`），它可能已将 CSS 直接注入 VS Code 的 `workbench.html`，即使禁用后仍然存在。如果样式冲突，请重新安装 VS Code 以获得干净的 `workbench.html`，然后仅使用 **Custom UI Style**。

## 卸载

运行卸载脚本将 VS Code 恢复到之前的状态：

**macOS/Linux：**
```bash
# 如果您仍克隆了仓库：
cd islands-dark
./uninstall.sh

# 或直接下载并运行：
curl -fsSL https://raw.githubusercontent.com/bwya77/vscode-dark-islands/main/uninstall.sh | bash
```

**Windows（PowerShell）：**
```powershell
# 如果您仍克隆了仓库：
cd islands-dark
.\uninstall.ps1

# 或直接下载并运行：
irm https://raw.githubusercontent.com/bwya77/vscode-dark-islands/main/uninstall.ps1 | iex
```

卸载脚本将：
- 从 `settings.json.pre-islands-dark` 备份中恢复您之前的设置
- 移除 Islands Dark 主题扩展
- 从 VS Code 中注销该扩展

运行脚本后，您需要：
1. 打开 **命令面板**（`Cmd+Shift+P` / `Ctrl+Shift+P`）并运行 **Custom UI Style: Disable**
2. 打开 **命令面板** 并搜索 **首选项：颜色主题** 以选择新主题
3. 重新加载 VS Code

## 致谢

灵感来源于 [JetBrains Islands Dark](https://www.jetbrains.com/) UI 主题。

## 许可证

MIT

# 参考资料

* any list
{:toc}