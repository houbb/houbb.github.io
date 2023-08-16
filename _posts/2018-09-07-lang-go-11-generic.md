---
layout: post
title:  Go Lang-11-generic 泛型
date:  2018-09-07 09:51:23 +0800
categories: [Lang]
tags: [go, lang, sh]
published: true
---


# 一、泛型输出

下面的例子是一个对泛型输出的基本例子。

函数可以有一个额外的类型参数列表，它使用方括号，但看起来像一个普通的参数列表：func F(p T) { ... }，代码中的T any即为类型参数，意思是该函数支持任何T类型，当我们调用printSlicestring时，会被类型推导为string类型，不过在编译器完全可以实现类型推导时，也可以省略显式类型，如：printSlice([]string{“Hello”，“World”}) ，这样也将会是对的；

## 测试代码

```go
package main
 
import (
  "fmt"
)
 
func printSlice[T any](s []T) {
  for _, v := range s {
    fmt.Printf("%v ", v)
  }
  fmt.Print("\n")
}
 
func main() {
  printSlice[int]([]int{1, 2, 3, 4, 5})
  printSlice[float64]([]float64{1.01, 2.02, 3.03, 4.04, 5.05})
  printSlice([]string{"Hello", "World"})
  printSlice[int64]([]int64{5, 4, 3, 2, 1})
}
```

运行测试

```
$ go run main.go
1 2 3 4 5
1.01 2.02 3.03 4.04 5.05
Hello World
5 4 3 2 1
```

# 参考资料

https://go.dev/doc/tutorial/generics

[期待已久的golang泛型入门](https://juejin.cn/post/7125613193631629326)

https://juejin.cn/post/7042949225138782244

https://zhuanlan.zhihu.com/p/572436779

* any list
{:toc}