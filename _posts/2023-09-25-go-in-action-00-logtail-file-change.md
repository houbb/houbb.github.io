---
layout: post
title: go 实现日志采集-00-与 chat 沟通如何监听文件的变化？
date: 2023-09-25 21:01:55 +0800
categories: [Go]
tags: [monitor, go, log-collect, sh]
published: true
---

# 说明

如何通过 go 实现监听文件夹的变化，增量采集变化内容？

# 核心思路

1）监听文件夹的内容变化

2）监听对应文件的变化内容

# 1. 获取文件的内容

在Go语言中，你可以使用标准库中的`io/ioutil`包来获取文件的内容。

以下是一个示例代码，演示了如何读取文件的内容：

```go
package main

import (
	"fmt"
	"io/ioutil"
	"os"
)

func main() {
	// 指定要读取的文件路径
	filePath := "path/to/your/file.txt"

	// 读取文件内容
	content, err := ioutil.ReadFile(filePath)
	if err != nil {
		fmt.Println("Error reading file:", err)
		os.Exit(1)
	}

	// 将文件内容以字符串形式打印出来
	fmt.Println("File Content:")
	fmt.Println(string(content))
}
```

在这个示例中，我们首先指定要读取的文件路径，然后使用`ioutil.ReadFile`函数读取文件的内容。

如果出现错误，我们将其打印出来并退出程序。最后，我们将文件的内容以字符串形式打印出来。

请确保替换`"path/to/your/file.txt"`为你要读取的实际文件路径。

这只是一个简单的示例，实际应用中，你可能需要更复杂的文件读取和处理逻辑。

如果你需要更高级的文件操作，可以考虑使用`os.Open`和`bufio`等更底层的包，以便更好地控制文件的读取和处理过程。

## 如何获取指定行的内容？

在Go语言中，要获取大文件中的指定行的内容，你可以采用逐行读取文件的方式，而不是一次性将整个文件读取到内存中。

这样可以避免消耗大量内存，尤其是在处理大文件时。

### v1-逐行读取

以下是一个示例代码，演示如何逐行读取大文件中的指定行的内容：

```go
package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	// 指定要读取的文件路径
	filePath := "path/to/your/large/file.txt"

	// 指定要获取的行号（从0开始）
	targetLineNumber := 1000

	// 打开文件
	file, err := os.Open(filePath)
	if err != nil {
		fmt.Println("Error opening file:", err)
		os.Exit(1)
	}
	defer file.Close()

	// 使用 bufio.Scanner 来逐行读取文件内容
	scanner := bufio.NewScanner(file)

	// 计数器，用于跟踪当前行号
	currentLineNumber := 0

	// 逐行扫描文件内容
	for scanner.Scan() {
		line := scanner.Text()
		// 检查是否达到目标行号
		if currentLineNumber == targetLineNumber {
			fmt.Printf("Line %d: %s\n", targetLineNumber, line)
			break // 找到目标行后可以提前结束扫描
		}
		currentLineNumber++
	}

	if err := scanner.Err(); err != nil {
		fmt.Println("Error reading file:", err)
	}
}
```

在这个示例中，我们使用了`bufio.Scanner`来逐行读取文件内容，并在达到目标行号时输出该行的内容。

请注意，行号是从0开始的，所以如果要获取第1000行的内容，`targetLineNumber`应该设置为999。

这种方法适用于处理大文件，因为它只在内存中保持一行的内容，而不需要将整个文件加载到内存中。

然而，需要注意处理文件的错误情况，以确保程序能够正确地处理文件不存在或其他问题。

PS: 这样存在性能问题，每一次都要从头开始。

### v2-直接指定行？（偏移量）

Go标准库中的文件操作并没有提供直接跳转到文件的指定行的功能，因此在每次需要读取指定行时，你需要从文件的开头开始逐行读取，直到达到目标行。

这是因为文本文件中的行的长度是不固定的，因此无法准确计算每行的字节数并跳转到指定行。

如果需要频繁读取大文件中的指定行，可以考虑一些优化策略来减少不必要的遍历次数：

1. **缓存行**: 一旦你读取并确定了某一行的内容，你可以将其缓存起来，以便下次需要时可以直接访问，而不必重新遍历文件。

2. **索引文件**: 如果你需要频繁地访问大文件中的不同行，你可以考虑创建一个索引文件，记录每个行的位置（偏移量）以及行号。这样，当你需要读取特定行时，可以首先查找索引文件，然后根据偏移量跳转到文件的指定位置进行读取。这样可以大幅减少遍历文件的次数。

3. **分块读取**: 如果大文件太大以至于无法全部加载到内存中，你可以采用分块读取的方法，将文件分成多个小块，然后根据需要逐块读取，而不是整个文件。这样可以减少内存消耗。

无论哪种方式，都需要考虑性能和内存消耗的权衡，具体取决于你的需求和文件的大小。如果只需偶尔读取大文件中的指定行，逐行读取可能足够快。

如果需要高频读取不同行，那么考虑创建索引或其他优化方式可能更有帮助。

#### V3.1-偏移量

Q: go 读取文件的时候，如何记录偏移量？并且根据偏移量读取文件

在Go中，你可以使用`os.Seek`来设置文件的偏移量并根据偏移量读取文件内容。

以下是一个示例代码，演示如何记录偏移量并根据偏移量读取文件：

```go
package main

import (
    "fmt"
    "os"
)

func main() {
    // 指定要读取的文件路径
    filePath := "path/to/your/large/file.txt"

    // 打开文件
    file, err := os.Open(filePath)
    if err != nil {
        fmt.Println("Error opening file:", err)
        os.Exit(1)
    }
    defer file.Close()

    // 设置要读取的偏移量（以字节为单位）
    offset := int64(100) // 例如，设置偏移量为100字节

    // 使用os.Seek设置文件偏移量
    _, err = file.Seek(offset, 0) // 0 表示从文件的起始位置开始计算偏移量
    if err != nil {
        fmt.Println("Error setting file offset:", err)
        os.Exit(1)
    }

    // 读取指定位置的内容
    buffer := make([]byte, 1024) // 创建一个缓冲区来存储读取的内容
    n, err := file.Read(buffer)  // 从当前偏移量位置读取内容
    if err != nil {
        fmt.Println("Error reading file:", err)
        os.Exit(1)
    }

    // 输出读取的内容
    fmt.Printf("Read %d bytes from offset %d: %s\n", n, offset, string(buffer[:n]))
}
```

在这个示例中，我们首先打开文件，然后使用`os.Seek`设置文件的偏移量（以字节为单位）。

接着，我们创建一个缓冲区并使用`file.Read`方法从当前偏移量位置读取内容。最后，我们输出读取的内容。

请注意，`os.Seek`的第二个参数是用来指定相对于哪个位置设置偏移量的。

0表示相对于文件的起始位置，1表示相对于当前位置，2表示相对于文件的末尾位置。

在上面的示例中，我们使用0来从文件的起始位置设置偏移量。

根据你的需求，你可以根据文件中的特定格式和结构来处理读取的内容。

#### v3.2 如何判断 file.Read(buffer) 读到了行位?

要判断`file.Read(buffer)`是否读取了行尾，你需要检查读取的数据中是否包含换行符 (`\n`)。

通常，在文本文件中，换行符用于表示行的结束。

以下是一个示例代码，演示如何检查是否读取到了行位：

```go
package main

import (
    "fmt"
    "os"
)

func main() {
    // 指定要读取的文件路径
    filePath := "path/to/your/textfile.txt"

    // 打开文件
    file, err := os.Open(filePath)
    if err != nil {
        fmt.Println("Error opening file:", err)
        os.Exit(1)
    }
    defer file.Close()

    // 创建一个缓冲区来存储读取的数据
    bufferSize := 1024 // 适当调整缓冲区大小
    buffer := make([]byte, bufferSize)

    // 循环读取文件内容
    for {
        n, err := file.Read(buffer)
        if err != nil {
            fmt.Println("Error reading file:", err)
            break
        }

        // 检查读取的数据是否包含换行符
        for i := 0; i < n; i++ {
            if buffer[i] == '\n' {
                // 发现了换行符，表示读取到了行位
                fmt.Println("Found end of line")
                // 在这里可以处理行位的内容，例如输出或存储
            }
        }

        // 如果已经读取到文件末尾，退出循环
        if n < bufferSize {
            break
        }
    }
}
```

在这个示例中，我们使用一个缓冲区来循环读取文件的内容，然后在读取的数据中查找换行符。

如果找到了换行符，就表示读取到了行位，你可以在这里处理行位的内容。

当 `n` 的值小于缓冲区大小 `bufferSize` 时，表示已经读取到了文件末尾，我们可以退出循环。

请注意，这个示例仅适用于文本文件，并且假设换行符是行的结束符。

如果文件使用不同的行分隔符或包含其他特殊字符，你可能需要相应地调整检查的逻辑。

# 监听文件夹变化

## 监听文件变化的思路

而且通常我们还有这样的需求：

监听一个目录中所有文件，文件大小到一定阀值，则处理；
监控某个目录，当有文件新增，立马处理；
监控某个目录或文件，当有文件被修改或者删除，立马能感知，进行处理；

怎么做到这个事情呢？最常见的通常有三个办法：

- 第一种：当事人主动通知你，这是侵入式的，需要当事人修改这部分代码来支持，依赖于当事人的自觉；

- 第二种：轮询观察，这个是无侵入式的，你可以自己写个轮询程序，每隔一段时间唤醒一次，对文件和目录做各种判断，从而得到这个目录的变化；

- 第三种：操作系统支持，以事件的方式通知到订阅这个事件的用户，达到及时处理的目的；

很明显，第三种最好：

纯旁路的逻辑，对线上程序无侵入；

操作系统直接支持，以事件的形式通知，性能也最好，100% 准确率（比较自己轮询判断要好）；

## 浅析gowatch监听文件变动实现原理

刚开始接触go时，发现和解释型语言不同，go是编译型语言，即每次在有程序改动后，需要重新运行 go run或go build进行重新编译，更改才能生效，实则不便。

于是乎在网络上搜索发现了gowatch这个包，该包可通过监听当前目录下相关文件的变动，对go文件实时编译，提高研发效率。

那gowatch又是如何做到监听文件变化的呢？

通过阅读源码我们发现，在linux内核中，有一种用于通知用户空间程序文件系统变化的机制—Inotify。

它监控文件系统，并且及时向专门的应用程序发出相关的事件警告，比如删除、读、写和卸载操作等。您还可以跟踪活动的源头和目标等细节。

Golang的标准库syscall实现了该机制。为进一步扩展，实现了fsnotify包实现了一个基于通道的、跨平台的实时监听接口。

如下图：

![why](https://pic3.zhimg.com/80/v2-d1bec90577ca2838ed88b1773f1f533a_720w.webp)

根据上图可知，监听文件的变化主要依赖于linux内核的INotify接口机制。

Go的标准库中对其做了实现。

而fsnotify package的主要作用就是将进一步封装成watcher结构体和事件类型结构体的封装，从而实现事件的判断以及目录的监听。

下面看下 fsnotify package中对watcher的封装。

```go
type Watcher struct {

    mu sync.Mutex // Map access

    fd int // File descriptor (as returned by the inotify_init() syscall)

    watches map[string]*watch // Map of inotify watches (key: path)

    fsnFlags map[string]uint32 // Map of watched files to flags used for filter

    fsnmut sync.Mutex // Protects access to fsnFlags.

    paths map[int]string // Map of watched paths (key: watch descriptor)

    Error chan error // Errors are sent on this channel

    internalEvent chan *FileEvent // Events are queued on this channel

    Event chan *FileEvent // Events are returned on this channel

    done chan bool // Channel for sending a "quit message" to the reader goroutine

    isClosed bool // Set to true when Close() is first called

}
```

## linux内核Inotify接口简介

inotify中主要涉及3个接口。

分别是inotify_init, inotify_add_watch,read。

具体如下：

| 接口名	                            |  作用 |
|:----|:----|
| int fd = inotify_init()	            | 创建inotify实例，返回对应的文件描述符 |
| inotify_add_watch (fd, path, mask)	| 注册被监视目录或文件的事件 |
| read (fd, buf, BUF_LEN)	            | 读取监听到的文件事件 |

Inotify可以监听的文件系统事件列表：

| 事件名称	        |  事件说明 |
|:----|:----|
| IN_ACCESS	        | 文件被访问 |
| IN_MODIFY	        | 文件被 write |
| IN_CLOSE_WRITE	    | 可写文件被 close |
| IN_OPEN	            | 文件被 open |
| IN_MOVED_TO	        | 文件被移来，如 mv、cp |
| IN_CREATE	        | 创建新文件 |
| IN_DELETE	        | 文件被删除，如 rm |
| IN_DELETE_SELF	    | 自删除，即一个可执行文件在执行时删除自己 |
| IN_MOVE_SELF	    | 自移动，即一个可执行文件在执行时移动自己 |
| IN_ATTRIB	        | 文件属性被修改，如 chmod、chown、touch 等 |
| IN_CLOSE_NOWRITE	| 不可写文件被 close |
| IN_MOVED_FROM	    | 文件被移走,如 mv |
| IN_UNMOUNT	        | 宿主文件系统被 umount |
| IN_CLOSE	        | 文件被关闭，等同于(IN_CLOSE_WRITE | IN_CLOSE_NOWRITE) |
| IN_MOVE	            | 文件被移动，等同于(IN_MOVED_FROM | IN_MOVED_TO) |

## 实际操作

### 文件目录

```
Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         2023/9/25     20:14             42 1.txt
-a----         2023/9/25     20:13             70 go.mod
-a----         2023/9/25     20:13            171 go.sum
-a----         2023/9/25     19:51           1806 listen_change.go
-a----         2023/9/25     11:45            406 read_file.go
```

read_file.go 是一个文件读取文件
listen_change.go 是用来监听文件变更的实现类
1.txt 使我们用来测试的监听文件

### listen_change.go

内容如下：

```go
package main

import (
    "fmt"

    "github.com/howeyc/fsnotify"
    "runtime"
)


var exit chan bool

func main() {
    //1、初始化监控对象watcher
    watcher, err := fsnotify.NewWatcher() 

    if err != nil {

        fmt.Printf("Fail to create new Watcher[ %s ]\n", err)
    }

    //3、启动监听文件对象事件协程
    go func() {
        fmt.Println("开始监听文件变化")
        for {
            select {
            case e := <-watcher.Event:
                // 这里添加根据文件变化的业务逻辑
                fmt.Printf("监听到文件 - %s变化\n", e.Name)
                if e.IsCreate() {
                    fmt.Println("监听到文件创建事件")
                }
                if e.IsDelete() {
                    fmt.Println("监听到文件删除事件")
                }
                if e.IsModify() {
                    fmt.Println("监听到文件修改事件")
                }
                if e.IsRename() {
                    fmt.Println("监听到文件重命名事件")
                }
                if e.IsAttrib() {
                    fmt.Println("监听到文件属性修改事件")
                }

                fmt.Println("根据文件变化开始执行业务逻辑")
            
            case err := <-watcher.Error:

                fmt.Printf(" %s\n", err.Error())
            }
        }
    }()
    // 2、将需要监听的文件加入到watcher的监听队列中
    paths := []string{"1.txt"}

    for _, path := range paths {
        err = watcher.Watch(path) //将文件加入监听

        if err != nil {
            fmt.Sprintf("Fail to watch directory[ %s ]\n", err)
        }
    }

    <-exit
    runtime.Goexit()
}
```

`paths := []string{"1.txt"}` 这一行我们指定了需要监听的文件。

### 模块初始化

```sh
# 生成 mod 文件（切换到模块根目录）
go mod init modulename

# 清理无效依赖，增加缺失依赖
go mod tidy
```

对应的日志信息如下：

```
> go mod init modulename
go: creating new go.mod: module modulename
go: to add module requirements and sums:
        go mod tidy

> go mod tidy
go: finding module for package github.com/howeyc/fsnotify
go: downloading github.com/howeyc/fsnotify v0.9.0
go: found github.com/howeyc/fsnotify in github.com/howeyc/fsnotify v0.9.0
```

### 执行测试

我们首先运行监听代码：

```
> go run .\listen_change.go
开始监听文件变化
```

然后我们直接修改 1.txt 并且保存，就会触发对应的变更信息。

```
监听到文件 - .\1.txt变化
监听到文件修改事件
根据文件变化开始执行业务逻辑
监听到文件 - .\1.txt变化
监听到文件修改事件
根据文件变化开始执行业务逻辑
监听到文件 - .\1.txt变化
监听到文件修改事件
根据文件变化开始执行业务逻辑
监听到文件 - .\1.txt变化
监听到文件修改事件
根据文件变化开始执行业务逻辑
```

# 定时轮训的方式

## 说明

基于文件监听的，可以保证实时性。

不过在日志的处理中，也存在一个问题，那就是我们每一次变化，实际上可能会有很多，一次监听到变更，可能无法处理完所有。

流程：

1. 监听到变更，开始处理固定行数

2. 如果已经解析到结尾等，就进行批量上传

这种场景，通过定时轮训的方式，也不错：

## 实现示例

要实现一个日志变更监听工具，你可以使用 Go 语言的标准库和其他一些相关的库。

以下是一个简单的示例，演示了如何创建一个监听日志文件变更的工具：

```go
package main

import (
    "fmt"
    "io"
    "os"
    "time"
)

func main() {
    // 指定要监听的日志文件路径
    logFilePath := "path/to/your/logfile.log"

    // 打开日志文件以供读取
    logFile, err := os.Open(logFilePath)
    if err != nil {
        fmt.Println("Error opening log file:", err)
        return
    }
    defer logFile.Close()

    // 使用文件状态获取当前文件大小
    fileInfo, err := logFile.Stat()
    if err != nil {
        fmt.Println("Error getting file info:", err)
        return
    }
    fileSize := fileInfo.Size()

    // 创建一个定时器，每隔一段时间检查文件是否变化
    interval := 2 * time.Second // 检查间隔时间
    ticker := time.NewTicker(interval)
    defer ticker.Stop()

    for {
        select {
        case <-ticker.C:
            // 获取当前文件大小
            newFileInfo, err := logFile.Stat()
            if err != nil {
                fmt.Println("Error getting file info:", err)
                return
            }
            newFileSize := newFileInfo.Size()

            // 检查文件是否变化
            if newFileSize > fileSize {
                // 文件发生变化，读取新增的内容
                _, err := logFile.Seek(fileSize, io.SeekStart)
                if err != nil {
                    fmt.Println("Error seeking file:", err)
                    return
                }
                buffer := make([]byte, newFileSize-fileSize)
                _, err = logFile.Read(buffer)
                if err != nil {
                    fmt.Println("Error reading file:", err)
                    return
                }
                // 处理新增的日志内容，例如输出到控制台
                fmt.Println(string(buffer))
                // 更新文件大小
                fileSize = newFileSize
            }
        }
    }
}
```

这个示例中，我们首先打开要监听的日志文件，然后使用文件状态获取文件的初始大小。

接着，我们创建一个定时器，定期检查文件是否变化。

如果文件的大小发生变化，我们使用 `Seek` 将文件指针移动到上次检查之后的位置，并读取新增的内容，然后处理这些内容（在示例中，我们简单地将其输出到控制台）。

最后，我们更新文件大小以便下一次检查。

请注意，这个示例中使用了定时器来轮询文件的变化，这种方法对于小型日志文件是有效的。

如果要监听大型日志文件，你可能需要考虑使用更高级的技术，如`inotify`（Linux系统）或`ReadDirectoryChangesW`（Windows系统）等，以获得更好的性能和响应速度。

此外，还可以考虑使用第三方库，如`github.com/fsnotify/fsnotify`，来简化文件变化的监听。


# 拓展阅读

## 解释一下 go get 命令

`go get` 是Go语言的一个命令行工具，用于获取、安装并更新Go语言的依赖包。它的主要功能包括：

1. **获取包**: 当你运行 `go get <包的导入路径>` 时，`go get` 会自动从包的源代码仓库（通常是版本控制系统如Git、Mercurial或Subversion）中下载包的代码，并将其安装到你的Go工作区中的 `GOPATH` 目录下。这样，你可以轻松地获取第三方库或工具，以便在你的Go项目中使用。

2. **安装二进制工具**: 有些Go包是用于构建二进制工具的，而不仅仅是用于导入和使用。`go get` 可以下载这些包，并将它们编译成可执行文件，然后将可执行文件安装到Go的 `bin` 目录中，使你可以在命令行中直接运行这些工具。

3. **更新包**: 如果你运行 `go get -u <包的导入路径>`，`go get` 将尝试更新你已安装的包到最新版本。这对于保持你的依赖项是最新的非常有用。

4. **指定版本**: 你可以使用 `@<版本号>` 的语法来指定获取的包的特定版本。例如，`go get github.com/example/package@v1.2.3` 将获取指定版本的包。

5. **获取并安装全部依赖项**: 如果你在项目根目录下运行 `go get ./...`，它将获取并安装项目中所有依赖的包，包括直接和间接依赖项。

6. **自定义导入路径**: 你可以使用自定义的导入路径来将包安装到不同的目录，例如：`go get mydomain.com/myrepo/mypackage`。

需要注意的是，Go 1.17 版本后，`go get` 命令的行为发生了一些变化。它不再默认下载和安装包的二进制文件，而是在Go模块（Go Modules）中更多地被用来管理依赖关系。

使用Go模块时，`go get` 通常用于添加或更新依赖项，并且你可以使用 `go mod tidy` 命令来删除不再需要的依赖项。

总之，`go get` 是Go语言中用于获取、安装和管理依赖项的一个重要工具，它使得在Go项目中使用第三方包和工具变得非常方便。

## 详细解释一下 file.Read(buffer)

`file.Read(buffer)` 是 Go 语言中用于从文件中读取数据的操作。以下是关于该函数的详细解释：

1. **file**: `file` 是一个已经打开的文件对象，它通常是通过调用 `os.Open` 或其他文件操作函数返回的。在这个上下文中，`file` 表示你要从中读取数据的文件。

2. **buffer**: `buffer` 是一个字节切片（byte slice），用来存储从文件中读取的数据。在上面的示例中，我们使用 `make([]byte, 1024)` 创建了一个长度为 1024 字节的缓冲区。你可以根据需要调整缓冲区的大小。读取的数据将会被存储到这个缓冲区中。

3. **返回值**: `file.Read(buffer)` 的返回值是一个整数 `n` 和一个错误值 `err`。具体解释如下：
   - `n`：表示实际读取的字节数。如果文件读取完毕，或者发生了错误，`n` 的值可能小于缓冲区的大小。
   - `err`：表示读取过程中是否出现了错误。如果没有错误，`err` 的值为 `nil`；否则，它会包含一个错误信息，用于描述发生的问题。

示例中的代码使用 `file.Read(buffer)` 从当前文件偏移量位置读取数据，并将数据存储在 `buffer` 中。

读取的字节数 `n` 和错误信息 `err` 将会被返回。你可以根据实际需要来处理 `n` 和 `err` 的值。

在实际应用中，通常会在循环中多次调用 `file.Read` 来读取文件的内容，直到文件的末尾。一旦 `n` 的值为0，表示已经读取完文件的内容。

如果 `err` 不为 `nil`，表示在读取过程中发生了错误，需要根据具体错误信息来处理。

## go 如何编译运行一个 go 文件

在Go语言中，你可以使用`go run`命令来编译并运行一个Go文件。

以下是一些简单的步骤：

1. 创建一个Go源代码文件（例如，`main.go`），并在文件中编写Go程序。

2. 打开终端，导航到包含Go源代码文件的目录。

3. 使用以下命令编译并运行Go文件：

```bash
go run main.go
```

这将编译并执行`main.go`文件中的代码。如果代码中有任何问题，`go run`命令会显示错误信息。

请确保替换`main.go`为你实际的Go源代码文件名。

另外，如果你想将Go代码编译成可执行文件，可以使用`go build`命令。例如：

```bash
go build main.go
```

这将生成一个名为`main`（或者是你的Go文件的名称）的可执行文件，你可以在终端中运行它：

```bash
./main
```

注意，生成的可执行文件名称默认与源文件的包名一致，如果你的Go文件中的`package`语句为`package main`，则生成的可执行文件将为`main`。

如果你的Go文件位于不同的包中，可执行文件名称将与包名一致。

## 报错

```
D:\go> go get github.com/fsnotify/fsnotify

package golang.org/x/sys/windows: unrecognized import path "golang.org/x/sys/windows": https fetch: Get "https://golang.org/x/sys/windows?go-get=1": dial tcp 142.251.42.241:443: connectex: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond.
```

### 解决方案

1. 关掉GOSUMDB

```sh
go env -w GOSUMDB=off
```

2. 配置代理

```sh
go env -w GOPROXY=https://goproxy.cn
```

or

```sh
go env -w GOPROXY=https://mirrors.aliyun.com/goproxy/
```

### 生效的解决方式

```
go env -w GO111MODULE=on
go env -w GOPROXY=https://goproxy.io,direct
```

## 报错-2

```
PS D:\go> go get github.com/fsnotify/fsnotify
go: go.mod file not found in current directory or any parent directory.
        'go get' is no longer supported outside a module.
        To build and install a command, use 'go install' with a version,
        like 'go install example.com/cmd@latest'
        For more information, see https://golang.org/doc/go-get-install-deprecation
        or run 'go help get' or 'go help install'.
```

### 解决方式

```
# 生成 mod 文件（切换到模块根目录）
go mod init modulename

# 清理无效依赖，增加缺失依赖
go mod tidy
```




# 参考资料

chat

[浅析gowatch监听文件变动实现原理](https://zhuanlan.zhihu.com/p/341969415)

https://cloudmessage.top/archives/golang-%E6%96%87%E4%BB%B6%E5%8F%98%E5%8C%96%E7%9B%91%E6%8E%A7md

[golang 通过fsnotify监控文件，并通过文件变化重启程序](https://www.cnblogs.com/jkko123/p/7256927.html)

[go下载依赖报错：DIAL TCP 34.64.4.113:443: CONNECTEX: A CONNECTION ATTEMPT FAILED BECAUSE THE CONNECTED ](https://blog.51cto.com/u_13646572/6148569)

[使用go get下载第三方库失败的解决办法](https://zhuanlan.zhihu.com/p/627332370)

[【Go】go get is no longer supported outside a module](https://blog.csdn.net/sepnineth/article/details/125153354)

* any list
{:toc}