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

实际验证，项目路径是无法使用的：

```
example.com/main imports
        ../scene: "../scene" is relative, but relative import paths are not supported in module mode
```

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

> [Neo4j-11-neo4j go access go 直接访问 neo4j go neo4j](https://houbb.github.io/2018/01/08/neo4j-11-go-access)

## 代码实现

### scene.go


```go
package scene

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
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

// GetNeo4jSession 函数用于获取 Neo4j 会话
func GetNeo4jSession() (neo4j.Session, error) {
	// Neo4j数据库连接信息
	neo4jURI := "bolt://localhost:7687"
	username := "neo4j"
	password := "12345678"

	// 创建Neo4j数据库驱动
	driver, err := neo4j.NewDriver(neo4jURI, neo4j.BasicAuth(username, password, ""))
	if err != nil {
		fmt.Println("Error creating Neo4j driver:", err)
		return nil, err
	}
	// defer driver.Close()

	// 创建数据库会话
	session, err := driver.Session(neo4j.AccessModeWrite)
	if err != nil {
		fmt.Println("Error creating Neo4j session:", err)
		return nil, err
	}
	// defer session.Close()

	return session, nil
}

// 让数据景区到毫秒
func getUnixTimestamp() int64 {
	// 获取当前时间的纳秒级 Unix 时间戳
	unixTimestampNano := time.Now().UnixNano()

	// 转换为毫秒级 Unix 时间戳
	unixTimestampMillis := unixTimestampNano / int64(time.Millisecond)

	return unixTimestampMillis
}

// add 方法，接受一个 RequestInfo 对象，并输出 JSON 格式的字符串
func (s *SceneService) Add(w http.ResponseWriter, r *http.Request) {
	// 转换为 json
	var requestData AddRequestInfo
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Error decoding JSON request body", http.StatusBadRequest)
		return
	}
	// 改为日志？
	fmt.Printf("req, %s\n", requestData)

	// neo4j 持久化
	// 执行插入节点的 Cypher 查询
	session, err := GetNeo4jSession()
	if err != nil {
		// 日志输出
		http.Error(w, "Error GetNeo4jSession", http.StatusInternalServerError)
		return
	}
	defer session.Close()
	_, runErr := session.Run(
		`CREATE (s:SceneData {appName: $appName, methodName: $methodName, 
			sceneCode: $sceneCode, sceneName: $sceneName, sceneStatus: $sceneStatus, conditionJson: $conditionJson,
			createTime: $createTime, updateTime: $updateTime}) RETURN s`,
		map[string]interface{}{
			"appName":       requestData.AppName,
			"methodName":    requestData.MethodName,
			"sceneCode":     requestData.SceneCode,
			"sceneName":     requestData.SceneName,
			"sceneStatus":   requestData.SceneStatus,
			"conditionJson": requestData.ConditionJSON,
			"createTime":    getUnixTimestamp(),
			"updateTime":    getUnixTimestamp(),
		},
	)

	if runErr != nil {
		// error 后续改为日志
		log.Printf("Error occurred: %v\n", runErr)

		http.Error(w, "Error Add", http.StatusInternalServerError)
		return
	}

	// 成功
	fmt.Fprintln(w, "Request was successful!")
	w.WriteHeader(http.StatusOK)
}

// RequestInfo 结构体定义
type RemoveRequestInfo struct {
	RequestID string `json:"requestId"`
	Checksum  string `json:"checksum"`
	SceneCode string `json:"sceneCode"`
}

// remove 方法，接受一个 RequestInfo 对象，并输出 JSON 格式的字符串
func (s *SceneService) Remove(w http.ResponseWriter, r *http.Request) {
	// 转换为 json
	var requestData RemoveRequestInfo
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Error decoding Remove request body", http.StatusBadRequest)
		return
	}
	// 改为日志？
	fmt.Printf("Remove req, %s\n", requestData)

	// neo4j 持久化
	// 执行插入节点的 Cypher 查询
	session, err := GetNeo4jSession()
	if err != nil {
		// 日志输出
		http.Error(w, "Error GetNeo4jSession", http.StatusInternalServerError)
		return
	}
	defer session.Close()
	// 执行删除逻辑
	_, runErr := session.Run(
		`MATCH (s:SceneData {sceneCode: $sceneCode}) DELETE s`,
		map[string]interface{}{
			"sceneCode": requestData.SceneCode,
		},
	)
	if runErr != nil {
		// error 后续改为日志
		log.Printf("Error occurred: %v\n", runErr)

		http.Error(w, "Error Remove", http.StatusInternalServerError)
		return
	}

	// 返回成功响应
	fmt.Fprintln(w, "SceneData deleted successfully")
	w.WriteHeader(http.StatusOK)
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
func (s *SceneService) Edit(w http.ResponseWriter, r *http.Request) {
	// 转换为 json
	var requestData EditRequestInfo
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Error decoding Edit request body", http.StatusBadRequest)
		return
	}
	// 改为日志？
	fmt.Printf("Edit req, %s\n", requestData)

	// neo4j 持久化
	// 执行插入节点的 Cypher 查询
	session, err := GetNeo4jSession()
	if err != nil {
		// 日志输出
		http.Error(w, "Error GetNeo4jSession", http.StatusInternalServerError)
		return
	}
	defer session.Close()

	// 更新
	// 执行更新节点的 Cypher 查询
	_, runErr := session.Run(
		`MATCH (s:SceneData {sceneCode: $sceneCode}) 
		SET s.sceneName = $sceneName, s.sceneStatus = $sceneStatus, s.conditionJson = $conditionJson, s.updateTime = $ updateTime
		RETURN s`,
		map[string]interface{}{
			"sceneCode":     requestData.SceneCode,
			"sceneName":     requestData.SceneName,
			"sceneStatus":   requestData.SceneStatus,
			"conditionJson": requestData.ConditionJSON,
			"updateTime":    getUnixTimestamp(),
		},
	)
	if runErr != nil {
		// error 后续改为日志
		log.Printf("Error occurred: %v\n", runErr)

		// error 日志
		http.Error(w, "Error Edit", http.StatusInternalServerError)
		return
	}

	// 返回成功响应
	fmt.Fprintln(w, "SceneData edit successfully")
	w.WriteHeader(http.StatusOK)
}
```

### main.go

```go
package main

import (
	"fmt"
	"net/http"

	"example.com/scene"
)

func main() {
	// 新建
	service := &scene.SceneService{}
	// 注册处理函数
	http.HandleFunc("/add", service.Add)
	http.HandleFunc("/remove", service.Remove)
	http.HandleFunc("/edit", service.Edit)

	// 启动 HTTP 服务器并监听端口
	port := 8080
	fmt.Printf("Server is listening on :%d...\n", port)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	if err != nil {
		fmt.Println("Error:", err)
	}
}
```

# 5. http 测试验证

## 初始化唯一约束

```
create constraint on (p:SceneData) assert p.sceneCode is unique;
```

但是会报错:

```
Invalid constraint syntax, ON and ASSERT should not be used. Replace ON with FOR and ASSERT with REQUIRE. (line 1, column 1 (offset: 0))
"create constraint on (p:SceneData) assert p.sceneCode is unique"
```

neo4j 的版本是 5.12，应该改成：

在Neo4j 4.0版本及以上，唯一约束的语法已经发生了变化。

新的语法中，`ON`关键字被替换为`FOR`，`ASSERT`被替换为`REQUIRE`。

因此，创建唯一约束的Cypher语句应该使用新的语法。

以下是使用新语法创建唯一约束的示例：

```cypher
CREATE CONSTRAINT FOR (p:SceneData) REQUIRE p.sceneCode IS UNIQUE;
```

## add

```json
{"requestId":"123","checksum":"abcdef","appName":"MyApp","methodName":"add","sceneCode":"001","sceneName":"Scene1","sceneStatus":"active","conditionJson":"{\"key\": \"value\"}"}
```

## edit

```json
{"requestId":"123","checksum":"abcdef","sceneCode":"001","sceneName":"Scene1-edit","sceneStatus":"N","conditionJson":"{\"key\": \"value-edit\"}"}
```

## remove

```json
{"requestId":"123","checksum":"abcdef","sceneCode":"001"}
```

# 6. 添加统一的参数校验

所有的参数不可为空：


## 源码

```go
package scene

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
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

// GetNeo4jSession 函数用于获取 Neo4j 会话
func GetNeo4jSession() (neo4j.Session, error) {
	// Neo4j数据库连接信息
	neo4jURI := "bolt://localhost:7687"
	username := "neo4j"
	password := "12345678"

	// 创建Neo4j数据库驱动
	driver, err := neo4j.NewDriver(neo4jURI, neo4j.BasicAuth(username, password, ""))
	if err != nil {
		log.Println("Error creating Neo4j driver:", err)
		return nil, err
	}
	// defer driver.Close()

	// 创建数据库会话
	session, err := driver.Session(neo4j.AccessModeWrite)
	if err != nil {
		log.Println("Error creating Neo4j session:", err)
		return nil, err
	}
	// defer session.Close()

	return session, nil
}

// 让数据景区到毫秒
func getUnixTimestamp() int64 {
	// 获取当前时间的纳秒级 Unix 时间戳
	unixTimestampNano := time.Now().UnixNano()

	// 转换为毫秒级 Unix 时间戳
	unixTimestampMillis := unixTimestampNano / int64(time.Millisecond)

	return unixTimestampMillis
}

// 是否为空
func isEmpty(text string) bool {
	if text == "" {
		return true
	}
	if len(text) == 0 {
		return true
	}
	return false
}

// add 方法，接受一个 RequestInfo 对象，并输出 JSON 格式的字符串
func (s *SceneService) Add(w http.ResponseWriter, r *http.Request) {
	// 转换为 json
	var requestData AddRequestInfo
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Error decoding JSON request body", http.StatusBadRequest)
		return
	}
	// 改为日志？
	log.Printf("req, %s\n", requestData)

	// 参数校验
	if isEmpty(requestData.AppName) || isEmpty(requestData.MethodName) || isEmpty(requestData.SceneCode) || isEmpty(requestData.SceneName) || isEmpty(requestData.SceneStatus) || isEmpty(requestData.ConditionJSON) {
		http.Error(w, "paramCheckFailed", http.StatusBadRequest)
		return
	}

	// 签名校验

	// neo4j 持久化
	// 执行插入节点的 Cypher 查询
	session, err := GetNeo4jSession()
	if err != nil {
		// 日志输出
		http.Error(w, "Error GetNeo4jSession", http.StatusInternalServerError)
		return
	}
	defer session.Close()
	_, runErr := session.Run(
		`CREATE (s:SceneData {appName: $appName, methodName: $methodName, 
			sceneCode: $sceneCode, sceneName: $sceneName, sceneStatus: $sceneStatus, conditionJson: $conditionJson,
			createTime: $createTime, updateTime: $updateTime}) RETURN s`,
		map[string]interface{}{
			"appName":       requestData.AppName,
			"methodName":    requestData.MethodName,
			"sceneCode":     requestData.SceneCode,
			"sceneName":     requestData.SceneName,
			"sceneStatus":   requestData.SceneStatus,
			"conditionJson": requestData.ConditionJSON,
			"createTime":    getUnixTimestamp(),
			"updateTime":    getUnixTimestamp(),
		},
	)

	if runErr != nil {
		// error 后续改为日志
		log.Printf("Error occurred: %v\n", runErr)

		http.Error(w, "Error Add", http.StatusInternalServerError)
		return
	}

	// 成功
	fmt.Fprintln(w, "Request was successful!")
	w.WriteHeader(http.StatusOK)
}

// RequestInfo 结构体定义
type RemoveRequestInfo struct {
	RequestID string `json:"requestId"`
	Checksum  string `json:"checksum"`
	SceneCode string `json:"sceneCode"`
}

// remove 方法，接受一个 RequestInfo 对象，并输出 JSON 格式的字符串
func (s *SceneService) Remove(w http.ResponseWriter, r *http.Request) {
	// 转换为 json
	var requestData RemoveRequestInfo
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Error decoding Remove request body", http.StatusBadRequest)
		return
	}
	// 改为日志？
	log.Printf("Remove req, %s\n", requestData)

	// 参数校验
	if isEmpty(requestData.SceneCode) {
		http.Error(w, "paramCheckFailed", http.StatusBadRequest)
		return
	}

	// neo4j 持久化
	// 执行插入节点的 Cypher 查询
	session, err := GetNeo4jSession()
	if err != nil {
		// 日志输出
		http.Error(w, "Error GetNeo4jSession", http.StatusInternalServerError)
		return
	}
	defer session.Close()
	// 执行删除逻辑
	_, runErr := session.Run(
		`MATCH (s:SceneData {sceneCode: $sceneCode}) DELETE s`,
		map[string]interface{}{
			"sceneCode": requestData.SceneCode,
		},
	)
	if runErr != nil {
		// error 后续改为日志
		log.Printf("Error occurred: %v\n", runErr)

		http.Error(w, "Error Remove", http.StatusInternalServerError)
		return
	}

	// 返回成功响应
	fmt.Fprintln(w, "SceneData deleted successfully")
	w.WriteHeader(http.StatusOK)
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
func (s *SceneService) Edit(w http.ResponseWriter, r *http.Request) {
	// 转换为 json
	var requestData EditRequestInfo
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Error decoding Edit request body", http.StatusBadRequest)
		return
	}
	// 改为日志？
	log.Printf("Edit req, %s\n", requestData)

	// 参数校验
	if isEmpty(requestData.SceneCode) || isEmpty(requestData.SceneName) || isEmpty(requestData.SceneStatus) || isEmpty(requestData.ConditionJSON) {
		http.Error(w, "paramCheckFailed", http.StatusBadRequest)
		return
	}

	// neo4j 持久化
	// 执行插入节点的 Cypher 查询
	session, err := GetNeo4jSession()
	if err != nil {
		// 日志输出
		http.Error(w, "Error GetNeo4jSession", http.StatusInternalServerError)
		return
	}
	defer session.Close()

	// 更新
	// 执行更新节点的 Cypher 查询
	_, runErr := session.Run(
		`MATCH (s:SceneData {sceneCode: $sceneCode}) 
		SET s.sceneName = $sceneName, s.sceneStatus = $sceneStatus, s.conditionJson = $conditionJson, s.updateTime = $ updateTime
		RETURN s`,
		map[string]interface{}{
			"sceneCode":     requestData.SceneCode,
			"sceneName":     requestData.SceneName,
			"sceneStatus":   requestData.SceneStatus,
			"conditionJson": requestData.ConditionJSON,
			"updateTime":    getUnixTimestamp(),
		},
	)
	if runErr != nil {
		// error 后续改为日志
		log.Printf("Error occurred: %v\n", runErr)

		// error 日志
		http.Error(w, "Error Edit", http.StatusInternalServerError)
		return
	}

	// 返回成功响应
	fmt.Fprintln(w, "SceneData edit successfully")
	w.WriteHeader(http.StatusOK)
}
```

### 吐槽

go 中判断空字符串和 java 的思路并不同，不能使用 text == nil

而应该使用：

```go
// 是否为空
func isEmpty(text string) bool {
	if text == "" {
		return true
	}
	if len(text) == 0 {
		return true
	}
	return false
}
```

go 在使用多个 if 条件的时候，`||` 不能换行。

要写在同一行：

```go
	if isEmpty(requestData.SceneCode) || isEmpty(requestData.SceneName) || isEmpty(requestData.SceneStatus) || isEmpty(requestData.ConditionJSON) {
		http.Error(w, "paramCheckFailed", http.StatusBadRequest)
		return
	}
```

## 测试

```
cd D:\_go\scene-server-v2\web
```


--------------------------------------------------------------------------------------------------------------------

# chat

## Q: go 如何访问 neo4j

在 Go 中，可以使用第三方的驱动程序来访问 Neo4j 数据库。一个常用的 Neo4j 驱动是 `github.com/neo4j/neo4j-go-driver`。以下是一个简单的例子，演示如何使用该驱动连接 Neo4j 数据库并执行一些基本的操作：

首先，你需要安装该驱动：

```bash
go get -u github.com/neo4j/neo4j-go-driver/v4
```

然后，你可以使用以下示例代码来连接 Neo4j 数据库：

```go
package main

import (
	"fmt"
	"log"

	"github.com/neo4j/neo4j-go-driver/v4"
)

func main() {
	// Neo4j 数据库连接 URI
	uri := "bolt://localhost:7687"

	// 用户名和密码
	username := "your_username"
	password := "your_password"

	// 创建 Neo4j 驱动的配置
	config := neo4j.NewConfig()
	config.Encrypted = false // 如果 Neo4j 未启用加密，设置为 false

	// 建立连接
	driver, err := neo4j.NewDriver(uri, neo4j.BasicAuth(username, password, ""), config)
	if err != nil {
		log.Fatal(err)
	}
	defer driver.Close()

	// 获取 Neo4j 会话
	session := driver.NewSession(neo4j.SessionConfig{})
	defer session.Close()

	// 执行 Cypher 查询
	result, err := session.Run("CREATE (n:Person {name: 'John Doe'}) RETURN n", nil)
	if err != nil {
		log.Fatal(err)
	}

	// 处理查询结果
	for result.Next() {
		fmt.Println(result.Record().GetByIndex(0).(string))
	}

	if err := result.Err(); err != nil {
		log.Fatal(err)
	}
}
```

请注意，这只是一个简单的示例，实际情况下，你可能需要根据你的数据库配置、认证方式等进行适当的修改。确保你的 Neo4j 服务器正在运行，并根据实际情况修改连接字符串、用户名和密码。

这个例子中，我们创建了一个名为 `Person` 的节点，并通过 Cypher 查询语句返回了该节点的信息。

你可以根据你的需求编写适当的 Cypher 查询语句和相应的处理逻辑。

## Q: go 中有没有类似于 ogm 的，直接操作对象的访问 neo4j 的组件？

在 Go 中，虽然没有像某些其他语言（如 Java）中那样成熟的 Object-Graph Mapping（OGM）库，但有一些轻量级的 Neo4j 驱动和库，可以帮助你在 Go 中进行 Neo4j 数据库的操作。

以下是一个常用的 Neo4j 驱动 `github.com/neo4j/neo4j-go-driver/v4` 的一个使用示例，演示如何操作 Neo4j 数据库，并将结果映射到 Go 对象：

首先，确保你已经安装了 Neo4j Go 驱动：

```bash
go get -u github.com/neo4j/neo4j-go-driver/v4
```

然后，你可以使用以下示例代码来进行简单的数据操作：

```go
package main

import (
	"fmt"
	"log"

	"github.com/neo4j/neo4j-go-driver/v4"
)

// Person 结构体定义
type Person struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func main() {
	// Neo4j 数据库连接 URI
	uri := "bolt://localhost:7687"

	// 用户名和密码
	username := "your_username"
	password := "your_password"

	// 创建 Neo4j 驱动的配置
	config := neo4j.NewConfig()
	config.Encrypted = false // 如果 Neo4j 未启用加密，设置为 false

	// 建立连接
	driver, err := neo4j.NewDriver(uri, neo4j.BasicAuth(username, password, ""), config)
	if err != nil {
		log.Fatal(err)
	}
	defer driver.Close()

	// 获取 Neo4j 会话
	session := driver.NewSession(neo4j.SessionConfig{})
	defer session.Close()

	// 执行 Cypher 查询
	result, err := session.Run("MATCH (n:Person) RETURN n", nil)
	if err != nil {
		log.Fatal(err)
	}

	// 处理查询结果
	var people []Person
	for result.Next() {
		record := result.Record()
		person := Person{
			ID:   fmt.Sprintf("%v", record.Get("n").(neo4j.Node).Id()),
			Name: record.Get("n").(neo4j.Node).Props()["name"].(string),
		}
		people = append(people, person)
	}

	if err := result.Err(); err != nil {
		log.Fatal(err)
	}

	// 打印查询结果
	fmt.Printf("People: %+v\n", people)
}
```

在这个例子中：

- 定义了一个 `Person` 结构体，用于表示 Neo4j 中的节点。
- 执行了一个简单的 Cypher 查询，将查询结果映射到 `Person` 结构体中。
- 注意，这只是一个基础示例，实际应用中可能需要更复杂的映射逻辑和更灵活的查询。

请注意，由于 Go 中没有类似于 Java 中强大的反射机制，目前没有像一些 OGM 那样全面的对象映射工具。

你可能需要手动处理查询结果和结构体之间的映射。

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

## Q: go 如何将对象插入到数据库中?

go 实现一个 add 方法，入参是一个对象，每个属性都是 srting 类型。

appName
methodName
sceneCode
sceneName
sceneStatus
conditionJson

如何把这个对象插入到 neo4j 数据库中？

### 回答

同样，要将一个对象插入到 Neo4j 数据库中，你需要使用 Neo4j 驱动程序执行一个 Cypher 查询，将对象的属性映射到相应的节点。以下是一个示例代码，演示如何使用 `github.com/neo4j/neo4j-go-driver/v4` 驱动将对象插入到 Neo4j 数据库中：

首先，确保你已经安装了 Neo4j Go 驱动：

```bash
go get -u github.com/neo4j/neo4j-go-driver/v4
```

然后，你可以使用以下示例代码：

```go
package main

import (
	"fmt"
	"log"

	"github.com/neo4j/neo4j-go-driver/v4"
)

// SceneData 结构体定义
type SceneData struct {
	AppName       string `json:"appName"`
	MethodName    string `json:"methodName"`
	SceneCode     string `json:"sceneCode"`
	SceneName     string `json:"sceneName"`
	SceneStatus   string `json:"sceneStatus"`
	ConditionJSON string `json:"conditionJson"`
}

func main() {
	// Neo4j 数据库连接 URI
	uri := "bolt://localhost:7687"

	// 用户名和密码
	username := "your_username"
	password := "your_password"

	// 创建 Neo4j 驱动的配置
	config := neo4j.NewConfig()
	config.Encrypted = false // 如果 Neo4j 未启用加密，设置为 false

	// 建立连接
	driver, err := neo4j.NewDriver(uri, neo4j.BasicAuth(username, password, ""), config)
	if err != nil {
		log.Fatal(err)
	}
	defer driver.Close()

	// 获取 Neo4j 会话
	session := driver.NewSession(neo4j.SessionConfig{})
	defer session.Close()

	// 创建一个 SceneData 对象
	sceneData := SceneData{
		AppName:       "MyApp",
		MethodName:    "add",
		SceneCode:     "001",
		SceneName:     "Scene1",
		SceneStatus:   "active",
		ConditionJSON: `{"key": "value"}`,
	}

	// 执行插入节点的 Cypher 查询
	result, err := session.Run(
		`CREATE (s:SceneData {appName: $appName, methodName: $methodName, 
			sceneCode: $sceneCode, sceneName: $sceneName, sceneStatus: $sceneStatus, conditionJson: $conditionJson}) RETURN s`,
		map[string]interface{}{
			"appName":       sceneData.AppName,
			"methodName":    sceneData.MethodName,
			"sceneCode":     sceneData.SceneCode,
			"sceneName":     sceneData.SceneName,
			"sceneStatus":   sceneData.SceneStatus,
			"conditionJson": sceneData.ConditionJSON,
		},
	)
	if err != nil {
		log.Fatal(err)
	}

	// 处理查询结果
	for result.Next() {
		record := result.Record()
		node := record.GetByIndex(0).(neo4j.Node)
		fmt.Printf("Created Node ID: %d\n", node.Id())
	}

	if err := result.Err(); err != nil {
		log.Fatal(err)
	}
}
```

这个例子与之前的例子非常相似，主要区别在于结构体的定义和对象的属性。

同样，确保你的 Neo4j 服务器正在运行，并根据实际情况修改连接字符串、用户名和密码。

此外，考虑到安全性，实际应用中应该进行错误处理、参数验证等更全面的处理。


## go 如何实现 SceneData 的删除，传入一个 sceneCode，根据 sceneCode 删除对应的一条数据。

要实现根据 `sceneCode` 删除对应的 `SceneData` 数据，你可以编写一个处理 HTTP 请求的处理函数，并从请求中获取 `sceneCode` 参数，然后使用 `neo4j.Session` 执行 Cypher 查询进行删除。以下是一个简单的例子：

```go
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/neo4j/neo4j-go-driver/v4"
)

// SceneData 结构体定义
type SceneData struct {
	AppName       string `json:"appName"`
	MethodName    string `json:"methodName"`
	SceneCode     string `json:"sceneCode"`
	SceneName     string `json:"sceneName"`
	SceneStatus   string `json:"sceneStatus"`
	ConditionJSON string `json:"conditionJson"`
}

func main() {
	http.HandleFunc("/delete", handleDelete)
	http.ListenAndServe(":8080", nil)
}

func handleDelete(w http.ResponseWriter, r *http.Request) {
	// 从请求中获取 sceneCode 参数
	sceneCode := r.URL.Query().Get("sceneCode")
	if sceneCode == "" {
		http.Error(w, "Missing sceneCode parameter", http.StatusBadRequest)
		return
	}

	// Neo4j 数据库连接 URI
	uri := "bolt://localhost:7687"

	// 用户名和密码
	username := "your_username"
	password := "your_password"

	// 获取写模式的 Neo4j 会话
	session, err := GetNeo4jSession(uri, username, password)
	if err != nil {
		http.Error(w, "Error creating Neo4j session", http.StatusInternalServerError)
		return
	}
	defer session.Close()

	// 执行删除节点的 Cypher 查询
	err = DeleteSceneData(session, sceneCode)
	if err != nil {
		http.Error(w, "Error deleting SceneData: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 返回成功响应
	fmt.Fprintln(w, "SceneData deleted successfully")
}

// GetNeo4jSession 函数用于获取 Neo4j 会话
func GetNeo4jSession(uri, username, password string) (neo4j.Session, error) {
	// 创建 Neo4j 驱动的配置
	config := neo4j.NewConfig()
	config.Encrypted = false // 如果 Neo4j 未启用加密，设置为 false

	// 建立连接
	driver, err := neo4j.NewDriver(uri, neo4j.BasicAuth(username, password, ""), config)
	if err != nil {
		return nil, err
	}
	defer driver.Close()

	// 获取 Neo4j 会话
	session := driver.NewSession(neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	return session, nil
}

// DeleteSceneData 函数用于删除指定 sceneCode 的 SceneData 数据
func DeleteSceneData(session neo4j.Session, sceneCode string) error {
	// 执行删除节点的 Cypher 查询
	result, err := session.Run(
		`MATCH (s:SceneData {sceneCode: $sceneCode}) DELETE s`,
		map[string]interface{}{
			"sceneCode": sceneCode,
		},
	)
	if err != nil {
		return err
	}

	// 处理查询结果
	for result.Next() {
		// 在这里处理可能的删除后的结果，如果有需要的话
	}

	if err := result.Err(); err != nil {
		return err
	}

	return nil
}
```

在这个例子中，`handleDelete` 处理函数从请求中获取 `sceneCode` 参数，并使用 `GetNeo4jSession` 函数获取 Neo4j 会话。然后，它调用 `DeleteSceneData` 函数执行删除操作，并返回相应的 HTTP 响应。`DeleteSceneData` 函数执行了一个 Cypher 查询，通过 `MATCH` 语句找到具有指定 `sceneCode` 的节点，并使用 `DELETE` 语句删除它。你可以根据实际需求修改 Cypher 查询。

## 如何实现更新？

如何实现 go 的更新操作？

入参对象为：

```go
type EditRequestInfo struct {
	SceneCode     string `json:"sceneCode"`
	SceneName     string `json:"sceneName"`
	SceneStatus   string `json:"sceneStatus"`
	ConditionJSON string `json:"conditionJson"`
}
```

根据 sceneCode 更新对应的 sceneName、sceneStatus、conditionJSON


### 回答

```go
// UpdateSceneData 函数用于更新指定 sceneCode 的 SceneData 数据
func UpdateSceneData(session neo4j.Session, editRequest EditRequestInfo) error {
	// 执行更新节点的 Cypher 查询
	result, err := session.Run(
		`MATCH (s:SceneData {sceneCode: $sceneCode}) 
		SET s.sceneName = $sceneName, s.sceneStatus = $sceneStatus, s.conditionJson = $conditionJson
		RETURN s`,
		map[string]interface{}{
			"sceneCode":      editRequest.SceneCode,
			"sceneName":      editRequest.SceneName,
			"sceneStatus":    editRequest.SceneStatus,
			"conditionJson":  editRequest.ConditionJSON,
		},
	)
	if err != nil {
		return err
	}

	// 处理查询结果
	for result.Next() {
		// 在这里处理可能的更新后的结果，如果有需要的话
	}

	if err := result.Err(); err != nil {
		return err
	}

	return nil
}
```

# 参考资料

chat

* any list
{:toc}