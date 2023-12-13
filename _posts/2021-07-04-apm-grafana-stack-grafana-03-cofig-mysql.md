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
go mod tidy
```

若不奏效，可删除文件go.mod,go.sum,执行go mod init,并重新执行以上命令


```bash
go mod init github.com/grafana/grafana
go mod tidy
```

重新执行编译+运行

```bash
# 通常用于运行一个名为 `setup` 的 Go 程序或脚本
go run build.go setup 

# 通常用于运行一个名为 `build` 的 Go 程序或脚本
go run build.go build 
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

# 参考资料

chat

https://github.com/grafana/grafana

[grafana 的配置文件,和使用mysql数据库做持久化](https://www.cnblogs.com/lovesKey/p/11436104.html)

* any list
{:toc}