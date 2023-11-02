---
layout: post
title: go 实现日志采集-02-如何实现读取日志文件？
date: 2023-09-25 21:01:55 +0800
categories: [Go]
tags: [monitor, go, log-collect, sh]
published: true
---


# Q1- go 如何读取特别大的日志文件

## chat

在Go语言中，可以使用 `bufio` 包来逐行读取大型日志文件。

下面是一个示例代码：
package main

```go
import (
	"bufio"
	"log"
	"os"
)


func main() {
	filePath := "path/to/your/log/file.log"
	file, err := os.Open(filePath)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		// 处理每一行日志数据
		// 例如，可以输出到控制台或进行其他操作
		fmt.Println(line)
	}

	if err := scanner.Err(); err != nil {
		log.Fatal(err)
	}
}
```

上述代码使用 `bufio.Scanner` 来逐行读取日志文件。

通过调用 `scanner.Text()` 方法，可以获取每一行的内容进行处理。

你可以根据需要对每一行的日志数据进行处理，例如输出到控制台或进行其他操作。

需要注意的是，读取大型日志文件可能会占用较多的内存，因此建议在读取过程中适时释放资源，避免内存溢出。

另外，如果日志文件非常大（比如几GB以上），可能需要考虑分块读取或使用其他更高效的方式来处理。

## Q2-filebeta 这些日志采集组件，是如何实现大文件的解析的？

filebeat 是一个轻量级的开源日志文件数据收集器，用于将日志数据发送到 Elasticsearch 或其他输出目标。

它可以处理大文件的解析和收集。

filebeat 针对大文件的解析采用了以下策略：

1. 逐行读取：filebeat 逐行读取日志文件，确保每行日志都可以被解析和发送。它使用类似于上述提到的逐行读取方法，通过缓冲区或逐字节读取的方式，逐行获取日志内容。

2. 多行日志的处理：对于多行日志，例如堆栈跟踪或多行日志消息，filebeat 提供了多种方式来处理。它可以基于预定义的正则表达式模式或自定义规则来将多行日志合并为单个事件，以便更准确地解析和发送。

3. 支持多种日志格式：filebeat 内置了对常见日志格式（如 JSON、Apache、Nginx 等）的解析支持。它可以根据预定义的日志格式进行解析，并将解析后的字段提取出来，以便更方便地进行搜索和分析。

4. 可配置的日志解析器：filebeat 还提供了灵活的配置选项，允许用户根据特定的日志格式和结构定义自定义的日志解析器。用户可以编写自己的解析规则，以适应特定的日志格式和要求。

总之，filebeat 通过逐行读取、多行日志处理、内置解析器和可配置的解析选项等方式，实现了对大文件的解析和收集。

它可以高效地处理大型日志文件，并将解析后的日志数据发送到指定的目标。

## Q3-go 实现通过缓冲区，逐行读取大文件如何实现？

在 Go 语言中，可以通过缓冲区逐行读取大文件。

以下是一个示例代码，演示了如何使用缓冲区逐行读取大文件：

```go
package main

import (
	"bufio"
	"log"
	"os"
)

func main() {
	filePath := "path/to/your/file.txt"
	file, err := os.Open(filePath)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	bufferSize := 4096 // 定义缓冲区大小，根据实际情况调整
	buffer := make([]byte, bufferSize)
	scanner := bufio.NewScanner(file)

	// 设置缓冲区
	scanner.Buffer(buffer, bufferSize)

	for scanner.Scan() {
		line := scanner.Text()
		// 处理每一行日志数据
		processLine(line)
	}

	if err := scanner.Err(); err != nil {
		log.Fatal(err)
	}
}

func processLine(line string) {
	// 处理每一行日志数据
	// 例如，可以输出到控制台或进行其他操作
	println(line)
}
```

在上述代码中，我们使用了  `bufio.Scanner`  来逐行读取文件内容。

通过调用  `scanner.Buffer()`  方法，我们可以设置缓冲区的大小和底层数组，以便更高效地读取大文件。

然后，我们使用  `scanner.Scan()`  方法来迭代读取每一行，并调用  `scanner.Text()`  方法获取每一行的内容。

在  `processLine`  函数中，你可以根据需要对每一行的日志数据进行处理，例如输出到控制台或进行其他操作。

请注意，这种方法假设每一行的长度不超过缓冲区大小。

如果文件中的行长度超过了缓冲区大小，可能会导致行被截断。

如果需要处理超长行，可能需要考虑使用其他更复杂的方法来处理。

### 详细解释其中的几行

```go
// 设置缓冲区
scanner.Buffer(buffer, bufferSize)

for scanner.Scan() {
	line := scanner.Text()
	// 处理每一行日志数据
	processLine(line)
}
```

这段代码的作用是逐行读取大文件并处理每一行的日志数据。

下面对代码的每一行进行详细解释：

1.  `scanner.Buffer(buffer, bufferSize)` : 这行代码用于设置  `scanner`  的缓冲区。 

`buffer`  是一个字节数组，用于存储从文件中读取的数据。 

`bufferSize`  是缓冲区的大小，即每次读取的字节数。通过设置缓冲区，可以提高读取文件的效率。

2.  `for scanner.Scan() {` : 这行代码使用  `for`  循环来迭代读取文件中的每一行。 

`scanner.Scan()`  方法返回一个布尔值，表示是否还有更多的行可供读取。

当还有行可供读取时，循环会继续执行。

3.  `line := scanner.Text()` : 这行代码用于获取当前行的内容。

`scanner.Text()`  方法返回当前行的字符串表示。

4.  `processLine(line)` : 这行代码调用名为  `processLine`  的函数，并将当前行的内容作为参数传递给该函数。

在  `processLine`  函数中，你可以根据需要对每一行的日志数据进行处理，例如输出到控制台或进行其他操作。

总结起来，这段代码使用缓冲区逐行读取大文件。

通过调用  `scanner.Buffer()`  方法设置缓冲区的大小和底层数组，然后使用  `scanner.Scan()`  方法迭代读取每一行，并将每一行的内容传递给  `processLine`  函数进行处理。

### Q4-log.Fatal(err)  中的 log 包，会把日志输出到文件吗？文件路径默认是？

在默认情况下，log包中的 `log.Fatal(err)` 会将日志输出到标准错误输出（stderr），而不是输出到文件。

它会将错误消息打印到控制台，并以非零的状态码终止程序。

如果你希望将日志输出到文件，可以使用 `log.SetOutput()` 方法来更改日志的输出目标。

以下是一个示例代码，演示如何将日志输出到文件：

```go
package main

import (
	"log"
	"os"
)

func main() {
	filePath := "path/to/your/logfile.log"
	file, err := os.OpenFile(filePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	log.SetOutput(file)

	// 在这里使用 log 包打印日志
	log.Println("This is a log message")
	log.Fatal("This is a fatal error")

	// ...
}
```

在上述代码中，我们使用 `os.OpenFile()` 打开一个文件，然后通过 `log.SetOutput()` 将日志输出重定向到该文件。

你可以根据需要修改 `filePath` 变量以指定日志文件的路径。

需要注意的是，为了确保日志能够被正确地写入到文件中，我们在打开文件时使用了 `os.O_CREATE|os.O_WRONLY|os.O_APPEND` 参数来指定文件打开的模式。

同时，我们使用 `defer file.Close()` 来确保在程序结束时关闭文件。

请注意，这只是一个示例，你可以根据实际需求进行更多的自定义设置，如日志格式、日志级别等。



## Q5-如果日志文件一直有写入？那么什么时候终止呢？

是的，如果文件一直有写入并且没有结束， `for scanner.Scan() { }`  循环会一直执行下去。 

`scanner.Scan()`  方法会持续尝试从文件中读取下一行，如果文件中有新的内容写入，它会继续读取新的行。

这种情况下，循环不会自动终止，除非遇到了文件结束或者发生了其他错误。

你可以在循环体内使用适当的条件来控制循环的终止条件，例如检查特定的退出信号或达到某个条件时跳出循环。

以下是一个示例代码，演示了如何在文件持续写入的情况下控制循环的终止条件：

```go
package main

import (
	"bufio"
	"log"
	"os"
)

func main() {
	filePath := "path/to/your/file.txt"
	file, err := os.Open(filePath)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	bufferSize := 4096 // 定义缓冲区大小，根据实际情况调整
	buffer := make([]byte, bufferSize)
	scanner := bufio.NewScanner(file)

	// 设置缓冲区
	scanner.Buffer(buffer, bufferSize)

	for scanner.Scan() {
		line := scanner.Text()
		// 处理每一行日志数据
		processLine(line)

		// 检查是否需要终止循环
		if shouldTerminate() {
			break
		}
	}

	if err := scanner.Err(); err != nil {
		log.Fatal(err)
	}
}

func processLine(line string) {
	// 处理每一行日志数据
	// 例如，可以输出到控制台或进行其他操作
	println(line)
}

func shouldTerminate() bool {
	// 根据特定条件判断是否需要终止循环
	// 例如，检查是否达到某个时间或者接收到特定的退出信号
	// 返回 true 表示需要终止循环，false 表示继续循环
	return false
}
```

在上述代码中，我们在循环体中添加了一个  `shouldTerminate()`  函数来检查是否需要终止循环。

你可以根据实际需求在该函数中添加适当的条件来判断是否需要终止循环。

如果返回  `true` ，则循环会终止；如果返回  `false` ，则循环会继续执行。

## Q6-filebeta 是如何设计对一个文件的监听读取何时终止的?

filebeat 是一个用于实时收集和发送日志文件数据的开源组件，它可以监听文件的变化并实时读取文件内容。

filebeat 的监听读取何时终止，可以根据以下几种情况来决定：

1. 文件读取完成：当 filebeat 读取完整个文件的内容后，它会判断文件已被读取完成，并终止监听和读取操作。

2. 文件被删除或重命名：如果被监听的文件被删除或重命名，filebeat 会检测到文件不再存在，并终止监听和读取操作。

3. 配置变更：如果在运行时修改了 filebeat 的配置文件，例如添加或删除了要监听的文件路径，filebeat 会重新加载配置并根据新的配置终止旧的监听和读取操作，然后重新开始监听和读取新的文件。

需要注意的是，filebeat 是一个持续运行的进程，它会不断监听文件的变化并实时读取文件内容。

只有在满足上述条件之一时，filebeat 才会终止对文件的监听和读取操作。

另外，filebeat 还提供了一些配置选项，例如设置读取超时时间、忽略特定文件或目录等，以便更灵活地控制监听和读取的行为。

请注意，以上描述是基于 filebeat 的一般行为，具体的终止条件和行为可能会根据 filebeat 的版本和配置而有所不同。

建议查阅 filebeat 的官方文档以获取更详细和准确的信息。

### Q7-文件读取完成 这个要如何判断？

文件读取完成的判断可以根据不同的情况来确定。以下是几种常见的判断方式：

1. 根据文件指针位置：可以通过比较文件指针的位置和文件的大小来判断文件是否读取完成。

如果文件指针已经达到文件末尾，即指针位置等于文件大小，那么可以认为文件读取完成。

2. 根据文件变化监测：可以使用文件系统的监测机制来判断文件是否发生了变化。

例如，在Linux环境下，可以使用  `inotify`  或  `fsnotify`  等工具来监测文件的变化。

如果监测到文件被删除、重命名或修改等操作，那么可以认为文件读取完成。

3. 根据文件的关闭：如果文件被关闭，那么可以认为文件读取完成。

在读取文件时，可以在读取完毕后手动关闭文件，或者利用语言提供的资源释放机制自动关闭文件。

具体选择哪种判断方式取决于你的应用场景和需求。在实现时，可以根据具体情况选择最合适的方式来判断文件是否读取完成。

### Q8-给出上面几个场景的 go 判断实现

1. 根据文件指针位置：

```go
package main

import (
	"log"
	"os"
)

func main() {
	filePath := "path/to/your/file.txt"
	file, err := os.Open(filePath)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	fileInfo, err := file.Stat()
	if err != nil {
		log.Fatal(err)
	}

	fileSize := fileInfo.Size()
	buffer := make([]byte, 4096) // 定义缓冲区大小，根据实际情况调整

	for {
		bytesRead, err := file.Read(buffer)
		if err != nil {
			log.Fatal(err)
		}
		if int64(bytesRead) == 0 || int64(bytesRead) == fileSize {
			break // 文件读取完成
		}

		// 处理读取的数据
		processData(buffer[:bytesRead])
	}
}

func processData(data []byte) {
	// 处理读取的数据
	// 例如，可以对每个数据块进行解析、搜索、过滤等操作
	// 或者将数据写入其他地方，如数据库或其他文件
}
```

2. 根据文件变化监测：

```go
package main

import (
	"log"

	"github.com/fsnotify/fsnotify"
)

func main() {
	filePath := "path/to/your/file.txt"

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	defer watcher.Close()

	err = watcher.Add(filePath)
	if err != nil {
		log.Fatal(err)
	}

	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}
			if event.Op&fsnotify.Remove == fsnotify.Remove || event.Op&fsnotify.Rename == fsnotify.Rename {
				log.Println("文件已被删除或重命名，文件读取完成")
				return
			}
			// 文件发生其他变化，可以继续处理
			log.Println("文件发生其他变化")
		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Println("监测出错:", err)
		}
	}
}
```

3. 根据文件的关闭：

```go
package main

import (
	"log"
	"os"
)

func main() {
	filePath := "path/to/your/file.txt"
	file, err := os.Open(filePath)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	buffer := make([]byte, 4096) // 定义缓冲区大小，根据实际情况调整

	for {
		bytesRead, err := file.Read(buffer)
		if err != nil {
			log.Fatal(err)
		}
		if bytesRead == 0 {
			break // 文件读取完成
		}

		// 处理读取的数据
		processData(buffer[:bytesRead])
	}
}

func processData(data []byte) {
	// 处理读取的数据
	// 例如，可以对每个数据块进行解析、搜索、过滤等操作
	// 或者将数据写入其他地方，如数据库或其他文件
}
```

这些示例代码展示了在不同场景下如何使用 Go 实现文件读取的判断。

根据你的具体需求和场景，选择相应的实现方式。

请注意，这些代码仅供参考，你可能需要根据实际情况进行适当的修改和调整。


## Q9-go 针对一个文件，如何实现监听到创建时，单独开启一个携程处理？在文件删除时，停止携程，或者销毁掉

在Go中，你可以使用 `fsnotify` 包来监听文件系统事件，包括文件的创建和删除。

然后，你可以在文件创建时启动一个goroutine来处理文件，而在文件删除时停止或销毁该goroutine。

以下是一个示例代码，演示了如何实现在文件创建时启动goroutine，在文件删除时停止或销毁goroutine：

```go
package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/fsnotify/fsnotify"
)

func main() {
	filePath := "path/to/your/file.txt"

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	defer watcher.Close()

	err = watcher.Add(filepath.Dir(filePath))
	if err != nil {
		log.Fatal(err)
	}

	stopCh := make(chan struct{}) // 用于停止或销毁goroutine的通道

	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				if event.Name == filePath && event.Op&fsnotify.Create == fsnotify.Create {
					// 文件创建，启动goroutine处理文件
					go processFile(filePath, stopCh)
				} else if event.Name == filePath && event.Op&fsnotify.Remove == fsnotify.Remove {
					// 文件删除，停止或销毁goroutine
					stopCh <- struct{}{}
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				log.Println("监测出错:", err)
			}
		}
	}()

	// 保持主goroutine运行
	select {}
}

func processFile(filePath string, stopCh <-chan struct{}) {
	// 在这里编写处理文件的逻辑
	log.Println("处理文件:", filePath)

	// 模拟文件处理过程
	for {
		select {
		case <-stopCh:
			log.Println("停止处理文件:", filePath)
			return
		default:
			// 处理文件的具体操作
		}
	}
}
```

在上述代码中，我们使用 `fsnotify` 包来监听文件系统事件。

在启动的goroutine中，我们不断接收文件系统事件并根据事件类型执行相应的操作。

当检测到文件被创建时，我们启动一个goroutine来处理文件。

当检测到文件被删除时，我们通过向 `stopCh` 通道发送信号来停止或销毁处理文件的goroutine。

需要注意的是，为了保持主goroutine运行，我们使用了一个空的 `select{}` 语句。这样可以防止主goroutine在监听文件事件时退出。

请注意，上述代码只是一个示例，你可能需要根据具体需求进行适当的修改和调整。

另外，需要考虑并发访问文件时的同步和资源管理问题。

## Q10-对上面的代码进行调整，使用一个 map 存储，key 是文件的全路径 path。让每一个文件可以单独的携程 独立的处理和销毁？

好的，我来帮你进行调整，使用一个map来存储文件的全路径作为key，并让每个文件都能拥有独立的goroutine进行处理和销毁。

下面是修改后的代码：

```go
package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/fsnotify/fsnotify"
)

func main() {
	filePath := "path/to/your/file.txt"

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	defer watcher.Close()

	err = watcher.Add(filepath.Dir(filePath))
	if err != nil {
		log.Fatal(err)
	}

	fileWorkers := make(map[string]chan struct{}) // 使用map存储每个文件的goroutine的停止通道

	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				if event.Name == filePath && event.Op&fsnotify.Create == fsnotify.Create {
					// 文件创建，启动goroutine处理文件
					stopCh := make(chan struct{})
					fileWorkers[filePath] = stopCh
					go processFile(filePath, stopCh)
				} else if event.Name == filePath && event.Op&fsnotify.Remove == fsnotify.Remove {
					// 文件删除，停止或销毁goroutine
					stopCh, ok := fileWorkers[filePath]
					if ok {
						stopCh <- struct{}{}
						delete(fileWorkers, filePath)
					}
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				log.Println("监测出错:", err)
			}
		}
	}()

	// 保持主goroutine运行
	select {}
}

func processFile(filePath string, stopCh <-chan struct{}) {
	// 在这里编写处理文件的逻辑
	log.Println("处理文件:", filePath)

	// 模拟文件处理过程
	for {
		select {
		case <-stopCh:
			log.Println("停止处理文件:", filePath)
			return
		default:
			// 处理文件的具体操作
		}
	}
}
```

在修改后的代码中，我们使用一个 `fileWorkers` 的map来存储每个文件的goroutine的停止通道。

当文件被创建时，我们为该文件创建一个新的停止通道，并将其存储在 `fileWorkers` 中。

当文件被删除时，我们从 `fileWorkers` 中取出对应的停止通道，并向该通道发送信号以停止或销毁对应的goroutine。

这样，每个文件都可以拥有独立的goroutine进行处理和销毁。

请注意，上述代码仅作为示例，你可能需要根据具体需求进行适当的修改和调整。

同样，需要考虑并发访问文件时的同步和资源管理问题。

### 解释下

详细解释下下面的几行：

```go
stopCh := make(chan struct{})

for {
	select {
	case <-stopCh:
		log.Println("停止处理文件:", filePath)
		return
	default:
		// 处理文件的具体操作
	}
}


stopCh <- struct{}{}
```

这段代码用于实现在goroutine中处理文件的操作，并通过 `stopCh` 通道来控制goroutine的停止。

首先，我们使用 `make(chan struct{})` 创建了一个无缓冲的通道 `stopCh` 。这个通道用于向goroutine发送信号，以停止或销毁goroutine。

然后，在一个无限循环中，我们使用 `select` 语句监听多个通道的操作，包括 `stopCh` 通道。

在 `select` 语句中，我们使用 `case <-stopCh` 来接收 `stopCh` 通道的值。

如果接收到了值，表示需要停止或销毁goroutine，那么就会执行 `log.Println("停止处理文件:", filePath)` 来输出停止信息，并使用 `return` 语句来终止goroutine。

在 `select` 语句中，我们还使用了 `default` 分支，它会在没有其他通道准备好的情况下执行。

在这个分支中，我们可以处理文件的具体操作。这里只是一个示例，你可以根据实际需求编写具体的文件处理逻辑。

最后，通过 `stopCh <- struct{}{}` 向 `stopCh` 通道发送一个空结构体的值。

这样，当 `stopCh` 通道被读取时，会接收到这个值，从而触发停止或销毁goroutine的操作。

总结起来，这段代码实现了通过 `stopCh` 通道来控制goroutine的停止。

在循环中，我们可以执行文件的具体操作，当接收到 `stopCh` 通道的值时，就会停止或销毁goroutine。

# 实战

## 核心思路

### 1. 触发读取的时机是？

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
					
					// TODO: 这里触发文件的开始处理？

				case fsnotify.Remove:

					// TODO: 这里触发文件的完成处理？
					fmt.Println("文件或文件夹被删除:", event.Name)
				case fsnotify.Rename:

					// TODO: 这里触发文件的完成处理？

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

写入事件之后，开始处理文件的读。

### 2. 终止的时机是什么？

文件删除、rename 之后，不再处理。认为已经完成。

磁盘是有限的，所以一定会做归档。归档之后，则不再处理这个文件。

### 3. 如何读取大文件？

```go
package main

import (
	"bufio"
	"log"
	"os"
)

func main() {
	filePath := "path/to/your/file.txt"
	file, err := os.Open(filePath)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	bufferSize := 65535 // 定义缓冲区大小，根据实际情况调整
	buffer := make([]byte, bufferSize)
	scanner := bufio.NewScanner(file)

	// 设置缓冲区
	scanner.Buffer(buffer, bufferSize)

	for scanner.Scan() {
		line := scanner.Text()
		// 处理每一行日志数据
		processLine(line)

		// 检查是否需要终止循环
		if shouldTerminate() {
			break
		}
	}

	if err := scanner.Err(); err != nil {
		log.Fatal(err)
	}
}

func processLine(line string) {
	// 处理每一行日志数据
	// 例如，可以输出到控制台或进行其他操作
	println(line)
}

func shouldTerminate() bool {
	// 根据特定条件判断是否需要终止循环
	// 例如，检查是否达到某个时间或者接收到特定的退出信号
	// 返回 true 表示需要终止循环，false 表示继续循环
	return false
}
```

我们限制最大的读取 buffer 为 65535，这个后续可以调整为配置。



## 文件读取，服务重启了怎么办？

### 问题

如果服务重启了，我们该如何找到上一次找到哪里了呢？

### 解决思路

1）读取的时候，存储每一次读取的行号+offset 偏移量

2）服务启动的时候，直接从 offset 的位置开始读取。

### 读取时，同时记录偏移量

在读取文件的同时记录每一行的偏移量，可以使用一个变量来跟踪当前行的偏移量。

每次读取一行后，更新该变量的值为当前的文件指针位置，即可记录每一行的偏移量。

以下是一个示例代码，演示了如何在读取文件的同时记录每一行的偏移量：

```go
package main

import (
	"bufio"
	"log"
	"os"
)

func main() {
	filePath := "path/to/your/file.txt"
	file, err := os.Open(filePath)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	offsets := make([]int64, 0) // 用于记录每一行的偏移量
	scanner := bufio.NewScanner(file)

	var offset int64 // 当前行的偏移量
	for scanner.Scan() {
		line := scanner.Text()
		offset = scanner.BytesRead() // 获取当前行的偏移量
		offsets = append(offsets, offset)

		// 处理每一行日志数据
		processLine(line)
	}

	if err := scanner.Err(); err != nil {
		log.Fatal(err)
	}

	// 打印每一行的偏移量
	for i, offset := range offsets {
		log.Printf("Line %d offset: %d", i+1, offset)
	}
}
```

在上述代码中，我们使用一个 `offsets` 切片来记录每一行的偏移量。

在每次读取一行后，通过 `scanner.BytesRead()` 方法获取当前行的偏移量，并将其添加到 `offsets` 切片中。

最后，我们遍历 `offsets` 切片，打印每一行的偏移量。

请注意， `scanner.BytesRead()` 方法返回的是当前行的偏移量，而不是整个文件的偏移量。

如果你需要记录整个文件的偏移量，可以在每次读取一行后，将 `offset` 累加到一个变量中，以得到整个文件的偏移量。

这样，你就可以在读取文件的同时记录每一行的偏移量。根据需要，你可以根据具体的业务逻辑对每一行的偏移量进行进一步处理或记录。

------------------------------

当然，我们实际上不需要每一行的，只需要更新保存最新的就行：

```go
lastOffset := 0 // 最新的偏移量
scanner := bufio.NewScanner(file)

var offset int64 // 当前行的偏移量
for scanner.Scan() {
	line := scanner.Text()
	offset = scanner.BytesRead() // 获取当前行的偏移量
	lastOffset += offset
	// 处理每一行日志数据
	processLine(line)
}
```

### 启动时，直接从 offset 开始读取

在读取文件时，如果想要从指定的偏移量开始读取，可以使用 `os.File` 的 `Seek()` 方法将文件指针移动到指定的偏移量位置。

然后，可以使用 `bufio.Scanner` 从该位置开始逐行读取文件。

以下是一个示例代码，演示了如何从指定的偏移量开始读取文件：

```go
func main() {
	// 文件开始处理

	_, err = file.Seek(offset, 0)

	if err != nil {
		log.Fatal(err)
	}

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		// 处理每一行日志数据
		processLine(line)
	}
}

func processLine(line string) {
	// 处理每一行日志数据
	// 例如，可以输出到控制台或进行其他操作
	println(line)
}
```

在上述代码中，我们使用 `os.File` 的 `Seek()` 方法将文件指针移动到指定的偏移量位置。 

`Seek()` 方法的第一个参数是偏移量，第二个参数是相对位置，其中 `0` 表示相对于文件开头， `1` 表示相对于当前位置， `2` 表示相对于文件末尾。

在这里，我们使用 `0` 作为相对位置，将文件指针移动到指定的偏移量位置。

然后，我们使用 `bufio.Scanner` 从指定偏移量位置开始逐行读取文件内容。

每次调用 `scanner.Scan()` 方法，它会从当前位置开始读取下一行。

然后，我们可以在 `processLine` 函数中处理每一行的日志数据。

请注意，代码中的偏移量是以字节为单位的，可以根据具体需求进行调整。

此外，需要确保指定的偏移量在文件范围内，否则可能会导致错误。


## 开始与终止-异步处理化

### 思路

每一个文件在创建的时候，启动一个监听的携程。

在文件被移除/rename 的时候，销毁监听的携程。

### 代码

参考上面的 chat 给的方式，可能需要适当调整。



### Q11: 如何判断文件是否以  `.log` 结尾。

在Go语言中，你可以使用标准库中的`strings`包来判断文件名的后缀是否为`.log`。以下是一个示例代码：

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fileName := "example.log"
	if strings.HasSuffix(fileName, ".log") {
		fmt.Println("文件名的后缀是 .log")
	} else {
		fmt.Println("文件名的后缀不是 .log")
	}
}
```

在这个例子中，`strings.HasSuffix`函数接受两个参数：第一个参数是要检查的字符串，第二个参数是要匹配的后缀。

如果第一个参数以第二个参数作为后缀，该函数将返回`true`，否则返回`false`。

在这里，我们检查`fileName`变量的后缀是否为`.log`。

### Q12-fsnotify.Rename 重命名时，如何获取文件原来的路径path和现在的路径path？

rename 实际上会触发两个事件。

文件的 rename

新文件的 create


### Q13: 为什么下面的代码。显示的内容会重复？

```go
bufferSize := 65535
buffer := make([]byte, bufferSize)
scanner := bufio.NewScanner(file)
scanner.Buffer(buffer, bufferSize)
for scanner.Scan() {
	line := scanner.Text()
	log.Println("当前行内容为", line)
}
```


# 完整的实现

```go
package main

import (
	"log"
	"os"
	"bufio"
	"fmt"
	"io/ioutil"	
	"time"
	"strings"
	"encoding/json"

	"github.com/fsnotify/fsnotify"
	"github.com/axgle/mahonia"
)



// 存放每一个文件，读取到的文件路径 pos。用于重启时，便于下一次的内容恢复
//1. 启动时，从指定的文件加载初始化
//2. 文件写入的时候，更新这个属性值。
// 声明一个全局变量map，key是string，value是int
var fileOffsets map[string]int64
// 存储文件偏移量的地址
var fileOffsetStorePath string

// chan
var fileWorkers map[string]chan struct{}

func scheduleStore() {
	// 创建一个Ticker，每5分钟触发一次
	ticker := time.NewTicker(1 * time.Minute)

	// 启动一个goroutine来处理定时任务
	go func() {
		for {
			select {
			case <-ticker.C:
				// 在这里执行你的定时任务的代码
				storeOffsetIntoLocal()
			}
		}
	}()
}

// 保存 offset 
func storeOffsetIntoLocal() {
	fmt.Println("storeOffsetIntoLocal start....")

	// 将map序列化为JSON字符串
	jsonData, err := json.Marshal(fileOffsets)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	// 使用os.OpenFile函数以写入模式打开文件，权限为0666（读写权限）
	file, err := os.OpenFile(fileOffsetStorePath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0666)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	_, err = file.Write(jsonData)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("JSON数据已写入到文件:", fileOffsetStorePath)
}

func createOffsetLocalFile() {
	// 使用os.Stat函数判断文件是否存在
	_, err := os.Stat(fileOffsetStorePath)

	if err == nil {
		fmt.Println("文件存在")
	} else if os.IsNotExist(err) {
		fmt.Println("文件不存在")
		_, err := os.Create(fileOffsetStorePath)
		if err != nil {
			fmt.Println("Error:", err)
			return
		}
		// defer file.Close()
	} else {
		fmt.Println("发生错误:", err)
	}
}

// 根据本地的文件进度，根据本地的文件
func initFileOffsetByLocal() {
	// 读取文件
	jsonData := getFileContent(fileOffsetStorePath)
	if(len(jsonData) > 0) {
		err := json.Unmarshal([]byte(jsonData), &fileOffsets)
		if err != nil {
			fmt.Println("initFileOffsetByLocal Error:", err)
		} else {
			// fmt.Println("初始化完成 : ", fileOffsets)
		}
	} else {
		fileOffsets = make(map[string]int64)
	}

	fmt.Println("初始化完成 fileOffsets=", fileOffsets)
}

func main() {
	fileOffsetStorePath = "D:\\logsdata\\config\\fileOffset.json";
	// create file
	createOffsetLocalFile()
	// 初始化文件的偏移量
	initFileOffsetByLocal()
	// 定时存储
	scheduleStore()

	// 使用map存储每个文件的goroutine的停止通道
	fileWorkers = make(map[string]chan struct{}) 

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
			switch event.Op {
				case fsnotify.Create:
					fmt.Println("文件或文件夹被创建:", event.Name)

					// 文件名称
					addNewChan(event.Name)
				case fsnotify.Write:
				case fsnotify.Remove:
					fmt.Println("文件或文件夹被删除:", event.Name)

					removeChan(event.Name)
				case fsnotify.Rename:
					// 文件重命名会触发两个事件：旧文件的 rename, 新文件的 create
					fmt.Println("文件或文件夹被重命名:", event.Name)
					// 移除旧的
					removeChan(event.Name)
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
}

// 移除对应的 chann
func removeChan(filePath string) {
	// 文件删除，停止或销毁goroutine
	stopCh, ok := fileWorkers[filePath]
	if ok {
		stopCh <- struct{}{}
		delete(fileWorkers, filePath)
	}
}

// 添加新的任务
func addNewChan(filePath string) {
	if strings.HasSuffix(filePath, ".log") {
		fmt.Println("文件名的后缀是 .log")

		_, ok := fileWorkers[filePath]
		if ok {
			// 已经存在
		} else {
			// 文件创建，启动goroutine处理文件
			stopCh := make(chan struct{})
			fileWorkers[filePath] = stopCh
			go processFile(filePath, stopCh)
		}
	} else {
		fmt.Println("文件名的后缀不是 .log")
	}
}


// 处理文件
func processFile(filePath string, stopCh <-chan struct{}) {
	// 在这里编写处理文件的逻辑
	log.Println("处理文件:", filePath)

	// 模拟文件处理过程
	for {
		select {
			case <-stopCh:
				log.Println("停止处理文件:", filePath)
				return
			default:
				// 处理文件的具体操作
				// 不停的处理，记录每一次的内容？
				// log.Println("停止处理文件:", filePath)	
				readFileByBuffer(filePath);
		}
	}
}

// 通过缓存阅读文件
func readFileByBuffer(filePath string) {
	file, err := os.Open(filePath)
	if err != nil {
		log.Println(err)
	}
	defer file.Close()

	// 缓存中加载当前行的偏移量
	offset := fileOffsets[filePath] 

	// 直接从 offset 开始读取
	_, err = file.Seek(offset, os.SEEK_CUR)
	if err != nil {
		log.Println("Seek error", err)
	}

	// 通过逐行读取
	lineReader := bufio.NewReader(file)
	for {
		lineBytes, _, lineErr := lineReader.ReadLine()
		if(lineErr != nil) {
			// log.Println("line err", lineErr)	
		}

		line := string(lineBytes)

		// 获取当前行的偏移量
		byteLen := len([]byte(line))
		
		// 处理每一行日志数据, 比如解析发送到 kafka
		if(byteLen > 0) {
			len64 := int64(byteLen)
			offset += len64

			// 处理逻辑，比如发送到 kafka	
			log.Println("当前行内容为", line)

			// 更新偏移量
			fileOffsets[filePath] = offset
		}

		// 这里会存在一个问题，可能会导致内容输出重复？
		//try sleep?
		// time.Sleep(time.Millisecond) // 设置沉睡1毫秒
	}
}


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

			// 添加文件的监听处理
			addNewChan(filePath);
		}
	}

	return nil
}

func getTimeMs() int64 {
	return  time.Now().UnixNano() / int64(time.Millisecond);
}
```

# 后期的 ROAD-MAP

- 信息如何发送到 kafka

- stack 多行信息，如何处理？

- 配置文件的读取加载，动态变化？

- 项目的模块化拆分



* any list
{:toc}