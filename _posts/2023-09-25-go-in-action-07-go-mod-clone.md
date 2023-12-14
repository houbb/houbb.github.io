---
layout: post
title: go in action-07-go mod 和 vendor 的方式
date: 2023-09-25 21:01:55 +0800
categories: [Go]
tags: [monitor, go, go-lang, in-action, sh]
published: true
---

# go mod tidy 


这个命令会对包进行处理，下载到 

```
go env
```

查看

```
set GOMODCACHE=C:\Users\dh\go\pkg\mod
```

会把对应的依赖包下载到 GOMODCACHE 对应的 `C:\Users\dh\go\pkg\mod` 这个目录下面。

这里 包含了包的控制，感觉无法使用 vendor 的方式直接使用。

# git clone 的方式

```go
import (
	"fmt"
	"log"

	"github.com/neo4j/neo4j-go-driver/v4"
)
```

比如我们依赖了 `github.com/neo4j/neo4j-go-driver/v4` 这个包

我们可以把包直接 clone 下来

```
git@github.com:neo4j/neo4j-go-driver.git
```

切换到 v4 分支：

```
cd .\neo4j-go-driver\
```

切换到 v4 分支，更新代码。

此时，整个项目下的 neo4j 是我们需要的东西，注意，这里是没有版本的概念的。 


# 参考资料

chat

* any list
{:toc}
