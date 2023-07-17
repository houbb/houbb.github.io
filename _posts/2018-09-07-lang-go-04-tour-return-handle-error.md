---
layout: post
title:  Go Lang-04-Tutorial 返回并且处理 Error 
date:  2018-09-07 09:51:23 +0800
categories: [Lang]
tags: [go, lang, sh]
published: true
---

# 处理错误 

处理错误是可靠代码的一个基本特征。 

在本节中，您将添加一些代码以从greetings模块返回错误，然后在调用者中处理它。

注意：本主题是从创建 Go 模块开始的多部分教程的一部分。

在greetings/greetings.go 中，添加下面突出显示的代码。

如果您不知道该向谁打招呼，那么回复问候语就没有意义。 

如果名称为空，则向调用者返回错误。 

将以下代码复制到greetings.go 并保存文件。

## 修改 greetings.go 文件 

`greetings/greetings.go` 文件内容调整如下：

```go
package greetings

import (
    "errors"
    "fmt"
)

// Hello returns a greeting for the named person.
func Hello(name string) (string, error) {
    // If no name was given, return an error with a message.
    if name == "" {
        return "", errors.New("empty name")
    }

    // If a name was received, return a value that embeds the name
    // in a greeting message.
    message := fmt.Sprintf("Hi, %v. Welcome!", name)
    return message, nil
}
```

## 修改 hello/hello.go

内容调整如下：

```go
package main

import (
    "fmt"
    "log"

    "example.com/greetings"
)

func main() {
    // Set properties of the predefined Logger, including
    // the log entry prefix and a flag to disable printing
    // the time, source file, and line number.
    log.SetPrefix("greetings: ")
    log.SetFlags(0)

    // Request a greeting message.
    message, err := greetings.Hello("")
    // If an error was returned, print it to the console and
    // exit the program.
    if err != nil {
        log.Fatal(err)
    }

    // If no error was returned, print the returned message
    // to the console.
    fmt.Println(message)
}
```

## 测试

在 hello 文件夹中。

```
$ go run .
greetings: empty name
exit status 1
```

# 参考资料

https://go.dev/doc/tutorial/handle-errors

* any list
{:toc}