---
layout: post
title: java 键盘鼠标操作-02-java jna keyboard 操作键盘按键 
date: 2024-03-27 21:01:55 +0800
categories: [Java]
tags: [java, robot, sh]
published: false
---

# 需求

希望通过 java 在硬件级别操作 keyboard.

## maven 依赖

要在Maven项目中使用JNA（Java Native Access）库，你需要在项目的`pom.xml`文件中添加JNA的依赖项。以下是JNA的Maven依赖配置示例：

```xml
<dependencies>
    <!-- JNA Library -->
    <dependency>
        <groupId>net.java.dev.jna</groupId>
        <artifactId>jna</artifactId>
        <version>5.10.0</version> <!-- 请使用最新的版本号 -->
    </dependency>

    <!-- JNA Platform Library (for Windows, Linux, or Mac) -->
    <!-- 根据你的操作系统选择相应的依赖 -->
    <!-- For Windows -->
    <dependency>
        <groupId>net.java.dev.jna</groupId>
        <artifactId>jna-platform</artifactId>
        <version>5.10.0</version> <!-- 请使用与jna库相对应的版本号 -->
    </dependency>
    <!-- For Linux -->
    <dependency>
        <groupId>net.java.dev.jna</groupId>
        <artifactId>jna-platform</artifactId>
        <version>5.10.0</version> <!-- 请使用与jna库相对应的版本号 -->
    </dependency>
    <!-- For Mac -->
    <dependency>
        <groupId>net.java.dev.jna</groupId>
        <artifactId>jna-mac</artifactId>
        <version>5.10.0</version> <!-- 请使用与jna库相对应的版本号 -->
    </dependency>
</dependencies>
```

请注意，上面的版本号`5.10.0`是示例，你应该检查是否有更新的版本可用，并使用最新的稳定版本。你可以通过访问Maven中央仓库或者JNA的官方网站来查找最新的版本。

如果你只需要JNA核心库，那么只需要添加`jna`依赖项即可。

如果你打算使用JNA来访问特定平台的本地库（例如Windows API），你还需要添加对应平台的`jna-platform`依赖项。

在这里，我提供了针对Windows、Linux和Mac的依赖项作为示例。根据你的操作系统和需求，你可能只需要其中一个。

## 详细介绍一下 jna，和 robot 操作有什么区别?

Java Native Access (JNA) 是一个Java库，它提供了一种简便的方式来访问本地库，特别是那些用C或C++编写的库。JNA通过创建一个Java接口来封装本地方法调用，使得Java代码能够直接与本地库交互，而无需编写JNI（Java Native Interface）代码或C/C++的包装器。这大大简化了在Java中使用本地库的过程，提高了开发效率。

JNA的主要特点包括：
1. **简单性**：JNA通过使用注解和接口来定义本地方法，使得调用本地方法就像调用Java方法一样简单。
2. **灵活性**：JNA允许动态加载本地库，并且可以很容易地映射本地数据类型到Java数据类型。
3. **跨平台**：虽然JNA本身是针对Windows、Linux和Mac OS X的，但它的设计允许开发者为其他平台创建绑定。
4. **无需JNI编程**：使用JNA时，你不需要编写JNI代码，这减少了复杂性和出错的可能性。
5. **自动生成绑定**：JNA可以自动从本地库的头文件生成Java接口，这大大减少了手动编写绑定的工作量。

Java Robot 类是Java标准库中的一个类，位于`java.awt.Robot`包中。它主要用于创建动画、自动测试和其他需要模拟用户输入的场景。Robot 类提供了生成鼠标和键盘事件的方法，以及捕获屏幕图像的功能。

JNA和Robot类的主要区别在于：
1. **用途**：JNA主要用于与本地库交互，而Robot类主要用于模拟用户的输入和输出事件。
2. **功能范围**：JNA功能更加强大和灵活，可以访问任何本地库，而Robot类的功能仅限于模拟鼠标、键盘和屏幕捕获。
3. **性能**：由于JNA直接调用本地方法，它可能比Robot类有更好的性能，尤其是在需要频繁调用本地方法时。
4. **平台依赖性**：JNA可以用于访问特定于平台的API，而Robot类是Java平台独立的。
5. **易用性**：Robot类提供了一个相对简单的API，适合Java开发者使用，而JNA则需要一定的学习曲线，尤其是在处理复杂的本地库时。

总的来说，如果你需要在Java程序中调用本地库，JNA是一个强大的工具。

如果你只是需要模拟用户的输入事件，那么使用Java的Robot类可能更简单直接。选择哪个工具取决于你的具体需求和场景。

# 1-stackOverflow

## Q

```
I'm interested in interacting with the OS with java in this case windows 7 and want to emulate some keystrokes (e.g. CTRL + V) on a low level.

First of all i know java is a bad choice but its my best programming language and i know its possible. Additionally i know awt.robot exists but its too high level for me (i really need the driver level).

I'm asking this question because I really want to understand jna and after watching 20 code examples im still having problems.

A code example for a keystroke done by sendInput() would really help me.

Thanks a lot.
```


## A

这段代码是一个使用Java Native Access (JNA)库编写的Java程序，旨在模拟用户在Windows操作系统中按下键盘的行为。

JNA是一个库，它提供了一种简便的方法来访问本地库（如Windows API）而不需要编写任何的C或C++代码。

下面是对每一行代码的详细解释和注释：


```java
// 导入JNA库中用于Windows平台的相关类
import com.sun.jna.Native;
import com.sun.jna.platform.win32.BaseTSD;
import com.sun.jna.platform.win32.User32;
import com.sun.jna.platform.win32.WinDef;

/**
 * 一个简单的测试类，用于模拟在标题以"keyb"开头的窗口中按下"A"键。
 * 创建者：Vellotis
 * 创建日期：2016年2月2日
 */
public class User32Test
{
    public static void main( String[] args )
    {
        // 遍历所有窗口，并对其执行Lambda表达式中的代码
        User32.INSTANCE.EnumWindows(( hWnd, data ) -> {
            // 创建一个字符数组，用于存储窗口标题，大小为512个字符
            char[] name = new char[512];

            // 获取当前遍历到的窗口的标题，并存储到name数组中
            User32.INSTANCE.GetWindowText( hWnd, name, name.length );

            // 将窗口标题转换为小写，并检查它是否以"keyb"开头
            if ( Native.toString( name ).toLowerCase().startsWith( "keyb" ) )
            {
                // 将找到的窗口设置为当前活动窗口
                User32.INSTANCE.SetForegroundWindow( hWnd );

                // 准备一个输入事件的结构体
                WinUser.INPUT input = new WinUser.INPUT();

                // 设置输入事件的类型为键盘事件
                input.type = new WinDef.DWORD( WinUser.INPUT_KEYBOARD );
                // 根据JNA的文档，仅设置类型还不够，需要额外设置input的子类型
                input.input.setType("ki"); 

                // 初始化键盘输入事件的扫描码、时间戳和额外信息
                input.input.ki.wScan = new WinDef.WORD( 0 );
                input.input.ki.time = new WinDef.DWORD( 0 );
                input.input.ki.dwExtraInfo = new BaseTSD.ULONG_PTR( 0 );

                // 模拟按下"A"键（扫描码为0x41）
                input.input.ki.wVk = new WinDef.WORD( 'A' ); // 0x41
                input.input.ki.dwFlags = new WinDef.DWORD( 0 );  // KEYDOWN

                // 将按下"A"键的事件发送到窗口
                User32.INSTANCE.SendInput( new WinDef.DWORD( 1 ), ( WinUser.INPUT[] ) input.toArray( 1 ), input.size() );

                // 模拟释放"A"键
                input.input.ki.wVk = new WinDef.WORD( 'A' ); // 0x41
                input.input.ki.dwFlags = new WinDef.DWORD( 2 );  // KEYUP

                // 将释放"A"键的事件发送到窗口
                User32.INSTANCE.SendInput( new WinDef.DWORD( 1 ), ( WinUser.INPUT[] ) input.toArray( 1 ), input.size() );

                // 返回false表示已经找到目标窗口，停止遍历
                return false; // Found
            }

            // 如果窗口标题不以"keyb"开头，返回true继续遍历
            return true; // Keep searching
        }, null );
    }
}
```

这段代码的主要功能是模拟在所有标题以"keyb"开头的Windows窗口中按下并释放"A"键。

它通过遍历所有打开的窗口，找到匹配的窗口，然后将焦点切换到该窗口，并模拟键盘输入事件。

代码中使用了JNA库来调用Windows API函数，包括枚举窗口、获取窗口标题、设置活动窗口、发送键盘输入事件等。

通过这种方式，程序能够模拟用户在特定条件下的键盘操作，这在自动化测试或脚本执行中非常有用。

## maven 依赖

# 例子 2

这段代码是一个使用Java Native Access (JNA)库编写的类，用于在Windows操作系统中模拟键盘事件。

这个类提供了检查按键是否被按下、发送按键按下和释放事件的方法。

下面是对每一行代码的详细解释和注释：

```java
import com.sun.jna.platform.win32.User32;

import com.sun.jna.platform.win32.BaseTSD.ULONG_PTR;
import com.sun.jna.platform.win32.WinDef.DWORD;
import com.sun.jna.platform.win32.WinDef.WORD;
import com.sun.jna.platform.win32.WinUser.INPUT;

/**
 * Keyboard related methods and values.
 */
public class Keyboard {
	public static final int KEYEVENTF_KEYDOWN = 0;
	public static final int KEYEVENTF_KEYUP = 2;

	/**
	 * Check if a key is pressed.
	 * 
	 * @param vkCode
	 *            Key-code. For example: <i>KeyEvent.VK_SHIFT </i>
	 * 
	 * @return {@code true} if key is down. False otherwise.
	 */
	public static boolean isKeyDown(int vkCode) {
		short state = User32.INSTANCE.GetAsyncKeyState(vkCode);
		// check most-significant bit for non-zero.
		return (0x1 & (state >> (Short.SIZE - 1))) != 0;
	}

	/**
	 * Sends a key-down input followed by a key-up input for the given character
	 * value c.
	 * 
	 * @param c
	 */
	public static void pressKey(int c) {
		INPUT input = new INPUT();
		input.type = new DWORD(INPUT.INPUT_KEYBOARD);
		input.input.setType("ki");
		input.input.ki.wScan = new WORD(0);
		input.input.ki.time = new DWORD(0);
		input.input.ki.dwExtraInfo = new ULONG_PTR(0);
		input.input.ki.wVk = new WORD(c);
		input.input.ki.dwFlags = new DWORD(KEYEVENTF_KEYDOWN);
		User32.INSTANCE.SendInput(new DWORD(1), (INPUT[]) input.toArray(1), input.size());
		input.input.ki.wVk = new WORD(c);
		input.input.ki.dwFlags = new DWORD(KEYEVENTF_KEYUP);
		User32.INSTANCE.SendInput(new DWORD(1), (INPUT[]) input.toArray(1), input.size());
	}

	/**
	 * Sends a key-down input for the given character value c.
	 * 
	 * @param c
	 */
	public static void sendKeyDown(int c) {
		INPUT input = new INPUT();
		input.type = new DWORD(INPUT.INPUT_KEYBOARD);
		input.input.setType("ki");
		input.input.ki.wScan = new WORD(0);
		input.input.ki.time = new DWORD(0);
		input.input.ki.dwExtraInfo = new ULONG_PTR(0);
		input.input.ki.wVk = new WORD(c);
		input.input.ki.dwFlags = new DWORD(KEYEVENTF_KEYDOWN);
		User32.INSTANCE.SendInput(new DWORD(1), (INPUT[]) input.toArray(1), input.size());
	}

	/**
	 * Sends a key-up input for the given character value c.
	 * 
	 * @param c
	 */
	public static void sendKeyUp(int c) {
		INPUT input = new INPUT();
		input.type = new DWORD(INPUT.INPUT_KEYBOARD);
		input.input.setType("ki");
		input.input.ki.wScan = new WORD(0);
		input.input.ki.time = new DWORD(0);
		input.input.ki.dwExtraInfo = new ULONG_PTR(0);
		input.input.ki.wVk = new WORD(c);
		input.input.ki.dwFlags = new DWORD(KEYEVENTF_KEYUP);
		User32.INSTANCE.SendInput(new DWORD(1), (INPUT[]) input.toArray(1), input.size());
	}
}
```

### 总结

这个`Keyboard`类提供了一组静态方法，用于在Windows系统中模拟键盘事件。它允许用户检查特定按键是否被按下，以及发送单一的按键按下或释放事件。这些方法通过构建`INPUT`结构并使用`User32.INSTANCE.SendInput`方法来与Windows API交互，从而模拟键盘操作。这对于创建自动化脚本或测试程序来说非常有用，因为它可以模拟用户的键盘输入，无需实际的物理按键操作。




# 小结


问题是永恒的，但是解法却多是多变的。

在**人类历史的长河中，我们总是在不断地努力接近答案**。

我是老马，期待与你的下次重逢。

# 参考资料

https://stackoverflow.com/questions/28538234/sending-a-keyboard-input-with-java-jna-and-sendinput

https://github.com/java-native-access/jna/issues/1281

https://groups.google.com/g/jna-users/c/gPpljVnrbUE?pli=1

https://java-native-access.github.io/jna/4.2.1/com/sun/jna/platform/KeyboardUtils.html

https://www.javadoc.io/doc/net.java.dev.jna/jna/latest/com/sun/jna/platform/win32/WinUser.html

https://java-native-access.github.io/jna/4.2.1/com/sun/jna/platform/win32/WinUser.html

https://coderanch.com/t/635463/java/JNA-SendInput-function

https://www.tabnine.com/code/java/methods/com.sun.jna.platform.win32.User32/SetWindowsHookEx

https://stackoverflow.com/questions/tagged/jna?tab=Frequent

* any list
{:toc}
