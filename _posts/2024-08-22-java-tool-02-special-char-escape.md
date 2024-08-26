---
layout: post
title: java 字符串的特殊字符转义
date: 2024-08-22 21:01:55 +0800
categories: [Web]
tags: [web, front, js, sh]
published: true
---

# 场景

和另一个系统联调，字符串请求是一个普通的 string。

但是对方是 go 语言，通过 "%s" 直接 format 我们传入的字符串。

此时字符串中出现 `"` `\` 等字符时，就会导致错乱。

# 如何解决？

**使用`StringEscapeUtils`**：Apache Commons Lang库提供了`StringEscapeUtils`工具类，可以用来转义和反转义字符串中的Java控制字符。

例如，使用Apache Commons Lang来转义字符串：

```java
import org.apache.commons.lang3.StringEscapeUtils;

public class Main {
    public static void main(String[] args) {
        String originalString = "This is a test string with \"quotes\" and \\ backslashes.";
        String escapedString = StringEscapeUtils.escapeJava(originalString);
        System.out.println(escapedString);
    }
}
```


# chat

## 如何解决？

在Java中，如果你需要将一个字符串传递给使用Go语言的系统，并且该系统使用`"%s"`来格式化字符串，你需要确保Java中的字符串在Go中被正确地处理，避免特殊字符导致的问题。

在Java中，字符串中的双引号`"`和反斜杠`\`是特殊字符，需要进行转义。以下是一些处理这些特殊字符的方法：

1. **转义双引号**：在Java字符串中，如果要包含一个双引号，你需要使用两个连续的双引号来表示，例如：`"He said, \"Hello!\""`。

2. **转义反斜杠**：在Java字符串中，反斜杠需要被转义，使用`\\`来表示一个实际的反斜杠。

3. **使用`StringEscapeUtils`**：Apache Commons Lang库提供了`StringEscapeUtils`工具类，可以用来转义和反转义字符串中的Java控制字符。

例如，使用Apache Commons Lang来转义字符串：

```java
import org.apache.commons.lang3.StringEscapeUtils;

public class Main {
    public static void main(String[] args) {
        String originalString = "This is a test string with \"quotes\" and \\ backslashes.";
        String escapedString = StringEscapeUtils.escapeJava(originalString);
        System.out.println(escapedString);
    }
}
```

这段代码会将`originalString`中的双引号和反斜杠转义，以便在Java中作为字符串字面量使用。但是，如果你需要将这个字符串传递给Go语言的系统，并且Go使用`"%s"`来格式化，你可能需要进一步处理，以确保在Go中也能正确解析。

在Go中，如果你使用`"%s"`来格式化字符串，通常不需要担心Java中的转义问题，因为`"%s"`会将字符串视为普通字符串。但是，如果你在Go中使用其他格式化选项，比如`"%q"`，它会将字符串中的所有字符都进行转义，包括双引号和反斜杠。

如果你需要确保在Go中也能正确处理这些特殊字符，你可能需要在Java中进行额外的转义，或者在Go中进行相应的解码处理。具体取决于你和Go系统的交互方式和你的需求。

## StringEscapeUtils 中的 escape java/json/script 等有什么区别？

`StringEscapeUtils` 是 Apache Commons Lang 库中的一个工具类，它提供了多种方法来转义字符串中的字符，以适应不同的使用场景。

以下是一些常见的转义方法及其区别：

1. **escapeJava**：这个方法用于转义Java源代码中的控制字符。它会转义单引号`'`、双引号`"`、反斜杠`\`以及Unicode字符。例如，`\n`会被转义为`\\n`，`\t`会被转义为`\\t`等。

2. **escapeJson**：这个方法用于转义JSON字符串。JSON格式要求双引号`"`、反斜杠`\`、控制字符（如换行符`\n`、制表符`\t`等）以及一些其他字符（如`/`和`&`）被转义。例如，`\n`会被转义为`\\n`，`"`会被转义为`\"`。

3. **escapeEcmaScript**：这个方法用于转义ECMAScript（JavaScript）字符串。它转义单引号`'`、双引号`"`、反斜杠`\`以及控制字符。与`escapeJava`类似，但它不会转义Unicode字符。

4. **escapeHtml4**：这个方法用于转义HTML 4.01中的字符。它会将一些特殊字符（如`<`、`>`、`&`、`"`和`'`）转义为相应的HTML实体。

5. **escapeXml**：这个方法用于转义XML文档中的字符。它会转义小于号`<`、和号`&`和大于号`>`，以防止XML解析错误。

6. **escapeHtml3**：与`escapeHtml4`类似，但用于HTML 3.2。

7. **unescapeJava**、**unescapeJson**、**unescapeEcmaScript**、**unescapeHtml4**、**unescapeXml**：这些是相应的反转义方法，用于将转义后的字符串恢复为原始字符串。

每种转义方法都是针对特定语言或格式的需求设计的。例如，如果你需要在JSON中嵌入字符串，你应该使用`escapeJson`；如果你需要在Java源代码中嵌入字符串，应该使用`escapeJava`。选择正确的方法可以确保你的字符串在目标环境中被正确解析和显示。







# 参考资料

https://blog.csdn.net/u011456337/article/details/86180383

github项目地址：https://github.com/lufei222/san-holiday.git

* any list
{:toc}