---
layout: post
title:  Go Lang-12-fuzzing  模糊测试
date:  2018-09-07 09:51:23 +0800
categories: [Lang]
tags: [go, lang, sh]
published: true
---


# 简洁

本教程介绍了 Go 中模糊测试的基础知识。 

通过模糊测试，随机数据会针对您的测试运行，以尝试找到漏洞或导致崩溃的输入。 可以通过模糊测试发现的漏洞示例包括 SQL 注入、缓冲区溢出、拒绝服务和跨站点脚本攻击。

在本教程中，您将为一个简单的函数编写模糊测试，运行 go 命令，并调试和修复代码中的问题。


# 测试

## 创建文件

```
cd D:\_go\06-fuzz
```

初始化 mod

```
go mod init example/fuzz

go: creating new go.mod: module example/fuzz
```

## 编写代码

- main.go

```go
package main

import "fmt"

func Reverse(s string) string {
    b := []byte(s)
    for i, j := 0, len(b)-1; i < len(b)/2; i, j = i+1, j-1 {
        b[i], b[j] = b[j], b[i]
    }
    return string(b)
}

func main() {
    input := "The quick brown fox jumped over the lazy dog"
    rev := Reverse(input)
    doubleRev := Reverse(rev)
    fmt.Printf("original: %q\n", input)
    fmt.Printf("reversed: %q\n", rev)
    fmt.Printf("reversed again: %q\n", doubleRev)
}
```

运行

```
go run .

original: "The quick brown fox jumped over the lazy dog"
reversed: "god yzal eht revo depmuj xof nworb kciuq ehT"
reversed again: "The quick brown fox jumped over the lazy dog"
```

## 添加单元测试

新建文件 `reverse_test.go`，内容如下：

```go
package main

import (
    "testing"
)

func TestReverse(t *testing.T) {
    testcases := []struct {
        in, want string
    }{
        {"Hello, world", "dlrow ,olleH"},
        {" ", " "},
        {"!12345", "54321!"},
    }
    for _, tc := range testcases {
        rev := Reverse(tc.in)
        if rev != tc.want {
                t.Errorf("Reverse: %q, want %q", rev, tc.want)
        }
    }
}
```

执行测试

```
$ go test

PASS
ok      example/fuzz    0.927s
```

## 添加 FUZZ

### 说明

单元测试有局限性，即每个输入都必须由开发人员添加到测试中。 

模糊测试的好处之一是它可以为您的代码提供输入，并且可以识别您提出的测试用例未达到的边缘情况。

在本节中，您将把单元测试转换为模糊测试，以便您可以用更少的工作生成更多的输入！

请注意，您可以将单元测试、基准测试和模糊测试保留在同一个 *_test.go 文件中，但对于本示例，您将把单元测试转换为模糊测试。

### 代码

我们把测试代码的内容改成下面的

```go
package main

import (
    "testing"
	  "unicode/utf8"
)

func FuzzReverse(f *testing.F) {
    testcases := []string{"Hello, world", " ", "!12345"}
    for _, tc := range testcases {
        f.Add(tc)  // Use f.Add to provide a seed corpus
    }
    f.Fuzz(func(t *testing.T, orig string) {
        rev := Reverse(orig)
        doubleRev := Reverse(rev)
        if orig != doubleRev {
            t.Errorf("Before: %q, after: %q", orig, doubleRev)
        }
        if utf8.ValidString(orig) && !utf8.ValidString(rev) {
            t.Errorf("Reverse produced invalid UTF-8 string %q", rev)
        }
    })
}
```

### 测试

1) 基本用例

运行模糊测试而不对其进行模糊测试，以确保种子输入通过。

```
$ go test
PASS
ok      example/fuzz    1.306s
```

2) 运行 FuzzReverse 进行模糊测试，以查看任何随机生成的字符串输入是否会导致失败。 

这是使用 go test 执行的，并带有一个新标志 -fuzz，设置为参数 Fuzz。 复制下面的命令。

```
$ go test -fuzz=Fuzz
fuzz: elapsed: 0s, gathering baseline coverage: 0/3 completed
fuzz: elapsed: 0s, gathering baseline coverage: 3/3 completed, now fuzzing with 16 workers
fuzz: minimizing 29-byte failing input file
fuzz: elapsed: 0s, minimizing
--- FAIL: FuzzReverse (0.21s)
    --- FAIL: FuzzReverse (0.00s)
        reverse_test.go:20: Reverse produced invalid UTF-8 string "\x80\xd9"

    Failing input written to testdata\fuzz\FuzzReverse\d4cc6f6ab27db823
    To re-run:
    go test -run=FuzzReverse/d4cc6f6ab27db823
FAIL
exit status 1
FAIL    example/fuzz    1.812s
```

3) 

# 参考资料

https://go.dev/security/fuzz/#glossary

https://go.dev/doc/tutorial/fuzz

* any list
{:toc}