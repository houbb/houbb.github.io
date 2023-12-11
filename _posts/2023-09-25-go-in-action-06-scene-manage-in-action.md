---
layout: post
title: go in action-06-go 如何场景的 crud，模块化调用。与 neo4j 交互
date: 2023-09-25 21:01:55 +0800
categories: [Go]
tags: [monitor, go, go-lang, in-action, sh]
published: true
---



# 需求

对场景的整体的增删改查。

## 场景的属性

```
sceneCode 编码
sceneName 名称
sceneStatus 状态
conditionJson 配置条件
appName 应用名称
methodName 方法名称
createTime 创建时间
updateTime 更新时间 
```

## 需要提供的接口

```
add
remove
edit
```

post 请求。

每一个接口，都强制要求有一个 requestId 请求标识，checksum 验签信息。（最后添加）

## 实现流程

我们逐步来看：

1）实现 scene 模块，提供空实现

2）添加对于 neo4j 操作的具体实现

3）添加对应的验签等信息

4）测试验证


# 1. scene 模块 service 

> [Go Lang-03-Tutorial Create a Go module 创建并调用一个模块](https://houbb.github.io/2018/09/07/lang-go-03-tour-make-module)

## 目录创建

```
λ pwd
D:\_go\scene-server

λ ls
service/
```

## add method

```go
import (
	"encoding/json"
	"fmt"
)

// RequestInfo 结构体定义
type AddRequestInfo struct {
	RequestID      string `json:"requestId"`
	Checksum       string `json:"checksum"`
	AppName        string `json:"appName"`
	MethodName     string `json:"methodName"`
	SceneCode      string `json:"sceneCode"`
	SceneName      string `json:"sceneName"`
	SceneStatus    string `json:"sceneStatus"`
	ConditionJSON  string `json:"conditionJson"`
}

// HTTPService 结构体定义
type HTTPService struct {
}

// add 方法，接受一个 RequestInfo 对象，并输出 JSON 格式的字符串
func (s *HTTPService) add(requestInfo AddRequestInfo) {
	// 转换为 JSON 格式
	jsonData, err := json.Marshal(requestInfo)
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return
	}

	// 输出 JSON 字符串
	fmt.Println(string(jsonData))
}
```

## remove method

```go
import (
	"encoding/json"
	"fmt"
)

// RequestInfo 结构体定义
type RemoveRequestInfo struct {
	RequestID      string `json:"requestId"`
	Checksum       string `json:"checksum"`
	SceneCode      string `json:"sceneCode"`
}

// remove 方法，接受一个 RequestInfo 对象，并输出 JSON 格式的字符串
func (s *HTTPService) remove(requestInfo RemoveRequestInfo) {
	// 转换为 JSON 格式
	jsonData, err := json.Marshal(requestInfo)
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return
	}

	// 输出 JSON 字符串
	fmt.Println(string(jsonData))
}
```

## edit method

sceneCode 唯一，我们约定只有 status+name+json 可以修改

```go
// RequestInfo 结构体定义
type EditRequestInfo struct {
	RequestID      string `json:"requestId"`
	Checksum       string `json:"checksum"`
	SceneCode      string `json:"sceneCode"`
	SceneName      string `json:"sceneName"`
	SceneStatus    string `json:"sceneStatus"`
	ConditionJSON  string `json:"conditionJson"`
}

// edit 方法，接受一个 RequestInfo 对象，并输出 JSON 格式的字符串
func (s *HTTPService) edit(requestInfo EditRequestInfo) {
	// 转换为 JSON 格式
	jsonData, err := json.Marshal(requestInfo)
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return
	}

	// 输出 JSON 字符串
	fmt.Println(string(jsonData))
}
```

# 2. service 完整的代码测试

## 整体的目录结构

```
- service
	- scene.go
- web
	- main.go
```

## scene service 层

### 代码

- scene.go

```go
package scene

import (
	"encoding/json"
	"fmt"
)

// HTTPService 结构体定义
type SceneService struct {
}

// RequestInfo 结构体定义
type AddRequestInfo struct {
	RequestID     string `json:"requestId"`
	Checksum      string `json:"checksum"`
	AppName       string `json:"appName"`
	MethodName    string `json:"methodName"`
	SceneCode     string `json:"sceneCode"`
	SceneName     string `json:"sceneName"`
	SceneStatus   string `json:"sceneStatus"`
	ConditionJSON string `json:"conditionJson"`
}

// add 方法，接受一个 RequestInfo 对象，并输出 JSON 格式的字符串
func (s *SceneService) Add(requestInfo AddRequestInfo) {
	// 转换为 JSON 格式
	jsonData, err := json.Marshal(requestInfo)
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return
	}

	// 输出 JSON 字符串
	fmt.Println(string(jsonData))
}

// RequestInfo 结构体定义
type RemoveRequestInfo struct {
	RequestID string `json:"requestId"`
	Checksum  string `json:"checksum"`
	SceneCode string `json:"sceneCode"`
}

// remove 方法，接受一个 RequestInfo 对象，并输出 JSON 格式的字符串
func (s *SceneService) Remove(requestInfo RemoveRequestInfo) {
	// 转换为 JSON 格式
	jsonData, err := json.Marshal(requestInfo)
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return
	}

	// 输出 JSON 字符串
	fmt.Println(string(jsonData))
}

// RequestInfo 结构体定义
type EditRequestInfo struct {
	RequestID     string `json:"requestId"`
	Checksum      string `json:"checksum"`
	SceneCode     string `json:"sceneCode"`
	SceneName     string `json:"sceneName"`
	SceneStatus   string `json:"sceneStatus"`
	ConditionJSON string `json:"conditionJson"`
}

// edit 方法，接受一个 RequestInfo 对象，并输出 JSON 格式的字符串
func (s *SceneService) Edit(requestInfo EditRequestInfo) {
	// 转换为 JSON 格式
	jsonData, err := json.Marshal(requestInfo)
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return
	}

	// 输出 JSON 字符串
	fmt.Println(string(jsonData))
}
```

简单的 crud 代码。

### go mod init 命令初始化

我们到 servie 目录下：

```
cd D:\_go\scene-server\service
```

初始化：

```
go mod init example.com/scene

go mod tidy
```

## web 测试

### 代码

- main.go

```go
package main

import (
	"example.com/scene"
)

func main() {
	// 创建 HTTPService 实例
	service := &scene.SceneService{}

	// 创建一个 RequestInfo 对象
	addRequestInfo := scene.AddRequestInfo{
		RequestID:     "123",
		Checksum:      "abcdef",
		AppName:       "MyApp",
		MethodName:    "add",
		SceneCode:     "001",
		SceneName:     "Scene1",
		SceneStatus:   "active",
		ConditionJSON: `{"key": "value"}`,
	}
	// 调用 add 方法，输出 JSON 字符串
	service.Add(addRequestInfo)

	// remove
	removeRequestInfo := scene.RemoveRequestInfo{
		RequestID: "123",
		Checksum:  "abcdef",
		SceneCode: "001",
	}
	service.Remove(removeRequestInfo)

	// 编辑
	editRequestInfo := scene.EditRequestInfo{
		RequestID:     "123",
		Checksum:      "abcdef",
		SceneCode:     "001",
		SceneName:     "Scene1-edit",
		SceneStatus:   "active",
		ConditionJSON: `{"key": "value-edit"}`,
	}
	service.Edit(editRequestInfo)
}
```

### go mod init 命令初始化

我们到 web 目录下：

```
cd D:\_go\scene-server\web
```

初始化：

```
go mod init example.com/main
```

把依赖的 scene 改为相对路径

```
go mod edit -replace example.com/scene=../service
go mod tidy
```

PS：这里我在想是不是引入的时候，直接使用 `../service` 也可以。

### 运行

```
go run .
```

效果：

```
{"requestId":"123","checksum":"abcdef","appName":"MyApp","methodName":"add","sceneCode":"001","sceneName":"Scene1","sceneStatus":"active","conditionJson":"{\"key\": \"value\"}"}
{"requestId":"123","checksum":"abcdef","sceneCode":"001"}
{"requestId":"123","checksum":"abcdef","sceneCode":"001","sceneName":"Scene1-edit","sceneStatus":"active","conditionJson":"{\"key\": \"value-edit\"}"}
```

# 3. main 测试改成 http-server

## 说明

上面单元测试，已经验证功能不存在问题。

现在我们将其改为 http 服务

## 代码调整

我们主要修改一下 main.go

```go
package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"example.com/scene"
)

func addHandler(w http.ResponseWriter, r *http.Request) {
	// 创建 HTTPService 实例
	service := &scene.SceneService{}

	// 创建一个 RequestInfo 对象
	addRequestInfo := scene.AddRequestInfo{
		RequestID:     "123",
		Checksum:      "abcdef",
		AppName:       "MyApp",
		MethodName:    "add",
		SceneCode:     "001",
		SceneName:     "Scene1",
		SceneStatus:   "active",
		ConditionJSON: `{"key": "value"}`,
	}
	// 调用 add 方法，输出 JSON 字符串
	service.Add(addRequestInfo)

	// 写回请求体
	// 解析 JSON 请求体
	var requestData scene.AddRequestInfo
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Error decoding JSON request body", http.StatusBadRequest)
		return
	}
	fmt.Fprintf(w, "req, %s", requestData)
}

func removeHandler(w http.ResponseWriter, r *http.Request) {
	// 创建 HTTPService 实例
	service := &scene.SceneService{}

	// remove
	removeRequestInfo := scene.RemoveRequestInfo{
		RequestID: "123",
		Checksum:  "abcdef",
		SceneCode: "001",
	}
	service.Remove(removeRequestInfo)

	// 写回请求体
	// 解析 JSON 请求体
	var requestData scene.RemoveRequestInfo
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Error decoding JSON request body", http.StatusBadRequest)
		return
	}
	fmt.Fprintf(w, "req, %s", requestData)
}

func editHandler(w http.ResponseWriter, r *http.Request) {
	// 创建 HTTPService 实例
	service := &scene.SceneService{}

	// 编辑
	editRequestInfo := scene.EditRequestInfo{
		RequestID:     "123",
		Checksum:      "abcdef",
		SceneCode:     "001",
		SceneName:     "Scene1-edit",
		SceneStatus:   "active",
		ConditionJSON: `{"key": "value-edit"}`,
	}
	service.Edit(editRequestInfo)

	// 写回请求体
	var requestData scene.EditRequestInfo
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Error decoding JSON request body", http.StatusBadRequest)
		return
	}
	fmt.Fprintf(w, "req, %s", requestData)
}

func main() {
	// 注册处理函数
	http.HandleFunc("/add", addHandler)
	http.HandleFunc("/remove", removeHandler)
	http.HandleFunc("/edit", editHandler)

	// 启动 HTTP 服务器并监听端口
	port := 8080
	fmt.Printf("Server is listening on :%d...\n", port)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	if err != nil {
		fmt.Println("Error:", err)
	}
}
```


## 测试方法


### add

localhost:8080/add

```json
{
    "requestId": "add-id"
}
```

### remove

localhost:8080/remove

```json
{
    "requestId": "remove-id"
}
```

### edit

localhost:8080/edit

```json
{
    "requestId": "edit-id"
}
```

# 4. 修改 service 为具体的 neo4j 实现

## 说明

我们把 service 方法改为具体的 neo4j 实现。

# 5. http 测试验证

# chat

## Q: add service

go 实现一个 add 方法，入参是一个对象，每个属性都是 srting 类型。

requestId 
checksum
appName
methodName
sceneCode
sceneName
sceneStatus
conditionJson

方法中，用 json 输出打印这个对象

#### chat 的回答

你可以定义一个结构体，表示这个对象，然后创建一个方法，将该结构体实例转换为 JSON 格式并打印。

以下是一个简单的例子：

```go
package main

import (
	"encoding/json"
	"fmt"
)

// RequestInfo 结构体定义
type RequestInfo struct {
	RequestID      string `json:"requestId"`
	Checksum       string `json:"checksum"`
	AppName        string `json:"appName"`
	MethodName     string `json:"methodName"`
	SceneCode      string `json:"sceneCode"`
	SceneName      string `json:"sceneName"`
	SceneStatus    string `json:"sceneStatus"`
	ConditionJSON  string `json:"conditionJson"`
}

// RequestInfo 结构体定义
type RemoveRequestInfo struct {
	RequestID      string `json:"requestId"`
	SceneCode      string `json:"sceneCode"`
}

// HTTPService 结构体定义
type HTTPService struct {
}

// add 方法，接受一个 RequestInfo 对象，并输出 JSON 格式的字符串
func (s *HTTPService) add(requestInfo RequestInfo) {
	// 转换为 JSON 格式
	jsonData, err := json.Marshal(requestInfo)
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return
	}

	// 输出 JSON 字符串
	fmt.Println(string(jsonData))
}

// remove 方法，接受一个 RequestInfo 对象，并输出 JSON 格式的字符串
func (s *HTTPService) remove(requestInfo RequestInfo) {
	// 转换为 JSON 格式
	jsonData, err := json.Marshal(requestInfo)
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return
	}

	// 输出 JSON 字符串
	fmt.Println(string(jsonData))
}


func main() {
	// 创建 HTTPService 实例
	service := &HTTPService{}

	// 创建一个 RequestInfo 对象
	requestInfo := RequestInfo{
		RequestID:     "123",
		Checksum:      "abcdef",
		AppName:       "MyApp",
		MethodName:    "add",
		SceneCode:     "001",
		SceneName:     "Scene1",
		SceneStatus:   "active",
		ConditionJSON: `{"key": "value"}`,
	}

	// 调用 add 方法，输出 JSON 字符串
	service.add(requestInfo)
}
```

在这个例子中：

- 定义了一个名为 `RequestInfo` 的结构体，用于表示你所描述的对象。
- 创建了 `HTTPService` 结构体，其中包含了一个名为 `add` 的方法，该方法接受一个 `RequestInfo` 对象，使用 `json.Marshal` 将其转换为 JSON 格式的字符串，并通过 `fmt.Println` 输出到控制台。
- 在 `main` 函数中，创建了一个 `RequestInfo` 对象，并通过调用 `add` 方法输出了相应的 JSON 字符串。

你可以根据需要修改结构体字段的类型、方法的实现逻辑等。这个例子提供了一个基本的框架，你可以在其基础上构建更复杂的功能。

## Q: remove

继续在上面的 go 实现中添加一个新的 remove 方法。


入参是一个对象，每个属性都是 srting 类型。

requestId 
sceneCode

方法中，用 json 输出打印这个对象

### chat

你可以在 `HTTPService` 结构体中添加一个新的方法 `remove`，类似于 `add` 方法，接受一个包含 `RequestID` 和 `SceneCode` 的对象，然后输出 JSON 格式的字符串。

以下是修改后的代码：

```go
package main

import (
	"encoding/json"
	"fmt"
)

// RequestInfo 结构体定义
type RequestInfo struct {
	RequestID      string `json:"requestId"`
	Checksum       string `json:"checksum"`
	AppName        string `json:"appName"`
	MethodName     string `json:"methodName"`
	SceneCode      string `json:"sceneCode"`
	SceneName      string `json:"sceneName"`
	SceneStatus    string `json:"sceneStatus"`
	ConditionJSON  string `json:"conditionJson"`
}

// HTTPService 结构体定义
type HTTPService struct {
}

// add 方法，接受一个 RequestInfo 对象，并输出 JSON 格式的字符串
func (s *HTTPService) add(requestInfo RequestInfo) {
	// 转换为 JSON 格式
	jsonData, err := json.Marshal(requestInfo)
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return
	}

	// 输出 JSON 字符串
	fmt.Println(string(jsonData))
}

// remove 方法，接受一个 RequestInfo 对象，并输出 JSON 格式的字符串
func (s *HTTPService) remove(requestInfo RequestInfo) {
	// 转换为 JSON 格式
	jsonData, err := json.Marshal(requestInfo)
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return
	}

	// 输出 JSON 字符串
	fmt.Println(string(jsonData))
}

func main() {
	// 创建 HTTPService 实例
	service := &HTTPService{}

	// 创建一个 RequestInfo 对象用于 add 方法
	addRequestInfo := RequestInfo{
		RequestID:     "123",
		Checksum:      "abcdef",
		AppName:       "MyApp",
		MethodName:    "add",
		SceneCode:     "001",
		SceneName:     "Scene1",
		SceneStatus:   "active",
		ConditionJSON: `{"key": "value"}`,
	}

	// 调用 add 方法，输出 JSON 字符串
	service.add(addRequestInfo)

	// 创建一个 RequestInfo 对象用于 remove 方法
	removeRequestInfo := RequestInfo{
		RequestID: "456",
		SceneCode: "002",
	}

	// 调用 remove 方法，输出 JSON 字符串
	service.remove(removeRequestInfo)
}
```

在这个例子中：

- 添加了 `remove` 方法，接受一个包含 `RequestID` 和 `SceneCode` 的 `RequestInfo` 对象，并输出相应的 JSON 字符串。
- 在 `main` 函数中，创建了一个用于 `add` 方法的 `RequestInfo` 对象和一个用于 `remove` 方法的 `RequestInfo` 对象，并分别调用了对应的方法。

这样你就可以根据需要调用 `add` 和 `remove` 方法，并得到相应的 JSON 输出。

## Q: go net/http 包，w http.ResponseWriter, r *http.Request 如何获取到 request 的请求体 json?

在 Go 的 `net/http` 包中，你可以使用 `r.Body` 来获取 HTTP 请求的请求体。

如果请求体是 JSON 格式的，你可以使用 `encoding/json` 包来解码 JSON 数据。

以下是一个简单的例子：

```go
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// RequestData 结构体定义，用于解析 JSON 请求体
type RequestData struct {
	Field1 string `json:"field1"`
	Field2 int    `json:"field2"`
}

func handleJSONRequest(w http.ResponseWriter, r *http.Request) {
	// 解析 JSON 请求体
	var requestData RequestData
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Error decoding JSON request body", http.StatusBadRequest)
		return
	}

	// 打印解析后的数据
	fmt.Printf("Field1: %s\n", requestData.Field1)
	fmt.Printf("Field2: %d\n", requestData.Field2)

	// 可以根据 requestData 中的数据执行相应的逻辑

	// 返回响应
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "JSON request processed successfully")
}

func main() {
	// 注册处理函数
	http.HandleFunc("/json-endpoint", handleJSONRequest)

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

- 创建了一个名为 `RequestData` 的结构体，用于解析 JSON 请求体。
- 创建了一个处理函数 `handleJSONRequest`，它通过 `json.NewDecoder` 解码 JSON 请求体，并将解析后的数据存储在 `RequestData` 类型的变量中。
- 可以在处理函数中根据解析后的数据执行相应的逻辑。
- 在 `main` 函数中注册了处理函数，并启动了一个简单的 HTTP 服务器。

请注意，如果请求体较大，你可能需要考虑对请求体进行限制，以防止潜在的攻击或滥用。

在实际生产环境中，还需要更加健壮的错误处理和安全性考虑。

## Q: json.Marshal(requestData) 报错  multiple-value json.Marshal(requestData) (value of type ([]byte, error)) in single-value context

在 Go 中，`json.Marshal` 函数返回两个值，一个是字节数组（`[]byte`），另一个是可能的错误（`error`）。这两个值的组合形成了一个多返回值。如果你在使用 `json.Marshal` 时只写了一个变量，而没有处理错误，就会导致编译器报错。

正确的使用方式是检查错误，例如：

```go
jsonData, err := json.Marshal(requestData)
if err != nil {
    // 处理错误
    fmt.Println("Error encoding JSON:", err)
    return
}
```

这样，如果在 JSON 编码的过程中发生了错误，你就能得到错误信息，并且可以根据需要进行处理。

上述代码中，`jsonData` 是编码后的 JSON 数据，而 `err` 是可能的错误信息。确保检查和处理错误是 Go 代码的良好实践。



# 参考资料

chat

* any list
{:toc}