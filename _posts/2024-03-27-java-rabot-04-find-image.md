---
layout: post
title: java 键盘鼠标操作-04-findImage 寻找图片
date: 2024-03-27 21:01:55 +0800
categories: [Java]
tags: [java, robot, sh]
published: false
---

# 需求

寻找图。



# chat

## Q:java 如何实现在当前指定范围的屏幕中，找到最接近的图的位置？

 在Java中实现在当前指定范围的屏幕中找到最接近的图的位置，可以通过以下步骤来完成：

1. **屏幕截图**：首先，需要获取指定屏幕范围的截图。这可以通过创建一个`Robot`对象并使用`createScreenCapture`方法来实现。

   ```java
   import java.awt.Robot;
   import java.awt.Toolkit;
   import java.awt.image.BufferedImage;
   import java.io.File;
   import javax.imageio.ImageIO;

   public BufferedImage captureScreen(int x, int y, int width, int height) throws AWTException {
       Robot robot = new Robot();
       Rectangle screenRect = new Rectangle(x, y, width, height);
       BufferedImage screenImg = robot.createScreenCapture(screenRect);
       return screenImg;
   }
   ```

2. **目标图片加载**：加载你想要在屏幕截图中查找的目标图片。

   ```java
   BufferedImage searchImg = ImageIO.read(new File("path_to_your_search_image.png"));
   ```

3. **图片搜索算法**：实现一个图片搜索算法，该算法会在屏幕截图中遍历每一个可能的位置，并与目标图片进行比较。这通常通过比较两张图片对应像素点的RGB值来完成。

   ```java
   public static List<Point> findImages(BufferedImage screen, BufferedImage searchImg) {
       List<Point> points = new ArrayList<>();
       int screenWidth = screen.getWidth();
       int screenHeight = screen.getHeight();
       int searchWidth = searchImg.getWidth();
       int searchHeight = searchImg.getHeight();

       for (int y = 0; y <= (screenHeight - searchHeight); y++) {
           for (int x = 0; x <= (screenWidth - searchWidth); x++) {
               if (isMatch(screen, searchImg, x, y)) {
                   points.add(new Point(x, y));
               }
           }
       }
       return points;
   }

   private static boolean isMatch(BufferedImage screen, BufferedImage searchImg, int x, int y) {
       for (int i = 0; i < searchHeight; i++) {
           for (int j = 0; j < searchWidth; j++) {
               if (screen.getRGB(x + j, y + i) != searchImg.getRGB(j, i)) {
                   return false;
               }
           }
       }
       return true;
   }
   ```

4. **坐标输出**：最后，输出找到的目标图片在屏幕截图中的位置坐标。

   ```java
   for (Point point : points) {
       System.out.println("找到图片的位置: (" + point.x + ", " + point.y + ")");
   }
   ```

这个基本的算法会逐像素比较屏幕截图和目标图片，这是一个非常精确的搜索方法。但请注意，这种方法可能会很慢，特别是当屏幕截图很大或目标图片很大时。为了提高效率，可以考虑使用更高级的图像处理库，如OpenCV，或者使用一些优化的搜索算法，比如模板匹配等。

此外，还可以考虑使用一些现成的Java库，如`ImageCognitionUtil`等，这些库可能已经实现了一些优化的搜索算法，可以简化开发过程。

请注意，上述代码只是一个简单的示例，实际应用中可能需要根据具体情况进行调整和优化。

## Q: 给出 opencv 的 maven 依赖，和对应的例子

要在Java项目中使用OpenCV，您需要在项目的`pom.xml`文件中添加OpenCV的Maven依赖。以下是添加依赖的步骤以及一个简单的例子。

### Maven依赖

首先，确保您的`pom.xml`文件中已经添加了OpenCV的Maven仓库。然后，添加所需的OpenCV依赖。以下是添加OpenCV核心模块的示例：

```xml
<dependencies>
    <!-- OpenCV dependency -->
    <dependency>
        <groupId>org.opencv</groupId>
        <artifactId>opencv</artifactId>
        <version>4.6.0</version> <!-- 使用最新版本 -->
    </dependency>
</dependencies>

<repositories>
    <repository>
        <id>opencv</id>
        <url>https://mvn.bintray.com/opencv/</url>
    </repository>
</repositories>
```



### 例子

在OpenCV中，模糊找图通常指的是在一幅较大的图像中寻找与给定图像相似的区域，但允许一定程度的差异。

这种操作可以通过多种方法实现，包括模板匹配、特征匹配等。

下面是一个使用OpenCV进行模糊找图的示例，采用模板匹配方法：

```java
import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;

public class OpenCVBlurredTemplateMatching {
    public static void main(String[] args) {
        // 加载源图像和模板图像
        Mat source = Imgcodecs.imread("path_to_source_image.jpg"); // 替换为源图像路径
        Mat template = Imgcodecs.imread("path_to_template_image.jpg"); // 替换为模板图像路径

        // 转换为灰度图像
        Mat sourceGray = new Mat();
        Mat templateGray = new Mat();
        Imgproc.cvtColor(source, sourceGray, Imgproc.COLOR_BGR2GRAY);
        Imgproc.cvtColor(template, templateGray, Imgproc.COLOR_BGR2GRAY);

        // 初始化结果矩阵，大小与源图像相同
        Mat result = new Mat();
        Core.matchingTemplate(sourceGray, templateGray, result);

        // 找到匹配区域的最大值和位置
        Core.MinMaxLocResult mmr = Core.minMaxLoc(result);
        MatOfPoint matches = new MatOfPoint();
        matches.fromList(mmr.maxLoc);

        // 绘制矩形框，标记匹配区域
        Imgproc.rectangle(source, mmr.maxLoc, new Point(mmr.maxLoc.x + template.cols(), mmr.maxLoc.y + template.rows()), new Scalar(0, 255, 0), 2);

        // 显示结果
        Imgcodecs.imwrite("matched_image.jpg", source);
        System.out.println("模糊找图完成");
    }
}
```

在这个例子中，我们首先加载源图像和模板图像，并将它们转换为灰度图像。

然后，我们使用`Core.matchingTemplate`函数进行模板匹配。

这个函数在源图像中滑动模板图像，并在每个位置计算模板图像与源图像的相似度。匹配结果存储在`result`矩阵中。

使用`Core.minMaxLoc`函数找到`result`矩阵中的最大值位置，这表示最匹配的区域。

然后，我们使用`Imgproc.rectangle`在源图像上绘制一个矩形框来标记找到的匹配区域。

最后，我们将标记了匹配区域的源图像保存到文件中。

请注意，为了使代码正常工作，您需要将`"path_to_source_image.jpg"`和`"path_to_template_image.jpg"`替换为您实际的图像文件路径。此外，确保您的开发环境已经配置了OpenCV的Java库。

## opencv 免安装

根据您提供的链接中的信息，如果您想在Java项目中使用OpenCV而不进行完整的安装，可以通过以下步骤直接提取并导入OpenCV的本地jar包：

1. **提取OpenCV的Java jar包和dll文件**：
   从OpenCV官方安装包中提取Java相关的jar文件和dll文件。
   
   例如，`opencv-454.jar`和`opencv-454.dll`。

https://github.com/opencv/opencv/releases

C:\Users\dh\Downloads\

2. **在项目中创建lib文件夹**：
   在您的Spring项目中的`resources`目录下创建一个名为`lib`的文件夹，并将提取的jar文件和dll文件复制到这个文件夹中。

3. **在Maven中添加依赖**：
   在项目的`pom.xml`文件中添加一个依赖来导入jar包。使用`<systemPath>`来指向jar文件在项目中的位置。例如：

   ```xml
   <dependency>
       <groupId>org</groupId>
       <artifactId>opencv-454</artifactId>
       <version>4.5.4</version>
       <scope>system</scope>
       <systemPath>${project.basedir}/src/main/resources/lib/opencv-454.jar</systemPath>
   </dependency>
   ```

   请注意，您需要将`<version>`标签中的版本号替换为您使用的OpenCV版本，同时确保`<systemPath>`指向正确的文件路径。

4. **加载动态链接库**：
   在正式使用OpenCV之前，您需要在代码中加载dll库。可以通过添加一个静态代码块或一个工具方法来实现，例如：

   ```java
   public class OpenCVUtils {
       static {
           // 解决awt报错问题
           System.setProperty("java.awt.headless", "false");
           // 加载动态库
           URL url = ClassLoader.getSystemResource("lib/opencv_java454.dll");
           System.load(url.getPath());
       }
   }
   ```

   确保将`lib/opencv_java454.dll`替换为实际的dll文件路径。

通过这种方式，您可以将OpenCV作为依赖项直接导入到Java项目中，而无需在系统级别安装OpenCV。

这种方法适用于不想或不能在全局环境中安装OpenCV库的开发者。

不过，请注意，这种方法可能需要根据您的具体环境和需求进行调整。


# 参考资料

https://imagej.net/develop/native-libraries

http://java.sun.com/docs/books/jni/html/jniTOC.html

* any list
{:toc}
