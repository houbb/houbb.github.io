---
layout: post
title: Anthropic 网络安全技能-01-面向AI智能体的734+项网络安全技能 &middot; agentskills.io 开放标准
date: 2026-03-18 21:01:55 +0800
categories: [AI]
tags: [ai, safe]
published: true
---



面向AI智能体的734+项网络安全技能 &middot; agentskills.io 开放标准

---

> **警告：社区项目 —— 与 Anthropic PBC 无关。**
> 这是一个独立的、由社区创建的集合。存储库名称中的“Anthropic”指的是兼容 agentskills.io 标准，而非官方关联。

这是面向AI智能体的最大开源网络安全技能集合。每项技能都遵循 [agentskills.io](https://agentskills.io) 开放标准，并可即时与 Claude Code、GitHub Copilot、OpenAI Codex CLI、Cursor、Gemini CLI 及 20 多个其他平台配合使用。

## 快速开始

**方法1：npx skills 命令**
```bash
npx skills add mukul975/Anthropic-Cybersecurity-Skills
```

**方法2：Claude Code 插件**
```
/plugin marketplace add mukul975/Anthropic-Cybersecurity-Skills
```

**方法3：手动克隆**
```bash
git clone https://github.com/mukul975/Anthropic-Cybersecurity-Skills.git
```

## 技能类别

| 类别 | 技能数量 | 示例技能 |
|----------|-------:|----------------|
| 云安全 | 48 | AWS S3 存储桶审计、Azure AD 配置、GCP 安全评估 |
| 威胁情报 | 43 | 使用 MITRE Navigator 进行 APT 组织分析、攻击活动归因、暗网监控 |
| Web 应用安全 | 41 | HTTP 请求走私、使用 Burp Suite 进行 XSS 检测、Web 缓存投毒 |
| 威胁狩猎 | 35 | 凭据转储检测、使用 Zeek 进行 DNS 隧道检测、白名单利用程序 |
| 恶意软件分析 | 34 | Cobalt Strike 信标配置、Ghidra 逆向工程、YARA 规则开发 |
| 数字取证 | 34 | 使用 dd/dcfldd 进行磁盘镜像、使用 Volatility3 进行内存取证、浏览器取证 |
| 安全运营中心 | 33 | Windows 事件日志分析、Splunk 检测规则、SIEM 用例实施 |
| 网络安全 | 33 | Wireshark 流量分析、VLAN 隔离、Suricata IDS 配置 |
| 身份与访问管理 | 33 | 使用 Okta 进行 SAML SSO、特权访问管理、Kubernetes RBAC |
| 工业控制/工业物联网安全 | 28 | SCADA 系统攻击检测、Modbus 异常检测、Purdue 模型隔离 |
| API 安全 | 28 | API 枚举检测、BOLA 利用、GraphQL 安全评估 |
| 容器安全 | 26 | Trivy 镜像扫描、Falco 运行时检测、Kubernetes Pod 安全 |
| 漏洞管理 | 24 | DefectDojo 仪表盘、CVSS 评分、补丁管理工作流 |
| 红队演练 | 24 | Sliver C2 框架、BloodHound AD 分析、使用 Impacket 进行 Kerberoasting |
| 应急响应 | 24 | 勒索软件响应、云安全事件遏制、易失性证据收集 |
| 渗透测试 | 23 | 外部网络渗透测试、Kubernetes 渗透测试、Active Directory 渗透测试 |
| 零信任架构 | 17 | HashiCorp Boundary、Zscaler ZTNA、BeyondCorp 访问模型 |
| 端点安全 | 16 | CIS 基准加固、Windows Defender 配置、基于主机的入侵检测系统 |
| 开发安全运维 | 16 | GitLab CI 流水线、Semgrep 自定义 SAST 规则、使用 Gitleaks 进行密钥扫描 |
| 网络钓鱼防御 | 16 | 邮件头分析、GoPhish 模拟、DMARC/DKIM/SPF 配置 |
| 密码学 | 13 | TLS 1.3 配置、HSM 密钥存储、使用 OpenSSL 搭建证书颁发机构 |
| 移动安全 | 12 | 使用 Objection 进行 iOS 应用分析、Android 恶意软件逆向工程、Frida 钩子 |
| 勒索软件防御 | 5 | 勒索软件前兆检测、备份策略、蜜罐检测 |
| 合规与治理 | 5 | GDPR 数据保护、ISO 27001 信息安全管理体系、PCI DSS 控制措施 |

## 工作原理

每项技能都遵循 [agentskills.io](https://agentskills.io) 的**渐进式披露**模式。在发现阶段，AI 智能体仅读取 YAML 前置元数据（约 30-50 个词元）以决定相关性：

```yaml
---
name: performing-memory-forensics-with-volatility3
description: 使用 Volatility3 分析内存转储以提取进程、网络连接和恶意软件工件。
domain: cybersecurity
subdomain: digital-forensics
tags: [forensics, memory-analysis, volatility3, incident-response]
---
```

如果技能与任务匹配，智能体会加载完整内容——工作流步骤、前提条件、工具命令和验证检查——而不会在不相关的技能上浪费词元。

## 兼容平台

这些技能适用于任何支持 agentskills.io 标准或能够读取结构化 Markdown 的工具：

| 平台 | 集成方式 |
|----------|------------|
| **Claude Code** | 通过 `/plugin` 原生加载技能 |
| **GitHub Copilot** | 通过 `.skills/` 目录作为工作空间上下文 |
| **OpenAI Codex CLI** | 基于文件的上下文注入 |
| **Cursor** | 项目规则和文档集成 |
| **Gemini CLI** | 上下文文件加载 |
| **Amp** | 技能目录挂载 |
| **Goose** | 基于插件的技能加载 |
| **Windsurf** | 从项目文件感知上下文 |
| **Aider** | 代码库映射集成 |
| **Continue** | 自定义上下文提供程序 |
| 以及 16 个以上其他平台 | 任何能读取结构化 Markdown 的智能体 |

## 技能结构

每项技能都遵循一致的目录结构：

```
skills/{skill-name}/
├── SKILL.md            # 包含 YAML 前置元数据的技能定义文件
│   ├── 前置元数据      # 名称、描述、领域、子领域、标签
│   ├── 使用时机        # AI 智能体的触发条件
│   ├── 前提条件        # 所需的工具和访问权限
│   ├── 工作流          # 分步执行指南
│   └── 验证            # 如何确认成功
├── references/
│   ├── standards.md    # NIST、MITRE ATT&CK、CVE 参考
│   └── workflows.md    # 深入的技术流程参考
├── scripts/
│   └── process.py      # 从业人员辅助脚本
└── assets/
    └── template.md     # 检查清单和报告模板
```

## 贡献

我们欢迎来自网络安全社区的贡献。有关添加新技能、改进现有技能以及我们审阅流程的指南，请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 星标历史

[![星标历史图表](https://api.star-history.com/svg?repos=mukul975/Anthropic-Cybersecurity-Skills&type=Date)](https://star-history.com/#mukul975/Anthropic-Cybersecurity-Skills&Date)

## 许可证

<a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache_2.0-blue.svg?style=flat" alt="许可证"></a>

本项目采用 Apache 许可证 2.0 版。详情请参阅 [LICENSE](LICENSE)。

# 参考资料

* any list
{:toc}