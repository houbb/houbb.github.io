---
layout: post
title: test framework-12-测试平台聊一聊如何设计实现
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [junit, framework, open-source, plateform, test]
published: true
---

# 前言

测试平台最强大的一个设计应该是流程控制。

测试平台的用户群体是测试，知道一些简单的判断，但是编程能力一般。

所以我们需要设计一个流程控制的系列组件，让测试拥有近似于开发的编程能力。

# chat

# 执行树流程

```
流程图过于复杂了，我们用一个执行树的结构来替代。可以多级树设置实现对应的能力，要如何设计实现？包含前后端

核心能力：

1）基本流程控制：if else 循环等

2）核心调用插件能力：http 接口、dubbo 接口、SQL 执行、mq 请求、shell 脚本、grovvy 脚本、python 脚本...

3）文件能力：文件的上传、scp

4) 通知能力：sms phone email 
```

非常好，你的这个方向更清晰明确了 —— 你想基于一个\*\*「多级执行树结构」\*\*构建一个强大的、流程可控、插件丰富的自动化测试平台，前后端联动。

以下是完整的设计思路与实现细节建议，特别适合你当前一个人 Java + Vue 的全栈开发模式。

---

## ✅ 一、整体架构总览：执行树驱动的自动化平台

```
[Vue 前端执行树编辑器]
         │
         ▼
[Spring Boot 后端 API 服务]
         │
         ▼
[执行引擎：递归执行执行树 + 插件机制]  ← 插件类型支持：HTTP、Dubbo、SQL、MQ、脚本、通知...
```

---

## ✅ 二、执行树结构设计（后端 + 前端）

### 🌲 什么是执行树（Execution Tree）？

你可以把每个任务当作一颗树结构，每个节点表示一个**执行单元（Step）**，包含：

* 类型（如 HTTP、SQL、IF 等）
* 参数（配置）
* 子节点（下一个步骤）

### 示例 JSON 表达：

```json
{
  "type": "if",
  "name": "是否登录成功",
  "condition": "$.loginResult == true",
  "children": {
    "true": [
      {
        "type": "http",
        "name": "获取用户详情",
        "params": {
          "url": "http://api/user/info",
          "method": "GET",
          "headers": { "Authorization": "$.token" }
        }
      }
    ],
    "false": [
      {
        "type": "notify",
        "name": "发送失败通知",
        "params": {
          "email": "xxx@test.com",
          "subject": "登录失败",
          "body": "请查看日志"
        }
      }
    ]
  }
}
```

---

## ✅ 三、后端设计（Spring Boot）

### 💡 核心模块划分

| 模块     | 说明                            |
| ------ | ----------------------------- |
| 流程管理模块 | 管理树结构、保存/加载 JSON              |
| 执行引擎模块 | 遍历树结构，执行每个节点逻辑                |
| 插件机制   | 每种 type 由插件处理，独立扩展            |
| 变量上下文  | 支持变量提取与传递，表达式支持（推荐 MVEL、JEXL） |
| 报告模块   | 记录每一步执行情况、异常、输出数据             |

---

### ☕ Java 后端核心接口设计（插件执行）

```java
public interface NodeExecutor {
    boolean supports(String type);
    ExecutionResult execute(TreeNode node, ExecutionContext context);
}
```

* `TreeNode`: 表示当前节点的结构（type、params、子节点等）
* `ExecutionContext`: 上下文，存储变量、全局状态
* `ExecutionResult`: 本次节点执行结果，包括是否成功、是否继续执行、提取出的变量等

你只需要实现各类 `NodeExecutor` 插件，比如：

```java
@Component
public class HttpExecutor implements NodeExecutor {
    @Override
    public boolean supports(String type) {
        return "http".equals(type);
    }

    @Override
    public ExecutionResult execute(TreeNode node, ExecutionContext context) {
        // 取参数、替换变量、发 HTTP 请求、记录响应
        return new ExecutionResult(...);
    }
}
```

然后通过 `ExecutorRegistry` 自动注册/执行即可。

---

### 🌱 树结构递归执行引擎示意：

```java
public class ExecutionEngine {

    public void run(TreeNode root, ExecutionContext context) {
        NodeExecutor executor = executorRegistry.get(root.getType());
        ExecutionResult result = executor.execute(root, context);

        if (!result.shouldContinue()) return;

        for (TreeNode child : root.getChildren()) {
            run(child, context);
        }
    }
}
```

---

## ✅ 四、前端设计（Vue）

### 🌳 执行树编辑器（轻量版本）

#### UI 实现方式建议：

* Vue + Element Plus + 树结构组件（如 `el-tree`, `vue-draggable-tree`, 或自定义）
* 每个节点支持：编辑类型、输入参数、表达式条件、子节点拖拽排序
* 表单动态渲染：根据节点 `type` 展示不同参数组件（http 请求参数、SQL、通知等）

#### 树结构维护示例：

```ts
interface TreeNode {
  id: string;
  type: string;
  name: string;
  params: Record<string, any>;
  children?: TreeNode[];
}
```

你可以将树结构实时转 JSON，提交到后端执行。

---

## ✅ 五、核心插件支持类型设计

| 类型              | 用法场景        | 参数设计                             |
| --------------- | ----------- | -------------------------------- |
| `http`          | 调用接口        | method, url, headers, body, 断言   |
| `sql`           | 执行数据库语句     | datasource, sql, 变量提取            |
| `dubbo`         | 泛化调用        | interface, method, params        |
| `mq`            | 发送/消费消息     | topic, content, groupId          |
| `shell`         | 执行 Linux 命令 | command, workingDir              |
| `groovy/python` | 自定义脚本       | code, 输入输出变量                     |
| `scp`           | 文件上传下载      | host, user, password, remotePath |
| `file-upload`   | 上传测试数据文件    | 通过 Vue 实现文件选择，后台存储               |
| `notify`        | 发送通知        | email, sms, webhook, 飞书机器人等      |

---

## ✅ 六、上下文变量与表达式系统

* 所有执行结果的输出都可放入 `ExecutionContext` 中，供后续节点引用
* 支持表达式语法如：

  * `${token}`、`${context.varName}`、`${$.response.data.id}`
* 表达式引擎建议：

  * Java 推荐使用：**[MVEL](https://github.com/mvel/mvel)** 或 **Apache JEXL**

---

## ✅ 七、通知能力支持

| 通道       | 说明                     |
| -------- | ---------------------- |
| Email    | JavaMailSender，支持 SMTP |
| SMS      | 阿里云短信、腾讯云短信            |
| Phone/语音 | 阿里云语音通知（也可用外部 API）     |
| Webhook  | 企业微信、钉钉、飞书机器人          |

每种通知封装成插件即可调用。

---

## ✅ 八、执行结果与报告设计

* 每个节点执行完成后记录：开始时间、耗时、输入、输出、是否成功、异常堆栈等
* 可以前端树形回放（每个节点有 ✅ / ❌，展开看详情）

---

## ✅ 九、推荐开发顺序（适合你一个人）

1. ✅ 执行树数据结构 + JSON 存储/解析
2. ✅ 基础执行器：`http/sql/if/notify`
3. ✅ Vue 页面：树形结构 + 编辑器 + 流程预览
4. ✅ 上下文变量与提取机制
5. ✅ 报告与历史运行记录
6. ✅ 插件持续扩展（dubbo/mq/python/文件）

---

## ✅ 十、可选加分点

* 多环境变量支持（QA, PROD）
* 流程回放 / 克隆运行
* 错误截图 / 告警自愈建议
* 权限系统（未来支持团队协作）

---

如果你需要，我可以立即为你生成：

* 🌱 执行树的 Java 类定义 + 样例执行器
* 🌱 Vue 执行树编辑器 demo（拖拽 + 表单编辑）
* 🌱 样例执行流程 JSON（支持 IF/HTTP/SQL/通知）

你想从哪个模块开始搭建？我可以按你选的模块帮你生成代码骨架。






# 参考资料

https://github.com/metersphere/metersphere

* any list
{:toc}