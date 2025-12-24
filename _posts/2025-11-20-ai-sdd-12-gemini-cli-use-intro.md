---
layout: post
title: AI SDD 开发规范-11-GEMINI-CLI 应用实战
date: 2025-11-20 14:12:33 +0800
categories: [AI]
tags: [ai, sdd, sh]
published: true
---

# 安装

## node

```
> node --version
v22.19.0
```

要求：（必须 ≥ 18）

## 安装

全局安装

```
npm install -g @google/gemini-cli
```

版本查看

```

```

# 网络

科学上网 & 终端代理

确保以下至少一个成立：

浏览器能访问 https://aistudio.google.com

终端已设置代理环境变量，开启 Tun 模式。

## 命令行代理

Tun 模式个人测试有效，还有种说法是命令行执行如下命令，但是本次实际测试无效

7897 是本地 clash 的端口。

```
setx HTTP_PROXY http://127.0.0.1:7897
setx HTTPS_PROXY http://127.0.0.1:7897
```

# 登录

## 登录

命令行输入

```
gemini

 ███            █████████  ██████████ ██████   ██████ █████ ██████   █████ █████
░░░███         ███░░░░░███░░███░░░░░█░░██████ ██████ ░░███ ░░██████ ░░███ ░░███
  ░░░███      ███     ░░░  ░███  █ ░  ░███░█████░███  ░███  ░███░███ ░███  ░███
    ░░░███   ░███          ░██████    ░███░░███ ░███  ░███  ░███░░███░███  ░███
     ███░    ░███    █████ ░███░░█    ░███ ░░░  ░███  ░███  ░███ ░░██████  ░███
   ███░      ░░███  ░░███  ░███ ░   █ ░███      ░███  ░███  ░███  ░░█████  ░███
 ███░         ░░█████████  ██████████ █████     █████ █████ █████  ░░█████ █████
░░░            ░░░░░░░░░  ░░░░░░░░░░ ░░░░░     ░░░░░ ░░░░░ ░░░░░    ░░░░░ ░░░░░

Tips for getting started:
1. Ask questions, edit files, or run commands.
2. Be specific for the best results.
3. Create GEMINI.md files to customize your interactions with Gemini.
4. /help for more information.
```

## 登录方式

```
│   How would you like to authenticate for this project?                                                                                                   │
│                                                                                                                                                          │
│   ● 1. Login with Google                                                                                                                                 │
│     2. Use Gemini API Key                                                                                                                                │
│     3. Vertex AI   
```

第一个方式会打开 google 页面验证，但是发现会验证卡死。或者超时失败。


### 方式差异

Google 账户登录：这是获取免费Gemini 2.5 Pro 模型和每日 1000 次慷慨额度的正确方式。

API Key 登录：使用从 Google AI Studio 生成的 API Key，很可能会被降级到 Gemini 2.5 Flash 模型，或者会因为不具备 Pro 权限而报错。 此外，使用 API Key 的调用是付费的，并且更容易遇到 429 (请求速率过快) 的错误。

结论：对于绝大多数用户，推荐选择 Google 账户登录 方式。

# GOOGLE 认证方式

选择第一种方式，会打开 google 认证页面，直接点击认证即可。

## 功能测试

```
Waiting for authentication...

ℹ Authentication succeeded

> "简单解释一下什么是 AI 编程"

✦ 好的，简单来说，AI 编程和我们平时说的“传统编程”有一个核心区别：

   * 传统编程：你必须明确地告诉计算机怎么做。你需要写下每一步具体的指令和规则。
       * 例子：写一个计算器程序，你必须写清楚加、减、乘、除的具体数学公式。

   * AI 编程：你不是直接告诉计算机怎么做，而是让它自己学。你给它一个目标和大量的数据（经验），让它自己从数据中找出规律和方法来完成目标。
       * 例子：做一个能识别猫的程序。你不需要写代码去定义“什么是猫”（比如有尖耳朵、胡须、四条腿），而是给 AI
         看成千上万张猫的照片，告诉它“这些都是猫”，然后它自己就学会了识别新的、以前没见过的猫。

  一个比喻：

   * 传统编程就像是“授人以鱼”，你直接给了计算机一条做好的鱼（固定的指令）。
   * AI 编程就像是“授人以渔”，你教会了计算机钓鱼的方法（学习能力），让它自己去钓各种不同的鱼（解决各种问题）。

  总而言之，AI 编程的重点在于创建能够学习和决策的模型，而不是编写固定的业务逻辑。
```

# API-KEy 方式

### api key

[https://aistudio.google.com/api-keys](https://aistudio.google.com/api-keys) 这个页面生成自己的 key，复制一下

登录的时候选择 `2. Use Gemini API Key` 此时会提示我们输入 key。

### 测试

输入

```
> "用一句话解释什么是 AI 编程"

✕ [API Error: exception TypeError: fetch failed sending request]
```

遇到这个错误，原因其实是命令行也必须设置一下代理。

### 个人环境变量 / 系统变量

还有种说法是直接设置没有用，可以系统变量设置试一下

```
key=GEMINI_API_KEY
value=申请的KEY
```

设置后，打开新的 cmd 命令行，输入 

```
echo %GEMINI_API_KEY%
```

正常输入即可。

### 再次测试

```
> explain what is ai coding

✕ [API Error: You have exhausted your daily quota on this model.]
```

很好，报错改为限额了。

查了很多资料显示应该是对应的有限制，后续有机会再尝试。

# 参考资料

[Gemini 授权后提示 API Error: exception TypeError: fetch failed sending request](https://juejin.cn/post/7524548909529776164)

https://global.v2ex.co/t/1141141

https://zhuanlan.zhihu.com/p/1964052636593530864

* any list
{:toc}