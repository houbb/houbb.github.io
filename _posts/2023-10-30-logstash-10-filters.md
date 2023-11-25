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

# 参考资料

chat

* any list
{:toc}