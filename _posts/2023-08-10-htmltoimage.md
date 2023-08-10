---
layout: post
title: java 实现 html 网页截图
date: 2023-08-10 21:01:55 +0800
categories: [Java]
tags: [tool, java, sh]
published: true
---

# java 代码如何实现网页的截图

要在Java中实现网页截图，您可以使用第三方库，如Selenium WebDriver，它允许您模拟浏览器行为并截取网页的屏幕截图。

以下是一个简单的示例代码，展示如何使用Selenium WebDriver在Java中截取网页截图：

首先，确保您已经添加了Selenium WebDriver的依赖。您可以使用Maven或Gradle来管理依赖项。以下是一个使用Maven的示例 `pom.xml` 文件：

```xml
<dependencies>
    <dependency>
        <groupId>org.seleniumhq.selenium</groupId>
        <artifactId>selenium-java</artifactId>
        <version>3.141.59</version>
    </dependency>
</dependencies>
```

接下来，您可以使用以下Java代码来实现网页截图：

```java
package org.example;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import java.io.FileOutputStream;
import java.io.IOException;

public class WebpageScreenshotChrome {

    /**
     * https://chromedriver.chromium.org/downloads
     *
     * @param args
     */
    public static void main(String[] args) {
        // 设置 ChromeDriver 路径
        System.setProperty("webdriver.chrome.driver", "D:\\tool\\chrome\\chromedriver_win32\\chromedriver.exe");

        // 创建一个 Chrome 浏览器实例
        WebDriver driver = new ChromeDriver();

        // 打开网页
        driver.get("https://www.github.com");

        // 进行截图
        if (driver instanceof TakesScreenshot) {
            TakesScreenshot screenshotDriver = (TakesScreenshot) driver;
            // 获取截图并保存为文件
            byte[] screenshot = screenshotDriver.getScreenshotAs(OutputType.BYTES);

            // 指定保存文件路径
            String filePath = "D:\\code\\learn\\screen-shoot-demo/screenshot.png";

            // 将截图保存到指定文件路径
            try (FileOutputStream outputStream = new FileOutputStream(filePath)) {
                outputStream.write(screenshot);
                System.out.println("Screenshot saved to: " + filePath);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        // 关闭浏览器
        driver.quit();
    }
}
```

在上述代码中，您需要将 `"D:\\tool\\chrome\\chromedriver_win32\\chromedriver.exe"` 替换为您实际的 ChromeDriver 路径。

此外，您还可以根据需要进行适当的错误处理和文件保存操作。

请注意，这只是一个基本示例。您可以根据需要添加更多功能和错误处理。

另外，您也可以使用其他浏览器的驱动程序（如Firefox、Edge等）来实现类似的截图功能。

这里前提需要你去 [https://chromedriver.chromium.org/downloads](https://chromedriver.chromium.org/downloads) 下载一个驱动。

# 小结

上面的方式算是比较好的实现方式，图片算是完整的。

其他的很多方式，思路大概是把 html 转为 pdf，然后处理，经常存在 css 样式问题。

# 参考资料

chat

* any list
{:toc}