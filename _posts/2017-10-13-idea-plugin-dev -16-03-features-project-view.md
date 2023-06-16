---
layout: post
title:  Idea Plugin Dev-16-03-Project View
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# 装饰项目视图节点-Decorating Project View Nodes

插件作者可以修改项目视图中节点的表示。 

例如，这用于更改模块节点的图标以反映模块类型或将 URL 和服务器路径添加到 Python Jupyter 目录作为位置字符串。

要修改项目视图节点表示，请实施 ProjectViewNodeDecorator 并将其注册为 com.intellij.projectViewNodeDecorator 扩展。 

从接口中只需要实现修改 ProjectViewNodes 的 decorate() 方法。 如果您需要在某些事件上更新节点表示，请使用 ProjectView.update()。


# Modifying Project View Structure

本教程旨在说明如何以编程方式修改项目树结构视图外观。

本主题介绍 treeStructureProvider 示例插件。

下面的步骤显示了如何在项目视图面板中过滤掉文本文件和目录并使其仅可见。

其他用例包括：

分组/嵌套相关条目，例如 GUI Designer .form 文件和相关绑定类 (FormMergerTreeStructureProvider)。

提供额外的“嵌套”节点，例如，自定义存档文件的内容

## Register Custom TreeStructure Provider

向 plugin.xml 添加新的 com.intellij.treeStructureProvider 扩展

```xml
<extensions defaultExtensionNs="com.intellij">
  <treeStructureProvider implementation="org.intellij.sdk.treeStructureProvider.TextOnlyTreeStructureProvider"/>
</extensions>
```

## Implement Custom TreeStructureProvider

要提供自定义结构视图行为，请在 modify() 方法中使用节点过滤逻辑实现 TreeStructureProvider。 

下面的示例显示了如何过滤掉所有项目视图节点，除了那些对应于文本文件和目录的节点。

```java
public class TextOnlyTreeStructureProvider implements TreeStructureProvider {

  @NotNull
  @Override
  public Collection<AbstractTreeNode<?>> modify(@NotNull AbstractTreeNode<?> parent,
                                                @NotNull Collection<AbstractTreeNode<?>> children,
                                                ViewSettings settings) {
    ArrayList<AbstractTreeNode<?>> nodes = new ArrayList<>();
    for (AbstractTreeNode<?> child : children) {
      if (child instanceof PsiFileNode) {
        VirtualFile file = ((PsiFileNode) child).getVirtualFile();
        if (file != null && !file.isDirectory() && !(file.getFileType() instanceof PlainTextFileType)) {
          continue;
        }
      }
      nodes.add(child);
    }
    return nodes;
  }

}
```

# 参考资料

https://plugins.jetbrains.com/docs/intellij/project-view.html

* any list
{:toc}