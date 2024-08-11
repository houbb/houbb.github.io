---
layout: post
title: 字符串值提取工具-01-value-extraction 概览
date: 2024-08-05 21:01:55 +0800
categories: [Java]
tags: [java, open-source, tool, sh]
published: true
---

# 场景

我们经常需要从字符串中提取指定的值。

如果要设计一个平台，常见提取策略都要支持。从零实现起来会比较麻烦。

希望实现一个整合常见提取策略的工具，便于在各个场景复用。

## 开源地址

> [value-extraction 值提取核心](https://github.com/houbb/value-extraction)

## 值提取系列

[字符串值提取工具-01-概览](https://houbb.github.io/2024/08/05/value-extraction-01-overview)

[字符串值提取工具-02-java 调用 js](https://houbb.github.io/2024/08/05/value-extraction-02-java-call-js)

[字符串值提取工具-03-java 调用 groovy](https://houbb.github.io/2024/08/05/value-extraction-03-java-call-groovy)

[字符串值提取工具-04-java 调用 java? Janino 编译工具](https://houbb.github.io/2024/08/05/value-extraction-04-java-call-java)

[字符串值提取工具-05-java 调用 shell](https://houbb.github.io/2024/08/05/value-extraction-05-java-call-shell)

[字符串值提取工具-06-java 调用 python](https://houbb.github.io/2024/08/05/value-extraction-06-java-call-python)

[字符串值提取工具-07-java 调用 go](https://houbb.github.io/2024/08/05/value-extraction-07-java-call-go)

# 整体目标

## 希望支持的文本类别

xml

html

json

csv/逗号分隔==>split

plain-text

SQL?

## 对应的策略

xml==>[xpath](https://houbb.github.io/2017/06/21/config-xml-xpath-intro)

json==>[json-path](https://houbb.github.io/2018/07/20/json-03-jsonpath)

html==>[jsoup](https://houbb.github.io/2018/08/19/crawl-jsoup)

SQL==>[JSqlParser](https://houbb.github.io/2020/10/17/sql-tool-JSqlParser)

csv/指定符号分隔==>split

## 拓展

1) [RegEx 正则表达式](https://houbb.github.io/2017/07/24/regex)

2）[aviator 表达式引擎](https://houbb.github.io/2020/05/26/expression-engine-02-aviator-intro)

3) [grovvy 脚本](https://houbb.github.io/2023/05/09/grovvy-08-grovvy-in-action)

# chat

## 介绍一下值提取，比如想从一个字符串，一个提取方式的输入框，获取到想提提取的值。

是的，有一些成熟的开源Java库可以帮助你进行字符串提取和解析。以下是几种常见且流行的解决方案：

### 1. Apache Commons Lang
Apache Commons Lang提供了大量实用的工具类，尤其是StringUtils类，可以方便地进行字符串操作。

```java
import org.apache.commons.lang3.StringUtils;

public class StringExtractionExample {
    public static void main(String[] args) {
        String text = "OrderID: 12345, Customer: John Doe, Date: 2023-08-05";

        String orderId = StringUtils.substringBetween(text, "OrderID: ", ", Customer: ");
        String customer = StringUtils.substringBetween(text, "Customer: ", ", Date: ");
        String date = StringUtils.substringAfter(text, "Date: ");

        System.out.println("OrderID: " + orderId);
        System.out.println("Customer: " + customer);
        System.out.println("Date: " + date);
    }
}
```

### 2. Regex (正则表达式)
Java内置了对正则表达式的支持，可以使用Pattern和Matcher类来进行字符串匹配和提取。

```java
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegexExample {
    public static void main(String[] args) {
        String text = "OrderID: 12345, Customer: John Doe, Date: 2023-08-05";
        String pattern = "OrderID: (\\d+), Customer: (.*?), Date: (\\d{4}-\\d{2}-\\d{2})";

        Pattern r = Pattern.compile(pattern);
        Matcher m = r.matcher(text);

        if (m.find()) {
            String orderId = m.group(1);
            String customer = m.group(2);
            String date = m.group(3);

            System.out.println("OrderID: " + orderId);
            System.out.println("Customer: " + customer);
            System.out.println("Date: " + date);
        } else {
            System.out.println("NO MATCH");
        }
    }
}
```

### 3. Jackson
如果你的字符串格式是JSON格式，可以使用Jackson库来解析JSON字符串并提取值。

```java
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JacksonExample {
    public static void main(String[] args) {
        String jsonString = "{\"OrderID\": \"12345\", \"Customer\": \"John Doe\", \"Date\": \"2023-08-05\"}";

        ObjectMapper mapper = new ObjectMapper();
        try {
            JsonNode root = mapper.readTree(jsonString);
            String orderId = root.get("OrderID").asText();
            String customer = root.get("Customer").asText();
            String date = root.get("Date").asText();

            System.out.println("OrderID: " + orderId);
            System.out.println("Customer: " + customer);
            System.out.println("Date: " + date);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### 4. Jsoup
如果你需要从HTML文档中提取值，Jsoup是一个非常好的选择。

```java
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

public class JsoupExample {
    public static void main(String[] args) {
        String html = "<div>OrderID: 12345</div><div>Customer: John Doe</div><div>Date: 2023-08-05</div>";

        Document doc = Jsoup.parse(html);
        String orderId = doc.select("div:contains(OrderID)").text().split(": ")[1];
        String customer = doc.select("div:contains(Customer)").text().split(": ")[1];
        String date = doc.select("div:contains(Date)").text().split(": ")[1];

        System.out.println("OrderID: " + orderId);
        System.out.println("Customer: " + customer);
        System.out.println("Date: " + date);
    }
}
```

这些开源库各有优势，选择哪一种取决于具体的使用场景和需求。

## 常见的文本格式 除了 xml json csv html properties，还有什么？

除了XML、JSON、CSV、HTML和Properties文件外，还有许多其他常见的文本格式，用于不同的应用场景和需求。以下是一些常见的文本格式：

### 1. YAML
YAML（YAML Ain't Markup Language）是一种适合人类阅读的数据序列化格式，常用于配置文件和数据交换。

```yaml
order:
  id: 12345
  customer: John Doe
  date: 2023-08-05
```

### 2. INI
INI文件是一种简单的配置文件格式，通常用于初始化配置。每个条目分为节、键和值。

```ini
[order]
id = 12345
customer = John Doe
date = 2023-08-05
```

### 3. Markdown
Markdown是一种轻量级标记语言，用于格式化文档，特别适用于编写说明文档、README文件等。

```markdown
# Order Details

- **Order ID**: 12345
- **Customer**: John Doe
- **Date**: 2023-08-05
```

### 4. TSV
TSV（Tab-Separated Values）类似于CSV，但使用制表符（Tab）作为分隔符。

```
OrderID	Customer	Date
12345	John Doe	2023-08-05
```

### 5. RTF
RTF（Rich Text Format）是一种用于文本文档的格式，支持文本样式和格式。

```rtf
{\rtf1\ansi{\fonttbl\f0\fswiss Helvetica;}\f0\pard
OrderID: 12345 \par
Customer: John Doe \par
Date: 2023-08-05 \par
}
```

### 6. LaTeX
LaTeX是一种排版系统，用于生成高质量的文档，尤其是包含数学公式的文档。

```latex
\documentclass{article}
\begin{document}
OrderID: 12345 \\
Customer: John Doe \\
Date: 2023-08-05
\end{document}
```

### 7. TOML
TOML（Tom's Obvious, Minimal Language）是一种用于配置文件的格式，设计目标是简单易读。

```toml
[order]
id = 12345
customer = "John Doe"
date = "2023-08-05"
```

### 8. SQL
SQL文件用于定义数据库的结构和查询数据。

```sql
INSERT INTO orders (id, customer, date) VALUES (12345, 'John Doe', '2023-08-05');
```

### 9. Log文件
日志文件用于记录系统或应用程序的运行状态、错误信息等。

```
2023-08-05 12:34:56 INFO OrderID: 12345, Customer: John Doe, Date: 2023-08-05
```

### 10. Shell Script
Shell脚本用于自动化任务，在Unix/Linux系统中广泛使用。

```sh
#!/bin/bash
order_id=12345
customer="John Doe"
date="2023-08-05"
echo "OrderID: $order_id, Customer: $customer, Date: $date"
```

这些格式各有其特定的应用场景，选择哪种格式取决于具体的需求和使用环境。


# 参考资料

* any list
{:toc}