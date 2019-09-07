---
layout: post
title: Memory 内存知识-33-提升分支预测
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Improving Branch Prediction

In section 6.2.2, two methods to improve L1i use through branch prediction and block reordering were mentioned: 

static prediction through `__builtin_expect` and profile guided optimization (PGO). Correct branch prediction has performance impacts, but here we are interested in the memory usage improvements.

The use of `__builtin_expect` (or better the likely and unlikely macros) is simple. 

The definitions are placed in a central header and the compiler takes care of the rest. 

There is a little problem, though: it is easy enough for a programmer to use likely when really unlikely was meant and vice versa. 

Even if somebody uses a tool like oprofile to measure incorrect branch predictions and L1i misses these problems are hard to detect.

## 简单的方式

There is one easy method, though. 

The code in section A.2 shows an alternative definition of the likely and unlikely macros which measure actively, at runtime, whether the static predictions are correct or not. 

The results can then be examined by the programmer or tester and adjustments can be made. 

The measurements do not actually take the performance of the program into account, they simply test the static assumptions made by the programmer. 

More details can be found, along with the code, in the section referenced above.

## PGO

这个就是根据 profile 指定生产的环境信息。

PGO is quite easy to use with gcc these days. 

It is a threestep process, though, and certain requirements must be fulfilled. 

First, all source files must be compiled with the additional -fprofile-generate option. 

This option must be passed to all compiler runs and to the command which links the program. 

Mixing object files compiled with and without this option is possible, but PGO will not do any good for those that do not have it enabled.

### 编译器 

The compiler generates a binary which behaves normally except that it is significantly larger and slower because it records (and stores) information about whether branches are taken or not. 

The compiler also emits a file with the extension `.gcno` for each input file. 

This file contains information related to the branches in the code. 

It must be preserved for later.

### 二进制可用流程

Once the program binary is available, it should be used to run a representative set of workloads. 

Whatever workload is used, the final binary will be optimized to do this task well. 

Consecutive（连续） runs of the program are possible and, in general necessary; 

all the runs will contribute to the same output file. 

- 停止之前，收集文件信息

Before the program terminates, the data collected during the program run is written out into files with the extension `.gcda`. 

These files are created in the directory which contains the source file. 

The program can be executed from any directory, and the binary can be copied, but the directory with the sources must be available and writable. 

Again, one output file is created for each input source file. 

If the program is run multiple times, it is important that the `.gcda` files of the previous run are found in the source directories since otherwise the data of the runs cannot be accumulated in one file.

### 修改是否会影响编译

When a representative set of tests has been run, it is time to recompile the application. 

当运行一组代表性测试时，是时候重新编译应用程序了。

The compiler has to be able to find the `.gcda` files in the same directory which holds the source files. 

The files cannot be moved since the compiler would not find them and the embedded checksum for the files would not match anymore. 

For the recompilation, replace the `-fprofile-generate` parameter with `-fprofile-use`. 

It is essential that the sources do not change in any way that would change the generated code. 

That means: it is OK to change white spaces and edit comments, but adding more branches or basic blocks invalidates the collected data and the compilation will fail.

这意味着：可以更改空格和编辑注释，但添加更多分支或基本块会使收集的数据无效，编译将失败。

## PGO 的局限性

This is all the programmer has to do; it is a fairly（相当） simple process. 

The most important thing to get right is the selection of representative tests to perform the measurements. 

If the test workload does not match the way the program is actually used, the performed optimizations might actually do more harm than good. 

For this reason, is it often hard to use PGO for libraries. 

Libraries can be used in many–sometimes widely different–scenarios. 

Unless the use cases are indeed similar, it is usually better to rely exclusively on static branch prediction using `__builtin_expect`.

这是程序员必须做的全部; 这是一个相当简单的过程。

要做到最重要的是选择代表性测试来执行测量。

如果测试工作负载与实际使用程序的方式不匹配，那么执行的优化实际上可能弊大于利。

出于这个原因，通常很难将PGO用于库。

库可用于许多 - 有时是广泛不同的场景。

除非用例确实相似，否则通常最好完全依赖于使用`__builtin_expect`的静态分支预测。

A few words on the .gcno and .gcda files. 

These are binary files which are not immediately usable for inspection. 

It is possible, though, to use the gcov tool, which is also part of the gcc package, to examine them. 

This tool is mainly used for coverage analysis (hence the name) but the file format used is the same as for PGO. 

The gcov tool generates output files with the extension .gcov for each source file with executed code (this might include system headers). 

The files are source listings which are annotated, according to the parameters given to gcov, with branch counter, probabilities, etc.

# 参考资料

P86

* any list
{:toc}