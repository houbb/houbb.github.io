---
layout: post
title: Tree-sitter 文档-23-贡献（Contributing）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# 贡献（Contributing）

Tree-sitter 是一个开源项目，欢迎社区贡献。

在提交贡献之前，请确保你的改动符合项目目标，并遵循已有的代码结构与设计原则。 ([GitHub][1])

---

## 报告问题（Reporting Issues）

如果你发现 bug 或存在改进建议，应：

1. 在 GitHub 上搜索现有 issue，确认问题尚未被报告。
2. 若不存在相关 issue，则创建新的 issue。

在报告问题时，应尽量提供：

* 清晰的问题描述
* 可复现步骤
* 示例代码
* 操作系统与环境信息
* Tree-sitter 版本号

这样可以帮助维护者快速定位问题。

---

## 提交 Pull Request

若希望提交代码修改：

1. Fork 仓库
2. 创建新的分支
3. 在分支上完成修改
4. 提交 Pull Request

Pull Request 应：

* 聚焦单一问题或功能
* 包含清晰的提交说明
* 避免无关改动

---

## 代码风格（Code Style）

贡献代码时，应遵循项目现有风格：

* 保持代码简洁与一致
* 使用已有抽象，而非重复实现
* 避免不必要的复杂性

在提交前，应确保代码能够成功构建。

---

## 添加测试（Tests）

所有行为修改或新功能通常都需要配套测试。

测试用于：

* 防止回归问题
* 验证解析行为正确性
* 保证长期稳定性

如果修改影响解析结果，应更新对应测试。

---

## 文档更新（Documentation）

若改动影响：

* API
* CLI 行为
* Grammar 工作方式

则应同步更新文档。

文档与代码保持一致是项目维护的重要部分。

---

## Grammar 仓库贡献

对于语言 grammar：

* 应在对应语言的 grammar 仓库中提交修改
* 不应直接修改核心仓库

每个 grammar 通常独立维护。

---

## 行为准则（Code of Conduct）

参与项目即表示同意遵守项目的行为准则。

贡献者应：

* 保持尊重与专业沟通
* 建设性地讨论技术问题
* 避免攻击性或不当行为

---

## 许可证（License）

提交到 Tree-sitter 的贡献将按照项目使用的：

```
MIT License
```

进行授权。

这意味着你的贡献将在 MIT 许可证下发布。 ([GitHub][1])

---

（翻译完毕）

# 参考资料

[1]: https://github.com/tree-sitter/tree-sitter?utm_source=chatgpt.com "GitHub - tree-sitter/tree-sitter: An incremental parsing system for programming tools"


* any list
{:toc}