---
layout: post
title:  Mock Server
date:  2017-11-3 09:39:47 +0800
categories: [Test]
tags: [mock]
published: true
---




# Mock Server

本来想学习一下自动化测试相关的东西，刚好看到了 [Mock Server](http://www.mock-server.com/)。

比较感兴趣，就学习一下。


- 作用

类似于 [powermock](https://github.com/powermock/powermock) 在我们写单元测试中的功能，可以模拟反馈。

![2017-11-03-mock-server.png](https://raw.githubusercontent.com/houbb/resource/master/img/test/mock/2017-11-03-mock-server.png)


## 工具推荐

- On line

[http://easy-mock.com/](http://easy-mock.com/)

- Github lib

[https://github.com/jamesdbloom/mockserver](https://github.com/jamesdbloom/mockserver)

[https://github.com/dreamhead/moco](https://github.com/dreamhead/moco)


# moco

[Moco](https://github.com/dreamhead/moco) is an easy setup stub framework.


## Quick Start


- Download

[Standalone Moco Runner](http://central.maven.org/maven2/com/github/dreamhead/moco-runner/0.11.1/moco-runner-0.11.1-standalone.jar)

将得到一个 `moco-runner-0.11.1-standalone.jar`

- foo.json

新建一个 `foo.json` 文件和上面的 jar 放在同级目录。内容如下：

```json
[
  {
    "response" :
      {
        "text" : "Hello, Moco"
      }
  }
]
```

- Start

```
java -jar moco-runner-<version>-standalone.jar http -p 12306 -c foo.json
```

- Visit

浏览器访问 [http://localhost:12306](http://localhost:12306)，你将看到 "Hello, Moco"





* any list
{:toc}












 

