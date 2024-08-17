---
layout: post
title: Ajax 的替代方案-fetch 标准
date:  2020-3-27 17:53:59 +0800
categories: [HTML]
tags: [html, js, sh]
published: true
---

### 1. 前言

从高层次来看，获取资源是一个相当简单的操作。请求发出，响应返回。然而，这一操作的细节相当复杂，过去通常没有被仔细记录，并且在不同的 API 之间有所不同。

许多 API 提供了获取资源的能力，例如 HTML 的 `<img>` 和 `<script>` 元素，CSS 的 `cursor` 和 `list-style-image`，JavaScript 的 `navigator.sendBeacon()` 和 `self.importScripts()` API。Fetch 标准提供了一个统一的架构，使这些功能在各种获取方面（如重定向和 CORS 协议）保持一致。

Fetch 标准还定义了 `fetch()` JavaScript API，该 API 在相对较低的抽象层次上暴露了大部分网络功能。

### 2. 基础设施

本规范依赖于 Infra 标准。[INFRA]

本规范使用了来自 ABNF、编码、HTML、HTTP、MIME 检测、Streams、URL、Web IDL 和 WebSockets 的术语。[ABNF] [ENCODING] [HTML] [HTTP] [MIMESNIFF] [STREAMS] [URL] [WEBIDL] [WEBSOCKETS]

ABNF 指的是由 HTTP（特别是添加了 # 的部分）和 RFC 7405 扩展的 ABNF。[RFC7405]

凭证是 HTTP cookies、TLS 客户端证书和认证条目（用于 HTTP 认证）。[COOKIES] [TLS] [HTTP]

`fetch params` 是一个用于 `fetch` 算法的簿记细节的结构体。它包含以下项目：

- `request`：一个请求。
- `process request body chunk length`（默认值为 null）：处理请求体块长度。
- `process request end-of-body`（默认值为 null）：处理请求体结束。
- `process early hints response`（默认值为 null）：处理早期提示响应。
- `process response`（默认值为 null）：处理响应。
- `process response end-of-body`（默认值为 null）：处理响应体结束。
- `process response consume body`（默认值为 null）：处理响应体消费。
- `task destination`（默认值为 null）：目标，可能是 null、全局对象或并行队列。
- `cross-origin isolated capability`（默认值为 false）：跨源隔离能力，布尔值。
- `controller`（默认值为新建的 fetch controller）：一个 fetch 控制器。
- `timing info`：一个 fetch 时间信息。
- `preloaded response candidate`（默认值为 null）：预加载的响应候选项，可能是 null、"pending" 或响应。

`fetch controller` 是一个结构体，用于使 `fetch` 的调用者在开始之后对其执行某些操作。它包含以下项目：

- `state`（默认值为 "ongoing"）：状态，可能是 "ongoing"、"terminated" 或 "aborted"。
- `full timing info`（默认值为 null）：完整时间信息，可能是 null 或 fetch 时间信息。
- `report timing steps`（默认值为 null）：报告时间步骤，可能是 null 或接受全局对象的算法。
- `serialized abort reason`（默认值为 null）：序列化的中止原因，可能是 null 或结构化序列化的记录。
- `next manual redirect steps`（默认值为 null）：下一步手动重定向步骤，可能是 null 或不接受任何内容的算法。

要报告给定全局对象的 fetch 控制器的时间：

- 断言：控制器的报告时间步骤不能为空。
- 调用控制器的报告时间步骤，传入全局对象。

要处理 fetch 控制器的下一个手动重定向：

- 断言：控制器的下一个手动重定向步骤不能为空。
- 调用控制器的下一个手动重定向步骤。

要提取 fetch 控制器的完整时间信息：

- 断言：控制器的完整时间信息不能为空。
- 返回控制器的完整时间信息。

要中止 fetch 控制器（可选地传递错误）：

- 将控制器的状态设置为 "aborted"。
- 如果没有给定错误，设置 fallbackError 为 "AbortError" DOMException。
- 将错误设置为 fallbackError（如果没有给定错误）。
- 将序列化错误设置为 StructuredSerialize(error)。如果抛出异常，捕获它，并将序列化错误设置为 StructuredSerialize(fallbackError)。
- 将控制器的序列化中止原因设置为序列化错误。

要反序列化序列化的中止原因，给定 null 或记录 abortReason 和领域 realm：

- 设 fallbackError 为 "AbortError" DOMException。
- 将 deserializedError 设为 fallbackError。
- 如果 abortReason 不为 null，则将 deserializedError 设置为 StructuredDeserialize(abortReason, realm)。如果抛出异常或返回 undefined，则将 deserializedError 设置为 fallbackError。
- 返回 deserializedError。

要终止 fetch 控制器，将控制器的状态设置为 "terminated"。

如果 fetch 参数的控制器状态为 "aborted"，则该 fetch 参数被中止。

如果 fetch 参数的控制器状态为 "aborted" 或 "terminated"，则该 fetch 参数被取消。

`fetch timing info` 是一个结构体，用于维护 Resource Timing 和 Navigation Timing 所需的时间信息。它包含以下项目：[RESOURCE-TIMING] [NAVIGATION-TIMING]

- `start time`（默认值为 0）：开始时间。
- `redirect start time`（默认值为 0）：重定向开始时间。
- `redirect end time`（默认值为 0）：重定向结束时间。
- `post-redirect start time`（默认值为 0）：重定向后的开始时间。
- `final service worker start time`（默认值为 0）：最终服务工作者开始时间。
- `final network-request start time`（默认值为 0）：最终网络请求开始时间。
- `first interim network-response start time`（默认值为 0）：首次中间网络响应开始时间。
- `final network-response start time`（默认值为 0）：最终网络响应开始时间。
- `end time`（默认值为 0）：结束时间。

`final connection timing info`（默认值为 null）：最终连接时间信息，可能为 null 或连接时间信息。

`server-timing headers`（默认值为 « »）：服务器时间头部的列表，可能是一个字符串列表。

`render-blocking`（默认值为 false）：渲染阻塞，布尔值。

`response body info` 是一个结构体，用于维护 Resource Timing 和 Navigation Timing 所需的响应体信息。它包含以下项目：[RESOURCE-TIMING] [NAVIGATION-TIMING]

- `encoded size`（默认值为 0）：编码大小。
- `decoded size`（默认值为 0）：解码大小。
- `content type`（默认值为空字符串）：内容类型，ASCII 字符串。

要创建一个不透明的时间信息，给定一个 fetch 时间信息 `timingInfo`，返回一个新的 fetch 时间信息，其开始时间和重定向后开始时间与 `timingInfo` 的开始时间相同。

要排队一个 fetch 任务，给定一个算法 `algorithm` 和一个全局对象或并行队列 `taskDestination`，执行以下步骤：

- 如果 `taskDestination` 是一个并行队列，则将算法排队到 `taskDestination`。
- 否则，将全局任务排队到网络任务源，目标是 `taskDestination` 和 `algorithm`。

要序列化一个整数，将其表示为最短可能的十进制数字字符串。

这将由 Infra 中更具描述性的算法替换。请参见 infra/201。


### 2.1 URL

本地方案包括 "about"、"blob" 或 "data"。

如果 URL 的方案是本地方案，则该 URL 被认为是本地的。

这个定义也被引用政策（Referrer Policy）所使用。[REFERRER]

HTTP(S) 方案是 "http" 或 "https"。

获取方案（fetch scheme）包括 "about"、"blob"、"data"、"file" 或 HTTP(S) 方案。

HTTP(S) 方案和获取方案也被 HTML 所使用。[HTML]

### 2.2 HTTP

虽然获取（fetch）涵盖的内容不仅仅是 HTTP，但它借用了许多 HTTP 的概念，并将这些概念应用于通过其他方式获得的资源（例如数据 URL）。

HTTP 制表符或空格是 U+0009 TAB 或 U+0020 SPACE。

HTTP 空白字符是 U+000A LF、U+000D CR，或 HTTP 制表符或空格。

HTTP 空白字符仅对某些特定的结构有用，这些结构在 HTTP 头之外的上下文中会被重用（例如 MIME 类型）。对于 HTTP 头值，建议使用 HTTP 制表符或空格，在其他上下文中则建议使用 ASCII 空白字符。与 ASCII 空白字符不同，这排除了 U+000C FF。

HTTP 换行字节是 0x0A (LF) 或 0x0D (CR)。

HTTP 制表符或空格字节是 0x09 (HT) 或 0x20 (SP)。

HTTP 空白字节是 HTTP 换行字节或 HTTP 制表符或空格字节。

要从字符串输入中收集 HTTP 引号字符串，给定一个位置变量 `position` 和一个可选的布尔值 `extract-value`（默认为 false）：

1. 设定 `positionStart` 为 `position`。

2. 设定 `value` 为空字符串。

3. 断言：输入中 `position` 处的代码点是 U+0022 (")。

4. 将 `position` 增加 1。

5. 当条件为真时：

   - 从输入中收集一系列不是 U+0022 (") 或 U+005C (\) 的代码点，追加到 `value` 中。

   - 如果 `position` 超过输入末尾，则跳出循环。

   - 设定 `quoteOrBackslash` 为输入中 `position` 处的代码点。

   - 将 `position` 增加 1。

   - 如果 `quoteOrBackslash` 是 U+005C (\)，则：

     - 如果 `position` 超过输入末尾，则将 U+005C (\) 追加到 `value` 中，并跳出循环。

     - 将输入中 `position` 处的代码点追加到 `value` 中。

     - 将 `position` 增加 1。

   - 否则：

     - 断言：`quoteOrBackslash` 是 U+0022 (")。

     - 跳出循环。

6. 如果 `extract-value` 为 true，则返回 `value`。

7. 返回从 `positionStart` 到 `position`（包括 `position`）之间的代码点。

#### 示例

| 输入                    | 输出                       | 设置 `extract-value` 为 true 的输出 | 最终位置变量值 |
|-------------------------|----------------------------|-----------------------------------|----------------|
| `""\"`                  | `""\"`                     | `\"`                              | 2              |
| `""Hello" World"`       | `""Hello""`                | `"Hello"`                          | 7              |
| `""Hello \\ World\"""`  | `""Hello \\ World\"""`     | `"Hello \ World""`                 | 18             |

在这些示例中，位置变量总是从 0 开始。


### 2.2.1 方法

方法是一个字节序列，它匹配方法标记的生成规则。

CORS 安全白名单方法是指 `GET`、`HEAD` 或 `POST`。

被禁止的方法是指与 `CONNECT`、`TRACE` 或 `TRACK` 不区分字节大小写的匹配的方法。[HTTPVERBSEC1]、[HTTPVERBSEC2]、[HTTPVERBSEC3]

为了规范化方法，如果它与 `DELETE`、`GET`、`HEAD`、`OPTIONS`、`POST` 或 `PUT` 不区分字节大小写的匹配，则将其转为字节大写。

规范化是为了向后兼容性和 API 一致性，因为方法实际上是“区分大小写”的。

使用 `patch` 很可能会导致 `405 Method Not Allowed` 错误。`PATCH` 更可能成功。

方法没有任何限制。`CHICKEN` 是完全可以接受的（并不是 `CHECKIN` 的拼写错误）。除了那些被规范化的方法外，没有其他的大小写限制。`Egg` 或 `eGg` 也可以，但为了保持一致性，建议使用大写字母。

### 2.2.2 头部

HTTP 通常将头部称为“字段”或“头字段”。Web 平台使用更口语化的术语“头部”。[HTTP]

头部列表是零个或多个头部的列表。初始值为 « »。

头部列表本质上是一个特殊的多重映射：一个有序的键值对列表，可能包含重复的键。由于除 `Set-Cookie` 之外的头部在暴露给客户端 JavaScript 时总是会合并，因此实现可以选择更高效的表示方式，只要它们也支持用于 `Set-Cookie` 头部的相关数据结构即可。

要根据头部名称 `name` 和头部列表 `list` 中的字符串类型获取结构化字段值，请执行以下步骤。这些步骤返回 null 或结构化字段值。

1. 断言：`type` 是 "dictionary"、"list" 或 "item" 之一。

2. 让 `value` 为从 `list` 中获取 `name` 的结果。

3. 如果 `value` 为 null，则返回 null。

4. 让 `result` 为解析结构化字段的结果，输入字符串设为 `value`，头部类型设为 `type`。

5. 如果解析失败，则返回 null。

6. 返回 `result`。

获取结构化字段值故意不区分头部缺失与其值无法解析为结构化字段值。这确保了在 Web 平台上的处理一致性。

要设置结构化字段值给定一个元组（头部名称 `name`、结构化字段值 `structuredValue`），在头部列表 `list` 中：

1. 让 `serializedValue` 为对 `structuredValue` 执行序列化结构化字段算法的结果。

2. 在 `list` 中设置 (name, serializedValue)。

结构化字段值定义为 HTTP 可以（最终）以有趣和高效的方式序列化的对象。目前，Fetch 仅支持字节序列作为头部值，这意味着这些对象只能通过序列化设置到头部列表中，并且只能通过解析从头部列表中获取。未来，这些对象可能会被保留为端到端的对象。[RFC8941]

一个头部列表 `list` 包含头部名称 `name` 如果 `list` 包含一个名称与 `name` 不区分字节大小写的匹配头部。

要从头部列表 `list` 中获取头部名称 `name`，请执行以下步骤。这些步骤返回 null 或头部值。

1. 如果 `list` 不包含 `name`，则返回 null。

2. 返回 `list` 中所有与 `name` 不区分字节大小写的匹配头部的值，以 0x2C 0x20（即逗号和空格）分隔，按顺序排列。

要获取、解码和拆分头部名称 `name` 从头部列表 `list` 中，执行以下步骤。这些步骤返回 null 或字符串列表。

1. 让 `value` 为从 `list` 中获取 `name` 的结果。

2. 如果 `value` 为 null，则返回 null。

3. 返回获取、解码和拆分 `value` 的结果。

以下是 `A` 作为名称参数的获取、解码和拆分函数的实际情况：

| 头部（网络传输形式）            | 输出                             |
|-------------------------------|----------------------------------|
| `A: nosniff,`                 | « "nosniff", "" »                 |
| `A: nosniff`                  | « "nosniff" »                     |
| `A: nosniff`                  | « "nosniff" »                     |
| `A:`                         | « "" »                           |
| `A: text/html;", x/x`         | « "text/html;", x/x" »            |
| `A: text/html;"`              | « "text/html;" »                  |
| `A: x/x`                      | « "x/x" »                         |
| `A: x/x;test="hi",y/y`        | « "x/x;test="hi"", "y/y" »        |
| `A: x/x;test="hi"`            | « "x/x;test="hi"" »              |
| `C: **bingo**`                | « "" »                           |
| `A: y/y`                      | « "y/y" »                         |
| `A: x / x,,,1`                | « "x / x", "", "", "1" »         |
| `A: x / x`                    | « "x / x" »                       |
| `A: ,`                        | « "" »                           |
| `A: 1`                        | « "1" »                           |
| `A: "1,2", 3`                 | « ""1,2"", "3" »                 |
| `A: "1,2"`                    | « "1,2" »                         |
| `D: 4`                        | « "" »                           |
| `A: 3`                        | « "3" »                           |

### 获取、解码和拆分头部值

要获取、解码和拆分头部值 `value`，执行以下步骤。这些步骤返回一个字符串列表。

1. 让 `input` 为 `value` 的同构解码结果。

2. 让 `position` 为 `input` 的位置变量，初始指向 `input` 的开始位置。

3. 让 `values` 为一个初始为空的字符串列表。

4. 让 `temporaryValue` 为一个空字符串。

5. 当 `position` 没有超过 `input` 的末尾时：

   - 将从 `input` 中收集的不是 U+0022 (") 或 U+002C (,) 的代码点序列的结果追加到 `temporaryValue` 中。
   - 结果可能是空字符串。
   - 如果 `position` 没有超过 `input` 的末尾，则：
     - 如果 `position` 位置的代码点是 U+0022 ("), 则：
       - 将从 `input` 中收集的 HTTP 引号字符串的结果追加到 `temporaryValue` 中。
       - 如果 `position` 位置没有超过 `input` 的末尾，则继续。
     - 否则：
       - 断言：`position` 位置的代码点是 U+002C (,)。
       - 将 `position` 向前移动 1。
       - 从 `temporaryValue` 的开始和结束处移除所有 HTTP 制表符或空格。
       - 将 `temporaryValue` 追加到 `values`。
       - 将 `temporaryValue` 设为空字符串。

6. 返回 `values`。

除了被祝福的调用点，以上算法不应被直接调用。请使用 `get`、`decode` 和 `split`。

### 向头部列表添加头部 (name, value)

要将头部 (name, value) 添加到头部列表 `list`：

1. 如果 `list` 包含 `name`，则将 `name` 设置为第一个匹配头部的名称。
   - 如果 `list` 中存在多个匹配的头部，它们的名称将全部相同。

2. 将 (name, value) 追加到 `list` 中。

### 从头部列表删除头部名称

要从头部列表 `list` 中删除头部名称 `name`，移除所有名称与 `name` 不区分字节大小写的匹配头部。

### 在头部列表中设置头部 (name, value)

要在头部列表 `list` 中设置头部 (name, value)：

1. 如果 `list` 包含 `name`，则将第一个匹配头部的值设置为 `value` 并移除其他头部。

2. 否则，将 (name, value) 追加到 `list` 中。

### 在头部列表中合并头部 (name, value)

要在头部列表 `list` 中合并头部 (name, value)：

1. 如果 `list` 包含 `name`，则将第一个匹配头部的值设置为其值，后跟 0x2C 0x20（即逗号和空格），然后再跟上 `value`。

2. 否则，将 (name, value) 追加到 `list` 中。

合并在 XMLHttpRequest 和 WebSocket 协议握手中使用。

### 将头部名称转换为排序后的小写集合

要将头部名称转换为排序的小写集合，给定头部名称列表 `headerNames`，执行以下步骤。这些步骤返回一个有序的头部名称集合。

1. 让 `headerNamesSet` 为一个新的有序集合。

2. 对于 `headerNames` 中的每个名称，将名称的字节小写结果追加到 `headerNamesSet` 中。

3. 返回将 `headerNamesSet` 按字节升序排序的结果。

### 对头部列表进行排序和合并

要对头部列表 `list` 进行排序和合并，执行以下步骤。这些步骤返回一个头部列表。

1. 让 `headers` 为一个头部列表。

2. 让 `names` 为将 `list` 中所有头部名称转换为排序的小写集合的结果。

3. 对于 `names` 中的每个名称：
   - 如果名称是 `set-cookie`，则：
     - 让 `values` 为 `list` 中所有与 `name` 不区分字节大小写的匹配头部的所有值，按顺序排列。
     - 对于 `values` 中的每个值：
       - 将 (name, value) 追加到 `headers` 中。
   - 否则：
     - 让 `value` 为从 `list` 中获取 `name` 的结果。
     - 断言：`value` 不为 null。
     - 将 (name, value) 追加到 `headers` 中。

4. 返回 `headers`。

### 头部

一个头部是一个由名称（头部名称）和值（头部值）组成的元组。

头部名称是一个字节序列，它匹配字段名称标记生成规则。

头部值是一个字节序列，它符合以下条件：

- 没有前导或尾部 HTTP 制表符或空格字节。
- 不包含 0x00 (NUL) 或 HTTP 换行字节。

头部值的定义不是基于字段值标记生成规则，因为它不兼容已部署的内容。

### 规范化字节序列

要规范化字节序列 `potentialValue`，移除 `potentialValue` 中的所有前导和尾部 HTTP 空白字节。

### 确定头部是否为 CORS 安全白名单请求头

要确定头部 (name, value) 是否为 CORS 安全白名单请求头，执行以下步骤：

1. 如果 `value` 的长度大于 128，则返回 false。

2. 将 `name` 转为字节小写并根据结果进行判断：

   - `accept`
     - 如果 `value` 包含 CORS 不安全请求头字节，则返回 false。

   - `accept-language`
   - `content-language`
     - 如果 `value` 包含一个不在 0x30 (0) 到 0x39 (9) 的范围内的字节，不在 0x41 (A) 到 0x5A (Z) 的范围内，不在 0x61 (a) 到 0x7A (z) 的范围内，并且不是 0x20 (SP)、0x2A (*)、0x2C (,)、0x2D (-)、0x2E (.)、0x3B (;) 或 0x3D (=)，则返回 false。

   - `content-type`
     - 如果 `value` 包含 CORS 不安全请求头字节，则返回 false。
     - 让 `mimeType` 为解析 `value` 的同构解码结果。
     - 如果 `mimeType` 解析失败，则返回 false。
     - 如果 `mimeType` 的本质不是 "application/x-www-form-urlencoded"、"multipart/form-data" 或 "text/plain"，则返回 false。
     - 这故意不使用提取 MIME 类型，因为该算法比较宽松，服务器不期望实现它。
     - 如果使用提取 MIME 类型，以下请求将不会导致 CORS 预检，并且服务器上的天真的解析器可能将请求体视为 JSON：

     ```javascript
     fetch("https://victim.example/naïve-endpoint", {
       method: "POST",
       headers: [
         ["Content-Type", "application/json"],
         ["Content-Type", "text/plain"]
       ],
       credentials: "include",
       body: JSON.stringify(exerciseForTheReader)
     });
     ```

   - `range`
     - 让 `rangeValue` 为解析单个范围头部值的结果，给定 `value` 和 false。
     - 如果 `rangeValue` 解析失败，则返回 false。
     - 如果 `rangeValue[0]` 为 null，则返回 false。
     - 由于 web 浏览器历史上没有发出如 `bytes=-500` 的范围，这个算法不将它们列入白名单。
     - 否则返回 false。
     - 返回 true。

   有限的例外情况适用于 `Content-Type` 头部的白名单，如 CORS 协议异常所记录。

### CORS 不安全请求头字节

CORS 不安全请求头字节是指以下条件之一为真的字节 `byte`：

- `byte` 小于 0x20 且不是 0x09 HT。
- `byte` 是 0x22 (")、0x28 (左括号)、0x29 (右括号)、0x3A (:)、0x3C (<)、0x3E (>)、0x3F (?)、0x40 (@)、0x5B ([)、0x5C (\)、0x5D (])、0x7B ({)、0x7D (}) 或 0x7F DEL。

### CORS 不安全请求头名称

给定头部列表 `headers`，CORS 不安全请求头名称的确定方法如下：

1. 让 `unsafeNames`

 为一个新的列表。

2. 让 `potentiallyUnsafeNames` 为一个新的列表。

3. 让 `safelistValueSize` 为 0。

4. 对于每个头部 `headers`：
   - 如果头部不是 CORS 安全白名单请求头，则将头部名称追加到 `unsafeNames`。
   - 否则，将头部名称追加到 `potentiallyUnsafeNames` 并将 `safelistValueSize` 增加头部值的长度。

5. 如果 `safelistValueSize` 大于 1024，则对于每个名称的 `potentiallyUnsafeNames`，将名称追加到 `unsafeNames`。

6. 返回将 `unsafeNames` 转换为排序的小写集合的结果。

### CORS 非通配符请求头名称

CORS 非通配符请求头名称是指与 `Authorization` 不区分字节大小写的匹配头部名称。

### 特权非 CORS 请求头名称

特权非 CORS 请求头名称是与以下之一不区分字节大小写的头部名称：

- `Range`。

这些是可以由特权 API 设置的头部，并且在其相关请求对象被复制时将被保留，但如果请求被非特权 API 修改则会被移除。

`Range` 头部通常用于下载和媒体获取。

### 辅助函数：为请求添加范围头部

一个辅助函数用于将范围头部添加到特定请求。

### CORS 安全白名单响应头名称

给定头部名称列表 `list`，CORS 安全白名单响应头名称是与以下之一不区分字节大小写的头部名称：

- `Cache-Control`
- `Content-Language`
- `Content-Length`
- `Content-Type`
- `Expires`
- `Last-Modified`
- `Pragma`

任何列表中不被禁止的响应头名称。

### 非 CORS 安全白名单请求头名称

非 CORS 安全白名单请求头名称是与以下之一不区分字节大小写的头部名称：

- `Accept`
- `Accept-Language`
- `Content-Language`
- `Content-Type`

### 确定头部是否为非 CORS 安全白名单请求头

要确定头部 (name, value) 是否为非 CORS 安全白名单请求头，执行以下步骤：

1. 如果 `name` 不是非 CORS 安全白名单请求头名称，则返回 false。

2. 返回头部 (name, value) 是否为 CORS 安全白名单请求头。

### 禁止请求头

如果头部 (name, value) 是禁止的请求头，则这些步骤将返回 true：

1. 如果 `name` 与以下之一不区分字节大小写，则返回 true：
   - `Accept-Charset`
   - `Accept-Encoding`
   - `Access-Control-Request-Headers`
   - `Access-Control-Request-Method`
   - `Connection`
   - `Content-Length`
   - `Cookie`
   - `Cookie2`
   - `Date`
   - `DNT`
   - `Expect`
   - `Host`
   - `Keep-Alive`
   - `Origin`
   - `Referer`
   - `Set-Cookie`
   - `TE`
   - `Trailer`
   - `Transfer-Encoding`
   - `Upgrade`
   - `Via`

2. 如果 `name` 转为字节小写后以 `proxy-` 或 `sec-` 开头，则返回 true。

3. 如果 `name` 与以下之一不区分字节大小写，则：
   - `X-HTTP-Method`
   - `X-HTTP-Method-Override`
   - `X-Method-Override`

   - 让 `parsedValues` 为获取、解码和拆分 `value` 的结果。

   - 对于每个 `parsedValues` 的方法：如果同构编码的 `method` 是禁止方法，则返回 true。

4. 返回 false。

这些是禁止的，以便用户代理保持完全控制。

以 `Sec-` 开头的头部名称保留以允许新头部的发行，这些新头部在使用 fetch 的 API 中允许开发人员控制头部时是安全的，例如 XMLHttpRequest。 [XHR]

`Set-Cookie` 头部语义上是响应头部，因此在请求中没有用处。由于 `Set-Cookie` 头部不能合并，因此它们需要在 Headers 对象中更复杂的处理。在这里禁止它是为了避免将这种复杂性泄漏到请求中。

### 禁止响应头名称

禁止响应头名称是与以下之一不区分字节大小写的头部名称：

- `Set-Cookie`
- `Set-Cookie2`

### 请求体头部名称

请求体头部名称是与以下之一不区分字节大小写的头部名称：

- `Content-Encoding`
- `Content-Language`
- `Content-Location`
- `Content-Type`

### 提取头部值

根据头部的名称提取头部值，执行以下步骤：

1. 如果解析头部值时，按照头部名称的 ABNF 规则失败，则返回失败。
2. 根据头部名称的 ABNF 规则，返回解析头部值得到的一个或多个值。

### 提取头部列表值

根据头部名称 `name` 和头部列表 `list` 提取头部列表值，执行以下步骤：

1. 如果列表中不包含名称 `name`，则返回 null。
2. 如果名称 `name` 的 ABNF 规则只允许一个头部，但列表中包含多个，则返回失败。
3. 如果需要不同的错误处理，首先提取所需的头部。
4. 让 `values` 为空列表。
5. 对于列表中包含名称 `name` 的每个头部 `header`：
   - 让 `extract` 为从头部 `header` 中提取的头部值的结果。
   - 如果 `extract` 为失败，则返回失败。
   - 将 `extract` 中的每个值按顺序附加到 `values`。
6. 返回 `values`。

### 构建内容范围

根据整数 `rangeStart`、整数 `rangeEnd` 和整数 `fullLength` 构建内容范围，执行以下步骤：

1. 让 `contentRange` 为 `bytes `。
2. 将 `rangeStart` 序列化并以同构编码追加到 `contentRange`。
3. 将 0x2D（-）追加到 `contentRange`。
4. 将 `rangeEnd` 序列化并以同构编码追加到 `contentRange`。
5. 将 0x2F（/）追加到 `contentRange`。
6. 将 `fullLength` 序列化并以同构编码追加到 `contentRange`。
7. 返回 `contentRange`。

### 解析单个范围头部值

根据字节序列 `value` 和布尔值 `allowWhitespace` 解析单个范围头部值，执行以下步骤：

1. 让 `data` 为 `value` 的同构解码。
2. 如果 `data` 不以 "bytes" 开头，则返回失败。
3. 让 `position` 为 `data` 的位置变量，最初指向 `data` 的第 5 个字符位置。
4. 如果 `allowWhitespace` 为 true，从 `data` 中收集一系列 HTTP 制表符或空格的字符，起始位置为 `position`。
5. 如果 `data` 中 `position` 处的字符不是 U+003D（=），则返回失败。
6. 将 `position` 向前移动 1。
7. 如果 `allowWhitespace` 为 true，从 `data` 中收集一系列 HTTP 制表符或空格的字符，起始位置为 `position`。
8. 让 `rangeStart` 为从 `data` 中收集的一系列 ASCII 数字字符，起始位置为 `position`。
9. 如果 `rangeStart` 不是空字符串，则将 `rangeStart` 解释为十进制数，得到 `rangeStartValue`；否则为 null。
10. 如果 `allowWhitespace` 为 true，从 `data` 中收集一系列 HTTP 制表符或空格的字符，起始位置为 `position`。
11. 如果 `data` 中 `position` 处的字符不是 U+002D（-），则返回失败。
12. 将 `position` 向前移动 1。
13. 如果 `allowWhitespace` 为 true，从 `data` 中收集一系列 HTTP 制表符或空格的字符，起始位置为 `position`。
14. 让 `rangeEnd` 为从 `data` 中收集的一系列 ASCII 数字字符，起始位置为 `position`。
15. 如果 `rangeEnd` 不是空字符串，则将 `rangeEnd` 解释为十进制数，得到 `rangeEndValue`；否则为 null。
16. 如果 `position` 没有超出 `data` 的末尾，则返回失败。
17. 如果 `rangeEndValue` 和 `rangeStartValue` 都为 null，则返回失败。
18. 如果 `rangeStartValue` 和 `rangeEndValue` 都是数字，并且 `rangeStartValue` 大于 `rangeEndValue`，则返回失败。
19. 返回 `(rangeStartValue, rangeEndValue)`。

范围结束或开始可以省略，例如 `bytes=0-` 或 `bytes=-500` 是有效范围。

解析单个范围头部值成功地覆盖了允许的范围头部值的子集，但这是用户代理在请求媒体或恢复下载时最常使用的格式。这种范围头部值的格式可以通过添加范围头部来设置。

### 默认 `User-Agent` 值

默认的 `User-Agent` 值是为 `User-Agent` 头部定义的实现特定头部值。

### 文档 `Accept` 头部值

文档的 `Accept` 头部值是 `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`。

### 2.2.3 状态码

状态码是范围在 0 到 999 之间的整数（包括 0 和 999）。

有关将 HTTP/1 的状态码映射到这一概念的各种边缘情况，参见问题 #1156。

- **空体状态码** 是指状态码为 101、103、204、205 或 304 的状态码。
- **成功状态码** 是指状态码在 200 到 299 之间（包括 200 和 299）的状态码。
- **重定向状态码** 是指状态码为 301、302、303、307 或 308 的状态码。

### 2.2.4 请求体

请求体包括：

- 一个流（一个 ReadableStream 对象）。
- 一个来源（null、字节序列、Blob 对象或 FormData 对象），初始值为 null。
- 一个长度（null 或整数），初始值为 null。

**克隆请求体**

要克隆请求体 `body`，执行以下步骤：

1. 让 « out1, out2 » 为 `body` 流的 tee 操作结果。
2. 将 `body` 的流设置为 `out1`。
3. 返回一个新请求体，其流为 `out2`，其他成员与原 `body` 相同。

**获取字节序列请求体**

要将字节序列 `bytes` 转换为请求体，返回安全提取字节序列 `bytes` 的请求体。

**增量读取请求体**

要增量读取请求体 `body`，给定算法 `processBodyChunk`、`processEndOfBody`、`processBodyError`，以及一个可选的 `taskDestination`（默认为 null），执行以下步骤：

- `processBodyChunk` 必须是一个接受字节序列的算法。
- `processEndOfBody` 必须是一个不接受参数的算法。
- `processBodyError` 必须是一个接受异常的算法。

如果 `taskDestination` 为 null，则将 `taskDestination` 设置为启动新并行队列的结果。

1. 获取 `body` 流的读取器，并将其赋值给 `reader`。
2. 这个操作不会抛出异常。
3. 执行增量读取循环，给定 `reader`、`taskDestination`、`processBodyChunk`、`processEndOfBody` 和 `processBodyError`。

**执行增量读取循环**

给定一个 `ReadableStreamDefaultReader` 对象 `reader`、并行队列或全局对象 `taskDestination`、算法 `processBodyChunk`、算法 `processEndOfBody` 和算法 `processBodyError`，执行以下步骤：

1. 设定 `readRequest` 为以下读取请求：
   - **chunk steps**，给定 chunk
   - 设定 `continueAlgorithm` 为 null。

2. 如果 `chunk` 不是 `Uint8Array` 对象，则将 `continueAlgorithm` 设定为以下步骤：运行 `processBodyError`，给定一个 `TypeError`。

3. 否则：
   - 让 `bytes` 为 `chunk` 的副本。
   - 强烈建议实现使用避免这种副本的实现策略（如果可能）。
   - 设定 `continueAlgorithm` 为以下步骤：
     - 运行 `processBodyChunk`，给定 `bytes`。
     - 执行增量读取循环，给定 `reader`、`taskDestination`、`processBodyChunk`、`processEndOfBody` 和 `processBodyError`。
     - 将 `continueAlgorithm` 排队到 `taskDestination`。
   - **close steps**：
     - 将 `processEndOfBody` 排队到 `taskDestination`。
   - **error steps**，给定 `e`：
     - 将 `processBodyError` 排队到 `taskDestination`，传递 `e`。

4. 从 `reader` 读取一个 chunk，给定 `readRequest`。

**完全读取请求体**

要完全读取请求体 `body`，给定算法 `processBody`、算法 `processBodyError` 和可选的 `taskDestination`（默认为 null），执行以下步骤：

- `processBody` 必须是一个接受字节序列的算法。
- `processBodyError` 必须是一个可选地接受异常的算法。

1. 如果 `taskDestination` 为 null，则将 `taskDestination` 设置为启动新并行队列的结果。
2. 设定成功步骤 `successSteps` 为：将任务排队以在 `taskDestination` 上运行 `processBody`，传递字节序列 `bytes`。
3. 设定错误步骤 `errorSteps` 为：将任务排队以在 `taskDestination` 上运行 `processBodyError`，传递异常 `exception`。
4. 获取 `body` 流的读取器。如果这抛出了异常，则用该异常运行 `errorSteps` 并返回。
5. 从 `reader` 中读取所有字节，给定 `successSteps` 和 `errorSteps`。

**请求体与类型**

一个带类型的请求体是一个元组，包括一个请求体（body）和一个类型（header 值或 null）。

**处理内容编码**

要处理给定编码 `codings` 和字节序列 `bytes` 的内容编码，执行以下步骤：

1. 如果 `codings` 不被支持，则返回字节序列 `bytes`。
2. 返回使用 `codings` 解码字节序列 `bytes` 的结果（如果解码没有产生错误），否则返回失败。

### 2.2.5 请求

本节详细描述了请求的工作原理。开始时，请参见“设置请求”。

**请求的输入** 是一个请求对象。

- **请求的相关方法**（method）是一个方法。除非另有说明，否则默认为 `GET`。
  - 在重定向过程中，这可能会被更新为 `GET`，具体描述见 HTTP fetch。

- **请求的相关 URL**（URL）是一个 URL。
  - 实现者被鼓励将其设为请求 URL 列表中的第一个 URL 的指针。它作为一个单独的字段提供，仅为其他标准在 Fetch 中方便使用。

- **请求的相关本地 URL 仅限标志**（local-URLs-only flag）。除非另有说明，否则为未设置。

- **请求的相关头部列表**（header list）是一个头部列表。除非另有说明，否则默认为 « »。

- **请求的相关不安全请求标志**（unsafe-request flag）。除非另有说明，否则为未设置。
  - 不安全请求标志由 `fetch()` 和 `XMLHttpRequest` 等 API 设置，以确保根据提供的方法和头部列表进行 CORS 预检请求。它并不免除 API 禁止使用被禁止的方法和请求头部。

- **请求的相关体**（body）可以是 null、字节序列或一个体。除非另有说明，否则默认为 null。
  - 字节序列将在 fetch 早期安全提取为一个体。在 HTTP fetch 的过程中，由于某些重定向，这个字段可能会被设置为 null。

- **请求的相关客户端**（client）可以是 null 或环境设置对象。

- **请求的相关保留客户端**（reserved client）可以是 null、环境或环境设置对象。除非另有说明，否则默认为 null。
  - 这仅用于导航请求和工作者请求，但不用于服务工作者请求。它引用一个导航请求的环境或工作者请求的环境设置对象。

- **请求的相关替换客户端 ID**（replaces client id）是一个字符串。除非另有说明，否则默认为空字符串。
  - 这仅用于导航请求。它是目标浏览上下文的活动文档环境设置对象的 ID。

- **请求的相关窗口**（window）可以是 "no-window"、"client" 或一个其全局对象是 Window 对象的环境设置对象。除非另有说明，否则默认为 "client"。
  - 在获取过程中，“client”值会变更为 “no-window” 或请求的客户端。这为标准提供了一个方便的方式，无需显式设置请求的窗口。

- **请求的相关 boolean keepalive**。除非另有说明，否则默认为 false。
  - 这可以用于允许请求超越环境设置对象的生命周期，例如，`navigator.sendBeacon()` 和 HTML img 元素使用它。将此设置为 true 的请求需要额外的处理要求。

- **请求的相关启动器类型**（initiator type）可以是 null、"audio"、"beacon"、"body"、"css"、"early-hints"、"embed"、"fetch"、"font"、"frame"、"iframe"、"image"、"img"、"input"、"link"、"object"、"ping"、"script"、"track"、"video"、"xmlhttprequest" 或 "other"。除非另有说明，否则默认为 null。 [RESOURCE-TIMING]

- **请求的相关服务工作者模式**（service-workers mode）可以是 "all" 或 "none"。除非另有说明，否则默认为 "all"。
  - 这决定了哪些服务工作者将接收此 fetch 的 fetch 事件。
  - **"all"**：相关服务工作者将获得此 fetch 的 fetch 事件。
  - **"none"**：没有服务工作者将获得此 fetch 的事件。

- **请求的相关启动器**（initiator）可以是空字符串、"download"、"imageset"、"manifest"、"prefetch"、"prerender" 或 "xslt"。除非另有说明，否则默认为空字符串。
  - 请求的启动器目前不特别细化，因为其他规范不要求这样做。它主要是一个规范设备，用于帮助定义 CSP 和混合内容。它不暴露给 JavaScript。 [CSP] [MIX]

- **请求的相关目标**（destination）可以是空字符串、"audio"、"audioworklet"、"document"、"embed"、"font"、"frame"、"iframe"、"image"、"json"、"manifest"、"object"、"paintworklet"、"report"、"script"、"serviceworker"、"sharedworker"、"style"、"track"、"video"、"webidentity"、"worker" 或 "xslt"。除非另有说明，否则默认为空字符串。
  - 这些在 `RequestDestination` 中体现，但 "serviceworker" 和 "webidentity" 作为目标的 fetch 会跳过服务工作者。

- 请求的目标是类似脚本的（script-like），如果它是 "audioworklet"、"paintworklet"、"script"、"serviceworker"、"sharedworker" 或 "worker"。
  - 使用脚本类似的算法时，还应考虑 "xslt"，因为它也可能导致脚本执行。它未包含在列表中，因为它不总是相关，并可能需要不同的行为。

**下表展示了请求的启动器、目标、CSP 指令和特性之间的关系。它不详尽地列出了所有特性。特性需要在其各自的标准中定义相关值。**

| 启动器         | 目标       | CSP 指令         | 特性                                                     |
|----------------|------------|------------------|----------------------------------------------------------|
| ""             | "report"    | —                | CSP、NEL 报告。                                          |
| "document"     |            | HTML 的导航算法（仅顶级）。 |
| "frame"        | "child-src" | HTML 的 <frame>  |                                                          |
| "iframe"       | "child-src" | HTML 的 <iframe> |                                                          |
| ""             | "connect-src" | navigator.sendBeacon()、EventSource、HTML 的 <a ping=""> 和 <area ping="">、fetch()、XMLHttpRequest、WebSocket、Cache API |                                          |
| "object"       | "object-src" | HTML 的 <object> |                                                          |
| "embed"        | "object-src" | HTML 的 <embed>  |                                                          |
| "audio"        | "media-src" | HTML 的 <audio>  |                                                          |
| "font"         | "font-src"  | CSS 的 @font-face |                                                          |
| "image"        | "img-src"   | HTML 的 <img src>、/favicon.ico 资源、SVG 的 <image>、CSS 的 background-image、CSS 的 cursor、CSS 的 list-style-image 等 |                                          |
| "audioworklet" | "script-src" | audioWorklet.addModule() |                                                          |
| "paintworklet" | "script-src" | CSS.paintWorklet.addModule() |                                                          |
| "script"       | "script-src" | HTML 的 <script>、importScripts() |                                                          |
| "serviceworker"| "child-src"、"script-src"、"worker-src" | navigator.serviceWorker.register() |                                          |
| "sharedworker" | "child-src"、"script-src"、"worker-src" | SharedWorker |                                                          |
| "webidentity"  | "connect-src" | Federated Credential Management 请求 |                                          |
| "worker"       | "child-src"、"script-src"、"worker-src" | Worker |                                                          |
| "json"         | "connect-src" | import "..." with { type: "json" } |                                          |
| "style"        | "style-src" | HTML 的 <link rel=stylesheet>、CSS 的 @import、import "..." with { type: "css" } |                                          |
| "track"        | "media-src" | HTML 的 <track>  |                                                          |
| "video"        | "media-src" | HTML 的 <video> 元素 |                                                          |
| "download"     | ""         | —                | HTML 的 download=""、"另存为..." UI                       |
| "imageset"     | "image"     | img-src          | HTML 的 <img srcset> 和 <picture>                          |
| "manifest"     | "manifest"  | manifest-src     | HTML 的 <link rel=manifest>                               |
| "prefetch"     | ""         | default-src（无特定指令） | HTML 的 <link rel=prefetch>                               |
| "prerender"    |            |                  | HTML 的 <link rel=prerender>                              |
| "xslt"         | "xslt"     | script-src       | <?xml-stylesheet>                                         |

CSP 的 form-action 需要直接挂钩到 HTML 的导航或表单提交算法中。

CSP 还需要检查请求的客户端的全局对象关联文档的祖先可导航性，以符合各种 CSP 指令。

### 2.2.5 请求（续）

- **请求的相关优先级**（priority）可以是 "high"、"low" 或 "auto"。除非另有说明，否则默认为 "auto"。

- **请求的相关内部优先级**（internal priority）可以是 null 或实现定义的对象。除非另有说明，否则默认为 null。

- **请求的相关来源**（origin）可以是 "client" 或一个来源。除非另有说明，否则默认为 "client"。
  - 在获取过程中，“client”会被更改为一个来源。它为标准提供了一种方便的方式，无需设置请求的来源。

- **请求的相关策略容器**（policy container）可以是 "client" 或一个策略容器。除非另有说明，否则默认为 "client"。
  - 在获取过程中，“client”会被更改为一个策略容器。它为标准提供了一种方便的方式，无需设置请求的策略容器。

- **请求的相关引用**（referrer）可以是 "no-referrer"、"client" 或一个 URL。除非另有说明，否则默认为 "client"。
  - 在获取过程中，“client”会被更改为 "no-referrer" 或一个 URL。它为标准提供了一种方便的方式，无需设置请求的引用。

- **请求的相关引用策略**（referrer policy）是一个引用策略。除非另有说明，否则默认为空字符串。 [REFERRER]
  - 这可以用于覆盖此请求所使用的引用策略。

- **请求的相关模式**（mode）可以是 "same-origin"、"cors"、"no-cors"、"navigate" 或 "websocket"。除非另有说明，否则默认为 "no-cors"。
  - **"same-origin"**：用于确保请求发往同源 URL。如果请求不是发往同源 URL，fetch 将返回网络错误。
  - **"cors"**：对于响应污染设置为 "cors" 的请求，将请求标记为 CORS 请求；在这种情况下，如果请求的资源不理解 CORS 协议，或者请求的资源故意不参与 CORS 协议，fetch 将返回网络错误。
  - **"no-cors"**：限制请求使用 CORS 安全列表方法和 CORS 安全列表请求头。成功后，fetch 将返回一个不透明的过滤响应。
  - **"navigate"**：这是仅在文档之间导航时使用的特殊模式。
  - **"websocket"**：这是仅在建立 WebSocket 连接时使用的特殊模式。
  - 尽管默认的请求模式是 "no-cors"，但标准强烈不建议在新功能中使用它，因为它不安全。

- **请求的相关使用 CORS 预检标志**（use-CORS-preflight flag）。除非另有说明，否则默认为未设置。
  - 设置使用 CORS 预检标志是导致进行 CORS 预检请求的几个条件之一。如果一个或多个事件监听器被注册在 `XMLHttpRequestUpload` 对象上，或者在请求中使用了 `ReadableStream` 对象，则会设置该标志。

- **请求的相关凭据模式**（credentials mode）可以是 "omit"、"same-origin" 或 "include"。除非另有说明，否则默认为 "same-origin"。
  - **"omit"**：从此请求中排除凭据，并忽略响应中发送回来的任何凭据。
  - **"same-origin"**：在对同源 URL 发出的请求中包括凭据，并使用从同源 URL 的响应中返回的任何凭据。
  - **"include"**：始终在此请求中包括凭据，并始终使用响应中返回的任何凭据。
  - 请求的凭据模式控制在 fetch 过程中的凭据流动。当请求的模式为 "navigate" 时，其凭据模式假定为 "include"，并且 fetch 目前不考虑其他值。如果 HTML 在这里发生变化，则此标准需要相应的更改。

- **请求的相关使用 URL 凭据标志**（use-URL-credentials flag）。除非另有说明，否则默认为未设置。
  - 当此标志设置时，当请求的 URL 包含用户名和密码，并且有可用的身份验证条目时，则 URL 的凭据优先于身份验证条目的凭据。现代规范避免设置此标志，因为 URL 中放置凭据是不鼓励的，但一些旧功能为了兼容性原因设置了它。

- **请求的相关缓存模式**（cache mode）可以是 "default"、"no-store"、"reload"、"no-cache"、"force-cache" 或 "only-if-cached"。除非另有说明，否则默认为 "default"。
  - **"default"**：fetch 将在网络访问时检查 HTTP 缓存。如果 HTTP 缓存中包含匹配的最新响应，则返回它。如果 HTTP 缓存中包含匹配的陈旧响应，则返回它，并进行有条件的网络获取以更新 HTTP 缓存中的条目。如果 HTTP 缓存中包含匹配的陈旧响应，则进行有条件的网络获取以更新 HTTP 缓存中的条目。否则，进行非条件的网络获取以更新 HTTP 缓存中的条目。 [HTTP] [HTTP-CACHING] [STALE-WHILE-REVALIDATE]
  - **"no-store"**：fetch 行为如同完全没有 HTTP 缓存。
  - **"reload"**：fetch 行为如同在网络访问时完全没有 HTTP 缓存。因此，它创建一个正常请求，并使用响应更新 HTTP 缓存。
  - **"no-cache"**：fetch 创建一个条件请求，如果 HTTP 缓存中有响应，则进行条件请求，否则进行正常请求。然后使用响应更新 HTTP 缓存。
  - **"force-cache"**：fetch 使用 HTTP 缓存中匹配请求的任何响应，而不考虑陈旧性。如果没有响应，则创建一个正常请求，并使用响应更新 HTTP 缓存。
  - **"only-if-cached"**：fetch 使用 HTTP 缓存中匹配请求的任何响应，而不考虑陈旧性。如果没有响应，则返回网络错误。（仅当请求的模式为 "same-origin" 时可用。任何缓存的重定向将会跟随，假设请求的重定向模式为 "follow"，且重定向不违反请求的模式。）
  - 如果头部列表包含 `If-Modified-Since`、`If-None-Match`、`If-Unmodified-Since`、`If-Match` 或 `If-Range`，fetch 将设置缓存模式为 "no-store"（如果当前为 "default"）。

- **请求的相关重定向模式**（redirect mode）可以是 "follow"、"error" 或 "manual"。除非另有说明，否则默认为 "follow"。
  - **"follow"**：跟随获取资源时遇到的所有重定向。
  - **"error"**：当请求遇到重定向时返回网络错误。
  - **"manual"**：当请求遇到重定向时检索一个不透明重定向过滤响应，以允许服务工作者离线重放重定向。该响应在其他方面与网络错误不可区分，以不违反原子 HTTP 重定向处理。

- **请求的相关完整性元数据**（integrity metadata）是一个字符串。除非另有说明，否则默认为空字符串。

- **请求的相关加密 nonce 元数据**（cryptographic nonce metadata）是一个字符串。除非另有说明，否则默认为空字符串。

- **请求的相关解析器元数据**（parser metadata）可以是空字符串、"parser-inserted" 或 "not-parser-inserted"。除非另有说明，否则默认为空字符串。
  - 请求的加密 nonce 元数据和解析器元数据通常由负责创建请求的 HTML 元素的属性和标志填充。它们被各种内容安全策略算法用来确定在给定上下文中是否阻止请求或响应。 [CSP]

- **请求的相关重新加载导航标志**（reload-navigation flag）。除非另有说明，否则默认为未设置。
  - 此标志专用于 HTML 的导航算法。 [HTML]

- **请求的相关历史导航标志**（history-navigation flag）。除非另有说明，否则默认为未设置。
  - 此标志专用于 HTML 的导航算法。 [HTML]

- **请求的相关用户激活标志**（user-activation）。除非另有说明，否则默认为 false。
  - 这是专用于 HTML 的导航算法。 [HTML]

- **请求的相关渲染阻塞标志**（render-blocking）。除非另有说明，否则默认为 false。
  - 此标志专用于 HTML 的渲染阻塞机制。 [HTML]

  ### 2.2.6 请求（续）

- **请求的相关 URL 列表**（URL list）是一个包含一个或多个 URL 的列表。除非另有说明，否则默认为包含请求的 URL 的副本的列表。

- **请求的相关当前 URL**（current URL）是指向请求的 URL 列表中最后一个 URL 的指针。

- **请求的相关重定向计数**（redirect count）。除非另有说明，否则默认为零。

- **请求的相关响应污染**（response tainting）可以是 "basic"、"cors" 或 "opaque"。除非另有说明，否则默认为 "basic"。

- **请求的相关防止 no-cache Cache-Control 头部修改标志**（prevent no-cache cache-control header modification flag）。除非另有说明，否则默认为未设置。

- **请求的相关完成标志**（done flag）。除非另有说明，否则默认为未设置。

- **请求的相关允许失败计时标志**（timing allow failed flag）。除非另有说明，否则默认为未设置。

- 请求的 URL 列表、当前 URL、重定向计数、响应污染、完成标志和计时允许失败标志用作 fetch 算法的簿记详细信息。

- **子资源请求**（subresource request）：其目标是 "audio"、"audioworklet"、"font"、"image"、"json"、"manifest"、"paintworklet"、"script"、"style"、"track"、"video"、"xslt" 或空字符串的请求。

- **非子资源请求**（non-subresource request）：其目标是 "document"、"embed"、"frame"、"iframe"、"object"、"report"、"serviceworker"、"sharedworker" 或 "worker" 的请求。

- **导航请求**（navigation request）：其目标是 "document"、"embed"、"frame"、"iframe" 或 "object" 的请求。

- **判断请求是否具有重定向污染的来源**（redirect-tainted origin）：
  1. 设置 `lastURL` 为 null。
  2. 对于请求的 URL 列表中的每个 URL：
     - 如果 `lastURL` 为 null，则将 `lastURL` 设置为 URL，并继续。
     - 如果 URL 的来源与 `lastURL` 的来源不同，且请求的来源与 `lastURL` 的来源不同，则返回 true。
     - 将 `lastURL` 设置为 URL。
  3. 返回 false。

- **序列化请求来源**（serializing a request origin）：
  1. 如果请求具有重定向污染的来源，则返回 "null"。
  2. 返回请求的来源，经过序列化处理。

- **字节序列化请求来源**（byte-serializing a request origin）：
  - 返回序列化请求来源的结果，经过 isomorphic 编码。

- **克隆请求**（cloning a request）：
  1. 让 `newRequest` 为请求的副本，除了其主体。
  2. 如果请求的主体非 null，则将 `newRequest` 的主体设置为克隆请求的主体的结果。
  3. 返回 `newRequest`。

- **向请求添加范围头**（range header）：
  1. 断言：`last` 未给出，或 `first` 小于或等于 `last`。
  2. 设置 `rangeValue` 为 `bytes=`。
  3. 序列化并 isomorphic 编码 `first`，并将结果附加到 `rangeValue`。
  4. 附加 0x2D（-）到 `rangeValue`。
  5. 如果 `last` 被给出，则序列化并 isomorphic 编码它，并将结果附加到 `rangeValue`。
  6. 将 (`Range`, `rangeValue`) 添加到请求的头部列表。

  - 范围头表示一个包含的字节范围。例如，一个范围头 `bytes=0-500` 表示 501 字节的范围。

- **为处理部分响应的功能寻求安全审查**：
  - 组合多个响应为一个逻辑资源的功能历史上是安全漏洞的来源。请对处理部分响应的功能寻求安全审查。

- **序列化响应 URL 以便报告**（serialize a response URL for reporting）：
  1. 断言：响应的 URL 列表非空。
  2. 让 `url` 为响应的 URL 列表[0] 的副本。
  3. 设置 `url` 的用户名和密码为空字符串。
  4. 返回排除片段的 `url` 序列化结果。

- **检查 Cross-Origin-Embedder-Policy 是否允许凭据**（Cross-Origin-Embedder-Policy allows credentials）：
  1. 如果请求的模式不是 "no-cors"，则返回 true。
  2. 如果请求的客户端为 null，则返回 true。
  3. 如果请求的客户端的策略容器的嵌入策略值不是 "credentialless"，则返回 true。
  4. 如果请求的来源与请求当前 URL 的来源相同，并且请求没有重定向污染的来源，则返回 true。
  5. 返回 false。

### 2.2.6. 响应

fetch 的结果是响应。响应会随时间演变。也就是说，不是所有字段一开始就可用。

响应有一个相关的类型，可以是 "basic"、"cors"、"default"、"error"、"opaque" 或 "opaqueredirect"。除非另有说明，否则默认是 "default"。

响应可以有一个相关的中止标志，最初是未设置的。

这表示请求是由开发者或终端用户有意中止的。

响应有一个相关的 URL。它是响应 URL 列表中的最后一个 URL 的指针，如果响应的 URL 列表为空，则为 null。

响应有一个相关的 URL 列表（一个包含零个或多个 URL 的列表）。除非另有说明，否则是空列表。

除了第一个和最后一个 URL（如果有的话），响应的 URL 列表不会直接暴露给脚本，因为这将违反原子 HTTP 重定向处理。

响应有一个相关的状态，这是一个状态码。除非另有说明，否则默认是 200。

响应有一个相关的状态消息。除非另有说明，否则是空的字节序列。

通过 HTTP/2 连接的响应总会将状态消息作为空的字节序列，因为 HTTP/2 不支持它们。

响应有一个相关的头部列表（一个头部列表）。除非另有说明，否则是空列表。

响应有一个相关的主体（null 或一个主体）。除非另有说明，否则是 null。

网络响应的主体的来源和长度概念总是 null。

响应有一个相关的缓存状态（空字符串、"local" 或 "validated"）。除非另有说明，否则是空字符串。

这主要用于 Service Workers 和 Resource Timing。[SW] [RESOURCE-TIMING]

响应有一个相关的 CORS 暴露的头部名称列表（一个包含零个或多个头部名称的列表）。除非另有规定，否则列表为空。

响应通常会通过从 `Access-Control-Expose-Headers` 头部提取头部值来设置其 CORS 暴露的头部名称列表。这个列表用于 CORS 过滤响应来确定要暴露哪些头部。

响应有一个相关的请求范围标志，最初是未设置的。

这用于防止早期范围请求的部分响应被提供给没有进行范围请求的 API。有关攻击的详细描述，请参见标志的用法。

响应有一个相关的请求包含凭据（一个布尔值），最初是 true。

响应有一个相关的允许通过时间标志，最初是未设置的。

这用于让调用者通过查看返回响应的标志来确定是否允许在被获取的资源上显示敏感的时间数据。因为重定向链中先前响应的标志如果设置，重定向响应的标志也必须设置，这也使用请求的时间允许失败标志在内部进行跟踪。

响应有一个相关的主体信息（响应主体信息）。除非另有说明，否则是一个新的响应主体信息。

响应有一个相关的 Service Worker 时间信息（null 或 Service Worker 时间信息），最初是 null。

响应有一个相关的跨源重定向标志（一个布尔值），最初是 false。

网络错误是一个类型为 "error"，状态为 0，状态消息为空的字节序列，头部列表为空列表，主体为 null，主体信息为新的响应主体信息的响应。

中止的网络错误是一个设置了中止标志的网络错误。

给定 fetch 参数 fetchParams 创建适当的网络错误：

断言：fetchParams 被取消。

如果 fetchParams 被中止，则返回中止的网络错误；否则返回网络错误。

过滤响应是提供一个有限视图的响应，与之关联的响应可以通过过滤响应的内部响应访问（一个既不是网络错误也不是过滤响应的响应）。

除非另有说明，过滤响应的相关概念（如其主体）指的是其内部响应的相关概念。（定义过滤响应的具体类型时列出了例外情况。）

fetch 算法通过 processResponse 和等效参数将过滤响应暴露给调用者，以确保它们不会意外地泄露信息。如果出于遗留原因需要揭示信息，例如，将图像数据提供给解码器，可以通过规范算法使用与之关联的内部响应。

新规范不应再建立在不透明的过滤响应或不透明重定向过滤响应之上。这些是遗留结构，鉴于当代计算机架构，它们不能总是得到充分的保护。

基本过滤响应是一个类型为 "basic" 且头部列表不包含内部响应头部列表中任何名称为禁止响应头部名称的头部的过滤响应。

CORS 过滤响应是一个类型为 "cors" 且头部列表不包含内部响应头部列表中任何名称不在 CORS 安全列表中的响应头部名称的过滤响应，考虑到内部响应的 CORS 暴露的头部名称列表。

不透明过滤响应是一个类型为 "opaque"，URL 列表为空列表，状态为 0，状态消息为空的字节序列，头部列表为空列表，主体为 null，主体信息为新的响应主体信息的响应。

不透明重定向过滤响应是一个类型为 "opaqueredirect"，状态为 0，状态消息为空的字节序列，头部列表为空列表，主体为 null，主体信息为新的响应主体信息的响应。

由于不跟随重定向，暴露不透明重定向过滤响应的 URL 列表是无害的。

换句话说，不透明过滤响应和不透明重定向过滤响应与网络错误几乎无法区分。在引入新 API 时，不要使用内部响应进行内部规范算法，因为这会泄露信息。

这也意味着 JavaScript API，如 response.ok，将返回相当无用的结果。

响应的类型通过类型 getter 暴露给脚本：

```js
console.log(new Response().type); // "default"
console.log((await fetch("/")).type); // "basic"
console.log((await fetch("https://api.example/status")).type); // "cors"
console.log((await fetch("https://crossorigin.example/image", { mode: "no-cors" })).type); // "opaque"
console.log((await fetch("/surprise-me", { redirect: "manual" })).type); // "opaqueredirect"
```

（这假设各种资源存在，https://api.example/status 有适当的 CORS 头部，以及 /surprise-me 使用重定向状态。）

要克隆响应 response，请执行以下步骤：

如果 response 是过滤响应，然后返回一个新的相同的过滤响应，其内部响应是 response 内部响应的克隆。

让 newResponse 是 response 的副本，除了其主体。

如果 response 的主体非空，则将 newResponse 的主体设置为克隆 response 体的结果。

返回 newResponse。

新鲜响应是当前年龄在其新鲜生命周期内的响应。

陈旧时重新验证响应是不是新鲜响应，且当前年龄在陈旧时重新验证生命周期内的响应。[HTTP-CACHING] [STALE-WHILE-REVALIDATE]

陈旧响应是不是新鲜响应或陈旧时重新验证响应的响应。

给定 null 或 ASCII 字符串 requestFragment 的响应 response 的位置 URL，是通过以下步骤返回的值。它们返回 null、失败或 URL。

如果 response 的状态不是重定向状态，则返回 null。

让 location 是从 header list 中提取 `Location` 和 response 的 header list 的结果。

如果 location 是一个头部值，那么将 location 设置为使用 response 的 URL 解析 location 的结果。

如果 response 是通过 Response 构造函数构建的，response 的 URL 将为 null，这意味着 location 只有在它是一个带有片段的绝对 URL 字符串时才能成功解析。

如果 location 是一个 URL，其片段为 null，则将 location 的片段设置为 requestFragment。

这确保了所有响应（包括合成响应）都遵循 HTTP 定义的重定向处理模型。[HTTP]

返回 location。

位置 URL 算法仅在此标准和 HTML 的导航算法中用于重定向处理，该算法手动处理重定向。[HTML]

### 2.2.7. 杂项

潜在的目的地是 "fetch" 或者不是空字符串的目的地。

要转换潜在的目的地 potentialDestination，请执行以下步骤：

如果 potentialDestination 是 "fetch"，则返回空字符串。

断言：potentialDestination 是一个目的地。

返回 potentialDestination。

## 2.3. 认证条目

认证条目和代理认证条目是用户名、密码和领域组成的元组，用于HTTP认证和HTTP代理认证，并与一个或多个请求关联。

用户代理应该允许它们与HTTP cookies和类似的跟踪功能一起被清除。

更详细的信息由HTTP定义。[HTTP] [HTTP-CACHING]

## 2.4. Fetch组

每个环境设置对象都有一个相关的fetch组。

Fetch组保存了一个有序的fetch记录列表。

Fetch记录与一个相关的请求（一个请求）关联。

Fetch记录与一个相关的控制器（一个fetch控制器或null）关联。

当一个fetch组被终止时，对于每个相关联的fetch记录，如果其fetch记录的控制器非空，并且其请求的完成标志未设置或keepalive为false，则终止fetch记录的控制器。

## 2.5. 解析域名

（这是一个跟踪向量。）给定一个网络分区键key和一个源origin，解析一个源：

如果origin的主机是一个IP地址，那么返回 « origin的主机 »。

如果origin的主机的公共后缀是"localhost"或"localhost."，那么返回 « ::1, 127.0.0.1 »。

执行一个实现定义的操作，将origin转换为一组一个或多个IP地址。

其他操作也可能执行以获取超出IP地址的连接信息。例如，如果origin的方案是HTTP(S)方案，实现可能会执行一个DNS查询以获取HTTPS RRs。[SVCB]

如果这个操作成功，返回IP地址集和任何额外的实现定义的信息。

返回失败。

解析一个源的结果可能被缓存。如果它们被缓存，key应该用作缓存键的一部分。

通常这个操作会涉及到DNS，因此缓存可能会在DNS服务器上发生，而不需要考虑key。根据实现，也可能无法在本地考虑key。[RFC1035]

解析一个源算法可以返回的IP地址的顺序可能在每次调用之间不同。

细节（除了缓存键之外）并没有固定下来，因为它们与Fetch标准建立的系统无关。其他文档在没有与Fetch标准社区进行深思熟虑的讨论之前，不应在这个原语上构建。

## 2.6. 连接
用户代理有一个相关的连接池。连接池是一个有序集合，包含零个或多个连接。每个连接由一个相关的键（网络分区键）、源（源）和凭据（布尔值）标识。

每个连接都有一个相关的计时信息（连接计时信息）。

连接计时信息是一个结构体，用于维护有关获取连接过程的时间信息。它包含以下项目：
- 域名查找开始时间（默认为0）
- 域名查找结束时间（默认为0）
- 连接开始时间（默认为0）
- 连接结束时间（默认为0）
- 安全连接开始时间（默认为0）
- 一个DOMHighResTimeStamp。
- ALPN协商的协议（默认为空字节序列）
- 一个字节序列。

要限制和粗糙化连接计时信息，给定一个连接计时信息timingInfo，一个DOMHighResTimeStamp defaultStartTime，和一个布尔值crossOriginIsolatedCapability，请执行以下步骤：

如果timingInfo的连接开始时间小于defaultStartTime，则返回一个新的连接计时信息，其域名查找开始时间是defaultStartTime，域名查找结束时间是defaultStartTime，连接开始时间是defaultStartTime，连接结束时间是defaultStartTime，安全连接开始时间是defaultStartTime，并且ALPN协商的协议是timingInfo的ALPN协商的协议。

返回一个新的连接计时信息，其域名查找开始时间是通过给定timingInfo的域名查找开始时间和crossOriginIsolatedCapability并使用粗糙化时间函数得出的结果，域名查找结束时间是通过给定timingInfo的域名查找结束时间和crossOriginIsolatedCapability并使用粗糙化时间函数得出的结果，连接开始时间是通过给定timingInfo的连接开始时间和crossOriginIsolatedCapability并使用粗糙化时间函数得出的结果，连接结束时间是通过给定timingInfo的连接结束时间和crossOriginIsolatedCapability并使用粗糙化时间函数得出的结果，安全连接开始时间是通过给定timingInfo的安全连接开始时间和crossOriginIsolatedCapability并使用粗糙化时间函数得出的结果，并且ALPN协商的协议是timingInfo的ALPN协商的协议。

一个新的连接设置是"no"、"yes"或"yes-and-dedicated"。

要获取一个连接，给定一个网络分区键key，URL url，布尔值凭据，一个可选的新连接设置new（默认为"no"），以及一个可选的布尔值requireUnreliable（默认为false），请执行以下步骤：

如果new是"no"，则：

让connections是用户代理连接池中键为key，源为url的源，凭据为凭据的连接集合。

如果connections不为空并且requireUnreliable为false，则返回其中一个connections。

如果在connections中有一个能够支持不可靠传输的连接，例如HTTP/3，则返回该连接。

让proxies是通过以实现定义的方式为url查找代理的结果。如果没有代理，让proxies为 « "DIRECT" »。

这里就是非标准技术如Web Proxy Auto-Discovery Protocol (WPAD) 和代理自动配置 (PAC) 发挥作用的地方。"DIRECT" 值意味着对于这个特定的url不使用代理。

让timingInfo是一个新的连接计时信息。

对于proxies中的每个代理：

将timingInfo的域名查找开始时间设置为不安全的共享当前时间。

让hosts为 « url的源的主机 »。

如果代理是"DIRECT"，那么将hosts设置为给定key和url的源并运行解析一个源的结果。

如果hosts是失败，那么继续。

将timingInfo的域名查找结束时间设置为不安全的共享当前时间。

让connection是通过运行以下步骤得到的结果：运行创建一个连接，给定key，url的源，凭据，代理，来自hosts的一个实现定义的主机，timingInfo，以及requireUnreliable，以实现定义的次数并行运行，并等待至少1个返回值。以实现定义的方式，从返回的值中选择一个值并返回它。其他返回的值如果是连接，可能会被关闭。

本质上，这允许实现从解析一个源的返回值中选择一个或多个IP地址（假设代理是"DIRECT"），并将它们相互竞争，优先考虑IPv6地址，超时时重试等。

如果connection是失败，那么继续。

如果new不是"yes-and-dedicated"，那么将connection追加到用户代理的连接池中。

返回connection。

返回失败。

这故意有点模糊，因为连接管理有很多细微差别，最好留给实现者的自由裁量权。描述这个有助于解释<link rel=preconnect>特性，并明确指定连接是根据凭据来键控的。后者澄清了，例如，TLS会话标识符不会在凭据为false的连接和凭据为true的连接之间重用。

要创建一个连接，给定一个网络分区键key，源origin，布尔值凭据，字符串代理，主机host，连接计时信息timingInfo，以及布尔值requireUnreliable，请执行以下步骤：

将timingInfo的连接开始时间设置为不安全的共享当前时间。

让connection是一个新的连接，其键是key，源是origin，凭据是凭据，计时信息是timingInfo。记录给定connection的连接计时信息，并使用connection建立到host的HTTP连接，考虑代理和源，有以下警告：[HTTP] [HTTP1] [TLS]

如果requireUnreliable为true，那么建立一个能够支持不可靠传输的连接，例如一个HTTP/3连接。[HTTP3]

在建立能够支持不可靠传输的连接时，启用WebTransport所需的选项。对于HTTP/3，这意味着在初始SETTINGS帧中包含SETTINGS_ENABLE_WEBTRANSPORT，值为1，以及H3_DATAGRAM，值为1。[WEBTRANSPORT-HTTP3] [HTTP3-DATAGRAM]

如果凭据为false，那么不要发送TLS客户端证书。

如果建立连接不成功（例如，UDP、TCP或TLS错误），那么返回失败。

将timingInfo的ALPN协商的协议设置为connection的ALPN协议ID，有以下警告：[RFC7301]

当配置代理时，如果建立了隧道连接，那么这必须是隧道协议的ALPN协议ID，否则它必须是到代理的第一跳的ALPN协议ID。

如果用户代理使用的是实验性的、未注册的协议，用户代理必须使用使用的ALPN协议ID（如果有）。如果ALPN未用于协议协商，用户代理可以使用另一个描述性字符串。

timingInfo的ALPN协商的协议旨在无论实际是如何协商的，都标识所使用的网络协议；也就是说，即使ALPN未用于协商网络协议，这也是指示所使用的协议的ALPN协议ID。

IANA维护着ALPN协议ID的列表。

返回connection。

要记录给定connection的连接计时信息，让timingInfo是connection的计时信息，并观察以下要求：

timingInfo的连接结束时间应该是在建立到服务器或代理的连接后立即不安全的共享当前时间：

返回的时间必须包括建立传输连接所需的时间间隔，以及SOCKS认证等其他时间间隔。它必须包括完成足够TLS握手以请求资源的时间间隔。

如果用户代理为这个连接使用了TLS False Start，这个时间间隔不能包括接收服务器的Finished消息所需的时间。[RFC7918]

如果用户代理在没有等待完整握手完成的情况下发送请求，这个时间间隔不能包括接收服务器的ServerHello消息所需的时间。[RFC8470]

如果用户代理等待完整握手完成后发送请求，这个时间间隔包括完整的TLS握手，即使其他请求是在连接上使用早期数据发送的。

假设用户代理通过TLS 1.3建立一个HTTP/2连接来发送GET请求和POST请求。它在时间t1发送ClientHello，然后用早期数据发送GET请求。POST请求不安全（[HTTP]，第9.2.1节），所以用户代理等到时间t2完成握手后再发送它。尽管两个请求使用了相同的连接，GET请求报告的连接结束时间是t1，而POST请求报告的是t2。

如果使用了安全传输，timingInfo的安全连接开始时间应该是在开始安全连接握手过程之前立即调用不安全的共享当前时间的结果。[TLS]

如果connection是一个HTTP/3连接，timingInfo的连接开始时间和timingInfo的安全连接开始时间必须相等。（在HTTP/3中，安全传输握手过程是作为初始连接设置的一部分执行的。）[HTTP3]

限制和粗糙化连接计时信息算法确保重用连接的细节不被暴露，并且时间值被粗糙化。


## 2.7. 网络分区键

网络分区键是由站点和null或实现定义的值组成的元组。

要确定网络分区键，给定一个环境environment：

让topLevelOrigin成为environment的顶级源。

如果topLevelOrigin为null，则将topLevelOrigin设置为environment的顶级创建URL的源。

断言：topLevelOrigin是一个源。

让topLevelSite成为给定topLevelOrigin获取站点的结果。

让secondKey为null或实现定义的值。

第二个键有意保持一些模糊性，因为更精细的细节仍在发展中。参见问题#1035。

返回（topLevelSite，secondKey）。

要确定网络分区键，给定一个请求request：

如果request的保留客户端非空，则返回给定request的保留客户端确定网络分区键的结果。

如果request的客户端非空，则返回给定request的客户端确定网络分区键的结果。

返回null。

## 2.8. HTTP缓存分区

要确定HTTP缓存分区，给定一个请求request：

让key成为给定request确定网络分区键的结果。

如果key为null，则返回null。

返回与key关联的唯一HTTP缓存。[HTTP-CACHING]


## 2.9. 端口屏蔽

新协议可以通过使用ALPN通过TLS协商协议来避免屏蔽端口的需要。在这种情况下，协议不能通过HTTP请求伪造。[RFC7301]

要确定是否由于不良端口而阻止获取请求request：

让url成为request的当前URL。

如果url的方案是HTTP(S)方案，并且url的端口是不良端口，则返回阻止。

返回允许。

如果端口列在以下表格的第一列中，则端口是不良端口。

```
Port	Typical service
1	tcpmux
7	echo
9	discard
11	systat
13	daytime
15	netstat
17	qotd
19	chargen
20	ftp-data
21	ftp
22	ssh
23	telnet
25	smtp
37	time
42	name
43	nicname
53	domain
69	tftp
77	—​
79	finger
87	—​
95	supdup
101	hostname
102	iso-tsap
103	gppitnp
104	acr-nema
109	pop2
110	pop3
111	sunrpc
113	auth
115	sftp
117	uucp-path
119	nntp
123	ntp
135	epmap
137	netbios-ns
139	netbios-ssn
143	imap
161	snmp
179	bgp
389	ldap
427	svrloc
465	submissions
512	exec
513	login
514	shell
515	printer
526	tempo
530	courier
531	chat
532	netnews
540	uucp
548	afp
554	rtsp
556	remotefs
563	nntps
587	submission
601	syslog-conn
636	ldaps
989	ftps-data
990	ftps
993	imaps
995	pop3s
1719	h323gatestat
1720	h323hostcall
1723	pptp
2049	nfs
3659	apple-sasl
4045	npp
4190	sieve
5060	sip
5061	sips
6000	x11
6566	sane-port
6665	ircu
6666	ircu
6667	ircu
6668	ircu
6669	ircu
6679	osaut
6697	ircs-u
10080	amanda
```

## 2.10. 响应是否因其MIME类型而阻止请求？

执行以下步骤：

让mimeType成为从响应的头部列表中提取MIME类型的结果。

如果mimeType是失败，则返回允许。

让destination成为请求的目的地。

如果destination是类似脚本的，并且以下任一为真，则返回阻止：

mimeType的本质以"audio/"、"image/"或"video/"开头。
mimeType的本质是"text/csv"。

返回允许。

# 参考资料

https://fetch.spec.whatwg.org/

* any list
{:toc}