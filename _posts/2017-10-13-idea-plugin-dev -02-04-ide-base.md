---
layout: post
title:  Idea Plugin Dev-02-04-IDE Infrastructure IDE基础架构
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# Logging

IntelliJ 平台使用 Logger 抽象类来屏蔽底层日志记录实现和配置。

插件应该获得一个专用实例：

```java
import com.intellij.openapi.diagnostic.Logger;

public class MyPluginClass {

  private static final Logger LOG = Logger.getInstance(MyPluginClass.class);

  public void someMethod() {
    LOG.info("someMethod() was called");
  }

}
```

默认情况下，所有具有 INFO 和更高级别的消息都写入日志输出文件 `idea.log`。 

要为特定类别启用 DEBUG/TRACE 日志记录，请使用帮助 | 诊断工具 | 调试日志设置。

要找到日志文件，请选择帮助 | 显示登录 Finder/Explorer 操作。 启用内部模式后，可以使用 Help | 打开当前运行的 IDE 日志文件。 在编辑器中打开登录。

要为特定安装找到它，请参阅此知识库文章。 有关如何为开发实例找到它的信息，请参阅开发实例沙箱目录。

请参阅测试常见问题解答，了解如何在测试期间启用 DEBUG/TRACE 级别的日志记录，并获取失败测试的单独日志。

要为报告致命错误提供额外的上下文，请使用 Logger.error() 方法获取额外的附件（请参阅 AttachmentFactory）。

# 错误报告

IDE 将显示自己捕获的致命错误，并在 IDE 致命错误对话框中记录具有 ERROR 级别的消息：

对于 IDE 平台：在 EAP 版本中或在内部模式下运行时

对于第三方插件：总是

对于后者，默认情况下禁用报告 - 相反，有一个选项可以禁用导致异常的插件。

为了让用户向供应商报告此类错误，插件可以实现在 com.intellij.errorHandler 扩展点中注册的自定义 ErrorReportSubmitter。 

请参阅 IntelliJ Platform Explorer 以了解现有的实现——从预填充基于 Web 的问题跟踪器表单到全自动提交到日志监控系统。 本教程还提供了使用哨兵的工作解决方案。

要禁用状态栏中的红色感叹号通知图标，请调用帮助 | 编辑自定义属性...并在打开的 idea.properties 中添加 idea.fatal.error.notification=disabled。

# 运行时信息

ApplicationInfo 提供有关 IDE 版本和供应商的信息。 注意：要限制兼容性，请通过 plugin.xml 声明 IDE 和版本。

要获取有关操作系统和 Java VM 的信息，请使用 SystemInfo。

要访问相关配置目录，请参阅 PathManager。

要获取唯一的安装 UUID，请使用 PermanentInstallationID。

# 上下文帮助

要显示插件功能的自定义上下文基于 Web 的帮助（例如，用于对话框），请提供在 com.intellij.webHelpProvider 扩展点中注册的 WebHelpProvider。

# 一次运行任务

使用 RunOnceUtil 为每个项目/应用程序运行一次任务。

# 应用事件

可以通过 AppLifecycleListener 侦听器跟踪应用程序生命周期事件。 另请参阅应用程序启动和项目和应用程序关闭。

注册 ApplicationActivationListener 侦听器以接收“应用程序聚焦/未聚焦”事件的通知。

要请求重新启动 IDE，请使用 Application.restart()

# 省电模式

文件 | 可以启用省电模式以限制笔记本电脑上的耗电功能。 

使用 PowerSaveMode 服务和 PowerSaveMode.Listener 主题相应地禁用插件中的此类功能。

# 插件管理

可以通过 PluginManagerCore.isPluginInstalled() 检查已安装的插件。

## 插件建议

对于特定功能（例如，文件类型、Facet 等），IDE 会建议自动安装匹配的插件。 有关详细信息，请参阅 Marketplace 文档中的插件推荐。

要建议其他相关插件，请使用 PluginsAdvertiser.installAndEnable()。

## 弃用插件

要建议用新插件替换当前安装的已弃用插件，请实施在 com.intellij.pluginReplacement 扩展点中注册的 PluginReplacement。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/ide-infrastructure.html#context-help

* any list
{:toc}