---
layout: post
title:  Idea Plugin Dev-03-01-User Interface Components
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# User Interface Components

IntelliJ 平台包含大量自定义 Swing 组件。 

在您的插件中使用这些组件将确保您的插件的外观和工作与 IDE 其余部分的 UI 一致，并且与使用默认的 Swing 组件相比通常可以减少代码大小。

## 值得注意的部分

ps: 这部分没必要全部按照文档来，直接大概学习，使用时遇到问题再参考文档。

The following components are particularly noteworthy:

Menus and toolbars are built using Actions

Tool Windows

Dialogs

Popups

Notifications

File and Class Choosers

Editor Components

List and Tree Controls

Status Bar Widgets

Tables (TableView) (TBD)

Drag & Drop Helpers (TBD)

Miscellaneous Swing Components

Messages

JBSplitter

JBTabs

# 以下是一些重要的 UI 组件的简要介绍：

1. JLabel（标签）：用于显示文本或图像，通常用于向用户展示信息。

2. JTextField（文本框）：用于接收用户输入的单行文本。

3. JTextArea（文本区域）：用于接收用户输入的多行文本。

4. JButton（按钮）：用于触发某个操作或执行特定的动作。

5. JCheckBox（复选框）：允许用户选择一个或多个选项。

6. JRadioButton（单选按钮）：允许用户在一组选项中选择一个。

7. JComboBox（下拉框）：提供一个下拉菜单，用户可以从预定义的选项中选择一个。

8. JList（列表）：显示一组选项，用户可以选择其中的一个或多个。

9. JScrollPane（滚动面板）：用于包装大量内容，并提供滚动条来浏览内容。

10. JTable（表格）：用于显示和编辑二维表格数据。

11. JPanel（面板）：用于组织和容纳其他组件，可以用作布局容器。

12. JFrame（窗口）：用于创建应用程序的顶级窗口。

这些是常见且常用的 UI 组件，它们可以用于构建各种类型的用户界面。每个组件都有其特定的功能和用途，你可以根据应用程序的需求选择适当的组件进行使用。

当然，Java Swing 还提供了其他许多组件和容器，以满足不同的用户界面设计和交互需求。

# 详细介绍一下 Tool Windows

Tool Windows（工具窗口）是 IntelliJ IDEA 提供的一种界面元素，用于提供特定功能和工具的可视化展示和操作。它们以独立的面板形式存在于 IDE 的边缘或特定区域，并可以根据用户的需要进行展开或收起。

Tool Windows 可以用于集成各种功能和工具，例如版本控制、数据库管理、构建工具、文件导航、搜索等。每个工具窗口都有其特定的功能和用途，可以帮助开发者提高工作效率。

以下是一些常见的 Tool Windows：

1. Project（项目）：显示项目文件结构，允许导航和管理项目中的文件。

2. Version Control（版本控制）：集成版本控制系统，如 Git、SVN 等，用于查看和管理代码版本、分支和提交记录。

3. Run/Debug（运行/调试）：用于启动、运行和调试应用程序，提供控制台、调试窗口和运行配置等功能。

4. Terminal（终端）：提供命令行界面，可以执行各种命令和脚本。

5. Database（数据库）：用于连接和管理数据库，执行查询、编辑数据、导入导出等操作。

6. Maven/Gradle/Build（构建工具）：用于管理项目的构建工具，执行构建、依赖管理和编译等操作。

7. Version Control（版本控制）：集成版本控制系统，如 Git、SVN 等，用于查看和管理代码版本、分支和提交记录。

8. TODO（待办事项）：显示代码中的待办事项，帮助开发者跟踪和管理任务。

9. Structure（结构）：显示当前文件的结构，例如类、方法、字段等，方便导航和浏览代码。

10. Find（查找）：提供强大的搜索功能，支持全局搜索、替换和正则表达式等。

通过工具窗口，开发者可以方便地访问和操作各种功能和工具，提高开发效率和舒适度。工具窗口通常可以通过 IDE 的菜单、快捷键或者点击相应的工具栏按钮来打开或关闭。你可以根据自己的需求和使用习惯来配置和使用工具窗口。

# 1. 介绍一下 ui 组件 Dialogs

Dialogs（对话框）是用户界面中常用的组件，用于与用户进行交互并获取输入或显示信息。

对话框通常作为模态窗口出现，意味着用户需要在对话框关闭之前处理它，以确保继续与应用程序进行交互。

Dialogs 可以用于多种场景，如显示警告、错误或确认消息、提示用户输入、进行选择或显示详细信息等。

以下是一些常见的 Dialogs 类型：

1. Message Dialogs（消息对话框）：用于显示一般的消息，例如提示、警告或错误信息。通常只包含一个消息文本和一个确定按钮。

2. Input Dialogs（输入对话框）：用于获取用户输入，例如要求用户输入文本、数字、密码等。通常包含一个消息文本、一个输入字段和确定/取消按钮。

3. Confirmation Dialogs（确认对话框）：用于确认用户的操作，例如在执行重要操作之前要求用户确认。通常包含一个消息文本、一个确定按钮和一个取消按钮。

4. Option Dialogs（选项对话框）：用于提供多个选项供用户选择。通常包含一个消息文本、多个选项按钮和一个取消按钮。

5. File Chooser Dialogs（文件选择对话框）：用于选择文件或目录。可以选择单个文件、多个文件或整个目录。

Dialogs 提供了与用户进行交互的丰富功能，可以根据需求自定义对话框的内容、按钮、事件处理等。它们可以通过编程方式创建和显示，通常由应用程序的其他部分触发，并在用户完成操作后返回结果。

在使用 Dialogs 时，要注意用户体验和易用性，确保对话框的设计清晰、明确，并遵循用户界面的一致性和可访问性原则，以提供良好的用户体验。

# 2. 介绍一下 ui 组件 Popups

Popups（弹出窗口）是用户界面中常用的组件，用于在屏幕上方或下方显示临时的信息、菜单或用户界面。它们通常是短暂的、模态或非模态的，并提供了一种在用户界面上方或下方显示内容的方式，而不中断当前操作或转移焦点。

Popups 可以用于多种场景，例如：

1. Tooltips（工具提示）：当用户将鼠标悬停在组件上时，显示一个短暂的、带有文本或其他信息的小窗口，用于提供有关组件的额外说明或提示。

2. Context Menus（上下文菜单）：在用户右键单击组件或某个区域时，显示一个菜单，提供与当前上下文相关的操作选项。

3. Notifications（通知）：用于显示临时的通知或警告消息，以向用户传达重要的信息，例如操作成功、错误提示或其他提示信息。

4. Popovers（弹出菜单）：当用户点击某个元素时，显示一个临时的菜单或下拉列表，提供额外的选项或操作。

Popups 提供了一种轻量级、临时性的交互方式，可以在用户界面中提供额外的功能或信息，同时不会占据太多的屏幕空间或干扰用户的当前操作。

在使用 Popups 时，要注意设计的合理性和可用性，确保内容明确、易于理解，并且不会干扰用户的工作流程。

同时，应根据需要调整弹出窗口的位置、大小和外观，以适应不同的界面布局和用户体验需求。

# 3. ui 组件之 File and Class Choosers

File and Class Choosers（文件选择器和类选择器）是用户界面中常用的组件，用于让用户选择文件、目录或类名等相关信息。

1. 文件选择器（File Choosers）：文件选择器提供了一种让用户浏览和选择文件的交互方式。它通常包含一个文件浏览器界面，允许用户在文件系统中导航、打开文件、保存文件或选择文件夹。文件选择器还可以支持文件过滤器，以限制用户只能选择特定类型的文件。

2. 类选择器（Class Choosers）：类选择器允许用户从类路径中选择一个类名。它通常用于需要用户输入特定类的场景，例如配置文件中的类名或反射操作。类选择器提供一个文本框和一个浏览按钮，点击浏览按钮时，会弹出一个窗口显示类路径，并允许用户浏览和选择类。

File and Class Choosers 提供了方便的界面元素，用于与用户交互并获取相关信息。通过使用这些组件，可以简化用户选择文件、目录或类名的过程，提高用户体验和界面的可用性。在使用这些组件时，可以根据需要设置默认路径、文件过滤器、文件类型限制等，以满足具体的应用需求。

同时，需要注意用户界面的友好性和易用性，确保提供清晰的指示和提示，使用户能够轻松地找到并选择所需的文件或类。

## 文件选择实战

```java
private void configImportButtonListener(final JPanel panel, final JButton configImportButton) {
    configImportButton.addActionListener(e -> {
        try {
            FileChooserDescriptor descriptor = FileChooserDescriptorFactory.createSingleFileDescriptor();
            descriptor.setTitle("配置导入");
            descriptor.setDescription("选择配置文件");
            descriptor.setShowFileSystemRoots(true); // 显示文件系统根目录
            descriptor.setHideIgnored(true); // 隐藏被忽略的文件
            // 设置文件类型过滤器，例如只允许选择 Java 文件
            descriptor.withFileFilter(file -> !file.isDirectory());
            VirtualFile selectedFile = FileChooser.chooseFile(descriptor,
                    ProjectManager.getInstance().getDefaultProject(), null);
            if (selectedFile != null) {
                // 用户选择了文件
                String selectedFilePath = selectedFile.getPath();
                String fileContent = FileUtil.getFileContent(selectedFilePath);
                DatabaseMigrateConfig config = JSON.parseObject(fileContent, DatabaseMigrateConfig.class);
                initInputWithConfig(panel, config);
            }
        } catch (Exception ex) {
            InnerMsgUtils.showError(ex);
        }
    });
}
```

## 文件保存实战

```java
/**
 * 配置导出按钮点击事件
 *
 * @param panel              面板
 * @param configExportButton 导出按钮
 */
private void configExportButtonListener(final JPanel panel, final JButton configExportButton) {
    configExportButton.addActionListener(e -> {
        try {
            FileSaverDescriptor descriptor = new FileSaverDescriptor("保存配置", "选择一个文件夹保存配置", "cfg");
            FileSaverDialog saveFileDialog = FileChooserFactory.getInstance()
                    .createSaveFileDialog(descriptor, ProjectManager.getInstance().getDefaultProject());
            VirtualFileWrapper saveFileWrapper = saveFileDialog.save(null, null);
            if (saveFileWrapper != null) {
                // 处理保存的文件路径
                String saveFilePath = saveFileWrapper.getFile().getPath();
                // ...
                DatabaseMigrateConfig config = buildConfigFromInput(panel);
                FileUtil.write(saveFilePath, JSON.toJSONString(config));
                JOptionPane.showMessageDialog(null, "保存路径: " + saveFilePath);
            }
        } catch (Exception ex) {
            InnerMsgUtils.showError(ex);
        }
    });
}
```

# 4. idea ui 组件 Editor Components

在 IntelliJ IDEA 中，Editor Components 是用于编辑代码的关键 UI 组件。

它们提供了强大的代码编辑功能和用户界面交互，使开发者能够高效地编辑和浏览源代码。

下面是一些常见的 IDEA UI 编辑器组件：

1. Editor（编辑器）：Editor 是 IDEA 中用于显示和编辑代码的主要组件。它支持语法高亮、代码补全、代码折叠、代码格式化、代码导航等功能。每个打开的文件都在一个独立的编辑器中显示。

2. Document（文档）：Document 是编辑器中的文本模型，它代表了编辑器中的源代码。开发者可以通过 Document 对象访问和修改代码的内容，例如插入、删除和替换文本等操作。

3. Caret（插入符）：Caret 是一个可见的光标，标识当前编辑位置。它可以在文本中移动，用于选择、编辑和导航代码。IDEA 支持多个插入符，可以在不同的位置同时进行编辑。

4. Selection（选择）：Selection 是编辑器中选定的文本部分。开发者可以通过选择文本来执行各种操作，如复制、剪切、粘贴和格式化等。

5. Highlighting（高亮显示）：IDEA 提供了丰富的语法和错误高亮功能。它可以根据代码语法和语义进行高亮显示，帮助开发者快速识别和理解代码的结构。

6. Code Completion（代码补全）：IDEA 提供智能的代码补全功能，可以根据上下文自动提示代码建议。它可以加快编码速度，减少拼写错误，并提供相关的代码文档和参数信息。

7. Code Folding（代码折叠）：IDEA 支持代码折叠功能，允许开发者折叠或展开代码块，以便更好地组织和浏览源代码。

8. Code Navigation（代码导航）：IDEA 提供多种代码导航功能，如跳转到定义、查找引用、查找符号等，帮助开发者快速定位和浏览代码的各个部分。

这些是 IntelliJ IDEA 中常见的 Editor Components。

它们共同构成了一个功能强大且可定制的代码编辑器，提供了丰富的编辑功能和交互体验，使开发者能够更加高效地编写和管理代码。



# 5. List and Tree Controls

在UI设计中，列表（List）和树（Tree）是常见的控件，用于显示和组织数据。

在IntelliJ IDEA中，也提供了列表和树控件，用于展示项目结构、文件列表、搜索结果等信息。下面是关于列表和树控件的详细介绍：

1. List（列表）：列表是一种线性的控件，用于显示一列项目或数据项。

在IntelliJ IDEA中，列表通常用于显示文件列表、搜索结果、选择项等。用户可以通过滚动、选择、点击等方式与列表交互。IntelliJ IDEA提供了丰富的功能来定制和操作列表，如多选、排序、过滤、拖放等。

2. Tree（树）：树是一种层级结构的控件，用于展示具有父子关系的数据。在IntelliJ IDEA中，树控件通常用于显示项目结构、包结构、文件系统等信息。用户可以通过展开、折叠、选择、勾选等方式与树交互。IntelliJ IDEA提供了丰富的功能来定制和操作树，如节点编辑、拖放、筛选、搜索等。

IntelliJ IDEA提供了相应的API来创建、配置和操作列表和树控件。开发者可以使用这些API来构建自定义的列表和树组件，并与其进行交互。一些常用的API包括：

- `JList`：用于创建和管理列表控件的基本类。
- `DefaultListModel`：默认的列表模型，用于管理列表数据。
- `JTree`：用于创建和管理树控件的基本类。
- `DefaultTreeModel`：默认的树模型，用于管理树数据。

开发者可以使用这些类及其相关方法来创建、配置和操作列表和树控件，包括添加、删除、修改和获取数据项，设置选择和展开状态，自定义绘制和交互行为等。

列表和树控件在IntelliJ IDEA中广泛应用于项目导航、文件浏览、搜索和过滤、代码结构展示等场景，提供了方便的数据展示和导航功能，帮助开发者更好地理解和管理代码。

## List 使用例子

```java
import com.intellij.openapi.project.Project;
import com.intellij.openapi.ui.DialogWrapper;
import com.intellij.openapi.ui.Messages;
import com.intellij.ui.components.JBList;
import org.jetbrains.annotations.Nullable;

import javax.swing.*;
import java.awt.*;
import java.util.Arrays;

public class ListExampleDialog extends DialogWrapper {

    private JBList<String> list;

    protected ListExampleDialog(@Nullable Project project) {
        super(project);
        setTitle("List Example");
        init();
    }

    @Nullable
    @Override
    protected JComponent createCenterPanel() {
        // 创建一个字符串数组作为列表的数据
        String[] fruits = {"Apple", "Banana", "Orange", "Mango", "Grapes"};

        // 创建 JBList，并将字符串数组作为数据模型传入
        list = new JBList<>(fruits);

        // 设置列表显示的可见行数
        list.setVisibleRowCount(5);

        // 创建一个滚动面板，将列表添加到滚动面板中
        JScrollPane scrollPane = new JScrollPane(list);

        // 设置滚动面板的大小和首选大小
        scrollPane.setPreferredSize(new Dimension(200, 150));

        // 将滚动面板作为对话框的中心面板返回
        return scrollPane;
    }

    @Override
    protected void doOKAction() {
        // 获取选中的列表项
        String selectedValue = list.getSelectedValue();
        if (selectedValue != null) {
            // 显示选中的列表项
            Messages.showMessageDialog(getRootPane(), "Selected Item: " + selectedValue, "Selected Item", Messages.getInformationIcon());
        }

        super.doOKAction();
    }

    public static void main(String[] args) {
        ListExampleDialog dialog = new ListExampleDialog(null);
        dialog.show();
    }
}
```

看了下样式并没有很惊艳。

# idea 组件介绍 Status Bar Widgets 

Status Bar Widgets（状态栏小部件）是IntelliJ IDEA中的UI组件，用于在IDE状态栏中显示有关项目或IDE状态的信息。它们可以向用户提供有用的实时反馈和快捷操作。

IntelliJ IDEA提供了一些内置的Status Bar Widgets，也允许插件开发者创建自定义的Status Bar Widgets来满足特定需求。

以下是一些常见的内置Status Bar Widgets：

1. 操作系统状态：显示操作系统的相关信息，例如CPU使用率、内存使用情况等。

2. 代码检查：显示当前项目中的代码检查结果，如警告和错误数量。

3. 版本控制：显示与版本控制系统（如Git、SVN）相关的信息，如当前分支、未提交的变更等。

4. 构建进度：显示正在进行的构建任务的进度和状态。

5. 语言设置：允许快速切换编辑器的语言设置，如Java、Python、JavaScript等。

6. 编码设置：允许快速切换文件的编码设置，如UTF-8、GBK等。

这些小部件可以根据用户的需求进行配置，可以通过右键单击状态栏来打开"Configure Status Bar"菜单，选择要显示的小部件，调整它们的顺序和位置。

对于插件开发者，可以使用IntelliJ IDEA的API来创建自定义的Status Bar Widgets。插件开发者可以根据自己的需求，创建自定义的小部件来显示与插件功能相关的信息。

总之，Status Bar Widgets是IntelliJ IDEA的一个有用的UI组件，可以向用户提供实时信息和快捷操作，帮助提高开发效率。

# 其他 Swing 组件

## Messages

Messages 类提供了一种显示简单消息框、输入对话框（带有文本字段的模式对话框）和选择器对话框（带有组合框的模式对话框）的方法。 

类的不同方法的功能应该从它们的名称中一目了然。 在 macOS 上运行时，消息类显示的消息框使用本机 UI。

showCheckboxMessageDialog() 函数提供了一种在消息上实现不再显示复选框的简单方法。

请注意，建议在适当的时候使用非模态通知而不是模态消息框。 请参阅通知主题以获取更多信息。

## JBSplitter

JBSplitter 类是 JetBrains 对标准 JSplitPane 类的替代。 

与其他一些 JetBrains 增强型 Swing 组件不同，它不是直接替代品并且具有不同的 API。 

但是，为了获得一致的用户体验，建议使用 JBSplitter 而不是标准的 JSplitPane。

要将组件添加到拆分器，请调用 setFirstComponent() 和 setSecondComponent() 方法。

JBSplitter 支持自动记忆分割比例。 

要启用它，请调用 setSplitterProportionKey() 方法并传递用于存储比例的 ID。

## JBTabs

JBTabs 类是 JetBrains 的选项卡控件实现，用于编辑器选项卡和一些其他组件。 

与标准的 Swing 选项卡相比，它具有明显不同的外观和感觉，并且在 macOS 平台上看起来不那么原生，因此由开发人员选择哪个选项卡控件更合适。

## Toolbars 工具栏

有关概述，请参阅 IntelliJ 平台 UI 指南中的工具栏。

从 Actions 构建 UI 包括创建基于 AnAction 的工具栏。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/user-interface-components.html

* any list
{:toc}