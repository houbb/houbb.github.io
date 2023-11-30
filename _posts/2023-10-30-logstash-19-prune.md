---
layout: post
title: logstash 日志加工处理-19-prune 字段的剪枝处理
date: 2023-10-30 21:01:55 +0800
categories: [Log]
tags: [log, sh]
published: true
---


# Q: 介绍一下 logstash 中的 prune

在 Logstash 中，`prune` 是一个过滤器，用于删除事件中的字段。

它允许你选择性地移除事件中的特定字段，以减小事件的体积或者为了保护敏感信息而删除某些字段。

`prune` 过滤器的使用场景通常涉及到日志事件中的字段清理和数据保护。

以下是 `prune` 过滤器的基本用法：

```ruby
filter {
  prune {
    whitelist_names => ["field1", "field2"]
  }
}
```

在上述例子中：

- `whitelist_names` 参数是一个数组，包含了应该保留的字段名列表。只有在白名单中的字段会被保留，其他字段将被删除。

实际上，`prune` 过滤器支持的配置项还包括：

- **`whitelist_names` (required):** 要保留的字段名的数组。只有在白名单中的字段才会被保留，其他字段将被删除。

- **`blacklist_names` (optional):** 要删除的字段名的数组。在黑名单中的字段将会被删除，即使它们在白名单中。

- **`whitelist_classes` (optional):** 要保留的字段的 Java 类名的数组。只有字段的类名在白名单中时，该字段才会被保留。

- **`blacklist_classes` (optional):** 要删除的字段的 Java 类名的数组。在黑名单中的字段的类名将会被删除，即使它们在白名单中。

- **`add_field` (optional):** 添加一个新的字段到事件中，可以是静态值或者基于事件的值。

- **`add_tag` (optional):** 添加一个或多个标签到事件中。

- **`remove_tag` (optional):** 移除一个或多个标签。

- **`remove_field` (optional):** 移除一个或多个字段。

- **`remove_field_if_empty` (optional):** 如果字段的值为空，则移除该字段。

下面是一个例子，展示了如何使用 `prune` 过滤器：

```ruby
filter {
  prune {
    whitelist_names => ["field1", "field2"]
    blacklist_names => ["field3"]
    add_field => { "new_field" => "static_value" }
    add_tag => ["pruned_event"]
  }
}
```

在这个例子中，`field1` 和 `field2` 会被保留，`field3` 会被删除。同时，一个新的字段 `new_field` 会被添加，其值为 "static_value"，并且标签 "pruned_event" 会被添加到事件中。

# Q: 为什么这个 prune 方法会比独立出来? 难道 drop 和 remove 还不够

`prune` 过滤器的设计主要是为了提供更加细粒度和灵活的字段处理功能，以适应一些特定的使用场景。

虽然 Logstash 中已经有 `remove` 和 `drop` 过滤器，但它们的功能相对简单，而 `prune` 的设计使得字段的处理更加复杂和定制化。

以下是一些 `prune` 过滤器相对于 `remove` 和 `drop` 过滤器的优势：

1. **白名单和黑名单：** `prune` 允许你同时使用白名单和黑名单，以更灵活地决定哪些字段应该保留，哪些应该删除。

这对于需要保留一些字段同时删除其他字段的情况很有用。

2. **类名过滤：** `prune` 过滤器提供了按照 Java 类名过滤字段的能力，这对于处理特定类型的字段非常有用。

例如，你可以只保留属于特定类的字段。

3. **额外的操作：** `prune` 过滤器支持额外的操作，如添加新字段、添加标签等。这允许你在删除或保留字段的同时，进行其他定制化的操作。

4. **条件删除：** `prune` 允许你在字段为空时删除它们，这对于需要清理空值字段的情况很有用。

虽然 `remove` 和 `drop` 过滤器可以满足一般性的字段删除需求，但当你需要更加复杂的字段处理时，`prune` 过滤器提供了更为灵活和丰富的选项。选择使用哪个过滤器取决于具体的场景和需求。

# Q: prune 这个单词是什么意思

"Prune" 是一个英语单词，它有几个相关的含义，但在 Logstash 中的 `prune` 过滤器中，其主要含义是 "修剪" 或 "剪枝"。

在计算机科学和软件工程的上下文中，"prune" 通常指的是删除或去除不需要的部分，以减小数据结构的大小或简化结构。

在 Logstash 的 `prune` 过滤器中，它用于删除或保留事件中的字段，实现了对字段的精细控制和修剪。

通过配置白名单、黑名单、添加字段等选项，可以有选择性地保留或删除事件中的字段，以满足数据处理的需求。

总的来说，"prune" 在这个上下文中的含义就是对事件中的字段进行精确修剪，只保留或删除需要的部分。


# Q: logstash 中的 tag 是什么概念？

在 Logstash 中，`tag` 是一个用于标记事件的字段。`tag` 字段通常包含一个或多个标签，用于识别事件所属的类别、类型或状态。这些标签可以在事件处理流程中进行条件判断、过滤、路由等操作。

每个事件都可以包含零个或多个标签。当 Logstash 处理事件时，可以根据标签的存在与否来执行不同的操作。例如，你可以使用 `if` 语句检查事件是否包含特定的标签，然后基于这些标签执行不同的过滤或输出操作。

以下是一个简单的 Logstash 配置示例，演示了如何使用标签：

```ruby
filter {
  if "error" in [tags] {
    # 如果事件包含 "error" 标签，执行相应的操作
    # 例如，将错误信息发送到特定的输出
    stdout {
      codec => rubydebug
    }
  }
  
  if "important" in [tags] {
    # 如果事件包含 "important" 标签，执行另一种操作
    # 例如，将重要信息发送到不同的输出
    elasticsearch {
      hosts => ["http://localhost:9200"]
      index => "important_logs"
    }
  }
}
```

在上述示例中，Logstash 根据事件的标签执行了不同的过滤和输出操作。

你可以根据具体的业务需求为事件添加标签，并在配置中根据这些标签来定制事件处理流程。

标签是一个非常灵活的机制，可以根据具体的日志处理需求动态地为事件添加或移除标签，从而实现更精细的数据处理流程。

# Q: tag 是属于某一个字段属性，还是整体的 eventMap？

在 Logstash 中，`tag` 实际上是属于整体的事件（`event`）数据结构的一部分，而不是某个字段的属性。每个事件都是一个包含多个字段的数据结构，而 `tags` 则是其中一个字段，用于存储事件的标签信息。

具体来说，Logstash 的事件结构是一个由字段组成的哈希表，其中字段的键（key）是字段名，值（value）是字段的具体值。`tags` 字段也是其中之一，用于存储表示事件类别、状态或其他标识的标签。

当 Logstash 处理事件时，可以通过添加或移除 `tags` 字段中的值来标记事件。

例如，可以使用 `add_tag` 和 `remove_tag` 过滤器来动态地修改事件的标签。这些标签可以在后续的配置中用于条件判断、过滤或路由。

以下是一个简单的示例，演示了如何在 Logstash 中添加和使用标签：

```ruby
filter {
  # 如果事件中的 "severity" 字段值为 "error"，则添加 "error" 标签
  if [severity] == "error" {
    mutate {
      add_tag => ["error"]
    }
  }
  
  # 如果事件中的 "user_type" 字段值为 "important"，则添加 "important" 标签
  if [user_type] == "important" {
    mutate {
      add_tag => ["important"]
    }
  }
}
```

在这个例子中，如果事件的 `severity` 字段值为 "error"，就会添加 "error" 标签；

如果 `user_type` 字段值为 "important"，就会添加 "important" 标签。

这样，后续的配置可以根据标签来执行相应的操作。

# 我们的设计

## 属性

whitelist_names (required): 要保留的字段名的数组。只有在白名单中的字段才会被保留，其他字段将被删除。
blacklist_names (optional): 要删除的字段名的数组。在黑名单中的字段将会被删除，即使它们在白名单中。
whitelist_classes (optional): 要保留的字段的 Java 类名的数组。只有字段的类名在白名单中时，该字段才会被保留。
blacklist_classes (optional): 要删除的字段的 Java 类名的数组。在黑名单中的字段的类名将会被删除，即使它们在白名单中。
remove_field_if_empty (optional): 如果字段的值为空，则移除该字段。

## tag/field

关于 field/tag 的 crud，单独已经有了，不再杂糅到这里。








# 参考资料

chat

* any list
{:toc}