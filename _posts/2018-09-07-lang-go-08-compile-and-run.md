---
layout: post
title:  Go Lang-08-compile and run 编译并安装应用程序
date:  2018-09-07 09:51:23 +0800
categories: [Lang]
tags: [go, lang, sh]
published: true
---


# 编译并安装应用程序

在最后一个主题中，您将学习一些新的 go 命令。 

虽然 go run 命令是在频繁更改时编译和运行程序的有用快捷方式，但它不会生成二进制可执行文件。

本主题介绍了两个用于构建代码的附加命令：

```
go build 命令编译包及其依赖项，但不会安装结果。
go install 命令编译并安装软件包。
```

# go build

## 介绍一下 go build 命令

`go build` 是 Go 编程语言中的一个命令行工具，用于编译源代码文件生成可执行程序或库文件。

它是 Go 语言标准库中提供的一个重要命令，用于将 Go 代码编译成计算机可以执行的二进制文件。

下面是一些关于 `go build` 命令的重要信息：

1. **基本用法：** 在命令行中，进入包含源代码文件的目录，并执行 `go build` 命令。默认情况下，它会编译当前目录中的所有 `.go` 文件，并生成一个可执行文件，文件名与目录名相同。

2. **生成可执行文件：** 如果你想生成一个可执行文件，只需执行 `go build`，它会将代码编译成一个二进制文件。例如，如果你有一个名为 `main.go` 的源代码文件，那么执行 `go build` 会生成一个名为 `main`（或者是你当前目录的名字）的可执行文件。

3. **指定输出文件名：** 你可以通过使用 `-o` 标志来指定生成的可执行文件的名称。例如，执行 `go build -o myapp` 将生成一个名为 `myapp` 的可执行文件。

4. **编译为库文件：** 除了生成可执行文件，`go build` 也可以用于编译为库文件（也称为包）。在这种情况下，它不会生成可执行文件，而是生成一个 `.a` 文件（archive 文件），用于其他程序引用。你可以在 `go build` 后面加上目标包的导入路径来编译为库文件。

5. **交叉编译：** 使用 `go build`，你还可以进行交叉编译，即在一个平台上编译生成另一个平台的可执行文件。你可以通过设置 `GOOS` 和 `GOARCH` 环境变量来指定目标平台。例如，要在 Windows 上编译一个 Linux 可执行文件，可以执行类似以下的命令：`GOOS=linux GOARCH=amd64 go build`.

6. **编译标签：** 通过在代码中使用特定的编译标签，你可以根据不同的条件来选择性地编译部分代码。例如，你可以使用 `// +build` 注释来指定只在特定平台或环境下编译某部分代码。

总之，`go build` 是一个非常实用的命令，用于将 Go 代码编译成可执行文件或库文件。

它的灵活性和强大功能使得开发者可以轻松地构建和部署他们的 Go 项目。

## 测试验证

执行 

```
$ go build
```

执行后

```
$ ls
go.mod  hello.exe*  hello.go
```

命令行执行 hello.exe

```
$ hello.exe
map[Darrin:Hi, Darrin. Welcome! Gladys:Great to see you, Gladys! Samantha:Hail, Samantha! Well met!]
```

# go install

## 介绍一下 go install

`go install` 是 Go 编程语言中的一个命令行工具，用于编译并安装源代码文件，生成可执行程序或库文件，并将其安装到 Go 语言的工作环境中。

这个命令可以帮助你在 `$GOPATH/bin` 目录下生成可执行文件，或在 `$GOPATH/pkg` 目录下生成库文件，使得这些文件可以在任何地方被调用。

以下是关于 `go install` 命令的一些重要信息：

1. **基本用法：** 在命令行中，执行 `go install` 命令时，它会编译当前目录中的所有 `.go` 文件，并将生成的可执行文件或库文件安装到 `$GOPATH/bin` 或 `$GOPATH/pkg` 目录中，取决于是生成可执行文件还是库文件。

2. **生成可执行文件：** 当你在源代码目录中执行 `go install` 命令时，它会将编译后的可执行文件生成在 `$GOPATH/bin` 目录下。可执行文件的名称与源代码目录的名称相同，例如如果你有一个名为 `main.go` 的文件，那么生成的可执行文件将是 `main`。

3. **生成库文件：** 如果你要生成库文件，可以在 `go install` 后面加上目标包的导入路径。生成的库文件会被放置在 `$GOPATH/pkg` 目录下，方便其他程序引用。

4. **指定输出目录：** 你可以使用 `-o` 标志来指定可执行文件或库文件的输出目录。例如，执行 `go install -o /path/to/output` 会将生成的文件放置在指定目录下。

5. **交叉编译和交叉安装：** 类似于 `go build`，你也可以使用 `GOOS` 和 `GOARCH` 环境变量来进行交叉编译和交叉安装。例如，要在 Windows 上安装一个 Linux 可执行文件，可以执行类似以下的命令：`GOOS=linux GOARCH=amd64 go install`.

总之，`go install` 是一个方便的命令，用于编译并安装源代码，将生成的可执行文件或库文件放置在 Go 工作环境中，以便于在项目中引用和使用。它是构建和部署 Go 项目的重要工具之一。

## 给一个 go install 实际的例子

当你使用 `go install` 命令时，它会将生成的可执行文件安装到 `$GOPATH/bin` 目录中。下面是一个简单的示例，演示如何使用 `go install` 编译并安装一个 Go 程序：

假设你有以下的源代码文件：

```go
// main.go
package main

import "fmt"

func main() {
    fmt.Println("Hello, world!")
}
```

1. 在命令行中，进入包含 `main.go` 文件的目录。

2. 执行以下命令：

```sh
go install
```

3. 如果你的 `$GOPATH` 设置为 `/home/user/go`，那么生成的可执行文件将被安装在 `/home/user/go/bin` 目录下。

4. 然后你可以在命令行中直接运行生成的可执行文件：

```sh
$GOPATH/bin/main
```

输出应该是：

```
Hello, world!
```

这个示例演示了如何使用 `go install` 命令将一个简单的 Go 程序编译并安装到工作环境中。通过执行这个命令，你可以将生成的可执行文件保存在 `$GOPATH/bin` 目录中，以便在任何地方直接调用。

# TODO

> [继续学习](https://go.dev/doc/tutorial/)

# 参考资料

https://go.dev/doc/tutorial/add-a-test

* any list
{:toc}