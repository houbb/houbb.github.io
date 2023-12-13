---
layout: post
title: grafana stack grafana-03-config mysql 把数据库从 sqllite 改成 mysql + windows10 编译实战笔记
date:  2021-06-20 16:52:15 +0800
categories: [APM]
tags: [apm, grafana, linux]
published: true
---



# 准备工作

## git

```
> git --version
git version 2.33.1.windows.1
```

## go

- go

```
> go version
go version go1.20.4 windows/amd64
```

## node

- node

```
$ node -v
v20.10.0
```

改为国内镜像：

```
npm config set registry=https://registry.npmmirror.com
```

## yarn

```
$  npm install -g yarn

$ yarn -v
1.22.21
```

# 编译前端

到目标文件夹：

```
D:\_go\grafana
```

执行命令：

```bash
# 下载依赖  yarn install --immutable
yarn install

# 资源热部署
yarn start
```

## 报错

```
➤ YN0001: │ RequestError                                                                         
    at ClientRequest.<anonymous> (D:\_go\grafana\.yarn\releases\yarn-4.0.0.cjs:147:14258)        
    at Object.onceWrapper (node:events:629:26)                                                   
    at ClientRequest.emit (node:events:526:35)                                                   
    at u.emit (D:\_go\grafana\.yarn\releases\yarn-4.0.0.cjs:142:14420)                           
    at TLSSocket.socketErrorListener (node:_http_client:495:9)                                   
    at TLSSocket.emit (node:events:514:28)                                                       
    at emitErrorNT (node:internal/streams/destroy:151:8)                                         
    at emitErrorCloseNT (node:internal/streams/destroy:116:3)                                    
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21)AggregateError 
    at internalConnectMultiple (node:net:1114:18)                                                
    at afterConnectMultiple (node:net:1667:5)                                                    
➤ YN0001: │ RequestError                                                                         
    at ClientRequest.<anonymous> (D:\_go\grafana\.yarn\releases\yarn-4.0.0.cjs:147:14258)        
    at Object.onceWrapper (node:events:629:26)                                                   
    at ClientRequest.emit (node:events:526:35)                                                   
    at u.emit (D:\_go\grafana\.yarn\releases\yarn-4.0.0.cjs:142:14420)                           
    at TLSSocket.socketErrorListener (node:_http_client:495:9)                                   
    at TLSSocket.emit (node:events:514:28)                                                       
    at emitErrorNT (node:internal/streams/destroy:151:8)                                         
    at emitErrorCloseNT (node:internal/streams/destroy:116:3)                                    
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21)AggregateError 
    at internalConnectMultiple (node:net:1114:18)                                                
    at afterConnectMultiple (node:net:1667:5)                                                    
➤ YN0000: └ Completed in 3m 26s                                                                  
➤ YN0000: · Failed with errors in 3m 27s                                                         
```

# 编译后端

## 修改数据源

# 数据源

我们可以在 `/conf/default.ini` 文件中把数据源进行修改。

```ini
[database]
# You can configure the database connection by specifying type, host, name, user and password
# as separate properties or as on string using the url property.

# Either "mysql", "postgres" or "sqlite3", it's your choice
type = mysql
host = 127.0.0.1:3306
name = grafana
user = root
# If the password contains # or ; you have to wrap it with triple quotes. Ex """#password;"""
password = 你的数据库密码
# Use either URL or the previous fields to configure the database
# Example: mysql://user:secret@host:port/database
; url = mysql://127.0.0.1:3306/grafana?useUnicode=true&characterEncoding=utf-8
```

默认是 sqllite。


## 后端编译


```bash
go run build.go setup # 通常用于运行一个名为 `setup` 的 Go 程序或脚本
go run build.go build # 通常用于运行一个名为 `build` 的 Go 程序或脚本
```

日志：

```
λ go run build.go setup
Version: 10.3.0, Linux Version: 10.3.0, Package Iteration: 1702431504pre
go install -v -buildmode=exe ./pkg/cmd/grafana-server
go: downloading golang.org/x/sys v0.14.0
golang.org/x/sys/windows
github.com/fatih/color
github.com/grafana/grafana/pkg/util/cmd
github.com/grafana/grafana/pkg/cmd/grafana-server


PS D:\_go\grafana> go run build.go build
Version: 10.3.0, Linux Version: 10.3.0, Package Iteration: 1702431594pre
building binaries build
building grafana ./pkg/cmd/grafana
rm -r ./bin/windows-amd64/grafana.exe
rm -r ./bin/windows-amd64/grafana.exe.md5
go build -ldflags -w -X main.version=10.3.0-pre -X main.commit=043096d652 -X main.buildstamp=1701776740 -X main.buildBranch=main -buildmode=exe -o ./bin/windows-amd64/grafana.exe ./pkg/cmd/grafana
go: downloading k8s.io/apimachinery v0.28.3
go: downloading k8s.io/apiserver v0.28.3
go: downloading k8s.io/component-base v0.28.3
verifying github.com/oleiade/reflections@v1.0.0/go.mod: checksum mismatch
        downloaded: h1:rdFxbxq4QXVZWj0F+e9jqjDkc7dbp97vkRixKo2JR60=
        go.sum:     h1:RbATFBbKYkVdqmSFtx13Bb/tVhR0lgOBXunWTZKeL4w=

SECURITY ERROR
This download does NOT match an earlier download recorded in go.sum.
The bits may have been replaced on the origin server, or an attacker may
have intercepted the download attempt.

For more information, see 'go help module-auth'.
exit status 1
exit status 1
```

## 报错

go mod和git管理代码导致的go.sum校验和不匹配问题

解决方式：

```
go clean -modcache
```

若不奏效，可删除文件go.mod,go.sum,执行go mod init,并重新执行以上命令


清空后，重新运行。

```
D:\go\grafana-main
λ go run build.go setup
Version: 10.3.0, Linux Version: 10.3.0, Package Iteration: 1702440425pre
go install -v -buildmode=exe ./pkg/cmd/grafana-server
go: downloading github.com/fatih/color v1.15.0
go: downloading golang.org/x/sys v0.15.0
go: downloading github.com/mattn/go-colorable v0.1.13
go: downloading github.com/mattn/go-isatty v0.0.18
internal/nettrace
internal/singleflight
vendor/golang.org/x/net/dns/dnsmessage
internal/intern
github.com/mattn/go-isatty
net/netip
github.com/mattn/go-colorable
net
golang.org/x/sys/windows
github.com/fatih/color
github.com/grafana/grafana/pkg/util/cmd
github.com/grafana/grafana/pkg/cmd/grafana-server
```


### 解决方式0-删除 go.sum

1、删除 go.sum

2、执行 

```
go mod tidy
```

报错：

```
λ go mod tidy
go: go.mod file indicates go 1.21, but maximum version supported by tidy is 1.20
```

这里是本地的 go 版本太低导致的，升级 go 的版本。

下载：[go1.21.5.windows-amd64.msi](https://go.dev/dl/go1.21.5.windows-amd64.msi)

安装+验证

```
λ go version
go version go1.21.5 windows/amd64
```

重新执行：

```
go mod tidy
```

可能会下载很慢，可以指定为国内的代理：

```
go env -w GOPROXY=https://goproxy.cn
```

官方代理：

```
go env -w GOPROXY=https://goproxy.io
```

### 解决方式1-删除 go.mod+go.sum

这个后面会报错，不太清楚这个包初始化应该指定的 package 是什么？

基础包 init

```bash
# init
go mod init github.com/grafana/grafana
go mod tidy
```


有一个警告：

```
o: found cuelang.org/go/pkg/strings in cuelang.org/go v0.7.0
go: found k8s.io/apimachinery/pkg/util/validation in k8s.io/apimachinery v0.28.4
go: github.com/grafana/grafana/pkg/build/pkg/extensions imports
        github.com/vectordotdev/go-datemath: github.com/vectordotdev/go-datemath@v0.1.0: parsing go.mod:
        module declares its path as: github.com/timberio/go-datemath
                but was required as: github.com/vectordotdev/go-datemath
```

编译运行

```bash
# 通常用于运行一个名为 `setup` 的 Go 程序或脚本
go run build.go setup 

# 通常用于运行一个名为 `build` 的 Go 程序或脚本
go run build.go build 
```

```
λ go run build.go setup
build.go:9:2: no required module provides package github.com/grafana/grafana/pkg/build: go.mod file not found in current directory or any parent directory; see 'go help modules'
```

日志：

```
go: found github.com/grafana/alerting/receivers/threema in github.com/grafana/alerting v0.0.0-20231101090315-bf12694896a8
go: found github.com/grafana/pyroscope/api/gen/proto/go/google/v1 in github.com/grafana/pyroscope/api v0.3.0
go: found github.com/apache/arrow/go/v13/arrow/flight/flightsql/example in github.com/apache/arrow/go/v13 v13.0.0
go: found buf.build/gen/go/parca-dev/parca/protocolbuffers/go/parca/metastore/v1alpha1 in buf.build/gen/go/parca-dev/parca/protocolbuffers/go v1.31.0-20231108103541-d46ad19b4dbd.2
go: found buf.build/gen/go/parca-dev/parca/protocolbuffers/go/parca/profilestore/v1alpha1 in buf.build/gen/go/parca-dev/parca/protocolbuffers/go v1.31.0-20231108103541-d46ad19b4dbd.2
go: found cuelang.org/go/pkg/strings in cuelang.org/go v0.7.0
go: found k8s.io/apimachinery/pkg/util/validation in k8s.io/apimachinery v0.28.4
go: github.com/grafana/grafana/pkg/extensions imports
        github.com/vectordotdev/go-datemath: github.com/vectordotdev/go-datemath@v0.1.0: parsing go.mod:
        module declares its path as: github.com/timberio/go-datemath
                but was required as: github.com/vectordotdev/go-datemath
```

# go 设置代理


## 方式1

```
go env -w GO111MODULE=on

go env -w GOPROXY=https://goproxy.cn,direct
```

## 方式2

pS: 仅供参考，设置后导致下载依然失败。作用不大。

1、开启go module模式，这个模式开启下回忽略GOPATH和vendor文件夹

```
go env -w GO111MODULE=on
```

2、配置阿里的地址

```
go env -w GOPROXY="https://mirrors.aliyun.com/goproxy/,direct"
```
3、部分配置使用私有地址

```
go env -w  GOPRIVATE="*github.com"
```

4、关闭包验证

```
go env -w GOSUMDB=off
```

# 如何解决Golang开发中校验和不匹配问题

在Golang开发中，可能会遇到校验和不匹配问题，这通常发生在使用 go get, go mod tidy之类的指令获取依赖包的时候。这是因为Golang在处理模块的时候会进行校验和计算，以确保模块的内容不会被意外或恶意改变。

然而，当一个模块的版本被创建者重新定义时（可能添加了一些新的commits，或者删除了旧的commits），就可能会出现校验和不匹配的情况。


## 清理缓存

第一种方法是“清洁果酱瓶”，就像小刺猬清洁罐子一样，你也需要清理Golang的缓存。

Golang使用一个本地缓存来存储模块的下载版本和其校验和。你可以通过下列命令清除Golang的模块缓存：

```
go clean -modcache
```

这样，你就清空了旧的、有可能错误的校验和。下次获取模块时，Golang会重新计算校验和。

## 修改go.sum

第二种方法是“换个新的罐子”。

在Golang的项目中，go.sum文件就像小刺猬手中的旧罐子。

它包含了项目依赖所有模块及版本的校验和。如果存在不匹配问题，你可以手动删除go.sum文件：

```
rm go.sum
```

然后再通过以下命令重新生成:

```
go mod tidy
```

这样，你就用全新的“罐子”来存放所有的“果酱”。

## 使用replace指令

第三种方法是“用新的果酱替换旧的”。

有时，你可能发现在你的“果酱瓶”中，校验和问题来自于某个特定的模块。

在那种情况下，你可以使用replace指令在你的项目中替换出问题的模块版本。这就相当于你用新的果酱替换了老的果酱。

例如，你想替换一个模块的版本，你需要在go.mod中添加如下行：

```
replace github.com/oldmodule v1.0.0 => github.com/oldmodule v1.0.1
```

上述的replace指令意味着你告诉Golang，每次它需要用到版本为v1.0.0的oldmodule时，应该使用v1.0.1的版本来代替。

记住，可以随时查阅Golang的官方文档，就像小刺猬带着手电筒探索森林一样，文档将为你带来明亮的路。

以上就是解决Golang开发中校验和不匹配问题的一些方法。

这就像小刺猬解决他的“果酱瓶”问题一样，清理错误、替换新的、打破旧的，希望对你有所帮助！


# 参考资料

chat

https://github.com/grafana/grafana

[grafana 的配置文件,和使用mysql数据库做持久化](https://www.cnblogs.com/lovesKey/p/11436104.html)

https://github.com/grafana/grafana/blob/HEAD/contribute/developer-guide.md

[Npm / Yarn / Pnpm 前端包管理工具对比](https://juejin.cn/post/7072656077199769631)

https://github.com/yarnpkg/berry/issues/1516

## go.sum checksum 不通过

https://blog.csdn.net/weixin_43372552/article/details/111703543

https://juejin.cn/post/7113842922717446157

https://blog.csdn.net/fish_study_csdn/article/details/110422602

https://juejin.cn/post/7018614545174233125

http://itpika.com/2021/04/25/go/go-mod-sumdb/

## 使用go mod tidy命令出现go.mod file indicates go 1.21, but maximum supported version is 1.19，如何解决

https://blog.csdn.net/liuzr_/article/details/132542526

## yarn 报错

[npm install 时 electron安装失败的解决办法](https://blog.csdn.net/liuminwithsmile/article/details/134465833)

* any list
{:toc}