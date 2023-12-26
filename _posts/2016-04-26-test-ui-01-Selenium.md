---
layout: post
title:  test ui-01-UI 测试组件之 Selenium 入门介绍
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, ui-test, test]
published: true
---


# Selenium

## Selenium 浏览器自动化项目

Selenium 是一个涵盖多种工具和库的项目，旨在支持和实现对 Web 浏览器的自动化。

它提供了扩展来模拟用户与浏览器的交互，一个用于扩展浏览器分配的分发服务器，以及符合 W3C WebDriver 规范的基础设施，使您能够为所有主要的 Web 浏览器编写可互换的代码。

这个项目得以实现，得益于那些自愿贡献的志愿者，他们投入了数千小时的个人时间，并将源代码免费提供给任何人使用、享受和改进。

Selenium 将浏览器供应商、工程师和热衷者聚集在一起，促进了关于 Web 平台自动化的开放讨论。该项目每年都会组织一次会议，以教授和培养社区。

在 Selenium 的核心是 WebDriver，它是一个编写指令集的接口，可以在许多浏览器中互换运行。

一旦您安装好一切，只需几行代码，您就可以进入浏览器。

您可以在《编写您的第一个 Selenium 脚本》中找到更详细的示例。

## java 例子

```java
package dev.selenium.hello;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class HelloSelenium {
    public static void main(String[] args) {
        WebDriver driver = new ChromeDriver();

        driver.get("https://selenium.dev");

        driver.quit();
    }
}
```

# 入门指南

如果您是初次接触 Selenium，我们有一些资源可以帮助您立即掌握要领。

Selenium 支持通过 WebDriver 实现对市场上所有主要浏览器的自动化。

WebDriver 是一个 API 和协议，定义了一种与控制 Web 浏览器行为的语言无关的接口。

每个浏览器都由一个特定的 WebDriver 实现支持，称为驱动程序。驱动程序是将指令传递给浏览器并处理 Selenium 与浏览器之间通信的组件。

这种分离是有意为之的，目的是让浏览器供应商对其浏览器的实现负责。Selenium 尽可能利用这些第三方驱动程序，但也为那些这不是现实的情况提供了由项目维护的自己的驱动程序。

Selenium 框架通过用户界面将所有这些部分联系在一起，使不同的浏览器后端能够透明地使用，实现跨浏览器和跨平台的自动化。

Selenium 的设置与其他商业工具的设置非常不同。在您可以开始编写 Selenium 代码之前，您必须安装所选语言的语言绑定库、要使用的浏览器以及该浏览器的驱动程序。

请按以下链接了解如何使用 Selenium WebDriver。

如果您想使用低代码/录制和回放工具开始，请查看 Selenium IDE。

一旦您使一切正常运行，如果您想扩大测试范围，请查看 Selenium Grid。

## 安装 lib

设置您喜欢的编程语言的 Selenium 库。

首先，您需要为自动化项目安装 Selenium 绑定。库的安装过程取决于您选择使用的语言。

确保您查看 [Selenium 下载页面](https://www.selenium.dev/downloads/)，以确保您使用的是最新版本。

以 java maven 为例子

```xml
<dependency>
    <groupId>org.seleniumhq.selenium</groupId>
    <artifactId>selenium-java</artifactId>
    <version>4.16.1</version>
</dependency>
```

## 第一个脚本

八个基本组件

Selenium 所做的一切都是向浏览器发送命令以执行某些操作或发送请求获取信息。您在使用 Selenium 时将主要使用这些基本命令的组合。

点击链接“在 GitHub 上查看完整示例”以查看上下文中的代码。

### 1. 启动会话

```java
WebDriver driver = new ChromeDriver();
```

### 2. 执行动作

```java
driver.get("https://www.selenium.dev/selenium/web/web-form.html");
```

### 3. 请求浏览器信息

```java
driver.getTitle();
```

### 4. 建立等待策略

与浏览器的当前状态同步代码是使用 Selenium 面临的最大挑战之一，而良好地执行这一点是一个高级话题。

基本上，您希望确保在尝试定位元素之前该元素在页面上，且在尝试与之交互之前该元素处于可交互状态。

隐式等待很少是最佳解决方案，但在这里它是最容易演示的，因此我们将其用作占位符。

阅读有关等待策略的更多信息。

```java
driver.manage().timeouts().implicitlyWait(Duration.ofMillis(500));
```

### 5. 发现一个元素

```java
WebElement textBox = driver.findElement(By.name("my-text"));
WebElement submitButton = driver.findElement(By.cssSelector("button"));
```

### 6. 元素上执行动作

```java
textBox.sendKeys("Selenium");
submitButton.click();
```

### 7. 请求元素信息

```java
message.getText();
```

### 8. 退出

```java
driver.quit();
```

# 实际使用

如果您想运行超过少数一次性脚本，您需要能够组织和处理您的代码。这一页应该为您提供如何实际用 Selenium 代码执行有意义的任务的想法。

## 常见用途

大多数人使用 Selenium 执行 Web 应用程序的自动化测试，但 Selenium 支持浏览器自动化的任何用例。

## 重复性任务

也许您需要登录到网站并下载一些东西，或者提交一个表单。您可以创建一个 Selenium 脚本，定期在预设时间运行。

## 网页抓取

您是否希望从一个没有 API 的网站收集数据？Selenium 可以帮助您做到这一点，但请确保您熟悉该网站的服务条款，因为有些网站不允许这样做，而其他网站甚至会阻止 Selenium。

## 测试

在测试中运行 Selenium 需要对 Selenium 执行的操作进行断言。因此，需要一个良好的断言库。为测试提供结构的其他功能需要使用测试运行器。

## 代码合并

把上面的代码合并：

```java
package dev.selenium.getting_started;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class UsingSeleniumTest {

    @Test
    public void eightComponents() {
        WebDriver driver = new ChromeDriver();
        driver.get("https://www.selenium.dev/selenium/web/web-form.html");

        String title = driver.getTitle();
        assertEquals("Web form", title);

        driver.manage().timeouts().implicitlyWait(Duration.ofMillis(500));

        WebElement textBox = driver.findElement(By.name("my-text"));
        WebElement submitButton = driver.findElement(By.cssSelector("button"));

        textBox.sendKeys("Selenium");
        submitButton.click();

        WebElement message = driver.findElement(By.id("message"));
        String value = message.getText();
        assertEquals("Received!", value);

        driver.quit();
    }

}
```

# chat

## 详细介绍 UI 测试组件 Selenium

Selenium是一个广泛用于Web应用程序自动化测试的工具。

它支持多种编程语言，包括Java、Python、C#、Ruby等，允许测试人员使用这些语言编写测试脚本。

Selenium可以用于执行各种Web应用程序测试，包括功能测试、回归测试和性能测试。

以下是关于Selenium的详细介绍：

### 1. **架构和组件：**
   - **WebDriver：** Selenium WebDriver是Selenium的核心组件之一，用于直接与浏览器进行交互。它提供了各种用于模拟用户操作的方法，如点击、输入、导航等。
   - **Selenium Grid：** Selenium Grid允许并行运行多个测试，可以在不同的机器和浏览器上同时执行测试。它是一个用于分布式测试的工具。

### 2. **支持的浏览器：**
   - Selenium支持多种主流的浏览器，包括Chrome、Firefox、Safari、Edge等。通过浏览器驱动，Selenium能够在这些浏览器上执行自动化测试。

### 3. **特性和功能：**
   - **多语言支持：** Selenium支持多种编程语言，允许测试人员使用他们熟悉的语言编写测试脚本。
   - **多浏览器支持：** 可以在不同浏览器上运行相同的测试用例，确保跨浏览器兼容性。
   - **等待机制：** Selenium提供了等待机制，使测试脚本能够等待页面元素加载完成，以避免由于异步加载导致的测试失败。
   - **元素定位：** Selenium提供多种元素定位策略，包括ID、类名、标签名、CSS选择器、XPath等，用于准确定位页面上的元素。
   - **截图和屏幕录制：** Selenium可以截取屏幕截图，并支持录制测试执行过程。

### 4. **使用步骤：**
   1. **安装浏览器驱动：** 根据使用的浏览器，下载并安装相应的浏览器驱动。
   2. **编写测试脚本：** 使用选定的编程语言编写Selenium测试脚本，其中包括测试步骤、断言和验证。
   3. **执行测试：** 运行测试脚本，Selenium会启动浏览器，并模拟用户与应用程序的交互。
   4. **分析结果：** 检查测试结果，查看通过和失败的测试用例，并根据需要进行调整和修复。

### 5. **示例代码（使用Java）：**
```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class SeleniumExample {
    public static void main(String[] args) {
        // 设置浏览器驱动路径
        System.setProperty("webdriver.chrome.driver", "path/to/chromedriver");

        // 创建Chrome浏览器实例
        WebDriver driver = new ChromeDriver();

        // 打开网页
        driver.get("https://www.example.com");

        // 定位页面元素并执行操作
        WebElement searchBox = driver.findElement(By.name("q"));
        searchBox.sendKeys("Selenium");
        searchBox.submit();

        // 检查搜索结果页面标题
        String pageTitle = driver.getTitle();
        System.out.println("Page Title: " + pageTitle);

        // 关闭浏览器
        driver.quit();
    }
}
```

### 6. **优势和劣势：**
   - **优势：**
     - 广泛支持多种浏览器。
     - 成熟的社区和丰富的文档。
     - 强大的元素定位功能。
     - 可以模拟用户在浏览器中的操作。
   - **劣势：**
     - 对于一些复杂的前端应用，可能需要额外的等待和处理。
     - 对于大规模并行测试，需要使用Selenium Grid。

Selenium 是一款强大的UI自动化测试工具，被广泛应用于Web应用程序的测试领域。

它提供了一系列功能和API，使得测试人员能够编写高效、灵活的自动化测试脚本。

## 给出 Selenium 深入的学习资料，包含网址

以下是深入学习Selenium的一些资料和网址，这些资源包括官方文档、教程、示例代码以及一些建议的书籍：

1. **Selenium 官方文档：**
   - [SeleniumHQ Documentation](https://www.selenium.dev/documentation/en/): Selenium的官方文档，包含详细的API文档、指南和教程。

2. **Selenium GitHub 仓库：**
   - [Selenium GitHub Repository](https://github.com/SeleniumHQ/selenium): Selenium的GitHub仓库包含源代码、问题跟踪和其他与项目相关的信息。

3. **TutorialsPoint Selenium 教程：**
   - [Selenium Tutorial - TutorialsPoint](https://www.tutorialspoint.com/selenium/index.htm): 提供了关于Selenium的教程、指南和示例。

4. **GeeksforGeeks Selenium 教程：**
   - [Selenium - GeeksforGeeks](https://www.geeksforgeeks.org/selenium-python-tutorial/): 针对Python语言的Selenium教程，包含基本概念和示例。

5. **Selenium with Python by Real Python:**
   - [Selenium with Python - Real Python](https://realpython.com/selenium-python/): Real Python网站提供的有关Selenium和Python的深入教程。

6. **Selenium WebDriver 文章系列：**
   - [Selenium WebDriver - An Extensive Guide](https://www.toolsqa.com/selenium-webdriver/selenium-tutorial/): ToolsQA网站上的Selenium WebDriver的详尽指南，包含许多实际例子。

7. **Selenium Grid 文档：**
   - [Selenium Grid Documentation](https://www.selenium.dev/documentation/grid/): Selenium Grid的官方文档，介绍如何在分布式环境中运行测试。

8. **书籍推荐：**
   - ["Selenium WebDriver: From Foundations to Framework" by Yujun Liang and Alex Collins](https://www.amazon.com/Selenium-WebDriver-Foundations-Yujun-Liang/dp/1484259663): 一本深入讲解Selenium WebDriver的书籍，适合想深入了解Selenium的读者。

请注意，Selenium是一个不断演进的开源项目，因此确保查看最新版本的文档和教程以获取最准确和最新的信息。

深入学习Selenium最好通过实际的实践和项目经验，因为实际项目中的挑战有助于更好地理解和应用所学知识。


# 参考资料

https://www.selenium.dev/documentation/webdriver/getting_started/first_script/

* any list
{:toc}