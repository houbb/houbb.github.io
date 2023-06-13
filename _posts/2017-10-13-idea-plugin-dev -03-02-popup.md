---
layout: post
title:  Idea Plugin Dev-03-02-Popup 组件 优化消息提醒
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---


# 2. 介绍一下 ui 组件 Popups

Popups（弹出窗口）是用户界面中常用的组件，用于在屏幕上方或下方显示临时的信息、菜单或用户界面。它们通常是短暂的、模态或非模态的，并提供了一种在用户界面上方或下方显示内容的方式，而不中断当前操作或转移焦点。

Popups 可以用于多种场景，例如：

1. Tooltips（工具提示）：当用户将鼠标悬停在组件上时，显示一个短暂的、带有文本或其他信息的小窗口，用于提供有关组件的额外说明或提示。

2. Context Menus（上下文菜单）：在用户右键单击组件或某个区域时，显示一个菜单，提供与当前上下文相关的操作选项。

3. Notifications（通知）：用于显示临时的通知或警告消息，以向用户传达重要的信息，例如操作成功、错误提示或其他提示信息。

4. Popovers（弹出菜单）：当用户点击某个元素时，显示一个临时的菜单或下拉列表，提供额外的选项或操作。

Popups 提供了一种轻量级、临时性的交互方式，可以在用户界面中提供额外的功能或信息，同时不会占据太多的屏幕空间或干扰用户的当前操作。

在使用 Popups 时，要注意设计的合理性和可用性，确保内容明确、易于理解，并且不会干扰用户的工作流程。

同时，应根据需要调整弹出窗口的位置、大小和外观，以适应不同的界面布局和用户体验需求。

# Tooltips 工具

## 详细介绍一下 idea 插件中的 Tooltips

在 IntelliJ IDEA 插件开发中，Tooltips 是一种常见的用户界面组件，用于显示额外的信息、提示或说明。

Tooltips 可以在鼠标悬停在某个组件上时自动显示，或者通过编程方式进行显示和控制。

以下是关于 IntelliJ IDEA 插件中 Tooltips 的详细介绍：

1. 悬停提示（Hover tooltips）：当鼠标悬停在某个组件（如按钮、标签、菜单项等）上时，会自动显示相关的提示信息。这些提示信息可以提供组件的功能、说明或快捷键等内容。在插件开发中，你可以通过设置组件的 `tooltipText` 属性来指定悬停提示的文本内容。

2. 自定义提示（Custom tooltips）：除了悬停提示，你还可以在需要的时候自定义显示提示。通过使用 `JToolTip` 类或其子类，你可以创建自定义的提示窗口，并将其与特定的组件关联。可以通过设置组件的 `setToolTipText()` 方法来指定自定义提示的文本内容，或者通过 `setToolTip()` 方法将自定义提示组件与目标组件关联。

3. 富文本提示（Rich tooltips）：IntelliJ IDEA 还支持在提示中显示富文本内容，包括颜色、字体、图片等。你可以使用 HTML 或 RTF 格式的文本来创建富文本提示。通过在 `tooltipText` 属性中指定带有 HTML 或 RTF 标记的文本，可以实现自定义样式和布局的提示。

4. 提示位置和显示策略：在 IntelliJ IDEA 中，默认的提示位置是根据鼠标光标位置自动调整的。你可以通过设置 `JToolTip` 的 `setLocation()` 方法来指定提示的位置。此外，还可以通过 `ToolTipManager` 类来配置提示的显示策略，例如显示延迟、显示时间等。

在插件开发中，你可以利用 Tooltips 来提供有用的信息、功能说明或操作提示，以提升用户体验和增加插件的可用性。你可以根据需要选择合适的提示类型和样式，以及灵活控制提示的显示方式和行为。

## idea 插件开发中，如何给 swing button 添加悬浮提示

在 IntelliJ IDEA 插件开发中，可以使用 `ToolTipManager` 类为 Swing 的按钮添加悬浮提示。下面是一个示例，演示如何为 Swing 的按钮添加悬浮提示：

```java
import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.ToolTipManager;
import java.awt.FlowLayout;

public class MyPluginAction extends AnAction {
    @Override
    public void actionPerformed(AnActionEvent e) {
        // 创建 JFrame 和 JPanel
        JFrame frame = new JFrame("My Plugin");
        JPanel panel = new JPanel(new FlowLayout());

        // 创建按钮并设置悬浮提示
        JButton button = new JButton("Click Me");
        button.setToolTipText("This is a tooltip");
        ToolTipManager.sharedInstance().registerComponent(button);

        // 将按钮添加到面板中
        panel.add(button);

        // 将面板添加到 JFrame 中
        frame.getContentPane().add(panel);

        // 设置 JFrame 的大小和可见性
        frame.setSize(300, 200);
        frame.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        frame.setVisible(true);
    }
}
```

在上述示例中，我们创建了一个 `JFrame` 和一个 `JPanel`，并在面板中添加了一个 `JButton`。通过调用 `setToolTipText()` 方法，我们为按钮设置了悬浮提示的文本。然后，我们使用 `ToolTipManager` 的 `registerComponent()` 方法注册按钮组件，以便悬浮提示生效。

这样，当用户将鼠标悬停在按钮上时，将显示设置的悬浮提示文本。你可以根据自己的需求为其他 Swing 组件添加类似的悬浮提示，只需调用对应组件的 `setToolTipText()` 方法并注册到 `ToolTipManager` 中即可。

# 详细介绍一下 ToolTipManager

`ToolTipManager` 是 Java Swing 中的一个类，用于管理和控制组件的悬浮提示（Tooltip）。它提供了一些方法和属性，可以自定义悬浮提示的行为和外观。

以下是一些 `ToolTipManager` 的重要方法和属性：

1. `setInitialDelay(int initialDelay)` 和 `getInitialDelay()`：用于设置和获取悬浮提示的初始延迟时间（以毫秒为单位）。默认情况下，鼠标悬停在组件上一段时间后才会显示悬浮提示。

2. `setDismissDelay(int dismissDelay)` 和 `getDismissDelay()`：用于设置和获取悬浮提示的消失延迟时间（以毫秒为单位）。默认情况下，悬浮提示会在鼠标移开组件后一段时间后自动消失。

3. `setReshowDelay(int reshowDelay)` 和 `getReshowDelay()`：用于设置和获取连续显示悬浮提示的延迟时间（以毫秒为单位）。如果用户快速将鼠标移入和移出组件，可以通过这个延迟时间控制悬浮提示的连续显示。

4. `setLightWeightPopupEnabled(boolean aFlag)` 和 `isLightWeightPopupEnabled()`：用于设置和获取悬浮提示是否使用轻量级弹出窗口。默认情况下，悬浮提示使用轻量级弹出窗口，但在某些情况下可能需要禁用轻量级弹出窗口以解决特定的渲染问题。

5. `registerComponent(JComponent component)` 和 `unregisterComponent(JComponent component)`：用于注册和取消注册组件，以便 `ToolTipManager` 管理该组件的悬浮提示。通过注册组件，可以确保悬浮提示功能生效。

6. `setToolTipRenderer(ToolTipRenderer toolTipRenderer)` 和 `getToolTipRenderer()`：用于设置和获取自定义的悬浮提示渲染器。通过自定义渲染器，可以更改悬浮提示的外观和样式。

可以通过以下方式获取默认的 `ToolTipManager` 实例：

```java
ToolTipManager toolTipManager = ToolTipManager.sharedInstance();
```

使用 `ToolTipManager` 可以全局地控制和自定义悬浮提示的行为，如设置延迟时间、使用轻量级弹出窗口、注册和取消注册组件等。

它是一个方便且强大的工具，可用于提供用户友好的界面体验。


# idea 插件如何进行消息提示

在 IDEA 插件开发中，可以使用不同的方式进行消息提示，以向用户提供反馈和通知。

下面介绍几种常见的消息提示方式：

1. 通知栏消息（Notifications）：使用 `com.intellij.notification.Notification` 类可以创建通知栏消息，并使用 `com.intellij.notification.Notifications` 类将其显示在 IDEA 的通知栏中。可以设置消息的标题、内容、图标等属性，并指定消息的重要性和持续时间。

   示例代码：
   ```java
   import com.intellij.notification.Notification;
   import com.intellij.notification.NotificationType;
   import com.intellij.notification.Notifications;
   import com.intellij.openapi.project.Project;
   
   // 创建通知栏消息
   Notification notification = new Notification("Plugin Name", "Title", "Content", NotificationType.INFORMATION);
   // 设置消息的图标
   notification.setIcon(PluginIcons.NOTIFICATION_ICON);
   
   // 显示通知栏消息
   Project project = event.getProject(); // 获取当前项目
   Notifications.Bus.notify(notification, project);
   ```

2. 对话框消息（Dialogs）：使用 `com.intellij.openapi.ui.Messages` 类可以创建对话框消息，包括信息提示、警告、错误等不同类型。可以指定对话框的标题、内容、按钮等，并根据用户的选择执行相应的操作。

   示例代码：
   ```java
   import com.intellij.openapi.ui.Messages;
   
   // 显示信息提示对话框
   Messages.showMessageDialog("Message", "Title", Messages.getInformationIcon());
   
   // 显示警告对话框
   Messages.showWarningDialog("Warning", "Title");
   
   // 显示错误对话框
   Messages.showErrorDialog("Error", "Title");
   ```

3. 悬浮提示（Tooltips）：使用 `javax.swing.ToolTipManager` 类可以设置组件的悬浮提示文本，以在用户将鼠标悬停在组件上时显示相关信息。

   示例代码：
   ```java
   import javax.swing.*;
   
   // 设置按钮的悬浮提示文本
   JButton button = new JButton("Button");
   button.setToolTipText("Tooltip text");
   ```

以上是一些常见的 IDEA 插件开发中的消息提示方式。根据具体的需求和场景，选择适合的方式来向用户提供消息和反馈。

# Messages 可以让消息提醒之后然后自动消失吗？或者有没有类似的组件实现这个功能

在 IDEA 插件开发中，`Messages` 类提供的对话框消息默认是需要用户手动关闭的，不会自动消失。然而，可以通过其他方式实现消息自动消失的效果，例如使用定时器（Timer）或者借助第三方库。

一种常见的实现方式是结合 `Notifications` 类和定时器来实现自动消失的消息提示。可以使用 `Notifications.Bus` 类的 `notify` 方法显示通知栏消息，并设置合适的显示时间后自动关闭。

示例代码：
```java
import com.intellij.notification.Notification;
import com.intellij.notification.NotificationType;
import com.intellij.notification.Notifications;
import com.intellij.openapi.project.Project;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.Timer;

// 创建通知栏消息
Notification notification = new Notification("Plugin Name", "Title", "Content", NotificationType.INFORMATION);
// 设置消息的图标
notification.setIcon(PluginIcons.NOTIFICATION_ICON);

// 显示通知栏消息
Project project = event.getProject(); // 获取当前项目
Notifications.Bus.notify(notification, project);

// 设置定时器，在一定时间后关闭通知栏消息
int delay = 5000; // 延迟关闭的时间，单位为毫秒
Timer timer = new Timer(delay, new ActionListener() {
    @Override
    public void actionPerformed(ActionEvent e) {
        notification.expire(); // 关闭通知栏消息
    }
});
timer.setRepeats(false); // 设置定时器只触发一次
timer.start(); // 启动定时器
```

上述代码创建了一个通知栏消息，然后通过定时器设置了一定的延迟时间后关闭消息。可以根据实际需求调整延迟时间。

另外，也可以考虑使用第三方库来实现自动消失的消息提示，例如使用 `JBPopupFactory` 类创建自定义的弹出窗口，并设置合适的显示时间后自动关闭。

这样可以更加灵活地控制消息提示的样式和行为。

总结起来，虽然 `Messages` 类本身没有提供自动消失的消息提示功能，但可以通过定时器、第三方库等方式来实现类似的效果，让消息在一定时间后自动关闭。

# 详细介绍下 JBPopupFactory

`JBPopupFactory` 是 IntelliJ IDEA 插件开发中的一个重要组件，它用于创建自定义的弹出窗口（Popups）。`JBPopupFactory` 提供了丰富的方法和选项，可以灵活地定义弹出窗口的内容、位置、大小、样式等属性。

下面是 `JBPopupFactory` 的一些常见用法和功能：

1. 创建弹出窗口：
   - 使用 `JBPopupFactory` 的静态方法 `getInstance()` 获取实例。
   - 调用 `createXXXPopup()` 方法创建特定类型的弹出窗口，如 `createListPopup()`、`createComponentPopup()` 等。

2. 定义弹出窗口内容：
   - 使用 `JBPopupFactory` 的方法设置弹出窗口的内容组件，如 `setContentPane()`、`setAdComponent()` 等。
   - 可以使用 Swing 组件、自定义组件或者使用 IntelliJ IDEA 提供的组件。

3. 设置弹出窗口的位置和大小：
   - 使用 `JBPopupFactory` 的方法设置弹出窗口的位置，如 `setRequestFocus(true)`、`setShowUnderneath(true)` 等。
   - 使用 `JBPopupFactory` 的方法设置弹出窗口的大小，如 `setSize()`、`setMinSize()`、`setMaxSize()` 等。

4. 设置弹出窗口的样式和行为：
   - 使用 `JBPopupFactory` 的方法设置弹出窗口的样式，如 `setTitle()`、`setAdText()`、`setBorderColor()` 等。
   - 使用 `JBPopupFactory` 的方法设置弹出窗口的行为，如 `setMovable(true)`、`setResizable(true)`、`setCancelOnClickOutside(true)` 等。

5. 显示和关闭弹出窗口：
   - 使用 `show()` 方法显示弹出窗口，可以指定显示的相对组件、显示的位置等参数。
   - 使用 `cancel()` 方法关闭弹出窗口。

通过上述方法和选项的组合，可以创建出符合需求的自定义弹出窗口。`JBPopupFactory` 提供了丰富的功能和灵活的配置选项，可以满足插件开发中的各种弹出窗口需求，例如下拉列表、工具提示、自定义对话框等。

需要注意的是，`JBPopupFactory` 是在插件开发中使用的特定类，依赖于 IntelliJ IDEA 平台。因此，在使用 `JBPopupFactory` 前，需要确保项目正确引入了 IntelliJ IDEA 相关的依赖。

## 给出一个基于  JBPopupFactory，消息提醒之后3秒后消失的例子

下面是一个基于 `JBPopupFactory` 实现消息提醒并在一定时间后自动消失的例子：

```java
import com.intellij.openapi.ui.popup.JBPopupFactory;
import com.intellij.openapi.ui.popup.PopupFactory;

import javax.swing.*;
import java.awt.*;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public class PopupExample {

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            // 创建一个定时任务的线程池
            ScheduledExecutorService executorService = new ScheduledThreadPoolExecutor(1);

            // 创建消息提醒的内容
            JLabel label = new JLabel("Hello, World!");

            // 创建一个 PopupFactory 实例
            PopupFactory factory = JBPopupFactory.getInstance();

            // 创建弹出窗口并设置内容
            JComponent content = factory.createComponentPopupBuilder(label, null)
                    .setResizable(false)
                    .setMovable(false)
                    .createPopup();

            // 显示弹出窗口
            content.show(new RelativePoint(Toolkit.getDefaultToolkit().getScreenSize()));

            // 定义延迟任务，在3秒后关闭弹出窗口
            executorService.schedule(() -> {
                SwingUtilities.invokeLater(content::cancel);
            }, 3, TimeUnit.SECONDS);
        });
    }
}
```

上述代码创建了一个简单的消息提醒弹出窗口，显示内容为 "Hello, World!"。使用 `JBPopupFactory` 创建弹出窗口，设置其属性并通过 `show()` 方法显示。然后，使用 `ScheduledExecutorService` 创建一个延迟任务，在3秒后调用 `cancel()` 方法关闭弹出窗口。

通过这个例子，可以实现消息提醒之后自动消失的效果。可以根据需要修改内容、延迟时间等参数来适应具体的使用场景。


# 详细介绍下 Notifications

`Notifications` 是 IntelliJ IDEA 插件开发中用于显示通知消息的组件。它提供了一种简单而灵活的方式来向用户展示各种类型的消息，包括错误、警告、信息等。

以下是 `Notifications` 组件的一些特点和用法：

1. **显示不同类型的消息**：`Notifications` 支持显示不同类型的消息，包括错误、警告、信息等。可以根据消息的严重程度和目的选择合适的消息类型。

2. **支持图标和标题**：每条消息可以附带一个图标和一个标题，用于更直观地表示消息的类型和内容。

3. **自动隐藏和手动关闭**：可以设置消息在一定时间后自动隐藏，也可以提供关闭按钮，让用户手动关闭消息。

4. **支持点击处理**：可以为消息设置点击处理器，当用户点击消息时执行相应的操作，比如打开相关文件或执行特定的操作。

5. **支持扩展和自定义**：`Notifications` 提供了一些可自定义的属性和回调函数，可以根据需要扩展和定制消息的显示和行为。

下面是一个简单的示例，展示如何在 IntelliJ IDEA 插件中使用 `Notifications` 组件显示消息：

```java
import com.intellij.notification.*;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.wm.ToolWindow;
import com.intellij.openapi.wm.ToolWindowManager;
import com.intellij.openapi.wm.WindowManager;

public class NotificationExample {

    public static void showNotification(Project project) {
        NotificationGroup group = new NotificationGroup("MyPlugin", NotificationDisplayType.BALLOON, true);
        Notification notification = group.createNotification(
                "Hello, World!",
                "This is a notification message",
                NotificationType.INFORMATION,
                new NotificationListener.UrlOpeningListener(false)
        );

        ToolWindow toolWindow = ToolWindowManager.getInstance(project).getToolWindow("MyToolWindow");
        WindowManager.getInstance().getStatusBar(project).addNotification(notification, toolWindow);
    }
    
}
```

上述代码创建了一个名为 "MyPlugin" 的通知组，并使用该组创建了一条信息类型的通知消息。

在这个示例中，消息的标题是 "Hello, World!"，内容是 "This is a notification message"，通知类型为 `NotificationType.INFORMATION`，并为通知设置了一个 URL 打开监听器。

然后，通过 `addNotification()` 方法将通知显示在 IntelliJ IDEA 的状态栏中。

通过 `Notifications` 组件，插件开发者可以在适当的时候向用户展示重要的消息和通知，提升插件的用户体验。

可以根据需要调整通知的类型、内容、显示位置等参数，使其适应具体的场景和需求。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/user-interface-components.html

* any list
{:toc}