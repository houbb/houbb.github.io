---
layout: post
title:  Idea Plugin Dev-08-01-Virtual File System 与 Virtual File
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# Virtual File System

虚拟文件系统 (VFS) 是 IntelliJ 平台的一个组件，它封装了大部分用于处理表示为虚拟文件的文件的活动。

它有以下主要用途：

提供一个通用的 API 来处理文件，无论它们的实际位置如何（在磁盘上、在存档中、在 HTTP 服务器上等）

跟踪文件修改并在检测到更改时提供文件内容的旧版本和新版本。

提供将附加持久数据与 VFS 中的文件相关联的可能性。

为了提供最后两个特性，VFS 管理了一些用户硬盘内容的持久快照。 

快照仅存储那些至少通过 VFS API 请求过一次的文件，并异步更新以匹配磁盘上发生的更改。

快照是应用程序级的，而不是项目级的——因此，如果某个文件（例如 JDK 中的一个类）被多个项目引用，则只有其内容的一个副本将存储在 VFS 中。

所有 VFS 访问操作都通过快照。

如果通过 VFS API 请求某些信息但快照中不可用，则会从磁盘加载这些信息并将其存储到快照中。 

如果信息在快照中可用，则返回快照数据。 

仅当特定信息被访问时，文件内容和目录中的文件列表才会存储在快照中。 否则，仅存储名称、长度、时间戳、属性等文件元数据。


# 1. 详细介绍一下 idea 插件 Virtual File System

Virtual File System (VFS) 是 IntelliJ IDEA 插件开发中用于处理文件和目录的抽象层。它允许插件在不关心底层文件系统的情况下对文件进行读取、写入和操作。

VFS 提供了一个统一的接口，使插件能够以统一的方式处理各种类型的文件，包括本地文件、远程文件、内存中的文件等。

VFS 的主要概念和组件包括：

1. VirtualFile：表示一个虚拟文件，可以是本地文件系统中的文件，也可以是插件自定义的虚拟文件。它提供了访问文件属性、读写文件内容以及进行文件操作的方法。

2. VirtualFileVisitor：用于遍历虚拟文件系统的访问者接口。通过实现该接口的方法，插件可以遍历文件树、访问文件和目录，并执行自定义操作。

3. VirtualFileManager：是 VFS 的主要入口点，提供了访问和管理虚拟文件的方法。通过 VirtualFileManager，插件可以获取根据路径获取虚拟文件、创建、复制、移动和删除虚拟文件，以及监听文件系统的变化等。

4. LocalFileSystem：是 VirtualFileManager 的一个实现，用于访问本地文件系统。通过 LocalFileSystem，插件可以获取本地文件系统中的文件，并进行读写和操作。

5. VirtualFileListener：是用于监听虚拟文件系统变化的接口。通过实现该接口的方法，插件可以监听文件和目录的创建、修改、删除等事件，并在文件系统发生变化时做出相应的处理。

使用 Virtual File System，插件可以实现对文件的操作和访问，而不需要直接依赖于底层文件系统。这使得插件可以更加灵活和可移植，可以在不同的操作系统和环境中运行和操作文件。插件可以读取、写入和操作文件，获取文件属性，监听文件变化，并根据需要创建和管理虚拟文件。

需要注意的是，Virtual File System 并不是完全独立的文件系统，它是建立在底层文件系统之上的一个抽象层。因此，对于某些特定的文件操作，可能仍然需要使用底层文件系统的特定功能。但是，在大多数情况下，使用 Virtual File System 可以提供更好的插件开发体验和跨平台兼容性。

总结起来，Virtual File System 是 IntelliJ IDEA 插件开发中处理文件和目录的抽象层，它提供了统一的接口和方法，使插件能够以统一的方式访问和操作文件。

通过使用 Virtual File System，插件可以实现对文件的读取、写入、操作和监听，并提供更灵活和可移植的插件功能。

# 2. 给一个  Virtual File System 入门使用例子

以下是一个使用 Virtual File System 的简单示例，演示如何创建一个新的虚拟文件并将其保存到本地文件系统中：

```java
import com.intellij.openapi.application.ApplicationManager;
import com.intellij.openapi.command.WriteCommandAction;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.vfs.LocalFileSystem;
import com.intellij.openapi.vfs.VfsUtil;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.openapi.vfs.VirtualFileManager;
import com.intellij.openapi.vfs.VirtualFileSystem;

import java.io.IOException;

public class VfsExample {

    public void createAndSaveFile(Project project) {
        ApplicationManager.getApplication().invokeAndWait(() -> {
            // 获取 LocalFileSystem 实例
            VirtualFileSystem fileSystem = LocalFileSystem.getInstance();

            // 在项目根目录下创建一个新的虚拟文件
            VirtualFile baseDir = project.getBaseDir();
            String fileName = "example.txt";
            VirtualFile newFile = null;
            try {
                newFile = baseDir.createChildData(this, fileName);
            } catch (IOException e) {
                e.printStackTrace();
            }

            // 写入文件内容
            if (newFile != null) {
                WriteCommandAction.runWriteCommandAction(project, () -> {
                    try {
                        VfsUtil.saveText(newFile, "Hello, Virtual File System!");
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                });
            }

            // 刷新文件系统
            fileSystem.refresh(false);

            // 打开保存的文件
            if (newFile != null) {
                VirtualFileManager.getInstance().refreshAndFindFileByUrl(newFile.getUrl());
            }
        });
    }
}
```

在上述示例中，我们首先获取了 `LocalFileSystem` 实例，然后通过 `project.getBaseDir()` 获取项目的根目录。

接着，我们使用 `createChildData()` 方法在根目录下创建一个新的虚拟文件，并将其保存在 `newFile` 变量中。

接下来，我们使用 `WriteCommandAction` 来在一个写操作中向虚拟文件中写入内容。

在这个例子中，我们简单地将文本 "Hello, Virtual File System!" 写入了文件中。如果需要进行其他复杂的写操作，可以在 `runWriteCommandAction()` 方法的回调中执行。

完成写操作后，我们通过刷新文件系统来使新创建的文件在 IntelliJ IDEA 中可见。最后，我们使用 `VirtualFileManager` 的 `refreshAndFindFileByUrl()` 方法来找到并打开保存的文件。

请注意，上述示例代码在 UI 线程之外执行，这是因为某些操作（如创建文件、写入文件）可能需要在非 UI 线程中执行。因此，我们使用 `invokeAndWait()` 方法来确保代码在正确的线程上执行。

这只是一个简单的示例，演示了如何使用 Virtual File System 创建和保存文件。实际使用中，您可以根据需要执行更复杂的操作，如复制、移动、重命名文件等。同时，还可以使用 Virtual File System 监听文件系统的变化，以便及时更新和响应文件的修改。

# Virtual Files

VirtualFile (VF) 是 IntelliJ 平台在虚拟文件系统 (VFS) 中对文件的表示。

最常见的是，虚拟文件是本地文件系统中的文件。 

但是，IntelliJ 平台支持多个可插入文件系统实现，因此虚拟文件也可以表示 JAR 文件中的类、从版本控制存储库加载的文件的旧修订等。

VFS 级别只处理二进制内容。 

VirtualFile 的内容被视为字节流，但编码和行分隔符等概念在更高的系统级别上处理。

# 1. 详细介绍一下 idea 插件 Virtual file

Virtual file 是 IntelliJ IDEA 插件开发中的一个重要概念，它代表着一个虚拟文件或目录，可以通过插件操作和访问这些虚拟文件。

在 IntelliJ IDEA 中，虚拟文件由 VirtualFile 接口表示，它提供了一系列方法来获取和操作虚拟文件的属性和内容。

虚拟文件可以代表项目中的实际文件，也可以是插件自定义的文件，例如在内存中创建的临时文件。

以下是 VirtualFile 接口的一些常用方法：

- `getName()`：获取虚拟文件的名称，包括文件扩展名。
- `getPath()`：获取虚拟文件的完整路径，包括文件名和父文件夹的路径。
- `isDirectory()`：判断虚拟文件是否是一个目录。
- `isWritable()`：判断虚拟文件是否可写。
- `getParent()`：获取虚拟文件的父文件夹。
- `getChildren()`：获取虚拟文件的子文件和子文件夹。
- `findChild(String name)`：根据文件名查找虚拟文件的子文件或子文件夹。
- `getInputStream()`：获取虚拟文件的输入流，用于读取文件内容。
- `getOutputStream(Object requestor, long modStamp, long timeStamp)`：获取虚拟文件的输出流，用于写入文件内容。

通过使用 VirtualFile，插件可以执行一系列操作，如读取文件内容、修改文件属性、创建新的虚拟文件等。虚拟文件还支持事件监听，可以监听文件内容的变化、文件被重命名或删除等事件。

虚拟文件系统还提供了一些常用的实用方法和工具类，用于管理虚拟文件，如 VfsUtil、VirtualFileManager 等。这些工具类可以帮助插件获取、创建、复制、移动、重命名等操作虚拟文件。

使用虚拟文件系统的好处是可以轻松地在插件中操作和管理文件，而无需直接操作底层的物理文件系统。这使得插件可以更好地与 IntelliJ IDEA 的项目结构和文件系统进行交互，实现更高级的功能和扩展。

总结来说，Virtual file 是 IntelliJ IDEA 插件开发中的一个关键概念，它允许插件操作和访问虚拟文件，而无需直接操作底层的物理文件系统。

通过使用 VirtualFile 接口和相关的工具类，插件可以方便地读取、写入、创建和管理虚拟文件，从而实现更丰富的功能和扩展。


# 参考资料

https://plugins.jetbrains.com/docs/intellij/virtual-file-system.html

* any list
{:toc}