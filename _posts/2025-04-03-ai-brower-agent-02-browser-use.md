---
layout: post
title: Browser-use 是连接你的AI代理与浏览器的最简单方式
date: 2025-4-3 14:03:48 +0800
categories: [AI]
tags: [ai, ai-agent, sh]
published: true
---


# AI MCP 系列

[AgentGPT-01-入门介绍](https://houbb.github.io/2025/04/03/ai-brower-agent-01-agentGPT)

[Browser-use 是连接你的AI代理与浏览器的最简单方式](https://houbb.github.io/2025/04/03/ai-brower-agent-02-browser-use)

[AI MCP(大模型上下文)-01-入门介绍](https://houbb.github.io/2025/04/15/ai-mcp-01-intro)

[AI MCP(大模型上下文)-02-awesome-mcp-servers 精选的 MCP 服务器](https://houbb.github.io/2025/04/15/ai-mcp-02-awesome-servers)

[AI MCP(大模型上下文)-03-open webui 介绍 是一个可扩展、功能丰富且用户友好的本地部署 AI 平台，支持完全离线运行。](https://houbb.github.io/2025/04/15/ai-mcp-03-open-webui)

[AI MCP(大模型上下文)-04-n8n 为技术团队打造的安全工作流自动化平台](https://houbb.github.io/2025/04/15/ai-mcp-04-n8n)

[AI MCP(大模型上下文)-05-anything-llm AnythingLLM 您一直在寻找的全方位AI应用程序](https://houbb.github.io/2025/04/15/ai-mcp-05-anything-llm)

[AI MCP(大模型上下文)-06-maxkb 强大易用的企业级 AI 助手](https://houbb.github.io/2025/04/15/ai-mcp-06-maxkb)

[AI MCP(大模型上下文)-07-dify 入门介绍](https://houbb.github.io/2025/04/15/ai-mcp-07-dify-intro)

[AI MCP(大模型上下文)-08-分享一些好用的 Dify DSL 工作流程](https://houbb.github.io/2025/04/15/ai-mcp-08-awesome-dify-workflow)

[AI MCP(大模型上下文)-09-基于Dify自主创建的AI应用DSL工作流](https://houbb.github.io/2025/04/15/ai-mcp-09-difyaia)

[AI MCP(大模型上下文)-10-Activepieces 一个开源的 Zapier 替代方案](https://houbb.github.io/2025/04/15/ai-mcp-10-activepieces)

[AI MCP(大模型上下文)-11-微软 Playwright MCP server](https://houbb.github.io/2025/04/15/ai-mcp-11-playwright-mcp)

[AI MCP(大模型上下文)-12-AWS MCP](https://houbb.github.io/2025/04/15/ai-mcp-12-aws-mcp)

[AI MCP(大模型上下文)-13-github MCP](https://houbb.github.io/2025/04/15/ai-mcp-13-github-mcp)

# 启用AI控制你的浏览器 🤖

🌐 **Browser-use** 是将AI代理与浏览器连接的最简单方式。

💡 查看别人正在构建的内容，并在我们的 [Discord](https://link.browser-use.com/discord) 上分享你的项目！想要周边？看看我们的 [Merch商店](https://browsermerch.com)。

🌤️ 跳过设置 —— 试试我们的<b>托管版本</b>，即时浏览器自动化！<b>[试试云端 ☁︎](https://cloud.browser-use.com)</b>。

---

### 快速开始

使用pip（Python >=3.11）：

```bash
pip install browser-use
```

安装Playwright：
```bash
playwright install chromium
```

启动你的代理：

```python
from langchain_openai import ChatOpenAI
from browser_use import Agent
import asyncio
from dotenv import load_dotenv
load_dotenv()

async def main():
    agent = Agent(
        task="比较gpt-4o和DeepSeek-V3的价格",
        llm=ChatOpenAI(model="gpt-4o"),
    )
    await agent.run()

asyncio.run(main())
```

将你想使用的提供商的API密钥添加到`.env`文件中。

```bash
OPENAI_API_KEY=  
ANTHROPIC_API_KEY=  
AZURE_ENDPOINT=  
AZURE_OPENAI_API_KEY=  
GEMINI_API_KEY=  
DEEPSEEK_API_KEY=  
```

有关其他设置、模型等，请查阅 [文档 📕](https://docs.browser-use.com)。

---

### UI测试

你可以测试 [browser-use的UI仓库](https://github.com/browser-use/web-ui)

或者简单地运行gradio示例：

```
pip install gradio
```

```bash
python examples/ui/gradio_demo.py
```

---

### 演示

**任务**：[添加杂货到购物车并结账](https://github.com/browser-use/browser-use/blob/main/examples/use-cases/shopping.py)

[![AI买了我的杂货](https://github.com/user-attachments/assets/d9359085-bde6-41d4-aa4e-6520d0221872)](https://www.youtube.com/watch?v=L2Ya9PYNns8)

---

**提示**：将我最新的LinkedIn关注者添加到Salesforce中的潜在客户列表。

![LinkedIn到Salesforce](https://github.com/user-attachments/assets/1440affc-a552-442e-b702-d0d3b277b0ae)

---

**提示**：[阅读我的简历并寻找机器学习工作，将它们保存到文件中，然后开始在新标签页中申请，如果需要帮助，问我](https://github.com/browser-use/browser-use/blob/main/examples/use-cases/find_and_apply_to_jobs.py)

[示例](https://github.com/user-attachments/assets/171fb4d6-0355-46f2-863e-edb04a828d04)

---

**提示**：[在Google Docs中写一封信给我爸爸，感谢他的一切，并将文件保存为PDF](https://github.com/browser-use/browser-use/blob/main/examples/browser/real_browser.py)

![给爸爸的信](https://github.com/user-attachments/assets/242ade3e-15bc-41c2-988f-cbc5415a66aa)

---

**提示**：[查找具有cc-by-sa-4.0许可证的模型，并按最受欢迎排序，保存前5个到文件](https://github.com/browser-use/browser-use/blob/main/examples/custom-functions/save_to_file_hugging_face.py)

[文件](https://github.com/user-attachments/assets/de73ee39-432c-4b97-b4e8-939fd7f323b3)

---

### 更多示例

欲了解更多示例，请查看[examples](examples)文件夹或加入[Discord](https://link.browser-use.com/discord)，展示你的项目。

---

### 愿景

告诉你的计算机做什么，它就会完成。

---

### 路线图

#### 代理

- [ ] 改进代理记忆（总结、压缩、RAG等）
- [ ] 增强规划能力（加载特定网站的上下文）
- [ ] 减少token消耗（系统提示、DOM状态）

#### DOM提取

- [ ] 改进日期选择器、下拉框、特殊元素的提取
- [ ] 改进UI元素的状态表示

#### 任务重跑

- [ ] 使用LLM作为回退
- [ ] 简化工作流模板定义，其中LLM填写详细信息
- [ ] 从代理返回playwright脚本

#### 数据集

- [ ] 创建复杂任务的数据集
- [ ] 对不同模型进行基准测试
- [ ] 针对特定任务微调模型

#### 用户体验

- [ ] 人工干预执行
- [ ] 改进生成的GIF质量
- [ ] 创建各种演示以进行教程执行、职位申请、QA测试、社交媒体等。

---

### 贡献

我们欢迎贡献！如果发现bug或有功能请求，随时提出问题。如果你想为文档做贡献，请查看`/docs`文件夹。

### 本地设置

想了解更多关于该库的信息，请查看[本地设置 📕](https://docs.browser-use.com/development/local-setup)。

`main`是主要的开发分支，常有更新。如果要用于生产环境，请安装稳定的[版本发布](https://github.com/browser-use/browser-use/releases)。

---

### 合作

我们正在成立一个委员会，定义浏览器代理的UI/UX设计最佳实践。通过软件重设计，探索如何提升AI代理的性能，并帮助这些公司通过设计领先的现有软件，在代理时代获得竞争优势。

通过邮件 [Toby](mailto:tbiddle@loop11.com?subject=I%20want%20to%20join%20the%20UI/UX%20commission%20for%20AI%20agents&body=Hi%20Toby%2C%0A%0AI%20found%20you%20in%20the%20browser-use%20GitHub%20README.%0A%0A) 申请成为委员会成员。

### 周边

想炫耀你的Browser-use周边吗？快来看看我们的[Merch商店](https://browsermerch.com)。好的贡献者将免费获得周边👀。

### 引用

如果你在研究或项目中使用了Browser Use，请引用：

```bibtex
@software{browser_use2024,
  author = {Müller, Magnus and Žunič, Gregor},
  title = {Browser Use: Enable AI to control your browser},
  year = {2024},
  publisher = {GitHub},
  url = {https://github.com/browser-use/browser-use}
}
``` 

<div align="center"> <img src="https://github.com/user-attachments/assets/06fa3078-8461-4560-b434-445510c1766f" width="400"/> </div>

<div align="center">
Made with ❤️ in Zurich and San Francisco
</div>

# 参考资料

https://github.com/browser-use/browser-use/blob/main/README.md

* any list
{:toc}