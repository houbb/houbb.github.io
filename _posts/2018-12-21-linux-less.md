---
layout: post
title: linux less, linux more
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
excerpt: linux less/more 命令
---

# Linux less

less 工具也是对文件或其它输出进行分页显示的工具，应该说是linux正统查看文件内容的工具，功能极其强大。

less 的用法比起 more 更加的有弹性。

在 more 的时候，我们并没有办法向前面翻， 只能往后面看。

但若使用了 less 时，就可以使用 `[pageup] [pagedown]` 等按键的功能来往前往后翻看文件，更容易用来查看一个文件的内容！

除此之外，在 less 里头可以拥有更多的搜索功能，不止可以向下搜，也可以向上搜。


# 命令参数

```
$   less --help
```

信息如下:

```
$ less --help

                   SUMMARY OF LESS COMMANDS

      Commands marked with * may be preceded by a number, N.
      Notes in parentheses indicate the behavior if N is given.

  h  H                 Display this help.
  q  :q  Q  :Q  ZZ     Exit.
 ---------------------------------------------------------------------------

                           MOVING

  e  ^E  j  ^N  CR  *  Forward  one line   (or N lines).
  y  ^Y  k  ^K  ^P  *  Backward one line   (or N lines).
  f  ^F  ^V  SPACE  *  Forward  one window (or N lines).
  b  ^B  ESC-v      *  Backward one window (or N lines).
  z                 *  Forward  one window (and set window to N).
  w                 *  Backward one window (and set window to N).
  ESC-SPACE         *  Forward  one window, but don't stop at end-of-file.
  d  ^D             *  Forward  one half-window (and set half-window to N).
  u  ^U             *  Backward one half-window (and set half-window to N).
  ESC-)  RightArrow *  Left  one half screen width (or N positions).
  ESC-(  LeftArrow  *  Right one half screen width (or N positions).
  F                    Forward forever; like "tail -f".
  r  ^R  ^L            Repaint screen.
  R                    Repaint screen, discarding buffered input.
        ---------------------------------------------------
        Default "window" is the screen height.
        Default "half-window" is half of the screen height.
 ---------------------------------------------------------------------------

                          SEARCHING

  /pattern          *  Search forward for (N-th) matching line.
  ?pattern          *  Search backward for (N-th) matching line.
  n                 *  Repeat previous search (for N-th occurrence).
  N                 *  Repeat previous search in reverse direction.
  ESC-n             *  Repeat previous search, spanning files.
  ESC-N             *  Repeat previous search, reverse dir. & spanning files.
  ESC-u                Undo (toggle) search highlighting.
  &pattern          *  Display only matching lines
        ---------------------------------------------------
```

# 日志检索

## linux 中的 less 命令进入文件，如何搜索关键词的日志？

在Linux中，`less`命令是一个用于查看文本文件内容的实用工具，并且它还支持搜索关键词。

要在`less`中搜索关键词，可以按照以下步骤操作：

1. 打开文件：

   ```bash
   less 文件名
   ```

   例如，如果你要查看一个名为`example.txt`的文件，可以运行：

   ```bash
   less example.txt
   ```

2. 在`less`中执行搜索：

   - 按 `/` 键，然后输入你想要搜索的关键词，并按 Enter 键。

   例如，如果要搜索关键词 "error"，则按 `/`，然后键入 "error"，最后按 Enter。

   - `less` 将会定位并高亮显示匹配的关键词。

3. 查看搜索结果：

   - 按 `n` 键，可以移动到下一个匹配项。
   - 按 `N` 键，可以移动到上一个匹配项。

4. 退出`less`：

   - 按 `q` 键退出`less`。

这些步骤允许你在`less`中方便地搜索文件中的关键词。

## 如果直接到最后一个匹配的关键词？

如果你想直接跳转到文件中的最后一个匹配项，你可以在搜索关键词后，按 Shift + N 键（大写的 N）

## less grep 方式，如何只取符合条件的最后几条？

`less` 结合 `grep` 的方式，你可以使用 `grep` 命令来过滤文件内容，然后使用 `tail` 命令来获取最后几行。

下面是一个示例：

```bash
grep "关键词" 文件名 | tail -n 数字
```

解释：

- `grep "关键词" 文件名`：使用 `grep` 过滤包含指定关键词的行。
- `tail -n 数字`：使用 `tail` 命令获取最后几行，其中 `数字` 是你想要获取的行数。

例如，要查找包含关键词 "error" 的文件的最后 10 行，可以运行：

```bash
grep "error" 文件名 | tail -n 10
```

请注意，这种方法首先使用 `grep` 过滤文件内容，然后再使用 `tail` 获取最后几行，因此效率可能不如直接在 `less` 中搜索，特别是对于大型文件。

如果文件较小，或者你只关心最后几行符合条件的内容，这个方法是有效的。

# 实际使用

## 分页

```
history | less
```

会将以前使用的 linux 分页显示出来。

## 查看日志

```
less xxx.log
```

有些类似 vi/vim 打开日志文件

### 搜索

输入 `/` + 搜索的关键词+回车

# 只显示符合条件的第一条

```
less XXX.log | grep '关键字' | head -n 1
```

# 拓展学习

[linux more]()

[linux cat](https://houbb.github.io/2018/12/21/linux-cat)

# 参考资料

[wiki](https://en.wikipedia.org/wiki/Less_(Unix))

[Everything You Need to Know About the Less Command](https://www.lifewire.com/what-to-know-less-command-4051972)

* any list
{:toc}