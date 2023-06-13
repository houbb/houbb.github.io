---
layout: post
title:  Idea Plugin Dev-12-01-Version Control System
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# vcs

IntelliJ IDEA 提供了强大的版本控制系统（Version Control System，VCS）集成，使开发人员能够轻松地与版本控制工具（如Git、SVN等）进行交互。下面是对 IntelliJ IDEA 插件中版本控制系统的详细介绍：

1. 支持的版本控制系统：IntelliJ IDEA 支持多种版本控制系统，包括 Git、SVN、Mercurial、Perforce 等。你可以根据项目需求选择合适的版本控制系统。

2. VCS 集成：IntelliJ IDEA 提供了与版本控制系统的深度集成，允许你在 IDE 中执行常见的版本控制操作，如提交、拉取、推送、更新、查看差异等。你可以通过界面或使用快捷键来访问这些操作。

3. 版本控制工具窗口：IntelliJ IDEA 提供了一个名为 "Version Control" 的工具窗口，用于显示项目中的版本控制信息。在该工具窗口中，你可以查看文件的状态、提交历史、分支信息等。

4. 文件状态标记：IntelliJ IDEA 使用文件状态标记来显示文件在版本控制系统中的状态。例如，修改过的文件会以不同的颜色显示，添加到版本控制中的文件会带有特定的标记等。

5. Diff 工具：IntelliJ IDEA 提供了内置的差异比较工具，使你可以轻松地查看文件之间的差异。你可以比较文件、文件夹或不同版本之间的差异，并进行合并操作。

6. 操作历史记录：IntelliJ IDEA 跟踪版本控制操作的历史记录，并允许你查看和还原先前的操作。你可以查看提交历史、撤销变更、恢复文件等。

7. 分支管理：IntelliJ IDEA 提供了便捷的分支管理功能。你可以创建、切换、合并和删除分支，并通过界面清晰地查看分支结构和状态。

8. 自动化操作：IntelliJ IDEA 支持自动化版本控制操作，如自动提交、自动拉取、自动合并等。你可以配置自动化操作的触发条件和行为，以便在特定的情况下自动执行版本控制操作。

IntelliJ IDEA 的版本控制系统功能使得与版本控制工具的集成变得简单和高效。它提供了一种无缝的工作流程，让开发人员能够更好地管理和协作项目中的代码，并享受版本控制的好处。无论你是个人开发者还是团队成员，版本控制系统的集成都能提高开发效率和代码质量。

# idea 插件开发中如何获取 git 的 changeList？

在 IntelliJ IDEA 插件开发中，你可以使用 `ChangeListManager` 类来获取 Git 的 `ChangeList`。

下面是获取 Git 变更列表的示例代码：

```java
import com.intellij.openapi.project.Project;
import com.intellij.openapi.vcs.changes.Change;
import com.intellij.openapi.vcs.changes.ChangeListManager;
import com.intellij.openapi.vcs.changes.LocalChangeList;
import com.intellij.openapi.vfs.VirtualFile;
import git4idea.GitUtil;

import java.util.List;

public class GitChangeListExample {
    public static void getGitChangeList(Project project) {
        ChangeListManager changeListManager = ChangeListManager.getInstance(project);
        List<LocalChangeList> changeLists = changeListManager.getChangeLists();

        for (LocalChangeList changeList : changeLists) {
            if (changeList.isDefault()) {
                // Skip default change list
                continue;
            }

            List<Change> changes = changeList.getChanges();
            for (Change change : changes) {
                VirtualFile file = change.getVirtualFile();
                if (GitUtil.isUnderGit(file)) {
                    // File is under Git version control
                    // Do something with the change
                    String filePath = file.getPath();
                    System.out.println("Change: " + filePath);
                }
            }
        }
    }
}
```

在上述代码中，我们首先通过 `ChangeListManager` 的 `getInstance()` 方法获取当前项目的 `ChangeListManager` 实例。

然后，使用 `getChangeLists()` 方法获取所有的变更列表。遍历变更列表，跳过默认变更列表，并获取每个变更列表中的变更。

对于每个变更，我们使用 `getVirtualFile()` 方法获取对应的虚拟文件，然后使用 `GitUtil.isUnderGit()` 方法判断文件是否受 Git 版本控制。

如果文件受 Git 版本控制，我们可以进一步处理该变更。

你可以在你的插件中调用上述方法，并传入当前项目的 `Project` 对象来获取 Git 的变更列表。

请确保在插件开发过程中已正确引入相关的依赖。

# idea 插件开发中如何获取 git 的 文件变更的具体内容？

在 IntelliJ IDEA 插件开发中，要获取 Git 中文件变更的具体内容，你可以使用 Git4idea 插件提供的 API。以下是一个示例代码，演示如何获取 Git 文件变更的具体内容：

```java
import com.intellij.openapi.project.Project;
import com.intellij.openapi.vcs.VcsException;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.vcs.log.CommitParents;
import com.intellij.vcs.log.VcsLogData;
import com.intellij.vcs.log.VcsRef;
import git4idea.GitUtil;
import git4idea.commands.GitCommand;
import git4idea.commands.GitCommandResult;
import git4idea.history.GitHistoryUtils;
import git4idea.history.browser.GitCommit;
import git4idea.history.browser.GitCommitDetails;

import java.util.List;

public class GitFileChangesExample {
    public static void getFileChanges(Project project, VirtualFile file) {
        if (!GitUtil.isUnderGit(file)) {
            // File is not under Git version control
            return;
        }

        try {
            VcsLogData logData = GitHistoryUtils.readAllRefs(project);
            List<VcsRef> refs = logData.getRoots();

            for (VcsRef ref : refs) {
                GitCommit commit = (GitCommit) ref.getObject();
                if (commit != null) {
                    GitCommandResult result = GitCommand.show(project, commit.getHash(), file.getPath());
                    if (result.success()) {
                        String fileContent = result.getOutput();
                        System.out.println("File content:\n" + fileContent);
                    }
                }
            }
        } catch (VcsException e) {
            e.printStackTrace();
        }
    }
}
```

在上述代码中，我们首先通过 `GitUtil.isUnderGit(file)` 方法检查文件是否受 Git 版本控制。然后，我们使用 `GitHistoryUtils.readAllRefs(project)` 方法获取当前项目的 Git 历史记录数据。通过遍历每个 Git 提交，使用 `GitCommand.show(project, commit.getHash(), file.getPath())` 方法执行 `git show` 命令获取指定文件在特定提交中的内容。如果命令执行成功，我们可以通过 `result.getOutput()` 获取文件的具体内容。

你可以在你的插件中调用上述方法，并传入当前项目的 `Project` 对象和要获取内容的文件的 `VirtualFile` 对象来获取 Git 文件变更的具体内容。请确保在插件开发过程中已正确引入相关的依赖，特别是 Git4idea 插件相关的依赖。

# idea 插件开发中如何获取 git 的 文件变更的 diff 内容？

在 IntelliJ IDEA 插件开发中，要获取 Git 文件变更的 diff 内容，你可以使用 Git4idea 插件提供的 API。以下是一个示例代码，演示如何获取 Git 文件变更的 diff 内容：

```java
import com.intellij.openapi.project.Project;
import com.intellij.openapi.vcs.VcsException;
import com.intellij.openapi.vcs.changes.Change;
import com.intellij.openapi.vcs.changes.ChangeListManager;
import com.intellij.openapi.vcs.diff.DiffProvider;
import com.intellij.openapi.vcs.history.VcsRevisionNumber;
import git4idea.GitUtil;
import git4idea.repo.GitRepository;
import org.jetbrains.annotations.NotNull;

public class GitFileDiffExample {
    public static void getFileDiff(Project project, String filePath) {
        ChangeListManager changeListManager = ChangeListManager.getInstance(project);
        GitRepository gitRepository = GitUtil.getRepositoryManager(project).getRepositoryForFile(filePath);

        if (changeListManager != null && gitRepository != null) {
            Change change = changeListManager.getChange(filePath);
            if (change != null) {
                DiffProvider diffProvider = gitRepository.getDiffProvider();
                VcsRevisionNumber beforeRevision = change.getBeforeRevision().getRevisionNumber();
                VcsRevisionNumber afterRevision = change.getAfterRevision().getRevisionNumber();

                try {
                    String diff = diffProvider.getDiffText(beforeRevision, afterRevision);
                    System.out.println("Diff content:\n" + diff);
                } catch (VcsException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```

在上述代码中，我们首先使用 `ChangeListManager.getInstance(project)` 获取变更列表管理器实例，并使用 `GitUtil.getRepositoryManager(project).getRepositoryForFile(filePath)` 获取文件所属的 Git 仓库。然后，我们使用 `changeListManager.getChange(filePath)` 获取指定文件的变更对象。

如果变更对象存在，我们可以通过获取 Git 仓库的 `DiffProvider` 接口实例，并使用 `diffProvider.getDiffText(beforeRevision, afterRevision)` 方法获取变更的 diff 内容。

最后，我们可以打印 diff 内容或者对其进行进一步处理。

你可以在你的插件中调用上述方法，并传入当前项目的 `Project` 对象和要获取 diff 内容的文件路径来获取 Git 文件变更的 diff 内容。

请确保在插件开发过程中已正确引入相关的依赖，特别是 Git4idea 插件相关的依赖。

# 小结

可以通过这个获取当前的变更内容，大大降低文件的扫描范围。

可以在这个基础上做很多有趣的内容，比如变更的覆盖率？QA？

# 参考资料

https://plugins.jetbrains.com/docs/intellij/vcs-integration-for-plugins.html

* any list
{:toc}