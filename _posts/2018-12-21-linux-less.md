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