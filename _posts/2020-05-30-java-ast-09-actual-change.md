---
layout: post
title: JavaParser 系列学习-09-精准测试：基于 asm+javaparser 调用链差异化对比实践
date:  2020-5-29 14:24:18 +0800
categories: [java]
tags: [aop, ast, sh]
published: true
---

# 适用人群

如果你也面临这些问题

- 接触到的测试都是比较偏向底层，中台化的服务，对上层业务会比较陌生

- 日常开发提交测试点时会出现遗漏的情况，导致测试阶段漏测

- 开发测试比高，经常多个开发对一个测试，且日常发版频繁

- 想自己搞一套精准测试框架辅助测试

那么你可能也需要这么一套精准测试思路，帮助你精准且快速的进行日常测试

# 依赖技能树

在早几年前就了解到可以通过一些抽象语法解析工具或框架，针对 java 项目做链路梳理，再通过链路逆向反推测试回归点，趁着这个机会，较为深入的梳理了一下相关的知识体系

掌握：java 编程，了解 jvm 大致原理，特别编译阶段，类加载阶段
熟悉：asm，可将 class 文件梳理为一条完整的调用链
熟悉：javaparser，可将 java 文件解析为抽象语法树（AST）

对标前几年大肆推的 jacoco 用于精准测试，通过 AST 解析有以下优势

jacoco 只告诉你执行过程中代码的哪些行没覆盖，具体这行有什么意义，为什么要覆盖，怎么去覆盖，这些你都无从得知；而通过调用链差异对比可更为精准的推送需要回归的业务

jacoco 大多只能适用于单元测试，如果想集成测试使用还需要依赖 agent 注入；而通过调用链差异对比可通过接入 jenkins 在提测前就输出测试点，不需要改动业务代码

相比 jacoco 拿来就可以用，需要了解更多的 jvm 基础知识，同时扩充了个人知识体系

# 实践

## 调用链扫描

加强 Class/Method 事件筛选器，保存父子方法调用关系

通过遍历特性分支编译后的 class 文件，再通过事件生成器启动，触发类/方法筛选器事件

最终只输出指定类型方法的调用链，包括：RPC 接口，HTTP 接口，定时任务，MQ 生产与消费

### 关键代码

```java
//1. asm构建classReader的方式不仅可以通过已加载的类名指定，也可以通过输入流（InputStream），这就使得通过直接遍历项目编译过的.class解析调用链变为可能
FileHelper.getFilePaths(classPath, dir, ".class"); // 遍历编译后的build/class路径下的所有.class文件
classPath.forEach(c->{
    ClassReader classReader = new ClassReader(new FileInputStream(c));
    ClassSpider classSpider = new ClassSpider(methodInvokeInfos);
    classReader.accept(classSpider, org.objectweb.asm.ClassReader.SKIP_FRAMES);
}

//2. 扫描的目的是逆推对外暴露需要回归的功能，例如接口，定时器，消息队列等，所以需要排除掉一些无关的链路
//例如dubbo，thrift，job，nsq在编写中其类一般都或有特定的注解，或有特定的父类，或有特定实现的接口类型，所以可以在类删选器classvisiotr中进行筛选
public AnnotationVisitor visitAnnotation(String annotation, boolean b) {
    if (annotation.endsWith("RestController;")) {
        flag = "HTTP"
    }
    return super.visitAnnotation(annotation, b);
}
```

## 分支差异对比

遍历 master、branch 路径项目下的所有.java 文件，生成抽象语法树，并做去噪处理（空格，注释等无关改动）

对比方法（注解，签名，返回值，以及方法体），统计特性分支改动的方法

### 关键代码

```java
//1. 先比对有差异的文件，这里直接比对文件大小，以及是否存在新增的java文件，收拢第二步的筛选范围
branch.forEach( (rp, b) -> {
    if (!master.containsKey(rp)) {
        b.setStatus(Status.NEW);
    } else {
        JavaFileInfo m = master.get(rp);
        if (b.getLength() != m.getLength()){
            b.setStatus(Status.MODIFY);
            m.setStatus(Status.MODIFY);
        }
    }
});
master.forEach( (rp, m) -> {
    if (!branch.containsKey(rp)) {
        m.setStatus(Status.DELETE);
    }
});

//2. 遍历branch 和 master路径下修改过或新增的.java文件，生成AST
CompilationUnit cu = StaticJavaParser.parse(file);
List<Comment> comments = cu.getAllContainedComments();  // 这里开始去除无关注释
        List<Comment> unwantedComments = comments  
                .stream()
                .filter(p -> !p.getCommentedNode().isPresent() || p instanceof LineComment)
                .collect(Collectors.toList());
        unwantedComments.forEach(Node::remove);
VoidVisitor<List<ClassParser>> classParserVoidVisitor = new VisitorPrinter();、
classParserVoidVisitor.visit(cu, classParsers);  // 遍历文件，保存语法树

//3. 对比差异化，输出特性分支修改/新增的方法
masterMethod.checkAnnotationEqual(branchMethod).checkTypeEqual(branchMethod).checkBodyEqual(bbranchMethod);  // 这里我主要比对了方法的注解，详情就不展开了
```

## 调用链&差异化输出

遍历调用链与上述差异化方法，输出需要回归的指定方法/接口

附带信息可包括：统计改动了多少行代码，改动的类型（包括：返回值改动，注解改动，新增方法，方法体变更），以及对应改动点

## 调用链入库，并提供接口供查询 或 回调特定接口

可将接口与日常手工回归的案例/自动化案例做匹配，这样精准测试可以提送指定的案例用于回归&测试

# 参考资料

https://testerhome.com/topics/23819

* any list
{:toc}