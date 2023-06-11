---
layout: post
title:  Idea Plugin Dev-06-ToolWidnow 实战笔记之实现一个数据库同步工具
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---


# 实现一个 ToolWindowFactory，要求页面有4个label和对应的输入框。label 分别为：url、username、password、driverClassName。一个确认按钮，点击确认按钮，获取用户的输入信息

您可以按照以下步骤实现一个包含 4 个标签和对应输入框的工具窗口：

1. 创建一个新的 Java 类，实现 `ToolWindowFactory` 接口，并重写 `createToolWindowContent` 方法。例如：

```java
import com.intellij.openapi.project.Project;
import com.intellij.openapi.ui.DialogWrapper;
import com.intellij.openapi.ui.Messages;
import com.intellij.openapi.ui.TextFieldWithBrowseButton;
import com.intellij.openapi.wm.ToolWindow;
import com.intellij.openapi.wm.ToolWindowFactory;
import org.jetbrains.annotations.NotNull;

import javax.swing.*;
import java.awt.*;

public class MyToolWindowFactory implements ToolWindowFactory {

    @Override
    public void createToolWindowContent(@NotNull Project project, @NotNull ToolWindow toolWindow) {
        // 创建工具窗口的内容面板
        JPanel panel = new JPanel(new GridLayout(5, 2));

        // 创建标签和输入框
        JLabel urlLabel = new JLabel("URL:");
        JTextField urlTextField = new JTextField();
        JLabel usernameLabel = new JLabel("Username:");
        JTextField usernameTextField = new JTextField();
        JLabel passwordLabel = new JLabel("Password:");
        JPasswordField passwordField = new JPasswordField();
        JLabel driverClassNameLabel = new JLabel("Driver Class Name:");
        JTextField driverClassNameTextField = new JTextField();

        // 将标签和输入框添加到面板中
        panel.add(urlLabel);
        panel.add(urlTextField);
        panel.add(usernameLabel);
        panel.add(usernameTextField);
        panel.add(passwordLabel);
        panel.add(passwordField);
        panel.add(driverClassNameLabel);
        panel.add(driverClassNameTextField);

        // 创建确认按钮
        JButton confirmButton = new JButton("确认");
        confirmButton.addActionListener(e -> {
            // 获取用户输入的信息
            String url = urlTextField.getText();
            String username = usernameTextField.getText();
            String password = new String(passwordField.getPassword());
            String driverClassName = driverClassNameTextField.getText();

            // 处理用户输入的信息
            // ...

            // 示例：显示用户输入的信息
            Messages.showMessageDialog(project, "URL: " + url + "\nUsername: " + username +
                    "\nPassword: " + password + "\nDriver Class Name: " + driverClassName,
                    "确认信息", Messages.getInformationIcon());
        });
        panel.add(confirmButton);

        // 设置工具窗口的内容面板
        toolWindow.getContentManager().addContent(toolWindow.getContentManager().getFactory().createContent(panel, "", false));
    }
}
```

2. 编译和打包插件，将生成的插件文件（JAR 或 ZIP）放入 IntelliJ IDEA 的插件目录。

3. 启动或重新启动 IntelliJ IDEA，然后打开工具窗口（通常位于右侧边栏）。

4. 单击工具窗口的确认按钮时，将获取用户输入的信息并显示在消息框中。

请注意，上述示例仅为演示目的，您可以根据实际需求进行适当修改和扩展，例如添加数据验证、连接数据库等操作。

## GridLayout(5,2) 什么意思？

`GridLayout(5, 2)` 是 Java Swing 中的布局管理器，用于在容器中创建一个网格布局。其中的参数 `5` 表示布局的行数，`2` 表示布局的列数。

具体解释如下：

- `5` 表示布局中的行数。在这种布局中，容器会被分为 5 行，并按照从上到下的顺序排列组件。
- `2` 表示布局中的列数。在这种布局中，每行中可以容纳 2 个组件。

网格布局会根据容器的大小均匀地分配每个网格单元的空间，并将组件按照顺序放置在网格单元中。在这个例子中，布局将创建一个 5 行 2 列的网格，总共有 10 个网格单元。

您可以根据实际需要调整行数和列数，以满足您的布局需求。例如，如果您希望有更多的行和列，可以将参数调整为 `GridLayout(6, 3)`，这将创建一个 6 行 3 列的网格布局。

需要注意的是，网格布局对组件的大小和位置进行均匀的分配，因此组件可能会被拉伸或压缩以适应网格单元的大小。

如果您需要更精细的布局控制，可以考虑使用其他布局管理器，如 `FlowLayout` 或 `GridBagLayout`，以便更灵活地控制组件的位置和大小。

TODO...

# 参考资料

* any list
{:toc}
