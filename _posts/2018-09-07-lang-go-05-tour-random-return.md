---
layout: post
title:  Go Lang-05-Tutorial Return a random greeting 返回一个随机结果
date:  2018-09-07 09:51:23 +0800
categories: [Lang]
tags: [go, lang, sh]
published: true
---

# 返回随机问候语

在本部分中，您将更改代码，以便不是每次都返回单个问候语，而是返回多个预定义问候语消息之一。

为此，您将使用 Go 切片 slice。 

切片类似于数组，只不过它的大小会随着添加和删除项目而动态变化。 切片是 Go 最有用的类型之一。

您将添加一个小切片来包含三条问候消息，然后让代码随机返回其中一条消息。 

在 greetings/greetings.go 中，更改您的代码，使其如下所示

## greetings/greetings.go

修改内容如下：

```go
package greetings

import (
    "errors"
    "fmt"
    "math/rand"
)

// Hello returns a greeting for the named person.
func Hello(name string) (string, error) {
    // If no name was given, return an error with a message.
    if name == "" {
        return name, errors.New("empty name")
    }
    // Create a message using a random format.
    message := fmt.Sprintf(randomFormat(), name)
    return message, nil
}

// randomFormat returns one of a set of greeting messages. The returned
// message is selected at random.
func randomFormat() string {
    // A slice of message formats.
    formats := []string{
        "Hi, %v. Welcome!",
        "Great to see you, %v!",
        "Hail, %v! Well met!",
    }

    // Return a randomly selected message format by specifying
    // a random index for the slice of formats.
    return formats[rand.Intn(len(formats))]
}
```

思路，随机在结果字符串中选择一个结果。

## hello/hello.go

调整实现。

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
    message, err := greetings.Hello("Gladys")
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

```
λ go run .
Hi, Gladys. Welcome!

λ go run .
Great to see you, Gladys!

λ go run .
Hi, Gladys. Welcome!

λ go run .
Hail, Gladys! Well met!
```

# 参考资料

https://go.dev/doc/tutorial/random-greeting

* any list
{:toc}