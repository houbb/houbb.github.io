---
layout: post
title: Subversion 
date:  2016-10-10 16:09:36 +0800
categories: [Version Control]
tags: [subversion]
published: false
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

