---
layout: post
title: Python-29-test converate 测试覆盖率
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, lang, test, qa, sh]
published: true
---

# CI 流程

# Travis-CI

[https://www.travis-ci.org](https://www.travis-ci.org) 直接添加此项目

# Coveralls python

## 添加项目

[https://coveralls.io/repos/new](https://coveralls.io/repos/new) 直接添加项目

查看对应密匙

## 本地安装

```
pip install python-coveralls
```

## .coveralls.yml

指定覆盖率的一些事情

```yml
service_name: travis-ci
```

### 密匙

- 生成密匙

```
travis encrypt COVERALLS_TOKEN=${your_repo_token}
```

- 添加到文件 

```
travis encrypt COVERALLS_TOKEN=${your_repo_token} --add
```

## TRAVIS.YML

```yml
# command to install dependencies
install:
  - pip install -r requirements.txt
# command to run tests
script:
  - pytest
after_success:
  - pytest --cov=pycc test/
  - coveralls
```

RvZLmJrvS8afd4wzQwBNPLKZYX5Sx7qjh


# 参考资料

- keyword

`python-coveralls usage`

[python-coveralls](https://pypi.org/project/python-coveralls/)

* any list
{:toc}