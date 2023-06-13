---
layout: post
title:  Idea Plugin Dev-07-01-setting
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# setting

设置只是 IntelliJ 平台持久性模型的一种应用。 

设置指南，了解有关设置扩展点和实现的信息。

自定义设置组，了解有关创建自定义设置组和父子关系的信息。

设置教程，了解创建一组简单的自定义设置的分步说明。

# Settings Guide

设置持久存储控制基于 IntelliJ 平台的 IDE 的行为和外观的状态。 

插件可以创建和存储设置，以使用 IntelliJ 平台持久性模型的方式捕获其配置。

设置可以影响不同级别的范围。

# Custom Settings Groups

如设置的扩展点中所述，自定义设置可以声明为现有父组（例如工具）的子组。 

这些父组是基于 IntelliJ 平台的 IDE 中现有的设置类别。

但是，假设自定义设置足够丰富，需要多个级别？ 

例如，自定义设置实现有多个子设置实现。 

扩展点声明可以创建这种多层设置层次结构。


# 如何使用

## 详细介绍一下 idea 插件中的 setting

在 IntelliJ IDEA 插件开发中，"Settings" 是一个重要的概念，它允许用户配置和自定义插件的行为和选项。

**通过设置，用户可以根据自己的需求和偏好来调整插件的功能和外观**。

下面是关于 IntelliJ IDEA 插件中设置的详细介绍：

1. 设置页面：
   - 在插件项目的 `resources` 目录下创建一个名为 `META-INF` 的文件夹，然后在该文件夹下创建一个名为 `plugin.xml` 的文件。
   - 在 `plugin.xml` 文件中使用 `<extensions>` 元素来定义设置页面。
   - 使用 `<applicationConfigurable>` 元素定义一个可配置项，其中包括设置页面的显示名称、类名和图标。
   - 可以使用 `<configurable>` 元素定义更多的可配置项。
   - 在 `<extensions>` 元素中添加定义的可配置项。

2. 设置页面类：
   - 创建一个类，扩展 `com.intellij.openapi.options.Configurable` 接口。
   - 实现 `createComponent()` 方法来创建设置页面的主要组件。
   - 实现 `isModified()` 方法来检查设置是否已被修改。
   - 实现 `apply()` 方法来应用设置的更改。
   - 实现 `reset()` 方法来重置设置为默认值。
   - 实现 `disposeUIResources()` 方法来释放设置页面相关的资源。

3. 设置页面组件：
   - 可以使用标准的 Swing 或 JavaFX 组件来创建设置页面。
   - 可以使用 IntelliJ IDEA 提供的自定义组件来创建更复杂的设置界面，如复选框、文本框、下拉列表等。

4. 与设置相关的持久化状态：
   - 如果您希望将设置保存在插件的配置文件中，可以使用 `com.intellij.ide.util.PropertiesComponent` 类来存储和读取键值对。
   - 使用 `PropertiesComponent` 的 `setValue()` 和 `getValue()` 方法来设置和获取属性的值。

5. 注册设置页面：
   - 在插件的 `plugin.xml` 文件中，使用 `<extensions>` 元素注册实现了 `Configurable` 接口的设置页面类。
   - 使用 `<applicationConfigurable>` 元素注册主设置页面。

通过设置页面，您可以提供一个可配置的界面，让用户自定义插件的行为和外观。

用户可以根据自己的需求来修改设置，并且这些设置可以持久化保存，以便在插件重新加载时恢复。

## 给一个 idea 插件中 setting 开发的入门例子

当开发 IntelliJ IDEA 插件时，通过 "Settings" 页面提供插件的自定义选项是常见的需求。

下面是一个简单的入门示例，演示如何创建一个设置页面并保存用户的设置：

1. 创建插件项目和模块：
   - 创建一个新的 IntelliJ IDEA 插件项目。
   - 在插件项目中创建一个新的模块用于实现设置功能。

2. 创建设置页面类：
   - 在模块中创建一个类，扩展 `com.intellij.openapi.options.Configurable` 接口。
   - 实现以下方法：

```java
import com.intellij.openapi.options.Configurable;
import org.jetbrains.annotations.Nullable;

import javax.swing.*;

public class MyPluginSettings implements Configurable {
    private JPanel mainPanel;
    private JTextField textField;
    private JCheckBox checkBox;

    @Override
    public @Nullable JComponent createComponent() {
        // 创建设置页面的主要组件
        return mainPanel;
    }

    @Override
    public boolean isModified() {
        // 检查设置是否已被修改
        // 根据需要比较当前设置和保存的设置
        return false;
    }

    @Override
    public void apply() {
        // 应用设置的更改
        // 将设置保存到持久化存储中
    }

    @Override
    public void reset() {
        // 将设置重置为默认值
        // 从持久化存储中恢复默认设置
    }

    @Override
    public void disposeUIResources() {
        // 释放设置页面相关的资源
    }
}
```

3. 创建 `plugin.xml` 文件并注册设置页面：
   - 在插件的 `resources/META-INF` 目录下创建一个名为 `plugin.xml` 的文件。
   - 在 `plugin.xml` 文件中添加以下内容：

```xml
<idea-plugin>
  <!-- 其他插件配置 -->
  <extensions defaultExtensionNs="com.intellij">
    <applicationConfigurable groupPath="My Plugin" displayName="My Plugin Settings"
                             configurableClass="com.example.MyPluginSettings" />
  </extensions>
</idea-plugin>
```

4. 创建设置页面的 UI 布局：
   - 在模块的资源目录下创建一个新的 XML 文件，例如 `my_plugin_settings.xml`。
   - 在 XML 文件中定义设置页面的 UI 布局，包括标签、文本框、复选框等组件。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<panel>
  <grid id="mainPanel" equalRows="true">
    <row>
      <label text="Text:"/>
      <text-field id="textField" columns="20"/>
    </row>
    <row>
      <label text="Enable Feature:"/>
      <check-box id="checkBox"/>
    </row>
  </grid>
</panel>
```

5. 将 UI 布局与设置页面类关联：

   - 在 `createComponent()` 方法中使用 `com.intellij.uiDesigner.core.GridLayoutManager` 将 XML 布局文件与设置页面类关联。

```java
import com.intellij.openapi.options.Configurable;
import com.intellij.uiDesigner.core.GridConstraints;
import com.intellij.uiDesigner.core.GridLayoutManager;
import com.intellij.uiDesigner.core.GridLayoutManager.Grid;
import org.jetbrains.annotations.Nullable;

import javax.swing.*;

public class MyPluginSettings implements Configurable {
    private JPanel mainPanel;
    private JTextField textField;
    private JCheckBox checkBox;

    @Override
    public @Nullable JComponent createComponent() {
        // 使用 UI Designer 将 XML 布局文件与设置页面类关联
        GridLayoutManager layoutManager = new GridLayoutManager(2, 2);
        mainPanel.setLayout(layoutManager);

        // 添加组件到布局
        GridConstraints constraints = new GridConstraints();
        constraints.setFill(GridConstraints.FILL_HORIZONTAL);
        constraints.setHSizePolicy(GridConstraints.SIZEPOLICY_FIXED);
        constraints.setVSizePolicy(GridConstraints.SIZEPOLICY_FIXED);

        mainPanel.add(new JLabel("Text:"), constraints);
        mainPanel.add(textField, constraints);

        constraints.setRow(1);
        mainPanel.add(new JLabel("Enable Feature:"), constraints);
        mainPanel.add(checkBox, constraints);

        return mainPanel;
    }

    // 其他方法保持不变...
}
```

这样，您就创建了一个简单的插件设置页面。用户可以在设置页面中编辑文本字段和复选框，并且设置将保存和应用到持久化存储中。

请注意，上述代码中的 `mainPanel` 是从 XML 布局文件加载的面板，用于放置设置页面的组件。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/settings.html

* any list
{:toc}