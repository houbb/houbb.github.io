---
layout: post
title: Subversion & Git
date:  2016-8-30 11:13:55 +0800
categories: [Version Control]
tags: [subversion, git]
---

* any list
{:toc}

# Subversion

Subversion is an open source version control system.

> [subversion](https://subversion.apache.org/)


## Lock mode

- strict locking

    One file can edit by only one person.
    
- optimistic locking (recommend)
    
    One file can edit by different person, sometimes, we need to handle the conflict.
    

## Command

- svn --version


## Problem

<label class="label label-danger">Cannot run program "svn"</label>

```
Cannot load supported formats: Cannot run program "svn": CreateProcess error=2
```

<label class="label label-success">solve</label>

- Install svn client, selected **command line**, because svn use the command line tool.

- Set the idea, use <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>s</kbd> , choose Version Control -> Subversion -> General.

![subversion]({{ site.url }}/static/app/img/2016-05-17-subversion.jpg)


# Git

Git is a *free and open source* distributed version control system designed to handle everything from small to very large projects with speed and efficiency.

> [git](https://git-scm.com)

> [git zh_CN](http://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000)

## branch

> [wiki](https://github.com/Kunena/Kunena-Forum/wiki/Create-a-new-branch-with-git-and-manage-branches)

> [usage](http://blog.csdn.net/wfdtxz/article/details/7973608)

> [merge](http://blog.csdn.net/syc434432458/article/details/51861483)

```
D:\CODE\blog>git branch blog_0930

D:\CODE\blog>git push origin blog_0930
Total 0 (delta 0), reused 0 (delta 0)
To https://github.com/houbb/blog.git
 * [new branch]      blog_0930 -> blog_0930

D:\CODE\blog>git checkout blog_0930
Switched to branch 'blog_0930'

D:\CODE\blog>git branch
* blog_0930
  master
```









