---
layout: post
title: linux Shell 命令行-08-file include 文件包含
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
---

# 文件包含

- data.sh

```bash
#!/bin/sh

name="houbinbin"
```

- include.sh

使用 ```. ./data.sh``` 或者 ```source ./data.sh``` 来包含文件

```bash
#!/bin/sh

source ./data.sh

echo "姓名是: $name"
```

运行

```bash
houbinbindeMacBook-Pro:shell houbinbin$ chmod +x include.sh
houbinbindeMacBook-Pro:shell houbinbin$ ./include.sh
姓名是: houbinbin
```

# 参考资料

https://www.runoob.com/linux/linux-shell.html

* any list
{:toc}