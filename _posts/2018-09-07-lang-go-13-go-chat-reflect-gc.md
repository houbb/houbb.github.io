---
layout: post
title:  Go Lang-13-go gc 和 reflect 反射如何实现的？
date:  2018-09-07 09:51:23 +0800
categories: [Lang]
tags: [go, lang, sh]
published: true
---


# chat

## Q: go 不像 java 有 jvm，是如何实现 GC 的？

Go 语言与 Java 不同，确实没有像 JVM（Java 虚拟机）那样的运行时环境，但它同样具有垃圾回收（Garbage Collection，GC）机制。

Go 使用一种称为 "concurrent garbage collector" 的垃圾回收器，也被称为并发垃圾回收器。

以下是 Go 语言中的垃圾回收是如何实现的：

1. **标记-清扫算法（Mark and Sweep）：** Go 语言的垃圾回收器使用了标记-清扫算法，这是一种比较经典的垃圾回收算法。该算法包括两个主要阶段：

   - **标记阶段：** 在这个阶段，垃圾回收器会遍历程序中的对象，并标记那些仍然可达的对象。可达对象是指那些可以通过程序中的引用链追溯到的对象。

   - **清扫阶段：** 在这个阶段，垃圾回收器会清扫并释放那些未被标记的对象，即那些不可达的对象。这些对象被认为是垃圾，可以被回收。

2. **并发标记（Concurrent Marking）：** Go 的垃圾回收器采用并发标记的方式，意味着垃圾回收过程与程序的执行是同时进行的。这有助于减少垃圾回收对程序性能的影响。在标记阶段，垃圾回收器可以在程序运行的同时标记对象，而不是暂停整个程序。

3. **自适应调整（Adaptive Garbage Collection）：** Go 的垃圾回收器是自适应的，它会根据程序的运行情况动态地调整垃圾回收的参数。这种自适应性有助于优化垃圾回收器的性能，使其适应不同的应用场景。

总体而言，Go 的垃圾回收器通过并发标记和自适应调整等技术，实现了高效的垃圾回收，从而避免了传统垃圾回收器可能引起的明显停顿。

这使得 Go 语言在大规模并发和网络应用方面表现得相当出色。

## Q: go 是如何实现反射的？入门例子和原理

在 Go 语言中，反射（reflection）是一种在运行时检查和操作程序结构、变量和值的机制。Go 的反射包是 `reflect`，它提供了一组用于在运行时进行类型检查、获取类型信息和动态调用的函数。以下是一个简单的入门例子和一些基本原理：

```go
package main

import (
	"fmt"
	"reflect"
)

type Person struct {
	Name  string
	Age   int
	Title string
}

func main() {
	// 创建一个 Person 的实例
	p := Person{"John Doe", 30, "Engineer"}

	// 使用 reflect 包获取对象的类型信息
	t := reflect.TypeOf(p)
	fmt.Println("Type:", t)

	// 使用 reflect 包获取对象的值信息
	v := reflect.ValueOf(p)
	fmt.Println("Value:", v)

	// 遍历结构体的字段并获取值
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		value := v.Field(i)
		fmt.Printf("Field: %s, Type: %v, Value: %v\n", field.Name, field.Type, value.Interface())
	}

	// 通过反射修改字段的值
	field := v.FieldByName("Age")
	if field.IsValid() && field.CanSet() {
		field.SetInt(31)
		fmt.Println("Updated Age:", p.Age)
	}
}
```

在这个例子中，我们定义了一个 `Person` 结构体，然后创建了一个 `Person` 类型的实例 `p`。

接着，我们使用 `reflect` 包获取了这个实例的类型信息和值信息，然后遍历结构体的字段，并输出字段的名称、类型和值。

最后，我们通过反射修改了结构体中的一个字段的值。请注意，通过反射修改字段的值需要检查字段是否有效且是否可被设置，以确保类型安全。

反射的基本原理是通过 `reflect.Type` 和 `reflect.Value` 类型，它们分别表示类型和值。

`reflect` 包提供了一组函数来检查、比较、获取字段和方法等。反射的使用需要谨慎，因为它在编译时无法进行类型检查，可能导致运行时错误。在实际应用中，应尽量避免滥用反射，只在必要的情况下使用。

## Q: go 不是编译时语言吗？为什么可以实现运行时的反射？

Go 是一种静态类型、编译型语言，这意味着在编译时会进行类型检查，并生成与目标平台相关的本地机器码。然而，Go 语言也提供了反射机制，允许在运行时检查和操作程序结构、变量和值。

这种看似矛盾的现象可以通过以下方式来解释：

1. **Interface{} 类型：** 在 Go 中，`interface{}` 类型是一种特殊的类型，它可以表示任意类型的值。因为 `interface{}` 可以容纳任意类型的值，包括用户自定义类型，所以通过将值存储在 `interface{}` 类型的变量中，可以在运行时动态地获取和处理其类型信息。

2. **reflect 包：** Go 的 `reflect` 包提供了一组函数，允许在运行时获取变量的类型信息、值信息，以及进行动态调用。通过 `reflect` 包，我们可以获得 `reflect.Type` 和 `reflect.Value` 类型，从而实现反射的功能。

虽然 Go 是编译时语言，但反射是通过在运行时处理 `interface{}` 类型和使用 `reflect` 包来实现的。这种方式允许程序在运行时动态地获取和操作类型信息，但也带来了一些潜在的性能开销和类型安全问题。在使用反射时，需要注意慎用，并确保遵循最佳实践以维护代码的可读性和性能。

# 参考资料

https://go.dev/doc/tutorial/govulncheck

* any list
{:toc}