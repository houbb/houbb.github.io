---
layout: post
title:  Idea Plugin Dev-14-01-Project Structure
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# Project Structure

本主题考虑基于 IntelliJ 平台和相关主题的项目概念，例如模块、构面、库和 SDK。 讨论了可用于管理项目和模块的项目结构和 Java 类。

# 项目及其组件 Project and Its Components﻿

本节简要讨论 IDEA 项目结构、项目组件和相关术语。 

有关项目及其组件的更多信息，请参阅 IntelliJ IDEA Web 帮助中的项目、模块、库、Facet。

使用 ProjectSettingsService 打开项目结构对话框中的相关条目。

## 项目

在 IntelliJ 平台中，项目将项目的所有源代码、库和构建指令封装到一个组织单元中。 

使用 IntelliJ Platform SDK 所做的一切都是在项目的上下文中完成的。 

项目定义称为模块和库的集合。 

根据项目的逻辑和功能需求，您可以创建单模块或多模块项目。

## 模块 Module﻿

模块是一个离散的功能单元，可以独立运行、测试和调试。 

模块包括源代码、构建脚本、单元测试、部署描述符等。在一个项目中，每个模块都可以使用特定的 SDK 或继承在项目级别定义的 SDK（请参阅本文档下面的 SDK 部分）。 

一个模块可以依赖于项目的其他模块。

## Library 

库是模块所依赖的已编译代码（例如 JAR 文件）的存档。 

IntelliJ 平台支持三种类型的库：

模块库：库类只在本模块可见，库信息记录在模块的.iml文件中。

项目库：库类在项目内可见，库信息记录在项目的.ipr文件或.idea/libraries中。

全局库：库信息记录在~/.IntelliJIdea/config/options目录下的applicationLibraries.xml文件中。 全局库类似于项目库，但对不同的项目可见。

有关库的更多信息，请参阅库。

## SDK

每个项目都使用软件开发工具包 (SDK)。 对于Java项目，SDK简称为JDK（Java Development Kit）。

SDK 决定使用哪个 API 库来构建项目。 如果一个项目是多模块的，则默认情况下项目内的所有模块都使用项目 SDK。 或者，项目可以为每个模块配置单独的 SDK。

有关 SDK 的更多信息，请参阅 IntelliJ IDEA Web 帮助中的使用 SDK。

## Facet

Facet 表示特定配置，特定于与模块关联的特定框架/技术。 

一个模块可以有多个方面。 

例如，特定于 Spring 的配置存储在 Spring facet 中。

Facet 记录在 IntelliJ IDEA Web 帮助中的 Facet 和语言和框架特定指南下。

# 详细介绍一下 idea 的 Project Structure

Idea 的 Project Structure（项目结构）是用于管理和配置项目的功能。它允许您查看和修改项目的各种设置，包括模块、依赖项、编译选项、版本控制等。

要打开 Project Structure，可以使用以下方法之一：

1. 通过主菜单：选择 "File" -> "Project Structure"。

2. 使用快捷键：按下 "Ctrl + Alt + Shift + S"（Windows/Linux）或 "Cmd + ;"（Mac）。

下面是 Project Structure 中的一些重要部分：

1. Modules（模块）：模块是项目的基本组成单元。在 Modules 部分，您可以创建、编辑和删除模块。每个模块都有自己的设置，如源代码、依赖项、输出路径等。

2. Libraries（库）：在 Libraries 部分，您可以添加项目所需的外部库和依赖项。您可以从本地文件系统、Maven、Gradle 等导入库。

3. Dependencies（依赖项）：在 Dependencies 部分，您可以管理模块之间的依赖关系。您可以添加、删除和修改模块之间的依赖关系，并指定依赖项的范围和版本。

4. Artifacts（构件）：在 Artifacts 部分，您可以配置项目的构建输出。您可以创建可执行的 JAR 文件、WAR 文件、可部署的插件等。您可以定义构建输出的文件和目录结构，并指定构建过程中的资源和依赖项。

5. SDKs（软件开发工具包）：在 SDKs 部分，您可以配置项目使用的 JDK。您可以添加和删除 JDK，并为每个 JDK 指定其版本和路径。

6. Facets（模块特性）：在 Facets 部分，您可以为模块添加特定的功能，如 Web、Android、Spring 等。每个特性都有自己的配置和设置。

除了上述部分之外，Project Structure 中还包括其他设置，如编译选项、版本控制、模板、任务等。

通过使用 Project Structure，您可以灵活地管理和配置您的项目，以满足特定的需求和要求。

# 详细介绍一下 idea 插件如何使用 Project

在 IDEA 插件开发中，可以使用 `com.intellij.openapi.project.Project` 类来与当前项目进行交互和操作。

`Project` 对象代表了一个打开的 IDEA 项目，可以获取项目的各种信息，管理文件和模块，执行操作等。

以下是一些常见的 `Project` 类的用法：

1. 获取当前项目：
   ```java
   Project project = e.getProject();
   ```

2. 获取项目路径：
   ```java
   String projectPath = project.getBasePath();
   ```

3. 获取项目模块：
   ```java
   Module[] modules = ModuleManager.getInstance(project).getModules();
   ```

4. 执行在项目上下文中的操作：
   ```java
   WriteCommandAction.runWriteCommandAction(project, () -> {
       // 在这里执行需要在项目上下文中执行的操作
   });
   ```

5. 打开文件或者查找文件：
   ```java
   // 打开文件
   VirtualFile file = LocalFileSystem.getInstance().findFileByPath(filePath);
   if (file != null) {
       OpenFileDescriptor descriptor = new OpenFileDescriptor(project, file);
       FileEditorManager.getInstance(project).openEditor(descriptor, true);
   }

   // 查找文件
   PsiFile psiFile = PsiManager.getInstance(project).findFile(file);
   ```

6. 注册项目事件监听器：

   ```java
   project.getMessageBus().connect().subscribe(ProjectTopics.PROJECT_ROOTS, new ModuleRootListener() {
       @Override
       public void rootsChanged(ModuleRootEvent event) {
           // 处理项目根路径变化事件
       }
   });
   ```

以上只是 IDEA 插件开发中使用 `Project` 类的一些基本示例。

通过使用 `Project` 对象，您可以访问项目的各种功能和信息，实现与项目的交互和操作。

# 详细介绍一下 idea 插件如何使用 Module

在 IDEA 插件开发中，`Module` 代表了项目中的一个模块，它包含了模块的配置信息、源代码、依赖关系等。

通过使用 `Module` 对象，可以对模块进行各种操作和获取相关信息。

以下是一些常见的 `Module` 类的用法：

1. 获取当前模块：
   ```java
   Module module = ModuleUtil.findModuleForPsiElement(psiElement);
   ```

2. 获取模块的名称和路径：
   ```java
   String moduleName = module.getName();
   String modulePath = module.getModuleFilePath();
   ```

3. 获取模块的源代码目录：
   ```java
   VirtualFile[] sourceRoots = ModuleRootManager.getInstance(module).getSourceRoots();
   ```

4. 获取模块的依赖关系：
   ```java
   Module[] dependencies = ModuleRootManager.getInstance(module).getDependencies();
   ```

5. 在模块上执行操作：

   ```java
   WriteCommandAction.runWriteCommandAction(module.getProject(), () -> {
       // 在这里执行需要在模块上下文中执行的操作
   });
   ```

6. 获取模块中的 PsiElement（如类、方法等）：
   ```java
   PsiManager psiManager = PsiManager.getInstance(module.getProject());
   PsiClass psiClass = psiManager.findClass(className, module.getModuleWithDependenciesAndLibrariesScope(false));
   ```

7. 注册模块事件监听器：
   ```java
   ModuleRootManager.getInstance(module).addModuleRootListener(new ModuleRootListener() {
       @Override
       public void rootsChanged(ModuleRootEvent event) {
           // 处理模块根路径变化事件
       }
   });
   ```

以上只是 IDEA 插件开发中使用 `Module` 类的一些基本示例。通过使用 `Module` 对象，可以访问模块的各种信息、执行操作和监听事件，从而实现对模块的灵活控制和操作。


# 详细介绍一下 idea 插件如何使用 Library

在 IDEA 插件开发中，`Library` 代表了项目的一个库或依赖项，它可以包含一组 JAR 文件或其他资源文件，用于在项目中引用和使用第三方库或自定义的库。

以下是一些常见的 `Library` 类的用法：

1. 创建库：
   ```java
   LibraryTable libraryTable = LibraryTablesRegistrar.getInstance().getLibraryTable(project);
   Library library = libraryTable.createLibrary(libraryName);
   ```

2. 添加 JAR 文件到库：
   ```java
   Library.ModifiableModel libraryModel = library.getModifiableModel();
   libraryModel.addRoot(jarFileUrl, OrderRootType.CLASSES);
   libraryModel.commit();
   ```

3. 获取库的名称和路径：
   ```java
   String libraryName = library.getName();
   String libraryPath = library.getUrls(OrderRootType.CLASSES)[0];
   ```

4. 获取库的所有 JAR 文件：
   ```java
   LibraryOrderEntry libraryOrderEntry = ModuleRootManager.getInstance(module).findLibraryOrderEntry(library);
   VirtualFile[] jarFiles = libraryOrderEntry.getFiles(OrderRootType.CLASSES);
   ```

5. 检查库是否存在：
   ```java
   LibraryTable libraryTable = LibraryTablesRegistrar.getInstance().getLibraryTable(project);
   Library library = libraryTable.getLibraryByName(libraryName);
   if (library != null) {
       // 库存在
   } else {
       // 库不存在
   }
   ```

6. 注册库变化监听器：
   ```java
   LibraryTable libraryTable = LibraryTablesRegistrar.getInstance().getLibraryTable(project);
   libraryTable.addListener(new LibraryTable.Listener() {
       @Override
       public void afterLibraryAdded(Library library) {
           // 处理库添加事件
       }

       @Override
       public void afterLibraryRenamed(Library library) {
           // 处理库重命名事件
       }

       @Override
       public void beforeLibraryRemoved(Library library) {
           // 处理库移除事件
       }
   });
   ```

以上只是 IDEA 插件开发中使用 `Library` 类的一些基本示例。通过使用 `Library` 对象，可以创建库、添加和管理库中的 JAR 文件，获取库的信息和路径，以及监听库的变化。

这些功能可以帮助插件开发者更好地处理项目中的依赖项和第三方库。

# 详细介绍一下 idea 插件如何使用 SDK

在 IDEA 插件开发中，`SDK`（Software Development Kit）是指用于编译和运行项目的软件开发工具包。

IDEA 提供了对各种 SDK 的支持，包括 Java SDK、Android SDK、Python SDK 等。

以下是使用 SDK 的一些常见操作和用法：

1. 配置项目的 SDK：
   在 IDEA 中，可以通过以下步骤配置项目的 SDK：
   - 打开项目设置（File -> Project Structure）。
   - 在左侧的面板中选择 "Project" 或 "Modules"。
   - 在右侧的面板中，选择 "SDKs" 选项卡。
   - 点击 "+" 按钮添加一个新的 SDK。
   - 选择所需的 SDK 类型，并配置相关的路径和设置。
   - 应用更改并关闭项目设置。

2. 获取项目的 SDK：
   在插件开发过程中，可以通过以下方式获取项目当前使用的 SDK：
   ```java
   Project project = ...
   Sdk projectSdk = ProjectRootManager.getInstance(project).getProjectSdk();
   ```

3. 获取模块的 SDK：
   如果项目中有多个模块，并且每个模块可以单独配置 SDK，可以使用以下代码获取特定模块的 SDK：
   ```java
   Module module = ...
   Sdk moduleSdk = ModuleRootManager.getInstance(module).getSdk();
   ```

4. 列举可用的 SDK：
   可以使用以下代码列举项目中可用的 SDK：
   ```java
   Project project = ...
   Sdk[] sdks = ProjectJdkTable.getInstance().getAllJdks();
   for (Sdk sdk : sdks) {
       // 处理每个 SDK
   }
   ```

5. 使用 SDK 中的工具和类库：

   在插件开发过程中，可以使用 SDK 中提供的工具和类库。例如，如果项目使用了 Java SDK，可以使用 Java 相关的类和方法进行开发。
   
   具体使用方式取决于所使用的 SDK 类型和相应的 API 文档。

通过使用 SDK，插件开发者可以在 IDEA 插件中配置和管理项目的开发工具包。

这样可以确保插件在正确的环境中编译和运行，并且可以利用 SDK 提供的功能和类库进行开发。


# 详细介绍一下 idea 插件如何使用 Facet﻿

在 IntelliJ IDEA 插件开发中，Facet（工程构建模块）是一种用于管理项目特定功能和设置的机制。它允许在项目中添加额外的功能模块，例如 Web 应用程序、Android 应用程序、数据库等。每个 Facet 可以拥有自己的设置、依赖项和配置。

以下是使用 Facet 的一些常见操作和用法：

1. 添加 Facet：
   在 IntelliJ IDEA 中，可以通过以下步骤为项目添加 Facet：
   - 打开项目设置（File -> Project Structure）。
   - 在左侧的面板中选择 "Facets"。
   - 在右侧的面板中，点击 "+" 按钮添加一个新的 Facet。
   - 选择所需的 Facet 类型，并根据类型提供必要的设置和信息。
   - 应用更改并关闭项目设置。

2. 配置 Facet：
   一旦添加了 Facet，可以在 Facet 设置中配置相关的选项和属性。不同的 Facet 类型具有不同的设置选项，可以根据项目的需求进行配置。例如，对于 Web 应用程序 Facet，可以配置 Web 服务器、上下文路径、部署选项等。

3. Facet 依赖项：
   Facet 可以与其他 Facet 之间建立依赖关系，这样一个 Facet 就可以使用另一个 Facet 提供的功能和资源。例如，一个 Web 应用程序 Facet 可以依赖于一个数据库 Facet，以便访问数据库连接和操作。

4. Facet 配置文件：
   每个 Facet 都有一个相应的配置文件，用于存储与该 Facet 相关的设置和信息。这些配置文件通常存储在项目的 `.idea` 目录下，以确保项目配置的一致性和可移植性。

5. 自定义 Facet：
   IntelliJ IDEA 允许开发者创建自定义的 Facet 类型来满足特定项目的需求。通过创建自定义 Facet，可以扩展插件的功能，并为项目提供额外的设置和功能。

使用 Facet 可以帮助插件开发者更好地管理和组织项目的功能和设置。它提供了一种灵活的方式来添加和配置不同类型的模块，并使插件开发更加模块化和可扩展。通过使用 Facet，开发者可以将不同的功能和设置绑定到特定的模块，以实现更精确和灵活的项目配置。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/project-structure.html

* any list
{:toc}