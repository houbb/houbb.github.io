$(document).ready(function () {
    Base.initContentHeight();
    Base.initTOC();
    $("UML, uml").sequenceDiagram({theme: "hand"});
    Base.musicPlay();
    Base.scrollTop();
    $("table").addClass("table").addClass("table-bordered").addClass("table-hover");
    Base.sh();
    Base.highchartsDemo()
    Base.initNo();

    Base.scrollSpy();


    Base.semanticCheckBox();
    Base.initDataTables();

    Base.initTravelMap();
});
var Base = new Base();
function Base() {

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
     * 初始化数据表格
     */
    this.initDataTables = function () {
        $("#datatbles-zero-table").DataTable();
    };

    /**
     * semantic-ui checkbox
     */
    this.semanticCheckBox = function()
    {
        $('.ui.checkbox')
            .checkbox()
        ;

        $('.ui.radio.checkbox')
            .checkbox()
        ;

        $('.selection.dropdown')
            .dropdown()
        ;

        $('select.dropdown')
            .dropdown()
        ;

        $('.message .close')
            .on('click', function() {
                $(this)
                    .closest('.message')
                    .transition('fade')
                ;
            })
        ;
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
    this.highchartsDemo = function () {
        $("#highchart-container").highcharts({
            chart: {type: "bar"},
            title: {text: "我的第一个图表"},
            xAxis: {categories: ["苹果", "香蕉", "橙子"]},
            yAxis: {title: {text: "something"}},
            series: [{name: "小明", data: [1, 0, 4]}, {name: "小红", data: [5, 7, 3]}]
        })
    };
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
        var CLASS = {left: "fa-chevron-circle-left", right: "fa-chevron-circle-right"};
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