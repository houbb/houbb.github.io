---
layout: post
title: web-01-RESTful Representational State Transfer
date:  2016-7-13 17:50:44 +0800
categories: [WEB]
tags: [RESTful, web]
published: true
---

# RESTful

> [RESTful](http://www.ruanyifeng.com/blog/2011/09/restful)

> [RESTful_api](http://www.ruanyifeng.com/blog/2014/05/restful_api.html)

它结构清晰、符合标准、易于理解、扩展方便。

## Name

Fielding将他对互联网软件的架构原则，定名为REST，即**Representational State Transfer**的缩写。我对这个词组的翻译是"表现层状态转化"。

- 资源（Resources）

> 所谓"资源"，就是网络上的一个实体，或者说是网络上的一个具体信息。

它可以是一段文本、一张图片、一首歌曲、一种服务，总之就是一个具体的实在。你可以用一个**URI（统一资源定位符）**指向它，每种资源对应一个特定的URI。
要获取这个资源，访问它的URI就可以，因此URI就成了每一个资源的地址或独一无二的识别符。

- 表现层（Representation）

> 我们把"资源"具体呈现出来的形式，叫做它的"表现层"（Representation）。

比如，文本可以用txt格式表现，也可以用HTML格式、XML格式、JSON格式表现，甚至可以采用二进制格式；图片可以用JPG格式表现，也可以用PNG格式表现。

URI只代表资源的实体，不代表它的形式。

严格地说，有些网址最后的".html"后缀名是不必要的，因为这个后缀名表示格式，属于"表现层"范畴，而URI应该**只代表"资源"的位置**。
它的具体表现形式，应该在HTTP请求的头信息中用*Accept*和*Content-Type*字段指定，这两个字段才是对"表现层"的描述。

- 状态转化（State Transfer）

互联网通信协议HTTP协议，是一个无状态协议。这意味着，所有的状态都保存在服务器端。
因此，如果客户端想要操作服务器，必须通过某种手段，让服务器端发生"状态转化"（State Transfer）。而这种转化是建立在表现层之上的，所以就是"表现层状态转化"。

具体来说，就是HTTP协议里面，四个表示操作方式的动词：```GET、POST、PUT、DELETE```。
它们分别对应四种基本操作：GET用来获取资源，POST用来新建资源（也可以用于更新资源），PUT用来更新资源，DELETE用来删除资源。

## Sum Up

1. 每一个URI代表一种资源；
2. 客户端和服务器之间，传递这种资源的某种表现层；
3. 客户端通过四个HTTP动词，对服务器端资源进行操作，实现"表现层状态转化"。

## Trips

- 最常见的一种设计错误，就是URI包含动词

因为"资源"表示一种实体，所以应该是名词，URI不应该有动词，动词应该放在HTTP协议中。

- 另一个设计误区，就是在URI中加入版本号 

因为不同的版本，可以理解成同一种资源的不同表现形式，所以应该采用同一个URI。
版本号可以在HTTP请求头信息的Accept字段中进行区分（参见[Versioning REST Services](http://www.informit.com/articles/article.aspx?p=1566460)）：


# chat

## 详细介绍一下 RestFul

RESTful（Representational State Transfer）是一种用于设计网络应用程序的架构风格，通常用于构建基于Web的服务。

它是一种轻量级的、灵活的方式，使得不同系统之间的通信变得简单、可伸缩、可维护。

以下是RESTful的一些关键特点和概念：

1. **资源（Resources）：** 在RESTful架构中，所有的数据或服务都被视为资源。资源可以是任何可命名的实体，比如用户、产品、订单等。每个资源都有一个唯一的标识符，称为URI（Uniform Resource Identifier）。

2. **表现层（Representation）：** 资源的状态以及与资源相关的操作都通过表现层来表示。常见的表现层包括JSON、XML等。客户端可以通过资源的表现层来获取和操作资源的状态。

3. **状态转移（State Transfer）：** RESTful架构通过定义一组有限的操作，客户端和服务器之间的交互是无状态的。每个请求从客户端包含足够的信息，以便服务器理解并完成请求。服务器通过响应返回足够的信息，以便客户端理解响应。

4. **HTTP方法（HTTP Methods）：** RESTful架构通常使用标准的HTTP方法来定义对资源的操作。常见的HTTP方法包括GET（获取资源）、POST（创建资源）、PUT（更新资源）、DELETE（删除资源）等。

5. **状态码（Status Codes）：** HTTP状态码用于表示请求的结果，RESTful架构中使用标准的HTTP状态码来指示请求的成功、失败或其他状态。例如，200表示成功，404表示资源未找到，500表示服务器内部错误等。

6. **无状态（Stateless）：** RESTful架构是无状态的，意味着每个请求都包含足够的信息，服务器不需要存储任何关于客户端的信息。这使得系统更容易扩展和维护。

7. **URI设计（URI Design）：** URI是资源的唯一标识符，因此在设计RESTful API时，良好的URI设计是重要的。URI应该简洁、直观，并且能够清晰地表达资源的层次结构和关系。

8. **Hypermedia作为引擎（HATEOAS）：** 这是RESTful的一项可选原则，它建议在资源的表现层中包含可用操作的链接，以便客户端可以通过这些链接导航和发现资源的相关操作。

总体而言，RESTful是一种设计网络服务的理念，通过使用HTTP协议和URI标识资源，以及定义标准的操作方法，实现了系统之间的松耦合和简化了通信的过程。

RESTful API广泛用于构建Web服务、移动应用程序和分布式系统。

## 为什么需要 RESTful？和普通的设计有什么优势

RESTful的设计风格相对于一些传统的Web服务设计方式（如SOAP协议）有一些优势，这些优势包括：

1. **简单性和轻量级：** RESTful架构相对简单，使用HTTP协议作为通信协议，并且通常采用轻量级的数据交换格式（如JSON），使得整体设计更加简单和易于理解。

2. **可扩展性：** RESTful架构支持简单的、逐步增加的扩展。由于其基于HTTP和URI的设计，可以通过添加新资源或操作来扩展API，而不会影响现有功能。

3. **松耦合：** RESTful架构的设计目标之一是实现系统之间的松耦合。客户端和服务器之间的通信是通过资源的表现层进行的，因此客户端不需要了解服务器上资源的内部结构，只需理解资源的表现形式。

4. **跨语言和跨平台：** 由于RESTful API使用标准的HTTP协议和常见的数据格式，因此它们易于实现，并且可以在不同的编程语言和操作系统之间轻松交互。

5. **缓存支持：** RESTful API天生支持HTTP的缓存机制，通过使用合适的HTTP头信息，可以有效地利用缓存来提高性能。

6. **可读性：** RESTful的URI设计通常是直观和可读的，资源的层次结构和关系通过URI清晰地表示出来，使API更易于理解和使用。

7. **自描述性（Self-Descriptive）：** RESTful架构本身具有自描述性，资源的表现形式包含了与资源相关的操作，客户端可以通过这些表现形式自行发现和理解可用的操作。

8. **适用于Web：** RESTful API天然适应Web的工作方式，因为它基于HTTP协议，这是Web通信的基础。

总体而言，RESTful的优势在于它的简单性、可扩展性、松耦合性以及适应性，这使得它成为构建现代分布式系统和提供Web服务的一种理想选择。

在开发和维护过程中，RESTful API通常更容易被理解和使用，也更符合当今互联网应用程序的需求。

## 听起来还是有些抽象，给一下具体的例子


当我们讨论RESTful时，最好通过一个具体的例子来说明。让我们考虑一个简单的博客系统，其中包含文章（文章资源）和评论（评论资源）。我们将使用常见的HTTP方法来表示操作。

1. **获取文章列表：**
   - HTTP方法：GET
   - URI：`/articles`
   - 描述：客户端发送GET请求到`/articles`，服务器返回包含所有文章的列表。

2. **获取特定文章详情：**
   - HTTP方法：GET
   - URI：`/articles/{article_id}`
   - 描述：客户端发送GET请求到`/articles/123`，服务器返回ID为123的文章的详细信息。

3. **创建新文章：**
   - HTTP方法：POST
   - URI：`/articles`
   - 描述：客户端发送POST请求到`/articles`，请求体中包含新文章的信息，服务器创建新文章并返回创建成功的状态。

4. **更新文章：**
   - HTTP方法：PUT
   - URI：`/articles/{article_id}`
   - 描述：客户端发送PUT请求到`/articles/123`，请求体中包含更新后的文章信息，服务器更新ID为123的文章。

5. **删除文章：**
   - HTTP方法：DELETE
   - URI：`/articles/{article_id}`
   - 描述：客户端发送DELETE请求到`/articles/123`，服务器删除ID为123的文章。

6. **获取文章的评论列表：**
   - HTTP方法：GET
   - URI：`/articles/{article_id}/comments`
   - 描述：客户端发送GET请求到`/articles/123/comments`，服务器返回ID为123的文章的评论列表。

7. **创建新评论：**
   - HTTP方法：POST
   - URI：`/articles/{article_id}/comments`
   - 描述：客户端发送POST请求到`/articles/123/comments`，请求体中包含新评论的信息，服务器创建新评论并返回创建成功的状态。

这是一个简化的例子，演示了如何使用RESTful风格设计博客系统的API。关键点包括使用HTTP方法表示操作、使用URI表示资源，以及通过HTTP状态码和资源的表现形式来进行通信。在实际的RESTful API设计中，还可以使用其他RESTful原则，如HATEOAS（Hypermedia As The Engine Of Application State）等。

* any list
{:toc}
