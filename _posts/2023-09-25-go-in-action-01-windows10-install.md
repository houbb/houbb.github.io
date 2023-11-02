---
layout: post
title: go 实现日志采集-01-windows10 install go 并初步实现基本的文件监听功能
date: 2023-09-25 21:01:55 +0800
categories: [Go]
tags: [monitor, go, log-collect, sh]
published: true
---

# download

下载 [https://go.dev/dl/go1.21.3.windows-amd64.msi](https://go.dev/dl/go1.21.3.windows-amd64.msi)


双击安装。

## 测试验证

```
>go version
go version go1.21.3 windows/amd64
```

# goland 只能免费使用 30 天，有免费的 go 开发工具吗

是的，Go语言有一些免费的开发工具可供使用。以下是一些常用的免费Go开发工具：

1. Visual Studio Code（VS Code）：这是一款免费的轻量级代码编辑器，支持多种编程语言，包括Go语言。它具有丰富的插件生态系统，可以通过安装Go插件来提供对Go语言的支持。

2. LiteIDE：这是一款专为Go语言开发设计的开源集成开发环境（IDE）。它提供了一系列功能，如代码补全、调试器、项目管理等，可以帮助你更高效地开发Go应用程序。

3. Sublime Text：这是一款流行的文本编辑器，也可以用于Go语言开发。虽然它的免费版本有限制，但你可以购买许可证解锁更多功能。

4. Atom：这是一款免费的开源文本编辑器，支持多种编程语言，包括Go语言。它具有丰富的插件和主题，可以根据个人喜好进行定制。

这些免费的Go开发工具都提供了基本的代码编辑和调试功能，可以满足大多数Go开发者的需求。你可以根据个人偏好选择适合自己的工具进行Go语言开发。

# 如何通过 go 实现一个监听指定文件夹文件变化，并获取变化内容的程序？类似于 filebeta

## 1. 安装依赖包

```
go get github.com/fsnotify/fsnotify
```

### 报错1

```
$ go get github.com/fsnotify/fsnotify
go: go.mod file not found in current directory or any parent directory.
        'go get' is no longer supported outside a module.
        To build and install a command, use 'go install' with a version,
        like 'go install example.com/cmd@latest'
        For more information, see https://golang.org/doc/go-get-install-deprecation
        or run 'go help get' or 'go help install'.
```

原因：

如果你在使用 Go 1.11 或更高版本，并且没有使用 Go Modules，那么你可能会遇到 "go get" 不再支持的问题。在这种情况下，你可以尝试以下解决方法：

1. 进入你的项目目录：在终端中，使用  `cd /your/project/directory`  命令进入你的项目目录。

2. 初始化 Go Modules：运行  `go mod init`  命令来初始化 Go Modules。这将创建一个 go.mod 文件。

3. 使用 Go Modules 来获取包：使用  `go get`  命令获取你所需的包，例如  `go get github.com/fsnotify/fsnotify` 。

4. 更新你的代码：在你的代码中，使用  `import`  语句导入所需的包。

这样，你就可以在 Go Modules 环境中解决 "go get" 不再支持的问题。希望这可以帮到你！如有任何疑问，请随时提问。

### 报错 2

```
$ go mod init
go: cannot determine module path for source directory D:\gocode\logcollect (outside GOPATH, module path must be specified)

Example usage:
        'go mod init example.com/m' to initialize a v0 or v1 module
        'go mod init example.com/m/v2' to initialize a v2 module

Run 'go help mod init' for more information.
```

这个错误信息是由于在 Go Modules 环境中，无法确定模块的路径。这通常发生在你的代码目录不在 GOPATH 中时。

为了解决这个问题，你可以按照错误信息中提供的示例使用  `go mod init`  命令来初始化一个模块。你可以根据你的实际情况选择不同的模块路径。

例如，如果你的代码目录是  `D:\gocode\logcollect` ，你可以运行以下命令来初始化一个 v0 或 v1 模块：

```
go mod init example.com/m
```

或者，如果你想初始化一个 v2 模块，你可以运行以下命令：

```
go mod init example.com/m/v2
```

这样，你就可以为你的代码创建一个模块，并解决这个错误。希望这可以帮到你！如有任何疑问，请随时提问。

#### v0 或 v1 模块，和 v2 模块有什么区别？作用是什么

在 Go Modules 中，模块版本通常遵循语义化版本控制（Semantic Versioning）规范。

v0 或 v1 模块是指在初始化模块时使用的版本，而 v2 模块是指在初始化模块时使用的 v2 版本。

v0 或 v1 模块：
- 这些模块是在 Go Modules 刚开始引入时创建的。
- 它们使用的是 v0 或 v1 的版本控制规范。
- 当你使用  `go mod init example.com/m`  初始化模块时，默认创建的是 v0 或 v1 模块。
- 这些模块的版本号通常遵循  `vX.Y.Z`  的格式，其中 X、Y 和 Z 分别表示主版本号、次版本号和修订号。

v2 模块：
- v2 模块是在 v0 或 v1 模块的基础上进行的重大修改或重构。
- 它们使用的是 v2 版本控制规范。
- 当你使用  `go mod init example.com/m/v2`  初始化模块时，创建的是 v2 模块。
- v2 模块的版本号通常遵循  `v2.Y.Z`  的格式，其中 Y 和 Z 分别表示次版本号和修订号。

区别：
- v0 或 v1 模块和 v2 模块在版本控制规范和版本号的格式上有所不同。
- v2 模块通常用于在 v0 或 v1 模块的基础上进行重大修改或重构，以避免破坏现有的依赖关系。

模块的作用：
- 模块是 Go Modules 的核心概念，用于管理代码的依赖关系和版本控制。
- 它们允许你明确指定你的代码所依赖的其他模块，并确保这些依赖关系的版本是可控的。
- 模块还可以帮助你更好地管理和共享你的代码，使其更易于维护和部署。

希望这可以解答你的问题！如果还有其他疑问，请随时提问。

我们根据提示，输入：

```sh
go mod init example.com/m
```

日志如下：

```
$ go mod init example.com/m
go: creating new go.mod: module example.com/m
go: to add module requirements and sums:
        go mod tidy
```

## 2. 继续执行安装

然后继续安装 fsnotify 依赖

```sh
go get github.com/fsnotify/fsnotify
```

### 这个命令的含义

`go get github.com/fsnotify/fsnotify`  是一个用于获取第三方包或库的 Go 命令。

具体来说，这个命令的作用是从远程代码仓库（例如 GitHub）中下载并安装  `github.com/fsnotify/fsnotify`  这个包。

该包是一个用于监听文件系统事件的 Go 包，可以用于监视文件或文件夹的变化。

执行  `go get`  命令后，Go 工具链会自动下载指定包的源代码，并将其安装到你的 GOPATH 或 Go Modules 中，使你可以在自己的项目中导入和使用该包。

例如，在你的 Go 代码中，你可以使用以下方式导入  `github.com/fsnotify/fsnotify`  包：

```
import "github.com/fsnotify/fsnotify"
```

然后，你就可以使用该包提供的功能来监听文件系统事件，如文件的创建、修改、删除等。

总结一下， `go get`  命令的作用是方便地获取和安装第三方包或库，使你可以在自己的项目中使用这些包来扩展功能。

### 安装报错

```
$ go get github.com/fsnotify/fsnotify
go: module github.com/fsnotify/fsnotify: Get "https://proxy.golang.org/github.com/fsnotify/fsnotify/@v/list": dial tcp 142.251.43.17:443: connectex: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond.
```

错误原因：

具体原因：默认go的代理网站是 `GOPROXY=https://proxy.golang.org,direct`，是一个外网地址，国内访问不到，因此我们需要修改代理网站。

解决：使用命令

```
go env -w GOPROXY=https://goproxy.cn,direct
```

更改代理网站，然后再重新执行go get命令即可成功download了。

成功的安装日志如下：

```
$ go get github.com/fsnotify/fsnotify
go: downloading github.com/fsnotify/fsnotify v1.7.0
go: downloading golang.org/x/sys v0.4.0
go: added github.com/fsnotify/fsnotify v1.7.0
go: added golang.org/x/sys v0.4.0
```

# 编写代码

要通过Go实现一个监听指定文件夹文件变化并获取变化内容的程序，你可以使用 `fsnotify` 包来实现。下面是一个示例代码：

```go
package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/fsnotify/fsnotify"
)

func main() {
	// 创建一个新的文件系统监视器
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	defer watcher.Close()

	// 指定要监听的文件夹路径
	dirPath := "D:\\logsdata"

	// 使用 filepath 包中的 Walk 函数，遍历文件夹中的所有文件，并将它们添加到监视器中
	err = filepath.Walk(dirPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			err = watcher.Add(path)
			if err != nil {
				log.Println(err)
			}
		}
		return nil
	})
	if err != nil {
		log.Fatal(err)
	}

	// 启动一个无限循环来监听文件事件
	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}
			log.Println("事件:", event)
		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Println("错误:", err)
		}
	}
}
```


## 简单解释

在这个示例代码中，我们使用 `fsnotify` 包来创建一个文件监视器。通过调用 `NewWatcher` 函数创建一个新的监视器实例，并使用 `Add` 函数添加要监听的文件夹。

然后，我们启动一个goroutine来处理文件变化事件。在事件处理函数中，我们检查事件类型是否为文件写入操作 `fsnotify.Write` ，如果是，我们可以读取变化的文件内容并进行处理。

最后，我们使用一个无缓冲通道 `done` 来阻塞主goroutine，以确保程序一直运行。

请注意，你需要将 `"path/to/folder"` 替换为你要监听的实际文件夹路径。希望这对你有所帮助！

# 运行代码

## 编译

```
go build
```

得到结果

```
$ ls
go.mod  go.sum  m.exe*  main.go
```

## 运行

这个程序需要提前创建一个文件，比如 1.txt。

然后我们启动程序：

```
./m.exe
```

## 测试

我们修改文件内容，日志信息如下：

```
$ ./m.exe
2023/11/01 22:43:07 事件: WRITE         "D:\\logsdata\\1.txt"
2023/11/01 22:43:07 事件: WRITE         "D:\\logsdata\\1.txt"
2023/11/01 22:43:11 事件: WRITE         "D:\\logsdata\\1.txt"
2023/11/01 22:43:11 事件: WRITE         "D:\\logsdata\\1.txt"
2023/11/01 22:43:30 事件: WRITE         "D:\\logsdata\\1.txt"
2023/11/01 22:43:30 事件: WRITE         "D:\\logsdata\\1.txt"
```

# v2

## 需求说明

如何修改上面的代码，让其支持监听文件夹下所有文件的新建和删除？

## 修改后的代码如下：

```go
package main

import (
	"log"
	"os"

	"github.com/fsnotify/fsnotify"
)

func main() {
	// 创建一个新的文件系统监视器
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	defer watcher.Close()

	// 指定要监听的文件夹路径
	dirPath := "D:\\logsdata"
	log.Println("开始处理文件夹：", dirPath)

	// 递归遍历文件夹及其子文件夹，并将它们添加到监视器中
	err = watchDir(dirPath, watcher)
	if err != nil {
		log.Fatal(err)
	}

	// 启动一个无限循环来监听文件事件
	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}
			log.Println("事件:", event)
		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Println("错误:", err)
		}
	}
}

// 递归遍历文件夹及其子文件夹，并将它们添加到监视器中
func watchDir(dirPath string, watcher *fsnotify.Watcher) error {
	err := watcher.Add(dirPath)
	if err != nil {
		return err
	}

	// 打开文件夹
	dir, err := os.Open(dirPath)
	if err != nil {
		return err
	}
	defer dir.Close()

	// 读取文件夹中的所有文件和子文件夹
	fileInfos, err := dir.Readdir(-1)
	if err != nil {
		return err
	}

	// 遍历文件夹中的文件和子文件夹
	for _, fileInfo := range fileInfos {
		// 如果是子文件夹，则递归调用 watchDir 函数
		if fileInfo.IsDir() {
			subDirPath := dirPath + "/" + fileInfo.Name()
			err = watchDir(subDirPath, watcher)
			if err != nil {
				log.Println(err)
			}
		} else {
			// 如果是文件，则将其添加到监视器中
			filePath := dirPath + "/" + fileInfo.Name()
			err = watcher.Add(filePath)
			if err != nil {
				log.Println(err)
			}
		}
	}

	return nil
}
```

## 测试效果

我们在文件夹下进行删除、新建、内容修改。

得到的监听日志如下：

```
$ ./m.exe
2023/11/01 22:51:12 开始处理文件夹： D:\logsdata
2023/11/01 22:51:17 事件: CREATE        "D:\\logsdata\\新建文本文档.txt"
2023/11/01 22:51:18 事件: RENAME        "D:\\logsdata\\新建文本文档.txt"
2023/11/01 22:51:18 事件: CREATE        "D:\\logsdata\\5.txt"
2023/11/01 22:51:23 事件: REMOVE        "D:\\logsdata\\4.txt"
2023/11/01 22:51:23 事件: REMOVE        "D:\\logsdata\\4.txt"
2023/11/01 22:51:27 事件: REMOVE        "D:\\logsdata\\3.txt"
2023/11/01 22:51:27 事件: REMOVE        "D:\\logsdata\\3.txt"
2023/11/01 22:51:33 事件: WRITE         "D:\\logsdata\\5.txt"
2023/11/01 22:51:33 事件: WRITE         "D:\\logsdata\\5.txt"
```


# V3-如何获取当前的具体操作类型

## chat1-详细介绍一下文件变更后，接收到的 event 有哪些属性？

在使用 fsnotify 包监听文件变更时，你会收到不同类型的事件，每个事件都有一些属性提供有关变更的详细信息。

以下是 fsnotify 包中常见事件的属性：

1. Create（创建文件或文件夹）:
   - Name: 被创建的文件或文件夹的名称。
   - Op: 指示操作类型为创建。

2. Write（写入文件）:
   - Name: 被写入的文件的名称。
   - Op: 指示操作类型为写入。

3. Remove（删除文件或文件夹）:
   - Name: 被删除的文件或文件夹的名称。
   - Op: 指示操作类型为删除。

4. Rename（重命名文件或文件夹）:
   - OldName: 被重命名的文件或文件夹的旧名称。
   - NewName: 被重命名的文件或文件夹的新名称。
   - Op: 指示操作类型为重命名。

5. Chmod（修改文件权限）:
   - Name: 被修改权限的文件或文件夹的名称。
   - Op: 指示操作类型为权限修改。

这些事件属性可以帮助你确定发生了哪种类型的文件变更，并提供有关变更的更多细节。

你可以根据需要使用这些属性来处理文件变更事件。

## chat2-如何获取 Op

在 fsnotify 包中，当监听到文件事件后，你可以通过访问  event.Op  属性来获取对应的操作类型（Op）。

event.Op  是一个  fsnotify.Op  类型的常量，表示文件事件的操作类型。 
 
以下是一些常见的操作类型以及它们的含义： 
 
-  fsnotify.Create : 文件或文件夹被创建。 
-  fsnotify.Write : 文件被写入。 
-  fsnotify.Remove : 文件或文件夹被删除。 
-  fsnotify.Rename : 文件或文件夹被重命名。 
-  fsnotify.Chmod : 文件或文件夹的权限被修改。 

## 代码调整

```go
// 启动一个无限循环来监听文件事件
for {
	select {
	case event, ok := <-watcher.Events:
		if !ok {
			return
		}
		switch event.Op {
			case fsnotify.Create:
				fmt.Println("文件或文件夹被创建:", event.Name)
			case fsnotify.Write:
				fmt.Println("文件被写入:", event.Name)
			case fsnotify.Remove:
				fmt.Println("文件或文件夹被删除:", event.Name)
			case fsnotify.Rename:
				fmt.Println("文件或文件夹被重命名:", event.Name)
			case fsnotify.Chmod:
				fmt.Println("文件或文件夹权限被修改:", event.Name)
		}
	case err, ok := <-watcher.Errors:
		if !ok {
			return
		}
		log.Println("错误:", err)
	}
}
```

## 测试

此时我们修改文件内容，得到的日志如下：

```
$ ./m.exe
2023/11/01 23:03:52 开始处理文件夹： D:\logsdata
文件被写入: D:\logsdata\2.txt
文件被写入: D:\logsdata\2.txt
文件被写入: D:\logsdata\2.txt
文件被写入: D:\logsdata\2.txt
```

# v4-获取变更文件的内容

## 说明

在知道文件内容变化之后，我们如何获取文件的内容呢？

## chat1-go 如何根据文件路径，获取文件内容？指定文件编码格式为 UTF-8

在 Go 中，你可以使用  `ioutil.ReadFile`  函数来根据文件路径获取文件内容。

以下是一个示例代码，它演示了如何根据文件路径读取文件内容并将其解析为 UTF-8 编码的文本：

```go
package main

import (
	"fmt"
	"io/ioutil"
)

func main() {
	filePath := "/path/to/file.txt"

	content, err := ioutil.ReadFile(filePath)
	if err != nil {
		fmt.Println("无法读取文件:", err)
		return
	}

	text := string(content)

	fmt.Println("文件内容:", text)
}
```

在上面的代码中，你需要将  `"/path/to/file.txt"`  替换为你要读取的文件的实际路径。

代码将使用  `ioutil.ReadFile`  函数读取文件内容，并将其存储在  `content`  变量中。

然后，使用  `string`  函数将字节切片转换为字符串，并将其存储在  `text`  变量中。

最后，将文件内容打印出来。

请注意， `ioutil.ReadFile`  函数将文件内容作为字节切片返回。

如果你需要以其他格式解析文件内容，例如 JSON 或 XML，你需要使用相应的库进行解析。

## 调整代码

我们添加一个读取文件内容的方法：

```go
//默认以 UTF-8 的编码读取文件内容
func getFileContent(filePath string) string {
	content, err := ioutil.ReadFile(filePath)
	if err != nil {
		fmt.Println("无法读取文件:", err)
		return "";
	}

	text := string(content)
	return text;
}
```

然后在文件变更事件的时候，读取文件内容:

```go
case fsnotify.Write:
	fmt.Println("文件被写入:", event.Name)
	// 获取文件内容
	writeContent := getFileContent(event.Name);	
	fmt.Println("文件被写入后的内容:", writeContent)
```

## 测试效果

我们编辑一个文件，得到的变更效果如下：

```
$ ./m.exe
2023/11/01 23:11:57 开始处理文件夹： D:\logsdata
文件被写入: D:\logsdata\2.txt
文件被写入后的内容: 11111哈哈哈哈
文件被写入: D:\logsdata\2.txt
文件被写入后的内容: 11111哈哈哈哈
文件被写入: D:\logsdata\2.txt
文件被写入后的内容: 11111哈哈哈哈
文件被写入: D:\logsdata\2.txt
文件被写入后的内容: 11111哈哈哈哈
文件被写入: D:\logsdata\2.txt
文件被写入后的内容: 11111哈哈哈哈顶顶顶顶
文件被写入: D:\logsdata\2.txt
文件被写入后的内容: 11111哈哈哈哈顶顶顶顶
文件被写入: D:\logsdata\2.txt
文件被写入后的内容: 11111哈哈哈哈顶顶顶顶
文件被写入: D:\logsdata\2.txt
文件被写入后的内容: 11111哈哈哈哈顶顶顶顶
```

# v5-如何过滤多次监听触发的问题？

## 说明

发现上面的监听方法，在文件保存时，会收到多次文件的 write 事件，为什么？

chat:

```
当文件保存时，你可能会收到多次文件的写入事件（ `fsnotify.Write` ）。

这是由于不同的编辑器或操作系统在保存文件时的行为不同，可能会导致多个写入事件的触发。

一种常见的情况是，当你在编辑器中保存文件时，编辑器可能会执行多个写入操作。

例如，当你保存文件时，编辑器可能会首先将文件的内容截断为空，然后再将新的内容写入文件。这样的行为可能会导致多个写入事件的触发。

此外，某些操作系统也可能会在保存文件时执行类似的行为，导致多个写入事件的触发。

为了处理这种情况，你可以在代码中添加一些逻辑来过滤重复的写入事件，只处理最后一次写入事件。

你可以使用一个定时器来延迟处理事件，以确保在一段时间内没有更多的写入事件发生后再处理。

希望这个解答对你有帮助！如果还有其他问题，请随时提问。
```

## chat1-定时器解决方案

结合上面的代码，以下是一个简单的去重重复写入事件的过滤代码示例：

```go
package main

import (
	"fmt"
	"github.com/fsnotify/fsnotify"
	"log"
	"time"
)

func main() {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	defer watcher.Close()

	dirPath := "/path/to/folder"

	err = watcher.Add(dirPath)
	if err != nil {
		log.Fatal(err)
	}

	// 定义一个定时器，用于延迟处理事件
	timer := time.NewTimer(500 * time.Millisecond)
	defer timer.Stop()

	// 定义一个用于存储最后一次写入事件的变量
	var lastWriteEvent *fsnotify.Event

	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}

			// 如果事件类型为写入，并且定时器还在运行中，则重置定时器
			if event.Op == fsnotify.Write && !timer.Stop() {
				<-timer.C
			}

			// 如果事件类型为写入，并且与最后一次写入事件不同，则处理事件
			if event.Op == fsnotify.Write && lastWriteEvent != nil && event.Name != lastWriteEvent.Name {
				processEvent(event)
			}

			// 更新最后一次写入事件
			if event.Op == fsnotify.Write {
				lastWriteEvent = &event
				// 启动定时器，延迟处理事件
				timer.Reset(500 * time.Millisecond)
			}

		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Println("错误:", err)
		}
	}
}

func processEvent(event fsnotify.Event) {
	fmt.Println("处理事件:", event)
	// 在这里添加你希望执行的处理逻辑
}
```

在上面的代码中，我们添加了一个定时器和一个变量来存储最后一次写入事件。

当收到写入事件时，我们首先检查定时器是否还在运行中，如果是，则重置定时器以延迟处理事件。

然后，我们检查当前写入事件是否与最后一次写入事件不同，如果是，则处理事件。

最后，我们更新最后一次写入事件，并启动定时器以延迟处理事件。

这样，重复的写入事件将被过滤掉，只有最后一次写入事件会被处理。

## chat2-根据时间间隔处理

当涉及到去重重复写入事件时，还有其他一些更加优雅和简单的方式。

以下是一个示例代码，它通过使用时间戳来判断写入事件的时间间隔，以过滤掉重复的写入事件：

```go
package main

import (
	"fmt"
	"github.com/fsnotify/fsnotify"
	"log"
	"time"
)

func main() {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	defer watcher.Close()

	dirPath := "/path/to/folder"

	err = watcher.Add(dirPath)
	if err != nil {
		log.Fatal(err)
	}

	// 定义一个用于存储最后一次写入事件的时间戳
	var lastWriteTime time.Time

	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}

			// 如果事件类型为写入，并且距离上次写入事件超过500毫秒，则处理事件
			if event.Op == fsnotify.Write && time.Since(lastWriteTime) > 500*time.Millisecond {
				processEvent(event)
				lastWriteTime = time.Now()
			}

		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Println("错误:", err)
		}
	}
}

func processEvent(event fsnotify.Event) {
	fmt.Println("处理事件:", event)
	// 在这里添加你希望执行的处理逻辑
}
```

在这个示例代码中，我们使用一个变量  `lastWriteTime`  来存储最后一次写入事件的时间戳。

当收到写入事件时，我们首先检查距离上次写入事件的时间间隔是否超过了500毫秒，如果是，则处理事件并更新  `lastWriteTime` 。

这种方式更加简单，通过时间间隔来判断重复事件，避免了使用定时器的复杂性。

希望这个示例代码能满足你的需求！如果还有其他问题，请随时提问。

## 代码调整

我们结合上面的代码，决定使用 map 来保存每一个文件的最后修改时间。

### map 的创建

go 如何创建一个 map 数据结构，key 是 string, value 是一个 long 时间戳。

在 Go 中，你可以使用内置的  `map`  数据结构来创建一个映射，其中 key 是字符串类型，value 是一个长整型（时间戳）。

以下是一个示例代码，演示了如何创建和使用这样的  `map`  数据结构：

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	// 创建一个 map，key 是字符串，value 是长整型（时间戳）
	timestamps := make(map[string]int64)

	// 添加键值对到 map 中
	timestamps["key1"] = time.Now().Unix()
	timestamps["key2"] = time.Now().Unix()

	// 读取 map 中的值
	value1 := timestamps["key1"]
	value2 := timestamps["key2"]

	// 打印值
	fmt.Println("key1 对应的时间戳:", value1)
	fmt.Println("key2 对应的时间戳:", value2)
}
```

在上面的示例代码中，我们使用  `make`  函数创建了一个  `map`  数据结构，其中 key 是字符串类型，value 是长整型（时间戳）。

然后，我们通过使用键来给  `map`  赋值，并使用键来获取相应的值。

### 代码调整

我们通过一个 map 记录每一个文件和对应的修改时间。

然后计算差值，小于 50ms 则不做内容变化输出：

```go
//create map save data
fileUpdateTimes := make(map[string]int64)	

for {
	select {
	case event, ok := <-watcher.Events:
		if !ok {
			return
		}

		switch event.Op {
			case fsnotify.Create:
				fmt.Println("文件或文件夹被创建:", event.Name)
			case fsnotify.Write:
				fmt.Println("文件被写入:", event.Name)
				// 存放修改的时间
				lastTimeMs := fileUpdateTimes[event.Name];
				currentTimeMs := getTimeMs();
				if(lastTimeMs != 0) {
					diffTimeMs := currentTimeMs - lastTimeMs;
					fmt.Println("diffTimeMs:", diffTimeMs)
					if(diffTimeMs <= 50) {
						break;	
					}
				}
				// update lastTime
				fmt.Println("update time:", currentTimeMs)
				fileUpdateTimes[event.Name] = currentTimeMs;
				// 获取文件内容
				writeContent := getFileContent(event.Name);	
				fmt.Println("文件被写入后的内容:", writeContent)
			case fsnotify.Remove:
				fmt.Println("文件或文件夹被删除:", event.Name)
			case fsnotify.Rename:
				fmt.Println("文件或文件夹被重命名:", event.Name)
			case fsnotify.Chmod:
				fmt.Println("文件或文件夹权限被修改:", event.Name)
		}
	case err, ok := <-watcher.Errors:
		if !ok {
			return
		}
		log.Println("错误:", err)
	}
}


func getTimeMs() int64 {
	return  time.Now().UnixNano() / int64(time.Millisecond);
}
```

### 测试

我们再次测试文件的内容变更，日志如下：

```
$ ./m.exe
2023/11/01 23:42:29 开始处理文件夹： D:\logsdata
文件被写入: D:\logsdata\2.txt
update time: 1698853354304
文件被写入后的内容: 11111哈哈哈哈顶顶顶顶对对对对对dddddddddddddddddd
文件被写入: D:\logsdata\2.txt
diffTimeMs: 1
文件被写入: D:\logsdata\2.txt
diffTimeMs: 1
文件被写入: D:\logsdata\2.txt
diffTimeMs: 1
文件被写入: D:\logsdata\2.txt
diffTimeMs: 8146
update time: 1698853362450
文件被写入后的内容: 11111哈哈哈哈顶顶顶顶对对对对对dddddddddddddddddddddd
文件被写入: D:\logsdata\2.txt
diffTimeMs: 1
文件被写入: D:\logsdata\2.txt
diffTimeMs: 1
文件被写入: D:\logsdata\2.txt
diffTimeMs: 1
文件被写入: D:\logsdata\2.txt
diffTimeMs: 8180
update time: 1698853370630
文件被写入后的内容: 11111哈哈哈哈顶
```

可以看到触发了多次文件的写入动作，但是只有超过一定的时间，我们才输出对应的文件内容。

# v6-文件编码问题

## 说明

默认我们的方法是 utf-8 的，如果我们是其他的编码怎么办？

比如我们创建一个 gb2313 的文件。

输入内容：

```
你好啊，我的老伙计。
```

这时候输出是：

```
文件被写入后的内容: ▒▒ð▒▒▒▒ҵ▒▒ϻ▒ơ▒
```

## 指定编码读取内容

### chat-如何指定编码？

导入包

```
"github.com/axgle/mahonia"
```

方法调整

```go
//默认以 UTF-8 的编码读取文件内容
func getFileContent(filePath string) string {
	// 默认编码
	content, err := ioutil.ReadFile(filePath)
	if err != nil {
		fmt.Println("无法读取文件:", err)
		return "";
	}

	text := string(content)

	// 指定其他编码, 转 GBK
	if(filePath == "D:\\logsdata\\gbk.txt") {
		text = mahonia.NewDecoder("gbk").ConvertString(text)
	}

	return text;
}
```

install

```
go get github.com/axgle/mahonia
```

这个时候在测试 GBK 文件，编码如下：

```
文件被写入: D:\logsdata\gbk.txt
update time: 1698855304939
文件被写入后的内容: 你好啊，我的老伙计。
ddd
```

# 参考资料

chat

https://www.codingdict.com/questions/63128

https://blog.csdn.net/weixin_33915554/article/details/91869462

https://juejin.cn/s/golang%20%E8%AF%BB%E5%8F%96%E6%96%87%E4%BB%B6%E4%B9%B1%E7%A0%81

https://blog.csdn.net/kkx12138/article/details/87927175

https://www.zongscan.com/demo333/28308.html

[解决中文乱码](https://topgoer.com/%E5%85%B6%E4%BB%96/%E8%A7%A3%E5%86%B3%E4%B8%AD%E6%96%87%E4%B9%B1%E7%A0%81.html)

* any list
{:toc}