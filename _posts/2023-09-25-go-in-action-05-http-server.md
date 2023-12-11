---
layout: post
title: go in action-05- go 如何实现 http server?
date: 2023-09-25 21:01:55 +0800
categories: [Go]
tags: [monitor, go, go-lang, in-action, sh]
published: true
---



# 01-基本例子

## 需求

最简单的 go http 例子

## 编码

- main.go

```go
package main

import (
	"fmt"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, %s!", r.URL.Path[1:])
}

func main() {
	// 注册处理函数
	http.HandleFunc("/", handler)

	// 启动 HTTP 服务器并监听端口
	port := 8080
	fmt.Printf("Server is listening on :%d...\n", port)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	if err != nil {
		fmt.Println("Error:", err)
	}
}
```

## 编译

初始化 mod

```
go mod init example.com/m
go mod tidy
```

运行

```
> go run main.go
Server is listening on :8080...
```

## 访问

浏览器访问 [http://localhost:8080/gogogo](http://localhost:8080/gogogo)

返回：

```
Hello, gogogo!
```

# 02-入参添加

## 说明

添加 get 入参信息，有两个字符串 属性 requestId 和 requestDate。

修改一下代码。


## 实现

主要是 handler 修改一下

```go
package main

import (
	"fmt"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	requestID := r.URL.Query().Get("requestId")
	requestDate := r.URL.Query().Get("requestDate")

	// Respond with the parameters
	fmt.Fprintf(w, "Request ID: %s\nRequest Date: %s", requestID, requestDate)
}

func main() {
	// 注册处理函数
	http.HandleFunc("/", handler)

	// 启动 HTTP 服务器并监听端口
	port := 8080
	fmt.Printf("Server is listening on :%d...\n", port)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	if err != nil {
		fmt.Println("Error:", err)
	}
}
```

## 测试

访问 [http://localhost:8080/?requestId=123&requestDate=20231206](http://localhost:8080/?requestId=123&requestDate=20231206)

页面返回：

```
Request ID: 123
Request Date: 20231206
```


# 03-添加返回的对象

## 需求

现在要求请求返回一个 user 的列表。

user 有两个属性：

id  string
name  string

重新给出代码。

## 实现

```go
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type User struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}



func handler(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	requestID := r.URL.Query().Get("requestId")
	requestDate := r.URL.Query().Get("requestDate")
	fmt.Fprintf(w, "Request ID: %s\nRequest Date: %s", requestID, requestDate)

	// Create a list of users (for demonstration purposes)
	users := []User{
		{ID: "1", Name: "John"},
		{ID: "2", Name: "Jane"},
		// Add more users as needed
	}

	// Convert the list of users to JSON
	responseJSON, err := json.Marshal(users)
	if err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		return
	}

	// Set the Content-Type header to indicate JSON response
	w.Header().Set("Content-Type", "application/json")

	// Respond with the JSON-encoded list of users
	w.Write(responseJSON)
}

func main() {
	// Register the handler function
	http.HandleFunc("/", handler)

	// Start the HTTP server and listen on port 8080
	port := 8080
	fmt.Printf("Server is listening on :%d...\n", port)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	if err != nil {
		fmt.Println("Error:", err)
	}
}
```

## 编译

初始化 mod

```
go mod init example.com/m
go mod tidy
```

运行

```
> go run main.go
Server is listening on :8080...
```

请求结果：

```
Request ID: 123
Request Date: 20231206[{"id":"1","name":"John"},{"id":"2","name":"Jane"}]
```

# 04-加签

## 说明

接口调用，需要add一个简单那的校验，保障安全。

约定字段：

requestId
requestTime
checksum

## 加签算法

checksum = md5(requestId+token);

token 是一个双方约定的字符串秘钥。



## 实现

```go
package main

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
)

type User struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func calculateMD5(input string) string {
	// 创建 MD5 散列算法的实例
	hasher := md5.New()

	// 将字符串转换为字节数组并写入 hasher
	hasher.Write([]byte(input))

	// 计算 MD5 散列值
	hash := hasher.Sum(nil)

	// 将字节数组转换为十六进制字符串
	md5String := hex.EncodeToString(hash)

	return md5String
}

// 写一个方法参数有三个：requestId, requestTime, checksum 要求不可为空。
func validateRequest(requestID, requestTime, checksum string) bool {
	fmt.Printf("requestID: %s, requestTime: %s, checksum: %s \n", requestID, requestTime, checksum)

	// 检查参数是否为空
	if requestID == "" || requestTime == "" || checksum == "" {
		return false
	}

	// md5 签名校验
	token := "123456"

	expectChecksum := calculateMD5(requestID + token)
	if expectChecksum != checksum {
		fmt.Println("签名校验失败，expect=" + expectChecksum)
		return false
	}

	return true
}

func handler(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	requestID := r.URL.Query().Get("requestId")
	requestTime := r.URL.Query().Get("requestTime")
	checksum := r.URL.Query().Get("checksum")

	//参数校验
	valid := validateRequest(requestID, requestTime, checksum)
	if !valid {
		// 参数校验
		http.Error(w, "paramCheckFailed", http.StatusBadRequest)
		return
	}

	// fmt.Fprintf(w, "Request ID: %s\nRequest Date: %s", requestID, requestDate)

	// Create a list of users (for demonstration purposes)
	users := []User{
		{ID: "1", Name: "John"},
		{ID: "2", Name: "Jane"},
		// Add more users as needed
	}

	// Convert the list of users to JSON
	responseJSON, err := json.Marshal(users)
	if err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		return
	}

	// Set the Content-Type header to indicate JSON response
	w.Header().Set("Content-Type", "application/json")

	// Respond with the JSON-encoded list of users
	w.Write(responseJSON)
}

func main() {
	// Register the handler function
	http.HandleFunc("/", handler)

	// Start the HTTP server and listen on port 8080
	port := 8080
	fmt.Printf("Server is listening on :%d...\n", port)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	if err != nil {
		fmt.Println("Error:", err)
	}
}
```


## 测试

访问 http://localhost:8080/?requestId=123&requestTime=20231206&checksum=567


返回：

```
paramCheckFailed
```

我们把签名修正一下  http://localhost:8080/?requestId=123&requestTime=20231206&checksum=1e191d851b3b49a248f4ea62f6b06410

正常返回：

```json
[{"id":"1","name":"John"},{"id":"2","name":"Jane"}]
```

# 拓展阅读

> [go 访问 neo4j](https://houbb.github.io/2018/01/08/neo4j-11-go-access)

# chat

## Q: fmt 输出一行内容到控台 go 怎么实现？

在 Go 中，可以使用 `fmt` 包中的 `Print`、`Printf`、`Println` 函数来输出内容到控制台。以下是一些简单的例子：

1. **Print 函数：** 输出不带换行符的内容。

```go
package main

import "fmt"

func main() {
    fmt.Print("Hello, World!")
}
```

2. **Printf 函数：** 使用格式化字符串输出内容。

```go
package main

import "fmt"

func main() {
    name := "Alice"
    age := 30
    fmt.Printf("Name: %s, Age: %d\n", name, age)
}
```

3. **Println 函数：** 输出带换行符的内容。

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

在这些例子中，使用 `fmt` 包中的不同函数可以实现向控制台输出不同格式的内容。你可以根据需要选择适当的函数。

## Q: 写一个方法参数有三个：requestId, requestTime, checksum 要求不可为空。

你可以创建一个函数来验证这三个参数是否都不为空，并返回一个布尔值表示验证结果。以下是一个示例：

```go
package main

import (
	"fmt"
)

func validateRequest(requestID, requestTime, checksum string) bool {
	// 检查参数是否为空
	if requestID == "" || requestTime == "" || checksum == "" {
		return false
	}
	return true
}

func main() {
	// 示例调用
	valid := validateRequest("123", "2023-01-01", "abcdef123456")
	if valid {
		fmt.Println("Request is valid.")
	} else {
		fmt.Println("Invalid request: One or more parameters are empty.")
	}
}
```

在这个例子中，`validateRequest` 函数接受三个字符串参数：`requestID`、`requestTime`、`checksum`。

它通过检查这三个参数是否为空来进行验证，如果有任何一个为空，则返回 `false` 表示验证失败，否则返回 `true` 表示验证通过。

在 `main` 函数中，进行了一个示例调用并输出相应的信息。

你可以根据实际需要进行修改和集成到你的代码中。

## Q: go 如何实现 http server?

在 Go 中实现一个简单的 HTTP 服务器可以通过标准库的 `net/http` 包来完成。

以下是一个基本的示例代码，演示了如何创建一个 HTTP 服务器并处理请求：

```go
package main

import (
	"fmt"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, %s!", r.URL.Path[1:])
}

func main() {
	// 注册处理函数
	http.HandleFunc("/", handler)

	// 启动 HTTP 服务器并监听端口
	port := 8080
	fmt.Printf("Server is listening on :%d...\n", port)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	if err != nil {
		fmt.Println("Error:", err)
	}
}
```

在这个例子中：

1. `handler` 函数是一个处理 HTTP 请求的处理器函数。它将请求的 URL Path 中的部分作为参数输出到响应中。

2. `http.HandleFunc` 用于注册处理函数，将指定的路径和处理器函数关联起来。

3. `http.ListenAndServe` 用于启动 HTTP 服务器并监听指定的端口。在这个例子中，服务器监听 8080 端口。

4. 如果启动服务器失败，`http.ListenAndServe` 会返回一个错误，我们在代码中捕获并打印出来。

你可以通过运行这个程序，并在浏览器中访问 `http://localhost:8080/yourname` 来测试。替换 `yourname` 部分，服务器将返回相应的欢迎消息。

这只是一个简单的例子，`net/http` 包提供了更多功能，例如路由、中间件、模板等，以满足更复杂的应用程序需求。


## Q: 详细介绍一下依赖的 3 个包

1. **`encoding/json` 包：**

   - **功能：** 该包提供了 JSON 数据的编码和解码功能，允许将 Go 中的数据结构转换为 JSON 格式的字符串（编码），以及将 JSON 字符串解码为 Go 中的数据结构。
   
   - **示例用法：** 上面的代码中使用了 `encoding/json` 包，通过 `json.Marshal` 将用户列表编码为 JSON 格式的字符串，以及通过 `json.Unmarshal` 可以将 JSON 字符串解码为对应的 Go 数据结构。

2. **`net/http` 包：**

   - **功能：** 该包提供了用于构建 HTTP 服务器和客户端的功能。它包含了处理 HTTP 请求和响应的核心类型和函数，允许你创建 Web 服务器、处理路由、设置中间件等。

   - **示例用法：** 上面的代码中使用了 `net/http` 包，通过 `http.HandleFunc` 注册处理函数，并通过 `http.ListenAndServe` 启动一个简单的 HTTP 服务器。

3. **`fmt` 包：**

   - **功能：** `fmt` 包实现了格式化输入输出的函数，提供了类似 C 语言的 `printf` 和 `scanf` 的功能。它用于格式化输出，例如将字符串、数字等格式化为字符串，或者将字符串解析为特定类型的值。

   - **示例用法：** 上面的代码中使用了 `fmt.Printf` 和 `fmt.Println` 打印输出信息到控制台，用于显示服务器监听的端口等信息。

这三个包是 Go 语言标准库中常用的一部分，它们分别处理 JSON 编码和解码、HTTP 服务器和客户端，以及格式化输入输出。

这些功能是构建 Web 服务、处理网络请求以及调试和日志输出等常见任务所必需的。

## 这 3 个包有哪些不足之处？

尽管 `encoding/json`、`net/http` 和 `fmt` 是 Go 语言标准库中非常强大和常用的包，但它们也有一些局限性和不足之处：

1. **`encoding/json` 包的不足：**

   - **不支持循环引用：** `encoding/json` 包不支持编码和解码包含循环引用的数据结构。这可能导致在处理某些复杂的数据结构时出现问题。

   - **字段访问控制有限：** JSON 编码时，`encoding/json` 包默认只处理结构体中导出（大写字母开头）的字段。这意味着非导出字段将被忽略，这在某些情况下可能不符合预期。

2. **`net/http` 包的不足：**

   - **缺少内置的路由器：** `net/http` 包提供了基本的路由功能，但缺乏像一些第三方路由器那样灵活和强大的功能。对于大型 Web 应用程序，可能需要使用第三方的路由器库来满足更复杂的路由需求。

   - **不支持 HTTP/2 服务推送：** `net/http` 包在标准库中并不直接支持 HTTP/2 服务推送，这在一些性能优化场景中可能成为一个限制。

3. **`fmt` 包的不足：**

   - **格式化限制：** `fmt` 包提供了基本的格式化功能，但在一些特定的格式化需求下可能不够灵活。对于更高级的格式化，可能需要使用第三方库或自定义实现。

   - **不支持自定义输出流：** `fmt` 包主要将格式化的结果输出到标准输出流，对于需要将结果输出到自定义的输出流（例如文件、网络连接）的场景，可能需要额外的处理。

尽管这些不足之处存在，Go 的标准库设计的目标是简单、稳定和易于使用。

为了满足更特定或更高级的需求，社区中有很多优秀的第三方库，可以作为补充使用。


## Q: 这3个包，有哪些优秀的第三方库替代，给出一下并提供例子

对于这三个包，Go 社区中有一些优秀的第三方库，它们提供了更灵活、功能更强大或更高级的特性。以下是其中一些：

1. **`encoding/json` 的替代库：**

   - **`jsoniter`：** `jsoniter` 是一个快速的 JSON 编码和解码库，性能较标准库更优。它兼容标准库，可以无缝替代，而且支持更多的特性。GitHub 地址：[json-iterator/go](https://github.com/json-iterator/go)

     ```go
     import "github.com/json-iterator/go"

     // 示例用法
     jsoniter.Marshal(&myStruct)
     jsoniter.Unmarshal(data, &myStruct)
     ```

   - **`easyjson`：** `easyjson` 是一个基于代码生成的 JSON 序列化和反序列化库，它通过生成定制的代码来提高性能。GitHub 地址：[mailru/easyjson](https://github.com/mailru/easyjson)

     ```go
     //go:generate easyjson -all
     import "path/to/generated/file"

     // 示例用法
     data, _ := myStruct.MarshalJSON()
     myStruct.UnmarshalJSON(data)
     ```

2. **`net/http` 的替代库：**

   - **`gin`：** `gin` 是一个轻量级的 HTTP 框架，提供了快速的路由、中间件支持和易用的 API。它在性能上表现优秀，并且灵活易用。GitHub 地址：[gin-gonic/gin](https://github.com/gin-gonic/gin)

     ```go
     import "github.com/gin-gonic/gin"

     // 示例用法
     r := gin.Default()
     r.GET("/", func(c *gin.Context) {
         c.JSON(200, gin.H{"message": "Hello, Gin!"})
     })
     r.Run(":8080")
     ```

   - **`chi`：** `chi` 是一个轻量级、高性能的 HTTP 路由器，提供了灵活的中间件支持和强大的路由功能。GitHub 地址：[go-chi/chi](https://github.com/go-chi/chi)

     ```go
     import "github.com/go-chi/chi"

     // 示例用法
     r := chi.NewRouter()
     r.Get("/", func(w http.ResponseWriter, r *http.Request) {
         w.Write([]byte("Hello, Chi!"))
     })
     http.ListenAndServe(":8080", r)
     ```

3. **`fmt` 的替代库：**

   - **`logrus`：** `logrus` 是一个强大的日志库，提供了结构化日志和钩子支持，使日志记录更加灵活。GitHub 地址：[sirupsen/logrus](https://github.com/sirupsen/logrus)

     ```go
     import "github.com/sirupsen/logrus"

     // 示例用法
     log := logrus.New()
     log.WithFields(logrus.Fields{
         "animal": "walrus",
         "size":   10,
     }).Info("A group of walrus emerges from the ocean")
     ```

   - **`zerolog`：** `zerolog` 是一个零分配、零反射的日志库，具有高性能的特点。它支持结构化日志和 JSON 输出。GitHub 地址：[rs/zerolog](https://github.com/rs/zerolog)

     ```go
     import "github.com/rs/zerolog/log"

     // 示例用法
     log.Info().Str("user", "jane").Msg("User logged in")
     ```

这些库都是在 Go 社区中广受欢迎的，并且有着丰富的功能和活跃的维护者。根据具体的需求和偏好，你可以选择适合自己项目的库。

## Q: go 如何添加多个 http 请求地址？

在 Go 中，你可以使用 `http.ServeMux` 来创建多个 HTTP 请求地址的处理器。

每个请求地址都可以与一个处理函数关联。

以下是一个简单的例子，演示如何使用 `http.ServeMux` 处理多个请求地址：

```go
package main

import (
	"fmt"
	"net/http"
)

func main() {
	// 创建一个 ServeMux
	mux := http.NewServeMux()

	// 注册处理函数
	mux.HandleFunc("/", handleRoot)
	mux.HandleFunc("/hello", handleHello)
	mux.HandleFunc("/goodbye", handleGoodbye)

	// 启动 HTTP 服务器并监听端口
	port := 8080
	fmt.Printf("Server is listening on :%d...\n", port)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), mux)
	if err != nil {
		fmt.Println("Error:", err)
	}
}

func handleRoot(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Welcome to the root page!")
}

func handleHello(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Hello, World!")
}

func handleGoodbye(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Goodbye, World!")
}
```

在这个例子中：

1. 使用 `http.NewServeMux()` 创建一个 `http.ServeMux`。

2. 使用 `mux.HandleFunc` 注册处理函数，将不同的请求地址与不同的处理函数关联起来。

3. 使用 `http.ListenAndServe` 启动一个 HTTP 服务器，并将创建的 `ServeMux` 作为处理器传递给服务器。

现在，你可以通过访问不同的路径，如 `http://localhost:8080/`、`http://localhost:8080/hello`、`http://localhost:8080/goodbye` 来测试不同的处理函数。每个路径都会触发相应的处理函数。


# todo

每天定时拉取。

可以添加两个标识：

addDate: 首次添加日期 yyyyMMdd

envTag: prod/test

# 参考资料

chat

* any list
{:toc}