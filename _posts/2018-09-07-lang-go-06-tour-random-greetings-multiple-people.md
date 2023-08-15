---
layout: post
title:  Go Lang-06-Tutorial greetings-multiple-people 
date:  2018-09-07 09:51:23 +0800
categories: [Lang]
tags: [go, lang, sh]
published: true
---

# 说明

在您对模块代码进行的最后更改中，您将添加对在一个请求中获取多人问候语的支持。 

换句话说，您将处理多值输入，然后将该输入中的值与多值输出配对。 

为此，您需要将一组名称传递给一个函数，该函数可以为每个名称返回问候语。

注意：本主题是从创建 Go 模块开始的多部分教程的一部分。
但有一个问题。 将 Hello 函数的参数从单个名称更改为一组名称将更改函数的签名。 

如果您已经发布了 example.com/greetings 模块并且用户已经编写了调用 Hello 的代码，那么该更改将破坏他们的程序。

在这种情况下，更好的选择是编写一个具有不同名称的新函数。 

新函数将采用多个参数。 

这保留了旧功能以实现向后兼容性。

## 1. greeting 源码

在greetings/greetings.go 中，更改您的代码，使其如下所示。

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

// Hellos returns a map that associates each of the named people
// with a greeting message.
func Hellos(names []string) (map[string]string, error) {
    // A map to associate names with messages.
    messages := make(map[string]string)
    // Loop through the received slice of names, calling
    // the Hello function to get a message for each name.
    for _, name := range names {
        message, err := Hello(name)
        if err != nil {
            return nil, err
        }
        // In the map, associate the retrieved message with
        // the name.
        messages[name] = message
    }
    return messages, nil
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

    // Return one of the message formats selected at random.
    return formats[rand.Intn(len(formats))]
}
```

在此代码中，您：

添加一个 Hellos 函数，其参数是名称片段而不是单个名称。 此外，您还可以将其返回类型之一从字符串更改为映射，以便可以返回映射到问候消息的名称。

让新的 Hellos 函数调用现有的 Hello 函数。 这有助于减少重复，同时保留这两个功能。

创建一个消息映射，将每个接收到的名称（作为键）与生成的消息（作为值）相关联。 在 Go 中，您可以使用以下语法初始化映射：`make(map[key-type]value-type)`。 

您让 Hellos 函数将此映射返回给调用者。 

循环遍历函数收到的名称，检查每个名称是否具有非空值，然后将消息与每个名称相关联。 

在此 for 循环中，range 返回两个值：循环中当前项目的索引和该项目值的副本。 

您不需要索引，因此您使用 Go 空白标识符（下划线）来忽略它。 

有关更多信息，请参阅Effective Go 中的空白标识符。

## 2. 调用处

在 hello/hello.go 调用代码中，传递一段名称，然后打印您返回的名称/消息映射的内容。

在 hello.go 中，更改代码，使其如下所示。

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

    // A slice of names.
    names := []string{"Gladys", "Samantha", "Darrin"}

    // Request greeting messages for the names.
    messages, err := greetings.Hellos(names)
    if err != nil {
        log.Fatal(err)
    }
    // If no error was returned, print the returned map of
    // messages to the console.
    fmt.Println(messages)
}
```

通过这些更改，您：

- 创建一个名称变量作为包含三个名称的切片类型。

- 将名称变量作为参数传递给 Hellos 函数。

## 3. 测试

在命令行中，切换到包含 hello/hello.go 的目录，然后使用 go run 来确认代码是否有效。

输出应该是将名称与消息关联起来的映射的字符串表示形式，如下所示：

```
$ go run .
```

结果：

```
map[Darrin:Hail, Darrin! Well met! Gladys:Great to see you, Gladys! Samantha:Hi, Samantha. Welcome!]
```

# 参考资料

https://go.dev/doc/tutorial/random-greeting

* any list
{:toc}