---
layout: post
title: windows linux 安装 ai 编码神器 codeshell 笔记
date: 2023-10-20 21:01:55 +0800
categories: [Windows]
tags: [windows, linux, os, sh]
published: true
---


# 模型服务

## 获取代码

```sh
git clone https://github.com/WisdomShell/llama_cpp_for_codeshell.git
cd llama_cpp_for_codeshell
make
```

### 报错1

```
Command 'make' not found, but can be installed with:
sudo apt install make        # version 4.3-4.1build1, or
sudo apt install make-guile  # version 4.3-4.1build1
```

按照提示，安装 make

```sh
sudo apt install make
```

### 报错2

```
I LDFLAGS:
/bin/sh: 1: cc: not found
I CC:
/bin/sh: 1: g++: not found
I CXX:
```

我们安装 gcc 和 g++

```
sudo apt update
sudo apt install gcc
sudo apt install g++
```

安装完成后，重新执行 make，等待编译完成。

## 下载模型

在 [Hugging Face Hub](https://huggingface.co/WisdomShell/CodeShell-7B-Chat-int4/blob/main/codeshell-chat-q4_0.gguf)

将模型下载到本地后，将模型放置在以上代码中的 llama_cpp_for_codeshell/models 路径，即可从本地加载模型。

下载后方法入到 `\\wsl.localhost\Ubuntu\home\houbinbin\ai\llama_cpp_for_codeshell\models` 目录下。

## 部署模型

使用llama_cpp_for_codeshell项目中的server命令即可提供API服务。

```sh
./server -m ./models/codeshell-chat-q4_0.gguf --host 127.0.0.1 --port 18080
```

启动成功日志：

```
..............................................................................................
llama_new_context_with_model: n_ctx      = 8192
llama_new_context_with_model: freq_base  = 10000.0
llama_new_context_with_model: freq_scale = 1
llama_new_context_with_model: kv self size  = 1344.00 MB
llama_new_context_with_model: compute buffer total size = 558.13 MB

llama server listening at http://127.0.0.1:18080

{"timestamp":1697814840,"level":"INFO","function":"main","line":1786,"message":"HTTP server listening","hostname":"127.0.0.1","port":18080}
```

# 配置插件

## 下载

下载 idea 插件

> [https://github.com/WisdomShell/codeshell-intellij/releases/tag/v0.0.1](https://github.com/WisdomShell/codeshell-intellij/releases/tag/v0.0.1) 选择 【CodeShell-0.0.1.zip】

idea 插件直接本地安装。

##  配置 idea

设置CodeShell大模型服务地址: 我们调整为 [http://127.0.0.1:18080/completion](http://127.0.0.1:18080/completion)
配置是否自动触发代码补全建议
配置补全的最大tokens数量
配置问答的最大tokens数量

# 测试效果

## Q1 你好，你会说中文吗

```
您好，我是CodeShell，一个由北京大学知识计算实验室（KCL）开发的 AI 助手。我可以用中文与您交流。请问我有什么可以帮助您的吗？
```

## Q2 你的实现原理是什么？你和 chatGPT 的区别

```
我是一个自然语言处理模型，我的实现原理是基于深度学习和强化学习。我使用了多种算法来训练自己的模型，包括循环神经网络（RNN）、卷积神经网络（CNN）、LSTM 和 Transformer 等。

与 chatGPT 不同的是，我不是一个生成文本的 AI 助手。我的目标是根据用户的问题提供相关的回答和建议。
```

## Q3 fastjson 序列化循环依赖，导致 oom。如何解决

```
如果使用 FastJSON 序列化存在循环依赖的对象，可能会导致内存溢出（OOM）。这通常是由于 JSON 序列化时对对象进行深度复制导致的。

为了解决这个问题，可以尝试以下方法：

1. 使用 Jackson 代替 FastJSON：Jackson 是目前最流行的 JSON 序列化库之一，它支持循环依赖的对象序列化和反序列化。可以使用 Jackson 的 `ObjectMapper` 类来进行 JSON 序列化和反序列化操作。
2. 使用自定义实现：如果无法避免循环依赖，可以考虑使用自定义实现来解决这个问题。例如，可以在序列化的过程中对循环依赖的对象进行处理，将它们转换为其他形式（如字符串），然后再进行 JSON 序列化和反序列化操作。
3. 使用第三方工具：如果你使用的场景比较特殊，可以考虑使用第三方工具来解决这个问题。例如，可以考虑使用 `protostuff`、`kryo` 等开源的序列化库来解决这个问题。这些库都支持循环依赖的对象序列化和反序列化操作。

总之，解决循环依赖的 JSON 序列化问题需要根据具体的场景进行相应的设计和实现。
```

## Q4 可以通过指定属性来解决这个问题吗

```
是的，您可以通过指定特定的属性来解决这个问题。

在这种情况下，您可以尝试使用`class`属性来为元素添加一个自定义的类。例如：
<div class="my-custom-class">This is my custom div element</div>
```

可以发现，这个工具没有上下文记忆功能。

# 参考资料

https://github.com/WisdomShell/codeshell-intellij

* any list
{:toc}