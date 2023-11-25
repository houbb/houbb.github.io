---
layout: post
title: logstash 日志加工处理-10-logstash plugins filters 转换处理插件
date: 2023-10-30 21:01:55 +0800
categories: [Log]
tags: [log, sh]
published: true
---


# Q1-logstash 支持的所有 filters 插件有哪些？

截至我了解的2022年底的信息，Logstash支持许多过滤插件，用于对事件数据进行处理和转换。

以下是一些常见的Logstash过滤插件，但请注意，这可能不是最新的信息，因此建议查阅 Logstash 官方文档以获取最新的插件列表：

当你使用 Logstash 过滤插件时，它们主要用于对事件数据进行处理、转换和过滤。

以下是一些插件的简要解释：

1. **aggregate**: 用于聚合事件，通常在处理日志数据时用于汇总相关事件。

2. **clone**: 复制事件，将其发送到多个输出。

3. **csv**: 用于解析和生成 CSV 格式的数据。

4. **date**: 用于解析和格式化日期字段。

5. **dissect**: 基于固定分隔符的简单分词。

6. **dns**: 通过 DNS 查询解析域名，将 IP 地址解析为主机名。

7. **drop**: 丢弃事件，通常与条件匹配一起使用。

8. **elasticsearch**: 与 Elasticsearch 交互，用于进行搜索、索引和更新等操作。

9. **elapsed**: 用于计算两个事件之间的时间差。

10. **fingerprint**: 生成事件的唯一指纹，通常用于去重。

11. **geoip**: 将 IP 地址解析为地理位置信息。

12. **grok**: 用于解析结构化文本数据。

13. **json**: 用于解析和生成 JSON 格式的数据。

14. **kv**: 用于解析键值对形式的数据。

15. **metrics**: 收集和输出 Logstash 的性能指标。

16. **multiline**: 处理多行日志事件。

17. **mutate**: 提供一组用于操作事件字段的过滤器，例如重命名、替换、合并字段等。

18. **prune**: 剪裁事件的字段。

19. **ruby**: 允许使用 Ruby 代码进行自定义操作。

20. **sleep**: 在事件处理流程中引入延迟。

21. **split**: 将事件中的字段拆分为多个事件。

22. **throttle**: 限制事件的处理速率。

23. **translate**: 将字段值映射为其他值。

24. **useragent**: 解析用户代理字符串，提取有关用户代理的信息。

25. **uuid**: 为事件生成唯一标识符。

每个插件都有其特定的用途，根据你的需求，你可以选择使用适当的插件或者将它们组合在一起以满足复杂的数据处理和转换场景。

最好的方式是查看 [Logstash 官方文档的过滤插件部分](https://www.elastic.co/guide/en/logstash/current/filter-plugins.html) 以获取最新和详细的信息。


# Q2-给出 elapsed 的配置例子，和具体的使用效果

`elapsed` 插件用于计算两个事件之间的时间差，并将该时间差添加到事件的字段中。以下是一个简单的 `elapsed` 插件的配置例子：

```ruby
filter {
  # 匹配需要计算时间差的事件
  if "your_condition" in [tags] {
    elapsed {
      # 定义用于标识开始和结束事件的字段
      start_tag => "start_event"
      end_tag => "end_event"
      # 定义保存时间差的字段名
      unique_id_field => "elapsed_time"
    }
  }
}
```

在这个例子中：

- `start_tag` 和 `end_tag` 字段用于定义开始和结束事件的标签。

在这里，它们分别为 "start_event" 和 "end_event"。

这表示当 Logstash 发现一个事件带有 "start_event" 标签时，它将启动计时器，然后当发现一个带有 "end_event" 标签的事件时，它将计算两个事件之间的时间差。

- `unique_id_field` 字段定义了保存时间差的字段名。在这里，它是 "elapsed_time"。时间差以毫秒为单位存储在这个字段中。

假设你有以下两个事件：

1. Event 1 (开始事件):

```json
{
  "message": "Start of the process",
  "tags": ["start_event"],
  "@timestamp": "2023-11-25T12:00:00"
}
```

2. Event 2 (结束事件):

```json
{
  "message": "End of the process",
  "tags": ["end_event"],
  "@timestamp": "2023-11-25T12:05:00"
}
```

当 Logstash 处理这两个事件时，它会计算它们之间的时间差，并将结果存储在 "elapsed_time" 字段中。

在这个例子中，时间差为 300000 毫秒（5分钟）。

因此，输出的事件将包含类似以下内容的字段：

```json
{
  "message": "End of the process",
  "tags": ["end_event"],
  "@timestamp": "2023-11-25T12:05:00",
  "elapsed_time": 300000
}
```

这是一个简单的例子，实际使用中，你可能需要根据具体的需求进行更复杂的配置。

# Q3-给一下 logstash filter json 的配置例子，输入输出效果？

`json` 过滤插件用于解析和生成 JSON 格式的数据。以下是一个简单的 Logstash 配置例子，演示如何使用 `json` 过滤插件：

```ruby
input {
  # 你的输入配置，例如 stdin 或者 file
}

filter {
  json {
    # 指定要解析的字段名
    source => "your_json_field"
  }
}

output {
  # 你的输出配置，例如 stdout
}
```

在这个例子中：

- `input` 部分配置用于定义 Logstash 的输入源，例如从文件读取数据或从标准输入（stdin）读取数据。

- `filter` 部分包含了 `json` 过滤插件的配置。`source` 选项用于指定包含 JSON 数据的字段名。Logstash 将尝试解析该字段的值，并将解析后的 JSON 数据添加到事件中。

- `output` 部分配置用于定义 Logstash 的输出目的地，例如将数据发送到 Elasticsearch 或者打印到标准输出（stdout）。

假设有以下输入事件：

```json
{
  "message": "This is a JSON string",
  "your_json_field": "{\"key1\":\"value1\",\"key2\":\"value2\"}",
  "@timestamp": "2023-11-25T12:00:00"
}
```

Logstash 将根据配置解析 `your_json_field` 字段中的 JSON 字符串，然后将解析后的内容添加到事件中。输出事件可能如下所示：

```json
{
  "message": "This is a JSON string",
  "your_json_field": "{\"key1\":\"value1\",\"key2\":\"value2\"}",
  "@timestamp": "2023-11-25T12:00:00",
  "key1": "value1",
  "key2": "value2"
}
```

在这个例子中，`json` 过滤插件成功解析了 `your_json_field` 字段中的 JSON 字符串，并将其拆解成了两个新的字段 `key1` 和 `key2`。

这就是 `json` 过滤插件的基本用法。

## Q: json 插件只有这一个能力吗？能不能把 JSON 对象转为 string 输出？

`json` 过滤插件不仅可以用于解析 JSON 字符串，还可以用于将事件中的字段转换为 JSON 格式的字符串。

你可以使用 `target` 选项指定一个新字段来存储生成的 JSON 字符串。

以下是一个简单的例子：

```ruby
input {
  # 你的输入配置，例如 stdin 或者 file
}

filter {
  json {
    # 指定要转换为 JSON 字符串的字段名
    source => "your_source_field"
    # 指定生成的 JSON 字符串存储的字段名
    target => "your_target_field"
  }
}

output {
  # 你的输出配置，例如 stdout
}
```

假设有以下输入事件：

```json
{
  "message": "This is a JSON object",
  "your_source_field": {
    "key1": "value1",
    "key2": "value2"
  },
  "@timestamp": "2023-11-25T12:00:00"
}
```

`json` 过滤插件将 `your_source_field` 字段中的 JSON 对象转换为 JSON 字符串，并将其存储在新的字段 `your_target_field` 中。

输出事件可能如下所示：

```json
{
  "message": "This is a JSON object",
  "your_source_field": {
    "key1": "value1",
    "key2": "value2"
  },
  "@timestamp": "2023-11-25T12:00:00",
  "your_target_field": "{\"key1\":\"value1\",\"key2\":\"value2\"}"
}
```

在这个例子中，`json` 过滤插件将 `your_source_field` 中的 JSON 对象转换为 JSON 字符串，并将其存储在了 `your_target_field` 中。

这使得你可以在后续的处理中使用这个新字段。

## Q: json 插件有哪些配置参数？

Logstash 的 `json` 过滤插件具有多个配置参数，用于指定解析和处理 JSON 数据的方式。以下是一些常见的配置参数：

1. **source**: 指定包含 JSON 数据的字段名。该字段的值将被解析为 JSON。

   ```ruby
   source => "your_source_field"
   ```

2. **target**: 指定生成的 JSON 字符串存储的字段名。当使用 `source` 解析 JSON 数据后，生成的 JSON 字符串将存储在这个字段中。

   ```ruby
   target => "your_target_field"
   ```

3. **add_field**: 在事件中添加新字段，该字段的值是从 JSON 中提取的特定字段的值。可以多次使用该选项添加多个字段。

   ```ruby
   add_field => { "new_field1" => "%{[parsed_json][key1]}", "new_field2" => "%{[parsed_json][key2]}" }
   ```

4. **remove_field**: 移除事件中的字段。可以通过此选项删除不再需要的原始 JSON 字段。

   ```ruby
   remove_field => ["unwanted_field"]
   ```

5. **remove_tag_on_failure**: 如果解析失败，移除指定的标签。通常用于在解析失败时清理数据。

   ```ruby
   remove_tag_on_failure => ["_jsonparsefailure"]
   ```

6. **target_datatype**: 指定生成的 JSON 字符串的字段的数据类型。默认为 "string"，但可以设置为 "json"。

   ```ruby
   target_datatype => "json"
   ```

7. **tag_on_failure**: 如果解析失败，为事件添加指定的标签。通常用于标记解析失败的事件。

   ```ruby
   tag_on_failure => "_jsonparsefailure"
   ```

8. **skip_on_invalid_json**: 如果设置为 true，在遇到无效的 JSON 数据时，不会为事件添加 `_jsonparsefailure` 标签，也不会引发解析错误。默认值为 false。

   ```ruby
   skip_on_invalid_json => true
   ```

这只是一些常见的配置选项，更多选项和详细信息可以在 [Logstash 官方文档的 json 插件部分](https://www.elastic.co/guide/en/logstash/current/plugins-filters-json.html) 中找到。

# 设计自己的 JSON

## 配置

```
source: 原始字段名
target: 目标字段名
targetDataType: string | json  转换为 string 还是 json
tagOnFailure => "_jsonparsefailure" 失败时的标签
jsonFieldAppend: true | true 是否添加解析后的字段到 eventMap 中
```

## 特性

实现 

1. string=>json
2. json=>string
3. 失败的时候 添加标签

# Q: 详细介绍一下 logstash 的 kv 的基本配置。

Logstash 的 `kv` 插件用于从文本消息中提取键值对（key-value pairs）。以下是 `kv` 插件的基本配置示例：

```conf
filter {
  kv {
    source => "message"  # 从哪个字段提取键值对，默认为 "message"
    field_split => ","    # 用于分隔键值对的字符，默认为 ","
    value_split => "="    # 用于分隔键和值的字符，默认为 "="
    trim_key => " "       # 是否去除键的前后空格，默认为 false
    trim_value => " "     # 是否去除值的前后空格，默认为 false
    target => "kv_data"   # 存储提取的键值对的字段，默认为 "@metadata"
    include_brackets => false # 是否包含括号在键和值的两端，默认为 false
  }
}
```

上述配置中的各个参数的作用如下：

- `source`: 指定从哪个字段提取键值对，默认为 "message"。
- `field_split`: 指定用于分隔键值对的字符，默认为 ","。
- `value_split`: 指定用于分隔键和值的字符，默认为 "="。
- `trim_key`: 指定是否去除键的前后空格，默认为 false。
- `trim_value`: 指定是否去除值的前后空格，默认为 false。
- `target`: 指定存储提取的键值对的字段，默认为 "@metadata"。
- `include_brackets`: 指定是否包含括号在键和值的两端，默认为 false。

使用 `kv` 插件，你可以方便地从日志消息中提取结构化的信息，以便后续处理或索引。

在配置中，你可以根据实际情况调整参数的取值，以满足你的需求。


## Q: 给一个具体的配置例子，对应的输入和输出的效果

假设你有如下的日志消息：

```
timestamp=2023-11-25T12:30:00, user_id=12345, action=login, status=success
timestamp=2023-11-25T12:35:00, user_id=67890, action=logout, status=failed
```

你想使用 Logstash 的 `kv` 插件从这些日志消息中提取键值对，并将其存储到新的字段 `kv_data` 中。下面是一个相应的 Logstash 配置文件：

```conf
input {
  stdin {}
}

filter {
  kv {
    source => "message"
    field_split => ","
    value_split => "="
    trim_key => " "
    trim_value => " "
    target => "kv_data"
  }
}

output {
  stdout { codec => rubydebug }
}
```

这个配置文件中，我们使用 `stdin` 插件作为输入，这样我们可以手动输入上述的日志消息。`kv` 插件被用于从 `message` 字段中提取键值对，然后将提取的结果存储到新的字段 `kv_data` 中。最后，使用 `stdout` 插件将结果输出到控制台。

输入这两条日志消息后，Logstash 将提取键值对并输出到控制台。输入：

```
timestamp=2023-11-25T12:30:00, user_id=12345, action=login, status=success
timestamp=2023-11-25T12:35:00, user_id=67890, action=logout, status=failed
```

输出：

```json
{
       "message" => "timestamp=2023-11-25T12:30:00, user_id=12345, action=login, status=success",
      "kv_data" => {
          "timestamp" => "2023-11-25T12:30:00",
            "user_id" => "12345",
            "action" => "login",
            "status" => "success"
      },
      "@version" => "1",
    "@timestamp" => 2023-11-25T00:00:00.000Z,
          "host" => "your-hostname"
}
{
       "message" => "timestamp=2023-11-25T12:35:00, user_id=67890, action=logout, status=failed",
      "kv_data" => {
          "timestamp" => "2023-11-25T12:35:00",
            "user_id" => "67890",
            "action" => "logout",
            "status" => "failed"
      },
      "@version" => "1",
    "@timestamp" => 2023-11-25T00:00:00.000Z,
          "host" => "your-hostname"
}
```

如上所示，`kv_data` 字段包含了从日志消息中提取的键值对。你可以根据实际情况调整配置和字段名，以适应你的需求。

## Q: trim_key => " " + trim_value => " "  这两个属性什么意思？具体怎么处理的

`trim_key` 和 `trim_value` 是 `kv` 插件中的两个配置属性，用于指定是否去除键和值的前后空格。具体来说：

- `trim_key`: 如果设置为 `true`，则表示去除键的前后空格；如果设置为 `false`，则表示保留键的前后空格。默认值为 `false`。

- `trim_value`: 如果设置为 `true`，则表示去除值的前后空格；如果设置为 `false`，则表示保留值的前后空格。默认值为 `false`。

例如，如果有如下的日志消息：

```
key1 = value1, key2 = value2
```

如果在 `kv` 插件中配置了 `trim_key => true` 和 `trim_value => true`，那么提取出的键值对将是：

```json
{
  "key1" => "value1",
  "key2" => "value2"
}
```

注意，键和值的前后空格被去除了。如果将这两个配置项设置为 `false`，则保留键和值的前后空格：

```json
{
  " key1 " => " value1",
  " key2 " => " value2"
}
```

这只是一个简单的例子，实际中根据你的数据格式和需求来选择是否去除前后空格。

在处理日志消息时，去除前后空格可能有助于更好地提取和处理键值对。







# 参考资料

chat

* any list
{:toc}