$(document).ready(function () {
    Base.initContentHeight();
    Base.initTOC();
    $("UML, uml").sequenceDiagram({theme: "hand"});
    Base.musicPlay();
    Base.scrollTop();
    $("table").addClass("table").addClass("table-bordered")
    .addClass("table-hover").addClass("table-striped");
    Base.sh();
    Base.initNo();
    Base.scrollSpy();

    Base.initTravelMap();

    Base.handlePre();
    
    Base.historyoftoday();
});
var Base = new Base();
function Base() {
    /**
     * 那年今日
     */
    this.historyoftoday = function(){
        var historyoftoday = $("#historyoftoday");
        var date = new Date();
        // 为了实际需要，获取明天的
        date.setDate(date.getDate()+1);
		var nowMonth = date.getMonth() + 1;
		var nowDay = date.getDate();

		var url = "https://raw.githubusercontent.com/gitbook-echo/history-of-today/master/md/"+nowMonth+"/"+nowDay+".md";
		historyoftoday.attr("href", url);
    };
    
    /**
     * 对于代码块进行处理
     * 1. 有时候博客中的代码太长印象阅读体验。
     * 2. 想法是设置最小高度。如果当代码块的高度超过100px则进行折叠。
     * 3. 对于折叠的处理？怎么处理更加美观方便？
     */
    this.handlePre = function () {

        var rougeList = $("div.highlighter-rouge");

        // var languageType = "language-";  //语言类型
        var $highlighterHeader = $("<div class='highlighter-header' style='background: #f7f7f9;'>" +
            "<span class='language-type text-muted' title='代码类型'>&nbsp;&nbsp;[txt]</span>" +
            "<span class='code-fold pull-right' style='cursor:pointer;padding-right: 8px;' title='代码折叠'><i class='fa fa-fw fa-minus-square-o'></i></span>" +
            "<span class='code-linenum pull-right' style='cursor:pointer;padding-right: 8px;' title='代码行号'><i class='fa fa-fw fa-sort-numeric-asc'></i></span>" +
            "<span class='code-copy pull-right' style='cursor:pointer;padding-right: 8px;' title='代码复制'><i class='fa fa-fw fa-copy'></i></span>" +
            "</div>");

        rougeList.prepend($highlighterHeader);


        //1. handle languageType
        $("div.highlighter-header>.language-type").each(function (i, e) {
            var $e = $(e);

            var $highlighterRouge = $e.parent('.highlighter-header').parent('.highlighter-rouge');  //最外层结点。

            // console.log($highlighterRouge.hasClass("highlighter-rouge"));
            var classAttr = $highlighterRouge.attr("class");   //language-xml highlighter-rouge

            var languagePrefix = "language-";
            var index = classAttr.indexOf(languagePrefix);
            if(index > -1) {
                var languageType = classAttr.substring(index, classAttr.length).split(" ")[0];
                var language = languageType.substring(languagePrefix.length, languageType.length);
                // console.log(language);

                $e.html("&nbsp;&nbsp;["+language+"]");
            }

        });

        //2.copy code
        $("div.highlighter-header>.code-copy").each(function (i, e) {
            var $e = $(e);

            var $code = $e.parent('.highlighter-header').next('.highlight').find("code");  //最外层结点。
            var text = $code.text();

            $e.on('click', function () {
                var result = new Copy().CopyToClipboard(text);
                if(result) {
                    // alert("复制成功！");
                    $e.addClass("text-success");
                } else {
                    $e.addClass("text-danger");
                }
            });

        });


        //3. toggle show code
        $("div.highlighter-header>.code-fold").each(function (i, e) {
            var $e = $(e);

            var $code = $e.parent('.highlighter-header').next('.highlight');  //最外层结点。
            $e.on('click', function () {
                $code.toggleClass("hide");
            });
        });


        //4. add linenums
        $('pre.highlight code').each(function (i, e) {
            var code = $(e);
            var array = code.html().split("\n");
            var lineObj = $("<div class='line-warp hide'></div>");
            var string = '';
            for(var no=1;no<array.length;no++){
                if(string.length>0)string = string + '<br>';
                string = string + no;
            }
            lineObj.html(string);
            code.before(lineObj);
        });

        //4.1 linenum handle
        $("div.highlighter-header>.code-linenum").each(function (i, e) {
            var $e = $(e);
            var $line = $e.parent('.highlighter-header').next('.highlight').find(".line-warp");  //最外层结点。
            $e.on('click', function () {
                $line.toggleClass("hide");
                $line.parent(".highlight").toggleClass("padding-left");
            });
        });

    };

    /**
     * 初始化旅游地图
     */
    this.initTravelMap = function () {
        // 基于准备好的dom，初始化echarts实例
        var dom = document.getElementById('travel-chinese-map');
        if(!!dom) {
            var myChart = echarts.init(dom);

            option = {
                tooltip : {
                    trigger: 'item',
                    formatter: '{b}'
                },
                series : [
                    {
                        name: '中国',
                        type: 'map',
                        mapType: 'china',
                        selectedMode : 'multiple',
                        itemStyle:{
                            normal:{label:{show:true}},
                            emphasis:{label:{show:true}}
                        },
                        data:[
                            {name:'上海',selected:true},
                            {name:'江苏',selected:true},
                            {name:'江西',selected:true},
                            {name:'安徽',selected:true},
                            {name:'辽宁',selected:true},
                            {name:'四川',selected:true}
                        ]
                    }
                ]
            };
            myChart.setOption(option);
        }

    };
    
    /**
     * 滚动监听
     */
    this.scrollSpy = function()
    {
        var header = $("h1, h2, h3, h4, h5, h6");   //标题
        header.scrollSpy();

        var firstNav = $("#markdown-toc a").first();    //导航栏第一个
        firstNav.addClass("active");    //初始默认为第一个高亮

        header.on('scrollSpy:enter', function() {
            $("#markdown-toc a").removeClass("active");
            var id = $(this).attr("id");
            var activeToc = $("#markdown-toc a[href='#"+id+"']");
            activeToc.addClass("active");

            var activeTocParent = activeToc.parent("li").parent("ul");
            if(!activeTocParent.attr("id")) {
                $("ul#markdown-toc ul").removeClass("active");

                activeTocParent.addClass("active");
            } else {
                $("ul#markdown-toc ul").removeClass("active");
            }

            //滚动到页面的最上方 或者是存在其他没有ID的header信息
            //1.由此可见对于HEADER的定义应该更加具有区分性。
            if(!id)
            {
                firstNav.addClass("active");
            }
        });

        header.on('scrollSpy:exit', function() {
        });
    };

    /**
     * 初始化编号标签。
     */
    this.initNo = function () {
       $("NO, no").addClass("label").addClass("label-info");
    };
    
    /**
     * 初始化语法高亮
     */
    this.sh = function () {
        var DEFAULT_STYLE = {
            "java": "brush: java;",
            "bash": "brush: bash;",
            "shell": "brush: shell;",
            "c": "brush: c;",
            "C": "brush: c;",
            "c++": "brush: cpp;",
            "C++": "brush: cpp;",
            "js": "brush: js;",
            "javascript": "brush: js;",
            "css": "brush: css;",
            "xml": "brush: xml;",
            "html": "brush: html;",
            "sql": "brush: sql;",
            "php": "brush: php;",
            "py": "brush: python;",
            "python": "brush: python;",
            "ruby": "brush: ruby;"
        };
        SyntaxHighlighter.config.bloggerMode = true;
        SyntaxHighlighter.config.tagName = "sh";
        SyntaxHighlighter.defaults["collapse"] = true;
        SyntaxHighlighter.defaults["title"] = "[default]";
        var $codes = $("sh");
        $codes.each(function (i, e) {
            var $e = $(e);
            var className = $e.attr("class") || "default";
            SyntaxHighlighter.defaults["title"] = "[" + className + "]";
            var styleClass = DEFAULT_STYLE[className];
            if (!!styleClass) {
                $e.addClass(styleClass)
            } else {
                $e.addClass("brush: xml;")
            }
            SyntaxHighlighter.defaults["collapse"] = true;
            SyntaxHighlighter.highlight($e)
        })
    };
    this.scrollTop = function () {
        var scrollTimeout;
        $(window).scroll(function () {
            clearTimeout(scrollTimeout);
            if ($(window).scrollTop() > 400) {
                scrollTimeout = setTimeout(function () {
                    $("#scroll-top:hidden").fadeIn()
                }, 100)
            } else {
                scrollTimeout = setTimeout(function () {
                    $("#scroll-top:visible").fadeOut()
                }, 100)
            }
        })
    };
    this.musicPlay = function () {
        $("#bg-music-btn").on("click", function () {
            var icon = $(this).find("i");
            var audio = document.getElementById("bg-music");
            if (icon.hasClass("fa-music")) {
                icon.removeClass("fa-music").addClass("fa-volume-up");
                audio.play()
            } else {
                if (icon.hasClass("fa-volume-up")) {
                    icon.removeClass("fa-volume-up").addClass("fa-music");
                    audio.pause()
                }
            }
        })
    };
    this.initContentHeight = function () {
        var content = $(".page-content");
        var headHeight = $(".site-header").height();
        var wh = Util.windowHeight();
        content.css("min-height", wh - headHeight)
    };
    this.initTOC = function () {
        var CLASS = {left: "fa-angle-double-left", right: "fa-angle-double-right"};
        var toc = $("#markdown-toc");
        var lastLi = toc.children("li:last");
        var iconHTML = '<i class="fa fa-fw fa-lg"></i>';
        var $icon = $(iconHTML);
        $icon.addClass(CLASS.left).addClass("text-muted").addClass("pull-right");
        lastLi.after($icon);

        //开始隐藏文章导航
        var icon = $("#markdown-toc .fa");
        // if (icon.hasClass(CLASS.left)) {
        //     toc.children("li").hide();
        //     icon.removeClass(CLASS.left).addClass(CLASS.right)
        // }

        //文章导航点击事件
        icon.on("click", function () {
            // var icon = $(this);
            if (icon.hasClass(CLASS.left)) {
                toc.children("li").hide();
                icon.removeClass(CLASS.left).addClass(CLASS.right)
            } else {
                toc.children("li").show();
                icon.removeClass(CLASS.right).addClass(CLASS.left)
            }
        })

    }
};