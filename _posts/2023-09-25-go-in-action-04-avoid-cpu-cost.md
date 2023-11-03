---
layout: post
title: go 实现日志采集-04-如何降低 cpu 的消耗 + 模块化 + 抽象接口
date: 2023-09-25 21:01:55 +0800
categories: [Go]
tags: [monitor, go, log-collect, sh]
published: true
---


* any list
{:toc}

# cpu 空转

## 说明

我们原来的文件监听处理，是一个循环。

如果文件 EOF 了，还在空转就比较消耗 CPU。

## 解决方式

我们再遇到 EOF 的时候，添加一个 sleep

```go
	// 通过逐行读取
	lineReader := bufio.NewReader(file)
	for {
		lineBytes, _, lineErr := lineReader.ReadLine()
		if lineErr != nil {
			if lineErr == io.EOF {
				time.Sleep(5 * time.Second) // 沉睡 5 秒钟，可以根据需要调整时间
				continue
			} else {
				log.Println("Read file meet ex", filePath, lineErr)
			}
		}

		line := string(lineBytes)

		// 获取当前行的偏移量
		byteLen := len([]byte(line))

		// 处理每一行日志数据, 比如解析发送到 kafka
		if byteLen > 0 {
			len64 := int64(byteLen)
			offset += len64

			// 处理逻辑，比如发送到 kafka
			log.Println("当前行内容为", line)

			// 更新偏移量
			fileOffsets[filePath] = offset
		}
	}
```

# 模块化拆分

把项目模块化拆分为几个 module，而不是都放在一个 main.go 中。

# chat

## Q1: go 中 log.Println 方法如何使用占位符?


在 Go 中， `log.Println`  方法支持使用占位符来格式化输出。你可以使用  `%v`  占位符来打印变量的值。以下是一个示例代码：

```go
package main

import (
	"log"
)

func main() {
	name := "Alice"
	age := 30

	log.Println("Name:", name, "Age:", age)
	log.Printf("Name: %v, Age: %v\n", name, age)
}
```

在上面的代码中，我们使用了  `log.Println`  和  `log.Printf`  方法来打印日志信息。 

`log.Println`  方法会自动在每个参数之间添加空格，并在最后添加换行符。 

`log.Printf`  方法使用格式化字符串，其中的  `%v`  占位符会被对应的参数值替换。

运行上述代码，输出结果如下：

```
2021/09/01 11:30:45 Name: Alice Age: 30
2021/09/01 11:30:45 Name: Alice, Age: 30
```

你可以根据需要选择使用  `log.Println`  或  `log.Printf`  方法，并使用相应的占位符来格式化输出。

## Q2-go 如何实现模块化的分工

在 Go 中，可以通过使用包（package）和模块（module）来实现模块化的分工。

下面是一些常见的实践方法：

1. 使用包（package）：将相关的功能组织到不同的包中。每个包可以包含多个文件，用于实现特定的功能。通过将代码逻辑分布在不同的包中，可以实现模块化的分工和代码复用。

2. 定义接口（interface）：使用接口来定义模块之间的约定和规范。通过定义接口，可以明确各个模块之间的功能和交互方式，从而实现分工和协作。

3. 使用模块（module）：在 Go 中，可以使用 Go Modules 来管理依赖关系和版本控制。将不同的模块拆分成独立的项目，每个模块负责实现特定的功能。通过模块化的方式，可以更好地管理和组织代码，同时也方便团队合作和维护。

4. 使用测试（testing）：编写单元测试和集成测试来验证每个模块的功能。通过测试，可以确保每个模块的正确性和稳定性，从而提高整体代码质量。

5. 使用文档（documentation）：为每个模块编写文档，包括功能说明、使用方法、接口定义等。良好的文档可以帮助其他开发人员理解和使用模块，提高团队的协作效率。

通过上述方法，可以实现模块化的分工，让不同的开发人员专注于特定的模块，并通过接口定义和测试保证模块之间的正确性和稳定性。这样可以提高代码的可维护性、可扩展性和重用性。

## Q3-给出一个完整的例子？

当然！下面是一个使用模块化分工的完整示例：

假设我们正在开发一个简单的博客应用程序，我们可以将其分为以下几个模块：

1.  `main`  模块：负责启动应用程序和处理路由等基本功能。
2.  `user`  模块：负责处理用户相关的功能，如用户注册、登录和个人资料管理。
3.  `post`  模块：负责处理博文相关的功能，如创建、编辑和删除博文。
4.  `comment`  模块：负责处理评论相关的功能，如发表评论和回复评论。

下面是一个简化的示例代码：

```go
// main.go
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/yourusername/blog/user"
	"github.com/yourusername/blog/post"
	"github.com/yourusername/blog/comment"
)

func main() {
	http.HandleFunc("/", homeHandler)

	// 用户相关路由
	http.HandleFunc("/register", user.RegisterHandler)
	http.HandleFunc("/login", user.LoginHandler)
	http.HandleFunc("/profile", user.ProfileHandler)

	// 博文相关路由
	http.HandleFunc("/create-post", post.CreatePostHandler)
	http.HandleFunc("/edit-post", post.EditPostHandler)
	http.HandleFunc("/delete-post", post.DeletePostHandler)

	// 评论相关路由
	http.HandleFunc("/add-comment", comment.AddCommentHandler)
	http.HandleFunc("/reply-comment", comment.ReplyCommentHandler)

	log.Fatal(http.ListenAndServe(":8080", nil))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Welcome to the Blog!")
}
```

- user/user.go

```go
// user/user.go
package user

import (
	"fmt"
	"net/http"
)

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	// 处理用户注册逻辑
	fmt.Fprintf(w, "User registration")
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	// 处理用户登录逻辑
	fmt.Fprintf(w, "User login")
}

func ProfileHandler(w http.ResponseWriter, r *http.Request) {
	// 处理用户个人资料逻辑
	fmt.Fprintf(w, "User profile")
}
```

- post/post.go

```go
// post/post.go
package post

import (
	"fmt"
	"net/http"
)

func CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	// 处理创建博文逻辑
	fmt.Fprintf(w, "Create a new post")
}

func EditPostHandler(w http.ResponseWriter, r *http.Request) {
	// 处理编辑博文逻辑
	fmt.Fprintf(w, "Edit a post")
}

func DeletePostHandler(w http.ResponseWriter, r *http.Request) {
	// 处理删除博文逻辑
	fmt.Fprintf(w, "Delete a post")
}
```


- comment/comment.go

```go
// comment/comment.go
package comment

import (
	"fmt"
	"net/http"
)

func AddCommentHandler(w http.ResponseWriter, r *http.Request) {
	// 处理添加评论逻辑
	fmt.Fprintf(w, "Add a comment")
}

func ReplyCommentHandler(w http.ResponseWriter, r *http.Request) {
	// 处理回复评论逻辑
	fmt.Fprintf(w, "Reply to a comment")
}
```

在上述示例中，我们将不同的功能模块分别放置在对应的包中。 

`main`  模块负责启动应用程序并处理基本的路由。 

`user` 、 `post`  和  `comment`  模块分别处理用户、博文和评论相关的功能。

通过这种模块化的分工方式，不同的开发人员可以专注于各自负责的模块。

每个模块都有独立的功能和路由处理函数，使得代码更具可读性、可维护性和可扩展性。

请注意，上述示例是一个简化的示例，实际的应用程序可能会更加复杂。

但是，这个例子可以帮助你理解如何使用模块化的方式来分工开发。

## Q4-导入的时候 github.com/yourusername/blog/user，那我要如何指定 go mod init ？

在使用  `go mod init`  初始化 Go Modules 时，你可以指定你的模块的名称。

以下是一个示例命令：

```
go mod init github.com/yourusername/blog
```

在上述示例中， `github.com/yourusername/blog`  是你的模块的名称，你可以根据你的实际情况进行修改。这个命令会在当前目录下生成一个  `go.mod`  文件，用于管理你的模块及其依赖项。

请确保在执行  `go mod init`  命令之前，你已经创建了适当的目录结构，并且已经在  `github.com/yourusername/blog/user`  目录下。这样， `go mod init`  命令才能正确地初始化你的模块。

注意，你需要将  `yourusername`  替换为你在 GitHub 上的用户名，以确保你的模块名称是唯一的。




# 参考资料

chat
