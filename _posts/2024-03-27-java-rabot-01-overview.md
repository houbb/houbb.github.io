---
layout: post
title: java 键盘鼠标操作-01-如何操作鼠标
date: 2024-03-27 21:01:55 +0800
categories: [Java]
tags: [java, robot, sh]
published: true
---

# 整体设计

1. 操作的录制？（监听鼠标+键盘的事件）

2. 模拟鼠标/键盘的操作

3. 图的识别

4. 人行为的模拟


# 需求

我们希望通过 java 控制鼠标的操作。


# 实现

在Java中，模拟鼠标左键点击的操作同样可以通过java.awt.Robot类来实现。

以下是一个简单的示例，展示了如何使用Robot类来模拟鼠标左键的点击动作：

## 例子

```java
import java.awt.Robot;
import java.awt.event.InputEvent;

public class KeyPressExample {
    public static void main(String[] args) {
        try {
            Robot robot = new Robot();
            
            // 模拟按下 'A' 键
            robot.keyPress(InputEvent.VK_A);
            
            // 模拟释放 'A' 键
            robot.keyRelease(InputEvent.VK_A);
            
            // 设置延迟，单位为毫秒
            robot.delay(1000); // 等待1秒
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```


# 方向键问题

后来发现在 Java 中，方向的模拟在游戏中无效。

应该是屏蔽了模拟的操作，需要硬件级别的案件模拟才行。

# 硬件级别模拟思路

在Java中，如果使用`Robot`类进行按键模拟无效，可能是因为目标应用程序使用了直接与硬件通信的方式，或者有安全机制阻止了通过标准输入模拟的方法。这种情况下，可以尝试使用更底层的模拟方法，如硬件级模拟。

硬件级模拟通常需要直接与操作系统的底层硬件接口交互，这在Java中可以通过使用Java Native Access (JNA) 库来实现。JNA允许Java代码调用本地库，从而能够执行一些Java标准库中不提供的操作。

以下是一个使用JNA和DirectX（通过JNA-DX）进行硬件级模拟的基本示例：

1. **添加依赖**：首先，你需要在项目中添加JNA和JNA-DX的依赖。这可以通过Maven或Gradle等构建工具完成。

2. **加载本地库**：使用JNA加载包含DirectX功能的本地库（例如，`user32.dll`）。

3. **模拟按键**：通过调用本地库中的函数（如`SendInput`）来模拟按键。

下面是一个简单的代码示例，演示了如何使用JNA和DirectX模拟按键操作：

```java
import com.sun.jna.*;
import com.sun.jna.win32.*;
import com.sun.jna.platform.win32.WinUser;

public class DirectInputSimulation {

    public interface User32 extends StdCallLibrary {
        User32 INSTANCE = Native.load("user32", User32.class, W32APIOptions.DEFAULT_OPTIONS);

        boolean SendInput(int nInputs, Pointer inputs, int cbSize);
    }

    public static class INPUT extends Structure {
        public int type;
        public MouseKeybdhardwareInputData mi;
    }

    public static class MouseKeybdhardwareInputData extends Union {
        public MouseInputData mi;
        // ... other fields
    }

    public static class MouseInputData extends Structure {
        public int dx;
        public int dy;
        public int mouseData;
        public int dwFlags;
        public int time;
        public int dwExtraInfo;
    }

    public static void main(String[] args) {
        INPUT input = new INPUT();
        input.type = WinUser.INPUT_KEYBOARD;
        MouseInputData keyData = new MouseInputData();
        keyData.dwFlags = WinUser.KEYEVENTF_SCANCODE;
        keyData.time = 0;

        // Press the 'A' key
        keyData.dx = MapVirtualKey((int) 'A', MapVirtualKey.MAPVK_VK_TO_VSC);
        User32.INSTANCE.SendInput(1, new Pointer[]{input}, input.size());

        // Release the 'A' key
        keyData.dwFlags |= WinUser.KEYEVENTF_KEYUP;
        User32.INSTANCE.SendInput(1, new Pointer[]{input}, input.size());
    }
}
```

请注意，上述代码仅为示例，实际使用时需要根据具体情况进行调整。此外，由于硬件级模拟可能涉及到操作系统的底层调用，因此在不同系统或环境下可能存在兼容性问题。在使用这种方法时，需要确保对相关技术有充分的理解，并遵守相关法律法规，不要用于非法或侵犯他人权益的行为。

## maven 依赖

要使用Java进行硬件级模拟按键，你可能需要使用一些第三方库来实现这一功能。

这些库通常通过Java Native Access (JNA) 框架来调用本地系统API。

以下是一些可能需要用到的Maven依赖：

1. **JNA (Java Native Access)**: 这是实现Java与本地库交互的核心库。

```xml
<dependency>
    <groupId>net.java.dev.jna</groupId>
    <artifactId>jna</artifactId>
    <version>5.8.0</version>
</dependency>
```

2. **JNA Platform**: 这是JNA的一个扩展，提供了对平台特定API的直接访问，无需编写单独的本地库接口定义。

```xml
<dependency>
    <groupId>net.java.dev.jna.platform</groupId>
    <artifactId>jna-platform</artifactId>
    <version>5.8.0</version>
</dependency>
```

3. **JNA-DX**: 如果你需要使用DirectX相关的功能，可能需要这个库。

```xml
<dependency>
    <groupId>com.github.shevesch</groupId>
    <artifactId>jna-dx</artifactId>
    <version>1.0.0</version>
</dependency>
```

请注意，上述版本号是示例，实际使用时应检查最新的稳定版本。

另外，由于硬件级模拟可能涉及到操作系统的底层调用，这些操作可能需要管理员权限，并且在不同的操作系统或环境中可能有不同的表现。在使用这些库时，务必确保你的操作符合法律法规，并且不会侵犯他人的合法权益。

在实际开发中，你可能还需要根据具体的需求和目标环境，对代码进行相应的调整和测试。

此外，由于硬件级模拟可能被用于绕过安全措施，因此在实施前应确保其合法性和道德性。

# 其他方式

## 使用JNI（Java Native Interface）

您还可以使用JNI（Java Native Interface）来调用本地库（如C或C++）来模拟按键事件。

这需要您编写一些本地代码，并将其与Java代码集成。

## 使用第三方工具

一些第三方工具，如AutoIt、AutoHotkey等，可以用于模拟按键和鼠标事件。您可以编写脚本或程序来调用这些工具，或者直接使用它们提供的功能。

请注意，使用自动化工具和方法时要确保遵守相关法律和游戏/应用程序的使用条款，以避免违规或被封禁。


## 其他

要在Java中实现硬件级别的模拟，您需要使用更底层的API或库，通常是通过调用操作系统的API来实现的。这通常需要使用JNI（Java Native Interface）来与本地代码（如C或C++）进行交互，以调用底层的系统API。

以下是一些实现硬件级别模拟的方法：

### 1. 使用JNI（Java Native Interface）

您可以编写一个本地库（例如使用C或C++编写），并通过JNI从Java代码中调用它。这个本地库可以使用操作系统的API来模拟键盘和鼠标事件。

### 2. 使用JNA（Java Native Access）

JNA是一个Java库，它允许您直接从Java代码中调用本地的动态链接库（DLL）、共享库（SO）或其他本地代码。

### 3. 使用Robot类与AWT/Swing库

虽然`Robot`类通常被认为是模拟按键和鼠标事件的高级API，但在某些情况下，它可能达到硬件级别的模拟要求。但是，这取决于具体的操作系统和应用程序，因为它们可能会限制`Robot`类的功能。

### 4. 使用第三方库

有一些第三方库或工具可以用于模拟硬件级别的键盘和鼠标事件。例如，`SendInput`函数在Windows平台上可以用于模拟输入事件。

### 示例：使用JNA模拟按键

以下是一个使用JNA来模拟键盘事件的简单示例：

```java
import com.sun.jna.Library;
import com.sun.jna.Native;
import com.sun.jna.Platform;

public class KeyboardSimulator {
    public interface User32 extends Library {
        User32 INSTANCE = (User32) Native.loadLibrary(Platform.isWindows() ? "user32" : "c", User32.class);

        int VK_RIGHT = 0x27;

        void keybd_event(byte bVk, byte bScan, int dwFlags, int dwExtraInfo);
    }

    public static void main(String[] args) {
        // 模拟按下右键
        User32.INSTANCE.keybd_event((byte) User32.VK_RIGHT, (byte) 0, 0, 0);
        // 模拟释放右键
        User32.INSTANCE.keybd_event((byte) User32.VK_RIGHT, (byte) 0, 2, 0);
    }
}
```

请注意，上述代码是一个简化的示例，仅供参考。

在实际应用中，您可能需要根据具体需求和操作系统进行适当的调整和优化。

在尝试模拟硬件级别的操作时，请确保您了解相关的操作系统和应用程序的限制，以及可能的安全风险。

# 获取鼠标的位置

## java 原生的

在Java中，监听鼠标位置可以通过使用`java.awt.event.MouseMotionListener`接口来实现。

这个接口提供了鼠标移动和鼠标拖动事件的监听方法。要监听鼠标位置，你需要创建一个实现了`MouseMotionListener`接口的类，并在该类中覆盖`mouseMoved`和`mouseDragged`方法。然后，你需要将这个监听器添加到你想要监听鼠标位置的组件上，比如一个`JFrame`或者`JPanel`。

以下是一个简单的示例，展示了如何添加鼠标移动监听器并打印鼠标位置：

```java
import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.MouseMotionListener;

public class MousePositionListenerExample {
    public static void main(String[] args) {
        EventQueue.invokeLater(() -> {
            JFrame frame = new JFrame("Mouse Position Listener Example");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setSize(400, 300);

            // 创建鼠标监听器
            MouseMotionListener mouseMotionListener = new MouseMotionAdapter() {
                @Override
                public void mouseMoved(MouseEvent e) {
                    System.out.println("Mouse moved to: (" + e.getX() + ", " + e.getY() + ")");
                }
            };

            // 将监听器添加到内容面板
            Component contentPane = frame.getContentPane();
            contentPane.addMouseListener(mouseMotionListener);
            contentPane.addMouseMotionListener(mouseMotionListener);

            frame.setVisible(true);
        });
    }
}
```

在这个示例中，我们创建了一个`JFrame`窗口，并添加了一个`MouseMotionListener`。当鼠标在窗口内移动时，`mouseMoved`方法会被调用，并打印出鼠标当前的X和Y坐标。

请注意，`MouseMotionAdapter`是一个方便的类，它提供了所有`MouseMotionListener`接口方法的默认实现。这意味着你只需要覆盖你感兴趣的方法。在这个例子中，我们只覆盖了`mouseMoved`方法。

此外，如果你想要在整个屏幕上监听鼠标位置，而不仅仅是在某个特定组件上，你可以将`MouseMotionListener`添加到`Robot`类的实例上。这需要使用`Robot`类的`addMouseMotionListener`方法。这种方法可以提供全局的鼠标位置监听。但请注意，使用`Robot`类可能需要适当的权限，并且在某些环境中可能不可用。


## JNativeHook

是一个用于为Java提供全局键盘和鼠标监听器的库。

这将允许您监听全局快捷键或鼠标移动，这些在纯Java中是不可能的。

为了完成这项任务，JNativeHook通过Java的本地接口（JNI）利用依赖于平台的本地代码来创建低级别的系统全局钩子，并将这些事件传递给您的应用程序。

以下事件可以通过它们各自的监听器来获得：

- 键按下事件（Key Press Events）
- 键释放事件（Key Release Events）
- 键输入事件（Key Typed Events）
- 鼠标按下事件（Mouse Down Events）
- 鼠标释放事件（Mouse Up Events）
- 鼠标点击事件（Mouse Click Events）
- 鼠标移动事件（Mouse Move Events）
- 鼠标拖拽事件（Mouse Drag Events）
- 鼠标滚轮事件（Mouse Wheel Events）

除了全局事件监听器外，这个库还具有将原生事件发送回本地操作系统的能力。

这种全部的比较好。

# 如何识别一个图的位置？

在Java中，您可以使用第三方库来识别屏幕上的图像。一个流行的库是`SikuliX`，它允许您进行屏幕上的图像识别和自动化。

以下是使用`SikuliX`来识别屏幕上的图像的基本步骤：

### 1. 添加SikuliX依赖

首先，在`pom.xml`文件中添加SikuliX的Maven依赖：

```xml
<dependencies>
    <!-- SikuliX dependency -->
    <dependency>
        <groupId>com.sikulix</groupId>
        <artifactId>sikulixapi</artifactId>
        <version>2.0.4</version> <!-- 根据最新版本更新 -->
    </dependency>
</dependencies>
```

### 2. 编写图像识别代码

以下是一个简单的Java程序，使用SikuliX来在屏幕上查找并识别一个图像：

```java
import org.sikuli.script.FindFailed;
import org.sikuli.script.Pattern;
import org.sikuli.script.Screen;

public class ImageRecognitionExample {
    public static void main(String[] args) {
        // 创建一个Screen对象
        Screen screen = new Screen();

        // 定义要查找的图像
        Pattern imagePattern = new Pattern("path/to/your/image.png");

        try {
            // 在屏幕上查找图像
            screen.find(imagePattern);
            System.out.println("找到了图像！");
        } catch (FindFailed e) {
            System.out.println("未找到图像：" + e.getMessage());
        }
    }
}
```

在上述代码中：

- 创建一个`Screen`对象来表示屏幕。
- 使用`Pattern`类定义要查找的图像的路径。
- 使用`screen.find()`方法在屏幕上查找图像。

### 注意事项：

- 替换`"path/to/your/image.png"`为您要查找的图像的实际路径。
- 在运行此程序之前，确保您已经安装了`SikuliX`库，并且已经设置了图像的正确路径。
- 在执行图像识别时，确保屏幕上的图像尺寸和颜色与您提供的图像匹配。否则，图像识别可能会失败。

这是一个基本的示例，您可以根据需要进行进一步的自定义和优化。希望这能帮助您开始使用Java进行屏幕上的图像识别！

除了使用`SikuliX`进行图像识别之外，还有其他一些Java库和方法可以用于在屏幕中找到类似的图片或实现自动化任务。以下是一些常用的方法：

### 1. OpenCV（Open Source Computer Vision Library）

`OpenCV`是一个流行的计算机视觉库，它提供了许多功能，包括图像处理和模式识别。您可以使用`JavaCV`（OpenCV的Java接口）来在Java中使用OpenCV。

### 2. AWT Robot类

`java.awt.Robot`类提供了模拟用户输入（如鼠标和键盘操作）的功能。虽然它不是专门用于图像识别的库，但在某些情况下，您可以使用它来获取屏幕截图并进行基本的图像处理。

### 3. JNativeHook

虽然`JNativeHook`主要用于全局键盘和鼠标监听，但您也可以使用它来捕获屏幕截图并进行图像处理。

### 4. JavaFX

`JavaFX`也提供了图形和图像处理功能。您可以使用`javafx.scene.image.Image`类来加载和处理图像，并使用`javafx.scene.robot.Robot`类来模拟用户输入。

### 5. Tesseract OCR

`Tesseract`是一个开源的OCR（光学字符识别）引擎，您可以使用它来识别屏幕上的文本。虽然它主要用于文本识别，但在某些情况下，您也可以使用它来进行图像识别。

### 注意事项：

- 在使用任何图像识别或自动化工具时，都要确保遵守相关法律和规定，特别是在自动化和测试软件时。
- 图像识别可能会受到屏幕分辨率、缩放和颜色变化的影响。确保您的图像识别代码能够适应不同的屏幕和环境。
- 在某些情况下，硬件加速、窗口大小和透明度等因素可能会影响图像识别的准确性。

选择合适的方法和工具取决于您的具体需求和应用场景。您可能需要根据不同的情况和需求来评估和选择最合适的图像识别方法。

# 小结

问题是永恒的，但是解法却多是多变的。

在**人类历史的长河中，我们总是在不断地努力接近答案**。

我是老马，期待与你的下次重逢。

# 参考资料

* any list
{:toc}
