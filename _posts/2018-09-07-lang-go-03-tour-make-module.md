---
layout: post
title:  Go Lang-03-Tutorial Create a Go module 创建并调用一个模块
date:  2018-09-07 09:51:23 +0800
categories: [Lang]
tags: [go, lang, sh]
published: true
---

# 创建 Go 模块

启动一个其他人可以使用的模块

这是教程的第一部分，介绍 Go 语言的一些基本功能。 

在本教程中，您将创建两个模块。 

第一个是旨在由其他库或应用程序导入的库。 第二个是调用者应用程序，它将使用第一个应用程序。

本教程的序列包括七个简短主题，每个主题说明该语言的不同部分。

- 创建模块——编写一个小模块，其中包含可以从另一个模块调用的函数。

- 从另一个模块调用您的代码——导入并使用您的新模块。

- 返回并处理错误——添加简单的错误处理。

- 返回随机问候语——处理切片中的数据（Go 的动态大小数组）。

- 为多人返回问候语——将键/值对存储在映射中。

- 添加测试——使用 Go 的内置单元测试功能来测试您的代码。

- 编译并安装应用程序——在本地编译并安装您的代码。

# 先决条件

有一定的编程经验。 

这里的代码非常简单，但它有助于了解有关函数、循环和数组的知识。

一个编辑代码的工具。 您拥有的任何文本编辑器都可以正常工作。 

大多数文本编辑器对 Go 都有很好的支持。 

最流行的是 VSCode（免费）、GoLand（付费）和 Vim（免费）。

命令终端。 

Go 可以在 Linux 和 Mac 上的任何终端以及 Windows 中的 PowerShell 或 cmd 上正常运行。

# 启动一个其他人可以使用的模块

首先创建一个 Go 模块。 

在模块中，您可以为一组离散且有用的功能收集一个或多个相关包。 

例如，您可以创建一个包含具有财务分析功能的包的模块，以便其他编写财务应用程序的人可以使用您的工作。

Go 代码被分组为包，包又被分组为模块。 

您的模块指定运行代码所需的依赖项，包括 Go 版本及其所需的其他模块集。

当您添加或改进模块中的功能时，您会发布该模块的新版本。 

编写调用模块中函数的代码的开发人员可以导入模块的更新包并在将其投入生产使用之前使用新版本进行测试。

## 1. cd 目录

打开命令提示符并 cd 到您的主目录。

在 Linux 或 Mac 上：

```
cd D:\_go\01-modules
```

## 2. 创建 greetings 文件夹

```
mkdir greetings
cd greetings
```

## 3. 使用 go mod init 命令初始化

运行 go mod init 命令，为其提供模块路径 - 此处使用 example.com/greetings。 

如果您发布模块，则这必须是 Go 工具可以下载您的模块的路径。 那将是您的代码的存储库。

有关使用模块路径命名模块的更多信息，请参阅管理依赖项。

```
$ go mod init example.com/greetings
go: creating new go.mod: module example.com/greetings
```

go mod init 命令创建一个 go.mod 文件来跟踪代码的依赖项。 

到目前为止，该文件仅包含模块的名称和代码支持的 Go 版本。 

但是当您添加依赖项时，go.mod 文件将列出您的代码所依赖的版本。 

这可以保持构建的可重复性，并让您可以直接控制要使用的模块版本。

### 效果

实际上会在 greeting 文件夹下创建一个文件 `go.mod`

内容如下

```
module example.com/greetings

go 1.20
```

## 4. 创建 go 文件

创建 greetings.go 文件，内容如下：

```go
package greetings

import "fmt"

// Hello returns a greeting for the named person.
func Hello(name string) string {
    // Return a greeting that embeds the name in a message.
    message := fmt.Sprintf("Hi, %v. Welcome!", name)
    return message
}
```

这是您的模块的第一个代码。 它会向任何需要问候的呼叫者返回问候语。 

您将在下一步中编写调用此函数的代码。

在此代码中，您：

- 声明一个greetings包来收集相关函数。

- 实现 Hello 函数来返回问候语。

该函数接受一个类型为字符串的名称参数。 

该函数还返回一个字符串。 

在Go中，名称以大写字母开头的函数可以被不在同一包中的函数调用。 

这在 Go 中称为导出名称。 有关导出名称的更多信息，请参阅 Go 浏览中的导出名称。

![go](https://go.dev/doc/tutorial/images/function-syntax.png)

声明一个消息变量来保存您的问候语。

在 Go 中，`:=` 运算符是在一行中声明和初始化变量的快捷方式（Go 使用右侧的值来确定变量的类型）。 

从长远来看，您可能会这样写：

```go
var message string
message = fmt.Sprintf("Hi, %v. Welcome!", name)
```

使用 fmt 包的 Sprintf 函数创建问候消息。 

第一个参数是格式字符串，Sprintf 将名称参数的值替换为 `%v` 格式动词。 

插入 name 参数的值即可完成问候语文本。

将格式化的问候语文本返回给呼叫者。

在下一步中，您将从另一个模块调用此函数。


----------------------------------------------------------------------

# 从另一个模块调用您的代码

在上一节中，您创建了一个问候语模块。 

在本部分中，您将编写代码来调用刚刚编写的模块中的 Hello 函数。 

您将编写可作为应用程序执行的代码，并调用问候语模块中的代码。

# 过程

1) 文件夹

为 Go 模块源代码创建一个 hello 目录。 

这是您编写调用者的位置。

创建此目录后，您应该在层次结构中的同一级别上有一个 hello 和一个greetings 目录，如下所示：

```
<home>/
 |-- greetings/
 |-- hello/
```

我们和 greeting 同级别，创建一个 hello 文件夹。

2) 为您要编写的代码启用依赖项跟踪。

要为代码启用依赖项跟踪，请运行 go mod init 命令，并为其指定代码所在模块的名称。

出于本教程的目的，请使用 example.com/hello 作为模块路径。

```
$ go mod init example.com/hello
go: creating new go.mod: module example.com/hello
```

3) 编写代码来调用 Hello 函数，然后打印函数的返回值。

4) 创建 hello.go 中。

内容如下：

```go
package main

import (
    "fmt"

    "example.com/greetings"
)

func main() {
    // Get a greeting message and print it.
    message := greetings.Hello("Gladys")
    fmt.Println(message)
}
```

5) 编辑 example.com/hello 模块以使用本地 example.com/greetings 模块。

对于生产使用，您可以从其存储库发布 example.com/greetings 模块（带有反映其发布位置的模块路径），Go 工具可以在其中找到它并下载它。 

目前，由于您尚未发布该模块，因此您需要调整 example.com/hello 模块，以便它可以在本地文件系统上找到 example.com/greetings 代码。

为此，请使用 go mod edit 命令编辑 example.com/hello 模块，将 Go 工具从其模块路径（模块所在的位置）重定向到本地目录（模块所在的位置）。

在 hello 目录中的命令提示符下，运行以下命令

```
$ go mod edit -replace example.com/greetings=../greetings
```

该命令指定 example.com/greetings 应替换为 ../greetings 以定位依赖项。 

运行命令后，hello 目录中的 go.mod 文件应包含替换指令：

```
module example.com/hello

go 1.20

replace example.com/greetings => ../greetings
```

在 hello 目录中的命令提示符下，运行 go mod tidy 命令来同步 example.com/hello 模块的依赖项，添加代码所需但尚未在模块中跟踪的依赖项。

```
$ go mod tidy
go: found example.com/greetings in example.com/greetings v0.0.0-00010101000000-000000000000
```

此时的 go.mod 内容如下:

```
module example.com/hello

go 1.20

replace example.com/greetings => ../greetings

require example.com/greetings v0.0.0-00010101000000-000000000000
```

该命令在greetings目录中找到本地代码，然后添加一个require指令来指定example.com/hello需要example.com/greetings。 

当您在 hello.go 中导入问候语包时，您创建了此依赖项。

模块路径后面的数字是伪版本号——生成的数字，用于代替语义版本号（模块还没有）。

要引用已发布的模块，go.mod 文件通常会省略替换指令，并使用末尾带有标记版本号的 require 指令。

```
require example.com/greetings v1.1.0
```

6) 执行

```
$ go run .
```

效果如下：

```
Hi, Gladys. Welcome!
```

# 参考资料

https://go.dev/doc/tutorial/call-module-code

* any list
{:toc}