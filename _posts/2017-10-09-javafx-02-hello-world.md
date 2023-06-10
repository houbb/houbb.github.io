---
layout: post
title: javafx-01-javafx hello world 入门例子
date:  2017-10-9 09:08:34 +0800
categories: [Java]
tags: [javafx]
published: false
---


# javafx 入门例子

## 代码

```java
package com.github.houbb.javafx.learn;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

/**
 * @author d
 * @since 1.0.0
 */
public class HelloWorld extends Application {

    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage primaryStage) {
        primaryStage.setTitle("Hello World");

        Button button = new Button("Click Me");
        button.setOnAction(event -> System.out.println("Hello, JavaFX!"));

        StackPane root = new StackPane();
        root.getChildren().add(button);

        primaryStage.setScene(new Scene(root, 300, 200));
        primaryStage.show();
    }


}
```

在这个例子中，我们创建了一个 HelloWorld 类，继承自 Application 类，并重写了 start() 方法。在 start() 方法中，我们设置了窗口的标题为 "Hello World"。

然后，我们创建了一个按钮 button，并为其设置了一个事件处理器。

当按钮被点击时，会执行事件处理器中的代码，打印一条消息到控制台。

我们使用 StackPane 布局来放置按钮，并将其作为根节点设置到场景中。

最后，我们创建一个 Stage 对象（即窗口），将根节点和窗口大小作为参数创建 Scene 对象，并将其设置为窗口的场景。最后，我们调用 show() 方法显示窗口。

编译并运行该代码，你将看到一个带有一个按钮的窗口。当你点击按钮时，在控制台上会打印出 "Hello, JavaFX!" 的消息。

这个例子展示了 JavaFX 的基本用法，帮助你入门学习。

你可以根据需要扩展和修改代码，进一步探索 JavaFX 的功能和特性。

# 有用输入框的例子

## 代码

```java
package com.github.houbb.javafx.learn;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;


/**
 * @author d
 * @since 1.0.0
 */
public class LabelInputDemo extends Application {

    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage primaryStage) {
        primaryStage.setTitle("Input Output Page");

        Label label = new Label("Input:");
        TextField textField = new TextField();

        Button button = new Button("Output");
        button.setOnAction(event -> {
            String input = textField.getText();
            System.out.println("Input: " + input);
        });

        VBox root = new VBox(10);
        root.setPadding(new Insets(10));
        root.getChildren().addAll(label, textField, button);

        primaryStage.setScene(new Scene(root, 300, 200));
        primaryStage.show();
    }


}
```

在这个例子中，我们创建了一个 InputOutputPage 类，继承自 Application 类，并重写了 start() 方法。

在 start() 方法中，我们创建了一个标签 label，一个输入框 textField，和一个按钮 button。我们为按钮添加了一个事件处理器，当按钮被点击时，获取输入框中的文本，并将其输出到控制台。

我们使用了 VBox 布局容器来垂直排列标签、输入框和按钮，并设置了一些间距和填充。

最后，我们创建一个 Stage 对象（即窗口），将布局容器作为根节点，并设置窗口的场景为该布局。最后，调用 show() 方法显示窗口。

编译并运行该代码，你将看到一个包含标签、输入框和按钮的页面。当你在输入框中输入内容，并点击按钮时，输入框的内容将被输出到控制台上。

这个例子演示了如何使用 JavaFX 创建一个简单的页面，并通过事件处理器处理用户的输入。你可以根据需要对页面进行定制和扩展，以满足更复杂的需求。

# 如何打包成一个 exe 可执行文件？

如果你想将 JavaFX 应用程序打包为 Windows 平台上的可执行文件（.exe 文件），你可以使用第三方工具将可执行 JAR 文件封装为可执行的 Windows 可执行文件。以下是一种常用的方法：

1. 使用 Excelsior JET（商业工具）：
   - Excelsior JET 是一个商业的工具，可以将 Java 应用程序编译成本机可执行文件。
   - 下载并安装 Excelsior JET 工具。
   - 在 Excelsior JET 工具中，配置你的 JavaFX 应用程序的入口点（主类），以及其他选项和依赖项。
   - 运行 Excelsior JET 工具，它将使用 AOT（Ahead-of-Time）编译技术将你的 JavaFX 应用程序转换为本机可执行文件（.exe）。
   - 最终生成的 .exe 文件可以在指定的输出目录中找到。

2. 使用 Launch4j（免费开源工具）：
   - Launch4j 是一个免费的开源工具，可以将可执行的 JAR 文件封装为 Windows 可执行文件。
   - 下载并安装 Launch4j 工具。
   - 配置 Launch4j，指定你的 JavaFX 应用程序的 JAR 文件、主类和其他选项。
   - 运行 Launch4j 工具，它将创建一个 Windows 可执行文件（.exe），并将你的 JavaFX 应用程序打包在其中。
   - 最终生成的 .exe 文件可以在指定的输出目录中找到。

请注意，打包为可执行的 Windows 可执行文件（.exe）需要将 JavaFX 应用程序转换为本机代码，这可能会引入额外的依赖和配置。因此，在执行这些工具之前，请确保你已仔细阅读并遵循相应工具的文档和指南。

选择适合你的需求和项目的工具，并按照相应的文档进行配置和操作，这样你就可以将你的 JavaFX 应用程序打包为一个 Windows 可执行文件（.exe），方便在 Windows 环境中进行部署和运行。

* any list
{:toc}