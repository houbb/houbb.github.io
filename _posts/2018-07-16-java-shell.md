---
layout: post
title:  Java Shell 
date:  2018-07-16 17:30:16 +0800
categories: [Java]
tags: [java, shell, cmd]
published: true
---

# Java 调用 shell

有时候我们在Linux中运行Java程序时，需要调用一些Shell命令和脚本。

而 `Runtime.getRuntime().exec()` 方法给我们提供了这个功能，而且Runtime.getRuntime()给我们提供了以下几种exec()方法：

## 方法列表

```java
// 在单独的进程中执行指定的字符串命令。 
Process exec(String command) 

// 在单独的进程中执行指定命令和变量。 
Process exec(String[] cmdarray) 

// 在指定环境的独立进程中执行指定命令和变量。 
Process exec(String[] cmdarray, String[] envp) 

// 在指定环境和工作目录的独立进程中执行指定的命令和变量。 
Process exec(String[] cmdarray, String[] envp, File dir) 

// 在指定环境的单独进程中执行指定的字符串命令。 
Process exec(String command, String[] envp) 

// 在有指定环境和工作目录的独立进程中执行指定的字符串命令。 
Process exec(String command, String[] envp, File dir) 
```

其中，其实cmdarray和command差不多，同时如果参数中如果没有envp参数或设为null，表示调用命令将在当前程序执行的环境中执行；
如果没有dir参数或设为null，表示调用命令将在当前程序执行的目录中执行，因此调用到其他目录中的文件和脚本最好使用绝对路径。

## 参数

各个参数的含义：

- cmdarray: 包含所调用命令及其参数的数组。 

- command: 一条指定的系统命令。

- envp: 字符串数组，其中每个元素的环境变量的设置格式为name=value；如果子进程应该继承当前进程的环境，则该参数为 null。

- dir: 子进程的工作目录；如果子进程应该继承当前进程的工作目录，则该参数为 null。 

## 其他方法

```java
// 导致当前线程等待，如有必要，一直要等到由该 Process 对象表示的进程已经终止。 
abstract  int waitFor() 
```

```java
// 获取子进程的输入流。 最好对输入流进行缓冲。
abstract InputStream  getInputStream() 
```

# 调用 Shell 命令

这里为了说明问题，我仅用 `tar` 命令进行演示。tar 命令是一个打包而不进行压缩的命令。

同时，为了检查 tar 的调用是否被正常执行，我将调用 waitFor() 方法。

```java
private void callCMD(String tarName, String fileName, String... workspace){
	try {
		String cmd = "tar -cf" + tarName + " " + fileName;
//            String[] cmd = {"tar", "-cf", tarName, fileName};
		File dir = null;
		if(workspace[0] != null){
			dir = new File(workspace[0]);
			System.out.println(workspace[0]);
		}
		process = Runtime.getRuntime().exec(cmd, null, dir);
//          process = Runtime.getRuntime().exec(cmd);
		int status = process.waitFor();
		if(status != 0){
			System.err.println("Failed to call shell's command and the return status's is: " + status);
		}
	}
	catch (Exception e){
		e.printStackTrace();
	}
}
```

注意：如果把命令放到一个 String[] 中时，必须把命令中每个部分作为一个元素存在 String[] 中，或者是把命令按照空格符分割得到的 String[]。

```java
String[] cmd = {"tar", "-cf", tarName, fileName};		//right
String[] cmd = {"tar -cf", tarName, fileName};			//error
```

# 调用 shell 脚本

Java调用 Shell 命令和调用 Shell 脚本的操作一模一样。我这里介绍另外几个方面：

- 给脚本传递参数；

- 捕获调用的输出结果；

- envp的使用。


给脚本传递参数，这个操作很简单，无非是把参数加到调用命令后面组成String，或String[]。

捕获调用输出信息，前面也提到过用 `Process.getInputStream()`。不过，建议最好对输入流进行缓冲：

```java
BufferedReader input = new BufferedReader(new InputStreamReader(process.getInputStream()));
```

我要调用的Shell脚本是：`/root/experiment/test.sh`

```sh
#!/usr/bin/env bash
 
args=1
if [ $# -eq 1 ];then
	args=$1
	echo "The argument is: $args"
fi
 
echo "This is a $call"
start=`date +%s`
sleep 3s
end=`date +%s`
cost=$((($end - $start) * $args * $val))
echo "Cost Time: $cost"
```

Java 调用代码是：

```java
private void callScript(String script, String args, String... workspace){
	try {
		String cmd = "sh " + script + " " + args;
//        	String[] cmd = {"sh", script, "4"};
		File dir = null;
		if(workspace[0] != null){
			dir = new File(workspace[0]);
			System.out.println(workspace[0]);
		}
		String[] evnp = {"val=2", "call=Bash Shell"};
		process = Runtime.getRuntime().exec(cmd, evnp, dir);
//            process = Runtime.getRuntime().exec(cmd);
		BufferedReader input = new BufferedReader(new InputStreamReader(process.getInputStream()));
		String line = "";
		while ((line = input.readLine()) != null) {
			System.out.println(line);
		}
		input.close();
	}
	catch (Exception e){
		e.printStackTrace();
	}
}
 
public static void main(String[] args) {
	// TODO Auto-generated method stub
	CallShell call = new CallShell();
	call.callScript("test.sh", "4", "/root/experiment/");
}
```

- output

```
/root/experiment/
The argument is: 4
This is a Bash Shell
Cost Time: 24
```

# 参考文章

[Java调用Shell命令和脚本](https://blog.csdn.net/u010376788/article/details/51337312)

* any list
{:toc}