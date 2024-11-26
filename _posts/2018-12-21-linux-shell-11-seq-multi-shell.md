---
layout: post
title: linux Shell 命令行-11-linux 如何顺序执行多个 shell 脚本？ linux 命令？
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
---

# 拓展阅读

[linux Shell 命令行-00-intro 入门介绍](https://houbb.github.io/2018/12/21/linux-shell-01-intro)

[linux Shell 命令行-02-var 变量](https://houbb.github.io/2018/12/21/linux-shell-02-var)

[linux Shell 命令行-03-array 数组](https://houbb.github.io/2018/12/21/linux-shell-03-array)

[linux Shell 命令行-04-operator 操作符](https://houbb.github.io/2018/12/21/linux-shell-04-operator)

[linux Shell 命令行-05-test 验证是否符合条件](https://houbb.github.io/2018/12/21/linux-shell-05-test)

[linux Shell 命令行-06-flow control 流程控制](https://houbb.github.io/2018/12/21/linux-shell-06-flow-control)

[linux Shell 命令行-07-func 函数](https://houbb.github.io/2018/12/21/linux-shell-07-func)

[linux Shell 命令行-08-file include 文件包含](https://houbb.github.io/2018/12/21/linux-shell-08-file-include)

[linux Shell 命令行-09-redirect 重定向](https://houbb.github.io/2018/12/21/linux-shell-09-redirect)

# 场景

希望顺序执行多个 shell 命令。

# 实现方式

在 Linux Shell 脚本中，可以通过使用逻辑操作符 `&&` 来确保只有第一个命令成功后才执行第二个命令。

```sh
#!/bin/bash

# 第一个命令
command1 && command2
```

command1 成功执行（返回值为 0），则执行 command2。

如果 command1 失败（返回值不为 0），则 command2 不会被执行。

# 增强版本

如果需要在 command1 失败时输出错误信息并中断脚本，可以使用以下方式：

```sh
#!/bin/bash

# 第一个命令
command1
if [ $? -ne 0 ]; then
    echo "command1 执行失败，脚本中断。"
    exit 1
fi

# 第二个命令
command2
```

# 换行的方式要怎么写？

在 Linux Shell 脚本中，如果需要用 `&&` 将多个命令换行写，可以使用 反斜杠 `\` 来表示命令未结束，让脚本更整齐易读。

```sh
#!/bin/bash

command1 && \
command2 && \
command3
```

解释：

反斜杠 `\` 用于连接换行的命令，表示当前命令未结束。

每一行的最后都需要加 `\`，除了最后一行。

## 实际案例：

假设你要依次启动三个服务，确保前一个服务启动成功后才启动下一个：

```sh
#!/bin/bash

echo "启动服务1..." && \
service service1 start && \
echo "服务1已启动成功" && \
service service2 start && \
echo "服务2已启动成功" && \
service service3 start && \
echo "服务3已启动成功"
```

# windows 生成文件，上传到 linux，报错

## 现象

windows 为什么我把启动文件多行命令放在一个文件中，然后上传到 linux。

执行报错：

```sh
/xxx/seatunnel.sh --config 1.conf && \
/xxx/seatunnel.sh --config 2.conf && \
/xxx/seatunnel.sh --config 3.conf
```

但是命令行提示 `$'\r' command not found`

## 原因

你遇到的错误 `command not found` 并且提示 `$'\r'`，通常是因为文件中存在 Windows 风格的换行符（`\r\n`），而 Linux 系统只支持 Unix 风格的换行符（`\n`）。

在 Windows 上创建的脚本文件会在每行的末尾包含一个 `\r` 字符，这会导致 Linux 在执行脚本时无法识别命令。

## 解决方法：

### 1. **使用 `dos2unix` 工具**

在 Linux 上，可以使用 `dos2unix` 工具将文件中的 Windows 风格的换行符（`\r\n`）转换为 Unix 风格的换行符（`\n`）。

```bash
dos2unix your_script.sh
```

运行此命令后，脚本文件的换行符就会被转换，问题应该得到解决。

### 2. **使用 `sed` 命令移除 `\r` 字符**

如果你没有安装 `dos2unix` 工具，也可以使用 `sed` 来去除文件中的 `\r` 字符：

```bash
sed -i 's/\r//g' your_script.sh
```

- `-i` 表示直接修改文件。
- `'s/\r//g'` 表示替换所有的 `\r` 字符为空。

### 3. **使用 `vim` 或 `vi` 编辑器**

如果你喜欢手动修改文件，可以在 `vim` 或 `vi` 编辑器中打开文件，然后去除 `\r` 字符。

1. 打开文件：
   ```bash
   vim your_script.sh
   ```
2. 输入命令去除 `\r` 字符：
   ```
   :set ff=unix
   ```
3. 保存并退出：
   ```
   :wq
   ```

这会将文件的换行符从 Windows 风格（`\r\n`）转换为 Unix 风格（`\n`）。

### 总结

- 错误 `$'\r' command not found` 是由于脚本文件中含有 Windows 风格的换行符（`\r\n`）。

- 解决方法是使用 `dos2unix` 工具，或者使用 `sed` 去除 `\r`，或者在 `vim` 中将文件的换行符格式修改为 Unix 风格。

执行完这些步骤后，再次运行脚本，应该就不会出现 `$'\r' command not found` 错误了。

# chat

## 多行 &&，不加与否的区别

我如果只是将一行行命令放在shell文本中  不加最后的 &&，然后直接 ./x.sh 执行，是不是也是一样的效果？就是命令会一行行执行

是的，直接将命令按行写入脚本文件，然后执行脚本（例如使用 `./x.sh`），命令会一行行依次执行，类似于使用 `&&` 连接命令的效果，但是行为上有一些区别：

### 1. **没有 `&&` 连接：**

如果你没有使用 `&&` 来连接命令，而是简单地将每个命令写在不同的行中，Shell 会按顺序执行每一行命令，类似于逐条执行，但它们之间没有显式的依赖关系。

例如，`x.sh` 文件如下：

```bash
#!/bin/bash

/xxx/seatunnel.sh --config 1.conf
/xxx/seatunnel.sh --config 2.conf
/xxx/seatunnel.sh --config 3.conf
```

- 这里，`seatunnel.sh --config 1.conf` 会先执行。
- 然后，`seatunnel.sh --config 2.conf` 会执行，紧接着执行 `seatunnel.sh --config 3.conf`。

每一行命令都会按顺序执行，**即使前面的命令失败，后面的命令也会继续执行**。

### 2. **与使用 `&&` 的区别：**

当你使用 `&&` 时，后续的命令只有在前一个命令成功执行（返回值为 0）时才会继续执行。

例如：

```bash
#!/bin/bash

/xxx/seatunnel.sh --config 1.conf && \
/xxx/seatunnel.sh --config 2.conf && \
/xxx/seatunnel.sh --config 3.conf
```

- 这里，`seatunnel.sh --config 1.conf` 会首先执行。
- 如果它成功执行（返回 0），那么 `seatunnel.sh --config 2.conf` 会继续执行。
- 如果第二个命令也成功，第三个命令才会执行。

如果任何一个命令失败（返回非零状态），后面的命令将不会执行。

### 3. **总结：**

- **没有 `&&`**：每个命令都会执行，前面的命令是否成功都不影响后续命令执行。
- **使用 `&&`**：命令之间有依赖关系，只有当前一个命令成功（返回 0），后续命令才会执行。

### 4. **行为对比示例：**

假设你希望只有在第一个命令成功后才执行第二个命令，你应该使用 `&&`：

```bash
#!/bin/bash

/xxx/seatunnel.sh --config 1.conf && /xxx/seatunnel.sh --config 2.conf && /xxx/seatunnel.sh --config 3.conf
```

如果没有 `&&`，并且第一个命令失败，第二个和第三个命令仍然会执行：

```bash
#!/bin/bash

/xxx/seatunnel.sh --config 1.conf
/xxx/seatunnel.sh --config 2.conf
/xxx/seatunnel.sh --config 3.conf
```

因此，选择是否使用 `&&` 取决于你是否需要对命令的执行结果进行控制，确保前一个命令成功后再执行下一个命令。

如果你不关心命令的失败与否，可以直接按行写命令。

# 参考资料

https://www.runoob.com/linux/linux-shell.html

* any list
{:toc}