---
layout: post 
title: dom4j = Java 里一个偏“工程实用”的 XML 处理库
date: 2026-04-03 21:01:55 +0800
categories: [XML]
tags: [xml, ast]
published: true
---

# 一、dom4j 是什么（快速理解）

**dom4j = Java 里一个偏“工程实用”的 XML 处理库**

核心特点：

* 支持 **DOM + SAX + XPath + JAXP**
* 基于 Java 集合（比原生 DOM 更好用）
* API 更灵活，适合复杂 XML 操作 ([GitHub][1])

👉 简单对比：

* 原生 DOM：啰嗦
* SAX：流式但难写
* dom4j：**可读性 + 灵活性平衡**

---

# 二、Maven 引入（最关键）

### ✅ 推荐使用最新版（当前主流）

```xml
<dependency>
    <groupId>org.dom4j</groupId>
    <artifactId>dom4j</artifactId>
    <version>2.2.0</version>
</dependency>
```

([Maven Central][2])

---

### ⚠️ 可选依赖（很多人踩坑点）

dom4j **不再自动引入一些依赖**，比如 XPath 支持：

```xml
<dependency>
    <groupId>jaxen</groupId>
    <artifactId>jaxen</artifactId>
    <version>1.2.0</version>
</dependency>
```

👉 否则：

* `selectNodes()` / XPath 可能报错

官方说明：部分依赖是 optional，需要手动引入 ([GitHub][1])

---

# 三、官方入门（核心 API）

## 1️⃣ 解析 XML（最基础）

```java
import org.dom4j.Document;
import org.dom4j.io.SAXReader;

SAXReader reader = new SAXReader();
Document document = reader.read(new File("test.xml"));
```

👉 本质：

* SAXReader → 解析器
* Document → 整个 XML 树

([dom4j][3])

---

## 2️⃣ 获取节点

```java
Element root = document.getRootElement();
```

---

## 3️⃣ 遍历子节点

```java
List<Element> elements = root.elements("user");

for (Element e : elements) {
    System.out.println(e.elementText("name"));
}
```

---

## 4️⃣ XPath（核心能力）

```java
List<Node> nodes = document.selectNodes("//user/name");

for (Node node : nodes) {
    System.out.println(node.getText());
}
```

👉 这个是 dom4j 最大优势之一（比 DOM 强很多）

---

## 5️⃣ 创建 XML

```java
Document document = DocumentHelper.createDocument();
Element root = document.addElement("users");

Element user = root.addElement("user");
user.addElement("name").setText("echo");
```

---

## 6️⃣ 写出 XML

```java
XMLWriter writer = new XMLWriter(new FileWriter("out.xml"));
writer.write(document);
writer.close();
```

---

# 四、核心对象模型（必须搞清楚）

这是 dom4j 的核心抽象：

```
Document
 └── Element
      ├── Attribute
      └── Text
```

重点理解：

| 类型        | 作用           |
| --------- | ------------ |
| Document  | 整个 XML       |
| Element   | 标签           |
| Attribute | 属性           |
| Node      | XPath 结果统一接口 |

---

# 五、常见使用模式（工程视角）

## ✔ 场景1：配置文件解析

* 读取 XML → 转对象

## ✔ 场景2：日志/数据转换

* XML → JSON / DTO

## ✔ 场景3：规则引擎（你这种架构会用到）

* XPath 做规则匹配

👉 dom4j 在“规则/DSL类系统”里特别常见

---

# 六、优缺点（架构师视角）

### 👍 优点

* XPath 强（比 JDK 自带好用）
* API 简洁
* 灵活性高

### 👎 缺点

* 不是流式（大 XML 内存压力）
* 社区活跃度一般
* 不如 Jackson / JAXB 现代

---

# 七、和现代方案对比（关键）

| 方案          | 推荐度   | 说明        |
| ----------- | ----- | --------- |
| dom4j       | ⭐⭐⭐   | 老牌稳定      |
| JAXB        | ⭐⭐⭐⭐  | Java 标准绑定 |
| Jackson XML | ⭐⭐⭐⭐⭐ | 现代主流      |

👉 如果你是做平台 / AI / DSL：

* dom4j 仍然**很适合做解析层**

---

# 八、一句话总结

> dom4j = **“工程友好的 XML 操作库 + 强 XPath 支持”**

# 参考资料

* any list
{:toc}