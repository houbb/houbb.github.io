---
layout: post
title: 字符串值提取工具-08-java 执行 xml 解析, xpath
date: 2024-08-05 21:01:55 +0800
categories: [Java]
tags: [java, open-source, tool, sh]
published: true
---

# 场景

我们希望通过 java 执行 xml-path 解析 xml。

## 说明

基本等同于不支持，忽略。

# chat

## Q: 详细介绍一下 java 如何通过 xpath，解析 xml 字符串？

在 Java 中，使用 XPath 解析 XML 字符串是一种常见的操作。XPath 是一种用于在 XML 文档中查找信息的语言。下面是如何通过 Java 代码使用 XPath 解析 XML 字符串的详细步骤。

### 1. 导入必要的库
首先，需要导入 Java 标准库中的几个类：

```java
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;
import org.w3c.dom.NodeList;
import org.w3c.dom.Node;
```

### 2. 准备 XML 字符串
假设有一个简单的 XML 字符串，如下所示：

```xml
String xml = """
<company>
    <employee>
        <name>John Doe</name>
        <position>Software Engineer</position>
        <salary>75000</salary>
    </employee>
    <employee>
        <name>Jane Smith</name>
        <position>Project Manager</position>
        <salary>85000</salary>
    </employee>
</company>
""";
```

### 3. 解析 XML 字符串为 Document 对象
首先，需要将 XML 字符串转换为 `Document` 对象，这样才能使用 XPath 进行解析。

```java
DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
DocumentBuilder builder = factory.newDocumentBuilder();
Document document = builder.parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));
```

### 4. 创建 XPath 对象
一旦有了 `Document` 对象，可以创建 `XPath` 对象来执行 XPath 查询。

```java
XPathFactory xPathFactory = XPathFactory.newInstance();
XPath xpath = xPathFactory.newXPath();
```

### 5. 编写 XPath 表达式并执行查询
现在可以编写 XPath 表达式来查询 XML 数据。例如，查询所有员工的名字和职位：

```java
// 查询所有员工的名字
XPathExpression exprName = xpath.compile("//employee/name/text()");
NodeList nameNodes = (NodeList) exprName.evaluate(document, XPathConstants.NODESET);

for (int i = 0; i < nameNodes.getLength(); i++) {
    System.out.println("Name: " + nameNodes.item(i).getNodeValue());
}

// 查询所有员工的职位
XPathExpression exprPosition = xpath.compile("//employee/position/text()");
NodeList positionNodes = (NodeList) exprPosition.evaluate(document, XPathConstants.NODESET);

for (int i = 0; i < positionNodes.getLength(); i++) {
    System.out.println("Position: " + positionNodes.item(i).getNodeValue());
}
```

### 6. 完整代码示例
将所有步骤整合到一起的完整代码示例如下：

```java
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;
import org.w3c.dom.NodeList;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

public class XPathExample {
    public static void main(String[] args) {
        try {
            String xml = """
            <company>
                <employee>
                    <name>John Doe</name>
                    <position>Software Engineer</position>
                    <salary>75000</salary>
                </employee>
                <employee>
                    <name>Jane Smith</name>
                    <position>Project Manager</position>
                    <salary>85000</salary>
                </employee>
            </company>
            """;

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));

            XPathFactory xPathFactory = XPathFactory.newInstance();
            XPath xpath = xPathFactory.newXPath();

            // 查询所有员工的名字
            XPathExpression exprName = xpath.compile("//employee/name/text()");
            NodeList nameNodes = (NodeList) exprName.evaluate(document, XPathConstants.NODESET);
            for (int i = 0; i < nameNodes.getLength(); i++) {
                System.out.println("Name: " + nameNodes.item(i).getNodeValue());
            }

            // 查询所有员工的职位
            XPathExpression exprPosition = xpath.compile("//employee/position/text()");
            NodeList positionNodes = (NodeList) exprPosition.evaluate(document, XPathConstants.NODESET);
            for (int i = 0; i < positionNodes.getLength(); i++) {
                System.out.println("Position: " + positionNodes.item(i).getNodeValue());
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### 7. 运行结果
运行上述代码后，控制台将输出：

```
Name: John Doe
Name: Jane Smith
Position: Software Engineer
Position: Project Manager
```

### 总结
通过 Java 的标准库，使用 XPath 解析 XML 字符串非常直观且强大。你可以编写复杂的 XPath 表达式来选择和提取所需的 XML 数据，这在处理配置文件、Web 服务响应等 XML 格式的数据时非常有用。

## 写一个方法，入参分别是一个 xml 和 xml-path，返回对应的值

你可以创建一个 Java 方法来接收 XML 字符串和 XPath 表达式作为参数，并返回匹配的值。下面是一个简单的实现：

### 方法实现

```java
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

public class XPathParser {

    public static String getValueByXPath(String xml, String xPathExpression) {
        try {
            // 将 XML 字符串解析为 Document 对象
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));

            // 创建 XPath 对象
            XPathFactory xPathFactory = XPathFactory.newInstance();
            XPath xpath = xPathFactory.newXPath();

            // 编译并执行 XPath 表达式
            XPathExpression expr = xpath.compile(xPathExpression);
            String result = (String) expr.evaluate(document, XPathConstants.STRING);

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public static void main(String[] args) {
        String xml = """
        <company>
            <employee>
                <name>John Doe</name>
                <position>Software Engineer</position>
                <salary>75000</salary>
            </employee>
            <employee>
                <name>Jane Smith</name>
                <position>Project Manager</position>
                <salary>85000</salary>
            </employee>
        </company>
        """;

        // 测试 getValueByXPath 方法
        String name = getValueByXPath(xml, "//employee[1]/name/text()");
        String position = getValueByXPath(xml, "//employee[2]/position/text()");

        System.out.println("First employee name: " + name);         // 输出: John Doe
        System.out.println("Second employee position: " + position); // 输出: Project Manager
    }
}
```

### 说明

- **方法名**: `getValueByXPath`
- **参数**:
  - `xml`：要解析的 XML 字符串。
  - `xPathExpression`：要查询的 XPath 表达式。
- **返回值**: 根据 XPath 表达式匹配到的 XML 节点值，如果未找到则返回 `null`。

### 使用方法
1. 将你的 XML 字符串和 XPath 表达式传递给 `getValueByXPath` 方法。
2. 该方法会返回与 XPath 匹配的文本内容。

### 代码运行结果
假设你运行上述代码，输出如下：

```
First employee name: John Doe
Second employee position: Project Manager
```

### 灵活性
这个方法可以根据你的需求进行扩展，比如可以返回 `NodeList`（多个节点的值），处理异常时返回更多的错误信息等。

# 参考资料

* any list
{:toc}