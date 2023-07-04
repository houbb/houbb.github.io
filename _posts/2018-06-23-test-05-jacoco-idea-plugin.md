---
layout: post
title: test 系统学习-05-test jacoco 测试覆盖率与 idea 插件
date:  2018-06-23 16:18:11 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 1. idea 中使用 maven jmockit，如何查看增量的代码覆盖率

在使用 Maven 和 JMockit 进行单元测试时，你可以结合使用 JaCoCo 插件来查看增量的代码覆盖率报告。

JaCoCo 是一个流行的代码覆盖率工具，它与 Maven 集成良好，并且可以与 JMockit 一起使用。

下面是在 IntelliJ IDEA 中使用 Maven 和 JMockit 来查看增量的代码覆盖率的步骤：

1. 确保你的 Maven 项目已经正确配置了 JaCoCo 插件。在你的 Maven POM 文件中，添加以下插件配置：

```xml
<build>
    <plugins>
        <!-- JaCoCo 插件配置 -->
        <plugin>
            <groupId>org.jacoco</groupId>
            <artifactId>jacoco-maven-plugin</artifactId>
            <version>0.8.7</version>
            <executions>
                <execution>
                    <id>prepare-agent</id>
                    <goals>
                        <goal>prepare-agent</goal>
                    </goals>
                </execution>
                <execution>
                    <id>report</id>
                    <phase>prepare-package</phase>
                    <goals>
                        <goal>report</goal>
                    </goals>
                </execution>
                <execution>
                    <id>check</id>
                    <goals>
                        <goal>check</goal>
                    </goals>
                    <configuration>
                        <rules>
                            <rule>
                                <element>BUNDLE</element>
                                <limits>
                                    <limit>
                                        <counter>LINE</counter>
                                        <value>COVEREDRATIO</value>
                                        <minimum>0.80</minimum>
                                    </limit>
                                </limits>
                            </rule>
                        </rules>
                    </configuration>
                </execution>
            </executions>
        </plugin>
        <!-- 其他插件配置 -->
    </plugins>
</build>
```

2. 在 IntelliJ IDEA 中打开 Maven 项目。确保项目已正确加载和配置。

3. 在 IntelliJ IDEA 的底部工具栏中，点击 "Maven Projects" 图标，打开 Maven 项目窗口。

4. 在 Maven 项目窗口中，展开 "Plugins" -> "jacoco" -> "jacoco:check"。

5. 右键点击 "jacoco:check"，选择 "Run Maven Build"。

6. Maven 将执行 JaCoCo 插件的 `jacoco:check` 目标，并生成增量的代码覆盖率报告。

7. 在 Maven 项目窗口中，展开 "target" -> "site" -> "jacoco"，找到 `index.html` 文件。

8. 双击 `index.html` 文件，它将在浏览器中打开，显示增量的代码覆盖率报告。

在代码覆盖率报告中，你可以查看各个类和方法的覆盖率百分比，了解哪些部分的代码被测试覆盖到了，哪些部分没有覆盖到。你还可以查看具体的代码行，以及覆盖和未覆盖的行数。

通过这种方式，你可以方便地在 IntelliJ IDEA 中使用 Maven 和 JMockit 来生成并查看增量的代码覆盖率


# 2. 如何编写一个 idea 插件，直接运行查看 jacoco 的覆盖率，让用户不修改 maven 信息？

要编写一个 IntelliJ IDEA 插件，以便在不修改 Maven 信息的情况下直接运行和查看 JaCoCo 的代码覆盖率报告，你可以遵循以下步骤：

1. 创建一个 IntelliJ IDEA 插件项目：在 IntelliJ IDEA 中，选择 "File" -> "New" -> "Project"，然后选择 "IntelliJ Platform Plugin"。

2. 配置插件项目：按照向导的提示，为插件项目选择合适的名称、位置和其他设置。

3. 在插件项目中添加 JaCoCo 依赖：在插件项目的 `build.gradle` 或 `pom.xml` 文件中，添加 JaCoCo 依赖。

例如，对于 Maven 项目，可以添加以下依赖：

```xml
<dependency>
    <groupId>org.jacoco</groupId>
    <artifactId>org.jacoco.agent</artifactId>
    <version>0.8.7</version>
    <scope>test</scope>
</dependency>
```

4. 创建插件的 Action 类：在插件项目中，创建一个继承自 `AnAction` 的类，该类将用于触发运行和查看 JaCoCo 覆盖率报告的操作。

```java
import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.project.Project;

public class RunJacocoCoverageAction extends AnAction {
    @Override
    public void actionPerformed(AnActionEvent event) {
        Project project = event.getProject();
        
        // 在此处编写运行 JaCoCo 覆盖率的逻辑
    }
}
```

5. 在 `plugin.xml` 文件中注册插件的 Action：在插件项目的 `src/main/resources/META-INF` 目录下，找到或创建 `plugin.xml` 文件。在该文件中注册插件的 Action。

```xml
<actions>
    <group id="YourGroupId" text="YourMenuText" description="YourDescription">
        <action id="RunJacocoCoverageAction" class="com.example.RunJacocoCoverageAction" text="Run Jacoco Coverage" description="Run Jacoco Coverage"/>
    </group>
</actions>
```

6. 在 `actionPerformed` 方法中编写 JaCoCo 覆盖率的逻辑：在 `actionPerformed` 方法中，编写运行 JaCoCo 覆盖率的逻辑。可以使用 JaCoCo 的 API 来执行覆盖率测试，并生成报告。

```java
import org.jacoco.agent.rt.RT;

public class RunJacocoCoverageAction extends AnAction {
    @Override
    public void actionPerformed(AnActionEvent event) {
        Project project = event.getProject();
        
        // 执行 JaCoCo 覆盖率测试
        RT.getAgent().setSessionId("your-session-id");
        // 运行你的测试代码
        // ...
        // 生成覆盖率报告
        // ...
    }
}
```

7. 编译和运行插件：使用 IntelliJ IDEA 提供的工具，将插件项目编译为插件包（JAR 文件），然后在 IntelliJ IDEA 中安装和运行插件。

8. 在 IntelliJ IDEA 中使用一旦你安装和运行了插件，你可以按照以下步骤在 IntelliJ IDEA 中使用插件来直接运行和查看 JaCoCo 的覆盖率报告：

1. 打开你想要测试覆盖率的项目或文件。

2. 在 IntelliJ IDEA 的菜单栏中，选择 "Run" -> "Run Jacoco Coverage"（或你在注册插件的时候指定的文本）。

3. 插件将执行 JaCoCo 覆盖率测试并生成覆盖率报告。

4. 一旦测试完成，插件将在 IntelliJ IDEA 的工具窗口中显示覆盖率报告。

通过这种方式，你可以使用你编写的插件来直接运行和查看 JaCoCo 的覆盖率报告，而无需修改项目的 Maven 信息。

请注意，以上提供的是一个简单的示例，用于说明如何创建和使用一个基本的 IntelliJ IDEA 插件。

在实际开发中，你可能需要进一步完善插件的功能和界面，以满足你的具体需求。

你可以参考 IntelliJ IDEA 插件开发文档和 JaCoCo 文档，深入了解更多细节和定制选项。

# actionPerformed 的信息可以更加详细些吗？对于 jacoco 的执行逻辑

当你在 `actionPerformed` 方法中编写 JaCoCo 覆盖率的逻辑时，以下是一个更详细的示例，包括 JaCoCo 的执行逻辑：

```java
import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.project.Project;
import org.jacoco.agent.rt.RT;
import org.jacoco.core.tools.ExecFileLoader;
import org.jacoco.core.tools.IAgent;
import org.jacoco.core.tools.InstrumentTask;
import org.jacoco.report.IReportVisitor;
import org.jacoco.report.MultiReportVisitor;
import org.jacoco.report.html.HTMLFormatter;
import org.jacoco.report.xml.XMLFormatter;
import org.jacoco.report.csv.CSVFormatter;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class RunJacocoCoverageAction extends AnAction {
    @Override
    public void actionPerformed(AnActionEvent event) {
        Project project = event.getProject();

        // 1. 配置 JaCoCo Agent
        String sessionId = "your-session-id";
        RT.getAgent().setSessionId(sessionId);

        // 2. 运行测试代码
        // 在这里运行你的测试代码，确保代码中已经加载了 JaCoCo Agent

        // 3. 生成覆盖率报告
        try {
            // 创建报告文件和目录
            String reportDirectory = "path/to/report/directory";
            new File(reportDirectory).mkdirs();
            String reportFile = reportDirectory + File.separator + "coverage.exec";

            // 保存执行数据
            IAgent agent = RT.getAgent();
            byte[] executionData = agent.getExecutionData(false);
            ExecFileLoader loader = new ExecFileLoader();
            loader.load(agent.getExecutionData(false));

            // 生成不同格式的报告
            List<IReportVisitor> visitors = new ArrayList<>();
            visitors.add(createHtmlReportVisitor(reportDirectory));
            visitors.add(createXmlReportVisitor(reportDirectory));
            visitors.add(createCsvReportVisitor(reportDirectory));

            // 合并报告
            MultiReportVisitor multiReportVisitor = new MultiReportVisitor(visitors);

            // 生成报告
            multiReportVisitor.visitInfo(loader.getSessionInfoStore().getInfos(), loader.getExecutionDataStore().getContents());

            // 输出报告
            multiReportVisitor.visitEnd();

            // 输出执行数据到文件
            loader.save(new File(reportFile), false);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // 创建 HTML 格式的报告访问器
    private IReportVisitor createHtmlReportVisitor(String reportDirectory) throws IOException {
        HTMLFormatter formatter = new HTMLFormatter();
        formatter.setOutputDirectory(new File(reportDirectory));
        return formatter.createVisitor();
    }

    // 创建 XML 格式的报告访问器
    private IReportVisitor createXmlReportVisitor(String reportDirectory) throws IOException {
        XMLFormatter formatter = new XMLFormatter();
        formatter.setOutputDirectory(new File(reportDirectory));
        return formatter.createVisitor();
    }

    // 创建 CSV 格式的报告访问器
    private IReportVisitor createCsvReportVisitor(String reportDirectory) throws IOException {
        CSVFormatter formatter = new CSVFormatter();
        formatter.setOutputDirectory(new File(reportDirectory));
        return formatter.createVisitor();
    }
}
```

在这个示例中，`actionPerformed` 方法执行以下操作：

1. 配置 JaCoCo Agent，并设置会话ID。

2. 运行测试代码，确保测试代码中已经加载了 JaCoCo Agent。你需要根据你的测试框架和项目结构来运行相应的测试代码。

3. 生成覆盖率报告。首先，创建报告的目录，并准备一个报告文件。然后，通过 JaCoCo Agent 获取执行数据，并使用 `ExecFileLoader` 加载执行数据。接下来，创建报告访问器（这里示例中创建了 HTML、XML 和 CSV 格式的访问器），并将访问器添加到多报告访问器中。最后，访问报告信息并保存报告文件，同时保存执行数据到文件。

请确保你根据你的项目配置和需求，适当修改示例代码中的路径、文件名和格式化选项。

当你运行插件中的 "Run Jacoco Coverage" 操作时，它将执行测试代码，并在指定的报告目录下生成相应的覆盖率报告文件（HTML、XML 和 CSV 格式）。你可以打开生成的报告文件，查看详细的代码覆盖率信息。

请注意，这只是一个示例，你可以根据自己的需求进行修改和扩展。在实际开发中，你可能需要处理更多的测试框架和覆盖率报告选项。

同时，确保了解 JaCoCo 的用法和 API，以便更好地集成到你的插件中。

# 运行测试代码这个步骤可以自动化吗？

运行测试代码可以通过插件来实现自动化。

你可以在插件中编写逻辑，使用 IntelliJ IDEA 提供的功能来执行项目的测试代码。

以下是一个示例，演示如何在插件中自动运行测试代码：

```java
import com.intellij.execution.ExecutionManager;
import com.intellij.execution.RunManager;
import com.intellij.execution.RunnerAndConfigurationSettings;
import com.intellij.execution.executors.DefaultRunExecutor;
import com.intellij.execution.impl.ExecutionManagerImpl;
import com.intellij.execution.junit.JUnitConfiguration;
import com.intellij.execution.junit.JUnitConfigurationType;
import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.project.Project;

public class RunJacocoCoverageAction extends AnAction {
    @Override
    public void actionPerformed(AnActionEvent event) {
        Project project = event.getProject();

        // 创建 JUnitConfiguration
        JUnitConfigurationType configurationType = JUnitConfigurationType.getInstance();
        RunnerAndConfigurationSettings configurationSettings = RunManager.getInstance(project).createRunConfiguration("JacocoCoverage", configurationType.getConfigurationFactories()[0]);

        // 配置 JUnitConfiguration
        JUnitConfiguration configuration = (JUnitConfiguration) configurationSettings.getConfiguration();
        configuration.setPackage("com.example.tests"); // 设置要运行的测试包
        configuration.setVMParameters("-javaagent:path/to/jacocoagent.jar=destfile=path/to/coverage.exec"); // 设置 JaCoCo 的 VM 参数

        // 使用 DefaultRunExecutor 运行测试
        ExecutionManager executionManager = ExecutionManager.getInstance(project);
        ExecutionManagerImpl executionManagerImpl = (ExecutionManagerImpl) executionManager;
        executionManagerImpl.restartRunProfile(configurationSettings, DefaultRunExecutor.getRunExecutorInstance());
    }
}
```

在这个示例中，我们创建了一个 `JUnitConfiguration` 对象，并对其进行配置。你可以设置要运行的测试包、测试类、测试方法等。然后，我们使用 `DefaultRunExecutor` 来执行测试代码。

需要注意的是，上述示例中的代码是一个简化的版本，用于说明概念。在实际的插件开发中，你可能需要更多的逻辑和配置选项，以适应不同的项目结构和测试框架。

通过编写适当的插件代码，你可以实现自动化运行测试代码的功能，并与 JaCoCo 集成以生成覆盖率报告。

# 参考资料


* any list
{:toc}