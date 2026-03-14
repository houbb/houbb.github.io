---
layout: post
title: Tauri 2.0-02-先决条件（Prerequisites）
date: 2026-03-15 21:01:55 +0800
categories: [Tauri]
tags: [cross-platefrom, sh]
published: true
---


# 先决条件（Prerequisites）

在开始使用 **Tauri** 构建项目之前，你需要先安装一些依赖组件：

1. **系统依赖（System Dependencies）**
2. **Rust**
3. **移动端开发配置（Configure for Mobile Targets）**
   （仅在开发移动应用时需要）

---

# 系统依赖（System Dependencies）

根据你使用的操作系统，完成相应依赖安装：

* Linux
* macOS Catalina (10.15) 及以上
* Windows 7 及以上 ([Tauri][1])

---

# Linux

在 Linux 上开发 Tauri 需要安装一些系统依赖。
具体依赖会根据发行版不同而有所差异。

常见依赖包括：

```
build-base
webkit2gtk-4.1-dev
curl
wget
file
openssl
libayatana-appindicator-dev
librsvg
```

注意：

> Alpine Linux 容器默认没有字体。
> 为确保 Tauri 应用正常渲染文本，至少安装一个字体包，例如：

```
font-dejavu
```

如果你使用 **Nix/NixOS**，可以查看 NixOS Wiki 中的相关指南。 ([Tauri][1])

---

# macOS

Tauri 在 macOS 上开发需要：

* Xcode
* macOS / iOS 开发工具链

安装方式：

1. 从以下任一位置下载 **Xcode**：

   * Mac App Store
   * Apple Developer 官网
2. 安装完成后 **启动一次 Xcode**，让其完成初始化配置。 ([Tauri][1])

如果你 **只开发桌面应用，不开发 iOS**，可以只安装 **Xcode Command Line Tools**：

```bash
xcode-select --install
```

---

# Windows

在 Windows 上开发 Tauri 需要两个核心组件：

1. **Microsoft C++ Build Tools**
2. **Microsoft Edge WebView2**

---

## Microsoft C++ Build Tools

安装步骤：

1. 下载 **Microsoft C++ Build Tools Installer**
2. 运行安装程序
3. 勾选：

```
Desktop development with C++
```

---

## WebView2

Tauri 在 Windows 上使用 **Microsoft Edge WebView2** 渲染界面。

安装方法：

1. 前往 WebView2 Runtime 下载页面
2. 下载：

```
Evergreen Bootstrapper
```

3. 安装即可

提示：

* Windows 10 (1803+) 及以上系统通常 **已经自带 WebView2**，可跳过此步骤。 ([Tauri][1])

---

## VBSCRIPT（用于 MSI 安装包）

仅在 **构建 MSI 安装包** 时需要。

如果你的 `tauri.conf.json` 中配置：

```
"targets": "msi"
```

或：

```
"targets": "all"
```

则必须启用 **VBSCRIPT Windows Feature**。

如果构建 MSI 时出现错误：

```
failed to run light.exe
```

可以按照以下步骤启用：

1. 打开

```
Settings → Apps → Optional Features → More Windows Features
```

2. 找到 **VBSCRIPT**
3. 勾选启用
4. 按提示重启电脑

说明：

* VBSCRIPT 目前大多数 Windows 默认启用
* 未来 Windows 版本可能默认关闭该功能。 ([Tauri][1])

---

# Rust

Tauri 是使用 **Rust** 构建的，因此开发必须安装 Rust。

推荐使用 **rustup** 安装：

```bash
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

安全提示：

该脚本已被官方审计，但仍建议在执行之前先查看脚本内容。

脚本地址：

```
rustup.sh
```

你也可以使用 Windows 的 `winget` 安装：

```powershell
winget install --id Rustlang.Rustup
```

---

## Windows Rust Toolchain

在 Windows 上建议使用 **MSVC Toolchain**：

示例：

```
x86_64-pc-windows-msvc
```

如果 Rust 已安装，可以运行：

```bash
rustup default stable-msvc
```

安装完成后：

* 重启 Terminal
* 有时需要重启系统

---

# Node.js

如果你打算使用 **JavaScript 前端框架**，则需要安装 Node.js。

安装步骤：

1. 访问 Node.js 官网
2. 下载 **LTS（长期支持版）**
3. 安装完成后验证：

```bash
node -v
# v20.10.0

npm -v
# 10.2.3
```

安装后需要：

* 重启 Terminal
* 有时需要重启电脑

说明：

Node.js 默认使用 **npm**。
如果你想使用其他包管理器：

* pnpm
* yarn

可以运行：

```bash
corepack enable
```

这是可选步骤。 ([Tauri][1])

---

# 移动端配置（Configure for Mobile Targets）

如果你需要构建 **Android 或 iOS** 应用，还需要额外安装依赖。

---

# Android

步骤：

### 1 安装 Android Studio

从 Android Developers 官网下载安装。

---

### 2 设置 JAVA_HOME

Linux

```bash
export JAVA_HOME=/opt/android-studio/jbr
```

macOS

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
```

Windows

```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")
```

---

### 3 使用 SDK Manager 安装

在 Android Studio 中安装：

* Android SDK Platform
* Android SDK Platform-Tools
* NDK (Side by side)
* Android SDK Build-Tools
* Android SDK Command-line Tools

---

### 4 设置环境变量

Linux

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export NDK_HOME="$ANDROID_HOME/ndk/$(ls -1 $ANDROID_HOME/ndk)"
```

macOS

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export NDK_HOME="$ANDROID_HOME/ndk/$(ls -1 $ANDROID_HOME/ndk)"
```

Windows

```powershell
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LocalAppData\Android\Sdk", "User")

$VERSION = Get-ChildItem -Name "$env:LocalAppData\Android\Sdk\ndk" | Select-Object -Last 1

[System.Environment]::SetEnvironmentVariable("NDK_HOME", "$env:LocalAppData\Android\Sdk\ndk\$VERSION", "User")
```

---

### 5 添加 Rust Android Target

```bash
rustup target add \
aarch64-linux-android \
armv7-linux-androideabi \
i686-linux-android \
x86_64-linux-android
```

---

# iOS

仅支持 **macOS**。

iOS 开发必须安装 **Xcode（不是 Command Line Tools）**。

步骤：

### 1 添加 iOS Rust Target

```bash
rustup target add \
aarch64-apple-ios \
x86_64-apple-ios \
aarch64-apple-ios-sim
```

---

### 2 安装 Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

---

### 3 安装 CocoaPods

```bash
brew install cocoapods
```

---

# 故障排查（Troubleshooting）

如果安装过程中遇到问题：

* 查看 **Troubleshooting Guide**
* 或到 **Tauri Discord 社区**求助。

# 参考资料

* any list
{:toc}