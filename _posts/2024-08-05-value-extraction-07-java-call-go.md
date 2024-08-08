---
layout: post
title: 字符串值提取工具-07-java 调用 go
date: 2024-08-05 21:01:55 +0800
categories: [Java]
tags: [java, open-source, tool, sh]
published: true
---

# 场景

我们希望通过 java 执行 go ，如何实现呢?

## 说明

基本等同于不支持，忽略。

# chat

## Q: java 执行 go

Java 本身并不直接支持执行 Go 语言代码，因为它们是两种不同的编程语言，拥有不同的运行时环境和编译器。然而，你可以通过以下几种方法在 Java 中执行 Go 代码：

1. **通过系统命令调用 Go 程序**：你可以编写一个 Go 程序，将其编译成可执行文件，然后通过 Java 使用 `Runtime.getRuntime().exec` 或 `ProcessBuilder` 来运行该可执行文件。

2. **使用 JNI (Java Native Interface)**：你可以将 Go 代码编译成共享库（如 `.so` 或 `.dll` 文件），然后使用 JNI 在 Java 中调用这些本地库。这需要在 Go 代码中编写导出函数，并在 Java 中使用 `System.loadLibrary` 加载库。

3. **通过网络通信**：如果你的 Go 代码可以作为一个服务运行（例如，通过 HTTP 或 gRPC），你可以在 Java 中通过网络请求与该服务进行通信。

### 1. 通过系统命令调用 Go 程序

首先编写一个简单的 Go 程序，例如 `hello.go`：

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello from Go")
}
```

然后编译这个 Go 程序：

```sh
go build hello.go
```

接下来，在 Java 中使用 `Runtime.getRuntime().exec` 或 `ProcessBuilder` 来运行这个 Go 可执行文件：

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class RunGoProgram {
    public static void main(String[] args) {
        try {
            // 执行 Go 程序
            ProcessBuilder processBuilder = new ProcessBuilder("./hello");
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();
            
            // 读取 Go 程序的输出
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
            
            // 等待进程结束
            int exitCode = process.waitFor();
            System.out.println("Exited with code: " + exitCode);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### 2. 使用 JNI 调用 Go 代码

首先编写一个导出函数的 Go 代码，例如 `hello.go`：

```go
package main

import "C"
import "fmt"

//export SayHello
func SayHello() {
    fmt.Println("Hello from Go")
}

func main() {}
```

然后将其编译为共享库：

```sh
go build -o libhello.so -buildmode=c-shared hello.go
```

接下来，在 Java 中使用 JNI 加载并调用这个共享库：

```java
public class RunGoWithJNI {
    static {
        System.loadLibrary("hello");
    }

    // 声明本地方法
    public native void sayHello();

    public static void main(String[] args) {
        new RunGoWithJNI().sayHello();
    }
}
```

### 3. 通过网络通信

编写一个提供 HTTP 服务的 Go 程序，例如 `server.go`：

```go
package main

import (
    "fmt"
    "net/http"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello from Go")
}

func main() {
    http.HandleFunc("/hello", helloHandler)
    http.ListenAndServe(":8080", nil)
}
```

然后在 Java 中通过 HTTP 请求与该服务进行通信：

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class CallGoService {
    public static void main(String[] args) {
        try {
            URL url = new URL("http://localhost:8080/hello");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            String inputLine;
            StringBuilder content = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }

            in.close();
            connection.disconnect();

            System.out.println("Response from Go service: " + content.toString());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

以上是三种在 Java 中执行 Go 代码的常见方法，根据具体需求选择适合的方法。


# 参考资料

* any list
{:toc}