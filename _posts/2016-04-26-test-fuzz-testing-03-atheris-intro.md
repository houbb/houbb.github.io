---
layout: post
title:  test fuzz-03-模糊测试 Atheris A Coverage-Guided, Native Python Fuzzer 
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, test]
published: true
---

# 拓展阅读

[开源 Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[开源 Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)

[test fuzz-01-模糊测试（Fuzz Testing）](https://houbb.github.io/2016/04/26/test-fuzz-testing-01-overview)

[test fuzz-02-模糊测试 JQF + Zest Semantic Fuzzing for Java](https://houbb.github.io/2016/04/26/test-fuzz-testing-02-jqf-intro)

[test fuzz-03-模糊测试 Atheris A Coverage-Guided, Native Python Fuzzer](https://houbb.github.io/2016/04/26/test-fuzz-testing-03-atheris-intro)

[test fuzz-04-模糊测试 jazzer Coverage-guided, in-process fuzzing for the JVM](https://houbb.github.io/2016/04/26/test-fuzz-testing-04-jazzer-intro)

[test fuzz-05-模糊测试 kelinci AFL-based fuzzing for Java](https://houbb.github.io/2016/04/26/test-fuzz-testing-05-kelinci-intro)

[test fuzz-06-模糊测试 AFL american fuzzy lop - a security-oriented fuzzer](https://houbb.github.io/2016/04/26/test-fuzz-testing-06-AFL)

[test fuzz-07-模糊测试 libfuzzer](https://houbb.github.io/2016/04/26/test-fuzz-testing-07-libfuzzer)

# Atheris

Atheris: 一个基于覆盖率引导的本地 Python Fuzzer

Atheris是一个基于覆盖率引导的Python模糊引擎。它支持对Python代码的模糊测试，还支持为CPython编写的本地扩展。Atheris基于libFuzzer。在模糊测试本地代码时，可以与Address Sanitizer或Undefined Behavior Sanitizer结合使用，以捕获额外的错误。

## 安装说明

Atheris支持Linux（32位和64位）和Mac OS X，Python版本3.6-3.10。

你可以使用pip安装预构建版本的Atheris：

```bash
pip3 install atheris
```

这些安装包带有内置的libFuzzer，适用于对Python代码进行模糊测试。如果你计划对本地扩展进行模糊测试，可能需要从源代码构建，以确保Atheris中的libFuzzer版本与你的Clang版本匹配。

### 从源代码构建

Atheris依赖于libFuzzer，该库随Clang一起分发。如果你的路径上有足够新版本的`clang`，则从源代码安装就像这样简单：

```bash
# 从源代码构建最新版本
pip3 install --no-binary atheris atheris
# 从源代码构建开发代码
git clone https://github.com/google/atheris.git
cd atheris
pip3 install .
```

如果你没有安装`clang`或者它太旧，你需要下载并构建LLVM的最新版本。请按照下面的“安装新版本的LLVM”说明进行操作。

#### Mac

Apple Clang不包含libFuzzer，因此你需要安装来自head的新版本的LLVM。请按照下面的“安装新版本的LLVM”说明进行操作。

#### 安装新版本的LLVM

```bash
# 构建LLVM
git clone https://github.com/llvm/llvm-project.git
cd llvm-project
mkdir build
cd build
cmake -DLLVM_ENABLE_PROJECTS='clang;compiler-rt' -G "Unix Makefiles" ../llvm
make -j 10  # 这一步非常慢

# 安装Atheris
CLANG_BIN="$(pwd)/bin/clang" pip3 install <whatever>
```

## 使用Atheris

### 示例

```python
#!/usr/bin/python3

import atheris

with atheris.instrument_imports():
  import some_library
  import sys

def TestOneInput(data):
  some_library.parse(data)

atheris.Setup(sys.argv, TestOneInput)
atheris.Fuzz()
```

在对Python进行模糊测试时，如果被测试的Python代码引发未捕获的异常，Atheris将报告失败。

### Python覆盖率

Atheris通过对字节码进行插桩来收集Python覆盖率信息。有三种选项可用于将此插桩添加到字节码中：

 - 你可以对导入的库进行插桩：

   ```python
   with atheris.instrument_imports():
     import foo
     from bar import baz
   ```
   这将导致在`foo`和`bar`上添加插桩，以及它们导入的任何库。

 - 或者，你可以对单个函数进行插桩：

   ```python
   @atheris.instrument_func
   def my_function(foo, bar):
     print("instrumented")
   ```

 - 或者最后，你可以对所有内容进行插桩：

   ```python
   atheris.instrument_all()
   ```
   将其放在`atheris.Setup()`之前。这将找到解释器中当前加载的每个Python函数，并对其进行插桩。
   这可能需要一些时间。

Atheris还可以插桩正则表达式检查，例如`re.search`。要启用此功能，你需要添加：
`atheris.enabled_hooks.add("RegEx")`
在脚本调用`re.compile`之前。在内部，这将导入`re`模块并对必要的函数进行插桩。这是一个实验性功能。

类似地，Atheris可以插桩str方法；目前仅支持`str.startswith`和`str.endswith`。要启用此功能，添加
`atheris.enabled_hooks.add("str")`。这是一个实验性功能。

#### 为什么会出现“未找到任何有趣的输入”？

你可能会看到这个错误：

```
ERROR: no interesting inputs were found. Is the code instrumented for coverage? Exiting.
```

如果`TestOneInput`的前两个调用未产生任何覆盖事件，你将会看到这个错误。即使你已经对一些Python代码进行了插桩，如果在这两个调用中未到达插桩点（例如，因为你有一个非平凡的`TestOneInput`），这可能会发生。你可以通过在`TestOneInput`上添加`atheris.instrument_func`装饰器，使用`atheris.instrument_all()`，或将`TestOneInput`函数移到插桩的模块中来解决这个问题。

### 可视化Python代码覆盖率

检查哪些行已执行对于理解你的模糊测试的效果是有帮助的。Atheris与[`coverage.py`](https://coverage.readthedocs.io/)兼容：你可以像对待任何其他Python程序一样，使用`coverage.py`模块运行你的模糊测试。以下是一个示例：

```bash
python3 -m coverage run your_fuzzer.py -atheris_runs=10000  # 运行次数
python3 -m coverage html
(cd htmlcov && python3 -m http.server 8000)
```

只有当你的模糊测试正常退出时，才会生成覆盖率报告。有三种情况下会正常退出：

 - 你指定了`-atheris_runs=<number>`，并且已经运行了这么多次。
 - 你的模糊测试通过Python异常退出。
 - 你的模糊测试通过

`sys.exit()`退出。

如果你的模糊测试由于本地代码崩溃或libFuzzer的`-runs`标志而退出，将不会生成覆盖率报告（使用`-atheris_runs`）。如果你的模糊测试通过其他方法退出，例如SIGINT（Ctrl+C），Atheris将尝试生成报告，但可能无法生成（具体取决于你的代码）。为了获得一致的报告，建议始终使用`-atheris_runs=<number>`。

如果你想在运行时检查你的语料库，可以使用以下命令：

```
python3 -m coverage run your_fuzzer.py corpus_dir/* -atheris_runs=$(( 1 + $(ls corpus_dir | wc -l) ))
```

这将导致Atheris在`<corpus-dir>`中的每个文件上运行，然后退出。注意：Atheris使用空数据集作为第一个输入，即使在`<corpus_dir>`中没有空文件。重要的是，如果省略了`-atheris_runs=$(ls corpus_dir | wc -l)`，将不会生成覆盖率报告。

使用coverage.py会显著减慢你的模糊测试，因此只在需要可视化覆盖率时使用它。

### 模糊测试本地扩展

为了使对本地扩展的模糊测试有效，你的本地扩展必须进行插桩。请参阅[Native Extension Fuzzing](https://github.com/google/atheris/blob/master/native_extension_fuzzing.md)获取说明。

### 结构感知的模糊测试

Atheris基于覆盖率引导的基于变异的模糊测试（LibFuzzer）。这样做的优点是不需要为生成输入定义任何语法，使其设置更加容易。缺点是对于解析复杂数据类型的代码来说，生成输入将更加困难。通常，输入将会早早被拒绝，导致覆盖率较低。

Atheris支持自定义变异器
[(由LibFuzzer提供)](https://github.com/google/fuzzing/blob/master/docs/structure-aware-fuzzing.md)
以生成语法感知的输入。

示例（与LibFuzzer文档中的[示例压缩的Atheris等效物](https://github.com/google/fuzzing/blob/master/docs/structure-aware-fuzzing.md#example-compression)）：

```python
@atheris.instrument_func
def TestOneInput(data):
  try:
    decompressed = zlib.decompress(data)
  except zlib.error:
    return

  if len(decompressed) < 2:
    return

  try:
    if decompressed.decode() == 'FU':
      raise RuntimeError('Boom')
  except UnicodeDecodeError:
    pass
```

为了达到`RuntimeError`崩溃，模糊器需要能够生成有效的压缩数据并满足解压缩后的检查。Atheris几乎不可能生成这样的输入：对输入数据的变异很可能会导致解压缩时的无效数据。为了解决这个问题，你可以定义一个自定义的变异器函数（相当于`LLVMFuzzerCustomMutator`）。这个示例生成有效的压缩数据。为了使Atheris能够使用它，请将自定义的变异器函数传递给`atheris.Setup`的调用。

```python
def CustomMutator(data, max_size, seed):
  try:
    decompressed = zlib.decompress(data)
  except zlib.error:
    decompressed = b'Hi'
  else:
    decompressed = atheris.Mutate(decompressed, len(decompressed))
  return zlib.compress(decompressed)

atheris.Setup(sys.argv, TestOneInput, custom_mutator=CustomMutator)
atheris.Fuzz()
```

正如在示例中所看到的，自定义变异器可能会要求Atheris使用`atheris.Mutate()`对数据进行变异（这相当于`LLVMFuzzerMutate`）。

你可以尝试使用[custom_mutator_example.py](example_fuzzers/custom_mutator_example.py)
进行实验，并查看没有变异器的情况下Atheris无法找到崩溃，而在使用变异器后几秒钟内就找到了。

```shell
$ python3 example_fuzzers/custom_mutator_example.py --no_mutator
[...]
#2      INITED cov: 2 ft: 2 corp: 1/1b exec/s: 0 rss: 37Mb
#524288 pulse  cov: 2 ft: 2 corp: 1/1b lim: 4096 exec/s: 262144 rss: 37Mb
#1048576        pulse  cov: 2 ft: 2 corp: 1/1b lim: 4096 exec/s: 349525 rss: 37Mb
#2097152        pulse  cov: 2 ft: 2 corp: 1/1b lim: 4096 exec/s: 299593 rss: 37Mb
#4194304        pulse  cov: 2 ft: 2 corp: 1/1b lim: 4096 exec/s: 279620 rss: 37Mb
[...]

$ python3 example_fuzzers/custom_mutator_example.py
[...]
INFO: found LLVMFuzzerCustomMutator (0x7f9c989fb0d0). Disabling -len_control by default.
[...]
#2      INITED cov: 2 ft: 2 corp: 1/1b exec/s: 0 rss: 37Mb
#3      NEW    cov: 4 ft: 4 corp: 2/11b lim: 4096 exec/s: 0 rss: 37Mb L: 10/10 MS: 1 Custom-
#12     NEW    cov: 5 ft: 5 corp: 3/21b lim: 4096 exec/s: 0 rss: 37Mb L: 10/10 MS: 7 Custom-CrossOver-Custom-CrossOver-Custom-ChangeBit-Custom-
 === Uncaught Python exception: ===
RuntimeError: Boom
Traceback (most recent call last):
  File "example_fuzzers/custom_mutator_example.py", line 62, in TestOneInput
    raise RuntimeError('Boom')
[...]
```

为了触发`RuntimeError`崩溃，模糊测试器需要能够生成有效的压缩数据并在解压缩后满足检查。Atheris很可能无法生成这样的输入：对输入数据的变异很可能导致无效的数据，在解压缩时失败。

为了解决这个问题，您可以定义一个自定义变异器函数（等同于`LLVMFuzzerCustomMutator`）。以下是一个示例，该示例生成有效的压缩数据。要使Atheris能够使用它，请将自定义变异器函数传递给`atheris.Setup`的调用。

```python
import sys
import atheris
import zlib

def CustomMutator(data, max_size, seed):
    try:
        decompressed = zlib.decompress(data)
    except zlib.error:
        decompressed = b'Hi'
    else:
        decompressed = atheris.Mutate(decompressed, len(decompressed))
    return zlib.compress(decompressed)

atheris.Setup(sys.argv, TestOneInput, custom_mutator=CustomMutator)
atheris.Fuzz()
```

如示例所示，自定义变异器可以使用`atheris.Mutate()`请求Atheris变异数据（这等同于`LLVMFuzzerMutate`）。

您可以尝试使用[custom_mutator_example.py](example_fuzzers/custom_mutator_example.py)来实验，可以看到没有变异器时，Atheris可能无法找到崩溃，而使用变异器则能够在几秒钟内实现。

```shell
$ python3 example_fuzzers/custom_mutator_example.py --no_mutator
[...]
#2      INITED cov: 2 ft: 2 corp: 1/1b exec/s: 0 rss: 37Mb
#524288 pulse  cov: 2 ft: 2 corp: 1/1b lim: 4096 exec/s: 262144 rss: 37Mb
#1048576        pulse  cov: 2 ft: 2 corp: 1/1b lim: 4096 exec/s: 349525 rss: 37Mb
#2097152        pulse  cov: 2 ft: 2 corp: 1/1b lim: 4096 exec/s: 299593 rss: 37Mb
#4194304        pulse  cov: 2 ft: 2 corp: 1/1b lim: 4096 exec/s: 279620 rss: 37Mb
[...]

$ python3 example_fuzzers/custom_mutator_example.py
[...]
INFO: found LLVMFuzzerCustomMutator (0x7f9c989fb0d0). Disabling -len_control by default.
[...]
#2      INITED cov: 2 ft: 2 corp: 1/1b exec/s: 0 rss: 37Mb
#3      NEW    cov: 4 ft: 4 corp: 2/11b lim: 4096 exec/s: 0 rss: 37Mb L: 10/10 MS: 1 Custom-
#12     NEW    cov: 5 ft: 5 corp: 3/21b lim: 4096 exec/s: 0 rss: 37Mb L: 10/10 MS: 7 Custom-CrossOver-Custom-CrossOver-Custom-ChangeBit-Custom-
 === Uncaught Python exception: ===
RuntimeError: Boom
Traceback (most recent call last):
  File "example_fuzzers/custom_mutator_example.py", line 62, in TestOneInput
    raise RuntimeError('Boom')
[...]
```

还支持自定义交叉函数（等同于`LLVMFuzzerCustomCrossOver`）。您可以将自定义交叉函数传递给`atheris.Setup`的调用。在[src/custom_crossover_fuzz_test.py](src/custom_crossover_fuzz_test.py)中查看其用法。

#### 使用Protocol Buffers进行结构感知模糊测试

[libprotobuf-mutator](https://github.com/google/libprotobuf-mutator)与Atheris一起使用，可以使用协议缓冲区执行结构感知模糊测试。

有关[atheris_libprotobuf_mutator](contrib/libprotobuf_mutator/README.md)的文档，请参阅。

## 与OSS-Fuzz集成

Atheris完全受[OSS-Fuzz](https://github.com/google/oss-fuzz)支持，这是Google用于开源项目的持续模糊测试服务。要与OSS-Fuzz集成，请参阅[https://google.github.io/oss-fuzz/getting-started/new-project-guide/python-lang](https://google.github.io/oss-fuzz/getting-started/new-project-guide/python-lang)。

## API

`atheris` 模块提供三个关键函数：`instrument_imports()`、`Setup()` 和 `Fuzz()`。

在源文件中，将所有希望进行模糊测试的库导入到 `with atheris.instrument_imports():` 块中，如下所示：

```python
# library_a 不会被插桩
import library_a

with atheris.instrument_imports():
    # library_b 将被插桩
    import library_b
```

通常最好先导入 `atheris`，然后在 `with atheris.instrument_imports()` 块内导入所有其他库。

接下来，定义一个模糊测试入口函数，并将其与模糊测试器的参数（通常是 `sys.argv`）一起传递给 `atheris.Setup()`。最后，调用 `atheris.Fuzz()` 开始模糊测试。必须在调用 `atheris.Fuzz()` 之前调用 `atheris.Setup()`。

#### `instrument_imports(include=[], exclude=[])`
- `include`: 一个包含应插桩的完全合格模块名称的列表。
- `exclude`: 一个包含不应插桩的完全合格模块名称的列表。

这应与 `with` 语句一起使用。在该语句中导入的所有模块都将被插桩。但是，由于 Python 只导入模块一次，因此无法用此方法插桩任何先前导入的模块，包括 Atheris 所需的模块。要为这些模块添加覆盖范围，请改用 `instrument_all()`。

可以通过以下方式获取不支持的模块的完整列表：

```python
import sys
import atheris
print(sys.modules.keys())
```


#### `instrument_func(func)`
 - `func`: 要插桩的函数。

这将插桩指定的 Python 函数，然后返回 `func`。通常用作装饰器，但也可以用于插桩单个函数。请注意，`func` 在原地插桩，因此这将影响该函数的所有调用点。

不能在绑定方法上调用此方法 - 在未绑定版本上调用它。

#### `instrument_all()`

这将扫描解释器中的所有对象，并在每个 Python 函数上调用 `instrument_func`。这甚至适用于核心 Python 解释器函数，这是 `instrument_imports` 无法做到的。

该函数是实验性的。

#### `Setup(args, test_one_input, internal_libfuzzer=None)`
 - `args`: 一个字符串列表：要传递给模糊测试器的进程参数，通常是 `sys.argv`。此参数列表可能会被原地修改，以删除模糊测试器使用的参数。
   有关此类选项的列表，请参阅[LibFuzzer文档](https://llvm.org/docs/LibFuzzer.html#options)。
 - `test_one_input`: 模糊测试器的入口点。必须接受一个 `bytes` 参数。将重复使用此函数调用一个包含单个字节容器的字节。
 - `internal_libfuzzer`: 指示 libfuzzer 是否由 atheris 或外部库提供（请参阅[native_extension_fuzzing.md](./native_extension_fuzzing.md)）。如果未指定，Atheris 将自动确定此选项。
   如果模糊测试的是纯 Python，请将其保留为 `True`。

#### `Fuzz()`

这启动了模糊测试器。在调用此函数之前，必须调用 `Setup()`。此函数不返回。

在许多情况下，`Setup()` 和 `Fuzz()` 可以合并为一个函数，但它们之间是分离的，因为您可能希望模糊测试器消耗它处理的命令行参数，然后将任何剩余的参数传递给另一个设置函数。

#### `FuzzedDataProvider`

通常，`bytes` 对象对于您的被模糊测试代码来说可能不是方便的输入。与 libFuzzer 类似，我们提供了 FuzzedDataProvider 来将这些字节转换为其他输入形式。

您可以使用以下代码构造 FuzzedDataProvider：

```python
fdp = atheris.FuzzedDataProvider(input_bytes)
```

然后，FuzzedDataProvider 支持以下函数：

```python
def ConsumeBytes(count: int)
```
消耗 `count` 个字节。


```python
def ConsumeUnicode(count: int)
```

消耗 Unicode 字符。可能包含代理对字符，根据规范，在这种情况下它们是无效的。但是，许多核心软件工具（例如 Windows 文件路径）支持它们，因此其他软件通常也需要支持。

```python
def ConsumeUnicodeNoSurrogates(count: int)
```

消耗 Unicode 字符，但永远不会生成代理对字符。

```python
def ConsumeString(count: int)
```

在 Python 2 中是 `ConsumeBytes` 的别名，在 Python 3 中是 `ConsumeUnicode` 的别名。

```python
def ConsumeInt(int: bytes)
```

消耗指定大小的带符号整数（以补码表示时）。

```python
def ConsumeUInt(int: bytes)
```

消耗指定大小的无符号整数。

```python
def ConsumeIntInRange(min: int, max: int)
```

在范围 [`min`, `max`] 内消耗整数。

```python
def ConsumeIntList(count: int, bytes: int)
```

消耗 `count` 个大小为 `size` 字节的整数列表。

```python
def ConsumeIntListInRange(count: int, min: int, max: int)
```

在范围 [`min`, `max`] 内消耗 `count` 个整数列表。

```python
def ConsumeFloat()
```

消耗任意浮点值。可能生成奇怪的值，如 `NaN` 和 `Inf`。



```python
def ConsumeRegularFloat()
```

消耗任意数值浮点值；永远不会生成特殊类型，如 `NaN` 或 `Inf`。

```python
def ConsumeProbability()
```

消耗范围在 [0, 1] 内的浮点值。

```python
def ConsumeFloatInRange(min: float, max: float)
```

在范围 [`min`, `max`] 内消耗浮点值。

```python
def ConsumeFloatList(count: int)
```

消耗 `count` 个任意浮点值的列表。可能生成奇怪的值，如 `NaN` 和 `Inf`。

```python
def ConsumeRegularFloatList(count: int)
```

消耗 `count` 个任意数值浮点值的列表；永远不会生成特殊类型，如 `NaN` 或 `Inf`。

```python
def ConsumeProbabilityList(count: int)
```

消耗 `count` 个在范围 [0, 1] 内的浮点数的列表。

```python
def ConsumeFloatListInRange(count: int, min: float, max: float)
```

在范围 [`min`, `max`] 内消耗 `count` 个浮点数的列表。

```python
def PickValueInList(l: list)
```

在给定的列表中选择一个随机值。

```python
def ConsumeBool()
```

消耗 `True` 或 `False`。

# chat

## 详细介绍下 Atheris

[Atheris](https://github.com/google/atheris) 是由 Google 开发的 Python Fuzzing Engine。

它是一个用于模糊测试（fuzz testing）的工具，旨在发现 Python 代码中的漏洞和安全问题。

以下是关于 Atheris 的详细介绍：

## 特点：

1. **无需修改源代码：** Atheris 可以在不修改源代码的情况下对 Python 模块进行模糊测试。这使得对现有项目进行快速测试成为可能，而无需修改其源代码。

2. **基于 LLVM libFuzzer：** Atheris 构建在 LLVM libFuzzer 上，这是一个强大的二进制模糊测试引擎。通过利用 LLVM 的功能，Atheris 能够高效地执行模糊测试。

3. **Python C API 支持：** Atheris 支持 Python C API，因此可以测试 C 扩展模块以及纯 Python 代码。这对于涉及混合语言开发的项目非常有用。

4. **自动输入生成：** Atheris 可以生成输入，以便测试 Python 代码的各种路径和分支。这有助于检测可能导致安全问题的不同代码路径。

5. **无副作用：** Atheris 设计为在执行测试时不产生副作用。这意味着在测试期间，它不会更改文件系统或网络状态。

## 使用示例：

以下是使用 Atheris 进行模糊测试的简单示例：

```python
import atheris

# 定义要测试的函数
def TestOneInput(data):
    if data.startswith(b"Hello"):
        raise RuntimeError("Input starts with 'Hello'")

# 注册测试函数并运行 Atheris
atheris.Setup(sys.argv, TestOneInput)
atheris.Fuzz()
```

在这个例子中，`TestOneInput` 函数是我们希望进行模糊测试的 Python 函数。Atheris 会自动生成输入并执行该函数，以寻找潜在的漏洞。

## 安装：

要安装 Atheris，可以使用以下 pip 命令：

```bash
pip install atheris
```

然后，可以按照上述示例编写 Python 脚本，并使用 Atheris 进行模糊测试。

请注意，Atheris 的使用可能需要一些配置，具体取决于您的测试环境和项目。详细信息可以在 [Atheris GitHub 仓库](https://github.com/google/atheris) 上找到。

## 详细介绍一下 LLVM libFuzzer

LLVM libFuzzer 是 LLVM 编译器基础设施的一部分，是一个用于模糊测试的强大引擎。模糊测试是一种自动化测试技术，它通过向程序输入注入随机或半随机的数据（称为"模糊"输入），然后监控程序的执行，以发现潜在的错误、漏洞和安全问题。

以下是 LLVM libFuzzer 的一些关键特点和工作原理：

## 特点：

1. **基于 LLVM：** libFuzzer 是 LLVM（Low Level Virtual Machine）的一部分，是 LLVM 的一种插件。因此，它可以与 LLVM 兼容，并直接集成到 LLVM 编译器中。

2. **快速且高效：** libFuzzer 被设计为高效执行大规模模糊测试。它使用一种称为"基于覆盖率的反馈"（coverage-guided feedback）的方法，通过监视程序的代码覆盖率来引导模糊测试的输入生成。这使得 libFuzzer 能够快速探索程序的不同执行路径。

3. **无需源代码更改：** libFuzzer 可以直接用于未修改的二进制程序，而无需对其源代码进行任何更改。这对于测试封闭源代码的程序或对现有代码进行快速测试非常有用。

4. **支持多种语言：** libFuzzer 不仅支持 C/C++，还支持其他编程语言，例如 Rust、Swift 等。这使得它成为一个通用的模糊测试工具。

5. **内嵌的输入生成器：** libFuzzer 包含一个内置的输入生成器，可以自动生成具有高覆盖率的输入。这减轻了用户编写自定义输入生成器的负担。

## 工作原理：

1. **初始化：** libFuzzer 在程序执行之前进行初始化，配置运行时环境以捕获覆盖率信息。

2. **输入生成：** libFuzzer 使用内置的输入生成器或用户提供的输入生成器生成模糊输入。生成的输入是随机或半随机的。

3. **执行：** 使用生成的输入运行目标程序，并监控其执行路径的覆盖率。覆盖率信息被记录下来，用于指导下一轮输入生成。

4. **反馈：** 根据覆盖率信息，libFuzzer 调整输入生成策略，以便更有可能发现新的执行路径和潜在问题。这个过程迭代进行，直到达到预定的测试时间或测试次数。

5. **报告：** libFuzzer 在测试结束时生成报告，其中包含覆盖率信息、发现的错误等。这有助于用户分析测试结果。

## 使用 libFuzzer：

使用 libFuzzer 进行模糊测试的一般步骤如下：

1. 编写目标程序或选择现有程序作为目标。
2. 配置编译器，以便使用 libFuzzer 插件。
3. 使用 libFuzzer 运行目标程序，指定输入生成器等参数。
4. 分析测试结果，修复发现的问题，并迭代测试。

libFuzzer 的详细文档和示例可以在 LLVM 官方网站上找到。

## Atheris 支持 java 吗？如何支持的？给出具体的使用例子

Atheris 是一个基于 Python 的模糊测试引擎，专注于对 Python 代码进行模糊测试。

截至我截取的知识（截至2022年1月），Atheris 并不直接支持 Java。

Atheris 主要用于测试 Python 代码，而对于其他编程语言，需要使用相应的模糊测试工具。

如果你希望对 Java 代码进行模糊测试，可以考虑使用与 Java 相关的模糊测试工具，比如前面提到的 JQF（Java QuickCheck Fuzzing）等。

这些工具专门为 Java 语言提供了支持，并能够更好地集成到 Java 生态系统中。

以下是一个使用 JQF 进行 Java 模糊测试的简单例子：

```java
import edu.berkeley.cs.jqf.fuzz.Fuzz;
import edu.berkeley.cs.jqf.fuzz.JQF;

import static org.junit.Assert.assertTrue;

import org.junit.runner.RunWith;

@RunWith(JQF.class)
public class SimpleFuzzTest {

    @Fuzz
    public void testFuzz(String input) {
        // Your fuzzing logic here
        assertTrue(input.length() < 100);
    }
}
```

在这个例子中，`@Fuzz` 注解标记的 `testFuzz` 方法是一个由 JQF 运行的模糊测试方法。

JQF 将自动为 `input` 参数生成随机的字符串，并执行测试逻辑。这只是一个简单的示例，你可以根据需要编写更复杂的测试逻辑。

请注意，Atheris 与 Python 相关，而 JQF 适用于 Java。在选择模糊测试引擎时，请确保选择与目标编程语言兼容的工具。

# 参考资料

https://github.com/rohanpadhye/jqf

* any list
{:toc}