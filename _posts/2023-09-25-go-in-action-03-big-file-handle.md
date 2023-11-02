---
layout: post
title: go 实现日志采集-03-如何实现大文件的读取？
date: 2023-09-25 21:01:55 +0800
categories: [Go]
tags: [monitor, go, log-collect, sh]
published: true
---


# 读取

Golang 操作文件的读取的方法很多,适用的场景也是各不相同,在此我们将文件的读取分为如下几种 :

- 文件整体读取

- 文件分片读取(块级读取)

- 文件行级读取

# 1. 文件整体读取

文件整体读取就是将文件一次性读取到,理解上是将文件的内容第一次就读取完了

使用场景 :

针对小文件比较合适(大文件读取空间和时间的消耗也很大)

对于整体性强的文件也比较合适(文件也不能太大)

## 代码示例1

```go
package main

import (
	"bufio"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"time"
)
// 测试用的文本文件11M大小
var m11 string = `G:\runtime\log\ccapi\11M.log`
// 测试用的文本文件400M大小
var m400 string = `G:\runtime\log\ccapi\400M.log`

// 将整个文件都读取
func readAll(filePath string) {
	start1 := time.Now()
	ioutil.ReadFile(filePath)
	fmt.Println("readAll spend : ", time.Now().Sub(start1))
}
func main() {
	readAll(m11)
	readAll(m400)
}
```

耗时

```
$ go run main.go
readAll spend :  6.9999ms
readAll spend :  358.8014ms
```

## 代码示例2

也可以通过 buffer，不过直接把 buffer 设置为 file 大小。

```go
package main

import (
	"bufio"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"time"
)
// 测试用的文本文件11M大小
var m11 string = `G:\runtime\log\ccapi\11M.log`
// 测试用的文本文件400M大小
var m400 string = `G:\runtime\log\ccapi\400M.log`
// 将文件完整读取
func readAllBuff(filePath string) {
	start1 := time.Now()
	// 打开文件
	FileHandle, err := os.Open(filePath)
	if err != nil {
		log.Println(err)
		return
	}
	// 关闭文件
	defer FileHandle.Close()
	// 获取文件当前信息
	fileInfo, err := FileHandle.Stat()
	if err != nil {
		log.Println(err)
		return
	}
	buffer := make([]byte, fileInfo.Size())
	// 读取文件内容,并写入buffer中
	n, err := FileHandle.Read(buffer)
	if err != nil {
		log.Println(err)
	}
	// 打印所有切片中的内容
	fmt.Println(string(buffer[:n]))
	fmt.Println("readAllBuff spend : ", time.Now().Sub(start1))
}
func main() {
	readAllBuff(m11)
	readAllBuff(m400)
}
```

# 2. 文件分片读取

对文件一部分一部分逐步的读取,直到文件完全读取完

PS : 每次读取文件的大小是根据设置的 分片 大小 ,所以对于读取文本类型的文件时(例如 : 日志文件)

不一定是按照你的期望逐行输出,因为不会处理文本尾部的换行符,而是按照分片大小读取内容

使用场景 :

读取超大的文件很合适

读二进制类型的文件很合适(比如:音视频文件或者资源类型文件等)

## 代码示例

```go
package main

import (
	"bufio"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"time"
)
// 测试用的文本文件11M大小
var m11 string = `G:\runtime\log\ccapi\11M.log`
// 测试用的文本文件400M大小
var m400 string = `G:\runtime\log\ccapi\400M.log`
// 文件一块一块的读取
func readBlock(filePath string) {
	start1 := time.Now()
	FileHandle, err := os.Open(filePath)
	if err != nil {
		log.Println(err)
		return
	}
	defer FileHandle.Close()
    // 设置每次读取字节数
	buffer := make([]byte, 1024)
	for {
		n, err := FileHandle.Read(buffer)
		// 控制条件,根据实际调整
		if err != nil && err != io.EOF {
			log.Println(err)
		}
		if n == 0 {
			break
		}
		// 如下代码打印出每次读取的文件块(字节数)
		//fmt.Println(string(buffer[:n]))
	}
	fmt.Println("readBolck spend : ", time.Now().Sub(start1))
}
func main() {
	readBlock(m11)
	readBlock(m400)
}
```

耗时：

```
$ go run main.go
readBolck spend :  31.9814ms
readBolck spend :  1.0889488s
```

# 3. 文件逐行读取

对文件一行一行的读取,直到读到文件末尾

使用场景 :

1) 读取超大的文件很合适(例如 : 超大log文件等)

2) 读取的文件最好是有换行的(如果使用单行文件组成的大文件,需要注意)

3) 对需要分析内容的大文件

	统计某些数据出现的次数
	查询某些数据是否存在
	查找指定行的数据

## 示例代码1

```go
package main

import (
	"bufio"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"time"
)
// 测试用的文本文件11M大小
var m11 string = `G:\runtime\log\ccapi\11M.log`
// 测试用的文本文件400M大小
var m400 string = `G:\runtime\log\ccapi\400M.log`
// 读取文件的每一行
func readEachLineReader(filePath string) {
	start1 := time.Now()
	FileHandle, err := os.Open(filePath)
	if err != nil {
		log.Println(err)
		return
	}
	defer FileHandle.Close()
	lineReader := bufio.NewReader(FileHandle)
	for {
        // 相同使用场景下可以采用的方法
		// func (b *Reader) ReadLine() (line []byte, isPrefix bool, err error)
		// func (b *Reader) ReadBytes(delim byte) (line []byte, err error)
		// func (b *Reader) ReadString(delim byte) (line string, err error)
		line, _, err := lineReader.ReadLine()
		if err == io.EOF {
			break
		}
		// 如下是某些业务逻辑操作
		// 如下代码打印每次读取的文件行内容
		fmt.Println(string(line))
	}
	fmt.Println("readEachLineReader spend : ", time.Now().Sub(start1))
}
func main(){
    readEachLineReader(m11)
	readEachLineReader(m400)
}
```

耗时：

```
$ go run main.go
readEachLineReader spend :  16.9902ms
readEachLineReader spend :  537.9683ms
```

## 代码示例2

```go
package main

import (
	"bufio"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"time"
)
// 测试用的文本文件11M大小
var m11 string = `G:\runtime\log\ccapi\11M.log`
// 测试用的文本文件400M大小
var m400 string = `G:\runtime\log\ccapi\400M.log`
// 读取文件的每一行
func readEachLineScanner(filePath string) {
	start1 := time.Now()
	FileHandle, err := os.Open(filePath)
	if err != nil {
		log.Println(err)
		return
	}
	defer FileHandle.Close()
	lineScanner := bufio.NewScanner(FileHandle)
	for lineScanner.Scan() {
        // 相同使用场景下可以使用如下方法
		// func (s *Scanner) Bytes() []byte
		// func (s *Scanner) Text() string
		// 实际逻辑 : 对读取的内容进行某些业务操作
		// 如下代码打印每次读取的文件行内容
		fmt.Println(lineScanner.Text())
	}
	fmt.Println("readEachLineScanner spend : ", time.Now().Sub(start1))
}
func main() {
	readEachLineScanner(m11)
	readEachLineScanner(m400)
}
```

耗时：

```
$ go run main.go
readEachLineScanner spend :  17.9895ms
readEachLineScanner spend :  574.1722ms
```

# 4. 总结

面试中常见的类似超大文件读取的问题,通常我们**采用分片读取或者逐行读取的方案即可**

大文件的上传也可以采用类似的解决方案 , 每次读取文件的部分内容上传(写入)网络接口中,直至文件读取完毕
普通的小文件并且对内容没有太多操作的,可以采用整体读取,速度相对较快

对文件内容有操作的采用分片读取和逐行读取更合适

二进制类型文件采用分片读取或者整体读取的方案比较合适

文件读取不仅是本地文件,要读去网络上的文件(各种文档,音视频,图片,和其他各种类型文件)时要访问到文件获取 io.ReadCloser 或者 io.Reader 后可以采用三种方式将文件内容读取到

```go
func ReadAll(r io.Reader) ([]byte, error) 文件完整读取
func Copy(dst Writer, src Reader) (written int64, err error) 文件读取并写入
```


# 参考资料

https://blog.csdn.net/weixin_37717557/article/details/106482955

https://cloud.tencent.com/developer/article/2276808

https://www.zytops.com/articles/2022/11/30/1669789125287.html

https://www.jianshu.com/p/a2c34894b1f1

https://juejin.cn/s/golang%E8%AF%BB%E5%8F%96%E5%A4%A7%E6%96%87%E4%BB%B6

https://www.cnblogs.com/cheyunhua/p/15761833.html

https://juejin.cn/s/go%E9%80%90%E8%A1%8C%E8%AF%BB%E5%8F%96%E6%96%87%E4%BB%B6

https://xie.infoq.cn/article/8ec07cd411a0dc03378520a70

https://github.com/astaxie/build-web-application-with-golang/issues/578


* any list
{:toc}