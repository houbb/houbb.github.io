---
layout: post
title: AI 大模型 MCP 介绍与从零实现实战
date: 2025-9-16 20:40:12 +0800
categories: [AI]
tags: [ai, deepseek, sh]
published: true
---


# MCP 

实战之前，先简单介绍一下 MCP。

MCP = Model Context Protocol，是 OpenAI 在 2024 年底提出的一种协议，用于让大模型（LLM，比如 ChatGPT）能够和外部系统（数据库、API、工具、文件系统等）进行交互。

## MCP 是什么？

MCP 就是 一个大模型和外部工具之间的“通用桥梁”协议。

* 过去的做法：
  如果要让 LLM 调用某个外部 API，一般需要插件、函数调用（function calling）、或者自己写一个中间层（代理/Agent）。
  但这些方式缺乏统一标准，开发者要重复造轮子。

* MCP 的目标：
  提供一个标准协议，让不同的工具都能用同样的方式接入 LLM，LLM 也能用统一的方式来调用它们。

简单类比：

* 没有 MCP = 各家厂商自己定义接口，互不兼容。
* 有了 MCP = 出现了“USB 标准”，随便一个设备插上就能用。

## MCP 的核心设计

MCP 的核心理念是：把 LLM 看成客户端，把外部工具看成服务端。

* 客户端：大模型（例如 ChatGPT、本地 LLM 应用）
* 服务端：任意系统，只要实现了 MCP 协议，就能被 LLM 调用

### MCP 提供的几个能力

1. 工具 (Tools)

   * LLM 可以调用服务端暴露的功能（类似函数调用）。
   * 比如：`searchTickets()`、`getWeather()`、`queryDatabase()`。

2. 资源 (Resources)

   * 服务端可以把数据源暴露出来，LLM 能像访问文件或数据库一样读取。
   * 比如：`/var/log/app.log`、`mongodb://...`、`knowledge_base/articles`。

3. 事件 (Events)

   * 服务端可以向 LLM 推送实时事件。
   * 比如：数据库变更、系统告警、MQ 消息。

4. 标准协议

   * MCP 使用 JSON-RPC 作为通信方式。
   * 不依赖具体语言，任何编程语言都能实现。

## MCP 的应用场景

有了 MCP，大模型就能像“操作系统内核”一样，调用各种外部能力：

1. 开发者工具

   * LLM 直接读写代码仓库、运行测试、调用 CI/CD。

2. 运维 & 监控

   * LLM 可以订阅报警事件、查询日志、做根因分析。

3. 数据库查询

   * MCP 作为数据库代理，让 LLM 直接安全地执行 SQL（带权限控制）。

4. 自动化工作流

   * LLM 可以通过 MCP 调用 API，触发自动化流程（类似 IFTTT + AI）。

5. 知识库 & 文件系统

   * LLM 能够直接访问本地文件、远程文档库，而不是只依赖上下文窗口。

## 小结

MCP 是 OpenAI 定义的标准协议，让大模型和外部系统之间的交互像“USB 插口”一样统一、通用、可扩展。

它的价值在于：

* 降低开发成本
* 打通大模型和真实世界的数据/工具
* 促进 AI Agent 生态形成“标准化接口”



# 一个简单的题目

## 场景

要求实现 MCP client、mcp server、LLM 模型调用。

可以根据用户的自然语言输入，实现汇率转换。

简单起见，输入文件在 root 目录下，用户输入.csv，内容例子如下：

```
user_input
我想兑换一千人民币为港元，可以兑换多少钱？
我想兑换一万美元为人民币，可以兑换多少人民币？
1.欧元可以兑换多少美元？
```

输出文件也是 csv。放在根目录。结果输出.csv

```
金额,货币,目标货币,结果金额
```

## 模型选择

很多 ai 都提供了 api 接口，http 交互即可。

我们以 deepseek 为例子。

## 项目结构

此处选择 springboot + maven 

项目结构

```
│  pom.xml
│  README.md
│  用户输入.csv
│  结果输出.csv
└─src
    └─main
        ├─java
        │  └─com
        │      └─example
        │          └─mcp
        │                  Application.java
        │                  CsvProcessor.java
        │                  LlmClientDeepSeek.java
        │                  LlmClientOpenAi.java
        │                  McpClient.java
        │                  McpServerController.java
        │                  RateUtils.java
        │
        └─resources
                application.yaml
```

## 测试效果

我们启动 Applicaiton#main()

结果输出.csv 内容如下：

```
"user_input","amount","from","to","converted"
"我想兑换一千人民币为港元，可以兑换多少钱？","1000.0","CNY","HKD","1070.0"
"我想兑换一万美元到人民币，可以兑换多少人民币？","10000.0","USD","CNY","73000.0"
"1.欧元可以兑换多少日元？","1.0","EUR","JPY","158.7"
```

日志节选如下:

```
2025-09-16 18:47:52.015  INFO 20156 --- [           main] com.example.mcp.CsvProcessor             : 处理第2行: 我想兑换一万美元到人民币，可以兑换多少人民币？
2025-09-16 18:47:52.015  INFO 20156 --- [           main] com.example.mcp.LlmClientDeepSeek        : 发送 DeepSeek LLM 请求解析文本: 我想兑换一万美元到人民币，可以兑换多少人民币？
2025-09-16 18:47:56.706  INFO 20156 --- [           main] com.example.mcp.LlmClientDeepSeek        : DeepSeek LLM 解析结果: amount=10000.0, from=USD, to=CNY
2025-09-16 18:47:56.713  INFO 20156 --- [nio-8080-exec-8] com.example.mcp.McpServerController      : MCP Server received request: amount=10000.0, from=USD, to=CNY
2025-09-16 18:47:56.713  INFO 20156 --- [nio-8080-exec-8] com.example.mcp.McpServerController      : MCP Server calculated result: 10000.0 USD -> 73000.0 CNY
2025-09-16 18:47:56.718  INFO 20156 --- [           main] com.example.mcp.CsvProcessor             : 第2行处理完成: 10000.0 USD -> CNY = 73000.0
```

# 代码实现

接下来，我们重点介绍一些核心代码。

## pom.xml

基本的项目依赖，主要是 http 依赖

```xml
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.14</version>
    </parent>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>com.opencsv</groupId>
            <artifactId>opencsv</artifactId>
            <version>5.9</version>
        </dependency>
        <dependency>
            <groupId>com.squareup.okhttp3</groupId>
            <artifactId>okhttp</artifactId>
            <version>4.12.0</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
```


## CsvProcessor.java 文件处理

解析每一行用户的 csv 输入，把结果输出到 csv 文件中。

```java
@Component
public class CsvProcessor {

    private static final Logger log = LoggerFactory.getLogger(CsvProcessor.class);

    private final LlmClientDeepSeek llmClient;
    private final McpClient mcpClient;

    public CsvProcessor(LlmClientDeepSeek llmClient, McpClient mcpClient) {
        this.llmClient = llmClient;
        this.mcpClient = mcpClient;
    }

    public void processCsv() {
        File inputFile = new File("用户输入.csv");
        File outputFile = new File("结果输出.csv");

        if (!inputFile.exists()) {
            log.error("输入文件不存在: {}", inputFile.getAbsolutePath());
            return;
        }

        try (Reader reader = new FileReader(inputFile);
             CSVReader csvReader = new CSVReader(reader);
             Writer writer = new FileWriter(outputFile);
             CSVWriter csvWriter = new CSVWriter(writer)) {

            List<String[]> rows = csvReader.readAll();
            log.info("CSV行数加载: {}", rows.size());

            // 输出表头
            List<String[]> result = new ArrayList<>();
            result.add(new String[]{"user_input", "amount", "from", "to", "converted"});

            // 从第二行开始处理（第一行为列名）
            for (int i = 1; i < rows.size(); i++) {
                String userInput = rows.get(i)[0];
                log.info("处理第{}行: {}", i, userInput);

                // 调用 LLM 解析自然语言 -> amount, from, to
                ExchangeRequest req = llmClient.askModelFromText(userInput);
                if (req == null) {
                    log.warn("第{}行 LLM 解析失败，跳过", i);
                    continue;
                }

                // 调用 MCP Server 计算兑换金额
                double converted = mcpClient.convert(req.getAmount(), req.getFrom(), req.getTo());

                // 写入输出 CSV
                result.add(new String[]{
                        userInput,
                        String.valueOf(req.getAmount()),
                        req.getFrom(),
                        req.getTo(),
                        String.valueOf(converted)
                });

                log.info("第{}行处理完成: {} {} -> {} = {}", i, req.getAmount(), req.getFrom(), req.getTo(), converted);
            }

            // 写出 CSV
            csvWriter.writeAll(result);
            log.info("CSV处理完成，输出文件: {}", outputFile.getAbsolutePath());

        } catch (Exception e) {
            log.error("CSV 处理异常", e);
        }
    }

}
```

## llmClient 大模型客户端

核心作用：通过用户自然语言，提取出对应的参数。

```java
@Component
public class LlmClientDeepSeek {
    private static final Logger log = LoggerFactory.getLogger(LlmClientDeepSeek.class);
    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${deepseek.api.key}")
    private String apiKey;

    private final McpClient mcpClient;

    public LlmClientDeepSeek(McpClient mcpClient) {
        this.mcpClient = mcpClient;
    }

    /**
     * 从自然语言文本解析出 amount/from/to
     */
    public CsvProcessor.ExchangeRequest askModelFromText(String text) throws IOException {
        log.info("发送 DeepSeek LLM 请求解析文本: {}", text);

        // 系统提示
        String systemPrompt = "你是一个货币兑换助手。请从用户输入中提取以下信息：\n" +
                "- amount: 兑换金额（数字）\n" +
                "- from: 源货币（使用标准3字母代码）\n" +
                "- to: 目标货币（使用标准3字母代码）\n\n" +
                "常见货币映射：\n" +
                "人民币/元/CNY → CNY\n" +
                "港元/港币/HKD → HKD\n" +
                "美元/美金/USD → USD\n" +
                "欧元/EUR → EUR\n" +
                "日元/JPY → JPY\n" +
                "英镑/GBP → GBP\n" +
                "澳元/AUD → AUD\n" +
                "加元/CAD → CAD\n" +
                "新加坡元/SGD → SGD\n" +
                "韩元/KRW → KRW";

        // 构造请求 JSON（用 Jackson 代替字符串拼接）
        ObjectNode root = mapper.createObjectNode();
        root.put("model", "deepseek-chat");

        // messages
        ArrayNode messages = root.putArray("messages");
        ObjectNode sys = messages.addObject();
        sys.put("role", "system");
        sys.put("content", systemPrompt);

        ObjectNode usr = messages.addObject();
        usr.put("role", "user");
        usr.put("content", text);

        // tools
        ArrayNode tools = root.putArray("tools");
        ObjectNode tool = tools.addObject();
        tool.put("type", "function");
        ObjectNode function = tool.putObject("function");
        function.put("name", "convert_currency");
        function.put("description", "从文本中提取货币兑换信息");

        // function parameters
        ObjectNode parameters = function.putObject("parameters");
        parameters.put("type", "object");
        ObjectNode props = parameters.putObject("properties");
        props.putObject("amount").put("type", "number").put("description", "兑换金额");
        props.putObject("from").put("type", "string").put("description", "源货币代码(CNY,HKD,USD等)");
        props.putObject("to").put("type", "string").put("description", "目标货币代码(CNY,HKD,USD等)");
        parameters.putArray("required").add("amount").add("from").add("to");

        // tool_choice
        ObjectNode toolChoice = root.putObject("tool_choice");
        toolChoice.put("type", "function");
        toolChoice.putObject("function").put("name", "convert_currency");

        String bodyJson = mapper.writeValueAsString(root);
        log.debug("DeepSeek 请求体: {}", bodyJson);

        RequestBody body = RequestBody.create(bodyJson, MediaType.get("application/json"));
        Request request = new Request.Builder()
                .url("https://api.deepseek.com/v1/chat/completions")
                .addHeader("Authorization", "Bearer " + apiKey)
                .addHeader("Content-Type", "application/json")
                .post(body)
                .build();

        try (Response response = client.newCall(request)
                .execute()) {
            if (!response.isSuccessful()) {
                log.error("DeepSeek LLM 请求失败，HTTP {}", response.code());
                return null;
            }
            String resp = response.body().string();
            log.debug("DeepSeek LLM 原始响应: {}", resp);

            JsonNode node = mapper.readTree(resp);

            // 根据 DeepSeek 返回结构取值
            JsonNode toolCalls = node.at("/choices/0/message/tool_calls");
            if (toolCalls.isMissingNode()) {
                toolCalls = node.at("/choices/0/messages/0/tool_calls"); // 兼容另一种格式
            }

            if (toolCalls.isMissingNode() || !toolCalls.isArray() || toolCalls.size() == 0) {
                log.warn("DeepSeek LLM 没有返回 tool_calls，尝试默认值 1/USD/USD");
                return new CsvProcessor.ExchangeRequest(1.0, "USD", "USD");
            }

            JsonNode argumentsNode = toolCalls.get(0).get("function").get("arguments");
            if (argumentsNode == null) {
                log.warn("DeepSeek LLM tool_call 没有返回 arguments");
                return new CsvProcessor.ExchangeRequest(1.0, "USD", "USD");
            }

            // arguments 可能是字符串，要转成 JSON
            JsonNode args;
            if (argumentsNode.isTextual()) {
                args = mapper.readTree(argumentsNode.asText());
            } else {
                args = argumentsNode;
            }

            double amount = args.has("amount") ? args.get("amount").asDouble() : 1.0;
            String from = args.has("from") ? args.get("from").asText().toUpperCase() : "USD";
            String to = args.has("to") ? args.get("to").asText().toUpperCase() : "USD";

            log.info("DeepSeek LLM 解析结果: amount={}, from={}, to={}", amount, from, to);
            return new CsvProcessor.ExchangeRequest(amount, from, to);
        }
    }
}
```

## McpClient 客户端

mcp 客户端的处理逻辑，调用服务端实现转换。

```java
@Component
public class McpClient {
    private static final Logger log = LoggerFactory.getLogger(McpClient.class);

    private final OkHttpClient client = new OkHttpClient();

    public double convert(double amount, String from, String to) throws IOException {
        String url = String.format("http://localhost:8080/mcp/convert?amount=%f&from=%s&to=%s",
                amount, from, to);
        Request request = new Request.Builder().url(url).get().build();

        try (Response response = client.newCall(request).execute()) {
            String body = response.body().string();
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(body);
            return node.get("converted").asDouble();
        }
    }

}
```

## McpServer 服务端

真实的处理逻辑，这里只是简单的汇率转换

```java
@RestController
@RequestMapping("/mcp")
public class McpServerController {
    private static final Logger log = LoggerFactory.getLogger(McpServerController.class);

    @GetMapping("/convert")
    public Map<String, Object> convert(@RequestParam double amount,
                                       @RequestParam String from,
                                       @RequestParam String to) {
        log.info("MCP Server received request: amount={}, from={}, to={}", amount, from, to);
        double converted = RateUtils.getRate(from, to) * amount;
        log.info("MCP Server calculated result: {} {} -> {} {}", amount, from, converted, to);

        Map<String, Object> result = new HashMap<>();
        result.put("amount", amount);
        result.put("from", from);
        result.put("to", to);
        result.put("converted", converted);
        return result;
    }

}
```


# 小结

整体实现并不难。

deepseek 的 api 也非常之便宜，感兴趣的小伙伴可以自己试一下。

* any list
{:toc}