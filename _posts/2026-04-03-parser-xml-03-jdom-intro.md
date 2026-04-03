---
layout: post 
title: dom4j = Java 里一个偏“工程实用”的 XML 处理库
date: 2026-04-03 21:01:55 +0800
categories: [XML]
tags: [xml, ast]
published: true
---



我按你前面要 dom4j 的方式，把 **JDOM 官方入门 + Maven + 核心用法**整理成一份“工程可直接用”的版本。

---

# 一、JDOM 是什么（快速定位）

**JDOM = 更“Java风格”的 XML 操作库**

设计目标：

* 比原生 DOM 更简单
* API 更符合 Java 习惯（List / Iterator）
* 面向开发者体验（不是标准规范驱动）

👉 一句话：

> JDOM = “写起来最顺手的 XML API 之一”

---

# 二、Maven 引入（推荐）

## ✅ JDOM 2.x（必须用这个）

```xml
<dependency>
    <groupId>org.jdom</groupId>
    <artifactId>jdom2</artifactId>
    <version>2.0.6.1</version>
</dependency>
```

👉 注意：

* 老版本 `jdom`（1.x）基本不用了
* 一定用 `jdom2`

---

# 三、最小入门示例（官方核心）

---

## 1️⃣ 解析 XML

```java
import org.jdom2.Document;
import org.jdom2.input.SAXBuilder;

SAXBuilder builder = new SAXBuilder();
Document document = builder.build(new File("test.xml"));
```

👉 类似：

* dom4j → SAXReader
* JDOM → SAXBuilder

---

## 2️⃣ 获取根节点

```java
Element root = document.getRootElement();
```

---

## 3️⃣ 读取子节点

```java
List<Element> users = root.getChildren("user");

for (Element user : users) {
    String name = user.getChildText("name");
    System.out.println(name);
}
```

👉 比 dom4j 更“Java直觉”的 API：

* `getChildText()`（很舒服）

---

## 4️⃣ 获取属性

```java
String id = user.getAttributeValue("id");
```

---

# 四、创建 XML（核心用法）

```java
import org.jdom2.Document;
import org.jdom2.Element;

Element root = new Element("users");
Document document = new Document(root);

Element user = new Element("user");
user.setAttribute("id", "1");

user.addContent(new Element("name").setText("echo"));

root.addContent(user);
```

---

# 五、输出 XML

```java
import org.jdom2.output.XMLOutputter;
import org.jdom2.output.Format;

XMLOutputter outputter = new XMLOutputter(Format.getPrettyFormat());
outputter.output(document, System.out);
```

输出：

```xml
<users>
  <user id="1">
    <name>echo</name>
  </user>
</users>
```

---

# 六、XPath（JDOM 2 支持）

```java
import org.jdom2.xpath.XPathFactory;
import org.jdom2.xpath.XPathExpression;

XPathFactory factory = XPathFactory.instance();

XPathExpression<Element> expr =
    factory.compile("//user/name", Filters.element());

List<Element> result = expr.evaluate(document);

for (Element e : result) {
    System.out.println(e.getText());
}
```

👉 注意：

* JDOM 的 XPath 比 dom4j **更规范（但稍复杂）**

---

# 七、核心对象模型

```text
Document
 └── Element
      ├── Attribute
      └── Content (Text / CDATA / Comment)
```

👉 和 dom4j 很像，但：

* JDOM 类型更“强类型化”

---

# 八、和 dom4j 对比（重点）

| 维度      | JDOM  | dom4j |
| ------- | ----- | ----- |
| API 易用性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐  |
| XPath   | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ |
| 灵活性     | ⭐⭐⭐   | ⭐⭐⭐⭐⭐ |
| Java风格  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐   |

👉 结论：

* 想写代码舒服 → JDOM
* 想做复杂规则（XPath重）→ dom4j

---

# 九、工程建议（结合你的背景）

你现在在做：

> 自动化测试平台 / DSL / 规则系统

建议：

### ✔ 用 JDOM 的场景

* XML 配置解析
* 简单结构转换
* 数据导入导出

### ✔ 用 dom4j 的场景

* XPath规则匹配
* DSL执行引擎
* 动态查询

---

# 十、一句话总结

> JDOM = “最符合 Java 直觉的 XML 操作库”

# 参考资料

* any list
{:toc}