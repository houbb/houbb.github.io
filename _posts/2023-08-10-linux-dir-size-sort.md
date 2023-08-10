---
layout: post
title: linux 命令：获取 linux 磁盘下 10 个子文件夹的大小排序的命令
date: 2023-08-10 21:01:55 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
---

# 给出  linux 磁盘下 10 个子文件夹的大小排序的命令

你可以使用以下命令来获取 Linux 磁盘下的前 10 个子文件夹，并按照大小进行排序：

```bash
du -h --max-depth=1 /path/to/directory | sort -rh | head -n 11
```

在这个命令中，你需要将 `/path/to/directory` 替换为你要检查的目标目录的实际路径。这个命令会执行以下操作：

1. `du -h --max-depth=1 /path/to/directory`：该命令会使用 `du` (disk usage) 工具来显示指定目录中各个子目录的磁盘使用情况。选项 `-h` 用于以人类可读的格式显示大小，`--max-depth=1` 限制只显示一级子目录的大小。
   
2. `sort -rh`：这部分将对 `du` 命令的输出进行排序。选项 `-r` 表示降序排序（从大到小），选项 `-h` 表示按照人类可读的格式进行排序（例如，"1K" < "1M"）。

3. `head -n 11`：最后，使用 `head` 命令来提取排序后的结果的前 11 行，其中包括目标目录本身和前 10 个子文件夹的信息。

这将在终端中显示磁盘下的前 10 个子文件夹，并按照大小进行排序。如果你想调整显示的子文件夹数量，只需将 `head` 命令中的 `-n` 参数值相应地修改即可。

# 参考资料

chat

* any list
{:toc}