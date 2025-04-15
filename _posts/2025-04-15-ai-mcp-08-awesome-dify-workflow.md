---
layout: post
title: AI MCP(大模型上下文)-08-分享一些好用的 Dify DSL 工作流程
date: 2025-4-15 17:51:19 +0800
categories: [AI]
tags: [ai, mcp, sh]
published: true
---



# Awesome-Dify-Workflow

分享一些好用的 Dify 工作流程，自用、学习两相宜，请使用 Dify 0.13.0 及以上版本导入。

已支持多 **任务并行**、**会话变量**、**表单**、**echart渲染** 相关特性。Agent节点为1.0版本之后功能，请尽可能使用最新版DIFY导入。

所有的 Workflow 基本都可以 **免费** 使用，更多 Workflow 收集整理中……

## 常见问题
这里总结了一些群里常见的问题，不定期更新，内容不会很多，希望对你有帮助。

[AI 流程平台对比——Dify、Fastgpt、Ragflow](https://zerozzz.win/ai-%E6%B5%81%E7%A8%8B%E5%B9%B3%E5%8F%B0%E5%AF%B9%E6%AF%94dify%E3%80%81fastgpt%E3%80%81ragflow)

<details>

https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2025-03-21_10-28-13.jpg

<summary>dify 有没有国内的镜像源配置呀?</summary>
<img src="https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/images/Xnip2024-11-19_10-14-02.jpg" alt="示例图片" width="400">

A：我一般把所有image，前面的链接加上 dockerpull.org
</details>


<details>
<summary>sandbox 如何安装pandas这些第三方库？</summary>
A：打开 /docker/volumes/sandbox/dependencies/python-requirements.txt 填入需要安装的依赖，重启sandbox即可。
</details>

<details>
<summary>定时任务可以如何处理？我希望定时执行某个流程。</summary>
A：可以参考项目 https://github.com/leochen-g/dify-schedule
</details>

<details>
<summary>节点间传递string数据，提示超限制，如何处理</summary>
A：修改 .env 中的一段：
CODE_MAX_STRING_LENGTH: 1000000
TEMPLATE_TRANSFORM_MAX_LENGTH: 1000000
重启容器
</details>

<details>
<summary>拿到图片URL后能在聊天窗口显示吗，试了下markdown但什么都没显示出来。</summary>
<img src="https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/images/image001.png" alt="示例图片" width="400">

A：你的做法是对的，只是你的图片不支持跨域，所以没渲染出来
</details>


<details>
<summary>请教一个问题，知识库上传大文件提出报错，修改配置文件后，还是无法上传大文件，如下是配置文件中修改上传文件地方；</summary>
<img src="https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/images/002.png" alt="示例图片" width="400">

A:nginx 也要改；在.env里面；搜 nginx，应该能找到
</details>


<details>
<summary>知识库永久排队问题</summary>
A：修改 .env 中的一段：LOG_FILE=/app/logs/server.log；重启容器
</details>


<details>
<summary>在哪里可以自学Dify?</summary>
A：可以参考 https://dify101.com
</details>

<details>
<summary>Dify生成图表有什么好方案？</summary>
A：Dify自带了一些绘图功能，包括柱状图、曲线图等。 也可以自己写一个Echarts插件，从数据库读取数据并画图。 
</details>

<details>
<summary>Dify知识库上传PDF乱码怎么办？</summary>
A： 可以使用工具将PDF转换成Markdown格式再上传。
</details>


<details>
<summary>DuckDuckGo 翻译 现在是不可用了吗</summary>
A：应该是服务器挂了代理，但是dify是启在docker里面的，没挂。
</details>


<details>
<summary>探索 Dify 的官方示例应用全部是英文，怎么切换成中文？</summary>
A：点击右上角，头像，设置，语言，先切换成其它语言，再切换成中文，即可。
</details>

<details>
<summary>管理员密码忘记了怎么搞？</summary>
A：执行下面的指令：docker exec -it docker-api-1 flask reset-password
</details>

## SANDBOX
sandbox 运行pandas，numpy>2.0，matplotlib，scikit-learn 代码老报错，可以使用我开发的另外一个简单版[dify-sandbox-py](https://github.com/svcvit/dify-sandbox-py)，这些依赖已经测试可以使用。

## DIFY 1.0 插件
[dify_plugin_collection](https://github.com/svcvit/dify_plugin_collection) 仓库存放着 DIFY 的[官方市场](https://marketplace.dify.ai/) 插件安装包，方便离线用户自由选择，不定期更新。

如果你希望开发插件，我有2个插件的源码 [google翻译](https://github.com/svcvit/dify-plugin-google_translate)、[对话Agent](https://github.com/svcvit/dify-plugin-tod_agent) 希望可以给你参考。

## 模型

- 你可以使用最近火热的deepseek-R1，硅基流动提供免费2000万Tokens，如果使用邀请注册，你和我都会获赠免费2000万token的额度：[https://cloud.siliconflow.cn/i/MwADckCi](https://cloud.siliconflow.cn/i/MwADckCi)
- 如果你希望体验 OpenAI 或 Anthropic 的模型，可以使用我搭建的服务 [CoffBox](https://one.coffbox.com/) 的服务
配置方式参考 [如何在Dify中使用CoffBox的服务](https://blog.vcvit.me/2024/11/13/how-to-use-one-api-in-dify/)
这个方式仅供个人使用，如果你需要大规模使用，[openrouter](https://openrouter.ai/)会是个更好的选择。

## 参考截图

所有 DSL 都为工作流模式，可以方便的发布为工具后，嵌入 ChatBot 流程。工作流会包含基础的输入、条件判断、变量聚合器、输出等内容。

# DSL 目录

你可以参考下面每个 yml 的描述，找到你需要的 Workflow，然后在 DSL 文件夹中找到对应的文件，复制文件的 URL，导入自己的 Dify 账号即可。

## 2025-04-07更新
| 文件                               | 描述                                                                                                                                                                           | 来源                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `图文知识库`                |如果你希望检索知识库后，是图配文的效果，你需要在知识库里加上图片的远程连接即可。可参考本示例，包含一个markdown文件。 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/WechatIMG9731.jpg?raw=true) |   [@svcvit](https://vcvit.me/)   |




## 2025-03-26更新
| 文件                               | 描述                                                                                                                                                                           | 来源                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `MCP.yml`                |使用[MCP Agent 策略](https://marketplace.dify.ai/plugins/hjlarry/agent)进行MCP工具的调用示例，MCP使用[https://mcp.so/](https://mcp.so/server/amap-maps/amap) 提供的在线服务。 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2025-03-26_11-19-23.jpg?raw=true) 这里还有一个官方示例[Dify MCP 插件指南：一键连接 Zapier，轻松调用 7000+ App 工具](https://mp.weixin.qq.com/s/CDhqmLO1JXSB__aUMqoGoQ) |   [@svcvit](https://vcvit.me/)   |



## 2025-03-21更新
| 文件                               | 描述                                                                                                                                                                           | 来源                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `Demo-tod_agent.yml`                |使用dify 1.0 的Agent节点，针对对话场景优化的Agent策略，例如：多轮对话、上下文理解、信息收集等。https://marketplace.dify.ai/plugins/svcvit/agent ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2025-03-21_10-28-13.jpg?raw=true) |   [@svcvit](https://vcvit.me/)   |




## 2025-02-24更新
| 文件                               | 描述                                                                                                                                                                           | 来源                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `Deep Researcher On Dify .yml`                |Deep Researcher 工作流复现方案 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2025-02-24_10-12-56.jpg?raw=true)  |   [@AdamPlatin123](https://github.com/AdamPlatin123/Open-Deep-Research-workflow-on-Dify)   |



## 2025-02-17更新
| 文件                               | 描述                                                                                                                                                                           | 来源                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `Agent工具调用.yml`                |使用dify 1.0 的Agent节点，使用FC调用不同的工具，进行回复。 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2025-02-17_16-51-30.jpg?raw=true)  |   [@svcvit](https://vcvit.me/)   |




## 2025-01-23更新

| 文件                               | 描述                                                                                                                                                                           | 来源                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `旅行Demo.yml`                       |使用dify 1.0 的Agent节点，演示旅行信息收集，Tool调用，对话历史上下文存储。将对话消息存入对话变量，纳入Agent的思考上下文。 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2025-01-23_13-22-24.jpg?raw=true)  ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2025-01-23_13-22-47.jpg?raw=true)  |   [@svcvit](https://vcvit.me/)   |






## 2025-01-21更新

| 文件                               | 描述                                                                                                                                                                           | 来源                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `春联生成器.yml`                       |春联生成工具，注意字体需要电脑有，可以按需修改字体。 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2025-01-21_09-21-11.jpg?raw=true)  |  微信群@Junjie.M   |
| `春联生成器 (“福”到了版本).yml`                       |  ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2025-01-21_09-22-59.jpg?raw=true)    |  微信群@Junjie.M  |
| `完蛋！我被LLM包围了！ .yml`                       | 【完蛋！我被LLM包围了！】借鉴了：https://github.com/modelscope/modelscope/tree/master/examples/apps/llm_riddles  ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2025-01-21_09-39-18.jpg?raw=true)    |  微信群@Junjie.M  |



## 2024-12-05更新

| 文件                               | 描述                                                                                                                                                                           | 来源                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `File_read.yml`                       | 使用sandbox读取文件并解析，需要使用[dify-sandbox-py](https://github.com/svcvit/dify-sandbox-py)，挂在上传目录，这是一个pandas读取csv的示例，具体方法参考右侧来源链接 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-12-05_09-26-33.jpg?raw=true)    ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-12-05_09-22-43.jpg?raw=true)  |  [@svcvit](https://blog.vcvit.me/2024/12/05/use-dify-sandbox-to-parse-files/)   |
| `runLLMCode.yml`                       | 使用LLM生成的Code，再通过sandbox去执行。因为code节点无法直接引用LLM的代码，所以通过HTTP请求的方式执行，这里有一个分析csv的示例。 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-12-05_10-16-16.jpg?raw=true)   ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-12-05_10-16-25.jpg?raw=true)      |  [@svcvit](https://vcvit.me/)    |
| `数据分析.7z`                       | 数据分析的示例，可以根据需求查询数据库，生成对应的解读和图表。示例中包括流程文件和flask的服务。 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-12-05_11-10-39.jpg?raw=true)   ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-12-05_11-12-55.jpg?raw=true)      |  微信群：简单&平凡@   |



## 2024-11-29更新

| 文件                               | 描述                                                                                                                                                                           | 来源                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `LanguageConsistencyChecker.yml`                       | 三语言检查器，主要处理翻译的内容优化，它还有一个web端配套  ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-11-29_11-40-06.jpg?raw=true)    ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-11-29_11-42-42.jpg?raw=true)      |  [langfixer](https://github.com/stvlynn/langfixer)   |




## 2024-11-22更新

| 文件                               | 描述                                                                                                                                                                           | 来源                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `matplotlib.yml`                       | 使用matplotlib画图，将图片输出为base64，再通过回复渲染图片。注意，官方sandbox权限比较复杂，安装完matplotlib也无法使用，请使用[dify-sandbox-py](https://github.com/svcvit/dify-sandbox-py)  ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-11-21_09-35-09.jpg?raw=true)                                                      |  [@svcvit](https://vcvit.me/)   |
| `jieba.yml`                       | jieba 分词示例，请使用[dify-sandbox-py](https://github.com/svcvit/dify-sandbox-py)  ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-11-22_13-44-07.jpg?raw=true)                                                      |  [@svcvit](https://vcvit.me/)   |


## 2024-11-20更新

| 文件                               | 描述                                                                                                                                                                           | 来源                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `json-repair.yml`                       | 大模型输出的JSON格式不标准，少个引号，多个括号，通过这个流程修复为可解析的的JSON ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-11-20_09-45-48.jpg?raw=true)                                                      |  [@svcvit](https://vcvit.me/)  |

## 2024-11-15更新

| 文件                               | 描述                                                                                                                                                                           | 来源                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `json_translate.yml`                       | 解析JSON中的需要翻译的内容，使用迭代器进行翻译，再组合成新的JSON，保持原有JSON的结构 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-11-15_18-16-26.jpg?raw=true)                                                      |  [@svcvit](https://vcvit.me/)   |


## 2024-11-14更新

| 文件                               | 描述                                                                                                                                                                           | 来源                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `腾讯云SubtitleInfo.yml`                       | 这是一个代码相关的示例，通过腾讯云的授权信息加密，获取需要的内容信息参考。如果你需要使用代码节点，可以参考用法。 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-11-14_14-03-53.jpg?raw=true)                                                      | 微信分享群  |
| `chart_demo.yml`                       | 通过回复内容渲染charts的图表内容。当然你可以可以根据sql查询数据，拼接成需要的内容 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-11-14_15-17-39.jpg?raw=true)                                                      |   [@svcvit](https://vcvit.me/)    |


## 2024-11-12更新

| 文件                               | 描述                                                                                                                                                                           | 来源                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `Form表单聊天Demo.yml`                       | 在对话框登录之后有权限访问模型 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-11-12_10-47-42.jpg?raw=true)                                                      |  [@svcvit](https://vcvit.me/)   |

## 翻译

| 文件                               | 描述                                                                                                                                                                           | 来源                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `中译英.yml`                       | 通过宝玉的 Prompt，直译->反思->意译，将中文翻译成高质量的英文。 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-07-24_13-04-11.jpg?raw=true)                                                      | 暂无                                                                |
| `DuckDuckGo 翻译+LLM 二次翻译.yml` | 与三步翻译类似，但是把第一步的直译变成传统翻译引擎翻译，节省 Token，提高翻译效率，同时提高翻译质量。 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-07-16_13-42-06.jpg?raw=true)                 | 暂无                                                                |
| `translation_workflow.yml`         | 使用吴恩达提出 Agentic Workflow 制作的翻译工具，录入`输入语言`、`目标语言`、`国家`、`原始文本` 4 个参数，提供更细致的翻译结果 ![snap](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-07-16_16-58-05.jpg?raw=true) | [translation-agent](https://github.com/andrewyng/translation-agent) |
| `宝玉的英译中优化版.yml`         | 宝玉的科技文章翻译优化版本，主要优化了提示词和 xml 标签 ![snap](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-08-01_13-47-25.jpg?raw=true) | [翻译 GPT 的提示词更新和优化](https://baoyu.io/blog/prompt-engineering/translator-gpt-prompt-v2-1-improvement) |
| `全书翻译.yml`         | DIFY 官方示例，切分长文本，再迭代器内翻译 ![snap](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-10-30_18-02-24.jpg?raw=true) | DIFY 官方探索内容 |

## 工具

| 文件                             | 描述                                                                                                      | 来源                                                      |
| -------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `SEO Slug Generator.yml`         | 给自己的博文生成 url slug，参考来源于宝玉的 X ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-07-24_13-06-35.jpg?raw=true)   | [twitter](https://x.com/dotey/status/1801280536125608265) |
| `Document_chat_template.yml`     | 一个通过知识库聊天的模版 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-07-24_13-08-49.jpg?raw=true)                        | [Winson-030](https://github.com/Winson-030/dify-DSL)      |
| `搜索大师.yml`                   | 通过 SearXNG 进行搜索，再通过 jina 获取搜索内容 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-07-24_13-07-55.jpg?raw=true) | [Winson-030](https://github.com/Winson-030/dify-DSL)      |
| `标题党创作.yml`                 | 一位爆款网文作家  ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-10-31_17-45-53.jpg?raw=true)       | [ghostviper](https://github.com/ghostviper/dify-workflow) |
| `文章仿写-单图_多图自动搭配.yml` | 文章仿写   ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-10-31_17-46-30.jpg?raw=true)               | [ghostviper](https://github.com/ghostviper/dify-workflow) |
| `Text to Card Iteration.yml`     | 自动生成小红书这种卡片。                                                                                  | 🔥Dify Workflow-Agent 设计交流 @Arthur                    |
| `Dify 运营一条龙.yml`     | 小红书、抖音、微博、B 站一条龙运营。（2024/11/21更新，主流程已经不能用了，因为图片生成那个服务问题很多，而且限制了分辨率，导致生成图完全不对了，全当看个思路。）  ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-07-24_16-34-29.jpg?raw=true)   | [Dify 一键生成多尺寸 Cover 与全平台文案](https://www.youtube.com/watch?v=kCrQp8YZTsQ)                    |
| `Jina Reader Jinja.yml`     | 一个基于 TavilySearch 和 Jina 的问答流程  ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-07-29_14-43-54.jpg?raw=true)   | 🔥Dify Workflow-Agent 设计交流群分享        |
| `llm2o1.cn.yml`     | 任务拆解→提取步骤→迭代步骤执行→归纳总结→输出结果 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-09-30_09-44-00.jpg?raw=true)   | [@okooo5km](https://x.com/okooo5km/status/1838801763778072862)  |
| `dify_course_demo.yml`     | 自动化生成全套教程。 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/GZvTSh3aYAEMAQ5.jpeg)   | [dify_course](https://github.com/pekingmuge/dify_course)  |
| `simple-kimi.yml`     | 简易自制 Kimi ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-10-31_17-33-34.jpg?raw=true)   | [aws-samples](https://github.com/aws-samples/dify-aws-tool/tree/main/workflow)  |
| `Claude3 Code Translation.yml`     | 不同代码种类之间的翻译工作流 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-10-31_17-38-34.jpg?raw=true)   | [aws-samples](https://github.com/aws-samples/dify-aws-tool/tree/main/workflow)  |

## 聊天机器人

| 文件                         | 描述                                                                                                                                           | 来源                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `根据用户的意图进行回复.yml` | 根据用户的聊天内容，进行意图判定，根据意图选择不同的工作流路径进行回复，再风格化聊天机器人话术 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/WechatIMG4894.jpg?raw=true) | 无                                                                 |
| `mem0ai`                     | 一个有记忆的聊天流程，完整代码见来源链接 ![mem0ai](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/WechatIMG6110.jpg?raw=true)                                                 | [dify-plugin-mem0ai](https://github.com/tonori/dify-plugin-mem0ai) |
| `记忆测试.yml`         | 添加短期记忆，CoT 思维链的示例，自动问答机器人也可以主动触达，根据上下文选择最佳回复 ![](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-09-19_12-03-01.jpg?raw=true)               | 来自微信 svcvit |

## 代码

| 文件                       | 描述                             | 来源                                                                                                                               |
| -------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `Python Coding Prompt.yml` | 通过聊天对话方式生成 Python 代码 | [Sonnet 3.5 for Coding 😍 - System Prompt](https://www.reddit.com/r/ClaudeAI/comments/1dwra38/sonnet_35_for_coding_system_prompt/) |

## 使用方法

注册 [Dify](https://cloud.dify.ai/) 账号，添加模型。


![snap](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-07-16_13-17-53.jpg?raw=true)

![snap](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-07-16_13-17-10.jpg?raw=true)

下载本项目至本地，导入 DLS 文件即可，当然，你可以进行必要的调整，例如模版的调整，或提示词的调整。

![snap](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-07-16_13-15-39.jpg?raw=true)

![snap](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-07-16_12-45-29.jpg?raw=true)

![snap](https://github.com/svcvit/Awesome-Dify-Workflow/blob/main/snapshots/Xnip2024-07-16_12-45-37.jpg?raw=true)


# 参考资料

https://github.com/svcvit/Awesome-Dify-Workflow

* any list
{:toc}