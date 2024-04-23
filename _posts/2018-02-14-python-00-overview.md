---
layout: post
title:  Python-00-overview 概览
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, lang, why-learn, sh]
published: true
---

# chat

## 介绍一下 python

Python 是一种高级编程语言，它以其简洁、易读和易写的特点而闻名。

Python 由 Guido van Rossum 创建，并于1991年首次发布。Python 的设计哲学强调代码的可读性和简洁的语法（尤其是使用空格缩进来区分代码块，而不是使用大括号或关键词）。

因此，Python 支持多种编程范式，包括面向对象、命令式、函数式和过程式编程。

以下是 Python 的一些关键特性和优点：

1. **易于学习**：Python 有一个非常简洁的语法，对于初学者来说很容易上手。

2. **可读性**：Python 的代码通常看起来像伪代码，这使得它易于阅读和理解。

3. **可移植性**：Python 程序可以在多种操作系统上运行，包括 Windows、Mac OS X、Linux 等。

4. **强大的标准库**：Python 有一个庞大的标准库，提供了许多用于处理文件、系统调用、网络通信等的模块。

5. **开源**：Python 是一个开源项目，拥有活跃的社区，这意味着它有大量的第三方库和框架。

6. **多用途**：Python 被广泛用于 Web 开发、自动化、数据分析、人工智能、科学计算等领域。

7. **面向对象**：Python 支持面向对象的编程，允许程序员定义类和对象。

8. **自动内存管理**：Python 有自动内存管理和垃圾回收功能，这使得内存管理更加容易。

9. **解释型语言**：Python 代码在运行时被解释，这使得它适合快速原型开发。

10. **交互式**：Python 提供了一个交互式解释器，允许程序员在不编写程序的情况下测试和调试代码片段。

11. **广泛的应用**：Python 在数据科学、机器学习、网络爬虫、游戏开发、桌面和 Web 应用开发等领域都有广泛的应用。

12. **框架和工具**：Python 有许多流行的框架和工具，如 Django 和 Flask（Web 开发）、Pandas 和 NumPy（数据分析）、TensorFlow 和 PyTorch（机器学习）等。

Python 的一些主要缺点包括：

1. **性能**：与编译型语言（如 C 或 Java）相比，Python 通常运行得更慢，因为它是解释型语言。

2. **移动开发**：虽然可以使用 Python 进行移动应用开发，但它并不是这个领域的主流选择。

3. **多线程**：Python 的全局解释器锁（GIL）限制了原生线程的并发执行，这可能影响多线程程序的性能。

Python 的语法示例：

```python
# 一个简单的 Hello World 程序
print("Hello, World!")

# 定义一个函数
def greet(name):
    print(f"Hello, {name}!")

# 调用函数
greet("Alice")

# 列表推导式
squares = [x**2 for x in range(10)]
print(squares)

# 异常处理
try:
    result = 10 / 0
except ZeroDivisionError:
    print("You can't divide by zero!")
```

Python 的流行和易用性使其成为许多开发者和数据科学家的首选语言。

随着技术的不断发展，Python 也在不断地更新和改进，以适应新的编程需求和挑战。

## python2 和 python3 的区别？

Python 2 和 Python 3 是 Python 编程语言的两个主要版本，它们之间存在一些关键的差异，这些差异包括语法、内置函数、库的使用等方面。以下是 Python 2 和 Python 3 之间的一些主要区别：

1. **print 函数**：Python 2 中 `print` 是一个语句，而在 Python 3 中 `print()` 是一个函数。

2. **Unicode 支持**：Python 2 默认使用 ASCII 编码，而 Python 3 默认使用 UTF-8 编码，对 Unicode 提供了更好的支持。

3. **整数除法**：在 Python 2 中，两个整数相除的结果是一个整数，而在 Python 3 中，结果是浮点数。

4. **异常处理**：Python 2 中的异常捕获使用的是逗号分隔，而 Python 3 使用 `as` 关键字。

5. **八进制和二进制字面量**：Python 3 引入了新的表示方法，八进制前缀为 `0o`，二进制前缀为 `0b`。

6. **模块重命名**：一些模块在 Python 3 中被重命名，例如 `ConfigParser` 替代了 Python 2 的 `ConfigParser`。

7. **文件操作**：Python 2 中可以同时使用 `file` 和 `open` 函数，而 Python 3 只支持 `open` 函数。

8. **迭代器和生成器**：Python 3 中，`xrange` 被 `range` 替代，且 `range` 返回的是一个迭代器而不是列表。

9. **输入函数**：Python 2 的 `raw_input()` 函数在 Python 3 中被 `input()` 函数替代。

10. **库支持**：一些第三方库不再支持 Python 3，而有些库则同时为 Python 2 和 Python 3 提供了支持。

11. **性能**：Python 3 可能在某些方面比 Python 2 慢，但随着时间推移和优化工作的进行，性能差异已经显著减少。

12. **社区支持**：Python 2 已经停止维护，社区支持逐渐减少，而 Python 3 得到了广泛的支持和开发者的关注。

13. **类定义**：Python 2 中存在老式类和新式类的区别，而 Python 3 统一采用新式类。

14. **缩进错误**：Python 3 对缩进的使用更加严格，不允许在缩进中混用 tab 和空格。

15. **数据类型**：Python 3 去除了 `long` 类型，现在只有一种整型 `int`，并且新增了 `bytes` 类型。

这些差异意味着从 Python 2 迁移到 Python 3 需要对代码进行适当的修改，以确保兼容性。

对于新项目，推荐使用 Python 3，因为 Python 2 已经不再受到官方支持。

## 现在学习的话是建议学习 python3 还是 python2? 为什么？

建议学习 Python 3，原因如下：

1. **官方支持**：Python 2 已于 2020 年停止官方支持，这意味着 Python 2 不再接收安全更新和性能改进。而 Python 3 作为官方推荐的版本，将持续得到维护和更新。

2. **社区支持**：随着官方对 Python 2 的支持结束，社区和开发者们也在逐渐转移至 Python 3，因此 Python 3 拥有更活跃的社区和更广泛的支持。

3. **工作机会**：大多数公司和组织在开发新项目时都会选择使用 Python 3，因此掌握 Python 3 将有助于提高就业机会和职业发展前景。

4. **更好的语言特性**：Python 3 在语言设计上做了许多改进，包括更一致的语法、改进的库以及对 Unicode 的原生支持，这些都使得 Python 3 成为一个更加现代化和用户友好的编程语言。

5. **第三方库的兼容性**：虽然许多流行的第三方库仍然支持 Python 2，但随着时间的推移，这些库也在逐渐停止对 Python 2 的支持。学习 Python 3 可以确保你能够使用最新的库和工具。

6. **未来趋势**：Python 3 是 Python 语言的未来，几乎所有的教程、书籍和在线资源都在更新以匹配 Python 3 的特性和最佳实践。

7. **避免迁移成本**：如果你现在学习 Python 2，将来可能需要投入额外的时间和精力来迁移到 Python 3，而直接学习 Python 3 可以避免这种迁移成本。

8. **性能提升**：Python 3 在性能上也有所提升，特别是在大型数据集和并发处理方面。

鉴于 Python 3 是未来发展的方向，并且拥有更广泛的应用和社区支持，现在学习 Python 3 是一个更明智的选择。

## 有哪些比较好的 python3 学习教程资料？附带网址

Python 3 作为当前广泛使用的编程语言版本，有许多优秀的学习资源。以下是一些推荐的 Python 3 学习教程资料及其网址：

1. **Python 官方文档**：提供了关于 Python 3 的全面教程和文档，适合所有水平的开发者。
   - 网址：[Python 3.12.3 文档](https://docs.python.org/zh-cn/3.12/tutorial/introduction.html)

2. **廖雪峰的 Python 教程**：以中文编写，内容详实，适合初学者快速入门。
   - 网址：[廖雪峰 Python 教程](https://www.liaoxuefeng.com/wiki/1016959663602400)

3. **菜鸟教程**：提供了 Python 3 的基础教程，内容由浅入深，适合新手。
   - 网址：[Python3 教程 | 菜鸟教程](https://www.runoob.com/python3/python3-tutorial.html)

4. **清华大学出版社的 Python 基础教程**：这是一本书籍，也提供了电子版，内容全面，适合系统学习。
   - 网址：[Python 基础教程 - 清华大学出版社](http://www.tup.tsinghua.edu.cn/upload/books/yz/101493-01.pdf)

5. **CSDN 的 Python3 新手教程**：适合没有任何编程基础的读者，并且建议读者要有一定英语基础。
   - 网址：[【超详细】Python3新手教程 —— Hello, World! - CSDN博客](https://blog.csdn.net/Saki_Python/article/details/134214832)

6. **GitHub 上的学习资源**：例如 "Python - 100天从新手到大师"，规划了详细的学习路线，适合希望系统学习 Python 的开发者。
   - 网址：[Github上大神总结的Python学习路线](https://github.com/jackfrued/Python-100-Days)

7. **Python 核心编程（第3版）**：这本书深入浅出地介绍了 Python 的核心概念和技巧，适合具备一定编程基础的读者。
   - 网址：[《Python核心编程（第3版）》](http://www.tup.tsinghua.edu.cn/booksCenter/book_10109901.html)

8. **Python 教程 - 廖雪峰的官方网站**：这是一本非常受欢迎的 Python 入门书籍的在线版本，内容详实且实用。
   - 网址：[Python教程 - 廖雪峰的官方网站](https://www.liaoxuefeng.com/wiki/1016959663602400)

9. **Python 3 新手指南**：适合初学者，提供了 Python 3 的基础知识和一些实践示例。
   - 网址：[Python 3 新手指南](https://docs.python.org/zh-cn/3.12/tutorial/index.html)

# 参考资料

[官方学习](https://docs.python.org/3/tutorial/index.html)

[Python教程 - 廖雪峰的官方网站](https://www.baidu.com/link?url=Nv_dk1ZP6d20WZvUk_jBD-a7JicLkCK1j4ZiqDJ_CrdmPh3HD7-IdsxkOfBvE4dnCdj94FJJXjOqKVH5Gl-89M7ozUUB4hlA8ci_TWChqzSi89tsXwIo5orjfEFGx3ha&wd=&eqid=c6f80a7800005e78000000045ca347d3)

[菜鸟教程](http://www.runoob.com/python/python-tutorial.html)

* any list
{:toc}

