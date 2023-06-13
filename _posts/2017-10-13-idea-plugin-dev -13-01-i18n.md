---
layout: post
title:  Idea Plugin Dev-13-01-I18N 国际化 Localization
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---


# 介绍一下 idea 插件的 Localization 语言国际化

在 IntelliJ IDEA 插件开发中，你可以使用 Localization（本地化）来实现插件界面的国际化，使得插件可以适应不同的语言环境。通过本地化，你可以将插件的文本、标签、消息等内容根据用户的语言偏好显示不同的翻译版本。

下面是实现插件本地化的一般步骤：

1. 创建资源包（Resource Bundle）：资源包是存储翻译文本的文件，一般以 `.properties` 后缀命名。在插件的 `src` 目录下创建一个新的文件夹，命名为 `resources`，然后在其中创建一个名为 `messages` 的文件夹。在 `messages` 文件夹中创建一个 `messages.properties` 文件，该文件将包含插件界面的文本内容的键值对。

2. 定义翻译文本：打开 `messages.properties` 文件，在其中按照以下格式定义翻译文本的键值对。键是用于标识翻译文本的唯一标识符，值是对应的翻译文本。

```properties
my.plugin.greeting=Hello!
my.plugin.button.label=Click Me!
```

3. 创建其他语言的资源包：为了支持多语言，你可以在 `messages` 文件夹中创建其他语言的资源包文件，例如 `messages_de.properties`（德语）和 `messages_fr.properties`（法语）。在这些文件中，你可以提供相同键的不同翻译文本。

4. 在插件代码中使用本地化文本：在插件代码中，你可以使用 `PropertiesComponent` 类或 `ResourceBundle` 类来加载本地化的文本。以下是示例代码：

```java
import com.intellij.openapi.components.PropertiesComponent;
import java.util.ResourceBundle;
// 使用 PropertiesComponent 加载本地化文本
String greeting = PropertiesComponent.getInstance().getValue("my.plugin.greeting");
// 使用 ResourceBundle 加载本地化文本
ResourceBundle bundle = ResourceBundle.getBundle("messages.messages");
String buttonLabel = bundle.getString("my.plugin.button.label");
```

你可以根据需要使用 `PropertiesComponent` 或 `ResourceBundle`，根据键获取相应的翻译文本。

5. 将插件打包为 JAR 文件：在构建插件时，确保将 `resources` 文件夹及其内容包含在插件的 JAR 文件中。

6. 提供多语言支持：为了让用户能够在 IntelliJ IDEA 中选择使用的语言，你可以在插件的 `plugin.xml` 文件中添加 `<depends>` 元素，并引用 `com.intellij.modules.platform` 插件模块。这样，用户将能够在 IntelliJ IDEA 的设置中选择所需的语言。

以上是一般的插件本地化步骤，可以根据你的插件需求和目标语言进行相应的调整。通过插件本地化，你可以通过插件本地化，你可以提供更好的用户体验，使得插件适应不同语言环境的用户需求。

## 技巧

以下是一些关于插件本地化的进一步技巧和注意点：

1. 处理动态文本：除了静态文本之外，插件可能还包含动态生成的文本，例如动态错误消息或动态标签。

对于这些动态文本，你可以使用 `MessageFormat` 类或者类似的工具来将变量插入翻译文本中。

```java
String username = getUsername(); // 获取动态文本
String greeting = bundle.getString("my.plugin.greeting");
String formattedGreeting = MessageFormat.format(greeting, username);
```

2. 支持可选的语言：除了支持常见的语言，你也可以考虑支持一些较少使用的语言，这样可以扩大插件的受众范围。

3. 处理语言特定的格式：不同语言的格式要求可能不同，例如日期、时间和货币格式等。确保在本地化文本中考虑到这些语言特定的格式，并根据需要进行适当的格式化。

4. 考虑 RTL（从右到左）语言：某些语言（如阿拉伯语、希伯来语等）是从右到左书写的，而不是从左到右。当本地化插件时，确保界面的布局和排列适应RTL语言，以提供更好的用户体验。

5. 为翻译者提供上下文：在翻译文本时，提供足够的上下文信息对于翻译者非常重要。这可以通过提供详细的注释、上下文示例或者与翻译者的沟通来实现。这样可以确保翻译文本的准确性和一致性。

6. 定期更新翻译：随着插件的演进和功能增加，新的文本可能会添加到插件中。确保及时更新翻译文件，以便提供最新的翻译文本。

7. 测试本地化：在开发插件时，测试本地化是至关重要的。确保在不同语言环境下测试插件的界面，以验证翻译文本的正确性和适应性。

通过遵循上述技巧和注意点，你可以有效地进行插件本地化，为不同语言环境的用户提供更好的用户体验，并扩大插件的用户群体。

# PropertiesComponent 和 ResourceBundle 加载本地化文本 有什么区别？建议使用哪一个

`PropertiesComponent` 和 `ResourceBundle` 都可以用于加载本地化文本，但它们在实现和使用上有一些区别。下面是它们的主要区别以及建议的使用情况：

1. 实现方式：
   - `PropertiesComponent` 是 IntelliJ IDEA 平台提供的一个类，用于处理插件的持久化配置。它允许你存储和读取键值对形式的配置信息，包括本地化文本。你可以使用 `PropertiesComponent` 来存储和获取本地化文本，但它主要用于存储插件的配置信息。
   - `ResourceBundle` 是 Java 标准库中的一个类，用于加载本地化资源文件。它基于属性文件（.properties）来存储本地化文本，每个语言对应一个属性文件。你可以使用 `ResourceBundle` 来加载和访问本地化文本。

2. 文件格式：
   - `PropertiesComponent` 使用基于 XML 格式的文件来存储配置信息，而不是传统的 .properties 文件格式。
   - `ResourceBundle` 使用标准的 .properties 文件格式来存储本地化文本。

3. 使用场景：
   - `PropertiesComponent` 适合于存储插件的配置信息，包括用户自定义的设置和状态。它提供了方便的 API 来读取和写入配置值，并自动处理持久化。
   - `ResourceBundle` 适合于加载本地化文本，特别是在需要多语言支持的场景下。它可以根据当前的语言环境加载相应的属性文件，并提供简单的 API 来获取本地化文本。

综上所述，如果你需要存储插件的配置信息，并且需要处理持久化和用户自定义设置，那么建议使用 `PropertiesComponent`。如果你只需要加载本地化文本，而不涉及插件配置的存储和读取，那么建议使用 `ResourceBundle`。

需要注意的是，`PropertiesComponent` 是 IntelliJ IDEA 平台特定的类，而 `ResourceBundle` 是 Java 标准库中的类，可以在不同的 Java 应用程序中使用。因此，如果你的插件需要在不同的 IDE 或其他 Java 应用程序中使用，使用 `ResourceBundle` 可能更具通用性。

# 应用程序包布局

关于本地化目的，所有需要翻译的资源（英文）都位于名为 resources_en.jar 的 jar 文件中。 

IDEA 核心功能有一个这样的 jar 文件位于 `INSTALL_HOME\lib\resources_en.jar`，每个捆绑插件都有一个 jar 文件位于 `INSTALL_HOME\plugins$Plugin$\lib\resources_en.jar`。

翻译后的资源应该被压缩并完全放在原始 jar 来自的同一文件夹中。 

因此，本地化包应该具有完全相同数量的 jar 文件，并且它们的布局方式必须与原始 jar 的布局方式完全相同。 

为了在每个安装中启用多个本地化而不让本地化包相互覆盖，我们建议在 jar 名称中包含语言环境的名称（例如，resources_ja.jar）。

# resources_en.jar 的内容和布局

属性文件通常包含消息、菜单项、对话框标签文本等。

对于每个这样的文件，本地化的 jar 应该包含翻译版本，该版本被放置在相对于 jar 根目录完全相同的路径中，并且具有与原始文件完全相同的名称加上区域设置标识符。 

例如，来自 resources_en.jar 的 messages/ActionsBundle.properties 文件应该在 resources_ja.jar 中有其翻译版本的 messages/ActionsBundle_ja.properties 文件。 

所有属性文件都应使用 `\uXXXX` 序列进行 ASCII 编码，这些序列用于在 ASCII 范围内没有表示的字符。 有关详细信息，请参阅 native2ascii 工具。

属性值主要遵循 MessageFormat 规则。

# 组件位置

检查描述出现在设置|错误中，并代表有关每个检查工具打算做什么的简短信息。 

每个描述都由 /inspectionDescriptions/ 文件夹下的单个 html 文件表示，该文件应以 UTF-8 编码进行编码。 

本地化版本应存储在以 locale 为后缀的文件夹中。 

例如从resources_en.jar翻译的/inspectionDescriptions/CanBeFinal.html应该放在resources_ja.jar中的/inspectionDescriptions_ja/CanBeFinal.html。

意向描述和样品与检验描述非常相似，但布局更高级一些。 

每个意图都有一堆文件位于 /intentionDescriptions/ 中以意图的简称命名的文件夹中。 

这些文件包括 description.html，其中包含类似于检查一的描述以及几个模板文件，用于演示意图将对样本执行的操作。 

这些模板是可选的翻译。 

与检查描述类似，整个 intentionDescriptions 文件夹应以区域设置标识符为后缀。 

例如 /intentionDescriptions/AddOnDemandStaticImportAction/description.html 翻译应该放在 /intentionDescriptions_ja/AddOnDemandStaticImportAction/description.html 中。 所有 HTML 文件都应采用 UTF-8 编码。

当天的提示遵循相同的模式检查和意图。 

例如，/tips/AdaptiveWelcome.html 的翻译转到 /tips_ja/AdaptiveWelcome.html。 

提示的唯一特别之处在于它们使用特殊模式来表示 EnterAction 等快捷方式； 

在运行时将替换为映射到当前使用的键盘映射中的 EnterAction 的击键。 

因此，请确保在翻译时完整保留这些序列。 

记住 UTF-8 编码。

文件模板再次采用相同的方式（如果需要翻译的话）。 

`/fileTemplates/Singleton.java.ft` 转到 `/fileTemplates_ja/Singleton.java.ft`。

遵循 Sun 的属性包规则，只要在本地化版本中找不到某些资源，就会使用 resources_en.jar 中的默认版本。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/localization-guide.html

* any list
{:toc}