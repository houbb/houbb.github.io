---
layout: post
title:  Idea Plugin Dev-04-idea 插件开发实战之 markdown-toc 生成文件目录
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea]
published: true
---


# markdown-toc

以前写过一个 java 项目，专门用于生成文件的目录。

> [https://github.com/houbb/markdown-toc](https://github.com/houbb/markdown-toc)

现在学习 idea 插件开发，刚好可以用这个尝试。

# 开发内容

## plugin.xml

```xml
<idea-plugin>
    <id>com.github.com.houbb.markdown-toc-idea-plugin</id>
    <name>Markdown-TOC</name>
    <vendor email="houbinbin.echo@gmail.com" url="https://github.com/houbb/markdown-toc">老马啸西风</vendor>

    <description><![CDATA[
    Generate markdown toc for file.<br>
    <em>most HTML tags may be used</em>
    ]]></description>

    <!-- please see https://www.jetbrains.org/intellij/sdk/docs/basics/getting_started/plugin_compatibility.html
         on how to target different products -->
    <depends>com.intellij.modules.platform</depends>

    <extensions defaultExtensionNs="com.intellij">
        <!-- Add your extensions here -->
    </extensions>

    <actions>
        <!-- Add your actions here -->
        <action id="markdownTocIn" class="com.github.houbb.markdown.toc.idea.plugin.action.FileInsideRightClickAction"
                text="MarkdownTocGen" description="Generate markdown toc inside">
            <add-to-group group-id="EditorPopupMenu" anchor="first"/>
        </action>
        <action id="markdownTocOut" class="com.github.houbb.markdown.toc.idea.plugin.action.FileOutsideRightClickAction"
                text="MarkdownTocGen" description="Generate markdown toc outside">
            <add-to-group group-id="ProjectViewPopupMenu" anchor="first"/>
        </action>
    </actions>
</idea-plugin>
```

我们定义 2 个 action。

markdownTocIn：在文件内右键。

markdownTocOut：idea project 视图，在文件上右键。

## 代码

```java
package com.github.houbb.markdown.toc.idea.plugin.action;

import com.github.houbb.markdown.toc.core.impl.AtxMarkdownToc;
import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.actionSystem.CommonDataKeys;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.ui.Messages;
import com.intellij.openapi.vfs.VirtualFile;

public class BasicMarkdownTocGenAction extends AnAction {

    @Override
    public void actionPerformed(AnActionEvent e) {
        // TODO: insert action logic here
        Project project = e.getProject();
        VirtualFile file = e.getData(CommonDataKeys.VIRTUAL_FILE);
        if (file != null && !file.isDirectory()) {
            String filePath = file.getPath();
            // 使用 filePath 进行后续操作

            try {
                AtxMarkdownToc.newInstance().genTocFile(filePath);
            } catch (Exception exception) {
                //显示对话框并展示对应的信息
                Messages.showInfoMessage("执行异常" + exception.getMessage(), "提示");
            }
        } else {
            //显示对话框并展示对应的信息
            Messages.showInfoMessage("必须选择一个 markdown 文件！", "提示");
        }
    }

}
```

非常的简单，我们获取当前文件的路径，然后直接调用以前的生成方法即可。

剩下的 2 个 action 直接继承这个基础类即可。

```java
/**
 * 文件内部右键
 * @since 1.0.0
 */
public class FileInsideRightClickAction extends BasicMarkdownTocGenAction {
}
```

# 参考资料

* any list
{:toc}
