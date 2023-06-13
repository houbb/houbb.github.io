---
layout: post
title:  Idea Plugin Dev-09-01-Documents
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# Documents

文档是可编辑的 Unicode 字符序列，通常对应于虚拟文件的文本内容。

文档中的换行符总是规范化为 `\n`。 

IntelliJ 平台在透明地加载和保存文档时处理编码和换行符转换。

# 1. 详细介绍一下 idea 插件 Documents

在 IntelliJ IDEA 插件开发中，Documents 是一个重要的概念，用于表示编辑器中的文档或文本内容。它提供了对文本内容的访问、修改和操作的方法。

Documents 是由 Document 接口表示的，它是一个不可变的文本内容容器。通过 Document，插件可以获取文本的内容、长度、行数以及对文本内容进行搜索、替换等操作。

以下是 Document 接口的一些常用方法：

- `getCharsSequence()`：获取文档的字符序列，可以用于读取文本内容。
- `getText()`：获取文档的文本内容。
- `getLineCount()`：获取文档的行数。
- `getLineNumber(int offset)`：根据文本偏移量获取所在行的行号。
- `getLineStartOffset(int line)`：获取指定行的起始偏移量。
- `getLineEndOffset(int line)`：获取指定行的结束偏移量。
- `findString(String text, int startOffset, boolean forwardSearch, boolean caseSensitive)`：在文档中查找指定的字符串。
- `replaceString(int startOffset, int endOffset, String newText)`：替换文档中指定范围的文本。
- `insertString(int offset, String text)`：在文档中指定位置插入文本。
- `deleteString(int startOffset, int endOffset)`：从文档中删除指定范围的文本。

Documents 还支持事件监听，可以监听文档内容的变化，例如文本被修改、插入或删除等事件。

通过监听这些事件，插件可以根据文档的变化来执行相应的操作，例如自动补全、语法检查等。

在插件开发中，Documents 通常与编辑器组件（Editor）一起使用。通过获取编辑器的文档对象，插件可以访问和操作编辑器中的文本内容。

可以通过 Editor 接口的 `getDocument()` 方法来获取文档对象。

总结来说，Documents 是 IntelliJ IDEA 插件开发中的一个重要概念，用于表示编辑器中的文档或文本内容。

通过使用 Document 接口提供的方法，插件可以访问、修改和操作文档中的文本内容。通过监听文档事件，插件可以响应文档的变化并执行相应的操作。 

Documents 通常与编辑器组件一起使用，插件可以通过编辑器获取文档对象，从而操作编辑器中的文本内容。

# 2. 给出一个 Document 的入门使用例子

当你使用 IntelliJ IDEA 插件开发时，你可以通过以下示例了解如何使用 Document 接口：

```java
import com.intellij.openapi.editor.Document;
import com.intellij.openapi.editor.Editor;
import com.intellij.openapi.editor.EditorFactory;
import com.intellij.openapi.editor.event.DocumentEvent;
import com.intellij.openapi.editor.event.DocumentListener;

public class DocumentExample {

    public static void main(String[] args) {
        // 创建一个空的 Document
        Document document = EditorFactory.getInstance().createDocument("");

        // 添加文档监听器
        document.addDocumentListener(new DocumentListener() {
            @Override
            public void documentChanged(DocumentEvent event) {
                // 文档内容发生变化时被调用
                System.out.println("Document changed: " + event.getDocument().getText());
            }
        });

        // 插入文本到文档
        document.insertString(0, "Hello, World!");

        // 获取文档内容
        String text = document.getText();
        System.out.println("Document content: " + text);

        // 获取文档行数
        int lineCount = document.getLineCount();
        System.out.println("Line count: " + lineCount);

        // 获取指定行的内容
        int lineNumber = 0;
        if (lineNumber < lineCount) {
            int startOffset = document.getLineStartOffset(lineNumber);
            int endOffset = document.getLineEndOffset(lineNumber);
            String lineText = document.getText(new TextRange(startOffset, endOffset));
            System.out.println("Line " + lineNumber + ": " + lineText);
        }

        // 替换文档中的文本
        document.replaceString(0, 5, "Hi");

        // 删除文档中的文本
        document.deleteString(0, 3);

        // 关闭编辑器和释放资源
        EditorFactory.getInstance().releaseEditor(editor);
    }
}
```

在上面的例子中，我们创建了一个空的 Document 对象，并添加了一个文档监听器。通过监听器，我们可以捕获文档的变化事件并进行相应的处理。

然后，我们插入文本到文档中，并获取文档的内容、行数以及指定行的内容。接下来，我们替换文档中的文本和删除文档中的文本。最后，我们关闭编辑器并释放资源。

通过这个例子，你可以了解如何创建和使用 Document 对象，以及如何对文档进行插入、获取、替换和删除文本等操作。

记得在实际的插件开发中，你需要根据具体的需求和上下文来使用 Document 对象。

# 3. Documents 在使用过程中有哪些技巧和注意点

在使用 `Document` 对象时，以下是一些技巧和注意事项：

1. **使用事件监听器**：通过添加 `DocumentListener` 监听器，可以捕获文档的变化事件。这样你可以在文档内容发生变化时执行相应的操作，例如更新界面、保存数据等。

2. **避免频繁的事件触发**：在事件监听器中执行的操作可能会引起文档的变化，导致另一个事件被触发。为了避免陷入无限循环，可以使用标志或条件语句来控制操作的执行，确保只在需要时执行。

3. **处理大型文档的性能问题**：如果你处理的是大型文档，可能会遇到性能问题。为了提高性能，可以考虑在处理之前对文档进行分片，只处理需要的部分文本。此外，避免在文本变化频繁的地方使用过多的监听器。

4. **注意线程安全性**：`Document` 对象不是线程安全的，因此应该在主线程中访问和修改它。如果需要在其他线程中对文档进行操作，可以使用 `Application.invokeAndWait()` 或 `Application.invokeLater()` 方法将操作包装在主线程中执行。

5. **文档编辑器的生命周期管理**：在插件开发中，通常会创建文档编辑器并使用 `Document` 对象。当你不再需要编辑器时，应该及时释放资源并关闭编辑器，以避免内存泄漏和资源浪费。

6. **使用 `WriteCommandAction` 执行修改操作**：如果你需要在插件中对文档进行修改，最好使用 `WriteCommandAction` 来执行修改操作。这将确保修改操作在撤消栈中被记录，并允许用户撤消和重做操作。

7. **考虑文本编码**：当处理文档时，要注意文本的编码方式。使用正确的编码方式读取和写入文本，以确保正确的文本显示和处理。

总之，使用 `Document` 对象需要细心和谨慎。了解其使用方式、注意事项和最佳实践将有助于你更好地处理和管理文档内容。


# 参考资料

https://plugins.jetbrains.com/docs/intellij/documents.html

* any list
{:toc}