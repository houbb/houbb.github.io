---
layout: post
title:  Go Lang-07-Add a test 添加测试
date:  2018-09-07 09:51:23 +0800
categories: [Lang]
tags: [go, lang, sh]
published: true
---


# chat 介绍如何添加测试用例

在 Go 语言中，编写测试用例是一个很常见的实践，Go 提供了内置的测试框架来方便编写、运行和管理测试代码。

下面是一个简单的步骤指南，演示如何在 Go 中编写测试用例：

1. **创建测试文件：** 首先，在你的项目目录下创建一个与要测试的文件相同的目录，并在该目录下创建一个以 `_test.go` 结尾的文件，用于编写测试代码。例如，如果你要测试一个名为 `myfunc.go` 的文件，那么测试文件可以命名为 `myfunc_test.go`。

2. **导入测试所需的包：** 在测试文件的开头，和正常的 Go 文件一样，你需要导入测试所需的包和被测试的文件。

3. **编写测试函数：** 在测试文件中，你需要编写测试函数，这些函数的命名约定是以 `Test` 开头，后面跟着被测试函数的名字。这些函数应该接受一个名为 `t *testing.T` 的参数，用于处理测试相关的逻辑。

4. **编写测试逻辑：** 在测试函数中，你可以使用 `t` 参数调用 `t.Run` 和各种断言函数来测试你的代码。常用的断言函数有 `t.Errorf`、`t.Fatalf`、`t.Log` 和 `t.FailNow` 等，用于报告错误和记录日志。

5. **运行测试：** 使用 Go 提供的 `go test` 命令来运行测试。在命令行中，进入到包含测试文件的目录，并执行 `go test` 命令。Go 会自动查找并运行测试文件中的测试函数。

以下是一个简单的示例，演示了如何在 Go 中编写和运行测试用例：

假设你有一个名为 `math.go` 的文件，其中包含一个用于加法的函数：

```go
// math.go
package mymath

func Add(a, b int) int {
    return a + b
}
```

然后，你可以在同一目录下创建一个 `math_test.go` 文件来编写测试用例：

```go
// math_test.go
package mymath

import "testing"

func TestAdd(t *testing.T) {
    result := Add(2, 3)
    if result != 5 {
        t.Errorf("Expected 5, but got %d", result)
    }
}
```

然后，使用命令行在该目录下运行测试：

```sh
go test
```

Go 会执行测试用例，并显示测试结果。

这只是一个简单的示例，实际编写测试用例可能涉及到更多的测试场景、边界条件和断言。

但基本的流程和步骤是类似的。通过编写测试用例，你可以确保你的代码在不同场景下能够正常工作，从而提高代码的质量和稳定性。

# 测试 

现在您已经将代码放到了稳定的位置（顺便说一下，做得很好），添加一个测试。 

在开发过程中测试代码可能会暴露出在您进行更改时出现的错误。 

在本主题中，您将添加 Hello 函数的测试。

注意：本主题是从创建 Go 模块开始的多部分教程的一部分。

Go 对单元测试的内置支持使您可以更轻松地进行测试。 

具体来说，使用命名约定、Go 的测试包和 go test 命令，您可以快速编写和执行测试。

## 测试代码

在greetings目录中，创建一个名为greetings_test.go的文件。

以 **_test.go 结尾的文件名告诉 go test 命令该文件包含测试函数**。

在 greetings_test.go 中，粘贴以下代码并保存文件。

```go
package greetings

import (
    "testing"
    "regexp"
)

// TestHelloName calls greetings.Hello with a name, checking
// for a valid return value.
func TestHelloName(t *testing.T) {
    name := "Gladys"
    want := regexp.MustCompile(`\b`+name+`\b`)
    msg, err := Hello("Gladys")
    if !want.MatchString(msg) || err != nil {
        t.Fatalf(`Hello("Gladys") = %q, %v, want match for %#q, nil`, msg, err, want)
    }
}

// TestHelloEmpty calls greetings.Hello with an empty string,
// checking for an error.
func TestHelloEmpty(t *testing.T) {
    msg, err := Hello("")
    if msg != "" || err == nil {
        t.Fatalf(`Hello("") = %q, %v, want "", error`, msg, err)
    }
}
```

在此代码中，您：

- 在与您正在测试的代码相同的包中实现测试功能。

- 创建两个测试函数来测试greetings.Hello 函数。 测试函数名称的形式为 TestName，其中 Name 表示有关特定测试的信息。 此外，测试函数将指向测试包的testing.T 类型的指针作为参数。 您可以使用此参数的方法来报告和记录测试。

实施两个测试：

- TestHelloName 调用 Hello 函数，传递一个名称值，该函数应该能够返回有效的响应消息。 如果调用返回错误或意外响应消息（不包含您传入的名称），则可以使用 t 参数的 Fatalf 方法将消息打印到控制台并结束执行。

- TestHelloEmpty 使用空字符串调用 Hello 函数。 此测试旨在确认您的错误处理是否有效。 如果调用返回非空字符串或没有错误，则可以使用 t 参数的 Fatalf 方法将消息打印到控制台并结束执行。

## 执行测试

在greetings目录下的命令行中，运行go test命令来执行测试。

`go test` 命令执行测试文件（名称以 _test.go 结尾）中的测试函数（名称以 Test 开头）。 

您可以添加 -v 标志来获取列出所有测试及其结果的详细输出。

测试应该通过。

```
:\_go\01-modules\greetings
λ go test
PASS
ok      example.com/greetings   1.167s

D:\_go\01-modules\greetings
λ go test -v
=== RUN   TestHelloName
--- PASS: TestHelloName (0.00s)
=== RUN   TestHelloEmpty
--- PASS: TestHelloEmpty (0.00s)
PASS
ok      example.com/greetings   0.061s
```
当然，你可以修改测试用例，让其不通过看一下。

# 参考资料

https://go.dev/doc/tutorial/add-a-test

* any list
{:toc}